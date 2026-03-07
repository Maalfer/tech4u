from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_, or_
from database import get_db, User
from auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

RANK_EMOJI = {
    1: "👑", 2: "🥇", 3: "🥈", 4: "🥉",
}


def get_rank_name(level: int) -> str:
    rank_map = {
        1:  "🥉 Estudiante ASIR",
        2:  "🥉 Estudiante ASIR",
        3:  "🥉 Estudiante ASIR",
        4:  "🥉 Estudiante ASIR",
        5:  "🥈 Informático Nerd",
        6:  "🥈 Informático Nerd",
        7:  "🥈 Informático Nerd",
        8:  "🥈 Informático Nerd",
        9:  "🥈 Informático Nerd",
        10: "🥇 Técnico Junior",
        11: "🥇 Técnico Junior",
        12: "🥇 Técnico Junior",
        13: "🥇 Técnico Junior",
        14: "🥇 Técnico Junior",
        15: "⚔️ Técnico L3",
        16: "⚔️ Técnico L3",
        17: "⚔️ Técnico L3",
        18: "🛡️ Admin Senior",
        19: "🛡️ Admin Senior",
        20: "👑 SysAdmin Dios",
    }
    return rank_map.get(level, "👑 SysAdmin Dios" if level > 20 else "🥉 Estudiante ASIR")


@router.get("/global")
def get_global_leaderboard(
    limit: int = 25,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Top usuarios por nivel y XP total acumulado."""
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
            "rank_name": get_rank_name(u.level or 1),
            "subscription_type": u.subscription_type,
            "is_me": u.id == current_user.id,
        })

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
            "rank_name": get_rank_name(current_user.level or 1),
            "subscription_type": current_user.subscription_type,
            "is_me": True,
        }

    return {"leaderboard": result, "my_position": my_pos}
