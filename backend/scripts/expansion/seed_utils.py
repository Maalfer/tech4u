import os
import sys
from sqlalchemy.orm import Session
from sqlalchemy import func

# Asegurar que el root del backend esté en el path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from database import SessionLocal, Question

def sync_subject_questions(subject: str, questions_data: list):
    """
    Sincroniza una lista de preguntas para una materia específica.
    Evita duplicados comparando el texto de la pregunta (sin distinguir mayúsculas/minúsculas).
    """
    db: Session = SessionLocal()
    print(f"\n--- Sincronizando materia: {subject} ---")
    
    added_count = 0
    updated_count = 0
    errors = 0

    for i, data in enumerate(questions_data):
        try:
            # Validación básica de campos
            required = ["text", "option_a", "option_b", "option_c", "option_d", "correct_answer"]
            if not all(k in data for k in required):
                print(f"  [Error] Falta campo obligatorio en pregunta #{i+1}")
                errors += 1
                continue

            # Buscar si ya existe una pregunta con el mismo texto (case-insensitive)
            # Esto es una simplificación; en bases grandes usaríamos un hash o ID único.
            existing = db.query(Question).filter(
                func.lower(Question.text) == data["text"].lower().strip(),
                Question.subject == subject
            ).first()

            if existing:
                # Actualizar campos por si acaso el contenido ha mejorado
                existing.option_a = data["option_a"]
                existing.option_b = data["option_b"]
                existing.option_c = data["option_c"]
                existing.option_d = data["option_d"]
                existing.correct_answer = data["correct_answer"].lower()
                existing.explanation = data.get("explanation", existing.explanation)
                existing.difficulty = data.get("difficulty", existing.difficulty)
                updated_count += 1
            else:
                # Crear nueva pregunta
                new_q = Question(
                    subject=subject,
                    text=data["text"].strip(),
                    option_a=data["option_a"].strip(),
                    option_b=data["option_b"].strip(),
                    option_c=data["option_c"].strip(),
                    option_d=data["option_d"].strip(),
                    correct_answer=data["correct_answer"].lower().strip(),
                    explanation=data.get("explanation", ""),
                    difficulty=data.get("difficulty", "medium"),
                    approved=True
                )
                db.add(new_q)
                added_count += 1

            # Commit cada X registros para no saturar si la lista es enorme
            if (i + 1) % 50 == 0:
                db.commit()

        except Exception as e:
            print(f"  [Error] Pregunta #{i+1}: {e}")
            errors += 1
            db.rollback()

    db.commit()
    db.close()
    
    print(f"  {added_count} Añadidas, {updated_count} Actualizadas, {errors} Errores.")
    return added_count, updated_count, errors
