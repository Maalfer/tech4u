"""
seed_bash_part2.py
Bash Scripting Path — Parte 2
M3: Funciones y Arrays en Bash (8 labs)
M4: Procesamiento de Texto con grep/sed/awk (8 labs)
Run: cd backend && source venv/bin/activate && python3 scripts/seed_bash_part2.py
"""

import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, SkillPath, Module, Lab

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

# ─── M3: Funciones y Arrays ──────────────────────────────────────────────────

M3_LABS = [
    {
        "title": "Funciones: Definición y Alcance",
        "description": "Aprende a declarar funciones en Bash, entender el scope de variables (local vs global) y reutilizar lógica en tus scripts.",
        "difficulty": "beginner",
        "duration_minutes": 30,
        "xp_reward": 100,
        "learning_objectives": [
            "Declarar y llamar funciones en Bash",
            "Entender local vs global scope",
            "Retornar valores desde funciones",
            "Pasar argumentos a funciones"
        ],
        "commands": ["function", "local", "return", "declare"],
        "guide_markdown": """# Funciones en Bash: Definición y Alcance

## ¿Por qué usar funciones?

Las funciones permiten:
- **Reutilizar código** sin copiar y pegar
- **Organizar scripts** en bloques lógicos
- **Facilitar el testing** de partes individuales
- **Reducir errores** al centralizar la lógica

---

## Sintaxis de declaración

Bash acepta dos sintaxis equivalentes:

```bash
# Sintaxis 1 (más portátil)
saludar() {
    echo "Hola, $1"
}

# Sintaxis 2 (más explícita)
function saludar {
    echo "Hola, $1"
}
```

---

## Argumentos posicionales

Dentro de una función, `$1`, `$2`... representan los argumentos de la función (no del script principal):

```bash
suma() {
    local resultado=$(( $1 + $2 ))
    echo "$resultado"
}

total=$(suma 15 27)
echo "15 + 27 = $total"
```

---

## Scope: local vs global

```bash
#!/usr/bin/env bash

GLOBAL="visible en todo el script"

mi_funcion() {
    local LOCAL="solo dentro de la función"
    GLOBAL="modificada desde función"
    echo "Dentro: LOCAL='$LOCAL', GLOBAL='$GLOBAL'"
}

mi_funcion
echo "Fuera: GLOBAL='$GLOBAL'"
echo "Fuera: LOCAL='$LOCAL'"   # vacío — no existe aquí
```

**Salida:**
```
Dentro: LOCAL='solo dentro de la función', GLOBAL='modificada desde función'
Fuera: GLOBAL='modificada desde función'
Fuera: LOCAL=''
```

---

## Retornar valores

`return` solo devuelve un código numérico (0–255). Para devolver texto usa `echo` + sustitución de comandos:

```bash
get_hostname() {
    echo "$(hostname)"
}

es_root() {
    [[ $EUID -eq 0 ]]   # return implícito: 0 si root, 1 si no
}

HOST=$(get_hostname)
echo "Servidor: $HOST"

if es_root; then
    echo "Ejecutando como root"
else
    echo "Usuario normal"
fi
```

---

## Ejemplo completo

```bash
#!/usr/bin/env bash
set -euo pipefail

log() {
    local level="$1"
    shift
    echo "[$(date '+%H:%M:%S')] [$level] $*"
}

validar_numero() {
    local n="$1"
    [[ "$n" =~ ^[0-9]+$ ]]
}

calcular_factorial() {
    local n="$1"
    if ! validar_numero "$n"; then
        log ERROR "'$n' no es un número válido"
        return 1
    fi
    local resultado=1
    for (( i=2; i<=n; i++ )); do
        resultado=$(( resultado * i ))
    done
    echo "$resultado"
}

log INFO "Calculando factorial de 7..."
fact=$(calcular_factorial 7)
log INFO "7! = $fact"
```

---

## Práctica

1. Crea `funciones_scope.sh` con la función `log()` del ejemplo
2. Añade una función `es_par()` que recibe un número y retorna 0 si es par
3. Añade una función `abs()` que retorna el valor absoluto de un número
4. Prueba las tres funciones en el `main` del script
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Función log() con timestamp",
                "description": "Crea una función log() que muestre [HH:MM:SS] [NIVEL] mensaje. Llámala con niveles INFO, WARN y ERROR.",
                "hint": "Usa date '+%H:%M:%S' dentro de la función con local timestamp=$(date '+%H:%M:%S')",
                "validation_command": "bash funciones_scope.sh 2>&1 | grep -E '\\[INFO\\]|\\[WARN\\]|\\[ERROR\\]'",
                "expected_output_contains": "[INFO]"
            }
        ]
    },
    {
        "title": "Arrays: Indexados y Asociativos",
        "description": "Domina los arrays de Bash: arrays indexados para listas y arrays asociativos (mapas clave-valor) para estructuras más complejas.",
        "difficulty": "beginner",
        "duration_minutes": 35,
        "xp_reward": 110,
        "learning_objectives": [
            "Crear y manipular arrays indexados",
            "Usar arrays asociativos como mapas",
            "Iterar sobre arrays con for",
            "Slicing y operaciones de array"
        ],
        "commands": ["declare -a", "declare -A", "${arr[@]}", "${#arr[@]}", "unset"],
        "guide_markdown": """# Arrays en Bash: Indexados y Asociativos

## Arrays Indexados

```bash
# Declaración
frutas=("manzana" "pera" "uva" "kiwi")

# Acceso por índice (empieza en 0)
echo "${frutas[0]}"    # manzana
echo "${frutas[2]}"    # uva

# Todos los elementos
echo "${frutas[@]}"    # manzana pera uva kiwi

# Número de elementos
echo "${#frutas[@]}"   # 4

# Modificar un elemento
frutas[1]="naranja"

# Añadir al final
frutas+=("mango")

# Eliminar un elemento
unset 'frutas[2]'
```

---

## Iterar sobre arrays

```bash
# Iterar por valor
for fruta in "${frutas[@]}"; do
    echo "Fruta: $fruta"
done

# Iterar por índice
for i in "${!frutas[@]}"; do
    echo "[$i] = ${frutas[$i]}"
done
```

---

## Slicing

```bash
numeros=(10 20 30 40 50 60)

# Desde posición 2
echo "${numeros[@]:2}"       # 30 40 50 60

# Desde posición 1, longitud 3
echo "${numeros[@]:1:3}"     # 20 30 40
```

---

## Arrays Asociativos (Bash 4+)

```bash
declare -A colores
colores["rojo"]="#FF0000"
colores["verde"]="#00FF00"
colores["azul"]="#0000FF"

# Acceso
echo "${colores["rojo"]}"

# Todas las claves
echo "${!colores[@]}"

# Todos los valores
echo "${colores[@]}"

# Comprobar si clave existe
if [[ -v colores["morado"] ]]; then
    echo "morado existe"
else
    echo "morado no definido"
fi
```

---

## Caso de uso: inventario con asociativo

```bash
#!/usr/bin/env bash
declare -A inventario

inventario["cpu"]="AMD Ryzen 9"
inventario["ram"]="32GB DDR5"
inventario["disco"]="2TB NVMe"
inventario["gpu"]="RTX 4080"

echo "=== Inventario del servidor ==="
for componente in "${!inventario[@]}"; do
    printf "%-10s : %s\\n" "$componente" "${inventario[$componente]}"
done
```

---

## Funciones que trabajan con arrays

```bash
# Pasar array por "nameref" (Bash 4.3+)
mostrar_array() {
    local -n arr_ref="$1"   # nameref
    for elem in "${arr_ref[@]}"; do
        echo "  - $elem"
    done
}

mi_lista=("alpha" "beta" "gamma")
mostrar_array mi_lista
```

---

## Práctica

1. Crea un array con los días de la semana
2. Muestra solo los días laborables (lunes–viernes) usando slicing
3. Crea un array asociativo con 5 comandos Linux y su descripción
4. Escribe una función `buscar_en_array()` que recibe un valor y un array y retorna si existe
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Inventario con array asociativo",
                "description": "Crea un script con un array asociativo de 5 paquetes instalados con su versión. Muéstralos ordenados.",
                "hint": "Usa declare -A paquetes y para ordenar: for key in $(echo \"${!paquetes[@]}\" | tr ' ' '\\n' | sort)",
                "validation_command": "bash inventario.sh 2>&1 | wc -l",
                "expected_output_contains": "5"
            }
        ]
    },
    {
        "title": "Recursividad y Funciones Avanzadas",
        "description": "Implementa funciones recursivas en Bash, maneja referencias a arrays (namerefs) y crea bibliotecas de funciones reutilizables.",
        "difficulty": "intermediate",
        "duration_minutes": 40,
        "xp_reward": 130,
        "learning_objectives": [
            "Implementar recursividad en Bash",
            "Usar namerefs para pasar arrays por referencia",
            "Crear y sourcea bibliotecas de funciones",
            "Memoizar resultados con arrays asociativos"
        ],
        "commands": ["local -n", "source", ".", "declare -g"],
        "guide_markdown": """# Recursividad y Funciones Avanzadas

## Funciones Recursivas

Bash soporta recursividad, pero tiene límite de pila (~1000 niveles):

```bash
#!/usr/bin/env bash

factorial() {
    local n="$1"
    if (( n <= 1 )); then
        echo 1
        return
    fi
    local sub=$(factorial $(( n - 1 )))
    echo $(( n * sub ))
}

echo "5! = $(factorial 5)"
echo "10! = $(factorial 10)"
```

---

## Fibonacci con memoización

```bash
#!/usr/bin/env bash
declare -A _fib_cache

fib() {
    local n="$1"
    (( n <= 1 )) && echo "$n" && return

    if [[ -v _fib_cache[$n] ]]; then
        echo "${_fib_cache[$n]}"
        return
    fi

    local a=$(fib $(( n - 1 )))
    local b=$(fib $(( n - 2 )))
    local result=$(( a + b ))
    _fib_cache[$n]=$result
    echo "$result"
}

for i in {0..15}; do
    printf "fib(%2d) = %d\\n" "$i" "$(fib $i)"
done
```

---

## Namerefs (paso por referencia)

```bash
# Modificar un array dentro de una función
rellenar_array() {
    local -n _array="$1"   # -n crea una referencia
    local count="$2"
    _array=()
    for (( i=1; i<=count; i++ )); do
        _array+=("item_$i")
    done
}

declare -a mis_datos
rellenar_array mis_datos 5
echo "${mis_datos[@]}"   # item_1 item_2 item_3 item_4 item_5
```

---

## Bibliotecas de funciones

Crea `lib/utils.sh`:

```bash
#!/usr/bin/env bash
# lib/utils.sh — Biblioteca de utilidades comunes

RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m'   # No Color

log_info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

is_number() { [[ "$1" =~ ^-?[0-9]+$ ]]; }

require_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script requiere privilegios de root"
        exit 1
    fi
}

confirm() {
    local prompt="${1:-¿Continuar?} [s/N] "
    read -r -p "$prompt" resp
    [[ "$resp" =~ ^[sS]$ ]]
}
```

Uso en otro script:

```bash
#!/usr/bin/env bash
source "$(dirname "$0")/lib/utils.sh"

log_info "Iniciando proceso..."
if confirm "¿Deseas continuar?"; then
    log_info "Continuando..."
else
    log_warn "Operación cancelada"
fi
```

---

## Práctica

1. Implementa `hanoi()` — la Torre de Hanoi recursiva que muestre los movimientos
2. Crea `lib/math.sh` con funciones: `max()`, `min()`, `is_prime()`, `gcd()`
3. Escribe un script que importe la biblioteca y la use para calcular el MCD de dos números ingresados
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Torre de Hanói recursiva",
                "description": "Implementa hanoi(n, origen, destino, auxiliar) que imprima cada movimiento. Prueba con n=3.",
                "hint": "hanoi n A C B: mover n-1 de A a B via C, luego A→C, luego n-1 de B a C via A",
                "validation_command": "bash hanoi.sh 3 2>&1 | wc -l",
                "expected_output_contains": "7"
            }
        ]
    },
    {
        "title": "Mapeo y Filtrado con Arrays",
        "description": "Implementa operaciones funcionales (map, filter, reduce) usando arrays de Bash. Aprende patrones para transformar colecciones de datos.",
        "difficulty": "intermediate",
        "duration_minutes": 35,
        "xp_reward": 120,
        "learning_objectives": [
            "Implementar map/filter/reduce en Bash",
            "Usar namerefs para operaciones funcionales",
            "Transformar arrays con funciones callback",
            "Filtrar elementos con condiciones"
        ],
        "commands": ["local -n", "${arr[@]}", "+=", "declare -a"],
        "guide_markdown": """# Mapeo y Filtrado con Arrays en Bash

## El patrón Map

Transforma cada elemento de un array aplicando una función:

```bash
#!/usr/bin/env bash

# map input_arr output_arr func
map() {
    local -n _src="$1"
    local -n _dst="$2"
    local func="$3"
    _dst=()
    for elem in "${_src[@]}"; do
        _dst+=("$($func "$elem")")
    done
}

doble() { echo $(( $1 * 2 )); }
mayusculas() { echo "${1^^}"; }

numeros=(1 2 3 4 5)
declare -a dobles
map numeros dobles doble
echo "Dobles: ${dobles[@]}"   # 2 4 6 8 10

palabras=("hola" "mundo" "bash")
declare -a mayus
map palabras mayus mayusculas
echo "Mayúsculas: ${mayus[@]}"   # HOLA MUNDO BASH
```

---

## El patrón Filter

Selecciona elementos que cumplen una condición:

```bash
filter() {
    local -n _src="$1"
    local -n _dst="$2"
    local pred="$3"
    _dst=()
    for elem in "${_src[@]}"; do
        if $pred "$elem"; then
            _dst+=("$elem")
        fi
    done
}

es_par() { (( $1 % 2 == 0 )); }
mayor_que_3() { (( $1 > 3 )); }

declare -a pares grandes
numeros=(1 2 3 4 5 6 7 8)
filter numeros pares es_par
echo "Pares: ${pares[@]}"       # 2 4 6 8
filter numeros grandes mayor_que_3
echo ">3: ${grandes[@]}"        # 4 5 6 7 8
```

---

## El patrón Reduce

Combina todos los elementos en un único valor:

```bash
reduce() {
    local -n _src="$1"
    local func="$2"
    local acum="${3:-0}"
    for elem in "${_src[@]}"; do
        acum=$($func "$acum" "$elem")
    done
    echo "$acum"
}

sumar() { echo $(( $1 + $2 )); }
multiplicar() { echo $(( $1 * $2 )); }
mayor() { (( $1 > $2 )) && echo $1 || echo $2; }

numeros=(3 7 2 9 1 5)
echo "Suma:    $(reduce numeros sumar 0)"
echo "Product: $(reduce numeros multiplicar 1)"
echo "Máximo:  $(reduce numeros mayor 0)"
```

---

## Pipeline funcional

```bash
#!/usr/bin/env bash

numeros=($(seq 1 20))   # 1..20

# Filtrar pares
declare -a pares
filter numeros pares es_par

# Doblar cada uno
declare -a dobles_pares
map pares dobles_pares doble

# Sumar todo
total=$(reduce dobles_pares sumar 0)
echo "Suma de dobles de pares del 1-20: $total"
# = 2*(2+4+6+8+10+12+14+16+18+20) = 2*110 = 220
```

---

## Práctica

1. Crea `funcional.sh` con las funciones map, filter y reduce
2. Genera un array con los primeros 15 números de Fibonacci
3. Filtra los que son mayores de 50
4. Calcula el promedio (suma / cantidad) de los filtrados
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Pipeline funcional completo",
                "description": "Usa map+filter+reduce para: dado un array de palabras, filtrar las de más de 4 letras, convertirlas a mayúsculas y concatenarlas con coma.",
                "hint": "Para concatenar usa reduce con una función: concat() { [[ -z $1 ]] && echo \"$2\" || echo \"$1,$2\"; }",
                "validation_command": "bash pipeline.sh 2>&1",
                "expected_output_contains": ","
            }
        ]
    },
    {
        "title": "Manejo de Errores y Excepciones",
        "description": "Implementa manejo robusto de errores en Bash usando traps, códigos de retorno, funciones de cleanup y patrones de retry.",
        "difficulty": "intermediate",
        "duration_minutes": 45,
        "xp_reward": 140,
        "learning_objectives": [
            "Usar trap para manejo de señales",
            "Implementar cleanup automático",
            "Patrón retry con backoff exponencial",
            "Logging estructurado de errores"
        ],
        "commands": ["trap", "set -e", "set -u", "set -o pipefail", "ERR", "EXIT", "INT"],
        "guide_markdown": """# Manejo de Errores y Excepciones en Bash

## El trio: set -euo pipefail

```bash
#!/usr/bin/env bash
set -e          # exit on error
set -u          # error on undefined vars
set -o pipefail # pipe fails if any command fails
# o equivalente:
set -euo pipefail
```

---

## Trap: capturar señales y errores

```bash
#!/usr/bin/env bash
set -euo pipefail

TMPFILE=""

cleanup() {
    local exit_code=$?
    echo "Limpiando recursos..."
    [[ -n "$TMPFILE" && -f "$TMPFILE" ]] && rm -f "$TMPFILE"
    exit $exit_code
}

# Registrar cleanup para salidas normales e interrupciones
trap cleanup EXIT
trap 'echo "Interrupción recibida"; exit 130' INT TERM

TMPFILE=$(mktemp /tmp/myscript.XXXXXX)
echo "Trabajando con $TMPFILE"
# ... lógica del script ...
echo "datos importantes" > "$TMPFILE"
cat "$TMPFILE"
```

---

## Trap en ERR: registrar línea de fallo

```bash
#!/usr/bin/env bash
set -euo pipefail

on_error() {
    local exit_code=$?
    local line_number=$1
    echo "[ERROR] Falló en línea $line_number con código $exit_code" >&2
    echo "[STACK] Función: ${FUNCNAME[*]}" >&2
}

trap 'on_error $LINENO' ERR

comando_que_falla() {
    ls /ruta/que/no/existe   # falla aquí
}

comando_que_falla
```

---

## Patrón retry con backoff exponencial

```bash
retry() {
    local max_attempts="$1"
    local delay="$2"
    shift 2
    local cmd=("$@")

    local attempt=1
    while (( attempt <= max_attempts )); do
        if "${cmd[@]}"; then
            return 0
        fi
        echo "Intento $attempt/$max_attempts falló. Reintentando en ${delay}s..."
        sleep "$delay"
        delay=$(( delay * 2 ))   # backoff exponencial
        (( attempt++ ))
    done

    echo "Todos los intentos fallaron" >&2
    return 1
}

# Uso
retry 3 1 curl -s --fail https://mi-api.ejemplo.com/health
```

---

## Die con mensaje de error

```bash
die() {
    echo "[FATAL] $*" >&2
    exit 1
}

require_file() {
    [[ -f "$1" ]] || die "Archivo requerido no encontrado: $1"
}

require_command() {
    command -v "$1" &>/dev/null || die "Comando requerido no encontrado: $1"
}

require_command curl
require_command jq
require_file "/etc/mi_config.conf"
```

---

## Práctica

1. Crea `robusto.sh` con set -euo pipefail, trap de cleanup y función die()
2. Simula la creación de 3 archivos temporales que se borran automáticamente
3. Implementa la función retry() y úsala para hacer ping a google.com (máx 3 intentos)
4. Captura el error en un log cuando falle algún comando
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Script con cleanup automático",
                "description": "Crea un script que genere 3 archivos tmp, los liste, luego simule un error (exit 1). Verifica que el trap EXIT los elimina.",
                "hint": "Guarda los archivos en un array: TMPFILES=(). En cleanup: for f in \"${TMPFILES[@]}\"; do rm -f \"$f\"; done",
                "validation_command": "bash robusto.sh; ls /tmp/myscript.* 2>&1",
                "expected_output_contains": "No such file"
            }
        ]
    },
    {
        "title": "Strings y Manipulación de Texto",
        "description": "Domina las expansiones de parámetro de Bash para manipular strings sin invocar comandos externos: subcadenas, reemplazos, trimming y más.",
        "difficulty": "intermediate",
        "duration_minutes": 35,
        "xp_reward": 120,
        "learning_objectives": [
            "Usar expansiones de parámetro avanzadas",
            "Extraer subcadenas y longitudes",
            "Reemplazar y transformar strings",
            "Validar strings con patrones"
        ],
        "commands": ["${var:offset:length}", "${var//pattern/replace}", "${var^^}", "${var,,}", "${#var}"],
        "guide_markdown": """# Manipulación de Strings con Expansiones de Parámetro

## Longitud y subcadenas

```bash
texto="Administración de Sistemas Linux"
echo ${#texto}              # longitud: 32

# Subcadena: ${var:inicio:longitud}
echo "${texto:0:14}"        # Administración
echo "${texto:19}"          # Sistemas Linux
echo "${texto: -5}"         # Linux (desde el final, nota el espacio)
```

---

## Eliminar prefijos y sufijos

```bash
ruta="/home/usuario/documentos/informe.pdf"

# Eliminar prefijo más corto
echo "${ruta#*/}"           # home/usuario/documentos/informe.pdf

# Eliminar prefijo más largo (greedy)
echo "${ruta##*/}"          # informe.pdf   (basename)

# Eliminar sufijo más corto
echo "${ruta%/*}"           # /home/usuario/documentos   (dirname)

# Eliminar sufijo más largo
echo "${ruta%%/*}"          # (vacío — elimina desde primera /)
```

---

## Reemplazos

```bash
frase="el gato y el perro y el pez"

# Primera ocurrencia
echo "${frase/el/un}"           # un gato y el perro y el pez

# Todas las ocurrencias
echo "${frase//el/un}"          # un gato y un perro y un pez

# Reemplazar al inicio
echo "${frase/#el/un}"          # un gato y el perro y el pez

# Reemplazar al final
echo "${frase/%pez/delfín}"     # el gato y el perro y el delfín
```

---

## Transformaciones de case

```bash
var="hello WORLD bash"

echo "${var^^}"    # HELLO WORLD BASH  (todo mayúsculas)
echo "${var,,}"    # hello world bash  (todo minúsculas)
echo "${var^}"     # Hello WORLD bash  (primera letra mayúscula)
echo "${var,}"     # hello WORLD bash  (primera letra minúscula)
```

---

## Valores por defecto

```bash
# Usar valor por defecto si vacío
echo "${EDITOR:-nano}"          # nano si EDITOR no está definida

# Asignar y usar valor por defecto
echo "${TIMEOUT:=30}"           # asigna 30 si no definida

# Error si no definida
echo "${CONFIG_FILE:?'CONFIG_FILE es requerida'}"
```

---

## Funciones útiles de string

```bash
trim() {
    local str="$1"
    # Eliminar espacios iniciales
    str="${str#"${str%%[![:space:]]*}"}"
    # Eliminar espacios finales
    str="${str%"${str##*[![:space:]]}"}"
    echo "$str"
}

starts_with() { [[ "$1" == "$2"* ]]; }
ends_with()   { [[ "$1" == *"$2" ]]; }
contains()    { [[ "$1" == *"$2"* ]]; }

str="  hola mundo  "
echo "'$(trim "$str")'"    # 'hola mundo'

if contains "archivo.log.gz" ".log"; then
    echo "Es un archivo de log"
fi
```

---

## Práctica

1. Escribe una función `basename_sin_ext()` que extraiga solo el nombre sin extensión de una ruta completa
2. Escribe `to_snake_case()` que convierta "HolaMundoBash" → "hola_mundo_bash"
3. Escribe `truncar()` que acorte un string a N caracteres añadiendo "..." si se cortó
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Procesador de rutas de archivo",
                "description": "Crea un script que dada una ruta como '/home/user/docs/informe_final.tar.gz' extraiga: directorio, nombre, extensión base (.gz), nombre sin extensión.",
                "hint": "Usa ${ruta##*/} para nombre, ${nombre%%.*} para sin extensión, ${nombre#*.} para extensión",
                "validation_command": "bash rutas.sh '/home/user/docs/informe_final.tar.gz' 2>&1",
                "expected_output_contains": "informe_final"
            }
        ]
    },
    {
        "title": "Generación de Informes con Funciones",
        "description": "Combina funciones, arrays y strings para generar informes de sistema en texto plano y HTML directamente desde Bash.",
        "difficulty": "intermediate",
        "duration_minutes": 45,
        "xp_reward": 135,
        "learning_objectives": [
            "Generar informes estructurados con printf",
            "Crear reportes HTML con heredoc",
            "Recopilar métricas del sistema",
            "Formatear tablas en texto plano"
        ],
        "commands": ["printf", "heredoc <<EOF", "column", "tput", "wc", "uptime"],
        "guide_markdown": """# Generación de Informes con Funciones en Bash

## printf para formateo preciso

```bash
# Tabla con columnas alineadas
printf "%-20s %-10s %10s\\n" "PROCESO" "PID" "MEM(KB)"
printf "%-20s %-10s %10s\\n" "$(printf '%.0s-' {1..20})" "----------" "----------"

while IFS= read -r line; do
    name=$(echo "$line" | awk '{print $11}' | cut -d'/' -f1)
    pid=$(echo "$line" | awk '{print $1}')
    mem=$(echo "$line" | awk '{print $6}')
    printf "%-20s %-10s %10s\\n" "$name" "$pid" "$mem"
done < <(ps aux --sort=-%mem | head -6 | tail -5)
```

---

## Informe de sistema completo

```bash
#!/usr/bin/env bash
set -euo pipefail

# Colores
BOLD='\\033[1m'; CYAN='\\033[0;36m'; NC='\\033[0m'

header() {
    echo -e "\\n${BOLD}${CYAN}=== $* ===${NC}"
}

get_cpu_usage() {
    top -bn1 | grep "Cpu(s)" | awk '{print $2}' | tr -d '%us,'
}

get_mem_info() {
    free -h | awk '/^Mem:/ {printf "Usada: %s / Total: %s (Libre: %s)", $3, $2, $4}'
}

get_disk_info() {
    df -h / | awk 'NR==2 {printf "Usada: %s / Total: %s (%s usado)", $3, $2, $5}'
}

get_top_processes() {
    ps aux --sort=-%cpu | awk 'NR>1 && NR<=6 {printf "  %-8s %-6s %5s%%  %s\\n", $1, $2, $3, $11}'
}

generate_report() {
    echo "======================================"
    echo "  INFORME DE SISTEMA: $(hostname)"
    echo "  Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "======================================"

    header "SISTEMA"
    echo "  Uptime  : $(uptime -p)"
    echo "  Kernel  : $(uname -r)"
    echo "  OS      : $(. /etc/os-release && echo "$PRETTY_NAME")"

    header "CPU"
    echo "  Modelo  : $(grep 'model name' /proc/cpuinfo | head -1 | cut -d':' -f2 | xargs)"
    echo "  Cores   : $(nproc)"
    echo "  Uso     : $(get_cpu_usage)%"

    header "MEMORIA"
    echo "  $(get_mem_info)"

    header "DISCO"
    echo "  $(get_disk_info)"

    header "TOP 5 PROCESOS (CPU)"
    get_top_processes
}

generate_report
```

---

## Informe HTML con heredoc

```bash
generate_html_report() {
    local output="${1:-/tmp/informe.html}"
    local hostname mem_total mem_used disk_pct

    hostname=$(hostname)
    mem_total=$(free -m | awk '/^Mem:/ {print $2}')
    mem_used=$(free -m | awk '/^Mem:/ {print $3}')
    disk_pct=$(df / | awk 'NR==2 {print $5}' | tr -d '%')

    cat > "$output" <<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Informe $hostname</title>
<style>
  body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 2em; }
  h1   { color: #00d4ff; }
  .metric { background: #16213e; padding: 1em; margin: 0.5em 0; border-left: 4px solid #00d4ff; }
</style>
</head>
<body>
<h1>Informe: $hostname</h1>
<p>Generado: $(date)</p>
<div class="metric"><strong>RAM:</strong> ${mem_used}MB / ${mem_total}MB usada</div>
<div class="metric"><strong>Disco /:</strong> ${disk_pct}% usado</div>
</body>
</html>
HTML
    echo "Informe generado: $output"
}

generate_html_report "/tmp/sysreport.html"
```

---

## Práctica

1. Crea `sysreport.sh` que genere un informe de texto con todas las secciones del ejemplo
2. Añade una sección de "Últimas 5 líneas de /var/log/syslog" al informe
3. Añade un argumento `--html` para generar el informe en HTML
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Script de informe de sistema",
                "description": "Crea sysreport.sh que muestre: hostname, uptime, uso de CPU, uso de RAM y uso del disco raíz. Formateado como tabla.",
                "hint": "Usa printf '%-15s %s\\n' para alinear etiquetas y valores",
                "validation_command": "bash sysreport.sh 2>&1 | grep -i 'cpu\\|ram\\|disco\\|mem'",
                "expected_output_contains": "%"
            }
        ]
    },
    {
        "title": "Proyecto M3: Sistema de Plugins para Scripts",
        "description": "Proyecto integrador: crea un framework de plugins en Bash donde los scripts pueden cargar módulos opcionales, registrar comandos y ejecutarse de forma modular.",
        "difficulty": "advanced",
        "duration_minutes": 60,
        "xp_reward": 200,
        "learning_objectives": [
            "Diseñar arquitectura de plugins en Bash",
            "Registro dinámico de comandos con arrays asociativos",
            "Carga dinámica de módulos con source",
            "Dispatching de comandos"
        ],
        "commands": ["source", "declare -A", "local -n", "command -v", "getopts"],
        "guide_markdown": """# Proyecto M3: Sistema de Plugins para Scripts Bash

## Arquitectura

```
mi_framework/
├── main.sh          # punto de entrada
├── lib/
│   ├── core.sh      # registro y dispatch
│   └── utils.sh     # utilidades comunes
└── plugins/
    ├── disk.sh      # plugin: info de disco
    ├── net.sh       # plugin: info de red
    └── proc.sh      # plugin: info de procesos
```

---

## core.sh: registro de comandos

```bash
#!/usr/bin/env bash
# lib/core.sh

declare -A COMMANDS      # command -> descripción
declare -A HANDLERS      # command -> función

register_command() {
    local cmd="$1"
    local desc="$2"
    local handler="$3"
    COMMANDS["$cmd"]="$desc"
    HANDLERS["$cmd"]="$handler"
}

dispatch() {
    local cmd="${1:-help}"
    shift || true

    if [[ -v HANDLERS["$cmd"] ]]; then
        "${HANDLERS[$cmd]}" "$@"
    else
        echo "Comando desconocido: $cmd"
        show_help
        return 1
    fi
}

show_help() {
    echo "Comandos disponibles:"
    for cmd in $(echo "${!COMMANDS[@]}" | tr ' ' '\\n' | sort); do
        printf "  %-15s %s\\n" "$cmd" "${COMMANDS[$cmd]}"
    done
}

load_plugin() {
    local plugin_file="$1"
    if [[ -f "$plugin_file" ]]; then
        source "$plugin_file"
        echo "[plugin] Cargado: $(basename $plugin_file)"
    else
        echo "[plugin] No encontrado: $plugin_file" >&2
    fi
}
```

---

## plugins/disk.sh

```bash
#!/usr/bin/env bash
# plugins/disk.sh

_disk_info() {
    echo "=== Información de Discos ==="
    df -h --output=source,size,used,avail,pcent,target | column -t
}

_disk_largest() {
    echo "=== Top 10 directorios más grandes ==="
    du -sh /* 2>/dev/null | sort -rh | head -10
}

register_command "disk:info"    "Muestra uso de discos"   "_disk_info"
register_command "disk:largest" "Top 10 dirs más grandes" "_disk_largest"
```

---

## main.sh: punto de entrada

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIR/lib/core.sh"
source "$SCRIPT_DIR/lib/utils.sh"

# Cargar plugins
PLUGIN_DIR="$SCRIPT_DIR/plugins"
for plugin in "$PLUGIN_DIR"/*.sh; do
    load_plugin "$plugin"
done

register_command "help" "Muestra esta ayuda" "show_help"

# Dispatchar comando
dispatch "${1:-help}" "${@:2}"
```

---

## Ejecución

```bash
chmod +x main.sh
./main.sh help
./main.sh disk:info
./main.sh disk:largest
```

---

## Tarea del Proyecto

1. Implementa la estructura completa de directorios
2. Crea el plugin `net.sh` con comandos: `net:interfaces`, `net:connections`
3. Crea el plugin `proc.sh` con comandos: `proc:top`, `proc:zombie`
4. Añade soporte para `--json` que genere la salida en formato JSON
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Framework de plugins funcional",
                "description": "Implementa main.sh + core.sh + al menos 2 plugins con 2 comandos cada uno. El comando 'help' debe listar todos los comandos disponibles.",
                "hint": "Recuerda que los plugins deben llamar register_command() al ser cargados via source",
                "validation_command": "bash main.sh help 2>&1 | grep -c ':'",
                "expected_output_contains": "4"
            }
        ]
    },
]

# ─── M4: Procesamiento de Texto ──────────────────────────────────────────────

M4_LABS = [
    {
        "title": "grep Avanzado: Expresiones Regulares",
        "description": "Domina grep con ERE, PCRE y opciones avanzadas para buscar patrones complejos en logs, archivos de configuración y salidas de comandos.",
        "difficulty": "beginner",
        "duration_minutes": 35,
        "xp_reward": 110,
        "learning_objectives": [
            "Usar grep con ERE (grep -E / egrep)",
            "Usar PCRE con grep -P",
            "Buscar en múltiples archivos y directorios",
            "Combinar grep en pipelines"
        ],
        "commands": ["grep -E", "grep -P", "grep -r", "grep -v", "grep -c", "grep -n", "grep -o"],
        "guide_markdown": """# grep Avanzado: Expresiones Regulares

## Tipos de regex en grep

| Flag    | Tipo de regex                     |
|---------|-----------------------------------|
| (nada)  | BRE — Basic Regular Expressions   |
| -E      | ERE — Extended Regular Expressions|
| -P      | PCRE — Perl-Compatible RE (más potente)|
| -F      | Fixed strings (sin regex)         |

---

## ERE: sintaxis extendida

```bash
# Sin escapar + ? | ( )
grep -E "error|warning|critical" /var/log/syslog

# Cuantificadores
grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}" access.log   # fecha YYYY-MM-DD

# Grupos y alternativas
grep -E "(failed|refused|denied) (login|access|connection)" auth.log

# Caracteres de clase
grep -E "^[[:space:]]*#" /etc/fstab    # líneas comentadas
grep -E "[^[:print:]]" archivo.txt     # caracteres no imprimibles
```

---

## Opciones de grep esenciales

```bash
# -n: número de línea
grep -n "error" app.log

# -r: recursivo (con -l solo nombres de archivo)
grep -r "password" /etc/ --include="*.conf" -l

# -v: invertir match (mostrar lo que NO coincide)
grep -v "^#" /etc/hosts | grep -v "^$"    # sin comentarios ni vacíos

# -c: contar ocurrencias
grep -c "ERROR" app.log

# -o: solo la parte que coincide
grep -oE "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" access.log | sort -u   # IPs únicas

# -i: case insensitive
grep -i "error" app.log

# -A -B -C: contexto
grep -A3 -B1 "CRITICAL" app.log   # 1 línea antes, 3 después
```

---

## PCRE: el poder de Perl

```bash
# Lookahead: líneas con "user" pero no seguidas de "admin"
grep -P "user(?! admin)" auth.log

# Lookbehind: IPs después de "from "
grep -oP "(?<=from )[0-9.]{7,15}" auth.log

# Named groups (para extraer)
grep -oP "(?P<ip>[0-9.]+) - - \[(?P<date>[^\]]+)\]" access.log

# Caracteres especiales
grep -P "\t" archivo.txt         # buscar tabulaciones literales
grep -P "^\xef\xbb\xbf" file    # BOM UTF-8
```

---

## Casos de uso reales

```bash
# 1. Extraer todas las IPs de un log
grep -oE "([0-9]{1,3}\.){3}[0-9]{1,3}" access.log | sort | uniq -c | sort -rn

# 2. Buscar errores en los últimos 100 logs
grep -r "ERROR\|CRITICAL" /var/log/ --include="*.log" -l 2>/dev/null | head -10

# 3. Encontrar archivos de configuración con contraseñas en texto plano
grep -rni "password\s*=\s*[^*]" /etc/ --include="*.conf" 2>/dev/null

# 4. IPs que más aparecen en un log de acceso
grep -oE "^[0-9.]+" access.log | sort | uniq -c | sort -rn | head -5
```

---

## Práctica

1. Descarga un access.log de muestra: `curl -s https://raw.githubusercontent.com/elastic/examples/master/Common%20Data%20Formats/nginx_logs/nginx_logs -o access.log` (o crea uno de prueba)
2. Extrae solo los errores HTTP (4xx y 5xx)
3. Lista las 10 IPs más frecuentes
4. Encuentra todas las URLs que contienen `/admin/`
5. Busca requests que tardaron más de 1 segundo (si tu log tiene timing)
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Análisis básico de log con grep",
                "description": "Crea un archivo de log de ejemplo con al menos 20 líneas incluyendo entradas de error, y usa grep para: contar errores, extraer IPs únicas y mostrar contexto de errores críticos.",
                "hint": "Usa grep -c para contar, grep -oE para extraer IPs, grep -C2 para contexto",
                "validation_command": "bash analizar_log.sh 2>&1 | grep -E 'Error|IP|CRITICAL'",
                "expected_output_contains": "Error"
            }
        ]
    },
    {
        "title": "sed: Editor de Flujo para Transformaciones",
        "description": "Usa sed para transformar texto en streams: sustituciones, eliminaciones, insercciones y scripts sed multi-línea para automatizar edición de archivos.",
        "difficulty": "intermediate",
        "duration_minutes": 40,
        "xp_reward": 130,
        "learning_objectives": [
            "Sustituciones simples y globales con s///",
            "Eliminar y filtrar líneas con d y p",
            "Edición in-place con sed -i",
            "Scripts sed multi-comando"
        ],
        "commands": ["sed 's///g'", "sed -i", "sed -n", "sed '/pattern/d'", "sed -e", "sed -f"],
        "guide_markdown": """# sed: Editor de Flujo para Transformaciones

## La estructura básica

```
sed [opciones] 'dirección comando' archivo
```

- **dirección**: número de línea, rango, patrón `/regex/`
- **comando**: s (sustituir), d (borrar), p (imprimir), i/a (insertar/añadir), y (transliterar)

---

## Sustituciones s///

```bash
# Sustituir primera ocurrencia por línea
sed 's/hola/hello/' archivo.txt

# Sustituir todas las ocurrencias (global)
sed 's/hola/hello/g' archivo.txt

# Case insensitive
sed 's/error/ERROR/gi' log.txt

# Separador alternativo (útil con rutas)
sed 's|/home/user|/home/admin|g' config.txt

# Grupos de captura (\\1, \\2...)
echo "2024-01-15" | sed 's/\\([0-9]\\{4\\}\\)-\\([0-9]\\{2\\}\\)-\\([0-9]\\{2\\}\\)/\\3\\/\\2\\/\\1/'
# → 15/01/2024

# Con ERE (sed -E elimina el escape de grupos)
echo "2024-01-15" | sed -E 's/([0-9]{4})-([0-9]{2})-([0-9]{2})/\\3\\/\\2\\/\\1/'
```

---

## Direcciones: qué líneas procesar

```bash
# Solo línea 5
sed '5s/foo/bar/' archivo.txt

# Rango de líneas
sed '3,7s/foo/bar/' archivo.txt

# Desde patrón hasta patrón
sed '/START/,/END/s/foo/bar/' archivo.txt

# Todas excepto las que coincidan
sed '/^#/!s/foo/bar/' archivo.txt   # todas excepto comentarios
```

---

## Eliminar líneas

```bash
# Eliminar líneas vacías
sed '/^$/d' archivo.txt

# Eliminar comentarios y vacíos
sed -e '/^#/d' -e '/^$/d' /etc/apt/sources.list

# Eliminar líneas con un patrón
sed '/DEBUG/d' app.log

# Eliminar primera y última línea
sed '1d;$d' archivo.txt
```

---

## Edición in-place con -i

```bash
# Editar el archivo original (-i '')
sed -i 's/version=1.0/version=2.0/g' config.properties

# Con backup automático
sed -i.bak 's/localhost/mi-servidor.ejemplo.com/g' config.conf
# Crea config.conf.bak como respaldo

# Múltiples sustituciones
sed -i \
    -e 's/DEBUG/INFO/g' \
    -e 's/old-domain.com/new-domain.com/g' \
    app.conf
```

---

## Insertar y añadir texto

```bash
# Insertar antes de una línea que coincide
sed '/^LISTEN/i # Configuración de red' httpd.conf

# Añadir después
sed '/^ServerName/a ServerAlias www.ejemplo.com' httpd.conf

# Cambiar línea completa
sed '/^Port 80$/c Port 8080' httpd.conf
```

---

## Casos de uso reales

```bash
# 1. Convertir CRLF a LF (Windows a Unix)
sed -i 's/\\r$//' archivo.txt

# 2. Añadir número de línea al inicio
sed = archivo.txt | sed 'N;s/\\n/\\t/'

# 3. Borrar espacios al final de línea
sed -i 's/[[:space:]]*$//' *.txt

# 4. Extraer bloque entre marcadores
sed -n '/BEGIN CERTIFICATE/,/END CERTIFICATE/p' server.crt

# 5. Reemplazar contraseña en config (¡solo en entorno seguro!)
sed -i "s/^DB_PASS=.*/DB_PASS=${NEW_PASS}/" .env
```

---

## Práctica

1. Dado un archivo CSV con fechas en formato YYYY-MM-DD, transfórmalo a DD/MM/YYYY
2. Elimina todas las líneas de comentario y vacías de `/etc/ssh/sshd_config` y guarda el resultado
3. En un archivo de código Python, reemplaza todos los `print(` por `logger.info(` sin modificar lo que va dentro
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Transformación de fechas con sed",
                "description": "Crea un archivo con 5 fechas en formato YYYY-MM-DD y usa sed para convertirlas todas a DD/MM/YYYY en una sola pasada.",
                "hint": "sed -E 's/([0-9]{4})-([0-9]{2})-([0-9]{2})/\\3\\/\\2\\/\\1/'",
                "validation_command": "bash transformar_fechas.sh 2>&1 | grep -E '^[0-9]{2}/[0-9]{2}/[0-9]{4}' | wc -l",
                "expected_output_contains": "5"
            }
        ]
    },
    {
        "title": "awk: Procesamiento Estructurado de Datos",
        "description": "Domina awk para procesar datos tabulares: filtrar columnas, calcular estadísticas, reformatear CSVs y generar informes desde línea de comandos.",
        "difficulty": "intermediate",
        "duration_minutes": 45,
        "xp_reward": 140,
        "learning_objectives": [
            "Entender el modelo de procesamiento de awk",
            "Acceder y filtrar campos ($1, $2, NF, NR)",
            "Usar bloques BEGIN, pattern y END",
            "Calcular sumas, promedios y estadísticas"
        ],
        "commands": ["awk", "FS", "OFS", "NR", "NF", "BEGIN", "END", "printf"],
        "guide_markdown": """# awk: Procesamiento Estructurado de Datos

## El modelo de awk

```
awk 'BEGIN{...}  patrón{acción}  END{...}' archivo
```

- **BEGIN**: se ejecuta ANTES de leer el archivo
- **patrón**: condición (regex o expresión) que selecciona líneas
- **acción**: código a ejecutar por línea seleccionada
- **END**: se ejecuta DESPUÉS de leer todo el archivo

---

## Variables automáticas

| Variable | Significado                      |
|----------|----------------------------------|
| `$0`     | Línea completa                   |
| `$1..$N` | Campo 1 al N                     |
| `NF`     | Número de campos en la línea     |
| `NR`     | Número de registro (línea global)|
| `FNR`    | Número de línea en archivo actual|
| `FS`     | Separador de campo (default: espacio)|
| `OFS`    | Separador de salida              |
| `RS`     | Separador de registro (default: \\n)|

---

## Uso básico

```bash
# Mostrar columna específica
awk '{print $1}' archivo.txt

# Separador personalizado (CSV)
awk -F',' '{print $2}' datos.csv

# Múltiples campos con OFS
awk -F',' 'BEGIN{OFS="|"} {print $1,$3,$5}' datos.csv

# Filtrar por condición
awk '$3 > 1000 {print $1, $3}' datos.txt

# Filtrar por regex
awk '/ERROR/{print NR": "$0}' app.log
```

---

## Cálculos estadísticos

```bash
# Suma de una columna
awk '{sum += $3} END {print "Suma:", sum}' datos.txt

# Promedio
awk '{sum += $3; count++} END {printf "Promedio: %.2f\\n", sum/count}' datos.txt

# Mínimo y máximo
awk 'NR==1{min=$3; max=$3} {if($3<min)min=$3; if($3>max)max=$3} END{print "Min:", min, "Max:", max}' datos.txt

# Histograma simple
awk '{count[$1]++} END {for(k in count) printf "%-20s %d\\n", k, count[k]}' log.txt | sort
```

---

## Procesamiento de /proc y ps

```bash
# Memoria total usada por proceso (MB)
ps aux | awk 'NR>1 {mem[$11] += $6} END {for(p in mem) printf "%8.1f MB  %s\\n", mem[p]/1024, p}' | sort -rn | head -10

# Uso de CPU por usuario
ps aux | awk 'NR>1 {cpu[$1] += $3} END {for(u in cpu) printf "%-15s %.1f%%\\n", u, cpu[u]}' | sort -k2 -rn

# Contar conexiones por estado
ss -s | awk '/TCP:/{print}'
# o desde netstat:
netstat -an 2>/dev/null | awk '/^tcp/{count[$6]++} END{for(s in count) print count[s], s}' | sort -rn
```

---

## Reformatear datos

```bash
# CSV con cabecera → tabla formateada
awk -F',' '
NR==1 {
    for(i=1;i<=NF;i++) printf "%-15s", $i
    print ""
    for(i=1;i<=NF*15;i++) printf "-"
    print ""
}
NR>1 {
    for(i=1;i<=NF;i++) printf "%-15s", $i
    print ""
}' datos.csv

# Generar JSON desde datos tabulares
awk -F',' 'NR>1{printf "{\\"nombre\\":\\"%s\\", \\"valor\\":%s}\\n", $1, $2}' datos.csv
```

---

## Scripts awk multi-línea

```bash
awk '
BEGIN {
    FS=","
    OFS="\t"
    total_ventas = 0
    print "REGIÓN\t\tVENTAS\t\tPROMEDIO"
    print "--------\t--------\t--------"
}
NR > 1 {
    ventas[$1] += $2
    count[$1]++
    total_ventas += $2
}
END {
    for (region in ventas) {
        printf "%-15s\t%10.2f\t%10.2f\n", region, ventas[region], ventas[region]/count[region]
    }
    printf "\nTOTAL GLOBAL: %.2f\n", total_ventas
}
' ventas.csv
```

---

## Práctica

1. Dado `ps aux`, genera un informe con: top 5 procesos por memoria, total de memoria usada, número de procesos por usuario
2. Analiza `/var/log/auth.log` (o crea uno de prueba) y con awk extrae: IPs que fallaron autenticación y número de intentos por IP
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Estadísticas de procesos con awk",
                "description": "Usa awk sobre la salida de 'ps aux' para mostrar: número total de procesos, memoria total usada (KB), y top 3 procesos por consumo de memoria.",
                "hint": "awk 'NR>1{total+=$6; count++; procs[NR]=$11\":\"$6} END{...}' <(ps aux)",
                "validation_command": "bash stats_procesos.sh 2>&1 | grep -iE 'total|procesos|memoria'",
                "expected_output_contains": "total"
            }
        ]
    },
    {
        "title": "Pipeline: grep + sed + awk Combinados",
        "description": "Construye pipelines de procesamiento de texto combinando grep, sed y awk para resolver problemas reales de análisis de logs y transformación de datos.",
        "difficulty": "intermediate",
        "duration_minutes": 45,
        "xp_reward": 135,
        "learning_objectives": [
            "Diseñar pipelines de texto eficientes",
            "Combinar grep, sed y awk en cadena",
            "Optimizar pipelines para archivos grandes",
            "Procesar logs de acceso web reales"
        ],
        "commands": ["grep", "sed", "awk", "sort", "uniq", "cut", "tr", "wc"],
        "guide_markdown": """# Pipeline: grep + sed + awk Combinados

## Principio de diseño de pipelines

Cada herramienta hace lo que mejor sabe:
- **grep**: filtrar líneas relevantes (rápido)
- **sed**: transformar/limpiar el texto
- **awk**: calcular y formatear la salida

```
datos → grep (filtrar) → sed (limpiar) → awk (calcular) → salida
```

---

## Ejemplo 1: Análisis de access.log

Formato típico de Nginx/Apache:
```
IP - - [DD/Mon/YYYY:HH:MM:SS +TZ] "METHOD /path HTTP/1.1" STATUS BYTES "referrer" "UA"
```

```bash
#!/usr/bin/env bash
LOG="/var/log/nginx/access.log"

echo "=== TOP 10 IPs ==="
awk '{print $1}' "$LOG" | sort | uniq -c | sort -rn | head -10

echo ""
echo "=== Errores 4xx y 5xx ==="
grep -E '" [45][0-9]{2} ' "$LOG" | \
    awk '{print $9}' | sort | uniq -c | sort -rn

echo ""
echo "=== URLs más solicitadas ==="
awk '{print $7}' "$LOG" | \
    sed 's/?.*//' | \        # quitar query strings
    sort | uniq -c | sort -rn | head -10

echo ""
echo "=== Tráfico por hora ==="
awk '{print $4}' "$LOG" | \
    grep -oE "[0-9]{2}/[A-Za-z]+/[0-9]{4}:[0-9]{2}" | \
    sort | uniq -c
```

---

## Ejemplo 2: Procesar /etc/passwd

```bash
# Usuarios con shell válido (no /sbin/nologin ni /bin/false)
grep -v -E "/nologin|/false" /etc/passwd | \
    awk -F: '{printf "%-20s UID:%-6s HOME:%s\n", $1, $3, $6}'

# Usuarios con UID > 1000 (usuarios normales)
awk -F: '$3 >= 1000 && $3 < 65534 {print $1, $3, $6}' /etc/passwd | \
    sort -k2 -n
```

---

## Ejemplo 3: Monitorización de logs en tiempo real

```bash
# Seguir log y alertar cuando hay errores críticos
tail -F /var/log/syslog | \
    grep --line-buffered -i "error\|critical\|emerg" | \
    while IFS= read -r line; do
        timestamp=$(echo "$line" | awk '{print $1,$2,$3}')
        message=$(echo "$line" | sed 's/^[A-Za-z]* [0-9]* [0-9:]* //')
        echo "[ALERTA $(date +%H:%M:%S)] $timestamp — $message"
    done
```

---

## Ejemplo 4: Transformar CSV a SQL INSERT

```bash
# datos.csv:
# nombre,email,departamento
# Alice,alice@corp.com,Engineering

awk -F',' '
NR==1 { next }  # saltar cabecera
{
    gsub(/"/, "\\\"")  # escapar comillas
    printf "INSERT INTO empleados (nombre, email, departamento) VALUES (\"%s\", \"%s\", \"%s\");\\n", $1, $2, $3
}' datos.csv
```

---

## Ejemplo 5: Reportar cambios de archivos

```bash
# Comparar dos versiones de /etc/hosts y reportar cambios
diff /etc/hosts.bak /etc/hosts | \
    grep -E "^[<>]" | \
    awk '{
        tipo = ($1 == "<") ? "ELIMINADA" : "AÑADIDA"
        $1=""
        printf "%-10s: %s\\n", tipo, $0
    }'
```

---

## Práctica

1. Analiza `/var/log/auth.log` (o crea un log simulado con intentos de SSH fallidos):
   - Extraer IPs que fallaron más de 3 veces
   - Calcular el horario con más intentos
2. Transforma un CSV de ventas (producto, cantidad, precio) para calcular revenue por producto
3. Implementa un script `log_monitor.sh` que procese argumentos: `--file`, `--pattern`, `--top N`
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Pipeline de análisis de log SSH",
                "description": "Crea un log SSH simulado con 50 líneas de intentos fallidos de varias IPs. Usa un pipeline para mostrar las 3 IPs con más intentos.",
                "hint": "grep 'Failed password' auth_sim.log | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' | sort | uniq -c | sort -rn | head -3",
                "validation_command": "bash analisis_ssh.sh 2>&1 | wc -l",
                "expected_output_contains": "3"
            }
        ]
    },
    {
        "title": "Procesamiento Avanzado con awk: Scripts Completos",
        "description": "Escribe scripts awk completos para procesar archivos de configuración, generar informes de inventario y transformar datos entre formatos.",
        "difficulty": "advanced",
        "duration_minutes": 50,
        "xp_reward": 160,
        "learning_objectives": [
            "Escribir scripts awk en archivos separados",
            "Implementar arrays multi-dimensionales en awk",
            "Procesar múltiples archivos con FNR y FILENAME",
            "Generar salida en múltiples formatos"
        ],
        "commands": ["awk -f script.awk", "FILENAME", "FNR", "OFMT", "getline", "system()"],
        "guide_markdown": """# Procesamiento Avanzado con awk

## Scripts awk en archivo separado

Para scripts complejos, usa `-f scriptfile.awk`:

```awk
# analizar_ventas.awk

BEGIN {
    FS = ","
    OFS = "\t"
    print "PROCESANDO VENTAS..."
    print "===================="
}

# Ignorar cabecera
FNR == 1 { next }

# Acumular datos
{
    region    = $1
    producto  = $2
    cantidad  = $3
    precio    = $4

    ventas[region][producto] += cantidad * precio
    total_items[region] += cantidad
    grand_total += cantidad * precio
}

END {
    printf "\n%-15s %-20s %12s\n", "REGIÓN", "PRODUCTO", "REVENUE"
    print "---------------------------------------------------"

    for (r in ventas) {
        for (p in ventas[r]) {
            printf "%-15s %-20s %12.2f€\n", r, p, ventas[r][p]
        }
    }

    print "---------------------------------------------------"
    printf "TOTAL GLOBAL: %35.2f€\n", grand_total
}
```

Ejecución: `awk -f analizar_ventas.awk ventas_q1.csv ventas_q2.csv`

---

## Arrays multi-dimensionales simulados

awk no tiene arrays 2D reales, pero puede simularse:

```awk
# Simular array 2D con clave compuesta
ventas[region SUBSEP producto] += monto

# Acceder
for (key in ventas) {
    split(key, partes, SUBSEP)
    region = partes[1]
    producto = partes[2]
    print region, producto, ventas[key]
}
```

---

## Procesar múltiples archivos

```awk
# detectar cambio de archivo
FNR == 1 {
    if (NR > 1) {
        # Procesar resultado del archivo anterior
        print "---"
    }
    print "Archivo:", FILENAME
}
```

---

## Funciones en awk

```awk
function formatear_bytes(bytes,    unidad, valor) {
    if (bytes >= 1073741824) {
        unidad = "GB"; valor = bytes / 1073741824
    } else if (bytes >= 1048576) {
        unidad = "MB"; valor = bytes / 1048576
    } else if (bytes >= 1024) {
        unidad = "KB"; valor = bytes / 1024
    } else {
        unidad = "B"; valor = bytes
    }
    return sprintf("%.1f %s", valor, unidad)
}

# uso
{ print formatear_bytes($2) }
```

---

## getline: leer desde comandos externos

```awk
{
    # Obtener información del hostname
    cmd = "hostname -f"
    cmd | getline hostname
    close(cmd)

    print "Host:", hostname, "— dato:", $0
}
```

---

## Caso real: Comparar dos inventarios

```awk
# diff_inventario.awk
# Uso: awk -f diff_inventario.awk inventario_viejo.csv inventario_nuevo.csv

FNR==1 { next }  # saltar cabeceras

# Primer archivo: inventario viejo
FILENAME == ARGV[1] {
    viejo[$1] = $2   # producto → cantidad
}

# Segundo archivo: inventario nuevo
FILENAME == ARGV[2] {
    nuevo[$1] = $2
}

END {
    print "=== CAMBIOS EN INVENTARIO ==="
    for (producto in nuevo) {
        if (producto in viejo) {
            diff = nuevo[producto] - viejo[producto]
            if (diff != 0) {
                estado = (diff > 0) ? "AUMENTÓ" : "DISMINUYÓ"
                printf "%-20s %s en %d (de %d a %d)\n", producto, estado, diff, viejo[producto], nuevo[producto]
            }
        } else {
            printf "%-20s NUEVO (stock: %d)\n", producto, nuevo[producto]
        }
    }
    for (producto in viejo) {
        if (!(producto in nuevo)) {
            printf "%-20s ELIMINADO\n", producto
        }
    }
}
```

---

## Práctica

1. Escribe `analizar_apache.awk` que procese un access.log y genere un informe con: total de requests, breakdown por código HTTP, top 5 URLs, total de bytes transferidos
2. Escribe `reconciliar.awk` que compare dos CSVs de inventario y muestre añadidos, eliminados y modificados
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Script awk para análisis de log",
                "description": "Crea analizar_log.awk que procese un access.log simulado (mínimo 30 líneas) y genere: total requests, % de errores, y top 3 paths.",
                "hint": "Cuenta en arrays: count[status]++ y paths[$7]++. En END calcula porcentajes y ordena con PROCINFO[\"sorted_in\"]",
                "validation_command": "awk -f analizar_log.awk access_sim.log 2>&1 | grep -iE 'total|error|paths'",
                "expected_output_contains": "total"
            }
        ]
    },
    {
        "title": "Integración: Script de Análisis de Logs Completo",
        "description": "Proyecto integrador de M4: construye un analizador de logs completo que combine grep, sed, awk y funciones Bash para generar informes profesionales.",
        "difficulty": "advanced",
        "duration_minutes": 60,
        "xp_reward": 190,
        "learning_objectives": [
            "Integrar grep, sed y awk en un script Bash profesional",
            "Soportar múltiples formatos de log",
            "Generar informes en texto y HTML",
            "Implementar argumentos de línea de comandos con getopts"
        ],
        "commands": ["getopts", "grep", "sed", "awk", "sort", "uniq", "printf", "tee"],
        "guide_markdown": """# Proyecto M4: Analizador de Logs Profesional

## Estructura del proyecto

```
log_analyzer/
├── log_analyzer.sh    # script principal
├── lib/
│   ├── parsers.sh     # funciones de parsing por formato
│   ├── reporters.sh   # funciones de generación de informes
│   └── utils.sh       # utilidades comunes
└── tests/
    └── sample.log     # log de prueba
```

---

## log_analyzer.sh

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/utils.sh"
source "$SCRIPT_DIR/lib/parsers.sh"
source "$SCRIPT_DIR/lib/reporters.sh"

# Defaults
LOG_FILE=""
FORMAT="nginx"
OUTPUT="text"
TOP_N=10
FILTER_STATUS=""

usage() {
    cat <<HELP
Uso: $(basename $0) [opciones] -f LOGFILE

Opciones:
  -f FILE     Archivo de log a analizar (requerido)
  -m FORMAT   Formato del log: nginx|apache|syslog (default: nginx)
  -o OUTPUT   Formato de salida: text|html|json (default: text)
  -n N        Mostrar top N resultados (default: 10)
  -s STATUS   Filtrar por código HTTP (ej: 404, 5xx)
  -h          Mostrar esta ayuda
HELP
    exit 0
}

parse_args() {
    while getopts "f:m:o:n:s:h" opt; do
        case "$opt" in
            f) LOG_FILE="$OPTARG" ;;
            m) FORMAT="$OPTARG" ;;
            o) OUTPUT="$OPTARG" ;;
            n) TOP_N="$OPTARG" ;;
            s) FILTER_STATUS="$OPTARG" ;;
            h) usage ;;
            *) die "Opción inválida: -$OPTARG" ;;
        esac
    done
    [[ -z "$LOG_FILE" ]] && die "Se requiere -f LOGFILE"
    [[ -f "$LOG_FILE" ]] || die "Archivo no encontrado: $LOG_FILE"
}

main() {
    parse_args "$@"

    log_info "Analizando: $LOG_FILE (formato: $FORMAT)"

    local total_requests errores_4xx errores_5xx
    total_requests=$(wc -l < "$LOG_FILE")
    errores_4xx=$(grep -cE '" 4[0-9]{2} ' "$LOG_FILE" 2>/dev/null || echo 0)
    errores_5xx=$(grep -cE '" 5[0-9]{2} ' "$LOG_FILE" 2>/dev/null || echo 0)

    case "$OUTPUT" in
        text) report_text "$LOG_FILE" "$total_requests" "$errores_4xx" "$errores_5xx" "$TOP_N" ;;
        html) report_html "$LOG_FILE" "$total_requests" "$errores_4xx" "$errores_5xx" "$TOP_N" ;;
        json) report_json "$LOG_FILE" "$total_requests" "$errores_4xx" "$errores_5xx" "$TOP_N" ;;
        *)    die "Formato de salida inválido: $OUTPUT" ;;
    esac
}

main "$@"
```

---

## lib/reporters.sh (parcial)

```bash
report_text() {
    local log="$1" total="$2" e4xx="$3" e5xx="$4" top_n="$5"

    echo "╔══════════════════════════════════════════╗"
    printf "║  INFORME DE LOG: %-24s║\n" "$(basename $log)"
    echo "╠══════════════════════════════════════════╣"
    printf "║  Total requests : %-22s║\n" "$total"
    printf "║  Errores 4xx    : %-22s║\n" "$e4xx"
    printf "║  Errores 5xx    : %-22s║\n" "$e5xx"
    echo "╠══════════════════════════════════════════╣"

    echo "║  TOP $top_n IPs                              ║"
    awk '{print $1}' "$log" | sort | uniq -c | sort -rn | head -"$top_n" | \
        awk '{printf "║    %-8s %s\n", $1, $2}'

    echo "╚══════════════════════════════════════════╝"
}
```

---

## Prueba del script completo

```bash
chmod +x log_analyzer.sh

# Generar log de prueba
for i in {1..100}; do
    echo "192.168.1.$((RANDOM%20)) - - [$(date '+%d/%b/%Y:%H:%M:%S +0000')] \"GET /path/$i HTTP/1.1\" $((RANDOM%5==0 ? 404 : 200)) $((RANDOM*100))"
done > tests/sample.log

# Ejecutar
./log_analyzer.sh -f tests/sample.log -o text -n 5
./log_analyzer.sh -f tests/sample.log -o html -n 10 > informe.html
```

---

## Tarea final del proyecto

1. Implementa completamente la estructura de directorios
2. Añade soporte para formato `syslog` en parsers.sh
3. El informe HTML debe incluir una tabla ordenable por columnas
4. Añade la opción `-s STATUS` para filtrar solo requests con ese código (exacto o patrón como `5xx`)
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Analizador de logs funcional",
                "description": "Implementa log_analyzer.sh con al menos las opciones -f y -n. Genera un log de prueba de 50 líneas y muestra top 5 IPs y desglose de códigos HTTP.",
                "hint": "Divide el problema: primero una función por sección (IPs, códigos), luego intégralas",
                "validation_command": "bash log_analyzer.sh -f tests/sample.log -n 5 2>&1 | grep -E 'IP|código|total|request'",
                "expected_output_contains": "5"
            }
        ]
    },
    {
        "title": "Proyecto M4: Generador de Informes ETL",
        "description": "Proyecto final de M4: construye un pipeline ETL (Extract-Transform-Load) completo en Bash que lea CSVs, los transforme y genere informes consolidados.",
        "difficulty": "advanced",
        "duration_minutes": 70,
        "xp_reward": 220,
        "learning_objectives": [
            "Diseñar un pipeline ETL completo en Bash",
            "Leer, validar y transformar CSVs",
            "Consolidar datos de múltiples fuentes",
            "Generar reportes en texto, CSV y HTML"
        ],
        "commands": ["awk", "sed", "grep", "join", "sort", "paste", "cut", "tee"],
        "guide_markdown": """# Proyecto M4: Pipeline ETL en Bash

## Objetivo

Construir un ETL que:
1. **Extrae** datos de múltiples CSVs
2. **Transforma**: limpia, valida y enriquece
3. **Carga**: genera salida consolidada en múltiples formatos

---

## Datos de entrada (simulados)

```bash
# ventas.csv
producto,cantidad,precio_unitario,fecha,vendedor
Laptop,5,899.99,2024-01-15,Alice
Monitor,12,299.50,2024-01-15,Bob
Teclado,30,79.99,2024-01-16,Alice
...

# empleados.csv
id,nombre,departamento,email
1,Alice,Ventas,alice@corp.com
2,Bob,Ventas,bob@corp.com
...
```

---

## Paso 1: Extract — validar y limpiar

```bash
extract() {
    local file="$1"
    local output="$2"

    # Verificar que es CSV válido (columnas consistentes)
    local expected_cols header_cols
    expected_cols=$(head -1 "$file" | tr ',' '\n' | wc -l)

    # Filtrar líneas con número incorrecto de columnas
    awk -F',' -v cols="$expected_cols" '
    NF != cols {
        print "WARN: línea " NR " tiene " NF " columnas (esperadas: " cols ")" > "/dev/stderr"
        next
    }
    { print }
    ' "$file" > "$output"

    echo "Extract: $(wc -l < "$output") líneas válidas de $file"
}
```

---

## Paso 2: Transform — enriquecer y agregar

```bash
transform() {
    local ventas="$1"
    local output="$2"

    awk -F',' '
    NR == 1 {
        print "producto,cantidad,precio_unit,revenue,fecha,vendedor"
        next
    }
    {
        producto = $1
        cantidad = $2
        precio   = $3
        fecha    = $4
        vendedor = $5
        revenue  = cantidad * precio

        # Validar tipos
        if (cantidad !~ /^[0-9]+$/) next
        if (precio   !~ /^[0-9.]+$/) next

        # Normalizar fecha (YYYY-MM-DD → DD/MM/YYYY)
        split(fecha, d, "-")
        fecha_es = d[3] "/" d[2] "/" d[1]

        printf "%s,%s,%.2f,%.2f,%s,%s\n", producto, cantidad, precio, revenue, fecha_es, vendedor
    }
    ' "$ventas" > "$output"

    echo "Transform: $(( $(wc -l < "$output") - 1 )) registros procesados"
}
```

---

## Paso 3: Load — generar informes

```bash
load_text_report() {
    local data="$1"

    echo "=== INFORME DE VENTAS ==="
    echo ""
    echo "Revenue por producto:"
    awk -F',' 'NR>1 {rev[$1]+=$4} END {for(p in rev) printf "  %-20s %.2f€\n", p, rev[p]}' "$data" | sort -k2 -rn

    echo ""
    echo "Revenue por vendedor:"
    awk -F',' 'NR>1 {rev[$6]+=$4} END {for(v in rev) printf "  %-15s %.2f€\n", v, rev[v]}' "$data" | sort -k2 -rn

    echo ""
    echo "Total general:"
    awk -F',' 'NR>1 {total+=$4} END {printf "  %.2f€\n", total}' "$data"
}

load_csv_report() {
    local data="$1"
    local output="$2"

    awk -F',' '
    NR>1 {
        rev_prod[$1] += $4
        rev_vend[$6] += $4
        total += $4
    }
    END {
        print "tipo,nombre,revenue"
        for (p in rev_prod) printf "producto,%s,%.2f\n", p, rev_prod[p]
        for (v in rev_vend) printf "vendedor,%s,%.2f\n", v, rev_vend[v]
        printf "total,GLOBAL,%.2f\n", total
    }
    ' "$data" > "$output"

    echo "CSV generado: $output"
}
```

---

## main.sh — orquestador

```bash
#!/usr/bin/env bash
set -euo pipefail

TMPDIR=$(mktemp -d /tmp/etl.XXXXXX)
trap "rm -rf $TMPDIR" EXIT

echo "=== PIPELINE ETL ==="
echo "Directorio temporal: $TMPDIR"

# Extract
extract "ventas.csv" "$TMPDIR/ventas_clean.csv"

# Transform
transform "$TMPDIR/ventas_clean.csv" "$TMPDIR/ventas_enriched.csv"

# Load
load_text_report "$TMPDIR/ventas_enriched.csv"
load_csv_report  "$TMPDIR/ventas_enriched.csv" "informe_final.csv"

echo ""
echo "Pipeline completado exitosamente"
```

---

## Tarea

1. Implementa el ETL completo con datos CSV reales (puedes generarlos con un script)
2. Añade una función `load_html_report()` que genere una tabla HTML con colores por rango de revenue
3. Añade validación de fechas (que sean válidas en formato YYYY-MM-DD)
4. Implementa un modo `--dry-run` que valide los datos sin generar salida
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Pipeline ETL funcional",
                "description": "Implementa el pipeline ETL completo: genera ventas.csv con 20 filas, ejecuta extract→transform→load y verifica que el CSV final tiene revenue calculado.",
                "hint": "Genera el CSV con un loop: for i in {1..20}; do echo \"Producto$((i%5)),$(( RANDOM%20+1 )),$(( RANDOM%900+100 )).99,...\"; done",
                "validation_command": "bash main.sh 2>&1 | grep -i 'completado\\|pipeline\\|total'",
                "expected_output_contains": "completado"
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

        # Calcular siguiente order_index para módulos
        from sqlalchemy import func
        max_order = db.query(func.max(Module.order_index)).filter(Module.skill_path_id == bash_path.id).scalar() or 0

        # M3
        m3 = upsert_module(db, bash_path.id,
            "M3 — Funciones y Arrays en Bash",
            "Organiza tu código en funciones reutilizables, domina arrays indexados y asociativos, e implementa patrones funcionales (map/filter/reduce) en Bash.",
            max_order + 1)
        print(f"\n[M3] Insertando {len(M3_LABS)} labs...")
        insert_labs(db, m3, M3_LABS)

        # M4
        m4 = upsert_module(db, bash_path.id,
            "M4 — Procesamiento de Texto: grep, sed y awk",
            "Domina las tres herramientas fundamentales de procesamiento de texto en Linux para filtrar, transformar y analizar datos desde la línea de comandos.",
            max_order + 2)
        print(f"\n[M4] Insertando {len(M4_LABS)} labs...")
        insert_labs(db, m4, M4_LABS)

        print(f"\n✅ seed_bash_part2.py completado: M3 ({len(M3_LABS)} labs) + M4 ({len(M4_LABS)} labs)")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
