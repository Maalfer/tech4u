#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║              Tech4U Academy — Unified Seed Runner               ║
╠══════════════════════════════════════════════════════════════════╣
║  Ejecuta todos los seeds de contenido en orden correcto.         ║
║                                                                  ║
║  Uso:                                                            ║
║    cd backend                                                    ║
║    python scripts/run_seed.py                                    ║
║    python scripts/run_seed.py --only=linux                       ║
║    python scripts/run_seed.py --only=theory                      ║
║    python scripts/run_seed.py --only=questions                   ║
║                                                                  ║
║  ⚠️  IMPORTANTE:                                                  ║
║     • Solo ejecutar manualmente, NUNCA en startup del servidor   ║
║     • Todos los seeds incluyen protección anti-duplicados        ║
║     • Orden: users → linux → storage → netlabs → theory → qs     ║
╚══════════════════════════════════════════════════════════════════╝
"""

import sys
import os
import argparse
import time

# ── Path setup ──────────────────────────────────────────────────────────────
SCRIPTS_DIR  = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.dirname(SCRIPTS_DIR)
sys.path.insert(0, BACKEND_ROOT)
sys.path.insert(0, SCRIPTS_DIR)

# ── Import seed modules ──────────────────────────────────────────────────────
from seed.seed_users     import run as run_users
from seed.seed_linux     import run as run_linux
from seed.seed_storage   import run as run_storage
from seed.seed_netlabs   import run as run_netlabs
from seed.seed_theory    import run as run_theory
from seed.seed_questions import run as run_questions
from seed.seed_coupons   import run as run_coupons

# ── Seed registry: (key, label, function) ──────────────────────────────────
SEEDS = [
    ("users",     "👤  Users",            run_users),
    ("linux",     "🐧  Linux & Bash Labs", run_linux),
    ("storage",   "💾  Storage Labs",      run_storage),
    ("netlabs",   "🌐  NetLabs",           run_netlabs),
    ("theory",    "📚  Teoría",            run_theory),
    ("questions", "❓  Questions & Tests", run_questions),
    ("coupons",   "🎟️  Coupons",           run_coupons),
]

# ── Runner ──────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Tech4U Academy — Seed Runner")
    parser.add_argument(
        "--only",
        type=str,
        default=None,
        help="Ejecutar solo un grupo: users, linux, storage, netlabs, theory, questions"
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="Listar grupos disponibles y salir"
    )
    args = parser.parse_args()

    if args.list:
        print("\nGrupos de seed disponibles:")
        for key, label, _ in SEEDS:
            print(f"  --only={key:<12}  {label}")
        print()
        return

    print("""
╔══════════════════════════════════════════════════════════════════╗
║              Tech4U Academy — Seed Runner                       ║
╚══════════════════════════════════════════════════════════════════╝
""")

    start = time.time()
    errors = []

    for key, label, fn in SEEDS:
        if args.only and args.only != key:
            continue
        try:
            fn()
        except Exception as e:
            errors.append((key, str(e)))
            print(f"\n  ❌ ERROR en {label}: {e}\n")

    elapsed = time.time() - start

    print(f"""
══════════════════════════════════════════════════════════════════
  Seed completado en {elapsed:.1f}s
  Errores: {len(errors)}
""")

    if errors:
        print("  Grupos con errores:")
        for key, err in errors:
            print(f"    • {key}: {err}")
        print()
        sys.exit(1)
    else:
        print("  ✅ Todo OK — base de datos lista para producción")
        print()


if __name__ == "__main__":
    main()
