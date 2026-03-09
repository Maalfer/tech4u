from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List
import json
import random
from websocket_manager import manager

from database import get_db, SkillLabExercise, User, AcademyStats
from auth import get_current_user

router = APIRouter(
    prefix="/skill-labs",
    tags=["Skill Labs"]
)

# ── Constantes XP v2 ─────────────────────────────────────────────────
# Los Skill Labs son la fuente de XP más rica: requieren comprensión real.
#   XP base por ejercicio correcto: 180
#   Mínimo garantizado por ejercicio (aunque haya errores): 40
#   Penalización por intento fallido: 25 XP
#   Bonus por completar sin errores (perfect run): +150 XP
# ─────────────────────────────────────────────────────────────────────
XP_PER_EXERCISE     = 180
MIN_XP_PER_EXERCISE = 40
XP_PENALTY_PER_FAIL = 25
XP_PERFECT_BONUS    = 150

@router.get("/exercises")
def get_exercises(subject: str = None, limit: int = 10, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """
    Returns randomized exercises with shuffled blanks and mixed correct/distractor chips.
    """
    query = db.query(SkillLabExercise).filter(SkillLabExercise.approved == True)
    if subject and subject.lower() != 'general':
        query = query.filter(SkillLabExercise.subject == subject)

    exercises_db = query.order_by(func.random()).limit(limit).all()

    results = []
    for ex in exercises_db:
        # Load JSON strings
        correct_arr = json.loads(ex.correct_answers)
        distractor_arr = json.loads(ex.distractors)

        # Create a single pool of words (chips) mixed up
        word_pool = correct_arr + distractor_arr
        random.shuffle(word_pool)

        results.append({
            "id": ex.id,
            "subject": ex.subject,
            "difficulty": ex.difficulty,
            "sentence": ex.sentence_template,
            "pool": word_pool,
            "answers": correct_arr, # We send answers to frontend so it can validate instantly without API overhead per drag
            "explanation": ex.explanation
        })

    return results


class SkillSubmitRequest(BaseModel):
    subject: str
    total_exercises: int
    correct_exercises: int
    failed_attempts: int

def get_rank_name(level: int) -> str:
    """Helper function to get rank name from level without modifying user object."""
    if level >= 50: return "Master"
    elif level >= 40: return "Expert"
    elif level >= 30: return "Pro"
    elif level >= 20: return "Advanced"
    elif level >= 10: return "Intermediate"
    return "Beginner"

@router.post("/submit")
async def submit_skill_lab(data: SkillSubmitRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Submits a final payload after finishing a Skill Lab run.
    Grants XP and checks leveling up.
    """
    # ── Cálculo XP v2 ────────────────────────────────────────────────
    # XP bruto = ejercicios correctos × 180
    # Penalización = intentos fallidos × 25 (pero nunca baja del mínimo garantizado)
    # Mínimo garantizado = ejercicios correctos × 40
    # Bonus perfect run (todos correctos, 0 errores) = +150 XP
    # ─────────────────────────────────────────────────────────────────
    gross_xp    = data.correct_exercises * XP_PER_EXERCISE
    penalty     = data.failed_attempts   * XP_PENALTY_PER_FAIL
    guaranteed  = data.correct_exercises * MIN_XP_PER_EXERCISE
    net_xp      = max(guaranteed, gross_xp - penalty)

    # Bonus por racha perfecta
    if data.correct_exercises == data.total_exercises and data.failed_attempts == 0:
        net_xp += XP_PERFECT_BONUS

    old_level = current_user.level
    current_user.add_xp(net_xp)
    leveled_up = False
    if current_user.level > old_level:
        leveled_up = True

    new_level = current_user.level
    rank_name = get_rank_name(new_level)

    if leveled_up:
        # Send Level Up Notification
        await manager.send_personal_message({
            "type": "LEVEL_UP",
            "title": "¡NIVEL ALCANZADO!",
            "message": f"Has subido al nivel {new_level} ({rank_name})",
            "level": new_level,
            "rank": rank_name
        }, current_user.id)

    # If perfect score, send a specific notification
    if data.correct_exercises == data.total_exercises and data.failed_attempts == 0:
        await manager.send_personal_message({
            "type": "NOTIFICATION",
            "title": "¡ENLACE PERFECTO!",
            "message": f"Has completado el Skill Lab de {data.subject} sin errores.",
            "severity": "success"
        }, current_user.id)

    db.commit()

    return {
        "success": True,
        "xp_gained": net_xp,
        "leveled_up": leveled_up,
        "new_level": new_level,
        "new_rank": rank_name
    }
