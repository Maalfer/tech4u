import subprocess
import os
import sys

# Determinar rutas
# Este script vive en backend/scripts/seed_all_questions.py
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPTS_DIR)

# Lista de scripts de seeding a ejecutar (rutas relativas al root del backend)
SEED_SCRIPTS = [
    # --- THEORY / TEST QUESTIONS (Question table) ---
    ("seed_new_questions.py", "Preguntas: Generales (Ciberseguridad, Progra, Marcas)"),
    ("seed_hardware_questions.py", "Preguntas: Hardware (Fundamentos)"),
    ("seed.py", "Preguntas: Demo (BBDD, Redes, SSOO)"),
    ("scripts/seed_recent_qs.py", "Preguntas: Recientes (BBDD, Redes)"),

    # --- SQL EXERCISES (SQLExercise table) ---
    ("seed_sql_skills.py", "SQL Dataset: Tienda + 36 Ejercicios"),
    ("seed_pokemon.py", "SQL Dataset: Pokémon + 37 Ejercicios"),
    ("seed_empresa_it.py", "SQL Dataset: Empresa IT + 30 Ejercicios"),
    ("seed_sql_new_datasets.py", "SQL Datasets: HR, Ventas, Cine, Blog"),
    ("seed_new_modes.py", "SQL Modos: Hueco, Bug, Orden, Inversa"),
    ("seed_modes_extended.py", "SQL Expansión: +400 Ejercicios interactivos"),
    ("seed_extra_exercises.py", "SQL Miscelánea: Ejercicios adicionales"),

    # --- SKILL LABS / DRAG & DROP (SkillLabExercise table) ---
    ("scripts/seed_usuarios_part1.py", "Labs: Linux (Usuarios y Grupos - P1)"),
    ("scripts/seed_usuarios_part2.py", "Labs: Linux (Usuarios y Grupos - P2)"),
    ("scripts/seed_bash_part1.py", "Labs: Linux (Bash Scripting - P1)"),
    ("scripts/seed_bash_part2.py", "Labs: Linux (Bash Scripting - P2)"),
    ("scripts/seed_bash_part3.py", "Labs: Linux (Bash Scripting - P3)"),
    ("scripts/seed_linux_fundamentals.py", "Labs: Linux (Fundamentos)"),
    ("scripts/seed_linux_labs_new_paths.py", "Labs: Linux (Nuevas Rutas)"),
    ("scripts/seed_netlabs_acl_vlan.py", "Labs: Redes (ACL y VLAN)"),
    ("scripts/seed_netlabs_advanced.py", "Labs: Redes (Avanzado Full)"),
    ("scripts/seed_netlabs_advanced_p1.py", "Labs: Redes (Avanzado - P1)"),
    ("scripts/seed_netlabs_advanced_p2.py", "Labs: Redes (Avanzado - P2)"),
    ("scripts/seed_netlabs_advanced_p3.py", "Labs: Redes (Avanzado - P3)"),
    ("scripts/seed_storage.py", "Labs: Almacenamiento (Básico)"),
    ("scripts/seed_storage_v2_part1.py", "Labs: Almacenamiento (V2 - P1)"),
    ("scripts/seed_storage_v2_part2.py", "Labs: Almacenamiento (V2 - P2)"),
    ("scripts/seed_storage_v2_part3.py", "Labs: Almacenamiento (V2 - P3)"),
    ("scripts/seed_claude_labs_part1.py", "Labs: Especiales (Part 1)"),
    ("scripts/seed_claude_labs_part2.py", "Labs: Especiales (Part 2)"),
    ("scripts/seed_claude_labs_part3.py", "Labs: Especiales (Part 3)"),
    ("scripts/seed_skill_labs_new_subjects.py", "Labs: Materias Varias"),
    ("scripts/bulk_insert_skill_labs.py", "Labs: Carga Masiva (JSON)"),

    # --- THEORY GUIDES, ROADMAP & EXPANSION ---
    ("seed_teoria_startup.py", "Teoría: Guías de Inicio"),
    ("scripts/seed_teoria_all_guides.py", "Teoría: Todas las guías"),
    ("scripts/seed_teoria_ciberseguridad.py", "Teoría: Ciberseguridad (5 guías)"),
    ("scripts/seed_ejptv2_teoria.py", "Teoría: eJPTv2 (Preparación)"),
    ("scripts/seed_ejptv2_course.py", "Teoría: eJPTv2 (Curso)"),
    ("scripts/seed_teoria_acl_guide.py", "Teoría: Guías ACL"),
    ("seed_roadmap_levels.py", "Roadmap: Niveles de Progreso SQL"),
    ("seed_level1_premium.py", "Contenido: Premium Nivel 1"),
    ("scripts/expansion/seed_expansion_all.py", "EXPANSIÓN: +2000 preguntas Hardware, Redes, BBDD..."),
]

def print_db_summary(db_path=None):
    """Muestra un resumen de todos los contenidos en la base de datos."""
    print("\n" + "="*80)
    print("📊 RESUMEN DE CONTENIDOS (TOTAL ACUMULADO)")
    print("="*80)
    try:
        # Añadir el root del backend al path para importar database
        if BACKEND_DIR not in sys.path:
            sys.path.insert(0, BACKEND_DIR)
            
        from database import SessionLocal, Question
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
