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

    module = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M2 — Pipes y Redirecciones").first()
    if not module:
        module = Module(
            skill_path_id=path.id,
            title="M2 — Pipes y Redirecciones",
            description="Aprende a encadenar comandos con pipes y a redirigir flujos de entrada y salida. Estas técnicas son la base de la automatización en Linux.",
            order_index=3,
            is_active=True
        )
        db.add(module)
        db.commit()
        db.refresh(module)

    labs_data = [
        {
            "title": "Redirección de Salida: >, >> y 2>",
            "description": """# Redirección de Salida: >, >> y 2>

En Linux, todo comando produce tres flujos de datos:

| Flujo | Número | Descripción |
|-------|--------|-------------|
| stdin  | 0 | Entrada estándar |
| stdout | 1 | Salida estándar (resultados normales) |
| stderr | 2 | Salida de error |

## Operadores de Redirección

### `>` — Redirigir stdout (sobreescribe)
```bash
echo "Hola mundo" > salida.txt     # Crea o sobreescribe el fichero
ls /etc > lista_etc.txt            # Guarda listado en fichero
```

### `>>` — Redirigir stdout (añade al final)
```bash
echo "línea 1" > log.txt
echo "línea 2" >> log.txt          # Añade sin borrar
echo "línea 3" >> log.txt
```

### `2>` — Redirigir stderr
```bash
ls /noexiste 2> errores.txt        # Guarda solo errores
find / -name "*.conf" 2> /dev/null # Descarta errores
```

### `&>` — Redirigir stdout y stderr juntos
```bash
comando &> todo.txt                # Todo (éxitos y errores) al fichero
```

### `2>&1` — Unir stderr a stdout
```bash
ls /etc /noexiste > salida.txt 2>&1
```

## /dev/null — El "Agujero Negro"
`/dev/null` descarta todo lo que recibe. Muy útil para silenciar comandos ruidosos:
```bash
comando_ruidoso > /dev/null 2>&1
```
""",
            "goal_description": "Practica redirecciones de stdout y stderr creando y manipulando ficheros de log.",
            "difficulty": "easy",
            "xp_reward": 120,
            "order_index": 1,
            "time_limit": 25,
            "scenario_setup": json.dumps({
                "init_commands": [
                    "mkdir -p /home/user/redireccion",
                    "echo 'Sistema iniciado' > /home/user/redireccion/sistema.log"
                ],
                "working_dir": "/home/user/redireccion"
            }),
            "step_by_step_guide": """## Paso 1 — Redirigir listado a fichero
```bash
ls /etc > lista_etc.txt
cat lista_etc.txt | head -5
```

## Paso 2 — Añadir líneas sin borrar
```bash
echo "Entrada 1" > registro.txt
echo "Entrada 2" >> registro.txt
echo "Entrada 3" >> registro.txt
cat registro.txt
```

## Paso 3 — Capturar errores
```bash
ls /directorio_falso 2> errores.txt
cat errores.txt
```

## Paso 4 — Descartar errores con /dev/null
```bash
find / -name "*.conf" 2> /dev/null | head -10
```

## Paso 5 — Redirigir todo junto
```bash
ls /etc /noexiste &> todo.txt
cat todo.txt
```
""",
            "challenges": [
                {
                    "title": "Crea registro.txt con tres entradas",
                    "description": "Usa echo y >> para crear /home/user/redireccion/registro.txt con exactamente las líneas: 'Entrada 1', 'Entrada 2', 'Entrada 3'",
                    "v_type": "file_content_flag",
                    "v_value": "/home/user/redireccion/registro.txt",
                    "v_extra": "Entrada 1",
                    "hints": json.dumps(["Usa > para la primera línea y >> para las siguientes", "echo 'Entrada 1' > registro.txt"])
                },
                {
                    "title": "Captura errores de ls en errores.txt",
                    "description": "Ejecuta ls /noexiste y redirige el error a /home/user/redireccion/errores.txt",
                    "v_type": "file_created",
                    "v_value": "/home/user/redireccion/errores.txt",
                    "v_extra": None,
                    "hints": json.dumps(["Usa 2> para redirigir stderr", "ls /noexiste 2> errores.txt"])
                }
            ]
        },
        {
            "title": "El Pipe |: Encadenando Comandos",
            "description": """# El Pipe |: Encadenando Comandos

El **pipe** `|` es una de las características más poderosas de Unix. Conecta la salida (stdout) de un comando con la entrada (stdin) del siguiente, creando **cadenas de procesamiento**.

## Filosofía Unix
> "Haz una cosa y hazla bien." — Doug McIlroy

Pequeños comandos especializados + pipes = herramientas muy poderosas.

## Sintaxis
```bash
comando1 | comando2 | comando3 | ...
```

## Ejemplos Fundamentales

### Paginar salidas largas
```bash
ls /etc | less
cat /var/log/syslog | less
```

### Contar resultados
```bash
ls /etc | wc -l                    # ¿Cuántos ficheros hay en /etc?
ps aux | wc -l                     # ¿Cuántos procesos están corriendo?
```

### Filtrar con grep
```bash
ps aux | grep nginx                # Procesos de nginx
cat /etc/passwd | grep bash        # Usuarios que usan bash
ls -la | grep "^d"                 # Solo directorios
```

### Ordenar
```bash
cat /etc/passwd | cut -d: -f1 | sort         # Usuarios ordenados
du -sh /etc/* 2>/dev/null | sort -h          # Directorios por tamaño
```

### Eliminar duplicados
```bash
cat fichero.txt | sort | uniq
cat fichero.txt | sort | uniq -c | sort -rn  # Con conteo, más frecuentes primero
```

### head y tail en pipes
```bash
ps aux | sort -k3 -rn | head -5    # Los 5 procesos que más CPU usan
cat /var/log/auth.log | tail -20   # Últimos 20 eventos de autenticación
```

## Combinar Todo
```bash
# ¿Qué IPs intentan conectarse al SSH?
cat /var/log/auth.log | grep "Failed" | grep -oE "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" | sort | uniq -c | sort -rn | head -10
```
""",
            "goal_description": "Construye pipelines para procesar texto, filtrar procesos y analizar ficheros.",
            "difficulty": "easy",
            "xp_reward": 150,
            "order_index": 2,
            "time_limit": 30,
            "scenario_setup": json.dumps({
                "init_commands": [
                    "mkdir -p /home/user/pipes",
                    "for i in $(seq 1 20); do echo \"usuario$i:x:$(($i+1000)):$(($i+1000))::/home/usuario$i:/bin/bash\" >> /home/user/pipes/usuarios.txt; done",
                    "echo 'error 404' >> /home/user/pipes/logs.txt",
                    "echo 'error 500' >> /home/user/pipes/logs.txt",
                    "echo 'info ok' >> /home/user/pipes/logs.txt",
                    "echo 'error 403' >> /home/user/pipes/logs.txt",
                    "echo 'info ok' >> /home/user/pipes/logs.txt"
                ],
                "working_dir": "/home/user/pipes"
            }),
            "step_by_step_guide": """## Paso 1 — Contar líneas con wc -l
```bash
cat /etc/passwd | wc -l
ls /etc | wc -l
```

## Paso 2 — Filtrar con grep
```bash
cat /home/user/pipes/usuarios.txt | grep "usuario1"
ps aux | grep bash
```

## Paso 3 — Ordenar y paginar
```bash
cat /home/user/pipes/usuarios.txt | sort
ls /etc | sort -r | head -10
```

## Paso 4 — Contar errores en logs
```bash
cat /home/user/pipes/logs.txt | grep "error" | wc -l
```

## Paso 5 — Pipeline complejo
```bash
cat /home/user/pipes/logs.txt | grep "error" | sort | uniq -c | sort -rn
```
""",
            "challenges": [
                {
                    "title": "Cuenta los errores en logs.txt",
                    "description": "Usa un pipe con grep y wc -l para contar cuántas líneas contienen 'error' en /home/user/pipes/logs.txt. Guarda el resultado en /home/user/pipes/conteo_errores.txt",
                    "v_type": "file_created",
                    "v_value": "/home/user/pipes/conteo_errores.txt",
                    "v_extra": None,
                    "hints": json.dumps(["grep 'error' fichero | wc -l > resultado.txt", "cat logs.txt | grep 'error' | wc -l > conteo_errores.txt"])
                },
                {
                    "title": "Lista los 5 primeros usuarios de /etc/passwd",
                    "description": "Extrae solo los nombres de usuario (primer campo) de /etc/passwd, ordénalos y guarda los 5 primeros en /home/user/pipes/top_usuarios.txt",
                    "v_type": "file_created",
                    "v_value": "/home/user/pipes/top_usuarios.txt",
                    "v_extra": None,
                    "hints": json.dumps(["cut -d: -f1 /etc/passwd | sort | head -5 > top_usuarios.txt"])
                }
            ]
        },
        {
            "title": "tee, xargs y Pipes Avanzados",
            "description": """# tee, xargs y Pipes Avanzados

## tee — Bifurcar el Flujo
`tee` lee de stdin y escribe simultáneamente en stdout y en uno o más ficheros. Útil para ver la salida y guardarla al mismo tiempo.

```bash
# Ver salida Y guardar en fichero
ls /etc | tee listado.txt | wc -l

# Añadir en lugar de sobreescribir
echo "nueva entrada" | tee -a log.txt

# Guardar en varios ficheros a la vez
cat datos.txt | tee copia1.txt copia2.txt > /dev/null
```

## xargs — Convertir stdin en Argumentos
`xargs` toma líneas de stdin y las pasa como argumentos a otro comando. Indispensable cuando un comando no acepta pipes directamente.

```bash
# Encontrar ficheros .log y borrarlos
find /tmp -name "*.log" | xargs rm -f

# Encontrar y comprimir
find . -name "*.txt" | xargs gzip

# Con marcador de posición {}
find . -name "*.py" | xargs -I {} cp {} /backup/

# Limitar argumentos por llamada
echo "a b c d e" | xargs -n 2 echo
```

## process substitution <()
Permite usar la salida de un comando como si fuera un fichero:
```bash
diff <(ls dir1) <(ls dir2)          # Comparar listados
comm <(sort lista1.txt) <(sort lista2.txt)  # Líneas en común
```

## Pipes con sudo
```bash
# Escribir en fichero que necesita root
echo "configuración" | sudo tee /etc/mi_config.conf

# sudo no puede redirigir directamente con >
# Incorrecto: sudo echo "x" > /etc/fichero   (> no tiene sudo)
# Correcto:   echo "x" | sudo tee /etc/fichero
```

## Here Documents (heredoc)
```bash
cat << EOF > config.txt
servidor=localhost
puerto=8080
debug=true
EOF
```

## Here String
```bash
grep "patron" <<< "texto a buscar"
base64 <<< "Hola mundo"
```
""",
            "goal_description": "Usa tee para bifurcar flujos y xargs para pasar argumentos en pipelines avanzados.",
            "difficulty": "medium",
            "xp_reward": 200,
            "order_index": 3,
            "time_limit": 35,
            "scenario_setup": json.dumps({
                "init_commands": [
                    "mkdir -p /home/user/avanzado",
                    "touch /home/user/avanzado/a.log /home/user/avanzado/b.log /home/user/avanzado/c.log",
                    "echo 'dato1' > /home/user/avanzado/datos.txt",
                    "echo 'dato2' >> /home/user/avanzado/datos.txt",
                    "echo 'dato3' >> /home/user/avanzado/datos.txt"
                ],
                "working_dir": "/home/user/avanzado"
            }),
            "step_by_step_guide": """## Paso 1 — tee básico
```bash
cd /home/user/avanzado
ls /etc | tee listado_guardado.txt | wc -l
cat listado_guardado.txt | head -5
```

## Paso 2 — tee con -a (append)
```bash
echo "primera entrada" | tee registro_tee.txt
echo "segunda entrada" | tee -a registro_tee.txt
cat registro_tee.txt
```

## Paso 3 — xargs básico
```bash
ls *.log | xargs wc -l
```

## Paso 4 — find + xargs
```bash
find /home/user/avanzado -name "*.log" | xargs ls -la
```

## Paso 5 — heredoc
```bash
cat << EOF > mi_config.txt
host=localhost
port=3000
env=production
EOF
cat mi_config.txt
```
""",
            "challenges": [
                {
                    "title": "Usa tee para guardar y contar",
                    "description": "Lista /etc con ls, usa tee para guardar el resultado en /home/user/avanzado/etc_lista.txt y simultáneamente cuenta las líneas.",
                    "v_type": "file_created",
                    "v_value": "/home/user/avanzado/etc_lista.txt",
                    "v_extra": None,
                    "hints": json.dumps(["ls /etc | tee etc_lista.txt | wc -l"])
                },
                {
                    "title": "Crea mi_config.txt con heredoc",
                    "description": "Usa un heredoc para crear /home/user/avanzado/mi_config.txt con al menos 3 líneas de configuración clave=valor.",
                    "v_type": "file_created",
                    "v_value": "/home/user/avanzado/mi_config.txt",
                    "v_extra": None,
                    "hints": json.dumps(["cat << EOF > mi_config.txt\\nhost=localhost\\nport=8080\\nEOF"])
                }
            ]
        },
        {
            "title": "Sustitución de Comandos y Pipes en Scripts",
            "description": """# Sustitución de Comandos y Pipes en Scripts

## Sustitución de Comandos
Permite usar la salida de un comando como valor en otro contexto.

### Sintaxis moderna: `$(comando)`
```bash
fecha=$(date +%Y-%m-%d)
echo "Hoy es: $fecha"

usuarios=$(cat /etc/passwd | wc -l)
echo "Hay $usuarios usuarios en el sistema"

directorio_actual=$(pwd)
echo "Estás en: $directorio_actual"
```

### Sintaxis antigua: `` `comando` ``
```bash
fecha=`date +%Y-%m-%d`    # Equivalente, menos legible
```

### Anidamiento
```bash
echo "El usuario actual es: $(id -un)"
echo "Tu directorio home es: $(eval echo ~$(whoami))"
```

## Variables en Pipes
```bash
# Guardar resultado de pipeline en variable
errores=$(cat app.log | grep "ERROR" | wc -l)
echo "Errores encontrados: $errores"

# Iterar sobre líneas de un comando
while IFS= read -r linea; do
    echo "Procesando: $linea"
done < <(ls /etc/*.conf 2>/dev/null)
```

## Pipes en Scripts de Bash
```bash
#!/bin/bash
# Analizar logs del sistema

LOG="/var/log/syslog"
REPORTE="reporte_$(date +%Y%m%d).txt"

echo "=== Reporte del Sistema ===" > $REPORTE
echo "Fecha: $(date)" >> $REPORTE
echo "" >> $REPORTE

echo "## Top 10 procesos por CPU:" >> $REPORTE
ps aux --sort=-%cpu | head -11 | tail -10 >> $REPORTE

echo "" >> $REPORTE
echo "## Uso de disco:" >> $REPORTE
df -h | grep -v tmpfs >> $REPORTE

echo "Reporte generado: $REPORTE"
```

## Combinando Todo: Pipeline de Monitorización
```bash
# Ver conexiones activas agrupadas por estado
ss -tan | awk 'NR>1 {print $1}' | sort | uniq -c | sort -rn

# Ficheros más grandes en /var
du -sh /var/* 2>/dev/null | sort -rh | head -10

# Usuarios con más procesos
ps aux | awk '{print $1}' | sort | uniq -c | sort -rn | head -5
```
""",
            "goal_description": "Combina sustitución de comandos, pipes y redirecciones para crear scripts de análisis del sistema.",
            "difficulty": "medium",
            "xp_reward": 200,
            "order_index": 4,
            "time_limit": 40,
            "scenario_setup": json.dumps({
                "init_commands": [
                    "mkdir -p /home/user/scripts_pipes",
                    "for i in $(seq 1 50); do echo \"[$(date)] INFO proceso $i iniciado\" >> /home/user/scripts_pipes/app.log; done",
                    "for i in $(seq 1 10); do echo \"[$(date)] ERROR fallo en módulo $i\" >> /home/user/scripts_pipes/app.log; done",
                    "for i in $(seq 1 5); do echo \"[$(date)] WARNING recurso bajo $i\" >> /home/user/scripts_pipes/app.log; done"
                ],
                "working_dir": "/home/user/scripts_pipes"
            }),
            "step_by_step_guide": """## Paso 1 — Sustitución de comandos básica
```bash
fecha=$(date +%Y-%m-%d)
hora=$(date +%H:%M:%S)
echo "Informe generado el $fecha a las $hora"
```

## Paso 2 — Contar con sustitución
```bash
total=$(cat /home/user/scripts_pipes/app.log | wc -l)
errores=$(grep "ERROR" /home/user/scripts_pipes/app.log | wc -l)
echo "Total: $total líneas, Errores: $errores"
```

## Paso 3 — Crear reporte con pipes
```bash
{
  echo "=== Reporte App Log ==="
  echo "Fecha: $(date)"
  echo "Total líneas: $(wc -l < /home/user/scripts_pipes/app.log)"
  echo "Errores: $(grep -c ERROR /home/user/scripts_pipes/app.log)"
  echo "Warnings: $(grep -c WARNING /home/user/scripts_pipes/app.log)"
} > /home/user/scripts_pipes/reporte.txt
cat /home/user/scripts_pipes/reporte.txt
```

## Paso 4 — Extraer y analizar
```bash
grep "ERROR" /home/user/scripts_pipes/app.log | \
  awk '{print $NF}' | \
  sort | uniq -c | sort -rn
```
""",
            "challenges": [
                {
                    "title": "Genera reporte.txt con estadísticas del log",
                    "description": "Crea /home/user/scripts_pipes/reporte.txt que contenga el total de líneas, número de errores y número de warnings del fichero app.log.",
                    "v_type": "file_created",
                    "v_value": "/home/user/scripts_pipes/reporte.txt",
                    "v_extra": None,
                    "hints": json.dumps(["Usa { echo ...; echo ...; } > reporte.txt", "grep -c ERROR app.log cuenta ocurrencias"])
                },
                {
                    "title": "Cuenta errores con sustitución de comandos",
                    "description": "Usa sustitución de comandos $(…) para guardar el número de líneas ERROR en una variable y escribe ese número solo en /home/user/scripts_pipes/num_errores.txt",
                    "v_type": "file_created",
                    "v_value": "/home/user/scripts_pipes/num_errores.txt",
                    "v_extra": None,
                    "hints": json.dumps(["n=$(grep -c ERROR app.log) && echo $n > num_errores.txt"])
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

    print(f"✅ Terminal Skills - M2 Pipes y Redirecciones seeded OK")
    db.close()

if __name__ == "__main__":
    seed()
