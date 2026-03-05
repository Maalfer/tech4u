from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import random

from database import get_db, Question, User, UserError, UserProgress, TestSession, UserItem
from schemas import TestSubmit, TestResult
from auth import get_current_user
from .achievements import award_achievement

router = APIRouter(prefix="/tests", tags=["Tests"])

# ── Item Catalog ─────────────────────────────────────────────────────────────
ITEM_CATALOG = [
    # Comunes
    {"key": "cable_rj45",         "name": "Cable RJ45",              "emoji": "🔌", "rarity": "comun",      "desc": "Un cable crimpado a mano. Casi funciona."},
    {"key": "usb_random",         "name": "USB sin etiquetar",        "emoji": "💾", "rarity": "comun",      "desc": "No sabes que hay dentro. Mejor no conectarlo."},
    {"key": "post_it_config",     "name": "Post-it de Config",        "emoji": "📝", "rarity": "comun",      "desc": "Garabatos ilegibles que eran comandos de red."},
    {"key": "keyboard_basic",     "name": "Teclado de Membrana",      "emoji": "⌨️", "rarity": "comun",      "desc": "El arma del principiante."},
    {"key": "monitor_old",        "name": "Monitor CRT",              "emoji": "🖥️", "rarity": "comun",      "desc": "Pesa 20 kg. Pero a que resolucion llega?"},
    {"key": "manual_asir",        "name": "Manual ASIR Fotocopiado",  "emoji": "📚", "rarity": "comun",      "desc": "Subrayado en 5 colores por generaciones anteriores."},
    # Raros
    {"key": "switch_managed",     "name": "Switch Gestionable",       "emoji": "🔀", "rarity": "raro",       "desc": "VLANs ilimitadas. Casi ilimitadas."},
    {"key": "keyboard_mech",      "name": "Teclado Mecanico",         "emoji": "⌨️", "rarity": "raro",       "desc": "Cherry MX Red. Se oye desde el pasillo."},
    {"key": "vpn_scroll",         "name": "Pergamino VPN",            "emoji": "📜", "rarity": "raro",       "desc": "Conecta dos redes remotas sin que nadie lo sepa."},
    {"key": "pendrive_boot",      "name": "Pendrive Booteable",       "emoji": "💾", "rarity": "raro",       "desc": "Tiene Kali, Ubuntu y algo mas raro."},
    {"key": "glasses_filter",     "name": "Gafas Filtro Azul",        "emoji": "🕶️", "rarity": "raro",       "desc": "Para los 14 monitores que tienes a la vez."},
    # Epicos
    {"key": "firewall_elite",     "name": "Firewall de Elite",        "emoji": "🔥", "rarity": "epico",      "desc": "Bloquea hasta los paquetes que no existen."},
    {"key": "server_rack",        "name": "Rack de Servidores",       "emoji": "🖥️", "rarity": "epico",      "desc": "Temperatura: 5°C. Ruido: ensordecedor."},
    {"key": "script_bash",        "name": "Script Automatizador",     "emoji": "📝", "rarity": "epico",      "desc": "Un script que hace lo que 10 admins tardarian un dia."},
    {"key": "cert_cisco",         "name": "Certificado Cisco",        "emoji": "🏅", "rarity": "epico",      "desc": "Vale maximo? Ya mismo entra en vigor."},
    # Legendarios
    {"key": "ssh_key_god",        "name": "Clave SSH del Root",       "emoji": "🔑", "rarity": "legendario", "desc": "Acceso total a cualquier servidor del planeta Tierra."},
    {"key": "keyboard_legendary", "name": "Teclado Legendario",       "emoji": "⌨️", "rarity": "legendario", "desc": "Cada pulsacion ejecuta comandos perfectos."},
    {"key": "bgp_tome",           "name": "Tomo del BGP",             "emoji": "📚", "rarity": "legendario", "desc": "El libro que solo 12 personas en el mundo entienden."},
    {"key": "quantum_drink",      "name": "Bebida Cuantica",          "emoji": "⚗️", "rarity": "legendario", "desc": "+999 Velocidad Mental. Sabor: electrones."},
]

_RARITY_WEIGHTS = {"comun": 60, "raro": 25, "epico": 12, "legendario": 3}

def _roll_item_drop():
    """Retorna un item aleatorio con 15% de probabilidad, None si no hay drop."""
    if random.random() > 0.15:
        return None
    pool_items = ITEM_CATALOG
    weights = [_RARITY_WEIGHTS.get(i["rarity"], 10) for i in pool_items]
    return random.choices(pool_items, weights=weights, k=1)[0]




# =====================================================
# GET QUESTIONS (TEST NORMAL / EXAM)
# =====================================================
@router.get("/questions")
def get_questions(
    subject: str = None,
    limit: int = 20,
    difficulty: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import func
    query = db.query(Question).filter(Question.approved == True)
    if subject and subject.lower() != "general":
        query = query.filter(Question.subject == subject)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    
    # Shuffle results
    questions = query.order_by(func.random()).limit(limit).all()
    return questions


# =====================================================
# GET FAILED QUESTIONS (TEST DE ERRORES)
# =====================================================
@router.get("/failed")
def get_failed_questions(
    subject: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import func
    query = (
        db.query(Question)
        .join(UserError, Question.id == UserError.question_id)
        .filter(UserError.user_id == current_user.id)
    )

    if subject:
        query = query.filter(Question.subject == subject)

    questions = query.order_by(func.random()).limit(limit).all()

    return questions


# =====================================================
# SUBMIT TEST
# =====================================================
@router.post("/submit", response_model=TestResult)
async def submit_test(
    payload: TestSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Procesa las respuestas, gestiona la tabla de errores y 
    devuelve la revisión completa para el frontend.
    """

    if not payload.answers:
        raise HTTPException(status_code=400, detail="No se enviaron respuestas.")

    detailed_results = []
    correct_count = 0
    total_time = 0.0

    try:
        for ans in payload.answers:
            question = db.query(Question).filter(Question.id == ans.question_id).first()
            if not question:
                continue

            selected = str(ans.selected_answer).lower()
            correct_val = str(question.correct_answer).lower()
            is_correct = selected == correct_val

            total_time += ans.time_spent_seconds or 0

            if is_correct:
                correct_count += 1
                db.query(UserError).filter(
                    UserError.user_id == current_user.id,
                    UserError.question_id == question.id,
                ).delete()
            else:
                existing_error = db.query(UserError).filter(
                    UserError.user_id == current_user.id,
                    UserError.question_id == question.id,
                ).first()

                if existing_error:
                    existing_error.fail_count += 1
                    existing_error.last_failed = datetime.utcnow()
                else:
                    db.add(UserError(
                        user_id=current_user.id,
                        question_id=question.id,
                        fail_count=1,
                    ))

            detailed_results.append({
                "question_id": question.id,
                "question_text": question.text,
                "option_a": question.option_a,
                "option_b": question.option_b,
                "option_c": question.option_c,
                "option_d": question.option_d,
                "selected_answer": ans.selected_answer,
                "correct_answer": question.correct_answer,
                "correct": is_correct,
                "explanation": question.explanation or "Sin explicación técnica disponible."
            })

        # ==============================================
        # ACTUALIZACIÓN DE PROGRESO LECTIVO
        # ==============================================
        progress = db.query(UserProgress).filter(
            UserProgress.user_id == current_user.id,
            UserProgress.subject == payload.subject,
        ).first()

        if progress:
            progress.total_answered += len(payload.answers)
            progress.correct_answers += correct_count
            progress.time_invested_minutes += total_time / 60
        else:
            db.add(UserProgress(
                user_id=current_user.id,
                subject=payload.subject,
                total_answered=len(payload.answers),
                correct_answers=correct_count,
                time_invested_minutes=total_time / 60,
            ))

        # ==============================================
        # ACTUALIZACIÓN DE GAMIFICACIÓN (RPG)
        # ==============================================
        wrong_count = len(payload.answers) - correct_count
        
        # Nueva logica: Solo gana xp si es EXAMEN y hay 40 preguntas
        gained_xp = 0
        if payload.test_mode and payload.test_mode.lower() == "examen" and len(payload.answers) == 40:
            gained_xp = (correct_count * 15) - (wrong_count * 5)
        
        current_user.xp = max(0, (current_user.xp or 0) + gained_xp)
        
        leveled_up = False
        new_level = current_user.level or 1
        
        next_level_xp = new_level * 500
        while current_user.xp >= next_level_xp:
            current_user.xp -= next_level_xp
            new_level += 1
            current_user.level = new_level
            leveled_up = True
            next_level_xp = new_level * 500

        # Award Achievements
        await award_achievement(current_user.id, "Primer Paso", db)
        
        if accuracy == 100:
            await award_achievement(current_user.id, "Maestro de Redes", db)
            
        if payload.mode == "errors":
            await award_achievement(current_user.id, "Cazador de Errores", db)

        db.commit()

        total_questions = len(payload.answers)
        accuracy = (correct_count / total_questions * 100) if total_questions > 0 else 0

        # ── Item Drop (15% si el alumno aprueba >= 50%) ──────────────────
        item_drop = None
        if accuracy >= 50:
            dropped = _roll_item_drop()
            if dropped:
                new_item = UserItem(
                    user_id=current_user.id,
                    item_key=dropped["key"],
                    item_name=dropped["name"],
                    item_emoji=dropped["emoji"],
                    item_rarity=dropped["rarity"],
                    item_description=dropped["desc"],
                )
                db.add(new_item)
                db.commit()
                item_drop = {
                    "id": new_item.id,
                    "name": dropped["name"],
                    "emoji": dropped["emoji"],
                    "rarity": dropped["rarity"],
                    "description": dropped["desc"],
                }

        return {
            "total": len(payload.answers),
            "correct": correct_count,
            "accuracy": accuracy,
            "xp_gained": gained_xp,
            "leveled_up": leveled_up,
            "new_level": new_level,
            "detailed_results": detailed_results,
            "item_drop": item_drop,
        }

    except Exception as e:
        db.rollback()
        print(f"CRITICAL ERROR EN SUBMIT: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno procesando el test.")


# =====================================================
# GET USER INVENTORY
# =====================================================
@router.get("/inventory")
def get_user_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = (
        db.query(UserItem)
        .filter(UserItem.user_id == current_user.id)
        .order_by(UserItem.obtained_at.desc())
        .all()
    )
    return [
        {
            "id": it.id,
            "item_key": it.item_key,
            "name": it.item_name,
            "emoji": it.item_emoji,
            "rarity": it.item_rarity,
            "description": it.item_description,
            "obtained_at": it.obtained_at.isoformat(),
        }
        for it in items
    ]


# =====================================================
# GET TEST HISTORY
# =====================================================
@router.get("/history")
def get_test_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(TestSession)
        .filter(TestSession.user_id == current_user.id)
        .order_by(TestSession.completed_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": s.id,
            "subject": s.subject,
            "mode": s.mode,
            "total": s.total,
            "correct": s.correct,
            "accuracy": s.accuracy,
            "xp_gained": s.xp_gained,
            "duration_seconds": s.duration_seconds,
            "completed_at": s.completed_at.isoformat(),
        }
        for s in sessions
    ]


# =====================================================
# GET QUESTION COUNTS PER SUBJECT
# =====================================================
@router.get("/counts")
def get_question_counts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import func
    rows = (
        db.query(Question.subject, func.count(Question.id).label("count"))
        .filter(Question.approved == True)
        .group_by(Question.subject)
        .all()
    )
    return {row.subject: row.count for row in rows}