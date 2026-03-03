from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from database import get_db, Question, User, UserError, UserProgress
from schemas import TestSubmit, TestResult
from auth import get_current_user

router = APIRouter(prefix="/tests", tags=["Tests"])


# =====================================================
# GET QUESTIONS (TEST NORMAL / EXAM)
# =====================================================
@router.get("/questions")
def get_questions(
    subject: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Question).filter(Question.approved == True)

    if subject:
        query = query.filter(Question.subject == subject)

    questions = query.limit(limit).all()

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
    query = (
        db.query(Question)
        .join(UserError, Question.id == UserError.question_id)
        .filter(UserError.user_id == current_user.id)
    )

    if subject:
        query = query.filter(Question.subject == subject)

    questions = query.limit(limit).all()

    return questions


# =====================================================
# SUBMIT TEST
# =====================================================
@router.post("/submit", response_model=TestResult)
def submit_test(
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
        # ACTUALIZACIÓN DE PROGRESO
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

        db.commit()

        accuracy = round((correct_count / len(payload.answers)) * 100, 1)

        return {
            "total": len(payload.answers),
            "correct": correct_count,
            "accuracy": accuracy,
            "detailed_results": detailed_results,
        }

    except Exception as e:
        db.rollback()
        print(f"CRITICAL ERROR EN SUBMIT: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno procesando el test.")