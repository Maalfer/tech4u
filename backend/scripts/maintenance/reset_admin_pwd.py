"""
reset_admin_pwd.py — Resetear contraseña del admin
Uso: python scripts/maintenance/reset_admin_pwd.py
"""
import sys, os
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRIPTS_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_ROOT)
sys.path.insert(0, SCRIPTS_DIR)

if __name__ == "__main__":
    import importlib.util
    script_path = os.path.join(SCRIPTS_DIR, "reset_admin_pwd.py")
    spec = importlib.util.spec_from_file_location("reset_admin_pwd", script_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
