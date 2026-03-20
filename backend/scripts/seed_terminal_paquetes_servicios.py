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

    # MODULE A: Gestión de Paquetes
    module_paquetes = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M4 — Gestión de Paquetes").first()
    if not module_paquetes:
        module_paquetes = Module(
            skill_path_id=path.id,
            title="M4 — Gestión de Paquetes",
            description="Domina la gestión de paquetes en sistemas Debian/Ubuntu. Aprende apt, dpkg, repositorios y cómo mantener tu sistema actualizado de forma segura.",
            order_index=5,
            is_active=True
        )
        db.add(module_paquetes)
        db.commit()
        db.refresh(module_paquetes)

    labs_paquetes = [
        {
            "title": "apt: El Gestor de Paquetes",
            "description": """# apt: El Gestor de Paquetes de Ubuntu

**apt** (Advanced Package Tool) es el gestor de paquetes moderno en sistemas Debian/Ubuntu. Simplifica la instalación, actualización y eliminación de software.

## Concepto: Gestión de Paquetes

Un **gestor de paquetes** automatiza la instalación de software, sus dependencias y actualizaciones.

### apt vs apt-get vs aptitude

- **apt** — Interfaz moderna y simplificada (recomendada)
- **apt-get** — Versión antigua, más verbosa
- **aptitude** — Interfaz interactiva alternativa

## Repositorios

Los paquetes se descargan de repositorios (servidores de software):
- `main` — Software oficial soportado
- `universe` — Software comunitario
- `restricted` — Drivers propietarios
- `multiverse` — Software no libre

## Operaciones Principales

### Actualizar Información
```bash
sudo apt update
```
Descarga la lista de paquetes disponibles.

### Instalar Paquetes
```bash
sudo apt install nombre-paquete
sudo apt install paquete1 paquete2 paquete3
```

### Buscar Paquetes
```bash
apt search keyword
apt search "python3"
```

### Ver Información
```bash
apt show nombre-paquete
apt show nginx
```

### Actualizar Paquetes
```bash
sudo apt upgrade
sudo apt full-upgrade
```

- `upgrade` — Actualiza sin eliminar paquetes
- `full-upgrade` — Actualiza removiendo si es necesario (más agresivo)

### Eliminar Paquetes
```bash
sudo apt remove nombre-paquete
sudo apt purge nombre-paquete
```

- `remove` — Elimina el paquete pero mantiene configuración
- `purge` — Elimina todo incluyendo configuración

### Limpiar Sistema
```bash
sudo apt autoremove
sudo apt autoclean
apt clean
```

- `autoremove` — Elimina paquetes no utilizados
- `autoclean` — Limpia caché de paquetes viejos
- `clean` — Limpia todo el caché

### Listar Paquetes
```bash
apt list --installed
apt list --upgradable
apt list
```

## Flujo de Trabajo Típico

```bash
sudo apt update          # Actualizar repo
apt search nginx         # Buscar paquete
apt show nginx           # Ver detalles
sudo apt install nginx   # Instalar
sudo apt upgrade         # Actualizar todo
```

## Instalación de Múltiples Paquetes

```bash
sudo apt install python3 python3-pip git curl vim
```

## Reinstalar un Paquete

```bash
sudo apt install --reinstall nombre-paquete
```

## Importante

- Siempre ejecuta `sudo apt update` antes de instalar
- Usa `sudo` para operaciones que modifican el sistema
- Lee los cambios que apt te propone (especialmente si elimina paquetes)""",
            "goal_description": "Aprende los conceptos fundamentales de apt y cómo instalar, buscar y actualizar paquetes.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "directories": [
                    "/home/student/paquetes"
                ]
            }),
            "step_by_step_guide": """1. Ejecuta apt update para actualizar la lista de repositorios
2. Usa apt search para buscar un paquete (ej: curl)
3. Revisa los detalles con apt show
4. Verifica paquetes instalados con apt list --installed
5. Crea un archivo en /home/student/paquetes documentando el proceso""",
            "xp_reward": 120,
            "order_index": 1,
            "time_limit": 30,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Directorio de paquetes creado",
                    "description": "El directorio /home/student/paquetes debe existir",
                    "v_type": "directory_created",
                    "v_value": "/home/student/paquetes",
                    "hints": ["mkdir -p /home/student/paquetes"]
                }
            ]
        },
        {
            "title": "Instalación y Búsqueda de Paquetes",
            "description": """# Instalación y Búsqueda de Paquetes

Antes de instalar un paquete, es importante verificar exactamente qué instalará y de dónde viene.

## apt-cache: Herramienta de Consulta

**apt-cache** te permite consultar información de paquetes sin modificar el sistema.

### Buscar Paquetes
```bash
apt-cache search python
apt-cache search "database server"
apt-cache search -n regex
```

### Ver Información Detallada
```bash
apt-cache show package-name
apt-cache show nginx
```

Muestra:
- Versión disponible
- Tamaño descargado
- Dependencias
- Descripción completa

### Ver Dependencias
```bash
apt-cache depends package-name
apt-cache depends nginx
```

### Información Inversa (qué depende de esto)
```bash
apt-cache rdepends package-name
```

## dpkg: Herramienta de Bajo Nivel

**dpkg** es el herramienta subyacente que gestiona paquetes instalados.

### Listar Paquetes Instalados
```bash
dpkg -l
dpkg -l | grep nginx
```

Columnas:
- `ii` — Instalado correctamente
- `rc` — Removido pero con configuración
- `un` — Desinstalado

### Información de Paquete Instalado
```bash
dpkg -l | grep python3
dpkg -s python3
```

### Ver Archivos de un Paquete
```bash
dpkg -L nombre-paquete
dpkg -L bash
```

## Antes de Instalar: Checklist

```bash
# 1. Busca el paquete
apt-cache search "nombre"

# 2. Ve la información
apt-cache show package-name

# 3. Revisa si ya está instalado
dpkg -l | grep package-name

# 4. Revisa dependencias
apt-cache depends package-name

# 5. Instala
sudo apt install package-name
```

## Caso Común: Python

```bash
apt-cache search python3 | head -20
apt-cache show python3
dpkg -l | grep python3
apt-cache depends python3
```

## Seguridad

- Siempre verifica el paquete antes de instalar
- Lee la descripción completa
- Revisa las dependencias
- Comprueba si es de un repositorio oficial""",
            "goal_description": "Domina las técnicas de búsqueda y verificación de paquetes antes de instalar.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "directories": [
                    "/home/student/software"
                ]
            }),
            "step_by_step_guide": """1. Usa apt-cache search para buscar un paquete (ej: 'editor')
2. Revisa los detalles con apt-cache show
3. Verifica qué paquetes de Python están instalados con dpkg -l | grep python
4. Documenta el proceso en /home/student/software/paquetes_instalados.txt
5. Incluye al menos 3 paquetes que ya están instalados""",
            "xp_reward": 150,
            "order_index": 2,
            "time_limit": 35,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Archivo de paquetes instalados",
                    "description": "El archivo /home/student/software/paquetes_instalados.txt debe existir",
                    "v_type": "file_created",
                    "v_value": "/home/student/software/paquetes_instalados.txt",
                    "hints": ["Usa: dpkg -l para listar paquetes", "Redirige a archivo con >"]
                }
            ]
        },
        {
            "title": "dpkg: Bajo Nivel",
            "description": """# dpkg: El Gestor de Bajo Nivel

Mientras que **apt** es el gestor de alto nivel con resolución de dependencias, **dpkg** es la herramienta de bajo nivel que actualmente instala los paquetes.

## Operaciones dpkg

### Instalar un Paquete .deb
```bash
sudo dpkg -i archivo.deb
```

Instala el archivo .deb directamente. Requiere que las dependencias estén instaladas.

### Remover Paquete
```bash
sudo dpkg -r nombre-paquete
sudo dpkg --remove nombre-paquete
```

### Purgar Paquete (incluyendo configuración)
```bash
sudo dpkg -P nombre-paquete
sudo dpkg --purge nombre-paquete
```

### Listar Paquetes Instalados
```bash
dpkg -l
dpkg -l | grep nginx
```

Estado:
- `ii` — instalado
- `rc` — removido (solo config)
- `un` — desinstalado
- `iU` — desempaquetado pero no configurado

### Ver Información del Paquete
```bash
dpkg -s nombre-paquete
dpkg --status bash
```

### Listar Archivos de un Paquete
```bash
dpkg -L nombre-paquete
dpkg --listfiles vim
```

Ejemplo: ¿dónde instala bash sus archivos?
```bash
dpkg -L bash
# /bin/bash
# /usr/share/doc/bash/
# etc...
```

### Verificar Instalación
```bash
dpkg -l | grep bash
```

### Configurar Paquetes No Configurados
```bash
sudo dpkg --configure -a
```

## dpkg vs apt

| Operación | apt | dpkg |
|-----------|-----|------|
| Instalar | apt install | dpkg -i (requiere .deb) |
| Buscar | apt search | dpkg -l |
| Información | apt show | dpkg -s |
| Archivos | - | dpkg -L |
| Dependencias | auto-resuelve | requiere manual |
| Repositorios | usa repositorios | solo .deb local |

## Caso Típico

```bash
# Instalar desde repositorio (apt)
sudo apt install nginx

# Verificar con dpkg
dpkg -l | grep nginx
dpkg -L nginx | head -10
dpkg -s nginx
```

## Instalar desde .deb Manual

```bash
# Si tienes un archivo .deb
sudo dpkg -i mi-programa.deb

# Si hay dependencias faltantes
sudo apt install -f
```

## Nota Importante

Normalmente NO necesitas usar dpkg directamente. Usa **apt** que maneja las dependencias automáticamente. Usa dpkg cuando necesites:
- Trabajar con archivos .deb descargados
- Verificar detalles de bajo nivel
- Recuperarse de errores de dependencias""",
            "goal_description": "Aprende dpkg para consultar paquetes instalados y trabajar con archivos .deb.",
            "difficulty": "medium",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "directories": [
                    "/home/student/dpkg_info"
                ]
            }),
            "step_by_step_guide": """1. Usa dpkg -l para listar todos los paquetes instalados
2. Filtrar por bash: dpkg -l | grep bash
3. Ver información detallada: dpkg -s bash
4. Ver qué archivos instala bash: dpkg -L bash
5. Guarda los archivos de bash en /home/student/dpkg_info/bash_files.txt""",
            "xp_reward": 150,
            "order_index": 3,
            "time_limit": 30,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Archivo de archivos de bash",
                    "description": "El archivo /home/student/dpkg_info/bash_files.txt debe existir",
                    "v_type": "file_created",
                    "v_value": "/home/student/dpkg_info/bash_files.txt",
                    "hints": ["Usa: dpkg -L bash", "Redirige con > a /home/student/dpkg_info/bash_files.txt"]
                }
            ]
        },
        {
            "title": "Repositorios y Fuentes de Software",
            "description": """# Repositorios y Fuentes de Software

Los repositorios son servidores donde Ubuntu aloja los paquetes. Configurarlos correctamente es crucial para seguridad y acceso a software.

## /etc/apt/sources.list

Este archivo contiene la lista principal de repositorios.

### Formato
```
deb http://archive.ubuntu.com/ubuntu focal main restricted
deb http://archive.ubuntu.com/ubuntu focal universe multiverse
deb-src http://archive.ubuntu.com/ubuntu focal main
```

Estructura:
- `deb` — Paquetes binarios compilados
- `deb-src` — Código fuente
- URL del repositorio
- Distribución (focal, jammy, etc.)
- Secciones (main, restricted, universe, multiverse)

### Secciones Explicadas

| Sección | Descripción |
|---------|-------------|
| **main** | Software oficial de Ubuntu, completamente soportado |
| **restricted** | Drivers y software propietario soportado |
| **universe** | Software comunitario, no soportado oficialmente |
| **multiverse** | Software no-libre, no soportado |

### Distribuciones

- `focal` — Ubuntu 20.04
- `jammy` — Ubuntu 22.04
- `noble` — Ubuntu 24.04
- `devel` — Desarrollo

### Ejemplo Completo de sources.list
```
# Main repositories
deb http://archive.ubuntu.com/ubuntu focal main restricted
deb-src http://archive.ubuntu.com/ubuntu focal main restricted

# Universe & Multiverse
deb http://archive.ubuntu.com/ubuntu focal universe
deb http://archive.ubuntu.com/ubuntu focal multiverse

# Security updates
deb http://security.ubuntu.com/ubuntu focal-security main restricted
deb http://security.ubuntu.com/ubuntu focal-security universe
```

## /etc/apt/sources.list.d/

Directorio para archivos de repositorios adicionales. Cada archivo `.list` o `.sources` es un repositorio.

### Estructura
```
/etc/apt/sources.list.d/
├── ubuntu-docker.list
├── google-chrome.list
└── vscode.list
```

### Ejemplo: Agregar Repositorio de Docker
```bash
# Opción 1: Manual
echo "deb https://download.docker.com/linux/ubuntu focal stable" | sudo tee /etc/apt/sources.list.d/docker.list

# Opción 2: Usando add-apt-repository
sudo add-apt-repository ppa:docker-ppa/latest
```

## PPAs: Personal Package Archives

Los PPAs permiten que desarrolladores compartan software directamente.

```bash
# Agregar un PPA
sudo add-apt-repository ppa:user/project-name
sudo apt update
sudo apt install package-from-ppa
```

### Ejemplos Comunes
```bash
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.11
```

## Gestionar Repositorios

### Ver Repositorios Actuales
```bash
apt-cache policy
apt-cache policy nginx
```

### Deshabilitar Repositorio
Editar `/etc/apt/sources.list` y comentar la línea:
```bash
# deb http://archive.ubuntu.com/ubuntu focal universe
```

### Remover PPA
```bash
sudo add-apt-repository --remove ppa:user/project-name
```

## Claves GPG

Los repositorios usan claves GPG para verificación de integridad.

```bash
# Ver claves instaladas
apt-key list

# Agregar clave manualmente
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys KEY_ID
```

## Seguridad

- Usar solo repositorios de confianza
- Verificar que los PPAs sean confiables
- Mantener actualizado: `sudo apt update && sudo apt upgrade`
- Usar HTTPS en URLs de repositorios cuando sea posible""",
            "goal_description": "Entiende cómo funcionan los repositorios, sources.list y cómo agregar fuentes de software.",
            "difficulty": "medium",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "files": [
                    {"path": "/home/student/repos/mi_sources.list", "content": "deb http://archive.ubuntu.com/ubuntu focal main restricted\ndeb http://archive.ubuntu.com/ubuntu focal universe"}
                ],
                "directories": [
                    "/home/student/repos"
                ]
            }),
            "step_by_step_guide": """1. Examina /etc/apt/sources.list para ver los repositorios actuales
2. Revisa /etc/apt/sources.list.d/ para repositorios adicionales
3. Verifica el archivo /home/student/repos/mi_sources.list
4. Usa apt-cache policy para ver información de repositorios
5. Documenta qué secciones de repositorio están habilitadas""",
            "xp_reward": 175,
            "order_index": 4,
            "time_limit": 35,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Verificar contenido de sources.list",
                    "description": "El archivo debe contener 'deb'",
                    "v_type": "file_content_flag",
                    "v_value": "deb",
                    "v_extra": "/home/student/repos/mi_sources.list",
                    "hints": ["El archivo ya existe con contenido de repositorios"]
                }
            ]
        },
        {
            "title": "Mantenimiento del Sistema",
            "description": """# Mantenimiento del Sistema con apt

Un administrador de sistemas debe mantener el sistema actualizado, seguro y con espacio limpio.

## Actualización de Paquetes

### Actualizar Lista de Repositorios
```bash
sudo apt update
```

Descarga la lista actualizada de paquetes disponibles. Siempre ejecutar antes de instalar o actualizar.

### Actualizar Paquetes
```bash
sudo apt upgrade
```

Actualiza todos los paquetes instalados sin remover ninguno. Es **seguro**.

```bash
sudo apt full-upgrade
```

Actualización más agresiva que puede remover paquetes para resolver dependencias. Úsalo con cuidado.

### Actualización de Distribución
```bash
sudo apt dist-upgrade
```

Prepara para upgrade de distribución (ej: 20.04 → 22.04).

## Limpieza del Sistema

### autoremove: Remover Dependencias Huérfanas
```bash
sudo apt autoremove
```

Cuando desinstala un programa, sus dependencias pueden quedar huérfanas. Este comando las elimina.

```bash
sudo apt autoremove --purge
```

También elimina configuración asociada.

### autoclean: Limpiar Caché Viejo
```bash
sudo apt autoclean
```

Elimina del caché (`/var/cache/apt/archives/`) los paquetes viejos cuya versión ya no está disponible.

### clean: Limpiar Todo el Caché
```bash
sudo apt clean
```

Elimina completamente `/var/cache/apt/archives/` y libera espacio en disco.

## Ver Qué Se Puede Actualizar

```bash
apt list --upgradable
apt list --upgradable | wc -l
```

## Flujo de Mantenimiento Recomendado

```bash
# 1. Actualizar lista
sudo apt update

# 2. Ver qué se puede actualizar
apt list --upgradable

# 3. Actualizar
sudo apt upgrade

# 4. Limpiar dependencias no usadas
sudo apt autoremove

# 5. Limpiar caché viejo
sudo apt autoclean

# 6. Verificar espacio
df -h /var/cache/apt/archives/
```

## Automatizar Actualizaciones

Instalar y configurar unattended-upgrades:
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

Configura actualizaciones automáticas (especialmente seguridad).

## Verificación de Integridad

```bash
# Verificar sistema de paquetes
sudo apt check
sudo apt install -f
```

Si hay errores de dependencias, `-f` intenta repararlos.

## Espacio en Disco

```bash
# Ver tamaño de caché
du -sh /var/cache/apt/

# Ver tamaño de paquetes instalados
apt show nombre-paquete | grep Size
```

## Checklist de Mantenimiento Mensual

- [ ] `sudo apt update`
- [ ] Revisar `apt list --upgradable`
- [ ] `sudo apt upgrade`
- [ ] `sudo apt autoremove`
- [ ] `sudo apt autoclean`
- [ ] Verificar espacio en disco
- [ ] Revisar logs de errores""",
            "goal_description": "Domina las tareas de mantenimiento del sistema: actualizaciones, limpiezas y optimización.",
            "difficulty": "medium",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "directories": [
                    "/home/student/mantenimiento"
                ]
            }),
            "step_by_step_guide": """1. Ejecuta sudo apt update
2. Revisa qué paquetes se pueden actualizar: apt list --upgradable
3. Documenta la lista en /home/student/mantenimiento/upgradables.txt
4. Ejecuta sudo apt upgrade (o solo apt upgrade si no tienes sudo en sandbox)
5. Ejecuta sudo apt autoremove
6. Guarda un resumen del mantenimiento realizado""",
            "xp_reward": 150,
            "order_index": 5,
            "time_limit": 30,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Archivo de paquetes actualizables",
                    "description": "El archivo /home/student/mantenimiento/upgradables.txt debe existir",
                    "v_type": "file_created",
                    "v_value": "/home/student/mantenimiento/upgradables.txt",
                    "hints": ["Usa: apt list --upgradable", "Redirige con > al archivo"]
                }
            ]
        }
    ]

    for l_data in labs_paquetes:
        existing = db.query(Lab).filter(Lab.module_id == module_paquetes.id, Lab.title == l_data["title"]).first()
        if existing:
            continue
        lab = Lab(
            module_id=module_paquetes.id,
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

    print(f"✅ Terminal Skills - M4 Gestión de Paquetes seeded OK")

    # MODULE B: Servicios y Systemd
    module_servicios = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M5 — Servicios y Systemd").first()
    if not module_servicios:
        module_servicios = Module(
            skill_path_id=path.id,
            title="M5 — Servicios y Systemd",
            description="Domina systemd, el sistema de init moderno de Linux. Aprende a gestionar servicios, diagnosticar problemas y crear tus propios servicios.",
            order_index=6,
            is_active=True
        )
        db.add(module_servicios)
        db.commit()
        db.refresh(module_servicios)

    labs_servicios = [
        {
            "title": "Introducción a Systemd",
            "description": """# Introducción a Systemd

**systemd** es el sistema de init moderno de Linux. Reemplaza a los antiguos scripts de init y es ahora el estándar en la mayoría de distribuciones.

## ¿Qué es systemd?

Systemd es un **sistema de inicio y gestor de servicios** que:
- Ejecuta como PID 1 (el primer proceso)
- Gestiona todos los servicios del sistema
- Maneja dependencias entre servicios
- Proporciona logging centralizado

## Unidades (Units)

Systemd organiza todo en **unidades**. Los tipos principales:

### Tipos de Unidades

| Tipo | Extensión | Propósito |
|------|-----------|----------|
| **service** | `.service` | Servicios (nginx, ssh, mysql) |
| **socket** | `.socket` | Comunicación entre procesos |
| **target** | `.target` | Agrupa unidades (multi-user.target) |
| **timer** | `.timer` | Tareas programadas (como cron) |
| **path** | `.path` | Monitorea cambios en archivos |

### Archivos de Unidades

Se localizan en:
- `/etc/systemd/system/` — Unidades del administrador
- `/usr/lib/systemd/system/` — Unidades del sistema
- `/run/systemd/system/` — Unidades de runtime

## systemctl: Control de Servicios

**systemctl** es la herramienta para gestionar systemd.

### Ver Estado General
```bash
systemctl status
systemctl is-system-running
```

### Listar Unidades
```bash
systemctl list-units
systemctl list-units --type=service
systemctl list-units --type=target
systemctl list-units --all
```

### Ver Unidades Activas
```bash
systemctl list-units --state=running
systemctl list-units --state=failed
```

## Targets: Estados del Sistema

Los targets son como "runlevels" en sistemas antiguos.

### Targets Principales

| Target | Propósito |
|--------|-----------|
| `poweroff.target` | Apagar |
| `rescue.target` | Modo rescate (root shell) |
| `multi-user.target` | Sistema normal sin GUI |
| `graphical.target` | Sistema con escritorio GUI |
| `reboot.target` | Reiniciar |

### Ver Target Actual
```bash
systemctl get-default
```

### Cambiar Target
```bash
sudo systemctl set-default graphical.target
sudo systemctl isolate multi-user.target
```

## Estado de Unidades

Una unidad puede estar:
- **active (running)** — Ejecutándose
- **active (exited)** — Se ejecutó correctamente
- **inactive (dead)** — Parada
- **failed** — Error
- **enabled** — Se inicia al boot
- **disabled** — No se inicia al boot

## Ejemplo: Verificar nginx

```bash
systemctl status nginx
systemctl is-active nginx
systemctl is-enabled nginx
```

## Journalctl: Logs

Systemd proporciona logging centralizado:
```bash
journalctl -u nginx
journalctl -xe
```

## Orden de Inicio

Las unidades tienen dependencias definidas:
- `After=` — Se inicia después de
- `Before=` — Se inicia antes de
- `Wants=` — Dependencia débil
- `Requires=` — Dependencia fuerte

## Estructura Básica

Una unidad `.service` básica:
```ini
[Unit]
Description=Mi Servicio
After=network.target

[Service]
ExecStart=/usr/bin/mi-programa

[Install]
WantedBy=multi-user.target
```

Systemd es extremadamente poderoso. Los administradores deben comprenderlo bien.""",
            "goal_description": "Comprende qué es systemd, sus unidades y cómo usar systemctl para ver el estado del sistema.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "directories": [
                    "/home/student/systemd_info"
                ]
            }),
            "step_by_step_guide": """1. Ejecuta systemctl status para ver el estado general
2. Lista servicios con systemctl list-units --type=service
3. Verifica el target actual con systemctl get-default
4. Revisa servicios activos y inactivos
5. Guarda información en /home/student/systemd_info/servicios.txt""",
            "xp_reward": 120,
            "order_index": 1,
            "time_limit": 25,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Archivo de servicios creado",
                    "description": "El archivo /home/student/systemd_info/servicios.txt debe existir",
                    "v_type": "file_created",
                    "v_value": "/home/student/systemd_info/servicios.txt",
                    "hints": ["Usa: systemctl list-units --type=service", "Redirige a archivo con >"]
                }
            ]
        },
        {
            "title": "Gestión de Servicios",
            "description": """# Gestión de Servicios con systemctl

Una vez instalado un servicio, necesitas controlarlo: iniciar, detener, recargar, etc.

## Operaciones Básicas

### Iniciar un Servicio
```bash
sudo systemctl start nombre-servicio
sudo systemctl start nginx
```

### Detener un Servicio
```bash
sudo systemctl stop nombre-servicio
sudo systemctl stop nginx
```

### Reiniciar un Servicio
```bash
sudo systemctl restart nombre-servicio
```

Detiene y vuelve a iniciar. Útil para aplicar cambios de configuración.

### Recargar Configuración
```bash
sudo systemctl reload nombre-servicio
```

Carga el archivo de configuración sin interrumpir el servicio (algunos servicios lo soportan).

### Recargar o Reiniciar
```bash
sudo systemctl reload-or-restart nombre-servicio
```

Si soporta reload, lo hace; sino, reinicia.

## Habilitar al Arranque

### Habilitar Servicio
```bash
sudo systemctl enable nombre-servicio
```

El servicio se iniciará automáticamente en el siguiente arranque.

### Deshabilitar Servicio
```bash
sudo systemctl disable nombre-servicio
```

El servicio NO se iniciará automáticamente.

### Ver si Está Habilitado
```bash
systemctl is-enabled nombre-servicio
```

Salida:
- `enabled` — Se inicia en boot
- `disabled` — No se inicia en boot
- `static` — No se puede cambiar (manejado por otro servicio)

## Ver Estado Detallado

### Status General
```bash
systemctl status nombre-servicio
systemctl status nginx
```

Muestra:
- Si está activo (running/inactive)
- PID
- Memoria usada
- Logs recientes
- Si está habilitado

### Ver Solo Si Está Activo
```bash
systemctl is-active nombre-servicio
```

Retorna:
- `active` — Está corriendo
- `inactive` — No está corriendo

### Ver Si Está Habilitado
```bash
systemctl is-enabled nombre-servicio
```

## Operaciones en Masa

### Reiniciar Múltiples Servicios
```bash
sudo systemctl restart nginx php-fpm mariadb
```

### Listar Todos los Servicios
```bash
systemctl list-unit-files --type=service
```

### Ver Solo Servicios Habilitados
```bash
systemctl list-unit-files --type=service --state=enabled
```

## Diagnóstico

### Ver Último Log
```bash
systemctl status nombre-servicio
```

El final muestra los últimos logs.

### Ver Logs Completos
```bash
journalctl -u nombre-servicio
journalctl -u nginx -n 50
```

### Ver Cambios Recientes
```bash
journalctl -u nombre-servicio --since "2 hours ago"
```

## Caso Típico: Instalar y Habilitar Nginx

```bash
# 1. Instalar
sudo apt update
sudo apt install nginx

# 2. Verificar que está instalado
systemctl list-units --type=service | grep nginx

# 3. Iniciar
sudo systemctl start nginx

# 4. Verificar que está corriendo
systemctl status nginx

# 5. Habilitar para arranque
sudo systemctl enable nginx

# 6. Verificar
systemctl is-enabled nginx
```

## Resumen de Comandos Útiles

```bash
sudo systemctl start nombre-servicio      # Iniciar
sudo systemctl stop nombre-servicio       # Detener
sudo systemctl restart nombre-servicio    # Reiniciar
sudo systemctl reload nombre-servicio     # Recargar config
sudo systemctl enable nombre-servicio     # Habilitar en boot
sudo systemctl disable nombre-servicio    # Deshabilitar en boot
systemctl status nombre-servicio          # Ver estado
systemctl is-active nombre-servicio       # ¿Está activo?
systemctl is-enabled nombre-servicio      # ¿Habilitado en boot?
journalctl -u nombre-servicio             # Ver logs
```""",
            "goal_description": "Domina el control de servicios: iniciar, detener, habilitar y diagnosticar.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "directories": [
                    "/home/student/servicios"
                ]
            }),
            "step_by_step_guide": """1. Verifica el estado de SSH: systemctl status ssh
2. Comprueba si SSH está habilitado: systemctl is-enabled ssh
3. Ver el PID de SSH: systemctl status ssh (grep PID)
4. Documenta el estado de SSH en /home/student/servicios/estado_ssh.txt
5. Incluye información sobre habilitación en boot""",
            "xp_reward": 150,
            "order_index": 2,
            "time_limit": 30,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Archivo de estado SSH",
                    "description": "El archivo /home/student/servicios/estado_ssh.txt debe existir",
                    "v_type": "file_created",
                    "v_value": "/home/student/servicios/estado_ssh.txt",
                    "hints": ["Usa: systemctl status ssh", "Guarda el estado en el archivo"]
                }
            ]
        },
        {
            "title": "journalctl: Logs del Sistema",
            "description": """# journalctl: Sistema de Logging de Systemd

Systemd mantiene un registro centralizado de todos los eventos usando **journalctl**.

## Visualizar Logs

### Todos los Logs
```bash
journalctl
```

Muestra todos los logs desde el inicio. Usa `q` para salir.

### Logs de un Servicio Específico
```bash
journalctl -u nombre-servicio
journalctl -u nginx
journalctl -u ssh
```

### Últimas N Líneas
```bash
journalctl -n 50
journalctl -u nginx -n 20
```

### Ver en Tiempo Real (follow)
```bash
journalctl -f
journalctl -u nginx -f
```

Como `tail -f`, muestra nuevos logs conforme llegan.

## Filtrar por Tiempo

### Últimas N Horas
```bash
journalctl --since "2 hours ago"
journalctl -u nginx --since "1 hour ago"
```

### Fecha y Hora Específicas
```bash
journalctl --since "2024-03-20 10:00:00"
journalctl --since "2024-03-20" --until "2024-03-21"
```

### Hoy
```bash
journalctl --since today
```

### Arranque Actual
```bash
journalctl -b
```

## Filtrar por Nivel de Prioridad

Levels (0-7):
- `0` — emerg (emergencia)
- `1` — alert
- `2` — crit (crítico)
- `3` — err (error)
- `4` — warning
- `5` — notice
- `6` — info
- `7` — debug

### Solo Errores
```bash
journalctl -p err
journalctl -u nginx -p err
```

### Errores y Críticos
```bash
journalctl -p crit
journalctl -p 0..3
```

### Sin Notices e Info
```bash
journalctl -p warning
```

## Combinaciones Útiles

### Logs de SSH en Última Hora con Errores
```bash
journalctl -u ssh -p err --since "1 hour ago"
```

### Nginx, Últimas 30 líneas, en tiempo real
```bash
journalctl -u nginx -f -n 30
```

### Error Crítico Hoy
```bash
journalctl -p crit --since today
```

### Todos los Servicios Fallidos
```bash
journalctl -p err
systemctl list-units --failed
```

## Formato de Salida

### Formato Compacto
```bash
journalctl --output=short
journalctl -o short
```

### Formato Verboso
```bash
journalctl --output=verbose
journalctl -o verbose
```

### JSON
```bash
journalctl -o json
```

### JSON Pretty-printed
```bash
journalctl -o json-pretty
```

## Estadísticas

### Tamaño del Journal
```bash
journalctl --disk-usage
```

### Disco Máximo
```bash
journalctl --vacuum-size=1G
journalctl --vacuum-time=30d
```

Limita el journal a 1GB o 30 días.

## Búsqueda de Texto

### Con grep
```bash
journalctl | grep "ERROR"
journalctl -u nginx | grep "timeout"
```

### Con Opciones de Match
```bash
journalctl SYSLOG_IDENTIFIER=nginx
journalctl _PID=12345
```

## Archivos de Configuración

El journal se almacena en:
- `/var/log/journal/` — Persistente
- `/run/log/journal/` — Temporal

## Recuperación de Errores

### Ver Servicios que Fallaron
```bash
systemctl list-units --failed
journalctl --boot -0 -p err
```

### Logs de Último Arranque
```bash
journalctl -b -1
journalctl -b -1 -p err
```

## Caso Práctico: Diagnosticar Nginx

```bash
# 1. Ver estado
systemctl status nginx

# 2. Ver logs completos
journalctl -u nginx

# 3. Ver últimas 30 líneas
journalctl -u nginx -n 30

# 4. Ver en tiempo real
journalctl -u nginx -f

# 5. Ver solo errores
journalctl -u nginx -p err
```

Journalctl es fundamental para diagnóstico de problemas.""",
            "goal_description": "Domina journalctl para ver logs del sistema, filtrar por servicio, prioridad y tiempo.",
            "difficulty": "medium",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "directories": [
                    "/home/student/logs_sistema"
                ]
            }),
            "step_by_step_guide": """1. Ver logs del sistema: journalctl
2. Ver logs de SSH: journalctl -u ssh
3. Filtrar errores: journalctl -p err
4. Combinar: journalctl -u ssh -p err
5. Guardar resultados en /home/student/logs_sistema/journal_errores.txt""",
            "xp_reward": 175,
            "order_index": 3,
            "time_limit": 35,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Archivo de errores del journal",
                    "description": "El archivo /home/student/logs_sistema/journal_errores.txt debe existir",
                    "v_type": "file_created",
                    "v_value": "/home/student/logs_sistema/journal_errores.txt",
                    "hints": ["Usa: journalctl -p err", "Redirige con > al archivo"]
                }
            ]
        },
        {
            "title": "Crear un Servicio Systemd",
            "description": """# Crear un Servicio Systemd

Ahora que entiendes cómo funcionan los servicios, vamos a crear uno personalizado.

## Archivo .service Básico

La estructura mínima:

```ini
[Unit]
Description=Mi Servicio
After=network.target

[Service]
Type=simple
ExecStart=/ruta/al/ejecutable

[Install]
WantedBy=multi-user.target
```

## Secciones Explicadas

### [Unit]

Metadatos y dependencias.

```ini
[Unit]
Description=Descripción del Servicio
After=network.target
Before=other.service
Wants=optional.service
Requires=critical.service
```

- `Description` — Lo que ve en `systemctl status`
- `After` — Se inicia después de (no bloquea si falla)
- `Before` — Se inicia antes de
- `Wants` — Dependencia débil (continúa si falla)
- `Requires` — Dependencia fuerte (para si falla)

### [Service]

Cómo ejecutar el servicio.

```ini
[Service]
Type=simple
ExecStart=/usr/local/bin/mi-programa
User=usuario
WorkingDirectory=/home/usuario
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="VARIABLE=valor"
```

#### Parámetros Importantes

| Parámetro | Descripción |
|-----------|-------------|
| `Type=simple` | Proceso único normal |
| `Type=forking` | Se bifurca en background |
| `ExecStart` | Comando para iniciar |
| `ExecStop` | Comando para detener |
| `Restart=always` | Reiniciar siempre |
| `Restart=on-failure` | Reiniciar si sale con error |
| `RestartSec=10` | Esperar 10 seg antes de reintentar |
| `User=www-data` | Usuario para ejecutar |
| `WorkingDirectory` | Directorio de trabajo |
| `Environment` | Variables de entorno |

### [Install]

Cómo instalar el servicio.

```ini
[Install]
WantedBy=multi-user.target
```

Indica dónde se enlaza simbólicamente para habilitación.

## Ejemplo Completo: Servicio Simple

Vamos a crear un servicio que ejecuta un script cada vez que arranca.

### Paso 1: Crear Script
```bash
#!/bin/bash
echo "Servicio iniciado a $(date)" >> /tmp/mi_servicio.log
```

Guardarlo en `/usr/local/bin/mi-servicio.sh` y hacer ejecutable:
```bash
sudo chmod +x /usr/local/bin/mi-servicio.sh
```

### Paso 2: Crear Archivo .service
```ini
[Unit]
Description=Mi Servicio Personalizado
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/mi-servicio.sh
Restart=on-failure
RestartSec=5
StandardOutput=journal

[Install]
WantedBy=multi-user.target
```

Guardarlo en `/etc/systemd/system/mi-servicio.service`:
```bash
sudo nano /etc/systemd/system/mi-servicio.service
```

### Paso 3: Recargar systemd
```bash
sudo systemctl daemon-reload
```

Systemd detecta el nuevo archivo.

### Paso 4: Habilitar y Iniciar
```bash
sudo systemctl enable mi-servicio
sudo systemctl start mi-servicio
sudo systemctl status mi-servicio
```

### Paso 5: Verificar
```bash
journalctl -u mi-servicio
```

## Ejemplo: Servicio de Aplicación Python

```ini
[Unit]
Description=Mi Aplicación Python
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/miapp
ExecStart=/usr/bin/python3 /opt/miapp/main.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="PYTHONUNBUFFERED=1"

[Install]
WantedBy=multi-user.target
```

## Ejemplo: Servicio Web (Nginx)

```ini
[Unit]
Description=Nginx Web Server
After=network.target
Before=

[Service]
Type=forking
PIDFile=/var/run/nginx.pid
ExecStart=/usr/sbin/nginx
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/bin/kill -s QUIT $MAINPID
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

## Errores Comunes

### Servicio no existe
```
Unit file [...] not found
```
Verificar ruta en [Unit] section.

### Permiso denegado
Asegurar que ExecStart apunta a archivo ejecutable con permisos correctos.

### Restart infinito
El programa sale inmediatamente. Verificar ExecStart y logs.

## Desarrollo y Testing

### Ver cambios en el archivo
```bash
sudo systemctl daemon-reload
```

### Ver qué haría el servicio
```bash
systemctl cat mi-servicio
```

### Ejecutar manualmente el comando
```bash
/usr/local/bin/mi-servicio.sh
```

Verificar que funciona antes de hacer servicio.

## Resumen

Crear un servicio:
1. Crear ejecutable funcional
2. Crear archivo `.service` en `/etc/systemd/system/`
3. `sudo systemctl daemon-reload`
4. `sudo systemctl enable nombre.service`
5. `sudo systemctl start nombre.service`
6. Verificar: `systemctl status nombre.service`""",
            "goal_description": "Crea un archivo de servicio systemd personalizado y lo habilitas en el sistema.",
            "difficulty": "medium",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "files": [
                    {"path": "/home/student/mi_script.sh", "content": "#!/bin/bash\necho 'running' >> /tmp/service.log"}
                ],
                "directories": [
                    "/home/student"
                ]
            }),
            "step_by_step_guide": """1. Examina /home/student/mi_script.sh
2. Crea un archivo /home/student/mi_servicio.service con secciones [Unit], [Service], [Install]
3. Configura Type=simple, ExecStart apuntando al script
4. Incluye Restart=on-failure y RestartSec=5
5. WantedBy=multi-user.target en [Install]""",
            "xp_reward": 250,
            "order_index": 4,
            "time_limit": 45,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Archivo de servicio creado",
                    "description": "El archivo /home/student/mi_servicio.service debe existir",
                    "v_type": "file_created",
                    "v_value": "/home/student/mi_servicio.service",
                    "hints": ["Crear archivo con estructura [Unit], [Service], [Install]", "ExecStart debe apuntar a un script ejecutable"]
                }
            ]
        },
        {
            "title": "Diagnóstico de Servicios",
            "description": """# Diagnóstico de Servicios

Como administrador, necesitas diagnosticar por qué un servicio no está funcionando.

## Búsqueda de Servicios Fallidos

### Ver Servicios Fallidos
```bash
systemctl list-units --failed
systemctl list-units --failed --type=service
```

Muestra todos los servicios que salieron con error.

## Inspeccionar un Servicio Fallido

### Status Detallado
```bash
systemctl status nombre-servicio
```

Muestra:
- Si está active/inactive
- Código de salida (exit code)
- Logs recientes
- Última línea de error

## Journalctl para Diagnóstico

### Logs del Servicio
```bash
journalctl -u nombre-servicio
journalctl -u nombre-servicio -n 30
journalctl -u nombre-servicio -f
```

### Errores y Advertencias
```bash
journalctl -u nombre-servicio -p err
journalctl -u nombre-servicio -p warning
```

### Último Arranque
```bash
journalctl -u nombre-servicio -b
journalctl -b -p err
```

## Causas Comunes de Fallo

### 1. Ejecutable No Existe
```
ExecStart=/bin/comando-inexistente
```

**Diagnóstico:**
```bash
systemctl status nombre-servicio
# No such file or directory
which comando-inexistente
```

**Solución:**
- Verificar ruta correcta
- Instalar el programa
- Usar ruta absoluta

### 2. Permisos Insuficientes
```
ExecStart=/usr/sbin/programa
User=www-data
```

El usuario no tiene permiso.

**Diagnóstico:**
```bash
journalctl -u nombre-servicio
# Permission denied
ls -la /ruta/al/programa
```

**Solución:**
```bash
sudo chmod +x /ruta/al/programa
sudo chown usuario:grupo /ruta/al/programa
```

### 3. Puerto Ya en Uso
```
bind: Address already in use
```

**Diagnóstico:**
```bash
netstat -tlnp | grep :8080
lsof -i :8080
```

**Solución:**
```bash
sudo systemctl stop otro-servicio
sudo lsof -i :8080 | grep -o 'PID.*' | awk '{print $2}' | xargs kill
```

### 4. Archivo de Configuración Inválido

El servicio intenta cargar config que no existe o está dañada.

**Diagnóstico:**
```bash
journalctl -u nombre-servicio
# Config error: ...
```

**Solución:**
Verificar sintaxis de configuración.

### 5. Dependencia No Satisfecha

```
After=mysql.service
Requires=mysql.service
```

MySQL no está instalado o no arranca.

**Diagnóstico:**
```bash
systemctl status mysql
systemctl is-active mysql
```

**Solución:**
```bash
sudo apt install mysql-server
sudo systemctl start mysql
```

### 6. Recurso Insuficiente

No hay memoria, disco, etc.

**Diagnóstico:**
```bash
journalctl -u nombre-servicio
# Out of memory
df -h
free -h
```

**Solución:**
Liberar espacio/memoria.

## Flujo de Diagnóstico Sistemático

```bash
# 1. ¿Está fallido?
systemctl list-units --failed

# 2. Ver status
systemctl status nombre-servicio

# 3. Ver logs completos
journalctl -u nombre-servicio

# 4. Ver solo errores
journalctl -u nombre-servicio -p err

# 5. Probar manualmente
/ruta/al/ejecutable

# 6. Revisar configuración
cat /etc/systemd/system/nombre.service

# 7. Verificar dependencias
systemctl is-active mysql
systemctl is-active network.target

# 8. Recargar systemd
sudo systemctl daemon-reload

# 9. Reintentar
sudo systemctl start nombre-servicio

# 10. Verificar
systemctl status nombre-servicio
```

## Herramientas de Ayuda

### ps: Ver Procesos
```bash
ps aux | grep nombre-servicio
ps -ef | grep nombre
```

### netstat: Puertos
```bash
netstat -tlnp
netstat -tlnp | grep 8080
```

### lsof: Archivos Abiertos
```bash
lsof -u usuario
lsof -i :puerto
```

### strace: Rastrear Llamadas del Sistema
```bash
strace -e open,openat /usr/bin/programa
```

## Reset y Recuperación

### Limpiar Estado Fallido
```bash
sudo systemctl reset-failed
sudo systemctl reset-failed nombre-servicio
```

Solo limpia la bandera de fallo, no soluciona el problema.

### Recargar Configuración
```bash
sudo systemctl daemon-reload
```

Si editas un archivo `.service`, necesitas esto.

### Modo Debug
Para servicios problemáticos, ejecuta manualmente:
```bash
/usr/bin/programa --verbose
/usr/bin/programa --debug
```

## Documentación en el Servicio

```ini
[Unit]
Description=Mi Servicio - Nota: Requiere MySQL corriendo
# Requiere: mysql-server instalado
# Prerequisitos: /etc/config/miservicio.conf debe existir
```

## Ejemplo Real: Diagnosticar Nginx Fallido

```bash
# 1. Ver qué está fallido
systemctl list-units --failed
# nginx.service marked as failed

# 2. Status
systemctl status nginx
# Active: failed (Result: exit-code) since ...
# Exit code: 1

# 3. Ver logs
journalctl -u nginx
# Address already in use

# 4. Ver qué está usando el puerto
netstat -tlnp | grep :80
# apache2 está usando :80

# 5. Solución
sudo systemctl stop apache2
sudo systemctl start nginx

# 6. Verificar
systemctl status nginx
# Active: active (running)
```

Dominar diagnóstico es esencial para administración de sistemas.""",
            "goal_description": "Aprende técnicas para diagnosticar y resolver problemas de servicios fallidos.",
            "difficulty": "medium",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "directories": [
                    "/home/student/diagnostico"
                ]
            }),
            "step_by_step_guide": """1. Usa systemctl list-units --failed para ver servicios fallidos
2. Si no hay, causa un fallo intencional o examina uno existente
3. Revisa el status: systemctl status [servicio]
4. Ver logs: journalctl -u [servicio]
5. Documenta el proceso de diagnóstico en /home/student/diagnostico/reporte_fallos.txt""",
            "xp_reward": 200,
            "order_index": 5,
            "time_limit": 40,
            "docker_image": "ubuntu:22.04",
            "challenges": [
                {
                    "title": "Reporte de diagnóstico creado",
                    "description": "El archivo /home/student/diagnostico/reporte_fallos.txt debe existir",
                    "v_type": "file_created",
                    "v_value": "/home/student/diagnostico/reporte_fallos.txt",
                    "hints": ["Usa: systemctl list-units --failed", "Documenta el proceso de diagnóstico"]
                }
            ]
        }
    ]

    for l_data in labs_servicios:
        existing = db.query(Lab).filter(Lab.module_id == module_servicios.id, Lab.title == l_data["title"]).first()
        if existing:
            continue
        lab = Lab(
            module_id=module_servicios.id,
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

    print(f"✅ Terminal Skills - M5 Servicios y Systemd seeded OK")
    db.close()

if __name__ == "__main__":
    seed()
