from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, User, UserProgress, UserError
from auth import get_current_user
from schemas import DashboardStats, SubjectStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

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

    return DashboardStats(
        streak_count=current_user.streak_count,
        months_subscribed=current_user.months_subscribed, # <-- Añadido
        last_login=current_user.last_login,
        subscription_type=current_user.subscription_type,
        subjects=subjects,
        total_questions_answered=total_answered,
        total_errors=error_count,
    )