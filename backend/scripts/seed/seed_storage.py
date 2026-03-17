"""
seed_storage.py — Storage Labs seed wrapper
Agrupa: seed_storage, seed_storage_v2_part1/2/3

PROTECCIÓN ANTI-DUPLICADOS:
  Comprueba si ya existe un SkillPath llamado "Almacenamiento" o "Storage".
  Si existe → skip completo del grupo.
"""
import sys, os, importlib.util, traceback

BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRIPTS_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_ROOT)
sys.path.insert(0, SCRIPTS_DIR)


def _already_seeded() -> bool:
    """True si los labs de Storage ya están en la BD."""
    try:
        from database import SessionLocal, SkillPath
        db = SessionLocal()
        try:
            return db.query(SkillPath).filter(
                SkillPath.title.ilike("%Almacenamiento%") |
                SkillPath.title.ilike("%Storage%") |
                SkillPath.title.ilike("%RAID%")
            ).first() is not None
        finally:
            db.close()
    except Exception as e:
        print(f"  ⚠️  Guard check falló ({e}) — ejecutando seed igualmente.")
        return False


def run():
    print("\n💾 [3/6] Seeding Storage Labs...")

    if _already_seeded():
        print("  ✅ SkillPath 'Storage/Almacenamiento' ya existe — omitiendo grupo (sin duplicados).")
        return

    scripts = [
        "seed_storage",
        "seed_storage_v2_part1",
        "seed_storage_v2_part2",
        "seed_storage_v2_part3",
    ]

    for name in scripts:
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


if __name__ == "__main__":
    run()
