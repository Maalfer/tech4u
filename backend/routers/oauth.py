"""
OAuth 2.0 — Google y Microsoft

Seguridad implementada:
  1. CSRF: state firmado con HMAC-SHA256 en cookie httponly.
           Verificación con hmac.compare_digest (tiempo constante).
  2. Google ID token verificado con google.oauth2.id_token.verify_oauth2_token.
     → Firma, audiencia, emisor, expiración.
  3. email_verified requerido.
  4. Rate limiting: 5 req/min por IP en los callbacks.
  5. Logging estructurado por evento: login / link / create / CSRF / error.
  6. No se almacena el access_token de Google.
  7. secure=True automático en producción (HTTPS).
"""
import asyncio
import base64
import hashlib
import hmac
import json
import logging
import os
import random
import secrets
import string
import time
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from database import OAuthAccount, User, get_db
from auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from limiter import limiter

log = logging.getLogger(__name__)
router = APIRouter(prefix="/oauth", tags=["oauth"])

# ── Configuración ─────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
MS_CLIENT_ID         = os.getenv("MICROSOFT_CLIENT_ID", "")
MS_CLIENT_SECRET     = os.getenv("MICROSOFT_CLIENT_SECRET", "")
SECRET_KEY           = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if os.getenv("ENVIRONMENT", "development") == "production":
        raise RuntimeError("🚨 production: SECRET_KEY NO CONFIGURADA en oauth.py. Deteniendo por seguridad.")
    log.error("SECRET_KEY no configurada en oauth.py. El sistema de firma de states fallará.")

FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL          = os.getenv("BACKEND_URL", "http://localhost:8000")
MS_TENANT            = os.getenv("MICROSOFT_TENANT_ID", "common")

# secure=True solo en producción (HTTPS); False en desarrollo local
IS_PROD = FRONTEND_URL.startswith("https")

GOOGLE_REDIRECT = f"{BACKEND_URL}/oauth/google/callback"
MS_REDIRECT     = f"{BACKEND_URL}/oauth/microsoft/callback"

STATE_COOKIE  = "oauth_state"
STATE_MAX_AGE = 600  # 10 minutos


# ══════════════════════════════════════════════════════════════════════════════
# CSRF — state firmado en cookie httponly
# ══════════════════════════════════════════════════════════════════════════════

def _make_state_cookie(raw_state: str) -> str:
    if not SECRET_KEY:
        raise HTTPException(status_code=500, detail="OAuth state signature failed: SECRET_KEY missing")
    payload = base64.urlsafe_b64encode(
        json.dumps({"s": raw_state, "t": int(time.time())}, separators=(",", ":")).encode()
    ).decode().rstrip("=")
    sig = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{sig}"


def _verify_state(cookie_value: str, received_state: str) -> bool:
    """
    1. Verifica firma HMAC (detecta cookies falsificadas)
    2. Verifica expiración (evita replay attacks)
    3. hmac.compare_digest (tiempo constante, evita timing attacks)
    """
    try:
        payload_b64, given_sig = cookie_value.rsplit(".", 1)
        expected_sig = hmac.new(
            SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(expected_sig, given_sig):
            return False
        padded = payload_b64 + "=" * (-len(payload_b64) % 4)
        data = json.loads(base64.urlsafe_b64decode(padded))
        if int(time.time()) - data["t"] > STATE_MAX_AGE:
            return False
        return hmac.compare_digest(str(data["s"]), str(received_state))
    except Exception:
        log.exception("oauth:state error en verificación")
        return False


def _set_state_cookie(response: RedirectResponse, raw_state: str) -> None:
    response.set_cookie(
        STATE_COOKIE,
        _make_state_cookie(raw_state),
        max_age=STATE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=IS_PROD,   # False en dev, True en prod (HTTPS)
        path="/",
    )


def _clear_state_cookie(response: RedirectResponse) -> None:
    response.delete_cookie(STATE_COOKIE, path="/", samesite="lax")


# ══════════════════════════════════════════════════════════════════════════════
# VERIFICACIÓN DE GOOGLE ID TOKEN (librería oficial)
# ══════════════════════════════════════════════════════════════════════════════

def _verify_google_id_token(raw_id_token: str) -> dict:
    """
    verify_oauth2_token verifica internamente:
      ✔ Firma criptográfica con claves públicas de Google
      ✔ Expiración (exp claim)
      ✔ Emisor (iss == accounts.google.com)
      ✔ Audiencia (aud == GOOGLE_CLIENT_ID)
    Lanza ValueError si el token no es válido.
    """
    return google_id_token.verify_oauth2_token(
        raw_id_token,
        google_requests.Request(),
        GOOGLE_CLIENT_ID,
    )


async def _verify_google_id_token_async(raw_id_token: str) -> dict:
    """Wrapper async: ejecuta la verificación síncrona en un thread pool."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _verify_google_id_token, raw_id_token)


# ══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _unique_referral_code(db: Session) -> str:
    while True:
        code = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if not db.query(User).filter_by(referral_code=code).first():
            return code


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "?"


# ══════════════════════════════════════════════════════════════════════════════
# LÓGICA CENTRAL — login, link o crear usuario
# ══════════════════════════════════════════════════════════════════════════════

def _login_or_create_user(
    db: Session,
    provider: str,
    provider_uid: str,
    email: str,
    display_name: str,
) -> RedirectResponse:
    """
    Flujo:
      1. OAuthAccount(provider, provider_uid) existe  → login directo
      2. No existe, pero el email ya está en BD       → vincular cuenta (account linking)
      3. Ni OAuthAccount ni email existen             → crear usuario nuevo

    El email proviene SIEMPRE del id_token verificado o del servidor del proveedor.
    Nunca del frontend. No almacenamos access_token de Google.
    """
    email = email.lower().strip()

    # ── 1. Buscar OAuthAccount existente ──────────────────────────────────────
    oauth_acc = (
        db.query(OAuthAccount)
        .filter_by(provider=provider, provider_user_id=str(provider_uid))
        .first()
    )

    if oauth_acc:
        # Login directo — cuenta ya vinculada
        user = db.query(User).filter_by(id=oauth_acc.user_id).first()
        if not user:
            log.error(
                "oauth:integrity_error provider=%s oauth_account_id=%d "
                "orphan_user_id=%d",
                provider, oauth_acc.id, oauth_acc.user_id,
            )
            return RedirectResponse(f"{FRONTEND_URL}/login?error=account_error")

        log.info(
            "oauth:login_success provider=%s user_id=%d email=%s",
            provider, user.id, email,
        )

    else:
        user = db.query(User).filter_by(email=email).first()

        if user:
            # ── 2. Account linking — email ya existe, vincular proveedor OAuth ─
            log.info(
                "oauth:account_linked provider=%s user_id=%d email=%s",
                provider, user.id, email,
            )
        else:
            # ── 3. Crear usuario nuevo ─────────────────────────────────────────
            nombre   = (display_name or email.split("@")[0])[:100]
            ref_code = _unique_referral_code(db)
            user = User(
                nombre=nombre,
                email=email,
                password_hash="__oauth__",   # inutilizable: bloquea login con contraseña
                role="alumno",
                subscription_type="free",
                xp=0,
                level=1,
                referral_code=ref_code,
            )
            db.add(user)
            db.flush()   # obtener user.id antes del commit
            log.info(
                "oauth:account_created provider=%s user_id=%d email=%s",
                provider, user.id, email,
            )

        # Vincular OAuthAccount al usuario (sin access_token — no es necesario)
        link = OAuthAccount(
            user_id=user.id,
            provider=provider,
            provider_user_id=str(provider_uid),
        )
        db.add(link)
        db.commit()

    # ── Emitir JWT interno ─────────────────────────────────────────────────────
    try:
        # SEC-05: incluir token_version para soportar revocación de sesión
        jwt = create_access_token(data={"sub": str(user.id), "ver": user.token_version or 0})
    except Exception:
        log.exception(
            "oauth:jwt_error provider=%s user_id=%d", provider, user.id
        )
        return RedirectResponse(f"{FRONTEND_URL}/login?error=token_failed")

    # Redirigir al frontend — el token viaja en httpOnly cookies (igual que el login normal)
    dest = RedirectResponse(f"{FRONTEND_URL}/oauth/callback?provider={provider}")

    # Configuración de cookie igual que en auth.py login
    secure_cookie = IS_PROD
    cookie_domain = ".tech4uacademy.es" if IS_PROD else None
    samesite = "Lax"

    dest.set_cookie(
        key="tech4u_token",
        value=jwt,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite,
        domain=cookie_domain,
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    # SEC-12 FIX: eliminada cookie legacy access_token del flujo OAuth

    _clear_state_cookie(dest)
    return dest


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS — Google
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/google/login", include_in_schema=False)
async def google_login():
    if not GOOGLE_CLIENT_ID:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=oauth_not_configured")

    state = secrets.token_urlsafe(32)
    params = urlencode({
        "client_id":     GOOGLE_CLIENT_ID,
        "redirect_uri":  GOOGLE_REDIRECT,
        "response_type": "code",
        "scope":         "openid email profile",
        "state":         state,
        "access_type":   "offline",
        "prompt":        "select_account",
    })
    resp = RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")
    _set_state_cookie(resp, state)
    return resp


@router.get("/google/callback", include_in_schema=False)
@limiter.limit("5/minute")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    code       = request.query_params.get("code")
    state_recv = request.query_params.get("state", "")
    error      = request.query_params.get("error")

    if error:
        log.warning(
            "oauth:provider_error provider=google error=%s ip=%s",
            error, _client_ip(request),
        )
        return RedirectResponse(f"{FRONTEND_URL}/login?error={error}")

    # ── VERIFICAR STATE (CSRF) ─────────────────────────────────────────────────
    cookie_val = request.cookies.get(STATE_COOKIE, "")
    if not cookie_val or not _verify_state(cookie_val, state_recv):
        log.warning(
            "oauth:csrf_detected provider=google ip=%s",
            _client_ip(request),
        )
        return RedirectResponse(f"{FRONTEND_URL}/login?error=invalid_state")

    if not code:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_code")

    # ── INTERCAMBIAR CÓDIGO POR TOKENS ─────────────────────────────────────────
    async with httpx.AsyncClient(timeout=15) as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code":          code,
                "client_id":     GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri":  GOOGLE_REDIRECT,
                "grant_type":    "authorization_code",
            },
        )

    if token_resp.status_code != 200:
        log.error(
            "oauth:token_exchange_failed provider=google status=%d",
            token_resp.status_code,
        )
        return RedirectResponse(f"{FRONTEND_URL}/login?error=token_exchange_failed")

    tokens       = token_resp.json()
    raw_id_token = tokens.get("id_token")

    if not raw_id_token:
        log.error("oauth:no_id_token provider=google")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_id_token")

    # ── VERIFICAR ID TOKEN (firma + audiencia + emisor + expiración) ───────────
    try:
        payload = await _verify_google_id_token_async(raw_id_token)
    except ValueError as exc:
        log.warning("oauth:token_verification_failed provider=google reason=%s", exc)
        return RedirectResponse(f"{FRONTEND_URL}/login?error=invalid_id_token")
    except Exception:
        log.exception("oauth:token_verification_failed provider=google reason=unexpected")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=token_verification_failed")

    # ── EXTRAER Y VALIDAR CLAIMS ───────────────────────────────────────────────
    provider_uid   = payload.get("sub")
    email          = payload.get("email")
    email_verified = payload.get("email_verified", False)
    display_name   = payload.get("name") or payload.get("given_name") or ""

    if not email_verified:
        log.warning(
            "oauth:email_not_verified provider=google sub=%s", provider_uid
        )
        return RedirectResponse(f"{FRONTEND_URL}/login?error=email_not_verified")

    if not provider_uid or not email:
        log.error("oauth:missing_claims provider=google payload=%s", payload)
        return RedirectResponse(f"{FRONTEND_URL}/login?error=invalid_profile")

    return _login_or_create_user(db, "google", provider_uid, email, display_name)


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS — Microsoft
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/microsoft/login", include_in_schema=False)
async def microsoft_login():
    if not MS_CLIENT_ID:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=oauth_not_configured")

    state = secrets.token_urlsafe(32)
    params = urlencode({
        "client_id":     MS_CLIENT_ID,
        "redirect_uri":  MS_REDIRECT,
        "response_type": "code",
        "scope":         "openid email profile User.Read",
        "state":         state,
        "prompt":        "select_account",
    })
    resp = RedirectResponse(
        f"https://login.microsoftonline.com/{MS_TENANT}/oauth2/v2.0/authorize?{params}"
    )
    _set_state_cookie(resp, state)
    return resp


@router.get("/microsoft/callback", include_in_schema=False)
@limiter.limit("5/minute")
async def microsoft_callback(request: Request, db: Session = Depends(get_db)):
    code       = request.query_params.get("code")
    state_recv = request.query_params.get("state", "")
    error      = request.query_params.get("error")

    if error:
        log.warning(
            "oauth:provider_error provider=microsoft error=%s ip=%s",
            error, _client_ip(request),
        )
        return RedirectResponse(f"{FRONTEND_URL}/login?error={error}")

    # ── VERIFICAR STATE (CSRF) ─────────────────────────────────────────────────
    cookie_val = request.cookies.get(STATE_COOKIE, "")
    if not cookie_val or not _verify_state(cookie_val, state_recv):
        log.warning(
            "oauth:csrf_detected provider=microsoft ip=%s",
            _client_ip(request),
        )
        return RedirectResponse(f"{FRONTEND_URL}/login?error=invalid_state")

    if not code:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_code")

    async with httpx.AsyncClient(timeout=15) as client:
        token_resp = await client.post(
            f"https://login.microsoftonline.com/{MS_TENANT}/oauth2/v2.0/token",
            data={
                "code":          code,
                "client_id":     MS_CLIENT_ID,
                "client_secret": MS_CLIENT_SECRET,
                "redirect_uri":  MS_REDIRECT,
                "grant_type":    "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            log.error(
                "oauth:token_exchange_failed provider=microsoft status=%d",
                token_resp.status_code,
            )
            return RedirectResponse(f"{FRONTEND_URL}/login?error=token_exchange_failed")

        tokens       = token_resp.json()
        access_token = tokens.get("access_token", "")

        profile_resp = await client.get(
            "https://graph.microsoft.com/v1.0/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if profile_resp.status_code != 200:
            log.error(
                "oauth:profile_fetch_failed provider=microsoft status=%d",
                profile_resp.status_code,
            )
            return RedirectResponse(f"{FRONTEND_URL}/login?error=profile_fetch_failed")

        profile = profile_resp.json()

    provider_uid = profile.get("id")
    email        = profile.get("mail") or profile.get("userPrincipalName", "")
    display_name = profile.get("displayName") or ""

    if not email:
        log.warning("oauth:ms_callback: email missing from Microsoft profile")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=email_not_provided")

    if not provider_uid:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=invalid_profile")

    # Cuentas de invitado de Microsoft tienen #EXT# en el email — normalizar
    if "#EXT#" in email:
        email = email.split("#EXT#")[0].replace("_", "@", 1)

    return _login_or_create_user(db, "microsoft", provider_uid, email, display_name)
