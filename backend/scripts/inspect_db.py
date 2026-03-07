from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import json
import os
import sys

# Try to find the DB
db_path = "tech4u.db"
if not os.path.exists(db_path):
    db_path = "backend/tech4u.db"

DATABASE_URL = f"sqlite:///./{db_path}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def inspect_data():
    db = SessionLocal()
    try:
        from database import SkillLabExercise
        exercises = db.query(SkillLabExercise).all()
        for ex in exercises:
            print(f"--- ID: {ex.id} ---")
            print(f"Subject: {ex.subject}")
            print(f"Answers Raw: {repr(ex.correct_answers)}")
            try:
                answers = json.loads(ex.correct_answers)
                print(f"Answers List: {answers}")
                for i, a in enumerate(answers):
                    print(f"  [{i}]: {repr(a)} (Length: {len(a)})")
                    for char in a:
                        print(f"    - char: {repr(char)} code: {ord(char)}")
            except:
                print("Error parsing JSON")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    inspect_data()
