import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(env_path)

from database import SessionLocal, Lab, Challenge, SkillPath, Module, create_tables

def seed():
    db = SessionLocal()
    create_tables()

    path = db.query(SkillPath).filter(SkillPath.title == "Terminal Skills").first()
    if not path:
        path = SkillPath(
            title="Terminal Skills",
            description="Domina la terminal de Linux desde cero. Aprende a navegar, filtrar texto, automatizar tareas y convertirte en un experto de la línea de comandos.",
            difficulty="easy",
            order_index=10,
            is_active=True
        )
        db.add(path)
        db.commit()
        db.refresh(path)

    module = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M10 — CTF Terminal").first()
    if not module:
        module = Module(
            skill_path_id=path.id,
            title="M10 — CTF Terminal",
            description="Pon a prueba todo lo que has aprendido con desafíos tipo CTF (Capture The Flag). Combina comandos, pipes, búsqueda y scripting para resolver retos reales de terminal.",
            order_index=11,
            is_active=True
        )
        db.add(module)
        db.commit()
        db.refresh(module)

    labs_data = [
        {
            "title": "CTF #1 — El Fichero Perdido",
            "description": """# CTF #1 — El Fichero Perdido

## Historia
Un administrador de sistemas dejó una nota importante en algún lugar del servidor antes de irse de vacaciones. Está en un fichero de texto en algún lugar del sistema, pero no recuerdas dónde. Solo sabes que:

- La nota contiene la palabra **"importante"**
- El fichero tiene extensión **.txt**
- Probablemente está en `/home` o en `/tmp`

## Tu Misión
Encuentra el fichero, lee su contenido y sigue las instrucciones que contiene.

## Herramientas que Necesitarás
```bash
find    # para localizar ficheros
grep    # para buscar texto dentro de ficheros
cat     # para leer ficheros
```

## Pistas de Comandos
```bash
# Buscar ficheros .txt en /home y /tmp
find /home /tmp -name "*.txt" 2>/dev/null

# Buscar el texto "importante" en todos los .txt
grep -r "importante" /home /tmp --include="*.txt" 2>/dev/null

# Combinar: encontrar .txt que contengan "importante"
find /home /tmp -name "*.txt" 2>/dev/null | xargs grep -l "importante" 2>/dev/null
```

## ¿Qué Aprenderás?
- Combinar `find` y `grep` con pipes
- Usar `xargs` para pasar resultados como argumentos
- Buscar recursivamente texto en ficheros
""",
            "goal_description": "Encuentra el fichero oculto que contiene la palabra 'importante' y sigue sus instrucciones.",
            "difficulty": "easy",
            "xp_reward": 250,
            "order_index": 1,
            "time_limit": 20,
            "scenario_setup": json.dumps({
                "init_commands": [
                    "mkdir -p /home/user/documentos/trabajo/2024",
                    "mkdir -p /home/user/documentos/personal",
                    "mkdir -p /tmp/archivos_temporales",
                    "echo 'Lista de compras: leche, pan, huevos' > /home/user/documentos/personal/compras.txt",
                    "echo 'Reunión el lunes a las 10h' > /home/user/documentos/trabajo/reunion.txt",
                    "echo 'MENSAJE IMPORTANTE: La clave del servidor de backup es: FLAG{find_grep_master_2024}' > /home/user/documentos/trabajo/2024/nota_admin.txt",
                    "echo 'Informe trimestral Q3 - Resultados satisfactorios' > /home/user/documentos/trabajo/2024/informe_q3.txt",
                    "echo 'borrador sin terminar...' > /tmp/archivos_temporales/borrador.txt",
                    "echo 'logs del sistema' > /tmp/archivos_temporales/system.log"
                ],
                "working_dir": "/home/user"
            }),
            "step_by_step_guide": """## Paso 1 — Explorar la estructura de directorios
```bash
find /home/user -type f -name "*.txt"
```

## Paso 2 — Buscar el fichero con "importante"
```bash
grep -rl "importante" /home/user /tmp 2>/dev/null
```

## Paso 3 — Leer el fichero encontrado
```bash
# Sustituye la ruta por la que encontraste:
cat /home/user/documentos/trabajo/2024/nota_admin.txt
```

## Paso 4 — Guardar la flag
```bash
# Copia la FLAG al fichero de respuesta:
grep "FLAG" /home/user/documentos/trabajo/2024/nota_admin.txt > /home/user/flag1.txt
cat /home/user/flag1.txt
```
""",
            "challenges": [
                {
                    "title": "Encuentra y guarda la FLAG",
                    "description": "Busca el fichero que contiene 'importante', extrae la línea con 'FLAG' y guárdala en /home/user/flag1.txt",
                    "v_type": "file_content_flag",
                    "v_value": "/home/user/flag1.txt",
                    "v_extra": "FLAG{find_grep_master_2024}",
                    "hints": json.dumps(["grep -rl 'importante' /home/user 2>/dev/null", "grep 'FLAG' <fichero_encontrado> > /home/user/flag1.txt"])
                }
            ]
        },
        {
            "title": "CTF #2 — Análisis de Logs",
            "description": """# CTF #2 — Análisis de Logs

## Historia
El servidor de la academia ha sido escaneado por alguien. Los logs de acceso muestran actividad sospechosa. Tu misión es analizar los logs, identificar la IP atacante y descubrir qué ruta estaba buscando.

## Fichero de Logs
El fichero de logs está en `/home/user/logs/access.log` con el formato:
```
IP - - [fecha] "MÉTODO /ruta HTTP/1.1" código bytes
```

## Tu Misión
1. Encuentra la IP que más peticiones hizo
2. Descubre qué ruta intentó acceder repetidamente
3. Identifica el código de error más frecuente

## Herramientas
```bash
awk         # procesar columnas del log
cut         # extraer campos
sort        # ordenar
uniq -c     # contar ocurrencias
head/tail   # primeras/últimas líneas
grep        # filtrar patrones
```

## Comandos Clave para Logs
```bash
# Ver las IPs únicas
awk '{print $1}' access.log | sort | uniq -c | sort -rn

# Ver los códigos de respuesta
awk '{print $9}' access.log | sort | uniq -c | sort -rn

# Ver las rutas más accedidas
awk '{print $7}' access.log | sort | uniq -c | sort -rn | head -10

# Filtrar por IP específica
grep "192.168.1.100" access.log | awk '{print $7}' | sort | uniq -c
```
""",
            "goal_description": "Analiza logs de acceso web para identificar la IP atacante y las rutas que intentó acceder.",
            "difficulty": "medium",
            "xp_reward": 300,
            "order_index": 2,
            "time_limit": 30,
            "scenario_setup": json.dumps({
                "init_commands": [
                    "mkdir -p /home/user/logs",
                    "python3 -c \"\nimport random\nimport datetime\n\nips_normales = ['10.0.0.1', '10.0.0.2', '10.0.0.5', '192.168.1.10', '172.16.0.3']\nip_atacante = '45.33.32.156'\nrutas_normales = ['/', '/index.html', '/about', '/contact', '/api/health']\nrutas_ataque = ['/admin', '/wp-admin', '/login', '/.env', '/config.php', '/phpmyadmin', '/admin/login']\n\nlines = []\nfor _ in range(200):\n    ip = random.choice(ips_normales)\n    ruta = random.choice(rutas_normales)\n    codigo = random.choice([200, 200, 200, 304, 404])\n    lines.append(f'{ip} - - [20/Mar/2024:10:00:00 +0000] \\\"GET {ruta} HTTP/1.1\\\" {codigo} 512')\n\nfor _ in range(150):\n    ruta = random.choice(rutas_ataque)\n    codigo = random.choice([403, 404, 401])\n    lines.append(f'{ip_atacante} - - [20/Mar/2024:10:00:01 +0000] \\\"GET {ruta} HTTP/1.1\\\" {codigo} 128')\n\nrandom.shuffle(lines)\nwith open('/home/user/logs/access.log', 'w') as f:\n    f.write('\\n'.join(lines) + '\\n')\nprint('Log generado')\n\""
                ],
                "working_dir": "/home/user/logs"
            }),
            "step_by_step_guide": """## Paso 1 — Ver las primeras líneas del log
```bash
head -5 /home/user/logs/access.log
wc -l /home/user/logs/access.log
```

## Paso 2 — Identificar IPs por número de peticiones
```bash
awk '{print $1}' /home/user/logs/access.log | sort | uniq -c | sort -rn | head -10
```

## Paso 3 — Ver qué rutas pidió la IP sospechosa
```bash
# Sustituye la IP por la que encontraste:
grep "45.33.32.156" /home/user/logs/access.log | awk '{print $7}' | sort | uniq -c | sort -rn
```

## Paso 4 — Ver códigos de respuesta
```bash
awk '{print $9}' /home/user/logs/access.log | sort | uniq -c | sort -rn
```

## Paso 5 — Generar informe
```bash
{
  echo "=== Análisis de Logs de Acceso ==="
  echo ""
  echo "TOP 5 IPs por peticiones:"
  awk '{print $1}' /home/user/logs/access.log | sort | uniq -c | sort -rn | head -5
  echo ""
  echo "Rutas más accedidas:"
  awk '{print $7}' /home/user/logs/access.log | sort | uniq -c | sort -rn | head -10
  echo ""
  echo "Códigos de respuesta:"
  awk '{print $9}' /home/user/logs/access.log | sort | uniq -c | sort -rn
} > /home/user/logs/informe_seguridad.txt
```
""",
            "challenges": [
                {
                    "title": "Identifica la IP atacante y genera informe",
                    "description": "Analiza access.log, identifica la IP con más peticiones y genera /home/user/logs/informe_seguridad.txt con el análisis completo.",
                    "v_type": "file_created",
                    "v_value": "/home/user/logs/informe_seguridad.txt",
                    "v_extra": None,
                    "hints": json.dumps(["awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -5", "Usa { echo ...; } > informe_seguridad.txt para crear el informe"])
                },
                {
                    "title": "Guarda la IP atacante en atacante.txt",
                    "description": "Extrae solo la IP que más peticiones hizo (la primera de la lista ordenada) y guárdala en /home/user/logs/atacante.txt",
                    "v_type": "file_content_flag",
                    "v_value": "/home/user/logs/atacante.txt",
                    "v_extra": "45.33.32.156",
                    "hints": json.dumps(["awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -1 | awk '{print $2}' > atacante.txt"])
                }
            ]
        },
        {
            "title": "CTF #3 — El Script Roto",
            "description": """# CTF #3 — El Script Roto

## Historia
Tu predecesor dejó un script de mantenimiento que hacía algo importante, pero está roto. Tu misión: **entender qué debería hacer** y **arreglarlo**.

## El Script Original (roto)
```bash
#!/bin/bash
# Script de mantenimiento - VERSIÓN ROTA

DIRECTORIO_LOGS=/home/user/mantenimiento/logs
DIRECTORIO_BACKUP=/home/user/mantenimiento/backups
FECHA=date +%Y%m%d   # BUG: falta $(...)

mkdir $DIRECTORIO_LOGS
mkdir $DIRECTORIO_BACKUP   # BUG: falta -p

# Limpiar logs viejos (más de 7 días)
find $DIRECTORIO_LOGS -name "*.log" -mtime +7 | rm   # BUG: falta xargs

# Contar ficheros en backup
TOTAL=ls $DIRECTORIO_BACKUP | wc -l   # BUG: falta $(...)

echo "Backup completado. Total ficheros: $TOTAL" > $DIRECTORIO_LOGS/reporte_$FECHA.txt
```

## Tu Misión
1. Identifica y corrige los 4 bugs del script
2. Guarda el script corregido como `mantenimiento_fixed.sh`
3. Hazlo ejecutable y ejecútalo con éxito

## Los 4 Bugs
- **Bug 1**: `FECHA=date +%Y%m%d` — La asignación no usa sustitución de comandos
- **Bug 2**: `mkdir $DIRECTORIO_BACKUP` — Falla si el directorio padre no existe
- **Bug 3**: `find ... | rm` — `rm` no acepta pipes, necesita `xargs`
- **Bug 4**: `TOTAL=ls $DIRECTORIO_BACKUP | wc -l` — Falta sustitución de comandos

## Herramientas
```bash
bash -n script.sh    # Verificar sintaxis sin ejecutar
bash -x script.sh    # Ejecutar con debug (muestra cada línea)
shellcheck           # Análisis estático (si disponible)
```
""",
            "goal_description": "Corrige los 4 bugs del script de mantenimiento y ejecútalo correctamente.",
            "difficulty": "medium",
            "xp_reward": 300,
            "order_index": 3,
            "time_limit": 35,
            "scenario_setup": json.dumps({
                "init_commands": [
                    "mkdir -p /home/user/mantenimiento",
                    "cat << 'SCRIPT' > /home/user/mantenimiento/mantenimiento_roto.sh\n#!/bin/bash\n# Script de mantenimiento - VERSIÓN ROTA\n\nDIRECTORIO_LOGS=/home/user/mantenimiento/logs\nDIRECTORIO_BACKUP=/home/user/mantenimiento/backups\nFECHA=date +%Y%m%d\n\nmkdir $DIRECTORIO_LOGS\nmkdir $DIRECTORIO_BACKUP\n\nfind $DIRECTORIO_LOGS -name \"*.log\" -mtime +7 | rm\n\nTOTAL=ls $DIRECTORIO_BACKUP | wc -l\n\necho \"Backup completado. Total ficheros: $TOTAL\" > $DIRECTORIO_LOGS/reporte_$FECHA.txt\nSCRIPT",
                    "chmod +x /home/user/mantenimiento/mantenimiento_roto.sh"
                ],
                "working_dir": "/home/user/mantenimiento"
            }),
            "step_by_step_guide": """## Paso 1 — Leer el script roto
```bash
cat /home/user/mantenimiento/mantenimiento_roto.sh
```

## Paso 2 — Verificar la sintaxis
```bash
bash -n /home/user/mantenimiento/mantenimiento_roto.sh
```

## Paso 3 — Corregir y guardar
```bash
cat << 'EOF' > /home/user/mantenimiento/mantenimiento_fixed.sh
#!/bin/bash
DIRECTORIO_LOGS=/home/user/mantenimiento/logs
DIRECTORIO_BACKUP=/home/user/mantenimiento/backups
FECHA=$(date +%Y%m%d)

mkdir -p $DIRECTORIO_LOGS
mkdir -p $DIRECTORIO_BACKUP

find $DIRECTORIO_LOGS -name "*.log" -mtime +7 | xargs rm -f 2>/dev/null

TOTAL=$(ls $DIRECTORIO_BACKUP | wc -l)

echo "Backup completado. Total ficheros: $TOTAL" > $DIRECTORIO_LOGS/reporte_$FECHA.txt
echo "Script completado OK"
EOF
```

## Paso 4 — Hacerlo ejecutable y ejecutar
```bash
chmod +x /home/user/mantenimiento/mantenimiento_fixed.sh
bash /home/user/mantenimiento/mantenimiento_fixed.sh
```

## Paso 5 — Verificar el reporte generado
```bash
ls /home/user/mantenimiento/logs/
cat /home/user/mantenimiento/logs/reporte_*.txt
```
""",
            "challenges": [
                {
                    "title": "Crea mantenimiento_fixed.sh con los bugs corregidos",
                    "description": "Corrige los 4 bugs y guarda el script en /home/user/mantenimiento/mantenimiento_fixed.sh",
                    "v_type": "file_created",
                    "v_value": "/home/user/mantenimiento/mantenimiento_fixed.sh",
                    "v_extra": None,
                    "hints": json.dumps(["Bug 1: FECHA=$(date +%Y%m%d)", "Bug 2: mkdir -p", "Bug 3: find ... | xargs rm -f", "Bug 4: TOTAL=$(ls ... | wc -l)"])
                },
                {
                    "title": "Ejecuta el script y genera el reporte",
                    "description": "Ejecuta mantenimiento_fixed.sh para que genere el fichero de reporte en /home/user/mantenimiento/logs/",
                    "v_type": "directory_created",
                    "v_value": "/home/user/mantenimiento/logs",
                    "v_extra": None,
                    "hints": json.dumps(["chmod +x mantenimiento_fixed.sh && bash mantenimiento_fixed.sh"])
                }
            ]
        },
        {
            "title": "CTF #4 — Reto Final: El Sysadmin Completo",
            "description": """# CTF #4 — Reto Final: El Sysadmin Completo

## Historia
Has sido contratado como administrador de sistemas junior. En tu primer día, debes realizar varias tareas críticas usando solo la terminal. El jefe evaluará tu trabajo al final del día.

## Tareas del Día

### Tarea 1 — Inventario del Sistema
Crea un fichero `/home/user/sysadmin/inventario.txt` con:
- Hostname del servidor
- Usuario actual
- Versión del kernel
- Espacio en disco disponible
- Memoria RAM total y disponible
- Número de procesos activos

### Tarea 2 — Gestión de Usuarios en CSV
Extrae de `/etc/passwd` solo los usuarios con shell `/bin/bash` o `/bin/sh`, y crea `/home/user/sysadmin/usuarios_shell.csv` con formato:
```
usuario,uid,shell
root,0,/bin/bash
...
```

### Tarea 3 — Monitor de Errores
Busca en `/var/log/` ficheros que contengan la palabra "error" (case-insensitive) y guarda en `/home/user/sysadmin/errores_encontrados.txt` la lista de ficheros y el número de ocurrencias.

### Tarea 4 — Script de Informe
Crea un script `/home/user/sysadmin/informe_diario.sh` que automatice la generación del inventario del sistema.

## Comandos que Necesitarás
```bash
hostname, uname -r, df -h, free -h, nproc, ps aux
awk, cut, grep, sort
find, wc -l
chmod +x, bash
```
""",
            "goal_description": "Completa las 4 tareas de administración de sistemas para demostrar tu dominio de la terminal.",
            "difficulty": "hard",
            "xp_reward": 500,
            "order_index": 4,
            "time_limit": 60,
            "scenario_setup": json.dumps({
                "init_commands": [
                    "mkdir -p /home/user/sysadmin"
                ],
                "working_dir": "/home/user/sysadmin"
            }),
            "step_by_step_guide": """## Tarea 1 — Inventario del Sistema
```bash
{
  echo "=== INVENTARIO DEL SISTEMA ==="
  echo "Fecha: $(date)"
  echo "Hostname: $(hostname)"
  echo "Usuario: $(whoami)"
  echo "Kernel: $(uname -r)"
  echo ""
  echo "--- Disco ---"
  df -h | grep -v tmpfs
  echo ""
  echo "--- Memoria ---"
  free -h
  echo ""
  echo "Procesos activos: $(ps aux | wc -l)"
} > /home/user/sysadmin/inventario.txt
cat /home/user/sysadmin/inventario.txt
```

## Tarea 2 — Usuarios con Shell
```bash
echo "usuario,uid,shell" > /home/user/sysadmin/usuarios_shell.csv
awk -F: '$7 ~ /\\/bin\\/(bash|sh)$/ {print $1","$3","$7}' /etc/passwd >> /home/user/sysadmin/usuarios_shell.csv
cat /home/user/sysadmin/usuarios_shell.csv
```

## Tarea 3 — Monitor de Errores
```bash
{
  echo "=== Ficheros con errores en /var/log/ ==="
  find /var/log -type f 2>/dev/null | while read f; do
    count=$(grep -ic "error" "$f" 2>/dev/null)
    if [ "$count" -gt 0 ]; then
      echo "$count $f"
    fi
  done | sort -rn
} > /home/user/sysadmin/errores_encontrados.txt
head -20 /home/user/sysadmin/errores_encontrados.txt
```

## Tarea 4 — Script de Informe
```bash
cat << 'EOF' > /home/user/sysadmin/informe_diario.sh
#!/bin/bash
SALIDA="/home/user/sysadmin/informe_$(date +%Y%m%d_%H%M%S).txt"
{
  echo "=== INFORME DIARIO DEL SISTEMA ==="
  echo "Generado: $(date)"
  echo "Host: $(hostname) | Usuario: $(whoami) | Kernel: $(uname -r)"
  echo ""
  echo "DISCO:"
  df -h | grep -v tmpfs | grep -v "Filesystem"
  echo ""
  echo "MEMORIA:"
  free -h | grep -E "Mem|Swap"
  echo ""
  echo "PROCESOS ACTIVOS: $(ps aux | wc -l)"
  echo ""
  echo "TOP 5 PROCESOS POR CPU:"
  ps aux --sort=-%cpu | awk 'NR>1 && NR<=6 {print $1, $3"%", $11}'
} > $SALIDA
echo "Informe guardado en: $SALIDA"
EOF
chmod +x /home/user/sysadmin/informe_diario.sh
bash /home/user/sysadmin/informe_diario.sh
```
""",
            "challenges": [
                {
                    "title": "Genera inventario.txt del sistema",
                    "description": "Crea /home/user/sysadmin/inventario.txt con hostname, usuario, kernel, disco y memoria.",
                    "v_type": "file_created",
                    "v_value": "/home/user/sysadmin/inventario.txt",
                    "v_extra": None,
                    "hints": json.dumps(["Usa { echo ...; hostname; uname -r; df -h; free -h; } > inventario.txt"])
                },
                {
                    "title": "Crea usuarios_shell.csv",
                    "description": "Extrae usuarios con /bin/bash o /bin/sh de /etc/passwd y crea /home/user/sysadmin/usuarios_shell.csv con cabecera usuario,uid,shell",
                    "v_type": "file_created",
                    "v_value": "/home/user/sysadmin/usuarios_shell.csv",
                    "v_extra": None,
                    "hints": json.dumps(["awk -F: '$7 ~ /\\/bin\\/(bash|sh)$/ {print $1\",\"$3\",\"$7}' /etc/passwd"])
                },
                {
                    "title": "Crea y ejecuta informe_diario.sh",
                    "description": "Crea el script /home/user/sysadmin/informe_diario.sh, hazlo ejecutable y ejecútalo.",
                    "v_type": "file_exists_in_directory",
                    "v_value": "/home/user/sysadmin",
                    "v_extra": "informe_diario.sh",
                    "hints": json.dumps(["chmod +x informe_diario.sh", "bash informe_diario.sh"])
                }
            ]
        }
    ]

    for l_data in labs_data:
        existing = db.query(Lab).filter(Lab.module_id == module.id, Lab.title == l_data["title"]).first()
        if existing:
            continue
        lab = Lab(
            module_id=module.id,
            title=l_data["title"],
            description=l_data["description"],
            goal_description=l_data["goal_description"],
            difficulty=l_data.get("difficulty", "medium"),
            category="Linux",
            scenario_setup=l_data.get("scenario_setup"),
            step_by_step_guide=l_data["step_by_step_guide"],
            is_active=True,
            xp_reward=l_data.get("xp_reward", 300),
            order_index=l_data.get("order_index", 1),
            time_limit=l_data.get("time_limit", 40),
            docker_image="ubuntu:22.04"
        )
        db.add(lab)
        db.commit()
        db.refresh(lab)

        for idx, c_data in enumerate(l_data.get("challenges", [])):
            existing_c = db.query(Challenge).filter(Challenge.lab_id == lab.id, Challenge.title == c_data["title"]).first()
            if not existing_c:
                challenge = Challenge(
                    lab_id=lab.id,
                    title=c_data["title"],
                    description=c_data.get("description", ""),
                    validation_type=c_data["v_type"],
                    validation_value=c_data["v_value"],
                    validation_extra=c_data.get("v_extra"),
                    order_index=idx,
                    xp=c_data.get("xp", 50),
                    hints=c_data.get("hints")
                )
                db.add(challenge)
        db.commit()

    print(f"✅ Terminal Skills - M10 CTF Terminal seeded OK")
    db.close()

if __name__ == "__main__":
    seed()
