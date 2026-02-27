from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Question, Resource, User
from auth import require_management
from schemas import QuestionOut, QuestionCreate, ResourceOut, ResourceCreate

router = APIRouter(prefix="/admin", tags=["Admin Content"])

# --- QUESTIONS ---
@router.get("/questions", response_model=List[QuestionOut])
def list_questions(
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Devuelve todas las preguntas con sus respuestas correctas."""
    return db.query(Question).all()

@router.post("/questions", response_model=QuestionOut)
def create_question(
    data: QuestionCreate,
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Crea una nueva pregunta."""
    q = Question(**data.dict())
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
    """(Admin/Docente) Elimina una pregunta."""
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    db.delete(q)
    db.commit()
    return {"message": "Pregunta eliminada"}

# --- RESOURCES ---
@router.post("/resources", response_model=ResourceOut)
def create_resource(
    data: ResourceCreate,
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Crea un nuevo recurso."""
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
    """(Admin/Docente) Elimina un recurso."""
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    db.delete(r)
    db.commit()
    return {"message": "Recurso eliminado"}
