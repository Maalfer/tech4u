#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  Tech4U Academy — Deploy / Update
#  Ejecución: sudo bash deploy/deploy.sh
#  Propósito: desplegar o actualizar la app en el VPS (seguro, idempotente)
#  Uso también para actualizaciones: sube el código y vuelve a ejecutar
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

[[ $EUID -ne 0 ]] && error "Ejecutar como root: sudo bash deploy/deploy.sh"

# ── Variables — editar antes del primer deploy ────────────────────────────────
APP_USER="tech4u"
APP_DIR="/opt/tech4u"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
VENV="$BACKEND_DIR/venv"
DOMAIN="${DOMAIN:-tech4uacademy.es}"       # ← dominio de producción
DB_NAME="tech4u"
DB_USER="tech4u_admin"

# Leer contraseña guardada por setup_vps.sh
if [[ -f /root/.tech4u_db_pass ]]; then
  DB_PASS=$(cat /root/.tech4u_db_pass)
else
  error "No se encontró /root/.tech4u_db_pass. Ejecuta setup_vps.sh primero."
fi

# ── Detectar directorio fuente (donde está el código) ────────────────────────
# Si estamos ejecutando desde dentro del repo, usamos el directorio padre
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo -e "${CYAN}${BOLD}  Tech4U Academy — Deploy${NC}"
echo -e "  Fuente:      ${BOLD}$SOURCE_DIR${NC}"
echo -e "  Destino:     ${BOLD}$APP_DIR${NC}"
echo -e "  Dominio:     ${BOLD}$DOMAIN${NC}"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
header "1/8 · Sincronizar código al directorio de app"
# ══════════════════════════════════════════════════════════════════════════════
mkdir -p "$APP_DIR"

# rsync: excluye node_modules, venv, __pycache__, dist, logs y archivos sensibles
rsync -av --delete \
  --exclude='node_modules/' \
  --exclude='frontend/node_modules/' \
  --exclude='backend/venv/' \
  --exclude='backend/__pycache__/' \
  --exclude='backend/**/__pycache__/' \
  --exclude='frontend/dist/' \
  --exclude='logs/' \
  --exclude='.git/' \
  --exclude='*.pyc' \
  --exclude='.env' \
  --exclude='backup.sql' \
  "$SOURCE_DIR/" "$APP_DIR/"

chown -R "$APP_USER:$APP_USER" "$APP_DIR"
log "Código sincronizado a $APP_DIR"

# ══════════════════════════════════════════════════════════════════════════════
header "2/8 · Archivo .env de producción"
# ══════════════════════════════════════════════════════════════════════════════
ENV_FILE="$BACKEND_DIR/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  # Generar .env de producción en primer deploy
  SECRET_KEY=$(openssl rand -hex 32)
  cat > "$ENV_FILE" <<EOF
# ── Tech4U Academy — Producción ──────────────────────────────
SECRET_KEY=$SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Base de datos (PostgreSQL)
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME

# Redis
REDIS_URL=redis://localhost:6379/0

# URLs (actualiza con tu dominio real)
FRONTEND_URL=https://$DOMAIN
BACKEND_URL=https://$DOMAIN

# Stripe — reemplaza con claves de producción
STRIPE_SECRET_KEY=sk_live_REEMPLAZAR
STRIPE_PUBLISHABLE_KEY=pk_live_REEMPLAZAR
STRIPE_WEBHOOK_SECRET=whsec_REEMPLAZAR

# PayPal — reemplaza con credenciales de producción
PAYPAL_CLIENT_ID=REEMPLAZAR
PAYPAL_CLIENT_SECRET=REEMPLAZAR
PAYPAL_MODE=live

# OAuth Google
GOOGLE_CLIENT_ID=REEMPLAZAR
GOOGLE_CLIENT_SECRET=REEMPLAZAR

# OAuth Microsoft (opcional)
MICROSOFT_CLIENT_ID=REEMPLAZAR
MICROSOFT_CLIENT_SECRET=REEMPLAZAR
MICROSOFT_TENANT_ID=common

# Sentry (opcional)
SENTRY_DSN=

# ── Email transaccional (Resend) ─────────────────────────────
# 1. Crea cuenta en https://resend.com (gratis hasta 3000 emails/mes)
# 2. Añade y verifica el dominio tech4uacademy.es
# 3. Copia la API key aquí
RESEND_API_KEY=REEMPLAZAR_CON_TU_API_KEY_DE_RESEND

# Email remitente — ya configurado con tu dominio
FROM_EMAIL=Tech4U Academy <info@tech4uacademy.es>
ADMIN_EMAIL=info@tech4uacademy.es
EOF
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  warn ".env de producción creado en $ENV_FILE — RELLENA las claves antes de continuar"
  warn "Abre: nano $ENV_FILE"
  read -rp "Presiona ENTER cuando hayas rellenado el .env para continuar..."
else
  log ".env ya existe, no se sobreescribe"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "3/8 · Backend Python — Dependencias"
# ══════════════════════════════════════════════════════════════════════════════
if [[ ! -d "$VENV" ]]; then
  sudo -u "$APP_USER" python3.11 -m venv "$VENV"
  log "Virtualenv creado en $VENV"
fi
sudo -u "$APP_USER" "$VENV/bin/pip" install --upgrade pip wheel setuptools -q
sudo -u "$APP_USER" "$VENV/bin/pip" install -r "$BACKEND_DIR/requirements.txt" -q
log "Dependencias Python instaladas"

# ══════════════════════════════════════════════════════════════════════════════
header "4/8 · Base de datos — Migraciones Alembic"
# ══════════════════════════════════════════════════════════════════════════════
cd "$BACKEND_DIR"
sudo -u "$APP_USER" bash -c "source '$VENV/bin/activate' && \
  DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME \
  alembic upgrade head"
log "Migraciones aplicadas (alembic upgrade head)"

# ══════════════════════════════════════════════════════════════════════════════
header "5/8 · Frontend React — Build de producción"
# ══════════════════════════════════════════════════════════════════════════════
cd "$FRONTEND_DIR"

# Crear .env del frontend si no existe
if [[ ! -f "$FRONTEND_DIR/.env" ]]; then
  cat > "$FRONTEND_DIR/.env" <<EOF
VITE_API_URL=https://$DOMAIN
VITE_MAIN_APP=https://$DOMAIN
VITE_SENTRY_DSN=
EOF
  chown "$APP_USER:$APP_USER" "$FRONTEND_DIR/.env"
fi

sudo -u "$APP_USER" npm ci --prefer-offline --loglevel=error
sudo -u "$APP_USER" npm run build
log "Frontend compilado en $FRONTEND_DIR/dist/"

# ══════════════════════════════════════════════════════════════════════════════
header "6/8 · Nginx — Configuración"
# ══════════════════════════════════════════════════════════════════════════════
cat > /etc/nginx/sites-available/tech4u <<NGINX
# ── Tech4U Academy — Nginx Config ─────────────────────────────────────────────

# Redirigir HTTP → HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL (Let's Encrypt — se activa con certbot)
    ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Seguridad
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1000;

    # ── Frontend (archivos estáticos) ──────────────────────────────────────
    root $FRONTEND_DIR/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
    }

    # Assets con hash — caché larga
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # ── API Backend (FastAPI en :8000) ─────────────────────────────────────
    location /api/ {
        rewrite ^/api/(.*)\$ /\$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 75;
        client_max_body_size 50M;
    }

    # WebSocket para labs de terminal
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
        proxy_read_timeout 86400;
    }

    # Logs
    access_log /var/log/nginx/tech4u_access.log;
    error_log  /var/log/nginx/tech4u_error.log;
}
NGINX

ln -sf /etc/nginx/sites-available/tech4u /etc/nginx/sites-enabled/tech4u
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
log "Nginx configurado para $DOMAIN"

# ══════════════════════════════════════════════════════════════════════════════
header "7/8 · Servicios systemd (API + Celery)"
# ══════════════════════════════════════════════════════════════════════════════

# ── Servicio FastAPI ─────────────────────────────────────────
cat > /etc/systemd/system/tech4u-api.service <<EOF
[Unit]
Description=Tech4U Academy — FastAPI Backend
After=network.target postgresql.service redis.service
Requires=postgresql.service redis.service

[Service]
Type=exec
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$BACKEND_DIR
EnvironmentFile=$BACKEND_DIR/.env
ExecStart=$VENV/bin/uvicorn main:app \\
  --host 127.0.0.1 \\
  --port 8000 \\
  --workers 4 \\
  --loop uvloop \\
  --access-log \\
  --log-level info
Restart=always
RestartSec=5
StandardOutput=append:/var/log/tech4u/api.log
StandardError=append:/var/log/tech4u/api_error.log
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# ── Servicio Celery ──────────────────────────────────────────
cat > /etc/systemd/system/tech4u-celery.service <<EOF
[Unit]
Description=Tech4U Academy — Celery Worker
After=network.target redis.service
Requires=redis.service

[Service]
Type=forking
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$BACKEND_DIR
EnvironmentFile=$BACKEND_DIR/.env
ExecStart=$VENV/bin/celery -A main.celery worker \\
  --loglevel=info \\
  --concurrency=4 \\
  --logfile=/var/log/tech4u/celery.log \\
  --pidfile=/tmp/celery.pid
Restart=always
RestartSec=10
StandardOutput=append:/var/log/tech4u/celery.log
StandardError=append:/var/log/tech4u/celery_error.log

[Install]
WantedBy=multi-user.target
EOF

mkdir -p /var/log/tech4u
chown -R "$APP_USER:$APP_USER" /var/log/tech4u

systemctl daemon-reload
systemctl enable tech4u-api tech4u-celery
systemctl restart tech4u-api tech4u-celery

sleep 3
systemctl is-active --quiet tech4u-api && log "tech4u-api: activo ✓" || warn "tech4u-api: revisar con 'journalctl -u tech4u-api -n 50'"
systemctl is-active --quiet tech4u-celery && log "tech4u-celery: activo ✓" || warn "tech4u-celery: revisar con 'journalctl -u tech4u-celery -n 50'"

# ══════════════════════════════════════════════════════════════════════════════
header "8/8 · SSL Let's Encrypt"
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${YELLOW}${BOLD}  Para activar HTTPS ejecuta:${NC}"
echo -e "  ${CYAN}certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
echo ""
echo -e "  (El VPS debe ser accesible desde internet y el DNS debe apuntar a su IP)"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  ✅  Deploy completado${NC}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BOLD}Estado de servicios:${NC}"
echo -e "  API:    $(systemctl is-active tech4u-api)"
echo -e "  Celery: $(systemctl is-active tech4u-celery)"
echo -e "  Nginx:  $(systemctl is-active nginx)"
echo -e "  Redis:  $(systemctl is-active redis-server)"
echo -e "  PG:     $(systemctl is-active postgresql)"
echo ""
echo -e "  ${BOLD}Logs en tiempo real:${NC}"
echo -e "  ${CYAN}journalctl -u tech4u-api -f${NC}"
echo -e "  ${CYAN}tail -f /var/log/tech4u/api.log${NC}"
echo ""
echo -e "  ${BOLD}Próximos pasos:${NC}"
echo -e "  1. Rellena las claves en ${CYAN}$ENV_FILE${NC} (Stripe, PayPal, OAuth, SMTP)"
echo -e "  2. Activa SSL: ${CYAN}certbot --nginx -d $DOMAIN${NC}"
echo -e "  3. Carga los datos: ${CYAN}sudo bash deploy/seed_all.sh${NC}"
echo ""
