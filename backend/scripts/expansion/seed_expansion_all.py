import os
import subprocess
import sys

# Determinar rutas
EXPANSION_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPTS = [
    "seed_bbdd.py",
    "seed_redes.py",
    "seed_sistemas.py",
    "seed_ciber.py",
    "seed_hardware.py",
    "seed_marcas.py",
    "seed_programacion.py"
]

def run_expansion():
    print("🚀 INICIANDO EXPANSIÓN MASIVA DE CONTENIDOS (+2000 PLANIFICADOS)")
    print("="*60)
    
    # Asegurar PYTHONPATH
    BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    env = os.environ.copy()
    env["PYTHONPATH"] = f"{BACKEND_DIR}:{EXPANSION_DIR}:{env.get('PYTHONPATH', '')}"

    total_added = 0
    total_updated = 0

    for script in SCRIPTS:
        script_path = os.path.join(EXPANSION_DIR, script)
        if not os.path.exists(script_path):
            print(f"⚠️  Saltando {script}: No encontrado.")
            continue
            
        print(f"📦 Ejecutando {script}...")
        try:
            # Ejecutamos con el python actual
            result = subprocess.run([sys.executable, script_path], env=env, capture_output=True, text=True)
            if result.returncode == 0:
                print(result.stdout.strip())
            else:
                print(f"❌ Error en {script}:")
                print(result.stderr)
        except Exception as e:
            print(f"❌ Fallo crítico ejecutando {script}: {e}")

    print("\n" + "="*60)
    print("✅ EXPANSIÓN COMPLETADA")
    print("="*60)

if __name__ == "__main__":
    run_expansion()
