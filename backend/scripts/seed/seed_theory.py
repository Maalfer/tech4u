"""
seed_theory.py — Theory (Teoría) seed wrapper
Agrupa: seed_teoria_all_guides, seed_teoria_acl_guide,
        seed_teoria_ciberseguridad, seed_ejptv2_teoria

PROTECCIÓN ANTI-DUPLICADOS:
  Comprueba si ya existe un TheorySubject con slug='redes' (primer subject
  que inserta seed_teoria_all_guides). Si existe → skip completo del grupo.
"""
import sys, os, importlib.util, traceback

BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRIPTS_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_ROOT)
sys.path.insert(0, SCRIPTS_DIR)


def _already_seeded() -> bool:
    """True si la teoría base ya está en la BD."""
    try:
        from database import SessionLocal, TheorySubject
        db = SessionLocal()
        try:
            return db.query(TheorySubject).filter(
                TheorySubject.slug == "redes"
            ).first() is not None
        finally:
            db.close()
    except Exception as e:
        print(f"  ⚠️  Guard check falló ({e}) — ejecutando seed igualmente.")
        return False


def run():
    print("\n📚 [4/6] Seeding Teoría...")

    if _already_seeded():
        print("  ✅ TheorySubject 'redes' ya existe — omitiendo grupo (sin duplicados).")
        return

    scripts = [
        "seed_teoria_all_guides",
        "seed_teoria_acl_guide",
        "seed_teoria_ciberseguridad",
        "seed_ejptv2_teoria",
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
