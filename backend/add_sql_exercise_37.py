"""
Script incremental: añade el ejercicio 37 (Examen) y actualiza la comparación
de resultados esperados sin borrar ejercicios ni progreso de alumnos.
Ejecutar: python3 add_sql_exercise_37.py
"""
import json
import sqlite3
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from database import SessionLocal, SQLDataset, SQLExercise, create_tables

EXERCISE_37 = {
    "title": "Ejercicio 37 — Examen",
    "category": "Examen",
    "order_num": 37,
    "difficulty": "avanzado",
    "description": """🎓 <b>Examen: Consultas Sencillas</b><br><br>
Demuestra lo que has aprendido con esta consulta avanzada:<br><br>
Muestra el <b>estado de los pedidos</b> junto con el <b>número de pedidos</b> de cada estado,
el <b>total facturado</b> (suma de <code>total</code>) y el <b>importe medio por pedido</b>.
Solo incluye estados con <b>más de 1 pedido</b>.
Ordena los resultados de mayor a menor total facturado.
<br><br>
<i>Columnas esperadas: estado, num_pedidos, total_facturado, importe_medio</i>""",
    "wiki_title": "Examen — Consultas Sencillas",
    "wiki_content": """Este ejercicio final combina todos los conocimientos del módulo:

- **SELECT** con columnas calculadas y alias
- **GROUP BY** para agrupar por estado del pedido
- **COUNT**, **SUM** y **AVG** como funciones de agregación
- **HAVING** para filtrar grupos con más de 1 pedido
- **ORDER BY** para ordenar el resultado final

Si llegas hasta aquí y resuelves este ejercicio, dominas las bases de SQL para consultas de selección y análisis.""",
    "wiki_syntax": "SELECT col, COUNT(*) AS n, SUM(col2) AS s, AVG(col2) AS m FROM tabla GROUP BY col HAVING COUNT(*) > 1 ORDER BY s DESC;",
    "wiki_example": "SELECT estado, COUNT(*) AS num_pedidos, SUM(total) AS total_facturado, AVG(total) AS importe_medio FROM pedido GROUP BY estado HAVING COUNT(*) > 1 ORDER BY total_facturado DESC;",
    "solution_sql": """SELECT estado,
       COUNT(*) AS num_pedidos,
       SUM(total) AS total_facturado,
       AVG(total) AS importe_medio
FROM pedido
GROUP BY estado
HAVING COUNT(*) > 1
ORDER BY total_facturado DESC;""",
    "xp_reward": 200,
}


def compute_expected(schema_sql, seed_sql, solution_sql):
    conn = sqlite3.connect(":memory:")
    conn.executescript(schema_sql)
    conn.executescript(seed_sql)
    cursor = conn.execute(solution_sql)
    columns = [d[0] for d in cursor.description] if cursor.description else []
    rows = [list(r) for r in cursor.fetchall()]
    conn.close()
    return json.dumps({"columns": columns, "rows": rows})


def run():
    create_tables()
    db = SessionLocal()

    # Buscar dataset Tienda
    dataset = db.query(SQLDataset).filter(SQLDataset.name == "Tienda").first()
    if not dataset:
        print("❌ Dataset 'Tienda' no encontrado. Ejecuta seed_sql_skills.py primero.")
        db.close()
        return

    # Verificar si ejercicio 37 ya existe
    existing = db.query(SQLExercise).filter(
        SQLExercise.dataset_id == dataset.id,
        SQLExercise.order_num == 37
    ).first()

    if existing:
        print(f"⚠️  Ejercicio 37 ya existe (ID={existing.id}). Actualizando...")
        for k, v in EXERCISE_37.items():
            setattr(existing, k, v)
        existing.expected_result = compute_expected(dataset.schema_sql, dataset.seed_sql, EXERCISE_37["solution_sql"])
        db.commit()
        print(f"✅ Ejercicio 37 actualizado (ID={existing.id})")
    else:
        expected = compute_expected(dataset.schema_sql, dataset.seed_sql, EXERCISE_37["solution_sql"])
        ex = SQLExercise(
            dataset_id=dataset.id,
            expected_result=expected,
            is_active=True,
            **EXERCISE_37,
        )
        db.add(ex)
        db.commit()
        db.refresh(ex)
        print(f"✅ Ejercicio 37 creado (ID={ex.id})")

    # Recomputar todos los expected_result para garantizar coherencia
    print("\n🔄 Recomputando expected_result de todos los ejercicios...")
    exercises = db.query(SQLExercise).filter(SQLExercise.dataset_id == dataset.id).all()
    ok = 0
    for ex in exercises:
        try:
            ex.expected_result = compute_expected(dataset.schema_sql, dataset.seed_sql, ex.solution_sql)
            ok += 1
        except Exception as e:
            print(f"  ⚠️  {ex.title}: {e}")
    db.commit()
    print(f"✅ {ok}/{len(exercises)} ejercicios recomputados")
    db.close()


if __name__ == "__main__":
    run()
