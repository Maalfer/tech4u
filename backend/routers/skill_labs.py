from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
import json
import logging
import random
from datetime import datetime, date, timedelta

logger = logging.getLogger(__name__)
from websocket_manager import manager

from database import get_db, SkillLabExercise, SkillLabSession, User, AcademyStats
from auth import get_current_user
from services.permission_service import require_module_access
from utils import get_rank_name  # fuente de verdad centralizada
from limiter import limiter
from services.cache_service import cache_service

router = APIRouter(
    prefix="/skill-labs",
    tags=["Skill Labs"]
)

# ── Constantes XP ─────────────────────────────────────────────────────────
XP_PER_EXERCISE     = 180
MIN_XP_PER_EXERCISE = 40
XP_PENALTY_PER_FAIL = 25
XP_PERFECT_BONUS    = 150

# ── Plan perks por suscripción ─────────────────────────────────────────────
PLAN_PERKS = {
    "free": {
        "daily_limit": 2,
        "allowed_difficulties": ["easy"],
        "xp_multiplier": 1.0,
        "exam_mode": False,
        "daily_challenge": False,
        "daily_bonus_xp": 0,
    },
    "monthly": {
        "daily_limit": None,   # ilimitado
        "allowed_difficulties": ["easy", "medium"],
        "xp_multiplier": 1.0,
        "exam_mode": False,
        "daily_challenge": True,
        "daily_bonus_xp": 200,
    },
    "quarterly": {
        "daily_limit": None,
        "allowed_difficulties": ["easy", "medium", "hard"],
        "xp_multiplier": 1.5,
        "exam_mode": False,
        "daily_challenge": True,
        "daily_bonus_xp": 300,
    },
    "annual": {
        "daily_limit": None,
        "allowed_difficulties": ["easy", "medium", "hard"],
        "xp_multiplier": 2.0,
        "exam_mode": True,
        "daily_challenge": True,
        "daily_bonus_xp": 500,
    },
}


def get_plan_perks(user: User) -> dict:
    """Devuelve los perks del plan activo del usuario."""
    # Admins y docentes tienen acceso completo
    if user.role in ("admin", "docente"):
        return PLAN_PERKS["annual"]

    # Sin suscripción activa o expirada → free
    if not user.subscription_type or user.subscription_type == "free":
        return PLAN_PERKS["free"]
        
    if user.subscription_end:
        now = datetime.utcnow()
        if user.subscription_end.tzinfo is not None:
            import pytz
            now = datetime.now(pytz.utc)
        if user.subscription_end < now:
            return PLAN_PERKS["free"]

    return PLAN_PERKS.get(user.subscription_type, PLAN_PERKS["free"])


def get_daily_count(user_id: int, db: Session) -> int:
    """Sesiones normales (no daily challenge, no exam) completadas hoy."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return (
        db.query(SkillLabSession)
        .filter(
            SkillLabSession.user_id == user_id,
            SkillLabSession.completed_at >= today_start,
            SkillLabSession.is_daily_challenge == False,
            SkillLabSession.is_exam_mode == False,
        )
        .count()
    )


def build_exercise_payload(ex: SkillLabExercise) -> dict:
    correct_arr = json.loads(ex.correct_answers)
    distractor_arr = json.loads(ex.distractors)
    word_pool = correct_arr + distractor_arr
    random.shuffle(word_pool)
    return {
        "id": ex.id,
        "subject": ex.subject,
        "difficulty": ex.difficulty,
        "sentence": ex.sentence_template,
        "pool": word_pool,
        "answers": correct_arr,
        "explanation": ex.explanation,
    }


# ── GET /skill-labs/status ─────────────────────────────────────────────────
@router.get("/status")
def get_status(db: Session = Depends(get_db), current_user: User = Depends(require_module_access("skill_labs"))):
    """Estado completo del usuario: plan, límites diarios, maestría por tema, XP semanal."""
    perks = get_plan_perks(current_user)
    daily_used = get_daily_count(current_user.id, db)
    daily_remaining = (
        max(0, perks["daily_limit"] - daily_used)
        if perks["daily_limit"] is not None
        else None  # ilimitado
    )

    # Maestría por subject (% de aciertos en últimas 20 sesiones por tema)
    subjects = ["redes", "base_de_datos", "sistemas_operativos", "programacion", "seguridad", "hardware"]
    mastery = {}
    for subj in subjects:
        sessions = (
            db.query(SkillLabSession)
            .filter(SkillLabSession.user_id == current_user.id, SkillLabSession.subject == subj)
            .order_by(SkillLabSession.completed_at.desc())
            .limit(20)
            .all()
        )
        if sessions:
            total_ex = sum(s.total_exercises for s in sessions)
            correct_ex = sum(s.correct_exercises for s in sessions)
            mastery[subj] = round((correct_ex / total_ex * 100) if total_ex else 0, 1)
        else:
            mastery[subj] = 0.0

    # XP semanal (lunes–hoy)
    today = datetime.utcnow()
    week_start = today - timedelta(days=today.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    weekly_sessions = (
        db.query(SkillLabSession)
        .filter(SkillLabSession.user_id == current_user.id, SkillLabSession.completed_at >= week_start)
        .all()
    )
    weekly_xp = sum(s.xp_gained for s in weekly_sessions)

    # ¿Ya hizo el daily challenge hoy?
    today_start = today.replace(hour=0, minute=0, second=0, microsecond=0)
    daily_done = (
        db.query(SkillLabSession)
        .filter(
            SkillLabSession.user_id == current_user.id,
            SkillLabSession.is_daily_challenge == True,
            SkillLabSession.completed_at >= today_start,
        )
        .count()
    ) > 0

    return {
        "plan": current_user.subscription_type or "free",
        "perks": perks,
        "daily_used": daily_used,
        "daily_remaining": daily_remaining,
        "mastery": mastery,
        "weekly_xp": weekly_xp,
        "daily_challenge_done": daily_done,
        "level": current_user.level,
        "xp": current_user.xp,
        "rank": get_rank_name(current_user.level),
    }


# ── GET /skill-labs/leaderboard ────────────────────────────────────────────
@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Top 10 usuarios por XP semanal en Skill Labs (Cached focus)."""
    cache_key = "skill_labs_leaderboard_v1"
    cached_data = cache_service.get(cache_key)
    if cached_data:
        # Mark 'is_me' in cached data
        for entry in cached_data:
            entry["is_me"] = entry["user_id"] == current_user.id
        return cached_data

    today = datetime.utcnow()
    week_start = today - timedelta(days=today.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)

    rows = (
        db.query(SkillLabSession.user_id, func.sum(SkillLabSession.xp_gained).label("weekly_xp"))
        .filter(SkillLabSession.completed_at >= week_start)
        .group_by(SkillLabSession.user_id)
        .order_by(func.sum(SkillLabSession.xp_gained).desc())
        .limit(10)
        .all()
    )

    leaderboard = []
    for pos, row in enumerate(rows, start=1):
        user = db.query(User).filter(User.id == row.user_id).first()
        if user:
            leaderboard.append({
                "position": pos,
                "user_id": user.id,
                "username": user.username,
                "level": user.level,
                "rank": get_rank_name(user.level),
                "weekly_xp": row.weekly_xp,
                "is_me": user.id == current_user.id,
            })

    # Cache result for 5 mins
    cache_service.set(cache_key, leaderboard, expire=300)
    return leaderboard


# ── GET /skill-labs/daily-challenge ───────────────────────────────────────
@router.get("/daily-challenge")
def get_daily_challenge(db: Session = Depends(get_db), current_user: User = Depends(require_module_access("skill_labs"))):
    """5 ejercicios del día (seeded por fecha). Requiere plan mensual o superior."""
    perks = get_plan_perks(current_user)
    if not perks["daily_challenge"]:
        raise HTTPException(status_code=403, detail="El desafío diario requiere una suscripción mensual o superior.")

    today_str = date.today().isoformat()
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    already_done = (
        db.query(SkillLabSession)
        .filter(
            SkillLabSession.user_id == current_user.id,
            SkillLabSession.is_daily_challenge == True,
            SkillLabSession.completed_at >= today_start,
        )
        .count()
    ) > 0

    # Seed determinista para que todos los usuarios vean los mismos ejercicios hoy
    all_exercises = db.query(SkillLabExercise).filter(SkillLabExercise.approved == True).all()
    if not all_exercises:
        raise HTTPException(status_code=404, detail="No hay ejercicios disponibles.")

    seed_val = int(today_str.replace("-", ""))
    rng = random.Random(seed_val)
    selected = rng.sample(all_exercises, min(5, len(all_exercises)))

    return {
        "date": today_str,
        "already_done": already_done,
        "bonus_xp": perks["daily_bonus_xp"],
        "exercises": [build_exercise_payload(ex) for ex in selected],
    }


# ── GET /skill-labs/exercises ──────────────────────────────────────────────
@router.get("/exercises")
def get_exercises(
    subject: str = None,
    difficulty: str = None,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("skill_labs")),
):
    """Ejercicios con filtrado por plan. Free: 2/día y solo fácil."""
    perks = get_plan_perks(current_user)

    # Verificar límite diario
    if perks["daily_limit"] is not None:
        daily_used = get_daily_count(current_user.id, db)
        if daily_used >= perks["daily_limit"]:
            raise HTTPException(
                status_code=429,
                detail=f"Has alcanzado tu límite diario de {perks['daily_limit']} sesiones. Actualiza tu plan para más acceso."
            )

    # Filtrar dificultad por plan
    allowed = perks["allowed_difficulties"]
    query = db.query(SkillLabExercise).filter(
        SkillLabExercise.approved == True,
        SkillLabExercise.difficulty.in_(allowed),
    )

    if subject and subject.lower() != "general":
        query = query.filter(SkillLabExercise.subject == subject)

    # Si el frontend pide una dificultad específica, respetarla si está permitida
    if difficulty:
        if difficulty not in allowed:
            raise HTTPException(
                status_code=403,
                detail=f"La dificultad '{difficulty}' no está disponible en tu plan actual."
            )
        query = query.filter(SkillLabExercise.difficulty == difficulty)

    exercises_db = query.order_by(func.random()).limit(limit).all()

    return [build_exercise_payload(ex) for ex in exercises_db]


# ── GET /skill-labs/exam-mode ──────────────────────────────────────────────
@router.get("/exam-mode")
def get_exam_mode(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """20 ejercicios (4 por tema) sin pistas. Solo plan anual."""
    perks = get_plan_perks(current_user)
    if not perks["exam_mode"]:
        raise HTTPException(status_code=403, detail="El modo examen requiere una suscripción anual.")

    subjects = ["redes", "base_de_datos", "sistemas_operativos", "programacion", "seguridad", "hardware"]
    exercises = []

    for subj in subjects:
        ex_list = (
            db.query(SkillLabExercise)
            .filter(SkillLabExercise.approved == True, SkillLabExercise.subject == subj)
            .order_by(func.random())
            .limit(4)
            .all()
        )
        for ex in ex_list:
            payload = build_exercise_payload(ex)
            payload["explanation"] = None  # sin pistas en modo examen
            exercises.append(payload)

    random.shuffle(exercises)
    return {"exercises": exercises, "total": len(exercises)}


# ── POST /skill-labs/submit ────────────────────────────────────────────────
class SkillSubmitRequest(BaseModel):
    subject: str
    total_exercises: int
    correct_exercises: int
    failed_attempts: int
    difficulty: Optional[str] = "easy"
    is_daily_challenge: Optional[bool] = False
    is_exam_mode: Optional[bool] = False


@router.post("/submit")
@limiter.limit("20/minute")
async def submit_skill_lab(
    data: SkillSubmitRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("skill_labs")),
):
    """Registra resultado y otorga XP con multiplicador por plan."""
    perks = get_plan_perks(current_user)

    # ── Prevención de Farméo (XP Anti-Farming) ──────────────────────────
    # Si el usuario ha completado el mismo tema hace menos de 2 minutos, no damos XP
    cooldown_window = datetime.utcnow() - timedelta(minutes=2)
    recent_session = db.query(SkillLabSession).filter(
        SkillLabSession.user_id == current_user.id,
        SkillLabSession.subject == data.subject,
        SkillLabSession.completed_at >= cooldown_window
    ).first()

    if recent_session:
        logger.warning(f"XP FARMING: User {current_user.id} attempted to farm XP in {data.subject} (Cooldown active)")
        # Devolvemos éxito pero con 0 XP
        return {
            "success": True, 
            "xp_gained": 0, 
            "message": "Enfriamiento de XP activo. Espera un momento antes de ganar más en este tema.",
            "leveled_up": False,
            "new_level": current_user.level
        }
    gross_xp   = data.correct_exercises * XP_PER_EXERCISE
    penalty    = data.failed_attempts * XP_PENALTY_PER_FAIL
    guaranteed = data.correct_exercises * MIN_XP_PER_EXERCISE
    net_xp     = max(guaranteed, gross_xp - penalty)

    is_perfect = (data.correct_exercises == data.total_exercises and data.failed_attempts == 0)
    if is_perfect:
        net_xp += XP_PERFECT_BONUS

    # Bonus daily challenge
    if data.is_daily_challenge and perks["daily_challenge"]:
        net_xp += perks["daily_bonus_xp"]

    # Multiplicador de plan
    net_xp = int(net_xp * perks["xp_multiplier"])

    # ── Registrar sesión ───────────────────────────────────────────────────
    session_record = SkillLabSession(
        user_id=current_user.id,
        subject=data.subject,
        difficulty=data.difficulty,
        total_exercises=data.total_exercises,
        correct_exercises=data.correct_exercises,
        failed_attempts=data.failed_attempts,
        xp_gained=net_xp,
        is_perfect=is_perfect,
        is_daily_challenge=data.is_daily_challenge,
        is_exam_mode=data.is_exam_mode,
    )
    db.add(session_record)

    # ── Aplicar XP al usuario ──────────────────────────────────────────────
    leveled_up = current_user.add_xp(net_xp)
    new_level  = current_user.level
    rank_name  = get_rank_name(new_level)

    db.commit()
    # Invalidate leaderboard cache
    cache_service.delete("skill_labs_leaderboard_v1")

    # ── WebSocket notifications ────────────────────────────────────────────
    if leveled_up:
        await manager.send_personal_message({
            "type": "LEVEL_UP",
            "title": "¡NIVEL ALCANZADO!",
            "message": f"Has subido al nivel {new_level} ({rank_name})",
            "level": new_level,
            "rank": rank_name,
        }, current_user.id)

    if is_perfect:
        msg = (
            "¡Examen perfecto! Rendimiento excepcional."
            if data.is_exam_mode
            else f"Has completado el Skill Lab de {data.subject} sin errores."
        )
        await manager.send_personal_message({
            "type": "NOTIFICATION",
            "title": "¡ENLACE PERFECTO!" if not data.is_exam_mode else "¡EXAMEN PERFECTO!",
            "message": msg,
            "severity": "success",
        }, current_user.id)

    if data.is_daily_challenge and is_perfect:
        await manager.send_personal_message({
            "type": "NOTIFICATION",
            "title": "¡DESAFÍO DIARIO PERFECTO!",
            "message": f"+{perks['daily_bonus_xp']} XP bonus por el desafío diario.",
            "severity": "success",
        }, current_user.id)

    return {
        "success": True,
        "xp_gained": net_xp,
        "xp_multiplier": perks["xp_multiplier"],
        "leveled_up": leveled_up,
        "new_level": new_level,
        "new_rank": rank_name,
        "is_perfect": is_perfect,
    }
