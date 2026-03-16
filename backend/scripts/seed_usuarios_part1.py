"""
seed_usuarios_part1.py
Usuarios y Permisos Linux — Parte 1
M1: Gestión de Usuarios y Grupos (10 labs)
M2: Permisos Básicos: chmod, chown y umask (9 labs)
Run: cd backend && source venv/bin/activate && python3 scripts/seed_usuarios_part1.py
"""

import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, SkillPath, Module, Lab
from sqlalchemy import func

# ─── helpers ────────────────────────────────────────────────────────────────

def get_or_create_path(db):
    path = db.query(SkillPath).filter(SkillPath.title == "Usuarios y Permisos Linux").first()
    if not path:
        path = SkillPath(
            title="Usuarios y Permisos Linux",
            description="Gestiona usuarios, grupos y permisos en Linux. Desde los fundamentos de chmod y chown hasta ACLs avanzadas, sudo y hardening de cuentas. Imprescindible para administradores de sistemas y alumnos de FP.",
            difficulty="medium",
            order_index=4,
            is_active=True,
        )
        db.add(path)
        db.commit()
        db.refresh(path)
        print(f"[CREATED] SkillPath: {path.title}")
    else:
        print(f"[EXISTS] SkillPath: {path.title}")
    return path

def get_next_order(db, module_id):
    return (db.query(Lab).filter(Lab.module_id == module_id).count() or 0) + 1

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

# ─── M1: Gestión de Usuarios y Grupos ───────────────────────────────────────

M1_LABS = [
    {
        "title": "El Modelo de Usuarios de Linux",
        "description": "Entiende la arquitectura de usuarios de Linux: UID/GID, el superusuario root, usuarios del sistema vs usuarios normales, y cómo Linux controla el acceso.",
        "difficulty": "beginner",
        "duration_minutes": 25,
        "xp_reward": 80,
        "learning_objectives": [
            "Entender el modelo UID/GID de Linux",
            "Distinguir root, usuarios del sistema y usuarios normales",
            "Leer /etc/passwd y /etc/shadow",
            "Identificar tu propio usuario y grupos"
        ],
        "commands": ["whoami", "id", "groups", "cat /etc/passwd", "cat /etc/group"],
        "guide_markdown": """# El Modelo de Usuarios de Linux

## Fundamentos: todo tiene un dueño

En Linux, cada proceso, archivo y recurso pertenece a un **usuario** y un **grupo**. Esto es la base del control de acceso.

```bash
# ¿Quién soy?
whoami             # nombre del usuario actual

# Información completa de identidad
id
# uid=1000(alumno) gid=1000(alumno) groups=1000(alumno),4(adm),27(sudo)

# Grupos a los que pertenezco
groups
# alumno adm sudo docker
```

---

## UID y GID: los números detrás de los nombres

Linux usa números internamente:

| Rango UID | Tipo                    |
|-----------|-------------------------|
| 0         | root (superusuario)     |
| 1–999     | Usuarios del sistema    |
| 1000+     | Usuarios normales       |
| 65534     | nobody (sin privilegios)|

```bash
# Ver UID de usuarios del sistema
awk -F: '$3 < 1000 {print $1, $3}' /etc/passwd

# Ver solo usuarios normales (UID >= 1000)
awk -F: '$3 >= 1000 && $3 < 65534 {print $1, $3, $6}' /etc/passwd
```

---

## /etc/passwd: el directorio de usuarios

Formato: `usuario:x:UID:GID:comentario:home:shell`

```
root:x:0:0:root:/root:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
alumno:x:1000:1000:Alumno Linux,,,:/home/alumno:/bin/bash
```

```bash
# Ver estructura de passwd
cat /etc/passwd

# Buscar un usuario específico
grep "^alumno:" /etc/passwd

# Extraer solo nombres de usuario
cut -d: -f1 /etc/passwd

# Shells disponibles
cat /etc/shells
```

---

## /etc/group: grupos del sistema

Formato: `grupo:x:GID:miembros`

```
root:x:0:
sudo:x:27:alumno
docker:x:999:alumno
alumno:x:1000:
```

```bash
cat /etc/group
grep "^sudo:" /etc/group   # ver miembros del grupo sudo
```

---

## /etc/shadow: contraseñas cifradas

Solo accesible por root. Contiene el hash de la contraseña y políticas de caducidad:

```
alumno:$6$rOund...:19710:0:99999:7:::
#       ^hash       ^días desde epoch: última modificación
```

```bash
# Ver shadow (requiere sudo)
sudo cat /etc/shadow
```

---

## El usuario root

```bash
# Comprobar si eres root
if [[ $EUID -eq 0 ]]; then
    echo "Soy root"
else
    echo "Usuario normal (UID: $EUID)"
fi

# Directorios del root
ls /root
echo $HOME   # /root si eres root
```

---

## Práctica

1. Ejecuta `id` y anota tu UID, GID y grupos
2. Muestra todos los usuarios con UID >= 1000 de tu sistema
3. Encuentra tu entrada en /etc/passwd y explica cada campo
4. Identifica qué shell usa cada usuario del sistema (UID < 1000) que tenga `/bin/` como shell
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Explorar el modelo de usuarios",
                "description": "Muestra en una tabla formateada todos los usuarios normales (UID >= 1000, < 65534) con su UID, nombre de home y shell.",
                "hint": "awk -F: '$3>=1000 && $3<65534 {printf \"%-15s %-5s %-20s %s\\n\", $1,$3,$6,$7}' /etc/passwd",
                "validation_command": "awk -F: '$3>=1000 && $3<65534 {print $1}' /etc/passwd | wc -l",
                "expected_output_contains": "1"
            }
        ]
    },
    {
        "title": "Crear y Eliminar Usuarios: useradd y userdel",
        "description": "Aprende a gestionar el ciclo de vida completo de un usuario: creación con useradd/adduser, configuración del home y shell, y eliminación segura con userdel.",
        "difficulty": "beginner",
        "duration_minutes": 30,
        "xp_reward": 100,
        "learning_objectives": [
            "Crear usuarios con useradd y adduser",
            "Configurar home, shell y grupo primario",
            "Establecer y cambiar contraseñas con passwd",
            "Eliminar usuarios correctamente con userdel"
        ],
        "commands": ["useradd", "adduser", "userdel", "passwd", "usermod", "chsh"],
        "guide_markdown": """# Crear y Eliminar Usuarios

## useradd vs adduser

| Característica | `useradd` | `adduser` |
|----------------|-----------|-----------|
| Tipo           | Comando bajo nivel | Script de alto nivel |
| Interactivo    | No (todo por flags) | Sí (pregunta contraseña, etc.) |
| Home           | No crea por defecto | Crea automáticamente |
| Portabilidad   | Todas las distros | Solo Debian/Ubuntu |

---

## useradd: creación manual

```bash
# Sintaxis básica
sudo useradd nombre_usuario

# Con opciones completas:
sudo useradd \
    -m \                          # crear directorio home
    -d /home/alice \              # ruta del home
    -s /bin/bash \                # shell
    -g usuarios \                 # grupo primario
    -G sudo,docker \              # grupos secundarios
    -c "Alice Sánchez" \          # comentario (GECOS)
    -u 1500 \                     # UID específico
    alice

# Establecer contraseña inmediatamente
sudo passwd alice
```

---

## adduser: el método interactivo (Debian/Ubuntu)

```bash
sudo adduser bob
# Pregunta: contraseña, nombre completo, teléfono, etc.
# Crea /home/bob automáticamente
# Crea grupo bob automáticamente
```

---

## Ver el resultado

```bash
# Verificar que se creó
id alice
grep "^alice:" /etc/passwd
ls -la /home/alice

# Ver grupos
groups alice
```

---

## Modificar usuarios existentes: usermod

```bash
# Cambiar shell
sudo usermod -s /bin/zsh alice

# Añadir a grupos secundarios (sin quitar los existentes)
sudo usermod -aG docker alice
sudo usermod -aG sudo alice

# ¡OJO! Sin -a borra grupos existentes:
sudo usermod -G docker alice  # MALO: quita todos los otros grupos

# Cambiar directorio home (y mover contenido)
sudo usermod -m -d /opt/alice alice

# Cambiar nombre de usuario
sudo usermod -l alice_nueva alice_vieja

# Bloquear y desbloquear cuenta
sudo usermod -L alice   # Lock
sudo usermod -U alice   # Unlock
```

---

## Gestión de contraseñas

```bash
# Establecer contraseña (interactivo)
sudo passwd alice

# Forzar cambio en próximo login
sudo passwd -e alice

# Ver estado de la contraseña
sudo passwd -S alice

# Bloquear contraseña (no podrá iniciar sesión)
sudo passwd -l alice

# Desbloquear
sudo passwd -u alice

# Sin contraseña (¡peligroso! solo para entornos de lab)
sudo passwd -d alice
```

---

## Eliminar usuarios

```bash
# Eliminar solo el usuario (conserva home y archivos)
sudo userdel alice

# Eliminar usuario Y su directorio home
sudo userdel -r alice

# Verificar que se eliminó
id alice 2>&1   # debe mostrar "no such user"
ls /home/       # home eliminado si usaste -r
```

---

## Plantilla: script de creación de usuario

```bash
#!/usr/bin/env bash
crear_usuario() {
    local usuario="$1"
    local grupo="${2:-usuarios}"
    local shell="${3:-/bin/bash}"

    if id "$usuario" &>/dev/null; then
        echo "El usuario '$usuario' ya existe"
        return 1
    fi

    sudo useradd -m -s "$shell" -g "$grupo" "$usuario"
    sudo passwd "$usuario"
    echo "Usuario '$usuario' creado correctamente"
    id "$usuario"
}

crear_usuario "nuevo_user" "usuarios" "/bin/bash"
```

---

## Práctica

1. Crea un usuario `testuser` con home `/home/testuser` y shell `/bin/bash`
2. Establece su contraseña
3. Añádelo al grupo `adm` sin quitarlo de sus grupos actuales
4. Fuerza el cambio de contraseña en el próximo inicio de sesión
5. Finalmente, elimínalo junto con su directorio home
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Crear usuario con opciones",
                "description": "Crea el usuario 'practiceuser' con home, shell bash, y añádelo al grupo adm. Verifica con 'id practiceuser' que aparece en el grupo adm.",
                "hint": "sudo useradd -m -s /bin/bash practiceuser && sudo usermod -aG adm practiceuser",
                "validation_command": "id practiceuser 2>&1 | grep adm",
                "expected_output_contains": "adm"
            }
        ]
    },
    {
        "title": "Gestión de Grupos: groupadd, groupmod y gpasswd",
        "description": "Crea y gestiona grupos en Linux para organizar usuarios y controlar el acceso a recursos compartidos. Aprende a añadir y quitar miembros, y a usar grupos de forma efectiva.",
        "difficulty": "beginner",
        "duration_minutes": 30,
        "xp_reward": 100,
        "learning_objectives": [
            "Crear grupos con groupadd",
            "Gestionar miembros con gpasswd y usermod",
            "Entender grupos primarios y secundarios",
            "Usar grupos para controlar acceso a archivos"
        ],
        "commands": ["groupadd", "groupdel", "groupmod", "gpasswd", "newgrp", "getent group"],
        "guide_markdown": """# Gestión de Grupos en Linux

## Concepto: grupos primarios y secundarios

- **Grupo primario**: el grupo asociado por defecto a los nuevos archivos del usuario. Cada usuario tiene exactamente uno. Se almacena en /etc/passwd (campo 4).
- **Grupos secundarios**: grupos adicionales que dan permisos adicionales (sudo, docker, adm...). Un usuario puede pertenecer a muchos.

```bash
id usuario
# uid=1000(alice) gid=1000(alice) groups=1000(alice),27(sudo),999(docker)
#                  ^GID primario           ^primario     ^secundarios
```

---

## Crear y eliminar grupos

```bash
# Crear grupo
sudo groupadd desarrolladores
sudo groupadd -g 2000 devops    # con GID específico

# Renombrar grupo
sudo groupmod -n devs desarrolladores

# Cambiar GID
sudo groupmod -g 2001 devops

# Eliminar grupo
sudo groupdel devops
# Nota: no puedes eliminar el grupo primario de un usuario activo
```

---

## Gestionar miembros: gpasswd

```bash
# Añadir usuario al grupo
sudo gpasswd -a alice desarrolladores

# Quitar usuario del grupo
sudo gpasswd -d alice desarrolladores

# Establecer administrador del grupo
sudo gpasswd -A alice desarrolladores

# Añadir múltiples usuarios (reemplaza la lista)
sudo gpasswd -M alice,bob,charlie desarrolladores

# Ver miembros del grupo
getent group desarrolladores
# desarrolladores:x:2000:alice,bob
```

---

## newgrp: cambiar grupo activo temporalmente

```bash
# Tu grupo activo determina el grupo de nuevos archivos
touch archivo1.txt     # pertenece a tu grupo primario
ls -l archivo1.txt

# Cambiar temporalmente a otro grupo
newgrp docker          # abre una subshell con grupo docker activo
touch archivo2.txt     # pertenece al grupo docker ahora
ls -l archivo2.txt
exit                   # volver al grupo original
```

---

## Patrón: grupo compartido para proyectos

```bash
# Crear grupo para el proyecto
sudo groupadd proyecto_web

# Añadir desarrolladores
sudo gpasswd -a alice proyecto_web
sudo gpasswd -a bob   proyecto_web

# Crear directorio compartido con el grupo
sudo mkdir /opt/proyecto_web
sudo chown root:proyecto_web /opt/proyecto_web
sudo chmod 2775 /opt/proyecto_web   # setgid + rwxrwxr-x

# Ahora alice y bob pueden crear y editar archivos en ese directorio
# Nuevos archivos heredan el grupo "proyecto_web" por el setgid
```

---

## Ver información de grupos

```bash
# Todos los grupos del sistema
cat /etc/group
getent group

# Grupos de un usuario específico
groups alice
id alice

# Miembros de un grupo específico
getent group sudo
grep "^docker:" /etc/group

# Grupos con más de N miembros
awk -F: '{n=split($4,a,","); if(n>2) print $1, n, $4}' /etc/group
```

---

## Práctica

1. Crea el grupo `proyecto_linux` con GID 3000
2. Añade tu usuario actual y el usuario `testuser` (si existe) al grupo
3. Crea `/opt/proyecto_linux` con permisos sgid para que el grupo comparta archivos
4. Verifica con `ls -l /opt/proyecto_linux` que el bit setgid (s) está activo
5. Elimina el grupo `proyecto_linux` y verifica
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Crear grupo y directorio compartido",
                "description": "Crea el grupo 'compartido', crea /tmp/compartido con permisos setgid para ese grupo, y verifica que el bit 's' aparece en los permisos.",
                "hint": "sudo groupadd compartido && sudo mkdir /tmp/compartido && sudo chgrp compartido /tmp/compartido && sudo chmod g+s /tmp/compartido",
                "validation_command": "ls -ld /tmp/compartido 2>&1 | grep -c 's'",
                "expected_output_contains": "1"
            }
        ]
    },
    {
        "title": "Contraseñas y Políticas de Seguridad de Cuentas",
        "description": "Configura políticas robustas de contraseñas: caducidad, complejidad, intentos fallidos y bloqueo de cuentas usando los archivos de shadow y PAM.",
        "difficulty": "intermediate",
        "duration_minutes": 40,
        "xp_reward": 130,
        "learning_objectives": [
            "Configurar caducidad de contraseñas con chage",
            "Entender el archivo /etc/shadow en profundidad",
            "Bloquear y desbloquear cuentas",
            "Políticas de contraseñas básicas con PAM"
        ],
        "commands": ["chage", "passwd -S", "pam_pwquality", "faillock", "/etc/shadow"],
        "guide_markdown": """# Contraseñas y Políticas de Seguridad de Cuentas

## El archivo /etc/shadow en detalle

```
usuario:$6$salt$hash:última_cambio:min_días:max_días:aviso:inactividad:expiración:reservado
```

| Campo | Significado |
|-------|-------------|
| `$6$` | Algoritmo hash (6=SHA-512, 5=SHA-256, 1=MD5) |
| Última cambio | Días desde 1970-01-01 del último cambio |
| Min días | Mínimo de días antes de poder cambiar |
| Max días | Máximo de días antes de expirar (99999 = nunca) |
| Aviso | Días de aviso antes de expirar |
| Inactividad | Días tras expirar antes de deshabilitar la cuenta |
| Expiración | Fecha absoluta de expiración de la cuenta |

---

## chage: gestionar la caducidad

```bash
# Ver política actual de una cuenta
chage -l alice
# Last password change                    : Jan 15, 2024
# Password expires                        : never
# Password inactive                       : never
# Account expires                         : never
# Minimum number of days between changes  : 0
# Maximum number of days between changes  : 99999
# Number of days of warning before expiry : 7

# Configurar política completa
sudo chage \
    -m 7 \       # mínimo 7 días entre cambios
    -M 90 \      # contraseña expira en 90 días
    -W 14 \      # aviso 14 días antes
    -I 30 \      # desactivar tras 30 días de inactividad post-expiración
    alice

# Forzar cambio en próximo login
sudo chage -d 0 alice    # pone última_cambio a epoch 0

# Establecer fecha de expiración de cuenta (no de contraseña)
sudo chage -E 2025-12-31 alice

# Hacer que la cuenta nunca expire
sudo chage -E -1 alice
```

---

## Estado de cuentas

```bash
# Ver estado resumido
sudo passwd -S alice
# alice P 01/15/2024 0 99999 7 -1
#       ^ P=activa L=bloqueada NP=sin contraseña

# Bloquear cuenta (añade ! al hash en shadow)
sudo passwd -l alice
sudo usermod -L alice    # equivalente

# Desbloquear
sudo passwd -u alice
sudo usermod -U alice

# Ver todas las cuentas bloqueadas
sudo awk -F: '$2~/^!/ {print $1, "BLOQUEADA"}' /etc/shadow
```

---

## Políticas de contraseñas con PAM (Ubuntu/Debian)

```bash
# Instalar pam_pwquality si no está
sudo apt-get install libpam-pwquality

# Configurar en /etc/security/pwquality.conf
sudo tee -a /etc/security/pwquality.conf <<EOF
# Longitud mínima: 12 caracteres
minlen = 12
# Al menos 1 mayúscula
ucredit = -1
# Al menos 1 minúscula
lcredit = -1
# Al menos 1 número
dcredit = -1
# Al menos 1 símbolo
ocredit = -1
# No puede repetir los últimos N caracteres
maxrepeat = 3
EOF
```

---

## Intentos fallidos de login: faillock

```bash
# Ver intentos fallidos de un usuario
sudo faillock --user alice

# Desbloquear usuario bloqueado por intentos fallidos
sudo faillock --user alice --reset

# Configurar en /etc/security/faillock.conf (o via PAM)
# deny = 5          # bloquear tras 5 intentos
# unlock_time = 300 # desbloquear tras 300 segundos
```

---

## Script de auditoría de cuentas

```bash
#!/usr/bin/env bash
echo "=== AUDITORÍA DE CUENTAS ==="
printf "%-15s %-12s %-10s %-10s %s\n" "USUARIO" "ESTADO" "EXPIRA_PW" "EXPIRA_CTA" "ÚLTIMO_CAMBIO"
echo "─────────────────────────────────────────────────────────"

while IFS=: read -r user pass last_chg min max warn inactive expire _; do
    [[ "$pass" == "!" || "$pass" == "*" ]] && estado="BLOQUEADA" || estado="activa"
    [[ "$max" == "99999" ]] && exp_pw="nunca" || exp_pw="${max}d"
    [[ -z "$expire" ]] && exp_cta="nunca" || exp_cta=$(date -d "1970-01-01 + $expire days" '+%Y-%m-%d')
    last=$(date -d "1970-01-01 + $last_chg days" '+%Y-%m-%d' 2>/dev/null || echo "desconocido")
    printf "%-15s %-12s %-10s %-10s %s\n" "$user" "$estado" "$exp_pw" "$exp_cta" "$last"
done < <(sudo awk -F: '$3>=1000 && $3<65534' /etc/shadow 2>/dev/null)
```

---

## Práctica

1. Configura en tu usuario actual: contraseña expira en 60 días, aviso 10 días antes
2. Crea un usuario `testexpiry` cuya cuenta expire el 31 de diciembre de 2025
3. Usa `chage -l` para verificar ambas configuraciones
4. Bloquea `testexpiry` y verifica con `passwd -S`
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Configurar política de caducidad",
                "description": "Configura la política de contraseñas de tu usuario: max 90 días, aviso 7 días antes, mínimo 1 día entre cambios. Verifica con 'chage -l $USER'.",
                "hint": "sudo chage -m 1 -M 90 -W 7 $USER && chage -l $USER",
                "validation_command": "chage -l $USER 2>&1 | grep -i 'warning\\|maximum'",
                "expected_output_contains": "warning"
            }
        ]
    },
    {
        "title": "Información de Sesiones: who, w, last y lastlog",
        "description": "Monitoriza quién está conectado al sistema, historial de sesiones y últimos accesos. Detecta comportamientos anómalos con las herramientas de auditoría de sesiones.",
        "difficulty": "beginner",
        "duration_minutes": 25,
        "xp_reward": 90,
        "learning_objectives": [
            "Monitorizar sesiones activas con who y w",
            "Revisar historial de logins con last",
            "Ver último acceso de cada usuario con lastlog",
            "Detectar patrones de acceso sospechosos"
        ],
        "commands": ["who", "w", "last", "lastlog", "users", "finger", "ac"],
        "guide_markdown": """# Monitorización de Sesiones de Usuario

## who: usuarios conectados ahora

```bash
who
# alice    pts/0        2024-01-15 09:23 (192.168.1.100)
# bob      pts/1        2024-01-15 10:45 (192.168.1.101)
# root     tty1         2024-01-15 08:00

# Información adicional
who -a          # todo: boot, run level, procesos, etc.
who -b          # cuándo se inició el sistema
who -H          # con cabeceras
who am i        # solo mi sesión actual
```

---

## w: sesiones + actividad

```bash
w
#  10:50:23 up  2:45,  2 users,  load average: 0.12, 0.08, 0.05
# USER     TTY      FROM             LOGIN@   IDLE JCPU   PCPU WHAT
# alice    pts/0    192.168.1.100   09:23    5:00  0.10s  0.05s bash
# bob      pts/1    192.168.1.101   10:45    1:00  0.05s  0.02s vim config.py

# -s: formato corto
w -s

# Info de un usuario específico
w alice
```

---

## last: historial de logins

```bash
# Últimos 20 accesos
last

# Últimos accesos de un usuario
last alice

# Últimos fallos de autenticación (requiere sudo)
sudo last -f /var/log/btmp        # accesos fallidos

# Mismo usando lastb
sudo lastb

# Cuándo se reinició el sistema
last reboot

# Últimos 10 entradas
last -n 10

# Formato con IP completa
last -i

# Desde el archivo wtmp del año pasado
sudo last -f /var/log/wtmp.1
```

---

## lastlog: último acceso de cada usuario

```bash
# Ver último acceso de todos los usuarios
lastlog

# De un usuario específico
lastlog -u alice

# Usuarios que NO han iniciado sesión nunca
lastlog | grep "Never logged"

# Usuarios que no han iniciado sesión en 30 días
lastlog | awk 'NR>1 && $NF!="in" && $9!="Never" {
    cmd="date -d \""$4" "$5" "$6" "$7"\" +%s 2>/dev/null"
    cmd | getline ts; close(cmd)
    now=systime()
    if (now - ts > 30*86400) print $1
}'
```

---

## Script de auditoría de sesiones

```bash
#!/usr/bin/env bash
echo "=== REPORTE DE SESIONES ==="
echo ""
echo "Usuarios conectados ahora:"
w -s | awk 'NR>2 {printf "  %-15s %-10s %s\n", $1, $2, $4}'

echo ""
echo "Últimos 10 accesos:"
last -n 10 | awk 'NF>0 && !/reboot|wtmp/ {
    printf "  %-12s %-10s %-20s %s\n", $1, $2, $3, $4" "$5" "$6
}'

echo ""
echo "Intentos de acceso fallidos (últimas 24h):"
sudo lastb -s 2>/dev/null | head -5 || echo "  (requiere sudo)"

echo ""
echo "Usuarios sin acceso en más de 30 días:"
lastlog | awk 'NR>1 && $NF~/in/ {print "  "$1}' | head -10
```

---

## Práctica

1. Ejecuta `w` y explica cada columna del output
2. Usa `last` para ver cuándo fue el último reinicio del sistema
3. Ejecuta `lastlog` y filtra los usuarios que nunca han iniciado sesión
4. Escribe un script que genere un reporte diario de sesiones en `/tmp/reporte_sesiones_$(date +%Y%m%d).txt`
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Reporte de sesiones del día",
                "description": "Crea reporte_sesiones.sh que genere un reporte con: usuarios activos ahora, los últimos 5 logins, y usuarios que nunca han accedido.",
                "hint": "Combina: who (activos), last -n 5 (últimos logins), lastlog | grep Never (nunca)",
                "validation_command": "bash reporte_sesiones.sh 2>&1 | grep -iE 'activos|logins|nunca|never'",
                "expected_output_contains": "logins"
            }
        ]
    },
    {
        "title": "Variables de Entorno y Perfiles de Usuario",
        "description": "Entiende cómo Linux configura el entorno de cada usuario al hacer login: ~/.bashrc, ~/.bash_profile, ~/.profile, variables de entorno y personalización del shell.",
        "difficulty": "beginner",
        "duration_minutes": 30,
        "xp_reward": 100,
        "learning_objectives": [
            "Entender el orden de carga de perfiles",
            "Configurar variables de entorno persistentes",
            "Diferencia entre login shells e interactive shells",
            "Personalizar el entorno de usuario"
        ],
        "commands": ["env", "printenv", "export", "source", "~/.bashrc", "~/.profile"],
        "guide_markdown": """# Variables de Entorno y Perfiles de Usuario

## El orden de carga de perfiles

**Login shell** (SSH, consola física):
```
/etc/profile → /etc/profile.d/*.sh → ~/.bash_profile → ~/.bashrc
```

**Interactive shell** (terminal en escritorio):
```
~/.bashrc (y este puede cargar /etc/bashrc)
```

```bash
# Saber si eres un login shell
[[ $- == *i* ]] && echo "interactive" || echo "no interactive"
shopt -q login_shell && echo "login shell" || echo "no login shell"
```

---

## Variables de entorno esenciales

```bash
# Ver todas las variables de entorno
env
printenv

# Variables más importantes
echo $HOME      # directorio home
echo $USER      # usuario actual
echo $PATH      # rutas de búsqueda de comandos
echo $SHELL     # shell por defecto
echo $LANG      # idioma/locale
echo $EDITOR    # editor por defecto
echo $TERM      # tipo de terminal
echo $PS1       # prompt del shell
```

---

## Definir y exportar variables

```bash
# Variable solo para la sesión actual (no heredada por subprocesos)
MI_VAR="hola"

# Exportar para que los subprocesos la hereden
export MI_VAR="hola"
export EDITOR=vim
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk

# En una sola línea
export MI_APP_PORT=8080 MI_APP_ENV=production

# Verificar
printenv MI_VAR
```

---

## Configuración persistente en ~/.bashrc

```bash
# ~/.bashrc — se carga en shells interactivos

# Aliases útiles
alias ll='ls -lah --color=auto'
alias la='ls -lah --color=auto'
alias grep='grep --color=auto'
alias ..='cd ..'
alias ...='cd ../..'

# Variables de entorno
export EDITOR=vim
export VISUAL=vim
export HISTSIZE=10000
export HISTFILESIZE=20000
export HISTCONTROL=ignoredups:erasedups  # no guardar duplicados

# PATH extendido
export PATH="$HOME/.local/bin:$HOME/bin:$PATH"

# Funciones
mkcd() { mkdir -p "$1" && cd "$1"; }

# Prompt personalizado
PS1='\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ '
```

---

## Aplicar cambios sin reiniciar sesión

```bash
# Recargar el bashrc
source ~/.bashrc
# o equivalente:
. ~/.bashrc

# Recargar el profile
source ~/.bash_profile
```

---

## /etc/environment: variables globales del sistema

```bash
# Se carga por PAM para todos los usuarios
cat /etc/environment
# PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
# LANG="es_ES.UTF-8"

# Añadir variable global (requiere sudo y reinicio de sesión)
sudo tee -a /etc/environment <<EOF
JAVA_HOME=/usr/lib/jvm/java-17-openjdk
EOF
```

---

## Práctica

1. Añade `export EDITOR=nano` a tu `~/.bashrc` y recárgalo con `source`
2. Crea una función `mkcd()` en bashrc que haga `mkdir` + `cd` en un paso
3. Añade `$HOME/.local/bin` a tu `$PATH` si no está ya
4. Investiga qué archivos se cargan ejecutando `bash --login --verbose` y observa la salida
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Personalizar .bashrc",
                "description": "Añade a ~/.bashrc: el alias 'll' para ls -lah, la función mkcd(), y exporta EDITOR=nano. Recarga y verifica que funcionan.",
                "hint": "source ~/.bashrc y luego: type ll, type mkcd, echo $EDITOR",
                "validation_command": "source ~/.bashrc && type ll && echo $EDITOR",
                "expected_output_contains": "alias"
            }
        ]
    },
    {
        "title": "Skelets y Valores por Defecto para Nuevos Usuarios",
        "description": "Configura /etc/skel para que los nuevos usuarios reciban automáticamente archivos de configuración predeterminados, y establece los defaults del sistema para useradd.",
        "difficulty": "intermediate",
        "duration_minutes": 35,
        "xp_reward": 115,
        "learning_objectives": [
            "Entender y modificar /etc/skel",
            "Configurar defaults en /etc/default/useradd",
            "Crear plantillas de entorno para usuarios",
            "Personalizar /etc/adduser.conf"
        ],
        "commands": ["/etc/skel", "/etc/default/useradd", "useradd -D", "/etc/login.defs"],
        "guide_markdown": """# Skeletons y Valores por Defecto para Nuevos Usuarios

## /etc/skel: la plantilla de home

Cuando creas un usuario con `useradd -m`, Linux copia el contenido de `/etc/skel/` al home del usuario.

```bash
ls -la /etc/skel/
# drwxr-xr-x  2 root root 4096 Jan  1 00:00 .
# drwxr-xr-x 91 root root 4096 Jan 15 10:00 ..
# -rw-r--r--  1 root root  220 Jan  1 00:00 .bash_logout
# -rw-r--r--  1 root root 3526 Jan  1 00:00 .bashrc
# -rw-r--r--  1 root root  807 Jan  1 00:00 .profile
```

---

## Personalizar /etc/skel

```bash
# Añadir configuración personalizada para todos los nuevos usuarios
sudo tee /etc/skel/.bashrc_custom <<'EOF'
# Configuración corporativa
export EDITOR=vim
export PAGER=less
alias ll='ls -lah --color=auto'
alias la='ls -lah --color=auto'
alias grep='grep --color=auto'

# Historial extendido
HISTSIZE=5000
HISTFILESIZE=10000
HISTCONTROL=ignoredups:erasedups
EOF

# Añadir al .bashrc que cargue el custom
echo 'source ~/.bashrc_custom' | sudo tee -a /etc/skel/.bashrc

# Crear estructura de directorios estándar
sudo mkdir -p /etc/skel/{bin,projects,.config}

# Añadir archivo de bienvenida
sudo tee /etc/skel/README.txt <<EOF
Bienvenido al sistema.
Documentación: /opt/docs/
Soporte: admin@empresa.com
EOF
```

---

## /etc/default/useradd: valores por defecto

```bash
# Ver configuración actual
useradd -D
# GROUP=100
# HOME=/home
# INACTIVE=-1
# EXPIRE=
# SHELL=/bin/sh
# SKEL=/etc/skel
# CREATE_MAIL_SPOOL=no

# Cambiar el shell por defecto
sudo useradd -D -s /bin/bash

# Cambiar el directorio base para homes
sudo useradd -D -b /opt/usuarios

# Ver el archivo directamente
cat /etc/default/useradd
```

---

## /etc/login.defs: políticas del sistema

```bash
cat /etc/login.defs | grep -v "^#" | grep -v "^$"

# Variables importantes:
# PASS_MAX_DAYS  90      → contraseñas expiran en 90 días
# PASS_MIN_DAYS  7       → mínimo 7 días entre cambios
# PASS_WARN_AGE  14      → aviso 14 días antes
# UID_MIN         1000   → primer UID para usuarios normales
# UID_MAX         60000  → último UID para usuarios normales
# GID_MIN         1000   → primer GID
# CREATE_HOME     yes    → crear home automáticamente
# UMASK           022    → umask por defecto
```

---

## Aplicar skel a usuario existente

```bash
# Si ya existe un usuario pero quieres aplicar el skel:
cp -rn /etc/skel/. /home/alice/
chown -R alice:alice /home/alice/
# -n: no sobreescribir archivos existentes
```

---

## Práctica

1. Añade a `/etc/skel/.bashrc` los aliases `ll` y `grep` coloreados
2. Crea `/etc/skel/LEEME.txt` con información de bienvenida
3. Crea un usuario nuevo `skeltest` y verifica que recibe los archivos del skel
4. Configura `useradd -D` para que el shell por defecto sea `/bin/bash`
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Configurar skel y crear usuario",
                "description": "Añade un alias 'll' a /etc/skel/.bashrc, crea el usuario 'skeltest', y verifica que el alias existe en su ~/.bashrc.",
                "hint": "echo \"alias ll='ls -lah'\" | sudo tee -a /etc/skel/.bashrc && sudo useradd -m skeltest",
                "validation_command": "grep -c 'alias ll' /home/skeltest/.bashrc 2>/dev/null || echo 0",
                "expected_output_contains": "1"
            }
        ]
    },
    {
        "title": "Límites de Recursos del Sistema: ulimit y /etc/security/limits.conf",
        "description": "Controla los recursos que cada usuario puede consumir: número de procesos, tamaño de archivos, memoria y descriptores de fichero. Previene el abuso y protege el sistema.",
        "difficulty": "intermediate",
        "duration_minutes": 40,
        "xp_reward": 125,
        "learning_objectives": [
            "Ver y establecer límites con ulimit",
            "Configurar límites persistentes en limits.conf",
            "Distinguir límites soft y hard",
            "Limitar recursos por usuario o grupo"
        ],
        "commands": ["ulimit", "/etc/security/limits.conf", "ulimit -a", "ulimit -n", "ulimit -u"],
        "guide_markdown": """# Límites de Recursos: ulimit y limits.conf

## ¿Por qué limitar recursos?

Sin límites, un usuario malicioso o un proceso con bug puede:
- Abrir millones de descriptores de archivo (fork bomb, etc.)
- Crear archivos gigantescos llenando el disco
- Consumir toda la RAM con procesos

---

## ulimit: límites de la sesión actual

```bash
# Ver todos los límites actuales
ulimit -a

# Límites específicos más importantes:
ulimit -n      # descriptores de archivo abiertos (nofile)
ulimit -u      # número de procesos (nproc)
ulimit -f      # tamaño máximo de archivo (fsize, en bloques de 512B)
ulimit -m      # memoria máxima (en KB, muchos sistemas no lo aplican)
ulimit -t      # tiempo de CPU en segundos
ulimit -s      # tamaño de stack

# Cambiar límites para la sesión actual
ulimit -n 1024      # máx 1024 descriptores abiertos
ulimit -u 100       # máx 100 procesos
ulimit -f 102400    # máx ~50MB por archivo (102400 * 512B)
```

---

## Límites soft vs hard

- **Soft limit**: el límite actual del proceso. El usuario puede aumentarlo hasta el hard limit.
- **Hard limit**: techo absoluto. Solo root puede aumentarlo.

```bash
# Ver soft y hard limits
ulimit -Sn    # soft nofile
ulimit -Hn    # hard nofile

# Establecer soft y hard simultáneamente
ulimit -Sn 512 -Hn 1024

# Los procesos hijos heredan los límites del padre
```

---

## /etc/security/limits.conf: límites persistentes

Formato: `dominio tipo elemento valor`

```bash
cat /etc/security/limits.conf

# Ejemplos de configuración:
sudo tee -a /etc/security/limits.conf <<EOF
# Usuario específico
alice       soft    nofile      4096
alice       hard    nofile      8192
alice       soft    nproc       100
alice       hard    nproc       200

# Grupo (con @)
@developers soft    nofile      8192
@developers hard    nofile      16384

# Todos los usuarios
*           soft    core        0         # deshabilitar core dumps
*           hard    core        0

# Límite de archivos para webserver
www-data    soft    nofile      65535
www-data    hard    nofile      65535
EOF
```

---

## /etc/security/limits.d/ (directorio de override)

Mejor práctica: crear archivos separados por aplicación:

```bash
# Para Nginx/Apache
sudo tee /etc/security/limits.d/90-webserver.conf <<EOF
www-data    soft    nofile      65535
www-data    hard    nofile      65535
EOF

# Para base de datos
sudo tee /etc/security/limits.d/90-postgres.conf <<EOF
postgres    soft    nofile      65535
postgres    hard    nofile      65535
postgres    soft    nproc       4096
postgres    hard    nproc       8192
EOF
```

---

## La fork bomb y cómo prevenir la

```bash
# Fork bomb (¡NO EJECUTAR en sistemas de producción!):
# :(){ :|:& };:

# Prevenir con límite de procesos:
sudo tee /etc/security/limits.d/99-fork-bomb-prevention.conf <<EOF
*           hard    nproc       150
EOF

# Con este límite activo, la fork bomb no puede crear más de 150 procesos
# y el sistema sigue siendo operable
```

---

## Práctica

1. Ejecuta `ulimit -a` y documenta los límites actuales de tu sesión
2. Aumenta el límite de descriptores de archivo a 4096 con `ulimit -n 4096`
3. Añade a `/etc/security/limits.d/mi_config.conf` un límite de 2048 archivos abiertos para tu usuario
4. Verifica los límites de un proceso con `cat /proc/$$/limits`
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Configurar límites de recursos",
                "description": "Muestra los límites actuales con ulimit -a, aumenta nofile a 4096, y verifica que se aplicó. Además muestra los límites del proceso actual desde /proc.",
                "hint": "ulimit -n 4096 && ulimit -n && cat /proc/$$/limits | grep 'Max open files'",
                "validation_command": "ulimit -n 4096 && ulimit -n",
                "expected_output_contains": "4096"
            }
        ]
    },
    {
        "title": "nsswitch y PAM: Cómo Linux Resuelve Identidades",
        "description": "Entiende el sistema de resolución de nombres NSS y el framework PAM que controla cómo Linux autentica usuarios, añade sesiones y gestiona contraseñas.",
        "difficulty": "advanced",
        "duration_minutes": 40,
        "xp_reward": 140,
        "learning_objectives": [
            "Entender /etc/nsswitch.conf",
            "Conocer el rol de PAM en la autenticación",
            "Leer y entender una pila PAM básica",
            "Diagnosticar problemas de autenticación"
        ],
        "commands": ["getent", "/etc/nsswitch.conf", "pam", "pamtester", "strace"],
        "guide_markdown": """# NSS y PAM: La Infraestructura de Autenticación

## /etc/nsswitch.conf: Name Service Switch

Determina qué fuentes consulta Linux para resolver usuarios, grupos, hosts, etc.

```bash
cat /etc/nsswitch.conf
# passwd:   files systemd
# group:    files systemd
# shadow:   files
# hosts:    files dns mDNS4_minimal
# networks: files
```

**Fuentes disponibles:**
- `files` — /etc/passwd, /etc/group, /etc/hosts...
- `dns` — DNS (para hosts)
- `ldap` — Directorio LDAP (usuarios corporativos)
- `systemd` — Users gestionados por systemd
- `nis` — Network Information Service (legacy)

```bash
# getent: consulta usando nsswitch.conf
getent passwd alice         # busca alice en todas las fuentes
getent group sudo           # miembros del grupo sudo
getent hosts github.com     # resuelve hostname
```

---

## PAM: Pluggable Authentication Modules

PAM es el framework que controla:
- **auth**: autenticación (¿es quien dice ser?)
- **account**: verificación de cuenta (¿puede iniciar sesión ahora?)
- **password**: cambio de contraseñas
- **session**: configuración de la sesión (montar home, umask, etc.)

```bash
ls /etc/pam.d/
# common-auth    common-account    common-session
# sshd           sudo              login    su
```

---

## Anatomía de un archivo PAM

```bash
cat /etc/pam.d/common-auth
# auth    [success=1 default=ignore]  pam_unix.so nullok
# auth    requisite                   pam_deny.so
# auth    required                    pam_permit.so
```

**Tipos de control:**

| Control | Significado |
|---------|-------------|
| `required` | Debe tener éxito; el fallo continúa la pila pero falla al final |
| `requisite` | Debe tener éxito; fallo detiene inmediatamente la pila |
| `sufficient` | Si tiene éxito y no hay fallo previo, la pila termina con éxito |
| `optional` | No afecta al resultado general |

---

## Módulos PAM más comunes

```bash
# pam_unix.so — autenticación con /etc/shadow
auth required pam_unix.so nullok

# pam_securetty.so — solo root desde terminales seguras
auth required pam_securetty.so

# pam_limits.so — aplica limits.conf
session required pam_limits.so

# pam_env.so — variables de entorno
session required pam_env.so readenv=1

# pam_motd.so — mensaje del día
session optional pam_motd.so motd=/run/motd.dynamic

# pam_lastlog.so — mostrar último login
session optional pam_lastlog.so nowtmp showfailed
```

---

## Diagnóstico de problemas de autenticación

```bash
# Ver logs de autenticación
sudo tail -f /var/log/auth.log       # Debian/Ubuntu
sudo tail -f /var/log/secure         # RHEL/CentOS

# Buscar fallos de login
sudo grep "Failed password" /var/log/auth.log | tail -20

# Buscar sesiones sudo
sudo grep "sudo" /var/log/auth.log | tail -20

# Verificar que NSS encuentra al usuario
getent passwd alice
getent group docker

# Strace para diagnóstico profundo
sudo strace -e trace=open,read -p $(pgrep sshd) 2>&1 | grep passwd
```

---

## Práctica

1. Lee `/etc/nsswitch.conf` y explica de qué fuentes obtiene Linux los usuarios y los hosts
2. Usa `getent passwd` para listar todos los usuarios y compara con `cat /etc/passwd`
3. Lee `/etc/pam.d/sudo` y explica qué módulos se ejecutan al hacer sudo
4. Busca en `/var/log/auth.log` los últimos 5 eventos de autenticación de tu usuario
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Explorar NSS y PAM",
                "description": "Muestra con getent la información de tu usuario (passwd) y tu grupo primario (group). Luego muestra cuántas líneas tiene /etc/pam.d/common-auth.",
                "hint": "getent passwd $USER && getent group $(id -gn) && wc -l /etc/pam.d/common-auth",
                "validation_command": "getent passwd $USER | cut -d: -f1",
                "expected_output_contains": "$USER"
            }
        ]
    },
    {
        "title": "Proyecto M1: Script de Gestión de Usuarios",
        "description": "Proyecto integrador del módulo 1: construye un script completo de gestión de usuarios que automatiza la creación, modificación, auditoría y eliminación de cuentas.",
        "difficulty": "advanced",
        "duration_minutes": 60,
        "xp_reward": 250,
        "learning_objectives": [
            "Integrar useradd, usermod, passwd y chage en un script",
            "Implementar auditoría de cuentas",
            "Crear usuarios en lote desde CSV",
            "Generar informe de estado de cuentas"
        ],
        "commands": ["useradd", "usermod", "passwd", "chage", "gpasswd", "awk", "csv"],
        "guide_markdown": """# Proyecto M1: Script de Gestión de Usuarios

## Objetivo

Crear `user_manager.sh`, un script CLI para gestionar usuarios con subcomandos.

---

## Funcionalidades requeridas

```
user_manager.sh create  --user NOMBRE [--shell SHELL] [--groups GRUPOS]
user_manager.sh delete  --user NOMBRE [--purge]
user_manager.sh info    --user NOMBRE
user_manager.sh lock    --user NOMBRE
user_manager.sh unlock  --user NOMBRE
user_manager.sh audit   [--output FILE]
user_manager.sh bulk    --csv ARCHIVO
```

---

## Implementación base

```bash
#!/usr/bin/env bash
set -euo pipefail

require_root() {
    [[ $EUID -eq 0 ]] || { echo "Requiere root" >&2; exit 1; }
}

cmd_create() {
    local user="" shell="/bin/bash" groups=""
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --user)   user="$2"; shift 2 ;;
            --shell)  shell="$2"; shift 2 ;;
            --groups) groups="$2"; shift 2 ;;
            *) echo "Opción desconocida: $1" >&2; exit 1 ;;
        esac
    done
    [[ -n "$user" ]] || { echo "--user requerido"; exit 1; }
    require_root
    useradd -m -s "$shell" "$user"
    [[ -n "$groups" ]] && usermod -aG "$groups" "$user"
    passwd "$user"
    echo "Usuario '$user' creado"
    id "$user"
}

cmd_info() {
    local user="${1:?'--user requerido'}"
    echo "=== INFO: $user ==="
    id "$user"
    chage -l "$user"
    echo "Grupos: $(groups "$user")"
    echo "Último login: $(lastlog -u "$user" | tail -1)"
}

cmd_audit() {
    local output="${1:-/dev/stdout}"
    {
        echo "=== AUDITORÍA DE CUENTAS: $(date) ==="
        printf "%-15s %-12s %-10s %-10s\n" "USUARIO" "ESTADO" "EXPIRA_PW" "ÚLTIMO_LOGIN"
        echo "────────────────────────────────────────────"
        while IFS=: read -r user _ uid _; do
            (( uid >= 1000 && uid < 65534 )) || continue
            status=$(passwd -S "$user" 2>/dev/null | awk '{print $2}')
            max_days=$(chage -l "$user" 2>/dev/null | grep "Maximum" | awk '{print $NF}')
            last_login=$(lastlog -u "$user" 2>/dev/null | tail -1 | awk '{if($2=="**") print "Never"; else print $5,$6,$7}')
            printf "%-15s %-12s %-10s %-10s\n" "$user" "$status" "$max_days" "$last_login"
        done < /etc/passwd
    } > "$output"
    echo "Auditoría guardada en: $output"
}

cmd_bulk() {
    local csv_file="${1:?'--csv requerido'}"
    require_root
    # CSV formato: usuario,grupos,shell
    # alice,sudo:docker,/bin/bash
    while IFS=, read -r user groups shell; do
        [[ "$user" == "usuario" ]] && continue  # saltar cabecera
        [[ -z "$user" ]] && continue
        echo "Creando: $user (grupos: $groups, shell: $shell)"
        useradd -m -s "${shell:-/bin/bash}" "$user" || echo "  SKIP: $user ya existe"
        [[ -n "$groups" ]] && usermod -aG "${groups//:/ -aG }" "$user" 2>/dev/null || true
    done < "$csv_file"
    echo "Creación en lote completada"
}

# Dispatcher
case "${1:-}" in
    create) shift; cmd_create "$@" ;;
    delete) shift; require_root; userdel "${2}" ${3:+-r} ;;
    info)   shift; cmd_info "${2:-$USER}" ;;
    lock)   shift; require_root; usermod -L "${2:?'--user requerido'}"; echo "Cuenta bloqueada" ;;
    unlock) shift; require_root; usermod -U "${2:?'--user requerido'}"; echo "Cuenta desbloqueada" ;;
    audit)  shift; cmd_audit "${2:-}" ;;
    bulk)   shift; cmd_bulk "${2:-}" ;;
    *)      echo "Uso: $0 {create|delete|info|lock|unlock|audit|bulk} [opciones]"; exit 1 ;;
esac
```

---

## Caso de uso: alta masiva de alumnos

```bash
# alumnos.csv
# usuario,grupos,shell
# alumno01,alumnos,/bin/bash
# alumno02,alumnos,/bin/bash
# alumno03,alumnos:docker,/bin/bash

sudo ./user_manager.sh bulk --csv alumnos.csv
sudo ./user_manager.sh audit --output /tmp/auditoria_$(date +%Y%m%d).txt
```

---

## Tarea del proyecto

1. Implementa `user_manager.sh` con todos los subcomandos
2. El subcomando `audit` debe generar un CSV exportable
3. El subcomando `bulk` debe manejar errores (usuarios ya existentes, grupos inválidos)
4. Añade logging: cada acción queda registrada en `/var/log/user_manager.log`
""",
        "challenges": [
            {
                "id": "c1",
                "title": "CLI de gestión funcional",
                "description": "Implementa user_manager.sh con los subcomandos: info (funciona sin root), audit (genera reporte), y create (requiere root). Prueba info con tu propio usuario.",
                "hint": "bash user_manager.sh info --user $USER",
                "validation_command": "bash user_manager.sh info --user $USER 2>&1 | grep -i 'uid\\|grupo\\|login'",
                "expected_output_contains": "uid"
            }
        ]
    },
]

# ─── M2: Permisos Básicos ────────────────────────────────────────────────────

M2_LABS = [
    {
        "title": "Permisos de Archivos: La Tríada rwx",
        "description": "Comprende el sistema de permisos de Linux: qué significan r, w y x para archivos y directorios, cómo leer la salida de ls -l y por qué importa cada bit.",
        "difficulty": "beginner",
        "duration_minutes": 25,
        "xp_reward": 80,
        "learning_objectives": [
            "Leer e interpretar la salida de ls -l",
            "Entender rwx para archivos vs directorios",
            "Distinguir propietario, grupo y otros",
            "Identificar el tipo de archivo por el primer carácter"
        ],
        "commands": ["ls -l", "ls -la", "stat", "file"],
        "guide_markdown": """# Permisos de Archivos: La Tríada rwx

## La salida de ls -l

```
-rwxr-xr-- 1 alice developers 4096 Jan 15 10:00 script.sh
│└┬┘└┬┘└┬┘                                       ^nombre
│ │  │  │
│ │  │  └── otros: r-- (solo lectura)
│ │  └───── grupo (developers): r-x (leer y ejecutar)
│ └──────── propietario (alice): rwx (todo)
└────────── tipo: - archivo regular
```

**Tipos de archivo (primer carácter):**
- `-` archivo regular
- `d` directorio
- `l` enlace simbólico
- `b` dispositivo de bloque
- `c` dispositivo de carácter
- `p` pipe (tubería)
- `s` socket

---

## ¿Qué significa rwx?

**Para archivos:**

| Permiso | Significado                          |
|---------|--------------------------------------|
| `r`     | Puede leer el contenido del archivo  |
| `w`     | Puede modificar el archivo           |
| `x`     | Puede ejecutar el archivo como programa |

**Para directorios:**

| Permiso | Significado                                    |
|---------|------------------------------------------------|
| `r`     | Puede listar el contenido (`ls`)               |
| `w`     | Puede crear/eliminar archivos en el directorio |
| `x`     | Puede entrar al directorio (`cd`) y acceder a archivos |

---

## Casos importantes de directorio

```bash
# Sin x: no puedes acceder aunque tengas r
chmod 444 /tmp/test_dir    # r--r--r--
ls /tmp/test_dir           # ✓ puedes listar
cat /tmp/test_dir/archivo  # ✗ "Permission denied" — no puedes acceder
cd /tmp/test_dir           # ✗ "Permission denied"

# Sin r pero con x: puedes acceder si sabes el nombre exacto
chmod 111 /tmp/test_dir    # --x--x--x
ls /tmp/test_dir           # ✗ "Permission denied" — no puedes listar
cat /tmp/test_dir/archivo  # ✓ puedes acceder si sabes el nombre
```

---

## stat: información completa

```bash
stat script.sh
# File: script.sh
# Size: 4096            Blocks: 8          IO Block: 4096   regular file
# Device: 805h/2053d    Inode: 131073       Links: 1
# Access: (0755/-rwxr-xr-x)  Uid: (1000/alice)   Gid: (1000/alice)
# Modify: 2024-01-15 10:00:00.000000000 +0100
# Change: 2024-01-15 10:00:00.000000000 +0100
# Birth: -
```

---

## Práctica

1. Crea un directorio de prueba con varios archivos y analiza sus permisos con `ls -la`
2. ¿Puedes ejecutar un archivo sin permiso `x`? ¿Y con `x` pero sin `r`?
3. Usa `stat` para ver los permisos en formato octal de varios archivos del sistema
4. ¿Por qué `/etc/passwd` tiene permisos `644` pero `/etc/shadow` tiene `640`?
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Analizar permisos del sistema",
                "description": "Muestra los permisos en formato octal (stat -c %a) de /etc/passwd, /etc/shadow, /etc/hosts y /bin/ls. Explica por qué cada uno tiene los permisos que tiene.",
                "hint": "for f in /etc/passwd /etc/shadow /etc/hosts /bin/ls; do echo -n \"$f: \"; stat -c \"%a %U:%G\" $f 2>/dev/null || echo 'sin acceso'; done",
                "validation_command": "stat -c '%a' /etc/passwd",
                "expected_output_contains": "644"
            }
        ]
    },
    {
        "title": "chmod: Cambiar Permisos en Octal y Simbólico",
        "description": "Domina chmod con notación octal y simbólica. Aprende cuándo usar cada una y cómo calcular los valores octales mentalmente.",
        "difficulty": "beginner",
        "duration_minutes": 30,
        "xp_reward": 100,
        "learning_objectives": [
            "Usar chmod en notación simbólica (u+x, g-w, o=r)",
            "Calcular y usar chmod en notación octal (644, 755, 700)",
            "Aplicar permisos recursivamente con -R",
            "Saber qué permisos usar para cada caso de uso"
        ],
        "commands": ["chmod", "chmod -R", "chmod u+x", "chmod 755", "chmod a="],
        "guide_markdown": """# chmod: Cambiar Permisos

## Notación simbólica

```
chmod [quien][operación][permiso] archivo
```

**Quién:**
- `u` — usuario (propietario)
- `g` — grupo
- `o` — otros
- `a` — todos (equivale a ugo)

**Operación:**
- `+` añadir
- `-` quitar
- `=` establecer exactamente

**Ejemplos:**
```bash
chmod u+x script.sh         # dar ejecución al propietario
chmod g-w archivo.txt        # quitar escritura al grupo
chmod o= privado.txt         # quitar todos los permisos a otros
chmod a+r público.txt        # dar lectura a todos
chmod u+x,g-w,o= multi.sh   # múltiples cambios
chmod ug=rw,o=r shared.txt   # rw para user/group, r para otros
```

---

## Notación octal

Cada grupo de permisos (u, g, o) se representa con un número 0–7:

```
r = 4
w = 2
x = 1
─────
rwx = 4+2+1 = 7
rw- = 4+2+0 = 6
r-x = 4+0+1 = 5
r-- = 4+0+0 = 4
-wx = 0+2+1 = 3
-w- = 0+2+0 = 2
--x = 0+0+1 = 1
--- = 0+0+0 = 0
```

**Permisos comunes:**
| Octal | Simbólico | Uso típico |
|-------|-----------|------------|
| `755` | rwxr-xr-x | Scripts ejecutables, directorios públicos |
| `644` | rw-r--r-- | Archivos de configuración, texto |
| `600` | rw------- | Archivos privados (claves SSH) |
| `700` | rwx------ | Directorios privados |
| `770` | rwxrwx--- | Directorio compartido de grupo |
| `664` | rw-rw-r-- | Archivo compartido de grupo |
| `777` | rwxrwxrwx | ¡Nunca! (inseguro) |

---

## Aplicar permisos

```bash
# Notación octal
chmod 755 mi_script.sh
chmod 644 config.txt
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa

# Recursivo: aplicar a directorio y todo su contenido
chmod -R 755 /var/www/html/
chmod -R u+X /opt/proyecto    # X mayúscula: solo añade x a directorios

# La X mayúscula es útil:
# Sin X: chmod +x añadiría x a archivos de texto también
# Con X: chmod +X solo añade x si ya es directorio o ya tenía x
chmod -R o+X /opt/proyecto    # correcto para dar acceso de lectura al árbol
```

---

## Casos de uso reales

```bash
# Script de Bash
chmod 755 backup.sh        # propietario puede todo, resto puede ejecutar

# Clave SSH privada (SSH rechaza si es demasiado permisiva)
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub

# Directorio web
chmod 755 /var/www/html
chmod 644 /var/www/html/*.html

# Directorio privado de logs de aplicación
chmod 750 /var/log/mi_app   # solo propietario y grupo pueden leer

# Archivo de configuración con contraseñas
chmod 600 /etc/mi_app/config.conf

# Directorio compartido (con setgid para grupo)
chmod 2775 /opt/proyecto_compartido
```

---

## Práctica

1. Crea `test_permisos.sh`, dale permiso de ejecución solo al propietario con chmod simbólico
2. Calcula mentalmente: ¿qué octal es `rwxr-x---`? Verifica con `stat`
3. Crea un directorio con archivos y aplica `chmod -R` para dejarlo accesible públicamente para lectura pero solo el propietario puede escribir
4. Busca archivos del sistema con permisos 777: `find /tmp -perm 777 -ls 2>/dev/null`
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Configurar permisos correctos",
                "description": "Crea una estructura de archivos: un script .sh (debe ser ejecutable por el propietario), un config.txt (solo el propietario puede leer/escribir), y un public.html (legible por todos). Usa chmod para configurarlos.",
                "hint": "chmod 700 script.sh; chmod 600 config.txt; chmod 644 public.html",
                "validation_command": "stat -c '%a' script.sh config.txt public.html 2>/dev/null",
                "expected_output_contains": "644"
            }
        ]
    },
    {
        "title": "chown y chgrp: Cambiar Propietario y Grupo",
        "description": "Aprende a cambiar el propietario y grupo de archivos y directorios con chown y chgrp. Entiende cuándo y por qué cambiar la propiedad en administración de sistemas.",
        "difficulty": "beginner",
        "duration_minutes": 30,
        "xp_reward": 100,
        "learning_objectives": [
            "Cambiar propietario con chown",
            "Cambiar grupo con chgrp y chown",
            "Aplicar cambios recursivos con -R",
            "Gestionar propiedad en directorios web y compartidos"
        ],
        "commands": ["chown", "chgrp", "chown -R", "chown usuario:grupo"],
        "guide_markdown": """# chown y chgrp: Cambiar Propietario y Grupo

## chown: cambiar propietario

```bash
# Sintaxis
chown usuario archivo
chown usuario:grupo archivo
chown :grupo archivo       # solo cambiar grupo (equivale a chgrp)

# Ejemplos básicos (requieren ser root o propietario del archivo)
sudo chown alice config.txt
sudo chown alice:developers config.txt
sudo chown :www-data /var/www/html/index.html

# Recursivo: cambia propietario de directorio y todo su contenido
sudo chown -R alice:alice /home/alice
sudo chown -R www-data:www-data /var/www/html

# Copiar propietario de otro archivo (--reference)
sudo chown --reference=/etc/passwd mi_config.conf
```

---

## chgrp: cambiar grupo

```bash
# Cambiar solo el grupo
sudo chgrp developers proyecto.py
sudo chgrp -R www-data /var/www/html/
sudo chgrp --reference=/etc/group mi_archivo
```

---

## Escenarios comunes

**1. Servidor web — Apache/Nginx:**
```bash
# El servidor web necesita leer los archivos
sudo chown -R root:www-data /var/www/html/
sudo chmod -R 750 /var/www/html/
sudo chmod -R 644 /var/www/html/*.html

# Si el usuario del servidor necesita escribir (para subidas):
sudo chown -R www-data:www-data /var/www/html/uploads/
sudo chmod -R 755 /var/www/html/uploads/
```

**2. Directorio compartido de equipo:**
```bash
sudo groupadd equipo_dev
sudo usermod -aG equipo_dev alice
sudo usermod -aG equipo_dev bob

sudo mkdir /opt/proyecto
sudo chown root:equipo_dev /opt/proyecto
sudo chmod 2775 /opt/proyecto  # setgid + rwxrwxr-x
```

**3. Corregir permisos de home después de operaciones root:**
```bash
# Si root creó archivos en home de alice:
sudo chown -R alice:alice /home/alice/
```

---

## Verificar antes y después

```bash
# Verificar propietario actual
ls -la archivo.txt
stat -c "%U:%G %a" archivo.txt   # usuario:grupo permisos_octal

# Cambiar y verificar
sudo chown alice:alice archivo.txt
ls -l archivo.txt
```

---

## Práctica

1. Crea un archivo como root con `sudo touch /tmp/root_file.txt`. ¿Quién es el propietario?
2. Cambia el propietario a tu usuario con `chown`
3. Crea el directorio `/tmp/equipo_test` con el grupo `adm` y permisos setgid
4. Escribe un script que corrija los permisos de un directorio web (propietario root, grupo www-data, directorios 755, archivos 644)
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Configurar directorio web con permisos correctos",
                "description": "Crea /tmp/web_test/ con los permisos de un servidor web: propietario root, grupo www-data (o tu usuario), directorios 755, archivos HTML 644. Crea 3 archivos HTML dentro.",
                "hint": "sudo mkdir -p /tmp/web_test && sudo chown root:$USER /tmp/web_test && sudo chmod 755 /tmp/web_test && for i in 1 2 3; do sudo touch /tmp/web_test/page$i.html && sudo chmod 644 /tmp/web_test/page$i.html; done",
                "validation_command": "stat -c '%a' /tmp/web_test/page1.html 2>/dev/null",
                "expected_output_contains": "644"
            }
        ]
    },
    {
        "title": "umask: Permisos por Defecto para Nuevos Archivos",
        "description": "Entiende qué es el umask, cómo determina los permisos por defecto de nuevos archivos y directorios, y cómo configurarlo para diferentes contextos de seguridad.",
        "difficulty": "intermediate",
        "duration_minutes": 30,
        "xp_reward": 110,
        "learning_objectives": [
            "Entender cómo funciona el umask",
            "Calcular permisos resultantes con umask",
            "Configurar umask para usuarios y servicios",
            "Umask en scripts y entornos restringidos"
        ],
        "commands": ["umask", "umask 027", "umask -S"],
        "guide_markdown": """# umask: Permisos por Defecto para Nuevos Archivos

## ¿Qué es el umask?

El umask es una **máscara de bits** que define qué permisos se **eliminan** (no se otorgan) al crear nuevos archivos y directorios.

```
Permisos máximos:
  Archivos:     666 (rw-rw-rw-) — no x por seguridad
  Directorios:  777 (rwxrwxrwx)

Resultado = Máximos - umask
  Con umask 022:
    Archivos:     666 - 022 = 644 (rw-r--r--)
    Directorios:  777 - 022 = 755 (rwxr-xr-x)
```

---

## Cálculo del umask

Más precisamente, es una operación AND con NOT del umask:

```
Permisos = MaxPermisos AND NOT(umask)

umask 022:
NOT(022) = NOT(000 010 010) = 111 101 101 = 755

Para archivos: 666 AND 755 = 644
Para directorios: 777 AND 755 = 755
```

| umask | Archivos nuevos | Directorios nuevos | Uso típico |
|-------|----------------|-------------------|------------|
| 022   | 644             | 755               | Defecto del sistema |
| 027   | 640             | 750               | Entornos más seguros |
| 077   | 600             | 700               | Privado total |
| 002   | 664             | 775               | Trabajo en grupo |

---

## Ver y cambiar el umask

```bash
# Ver umask actual
umask          # formato octal
umask -S       # formato simbólico (u=rwx,g=rx,o=rx)

# Cambiar umask para la sesión actual
umask 027      # archivos → 640, directorios → 750
umask 077      # archivos → 600, directorios → 700

# Verificar el efecto
umask 027
touch nuevo_archivo.txt
mkdir nuevo_directorio
ls -l nuevo_archivo.txt nuevo_directorio
```

---

## umask persistente

```bash
# En ~/.bashrc (solo para tu usuario)
echo "umask 027" >> ~/.bashrc
source ~/.bashrc

# Para todos los usuarios: /etc/profile o /etc/profile.d/
sudo tee /etc/profile.d/umask.sh <<EOF
umask 022
EOF

# Para servicios específicos (via PAM)
# /etc/pam.d/common-session:
# session optional pam_umask.so umask=0027

# En /etc/login.defs
# UMASK    027
```

---

## umask en scripts

```bash
#!/usr/bin/env bash
# Establecer umask al inicio del script para control total

# Para archivos privados
umask 077
touch ~/.mi_config_privado    # solo el propietario puede leer/escribir

# Para archivos de log compartidos
umask 022
touch /var/log/mi_app.log     # todos pueden leer
```

---

## Práctica

1. ¿Cuál es tu umask actual? ¿Qué permisos crean tus nuevos archivos?
2. Cambia el umask a `027` y crea un archivo y un directorio. Verifica los permisos con ls -l
3. Cambia a `002` y verifica que los nuevos archivos son escribibles por el grupo
4. Restaura el umask a `022`
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Calcular y verificar umask",
                "description": "Establece umask 027, crea un archivo test.txt y un directorio test_dir. Verifica que tienen permisos 640 y 750 respectivamente.",
                "hint": "umask 027 && touch test027.txt && mkdir test027_dir && stat -c '%a' test027.txt test027_dir",
                "validation_command": "umask 027 && touch /tmp/umask_test.txt && stat -c '%a' /tmp/umask_test.txt",
                "expected_output_contains": "640"
            }
        ]
    },
    {
        "title": "Bits Especiales: SUID, SGID y Sticky Bit",
        "description": "Comprende los bits especiales de Linux: SUID para ejecutar con permisos del propietario, SGID para grupos compartidos, y Sticky Bit para directorios de escritura compartida como /tmp.",
        "difficulty": "intermediate",
        "duration_minutes": 40,
        "xp_reward": 135,
        "learning_objectives": [
            "Entender y configurar el bit SUID",
            "Configurar SGID para directorios compartidos",
            "Entender el Sticky Bit en /tmp",
            "Identificar riesgos de seguridad con SUID"
        ],
        "commands": ["chmod u+s", "chmod g+s", "chmod +t", "find -perm -4000"],
        "guide_markdown": """# Bits Especiales: SUID, SGID y Sticky Bit

## SUID (Set User ID) — bit 4000

Cuando un ejecutable tiene SUID, **se ejecuta con los permisos del propietario**, no del usuario que lo ejecuta.

```bash
ls -l /usr/bin/passwd
# -rwsr-xr-x 1 root root 59976 Jan  1 00:00 /usr/bin/passwd
#    ^s = SUID activo

# passwd necesita SUID porque modifica /etc/shadow (solo accesible por root)
# Pero cualquier usuario puede cambiar SU propia contraseña con él
```

```bash
# Activar SUID
chmod u+s mi_programa
chmod 4755 mi_programa    # 4 = SUID + 755

# Desactivar
chmod u-s mi_programa

# Listar todos los archivos SUID del sistema (¡auditoría de seguridad!)
find / -perm -4000 -type f -ls 2>/dev/null
```

**⚠️ Riesgo de seguridad**: SUID en scripts de shell es ignorado por seguridad. SUID en binarios personalizados puede ser un vector de escalada de privilegios.

---

## SGID (Set Group ID) — bit 2000

**En archivos ejecutables**: se ejecuta con el GID del grupo propietario.

**En directorios** (uso más común): los archivos creados dentro **heredan el grupo del directorio**, no el grupo primario del creador.

```bash
ls -l /usr/bin/write
# -rwxr-sr-x 1 root tty 14328 Jan  1 00:00 /usr/bin/write
#        ^s = SGID

# En directorio:
ls -ld /var/www/html
# drwxr-sr-x 2 root www-data 4096 Jan 15 /var/www/html
#       ^s = SGID en directorio

# Activar SGID
chmod g+s /opt/compartido
chmod 2775 /opt/compartido    # 2 = SGID + 775
```

**Caso de uso práctico:**
```bash
sudo mkdir /opt/equipo
sudo chown root:developers /opt/equipo
sudo chmod 2775 /opt/equipo   # SGID: archivos nuevos heredan grupo "developers"

# Alice crea un archivo
su - alice -c "touch /opt/equipo/archivo.txt"
ls -l /opt/equipo/archivo.txt
# -rw-rw-r-- 1 alice developers 0 Jan 15 /opt/equipo/archivo.txt
#                   ^heredó "developers" por SGID
```

---

## Sticky Bit — bit 1000

En directorios: solo el **propietario del archivo** (o root) puede eliminar o renombrar archivos, aunque otros tengan permiso de escritura en el directorio.

```bash
ls -ld /tmp
# drwxrwxrwt 20 root root 4096 Jan 15 /tmp
#           ^t = Sticky Bit

# Sin sticky: cualquiera con w en el directorio puede borrar archivos de otros
# Con sticky: solo el propietario del archivo puede borrarlo

# Activar
chmod +t /opt/shared
chmod 1777 /opt/shared    # 1 = Sticky + 777

# Verificar
ls -ld /opt/shared
# drwxrwxrwt 2 root root 4096 ...
```

---

## Representación en ls -l

| Bit    | Archivo (en x de owner/group) | Si no hay x |
|--------|-------------------------------|-------------|
| SUID   | `s` en posición x de user     | `S` (sin x) |
| SGID   | `s` en posición x de group    | `S` (sin x) |
| Sticky | `t` en posición x de others   | `T` (sin x) |

---

## Auditoría de seguridad

```bash
# Buscar todos los SUID del sistema
find / -perm -4000 -type f 2>/dev/null | sort

# Buscar todos los SGID
find / -perm -2000 -type f 2>/dev/null | sort

# Archivos world-writable (potencial riesgo)
find / -perm -002 -type f 2>/dev/null | grep -v proc | sort
```

---

## Práctica

1. Verifica que `/tmp` tiene sticky bit: `ls -ld /tmp`
2. Crea `/tmp/sticky_test` con sticky bit. Crea un archivo como tu usuario. Intenta borrarlo como otro usuario (o simula con un segundo terminal)
3. Crea `/opt/sgid_test` con SGID y grupo `adm`. Crea un archivo dentro y verifica que hereda el grupo `adm`
4. Ejecuta la auditoría SUID y anota cuántos binarios SUID tiene tu sistema
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Directorio con SGID y sticky bit",
                "description": "Crea /tmp/sgid_sticky con SGID y sticky bit activos (permisos 3775). Verifica con ls -ld que aparecen ambas 's' y 't'.",
                "hint": "sudo mkdir /tmp/sgid_sticky && sudo chmod 3775 /tmp/sgid_sticky && ls -ld /tmp/sgid_sticky",
                "validation_command": "ls -ld /tmp/sgid_sticky 2>/dev/null | grep -c 't'",
                "expected_output_contains": "1"
            }
        ]
    },
    {
        "title": "find con Permisos: Auditoría del Sistema de Archivos",
        "description": "Usa find con expresiones de permisos para auditar la seguridad del sistema de archivos: encontrar archivos SUID, world-writable, sin propietario y con permisos incorrectos.",
        "difficulty": "intermediate",
        "duration_minutes": 40,
        "xp_reward": 130,
        "learning_objectives": [
            "Buscar archivos por permisos con find -perm",
            "Encontrar archivos SUID/SGID del sistema",
            "Localizar archivos world-writable",
            "Generar informes de auditoría de seguridad"
        ],
        "commands": ["find -perm", "find -user", "find -nouser", "find -newer"],
        "guide_markdown": """# find con Permisos: Auditoría del Sistema de Archivos

## Sintaxis de -perm en find

```bash
# Exactamente este permiso
find . -perm 644

# Al menos estos bits activos (prefijo -)
find . -perm -644     # tiene al menos rw-r--r-- (puede tener más)
find . -perm -4000    # tiene SUID activo

# Cualquiera de estos bits (prefijo /)
find . -perm /111     # cualquiera de los 3 bits de ejecución
find . -perm /4000    # SUID o SGID
```

---

## Auditoría de SUID y SGID

```bash
# Todos los archivos SUID del sistema
echo "=== SUID ==="
find / -perm -4000 -type f -ls 2>/dev/null | sort -k11

# Todos los SGID
echo "=== SGID ==="
find / -perm -2000 -type f -ls 2>/dev/null | sort -k11

# SUID + SGID juntos
find / -perm -6000 -type f -ls 2>/dev/null

# Solo en /usr y /bin (más relevante)
find /usr /bin /sbin -perm -4000 -type f -exec ls -l {} \\;
```

---

## Archivos world-writable

```bash
# Archivos que cualquiera puede escribir (riesgo de seguridad)
find / -perm -002 -type f 2>/dev/null | grep -v proc | grep -v sys

# Directorios world-writable (legítimos: /tmp, /var/tmp)
find / -perm -002 -type d 2>/dev/null | grep -v proc | grep -v sys

# World-writable Y propiedad de root (muy sospechoso)
find / -perm -002 -user root -type f 2>/dev/null | grep -v proc
```

---

## Archivos sin propietario

```bash
# Archivos cuyo UID ya no existe
find / -nouser -ls 2>/dev/null | head -20

# Archivos cuyo GID ya no existe
find / -nogroup -ls 2>/dev/null | head -20

# Limpiar o reasignar
find / -nouser -exec chown root:root {} \; 2>/dev/null
```

---

## Archivos modificados recientemente

```bash
# Modificados en las últimas 24 horas
find / -newer /tmp/marker -type f 2>/dev/null
# Primero: touch -t 202401150000 /tmp/marker   (marca de tiempo de ayer)

# Modificados en los últimos 7 días
find / -mtime -7 -type f 2>/dev/null | grep -v proc

# Archivos en /etc modificados hoy
find /etc -maxdepth 2 -mtime -1 -type f -ls
```

---

## Script de auditoría completo

```bash
#!/usr/bin/env bash
REPORT="/tmp/security_audit_$(date +%Y%m%d_%H%M%S).txt"

{
    echo "AUDITORÍA DE SEGURIDAD: $(hostname)"
    echo "Fecha: $(date)"
    echo "======================================"

    echo ""
    echo "## ARCHIVOS SUID"
    find / -perm -4000 -type f -ls 2>/dev/null | awk '{print $3, $5, $11}'

    echo ""
    echo "## ARCHIVOS SGID"
    find / -perm -2000 -type f -ls 2>/dev/null | awk '{print $3, $5, $11}'

    echo ""
    echo "## WORLD-WRITABLE (excl. /tmp /proc /sys)"
    find / -perm -002 -type f 2>/dev/null | grep -vE "^/(proc|sys|tmp|dev)"

    echo ""
    echo "## SIN PROPIETARIO"
    find / -nouser -o -nogroup 2>/dev/null | head -20

} > "$REPORT"

echo "Auditoría completada: $REPORT"
wc -l "$REPORT"
```

---

## Práctica

1. Ejecuta la auditoría SUID en tu sistema y cuenta cuántos binarios aparecen
2. Busca archivos world-writable fuera de /tmp y /proc
3. ¿Hay archivos sin propietario en tu sistema?
4. Usa `find /etc -mtime -7 -ls` para ver qué archivos de configuración han cambiado esta semana
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Script de auditoría de permisos",
                "description": "Crea auditoria_permisos.sh que genere un informe con: número de archivos SUID, archivos world-writable en /tmp, y archivos sin propietario. Guárdalo en /tmp/auditoria.txt.",
                "hint": "Usa find / -perm -4000 -type f 2>/dev/null | wc -l para contar SUID",
                "validation_command": "bash auditoria_permisos.sh 2>/dev/null && grep -c '##' /tmp/auditoria.txt",
                "expected_output_contains": "3"
            }
        ]
    },
    {
        "title": "Permisos en Práctica: Configurar un Servidor Web Seguro",
        "description": "Proyecto integrador de M2: configura los permisos correctos para un servidor web Apache/Nginx simulado, incluyendo directorios de contenido, logs, uploads y configuración.",
        "difficulty": "intermediate",
        "duration_minutes": 50,
        "xp_reward": 180,
        "learning_objectives": [
            "Aplicar permisos correctos para un servidor web",
            "Separar permisos de configuración, contenido y uploads",
            "Usar SGID para directorios de trabajo en equipo",
            "Verificar la seguridad del árbol de directorios"
        ],
        "commands": ["chmod", "chown", "chgrp", "find", "stat", "umask"],
        "guide_markdown": """# Proyecto M2: Permisos para un Servidor Web Seguro

## Estructura objetivo

```
/opt/webserver/
├── conf/          # config (solo root puede escribir)
├── html/          # contenido web (www-data lee, devs escriben)
│   ├── index.html
│   └── assets/
├── logs/          # logs del servidor
├── uploads/       # archivos subidos por usuarios
└── scripts/       # scripts de mantenimiento
```

---

## Usuarios y grupos involucrados

| Entidad       | Rol                                    |
|---------------|----------------------------------------|
| `root`        | Propietario del sistema                |
| `www-data`    | Proceso del servidor web (lee archivos)|
| `desarrolladores` | Equipo que sube contenido          |
| `admin`       | Administrador del servidor             |

---

## Configuración paso a paso

```bash
#!/usr/bin/env bash
# setup_webserver.sh — Configurar permisos del servidor web
set -euo pipefail

WEBROOT="/opt/webserver"

echo "Creando estructura..."
sudo mkdir -p "$WEBROOT"/{conf,html/assets,logs,uploads,scripts}

echo "Configurando propietarios..."
# conf: solo root
sudo chown root:root "$WEBROOT/conf"
sudo chmod 700 "$WEBROOT/conf"

# html: root propietario, grupo www-data
sudo chown -R root:www-data "$WEBROOT/html"
sudo chmod 2755 "$WEBROOT/html"          # SGID: archivos nuevos → grupo www-data
sudo chmod -R 644 "$WEBROOT/html"/*.html 2>/dev/null || true
sudo chmod -R 755 "$WEBROOT/html/assets"

# logs: www-data puede escribir, admin puede leer
sudo chown -R www-data:adm "$WEBROOT/logs"
sudo chmod 750 "$WEBROOT/logs"

# uploads: www-data puede escribir, sin x para otros
sudo chown -R www-data:www-data "$WEBROOT/uploads"
sudo chmod 1770 "$WEBROOT/uploads"       # Sticky: cada uno borra solo los suyos

# scripts: root ejecuta, admin puede ver
sudo chown -R root:adm "$WEBROOT/scripts"
sudo chmod 750 "$WEBROOT/scripts"
sudo chmod 4750 "$WEBROOT/scripts/restart.sh"  # SUID para reiniciar servicio

echo "=== Verificación de permisos ==="
ls -laR "$WEBROOT" | head -40
```

---

## Verificación de seguridad

```bash
# Verificar que los permisos son correctos
check_perms() {
    local path="$1"
    local expected="$2"
    local actual
    actual=$(stat -c "%a" "$path")
    if [[ "$actual" == "$expected" ]]; then
        echo "✓ $path: $actual"
    else
        echo "✗ $path: esperado $expected, encontrado $actual"
    fi
}

check_perms "$WEBROOT/conf"          "700"
check_perms "$WEBROOT/html"          "2755"
check_perms "$WEBROOT/logs"          "750"
check_perms "$WEBROOT/uploads"       "1770"
check_perms "$WEBROOT/scripts"       "750"

# Verificar que no hay world-writable (excepto uploads con sticky)
echo ""
echo "=== Archivos world-writable (debería ser vacío o solo uploads) ==="
find "$WEBROOT" -perm -002 -not -path "*/uploads*" -ls 2>/dev/null
```

---

## Escenario de trabajo en equipo

```bash
# Desarrollador A sube un archivo
su - alice -c "echo '<h1>Hola</h1>' > $WEBROOT/html/nuevo.html"
ls -l "$WEBROOT/html/nuevo.html"
# -rw-r--r-- 1 alice www-data 12 Jan 15 /opt/webserver/html/nuevo.html
# El SGID hace que el grupo sea www-data automáticamente
# www-data (el servidor web) puede leer el archivo
```

---

## Tarea final

1. Implementa el script `setup_webserver.sh` completo
2. Crea archivos de ejemplo en cada directorio
3. Verifica con el script de comprobación que todos los permisos son correctos
4. Escribe un script `check_security.sh` que busque misconfiguraciones:
   - Archivos en html/ con w para others
   - Archivos en conf/ accesibles por others
   - Logs con permisos incorrectos
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Estructura webserver con permisos correctos",
                "description": "Implementa setup_webserver.sh que cree la estructura completa con los permisos definidos. La verificación final debe mostrar todos los ✓.",
                "hint": "Asegúrate de que el directorio html tiene SGID (2755) y uploads tiene sticky bit (1770)",
                "validation_command": "bash setup_webserver.sh 2>&1 | grep -c '✓'",
                "expected_output_contains": "5"
            }
        ]
    },
]

# ─── MAIN ───────────────────────────────────────────────────────────────────

def seed():
    db = SessionLocal()
    try:
        path = get_or_create_path(db)
        print(f"[PATH] {path.title} (id={path.id})")

        max_order = db.query(func.max(Module.order_index)).filter(
            Module.skill_path_id == path.id
        ).scalar() or 0

        # M1
        m1 = upsert_module(db, path.id,
            "M1 — Gestión de Usuarios y Grupos",
            "Domina el ciclo de vida de usuarios y grupos en Linux: creación, modificación, políticas de seguridad, límites de recursos y auditoría de cuentas.",
            max_order + 1)
        print(f"\n[M1] Insertando {len(M1_LABS)} labs...")
        insert_labs(db, m1, M1_LABS)

        # M2
        m2 = upsert_module(db, path.id,
            "M2 — Permisos Básicos: chmod, chown y umask",
            "Comprende y aplica el sistema de permisos de Linux: la tríada rwx, notación octal y simbólica, bits especiales SUID/SGID/Sticky y auditoría del sistema de archivos.",
            max_order + 2)
        print(f"\n[M2] Insertando {len(M2_LABS)} labs...")
        insert_labs(db, m2, M2_LABS)

        print(f"\n✅ seed_usuarios_part1.py completado")
        print(f"   M1: {len(M1_LABS)} labs | M2: {len(M2_LABS)} labs")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
