"""
seed_netlabs.py — NetLabs seed wrapper
Agrupa: seed_netlabs_acl_vlan, seed_netlabs_advanced, seed_netlabs_advanced_p1/2/3

PROTECCIÓN ANTI-DUPLICADOS:
  Comprueba si ya existen escenarios NetLab en la BD (tabla netlabs_scenarios).
  Si el conteo > 0 → skip completo del grupo.
"""
import sys, os, importlib.util, traceback

BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRIPTS_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_ROOT)
sys.path.insert(0, SCRIPTS_DIR)


def _already_seeded() -> bool:
    """True si ya hay escenarios NetLab en la BD."""
    try:
        from database import SessionLocal, NetLabScenario
        db = SessionLocal()
        try:
            return db.query(NetLabScenario).count() > 0
        finally:
            db.close()
    except Exception as e:
        print(f"  ⚠️  Guard check falló ({e}) — ejecutando seed igualmente.")
        return False


def run():
    print("\n🌐 [2/6] Seeding NetLabs...")

    if _already_seeded():
        print("  ✅ NetLabScenarios ya existen en la BD — omitiendo grupo (sin duplicados).")
        return

    scripts = [
        "seed_netlabs_acl_vlan",
        "seed_netlabs_advanced",
        "seed_netlabs_advanced_p1",
        "seed_netlabs_advanced_p2",
        "seed_netlabs_advanced_p3",
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
