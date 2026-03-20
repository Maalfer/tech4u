#!/usr/bin/env python3
"""
Master runner for all Terminal Skills seed scripts.
Executes all modules in order, skipping duplicates automatically.

Usage:
    python run_terminal_skills.py
"""
import os
import sys
import subprocess
from pathlib import Path

SCRIPTS_DIR = Path(__file__).parent

# All Terminal Skills seed scripts in module order
SEED_SCRIPTS = [
    "seed_terminal_m0_texto.py",          # M0 Intro + M1 Texto y Filtros
    "seed_terminal_pipes.py",             # M2 Pipes y Redirecciones
    "seed_terminal_busqueda.py",          # M3 Búsqueda en el Sistema
    "seed_terminal_paquetes_servicios.py",# M4 Paquetes + M5 Servicios/Systemd
    "seed_terminal_compresion.py",        # M6 Compresión y Archivado
    "seed_terminal_cron_editores.py",     # M7 Cron/Automatización + M8 Editores
    "seed_terminal_variables_env.py",     # M9 Variables y Entorno
    "seed_terminal_ctf.py",              # M10 CTF Terminal
]

def run_script(script_name: str) -> bool:
    script_path = SCRIPTS_DIR / script_name
    if not script_path.exists():
        print(f"  ⚠️  SKIPPED (file not found): {script_name}")
        return False

    result = subprocess.run(
        [sys.executable, str(script_path)],
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        output = result.stdout.strip()
        print(f"  ✅ {output if output else script_name + ' OK'}")
        return True
    else:
        print(f"  ❌ FAILED: {script_name}")
        if result.stderr:
            print(f"     Error: {result.stderr.strip()[:300]}")
        return False

def main():
    print("=" * 60)
    print("  Terminal Skills — Master Seed Runner")
    print("=" * 60)
    print()

    success = 0
    failed = 0
    skipped = 0

    for script in SEED_SCRIPTS:
        result = run_script(script)
        if result is True:
            success += 1
        elif result is False:
            script_path = SCRIPTS_DIR / script
            if not script_path.exists():
                skipped += 1
            else:
                failed += 1

    print()
    print("=" * 60)
    print(f"  Completado: {success} OK | {failed} fallidos | {skipped} no encontrados")
    print("=" * 60)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
