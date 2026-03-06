import json
import os
import sys
from datetime import datetime

# Adjust path to import from parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import SessionLocal, Lab, Challenge, UserLabCompletion, UserChallengeCompletion, SkillPath, Module, create_tables

def seed_linux_fundamentals():
    db = SessionLocal()
    # Create tables if not exists
    create_tables()

    # Clear existing hierarchy to avoid duplication
    db.query(UserChallengeCompletion).delete()
    db.query(UserLabCompletion).delete()
    db.query(Challenge).delete()
    db.query(Lab).delete()
    db.query(Module).delete()
    db.query(SkillPath).delete()
    db.commit()

    # 1. Create Skill Path
    linux_path = SkillPath(
        title="Linux Fundamentals",
        description="Domina la terminal de Linux desde cero. Navegación, gestión de archivos, permisos y más.",
        difficulty="easy",
        order_index=1
    )
    db.add(linux_path)
    db.commit()
    db.refresh(linux_path)

    # 2. Create Module L1
    l1_module = Module(
        skill_path_id=linux_path.id,
        title="Linux Labs L1 — Terminal Basics",
        description="Aprende los conceptos fundamentales de la línea de comandos de Linux.",
        order_index=1
    )
    db.add(l1_module)
    db.commit()
    db.refresh(l1_module)

    # 3. Create Module L2
    l2_module = Module(
        skill_path_id=linux_path.id,
        title="Linux Labs L2 — Users and Permissions",
        description="Gestión de usuarios, grupos y permisos de archivos en sistemas Linux.",
        order_index=2
    )
    db.add(l2_module)
    db.commit()
    db.refresh(l2_module)

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
                },
                {
                    "id": "L2_C12_2",
                    "title": "Crear grupo security",
                    "v_type": "file_content_flag",
                    "v_value": "security"
                },
                {
                    "id": "L2_C12_3",
                    "title": "Permisos correctos en report.txt",
                    "v_type": "permission_set",
                    "v_value": "640",
                    "v_extra": "/home/student/report.txt"
                }
            ]
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

    db.commit()
    print(f"✅ Skill Path: {linux_path.title}")
    print(f"✅ Module: {l1_module.title}")
    print(f"✅ Module: {l2_module.title}")
    print(f"✅ {len(l1_labs) + len(l2_labs)} labs seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_linux_fundamentals()
