"""
seed_bash_part1.py  —  Bash Scripting Path
Part 1: SkillPath + M1 (Fundamentos) + M2 (Control de Flujo)
Run: cd backend && source venv/bin/activate && python3 scripts/seed_bash_part1.py
"""
import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal, SkillPath, Module, Lab

def ins(db, module, labs):
    for ld in labs:
        if not db.query(Lab).filter(Lab.module_id == module.id, Lab.title == ld["title"]).first():
            db.add(Lab(
                module_id=module.id, title=ld["title"], difficulty=ld["difficulty"],
                description=ld["description"], goal_description=ld["goal"],
                step_by_step_guide=ld["guide"], order_index=ld["idx"],
                is_active=True, docker_image="ubuntu:22.04",
                xp_reward=ld.get("xp", 150), time_limit=ld.get("t", 30), category="Linux"
            ))
    db.commit()
    print(f"  -> {module.title}: OK")

def run():
    db = SessionLocal()
    try:
        # ── SkillPath ────────────────────────────────────────────────
        path = db.query(SkillPath).filter(SkillPath.title == "Bash Scripting").first()
        if not path:
            path = SkillPath(
                title="Bash Scripting",
                description="Domina el scripting en Bash desde cero hasta nivel avanzado. Aprende a automatizar tareas, procesar texto, gestionar procesos y construir herramientas de administración de sistemas reales.",
                difficulty="medium", order_index=3, is_active=True
            )
            db.add(path); db.commit(); db.refresh(path)
            print(f"Path creado: {path.title} (id={path.id})")
        else:
            print(f"Path ya existe: {path.title} (id={path.id})")

        # ── MÓDULO 1: Fundamentos de Bash ────────────────────────────
        m1 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M1 — Fundamentos de Bash").first()
        if not m1:
            m1 = Module(skill_path_id=path.id, title="M1 — Fundamentos de Bash",
                description="Variables, tipos de datos, expansiones, operadores y la estructura básica de cualquier script.",
                order_index=1, is_active=True, requires_validation=False)
            db.add(m1); db.commit(); db.refresh(m1)

        ins(db, m1, [
            {
                "title": "Tu Primer Script Bash", "difficulty": "easy", "idx": 1, "xp": 100, "t": 20,
                "description": """Un script Bash es un archivo de texto con una serie de comandos que el intérprete Bash ejecuta en orden. La primera línea siempre es el shebang, que indica al sistema qué intérprete usar.

Estructura mínima de un script:
  #!/bin/bash
  # Esto es un comentario
  echo "Hola, mundo"

El shebang: #!/bin/bash
  - #! es la secuencia mágica que el kernel reconoce como "usa este intérprete"
  - /bin/bash es la ruta al intérprete Bash
  - Alternativas: #!/usr/bin/env bash (más portable)

Permisos de ejecución:
  Un script necesita el bit de ejecución para poder lanzarse directamente.
  chmod +x script.sh   → añade permiso de ejecución
  ./script.sh          → ejecuta el script
  bash script.sh       → ejecuta sin necesidad de chmod

Convenciones:
  - Extensión .sh (no obligatoria, pero informativa)
  - Comentarios con # al inicio de línea
  - Variables en MAYÚSCULAS para variables globales/de entorno
  - Variables en minúsculas para variables locales del script""",
                "goal": "Crear un script Bash funcional. Añadir el shebang correcto. Dar permisos de ejecución y ejecutarlo de dos formas distintas.",
                "guide": """1. Crea el directorio de trabajo:
   mkdir -p ~/scripts && cd ~/scripts

2. Crea tu primer script con el editor nano:
   nano hola.sh

3. Escribe este contenido (incluye el shebang):
   #!/bin/bash
   # Mi primer script
   echo "Hola, mundo desde Bash"
   echo "Fecha actual: $(date)"
   echo "Usuario: $USER"
   echo "Directorio: $PWD"

4. Guarda (Ctrl+O, Enter, Ctrl+X) y dale permisos:
   chmod +x hola.sh

5. Ejecuta de dos formas:
   ./hola.sh
   bash hola.sh

6. Comprueba la diferencia entre ambas formas:
   ls -la hola.sh"""
            },
            {
                "title": "Variables en Bash", "difficulty": "easy", "idx": 2, "xp": 110, "t": 25,
                "description": """Las variables en Bash almacenan datos para usar durante la ejecución del script. A diferencia de otros lenguajes, Bash no tipifica explícitamente las variables.

Reglas de sintaxis:
  nombre=valor       → asignación (SIN espacios alrededor del =)
  $nombre            → acceso al valor
  ${nombre}          → acceso con delimitadores (recomendado)
  "${nombre}"        → acceso con protección de espacios (muy recomendado)

Tipos de variables:
  Variables locales:    mi_var="hola"       → solo en el script/función actual
  Variables de entorno: export MI_VAR="hi"  → disponible para procesos hijos
  Variables especiales: ver abajo

Variables especiales de Bash:
  $0   → nombre del script
  $1, $2... → argumentos del script (parámetros posicionales)
  $#   → número de argumentos
  $@   → todos los argumentos como lista
  $*   → todos los argumentos como cadena
  $?   → código de retorno del último comando (0=éxito)
  $$   → PID del proceso actual
  $!   → PID del último proceso en background

Errores comunes:
  var = "valor"   ❌ (espacios alrededor del = rompen la asignación)
  var="valor"     ✅
  echo $var sin comillas puede romper con espacios en el valor""",
                "goal": "Declarar y usar variables locales y de entorno. Usar variables especiales. Pasar argumentos a un script y acceder a ellos.",
                "guide": """1. Crea el script de variables:
   cat > ~/scripts/variables.sh << 'EOF'
#!/bin/bash
# Variables básicas
nombre="Ana"
edad=25
saludo="Hola, ${nombre}. Tienes ${edad} años."
echo "$saludo"

# Variable de entorno
export MI_APP="TechApp"
echo "App: $MI_APP"

# Variables especiales
echo "Script: $0"
echo "Argumentos recibidos: $#"
echo "Todos los args: $@"
echo "PID del script: $$"
EOF
   chmod +x ~/scripts/variables.sh

2. Ejecuta con argumentos:
   ~/scripts/variables.sh arg1 arg2 arg3

3. Crea un script que use $1, $2:
   cat > ~/scripts/saluda.sh << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
    echo "Uso: $0 <nombre> [apellido]"
    exit 1
fi
echo "Hola, $1 $2!"
EOF
   chmod +x ~/scripts/saluda.sh
   ~/scripts/saluda.sh Carlos López

4. Ver el código de retorno del último comando:
   ls /no/existe
   echo "Código de retorno: $?" """
            },
            {
                "title": "Tipos de Datos: Strings, Números y Arrays", "difficulty": "easy", "idx": 3, "xp": 120, "t": 25,
                "description": """Bash trata todo como strings por defecto, pero puede realizar operaciones numéricas y manejar arrays.

STRINGS:
  str="Hola Mundo"
  echo ${#str}          → longitud: 10
  echo ${str:0:4}       → subcadena: "Hola" (desde pos 0, 4 chars)
  echo ${str^^}         → MAYÚSCULAS: "HOLA MUNDO"
  echo ${str,,}         → minúsculas: "hola mundo"
  echo ${str/Hola/Hi}   → sustituir primera ocurrencia
  echo ${str//o/0}      → sustituir todas las ocurrencias

NÚMEROS (operaciones con (( )) o $( () )):
  a=10; b=3
  echo $((a + b))       → 13
  echo $((a - b))       → 7
  echo $((a * b))       → 30
  echo $((a / b))       → 3 (división entera)
  echo $((a % b))       → 1 (módulo/resto)
  echo $((a ** 2))      → 100 (potencia)
  Para decimales: usar bc o awk

ARRAYS:
  frutas=("manzana" "pera" "uva")
  echo ${frutas[0]}      → manzana (índice base 0)
  echo ${frutas[@]}      → todos los elementos
  echo ${#frutas[@]}     → número de elementos: 3
  frutas+=("kiwi")       → añadir elemento
  unset frutas[1]        → eliminar elemento""",
                "goal": "Manipular strings con expansión de parámetros. Realizar operaciones aritméticas. Crear y gestionar arrays básicos.",
                "guide": """1. Crea el script de tipos de datos:
   cat > ~/scripts/tipos.sh << 'EOF'
#!/bin/bash
# STRINGS
texto="Bash Scripting es genial"
echo "Longitud: ${#texto}"
echo "Mayúsculas: ${texto^^}"
echo "Subcadena (0-4): ${texto:0:4}"
echo "Reemplazo: ${texto/genial/poderoso}"

# NÚMEROS
x=15; y=4
echo "Suma: $((x + y))"
echo "Resto: $((x % y))"
echo "Potencia: $((x ** 2))"

# Decimales con bc
echo "División decimal: $(echo "scale=2; $x / $y" | bc)"

# ARRAYS
colores=("rojo" "verde" "azul" "amarillo")
echo "Primer color: ${colores[0]}"
echo "Todos: ${colores[@]}"
echo "Cantidad: ${#colores[@]}"
colores+=("violeta")
echo "Con nuevo elemento: ${colores[@]}"
EOF
   chmod +x ~/scripts/tipos.sh && ~/scripts/tipos.sh

2. Practica operaciones de string:
   cadena="  hola mundo  "
   echo "${cadena//  /}"    # elimina espacios dobles
   echo "${cadena%mundo*}"  # elimina sufijo desde "mundo"

3. Array asociativo (Bash 4+):
   declare -A persona
   persona[nombre]="Carlos"
   persona[edad]="30"
   echo "Nombre: ${persona[nombre]}, Edad: ${persona[edad]}" """
            },
            {
                "title": "Expansiones de Bash", "difficulty": "medium", "idx": 4, "xp": 140, "t": 30,
                "description": """Bash tiene varias formas de expandir expresiones. Dominarlas es clave para escribir scripts eficientes.

1. EXPANSIÓN DE COMANDOS — sustituye por la salida del comando:
   fecha=$(date +%Y-%m-%d)
   usuario=$(whoami)
   archivos=$(ls | wc -l)
   (Forma antigua con backticks `comando` — evitar, no se anidan bien)

2. EXPANSIÓN ARITMÉTICA:
   resultado=$((5 * 3 + 2))
   let "a = 10 / 2"   (alternativa)
   (( b = a * 3 ))    (otra alternativa)

3. EXPANSIÓN DE PARÁMETROS CON VALORES DEFAULT:
   ${var:-default}    → usa "default" si var está vacía o no definida
   ${var:=default}    → asigna "default" a var si está vacía
   ${var:?mensaje}    → error con mensaje si var está vacía
   ${var:+alternativa} → usa "alternativa" si var ESTÁ definida

4. EXPANSIÓN DE LLAVES (brace expansion):
   echo {a,b,c}          → a b c
   echo file{1..5}.txt   → file1.txt file2.txt ... file5.txt
   mkdir -p proyecto/{src,tests,docs,config}  → crea 4 dirs de golpe
   cp archivo.txt{,.bak}  → crea archivo.txt.bak (truco de backup rápido)

5. EXPANSIÓN DE RUTAS (globbing):
   ls *.sh        → todos los archivos .sh
   ls datos?.csv  → datos seguidos de UN carácter y .csv
   ls [abc]*.txt  → empieza por a, b o c""",
                "goal": "Usar expansión de comandos con $() para capturar salidas. Aplicar expansiones de parámetros con defaults. Usar brace expansion para crear múltiples archivos y directorios.",
                "guide": """1. Captura la salida de comandos:
   fecha=$(date "+%d/%m/%Y %H:%M")
   disco=$(df -h / | awk 'NR==2 {print $5}')
   echo "Fecha: $fecha | Disco raíz: $disco"

2. Usa valores por defecto:
   cat > ~/scripts/defaults.sh << 'EOF'
#!/bin/bash
entorno=${1:-produccion}   # default: produccion si no se pasa arg
puerto=${2:-8080}
echo "Iniciando en entorno: $entorno, puerto: $puerto"
EOF
   bash ~/scripts/defaults.sh                 # usa defaults
   bash ~/scripts/defaults.sh desarrollo 3000  # usa los argumentos

3. Brace expansion práctica:
   mkdir -p ~/proyecto/{src,tests,docs,scripts,config}
   ls ~/proyecto/

   touch ~/proyecto/src/main{1..5}.sh
   ls ~/proyecto/src/

   # Truco de backup rápido:
   cp ~/scripts/hola.sh{,.bak}
   ls ~/scripts/

4. Globbing avanzado:
   ls ~/scripts/*.sh
   ls ~/scripts/h*.sh"""
            },
            {
                "title": "Entrada/Salida: read, echo y printf", "difficulty": "easy", "idx": 5, "xp": 110, "t": 20,
                "description": """Los scripts interactivos reciben datos del usuario con `read` y muestran salida con `echo` o `printf`.

READ:
  read nombre             → lee una línea y la guarda en $nombre
  read -p "Texto: " var   → muestra un prompt antes de leer
  read -s contraseña      → modo silencioso (no muestra lo que escribe el usuario)
  read -t 10 respuesta    → timeout de 10 segundos
  read -n 1 tecla         → lee solo 1 carácter (sin Enter)
  read -a array           → lee palabras en un array
  read -r linea           → no interpreta backslashes (recomendado para leer archivos)

ECHO:
  echo "texto"            → imprime con salto de línea al final
  echo -n "texto"         → sin salto de línea al final
  echo -e "tab:\there"    → interpreta secuencias de escape (\t, \n, \033[...)

PRINTF (más potente y portable que echo):
  printf "Nombre: %s, Edad: %d\n" "Ana" 25
  printf "%10s\n" "derecha"    → alineado a la derecha, 10 chars
  printf "%-10s\n" "izquierda" → alineado a la izquierda

Redirección estándar:
  comando > archivo.txt    → stdout a archivo (sobreescribe)
  comando >> archivo.txt   → stdout a archivo (añade)
  comando 2> errores.txt   → stderr a archivo
  comando &> todo.txt      → stdout y stderr a archivo
  comando < entrada.txt    → stdin desde archivo""",
                "goal": "Crear scripts interactivos con read. Formatear salida con printf. Redirigir stdout y stderr a archivos.",
                "guide": """1. Script interactivo con read:
   cat > ~/scripts/registro.sh << 'EOF'
#!/bin/bash
echo "=== REGISTRO DE USUARIO ==="
read -p "Nombre: " nombre
read -p "Apellido: " apellido
read -s -p "Contraseña (no visible): " pass
echo ""  # salto de línea tras -s
read -p "Edad: " edad

echo ""
printf "Usuario registrado:\n"
printf "  Nombre:    %-20s\n" "$nombre $apellido"
printf "  Edad:      %-20s años\n" "$edad"
printf "  Contraseña guardada de forma segura\n"
EOF
   chmod +x ~/scripts/registro.sh && ~/scripts/registro.sh

2. Redireccion de salidas:
   date > /tmp/fecha.txt
   cat /tmp/fecha.txt

   ls /no/existe 2> /tmp/errores.txt
   cat /tmp/errores.txt

   ls /etc /no/existe > /tmp/stdout.txt 2> /tmp/stderr.txt
   cat /tmp/stdout.txt
   cat /tmp/stderr.txt

3. Printf para tablas formateadas:
   printf "%-15s %-10s %s\n" "NOMBRE" "EDAD" "CIUDAD"
   printf "%-15s %-10s %s\n" "Ana García" "28" "Madrid"
   printf "%-15s %-10s %s\n" "Carlos Ruiz" "34" "Barcelona" """
            },
            {
                "title": "Operadores de Comparación y Pruebas", "difficulty": "medium", "idx": 6, "xp": 140, "t": 30,
                "description": """Las comparaciones en Bash se hacen con el comando `test` o su sinónimo `[`. En Bash moderno se usa `[[` que es más potente.

COMPARACIÓN DE STRINGS:
  [ "$a" = "$b" ]    → igual (=, no ==)
  [ "$a" != "$b" ]   → diferente
  [ -z "$a" ]        → vacía (zero length)
  [ -n "$a" ]        → no vacía (non-zero length)
  [[ "$a" == *bash* ]] → contiene "bash" (solo con [[)
  [[ "$a" =~ ^[0-9]+$ ]] → regex: solo dígitos (solo con [[)

COMPARACIÓN NUMÉRICA:
  [ $a -eq $b ]   → igual (equal)
  [ $a -ne $b ]   → diferente (not equal)
  [ $a -lt $b ]   → menor que (less than)
  [ $a -le $b ]   → menor o igual (less equal)
  [ $a -gt $b ]   → mayor que (greater than)
  [ $a -ge $b ]   → mayor o igual (greater equal)
  (( a == b ))    → comparación numérica moderna

PRUEBAS DE ARCHIVOS:
  [ -e ruta ]    → existe (exist)
  [ -f ruta ]    → existe y es archivo regular (file)
  [ -d ruta ]    → existe y es directorio (directory)
  [ -r ruta ]    → existe y es legible (readable)
  [ -w ruta ]    → existe y es escribible (writable)
  [ -x ruta ]    → existe y es ejecutable (executable)
  [ -s ruta ]    → existe y no está vacío (size > 0)
  [ -L ruta ]    → es un enlace simbólico (link)

OPERADORES LÓGICOS:
  [ cond1 ] && [ cond2 ]   → Y (AND)
  [ cond1 ] || [ cond2 ]   → O (OR)
  [[ cond1 && cond2 ]]     → AND dentro de [[
  ! [ cond ]               → negación (NOT)""",
                "goal": "Usar test y [[ ]] para comparaciones de strings, números y archivos. Combinar condiciones con AND y OR. Verificar existencia y tipo de archivos.",
                "guide": """1. Comparaciones de strings:
   nombre="bash"
   [ "$nombre" = "bash" ] && echo "Es bash" || echo "No es bash"
   [ -z "$nombre" ] && echo "Vacío" || echo "No vacío: '$nombre'"
   [[ "$nombre" =~ ^b ]] && echo "Empieza por b"

2. Comparaciones numéricas:
   valor=42
   [ $valor -gt 100 ] && echo "Mayor de 100" || echo "Menor o igual a 100"
   (( valor >= 40 && valor <= 50 )) && echo "Entre 40 y 50"

3. Pruebas de archivos:
   archivo=~/scripts/hola.sh
   [ -e "$archivo" ] && echo "Existe" || echo "No existe"
   [ -f "$archivo" ] && echo "Es archivo regular"
   [ -x "$archivo" ] && echo "Es ejecutable"
   [ -s "$archivo" ] && echo "No está vacío"

4. Script completo de diagnóstico:
   cat > ~/scripts/chequeo.sh << 'EOF'
#!/bin/bash
ruta=${1:-/etc/hosts}
[ -e "$ruta" ] || { echo "No existe: $ruta"; exit 1; }
[ -f "$ruta" ] && tipo="archivo" || tipo="directorio"
[ -r "$ruta" ] && perm="legible" || perm="no legible"
[ -s "$ruta" ] && size="no vacío" || size="vacío"
echo "$ruta → $tipo, $perm, $size"
EOF
   bash ~/scripts/chequeo.sh /etc/hosts
   bash ~/scripts/chequeo.sh /etc
   bash ~/scripts/chequeo.sh /no/existe"""
            },
            {
                "title": "Códigos de Retorno y Manejo de Errores", "difficulty": "medium", "idx": 7, "xp": 150, "t": 30,
                "description": """Cada comando en Linux devuelve un código de salida (exit code): 0 = éxito, 1-255 = error. Gestionar estos códigos es fundamental para scripts robustos.

Acceso al código de retorno:
  comando
  echo $?    → imprime 0 (éxito) o un número de error

Patrones comunes de manejo de errores:

1. Operador &&  (ejecuta si el anterior tuvo éxito):
   mkdir /tmp/test && cd /tmp/test && echo "Listo"

2. Operador || (ejecuta si el anterior falló):
   cd /no/existe || echo "Error: directorio no encontrado"

3. exit: termina el script con un código:
   exit 0    → éxito
   exit 1    → error genérico
   exit 2    → error de uso (argumentos incorrectos)

4. set -e: aborta el script si cualquier comando falla:
   #!/bin/bash
   set -e      → sale automáticamente si algo falla
   set -u      → error si se usa variable no definida
   set -o pipefail → el pipe falla si falla cualquier parte
   (Forma combinada: set -euo pipefail → práctica recomendada para producción)

5. trap: ejecuta código al recibir señales o al salir:
   trap "echo 'Limpiando...'; rm -f /tmp/mi_temp" EXIT
   trap "echo 'Interrumpido'" INT TERM""",
                "goal": "Usar $? para verificar éxito/fracaso. Aplicar set -euo pipefail. Usar trap para limpieza de recursos. Crear funciones de manejo de errores.",
                "guide": """1. Básico: comprobar el código de retorno:
   ls /etc/hosts
   echo "Código: $?"
   ls /no/existe
   echo "Código: $?"

2. Script robusto con set -euo pipefail:
   cat > ~/scripts/robusto.sh << 'EOF'
#!/bin/bash
set -euo pipefail

TMPFILE=$(mktemp)
trap "rm -f $TMPFILE; echo 'Cleanup realizado'" EXIT

echo "Trabajando con: $TMPFILE"
echo "datos" > "$TMPFILE"
cat "$TMPFILE"
echo "Script completado"
EOF
   bash ~/scripts/robusto.sh

3. Función de error reutilizable:
   cat > ~/scripts/con_errores.sh << 'EOF'
#!/bin/bash
die() { echo "ERROR: $*" >&2; exit 1; }
necesita() { command -v "$1" &>/dev/null || die "Falta el comando: $1"; }

necesita curl  || true
necesita bash
necesita python3

[ $# -ge 1 ] || die "Uso: $0 <archivo>"
[ -f "$1"  ] || die "El archivo no existe: $1"
echo "Todo correcto, procesando: $1"
EOF
   bash ~/scripts/con_errores.sh
   bash ~/scripts/con_errores.sh /etc/hosts"""
            },
            {
                "title": "Expansión Aritmética Avanzada", "difficulty": "medium", "idx": 8, "xp": 140, "t": 25,
                "description": """Bash tiene capacidades aritméticas nativas con (( )) y $(()), pero para operaciones decimales hay que usar herramientas externas.

OPERADORES dentro de (( )):
  +  -  *  /  %  **     → suma, resta, multiplicación, división entera, módulo, potencia
  ++  --                 → incremento/decremento (igual que C)
  +=  -=  *=  /=        → asignación compuesta
  &  |  ^  ~  <<  >>    → operadores bit a bit

Ejemplos:
  ((contador++))           → incrementa en 1
  ((total += precio))      → suma precio a total
  (( par = numero % 2 ))   → 0 si par, 1 si impar
  resultado=$(( 2**10 ))   → 1024

Para operaciones DECIMALES — usar bc:
  echo "scale=4; 22/7" | bc         → π ≈ 3.1428
  echo "scale=2; sqrt(2)" | bc -l   → √2 ≈ 1.41

Para operaciones DECIMALES — usar awk:
  awk 'BEGIN { printf "%.2f\n", 22/7 }'     → 3.14
  awk 'BEGIN { printf "%.4f\n", sqrt(2) }'  → 1.4142

Comparación con (( )) — retorna 0 (verdadero) o 1 (falso):
  (( 5 > 3 )) && echo "mayor"
  (( x == 0 )) || echo "no es cero"
  (( x >= 1 && x <= 10 )) && echo "entre 1 y 10" """,
                "goal": "Usar (( )) para aritmética entera avanzada. Calcular operaciones decimales con bc y awk. Implementar contadores y acumuladores en scripts.",
                "guide": """1. Operaciones básicas con (( )):
   a=10; b=3
   echo "Suma: $((a+b))"
   echo "División entera: $((a/b))"
   echo "Módulo: $((a%b))"
   echo "Potencia: $((2**8))"

2. Contador en bucle:
   contador=0
   for i in {1..5}; do
     ((contador += i))
   done
   echo "Suma 1 a 5: $contador"

3. Decimales con bc:
   echo "scale=4; 22/7" | bc
   echo "scale=2; sqrt(144)" | bc -l
   echo "scale=6; e(1)" | bc -l       # número e

4. Decimales con awk:
   awk 'BEGIN { printf "PI ≈ %.10f\n", atan2(0,-1) }'
   awk 'BEGIN { printf "Raíz de 2 = %.6f\n", sqrt(2) }'

5. Script de calculadora simple:
   cat > ~/scripts/calc.sh << 'EOF'
#!/bin/bash
a=${1:-0}; op=${2:-+}; b=${3:-0}
case $op in
  +) echo "$a + $b = $(echo "$a + $b" | bc)" ;;
  -) echo "$a - $b = $(echo "$a - $b" | bc)" ;;
  x) echo "$a × $b = $(echo "$a * $b" | bc)" ;;
  /) echo "$a ÷ $b = $(echo "scale=4; $a / $b" | bc)" ;;
  *) echo "Operador desconocido: $op" ;;
esac
EOF
   bash ~/scripts/calc.sh 10 / 3
   bash ~/scripts/calc.sh 7 x 8"""
            },
            {
                "title": "Depuración de Scripts Bash", "difficulty": "medium", "idx": 9, "xp": 150, "t": 30,
                "description": """Depurar scripts Bash es una habilidad esencial. El error más común es no saber dónde falla el script.

MODO DEBUG:
  bash -x script.sh       → modo trace: imprime cada comando antes de ejecutarlo
  bash -n script.sh       → modo dry-run: solo verifica sintaxis, no ejecuta
  bash -v script.sh       → modo verbose: imprime cada línea del script tal cual

  Dentro del script:
  set -x    → activa el trace desde ese punto
  set +x    → desactiva el trace
  set -v    → verbose

DEPURACIÓN SELECTIVA:
  #!/bin/bash
  set -x   # activa debug
  mi_funcion
  set +x   # desactiva debug
  otro_codigo

VARIABLE PS4 — personaliza el prefijo del trace:
  export PS4='+ ${BASH_SOURCE}:${LINENO}: '
  bash -x script.sh     → ahora muestra archivo y número de línea

TÉCNICAS DE DEPURACIÓN:
  1. Añadir echo "DEBUG: var=$var" temporalmente
  2. Usar trap DEBUG para imprimir cada comando
  3. Comprobar códigos de retorno: cmd; echo "Retorno: $?"
  4. Aislar la sección problemática con set -x / set +x
  5. Redirigir debug a archivo: bash -x script.sh 2>debug.log""",
                "goal": "Usar bash -x para trazar la ejecución línea a línea. Activar y desactivar el trace dentro del script. Personalizar PS4 para ver números de línea.",
                "guide": """1. Crea un script con un bug deliberado:
   cat > ~/scripts/con_bug.sh << 'EOF'
#!/bin/bash
suma=0
for num in 1 2 3 4 5; do
  suma=$((suma + num))
done
echo "La suma es: $suma"

# Bug: variable con typo
resultado=$suma + 10   # Error: no usa $(()) correctamente
echo "Resultado: $resultado"
EOF

2. Verifica sintaxis sin ejecutar:
   bash -n ~/scripts/con_bug.sh

3. Ejecuta en modo trace:
   bash -x ~/scripts/con_bug.sh

4. Personaliza el prefijo del trace:
   export PS4='+ Línea ${LINENO}: '
   bash -x ~/scripts/con_bug.sh

5. Trace selectivo dentro del script:
   cat > ~/scripts/debug_selectivo.sh << 'EOF'
#!/bin/bash
echo "Código normal"
set -x   # Inicio debug
mi_var="prueba"
echo "Variable: $mi_var"
set +x   # Fin debug
echo "De vuelta a normal"
EOF
   bash ~/scripts/debug_selectivo.sh

6. Corrige el bug: suma=$((suma + 10))"""
            },
            {
                "title": "Scripts de Sistema: Información del Entorno", "difficulty": "medium", "idx": 10, "xp": 160, "t": 35,
                "description": """Un script de sistema recopila información sobre el entorno en el que se ejecuta. Es el primer paso para cualquier herramienta de administración.

Variables de entorno útiles:
  $HOME        → directorio home del usuario actual
  $USER        → nombre del usuario actual
  $SHELL       → intérprete de comandos actual
  $PATH        → rutas de búsqueda de ejecutables
  $HOSTNAME    → nombre del host
  $TERM        → tipo de terminal
  $LANG        → configuración regional
  $TMPDIR      → directorio temporal (o /tmp si no definido)
  $SECONDS     → segundos desde que se inició el script (muy útil)

Comandos del sistema para información:
  uname -a     → info del kernel y arquitectura
  hostname     → nombre del host
  id           → UID, GID y grupos del usuario actual
  whoami       → nombre del usuario actual
  uptime       → tiempo encendido, carga del sistema
  date         → fecha y hora actual
  nproc        → número de CPUs/cores
  free -h      → uso de memoria RAM y swap
  df -h        → uso de disco
  env          → todas las variables de entorno

Manipulación de PATH:
  echo $PATH
  export PATH="$PATH:/mi/nuevo/directorio"  → añade al PATH
  export PATH="/mi/dir:$PATH"               → añade al principio (prioridad)""",
                "goal": "Crear un script de información del sistema. Leer y manipular variables de entorno. Medir el tiempo de ejecución de un script.",
                "guide": """1. Script de información del sistema:
   cat > ~/scripts/sysinfo.sh << 'EOF'
#!/bin/bash
INICIO=$SECONDS
separator() { printf '%0.s─' {1..50}; echo; }

echo "╔══════════════════════════════════════════════════╗"
echo "║           INFORMACIÓN DEL SISTEMA                ║"
echo "╚══════════════════════════════════════════════════╝"

separator
printf "Usuario:    %s (UID=%s)\n" "$USER" "$(id -u)"
printf "Host:       %s\n" "$(hostname)"
printf "Shell:      %s\n" "$SHELL"
printf "Fecha:      %s\n" "$(date '+%d/%m/%Y %H:%M:%S')"
printf "Kernel:     %s\n" "$(uname -r)"
printf "Uptime:     %s\n" "$(uptime -p 2>/dev/null || uptime)"
separator
printf "CPUs:       %s cores\n" "$(nproc)"
printf "Memoria:    %s\n" "$(free -h | awk 'NR==2{print $3"/"$2}')"
printf "Disco /:    %s\n" "$(df -h / | awk 'NR==2{print $3"/"$2" ("$5")"}')"
separator

echo "Tiempo de ejecución del script: $((SECONDS - INICIO))s"
EOF
   chmod +x ~/scripts/sysinfo.sh && ~/scripts/sysinfo.sh"""
            },
        ])

        # ── MÓDULO 2: Control de Flujo ───────────────────────────────
        m2 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M2 — Control de Flujo").first()
        if not m2:
            m2 = Module(skill_path_id=path.id, title="M2 — Control de Flujo",
                description="Condicionales if/elif/else, case, bucles while/for/until y control de bucles con break/continue.",
                order_index=2, is_active=True, requires_validation=False)
            db.add(m2); db.commit(); db.refresh(m2)

        ins(db, m2, [
            {
                "title": "Condicionales: if, elif, else", "difficulty": "easy", "idx": 1, "xp": 110, "t": 25,
                "description": """La estructura if es el pilar del control de flujo. Ejecuta código solo si una condición es verdadera.

Sintaxis completa:
  if [ condición ]; then
    # código si verdadero
  elif [ otra_condición ]; then
    # código si segunda condición
  else
    # código por defecto
  fi

Reglas importantes:
  - El ; antes de then puede sustituirse por un salto de línea
  - Los espacios DENTRO de [ y ] son obligatorios: [ $a = $b ] ✅ vs [$a=$b] ❌
  - Con [[ se pueden usar &&, ||, !, =~, == con wildcards
  - Doble paréntesis (( )) para comparaciones numéricas (más limpio)

Forma corta (una línea):
  [ -f archivo ] && echo "existe" || echo "no existe"
  [[ $num -gt 10 ]] && echo "mayor" || echo "menor o igual"

Anidación:
  if [ condicion1 ]; then
    if [ condicion2 ]; then
      echo "Ambas verdaderas"
    fi
  fi""",
                "goal": "Escribir estructuras if/elif/else correctas. Usar [[ ]] para comparaciones avanzadas. Combinar condiciones con && y ||.",
                "guide": """1. Script clasificador con if/elif/else:
   cat > ~/scripts/clasificador.sh << 'EOF'
#!/bin/bash
read -p "Introduce un número (0-100): " nota

if [[ ! "$nota" =~ ^[0-9]+$ ]]; then
    echo "Error: '$nota' no es un número válido"
    exit 1
elif (( nota < 0 || nota > 100 )); then
    echo "Error: el número debe estar entre 0 y 100"
elif (( nota >= 90 )); then
    echo "Sobresaliente (A)"
elif (( nota >= 70 )); then
    echo "Notable (B)"
elif (( nota >= 60 )); then
    echo "Aprobado (C)"
else
    echo "Suspenso (F)"
fi
EOF
   chmod +x ~/scripts/clasificador.sh
   ~/scripts/clasificador.sh

2. Prueba con distintos valores:
   echo "85" | bash ~/scripts/clasificador.sh 2>/dev/null || bash -c 'read -p "Introduce un número: " n; echo $n' <<< 85

3. Verificar múltiples condiciones:
   archivo="/etc/hosts"
   if [[ -f "$archivo" && -r "$archivo" && -s "$archivo" ]]; then
     echo "El archivo existe, es legible y no está vacío"
   fi"""
            },
            {
                "title": "case: Múltiples Opciones", "difficulty": "easy", "idx": 2, "xp": 120, "t": 25,
                "description": """El comando `case` es más limpio que una cadena larga de if/elif cuando hay muchas opciones posibles. Es especialmente útil para menús y scripts que reciben argumentos.

Sintaxis:
  case "$variable" in
    patron1)
      comandos
      ;;           → termina el caso (como break en switch de C)
    patron2|patron3)  → múltiples patrones con |
      comandos
      ;;
    patron*)       → wildcard: cualquier cosa que empiece por "patron"
      comandos
      ;;
    *)             → caso por defecto (como else)
      comandos
      ;;
  esac

Patrones soportados:
  texto    → coincidencia exacta
  t*       → empieza por t
  ?.txt    → un carácter seguido de .txt
  [abc]    → a, b o c
  [0-9]    → dígito
  opcion1|opcion2  → alternativa""",
                "goal": "Crear un menú interactivo con case. Usar wildcards y alternativas en los patrones. Validar argumentos de un script con case.",
                "guide": """1. Menú interactivo:
   cat > ~/scripts/menu.sh << 'EOF'
#!/bin/bash
echo "=== MENÚ PRINCIPAL ==="
echo "1) Ver información del sistema"
echo "2) Listar archivos del directorio actual"
echo "3) Mostrar fecha y hora"
echo "4) Salir"
read -p "Elige una opción [1-4]: " opcion

case "$opcion" in
  1)
    echo "--- Sistema ---"
    uname -a
    ;;
  2)
    echo "--- Archivos ---"
    ls -la
    ;;
  3)
    echo "--- Fecha ---"
    date "+%A, %d de %B de %Y - %H:%M:%S"
    ;;
  4|q|Q|salir|exit)
    echo "Hasta luego!"
    exit 0
    ;;
  *)
    echo "Opción no válida: '$opcion'"
    exit 1
    ;;
esac
EOF
   chmod +x ~/scripts/menu.sh && ~/scripts/menu.sh

2. Validar extensión de archivo:
   cat > ~/scripts/tipo_archivo.sh << 'EOF'
#!/bin/bash
archivo=${1:-"test.txt"}
case "${archivo##*.}" in
  txt|md)    echo "$archivo → Documento de texto" ;;
  sh|bash)   echo "$archivo → Script de shell" ;;
  py)        echo "$archivo → Script de Python" ;;
  jpg|png)   echo "$archivo → Imagen" ;;
  *)         echo "$archivo → Tipo desconocido: .${archivo##*.}" ;;
esac
EOF
   bash ~/scripts/tipo_archivo.sh script.sh
   bash ~/scripts/tipo_archivo.sh foto.jpg
   bash ~/scripts/tipo_archivo.sh datos.csv"""
            },
            {
                "title": "Bucle for: Iterar sobre Listas", "difficulty": "easy", "idx": 3, "xp": 120, "t": 25,
                "description": """El bucle `for` itera sobre una lista de elementos. En Bash hay varias formas de usarlo.

1. For sobre lista de palabras:
  for item in uno dos tres cuatro; do
    echo "$item"
  done

2. For sobre rango numérico:
  for i in {1..10}; do echo $i; done         → 1 al 10
  for i in {0..20..2}; do echo $i; done      → pares de 0 a 20
  for i in {10..1}; do echo $i; done         → cuenta regresiva

3. For estilo C (con (( ))):
  for ((i=0; i<10; i++)); do echo $i; done

4. For sobre la salida de un comando:
  for archivo in $(ls *.sh 2>/dev/null); do
    echo "Script: $archivo"
  done

5. For sobre archivos con glob (MEJOR que $(ls)):
  for archivo in ~/scripts/*.sh; do
    echo "Script: $(basename $archivo)"
  done

6. For leyendo líneas de un archivo:
  while IFS= read -r linea; do
    echo "Línea: $linea"
  done < /etc/hosts""",
                "goal": "Usar las distintas formas del bucle for. Iterar sobre archivos con glob. Procesar la salida de comandos en un bucle.",
                "guide": """1. Iterar sobre números:
   for i in {1..5}; do
     printf "Iteración %d: %s\n" $i "$(date +%S) segundos"
   done

2. Countdown:
   for i in {10..1}; do
     echo -n "$i "
     sleep 0.2
   done
   echo "¡Despegue! 🚀"

3. For sobre archivos:
   echo "Scripts en ~/scripts:"
   for f in ~/scripts/*.sh; do
     [ -f "$f" ] || continue
     printf "  %-30s %s\n" "$(basename $f)" "$(wc -l < $f) líneas"
   done

4. For estilo C para tabla de multiplicar:
   cat > ~/scripts/tabla.sh << 'EOF'
#!/bin/bash
n=${1:-5}
echo "=== Tabla del $n ==="
for ((i=1; i<=10; i++)); do
  printf "%2d × %2d = %3d\n" $n $i $((n*i))
done
EOF
   bash ~/scripts/tabla.sh 7

5. Procesar argumentos con for:
   for arg in "$@"; do
     echo "Argumento: $arg"
   done <<< "$(echo 'a b c')"""
            },
            {
                "title": "Bucles while y until", "difficulty": "medium", "idx": 4, "xp": 130, "t": 30,
                "description": """`while` ejecuta mientras la condición sea verdadera. `until` ejecuta hasta que la condición sea verdadera (opuesto a while).

WHILE:
  while [ condición ]; do
    comandos
  done

Casos de uso:
  - Leer líneas de un archivo o comando
  - Esperar a que algo ocurra (polling)
  - Menús que se repiten

UNTIL:
  until [ condición ]; do
    comandos
  done

  Equivale a: while ! [ condición ]; do ...

LEER ARCHIVOS con while (la forma más segura):
  while IFS= read -r linea; do
    echo "Línea: $linea"
  done < archivo.txt

  IFS=  → no divide por espacios (preserva espacios iniciales/finales)
  -r    → no interpreta backslashes

WHILE CON PIPE (cuidado: el while corre en un subshell):
  comando | while read linea; do
    echo "$linea"
  done

BUCLE INFINITO:
  while true; do
    # código
    sleep 1
  done""",
                "goal": "Usar while para leer un archivo línea por línea. Crear un menú con while que se repite. Usar until para polling de condiciones.",
                "guide": """1. Leer un archivo línea por línea:
   while IFS= read -r linea; do
     echo "→ $linea"
   done < /etc/hosts

2. Menú persistente con while:
   cat > ~/scripts/menu_loop.sh << 'EOF'
#!/bin/bash
while true; do
  echo ""
  echo "1) Listar archivos"
  echo "2) Fecha actual"
  echo "3) Espacio en disco"
  echo "0) Salir"
  read -p "Opción: " op
  case $op in
    1) ls -la ;;
    2) date ;;
    3) df -h / ;;
    0) echo "Adiós"; break ;;
    *) echo "Opción inválida" ;;
  esac
done
EOF
   chmod +x ~/scripts/menu_loop.sh && ~/scripts/menu_loop.sh

3. Until: esperar a que un archivo exista:
   cat > ~/scripts/espera_archivo.sh << 'EOF'
#!/bin/bash
archivo=${1:-/tmp/señal}
echo "Esperando a que exista: $archivo"
until [ -f "$archivo" ]; do
  echo -n "."
  sleep 1
done
echo ""
echo "¡Archivo detectado!"
EOF
   chmod +x ~/scripts/espera_archivo.sh
   # En un terminal: bash ~/scripts/espera_archivo.sh &
   # En otro: touch /tmp/señal"""
            },
            {
                "title": "break, continue y Control de Bucles", "difficulty": "medium", "idx": 5, "xp": 130, "t": 25,
                "description": """`break` y `continue` permiten controlar el flujo dentro de los bucles.

BREAK:
  Termina el bucle inmediatamente y sale de él.
  break        → sale del bucle más interno
  break 2      → sale de los dos bucles más externos (para bucles anidados)

CONTINUE:
  Salta el resto del código de la iteración actual y va a la siguiente.
  continue     → salta a la siguiente iteración
  continue 2   → salta en el segundo bucle externo

SELECT (menú automático):
  select opcion in "opcion1" "opcion2" "salir"; do
    case $opcion in
      "salir") break ;;
      *) echo "Elegiste: $opcion" ;;
    esac
  done

Ejemplo de break 2 en bucles anidados:
  for i in {1..3}; do
    for j in {1..3}; do
      [[ $i -eq 2 && $j -eq 2 ]] && break 2
      echo "$i,$j"
    done
  done""",
                "goal": "Usar break y continue para controlar el flujo en bucles simples y anidados. Crear menús con select. Implementar un buscador con break al encontrar el resultado.",
                "guide": """1. Continue: saltar elementos indeseados:
   echo "Números del 1 al 10 que no sean múltiplos de 3:"
   for i in {1..10}; do
     (( i % 3 == 0 )) && continue
     echo -n "$i "
   done
   echo ""

2. Break: salir al encontrar algo:
   echo "Buscando el primer múltiplo de 7 mayor que 50:"
   for i in {51..200}; do
     if (( i % 7 == 0 )); then
       echo "Encontrado: $i"
       break
     fi
   done

3. Break 2 en bucles anidados:
   echo "Combinaciones hasta encontrar (3,3):"
   for i in {1..5}; do
     for j in {1..5}; do
       echo "$i,$j"
       [[ $i -eq 3 && $j -eq 3 ]] && { echo "¡Encontrado! Parando."; break 2; }
     done
   done

4. Menú con select:
   PS3="Elige una opción: "
   select opcion in "Ver fecha" "Ver disco" "Ver usuarios" "Salir"; do
     case $opcion in
       "Ver fecha")     date ;;
       "Ver disco")     df -h / ;;
       "Ver usuarios")  who ;;
       "Salir")         break ;;
       *)               echo "Opción no válida" ;;
     esac
   done"""
            },
            {
                "title": "Procesamiento de Argumentos con getopts", "difficulty": "hard", "idx": 6, "xp": 180, "t": 35,
                "description": """Los scripts profesionales usan flags como -v, -f archivo, -n 5 para recibir argumentos. `getopts` es la herramienta estándar de Bash para parsear este tipo de argumentos.

Sintaxis:
  while getopts ":hvf:n:" opcion; do
    case $opcion in
      h) mostrar_ayuda ;;
      v) verbose=true ;;
      f) archivo="$OPTARG" ;;    → -f requiere un valor (indicado por el : después)
      n) numero="$OPTARG" ;;
      :) echo "La opción -$OPTARG requiere un argumento" ;;
      ?) echo "Opción desconocida: -$OPTARG" ;;
    esac
  done
  shift $((OPTIND - 1))   → descarta los argumentos procesados, deja los posicionales

Variables especiales de getopts:
  $OPTARG  → el valor del argumento de la opción actual
  $OPTIND  → índice del siguiente argumento a procesar

La cadena de opciones:
  "hvf:n:"  → h y v no tienen argumento, f y n sí (marcados con :)
  ":"       → si empieza con :, getopts maneja los errores manualmente (silencioso)""",
                "goal": "Crear un script con flags estilo Unix usando getopts. Manejar opciones con y sin argumentos. Mostrar ayuda cuando se pasa -h.",
                "guide": """1. Script completo con getopts:
   cat > ~/scripts/backup.sh << 'EOF'
#!/bin/bash
# backup.sh — Script de backup con opciones

mostrar_ayuda() {
  cat << HELP
Uso: $0 [opciones] <directorio>
Opciones:
  -h            Muestra esta ayuda
  -v            Modo verbose
  -d <destino>  Directorio destino (default: /tmp/backup)
  -n <nombre>   Nombre del backup (default: backup)
Ejemplo: $0 -v -d /tmp -n mis_datos ~/scripts
HELP
  exit 0
}

verbose=false
destino="/tmp/backup"
nombre="backup"

while getopts ":hvd:n:" opt; do
  case $opt in
    h) mostrar_ayuda ;;
    v) verbose=true ;;
    d) destino="$OPTARG" ;;
    n) nombre="$OPTARG" ;;
    :) echo "ERROR: -$OPTARG requiere un argumento" >&2; exit 1 ;;
    ?) echo "ERROR: opción desconocida -$OPTARG" >&2; exit 1 ;;
  esac
done
shift $((OPTIND - 1))

origen=${1:-.}
[ -d "$origen" ] || { echo "ERROR: no existe el directorio: $origen" >&2; exit 1; }

mkdir -p "$destino"
archivo="${destino}/${nombre}_$(date +%Y%m%d_%H%M%S).tar.gz"

$verbose && echo "Origen:  $origen"
$verbose && echo "Destino: $archivo"

tar -czf "$archivo" "$origen" 2>/dev/null && echo "Backup creado: $archivo" || echo "Error en backup"
EOF
   chmod +x ~/scripts/backup.sh

2. Prueba las opciones:
   ~/scripts/backup.sh -h
   ~/scripts/backup.sh -v ~/scripts
   ~/scripts/backup.sh -v -d /tmp -n mis_scripts ~/scripts"""
            },
            {
                "title": "Funciones (preview) y Estructura de Scripts", "difficulty": "medium", "idx": 7, "xp": 150, "t": 30,
                "description": """Antes de profundizar en funciones (que se verán en M3), es fundamental entender cómo estructurar un script bien organizado.

ESTRUCTURA PROFESIONAL DE UN SCRIPT:
  #!/bin/bash
  #
  # Nombre: nombre_script.sh
  # Descripción: ¿Qué hace?
  # Uso: nombre_script.sh [opciones] argumento
  # Autor: Nombre | Fecha
  # Versión: 1.0

  set -euo pipefail   # Modo estricto
  IFS=$'\\n\\t'        # Word splitting seguro

  # ─── CONSTANTES ───────────────────────────
  readonly VERSION="1.0"
  readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

  # ─── FUNCIONES ────────────────────────────
  log()   { echo "[$(date +%H:%M:%S)] $*"; }
  error() { echo "ERROR: $*" >&2; exit 1; }
  uso()   { echo "Uso: $0 <args>"; exit 0; }

  # ─── MAIN ─────────────────────────────────
  main() {
    # lógica principal
    log "Inicio"
  }

  main "$@"   # Pasa todos los argumentos al main

Ventajas de esta estructura:
  - BASH_SOURCE[0]: ruta absoluta del script (funciona con symlinks)
  - readonly: evita que las constantes se modifiquen accidentalmente
  - main "$@": permite hacer source del script sin ejecutarlo""",
                "goal": "Escribir un script con estructura profesional. Usar BASH_SOURCE para obtener el directorio del script. Implementar funciones básicas de logging.",
                "guide": """1. Crea un script con estructura profesional:
   cat > ~/scripts/herramienta.sh << 'EOF'
#!/bin/bash
# herramienta.sh — Plantilla de script profesional
# Uso: herramienta.sh [-v] [-h] <argumento>
# Versión: 1.0

set -euo pipefail

# ─── CONSTANTES ───────────────────────────────────────
readonly VERSION="1.0"
readonly SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ─── FUNCIONES AUXILIARES ─────────────────────────────
log()     { echo "[$(date +%H:%M:%S)] INFO:  $*"; }
warn()    { echo "[$(date +%H:%M:%S)] WARN:  $*" >&2; }
error()   { echo "[$(date +%H:%M:%S)] ERROR: $*" >&2; exit 1; }
uso()     { echo "Uso: $SCRIPT_NAME [-v] [-h] <argumento>"; exit 0; }

# ─── PARSEO DE OPCIONES ───────────────────────────────
verbose=false
while getopts ":hv" opt; do
  case $opt in
    h) uso ;;
    v) verbose=true ;;
    ?) error "Opción desconocida: -$OPTARG" ;;
  esac
done
shift $((OPTIND-1))

# ─── MAIN ─────────────────────────────────────────────
main() {
  local argumento="${1:-default}"
  log "Script: $SCRIPT_NAME v$VERSION"
  log "Directorio: $SCRIPT_DIR"
  $verbose && log "Modo verbose activo"
  log "Argumento: $argumento"
  log "Completado"
}

main "$@"
EOF
   chmod +x ~/scripts/herramienta.sh
   ~/scripts/herramienta.sh -v "test"
   ~/scripts/herramienta.sh -h"""
            },
            {
                "title": "Proyecto M2: Script de Monitorización Básica", "difficulty": "hard", "idx": 8, "xp": 220, "t": 45,
                "description": """Proyecto integrador del módulo 2. Combina todo lo aprendido: variables, condicionales, bucles, getopts y estructura profesional.

El script `monitor.sh` comprueba el estado del sistema y alerta si algo supera los umbrales definidos:
  - Uso de CPU (si está disponible)
  - Uso de memoria RAM
  - Uso de disco en cada partición
  - Número de procesos activos

Requisitos:
  - Usa getopts para recibir: -u (umbral) -v (verbose) -h (ayuda)
  - Usa if/elif/else para clasificar el nivel de alerta
  - Usa while/for para recorrer las particiones
  - Formato de salida: [OK], [WARN], [CRIT] con colores ANSI

Colores ANSI en Bash:
  ROJO='\033[0;31m'
  VERDE='\033[0;32m'
  AMARILLO='\033[0;33m'
  NC='\033[0m'   → Reset (No Color)
  echo -e "${ROJO}Error${NC}" """,
                "goal": "Crear un script de monitorización completo. Usar colores ANSI en la salida. Combinar todos los elementos del módulo 2 en un script funcional.",
                "guide": """Crea el script completo:
   cat > ~/scripts/monitor.sh << 'EOF'
#!/bin/bash
set -euo pipefail
ROJO='\033[0;31m'; VERDE='\033[0;32m'; AMARIL='\033[0;33m'; NC='\033[0m'
UMBRAL_WARN=70; UMBRAL_CRIT=90; VERBOSE=false

uso() { echo "Uso: $0 [-u umbral_warn] [-v] [-h]"; exit 0; }
while getopts ":hvu:" o; do
  case $o in h) uso;; v) VERBOSE=true;; u) UMBRAL_WARN=$OPTARG;; esac
done

estado() {
  local val=$1 label=$2
  if (( val >= UMBRAL_CRIT )); then
    echo -e "[${ROJO}CRIT${NC}] $label: ${val}%"
  elif (( val >= UMBRAL_WARN )); then
    echo -e "[${AMARIL}WARN${NC}] $label: ${val}%"
  else
    echo -e "[${VERDE} OK ${NC}] $label: ${val}%"
  fi
}

echo "=== MONITOR DE SISTEMA $(date '+%d/%m/%Y %H:%M:%S') ==="

# Memoria
mem_uso=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
estado "$mem_uso" "Memoria RAM"

# Discos
while IFS= read -r linea; do
  uso=$(echo "$linea" | awk '{print $5}' | tr -d '%')
  punto=$(echo "$linea" | awk '{print $6}')
  [[ "$punto" == Mounted* ]] && continue
  estado "$uso" "Disco $punto"
done < <(df -h | tail -n +2)

# Procesos
num_proc=$(ps aux | wc -l)
echo -e "[INFO ] Procesos activos: $num_proc"
$VERBOSE && echo "Umbrales: WARN=$UMBRAL_WARN% CRIT=$UMBRAL_CRIT%"
EOF
   chmod +x ~/scripts/monitor.sh
   ~/scripts/monitor.sh -v
   ~/scripts/monitor.sh -u 50 -v"""
            },
        ])

        print("\n=== BASH PART 1 OK ===")
        print(f"  M1 ({m1.id}): Fundamentos — 10 labs")
        print(f"  M2 ({m2.id}): Control de Flujo — 8 labs")
        print("Ejecuta seed_bash_part2.py a continuación.")

    except Exception as e:
        print(f"ERROR: {e}"); import traceback; traceback.print_exc(); db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run()
