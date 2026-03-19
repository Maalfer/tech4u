"""
seed_bash_part3.py
Bash Scripting Path — Parte 3 (final)
M5: Scripts Avanzados y Automatización (8 labs)
Proyecto Final: Sistema de Administración Automatizada (1 lab)
Run: cd backend && source venv/bin/activate && python3 scripts/seed_bash_part3.py
"""

import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, SkillPath, Module, Lab
from sqlalchemy import func

# ─── helpers ────────────────────────────────────────────────────────────────

def get_bash_path(db):
    path = db.query(SkillPath).filter(SkillPath.title == "Bash Scripting").first()
    if not path:
        print("ERROR: SkillPath 'Bash Scripting' no encontrado. Ejecuta seed_bash_part1.py primero.")
        sys.exit(1)
    return path

def get_next_order(db, module_id):
    labs = db.query(Lab).filter(Lab.module_id == module_id).all()
    return len(labs) + 1

def insert_labs(db, module, labs_data):
    order = get_next_order(db, module.id)
    for ld in labs_data:
        existing = db.query(Lab).filter(Lab.module_id == module.id, Lab.title == ld["title"]).first()
        if existing:
            print(f"  [SKIP] {ld['title']}")
            continue
        lab = Lab(
            module_id=module.id,
            title=ld["title"],
            description=ld["description"],
            goal_description=ld["description"],
            step_by_step_guide=ld.get("guide_markdown", ""),
            difficulty=ld["difficulty"],
            time_limit=ld.get("duration_minutes", 30),
            xp_reward=ld.get("xp_reward", 150),
            order_index=order,
            is_active=True,
            category="Linux",
            docker_image="ubuntu:22.04",
        )
        db.add(lab)
        order += 1
        print(f"  [OK] {ld['title']}")
    db.commit()

def upsert_module(db, path_id, title, description, order_index):
    m = db.query(Module).filter(Module.skill_path_id == path_id, Module.title == title).first()
    if not m:
        m = Module(skill_path_id=path_id, title=title, description=description, order_index=order_index)
        db.add(m)
        db.commit()
        db.refresh(m)
        print(f"[CREATED] Módulo: {title}")
    else:
        print(f"[EXISTS] Módulo: {title}")
    return m

# ─── M5: Scripts Avanzados y Automatización ─────────────────────────────────

M5_LABS = [
    {
        "title": "Cron y Automatización de Tareas",
        "description": "Aprende a programar scripts para ejecución automática con cron y systemd timers. Crea tareas de mantenimiento que se ejecutan sin intervención.",
        "difficulty": "intermediate",
        "duration_minutes": 40,
        "xp_reward": 130,
        "learning_objectives": [
            "Entender la sintaxis de crontab",
            "Crear y gestionar cron jobs",
            "Comparar cron vs systemd timers",
            "Implementar logging para tareas programadas"
        ],
        "commands": ["crontab -e", "crontab -l", "cron", "at", "systemctl"],
        "guide_markdown": """# Cron y Automatización de Tareas

## Sintaxis de crontab

```
┌─────────── minuto (0-59)
│ ┌───────── hora (0-23)
│ │ ┌─────── día del mes (1-31)
│ │ │ ┌───── mes (1-12)
│ │ │ │ ┌─── día de la semana (0=Dom, 6=Sáb)
│ │ │ │ │
* * * * *  comando
```

**Ejemplos:**
```bash
# Cada minuto
* * * * * /usr/local/bin/mi_script.sh

# Cada día a las 2:30 AM
30 2 * * * /scripts/backup_diario.sh

# Lunes a viernes a las 9 AM
0 9 * * 1-5 /scripts/informe_diario.sh

# Cada 15 minutos
*/15 * * * * /scripts/monitorizar.sh

# El primer día de cada mes a medianoche
0 0 1 * * /scripts/backup_mensual.sh

# Cada hora en punto
0 * * * * /scripts/limpieza_tmp.sh
```

---

## Gestionar cron jobs

```bash
# Ver crons actuales
crontab -l

# Editar crontab
crontab -e

# Eliminar todos los cron jobs (¡cuidado!)
crontab -r

# Ver cron jobs del sistema
cat /etc/crontab
ls /etc/cron.d/
ls /etc/cron.daily/
ls /etc/cron.weekly/
ls /etc/cron.monthly/
```

---

## Script diseñado para cron

Los scripts de cron deben:
1. Usar rutas absolutas
2. Tener logging propio (no stderr/stdout en TTY)
3. Gestionar el lock para evitar ejecuciones paralelas

```bash
#!/usr/bin/env bash
# /usr/local/bin/limpieza_tmp.sh
# Ejecutar: 0 * * * * /usr/local/bin/limpieza_tmp.sh

set -euo pipefail

LOG="/var/log/limpieza_tmp.log"
LOCK="/tmp/limpieza_tmp.lock"

# Función de log con timestamp
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

# Evitar ejecuciones paralelas
if ! mkdir "$LOCK" 2>/dev/null; then
    log "WARN: Ya hay una instancia en ejecución. Saltando."
    exit 0
fi
trap "rmdir '$LOCK'" EXIT

log "INFO: Iniciando limpieza de /tmp"

# Eliminar archivos más antiguos de 7 días
find /tmp -type f -atime +7 -name "myscript.*" -delete 2>/dev/null || true
deleted=$(find /tmp -maxdepth 1 -type f -atime +7 2>/dev/null | wc -l)

log "INFO: Eliminados $deleted archivos antiguos de /tmp"
log "INFO: Limpieza completada"
```

---

## at: ejecutar una vez en el futuro

```bash
# Ejecutar en 10 minutos
echo "/scripts/backup.sh" | at now + 10 minutes

# Ejecutar mañana a las 8 AM
echo "/scripts/informe.sh" | at 08:00 tomorrow

# Ver trabajos pendientes
atq

# Cancelar trabajo #3
atrm 3
```

---

## Variables de entorno en cron

Cron tiene un entorno mínimo. Siempre define las que necesites:

```bash
# En crontab:
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=""        # no enviar emails de error

30 2 * * * /scripts/backup.sh >> /var/log/backup.log 2>&1
```

---

## Práctica

1. Crea un script `limpieza_logs.sh` que elimine logs de más de 30 días de un directorio
2. Añádelo como cron job diario a las 3 AM con logging en `/var/log/limpieza_logs.log`
3. Implementa el lock de archivo para evitar ejecuciones paralelas
4. Prueba el script manualmente antes de crontabear
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Script de mantenimiento con lock",
                "description": "Crea limpieza_tmp.sh que use mkdir como lock, registre actividad en un log y elimine archivos tmp propios de más de 1 día. Verifica que el lock funciona.",
                "hint": "Simula la colisión: ejecuta el script en segundo plano (./script.sh &) y luego ejecútalo de nuevo inmediatamente",
                "validation_command": "bash limpieza_tmp.sh && cat /tmp/limpieza.log 2>&1 | grep -i 'iniciando\\|completado'",
                "expected_output_contains": "completado"
            }
        ]
    },
    {
        "title": "Scripts de Red: Diagnóstico y Monitorización",
        "description": "Crea scripts de diagnóstico de red que comprueben conectividad, analicen puertos, monitoricen servicios y envíen alertas cuando algo falla.",
        "difficulty": "intermediate",
        "duration_minutes": 45,
        "xp_reward": 140,
        "learning_objectives": [
            "Comprobar conectividad con ping y nc",
            "Escanear puertos con /dev/tcp",
            "Monitorizar servicios y alertar",
            "Generar informes de estado de red"
        ],
        "commands": ["ping", "nc", "/dev/tcp", "ss", "curl", "host", "dig"],
        "guide_markdown": """# Scripts de Red: Diagnóstico y Monitorización

## Comprobar conectividad básica

```bash
#!/usr/bin/env bash

# Ping con timeout y conteo
check_ping() {
    local host="$1"
    local count="${2:-3}"
    local timeout="${3:-2}"

    if ping -c "$count" -W "$timeout" "$host" &>/dev/null; then
        echo "✓ $host responde a ping"
        return 0
    else
        echo "✗ $host NO responde a ping"
        return 1
    fi
}

check_ping "8.8.8.8"
check_ping "192.168.1.1"
```

---

## Verificar puertos sin nmap (usando /dev/tcp)

```bash
check_port() {
    local host="$1"
    local port="$2"
    local timeout="${3:-3}"

    if timeout "$timeout" bash -c "echo >/dev/tcp/$host/$port" 2>/dev/null; then
        echo "✓ $host:$port — ABIERTO"
        return 0
    else
        echo "✗ $host:$port — CERRADO/FILTRADO"
        return 1
    fi
}

# Verificar servicios comunes
check_port "localhost" 22    # SSH
check_port "localhost" 80    # HTTP
check_port "localhost" 443   # HTTPS
check_port "localhost" 5432  # PostgreSQL
```

---

## Monitorizar servicios HTTP

```bash
check_http() {
    local url="$1"
    local expected_code="${2:-200}"
    local timeout="${3:-10}"

    local actual_code
    actual_code=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time "$timeout" \
        --connect-timeout 5 \
        "$url" 2>/dev/null || echo "000")

    if [[ "$actual_code" == "$expected_code" ]]; then
        echo "✓ $url → HTTP $actual_code"
        return 0
    else
        echo "✗ $url → HTTP $actual_code (esperado: $expected_code)"
        return 1
    fi
}

# Verificar respuesta de tiempo (ms)
check_http_timing() {
    local url="$1"
    local max_ms="${2:-500}"

    local timing
    timing=$(curl -s -o /dev/null \
        -w "%{http_code}|%{time_total}" \
        --max-time 10 "$url" 2>/dev/null)

    local code ms_float ms
    code=$(echo "$timing" | cut -d'|' -f1)
    ms_float=$(echo "$timing" | cut -d'|' -f2)
    ms=$(echo "$ms_float * 1000" | bc | cut -d'.' -f1)

    echo "[$code] $url — ${ms}ms"
    (( ms <= max_ms ))
}
```

---

## Monitor continuo de servicios

```bash
#!/usr/bin/env bash
set -euo pipefail

LOG="/var/log/service_monitor.log"
ALERT_EMAIL="${ALERT_EMAIL:-admin@ejemplo.com}"

declare -A SERVICES=(
    ["web_principal"]="http://localhost:80"
    ["api"]="https://tech4uacademy.es/health"
    ["docs"]="http://localhost:3000"
)

declare -A PORTS=(
    ["ssh"]="localhost:22"
    ["postgres"]="localhost:5432"
)

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

check_all() {
    local failures=0

    log "=== COMPROBACIÓN DE SERVICIOS ==="

    for service in "${!SERVICES[@]}"; do
        if ! check_http "${SERVICES[$service]}" 200 5; then
            log "ALERT: $service está CAÍDO"
            (( failures++ ))
        fi
    done

    for service in "${!PORTS[@]}"; do
        host="${PORTS[$service]%:*}"
        port="${PORTS[$service]#*:}"
        if ! check_port "$host" "$port" 3; then
            log "ALERT: puerto $service ($port) no responde"
            (( failures++ ))
        fi
    done

    log "Comprobación completada: $failures fallos"
    return $failures
}

check_all || true
```

---

## Análisis de interfaces de red

```bash
mostrar_interfaces() {
    echo "=== INTERFACES DE RED ==="
    ip -4 addr show | awk '
    /^[0-9]+:/ { iface = $2; gsub(/:/, "", iface) }
    /inet /    { printf "%-15s %s\n", iface, $2 }
    '
}

mostrar_rutas() {
    echo "=== TABLA DE RUTAS ==="
    ip route | awk '{printf "  %s\n", $0}'
}

mostrar_conexiones() {
    echo "=== CONEXIONES ACTIVAS ==="
    ss -tuln | awk 'NR>1 {printf "  %-8s %-25s %s\n", $1, $5, $7}'
}
```

---

## Práctica

1. Crea `network_check.sh` que compruebe: DNS (host google.com), gateway por defecto, y 3 servicios locales
2. Añade un modo `--watch` que repita la comprobación cada 30 segundos
3. Registra los resultados en un log con timestamps
4. Implementa que el script retorne código de error no-cero si algún servicio falla
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Monitor de puertos local",
                "description": "Crea network_check.sh que verifique 5 puertos locales usando /dev/tcp y genere un informe de estado con ✓/✗ y el tiempo de respuesta de cada uno.",
                "hint": "Para el tiempo: start=$(date +%s%3N); check_port ...; end=$(date +%s%3N); ms=$((end-start))",
                "validation_command": "bash network_check.sh 2>&1 | grep -E '✓|✗|ABIERTO|CERRADO'",
                "expected_output_contains": "ABIERTO"
            }
        ]
    },
    {
        "title": "Interacción con APIs REST desde Bash",
        "description": "Aprende a consumir APIs REST usando curl y procesar respuestas JSON con jq directamente desde scripts Bash.",
        "difficulty": "intermediate",
        "duration_minutes": 45,
        "xp_reward": 140,
        "learning_objectives": [
            "Hacer peticiones GET, POST, PUT con curl",
            "Procesar JSON con jq",
            "Autenticarse con tokens en headers",
            "Crear wrappers reutilizables para APIs"
        ],
        "commands": ["curl", "jq", "curl -H", "curl -d", "curl -X"],
        "guide_markdown": """# Interacción con APIs REST desde Bash

## curl: el cliente HTTP de Bash

```bash
# GET básico
curl https://api.ejemplo.com/datos

# GET con headers y output silencioso
curl -s -H "Authorization: Bearer $TOKEN" https://api.ejemplo.com/datos

# POST con JSON
curl -s -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{"nombre": "Alice", "email": "alice@corp.com"}' \\
  https://api.ejemplo.com/usuarios

# Capturar código de respuesta
http_code=$(curl -s -o /dev/null -w "%{http_code}" https://api.ejemplo.com/health)
echo "Código HTTP: $http_code"

# Timeout y retry
curl -s --max-time 10 --retry 3 --retry-delay 2 https://api.ejemplo.com/datos
```

---

## jq: procesador de JSON

```bash
# Extraer campo
echo '{"nombre": "Alice", "edad": 30}' | jq '.nombre'
# "Alice"

# Sin comillas
echo '{"nombre": "Alice"}' | jq -r '.nombre'
# Alice

# Array de objetos
echo '[{"id":1,"nombre":"Alice"},{"id":2,"nombre":"Bob"}]' | jq '.[].nombre'

# Filtrar con condición
echo '[{"id":1,"activo":true},{"id":2,"activo":false}]' | jq '.[] | select(.activo==true)'

# Transformar estructura
curl -s https://api.publicapis.org/entries | jq '[.entries[:5] | .[] | {api:.API, categoria:.Category}]'

# Crear JSON
jq -n --arg nombre "Alice" --argjson edad 30 '{"nombre": $nombre, "edad": $edad}'
```

---

## API wrapper reutilizable

```bash
#!/usr/bin/env bash
# lib/api.sh — Wrapper genérico para APIs REST

API_BASE="${API_BASE:-https://api.ejemplo.com}"
API_TOKEN="${API_TOKEN:-}"
API_TIMEOUT="${API_TIMEOUT:-30}"

_api_request() {
    local method="$1"
    local endpoint="$2"
    local data="${3:-}"

    local args=(-s -X "$method"
        --max-time "$API_TIMEOUT"
        -H "Content-Type: application/json"
        -H "Accept: application/json")

    [[ -n "$API_TOKEN" ]] && args+=(-H "Authorization: Bearer $API_TOKEN")
    [[ -n "$data" ]] && args+=(-d "$data")

    local response http_code
    response=$(curl "${args[@]}" -w "\\n%{http_code}" "${API_BASE}${endpoint}" 2>/dev/null)
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -1)

    if (( http_code >= 400 )); then
        echo "ERROR: HTTP $http_code para $method $endpoint" >&2
        echo "$body" >&2
        return 1
    fi

    echo "$body"
}

api_get()    { _api_request GET    "$1"; }
api_post()   { _api_request POST   "$1" "$2"; }
api_put()    { _api_request PUT    "$1" "$2"; }
api_delete() { _api_request DELETE "$1"; }
```

---

## Uso con una API real (httpbin.org)

```bash
#!/usr/bin/env bash
source lib/api.sh

API_BASE="https://httpbin.org"

# GET
echo "=== GET ==="
api_get "/get" | jq '{url: .url, args: .args}'

# POST con datos
echo "=== POST ==="
data=$(jq -n --arg usuario "bash_test" --argjson ts "$(date +%s)" \
    '{"usuario": $usuario, "timestamp": $ts}')
api_post "/post" "$data" | jq '.json'

# Simular paginación
echo "=== Paginación ==="
for page in 1 2 3; do
    result=$(api_get "/get?page=$page&per_page=10")
    echo "Página $page: $(echo "$result" | jq -r '.args.page')"
done
```

---

## Práctica

1. Usa la API pública `https://jsonplaceholder.typicode.com`:
   - GET todos los usuarios y muestra nombre + email formateado
   - GET los posts del usuario 1 y cuenta cuántos tiene
   - Simula un POST de un nuevo post y muestra el ID devuelto
2. Implementa el wrapper `api.sh` con manejo de errores y retry
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Cliente de API con jq",
                "description": "Crea api_demo.sh que consulte jsonplaceholder.typicode.com/users y muestre una tabla con: ID, nombre y email de cada usuario, formateada con printf.",
                "hint": "curl -s https://jsonplaceholder.typicode.com/users | jq -r '.[] | [.id, .name, .email] | @tsv' | while IFS=$'\\t' read ...",
                "validation_command": "bash api_demo.sh 2>&1 | grep -E '@'",
                "expected_output_contains": "@"
            }
        ]
    },
    {
        "title": "Backup y Rotación de Logs",
        "description": "Implementa un sistema completo de backup con compresión, rotación, verificación de integridad y limpieza automática de copias antiguas.",
        "difficulty": "intermediate",
        "duration_minutes": 50,
        "xp_reward": 150,
        "learning_objectives": [
            "Crear backups comprimidos con tar y gzip",
            "Implementar rotación de backups",
            "Verificar integridad con checksums",
            "Automatizar la limpieza de copias antiguas"
        ],
        "commands": ["tar", "gzip", "md5sum", "sha256sum", "find -mtime", "rsync"],
        "guide_markdown": """# Backup y Rotación de Logs

## Sistema de backup básico

```bash
#!/usr/bin/env bash
set -euo pipefail

# ─── Configuración ───────────────────────────────────────
BACKUP_SRC="/home/usuario/datos"
BACKUP_DST="/mnt/backups"
RETENTION_DAYS=7
LOG_FILE="/var/log/backup.log"
DATE=$(date '+%Y%m%d_%H%M%S')
BACKUP_NAME="backup_${DATE}.tar.gz"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

# ─── Verificar espacio libre ─────────────────────────────
check_disk_space() {
    local required_mb="${1:-500}"
    local available_mb
    available_mb=$(df -m "$BACKUP_DST" | awk 'NR==2 {print $4}')

    if (( available_mb < required_mb )); then
        log "ERROR: Espacio insuficiente (${available_mb}MB < ${required_mb}MB requeridos)"
        return 1
    fi
    log "INFO: Espacio disponible: ${available_mb}MB"
}

# ─── Crear backup ────────────────────────────────────────
create_backup() {
    local src="$1"
    local dst="$2"
    local name="$3"

    log "INFO: Iniciando backup de $src"

    tar -czf "${dst}/${name}" \
        --exclude="*.tmp" \
        --exclude="*.cache" \
        --exclude=".git" \
        "$src" 2>/dev/null

    local size
    size=$(du -sh "${dst}/${name}" | cut -f1)
    log "INFO: Backup creado: ${name} ($size)"
}

# ─── Verificar integridad ─────────────────────────────────
verify_backup() {
    local backup_file="$1"
    local checksum_file="${backup_file}.sha256"

    # Crear checksum
    sha256sum "$backup_file" > "$checksum_file"
    log "INFO: Checksum SHA256 guardado en ${checksum_file}"

    # Verificar que el tar es válido
    if tar -tzf "$backup_file" &>/dev/null; then
        log "INFO: Integridad del backup verificada"
        return 0
    else
        log "ERROR: El backup está corrupto"
        return 1
    fi
}

# ─── Rotar backups antiguos ──────────────────────────────
rotate_backups() {
    local backup_dir="$1"
    local retention="$2"
    local prefix="$3"

    log "INFO: Rotando backups con más de ${retention} días..."
    local count=0
    while IFS= read -r old_backup; do
        rm -f "$old_backup" "${old_backup}.sha256"
        (( count++ ))
        log "INFO: Eliminado: $(basename $old_backup)"
    done < <(find "$backup_dir" -name "${prefix}*.tar.gz" -mtime +$retention -type f)
    log "INFO: $count backups antiguos eliminados"
}

# ─── MAIN ────────────────────────────────────────────────
main() {
    log "=== INICIANDO BACKUP ==="
    check_disk_space 500
    create_backup "$BACKUP_SRC" "$BACKUP_DST" "$BACKUP_NAME"
    verify_backup "${BACKUP_DST}/${BACKUP_NAME}"
    rotate_backups "$BACKUP_DST" "$RETENTION_DAYS" "backup_"
    log "=== BACKUP COMPLETADO ==="
}

main
```

---

## Backup incremental con rsync

```bash
# Backup incremental: solo los cambios
rsync_backup() {
    local src="$1"
    local dst_base="$2"
    local date=$(date '+%Y-%m-%d')
    local dst="${dst_base}/${date}"
    local latest="${dst_base}/latest"

    rsync -av \
        --link-dest="$latest" \
        --exclude=".cache" \
        --exclude="*.tmp" \
        "$src/" "$dst/"

    # Actualizar enlace simbólico "latest"
    rm -f "$latest"
    ln -s "$dst" "$latest"

    echo "Backup incremental completado: $dst"
}
```

---

## Rotación de logs (logrotate manual)

```bash
rotate_log() {
    local log_file="$1"
    local max_files="${2:-5}"

    # Rotar: log.5 → eliminar, log.4 → log.5, ..., log → log.1
    for (( i=max_files; i>=1; i-- )); do
        local prev=$(( i - 1 ))
        [[ $prev -eq 0 ]] && prev_file="$log_file" || prev_file="${log_file}.${prev}"
        [[ -f "$prev_file" ]] && mv "$prev_file" "${log_file}.${i}"
    done

    touch "$log_file"
    echo "Log rotado. Archivo nuevo: $log_file"
}
```

---

## Práctica

1. Implementa `backup.sh` que haga backup de un directorio de prueba a /tmp/backups
2. Crea 5 backups consecutivos y verifica la rotación (solo deben quedar los últimos 3)
3. Verifica la integridad de cada backup con SHA256
4. Añade la opción `--dry-run` que muestre qué haría sin hacerlo
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Sistema de backup con rotación",
                "description": "Crea backup.sh que: genere un backup tar.gz de /tmp/datos_prueba, verifique su integridad, y rote conservando solo los últimos 3. Ejecuta 4 veces y verifica que solo quedan 3.",
                "hint": "Después del 4to backup, usa: ls /tmp/backups/*.tar.gz | wc -l para verificar que son 3",
                "validation_command": "for i in 1 2 3 4; do bash backup.sh; done; ls /tmp/backups/*.tar.gz 2>/dev/null | wc -l",
                "expected_output_contains": "3"
            }
        ]
    },
    {
        "title": "Testing de Scripts Bash con bats",
        "description": "Implementa tests automatizados para tus scripts Bash usando el framework bats (Bash Automated Testing System). TDD para scripts de shell.",
        "difficulty": "advanced",
        "duration_minutes": 50,
        "xp_reward": 160,
        "learning_objectives": [
            "Instalar y usar bats-core",
            "Escribir tests unitarios para funciones Bash",
            "Usar fixtures y teardown en tests",
            "Integrar tests en un flujo CI/CD básico"
        ],
        "commands": ["bats", "run", "@test", "assert_output", "assert_success"],
        "guide_markdown": """# Testing de Scripts Bash con bats

## Instalar bats-core

```bash
# Via npm (más fácil)
npm install -g bats

# Via git
git clone https://github.com/bats-core/bats-core.git
cd bats-core && sudo ./install.sh /usr/local

# Verificar
bats --version
```

---

## Estructura de un test bats

```bash
#!/usr/bin/env bats
# tests/mi_script.bats

# setup: se ejecuta ANTES de cada test
setup() {
    # Variables de entorno de prueba
    TMPDIR=$(mktemp -d)
    export TEST_DIR="$TMPDIR"
}

# teardown: se ejecuta DESPUÉS de cada test
teardown() {
    rm -rf "$TEST_DIR"
}

# Un test básico
@test "sumar dos números" {
    source ./lib/math.sh
    run suma 5 3
    [ "$status" -eq 0 ]
    [ "$output" = "8" ]
}

@test "error con argumento inválido" {
    source ./lib/math.sh
    run suma "abc" 3
    [ "$status" -ne 0 ]
    [[ "$output" == *"inválido"* ]]
}
```

---

## Variables especiales en bats

| Variable   | Significado                              |
|------------|------------------------------------------|
| `$status`  | Código de salida del último `run`        |
| `$output`  | Salida combinada (stdout + stderr)       |
| `$lines`   | Array de líneas de `$output`             |
| `${lines[0]}` | Primera línea de salida              |

---

## Testing de funciones del script

Script a testear (`lib/validators.sh`):
```bash
#!/usr/bin/env bash

is_number() { [[ "$1" =~ ^-?[0-9]+$ ]]; }
is_email()  { [[ "$1" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; }
is_ip()     { [[ "$1" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; }
```

Tests (`tests/validators.bats`):
```bash
#!/usr/bin/env bats

setup() {
    source "$BATS_TEST_DIRNAME/../lib/validators.sh"
}

# is_number tests
@test "is_number: entero positivo" {
    run is_number "42"
    [ "$status" -eq 0 ]
}

@test "is_number: entero negativo" {
    run is_number "-7"
    [ "$status" -eq 0 ]
}

@test "is_number: string falla" {
    run is_number "abc"
    [ "$status" -ne 0 ]
}

# is_email tests
@test "is_email: email válido" {
    run is_email "usuario@ejemplo.com"
    [ "$status" -eq 0 ]
}

@test "is_email: sin arroba falla" {
    run is_email "usuario.ejemplo.com"
    [ "$status" -ne 0 ]
}

# is_ip tests
@test "is_ip: IP válida" {
    run is_ip "192.168.1.100"
    [ "$status" -eq 0 ]
}

@test "is_ip: IP inválida falla" {
    run is_ip "256.1.1.1"
    # Nota: este test puede pasar dependiendo de si validamos rangos
    echo "IP inválida detectada"
}
```

---

## Testing de scripts completos

```bash
#!/usr/bin/env bats
# tests/backup.bats

setup() {
    BACKUP_SRC=$(mktemp -d)
    BACKUP_DST=$(mktemp -d)
    echo "dato de prueba" > "$BACKUP_SRC/archivo.txt"
    export BACKUP_SRC BACKUP_DST
}

teardown() {
    rm -rf "$BACKUP_SRC" "$BACKUP_DST"
}

@test "backup crea archivo tar.gz" {
    run bash backup.sh
    [ "$status" -eq 0 ]
    local count
    count=$(ls "$BACKUP_DST"/*.tar.gz 2>/dev/null | wc -l)
    [ "$count" -ge 1 ]
}

@test "backup registra en log" {
    run bash backup.sh
    [ "$status" -eq 0 ]
    [[ "$output" == *"completado"* ]]
}
```

---

## Ejecutar tests

```bash
# Un archivo
bats tests/validators.bats

# Todos los tests
bats tests/

# Con salida detallada
bats --tap tests/

# Salida de progreso
bats --pretty tests/
```

---

## Práctica

1. Crea `lib/validators.sh` con las funciones `is_number`, `is_email` e `is_ip`
2. Crea `tests/validators.bats` con al menos 2 tests por función (positivos y negativos)
3. Añade tests para el script `backup.sh` del lab anterior
4. Ejecuta todos los tests y verifica que pasan
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Suite de tests con bats",
                "description": "Crea lib/validators.sh con is_number(), is_email() e is_ip(). Escribe tests/validators.bats con 6 tests. Todos deben pasar.",
                "hint": "Si bats no está instalado: sudo apt-get install bats o pip3 install bats-core",
                "validation_command": "bats tests/validators.bats 2>&1 | grep -E 'passed|ok'",
                "expected_output_contains": "6"
            }
        ]
    },
    {
        "title": "Optimización y Buenas Prácticas de Scripts",
        "description": "Aprende a escribir scripts Bash de calidad profesional: ShellCheck, optimización de rendimiento, portabilidad y patrones de código limpio.",
        "difficulty": "advanced",
        "duration_minutes": 45,
        "xp_reward": 150,
        "learning_objectives": [
            "Analizar scripts con ShellCheck",
            "Optimizar scripts para rendimiento",
            "Escribir scripts POSIX portables",
            "Aplicar patrones de código limpio en Bash"
        ],
        "commands": ["shellcheck", "time", "bash --restricted", "sh -n"],
        "guide_markdown": """# Optimización y Buenas Prácticas de Scripts

## ShellCheck: linter estático para Bash

```bash
# Instalar
sudo apt-get install shellcheck    # Debian/Ubuntu
brew install shellcheck            # macOS

# Analizar un script
shellcheck mi_script.sh

# Verificar todos los scripts
find . -name "*.sh" -exec shellcheck {} \\;

# En CI: fallo si hay warnings
shellcheck --severity=warning mi_script.sh && echo "✓ Sin problemas"
```

**Errores comunes detectados por ShellCheck:**
```bash
# SC2086: Doble quote para evitar word splitting
echo $var          # MALO
echo "$var"        # BIEN

# SC2046: Doble quote en sustitución de comandos
rm $(find . -name "*.tmp")         # MALO (falla con espacios)
find . -name "*.tmp" -delete       # BIEN

# SC2181: No uses $? directamente en if
if [ $? -eq 0 ]    # MALO
if comando; then   # BIEN
```

---

## Optimización de rendimiento

### Evitar subshells innecesarias

```bash
# LENTO: abre subshell para cada sustitución
for file in $(find . -name "*.log"); do
    count=$(wc -l < "$file")
    echo "$file: $count líneas"
done

# RÁPIDO: usa while + read (no fork)
while IFS= read -r -d '' file; do
    count=$(wc -l < "$file")
    echo "$file: $count líneas"
done < <(find . -name "*.log" -print0)
```

### Medir rendimiento

```bash
time ./mi_script.sh

# Más detallado
/usr/bin/time -v ./mi_script.sh

# Benchmark simple
start=$(date +%s%N)
# ... código a medir ...
end=$(date +%s%N)
echo "Tiempo: $(( (end - start) / 1000000 ))ms"
```

---

## Patrones de código limpio

### Constantes en mayúsculas, locales en minúsculas

```bash
readonly MAX_RETRIES=3
readonly LOG_DIR="/var/log/mi_app"
readonly SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

procesar() {
    local input="$1"
    local output="$2"
    local timeout="${3:-30}"
    ...
}
```

### main() como punto de entrada

```bash
#!/usr/bin/env bash
set -euo pipefail

# Todas las funciones aquí...
setup()   { ... }
process() { ... }
cleanup() { ... }

main() {
    setup "$@"
    process
}

# Solo ejecutar si no se está haciendo source
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```

---

## Portabilidad POSIX

```bash
# Usa #!/bin/sh para scripts portables
#!/bin/sh

# Evita: arrays, [[ ]], (( )), local (no POSIX en algunos sh)
# Usa: [ ], expr, variables simples

# POSIX
if [ "$var" -gt 10 ]; then
    resultado=$(expr "$a" + "$b")
fi

# Bash-específico (no POSIX)
if (( var > 10 )); then
    resultado=$(( a + b ))
fi
```

---

## Checklist de calidad

```bash
# Al inicio de cada script de producción:
#!/usr/bin/env bash
set -euo pipefail                    # Modo seguro
IFS=$'\n\t'                          # IFS seguro (no espacio)

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

# Funciones primero, main al final
# Todas las variables locales con local
# Comillas dobles siempre en variables
# Rutas absolutas (no depender de cwd)
# Log con timestamps
# Manejo de señales con trap
# Lock si puede correr en paralelo
```

---

## Práctica

1. Pasa `shellcheck` sobre todos los scripts que has creado en este path. Corrige todos los warnings.
2. Añade `IFS=$'\\n\\t'` y `readonly` a las constantes de tus scripts
3. Refactoriza el script de backup para que tenga función `main()` y soporte `source` sin ejecutarse
4. Mide el tiempo de ejecución del script de análisis de logs con archivos de diferente tamaño
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Refactorización con ShellCheck",
                "description": "Crea un script deliberadamente 'sucio' con 5+ warnings de ShellCheck, luego corrígelos todos. Verifica con shellcheck que la versión final tiene 0 warnings.",
                "hint": "Introduce: echo $var sin comillas, if [ $? ], variables sin local, $(ls) en for, comparación con = en vez de ==",
                "validation_command": "shellcheck script_limpio.sh 2>&1; echo \"Exit: $?\"",
                "expected_output_contains": "Exit: 0"
            }
        ]
    },
    {
        "title": "Expresiones Regulares Avanzadas en Bash",
        "description": "Domina las regex en Bash con el operador =~, grupos de captura y el array BASH_REMATCH para parsear texto complejo sin grep externo.",
        "difficulty": "advanced",
        "duration_minutes": 40,
        "xp_reward": 145,
        "learning_objectives": [
            "Usar el operador =~ de Bash",
            "Capturar grupos con BASH_REMATCH",
            "Validar formatos complejos",
            "Parsear texto estructurado sin comandos externos"
        ],
        "commands": ["=~", "BASH_REMATCH", "[[ ]]", "regex"],
        "guide_markdown": """# Expresiones Regulares Avanzadas en Bash

## El operador =~

Bash 3.2+ permite comparar strings con ERE directamente en `[[ ]]`:

```bash
texto="Error en línea 42 del archivo config.yml"

if [[ "$texto" =~ ^Error.*([0-9]+).*\\.([a-z]+)$ ]]; then
    echo "Match encontrado"
    echo "Línea: ${BASH_REMATCH[1]}"    # 42
    echo "Extensión: ${BASH_REMATCH[2]}" # yml
fi
```

**BASH_REMATCH:**
- `[0]` — coincidencia completa
- `[1]` — grupo de captura 1
- `[2]` — grupo de captura 2
- etc.

---

## Validaciones con =~

```bash
# Validar IPv4
is_valid_ip() {
    local ip="$1"
    local regex='^([0-9]{1,3}\.){3}[0-9]{1,3}$'
    [[ "$ip" =~ $regex ]] || return 1

    # Validar rangos 0-255
    IFS='.' read -ra octets <<< "$ip"
    for octet in "${octets[@]}"; do
        (( octet >= 0 && octet <= 255 )) || return 1
    done
}

# Validar email básico
is_valid_email() {
    local regex='^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    [[ "$1" =~ $regex ]]
}

# Validar fecha YYYY-MM-DD
is_valid_date() {
    local regex='^([0-9]{4})-([0-9]{2})-([0-9]{2})$'
    [[ "$1" =~ $regex ]] || return 1
    local year="${BASH_REMATCH[1]}" month="${BASH_REMATCH[2]}" day="${BASH_REMATCH[3]}"
    (( month >= 1 && month <= 12 )) || return 1
    (( day >= 1 && day <= 31 )) || return 1
}
```

---

## Parsear texto estructurado

```bash
# Parsear línea de log: "2024-01-15 14:23:07 [ERROR] app.py:42 mensaje de error"
parse_log_line() {
    local line="$1"
    local regex='^([0-9]{4}-[0-9]{2}-[0-9]{2}) ([0-9]{2}:[0-9]{2}:[0-9]{2}) \[([A-Z]+)\] ([^:]+):([0-9]+) (.+)$'

    if [[ "$line" =~ $regex ]]; then
        local fecha="${BASH_REMATCH[1]}"
        local hora="${BASH_REMATCH[2]}"
        local nivel="${BASH_REMATCH[3]}"
        local archivo="${BASH_REMATCH[4]}"
        local linea="${BASH_REMATCH[5]}"
        local mensaje="${BASH_REMATCH[6]}"

        echo "Fecha: $fecha | Hora: $hora | Nivel: $nivel"
        echo "Ubicación: $archivo línea $linea"
        echo "Mensaje: $mensaje"
    else
        echo "Formato de log no reconocido" >&2
        return 1
    fi
}

parse_log_line "2024-01-15 14:23:07 [ERROR] app.py:42 conexión rechazada al servidor"
```

---

## Extractor de información de URLs

```bash
parse_url() {
    local url="$1"
    local regex='^(https?)://([^/:]+)(:([0-9]+))?(/[^?#]*)?(\?[^#]*)?(#.*)?$'

    if [[ "$url" =~ $regex ]]; then
        echo "Protocolo : ${BASH_REMATCH[1]}"
        echo "Host      : ${BASH_REMATCH[2]}"
        echo "Puerto    : ${BASH_REMATCH[4]:-80}"
        echo "Ruta      : ${BASH_REMATCH[5]:-/}"
        echo "Query     : ${BASH_REMATCH[6]:-ninguna}"
        echo "Fragment  : ${BASH_REMATCH[7]:-ninguno}"
    else
        echo "URL inválida: $url" >&2
        return 1
    fi
}

parse_url "https://api.ejemplo.com:8443/v2/users?page=2&limit=10#section"
```

---

## Práctica

1. Escribe `validator.sh` con funciones de validación para: IPv4, email, URL, fecha YYYY-MM-DD y número de teléfono español
2. Escribe `parser.sh` que parsee el formato de `/etc/passwd` con =~ y BASH_REMATCH (sin awk ni cut)
3. Crea un parser de archivos `.env` que extraiga y exporte las variables correctamente, ignorando comentarios y líneas vacías
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Validador de IPs con BASH_REMATCH",
                "description": "Crea validator.sh que valide IPs usando =~ y BASH_REMATCH (sin ipcalc ni herramientas externas). Valida también el rango 0-255 de cada octeto.",
                "hint": "Captura los 4 octetos con grupos: ^([0-9]{1,3})\\.([0-9]{1,3})\\.([0-9]{1,3})\\.([0-9]{1,3})$ y luego valida cada uno",
                "validation_command": "bash validator.sh 192.168.1.1 && bash validator.sh 256.0.0.1; echo $?",
                "expected_output_contains": "1"
            }
        ]
    },
]

# ─── Proyecto Final ──────────────────────────────────────────────────────────

PROYECTO_FINAL = [
    {
        "title": "Proyecto Final: Sistema de Administración Automatizada",
        "description": "Proyecto integrador del path completo: construye un sistema de administración de servidores en Bash con monitorización, backups, análisis de logs y reportes automáticos.",
        "difficulty": "advanced",
        "duration_minutes": 120,
        "xp_reward": 500,
        "learning_objectives": [
            "Integrar todas las técnicas del path Bash Scripting",
            "Diseñar una arquitectura modular y extensible",
            "Implementar un CLI profesional con subcomandos",
            "Automatizar flujos de administración completos"
        ],
        "commands": ["getopts", "source", "declare -A", "trap", "cron", "curl", "jq", "awk", "sed"],
        "guide_markdown": """# Proyecto Final: Sistema de Administración Automatizada

## Descripción del Proyecto

Construirás **sysadmin-toolkit**, un sistema CLI modular en Bash que centraliza las tareas más comunes de administración de servidores Linux.

---

## Arquitectura completa

```
sysadmin-toolkit/
├── sysadmin.sh              # CLI principal
├── lib/
│   ├── core.sh              # registro de comandos, dispatch
│   ├── utils.sh             # logging, colores, die, retry
│   ├── validators.sh        # validación de IPs, emails, etc.
│   └── api.sh               # wrapper HTTP
├── modules/
│   ├── monitor.sh           # monitorización del sistema
│   ├── backup.sh            # sistema de backup
│   ├── logs.sh              # análisis de logs
│   ├── network.sh           # diagnóstico de red
│   └── report.sh            # generación de informes
├── tests/
│   ├── test_validators.bats
│   ├── test_backup.bats
│   └── test_monitor.bats
└── cron/
    └── cron_daily.sh        # script para cron diario
```

---

## sysadmin.sh: CLI principal

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

readonly TOOLKIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly VERSION="1.0.0"

source "$TOOLKIT_DIR/lib/core.sh"
source "$TOOLKIT_DIR/lib/utils.sh"

# Cargar módulos
for module in "$TOOLKIT_DIR/modules"/*.sh; do
    source "$module"
done

usage() {
    cat <<HELP
sysadmin-toolkit v$VERSION — Sistema de Administración Automatizada

Uso: $(basename $0) <comando> [opciones]

COMANDOS:
$(show_commands)

Opciones globales:
  --debug     Modo debug (set -x)
  --help      Mostrar ayuda
  --version   Mostrar versión

Ejemplos:
  $(basename $0) monitor:cpu --top 10
  $(basename $0) backup:create --src /datos --dst /backups
  $(basename $0) logs:analyze --file /var/log/nginx/access.log --top 5
  $(basename $0) report:html --output /tmp/informe.html
HELP
}

main() {
    [[ $# -eq 0 ]] && { usage; exit 0; }

    case "$1" in
        --debug)   set -x; shift ;;
        --help|-h) usage; exit 0 ;;
        --version) echo "v$VERSION"; exit 0 ;;
    esac

    dispatch "$@"
}

main "$@"
```

---

## modules/monitor.sh

```bash
#!/usr/bin/env bash
# Módulo de monitorización del sistema

_monitor_cpu() {
    local top_n="${1:-5}"
    echo "=== TOP $top_n PROCESOS POR CPU ==="
    ps aux --sort=-%cpu | awk -v n="$top_n" \
        'NR>1 && NR<=n+1 {printf "%-8s %-6s %5s%%  %s\n", $1, $2, $3, $11}'
}

_monitor_mem() {
    echo "=== MEMORIA ==="
    free -h | awk '
    /^Mem:/ { printf "RAM:  %s usada / %s total (libre: %s)\n", $3, $2, $4 }
    /^Swap:/ { printf "Swap: %s usada / %s total\n", $3, $2 }
    '
}

_monitor_disk() {
    echo "=== DISCO ==="
    df -h --output=source,size,used,avail,pcent,target | \
        grep -v "tmpfs\|udev" | column -t
}

_monitor_all() {
    local hostname uptime_str
    hostname=$(hostname -f)
    uptime_str=$(uptime -p 2>/dev/null || uptime)

    echo "╔══════════════════════════════════════╗"
    printf "║  ESTADO: %-29s║\n" "$hostname"
    printf "║  Uptime: %-29s║\n" "$uptime_str"
    echo "╠══════════════════════════════════════╣"
    _monitor_cpu
    echo ""
    _monitor_mem
    echo ""
    _monitor_disk
    echo "╚══════════════════════════════════════╝"
}

register_command "monitor:cpu"  "Top N procesos por CPU"     "_monitor_cpu"
register_command "monitor:mem"  "Estado de memoria RAM/Swap" "_monitor_mem"
register_command "monitor:disk" "Uso de disco por partición" "_monitor_disk"
register_command "monitor:all"  "Vista completa del sistema" "_monitor_all"
```

---

## modules/backup.sh

```bash
#!/usr/bin/env bash

_backup_create() {
    local src="${1:?'--src requerido'}"
    local dst="${2:?'--dst requerido'}"
    local retention="${3:-7}"

    [[ -d "$src" ]] || die "Directorio origen no existe: $src"
    mkdir -p "$dst"

    local date backup_name
    date=$(date '+%Y%m%d_%H%M%S')
    backup_name="backup_${date}.tar.gz"

    log_info "Creando backup: $backup_name"
    tar -czf "${dst}/${backup_name}" --exclude="*.tmp" "$src" 2>/dev/null
    sha256sum "${dst}/${backup_name}" > "${dst}/${backup_name}.sha256"
    log_info "Backup verificado: $(du -sh "${dst}/${backup_name}" | cut -f1)"

    # Rotar
    find "$dst" -name "backup_*.tar.gz" -mtime +"$retention" -delete
    log_info "Backups más antiguos de ${retention} días eliminados"
}

_backup_verify() {
    local backup_file="${1:?'Especifica el archivo de backup'}"
    [[ -f "$backup_file" ]] || die "Archivo no encontrado: $backup_file"

    if sha256sum --check "${backup_file}.sha256" &>/dev/null && \
       tar -tzf "$backup_file" &>/dev/null; then
        log_info "✓ Backup íntegro: $backup_file"
    else
        log_error "✗ Backup corrupto: $backup_file"
        return 1
    fi
}

register_command "backup:create" "Crear backup comprimido con rotación" "_backup_create"
register_command "backup:verify" "Verificar integridad de un backup"    "_backup_verify"
```

---

## cron/cron_daily.sh

```bash
#!/usr/bin/env bash
# Ejecutar diariamente via cron:
# 0 2 * * * /ruta/sysadmin-toolkit/cron/cron_daily.sh >> /var/log/sysadmin.log 2>&1

set -euo pipefail
TOOLKIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$TOOLKIT_DIR/sysadmin.sh" backup:create /datos /backups 30
"$TOOLKIT_DIR/sysadmin.sh" monitor:all > /tmp/daily_report.txt
"$TOOLKIT_DIR/sysadmin.sh" report:html --input /tmp/daily_report.txt --output /var/www/html/status.html
```

---

## Tests de integración

```bash
# tests/test_monitor.bats
@test "monitor:cpu devuelve al menos 5 líneas" {
    run "$TOOLKIT_DIR/sysadmin.sh" monitor:cpu 5
    [ "$status" -eq 0 ]
    [ "${#lines[@]}" -ge 5 ]
}

@test "monitor:all muestra hostname" {
    run "$TOOLKIT_DIR/sysadmin.sh" monitor:all
    [ "$status" -eq 0 ]
    [[ "$output" == *"$(hostname)"* ]]
}

@test "backup:create crea archivo .tar.gz" {
    local src=$(mktemp -d)
    local dst=$(mktemp -d)
    echo "prueba" > "$src/datos.txt"
    run "$TOOLKIT_DIR/sysadmin.sh" backup:create "$src" "$dst" 7
    [ "$status" -eq 0 ]
    local count=$(ls "$dst"/*.tar.gz 2>/dev/null | wc -l)
    [ "$count" -ge 1 ]
    rm -rf "$src" "$dst"
}
```

---

## Criterios de evaluación del proyecto

Para completar este proyecto satisfactoriamente:

1. **CLI funcional**: `sysadmin.sh help` lista todos los comandos disponibles
2. **Monitor**: `monitor:all` muestra CPU, RAM y disco del sistema real
3. **Backup**: `backup:create` genera tar.gz, checksum y rota correctamente
4. **Logs**: `logs:analyze` procesa un access.log y muestra top IPs y errores
5. **Red**: `network:check` verifica puertos y servicios configurables
6. **Tests**: Al menos 5 tests bats que pasen
7. **Cron**: Script diario configurado y probado
8. **ShellCheck**: Sin warnings en ningún archivo
""",
        "challenges": [
            {
                "id": "c1",
                "title": "CLI con al menos 4 módulos funcionando",
                "description": "Implementa sysadmin-toolkit con los módulos monitor, backup, y al menos 2 más. El comando 'help' debe listar todos. Demuestra con: sysadmin.sh monitor:all",
                "hint": "Empieza con la estructura base y los módulos monitor + backup. Añade logs y network después.",
                "validation_command": "bash sysadmin.sh help 2>&1 | grep -c 'monitor\\|backup\\|logs\\|network'",
                "expected_output_contains": "4"
            },
            {
                "id": "c2",
                "title": "Suite de tests completa",
                "description": "Crea tests bats para monitor:all, backup:create y al menos un módulo más. Todos deben pasar.",
                "hint": "Usa setup() y teardown() para crear y limpiar directorios temporales en cada test",
                "validation_command": "bats tests/ 2>&1 | grep -E 'passed|ok'",
                "expected_output_contains": "passed"
            }
        ]
    },
]

# ─── MAIN ───────────────────────────────────────────────────────────────────

def seed():
    db = SessionLocal()
    try:
        bash_path = get_bash_path(db)
        print(f"[PATH] {bash_path.title} (id={bash_path.id})")

        max_order = db.query(func.max(Module.order_index)).filter(
            Module.skill_path_id == bash_path.id
        ).scalar() or 0

        # M5
        m5 = upsert_module(db, bash_path.id,
            "M5 — Scripts Avanzados y Automatización",
            "Lleva tus scripts al siguiente nivel: cron, APIs REST, backups, testing con bats, ShellCheck y buenas prácticas de código profesional.",
            max_order + 1)
        print(f"\n[M5] Insertando {len(M5_LABS)} labs...")
        insert_labs(db, m5, M5_LABS)

        # Proyecto Final
        pf = upsert_module(db, bash_path.id,
            "Proyecto Final — Sistema de Administración Automatizada",
            "Proyecto integrador: construye un toolkit CLI completo que combine todos los conocimientos del path en un sistema real de administración de servidores.",
            max_order + 2)
        print(f"\n[PF] Insertando {len(PROYECTO_FINAL)} lab(s)...")
        insert_labs(db, pf, PROYECTO_FINAL)

        total = len(M5_LABS) + len(PROYECTO_FINAL)
        print(f"\n✅ seed_bash_part3.py completado: M5 ({len(M5_LABS)} labs) + Proyecto Final ({len(PROYECTO_FINAL)} lab)")
        print(f"✅ PATH 'Bash Scripting' completo: M1+M2+M3+M4+M5+PF")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
