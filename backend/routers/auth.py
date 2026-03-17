from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db, User, Referral
from schemas import UserRegister, UserLogin, TokenResponse, UserOut
from auth import decode_token, get_current_user, hash_password, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from pydantic import BaseModel
import secrets
import random
import string
import re
import emails as mailer
from limiter import limiter
import logging

logger = logging.getLogger(__name__)

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validates password strength and returns (is_valid, error_message)."""
    if len(password) < 12:
        return False, "La contraseña debe tener al menos 12 caracteres"
    if not re.search(r'[A-Z]', password):
        return False, "La contraseña debe contener al menos una letra mayúscula"
    if not re.search(r'[a-z]', password):
        return False, "La contraseña debe contener al menos una letra minúscula"
    if not re.search(r'[0-9]', password):
        return False, "La contraseña debe contener al menos un número"
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-]', password):
        return False, "La contraseña debe contener al menos un carácter especial: !@#$%^&*(),.?\":{}|<>_-"
    return True, ""

def generate_referral_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse, status_code=201)
@limiter.limit("3/minute")
def register(request: Request, response: Response, data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    # Validate password strength
    is_valid, error_msg = validate_password_strength(data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Generate unique referral code for the new user
    new_referral_code = generate_referral_code()
    while db.query(User).filter(User.referral_code == new_referral_code).first():
        new_referral_code = generate_referral_code()

    now = datetime.utcnow()

    user_role = data.role or "alumno"

    # Always create as free — subscription must be activated via Stripe payment
    user = User(
        nombre=data.nombre,
        email=data.email,
        password_hash=hash_password(data.password),
        subscription_type="free",
        subscription_end=None,
        streak_count=0,
        last_login=now,
        referral_code=new_referral_code,
        referred_by_id=None,  # Se asignará tras validar el referido
        role=user_role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # ── Procesar código de referido (si se proporcionó) ──
    # Las recompensas NO se dan ahora. Solo se crea el vínculo (pending).
    # La recompensa se genera cuando el invitado completa su primer pago (webhook Stripe).
    if data.referral_code:
        referrer = db.query(User).filter(
            User.referral_code == data.referral_code.upper()
        ).first()

        if referrer:
            # Prevent self-referral by exact email match
            if referrer.email.lower() == data.email.lower():
                raise HTTPException(status_code=400, detail="No puedes usar tu propio código de referido")

        if referrer and referrer.id != user.id:
            # Obtener IP del registro para anti-fraude
            forwarded_for = request.headers.get("X-Forwarded-For")
            ip = forwarded_for.split(",")[0].strip() if forwarded_for else (
                request.client.host if request.client else "unknown"
            )

            # Verificar límite de IP: máx. 3 registros hacia el mismo referidor en 24h
            from datetime import timedelta
            cutoff = now - timedelta(hours=24)
            ip_count = db.query(Referral).filter(
                Referral.referrer_id == referrer.id,
                Referral.ip_address == ip,
                Referral.created_at >= cutoff,
            ).count()

            if ip_count < 3:
                # Crear relación de referido en estado "pending"
                referral = Referral(
                    referrer_id=referrer.id,
                    referred_id=user.id,
                    ip_address=ip,
                    status="pending",
                )
                db.add(referral)
                user.referred_by_id = referrer.id
                db.commit()

    token = create_access_token({"sub": str(user.id)})

    # Set httpOnly authentication cookie with tech4u_token name
    import os
    env = os.getenv("ENVIRONMENT", "development")
    secure_cookie = os.getenv("COOKIE_SECURE", "False").lower() == "true"

    if env == "production":
        cookie_domain = ".tech4uacademy.es"
        samesite = "Lax"
    else:
        cookie_domain = None
        samesite = "Lax"

    # Set the httpOnly cookie for authentication
    response.set_cookie(
        key="tech4u_token",
        value=token,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite,
        domain=cookie_domain,
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    # Also keep access_token for backward compatibility during migration
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite,
        domain=cookie_domain,
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    # Send emails (non-blocking)
    try:
        mailer.send_welcome(user.email, user.nombre)
    except Exception as e:
        logger.warning(f"Failed to send welcome email to {user.email}: {e}")
    db.refresh(user)
    return TokenResponse(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, response: Response, data: UserLogin, db: Session = Depends(get_db)):
    # Case-insensitive lookup
    user = db.query(User).filter(User.email.ilike(data.email)).first()

    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    now = datetime.utcnow()

    # Streak logic: if last login was yesterday → increment, if same day → keep, else → reset
    if user.last_login:
        delta = (now.date() - user.last_login.date()).days
        if delta == 1:
            user.streak_count += 1
        elif delta > 1:
            # Check for streak protections (Anti-loss shield)
            if (user.streak_protections or 0) > 0:
                user.streak_protections -= 1
                # Streak is preserved, delta is ignored
            else:
                # Reset streak and apply XP penalty
                user.streak_count = 1
                user.remove_xp(100) # Penalización de 100 XP
        # delta == 0 → same day, keep streak
    else:
        user.streak_count = 1

    user.last_login = now
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})

    # Set httpOnly authentication cookie with tech4u_token name
    import os
    env = os.getenv("ENVIRONMENT", "development")
    secure_cookie = os.getenv("COOKIE_SECURE", "False").lower() == "true"

    if env == "production":
        cookie_domain = ".tech4uacademy.es"
        samesite = "Lax"
    else:
        cookie_domain = None
        samesite = "Lax"

    # Set the httpOnly cookie for authentication
    response.set_cookie(
        key="tech4u_token",
        value=token,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite,
        domain=cookie_domain,
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert minutes to seconds
    )

    # Also keep access_token for backward compatibility during migration
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite,
        domain=cookie_domain,
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return TokenResponse(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.post("/logout")
def logout(response: Response):
    import os
    env = os.getenv("ENVIRONMENT", "development")
    cookie_domain = ".tech4uacademy.es" if env == "production" else None

    # Clear both cookies (new tech4u_token and legacy access_token)
    response.delete_cookie(
        key="tech4u_token",
        domain=cookie_domain,
        path="/"
    )
    response.delete_cookie(
        key="access_token",
        domain=cookie_domain,
        path="/"
    )
    return {"detail": "Sesión cerrada"}


@router.get("/me")
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Devuelve el perfil del usuario."""
    return UserOut.model_validate(current_user)


# ── Password Reset ────────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password", status_code=200)
@limiter.limit("3/minute")
def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Sends a password-reset email if the account exists. Always returns 200 to avoid email enumeration."""
    import os
    user = db.query(User).filter(User.email.ilike(data.email)).first()
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        reset_url = f"{frontend_url}/reset-password?token={token}"
        try:
            mailer.send_password_reset(user.email, user.nombre, reset_url)
        except Exception as e:
            logger.warning(f"Failed to send password reset email to {user.email}: {e}")
    return {"detail": "Si ese email existe, recibirás un enlace en breve."}


@router.post("/reset-password", status_code=200)
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Validates the reset token and updates the password."""
    if not data.token or len(data.token) < 10:
        raise HTTPException(status_code=400, detail="Token inválido")

    # Validate password strength
    is_valid, error_msg = validate_password_strength(data.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    user = db.query(User).filter(User.reset_token == data.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido o ya usado")
    if not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="El token ha expirado. Solicita uno nuevo.")

    user.password_hash = hash_password(data.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    return {"detail": "Contraseña actualizada correctamente. Ya puedes iniciar sesión."}


# ── Silent Token Refresh ──────────────────────────────────────────────────────

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    """Issues a fresh token if the current one is valid (silent refresh for long sessions)."""
    import os
    # Try tech4u_token first, fall back to access_token for backward compatibility
    token = request.cookies.get("tech4u_token") or request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="No hay sesión activa")

    payload = decode_token(token)  # Raises 401 if invalid/expired
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    new_token = create_access_token({"sub": str(user.id)})

    env = os.getenv("ENVIRONMENT", "development")
    secure_cookie = os.getenv("COOKIE_SECURE", "False").lower() == "true"

    if env == "production":
        cookie_domain = ".tech4uacademy.es"
        samesite = "Lax"
    else:
        cookie_domain = None
        samesite = "Lax"

    # Set both cookies for consistency
    response.set_cookie(
        key="tech4u_token",
        value=new_token,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite,
        domain=cookie_domain,
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    response.set_cookie(
        key="access_token",
        value=new_token,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite,
        domain=cookie_domain,
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    return TokenResponse(access_token=new_token, token_type="bearer", user=UserOut.model_validate(user))


# ── Onboarding ────────────────────────────────────────────────────────────

class CompleteOnboardingRequest(BaseModel):
    ciclo: str  # 'ASIR' | 'DAM' | 'DAW' | 'SMR'
    interests: list[str] = []


@router.post("/complete-onboarding", response_model=UserOut)
def complete_onboarding(
    data: CompleteOnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Completes the post-registration onboarding flow.
    Updates user's ciclo and marks onboarding as completed.
    """
    if data.ciclo not in ["ASIR", "DAM", "DAW", "SMR"]:
        raise HTTPException(status_code=400, detail="Ciclo inválido. Debe ser: ASIR, DAM, DAW, o SMR")

    current_user.ciclo = data.ciclo
    current_user.onboarding_completed = True
    db.commit()
    db.refresh(current_user)

    return UserOut.model_validate(current_user)
