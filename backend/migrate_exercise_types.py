"""
Migración: añade las columnas de nuevos tipos de ejercicio a sql_exercises.
Ejecutar UNA SOLA VEZ: python migrate_exercise_types.py
Soporta PostgreSQL y SQLite.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from database import engine

NEW_COLUMNS = [
    ("exercise_type", "VARCHAR DEFAULT 'free_query' NOT NULL"),
    ("template_sql",  "TEXT"),
    ("buggy_sql",     "TEXT"),
    ("fragments",     "TEXT"),
]

def run():
    with engine.connect() as conn:
        dialect = engine.dialect.name  # 'postgresql' or 'sqlite'
        print(f"Dialect: {dialect}")

        for col_name, col_def in NEW_COLUMNS:
            try:
                if dialect == "postgresql":
                    # PostgreSQL supports IF NOT EXISTS in ALTER TABLE ADD COLUMN
                    conn.execute(
                        __import__("sqlalchemy").text(
                            f"ALTER TABLE sql_exercises ADD COLUMN IF NOT EXISTS {col_name} {col_def};"
                        )
                    )
                else:
                    # SQLite does not support IF NOT EXISTS — check manually
                    from sqlalchemy import inspect
                    inspector = inspect(engine)
                    existing = [c["name"] for c in inspector.get_columns("sql_exercises")]
                    if col_name not in existing:
                        conn.execute(
                            __import__("sqlalchemy").text(
                                f"ALTER TABLE sql_exercises ADD COLUMN {col_name} {col_def};"
                            )
                        )
                    else:
                        print(f"  ↷ Already exists: {col_name}")
                        continue

                conn.commit()
                print(f"  ✓ Added: {col_name}")

            except Exception as e:
                conn.rollback()
                if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                    print(f"  ↷ Already exists: {col_name}")
                else:
                    print(f"  ✗ Error adding {col_name}: {e}")

    print("Migration complete.")

if __name__ == "__main__":
    run()
