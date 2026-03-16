"""
seed_usuarios_part2.py
Usuarios y Permisos Linux — Parte 2 (final)
M3: Permisos Avanzados: ACLs y atributos extendidos (7 labs)
M4: sudo y Seguridad de Cuentas (8 labs)
Run: cd backend && source venv/bin/activate && python3 scripts/seed_usuarios_part2.py
"""

import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, SkillPath, Module, Lab
from sqlalchemy import func

# ─── helpers ────────────────────────────────────────────────────────────────

def get_path(db):
    path = db.query(SkillPath).filter(SkillPath.title == "Usuarios y Permisos Linux").first()
    if not path:
        print("ERROR: SkillPath 'Usuarios y Permisos Linux' no encontrado. Ejecuta seed_usuarios_part1.py primero.")
        sys.exit(1)
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
        print(f"[CREATED] Modulo: {title}")
    else:
        print(f"[EXISTS] Modulo: {title}")
    return m

# ─── M3: ACLs y Atributos Extendidos ────────────────────────────────────────

M3_LABS = [
    {
        "title": "Introducción a las ACLs de Linux",
        "description": "Aprende qué son las Access Control Lists (ACLs), cuándo son necesarias frente a los permisos clásicos, y cómo verificar si tu sistema de archivos las soporta.",
        "difficulty": "intermediate",
        "duration_minutes": 30,
        "xp_reward": 110,
        "learning_objectives": [
            "Entender las limitaciones de los permisos clásicos",
            "Comprender qué son las ACLs y cuándo usarlas",
            "Verificar soporte de ACLs en sistemas de archivos",
            "Leer ACLs con getfacl"
        ],
        "commands": ["getfacl", "setfacl", "mount", "tune2fs", "acl"],
        "guide_markdown": """# Introduccion a las ACLs de Linux

## El problema de los permisos clasicos

Con el modelo rwx tradicional, solo puedes controlar 3 entidades:
- Propietario del archivo
- Un grupo
- Todos los demas

**Problema tipico:** Tienes un directorio de proyecto donde:
- Alice debe tener acceso completo (rwx)
- Bob solo debe poder leer (r-x)
- Charlie NO debe tener ningun acceso
- El proceso web (www-data) solo necesita leer

Con permisos clasicos: IMPOSIBLE resolver esto sin ACLs.

---

## Que son las ACLs

Las ACLs (Access Control Lists) extienden el modelo de permisos:

```bash
# Permisos clasicos de un archivo:
-rw-r--r--  1 alice developers 100 Jan 15  archivo.txt
# Solo controlas: alice, developers, todos

# Con ACL (getfacl):
# file: archivo.txt
# owner: alice
# group: developers
user::rw-          # propietario alice
user:bob:r--        # BOB especificamente: solo lectura
user:charlie:---    # CHARLIE: sin acceso
group::r--          # grupo developers: lectura
group:admins:rw-    # grupo admins: lectura+escritura
mask::rw-           # mascara efectiva
other::---          # todos los demas: sin acceso
```

---

## Verificar soporte de ACLs

Las ACLs requieren soporte del sistema de archivos (ext2/3/4, XFS, Btrfs, etc.):

```bash
# Ver si el sistema de archivos tiene acl activado
mount | grep "acl"
# /dev/sda1 on / type ext4 (rw,relatime,acl)

# En sistemas modernos, acl suele estar activo por defecto
# Para verificar en ext4:
sudo tune2fs -l /dev/sda1 | grep "Default mount"

# Ver opciones de mount de una particion
findmnt / -o OPTIONS

# Si no tiene ACL, montarlo con soporte:
sudo mount -o remount,acl /
# O en /etc/fstab: agregar "acl" a las opciones de mount
```

---

## getfacl: leer ACLs actuales

```bash
# ACL de un archivo (sin ACL explicitica, muestra los permisos clasicos)
getfacl /etc/hosts
# file: etc/hosts
# owner: root
# group: root
# user::rw-
# group::r--
# other::r--

# ACL de un directorio
getfacl /home/alice/

# Ver solo en formato compacto
getfacl -c archivo.txt    # sin cabecera
getfacl -n archivo.txt    # mostrar UID/GID en vez de nombres

# Recursivo
getfacl -R /opt/proyecto/ | head -40
```

---

## Indicador de ACL en ls -l

Cuando un archivo tiene ACL, ls -l muestra un `+` al final de los permisos:

```bash
ls -l archivo_con_acl.txt
# -rw-rw-r--+ 1 alice alice 100 Jan 15 archivo.txt
#           ^+ indica ACL presente
```

---

## Practica

1. Verifica que tu sistema de archivos soporta ACLs con `mount | grep acl`
2. Crea un archivo de prueba y lee su ACL con `getfacl`
3. Observa que ls -l NO muestra el + todavia (aun no has configurado ninguna ACL)
4. Lee las ACLs de /tmp y /home con getfacl
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Verificar soporte ACL y leer ACLs",
                "description": "Verifica que tu sistema soporta ACLs, crea un archivo de prueba y muestra su ACL inicial con getfacl.",
                "hint": "touch /tmp/acl_test.txt && getfacl /tmp/acl_test.txt",
                "validation_command": "getfacl /tmp/acl_test.txt 2>&1 | grep 'user::'",
                "expected_output_contains": "user::"
            }
        ]
    },
    {
        "title": "setfacl: Configurar ACLs para Usuarios y Grupos",
        "description": "Usa setfacl para añadir, modificar y eliminar entradas ACL de usuarios y grupos específicos. Resuelve casos de control de acceso complejos imposibles con permisos clásicos.",
        "difficulty": "intermediate",
        "duration_minutes": 40,
        "xp_reward": 130,
        "learning_objectives": [
            "Añadir ACL para usuarios específicos con setfacl -m",
            "Añadir ACL para grupos con setfacl -m g:",
            "Eliminar entradas ACL con setfacl -x",
            "Limpiar todas las ACLs con setfacl -b"
        ],
        "commands": ["setfacl -m", "setfacl -x", "setfacl -b", "setfacl -R", "getfacl"],
        "guide_markdown": """# setfacl: Configurar ACLs para Usuarios y Grupos

## Sintaxis de setfacl

```bash
setfacl [opciones] spec archivo

# Specs para usuarios:
user:nombre:permisos    u:nombre:permisos
user::permisos          # propietario del archivo

# Specs para grupos:
group:nombre:permisos   g:nombre:permisos
group::permisos         # grupo propietario

# Specs especiales:
mask::permisos          # mascara efectiva
other::permisos         # todos los demas
```

---

## Operaciones basicas

```bash
# Dar rwx a bob en un archivo
setfacl -m u:bob:rwx archivo.txt

# Dar solo lectura a charlie
setfacl -m u:charlie:r-- archivo.txt

# Dar lectura al grupo "auditores"
setfacl -m g:auditores:r-- archivo.txt

# Multiples entradas en un comando
setfacl -m u:bob:rw,u:charlie:r,g:devs:rw archivo.txt

# Ver el resultado
getfacl archivo.txt
```

---

## ACLs en directorios y recursivo

```bash
# Dar acceso a un directorio (solo el directorio, no el contenido)
setfacl -m u:bob:rwx /opt/proyecto/

# Recursivo: aplicar a directorio y TODO su contenido existente
setfacl -R -m u:bob:rw /opt/proyecto/

# ¡OJO! -R NO afecta a archivos creados DESPUES
# Para eso necesitas ACLs por defecto (default ACLs)
```

---

## Default ACLs: los nuevos archivos heredan permisos

```bash
# Configurar ACL por defecto en un directorio
# Los archivos creados DENTRO heredaran esta ACL
setfacl -d -m u:bob:rw /opt/proyecto/
setfacl -d -m g:devs:rwx /opt/proyecto/
setfacl -d -m o::--- /opt/proyecto/

# Ver las default ACLs
getfacl /opt/proyecto/
# default:user::rwx
# default:user:bob:rw-
# default:group::r-x
# default:group:devs:rwx
# default:mask::rwx
# default:other::---

# Probar que se heredan
touch /opt/proyecto/nuevo_archivo.txt
getfacl /opt/proyecto/nuevo_archivo.txt
# Aparecera la ACL heredada
```

---

## Eliminar entradas ACL

```bash
# Eliminar ACL de un usuario especifico
setfacl -x u:bob archivo.txt

# Eliminar ACL de un grupo
setfacl -x g:auditores archivo.txt

# Eliminar TODAS las ACLs (volver a permisos clasicos)
setfacl -b archivo.txt

# Eliminar solo las default ACLs de un directorio
setfacl -k /opt/proyecto/

# Recursivo: eliminar ACLs de todo el arbol
setfacl -R -b /opt/proyecto/
```

---

## La mascara ACL

La mascara limita el maximo de permisos efectivos para usuarios y grupos (excepto el propietario):

```bash
# Si la mascara es r--, un usuario con rwx en la ACL solo tendra r-- efectivo
setfacl -m m:r-- archivo.txt

# Ver permisos efectivos
getfacl archivo.txt
# user:bob:rwx        #effective:r--
# group::rw-          #effective:r--
# mask::r--

# Recalcular mascara automaticamente (a la union de todos los permisos ACL)
setfacl --mask archivo.txt
```

---

## Caso practico completo

```bash
# Escenario: /opt/proyecto compartido entre Alice (dev), Bob (auditor), www-data (web)
sudo mkdir -p /opt/proyecto
sudo chown alice:developers /opt/proyecto

# Alice: propietaria, acceso total
setfacl -m u:alice:rwx /opt/proyecto/
setfacl -d -m u:alice:rwx /opt/proyecto/

# Bob: solo puede leer y navegar (auditor)
setfacl -m u:bob:r-x /opt/proyecto/
setfacl -d -m u:bob:r-x /opt/proyecto/

# www-data: puede leer (para servir archivos)
setfacl -m u:www-data:r-x /opt/proyecto/
setfacl -d -m u:www-data:r-x /opt/proyecto/

# Charlie: sin acceso
setfacl -m u:charlie:--- /opt/proyecto/

# Verificar
getfacl /opt/proyecto/
```

---

## Practica

1. Crea `/tmp/acl_proyecto` y configura ACLs: tu usuario (rwx), root (r-x), otros (---)
2. Añade default ACLs para que los nuevos archivos hereden esos permisos
3. Crea un archivo dentro y verifica que heredó las ACLs
4. Elimina la ACL de root y verifica el cambio
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Configurar ACLs de acceso diferenciado",
                "description": "Crea /tmp/acl_test/ y configura: tu usuario tiene rwx, el usuario 'nobody' tiene solo r-x. Crea un archivo dentro y verifica con getfacl que tiene las ACLs correctas.",
                "hint": "mkdir /tmp/acl_test && setfacl -m u:$USER:rwx /tmp/acl_test && setfacl -m u:nobody:r-x /tmp/acl_test",
                "validation_command": "getfacl /tmp/acl_test 2>&1 | grep 'nobody'",
                "expected_output_contains": "nobody"
            }
        ]
    },
    {
        "title": "ACLs en Escenarios Reales de Empresa",
        "description": "Aplica ACLs en escenarios empresariales reales: proyectos con múltiples equipos, servidores web con CMS, directorios de auditoría y flujos de trabajo colaborativos.",
        "difficulty": "intermediate",
        "duration_minutes": 45,
        "xp_reward": 140,
        "learning_objectives": [
            "Diseñar un esquema de ACLs para proyectos en equipo",
            "Configurar ACLs para servidor web con CMS",
            "Implementar directorios de solo entrega (drop box)",
            "Auditar y verificar el esquema de ACLs"
        ],
        "commands": ["setfacl", "getfacl", "setfacl -d", "setfacl -R", "find", "acl"],
        "guide_markdown": """# ACLs en Escenarios Reales de Empresa

## Escenario 1: Departamentos con acceso cruzado

**Situacion:** /opt/empresa con departamentos:
- Equipo A: lectura/escritura en su directorio
- Equipo B: solo lectura del directorio de A (para reportes)
- Direccion: lectura de todo
- Auditoria: lectura de todo, no puede modificar nada

```bash
#!/usr/bin/env bash
setup_empresa_acls() {
    BASE="/opt/empresa"
    sudo mkdir -p "$BASE"/{equipo_a,equipo_b,comun}

    # Crear grupos necesarios
    for g in equipo_a equipo_b direccion auditoria; do
        sudo groupadd "$g" 2>/dev/null || true
    done

    # equipo_a: rwx en su carpeta, r-x en comun
    setfacl -m g:equipo_a:rwx "$BASE/equipo_a"
    setfacl -m g:equipo_a:r-x "$BASE/comun"
    setfacl -d -m g:equipo_a:rw- "$BASE/equipo_a"

    # equipo_b puede leer carpeta de equipo_a
    setfacl -m g:equipo_b:r-x "$BASE/equipo_a"

    # Direccion: lee todo
    for dir in equipo_a equipo_b comun; do
        setfacl -m g:direccion:r-x "$BASE/$dir"
    done

    # Auditoria: mismos que direccion
    for dir in equipo_a equipo_b comun; do
        setfacl -m g:auditoria:r-x "$BASE/$dir"
    done

    echo "ACLs configuradas. Verificando..."
    for dir in equipo_a equipo_b comun; do
        echo "--- $dir ---"
        getfacl -c "$BASE/$dir"
    done
}

setup_empresa_acls
```

---

## Escenario 2: Drop box (directorio de entrega)

Solo se puede depositar, no ver lo que otros depositaron:

```bash
setup_dropbox() {
    local dir="/opt/entregas"
    sudo mkdir -p "$dir"

    # Propietario (profesor/admin): acceso total
    sudo chown admin:admin "$dir"
    sudo chmod 700 "$dir"

    # Alumnos: pueden crear pero NO listar ni leer otros archivos
    # Para esto: permiso --x en el directorio
    setfacl -m g:alumnos:--x "$dir"
    setfacl -d -m g:alumnos:rw- "$dir"   # pueden leer SUS archivos nuevos

    # Verificar: alumno puede crear pero no listar
    echo "Drop box configurado: $dir"
    getfacl "$dir"
}
```

---

## Escenario 3: Servidor web con CMS

```bash
# WordPress en /var/www/html/
# www-data: necesita leer (y a veces escribir en uploads/)
# desarrolladores: pueden editar PHP/CSS
# root: propietario

setup_wordpress_acls() {
    WEBROOT="/var/www/html"

    # www-data: leer todo, escribir solo en uploads y cache
    setfacl -R -m u:www-data:r-x "$WEBROOT"
    setfacl -R -m u:www-data:rwx "$WEBROOT/wp-content/uploads"
    setfacl -R -m u:www-data:rwx "$WEBROOT/wp-content/cache"

    # Desarrolladores: rwx en todo
    setfacl -R -m g:developers:rwx "$WEBROOT"
    setfacl -d -m g:developers:rwx "$WEBROOT"

    # Seguridad: wp-config.php solo accesible por root y www-data
    setfacl -m u:www-data:r-- "$WEBROOT/wp-config.php"
    setfacl -m o::--- "$WEBROOT/wp-config.php"

    echo "WordPress ACLs configuradas"
}
```

---

## Backup y restauracion de ACLs

```bash
# Exportar ACLs a un archivo (util antes de reinstalaciones)
getfacl -R /opt/empresa > /backup/acls_empresa_$(date +%Y%m%d).acl

# Restaurar ACLs desde backup
setfacl --restore /backup/acls_empresa_20240115.acl

# Copiar ACL de un archivo a otro
getfacl archivo_origen | setfacl --set-file=- archivo_destino
```

---

## Script de auditoria de ACLs

```bash
#!/usr/bin/env bash
audit_acls() {
    local dir="${1:-.}"
    echo "=== AUDITORIA DE ACLs: $dir ==="
    echo ""

    echo "Archivos CON ACL:"
    find "$dir" -type f -ls 2>/dev/null | grep -E ' [rwx-]{9}\+' || echo "  Ninguno"

    echo ""
    echo "Directorios CON ACL:"
    find "$dir" -type d -ls 2>/dev/null | grep -E ' [rwx-]{9}\+' || echo "  Ninguno"

    echo ""
    echo "Detalle de todas las ACLs:"
    find "$dir" 2>/dev/null -exec bash -c '
        acl=$(getfacl -c "$1" 2>/dev/null | grep -v "^$")
        if echo "$acl" | grep -q "^user:[^:]*:" 2>/dev/null; then
            echo "=== $1 ==="; echo "$acl"; echo ""
        fi
    ' _ {} \;
}

audit_acls /opt/empresa 2>/dev/null
```

---

## Practica

1. Implementa el escenario del dropbox completo con los 3 grupos
2. Verifica que un usuario del grupo `alumnos` puede crear pero no listar
3. Exporta las ACLs del directorio con `getfacl -R`
4. Elimina todas las ACLs con `setfacl -R -b` y verifica
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Dropbox con ACLs",
                "description": "Crea /tmp/dropbox/ con permisos SUID y ACL para que el grupo 'adm' tenga --x (puede depositar pero no listar). Verifica con getfacl.",
                "hint": "sudo mkdir /tmp/dropbox && setfacl -m g:adm:--x /tmp/dropbox && getfacl /tmp/dropbox | grep adm",
                "validation_command": "getfacl /tmp/dropbox 2>&1 | grep 'adm'",
                "expected_output_contains": "adm"
            }
        ]
    },
    {
        "title": "Atributos Extendidos: chattr e lsattr",
        "description": "Controla el comportamiento de archivos con atributos extendidos de ext4: inmutabilidad, solo-append para logs, sincronización directa y protección contra borrado accidental.",
        "difficulty": "intermediate",
        "duration_minutes": 35,
        "xp_reward": 120,
        "learning_objectives": [
            "Usar chattr para configurar atributos de archivos",
            "Proteger archivos críticos con el atributo inmutable",
            "Usar append-only para archivos de log",
            "Listar atributos con lsattr"
        ],
        "commands": ["chattr", "lsattr", "chattr +i", "chattr +a", "chattr -i"],
        "guide_markdown": """# Atributos Extendidos: chattr e lsattr

## ¿Que son los atributos extendidos?

Son caracteristicas adicionales del sistema de archivos (principalmente ext2/3/4) que van mas alla de los permisos rwx. Solo root puede establecer la mayoria.

---

## Atributos mas importantes

| Atributo | Flag | Descripcion |
|----------|------|-------------|
| Inmutable | `i` | Nadie puede modificar, renombrar ni borrar el archivo, NI SIQUIERA ROOT |
| Append-only | `a` | Solo se puede anadir al final (escritura), no modificar ni borrar |
| No-atime | `A` | No actualiza el tiempo de acceso (mejora rendimiento) |
| Comprimido | `c` | El kernel comprime/descomprime transparentemente |
| Sincronizado | `s` | Cambios se escriben sincrono al disco |
| Sin borrado seguro | `u` | Al borrar, el contenido se guarda para recuperacion |

---

## lsattr: ver atributos

```bash
# Ver atributos de archivos en directorio actual
lsattr

# De un archivo especifico
lsattr /etc/passwd
# ----i--------e-- /etc/passwd
# (en algunos sistemas no tiene i)

# Recursivo
lsattr -R /etc/ 2>/dev/null | head -20

# Solo directorios
lsattr -d /etc
```

---

## chattr +i: atributo inmutable

```bash
# Proteger un archivo critico
sudo chattr +i /etc/hosts
sudo chattr +i /etc/resolv.conf

# Ahora NI ROOT puede modificarlo:
sudo echo "nuevo" >> /etc/hosts
# chattr: Operation not permitted

sudo rm /etc/hosts
# rm: cannot remove '/etc/hosts': Operation not permitted

# Verificar
lsattr /etc/hosts
# ----i--------e-- /etc/hosts

# Para modificarlo, primero quitar el atributo:
sudo chattr -i /etc/hosts
# Ahora ya se puede editar
sudo chattr +i /etc/hosts  # volver a proteger
```

---

## chattr +a: append-only (ideal para logs)

```bash
# Un archivo append-only solo acepta añadir al final
# No se puede truncar, editar en medio, ni borrar
sudo chattr +a /var/log/mi_app.log

# Esto funciona:
echo "nueva linea de log" >> /var/log/mi_app.log

# Esto NO funciona (aunque seas root):
echo "contenido" > /var/log/mi_app.log   # falla: no puede truncar
rm /var/log/mi_app.log                    # falla: no puede borrar
sed -i 's/error/ERROR/' /var/log/mi_app.log  # falla: no puede modificar

# Util para: logs de auditoria que nadie puede falsificar
```

---

## Caso de uso: proteccion de configuracion critica

```bash
#!/usr/bin/env bash
# Proteger archivos de configuracion criticos

PROTECTED_FILES=(
    "/etc/sudoers"
    "/etc/hosts.allow"
    "/etc/hosts.deny"
    "/etc/cron.allow"
)

protect_critical_files() {
    for file in "${PROTECTED_FILES[@]}"; do
        [[ -f "$file" ]] || continue
        sudo chattr +i "$file"
        echo "Protegido: $file"
    done
}

unprotect_for_edit() {
    local file="$1"
    sudo chattr -i "$file"
    echo "Desprotegido temporalmente: $file"
    echo "RECUERDA: vuelve a ejecutar chattr +i $file despues de editar"
}

case "${1:-}" in
    protect)   protect_critical_files ;;
    unprotect) unprotect_for_edit "${2:?'Especifica el archivo'}" ;;
    list)      lsattr /etc/ 2>/dev/null | grep -v "^--------------e" ;;
    *)         echo "Uso: $0 {protect|unprotect FILE|list}" ;;
esac
```

---

## Practica

1. Crea un archivo de log con `chattr +a`. Prueba que puedes añadir pero no truncar ni borrar
2. Aplica `chattr +i` a un archivo de prueba y demuestra que ni root puede borrarlo
3. Usa `lsattr -R /etc/ 2>/dev/null | grep -v ^----` para ver qué archivos tienen atributos especiales en /etc
4. Quita el atributo inmutable y elimina el archivo de prueba
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Proteger archivo con chattr",
                "description": "Crea /tmp/config_test.txt, aplica chattr +i, intenta modificarlo (debe fallar), luego quita el atributo y elimínalo.",
                "hint": "sudo chattr +i /tmp/config_test.txt && echo 'test' >> /tmp/config_test.txt 2>&1; sudo chattr -i /tmp/config_test.txt && rm /tmp/config_test.txt",
                "validation_command": "touch /tmp/attr_test && sudo chattr +i /tmp/attr_test && lsattr /tmp/attr_test | grep -c 'i'",
                "expected_output_contains": "1"
            }
        ]
    },
    {
        "title": "Capacidades de Linux: Alternativa a SUID",
        "description": "Las capabilities de Linux permiten dar a procesos privilegios específicos de root sin hacerlos SUID completos. Más seguro y granular que el modelo SUID tradicional.",
        "difficulty": "advanced",
        "duration_minutes": 45,
        "xp_reward": 150,
        "learning_objectives": [
            "Entender el modelo de capacidades de Linux",
            "Ver capacidades con getcap",
            "Asignar capacidades con setcap",
            "Diferencia entre SUID y capabilities"
        ],
        "commands": ["getcap", "setcap", "capsh", "getpcaps"],
        "guide_markdown": """# Capacidades de Linux: Alternativa a SUID

## El problema de SUID

SUID en un binario da TODOS los privilegios de root cuando se ejecuta. Es como dar las llaves de toda la casa para abrir una habitacion.

Las **capabilities** (capacidades) permiten dar SOLO los privilegios necesarios.

---

## Principales capacidades

| Capability | Descripcion |
|------------|-------------|
| `CAP_NET_BIND_SERVICE` | Escuchar en puertos < 1024 (sin ser root) |
| `CAP_NET_RAW` | Usar raw sockets (ping) |
| `CAP_NET_ADMIN` | Configurar interfaces de red |
| `CAP_SYS_ADMIN` | Multiples funciones de administracion del sistema |
| `CAP_CHOWN` | Cambiar propietario de archivos |
| `CAP_DAC_OVERRIDE` | Ignorar permisos de archivos |
| `CAP_SETUID` | Cambiar UID del proceso |
| `CAP_KILL` | Enviar senales a cualquier proceso |
| `CAP_SYS_TIME` | Cambiar la hora del sistema |

---

## getcap: ver capacidades de binarios

```bash
# Ver capacidades de binarios especificos
getcap /usr/bin/ping
# /usr/bin/ping cap_net_raw=ep

# Ver capacidades de todos los binarios del sistema
find /usr/bin /usr/sbin /bin /sbin -type f -exec getcap {} \; 2>/dev/null

# Ver capacidades del proceso actual
getpcaps $$

# Ver capacidades de un proceso por PID
getpcaps 1234
```

---

## setcap: asignar capacidades

```bash
# Dar a un binario Python la capacidad de escuchar en puertos < 1024
# (sin necesidad de sudo o SUID)
sudo setcap 'cap_net_bind_service=+ep' /usr/bin/python3.10

# Tipos de conjunto de capacidades:
# e = effective (activa para el proceso)
# p = permitted (puede activarse)
# i = inheritable (puede heredarse)

# Ejemplo: servidor en puerto 80 sin root
python3 -c "
import socket
s = socket.socket()
s.bind(('', 80))   # sin setcap esto fallaria
print('Escuchando en :80')
"

# Quitar todas las capacidades
sudo setcap -r /usr/bin/python3.10

# Ejemplo real: dar a node.js acceso a puertos privilegiados
sudo setcap 'cap_net_bind_service=+ep' $(which node)
```

---

## Tipos de flags

```bash
# +ep: anadir a Effective y Permitted
sudo setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx

# =ep: establecer exactamente (reemplaza lo existente)
sudo setcap 'cap_net_raw=ep cap_net_admin=ep' /usr/sbin/tcpdump

# Formato: capacidad=flags
# donde flags: e (effective), p (permitted), i (inheritable)
```

---

## Comparativa SUID vs Capabilities

| | SUID | Capabilities |
|--|------|-------------|
| **Granularidad** | Todo o nada (root completo) | Solo privilegios especificos |
| **Seguridad** | Si se explota: root total | Si se explota: solo el privilegio dado |
| **Visibilidad** | ls -l muestra 's' | getcap necesario para verlas |
| **Herencia** | No (por defecto) | Configurable con 'i' flag |
| **Uso recomendado** | Casos heredados | Aplicaciones modernas |

---

## Practica

1. Ejecuta `find /usr/bin /usr/sbin -exec getcap {} \; 2>/dev/null` y lista todos los binarios con capabilities
2. Compara los binarios que tienen SUID vs los que usan capabilities en tu sistema
3. Crea un script Python que intente escuchar en el puerto 8080. Dale `cap_net_bind_service` y verifica que funciona
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Ver capabilities del sistema",
                "description": "Lista todos los binarios con capabilities en /usr/bin y /bin. Muestra cuántos tienen 'cap_net_raw' (como ping).",
                "hint": "find /usr/bin /bin -type f -exec getcap {} \\; 2>/dev/null | grep cap_net_raw | wc -l",
                "validation_command": "find /usr/bin /bin -type f -exec getcap {} \\; 2>/dev/null | wc -l",
                "expected_output_contains": "1"
            }
        ]
    },
    {
        "title": "Namespaces y Contenedores: Usuarios Aislados",
        "description": "Entiende cómo los user namespaces de Linux permiten que los contenedores (Docker, Podman) tengan su propio espacio de UIDs. Conceptos fundamentales para entender la seguridad de contenedores.",
        "difficulty": "advanced",
        "duration_minutes": 40,
        "xp_reward": 145,
        "learning_objectives": [
            "Entender los user namespaces de Linux",
            "Ver namespaces activos con lsns",
            "Relacion entre contenedores y permisos del host",
            "Conceptos de rootless containers"
        ],
        "commands": ["lsns", "unshare", "nsenter", "/proc/self/status", "id"],
        "guide_markdown": """# Namespaces y Contenedores: Usuarios Aislados

## ¿Que son los namespaces?

Los namespaces aíslan recursos del sistema para grupos de procesos:

| Namespace | Flag | Aisla |
|-----------|------|-------|
| UTS | `CLONE_NEWUTS` | hostname y domainname |
| IPC | `CLONE_NEWIPC` | memoria compartida, semaforos |
| PID | `CLONE_NEWPID` | espacio de PIDs |
| Network | `CLONE_NEWNET` | interfaces de red, puertos |
| Mount | `CLONE_NEWNS` | puntos de montaje |
| User | `CLONE_NEWUSER` | UIDs y GIDs |
| Cgroup | `CLONE_NEWCGROUP` | raiz de cgroups |

---

## lsns: ver namespaces activos

```bash
# Ver todos los namespaces
lsns
# NS         TYPE   NPROCS   PID USER     COMMAND
# 4026531835 cgroup    100     1 root     /sbin/init
# 4026531836 ipc       100     1 root     /sbin/init
# 4026532008 user        2  5234 alice    bash

# Solo namespaces de usuario
lsns -t user

# Namespaces de un proceso
ls -la /proc/$$/ns/
```

---

## User namespaces: root dentro, usuario fuera

El concepto mas importante: un proceso puede ser root DENTRO de su namespace pero un usuario normal fuera.

```bash
# Crear un namespace de usuario donde seamos "root" sin ser root
unshare --user --map-root-user bash

# Dentro del namespace:
whoami           # root
id               # uid=0(root) gid=0(root)
cat /proc/self/uid_map
# 0 1000 1

# Esto significa: UID 0 dentro = UID 1000 fuera
# Solo tenemos "root" dentro del namespace, NO en el host

# Intentar algo que requiere root real:
mount /dev/sda1 /mnt  # fallara: no tiene capacidad real de mount
```

---

## Como lo usa Docker

```bash
# En el host:
docker run -it ubuntu bash

# Dentro del contenedor:
id    # uid=0(root) gid=0(root)

# En el host, el proceso del contenedor es:
ps aux | grep "bash"
# 1000     12345  0.0  ... bash
# UID 1000 en el host aunque sea "root" en el contenedor

# Ver el mapeo de UIDs del contenedor
cat /proc/12345/uid_map
# 0  1000  65536
# "root" (0) en contenedor = UID 1000+ en el host
```

---

## Rootless containers (Podman, Docker rootless)

```bash
# Podman como usuario normal (sin root):
podman run -it alpine sh

# El contenedor funciona pero Podman no necesita daemon root
# Los procesos del contenedor se mapean a UIDs del usuario actual

# Ver los sub-UIDs disponibles para tu usuario
cat /etc/subuid
# alice:100000:65536   → alice puede usar UIDs 100000-165535

cat /etc/subgid
# alice:100000:65536
```

---

## /proc/self/status: capacidades del proceso actual

```bash
# Ver capacidades del proceso actual
cat /proc/self/status | grep -i cap
# CapInh: 0000000000000000   # inheritable
# CapPrm: 0000000000000000   # permitted
# CapEff: 0000000000000000   # effective
# CapBnd: 000001ffffffffff   # bounding set
# CapAmb: 0000000000000000   # ambient

# Decodificar con capsh:
capsh --decode=000001ffffffffff
```

---

## Practica

1. Ejecuta `lsns` y observa los namespaces de tu sistema
2. Crea un namespace de usuario con `unshare --user --map-root-user bash`. Dentro, ejecuta `id` y observa que eres "root"
3. Intenta montar algo dentro del namespace (falla) y explica por que
4. Revisa `/etc/subuid` para ver los UIDs disponibles para contenedores rootless
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Explorar namespaces de usuario",
                "description": "Usa 'unshare --user --map-root-user whoami' para ver como el namespace de usuario cambia la identidad. Muestra el mapeo de UIDs desde /proc/self/uid_map.",
                "hint": "unshare --user --map-root-user bash -c 'id && cat /proc/self/uid_map'",
                "validation_command": "unshare --user --map-root-user whoami 2>&1",
                "expected_output_contains": "root"
            }
        ]
    },
    {
        "title": "Proyecto M3: Sistema de Control de Acceso con ACLs",
        "description": "Proyecto integrador del módulo 3: diseña e implementa un sistema completo de control de acceso usando ACLs para una empresa con múltiples departamentos y proyectos.",
        "difficulty": "advanced",
        "duration_minutes": 60,
        "xp_reward": 220,
        "learning_objectives": [
            "Diseñar un esquema de ACLs para una empresa",
            "Automatizar la configuracion de ACLs con scripts",
            "Verificar y auditar el esquema de permisos",
            "Documentar el sistema de control de acceso"
        ],
        "commands": ["setfacl", "getfacl", "chattr", "setcap", "find"],
        "guide_markdown": """# Proyecto M3: Sistema de Control de Acceso con ACLs

## Objetivo

Implementar el sistema de control de acceso para TechCorp S.L., una empresa de software con 3 departamentos y 2 proyectos activos.

---

## Estructura organizativa

```
TechCorp S.L.
├── Departamentos:
│   ├── dev (desarrolladores)
│   ├── qa (calidad)
│   └── ops (operaciones/sysadmin)
├── Proyectos:
│   ├── proyecto_alpha (dev + qa)
│   └── proyecto_beta  (dev + ops)
└── Compartido:
    ├── documentacion (todos leen, dev/ops escriben)
    └── logs (ops escribe, qa/dev leen)
```

---

## Script de configuracion

```bash
#!/usr/bin/env bash
# setup_techcorp.sh
set -euo pipefail

BASE="/opt/techcorp"

# ─── Crear grupos y usuarios de prueba ─────────────────
setup_groups() {
    for g in dev qa ops; do
        sudo groupadd "$g" 2>/dev/null || true
    done
    echo "Grupos creados: dev, qa, ops"
}

# ─── Crear estructura de directorios ────────────────────
setup_dirs() {
    sudo mkdir -p "$BASE"/{proyectos/{alpha,beta},compartido/{documentacion,logs}}
    sudo chown -R root:root "$BASE"
    sudo chmod 755 "$BASE"
    echo "Directorios creados bajo $BASE"
}

# ─── Configurar ACLs ────────────────────────────────────
setup_acls() {
    # proyecto_alpha: dev (rwx) + qa (r-x)
    setfacl -m g:dev:rwx "$BASE/proyectos/alpha"
    setfacl -m g:qa:r-x  "$BASE/proyectos/alpha"
    setfacl -d -m g:dev:rw- "$BASE/proyectos/alpha"
    setfacl -d -m g:qa:r--  "$BASE/proyectos/alpha"

    # proyecto_beta: dev (rwx) + ops (rwx)
    setfacl -m g:dev:rwx "$BASE/proyectos/beta"
    setfacl -m g:ops:rwx "$BASE/proyectos/beta"
    setfacl -d -m g:dev:rw- "$BASE/proyectos/beta"
    setfacl -d -m g:ops:rw- "$BASE/proyectos/beta"

    # documentacion: todos leen, dev+ops escriben
    setfacl -m g:dev:rwx "$BASE/compartido/documentacion"
    setfacl -m g:ops:rwx "$BASE/compartido/documentacion"
    setfacl -m g:qa:r-x  "$BASE/compartido/documentacion"
    setfacl -d -m g:dev:rw- "$BASE/compartido/documentacion"
    setfacl -d -m g:ops:rw- "$BASE/compartido/documentacion"
    setfacl -d -m g:qa:r--  "$BASE/compartido/documentacion"

    # logs: ops escribe, todos leen
    setfacl -m g:ops:rwx "$BASE/compartido/logs"
    setfacl -m g:dev:r-x "$BASE/compartido/logs"
    setfacl -m g:qa:r-x  "$BASE/compartido/logs"
    setfacl -d -m g:ops:rw- "$BASE/compartido/logs"
    setfacl -d -m g:dev:r--  "$BASE/compartido/logs"
    setfacl -d -m g:qa:r--   "$BASE/compartido/logs"

    echo "ACLs configuradas"
}

# ─── Verificacion ────────────────────────────────────────
verify_acls() {
    echo "=== VERIFICACION DEL SISTEMA ==="
    for dir in proyectos/alpha proyectos/beta compartido/documentacion compartido/logs; do
        echo ""
        echo "--- $dir ---"
        getfacl -c "$BASE/$dir" | grep -E "^(user|group|other|default)"
    done
}

# ─── Auditoria ───────────────────────────────────────────
audit() {
    local report="/tmp/techcorp_acl_audit_$(date +%Y%m%d).txt"
    {
        echo "AUDITORIA ACL TECHCORP: $(date)"
        echo "======================================="
        getfacl -R "$BASE"
    } > "$report"
    echo "Auditoria exportada: $report"
}

# ─── Main ────────────────────────────────────────────────
case "${1:-all}" in
    setup)  setup_groups; setup_dirs; setup_acls; verify_acls ;;
    verify) verify_acls ;;
    audit)  audit ;;
    clean)  sudo rm -rf "$BASE"; echo "Limpiado" ;;
    all)    setup_groups; setup_dirs; setup_acls; verify_acls; audit ;;
    *)      echo "Uso: $0 {setup|verify|audit|clean|all}" ;;
esac
```

---

## Tarea del proyecto

1. Implementa `setup_techcorp.sh` completo
2. Verifica que las ACLs son correctas con `getfacl -R`
3. Crea un script `test_access.sh` que simule accesos de los diferentes grupos y verifique que las ACLs funcionan
4. Exporta la auditoria completa en formato legible
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Sistema de ACLs empresarial funcional",
                "description": "Implementa setup_techcorp.sh. Debe crear la estructura, configurar ACLs para los 3 grupos en los 4 directorios y superar la verificacion.",
                "hint": "Ejecuta: bash setup_techcorp.sh all && bash setup_techcorp.sh verify",
                "validation_command": "bash setup_techcorp.sh verify 2>&1 | grep -c 'group:dev'",
                "expected_output_contains": "4"
            }
        ]
    },
]

# ─── M4: sudo y Seguridad de Cuentas ────────────────────────────────────────

M4_LABS = [
    {
        "title": "sudo: Delegación Segura de Privilegios",
        "description": "Aprende a usar sudo correctamente: la diferencia con su, cómo funciona internamente, las mejores prácticas y los errores más comunes de seguridad.",
        "difficulty": "intermediate",
        "duration_minutes": 35,
        "xp_reward": 120,
        "learning_objectives": [
            "Entender como funciona sudo internamente",
            "Diferencia entre sudo, su y su -",
            "Ver y gestionar acceso sudo",
            "Mejores practicas de uso de sudo"
        ],
        "commands": ["sudo", "sudo -i", "sudo -l", "su", "su -", "sudo -u"],
        "guide_markdown": """# sudo: Delegacion Segura de Privilegios

## ¿Por que sudo en vez de root?

| | Login como root | sudo |
|--|----------------|------|
| **Auditoria** | No hay registro de quien | Cada comando queda en /var/log/auth.log |
| **Granularidad** | Todo o nada | Puedes dar acceso a comandos especificos |
| **Seguridad** | Una contrasena comprometida = root total | La contrasena del usuario, no de root |
| **Accidente** | Facil borrar cosas sin querer | Cada comando requiere intension explicita |

---

## Sintaxis de sudo

```bash
# Ejecutar un comando como root
sudo comando

# Ejecutar como otro usuario
sudo -u alice comando
sudo -u www-data bash

# Ver que comandos puedes ejecutar con sudo
sudo -l

# Shell interactiva como root (EVITAR en produccion)
sudo bash
sudo -i      # shell de login de root (con entorno completo)

# Ejecutar multiples comandos
sudo bash -c "apt update && apt upgrade -y"

# Con variable de entorno
sudo EDITOR=vim visudo

# Preservar entorno del usuario (cuidado: puede ser peligroso)
sudo -E env | grep HOME
```

---

## su vs sudo

```bash
# su: cambiar de usuario (necesita la contrasena del OTRO usuario)
su alice          # pide contrasena de alice, shell sin-login
su - alice        # pide contrasena de alice, shell de login (carga su .bashrc)
su -              # pide contrasena de ROOT, shell de login de root
su -c "comando"   # ejecutar un comando y volver

# sudo: ejecutar como root (necesita TU contrasena de usuario)
sudo comando      # pide TU contrasena
sudo -i           # shell de login como root

# ¿Cual usar? sudo cuando sea posible, su - cuando necesites
# una sesion completa como otro usuario
```

---

## /var/log/auth.log: el registro de sudo

```bash
# Ver todos los usos de sudo hoy
sudo grep "sudo" /var/log/auth.log | tail -20

# Formato:
# Jan 15 10:23:45 hostname sudo: alice : TTY=pts/0 ; PWD=/home/alice ;
#   USER=root ; COMMAND=/usr/bin/apt upgrade

# Ver intentos fallidos de sudo
sudo grep "sudo.*FAILED" /var/log/auth.log

# Ver quien ha usado sudo en las ultimas 24h
sudo grep "COMMAND" /var/log/auth.log | grep "$(date '+%b %e')"
```

---

## sudo -l: ver tus permisos

```bash
# Ver que puedo ejecutar con sudo
sudo -l

# Ejemplo de salida:
# Matching Defaults entries for alice on servidor:
#     env_reset, mail_badpass
#
# User alice may run the following commands on servidor:
#     (ALL : ALL) ALL           # puede hacer cualquier cosa
#     (root) /usr/bin/apt       # solo apt como root
#     (www-data) /usr/bin/php   # php como www-data

# Verificar si puedo ejecutar un comando especifico
sudo -l | grep "apt"
```

---

## Buenas practicas

```bash
# ✓ Preferir sudo sobre login como root
sudo apt update

# ✓ Usar sudo -u para ejecutar como usuario especifico
sudo -u www-data php artisan cache:clear

# ✓ Usar sudo con ruta completa
sudo /usr/bin/systemctl restart nginx

# ✗ Evitar sudo bash o sudo -i para sesiones largas
# (mejor: documentar la sesion y usar comandos individuales)

# ✗ Evitar sudo -E (puede exponer variables del entorno del usuario)

# ✓ Verificar que el comando hace lo que crees antes de ejecutarlo con sudo
echo "apt upgrade" | sudo -s
```

---

## Practica

1. Ejecuta `sudo -l` y documenta que comandos puedes ejecutar como sudo
2. Usa `sudo -u www-data whoami` para verificar que puedes ejecutar como otro usuario
3. Revisa `/var/log/auth.log` y busca tus propios usos de sudo
4. Ejecuta `sudo -i` y luego `exit` para volver. Nota la diferencia en el prompt y el HOME
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Auditar usos de sudo",
                "description": "Muestra los ultimos 10 comandos ejecutados con sudo desde auth.log (o journalctl). Muestra tambien los permisos sudo de tu usuario con 'sudo -l'.",
                "hint": "sudo journalctl _COMM=sudo | tail -20 && sudo -l",
                "validation_command": "sudo -l 2>&1 | grep -iE 'may run|NOPASSWD|ALL'",
                "expected_output_contains": "run"
            }
        ]
    },
    {
        "title": "visudo y /etc/sudoers: Configuración Granular",
        "description": "Configura /etc/sudoers con visudo para controlar con precisión qué usuarios pueden ejecutar qué comandos como quién, desde qué máquinas y con o sin contraseña.",
        "difficulty": "intermediate",
        "duration_minutes": 45,
        "xp_reward": 140,
        "learning_objectives": [
            "Editar sudoers de forma segura con visudo",
            "Entender la sintaxis de reglas sudo",
            "Crear aliases de comandos y usuarios",
            "Configurar NOPASSWD de forma segura"
        ],
        "commands": ["visudo", "/etc/sudoers", "/etc/sudoers.d/", "NOPASSWD"],
        "guide_markdown": """# visudo y /etc/sudoers: Configuracion Granular

## ¡SIEMPRE usa visudo!

`visudo` valida la sintaxis antes de guardar. Un sudoers con error de sintaxis puede dejar el sistema SIN acceso sudo.

```bash
# Editar sudoers de forma segura
sudo visudo

# Editar con un editor especifico
sudo EDITOR=nano visudo

# Verificar sintaxis sin editar
sudo visudo -c
# >>> /etc/sudoers: parsed OK

# ¡NUNCA hagas esto!
sudo nano /etc/sudoers  # no valida la sintaxis
```

---

## Sintaxis de /etc/sudoers

```
WHO WHERE=(AS_WHO) COMMAND
```

```bash
# Ejemplos:
# Un usuario especifico puede hacer todo
alice   ALL=(ALL:ALL)  ALL

# Solo en este servidor
alice   servidor01=(ALL) ALL

# Solo ejecutar apt como root
alice   ALL=(root) /usr/bin/apt

# Grupo con acceso total
%sudo   ALL=(ALL:ALL) ALL
%admins ALL=(root)    ALL

# Sin contrasena para comandos de lectura
bob     ALL=(root) NOPASSWD: /usr/bin/journalctl, /bin/cat /var/log/*

# Como usuario especifico
carlos  ALL=(www-data) /usr/bin/php
```

---

## Aliases para simplificar

```bash
# En /etc/sudoers o /etc/sudoers.d/mi_config:

# Alias de usuarios
User_Alias WEBDEVS = alice, bob, charlie
User_Alias DBADMINS = dave, eve

# Alias de maquinas
Host_Alias WEBSERVERS = web01, web02, web03
Host_Alias DBSERVERS = db01, db02

# Alias de comandos
Cmnd_Alias WEBCOMMANDS = /usr/bin/systemctl restart nginx, \
                         /usr/bin/systemctl reload nginx, \
                         /usr/bin/journalctl -u nginx
Cmnd_Alias APTCOMMANDS = /usr/bin/apt update, /usr/bin/apt upgrade

# Usar los aliases
WEBDEVS  WEBSERVERS=(root) WEBCOMMANDS
DBADMINS DBSERVERS=(root) NOPASSWD: /usr/bin/mysql
```

---

## /etc/sudoers.d/: archivos por aplicacion

Mejor practica: no modificar /etc/sudoers directamente, usar archivos separados:

```bash
# Verificar que sudoers.d esta incluido:
grep "#includedir" /etc/sudoers
# #includedir /etc/sudoers.d

# Crear regla para un servicio
sudo tee /etc/sudoers.d/90-webserver <<EOF
# Desarrolladores web pueden reiniciar nginx sin contrasena
%webdevs ALL=(root) NOPASSWD: /usr/bin/systemctl restart nginx
%webdevs ALL=(root) NOPASSWD: /usr/bin/systemctl reload nginx
%webdevs ALL=(root) NOPASSWD: /usr/bin/journalctl -u nginx -f
EOF

# Los archivos deben tener permisos 0440
sudo chmod 0440 /etc/sudoers.d/90-webserver

# Verificar sintaxis
sudo visudo -c -f /etc/sudoers.d/90-webserver
```

---

## NOPASSWD: ¿cuándo es apropiado?

```bash
# APROPIADO: comandos de solo lectura
alice ALL=(root) NOPASSWD: /usr/bin/journalctl, /bin/cat /var/log/nginx/*.log

# APROPIADO: para automatizacion (scripts de CI/CD)
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart mi-app

# INAPROPIADO: acceso a shell o comandos generales
# alice ALL=(root) NOPASSWD: ALL                      # muy peligroso
# alice ALL=(root) NOPASSWD: /bin/bash                # equivale a root sin contrasena
# alice ALL=(root) NOPASSWD: /usr/bin/vim /etc/passwd # permite editar cualquier archivo
```

---

## Configuracion Defaults

```bash
# En /etc/sudoers, seccion Defaults:
Defaults    env_reset                        # limpiar variables de entorno
Defaults    mail_badpass                     # avisar por email si falla auth
Defaults    secure_path="/usr/local/sbin:..."  # PATH seguro para sudo
Defaults    timestamp_timeout=5              # minutos hasta pedir contrasena de nuevo
Defaults    passwd_tries=3                   # intentos antes de fallar
Defaults    requiretty                       # requiere TTY (previene sudo desde scripts)
Defaults:alice    !requiretty               # excepciones por usuario
Defaults    log_output                       # grabar la sesion completa de sudo
```

---

## Practica

1. Crea `/etc/sudoers.d/90-mi_config` que permita a tu usuario reiniciar SSH sin contrasena
2. Usa los aliases para definir un grupo de comandos de lectura de logs sin contrasena
3. Verifica la sintaxis con `visudo -c`
4. Usa `sudo -l` para confirmar que las nuevas reglas aparecen
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Configurar regla sudo personalizada",
                "description": "Crea /etc/sudoers.d/90-practica con una regla NOPASSWD para que tu usuario ejecute 'journalctl' sin contrasena. Verifica con sudo -l.",
                "hint": "echo \"$USER ALL=(root) NOPASSWD: /usr/bin/journalctl\" | sudo tee /etc/sudoers.d/90-practica && sudo chmod 0440 /etc/sudoers.d/90-practica",
                "validation_command": "sudo -l 2>&1 | grep -c 'NOPASSWD.*journal'",
                "expected_output_contains": "1"
            }
        ]
    },
    {
        "title": "Hardening de Cuentas: Fortaleciendo la Seguridad",
        "description": "Aplica técnicas de hardening para fortalecer la seguridad de las cuentas de usuario: desactivar cuentas innecesarias, configurar SSH seguro, políticas de contraseñas y PAM.",
        "difficulty": "advanced",
        "duration_minutes": 50,
        "xp_reward": 160,
        "learning_objectives": [
            "Auditar y desactivar cuentas del sistema innecesarias",
            "Configurar autenticacion SSH con claves",
            "Implementar politicas de contrasenas robustas",
            "Hardening del proceso de login con PAM"
        ],
        "commands": ["passwd -l", "usermod -s /sbin/nologin", "ssh-keygen", "authorized_keys", "pam"],
        "guide_markdown": """# Hardening de Cuentas: Fortaleciendo la Seguridad

## Auditoria de cuentas del sistema

```bash
#!/usr/bin/env bash
echo "=== AUDITORIA DE CUENTAS ==="

echo "Cuentas con shell de login (potenciales puntos de acceso):"
awk -F: '$7!~/nologin|false/ {print $1, $7}' /etc/passwd

echo ""
echo "Cuentas sin contrasena:"
sudo awk -F: '$2=="" {print $1}' /etc/shadow

echo ""
echo "Cuentas bloqueadas:"
sudo awk -F: '$2~/^!/ {print $1}' /etc/shadow

echo ""
echo "Cuentas nunca expiradas con UID alto:"
awk -F: '$3>=1000 && $3<65534 {print $1}' /etc/passwd | while read user; do
    expire=$(sudo chage -l "$user" 2>/dev/null | grep "Account expires" | cut -d':' -f2)
    echo "$user: $expire"
done
```

---

## Desactivar cuentas innecesarias

```bash
# Cambiar shell a nologin (el usuario no puede iniciar sesion)
sudo usermod -s /sbin/nologin usuario_inactivo

# O /bin/false (alternativa, menos informativa)
sudo usermod -s /bin/false usuario_inactivo

# Bloquear la contrasena
sudo passwd -l usuario_inactivo

# Para cuentas de servicio que nunca deben hacer login:
# (www-data, nobody, daemon, etc. ya tienen nologin)
cat /etc/passwd | grep -E "nologin|false" | awk -F: '{print $1}'

# Bloquear cuentas del sistema que no necesitan shell:
for user in news uucp proxy list irc gnats; do
    id "$user" &>/dev/null && sudo usermod -s /usr/sbin/nologin "$user"
done
```

---

## Autenticacion SSH con claves (sin contrasena)

```bash
# Generar par de claves (en el cliente)
ssh-keygen -t ed25519 -C "alice@empresa.com"
# Genera: ~/.ssh/id_ed25519 (privada) y ~/.ssh/id_ed25519.pub (publica)

# Copiar clave publica al servidor
ssh-copy-id -i ~/.ssh/id_ed25519.pub alice@servidor.com
# O manualmente:
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Permisos CRITICOS: SSH rechaza claves si los permisos son incorrectos
ls -la ~/.ssh/
# drwx------ 2 alice alice 4096 ...  ~/.ssh (700)
# -rw------- 1 alice alice  411 ...  id_ed25519 (600)
# -rw-r--r-- 1 alice alice  104 ...  id_ed25519.pub (644)
# -rw------- 1 alice alice  104 ...  authorized_keys (600)
```

---

## Hardening de /etc/ssh/sshd_config

```bash
sudo tee /etc/ssh/sshd_config.d/99-hardening.conf <<'EOF'
# Deshabilitar login de root por SSH
PermitRootLogin no

# Solo autenticacion por clave (sin contrasena)
PasswordAuthentication no
PubkeyAuthentication yes

# No permitir SSH sin contrasena/clave
PermitEmptyPasswords no

# Cambiar puerto (oscuridad, no es seguridad real pero reduce ruido)
# Port 2222

# Limitar usuarios que pueden conectar por SSH
AllowUsers alice bob admin

# O limitir por grupo
AllowGroups sshusers

# Timeout de inactividad (5 min)
ClientAliveInterval 300
ClientAliveCountMax 2

# Limitar intentos de autenticacion
MaxAuthTries 3
MaxSessions 10

# Deshabilitar X11 forwarding si no se necesita
X11Forwarding no

# Usar solo protocolos modernos
Protocol 2
EOF

# Verificar que la configuracion es valida
sudo sshd -t && echo "Configuracion SSH valida"

# Aplicar cambios
sudo systemctl reload sshd
```

---

## Politicas de contrasenas con PAM

```bash
# Instalar pam_pwquality
sudo apt-get install libpam-pwquality

# Configurar calidad
sudo tee /etc/security/pwquality.conf <<'EOF'
# Longitud minima: 12 caracteres
minlen = 12
# Al menos 1 numero
dcredit = -1
# Al menos 1 mayuscula
ucredit = -1
# Al menos 1 minuscula
lcredit = -1
# Al menos 1 simbolo
ocredit = -1
# No repetir el mismo caracter 3 veces seguido
maxrepeat = 3
# No puede ser el nombre del usuario
usercheck = 1
# Contrasenas ya usadas no se pueden reutilizar (ultimas 5)
remember = 5
EOF
```

---

## Script de hardening completo

```bash
#!/usr/bin/env bash
# hardening.sh — Script de hardening de cuentas

set -euo pipefail
LOG="/var/log/hardening.log"
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

hardening_accounts() {
    log "Iniciando hardening de cuentas..."

    # 1. Bloquear cuentas del sistema sin shell valido
    local system_users=(news uucp proxy list irc gnats backup)
    for user in "${system_users[@]}"; do
        if id "$user" &>/dev/null; then
            sudo usermod -s /usr/sbin/nologin "$user" 2>/dev/null || true
            log "Shell de $user cambiado a nologin"
        fi
    done

    # 2. Configurar umask estricto
    echo "umask 027" | sudo tee /etc/profile.d/99-umask.sh
    log "Umask configurado a 027"

    # 3. Verificar /etc/passwd - no debe tener contrasenas en texto
    if awk -F: '$2!="x" && $2!="*" && $2!="" {print $1}' /etc/passwd | grep -q .; then
        log "ALERTA: Hay contrasenas en /etc/passwd!"
    fi

    log "Hardening de cuentas completado"
}

hardening_accounts
```

---

## Practica

1. Ejecuta la auditoria de cuentas y documenta las cuentas con shell de login
2. Configura `/etc/security/pwquality.conf` con minlen=10
3. Genera un par de claves SSH con ed25519 y configura los permisos correctos
4. Crea el archivo `/etc/ssh/sshd_config.d/99-hardening.conf` con las mejores practicas
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Auditoria y hardening de cuentas",
                "description": "Crea hardening_check.sh que liste: cuentas con shell de login, cuentas bloqueadas y cuentas del sistema sin nologin. Genera un informe.",
                "hint": "Combina: awk sobre /etc/passwd para shells, awk sobre /etc/shadow para bloqueadas",
                "validation_command": "bash hardening_check.sh 2>&1 | grep -iE 'shell|bloqueada|login'",
                "expected_output_contains": "shell"
            }
        ]
    },
    {
        "title": "Auditoria de Seguridad con auditd",
        "description": "Configura auditd, el demonio de auditoría del kernel de Linux, para registrar eventos de seguridad: accesos a archivos sensibles, cambios de privilegios y comandos ejecutados con sudo.",
        "difficulty": "advanced",
        "duration_minutes": 45,
        "xp_reward": 155,
        "learning_objectives": [
            "Instalar y configurar auditd",
            "Crear reglas de auditoria con auditctl",
            "Analizar logs de auditoria con ausearch y aureport",
            "Configurar reglas persistentes en audit.rules"
        ],
        "commands": ["auditctl", "ausearch", "aureport", "auditd", "/etc/audit/"],
        "guide_markdown": """# Auditoria de Seguridad con auditd

## ¿Que es auditd?

auditd es el demonio de auditoria del kernel de Linux que registra eventos del sistema a nivel de kernel, incluyendo:
- Accesos a archivos especificos
- Llamadas al sistema
- Cambios de identidad (setuid, sudo)
- Logins y logouts
- Cambios en la configuracion del sistema

---

## Instalacion y configuracion basica

```bash
# Instalar
sudo apt-get install auditd audispd-plugins

# Estado del servicio
sudo systemctl status auditd
sudo systemctl enable --now auditd

# Ver configuracion
cat /etc/audit/auditd.conf

# Ver reglas actuales
sudo auditctl -l

# Estadisticas
sudo auditctl -s
```

---

## auditctl: gestionar reglas en tiempo real

```bash
# Monitorear acceso a un archivo critico
sudo auditctl -w /etc/passwd -p rwxa -k "passwd_access"
#                 ^ruta   ^permisos(r=read,w=write,x=execute,a=attribute)
#                                   ^clave para buscar en logs

# Monitorear un directorio
sudo auditctl -w /etc/ssh/ -p wa -k "ssh_config_changes"

# Monitorear llamadas al sistema (cambio de identidad)
sudo auditctl -a always,exit -F arch=b64 -S setuid -S setgid -k "priv_escalation"

# Monitorear uso de sudo
sudo auditctl -w /usr/bin/sudo -p x -k "sudo_usage"

# Ver reglas activas
sudo auditctl -l

# Eliminar todas las reglas temporales
sudo auditctl -D
```

---

## Reglas persistentes en /etc/audit/rules.d/

```bash
sudo tee /etc/audit/rules.d/99-security.rules <<'EOF'
## Deletes existing rules
-D

## Set buffer size
-b 8192

## Failure mode (1=log, 2=panic)
-f 1

## Monitor critical files
-w /etc/passwd -p wa -k "user_accounts"
-w /etc/shadow -p wa -k "password_changes"
-w /etc/group  -p wa -k "group_changes"
-w /etc/sudoers -p wa -k "sudoers_changes"
-w /etc/sudoers.d/ -p wa -k "sudoers_changes"
-w /etc/ssh/sshd_config -p wa -k "ssh_config"

## Monitor sudo usage
-w /usr/bin/sudo -p x -k "sudo_exec"
-w /bin/su -p x -k "su_exec"

## Monitor authentication failures
-w /var/log/auth.log -p wa -k "auth_log"

## System calls relacionadas con usuarios
-a always,exit -F arch=b64 -S setuid -S setgid -k "priv_change"
-a always,exit -F arch=b64 -S chmod -S fchmod -S chown -F auid!=4294967295 -k "perm_changes"

## Hacer reglas inmutables (requiere reboot para cambiar)
## -e 2
EOF

# Cargar las reglas
sudo augenrules --load
sudo systemctl restart auditd
```

---

## ausearch: buscar en logs de auditoria

```bash
# Buscar por clave
sudo ausearch -k "passwd_access" | head -30

# Buscar en el ultimo dia
sudo ausearch -k "sudo_exec" --start today

# Buscar por usuario
sudo ausearch -ua alice

# Buscar eventos fallidos
sudo ausearch -sv no -k "user_accounts"

# Buscar accesos a archivo especifico
sudo ausearch -f /etc/shadow | tail -20

# Formato legible
sudo ausearch -k "ssh_config" -i | head -40
```

---

## aureport: informes resumidos

```bash
# Informe general
sudo aureport

# Solo autenticaciones
sudo aureport -au

# Solo eventos de sudo
sudo aureport -x | grep sudo

# Eventos fallidos
sudo aureport --failed

# Ultimos 7 dias
sudo aureport --start week-ago

# Informe de archivos accedidos
sudo aureport -f | head -20

# Informe de usuarios
sudo aureport -u
```

---

## Practica

1. Instala y activa auditd
2. Configura reglas para monitorear /etc/passwd, /etc/sudoers y el uso de sudo
3. Ejecuta algunos comandos que activen las reglas (vi /etc/hosts, sudo ls)
4. Busca los eventos con ausearch y genera un informe con aureport
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Configurar y usar auditd",
                "description": "Instala auditd, añade una regla para monitorear accesos a /tmp/audit_test.txt, crea el archivo y accede a el. Verifica el evento con ausearch.",
                "hint": "sudo auditctl -w /tmp/audit_test.txt -p rwa -k test_audit && touch /tmp/audit_test.txt && cat /tmp/audit_test.txt && sudo ausearch -k test_audit",
                "validation_command": "sudo auditctl -l 2>&1 | grep -c '/tmp/audit_test'",
                "expected_output_contains": "1"
            }
        ]
    },
    {
        "title": "Fail2ban: Proteccion contra Ataques de Fuerza Bruta",
        "description": "Instala y configura Fail2ban para proteger el sistema contra ataques de fuerza bruta en SSH y otros servicios. Aprende a crear jails personalizadas.",
        "difficulty": "intermediate",
        "duration_minutes": 40,
        "xp_reward": 130,
        "learning_objectives": [
            "Instalar y configurar Fail2ban",
            "Entender el concepto de jails",
            "Crear jails personalizadas",
            "Ver y gestionar IPs baneadas"
        ],
        "commands": ["fail2ban-client", "fail2ban-regex", "/etc/fail2ban/", "iptables"],
        "guide_markdown": """# Fail2ban: Proteccion contra Ataques de Fuerza Bruta

## Como funciona Fail2ban

1. **Monitorea** logs de servicios (SSH, Apache, Nginx...)
2. **Detecta** patrones de fallos de autenticacion
3. **Banea** la IP origen bloqueandola en iptables/nftables

---

## Instalacion y configuracion basica

```bash
# Instalar
sudo apt-get install fail2ban

# Habilitarlo
sudo systemctl enable --now fail2ban

# Estado
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

---

## Estructura de configuracion

```bash
ls /etc/fail2ban/
# fail2ban.conf     # configuracion principal
# jail.conf         # jails predefinidas (NO editar)
# jail.local        # TU configuracion (crea este)
# filter.d/         # filtros (expresiones regex para detectar ataques)
# action.d/         # acciones (banear, notificar, etc.)
```

**Regla importante:** Crea `jail.local` (no editar `jail.conf`)

---

## /etc/fail2ban/jail.local

```bash
sudo tee /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
# IP que NUNCA se banearan (siempre incluir localhost y tu IP)
ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24

# Tiempo de baneo (segundos, -1 = permanente)
bantime  = 3600    # 1 hora

# Ventana de tiempo para contar fallos
findtime = 600     # 10 minutos

# Numero de fallos antes de banear
maxretry = 5

# Backend para detectar cambios en logs
backend = systemd

# Accion: banear y notificar
action = %(action_mw)s

[sshd]
enabled  = true
port     = ssh
filter   = sshd
maxretry = 3
bantime  = 86400   # 24 horas para SSH (mas estricto)
findtime = 3600    # ventana de 1 hora

[nginx-http-auth]
enabled  = true
filter   = nginx-http-auth
port     = http,https
logpath  = %(nginx_error_log)s
maxretry = 5

[nginx-limit-req]
enabled  = true
filter   = nginx-limit-req
port     = http,https
logpath  = %(nginx_error_log)s
maxretry = 10

EOF

sudo systemctl restart fail2ban
```

---

## Crear una jail personalizada

```bash
# Crear filtro para nuestra aplicacion
sudo tee /etc/fail2ban/filter.d/mi-app.conf <<'EOF'
[Definition]
# Regex que detecta intentos fallidos en los logs de mi-app
failregex = ^.*\[.*\] Authentication failed for .* from <HOST>.*$
            ^.*\[.*\] Invalid credentials from <HOST>.*$

ignoreregex =
EOF

# Crear la jail para mi-app
sudo tee -a /etc/fail2ban/jail.local <<'EOF'

[mi-app]
enabled  = true
filter   = mi-app
port     = 8080
logpath  = /var/log/mi-app/access.log
maxretry = 10
bantime  = 1800
EOF

# Probar el filtro
sudo fail2ban-regex /var/log/mi-app/access.log /etc/fail2ban/filter.d/mi-app.conf

sudo systemctl reload fail2ban
```

---

## Gestionar IPs baneadas

```bash
# Ver estado de todas las jails
sudo fail2ban-client status

# Ver IPs baneadas en ssh
sudo fail2ban-client status sshd

# Desbanear una IP manualmente
sudo fail2ban-client set sshd unbanip 1.2.3.4

# Banear manualmente una IP
sudo fail2ban-client set sshd banip 1.2.3.4

# Ver las reglas de iptables generadas por fail2ban
sudo iptables -L f2b-sshd -n --line-numbers

# Ver el log de fail2ban
sudo tail -f /var/log/fail2ban.log
```

---

## Practica

1. Instala fail2ban y verifica que la jail sshd esta activa
2. Configura `jail.local` con bantime=3600, maxretry=3 para sshd
3. Simula 3 fallos de login (puedes usar `ssh usuario_inexistente@localhost`)
4. Verifica con `fail2ban-client status sshd` que la IP aparece como baneada
5. Desbanea tu propia IP con `fail2ban-client set sshd unbanip 127.0.0.1`
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Configurar Fail2ban para SSH",
                "description": "Instala fail2ban, configura jail.local para sshd con maxretry=3 y bantime=1800. Verifica que la jail sshd esta activa y muestra su estado.",
                "hint": "sudo apt-get install -y fail2ban && sudo systemctl enable --now fail2ban && sudo fail2ban-client status sshd",
                "validation_command": "sudo fail2ban-client status sshd 2>&1 | grep -i 'currently banned'",
                "expected_output_contains": "banned"
            }
        ]
    },
    {
        "title": "Proyecto Final: Sistema de Administracion de Usuarios y Seguridad",
        "description": "Proyecto integrador del path completo: construye un sistema CLI de administracion de usuarios y seguridad que combine gestion de cuentas, ACLs, sudo, auditoria y hardening.",
        "difficulty": "advanced",
        "duration_minutes": 120,
        "xp_reward": 500,
        "learning_objectives": [
            "Integrar todos los conceptos del path",
            "Disenar una arquitectura de seguridad completa",
            "Automatizar tareas de administracion de usuarios",
            "Generar informes de seguridad profesionales"
        ],
        "commands": ["useradd", "setfacl", "chattr", "visudo", "auditctl", "fail2ban-client", "chage"],
        "guide_markdown": """# Proyecto Final: Sistema de Administracion de Usuarios y Seguridad

## Descripcion del Proyecto

Construiras **user-security-toolkit**, un sistema integral de gestion de usuarios y seguridad para un servidor Linux.

---

## Estructura del proyecto

```
user-security-toolkit/
├── main.sh                     # CLI principal
├── lib/
│   ├── users.sh                # gestion de usuarios
│   ├── groups.sh               # gestion de grupos
│   ├── acls.sh                 # ACLs y permisos
│   ├── sudo.sh                 # configuracion sudo
│   ├── audit.sh                # auditoria de seguridad
│   └── report.sh               # generacion de informes
├── config/
│   ├── users.csv               # usuarios a crear en lote
│   ├── acl_policy.conf         # politica de ACLs
│   └── sudo_rules.conf         # reglas sudo
└── tests/
    └── test_all.bats
```

---

## main.sh: CLI principal

```bash
#!/usr/bin/env bash
set -euo pipefail

TOOLKIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$TOOLKIT_DIR/lib/users.sh"
source "$TOOLKIT_DIR/lib/acls.sh"
source "$TOOLKIT_DIR/lib/audit.sh"
source "$TOOLKIT_DIR/lib/report.sh"

usage() {
    cat <<HELP
user-security-toolkit — Gestion de Usuarios y Seguridad

Comandos:
  user:create  --user NOMBRE [--groups GRUPOS] [--policy POLITICA]
  user:bulk    --csv ARCHIVO
  user:lock    --user NOMBRE
  user:audit   [--output ARCHIVO]

  acl:setup    --dir DIRECTORIO --policy ARCHIVO
  acl:verify   --dir DIRECTORIO
  acl:export   --dir DIRECTORIO --output ARCHIVO

  security:audit    [--full]
  security:harden   [--dry-run]
  security:report   --output ARCHIVO

  sudo:grant   --user NOMBRE --commands LISTA
  sudo:revoke  --user NOMBRE
  sudo:audit

Ejemplos:
  $0 user:create --user alice --groups developers,sudo
  $0 acl:setup --dir /opt/proyecto --policy config/acl_policy.conf
  $0 security:audit --full > /tmp/security_report.txt
HELP
}

# Dispatcher
[[ $# -eq 0 ]] && { usage; exit 0; }
cmd="${1//:/_}"; shift
type "cmd_$cmd" &>/dev/null || { echo "Comando desconocido: $cmd"; usage; exit 1; }
"cmd_$cmd" "$@"
```

---

## lib/audit.sh: auditoria completa

```bash
#!/usr/bin/env bash
# lib/audit.sh

cmd_security_audit() {
    local full=false output="/dev/stdout"
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --full)          full=true; shift ;;
            --output)        output="$2"; shift 2 ;;
            *) shift ;;
        esac
    done

    {
        echo "======================================"
        echo " AUDITORIA DE SEGURIDAD: $(hostname)"
        echo " Fecha: $(date)"
        echo "======================================"

        echo ""
        echo "## CUENTAS DE USUARIO"
        echo "Usuarios con shell de login:"
        awk -F: '$7!~/nologin|false/ && $3>=1000 {print "  "$1" ("$7")"}' /etc/passwd

        echo ""
        echo "Cuentas bloqueadas:"
        sudo awk -F: '$2~/^!/ {print "  "$1}' /etc/shadow 2>/dev/null || echo "  (requiere root)"

        echo ""
        echo "## SUDO Y PRIVILEGIOS"
        echo "Miembros del grupo sudo:"
        getent group sudo | cut -d: -f4 | tr ',' '\n' | sed 's/^/  /'

        echo ""
        echo "Archivos SUID del sistema:"
        find /usr /bin /sbin -perm -4000 -type f -ls 2>/dev/null | awk '{print "  "$3,$5,$11}'

        if $full; then
            echo ""
            echo "## ACLs ESPECIALES"
            find /opt /var /etc -type f -ls 2>/dev/null | grep '+' | head -20 | awk '{print "  "$11}'

            echo ""
            echo "## ULTIMAS AUTENTICACIONES"
            last -n 10 | awk 'NF>0 && !/wtmp/ {printf "  %-12s %-10s %s %s\n", $1,$2,$4,$5}'
        fi

        echo ""
        echo "======================================"
        echo " Auditoria completada: $(date)"
        echo "======================================"
    } > "$output"

    [[ "$output" != "/dev/stdout" ]] && echo "Informe guardado en: $output"
}
```

---

## config/acl_policy.conf

```bash
# Formato: directorio|grupo|permisos|default
/opt/proyecto/alpha|developers|rwx|rw-
/opt/proyecto/alpha|qa|r-x|r--
/opt/proyecto/logs|ops|rwx|rw-
/opt/proyecto/logs|developers|r-x|r--
/opt/proyecto/docs|all|r-x|r--
```

---

## lib/acls.sh

```bash
#!/usr/bin/env bash

cmd_acl_setup() {
    local dir="" policy=""
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dir)    dir="$2";    shift 2 ;;
            --policy) policy="$2"; shift 2 ;;
            *) shift ;;
        esac
    done
    [[ -d "$dir" && -f "$policy" ]] || { echo "Error: dir y policy requeridos"; return 1; }

    echo "Configurando ACLs en $dir desde $policy..."
    while IFS='|' read -r subdir group perms default_perms; do
        [[ "$subdir" =~ ^# ]] && continue
        [[ -z "$subdir" ]] && continue
        local target="${dir}/${subdir##*/}"
        [[ -d "$target" ]] || sudo mkdir -p "$target"
        if [[ "$group" == "all" ]]; then
            setfacl -m o::$perms "$target"
        else
            setfacl -m g:$group:$perms "$target"
            setfacl -d -m g:$group:$default_perms "$target"
        fi
        echo "  [$group] $perms en $(basename $target)"
    done < "$policy"
    echo "ACLs configuradas."
}
```

---

## Criterios de evaluacion

1. **CLI funcional**: main.sh con al menos 5 comandos implementados
2. **Gestion de usuarios**: user:create, user:bulk desde CSV, user:lock funcionan
3. **ACLs**: acl:setup aplica politica desde archivo de configuracion
4. **Auditoria**: security:audit genera informe completo
5. **Sudo**: sudo:audit lista todos los privilegios del sistema
6. **Informe**: security:report genera HTML o texto con todos los resultados
7. **Tests**: al menos 5 tests que pasen con bats
""",
        "challenges": [
            {
                "id": "c1",
                "title": "Toolkit con 5 comandos funcionales",
                "description": "Implementa user-security-toolkit con los comandos: user:create, user:audit, acl:setup, security:audit y sudo:audit. El comando 'help' debe listar todos.",
                "hint": "Empieza con main.sh + lib/users.sh + lib/audit.sh. Añade los otros modulos despues.",
                "validation_command": "bash main.sh 2>&1 | grep -cE 'user:|acl:|security:|sudo:'",
                "expected_output_contains": "5"
            },
            {
                "id": "c2",
                "title": "Informe de seguridad completo",
                "description": "Ejecuta 'security:audit --full' y genera un informe que incluya: cuentas con login, miembros de sudo, archivos SUID y ultimas autenticaciones.",
                "hint": "bash main.sh security:audit --full --output /tmp/security_report.txt && wc -l /tmp/security_report.txt",
                "validation_command": "bash main.sh security:audit 2>&1 | grep -iE 'sudo|suid|cuentas|auditoria'",
                "expected_output_contains": "sudo"
            }
        ]
    },
]

# ─── MAIN ───────────────────────────────────────────────────────────────────

def seed():
    db = SessionLocal()
    try:
        path = get_path(db)
        print(f"[PATH] {path.title} (id={path.id})")

        max_order = db.query(func.max(Module.order_index)).filter(
            Module.skill_path_id == path.id
        ).scalar() or 0

        # M3
        m3 = upsert_module(db, path.id,
            "M3 — Permisos Avanzados: ACLs y Atributos Extendidos",
            "Supera las limitaciones de los permisos clasicos con ACLs: control granular por usuario y grupo, atributos extendidos con chattr/lsattr y capacidades de Linux como alternativa al SUID.",
            max_order + 1)
        print(f"\n[M3] Insertando {len(M3_LABS)} labs...")
        insert_labs(db, m3, M3_LABS)

        # M4
        m4 = upsert_module(db, path.id,
            "M4 — sudo y Seguridad de Cuentas",
            "Implementa una estrategia de seguridad completa: delegacion de privilegios con sudo, configuracion de /etc/sudoers, hardening de cuentas, auditoria con auditd y proteccion contra ataques con Fail2ban.",
            max_order + 2)
        print(f"\n[M4] Insertando {len(M4_LABS)} labs...")
        insert_labs(db, m4, M4_LABS)

        print(f"\n✅ seed_usuarios_part2.py completado")
        print(f"   M3: {len(M3_LABS)} labs | M4: {len(M4_LABS)} labs")
        print(f"✅ PATH 'Usuarios y Permisos Linux' COMPLETO: M1+M2+M3+M4")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
