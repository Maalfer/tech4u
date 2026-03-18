#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  Tech4U Academy — Setup VPS (OVHcloud Ubuntu 22.04)
#  Ejecución: sudo bash setup_vps.sh
#  Propósito: instalación única del servidor (una sola vez en VPS limpio)
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Colores ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'
log()    { echo -e "${GREEN}${BOLD}[✓]${NC} $1"; }
warn()   { echo -e "${YELLOW}${BOLD}[⚠]${NC} $1"; }
error()  { echo -e "${RED}${BOLD}[✗]${NC} $1"; exit 1; }
header() {
  echo -e "\n${BLUE}${BOLD}════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}${BOLD}  ◆  $1${NC}"
  echo -e "${BLUE}${BOLD}════════════════════════════════════════════════════${NC}"
}

# ── Verificar root ────────────────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && error "Este script debe ejecutarse como root (sudo bash setup_vps.sh)"

# ── Variables de configuración ────────────────────────────────────────────────
APP_USER="tech4u"
APP_DIR="/opt/tech4u"
DB_NAME="tech4u"
DB_USER="tech4u_admin"
NODE_VERSION="20"

# Leer contraseña BD o generarla
if [[ -f /root/.tech4u_db_pass ]]; then
  DB_PASS=$(cat /root/.tech4u_db_pass)
  warn "Usando contraseña BD existente de /root/.tech4u_db_pass"
else
  DB_PASS=$(openssl rand -base64 32 | tr -d '=+/' | head -c 32)
  echo "$DB_PASS" > /root/.tech4u_db_pass
  chmod 600 /root/.tech4u_db_pass
  log "Contraseña BD generada y guardada en /root/.tech4u_db_pass"
fi

echo ""
echo -e "${CYAN}${BOLD}  Tech4U Academy — VPS Setup${NC}"
echo -e "  App user:    ${BOLD}$APP_USER${NC}"
echo -e "  App dir:     ${BOLD}$APP_DIR${NC}"
echo -e "  DB:          ${BOLD}$DB_NAME${NC} @ localhost:5432"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
header "1/9 · Sistema — Actualización y paquetes base"
# ══════════════════════════════════════════════════════════════════════════════
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  curl wget git unzip build-essential software-properties-common \
  python3.11 python3.11-venv python3-pip python3.11-dev \
  nginx certbot python3-certbot-nginx \
  ufw fail2ban \
  postgresql postgresql-contrib \
  redis-server \
  supervisor \
  docker.io \
  libpq-dev \
  htop ncdu lsof net-tools \
  logrotate
log "Paquetes base instalados"

# ══════════════════════════════════════════════════════════════════════════════
header "2/9 · Usuario del sistema"
# ══════════════════════════════════════════════════════════════════════════════
if ! id "$APP_USER" &>/dev/null; then
  useradd -r -m -d /home/$APP_USER -s /bin/bash "$APP_USER"
  log "Usuario $APP_USER creado"
else
  log "Usuario $APP_USER ya existe"
fi
# Añadir al grupo docker (para los labs de terminal)
usermod -aG docker "$APP_USER"
log "Usuario $APP_USER añadido al grupo docker"

# ══════════════════════════════════════════════════════════════════════════════
header "3/9 · Node.js $NODE_VERSION"
# ══════════════════════════════════════════════════════════════════════════════
if ! command -v node &>/dev/null || [[ "$(node -v | sed 's/v//' | cut -d'.' -f1)" -lt "$NODE_VERSION" ]]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - &>/dev/null
  apt-get install -y nodejs &>/dev/null
  log "Node.js $(node -v) instalado"
else
  log "Node.js $(node -v) ya instalado"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "4/9 · PostgreSQL — Base de datos"
# ══════════════════════════════════════════════════════════════════════════════
systemctl enable postgresql
systemctl start postgresql

# Crear usuario y BD si no existen
sudo -u postgres psql <<EOF
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='$DB_USER') THEN
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
    RAISE NOTICE 'Usuario $DB_USER creado';
  ELSE
    ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';
    RAISE NOTICE 'Contraseña de $DB_USER actualizada';
  END IF;
END
\$\$;
EOF

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
log "PostgreSQL: BD '$DB_NAME', usuario '$DB_USER' configurados"

# Optimización básica de PostgreSQL para 12GB RAM
PG_CONF=$(find /etc/postgresql -name postgresql.conf | head -1)
if [[ -f "$PG_CONF" ]]; then
  cat >> "$PG_CONF" <<'PGEOF'

# ── Tech4U tuning (12GB RAM VPS) ──────────────────────────
shared_buffers = 3GB
effective_cache_size = 9GB
maintenance_work_mem = 512MB
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
max_connections = 100
PGEOF
  systemctl restart postgresql
  log "PostgreSQL: configuración optimizada para 12GB RAM"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "5/9 · Redis"
# ══════════════════════════════════════════════════════════════════════════════
systemctl enable redis-server
systemctl start redis-server
# Habilitar persistencia RDB básica
sed -i 's/^# save 3600 1/save 3600 1/' /etc/redis/redis.conf 2>/dev/null || true
sed -i 's/^# save 300 100/save 300 100/' /etc/redis/redis.conf 2>/dev/null || true
systemctl restart redis-server
log "Redis corriendo en puerto 6379"

# ══════════════════════════════════════════════════════════════════════════════
header "6/9 · Docker (para Labs de terminal)"
# ══════════════════════════════════════════════════════════════════════════════
systemctl enable docker
systemctl start docker
# Imagen sandbox para los labs
docker pull ubuntu:22.04 || warn "No se pudo descargar imagen ubuntu:22.04 (se descargará al ejecutar el primer lab)"
log "Docker activo"

# ══════════════════════════════════════════════════════════════════════════════
header "7/9 · Nginx — Proxy inverso"
# ══════════════════════════════════════════════════════════════════════════════
# Copiar config de nginx si existe
if [[ -f "$(dirname "$0")/nginx.conf" ]]; then
  cp "$(dirname "$0")/nginx.conf" /etc/nginx/sites-available/tech4u
  ln -sf /etc/nginx/sites-available/tech4u /etc/nginx/sites-enabled/tech4u
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
  log "Nginx: configuración tech4u aplicada"
else
  warn "Nginx: nginx.conf no encontrado en deploy/ — ejecuta deploy.sh para aplicarlo"
fi
systemctl enable nginx

# ══════════════════════════════════════════════════════════════════════════════
header "8/9 · Firewall (ufw)"
# ══════════════════════════════════════════════════════════════════════════════
ufw --force reset &>/dev/null
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
# Puerto 8000 solo accesible desde localhost (nginx actúa como proxy)
ufw deny 8000/tcp
ufw --force enable
log "Firewall configurado: SSH + HTTP + HTTPS habilitados"

# ══════════════════════════════════════════════════════════════════════════════
header "9/9 · Fail2ban — Protección SSH/brute-force"
# ══════════════════════════════════════════════════════════════════════════════
cat > /etc/fail2ban/jail.local <<'F2B'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port    = ssh
logpath = %(sshd_log)s
backend = %(syslog_backend)s
F2B
systemctl enable fail2ban
systemctl restart fail2ban
log "Fail2ban activo"

# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  ✅  Setup VPS completado${NC}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BOLD}Credenciales BD (guárdalas):${NC}"
echo -e "  DB_USER: ${CYAN}$DB_USER${NC}"
echo -e "  DB_PASS: ${CYAN}$DB_PASS${NC}  (también en /root/.tech4u_db_pass)"
echo -e "  DB_NAME: ${CYAN}$DB_NAME${NC}"
echo ""
echo -e "  ${BOLD}Siguiente paso:${NC}  sudo bash deploy/deploy.sh"
echo ""
