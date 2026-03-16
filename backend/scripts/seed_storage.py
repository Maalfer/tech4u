import os
import sys
import json

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, SkillPath, Module, Lab, Challenge

def seed_storage():
    db = SessionLocal()
    try:
        # 1. Create Skill Path
        path = db.query(SkillPath).filter(SkillPath.title == "Storage & Disk Administration").first()
        if not path:
            path = SkillPath(
                title="Storage & Disk Administration",
                description="Domina la gestión de discos, particiones y sistemas de archivos en Linux.",
                difficulty="medium",
                order_index=2,
                is_active=True
            )
            db.add(path)
            db.commit()
            db.refresh(path)
        
        # 2. Create Module
        module = db.query(Module).filter(Module.title == "Linux Labs L5 — Storage & Disk Administration").first()
        if not module:
            module = Module(
                skill_path_id=path.id,
                title="Linux Labs L5 — Storage & Disk Administration",
                description="Gestión de almacenamiento físico y lógico, LVM, SWAP y mantenimiento.",
                order_index=1,
                is_active=True,
                requires_validation=False
            )
            db.add(module)
            db.commit()
            db.refresh(module)

        # 3. Labs Data
        labs_data = [
            # FASE 1
            {
                "title": "Exploración de la Topología de Bloques",
                "difficulty": "easy",
                "guide_lab": "En Linux, los discos se presentan como archivos de bloque. El comando más potente para visualizar la jerarquía es lsblk. A diferencia de otros comandos, lsblk muestra visualmente qué partición pertenece a qué disco físico.",
                "objectives": "• Identificar discos físicos (sda, nvme).\n• Comprender la relación entre disco y partición.",
                "mission_guide": "1 Ejecuta: lsblk\n2 Identifica el disco principal y sus particiones.",
                "order_index": 1
            },
            {
                "title": "Análisis de Capacidad (df)",
                "difficulty": "easy",
                "guide_lab": "El comando df (Disk Free) es vital para saber cuánto espacio libre queda en cada sistema de archivos montado. La bandera -h lo hace legible para humanos (GB/MB).",
                "objectives": "• Monitorizar el espacio disponible.\n• Identificar puntos de montaje críticos como /.",
                "mission_guide": "1 Ejecuta: df -h\n2 Localiza el uso de la partición raíz.",
                "order_index": 2
            },
            {
                "title": "Uso Detallado de Directorios (du)",
                "difficulty": "medium",
                "guide_lab": "Cuando un disco se llena, du (Disk Usage) ayuda a encontrar al culpable. Usar du -sh * en un directorio nos da el tamaño total de cada subdirectorio.",
                "objectives": "• Rastrear carpetas que consumen demasiado espacio.",
                "mission_guide": "1 Entra en /var/log.\n2 Ejecuta: du -sh . para ver el tamaño total del directorio de logs.",
                "order_index": 3
            },
            {
                "title": "Identificación por UUID con blkid",
                "difficulty": "medium",
                "guide_lab": "Los nombres /dev/sda1 pueden cambiar. El UUID es un identificador único que nunca cambia, esencial para configuraciones de servidor profesionales.",
                "objectives": "• Obtener el identificador único de una partición.",
                "mission_guide": "1 Ejecuta: blkid\n2 Localiza el UUID de la partición activa.",
                "order_index": 4
            },
            {
                "title": "Inspección de Hardware con fdisk",
                "difficulty": "medium",
                "guide_lab": "fdisk -l permite ver la tabla de particiones detallada, incluyendo el sector de inicio, fin y el tipo de sistema de archivos (ID).",
                "objectives": "• Leer tablas de particiones de bajo nivel.",
                "mission_guide": "1 Ejecuta: fdisk -l\n2 Observa el tipo de partición (Linux, Swap, o GPT).",
                "order_index": 5
            },
            # FASE 2
            {
                "title": "Crear Particiones con fdisk",
                "difficulty": "medium",
                "guide_lab": "El comando fdisk es una herramienta interactiva. Para crear una partición, se usa la opción n dentro del menú del comando.",
                "objectives": "• Aprender el flujo de creación de particiones.",
                "mission_guide": "1 Inicia fdisk sobre un disco secundario: fdisk /dev/sdb\n2 Pulsa n para nueva partición, sigue los pasos y termina con w para escribir cambios.",
                "order_index": 6
            },
            {
                "title": "Formatear en EXT4",
                "difficulty": "medium",
                "guide_lab": "Una partición vacía no sirve de nada sin un sistema de archivos. mkfs.ext4 crea la estructura necesaria para guardar archivos.",
                "objectives": "• Crear un sistema de archivos Linux estándar.",
                "mission_guide": "1 Formatea la partición: mkfs.ext4 /dev/sdb1",
                "order_index": 7
            },
            {
                "title": "Montaje Manual (mount)",
                "difficulty": "medium",
                "guide_lab": "Montar consiste en unir una partición a un directorio (punto de montaje). Sin esto, el disco no es accesible.",
                "objectives": "• Vincular hardware a la estructura de carpetas.",
                "mission_guide": "1 Crea una carpeta: mkdir /data\n2 Monta el disco: mount /dev/sdb1 /data",
                "order_index": 8
            },
            {
                "title": "Desmontaje Seguro (umount)",
                "difficulty": "medium",
                "guide_lab": "Para extraer un disco o hacer cambios, hay que desmontarlo. Si el sistema dice que está 'busy', no podrás hacerlo.",
                "objectives": "• Desconectar unidades de forma segura.",
                "mission_guide": "1 Ejecuta: umount /data\n2 Verifica con lsblk que el punto de montaje ha desaparecido.",
                "order_index": 9
            },
            {
                "title": "Forzar Desmontaje (Lazy Unmount)",
                "difficulty": "hard",
                "guide_lab": "A veces un proceso bloquea el desmontaje. La bandera -l (lazy) permite desmontar el dispositivo en cuanto deje de estar ocupado.",
                "objectives": "• Resolver bloqueos de dispositivos.",
                "mission_guide": "1 Ejecuta: umount -l /mnt",
                "order_index": 10
            },
            # FASE 3
            {
                "title": "Persistencia con /etc/fstab",
                "difficulty": "hard",
                "guide_lab": "Los montajes con mount se borran al reiniciar. Para que sean permanentes, deben registrarse en el archivo /etc/fstab.",
                "objectives": "• Configurar montajes automáticos al arranque.",
                "mission_guide": "1 Abre el archivo: cat /etc/fstab\n2 Identifica la estructura: Dispositivo, Punto de montaje, Tipo, Opciones.",
                "order_index": 11
            },
            {
                "title": "Verificar errores en Filesystem (fsck)",
                "difficulty": "hard",
                "guide_lab": "fsck (File System Check) se usa para reparar discos dañados tras un apagón repentino. Nunca debe usarse en una partición montada.",
                "objectives": "• Reparar inconsistencias en el disco.",
                "mission_guide": "1 Desmonta la unidad.\n2 Ejecuta: fsck /dev/sdb1",
                "order_index": 12
            },
            {
                "title": "Uso de dmesg para errores de hardware",
                "difficulty": "medium",
                "guide_lab": "Si un disco está fallando físicamente, el kernel de Linux lo anotará en su registro. dmesg permite ver esos errores.",
                "objectives": "• Detectar fallos físicos de E/S (I/O Errors).",
                "mission_guide": "1 Ejecuta: dmesg | grep -i sd",
                "order_index": 13
            },
            {
                "title": "Monitorización con iostat",
                "difficulty": "hard",
                "guide_lab": "Para saber si un disco está saturado por demasiada escritura (cuello de botella), usamos iostat.",
                "objectives": "• Analizar el rendimiento de entrada/salida.",
                "mission_guide": "1 Ejecuta: iostat -xz 1",
                "order_index": 14
            },
            {
                "title": "Localizar archivos gigantes (find)",
                "difficulty": "medium",
                "guide_lab": "A veces un solo archivo de 50GB llena el disco. El comando find con la opción -size es el mejor buscador.",
                "objectives": "• Encontrar archivos específicos por tamaño.",
                "mission_guide": "1 Ejecuta: find / -size +100M para buscar archivos mayores de 100MB.",
                "order_index": 15
            },
            # FASE 4 (LVM)
            {
                "title": "Inicializar Volúmenes Físicos (PV)",
                "difficulty": "medium",
                "guide_lab": "LVM permite agrupar varios discos físicos en una sola unidad lógica. El primer paso es preparar el disco físico convirtiéndolo en un Physical Volume (PV).",
                "objectives": "• Preparar un disco virgen para su uso en LVM.",
                "mission_guide": "1 Ejecuta: pvcreate /dev/sdb\n2 Verifica el estado con: pvs",
                "order_index": 16
            },
            {
                "title": "Crear Grupos de Volúmenes (VG)",
                "difficulty": "medium",
                "guide_lab": "Un Volume Group (VG) es una 'bolsa' de almacenamiento que suma el espacio de varios discos físicos. Es la base de la flexibilidad de LVM.",
                "objectives": "• Agrupar discos físicos en una unidad lógica superior.",
                "mission_guide": "1 Crea el grupo: vgcreate vg_datos /dev/sdb\n2 Comprueba el espacio total del grupo con: vgs",
                "order_index": 17
            },
            {
                "title": "Crear Volúmenes Lógicos (LV)",
                "difficulty": "medium",
                "guide_lab": "El Logical Volume (LV) es lo que el usuario finalmente formatea y monta. Es como una 'partición virtual' que puede crecer en caliente.",
                "objectives": "• Segmentar el grupo de volúmenes en unidades utilizables.",
                "mission_guide": "1 Crea un volumen de 1GB: lvcreate -L 1G -n lv_proyectos vg_datos\n2 Verifica con: lvs",
                "order_index": 18
            },
            {
                "title": "Extender Volúmenes en Caliente",
                "difficulty": "hard",
                "guide_lab": "La mayor ventaja de LVM es que si un volumen se llena, puedes ampliarlo sin apagar el servidor. Se usa lvextend seguido de resize2fs.",
                "objectives": "• Ampliar capacidad de almacenamiento sin interrupción de servicio.",
                "mission_guide": "1 Amplía el volumen: lvextend -L +500M /dev/vg_datos/lv_proyectos\n2 Redimensiona el sistema de archivos: resize2fs /dev/vg_datos/lv_proyectos",
                "order_index": 19
            },
            {
                "title": "Gestión de Memoria SWAP (Archivo)",
                "difficulty": "medium",
                "guide_lab": "La memoria SWAP (intercambio) es espacio de disco que actúa como RAM cuando esta se agota. Se puede crear un archivo de swap sin necesidad de particionar.",
                "objectives": "• Evitar caídas del sistema por falta de memoria RAM.",
                "mission_guide": "1 Crea un archivo de 512MB: fallocate -l 512M /swapfile\n2 Dale permisos seguros: chmod 600 /swapfile\n3 Formatea como swap: mkswap /swapfile\n4 Actívalo: swapon /swapfile",
                "order_index": 20
            },
            # FASE 5
            {
                "title": "Identificar Salud del Disco (S.M.A.R.T.)",
                "difficulty": "hard",
                "guide_lab": "La tecnología S.M.A.R.T. permite predecir fallos de hardware. El comando smartctl lee los sensores internos del disco.",
                "objectives": "• Prevenir pérdida de datos mediante diagnóstico de hardware.",
                "mission_guide": "1 Ejecuta: smartctl -a /dev/sda\n2 Busca la línea 'SMART overall-health self-assessment test result'.",
                "order_index": 21
            },
            {
                "title": "Limpieza de Inodos (df -i)",
                "difficulty": "hard",
                "guide_lab": "A veces un disco tiene espacio (GB), pero no deja crear archivos. Esto pasa cuando se agotan los Inodos (índices de archivos).",
                "objectives": "• Diagnosticar problemas de agotamiento de índices de archivos.",
                "mission_guide": "1 Ejecuta: df -i\n2 Identifica si alguna partición está al 100% de IUse%.",
                "order_index": 22
            },
            {
                "title": "Cambiar Etiqueta de Disco (e2label)",
                "difficulty": "easy",
                "guide_lab": "Para organizar mejor un servidor, puedes poner nombres (etiquetas) a las particiones en lugar de recordarlas por /dev/sdc2.",
                "objectives": "• Etiquetar volúmenes para una administración más intuitiva.",
                "mission_guide": "1 Etiqueta la partición: e2label /dev/sdb1 BACKUP_DATA\n2 Verifica con: lsblk -f",
                "order_index": 23
            },
            {
                "title": "Uso de tune2fs para Mantenimiento",
                "difficulty": "hard",
                "guide_lab": "tune2fs permite ajustar parámetros del sistema de archivos, como cuántas veces se puede montar un disco antes de obligar a un chequeo automático.",
                "objectives": "• Ajustar parámetros internos de sistemas de archivos Ext4.",
                "mission_guide": "1 Ver configuración actual: tune2fs -l /dev/sda1",
                "order_index": 24
            },
            {
                "title": "Simulación: Recuperación de Disco Lleno",
                "difficulty": "hard",
                "guide_lab": "Escenario real: Un log ha crecido tanto que no puedes ni loguearte. Debes usar comandos de emergencia para liberar espacio sin borrar datos críticos.",
                "objectives": "• Resolver una crisis de disponibilidad por falta de espacio.",
                "mission_guide": "1 Encuentra el archivo más grande en /var/log: ls -lS /var/log | head\n2 Vacía el archivo sin borrarlo (para no romper el proceso que escribe): truncate -s 0 /var/log/syslog",
                "order_index": 25
            }
        ]

        for ld in labs_data:
            lab = db.query(Lab).filter(Lab.module_id == module.id, Lab.title == ld["title"]).first()
            if not lab:
                lab = Lab(
                    module_id=module.id,
                    title=ld["title"],
                    difficulty=ld["difficulty"],
                    description=ld["guide_lab"],
                    goal_description=ld["objectives"],
                    step_by_step_guide=ld["mission_guide"],
                    order_index=ld["order_index"],
                    is_active=True,
                    docker_image="ubuntu:22.04", # Default
                    xp_reward=100
                )
                db.add(lab)
        
        db.commit()
        print(f"Successfully seeded 'Storage & Disk Administration' with 25 labs.")
    except Exception as e:
        print(f"Error seeding storage: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_storage()
