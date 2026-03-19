import os
import sys
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend to path to import database models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SkillLabExercise, SkillLabSession

# DB Setup
from dotenv import load_dotenv
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "postgresql://tech4u_admin:tech4u_admin@localhost:5432/tech4u"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

MAPPING = {
    "Bases de Datos": "base_de_datos",
    "Redes": "redes",
    "Sistemas Operativos": "sistemas_operativos",
    "Sistemas": "sistemas_operativos",
    "Fundamentos de Hardware": "hardware",
    "Hardware": "hardware",
    "Lenguaje de Marcas": "programacion",
    "Programación": "programacion",
    "Ciberseguridad": "ciberseguridad",
    "PowerShell": "powershell",
    "Git": "git",
    "Python": "python",
}

def migrate():
    db = SessionLocal()
    try:
        # 1. Update SkillLabExercise
        print("Updating SkillLabExercise table...")
        exercises = db.query(SkillLabExercise).all()
        ex_count = 0
        for ex in exercises:
            if ex.subject in MAPPING:
                old_subject = ex.subject
                new_subject = MAPPING[old_subject]
                ex.subject = new_subject
                ex_count += 1
        
        # 2. Update SkillLabSession
        print("Updating SkillLabSession table...")
        sessions = db.query(SkillLabSession).all()
        sess_count = 0
        for sess in sessions:
            if sess.subject in MAPPING:
                old_subject = sess.subject
                new_subject = MAPPING[old_subject]
                sess.subject = new_subject
                sess_count += 1

        db.commit()
        print(f"Successfully updated {ex_count} exercises and {sess_count} sessions.")
        
        # Verify counts per subject
        from sqlalchemy import func
        print("\nCounts in SkillLabExercise after migration:")
        results = db.query(SkillLabExercise.subject, func.count(SkillLabExercise.id)).group_by(SkillLabExercise.subject).all()
        for subject, count in results:
            print(f"  {subject}: {count}")
            
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
