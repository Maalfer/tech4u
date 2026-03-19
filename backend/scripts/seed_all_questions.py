import subprocess
import os
import sys

# Determinar rutas
# Este script vive en backend/scripts/seed_all_questions.py
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPTS_DIR)

# Lista de scripts de seeding a ejecutar (rutas relativas al root del backend)
SEED_SCRIPTS = [
    ("seed_new_questions.py", "Preguntas Generales (Ciberseguridad, Progra, Marcas)"),
    ("seed_hardware_questions.py", "Preguntas de Hardware"),
    ("scripts/seed_recent_qs.py", "Preguntas Recientes (Bases de Datos, Redes)"),
    ("seed_sql_new_datasets.py", "Ejercicios SQL (Nuevos Datasets)"),
    ("seed_sql_skills.py", "Ejercicios SQL (Skills)"),
    ("seed_empresa_it.py", "Dataset SQL Empresa IT"),
    ("seed_extra_exercises.py", "Ejercicios Extra"),
    ("seed_roadmap_levels.py", "Niveles de Roadmap"),
    ("scripts/seed_skill_labs_new_subjects.py", "Skill Labs (Nuevas Materias)"),
    ("scripts/seed_linux_fundamentals.py", "Fundamentos de Linux (Labs)"),
    ("scripts/seed_bash_part1.py", "Bash Scripting - Parte 1"),
    ("seed_teoria_startup.py", "Guías de Teoría"),
    ("seed_level1_premium.py", "Contenido Premium Nivel 1"),
    ("seed_pokemon.py", "Proyecto Pokemon (Dataset)"),
    ("seed_modes_extended.py", "Modos Interactivos SQL (400 ejercicios)"),
    ("seed_new_modes.py", "Nuevos Modos SQL"),
]

def print_db_summary(db_path=None):
    """Muestra un resumen de todos los contenidos en la base de datos."""
    print("\n" + "="*80)
    print("📊 RESUMEN DE CONTENIDOS (TOTAL ACUMULADO)")
    print("="*80)
    try:
        from database import SessionLocal, Question, SkillLabExercise
        db = SessionLocal()
        
        q_count = db.query(Question).count()
        print(f"  📝 Preguntas de Test (Question): {q_count}")
        
        try:
            from database import SQLExercise
            s_count = db.query(SQLExercise).count()
            print(f"  💻 Ejercicios SQL (SQLExercise): {s_count}")
        except: s_count = 0
            
        try:
            from database import SkillLabExercise
            l_count = db.query(SkillLabExercise).count()
            print(f"  🧪 Skill Labs (SkillLabExercise): {l_count}")
        except: l_count = 0

        total = q_count + s_count + l_count
        print("-" * 40)
        print(f"  🚀 TOTAL EJERCICIOS: {total}")
        print("="*80 + "\n")
        db.close()
    except Exception as e:
        print(f"  ⚠ No se pudo generar el resumen: {e}")

def run_seeds():
    python_exe = sys.executable
    print("\n" + "="*80)
    print("🚀 TECH4U MASTER SEEDING SCRIPT (Subprocess Mode)")
    print("="*80)
    
    total_executed = 0
    total_failed = 0
    
    # Asegurarse de que PYTHONPATH incluya el root del backend
    env = os.environ.copy()
    env["PYTHONPATH"] = BACKEND_DIR + os.pathsep + env.get("PYTHONPATH", "")
    
    for rel_path, description in SEED_SCRIPTS:
        abs_path = os.path.join(BACKEND_DIR, rel_path)
        print(f"\n🔹 {description} ({rel_path})...")
        
        if not os.path.exists(abs_path):
            print(f"  ⚠ SALTADO: No se encuentra el archivo en {abs_path}")
            continue
            
        try:
            # Ejecutar el script en un nuevo proceso
            result = subprocess.run(
                [python_exe, abs_path], 
                cwd=BACKEND_DIR, 
                env=env,
                capture_output=False, 
                text=True
            )
            
            if result.returncode == 0:
                print(f"  ✅ ÉXITO: {rel_path} finalizado correctamente.")
                total_executed += 1
            else:
                print(f"  ❌ FALLO: {rel_path} terminó con código {result.returncode}.")
                total_failed += 1
        except Exception as e:
            print(f"  ❌ ERROR ejecutando {rel_path}: {e}")
            total_failed += 1
            
    print("\n" + "="*80)
    print("🏁 RESUMEN DEL PROCESO")
    print("="*80)
    print(f"  ✅ Ejecutados con éxito: {total_executed}")
    print(f"  ❌ Fallidos: {total_failed}")
    print(f"  📊 Total intentados: {len(SEED_SCRIPTS)}")
    print("="*80 + "\n")
    
    # Mostrar resumen final
    print_db_summary()
    
    print("Si el recuento total sigue por debajo de 1000, los archivos JSON faltantes son necesarios.")

if __name__ == "__main__":
    run_seeds()
