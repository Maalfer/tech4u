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

    # MODULE A: M7 — Cron y Automatización
    module_m7 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M7 — Cron y Automatización").first()
    if not module_m7:
        module_m7 = Module(
            skill_path_id=path.id,
            title="M7 — Cron y Automatización",
            description="Automatiza tareas repetitivas en Linux con cron, at y watch",
            order_index=8,
            is_active=True
        )
        db.add(module_m7)
        db.commit()
        db.refresh(module_m7)

    labs_data_m7 = [
        {
            "title": "Introducción a cron",
            "description": "Aprende el demonio cron y la sintaxis crontab",
            "goal_description": "Entenderás cron, el demonio que ejecuta tareas automáticamente en Linux. **Sintaxis crontab: 5 campos** = `minute hour dayOfMonth month dayOfWeek command`. **Valores**: números (0-59 para min, 0-23 para hour), * (cualquier valor), */N (cada N unidades, ej */5 cada 5min), rango 1-5, lista 1,3,5. **Ejemplos prácticos**: `0 2 * * *` diario 2am, `*/15 * * * *` cada 15min, `0 9 * * 1-5` weekdays 9am, `30 3 1 * *` primer día mes 3:30am. **Comandos**: `crontab -e` editar, `crontab -l` listar, `crontab -r` borrar. **Archivos del sistema**: `/etc/cron.d/`, `/etc/cron.daily/`. **Crítico**: PATH vacío en cron, redirigir output, manejo de logs. Cron es la piedra angular de la automatización en servidores.",
            "difficulty": "easy",
            "order_index": 1,
            "xp_reward": 120,
            "time_limit": 30,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/cron_scripts", "/home/student/logs_cron"]
            }),
            "step_by_step_guide": "1. Navega a /home/student\n2. Crea un crontab básico (usa `crontab -e`)\n3. Agrega una entrada que imprima un mensaje cada día a las 9:00 AM\n4. Redirige la salida a un archivo de log\n5. Verifica tu crontab con `crontab -l`\n\n**Tips:**\n- El sintaxis es: minute hour day month dayofweek command\n- Usa valores correctos: 0-59 minutos, 0-23 horas\n- Especifica rutas absolutas para comandos\n- Redirige output: `>> /home/student/logs_cron/mi_tarea.log 2>&1`\n- Guarda con Ctrl+O, Ctrl+X en nano",
            "challenges": [
                {
                    "title": "Crear entrada crontab",
                    "description": "Crea una entrada de crontab válida",
                    "v_type": "directory_created",
                    "v_value": "/home/student/cron_scripts",
                    "hints": ["Usa crontab -e para editar", "Formato: minuto hora día mes dayofweek comando", "Verifica con crontab -l"]
                }
            ]
        },
        {
            "title": "Scripts para cron",
            "description": "Escribe scripts bash optimizados para ejecución cron",
            "goal_description": "No todos los scripts funcionan igual en cron que interactivamente. **Mejores prácticas**: usar rutas absolutas (no relativas), redirigir stdout/stderr a logs, usar timestamps en logs: `echo \"[$(date '+%Y-%m-%d %H:%M:%S')] evento\"`, probar scripts **siempre manualmente primero**, usar shebang `#!/bin/bash`, hacer scripts idempotentes (ejecutar 2 veces = mismo resultado). **Tareas comunes**: backups (tar), health checks (df, uptime, systemctl), sincronización, limpieza de logs. Los scripts cron en producción son críticos: deben ser confiables, logeados, y monitoreados.",
            "difficulty": "easy",
            "order_index": 2,
            "xp_reward": 150,
            "time_limit": 35,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/cron_scripts", "/home/student/logs_cron"],
                "files": [
                    {
                        "path": "/home/student/cron_scripts/plantilla.sh",
                        "content": "#!/bin/bash\nLOG_FILE=\"/home/student/logs_cron/tarea.log\"\necho \"[$(date)] Inicio\" >> $LOG_FILE\n# codigo aqui\necho \"[$(date)] Fin\" >> $LOG_FILE"
                    }
                ]
            }),
            "step_by_step_guide": "1. En /home/student/cron_scripts, crea un script check_disk.sh\n2. El script debe:\n   - Usar shebang #!/bin/bash\n   - Verificar espacio en disco con `df -h`\n   - Loguear timestamp\n   - Escribir a /home/student/logs_cron/disk.log\n3. Hazlo ejecutable: `chmod +x check_disk.sh`\n4. Pruébalo manualmente primero\n5. Luego agrégalo a crontab para ejecutarse cada hora\n\n**Tips:**\n- Formato log: [2026-03-20 14:30:00] Mensaje\n- Usa variables para rutas: SCRIPT_DIR=\"$(cd \"$(dirname \"${BASH_SOURCE[0]}\")\" && pwd)\"\n- Redirige errores: `>> $LOG_FILE 2>&1`\n- Prueba antes de meter en cron",
            "challenges": [
                {
                    "title": "Crear script check_disk.sh",
                    "description": "Escribe un script que verifique espacio en disco",
                    "v_type": "file_created",
                    "v_value": "/home/student/cron_scripts/check_disk.sh",
                    "hints": ["Comienza con #!/bin/bash", "Usa df -h para verificar disco", "Loguea con timestamps", "Escribe a /home/student/logs_cron/disk.log"]
                }
            ]
        },
        {
            "title": "at: Ejecución Diferida",
            "description": "Programa tareas para ejecutarse una sola vez",
            "goal_description": "Mientras cron es recurrente, `at` programa **ejecución única en el futuro**. Sintaxis: `at time` (ej: `at 15:30`, `at now + 5 minutes`, `at 9:00 PM tomorrow`). Tipeas comandos, Ctrl+D para terminar. **Herramientas**: `atq` lista tareas pendientes, `atrm jobid` cancela. **Alternativa con pipe**: `echo 'comando' | at time`. **Casos de uso**: ejecutar script en 10min, tarea a las 3AM mañana, delayed alerts. at es más simple que cron para one-shot, menos overhead. Aunque en 2026 muchos usan systemd timers, at sigue siendo esencial para SysAdmins clásicos.",
            "difficulty": "easy",
            "order_index": 3,
            "xp_reward": 100,
            "time_limit": 25,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/tareas_diferidas"]
            }),
            "step_by_step_guide": "1. Navega a /home/student\n2. Crea una tarea diferida con `at`\n3. La tarea debe escribir un mensaje a /home/student/tareas_diferidas/resultado.txt\n4. Pruébala con una ejecución en 1 minuto desde ahora\n5. Verifica con `atq` que la tarea está programada\n6. Espera a que se ejecute y verifica el archivo\n\n**Tips:**\n- `at now + 1 minute` programa para dentro de 1 minuto\n- Luego tipea el comando (ej: echo \"Hola\" >> /home/student/tareas_diferidas/resultado.txt)\n- Ctrl+D para terminar entrada\n- `atq` muestra tareas pendientes\n- `atrm jobnumber` cancela una tarea",
            "challenges": [
                {
                    "title": "Crear tarea diferida",
                    "description": "Programa una tarea con at para ejecutarse en el futuro",
                    "v_type": "directory_created",
                    "v_value": "/home/student/tareas_diferidas",
                    "hints": ["Usa: at now + 1 minute", "Ingresa un comando que escriba en un archivo", "Ctrl+D para terminar", "Verifica con atq"]
                }
            ]
        },
        {
            "title": "watch: Monitorización",
            "description": "Observa cambios en comandos repetidos",
            "goal_description": "El comando `watch` ejecuta otro comando repetidamente (default cada 2 segundos) y muestra salida en pantalla completa. **Sintaxis**: `watch [opciones] 'comando'`. **Opciones clave**: `-n segundos` (intervalo, ej `-n 5`), `-d` resalta cambios, `-t` sin header. **Casos de uso**: `watch df -h` (monitorear espacio), `watch free -m` (memoria), `watch ls` (nuevos archivos), `watch systemctl status servicio` (estado del servicio), `watch 'ps aux | grep proceso'`. **Atajos**: space ejecuta ahora, q para salir. watch es **live monitoring** esencial para SysAdmins: en vez de ejecutar comando manualmente 10 veces, watch lo hace automático. Perfecta para troubleshooting en tiempo real.",
            "difficulty": "easy",
            "order_index": 4,
            "xp_reward": 100,
            "time_limit": 20,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/monitoreo"]
            }),
            "step_by_step_guide": "1. Navega a /home/student\n2. Usa `watch` para monitorear espacio en disco\n3. Ejecuta: `watch -n 5 df -h` (cada 5 segundos)\n4. Observa cómo se actualizan los valores\n5. Prueba también `watch -d -n 5 free -m` para ver cambios resaltados\n6. Sal con 'q'\n\n**Tips:**\n- `watch df -h` = ejecuta df -h cada 2 segundos\n- `-n 5` = cada 5 segundos (default 2)\n- `-d` resalta líneas que cambian (muy útil)\n- `-t` elimina header (hora y comando)\n- Useful commands: df, free, ps, uptime, iostat\n- Presiona space para actualizar inmediatamente",
            "challenges": [
                {
                    "title": "Usar watch para monitorear",
                    "description": "Practica watch con diferentes comandos",
                    "v_type": "directory_created",
                    "v_value": "/home/student/monitoreo",
                    "hints": ["Prueba: watch -n 5 df -h", "Luego: watch -d -n 5 free -m", "Presiona q para salir"]
                }
            ]
        },
        {
            "title": "Sistema de Backup Automatizado",
            "description": "Crea un sistema completo de backup integrado",
            "goal_description": "Ahora integras TODO: tar + gzip, scripts con logging, cron scheduling. **Requisitos del sistema**: script bash que realiza backup (tar -czvf de datos_importantes a backups/), loguea cada ejecución con timestamp, maneja errores, limpia backups viejos (ej: mantén solo últimos 7), reporta via email (opcional en producción). **Script real**: estructura tipo `#!/bin/bash`, define variables (BACKUP_DIR, DATA_DIR, LOG_FILE), verifica directorios existen, ejecuta tar, verifica exit code, loguea resultado, rota backups. **Cron scheduling**: `0 2 * * *` = daily 2am (ventana baja). **Testing**: ejecuta manualmente primero, verifica logs, restaura desde backup, valida integridad. Este ejercicio te prepara para producción: tienes backup, logs, rotación, scheduling. Es profesional.",
            "difficulty": "medium",
            "order_index": 5,
            "xp_reward": 250,
            "time_limit": 50,
            "scenario_setup": json.dumps({
                "directories": [
                    "/home/student/sistema_backup",
                    "/home/student/sistema_backup/datos",
                    "/home/student/sistema_backup/backups",
                    "/home/student/sistema_backup/logs"
                ],
                "files": [
                    {
                        "path": "/home/student/sistema_backup/datos/app.conf",
                        "content": "version=1.0"
                    },
                    {
                        "path": "/home/student/sistema_backup/datos/usuarios.db",
                        "content": "admin,student,root"
                    }
                ]
            }),
            "step_by_step_guide": "1. En /home/student/sistema_backup, crea backup.sh\n2. Script debe:\n   - Tener shebang #!/bin/bash\n   - Definir variables: BACKUP_DIR, DATA_DIR, LOG_FILE\n   - Crear backup con tar -czvf\n   - Guardar como backup_TIMESTAMP.tar.gz en BACKUP_DIR\n   - Loguear inicio/fin con timestamp\n   - Verificar que backup se creó\n   - Limpiar backups más viejos (mantener últimos 3)\n3. Hacer script ejecutable\n4. Ejecutar manualmente para probar\n5. Ver logs en /home/student/sistema_backup/logs/backup.log\n6. Verificar restauración: extrae un backup y valida\n7. Agregar a crontab para ejecutar diariamente\n\n**Tips estructura:**\n```bash\n#!/bin/bash\nBACKUP_DIR=\"/home/student/sistema_backup/backups\"\nDATA_DIR=\"/home/student/sistema_backup/datos\"\nLOG_FILE=\"/home/student/sistema_backup/logs/backup.log\"\n\necho \"[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando backup\" >> $LOG_FILE\ntar -czvf \"$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).tar.gz\" \"$DATA_DIR\" >> $LOG_FILE 2>&1\nif [ $? -eq 0 ]; then\n  echo \"[$(date '+%Y-%m-%d %H:%M:%S')] Backup exitoso\" >> $LOG_FILE\nelse\n  echo \"[$(date '+%Y-%m-%d %H:%M:%S')] ERROR en backup\" >> $LOG_FILE\nfi\n# Limpiar backups viejos (mantener últimos 3)\nls -t \"$BACKUP_DIR\"/backup_*.tar.gz | tail -n +4 | xargs rm -f\n```",
            "challenges": [
                {
                    "title": "Crear script backup.sh",
                    "description": "Escribe script completo de backup con logging y rotación",
                    "v_type": "file_created",
                    "v_value": "/home/student/sistema_backup/backup.sh",
                    "hints": [
                        "Comienza con #!/bin/bash",
                        "Define BACKUP_DIR, DATA_DIR, LOG_FILE variables",
                        "Usa tar -czvf para crear backup",
                        "Incluye timestamps en logs",
                        "Implementa rotación (rm backups viejos)"
                    ]
                },
                {
                    "title": "Script válido en bash",
                    "description": "El script debe contener shebang correcto",
                    "v_type": "file_content_flag",
                    "v_value": "#!/bin/bash",
                    "v_extra": "/home/student/sistema_backup/backup.sh",
                    "hints": ["Primera línea debe ser: #!/bin/bash"]
                }
            ]
        }
    ]

    for l_data in labs_data_m7:
        existing = db.query(Lab).filter(Lab.module_id == module_m7.id, Lab.title == l_data["title"]).first()
        if existing:
            continue
        lab = Lab(
            module_id=module_m7.id,
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

    print(f"✅ Terminal Skills - M7 Cron y Automatización seeded OK")

    # MODULE B: M8 — Editores de Texto en Terminal
    module_m8 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M8 — Editores de Texto en Terminal").first()
    if not module_m8:
        module_m8 = Module(
            skill_path_id=path.id,
            title="M8 — Editores de Texto en Terminal",
            description="Domina nano y vim, los editores de texto estándar en Linux",
            order_index=9,
            is_active=True
        )
        db.add(module_m8)
        db.commit()
        db.refresh(module_m8)

    labs_data_m8 = [
        {
            "title": "nano: El Editor Amigable",
            "description": "Aprende nano, el editor más fácil de usar",
            "goal_description": "nano es el editor **más amigable para principiantes**. Interfaz intuitiva, controles visibles. **Controles clave**: Ctrl+O guardar, Ctrl+X salir (pide confirmar si hay cambios), Ctrl+K cortar línea, Ctrl+U pegar, Ctrl+W buscar, Ctrl+\\ reemplazar, Ctrl+G ayuda, Ctrl+Y page-up, Ctrl+V page-down. **Opciones útiles**: `nano +N archivo` abre en línea N, `nano -l` muestra números de línea (visually), `-E` convierte tabs a espacios. **Configuración**: archivo `~/.nanorc` customiza comportamiento (set linenumber, set mouse, syntax highlighting). **Workflow típico**: abres, escribes/editas, Ctrl+O guarda, Ctrl+X sale. nano es perfecta para scripts rápidos, configuración, logs. No tienes que aprender 100 comandos: nano es \"lo que ves es lo que haces\".",
            "difficulty": "easy",
            "order_index": 1,
            "xp_reward": 100,
            "time_limit": 25,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/nano_practica"]
            }),
            "step_by_step_guide": "1. Navega a /home/student/nano_practica\n2. Abre nano: `nano mi_primer_archivo.txt`\n3. Escribe un mensaje (cualquier texto está bien)\n4. Guarda: Ctrl+O, presiona Enter\n5. Sale: Ctrl+X\n6. Verifica que el archivo se creó: `cat mi_primer_archivo.txt`\n\n**Tips:**\n- Los controles aparecen en la parte inferior (^ = Ctrl)\n- Ctrl+G abre la ayuda dentro de nano\n- Ctrl+W para buscar texto\n- Ctrl+K corta línea, Ctrl+U la pega\n- Arrow keys para navegar",
            "challenges": [
                {
                    "title": "Crear archivo con nano",
                    "description": "Crea un archivo de texto usando nano",
                    "v_type": "file_created",
                    "v_value": "/home/student/nano_practica/mi_primer_archivo.txt",
                    "hints": ["Usa: nano mi_primer_archivo.txt", "Escribe algo", "Ctrl+O para guardar", "Ctrl+X para salir"]
                }
            ]
        },
        {
            "title": "nano: Edición",
            "description": "Edita archivos usando características avanzadas de nano",
            "goal_description": "Profundizarás en nano: manejo de múltiples buffers (load archivo con Ctrl+R), marcar texto (Ctrl+Shift+6 o Alt+A), copiar selección (Alt+6), operaciones en bloque. Practicarás edición real: abrir configuración, modificar valores, guardar. Técnicas: búsqueda y reemplazo (`Ctrl+\\`), navegar con Ctrl+Y (page-up) / Ctrl+V (page-down), saltar líneas (Ctrl+G), seleccionar todo (Alt+A), cortar/pegar bloques. Caso real: editar archivo de config, cambiar un parámetro, verificar cambio. Es eficiencia.",
            "difficulty": "easy",
            "order_index": 2,
            "xp_reward": 120,
            "time_limit": 30,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/nano_practica"],
                "files": [
                    {
                        "path": "/home/student/nano_practica/config_ejemplo.txt",
                        "content": "# Configuracion\nhostname=miservidor\nport=8080\nmax_connections=100\nlog_level=info"
                    }
                ]
            }),
            "step_by_step_guide": "1. Abre config_ejemplo.txt con nano: `nano config_ejemplo.txt`\n2. Busca la línea con 'port=8080' (usa Ctrl+W)\n3. Cambia el valor de 8080 a 9090\n4. Guarda el archivo (Ctrl+O)\n5. Sale (Ctrl+X)\n6. Verifica: `cat config_ejemplo.txt`\n\n**Tips:**\n- Ctrl+W abre búsqueda\n- Usa arrow keys para navegar a posición del número\n- Backspace para borrar, números nuevos para escribir\n- Ctrl+\\ para búsqueda+reemplazo (encuentra y reemplaza automático)\n- Si quieres listar solo la línea: grep port config_ejemplo.txt",
            "challenges": [
                {
                    "title": "Editar valor en config",
                    "description": "Cambia port=8080 a port=9090 usando nano",
                    "v_type": "file_content_flag",
                    "v_value": "9090",
                    "v_extra": "/home/student/nano_practica/config_ejemplo.txt",
                    "hints": ["Abre con nano config_ejemplo.txt", "Usa Ctrl+W para buscar 'port'", "Cambia 8080 a 9090", "Ctrl+O guarda, Ctrl+X sale"]
                }
            ]
        },
        {
            "title": "vim: Modos de Edición",
            "description": "Aprende el poderoso y temido vim",
            "goal_description": "vim es **legendario**: rápido, potente, modal. A diferencia de nano (siempre en modo edición), vim tiene **3 modos principales**: Normal (navegación/comandos), Insert (escribir texto), Visual (seleccionar). **Normal mode** (default al abrir): h/j/k/l (izq/abajo/arriba/der), w (palabra), b (atrás), 0 (inicio línea), $ (fin línea), gg (top), G (bottom), /patrón (buscar). **Insert mode** (presiona i): escribes normalmente, Esc vuelve a Normal. **Visual mode** (presiona v): seleccionas con hjkl, copias (y), cortas (d), pegas (p). **Cómo salir** (issue #1 de todos): `:q!` (sin guardar), `:wq` (guardar+salir). vim tiene **curva de aprendizaje empinada pero ROI altísimo**: en servidores sin GUI, vim es imprescindible. El mantra: \"vim es una lengua, no un editor\".",
            "difficulty": "medium",
            "order_index": 3,
            "xp_reward": 175,
            "time_limit": 40,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/vim_practica"]
            }),
            "step_by_step_guide": "1. Navega a /home/student/vim_practica\n2. Abre vim: `vim notas_vim.txt` (crea archivo nuevo)\n3. Estás en Normal mode (no puedes escribir)\n4. Presiona 'i' para entrar en Insert mode\n5. Escribe:\n   Mi primera experiencia con vim\n   \n   - vim tiene 3 modos\n   - Normal: navegación\n   - Insert: escritura\n   \n6. Presiona Esc para volver a Normal mode\n7. Escribe `:wq` (colon, w, q) y presiona Enter para guardar+salir\n8. Verifica: `cat notas_vim.txt`\n\n**Tips:**\n- Estás en Normal mode al abrir\n- 'i' = Insert mode (escribe texto)\n- Esc = vuelve a Normal mode\n- ':' en Normal mode abre comando\n- ':q!' = salir sin guardar (útil si metiste la pata)\n- ':wq' = guardar y salir\n- 'h j k l' = flechas (izq abajo arriba der)\n- 'dd' = borra línea (en Normal mode)",
            "challenges": [
                {
                    "title": "Crear archivo con vim",
                    "description": "Crea archivo usando vim y domina cambio de modos",
                    "v_type": "file_created",
                    "v_value": "/home/student/vim_practica/notas_vim.txt",
                    "hints": [
                        "vim notas_vim.txt",
                        "Presiona 'i' para Insert mode",
                        "Escribe algo",
                        "Esc para volver a Normal",
                        ":wq para guardar+salir"
                    ]
                }
            ]
        },
        {
            "title": "vim: Comandos Esenciales",
            "description": "Domina edición eficiente en vim",
            "goal_description": "Ahora dominarás vim productivamente. **Comandos en Normal mode**: `dd` (borra línea), `dw` (borra palabra), `x` (borra carácter), `yy` (copia línea), `yw` (copia palabra), `p` (pega después), `P` (pega antes), `u` (undo), `Ctrl+R` (redo), `/patrón` (busca), `n` (siguiente match), `N` (anterior), `:%s/old/new/g` (reemplaza globalmente), `>>` (indenta línea), `<<` (desindenta). **Combinaciones numéricas**: `3dd` borra 3 líneas, `5w` avanza 5 palabras. **Workflow real**: abres archivo roto, buscas error, lo corriges, guardas. vim permite hacer en 3 keystrokes lo que nano toma 30. Por eso programadores/DevOps aman vim: velocidad pura.",
            "difficulty": "medium",
            "order_index": 4,
            "xp_reward": 175,
            "time_limit": 40,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/vim_practica"],
                "files": [
                    {
                        "path": "/home/student/vim_practica/script_roto.py",
                        "content": "print('hola')\nprint('mundo')\nx = 10\nprint('valor: ' + x)"
                    }
                ]
            }),
            "step_by_step_guide": "1. El archivo script_roto.py tiene un error: no puedes concatenar str + int\n2. Abre con vim: `vim script_roto.py`\n3. En Normal mode, busca el error: `/valor` (Ctrl+F)\n4. vim te lleva a la línea con 'valor'\n5. Navega a la 'x' en `+ x`\n6. En Normal mode, presiona 'i' antes de 'x' (Insert mode)\n7. Escribe `str(` para tener `str(x)`\n8. Esc para salir Insert\n9. Navega después de 'x' y agrega `)`: presiona 'a' (append), escribe `)`, Esc\n10. Resultado: `print('valor: ' + str(x))`\n11. Guarda: `:wq`\n\n**Tips:**\n- 'i' = insert antes de cursor\n- 'a' = append (insert después de cursor)\n- 'w' = siguiente palabra\n- 'e' = fin de palabra\n- 'dd' = borra línea entera\n- 'u' = undo si metes la pata\n- 'yy' = copia línea (luego 'p' para pegar)",
            "challenges": [
                {
                    "title": "Corregir script Python",
                    "description": "Arregla el error de concatenación en el script",
                    "v_type": "file_content_flag",
                    "v_value": "str(x)",
                    "v_extra": "/home/student/vim_practica/script_roto.py",
                    "hints": [
                        "El error es + x (no puedes sumar str + int)",
                        "Cambia a + str(x)",
                        "Usa vim: busca con /valor, navega con hjkl, 'i' para insertar"
                    ]
                }
            ]
        },
        {
            "title": "vim: .vimrc",
            "description": "Customiza vim con tu archivo de configuración",
            "goal_description": "vim es extremadamente configurable vía `~/.vimrc`. **Configuraciones essenciales**: `set number` (muestra números de línea), `set tabstop=4` (tabs = 4 espacios), `set expandtab` (tabs se convierten a espacios, importante para Python), `set hlsearch` (resalta búsquedas), `set autoindent` (auto-indenta nueva línea), `syntax on` (colorización), `set mouse=a` (soporte mouse), `colorscheme desert` (tema de color), `map <Leader>s :w<CR>` (atajos custom). .vimrc es donde vim se vuelve \"tuyo\": puede optimizar para tu workflow, lenguajes favoritos, atajos personales. Gente tiene .vimrc de 500+ líneas. En 2026, muchos usan gestores (vim-plug, packer.nvim) para plugins. Pero base es .vimrc. Es inversión a largo plazo.",
            "difficulty": "medium",
            "order_index": 5,
            "xp_reward": 150,
            "time_limit": 30,
            "scenario_setup": json.dumps({
                "directories": []
            }),
            "step_by_step_guide": "1. En home, abre editor de .vimrc: `vim ~/.vimrc`\n2. Si no existe, vim lo crea nuevo\n3. Agrega estas configuraciones (Insert mode, luego cada línea):\n   set number\n   set tabstop=4\n   set expandtab\n   set autoindent\n   set hlsearch\n   syntax on\n4. Guarda: `:wq`\n5. Abre cualquier archivo con vim y verifica que:\n   - Hay números de línea\n   - Código está coloreado\n   - Indentación es automática\n\n**Tips:**\n- set number = muestra líneas\n- set tabstop=4 = ancho de tabs\n- set expandtab = convierte tabs a espacios\n- syntax on = colores\n- Puedes agregar comentarios con `\"`\n- Para plugins (advanced): vim-plug, packer.nvim",
            "challenges": [
                {
                    "title": "Crear ~/.vimrc",
                    "description": "Configura tu archivo .vimrc con settings básicos",
                    "v_type": "file_created",
                    "v_value": "/home/student/.vimrc",
                    "hints": [
                        "Abre vim ~/.vimrc",
                        "Agrega: set number",
                        "Agrega: set tabstop=4",
                        "Agrega: set expandtab",
                        "Agrega: syntax on",
                        ":wq para guardar"
                    ]
                }
            ]
        },
        {
            "title": "nano vs vim en la Práctica",
            "description": "Comprende cuándo usar cada editor",
            "goal_description": "¿Cuál elegir? **nano**: para tareas quick-and-dirty, archivos pequeños, usuarios nuevos, cuándo necesitas ayuda visible. **vim**: para trabajo intenso, scripts grandes, cuando velocidad importa, con .vimrc personalizado eres inalcanzable. **Otros editores**: emacs (aún más poderoso, curva más empinada), micro (moderno, friendly), helix (rustlang, muy nuevo). **La \"Editor War\"** (nano vs vim vs emacs) es histórica. Realidad: en 2026, saber ambos es profesional. Muchos SysAdmins dominan vim pero usan nano para rápidos fix. **vimtutor**: ejecuta `vimtutor` en terminal, tutorial interactivo de 30min que enseña vim touch-typing style. Es la mejor forma de aprender vim. Conclusión: elige herramienta por contexto, no por dogma.",
            "difficulty": "easy",
            "order_index": 6,
            "xp_reward": 120,
            "time_limit": 30,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/editores"],
                "files": [
                    {
                        "path": "/home/student/editores/comparativa.txt",
                        "content": "Editor: Ventajas: Desventajas:"
                    }
                ]
            }),
            "step_by_step_guide": "1. Abre /home/student/editores/comparativa.txt con nano (más simple para esto)\n2. Completa la tabla comparativa:\n\nEditor: Ventajas: Desventajas:\nnano: Fácil, intuitivo, visible: Sin curva aprendizaje\nvim: Rápido, poderoso, universal: Curva empinada, modal\nemacs: Altamente customizable, lenguaje Lisp: Aún más curva, overhead\n\n3. Agrega una línea tuya con tu opinión\n4. Guarda con nano (Ctrl+O, Ctrl+X)\n\n**Para aprender más:**\n- Ejecuta `vimtutor` en terminal (30min interactivo)\n- Practica vim daily, se vuelve natural en semanas\n- nano es respaldo: siempre funciona cuando vim no está disponible",
            "challenges": [
                {
                    "title": "Completar comparativa",
                    "description": "Completa tabla comparativa de editores, menciona vim",
                    "v_type": "file_content_flag",
                    "v_value": "vim",
                    "v_extra": "/home/student/editores/comparativa.txt",
                    "hints": ["Abre con nano: nano comparativa.txt", "Agrega información sobre vim vs nano", "Guarda y sale"]
                }
            ]
        }
    ]

    for l_data in labs_data_m8:
        existing = db.query(Lab).filter(Lab.module_id == module_m8.id, Lab.title == l_data["title"]).first()
        if existing:
            continue
        lab = Lab(
            module_id=module_m8.id,
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

    print(f"✅ Terminal Skills - M8 Editores de Texto en Terminal seeded OK")
    db.close()

if __name__ == "__main__":
    seed()
