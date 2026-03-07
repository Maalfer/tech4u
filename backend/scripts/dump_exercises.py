from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import json
import os

DATABASE_URL = "sqlite:///./tech4u.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def dump_exercises():
    db = SessionLocal()
    try:
        from database import SkillLabExercise
        exercises = db.query(SkillLabExercise).all()
        data = []
        for ex in exercises:
            data.append({
                "id": ex.id,
                "subject": ex.subject,
                "sentence_template": ex.sentence_template,
                "correct_answers": ex.correct_answers,
                "distractors": ex.distractors,
                "explanation": ex.explanation
            })
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Check if we are in backend or root
    if not os.path.exists("tech4u.db"):
        print("tech4u.db not found in current directory. Checking backend/...")
        os.chdir("backend")
    dump_exercises()
