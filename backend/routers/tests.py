from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db, User, Question, UserError, UserProgress, Ticket 
from auth import get_current_user
from schemas import QuestionOut, TestSubmit, TestResult, AnswerResult, TicketCreate 

router = APIRouter(prefix="/tests", tags=["Tests"])

@router.get("/questions", response_model=List[QuestionOut])
def get_questions(
    subject: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get questions for a given subject (Normal or Exam mode)."""
    query = db.query(Question)
    if subject:
        query = query.filter(Question.subject == subject)
    questions = query.order_by(Question.id).limit(limit).all()
    return questions

@router.get("/failed", response_model=List[QuestionOut])
def get_failed_questions(
    subject: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return questions the user has previously failed (Error-Review mode)."""
    error_ids_query = db.query(UserError.question_id).filter(UserError.user_id == current_user.id)
    questions_query = db.query(Question).filter(Question.id.in_(error_ids_query))
    if subject:
        questions_query = questions_query.filter(Question.subject == subject)
    return questions_query.all()

@router.post("/submit", response_model=TestResult)
def submit_test(
    payload: TestSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Process submitted answers, update error table and progress stats."""
    results: List[AnswerResult] = []
    correct_count = 0
    total_time = 0.0

    for ans in payload.answers:
        question = db.query(Question).filter(Question.id == ans.question_id).first()
        if not question:
            continue

        is_correct = ans.selected_answer.lower() == question.correct_answer.lower()
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

        results.append(AnswerResult(
            question_id=question.id,
            correct=is_correct,
            correct_answer=question.correct_answer,
            explanation=question.explanation,
        ))

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

    db.commit()

    accuracy = round(correct_count / len(payload.answers) * 100, 1) if payload.answers else 0.0
    return TestResult(
        total=len(payload.answers),
        correct=correct_count,
        accuracy=accuracy,
        results=results,
    )

@router.get("/subjects")
def get_subjects(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """Return list of available subjects."""
    subjects = db.query(Question.subject).distinct().all()
    return [s[0] for s in subjects]

# --- RUTA PARA REPORTE DE ERRORES CORREGIDA (MÁS INFO) ---
@router.post("/report-error")
def report_error(
    data: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Recibe reporte de error, busca info de la pregunta y guarda ticket."""
    try:
        # Intentamos extraer el ID de la cadena "Error en Pregunta ID: X"
        try:
            q_id = int(data.subject.split(":")[-1].strip())
            pregunta = db.query(Question).filter(Question.id == q_id).first()
        except:
            pregunta = None

        # Si encontramos la pregunta, enriquecemos el asunto del ticket
        if pregunta:
            asunto_enriquecido = f"[{pregunta.subject.upper()}] Pregunta #{pregunta.id}: {pregunta.text[:50]}..."
        else:
            asunto_enriquecido = data.subject

        new_ticket = Ticket(
            user_id=current_user.id,
            subject=asunto_enriquecido,
            description=data.description,
            status="pendiente"
        )
        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)
        return {"message": "Reporte enviado con éxito."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en servidor: {str(e)}")