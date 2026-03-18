from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db, Question, Resource, User
from auth import require_management
from schemas import QuestionOut, QuestionCreate, ResourceOut, ResourceCreate, PaginatedQuestionOut
from utils.pagination import paginate_query

router = APIRouter(prefix="/admin", tags=["Admin Content"])

# --- QUESTIONS ---

@router.get("/questions", response_model=PaginatedQuestionOut)
def list_questions(
    subject: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """
    (Admin/Docente) Devuelve preguntas con paginación.
    Límite por defecto 100; el cliente puede subir hasta 500.
    """
    limit = min(limit, 500)  # cap to avoid accidental overload
    query = db.query(Question).order_by(Question.id.desc())
    if subject:
        query = query.filter(Question.subject == subject)
    return paginate_query(query, limit, offset)

@router.post("/questions", response_model=QuestionOut)
def create_question(
    data: QuestionCreate,
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Crea una nueva pregunta directamente en el banco."""
    q_data = data.dict()
    if q_data.get("correct_answer"):
        q_data["correct_answer"] = q_data["correct_answer"].lower()
    q = Question(**q_data)
    if hasattr(q, 'approved'):
        q.approved = True

    db.add(q)
    db.commit()
    db.refresh(q)
    return q

@router.post("/questions/bulk")
def create_questions_bulk(
    data: List[QuestionCreate],
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Importa un lote de preguntas desde CSV o JSON."""
    count = 0
    for q_data in data:
        q_dict = q_data.dict()
        if q_dict.get("correct_answer"):
            q_dict["correct_answer"] = q_dict["correct_answer"].lower()
        q = Question(**q_dict)
        if hasattr(q, 'approved'):
            q.approved = True
        db.add(q)
        count += 1
    
    db.commit()
    return {"message": "Importación completada", "imported_count": count}

@router.post("/questions/normalize")
def normalize_questions(
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """
    (Admin) One-shot maintenance: normalises all correct_answer values to lowercase,
    removes leading/trailing whitespace from text/options, and returns a quality report.
    Safe to run multiple times (idempotent).
    """
    all_questions = db.query(Question).all()

    fixed_case = 0
    bad_answer_ids = []
    null_answer_ids = []
    empty_field_ids = []

    for q in all_questions:
        changed = False

        # --- Normalize correct_answer ---
        if q.correct_answer is None:
            null_answer_ids.append(q.id)
        else:
            norm = q.correct_answer.strip().lower()
            if norm != q.correct_answer:
                q.correct_answer = norm
                changed = True
                fixed_case += 1
            if norm not in ('a', 'b', 'c', 'd'):
                bad_answer_ids.append(q.id)

        # --- Strip whitespace from text / options ---
        for field in ('text', 'option_a', 'option_b', 'option_c', 'option_d', 'explanation'):
            val = getattr(q, field, None)
            if val is not None and val != val.strip():
                setattr(q, field, val.strip())
                changed = True

        # --- Check for empty mandatory fields ---
        for field in ('text', 'option_a', 'option_b', 'option_c', 'option_d'):
            val = getattr(q, field, None)
            if not val:
                empty_field_ids.append(q.id)
                break

    db.commit()

    return {
        "total_questions": len(all_questions),
        "fixed_case_count": fixed_case,
        "still_bad_answer_ids": bad_answer_ids,
        "null_answer_ids": null_answer_ids,
        "empty_field_question_ids": list(set(empty_field_ids)),
        "message": (
            f"Normalización completada. "
            f"{fixed_case} respuesta(s) convertida(s) a minúscula. "
            f"{len(bad_answer_ids)} pregunta(s) con respuesta inválida (revisar manualmente). "
            f"{len(null_answer_ids)} pregunta(s) sin respuesta (revisar manualmente)."
        ),
    }


@router.put("/questions/{question_id}", response_model=QuestionOut)
def update_question(
    question_id: int,
    data: QuestionCreate,
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Actualiza una pregunta existente en el banco."""
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    update_data = data.dict()
    # Normalise correct_answer to lowercase so display always matches
    if "correct_answer" in update_data and update_data["correct_answer"]:
        update_data["correct_answer"] = update_data["correct_answer"].lower()
    for field, value in update_data.items():
        setattr(q, field, value)
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