#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  Tech4U Academy — Fix 502 + Full Redeploy
#  Uso: sudo bash deploy/fix_502.sh
#  Propósito: diagnosticar y resolver el 502 Bad Gateway en producción
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'
OK()   { echo -e "${GREEN}${BOLD}[✓]${NC} $1"; }
WARN() { echo -e "${YELLOW}${BOLD}[⚠]${NC} $1"; }
ERR()  { echo -e "${RED}${BOLD}[✗]${NC} $1"; }
HEAD() { echo -e "\n${BLUE}${BOLD}══ $1 ══${NC}"; }

# ── Directorio raíz del proyecto ──────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo -e "\n${CYAN}${BOLD}Tech4U Academy — Diagnóstico y Fix de 502${NC}"
echo -e "  Proyecto: ${BOLD}$PROJECT_DIR${NC}\n"

# ════════════════════════════════════════════════════════════════════════════
HEAD "1/7 · DIAGNÓSTICO — Estado actual"
# ════════════════════════════════════════════════════════════════════════════

echo ""
echo "--- Contenedores activos ---"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || WARN "docker ps falló"

echo ""
echo "--- Estado de servicios ---"
for svc in tech4u-backend tech4u-frontend tech4u-db tech4u-redis; do
    state=$(docker inspect --format='{{.State.Status}}' "$svc" 2>/dev/null || echo "NOT FOUND")
    health=$(docker inspect --format='{{.State.Health.Status}}' "$svc" 2>/dev/null || echo "no healthcheck")
    if [[ "$state" == "running" ]]; then
        OK "$svc: $state ($health)"
    else
        ERR "$svc: $state"
    fi
done

echo ""
echo "--- Últimas 30 líneas de logs del backend ---"
docker logs tech4u-backend --tail=30 2>&1 || WARN "No se pudo obtener logs del backend"

echo ""
echo "--- Test de conectividad backend interno ---"
if docker exec tech4u-backend python -c "
import urllib.request, sys
try:
    r = urllib.request.urlopen('http://localhost:8000/health', timeout=5)
    print(f'Backend responde: HTTP {r.status}')
    sys.exit(0)
except Exception as e:
    print(f'Backend NO responde: {e}')
    sys.exit(1)
" 2>/dev/null; then
    OK "Backend accesible desde dentro del contenedor"
else
    ERR "Backend no accesible desde dentro del contenedor — hay un problema de arranque"
fi

echo ""
echo "--- Test nginx → backend (desde el contenedor frontend) ---"
if docker exec tech4u-frontend wget -qO- http://backend:8000/health 2>/dev/null; then
    OK "Frontend puede llegar al backend"
else
    ERR "Frontend NO puede llegar al backend"
    echo "   Comprueba que ambos contenedores están en la misma red: tech4u-network"
fi

echo ""
echo "--- Puertos escuchando en el host ---"
ss -tlnp | grep -E ':80|:8000|:443' || netstat -tlnp 2>/dev/null | grep -E ':80|:8000|:443' || WARN "No se pudo comprobar puertos"

echo ""
echo "--- Red Docker ---"
docker network inspect tech4u-network --format='{{range .Containers}}{{.Name}} → {{.IPv4Address}}{{"\n"}}{{end}}' 2>/dev/null || WARN "Red tech4u-network no encontrada"

# ════════════════════════════════════════════════════════════════════════════
HEAD "2/7 · LIMPIEZA — Eliminar containers/builds corruptos"
# ════════════════════════════════════════════════════════════════════════════

echo ""
WARN "Deteniendo y eliminando todos los contenedores de Tech4U..."
docker compose down --remove-orphans 2>/dev/null || docker-compose down --remove-orphans 2>/dev/null || true

echo ""
WARN "Eliminando imágenes corruptas de Tech4U (manteniendo postgres/redis/node)..."
docker images | grep -E 'tech4u|<none>' | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

echo ""
WARN "Limpiando caché de build de Docker..."
docker builder prune -f 2>/dev/null || true

OK "Limpieza completa"

# ════════════════════════════════════════════════════════════════════════════
HEAD "3/7 · VERIFICACIÓN — Archivo .env del backend"
# ════════════════════════════════════════════════════════════════════════════

ENV_FILE="./backend/.env"
if [[ ! -f "$ENV_FILE" ]]; then
    ERR ".env no encontrado en $ENV_FILE"
    echo "   Crea el archivo con las variables necesarias. Ver guia_deploy_tech4u.docx"
    exit 1
fi

echo ""
echo "--- Variables críticas en .env ---"
check_var() {
    local var="$1"
    local val
    val=$(grep "^${var}=" "$ENV_FILE" | cut -d'=' -f2- | head -1)
    if [[ -z "$val" || "$val" == "REEMPLAZAR"* ]]; then
        ERR "$var: NO CONFIGURADA o con valor por defecto"
    else
        OK "$var: configurada (${val:0:20}...)"
    fi
}

check_var "SECRET_KEY"
check_var "DATABASE_URL"
check_var "REDIS_URL"
check_var "STRIPE_SECRET_KEY"
check_var "GOOGLE_CLIENT_ID"
check_var "FRONTEND_URL"
check_var "ENVIRONMENT"

# Verificar que DATABASE_URL apunta a 'db' (nombre del servicio Docker), no a localhost
db_url=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'=' -f2-)
if echo "$db_url" | grep -qE "@localhost|@127\.0\.0\.1"; then
    WARN "DATABASE_URL apunta a localhost — en Docker debe apuntar al servicio 'db'"
    WARN "Cambia a: DATABASE_URL=postgresql://tech4u_admin:PASS@db:5432/tech4u"
else
    OK "DATABASE_URL apunta a servicio Docker (correcto)"
fi

# Verificar ENVIRONMENT=production
env_val=$(grep "^ENVIRONMENT=" "$ENV_FILE" | cut -d'=' -f2-)
if [[ "$env_val" != "production" ]]; then
    WARN "ENVIRONMENT=$env_val — se esperaba 'production'"
fi

# ════════════════════════════════════════════════════════════════════════════
HEAD "4/7 · BUILD — Reconstruir imágenes desde cero"
# ════════════════════════════════════════════════════════════════════════════

echo ""
echo "Construyendo imágenes (esto puede tardar 3-5 minutos)..."
docker compose build --no-cache --progress=plain 2>&1 | tail -30

OK "Build completado"

# ════════════════════════════════════════════════════════════════════════════
HEAD "5/7 · DEPLOY — Arrancar todos los servicios"
# ════════════════════════════════════════════════════════════════════════════

echo ""
echo "Arrancando servicios en background..."
docker compose up -d

echo ""
echo "Esperando a que el backend esté listo (healthcheck, hasta 90s)..."
ATTEMPTS=0
MAX_ATTEMPTS=18  # 18 × 5s = 90s
while [[ $ATTEMPTS -lt $MAX_ATTEMPTS ]]; do
    health=$(docker inspect --format='{{.State.Health.Status}}' tech4u-backend 2>/dev/null || echo "starting")
    if [[ "$health" == "healthy" ]]; then
        OK "Backend healthy tras $((ATTEMPTS * 5))s"
        break
    elif [[ "$health" == "unhealthy" ]]; then
        ERR "Backend unhealthy — revisando logs..."
        docker logs tech4u-backend --tail=50
        echo ""
        ERR "El backend no arrancó correctamente. Revisa los logs de arriba."
        echo "   Comandos de diagnóstico:"
        echo "   docker logs tech4u-backend --tail=100"
        echo "   docker exec -it tech4u-backend python -c 'import main'"
        exit 1
    fi
    echo -n "."
    sleep 5
    ATTEMPTS=$((ATTEMPTS + 1))
done

if [[ $ATTEMPTS -eq $MAX_ATTEMPTS ]]; then
    WARN "Backend tardó más de 90s en arrancar. Puede estar aún iniciándose."
    docker logs tech4u-backend --tail=30
fi

# ════════════════════════════════════════════════════════════════════════════
HEAD "6/7 · VALIDACIÓN FINAL"
# ════════════════════════════════════════════════════════════════════════════

echo ""
echo "--- Estado final de contenedores ---"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "--- Test de endpoints críticos ---"

# Test /health desde fuera (a través de Nginx)
if curl -sf --max-time 5 http://localhost/health -o /dev/null; then
    OK "/health → 200 (Nginx → Backend OK)"
else
    ERR "/health → falló. Nginx no puede llegar al backend."
    echo "   Comprobando logs de nginx:"
    docker logs tech4u-frontend --tail=20
fi

# Test /docs (FastAPI Swagger)
http_code=$(curl -s --max-time 5 -o /dev/null -w "%{http_code}" http://localhost/docs || echo "000")
if [[ "$http_code" == "200" ]]; then
    OK "/docs → 200 (FastAPI Swagger accesible)"
else
    WARN "/docs → HTTP $http_code"
fi

# Test /auth/login (debe existir, aunque devuelva 422/405 sin body)
http_code=$(curl -s --max-time 5 -o /dev/null -w "%{http_code}" -X POST http://localhost/auth/login || echo "000")
if [[ "$http_code" == "422" || "$http_code" == "200" ]]; then
    OK "/auth/login → HTTP $http_code (endpoint accesible — no es 502)"
elif [[ "$http_code" == "502" ]]; then
    ERR "/auth/login → 502 Bad Gateway — backend sigue sin responder"
    docker logs tech4u-backend --tail=30
else
    WARN "/auth/login → HTTP $http_code (inesperado pero no es 502)"
fi

# ════════════════════════════════════════════════════════════════════════════
HEAD "7/7 · CLOUDFLARE — Instrucciones adicionales"
# ════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}${BOLD}Configuración de Cloudflare recomendada:${NC}"
echo ""
echo -e "  ${BOLD}SSL/TLS Mode:${NC}  Flexible  (Cloudflare → VPS en HTTP)"
echo "    → Edge Certificate para HTTPS externo"
echo "    → VPS no necesita certificado SSL propio"
echo ""
echo -e "  ${BOLD}ALTERNATIVA:${NC}   Full (Strict) + certbot en VPS"
echo "    → Más seguro pero requiere cert válido en VPS"
echo "    → Instalar: certbot (con configuración manual, ya que nginx está en Docker)"
echo ""
echo -e "  ${YELLOW}IMPORTANTE:${NC} Si Cloudflare SSL Mode = Full o Full (Strict),"
echo "    el VPS DEBE escuchar en puerto 443. El setup actual solo escucha en 80."
echo "    → Cambiar a Flexible, o añadir soporte HTTPS al docker-compose."
echo ""
echo -e "  ${BOLD}Cloudflare → Caching → Cache Rules:${NC}"
echo "    Bypass cache para /auth/*, /oauth/*, /api/*"
echo "    (evita que Cloudflare cachee respuestas de API)"
echo ""

echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  Deploy completado. Si /auth/login devuelve 422 (no 502)${NC}"
echo -e "${GREEN}${BOLD}  el problema está resuelto.${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Monitorizar logs en tiempo real:"
echo "  docker logs tech4u-backend -f"
echo "  docker logs tech4u-frontend -f"
echo ""
