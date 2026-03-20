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

    # Get or create SkillPath (anti-duplicate)
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

    # ============================================================================
    # MODULE 1: M0 — ¿Qué es una Terminal?
    # ============================================================================
    module_m0 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M0 — ¿Qué es una Terminal?").first()
    if not module_m0:
        module_m0 = Module(
            skill_path_id=path.id,
            title="M0 — ¿Qué es una Terminal?",
            description="Comienza desde cero con los conceptos fundamentales de la terminal de Linux. Entiende qué es una terminal, cómo funciona el shell, la anatomía del prompt y cómo interactuar con comandos básicos.",
            order_index=1,
            is_active=True
        )
        db.add(module_m0)
        db.commit()
        db.refresh(module_m0)

    labs_m0_data = [
        {
            "title": "La Terminal: Tu Primera Conversación con Linux",
            "description": """## ¿Qué es una Terminal?

La **terminal** es tu puerta de entrada al poder oculto de Linux. A diferencia de la interfaz gráfica (GUI) donde haces clic en botones e iconos, la terminal te permite comunicarte directamente con el sistema operativo a través de comandos de texto.

### Terminal vs Shell vs Emulador

Es importante entender la diferencia entre estos términos:

- **Emulador de Terminal**: La aplicación que ves en pantalla (como GNOME Terminal, xterm, etc.). Es solo la ventana.
- **Terminal**: El dispositivo (históricamente físico, ahora virtual) que procesa entrada y salida.
- **Shell**: El intérprete de comandos que ejecuta lo que escribes (bash, zsh, fish, etc.).

### ¿Por Qué es Tan Poderosa?

La terminal te permite:
- **Automatizar tareas** que tomarían horas con clics
- **Acceder a funciones avanzadas** no disponibles en la GUI
- **Controlar múltiples sistemas** simultáneamente
- **Procesar millones de líneas de texto** en segundos
- **Escribir scripts** que realizan operaciones complejas

### Anatomía del Prompt: `user@hostname:path$`

Cuando ves una línea como `student@ubuntu:~$`, cada parte significa algo:

```
student       @ ubuntu    : ~     $
└─ usuario      hostname    ruta   tipo de shell
```

- **student**: Tu usuario actual en el sistema
- **ubuntu**: El nombre de la máquina (hostname)
- **~**: Tu directorio actual (~ significa "home" de tu usuario)
- **$**: Indica que eres un usuario normal (# sería root/administrador)

### Conceptos Básicos que Debes Saber

1. **Case-sensitive**: `ls` no es lo mismo que `LS`. Linux distingue mayúsculas.
2. **Espacios importan**: Los espacios separan comandos de argumentos.
3. **Tab completa**: Presiona Tab para autocompletar comandos y rutas.
4. **Historial**: Usa flecha arriba para repetir comandos anteriores.

### Mitos y Misconcepciones

- ❌ "La terminal es peligrosa": Solo si escribes comandos al azar sin entender qué hacen.
- ❌ "Solo es para hackers": Nope, es herramienta estándar para desarrolladores, administradores, científicos.
- ❌ "Es difícil de aprender": Verás que no. Los comandos son, en general, lógicos y consistentes.
- ❌ "Ya no se usa": Al contrario, está más relevante que nunca en la era del cloud, DevOps y automatización.
""",
            "goal_description": "Entiende qué es una terminal, cómo interactúa con Linux y la estructura básica del prompt. Verifica que puedas ver los archivos de bienvenida.",
            "difficulty": "easy",
            "scenario_setup": json.dumps({
                "initial_files": [
                    {
                        "path": "/home/student/bienvenida.txt",
                        "content": "¡Bienvenido a la terminal de Linux!"
                    },
                    {
                        "path": "/home/student/info.txt",
                        "content": "Este es tu primer archivo"
                    }
                ]
            }),
            "step_by_step_guide": """## Pasos a Seguir

1. **Observa tu entorno**: Ya estás en la terminal. Mira el prompt.
2. **Verifica tu ubicación**: Tu home está en `/home/student`.
3. **Usa `ls` para listar**: Ejecuta `ls` y verás los archivos.
4. **Éxito**: Cuando veas tanto `bienvenida.txt` como `info.txt`, has completado el laboratorio.

## Comando Clave

```bash
ls
```

Este comando muestra el contenido del directorio actual.
""",
            "order_index": 1,
            "xp_reward": 100,
            "time_limit": 20,
            "challenges": [
                {
                    "title": "Verificar archivos de bienvenida",
                    "description": "Usa `ls` para listar los archivos en tu directorio home. Debes ver exactamente estos dos archivos.",
                    "v_type": "directory_listing_exact",
                    "v_value": "bienvenida.txt,info.txt",
                    "hints": json.dumps([
                        "Escribe: ls",
                        "Los archivos deben aparecer en el orden: bienvenida.txt,info.txt"
                    ])
                }
            ]
        },
        {
            "title": "Anatomía del Prompt",
            "description": """## Decifrando el Prompt

El prompt que ves en pantalla contiene información valiosa. Aprendamos a leerlo como un profesional.

### Estructura Completa

```
student@ubuntu:~$
```

### Cada Componente

**1. El usuario: `student`**
- Es tu identidad en el sistema
- Diferentes usuarios tienen diferentes permisos y directorios home
- `whoami` te muestra quién eres

**2. El símbolo `@`**
- Simplemente significa "en" (at, en inglés)
- Separa usuario del hostname para claridad

**3. El hostname: `ubuntu`**
- Es el nombre de la máquina
- En una red, puedes conectarte a máquinas con diferentes nombres
- `hostname` te muestra el nombre actual
- Importante para administración remota

**4. El separador `:`**
- Divide el hostname de la ruta actual

**5. La ruta: `~`**
- `~` es un atajo para tu directorio home
- Para el usuario `student`, es equivalente a `/home/student`
- Tu home es donde guardas tus archivos personales
- Cuando ves `/root` o `/home/otro_usuario`, sabes que no estás en tu espacio

**6. El símbolo final**

```
user@host:path$    ← eres usuario normal
user@host:path#    ← eres root (administrador)
```

### Información que el Prompt NO Muestra (pero puedes descubrir)

- Tu directorio home exacto: `echo ~`
- Tu ruta absoluta completa: `pwd`
- Tu usuario actual: `whoami`
- Información de la máquina: `uname -a`

### Ejercicio: Lee el Prompt

Cada vez que veas:
```
student@ubuntu:~$
```

Debes pensar:
- "Soy el usuario `student`"
- "Estoy conectado a `ubuntu`"
- "Mi directorio actual es `~` (mi home)"
- "Tengo permisos normales (símbolo $)"

### Navegación y el Prompt

Cuando cambies de directorio con `cd`, el prompt actualiza automáticamente:

```
student@ubuntu:~$ cd /etc
student@ubuntu:/etc$
```

Ahora ves que estás en `/etc`, no en `~`. ¡Es como un GPS en tu sistema de archivos!
""",
            "goal_description": "Entiende cada parte del prompt y navega a tu directorio home (`/home/student`) para verificar tu ubicación.",
            "difficulty": "easy",
            "scenario_setup": json.dumps({
                "initial_files": []
            }),
            "step_by_step_guide": """## Pasos a Seguir

1. **Verifica dónde estás**: Usa `pwd` para mostrar tu ruta absoluta.
2. **Navega a home**: Si no estás en `/home/student`, usa `cd /home/student`.
3. **Confirma tu ubicación**: Ejecuta `pwd` nuevamente.
4. **Éxito**: Cuando `pwd` muestre exactamente `/home/student`, has completado.

## Comandos Clave

```bash
pwd          # Print Working Directory - muestra dónde estás
cd /ruta     # Change Directory - navega a una ruta
whoami       # Muestra tu usuario actual
hostname     # Muestra el nombre de la máquina
```
""",
            "order_index": 2,
            "xp_reward": 100,
            "time_limit": 20,
            "challenges": [
                {
                    "title": "Estar en el directorio home",
                    "description": "Navega a tu directorio home y verifica que estés exactamente en `/home/student`.",
                    "v_type": "path_exact",
                    "v_value": "/home/student",
                    "hints": json.dumps([
                        "Usa: pwd",
                        "Si no estás en /home/student, usa: cd /home/student",
                        "Luego verifica con: pwd"
                    ])
                }
            ]
        },
        {
            "title": "Tu Primera Sesión de Comandos",
            "description": """## Primeros Comandos en Linux

Ahora que entiendes el prompt, es hora de ejecutar tus primeros comandos reales.

### Comandos Básicos de Descubrimiento

**`whoami`** - ¿Quién soy?
```bash
$ whoami
student
```
Te muestra tu usuario actual en el sistema.

**`date`** - ¿Qué hora es?
```bash
$ date
Wed Mar 20 14:35:42 UTC 2026
```
Muestra la fecha y hora actual del sistema. Útil para ver logs, entender sincronización horaria, etc.

**`uname -a`** - ¿Qué sistema soy?
```bash
$ uname -a
Linux ubuntu 6.8.0-94-generic #106-Ubuntu SMP x86_64 GNU/Linux
```
Información completa sobre el kernel, arquitectura, sistema operativo. Vital cuando trabajas con múltiples máquinas.

### Otras Órdenes Útiles

**`echo`** - Imprime texto
```bash
$ echo "Hola Linux"
Hola Linux
```

**`clear`** - Limpia la pantalla
```bash
$ clear
```
Útil cuando la terminal está llena y quieres empezar "limpio".

**`pwd`** - Dónde estoy
```bash
$ pwd
/home/student
```

**`ls`** - Lista archivos
```bash
$ ls
archivo1.txt  archivo2.txt  directorio/
```

### Anatomía de un Comando

```bash
comando        argumento     opción
   ↓              ↓            ↓
  grep          "error"      -i  archivo.log
```

- **comando**: lo que quieres hacer
- **argumento**: sobre qué lo haces
- **opciones**: cómo lo haces (usualmente empiezan con -)

### Pautas Importantes

1. **Escribe con cuidado**: `date` funciona, `DATE` o `Date` pueden no funcionar
2. **Usa espacios**: `ls-l` no es lo mismo que `ls -l`
3. **No tengas miedo de intentar**: Los comandos seguros (como `date`, `pwd`, `whoami`) no rompen nada
4. **Lee los mensajes de error**: Te dan pistas sobre qué salió mal
""",
            "goal_description": "Ejecuta comandos básicos (`whoami`, `date`, `uname -a`) y guarda los resultados en un archivo para confirmar que entiendes cómo funcionan.",
            "difficulty": "easy",
            "scenario_setup": json.dumps({
                "initial_files": [
                    {
                        "path": "/home/student/mis_comandos.txt",
                        "content": "whoami\ndate\nuname"
                    }
                ]
            }),
            "step_by_step_guide": """## Pasos a Seguir

1. **Verifica el archivo**: Usa `cat /home/student/mis_comandos.txt` para ver qué contiene.
2. **Ejecuta los comandos**: Uno por uno, ejecuta:
   - `whoami`
   - `date`
   - `uname -a`
3. **Observa la salida**: Nota cómo cada uno te da información diferente.
4. **Éxito**: El sistema verificará que el archivo contiene la palabra "whoami".

## Comandos para Usar

```bash
cat /home/student/mis_comandos.txt    # Ver contenido del archivo
whoami                                 # Ejecutar primer comando
date                                   # Ejecutar segundo comando
uname -a                               # Ejecutar tercer comando
```
""",
            "order_index": 3,
            "xp_reward": 100,
            "time_limit": 20,
            "challenges": [
                {
                    "title": "Verificar archivo de comandos",
                    "description": "El archivo `/home/student/mis_comandos.txt` debe contener la palabra 'whoami'.",
                    "v_type": "file_content_flag",
                    "v_value": "whoami",
                    "v_extra": "/home/student/mis_comandos.txt",
                    "hints": json.dumps([
                        "Verifica el contenido: cat /home/student/mis_comandos.txt",
                        "Debe contener 'whoami' entre sus líneas"
                    ])
                }
            ]
        },
        {
            "title": "Historial y Atajos de Teclado",
            "description": """## Domina tu Teclado

Trabajar en la terminal es mucho más eficiente cuando conoces los atajos de teclado. Estos pequeños trucos te ahorran horas de escritura.

### Atajos de Control Más Importantes

**`Ctrl+C`** - Interrumpir
```
Detiene el comando que se está ejecutando. Super útil si:
- Un comando tarda demasiado
- Accidentalmente ejecutaste algo incorrecto
- Un proceso se "cuelga"

Puedes presionar Ctrl+C tantas veces como necesites.
```

**`Ctrl+D`** - End of File (EOF)
```
Señala el fin de la entrada. Usado para:
- Salir de la terminal (aunque exit es más normal)
- Cerrar un programa interactivo
- En algunos casos, enviar EOF a un programa
```

**`Ctrl+L`** - Limpiar pantalla
```
Igual a escribir 'clear'. Limpia toda la pantalla.
Útil cuando tienes mucho texto y quieres empezar fresco.
Es más rápido que escribir 'clear'.
```

**`Ctrl+A`** - Inicio de línea
```
Mueve el cursor al principio de la línea actual.
En lugar de presionar Home, este atajo es universal.
```

**`Ctrl+E`** - Fin de línea
```
Mueve el cursor al final de la línea actual.
En lugar de presionar End, este atajo es universal.
```

### Navegación del Historial

**`↑ Flecha Arriba`** - Comando anterior
```
Recupera el último comando que ejecutaste.
Presiona múltiples veces para ir hacia atrás en el historial.
```

**`↓ Flecha Abajo`** - Comando siguiente
```
Va adelante en el historial (si estás navegando hacia atrás).
```

**`Ctrl+R`** - Búsqueda inversa
```
Busca en tu historial. Escribe parte de un comando y te mostrará coincidencias.
Presiona Ctrl+R de nuevo para encontrar la siguiente coincidencia.
Super útil para comandos que ejecutaste hace semanas.
```

**`Ctrl+U`** - Borrar línea
```
Borra toda la línea desde el cursor al inicio.
```

**`Ctrl+K`** - Borrar línea (final)
```
Borra toda la línea desde el cursor al final.
```

### Autocompletado con Tab

**`Tab`** - Autocompletar
```
Completa automáticamente nombres de archivos y comandos.

Ejemplo:
$ cat /hom[TAB]
Se convierte en:
$ cat /home/

Presiona Tab nuevamente para ver todas las opciones.
```

### Consejos Prácticos

1. **Combina atajos**: Ctrl+A para ir al inicio, Ctrl+A después Ctrl+K para borrar todo.
2. **Tab es tu amigo**: Úsalo constantemente para evitar typos.
3. **Historial es poderoso**: Ctrl+R es oro puro cuando recuerdas parte de un comando.
4. **Ctrl+C es seguro**: No borra archivos, solo detiene ejecución.
""",
            "goal_description": "Aprende y practica los atajos de teclado más importantes. Crea un archivo con los atajos para referencia.",
            "difficulty": "easy",
            "scenario_setup": json.dumps({
                "initial_files": [
                    {
                        "path": "/home/student/atajos.txt",
                        "content": "ctrl-c: interrumpir\nctrl-l: limpiar\ntab: autocompletar"
                    }
                ]
            }),
            "step_by_step_guide": """## Pasos a Seguir

1. **Verifica el archivo de atajos**:
   ```bash
   cat /home/student/atajos.txt
   ```

2. **Practica los atajos**:
   - Presiona Ctrl+L para limpiar
   - Escribe algo y presiona Ctrl+A, Ctrl+K para borrar
   - Usa flecha arriba para ver comandos anteriores

3. **Crea un nuevo archivo** si lo deseas, con más atajos

4. **Éxito**: El archivo existe cuando completamos la verificación.

## Comandos de Referencia

```bash
cat /home/student/atajos.txt    # Ver los atajos
# Ahora práctica presionando los atajos en tu teclado
```
""",
            "order_index": 4,
            "xp_reward": 100,
            "time_limit": 20,
            "challenges": [
                {
                    "title": "Archivo de atajos debe existir",
                    "description": "El archivo `/home/student/atajos.txt` debe existir con los atajos documentados.",
                    "v_type": "file_created",
                    "v_value": "/home/student/atajos.txt",
                    "hints": json.dumps([
                        "El archivo ya fue creado para ti",
                        "Verifica: cat /home/student/atajos.txt",
                        "Debe contener información sobre ctrl-c, ctrl-l y tab"
                    ])
                }
            ]
        },
        {
            "title": "Pedir Ayuda: man, --help, info",
            "description": """## El Arte de Pedir Ayuda en Linux

Uno de los superpoderes de Linux es su documentación incorporada. Nunca necesitas buscar en Google para entender un comando básico. ¡Está ahí mismo en tu terminal!

### `man` - El Manual

**Uso básico:**
```bash
man ls         # Ver el manual de 'ls'
man grep       # Ver el manual de 'grep'
man man        # Hasta 'man' tiene un manual
```

**Dentro del manual:**
- Presiona `spacebar` para pasar página
- Presiona `q` para salir
- Presiona `/` para buscar
- Presiona `h` para ayuda sobre navegación
- Presiona `n` para siguiente resultado de búsqueda
- Presiona `N` para resultado anterior

**Estructura de un man page:**
```
NAME           - Nombre y descripción breve
SYNOPSIS       - Sintaxis del comando
DESCRIPTION    - Explicación detallada
OPTIONS        - Todas las opciones disponibles
EXAMPLES       - Ejemplos de uso
SEE ALSO       - Comandos relacionados
```

**Ejemplo de exploración:**
```bash
$ man ls
# Dentro del man page:
# Presiona / y escribe "recursive"
# Te llevará a la documentación de la opción -R
```

### `--help` - Ayuda Rápida

La mayoría de comandos soportan esta opción para mostrar ayuda breve:

```bash
ls --help      # Ayuda corta sobre ls
grep --help    # Ayuda corta sobre grep
```

Mucho más conciso que `man`, pero menos detallado. Perfecto cuando necesitas un recordatorio rápido.

### `man -k` - Búsqueda por Palabra Clave

¿Quieres encontrar comandos relacionados con un tema?

```bash
man -k "file"           # Encuentra todos los comandos sobre "file"
man -k "password"       # Encuentra comandos relacionados a contraseñas
man -k "network"        # Encuentra comandos de red
```

Esto busca en la base de datos `whatis`, que contiene descripción breve de todos los comandos instalados.

### `info` - Documentación GNU

Para algunos comandos GNU, `info` proporciona documentación más profunda:

```bash
info ls
info find
```

**Navegación en info:**
- `Space` para siguiente página
- `?` para menú de ayuda
- `q` para salir
- `n` para siguiente nodo
- `p` para nodo anterior

### Otros Recursos Útiles

**`whatis`** - Descripción de una línea
```bash
whatis ls       # "ls (1) - list directory contents"
whatis grep     # "grep (1) - print lines matching a pattern"
```

**`apropos`** - Sinónimo de `man -k`
```bash
apropos "copy"  # Encuentra comandos para copiar
```

### Estrategia de Búsqueda

Cuando necesitas ayuda:

1. **Para recordatorio rápido**: `comando --help`
2. **Para aprender a fondo**: `man comando`
3. **Para encontrar un comando**: `man -k palabra_clave`
4. **Para explorar un tema**: `apropos tema`

### Ejemplo Práctico

Quiero buscar cómo buscar archivos con criterios complejos:

```bash
$ man -k "search file"
find (1)    - search for files in a directory hierarchy
locate (1)  - find files by name
$ man find
# Ahora puedo leer la documentación completa de find
```

### La Terminal es Auto-documental

Recuerda: **todo lo que necesitas saber sobre un comando está en `man`**. Los desarrolladores están obligados a documentar sus comandos. Úsalo sin vergüenza.
""",
            "goal_description": "Explora los sistemas de ayuda de Linux (man, --help, info) y crea un directorio de referencia.",
            "difficulty": "easy",
            "scenario_setup": json.dumps({
                "initial_files": []
            }),
            "step_by_step_guide": """## Pasos a Seguir

1. **Explora los sistemas de ayuda**:
   ```bash
   ls --help                 # Ver ayuda rápida
   man -k "terminal"         # Buscar comandos sobre "terminal"
   whatis echo              # Descripción de echo
   ```

2. **Crea el directorio de ayuda**:
   ```bash
   mkdir -p /home/student/ayuda
   ```

3. **Guarda algunos comandos de ayuda**:
   ```bash
   ls --help > /home/student/ayuda/ls_help.txt
   whatis grep > /home/student/ayuda/grep_help.txt
   ```

4. **Verifica**:
   ```bash
   ls /home/student/ayuda
   ```

## Comandos Clave

```bash
man <comando>              # Manual completo
<comando> --help           # Ayuda rápida
man -k <palabra>          # Buscar por palabra clave
whatis <comando>          # Descripción de una línea
apropos <tema>            # Sinónimo de man -k
```
""",
            "order_index": 5,
            "xp_reward": 100,
            "time_limit": 25,
            "challenges": [
                {
                    "title": "Crear directorio de ayuda",
                    "description": "Crea el directorio `/home/student/ayuda` para almacenar documentación.",
                    "v_type": "directory_created",
                    "v_value": "/home/student/ayuda",
                    "hints": json.dumps([
                        "Usa: mkdir /home/student/ayuda",
                        "O con -p si quieres crear padres también: mkdir -p /home/student/ayuda",
                        "Verifica con: ls -d /home/student/ayuda"
                    ])
                }
            ]
        }
    ]

    for l_data in labs_m0_data:
        existing = db.query(Lab).filter(Lab.module_id == module_m0.id, Lab.title == l_data["title"]).first()
        if existing:
            continue
        lab = Lab(
            module_id=module_m0.id,
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

    # ============================================================================
    # MODULE 2: M1 — Texto y Filtros
    # ============================================================================
    module_m1 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M1 — Texto y Filtros").first()
    if not module_m1:
        module_m1 = Module(
            skill_path_id=path.id,
            title="M1 — Texto y Filtros",
            description="Domina las herramientas de procesamiento de texto más poderosas de Linux. Aprende grep, sed, awk, cut, sort y más. Estos comandos son la base de cualquier automatización seria.",
            order_index=2,
            is_active=True
        )
        db.add(module_m1)
        db.commit()
        db.refresh(module_m1)

    labs_m1_data = [
        {
            "title": "grep: Busca Texto como un Pro",
            "description": """## El Poder de grep: Buscar en el Caos

`grep` es posiblemente el comando más importante que aprenderás. **G**lobally search a **R**egular **E**xpression and **P**rint matching lines. Es tu brújula en un océano de texto.

### Uso Básico

```bash
grep "patron" archivo.txt    # Busca "patron" en archivo.txt
```

Por ejemplo:
```bash
$ grep "ERROR" sistema.log
2024-01-01 ERROR Disco lleno
2024-01-02 ERROR Servicio caido
```

Solo muestra las líneas que contienen "ERROR".

### Opciones Fundamentales

**`-i`** - Ignora mayúsculas/minúsculas
```bash
grep -i "error" sistema.log    # Encuentra ERROR, Error, error, eRrOr
```

Vital cuando buscas datos y no sabes la capitalización exacta.

**`-n`** - Muestra número de línea
```bash
grep -n "ERROR" sistema.log
2:2024-01-01 ERROR Disco lleno
5:2024-01-02 ERROR Servicio caido
```

Útil para encontrar dónde está algo exactamente.

**`-c`** - Cuenta coincidencias
```bash
grep -c "INFO" sistema.log
4
```

No muestra las líneas, solo cuántas hay. Perfecto para estadísticas.

**`-v`** - Invierte la búsqueda (NOT)
```bash
grep -v "INFO" sistema.log    # Muestra todo EXCEPTO líneas con INFO
```

Útil para filtrar ruido.

**`-r`** - Busca recursivamente en directorios
```bash
grep -r "TODO" /home/student/    # Busca en todos los archivos del directorio
grep -r "password" /etc/          # Busca en toda configuración
```

Imprescindible cuando tienes múltiples archivos.

**`-w`** - Busca palabras completas
```bash
grep -w "error" archivo.txt    # Encuentra "error" como palabra completa
                               # NO encuentra "errors" o "errores"
```

Evita falsos positivos.

### Combinando Opciones

Puedes combinar opciones:

```bash
grep -in "ERROR" sistema.log      # Case-insensitive + números de línea
grep -vc "INFO" sistema.log       # Cuenta líneas SIN "INFO"
grep -rn "TODO" .                 # Busca recursivamente + muestra línea
```

### Patrón vs Literal

Búsqueda literal (plain text):
```bash
grep "2024-01-01" sistema.log     # Busca esta fecha exacta
```

Con regex (expresiones regulares - tema avanzado):
```bash
grep "2024-01-[0-9]+" sistema.log # Busca "2024-01-" seguido de dígitos
grep "ERROR|WARN" sistema.log     # Busca ERROR o WARN
```

### Casos de Uso Reales

**Buscar errores en logs:**
```bash
grep "ERROR" /var/log/syslog
```

**Encontrar usuarios específicos:**
```bash
grep "student" /etc/passwd
```

**Buscar líneas que NO contienen algo:**
```bash
grep -v "#" archivo_config.txt    # Ignora comentarios
```

**Contar cuántas veces aparece algo:**
```bash
grep -o "ERROR" sistema.log | wc -l
```

### Ejercicio Mental

¿Qué hace esto?
```bash
grep -in "warn" sistema.log
```

Respuesta: Busca "WARN", "Warn", "warn", etc. (case-insensitive con -i) y muestra el número de línea (-n) de cada coincidencia.
""",
            "goal_description": "Practica grep para buscar patrones en archivos de log. Crea un archivo con los errores encontrados.",
            "difficulty": "easy",
            "scenario_setup": json.dumps({
                "initial_files": [
                    {
                        "path": "/home/student/logs/sistema.log",
                        "content": "2024-01-01 INFO Sistema iniciado\n2024-01-01 WARN Memoria al 80%\n2024-01-01 ERROR Disco lleno\n2024-01-02 INFO Backup completado\n2024-01-02 WARN CPU alta\n2024-01-02 ERROR Servicio caido"
                    },
                    {
                        "path": "/home/student/usuarios.txt",
                        "content": "admin\nstudent\nroot\nuser1\nuser2"
                    }
                ]
            }),
            "step_by_step_guide": """## Pasos a Seguir

1. **Busca errores en el log**:
   ```bash
   grep "ERROR" /home/student/logs/sistema.log
   ```

2. **Guarda los errores en un archivo**:
   ```bash
   grep "ERROR" /home/student/logs/sistema.log > /home/student/errores.txt
   ```

3. **Verifica el archivo creado**:
   ```bash
   cat /home/student/errores.txt
   ```

4. **Éxito**: El archivo debe contener las líneas con ERROR.

## Comandos Clave

```bash
grep "ERROR" /home/student/logs/sistema.log      # Busca ERROR
grep -i "error" /home/student/logs/sistema.log   # Case-insensitive
grep -c "ERROR" /home/student/logs/sistema.log   # Cuenta coincidencias
grep -v "INFO" /home/student/logs/sistema.log    # Todo excepto INFO
```
""",
            "order_index": 1,
            "xp_reward": 150,
            "time_limit": 30,
            "challenges": [
                {
                    "title": "Crear archivo de errores",
                    "description": "Usa grep para extraer todas las líneas con 'ERROR' del log y guárdalas en un archivo.",
                    "v_type": "file_created",
                    "v_value": "/home/student/errores.txt",
                    "hints": json.dumps([
                        "Usa: grep \"ERROR\" /home/student/logs/sistema.log > /home/student/errores.txt",
                        "El > redirige la salida a un archivo",
                        "Verifica con: cat /home/student/errores.txt"
                    ])
                },
                {
                    "title": "El archivo debe contener ERROR",
                    "description": "El archivo de errores debe contener la palabra 'ERROR'.",
                    "v_type": "file_content_flag",
                    "v_value": "ERROR",
                    "v_extra": "/home/student/errores.txt",
                    "hints": json.dumps([
                        "Verifica: cat /home/student/errores.txt",
                        "Debe mostrar líneas que contienen 'ERROR'"
                    ])
                }
            ]
        },
        {
            "title": "sed: Edita Texto en el Flujo",
            "description": """## sed: El Editor de Flujo

`sed` significa **S**tream **ED**itor. A diferencia de editores como `nano` o `vim`, `sed` no abre un archivo interactivamente. En su lugar, transforma flujos de texto sobre la marcha.

### Patrón Básico

```bash
sed 's/viejo/nuevo/' archivo.txt    # Sustituye "viejo" con "nuevo"
sed 's/viejo/nuevo/g' archivo.txt   # Sustituye TODAS las ocurrencias (global)
sed 's/viejo/nuevo/' archivo.txt    # Sustituye solo la primera de cada línea
```

### Opciones Comunes

**Rango de líneas:**
```bash
sed '1,5s/viejo/nuevo/' archivo.txt    # Sustituye solo en líneas 1-5
sed '10s/viejo/nuevo/' archivo.txt     # Sustituye solo en línea 10
```

**`-i`** - Edita en lugar (in-place)
```bash
sed -i 's/viejo/nuevo/g' archivo.txt    # Modifica el archivo directamente
```

Sin `-i`, `sed` solo muestra el resultado, no modifica el archivo.

**`/d`** - Borra líneas
```bash
sed '/viejo/d' archivo.txt           # Borra todas las líneas que contienen "viejo"
sed '5d' archivo.txt                 # Borra la línea 5
sed '1,3d' archivo.txt               # Borra líneas 1 a 3
```

**`/p`** - Imprime líneas (con `-n`)
```bash
sed -n '/ERROR/p' archivo.txt        # Imprime solo líneas con ERROR (como grep)
sed -n '10,20p' archivo.txt          # Imprime solo líneas 10 a 20
```

**Separadores alternativos:**
```bash
sed 's/viejo/nuevo/' archivo.txt      # Usa / como separador (estándar)
sed 's|viejo|nuevo|' archivo.txt      # Usa | como separador (útil si busca tiene /)
sed 's@viejo@nuevo@' archivo.txt      # Usa @ como separador
```

Útil cuando buscar o reemplazar contiene /.

### Ejemplo: Cambiar Configuración

Tienes `config.txt`:
```
hostname=servidor_viejo
port=8080
mode=debug
password=1234
```

Y quieres cambiar el nombre:

```bash
sed 's/servidor_viejo/servidor_nuevo/' config.txt
```

Salida:
```
hostname=servidor_nuevo
port=8080
mode=debug
password=1234
```

Para modificar el archivo actual:
```bash
sed -i 's/servidor_viejo/servidor_nuevo/' config.txt
```

### Casos de Uso Reales

**Cambiar extensión de múltiples archivos:**
```bash
sed -i 's/\.txt/.log/' nombrelista.txt
```

**Limpiar líneas vacías:**
```bash
sed '/^$/d' archivo.txt    # Borra líneas vacías
```

**Cambiar formato de fecha:**
```bash
sed 's/\([0-9]*\)-\([0-9]*\)-\([0-9]*\)/\3\/\2\/\1/' archivo.txt
```
(Cambia YYYY-MM-DD a DD/MM/YYYY con grupos de captura)

**Comentar líneas:**
```bash
sed 's/^/#/' archivo.txt    # Comenta todas las líneas
```

### Diferencia: grep vs sed

| Comando | Función | Modifica Archivo |
|---------|---------|------------------|
| `grep` | Busca y muestra | NO |
| `sed` | Busca y sustituye/edita | Opcional con `-i` |

### Advertencia

Siempre prueba `sed` sin `-i` primero:
```bash
sed 's/viejo/nuevo/' archivo.txt    # Ver resultado
sed -i 's/viejo/nuevo/' archivo.txt # Aplicar cambios (cuidado!)
```

O haz backup:
```bash
cp archivo.txt archivo.txt.bak
sed -i 's/viejo/nuevo/' archivo.txt
```
""",
            "goal_description": "Usa sed para cambiar configuración. Modifica 'servidor_viejo' a 'servidor_nuevo' en el archivo de configuración.",
            "difficulty": "medium",
            "scenario_setup": json.dumps({
                "initial_files": [
                    {
                        "path": "/home/student/config.txt",
                        "content": "hostname=servidor_viejo\nport=8080\nmode=debug\npassword=1234"
                    }
                ]
            }),
            "step_by_step_guide": """## Pasos a Seguir

1. **Ver el contenido actual**:
   ```bash
   cat /home/student/config.txt
   ```

2. **Probar sed sin modificar**:
   ```bash
   sed 's/servidor_viejo/servidor_nuevo/' /home/student/config.txt
   ```

3. **Aplicar cambio en el archivo**:
   ```bash
   sed -i 's/servidor_viejo/servidor_nuevo/' /home/student/config.txt
   ```

4. **Verificar que cambió**:
   ```bash
   cat /home/student/config.txt
   ```

## Comandos Clave

```bash
sed 's/viejo/nuevo/' archivo.txt       # Ver cambio sin aplicar
sed -i 's/viejo/nuevo/' archivo.txt    # Aplicar cambio
sed 's/viejo/nuevo/g' archivo.txt      # Reemplazar TODOS (global)
sed -i 's/servidor_viejo/servidor_nuevo/' /home/student/config.txt
```
""",
            "order_index": 2,
            "xp_reward": 150,
            "time_limit": 35,
            "challenges": [
                {
                    "title": "Cambiar hostname en config",
                    "description": "Usa sed para cambiar 'servidor_viejo' a 'servidor_nuevo' en `/home/student/config.txt`.",
                    "v_type": "file_content_flag",
                    "v_value": "servidor_nuevo",
                    "v_extra": "/home/student/config.txt",
                    "hints": json.dumps([
                        "Usa: sed -i 's/servidor_viejo/servidor_nuevo/' /home/student/config.txt",
                        "Verifica con: cat /home/student/config.txt",
                        "Debe mostrar 'servidor_nuevo' en lugar de 'servidor_viejo'"
                    ])
                }
            ]
        },
        {
            "title": "awk: Procesamiento de Columnas",
            "description": """## awk: El Procesador de Columnas

`awk` es increíblemente poderoso. Procesa archivos línea por línea y columna por columna. A muchos sysadmins les encanta porque puede hacer cosas que grep y sed no pueden.

### Estructura Básica

```bash
awk '{print $1}' archivo.txt        # Imprime la primera columna
awk '{print $2}' archivo.txt        # Imprime la segunda columna
awk '{print $0}' archivo.txt        # Imprime la línea completa
```

`$0` = línea completa, `$1` = primera columna, `$2` = segunda, etc.

### Especificar Separador

Por defecto, awk usa espacios y tabulaciones como separadores. Cambia con `-F`:

```bash
awk -F',' '{print $1}' archivo.csv      # CSV: usa coma como separador
awk -F':' '{print $1}' /etc/passwd      # Usa : como separador
```

### Variables Especiales

**`NR`** - Número de Línea (Number of Record)
```bash
awk '{print NR, $0}' archivo.txt        # Muestra número de línea + línea
```

**`NF`** - Número de Campos (Number of Fields)
```bash
awk '{print NF}' archivo.txt            # Muestra cuántos campos tiene cada línea
awk '{print $NF}' archivo.txt           # Imprime el último campo
```

**`FILENAME`** - Nombre del archivo
```bash
awk '{print FILENAME, $0}' *.txt        # Muestra nombre de archivo + contenido
```

### Condiciones

```bash
awk '$1 == "ERROR"' archivo.txt         # Imprime líneas donde primer campo es ERROR
awk '$2 > 100' archivo.txt              # Imprime líneas donde segundo campo > 100
awk '$3 ~ /pattern/' archivo.txt        # Imprime líneas donde tercer campo contiene pattern
```

### Cálculos

```bash
awk '{sum += $2} END {print sum}' numeros.txt        # Suma columna 2
awk '{count++} END {print count}' archivo.txt        # Cuenta líneas
awk '{print $1, $2 * 2}' archivo.txt                 # Multiplica columna 2 por 2
```

### BEGIN y END

Ejecuta código antes (BEGIN) o después (END) de procesar:

```bash
awk 'BEGIN {print "Iniciando..."} {print} END {print "Fin"}' archivo.txt
```

Útil para inicializar variables o mostrar resumen final.

### Ejemplo: Procesar Ventas

Archivo: `ventas.txt`
```
producto precio cantidad
manzana 1.50 100
naranja 0.80 200
pera 2.00 50
banana 0.60 300
```

Mostrar producto y cantidad:
```bash
awk '{print $1, $3}' ventas.txt
```

Salida:
```
producto cantidad
manzana 100
naranja 200
pera 50
banana 300
```

Mostrar solo frutas con cantidad > 100:
```bash
awk '$3 > 100 {print $1, $3}' ventas.txt
```

Salida:
```
manzana 100
naranja 200
banana 300
```

Calcular total en dinero (precio × cantidad):
```bash
awk '{total += $2 * $3} END {print "Total:", total}' ventas.txt
```

Salida:
```
Total: 465
```

### awk vs sed vs grep

| Tool | Busca | Reemplaza | Columnas | Matemática |
|------|-------|-----------|----------|-----------|
| grep | ✓ | ✗ | ✗ | ✗ |
| sed | ✓ | ✓ | ✗ | ✗ |
| awk | ✓ | (✓) | ✓ | ✓ |

### Comando Mental

¿Qué hace esto?
```bash
awk -F',' '$2 > 50 {print $1, $2}' datos.csv
```

Respuesta: Lee un CSV (-F,), encuentra líneas donde el segundo campo es mayor a 50, e imprime el primero y segundo campos de esas líneas.
""",
            "goal_description": "Usa awk para procesar datos tabulares. Extrae información de ventas y calcula totales.",
            "difficulty": "medium",
            "scenario_setup": json.dumps({
                "initial_files": [
                    {
                        "path": "/home/student/ventas.txt",
                        "content": "producto precio cantidad\nmanzana 1.50 100\nnaranja 0.80 200\npera 2.00 50\nbanana 0.60 300"
                    }
                ]
            }),
            "step_by_step_guide": """## Pasos a Seguir

1. **Ver el archivo de ventas**:
   ```bash
   cat /home/student/ventas.txt
   ```

2. **Extraer solo nombres y precios**:
   ```bash
   awk '{print $1, $2}' /home/student/ventas.txt
   ```

3. **Calcular ingreso (precio × cantidad) y guardar**:
   ```bash
   awk '{print $1, $2 * $3}' /home/student/ventas.txt > /home/student/precios.txt
   ```

4. **Verificar**:
   ```bash
   cat /home/student/precios.txt
   ```

## Comandos Clave

```bash
awk '{print $1}' archivo.txt           # Primera columna
awk '{print $1, $2}' archivo.txt       # Primera y segunda columna
awk '{print $2 * $3}' archivo.txt      # Operación: multiplicar columnas
awk 'NR > 1 {print $1, $2*$3}' ventas.txt  # Saltando encabezado
```
""",
            "order_index": 3,
            "xp_reward": 175,
            "time_limit": 40,
            "challenges": [
                {
                    "title": "Crear archivo de precios procesado",
                    "description": "Usa awk para calcular el total por producto (precio × cantidad) y guarda en un archivo.",
                    "v_type": "file_created",
                    "v_value": "/home/student/precios.txt",
                    "hints": json.dumps([
                        "Usa: awk '{print $1, $2 * $3}' /home/student/ventas.txt > /home/student/precios.txt",
                        "O con encabezado: awk 'NR>1 {print $1, $2*$3}' /home/student/ventas.txt > /home/student/precios.txt",
                        "Verifica con: cat /home/student/precios.txt"
                    ])
                }
            ]
        },
        {
            "title": "cut, sort y uniq",
            "description": """## Tres Utilidades Potentes

### cut: Extrae Columnas

`cut` es simple: extrae secciones específicas de cada línea.

**Por posición de carácter:**
```bash
cut -c 1-5 archivo.txt      # Caracteres 1 a 5
cut -c 1,5,10 archivo.txt   # Solo caracteres 1, 5, y 10
```

**Por campos (con separador):**
```bash
cut -d',' -f1 archivo.csv   # Primer campo (-f1) usando , como delimitador (-d)
cut -d':' -f1,5 /etc/passwd # Campos 1 y 5 usando : como separador
```

Ejemplo:
```bash
$ cut -d':' -f1,5 /etc/passwd
root:0
daemon:1
bin:2
...
```

Mostrando usuario y UID del sistema.

### sort: Ordena Líneas

Ordena alfabéticamente o numéricamente.

**Básico (alfabético):**
```bash
sort archivo.txt            # Ordena alfabéticamente
sort -r archivo.txt         # Ordena inverso (reverse)
```

**Numérico:**
```bash
sort -n archivo.txt         # Ordena numéricamente (no alfabético!)
sort -nr archivo.txt        # Numérico reverso (de mayor a menor)
```

**Por campo específico:**
```bash
sort -k2 archivo.txt        # Ordena por segundo campo
sort -k2,2nr archivo.txt    # Ordena por segundo campo numérico reverso
```

**Descartando duplicados:**
```bash
sort -u archivo.txt         # Como sort + uniq (unique)
```

Ejemplo:
```
3
1
2
10
```

`sort` alfabético daría: 1, 10, 2, 3
`sort -n` numérico da: 1, 2, 3, 10

### uniq: Encuentra/Elimina Duplicados

**Muestra líneas únicas:**
```bash
uniq archivo.txt            # Elimina líneas duplicadas consecutivas
```

**Cuenta repeticiones:**
```bash
uniq -c archivo.txt         # Muestra cuántas veces aparece cada línea
```

**Solo muestra duplicados:**
```bash
uniq -d archivo.txt         # Muestra solo líneas que aparecen múltiples veces
```

**Solo muestra única:**
```bash
uniq -u archivo.txt         # Muestra solo líneas que aparecen una vez
```

### Combinando: El Triple Combo

Para resultados óptimos, combina estas herramientas:

```bash
sort archivo.txt | uniq -c | sort -rn
```

Esto:
1. Ordena el archivo
2. Cuenta duplicados
3. Ordena por frecuencia (mayor a menor)

Resultado: líneas más frecuentes primero.

### Ejemplo: Procesar Nombres

Archivo: `nombres.txt`
```
Carlos
Ana
Bob
Ana
Carlos
Eva
Bob
Ana
```

**Ordenar alfabéticamente:**
```bash
$ sort nombres.txt
Ana
Ana
Ana
Bob
Bob
Carlos
Carlos
Eva
```

**Contar cuántas veces aparece cada nombre:**
```bash
$ sort nombres.txt | uniq -c
      3 Ana
      2 Bob
      2 Carlos
      1 Eva
```

**Mostrar solo nombres únicos:**
```bash
$ sort -u nombres.txt
Ana
Bob
Carlos
Eva
```

**Mostrar nombres que aparecen más de una vez:**
```bash
$ sort nombres.txt | uniq -d
Ana
Bob
Carlos
```

### Con Números

Archivo: `numeros.txt`
```
5
2
8
1
9
3
7
4
6
```

**Ordenar numéricamente:**
```bash
$ sort -n numeros.txt
1
2
3
4
5
6
7
8
9
```

**Ordenar inverso:**
```bash
$ sort -rn numeros.txt
9
8
7
6
5
4
3
2
1
```
""",
            "goal_description": "Practica cut, sort y uniq. Ordena datos y elimina duplicados.",
            "difficulty": "easy",
            "scenario_setup": json.dumps({
                "initial_files": [
                    {
                        "path": "/home/student/nombres.txt",
                        "content": "Carlos\nAna\nBob\nAna\nCarlos\nEva\nBob\nAna"
                    },
                    {
                        "path": "/home/student/numeros.txt",
                        "content": "5\n2\n8\n1\n9\n3\n7\n4\n6"
                    }
                ]
            }),
            "step_by_step_guide": """## Pasos a Seguir

1. **Ver los archivos**:
   ```bash
   cat /home/student/nombres.txt
   cat /home/student/numeros.txt
   ```

2. **Ordenar y eliminar duplicados**:
   ```bash
   sort /home/student/nombres.txt | uniq > /home/student/nombres_unicos.txt
   ```

3. **Contar repeticiones**:
   ```bash
   sort /home/student/nombres.txt | uniq -c
   ```

4. **Ordenar números**:
   ```bash
   sort -n /home/student/numeros.txt > /home/student/ordenados.txt
   ```

5. **Verificar resultado**:
   ```bash
   cat /home/student/ordenados.txt
   ```

## Comandos Clave

```bash
sort archivo.txt              # Ordena alfabéticamente
sort -n archivo.txt           # Ordena numéricamente
sort -r archivo.txt           # Ordena reverso
sort -u archivo.txt           # Ordena y quita duplicados
uniq archivo.txt              # Quita duplicados consecutivos
uniq -c archivo.txt           # Cuenta repeticiones
sort archivo.txt | uniq       # Combo clásico
```
""",
            "order_index": 4,
            "xp_reward": 120,
            "time_limit": 30,
            "challenges": [
                {
                    "title": "Crear archivo de datos ordenados",
                    "description": "Usa sort para ordenar números y guarda en `/home/student/ordenados.txt`.",
                    "v_type": "file_created",
                    "v_value": "/home/student/ordenados.txt",
                    "hints": json.dumps([
                        "Usa: sort -n /home/student/numeros.txt > /home/student/ordenados.txt",
                        "El -n es importante para orden numérico (no alfabético)",
                        "Verifica con: cat /home/student/ordenados.txt"
                    ])
                }
            ]
        },
        {
            "title": "wc, head y tail",
            "description": """## Contando y Viendo Archivos

### wc: Word Count

Cuenta líneas, palabras y caracteres.

**Básico:**
```bash
wc archivo.txt
```

Salida típica:
```
 20  150 1024 archivo.txt
 ↓   ↓   ↓
líneas palabras bytes
```

**Opciones:**
```bash
wc -l archivo.txt      # Solo líneas (lines)
wc -w archivo.txt      # Solo palabras (words)
wc -c archivo.txt      # Solo bytes/caracteres (characters)
wc -m archivo.txt      # Caracteres (con UTF-8 correcto)
```

**Múltiples archivos:**
```bash
wc *.txt               # Cuenta en todos los .txt
```

Salida:
```
 10 archivo1.txt
 20 archivo2.txt
 30 total
```

### head: Ver Inicio

Muestra las primeras líneas.

**Por defecto, 10 líneas:**
```bash
head archivo.txt
```

**Especificar número:**
```bash
head -n 5 archivo.txt     # Primeras 5 líneas
head -5 archivo.txt       # Atajo: primeras 5 líneas
```

**Primeros N bytes:**
```bash
head -c 100 archivo.txt   # Primeros 100 bytes
```

Útil para ver rápidamente qué contiene un archivo sin abrirlo.

### tail: Ver Final

Muestra las últimas líneas.

**Por defecto, 10 líneas:**
```bash
tail archivo.txt
```

**Especificar número:**
```bash
tail -n 5 archivo.txt     # Últimas 5 líneas
tail -5 archivo.txt       # Atajo: últimas 5 líneas
```

**Seguir archivo en tiempo real:**
```bash
tail -f archivo.txt       # Monitorea cambios (logs)
tail -F archivo.txt       # Monitorea incluso si el archivo se rota
```

El flag `-f` es *gold* para ver logs mientras se están escribiendo.

**Ver desde línea N al final:**
```bash
tail -n +10 archivo.txt   # Desde línea 10 hasta el final
```

### Combinaciones Prácticas

**Ver línea específica:**
```bash
head -n 5 archivo.txt | tail -n 1      # Línea 5
```

**Contar líneas:**
```bash
wc -l archivo.txt
cat archivo.txt | wc -l      # Equivalente
```

**Ver primeras 5 líneas:**
```bash
head -5 archivo.txt
```

**Ver últimas 5 líneas:**
```bash
tail -5 archivo.txt
```

**Monitorear log de servidor:**
```bash
tail -f /var/log/syslog      # Ve logs en tiempo real
tail -f /var/log/apache2/access.log    # Ve accesos web en vivo
```

### Ejemplo: Poema de 20 Líneas

Archivo: `poema.txt` (20 líneas)

**Ver encabezado:**
```bash
$ head -3 poema.txt
En un lugar de la Mancha,
de cuyo nombre no quiero acordarme,
no ha mucho tiempo que vivía...
```

**Ver final:**
```bash
$ tail -3 poema.txt
de aquella edad de oro
cuando la ventura y la verdad
se daban cita sin cuidado.
```

**Contar líneas:**
```bash
$ wc -l poema.txt
20 poema.txt
```

### Caso Real: Procesar Logs

Log de acceso con 1000 líneas:

**Ver últimas 20 líneas (accesos más recientes):**
```bash
tail -20 /var/log/apache2/access.log
```

**Monitorear en tiempo real:**
```bash
tail -f /var/log/apache2/access.log
```

**Contar total de accesos:**
```bash
wc -l /var/log/apache2/access.log
```

**Ver línea 500:**
```bash
head -500 /var/log/apache2/access.log | tail -1
```

### Truco: Usar con Pipes

```bash
cat archivo_largo.txt | head -100      # Ver primeros 100
cat archivo_largo.txt | tail -50       # Ver últimos 50
ls -la | head -10                      # Ver primeros 10 archivos
ps aux | head -5                       # Ver primeros 5 procesos
```
""",
            "goal_description": "Usa wc, head y tail para explorar archivos. Extrae las primeras líneas de un poema.",
            "difficulty": "easy",
            "scenario_setup": json.dumps({
                "initial_files": [
                    {
                        "path": "/home/student/poema.txt",
                        "content": "En un lugar de la Mancha,\nde cuyo nombre no quiero acordarme,\nno ha mucho tiempo que vivía\nun hidalgo de los de lanza en astillero,\nadarga antigua, rocín flaco y galgo corredor.\nUna olla de algo más vaca que carnero,\nsalpicón las más noches, duelos y quebrantos los sábados,\nlantejas los viernes, algún palomino de añadidura los domingos,\nconsuían las tres partes de su hacienda.\nEl resto della concluían sayo de velarte,\ncalzas de velludo para las fiestas con sus pantuflos\nde lo mismo, y los días de entre semana\nse honraba con su vellorilla de lo más fino.\nTenía en casa una ama que pasaba de los cuarenta,\ny una sobrina que no llegaba a los veinte,\ny un mozo de campo y plaza,\nque así ensillaba el rocín como tomaba la podadera.\nFrisaba la edad de nuestro hidalgo en los cincuenta años;\nera de complexión recia, seco de carnes, enjuto de rostro;\ny gran madrugador y amigo de la caza."
                    },
                    {
                        "path": "/home/student/accesos.log",
                        "content": "192.168.1.1 - - [20/Mar/2024:10:15:23 +0000] \"GET /index.html HTTP/1.1\" 200 1234\n10.0.0.5 - - [20/Mar/2024:10:16:45 +0000] \"GET /products.php HTTP/1.1\" 200 5678\n172.16.0.10 - - [20/Mar/2024:10:17:12 +0000] \"POST /login.php HTTP/1.1\" 302 0\n192.168.1.50 - - [20/Mar/2024:10:18:34 +0000] \"GET /styles.css HTTP/1.1\" 304 0\n10.0.0.6 - - [20/Mar/2024:10:19:01 +0000] \"GET /api/data HTTP/1.1\" 200 2048\n192.168.1.100 - - [20/Mar/2024:10:20:15 +0000] \"GET /contact.html HTTP/1.1\" 200 3456\n172.16.0.20 - - [20/Mar/2024:10:21:42 +0000] \"GET /about.html HTTP/1.1\" 200 1890\n10.0.0.7 - - [20/Mar/2024:10:22:11 +0000] \"POST /api/submit HTTP/1.1\" 201 512\n192.168.1.2 - - [20/Mar/2024:10:23:30 +0000] \"GET /favicon.ico HTTP/1.1\" 404 0\n172.16.0.30 - - [20/Mar/2024:10:24:55 +0000] \"GET /robots.txt HTTP/1.1\" 200 255\n10.0.0.8 - - [20/Mar/2024:10:25:44 +0000] \"GET /index.html HTTP/1.1\" 200 1234\n192.168.1.3 - - [20/Mar/2024:10:26:13 +0000] \"GET /products.php HTTP/1.1\" 200 5678\n172.16.0.40 - - [20/Mar/2024:10:27:22 +0000] \"POST /login.php HTTP/1.1\" 302 0\n10.0.0.9 - - [20/Mar/2024:10:28:05 +0000] \"GET /styles.css HTTP/1.1\" 304 0\n192.168.1.4 - - [20/Mar/2024:10:29:36 +0000] \"GET /api/data HTTP/1.1\" 200 2048\n172.16.0.50 - - [20/Mar/2024:10:30:41 +0000] \"GET /contact.html HTTP/1.1\" 200 3456\n10.0.0.10 - - [20/Mar/2024:10:31:18 +0000] \"GET /about.html HTTP/1.1\" 200 1890\n192.168.1.5 - - [20/Mar/2024:10:32:29 +0000] \"POST /api/submit HTTP/1.1\" 201 512\n172.16.0.60 - - [20/Mar/2024:10:33:47 +0000] \"GET /favicon.ico HTTP/1.1\" 404 0\n10.0.0.11 - - [20/Mar/2024:10:34:52 +0000] \"GET /robots.txt HTTP/1.1\" 200 255\n192.168.1.6 - - [20/Mar/2024:10:35:15 +0000] \"GET /index.html HTTP/1.1\" 200 1234\n172.16.0.70 - - [20/Mar/2024:10:36:28 +0000] \"GET /products.php HTTP/1.1\" 200 5678\n10.0.0.12 - - [20/Mar/2024:10:37:44 +0000] \"POST /login.php HTTP/1.1\" 302 0\n192.168.1.7 - - [20/Mar/2024:10:38:56 +0000] \"GET /styles.css HTTP/1.1\" 304 0\n172.16.0.80 - - [20/Mar/2024:10:39:13 +0000] \"GET /api/data HTTP/1.1\" 200 2048\n10.0.0.13 - - [20/Mar/2024:10:40:25 +0000] \"GET /contact.html HTTP/1.1\" 200 3456\n192.168.1.8 - - [20/Mar/2024:10:41:37 +0000] \"GET /about.html HTTP/1.1\" 200 1890\n172.16.0.90 - - [20/Mar/2024:10:42:49 +0000] \"POST /api/submit HTTP/1.1\" 201 512\n10.0.0.14 - - [20/Mar/2024:10:43:02 +0000] \"GET /favicon.ico HTTP/1.1\" 404 0\n192.168.1.9 - - [20/Mar/2024:10:44:18 +0000] \"GET /robots.txt HTTP/1.1\" 200 255"
                    }
                ]
            }),
            "step_by_step_guide": """## Pasos a Seguir

1. **Contar líneas**:
   ```bash
   wc -l /home/student/poema.txt
   wc -l /home/student/accesos.log
   ```

2. **Ver primeras líneas**:
   ```bash
   head -5 /home/student/poema.txt
   head -10 /home/student/accesos.log
   ```

3. **Ver últimas líneas**:
   ```bash
   tail -5 /home/student/poema.txt
   tail -5 /home/student/accesos.log
   ```

4. **Extraer y guardar primeras 5 líneas**:
   ```bash
   head -5 /home/student/poema.txt > /home/student/primeras5.txt
   ```

5. **Verificar**:
   ```bash
   cat /home/student/primeras5.txt
   wc -l /home/student/primeras5.txt
   ```

## Comandos Clave

```bash
wc -l archivo.txt           # Cuenta líneas
head -n 5 archivo.txt       # Primeras 5 líneas
tail -n 5 archivo.txt       # Últimas 5 líneas
tail -f archivo.txt         # Monitorea en tiempo real
head -5 archivo.txt | tail -1  # Línea 5 exactamente
```
""",
            "order_index": 5,
            "xp_reward": 120,
            "time_limit": 25,
            "challenges": [
                {
                    "title": "Extraer primeras 5 líneas",
                    "description": "Usa head para extraer las primeras 5 líneas del poema y guarda en `/home/student/primeras5.txt`.",
                    "v_type": "file_created",
                    "v_value": "/home/student/primeras5.txt",
                    "hints": json.dumps([
                        "Usa: head -5 /home/student/poema.txt > /home/student/primeras5.txt",
                        "El > redirige la salida a un archivo",
                        "Verifica con: cat /home/student/primeras5.txt"
                    ])
                }
            ]
        },
        {
            "title": "tr: Transforma Caracteres",
            "description": """## tr: Traductor de Caracteres

`tr` traduce o elimina caracteres. Es simple pero poderosa.

### Conversión de Caso

**Minúsculas a mayúsculas:**
```bash
tr 'a-z' 'A-Z' < archivo.txt
```

**Mayúsculas a minúsculas:**
```bash
tr 'A-Z' 'a-z' < archivo.txt
```

Ejemplo:
```bash
$ echo "Hola Mundo" | tr 'a-z' 'A-Z'
HOLA MUNDO

$ echo "Hola Mundo" | tr 'A-Z' 'a-z'
hola mundo
```

### Eliminar Caracteres: `-d`

```bash
tr -d '0-9' < archivo.txt           # Elimina todos los dígitos
tr -d ' ' < archivo.txt              # Elimina espacios
tr -d '\n' < archivo.txt             # Elimina saltos de línea
tr -d 'a-z' < archivo.txt            # Elimina todas las letras minúsculas
```

Ejemplo:
```bash
$ echo "abc123def456" | tr -d '0-9'
abcdef

$ echo "Hola Mundo" | tr -d ' '
HolaMundo
```

### Comprimir Espacios: `-s`

Sustituye secuencias de espacios con un único espacio:

```bash
tr -s ' ' < archivo.txt              # Comprime espacios múltiples
tr -s '\n' < archivo.txt             # Comprime saltos de línea
```

Ejemplo:
```bash
$ echo "Hola    Mundo    de    Linux" | tr -s ' '
Hola Mundo de Linux
```

### Sustituir Caracteres

```bash
tr 'hola' 'HOLA' < archivo.txt       # h→H, o→O, l→L, a→A
```

Ejemplo:
```bash
$ echo "hola mundo" | tr 'hola' 'HOLA'
HOLA mALnO
```

Nota: 'h' se mapea a 'H', 'o' a 'O', 'l' a 'L', 'a' a 'A'.

### Combinaciones Útiles

**Eliminar espacios múltiples:**
```bash
tr -s ' ' < archivo.txt
```

**Convertir a mayúsculas y eliminar espacios:**
```bash
tr 'a-z ' 'A-Z_' < archivo.txt
```

**Eliminar caracteres especiales:**
```bash
tr -d '!@#$%^&*()' < archivo.txt
```

### Entrada vs Pipe

`tr` requiere entrada estándar (stdin). Dos formas:

**Con pipe:**
```bash
cat archivo.txt | tr 'a-z' 'A-Z'
```

**Con redirección:**
```bash
tr 'a-z' 'A-Z' < archivo.txt
```

Ambas son equivalentes.

### Ejemplo: Limpiar Mensaje

Archivo: `mensaje.txt`
```
hola mundo, esto es un mensaje en minusculas con  espacios  extra
```

**Convertir a mayúsculas:**
```bash
$ tr 'a-z' 'A-Z' < mensaje.txt
HOLA MUNDO, ESTO ES UN MENSAJE EN MINUSCULAS CON  ESPACIOS  EXTRA
```

**Comprimir espacios:**
```bash
$ tr -s ' ' < mensaje.txt
hola mundo, esto es un mensaje en minusculas con espacios extra
```

**Combinar: mayúsculas + espacios comprimidos:**
```bash
$ tr 'a-z ' 'A-Z ' < mensaje.txt | tr -s ' '
HOLA MUNDO, ESTO ES UN MENSAJE EN MINUSCULAS CON ESPACIOS EXTRA
```

O más directo:
```bash
$ cat mensaje.txt | tr -s ' ' | tr 'a-z' 'A-Z'
HOLA MUNDO, ESTO ES UN MENSAJE EN MINUSCULAS CON ESPACIOS EXTRA
```

### Casos de Uso

**Convertir CSV a TSV (coma a tabulación):**
```bash
tr ',' '\t' < datos.csv > datos.tsv
```

**Eliminar caracteres acentuados (aproximado):**
```bash
tr -d 'áéíóú' < archivo.txt
```

**Convertir a mayúsculas todo un directorio:**
```bash
for f in *.txt; do tr 'a-z' 'A-Z' < "$f" > "${f%.txt}_UPPER.txt"; done
```
""",
            "goal_description": "Usa tr para transformar caracteres. Convierte minúsculas a mayúsculas y comprime espacios extra.",
            "difficulty": "easy",
            "scenario_setup": json.dumps({
                "initial_files": [
                    {
                        "path": "/home/student/mensaje.txt",
                        "content": "hola mundo, esto es un mensaje en minusculas con  espacios  extra"
                    }
                ]
            }),
            "step_by_step_guide": """## Pasos a Seguir

1. **Ver el archivo original**:
   ```bash
   cat /home/student/mensaje.txt
   ```

2. **Convertir a mayúsculas**:
   ```bash
   tr 'a-z' 'A-Z' < /home/student/mensaje.txt
   ```

3. **Comprimir espacios**:
   ```bash
   tr -s ' ' < /home/student/mensaje.txt
   ```

4. **Combinar ambas transformaciones y guardar**:
   ```bash
   tr 'a-z ' 'A-Z ' < /home/student/mensaje.txt | tr -s ' ' > /home/student/mayusculas.txt
   ```

5. **Verificar resultado**:
   ```bash
   cat /home/student/mayusculas.txt
   ```

## Comandos Clave

```bash
tr 'a-z' 'A-Z' < archivo.txt       # Minúsculas a mayúsculas
tr 'A-Z' 'a-z' < archivo.txt       # Mayúsculas a minúsculas
tr -d ' ' < archivo.txt             # Eliminar espacios
tr -s ' ' < archivo.txt             # Comprimir espacios
cat archivo.txt | tr 'a-z' 'A-Z'   # Con pipe
```
""",
            "order_index": 6,
            "xp_reward": 100,
            "time_limit": 20,
            "challenges": [
                {
                    "title": "Crear archivo transformado",
                    "description": "Usa tr para convertir el mensaje a mayúsculas y guardar en `/home/student/mayusculas.txt`.",
                    "v_type": "file_created",
                    "v_value": "/home/student/mayusculas.txt",
                    "hints": json.dumps([
                        "Usa: tr 'a-z' 'A-Z' < /home/student/mensaje.txt > /home/student/mayusculas.txt",
                        "O con pipe: cat /home/student/mensaje.txt | tr 'a-z' 'A-Z' > /home/student/mayusculas.txt",
                        "Verifica con: cat /home/student/mayusculas.txt"
                    ])
                }
            ]
        }
    ]

    for l_data in labs_m1_data:
        existing = db.query(Lab).filter(Lab.module_id == module_m1.id, Lab.title == l_data["title"]).first()
        if existing:
            continue
        lab = Lab(
            module_id=module_m1.id,
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

    print(f"✅ Terminal Skills - M0 y M1 seeded OK")
    db.close()

if __name__ == "__main__":
    seed()
