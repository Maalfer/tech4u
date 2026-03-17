"""
inspect_db.py — Inspeccionar estado de la base de datos
Uso: python scripts/debug/inspect_db.py
⚠️  Solo para desarrollo/debugging. No ejecutar en producción sin supervisión.
"""
import sys, os
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRIPTS_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_ROOT)
sys.path.insert(0, SCRIPTS_DIR)

if __name__ == "__main__":
    import importlib.util
    script_path = os.path.join(SCRIPTS_DIR, "inspect_db.py")
    spec = importlib.util.spec_from_file_location("inspect_db_orig", script_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
