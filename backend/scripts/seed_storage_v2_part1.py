"""
seed_storage_v2_part1.py
Recreates Storage & Disk Administration path with rich content.
Part 1: Creates the SkillPath + Modules 1, 2, 3
Run order: part1 -> part2 -> part3
Usage: cd backend && source venv/bin/activate && python3 scripts/seed_storage_v2_part1.py
"""
import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal, SkillPath, Module, Lab, Challenge

def insert_labs(db, module, labs_data):
    for ld in labs_data:
        existing = db.query(Lab).filter(Lab.module_id == module.id, Lab.title == ld["title"]).first()
        if not existing:
            lab = Lab(
                module_id=module.id,
                title=ld["title"],
                difficulty=ld["difficulty"],
                description=ld["description"],
                goal_description=ld["goal_description"],
                step_by_step_guide=ld["step_by_step_guide"],
                order_index=ld["order_index"],
                is_active=True,
                docker_image="ubuntu:22.04",
                xp_reward=ld.get("xp_reward", 150),
                time_limit=ld.get("time_limit", 30),
                category="Linux"
            )
            db.add(lab)
    db.commit()
    print(f"  -> Módulo '{module.title}': labs insertados.")

def run():
    db = SessionLocal()
    try:
        # ── SkillPath ────────────────────────────────────────────────────
        path = db.query(SkillPath).filter(SkillPath.title == "Storage & Disk Administration").first()
        if not path:
            path = SkillPath(
                title="Storage & Disk Administration",
                description="Domina la administración de almacenamiento en Linux: discos, particiones, LVM, USB, RAID, cifrado LUKS, NFS y recuperación de datos. Curso práctico desde cero hasta nivel avanzado.",
                difficulty="medium",
                order_index=2,
                is_active=True
            )
            db.add(path)
            db.commit()
            db.refresh(path)
            print(f"SkillPath creado: {path.title} (id={path.id})")
        else:
            print(f"SkillPath ya existe: {path.title} (id={path.id})")

        # ── MÓDULO 1: Exploración y Diagnóstico ─────────────────────────
        m1 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M1 — Exploración y Diagnóstico de Almacenamiento").first()
        if not m1:
            m1 = Module(
                skill_path_id=path.id,
                title="M1 — Exploración y Diagnóstico de Almacenamiento",
                description="Aprende a inspeccionar el hardware de almacenamiento, leer métricas de disco y diagnosticar problemas antes de tocar nada.",
                order_index=1, is_active=True, requires_validation=False
            )
            db.add(m1); db.commit(); db.refresh(m1)

        m1_labs = [
            {
                "title": "Topología de Bloques con lsblk",
                "difficulty": "easy",
                "order_index": 1, "xp_reward": 100, "time_limit": 20,
                "description": """lsblk (List Block Devices) muestra la jerarquía de dispositivos de bloque del sistema. Un dispositivo de bloque es cualquier disco, partición, unidad USB o volumen lógico que el kernel gestiona en bloques de bytes fijos.

La salida en árbol de lsblk es insustituible porque en un vistazo ves:
  - Discos físicos (sda, sdb, nvme0n1...)
  - Sus particiones (sda1, sda2...)
  - Puntos de montaje actuales
  - Tipo de dispositivo (disk, part, lvm, rom...)

Opciones útiles:
  lsblk -f   → muestra UUID, tipo de filesystem y etiquetas
  lsblk -o NAME,SIZE,TYPE,MOUNTPOINT,UUID   → columnas personalizadas
  lsblk -d   → solo discos físicos, sin particiones""",
                "goal_description": "Identificar todos los discos físicos y sus particiones. Distinguir entre disco físico, partición y punto de montaje. Usar opciones avanzadas de lsblk.",
                "step_by_step_guide": """1. Ejecuta el comando básico:
   lsblk

2. Observa la estructura en árbol. Identifica cuáles son discos raíz (sin indentación) y cuáles son particiones.

3. Añade información de filesystem:
   lsblk -f

4. Muestra solo columnas relevantes:
   lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT

5. Cuenta cuántos discos físicos hay:
   lsblk -d -o NAME,SIZE,MODEL"""
            },
            {
                "title": "Espacio en Disco con df",
                "difficulty": "easy",
                "order_index": 2, "xp_reward": 100, "time_limit": 20,
                "description": """df (Disk Free) informa sobre el espacio libre y usado en todos los sistemas de archivos montados. Es el primer comando a ejecutar ante un problema de "disco lleno".

Conceptos clave:
  - Filesystem: la partición o volumen montado
  - Size: capacidad total
  - Used: espacio ocupado
  - Avail: espacio libre real (se reserva un 5% para root)
  - Use%: porcentaje de ocupación
  - Mounted on: directorio donde está accesible

Opciones esenciales:
  df -h    → human-readable (GB, MB)
  df -T    → muestra el tipo de filesystem (ext4, tmpfs, xfs...)
  df -i    → muestra inodos en lugar de bloques (crítico cuando Use%=100% pero hay espacio libre)
  df -x tmpfs  → excluye sistemas de archivos virtuales""",
                "goal_description": "Monitorizar el espacio libre en todos los puntos de montaje. Identificar particiones críticas. Entender la diferencia entre espacio en bloques e inodos.",
                "step_by_step_guide": """1. Muestra el espacio de forma legible:
   df -h

2. Identifica la partición raíz (/). ¿Cuánto espacio libre tiene?

3. Incluye el tipo de filesystem:
   df -hT

4. Revisa el estado de inodos (índices de archivos):
   df -i

5. Filtra solo los sistemas de archivos reales (excluye tmpfs y devtmpfs):
   df -hT -x tmpfs -x devtmpfs"""
            },
            {
                "title": "Auditoría de Espacio con du",
                "difficulty": "medium",
                "order_index": 3, "xp_reward": 120, "time_limit": 25,
                "description": """Cuando df muestra que el disco está lleno, du (Disk Usage) te ayuda a encontrar al culpable. Mientras df mide filesystem completos, du mide directorios individuales.

Técnicas de investigación:
  du -sh /ruta   → tamaño total resumido de un directorio
  du -sh *       → tamaño de cada elemento del directorio actual
  du -h --max-depth=1 /  → primer nivel del filesystem raíz

Técnica del Detective (encontrar el directorio más gordo):
  du -h /var --max-depth=2 | sort -rh | head -20

Esto lista los 20 directorios más pesados en /var, ordenados de mayor a menor. Esencial para localizar logs o cachés desbordados.""",
                "goal_description": "Rastrear directorios que consumen demasiado espacio. Usar du combinado con sort para localizar los culpables. Aplicar la técnica del Detective en /var y /home.",
                "step_by_step_guide": """1. Ver el tamaño total de /var:
   du -sh /var

2. Desglosar por subdirectorios inmediatos:
   du -h --max-depth=1 /var

3. Aplicar la técnica del Detective: los 15 directorios más pesados en /var:
   du -h /var --max-depth=3 2>/dev/null | sort -rh | head -15

4. Inspeccionar los logs:
   du -sh /var/log/*

5. Ver el top 10 de archivos más grandes en /var/log:
   find /var/log -type f -exec du -h {} + 2>/dev/null | sort -rh | head -10"""
            },
            {
                "title": "Identificación por UUID con blkid",
                "difficulty": "medium",
                "order_index": 4, "xp_reward": 120, "time_limit": 20,
                "description": """El problema con los nombres /dev/sda1 es que son dinámicos: si añades un disco, el sistema puede renombrar el que antes era sda como sdb. Esto puede romper configuraciones de arranque.

La solución es el UUID (Universally Unique Identifier): un identificador de 128 bits asignado cuando se formatea la partición. Nunca cambia aunque cambies el orden de los discos o el cable SATA.

blkid muestra:
  - UUID de cada partición
  - PARTUUID (UUID de la entrada en la tabla de particiones)
  - TYPE: el filesystem (ext4, vfat, swap, LVM...)
  - LABEL: etiqueta opcional que tú puedes poner

Uso profesional:
  blkid /dev/sda1   → solo esa partición
  blkid -s UUID -o value /dev/sda1  → solo el UUID, limpio""",
                "goal_description": "Obtener UUID de todas las particiones. Entender por qué UUID es preferible a /dev/sdX en producción. Extraer UUID de forma programática para scripts.",
                "step_by_step_guide": """1. Lista todos los dispositivos y sus UUIDs:
   blkid

2. Muestra solo la partición principal:
   blkid /dev/sda1

3. Extrae únicamente el UUID de sda1 (para usar en scripts):
   blkid -s UUID -o value /dev/sda1

4. Compara con lsblk -f para verificar la misma información:
   lsblk -f

5. Observa el campo TYPE. ¿Qué filesystem tiene cada partición?"""
            },
            {
                "title": "Tablas de Particiones con fdisk y parted",
                "difficulty": "medium",
                "order_index": 5, "xp_reward": 130, "time_limit": 25,
                "description": """Existen dos estándares de tabla de particiones:
  - MBR (Master Boot Record): legacy, máximo 4 particiones primarias, máximo 2TB por disco
  - GPT (GUID Partition Table): moderno, hasta 128 particiones, sin límite práctico de tamaño

Herramientas de inspección:
  fdisk -l           → lista todas las tablas de particiones (soporta MBR y GPT)
  parted -l          → lista con más detalle (unidades, alineación, flags)
  gdisk -l /dev/sda  → específico para GPT

Información que verás:
  - Start/End: sectores de inicio y fin
  - Sectors: tamaño en sectores (1 sector = 512 bytes normalmente)
  - Type: tipo de partición (Linux, EFI System, Linux swap, LVM...)""",
                "goal_description": "Leer e interpretar tablas de particiones MBR y GPT. Distinguir entre los dos estándares. Identificar particiones especiales (EFI, swap, LVM).",
                "step_by_step_guide": """1. Lista todas las particiones del sistema:
   fdisk -l

2. Muestra información de un disco específico:
   fdisk -l /dev/sda

3. Usa parted para información adicional:
   parted -l

4. Identifica qué tipo de tabla de particiones se usa (MBR o GPT).

5. Anota el tipo de cada partición (Linux, swap, EFI System...)"""
            },
            {
                "title": "Métricas de Rendimiento con iostat",
                "difficulty": "hard",
                "order_index": 6, "xp_reward": 180, "time_limit": 30,
                "description": """iostat (parte del paquete sysstat) mide el rendimiento de entrada/salida de los discos. Es el comando clave para diagnosticar cuellos de botella de almacenamiento.

Métricas principales:
  tps        → transacciones por segundo (IOPS combinadas)
  kB_read/s  → kilobytes leídos por segundo
  kB_wrtn/s  → kilobytes escritos por segundo
  await      → tiempo medio de espera en ms (latencia I/O)
  util%      → porcentaje de tiempo que el disco está ocupado (>80% = problema)
  svctm      → tiempo medio de servicio (obsoleto en kernels modernos)

Comando recomendado en producción:
  iostat -xz 1 5

  -x: estadísticas extendidas
  -z: omite dispositivos sin actividad
  1: intervalo de 1 segundo
  5: 5 muestras""",
                "goal_description": "Monitorizar el rendimiento de E/S en tiempo real. Identificar discos saturados. Interpretar las métricas de latencia y throughput.",
                "step_by_step_guide": """1. Instala sysstat si no está disponible:
   apt-get install -y sysstat

2. Vista general de rendimiento:
   iostat

3. Estadísticas extendidas cada segundo:
   iostat -xz 1 5

4. Solo el disco sda con formato compacto:
   iostat -d sda 1 3

5. Interpreta: si util% de algún disco supera 80% consistentemente, ese disco es el cuello de botella."""
            },
            {
                "title": "Errores de Hardware con dmesg y journalctl",
                "difficulty": "hard",
                "order_index": 7, "xp_reward": 180, "time_limit": 30,
                "description": """Cuando un disco está fallando físicamente, el kernel lo detecta y registra errores en el buffer del anillo (ring buffer). dmesg permite ver esos mensajes en tiempo real.

Tipos de errores comunes:
  - "I/O error": el disco no puede leer/escribir un sector
  - "blk_update_request: I/O error": error de bloque de bajo nivel
  - "ata: hard resetting link": el controlador SATA reinicia la conexión
  - "EXT4-fs error": el filesystem detectó inconsistencia

Comandos:
  dmesg | grep -i "error"   → filtra errores genéricos
  dmesg | grep -E "sda|sdb|nvme"  → filtra mensajes de discos específicos
  dmesg -T | grep -i "ata"  → con timestamps legibles
  journalctl -k | grep -i "disk"  → logs del kernel persistentes""",
                "goal_description": "Detectar errores físicos de disco en los logs del kernel. Usar dmesg y journalctl para diagnóstico de hardware. Distinguir entre errores graves y advertencias.",
                "step_by_step_guide": """1. Ver los últimos mensajes del kernel relacionados con almacenamiento:
   dmesg | grep -iE 'sda|sdb|sdc|nvme|ata' | tail -30

2. Buscar errores de I/O:
   dmesg | grep -i 'error' | tail -20

3. Con timestamps legibles:
   dmesg -T | grep -iE 'error|fail|reset' | tail -20

4. Logs persistentes del kernel:
   journalctl -k --no-pager | grep -i disk | tail -20

5. Monitorizar en tiempo real (espera 10 segundos y observa):
   dmesg -w &
   sleep 10
   kill %1"""
            },
            {
                "title": "Salud del Disco con S.M.A.R.T.",
                "difficulty": "hard",
                "order_index": 8, "xp_reward": 200, "time_limit": 35,
                "description": """S.M.A.R.T. (Self-Monitoring, Analysis and Reporting Technology) es un sistema de auto-diagnóstico integrado en casi todos los discos modernos (HDD y SSD). Permite predecir fallos antes de que ocurran.

Atributos críticos a vigilar:
  - Reallocated_Sector_Ct: sectores remapeados (>0 en HDD = disco deteriorado)
  - Pending_Sector_Count: sectores inestables pendientes de reasignación
  - Uncorrectable_Sector_Count: sectores que no se pudieron corregir (muy grave)
  - Power_On_Hours: horas totales de funcionamiento
  - Temperature_Celsius: temperatura actual del disco

Interpretación:
  SMART overall-health: PASSED → El disco supera los tests básicos
  SMART overall-health: FAILED → Fallo inminente, haz backup AHORA

Herramienta: smartctl (paquete smartmontools)""",
                "goal_description": "Leer el informe S.M.A.R.T. de un disco. Interpretar los atributos críticos. Ejecutar tests automáticos de diagnóstico.",
                "step_by_step_guide": """1. Instala smartmontools:
   apt-get install -y smartmontools

2. Comprueba si el disco soporta S.M.A.R.T.:
   smartctl -i /dev/sda

3. Muestra el informe completo de salud:
   smartctl -a /dev/sda

4. Busca el resultado general:
   smartctl -a /dev/sda | grep -i 'overall-health'

5. Lanza un test rápido (dura ~2 minutos):
   smartctl -t short /dev/sda

6. Consulta los resultados del test:
   smartctl -a /dev/sda | grep -A5 'Self-test'"""
            },
            {
                "title": "Benchmarking de Disco con hdparm y dd",
                "difficulty": "hard",
                "order_index": 9, "xp_reward": 180, "time_limit": 30,
                "description": """Antes de depender de un disco para producción, es buena práctica medir su velocidad real. Hay dos herramientas simples para esto:

hdparm: mide velocidad de lectura secuencial con caché del buffer del kernel
  hdparm -t /dev/sda   → lectura desde cache del disco
  hdparm -T /dev/sda   → lectura desde cache del kernel (RAM)

dd: mide velocidad de escritura secuencial
  dd if=/dev/zero of=/tmp/test_write bs=1G count=1 oflag=direct

  if=/dev/zero: fuente de datos (ceros infinitos, sin I/O de lectura)
  of=/tmp/test_write: archivo de destino
  bs=1G: bloques de 1 gigabyte
  oflag=direct: bypass de la caché del kernel (mide el disco real)

Velocidades típicas:
  HDD mecánico: 80-160 MB/s secuencial
  SSD SATA: 400-600 MB/s
  NVMe M.2: 2000-7000 MB/s""",
                "goal_description": "Medir la velocidad real de lectura y escritura de un disco. Comparar rendimiento con y sin caché del kernel. Interpretar los resultados para elegir el disco adecuado.",
                "step_by_step_guide": """1. Instala hdparm:
   apt-get install -y hdparm

2. Mide velocidad de lectura secuencial (con cache de disco):
   hdparm -t /dev/sda

3. Mide velocidad de lectura desde la RAM del kernel:
   hdparm -T /dev/sda

4. Mide velocidad de escritura con dd (crea un archivo de 512MB):
   dd if=/dev/zero of=/tmp/disktest bs=64M count=8 oflag=direct 2>&1 | grep copied

5. Limpia el archivo de test:
   rm -f /tmp/disktest

6. Compara los resultados. El valor de hdparm -T debe ser mucho mayor que -t (es RAM vs disco)."""
            },
            {
                "title": "Localizar Archivos Gigantes con find",
                "difficulty": "medium",
                "order_index": 10, "xp_reward": 130, "time_limit": 25,
                "description": """Un disco lleno puede deberse a un único archivo de logs de 50GB. El comando find con la opción -size permite localizarlos en segundos.

Sintaxis de tamaño:
  -size +100M   → archivos mayores de 100 MB
  -size +1G     → archivos mayores de 1 GB
  -size -10k    → archivos menores de 10 KB

Unidades: c (bytes), k (kilobytes), M (megabytes), G (gigabytes)

Combinaciones poderosas:
  find / -size +500M -type f 2>/dev/null
  find / -size +100M -type f -exec ls -lh {} ; 2>/dev/null | sort -k5 -rh
  find /var -name "*.log" -size +10M 2>/dev/null

El 2>/dev/null descarta errores de permisos para una salida limpia.""",
                "goal_description": "Localizar archivos grandes que consumen espacio innecesario. Usar find con criterios de tamaño, tipo y nombre. Combinar con ls para ver detalles.",
                "step_by_step_guide": """1. Encuentra archivos mayores de 100MB en todo el sistema:
   find / -size +100M -type f 2>/dev/null

2. Muestra también el tamaño legible:
   find / -size +50M -type f -exec du -h {} + 2>/dev/null | sort -rh | head -20

3. Busca logs grandes en /var:
   find /var -name "*.log" -size +5M 2>/dev/null

4. Encuentra archivos de más de 1GB:
   find / -size +1G -type f 2>/dev/null

5. Lista los 10 archivos más grandes del sistema:
   find / -type f -exec du -h {} + 2>/dev/null | sort -rh | head -10"""
            },
        ]
        insert_labs(db, m1, m1_labs)

        # ── MÓDULO 2: Particionado y Sistemas de Archivos ───────────────
        m2 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M2 — Particionado y Sistemas de Archivos").first()
        if not m2:
            m2 = Module(
                skill_path_id=path.id,
                title="M2 — Particionado y Sistemas de Archivos",
                description="Aprende a crear, formatear, montar y gestionar particiones y filesystems en Linux. Desde fdisk hasta fstab.",
                order_index=2, is_active=True, requires_validation=False
            )
            db.add(m2); db.commit(); db.refresh(m2)

        m2_labs = [
            {
                "title": "Crear Particiones con fdisk (MBR)",
                "difficulty": "medium",
                "order_index": 1, "xp_reward": 150, "time_limit": 30,
                "description": """fdisk es la herramienta interactiva estándar para gestionar particiones MBR (y GPT en versiones modernas). Funciona mediante un menú de comandos de una sola letra.

Comandos internos de fdisk:
  m → muestra el menú de ayuda
  n → nueva partición
  p → muestra la tabla de particiones actual
  d → elimina una partición
  t → cambia el tipo de partición
  w → escribe los cambios al disco y sale (¡esto es permanente!)
  q → sale SIN guardar cambios

Flujo para crear una partición:
  1. fdisk /dev/sdb
  2. n (nueva)
  3. p (primaria) o e (extendida)
  4. Número de partición (1-4)
  5. Primer sector (Enter para default)
  6. Último sector o tamaño (+500M, +2G...)
  7. w (escribir)

ADVERTENCIA: w es irreversible. Asegúrate de estar en el disco correcto.""",
                "goal_description": "Crear una partición primaria en un disco secundario usando fdisk. Interpretar la tabla de particiones resultante. Entender la diferencia entre primaria y extendida.",
                "step_by_step_guide": """1. Identifica el disco secundario:
   lsblk

2. Inicia fdisk en el disco secundario (usa sdb, no sda que es el sistema):
   fdisk /dev/sdb

3. Dentro de fdisk, muestra la tabla actual:
   p

4. Crea una nueva partición primaria:
   n → p → 1 → Enter → +1G

5. Verifica la nueva partición:
   p

6. Escribe los cambios:
   w

7. Confirma el resultado:
   lsblk /dev/sdb"""
            },
            {
                "title": "Crear Particiones GPT con gdisk",
                "difficulty": "medium",
                "order_index": 2, "xp_reward": 150, "time_limit": 30,
                "description": """GPT (GUID Partition Table) es el estándar moderno. Es obligatorio para discos mayores de 2TB y para sistemas UEFI. gdisk es el equivalente de fdisk para GPT.

Ventajas de GPT sobre MBR:
  - Hasta 128 particiones primarias (no hay concepto de extendida)
  - Soporta discos de más de 2TB
  - Incluye tabla de particiones de respaldo al final del disco
  - Cada partición tiene su propio GUID único

Comandos gdisk (similares a fdisk):
  ? → ayuda
  n → nueva partición
  p → imprime tabla
  d → elimina partición
  i → info de una partición
  w → escribe y sale
  q → sale sin guardar

Tipos de partición GPT comunes:
  8300 → Linux filesystem (default)
  8200 → Linux swap
  ef00 → EFI System
  8e00 → Linux LVM""",
                "goal_description": "Crear una tabla de particiones GPT y añadir particiones usando gdisk. Entender los tipos de partición GPT. Comparar GPT con MBR.",
                "step_by_step_guide": """1. Instala gdisk si no está:
   apt-get install -y gdisk

2. Inicia gdisk en el disco secundario:
   gdisk /dev/sdb

3. Si el disco tiene tabla MBR, gdisk ofrecerá convertir. Acepta (o escribe una nueva con 'o').

4. Crea una nueva partición:
   n → 1 → Enter → +2G → 8300 (Linux filesystem)

5. Verifica:
   p

6. Escribe:
   w → y

7. Confirma con lsblk y parted:
   parted /dev/sdb print"""
            },
            {
                "title": "Formatear con Ext4, XFS y Btrfs",
                "difficulty": "medium",
                "order_index": 3, "xp_reward": 160, "time_limit": 30,
                "description": """Crear una partición es solo el primer paso. Necesitas un sistema de archivos (filesystem) para poder guardar datos. En Linux tienes varias opciones:

Ext4 (Fourth Extended Filesystem):
  - El más usado en Linux, estable y maduro
  - Journaling para recuperación ante fallos
  - Comando: mkfs.ext4 /dev/sdb1

XFS:
  - Excelente para archivos grandes y servidores de alto rendimiento
  - Journaling de alto rendimiento
  - Comando: mkfs.xfs /dev/sdb1

Btrfs (B-Tree Filesystem):
  - Filesystem moderno con snapshots, compresión y RAID integrados
  - Todavía madurado, pero muy potente
  - Comando: mkfs.btrfs /dev/sdb1

vFAT/FAT32:
  - Compatibilidad universal (Windows, Mac, Linux)
  - Para USBs que necesitan funcionar en todos los sistemas
  - Comando: mkfs.vfat /dev/sdb1

exFAT:
  - Sin límite de tamaño de archivo (FAT32 limita a 4GB)
  - Para USBs modernos y tarjetas SD
  - Comando: mkfs.exfat /dev/sdb1""",
                "goal_description": "Formatear particiones con Ext4, XFS y vFAT. Entender cuándo usar cada filesystem. Usar mkfs para crear sistemas de archivos.",
                "step_by_step_guide": """1. Formatea la partición sdb1 con Ext4:
   mkfs.ext4 /dev/sdb1

2. Verifica el resultado:
   blkid /dev/sdb1

3. Si tienes una segunda partición (sdb2), formatea con XFS:
   apt-get install -y xfsprogs
   mkfs.xfs /dev/sdb2

4. Para una tercera partición con vFAT (compatibilidad USB):
   mkfs.vfat /dev/sdb3

5. Compara los filesystems creados:
   lsblk -f /dev/sdb"""
            },
            {
                "title": "Montaje y Desmontaje de Particiones",
                "difficulty": "medium",
                "order_index": 4, "xp_reward": 150, "time_limit": 25,
                "description": """En Linux, para acceder a una partición o disco debes montarlo: vincularlo a un directorio del árbol de archivos. Este directorio se llama punto de montaje.

Conceptos:
  - El punto de montaje debe existir antes de montar
  - El contenido original del directorio queda oculto mientras algo está montado
  - /mnt es el directorio estándar para montajes temporales
  - /media es para medios extraíbles (USB, CD)

Comandos:
  mount /dev/sdb1 /mnt         → montaje básico
  mount -t ext4 /dev/sdb1 /mnt → especificando tipo (normalmente innecesario)
  mount -o ro /dev/sdb1 /mnt   → solo lectura
  mount -o remount,rw /mnt     → remontar con escritura
  umount /mnt                  → desmontar por punto de montaje
  umount /dev/sdb1             → desmontar por dispositivo
  umount -l /mnt               → lazy unmount (cuando está ocupado)

  mount | grep sdb             → ver qué hay montado
  findmnt                      → árbol de montajes (más visual)""",
                "goal_description": "Montar y desmontar particiones manualmente. Usar opciones de montaje (ro, rw). Verificar el estado de los montajes con mount y findmnt.",
                "step_by_step_guide": """1. Crea el punto de montaje:
   mkdir -p /mnt/datos

2. Monta la partición:
   mount /dev/sdb1 /mnt/datos

3. Verifica el montaje:
   mount | grep sdb1
   df -h /mnt/datos

4. Crea un archivo de prueba:
   echo "Test de almacenamiento" > /mnt/datos/test.txt
   cat /mnt/datos/test.txt

5. Visualiza el árbol de montajes:
   findmnt

6. Desmonta la partición:
   umount /mnt/datos

7. Verifica que ya no está montada:
   mount | grep sdb1"""
            },
            {
                "title": "Montajes Permanentes con /etc/fstab",
                "difficulty": "hard",
                "order_index": 5, "xp_reward": 200, "time_limit": 35,
                "description": """Los montajes realizados con mount desaparecen al reiniciar. Para que sean permanentes, se registran en /etc/fstab (FileSystem TABle). Este archivo se lee automáticamente al arrancar el sistema.

Formato de cada línea en fstab:
  <dispositivo>  <punto_montaje>  <tipo>  <opciones>  <dump>  <pass>

Ejemplo:
  UUID=a1b2c3d4  /mnt/datos  ext4  defaults  0  2

  - UUID=...: identificador estable (preferible a /dev/sdb1)
  - /mnt/datos: directorio de montaje
  - ext4: tipo de filesystem
  - defaults: opciones estándar (rw, suid, exec, auto, nouser, async)
  - 0: dump (0 = no backup automático)
  - 2: fsck order (0=no verificar, 1=raíz, 2=otros)

Opciones comunes:
  noatime    → no actualiza tiempo de acceso (mejor rendimiento)
  noexec     → no permite ejecutar binarios (seguridad)
  nosuid     → ignora bit SUID (seguridad)
  ro         → solo lectura

PRECAUCIÓN: Un fstab mal configurado puede dejar el sistema sin arrancar. Siempre verifica con 'mount -a' antes de reiniciar.""",
                "goal_description": "Configurar montajes automáticos al arranque con fstab. Usar UUID en lugar de nombres de dispositivo. Verificar la configuración antes de reiniciar.",
                "step_by_step_guide": """1. Obtén el UUID de la partición:
   blkid -s UUID -o value /dev/sdb1

2. Asegúrate de que el punto de montaje existe:
   mkdir -p /mnt/datos

3. Edita fstab con seguridad (backup primero):
   cp /etc/fstab /etc/fstab.backup
   nano /etc/fstab

4. Añade al final (sustituye UUID por el real):
   UUID=TU-UUID-AQUI  /mnt/datos  ext4  defaults,noatime  0  2

5. Prueba la configuración sin reiniciar:
   mount -a

6. Verifica que se montó:
   df -h /mnt/datos

7. Si hay error, restaura el backup:
   cp /etc/fstab.backup /etc/fstab"""
            },
            {
                "title": "Verificación y Reparación con fsck",
                "difficulty": "hard",
                "order_index": 6, "xp_reward": 200, "time_limit": 35,
                "description": """fsck (File System Check) escanea y repara inconsistencias en un sistema de archivos. Se ejecuta automáticamente al arrancar tras un apagón forzado.

REGLA CRÍTICA: Nunca ejecutes fsck en una partición montada. Puede corromper los datos.

Versiones específicas por filesystem:
  fsck.ext4 /dev/sdb1   → para ext4
  fsck.xfs /dev/sdb1    → para XFS (usa xfs_repair para reparar)
  fsck.vfat /dev/sdb1   → para FAT32

Opciones de fsck:
  -n  → modo dry-run, solo reporta sin reparar
  -y  → responde sí a todo automáticamente
  -f  → fuerza el chequeo aunque el filesystem parezca limpio
  -v  → modo verbose

Para ext4 se puede ajustar cada cuántos montajes se hace un fsck automático:
  tune2fs -c 20 /dev/sdb1   → fsck cada 20 montajes
  tune2fs -i 1m /dev/sdb1   → fsck cada mes""",
                "goal_description": "Ejecutar fsck correctamente en una partición desmontada. Interpretar el informe de errores. Configurar la frecuencia de verificación automática.",
                "step_by_step_guide": """1. Asegúrate de que la partición NO está montada:
   umount /dev/sdb1 2>/dev/null; lsblk /dev/sdb1

2. Ejecuta fsck en modo solo-lectura para ver el estado:
   fsck -n /dev/sdb1

3. Ejecuta una verificación real (forzada aunque parezca limpia):
   fsck -fy /dev/sdb1

4. Para XFS (usa xfs_repair en lugar de fsck):
   xfs_repair -n /dev/sdb2   (modo solo-lectura)

5. Configura verificación automática cada 30 montajes:
   tune2fs -c 30 /dev/sdb1
   tune2fs -l /dev/sdb1 | grep -i mount"""
            },
            {
                "title": "Swapfile y Partición Swap",
                "difficulty": "medium",
                "order_index": 7, "xp_reward": 160, "time_limit": 30,
                "description": """Swap es espacio de disco que el kernel usa como extensión de la RAM cuando esta se llena. Sin swap, cuando la RAM se agota el sistema mata procesos (OOM Killer).

Dos formas de crear swap:

1. SWAPFILE (recomendado, flexible):
   fallocate -l 2G /swapfile   → reserva 2GB
   chmod 600 /swapfile          → permisos seguros (solo root)
   mkswap /swapfile             → inicializa como swap
   swapon /swapfile             → activa

2. PARTICIÓN SWAP (más eficiente, requiere reparticionar):
   mkswap /dev/sdb3
   swapon /dev/sdb3

Monitorización:
  free -h             → muestra RAM y swap usados
  swapon --show       → lista las áreas swap activas
  cat /proc/swaps     → mismo info desde el kernel

Para hacerlo permanente en fstab:
  /swapfile  none  swap  sw  0  0

Parámetro swappiness (0-100): controla cuándo usa swap.
  0  → solo swap si la RAM está completamente llena
  60 → valor por defecto
  100 → usa swap agresivamente""",
                "goal_description": "Crear un swapfile de 1GB y activarlo. Monitorizar el uso de swap. Ajustar la swappiness del kernel. Hacer el swap persistente.",
                "step_by_step_guide": """1. Comprueba el estado actual del swap:
   free -h
   swapon --show

2. Crea un swapfile de 1GB:
   fallocate -l 1G /swapfile

3. Aplica permisos seguros:
   chmod 600 /swapfile

4. Inicializa como swap:
   mkswap /swapfile

5. Activa el swap:
   swapon /swapfile

6. Verifica:
   free -h
   swapon --show

7. Consulta y ajusta la swappiness:
   cat /proc/sys/vm/swappiness
   sysctl vm.swappiness=10

8. Para hacerlo permanente, añade a /etc/fstab:
   echo '/swapfile  none  swap  sw  0  0' >> /etc/fstab"""
            },
            {
                "title": "Redimensionar Particiones con resize2fs y parted",
                "difficulty": "hard",
                "order_index": 8, "xp_reward": 220, "time_limit": 40,
                "description": """A veces una partición se queda sin espacio y necesitas ampliarla. El proceso depende de si la partición puede agrandarse online (con el sistema corriendo) o requiere desmontaje.

Para Ext4 (puede ampliarse online si hay espacio libre contiguo):
  1. Ampliar la partición con parted o fdisk
  2. Informar al kernel: partprobe /dev/sdb
  3. Ampliar el filesystem: resize2fs /dev/sdb1

Para reducir (muy arriesgado, solo offline):
  1. Desmontar
  2. fsck (obligatorio)
  3. resize2fs /dev/sdb1 nuevo_tamaño
  4. Reducir la partición en parted (hacerlo DESPUÉS del filesystem)

ADVERTENCIA: Reducir particiones es peligroso. Si reduces la partición antes que el filesystem, perderás datos.

Para XFS:
  xfs_growfs /mnt/punto  → amplía online (XFS NO puede reducirse)

Herramienta gráfica alternativa: gparted (si hay entorno gráfico)""",
                "goal_description": "Ampliar una partición ext4 en caliente. Entender el proceso de resize2fs. Conocer las limitaciones de cada filesystem al redimensionar.",
                "step_by_step_guide": """1. Comprueba el estado inicial:
   df -h /mnt/datos
   parted /dev/sdb print

2. Con parted, amplía la partición (modo interactivo):
   parted /dev/sdb
   resizepart 1 100%
   quit

3. Informa al kernel del cambio:
   partprobe /dev/sdb

4. Amplía el filesystem Ext4:
   resize2fs /dev/sdb1

5. Verifica el nuevo tamaño:
   df -h /mnt/datos

6. Para XFS (si está montado en /mnt/xfs):
   xfs_growfs /mnt/xfs"""
            },
            {
                "title": "Etiquetas de Disco con e2label y tune2fs",
                "difficulty": "easy",
                "order_index": 9, "xp_reward": 100, "time_limit": 20,
                "description": """Las etiquetas (labels) permiten dar nombres descriptivos a las particiones en lugar de recordar UUIDs o nombres /dev/sdX. Son especialmente útiles en servidores con muchos discos.

Gestión de etiquetas por filesystem:

Ext4:
  e2label /dev/sdb1 BACKUP_DATA   → pone etiqueta
  e2label /dev/sdb1               → muestra etiqueta
  tune2fs -L "DATOS_APP" /dev/sdb1 → alternativa con tune2fs

XFS:
  xfs_admin -L "DATOS_XFS" /dev/sdb2   → pone etiqueta

vFAT:
  fatlabel /dev/sdb3 "USB_DATOS"   → pone etiqueta en FAT32

Referenciar por etiqueta (en fstab y mount):
  mount LABEL=BACKUP_DATA /mnt/backup
  En fstab: LABEL=BACKUP_DATA  /mnt/backup  ext4  defaults  0  2

Verificar etiquetas:
  lsblk -f   → columna LABEL
  blkid      → muestra LABEL junto al UUID""",
                "goal_description": "Asignar etiquetas a particiones ext4 y FAT32. Montar particiones usando su etiqueta. Verificar etiquetas con lsblk y blkid.",
                "step_by_step_guide": """1. Asigna una etiqueta a la partición ext4:
   e2label /dev/sdb1 DATOS_LAB

2. Verifica la etiqueta:
   e2label /dev/sdb1
   lsblk -f /dev/sdb

3. Monta usando la etiqueta (más legible que UUID):
   mount LABEL=DATOS_LAB /mnt/datos

4. Confirma con blkid:
   blkid /dev/sdb1

5. Cambia la etiqueta a algo diferente:
   tune2fs -L "STORAGE_V2" /dev/sdb1
   blkid /dev/sdb1"""
            },
            {
                "title": "Escenario: Disco Lleno — Diagnóstico y Recuperación",
                "difficulty": "hard",
                "order_index": 10, "xp_reward": 250, "time_limit": 45,
                "description": """Escenario real: Recibes una alerta a las 3AM. El servidor de producción tiene el disco al 100% y los servicios empiezan a fallar. ¿Qué haces?

Protocolo de respuesta a disco lleno:

PASO 1 - Confirmar y localizar:
  df -h   → confirmar que el disco está lleno
  du -h --max-depth=2 / 2>/dev/null | sort -rh | head -20   → localizar el culpable

PASO 2 - Liberar espacio de emergencia:
  Opción A: Vaciar logs sin borrar el archivo (el proceso que escribe sigue funcionando):
    truncate -s 0 /var/log/syslog

  Opción B: Borrar logs comprimidos antiguos (seguros de borrar):
    find /var/log -name "*.gz" -delete
    find /var/log -name "*.1" -delete

  Opción C: Limpiar caché de paquetes:
    apt-get clean   (en sistemas Debian/Ubuntu)

PASO 3 - Solución permanente:
  Ampliar la partición (LVM o parted)
  Mover datos a otro disco
  Configurar rotación de logs (logrotate)""",
                "goal_description": "Ejecutar el protocolo completo de respuesta a disco lleno. Liberar espacio de emergencia sin interrumpir servicios. Aplicar soluciones permanentes.",
                "step_by_step_guide": """1. Simula el problema: crea un archivo enorme:
   dd if=/dev/zero of=/tmp/disco_lleno bs=1M count=500 2>&1

2. Confirma el problema:
   df -h /tmp

3. Localiza los archivos más grandes:
   du -h /tmp --max-depth=1 2>/dev/null | sort -rh | head -10

4. Recupera espacio eliminando el archivo:
   rm -f /tmp/disco_lleno

5. Busca logs comprimidos que se pueden eliminar:
   find /var/log -name "*.gz" 2>/dev/null | head -10

6. Vacía un log sin borrar el archivo:
   truncate -s 0 /var/log/dpkg.log

7. Limpia la caché de APT:
   apt-get clean
   df -h"""
            },
        ]
        insert_labs(db, m2, m2_labs)

        # ── MÓDULO 3: LVM — Gestión Lógica de Volúmenes ─────────────────
        m3 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M3 — LVM: Gestión Lógica de Volúmenes").first()
        if not m3:
            m3 = Module(
                skill_path_id=path.id,
                title="M3 — LVM: Gestión Lógica de Volúmenes",
                description="Domina LVM para crear almacenamiento flexible, redimensionable en caliente y con snapshots. Esencial para servidores de producción.",
                order_index=3, is_active=True, requires_validation=False
            )
            db.add(m3); db.commit(); db.refresh(m3)

        m3_labs = [
            {
                "title": "Arquitectura de LVM: PV, VG, LV",
                "difficulty": "medium",
                "order_index": 1, "xp_reward": 150, "time_limit": 25,
                "description": """LVM (Logical Volume Manager) añade una capa de abstracción entre el hardware y el sistema de archivos. Esta abstracción permite redimensionar, mover y snapshottear volúmenes sin reiniciar.

Tres capas de LVM:

1. Physical Volume (PV) — Capa hardware:
   - Un disco o partición inicializado para LVM
   - Creado con: pvcreate /dev/sdb
   - Inspeccionado con: pvs, pvdisplay, pvscan

2. Volume Group (VG) — Capa de agrupación:
   - Combina uno o más PV en una "bolsa" de almacenamiento
   - Creado con: vgcreate nombre_vg /dev/sdb /dev/sdc
   - Inspeccionado con: vgs, vgdisplay, vgscan

3. Logical Volume (LV) — Capa de uso:
   - Volumen virtual que el usuario formatea y monta
   - Equivalente a una partición "inteligente"
   - Creado con: lvcreate -L 10G -n nombre_lv nombre_vg
   - Inspeccionado con: lvs, lvdisplay

Dispositivo resultante: /dev/nombre_vg/nombre_lv  o  /dev/mapper/nombre_vg-nombre_lv""",
                "goal_description": "Comprender la arquitectura de tres capas de LVM. Identificar PVs, VGs y LVs existentes en el sistema. Preparar el entorno para los siguientes labs.",
                "step_by_step_guide": """1. Comprueba si LVM está disponible:
   which lvm || apt-get install -y lvm2

2. Lista Physical Volumes existentes:
   pvs
   pvscan

3. Lista Volume Groups:
   vgs

4. Lista Logical Volumes:
   lvs

5. Vista completa del sistema LVM:
   lvm fullreport

6. Identifica discos disponibles para LVM:
   lsblk -o NAME,SIZE,TYPE,FSTYPE | grep -v loop"""
            },
            {
                "title": "Crear Physical Volumes (pvcreate)",
                "difficulty": "medium",
                "order_index": 2, "xp_reward": 150, "time_limit": 25,
                "description": """El primer paso en LVM es preparar los discos o particiones como Physical Volumes. pvcreate escribe metadatos LVM en el dispositivo, marcándolo como disponible para el sistema de volúmenes.

Se puede usar como PV:
  - Un disco completo: pvcreate /dev/sdb
  - Una partición específica: pvcreate /dev/sdb1
  (Usar disco completo es más simple; usar partición permite coexistir con particiones no-LVM)

Información que pvcreate escribe:
  - UUID del PV (diferente al UUID del filesystem)
  - Tamaño total en Physical Extents (PE) de 4MB por defecto
  - Información de VG al que pertenece (vacío hasta añadirlo a un VG)

Inspección:
  pvs                    → resumen de todos los PV
  pvdisplay /dev/sdb     → detalle completo
  pvdisplay -C           → formato columnar

Eliminar un PV (si no está en uso):
  pvremove /dev/sdb""",
                "goal_description": "Inicializar uno o varios discos como Physical Volumes. Inspeccionar los metadatos del PV. Entender el concepto de Physical Extent.",
                "step_by_step_guide": """1. Asegúrate de que el disco no está montado:
   umount /dev/sdb 2>/dev/null

2. Inicializa el disco como PV:
   pvcreate /dev/sdb

3. Comprueba el resultado:
   pvs
   pvdisplay /dev/sdb

4. Si tienes un segundo disco, inicialízalo también:
   pvcreate /dev/sdc

5. Lista todos los PV disponibles:
   pvs -o+pv_uuid,pv_size,pv_free

6. Obtén el tamaño en Physical Extents (PE de 4MB):
   pvdisplay /dev/sdb | grep 'PE Size'"""
            },
            {
                "title": "Crear Volume Groups (vgcreate)",
                "difficulty": "medium",
                "order_index": 3, "xp_reward": 150, "time_limit": 25,
                "description": """El Volume Group agrupa Physical Volumes en una única unidad de almacenamiento. Es como un "disco virtual" que puede abarcar múltiples discos físicos.

Creación:
  vgcreate vg_datos /dev/sdb             → VG de un solo disco
  vgcreate vg_datos /dev/sdb /dev/sdc    → VG de dos discos (suma el espacio)

Ampliar un VG añadiendo más discos:
  vgextend vg_datos /dev/sdd

Reducir un VG (mover datos y quitar un PV):
  pvmove /dev/sdb   → mueve datos de sdb a otros PVs del mismo VG
  vgreduce vg_datos /dev/sdb

Opciones avanzadas:
  vgcreate -s 8M vg_datos /dev/sdb   → Physical Extent size de 8MB (default 4MB)

Inspección:
  vgs                 → resumen
  vgdisplay vg_datos  → detalle completo

Eliminar VG (primero elimina todos los LV):
  vgremove vg_datos""",
                "goal_description": "Crear un Volume Group uniendo varios Physical Volumes. Ampliar un VG con un disco adicional. Inspeccionar el espacio total y libre del VG.",
                "step_by_step_guide": """1. Crea el VG con un disco:
   vgcreate vg_almacen /dev/sdb

2. Verifica el VG creado:
   vgs
   vgdisplay vg_almacen

3. Amplía el VG con el segundo disco:
   vgextend vg_almacen /dev/sdc

4. Comprueba el espacio total disponible:
   vgs vg_almacen

5. Muestra los PVs que forman el VG:
   pvs -o+pv_used,vg_name | grep vg_almacen"""
            },
            {
                "title": "Crear Logical Volumes (lvcreate)",
                "difficulty": "medium",
                "order_index": 4, "xp_reward": 160, "time_limit": 30,
                "description": """El Logical Volume es lo que finalmente formateas y usas como si fuera una partición convencional. La clave de LVM es que su tamaño puede cambiarse sin reiniciar.

Creación por tamaño fijo:
  lvcreate -L 5G -n lv_app vg_almacen     → 5 gigabytes
  lvcreate -L 500M -n lv_log vg_almacen   → 500 megabytes

Creación por porcentaje:
  lvcreate -l 100%FREE -n lv_full vg_almacen   → todo el espacio libre
  lvcreate -l 50%VG -n lv_half vg_almacen      → 50% del VG

El dispositivo resultante aparece en:
  /dev/vg_almacen/lv_app         → symlink
  /dev/mapper/vg_almacen-lv_app  → dispositivo real del kernel

Después de crear el LV, lo formateas y montas igual que una partición:
  mkfs.ext4 /dev/vg_almacen/lv_app
  mount /dev/vg_almacen/lv_app /mnt/app

Eliminar LV (primero desmontar):
  umount /mnt/app
  lvremove /dev/vg_almacen/lv_app""",
                "goal_description": "Crear Logical Volumes de tamaño fijo y porcentual. Formatearlos y montarlos. Gestionar el ciclo de vida completo de un LV.",
                "step_by_step_guide": """1. Crea un LV de 2GB para aplicaciones:
   lvcreate -L 2G -n lv_app vg_almacen

2. Crea un LV con el espacio restante para datos:
   lvcreate -l 100%FREE -n lv_datos vg_almacen

3. Lista los LVs creados:
   lvs
   lvdisplay

4. Formatea lv_app con ext4:
   mkfs.ext4 /dev/vg_almacen/lv_app

5. Monta el volumen:
   mkdir -p /mnt/app
   mount /dev/vg_almacen/lv_app /mnt/app

6. Verifica:
   df -h /mnt/app"""
            },
            {
                "title": "Ampliar Volúmenes en Caliente",
                "difficulty": "hard",
                "order_index": 5, "xp_reward": 220, "time_limit": 35,
                "description": """La mayor ventaja de LVM sobre las particiones convencionales es que puedes ampliar un volumen mientras el sistema está corriendo y el disco montado. No hay downtime.

Proceso de ampliación (dos pasos):

PASO 1: Ampliar el Logical Volume:
  lvextend -L +2G /dev/vg_almacen/lv_app         → añade 2GB
  lvextend -L 10G /dev/vg_almacen/lv_app          → fija el tamaño a 10GB
  lvextend -l +100%FREE /dev/vg_almacen/lv_app    → añade todo el espacio libre

PASO 2: Ampliar el filesystem (para que "vea" el nuevo espacio):
  Para Ext4: resize2fs /dev/vg_almacen/lv_app
  Para XFS:  xfs_growfs /mnt/app (usa el punto de montaje, no el dispositivo)

  ATAJO (lvextend -r hace los dos pasos a la vez):
  lvextend -L +2G -r /dev/vg_almacen/lv_app

Reducir un LV (solo Ext4, nunca XFS):
  umount /mnt/app
  fsck -fy /dev/vg_almacen/lv_app
  resize2fs /dev/vg_almacen/lv_app 1G
  lvreduce -L 1G /dev/vg_almacen/lv_app""",
                "goal_description": "Ampliar un Logical Volume en caliente sin desmontar. Usar el atajo -r para ampliar LV y filesystem en un solo comando. Entender las limitaciones de reducción.",
                "step_by_step_guide": """1. Comprueba el estado actual:
   df -h /mnt/app
   lvs /dev/vg_almacen/lv_app

2. Amplía el LV en 500MB:
   lvextend -L +500M /dev/vg_almacen/lv_app

3. Nota que df sigue mostrando el tamaño antiguo (el filesystem no sabe del cambio aún):
   df -h /mnt/app

4. Amplía el filesystem Ext4:
   resize2fs /dev/vg_almacen/lv_app

5. Ahora df muestra el nuevo tamaño:
   df -h /mnt/app

6. Prueba el atajo todo-en-uno:
   lvextend -l +100%FREE -r /dev/vg_almacen/lv_app"""
            },
            {
                "title": "Snapshots LVM",
                "difficulty": "hard",
                "order_index": 6, "xp_reward": 250, "time_limit": 40,
                "description": """Un snapshot LVM es una fotografía del estado de un Logical Volume en un momento dado. Utiliza Copy-on-Write (CoW): solo guarda los bloques que han cambiado desde el snapshot, no una copia completa.

Casos de uso:
  - Backup consistente sin parar la aplicación
  - Pruebas de actualizaciones (si sale mal, revert al snapshot)
  - Clonar entornos

Crear un snapshot:
  lvcreate -L 1G -s -n snap_app /dev/vg_almacen/lv_app

  -s: indica que es snapshot
  -n snap_app: nombre del snapshot
  -L 1G: espacio reservado para guardar los cambios (debe ser suficiente para los cambios esperados)

Si el espacio del snapshot se llena, el snapshot se invalida automáticamente.

Montar el snapshot (solo lectura):
  mount -o ro /dev/vg_almacen/snap_app /mnt/backup

Revertir (merge) al snapshot:
  umount /mnt/app
  lvconvert --merge /dev/vg_almacen/snap_app
  (el origen y snapshot deben estar desmontados)

Eliminar snapshot:
  lvremove /dev/vg_almacen/snap_app""",
                "goal_description": "Crear un snapshot LVM de un volumen activo. Montarlo para acceder a datos anteriores. Entender el mecanismo Copy-on-Write.",
                "step_by_step_guide": """1. Asegúrate de que lv_app está montado con datos:
   echo "Datos antes del snapshot" > /mnt/app/archivo_original.txt

2. Crea el snapshot (reserva 500MB para los cambios):
   lvcreate -L 500M -s -n snap_app_$(date +%Y%m%d) /dev/vg_almacen/lv_app

3. Verifica el snapshot:
   lvs

4. Monta el snapshot en modo lectura:
   mkdir -p /mnt/snapshot
   mount -o ro /dev/vg_almacen/snap_app_$(date +%Y%m%d) /mnt/snapshot

5. El snapshot tiene los datos del momento de creación:
   cat /mnt/snapshot/archivo_original.txt

6. Modifica el original (el snapshot NO cambia):
   echo "Datos nuevos" > /mnt/app/archivo_nuevo.txt

7. El snapshot sigue teniendo solo el archivo original:
   ls /mnt/snapshot/

8. Desmonta y elimina el snapshot:
   umount /mnt/snapshot
   lvremove /dev/vg_almacen/snap_app_$(date +%Y%m%d)"""
            },
            {
                "title": "Mover PVs y Migrar Datos (pvmove)",
                "difficulty": "hard",
                "order_index": 7, "xp_reward": 220, "time_limit": 40,
                "description": """pvmove permite mover los datos de un Physical Volume a otro dentro del mismo Volume Group, sin interrumpir el servicio. Es esencial para:
  - Retirar un disco del sistema (sin downtime)
  - Migrar datos de un HDD a un SSD
  - Balancear la carga entre discos

Proceso de retirada de un disco:
  1. pvmove /dev/sdb              → mueve todos los datos de sdb a otros PVs del VG
  2. pvmove /dev/sdb /dev/sdc     → mueve datos de sdb específicamente a sdc
  3. vgreduce vg_almacen /dev/sdb → retira el PV del VG
  4. pvremove /dev/sdb            → limpia los metadatos LVM del disco

Durante pvmove:
  - Los datos siguen accesibles (el proceso es transparente)
  - Puede monitorizarse con: pvmove --verbose
  - Si se interrumpe, puede reanudarse con: pvmove (sin argumentos)

Tiempo estimado: ~1-2 min por GB (depende del disco)""",
                "goal_description": "Usar pvmove para migrar datos entre discos físicos sin downtime. Retirar un disco del sistema de forma segura. Verificar la integridad de los datos tras la migración.",
                "step_by_step_guide": """1. Comprueba la distribución actual de datos:
   pvs -o+pv_used,vg_name

2. Comprueba qué LVs tienen datos en /dev/sdb:
   pvdisplay /dev/sdb

3. Inicia la migración de datos de sdb a otros PVs:
   pvmove /dev/sdb

4. Monitoriza el progreso (en otro terminal si es posible):
   watch -n2 pvs

5. Verifica que sdb ya no tiene datos:
   pvs /dev/sdb

6. Retira el PV del VG:
   vgreduce vg_almacen /dev/sdb

7. Limpia los metadatos:
   pvremove /dev/sdb

8. Verifica la integridad:
   vgdisplay vg_almacen
   df -h /mnt/app"""
            },
            {
                "title": "Thin Provisioning con LVM",
                "difficulty": "hard",
                "order_index": 8, "xp_reward": 250, "time_limit": 45,
                "description": """Thin Provisioning (aprovisionamiento ligero) permite crear volúmenes lógicos con un tamaño declarado mayor que el espacio físico disponible. Solo se consume espacio real cuando se escriben datos.

Ejemplo: tienes 100GB de almacenamiento y creas 10 volúmenes de 50GB cada uno (500GB total). Funciona porque raramente todos están llenos a la vez.

Arquitectura Thin:
  1. Thin Pool: un LV especial que actúa como piscina de espacio real
  2. Thin Volume: LV creado desde el pool con tamaño virtual

Crear un Thin Pool:
  lvcreate -L 10G --thinpool pool_datos vg_almacen

Crear un Thin Volume (sobre-provisionado):
  lvcreate -V 20G --thin -n lv_thin1 vg_almacen/pool_datos

Monitorizar el pool:
  lvs -a -o+lv_actual_size,data_percent,metadata_percent

  data_percent: porcentaje del pool usado por datos
  metadata_percent: espacio para metadatos internos

ADVERTENCIA: Si el pool se llena al 100%, los thin volumes se ponen en modo solo-lectura.""",
                "goal_description": "Crear un Thin Pool LVM. Crear Thin Volumes sobre-provisionados. Monitorizar el uso real del pool vs el espacio declarado.",
                "step_by_step_guide": """1. Crea el Thin Pool de 5GB:
   lvcreate -L 5G --thinpool pool_datos vg_almacen

2. Verifica el pool:
   lvs -a

3. Crea un thin volume de 10GB (sobre-provisionado 2x):
   lvcreate -V 10G --thin -n lv_thin_app vg_almacen/pool_datos

4. Formatea y monta el thin volume:
   mkfs.ext4 /dev/vg_almacen/lv_thin_app
   mkdir -p /mnt/thin
   mount /dev/vg_almacen/lv_thin_app /mnt/thin

5. Escribe datos y observa cómo sube el data_percent del pool:
   dd if=/dev/zero of=/mnt/thin/testfile bs=1M count=100

6. Comprueba el uso real del pool:
   lvs -a -o lv_name,lv_size,data_percent vg_almacen"""
            },
        ]
        insert_labs(db, m3, m3_labs)

        print("\n=== PARTE 1 COMPLETADA ===")
        print(f"  M1 ({m1.id}): {len(m1_labs)} labs de Exploración")
        print(f"  M2 ({m2.id}): {len(m2_labs)} labs de Particionado")
        print(f"  M3 ({m3.id}): {len(m3_labs)} labs de LVM")
        print("Ejecuta seed_storage_v2_part2.py a continuación.")

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback; traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run()
