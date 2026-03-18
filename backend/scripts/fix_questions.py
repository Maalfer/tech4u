
from database import SessionLocal, Question
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_questions():
    db = SessionLocal()
    try:
        questions = db.query(Question).all()
        fixed_count = 0
        skipped_count = 0
        
        for q in questions:
            c = q.correct_answer.lower().strip()
            
            # If it's already a key, skip
            if c in ['a', 'b', 'c', 'd']:
                continue
                
            options = {
                'a': q.option_a.lower().strip() if q.option_a else None,
                'b': q.option_b.lower().strip() if q.option_b else None,
                'c': q.option_c.lower().strip() if q.option_c else None,
                'd': q.option_d.lower().strip() if q.option_d else None
            }
            
            new_key = None
            for k, v in options.items():
                if v == c:
                    new_key = k
                    break
            
            if new_key:
                q.correct_answer = new_key
                fixed_count += 1
                if fixed_count % 50 == 0:
                    logger.info(f"Fixed {fixed_count} questions...")
            else:
                skipped_count += 1
                # If we can't match it, it's a real anomaly (e.g. text changed but answer not updated)
                # We log it but don't touch it to avoid making it worse
                if skipped_count < 10:
                    logger.warning(f"Could not match answer for question {q.id}: '{q.correct_answer}'")

        db.commit()
        logger.info(f"DONE. Fixed: {fixed_count}, Skipped (no match): {skipped_count}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error during migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_questions()
