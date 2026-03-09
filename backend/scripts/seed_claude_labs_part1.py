"""
Claude Labs — Seed Script (Part 1 of 3)
Módulo 1: Navegación y Exploración (Labs 1-10)
Módulo 2: Gestión de Archivos y Directorios (Labs 11-20)
"""
import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(env_path)

from database import SessionLocal, Lab, Challenge, SkillPath, Module, create_tables

# ─────────────────────────────────────────────
# MÓDULO 1 — Navegación y Exploración (10 labs)
# ─────────────────────────────────────────────
M1_LABS = [
    {
        "order_index": 1,
        "title": "Primer Contacto: ls y pwd",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 100,
        "time_limit": 15,
        "description": """## Teoría: La Terminal de Linux

La **terminal** (también llamada shell o CLI) es la interfaz de texto que permite comunicarte directamente con el sistema operativo mediante comandos escritos.

### ¿Por qué usar la terminal?
- Velocidad y precisión para tareas repetitivas
- Automatización de procesos
- Administración remota de servidores
- Control total del sistema

### Comandos esenciales de este lab

**`pwd`** — Print Working Directory
Muestra la ruta completa del directorio donde te encuentras actualmente.
```
$ pwd
/home/student
```

**`ls`** — List
Lista los archivos y directorios del directorio actual.
```
$ ls
README.txt  documentos  proyectos
```

**`ls -l`** — Listado largo
Muestra permisos, propietario, tamaño y fecha de modificación.

**`ls -a`** — Mostrar ocultos
Incluye los archivos que empiezan por punto (ocultos).

**`ls -la`** — Combinación completa
Listado largo incluyendo archivos ocultos.

### Estructura del listado largo
```
drwxr-xr-x  2 student student 4096 Jan 10 10:00 documentos
-rw-r--r--  1 student student  128 Jan 10 10:00 README.txt
│           │ │       │        │   │             └─ nombre
│           │ │       │        │   └─ fecha modificación
│           │ │       │        └─ tamaño en bytes
│           │ │       └─ grupo
│           │ └─ propietario
│           └─ número de enlaces
└─ tipo+permisos (d=dir, -=fichero, l=enlace)
```

### Guía Paso a Paso
1. Ejecuta `pwd` → verás `/home/student`
2. Ejecuta `ls` → verás los archivos del directorio
3. Ejecuta `ls -la` → verás también los archivos ocultos
4. Anota los nombres de los archivos que encuentres""",
        "goal_description": "Aprender los dos comandos más básicos de la terminal: saber dónde estás (pwd) y qué hay a tu alrededor (ls).",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/README.txt", "content": "Bienvenido a Claude Labs.\nEste es tu primer laboratorio de Linux.\nExplora el sistema con ls y pwd."},
                {"path": "/home/student/.config_oculto", "content": "Este archivo está oculto"},
                {"path": "/home/student/notas.txt", "content": "Notas del sistema: version=1.0"}
            ],
            "directories": ["/home/student/documentos", "/home/student/proyectos"]
        }),
        "validation_command": "ls /home/student | sort | tr '\\n' ','",
        "expected_result": "README.txt,documentos,notas.txt,proyectos,",
        "challenges": [
            {
                "id": "CL1_C1",
                "title": "¿Dónde estoy?",
                "description": "Ejecuta el comando pwd y escribe exactamente la ruta que aparece.",
                "v_type": "path_exact",
                "v_value": "/home/student",
                "v_extra": "",
                "order_index": 1,
                "xp": 30,
                "hints": "El comando es pwd (print working directory)|La ruta empezará por /home/"
            },
            {
                "id": "CL1_C2",
                "title": "Lista el directorio actual",
                "description": "Ejecuta ls y escribe todos los elementos visibles (sin archivos ocultos) separados por comas.",
                "v_type": "directory_listing_exact",
                "v_value": "README.txt,documentos,notas.txt,proyectos",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 40,
                "hints": "Usa ls sin parámetros|Los archivos ocultos empiezan por punto y NO deben incluirse"
            }
        ]
    },
    {
        "order_index": 2,
        "title": "Navegación: cd y la Jerarquía del Sistema",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 110,
        "time_limit": 20,
        "description": """## Teoría: Moverse por el Sistema de Archivos

### El comando `cd` — Change Directory
Permite navegar entre directorios del sistema.

```bash
cd /ruta/absoluta    # Ruta absoluta (desde raíz /)
cd nombre_dir        # Ruta relativa (desde directorio actual)
cd ..                # Subir un nivel
cd ../..             # Subir dos niveles
cd ~                 # Ir al directorio home del usuario
cd -                 # Volver al directorio anterior
```

### La Jerarquía FHS (Filesystem Hierarchy Standard)
Linux organiza sus archivos en una estructura de árbol que empieza en `/` (raíz):

```
/
├── bin/      → Comandos esenciales del sistema (ls, cp, mv...)
├── etc/      → Ficheros de configuración del sistema
├── home/     → Directorios personales de los usuarios
│   └── student/
├── tmp/      → Archivos temporales (se borran al reiniciar)
├── usr/      → Programas y datos de usuario
│   ├── bin/  → Comandos de usuario (python3, git...)
│   └── lib/  → Librerías
├── var/      → Datos variables (logs, bases de datos...)
│   └── log/  → Logs del sistema
└── proc/     → Sistema de archivos virtual (info del kernel)
```

### Rutas absolutas vs relativas
- **Absoluta**: empieza con `/` → `/home/student/documentos`
- **Relativa**: parte del directorio actual → `documentos/config`

### Guía Paso a Paso
1. Ejecuta `pwd` → estás en `/home/student`
2. Ejecuta `cd /etc` → navega a /etc
3. Ejecuta `ls` → explora los archivos de configuración
4. Ejecuta `cd ~` → vuelve a tu home
5. Ejecuta `cd documentos` → entra en el subdirectorio
6. Ejecuta `cd ..` → vuelve un nivel""",
        "goal_description": "Dominar la navegación entre directorios usando cd y comprender la estructura de árbol del sistema de archivos Linux.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "directories": [
                "/home/student/documentos",
                "/home/student/documentos/privado",
                "/home/student/proyectos/web",
                "/home/student/proyectos/scripts"
            ],
            "files": [
                {"path": "/home/student/documentos/manual.txt", "content": "Manual de usuario"},
                {"path": "/home/student/proyectos/web/index.html", "content": "<html></html>"}
            ]
        }),
        "validation_command": "ls /home/student/proyectos | sort | tr '\\n' ','",
        "expected_result": "scripts,web,",
        "challenges": [
            {
                "id": "CL2_C1",
                "title": "Explora /etc",
                "description": "Navega a /etc con cd y luego ejecuta pwd. Escribe la ruta que te muestra.",
                "v_type": "path_exact",
                "v_value": "/etc",
                "v_extra": "",
                "order_index": 1,
                "xp": 25,
                "hints": "Usa: cd /etc|Luego verifica con pwd"
            },
            {
                "id": "CL2_C2",
                "title": "Entra en el subdirectorio proyectos/web",
                "description": "Desde tu home (/home/student), navega hasta proyectos/web y confirma tu ubicación.",
                "v_type": "path_exact",
                "v_value": "/home/student/proyectos/web",
                "v_extra": "",
                "order_index": 2,
                "xp": 35,
                "hints": "Puedes usar: cd proyectos/web|O en dos pasos: cd proyectos, luego cd web"
            },
            {
                "id": "CL2_C3",
                "title": "Vuelve al home con un solo comando",
                "description": "Desde cualquier lugar del sistema, vuelve a /home/student usando el atajo de una sola letra.",
                "v_type": "path_exact",
                "v_value": "/home/student",
                "v_extra": "",
                "order_index": 3,
                "xp": 20,
                "hints": "El atajo ~ representa el directorio home|Prueba: cd ~"
            }
        ]
    },
    {
        "order_index": 3,
        "title": "Tipos de Archivos: el comando file",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 120,
        "time_limit": 20,
        "description": """## Teoría: Tipos de Archivos en Linux

En Linux, **la extensión de un archivo no determina su tipo real**. El sistema usa la firma interna del archivo (magic bytes) para identificarlo.

### El comando `file`
Detecta el tipo real de cualquier archivo:
```bash
file archivo.txt        # ASCII text
file imagen.jpg         # JPEG image data
file script.sh          # Bourne-Again shell script
file /bin/ls            # ELF 64-bit LSB executable
file directorio/        # directory
```

### Tipos en el listado `ls -la`
El primer carácter de los permisos indica el tipo:
```
-  → archivo regular
d  → directorio
l  → enlace simbólico (symlink)
c  → dispositivo de caracteres
b  → dispositivo de bloques
p  → pipe (tubería con nombre)
s  → socket
```

### Archivos ocultos
En Linux, cualquier archivo cuyo nombre empiece con `.` está oculto:
```bash
ls -a     # Muestra también archivos ocultos
ls -la    # Muestra ocultos con detalles
```
Ejemplos comunes: `.bashrc`, `.profile`, `.ssh/`

### Comando `stat`
Proporciona información detallada de un archivo:
```bash
stat archivo.txt
# Muestra: tamaño, permisos en octal, fechas de acceso/modificación
```

### Guía Paso a Paso
1. Ejecuta `ls -la` → observa el primer carácter de cada entrada
2. Ejecuta `file README.txt` → identifica su tipo
3. Ejecuta `file /bin/ls` → verás que es un ejecutable ELF
4. Ejecuta `ls -a` → localiza los archivos ocultos""",
        "goal_description": "Aprender a identificar el tipo real de archivos en Linux usando el comando file y los indicadores del listado ls.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/datos.csv", "content": "nombre,edad,ciudad\nAna,25,Madrid\nLuis,30,Barcelona"},
                {"path": "/home/student/script.sh", "content": "#!/bin/bash\necho 'Hola Linux'"},
                {"path": "/home/student/.secreto", "content": "FLAG=CL3_OCULTO"},
                {"path": "/home/student/README.txt", "content": "Laboratorio de tipos de archivos"}
            ],
            "directories": ["/home/student/backups"],
            "commands": ["chmod +x /home/student/script.sh"]
        }),
        "validation_command": "ls -a /home/student | grep '^\\.secreto$'",
        "expected_result": ".secreto",
        "challenges": [
            {
                "id": "CL3_C1",
                "title": "Identifica el archivo ejecutable",
                "description": "Usa el comando file para inspeccionar script.sh. ¿Contiene 'shell script' en la salida? Responde con el nombre del archivo ejecutable.",
                "v_type": "file_exists_in_directory",
                "v_value": "script.sh",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 30,
                "hints": "Usa: file script.sh|Los scripts de bash contienen la cadena 'shell script'"
            },
            {
                "id": "CL3_C2",
                "title": "Encuentra el archivo oculto",
                "description": "Hay un archivo oculto en /home/student. Usa ls -a para encontrarlo y escribe su nombre completo (con el punto).",
                "v_type": "file_exists_in_directory",
                "v_value": ".secreto",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 40,
                "hints": "Los archivos ocultos empiezan con punto|Usa: ls -a"
            }
        ]
    },
    {
        "order_index": 4,
        "title": "Búsqueda de Archivos con find",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 140,
        "time_limit": 25,
        "description": """## Teoría: El comando find

`find` es una de las herramientas más potentes de Linux para buscar archivos y directorios en tiempo real dentro del sistema de archivos.

### Sintaxis básica
```bash
find [ruta] [criterios] [acción]
```

### Búsqueda por nombre
```bash
find /home/student -name "*.txt"       # Todos los .txt
find /home/student -name "README*"     # Empieza por README
find /home/student -iname "*.TXT"      # Sin distinción mayús/minús
```

### Búsqueda por tipo
```bash
find /home -type f    # Solo archivos regulares
find /home -type d    # Solo directorios
find /home -type l    # Solo enlaces simbólicos
```

### Búsqueda por tamaño
```bash
find / -size +10M     # Archivos mayores de 10 MB
find / -size -1k      # Archivos menores de 1 KB
find / -size 100c     # Exactamente 100 bytes
```

### Búsqueda por permisos
```bash
find / -perm 777      # Permisos exactos 777
find / -perm /4000    # Con SUID activado
```

### Búsqueda por tiempo
```bash
find / -mmin -60      # Modificados en los últimos 60 minutos
find / -mtime -1      # Modificados en las últimas 24 horas
```

### Combinando criterios
```bash
find /home -name "*.log" -type f -size +1k
find /etc -name "*.conf" -type f
```

### ⚠️ Sin Internet
Este lab funciona completamente offline. find busca en el sistema local sin necesidad de red.

### Guía Paso a Paso
1. Ejecuta `find /home/student -name "*.txt"` → localiza todos los txt
2. Ejecuta `find /home/student -type d` → lista todos los directorios
3. Ejecuta `find /home/student -name "clave*"` → busca archivos de clave
4. Combina criterios: `find /home/student -name "*.log" -type f`""",
        "goal_description": "Dominar el comando find para localizar archivos y directorios usando múltiples criterios de búsqueda sin necesidad de internet.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "directories": [
                "/home/student/logs",
                "/home/student/configs",
                "/home/student/datos/privado"
            ],
            "files": [
                {"path": "/home/student/logs/sistema.log", "content": "2024-01-10 ERROR: disco lleno\n2024-01-10 INFO: reinicio ok"},
                {"path": "/home/student/logs/acceso.log", "content": "192.168.1.1 GET /index.html 200"},
                {"path": "/home/student/configs/app.conf", "content": "host=localhost\nport=8080"},
                {"path": "/home/student/datos/privado/clave_secreta.txt", "content": "mi_password_super_seguro"},
                {"path": "/home/student/datos/notas.txt", "content": "Recordatorio: cambiar contraseña"}
            ]
        }),
        "validation_command": "find /home/student -name '*.log' -type f | wc -l",
        "expected_result": "2",
        "challenges": [
            {
                "id": "CL4_C1",
                "title": "Encuentra todos los archivos .log",
                "description": "Usa find para buscar todos los archivos con extensión .log bajo /home/student. ¿Cuántos hay?",
                "v_type": "file_exists_in_directory",
                "v_value": "sistema.log",
                "v_extra": "/home/student/logs",
                "order_index": 1,
                "xp": 35,
                "hints": "Usa: find /home/student -name '*.log'|El asterisco es un comodín"
            },
            {
                "id": "CL4_C2",
                "title": "Localiza el archivo de clave",
                "description": "Hay un archivo llamado 'clave_secreta.txt' en algún lugar de /home/student. Encuéntralo con find.",
                "v_type": "file_exists_in_directory",
                "v_value": "clave_secreta.txt",
                "v_extra": "/home/student/datos/privado",
                "order_index": 2,
                "xp": 45,
                "hints": "Usa: find /home/student -name 'clave_secreta.txt'|También puedes buscar con comodín: find /home/student -name 'clave*'"
            }
        ]
    },
    {
        "order_index": 5,
        "title": "Comodines y Patrones Glob",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 130,
        "time_limit": 20,
        "description": """## Teoría: Comodines (Wildcards) en Linux

Los comodines son caracteres especiales que el shell expande antes de ejecutar el comando, permitiendo referirse a múltiples archivos con un solo patrón.

### Los comodines principales

**`*`** — Cualquier cadena de caracteres (incluso vacía)
```bash
ls *.txt          # Todos los archivos .txt
ls datos*         # Todos los que empiezan por "datos"
ls *config*       # Todos los que contienen "config"
```

**`?`** — Exactamente UN carácter cualquiera
```bash
ls archivo?.txt   # archivo1.txt, archivoa.txt, etc.
ls log-??-2024    # log-01-2024, log-12-2024, etc.
```

**`[abc]`** — Exactamente uno de los caracteres listados
```bash
ls archivo[123].txt   # archivo1.txt, archivo2.txt, archivo3.txt
ls [aeiou]*           # Empieza por vocal
```

**`[a-z]`** — Rango de caracteres
```bash
ls [a-f]*.conf    # Empieza por letra a-f
ls log[0-9]*      # log seguido de dígito
```

**`{opcion1,opcion2}`** — Expansión de llaves (brace expansion)
```bash
ls archivo{1,2,3}.txt   # archivo1.txt, archivo2.txt, archivo3.txt
mkdir {src,tests,docs}   # Crea 3 directorios a la vez
touch nota_{lunes,martes,miercoles}.txt
```

### Combinando comodines
```bash
ls [0-9][0-9]_*.log    # Empieza por 2 dígitos, guion, cualquier cosa, .log
find /home -name "[A-Z]*.sh"  # Scripts que empiezan por mayúscula
```

### Guía Paso a Paso
1. Ejecuta `ls *.txt` → lista todos los archivos de texto
2. Ejecuta `ls log-*` → lista todos los logs
3. Ejecuta `ls archivo?.conf` → usa el comodín ?
4. Prueba brace expansion: `echo {rojo,verde,azul}`""",
        "goal_description": "Dominar el uso de comodines glob (*, ?, [], {}) para seleccionar y manipular múltiples archivos con patrones.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/informe_enero.txt", "content": "Informe de enero"},
                {"path": "/home/student/informe_febrero.txt", "content": "Informe de febrero"},
                {"path": "/home/student/informe_marzo.txt", "content": "Informe de marzo"},
                {"path": "/home/student/log-01-2024.log", "content": "Log enero 2024"},
                {"path": "/home/student/log-02-2024.log", "content": "Log febrero 2024"},
                {"path": "/home/student/config_red.conf", "content": "ip=192.168.1.1"},
                {"path": "/home/student/config_disco.conf", "content": "mount=/dev/sda1"},
                {"path": "/home/student/script1.sh", "content": "#!/bin/bash\necho 1"},
                {"path": "/home/student/script2.sh", "content": "#!/bin/bash\necho 2"},
                {"path": "/home/student/datos.csv", "content": "a,b,c"}
            ]
        }),
        "validation_command": "ls /home/student/informe_*.txt | wc -l",
        "expected_result": "3",
        "challenges": [
            {
                "id": "CL5_C1",
                "title": "Lista todos los informes",
                "description": "Usa un comodín para listar solo los archivos que empiezan por 'informe_'. ¿Cuántos son?",
                "v_type": "file_exists_in_directory",
                "v_value": "informe_enero.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 30,
                "hints": "Usa: ls informe_*|El asterisco * sustituye cualquier cadena"
            },
            {
                "id": "CL5_C2",
                "title": "Encuentra archivos con patrón log-??-2024",
                "description": "Usa el comodín ? para listar archivos con el patrón log-[2 dígitos]-2024.log",
                "v_type": "file_exists_in_directory",
                "v_value": "log-01-2024.log",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 40,
                "hints": "El comodín ? representa exactamente 1 carácter|Prueba: ls log-??-2024.log"
            }
        ]
    },
    {
        "order_index": 6,
        "title": "Manual de Ayuda: man, help y apropos",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 110,
        "time_limit": 15,
        "description": """## Teoría: Obtener Ayuda en Linux

Un buen administrador de sistemas sabe dónde buscar ayuda. Linux tiene múltiples sistemas de documentación integrados.

### `man` — Manual Pages
El manual del sistema es la fuente de información más completa:
```bash
man ls          # Manual del comando ls
man chmod       # Manual de chmod
man 5 passwd    # Sección 5: formato del archivo /etc/passwd
```

**Secciones del manual:**
1. Comandos de usuario
2. Llamadas al sistema
3. Funciones de librería
4. Archivos especiales
5. Formatos de archivo
6. Juegos
7. Miscelánea
8. Comandos de administración

**Navegación en man:**
- `Space` → siguiente página
- `b` → página anterior
- `/texto` → buscar texto
- `q` → salir

### `--help` — Ayuda rápida
Casi todos los comandos aceptan `--help` o `-h`:
```bash
ls --help
cp --help
find --help
```

### `apropos` — Buscar en los manuales
Cuando no recuerdas el nombre exacto del comando:
```bash
apropos "disk space"     # Busca comandos relacionados
apropos copy             # Busca todos los relacionados con copy
apropos "list files"     # Busca por descripción
```

### `whatis` — Descripción breve
```bash
whatis ls        # ls (1) - list directory contents
whatis chmod     # chmod (1) - change file mode bits
```

### `type` — Tipo de comando
```bash
type ls         # ls is aliased to 'ls --color=auto'
type cd         # cd is a shell builtin
type python3    # python3 is /usr/bin/python3
```

### Guía Paso a Paso
1. Ejecuta `man ls` y busca la opción `-h` pulsando `/` y escribiendo `-h`
2. Ejecuta `ls --help | head -20` para ver ayuda rápida
3. Ejecuta `whatis cp` para ver la descripción breve
4. Ejecuta `type cd` para ver si cd es interno del shell""",
        "goal_description": "Aprender a obtener ayuda de cualquier comando usando man, --help, apropos y whatis para ser autosuficiente en la terminal.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/README.txt", "content": "Practica man, help y apropos en este laboratorio.\nNingún sysadmin memoriza todos los comandos: saben donde buscar."}
            ]
        }),
        "validation_command": "whatis pwd | grep -c 'pwd'",
        "expected_result": "1",
        "challenges": [
            {
                "id": "CL6_C1",
                "title": "Consulta el manual de ls",
                "description": "Abre el manual de ls con man. ¿Cuál es la opción para mostrar el tamaño en formato legible (human-readable)? Responde solo la letra de la opción (ejemplo: -X).",
                "v_type": "file_exists_in_directory",
                "v_value": "README.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 30,
                "hints": "Usa: man ls|Busca 'human' pulsando / y escribiendo human, luego Enter"
            },
            {
                "id": "CL6_C2",
                "title": "Describe brevemente el comando cp",
                "description": "Usa whatis para ver la descripción del comando cp. Ejecuta el comando y observa el resultado.",
                "v_type": "file_exists_in_directory",
                "v_value": "README.txt",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 25,
                "hints": "Usa: whatis cp|La descripción aparece en una sola línea"
            }
        ]
    },
    {
        "order_index": 7,
        "title": "Variables de Entorno",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 130,
        "time_limit": 20,
        "description": """## Teoría: Variables de Entorno en Linux

Las variables de entorno son pares clave=valor que configuran el comportamiento del sistema y los programas.

### Ver variables de entorno
```bash
env             # Muestra TODAS las variables del entorno
printenv        # Similar a env
printenv HOME   # Muestra solo la variable HOME
echo $HOME      # Muestra el valor de HOME
echo $PATH      # Muestra el PATH del sistema
echo $USER      # Tu nombre de usuario
echo $SHELL     # Tu shell actual
```

### Variables importantes
| Variable | Descripción |
|----------|-------------|
| `HOME`   | Directorio home del usuario |
| `PATH`   | Directorios donde buscar ejecutables |
| `USER`   | Nombre del usuario actual |
| `SHELL`  | Shell en uso (/bin/bash) |
| `PWD`    | Directorio actual |
| `OLDPWD` | Directorio anterior |
| `LANG`   | Idioma del sistema |
| `TERM`   | Tipo de terminal |

### Crear y exportar variables
```bash
MI_VAR="hola mundo"    # Variable local (solo en este shell)
echo $MI_VAR

export MI_VAR          # Exportar para que sea visible en subprocesos
export PROYECTO="tech4u"  # Crear y exportar en un paso
```

### Variables en el PATH
El PATH es una lista de directorios separados por `:`:
```bash
echo $PATH
# /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Añadir un directorio al PATH
export PATH=$PATH:/home/student/scripts
```

### Persistencia: .bashrc
Las variables definidas en la terminal se pierden al cerrar la sesión.
Para hacerlas permanentes, añádelas a `~/.bashrc`:
```bash
echo 'export MI_VAR="valor"' >> ~/.bashrc
source ~/.bashrc  # Recargar sin reiniciar
```

### Guía Paso a Paso
1. Ejecuta `echo $HOME` → verás tu directorio home
2. Ejecuta `echo $PATH` → verás los directorios del PATH
3. Ejecuta `export ACADEMIA="tech4u"` → crea una variable
4. Ejecuta `echo $ACADEMIA` → verifica que existe
5. Ejecuta `env | grep ACADEMIA` → búscala en el entorno""",
        "goal_description": "Comprender y manipular variables de entorno en Linux: visualizarlas, crearlas, exportarlas y entender las más importantes del sistema.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/.bashrc", "content": "# .bashrc\nexport LANG=es_ES.UTF-8\nexport EDITOR=nano\n# Añade tus variables personalizadas aquí"},
                {"path": "/home/student/info_sistema.txt", "content": "Consulta tus variables de entorno con: env, printenv, echo $NOMBRE_VARIABLE"}
            ]
        }),
        "validation_command": "echo $HOME",
        "expected_result": "/home/student",
        "challenges": [
            {
                "id": "CL7_C1",
                "title": "¿Quién soy?",
                "description": "Usa echo con la variable correcta para mostrar tu nombre de usuario. Escribe el comando exacto.",
                "v_type": "path_exact",
                "v_value": "/home/student",
                "v_extra": "",
                "order_index": 1,
                "xp": 25,
                "hints": "La variable de usuario es $USER|Usa: echo $USER"
            },
            {
                "id": "CL7_C2",
                "title": "Crea y verifica una variable propia",
                "description": "Crea una variable llamada ACADEMIA con el valor 'tech4u' y expórtala. Verifica con echo $ACADEMIA.",
                "v_type": "file_exists_in_directory",
                "v_value": ".bashrc",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 35,
                "hints": "Usa: export ACADEMIA='tech4u'|Luego verifica: echo $ACADEMIA"
            }
        ]
    },
    {
        "order_index": 8,
        "title": "Redirección de Entrada y Salida",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 150,
        "time_limit": 25,
        "description": """## Teoría: Redirección en Linux

En Linux, cada proceso tiene tres flujos de datos estándar:
- **stdin** (0): Entrada estándar (teclado)
- **stdout** (1): Salida estándar (pantalla)
- **stderr** (2): Salida de error (pantalla)

### Redirección de salida

**`>`** — Redirige stdout a un archivo (sobreescribe)
```bash
ls -la > listado.txt          # Guarda la salida en listado.txt
echo "hola" > saludo.txt      # Crea archivo con "hola"
```

**`>>`** — Redirige stdout a un archivo (añade al final)
```bash
echo "línea 1" > fichero.txt
echo "línea 2" >> fichero.txt  # Añade sin borrar
date >> fichero.txt
```

**`2>`** — Redirige stderr
```bash
ls /directorio_inexistente 2> errores.txt  # Guarda el error
```

**`2>&1`** — Redirige stderr a stdout
```bash
ls /no_existe > salida.txt 2>&1    # Guarda todo (stdout + stderr)
comando &> todo.txt                 # Shorthand moderno
```

### Redirección de entrada

**`<`** — Redirige stdin desde un archivo
```bash
sort < nombres.txt        # sort lee de nombres.txt en vez del teclado
wc -l < fichero.txt       # Cuenta líneas del fichero
```

### Pipes `|` — Tuberías
Encadena la salida de un comando como entrada del siguiente:
```bash
ls -la | grep ".txt"          # Filtra la salida de ls
cat /etc/passwd | sort        # Ordena el contenido
ps aux | grep bash            # Busca procesos bash
echo "hola mundo" | wc -w    # Cuenta palabras
```

### El sumidero `/dev/null`
Descarta cualquier salida:
```bash
comando_ruidoso > /dev/null        # Descarta stdout
comando_ruidoso 2> /dev/null       # Descarta stderr
comando_ruidoso &> /dev/null       # Descarta todo
```

### Guía Paso a Paso
1. Ejecuta `ls -la > mi_listado.txt` → redirige la salida
2. Ejecuta `cat mi_listado.txt` → verifica el contenido
3. Ejecuta `echo "nueva línea" >> mi_listado.txt` → añade
4. Ejecuta `ls /noexiste 2> errores.txt` → captura el error
5. Ejecuta `cat errores.txt` → verifica el mensaje de error""",
        "goal_description": "Dominar la redirección de entrada/salida (>, >>, 2>, 2>&1) y las tuberías (|) para controlar el flujo de datos entre comandos y archivos.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/nombres.txt", "content": "Carlos\nAna\nZara\nMiguel\nBeatriz\nÁlvaro"},
                {"path": "/home/student/numeros.txt", "content": "42\n7\n99\n13\n55\n1"}
            ]
        }),
        "validation_command": "test -f /home/student/mi_listado.txt && echo ok || echo missing",
        "expected_result": "ok",
        "challenges": [
            {
                "id": "CL8_C1",
                "title": "Guarda el listado en un archivo",
                "description": "Usa redirección para guardar la salida de 'ls -la' en un archivo llamado mi_listado.txt",
                "v_type": "file_created",
                "v_value": "mi_listado.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 40,
                "hints": "Usa: ls -la > mi_listado.txt|El operador > redirige stdout al archivo"
            },
            {
                "id": "CL8_C2",
                "title": "Ordena nombres con pipe",
                "description": "Usa un pipe para ordenar el contenido de nombres.txt y guarda el resultado en nombres_ordenados.txt",
                "v_type": "file_created",
                "v_value": "nombres_ordenados.txt",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 50,
                "hints": "Combina sort y redirección: sort nombres.txt > nombres_ordenados.txt|O con pipe: cat nombres.txt | sort > nombres_ordenados.txt"
            }
        ]
    },
    {
        "order_index": 9,
        "title": "Historial y Atajos de la Terminal",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 110,
        "time_limit": 15,
        "description": """## Teoría: Productividad en la Terminal

Conocer los atajos y el historial de la terminal multiplica tu velocidad de trabajo.

### Historial de comandos
```bash
history           # Muestra los últimos comandos ejecutados
history 20        # Muestra los últimos 20
!!                # Repite el último comando
!ls               # Repite el último comando que empezó por 'ls'
!42               # Ejecuta el comando número 42 del historial
```

### Búsqueda en el historial
- `Ctrl+R` → Búsqueda inversa interactiva (escribe y busca)
- `Ctrl+G` → Cancela la búsqueda

### Atajos de teclado esenciales
| Atajo | Función |
|-------|---------|
| `Ctrl+C` | Interrumpir proceso actual |
| `Ctrl+Z` | Suspender proceso (manda a background) |
| `Ctrl+D` | EOF / cerrar terminal |
| `Ctrl+L` | Limpiar pantalla (igual que `clear`) |
| `Ctrl+A` | Ir al inicio de la línea |
| `Ctrl+E` | Ir al final de la línea |
| `Ctrl+W` | Borrar palabra anterior |
| `Ctrl+U` | Borrar toda la línea |
| `Tab`   | Autocompletar nombre de archivo/comando |
| `Tab Tab` | Mostrar todas las opciones posibles |

### Autocompletado con Tab
El autocompletado es uno de los trucos más útiles:
```bash
cd Docu[Tab]    → cd Documentos/
ls /etc/pa[Tab] → ls /etc/passwd
```

### El archivo .bash_history
Los comandos se guardan en `~/.bash_history`:
```bash
cat ~/.bash_history | tail -20   # Últimos 20 del historial
```

### Guía Paso a Paso
1. Ejecuta varios comandos: `ls`, `pwd`, `echo hola`
2. Ejecuta `history` → verás el historial
3. Prueba `Ctrl+R` y escribe "ls" → buscará en el historial
4. Usa `Tab` para autocompletar: escribe `ls /hom` y pulsa Tab""",
        "goal_description": "Aprender los atajos de teclado y el sistema de historial de bash para trabajar de forma más eficiente y rápida en la terminal.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/productividad.txt", "content": "Los atajos de teclado son esenciales para trabajar rápido.\nPractica Ctrl+R, Tab y el historial en este lab."},
                {"path": "/home/student/atajos.txt", "content": "Ctrl+A → inicio de línea\nCtrl+E → fin de línea\nCtrl+W → borrar palabra\nCtrl+L → limpiar pantalla"}
            ]
        }),
        "validation_command": "cat /home/student/atajos.txt | wc -l",
        "expected_result": "4",
        "challenges": [
            {
                "id": "CL9_C1",
                "title": "Muestra el historial",
                "description": "Ejecuta el comando para ver el historial de comandos. ¿Cuántos comandos muestra por defecto?",
                "v_type": "file_exists_in_directory",
                "v_value": "atajos.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 20,
                "hints": "El comando es: history|Sin argumentos muestra hasta 1000 comandos"
            },
            {
                "id": "CL9_C2",
                "title": "Usa Tab para autocompletar",
                "description": "Usa el autocompletado para navegar a /home/student/. Escribe 'cd /hom' y pulsa Tab. ¿Qué completó?",
                "v_type": "path_exact",
                "v_value": "/home/student",
                "v_extra": "",
                "order_index": 2,
                "xp": 25,
                "hints": "Escribe 'cd /hom' y pulsa Tab|Si hay una sola opción, la completa sola"
            }
        ]
    },
    {
        "order_index": 10,
        "title": "Links: Simbólicos y Duros",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 160,
        "time_limit": 25,
        "description": """## Teoría: Enlaces en Linux

Linux permite crear referencias adicionales a archivos mediante dos tipos de enlaces.

### Hard Links (enlaces duros)
Un hard link es otro nombre para el mismo archivo (mismo inode):
```bash
ln archivo_original.txt enlace_duro.txt
```
- Ambos apuntan al mismo bloque de datos en disco
- Si borras el original, el enlace sigue funcionando
- Solo pueden enlazar archivos (no directorios)
- Solo funcionan en el mismo sistema de archivos
- El número de inode es idéntico: `ls -li`

### Symbolic Links (enlaces simbólicos / symlinks)
Un symlink es un puntero que apunta al nombre de otro archivo:
```bash
ln -s /ruta/al/original enlace_simbolico
ln -s /home/student/datos datos_link   # Enlace relativo
ln -s /etc/hosts mis_hosts             # Enlace a /etc/hosts
```
- Se muestra con `l` en `ls -la` y con `→` en la ruta
- Si borras el original, el symlink queda roto
- Pueden enlazar directorios
- Pueden cruzar sistemas de archivos
- `readlink enlace` → muestra a dónde apunta

### Verificar enlaces
```bash
ls -la     # Muestra el tipo (l) y destino del symlink
ls -li     # Muestra el número de inode
stat enlace.txt   # Información detallada
readlink enlace   # Destino del symlink
```

### Casos de uso reales
- `/var/log/syslog → /var/log/journal` (symlinks en logs)
- Versiones de software: `python3 → python3.11`
- Configuraciones: `~/.config/nvim → ~/dotfiles/nvim`

### Guía Paso a Paso
1. Crea un hard link: `ln original.txt copia_dura.txt`
2. Verifica con `ls -li` → mismos inodes
3. Crea un symlink: `ln -s /home/student/datos enlace_datos`
4. Verifica con `ls -la` → verás la flecha →
5. Ejecuta `readlink enlace_datos` → te muestra el destino""",
        "goal_description": "Entender y crear los dos tipos de enlaces en Linux (hard links y symlinks) y conocer sus diferencias, usos y comportamiento.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/original.txt", "content": "Este es el archivo original.\nContiene datos importantes."},
                {"path": "/home/student/config_sistema.conf", "content": "timeout=30\nmax_connections=100\nlog_level=info"}
            ],
            "directories": ["/home/student/enlaces"]
        }),
        "validation_command": "test -L /home/student/enlaces/config_link && echo ok || echo missing",
        "expected_result": "ok",
        "challenges": [
            {
                "id": "CL10_C1",
                "title": "Crea un symlink a config_sistema.conf",
                "description": "Crea un enlace simbólico llamado 'config_link' dentro del directorio 'enlaces/' que apunte a /home/student/config_sistema.conf",
                "v_type": "file_created",
                "v_value": "config_link",
                "v_extra": "/home/student/enlaces",
                "order_index": 1,
                "xp": 55,
                "hints": "Usa: ln -s /home/student/config_sistema.conf /home/student/enlaces/config_link|El flag -s crea un symlink"
            }
        ]
    }
]

# ─────────────────────────────────────────────────────────
# MÓDULO 2 — Gestión de Archivos y Directorios (10 labs)
# ─────────────────────────────────────────────────────────
M2_LABS = [
    {
        "order_index": 1,
        "title": "Crear Archivos y Directorios: touch y mkdir",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 110,
        "time_limit": 15,
        "description": """## Teoría: Creación de Archivos y Directorios

### `touch` — Crear archivos vacíos
```bash
touch fichero.txt           # Crea un archivo vacío
touch a.txt b.txt c.txt     # Crea varios a la vez
touch notas_{1,2,3}.txt     # Brace expansion: crea 3 archivos
```
Si el archivo ya existe, touch actualiza su timestamp de modificación.

### `mkdir` — Crear directorios
```bash
mkdir nuevo_dir             # Crea un directorio
mkdir dir1 dir2 dir3        # Crea varios a la vez
mkdir -p padre/hijo/nieto   # Crea toda la jerarquía de una vez
mkdir -p proyecto/{src,tests,docs,config}  # Estructura compleja
```

El flag `-p` (parents) es muy útil:
- Sin `-p`: falla si el directorio padre no existe
- Con `-p`: crea todos los directorios intermedios necesarios

### Crear estructura de proyecto
```bash
mkdir -p mi_proyecto/{src,tests,docs}
touch mi_proyecto/src/{main.py,utils.py}
touch mi_proyecto/docs/README.md
touch mi_proyecto/tests/test_main.py
```

### `tree` — Ver estructura en árbol (si está instalado)
```bash
tree mi_proyecto/
```

### Guía Paso a Paso
1. Ejecuta `mkdir mis_proyectos` → crea un directorio
2. Ejecuta `touch mis_proyectos/notas.txt` → crea archivo dentro
3. Ejecuta `mkdir -p proyecto_web/src/components` → jerarquía completa
4. Ejecuta `ls -R proyecto_web/` → ve la estructura recursiva""",
        "goal_description": "Dominar la creación de archivos con touch y directorios con mkdir, incluyendo la creación de jerarquías completas con mkdir -p.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/instrucciones.txt", "content": "Crea la estructura de directorios pedida en los retos.\nUsa mkdir -p para crear jerarquías."}
            ]
        }),
        "validation_command": "test -d /home/student/proyecto_web/src && echo ok || echo missing",
        "expected_result": "ok",
        "challenges": [
            {
                "id": "CL11_C1",
                "title": "Crea la estructura de un proyecto web",
                "description": "Crea el directorio 'proyecto_web' con subdirectorios 'src', 'css', 'js' y 'docs' usando un solo comando con mkdir.",
                "v_type": "directory_created",
                "v_value": "proyecto_web/src",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 35,
                "hints": "Usa brace expansion: mkdir -p proyecto_web/{src,css,js,docs}|El flag -p crea el padre si no existe"
            },
            {
                "id": "CL11_C2",
                "title": "Crea 3 archivos de configuración",
                "description": "Crea los archivos config_dev.txt, config_test.txt y config_prod.txt en /home/student usando un solo comando touch.",
                "v_type": "file_created",
                "v_value": "config_dev.txt",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 30,
                "hints": "Usa brace expansion: touch config_{dev,test,prod}.txt|Touch puede crear varios archivos en un solo comando"
            }
        ]
    },
    {
        "order_index": 2,
        "title": "Copiar y Mover: cp y mv",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 120,
        "time_limit": 20,
        "description": """## Teoría: Copiar y Mover Archivos

### `cp` — Copiar archivos y directorios
```bash
cp origen destino           # Copia un archivo
cp -v origen destino        # Copia con verbose (muestra lo que hace)
cp -i origen destino        # Pide confirmación si el destino existe
cp -r directorio/ copia/    # Copia directorio recursivamente
cp *.txt carpeta/           # Copia todos los .txt a carpeta/
cp -p archivo.txt copia/    # Preserva metadatos (permisos, fechas)
```

### `mv` — Mover y renombrar
```bash
mv archivo.txt nuevo_nombre.txt    # Renombra
mv archivo.txt /otra/ruta/         # Mueve a otro directorio
mv *.log /var/log/                 # Mueve todos los .log
mv -i origen destino               # Pide confirmación
mv -v origen destino               # Verbose
```

### Diferencia clave cp vs mv
- `cp`: el original PERMANECE, se crea una copia
- `mv`: el original DESAPARECE, se traslada (o renombra)

### Ejemplos prácticos
```bash
# Hacer backup antes de editar
cp configuracion.conf configuracion.conf.bak

# Mover archivos log al directorio correcto
mv *.log /var/log/

# Reorganizar proyecto
mkdir backup/
cp -r src/ backup/src_backup/

# Renombrar lote de archivos
mv informe_antiguo.txt informe_2024.txt
```

### Guía Paso a Paso
1. Ejecuta `cp datos.csv datos_backup.csv` → crea copia de seguridad
2. Ejecuta `ls` → verifica que AMBOS archivos existen
3. Ejecuta `mv datos_backup.csv backups/` → mueve al directorio
4. Ejecuta `mv notas.txt notas_actualizadas.txt` → renombra""",
        "goal_description": "Dominar los comandos cp y mv para copiar, mover y renombrar archivos y directorios de forma eficiente.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "directories": ["/home/student/backups", "/home/student/archivados"],
            "files": [
                {"path": "/home/student/datos.csv", "content": "id,nombre,valor\n1,alfa,100\n2,beta,200\n3,gamma,300"},
                {"path": "/home/student/config.conf", "content": "host=localhost\nport=8080\ndebug=false"},
                {"path": "/home/student/log_enero.log", "content": "[INFO] Sistema iniciado\n[WARN] Memoria al 80%"},
                {"path": "/home/student/log_febrero.log", "content": "[INFO] Backup completado\n[ERROR] Disco lleno"}
            ]
        }),
        "validation_command": "test -f /home/student/backups/config.conf.bak && echo ok || echo missing",
        "expected_result": "ok",
        "challenges": [
            {
                "id": "CL12_C1",
                "title": "Crea un backup de config.conf",
                "description": "Copia config.conf al directorio backups/ con el nombre config.conf.bak",
                "v_type": "file_created",
                "v_value": "config.conf.bak",
                "v_extra": "/home/student/backups",
                "order_index": 1,
                "xp": 35,
                "hints": "Usa: cp config.conf backups/config.conf.bak|El destino incluye el nuevo nombre"
            },
            {
                "id": "CL12_C2",
                "title": "Mueve los logs al directorio archivados",
                "description": "Mueve todos los archivos .log al directorio archivados/ con un solo comando.",
                "v_type": "file_created",
                "v_value": "log_enero.log",
                "v_extra": "/home/student/archivados",
                "order_index": 2,
                "xp": 40,
                "hints": "Usa comodín: mv *.log archivados/|mv puede trabajar con múltiples archivos"
            }
        ]
    },
    {
        "order_index": 3,
        "title": "Eliminar Archivos: rm y rmdir",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 120,
        "time_limit": 15,
        "description": """## Teoría: Eliminar Archivos y Directorios

### ⚠️ IMPORTANTE: En Linux no hay papelera desde la terminal
`rm` es permanente. Los archivos borrados no se recuperan fácilmente.

### `rm` — Eliminar archivos
```bash
rm fichero.txt              # Elimina un archivo
rm -i fichero.txt           # Pide confirmación (-i = interactive)
rm -v fichero.txt           # Muestra lo que hace (-v = verbose)
rm *.log                    # Elimina todos los .log
rm -f fichero.txt           # Fuerza el borrado sin confirmación
```

### `rmdir` — Eliminar directorios VACÍOS
```bash
rmdir directorio/           # Solo funciona si está vacío
rmdir -p padre/hijo/nieto   # Elimina jerarquía vacía
```

### `rm -r` — Eliminar directorios con contenido
```bash
rm -r directorio/           # Elimina directorio y TODO su contenido
rm -rf directorio/          # Fuerza la eliminación sin confirmación
```

### 🔴 El comando más peligroso: `rm -rf`
```bash
rm -rf /    # NUNCA ejecutes esto — borra TODO el sistema
rm -rf *    # Borra todo en el directorio actual
```

### Mejores prácticas
1. **Usa `-i` cuando no estés seguro**: `rm -ri carpeta/`
2. **Haz backups antes de borrar**: `cp -r datos/ datos_backup/`
3. **Verifica con ls primero**: `ls *.log` antes de `rm *.log`
4. **Instala trash-cli para tener papelera**: `trash fichero.txt`

### Guía Paso a Paso
1. Ejecuta `ls` → identifica los archivos temporales
2. Ejecuta `rm -i temporal.txt` → borra con confirmación
3. Ejecuta `rmdir directorio_vacio/` → borra directorio vacío
4. Ejecuta `rm -r directorio_con_contenido/` → borra todo""",
        "goal_description": "Aprender a eliminar archivos y directorios de forma segura usando rm y rmdir, entendiendo los riesgos y buenas prácticas.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "directories": [
                "/home/student/temporal",
                "/home/student/basura",
                "/home/student/basura/archivos_viejos"
            ],
            "files": [
                {"path": "/home/student/importante.txt", "content": "NO BORRAR este archivo"},
                {"path": "/home/student/temporal/cache1.tmp", "content": "cache temporal 1"},
                {"path": "/home/student/temporal/cache2.tmp", "content": "cache temporal 2"},
                {"path": "/home/student/borrar_esto.txt", "content": "Este archivo debe eliminarse"},
                {"path": "/home/student/basura/archivos_viejos/viejo1.bak", "content": "backup viejo"}
            ]
        }),
        "validation_command": "test ! -f /home/student/borrar_esto.txt && echo ok || echo missing",
        "expected_result": "ok",
        "challenges": [
            {
                "id": "CL13_C1",
                "title": "Elimina el archivo marcado para borrar",
                "description": "Elimina el archivo 'borrar_esto.txt' de /home/student. El archivo 'importante.txt' NO debe borrarse.",
                "v_type": "file_exists_in_directory",
                "v_value": "importante.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 25,
                "hints": "Usa: rm borrar_esto.txt|Verifica con ls que importante.txt sigue ahí"
            },
            {
                "id": "CL13_C2",
                "title": "Limpia el directorio temporal",
                "description": "Elimina el directorio 'temporal' y todo su contenido (archivos .tmp) con un solo comando.",
                "v_type": "directory_created",
                "v_value": "basura",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 40,
                "hints": "Usa: rm -r temporal/|El flag -r elimina directorios y su contenido"
            }
        ]
    },
    {
        "order_index": 4,
        "title": "Visualizar Archivos: cat, head, tail, less",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 130,
        "time_limit": 20,
        "description": """## Teoría: Ver el Contenido de Archivos

### `cat` — Mostrar contenido completo
```bash
cat fichero.txt             # Muestra todo el contenido
cat -n fichero.txt          # Muestra con números de línea
cat fichero1.txt fichero2.txt  # Concatena y muestra ambos
cat -A fichero.txt          # Muestra caracteres especiales (^M para CR)
```

### `head` — Primeras líneas
```bash
head fichero.txt            # Primeras 10 líneas (por defecto)
head -n 5 fichero.txt       # Primeras 5 líneas
head -20 fichero.txt        # Primeras 20 líneas
```

### `tail` — Últimas líneas
```bash
tail fichero.txt            # Últimas 10 líneas (por defecto)
tail -n 5 fichero.txt       # Últimas 5 líneas
tail -f /var/log/syslog     # SIGUE el archivo en tiempo real (follow)
tail -f fichero.log         # Monitorizar logs activos
```

### `less` — Paginador interactivo
```bash
less fichero.txt            # Abre el archivo paginado
```
Controles en less:
- `Espacio` → siguiente página
- `b` → página anterior
- `/texto` → buscar
- `n` → siguiente coincidencia
- `g` → ir al inicio
- `G` → ir al final
- `q` → salir

### `more` — Paginador básico (antiguo)
```bash
more fichero.txt            # Más simple que less
```

### Combinando con pipes
```bash
cat /etc/passwd | head -5       # Primeras 5 líneas de passwd
cat fichero.txt | tail -10      # Últimas 10 líneas
grep "error" log.txt | tail -5  # Últimos 5 errores
```

### Guía Paso a Paso
1. Ejecuta `cat sistema.log` → ve el log completo
2. Ejecuta `head -5 sistema.log` → primeras 5 líneas
3. Ejecuta `tail -5 sistema.log` → últimas 5 líneas
4. Ejecuta `wc -l sistema.log` → cuenta el total de líneas""",
        "goal_description": "Dominar los comandos cat, head, tail y less para visualizar el contenido de archivos de texto de diferentes tamaños.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/sistema.log", "content": "\n".join([
                    f"2024-01-{i:02d} {'ERROR' if i%5==0 else 'INFO'}: {'Disco lleno' if i%5==0 else f'Evento número {i} procesado correctamente'}"
                    for i in range(1, 31)
                ])},
                {"path": "/home/student/passwords.txt", "content": "# Hashes de prueba (no reales)\nadmin:$6$abc123\nuser1:$6$def456\nguest:$6$ghi789"},
                {"path": "/home/student/poema.txt", "content": "Línea 1: En el principio era la terminal\nLínea 2: Y la terminal era vacío\nLínea 3: Y el sysadmin dijo: ls\nLínea 4: Y vio que era bueno\nLínea 5: Y así comenzó el mundo UNIX"}
            ]
        }),
        "validation_command": "wc -l /home/student/sistema.log | awk '{print $1}'",
        "expected_result": "30",
        "challenges": [
            {
                "id": "CL14_C1",
                "title": "¿Cuántas líneas tiene sistema.log?",
                "description": "Usa wc -l para contar el número de líneas del archivo sistema.log. Escribe solo el número.",
                "v_type": "file_exists_in_directory",
                "v_value": "sistema.log",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 30,
                "hints": "Usa: wc -l sistema.log|wc = word count, -l cuenta líneas"
            },
            {
                "id": "CL14_C2",
                "title": "Muestra solo la última línea del log",
                "description": "Usa tail para mostrar únicamente la última línea de sistema.log.",
                "v_type": "file_exists_in_directory",
                "v_value": "sistema.log",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 30,
                "hints": "Usa: tail -n 1 sistema.log|El flag -n 1 indica solo 1 línea"
            }
        ]
    },
    {
        "order_index": 5,
        "title": "Editor Nano: Edición de Archivos",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 130,
        "time_limit": 20,
        "description": """## Teoría: Editor de Texto Nano

`nano` es el editor de texto de terminal más amigable para principiantes. No requiere memorizar modos complejos como vi/vim.

### Abrir archivos con nano
```bash
nano fichero.txt          # Abre o crea el archivo
nano +10 fichero.txt      # Abre en la línea 10
nano -l fichero.txt       # Muestra números de línea
```

### Interfaz de nano
```
  GNU nano 6.2                  fichero.txt
┌──────────────────────────────────────────┐
│ contenido del archivo aquí               │
│ _                                        │
│                                          │
└──────────────────────────────────────────┘
^G Ayuda    ^O Guardar   ^X Salir   ^K Cortar
^W Buscar   ^R Insertar  ^\ Reemplz ^C Posición
```

### Atajos esenciales (^ = Ctrl)
| Atajo | Función |
|-------|---------|
| `Ctrl+O` | Guardar archivo (Write Out) |
| `Ctrl+X` | Salir |
| `Ctrl+W` | Buscar texto |
| `Ctrl+\` | Buscar y reemplazar |
| `Ctrl+K` | Cortar línea |
| `Ctrl+U` | Pegar línea |
| `Ctrl+G` | Mostrar ayuda |
| `Ctrl+C` | Mostrar posición del cursor |
| `Alt+U`  | Deshacer |
| `Alt+E`  | Rehacer |

### Flujo típico de edición
1. `nano fichero.txt` → abrir
2. Editar el contenido
3. `Ctrl+O` → guardar (confirmar con Enter)
4. `Ctrl+X` → salir

### Sintaxis de búsqueda y reemplazo
- `Ctrl+\` → buscar
- Escribe el texto a buscar, Enter
- Escribe el texto de reemplazo, Enter
- `A` para reemplazar todos, `Y` para el actual

### Guía Paso a Paso
1. Ejecuta `nano mi_config.conf` → abre un nuevo archivo
2. Escribe algunas líneas de configuración
3. Pulsa `Ctrl+O` → guardar con el mismo nombre
4. Pulsa Enter para confirmar
5. Pulsa `Ctrl+X` → salir""",
        "goal_description": "Aprender a usar el editor nano para crear y editar archivos de texto directamente en la terminal sin interfaz gráfica.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/plantilla.conf", "content": "# Configuración del sistema\nhost=CAMBIAR_ESTO\nport=8080\ndebug=false\nlog_level=info"},
                {"path": "/home/student/README.txt", "content": "Edita plantilla.conf cambiando CAMBIAR_ESTO por 'localhost'\nLuego crea un nuevo archivo llamado notas.txt con cualquier contenido."}
            ]
        }),
        "validation_command": "test -f /home/student/notas.txt && echo ok || echo missing",
        "expected_result": "ok",
        "challenges": [
            {
                "id": "CL15_C1",
                "title": "Crea el archivo notas.txt con nano",
                "description": "Usa nano para crear un nuevo archivo llamado notas.txt con al menos una línea de contenido. Guárdalo y sal.",
                "v_type": "file_created",
                "v_value": "notas.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 50,
                "hints": "Usa: nano notas.txt|Escribe algo, luego Ctrl+O para guardar, Enter para confirmar, Ctrl+X para salir"
            }
        ]
    },
    {
        "order_index": 6,
        "title": "Compresión: tar, gzip y zip",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 160,
        "time_limit": 25,
        "description": """## Teoría: Compresión y Archivado en Linux

Linux usa principalmente dos herramientas: `tar` para agrupar archivos y `gzip`/`bzip2` para comprimirlos.

### `tar` — Archivador de ficheros
```bash
# Crear archivo tar (sin compresión)
tar -cvf archivo.tar directorio/

# Crear tar.gz (con compresión gzip)
tar -czf archivo.tar.gz directorio/

# Crear tar.bz2 (con compresión bzip2, mayor compresión)
tar -cjf archivo.tar.bz2 directorio/

# Extraer tar.gz
tar -xzf archivo.tar.gz

# Extraer en directorio específico
tar -xzf archivo.tar.gz -C /destino/

# Listar contenido sin extraer
tar -tzf archivo.tar.gz

# Ver qué hace (verbose)
tar -xzvf archivo.tar.gz
```

### Flags de tar
| Flag | Significado |
|------|-------------|
| `-c` | Create (crear) |
| `-x` | Extract (extraer) |
| `-t` | List (listar) |
| `-v` | Verbose (mostrar progreso) |
| `-f` | File (nombre del archivo) |
| `-z` | Gzip |
| `-j` | Bzip2 |
| `-J` | XZ |

### `gzip` — Comprimir archivos individuales
```bash
gzip fichero.txt          # Crea fichero.txt.gz (borra el original)
gzip -k fichero.txt       # Keep: mantiene el original
gunzip fichero.txt.gz     # Descomprimir
gzip -d fichero.txt.gz    # También descomprime
gzip -l fichero.txt.gz    # Ver ratio de compresión
```

### `zip/unzip` — Formato ZIP (compatible con Windows)
```bash
zip archivo.zip fichero1.txt fichero2.txt
zip -r archivo.zip directorio/    # Recursivo
unzip archivo.zip
unzip -l archivo.zip              # Listar contenido
```

### Guía Paso a Paso
1. Ejecuta `tar -czf backup_logs.tar.gz logs/` → comprime el directorio
2. Ejecuta `tar -tzf backup_logs.tar.gz` → lista el contenido
3. Ejecuta `tar -xzf backup_logs.tar.gz -C /tmp/` → extrae
4. Compara tamaños: `ls -lh logs/ backup_logs.tar.gz`""",
        "goal_description": "Aprender a comprimir y descomprimir archivos y directorios con tar, gzip y zip para gestionar backups y transferencias de datos.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "directories": ["/home/student/logs", "/home/student/proyecto"],
            "files": [
                {"path": "/home/student/logs/app.log", "content": "Log de aplicación\n" * 10},
                {"path": "/home/student/logs/error.log", "content": "Error crítico en línea 42\nStack trace...\n" * 5},
                {"path": "/home/student/proyecto/main.py", "content": "#!/usr/bin/env python3\nprint('Hola mundo')"},
                {"path": "/home/student/proyecto/README.md", "content": "# Mi Proyecto\nProyecto de ejemplo para el lab de compresión."}
            ]
        }),
        "validation_command": "test -f /home/student/backup_logs.tar.gz && echo ok || echo missing",
        "expected_result": "ok",
        "challenges": [
            {
                "id": "CL16_C1",
                "title": "Comprime el directorio logs",
                "description": "Crea un archivo comprimido llamado 'backup_logs.tar.gz' que contenga todo el directorio logs/.",
                "v_type": "file_created",
                "v_value": "backup_logs.tar.gz",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 55,
                "hints": "Usa: tar -czf backup_logs.tar.gz logs/|Los flags: c=crear, z=gzip, f=fichero"
            },
            {
                "id": "CL16_C2",
                "title": "Lista el contenido del tar sin extraer",
                "description": "Usa tar para listar el contenido de backup_logs.tar.gz sin extraerlo. ¿Qué flag se usa para listar?",
                "v_type": "file_exists_in_directory",
                "v_value": "backup_logs.tar.gz",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 35,
                "hints": "Usa: tar -tzf backup_logs.tar.gz|El flag -t es para list (listar)"
            }
        ]
    },
    {
        "order_index": 7,
        "title": "Búsqueda en Archivos: grep",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 160,
        "time_limit": 25,
        "description": """## Teoría: El comando grep

`grep` (Global Regular Expression Print) busca patrones de texto dentro de archivos. Es una de las herramientas más usadas por administradores de sistemas.

### Uso básico
```bash
grep "patrón" fichero.txt          # Busca en un archivo
grep "error" *.log                  # Busca en todos los .log
grep "ERROR" /var/log/syslog        # Busca en log del sistema
```

### Opciones más útiles
```bash
grep -i "error" fichero.log    # Case insensitive (sin distinción may/min)
grep -n "error" fichero.log    # Muestra número de línea
grep -c "error" fichero.log    # Cuenta líneas que coinciden
grep -v "error" fichero.log    # Invierte: muestra lo que NO coincide
grep -r "config" /etc/         # Búsqueda recursiva en directorio
grep -l "error" *.log          # Solo muestra los nombres de archivo
grep -w "error" fichero.log    # Solo coincide con la palabra completa
grep -A 2 "ERROR" log.txt      # 2 líneas DESPUÉS del match
grep -B 2 "ERROR" log.txt      # 2 líneas ANTES del match
grep -C 2 "ERROR" log.txt      # 2 líneas antes Y después
```

### Expresiones regulares básicas
```bash
grep "^Error" log.txt          # Líneas que EMPIEZAN por "Error"
grep "failed$" log.txt         # Líneas que TERMINAN en "failed"
grep "err[oa]r" log.txt        # "error" o "errar"
grep "[0-9]\{3\}" log.txt      # Exactamente 3 dígitos
grep -E "error|warning" log.txt  # Error OR warning (regex extendida)
```

### Casos de uso reales en sysadmin
```bash
# Buscar errores en logs
grep -i "error\|fail\|critical" /var/log/syslog

# Buscar IPs que fallaron SSH
grep "Failed password" /var/log/auth.log

# Contar cuántas veces ocurrió un error
grep -c "OutOfMemory" application.log

# Buscar configuraciones que no son comentarios
grep -v "^#" /etc/ssh/sshd_config | grep -v "^$"
```

### Guía Paso a Paso
1. Ejecuta `grep "ERROR" sistema.log` → busca errores
2. Ejecuta `grep -n "WARNING" sistema.log` → con número de línea
3. Ejecuta `grep -c "INFO" sistema.log` → cuenta los INFO
4. Ejecuta `grep -v "INFO" sistema.log` → todo excepto INFO""",
        "goal_description": "Dominar el comando grep para buscar patrones de texto en archivos, incluyendo opciones de case-insensitive, recursivo y con contexto.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/sistema.log", "content": "\n".join([
                    "2024-01-10 08:00:00 INFO: Sistema iniciado correctamente",
                    "2024-01-10 08:05:00 INFO: Usuario admin conectado desde 192.168.1.10",
                    "2024-01-10 08:10:00 WARNING: Memoria al 75%",
                    "2024-01-10 08:15:00 ERROR: No se pudo escribir en /var/log/app.log",
                    "2024-01-10 08:20:00 INFO: Backup iniciado",
                    "2024-01-10 08:25:00 ERROR: Conexión rechazada por firewall",
                    "2024-01-10 08:30:00 INFO: Backup completado",
                    "2024-01-10 08:35:00 WARNING: Disco al 90% de capacidad",
                    "2024-01-10 08:40:00 CRITICAL: Temperatura de CPU supera 85°C",
                    "2024-01-10 08:45:00 INFO: Servicio web reiniciado"
                ])},
                {"path": "/home/student/usuarios.txt", "content": "admin:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000::/home/student:/bin/bash\nnobody:x:65534:65534::/nonexistent:/usr/sbin/nologin\nwww-data:x:33:33::/var/www:/usr/sbin/nologin"}
            ]
        }),
        "validation_command": "grep -c 'ERROR' /home/student/sistema.log",
        "expected_result": "2",
        "challenges": [
            {
                "id": "CL17_C1",
                "title": "Cuenta los errores del log",
                "description": "Usa grep con la opción adecuada para contar cuántas líneas contienen 'ERROR' en sistema.log.",
                "v_type": "file_exists_in_directory",
                "v_value": "sistema.log",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 40,
                "hints": "Usa: grep -c 'ERROR' sistema.log|El flag -c cuenta las líneas coincidentes"
            },
            {
                "id": "CL17_C2",
                "title": "Extrae solo los usuarios con shell bash",
                "description": "En usuarios.txt, usa grep para filtrar solo las líneas que terminan en '/bin/bash'.",
                "v_type": "file_exists_in_directory",
                "v_value": "usuarios.txt",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 45,
                "hints": "Usa: grep '/bin/bash' usuarios.txt|O con ancla de fin de línea: grep '/bin/bash$' usuarios.txt"
            }
        ]
    },
    {
        "order_index": 8,
        "title": "Pipes y Tuberías Avanzadas",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 170,
        "time_limit": 30,
        "description": """## Teoría: Pipes y Comandos de Procesado

Las tuberías (`|`) permiten encadenar comandos, pasando la salida de uno como entrada del siguiente. Combinadas con comandos de procesado, son extremadamente poderosas.

### El pipe `|`
```bash
comando1 | comando2 | comando3
```
La salida de comando1 va como entrada a comando2, etc.

### `sort` — Ordenar
```bash
sort fichero.txt              # Orden alfabético
sort -n fichero.txt           # Orden numérico
sort -r fichero.txt           # Orden inverso
sort -k 2 fichero.txt         # Ordenar por columna 2
sort -t: -k 3 -n /etc/passwd  # Ordenar passwd por UID (campo 3, sep:)
sort -u fichero.txt           # Ordenar y eliminar duplicados
```

### `uniq` — Eliminar duplicados (requiere que esté ordenado)
```bash
uniq fichero.txt              # Elimina duplicados consecutivos
uniq -c fichero.txt           # Cuenta ocurrencias
uniq -d fichero.txt           # Muestra solo las duplicadas
sort fichero.txt | uniq -c | sort -rn  # Top frecuencias
```

### `wc` — Contar
```bash
wc fichero.txt          # Líneas, palabras, bytes
wc -l fichero.txt       # Solo líneas
wc -w fichero.txt       # Solo palabras
wc -c fichero.txt       # Solo bytes
```

### `cut` — Extraer columnas
```bash
cut -d: -f1 /etc/passwd          # Campo 1 (separador :)
cut -d, -f1,3 datos.csv          # Campos 1 y 3 (separador ,)
cut -c1-10 fichero.txt           # Caracteres 1 al 10 de cada línea
```

### Cadenas completas de pipe
```bash
# Top 5 IPs más frecuentes en un log
cat access.log | cut -d' ' -f1 | sort | uniq -c | sort -rn | head -5

# Contar usuarios únicos en el sistema
cut -d: -f1 /etc/passwd | sort | uniq | wc -l

# Líneas con ERROR ordenadas por hora
grep ERROR sistema.log | cut -d' ' -f1,2 | sort
```

### Guía Paso a Paso
1. Ejecuta `cat ventas.csv | cut -d, -f1` → primera columna
2. Ejecuta `cat ventas.csv | sort -t, -k3 -n` → ordena por precio
3. Ejecuta `cat nombres.txt | sort | uniq -c` → frecuencias
4. Combina: `cat ventas.csv | cut -d, -f2 | sort | uniq -c | sort -rn`""",
        "goal_description": "Dominar el uso de pipes con sort, uniq, wc y cut para procesar y analizar datos desde la línea de comandos.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/ventas.csv", "content": "producto,categoria,precio\nmanzana,fruta,1.20\nportatil,electronica,899\ncamiseta,ropa,25\nplatano,fruta,0.80\nraton,electronica,35\npantalon,ropa,60\npera,fruta,1.50\nteclado,electronica,75\nbufanda,ropa,20"},
                {"path": "/home/student/accesos.log", "content": "\n".join([
                    "192.168.1.10 admin login_ok",
                    "192.168.1.15 user1 login_ok",
                    "192.168.1.10 admin login_ok",
                    "10.0.0.5 hacker login_fail",
                    "192.168.1.10 admin login_ok",
                    "10.0.0.5 hacker login_fail",
                    "192.168.1.20 user2 login_ok",
                    "10.0.0.5 hacker login_fail"
                ])}
            ]
        }),
        "validation_command": "grep 'login_fail' /home/student/accesos.log | cut -d' ' -f1 | sort | uniq -c | awk '{print $1}'",
        "expected_result": "3",
        "challenges": [
            {
                "id": "CL18_C1",
                "title": "Cuenta los accesos fallidos por IP",
                "description": "Usa una cadena de pipes para extraer las IPs de los login_fail en accesos.log, contar cuántas veces aparece cada una, y mostrarlo ordenado.",
                "v_type": "file_exists_in_directory",
                "v_value": "accesos.log",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 60,
                "hints": "Pipeline: grep 'login_fail' accesos.log | cut -d' ' -f1 | sort | uniq -c"
            },
            {
                "id": "CL18_C2",
                "title": "Lista las categorías únicas de ventas",
                "description": "Extrae la columna 'categoria' de ventas.csv (sin la cabecera) y muestra las categorías únicas ordenadas.",
                "v_type": "file_exists_in_directory",
                "v_value": "ventas.csv",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 50,
                "hints": "Pipeline: tail -n +2 ventas.csv | cut -d, -f2 | sort | uniq|tail -n +2 salta la cabecera"
            }
        ]
    },
    {
        "order_index": 9,
        "title": "Transferencia Local: cp -p y rsync básico",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 150,
        "time_limit": 25,
        "description": """## Teoría: Sincronización y Backups Locales

### `cp -p` — Preservar metadatos
Al copiar archivos es importante preservar permisos, propietario y fechas:
```bash
cp -p archivo.txt copia.txt           # Preserva permisos y fechas
cp -rp directorio/ copia_dir/         # Recursivo y preservando
cp -a directorio/ copia_dir/          # Archive mode (= -rp + más)
```

### `rsync` — Sincronización eficiente
`rsync` es mejor que `cp` para sincronizar porque solo copia los cambios:
```bash
# Sintaxis básica
rsync origen destino

# Opciones más usadas
rsync -a origen/ destino/             # Archive mode (preserva todo)
rsync -av origen/ destino/            # Verbose
rsync -av --delete origen/ destino/   # Borra en destino lo que no está en origen
rsync -av --dry-run origen/ destino/  # Simulación sin hacer cambios

# Backup local con fecha
rsync -av /home/student/ /backups/student_$(date +%Y%m%d)/
```

### Flags de rsync
| Flag | Significado |
|------|-------------|
| `-a` | Archive (equivale a -rlptgoD) |
| `-v` | Verbose |
| `-r` | Recursive |
| `-l` | Preservar symlinks |
| `-p` | Preservar permisos |
| `-t` | Preservar timestamps |
| `-g` | Preservar grupo |
| `-o` | Preservar owner |
| `--delete` | Borrar en destino lo que no está en origen |
| `--dry-run` | Simulación sin cambios reales |
| `--exclude` | Excluir patrones |

### Excluir archivos del rsync
```bash
rsync -av --exclude='*.log' --exclude='.git/' src/ dst/
rsync -av --exclude-from='lista_excluir.txt' src/ dst/
```

### Estrategia de backup local
```bash
# Backup incremental con fecha
FECHA=$(date +%Y%m%d_%H%M%S)
rsync -av --delete /datos/ /backups/datos_$FECHA/
```

### Guía Paso a Paso
1. Ejecuta `rsync -av proyecto/ backup_proyecto/` → sincroniza
2. Ejecuta `rsync -av --dry-run proyecto/ backup_proyecto/` → simula
3. Modifica un archivo en proyecto/
4. Vuelve a sincronizar y observa que solo copia el archivo modificado""",
        "goal_description": "Aprender a hacer backups y sincronizaciones locales eficientes con rsync y cp -p, preservando metadatos de archivos.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "directories": ["/home/student/proyecto", "/home/student/proyecto/src", "/home/student/backups"],
            "files": [
                {"path": "/home/student/proyecto/main.sh", "content": "#!/bin/bash\necho 'Script principal'\nexit 0"},
                {"path": "/home/student/proyecto/config.conf", "content": "version=1.0\nenv=produccion"},
                {"path": "/home/student/proyecto/src/modulo.sh", "content": "#!/bin/bash\necho 'Módulo auxiliar'"},
                {"path": "/home/student/proyecto/debug.log", "content": "Log de debug - no incluir en backup"}
            ],
            "commands": ["chmod +x /home/student/proyecto/main.sh", "chmod +x /home/student/proyecto/src/modulo.sh"]
        }),
        "validation_command": "test -d /home/student/backup_proyecto && echo ok || echo missing",
        "expected_result": "ok",
        "challenges": [
            {
                "id": "CL19_C1",
                "title": "Sincroniza el proyecto al directorio de backup",
                "description": "Usa rsync para sincronizar el directorio proyecto/ a backup_proyecto/ preservando todos los metadatos.",
                "v_type": "directory_created",
                "v_value": "backup_proyecto",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 55,
                "hints": "Usa: rsync -av proyecto/ backup_proyecto/|El flag -a preserva permisos, fechas y propietarios"
            }
        ]
    },
    {
        "order_index": 10,
        "title": "Organización Masiva: xargs y find combinados",
        "difficulty": "hard",
        "category": "Linux",
        "xp_reward": 200,
        "time_limit": 35,
        "description": """## Teoría: xargs y find para Operaciones Masivas

### `xargs` — Construir y ejecutar comandos desde stdin
`xargs` toma la entrada estándar y la usa como argumentos para otro comando:
```bash
# Sin xargs: rm no puede leer desde pipe directamente
find . -name "*.tmp" | rm     # ❌ No funciona

# Con xargs: pasa los resultados como argumentos
find . -name "*.tmp" | xargs rm     # ✅ Funciona
```

### Sintaxis de xargs
```bash
find /ruta -name "*.log" | xargs ls -la
find /ruta -name "*.txt" | xargs wc -l
find /ruta -type f | xargs chmod 644
echo "uno dos tres" | xargs -n 1 echo    # Un argumento por línea
```

### `find -exec` — Alternativa integrada
```bash
find . -name "*.tmp" -exec rm {} \;       # Ejecuta rm para cada archivo
find . -name "*.sh" -exec chmod +x {} \;  # Hace ejecutables todos los .sh
find . -type f -exec ls -la {} \;
```

### `find` con `-exec` vs `xargs`
- `-exec ... {} \;`: ejecuta una vez por cada archivo (lento)
- `-exec ... {} +`: agrupa archivos (más rápido, como xargs)
- `| xargs`: más flexible, permite pipes adicionales

### Casos de uso avanzados
```bash
# Encontrar y eliminar archivos temporales
find /tmp -name "*.tmp" -mtime +7 | xargs rm -v

# Buscar y comprimir logs viejos
find /logs -name "*.log" -mtime +30 | xargs gzip

# Cambiar permisos masivamente
find /scripts -name "*.sh" | xargs chmod +x

# Buscar texto en múltiples archivos
find . -name "*.conf" | xargs grep -l "localhost"

# Contar líneas totales de todos los .py
find . -name "*.py" | xargs wc -l | tail -1
```

### Seguridad con xargs
Usa `-print0` y `-0` para manejar nombres con espacios:
```bash
find . -name "* *" -print0 | xargs -0 rm   # Maneja espacios en nombres
```

### Guía Paso a Paso
1. Ejecuta `find . -name "*.tmp" | xargs ls -la` → lista temporales
2. Ejecuta `find . -name "*.sh" -exec chmod +x {} \\;` → hace ejecutables
3. Combina: `find . -type f | xargs wc -l | sort -n | tail -5`""",
        "goal_description": "Combinar find y xargs para realizar operaciones masivas sobre grupos de archivos de forma eficiente y automatizada.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "directories": ["/home/student/scripts", "/home/student/logs", "/home/student/temp"],
            "files": [
                {"path": "/home/student/scripts/deploy.sh", "content": "#!/bin/bash\necho 'Desplegando...'"},
                {"path": "/home/student/scripts/backup.sh", "content": "#!/bin/bash\necho 'Haciendo backup...'"},
                {"path": "/home/student/scripts/cleanup.sh", "content": "#!/bin/bash\necho 'Limpiando...'"},
                {"path": "/home/student/logs/app.log", "content": "Log 1\n" * 20},
                {"path": "/home/student/logs/error.log", "content": "Error log\n" * 10},
                {"path": "/home/student/temp/cache1.tmp", "content": "temporal 1"},
                {"path": "/home/student/temp/cache2.tmp", "content": "temporal 2"},
                {"path": "/home/student/temp/cache3.tmp", "content": "temporal 3"}
            ]
        }),
        "validation_command": "find /home/student/scripts -name '*.sh' -executable | wc -l",
        "expected_result": "3",
        "challenges": [
            {
                "id": "CL20_C1",
                "title": "Haz ejecutables todos los scripts .sh",
                "description": "Usa find con -exec (o pipe a xargs) para dar permiso de ejecución (+x) a todos los archivos .sh en el directorio scripts/.",
                "v_type": "permission_set",
                "v_value": "755",
                "v_extra": "/home/student/scripts/deploy.sh",
                "order_index": 1,
                "xp": 65,
                "hints": "Opción 1: find scripts/ -name '*.sh' -exec chmod +x {} \\;|Opción 2: find scripts/ -name '*.sh' | xargs chmod +x"
            },
            {
                "id": "CL20_C2",
                "title": "Elimina todos los archivos .tmp",
                "description": "Usa find con xargs para eliminar todos los archivos .tmp dentro del directorio temp/.",
                "v_type": "directory_created",
                "v_value": "temp",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 55,
                "hints": "Usa: find temp/ -name '*.tmp' | xargs rm|O con -exec: find temp/ -name '*.tmp' -exec rm {} \\;"
            }
        ]
    }
]


def seed_part1():
    db = SessionLocal()
    create_tables()

    # Crear o recuperar el Skill Path "Claude Labs"
    claude_path = db.query(SkillPath).filter(SkillPath.title == "Claude Labs").first()
    if not claude_path:
        claude_path = SkillPath(
            title="Claude Labs",
            description="50 laboratorios de Linux diseñados por Claude. Domina la terminal desde los fundamentos hasta scripting avanzado, sin necesidad de conexión a internet.",
            difficulty="easy",
            order_index=10
        )
        db.add(claude_path)
        db.commit()
        db.refresh(claude_path)
        print(f"✅ Skill Path 'Claude Labs' creado (id={claude_path.id})")
    else:
        print(f"ℹ️  Skill Path 'Claude Labs' ya existe (id={claude_path.id})")

    # Módulo 1
    m1 = db.query(Module).filter(Module.title == "CL-M1 — Navegación y Exploración").first()
    if not m1:
        m1 = Module(
            skill_path_id=claude_path.id,
            title="CL-M1 — Navegación y Exploración",
            description="Aprende a moverte por el sistema de archivos de Linux: pwd, cd, ls, find, tipos de archivo y más.",
            order_index=1
        )
        db.add(m1)
        db.commit()
        db.refresh(m1)
        print(f"✅ Módulo 1 creado (id={m1.id})")

    # Módulo 2
    m2 = db.query(Module).filter(Module.title == "CL-M2 — Gestión de Archivos y Directorios").first()
    if not m2:
        m2 = Module(
            skill_path_id=claude_path.id,
            title="CL-M2 — Gestión de Archivos y Directorios",
            description="Domina la creación, copia, movimiento, eliminación y visualización de archivos. Compresión, grep y pipes.",
            order_index=2
        )
        db.add(m2)
        db.commit()
        db.refresh(m2)
        print(f"✅ Módulo 2 creado (id={m2.id})")

    def insert_labs(module, labs_data):
        for lab_data in labs_data:
            title = lab_data["title"]
            existing = db.query(Lab).filter(Lab.title == title, Lab.module_id == module.id).first()
            if existing:
                print(f"  ⏭️  Lab '{title}' ya existe, omitiendo.")
                continue

            lab = Lab(
                module_id=module.id,
                title=title,
                description=lab_data["description"],
                goal_description=lab_data["goal_description"],
                step_by_step_guide=lab_data.get("step_by_step_guide", ""),
                docker_image="ubuntu:22.04",
                scenario_setup=lab_data["scenario_setup"],
                validation_command=lab_data.get("validation_command", "echo ok"),
                expected_result=lab_data.get("expected_result", "ok"),
                difficulty=lab_data["difficulty"],
                category=lab_data["category"],
                time_limit=lab_data["time_limit"],
                xp_reward=lab_data["xp_reward"],
                order_index=lab_data["order_index"],
                is_active=True
            )
            db.add(lab)
            db.commit()
            db.refresh(lab)

            for ch_data in lab_data.get("challenges", []):
                ch = Challenge(
                    id=ch_data["id"],
                    lab_id=lab.id,
                    title=ch_data["title"],
                    description=ch_data["description"],
                    validation_type=ch_data["v_type"],
                    validation_value=ch_data["v_value"],
                    validation_extra=ch_data.get("v_extra", ""),
                    order_index=ch_data.get("order_index", 1),
                    xp=ch_data.get("xp", 30),
                    hints=ch_data.get("hints", "")
                )
                db.add(ch)
            db.commit()
            print(f"  ✅ Lab '{title}' insertado con {len(lab_data.get('challenges', []))} reto(s).")

    print("\n📦 Insertando Módulo 1 — Navegación y Exploración...")
    insert_labs(m1, M1_LABS)

    print("\n📦 Insertando Módulo 2 — Gestión de Archivos...")
    insert_labs(m2, M2_LABS)

    db.close()
    print("\n🎉 Parte 1 completada: 20 labs insertados (Módulos 1 y 2)")


if __name__ == "__main__":
    seed_part1()
