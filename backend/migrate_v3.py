import sqlalchemy
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def migrate():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Starting migrations...")
        
        # SkillPath: is_active
        try:
            conn.execute(text("ALTER TABLE skill_paths ADD COLUMN is_active BOOLEAN DEFAULT TRUE;"))
            conn.commit()
            print("Added is_active to skill_paths")
        except Exception as e:
            print(f"skill_paths.is_active skip: {e}")

        # Module: is_active, requires_validation
        try:
            conn.execute(text("ALTER TABLE terminal_modules ADD COLUMN is_active BOOLEAN DEFAULT TRUE;"))
            conn.commit()
            print("Added is_active to terminal_modules")
        except Exception as e:
            print(f"terminal_modules.is_active skip: {e}")

        try:
            conn.execute(text("ALTER TABLE terminal_modules ADD COLUMN requires_validation BOOLEAN DEFAULT TRUE;"))
            conn.commit()
            print("Added requires_validation to terminal_modules")
        except Exception as e:
            print(f"terminal_modules.requires_validation skip: {e}")

        # Lab: order_index
        try:
            conn.execute(text("ALTER TABLE terminal_labs ADD COLUMN order_index INTEGER DEFAULT 0;"))
            conn.commit()
            print("Added order_index to terminal_labs")
        except Exception as e:
            print(f"terminal_labs.order_index skip: {e}")

if __name__ == "__main__":
    migrate()
