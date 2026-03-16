"""
Migración: crea la tabla skill_lab_sessions si no existe.
Ejecutar desde la carpeta /backend con:
  python migrate_skill_lab_sessions.py
"""
import sqlite3, os, sys

DB_PATH = os.getenv("DATABASE_URL", "sqlite:///./tech4u.db").replace("sqlite:///", "").replace("./", "")
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), DB_PATH)

print(f"Base de datos: {DB_PATH}")

conn = sqlite3.connect(DB_PATH, timeout=20)
cur = conn.cursor()

# Comprueba si la tabla ya existe
existing = cur.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='skill_lab_sessions'"
).fetchone()

if existing:
    print("✓ La tabla skill_lab_sessions ya existe — no se requiere migración.")
else:
    cur.execute("""
        CREATE TABLE skill_lab_sessions (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id             INTEGER NOT NULL REFERENCES users(id),
            subject             TEXT NOT NULL,
            difficulty          TEXT DEFAULT 'easy',
            total_exercises     INTEGER DEFAULT 0,
            correct_exercises   INTEGER DEFAULT 0,
            failed_attempts     INTEGER DEFAULT 0,
            xp_gained           INTEGER DEFAULT 0,
            is_perfect          INTEGER DEFAULT 0,
            is_daily_challenge  INTEGER DEFAULT 0,
            is_exam_mode        INTEGER DEFAULT 0,
            completed_at        TEXT DEFAULT (datetime('now'))
        )
    """)
    cur.execute("CREATE INDEX ix_skill_lab_sessions_id ON skill_lab_sessions (id)")
    cur.execute("CREATE INDEX ix_skill_lab_sessions_user_id ON skill_lab_sessions (user_id)")
    cur.execute("CREATE INDEX ix_skill_lab_sessions_subject ON skill_lab_sessions (subject)")
    cur.execute("CREATE INDEX ix_skill_lab_sessions_completed_at ON skill_lab_sessions (completed_at)")
    conn.commit()
    print("✓ Tabla skill_lab_sessions creada correctamente.")

conn.close()
print("¡Migración completada! Ahora puedes usar Skill Labs.")
