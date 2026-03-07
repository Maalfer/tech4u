import json
import sys
from sqlalchemy import func
from database import SessionLocal, Question

def bulk_insert_questions(file_paths):
    db = SessionLocal()
    try:
        # Load existing questions to prevent duplicates
        existing_texts = {q.text.strip().lower() for q in db.query(Question.text).all()}
        
        all_new_questions = []
        for path in file_paths:
            with open(path, 'r') as f:
                all_new_questions.extend(json.loads(f.read()))
        
        inserted_count = 0
        skipped_count = 0
        
        for q_data in all_new_questions:
            clean_text = q_data['text'].strip().lower()
            if clean_text in existing_texts:
                skipped_count += 1
                continue
            
            new_q = Question(
                subject=q_data['subject'],
                difficulty=q_data['difficulty'],
                text=q_data['text'],
                option_a=q_data['option_a'],
                option_b=q_data['option_b'],
                option_c=q_data['option_c'],
                option_d=q_data['option_d'],
                correct_answer=q_data['correct_answer'],
                explanation=q_data['explanation'],
                approved=q_data.get('approved', True)
            )
            db.add(new_q)
            existing_texts.add(clean_text)
            inserted_count += 1
            
        db.commit()
        print(f"--- Proceso Finalizado ---")
        print(f"Insertadas: {inserted_count}")
        print(f"Saltadas (Duplicadas): {skipped_count}")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        paths = sys.argv[1:]
    else:
        # Fallback para el primer lote si no hay argumentos
        paths = [
            'new_test_questions_batch1.json',
            'new_test_questions_batch2.json'
        ]
    bulk_insert_questions(paths)
