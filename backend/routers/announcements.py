from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from database import get_db, Announcement, QuestionSuggestion, User, Question, AnnouncementRead
from schemas import (
    AnnouncementCreate, AnnouncementOut, 
    SuggestionCreate, SuggestionOut, 
    QuestionCreate
)
from auth import get_current_user, require_admin

router = APIRouter(prefix="/announcements", tags=["Announcements & Suggestions"])

# ── BROADCAST READ/WRITE ─────────────────────────────────────────────────────

@router.post("/", response_model=AnnouncementOut)
def create_announcement(
    data: AnnouncementCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """(Admin) Crea un anuncio que se mostrará a todos los alumnos como pop-up."""
    new_ann = Announcement(content=data.content)
    db.add(new_ann)
    db.commit()
    db.refresh(new_ann)
    return new_ann


@router.get("/admin/all")
def get_all_announcements_admin(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """(Admin) Lista todos los anuncios con sus IDs para gestión."""
    anns = db.query(Announcement).order_by(Announcement.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "content": a.content,
            "is_active": a.is_active,
            "created_at": a.created_at.isoformat(),
        }
        for a in anns
    ]


@router.patch("/{announcement_id}/toggle")
def toggle_announcement(
    announcement_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """(Admin) Activa o desactiva un anuncio."""
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    ann.is_active = not ann.is_active
    db.commit()
    return {"id": ann.id, "is_active": ann.is_active}


@router.delete("/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """(Admin) Elimina un anuncio permanentemente."""
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    # Remove read records
    db.query(AnnouncementRead).filter(AnnouncementRead.announcement_id == announcement_id).delete()
    db.delete(ann)
    db.commit()
    return {"message": "Eliminado"}


@router.get("/active", response_model=List[AnnouncementOut])
def get_active_announcements(db: Session = Depends(get_db)):
    """(Público logueado) Recupera SOLO el último anuncio activo de las últimas 24 horas."""
    cutoff = datetime.utcnow() - timedelta(hours=24)
    ann = db.query(Announcement).filter(
        Announcement.is_active == True,
        Announcement.created_at >= cutoff
    ).order_by(Announcement.created_at.desc()).first()
    return [ann] if ann else []


@router.get("/history", response_model=List[AnnouncementOut])
def get_announcements_history(db: Session = Depends(get_db)):
    """(Público logueado) Historial de todos los anuncios activos para la página de Noticias."""
    return db.query(Announcement).filter(
        Announcement.is_active == True
    ).order_by(Announcement.created_at.desc()).limit(50).all()


@router.get("/unread")
def get_unread_announcements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Devuelve el anuncio activo más reciente de las últimas 24h que el usuario NO ha leído todavía.
    Pensado para el pop-up en el dashboard al iniciar sesión.
    """
    cutoff = datetime.utcnow() - timedelta(hours=24)
    # Get only the most recent active announcement in the last 24h
    latest = db.query(Announcement).filter(
        Announcement.is_active == True,
        Announcement.created_at >= cutoff
    ).order_by(Announcement.created_at.desc()).first()

    if not latest:
        return []

    # Check if user already read it
    already_read = db.query(AnnouncementRead).filter(
        AnnouncementRead.user_id == current_user.id,
        AnnouncementRead.announcement_id == latest.id
    ).first()

    if already_read:
        return []

    return [{"id": latest.id, "content": latest.content, "created_at": latest.created_at.isoformat()}]


@router.post("/mark-read/{announcement_id}")
def mark_announcement_read(
    announcement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marca un anuncio específico como leído por el usuario actual."""
    existing = db.query(AnnouncementRead).filter(
        AnnouncementRead.user_id == current_user.id,
        AnnouncementRead.announcement_id == announcement_id
    ).first()
    if not existing:
        db.add(AnnouncementRead(user_id=current_user.id, announcement_id=announcement_id))
        db.commit()
    return {"ok": True}


# --- RUTAS PARA SUGERENCIAS (ALUMNOS) ---

@router.post("/suggest", response_model=SuggestionOut)
def submit_suggestion(
    data: SuggestionCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """(Alumno) Envía una propuesta de pregunta para ser revisada por el Admin."""
    new_sug = QuestionSuggestion(
        user_id=current_user.id,
        subject=data.subject,
        text=data.text,
        status="pendiente"
    )
    db.add(new_sug)
    db.commit()
    db.refresh(new_sug)
    return new_sug

@router.get("/admin/suggestions", response_model=List[SuggestionOut])
def get_all_suggestions(
    _: User = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    """(Admin) Lista todas las sugerencias que aún no han sido procesadas."""
    return db.query(QuestionSuggestion).filter(
        QuestionSuggestion.status == "pendiente"
    ).order_by(QuestionSuggestion.created_at.desc()).all()

# --- NUEVO: INTEGRACIÓN DE SUGERENCIA AL BANCO DE PREGUNTAS ---

@router.post("/suggestions/{suggestion_id}/approve")
def approve_and_integrate_suggestion(
    suggestion_id: int,
    data: QuestionCreate, 
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    (Admin) Toma una sugerencia, la desarrolla como pregunta oficial y 
    la inyecta en el banco de preguntas, marcando la sugerencia como aprobada.
    """
    # 1. Buscar la sugerencia original
    suggestion = db.query(QuestionSuggestion).filter(QuestionSuggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=404, detail="Sugerencia no encontrada")

    # 2. Crear la pregunta oficial en el banco de datos
    new_q = Question(
        subject=data.subject,
        text=data.text,
        option_a=data.option_a,
        option_b=data.option_b,
        option_c=data.option_c,
        option_d=data.option_d,
        correct_answer=data.correct_answer,
        difficulty=data.difficulty,
        explanation=data.explanation
    )
    db.add(new_q)
    
    # 3. Marcar la sugerencia como procesada/aprobada para que salga del buzón
    suggestion.status = "aprobada"
    
    db.commit()
    return {"message": "Pregunta integrada con éxito y sugerencia cerrada"}

# En backend/routers/announcements.py

@router.get("/my-suggestions", response_model=List[SuggestionOut])
def get_user_suggestions(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Permite al alumno ver el estado de sus propias propuestas."""
    return db.query(QuestionSuggestion).filter(
        QuestionSuggestion.user_id == current_user.id
    ).order_by(QuestionSuggestion.created_at.desc()).all()