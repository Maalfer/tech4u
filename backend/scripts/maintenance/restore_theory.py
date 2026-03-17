"""
restore_theory.py — Restaurar contenido de teoría
Uso: python scripts/maintenance/restore_theory.py
"""
import sys, os
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRIPTS_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_ROOT)
sys.path.insert(0, SCRIPTS_DIR)

if __name__ == "__main__":
    import importlib.util
    script_path = os.path.join(SCRIPTS_DIR, "restore_theory.py")
    spec = importlib.util.spec_from_file_location("restore_theory_orig", script_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
