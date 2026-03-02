from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Announcement, QuestionSuggestion, User, Question # Importamos Question
from schemas import (
    AnnouncementCreate, AnnouncementOut, 
    SuggestionCreate, SuggestionOut, 
    QuestionCreate # Usamos el esquema de pregunta para la integración
)
from auth import get_current_user, require_admin

router = APIRouter(prefix="/announcements", tags=["Announcements & Suggestions"])

# --- RUTAS PARA ANUNCIOS (BROADCAST) ---

@router.post("/", response_model=AnnouncementOut)
def create_announcement(
    data: AnnouncementCreate, 
    _: User = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    """(Admin) Crea un anuncio neón que se mostrará a todos los alumnos."""
    new_ann = Announcement(content=data.content)
    db.add(new_ann)
    db.commit()
    db.refresh(new_ann)
    return new_ann

@router.get("/active", response_model=List[AnnouncementOut])
def get_active_announcements(db: Session = Depends(get_db)):
    """(Público logueado) Recupera los últimos 3 anuncios activos para el Dashboard."""
    return db.query(Announcement).filter(
        Announcement.is_active == True
    ).order_by(Announcement.created_at.desc()).limit(3).all()

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