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

    module = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M9 — Variables y Entorno").first()
    if not module:
        module = Module(
            skill_path_id=path.id,
            title="M9 — Variables y Entorno",
            description="Comprende cómo funciona el entorno de la shell: variables de entorno, PATH, alias, funciones y configuración del perfil de usuario.",
            order_index=10,
            is_active=True
        )
        db.add(module)
        db.commit()
        db.refresh(module)

    labs_data = [
        {
            "title": "Variables de Shell y de Entorno",
            "description": """# Variables de Shell y de Entorno

En bash existen dos tipos de variables:

| Tipo | Ámbito | Ejemplo |
|------|--------|---------|
| Variable de shell | Solo la sesión actual | `nombre="Juan"` |
| Variable de entorno | Disponible para procesos hijos | `export NOMBRE="Juan"` |

## Crear y Usar Variables de Shell
```bash
# Asignar (sin espacios alrededor del =)
nombre="Juan"
edad=25
ruta="/home/juan/proyectos"

# Usar la variable (con $)
echo "Hola, $nombre"
echo "Tienes $edad años"
ls $ruta

# Llaves para claridad
echo "Archivo: ${nombre}_backup.tar.gz"
```

## Exportar Variables al Entorno
```bash
export NOMBRE="Juan"
export EDITOR="vim"
export MI_APP_PORT=8080

# Verificar que está en el entorno
env | grep NOMBRE
printenv NOMBRE
```

## Variables de Entorno Predefinidas
```bash
echo $HOME          # Directorio home del usuario
echo $USER          # Nombre de usuario
echo $SHELL         # Shell activa
echo $PATH          # Rutas de búsqueda de ejecutables
echo $PWD           # Directorio actual
echo $OLDPWD        # Directorio anterior
echo $HOSTNAME      # Nombre del equipo
echo $LANG          # Idioma del sistema
echo $TERM          # Tipo de terminal
echo $PS1           # Prompt principal
```

## Ver Todas las Variables
```bash
env                 # Variables de entorno
set                 # Variables de shell + entorno + funciones
printenv            # Solo variables de entorno
declare -p          # Con tipos y atributos
```

## Eliminar Variables
```bash
unset nombre        # Elimina variable de shell
unset NOMBRE        # Elimina variable de entorno
```

## Variables Especiales de Bash
```bash
echo $0             # Nombre del script/shell
echo $1, $2, ...    # Argumentos posicionales
echo $#             # Número de argumentos
echo $@             # Todos los argumentos
echo $?             # Código de salida del último comando
echo $$             # PID del proceso actual
echo $!             # PID del último proceso en background
```
""",
            "goal_description": "Crea, exporta y manipula variables de shell y de entorno, comprendiendo su ámbito y uso.",
            "difficulty": "easy",
            "xp_reward": 150,
            "order_index": 1,
            "time_limit": 25,
            "scenario_setup": json.dumps({
                "init_commands": [
                    "mkdir -p /home/user/variables"
                ],
                "working_dir": "/home/user/variables"
            }),
            "step_by_step_guide": """## Paso 1 — Variables básicas
```bash
nombre="Terminal"
version=2
echo "Bienvenido a $nombre versión $version"
```

## Paso 2 — Variables de entorno predefinidas
```bash
echo "Usuario: $USER"
echo "Home: $HOME"
echo "Shell: $SHELL"
echo "Directorio actual: $PWD"
```

## Paso 3 — Exportar variable
```bash
export MI_APP="tech4u"
export MI_PUERTO=3000
env | grep MI_
```

## Paso 4 — Código de salida $?
```bash
ls /etc > /dev/null
echo "Código de salida de ls: $?"

ls /noexiste 2>/dev/null
echo "Código de salida de ls inválido: $?"
```

## Paso 5 — Guardar en fichero
```bash
{
  echo "USER=$USER"
  echo "HOME=$HOME"
  echo "SHELL=$SHELL"
} > /home/user/variables/mi_entorno.txt
cat /home/user/variables/mi_entorno.txt
```
""",
            "challenges": [
                {
                    "title": "Crea mi_entorno.txt con variables del sistema",
                    "description": "Crea /home/user/variables/mi_entorno.txt que contenga al menos las variables USER, HOME y SHELL con sus valores actuales.",
                    "v_type": "file_created",
                    "v_value": "/home/user/variables/mi_entorno.txt",
                    "v_extra": None,
                    "hints": json.dumps(["Usa { echo \"USER=$USER\"; echo \"HOME=$HOME\"; } > mi_entorno.txt", "printenv USER HOME SHELL > mi_entorno.txt también funciona"])
                }
            ]
        },
        {
            "title": "El PATH: Cómo Encuentra Linux los Comandos",
            "description": """# El PATH: Cómo Encuentra Linux los Comandos

Cuando escribes un comando como `ls` o `python3`, la shell lo busca en los directorios listados en la variable `$PATH`.

## Ver el PATH Actual
```bash
echo $PATH
# Ejemplo: /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

Los directorios están separados por `:` y se buscan de izquierda a derecha.

## ¿Dónde está un Comando?
```bash
which python3          # Primer coincidencia en PATH
which -a python3       # Todas las coincidencias
type ls                # Tipo: alias, función, fichero, builtin
command -v git         # Similar a which, más portable
whereis python3        # Binario, fuente y man page
```

## Añadir Directorios al PATH
```bash
# Temporal (solo sesión actual)
export PATH="$PATH:/home/user/mis_scripts"
export PATH="/opt/mi_app/bin:$PATH"   # Añadir al principio (mayor prioridad)

# Verificar
echo $PATH | tr ':' '\n'   # Ver cada directorio en línea aparte
```

## PATH Permanente — Ficheros de Configuración
| Fichero | Cuándo se carga | Para |
|---------|-----------------|------|
| `~/.bashrc` | Shell interactiva no-login | Alias, funciones, variables de sesión |
| `~/.bash_profile` o `~/.profile` | Shell login | PATH, variables de entorno permanentes |
| `/etc/environment` | Todos los usuarios | Variables del sistema globales |
| `/etc/profile.d/*.sh` | Todos los usuarios | Scripts de configuración global |

```bash
# Añadir al PATH de forma permanente (~/.bashrc)
echo 'export PATH="$PATH:$HOME/bin"' >> ~/.bashrc
source ~/.bashrc     # Recargar la configuración
```

## Crear Tus Propios Scripts Ejecutables
```bash
mkdir -p ~/bin
cat << 'EOF' > ~/bin/saludar
#!/bin/bash
echo "¡Hola desde mi script personalizado!"
EOF
chmod +x ~/bin/saludar

export PATH="$PATH:$HOME/bin"
saludar    # ¡Ahora funciona desde cualquier lugar!
```

## Seguridad del PATH
⚠️ Nunca pongas `.` (directorio actual) en el PATH — podría ejecutar scripts maliciosos sin querer.
```bash
# PELIGROSO:
export PATH=".:$PATH"

# Siempre usa rutas absolutas para scripts locales
./mi_script.sh
```
""",
            "goal_description": "Entiende el PATH, localiza ejecutables y añade directorios personalizados al PATH.",
            "difficulty": "easy",
            "xp_reward": 150,
            "order_index": 2,
            "time_limit": 25,
            "scenario_setup": json.dumps({
                "init_commands": [
                    "mkdir -p /home/user/mis_scripts",
                    "echo '#!/bin/bash' > /home/user/mis_scripts/saludo.sh",
                    "echo 'echo \"Hola desde mis_scripts!\"' >> /home/user/mis_scripts/saludo.sh",
                    "chmod +x /home/user/mis_scripts/saludo.sh"
                ],
                "working_dir": "/home/user"
            }),
            "step_by_step_guide": """## Paso 1 — Ver el PATH
```bash
echo $PATH
echo $PATH | tr ':' '\\n'
```

## Paso 2 — Localizar comandos
```bash
which bash
which python3
type ls
type cd
```

## Paso 3 — Añadir directorio al PATH
```bash
export PATH="$PATH:/home/user/mis_scripts"
echo $PATH | tr ':' '\\n' | grep mis_scripts
```

## Paso 4 — Ejecutar script desde cualquier lugar
```bash
# Después de añadir al PATH:
saludo.sh
# o simplemente (sin .sh si quieres):
# crear enlace sin extensión
```

## Paso 5 — Guardar PATH ampliado
```bash
echo "PATH ampliado:" > /home/user/path_info.txt
echo $PATH | tr ':' '\\n' >> /home/user/path_info.txt
```
""",
            "challenges": [
                {
                    "title": "Guarda la lista de directorios del PATH",
                    "description": "Crea /home/user/path_info.txt que contenga cada directorio del PATH en una línea separada (usa tr ':' '\\n').",
                    "v_type": "file_created",
                    "v_value": "/home/user/path_info.txt",
                    "v_extra": None,
                    "hints": json.dumps(["echo $PATH | tr ':' '\\n' > path_info.txt"])
                }
            ]
        },
        {
            "title": "Alias y Funciones de Shell",
            "description": """# Alias y Funciones de Shell

## Alias — Atajos para Comandos
Los alias son sustituciones de texto que la shell expande antes de ejecutar.

```bash
# Crear alias
alias ll='ls -la'
alias la='ls -A'
alias grep='grep --color=auto'
alias ..='cd ..'
alias ...='cd ../..'

# Ver todos los alias
alias

# Ver un alias específico
alias ll

# Eliminar alias
unalias ll

# Alias con argumentos NO es posible directamente — usa funciones
```

## Alias Útiles Habituales
```bash
alias update='sudo apt update && sudo apt upgrade -y'
alias ports='ss -tulpn'
alias myip='curl -s ifconfig.me'
alias df='df -h'
alias du='du -h'
alias free='free -h'
alias cls='clear'
alias reload='source ~/.bashrc'
alias bashrc='${EDITOR:-vim} ~/.bashrc'
```

## Funciones — Alias con Superpoderes
Las funciones pueden recibir argumentos, contener lógica y múltiples comandos.

```bash
# Sintaxis básica
nombre_funcion() {
    # cuerpo
    echo "Argumento 1: $1"
    echo "Argumento 2: $2"
}

# Llamar a la función
nombre_funcion valor1 valor2
```

## Funciones Útiles de Ejemplo
```bash
# Crear directorio y entrar en él
mkcd() {
    mkdir -p "$1" && cd "$1"
}

# Extraer cualquier tipo de archivo
extract() {
    case "$1" in
        *.tar.gz|*.tgz)  tar xzf "$1" ;;
        *.tar.bz2)       tar xjf "$1" ;;
        *.tar.xz)        tar xJf "$1" ;;
        *.zip)           unzip "$1" ;;
        *.gz)            gunzip "$1" ;;
        *.bz2)           bunzip2 "$1" ;;
        *.rar)           unrar x "$1" ;;
        *)               echo "No sé cómo extraer '$1'" ;;
    esac
}

# Buscar en el historial
hgrep() {
    history | grep "$1"
}

# Backup rápido de fichero
bak() {
    cp "$1" "${1}.bak.$(date +%Y%m%d_%H%M%S)"
    echo "Backup creado: ${1}.bak.$(date +%Y%m%d_%H%M%S)"
}
```

## Hacer Alias y Funciones Permanentes
Añade al final de `~/.bashrc`:
```bash
# Alias personales
alias ll='ls -la --color=auto'
alias update='sudo apt update && sudo apt upgrade -y'

# Función mkcd
mkcd() {
    mkdir -p "$1" && cd "$1"
}
```

Luego recarga:
```bash
source ~/.bashrc
# o equivalentemente:
. ~/.bashrc
```
""",
            "goal_description": "Crea alias y funciones de shell para simplificar tu flujo de trabajo diario.",
            "difficulty": "easy",
            "xp_reward": 150,
            "order_index": 3,
            "time_limit": 30,
            "scenario_setup": json.dumps({
                "init_commands": [
                    "mkdir -p /home/user/alias_lab"
                ],
                "working_dir": "/home/user/alias_lab"
            }),
            "step_by_step_guide": """## Paso 1 — Crear alias básicos
```bash
alias ll='ls -la'
alias ..='cd ..'
alias cls='clear'
alias
```

## Paso 2 — Usar alias
```bash
ll /etc | head -5
```

## Paso 3 — Crear función mkcd
```bash
mkcd() {
    mkdir -p "$1" && cd "$1"
}
mkcd /home/user/alias_lab/nuevo_dir
pwd
```

## Paso 4 — Crear función de backup
```bash
bak() {
    cp "$1" "${1}.bak"
    echo "Backup de $1 creado"
}
touch prueba.txt
bak prueba.txt
ls
```

## Paso 5 — Guardar en .bashrc
```bash
echo "alias ll='ls -la'" >> /home/user/alias_lab/mis_alias.sh
echo "alias ..='cd ..'" >> /home/user/alias_lab/mis_alias.sh
echo "mkcd() { mkdir -p \"\$1\" && cd \"\$1\"; }" >> /home/user/alias_lab/mis_alias.sh
cat /home/user/alias_lab/mis_alias.sh
```
""",
            "challenges": [
                {
                    "title": "Crea mis_alias.sh con tus personalizaciones",
                    "description": "Crea /home/user/alias_lab/mis_alias.sh que contenga al menos 2 alias y la función mkcd.",
                    "v_type": "file_created",
                    "v_value": "/home/user/alias_lab/mis_alias.sh",
                    "v_extra": None,
                    "hints": json.dumps(["Guarda los alias con echo >> mis_alias.sh", "Recuerda escapar las comillas dentro de echo con \\\""])
                },
                {
                    "title": "Usa mkcd para crear y entrar en un directorio",
                    "description": "Define la función mkcd y úsala para crear y entrar en /home/user/alias_lab/mi_proyecto. Verifica con pwd que estás dentro.",
                    "v_type": "directory_created",
                    "v_value": "/home/user/alias_lab/mi_proyecto",
                    "v_extra": None,
                    "hints": json.dumps(["mkcd() { mkdir -p \"$1\" && cd \"$1\"; }", "Después de definirla: mkcd /home/user/alias_lab/mi_proyecto"])
                }
            ]
        },
        {
            "title": "Configuración del Perfil: .bashrc y .bash_profile",
            "description": """# Configuración del Perfil: .bashrc y .bash_profile

## Tipos de Shell en Linux

| Tipo | Cuándo | Fichero de configuración |
|------|--------|--------------------------|
| Login shell | Al hacer login (SSH, tty) | `~/.bash_profile` → `~/.profile` |
| Interactive non-login | Al abrir terminal en GUI, bash nuevo | `~/.bashrc` |
| Non-interactive | Scripts automáticos | Variables de entorno heredadas |

## Ficheros de Configuración de Bash

### `~/.bashrc`
El más usado. Se carga en cada terminal interactiva nueva.
```bash
# Contenido típico de ~/.bashrc

# Alias
alias ll='ls -la --color=auto'
alias grep='grep --color=auto'

# Variables de entorno
export EDITOR="vim"
export HISTSIZE=10000
export HISTFILESIZE=20000

# PATH personalizado
export PATH="$PATH:$HOME/bin"

# Funciones
mkcd() { mkdir -p "$1" && cd "$1"; }
```

### `~/.bash_profile`
Se carga una vez al iniciar sesión. Suele llamar a `.bashrc`:
```bash
# ~/.bash_profile típico
if [ -f ~/.bashrc ]; then
    source ~/.bashrc
fi
```

### `/etc/profile` y `/etc/profile.d/`
Configuración global para todos los usuarios. Solo modificar como root.

## Recargar Configuración
```bash
source ~/.bashrc    # Recarga .bashrc en la sesión actual
. ~/.bashrc         # Equivalente (. es sinónimo de source)
exec bash           # Reinicia la shell (más limpio)
```

## HISTCONTROL — Control del Historial
```bash
# En ~/.bashrc:
export HISTCONTROL=ignoredups:ignorespace
# ignoredups: no guarda comandos duplicados consecutivos
# ignorespace: no guarda comandos que empiezan con espacio
# erasedups: elimina todas las entradas duplicadas anteriores

export HISTSIZE=5000          # Líneas en memoria
export HISTFILESIZE=10000     # Líneas en ~/.bash_history
export HISTTIMEFORMAT="%d/%m/%Y %H:%M:%S "  # Añade timestamps
```

## PS1 — Personalizar el Prompt
```bash
# Prompt simple con colores
export PS1='\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ '

# Secuencias especiales:
# \\u = usuario  \\h = hostname  \\w = ruta actual  \\$ = $ o # según root
```

## Orden de Carga Completo
```
/etc/profile
   /etc/profile.d/*.sh
~/.bash_profile (o .profile)
   ~/.bashrc
      /etc/bash.bashrc (si existe)
```
""",
            "goal_description": "Configura tu entorno bash con alias, variables y PATH permanentes en .bashrc.",
            "difficulty": "medium",
            "xp_reward": 175,
            "order_index": 4,
            "time_limit": 35,
            "scenario_setup": json.dumps({
                "init_commands": [
                    "mkdir -p /home/user/perfil_lab"
                ],
                "working_dir": "/home/user"
            }),
            "step_by_step_guide": """## Paso 1 — Ver el .bashrc actual
```bash
cat ~/.bashrc
wc -l ~/.bashrc
```

## Paso 2 — Añadir alias permanente
```bash
echo "alias ll='ls -la --color=auto'" >> ~/.bashrc
echo "alias ..='cd ..'" >> ~/.bashrc
tail -5 ~/.bashrc
```

## Paso 3 — Añadir variable de entorno
```bash
echo "export EDITOR=nano" >> ~/.bashrc
echo "export HISTSIZE=5000" >> ~/.bashrc
```

## Paso 4 — Añadir función
```bash
cat << 'EOF' >> ~/.bashrc
mkcd() {
    mkdir -p "$1" && cd "$1"
}
EOF
```

## Paso 5 — Recargar y verificar
```bash
source ~/.bashrc
echo $EDITOR
alias | grep ll
```

## Paso 6 — Guardar backup de la configuración
```bash
cp ~/.bashrc /home/user/perfil_lab/bashrc_backup.txt
```
""",
            "challenges": [
                {
                    "title": "Crea un backup de .bashrc",
                    "description": "Copia el fichero ~/.bashrc a /home/user/perfil_lab/bashrc_backup.txt",
                    "v_type": "file_created",
                    "v_value": "/home/user/perfil_lab/bashrc_backup.txt",
                    "v_extra": None,
                    "hints": json.dumps(["cp ~/.bashrc /home/user/perfil_lab/bashrc_backup.txt"])
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

    print(f"✅ Terminal Skills - M9 Variables y Entorno seeded OK")
    db.close()

if __name__ == "__main__":
    seed()
