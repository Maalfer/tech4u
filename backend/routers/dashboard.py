from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, User, UserProgress, UserError
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
        referral_reward_count=getattr(current_user, 'referral_reward_count', 0) or 0
    )