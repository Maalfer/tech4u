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

    module = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M3 — Búsqueda en el Sistema").first()
    if not module:
        module = Module(
            skill_path_id=path.id,
            title="M3 — Búsqueda en el Sistema",
            description="Domina todas las herramientas de búsqueda en Linux. Desde find hasta grep, aprende a localizar archivos, buscar texto y combinar herramientas para tareas avanzadas de administración.",
            order_index=4,
            is_active=True
        )
        db.add(module)
        db.commit()
        db.refresh(module)

    labs_data = [
        {
            "title": "find: El Buscador Definitivo",
            "description": """# find: El Buscador Definitivo

**find** es una de las herramientas más poderosas de Linux para búsquedas avanzadas. Permite localizar archivos y directorios usando múltiples criterios.

## Sintaxis Básica
```
find [ruta] [opciones] [criterios]
```

## Opciones Principales

### Por Nombre
- `-name patrón` — Busca exactamente por nombre (case-sensitive)
- `-iname patrón` — Busca ignorando mayúsculas (case-insensitive)

### Por Tipo
- `-type f` — Solo archivos normales
- `-type d` — Solo directorios
- `-type l` — Solo enlaces simbólicos

### Por Tiempo
- `-mtime +N` — Modificado hace más de N días
- `-mtime -N` — Modificado hace menos de N días
- `-mtime N` — Exactamente hace N días

### Por Tamaño
- `-size +Nk` — Mayor que N kilobytes
- `-size -Nk` — Menor que N kilobytes
- `-size Nk` — Exactamente N kilobytes

### Profundidad
- `-maxdepth N` — Máximo N niveles de profundidad
- `-mindepth N` — Mínimo N niveles de profundidad

## Ejemplos
```bash
find /home -name "*.txt"
find /home -iname "documento*"
find / -type f -size +10M
find /var/log -mtime -7
find /home -maxdepth 3 -type d
```

find es un comando esencial para cualquier administrador de sistemas.""",
            "goal_description": "Aprende a usar find con sus opciones principales (-name, -type, -mtime, -size) para localizar archivos en el sistema.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "files": [
                    {"path": "/home/student/documentos/informe.txt", "content": "Informe anual 2024"},
                    {"path": "/home/student/documentos/notas.txt", "content": "Notas del proyecto"},
                    {"path": "/home/student/logs/error.log", "content": "ERROR: disco lleno"},
                    {"path": "/home/student/logs/acceso.log", "content": "INFO: usuario logueado"},
                    {"path": "/home/student/scripts/backup.sh", "content": "#!/bin/bash\necho backup"}
                ],
                "directories": [
                    "/home/student/documentos",
                    "/home/student/logs",
                    "/home/student/scripts"
                ]
            }),
            "step_by_step_guide": """1. Navega a /home/student
2. Usa find para localizar todos los archivos .txt
3. Guarda el resultado (solo nombres de archivos) en /home/student/archivos_encontrados.txt
4. Verifica que 'informe.txt' y 'notas.txt' están en el archivo""",
            "xp_reward": 150,
            "order_index": 1,
            "time_limit": 30,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Crear archivo de resultados",
                    "description": "El archivo /home/student/archivos_encontrados.txt debe existir",
                    "v_type": "file_created",
                    "v_value": "/home/student/archivos_encontrados.txt",
                    "hints": ["Usa: find /home/student -name '*.txt'", "Redirige los resultados a un archivo con >"]
                },
                {
                    "title": "Verificar contenido",
                    "description": "El archivo debe contener 'informe.txt'",
                    "v_type": "file_content_flag",
                    "v_value": "informe.txt",
                    "v_extra": "/home/student/archivos_encontrados.txt",
                    "hints": ["Asegúrate de incluir los nombres de los archivos encontrados"]
                }
            ]
        },
        {
            "title": "find con Acciones: -exec",
            "description": """# find con Acciones: -exec

Una vez localizados archivos, puedes ejecutar acciones sobre ellos directamente con find.

## -exec: Ejecutar Comandos

### Sintaxis
```bash
find [criterios] -exec comando {} \;
find [criterios] -exec comando {} +
```

- `{}` — Placeholder para el archivo encontrado
- `\;` — Terminator con ejecución individual (lenta)
- `+` — Terminator con ejecución en batch (rápida)

## Ejemplos
```bash
find /tmp -name "*.log" -exec rm {} \;
find /home -type f -exec chmod 644 {} +
find . -name "*.bak" -exec mv {} /backup \;
find /var -type f -exec grep "ERROR" {} \;
```

## -delete: Borrar Directamente
```bash
find /tmp -name "*.tmp" -delete
```

## Notas Importantes
- `-exec` es muy poderoso, úsalo con cuidado
- Siempre prueba primero sin -exec
- Para borrar, considera usar -delete que es más seguro""",
            "goal_description": "Aprende a usar -exec para ejecutar comandos sobre archivos encontrados y -delete para borrarlos.",
            "difficulty": "medium",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "files": [
                    {"path": "/home/student/temp/archivo1.bak", "content": "backup 1"},
                    {"path": "/home/student/temp/archivo2.bak", "content": "backup 2"},
                    {"path": "/home/student/temp/importante.txt", "content": "no borrar"}
                ],
                "directories": [
                    "/home/student/temp",
                    "/home/student/procesados"
                ]
            }),
            "step_by_step_guide": """1. Navega a /home/student
2. Usa find para localizar archivos .bak en /home/student/temp
3. Usa -exec para mover esos archivos a /home/student/procesados
4. Verifica que /home/student/procesados contiene los archivos movidos""",
            "xp_reward": 175,
            "order_index": 2,
            "time_limit": 35,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Directorio de procesados creado",
                    "description": "El directorio /home/student/procesados debe existir con archivos .bak",
                    "v_type": "directory_created",
                    "v_value": "/home/student/procesados",
                    "hints": ["Usa: find /home/student/temp -name '*.bak' -exec mv {} /home/student/procesados \\;", "Recuerda terminar -exec con \\; o +"]
                }
            ]
        },
        {
            "title": "grep -r: Busca Texto en Archivos",
            "description": """# grep -r: Busca Recursiva de Texto

**grep** es el comando para buscar patrones de texto dentro de archivos. La opción `-r` permite búsquedas recursivas en directorios.

## Sintaxis Básica
```bash
grep [opciones] patrón [archivos]
grep -r [opciones] patrón [directorio]
```

## Opciones Principales

### Búsqueda Recursiva
- `-r` — Buscar recursivamente en directorios
- `-R` — Como -r pero sigue enlaces simbólicos

### Resultados
- `-l` — Solo mostrar nombres de archivos (no contenido)
- `-L` — Archivos que NO contienen el patrón
- `-n` — Mostrar número de línea
- `-c` — Contar coincidencias por archivo

### Filtrado
- `-i` — Ignorar mayúsculas (case-insensitive)
- `-v` — Invertir (líneas que NO coinciden)
- `-w` — Palabra completa

## Combinaciones Útiles
```bash
grep -rn "TODO" /home/student/proyecto
grep -rl "ERROR" /var/log
grep -ri "password" /etc
grep -rn "def " *.py
```

## Diferencia: grep vs grep -r

- `grep "texto" archivo.txt` — Busca en un archivo
- `grep -r "texto" /directorio` — Busca en todos los archivos del directorio recursivamente""",
            "goal_description": "Usa grep -r para buscar texto en múltiples archivos y captura los resultados.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "files": [
                    {"path": "/home/student/proyecto/main.py", "content": "# TODO: fix this\nprint('hello')\n# TODO: add validation"},
                    {"path": "/home/student/proyecto/utils.py", "content": "def helper():\n    # ERROR: not implemented\n    pass"},
                    {"path": "/home/student/proyecto/config.txt", "content": "host=localhost\nport=8080"}
                ],
                "directories": [
                    "/home/student/proyecto"
                ]
            }),
            "step_by_step_guide": """1. Navega a /home/student
2. Usa grep -r para buscar todas las líneas que contienen 'TODO' en /home/student/proyecto
3. Guarda los resultados (incluir nombre del archivo y número de línea) en /home/student/todos.txt
4. Verifica que el archivo contiene 'TODO'""",
            "xp_reward": 150,
            "order_index": 3,
            "time_limit": 30,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Crear archivo de TODOs",
                    "description": "El archivo /home/student/todos.txt debe existir",
                    "v_type": "file_created",
                    "v_value": "/home/student/todos.txt",
                    "hints": ["Usa: grep -rn 'TODO' /home/student/proyecto", "Redirige a un archivo con >"]
                },
                {
                    "title": "Verificar contenido de TODOs",
                    "description": "El archivo debe contener 'TODO'",
                    "v_type": "file_content_flag",
                    "v_value": "TODO",
                    "v_extra": "/home/student/todos.txt",
                    "hints": ["Asegúrate de capturar las líneas que contienen TODO"]
                }
            ]
        },
        {
            "title": "which y whereis",
            "description": """# which y whereis: Localizando Comandos

Cuando escribes un comando en la terminal, ¿de dónde viene? Estas herramientas te lo dicen.

## which: Localizar en PATH

Busca un comando en la variable de entorno PATH (rutas donde el sistema busca ejecutables).

```bash
which ls
which python3
which bash
```

Salida típica:
```
/bin/ls
/usr/bin/python3
/bin/bash
```

## whereis: Información Completa

Busca el binario, código fuente y página de manual de un comando.

```bash
whereis ls
whereis grep
whereis systemctl
```

Salida típica:
```
ls: /bin/ls /usr/share/man/man1/ls.1.gz
grep: /bin/grep /usr/share/man/man1/grep.1.gz
```

## type: Información del Tipo

Te dice si es un comando externo, función shell integrada, o alias.

```bash
type ls
type echo
type cd
```

## command -v: Alternativa

```bash
command -v ls
command -v python3
```

## Casos de Uso
- Verificar si un programa está instalado
- Encontrar la versión que se ejecuta (si hay múltiples)
- Diagnóstico cuando un comando no funciona""",
            "goal_description": "Aprende a usar which y whereis para localizar comandos en el sistema.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "directories": [
                    "/home/student/info_comandos"
                ]
            }),
            "step_by_step_guide": """1. Usa which para localizar los siguientes comandos: ls, grep, python3, bash
2. Usa whereis para obtener información completa de al menos 3 comandos
3. Guarda los resultados en /home/student/info_comandos/comandos_info.txt
4. Incluye tanto which como whereis para cada comando""",
            "xp_reward": 100,
            "order_index": 4,
            "time_limit": 20,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Información de comandos guardada",
                    "description": "El archivo /home/student/info_comandos/comandos_info.txt debe existir",
                    "v_type": "file_created",
                    "v_value": "/home/student/info_comandos/comandos_info.txt",
                    "hints": ["Usa: which ls grep python3 bash", "Usa: whereis ls grep bash"]
                }
            ]
        },
        {
            "title": "locate y updatedb",
            "description": """# locate y updatedb: Búsqueda Rápida

**locate** es una alternativa a find que es mucho más rápida porque usa una base de datos precompilada.

## Características

### locate
```bash
locate patrón
locate -c patrón
locate -i patrón
```

- Búsqueda por patrón (no necesita ruta exacta)
- Mucho más rápido que find (usa base de datos)
- Busca en nombres de archivo completos

### updatedb
```bash
updatedb
sudo updatedb
```

- Actualiza la base de datos de locate
- Normalmente se ejecuta diariamente por cron
- Necesita permisos de root para acceso a todos los archivos

### Diferencias con find

| Aspecto | locate | find |
|---------|--------|------|
| Velocidad | Muy rápida | Más lenta |
| Base de datos | Usa DB | Búsqueda en tiempo real |
| Información | Solo nombres | Múltiples criterios |
| Actualidad | Depende de updatedb | Siempre actual |

## Ejemplos
```bash
locate "*.log"
locate -i password
locate -c "*.pdf"
locate python | grep bin
```

## Instalación en Ubuntu
```bash
apt update
apt install mlocate
```

## Casos de Uso
- Buscar archivos rápidamente
- Localizar todos los archivos .conf del sistema
- Encontrar librerías""",
            "goal_description": "Comprende cómo locate y updatedb funcionan para búsquedas rápidas en el sistema.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "directories": [
                    "/home/student/busqueda"
                ]
            }),
            "step_by_step_guide": """1. Verifica si locate está instalado (which locate)
2. Si no está, instala mlocate: apt install mlocate
3. Ejecuta updatedb para actualizar la base de datos
4. Usa locate para buscar algún archivo conocido
5. Anota tu experiencia en /home/student/busqueda""",
            "xp_reward": 100,
            "order_index": 5,
            "time_limit": 20,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Directorio de búsqueda creado",
                    "description": "El directorio /home/student/busqueda debe existir",
                    "v_type": "directory_created",
                    "v_value": "/home/student/busqueda",
                    "hints": ["mkdir -p /home/student/busqueda"]
                }
            ]
        },
        {
            "title": "Búsqueda Avanzada Combinando Herramientas",
            "description": """# Búsqueda Avanzada: Combinando Herramientas

Los administradores de sistemas profesionales combinan múltiples herramientas para resolver problemas complejos.

## find + grep: Buscar Texto en Archivos Encontrados

```bash
find /var/log -name "*.log" -exec grep "ERROR" {} +
find . -type f -name "*.py" | xargs grep "def "
```

## Pipes y Procesamiento

```bash
find /home -type f -mtime -7 | xargs ls -lh
find . -name "*.bak" -exec ls -lh {} \;
```

## find + awk: Procesamiento Avanzado

```bash
find /var/log -name "*.log" -exec awk '/ERROR/ {print FILENAME":"NR":"$0}' {} \;
```

## Casos Reales de Administrador

### Encontrar Archivos Grandes Viejos
```bash
find /var -type f -size +100M -mtime +30
```

### Buscar Configuraciones con Parámetro
```bash
find /etc -name "*.conf" -exec grep -l "debug" {} \;
```

### Archivos Modificados Recientemente con Texto
```bash
find /home -mtime -1 -type f -exec grep -l "password" {} \;
```

### Logs con Errores en Últimas 24h
```bash
find /var/log -mtime 0 -type f -exec grep -c "ERROR" {} \;
```

## xargs: Alternativa a -exec

```bash
find . -name "*.tmp" | xargs rm
find /home -name "*.log" | xargs wc -l
find . -type f | xargs chmod 644
```

Ventajas de xargs:
- Más eficiente (batch processing)
- Más flexible (encadenar múltiples comandos)
- Mejor compatibilidad""",
            "goal_description": "Domina técnicas avanzadas combinando find, grep, pipes y otros comandos para tareas de administración real.",
            "difficulty": "medium",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "files": [
                    {"path": "/home/student/sistema/logs/app.log", "content": "ERROR: conexion fallida\nINFO: usuario activo\nERROR: timeout"},
                    {"path": "/home/student/sistema/logs/web.log", "content": "ERROR: 404 not found\nINFO: request ok"},
                    {"path": "/home/student/sistema/config/app.conf", "content": "debug=true\nport=8080"},
                    {"path": "/home/student/sistema/scripts/deploy.sh", "content": "#!/bin/bash\necho deploy"}
                ],
                "directories": [
                    "/home/student/sistema",
                    "/home/student/sistema/logs",
                    "/home/student/sistema/config",
                    "/home/student/sistema/scripts"
                ]
            }),
            "step_by_step_guide": """1. Navega a /home/student/sistema
2. Usa find para localizar todos los archivos .log en /home/student/sistema
3. Combina find con grep para buscar líneas que contienen 'ERROR' en los .log
4. Guarda los resultados en /home/student/logs_encontrados.txt
5. El archivo debe contener el nombre del archivo y la línea con ERROR""",
            "xp_reward": 200,
            "order_index": 6,
            "time_limit": 40,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Archivo de logs encontrados",
                    "description": "El archivo /home/student/logs_encontrados.txt debe existir",
                    "v_type": "file_created",
                    "v_value": "/home/student/logs_encontrados.txt",
                    "hints": ["Usa: find /home/student/sistema -name '*.log' -exec grep 'ERROR' {} +"]
                },
                {
                    "title": "Verificar logs de ERROR",
                    "description": "El archivo debe contener '.log'",
                    "v_type": "file_content_flag",
                    "v_value": ".log",
                    "v_extra": "/home/student/logs_encontrados.txt",
                    "hints": ["Asegúrate de incluir la ruta del archivo .log en los resultados"]
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
            difficulty=l_data.get("difficulty", "easy"),
            category="Linux",
            scenario_setup=l_data.get("scenario_setup"),
            step_by_step_guide=l_data["step_by_step_guide"],
            is_active=True,
            xp_reward=l_data.get("xp_reward", 150),
            order_index=l_data.get("order_index", 1),
            time_limit=l_data.get("time_limit", 30),
            docker_image="ubuntu:22.04"
        )
        db.add(lab)
        db.commit()
        db.refresh(lab)

        for idx, c_data in enumerate(l_data.get("challenges", [])):
            existing_c = db.query(Challenge).filter(Challenge.lab_id == lab.id, Challenge.title == c_data["title"]).first()
            if not existing_c:
                challenge = Challenge(
                    id=f"term_{lab.id}_c{idx}",
                    lab_id=lab.id,
                    title=c_data["title"],
                    description=c_data.get("description", ""),
                    validation_type=c_data["v_type"],
                    validation_value=c_data["v_value"],
                    validation_extra=c_data.get("v_extra"),
                    order_index=idx,
                    xp=25,
                    hints=c_data.get("hints")
                )
                db.add(challenge)
        db.commit()

    print(f"✅ Terminal Skills - M3 Búsqueda en el Sistema seeded OK")
    db.close()

if __name__ == "__main__":
    seed()
