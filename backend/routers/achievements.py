from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, User, Achievement, UserAchievement
from auth import get_current_user, require_admin
from schemas import AchievementOut, UserAchievementOut

from websocket_manager import manager

router = APIRouter(prefix="/achievements", tags=["Achievements"])

@router.get("/my", response_model=List[UserAchievementOut])
def get_my_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista los logros obtenidos por el usuario actual."""
    return db.query(UserAchievement).filter(UserAchievement.user_id == current_user.id).all()

@router.get("/all", response_model=List[AchievementOut])
def list_all_achievements(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """(Logueado) Lista todos los logros disponibles en la plataforma."""
    return db.query(Achievement).all()

# --- INTERNO / ADMIN ---

async def award_achievement(user_id: int, achievement_name: str, db: Session, auto_commit: bool = True):
    """Función interna para otorgar un logro a un usuario."""
    achievement = db.query(Achievement).filter(Achievement.name == achievement_name).first()
    if not achievement:
        return False
    
    # Verificar si ya lo tiene
    exists = db.query(UserAchievement).filter(
        UserAchievement.user_id == user_id,
        UserAchievement.achievement_id == achievement.id
    ).first()
    
    if exists:
        return False
    
    new_ua = UserAchievement(user_id=user_id, achievement_id=achievement.id)
    db.add(new_ua)
    
    # Otorgar Bonus XP si aplica
    user = db.query(User).filter(User.id == user_id).first()
    if user and achievement.xp_bonus:
        user.xp = (user.xp or 0) + achievement.xp_bonus
        
    if auto_commit:
        db.commit()
        # REAL-TIME NOTIFICATION (Solo si hacemos commit ahora)
        await manager.send_personal_message({
            "type": "achievement_unlocked",
            "title": achievement.name,
            "description": achievement.description,
            "icon": achievement.icon,
            "xp_bonus": achievement.xp_bonus
        }, user_id)

    return True

@router.post("/seed")
def seed_achievements(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    """(Admin) Inicializa los logros básicos."""
    base_achievements = [
        {"name": "Primer Paso", "description": "Completaste tu primer test", "icon": "🚀", "rarity": "común", "xp_bonus": 50},
        {"name": "Maestro de Redes", "description": "Sacaste un 100% en un test de Redes", "icon": "🌐", "rarity": "raro", "xp_bonus": 200},
        {"name": "Imparable", "description": "Llegaste a una racha de 7 días", "icon": "🔥", "rarity": "épico", "xp_bonus": 500},
        {"name": "Cazador de Errores", "description": "Completaste un test de repaso de errores", "icon": "🛡️", "rarity": "común", "xp_bonus": 100},
    ]
    
    for ach in base_achievements:
        exists = db.query(Achievement).filter(Achievement.name == ach["name"]).first()
        if not exists:
            db.add(Achievement(**ach))
    
    db.commit()
    return {"message": "Logros inicializados"}
