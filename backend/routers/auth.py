from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db, User, Referral
from schemas import UserRegister, UserLogin, TokenResponse, UserOut
from auth import decode_token, get_current_user, hash_password, verify_password, create_access_token, create_refresh_token, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from pydantic import BaseModel
import secrets
import random
import string
import re
from services import email_service
from fastapi import BackgroundTasks
from limiter import limiter
import logging
import redis
import os

logger = logging.getLogger(__name__)

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=6379,
    decode_responses=True
)

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

def generate_referral_code(length=8):
    # SEC-14 FIX: usar secrets en lugar de random (criptográficamente seguro)
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse, status_code=201)
@limiter.limit("3/minute")
def register(request: Request, response: Response, data: UserRegister, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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
            # SEC-04 FIX: obtener IP solo desde proxies confiables
            _trusted_proxies = {ip.strip() for ip in os.getenv("TRUSTED_PROXY_IPS", "").split(",") if ip.strip()}
            _connection_ip = request.client.host if request.client else "unknown"
            if _trusted_proxies and _connection_ip in _trusted_proxies:
                _ff = request.headers.get("X-Forwarded-For", "")
                ip = _ff.split(",")[0].strip() if _ff else _connection_ip
            else:
                ip = _connection_ip

            # Verificar límite de IP: máx. 3 registros hacia el mismo referidor en 24h
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

    # SEC-05: incluir token_version en el payload del JWT
    access_token = create_access_token({"sub": str(user.id), "ver": user.token_version or 0})
    refresh_token = create_refresh_token({"sub": str(user.id), "ver": user.token_version or 0})

    # Set httpOnly authentication cookies
    env = os.getenv("ENVIRONMENT", "development")
    secure_cookie = os.getenv("COOKIE_SECURE", "False").lower() == "true"

    if env == "production":
        cookie_domain = ".tech4uacademy.es"
        samesite_access = "Lax"
        samesite_refresh = "Strict"
    else:
        cookie_domain = None
        samesite_access = "Lax"
        samesite_refresh = "Lax"

    response.set_cookie(
        key="tech4u_token",
        value=access_token,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite_access,
        domain=cookie_domain,
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    response.set_cookie(
        key="tech4u_refresh",
        value=refresh_token,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite_refresh,
        domain=cookie_domain,
        path="/",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )

    # Send emails (non-blocking)
    try:
        email_service.send_welcome_email(user, background_tasks)
    except Exception as e:
        logger.warning(f"Failed to queue welcome email to {user.email}: {e}")
    db.refresh(user)
    return TokenResponse(
        access_token=access_token, 
        refresh_token=refresh_token,
        token_type="bearer", 
        user=UserOut.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, response: Response, data: UserLogin, db: Session = Depends(get_db)):

    # IP real (Cloudflare)
    client_ip = request.headers.get("CF-Connecting-IP") or request.client.host

    # Bloqueo Redis
    block_key = f"block:{client_ip}"
    if redis_client.exists(block_key):
        raise HTTPException(status_code=403, detail="Demasiados intentos. Intenta más tarde.")

    # Detección de bots — segunda línea de defensa específica para el endpoint de login.
    # main.py antibot_middleware ya bloquea: python-requests, aiohttp, go-http-client,
    # headless, selenium, puppeteer, sqlmap, nikto, nmap, masscan, zgrab.
    # Aquí solo añadimos patrones que antibot no cubre y que son claramente ilegítimos en login:
    # - "wget": herramienta de descarga, no debería hacer login
    # - "bot": UAs de bots genéricos (Googlebot, etc. no hacen login)
    # - "scanner": herramientas de escaneo de seguridad
    # NO bloqueamos "curl" (herramienta legítima de desarrollo) ni "python" (demasiado amplio).
    user_agent = request.headers.get("user-agent", "").lower()
    blocked_agents = ["wget", "bot", "scanner"]

    if any(agent in user_agent for agent in blocked_agents):
        raise HTTPException(status_code=403, detail="Acceso no permitido")

    # Buscar usuario
    user = db.query(User).filter(User.email.ilike(data.email)).first()

    # Login incorrecto → Redis
    if not user or not verify_password(data.password, user.password_hash):

        attempts_key = f"attempts:{client_ip}"
        attempts = redis_client.incr(attempts_key)

        if attempts == 1:
            redis_client.expire(attempts_key, 300)

        # Bloqueo progresivo
        if attempts >= 20:
            redis_client.setex(block_key, 86400, "1")
            logger.warning(f"SECURITY: IP {client_ip} bloqueada 24h por {attempts} intentos fallidos de login (email: {data.email.lower()})")
        elif attempts >= 10:
            redis_client.setex(block_key, 3600, "1")
            logger.warning(f"SECURITY: IP {client_ip} bloqueada 1h — {attempts} intentos fallidos (email: {data.email.lower()})")
        elif attempts >= 5:
            redis_client.setex(block_key, 300, "1")
            logger.warning(f"SECURITY: IP {client_ip} bloqueada 5min — {attempts} intentos fallidos (email: {data.email.lower()})")
        else:
            logger.info(f"SECURITY: Intento de login fallido #{attempts} desde {client_ip} (email: {data.email.lower()})")

        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    # Login correcto → limpiar intentos
    redis_client.delete(f"attempts:{client_ip}")

    now = datetime.utcnow()

    # Streak
    if user.last_login:
        delta = (now.date() - user.last_login.date()).days
        if delta == 1:
            user.streak_count += 1
        elif delta > 1:
            if (user.streak_protections or 0) > 0:
                user.streak_protections -= 1
            else:
                user.streak_count = 1
                user.remove_xp(100)
    else:
        user.streak_count = 1

    user.last_login = now
    db.commit()
    db.refresh(user)

    # Tokens
    access_token = create_access_token({"sub": str(user.id), "ver": user.token_version or 0})
    refresh_token = create_refresh_token({"sub": str(user.id), "ver": user.token_version or 0})

    env = os.getenv("ENVIRONMENT", "development")
    secure_cookie = os.getenv("COOKIE_SECURE", "False").lower() == "true"

    if env == "production":
        cookie_domain = ".tech4uacademy.es"
        samesite_access = "Lax"
        samesite_refresh = "Strict"
    else:
        cookie_domain = None
        samesite_access = "Lax"
        samesite_refresh = "Lax"

    response.set_cookie(
        key="tech4u_token",
        value=access_token,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite_access,
        domain=cookie_domain,
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    response.set_cookie(
        key="tech4u_refresh",
        value=refresh_token,
        httponly=True,
        secure=secure_cookie,
        samesite=samesite_refresh,
        domain=cookie_domain,
        path="/",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )


@router.post("/logout")
def logout(response: Response):
    env = os.getenv("ENVIRONMENT", "development")
    cookie_domain = ".tech4uacademy.es" if env == "production" else None

    # Clear all auth cookies
    for cookie in ["tech4u_token", "tech4u_refresh", "access_token"]:
        response.delete_cookie(
            key=cookie,
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
    user = db.query(User).filter(User.email.ilike(data.email)).first()
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        frontend_url = os.getenv("FRONTEND_URL", "https://tech4uacademy.es")
        reset_url = f"{frontend_url}/reset-password?token={token}"
        try:
            email_service.send_password_reset_email(user, reset_url)
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
    # SEC-11 FIX: invalidar todos los tokens JWT activos incrementando token_version.
    # Cualquier token emitido antes de este momento queda automáticamente inválido.
    user.token_version = (user.token_version or 0) + 1
    db.commit()
    return {"detail": "Contraseña actualizada correctamente. Ya puedes iniciar sesión."}


# ── Silent Token Refresh ──────────────────────────────────────────────────────

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    """Issues a fresh access token if the refresh token is valid."""
    refresh_token = request.cookies.get("tech4u_refresh")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No hay token de refresco")

    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token de tipo incorrecto")
            
        user_id = payload.get("sub")
        token_ver = payload.get("ver")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")

        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        # Verificar versión del token (revocación selectiva)
        if user.token_version != token_ver:
            raise HTTPException(status_code=401, detail="Sesión revocada")

        # Generar nuevo access token
        new_access_token = create_access_token({"sub": str(user.id), "ver": user.token_version or 0})
        # Opcional: Rotar el refresh token (seguridad extra)
        new_refresh_token = create_refresh_token({"sub": str(user.id), "ver": user.token_version or 0})

        env = os.getenv("ENVIRONMENT", "development")
        secure_cookie = os.getenv("COOKIE_SECURE", "False").lower() == "true"
        cookie_domain = ".tech4uacademy.es" if env == "production" else None

        response.set_cookie(
            key="tech4u_token",
            value=new_access_token,
            httponly=True,
            secure=secure_cookie,
            samesite="Lax" if env == "production" else "Lax",
            domain=cookie_domain,
            path="/",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

        response.set_cookie(
            key="tech4u_refresh",
            value=new_refresh_token,
            httponly=True,
            secure=secure_cookie,
            samesite="Strict" if env == "production" else "Lax",
            domain=cookie_domain,
            path="/",
            max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
        )

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            user=UserOut.model_validate(user)
        )
    except Exception as e:
        logger.error(f"Error en refresh_token: {e}")
        raise HTTPException(status_code=401, detail="Sesión expirada o inválida")


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


# ── Mi Aprendizaje ───────────────────────────────────────────────────────────

@router.get("/learning-summary")
def get_learning_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Resumen completo del aprendizaje del usuario para el panel 'Mi Aprendizaje'.
    Incluye: cursos de suscripción, cursos de shop, tests y labs.
    """
    from database import (
        VideoCourse, VideoLesson, LessonProgress,
        UserCoursePurchase, TestSession, UserLabCompletion,
        Lab, SkillPath, Module
    )

    uid = current_user.id

    # ── 1. Cursos de suscripción (eJPTv2 y similares) ─────────────────────
    sub_courses = (
        db.query(VideoCourse)
        .filter(VideoCourse.is_active == True, VideoCourse.is_shop_course == False)
        .all()
    )

    # SEC-FIX: Filter courses based on group enabled modules
    if current_user.group_info:
        enabled = current_user.group_info.get("enabled_modules", [])
        # We assume courses with 'ejpt' or 'cyber' in slug belong to ciberseguridad module
        sub_courses = [
            c for c in sub_courses 
            if "ciberseguridad" in enabled or not (
                "ejpt" in (c.slug or "").lower() or 
                "cyber" in (c.slug or "").lower() or 
                "ciberseguridad" in (c.slug or "").lower()
            )
        ]

    subscription_courses_data = []
    for course in sub_courses:
        total_lessons = len([l for l in course.lessons if not l.is_quiz])
        quiz_count = len([l for l in course.lessons if l.is_quiz])
        all_lesson_ids = [l.id for l in course.lessons]

        completed_ids = set(
            p.lesson_id for p in db.query(LessonProgress)
            .filter(
                LessonProgress.user_id == uid,
                LessonProgress.lesson_id.in_(all_lesson_ids)
            ).all()
        )
        completed_count = len(completed_ids)
        pct = round((completed_count / total_lessons * 100) if total_lessons > 0 else 0)

        last_progress = (
            db.query(LessonProgress)
            .filter(
                LessonProgress.user_id == uid,
                LessonProgress.lesson_id.in_(all_lesson_ids)
            )
            .order_by(LessonProgress.completed_at.desc())
            .first()
        )
        last_accessed = last_progress.completed_at.isoformat() if last_progress else None

        subscription_courses_data.append({
            "id": course.id,
            "title": course.title,
            "slug": course.slug,
            "description": course.description,
            "total_lessons": total_lessons,
            "quiz_count": quiz_count,
            "completed_lessons": completed_count,
            "progress_pct": pct,
            "last_accessed": last_accessed,
            "started": completed_count > 0,
            "completed": pct == 100,
        })

    # ── 2. Cursos de tienda (comprados) ────────────────────────────────────
    purchases = (
        db.query(UserCoursePurchase)
        .filter(UserCoursePurchase.user_id == uid)
        .all()
    )

    shop_courses_data = []
    for purchase in purchases:
        course = db.query(VideoCourse).filter(VideoCourse.id == purchase.course_id).first()
        if not course:
            continue
        total_lessons = len([l for l in course.lessons if not l.is_quiz])
        all_lesson_ids = [l.id for l in course.lessons]
        completed_count = db.query(LessonProgress).filter(
            LessonProgress.user_id == uid,
            LessonProgress.lesson_id.in_(all_lesson_ids)
        ).count()
        pct = round((completed_count / total_lessons * 100) if total_lessons > 0 else 0)

        shop_courses_data.append({
            "id": course.id,
            "title": course.title,
            "slug": course.slug,
            "total_lessons": total_lessons,
            "completed_lessons": completed_count,
            "progress_pct": pct,
            "purchased_at": purchase.purchased_at.isoformat(),
            "completed": pct == 100,
        })

    # ── 3. Historial de tests ───────────────────────────────────────────────
    test_sessions = (
        db.query(TestSession)
        .filter(TestSession.user_id == uid)
        .order_by(TestSession.completed_at.desc())
        .limit(10)
        .all()
    )
    test_data = [
        {
            "id": s.id,
            "subject": s.subject,
            "mode": s.mode,
            "total": s.total,
            "correct": s.correct,
            "accuracy": s.accuracy,
            "xp_gained": s.xp_gained,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
        }
        for s in test_sessions
    ]

    total_tests = db.query(TestSession).filter(TestSession.user_id == uid).count()
    avg_accuracy = 0.0
    if total_tests > 0:
        acc_rows = db.query(TestSession.accuracy).filter(TestSession.user_id == uid).all()
        avg_accuracy = round(sum(r[0] or 0 for r in acc_rows) / total_tests, 1)

    # ── 4. Labs completados ─────────────────────────────────────────────────
    lab_completions = (
        db.query(UserLabCompletion)
        .filter(UserLabCompletion.user_id == uid)
        .order_by(UserLabCompletion.completed_at.desc())
        .all()
    )
    total_labs_completed = len(lab_completions)
    total_labs = db.query(Lab).filter(Lab.is_active == True).count()

    # ── 5. SkillPaths progreso ──────────────────────────────────────────────
    paths = db.query(SkillPath).filter(SkillPath.is_active == True).all()
    completed_lab_ids = set(c.lab_id for c in lab_completions)

    skill_paths_data = []
    for path in paths:
        all_labs = [
            lab for mod in path.modules
            for lab in mod.labs
            if lab.is_active
        ]
        total = len(all_labs)
        done = len([l for l in all_labs if l.id in completed_lab_ids])
        pct = round((done / total * 100) if total > 0 else 0)
        if total > 0:
            skill_paths_data.append({
                "id": path.id,
                "title": path.title,
                "difficulty": path.difficulty,
                "total_labs": total,
                "completed_labs": done,
                "progress_pct": pct,
                "started": done > 0,
            })

    # ── 6. Estadísticas globales ────────────────────────────────────────────
    stats = {
        "xp": current_user.xp,
        "level": current_user.level,
        "streak": current_user.streak_count,
        "subscription_type": current_user.subscription_type,
        "total_tests": total_tests,
        "avg_accuracy": avg_accuracy,
        "labs_completed": total_labs_completed,
        "total_labs": total_labs,
    }

    return {
        "stats": stats,
        "subscription_courses": subscription_courses_data,
        "shop_courses": shop_courses_data,
        "recent_tests": test_data,
        "skill_paths": skill_paths_data,
    }


# ── Email de aviso de racha ────────────────────────────────────────────────────
@router.post("/send-streak-warning")
def send_streak_warning_email(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Triggered automatically when the user logs in and is at risk of losing their streak.
    Also callable from the scheduler/cron to proactively warn before midnight.
    """
    if not current_user.email:
        raise HTTPException(status_code=400, detail="Usuario sin email")

    if (current_user.streak_count or 0) < 2:
        return {"sent": False, "reason": "streak_too_short"}

    now = datetime.utcnow()
    if current_user.last_login:
        hours_since = (now - current_user.last_login).total_seconds() / 3600
        if hours_since < 18:
            return {"sent": False, "reason": "too_soon"}

    sent = email_service.send_streak_warning_email(
        to=current_user.email,
        nombre=current_user.nombre or current_user.email,
        streak_days=current_user.streak_count or 0,
    )
    return {"sent": sent}


# ── Informe semanal de progreso ───────────────────────────────────────────────
@router.post("/send-weekly-digest")
def send_weekly_digest_email(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Sends the weekly progress digest to the current user.
    Normally called by a scheduled task (every Monday 09:00).
    Also accessible by the user themselves or admin for testing.
    """
    from database import TestSession, UserLabCompletion

    if not current_user.email:
        raise HTTPException(status_code=400, detail="Usuario sin email")

    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    # XP gained in last 7 days — approximate via test sessions
    recent_tests = (
        db.query(TestSession)
        .filter(
            TestSession.user_id == current_user.id,
            TestSession.created_at >= week_ago,
        )
        .all()
    )
    tests_done = len(recent_tests)
    xp_from_tests = sum(t.xp_gained or 0 for t in recent_tests)
    accuracies = [t.accuracy for t in recent_tests if t.accuracy is not None]
    avg_accuracy = sum(accuracies) / len(accuracies) if accuracies else 0.0

    # Top subject this week
    subject_counts: dict = {}
    for t in recent_tests:
        subj = getattr(t, "subject", None) or ""
        if subj:
            subject_counts[subj] = subject_counts.get(subj, 0) + 1
    top_subject = max(subject_counts, key=subject_counts.get) if subject_counts else ""

    # Labs completed in last 7 days
    labs_done = (
        db.query(UserLabCompletion)
        .filter(
            UserLabCompletion.user_id == current_user.id,
            UserLabCompletion.completed_at >= week_ago,
        )
        .count()
    )

    # Total XP gained (rough: xp from tests + labs * 150)
    xp_gained = xp_from_tests + labs_done * 150

    sent = email_service.send_weekly_digest_email(
        to=current_user.email,
        nombre=current_user.nombre or current_user.email,
        xp_gained=xp_gained,
        tests_done=tests_done,
        labs_done=labs_done,
        streak_days=current_user.streak_count or 0,
        level=current_user.level or 1,
        accuracy=avg_accuracy,
        top_subject=top_subject,
    )
    return {"sent": sent, "xp_gained": xp_gained, "tests_done": tests_done, "labs_done": labs_done}
