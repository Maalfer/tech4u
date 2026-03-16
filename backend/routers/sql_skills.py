"""
SQL Skills — Router FastAPI
Motor: SQLite en memoria (sin coste de servidor, compatible con MySQL para SELECT)
"""
import sqlite3
import json
import re
import time
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db, SQLDataset, SQLExercise, UserSQLProgress, User, SQLLevel
from auth import get_current_user, require_developer
from services.permission_service import require_module_access
from limiter import limiter

router = APIRouter(prefix="/sql", tags=["sql_skills"])


# ──────────────────────────────────────────────
# SCHEMAS
# ──────────────────────────────────────────────

class QueryRequest(BaseModel):
    exercise_id: int
    query: str

EXERCISE_TYPES = ("free_query", "fill_blank", "find_bug", "order_clauses", "reverse_query")

class ExerciseCreate(BaseModel):
    dataset_id: int
    title: str
    category: str
    order_num: int = 0
    difficulty: str = "basico"
    description: str
    wiki_title: Optional[str] = None
    wiki_content: Optional[str] = None
    wiki_syntax: Optional[str] = None
    wiki_example: Optional[str] = None
    solution_sql: str
    xp_reward: int = 50
    exercise_type: str = "free_query"
    template_sql: Optional[str] = None
    buggy_sql: Optional[str] = None
    fragments: Optional[str] = None   # JSON array string

class ExerciseUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    order_num: Optional[int] = None
    difficulty: Optional[str] = None
    description: Optional[str] = None
    wiki_title: Optional[str] = None
    wiki_content: Optional[str] = None
    wiki_syntax: Optional[str] = None
    wiki_example: Optional[str] = None
    solution_sql: Optional[str] = None
    xp_reward: Optional[int] = None
    is_active: Optional[bool] = None
    exercise_type: Optional[str] = None
    template_sql: Optional[str] = None
    buggy_sql: Optional[str] = None
    fragments: Optional[str] = None

class DatasetCreate(BaseModel):
    name: str
    description: Optional[str] = None
    schema_sql: str
    seed_sql: str
    er_diagram_url: Optional[str] = None

class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    schema_sql: Optional[str] = None
    seed_sql: Optional[str] = None
    er_diagram_url: Optional[str] = None


class LevelProgress(BaseModel):
    id: int
    title: str
    description: Optional[str]
    icon: str
    order_index: int
    status: str # locked | unlocked | completed
    exercises_count: int
    completed_count: int

@router.get("/roadmap", response_model=List[LevelProgress])
async def get_sql_roadmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("sql_skills"))
):
    """Devuelve el progreso del Roadmap de SQL para el usuario."""
    levels = db.query(SQLLevel).order_by(SQLLevel.order_index).all()
    
    # Obtener todo el progreso del usuario en SQL una sola vez
    all_progress = db.query(UserSQLProgress).filter(
        UserSQLProgress.user_id == current_user.id,
        UserSQLProgress.completed == True
    ).all()
    completed_exercise_ids = {p.exercise_id for p in all_progress}
    
    result = []
    
    # Un nivel se desbloquea si el anterior está completado (o si es el primero)
    # Un nivel está completado si todos sus ejercicios activos están completados
    last_level_completed = True # El primero siempre está "unlocked" si no tiene previo
    
    for lvl in levels:
        exercises = [ex for ex in lvl.exercises if ex.is_active]
        exercises_count = len(exercises)
        
        if exercises_count == 0:
            completed_count = 0
            is_completed = True
        else:
            lvl_completed_ids = [ex.id for ex in exercises if ex.id in completed_exercise_ids]
            completed_count = len(lvl_completed_ids)
            is_completed = completed_count == exercises_count
            
        # Determinar status
        status = "locked"
        if last_level_completed:
            status = "unlocked"
        if is_completed:
            status = "completed"
            
        result.append({
            "id": lvl.id,
            "title": lvl.title,
            "description": lvl.description,
            "icon": lvl.icon,
            "order_index": lvl.order_index,
            "status": status,
            "exercises_count": exercises_count,
            "completed_count": completed_count
        })
        
        last_level_completed = is_completed
        
    return result

@router.get("/level/{level_id}/exercises")
async def get_level_exercises(
    level_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("sql_skills"))
):
    """Obtiene los ejercicios de un nivel específico."""
    lvl = db.query(SQLLevel).filter(SQLLevel.id == level_id).first()
    if not lvl:
        raise HTTPException(status_code=404, detail="Nivel no encontrado")
        
    exercises = db.query(SQLExercise).filter(
        SQLExercise.level_id == level_id,
        SQLExercise.is_active == True
    ).order_by(SQLExercise.order_num).all()
    
    # Progress map
    progress_map = {
        p.exercise_id: p for p in db.query(UserSQLProgress).filter(
            UserSQLProgress.user_id == current_user.id
        ).all()
    }
    
    result = []
    for ex in exercises:
        prog = progress_map.get(ex.id)
        result.append({
            "id": ex.id,
            "title": ex.title,
            "category": ex.category,
            "order_num": ex.order_num,
            "difficulty": ex.difficulty,
            "xp_reward": ex.xp_reward,
            "exercise_type": ex.exercise_type,
            "completed": prog.completed if prog else False,
            "attempts": prog.attempts if prog else 0,
        })
    return result

# ──────────────────────────────────────────────
# MOTOR DE EJECUCIÓN SQLite EN MEMORIA
# ──────────────────────────────────────────────

ALLOWED_PREFIXES = ("select", "with", "explain")

def _is_safe_query(query: str) -> bool:
    """Solo permite SELECT, WITH (CTE) y EXPLAIN. Bloquea DDL/DML."""
    clean = query.strip().lower()
    # Elimina comentarios SQL de una línea
    clean = re.sub(r'--[^\n]*', '', clean)
    # Elimina comentarios de bloque
    clean = re.sub(r'/\*.*?\*/', '', clean, flags=re.DOTALL)
    clean = clean.strip()
    return any(clean.startswith(p) for p in ALLOWED_PREFIXES)


def _execute_in_memory(schema_sql: str, seed_sql: str, query: str) -> dict:
    """
    Ejecuta una query sobre una base de datos SQLite en memoria
    con un tiempo de ejecución limitado a 10 segundos.
    """
    start_time = time.time()
    def progress_handler():
        if time.time() - start_time > 10.0:
            return 1 # Interrumpe la ejecución
        return 0

    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.set_progress_handler(progress_handler, 100) # Chequear cada 100 instrucciones

    try:
        conn.executescript(schema_sql)
        conn.executescript(seed_sql)
        cursor = conn.execute(query)
        columns = [d[0] for d in cursor.description] if cursor.description else []
        rows = [list(r) for r in cursor.fetchall()]
        return {"columns": columns, "rows": rows}
    except sqlite3.Error as e:
        if "interrupted" in str(e).lower() or "progress routine" in str(e).lower():
            raise ValueError("Tiempo de ejecución de SQL excedido (Límite: 10s)")
        raise ValueError(str(e))
    except Exception as e:
        raise ValueError(f"Error inesperado: {str(e)}")
    finally:
        conn.close()


def _compute_expected(schema_sql: str, seed_sql: str, solution_sql: str) -> str:
    """Calcula y serializa el resultado esperado de la solución."""
    result = _execute_in_memory(schema_sql, seed_sql, solution_sql)
    return json.dumps(result)


def _norm_val(v):
    """
    Normaliza un valor para comparación robusta:
    - None  → None
    - Numérico (int/float) → float redondeado a 6 decimales
    - Texto → string stripped y lowercase
    """
    if v is None:
        return None
    # Intentar conversión numérica
    try:
        f = float(str(v))
        return round(f, 6)
    except (ValueError, TypeError):
        return str(v).strip().lower()


def _results_match(actual: dict, expected_json: str) -> bool:
    """Compara resultado del alumno con el esperado (mismas filas, mismo orden)."""
    try:
        expected = json.loads(expected_json)
        def norm(rows):
            return [[_norm_val(v) for v in row] for row in rows]
        a_rows = norm(actual.get("rows", []))
        e_rows = norm(expected.get("rows", []))
        return a_rows == e_rows
    except Exception:
        return False


# ──────────────────────────────────────────────
# ENDPOINTS PÚBLICOS (alumno autenticado)
# ──────────────────────────────────────────────

@router.get("/datasets")
def get_datasets(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("sql_skills"))
):
    datasets = db.query(SQLDataset).all()

    # Count completed exercises per dataset for this user in one query
    completed_per_dataset = dict(
        db.query(SQLExercise.dataset_id, func.count(UserSQLProgress.id))
        .join(
            UserSQLProgress,
            (UserSQLProgress.exercise_id == SQLExercise.id) &
            (UserSQLProgress.user_id == current_user.id) &
            (UserSQLProgress.completed == True)
        )
        .group_by(SQLExercise.dataset_id)
        .all()
    )

    return [
        {
            "id": d.id,
            "name": d.name,
            "description": d.description,
            "er_diagram_url": d.er_diagram_url,
            "exercise_count": sum(1 for ex in d.exercises if ex.is_active),
            "completed_count": completed_per_dataset.get(d.id, 0),
        }
        for d in datasets
    ]


@router.get("/datasets/{dataset_id}/schema")
def get_dataset_schema(
    dataset_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    dataset = db.query(SQLDataset).filter(SQLDataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset no encontrado")

    # Ejecutamos el schema en una DB en memoria para inspeccionarla con PRAGMA
    conn = sqlite3.connect(":memory:")
    try:
        conn.executescript(dataset.schema_sql)
        cursor = conn.cursor()
        
        # Obtener tablas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        tables = [row[0] for row in cursor.fetchall()]
        
        schema = []
        for table in tables:
            cursor.execute(f"PRAGMA table_info({table})")
            columns = [
                {
                    "name": row[1],
                    "type": row[2],
                    "pk": bool(row[5])
                }
                for row in cursor.fetchall()
            ]
            schema.append({"table": table, "columns": columns})
            
        return schema
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar el esquema: {str(e)}")
    finally:
        conn.close()


@router.get("/exercises")
def get_exercises(
    dataset_id: Optional[int] = None,
    exercise_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("sql_skills"))
):
    q = db.query(SQLExercise).filter(SQLExercise.is_active == True)
    if dataset_id:
        q = q.filter(SQLExercise.dataset_id == dataset_id)
    if exercise_type:
        q = q.filter(SQLExercise.exercise_type == exercise_type)
    elif dataset_id:
        # When filtering by dataset, only return free_query exercises (the main ones)
        q = q.filter(SQLExercise.exercise_type == "free_query")
    exercises = q.order_by(SQLExercise.order_num.asc()).all()

    # Progreso del usuario
    progress_map = {
        p.exercise_id: p
        for p in db.query(UserSQLProgress).filter(UserSQLProgress.user_id == current_user.id).all()
    }

    result = []
    for ex in exercises:
        prog = progress_map.get(ex.id)
        # Normalize category
        category = ex.category
        if category:
            category = re.sub(r'^\d+\s*[-–]\s*', '', category)
            
        result.append({
            "id": ex.id,
            "title": ex.title,
            "category": category,
            "order_num": ex.order_num,
            "difficulty": ex.difficulty,
            "xp_reward": ex.xp_reward,
            "exercise_type": ex.exercise_type or "free_query",
            "is_free": getattr(ex, 'is_free', False),
            "completed": prog.completed if prog else False,
            "attempts": prog.attempts if prog else 0,
        })
    return result


@router.get("/modes")
def get_modes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns exercise counts and user progress for each non-free_query mode."""
    modes = ["fill_blank", "find_bug", "order_clauses", "reverse_query"]
    result = []
    for mode in modes:
        total = db.query(SQLExercise).filter(
            SQLExercise.is_active == True,
            SQLExercise.exercise_type == mode
        ).count()
        completed = (
            db.query(UserSQLProgress)
            .join(SQLExercise, SQLExercise.id == UserSQLProgress.exercise_id)
            .filter(
                UserSQLProgress.user_id == current_user.id,
                UserSQLProgress.completed == True,
                SQLExercise.exercise_type == mode
            ).count()
        )
        result.append({
            "mode": mode,
            "total": total,
            "completed": completed
        })
    return result


@router.get("/exercises/{exercise_id}")
def get_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ex = db.query(SQLExercise).filter(SQLExercise.id == exercise_id, SQLExercise.is_active == True).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")

    dataset = db.query(SQLDataset).filter(SQLDataset.id == ex.dataset_id).first()
    prog = db.query(UserSQLProgress).filter(
        UserSQLProgress.user_id == current_user.id,
        UserSQLProgress.exercise_id == exercise_id
    ).first()

    # Normalize category
    category = ex.category
    if category:
        category = re.sub(r'^\d+\s*[-–]\s*', '', category)

    return {
        "id": ex.id,
        "title": ex.title,
        "category": category,
        "order_num": ex.order_num,
        "difficulty": ex.difficulty,
        "description": ex.description,
        "wiki_title": ex.wiki_title,
        "wiki_content": ex.wiki_content,
        "wiki_syntax": ex.wiki_syntax,
        "wiki_example": ex.wiki_example,
        "xp_reward": ex.xp_reward,
        "dataset_name": dataset.name if dataset else "",
        "er_diagram_url": dataset.er_diagram_url if dataset else None,
        "completed": prog.completed if prog else False,
        "attempts": prog.attempts if prog else 0,
        "last_query": prog.last_query if prog else "",
        "expected_result": json.loads(ex.expected_result) if ex.expected_result else None,
        "exercise_type": ex.exercise_type or "free_query",
        "template_sql": ex.template_sql,
        "buggy_sql": ex.buggy_sql,
        "fragments": json.loads(ex.fragments) if ex.fragments else None,
    }


@router.post("/execute")
@limiter.limit("30/minute")
def execute_query(
    data: QueryRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_module_access("sql_skills"))
):
    try:
        ex = db.query(SQLExercise).filter(
            SQLExercise.id == data.exercise_id,
            SQLExercise.is_active == True
        ).first()
        if not ex:
            raise HTTPException(status_code=404, detail="Ejercicio no encontrado")

        dataset = db.query(SQLDataset).filter(SQLDataset.id == ex.dataset_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset no encontrado")

        # Seguridad: solo SELECT / WITH / EXPLAIN
        if not _is_safe_query(data.query):
            return {
                "ok": False,
                "error": "Solo se permiten consultas SELECT en SQL Skills.",
                "result": None,
                "is_correct": False,
            }

        # Ejecutar query del alumno en SQLite en memoria
        try:
            result = _execute_in_memory(dataset.schema_sql, dataset.seed_sql, data.query)
        except ValueError as sql_err:
            return {
                "ok": False,
                "error": f"Error SQL: {str(sql_err)}",
                "result": None,
                "is_correct": False,
            }

        # Comparar con resultado esperado
        is_correct = False
        if ex.expected_result:
            is_correct = _results_match(result, ex.expected_result)

        # Actualizar progreso del usuario (tolerante a fallos)
        xp_gained = 0
        leveled_up = False
        attempts = 1
        try:
            prog = db.query(UserSQLProgress).filter(
                UserSQLProgress.user_id == current_user.id,
                UserSQLProgress.exercise_id == data.exercise_id
            ).first()

            if not prog:
                prog = UserSQLProgress(
                    user_id=current_user.id,
                    exercise_id=data.exercise_id
                )
                db.add(prog)
                db.flush()

            prog.attempts = (prog.attempts or 0) + 1
            prog.last_query = data.query
            attempts = prog.attempts

            if is_correct and not prog.completed:
                prog.completed = True
                prog.completed_at = datetime.utcnow()
                if not prog.xp_awarded:
                    prog.xp_awarded = True
                    try:
                        leveled_up = current_user.add_xp(ex.xp_reward)
                        xp_gained = ex.xp_reward
                    except Exception:
                        pass  # XP no crítico; la consulta sigue siendo correcta

            db.commit()

        except Exception as db_err:
            db.rollback()
            # El resultado SQL sigue siendo válido aunque no podamos guardar el progreso
            pass

        return {
            "ok": True,
            "result": result,
            "is_correct": is_correct,
            "xp_gained": xp_gained,
            "leveled_up": leveled_up,
            "attempts": attempts,
        }

    except HTTPException:
        raise
    except Exception as e:
        return {
            "ok": False,
            "error": f"Error interno del servidor: {str(e)}",
            "result": None,
            "is_correct": False,
        }


@router.get("/exercises/{exercise_id}/solution")
def get_exercise_solution(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the solution SQL for an exercise only if the user has made ≥ 3 attempts.
    This encourages genuine effort before peeking at the answer.
    """
    ex = db.query(SQLExercise).filter(
        SQLExercise.id == exercise_id, SQLExercise.is_active == True
    ).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")

    prog = db.query(UserSQLProgress).filter(
        UserSQLProgress.user_id == current_user.id,
        UserSQLProgress.exercise_id == exercise_id
    ).first()

    attempts = prog.attempts if prog else 0
    if attempts < 3:
        raise HTTPException(
            status_code=403,
            detail=f"Necesitas al menos 3 intentos para ver la solución (llevas {attempts})"
        )

    return {"solution_sql": ex.solution_sql, "attempts": attempts}


@router.get("/progress")
def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = db.query(SQLExercise).filter(SQLExercise.is_active == True).count()
    completed = db.query(UserSQLProgress).filter(
        UserSQLProgress.user_id == current_user.id,
        UserSQLProgress.completed == True
    ).count()
    return {"total": total, "completed": completed}


# ──────────────────────────────────────────────
# ENDPOINTS ADMIN
# ──────────────────────────────────────────────

# Alias local para mantener compatibilidad con los Depends existentes
_require_admin = require_developer  # admin + developer


@router.get("/admin/datasets")
def admin_get_datasets(db: Session = Depends(get_db), _: User = Depends(_require_admin)):
    datasets = db.query(SQLDataset).all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "description": d.description,
            "schema_sql": d.schema_sql,
            "seed_sql": d.seed_sql,
            "er_diagram_url": d.er_diagram_url,
            "exercise_count": len(d.exercises),
        }
        for d in datasets
    ]


@router.post("/admin/datasets")
def admin_create_dataset(data: DatasetCreate, db: Session = Depends(get_db), _: User = Depends(_require_admin)):
    dataset = SQLDataset(**data.dict())
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return {"ok": True, "id": dataset.id}


@router.put("/admin/datasets/{dataset_id}")
def admin_update_dataset(
    dataset_id: int, 
    data: DatasetUpdate, 
    db: Session = Depends(get_db), 
    _: User = Depends(_require_admin)
):
    dataset = db.query(SQLDataset).filter(SQLDataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset no encontrado")
    
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(dataset, key, value)
    
    db.commit()
    return {"ok": True}


@router.delete("/admin/datasets/{dataset_id}")
def admin_delete_dataset(
    dataset_id: int, 
    db: Session = Depends(get_db), 
    _: User = Depends(_require_admin)
):
    dataset = db.query(SQLDataset).filter(SQLDataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset no encontrado")
    
    # Eliminar ejercicios asociados primero por si acaso, aunque cascade debería manejarlo
    db.query(SQLExercise).filter(SQLExercise.dataset_id == dataset_id).delete()
    db.delete(dataset)
    db.commit()
    return {"ok": True}


@router.get("/admin/exercises")
def admin_get_exercises(db: Session = Depends(get_db), _: User = Depends(_require_admin)):
    exercises = db.query(SQLExercise).order_by(SQLExercise.dataset_id, SQLExercise.order_num).all()
    return [
        {
            "id": ex.id,
            "dataset_id": ex.dataset_id,
            "title": ex.title,
            "category": ex.category,
            "order_num": ex.order_num,
            "difficulty": ex.difficulty,
            "description": ex.description,
            "wiki_title": ex.wiki_title,
            "wiki_content": ex.wiki_content,
            "wiki_syntax": ex.wiki_syntax,
            "wiki_example": ex.wiki_example,
            "solution_sql": ex.solution_sql,
            "expected_result": ex.expected_result,
            "xp_reward": ex.xp_reward,
            "is_active": ex.is_active,
            "exercise_type": ex.exercise_type or "free_query",
            "template_sql": ex.template_sql,
            "buggy_sql": ex.buggy_sql,
            "fragments": ex.fragments,
        }
        for ex in exercises
    ]


@router.post("/admin/exercises")
def admin_create_exercise(data: ExerciseCreate, db: Session = Depends(get_db), _: User = Depends(_require_admin)):
    dataset = db.query(SQLDataset).filter(SQLDataset.id == data.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset no encontrado")

    # Calcular resultado esperado automáticamente
    try:
        expected = _compute_expected(dataset.schema_sql, dataset.seed_sql, data.solution_sql)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Error en la solución SQL: {str(e)}")

    ex = SQLExercise(**data.dict(), expected_result=expected)
    db.add(ex)
    db.commit()
    db.refresh(ex)
    return {"ok": True, "id": ex.id}


@router.put("/admin/exercises/{exercise_id}")
def admin_update_exercise(exercise_id: int, data: ExerciseUpdate, db: Session = Depends(get_db), _: User = Depends(_require_admin)):
    ex = db.query(SQLExercise).filter(SQLExercise.id == exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")

    update_data = data.dict(exclude_unset=True)

    # Si se actualiza la solución, recalcular expected_result
    if "solution_sql" in update_data:
        dataset = db.query(SQLDataset).filter(SQLDataset.id == ex.dataset_id).first()
        try:
            update_data["expected_result"] = _compute_expected(dataset.schema_sql, dataset.seed_sql, update_data["solution_sql"])
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Error en la solución SQL: {str(e)}")

    for key, value in update_data.items():
        setattr(ex, key, value)

    db.commit()
    return {"ok": True}


@router.delete("/admin/exercises/{exercise_id}")
def admin_delete_exercise(exercise_id: int, db: Session = Depends(get_db), _: User = Depends(_require_admin)):
    ex = db.query(SQLExercise).filter(SQLExercise.id == exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
    db.delete(ex)
    db.commit()
    return {"ok": True}


@router.post("/admin/exercises/{exercise_id}/recompute")
def admin_recompute_expected(exercise_id: int, db: Session = Depends(get_db), _: User = Depends(_require_admin)):
    """Recalcula el expected_result de un ejercicio (útil si cambia el seed)."""
    ex = db.query(SQLExercise).filter(SQLExercise.id == exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
    dataset = db.query(SQLDataset).filter(SQLDataset.id == ex.dataset_id).first()
    try:
        ex.expected_result = _compute_expected(dataset.schema_sql, dataset.seed_sql, ex.solution_sql)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    db.commit()
    return {"ok": True}
