"""
update_content.py — Actualizar contenido existente en BD
Incluye: actualización de labs Linux L1, restauraciones.
Uso: python scripts/maintenance/update_content.py
"""
import sys, os
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRIPTS_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_ROOT)
sys.path.insert(0, SCRIPTS_DIR)

import importlib.util, traceback

def run_update(script_name, scripts_dir):
    script_path = os.path.join(scripts_dir, f"{script_name}.py")
    if not os.path.exists(script_path):
        print(f"  ⚠️  {script_name}.py no encontrado, omitiendo.")
        return
    try:
        spec = importlib.util.spec_from_file_location(script_name, script_path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        print(f"  ✅ {script_name} ejecutado.")
    except Exception as e:
        print(f"  ❌ {script_name}: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    print("\n🔧 Ejecutando scripts de actualización de contenido...")
    run_update("update_l1_content", SCRIPTS_DIR)
    run_update("safe_restore_l1", SCRIPTS_DIR)
    print("\n✅ Actualización completada.")
