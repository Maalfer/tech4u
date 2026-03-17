"""
seed_users.py — Demo Users seed wrapper
Agrupa: seed_usuarios_part1, seed_usuarios_part2

PROTECCIÓN ANTI-DUPLICADOS:
  Comprueba si ya existe un User con role='alumno' en la BD.
  Si existe → skip completo del grupo.
  (Los usuarios admin/developer de producción no se crean aquí.)
"""
import sys, os, importlib.util, traceback

BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRIPTS_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_ROOT)
sys.path.insert(0, SCRIPTS_DIR)


def _already_seeded() -> bool:
    """True si ya existen usuarios de demo en la BD."""
    try:
        from database import SessionLocal, User
        db = SessionLocal()
        try:
            return db.query(User).filter(User.role == "alumno").count() > 0
        finally:
            db.close()
    except Exception as e:
        print(f"  ⚠️  Guard check falló ({e}) — ejecutando seed igualmente.")
        return False


def run():
    print("\n👤 [5/6] Seeding Users...")

    if _already_seeded():
        print("  ✅ Usuarios alumno ya existen en la BD — omitiendo grupo (sin duplicados).")
        return

    scripts = [
        "seed_usuarios_part1",
        "seed_usuarios_part2",
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
