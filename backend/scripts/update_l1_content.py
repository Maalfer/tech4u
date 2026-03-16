import json
from sqlalchemy.orm import Session
from database import SessionLocal, Module, Lab, Challenge, UserLabCompletion, UserChallengeCompletion

def update_l1_content():
    db = SessionLocal()
    try:
        # 1. Encuentra el módulo Linux Labs L1
        module = db.query(Module).filter(Module.title.like("%Linux Labs L1%")).first()
        if not module:
            print("❌ Módulo 'Linux Labs L1' no encontrado.")
            return

        print(f"🚀 Refactorizando contenido para el módulo: {module.title} (ID: {module.id})")

        # 2. Eliminar labs y retos anteriores (y progresos asociados para evitar huérfanos)
        old_labs = db.query(Lab).filter(Lab.module_id == module.id).all()
        old_lab_ids = [l.id for l in old_labs]
        
        if old_lab_ids:
            print(f"🧹 Eliminando {len(old_lab_ids)} laboratorios antiguos y su progreso...")
            db.query(UserLabCompletion).filter(UserLabCompletion.lab_id.in_(old_lab_ids)).delete(synchronize_session=False)
            db.query(UserChallengeCompletion).filter(UserChallengeCompletion.lab_id.in_(old_lab_ids)).delete(synchronize_session=False)
            db.query(Challenge).filter(Challenge.lab_id.in_(old_lab_ids)).delete(synchronize_session=False)
            db.query(Lab).filter(Lab.module_id == module.id).delete(synchronize_session=False)
            db.commit()

        # 3. Definir los nuevos 6 laboratorios premium
        new_labs = [
            {
                "title": "Exploring the File System (ls)",
                "difficulty": "easy",
                "xp_reward": 50,
                "description": "Introduce the Linux filesystem and explain how directories contain files and subdirectories.\n\nExplain the command ls and its variants:\n- ls\n- ls -l\n- ls -a\n- ls -la\n- ls -lh\n\nExplain each column of ls -l:\n- permissions\n- owner\n- group\n- file size\n- modification date\n- file name",
                "goal_description": "Understand how to list directory contents\nIdentify hidden files\nInterpret file listing details",
                "step_by_step_guide": "1. Run ls\n2. Run ls -l\n3. Run ls -a\n4. Run ls -lh",
                "scenario_setup": json.dumps({
                    "directories": ["/home/student/projects", "/home/student/logs"],
                    "files": [
                        {"path": "/home/student/README.txt", "content": "FLAG{welcome_to_linux}"},
                        {"path": "/home/student/.hidden_file", "content": "You found me!"}
                    ],
                    "commands": [
                        "echo 'export PS1=\"student@tech4uacademy:\\w\\$ \"' >> /home/student/.bashrc"
                    ]
                }),
                "challenges": [
                    {
                        "id": "L1_C1",
                        "title": "Listar archivos",
                        "description": "Usa el comando ls para ver qué hay en tu directorio personal.",
                        "validation_type": "command_output_contains",
                        "validation_value": "ls",
                        "validation_extra": "README.txt",
                        "xp": 10
                    },
                    {
                        "id": "L1_C2",
                        "title": "Archivos ocultos",
                        "description": "Usa ls -a para encontrar el archivo oculto.",
                        "validation_type": "command_output_contains",
                        "validation_value": "ls -a",
                        "validation_extra": ".hidden_file",
                        "xp": 20
                    }
                ]
            },
            {
                "title": "Navigation and Location (pwd & cd)",
                "difficulty": "easy",
                "xp_reward": 50,
                "description": "Explain how Linux users navigate the filesystem.\n\nCommands explained:\n- pwd\n- cd\n- cd ..\n- cd ~\n- cd /",
                "goal_description": "Identify the current working directory\nMove between directories\nUnderstand directory hierarchy",
                "step_by_step_guide": "1. Run pwd\n2. Navigate into projects\n3. Navigate back with cd ..\n4. Return to home with cd ~",
                "scenario_setup": json.dumps({
                    "directories": ["/home/student/projects", "/home/student/logs"],
                    "files": [
                        {"path": "/home/student/projects/project_notes.txt", "content": "Notes about work."},
                        {"path": "/home/student/logs/system.log", "content": "Log entries here."}
                    ],
                    "commands": [
                        "echo 'export PS1=\"student@tech4uacademy:\\w\\$ \"' >> /home/student/.bashrc"
                    ]
                }),
                "challenges": [
                    {
                        "id": "L1_C3",
                        "title": "¿Dónde estoy?",
                        "description": "Usa pwd para confirmar tu ubicación actual.",
                        "validation_type": "command_output_contains",
                        "validation_value": "pwd",
                        "validation_extra": "/home/student",
                        "xp": 25
                    },
                    {
                        "id": "L1_C4",
                        "title": "Entrar en Proyectos",
                        "description": "Navega al directorio 'projects' usando cd.",
                        "validation_type": "path_exact",
                        "validation_value": "/home/student/projects",
                        "xp": 25
                    }
                ]
            },
            {
                "title": "Reading Files (cat, less, head, tail)",
                "difficulty": "easy",
                "xp_reward": 60,
                "description": "Explain how administrators inspect file content.\n\nCommands:\n- cat\n- less\n- head\n- tail",
                "goal_description": "Display file contents\nInspect log files\nPreview long files",
                "step_by_step_guide": "1. Use cat README.txt\n2. Use less system.log\n3. Use head system.log\n4. Use tail system.log",
                "scenario_setup": json.dumps({
                    "directories": ["/home/student/logs"],
                    "files": [
                        {"path": "/home/student/README.txt", "content": "FLAG{reading_files}"},
                        {"path": "/home/student/logs/system.log", "content": "\n".join([f"Log line {i}" for i in range(50)])}
                    ],
                    "commands": [
                        "echo 'export PS1=\"student@tech4uacademy:\\w\\$ \"' >> /home/student/.bashrc"
                    ]
                }),
                "challenges": [
                    {
                        "id": "L1_C5",
                        "title": "Leer el README",
                        "description": "Usa cat para leer el contenido de README.txt.",
                        "validation_type": "command_output_contains",
                        "validation_value": "cat README.txt",
                        "validation_extra": "FLAG{reading_files}",
                        "xp": 30
                    }
                ]
            },
            {
                "title": "Creating Files and Directories (mkdir, touch)",
                "difficulty": "easy",
                "xp_reward": 60,
                "description": "Explain how directories and files are created.\n\nCommands:\n- mkdir\n- touch",
                "goal_description": "Create directories\nCreate files\nVerify filesystem structure",
                "step_by_step_guide": "1. Create a directory projects\n2. Enter it\n3. Create file notes.txt\n4. Verify with ls",
                "scenario_setup": json.dumps({
                    "directories": [],
                    "commands": [
                        "echo 'export PS1=\"student@tech4uacademy:\\w\\$ \"' >> /home/student/.bashrc"
                    ]
                }),
                "challenges": [
                    {
                        "id": "L1_C6",
                        "title": "Nuevo Directorio",
                        "description": "Crea un directorio llamado 'projects'.",
                        "validation_type": "directory_exists",
                        "validation_value": "/home/student/projects",
                        "xp": 30
                    }
                ]
            },
            {
                "title": "Managing Files (cp, mv, rm)",
                "difficulty": "medium",
                "xp_reward": 70,
                "description": "Explain file manipulation operations.\n\nCommands:\n- cp\n- mv\n- rm",
                "goal_description": "Copy files\nMove files\nDelete files",
                "step_by_step_guide": "1. Copy report.txt to backup.txt\n2. Move backup.txt to projects\n3. Delete backup.txt",
                "scenario_setup": json.dumps({
                    "directories": ["/home/student/projects"],
                    "files": [
                        {"path": "/home/student/report.txt", "content": "FLAG{file_management}"}
                    ],
                    "commands": [
                        "echo 'export PS1=\"student@tech4uacademy:\\w\\$ \"' >> /home/student/.bashrc"
                    ]
                }),
                "challenges": [
                    {
                        "id": "L1_C7",
                        "title": "Clonar informe",
                        "description": "Copia report.txt a backup.txt.",
                        "validation_type": "file_exists",
                        "validation_value": "/home/student/backup.txt",
                        "xp": 35
                    }
                ]
            },
            {
                "title": "Final Practical Assessment",
                "difficulty": "medium",
                "xp_reward": 100,
                "description": "A practical evaluation combining all previous skills.\n\nStudents must navigate directories, read files, and manipulate filesystem content.",
                "goal_description": "Demonstrate understanding of navigation\nWork with files and directories\nApply multiple commands together",
                "step_by_step_guide": "1. Navigate to projects\n2. Read README.txt\n3. Create directory test\n4. Copy a file into test\n5. Remove the copied file",
                "scenario_setup": json.dumps({
                    "directories": ["/home/student/projects", "/home/student/logs"],
                    "files": [
                        {"path": "/home/student/README.txt", "content": "FLAG{linux_fundamentals_complete}"}
                    ],
                    "commands": [
                        "echo 'export PS1=\"student@tech4uacademy:\\w\\$ \"' >> /home/student/.bashrc"
                    ]
                }),
                "challenges": [
                    {
                        "id": "L1_C8",
                        "title": "La Gran Final",
                        "description": "Lee el README.txt para obtener la flag final.",
                        "validation_type": "command_output_contains",
                        "validation_value": "cat README.txt",
                        "validation_extra": "FLAG{linux_fundamentals_complete}",
                        "xp": 100
                    }
                ]
            }
        ]

        # 4. Insertar los nuevos labs
        for idx, lab_data in enumerate(new_labs):
            challenges_data = lab_data.pop("challenges")
            lab = Lab(
                module_id=module.id,
                order_index=idx,
                is_active=True,
                docker_image="ubuntu:22.04",
                **lab_data
            )
            db.add(lab)
            db.flush() # Para obtener lab.id

            for c_idx, c_data in enumerate(challenges_data):
                challenge = Challenge(
                    lab_id=lab.id,
                    order_index=c_idx,
                    **c_data
                )
                db.add(challenge)

        db.commit()
        print("✅ Refactorización completada con éxito.")

    except Exception as e:
        print(f"❌ Error durante la actualización: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_l1_content()
