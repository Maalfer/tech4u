from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db, Question, Resource, User
from auth import require_management
from schemas import QuestionOut, QuestionCreate, ResourceOut, ResourceCreate

router = APIRouter(prefix="/admin", tags=["Admin Content"])

# --- QUESTIONS ---

@router.get("/questions", response_model=List[QuestionOut])
def list_questions(
    subject: Optional[str] = None, # Parámetro opcional para filtrar
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """
    (Admin/Docente) Devuelve preguntas. 
    Si se proporciona 'subject', filtra por esa asignatura.
    """
    query = db.query(Question)
    if subject:
        query = query.filter(Question.subject == subject)
    return query.all()

@router.post("/questions", response_model=QuestionOut)
def create_question(
    data: QuestionCreate,
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Crea una nueva pregunta directamente en el banco."""
    q = Question(**data.dict())
    # Aseguramos que las preguntas creadas por admin estén aprobadas por defecto
    if hasattr(q, 'approved'):
        q.approved = True
        
    db.add(q)
    db.commit()
    db.refresh(q)
    return q

@router.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Elimina una pregunta del mainframe."""
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    db.delete(q)
    db.commit()
    return {"message": "Pregunta eliminada del sistema"}

# --- RESOURCES ---

@router.post("/resources", response_model=ResourceOut)
def create_resource(
    data: ResourceCreate,
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Crea un nuevo recurso educativo."""
    r = Resource(**data.dict())
    db.add(r)
    db.commit()
    db.refresh(r)
    return r

@router.delete("/resources/{resource_id}")
def delete_resource(
    resource_id: int,
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Elimina un recurso (PDF/Link)."""
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    db.delete(r)
    db.commit()
    return {"message": "Recurso eliminado"}