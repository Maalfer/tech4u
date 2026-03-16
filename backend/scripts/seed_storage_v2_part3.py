"""
seed_storage_v2_part3.py
Part 3: Modules 6 (LUKS Encryption), 7 (NFS Network Storage), 8 (Real Scenarios)
Must run AFTER part1 and part2.
Usage: cd backend && source venv/bin/activate && python3 scripts/seed_storage_v2_part3.py
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

        # ── MÓDULO 6: Cifrado de Disco con LUKS ─────────────────────────
        m6 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M6 — Cifrado de Almacenamiento con LUKS").first()
        if not m6:
            m6 = Module(
                skill_path_id=path.id,
                title="M6 — Cifrado de Almacenamiento con LUKS",
                description="Protege datos en reposo usando LUKS (Linux Unified Key Setup) y dm-crypt. Aprende a cifrar particiones, discos completos y ficheros contenedor.",
                order_index=6, is_active=True, requires_validation=False
            )
            db.add(m6); db.commit(); db.refresh(m6)

        m6_labs = [
            {
                "title": "Introducción a LUKS y dm-crypt",
                "difficulty": "medium",
                "order_index": 1, "xp_reward": 150, "time_limit": 30,
                "description": """LUKS (Linux Unified Key Setup) es el estándar de cifrado de disco en Linux. Se construye sobre dm-crypt, el módulo de cifrado del kernel.

Arquitectura:
  Hardware → dm-crypt (kernel) → LUKS header → datos cifrados

Componentes:
  cryptsetup: herramienta de espacio de usuario para gestionar LUKS
  dm-crypt: módulo del kernel que realiza el cifrado/descifrado al vuelo
  /dev/mapper/: donde aparecen los dispositivos descifrados

El header LUKS contiene:
  - Algoritmo y parámetros de cifrado (AES-256-XTS por defecto en LUKS2)
  - Hasta 8 "slots" de claves (cada slot puede tener su propia contraseña)
  - Salt y key derivation function (PBKDF2 o Argon2 en LUKS2)

Versiones:
  LUKS1: compatible con versiones antiguas de cryptsetup
  LUKS2: más moderno, soporta Argon2, integridad, tokens de hardware

Para verificar si LUKS está disponible:
  cryptsetup --version
  ls /sys/module/ | grep dm_crypt""",
                "goal_description": "Entender la arquitectura de LUKS y dm-crypt. Verificar la disponibilidad del sistema de cifrado. Conocer los parámetros de cifrado por defecto.",
                "step_by_step_guide": """1. Instala cryptsetup:
   apt-get install -y cryptsetup

2. Verifica la versión y capacidades:
   cryptsetup --version

3. Comprueba que dm-crypt está cargado en el kernel:
   lsmod | grep dm_crypt || modprobe dm_crypt

4. Lista los parámetros por defecto de LUKS2:
   cryptsetup --help 2>&1 | grep -A5 'Default'

5. Comprueba el soporte de algoritmos:
   cryptsetup benchmark 2>/dev/null | head -20

6. Muestra los mapeos de dm-crypt existentes:
   ls /dev/mapper/ 2>/dev/null"""
            },
            {
                "title": "Cifrar una Partición con LUKS",
                "difficulty": "hard",
                "order_index": 2, "xp_reward": 220, "time_limit": 40,
                "description": """El proceso de cifrar una partición con LUKS destruye cualquier dato existente en ella. Siempre haz backup primero.

Proceso completo:

1. Formatear con LUKS (crea el header y cifra):
   cryptsetup luksFormat /dev/sdb1

   Opciones avanzadas:
   cryptsetup luksFormat --type luks2 --cipher aes-xts-plain64 --key-size 512 /dev/sdb1

2. Abrir el contenedor (introduce la contraseña → crea /dev/mapper/nombre):
   cryptsetup open /dev/sdb1 datos_cifrados

3. Formatear el interior con ext4:
   mkfs.ext4 /dev/mapper/datos_cifrados

4. Montar y usar:
   mount /dev/mapper/datos_cifrados /mnt/seguro

5. Desmontar y cerrar:
   umount /mnt/seguro
   cryptsetup close datos_cifrados

Información del header LUKS:
  cryptsetup luksDump /dev/sdb1   → metadatos sin revelar la clave""",
                "goal_description": "Cifrar una partición completa con LUKS. Usar el contenedor cifrado normalmente. Entender el proceso de apertura y cierre seguro.",
                "step_by_step_guide": """1. Desmonta y verifica que la partición está libre:
   umount /dev/sdb1 2>/dev/null
   lsblk /dev/sdb1

2. Formatea con LUKS (escribe YES en mayúsculas y elige una contraseña segura):
   cryptsetup luksFormat /dev/sdb1

3. Abre el contenedor:
   cryptsetup open /dev/sdb1 vault

4. Verifica que el dispositivo mapeado existe:
   ls -la /dev/mapper/vault

5. Formatea el interior:
   mkfs.ext4 /dev/mapper/vault

6. Monta y escribe datos:
   mkdir -p /mnt/vault
   mount /dev/mapper/vault /mnt/vault
   echo "Datos confidenciales" > /mnt/vault/secreto.txt

7. Cierre seguro:
   umount /mnt/vault
   cryptsetup close vault

8. Muestra el header LUKS:
   cryptsetup luksDump /dev/sdb1"""
            },
            {
                "title": "Gestión de Claves LUKS (Múltiples Contraseñas)",
                "difficulty": "hard",
                "order_index": 3, "xp_reward": 220, "time_limit": 40,
                "description": """LUKS soporta hasta 8 slots de claves. Cada slot puede contener una contraseña diferente (o un archivo de clave). Esto permite:
  - Contraseña de administrador + contraseña de usuario
  - Contraseña de emergencia en sobre sellado
  - Usar un archivo de clave para desbloqueo automático (sin intervención humana)

Gestión de slots:
  cryptsetup luksAddKey /dev/sdb1         → añade una nueva contraseña al slot siguiente libre
  cryptsetup luksRemoveKey /dev/sdb1      → elimina una contraseña (pide la que quieres borrar)
  cryptsetup luksChangeKey /dev/sdb1      → cambia una contraseña
  cryptsetup luksDump /dev/sdb1           → muestra qué slots están ocupados (Key Slot X: ENABLED)
  cryptsetup luksKillSlot /dev/sdb1 1     → elimina el slot número 1

Archivo de clave (keyfile):
  dd if=/dev/urandom of=/root/keyfile.bin bs=512 count=4   → genera keyfile aleatorio
  cryptsetup luksAddKey /dev/sdb1 /root/keyfile.bin        → añade el keyfile como slot
  cryptsetup open /dev/sdb1 vault --key-file /root/keyfile.bin  → abre con keyfile

El keyfile permite desbloqueo automático en /etc/crypttab:
  vault /dev/sdb1 /root/keyfile.bin luks""",
                "goal_description": "Añadir y eliminar claves LUKS en distintos slots. Crear un archivo de clave para desbloqueo automático. Configurar crypttab para montaje automático.",
                "step_by_step_guide": """1. Muestra los slots actuales del dispositivo LUKS:
   cryptsetup luksDump /dev/sdb1 | grep -i 'key slot'

2. Añade una segunda contraseña (necesitarás la contraseña original):
   cryptsetup luksAddKey /dev/sdb1

3. Genera un archivo de clave seguro:
   dd if=/dev/urandom of=/root/keyfile.bin bs=512 count=4
   chmod 400 /root/keyfile.bin

4. Añade el keyfile como slot adicional:
   cryptsetup luksAddKey /dev/sdb1 /root/keyfile.bin

5. Verifica los slots:
   cryptsetup luksDump /dev/sdb1 | grep -i 'key slot'

6. Prueba abrir con el keyfile:
   cryptsetup open /dev/sdb1 vault_auto --key-file /root/keyfile.bin
   cryptsetup close vault_auto

7. Configura apertura automática en /etc/crypttab:
   echo "vault /dev/sdb1 /root/keyfile.bin luks" >> /etc/crypttab
   cat /etc/crypttab"""
            },
            {
                "title": "Backup y Restauración del Header LUKS",
                "difficulty": "hard",
                "order_index": 4, "xp_reward": 200, "time_limit": 35,
                "description": """El header LUKS se encuentra al inicio del dispositivo cifrado y contiene todas las claves cifradas y metadatos. Si el header se corrompe (por un error de escritura, un corte de luz durante una operación crítica...), los datos son completamente irrecuperables.

Por eso es CRÍTICO hacer backup del header.

Backup del header:
  cryptsetup luksHeaderBackup /dev/sdb1 --header-backup-file /root/luks_header_sdb1.bak
  → Guarda este archivo en un lugar DIFERENTE del disco cifrado

Restauración del header:
  cryptsetup luksHeaderRestore /dev/sdb1 --header-backup-file /root/luks_header_sdb1.bak

Verificar integridad del header (LUKS2):
  cryptsetup luksDump /dev/sdb1   → si funciona, el header está bien

Tamaño típico del backup:
  LUKS1: 1KB + 8 slots × 128KB = ~1MB
  LUKS2: varía, pero normalmente 16MB

IMPORTANTE: El backup contiene las claves cifradas. Si alguien obtiene el backup y tu contraseña, puede descifrar los datos. Guárdalo de forma segura y cifrado.""",
                "goal_description": "Crear un backup del header LUKS en un lugar seguro. Restaurar el header desde el backup. Entender por qué la pérdida del header es irrecuperable.",
                "step_by_step_guide": """1. Crea el directorio de backups seguros:
   mkdir -p /root/luks_backups
   chmod 700 /root/luks_backups

2. Haz backup del header LUKS:
   cryptsetup luksHeaderBackup /dev/sdb1 --header-backup-file /root/luks_backups/sdb1_header.bak

3. Verifica el tamaño del backup:
   ls -lh /root/luks_backups/sdb1_header.bak

4. Prueba el backup: simula restauración en modo dry-run (si hay opción):
   cryptsetup luksDump /root/luks_backups/sdb1_header.bak 2>/dev/null || echo "El backup es binario, no puede mostrarse directamente"

5. Para restaurar (en caso de corrupción real):
   # cryptsetup luksHeaderRestore /dev/sdb1 --header-backup-file /root/luks_backups/sdb1_header.bak
   echo "Comando de restauración: cryptsetup luksHeaderRestore /dev/sdb1 --header-backup-file /root/luks_backups/sdb1_header.bak"

6. Protege el backup con permisos estrictos:
   chmod 400 /root/luks_backups/sdb1_header.bak
   ls -la /root/luks_backups/"""
            },
            {
                "title": "VeraCrypt: Cifrado Multiplataforma",
                "difficulty": "hard",
                "order_index": 5, "xp_reward": 200, "time_limit": 40,
                "description": """VeraCrypt es la alternativa open-source a TrueCrypt, compatible con Windows, macOS y Linux. A diferencia de LUKS (solo Linux), los volúmenes VeraCrypt pueden abrirse en cualquier sistema operativo.

Casos de uso para preferir VeraCrypt sobre LUKS:
  - Necesitas acceder a los datos desde Windows o Mac
  - Quieres volúmenes de archivos (contenedor en un fichero, no una partición)
  - Necesitas la función de "denegación plausible" (volúmenes ocultos)

Tipos de volúmenes VeraCrypt:
  1. Archivo contenedor: un fichero en tu disco que actúa como volumen cifrado
  2. Partición cifrada: similar a LUKS
  3. Volumen del sistema: cifra el SO completo (solo Windows)

Comandos básicos (modo texto, sin GUI):
  veracrypt --create contenedor.vc   → crea un volumen interactivamente
  veracrypt contenedor.vc /mnt/vc    → monta el volumen
  veracrypt -d /mnt/vc               → desmonta

Volúmenes ocultos (denegación plausible):
  Un volumen VeraCrypt puede contener un volumen OCULTO. Si te obligan a revelar la contraseña, das la del volumen externo (que tiene datos falsos). La contraseña del volumen interno solo la sabes tú.""",
                "goal_description": "Instalar VeraCrypt en línea de comandos. Crear un volumen cifrado en archivo. Entender la denegación plausible con volúmenes ocultos.",
                "step_by_step_guide": """1. Descarga e instala VeraCrypt (si la red está disponible):
   # En el sandbox la red está bloqueada, muestra el proceso teórico:
   echo "Instalación en producción:"
   echo "wget https://launchpad.net/veracrypt/trunk/1.26.14/+download/veracrypt-1.26.14-Ubuntu-22.04-amd64.deb"
   echo "dpkg -i veracrypt-1.26.14-Ubuntu-22.04-amd64.deb"

2. Si VeraCrypt está disponible, crea un contenedor:
   # veracrypt --text --create /tmp/volumen.vc
   which veracrypt 2>/dev/null && echo "VeraCrypt disponible" || echo "VeraCrypt no instalado en este lab (instalar en producción)"

3. Alternativa con LUKS en fichero contenedor (funcionalidad equivalente):
   dd if=/dev/zero of=/tmp/contenedor.img bs=1M count=100
   cryptsetup luksFormat /tmp/contenedor.img
   cryptsetup open /tmp/contenedor.img contenedor_cifrado --type luks
   mkfs.ext4 /dev/mapper/contenedor_cifrado
   mkdir -p /mnt/contenedor
   mount /dev/mapper/contenedor_cifrado /mnt/contenedor
   echo "Volumen cifrado en archivo funcionando" > /mnt/contenedor/prueba.txt
   umount /mnt/contenedor
   cryptsetup close contenedor_cifrado"""
            },
            {
                "title": "Cifrado con LUKS sobre LVM (Arquitecturas Híbridas)",
                "difficulty": "hard",
                "order_index": 6, "xp_reward": 250, "time_limit": 45,
                "description": """En entornos de producción avanzados se combinan LVM y LUKS para obtener lo mejor de ambos: la flexibilidad de LVM con la seguridad del cifrado.

Hay dos arquitecturas comunes:

1. LUKS sobre LVM (LVM-on-LUKS):
   PV → VG → LV → LUKS → filesystem
   - El LV actúa como la partición a cifrar
   - Puedes cifrar solo algunos LVs, no todos

2. LVM sobre LUKS (LUKS-on-LVM):
   Partición → LUKS → PV → VG → LV → filesystem
   - Toda la "bolsa" de LVM está cifrada
   - Más seguro: todos los LVs quedan cifrados automáticamente
   - Este es el esquema por defecto en instalaciones Ubuntu Full Disk Encryption

Ventajas de LVM-on-LUKS:
  - Redimensionar LVs en caliente
  - Snapshots LVM de datos cifrados
  - Un solo paso de autenticación para todos los volúmenes

Proceso LVM-on-LUKS:
  cryptsetup luksFormat /dev/sdb
  cryptsetup open /dev/sdb sdb_crypt
  pvcreate /dev/mapper/sdb_crypt
  vgcreate vg_secure /dev/mapper/sdb_crypt
  lvcreate -L 5G -n lv_datos vg_secure
  mkfs.ext4 /dev/vg_secure/lv_datos""",
                "goal_description": "Implementar la arquitectura LUKS-on-LVM. Crear LVs dentro de un volumen cifrado. Entender la diferencia entre las dos arquitecturas híbridas.",
                "step_by_step_guide": """1. Cifra el disco completo con LUKS:
   cryptsetup luksFormat /dev/sdb

2. Abre el contenedor LUKS:
   cryptsetup open /dev/sdb disco_cifrado

3. Usa el dispositivo descifrado como Physical Volume de LVM:
   pvcreate /dev/mapper/disco_cifrado

4. Crea el Volume Group sobre el contenedor cifrado:
   vgcreate vg_secure /dev/mapper/disco_cifrado

5. Crea LVs dentro del VG cifrado:
   lvcreate -L 2G -n lv_app vg_secure
   lvcreate -l 100%FREE -n lv_datos vg_secure

6. Formatea y monta:
   mkfs.ext4 /dev/vg_secure/lv_app
   mkdir -p /mnt/app_secure
   mount /dev/vg_secure/lv_app /mnt/app_secure

7. Verifica la arquitectura completa:
   lsblk /dev/sdb
   lvs vg_secure"""
            },
        ]
        insert_labs(db, m6, m6_labs)

        # ── MÓDULO 7: NFS y Almacenamiento en Red ───────────────────────
        m7 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M7 — NFS y Almacenamiento en Red").first()
        if not m7:
            m7 = Module(
                skill_path_id=path.id,
                title="M7 — NFS y Almacenamiento en Red",
                description="Configura y gestiona almacenamiento en red con NFS (Network File System). Comparte directorios entre servidores Linux y monta sistemas de archivos remotos.",
                order_index=7, is_active=True, requires_validation=False
            )
            db.add(m7); db.commit(); db.refresh(m7)

        m7_labs = [
            {
                "title": "Introducción a NFS: Conceptos y Arquitectura",
                "difficulty": "medium",
                "order_index": 1, "xp_reward": 130, "time_limit": 25,
                "description": """NFS (Network File System) permite acceder a archivos en un servidor remoto como si estuvieran en el disco local. Es el protocolo de almacenamiento en red más usado en entornos Linux/Unix.

Arquitectura cliente-servidor:
  SERVIDOR NFS: exporta directorios → archivo /etc/exports
  CLIENTE NFS: monta los exports como si fueran particiones locales

Versiones:
  NFSv3: sin autenticación integrada (usa host-based auth), sin estado
  NFSv4: tiene estado, soporte ACL, autenticación Kerberos, más seguro
  NFSv4.1: paralelo, mejoras de rendimiento (pNFS)

Puertos:
  NFSv3: usa portmapper (rpcbind) y puertos variables → difícil de firewallizar
  NFSv4: solo puerto 2049/tcp → fácil de firewallizar

Casos de uso:
  - Directorio /home compartido en una red de estaciones de trabajo
  - Almacenamiento compartido para un cluster de servidores
  - Directorio de código fuente compartido entre máquinas de desarrollo
  - Backup de datos desde múltiples servidores a un NAS central

Paquetes necesarios:
  Servidor: nfs-kernel-server
  Cliente: nfs-common""",
                "goal_description": "Entender la arquitectura NFS cliente-servidor. Conocer las diferencias entre versiones. Instalar los paquetes necesarios para servidor y cliente.",
                "step_by_step_guide": """1. Instala los paquetes de NFS:
   apt-get install -y nfs-kernel-server nfs-common

2. Verifica que los servicios están disponibles:
   systemctl status nfs-kernel-server 2>/dev/null || echo "Servicio NFS disponible"

3. Comprueba el archivo de exports (estará vacío en un sistema nuevo):
   cat /etc/exports

4. Verifica la versión de NFS soportada:
   cat /proc/fs/nfsd/versions 2>/dev/null || echo "NFS server no iniciado aún"

5. Lista los exports activos (vacío al inicio):
   exportfs -v 2>/dev/null || echo "Ningún export configurado todavía"

6. Muestra los puertos RPC disponibles:
   rpcinfo -p 2>/dev/null | head -20 || echo "rpcbind no disponible en este entorno" """
            },
            {
                "title": "Configurar un Servidor NFS",
                "difficulty": "hard",
                "order_index": 2, "xp_reward": 200, "time_limit": 35,
                "description": """El archivo /etc/exports define qué directorios se comparten y con qué permisos.

Formato de /etc/exports:
  /ruta/directorio  cliente(opciones)

Ejemplos:
  /datos  192.168.1.0/24(rw,sync,no_subtree_check)
  /backups  10.0.0.5(ro,sync,no_root_squash)
  /home  *(rw,sync,root_squash)

Opciones principales:
  rw              → lectura/escritura
  ro              → solo lectura
  sync            → escribe al disco antes de responder (más seguro)
  async           → responde antes de escribir (más rápido pero arriesgado)
  no_subtree_check → desactiva verificación de subdirectorios (mejora rendimiento)
  root_squash     → mapea root del cliente a nobody (seguridad por defecto)
  no_root_squash  → root del cliente mantiene privilegios en el servidor (peligroso)
  all_squash      → mapea todos los usuarios a nobody:nogroup

Aplicar cambios sin reiniciar:
  exportfs -ra    → re-exporta todo
  exportfs -v     → lista exports activos

Verificar desde el cliente:
  showmount -e servidor_ip    → muestra los exports disponibles""",
                "goal_description": "Configurar /etc/exports para compartir directorios. Entender las opciones de seguridad de NFS. Aplicar cambios sin reiniciar el servicio.",
                "step_by_step_guide": """1. Crea el directorio a compartir:
   mkdir -p /srv/nfs/compartido
   chmod 777 /srv/nfs/compartido
   echo "Archivo de prueba NFS" > /srv/nfs/compartido/readme.txt

2. Configura el export en /etc/exports:
   echo "/srv/nfs/compartido  127.0.0.1(rw,sync,no_subtree_check)" >> /etc/exports

3. Inicia el servidor NFS:
   systemctl start nfs-kernel-server 2>/dev/null || service nfs-kernel-server start 2>/dev/null

4. Aplica los exports:
   exportfs -ra
   exportfs -v

5. Verifica desde el mismo servidor (loopback):
   showmount -e localhost

6. Monta el export en el propio servidor (test local):
   mkdir -p /mnt/nfs_test
   mount -t nfs localhost:/srv/nfs/compartido /mnt/nfs_test
   ls /mnt/nfs_test"""
            },
            {
                "title": "Montar Recursos NFS en el Cliente",
                "difficulty": "medium",
                "order_index": 3, "xp_reward": 160, "time_limit": 30,
                "description": """Una vez que el servidor exporta un directorio, cualquier cliente autorizado puede montarlo.

Montaje manual:
  mount -t nfs servidor_ip:/ruta/export /mnt/nfs

Opciones de montaje del cliente:
  -o vers=4       → fuerza NFSv4
  -o rsize=1048576,wsize=1048576  → bloques de lectura/escritura de 1MB (mejora rendimiento)
  -o hard,intr    → hard: reintenta indefinidamente; intr: permite Ctrl+C
  -o soft,timeo=5 → soft: falla tras el timeout (riesgoso en escritura)
  -o ro           → solo lectura

Montaje permanente en /etc/fstab:
  servidor_ip:/srv/nfs/compartido  /mnt/datos  nfs  vers=4,rsize=1048576,wsize=1048576,hard,intr  0  0

Automontaje con autofs (monta solo cuando se accede, desmonta cuando no se usa):
  apt-get install autofs
  En /etc/auto.master: /mnt/nfs  /etc/auto.nfs
  En /etc/auto.nfs: compartido  servidor_ip:/srv/nfs/compartido

Diagnóstico de problemas NFS:
  showmount -e servidor_ip  → verifica que el export existe
  mount | grep nfs           → lista montajes NFS activos
  nfsstat                    → estadísticas de NFS""",
                "goal_description": "Montar un recurso NFS manualmente con opciones de rendimiento. Configurar el montaje permanente en fstab. Diagnosticar problemas de conectividad NFS.",
                "step_by_step_guide": """1. Verifica que el servidor tiene el export disponible:
   showmount -e localhost

2. Monta el recurso NFS:
   mkdir -p /mnt/nfs_datos
   mount -t nfs -o vers=4 localhost:/srv/nfs/compartido /mnt/nfs_datos

3. Verifica el montaje:
   mount | grep nfs
   df -h /mnt/nfs_datos

4. Lee y escribe archivos:
   ls /mnt/nfs_datos
   echo "Escrito desde el cliente" > /mnt/nfs_datos/desde_cliente.txt

5. Mira las estadísticas NFS:
   nfsstat -c 2>/dev/null || mountstats /mnt/nfs_datos

6. Prepara la entrada de fstab (sin añadirla si el servidor no está en red):
   echo "# Ejemplo fstab para NFS:"
   echo "localhost:/srv/nfs/compartido  /mnt/nfs_datos  nfs  vers=4,rsize=1048576,wsize=1048576,hard  0  0"

7. Desmonta:
   umount /mnt/nfs_datos"""
            },
            {
                "title": "Rendimiento y Seguridad en NFS",
                "difficulty": "hard",
                "order_index": 4, "xp_reward": 200, "time_limit": 40,
                "description": """NFS sin configurar bien puede ser un peligro de seguridad y un cuello de botella de rendimiento.

SEGURIDAD:
1. Autenticación basada en host (NFSv3 y NFSv4 sin Kerberos):
   Solo permite acceso por IP. Cualquier máquina en esa IP tiene acceso.
   Usar siempre rangos de IP específicos, nunca '*' en producción.

2. root_squash (SIEMPRE activado por defecto):
   El root del cliente no tiene root en el servidor. Se mapea a nobody.
   no_root_squash es peligroso: si alguien compromete un cliente, tiene root en el servidor.

3. Firewall para NFS:
   NFSv4: solo abrir puerto 2049/tcp
   iptables -A INPUT -p tcp --dport 2049 -s 192.168.1.0/24 -j ACCEPT

RENDIMIENTO:
1. Tamaño de bloque (rsize/wsize):
   Mount con rsize=1048576,wsize=1048576 (1MB) mejora significativamente el throughput

2. Número de threads del servidor:
   cat /proc/fs/nfsd/threads  → threads actuales
   echo 16 > /proc/fs/nfsd/threads  → aumentar a 16 para más clientes concurrentes

3. async vs sync en el servidor:
   async: más rápido pero riesgo de corrupción ante caídas de red
   sync: más seguro, recomendado en producción

4. Caché del cliente:
   noatime en fstab: evita actualizar timestamps de acceso (reduce escrituras)""",
                "goal_description": "Auditar la configuración de seguridad de NFS. Optimizar el rendimiento con opciones de montaje. Proteger el servidor NFS con firewall.",
                "step_by_step_guide": """1. Revisa la configuración actual de exports:
   cat /etc/exports
   exportfs -v

2. Verifica que root_squash está activo (debe aparecer en los exports):
   exportfs -v | grep squash

3. Comprueba el número de threads del servidor NFS:
   cat /proc/fs/nfsd/threads 2>/dev/null || echo "NFS server no activo"

4. Aumenta los threads para mejor rendimiento:
   echo 8 > /proc/fs/nfsd/threads 2>/dev/null || echo "Requiere NFS server activo"

5. Verifica las reglas de firewall para NFS:
   iptables -L INPUT -n | grep 2049 || echo "Sin regla específica para NFS"

6. Analiza el rendimiento del montaje NFS con dd:
   mount | grep nfs | grep -q nfs_datos && dd if=/dev/zero of=/mnt/nfs_datos/speed_test bs=1M count=50 oflag=direct 2>&1 | grep copied || echo "Monta el NFS primero"

7. Limpia el archivo de test:
   rm -f /mnt/nfs_datos/speed_test 2>/dev/null"""
            },
            {
                "title": "Samba: Compartir con Windows",
                "difficulty": "hard",
                "order_index": 5, "xp_reward": 200, "time_limit": 40,
                "description": """Samba implementa el protocolo SMB/CIFS que usa Windows para compartir archivos e impresoras. Permite que Linux comparta recursos con Windows y viceversa.

Casos de uso:
  - Servidor de archivos Linux accesible desde Windows
  - Compartir una carpeta de Ubuntu/Linux con Windows sin software extra
  - Acceder a carpetas compartidas de Windows desde Linux

Configuración básica del servidor (/etc/samba/smb.conf):
  [global]
  workgroup = WORKGROUP
  server string = Servidor Linux
  security = user

  [compartido]
  path = /srv/samba/compartido
  browseable = yes
  writable = yes
  valid users = usuario_samba

Comandos clave:
  smbpasswd -a usuario   → añade usuario a Samba (contraseña independiente de Linux)
  testparm               → verifica la sintaxis de smb.conf
  systemctl reload smbd  → aplica cambios

Acceso desde Linux (cliente):
  apt-get install cifs-utils
  mount -t cifs //servidor_ip/compartido /mnt/samba -o username=usuario

Acceso desde Windows: \\servidor_ip\compartido""",
                "goal_description": "Instalar y configurar Samba como servidor de archivos. Añadir usuarios y compartir directorios. Montar recursos Samba desde Linux.",
                "step_by_step_guide": """1. Instala Samba y las herramientas de cliente:
   apt-get install -y samba cifs-utils

2. Verifica la instalación:
   smbd --version
   testparm -s

3. Crea el directorio a compartir:
   mkdir -p /srv/samba/public
   chmod 777 /srv/samba/public
   echo "Archivo de Samba" > /srv/samba/public/bienvenido.txt

4. Configura un share anónimo en smb.conf:
   cat >> /etc/samba/smb.conf << 'EOF'
[public]
   path = /srv/samba/public
   browseable = yes
   writable = yes
   guest ok = yes
   guest only = yes
EOF

5. Verifica la configuración:
   testparm -s

6. Inicia los servicios:
   systemctl start smbd nmbd 2>/dev/null || service smbd start 2>/dev/null

7. Monta el share desde el propio servidor (loopback):
   mkdir -p /mnt/samba_test
   mount -t cifs //localhost/public /mnt/samba_test -o guest
   ls /mnt/samba_test"""
            },
            {
                "title": "iSCSI: Almacenamiento en Bloque por Red",
                "difficulty": "hard",
                "order_index": 6, "xp_reward": 250, "time_limit": 45,
                "description": """iSCSI (Internet Small Computer Systems Interface) envía comandos SCSI sobre TCP/IP. A diferencia de NFS (que comparte filesystems), iSCSI comparte dispositivos de bloque RAW: el cliente ve el disco como si fuera local.

Diferencia clave:
  NFS/Samba: comparte sistema de archivos (archivos y carpetas)
  iSCSI: comparte dispositivo de bloque (el cliente decide el filesystem)

Terminología:
  Target: el servidor que ofrece el almacenamiento
  Initiator: el cliente que usa el almacenamiento
  LUN (Logical Unit Number): una "unidad lógica" de almacenamiento que el target exporta
  IQN (iSCSI Qualified Name): identificador único del target/initiator

Formato IQN: iqn.YYYY-MM.dominio.invertido:nombre
  Ejemplo: iqn.2024-01.com.empresa:storage-01

Casos de uso:
  - Clusters de alta disponibilidad (múltiples nodos comparten el mismo disco)
  - VMware ESXi datastores (los discos de las VMs viven en iSCSI)
  - Oracle RAC (base de datos compartida entre nodos)

Paquetes:
  Servidor (target): tgt
  Cliente (initiator): open-iscsi""",
                "goal_description": "Configurar un target iSCSI básico. Conectar un initiator al target. Entender la diferencia entre almacenamiento en bloque y en archivo.",
                "step_by_step_guide": """1. Instala los paquetes de servidor (target) y cliente (initiator):
   apt-get install -y tgt open-iscsi

2. Crea un archivo que actúe como LUN (disco virtual de 500MB):
   dd if=/dev/zero of=/srv/iscsi_lun0.img bs=1M count=500

3. Configura el target:
   cat > /etc/tgt/conf.d/lab.conf << 'EOF'
<target iqn.2024-01.com.tech4u:lab-storage>
    backing-store /srv/iscsi_lun0.img
    initiator-address 127.0.0.1
</target>
EOF

4. Inicia el servicio:
   systemctl start tgt 2>/dev/null || service tgt start 2>/dev/null

5. Verifica el target:
   tgtadm --mode target --op show

6. Descubre y conecta desde el initiator (localhost):
   iscsiadm -m discovery -t sendtargets -p 127.0.0.1
   iscsiadm -m node --login

7. Verifica el nuevo dispositivo de bloque:
   lsblk | grep -i isc || lsblk"""
            },
        ]
        insert_labs(db, m7, m7_labs)

        # ── MÓDULO 8: Escenarios Reales y Recuperación ───────────────────
        m8 = db.query(Module).filter(Module.skill_path_id == path.id, Module.title == "M8 — Escenarios Reales y Recuperación de Datos").first()
        if not m8:
            m8 = Module(
                skill_path_id=path.id,
                title="M8 — Escenarios Reales y Recuperación de Datos",
                description="Practica escenarios de crisis reales: disco lleno en producción, recuperación de datos borrados, migración de servidores y planificación de backups.",
                order_index=8, is_active=True, requires_validation=False
            )
            db.add(m8); db.commit(); db.refresh(m8)

        m8_labs = [
            {
                "title": "Protocolo de Emergencia: Disco al 100%",
                "difficulty": "hard",
                "order_index": 1, "xp_reward": 250, "time_limit": 45,
                "description": """Escenario: Son las 3AM. El sistema de monitorización envía una alerta: el disco del servidor de producción está al 100%. Los servicios empiezan a fallar.

PROTOCOLO COMPLETO DE RESPUESTA:

FASE 1 - DIAGNÓSTICO (2 minutos):
  df -h                    → confirma el problema y qué partición
  du -h --max-depth=2 / 2>/dev/null | sort -rh | head -20  → localiza el culpable

FASE 2 - LIBERACIÓN DE EMERGENCIA (sin reiniciar servicios):
  find /var/log -name "*.gz" -delete   → elimina logs comprimidos (seguros)
  truncate -s 0 /var/log/syslog        → vacía logs sin matar procesos
  apt-get clean                         → limpia caché de paquetes

FASE 3 - VERIFICAR QUÉ PROCESO PRODUCE EL ARCHIVO:
  lsof | grep deleted  → lista archivos eliminados pero aún abiertos por procesos
  (Si un proceso tiene abierto un log eliminado, el espacio no se libera hasta que el proceso muere)

FASE 4 - SOLUCIÓN PERMANENTE:
  Ampliar con LVM si es posible
  Configurar logrotate para rotación automática
  Mover /var a un volumen separado""",
                "goal_description": "Ejecutar el protocolo completo de respuesta a disco lleno. Liberar espacio sin interrumpir servicios. Identificar archivos eliminados pero aún ocupando espacio (lsof).",
                "step_by_step_guide": """1. Simula el disco lleno:
   dd if=/dev/zero of=/tmp/fill_disk bs=1M count=300 2>&1

2. Confirma el problema:
   df -h /tmp

3. Localiza los archivos que consumen espacio:
   du -h /tmp --max-depth=1 | sort -rh | head -5

4. Abre un archivo con un proceso y luego bórralo (simula el problema del espacio no liberado):
   tail -f /tmp/fill_disk > /dev/null &
   TAIL_PID=$!
   rm -f /tmp/fill_disk
   df -h /tmp    # El espacio NO se libera hasta matar el proceso

5. Lista los archivos "fantasma" (eliminados pero abiertos):
   lsof +L1 2>/dev/null | head -10

6. Mata el proceso para liberar el espacio real:
   kill $TAIL_PID
   df -h /tmp    # Ahora sí se libera

7. Limpia la caché de paquetes:
   apt-get clean
   df -h /"""
            },
            {
                "title": "Recuperar Archivos Borrados con extundelete",
                "difficulty": "hard",
                "order_index": 2, "xp_reward": 250, "time_limit": 50,
                "description": """Cuando borras un archivo en Linux con rm, el kernel solo elimina la entrada en el directorio y marca los bloques como libres. Los datos siguen en el disco hasta que se sobreescriban con nuevos datos.

Herramientas de recuperación para ext4:
  extundelete: recupera archivos individuales de un filesystem ext4
  photorec: recupera por tipos de archivo (fotos, docs...) ignorando el filesystem
  testdisk: recupera particiones y tablas de particiones

REGLA DE ORO: Actúa rápido. Cada byte escrito al disco puede sobreescribir datos recuperables.
  1. Desmonta la partición inmediatamente (o monta en read-only)
  2. Trabaja sobre una imagen del dispositivo (dd primero)
  3. Nunca instales herramientas de recuperación en el mismo disco afectado

Proceso con extundelete:
  extundelete /dev/sdb1 --restore-all         → recupera todo
  extundelete /dev/sdb1 --restore-directory /home/usuario
  extundelete /dev/sdb1 --restore-file /home/usuario/important.txt

Los archivos recuperados se guardan en ./RECOVERED_FILES/""",
                "goal_description": "Recuperar archivos borrados accidentalmente de una partición ext4. Usar extundelete y photorec. Aplicar la regla de oro de no escribir en el disco afectado.",
                "step_by_step_guide": """1. Instala extundelete:
   apt-get install -y extundelete

2. Crea una partición de prueba y archivos:
   mkfs.ext4 /dev/sdb1 2>/dev/null || echo "Usa la partición existente"
   mount /dev/sdb1 /mnt/recuperacion 2>/dev/null
   echo "Archivo muy importante" > /mnt/recuperacion/importante.txt
   echo "Datos de la empresa" > /mnt/recuperacion/empresa.txt

3. Borra los archivos (simula el accidente):
   rm /mnt/recuperacion/importante.txt /mnt/recuperacion/empresa.txt

4. ACTÚA RÁPIDO: Desmonta inmediatamente para evitar sobreescritura:
   umount /mnt/recuperacion

5. Intenta recuperar:
   mkdir -p /tmp/recuperados
   cd /tmp/recuperados
   extundelete /dev/sdb1 --restore-all

6. Verifica los archivos recuperados:
   ls -la /tmp/recuperados/RECOVERED_FILES/ 2>/dev/null || echo "Intenta con photorec si extundelete falla"

7. Alternativa con photorec:
   photorec /dev/sdb1 2>/dev/null || echo "Instala photorec: apt-get install -y testdisk" """
            },
            {
                "title": "Migración de Sistema: Clonación con rsync",
                "difficulty": "hard",
                "order_index": 3, "xp_reward": 220, "time_limit": 45,
                "description": """Migrar un servidor a un disco nuevo es una tarea crítica. rsync permite clonar un sistema en funcionamiento de forma incremental, minimizando el tiempo de downtime.

Por qué rsync mejor que dd para migración de SO:
  dd: copia todos los bloques (incluidos vacíos), no es incremental, requiere mismo tamaño
  rsync: copia solo lo que ha cambiado, puede ejecutarse varias veces, soporta destinos más grandes

Proceso de migración con rsync:

FASE 1 (sin downtime, puede tardar horas):
  rsync -aAXv --exclude={/dev/*,/proc/*,/sys/*,/tmp/*,/run/*,/mnt/*,/media/*,/lost+found} / /mnt/nuevo_disco/

FASE 2 (mínimo downtime, segunda sincronización con los cambios):
  Detener servicios críticos
  rsync -aAXv --delete --exclude={...} / /mnt/nuevo_disco/

FASE 3 (configurar el arranque en el nuevo disco):
  chroot /mnt/nuevo_disco
  grub-install /dev/sdb
  update-grub

Opciones de rsync:
  -a: archive (preserva permisos, propietarios, timestamps, symlinks)
  -A: preserva ACLs
  -X: preserva atributos extendidos
  -v: verbose
  --delete: elimina en destino lo que no existe en origen
  --exclude: excluye rutas""",
                "goal_description": "Clonar un sistema de archivos con rsync preservando todos los atributos. Ejecutar una segunda sincronización incremental. Preparar el disco destino para arrancar.",
                "step_by_step_guide": """1. Prepara el disco destino:
   mkfs.ext4 /dev/sdb1
   mkdir -p /mnt/destino
   mount /dev/sdb1 /mnt/destino

2. Primera sincronización (copia inicial completa, puede tardar mucho):
   rsync -aAX --exclude={/dev/*,/proc/*,/sys/*,/tmp/*,/run/*,/mnt/*,/media/*,/lost+found} / /mnt/destino/

3. Verifica el tamaño copiado:
   du -sh /mnt/destino

4. Segunda sincronización (incremental, solo los cambios):
   rsync -aAX --delete --exclude={/dev/*,/proc/*,/sys/*,/tmp/*,/run/*,/mnt/*,/media/*,/lost+found} / /mnt/destino/

5. Crea los directorios del sistema en el destino:
   mkdir -p /mnt/destino/{dev,proc,sys,tmp,run,mnt}

6. Verifica la estructura del sistema copiado:
   ls /mnt/destino/
   du -sh /mnt/destino/*"""
            },
            {
                "title": "Estrategia de Backup con rsync y rotación",
                "difficulty": "hard",
                "order_index": 4, "xp_reward": 220, "time_limit": 40,
                "description": """Una estrategia de backup robusta debe cubrir:
  - Qué se hace backup: datos críticos, configuraciones, bases de datos
  - Con qué frecuencia: diario, semanal, mensual
  - Dónde se guarda: local + remoto (regla 3-2-1)
  - Cuánto tiempo se conserva: retención

Regla 3-2-1:
  3 copias de los datos
  2 tipos de media diferentes (disco local + NAS o nube)
  1 copia fuera del sitio

Backup incremental con rsync y hard links:
  Técnica de backup "time-machine style": cada backup es completo visualmente, pero internamente usa hard links para no duplicar archivos no modificados.

  rsync -av --link-dest=/backups/2024-01-01/ /datos/ /backups/2024-01-02/

  El directorio 2024-01-02 contiene TODOS los archivos, pero los no modificados son hard links al backup anterior. Solo los archivos nuevos o modificados ocupan espacio adicional.

Script de backup diario con retención de 7 días:
  FECHA=$(date +%Y-%m-%d)
  ANTERIOR=$(date -d "yesterday" +%Y-%m-%d)
  rsync -av --link-dest=/backups/$ANTERIOR /datos/ /backups/$FECHA/
  find /backups -maxdepth 1 -name "20*" -mtime +7 -exec rm -rf {} ;""",
                "goal_description": "Implementar una estrategia de backup incremental con rsync y hard links. Configurar rotación automática. Calcular el espacio real consumido por los backups.",
                "step_by_step_guide": """1. Crea la estructura de directorios:
   mkdir -p /datos/importantes
   mkdir -p /backups
   echo "Archivo crítico v1" > /datos/importantes/datos.txt
   echo "Config servidor" > /datos/importantes/config.cfg

2. Primer backup completo:
   FECHA1=$(date +%Y-%m-%d)
   rsync -av /datos/ /backups/$FECHA1/

3. Modifica un archivo:
   echo "Archivo crítico v2 - MODIFICADO" > /datos/importantes/datos.txt

4. Segundo backup incremental (solo copia los cambios, enlaza el resto):
   FECHA2=$(date +%Y-%m-%d)_2
   rsync -av --link-dest=/backups/$FECHA1/ /datos/ /backups/$FECHA2/

5. Compara los tamaños:
   du -sh /backups/$FECHA1/ /backups/$FECHA2/
   ls -li /backups/$FECHA1/importantes/ /backups/$FECHA2/importantes/
   # Los inodos iguales son hard links (mismo archivo físico)

6. El script con retención (para ejecutar en cron):
   cat << 'EOF'
#!/bin/bash
FECHA=$(date +%Y-%m-%d)
AYER=$(date -d yesterday +%Y-%m-%d)
rsync -av --link-dest=/backups/$AYER/ /datos/ /backups/$FECHA/
find /backups -maxdepth 1 -name "20*" -mtime +7 -exec rm -rf {} \;
EOF"""
            },
            {
                "title": "Monitorización de Almacenamiento con Scripts",
                "difficulty": "medium",
                "order_index": 5, "xp_reward": 180, "time_limit": 35,
                "description": """La monitorización proactiva detecta problemas antes de que causen incidentes. Un script simple de monitorización de disco puede enviarte alertas cuando el uso supera el 80%.

Script de alerta de disco:
  #!/bin/bash
  UMBRAL=80
  df -h | awk 'NR>1 {
    uso=$5
    gsub(/%/, "", uso)
    if (uso > UMBRAL) {
      print "ALERTA: " $6 " al " $5 " de uso"
    }
  }' UMBRAL=$UMBRAL

Métricas a monitorizar:
  1. Espacio en disco: df -h → alertar si >80%
  2. Inodos: df -i → alertar si >80%
  3. Velocidad de I/O: iostat → alertar si util >80%
  4. Salud del disco: smartctl → alertar si falla el test
  5. Estado RAID: cat /proc/mdstat → alertar si hay disco degradado

Integración con sistemas de monitorización:
  Nagios/Icinga: plugins check_disk, check_iobusy
  Prometheus: node_exporter exporta todas las métricas de disco
  Zabbix: items de almacenamiento predefinidos
  Grafana + Prometheus: dashboards visuales de almacenamiento""",
                "goal_description": "Crear un script de monitorización de disco con alertas. Verificar inodos además de bloques. Automatizar la ejecución con cron.",
                "step_by_step_guide": """1. Crea el script de monitorización:
   cat > /usr/local/bin/check_disk.sh << 'SCRIPT'
#!/bin/bash
UMBRAL=${1:-80}
echo "=== REPORTE DE DISCO $(date) ==="
echo ""
echo "-- Espacio en Bloques --"
df -h | awk -v threshold=$UMBRAL 'NR>1 && $5!="Use%" {
  uso=$5; gsub(/%/, "", uso)
  if (uso+0 >= threshold+0) {
    printf "[ALERTA] %s al %s (%s libre de %s)\n", $6, $5, $4, $2
  } else {
    printf "[  OK  ] %s al %s\n", $6, $5
  }
}'
echo ""
echo "-- Inodos --"
df -i | awk -v threshold=$UMBRAL 'NR>1 && $5!="IUse%" {
  uso=$5; gsub(/%/, "", uso)
  if (uso+0 >= threshold+0) {
    printf "[ALERTA] %s inodos al %s\n", $6, $5
  }
}'
SCRIPT
   chmod +x /usr/local/bin/check_disk.sh

2. Ejecuta el script:
   /usr/local/bin/check_disk.sh

3. Ejecuta con umbral personalizado del 50%:
   /usr/local/bin/check_disk.sh 50

4. Configura en cron para ejecutar cada hora:
   echo "0 * * * * root /usr/local/bin/check_disk.sh >> /var/log/disk_monitor.log 2>&1" | tee /etc/cron.d/disk_monitor
   cat /etc/cron.d/disk_monitor

5. Verifica el cron:
   crontab -l 2>/dev/null || cat /etc/cron.d/disk_monitor"""
            },
            {
                "title": "Proyecto Final: Infraestructura de Almacenamiento Completa",
                "difficulty": "hard",
                "order_index": 6, "xp_reward": 350, "time_limit": 60,
                "description": """Proyecto integrador final: diseña e implementa una infraestructura de almacenamiento completa para un servidor de producción simulado.

REQUISITOS DE LA INFRAESTRUCTURA:

1. RAID 1 para el sistema operativo (alta disponibilidad):
   2 discos en espejo → /dev/md0 → partición raíz

2. LVM para datos de aplicación (flexibilidad):
   Disco dedicado → PV → VG → LV separados para:
   - /app (aplicaciones): 2GB ext4
   - /datos (datos de usuario): 4GB ext4
   - /logs (logs): 1GB ext4, separado para que no llene /

3. Backup diario con rsync:
   Script que hace backup incremental de /datos a /backup

4. Monitorización automática:
   Script en cron que alerta si algún volumen supera el 80%

5. OPCIONAL: Cifrado LUKS en el volumen de /datos

Documentación esperada:
  lsblk completo
  df -h completo
  lvs, pvs, vgs
  cat /proc/mdstat
  crontab -l""",
                "goal_description": "Implementar una infraestructura completa con RAID 1 + LVM + Backup + Monitorización. Documentar la arquitectura final. Simular un fallo de disco y verificar la recuperación.",
                "step_by_step_guide": """Este es el proyecto final. Implementa todo lo que has aprendido:

PASO 1 - Planificación:
  Documenta qué disco va a qué rol antes de empezar.
  lsblk  # Identifica todos los discos disponibles

PASO 2 - RAID 1 (usa /dev/sdb y /dev/sdc):
  mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc
  mkfs.ext4 /dev/md0
  mkdir /mnt/sistema
  mount /dev/md0 /mnt/sistema

PASO 3 - LVM sobre /dev/sdd:
  pvcreate /dev/sdd
  vgcreate vg_app /dev/sdd
  lvcreate -L 2G -n lv_app vg_app
  lvcreate -L 4G -n lv_datos vg_app
  lvcreate -l 100%FREE -n lv_logs vg_app
  mkfs.ext4 /dev/vg_app/lv_app
  mkfs.ext4 /dev/vg_app/lv_datos
  mkfs.ext4 /dev/vg_app/lv_logs

PASO 4 - Monta todo:
  mount /dev/vg_app/lv_app /mnt/app
  mount /dev/vg_app/lv_datos /mnt/datos
  mount /dev/vg_app/lv_logs /mnt/logs

PASO 5 - Script de backup:
  cat > /usr/local/bin/backup_datos.sh << 'EOF'
#!/bin/bash
rsync -av --link-dest=/mnt/sistema/backups/$(date -d yesterday +%Y-%m-%d)/ /mnt/datos/ /mnt/sistema/backups/$(date +%Y-%m-%d)/
EOF
  chmod +x /usr/local/bin/backup_datos.sh

PASO 6 - Verifica la infraestructura completa:
  lsblk
  df -h
  lvs && pvs && vgs
  cat /proc/mdstat"""
            },
        ]
        insert_labs(db, m8, m8_labs)

        print("\n=== PARTE 3 COMPLETADA ===")
        print(f"  M6 ({m6.id}): {len(m6_labs)} labs de Cifrado LUKS")
        print(f"  M7 ({m7.id}): {len(m7_labs)} labs de NFS y Almacenamiento en Red")
        print(f"  M8 ({m8.id}): {len(m8_labs)} labs de Escenarios Reales")
        print("\n=== STORAGE V2 COMPLETADO ===")
        print("Total de módulos nuevos: 8 (M1 a M8)")
        print("Total aproximado de labs: 60")

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback; traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run()
