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
            description="Domina la terminal de Linux desde cero.",
            difficulty="easy",
            order_index=10,
            is_active=True
        )
        db.add(path)
        db.commit()
        db.refresh(path)

    module = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M6 — Compresión y Archivado").first()
    if not module:
        module = Module(
            skill_path_id=path.id,
            title="M6 — Compresión y Archivado",
            description="Aprende a comprimir, archivar y gestionar archivos en Linux",
            order_index=7,
            is_active=True
        )
        db.add(module)
        db.commit()
        db.refresh(module)

    labs_data = [
        {
            "title": "tar: El Archivador Universal",
            "description": "Aprende a usar tar para crear, extraer y listar archivos",
            "goal_description": "Domina tar, la herramienta estándar de archivado en Linux. Comprenderás las opciones -c (crear), -x (extraer), -v (verbose), -f (archivo), -t (listar). Aprenderás a crear archivos con `tar -cvf archivo.tar dir/`, extraer con `tar -xvf`, y listar contenidos con `tar -tvf`. tar es fundamental para backups y distribución de código fuente.",
            "difficulty": "easy",
            "order_index": 1,
            "xp_reward": 150,
            "time_limit": 30,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/proyecto", "/home/student/backups"],
                "files": [
                    {
                        "path": "/home/student/proyecto/main.py",
                        "content": "print('hola')"
                    },
                    {
                        "path": "/home/student/proyecto/README.md",
                        "content": "# Mi Proyecto"
                    },
                    {
                        "path": "/home/student/proyecto/config.json",
                        "content": '{"version": "1.0"}'
                    }
                ]
            }),
            "step_by_step_guide": "1. Navega a /home/student\n2. Crea un archivo tar del directorio 'proyecto'\n3. Guarda el archivo como 'proyecto.tar' en el directorio 'backups'\n4. Verifica que el archivo se ha creado correctamente\n\n**Tips:**\n- Usa `tar -cvf` para crear un archivo tar con información detallada\n- El orden de flags es importante: -f debe ir al final\n- Puedes usar rutas relativas o absolutas",
            "challenges": [
                {
                    "title": "Crear archivo tar",
                    "description": "Crea un archivo tar del directorio proyecto en backups/",
                    "v_type": "file_created",
                    "v_value": "/home/student/backups/proyecto.tar",
                    "hints": ["Usa: tar -cvf backups/proyecto.tar proyecto/", "El flag -c crea, -v es verbose, -f especifica el nombre"]
                }
            ]
        },
        {
            "title": "gzip y bzip2: Compresión",
            "description": "Aprende a comprimir archivos con gzip, bzip2 y xz",
            "goal_description": "Comprenderás las herramientas de compresión: gzip (.gz), bzip2 (.bz2), xz (.xz). Sabrás que gzip es rápido, bzip2 comprime más, xz es más moderno. Aprenderás que `gzip archivo` reemplaza el original, `gzip -k` mantiene copia, `gunzip` extrae, `gzip -9` máxima compresión, y `zcat` lee sin extraer. Estos conceptos son clave para reducir tamaño en transferencias.",
            "difficulty": "easy",
            "order_index": 2,
            "xp_reward": 120,
            "time_limit": 25,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/datos"],
                "files": [
                    {
                        "path": "/home/student/datos/registro.txt",
                        "content": "2024-01-01 INFO Sistema OK\n2024-01-02 WARN Memoria alta\n2024-01-03 ERROR Disco lleno\n2024-01-04 INFO Backup ok\n2024-01-05 WARN CPU alta\n2024-01-06 INFO Red ok\n2024-01-07 ERROR Timeout\n2024-01-08 INFO OK\n2024-01-09 WARN Log grande\n2024-01-10 INFO Sistema OK\n2024-01-11 ERROR Servicio caido\n2024-01-12 INFO Reinicio\n2024-01-13 WARN Disco 80%\n2024-01-14 INFO OK\n2024-01-15 INFO Fin mes"
                    }
                ]
            }),
            "step_by_step_guide": "1. Navega a /home/student/datos\n2. Comprime el archivo registro.txt usando gzip\n3. Verifica el archivo comprimido\n\n**Tips:**\n- `gzip registro.txt` crea registro.txt.gz y elimina el original\n- Para mantener original usa `gzip -k registro.txt`\n- `zcat` o `gunzip -c` leen sin extraer\n- Puedes ver el nivel de compresión con `ls -lh`",
            "challenges": [
                {
                    "title": "Comprimir con gzip",
                    "description": "Comprime el archivo registro.txt con gzip",
                    "v_type": "file_created",
                    "v_value": "/home/student/datos/registro.txt.gz",
                    "hints": ["Usa: gzip /home/student/datos/registro.txt", "El comando crea .gz y elimina el original"]
                }
            ]
        },
        {
            "title": "tar + gzip: El Combo Perfecto",
            "description": "Combina tar y gzip en un solo comando",
            "goal_description": "Aprenderás el poderoso combo tar+gzip (tar.gz o .tgz). El flag -z en tar maneja gzip automáticamente: `tar -czvf` crea, `tar -xzvf` extrae. También conocerás -j para bzip2 (tar -cjvf) y -J para xz (tar -cJvf). Este es el formato estándar para distribuir software en Linux. Entenderás por qué tar.gz es ubícuo en el ecosistema Linux.",
            "difficulty": "easy",
            "order_index": 3,
            "xp_reward": 150,
            "time_limit": 35,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/proyecto_web", "/home/student/releases"],
                "files": [
                    {
                        "path": "/home/student/proyecto_web/index.html",
                        "content": "<html><body>Mi Web</body></html>"
                    },
                    {
                        "path": "/home/student/proyecto_web/style.css",
                        "content": "body{margin:0}"
                    },
                    {
                        "path": "/home/student/proyecto_web/app.js",
                        "content": "console.log('app')"
                    }
                ]
            }),
            "step_by_step_guide": "1. Navega a /home/student\n2. Crea un archivo tar.gz del directorio proyecto_web\n3. Guarda como 'proyecto_web.tar.gz' en releases/\n4. Verifica que se creó correctamente\n\n**Tips:**\n- El flag -z automáticamente maneja gzip en tar\n- `tar -czvf releases/proyecto_web.tar.gz proyecto_web/`\n- .tgz es equivalente a .tar.gz (ambos funcionan)\n- Para extraer: `tar -xzvf archivo.tar.gz`",
            "challenges": [
                {
                    "title": "Crear tar.gz",
                    "description": "Crea un archivo tar.gz del proyecto web en releases/",
                    "v_type": "file_created",
                    "v_value": "/home/student/releases/proyecto_web.tar.gz",
                    "hints": ["Usa: tar -czvf releases/proyecto_web.tar.gz proyecto_web/", "Flag -z automáticamente comprime con gzip"]
                }
            ]
        },
        {
            "title": "zip y unzip",
            "description": "Trabaja con archivos ZIP multiplataforma",
            "goal_description": "Conocerás zip, el formato multiplataforma estándar en Windows. Aunque tar.gz domina en Linux, zip es universal: `zip -r archivo.zip directorio/` (recursivo), `unzip archivo.zip` (extrae), `unzip -l` (lista), `unzip -d destino/` (extrae a otra ubicación). zip no comprime archivos individuales como gzip: archiva y comprime en un paso. Entenderás cuándo usar zip (compatibilidad Windows) vs tar.gz (estándar Linux).",
            "difficulty": "easy",
            "order_index": 4,
            "xp_reward": 120,
            "time_limit": 25,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/compartir", "/home/student/compartir/docs"],
                "files": [
                    {
                        "path": "/home/student/compartir/docs/informe.txt",
                        "content": "Informe mensual"
                    },
                    {
                        "path": "/home/student/compartir/docs/datos.csv",
                        "content": "nombre,valor\nitem1,100\nitem2,200"
                    }
                ]
            }),
            "step_by_step_guide": "1. Navega a /home/student/compartir\n2. Crea un archivo zip llamado 'documentos.zip'\n3. Incluye el directorio 'docs' y sus contenidos\n4. Verifica el zip creado\n\n**Tips:**\n- `zip -r documentos.zip docs/` archiva recursivamente\n- `unzip -l documentos.zip` lista contenidos sin extraer\n- zip es útil para compartir con usuarios Windows\n- zip también comprime, aunque gzip suele ser más eficiente en Linux",
            "challenges": [
                {
                    "title": "Crear ZIP",
                    "description": "Crea un archivo zip con los documentos",
                    "v_type": "file_created",
                    "v_value": "/home/student/compartir/documentos.zip",
                    "hints": ["Usa: zip -r documentos.zip docs/", "El flag -r incluye directorios recursivamente"]
                }
            ]
        },
        {
            "title": "Extracción Selectiva",
            "description": "Extrae solo ciertos archivos de un comprimido",
            "goal_description": "Aprenderás técnicas avanzadas de extracción. Extraer archivo específico: `tar -xvf archivo.tar ruta/al/archivo`. Extraer a otro directorio: `tar -xvf -C destino/`. Remover prefijos: `tar --strip-components=N`. Excluir archivos: `--exclude patrón`. Cuando trabajas con backups o distribuciones grandes, no siempre quieres todo: necesitas precisión. Estas técnicas te permiten ser quirúrgico.",
            "difficulty": "medium",
            "order_index": 5,
            "xp_reward": 175,
            "time_limit": 35,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/archivos", "/home/student/extraidos"],
                "files": [
                    {
                        "path": "/home/student/archivos/doc1.txt",
                        "content": "Documento 1"
                    },
                    {
                        "path": "/home/student/archivos/doc2.txt",
                        "content": "Documento 2"
                    },
                    {
                        "path": "/home/student/archivos/imagen.bak",
                        "content": "fake backup"
                    }
                ]
            }),
            "step_by_step_guide": "1. En /home/student/archivos, crea un tar que incluya todos los archivos\n2. Extrae selectivamente solo los .txt a /home/student/extraidos\n3. Verifica que solo doc1.txt y doc2.txt están en extraidos\n\n**Tips:**\n- Primero crea el tar: `tar -cvf archivos.tar -C archivos .`\n- Para extraer selectivo: `tar -xvf archivos.tar doc1.txt doc2.txt -C /home/student/extraidos`\n- O usa --exclude para omitir: `tar -xvf archivos.tar --exclude='*.bak'`\n- Verifica con `ls /home/student/extraidos`",
            "challenges": [
                {
                    "title": "Extraer selectivamente",
                    "description": "Crea el archivo y luego extrae solo los documentos .txt",
                    "v_type": "directory_created",
                    "v_value": "/home/student/extraidos",
                    "hints": ["Primero crea tar de archivos/", "Luego extrae selectivamente a extraidos/", "Asegúrate de que imagen.bak NO está en extraidos"]
                }
            ]
        },
        {
            "title": "Backups con tar",
            "description": "Crea un sistema de backups robusto",
            "goal_description": "Trabajarás en el mundo real de backups. Tipos: full (todo), incremental (desde último backup), differential (desde último full). Flag `--newer` para incremental: `tar --newer=file.tar -cvf incremental.tar datos/`. Naming con timestamp: `tar -cvf backup_$(date +%Y%m%d_%H%M%S).tar datos/`. Estrategia de rotación (mantener N backups). **Crítico**: siempre testa restauraciones. Un backup no probado es un backup roto. Aprenderás a ser confiable.",
            "difficulty": "medium",
            "order_index": 6,
            "xp_reward": 250,
            "time_limit": 45,
            "scenario_setup": json.dumps({
                "directories": [
                    "/home/student/datos_importantes",
                    "/home/student/datos_importantes/configs",
                    "/home/student/datos_importantes/scripts",
                    "/home/student/backups"
                ],
                "files": [
                    {
                        "path": "/home/student/datos_importantes/configs/app.conf",
                        "content": "debug=true"
                    },
                    {
                        "path": "/home/student/datos_importantes/scripts/run.sh",
                        "content": "#!/bin/bash\necho run"
                    }
                ]
            }),
            "step_by_step_guide": "1. En /home/student, diseña una estrategia de backup para datos_importantes/\n2. Crea un script bash (o comandos) que realice backup con timestamp\n3. Guarda el backup en /home/student/backups con nombre que incluya fecha\n4. Valida que el backup contiene los archivos correctos\n5. Practica una restauración selectiva\n\n**Tips:**\n- Usa `date +%Y%m%d_%H%M%S` para timestamp\n- Implementa rotación: mantén solo últimos 5 backups\n- Siempre verifica: `tar -tvf backup_*.tar` antes de confiar\n- Documenta la estrategia en un archivo README\n- Considera crear un script cron para automatizar (siguiente módulo)",
            "challenges": [
                {
                    "title": "Crear estructura de backups",
                    "description": "Implementa un sistema de backups con timestamps",
                    "v_type": "directory_created",
                    "v_value": "/home/student/backups",
                    "hints": ["Crea al menos un backup en backups/", "Incluye timestamp en el nombre del archivo", "Verifica el contenido con tar -tvf"]
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

    print(f"✅ Terminal Skills - M6 Compresión y Archivado seeded OK")
    db.close()

if __name__ == "__main__":
    seed()
