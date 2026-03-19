"""
seed_roadmap_levels.py
======================
Crea los 7 niveles del Roadmap SQL y asigna ejercicios existentes a cada nivel.
Compatible con PostgreSQL (producción) y SQLite (desarrollo).

Uso:
  cd backend && source venv/bin/activate
  python seed_roadmap_levels.py
"""

import re, os

# ── Lee DATABASE_URL del entorno o del .env ───────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    env_file = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_file):
        for line in open(env_file):
            line = line.strip()
            if line.startswith("DATABASE_URL"):
                DATABASE_URL = line.split("=", 1)[-1].strip().strip('"').strip("'")
                break

if not DATABASE_URL:
    raise EnvironmentError(
        "No se encontró DATABASE_URL. Asegúrate de tener un archivo .env "
        "con DATABASE_URL=postgresql://... o ejecuta con el venv activado."
    )

print(f"🔌 Conectando a: {DATABASE_URL[:60]}...")

# ── Conecta según el motor ────────────────────────────────────────────────────
IS_POSTGRES = DATABASE_URL.startswith("postgresql") or DATABASE_URL.startswith("postgres")

if IS_POSTGRES:
    import psycopg2
    import psycopg2.extras
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    PH   = "%s"          # placeholder para psycopg2
    RETURNING = " RETURNING id"
else:
    import sqlite3
    conn = sqlite3.connect(DATABASE_URL.replace("sqlite:///./", "").replace("sqlite:///", ""))
    conn.row_factory = sqlite3.Row
    cur  = conn.cursor()
    PH   = "?"
    RETURNING = ""

def fetch_one(cur):
    """Devuelve la primera fila (compatible sqlite/postgres)."""
    row = cur.fetchone()
    if row is None:
        return None
    return dict(row)

# ── 1. Aseguramos que la tabla sql_levels existe ──────────────────────────────
if IS_POSTGRES:
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sql_levels (
            id                    SERIAL PRIMARY KEY,
            title                 VARCHAR NOT NULL,
            description           TEXT,
            icon                  VARCHAR DEFAULT '🎯',
            order_index           INTEGER DEFAULT 0,
            required_prev_level_id INTEGER REFERENCES sql_levels(id),
            created_at            TIMESTAMP DEFAULT NOW()
        );
    """)
else:
    cur.executescript("""
        CREATE TABLE IF NOT EXISTS sql_levels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            icon TEXT DEFAULT '🎯',
            order_index INTEGER DEFAULT 0,
            required_prev_level_id INTEGER REFERENCES sql_levels(id),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)
conn.commit()

# ── 2. Definición de los 10 niveles ──────────────────────────────────────────
LEVELS = [
    (1,  "Fundamentos",          "Domina SELECT, AS, LIMIT y DISTINCT — los pilares de toda consulta SQL.",              "🎯"),
    (2,  "Filtrado Crítico",     "Filtra filas con WHERE, AND, OR y NOT. La base del análisis de datos.",                "🔍"),
    (3,  "Búsqueda Avanzada",    "Encuentra patrones con IN, BETWEEN, LIKE e IS NULL.",                                  "🔎"),
    (4,  "Agregación",           "Resume millones de filas con COUNT, SUM, AVG, MIN y MAX.",                             "📊"),
    (5,  "Agrupación",           "Clasifica y filtra grupos de datos con GROUP BY y HAVING.",                            "📦"),
    (6,  "Relaciones",           "Conecta tablas con INNER JOIN, LEFT JOIN, RIGHT JOIN y FULL OUTER JOIN.",              "🔗"),
    (7,  "Subconsultas",         "Anida SELECTs dentro de otros: IN (SELECT), EXISTS y tablas derivadas.",               "🔬"),
    (8,  "Lógica Condicional",   "Añade inteligencia a tus queries con CASE WHEN, THEN, ELSE y expresiones condicionales.", "🧠"),
    (9,  "Funciones Avanzadas",  "Domina funciones de fecha (EXTRACT, DATE_PART) y texto (CONCAT, UPPER, TRIM).",        "⚙️"),
    (10, "Maestría SQL",         "El nivel élite: Window Functions (ROW_NUMBER, RANK, PARTITION BY) y UNION.",           "👑"),
]

# ── 3. Crear o actualizar niveles ─────────────────────────────────────────────
print("\n📋 Creando niveles del Roadmap...")
level_ids = {}   # order_index → id en BD

for (idx, title, desc, icon) in LEVELS:
    cur.execute(f"SELECT id FROM sql_levels WHERE order_index = {PH}", (idx,))
    row = fetch_one(cur)
    if row:
        cur.execute(
            f"UPDATE sql_levels SET title={PH}, description={PH}, icon={PH} WHERE order_index={PH}",
            (title, desc, icon, idx)
        )
        level_ids[idx] = row["id"]
        print(f"  ✓ Actualizado  Nivel {idx}: {title}")
    else:
        if IS_POSTGRES:
            cur.execute(
                f"INSERT INTO sql_levels (order_index, title, description, icon) "
                f"VALUES ({PH},{PH},{PH},{PH}) RETURNING id",
                (idx, title, desc, icon)
            )
            level_ids[idx] = fetch_one(cur)["id"]
        else:
            cur.execute(
                f"INSERT INTO sql_levels (order_index, title, description, icon) VALUES ({PH},{PH},{PH},{PH})",
                (idx, title, desc, icon)
            )
            level_ids[idx] = cur.lastrowid
        print(f"  ✓ Creado       Nivel {idx}: {title}")

# Enlazar required_prev_level_id
for idx in range(2, 11):
    cur.execute(
        f"UPDATE sql_levels SET required_prev_level_id = {PH} WHERE order_index = {PH}",
        (level_ids[idx - 1], idx)
    )

conn.commit()

# ── 3b. Añadir columna level_id a sql_exercises si no existe ─────────────────
print("\n🔧 Verificando columna level_id en sql_exercises...")
if IS_POSTGRES:
    cur.execute("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'sql_exercises' AND column_name = 'level_id'
    """)
    if not cur.fetchone():
        cur.execute("""
            ALTER TABLE sql_exercises
            ADD COLUMN level_id INTEGER REFERENCES sql_levels(id)
        """)
        conn.commit()
        print("  ✓ Columna level_id añadida a sql_exercises")
    else:
        print("  ✓ Columna level_id ya existe")
else:
    # SQLite: comprobar con PRAGMA
    cur.execute("PRAGMA table_info(sql_exercises)")
    cols = [r[1] for r in cur.fetchall()]
    if "level_id" not in cols:
        cur.execute("ALTER TABLE sql_exercises ADD COLUMN level_id INTEGER REFERENCES sql_levels(id)")
        conn.commit()
        print("  ✓ Columna level_id añadida a sql_exercises")
    else:
        print("  ✓ Columna level_id ya existe")

# ── 4. Clasificar ejercicios ──────────────────────────────────────────────────
print("\n🔗 Asignando ejercicios a niveles...")

def classify(sql: str) -> int:
    """Devuelve el order_index del nivel (1-10) para esta query SQL."""
    s = sql.upper()

    # Nivel 10 — Window Functions (OVER, PARTITION BY, ROW_NUMBER, RANK…)
    if re.search(r'\bOVER\s*\(', s):                                    return 10
    if re.search(r'\b(ROW_NUMBER|RANK|DENSE_RANK|NTILE|LAG|LEAD|FIRST_VALUE|LAST_VALUE)\s*\(', s): return 10
    if re.search(r'\bPARTITION\s+BY\b', s):                             return 10
    # UNION sin WITH → también nivel 10
    if re.search(r'\bUNION\b', s):                                      return 10

    # Nivel 9 — Funciones de fecha y texto
    if re.search(r'\b(EXTRACT|DATE_PART|DATE_TRUNC|DATE_ADD|DATE_SUB|DATEDIFF|DATEADD)\s*\(', s): return 9
    if re.search(r'\b(CURRENT_DATE|CURRENT_TIMESTAMP|NOW|GETDATE)\b', s): return 9
    if re.search(r'\b(CONCAT|SUBSTRING|SUBSTR|LENGTH|UPPER|LOWER|TRIM|LTRIM|RTRIM|REPLACE|SPLIT_PART|LPAD|RPAD|COALESCE|NULLIF|ISNULL|IFNULL)\s*\(', s): return 9

    # Nivel 8 — Lógica condicional CASE WHEN
    if re.search(r'\bCASE\b', s):                                        return 8

    # Nivel 7 — Subconsultas (SELECT anidado sin WITH/UNION)
    if re.search(r'\bWITH\b', s):                                        return 7
    if re.search(r'\bEXISTS\b', s):                                      return 7
    if s.count('SELECT') > 1:                                            return 7

    # Nivel 6 — cualquier JOIN
    if re.search(r'\bJOIN\b', s):                                        return 6

    # Nivel 5 — HAVING o GROUP BY + agregación
    if re.search(r'\bHAVING\b', s):                                      return 5
    if (re.search(r'\bGROUP\s+BY\b', s) and
        re.search(r'\b(COUNT|SUM|AVG|MIN|MAX)\s*\(', s)):                return 5

    # Nivel 4 — funciones de agregación simples
    if re.search(r'\b(COUNT|SUM|AVG|MIN|MAX)\s*\(', s):                  return 4
    if re.search(r'\bGROUP\s+BY\b', s):                                  return 5

    # Nivel 3 — búsqueda avanzada
    if (re.search(r'\bLIKE\b', s) or
        re.search(r'\bBETWEEN\b', s) or
        re.search(r'\bIS\s+(NOT\s+)?NULL\b', s) or
        re.search(r'\bNOT\s+IN\b', s) or
        re.search(r'\bIN\s*\(', s)):
        return 3

    # Nivel 2 — filtrado básico
    if re.search(r'\bWHERE\b', s):  return 2

    # Nivel 1 — fundamentos (SELECT puro, LIMIT, DISTINCT, ORDER BY…)
    return 1

cur.execute("SELECT id, solution_sql FROM sql_exercises WHERE is_active = TRUE")
exercises = [dict(r) for r in cur.fetchall()]

counts    = {i: 0 for i in range(1, 11)}
unassigned = 0
batch = []

for ex in exercises:
    sol = ex.get("solution_sql") or ""
    if not sol.strip():
        unassigned += 1
        continue
    idx    = classify(sol)
    lvl_id = level_ids.get(idx)
    if lvl_id:
        batch.append((lvl_id, ex["id"]))
        counts[idx] += 1
    else:
        unassigned += 1

# Actualiza en lote para rapidez
for (lvl_id, ex_id) in batch:
    cur.execute(
        f"UPDATE sql_exercises SET level_id = {PH} WHERE id = {PH}",
        (lvl_id, ex_id)
    )

conn.commit()

# ── 5. Reordenar ejercicios dentro de cada nivel (pedagogía: de menos a más) ──
print("\n📐 Reordenando ejercicios por tipo de dificultad dentro de cada nivel...")

# Prioridad pedagógica:
# 1. free_query    → el alumno escribe la query completa (aprende el concepto)
# 2. fill_blank    → rellena huecos (practica la sintaxis)
# 3. order_clauses → ordena fragmentos (consolida la estructura)
# 4. reverse_query → query inversa (razona sobre resultados)
# 5. find_bug      → encuentra el error (comprensión avanzada)
TYPE_PRIORITY = {
    'free_query':    0,
    'fill_blank':    1,
    'order_clauses': 2,
    'reverse_query': 3,
    'find_bug':      4,
}

for (lvl_idx, _, __, ___) in LEVELS:
    lvl_id = level_ids.get(lvl_idx)
    if not lvl_id:
        continue

    cur.execute(
        f"SELECT id, exercise_type, order_num FROM sql_exercises "
        f"WHERE level_id = {PH} AND is_active = TRUE ORDER BY order_num",
        (lvl_id,)
    )
    lvl_exercises = [dict(r) for r in cur.fetchall()]
    if not lvl_exercises:
        continue

    # Ordenar: primero por tipo, luego mantener orden relativo dentro del tipo
    lvl_exercises.sort(key=lambda ex: (
        TYPE_PRIORITY.get(ex.get('exercise_type') or 'free_query', 5),
        ex.get('order_num') or 999
    ))

    # Asignar order_num consecutivos comenzando en 1
    for new_order, ex in enumerate(lvl_exercises, start=1):
        cur.execute(
            f"UPDATE sql_exercises SET order_num = {PH} WHERE id = {PH}",
            (new_order, ex['id'])
        )
    print(f"  ✓ Nivel {lvl_idx}: {len(lvl_exercises)} ejercicios → "
          f"{sum(1 for e in lvl_exercises if (e.get('exercise_type') or 'free_query') == 'free_query')} free  "
          f"| {sum(1 for e in lvl_exercises if (e.get('exercise_type') or '') == 'fill_blank')} fill  "
          f"| {sum(1 for e in lvl_exercises if (e.get('exercise_type') or '') == 'order_clauses')} orden  "
          f"| {sum(1 for e in lvl_exercises if (e.get('exercise_type') or '') == 'find_bug')} bug  "
          f"| {sum(1 for e in lvl_exercises if (e.get('exercise_type') or '') == 'reverse_query')} inv")

conn.commit()

# ── 6. Resumen ────────────────────────────────────────────────────────────────
print()
print("═" * 55)
print("  RESUMEN DE ASIGNACIÓN")
print("═" * 55)
for (idx, title, _, __) in LEVELS:
    bar = "█" * min(counts[idx] // 5, 20)
    print(f"  Nv{idx}  {title:<22} {counts[idx]:>4} ejercicios  {bar}")
if unassigned:
    print(f"  Sin solution_sql (sin asignar): {unassigned}")
print("═" * 55)
print(f"  Total asignados: {sum(counts.values())}")
print()
print("✅ Roadmap listo. Recarga el servidor y abre SQL Skills → Ruta de Aprendizaje.")

cur.close()
conn.close()
