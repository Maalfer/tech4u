"""
seed_storage_v2_part2.py
Part 2: Modules 4 (USB/Extraíble) and 5 (RAID Software)
Must run AFTER part1.
Usage: cd backend && source venv/bin/activate && python3 scripts/seed_storage_v2_part2.py
"""
import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal, SkillPath, Module, Lab

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
        path = db.query(SkillPath).filter(SkillPath.title == "Storage & Disk Administration").first()
        if not path:
            print("ERROR: SkillPath 'Storage & Disk Administration' no encontrado. Ejecuta part1 primero.")
            return

        # ── MÓDULO 4: USB, Pen Drives y Almacenamiento Extraíble ────────
        m4 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M4 — USB, Pen Drives y Almacenamiento Extraíble").first()
        if not m4:
            m4 = Module(
                skill_path_id=path.id,
                title="M4 — USB, Pen Drives y Almacenamiento Extraíble",
                description="Gestiona dispositivos USB, pen drives, tarjetas SD y medios extraíbles. Aprende a formatear, montar, expulsar y diagnosticar problemas con dispositivos extraíbles.",
                order_index=4, is_active=True, requires_validation=False
            )
            db.add(m4); db.commit(); db.refresh(m4)

        m4_labs = [
            {
                "title": "Detectar Dispositivos USB Conectados",
                "difficulty": "easy",
                "order_index": 1, "xp_reward": 100, "time_limit": 20,
                "description": """Cuando conectas un USB al sistema, el kernel lo detecta y le asigna un nombre de dispositivo. Hay varias formas de identificarlo.

Comandos de detección:

lsblk → lista todos los dispositivos de bloque incluyendo USB
  Busca dispositivos de tipo 'disk' sin UUID (recién conectados, sin formatear)

lsusb → lista dispositivos USB conectados al sistema
  Muestra fabricante, modelo e identificadores VID:PID

dmesg | tail -30 → muestra los últimos mensajes del kernel
  Al conectar un USB verás líneas como:
  "usb 2-1: new high-speed USB device"
  "sd X: X logical blocks"
  "[sdX] Attached SCSI removable disk"

udisksctl status → si udisks2 está instalado, muestra dispositivos gestionados
  Incluye información sobre si es extraíble, nombre del modelo, etc.

/proc/partitions → lista cruda de todas las particiones del kernel
  Útil para scripting: cat /proc/partitions""",
                "goal_description": "Identificar dispositivos USB conectados al sistema usando múltiples herramientas. Entender qué nombre de dispositivo se le asigna. Leer los mensajes del kernel al conectar un dispositivo.",
                "step_by_step_guide": """1. Lista todos los dispositivos de bloque:
   lsblk -o NAME,SIZE,TYPE,TRAN,MOUNTPOINT

   La columna TRAN mostrará 'usb' para dispositivos USB.

2. Lista dispositivos USB con información del fabricante:
   lsusb

3. Lee los mensajes del kernel (simula la conexión de un USB viendo los últimos mensajes):
   dmesg | grep -iE 'usb|sd[b-z]' | tail -20

4. Mira el listado del kernel de particiones:
   cat /proc/partitions

5. Identifica el nombre de dispositivo asignado al USB (normalmente /dev/sdb o /dev/sdc en un sistema con un disco principal)."""
            },
            {
                "title": "Formatear un USB con vFAT (Compatibilidad Universal)",
                "difficulty": "medium",
                "order_index": 2, "xp_reward": 130, "time_limit": 25,
                "description": """El filesystem FAT32 (vFAT en Linux) es el estándar para compatibilidad máxima entre sistemas operativos: Windows, macOS, Linux, Android, cámaras, consolas de videojuegos, etc.

Limitación de FAT32: tamaño máximo de archivo = 4GB - 1 byte.
  Para archivos grandes: usa exFAT o NTFS.

Proceso de formateo de un USB:

1. Identifica el dispositivo: lsblk → por ejemplo /dev/sdb
2. Desmonta si está montado: umount /dev/sdb1
3. Crea tabla de particiones MBR: fdisk /dev/sdb → o → g (GPT)
4. Crea la partición: n → Enter → Enter → Enter → w
5. Formatea con FAT32: mkfs.vfat -F 32 /dev/sdb1
   -F 32: fuerza FAT32 (sin esta opción puede crear FAT16 en pendrives pequeños)
6. Añade etiqueta: fatlabel /dev/sdb1 "MI_USB"

Para exFAT (archivos >4GB, sigue siendo compatible con Windows/Mac):
  apt-get install exfatprogs
  mkfs.exfat /dev/sdb1

Para NTFS (máxima compatibilidad con Windows):
  apt-get install ntfs-3g
  mkfs.ntfs /dev/sdb1""",
                "goal_description": "Formatear un pendrive con FAT32 para compatibilidad universal. Entender las limitaciones de FAT32. Usar exFAT como alternativa para archivos grandes.",
                "step_by_step_guide": """1. Identifica el USB:
   lsblk -o NAME,SIZE,TYPE,TRAN | grep usb

2. Desmonta el dispositivo si está montado:
   umount /dev/sdb 2>/dev/null

3. Borra la tabla de particiones y crea una nueva:
   fdisk /dev/sdb
   (dentro: o → n → p → 1 → Enter → Enter → t → b → w)
   El tipo 'b' es W95 FAT32.

4. Formatea con FAT32:
   mkfs.vfat -F 32 -n "MI_USB" /dev/sdb1

5. Verifica el resultado:
   blkid /dev/sdb1
   lsblk -f /dev/sdb

6. Monta y prueba:
   mkdir -p /mnt/usb
   mount /dev/sdb1 /mnt/usb
   echo "Test USB" > /mnt/usb/test.txt
   ls /mnt/usb"""
            },
            {
                "title": "Montar y Desmontar USB de Forma Segura",
                "difficulty": "easy",
                "order_index": 3, "xp_reward": 100, "time_limit": 20,
                "description": """El sistema operativo usa cachés de escritura: cuando copias un archivo a un USB, puede que aún esté en memoria RAM y no se haya escrito al dispositivo físico. Desconectar el USB sin sincronizar puede corromper los datos.

Proceso correcto de extracción:

1. sync → fuerza la escritura de todos los búferes pendientes al disco
2. umount /mnt/usb → desmonta el filesystem

Herramientas de montaje automático:
  - udisksctl (si udisks2 está instalado): gestiona montaje/desmontaje sin necesidad de sudo
    udisksctl mount -b /dev/sdb1
    udisksctl unmount -b /dev/sdb1
    udisksctl power-off -b /dev/sdb  → apaga el USB antes de desconectar

Problema "device is busy":
  - Ocurre cuando algún proceso tiene el dispositivo abierto
  - Diagnóstico: fuser -vm /mnt/usb  → lista procesos usando el dispositivo
  - Solución: matar los procesos o usar umount -l (lazy unmount)""",
                "goal_description": "Montar y desmontar un USB correctamente. Usar sync para garantizar la escritura de datos. Diagnosticar y resolver el error 'device is busy'.",
                "step_by_step_guide": """1. Monta el USB:
   mkdir -p /mnt/usb
   mount /dev/sdb1 /mnt/usb

2. Escribe algunos datos:
   cp /etc/hostname /mnt/usb/
   echo "Archivo de prueba" > /mnt/usb/prueba.txt

3. Sincroniza los búferes (SIEMPRE antes de desmontar):
   sync

4. Desmonta correctamente:
   umount /mnt/usb

5. Simula el error 'device is busy':
   mount /dev/sdb1 /mnt/usb
   cd /mnt/usb    # Entras al directorio montado
   umount /mnt/usb    # Fallará porque 'cd' lo tiene ocupado
   cd /
   umount /mnt/usb    # Ahora sí funciona

6. Identifica procesos que bloquean un dispositivo:
   fuser -vm /mnt/usb 2>/dev/null || echo "Nada está usando el dispositivo" """
            },
            {
                "title": "Recuperar Datos de un USB con testdisk",
                "difficulty": "hard",
                "order_index": 4, "xp_reward": 220, "time_limit": 45,
                "description": """testdisk es una herramienta open-source de recuperación de datos que puede recuperar particiones eliminadas, tablas de particiones dañadas y archivos borrados.

Capacidades de testdisk:
  - Recuperar tabla de particiones perdida o corrupta
  - Restaurar el sector de arranque (MBR o GPT)
  - Copiar archivos de particiones dañadas
  - Reparar filesystems FAT y NTFS

Capacidades de photorec (viene con testdisk):
  - Recuperar archivos borrados por tipo (fotos, documentos, vídeos...)
  - Funciona aunque el filesystem esté dañado
  - No necesita que la partición esté montada

Cuando usar testdisk:
  - "No se puede acceder al dispositivo"
  - "The filesystem is not clean" después de una desconexión brusca
  - Tabla de particiones perdida tras formateo accidental
  - USB que Windows dice que necesita formatear

IMPORTANTE: Trabaja siempre con una imagen del disco, no el disco original. Usa dd para clonar:
  dd if=/dev/sdb of=/tmp/usb_backup.img bs=4M""",
                "goal_description": "Usar testdisk para recuperar una tabla de particiones dañada. Clonar un dispositivo con dd antes de repararlo. Entender el flujo de recuperación de datos.",
                "step_by_step_guide": """1. Instala testdisk:
   apt-get install -y testdisk

2. Crea una imagen del USB como backup de seguridad:
   dd if=/dev/sdb of=/tmp/usb_imagen.img bs=4M 2>&1 | grep -E 'copied|records'

3. Ejecuta testdisk sobre la imagen (más seguro que sobre el dispositivo):
   testdisk /tmp/usb_imagen.img

4. Dentro de testdisk:
   - Selecciona la imagen
   - Elige el tipo de tabla (Intel/MBR o EFI GPT)
   - Usa 'Analyse' → 'Quick Search' para buscar particiones
   - Si las encuentra, usa 'Write' para restaurar

5. Para recuperar archivos sueltos con photorec:
   photorec /tmp/usb_imagen.img

6. Verifica el resultado:
   file /tmp/usb_imagen.img
   fdisk -l /tmp/usb_imagen.img"""
            },
            {
                "title": "Clonar y Hacer Imagen de USB con dd",
                "difficulty": "medium",
                "order_index": 5, "xp_reward": 160, "time_limit": 30,
                "description": """dd (Data Duplicator o "Disk Destroyer" si se usa mal) es la herramienta de copia a nivel de bloque más potente de Unix. Opera bit a bit, sin entender nada del contenido.

Casos de uso de dd con USB:
  1. Crear imagen ISO arrancable de un USB: dd if=/dev/sdb of=usb_backup.img
  2. Grabar una ISO a un USB: dd if=ubuntu.iso of=/dev/sdb bs=4M
  3. Borrar un USB de forma segura: dd if=/dev/urandom of=/dev/sdb bs=1M
  4. Clonar un USB a otro: dd if=/dev/sdb of=/dev/sdc bs=4M

Opciones importantes:
  if=  → input file (fuente)
  of=  → output file (destino)
  bs=  → block size (4M = bloques de 4MB, más rápido que el default de 512 bytes)
  count= → número de bloques a copiar
  status=progress → muestra progreso en tiempo real (en versiones modernas)

PELIGRO MÁXIMO: Si confundes if y of, puedes borrar el disco origen.
Siempre verifica los dispositivos con lsblk antes de ejecutar dd.

Alternativa más segura con progreso: pv + dd
  dd if=/dev/sdb | pv | dd of=usb_backup.img""",
                "goal_description": "Crear una imagen bit a bit de un USB con dd. Restaurar una imagen a un USB. Usar opciones de progreso para monitorizar la operación.",
                "step_by_step_guide": """1. PRIMERO: Verifica los dispositivos con lsblk. ¡Identifica correctamente el USB!
   lsblk -o NAME,SIZE,TYPE,TRAN,MOUNTPOINT

2. Desmonta el USB:
   umount /dev/sdb 2>/dev/null

3. Crea una imagen del USB (sustituye sdb por tu dispositivo):
   dd if=/dev/sdb of=/tmp/usb_backup.img bs=4M status=progress

4. Verifica la imagen creada:
   ls -lh /tmp/usb_backup.img
   file /tmp/usb_backup.img

5. Restaura la imagen a un USB (¡asegúrate de que of= es el USB correcto!):
   dd if=/tmp/usb_backup.img of=/dev/sdb bs=4M status=progress

6. Limpia los búferes y expulsa:
   sync
   udisksctl power-off -b /dev/sdb 2>/dev/null || umount /dev/sdb"""
            },
            {
                "title": "Cifrar un Pendrive con LUKS",
                "difficulty": "hard",
                "order_index": 6, "xp_reward": 220, "time_limit": 40,
                "description": """Si llevas datos sensibles en un USB y lo pierdes, cualquiera puede leer su contenido. LUKS (Linux Unified Key Setup) cifra el dispositivo con AES-256 por defecto. Sin la contraseña, los datos son ilegibles.

Proceso de cifrado:
  1. Formatea el dispositivo con LUKS:
     cryptsetup luksFormat /dev/sdb

  2. Abre el dispositivo cifrado (introduce la contraseña):
     cryptsetup open /dev/sdb usb_cifrado
     → Esto crea /dev/mapper/usb_cifrado

  3. Formatea el contenedor abierto con ext4:
     mkfs.ext4 /dev/mapper/usb_cifrado

  4. Monta y usa normalmente:
     mount /dev/mapper/usb_cifrado /mnt/usb_seguro

  5. Al terminar, desmonta y cierra el contenedor:
     umount /mnt/usb_seguro
     cryptsetup close usb_cifrado

Inspección:
  cryptsetup luksDump /dev/sdb  → muestra metadatos LUKS (sin revelar la clave)
  cryptsetup status usb_cifrado → estado del contenedor abierto""",
                "goal_description": "Cifrar un USB con LUKS para proteger datos sensibles. Abrir, usar y cerrar correctamente el contenedor cifrado. Entender el impacto en rendimiento del cifrado.",
                "step_by_step_guide": """1. Instala cryptsetup:
   apt-get install -y cryptsetup

2. Desmonta el USB si está montado:
   umount /dev/sdb 2>/dev/null

3. Formatea con LUKS (introduce una contraseña segura cuando se pida):
   cryptsetup luksFormat /dev/sdb

4. Abre el contenedor cifrado:
   cryptsetup open /dev/sdb usb_cifrado

5. Formatea el contenedor abierto:
   mkfs.ext4 /dev/mapper/usb_cifrado

6. Monta y escribe datos:
   mkdir -p /mnt/usb_seguro
   mount /dev/mapper/usb_cifrado /mnt/usb_seguro
   echo "Datos confidenciales" > /mnt/usb_seguro/secreto.txt

7. Cierra de forma segura:
   umount /mnt/usb_seguro
   cryptsetup close usb_cifrado

8. Verifica que sin abrir el contenedor no se puede acceder:
   mount /dev/sdb /mnt/test 2>&1 || echo "Correcto: no se puede montar sin la clave" """
            },
            {
                "title": "Automontaje con udev y udisks2",
                "difficulty": "hard",
                "order_index": 7, "xp_reward": 200, "time_limit": 35,
                "description": """En entornos de escritorio, los USBs se montan automáticamente gracias a udisks2 y udev. En servidores (sin entorno gráfico), puedes configurar reglas udev para el automontaje.

udev: el gestor de dispositivos del kernel
  - Detecta hardware nuevo y crea los archivos en /dev
  - Se configura con reglas en /etc/udev/rules.d/
  - Las reglas se aplican cuando se conecta un dispositivo

Crear una regla de automontaje por ID de fabricante:
  lsusb → obtiene VID:PID del dispositivo (ej: 0781:5583)

Archivo de regla: /etc/udev/rules.d/99-usb-automount.rules
  ACTION=="add", KERNEL=="sd[b-z][0-9]", SUBSYSTEM=="block", \\
  ENV{ID_VENDOR_ID}=="0781", ENV{ID_MODEL_ID}=="5583", \\
  RUN+="/bin/mount /dev/%k /mnt/usb_auto"

Recargar reglas:
  udevadm control --reload-rules
  udevadm trigger

Monitorizar eventos udev:
  udevadm monitor → muestra eventos en tiempo real al conectar/desconectar hardware

udisksctl (sin root para usuarios normales):
  udisksctl mount -b /dev/sdb1
  udisksctl unmount -b /dev/sdb1
  udisksctl info -b /dev/sdb1""",
                "goal_description": "Entender el sistema udev de detección de dispositivos. Crear una regla básica de automontaje. Usar udisksctl para gestionar dispositivos sin permisos de root.",
                "step_by_step_guide": """1. Monitoriza eventos udev en tiempo real:
   udevadm monitor --subsystem-match=block &
   MONITOR_PID=$!

2. Identifica el USB con udevadm:
   udevadm info -q all -n /dev/sdb

3. Obtén los atributos del USB para la regla:
   udevadm info -q property -n /dev/sdb | grep -E 'ID_VENDOR|ID_MODEL|ID_BUS'

4. Crea una regla de automontaje básica:
   cat > /etc/udev/rules.d/99-usb-automount.rules << 'EOF'
   ACTION=="add", KERNEL=="sd[b-z]1", SUBSYSTEM=="block", ENV{ID_BUS}=="usb", RUN+="/bin/mkdir -p /mnt/usb_auto"
   EOF

5. Recarga las reglas:
   udevadm control --reload-rules

6. Usa udisksctl para montar sin sudo:
   udisksctl mount -b /dev/sdb1

7. Termina el monitoreo:
   kill $MONITOR_PID 2>/dev/null"""
            },
            {
                "title": "Tarjetas SD y Almacenamiento Flash: Desgaste y Vida Útil",
                "difficulty": "hard",
                "order_index": 8, "xp_reward": 200, "time_limit": 35,
                "description": """Las tarjetas SD y la memoria flash NAND tienen un número limitado de ciclos de escritura. A diferencia de los discos magnéticos, no fallen gradualmente: pueden fallar de golpe.

Factores que aceleran el desgaste:
  1. Swapfile en tarjeta SD → la swap escribe constantemente (killer para SD)
  2. Logs del sistema escritos en SD → /var/log en flash es peligroso
  3. Bases de datos en SD → escrituras aleatorias frecuentes

Buenas prácticas para prolongar vida de SD:
  Usar noatime en fstab:
    UUID=... /  ext4  defaults,noatime  0  1
    (evita actualizar el tiempo de acceso en cada lectura)

  tmpfs para logs temporales:
    tmpfs  /var/log  tmpfs  defaults,noatime,size=50M  0  0
    (los logs se guardan en RAM, no en la SD)

  Mover la swap a RAM:
    dphys-swapfile swapoff  (en Raspberry Pi)
    swapoff -a

Para inspeccionar salud de flash:
  lsblk -d -o NAME,SIZE,ROTA  → ROTA=0 es SSD/flash, ROTA=1 es HDD
  No hay S.M.A.R.T. estándar para SD, pero algunas tarjetas lo soportan vía MMC.""",
                "goal_description": "Entender el desgaste de la memoria flash. Configurar un sistema con SD para maximizar su vida útil. Usar noatime y tmpfs para reducir las escrituras.",
                "step_by_step_guide": """1. Identifica si el dispositivo es flash o magnético:
   lsblk -d -o NAME,SIZE,ROTA,MODEL
   (ROTA=0 = SSD/Flash/USB, ROTA=1 = HDD mecánico)

2. Comprueba las opciones de montaje actuales:
   mount | grep ' / '
   cat /proc/mounts | grep ' / '

3. Simula una configuración noatime (sin hacerlo permanente):
   mount -o remount,noatime /
   mount | grep ' / '

4. Configura tmpfs para logs temporales en RAM:
   mount -t tmpfs -o size=50M tmpfs /tmp
   df -h /tmp

5. Verifica cuánto escribe el sistema en tiempo real:
   iostat -d 1 5   (observa kB_wrtn/s de cada dispositivo)

6. Identifica los procesos que más escriben:
   iotop -o 2>/dev/null || echo "iotop no disponible" """
            },
        ]
        insert_labs(db, m4, m4_labs)

        # ── MÓDULO 5: RAID Software con mdadm ───────────────────────────
        m5 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M5 — RAID Software con mdadm").first()
        if not m5:
            m5 = Module(
                skill_path_id=path.id,
                title="M5 — RAID Software con mdadm",
                description="Implementa RAID por software en Linux con mdadm. Aprende los niveles RAID 0, 1, 5 y 10 y cómo gestionar fallos de disco en producción.",
                order_index=5, is_active=True, requires_validation=False
            )
            db.add(m5); db.commit(); db.refresh(m5)

        m5_labs = [
            {
                "title": "Conceptos de RAID: Niveles y Casos de Uso",
                "difficulty": "medium",
                "order_index": 1, "xp_reward": 130, "time_limit": 25,
                "description": """RAID (Redundant Array of Independent Disks) combina varios discos físicos para obtener mayor velocidad, mayor capacidad o mayor tolerancia a fallos (o combinación).

RAID 0 — Striping (División):
  - Los datos se reparten entre todos los discos en franjas
  - Sin redundancia: si falla UN disco, se pierden TODOS los datos
  - Ventaja: velocidad máxima (lectura y escritura paralelas)
  - Uso: edición de vídeo temporal, donde la velocidad importa más que la seguridad
  - Capacidad útil: 100% (N discos de 1TB → 2TB)

RAID 1 — Mirroring (Espejo):
  - Copia exacta de un disco en el otro
  - Tolerante a fallo de un disco
  - Velocidad de lectura mejorada (puede leer de ambos)
  - Escritura: igual que un disco (escribe en los dos)
  - Capacidad útil: 50% (2 discos de 1TB → 1TB)
  - Uso: SO, bases de datos críticas

RAID 5 — Striping con Paridad:
  - Datos distribuidos con información de paridad
  - Tolerante a fallo de UN disco
  - Mínimo 3 discos
  - Capacidad útil: (N-1)/N (3 discos de 1TB → 2TB)
  - Uso: servidores de archivos, NAS

RAID 10 — Espejo + División (1+0):
  - Combina RAID 1 y RAID 0
  - Tolerante a fallo de un disco por par
  - Mínimo 4 discos
  - Capacidad útil: 50%
  - Uso: bases de datos de alto rendimiento con redundancia""",
                "goal_description": "Comprender los niveles RAID más importantes. Calcular la capacidad útil y redundancia de cada nivel. Elegir el RAID adecuado para cada caso de uso.",
                "step_by_step_guide": """1. Instala mdadm (herramienta de RAID software):
   apt-get install -y mdadm

2. Comprueba los dispositivos disponibles para RAID:
   lsblk -o NAME,SIZE,TYPE

3. Calcula capacidades para estos ejercicios teóricos:
   - 4 discos de 2TB en RAID 0: ¿capacidad total?  → 8TB
   - 4 discos de 2TB en RAID 1: ¿capacidad total?  → 2TB
   - 4 discos de 2TB en RAID 5: ¿capacidad total?  → 6TB
   - 4 discos de 2TB en RAID 10: ¿capacidad total? → 4TB

4. Comprueba si hay arrays RAID existentes en el sistema:
   cat /proc/mdstat

5. Lista todos los dispositivos mdadm:
   mdadm --examine --scan 2>/dev/null || echo "Sin arrays RAID detectados" """
            },
            {
                "title": "Crear un Array RAID 1 (Espejo)",
                "difficulty": "hard",
                "order_index": 2, "xp_reward": 220, "time_limit": 40,
                "description": """RAID 1 es el más simple de implementar y el más recomendado para discos del sistema operativo. Si un disco falla, el sistema sigue funcionando con el otro.

Creación de RAID 1 con mdadm:
  mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc

  --create /dev/md0   → nombre del array (md0, md1, md2...)
  --level=1           → RAID 1 (espejo)
  --raid-devices=2    → número de discos

Monitorizar la sincronización inicial:
  cat /proc/mdstat   → muestra el progreso de sincronización
  watch -n2 cat /proc/mdstat

La sincronización puede tardar minutos u horas según el tamaño. Durante este tiempo el RAID funciona, pero con rendimiento reducido.

Persistencia de la configuración:
  mdadm --detail --scan >> /etc/mdadm/mdadm.conf
  update-initramfs -u  → incluye la config en el initramfs

Uso posterior (igual que una partición):
  mkfs.ext4 /dev/md0
  mount /dev/md0 /mnt/raid""",
                "goal_description": "Crear un array RAID 1 con dos discos. Monitorizar la sincronización inicial. Formatear y montar el array. Guardar la configuración para que persista al reiniciar.",
                "step_by_step_guide": """1. Prepara los discos (deben estar desmontados y sin uso):
   umount /dev/sdb 2>/dev/null
   umount /dev/sdc 2>/dev/null

2. Crea el array RAID 1:
   mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc
   (Acepta con 'y' si pregunta sobre superblocks existentes)

3. Monitoriza la sincronización:
   cat /proc/mdstat
   watch -n3 cat /proc/mdstat

4. Mientras sincroniza, ya puedes usar el array:
   mkfs.ext4 /dev/md0
   mkdir -p /mnt/raid1
   mount /dev/md0 /mnt/raid1

5. Verifica el array:
   mdadm --detail /dev/md0

6. Guarda la configuración:
   mdadm --detail --scan | tee -a /etc/mdadm/mdadm.conf"""
            },
            {
                "title": "Crear un Array RAID 5",
                "difficulty": "hard",
                "order_index": 3, "xp_reward": 220, "time_limit": 40,
                "description": """RAID 5 es el nivel más popular en servidores NAS y de archivos porque ofrece buen equilibrio entre rendimiento, capacidad y redundancia. Con 3 discos de 1TB obtienes 2TB útiles con tolerancia al fallo de un disco.

Cómo funciona la paridad:
  - Los datos se dividen en bloques que se distribuyen entre N-1 discos
  - El bloque de paridad (XOR de los datos) va rotando entre todos los discos
  - Si un disco falla, los datos se reconstruyen a partir del resto + paridad
  - La reconstrucción se hace automáticamente cuando insertas un disco nuevo

Creación RAID 5:
  mdadm --create /dev/md0 --level=5 --raid-devices=3 /dev/sdb /dev/sdc /dev/sdd

Velocidades típicas RAID 5:
  Lectura: casi tan rápido como RAID 0 (paralelo)
  Escritura: más lenta que RAID 0 (hay que calcular la paridad)

Limitación: Mientras se reconstruye tras un fallo, si falla otro disco pierdes TODO.
RAID 6 soluciona esto (doble paridad, tolera 2 fallos), pero con más overhead.""",
                "goal_description": "Crear un array RAID 5 con tres discos. Comprender el concepto de paridad distribuida. Calcular la capacidad útil del array.",
                "step_by_step_guide": """1. Verifica que tienes al menos 3 discos disponibles:
   lsblk -o NAME,SIZE,TYPE | grep disk

2. Crea el array RAID 5 con 3 discos:
   mdadm --create /dev/md0 --level=5 --raid-devices=3 /dev/sdb /dev/sdc /dev/sdd

3. Monitoriza la sincronización:
   watch -n5 cat /proc/mdstat

4. Muestra los detalles del array:
   mdadm --detail /dev/md0

5. Calcula la capacidad útil:
   # Con 3 discos de igual tamaño, la capacidad es (N-1)/N = 2/3 del espacio total
   lsblk /dev/md0

6. Formatea y monta:
   mkfs.ext4 /dev/md0
   mkdir -p /mnt/raid5
   mount /dev/md0 /mnt/raid5
   df -h /mnt/raid5"""
            },
            {
                "title": "Simular Fallo de Disco y Reconstrucción en RAID 1",
                "difficulty": "hard",
                "order_index": 4, "xp_reward": 250, "time_limit": 45,
                "description": """La prueba definitiva de un sistema RAID es comprobar que sobrevive al fallo de un disco. mdadm permite marcar un disco como fallido para simular este escenario.

Proceso de simulación y recuperación:

1. Marcar un disco como fallido (simula fallo físico):
   mdadm /dev/md0 --fail /dev/sdb

2. Eliminar el disco fallido del array:
   mdadm /dev/md0 --remove /dev/sdb

3. El array queda en estado DEGRADED (funcional pero sin redundancia):
   mdadm --detail /dev/md0  → verás "State: clean, degraded"
   cat /proc/mdstat         → verás [2/1] [_U] o similar

4. Sustituir el disco (reemplazas el físico):
   mdadm /dev/md0 --add /dev/sdb  → añade el nuevo disco

5. La reconstrucción comienza automáticamente:
   watch -n5 cat /proc/mdstat  → observa el progreso de rebuild

6. El array vuelve a estado "clean" cuando termina

Monitorización de alertas (en producción):
  mdadm --monitor --daemonise --mail=admin@empresa.com /dev/md0""",
                "goal_description": "Simular el fallo de un disco en un array RAID 1 activo. Verificar que el sistema sigue funcionando en modo degradado. Reemplazar el disco y monitorizar la reconstrucción.",
                "step_by_step_guide": """1. Verifica el estado inicial del RAID 1:
   mdadm --detail /dev/md0

2. Escribe datos de prueba al array:
   echo "Datos importantes" > /mnt/raid1/importante.txt

3. Simula el fallo del primer disco:
   mdadm /dev/md0 --fail /dev/sdb

4. Comprueba que el sistema sigue funcionando:
   cat /mnt/raid1/importante.txt   → los datos deben estar accesibles
   mdadm --detail /dev/md0         → estado: degraded

5. Elimina el disco fallido:
   mdadm /dev/md0 --remove /dev/sdb

6. Añade el disco de reemplazo:
   mdadm /dev/md0 --add /dev/sdb

7. Monitoriza la reconstrucción:
   watch -n3 cat /proc/mdstat"""
            },
            {
                "title": "RAID 0: Rendimiento Máximo sin Redundancia",
                "difficulty": "medium",
                "order_index": 5, "xp_reward": 170, "time_limit": 30,
                "description": """RAID 0 distribuye los datos en franjas (stripes) entre todos los discos simultáneamente. Tanto las lecturas como las escrituras se realizan en paralelo, multiplicando el ancho de banda.

Con 2 discos de 200MB/s cada uno, RAID 0 proporciona ~400MB/s.

Creación:
  mdadm --create /dev/md0 --level=0 --raid-devices=2 /dev/sdb /dev/sdc

Tamaño del stripe (chunk):
  --chunk=512K  → bloques de 512KB por disco
  Chunk pequeño: mejor para muchos archivos pequeños
  Chunk grande: mejor para archivos grandes (vídeo, backups)

ADVERTENCIA CRÍTICA:
  En RAID 0, si falla UN solo disco, los datos de TODOS los discos son irrecuperables.
  Los datos están distribuidos en fragmentos entre ambos discos, sin ninguna copia.
  NUNCA uses RAID 0 para datos que no tengas en otro sitio.

Uso legítimo:
  - Discos de scratch para renders de vídeo temporales
  - Cache de compilación en CI/CD
  - Datos temporales que se regeneran desde otra fuente""",
                "goal_description": "Crear un RAID 0 y medir la diferencia de rendimiento respecto a un disco solo. Entender el riesgo de pérdida total de datos. Medir velocidad con dd.",
                "step_by_step_guide": """1. Mide la velocidad de un disco solo como referencia:
   dd if=/dev/zero of=/dev/sdb bs=1G count=1 oflag=direct 2>&1 | grep copied

2. Crea el RAID 0:
   mdadm --create /dev/md0 --level=0 --raid-devices=2 /dev/sdb /dev/sdc

3. Formatea y monta:
   mkfs.ext4 /dev/md0
   mkdir -p /mnt/raid0
   mount /dev/md0 /mnt/raid0

4. Mide la velocidad del RAID 0:
   dd if=/dev/zero of=/mnt/raid0/speed_test bs=1G count=1 oflag=direct 2>&1 | grep copied

5. Compara con la velocidad de un solo disco del paso 1.

6. Verifica la capacidad total (debe ser N veces el disco individual):
   df -h /mnt/raid0"""
            },
            {
                "title": "Gestión de Arrays RAID: Mantenimiento y Monitorización",
                "difficulty": "hard",
                "order_index": 6, "xp_reward": 200, "time_limit": 35,
                "description": """En producción, los arrays RAID necesitan monitorización continua. mdadm tiene un daemon de monitorización que envía alertas por email cuando detecta fallos.

Comandos de gestión diaria:

Estado del sistema RAID:
  cat /proc/mdstat          → estado compacto de todos los arrays
  mdadm --detail /dev/md0  → estado detallado de un array
  mdadm --detail --scan    → todos los arrays

Operaciones de mantenimiento:
  mdadm --stop /dev/md0    → detiene el array (desmonta antes)
  mdadm --assemble /dev/md0 /dev/sdb /dev/sdc  → ensambla un array existente
  mdadm --zero-superblock /dev/sdb  → borra metadata RAID de un disco

Test de los discos del array:
  echo check > /sys/block/md0/md/sync_action    → inicia un test de consistencia
  cat /sys/block/md0/md/sync_completed          → progreso del test

Monitorización automática (daemon):
  mdadm --monitor --daemonise --scan --delay=300
  (revisa cada 5 minutos, envía alertas si hay problemas)

En /etc/mdadm/mdadm.conf se configura:
  MAILADDR admin@empresa.com  → email para alertas
  DEVICE /dev/sd*             → dispositivos a monitorizar""",
                "goal_description": "Configurar la monitorización automática de arrays RAID. Ejecutar tests de consistencia. Interpretar el estado del array y tomar acciones de mantenimiento.",
                "step_by_step_guide": """1. Muestra el estado de todos los arrays:
   cat /proc/mdstat

2. Detalle completo del array:
   mdadm --detail /dev/md0

3. Inicia un test de consistencia (verifica que todos los discos son iguales):
   echo check > /sys/block/md0/md/sync_action

4. Monitoriza el progreso del test:
   watch -n5 'cat /proc/mdstat && echo "---" && cat /sys/block/md0/md/sync_completed'

5. Comprueba si hay errores en el bitmap:
   mdadm --detail /dev/md0 | grep -E 'State|Events|Failed'

6. Escanea y guarda la configuración:
   mdadm --detail --scan > /etc/mdadm/mdadm.conf
   cat /etc/mdadm/mdadm.conf"""
            },
        ]
        insert_labs(db, m5, m5_labs)

        print("\n=== PARTE 2 COMPLETADA ===")
        print(f"  M4 ({m4.id}): {len(m4_labs)} labs de USB/Extraíble")
        print(f"  M5 ({m5.id}): {len(m5_labs)} labs de RAID")
        print("Ejecuta seed_storage_v2_part3.py a continuación.")

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback; traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run()
