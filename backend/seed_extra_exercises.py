"""
Seed: SQL Skills — 40 Extra Exercises Expansion (FINAL CORRECTED)
- Ensures each exercise set uses the correct schema for its dataset.
- Pokemon dataset uses Spanish column names.
"""
import os
import sys
import json

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, SQLDataset, SQLExercise
from routers.sql_skills import _compute_expected

db = SessionLocal()

def add_exercises(dataset_name, mode, exercises_data):
    ds = db.query(SQLDataset).filter(SQLDataset.name == dataset_name).first()
    if not ds:
        print(f"Dataset {dataset_name} not found!")
        return

    # Delete existing exercises of this type to avoid duplicates
    titles = [d["title"] for d in exercises_data]
    db.query(SQLExercise).filter(SQLExercise.dataset_id == ds.id, SQLExercise.title.in_(titles)).delete(synchronize_session=False)

    max_order = db.query(SQLExercise).filter(SQLExercise.dataset_id == ds.id).count() or 0
    
    count = 0
    for i, data in enumerate(exercises_data):
        try:
            expected = _compute_expected(ds.schema_sql, ds.seed_sql, data["solution_sql"])
        except Exception as e:
            print(f"Error computing expected for {data['title']} in {dataset_name}: {e}")
            continue

        ex = SQLExercise(
            dataset_id=ds.id,
            title=data["title"],
            category=data.get("category", "Práctica Avanzada"),
            order_num=max_order + i + 1,
            difficulty=data.get("difficulty", "intermedio"),
            description=data["description"],
            wiki_title=data.get("wiki_title"),
            wiki_content=data.get("wiki_content"),
            wiki_syntax=data.get("wiki_syntax"),
            wiki_example=data.get("wiki_example"),
            solution_sql=data["solution_sql"],
            expected_result=expected,
            xp_reward=data.get("xp_reward", 50),
            exercise_type=mode,
            template_sql=data.get("template_sql"),
            buggy_sql=data.get("buggy_sql"),
            fragments=data.get("fragments"),
            is_active=True
        )
        db.add(ex)
        count += 1
    
    db.commit()
    print(f"Added {count} {mode} exercises to {dataset_name}")

# --- DATA FOR EMPRESA IT ---
empresa_fill_blank = [
    {"title": "Hueco IT 11 — Empleados por ciudad", "description": "Lista el nombre de los empleados que viven en 'Madrid'.", "solution_sql": "SELECT nombre FROM empleado WHERE ciudad = 'Madrid';", "template_sql": "SELECT ___ FROM empleado WHERE ___ = 'Madrid';", "difficulty": "basico"},
    {"title": "Hueco IT 12 — Proyectos grandes", "description": "Muestra el nombre de los proyectos con presupuesto superior a 50000.", "solution_sql": "SELECT nombre FROM proyecto WHERE presupuesto > 50000;", "template_sql": "SELECT nombre FROM ___ WHERE presupuesto ___ 50000;", "difficulty": "basico"},
    {"title": "Hueco IT 13 — Media salarios", "description": "Calcula el salario medio de la empresa.", "solution_sql": "SELECT AVG(salario) FROM empleado;", "template_sql": "SELECT ___(salario) FROM ___ ;", "difficulty": "basico"},
    {"title": "Hueco IT 14 — Empleados Senior", "description": "Busca empleados cuya fecha de contratación sea anterior a 2015.", "solution_sql": "SELECT * FROM empleado WHERE fecha_contratacion < '2015-01-01';", "template_sql": "SELECT * FROM empleado WHERE ___ < '2015-01-01';", "difficulty": "intermedio"},
    {"title": "Hueco IT 15 — Proyectos por departamento", "description": "Cuenta cuántos proyectos hay en cada departamento.", "solution_sql": "SELECT departamento_id, COUNT(*) FROM proyecto GROUP BY departamento_id;", "template_sql": "SELECT departamento_id, ___(*) FROM proyecto ___ BY departamento_id;", "difficulty": "intermedio"}
]

empresa_find_bug = [
    {"title": "Bug IT 11 — Error en nombre columna", "description": "Corrige el nombre de la columna para listar los departamentos.", "solution_sql": "SELECT nombre FROM departamento;", "buggy_sql": "SELECT name FROM departamento;", "difficulty": "basico"},
    {"title": "Bug IT 12 — Operador incorrecto", "description": "Queremos empleados con salario > 3000.", "solution_sql": "SELECT * FROM empleado WHERE salario > 3000;", "buggy_sql": "SELECT * FROM empleado WHERE salario < 3000;", "difficulty": "basico"},
    {"title": "Bug IT 13 — Comillas faltantes", "description": "Corrige la sintaxis para filtrar por ciudad.", "solution_sql": "SELECT * FROM empleado WHERE ciudad = 'Barcelona';", "buggy_sql": "SELECT * FROM empleado WHERE ciudad = Barcelona;", "difficulty": "basico"},
    {"title": "Bug IT 14 — Group By incompleto", "description": "Falta el GROUP BY.", "solution_sql": "SELECT ciudad, COUNT(*) FROM empleado GROUP BY ciudad;", "buggy_sql": "SELECT ciudad, COUNT(*) FROM empleado;", "difficulty": "intermedio"},
    {"title": "Bug IT 15 — Alias con espacios", "description": "Alias con espacios entre comillas.", "solution_sql": "SELECT nombre AS 'Nombre del Proyecto' FROM proyecto;", "buggy_sql": "SELECT nombre AS Nombre del Proyecto FROM proyecto;", "difficulty": "intermedio"}
]

empresa_order_clauses = [
    {"title": "Orden IT 11 — Datos básicos", "description": "Nombre de los departamentos.", "solution_sql": "SELECT nombre FROM departamento;", "fragments": json.dumps(["SELECT nombre", "FROM departamento;"]), "difficulty": "basico"},
    {"title": "Orden IT 12 — Filtro ciudad", "description": "Empleados de Madrid.", "solution_sql": "SELECT * FROM empleado WHERE ciudad = 'Madrid';", "fragments": json.dumps(["SELECT *", "FROM empleado", "WHERE ciudad = 'Madrid';"]), "difficulty": "basico"},
    {"title": "Orden IT 13 — Ranking salarios", "description": "Top 10 salarios.", "solution_sql": "SELECT nombre, salario FROM empleado ORDER BY salario DESC LIMIT 10;", "fragments": json.dumps(["SELECT nombre, salario", "FROM empleado", "ORDER BY salario DESC", "LIMIT 10;"]), "difficulty": "intermedio"},
    {"title": "Orden IT 14 — Recuento por ciudad", "description": "Empleados por ciudad.", "solution_sql": "SELECT ciudad, COUNT(*) FROM empleado GROUP BY ciudad ORDER BY COUNT(*) DESC;", "fragments": json.dumps(["SELECT ciudad, COUNT(*)", "FROM empleado", "GROUP BY ciudad", "ORDER BY COUNT(*) DESC;"]), "difficulty": "intermedio"},
    {"title": "Orden IT 15 — Proyectos caros", "description": "Presupuesto > 20000.", "solution_sql": "SELECT nombre, presupuesto FROM proyecto WHERE presupuesto > 20000 ORDER BY presupuesto DESC;", "fragments": json.dumps(["SELECT nombre, presupuesto", "FROM proyecto", "WHERE presupuesto > 20000", "ORDER BY presupuesto DESC;"]), "difficulty": "intermedio"}
]

empresa_reverse_query = [
    {"title": "Inversa IT 11 — Nombres", "description": "Obtener solo los nombres de todos los empleados.", "solution_sql": "SELECT nombre FROM empleado;", "difficulty": "basico"},
    {"title": "Inversa IT 12 — Empleados IT", "description": "Datos de los empleados del departamento 1.", "solution_sql": "SELECT * FROM empleado WHERE departamento_id = 1;", "difficulty": "basico"},
    {"title": "Inversa IT 13 — Conteo total", "description": "Total empleados.", "solution_sql": "SELECT COUNT(*) FROM empleado;", "difficulty": "basico"},
    {"title": "Inversa IT 14 — Salarios altos", "description": "Nombre y salario si ganan > 4000€.", "solution_sql": "SELECT nombre, salario FROM empleado WHERE salario > 4000;", "difficulty": "intermedio"},
    {"title": "Inversa IT 15 — Ciudades únicas", "description": "Lista de ciudades sin repetir.", "solution_sql": "SELECT DISTINCT ciudad FROM empleado;", "difficulty": "intermedio"}
]

# --- DATA FOR POKEMON (Updated Column Names) ---
pokemon_fill_blank = [
    {"title": "Hueco PK 11 — Tipos Rayo", "description": "Pokemon de tipo 'Electric'.", "solution_sql": "SELECT nombre FROM pokemon WHERE tipo_primario = 'Electric';", "template_sql": "SELECT ___ FROM pokemon WHERE ___ = 'Electric';", "difficulty": "basico"},
    {"title": "Hueco PK 12 — El más resistente", "description": "HP del Pokemon con más vida.", "solution_sql": "SELECT MAX(hp) FROM pokemon;", "template_sql": "SELECT ___(hp) FROM ___ ;", "difficulty": "basico"},
    {"title": "Hueco PK 13 — Velocidad media", "description": "Velocidad media.", "solution_sql": "SELECT AVG(velocidad) FROM pokemon;", "template_sql": "SELECT ___(velocidad) FROM pokemon;", "difficulty": "basico"},
    {"title": "Hueco PK 14 — Tipos Agua rápidos", "description": "Agua con velocidad > 100.", "solution_sql": "SELECT nombre FROM pokemon WHERE tipo_primario = 'Water' AND velocidad > 100;", "template_sql": "SELECT nombre FROM pokemon WHERE tipo_primario = 'Water' ___ velocidad ___ 100;", "difficulty": "intermedio"},
    {"title": "Hueco PK 15 — Conteo generación", "description": "Pokemon por generación.", "solution_sql": "SELECT generacion, COUNT(*) FROM pokemon GROUP BY generacion;", "template_sql": "SELECT generacion, ___ FROM pokemon ___ BY generacion;", "difficulty": "intermedio"}
]

pokemon_find_bug = [
    {"title": "Bug PK 11 — Error escritura", "description": "Corrige 'SELCT'.", "solution_sql": "SELECT * FROM pokemon;", "buggy_sql": "SELCT * FROM pokemon;", "difficulty": "basico"},
    {"title": "Bug PK 12 — Columna inex", "description": "Se llama 'legendario'.", "solution_sql": "SELECT nombre FROM pokemon WHERE legendario = 1;", "buggy_sql": "SELECT nombre FROM pokemon WHERE is_legendary = 1;", "difficulty": "basico"},
    {"title": "Bug PK 13 — Error Between", "description": "BETWEEN requiere AND.", "solution_sql": "SELECT nombre FROM pokemon WHERE hp BETWEEN 50 AND 100;", "buggy_sql": "SELECT nombre FROM pokemon WHERE hp BETWEEN 50 OR 100;", "difficulty": "intermedio"},
    {"title": "Bug PK 14 — Having sin Group", "description": "Having necesita agrupar.", "solution_sql": "SELECT tipo_primario, AVG(ataque) FROM pokemon GROUP BY tipo_primario HAVING AVG(ataque) > 80;", "buggy_sql": "SELECT tipo_primario, AVG(ataque) FROM pokemon HAVING AVG(ataque) > 80;", "difficulty": "intermedio"},
    {"title": "Bug PK 15 — Tabla inex", "description": "La tabla es 'pokemon'.", "solution_sql": "SELECT COUNT(*) FROM pokemon;", "buggy_sql": "SELECT COUNT(*) FROM pokemons;", "difficulty": "basico"}
]

pokemon_order_clauses = [
    {"title": "Orden PK 11 — Ver todos", "description": "Lista toda la tabla pokemon.", "solution_sql": "SELECT * FROM pokemon;", "fragments": json.dumps(["SELECT *", "FROM pokemon;"]), "difficulty": "basico"},
    {"title": "Orden PK 12 — Legendarios", "description": "Legendarios 1ª gen.", "solution_sql": "SELECT nombre FROM pokemon WHERE legendario = 1 AND generacion = 1;", "fragments": json.dumps(["SELECT nombre", "FROM pokemon", "WHERE legendario = 1", "AND generacion = 1;"]), "difficulty": "intermedio"},
    {"title": "Orden PK 13 — Top vida", "description": "Top 5 HP.", "solution_sql": "SELECT nombre, hp FROM pokemon ORDER BY hp DESC LIMIT 5;", "fragments": json.dumps(["SELECT nombre, hp", "FROM pokemon", "ORDER BY hp DESC", "LIMIT 5;"]), "difficulty": "intermedio"},
    {"title": "Orden PK 14 — Ataque medio", "description": "Ataque medio por tipo 1.", "solution_sql": "SELECT tipo_primario, AVG(ataque) FROM pokemon GROUP BY tipo_primario ORDER BY AVG(ataque) DESC;", "fragments": json.dumps(["SELECT tipo_primario, AVG(ataque)", "FROM pokemon", "GROUP BY tipo_primario", "ORDER BY AVG(ataque) DESC;"]), "difficulty": "avanzado"},
    {"title": "Orden PK 15 — Tipos comunes", "description": "Tipos con > 50 pokemon.", "solution_sql": "SELECT tipo_primario, COUNT(*) FROM pokemon GROUP BY tipo_primario HAVING COUNT(*) > 50;", "fragments": json.dumps(["SELECT tipo_primario, COUNT(*)", "FROM pokemon", "GROUP BY tipo_primario", "HAVING COUNT(*) > 50;"]), "difficulty": "avanzado"}
]

pokemon_reverse_query = [
    {"title": "Inversa PK 11 — Legendarios Totales", "description": "Cuantos legendarios existen.", "solution_sql": "SELECT COUNT(*) FROM pokemon WHERE legendario = 1;", "difficulty": "basico"},
    {"title": "Inversa PK 12 — Gen 1", "description": "Pokemon en la gen 1.", "solution_sql": "SELECT COUNT(*) FROM pokemon WHERE generacion = 1;", "difficulty": "basico"},
    {"title": "Inversa PK 13 — Muy Fuertes", "description": "Nombre y ataque > 120.", "solution_sql": "SELECT nombre, ataque FROM pokemon WHERE ataque > 120;", "difficulty": "intermedio"},
    {"title": "Inversa PK 14 — Agua/Fuego", "description": "Tipo 1 'Water' o 'Fire'.", "solution_sql": "SELECT nombre FROM pokemon WHERE tipo_primario IN ('Water', 'Fire');", "difficulty": "intermedio"},
    {"title": "Inversa PK 15 — Vel Max por Tipo", "description": "Velocidad máxima por Tipo 1.", "solution_sql": "SELECT tipo_primario, MAX(velocidad) FROM pokemon GROUP BY tipo_primario;", "difficulty": "avanzado"}
]

# --- EXECUTE ---
add_exercises("Empresa IT", "fill_blank", empresa_fill_blank)
add_exercises("Empresa IT", "find_bug", empresa_find_bug)
add_exercises("Empresa IT", "order_clauses", empresa_order_clauses)
add_exercises("Empresa IT", "reverse_query", empresa_reverse_query)

add_exercises("Pokemon", "fill_blank", pokemon_fill_blank)
add_exercises("Pokemon", "find_bug", pokemon_find_bug)
add_exercises("Pokemon", "order_clauses", pokemon_order_clauses)
add_exercises("Pokemon", "reverse_query", pokemon_reverse_query)

db.close()
print("Final corrected seeding complete.")
