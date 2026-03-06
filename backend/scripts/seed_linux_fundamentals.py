import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Adjust path to import from parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load .env explicitly from backend root
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(env_path)

from database import SessionLocal, Lab, Challenge, UserLabCompletion, UserChallengeCompletion, SkillPath, Module, create_tables

def seed_linux_fundamentals():
    db = SessionLocal()
    # Create tables if not exists
    create_tables()

    # 1. Create Skill Path (UPSERT)
    linux_path = db.query(SkillPath).filter(SkillPath.title == "Linux Fundamentals").first()
    if not linux_path:
        linux_path = SkillPath(
            title="Linux Fundamentals",
            description="Domina la terminal de Linux desde cero. Navegación, gestión de archivos, permisos y más.",
            difficulty="easy",
            order_index=1
        )
        db.add(linux_path)
        db.commit()
        db.refresh(linux_path)
    else:
        print(f"✅ Skill Path '{linux_path.title}' ya existe.")

    # 2. Create Module L1 (UPSERT)
    l1_module = db.query(Module).filter(Module.title == "Linux Labs L1 — Terminal Basics").first()
    if not l1_module:
        l1_module = Module(
            skill_path_id=linux_path.id,
            title="Linux Labs L1 — Terminal Basics",
            description="Aprende los conceptos fundamentales de la línea de comandos de Linux.",
            order_index=1
        )
        db.add(l1_module)
    
    # 3. Create Module L2 (UPSERT)
    l2_module = db.query(Module).filter(Module.title == "Linux Labs L2 — Users and Permissions").first()
    if not l2_module:
        l2_module = Module(
            skill_path_id=linux_path.id,
            title="Linux Labs L2 — Users and Permissions",
            description="Gestión de usuarios, grupos y permisos de archivos en sistemas Linux.",
            order_index=2
        )
        db.add(l2_module)

    # 4. Create Module L3 (UPSERT)
    l3_module = db.query(Module).filter(Module.title == "Linux Labs L3 — Processes and System Monitoring").first()
    if not l3_module:
        l3_module = Module(
            skill_path_id=linux_path.id,
            title="Linux Labs L3 — Processes and System Monitoring",
            description="Procesos, señales y monitorización del sistema en tiempo real.",
            order_index=3
        )
        db.add(l3_module)
    
    # 5. Create Module L4 (UPSERT)
    l4_module = db.query(Module).filter(Module.title == "Linux Labs L4 — File Management Commands").first()
    if not l4_module:
        l4_module = Module(
            skill_path_id=linux_path.id,
            title="Linux Labs L4 — File Management Commands",
            description="Introducción a los comandos básicos de gestión de archivos en Linux.",
            order_index=4
        )
        db.add(l4_module)

    db.commit()
    if l1_module: db.refresh(l1_module)
    if l2_module: db.refresh(l2_module)
    if l3_module: db.refresh(l3_module)
    if l4_module: db.refresh(l4_module)

    # L1 Labs Data
    l1_labs = [
        {
            "id": 1,
            "title": "Bienvenido a la terminal",
            "description": "### Guía de Lab\nLa terminal de Linux permite interactuar con el sistema mediante comandos. En este laboratorio aprenderás a ejecutar tu primer comando.\n\nComando clave: `ls`",
            "goal_description": "### Objetivos\nEjecutar tu primer comando en Linux y visualizar los archivos disponibles.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta el comando: `ls`\n2. Observa los elementos que aparecen.\n3. Escribe todos los elementos separados por comas (ej: archivo.txt,logs).",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "files": [
                    {"path": "/home/student/README.txt", "content": "Bienvenido"},
                    {"path": "/home/student/notes.txt", "content": "Notas"}
                ],
                "directories": ["/home/student/logs"]
            }),
            "challenges": [
                {
                    "id": "L1_C1", 
                    "title": "Listar archivos del directorio actual", 
                    "description": "Ejecuta ls y escribe todos los elementos encontrados separados por comas.",
                    "v_type": "directory_listing_exact", 
                    "v_value": "README.txt,notes.txt,logs"
                }
            ]
        },
        {
            "id": 2,
            "title": "Dónde estoy",
            "description": "### Guía de Lab\nEl comando que permite saber tu ubicación actual es: `pwd` (print working directory).",
            "goal_description": "### Objetivos\nAprender a identificar la ubicación actual dentro del sistema de archivos.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `pwd`\n2. Observa la ruta completa.\n3. Introduce esa ruta en el campo de validación.",
            "difficulty": "easy",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L1_C2", 
                    "title": "Descubre tu ubicación", 
                    "description": "Ejecuta pwd e introduce la ruta completa.",
                    "v_type": "path_exact", 
                    "v_value": "/home/student"
                }
            ]
        },
        {
            "id": 3,
            "title": "Explorando directorios",
            "description": "### Guía de Lab\nPuedes moverte entre directorios usando: `cd nombre_directorio`.",
            "goal_description": "### Objetivos\nAprender a cambiar de directorio.",
            "step_by_step_guide": "### Guía Misión\n1. Lista archivos: `ls`\n2. Entra al directorio logs: `cd logs`\n3. Comprueba tu ubicación con `pwd`.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({"directories": ["/home/student/logs"]}),
            "challenges": [
                {
                    "id": "L1_C3", 
                    "title": "Entrar en el directorio logs", 
                    "description": "Navega hasta el directorio logs.",
                    "v_type": "path_contains", 
                    "v_value": "logs"
                }
            ]
        },
        {
            "id": 4,
            "title": "Subir de directorio",
            "description": "### Guía de Lab\nPuedes subir al directorio anterior (padre) usando: `cd ..`.",
            "goal_description": "### Objetivos\nAprender a navegar hacia atrás en el árbol de directorios.",
            "step_by_step_guide": "### Guía Misión\n1. Si estás dentro de logs, ejecuta: `cd ..`\n2. Comprueba tu ubicación usando `pwd`.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({"directories": ["/home/student/logs"]}),
            "challenges": [
                {
                    "id": "L1_C4", 
                    "title": "Volver al directorio principal", 
                    "description": "Sube hasta /home/student.",
                    "v_type": "path_exact", 
                    "v_value": "/home/student"
                }
            ]
        },
        {
            "id": 5,
            "title": "Leer archivos",
            "description": "### Guía de Lab\nLinux permite ver el contenido de archivos usando: `cat archivo`.",
            "goal_description": "### Objetivos\nAprender a visualizar archivos de texto.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `cat README.txt`\n2. Busca la flag dentro del archivo e introdúcela.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "files": [{"path": "/home/student/README.txt", "content": "FLAG{welcome_linux}"}]
            }),
            "challenges": [
                {
                    "id": "L1_C5", 
                    "title": "Encuentra la flag", 
                    "description": "Lee el archivo README.txt y encuentra la flag.",
                    "v_type": "file_content_flag", 
                    "v_value": "FLAG{welcome_linux}"
                }
            ]
        },
        {
            "id": 6,
            "title": "Crear directorios",
            "description": "### Guía de Lab\nPuedes crear directorios usando: `mkdir nombre`.",
            "goal_description": "### Objetivos\nAprender a crear nuevos directorios.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecutar: `mkdir backups`\n2. Verifica con `ls`.",
            "difficulty": "easy",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L1_C6", 
                    "title": "Crear el directorio backups", 
                    "description": "Crea un directorio llamado backups.",
                    "v_type": "directory_created", 
                    "v_value": "backups"
                }
            ]
        },
        {
            "id": 7,
            "title": "Crear archivos",
            "description": "### Guía de Lab\nPuedes crear archivos (vacíos) usando: `touch nombre_archivo`.",
            "goal_description": "### Objetivos\nAprender a crear archivos.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `touch notes.txt`\n2. Comprueba que existe con `ls`.",
            "difficulty": "easy",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L1_C7", 
                    "title": "Crear archivo notes.txt", 
                    "description": "Crea un archivo llamado notes.txt.",
                    "v_type": "file_created", 
                    "v_value": "notes.txt"
                }
            ]
        },
        {
            "id": 8,
            "title": "Explorando múltiples archivos",
            "description": "### Guía de Lab\nLos directorios pueden contener múltiples archivos y subdirectorios. El comando `ls` permite ver todos.",
            "goal_description": "### Objetivos\nAprender a identificar archivos dentro de un directorio.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `ls`\n2. Escribe todos los elementos encontrados separados por comas.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({
                "files": [
                    {"path": "/home/student/README.txt", "content": "1"},
                    {"path": "/home/student/notes.txt", "content": "2"}
                ],
                "directories": ["/home/student/projects", "/home/student/logs"]
            }),
            "challenges": [
                {
                    "id": "L1_C8", 
                    "title": "Lista todos los elementos", 
                    "description": "Escribe todos los archivos encontrados en el directorio.",
                    "v_type": "directory_listing_exact", 
                    "v_value": "README.txt,projects,logs,notes.txt"
                }
            ]
        },
        {
            "id": 9,
            "title": "Entrar y salir de directorios",
            "description": "### Guía de Lab\nLa navegación es una habilidad fundamental. Puedes combinar `cd`, `pwd` y `ls`.",
            "goal_description": "### Objetivos\nPracticar navegación básica entre directorios.",
            "step_by_step_guide": "### Guía Misión\n1. Entra al directorio projects: `cd projects`\n2. Comprueba la ruta con `pwd`.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({"directories": ["/home/student/projects"]}),
            "challenges": [
                {
                    "id": "L1_C9", 
                    "title": "Entrar al directorio projects", 
                    "v_type": "path_contains", 
                    "v_value": "projects"
                }
            ]
        },
        {
            "id": 10,
            "title": "Navegación completa",
            "description": "### Guía de Lab\nEste laboratorio combina todo lo aprendido hasta ahora.",
            "goal_description": "### Objetivos\nPracticar navegación completa por el sistema de archivos.",
            "step_by_step_guide": "### Guía Misión\n1. Lista los archivos.\n2. Entra al directorio logs.\n3. Comprueba tu ubicación.",
            "difficulty": "easy",
            "category": "Linux",
            "scenario_setup": json.dumps({"directories": ["/home/student/logs"]}),
            "challenges": [
                {
                    "id": "L1_C10", 
                    "title": "Navegar hasta logs", 
                    "v_type": "path_contains", 
                    "v_value": "logs"
                }
            ]
        }
    ]

    # L2 Labs Data
    l2_labs = [
        {
            "id": 11,
            "title": "Introducción a los usuarios",
            "difficulty": "easy",
            "description": "### Guía de Lab\nLinux es un sistema multiusuario. Cada usuario tiene su propio directorio y permisos específicos.\n\nEl comando que permite ver el usuario actual es: `whoami`.",
            "goal_description": "### Objetivos\nAprender a identificar el usuario actual en el sistema.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta el comando: `whoami`\n2. Observa el resultado.\n3. Introduce el nombre del usuario actual.",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L2_C1",
                    "title": "Identificar el usuario actual",
                    "v_type": "file_content_flag",
                    "v_value": "student"
                }
            ]
        },
        {
            "id": 12,
            "title": "Crear tu primer usuario",
            "difficulty": "easy",
            "description": "### Guía de Lab\nLinux permite crear nuevos usuarios usando: `useradd`. Esto crea una nueva cuenta en el sistema.",
            "goal_description": "### Objetivos\nAprender a crear usuarios.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `sudo useradd hacker`\n2. Comprueba que existe revisando el archivo: `/etc/passwd`.",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L2_C2",
                    "title": "Crear usuario hacker",
                    "v_type": "file_content_flag",
                    "v_value": "hacker"
                }
            ]
        },
        {
            "id": 13,
            "title": "Crear grupos",
            "difficulty": "easy",
            "description": "### Guía de Lab\nLos grupos permiten organizar usuarios. Puedes crear un grupo usando: `groupadd`.",
            "goal_description": "### Objetivos\nAprender a crear grupos.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `sudo groupadd pentesters`\n2. Comprueba que el grupo existe revisando: `/etc/group`.",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L2_C3",
                    "title": "Crear grupo pentesters",
                    "v_type": "file_content_flag",
                    "v_value": "pentesters"
                }
            ]
        },
        {
            "id": 14,
            "title": "Añadir usuarios a grupos",
            "difficulty": "medium",
            "description": "### Guía de Lab\nLos usuarios pueden pertenecer a varios grupos. Puedes añadir un usuario a un grupo usando: `usermod -aG`.",
            "goal_description": "### Objetivos\nAprender a añadir usuarios a grupos.",
            "step_by_step_guide": "### Guía Misión\n1. Añade el usuario hacker al grupo pentesters.\n2. Comprueba el grupo del usuario usando: `groups hacker`.",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L2_C4",
                    "title": "Añadir hacker al grupo pentesters",
                    "v_type": "file_content_flag",
                    "v_value": "pentesters"
                }
            ]
        },
        {
            "id": 15,
            "title": "Permisos de archivos",
            "difficulty": "easy",
            "description": "### Guía de Lab\nLinux controla el acceso a archivos mediante permisos. Puedes ver los permisos usando: `ls -l`.",
            "goal_description": "### Objetivos\nAprender a identificar permisos de archivos.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `ls -l secret.txt`\n2. Observa los permisos.\n3. Escríbelos exactamente.",
            "category": "Linux",
            "scenario_setup": json.dumps({"files": [{"path": "/home/student/secret.txt", "content": "top secret"}]}),
            "challenges": [
                {
                    "id": "L2_C5",
                    "title": "Identificar permisos",
                    "v_type": "file_content_flag",
                    "v_value": "-rw-r--r--"
                }
            ]
        },
        {
            "id": 16,
            "title": "Modificar permisos",
            "difficulty": "medium",
            "description": "### Guía de Lab\nPuedes modificar permisos usando: `chmod`. Ejemplo: `chmod 600 archivo`.",
            "goal_description": "### Objetivos\nAprender a modificar permisos.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `chmod 600 secret.txt`\n2. Comprueba con: `ls -l`.",
            "category": "Linux",
            "scenario_setup": json.dumps({"files": [{"path": "/home/student/secret.txt", "content": "top secret"}]}),
            "challenges": [
                {
                    "id": "L2_C6",
                    "title": "Establecer permisos 600",
                    "v_type": "permission_set",
                    "v_value": "600",
                    "v_extra": "/home/student/secret.txt"
                }
            ]
        },
        {
            "id": 17,
            "title": "Permisos para grupos",
            "difficulty": "medium",
            "description": "### Guía de Lab\nPuedes permitir acceso a un grupo usando `chmod`. Ejemplo: `chmod 640 archivo`.",
            "goal_description": "### Objetivos\nConfigurar permisos para grupos.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `chmod 640 report.txt`\n2. Comprueba los permisos.",
            "category": "Linux",
            "scenario_setup": json.dumps({"files": [{"path": "/home/student/report.txt", "content": "monthly report"}]}),
            "challenges": [
                {
                    "id": "L2_C7",
                    "title": "Configurar permisos 640",
                    "v_type": "permission_set",
                    "v_value": "640",
                    "v_extra": "/home/student/report.txt"
                }
            ]
        },
        {
            "id": 18,
            "title": "Cambiar propietario",
            "difficulty": "medium",
            "description": "### Guía de Lab\nLinux permite cambiar el propietario de archivos usando: `chown`.",
            "goal_description": "### Objetivos\nAprender a cambiar el propietario de un archivo.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `sudo chown hacker secret.txt`\n2. Comprueba con: `ls -l`.",
            "category": "Linux",
            "scenario_setup": json.dumps({"files": [{"path": "/home/student/secret.txt", "content": "top secret"}]}),
            "challenges": [
                {
                    "id": "L2_C8",
                    "title": "Cambiar propietario a hacker",
                    "v_type": "file_content_flag",
                    "v_value": "hacker"
                }
            ]
        },
        {
            "id": 19,
            "title": "Cambiar grupo de archivo",
            "difficulty": "medium",
            "description": "### Guía de Lab\nTambién puedes cambiar el grupo de un archivo. Comando: `chown :grupo archivo`.",
            "goal_description": "### Objetivos\nAsignar archivos a grupos.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `sudo chown :pentesters report.txt`\n2. Comprueba con: `ls -l`.",
            "category": "Linux",
            "scenario_setup": json.dumps({"files": [{"path": "/home/student/report.txt", "content": "monthly report"}]}),
            "challenges": [
                {
                    "id": "L2_C9",
                    "title": "Asignar grupo pentesters",
                    "v_type": "file_content_flag",
                    "v_value": "pentesters"
                }
            ]
        },
        {
            "id": 20,
            "title": "Permisos avanzados",
            "difficulty": "medium",
            "description": "### Guía de Lab\nLos permisos pueden representarse en formato numérico. Ejemplo: 755, 644, 600.",
            "goal_description": "### Objetivos\nPracticar permisos numéricos.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `chmod 755 script.sh`\n2. Comprueba los permisos.",
            "category": "Linux",
            "scenario_setup": json.dumps({"files": [{"path": "/home/student/script.sh", "content": "#!/bin/bash\necho test"}]}),
            "challenges": [
                {
                    "id": "L2_C10",
                    "title": "Configurar permisos 755",
                    "v_type": "permission_set",
                    "v_value": "755",
                    "v_extra": "/home/student/script.sh"
                }
            ]
        },
        {
            "id": 21,
            "title": "Eliminar usuarios",
            "difficulty": "medium",
            "description": "### Guía de Lab\nPuedes eliminar usuarios usando: `userdel`.",
            "goal_description": "### Objetivos\nAprender a eliminar usuarios.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `sudo userdel hacker`\n2. Comprueba que ya no existe.",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L2_C11",
                    "title": "Eliminar usuario hacker",
                    "v_type": "file_content_flag",
                    "v_value": "removed"
                }
            ]
        },
        {
            "id": 22,
            "title": "Gestión completa de usuarios",
            "difficulty": "medium",
            "description": "### Guía de Lab\nEn este laboratorio combinarás todo lo aprendido.",
            "goal_description": "### Objetivos\nCrear usuario, crear grupo, añadir usuario al grupo y configurar permisos.",
            "step_by_step_guide": "### Guía Misión\n1. Crea usuario analyst.\n2. Crea grupo security.\n3. Añade analyst al grupo.\n4. Crea archivo report.txt.\n5. Asigna permisos 640.",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L2_C12_1",
                    "title": "Crear usuario analyst",
                    "v_type": "file_content_flag",
                    "v_value": "analyst"
                }
            ]
        }
    ]


    # L3 Labs Data
    l3_labs = [
        {
            "id": 23,
            "title": "Procesos en Linux",
            "difficulty": "easy",
            "description": "### Guía de Lab\nEn Linux todo lo que se ejecuta es un proceso.\n\nPuedes ver los procesos activos con el comando:\n\n`ps` \n\nEste comando muestra información sobre los procesos que se están ejecutando.",
            "goal_description": "### Objetivos\nAprender a visualizar procesos activos.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta el comando: `ps` \n2. Observa los procesos activos.\n3. Identifica el proceso bash.",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L3_C1",
                    "title": "Identificar proceso bash",
                    "v_type": "file_content_flag",
                    "v_value": "bash"
                }
            ]
        },
        {
            "id": 24,
            "title": "Lista completa de procesos",
            "difficulty": "easy",
            "description": "### Guía de Lab\nEl comando ps también puede mostrar todos los procesos del sistema.\n\nSe utiliza:\n\n`ps aux` ",
            "goal_description": "### Objetivos\nAprender a listar todos los procesos activos del sistema.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `ps aux` \n2. Observa la lista completa de procesos.\n3. Encuentra el proceso que ejecuta bash.",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L3_C2",
                    "title": "Encontrar proceso bash en ps aux",
                    "v_type": "file_content_flag",
                    "v_value": "bash"
                }
            ]
        },
        {
            "id": 25,
            "title": "Monitorización en tiempo real",
            "difficulty": "easy",
            "description": "### Guía de Lab\nLinux permite ver los procesos en tiempo real usando:\n\n`top` \n\nEste comando muestra el uso de CPU y memoria.",
            "goal_description": "### Objetivos\nAprender a monitorizar procesos del sistema.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `top` \n2. Observa los procesos activos.\n3. Sal del programa usando la tecla q.",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L3_C3",
                    "title": "Abrir monitor de procesos",
                    "v_type": "file_content_flag",
                    "v_value": "top"
                }
            ]
        },
        {
            "id": 26,
            "title": "Crear procesos en segundo plano",
            "difficulty": "easy",
            "description": "### Guía de Lab\nPuedes ejecutar procesos en segundo plano usando el símbolo:\n\n`&` \n\nEjemplo:\n\n`sleep 60 &` ",
            "goal_description": "### Objetivos\nAprender a ejecutar procesos en background.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `sleep 60 &` \n2. Comprueba el proceso con:\n\n`ps` ",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L3_C4",
                    "title": "Crear proceso sleep",
                    "v_type": "file_content_flag",
                    "v_value": "sleep"
                }
            ]
        },
        {
            "id": 27,
            "title": "Identificar procesos",
            "difficulty": "easy",
            "description": "### Guía de Lab\nCada proceso tiene un identificador llamado PID.\n\nPuedes verlo usando:\n\n`ps` ",
            "goal_description": "### Objetivos\nAprender a identificar el PID de un proceso.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `sleep 100 &` \n2. Ejecuta:\n\n`ps` \n3. Busca el proceso sleep.",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L3_C5",
                    "title": "Identificar proceso sleep",
                    "v_type": "file_content_flag",
                    "v_value": "sleep"
                }
            ]
        },
        {
            "id": 28,
            "title": "Finalizar procesos",
            "difficulty": "medium",
            "description": "### Guía de Lab\nPuedes finalizar procesos usando:\n\n`kill PID` \n\nEsto envía una señal al proceso.",
            "goal_description": "### Objetivos\nAprender a terminar procesos manualmente.",
            "step_by_step_guide": "### Guía Misión\n1. Crea un proceso:\n\n`sleep 200 &` \n2. Encuentra su PID usando ps.\n3. Finaliza el proceso usando kill.",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L3_C6",
                    "title": "Finalizar proceso sleep",
                    "v_type": "file_content_flag",
                    "v_value": "killed"
                }
            ]
        },
        {
            "id": 29,
            "title": "Procesos en segundo plano",
            "difficulty": "medium",
            "description": "### Guía de Lab\nLos procesos pueden ejecutarse en background.\n\nPuedes verlos usando:\n\n`jobs` ",
            "goal_description": "### Objetivos\nAprender a gestionar procesos en background.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta:\n\n`sleep 120 &` \n2. Ejecuta:\n\n`jobs` ",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L3_C7",
                    "title": "Ver procesos en background",
                    "v_type": "file_content_flag",
                    "v_value": "sleep"
                }
            ]
        },
        {
            "id": 30,
            "title": "Reanudar procesos",
            "difficulty": "medium",
            "description": "### Guía de Lab\nPuedes suspender procesos usando:\n\nCTRL+Z\n\nY reanudarlos usando:\n\n`fg` ",
            "goal_description": "### Objetivos\nAprender a suspender y reanudar procesos.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta:\n\n`sleep 200` \n2. Suspende con CTRL+Z.\n3. Reanuda con:\n\n`fg` ",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L3_C8",
                    "title": "Reanudar proceso suspendido",
                    "v_type": "file_content_flag",
                    "v_value": "sleep"
                }
            ]
        },
        {
            "id": 31,
            "title": "Prioridad de procesos",
            "difficulty": "medium",
            "description": "### Guía de Lab\nLinux permite cambiar la prioridad de los procesos usando:\n\n`nice` ",
            "goal_description": "### Objetivos\nAprender a ejecutar procesos con prioridad distinta.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta:\n\n`nice -n 10 sleep 100` \n2. Comprueba el proceso con ps.",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L3_C9",
                    "title": "Ejecutar proceso con nice",
                    "v_type": "file_content_flag",
                    "v_value": "sleep"
                }
            ]
        },
        {
            "id": 32,
            "title": "Gestión completa de procesos",
            "difficulty": "medium",
            "description": "### Guía de Lab\nEn este laboratorio usarás varios comandos aprendidos.\n\nps\ntop\nkill\njobs",
            "goal_description": "### Objetivos\nPracticar gestión completa de procesos.",
            "step_by_step_guide": "### Guía Misión\n1. Crea proceso:\n\n`sleep 300 &` \n2. Encuentra el PID.\n3. Finaliza el proceso.",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L3_C10_1",
                    "title": "Crear proceso sleep",
                    "v_type": "file_content_flag",
                    "v_value": "sleep"
                },
                {
                    "id": "L3_C10_2",
                    "title": "Finalizar proceso",
                    "v_type": "file_content_flag",
                    "v_value": "killed"
                }
            ]
        }
    ]


    # L4 Labs Data
    l4_labs = [
        {
            "id": 33,
            "title": "Crear archivos con touch",
            "difficulty": "easy",
            "description": "### Guía de Lab\nEl comando touch se utiliza para crear archivos vacíos en Linux.\n\n`touch archivo.txt` \n\nEsto crea un archivo llamado archivo.txt si no existe.",
            "goal_description": "### Objetivos\nAprender a crear archivos vacíos y usar touch correctamente.",
            "step_by_step_guide": "### Guía Misión\n1. Ejecuta: `touch notes.txt` \n2. Comprueba con `ls` \n3. Crea varios: `touch tareas.txt ideas.txt` ",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L4_C1",
                    "title": "Crear archivo notes.txt",
                    "v_type": "file_content_flag",
                    "v_value": "notes.txt"
                }
            ]
        },
        {
            "id": 34,
            "title": "Copiar archivos con cp",
            "difficulty": "easy",
            "description": "### Guía de Lab\nEl comando cp se utiliza para copiar archivos o directorios.\n\n`cp archivo.txt copia.txt` ",
            "goal_description": "### Objetivos\nAprender a copiar archivos y crear copias de seguridad.",
            "step_by_step_guide": "### Guía Misión\n1. Crea: `touch original.txt` \n2. Copia: `cp original.txt copia.txt` \n3. Verifica con `ls` ",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L4_C2",
                    "title": "Crear copia del archivo",
                    "v_type": "file_content_flag",
                    "v_value": "copia.txt"
                }
            ]
        },
        {
            "id": 35,
            "title": "Mover y renombrar archivos con mv",
            "difficulty": "easy",
            "description": "### Guía de Lab\nEl comando mv permite mover archivos entre directorios o cambiar su nombre.\n\n`mv archivo.txt nuevo_nombre.txt` ",
            "goal_description": "### Objetivos\nAprender a renombrar y mover archivos.",
            "step_by_step_guide": "### Guía Misión\n1. Crea: `touch temporal.txt` \n2. Renombra: `mv temporal.txt final.txt` \n3. Comprueba con `ls` ",
            "category": "Linux",
            "challenges": [
                {
                    "id": "L4_C3",
                    "title": "Renombrar archivo correctamente",
                    "v_type": "file_content_flag",
                    "v_value": "final.txt"
                }
            ]
        },
        {
            "id": 36,
            "title": "Eliminar archivos con rm",
            "difficulty": "medium",
            "description": "### Guía de Lab\nEl comando rm permite eliminar archivos del sistema definitivamente.\n\n`rm archivo.txt` ",
            "goal_description": "### Objetivos\nAprender a eliminar archivos con seguridad.",
            "step_by_step_guide": "### Guía Misión\n1. Crea: `touch eliminar.txt` \n2. Elimina: `rm eliminar.txt` \n3. Comprueba que no existe.",
            "category": "Linux",
            "challenges": []
        },
        {
            "id": 37,
            "title": "Eliminar directorios con rm -rf",
            "difficulty": "medium",
            "description": "### Guía de Lab\nEl comando rm -rf permite eliminar directorios completos de forma recursiva y forzada.",
            "goal_description": "### Objetivos\nAprender a eliminar directorios completos con cuidado.",
            "step_by_step_guide": "### Guía Misión\n1. Crea carpeta: `mkdir pruebas` \n2. Crea archivo dentro: `touch pruebas/test.txt` \n3. Elimina: `rm -rf pruebas` \n4. Comprueba con `ls` ",
            "category": "Linux",
            "challenges": []
        }
    ]


    def insert_labs(labs_data, module_id):
        for l_data in labs_data:
            lab = Lab(
                id=l_data["id"],
                module_id=module_id,
                title=l_data["title"],
                description=l_data["description"],
                goal_description=l_data["goal_description"],
                difficulty=l_data.get("difficulty", "medium"),
                category=l_data.get("category", "Linux"),
                scenario_setup=l_data.get("scenario_setup"),
                step_by_step_guide=l_data["step_by_step_guide"],
                is_active=True,
                xp_reward=150
            )
            db.merge(lab)
            
            # Add challenges
            for idx, c_data in enumerate(l_data["challenges"]):
                challenge = Challenge(
                    id=c_data["id"],
                    lab_id=l_data["id"],
                    title=c_data["title"],
                    description=c_data.get("description", ""),
                    validation_type=c_data["v_type"],
                    validation_value=c_data["v_value"],
                    validation_extra=c_data.get("v_extra"),
                    order_index=idx,
                    xp=20,
                    hints=c_data.get("hints")
                )
                db.merge(challenge)

    insert_labs(l1_labs, l1_module.id)
    insert_labs(l2_labs, l2_module.id)
    insert_labs(l3_labs, l3_module.id)
    insert_labs(l4_labs, l4_module.id)

    db.commit()
    print(f"✅ Skill Path: {linux_path.title}")
    print(f"✅ Module: {l1_module.title}")
    print(f"✅ Module: {l2_module.title}")
    print(f"✅ Module: {l3_module.title}")
    print(f"✅ Module: {l4_module.title}")
    print(f"✅ {len(l1_labs) + len(l2_labs) + len(l3_labs) + len(l4_labs)} labs seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_linux_fundamentals()
