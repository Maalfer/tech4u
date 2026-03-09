"""
Claude Labs — Seed Script (Part 2 of 3)
Módulo 3: Permisos y Propietarios (Labs 21-30)
Módulo 4: Procesos y Sistema (Labs 31-40)
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

# ─────────────────────────────────────────────────────
# MÓDULO 3 — Permisos y Propietarios (10 labs)
# ─────────────────────────────────────────────────────
M3_LABS = [
    {
        "order_index": 1,
        "title": "Entendiendo los Permisos rwx",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 130,
        "time_limit": 20,
        "description": """## Teoría: Sistema de Permisos en Linux

Linux usa un sistema de permisos de 9 bits para controlar el acceso a archivos y directorios.

### Estructura de permisos
```
-rwxr-xr--  1 student grupo 1024 Jan 10 archivo.txt
│└──┴──┴──┘   └─────┘ └───┘
│  u  g  o    owner   group
│
└── tipo: - (archivo), d (dir), l (symlink)
```

### Los 3 tipos de permiso
| Símbolo | Nombre | En archivo | En directorio |
|---------|--------|------------|---------------|
| `r` | read | Leer contenido | Listar (ls) |
| `w` | write | Modificar/eliminar | Crear/borrar dentro |
| `x` | execute | Ejecutar como programa | Entrar (cd) |

### Las 3 categorías de usuario
- **u** (user): el propietario del archivo
- **g** (group): el grupo propietario
- **o** (others): el resto de usuarios
- **a** (all): todos (u+g+o)

### Leer el listado de ls -la
```
drwxr-xr-x  → directorio, owner=rwx, group=r-x, others=r-x
-rw-r--r--  → archivo, owner=rw-, group=r--, others=r--
-rwx------  → archivo, solo el owner puede leer/escribir/ejecutar
-rw-rw-r--  → archivo, owner y grupo pueden leer/escribir
```

### Representación octal
Cada grupo de 3 bits se representa con un dígito octal:
```
r=4, w=2, x=1

rwx = 4+2+1 = 7
rw- = 4+2+0 = 6
r-x = 4+0+1 = 5
r-- = 4+0+0 = 4
--- = 0+0+0 = 0

-rwxr-xr-- = 754
-rw-r--r-- = 644
-rwx------ = 700
```

### Guía Paso a Paso
1. Ejecuta `ls -la` → observa los permisos de cada archivo
2. Identifica el tipo (primer carácter)
3. Lee los 9 bits en grupos de 3: owner, group, others
4. Convierte a octal: rwxr-xr-- = 754""",
        "goal_description": "Comprender completamente el sistema de permisos de Linux: qué significan r, w, x para archivos y directorios, y cómo leer el listado de ls.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/publico.txt", "content": "Archivo público"},
                {"path": "/home/student/privado.txt", "content": "Archivo privado"},
                {"path": "/home/student/script.sh", "content": "#!/bin/bash\necho 'ejecutable'"}
            ],
            "commands": [
                "chmod 644 /home/student/publico.txt",
                "chmod 600 /home/student/privado.txt",
                "chmod 755 /home/student/script.sh"
            ]
        }),
        "validation_command": "stat -c '%a' /home/student/script.sh",
        "expected_result": "755",
        "challenges": [
            {
                "id": "CL21_C1",
                "title": "¿Qué permisos tiene privado.txt?",
                "description": "Usa ls -la para ver los permisos de privado.txt. ¿Cuál es su representación octal?",
                "v_type": "permission_set",
                "v_value": "600",
                "v_extra": "/home/student/privado.txt",
                "order_index": 1,
                "xp": 40,
                "hints": "Usa: ls -la privado.txt|600 = rw------- (solo propietario puede leer y escribir)"
            },
            {
                "id": "CL21_C2",
                "title": "¿Cuál es el permiso octal de script.sh?",
                "description": "Inspecciona los permisos de script.sh usando ls -la. ¿Cuál es su valor octal?",
                "v_type": "permission_set",
                "v_value": "755",
                "v_extra": "/home/student/script.sh",
                "order_index": 2,
                "xp": 40,
                "hints": "Usa: ls -la script.sh|755 = rwxr-xr-x"
            }
        ]
    },
    {
        "order_index": 2,
        "title": "chmod Numérico: Permisos en Octal",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 140,
        "time_limit": 20,
        "description": """## Teoría: chmod con Notación Numérica (Octal)

`chmod` (change mode) cambia los permisos de archivos y directorios.

### Conversión bit → octal
```
r = 4
w = 2
x = 1

Suma para cada grupo (owner, group, others):
rwx = 7  |  rw- = 6  |  r-x = 5
r-- = 4  |  -wx = 3  |  -w- = 2
--x = 1  |  --- = 0
```

### Permisos más comunes
| Octal | Simbólico | Uso típico |
|-------|-----------|------------|
| `755` | rwxr-xr-x | Scripts, ejecutables |
| `644` | rw-r--r-- | Archivos de texto, configs |
| `600` | rw------- | Claves privadas SSH |
| `700` | rwx------ | Scripts privados |
| `777` | rwxrwxrwx | ⚠️ Todos los permisos (evitar) |
| `000` | --------- | Sin acceso para nadie |
| `664` | rw-rw-r-- | Archivos de grupo |
| `440` | r--r----- | Solo lectura |

### Sintaxis chmod numérico
```bash
chmod 755 script.sh          # Establece exactamente 755
chmod 644 config.conf        # Exactamente 644
chmod 600 id_rsa             # Solo propietario lee/escribe
chmod 777 compartido.txt     # ⚠️ Cuidado: todos acceden
chmod -R 755 directorio/     # Recursivo en todo el árbol
```

### Buenas prácticas de seguridad
- Archivos de configuración: `644`
- Scripts ejecutables: `755`
- Claves privadas: `600`
- Directorios: `755` (necesitan x para cd)
- Nunca usar `777` en producción

### Guía Paso a Paso
1. Ejecuta `ls -la` → observa los permisos actuales
2. Ejecuta `chmod 600 secreto.txt` → solo tú puedes leer/escribir
3. Ejecuta `ls -la secreto.txt` → verifica el cambio
4. Ejecuta `chmod 755 mi_script.sh` → lo hace ejecutable
5. Ejecuta `stat -c '%a' mi_script.sh` → muestra el octal""",
        "goal_description": "Dominar chmod con notación octal para establecer permisos precisos en archivos y directorios, conociendo los valores más comunes.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/secreto.txt", "content": "Datos confidenciales\nNO COMPARTIR"},
                {"path": "/home/student/publico.conf", "content": "host=localhost\nport=80"},
                {"path": "/home/student/mi_script.sh", "content": "#!/bin/bash\necho 'Script funcionando'"},
                {"path": "/home/student/clave_privada.key", "content": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----"}
            ],
            "commands": [
                "chmod 777 /home/student/secreto.txt",
                "chmod 777 /home/student/mi_script.sh"
            ]
        }),
        "validation_command": "stat -c '%a' /home/student/secreto.txt",
        "expected_result": "600",
        "challenges": [
            {
                "id": "CL22_C1",
                "title": "Protege el archivo secreto",
                "description": "secreto.txt tiene permisos 777 (¡peligroso!). Cámbialo a 600 para que solo tú puedas leerlo y escribirlo.",
                "v_type": "permission_set",
                "v_value": "600",
                "v_extra": "/home/student/secreto.txt",
                "order_index": 1,
                "xp": 35,
                "hints": "Usa: chmod 600 secreto.txt|600 = rw------- solo propietario"
            },
            {
                "id": "CL22_C2",
                "title": "Hace ejecutable el script",
                "description": "mi_script.sh tiene permisos 777. Ajústalo a 755 para que sea ejecutable por todos pero solo escribible por ti.",
                "v_type": "permission_set",
                "v_value": "755",
                "v_extra": "/home/student/mi_script.sh",
                "order_index": 2,
                "xp": 35,
                "hints": "Usa: chmod 755 mi_script.sh|755 = rwxr-xr-x"
            },
            {
                "id": "CL22_C3",
                "title": "Protege la clave privada",
                "description": "Las claves privadas SSH deben tener permisos 600. Aplícaselos a clave_privada.key.",
                "v_type": "permission_set",
                "v_value": "600",
                "v_extra": "/home/student/clave_privada.key",
                "order_index": 3,
                "xp": 40,
                "hints": "Usa: chmod 600 clave_privada.key|Si los permisos son más permisivos, SSH rechazará la clave"
            }
        ]
    },
    {
        "order_index": 3,
        "title": "chmod Simbólico: u, g, o y a",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 140,
        "time_limit": 20,
        "description": """## Teoría: chmod con Notación Simbólica

La notación simbólica es más legible cuando quieres hacer cambios específicos sin recalcular el octal completo.

### Sintaxis
```
chmod [quien][operador][permiso] archivo
```

**Quién:**
- `u` → user (propietario)
- `g` → group (grupo)
- `o` → others (otros)
- `a` → all (todos: u+g+o)

**Operador:**
- `+` → añadir permiso
- `-` → quitar permiso
- `=` → establecer exactamente (quita los demás)

**Permiso:**
- `r` → read
- `w` → write
- `x` → execute

### Ejemplos
```bash
chmod u+x script.sh         # Añade ejecución al owner
chmod g-w fichero.txt       # Quita escritura al grupo
chmod o=r fichero.txt       # Others solo puede leer (quita w y x)
chmod a+r fichero.txt       # Todos pueden leer
chmod u+x,g-w,o-r arch.sh  # Múltiples cambios en uno
chmod a-x script.sh         # Quita ejecución a todos
chmod u=rw,go=r conf.txt    # Owner rw, resto solo r
```

### Comparativa: octal vs simbólico
```bash
chmod 755 script.sh     = chmod u=rwx,go=rx script.sh
chmod 644 config.conf   = chmod u=rw,go=r config.conf
chmod 600 clave.key     = chmod u=rw,go= clave.key
```

### Cuándo usar cada uno
- **Octal**: cuando quieres establecer permisos exactos desde cero
- **Simbólico**: cuando quieres añadir/quitar un permiso específico sin cambiar el resto

### Permisos en directorios
```bash
chmod u+x directorio/    # Sin x no puedes hacer cd al dir
chmod -R o-w proyecto/   # Quita write a others recursivamente
```

### Guía Paso a Paso
1. Ejecuta `ls -la` → observa los permisos actuales
2. Ejecuta `chmod u+x mi_programa` → añade ejecución al owner
3. Ejecuta `chmod g-w config.conf` → quita escritura al grupo
4. Ejecuta `chmod o= secreto.txt` → quita TODOS los permisos a others""",
        "goal_description": "Dominar la notación simbólica de chmod (u, g, o, a con +, -, =) para modificar permisos de forma selectiva y legible.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/mi_programa", "content": "#!/bin/bash\necho 'Programa ejecutado'"},
                {"path": "/home/student/config.conf", "content": "db_host=localhost\ndb_pass=secreto123"},
                {"path": "/home/student/compartido.txt", "content": "Archivo del equipo"}
            ],
            "commands": [
                "chmod 644 /home/student/mi_programa",
                "chmod 664 /home/student/config.conf",
                "chmod 644 /home/student/compartido.txt"
            ]
        }),
        "validation_command": "stat -c '%a' /home/student/mi_programa",
        "expected_result": "755",
        "challenges": [
            {
                "id": "CL23_C1",
                "title": "Añade permiso de ejecución al propietario",
                "description": "mi_programa tiene permisos 644 y no es ejecutable. Usa chmod simbólico para añadir solo el permiso de ejecución al propietario (u+x).",
                "v_type": "permission_set",
                "v_value": "755",
                "v_extra": "/home/student/mi_programa",
                "order_index": 1,
                "xp": 35,
                "hints": "Usa: chmod u+x mi_programa|Esto añade x solo al owner, sin cambiar g y o"
            },
            {
                "id": "CL23_C2",
                "title": "Elimina el write del grupo en config.conf",
                "description": "config.conf tiene permisos 664 (el grupo puede escribir). Quita el permiso de escritura al grupo usando notación simbólica.",
                "v_type": "permission_set",
                "v_value": "644",
                "v_extra": "/home/student/config.conf",
                "order_index": 2,
                "xp": 35,
                "hints": "Usa: chmod g-w config.conf|g-w quita solo el write del grupo"
            }
        ]
    },
    {
        "order_index": 4,
        "title": "chown y chgrp: Cambiar Propietario y Grupo",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 150,
        "time_limit": 20,
        "description": """## Teoría: chown y chgrp

Además de los permisos, cada archivo tiene un propietario (user) y un grupo (group).

### `chown` — Change Owner
```bash
chown nuevo_usuario archivo.txt         # Cambia propietario
chown usuario:grupo archivo.txt         # Cambia propietario Y grupo
chown :nuevo_grupo archivo.txt          # Cambia solo el grupo
chown -R usuario:grupo directorio/      # Recursivo
```

### `chgrp` — Change Group
```bash
chgrp nuevo_grupo archivo.txt           # Cambia solo el grupo
chgrp -R devs directorio/              # Recursivo
```

### Ver propietario y grupo
```bash
ls -la archivo.txt          # Col 3=propietario, Col 4=grupo
stat archivo.txt            # Info detallada incluyendo IDs
```

### Contexto real: servidor web
```bash
# Archivos del sitio deben pertenecer a www-data
chown -R www-data:www-data /var/www/html/

# Scripts de deploy al grupo devops
chown root:devops /usr/local/bin/deploy.sh
chmod 750 /usr/local/bin/deploy.sh
```

### ⚠️ Nota sobre este laboratorio
En un contenedor Docker como entorno de estudiante, `chown` a usuarios que no existen fallará. En este lab trabajamos con los usuarios disponibles (`student`, `root`).

### Combinando chown + chmod
```bash
# Patrón común para archivos de configuración
chown root:root /etc/app.conf
chmod 644 /etc/app.conf

# Patrón para scripts privados
chown student:student mi_script.sh
chmod 700 mi_script.sh
```

### Guía Paso a Paso
1. Ejecuta `ls -la` → fíjate en la columna del propietario
2. Ejecuta `chown student:student informe.txt` → cambia propietario
3. Ejecuta `ls -la informe.txt` → verifica el cambio
4. Ejecuta `stat informe.txt` → ve info detallada""",
        "goal_description": "Aprender a cambiar el propietario y grupo de archivos con chown y chgrp, entendiendo su importancia en la seguridad del sistema.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/informe.txt", "content": "Informe anual"},
                {"path": "/home/student/deploy.sh", "content": "#!/bin/bash\necho 'Desplegando aplicación'"},
                {"path": "/home/student/web_config.conf", "content": "server_name=example.com\ndocument_root=/var/www/html"}
            ],
            "commands": [
                "chmod 644 /home/student/informe.txt",
                "chmod 755 /home/student/deploy.sh"
            ]
        }),
        "validation_command": "stat -c '%U' /home/student/informe.txt",
        "expected_result": "student",
        "challenges": [
            {
                "id": "CL24_C1",
                "title": "Verifica el propietario de los archivos",
                "description": "Usa ls -la para ver el propietario de informe.txt. ¿A quién pertenece?",
                "v_type": "file_exists_in_directory",
                "v_value": "informe.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 30,
                "hints": "Usa: ls -la informe.txt|La tercera columna es el propietario"
            },
            {
                "id": "CL24_C2",
                "title": "Asigna deploy.sh al usuario student",
                "description": "Usa chown para asegurarte de que deploy.sh pertenece a student:student.",
                "v_type": "file_exists_in_directory",
                "v_value": "deploy.sh",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 45,
                "hints": "Usa: chown student:student deploy.sh|Verifica con: ls -la deploy.sh"
            }
        ]
    },
    {
        "order_index": 5,
        "title": "umask: Permisos por Defecto",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 155,
        "time_limit": 25,
        "description": """## Teoría: umask — La Máscara de Permisos

`umask` define qué permisos se ELIMINAN por defecto al crear archivos nuevos.

### ¿Cómo funciona?
- Los archivos nuevos nacen con permisos máximos de `666` (rw-rw-rw-)
- Los directorios nuevos nacen con permisos máximos de `777` (rwxrwxrwx)
- `umask` RESTA esos permisos

```
Permisos máximos:  666  (archivo)   777  (directorio)
umask actual:    - 022            - 022
                 ───              ───
Resultado:         644              755
```

### Ver y cambiar umask
```bash
umask           # Ver umask actual (suele ser 022 o 002)
umask 022       # Establece umask a 022
umask 077       # Solo el propietario tiene acceso (privacidad máxima)
umask 002       # El grupo tiene los mismos permisos que el propietario
```

### Valores comunes de umask
| umask | Archivos | Directorios | Uso |
|-------|----------|-------------|-----|
| `022` | 644 | 755 | Por defecto (servidores) |
| `002` | 664 | 775 | Trabajo en equipo |
| `077` | 600 | 700 | Máxima privacidad |
| `027` | 640 | 750 | Seguridad media |

### Persistencia
La umask se define en archivos de configuración:
```bash
# Para el usuario: ~/.bashrc o ~/.profile
echo "umask 022" >> ~/.bashrc

# Para todo el sistema: /etc/profile o /etc/login.defs
```

### Cálculo rápido
umask 027:
```
archivo:    666 - 027 = 640 (rw-r-----)
directorio: 777 - 027 = 750 (rwxr-x---)
```
(La resta es bit a bit, no aritmética)

### Guía Paso a Paso
1. Ejecuta `umask` → ve tu umask actual
2. Ejecuta `touch test_022.txt` → crea un archivo
3. Ejecuta `ls -la test_022.txt` → verifica los permisos resultantes
4. Ejecuta `umask 077` → cambia a privacidad máxima
5. Crea otro archivo y compara los permisos""",
        "goal_description": "Entender el concepto de umask y cómo determina los permisos por defecto al crear nuevos archivos y directorios.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/README.txt", "content": "Practica cambiando la umask y observando cómo afecta a los archivos creados."}
            ]
        }),
        "validation_command": "umask",
        "expected_result": "0022",
        "challenges": [
            {
                "id": "CL25_C1",
                "title": "Verifica tu umask actual",
                "description": "Ejecuta el comando umask para ver tu máscara de permisos actual. ¿Cuál es el valor?",
                "v_type": "file_exists_in_directory",
                "v_value": "README.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 25,
                "hints": "El comando es simplemente: umask|El valor más común es 0022 o 022"
            },
            {
                "id": "CL25_C2",
                "title": "Crea un archivo y verifica sus permisos",
                "description": "Con umask 022, crea un archivo llamado nuevo.txt y verifica que tiene permisos 644.",
                "v_type": "file_created",
                "v_value": "nuevo.txt",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 40,
                "hints": "Usa: touch nuevo.txt|Verifica con: ls -la nuevo.txt o stat nuevo.txt"
            }
        ]
    },
    {
        "order_index": 6,
        "title": "Permisos Especiales: SUID y SGID",
        "difficulty": "hard",
        "category": "Linux",
        "xp_reward": 200,
        "time_limit": 30,
        "description": """## Teoría: Bits de Permisos Especiales

Además de rwx, Linux tiene tres bits especiales que modifican el comportamiento de ejecución.

### SUID — Set User ID (bit 4)
Cuando un ejecutable tiene SUID, se ejecuta con los permisos del **propietario** (no del usuario que lo lanza).

```bash
chmod u+s archivo           # Activar SUID (simbólico)
chmod 4755 archivo          # Activar SUID (octal: 4 + 755)
ls -la archivo              # Aparece 's' en lugar de 'x' del owner
# -rwsr-xr-x → SUID activo
# -rwSr-xr-x → SUID activo pero sin x (S mayúscula = atención)
```

**Ejemplo real**: `/usr/bin/passwd` tiene SUID para que cualquier usuario pueda cambiar su contraseña (que requiere escribir en /etc/shadow, propiedad de root).

### SGID — Set Group ID (bit 2)
- En **archivos**: se ejecuta con el grupo del archivo (no del usuario)
- En **directorios**: los nuevos archivos heredan el **grupo del directorio**

```bash
chmod g+s directorio/       # SGID en directorio
chmod 2755 directorio/      # SGID (2 + 755)
ls -la directorio/          # 's' en el bit x del grupo
# drwxr-sr-x → SGID activo en directorio
```

### Sticky Bit (bit 1)
En directorios, solo el propietario puede borrar sus propios archivos:
```bash
chmod +t /tmp               # Activar sticky bit
chmod 1777 /tmp             # Sticky + todos los permisos
ls -la /tmp                 # drwxrwxrwt
```

### Buscar archivos con SUID/SGID
```bash
find / -perm /4000 -type f 2>/dev/null   # Busca SUID
find / -perm /2000 -type f 2>/dev/null   # Busca SGID
find / -perm /6000 -type f 2>/dev/null   # Ambos
```

### Representación octal completa (4 dígitos)
```
4755 = SUID + rwxr-xr-x
2755 = SGID + rwxr-xr-x
1777 = Sticky + rwxrwxrwx
6755 = SUID + SGID + rwxr-xr-x
```

### Guía Paso a Paso
1. Ejecuta `ls -la /usr/bin/passwd` → observa el bit SUID (s)
2. Ejecuta `chmod u+s mi_ejecutable` → activa SUID
3. Ejecuta `ls -la mi_ejecutable` → ve el 's' en owner
4. Ejecuta `find /home/student -perm /4000` → busca SUID""",
        "goal_description": "Comprender los bits especiales SUID, SGID y Sticky Bit, cómo se activan y cuándo se usan en administración de sistemas Linux.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/mi_ejecutable", "content": "#!/bin/bash\nwhoami"},
                {"path": "/home/student/programa", "content": "#!/bin/bash\nid"}
            ],
            "directories": ["/home/student/compartido"],
            "commands": [
                "chmod 755 /home/student/mi_ejecutable",
                "chmod 755 /home/student/programa"
            ]
        }),
        "validation_command": "stat -c '%a' /home/student/mi_ejecutable",
        "expected_result": "4755",
        "challenges": [
            {
                "id": "CL26_C1",
                "title": "Activa el bit SUID en mi_ejecutable",
                "description": "Activa el bit SUID en mi_ejecutable usando chmod. El resultado debe ser permisos 4755 (-rwsr-xr-x).",
                "v_type": "permission_set",
                "v_value": "4755",
                "v_extra": "/home/student/mi_ejecutable",
                "order_index": 1,
                "xp": 70,
                "hints": "Opción 1 (octal): chmod 4755 mi_ejecutable|Opción 2 (simbólico): chmod u+s mi_ejecutable"
            },
            {
                "id": "CL26_C2",
                "title": "Activa el Sticky Bit en compartido/",
                "description": "Activa el sticky bit en el directorio compartido/ para que solo el propietario pueda borrar sus archivos.",
                "v_type": "permission_set",
                "v_value": "1755",
                "v_extra": "/home/student/compartido",
                "order_index": 2,
                "xp": 60,
                "hints": "Opción 1 (octal): chmod 1755 compartido/|Opción 2 (simbólico): chmod +t compartido/"
            }
        ]
    },
    {
        "order_index": 7,
        "title": "ACL: Listas de Control de Acceso",
        "difficulty": "hard",
        "category": "Linux",
        "xp_reward": 190,
        "time_limit": 30,
        "description": """## Teoría: Access Control Lists (ACL)

Las ACL extienden el sistema de permisos Unix clásico (user/group/others) permitiendo asignar permisos a usuarios y grupos específicos.

### ¿Cuándo usar ACL?
Los permisos Unix clásicos tienen limitaciones:
- Solo puedes asignar permisos a UN usuario y UN grupo
- Con ACL puedes dar permisos a múltiples usuarios/grupos individuales

### Comandos de ACL
```bash
getfacl archivo.txt             # Ver ACL del archivo
setfacl -m u:usuario:rw archivo.txt   # Dar rw al usuario específico
setfacl -m g:grupo:r archivo.txt      # Dar r al grupo específico
setfacl -x u:usuario archivo.txt      # Eliminar ACL de ese usuario
setfacl -b archivo.txt               # Eliminar TODAS las ACL
```

### Notación de setfacl
```
setfacl -m [tipo]:[nombre]:[permisos] archivo

tipo:
  u → usuario específico
  g → grupo específico
  o → otros
  m → máscara

Ejemplos:
setfacl -m u:ana:rwx proyecto/        # Ana tiene rwx
setfacl -m u:luis:r-- informe.pdf     # Luis solo puede leer
setfacl -m g:devs:rx scripts/         # Grupo devs: r-x
```

### Leer la salida de getfacl
```
# file: archivo.txt
# owner: student
# group: student
user::rw-              → owner
user:ana:rwx           → ACL para usuario 'ana'
group::r--             → grupo propietario
group:devs:r-x         → ACL para grupo 'devs'
mask::rwx              → máscara efectiva
other::r--             → otros
```

### ACL por defecto en directorios
```bash
setfacl -d -m u:ana:rwx proyecto/   # ACL heredada por nuevos archivos
```

### Verificar si un sistema soporta ACL
```bash
mount | grep acl      # Debe aparecer 'acl' en las opciones
tune2fs -l /dev/sda1 | grep features
```

### Guía Paso a Paso
1. Ejecuta `getfacl documento.txt` → ve los permisos actuales
2. Ejecuta `setfacl -m u:student:rwx documento.txt` → añade ACL
3. Ejecuta `getfacl documento.txt` → ve la ACL añadida
4. Ejecuta `setfacl -b documento.txt` → elimina todas las ACL""",
        "goal_description": "Entender el sistema de ACL para asignar permisos granulares a múltiples usuarios y grupos en archivos Linux.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/documento.txt", "content": "Documento con control de acceso avanzado"},
                {"path": "/home/student/proyecto_acl.txt", "content": "Este archivo tendrá ACLs especiales"}
            ]
        }),
        "validation_command": "getfacl /home/student/documento.txt | grep -c 'user'",
        "expected_result": "1",
        "challenges": [
            {
                "id": "CL27_C1",
                "title": "Consulta las ACL de documento.txt",
                "description": "Usa getfacl para ver las listas de control de acceso de documento.txt.",
                "v_type": "file_exists_in_directory",
                "v_value": "documento.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 50,
                "hints": "Usa: getfacl documento.txt|Verás el propietario, grupo y otros"
            }
        ]
    },
    {
        "order_index": 8,
        "title": "Seguridad: Auditoría de Permisos del Sistema",
        "difficulty": "hard",
        "category": "Linux",
        "xp_reward": 200,
        "time_limit": 35,
        "description": """## Teoría: Auditoría de Permisos en Linux

Un administrador de sistemas debe revisar periódicamente los permisos para detectar configuraciones inseguras.

### Buscar archivos peligrosos con find

```bash
# Archivos con SUID (se ejecutan como root)
find / -perm /4000 -type f 2>/dev/null

# Archivos con SGID
find / -perm /2000 -type f 2>/dev/null

# Archivos world-writable (cualquiera puede escribir)
find / -perm -o+w -type f 2>/dev/null

# Archivos sin propietario (huérfanos)
find / -nouser -type f 2>/dev/null

# Archivos sin grupo
find / -nogroup -type f 2>/dev/null

# Archivos con permisos 777
find / -perm 777 -type f 2>/dev/null
```

### Auditar el directorio home
```bash
# Archivos world-readable en el home
find /home -perm -o+r -type f 2>/dev/null

# Claves SSH con permisos incorrectos (deben ser 600)
find /home -name "id_rsa" -not -perm 600 2>/dev/null
find /home -name "*.key" -not -perm 600 2>/dev/null
```

### Verificar archivos críticos del sistema
```bash
# /etc/passwd debe ser 644
stat -c '%a %n' /etc/passwd

# /etc/shadow debe ser 640 o 000
stat -c '%a %n' /etc/shadow

# /etc/sudoers debe ser 440
stat -c '%a %n' /etc/sudoers
```

### Script de auditoría básico
```bash
#!/bin/bash
echo "=== Archivos SUID ==="
find /home/student -perm /4000 -type f 2>/dev/null

echo "=== Archivos world-writable ==="
find /home/student -perm -o+w -type f 2>/dev/null

echo "=== Archivos sin propietario ==="
find /home/student -nouser -type f 2>/dev/null
```

### Guía Paso a Paso
1. Ejecuta `find /home/student -perm /4000 -type f` → busca SUID
2. Ejecuta `find /home/student -perm -o+w -type f` → archivos world-writable
3. Identifica los archivos problemáticos
4. Corrige los permisos con chmod""",
        "goal_description": "Aprender técnicas de auditoría de permisos en Linux para detectar y corregir configuraciones inseguras en el sistema de archivos.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/clave.key", "content": "PRIVATE KEY DATA"},
                {"path": "/home/student/inseguro.sh", "content": "#!/bin/bash\necho 'script inseguro'"},
                {"path": "/home/student/config_web.conf", "content": "db_password=admin123"},
                {"path": "/home/student/normal.txt", "content": "Archivo con permisos correctos"}
            ],
            "commands": [
                "chmod 777 /home/student/inseguro.sh",
                "chmod 777 /home/student/config_web.conf",
                "chmod 644 /home/student/clave.key",
                "chmod 644 /home/student/normal.txt"
            ]
        }),
        "validation_command": "find /home/student -perm 777 -type f | wc -l",
        "expected_result": "2",
        "challenges": [
            {
                "id": "CL28_C1",
                "title": "Encuentra los archivos con permisos 777",
                "description": "Usa find para localizar todos los archivos con permisos 777 en /home/student. ¿Cuántos hay?",
                "v_type": "file_exists_in_directory",
                "v_value": "inseguro.sh",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 50,
                "hints": "Usa: find /home/student -perm 777 -type f|Los archivos world-writable son un riesgo de seguridad"
            },
            {
                "id": "CL28_C2",
                "title": "Corrige los permisos inseguros",
                "description": "Corrige los permisos: inseguro.sh debe ser 755, config_web.conf debe ser 600 y clave.key debe ser 600.",
                "v_type": "permission_set",
                "v_value": "600",
                "v_extra": "/home/student/config_web.conf",
                "order_index": 2,
                "xp": 60,
                "hints": "Usa chmod para cada archivo: chmod 755 inseguro.sh, chmod 600 config_web.conf, chmod 600 clave.key"
            }
        ]
    },
    {
        "order_index": 9,
        "title": "Atributos de Archivo: chattr y lsattr",
        "difficulty": "hard",
        "category": "Linux",
        "xp_reward": 185,
        "time_limit": 25,
        "description": """## Teoría: Atributos Especiales de Archivos

Más allá de los permisos rwx, Linux (en sistemas ext2/ext3/ext4) permite asignar **atributos especiales** a archivos que el propio root no puede saltarse sin quitarlos primero.

### `lsattr` — Ver atributos
```bash
lsattr archivo.txt          # Ver atributos de un archivo
lsattr -a                   # Ver todos (incluyendo ocultos)
lsattr -d directorio/       # Atributos del directorio (no su contenido)
```

### `chattr` — Cambiar atributos
```bash
chattr +i archivo.txt       # Immutable: no se puede modificar/borrar
chattr -i archivo.txt       # Quitar immutable
chattr +a log.txt           # Append-only: solo se puede añadir
chattr -a log.txt           # Quitar append-only
chattr +u archivo.txt       # Undeletable: se puede recuperar al borrar
```

### Atributos más importantes
| Atributo | Letra | Efecto |
|----------|-------|--------|
| Immutable | `i` | No puede modificarse, renombrarse ni borrarse (ni root) |
| Append only | `a` | Solo se puede añadir al final del archivo |
| No dump | `d` | Excluido de los backups con dump |
| Sync | `S` | Los cambios se escriben inmediatamente a disco |
| Undeletable | `u` | Contenido recuperable tras borrado |

### Salida de lsattr
```
----i--------e-- archivo.txt     → tiene el atributo 'i' (immutable)
-------------e-- normal.txt      → sin atributos especiales
-----a-------e-- log.txt         → tiene 'a' (append-only)
```

### Caso de uso real
```bash
# Proteger archivos de configuración críticos
chattr +i /etc/resolv.conf        # Evitar que se sobreescriba
chattr +i /etc/hosts              # Proteger hosts

# Logs seguros (solo se puede añadir, no modificar)
chattr +a /var/log/audit.log
```

### Guía Paso a Paso
1. Ejecuta `lsattr` → ve los atributos actuales
2. Ejecuta `chattr +i protegido.txt` → lo hace inmutable
3. Intenta `rm protegido.txt` → verás que falla
4. Ejecuta `chattr -i protegido.txt` → quita el atributo
5. Ahora sí puedes borrarlo""",
        "goal_description": "Conocer los atributos especiales de archivos en Linux (chattr/lsattr) como el bit immutable, que proporciona protección más allá de los permisos rwx.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/protegido.txt", "content": "Este archivo será protegido con chattr +i"},
                {"path": "/home/student/log_seguro.txt", "content": "Entrada inicial del log\n"}
            ]
        }),
        "validation_command": "lsattr /home/student/protegido.txt | grep -c 'i'",
        "expected_result": "1",
        "challenges": [
            {
                "id": "CL29_C1",
                "title": "Protege protegido.txt con el atributo immutable",
                "description": "Usa chattr para activar el atributo 'immutable' (+i) en protegido.txt. Luego verifica con lsattr.",
                "v_type": "file_exists_in_directory",
                "v_value": "protegido.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 70,
                "hints": "Usa: chattr +i protegido.txt|Verifica: lsattr protegido.txt (verás la 'i')"
            }
        ]
    },
    {
        "order_index": 10,
        "title": "Escenario Real: Configuración Segura de un Servidor",
        "difficulty": "hard",
        "category": "Linux",
        "xp_reward": 220,
        "time_limit": 40,
        "description": """## Teoría: Hardening de Permisos en un Servidor

Este laboratorio simula la configuración de permisos en un servidor real siguiendo las mejores prácticas de seguridad.

### Estructura típica de una aplicación web
```
/home/student/webapp/
├── public/          → 755 (el servidor web necesita leer)
│   ├── index.html   → 644
│   └── static/      → 755
├── config/          → 750 (solo owner y grupo)
│   └── db.conf      → 640 (secreto de base de datos)
├── logs/            → 750
│   └── access.log   → 640
├── scripts/         → 750
│   ├── deploy.sh    → 750 (ejecutable solo para owner+grupo)
│   └── backup.sh    → 750
└── private/         → 700 (solo el owner)
    └── ssl.key      → 600
```

### Reglas de oro
1. **Principio de mínimo privilegio**: da solo los permisos necesarios
2. **Archivos de config**: nunca world-readable si contienen secretos
3. **Claves privadas**: siempre `600`
4. **Scripts**: `750` o `755` según si el grupo debe ejecutar
5. **Logs**: `640` o `644` según política de seguridad
6. **Directorios públicos**: `755`
7. **Directorios privados**: `700` o `750`

### Comandos de configuración masiva
```bash
# Configurar toda la estructura de una vez
find webapp/ -type d -exec chmod 755 {} \;      # Directorios
find webapp/ -type f -exec chmod 644 {} \;      # Archivos
chmod -R 750 webapp/scripts/                    # Scripts
chmod 600 webapp/private/ssl.key                # Clave
chmod 640 webapp/config/db.conf                 # Config secreta
```

### Guía Paso a Paso
1. Observa la estructura con `ls -laR webapp/`
2. Aplica chmod 644 a los archivos HTML públicos
3. Protege db.conf con chmod 640
4. Protege ssl.key con chmod 600
5. Haz ejecutables los scripts con chmod 750
6. Verifica con `ls -laR webapp/`""",
        "goal_description": "Aplicar todos los conocimientos de permisos en un escenario real de servidor web, configurando la seguridad correctamente en una estructura de directorios compleja.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "directories": [
                "/home/student/webapp",
                "/home/student/webapp/public",
                "/home/student/webapp/config",
                "/home/student/webapp/logs",
                "/home/student/webapp/scripts",
                "/home/student/webapp/private"
            ],
            "files": [
                {"path": "/home/student/webapp/public/index.html", "content": "<html><body>Mi App</body></html>"},
                {"path": "/home/student/webapp/config/db.conf", "content": "db_host=localhost\ndb_user=appuser\ndb_pass=SuperSecreta123"},
                {"path": "/home/student/webapp/logs/access.log", "content": "192.168.1.1 GET /index.html 200"},
                {"path": "/home/student/webapp/scripts/deploy.sh", "content": "#!/bin/bash\necho 'Desplegando...'"},
                {"path": "/home/student/webapp/scripts/backup.sh", "content": "#!/bin/bash\necho 'Haciendo backup...'"},
                {"path": "/home/student/webapp/private/ssl.key", "content": "-----BEGIN PRIVATE KEY-----\nMIIEvQ..."}
            ],
            "commands": [
                "chmod 777 /home/student/webapp/config/db.conf",
                "chmod 777 /home/student/webapp/private/ssl.key",
                "chmod 644 /home/student/webapp/scripts/deploy.sh"
            ]
        }),
        "validation_command": "stat -c '%a' /home/student/webapp/private/ssl.key",
        "expected_result": "600",
        "challenges": [
            {
                "id": "CL30_C1",
                "title": "Protege la clave SSL",
                "description": "ssl.key tiene permisos 777 (¡peligroso!). Ajústalo a 600.",
                "v_type": "permission_set",
                "v_value": "600",
                "v_extra": "/home/student/webapp/private/ssl.key",
                "order_index": 1,
                "xp": 40,
                "hints": "Usa: chmod 600 webapp/private/ssl.key"
            },
            {
                "id": "CL30_C2",
                "title": "Protege la configuración de base de datos",
                "description": "db.conf tiene permisos 777. Ajústalo a 640 (solo owner puede leer/escribir, grupo puede leer).",
                "v_type": "permission_set",
                "v_value": "640",
                "v_extra": "/home/student/webapp/config/db.conf",
                "order_index": 2,
                "xp": 45,
                "hints": "Usa: chmod 640 webapp/config/db.conf"
            },
            {
                "id": "CL30_C3",
                "title": "Haz ejecutables los scripts",
                "description": "deploy.sh tiene permisos 644 (no ejecutable). Ajústalo a 750.",
                "v_type": "permission_set",
                "v_value": "750",
                "v_extra": "/home/student/webapp/scripts/deploy.sh",
                "order_index": 3,
                "xp": 40,
                "hints": "Usa: chmod 750 webapp/scripts/deploy.sh"
            }
        ]
    }
]

# ─────────────────────────────────────────────────────
# MÓDULO 4 — Procesos y Sistema (10 labs)
# ─────────────────────────────────────────────────────
M4_LABS = [
    {
        "order_index": 1,
        "title": "Ver Procesos: ps y pgrep",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 130,
        "time_limit": 20,
        "description": """## Teoría: Gestión de Procesos en Linux

Un proceso es un programa en ejecución. Cada proceso tiene un PID (Process ID) único.

### `ps` — Process Status
```bash
ps                    # Procesos de tu sesión actual
ps aux                # TODOS los procesos del sistema (formato BSD)
ps -ef                # TODOS los procesos (formato UNIX)
ps -u student         # Procesos del usuario student
ps -p 1234            # Proceso con PID 1234
ps --forest           # Árbol de procesos
```

### Columnas de `ps aux`
```
USER   PID  %CPU %MEM    VSZ   RSS TTY  STAT  START  TIME COMMAND
root     1   0.0  0.2  22560  4096 ?    Ss   Jan10   0:01 /sbin/init
student 142   0.1  0.5   5120  1024 pts/0 S+  10:00   0:00 bash
```
- **PID**: ID del proceso
- **%CPU**: uso de CPU
- **%MEM**: uso de memoria
- **STAT**: estado (R=running, S=sleeping, Z=zombie, T=stopped)
- **COMMAND**: nombre del proceso

### `pgrep` — Buscar PIDs por nombre
```bash
pgrep bash            # PID(s) de procesos bash
pgrep -l bash         # PID + nombre
pgrep -u student      # PIDs de procesos del usuario student
pgrep -a bash         # PID + comando completo
```

### `pidof` — PID de un programa específico
```bash
pidof bash            # PID de bash
pidof nginx           # PID del servidor nginx
```

### `top` y `htop` — Monitor interactivo
```bash
top                   # Monitor en tiempo real (q para salir)
```
Dentro de top:
- `q` → salir
- `k` → matar proceso (pide PID)
- `M` → ordenar por memoria
- `P` → ordenar por CPU

### Guía Paso a Paso
1. Ejecuta `ps` → procesos de tu sesión
2. Ejecuta `ps aux` → todos los procesos
3. Ejecuta `pgrep bash` → PID de bash
4. Ejecuta `ps aux | grep bash` → filtra con grep""",
        "goal_description": "Aprender a listar y buscar procesos en Linux con ps, pgrep y pidof, entendiendo la información que proporcionan.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/README.txt", "content": "Practica visualizando procesos del sistema.\nUsa ps aux, pgrep y top para explorar los procesos en ejecución."}
            ]
        }),
        "validation_command": "ps aux | grep -c bash",
        "expected_result": "2",
        "challenges": [
            {
                "id": "CL31_C1",
                "title": "Lista todos los procesos del sistema",
                "description": "Usa ps con las opciones correctas para ver TODOS los procesos del sistema con usuario, PID, CPU y memoria.",
                "v_type": "file_exists_in_directory",
                "v_value": "README.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 30,
                "hints": "Usa: ps aux|También: ps -ef en formato UNIX"
            },
            {
                "id": "CL31_C2",
                "title": "Encuentra el PID de bash",
                "description": "Usa pgrep para encontrar el PID del proceso bash activo.",
                "v_type": "file_exists_in_directory",
                "v_value": "README.txt",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 30,
                "hints": "Usa: pgrep bash|O: ps aux | grep bash"
            }
        ]
    },
    {
        "order_index": 2,
        "title": "Señales: kill, killall y pkill",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 160,
        "time_limit": 25,
        "description": """## Teoría: Enviar Señales a Procesos

Las señales son mensajes que el sistema operativo envía a los procesos para controlar su comportamiento.

### Señales más importantes
| Número | Nombre | Efecto |
|--------|--------|--------|
| 1 | SIGHUP | Recargar configuración |
| 2 | SIGINT | Interrumpir (Ctrl+C) |
| 9 | SIGKILL | Matar inmediatamente (no ignorable) |
| 15 | SIGTERM | Terminar graciosamente (por defecto) |
| 18 | SIGCONT | Continuar proceso suspendido |
| 19 | SIGSTOP | Suspender proceso (no ignorable) |

### `kill` — Enviar señal por PID
```bash
kill 1234              # Envía SIGTERM (15) al PID 1234
kill -9 1234           # Envía SIGKILL (9) — fuerza el cierre
kill -15 1234          # Envía SIGTERM explícitamente
kill -SIGTERM 1234     # Por nombre de señal
kill -l                # Lista todas las señales
```

### `killall` — Matar por nombre de proceso
```bash
killall firefox        # Mata todos los procesos firefox
killall -9 mi_script   # SIGKILL a todos los mi_script
killall -u student     # Mata todos los procesos del usuario student
```

### `pkill` — Matar por patrón
```bash
pkill bash             # Mata procesos cuyo nombre contiene 'bash'
pkill -9 mi_app        # SIGKILL por nombre
pkill -u student       # Mata los del usuario student
```

### Estrategia correcta para terminar procesos
1. **Primero**: `kill PID` (SIGTERM) → espera que el proceso limpie y termine
2. **Si no termina**: `kill -9 PID` (SIGKILL) → lo mata inmediatamente

### ⚠️ Cuidado con kill -9
- No permite al proceso limpiar sus recursos
- Puede dejar archivos bloqueados, conexiones abiertas, etc.
- Úsalo solo si SIGTERM no funciona

### Guía Paso a Paso
1. Lanza un proceso: `sleep 300 &` → se queda en background
2. Ejecuta `pgrep sleep` → obtén su PID
3. Ejecuta `kill PID` → envía SIGTERM
4. Verifica con `pgrep sleep` → ya no existe""",
        "goal_description": "Dominar el envío de señales a procesos con kill, killall y pkill para controlar la terminación de programas de forma segura.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/README.txt", "content": "Practica matando procesos con kill, killall y pkill.\nLanza procesos en background con: sleep 300 &"}
            ]
        }),
        "validation_command": "kill -l | grep -c SIGTERM",
        "expected_result": "1",
        "challenges": [
            {
                "id": "CL32_C1",
                "title": "Lanza y mata un proceso sleep",
                "description": "Lanza 'sleep 300 &' en background, obtén su PID con pgrep, y mátalo con kill. Verifica que ya no existe.",
                "v_type": "file_exists_in_directory",
                "v_value": "README.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 60,
                "hints": "1. sleep 300 &   2. pgrep sleep   3. kill [PID]   4. pgrep sleep (no debe aparecer)"
            }
        ]
    },
    {
        "order_index": 3,
        "title": "Background y Foreground: jobs, bg, fg",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 160,
        "time_limit": 25,
        "description": """## Teoría: Control de Trabajos (Job Control)

El shell permite gestionar múltiples procesos, enviándolos al fondo (background) o trayéndolos al frente (foreground).

### Ejecutar en background con `&`
```bash
sleep 100 &             # Lanza en background, muestra PID
wget url &              # Descarga en background (sin bloquear)
./script.sh &           # Script en background
```

### `jobs` — Ver trabajos del shell
```bash
jobs                    # Lista trabajos de la sesión
jobs -l                 # Con PIDs
```
Salida:
```
[1]   Running    sleep 100 &
[2]-  Stopped    vi archivo.txt
[3]+  Running    ./script.sh &
```
- `+` → trabajo "actual" (el que fg traerá por defecto)
- `-` → trabajo "anterior"

### `fg` — Traer al foreground
```bash
fg                      # Trae el trabajo marcado con +
fg %1                   # Trae el trabajo número 1
fg %sleep               # Trae el trabajo que empieza por 'sleep'
```

### `bg` — Mandar al background
```bash
bg                      # Reanuda en background el trabajo pausado
bg %2                   # Reanuda el trabajo 2 en background
```

### Flujo típico
```bash
./proceso_largo.sh      # Lanza en foreground (bloquea el terminal)
[Ctrl+Z]               # Suspende el proceso (SIGSTOP)
jobs                    # Ve que está Stopped
bg                      # Lo reanuda en background
# Sigues trabajando...
fg                      # Lo traes de vuelta al foreground
```

### `nohup` — Proceso resistente al cierre de sesión
```bash
nohup ./script.sh &              # Continúa aunque cierres el terminal
nohup ./script.sh > salida.log & # Redirige salida
```

### Guía Paso a Paso
1. Ejecuta `sleep 200 &` → proceso en background
2. Ejecuta `sleep 300 &` → otro proceso en background
3. Ejecuta `jobs -l` → ve ambos procesos con PIDs
4. Ejecuta `fg %1` → trae el primero al frente
5. Pulsa Ctrl+Z → suspéndelo
6. Ejecuta `bg` → lo reanuda en background""",
        "goal_description": "Dominar el control de trabajos en Linux: ejecutar procesos en background (&), gestionarlos con jobs, fg y bg.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/proceso_largo.sh", "content": "#!/bin/bash\necho 'Iniciando proceso largo...'\nsleep 999\necho 'Proceso completado'"},
            ],
            "commands": ["chmod +x /home/student/proceso_largo.sh"]
        }),
        "validation_command": "sleep 1 & jobs | grep -c 'Running'",
        "expected_result": "1",
        "challenges": [
            {
                "id": "CL33_C1",
                "title": "Lanza dos procesos en background",
                "description": "Lanza 'sleep 200 &' y 'sleep 300 &'. Luego ejecuta 'jobs' para ver ambos procesos listados.",
                "v_type": "file_exists_in_directory",
                "v_value": "proceso_largo.sh",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 50,
                "hints": "sleep 200 & (Enter) sleep 300 & (Enter) jobs"
            }
        ]
    },
    {
        "order_index": 4,
        "title": "Información del Sistema: uname, uptime, df, free",
        "difficulty": "easy",
        "category": "Linux",
        "xp_reward": 130,
        "time_limit": 20,
        "description": """## Teoría: Comandos de Información del Sistema

Un sysadmin necesita conocer el estado del sistema en todo momento.

### `uname` — Información del kernel y sistema
```bash
uname -a        # Toda la información: kernel, hostname, arquitectura
uname -r        # Solo versión del kernel
uname -m        # Arquitectura (x86_64, arm64...)
uname -s        # Nombre del sistema operativo
uname -n        # Hostname
```

### `hostname` — Nombre del equipo
```bash
hostname            # Muestra el hostname
hostname -I         # Muestra las IPs del sistema
```

### `uptime` — Tiempo en funcionamiento
```bash
uptime
# 10:30:00 up 5 days, 3:20, 2 users, load average: 0.05, 0.03, 0.01
#           └─ tiempo encendido  └─ usuarios  └─ carga en 1,5,15 min
```

### `who` y `w` — Usuarios conectados
```bash
who             # Quién está conectado
w               # Con más detalle (incluye carga y procesos)
whoami          # Quién soy yo
id              # UID, GID y grupos del usuario actual
```

### `df` — Espacio en disco
```bash
df -h               # Espacio en todos los discos (human-readable)
df -h /             # Solo el disco raíz
df -h /home         # Solo /home
df -i               # Inodes en lugar de espacio
```

### `du` — Uso de disco por directorio
```bash
du -sh directorio/      # Tamaño total del directorio
du -sh *                # Tamaño de cada elemento actual
du -h --max-depth=1 /   # Nivel 1 de la raíz
du -sh /home/*          # Tamaño del home de cada usuario
```

### `free` — Memoria RAM
```bash
free -h                 # Memoria RAM y swap (human-readable)
free -m                 # En megabytes
```

### Guía Paso a Paso
1. Ejecuta `uname -a` → info completa del sistema
2. Ejecuta `uptime` → tiempo activo y carga
3. Ejecuta `df -h` → espacio en disco
4. Ejecuta `free -h` → uso de memoria
5. Ejecuta `du -sh /home/student` → tamaño de tu home""",
        "goal_description": "Dominar los comandos de información del sistema (uname, uptime, df, du, free) para monitorizar el estado de un servidor Linux.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/info.txt", "content": "Recopila información del sistema en este lab.\nuname -a, uptime, df -h, free -h"}
            ]
        }),
        "validation_command": "uname -s",
        "expected_result": "Linux",
        "challenges": [
            {
                "id": "CL34_C1",
                "title": "¿Cuánto espacio libre hay en disco?",
                "description": "Usa df -h para ver el espacio disponible en todos los sistemas de archivos montados.",
                "v_type": "file_exists_in_directory",
                "v_value": "info.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 30,
                "hints": "Usa: df -h|La columna 'Avail' muestra el espacio disponible"
            },
            {
                "id": "CL34_C2",
                "title": "¿Cuánta RAM tiene el sistema?",
                "description": "Usa free para ver la memoria RAM total, usada y disponible del sistema.",
                "v_type": "file_exists_in_directory",
                "v_value": "info.txt",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 30,
                "hints": "Usa: free -h|El flag -h muestra los valores en formato legible (MB/GB)"
            }
        ]
    },
    {
        "order_index": 5,
        "title": "Logs del Sistema: journalctl y /var/log",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 160,
        "time_limit": 25,
        "description": """## Teoría: Logs del Sistema en Linux

Los logs son registros de eventos del sistema. Son esenciales para depurar problemas y auditar la seguridad.

### Directorio /var/log
```bash
ls /var/log/            # Ver todos los logs del sistema
```
Logs importantes:
- `/var/log/syslog` → log general del sistema (Debian/Ubuntu)
- `/var/log/auth.log` → autenticación y sudo
- `/var/log/kern.log` → mensajes del kernel
- `/var/log/dmesg` → mensajes de arranque del hardware
- `/var/log/apt/` → historial de instalaciones apt

### Leer logs con tail
```bash
tail -f /var/log/syslog          # Seguir el log en tiempo real
tail -n 50 /var/log/auth.log     # Últimas 50 líneas
```

### `journalctl` — Logs de systemd (sistemas modernos)
```bash
journalctl                       # Todo el journal
journalctl -n 20                 # Últimas 20 líneas
journalctl -f                    # Seguir en tiempo real
journalctl -b                    # Solo del último arranque
journalctl -p err                # Solo errores (priorities: debug,info,warning,err,crit)
journalctl --since "1 hour ago"  # Última hora
journalctl --since "2024-01-10"  # Desde fecha
journalctl -u ssh                # Solo del servicio ssh
```

### Analizar logs con grep y awk
```bash
# Buscar errores SSH
grep "Failed password" /var/log/auth.log

# IPs que intentaron acceder
grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn

# Errores en syslog
grep "error" /var/log/syslog | tail -20
```

### `dmesg` — Mensajes del kernel
```bash
dmesg                   # Todos los mensajes del kernel
dmesg | tail -20        # Últimos mensajes
dmesg | grep -i error   # Solo errores
dmesg -T                # Con timestamp legible
```

### Guía Paso a Paso
1. Ejecuta `ls /var/log/` → ve los archivos de log
2. Ejecuta `cat /home/student/app.log` → log simulado
3. Ejecuta `grep 'ERROR' /home/student/app.log | wc -l` → cuenta errores
4. Ejecuta `tail -5 /home/student/app.log` → últimas entradas""",
        "goal_description": "Aprender a leer y analizar logs del sistema Linux con tail, journalctl, grep y dmesg para diagnosticar problemas.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/app.log", "content": "\n".join([
                    "2024-01-10 09:00:00 INFO: Aplicación iniciada",
                    "2024-01-10 09:01:00 INFO: Base de datos conectada",
                    "2024-01-10 09:05:00 WARNING: Alto uso de CPU (85%)",
                    "2024-01-10 09:10:00 ERROR: Timeout en conexión a API externa",
                    "2024-01-10 09:15:00 INFO: Retry exitoso",
                    "2024-01-10 09:20:00 ERROR: Disco casi lleno (95%)",
                    "2024-01-10 09:25:00 CRITICAL: Servicio de email caído",
                    "2024-01-10 09:30:00 INFO: Backup iniciado",
                    "2024-01-10 09:35:00 WARNING: Memoria al 80%",
                    "2024-01-10 09:40:00 ERROR: Fallo al escribir en /tmp"
                ])},
                {"path": "/home/student/auth_simulado.log", "content": "\n".join([
                    "Jan 10 09:00:01 server sshd[1234]: Failed password for root from 10.0.0.5 port 22 ssh2",
                    "Jan 10 09:00:02 server sshd[1234]: Failed password for admin from 10.0.0.5 port 22 ssh2",
                    "Jan 10 09:00:03 server sshd[1234]: Failed password for root from 10.0.0.5 port 22 ssh2",
                    "Jan 10 09:01:00 server sshd[1235]: Accepted password for student from 192.168.1.10 port 22 ssh2"
                ])}
            ]
        }),
        "validation_command": "grep -c 'ERROR' /home/student/app.log",
        "expected_result": "3",
        "challenges": [
            {
                "id": "CL35_C1",
                "title": "Cuenta los errores en el log",
                "description": "Usa grep para contar cuántas líneas contienen 'ERROR' en app.log.",
                "v_type": "file_exists_in_directory",
                "v_value": "app.log",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 35,
                "hints": "Usa: grep -c 'ERROR' app.log|El flag -c cuenta las coincidencias"
            },
            {
                "id": "CL35_C2",
                "title": "Identifica el IP del atacante",
                "description": "En auth_simulado.log hay intentos fallidos de login. ¿Desde qué IP se realizaron?",
                "v_type": "file_exists_in_directory",
                "v_value": "auth_simulado.log",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 45,
                "hints": "Usa: grep 'Failed password' auth_simulado.log|Busca el campo 'from' en cada línea"
            }
        ]
    },
    {
        "order_index": 6,
        "title": "Cron: Programar Tareas Automáticas",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 175,
        "time_limit": 30,
        "description": """## Teoría: Cron — Planificador de Tareas

`cron` es el demonio que ejecuta tareas automáticamente según un horario definido.

### Formato de crontab
```
* * * * * comando_a_ejecutar
│ │ │ │ │
│ │ │ │ └── Día de la semana (0-7, 0 y 7=domingo)
│ │ │ └──── Mes (1-12)
│ │ └────── Día del mes (1-31)
│ └──────── Hora (0-23)
└────────── Minuto (0-59)
```

### Operadores de cron
- `*` → cualquier valor
- `,` → lista: `1,3,5` (en minutos 1, 3 y 5)
- `-` → rango: `1-5` (de minuto 1 a 5)
- `/` → cada: `*/15` (cada 15 minutos)

### Ejemplos de crontab
```bash
# Cada minuto
* * * * * /home/student/script.sh

# Cada día a las 2:30 AM
30 2 * * * /home/student/backup.sh

# Cada lunes a las 9:00 AM
0 9 * * 1 /home/student/reporte.sh

# Cada 15 minutos
*/15 * * * * /home/student/check.sh

# Primer día de cada mes a medianoche
0 0 1 * * /home/student/mensual.sh

# Lunes a viernes a las 8 AM
0 8 * * 1-5 /home/student/diario.sh
```

### Gestionar el crontab
```bash
crontab -l          # Ver las tareas programadas
crontab -e          # Editar el crontab (abre el editor)
crontab -r          # Eliminar TODAS las tareas (¡cuidado!)
crontab -u student -l   # Ver crontab de otro usuario (como root)
```

### Salida de cron
Por defecto, cron envía el resultado por email. Para evitarlo:
```bash
*/5 * * * * /home/student/script.sh >> /var/log/mi_cron.log 2>&1
*/5 * * * * /home/student/script.sh > /dev/null 2>&1
```

### Variables especiales en crontab
```bash
@reboot  /home/student/startup.sh    # Al iniciar el sistema
@daily   /home/student/diario.sh     # Una vez al día (equiv: 0 0 * * *)
@weekly  /home/student/semanal.sh    # Una vez a la semana
@monthly /home/student/mensual.sh    # Una vez al mes
```

### Guía Paso a Paso
1. Ejecuta `crontab -l` → ve las tareas actuales
2. Ejecuta `crontab -e` → abre el editor
3. Añade una línea de tarea (ej: `* * * * * date >> /tmp/test.log`)
4. Guarda y sal
5. Ejecuta `crontab -l` → verifica que se guardó""",
        "goal_description": "Aprender a programar tareas automáticas con cron, entender el formato de crontab y crear schedules para backups, reportes y mantenimiento.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/backup.sh", "content": "#!/bin/bash\nDATE=$(date +%Y%m%d)\ntar -czf /tmp/backup_$DATE.tar.gz /home/student/ 2>/dev/null\necho \"Backup completado: $DATE\""},
                {"path": "/home/student/check_disk.sh", "content": "#!/bin/bash\nUSO=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%')\nif [ $USO -gt 80 ]; then\n  echo \"ALERTA: Disco al ${USO}%\" >> /tmp/alertas.log\nfi"}
            ],
            "commands": [
                "chmod +x /home/student/backup.sh",
                "chmod +x /home/student/check_disk.sh"
            ]
        }),
        "validation_command": "crontab -l 2>/dev/null | wc -l",
        "expected_result": "0",
        "challenges": [
            {
                "id": "CL36_C1",
                "title": "Interpreta una expresión cron",
                "description": "¿Qué significa esta expresión cron? → '30 2 * * 1'   Responde: cada X a las Y horas.",
                "v_type": "file_exists_in_directory",
                "v_value": "backup.sh",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 40,
                "hints": "Formato: minuto hora dia mes dia_semana|'30 2 * * 1' = a las 2:30 AM, cada Lunes"
            }
        ]
    },
    {
        "order_index": 7,
        "title": "Variables de Entorno: export y .bashrc",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 155,
        "time_limit": 25,
        "description": """## Teoría: Variables de Entorno Avanzadas

### Alcance de las variables
```bash
MI_VAR="hola"           # Variable local (solo en este shell)
bash -c 'echo $MI_VAR'  # → vacío, el hijo no la hereda

export MI_VAR="hola"    # Variable exportada (los hijos la heredan)
bash -c 'echo $MI_VAR'  # → hola
```

### Variables importantes del sistema
```bash
echo $HOME      # /home/student
echo $PATH      # /usr/local/bin:/usr/bin:/bin
echo $USER      # student
echo $SHELL     # /bin/bash
echo $PWD       # Directorio actual
echo $OLDPWD    # Directorio anterior
echo $LANG      # es_ES.UTF-8
echo $TERM      # xterm-256color
echo $PS1       # Formato del prompt
```

### Modificar el PATH
```bash
# Añadir directorio al PATH temporalmente
export PATH=$PATH:/home/student/scripts

# Verificar
echo $PATH
which mi_script    # Ahora lo encuentra
```

### El archivo ~/.bashrc
Se ejecuta cada vez que abres una terminal interactiva:
```bash
# Añadir alias
alias ll='ls -la'
alias grep='grep --color=auto'
alias ..='cd ..'

# Variables de entorno
export EDITOR=nano
export JAVA_HOME=/usr/lib/jvm/java-11

# Modificar PATH
export PATH=$PATH:/home/student/scripts

# Funciones
mkcd() {
    mkdir -p "$1" && cd "$1"
}
```

### El archivo ~/.profile
Se ejecuta en el login (una sola vez):
```bash
# Para configuración que solo debe cargarse una vez
export NVM_DIR="$HOME/.nvm"
```

### Aplicar cambios sin reiniciar
```bash
source ~/.bashrc          # Recarga .bashrc
. ~/.bashrc               # Equivalente (punto es alias de source)
```

### Guía Paso a Paso
1. Ejecuta `echo $PATH` → ve el PATH actual
2. Crea el directorio /home/student/mis_scripts
3. Añade al PATH: `export PATH=$PATH:/home/student/mis_scripts`
4. Verifica: `echo $PATH` → debe incluir tu directorio
5. Añade un alias: `alias mi_ls='ls -la --color'`
6. Prueba el alias: `mi_ls`""",
        "goal_description": "Dominar las variables de entorno exportadas, la modificación del PATH y la personalización del entorno con ~/.bashrc.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/.bashrc", "content": "# .bashrc personalizado\nexport LANG=es_ES.UTF-8\nalias ll='ls -la'\nalias ..='cd ..'"},
                {"path": "/home/student/mis_scripts/saluda.sh", "content": "#!/bin/bash\necho \"Hola desde mis_scripts: $1\""}
            ],
            "directories": ["/home/student/mis_scripts"],
            "commands": ["chmod +x /home/student/mis_scripts/saluda.sh"]
        }),
        "validation_command": "echo $HOME",
        "expected_result": "/home/student",
        "challenges": [
            {
                "id": "CL37_C1",
                "title": "Añade mis_scripts al PATH",
                "description": "Añade el directorio /home/student/mis_scripts al PATH con export. Luego verifica con echo $PATH que aparece.",
                "v_type": "file_exists_in_directory",
                "v_value": ".bashrc",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 55,
                "hints": "Usa: export PATH=$PATH:/home/student/mis_scripts|Verifica: echo $PATH | grep mis_scripts"
            }
        ]
    },
    {
        "order_index": 8,
        "title": "Monitorización: top, vmstat y iostat",
        "difficulty": "medium",
        "category": "Linux",
        "xp_reward": 165,
        "time_limit": 25,
        "description": """## Teoría: Monitorización del Sistema en Tiempo Real

### `top` — Monitor interactivo
```bash
top                 # Inicia el monitor (q para salir)
top -b -n 1         # Modo batch: una sola instantánea
top -u student      # Solo procesos del usuario student
```

**Cabecera de top:**
```
top - 10:30:00 up 5 days, 1:20,  2 users,  load average: 0.15, 0.10, 0.05
Tasks: 150 total,   1 running, 149 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.3 us,  0.5 sy,  0.0 ni, 97.0 id,  0.2 wa,  0.0 hi,  0.0 si
MiB Mem :  2048.0 total,   512.0 free,  1024.0 used,   512.0 buff/cache
```

**Teclas en top:**
- `q` → salir
- `k` → matar proceso (introduce PID)
- `M` → ordenar por memoria
- `P` → ordenar por CPU
- `1` → ver CPUs individuales
- `h` → ayuda

### `ps` para snapshots
```bash
ps aux --sort=-%cpu | head -10    # Top 10 por CPU
ps aux --sort=-%mem | head -10    # Top 10 por memoria
ps aux | awk '{print $2, $3, $11}' | sort -k2 -rn | head -5
```

### `vmstat` — Estadísticas de memoria y CPU
```bash
vmstat                  # Instantánea
vmstat 2 5              # Cada 2 segundos, 5 veces
vmstat -s               # Resumen de estadísticas
```

### `/proc` — Sistema de archivos virtual
```bash
cat /proc/cpuinfo       # Información del procesador
cat /proc/meminfo       # Información detallada de memoria
cat /proc/loadavg       # Carga del sistema
cat /proc/uptime        # Tiempo activo en segundos
cat /proc/1/status      # Estado del proceso PID 1
```

### Guía Paso a Paso
1. Ejecuta `top -b -n 1 | head -20` → snapshot sin modo interactivo
2. Ejecuta `cat /proc/cpuinfo | grep 'model name' | head -1`
3. Ejecuta `cat /proc/meminfo | head -10`
4. Ejecuta `ps aux --sort=-%mem | head -5` → top 5 por memoria""",
        "goal_description": "Aprender a monitorizar el rendimiento del sistema en tiempo real usando top, ps avanzado y el sistema de archivos /proc.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/monitor.sh", "content": "#!/bin/bash\necho '=== CPU ==='\ncat /proc/loadavg\necho '=== Memoria ==='\nfree -h\necho '=== Disco ==='\ndf -h /"}
            ],
            "commands": ["chmod +x /home/student/monitor.sh"]
        }),
        "validation_command": "cat /proc/loadavg | wc -w",
        "expected_result": "5",
        "challenges": [
            {
                "id": "CL38_C1",
                "title": "Consulta la carga del sistema",
                "description": "Usa cat para leer /proc/loadavg y ver la carga media del sistema en 1, 5 y 15 minutos.",
                "v_type": "file_exists_in_directory",
                "v_value": "monitor.sh",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 40,
                "hints": "Usa: cat /proc/loadavg|Los tres primeros valores son la carga en 1, 5 y 15 minutos"
            }
        ]
    },
    {
        "order_index": 9,
        "title": "Systemd: Servicios del Sistema",
        "difficulty": "hard",
        "category": "Linux",
        "xp_reward": 180,
        "time_limit": 30,
        "description": """## Teoría: systemd — Gestión de Servicios

`systemd` es el sistema de init moderno en Linux (reemplazó a SysV init). Gestiona los servicios del sistema.

### `systemctl` — Controlar servicios
```bash
systemctl status nginx            # Estado del servicio nginx
systemctl start nginx             # Iniciar
systemctl stop nginx              # Parar
systemctl restart nginx           # Reiniciar
systemctl reload nginx            # Recargar configuración sin parar
systemctl enable nginx            # Activar al inicio del sistema
systemctl disable nginx           # Desactivar al inicio
systemctl is-active nginx         # ¿Está activo?
systemctl is-enabled nginx        # ¿Está habilitado al inicio?
```

### Listar servicios
```bash
systemctl list-units --type=service           # Todos los servicios
systemctl list-units --type=service --state=running  # Solo los activos
systemctl list-units --failed                 # Solo los fallidos
```

### `journalctl` — Logs de systemd
```bash
journalctl -u nginx                   # Logs del servicio nginx
journalctl -u nginx -f                # Seguir logs en tiempo real
journalctl -u nginx --since "1h ago"  # Última hora
journalctl -b -u ssh                  # Logs de ssh desde el arranque
```

### Targets (equivalente a runlevels)
```bash
systemctl get-default                 # Target por defecto
systemctl list-units --type=target    # Lista de targets
```
Targets comunes:
- `multi-user.target` → modo texto (nivel 3)
- `graphical.target` → modo gráfico (nivel 5)
- `rescue.target` → modo rescate

### Unidades de systemd (.service)
Los servicios se definen en `/etc/systemd/system/`:
```ini
[Unit]
Description=Mi Aplicación
After=network.target

[Service]
Type=simple
ExecStart=/home/student/app.sh
Restart=always
User=student

[Install]
WantedBy=multi-user.target
```

### Guía Paso a Paso
1. Ejecuta `systemctl status ssh` → estado del servicio SSH
2. Ejecuta `systemctl list-units --type=service --state=running` → servicios activos
3. Ejecuta `journalctl -n 10` → últimas 10 entradas del journal""",
        "goal_description": "Comprender systemd para gestionar servicios del sistema: iniciar, parar, habilitar y consultar logs de servicios con systemctl y journalctl.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/mi_servicio.service", "content": "[Unit]\nDescription=Mi Servicio de Prueba\nAfter=network.target\n\n[Service]\nType=simple\nExecStart=/home/student/app.sh\nRestart=on-failure\nUser=student\n\n[Install]\nWantedBy=multi-user.target"},
                {"path": "/home/student/app.sh", "content": "#!/bin/bash\nwhile true; do\n  echo \"$(date): servicio corriendo\" >> /tmp/mi_servicio.log\n  sleep 60\ndone"}
            ],
            "commands": ["chmod +x /home/student/app.sh"]
        }),
        "validation_command": "systemctl is-active ssh 2>/dev/null || echo inactive",
        "expected_result": "inactive",
        "challenges": [
            {
                "id": "CL39_C1",
                "title": "Lista los servicios activos del sistema",
                "description": "Usa systemctl para listar todos los servicios que están actualmente en estado 'running'.",
                "v_type": "file_exists_in_directory",
                "v_value": "mi_servicio.service",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 55,
                "hints": "Usa: systemctl list-units --type=service --state=running|O más simple: systemctl --state=running"
            }
        ]
    },
    {
        "order_index": 10,
        "title": "Diagnóstico: Análisis de un Sistema Comprometido",
        "difficulty": "hard",
        "category": "Linux",
        "xp_reward": 230,
        "time_limit": 45,
        "description": """## Teoría: Análisis Forense Básico en Linux

Cuando un sistema se comporta de forma anómala, el sysadmin debe diagnosticar qué ocurre usando las herramientas de la terminal.

### Pasos de diagnóstico inicial
```bash
# 1. ¿Quién está conectado?
who
last | head -20         # Últimos logins

# 2. ¿Qué procesos están corriendo?
ps aux | sort -k3 -rn | head -10   # Top CPU
ps aux | sort -k4 -rn | head -10   # Top memoria

# 3. ¿Qué hay en los logs?
tail -50 /var/log/syslog
grep -i "error\|fail\|attack" /var/log/syslog | tail -20

# 4. ¿Cuánto disco y memoria hay?
df -h
free -h

# 5. ¿Hay archivos extraños con permisos peligrosos?
find /home -perm /4000 -type f 2>/dev/null
find /tmp -type f 2>/dev/null

# 6. ¿Qué archivos se modificaron recientemente?
find /etc -newer /etc/passwd -type f 2>/dev/null
find /home -newer /etc/passwd -type f -mtime -1 2>/dev/null

# 7. ¿Hay conexiones de red abiertas?
ss -tuln              # Puertos en escucha
netstat -tuln         # Alternativa

# 8. ¿Qué hay en el crontab?
crontab -l
cat /etc/crontab
```

### Indicadores de compromiso (IoC)
- Archivos SUID inesperados en /tmp o /home
- Procesos con nombres extraños consumiendo CPU/memoria
- Conexiones de red a IPs desconocidas
- Archivos modificados recientemente en /etc
- Usuarios nuevos en /etc/passwd
- Entradas extrañas en el crontab

### Script de diagnóstico rápido
```bash
#!/bin/bash
echo "=== USUARIOS CONECTADOS ==="
who

echo "=== TOP 5 PROCESOS POR CPU ==="
ps aux --sort=-%cpu | head -6

echo "=== ARCHIVOS SUID EN /tmp ==="
find /tmp -perm /4000 -type f 2>/dev/null

echo "=== ÚLTIMAS MODIFICACIONES EN /home ==="
find /home -type f -newer /etc/passwd 2>/dev/null | head -10
```

### Guía Paso a Paso
1. Ejecuta `ps aux | sort -k3 -rn | head -5` → top CPU
2. Ejecuta `find /home/student -perm /4000` → archivos SUID
3. Ejecuta `find /tmp -type f` → archivos en tmp
4. Examina los logs de acceso: `cat /home/student/auth_log.txt`
5. Identifica los indicadores de compromiso""",
        "goal_description": "Aplicar técnicas de diagnóstico y análisis forense básico en Linux para identificar comportamientos anómalos usando herramientas de línea de comandos.",
        "step_by_step_guide": "",
        "scenario_setup": json.dumps({
            "files": [
                {"path": "/home/student/auth_log.txt", "content": "\n".join([
                    "Jan 10 22:00:01 server sshd: Failed password for root from 185.220.101.5 port 22",
                    "Jan 10 22:00:02 server sshd: Failed password for root from 185.220.101.5 port 22",
                    "Jan 10 22:00:03 server sshd: Failed password for admin from 185.220.101.5 port 22",
                    "Jan 10 22:00:10 server sshd: Failed password for root from 185.220.101.5 port 22",
                    "Jan 10 22:01:00 server sshd: Accepted password for student from 192.168.1.50 port 22",
                    "Jan 10 22:05:00 server sudo: student : TTY=pts/0 ; PWD=/home/student ; USER=root ; COMMAND=/bin/bash"
                ])},
                {"path": "/home/student/procesos_sospechosos.txt", "content": "Analiza los logs y busca:\n1. ¿Qué IP está haciendo fuerza bruta?\n2. ¿Qué usuario consiguió entrar?\n3. ¿Qué comando ejecutó con sudo?\n\nUsa grep para extraer esta información de auth_log.txt"}
            ]
        }),
        "validation_command": "grep -c 'Failed password' /home/student/auth_log.txt",
        "expected_result": "4",
        "challenges": [
            {
                "id": "CL40_C1",
                "title": "Identifica los intentos de acceso fallidos",
                "description": "Analiza auth_log.txt con grep para contar cuántos intentos de 'Failed password' hay y desde qué IP.",
                "v_type": "file_exists_in_directory",
                "v_value": "auth_log.txt",
                "v_extra": "/home/student",
                "order_index": 1,
                "xp": 60,
                "hints": "Usa: grep 'Failed password' auth_log.txt|Para contar: grep -c 'Failed password' auth_log.txt"
            },
            {
                "id": "CL40_C2",
                "title": "Encuentra el comando sudo ejecutado",
                "description": "Usa grep para encontrar la línea que muestra qué comando ejecutó student con sudo.",
                "v_type": "file_exists_in_directory",
                "v_value": "procesos_sospechosos.txt",
                "v_extra": "/home/student",
                "order_index": 2,
                "xp": 50,
                "hints": "Usa: grep 'sudo' auth_log.txt|Busca el campo COMMAND en la línea"
            }
        ]
    }
]


def seed_part2():
    db = SessionLocal()
    create_tables()

    claude_path = db.query(SkillPath).filter(SkillPath.title == "Claude Labs").first()
    if not claude_path:
        print("❌ ERROR: Skill Path 'Claude Labs' no encontrado. Ejecuta primero seed_claude_labs_part1.py")
        db.close()
        return

    m3 = db.query(Module).filter(Module.title == "CL-M3 — Permisos y Propietarios").first()
    if not m3:
        m3 = Module(
            skill_path_id=claude_path.id,
            title="CL-M3 — Permisos y Propietarios",
            description="Domina el sistema de permisos Linux: chmod, chown, umask, SUID/SGID, sticky bit y auditoría de seguridad.",
            order_index=3
        )
        db.add(m3)
        db.commit()
        db.refresh(m3)
        print(f"✅ Módulo 3 creado (id={m3.id})")

    m4 = db.query(Module).filter(Module.title == "CL-M4 — Procesos y Sistema").first()
    if not m4:
        m4 = Module(
            skill_path_id=claude_path.id,
            title="CL-M4 — Procesos y Sistema",
            description="Gestiona procesos, señales, logs del sistema, cron, systemd y herramientas de monitorización.",
            order_index=4
        )
        db.add(m4)
        db.commit()
        db.refresh(m4)
        print(f"✅ Módulo 4 creado (id={m4.id})")

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

    print("\n📦 Insertando Módulo 3 — Permisos y Propietarios...")
    insert_labs(m3, M3_LABS)

    print("\n📦 Insertando Módulo 4 — Procesos y Sistema...")
    insert_labs(m4, M4_LABS)

    db.close()
    print("\n🎉 Parte 2 completada: 20 labs insertados (Módulos 3 y 4)")


if __name__ == "__main__":
    seed_part2()
