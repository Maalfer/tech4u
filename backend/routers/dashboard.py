from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import (
    get_db, User, UserProgress, UserError
)
from auth import get_current_user
from schemas import DashboardStats, SubjectStats
from utils import get_rank_name  # fuente de verdad centralizada

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

def get_next_level_xp(level: int) -> int:
    """Sincronizado con database.py::get_next_level_xp — curva progresiva v2."""
    if level <= 5:  return 800
    if level <= 10: return 1500
    if level <= 15: return 2500
    if level <= 19: return 4000
    return 0  # nivel 20 = tope máximo

@router.get("/stats", response_model=DashboardStats)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    progress_rows = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).all()
    error_count = db.query(UserError).filter(UserError.user_id == current_user.id).count()

    subjects = []
    total_answered = 0
    for row in progress_rows:
        acc = round((row.correct_answers / row.total_answered * 100), 1) if row.total_answered > 0 else 0.0
        subjects.append(SubjectStats(
            subject=row.subject,
            total_answered=row.total_answered,
            correct_answers=row.correct_answers,
            accuracy=acc,
            time_invested_minutes=row.time_invested_minutes,
        ))
        total_answered += row.total_answered

    user_level = current_user.level or 1
    user_xp = current_user.xp or 0

    return DashboardStats(
        streak_count=current_user.streak_count,
        months_subscribed=current_user.months_subscribed,
        last_login=current_user.last_login,
        subscription_type=current_user.subscription_type,
        subjects=subjects,
        total_questions_answered=total_answered,
        total_errors=error_count,
        current_xp=user_xp,
        next_level_xp=get_next_level_xp(user_level),
        rank_name=get_rank_name(user_level),
        level=user_level,
        pending_10p_discounts=getattr(current_user, 'pending_10p_discounts', 0) or 0,
        free_months_accumulated=getattr(current_user, 'free_months_accumulated', 0) or 0,
        referral_reward_count=getattr(current_user, 'referral_reward_count', 0) or 0,
    )

# ── Endpoint: "Continuar donde lo dejaste" ───────────────────────────────────
@router.get("/resume")
def get_resume_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the 3 most recent activities the user was doing so the Dashboard
    can show a 'Continue where you left off' card.
    Covers: last lab, last test subject, last video lesson.
    """
    from database import TestSession, UserLabCompletion, Lab, LessonProgress, VideoLesson, VideoCourse

    items = []

    # ── Last lab attempted ────────────────────────────────────────────────────
    try:
        last_lab_completion = (
            db.query(UserLabCompletion)
            .filter(UserLabCompletion.user_id == current_user.id)
            .order_by(UserLabCompletion.completed_at.desc())
            .first()
        )
        if last_lab_completion:
            lab = db.query(Lab).filter(Lab.id == last_lab_completion.lab_id).first()
            if lab:
                items.append({
                    "type": "lab",
                    "title": lab.title,
                    "subtitle": f"Terminal Skills · {lab.category or 'Linux'}",
                    "url": f"/labs/{lab.id}",
                    "icon": "terminal",
                    "accent": "lime",
                    "last_at": last_lab_completion.completed_at.isoformat() if last_lab_completion.completed_at else None,
                    "action": "Volver al lab",
                })
    except Exception:
        pass

    # ── Last test subject ─────────────────────────────────────────────────────
    try:
        last_test = (
            db.query(TestSession)
            .filter(TestSession.user_id == current_user.id)
            .order_by(TestSession.completed_at.desc())
            .first()
        )
        if last_test:
            subject_labels = {
                "redes": "Redes y Protocolos",
                "sistemas": "Sistemas Operativos",
                "bbdd": "Bases de Datos",
                "hardware": "Hardware",
                "seguridad": "Ciberseguridad",
                "linux": "Linux",
            }
            label = subject_labels.get(last_test.subject, last_test.subject.replace("_", " ").title())
            items.append({
                "type": "test",
                "title": f"Test de {label}",
                "subtitle": f"Test Center · {last_test.accuracy:.0f}% precisión último test",
                "url": f"/tests?subject={last_test.subject}",
                "icon": "flask",
                "accent": "blue",
                "last_at": last_test.completed_at.isoformat() if last_test.completed_at else None,
                "action": "Continuar practicando",
            })
    except Exception:
        pass

    # ── Last video lesson ─────────────────────────────────────────────────────
    try:
        last_lesson_progress = (
            db.query(LessonProgress)
            .filter(LessonProgress.user_id == current_user.id)
            .order_by(LessonProgress.completed_at.desc())
            .first()
        )
        if last_lesson_progress:
            lesson = db.query(VideoLesson).filter(VideoLesson.id == last_lesson_progress.lesson_id).first()
            if lesson:
                course = db.query(VideoCourse).filter(VideoCourse.id == lesson.course_id).first()
                course_url = f"/certificacion/{course.slug}" if course and course.slug else "/ciberseguridad"
                items.append({
                    "type": "course",
                    "title": lesson.title,
                    "subtitle": f"Curso · {course.title if course else 'Certificación'}",
                    "url": course_url,
                    "icon": "video",
                    "accent": "purple",
                    "last_at": last_lesson_progress.completed_at.isoformat() if last_lesson_progress.completed_at else None,
                    "action": "Ver siguiente clase",
                })
    except Exception:
        pass

    # Sort by most recent
    items.sort(key=lambda x: x.get("last_at") or "", reverse=True)

    return {"items": items[:3]}
