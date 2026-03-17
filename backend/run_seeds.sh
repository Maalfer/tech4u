#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Tech4U Academy — Ejecutar todos los seeds pendientes
#  Uso: cd /ruta/backend && bash run_seeds.sh
# ═══════════════════════════════════════════════════════════════

set -e
cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║       Tech4U Academy — Seeds pendientes              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

run_seed() {
    local script=$1
    local desc=$2
    echo "──────────────────────────────────────────────────────"
    echo "▶  $desc"
    echo "   Script: scripts/$script"
    echo ""
    python3 scripts/$script && echo "✅  OK" || echo "⚠️   Error en $script (continuando...)"
    echo ""
}

# ── Teoría: Ciberseguridad (OWASP, Kali, Criptografía, Firewall, Forense)
run_seed "seed_teoria_ciberseguridad.py" "Teoría Ciberseguridad general (5 guías)"

# ── Teoría: eJPTv2 (7 módulos completos de preparación al examen)
run_seed "seed_ejptv2_teoria.py" "Teoría eJPTv2 - Junior Penetration Tester (7 módulos)"

# ── Skill Labs: Ciberseguridad, PowerShell, Git, Python (113 ejercicios)
run_seed "seed_skill_labs_new_subjects.py" "Skill Labs nuevas materias (113 ejercicios)"

# ── Linux Labs: Networking, Services, Security (55 labs)
run_seed "seed_linux_labs_new_paths.py" "Linux Labs nuevas rutas (55 labs)"

# ── NetLabs avanzados: OSPF, BGP, IPv6, Port Security, etc.
run_seed "seed_netlabs_advanced_p1.py" "NetLabs avanzados parte 1"
run_seed "seed_netlabs_advanced_p2.py" "NetLabs avanzados parte 2"
run_seed "seed_netlabs_advanced_p3.py" "NetLabs avanzados parte 3"

echo "══════════════════════════════════════════════════════"
echo "✅  Todos los seeds completados."
echo ""
echo "  Recuerda reiniciar el backend si es necesario:"
echo "  sudo systemctl restart tech4u-backend"
echo "  (o pm2 restart all, según tu config)"
echo "══════════════════════════════════════════════════════"
echo ""
