"""
Claude Labs — Seed Script (Part 3 of 3)
Módulo 5: Texto y Scripting Básico (Labs 41-50)
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

# ─────────────────────────────────────────────────────────
# MÓDULO 5 — Texto y Scripting Básico (10 labs)
# ─────────────────────────────────────────────────────────
M5_LABS = [
    {
        "order_index": 1,
        "title": "grep Avanzado: Expresiones Regulares",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 170,
        "time_limit": 30,
        "description": """## Teoría: grep con Expresiones Regulares

Las expresiones regulares (regex) permiten crear patrones de búsqueda muy potentes.

### Metacaracteres básicos
```
.       → Cualquier carácter (excepto newline)
*       → 0 o más del carácter anterior
+       → 1 o más (solo con -E)
?       → 0 o 1 del anterior (solo con -E)
^       → Inicio de línea
$       → Final de línea
[abc]   → Cualquiera de esos caracteres
[^abc]  → Cualquier carácter EXCEPTO esos
[a-z]   → Rango
\\.      → Punto literal (escapado)
\\d     → Dígito (solo con -P)
\\w     → Palabra (solo con -P)
```

### grep básico vs extendido
```bash
grep 'patron'       fichero.txt    # BRE (Basic Regular Expressions)
grep -E 'patron'    fichero.txt    # ERE (Extended) — egrep
grep -P 'patron'    fichero.txt    # PCRE (Perl Compatible)
```

### Ejemplos prácticos
```bash
# Líneas que empiezan por '#' (comentarios)
grep '^#' config.conf

# Líneas que no empiezan por '#' (sin comentarios)
grep -v '^#' config.conf | grep -v '^$'

# Líneas que terminan en '.txt'
grep '\.txt$' listado.txt

# Direcciones IP (patrón simplificado)
grep -E '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' log.txt

# Emails (patrón básico)
grep -E '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' fichero.txt

# Líneas con 'error' O 'warning' (OR)
grep -E 'error|warning' log.txt

# Palabras de 4-6 letras
grep -E '\b[a-z]{4,6}\b' texto.txt

# Números de 3 dígitos exactos
grep -E '\b[0-9]{3}\b' datos.txt
```

### Contexto con -A, -B, -C
```bash
grep -A 3 'ERROR' log.txt     # 3 líneas DESPUÉS del match
grep -B 2 'ERROR' log.txt     # 2 líneas ANTES del match
grep -C 2 'ERROR' log.txt     # 2 líneas antes Y después
```

### Guía Paso a Paso
1. Ejecuta `grep '^[0-9]' datos.txt` → líneas que empiezan por número
2. Ejecuta `grep -E '[0-9]{3}' datos.txt` → 3 dígitos consecutivos
3. Ejecuta `grep -v '^#' config.conf` → sin líneas de comentario
4. Ejecuta `grep -E 'ERROR|WARN' sistema.log` → errores y warnings""",
        "goal_description": "Dominar grep con expresiones regulares para realizar búsquedas complejas de patrones en archivos de texto.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/sistema.log", "content": "\n".join([
                    "2024-01-10 09:00:00 INFO: Inicio del sistema",
                    "2024-01-10 09:05:00 ERROR: Fallo en el módulo auth",
                    "2024-01-10 09:10:00 WARNING: CPU al 85%",
                    "2024-01-10 09:15:00 INFO: Backup iniciado",
                    "2024-01-10 09:20:00 ERROR: Disco lleno",
                    "2024-01-10 09:25:00 DEBUG: Conectando a 192.168.1.100",
                    "2024-01-10 09:30:00 INFO: Servicio reiniciado"
                ])},
                {"path": "/home/student/config.conf", "content": "# Configuración del servidor\n# Editado: 2024-01-10\n\nhost=192.168.1.1\nport=8080\n# Puerto alternativo\n# port=9090\ndb_host=10.0.0.5\ndb_port=5432\ndebug=false\n# debug=true"},
                {"path": "/home/student/emails.txt", "content": "contacto@empresa.com\nadmin@tech4u.es\nno-reply@sistema.local\nesto-no-es-email\nuser123@gmail.com\notro.usuario+tag@dominio.org"}
            ]
        }),
        "validation_command": "grep -cE 'ERROR|WARNING' /home/student/sistema.log",
        "expected_result": "3",
        "challenges": [
            {
                "id": "CL41_C1",
                "title": "Filtra solo las líneas de error y warning",
                "description": "Usa grep con expresión regular extendida (-E) para buscar líneas que contengan 'ERROR' O 'WARNING'.",
                "v_type": "file_exists_in_directory",
                "v_value": "sistema.log",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 50,
                "hints": "Usa: grep -E 'ERROR|WARNING' sistema.log|El | en regex significa OR"
            },
            {
                "id": "CL41_C2",
                "title": "Extrae las líneas de config que no son comentarios",
                "description": "Filtra config.conf mostrando solo las líneas que NO empiezan por '#' y que no están vacías.",
                "v_type": "file_exists_in_directory",
                "v_value": "config.conf",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 55,
                "hints": "Pipeline: grep -v '^#' config.conf | grep -v '^$'|^# = empieza por # | ^$ = línea vacía"
            }
        ]
    },
    {
        "order_index": 2,
        "title": "sed: Editor de Streams",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 175,
        "time_limit": 30,
        "description": """## Teoría: sed — Stream Editor

`sed` procesa texto línea por línea, aplicando transformaciones sin abrir el archivo en un editor.

### Sustitución básica
```bash
sed 's/original/nuevo/' fichero.txt          # Primera ocurrencia de cada línea
sed 's/original/nuevo/g' fichero.txt         # Todas las ocurrencias (g=global)
sed 's/original/nuevo/2' fichero.txt         # Solo la 2ª ocurrencia
sed 's/original/nuevo/gi' fichero.txt        # Global + case insensitive
```

### Editar el archivo directamente con -i
```bash
sed -i 's/debug=true/debug=false/' app.conf  # Modifica el archivo
sed -i.bak 's/old/new/g' fichero.txt         # Modifica y crea backup .bak
```

### Eliminar líneas
```bash
sed '/patrón/d' fichero.txt      # Elimina líneas que coinciden
sed '/^#/d' config.conf          # Elimina comentarios
sed '/^$/d' fichero.txt          # Elimina líneas vacías
sed '3d' fichero.txt             # Elimina la línea 3
sed '2,5d' fichero.txt           # Elimina líneas 2 a 5
```

### Mostrar solo ciertas líneas
```bash
sed -n '5p' fichero.txt           # Solo muestra la línea 5
sed -n '2,8p' fichero.txt         # Líneas 2 a 8
sed -n '/ERROR/p' log.txt         # Solo líneas con ERROR
sed -n '$p' fichero.txt           # Última línea
```

### Insertar y añadir texto
```bash
sed '3i Nueva línea antes' fichero.txt    # Inserta ANTES de la línea 3
sed '3a Nueva línea después' fichero.txt  # Añade DESPUÉS de la línea 3
sed '1i # Cabecera' fichero.txt           # Añade cabecera al inicio
```

### Combinando múltiples expresiones
```bash
sed -e 's/foo/bar/g' -e 's/baz/qux/g' fichero.txt
sed 's/foo/bar/g; s/baz/qux/g' fichero.txt  # Con punto y coma
```

### Casos reales
```bash
# Cambiar IP en config
sed -i 's/192.168.1.100/10.0.0.1/g' network.conf

# Eliminar comentarios y líneas vacías
sed '/^#/d; /^$/d' config.conf

# Cambiar la versión en un script
sed -i 's/VERSION="1.0"/VERSION="2.0"/' script.sh
```

### Guía Paso a Paso
1. Ejecuta `sed 's/localhost/127.0.0.1/g' app.conf` → sustituye
2. Ejecuta `sed '/^#/d' app.conf` → elimina comentarios
3. Ejecuta `sed -n '1,3p' app.conf` → muestra solo líneas 1-3
4. Ejecuta `sed -i 's/debug=false/debug=true/' app.conf` → modifica""",
        "goal_description": "Dominar sed para realizar sustituciones, eliminaciones e inserciones de texto en archivos desde la línea de comandos.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/app.conf", "content": "# Configuración de la aplicación\n# Servidor\nhost=localhost\nport=8080\ndebug=false\n\n# Base de datos\ndb_host=192.168.1.100\ndb_port=5432\ndb_name=miapp\ndb_user=admin\n"},
                {"path": "/home/student/script_v1.sh", "content": "#!/bin/bash\n# Script versión 1.0\nVERSION=\"1.0\"\necho \"Ejecutando versión $VERSION\"\n# TODO: actualizar a 2.0"}
            ]
        }),
        "validation_command": "grep 'host=127.0.0.1' /home/student/app.conf | wc -l",
        "expected_result": "1",
        "challenges": [
            {
                "id": "CL42_C1",
                "title": "Reemplaza localhost por 127.0.0.1",
                "description": "Usa sed con -i para modificar app.conf reemplazando 'localhost' por '127.0.0.1' en todas sus ocurrencias.",
                "v_type": "file_exists_in_directory",
                "v_value": "app.conf",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 55,
                "hints": "Usa: sed -i 's/localhost/127.0.0.1/g' app.conf|El flag -i modifica el archivo directamente"
            },
            {
                "id": "CL42_C2",
                "title": "Elimina todas las líneas de comentario",
                "description": "Usa sed para mostrar app.conf sin las líneas que empiezan por '#' (sin modificar el archivo).",
                "v_type": "file_exists_in_directory",
                "v_value": "script_v1.sh",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 45,
                "hints": "Usa: sed '/^#/d' app.conf|/^#/d elimina las líneas que empiezan por #"
            }
        ]
    },
    {
        "order_index": 3,
        "title": "awk: Procesado de Columnas y Campos",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 180,
        "time_limit": 35,
        "description": """## Teoría: awk — Procesado de Texto por Campos

`awk` es un lenguaje de procesado de texto especializado en trabajar con datos tabulares y campos.

### Conceptos básicos
- `$0` → línea completa
- `$1` → primer campo
- `$2` → segundo campo
- `$NF` → último campo
- `NR` → número de línea actual
- `NF` → número de campos en la línea actual
- `FS` → separador de campos (por defecto: espacio/tab)

### Uso básico
```bash
awk '{print $1}' fichero.txt           # Imprime primera columna
awk '{print $1, $3}' fichero.txt       # Columnas 1 y 3
awk '{print NR, $0}' fichero.txt       # Con número de línea
awk '{print $NF}' fichero.txt          # Última columna
```

### Cambiar el separador
```bash
awk -F: '{print $1}' /etc/passwd      # Separador ':'
awk -F, '{print $2}' datos.csv        # Separador ','
awk 'BEGIN{FS=":"} {print $1}' /etc/passwd
```

### Condiciones y filtros
```bash
awk '$3 > 100 {print $0}' datos.txt       # Solo si campo 3 > 100
awk '/ERROR/ {print $0}' log.txt          # Solo líneas con ERROR
awk 'NR==5 {print $0}' fichero.txt        # Solo línea 5
awk 'NR>=2 && NR<=5 {print}' fichero.txt  # Líneas 2 a 5
awk '$1 == "admin" {print}' usuarios.txt  # Donde campo 1 = admin
```

### Cálculos y suma
```bash
awk '{sum += $3} END {print sum}' ventas.csv      # Suma columna 3
awk '{sum += $1} END {print sum/NR}' nums.txt     # Media
awk 'END {print NR}' fichero.txt                  # Total de líneas
```

### BEGIN y END
```bash
awk 'BEGIN {print "=== INICIO ==="}
     {print NR": "$0}
     END {print "=== FIN: "NR" líneas ==="}' fichero.txt
```

### Ejemplos reales
```bash
# Listar usuarios y sus shells
awk -F: '{print $1, $7}' /etc/passwd

# Suma del campo precio en CSV
awk -F, 'NR>1 {sum+=$3} END {print "Total: "sum}' ventas.csv

# Mostrar procesos con más de 1% CPU
ps aux | awk '$3 > 1.0 {print $1, $2, $3, $11}'
```

### Guía Paso a Paso
1. Ejecuta `awk '{print $1}' datos.csv` → primera columna
2. Ejecuta `awk -F, '{print $2}' ventas.csv` → columna 2 con sep ,
3. Calcula: `awk -F, 'NR>1 {sum+=$3} END {print sum}' ventas.csv`
4. Filtra: `awk -F, '$2=="fruta" {print $1}' ventas.csv`""",
        "goal_description": "Dominar awk para extraer columnas, filtrar filas, calcular sumas y procesar datos tabulares desde la línea de comandos.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/ventas.csv", "content": "producto,categoria,precio,cantidad\nmanzana,fruta,1.50,100\nportatil,electronica,899.00,5\ncamiseta,ropa,25.00,50\nplatano,fruta,0.80,200\nteclado,electronica,75.00,20\npantalon,ropa,60.00,30\npera,fruta,1.20,150"},
                {"path": "/home/student/servidores.txt", "content": "web01 192.168.1.10 activo 2.3 1024\nweb02 192.168.1.11 activo 1.1 512\ndb01 192.168.1.20 activo 0.5 2048\ndb02 192.168.1.21 parado 0.0 0\ncache01 192.168.1.30 activo 3.8 256"}
            ]
        }),
        "validation_command": "awk -F, 'NR>1 {sum+=$3} END {printf \"%.2f\\n\", sum}' /home/student/ventas.csv",
        "expected_result": "1062.50",
        "challenges": [
            {
                "id": "CL43_C1",
                "title": "Extrae solo los nombres de productos",
                "description": "Usa awk con separador ',' para mostrar solo la primera columna de ventas.csv (sin la cabecera).",
                "v_type": "file_exists_in_directory",
                "v_value": "ventas.csv",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 45,
                "hints": "Usa: awk -F, 'NR>1 {print $1}' ventas.csv|NR>1 salta la cabecera"
            },
            {
                "id": "CL43_C2",
                "title": "Filtra los servidores activos",
                "description": "Usa awk para mostrar solo las líneas de servidores.txt donde el estado (campo 3) es 'activo'.",
                "v_type": "file_exists_in_directory",
                "v_value": "servidores.txt",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 50,
                "hints": "Usa: awk '$3==\"activo\" {print $0}' servidores.txt|O: awk '$3~/activo/' servidores.txt"
            }
        ]
    },
    {
        "order_index": 4,
        "title": "sort, uniq y tr: Transformar Texto",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 160,
        "time_limit": 25,
        "description": """## Teoría: Transformaciones de Texto

### `sort` — Ordenar líneas
```bash
sort fichero.txt               # Orden alfabético
sort -n fichero.txt            # Numérico (no alfabético)
sort -r fichero.txt            # Inverso
sort -u fichero.txt            # Único (elimina duplicados)
sort -k 2 fichero.txt          # Por campo 2
sort -t: -k3 -n /etc/passwd    # Por campo 3 (sep :), numérico
sort -R fichero.txt            # Aleatorio (random)
```

### `uniq` — Eliminar duplicados
```bash
# ⚠️ Solo elimina duplicados CONSECUTIVOS → siempre usar sort antes
sort fichero.txt | uniq         # Eliminar duplicados
sort fichero.txt | uniq -c      # Contar ocurrencias
sort fichero.txt | uniq -d      # Solo mostrar duplicados
sort fichero.txt | uniq -u      # Solo mostrar únicos (no duplicados)
```

### Patrón de "frecuencias"
```bash
# Top palabras más frecuentes
cat texto.txt | tr ' ' '\\n' | sort | uniq -c | sort -rn | head -10

# Top IPs en un log
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10
```

### `tr` — Transformar caracteres
```bash
tr 'a-z' 'A-Z'                    # Minúsculas a mayúsculas
tr 'A-Z' 'a-z'                    # Mayúsculas a minúsculas
tr -d '\\n'                        # Eliminar saltos de línea
tr -d '[:punct:]'                  # Eliminar puntuación
tr -s ' '                         # Comprimir espacios múltiples
tr ':' ','                        # Sustituir : por ,
echo "hola mundo" | tr ' ' '\\n'  # Una palabra por línea
```

### `cut` repaso
```bash
cut -d: -f1,3 /etc/passwd         # Campos 1 y 3 separados por :
cut -d, -f2 datos.csv             # Campo 2 separado por ,
cut -c1-10 fichero.txt            # Primeros 10 caracteres
```

### Cadenas completas
```bash
# Contar palabras únicas en un texto
cat texto.txt | tr '[:upper:]' '[:lower:]' | tr -s ' ' '\\n' | sort | uniq | wc -l

# Ordenar CSV por segunda columna numéricamente
sort -t, -k2 -n datos.csv
```

### Guía Paso a Paso
1. Ejecuta `sort -n numeros.txt` → ordena numéricamente
2. Ejecuta `sort numeros.txt | uniq -c | sort -rn` → frecuencias
3. Ejecuta `echo 'Hola Mundo' | tr 'A-Z' 'a-z'` → minúsculas
4. Ejecuta `cat /etc/passwd | cut -d: -f1 | sort`""",
        "goal_description": "Dominar sort, uniq y tr para ordenar, deduplicar y transformar texto en la línea de comandos de Linux.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/numeros.txt", "content": "42\n7\n99\n13\n42\n55\n7\n1\n99\n100\n42"},
                {"path": "/home/student/paises.txt", "content": "España\nFrancia\nAlemania\nEspaña\nItalia\nFrancia\nPortugal\nEspaña\nAlemania"},
                {"path": "/home/student/texto_mixto.txt", "content": "HOLA MUNDO\neste es UN TEXTO\ncon Mayúsculas y MINÚSCULAS\nMEZCLADAS"}
            ]
        }),
        "validation_command": "sort /home/student/numeros.txt | uniq | wc -l",
        "expected_result": "7",
        "challenges": [
            {
                "id": "CL44_C1",
                "title": "Ordena los números de mayor a menor",
                "description": "Usa sort con las opciones correctas para ordenar numeros.txt numéricamente de mayor a menor.",
                "v_type": "file_exists_in_directory",
                "v_value": "numeros.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 35,
                "hints": "Usa: sort -n -r numeros.txt|Combina -n (numérico) y -r (reverso)"
            },
            {
                "id": "CL44_C2",
                "title": "Cuenta los países únicos",
                "description": "Usa sort y uniq para mostrar cuántas veces aparece cada país en paises.txt, ordenado de más a menos frecuente.",
                "v_type": "file_exists_in_directory",
                "v_value": "paises.txt",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 50,
                "hints": "Pipeline: sort paises.txt | uniq -c | sort -rn|uniq -c cuenta las repeticiones"
            }
        ]
    },
    {
        "order_index": 5,
        "title": "wc y tee: Contar y Bifurcar Salidas",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 130,
        "time_limit": 20,
        "description": """## Teoría: wc y tee para Conteo y Bifurcación

### `wc` — Word Count
```bash
wc fichero.txt           # Líneas, palabras, bytes (todo)
wc -l fichero.txt        # Solo líneas
wc -w fichero.txt        # Solo palabras
wc -c fichero.txt        # Solo bytes
wc -m fichero.txt        # Caracteres (distinto de bytes para UTF-8)
```

### wc con pipes
```bash
ls | wc -l                          # Cuántos archivos hay
grep 'ERROR' log.txt | wc -l        # Cuántos errores
cat /etc/passwd | wc -l             # Cuántos usuarios
find . -name '*.py' | wc -l         # Cuántos archivos Python
```

### wc en múltiples archivos
```bash
wc -l *.txt             # Líneas de cada archivo + total
wc -l fichero1.txt fichero2.txt
```

### `tee` — Bifurcar salida
`tee` envía la salida tanto a la pantalla como a un archivo:
```bash
comando | tee fichero.txt                  # Muestra Y guarda
comando | tee -a fichero.txt               # Muestra Y AÑADE (append)
comando | tee fichero1.txt fichero2.txt    # A múltiples archivos
```

### Casos de uso de tee
```bash
# Ver la salida Y guardarla para análisis posterior
grep 'ERROR' /var/log/app.log | tee errores.txt

# Monitorizar y registrar a la vez
ping localhost | tee -a ping_log.txt

# Pipeline complejo: procesa Y guarda estado intermedio
cat datos.csv | tee datos_copia.csv | awk -F, '{sum+=$3} END {print sum}'
```

### `paste` — Unir archivos en columnas
```bash
paste fichero1.txt fichero2.txt        # Une columnas lado a lado
paste -d, fichero1.txt fichero2.txt    # Con separador ,
paste -s fichero.txt                   # Una fila (todo en una línea)
```

### Guía Paso a Paso
1. Ejecuta `wc -l poema.txt` → cuenta líneas
2. Ejecuta `wc -w poema.txt` → cuenta palabras
3. Ejecuta `grep 'error' log.txt | tee errores_capturados.txt` → bifurca
4. Ejecuta `cat errores_capturados.txt` → verifica que se guardó""",
        "goal_description": "Usar wc para contar líneas/palabras/bytes y tee para bifurcar la salida de comandos hacia pantalla y archivo simultáneamente.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/poema.txt", "content": "En el principio fue la terminal\ny el sysadmin dijo ls\ny vio que el directorio estaba vacío\ny creó archivos con touch\ny los organizó con mv\ny los protegió con chmod\ny así fue el primer día de trabajo"},
                {"path": "/home/student/log.txt", "content": "\n".join([
                    f"2024-01-{i:02d} {'error' if i%3==0 else 'info'}: evento {i}"
                    for i in range(1, 21)
                ])}
            ]
        }),
        "validation_command": "wc -l /home/student/poema.txt | awk '{print $1}'",
        "expected_result": "7",
        "challenges": [
            {
                "id": "CL45_C1",
                "title": "Cuenta líneas, palabras y bytes del poema",
                "description": "Usa wc sin opciones para ver las estadísticas completas de poema.txt (líneas, palabras, bytes).",
                "v_type": "file_exists_in_directory",
                "v_value": "poema.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 25,
                "hints": "Usa: wc poema.txt|Sin opciones muestra: líneas palabras bytes nombre"
            },
            {
                "id": "CL45_C2",
                "title": "Guarda los errores del log usando tee",
                "description": "Usa grep + tee para filtrar las líneas con 'error' de log.txt y guardarlas en errores.txt mientras las ves en pantalla.",
                "v_type": "file_created",
                "v_value": "errores.txt",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 45,
                "hints": "Usa: grep 'error' log.txt | tee errores.txt|tee envía la salida a pantalla Y al archivo"
            }
        ]
    },
    {
        "order_index": 6,
        "title": "Mi Primer Script Bash",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 185,
        "time_limit": 35,
        "description": """## Teoría: Programación Bash — Fundamentos

Un script Bash es un archivo de texto con comandos que se ejecutan en secuencia.

### Estructura de un script
```bash
#!/bin/bash
# Este es un comentario
# La primera línea (shebang) indica qué intérprete usar

echo "Hola desde mi script"
```

### Variables
```bash
nombre="Linux"              # Sin espacios alrededor del =
echo $nombre                # → Linux
echo "Hola $nombre"         # → Hola Linux
echo "Hola ${nombre}!"      # Con llaves para claridad

# Variables especiales
echo $0     # Nombre del script
echo $1     # Primer argumento
echo $2     # Segundo argumento
echo $#     # Número de argumentos
echo $@     # Todos los argumentos
echo $?     # Código de salida del último comando (0=éxito)
echo $$     # PID del script actual
```

### Aritmética
```bash
resultado=$((10 + 5))        # Aritmética: resultado=15
echo $((2 ** 8))             # Potencia: 256
echo $((100 / 3))            # División entera: 33
let contador=contador+1      # Incrementar
((contador++))               # Incrementar (alternativa)
```

### Entrada del usuario
```bash
read nombre                  # Lee una línea y la guarda en $nombre
read -p "¿Tu nombre? " nombre  # Con mensaje
read -s contraseña           # Sin eco (para contraseñas)
```

### Ejecutar el script
```bash
chmod +x mi_script.sh        # Dar permiso de ejecución
./mi_script.sh               # Ejecutar
bash mi_script.sh            # Alternativa sin chmod
./mi_script.sh arg1 arg2     # Con argumentos
```

### Ejemplo completo
```bash
#!/bin/bash
# Script de información del sistema
echo "=== INFO DEL SISTEMA ==="
echo "Hostname: $(hostname)"
echo "Usuario: $(whoami)"
echo "Fecha: $(date)"
echo "Directorio: $(pwd)"
echo "Uptime: $(uptime -p)"
echo ""
echo "Uso de disco:"
df -h /
```

### Guía Paso a Paso
1. Crea el archivo: `nano mi_primer_script.sh`
2. Escribe el shebang: `#!/bin/bash`
3. Añade comandos echo y variables
4. Guarda: Ctrl+O, Enter, Ctrl+X
5. Ejecuta: `chmod +x mi_primer_script.sh && ./mi_primer_script.sh`""",
        "goal_description": "Crear y ejecutar scripts bash básicos con variables, aritmética y comandos encadenados para automatizar tareas simples.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/plantilla.sh", "content": "#!/bin/bash\n# Mi primer script\n# Completa las partes que faltan\n\nNOMBRE=\"ESCRIBE_TU_NOMBRE\"\necho \"Hola, $NOMBRE\"\necho \"Fecha: $(date)\"\n# Añade más comandos aquí"}
            ]
        }),
        "validation_command": "test -x /home/student/mi_script.sh && echo ok || echo missing",
        "expected_result": "ok",
        "challenges": [
            {
                "id": "CL46_C1",
                "title": "Crea y ejecuta mi_script.sh",
                "description": "Crea un script llamado mi_script.sh que imprima al menos: el hostname, el usuario actual y la fecha. Dale permisos de ejecución y ejecútalo.",
                "v_type": "permission_set",
                "v_value": "755",
                "v_extra": "/home/student/mi_script.sh",
                "order_index": 1,
                "xp": 75,
                "hints": "1. nano mi_script.sh  2. Escribe #!/bin/bash y los comandos  3. Ctrl+O, Enter, Ctrl+X  4. chmod +x mi_script.sh  5. ./mi_script.sh"
            }
        ]
    },
    {
        "order_index": 7,
        "title": "Condicionales en Bash: if/then/else",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 190,
        "time_limit": 35,
        "description": """## Teoría: Condicionales en Bash

### Estructura if/elif/else
```bash
if [ condición ]; then
    comandos
elif [ otra_condición ]; then
    otros_comandos
else
    comandos_por_defecto
fi
```

### Comparaciones de números
```bash
[ $a -eq $b ]    # igual
[ $a -ne $b ]    # no igual
[ $a -gt $b ]    # mayor que (greater than)
[ $a -ge $b ]    # mayor o igual (greater or equal)
[ $a -lt $b ]    # menor que (less than)
[ $a -le $b ]    # menor o igual (less or equal)
```

### Comparaciones de cadenas
```bash
[ "$a" = "$b" ]     # iguales
[ "$a" != "$b" ]    # distintas
[ -z "$a" ]         # cadena vacía
[ -n "$a" ]         # cadena NO vacía
```

### Comprobaciones de archivos
```bash
[ -f archivo ]     # existe y es un archivo regular
[ -d directorio ]  # existe y es un directorio
[ -e ruta ]        # existe (cualquier tipo)
[ -r archivo ]     # existe y es legible
[ -w archivo ]     # existe y es escribible
[ -x archivo ]     # existe y es ejecutable
[ -s archivo ]     # existe y tiene tamaño > 0
```

### Operadores lógicos
```bash
[ cond1 ] && [ cond2 ]     # AND
[ cond1 ] || [ cond2 ]     # OR
! [ condición ]             # NOT

# O dentro de [[ ]]
[[ cond1 && cond2 ]]
[[ cond1 || cond2 ]]
```

### Ejemplo completo
```bash
#!/bin/bash
ARCHIVO="config.conf"

if [ -f "$ARCHIVO" ]; then
    echo "El archivo $ARCHIVO existe"
    if [ -r "$ARCHIVO" ]; then
        echo "Y es legible"
    else
        echo "Pero no es legible"
    fi
else
    echo "El archivo $ARCHIVO NO existe"
fi
```

### Códigos de salida
```bash
echo $?     # 0 = éxito, 1-255 = error

if grep -q "admin" /etc/passwd; then
    echo "El usuario admin existe"
fi
```

### Guía Paso a Paso
1. Crea un script que verifique si existe un archivo
2. Usa `[ -f archivo ]` como condición
3. Añade mensajes con echo para cada caso
4. Prueba con un archivo existente y uno inexistente""",
        "goal_description": "Programar condicionales en bash con if/elif/else para tomar decisiones basadas en el estado de archivos, números y cadenas.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/config.conf", "content": "host=localhost\nport=8080"},
                {"path": "/home/student/plantilla_if.sh", "content": "#!/bin/bash\n# Completa este script\n# Debe verificar si config.conf existe\n# y mostrar un mensaje apropiado\n\nARCHIVO=\"config.conf\"\n\n# Escribe aquí el if/else\n# if [ CONDICIÓN ]; then\n#   echo \"Existe\"\n# else\n#   echo \"No existe\"\n# fi"}
            ]
        }),
        "validation_command": "test -x /home/student/comprueba.sh && echo ok || echo missing",
        "expected_result": "ok",
        "challenges": [
            {
                "id": "CL47_C1",
                "title": "Script que verifica existencia de archivos",
                "description": "Crea comprueba.sh que recibe un nombre de archivo como argumento ($1) y muestra si existe o no. Hazlo ejecutable.",
                "v_type": "permission_set",
                "v_value": "755",
                "v_extra": "/home/student/comprueba.sh",
                "order_index": 1,
                "xp": 75,
                "hints": "El script debe usar: if [ -f \"$1\" ]; then echo 'existe'; else echo 'no existe'; fi|Hazlo ejecutable con chmod +x"
            }
        ]
    },
    {
        "order_index": 8,
        "title": "Bucles en Bash: for y while",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 195,
        "time_limit": 35,
        "description": """## Teoría: Bucles en Bash

### Bucle `for` — Iterar sobre listas
```bash
# Sobre lista de valores
for elemento in uno dos tres; do
    echo "Elemento: $elemento"
done

# Sobre archivos (glob)
for archivo in *.txt; do
    echo "Procesando: $archivo"
    wc -l "$archivo"
done

# Rango numérico
for i in {1..10}; do
    echo "Número: $i"
done

# Rango con paso
for i in {0..20..5}; do     # 0, 5, 10, 15, 20
    echo "$i"
done

# Estilo C
for ((i=0; i<5; i++)); do
    echo "i=$i"
done
```

### Bucle `while` — Mientras condición sea verdadera
```bash
contador=0
while [ $contador -lt 5 ]; do
    echo "Contador: $contador"
    ((contador++))
done

# Leer archivo línea por línea
while read linea; do
    echo "Línea: $linea"
done < fichero.txt

# Bucle infinito con break
while true; do
    echo "Tic"
    sleep 1
    # Alguna condición de salida
    break
done
```

### `until` — Hasta que la condición sea verdadera
```bash
until [ $contador -ge 5 ]; do
    echo "$contador"
    ((contador++))
done
```

### `break` y `continue`
```bash
for i in {1..10}; do
    [ $i -eq 5 ] && break      # Salir del bucle en 5
    [ $i -eq 3 ] && continue   # Saltar la iteración 3
    echo $i
done
# Output: 1 2 4
```

### Ejemplo real: procesar archivos
```bash
#!/bin/bash
# Hacer backup de todos los .conf
for conf in /home/student/*.conf; do
    cp "$conf" "${conf}.bak"
    echo "Backup creado: ${conf}.bak"
done

# Contar líneas en todos los txt
total=0
for txt in /home/student/*.txt; do
    lineas=$(wc -l < "$txt")
    total=$((total + lineas))
    echo "$txt: $lineas líneas"
done
echo "Total: $total líneas"
```

### Guía Paso a Paso
1. Escribe un bucle for que imprima números del 1 al 5
2. Escribe un bucle for que itere sobre archivos *.conf
3. Usa while para leer un archivo línea por línea
4. Combina con condicionales: if dentro del for""",
        "goal_description": "Programar bucles for y while en bash para iterar sobre listas, rangos numéricos y archivos, automatizando tareas repetitivas.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/lista_servidores.txt", "content": "web01\nweb02\nweb03\ndb01\ndb02"},
                {"path": "/home/student/app.conf", "content": "host=localhost"},
                {"path": "/home/student/db.conf", "content": "db=postgres"},
                {"path": "/home/student/cache.conf", "content": "cache=redis"}
            ]
        }),
        "validation_command": "test -x /home/student/bucle.sh && echo ok || echo missing",
        "expected_result": "ok",
        "challenges": [
            {
                "id": "CL48_C1",
                "title": "Script que itera sobre servidores",
                "description": "Crea bucle.sh que lea lista_servidores.txt línea por línea e imprima 'Verificando: [servidor]' para cada uno. Hazlo ejecutable.",
                "v_type": "permission_set",
                "v_value": "755",
                "v_extra": "/home/student/bucle.sh",
                "order_index": 1,
                "xp": 75,
                "hints": "Usa: while read servidor; do echo \"Verificando: $servidor\"; done < lista_servidores.txt"
            }
        ]
    },
    {
        "order_index": 9,
        "title": "Funciones en Bash y Manejo de Errores",
        "difficulty": "hard",
        "category": "Linux",
        "xp_reward": 210,
        "time_limit": 40,
        "description": """## Teoría: Funciones y Manejo de Errores en Bash

### Definir y llamar funciones
```bash
# Definición (sin paréntesis en la llamada)
mi_funcion() {
    echo "Soy una función"
    echo "Argumento 1: $1"
    echo "Argumento 2: $2"
}

# Llamada
mi_funcion "hola" "mundo"
```

### Retornar valores
```bash
# Código de retorno (0-255)
funcion_con_retorno() {
    [ -f "$1" ] && return 0 || return 1
}

# Retornar cadenas (via echo)
obtener_fecha() {
    echo $(date +%Y%m%d)
}
fecha=$(obtener_fecha)
echo "Fecha: $fecha"
```

### Variables locales
```bash
nombre="global"
mi_funcion() {
    local nombre="local"    # Solo existe dentro de la función
    echo "Dentro: $nombre"  # → local
}
mi_funcion
echo "Fuera: $nombre"       # → global
```

### Manejo de errores con `set`
```bash
#!/bin/bash
set -e          # Salir si cualquier comando falla
set -u          # Error si se usa variable no definida
set -o pipefail # Error si algún pipe falla
set -euo pipefail  # Los tres juntos (buena práctica)
```

### Trap — Capturar señales
```bash
# Limpiar al salir (normal o por error)
cleanup() {
    echo "Limpiando archivos temporales..."
    rm -f /tmp/mi_script_*.tmp
}
trap cleanup EXIT

# Capturar Ctrl+C
trap 'echo "Interrumpido por el usuario"; exit 1' INT
```

### Validar argumentos
```bash
#!/bin/bash
# Verificar que se pasaron los argumentos necesarios
if [ $# -ne 2 ]; then
    echo "Uso: $0 <origen> <destino>"
    echo "Ejemplo: $0 /home/student /backup"
    exit 1
fi
```

### Ejemplo completo con funciones
```bash
#!/bin/bash
set -euo pipefail

log() {
    echo "[$(date +%H:%M:%S)] $1"
}

backup() {
    local origen="$1"
    local destino="$2"
    if [ ! -d "$origen" ]; then
        log "ERROR: El directorio $origen no existe"
        return 1
    fi
    cp -r "$origen" "$destino"
    log "Backup completado: $origen → $destino"
}

log "Iniciando backup..."
backup /home/student /tmp/backup_student
log "Proceso finalizado"
```

### Guía Paso a Paso
1. Crea una función `verificar_archivo()`
2. La función recibe un nombre de archivo como $1
3. Usa if para comprobar si existe
4. Retorna 0 si existe, 1 si no
5. Llama a la función y usa $? para ver el resultado""",
        "goal_description": "Programar funciones reutilizables en bash con manejo de argumentos, variables locales y control de errores para scripts robustos.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/datos_entrada.txt", "content": "usuario1,admin,activo\nusuario2,devs,inactivo\nusuario3,ops,activo\nusuario4,admin,activo"},
                {"path": "/home/student/plantilla_funciones.sh", "content": "#!/bin/bash\n\n# Función de log\nlog() {\n    echo \"[$(date +%H:%M:%S)] $1\"\n}\n\n# Completa esta función:\ncontar_activos() {\n    # Recibe un archivo CSV como $1\n    # Debe contar las líneas con 'activo' en la tercera columna\n    # Pista: usa grep -c\n    local archivo=\"$1\"\n    # TU CÓDIGO AQUÍ\n}\n\nlog 'Analizando datos...'\n# Llama a la función con datos_entrada.txt"}
            ]
        }),
        "validation_command": "test -x /home/student/mi_funcion.sh && echo ok || echo missing",
        "expected_result": "ok",
        "challenges": [
            {
                "id": "CL49_C1",
                "title": "Crea un script con funciones",
                "description": "Crea mi_funcion.sh con al menos una función que: reciba un argumento, realice una operación (como contar líneas de un archivo o verificar su existencia) y muestre el resultado. Hazlo ejecutable.",
                "v_type": "permission_set",
                "v_value": "755",
                "v_extra": "/home/student/mi_funcion.sh",
                "order_index": 1,
                "xp": 80,
                "hints": "Estructura mínima: mi_funcion() { echo $1; } | mi_funcion 'argumento'|Hazlo ejecutable: chmod +x mi_funcion.sh"
            }
        ]
    },
    {
        "order_index": 10,
        "title": "Proyecto Final: Script de Administración del Sistema",
        "difficulty": "hard",
        "category": "Linux",
        "xp_reward": 250,
        "time_limit": 60,
        "description": """## Proyecto Final: Script Completo de Sysadmin

En este laboratorio final integras todo lo aprendido para crear un script de administración real.

### Objetivos del script
El script `sysadmin.sh` debe:
1. Mostrar información del sistema (hostname, uptime, fecha)
2. Mostrar uso de disco y memoria
3. Listar los 5 procesos que más CPU consumen
4. Verificar que ciertos directorios/archivos existen
5. Contar errores en un log
6. Generar un informe en /tmp/informe_sistema.txt

### Estructura propuesta
```bash
#!/bin/bash
# Script de Administración del Sistema
# Autor: $(whoami)
# Fecha: $(date +%Y-%m-%d)

set -euo pipefail

# ── Configuración ──────────────────────────────
INFORME="/tmp/informe_sistema.txt"
LOG_APP="/home/student/app.log"

# ── Funciones ──────────────────────────────────
header() {
    echo ""
    echo "══════════════════════════════"
    echo "  $1"
    echo "══════════════════════════════"
}

log() {
    echo "[$(date +%H:%M:%S)] $*"
}

verificar_archivo() {
    if [ -f "$1" ]; then
        echo "  ✅ Existe: $1"
    else
        echo "  ❌ No existe: $1"
    fi
}

# ── Inicio ─────────────────────────────────────
{
    header "INFORME DEL SISTEMA"
    echo "Generado: $(date)"
    echo "Hostname: $(hostname)"
    echo "Usuario: $(whoami)"
    echo "Uptime: $(uptime -p)"

    header "USO DE DISCO"
    df -h /

    header "MEMORIA"
    free -h

    header "TOP 5 PROCESOS (CPU)"
    ps aux --sort=-%cpu | head -6

    header "VERIFICACIÓN DE ARCHIVOS"
    verificar_archivo "/home/student/app.log"
    verificar_archivo "/etc/passwd"
    verificar_archivo "/home/student/inexistente.txt"

    header "ANÁLISIS DE ERRORES"
    if [ -f "$LOG_APP" ]; then
        num_errores=$(grep -c 'ERROR' "$LOG_APP" 2>/dev/null || echo "0")
        echo "  Errores encontrados: $num_errores"
        if [ "$num_errores" -gt 0 ]; then
            echo "  Últimos errores:"
            grep 'ERROR' "$LOG_APP" | tail -3
        fi
    fi

} | tee "$INFORME"

log "Informe guardado en: $INFORME"
```

### Técnicas integradas en este script
- Variables y sustitución de comandos `$()`
- Funciones con argumentos locales
- Condicionales `if/else`
- Redirección y `tee`
- `grep`, `ps`, `df`, `free`, `wc`
- `set -euo pipefail` para manejo de errores
- Bloques de código con `{ }`

### Guía Paso a Paso
1. Crea el archivo: `nano sysadmin.sh`
2. Añade el shebang y el bloque set
3. Implementa las funciones header, log, verificar_archivo
4. Añade cada sección del informe
5. Dale permisos: `chmod +x sysadmin.sh`
6. Ejecútalo: `./sysadmin.sh`
7. Verifica el informe: `cat /tmp/informe_sistema.txt`""",
        "goal_description": "Crear un script bash completo de administración del sistema que integre variables, funciones, condicionales, bucles, grep, awk y redirección en un proyecto real.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/app.log", "content": "\n".join([
                    "2024-01-10 09:00:00 INFO: Sistema iniciado",
                    "2024-01-10 09:05:00 ERROR: Timeout en conexión",
                    "2024-01-10 09:10:00 INFO: Reintentando...",
                    "2024-01-10 09:15:00 ERROR: Base de datos no responde",
                    "2024-01-10 09:20:00 INFO: Conexión restaurada"
                ])}
            ]
        }),
        "validation_command": "test -x /home/student/sysadmin.sh && echo ok || echo missing",
        "expected_result": "ok",
        "challenges": [
            {
                "id": "CL50_C1",
                "title": "Crea el script sysadmin.sh completo",
                "description": "Crea sysadmin.sh que muestre: hostname, uso de disco (df -h), memoria (free -h) y cuente los errores en app.log. Guarda el output en /tmp/informe_sistema.txt con tee. Hazlo ejecutable.",
                "v_type": "permission_set",
                "v_value": "755",
                "v_extra": "/home/student/sysadmin.sh",
                "order_index": 1,
                "xp": 100,
                "hints": "Estructura: #!/bin/bash | hostname | df -h | free -h | grep -c ERROR app.log | Usa tee al final para guardar | chmod +x sysadmin.sh"
            },
            {
                "id": "CL50_C2",
                "title": "Ejecuta el script y genera el informe",
                "description": "Ejecuta sysadmin.sh para que genere el informe en /tmp/informe_sistema.txt. Verifica que el archivo existe.",
                "v_type": "file_created",
                "v_value": "informe_sistema.txt",
                "v_extra": "/tmp",
                "order_index": 2,
                "xp": 80,
                "hints": "Ejecuta: ./sysadmin.sh|Verifica: cat /tmp/informe_sistema.txt"
            }
        ]
    }
]


def seed_part3():
    db = SessionLocal()
    create_tables()

    claude_path = db.query(SkillPath).filter(SkillPath.title == "Claude Labs").first()
    if not claude_path:
        print("❌ ERROR: Skill Path 'Claude Labs' no encontrado. Ejecuta primero los scripts part1 y part2.")
        db.close()
        return

    m5 = db.query(Module).filter(Module.title == "CL-M5 — Texto y Scripting Bash").first()
    if not m5:
        m5 = Module(
            skill_path_id=claude_path.id,
            title="CL-M5 — Texto y Scripting Bash",
            description="Procesa texto como un profesional con grep, sed y awk. Crea tus propios scripts bash con variables, condicionales, bucles y funciones.",
            order_index=5
        )
        db.add(m5)
        db.commit()
        db.refresh(m5)
        print(f"✅ Módulo 5 creado (id={m5.id})")
    else:
        print(f"ℹ️  Módulo 5 ya existe (id={m5.id})")

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

    print("\n📦 Insertando Módulo 5 — Texto y Scripting Bash...")
    insert_labs(m5, M5_LABS)

    db.close()
    print("\n🎉 Parte 3 completada: 10 labs insertados (Módulo 5)")


if __name__ == "__main__":
    seed_part3()
