import sqlalchemy
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def migrate():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Checking/Adding columns...")
        
        # SkillPath: is_active
        try:
            conn.execute(text("ALTER TABLE skill_paths ADD COLUMN is_active BOOLEAN DEFAULT TRUE;"))
            conn.commit()
            print("Added is_active to skill_paths")
        except Exception:
            print("is_active already exists in skill_paths")

        # Module: is_active, requires_validation
        try:
            conn.execute(text("ALTER TABLE terminal_modules ADD COLUMN is_active BOOLEAN DEFAULT TRUE;"))
            conn.commit()
            print("Added is_active to terminal_modules")
        except Exception:
            print("is_active already exists in terminal_modules")

        try:
            conn.execute(text("ALTER TABLE terminal_modules ADD COLUMN requires_validation BOOLEAN DEFAULT TRUE;"))
            conn.commit()
            print("Added requires_validation to terminal_modules")
        except Exception:
            print("requires_validation already exists in terminal_modules")

        # Lab: order_index
        try:
            conn.execute(text("ALTER TABLE terminal_labs ADD COLUMN order_index INTEGER DEFAULT 0;"))
            conn.commit()
            print("Added order_index to terminal_labs")
        except Exception:
            print("order_index already exists in terminal_labs")

if __name__ == "__main__":
    migrate()
