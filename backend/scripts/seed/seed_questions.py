"""
seed_questions.py — Questions, Tests & Skill Labs seed wrapper
Agrupa: seed_recent_qs, bulk_insert_tests, bulk_insert_skill_labs,
        seed_skill_labs_new_subjects, seed_new_questions,
        seed_sql_new_datasets, seed_sql_skills, seed_hardware_questions,
        seed_extra_exercises, seed_empresa_it

PROTECCIÓN ANTI-DUPLICADOS:
  Comprueba si ya hay Questions en la BD (count > 0).
  Si existen → skip completo del grupo.
"""
import sys, os, importlib.util, traceback

BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRIPTS_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_ROOT)
sys.path.insert(0, SCRIPTS_DIR)


def _already_seeded() -> bool:
    """True si ya hay preguntas en la BD."""
    try:
        from database import SessionLocal, Question
        db = SessionLocal()
        try:
            return db.query(Question).count() > 0
        finally:
            db.close()
    except Exception as e:
        print(f"  ⚠️  Guard check falló ({e}) — ejecutando seed igualmente.")
        return False


def run():
    print("\n❓ [6/6] Seeding Questions, Tests & Skill Labs...")

    if _already_seeded():
        print("  ✅ Questions ya existen en la BD — omitiendo grupo (sin duplicados).")
        return

    # Scripts en scripts/
    scripts_in_scripts = [
        "seed_recent_qs",
        "bulk_insert_tests",
        "bulk_insert_skill_labs",
        "seed_skill_labs_new_subjects",
    ]

    # Seeds en backend root
    seeds_in_backend_root = [
        "seed_new_questions",
        "seed_sql_new_datasets",
        "seed_sql_skills",
        "seed_hardware_questions",
        "seed_extra_exercises",
        "seed_empresa_it",
    ]

    for name in scripts_in_scripts:
        path = os.path.join(SCRIPTS_DIR, f"{name}.py")
        if not os.path.exists(path):
            print(f"  ⚠️  {name}.py no encontrado, omitiendo.")
            continue
        try:
            spec = importlib.util.spec_from_file_location(name, path)
            mod  = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            if hasattr(mod, "seed"):
                mod.seed()
            print(f"  ✅ {name}")
        except Exception as e:
            print(f"  ❌ {name}: {e}")
            traceback.print_exc()

    for name in seeds_in_backend_root:
        path = os.path.join(BACKEND_ROOT, f"{name}.py")
        if not os.path.exists(path):
            print(f"  ⚠️  {name}.py no encontrado en backend root, omitiendo.")
            continue
        try:
            spec = importlib.util.spec_from_file_location(name, path)
            mod  = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            if hasattr(mod, "seed"):
                mod.seed()
            print(f"  ✅ {name}")
        except Exception as e:
            print(f"  ❌ {name}: {e}")
            traceback.print_exc()


if __name__ == "__main__":
    run()
