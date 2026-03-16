from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_, or_
from database import get_db, User
from auth import get_current_user
from utils import get_rank_name  # fuente de verdad centralizada
from cache import cache_get, cache_set

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

RANK_EMOJI = {
    1: "👑", 2: "🥇", 3: "🥈", 4: "🥉",
}


@router.get("/global")
def get_global_leaderboard(
    limit: int = 25,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Top usuarios por nivel y XP total acumulado."""
    # Try to get from cache
    cache_key = f"leaderboard:global:{limit}"
    cached = cache_get(cache_key)
    if cached:
        result = cached
    else:
        users = (
            db.query(User)
            .filter(User.role == "alumno")
            .order_by(desc(User.level), desc(User.xp))
            .limit(limit)
            .all()
        )

        result = []
        for i, u in enumerate(users, 1):
            result.append({
                "position": i,
                "position_emoji": RANK_EMOJI.get(i, ""),
                "user_id": u.id,
                "nombre": u.nombre,
                "level": u.level or 1,
                "xp": u.xp or 0,
                "streak": u.streak_count or 0,
                "rank_name": get_rank_name(u.level or 1),
                "subscription_type": u.subscription_type,
                "is_me": u.id == current_user.id,
            })
        # Cache for 60 seconds
        cache_set(cache_key, result, ttl=60)

    # My own position if not in top (use COUNT query to avoid N+1)
    my_pos = next((r for r in result if r["is_me"]), None)
    if not my_pos:
        # Count how many users rank higher than current user
        my_index = db.query(func.count(User.id)).filter(
            User.role == "alumno",
            or_(
                User.level > current_user.level,
                and_(User.level == current_user.level, User.xp > current_user.xp)
            )
        ).scalar()
        my_position = (my_index or 0) + 1
        my_pos = {
            "position": my_position,
            "position_emoji": "",
            "user_id": current_user.id,
            "nombre": current_user.nombre,
            "level": current_user.level or 1,
            "xp": current_user.xp or 0,
            "streak": current_user.streak_count or 0,
            "rank_name": get_rank_name(current_user.level or 1),
            "subscription_type": current_user.subscription_type,
            "is_me": True,
        }

    return {"leaderboard": result, "my_position": my_pos}
