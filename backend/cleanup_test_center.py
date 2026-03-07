import os
import sys
from sqlalchemy import text
from database import SessionLocal, Question

def cleanup():
    db = SessionLocal()
    try:
        print("--- Iniciando limpieza de Test Center ---")
        
        # 1. Normalizar correct_answer a mayúsculas
        print("Normalizando respuestas a mayúsculas...")
        questions = db.query(Question).all()
        normalized_count = 0
        for q in questions:
            if q.correct_answer and q.correct_answer != q.correct_answer.upper():
                q.correct_answer = q.correct_answer.upper()
                normalized_count += 1
        
        # 2. Eliminar duplicados basándose en el texto de la pregunta (ignorando espacios y mayúsculas)
        print("Detectando y eliminando duplicados...")
        all_questions = db.query(Question).order_by(Question.id).all()
        seen_texts = {}
        deleted_count = 0
        
        from database import UserError, QuestionSuggestion

        for q in all_questions:
            clean_text = q.text.strip().lower()
            if clean_text in seen_texts:
                original_id = seen_texts[clean_text]
                
                # Transferir referencias de errores a la pregunta original
                db.query(UserError).filter(UserError.question_id == q.id).update({UserError.question_id: original_id})
                
                # Transferir sugerencias si las hubiera (opcional pero seguro)
                try:
                    db.query(QuestionSuggestion).filter(QuestionSuggestion.text == q.text).update({QuestionSuggestion.text: all_questions[0].text}) # simplificado
                except:
                    pass

                db.delete(q)
                deleted_count += 1
            else:
                seen_texts[clean_text] = q.id
        
        db.commit()
        print(f"\nResultados:")
        print(f"- Preguntas normalizadas: {normalized_count}")
        print(f"- Preguntas duplicadas eliminadas: {deleted_count}")
        
        # 3. Reportar explicaciones vacías
        empty_expl = db.query(Question).filter(
            (Question.explanation == None) | (Question.explanation == '') | (text("length(explanation) < 10"))
        ).all()
        
        if empty_expl:
            print(f"\n--- ALERTA: {len(empty_expl)} preguntas tienen una explicación deficiente ---")
            for q in empty_expl:
                print(f"ID: {q.id} | Sujeto: {q.subject} | Texto: {q.text[:60]}...")
        
    except Exception as e:
        db.rollback()
        print(f"Error durante la limpieza: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    cleanup()
