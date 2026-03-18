#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  Tech4U Academy — Seed completo de base de datos
#  Ejecución: sudo bash deploy/seed_all.sh
#  Propósito: poblar la BD con TODOS los datos (preguntas, labs, usuarios, VMs)
#  ⚠ AVISO: ejecutar solo UNA vez en BD vacía o tras un reset total
#  Para updates parciales, usa los seeds individuales
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Colores ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'
log()    { echo -e "${GREEN}${BOLD}[✓]${NC} $1"; }
warn()   { echo -e "${YELLOW}${BOLD}[⚠]${NC} $1"; }
error()  { echo -e "${RED}${BOLD}[✗]${NC} $1"; exit 1; }
step()   { echo -e "\n${BLUE}${BOLD}  → $1${NC}"; }
skipped(){ echo -e "${CYAN}  ⏭  $1 (omitido — ya ejecutado)${NC}"; }

[[ $EUID -ne 0 ]] && error "Ejecutar como root: sudo bash deploy/seed_all.sh"

# ── Config ────────────────────────────────────────────────────────────────────
APP_USER="tech4u"
APP_DIR="/opt/tech4u"
BACKEND_DIR="$APP_DIR/backend"
SCRIPTS_DIR="$BACKEND_DIR/scripts"
VENV="$BACKEND_DIR/venv"
PYTHON="$VENV/bin/python"
STAMP_DIR="/var/lib/tech4u/seeds"  # carpeta de control — evita re-ejecutar seeds

mkdir -p "$STAMP_DIR"

# Función para ejecutar un seed solo si no se ha ejecutado antes
run_seed() {
  local script_name="$1"
  local description="$2"
  local stamp="$STAMP_DIR/${script_name%.py}.done"

  if [[ -f "$stamp" ]]; then
    skipped "$description"
    return 0
  fi

  step "$description"
  if sudo -u "$APP_USER" bash -c "
    source '$VENV/bin/activate'
    export PYTHONPATH='$BACKEND_DIR'
    cd '$BACKEND_DIR'
    python '$1'
  "; then
    touch "$stamp"
    log "$description ✓"
  else
    warn "$description falló — revisa el log y vuelve a ejecutar si es necesario"
  fi
}

# Función para seeds que están en scripts/
run_script() {
  local script_name="$1"
  local description="$2"
  local stamp="$STAMP_DIR/${script_name%.py}.done"

  if [[ -f "$stamp" ]]; then
    skipped "$description"
    return 0
  fi

  step "$description"
  if sudo -u "$APP_USER" bash -c "
    source '$VENV/bin/activate'
    export PYTHONPATH='$BACKEND_DIR'
    cd '$BACKEND_DIR'
    python 'scripts/$script_name'
  "; then
    touch "$stamp"
    log "$description ✓"
  else
    warn "$description falló — continúa con el siguiente"
  fi
}

# ── Verificar que el backend está accesible ───────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}  Tech4U Academy — Seed completo de base de datos${NC}"
echo ""

[[ ! -d "$BACKEND_DIR" ]] && error "Backend no encontrado en $BACKEND_DIR. Ejecuta deploy.sh primero."
[[ ! -f "$PYTHON" ]]      && error "Virtualenv no encontrado. Ejecuta deploy.sh primero."

# Verificar conexión a BD
sudo -u "$APP_USER" bash -c "
  source '$VENV/bin/activate'
  export PYTHONPATH='$BACKEND_DIR'
  cd '$BACKEND_DIR'
  python -c 'from database import engine; engine.connect(); print(\"BD: conectada ✓\")'
" || error "No se puede conectar a la base de datos. Verifica .env y PostgreSQL."

echo ""
echo -e "${YELLOW}${BOLD}  ⚠ Este proceso puede tardar 10-30 minutos${NC}"
echo -e "${YELLOW}${BOLD}  Los seeds ya ejecutados se omiten automáticamente${NC}"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# FASE 1 — Estructura base (CRÍTICO: debe ir primero)
# ══════════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}${BOLD}── FASE 1: Estructura base ──${NC}"

run_seed "$BACKEND_DIR/seed.py" \
  "Seed principal — preguntas base (Redes, BD, SO, HW, Lenguaje de Marcas)"

run_script "crear_usuarios.py" \
  "Usuarios por defecto (admin, docente, estudiante demo)"

# ══════════════════════════════════════════════════════════════════════════════
# FASE 2 — Banco de preguntas extendido
# ══════════════════════════════════════════════════════════════════════════════
echo -e "\n${BLUE}${BOLD}── FASE 2: Banco de preguntas extendido ──${NC}"

run_script "seed_new_questions.py" \
  "Preguntas nuevas extendidas (todos los módulos)"

run_script "seed_hardware_questions.py" \
  "Preguntas Fundamentos de Hardware"

run_script "seed_level1_premium.py" \
  "Contenido premium Nivel 1"

run_script "seed_modes_extended.py" \
  "Modos extendidos (adaptive, timed, exam, errors)"

run_script "seed_empresa_it.py" \
  "Escenarios empresa IT (casos prácticos)"

# ══════════════════════════════════════════════════════════════════════════════
# FASE 3 — Labs y VMs de terminal
# ══════════════════════════════════════════════════════════════════════════════
echo -e "\n${BLUE}${BOLD}── FASE 3: Labs y VMs (Skill Labs) ──${NC}"

run_script "seed_skill_labs_new_subjects.py" \
  "Skill Labs — todas las asignaturas"

run_script "seed_claude_labs_part1.py" \
  "Labs interactivos Parte 1"

run_script "seed_claude_labs_part2.py" \
  "Labs interactivos Parte 2"

run_script "seed_claude_labs_part3.py" \
  "Labs interactivos Parte 3"

# ══════════════════════════════════════════════════════════════════════════════
# FASE 4 — Bash y Linux
# ══════════════════════════════════════════════════════════════════════════════
echo -e "\n${BLUE}${BOLD}── FASE 4: Bash & Linux ──${NC}"

run_script "seed_bash_part1.py" \
  "Scripting Bash — Parte 1 (variables, condicionales, bucles)"

run_script "seed_bash_part2.py" \
  "Scripting Bash — Parte 2 (funciones, arrays, regex)"

run_script "seed_bash_part3.py" \
  "Scripting Bash — Parte 3 (procesos, cron, señales)"

run_script "seed_linux_labs_new_paths.py" \
  "Labs Linux — rutas de aprendizaje nuevas"

# ══════════════════════════════════════════════════════════════════════════════
# FASE 5 — Redes / NetLabs avanzados
# ══════════════════════════════════════════════════════════════════════════════
echo -e "\n${BLUE}${BOLD}── FASE 5: Redes avanzadas (NetLabs) ──${NC}"

run_script "seed_netlabs_advanced_p1.py" \
  "NetLabs avanzados — Parte 1 (routing, VLANs)"

run_script "seed_netlabs_advanced_p2.py" \
  "NetLabs avanzados — Parte 2 (spanning-tree, trunking)"

run_script "seed_netlabs_advanced_p3.py" \
  "NetLabs avanzados — Parte 3 (troubleshooting, ACLs)"

# ══════════════════════════════════════════════════════════════════════════════
# FASE 6 — Almacenamiento y sistemas de ficheros
# ══════════════════════════════════════════════════════════════════════════════
echo -e "\n${BLUE}${BOLD}── FASE 6: Almacenamiento ──${NC}"

run_script "seed_storage_v2_part1.py" \
  "Almacenamiento v2 — Parte 1 (RAID, LVM, particionado)"

run_script "seed_storage_v2_part2.py" \
  "Almacenamiento v2 — Parte 2 (NFS, iSCSI, backup)"

# ══════════════════════════════════════════════════════════════════════════════
# FASE 7 — Certificaciones y cursos especializados
# ══════════════════════════════════════════════════════════════════════════════
echo -e "\n${BLUE}${BOLD}── FASE 7: Certificaciones ──${NC}"

run_script "seed_ejptv2_course.py" \
  "Curso eJPTv2 — contenido del curso"

run_script "seed_ejptv2_teoria.py" \
  "Curso eJPTv2 — teoría"

# ══════════════════════════════════════════════════════════════════════════════
# Resumen final
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  ✅  Seed completado${NC}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════${NC}"
echo ""

# Mostrar estadísticas de la BD
echo -e "${BOLD}  Estadísticas de la base de datos:${NC}"
sudo -u "$APP_USER" bash -c "
  source '$VENV/bin/activate'
  export PYTHONPATH='$BACKEND_DIR'
  cd '$BACKEND_DIR'
  python - <<'PYEOF'
from database import SessionLocal, engine
from sqlalchemy import text

db = SessionLocal()
tables = ['users', 'questions', 'labs', 'skill_lab_exercises', 'net_lab_scenarios',
          'theory_posts', 'video_courses', 'skill_paths', 'modules']
for t in tables:
    try:
        count = db.execute(text(f'SELECT COUNT(*) FROM {t}')).scalar()
        print(f'  {t:<28} {count:>6} registros')
    except:
        pass
db.close()
PYEOF
"
echo ""
echo -e "  ${BOLD}Los stamps de seeds están en:${NC} ${CYAN}$STAMP_DIR${NC}"
echo -e "  Para forzar re-ejecución de un seed: ${CYAN}rm $STAMP_DIR/<nombre>.done${NC}"
echo ""
