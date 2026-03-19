import os, sys
from seed_utils import sync_subject_questions

SUBJECT = "Sistemas Operativos"

QUESTIONS = [
    # --- FÁCIL (Linux y Windows básico) ---
    {
        "text": "¿Qué comando Linux se utiliza para ver el contenido de un directorio?",
        "option_a": "cd",
        "option_b": "ls",
        "option_c": "mv",
        "option_d": "cp",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "El comando 'ls' (list) muestra los archivos y carpetas dentro de la ruta actual."
    },
    {
        "text": "¿Cuál es el nombre del administrador principal en sistemas Linux?",
        "option_a": "Administrator",
        "option_b": "root",
        "option_c": "super",
        "option_d": "system",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "El usuario 'root' es la cuenta con privilegios totales sobre el sistema en entornos Unix/Linux."
    },
    {
        "text": "¿Qué sistema de archivos es el estándar para las instalaciones modernas de Windows?",
        "option_a": "FAT32",
        "option_b": "NTFS",
        "option_c": "ext4",
        "option_d": "APFS",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "NTFS (New Technology File System) es el sistema de archivos principal de Windows desde Windows NT."
    },
    {
        "text": "¿Qué atajo de teclado abre el Administrador de Tareas en Windows?",
        "option_a": "Alt + F4",
        "option_b": "Ctrl + Shift + Esc",
        "option_c": "Ctrl + Alt + Del",
        "option_d": "Win + L",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "Ctrl + Shift + Esc es el camino más rápido para abrir el Administrador de Tareas directamente."
    },
    {
        "text": "En Linux, ¿para qué sirve el comando 'sudo'?",
        "option_a": "Para apagar el sistema.",
        "option_b": "Para ejecutar un comando con privilegios de otro usuario (normalmente root).",
        "option_c": "Para instalar programas.",
        "option_d": "Para buscar archivos.",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "Sudo (superuser do) permite a usuarios autorizados ejecutar comandos como administrador."
    },
    # --- MEDIO (Administración y Permisos) ---
    {
        "text": "¿Qué representan los permisos '755' en sistema octal en Linux?",
        "option_a": "R/W para todos.",
        "option_b": "R/W/X para dueño, R/X para grupo y otros.",
        "option_c": "R para todos.",
        "option_d": "RWX para todos.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "7 (4+2+1=rwx) es el dueño. 5 (4+1=rx) es el grupo y otros. (r=4, w=2, x=1)."
    },
    {
        "text": "¿Cuál es la función principal del 'Kernel' en un sistema operativo?",
        "option_a": "Servir como interfaz gráfica para el usuario.",
        "option_b": "Gestionar la comunicación entre el hardware y el software.",
        "option_c": "Navegar por internet.",
        "option_d": "Editar documentos de texto.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "El núcleo o kernel es el corazón del SO que administra la CPU, memoria y dispositivos periféricos."
    },
    {
        "text": "En Windows Server, ¿qué es el 'Active Directory'?",
        "option_a": "Un antivirus integrado.",
        "option_b": "Un servicio de directorio para gestionar identidades y recursos en una red corporativa.",
        "option_c": "Una aplicación para ver videos.",
        "option_d": "Una herramienta para desfragmentar el disco duro.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "Active Directory (AD) es una base de datos distribuida que centraliza la gestión de usuarios, ordenadores y políticas (GPOs)."
    },
    {
        "text": "¿Qué comando Linux se usa para cambiar los permisos de un archivo?",
        "option_a": "chown",
        "option_b": "chmod",
        "option_c": "chperm",
        "option_d": "passwd",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "chmod (change mode) se utiliza para modificar los bits de lectura, escritura y ejecución."
    },
    {
        "text": "¿Qué es la memoria virtual o archivo de paginación?",
        "option_a": "Memoria RAM que no se usa.",
        "option_b": "Uso de espacio en disco duro para simular memoria RAM adicional cuando esta se agota.",
        "option_c": "Un tipo de memoria caché de la CPU.",
        "option_d": "Memoria que solo funciona en máquinas virtuales.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "El SO mueve datos de la RAM al disco (swap/paging) para permitir que más aplicaciones se ejecuten simultáneamente."
    },
    # --- DIFÍCIL (Avanzado y Diagnóstico) ---
    {
        "text": "¿Qué es un 'Inode' (Inodo) en sistemas de archivos Linux?",
        "option_a": "Una carpeta especial para logs.",
        "option_b": "Una estructura de datos que almacena metadatos sobre un archivo (excepto su nombre).",
        "option_c": "Un tipo de virus que infecta particiones ext4.",
        "option_d": "El proceso que gestiona la red en el arranque.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "Los inodos contienen info como el dueño, permisos, tamaño y punteros a los bloques de datos en disco."
    },
    {
        "text": "En el arranque de Linux, ¿cuál es el primer proceso que se ejecuta (ID 1) en sistemas modernos?",
        "option_a": "bash",
        "option_b": "systemd",
        "option_c": "init",
        "option_d": "kernel_main",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "Systemd es el sistema de inicio y gestión de servicios estándar en la mayoría de distros actuales; antes se usaba SysV init."
    },
    {
        "text": "¿Qué diferencia hay entre un Hard Link y un Symbolic Link en Linux?",
        "option_a": "No hay diferencia real.",
        "option_b": "El Hard Link apunta al mismo Inodo; el Symlink apunta a la ruta del archivo.",
        "option_c": "El Symlink no puede apuntar a directorios.",
        "option_d": "El Hard Link solo funciona en sistemas Windows.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "Borrar el original rompe un Symlink, pero el Hard Link sigue manteniendo los datos accesibles mientras quede un enlace."
    },
    {
        "text": "¿Qué función cumple el protocolo LDAP?",
        "option_a": "Transferencia de archivos a alta velocidad.",
        "option_b": "Acceso y mantenimiento de servicios de información de directorio distribuido sobre IP.",
        "option_c": "Enrutamiento dinámico de paquetes.",
        "option_d": "Gestión remota de escritorio mediante consola.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "LDAP es el protocolo que usa Active Directory y otros servicios para realizar consultas y autenticación."
    },
    {
        "text": "¿Qué es un Hipervisor de Tipo 1 (Bare Metal)?",
        "option_a": "Un software que instalas sobre Windows para crear máquinas virtuales (como VirtualBox).",
        "option_b": "Un sistema que corre directamente sobre el hardware físico para gestionar máquinas virtuales.",
        "option_c": "Un tipo de procesador diseñado para servidores.",
        "option_d": "Un simulador de hardware antiguo.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "Ejemplos de Tipo 1 son VMware ESXi, Proxmox (KVM) o Microsoft Hyper-V; son más eficientes que los de Tipo 2."
    }
]

# [Más preguntas omitidas por brevedad, siguiendo el patrón de 50 totales]
MORE_QUESTIONS = [
    # --- KERNEL ARCHITECTURES ---
    {"text": "¿Qué es un núcleo Monolítico?", "option_a": "Un núcleo que solo tiene una función", "option_b": "Arquitectura donde todos los servicios (gestión de memoria, drivers, FS) corren en el mismo espacio que el kernel", "option_c": "Un núcleo que no necesita drivers", "option_d": "Un tipo de procesador", "correct_answer": "b", "difficulty": "hard", "explanation": "Linux es un ejemplo clásico de núcleo monolítico, aunque use módulos cargables."},
    {"text": "¿Cuál es la principal ventaja de un Microkernel?", "option_a": "Es mucho más rápido siempre", "option_b": "Mayor estabilidad y seguridad, ya que un fallo en un driver no tumba todo el sistema", "option_c": "Ocupa más espacio en disco", "option_d": "No necesita RAM", "correct_answer": "b", "difficulty": "hard", "explanation": "Solo las funciones mínimas corren en modo kernel; el resto son procesos de usuario."},
    {"text": "¿Qué sistema operativo usa un núcleo Híbrido?", "option_a": "MS-DOS", "option_b": "Windows 10/11 (NT Kernel)", "option_c": "Linux puro", "option_d": "CP/M", "correct_answer": "b", "difficulty": "medium", "explanation": "Combina aspectos de monolítico por rendimiento y microkernel por estructura."},

    # --- BOOT PROCESS ---
    {"text": "¿Qué significa POST (Power-On Self-Test)?", "option_a": "Publicar algo en internet", "option_b": "Secuencia inicial de comprobación del hardware al encender el equipo", "option_c": "Un tipo de puerto de red", "option_d": "Reiniciar el PC", "correct_answer": "b", "difficulty": "easy", "explanation": "La BIOS chequea la CPU, RAM y otros componentes antes de cargar el SO."},
    {"text": "¿Qué es la BIOS (Basic Input/Output System)?", "option_a": "Un programa de Windows", "option_b": "Firmware grabado en la placa base que inicia y prueba el hardware durante el arranque", "option_c": "Un tipo de memoria RAM", "option_d": "Un virus", "correct_answer": "b", "difficulty": "easy", "explanation": "Es el software de más bajo nivel que gestiona el hardware inicial."},
    {"text": "¿Cuál es el sucesor moderno de la BIOS?", "option_a": "UEFI (Unified Extensible Firmware Interface)", "option_b": "MBR", "option_c": "SATA", "option_d": "Kernel 2.0", "correct_answer": "a", "difficulty": "medium", "explanation": "UEFI permite arranques más rápidos, discos de más de 2TB y mayor seguridad (Secure Boot)."},
    {"text": "¿Qué es el MBR (Master Boot Record)?", "option_a": "Un disco duro", "option_b": "Primer sector de un dispositivo de almacenamiento que contiene la tabla de particiones y el código de arranque", "option_c": "Un tipo de memoria", "option_d": "Un manual de usuario", "correct_answer": "b", "difficulty": "medium", "explanation": "Estándar antiguo limitado a 4 particiones primarias y 2TB."},
    {"text": "¿Cuál es la principal ventaja de GPT (GUID Partition Table) frente a MBR?", "option_a": "Es más antiguo", "option_b": "Soporte para discos de más de 2TB y un número casi ilimitado de particiones", "option_c": "Solo funciona en Mac", "option_d": "No necesita formateo", "correct_answer": "b", "difficulty": "medium", "explanation": "Es el estándar que acompaña a UEFI y ofrece mayor redundancia de datos."},
    {"text": "¿Qué es un 'Bootloader' (Gestor de arranque)?", "option_a": "Un cable de red", "option_b": "Programa que carga el núcleo del sistema operativo en la memoria RAM", "option_c": "Un puerto de la CPU", "option_d": "Un antivirus", "correct_answer": "b", "difficulty": "medium", "explanation": "Ejemplos: GRUB para Linux, Bootmgr para Windows."},

    # --- PROCESS VS THREAD ---
    {"text": "¿Qué es un Proceso?", "option_a": "Un hilo de ejecución", "option_b": "Un programa en ejecución que tiene su propio espacio de memoria aislado", "option_c": "Un archivo de texto", "option_d": "Una orden del usuario", "correct_answer": "b", "difficulty": "medium", "explanation": "Cada proceso está protegido de los demás por el sistema operativo."},
    {"text": "¿Qué es un Hilo (Thread)?", "option_a": "Un proceso pesado", "option_b": "La unidad básica de ejecución dentro de un proceso; comparten la misma memoria", "option_c": "Un tipo de cable", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "Varios hilos de un proceso pueden trabajar juntos compartiendo datos fácilmente."},
    {"text": "¿Cuál es la principal ventaja de usar hilos en lugar de procesos?", "option_a": "Son más seguros", "option_b": "Menor consumo de recursos y comunicación más rápida entre ellos", "option_c": "No pueden fallar", "option_d": "Son más grandes", "correct_answer": "b", "difficulty": "hard", "explanation": "Crear un hilo es más 'ligero' para la CPU que crear un proceso entero."},
    {"text": "¿Qué es un 'Context Switch' (Cambio de contexto)?", "option_a": "Cambiar de idioma", "option_b": "Proceso por el cual el SO guarda el estado de un proceso para ejecutar otro y luego retomarlo", "option_c": "Un error de RAM", "option_d": "Apagar la pantalla", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite la multitarea, aunque consume un pequeño tiempo de CPU."},

    # --- OS TYPES & PARADIGMS ---
    {"text": "¿Qué es un Sistema Operativo de Tiempo Real (RTOS)?", "option_a": "Un SO que siempre dice la hora", "option_b": "SO diseñado para responder a eventos dentro de un tiempo estrictamente definido y predecible", "option_c": "Windows 11", "option_d": "Un SO para videojuegos", "correct_answer": "b", "difficulty": "hard", "explanation": "Usado en robótica, medicina y sistemas de control industrial."},
    {"text": "¿Qué significa que un SO sea 'Multitarea Apropiativa' (Preemptive)?", "option_a": "Que el usuario elige qué hacer", "option_b": "El SO puede interrumpir un proceso en ejecución para dar paso a otro con mayor prioridad", "option_c": "Que solo corre un programa", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "hard", "explanation": "Evita que un programa 'colgado' bloquee todo el ordenador."},

    # --- SHELL & STANDARD STREAMS ---
    {"text": "¿Qué es el 'Standard Input' (stdin) en la terminal?", "option_a": "La pantalla", "option_b": "Flujo de entrada de datos, normalmente el teclado (descriptor 0)", "option_c": "La impresora", "option_d": "Un disco duro", "correct_answer": "b", "difficulty": "medium", "explanation": "Representa de dónde lee el programa sus datos."},
    {"text": "¿Qué es el 'Standard Output' (stdout)?", "option_a": "El ratón", "option_b": "Flujo de salida de datos donde el programa escribe su información normal (descriptor 1)", "option_c": "Un error de red", "option_d": "La memoria RAM", "correct_answer": "b", "difficulty": "medium", "explanation": "Normalmente se muestra en la pantalla de la terminal."},
    {"text": "¿Qué descriptor de archivo corresponde al 'Standard Error' (stderr)?", "option_a": "0", "option_b": "1", "option_c": "2", "option_d": "3", "correct_answer": "c", "difficulty": "hard", "explanation": "Se usa para separar los mensajes de error de los datos normales."},
    {"text": "¿Qué símbolo se usa en Linux para redirigir la salida a un archivo (sobrescribiendo)?", "option_a": "|", "option_b": ">", "option_c": ">>", "option_d": "<", "correct_answer": "b", "difficulty": "easy", "explanation": "Ejemplo: ls > lista.txt crea el archivo con el contenido."},
    {"text": "¿Qué hace el símbolo '>>' en una redirección de terminal?", "option_a": "Borra el archivo", "option_b": "Añade la salida al final del archivo existente (append)", "option_c": "Crea una carpeta", "option_d": "Nada", "correct_answer": "b", "difficulty": "medium", "explanation": "Muy útil para guardar logs sin perder lo anterior."},
    {"text": "¿Qué es un 'Pipe' (|) en la shell?", "option_a": "Un tipo de archivo", "option_b": "Técnica que envía la salida de un comando como entrada al siguiente", "option_c": "Un error de disco", "option_d": "Un cable físico", "correct_answer": "b", "difficulty": "medium", "explanation": "Permite encadenar programas simples para realizar tareas complejas (ej: ls | grep txt)."},

    # --- SYSTEM CALLS & PRIVILEGES ---
    {"text": "¿Qué es una 'System Call' (Llamada al Sistema)?", "option_a": "Llamar por teléfono al soporte", "option_b": "Mecanismo por el cual un programa de usuario solicita un servicio al núcleo (ej: abrir un archivo)", "option_c": "Un mensaje de error", "option_d": "Un tipo de virus", "correct_answer": "b", "difficulty": "hard", "explanation": "Es el puente entre el User Mode y el Kernel Mode."},
    {"text": "¿Qué es el 'User Mode' (Modo Usuario)?", "option_a": "Cuando no hay contraseñas", "option_b": "Modo de ejecución restringido donde corren las aplicaciones para proteger el núcleo", "option_c": "Un modo de bajo consumo", "option_d": "Un tipo de usuario", "correct_answer": "b", "difficulty": "medium", "explanation": "Si una app falla en modo usuario, no debería afectar a la estabilidad total del sistema."},
    {"text": "¿Qué es el 'Kernel Mode' (Modo Núcleo/Privilegiado)?", "option_a": "Un modo para jugar", "option_b": "Modo con acceso total al hardware y memoria; solo el SO debería correr aquí", "option_c": "Un error de arranque", "option_d": "Un tipo de procesador", "correct_answer": "b", "difficulty": "medium", "explanation": "Cualquier fallo en este modo suele provocar un BSOD (pantallazo azul) o Kernel Panic."},

    # --- PROCESS SCHEDULING ---
    {"text": "¿Qué es un algoritmo de Planificación (Scheduling)?", "option_a": "Dibujar el SO", "option_b": "Lógica que decide qué proceso usará la CPU en cada momento", "option_c": "Un calendario", "option_d": "Una marca de RAM", "correct_answer": "b", "difficulty": "medium", "explanation": "Busca maximizar el uso de la CPU y la rapidez de respuesta."},
    {"text": "¿Cómo funciona el algoritmo First-Come, First-Served (FCFS)?", "option_a": "El más rápido va primero", "option_b": "Los procesos se atienden en el orden estricto de llegada", "option_c": "Es aleatorio", "option_d": "Se eligen por sorteo", "correct_answer": "b", "difficulty": "medium", "explanation": "Es el más sencillo pero puede provocar esperas largas si llega un proceso muy pesado primero."},
    {"text": "¿Qué es el 'Round Robin' en planificación?", "option_a": "Un pájaro redondo", "option_b": "Cada proceso tiene un tiempo fijo (quantum) y si no termina, vuelve a la cola", "option_c": "Ejecutar todo a la vez", "option_d": "Un tipo de memoria", "correct_answer": "b", "difficulty": "medium", "explanation": "Es el algoritmo estándar para sistemas de tiempo compartido (interactivos)."},
    {"text": "¿Qué es la 'Prioridad' en planificación de procesos?", "option_a": "Ir más rápido", "option_b": "Valor asignado a un proceso que indica su importancia; los de mayor valor se ejecutan antes", "option_c": "El nombre del usuario", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "easy", "explanation": "Permite que tareas críticas (como el audio) no se corten por tareas de fondo (como un backup)."},

    # --- DEADLOCKS (BLOQUEOS MUTUOS) ---
    {"text": "¿Qué es un Interbloqueo o 'Deadlock'?", "option_a": "Un error de red", "option_b": "Situación donde dos o más procesos están esperando por recursos que tiene el otro, bloqueándose todos", "option_c": "Apagar el PC a la fuerza", "option_d": "Un virus de disco", "correct_answer": "b", "difficulty": "hard", "explanation": "Es como un cruce de coches donde nadie puede avanzar porque todos tapan al resto."},
    {"text": "¿Para qué sirve el algoritmo del Banquero?", "option_a": "Para contar dinero", "option_b": "Para evitar deadlocks gestionando la asignación de recursos de forma segura", "option_c": "Para hackear bancos", "option_d": "Un tipo de base de datos", "correct_answer": "b", "difficulty": "hard", "explanation": "Solo asigna recursos si el sistema seguirá en un 'estado seguro' después de la asignación."},

    # --- MEMORY BASICS ---
    {"text": "¿Qué es una dirección IP estática?", "option_a": "Una que no se mueve", "option_b": "Dirección IP configurada manualmente que no cambia con el tiempo", "option_c": "La IP de google", "option_d": "Un error de red", "correct_answer": "b", "difficulty": "easy", "explanation": "Usada normalmente en servidores e impresoras."},
    {"text": "¿Qué es el 'Swapping'?", "option_a": "Cambiar de monitor", "option_b": "Mover procesos enteros de la RAM al disco para liberar espacio", "option_c": "Un tipo de virus", "option_d": "Reiniciar la red", "correct_answer": "b", "difficulty": "medium", "explanation": "Es necesario cuando la RAM física está totalmente llena."},
    {"text": "¿Qué es la fragmentación de memoria externa?", "option_a": "Que la RAM se rompe", "option_b": "Cuando hay huecos libres pequeños entre procesos que no pueden ser usados por un proceso nuevo grande", "option_c": "Un error de disco", "option_d": "Un tipo de partición", "correct_answer": "b", "difficulty": "hard", "explanation": "Se soluciona con la compactación o mediante técnicas de paginación."},

    # --- FILE SYSTEMS ADVANCED ---
    {"text": "¿Qué es el 'Journaling' en un sistema de archivos?", "option_a": "Escribir un diario", "option_b": "Registro de cambios pendientes que permite recuperar la integridad del disco tras un apagón", "option_c": "Un virus de archivos", "option_d": "Un tipo de compresión", "correct_answer": "b", "difficulty": "hard", "explanation": "Sistemas como NTFS, ext3/ext4 o APFS usan journaling para evitar pérdidas de datos."},
    {"text": "¿Cuál es la función del comando 'fsck' en Linux?", "option_a": "Formatear el disco", "option_b": "Chequear y reparar errores de consistencia en el sistema de archivos", "option_c": "Comprobar la red", "option_d": "Apagar el disco", "correct_answer": "b", "difficulty": "medium", "explanation": "File System Check; se suele ejecutar automáticamente tras un reinicio inesperado."},
    {"text": "¿Qué es el formato FAT32?", "option_a": "Un formato para gente gorda", "option_b": "Sistema de archivos antiguo pero muy compatible, limitado a archivos de máximo 4GB", "option_c": "El más moderno de Apple", "option_d": "Un error de Linux", "correct_answer": "b", "difficulty": "easy", "explanation": "Muy usado en pendrives y tarjetas SD por su compatibilidad universal."},

    # --- WINDOWS ADMINISTRATION ---
    {"text": "¿Qué es el Registro de Windows (Registry)?", "option_a": "Una lista de usuarios", "option_b": "Base de datos jerárquica que guarda la configuración del sistema, hardware y aplicaciones", "option_c": "Un manual de ayuda", "option_d": "Un tipo de archivo de texto", "correct_answer": "b", "difficulty": "medium", "explanation": "Se edita con 'regedit'; tocarlo sin saber puede dañar el sistema permanentemente."},
    {"text": "¿Qué es un 'Servicio' en Windows?", "option_a": "La atención al cliente", "option_b": "Programa que corre en segundo plano sin interfaz de usuario (equivale al 'demonio' en Linux)", "option_c": "Un tipo de red", "option_d": "Un juego", "correct_answer": "b", "difficulty": "easy", "explanation": "Se encargan de tareas automáticas como actualizaciones, red o base de datos."},
    {"text": "¿Para qué sirve el Visor de Eventos (Event Viewer)?", "option_a": "Para ver pelis", "option_b": "Para consultar los logs de errores, advertencias e información del sistema y aplicaciones", "option_c": "Para programar tareas", "option_d": "Un antivirus", "correct_answer": "b", "difficulty": "easy", "explanation": "Es la herramienta principal para diagnosticar por qué un PC falla o se reinicia."},

    # --- LINUX SHELL COMMANDS ---
    {"text": "¿Qué hace el comando 'cat'?", "option_a": "Dibuja un gato", "option_b": "Muestra el contenido de un archivo de texto en la terminal", "option_c": "Borra un archivo", "option_d": "Crea una carpeta", "correct_answer": "b", "difficulty": "easy", "explanation": "Su nombre viene de 'concatenate'."},
    {"text": "¿Para qué sirve el comando 'grep'?", "option_a": "Para ver la red", "option_b": "Para buscar texto específico dentro de archivos o salidas de comandos", "option_c": "Para arreglar discos", "option_d": "Para comprimir archivos", "correct_answer": "b", "difficulty": "medium", "explanation": "Es una de las herramientas más potentes de la terminal Linux."},
    {"text": "¿Qué comando Linux se usa para saber cuánto espacio libre queda en el disco?", "option_a": "du", "option_b": "df", "option_c": "free", "option_d": "top", "correct_answer": "b", "difficulty": "medium", "explanation": "df (disk free) muestra el espacio por particiones en formato humano con -h."},
    {"text": "¿Qué hace el comando 'top' en la terminal?", "option_a": "Ir a la parte superior", "option_b": "Muestra en tiempo real los procesos que más CPU y RAM consumen", "option_c": "Instala programas", "option_d": "Borra la pantalla", "correct_answer": "b", "difficulty": "easy", "explanation": "Es el 'Administrador de Tareas' de la consola."},
    {"text": "¿Cómo se crea una carpeta nueva en Linux?", "option_a": "mkdir <nombre>", "option_b": "md <nombre>", "option_c": "create dir <nombre>", "option_d": "new folder <nombre>", "correct_answer": "a", "difficulty": "easy", "explanation": "Makedir crea el directorio en la ruta actual."},

    # --- SIGNALS & TERMINATION ---
    {"text": "¿Qué comando se usa para enviar una señal a un proceso (normalmente para cerrarlo)?", "option_a": "stop", "option_b": "kill", "option_c": "end", "option_d": "exit", "correct_answer": "b", "difficulty": "medium", "explanation": "Por defecto envía la señal SIGTERM (cierre amable)."},
    {"text": "¿Qué señal de Linux obliga a un proceso a cerrarse inmediatamente sin posibilidad de guardado?", "option_a": "SIGTERM (15)", "option_b": "SIGKILL (9)", "option_c": "SIGINT (2)", "option_d": "SIGHUP (1)", "correct_answer": "b", "difficulty": "hard", "explanation": "El famoso 'kill -9' es el último recurso para procesos bloqueados."},

    # --- ADVANCED MEMORY MANAGEMENT ---
    {"text": "¿Qué es la Paginación en memoria?", "option_a": "Leer un libro", "option_b": "Dividir la memoria física en trozos fijos (marcos) y la lógica en páginas del mismo tamaño", "option_c": "Un error de RAM", "option_d": "Guardar archivos en el disco", "correct_answer": "b", "difficulty": "hard", "explanation": "Elimina la fragmentación externa y permite que el espacio lógico no sea contiguo."},
    {"text": "¿Qué es la Segmentación de memoria?", "option_a": "Cortar la RAM con un cuchillo", "option_b": "Dividir la memoria en secciones de tamaño variable basadas en la lógica del programa (código, datos, pila)", "option_c": "Un tipo de virus", "option_d": "Apagar el PC", "correct_answer": "b", "difficulty": "hard", "explanation": "Es más cercana a la visión que tiene el programador de su programa."},
    {"text": "¿Qué es un 'Page Fault' (Fallo de página)?", "option_a": "Que internet no carga", "option_b": "Ocurre cuando un programa intenta acceder a una página que no está cargada en la RAM física", "option_c": "Un error del monitor", "option_d": "Borrar un archivo", "correct_answer": "b", "difficulty": "medium", "explanation": "El SO debe entonces buscar la página en el disco (swap) y traerla a la RAM."},
    {"text": "¿Qué es el 'TLB' (Translation Lookaside Buffer)?", "option_a": "Un cable de red", "option_b": "Caché especial en la CPU que acelera la traducción de direcciones virtuales a físicas", "option_c": "Un tipo de disco duro", "option_d": "Un manual de usuario", "correct_answer": "b", "difficulty": "hard", "explanation": "Sin la TLB, acceder a la memoria sería mucho más lento debido a las tablas de páginas."},
    {"text": "¿Cómo funciona el algoritmo de reemplazo de páginas LRU?", "option_a": "Saca la página más grande", "option_b": "Sustituye la página que no se ha usado por más tiempo (Least Recently Used)", "option_c": "Es aleatorio", "option_d": "Saca la página que entró primero", "correct_answer": "b", "difficulty": "hard", "explanation": "Se basa en el principio de cercanía temporal: lo usado hace poco se volverá a usar pronto."},

    # --- DISK SCHEDULING (PLANIFICACIÓN DE DISCO) ---
    {"text": "¿Qué es el algoritmo SCAN (Elevador) en discos duros?", "option_a": "Escanear virus", "option_b": "El cabezal se mueve de un extremo al otro del disco atendiendo peticiones, como un ascensor", "option_c": "Leer todo al azar", "option_d": "Un error de lectura", "correct_answer": "b", "difficulty": "hard", "explanation": "Evita saltos bruscos del cabezal, mejorando la eficiencia en discos mecánicos (HDD)."},
    {"text": "¿En qué se diferencia C-SCAN de SCAN?", "option_a": "Es más lento", "option_b": "Al llegar al final, el cabezal vuelve al principio sin atender peticiones, solo en un sentido", "option_c": "Es para discos SSD", "option_d": "No hay diferencia", "correct_answer": "b", "difficulty": "hard", "explanation": "Ofrece un tiempo de espera más uniforme para todas las zonas del disco."},
    {"text": "¿Qué es un SSD?", "option_a": "Super Sistema Digital", "option_b": "Unidad de estado sólido que usa memoria flash en lugar de platos giratorios", "option_c": "Un disco muy grande", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "easy", "explanation": "Son muchísimo más rápidos y resistentes que los HDD tradicionales."},

    # --- RAID LEVELS ---
    {"text": "¿Qué es RAID 0 (Stripping)?", "option_a": "Copia de seguridad total", "option_b": "Divide los datos entre dos o más discos para ganar velocidad, pero sin redundancia", "option_c": "Un virus de disco", "option_d": "Formateo rápido", "correct_answer": "b", "difficulty": "medium", "explanation": "Si un disco falla, se pierden todos los datos. Rapidez total, seguridad cero."},
    {"text": "¿Qué es RAID 1 (Mirroring)?", "option_a": "Dividir datos", "option_b": "Duplica los datos en dos discos iguales; si uno falla, el otro tiene la copia idéntica", "option_c": "Un disco invisible", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "medium", "explanation": "Seguridad total, pero solo aprovechas la capacidad de uno de los discos."},
    {"text": "¿Qué es RAID 5?", "option_a": "Usar 5 discos", "option_b": "Distribuye datos y paridad por 3 o más discos; soporta el fallo de un disco sin pérdida", "option_c": "Un backup en la nube", "option_d": "Un antivirus", "correct_answer": "b", "difficulty": "hard", "explanation": "Es el equilibrio más común entre velocidad, capacidad y seguridad."},
    {"text": "¿Qué es un RAID 10 (o 1+0)?", "option_a": "Un RAID con 10 discos", "option_b": "Combinación de Mirroring (RAID 1) y Stripping (RAID 0)", "option_c": "Un error de configuración", "option_d": "Un manual de red", "correct_answer": "b", "difficulty": "hard", "explanation": "Ofrece alta velocidad y alta redundancia, pero requiere al menos 4 discos."},

    # --- I/O MANAGEMENT ---
    {"text": "¿Qué es el 'Spooling'?", "option_a": "Un virus de red", "option_b": "Técnica que usa un búfer intermedio para enviar datos a un periférico lento (ej: impresora)", "option_c": "Limpiar el PC", "option_d": "Reiniciar el SO", "correct_answer": "b", "difficulty": "medium", "explanation": "Evita que un programa se quede esperando a que la impresora termine antes de seguir."},
    {"text": "¿Qué es una Interrupción (Interrupt)?", "option_a": "Que se corta la luz", "option_b": "Señal enviada por el hardware a la CPU para avisar de que necesita atención inmediata", "option_c": "Un error de software", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "medium", "explanation": "Permite que la CPU no esté perdiendo el tiempo preguntando a cada rato (polling)."},
    {"text": "¿Qué es el DMA (Direct Memory Access)?", "option_a": "Acceso directo a mi alma", "option_b": "Permite que periféricos muevan datos a la RAM sin pasar por la CPU, ahorrando processador", "option_c": "Un tipo de memoria", "option_d": "Un virus", "correct_answer": "b", "difficulty": "hard", "explanation": "Esencial para transferir grandes cantidades de datos (disco, red) eficientemente."},

    # --- LINUX ADVANCED PERMISSIONS ---
    {"text": "¿Qué hace el permiso SUID (Set User ID) en un ejecutable?", "option_a": "Cambiar el nombre del usuario", "option_b": "Hace que el programa se ejecute con los permisos del dueño del archivo, no del que lo lanza", "option_c": "Borra el archivo", "option_d": "Cifra el archivo", "correct_answer": "b", "difficulty": "hard", "explanation": "Ejemplo: 'passwd' necesita SUID para que un usuario normal pueda editar el archivo /etc/shadow."},
    {"text": "¿Para qué sirve el 'Sticky Bit' en una carpeta como /tmp?", "option_a": "Para que los archivos se peguen", "option_b": "Evita que un usuario borre o renombre archivos de otros usuarios dentro de esa carpeta", "option_c": "Para ir más rápido", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "hard", "explanation": "Útil en carpetas compartidas donde todos pueden escribir pero nadie debe borrar lo ajeno."},
    {"text": "¿Qué comando Linux permite cambiar el dueño (propietario) de un archivo?", "option_a": "chmod", "option_b": "chown", "option_c": "chgrp", "option_d": "passwd", "correct_answer": "b", "difficulty": "medium", "explanation": "chown (change owner) puede cambiar usuario y grupo simultáneamente."},

    # --- SHELL SCRIPTING BASICS ---
    {"text": "¿Cuál es la primera línea típica de un script de Bash?", "option_a": "# START", "option_b": "#!/bin/bash (shebang)", "option_c": "// script bas", "option_d": "main() {", "correct_answer": "b", "difficulty": "easy", "explanation": "Indica al sistema operativo qué intérprete debe usar para ejecutar el archivo."},
    {"text": "¿Cómo se define una variable en Bash?", "option_a": "var x = 10", "option_b": "NOMBRE=Valor (sin espacios)", "option_c": "$NOMBRE=Valor", "option_d": "set NOMBRE 10", "correct_answer": "b", "difficulty": "medium", "explanation": "En Bash, poner espacios alrededor del '=' es un error común."},
    {"text": "¿Para qué sirve el comando 'echo'?", "option_a": "Para escuchar música", "option_b": "Para mostrar texto o el valor de variables por pantalla", "option_c": "Para borrar archivos", "option_d": "Para reiniciar la red", "correct_answer": "b", "difficulty": "easy", "explanation": "Es el 'print' de la shell."},
    {"text": "¿Qué hace el comando 'head -n 5 archivo.txt'?", "option_a": "Borra las 5 primeras líneas", "option_b": "Muestra las 5 primeras líneas del archivo", "option_c": "Cuenta las palabras", "option_d": "Pone el archivo arriba", "correct_answer": "b", "difficulty": "easy", "explanation": "Útil para ojear archivos muy grandes sin abrirlos enteros."},

    # --- VIRTUALIZATION & CONTAINERS ---
    {"text": "¿Qué es Docker?", "option_a": "Un sistema operativo", "option_b": "Plataforma de contenedores que empaqueta una aplicación y sus dependencias de forma aislada", "option_c": "Una máquina virtual pesada", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "medium", "explanation": "A diferencia de las VMs, los contenedores comparten el núcleo del SO anfitrión."},
    {"text": "¿Para qué sirve una 'Imagen' de Docker?", "option_a": "Para ponerle foto al perfil", "option_b": "Es una plantilla de solo lectura que contiene el código y librerías para crear el contenedor", "option_c": "Un error de disco", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Es como el 'CD de instalación' de tu aplicación."},
    {"text": "¿Qué es la 'Virtualización por Software' (Tipo 2)?", "option_a": "Un hipervisor que corre sobre otro SO (ej: VirtualBox sobre Windows)", "option_b": "Un procesador de software", "option_c": "Cifrar el disco", "option_d": "Un tipo de red", "correct_answer": "a", "difficulty": "medium", "explanation": "Es más fácil de usar pero menos eficiente que el Tipo 1 (Bare Metal)."},

    # --- WINDOWS SYSTEM ---
    {"text": "¿Qué es el 'Safe Mode' (Modo Seguro) en Windows?", "option_a": "Modo para niños", "option_b": "Estado en el que Windows se inicia con el mínimo de drivers y servicios para diagnosticar fallos", "option_c": "Un modo para jugar", "option_d": "Un antivirus", "correct_answer": "b", "difficulty": "easy", "explanation": "Permite entrar en el sistema cuando un driver o programa impide el arranque normal."},
    {"text": "¿Qué extensión suelen tener los archivos de instalador directo en Windows?", "option_a": ".sh", "option_b": ".exe o .msi", "option_c": ".deb", "option_d": ".dmg", "correct_answer": "b", "difficulty": "easy", "explanation": ".exe es ejecutable directo y .msi es Microsoft Installer."},
    {"text": "¿Qué herramienta permite programar tareas automáticas en Windows?", "option_a": "Cron", "option_b": "Task Scheduler (Programador de Tareas)", "option_c": "Event Viewer", "option_d": "Notepad", "correct_answer": "b", "difficulty": "easy", "explanation": "Permite lanzar scripts o programas a horas específicas o tras eventos."},

    # --- FINAL MIXED ---
    {"text": "¿Qué es un 'Daemon' (Demonio)?", "option_a": "Un virus malvado", "option_b": "Proceso que corre en segundo plano de forma continua en sistemas Unix/Linux", "option_c": "Un usuario root", "option_d": "Un tipo de partición", "correct_answer": "b", "difficulty": "medium", "explanation": "Suelen terminar en 'd' (ej: sshd, httpd, systemd)."},
    {"text": "¿Qué función cumple el archivo /etc/passwd en Linux?", "option_a": "Guardar las contraseñas", "option_b": "Almacenar información básica de usuarios (nombre, ID, home, shell)", "option_c": "Un error de sistema", "option_d": "Manual de ayuda", "correct_answer": "b", "difficulty": "medium", "explanation": "Las contraseñas cifradas están realmente en /etc/shadow por seguridad."},

    # --- ADVANCED CPU SCHEDULING ---
    {"text": "¿Qué es una Cola Multinivel (Multilevel Queue)?", "option_a": "Una cola muy larga", "option_b": "Planificador que divide los procesos en diferentes colas (ej: interactivos vs fondo) con reglas distintas", "option_c": "Un error de CPU", "option_d": "Un tipo de memoria", "correct_answer": "b", "difficulty": "hard", "explanation": "Cada cola puede tener su propio algoritmo de planificación (ej: RR para interactivos, FCFS para fondo)."},
    {"text": "¿Qué mejora aporta la Cola Multinivel con Retroalimentación (Feedback)?", "option_a": "Es más bonita", "option_b": "Permite que los procesos se muevan entre colas según su comportamiento (ej: si consumen mucha CPU bajan de prioridad)", "option_c": "No necesita CPU", "option_d": "Es automática", "correct_answer": "b", "difficulty": "hard", "explanation": "Es el sistema más justo y flexible usado en los SO modernos."},
    {"text": "¿Qué es el 'Inanición' (Starvation) en planificación?", "option_a": "Que el PC tiene hambre", "option_b": "Cuando un proceso de baja prioridad nunca llega a ejecutarse porque siempre hay procesos de alta prioridad", "option_c": "Un error de disco", "option_d": "Apagar el monitor", "correct_answer": "b", "difficulty": "medium", "explanation": "Se soluciona con el 'Envejecimiento' (Aging), subiendo la prioridad a los procesos que llevan mucho esperando."},

    # --- PROCESS SYNCHRONIZATION ---
    {"text": "¿Qué es una Sección Crítica?", "option_a": "Una parte del examen", "option_b": "Fragmento de código donde se accede a un recurso compartido y no debe ser ejecutado por dos procesos a la vez", "option_c": "Un error de kernel", "option_d": "El botón de apagado", "correct_answer": "b", "difficulty": "medium", "explanation": "La sincronización asegura que solo un proceso entre en su sección crítica en cada momento."},
    {"text": "¿Qué es un Semáforo en sistemas operativos?", "option_a": "Uno que regula el tráfico", "option_b": "Variable especial usada para controlar el acceso a recursos comunes mediante operaciones wait() y signal()", "option_c": "Un tipo de cable", "option_d": "Un virus", "correct_answer": "b", "difficulty": "hard", "explanation": "Inventado por Dijkstra, es la base de la sincronización de procesos."},
    {"text": "¿Qué es un 'Mutex'?", "option_a": "Un tipo de música", "option_b": "Semáforo binario (0 o 1) que garantiza la exclusión mutua para un único recurso", "option_c": "Un error de RAM", "option_d": "Un comando de Linux", "correct_answer": "b", "difficulty": "medium", "explanation": "Su nombre viene de 'MUTual EXclusion'."},
    {"text": "¿Qué es una 'Condición de Carrera' (Race Condition)?", "option_a": "Una carrera de coches", "option_b": "Situación donde el resultado final depende del orden relativo de ejecución de los procesos", "option_c": "Un virus rápido", "option_d": "Un error de red", "correct_answer": "b", "difficulty": "hard", "explanation": "Ocurre cuando no hay una sincronización adecuada en el acceso a datos compartidos."},

    # --- VIRTUAL MEMORY ADVANCED ---
    {"text": "¿Qué es el 'Thrashing' (Hiperactividad de paginación)?", "option_a": "Limpiar el disco", "option_b": "Estado donde el SO pasa más tiempo moviendo páginas entre disco y RAM que ejecutando procesos", "option_c": "Un virus de memoria", "option_d": "Que la RAM es muy rápida", "correct_answer": "b", "difficulty": "hard", "explanation": "Ocurre cuando la suma de los 'working sets' de los procesos supera la RAM física disponible."},
    {"text": "¿Qué significa CoW (Copy-on-Write)?", "option_a": "Vaca en el disco", "option_b": "Técnica donde los procesos comparten la misma página hasta que uno intenta escribir, momento en que se crea la copia", "option_c": "Escribir muy lento", "option_d": "Un error de kernel", "correct_answer": "b", "difficulty": "hard", "explanation": "Esencial para que el comando 'fork()' en Linux sea extremadamente rápido y eficiente."},
    {"text": "¿Qué es el 'Working Set' de un proceso?", "option_a": "Su ropa de trabajo", "option_b": "Conjunto de páginas que el proceso está usando activamente en un intervalo de tiempo", "option_c": "Un error de RAM", "option_d": "El nombre del programa", "correct_answer": "b", "difficulty": "hard", "explanation": "El SO intenta mantener el working set en la RAM para evitar fallos de página frecuentes."},

    # --- WINDOWS ARCHITECTURE ---
    {"text": "¿Qué es la HAL (Hardware Abstraction Layer) en Windows?", "option_a": "Un robot", "option_b": "Capa de software que oculta las diferencias de hardware a las capas superiores del SO", "option_c": "El menú de inicio", "option_d": "Un tipo de virus", "correct_answer": "b", "difficulty": "medium", "explanation": "Permite que el mismo núcleo de Windows funcione en diferentes placas base y CPUs."},
    {"text": "¿Qué es el 'GDI' (Graphics Device Interface) en Windows?", "option_a": "Un tipo de cable", "option_b": "Componente encargado de representar objetos gráficos y enviarlos a dispositivos como monitores e impresoras", "option_c": "Un virus de video", "option_d": "El fondo de pantalla", "correct_answer": "b", "difficulty": "hard", "explanation": "Es la base del dibujo de ventanas y textos en las versiones clásicas de Windows."},
    {"text": "¿Qué es un archivo .DLL?", "option_a": "Un documento de Word", "option_b": "Dynamic Link Library: librería que contiene código y datos que pueden ser usados por varios programas a la vez", "option_c": "Un virus", "option_d": "Un tipo de imagen", "correct_answer": "b", "difficulty": "easy", "explanation": "Ahorran espacio en disco y memoria al no repetir el código común en cada .exe."},

    # --- LINUX INTERNALS ---
    {"text": "¿Qué es un LKM (Loadable Kernel Module)?", "option_a": "Un virus de Linux", "option_b": "Código que puede añadirse o quitarse del kernel en tiempo de ejecución sin reiniciar el sistema", "option_c": "Un manual de usuario", "option_d": "Un tipo de partición", "correct_answer": "b", "difficulty": "hard", "explanation": "Se usan normalmente para drivers de dispositivos o sistemas de ficheros."},
    {"text": "¿Qué hace el comando 'lsmod'?", "option_a": "Lista los modelos de PC", "option_b": "Muestra los módulos del kernel que están cargados actualmente", "option_c": "Borra archivos", "option_d": "Instala Linux", "correct_answer": "b", "difficulty": "medium", "explanation": "Es la forma de ver qué drivers están activos en el sistema."},
    {"text": "¿Qué es el VFS (Virtual File System) en Linux?", "option_a": "Un disco duro virtual", "option_b": "Capa del kernel que permite que las aplicaciones accedan a diferentes sistemas de archivos de forma uniforme", "option_c": "Un virus", "option_d": "Un tipo de carpeta", "correct_answer": "b", "difficulty": "hard", "explanation": "Gracias al VFS, al programador le da igual si lee de un disco NTFS, ext4 o una memoria USB."},

    # --- SECURITY MODELS ---
    {"text": "¿Qué es una ACL (Access Control List) en un sistema de archivos?", "option_a": "Una lista de la compra", "option_b": "Lista detallada de permisos para usuarios específicos sobre un archivo, más allá del dueño/grupo estándar", "option_c": "Un tipo de cifrado", "option_d": "Un manual de red", "correct_answer": "b", "difficulty": "medium", "explanation": "Permite decir: 'Usuario A lee, Usuario B escribe, el resto nada' en un mismo archivo."},
    {"text": "¿Qué es el modelo de seguridad Bell-LaPadula?", "option_a": "Un tipo de firewall", "option_b": "Modelo de seguridad centrado en la confidencialidad (no leer hacia arriba, no escribir hacia abajo)", "option_c": "Un virus italiano", "option_d": "Un cifrado de disco", "correct_answer": "b", "difficulty": "hard", "explanation": "Muy usado en sistemas militares para evitar filtraciones de información clasificada."},
    {"text": "¿Qué significa 'Principio de Menor Privilegio'?", "option_a": "Que los jefes mandan menos", "option_b": "Dar a cada usuario o proceso solo los permisos mínimos necesarios para realizar su función", "option_c": "Borrar todas las cuentas", "option_d": "No usar contraseñas", "correct_answer": "b", "difficulty": "easy", "explanation": "Es la regla de oro de la seguridad informática para minimizar daños en caso de ataque."},

    # --- ADVANCED SHELL TOOLS ---
    {"text": "¿Qué hace el comando 'find / -name *.txt'?", "option_a": "Borra todos los .txt", "option_b": "Busca desde la raíz (/) todos los archivos que terminen en .txt", "option_c": "Crea archivos de texto", "option_d": "Pone nombre a los archivos", "correct_answer": "b", "difficulty": "medium", "explanation": "Es la herramienta estándar para localizar archivos por nombre, tamaño, fecha, etc."},
    {"text": "¿Para qué sirve el comando 'sed'?", "option_a": "Para beber agua", "option_b": "Editor de flujo que permite transformar o filtrar texto de forma automática (ej: buscar y reemplazar)", "option_c": "Para comprimir videos", "option_d": "Para ver la red", "correct_answer": "b", "difficulty": "hard", "explanation": "Stream Editor; extremadamente potente para scripts de automatización."},
    {"text": "¿Qué es 'awk' en Linux?", "option_a": "El sonido de un pájaro", "option_b": "Lenguaje de procesamiento de texto diseñado para manipular datos basados en columnas o campos", "option_c": "Un virus de terminal", "option_d": "Un comando de ayuda", "correct_answer": "b", "difficulty": "hard", "explanation": "Ideal para extraer información de logs o tablas de texto."},
    {"text": "¿Qué hace el comando 'xargs'?", "option_a": "Da argumentos falsos", "option_b": "Construye y ejecuta comandos usando la salida de otro comando como argumentos", "option_c": "Borra la terminal", "option_d": "Un tipo de red", "correct_answer": "b", "difficulty": "hard", "explanation": "Ejemplo: find . -name *.log | xargs rm (busca logs y los borra todos)."},

    # --- MISCELLANEOUS ---
    {"text": "¿Qué es un 'Zombie Process'?", "option_a": "Un proceso que come cerebros", "option_b": "Proceso que ha terminado su ejecución pero sigue en la tabla de procesos esperando a que el padre lea su estado", "option_c": "Un virus de Windows", "option_d": "Un error de disco", "correct_answer": "b", "difficulty": "medium", "explanation": "No consume CPU ni RAM, pero ocupa un hueco en la lista finita de PIDs."},
    {"text": "¿Qué es un 'Orphan Process' (Proceso Huérfano)?", "option_a": "Un proceso sin casa", "option_b": "Proceso cuyo padre ha terminado o muerto, siendo adoptado normalmente por el proceso init (PID 1)", "option_c": "Un error de sistema", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "El sistema se asegura de que ningún proceso se quede sin padre para poder ser gestionado."},
    {"text": "¿Qué es el 'Entropy' (Entropía) en un SO?", "option_a": "Que el PC se calienta", "option_b": "Recolección de ruido aleatorio del hardware para generar números aleatorios seguros (ej: para cifrado)", "option_c": "Un error de kernel", "option_d": "Un tipo de partición", "correct_answer": "b", "difficulty": "hard", "explanation": "En Linux se accede mediante /dev/random."},

    # --- DEVICE DRIVERS (CONTROLADORES) ---
    {"text": "¿Qué es un 'Block Device' (Dispositivo de bloques)?", "option_a": "Un dispositivo que está bloqueado", "option_b": "Dispositivo que transfiere datos en bloques de tamaño fijo y permite acceso aleatorio (ej: disco duro)", "option_c": "Un tipo de ratón", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "medium", "explanation": "Se accede a ellos mediante el sistema de archivos."},
    {"text": "¿Qué es un 'Character Device' (Dispositivo de caracteres)?", "option_a": "Un dispositivo con personalidad", "option_b": "Dispositivo que transfiere datos como un flujo continuo de bytes sin búfer ni acceso aleatorio (ej: teclado, puerto serie)", "option_c": "Un tipo de monitor", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "Se leen y escriben secuencialmente."},
    {"text": "¿Qué es el 'Major Number' en un archivo de dispositivo en Linux?", "option_a": "El número de la suerte", "option_b": "Número que identifica al controlador (driver) asociado al dispositivo", "option_c": "La velocidad del dispositivo", "option_d": "Un error de kernel", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite al kernel saber qué código debe manejar las peticiones a ese archivo."},

    # --- KERNEL SYNCHRONIZATION ---
    {"text": "¿Qué es un 'Spinlock'?", "option_a": "Un bloqueo que da vueltas", "option_b": "Mecanismo de bloqueo donde el proceso espera en un bucle activo hasta que el recurso queda libre", "option_c": "Un error de RAM", "option_d": "Un tipo de ventilador", "correct_answer": "b", "difficulty": "hard", "explanation": "Muy eficiente para bloqueos muy cortos, pero consume mucha CPU si la espera es larga."},
    {"text": "¿Qué es el RCU (Read-Copy-Update) en el kernel de Linux?", "option_a": "Un comando de red", "option_b": "Mecanismo de sincronización que permite múltiples lectores simultáneos sin bloqueos, ideal para datos que cambian poco", "option_c": "Un virus de disco", "option_d": "Un tipo de memoria", "correct_answer": "b", "difficulty": "hard", "explanation": "Es una de las claves del alto rendimiento de Linux en servidores multiprocesador."},
    {"text": "¿Qué es el 'Priority Inversion'?", "option_a": "Cambiar el orden de los cables", "option_b": "Problema donde un proceso de alta prioridad espera por un recurso que tiene uno de baja prioridad", "option_c": "Un error de arranque", "option_d": "Un virus", "correct_answer": "b", "difficulty": "hard", "explanation": "Famoso fallo que afectó a la misión Mars Pathfinder en Marte."},

    # --- MEMORY ALLOCATION (ASIGNACIÓN) ---
    {"text": "¿Qué es el sistema 'Buddy' de asignación de memoria?", "option_a": "Un sistema de amigos", "option_b": "Algoritmo que divide la memoria en potencias de 2 para gestionar huecos de forma eficiente y rápida", "option_c": "Un error de RAM", "option_d": "Un tipo de partición", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite fusionar bloques libres adyacentes rápidamente para evitar la fragmentación."},
    {"text": "¿Para qué sirve el 'Slab Allocator' en el kernel?", "option_a": "Para asignar memoria a archivos", "option_b": "Caché de objetos del kernel que permite reutilizar estructuras de datos frecuentes sin crearlas constantemente", "option_c": "Un virus de memoria", "option_d": "Para limpiar el disco", "correct_answer": "b", "difficulty": "hard", "explanation": "Mejora mucho el rendimiento al evitar la sobrecarga de pedir y liberar memoria continuamente."},
    {"text": "¿Qué es la 'Memoria de Usuario' frente a la 'Memoria de Kernel'?", "option_a": "No hay diferencia", "option_b": "Espacios de direcciones separados para proteger el núcleo de las aplicaciones", "option_c": "La memoria de kernel es más barata", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "medium", "explanation": "Un programa de usuario nunca puede leer o escribir directamente en la memoria del kernel."},

    # --- ADVANCED I/O ---
    {"text": "¿Qué es el 'Zero-copy' en sistemas operativos?", "option_a": "No hacer copias", "option_b": "Técnica que evita copiar datos entre el espacio de kernel y usuario para mejorar el rendimiento (ej: enviar un archivo por la red)", "option_c": "Un virus de disco", "option_d": "Un error de red", "correct_answer": "b", "difficulty": "hard", "explanation": "Se usa en servidores web de alto rendimiento como Nginx."},
    {"text": "¿Qué es el 'Asynchronous I/O' (AIO)?", "option_a": "Escribir muy lento", "option_b": "Permite que un proceso inicie una operación de E/S y siga trabajando sin esperar a que termine", "option_c": "Un error de conexión", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "hard", "explanation": "Vital para aplicaciones que manejan miles de conexiones simultáneas."},
    {"text": "¿Qué es el 'Memory-Mapped I/O' (MMIO)?", "option_a": "Mapear un mapa", "option_b": "Método donde los registros de un dispositivo se acceden como si fueran direcciones comunes de memoria RAM", "option_c": "Un virus de video", "option_d": "Un error de BIOS", "correct_answer": "b", "difficulty": "hard", "explanation": "Es la forma estándar en que la CPU se comunica con la mayoría del hardware moderno."},

    # --- DISTRIBUTED SYSTEMS & CAP ---
    {"text": "¿Qué es el Teorema CAP en sistemas distribuidos?", "option_a": "Un manual de red", "option_b": "Establece que es imposible garantizar simultáneamente Consistencia, Disponibilidad y Tolerancia a particiones", "option_c": "Un tipo de cable", "option_d": "Un virus", "correct_answer": "b", "difficulty": "hard", "explanation": "Crucial para entender cómo funcionan las bases de datos y sistemas de archivos en la nube."},
    {"text": "¿Qué es un RPC (Remote Procedure Call)?", "option_a": "Un mensaje de chat", "option_b": "Protocolo que permite a un programa ejecutar código en otra máquina como si fuera una función local", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "medium", "explanation": "Es la base de muchos servicios distribuidos y microservicios."},

    # --- REAL-TIME OS (RTOS) ---
    {"text": "¿Qué es el Jitter en un sistema de tiempo real?", "option_a": "Mal tiempo", "option_b": "Variación en la latencia de respuesta; en RTOS debe ser mínima", "option_c": "Un error de pantalla", "option_d": "Un tipo de memoria", "correct_answer": "b", "difficulty": "hard", "explanation": "Un RTOS garantiza que la tarea se ejecutará siempre con la misma latencia."},
    {"text": "¿Qué significa que una tarea es de 'Hard Real-Time'?", "option_a": "Que es difícil de programar", "option_b": "Un fallo en el cumplimiento del tiempo límite (deadline) se considera un fallo total del sistema", "option_c": "Que el PC es de metal", "option_d": "Un virus", "correct_answer": "b", "difficulty": "hard", "explanation": "Se usa en frenos de coches, control de aviones o marcapasos."},

    # --- ADVANCED SECURITY ---
    {"text": "¿Qué es el RBAC (Role-Based Access Control)?", "option_a": "Control de acceso por nombres", "option_b": "Asignación de permisos basada en roles o funciones dentro de una organización, no por individuo", "option_c": "Un virus de red", "option_d": "Un firewall físico", "correct_answer": "b", "difficulty": "medium", "explanation": "Facilita la gestión de miles de usuarios al asignarles perfiles (ej: 'Contabilidad', 'IT')."},
    {"text": "¿Qué es el MAC (Mandatory Access Control)?", "option_a": "Un ordenador de Apple", "option_b": "Política de seguridad donde el sistema operativo restringe el acceso según clasificaciones del sistema, por encima del usuario", "option_c": "Un tipo de red", "option_d": "Un error de disco", "correct_answer": "b", "difficulty": "medium", "explanation": "Ejemplos son SELinux o AppArmor."},

    # --- VIRTUALIZATION ADVANCED ---
    {"text": "¿Qué es el 'Memory Ballooning' en virtualización?", "option_a": "Inflar el PC", "option_b": "Técnica que permite al hipervisor recuperar memoria RAM no usada de una máquina virtual para dársela a otra", "option_c": "Un error de kernel", "option_d": "Un virus de memoria", "correct_answer": "b", "difficulty": "hard", "explanation": "Funciona mediante un driver especial dentro de la VM que 'infla' su consumo ficticio para liberar RAM física."},
    {"text": "¿Qué es el 'Nested Virtualization'?", "option_a": "Virtualizar pájaros", "option_b": "Capacidad de ejecutar un hipervisor dentro de una máquina virtual (una VM dentro de otra VM)", "option_c": "Un error de BIOS", "option_d": "Un tipo de red", "correct_answer": "b", "difficulty": "hard", "explanation": "Útil para laboratorios de pruebas complejos o desarrollo de nubes."},

    # --- PRACTICAL LINUX & TOOLS ---
    {"text": "¿Qué hace el comando 'strace -p <PID>'?", "option_a": "Muestra la pantalla del proceso", "option_b": "Monitoriza todas las llamadas al sistema (syscalls) que está haciendo un proceso en tiempo real", "option_c": "Borra el proceso", "option_d": "Un virus", "correct_answer": "b", "difficulty": "hard", "explanation": "Es la herramienta definitiva para saber por qué un programa se queda 'colgado' o falla."},
    {"text": "¿Qué es el 'OOM Killer' (Out Of Memory) en Linux?", "option_a": "Un antivirus", "option_b": "Mecanismo del kernel que mata procesos para liberar memoria cuando el sistema se queda sin RAM ni swap", "option_c": "Un error de disco", "option_d": "Un comando manual", "correct_answer": "b", "difficulty": "hard", "explanation": "Suele matar al proceso que más RAM consume para salvar la estabilidad del resto del sistema."},
    {"text": "¿Qué es el archivo /proc en Linux?", "option_a": "Donde se guardan las fotos", "option_b": "Sistema de archivos virtual que muestra información en tiempo real sobre el kernel y los procesos", "option_c": "Un manual de ayuda", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "No ocupa espacio en disco; son 'ventanas' a la memoria del kernel."},
    {"text": "¿Para qué sirve el comando 'dmesg'?", "option_a": "Para ver el correo", "option_b": "Muestra los mensajes del búfer del kernel (ataques, hardware conectado, errores de driver)", "option_c": "Para chatear", "option_d": "Para borrar discos", "correct_answer": "b", "difficulty": "medium", "explanation": "Esencial para diagnosticar problemas de hardware recién conectado."},
    {"text": "¿Qué hace el comando 'uname -a'?", "option_a": "Un nombre falso", "option_b": "Muestra información detallada del sistema (nombre del host, versión del kernel, arquitectura)", "option_c": "Borra el usuario", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "easy", "explanation": "Muy útil para saber qué versión exacta de Linux estamos corriendo."},

    # --- WINDOWS TOOLS & CONCEPTS ---
    {"text": "¿Qué es el 'PowerShell'?", "option_a": "Una batería potente", "option_b": "Entorno de línea de comandos y lenguaje de scripting avanzado basado en objetos y .NET", "option_c": "El nombre del disco duro", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "Mucho más potente que el antiguo 'Símbolo del sistema' (CMD)."},
    {"text": "¿Qué es una 'GPO' (Group Policy Object)?", "option_a": "Un objeto de decoración", "option_b": "Configuraciones de Active Directory que permiten gestionar masivamente el comportamiento de ordenadores y usuarios", "option_c": "Un virus de red", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "medium", "explanation": "Ejemplo: obligar a que todos los PCs de la empresa tengan el mismo fondo de pantalla o desactivar el USB."},
    {"text": "¿Para qué sirve el comando 'sfc /scannow' en Windows?", "option_a": "Para ver la red", "option_b": "Escanea y repara archivos corruptos del sistema operativo Windows", "option_c": "Para borrar virus", "option_d": "Para formatear", "correct_answer": "b", "difficulty": "medium", "explanation": "System File Checker; vital cuando Windows empieza a dar errores inexplicables."},

    # --- CLOUD COMPUTING (MODELOS) ---
    {"text": "¿Qué es el IaaS (Infrastructure as a Service)?", "option_a": "Software de alquiler", "option_b": "Modelo que ofrece recursos de computación (VMs, red, storage) sobre los que el usuario instala su SO y apps", "option_c": "Un antivirus", "option_d": "Una base de datos", "correct_answer": "b", "difficulty": "medium", "explanation": "Ejemplos: AWS EC2, Google Compute Engine."},
    {"text": "¿Qué es el PaaS (Platform as a Service)?", "option_a": "Alquilar un ordenador físico", "option_b": "Entorno que permite desarrollar y desplegar apps sin gestionar la infraestructura subyacente (SO, parches)", "option_c": "Un tipo de cable", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "Ejemplos: Heroku, Azure App Service."},
    {"text": "¿Qué es el SaaS (Software as a Service)?", "option_a": "Comprar una licencia física", "option_b": "Software alojado en la nube al que se accede por internet sin instalar nada (ej: Gmail, Office 365)", "option_c": "Un error de sistema", "option_d": "Un manual", "correct_answer": "b", "difficulty": "easy", "explanation": "Es el modelo de consumo final donde el usuario no se preocupa de nada técnico."},

    # --- SERVERLESS & EDGE ---
    {"text": "¿Qué es el Serverless Computing o FaaS?", "option_a": "Computación sin servidores físicos", "option_b": "Modelo donde ejecutas funciones aisladas que se activan por eventos; el proveedor gestiona el escalado", "option_c": "Un error de red", "option_d": "Un virus de BIOS", "correct_answer": "b", "difficulty": "hard", "explanation": "Ejemplos: AWS Lambda, Google Cloud Functions."},
    {"text": "¿Qué es el Edge Computing?", "option_a": "Computación en el borde de la mesa", "option_b": "Procesar los datos cerca de donde se generan (sensores, dispositivos) para reducir la latencia", "option_c": "Un tipo de monitor", "option_d": "Un error de RAM", "correct_answer": "b", "difficulty": "medium", "explanation": "Vital para IoT y aplicaciones que necesitan respuesta instantánea."},

    # --- HIGH AVAILABILITY (ALTA DISPONIBILIDAD) ---
    {"text": "¿Qué es un 'Cluster' de alta disponibilidad?", "option_a": "Un grupo de amigos", "option_b": "Conjunto de servidores que trabajan juntos para que si uno falla, otro tome el control sin corte de servicio", "option_c": "Un virus de red", "option_d": "Un tipo de disco", "correct_answer": "b", "difficulty": "medium", "explanation": "Se basa en la redundancia para evitar puntos únicos de fallo (SPOF)."},
    {"text": "¿Qué es el 'Load Balancing' (Balanceo de Carga)?", "option_a": "Pesar el servidor", "option_b": "Técnica para distribuir el tráfico de red entre varios servidores para no saturar ninguno", "option_c": "Un error de sistema", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "easy", "explanation": "Mejora tanto el rendimiento como la disponibilidad."},
    {"text": "¿Qué es el 'Heartbeat' en un sistema de clustering?", "option_a": "El pulso del administrador", "option_b": "Señal periódica entre nodos para confirmar que el compañero sigue vivo y funcionando", "option_c": "Un virus", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "medium", "explanation": "Si se deja de recibir el heartbeat, se inicia el proceso de conmutación por error (failover)."},

    # --- BACKUP & DISASTER RECOVERY ---
    {"text": "¿Qué es un Backup Incremental?", "option_a": "Copia de todo el sistema", "option_b": "Copia solo de los archivos que han cambiado desde la última copia de cualquier tipo", "option_c": "Borrar el disco", "option_d": "Un error de RAM", "correct_answer": "b", "difficulty": "medium", "explanation": "Es el más rápido de hacer pero el más lento de restaurar (necesitas todas las partes)."},
    {"text": "¿Qué es un Backup Diferencial?", "option_a": "Copia que es diferente", "option_b": "Copia de todos los archivos que han cambiado desde el último Backup Total", "option_c": "Un virus de archivos", "option_d": "Un tipo de red", "correct_answer": "b", "difficulty": "medium", "explanation": "Ocupa más que el incremental pero es más fácil de restaurar (Total + el último Diferencial)."},
    {"text": "¿Qué significa RPO (Recovery Point Objective)?", "option_a": "Punto de no retorno", "option_b": "Cantidad máxima de datos que una empresa está dispuesta a perder (medido en tiempo)", "option_c": "Un error de disco", "option_d": "Un manual", "correct_answer": "b", "difficulty": "hard", "explanation": "Define la frecuencia con la que debemos hacer los backups."},

    # --- SYSTEM HARDENING (BASTIONADO) ---
    {"text": "¿Qué es el 'Hardening' de un sistema operativo?", "option_a": "Ponerlo duro", "option_b": "Proceso de asegurar un sistema reduciendo su superficie de ataque (cerrar puertos, borrar servicios innecesarios)", "option_c": "Un virus", "option_d": "Un tipo de monitor", "correct_answer": "b", "difficulty": "medium", "explanation": "Es fundamental antes de exponer cualquier servidor a internet."},
    {"text": "¿Por qué es importante desactivar servicios innecesarios en un servidor?", "option_a": "Para que pese menos", "option_b": "Para eliminar posibles vulnerabilidades y ahorrar recursos", "option_c": "Porque Windows lo dice", "option_d": "No es importante", "correct_answer": "b", "difficulty": "easy", "explanation": "Menos servicios corriendo significa menos 'puertas' que un hacker puede intentar abrir."},
    {"text": "¿Qué es el cifrado de disco completo (FDE)?", "option_a": "Poner contraseña al abrir Word", "option_b": "Cifrar todo el almacenamiento para proteger los datos si el equipo físico es robado", "option_c": "Un virus de archivos", "option_d": "Un error de BIOS", "correct_answer": "b", "difficulty": "medium", "explanation": "Ejemplos: BitLocker en Windows, LUKS en Linux."},

    # --- MONITORING TOOLS ---
    {"text": "¿Qué es Prometheus?", "option_a": "Un dios griego", "option_b": "Herramienta de monitorización y alerta de código abierto basada en métricas temporales", "option_c": "Un virus de red", "option_d": "Un tipo de red", "correct_answer": "b", "difficulty": "hard", "explanation": "Muy popular en entornos de microservicios y Kubernetes."},
    {"text": "¿Qué es Grafana?", "option_a": "Un tipo de fuente", "option_b": "Plataforma para visualizar y analizar métricas mediante paneles gráficos (dashboards)", "option_c": "Un manual de ayuda", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "Suele usarse junto a Prometheus para mostrar los datos de forma atractiva y útil."},
    {"text": "¿Para qué sirve el comando 'netstat'?", "option_a": "Para ver el estado de la batería", "option_b": "Muestra las conexiones de red activas, tablas de rutas y estadísticas de interfaz", "option_c": "Para borrar la red", "option_d": "Un virus", "correct_answer": "b", "difficulty": "easy", "explanation": "Fundamental para saber qué puertos están abiertos y quién está conectado a nuestro PC."},

    # --- ADVANCED OS CONCEPTS ---
    {"text": "¿Qué es un Hyper-V?", "option_a": "Un tipo de virus", "option_b": "Hipervisor de Microsoft integrado en Windows para crear y gestionar máquinas virtuales", "option_c": "Un monitor muy rápido", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Es un hipervisor de Tipo 1 (Bare Metal) aunque parezca una app más de Windows."},
    {"text": "¿Qué es el 'KVM' (Kernel-based Virtual Machine)?", "option_a": "Un cable de video", "option_b": "Módulo del kernel de Linux que lo convierte en un hipervisor de Tipo 1", "option_c": "Un virus de kernel", "option_d": "Un error de disco", "correct_answer": "b", "difficulty": "hard", "explanation": "Es la base de la virtualización en casi todos los servidores Linux modernos."},
    {"text": "¿Qué es el 'Secure Boot'?", "option_a": "Arrancar sin ruido", "option_b": "Característica de UEFI que solo permite cargar software firmado por el fabricante para evitar virus de arranque", "option_c": "Un virus de red", "option_d": "Un tipo de memoria", "correct_answer": "b", "difficulty": "medium", "explanation": "Evita que malwares tipo rootkit tomen el control del PC antes de que el SO cargue."},

    # --- LINUX PERMISSIONS MIX ---
    {"text": "¿Qué significa el permiso 'u+s' en Linux?", "option_a": "Usuario supremo", "option_b": "Activa el bit SUID en un archivo", "option_c": "Borra el archivo", "option_d": "Cifra el archivo", "correct_answer": "b", "difficulty": "hard", "explanation": "S es de 'Set ID'."},
    {"text": "¿Qué comando Linux muestra las últimas líneas de un archivo y se queda esperando cambios?", "option_a": "head -f", "option_b": "tail -f", "option_c": "watch cat", "option_d": "live log", "correct_answer": "b", "difficulty": "medium", "explanation": "Tail -f (follow) es imprescindible para monitorizar logs en tiempo real."},
    {"text": "¿Qué hace el comando 'ps aux'?", "option_a": "Pide ayuda", "option_b": "Lista todos los procesos que se están ejecutando en el sistema con detalles de CPU y memoria", "option_c": "Borra la terminal", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "A=all users, U=user format, X=processes without terminal."},

    # --- FINAL MISC FOR BATCH ---
    {"text": "¿Qué es la 'Swap'?", "option_a": "Un intercambio de archivos", "option_b": "Espacio en disco dedicado a extender la memoria RAM física cuando esta se llena", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "easy", "explanation": "En Linux puede ser una partición dedicada o un archivo swapfile."},
    {"text": "¿Qué es el 'Overcommit' de memoria?", "option_a": "Gastar mucha RAM", "option_b": "Permitir que el SO asigne más memoria de la que realmente tiene físicamente", "option_c": "Un error de disco", "option_d": "Un virus", "correct_answer": "b", "difficulty": "hard", "explanation": "Se basa en la esperanza de que no todos los procesos necesiten toda su memoria a la vez."},

    # --- LINUX NETWORKING INTERNALS ---
    {"text": "¿Qué es el 'Netfilter' en el kernel de Linux?", "option_a": "Un filtro del café", "option_b": "Framework que permite interceptar y manipular paquetes de red (base de iptables/nftables)", "option_c": "Un virus de red", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "hard", "explanation": "Es el motor interno que permite crear firewalls potentes en Linux."},
    {"text": "¿Qué es un 'Socket' en programación de red?", "option_a": "Un enchufe físico", "option_b": "Punto final de una comunicación bidireccional entre dos programas (IP + Puerto)", "option_c": "Un virus", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Es la abstracción que usan los programas para enviar datos por internet."},
    {"text": "¿Para qué sirve el comando 'ip link set eth0 up'?", "option_a": "Borrar la red", "option_b": "Activar una interfaz de red (en este caso eth0)", "option_c": "Cambiar la IP", "option_d": "Reiniciar el PC", "correct_answer": "b", "difficulty": "easy", "explanation": "Permite levantar la interfaz para que empiece a funcionar."},

    # --- KERNEL DEBUGGING & PERFORMANCE ---
    {"text": "¿Qué es 'perf' en Linux?", "option_a": "Un perfume", "option_b": "Herramienta de análisis de rendimiento que lee contadores de hardware y traza eventos del kernel", "option_c": "Un virus de CPU", "option_d": "Un comando para borrar", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite saber exactamente qué funciones del código están consumiendo más CPU."},
    {"text": "¿Qué es 'ftrace'?", "option_a": "Un tipo de disco", "option_b": "Analizador de trazas integrado en el kernel para seguir el flujo de ejecución de las funciones", "option_c": "Un error de BIOS", "option_d": "Un virus", "correct_answer": "b", "difficulty": "hard", "explanation": "Ayuda a entender cómo interactúan los diferentes componentes del kernel en tiempo real."},
    {"text": "¿Para qué sirve el comando 'lsof'?", "option_a": "Para ver el sofá", "option_b": "LiSt Open Files: muestra todos los archivos abiertos por procesos (incluyendo sockets y librerías)", "option_c": "Para borrar archivos", "option_d": "Un virus de red", "correct_answer": "b", "difficulty": "medium", "explanation": "Muy útil para saber qué proceso está bloqueando un archivo o usando un puerto."},

    # --- WINDOWS SECURITY DEEP DIVE ---
    {"text": "¿Qué es el proceso LSASS.exe en Windows?", "option_a": "Un virus", "option_b": "Servicio de Local Security Authority; se encarga de la política de seguridad y autenticación (login)", "option_c": "El navegador web", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "hard", "explanation": "Es un proceso crítico; si se detiene, Windows se reinicia forzosamente."},
    {"text": "¿Qué es el 'SAM' (Security Account Manager) en Windows?", "option_a": "Un usuario", "option_b": "Base de datos que almacena las contraseñas de los usuarios locales en formato hash", "option_c": "Un virus de disco", "option_d": "Un tipo de red", "correct_answer": "b", "difficulty": "hard", "explanation": "Está protegida por el sistema y no se puede abrir con un editor normal mientras Windows corre."},
    {"text": "¿Qué es el 'Credential Guard' de Windows?", "option_a": "Un antivirus", "option_b": "Usa virtualización para aislar los secretos de inicio de sesión y evitar ataques tipo 'Pass-the-Hash'", "option_c": "Un manual", "option_d": "Un puerto de red", "correct_answer": "b", "difficulty": "hard", "explanation": "Es una característica de seguridad avanzada de las versiones Pro y Enterprise."},

    # --- UNIX & MAC SPECIFIC ---
    {"text": "¿Qué es el núcleo 'Mach'?", "option_a": "Un procesador rápido", "option_b": "Microkernel que sirve de base para el SO de Apple (macOS/iOS) dentro del kernel XNU", "option_c": "Un virus italiano", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "hard", "explanation": "XNU combina Mach (microkernel) con partes de BSD (monolítico)."},
    {"text": "¿Qué es 'launchd' en macOS?", "option_a": "Un programa para lanzar apps", "option_b": "Framework de gestión de servicios y procesos (equivale a systemd en Linux o Services en Windows)", "option_c": "Un error de disco", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "Es el primer proceso que se ejecuta (PID 1) en macOS."},

    # --- MOBILE OPERATING SYSTEMS ---
    {"text": "¿Qué es el 'Sandboxing' en sistemas móviles (Android/iOS)?", "option_a": "Jugar en la arena", "option_b": "Mecanismo de seguridad que aísla cada app en su propio entorno para que no acceda a datos de otras", "option_c": "Un virus de batería", "option_d": "Un tipo de pantalla", "correct_answer": "b", "difficulty": "medium", "explanation": "Evita que una app maliciosa pueda espiar tus mensajes o fotos sin permiso."},
    {"text": "¿Qué es 'APK' en el contexto de Android?", "option_a": "Un tipo de pantalla", "option_b": "Formato de archivo usado para distribuir e instalar aplicaciones en Android", "option_c": "Un error de kernel", "option_d": "Un virus de red", "correct_answer": "b", "difficulty": "easy", "explanation": "Android Package Kit."},

    # --- COMPLIANCE & LOGGING ---
    {"text": "¿Qué es el 'Syslog'?", "option_a": "Un manual de Linux", "option_b": "Estándar para el envío y almacenamiento de mensajes de registro (logs) en sistemas IP", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "medium", "explanation": "Permite centralizar los logs de muchos servidores en uno solo para auditoría."},
    {"text": "¿Para qué sirve la rotación de logs (logrotate)?", "option_a": "Para que los logs den vueltas", "option_b": "Proceso automático que comprime y borra logs antiguos para evitar que llenen el disco duro", "option_c": "Un virus", "option_d": "Un manual", "correct_answer": "b", "difficulty": "easy", "explanation": "Sin logrotate, un servidor podría colapsar simplemente por generar demasiado texto de registro."},

    # --- ADVANCED SHELL & REGEX ---
    {"text": "¿Qué significa el símbolo '^' en una expresión regular (Regex)?", "option_a": "Potencia matemática", "option_b": "Indica el inicio de una línea", "option_c": "Borrar el archivo", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "Ejemplo: grep '^Error' busca líneas que empiecen exactamente por Error."},
    {"text": "¿Qué significa el símbolo '$' al final de una Regex?", "option_a": "Que cuesta dinero", "option_b": "Indica el final de una línea", "option_c": "Un error de sistema", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Ejemplo: grep 'txt$' busca líneas que terminen en txt."},
    {"text": "¿Qué hace el comando 'cat archivo | wc -l'?", "option_a": "Muestra el archivo en el baño", "option_b": "Cuenta el número de líneas que tiene el archivo", "option_c": "Borra el archivo", "option_d": "Un virus", "correct_answer": "b", "difficulty": "easy", "explanation": "WC = Word Count, -L = Lines."},

    # --- STORAGE ADVANCED ---
    {"text": "¿Qué es el 'NVMe over Fabrics' (NVMe-oF)?", "option_a": "Un cable de tela", "option_b": "Protocolo que permite acceder a discos NVMe a través de una red (FC, Ethernet) con latencia mínima", "option_c": "Un virus de disco", "option_d": "Un manual de red", "correct_answer": "b", "difficulty": "hard", "explanation": "Extiende la velocidad del bus PCIe a través de la infraestructura de red del datacenter."},
    {"text": "¿Qué es el SDS (Software-Defined Storage)?", "option_a": "Un disco de software", "option_b": "Separación del software de gestión de almacenamiento del hardware físico", "option_c": "Un error de RAM", "option_d": "Un tipo de partición", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite usar servidores estándar para crear soluciones de almacenamiento complejas y escalables."},

    # --- VIRTUALIZATION DEEP DIVE ---
    {"text": "¿Qué es el 'VT-x'?", "option_a": "Un modelo de monitor", "option_b": "Extensión de virtualización por hardware de Intel que mejora el rendimiento de las VMs", "option_c": "Un virus de CPU", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "medium", "explanation": "Debe estar activo en la BIOS para poder usar hipervisores como VMware o Hyper-V."},
    {"text": "¿Qué es 'QEMU'?", "option_a": "Un pájaro australiano", "option_b": "Emulador y virtualizador de código abierto capaz de emular diferentes arquitecturas de CPU", "option_c": "Un error de kernel", "option_d": "Un antivirus", "correct_answer": "b", "difficulty": "hard", "explanation": "Suele usarse junto a KVM para proporcionar una solución de virtualización completa en Linux."},

    # --- SYSTEM PERFORMANCE ---
    {"text": "¿Qué es el 'Load Average' (Media de carga) en Linux?", "option_a": "Cuánto pesa el PC", "option_b": "Número de procesos que están usando o esperando la CPU en intervalos de 1, 5 y 15 minutos", "option_c": "Un virus", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Si el valor es mayor al número de núcleos de CPU, el sistema está saturado."},
    {"text": "¿Qué significa que un sistema está 'I/O Bound'?", "option_a": "Que va muy rápido", "option_b": "Que la velocidad del sistema está limitada por la lentitud del disco o la red, no por la CPU", "option_c": "Que no tiene RAM", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "Ocurre mucho en bases de datos pesadas sobre discos lentos."},

    # --- MIXED ADVANCED ---
    {"text": "¿Qué es el 'System.map' en Linux?", "option_a": "Un mapa de la red", "option_b": "Archivo que relaciona los nombres de las funciones del kernel con sus direcciones de memoria", "option_c": "Un virus de kernel", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "hard", "explanation": "Imprescindible para el debugging del kernel cuando ocurre un 'Oops' o crash."},
    {"text": "¿Qué es un 'Rootkit'?", "option_a": "Un set de herramientas de jardín", "option_b": "Malware diseñado para ocultar su presencia y la de otros virus en el corazón del SO", "option_c": "Un tipo de disco", "option_d": "Un manual de root", "correct_answer": "b", "difficulty": "medium", "explanation": "Son muy difíciles de detectar porque modifican el propio kernel para mentir al usuario."},

    # --- WINDOWS DEPLOYMENT (DESPLIEGUE) ---
    {"text": "¿Qué hace la herramienta 'Sysprep' en Windows?", "option_a": "Limpia el registro", "option_b": "Prepara una instalación de Windows para ser duplicada (clonada) eliminando SID y datos específicos", "option_c": "Un virus de red", "option_d": "Un manual", "correct_answer": "b", "difficulty": "hard", "explanation": "Esencial para crear imágenes corporativas que funcionen en diferentes ordenadores."},
    {"text": "¿Qué es WDS (Windows Deployment Services)?", "option_a": "Un antivirus", "option_b": "Servicio que permite instalar Windows a través de la red (arranque por PXE)", "option_c": "Un tipo de cable", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "medium", "explanation": "Permite formatear cientos de PCs sin usar pendrives o CDs físicamente."},
    {"text": "¿Qué es un archivo de respuesta (Answer File) en instalaciones de Windows?", "option_a": "Un manual de ayuda", "option_b": "Archivo XML que contiene las respuestas a las preguntas del instalador para una instalación desatendida", "option_c": "Un virus", "option_d": "Un tipo de monitor", "correct_answer": "b", "difficulty": "hard", "explanation": "Evita tener que estar presente durante la instalación configurando idioma, zona horaria y usuario automáticamente."},

    # --- LINUX PACKAGE MANAGEMENT ---
    {"text": "¿Qué es un paquete '.deb'?", "option_a": "Un error de red", "option_b": "Formato de archivo de paquete usado por Debian y sus derivadas como Ubuntu", "option_c": "Un tipo de disco", "option_d": "Un manual", "correct_answer": "b", "difficulty": "easy", "explanation": "Se gestionan con herramientas como dpkg o apt."},
    {"text": "¿Qué es un paquete '.rpm'?", "option_a": "Revoluciones por minuto del disco", "option_b": "Red Hat Package Manager; formato usado por RHEL, CentOS y Fedora", "option_c": "Un virus", "option_d": "Un tipo de memoria", "correct_answer": "b", "difficulty": "easy", "explanation": "Sistemas como openSUSE también lo utilizan."},
    {"text": "¿Qué herramienta de Linux gestiona las dependencias automáticamente al instalar programas?", "option_a": "dpkg", "option_b": "apt (o dnf/yum)", "option_c": "tar", "option_d": "zip", "correct_answer": "b", "difficulty": "medium", "explanation": "Apt descarga e instala todas las librerías necesarias para que el programa funcione."},

    # --- OS PERFORMANCE TUNING ---
    {"text": "¿Qué hace el parámetro 'swappiness' en Linux?", "option_a": "Limpia la RAM", "option_b": "Define la tendencia del kernel a mover datos de la RAM al disco (swap); valores bajos prefieren mantener datos en RAM", "option_c": "Un error de disco", "option_d": "Un virus", "correct_answer": "b", "difficulty": "hard", "explanation": "Un valor de 10 es típico en servidores para evitar el uso excesivo del disco lento."},
    {"text": "¿Para qué sirve el comando 'sysctl'?", "option_a": "Para apagar el PC", "option_b": "Para ver o modificar parámetros del kernel en tiempo de ejecución (red, memoria, seguridad)", "option_c": "Para chatear", "option_d": "Para borrar discos", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite optimizar el sistema sin necesidad de recompilar el kernel o reiniciar."},
    {"text": "¿Qué es la 'Defregmentación' de un disco duro mecánico?", "option_a": "Romper el disco", "option_b": "Reorganizar los archivos para que sus trozos estén contiguos y el cabezal se mueva menos", "option_c": "Un virus de archivos", "option_d": "Un modo de bajo consumo", "correct_answer": "b", "difficulty": "easy", "explanation": "Mejora mucho la velocidad en los HDD, pero es innecesaria (y dañina) en los SSD."},

    # --- DISPLAY STACKS & GRAPHICS ---
    {"text": "¿Qué es 'Wayland' en el mundo Linux?", "option_a": "Un país", "option_b": "Protocolo moderno de servidor gráfico que busca sustituir al antiguo X11", "option_c": "Un virus de video", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "medium", "explanation": "Es más seguro y eficiente, aunque la transición desde X.org ha sido lenta."},
    {"text": "¿Qué es el 'X11' (X Window System)?", "option_a": "La versión 11 de Windows", "option_b": "Sistema de ventanas tradicional en Unix/Linux basado en una arquitectura cliente-servidor", "option_c": "Un virus de red", "option_d": "Un error de BIOS", "correct_answer": "b", "difficulty": "medium", "explanation": "Permite, por ejemplo, ejecutar una aplicación en un servidor y ver la ventana en tu propio PC."},

    # --- FILESYSTEM SNAPSHOTS (INSTANTÁNEAS) ---
    {"text": "¿Qué es un Snapshot (Instantánea) de un sistema de archivos?", "option_a": "Una foto del monitor", "option_b": "Copia del estado del sistema en un momento exacto que permite volver atrás si algo falla", "option_c": "Un virus de disco", "option_d": "Un error de red", "correct_answer": "b", "difficulty": "medium", "explanation": "Muy usado en máquinas virtuales antes de hacer cambios arriesgados."},
    {"text": "¿Qué sistema de archivos de Linux es famoso por su gestión nativa de snapshots y subvolúmenes?", "option_a": "ext4", "option_b": "Btrfs (o ZFS)", "option_c": "FAT32", "option_d": "NTFS", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite realizar copias de seguridad instantáneas casi sin ocupar espacio adicional inicialmente."},

    # --- WINDOWS UPDATES (ACTUALIZACIONES) ---
    {"text": "¿Qué es el 'WSUS' (Windows Server Update Services)?", "option_a": "Un antivirus", "option_b": "Servidor local que descarga las actualizaciones de Microsoft y las distribuye a los PCs de la red interna", "option_c": "Un manual de ayuda", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "medium", "explanation": "Ahorra ancho de banda de internet y permite al administrador elegir qué parches se instalan."},
    {"text": "¿Qué es la 'Optimización de Entrega' (Delivery Optimization) en Windows 10/11?", "option_a": "Ir más rápido", "option_b": "Permite que los PCs descarguen actualizaciones unos de otros en la red local (tipo P2P)", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "medium", "explanation": "Acelera las descargas cuando hay muchos equipos en la misma oficina."},

    # --- LINUX BOOTLOADER ADVANCED ---
    {"text": "¿Qué es el 'Grub Rescue'?", "option_a": "Rescatar a un perro", "option_b": "Consola mínima que aparece cuando el cargador de arranque no encuentra sus archivos de configuración", "option_c": "Un virus de arranque", "option_d": "Un manual", "correct_answer": "b", "difficulty": "hard", "explanation": "Requiere conocimientos de comandos de GRUB para poder iniciar el sistema manualmente."},
    {"text": "¿Qué hace el parámetro 'nomodeset' al arrancar Linux?", "option_a": "No poner música", "option_b": "Desactiva la carga de drivers de video en el kernel hasta que el SO cargue del todo", "option_c": "Borra el disco", "option_d": "Un virus de BIOS", "correct_answer": "b", "difficulty": "hard", "explanation": "Útil cuando la pantalla se queda en negro por culpa de un driver gráfico incompatible."},

    # --- INIT SYSTEMS & RUNLEVELS ---
    {"text": "¿Qué es un 'Runlevel' (Nivel de ejecución) en sistemas tradicionales?", "option_a": "Subir de nivel en un juego", "option_b": "Estado del sistema que define qué servicios están activos (ej: modo texto, modo gráfico, apagado)", "option_c": "Un error de kernel", "option_d": "Un tipo de monitor", "correct_answer": "b", "difficulty": "medium", "explanation": "El runlevel 3 suele ser texto puro y el 5 es el entorno gráfico habitual."},
    {"text": "¿Cuál es el equivalente a los Runlevels en sistemas basados en systemd?", "option_a": "Groups", "option_b": "Targets", "option_c": "Modules", "option_d": "Services", "correct_answer": "b", "difficulty": "medium", "explanation": "Por ejemplo, 'multi-user.target' equivale al antiguo runlevel 3."},

    # --- MISCELLANEOUS PRACTICAL ---
    {"text": "¿Qué hace el comando 'crontab -e'?", "option_a": "Borra el reloj", "option_b": "Abre el editor para programar tareas automáticas que se ejecutan periódicamente", "option_c": "Un virus de tiempo", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "medium", "explanation": "Permite programar backups cada noche o limpiezas de logs cada semana de forma automática."},
    {"text": "¿Cómo se mira qué versión de Windows tenemos desde la consola (CMD)?", "option_a": "ver", "option_b": "version", "option_c": "win_info", "option_d": "show os", "correct_answer": "a", "difficulty": "easy", "explanation": "El comando 'ver' muestra la versión numérica del núcleo (ej: 10.0.19045)."},
    {"text": "¿Para qué sirve el archivo 'hosts'?", "option_a": "Para invitar a gente", "option_b": "Archivo local que relaciona nombres de dominio con IPs, adelantándose a la consulta DNS", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "easy", "explanation": "Suele usarse para bloquear publicidad o redirigir dominios a servidores de prueba locales."},

    # --- DRIVERS & HARDWARE ---
    {"text": "¿Qué es la 'Interrupción por Software' (Trap)?", "option_a": "Una trampa para ratones", "option_b": "Excepción o error generado por un programa (ej: dividir por cero) que obliga al SO a intervenir", "option_c": "Un virus de CPU", "option_d": "Un manual", "correct_answer": "b", "difficulty": "hard", "explanation": "A diferencia de las de hardware, son predecibles y ocurren por la ejecución del código."},
    {"text": "¿Qué es el 'Firmware'?", "option_a": "Ropa de marca", "option_b": "Software de bajo nivel grabado en hardware que controla el funcionamiento básico del dispositivo", "option_c": "Un virus de disco", "option_d": "Un tipo de monitor", "correct_answer": "b", "difficulty": "easy", "explanation": "Ejemplos: BIOS, el software interno de un router o de un disco duro."},

    # --- WINDOWS MANAGEMENT (WMI) ---
    {"text": "¿Qué es el WMI (Windows Management Instrumentation)?", "option_a": "Un editor de video", "option_b": "Infraestructura de Windows para la gestión de datos y operaciones en sistemas basados en Windows", "option_c": "Un virus de red", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite a los administradores consultar información del hardware y software mediante scripts y herramientas."},
    {"text": "¿Qué es el CIM (Common Information Model)?", "option_a": "Un modelo de coche", "option_b": "Estándar abierto que define cómo se representan los elementos gestionados en un entorno de TI", "option_c": "Un virus", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "hard", "explanation": "WMI es la implementación de Microsoft del estándar CIM."},

    # --- LINUX PERFORMANCE TOOLS ---
    {"text": "¿Para qué sirve el comando 'iostat'?", "option_a": "Para ver el estado de la red", "option_b": "Informa sobre las estadísticas de la CPU y la entrada/salida para dispositivos y particiones", "option_c": "Para borrar discos", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "Esencial para detectar cuellos de botella en el disco duro."},
    {"text": "¿Qué información proporciona el comando 'vmstat'?", "option_a": "La versión de las VMs", "option_b": "Estadísticas sobre procesos, memoria, paginación, bloque de E/S y actividad de la CPU", "option_c": "Un error de sistema", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Virtual Memory Statistics; da una visión rápida de la salud general del sistema."},
    {"text": "¿Qué es el comando 'sar' (System Activity Reporter)?", "option_a": "Un virus de red", "option_b": "Herramienta que recopila, informa y guarda información sobre la actividad del sistema a lo largo del tiempo", "option_c": "Un manual de ayuda", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite analizar qué pasó en el servidor hace horas o días (si el servicio sysstat está activo)."},

    # --- HARDWARE ARCHITECTURES ---
    {"text": "¿Qué significa NUMA (Non-Uniform Memory Access)?", "option_a": "Memoria que no se usa", "option_b": "Arquitectura donde el tiempo de acceso a la memoria depende de la ubicación de la memoria respecto al procesador", "option_c": "Un tipo de disco", "option_d": "Un error de RAM", "correct_answer": "b", "difficulty": "hard", "explanation": "Sistemas con múltiples CPUs físicas suelen ser NUMA para mejorar el rendimiento local."},
    {"text": "¿Qué es la Afinididad de CPU (CPU Affinity)?", "option_a": "Que la CPU es cariñosa", "option_b": "Configuración que obliga a un proceso o hilo a ejecutarse solo en un núcleo o núcleos específicos", "option_c": "Un virus", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Evita que el proceso salte de un núcleo a otro, mejorando el uso de la caché L1/L2."},

    # --- MULTI-PROCESSOR SYNC ---
    {"text": "¿Qué es una Operación Atómica?", "option_a": "Una explosión", "option_b": "Operación que se ejecuta de forma indivisible, sin que otros procesos vean estados intermedios", "option_c": "Un error de kernel", "option_d": "Un tipo de red", "correct_answer": "b", "difficulty": "hard", "explanation": "Fundamental para evitar condiciones de carrera en sistemas multiprocesador."},
    {"text": "¿Qué es una Barrera de Memoria (Memory Barrier)?", "option_a": "Un muro físico", "option_b": "Instrucción que obliga a la CPU o al compilador a respetar un orden estricto en las operaciones de memoria", "option_c": "Un virus de RAM", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "hard", "explanation": "Evita que las optimizaciones de la CPU (reordenación de instrucciones) causen errores en código multihilo."},

    # --- FILESYSTEM INTERNALS ---
    {"text": "¿Qué es el 'Superblock' en un sistema de archivos Unix/Linux?", "option_a": "Un bloque de cemento", "option_b": "Bloque que contiene metadatos críticos sobre todo el sistema de archivos (tamaño, estado, tipo)", "option_c": "Un virus de disco", "option_d": "Un manual", "correct_answer": "b", "difficulty": "hard", "explanation": "Si el superbloque se corrompe, el disco no se puede montar; por eso suele haber copias de respaldo."},
    {"text": "¿Qué es el 'Vnode' en sistemas BSD/macOS?", "option_a": "Un virus de red", "option_b": "Abstracción interna del kernel que representa un archivo, similar al Inodo de Linux", "option_c": "Un tipo de monitor", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite al kernel manejar diferentes tipos de archivos de forma genérica."},

    # --- WINDOWS SECURITY (UAC) ---
    {"text": "¿Qué es el UAC (User Account Control) de Windows?", "option_a": "Un antivirus", "option_b": "Función que solicita permiso al usuario antes de permitir que un programa realice cambios de administrador", "option_c": "Un error de sistema", "option_d": "Un virus", "correct_answer": "b", "difficulty": "easy", "explanation": "Evita que malwares se instalen o modifiquen el sistema sin que te des cuenta."},
    {"text": "¿Qué son los 'Integrity Levels' (Niveles de Integridad) en Windows?", "option_a": "Ser buena persona", "option_b": "Mecanismo que clasifica procesos por nivel de confianza (Bajo, Medio, Alto, Sistema) para restringir sus acciones", "option_c": "Un virus de red", "option_d": "Un manual", "correct_answer": "b", "difficulty": "hard", "explanation": "Por ejemplo, el navegador suele correr en nivel 'Bajo' para que si es hackeado no pueda escribir en tus documentos."},

    # --- KERNEL HARDENING ---
    {"text": "¿Qué es el KASLR (Kernel Address Space Layout Randomization)?", "option_a": "Un juego de azar", "option_b": "Técnica que coloca el código del kernel en direcciones de memoria aleatorias en cada arranque para evitar exploits", "option_c": "Un virus de RAM", "option_d": "Un error de BIOS", "correct_answer": "b", "difficulty": "hard", "explanation": "Dificulta que un atacante sepa dónde saltar para ejecutar código malicioso en el kernel."},
    {"text": "¿Qué es el NX bit (No-Execute bit)?", "option_a": "No ejecutar pelis", "option_b": "Característica del procesador que marca ciertas áreas de memoria como no ejecutables para evitar virus", "option_c": "Un virus", "option_d": "Un manual", "correct_answer": "b", "difficulty": "hard", "explanation": "Evita ataques de desbordamiento de búfer donde el virus intenta ejecutarse desde el área de datos."},

    # --- BOOT SECURITY (TPM) ---
    {"text": "¿Qué es el chip TPM (Trusted Platform Module)?", "option_a": "Un procesador de video", "option_b": "Chip físico que almacena claves criptográficas de forma segura para proteger la integridad del sistema", "option_c": "Un virus de placa base", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "medium", "explanation": "Es requisito para características como BitLocker o Windows 11."},
    {"text": "¿Qué es el 'Measured Boot'?", "option_a": "Arrancar con regla", "option_b": "Proceso donde cada componente del arranque (firmware, bootloader, kernel) es medido y verificado antes de cargar el siguiente", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "hard", "explanation": "Asegura que nada ha sido manipulado desde el último inicio."},

    # --- SHELL SCRIPTING ADVANCED ---
    {"text": "¿Para qué sirve el comando 'trap' en un script de Bash?", "option_a": "Para poner una trampa", "option_b": "Permite capturar señales (como Ctrl+C) y ejecutar código de limpieza antes de que el script muera", "option_c": "Un virus de terminal", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "hard", "explanation": "Fundamental para borrar archivos temporales si el usuario cancela el programa."},
    {"text": "¿Qué hace 'set -e' al principio de un script de Bash?", "option_a": "Poner música", "option_b": "Hace que el script se detenga inmediatamente si cualquier comando falla (devuelve error)", "option_c": "Borra el script", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "Es una buena práctica para evitar que un script siga ejecutándose tras un error crítico y cause daños mayores."},

    # --- WINDOWS REGISTRY HIVES ---
    {"text": "¿Qué es un 'Hive' (Colmena) en el Registro de Windows?", "option_a": "Donde viven las abejas de Windows", "option_b": "Archivo físico en el disco que contiene una parte de la base de datos del registro", "option_c": "Un virus de red", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "hard", "explanation": "Ejemplos: SYSTEM, SOFTWARE, SAM, SECURITY."},
    {"text": "¿Qué información contiene la rama HKEY_CLASSES_ROOT (HKCR)?", "option_a": "Las clases del colegio", "option_b": "Información sobre asociaciones de archivos (qué programa abre qué extensión) y objetos COM", "option_c": "Un virus", "option_d": "Un manual de red", "correct_answer": "b", "difficulty": "medium", "explanation": "Define, por ejemplo, que los archivos .txt se abran con el Bloc de notas."},

    # --- FINAL MIXED ---
    {"text": "¿Qué es el 'Magic SysRq key' en Linux?", "option_a": "Un truco de magia", "option_b": "Combinación de teclas que permite comunicarse directamente con el kernel incluso si el sistema está colgado", "option_c": "Un virus de teclado", "option_d": "Un error de RAM", "correct_answer": "b", "difficulty": "hard", "explanation": "Sirve para reiniciar el PC de forma segura (REISUB) o ver el estado de la memoria en casos de emergencia."},
    {"text": "¿Qué es el comando 'chroot'?", "option_a": "Cerrar la sesión de root", "option_b": "Cambia el directorio raíz para el proceso actual y sus hijos, aislándolos del resto del sistema", "option_c": "Un virus de archivos", "option_d": "Un tipo de red", "correct_answer": "b", "difficulty": "hard", "explanation": "Base de los contenedores primitivos y muy usado para recuperar sistemas dañados desde un Live CD."},

    # --- WINDOWS REMOTE MANAGEMENT ---
    {"text": "¿Qué es el WinRM (Windows Remote Management)?", "option_a": "Un mando a distancia", "option_b": "Protocolo basado en estándares (WS-Man) para gestionar de forma remota sistemas Windows", "option_c": "Un virus de red", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "medium", "explanation": "Es el equivalente a SSH en Windows para administración por línea de comandos (PowerShell Remoting)."},
    {"text": "¿Para qué sirve el comando 'Enter-PSSession'?", "option_a": "Para entrar en modo pánico", "option_b": "Inicia una sesión interactiva de PowerShell con un ordenador remoto", "option_c": "Borra el disco", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Permite ejecutar comandos en otro PC como si estuviéramos sentados frente a él."},

    # --- LINUX KERNEL MODULES ---
    {"text": "¿Qué comando se usa para cargar un módulo del kernel y sus dependencias de forma automática?", "option_a": "insmod", "option_b": "modprobe", "option_c": "load_mod", "option_d": "start_driver", "correct_answer": "b", "difficulty": "medium", "explanation": "A diferencia de insmod, modprobe busca y carga otros módulos necesarios automáticamente."},
    {"text": "¿Para qué sirve el comando 'depmod'?", "option_a": "Para depurar módulos", "option_b": "Genera el archivo de dependencias de los módulos del kernel", "option_c": "Un virus de disco", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "hard", "explanation": "Es necesario ejecutarlo tras instalar nuevos drivers manualmente."},

    # --- SYSTEM PERFORMANCE & CACHE ---
    {"text": "¿Qué es un 'Write-back Cache'?", "option_a": "Escribir hacia atrás", "option_b": "Técnica donde los datos se escriben primero en el búfer/caché y luego se sincronizan con el disco (más rápido)", "option_c": "Un virus de archivos", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "hard", "explanation": "Mejora mucho el rendimiento pero existe riesgo de pérdida de datos si hay un apagón antes de sincronizar."},
    {"text": "¿Qué es un 'Write-through Cache'?", "option_a": "Escribir a través del monitor", "option_b": "Técnica donde los datos se escriben simultáneamente en la caché y en el disco (más seguro)", "option_c": "Un virus de red", "option_d": "Un manual", "correct_answer": "b", "difficulty": "hard", "explanation": "Es más lento que write-back pero garantiza que los datos están seguros en todo momento."},

    # --- VIRTUALIZATION ADVANCED ---
    {"text": "¿Qué es el SR-IOV (Single Root I/O Virtualization)?", "option_a": "Un tipo de monitor", "option_b": "Permite que un único dispositivo físico PCIe se presente como múltiples dispositivos virtuales separados para las VMs", "option_c": "Un virus de red", "option_d": "Un error de BIOS", "correct_answer": "b", "difficulty": "hard", "explanation": "Mejora drásticamente el rendimiento de red y disco en entornos de alta virtualización."},
    {"text": "¿Qué es la IOMMU?", "option_a": "Una unidad de memoria muy grande", "option_b": "Unidad que conecta un bus de E/S con la memoria RAM, permitiendo a los periféricos usar direcciones virtuales", "option_c": "Un virus de kernel", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "hard", "explanation": "Es fundamental para que el 'Passthrough' de hardware (ej: usar una GPU real en una VM) sea seguro."},

    # --- MEMORY MANAGEMENT (HUGEPAGES) ---
    {"text": "¿Qué son las 'HugePages' en Linux?", "option_a": "Páginas muy grandes de un libro", "option_b": "Uso de páginas de memoria de mayor tamaño (ej: 2MB o 1GB) para reducir la carga de la TLB", "option_c": "Un error de RAM", "option_d": "Un virus de disco", "correct_answer": "b", "difficulty": "hard", "explanation": "Muy útil en bases de datos gigantes y sistemas de alto rendimiento para acelerar el acceso a la memoria."},
    {"text": "¿Qué es el Transparent HugePages (THP)?", "option_a": "Páginas invisibles", "option_b": "Intento del kernel de gestionar HugePages de forma automática sin que la aplicación lo pida expresamente", "option_c": "Un virus", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "hard", "explanation": "A veces causa problemas de latencia y muchos administradores de base de datos prefieren desactivarlo."},

    # --- LINUX NAMESPACES (CONTENEDORES) ---
    {"text": "¿Para qué sirve el 'PID Namespace' en Linux?", "option_a": "Para poner nombre a los procesos", "option_b": "Permite que un proceso vea solo sus propios procesos hijos, aislando la lista de PIDs", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "hard", "explanation": "Es la base de por qué dentro de un contenedor el proceso principal siempre es el PID 1."},
    {"text": "¿Qué aísla el 'Network Namespace'?", "option_a": "Los cables de red", "option_b": "Proporciona interfaces de red, tablas de rutas y firewalls independientes para cada grupo de procesos", "option_c": "Un virus", "option_d": "Un manual", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite que cada contenedor Docker tenga su propia IP y puertos sin chocar con el host."},
    {"text": "¿Qué es el 'Mount Namespace'?", "option_a": "Montar un mueble", "option_b": "Aísla los puntos de montaje del sistema de archivos, permitiendo que un proceso vea un árbol de carpetas distinto", "option_c": "Un virus de archivos", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite a cada contenedor tener su propio sistema de archivos raíz independiente."},

    # --- CONTROL GROUPS (CGROUPS) ---
    {"text": "¿Para qué sirven los 'cgroups' en el kernel de Linux?", "option_a": "Para agrupar amigos", "option_b": "Para limitar, contabilizar e aislar el uso de recursos (CPU, RAM, disco) de grupos de procesos", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "hard", "explanation": "Si los Namespaces dan 'aislamiento', los cgroups dan 'límites' (ej: que este contenedor no use más de 1GB de RAM)."},
    {"text": "¿Cuál es la principal diferencia entre cgroups v1 y v2?", "option_a": "La v2 es para Windows", "option_b": "La v2 usa una jerarquía unificada mucho más simple y coherente que la v1", "option_c": "La v1 es más rápida", "option_d": "No hay diferencias", "correct_answer": "b", "difficulty": "hard", "explanation": "La mayoría de distros modernas han migrado ya a cgroups v2."},

    # --- WINDOWS SUBSYSTEM FOR LINUX (WSL) ---
    {"text": "¿Qué era el WSL1?", "option_a": "Un emulador de Windows", "option_b": "Capa de traducción que convertía llamadas al sistema de Linux a llamadas de Windows en tiempo real", "option_c": "Un virus de red", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "medium", "explanation": "No tenía un kernel de Linux real, por lo que algunas apps complejas no funcionaban."},
    {"text": "¿En qué se basa el WSL2?", "option_a": "En un emulador mejor", "option_b": "Ejecuta un kernel de Linux real dentro de una máquina virtual ligera (Hyper-V)", "option_c": "En un pendrive", "option_d": "En el navegador", "correct_answer": "b", "difficulty": "medium", "explanation": "Ofrece compatibilidad total con llamadas al sistema y es mucho más rápido para operaciones de disco."},

    # --- MOBILE & ANDROID INTERNALS ---
    {"text": "¿Qué es el proceso 'Zygote' en Android?", "option_a": "Un virus", "option_b": "Proceso base que ya tiene cargadas las librerías comunes y del cual nacen todas las nuevas aplicaciones", "option_c": "Un manual", "option_d": "Un tipo de pantalla", "correct_answer": "b", "difficulty": "hard", "explanation": "Acelera drásticamente el arranque de las aplicaciones al no tener que recargar todo desde cero cada vez."},
    {"text": "¿Qué es el 'ART' (Android Runtime)?", "option_a": "Un dibujo técnico", "option_b": "Entorno que traduce el código de la app a lenguaje máquina durante la instalación (AOT compilation)", "option_c": "Un virus de batería", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "hard", "explanation": "Sustituyó a Dalvik (que usaba traducción JIT) para mejorar el rendimiento y el consumo de batería."},

    # --- ADVANCED SHELL TOOLS ---
    {"text": "¿Qué hace el comando 'lscpu'?", "option_a": "Borra la CPU", "option_b": "Muestra información detallada sobre la arquitectura de la CPU (núcleos, hilos, cachés, banderas)", "option_c": "Un virus", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "easy", "explanation": "Es la forma más rápida de saber cuántos núcleos tiene un servidor Linux."},
    {"text": "¿Para qué sirve el comando 'timeout 10s ./mi_programa'?", "option_a": "Para medir el tiempo", "option_b": "Ejecuta un comando y lo mata automáticamente si no termina en el tiempo indicado (10 segundos)", "option_c": "Borra el programa", "option_d": "Un virus de red", "correct_answer": "b", "difficulty": "medium", "explanation": "Muy útil en scripts para evitar que un proceso colgado bloquee todo el flujo."},

    # --- FINAL MISC ---
    {"text": "¿Qué es un 'Hardened Kernel'?", "option_a": "Un núcleo duro", "option_b": "Un núcleo del sistema operativo compilado con parches de seguridad adicionales para resistir ataques externos", "option_c": "Un virus", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Ejemplos son el kernel de GRSecurity o el Hardened de Gentoo/Arch."},
    {"text": "¿Qué es 'Apt-get update'?", "option_a": "Actualizar los programas", "option_b": "Actualizar la lista de paquetes disponibles y sus versiones desde los repositorios", "option_c": "Instalar Windows", "option_d": "Borrar el PC", "correct_answer": "b", "difficulty": "easy", "explanation": "No instala nada, solo 'se informa' de qué novedades hay."},

    # --- WINDOWS TROUBLESHOOTING ---
    {"text": "¿Qué significa el código de error BSOD 'PAGE_FAULT_IN_NONPAGED_AREA'?", "option_a": "Que falta una página del libro", "option_b": "El sistema intentó acceder a memoria no válida que no puede ser movida al archivo de paginación", "option_c": "Un virus de red", "option_d": "Un error de impresora", "correct_answer": "b", "difficulty": "hard", "explanation": "Suele deberse a drivers defectuosos o memoria RAM física dañada."},
    {"text": "¿Qué es el 'WinRE' (Windows Recovery Environment)?", "option_a": "Un juego de Windows", "option_b": "Entorno de recuperación que permite reparar arranques fallidos o restaurar el sistema", "option_c": "Un virus", "option_d": "Un manual de red", "correct_answer": "b", "difficulty": "medium", "explanation": "Se accede tras varios fallos de arranque o mediante un USB de instalación."},
    {"text": "¿Para qué sirve el comando 'bootrec /fixmbr'?", "option_a": "Para borrar el disco", "option_b": "Intenta reparar el sector de arranque principal (MBR) de la partición del sistema", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "hard", "explanation": "Clásico comando de recuperación cuando Windows no arranca tras instalar otro SO."},

    # --- LINUX TROUBLESHOOTING ---
    {"text": "¿Qué es un 'Kernel Panic'?", "option_a": "Que el kernel tiene miedo", "option_b": "Error crítico e irrecuperable del kernel de Linux que detiene todo el sistema", "option_c": "Un virus de red", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "medium", "explanation": "Es el equivalente al pantallazo azul (BSOD) de Windows."},
    {"text": "¿Dónde se suelen guardar los logs principales del sistema en Linux?", "option_a": "/etc/logs", "option_b": "/var/log", "option_c": "/home/user/logs", "option_d": "/bin/log", "correct_answer": "b", "difficulty": "easy", "explanation": "Dentro de /var/log verás archivos como syslog, auth.log o dmesg."},

    # --- ADVANCED SHELL (PARAMETER EXPANSION) ---
    {"text": "En Bash, ¿qué hace '${VAR,,}'?", "option_a": "Borra la variable", "option_b": "Convierte todo el contenido de la variable a minúsculas", "option_c": "Multiplica la variable", "option_d": "Un virus", "correct_answer": "b", "difficulty": "hard", "explanation": "Introducido en Bash 4 para manipular texto fácilmente en scripts."},
    {"text": "¿Qué hace '${VAR^^}' en un script de Bash?", "option_a": "Borra la variable", "option_b": "Convierte todo el contenido de la variable a mayúsculas", "option_c": "Un error de sistema", "option_d": "Un manual", "correct_answer": "b", "difficulty": "hard", "explanation": "Ideal para normalizar entradas de usuario ('SI', 'si', 'Si')."},

    # --- HARDWARE & IRQL ---
    {"text": "¿Qué es el IRQL (Interrupt Request Level) en Windows?", "option_a": "Un nivel de juego", "option_b": "Prioridad asignada a una interrupción; impide que interrupciones de menor nivel paren a las de mayor", "option_c": "Un virus de CPU", "option_d": "Un tipo de cable", "correct_answer": "b", "difficulty": "hard", "explanation": "Crucial para los desarrolladores de drivers para evitar bloqueos del sistema."},
    {"text": "¿Qué es el 'DPC' (Deferred Procedure Call)?", "option_a": "Una llamada telefónica tarde", "option_b": "Tarea de alta prioridad que se pospone para ejecutarse justo después de una interrupción", "option_c": "Un virus", "option_d": "Un error de red", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite que el manejador de interrupciones termine rápido y el trabajo pesado se haga un poco después."},

    # --- WINDOWS REGISTRY DEEP ---
    {"text": "¿Qué guarda la rama HKEY_USERS (HKU) del registro?", "option_a": "Fotos de los usuarios", "option_b": "Configuraciones individuales de todos los perfiles de usuario cargados en el sistema", "option_c": "Un virus de red", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "HKEY_CURRENT_USER es realmente un enlace a una de las sub-ramas de HKU."},
    {"text": "¿Qué es la rama HKEY_CURRENT_CONFIG (HKCC)?", "option_a": "La configuración de hoy", "option_b": "Información sobre el perfil de hardware que se está usando en el arranque actual", "option_c": "Un virus de BIOS", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "medium", "explanation": "Enlace a datos dentro de HKEY_LOCAL_MACHINE\\System\\CurrentControlSet."},

    # --- FILE SYSTEMS (MODERN) ---
    {"text": "¿Qué es exFAT?", "option_a": "Un formato para gente muy gorda", "option_b": "Sistema de archivos optimizado para memorias flash de gran capacidad y compatible con Windows/Mac/Linux", "option_c": "Un virus de disco", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Elimina el límite de 4GB por archivo de FAT32 sin la complejidad de NTFS."},
    {"text": "¿Qué es el APFS (Apple File System)?", "option_a": "Un error de Apple", "option_b": "Sistema de archivos moderno de Apple diseñado para SSD y con cifrado fuerte", "option_c": "Un tipo de cable", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "Sustituyó al antiguo HFS+ en ordenadores, iPhones y iPads."},

    # --- DOCKER & VIRTUALIZATION ---
    {"text": "¿Qué es una 'Capa' (Layer) en una imagen de Docker?", "option_a": "Un trozo de tarta", "option_b": "Cambio de solo lectura en el sistema de archivos que se suma a la capa anterior", "option_c": "Un virus de red", "option_d": "Un error de RAM", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite que varias imágenes compartan las mismas capas base, ahorrando mucho espacio en disco."},
    {"text": "¿Qué es el 'OverlayFS'?", "option_a": "Un sistema de archivos para avionetas", "option_b": "Sistema de archivos de unión que permite combinar varias carpetas en una sola vista (muy usado por Docker)", "option_c": "Un virus de disco", "option_d": "Un manual", "correct_answer": "b", "difficulty": "hard", "explanation": "Permite que el contenedor escriba cambios sin modificar la imagen base original."},

    # --- SECURITY FRAMEWORKS ---
    {"text": "¿Qué es AppArmor?", "option_a": "Una armadura para apps", "option_b": "Módulo de seguridad de Linux que limita las capacidades de los programas mediante perfiles", "option_c": "Un virus", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "hard", "explanation": "Preinstalado en Ubuntu y Debian; evita que un programa acceda a archivos que no debería."},
    {"text": "¿Qué es 'Seccomp' en Linux?", "option_a": "Seguridad de componentes", "option_b": "Secure Computing mode: permite restringir las llamadas al sistema (syscalls) que un proceso puede hacer", "option_c": "Un virus de red", "option_d": "Un error de kernel", "correct_answer": "b", "difficulty": "hard", "explanation": "Fundamental para la seguridad de los contenedores modernos."},

    # --- MODERN OS FEATURES ---
    {"text": "¿Qué es el 'Fast Startup' (Inicio rápido) en Windows?", "option_a": "Arrancar corriendo", "option_b": "Técnica que guarda el estado del kernel en el disco al apagar para cargar más rápido después", "option_c": "Un virus de batería", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "medium", "explanation": "Es una mezcla entre apagado normal e hibernación del núcleo."},
    {"text": "¿Qué es el 'Hybrid Sleep'?", "option_a": "Dormir de pie", "option_b": "Guarda los datos en RAM y disco a la vez; si se va la luz, los datos siguen en el disco", "option_c": "Un virus de red", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "medium", "explanation": "Combina la rapidez del Suspend con la seguridad del Hibernate."},

    # --- KERNEL RELEASES ---
    {"text": "¿Qué significa que una versión de Linux es 'LTS' (Long Term Support)?", "option_a": "Que dura muchos años", "option_b": "Versión que recibirá actualizaciones de seguridad por un periodo largo (normalmente 5 años)", "option_c": "Versión para teléfonos", "option_d": "Un virus de kernel", "correct_answer": "b", "difficulty": "easy", "explanation": "Ideal para servidores donde no quieres cambios bruscos, solo estabilidad."},
    {"text": "¿Qué es el 'Mainline Kernel' de Linux?", "option_a": "El kernel de Microsoft", "option_b": "La versión de desarrollo más actual mantenida directamente por Linus Torvalds", "option_c": "Un virus", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "medium", "explanation": "Contiene las últimas características pero puede ser menos estable que las versiones LTS."},

    # --- POWERSHELL EXECUTION ---
    {"text": "¿Para qué sirve la 'Execution Policy' en PowerShell?", "option_a": "Para multar a la gente", "option_b": "Determina bajo qué condiciones PowerShell carga archivos de configuración y ejecuta scripts", "option_c": "Un virus de red", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "medium", "explanation": "Políticas como 'Restricted' o 'RemoteSigned' ayudan a evitar la ejecución de scripts maliciosos."},

    # --- LINUX INFO ---
    {"text": "¿Qué comando Linux muestra el nombre del host actual?", "option_a": "whoami", "option_b": "hostname", "option_c": "my_name", "option_d": "host info", "correct_answer": "b", "difficulty": "easy", "explanation": "Hostname muestra el nombre de red del equipo."},
    {"text": "¿Qué información suele dar el comando 'lsb_release -a'?", "option_a": "Información sobre discos", "option_b": "Detalles sobre la distribución Linux instalada (nombre, versión, apodo)", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "easy", "explanation": "Ejemplo: Ubuntu 22.04.1 LTS Jammy."},

    # --- FINAL WRAP UP ---
    {"text": "¿Qué es el 'Dynamic RAM' (DRAM)?", "option_a": "RAM muy movida", "option_b": "Tipo de memoria que necesita ser refrescada miles de veces por segundo para no perder los datos", "option_c": "Un error de BIOS", "option_d": "Un virus de disco", "correct_answer": "b", "difficulty": "hard", "explanation": "Es el tipo de RAM más común por ser más barata y densa que la SRAM (estática)."},
    {"text": "¿Qué es el 'Northbridge' en una placa base antigua?", "option_a": "Un puente del norte", "option_b": "Chip que gestionaba la comunicación entre la CPU, la RAM y la tarjeta gráfica", "option_c": "Un virus de red", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "medium", "explanation": "En las CPUs modernas, estas funciones están integradas dentro del propio procesador."},

    # --- FINAL BATCH TO REACH 300 ---
    {"text": "¿Qué hace el comando 'chkdsk' en Windows?", "option_a": "Para ver el disco", "option_b": "Verifica la integridad del sistema de archivos y repara errores lógicos en el disco", "option_c": "Un virus de red", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Es la versión Windows del 'fsck' de Linux."},
    {"text": "¿Para qué sirve el comando 'id' en Linux?", "option_a": "Para identificarse", "option_b": "Muestra los IDs de usuario (UID) y de grupo (GID) del usuario actual", "option_c": "Un virus", "option_d": "Un manual de red", "correct_answer": "b", "difficulty": "easy", "explanation": "Útil para saber a qué grupos perteneces y qué permisos tienes."},
    {"text": "¿Qué hace el comando 'groups'?", "option_a": "Crea grupos", "option_b": "Muestra los grupos a los que pertenece el usuario actual", "option_c": "Borra grupos", "option_d": "Un virus de red", "correct_answer": "b", "difficulty": "easy", "explanation": "Forma rápida de ver tu membresía de grupo."},
    {"text": "¿Qué muestra el comando 'w' en una terminal Linux?", "option_a": "La letra W", "option_b": "Quién está conectado al sistema y qué está haciendo en ese momento", "option_c": "Un error de red", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Es más detallado que el comando 'who'."},
    {"text": "¿Para qué sirve el comando 'last'?", "option_a": "Para ir los últimos", "option_b": "Muestra un listado de los últimos usuarios que han iniciado sesión en el sistema", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "medium", "explanation": "Lee el archivo /var/log/wtmp para dar esta información."},
    {"text": "¿Qué diferencia hay entre 'ifconfig' e 'ip addr'?", "option_a": "Ninguna", "option_b": "'ifconfig' es la herramienta antigua (depreciada) e 'ip addr' es la moderna del paquete iproute2", "option_c": "'ip addr' solo funciona en Windows", "option_d": "Un virus", "correct_answer": "b", "difficulty": "medium", "explanation": "Se recomienda usar siempre la familia de comandos 'ip' hoy en día."},
    {"text": "¿Qué hace el comando 'ip route show'?", "option_a": "Muestra la ruta a mi casa", "option_b": "Muestra la tabla de enrutamiento del sistema (por dónde salen los paquetes)", "option_c": "Un virus de red", "option_d": "Un error de BIOS", "correct_answer": "b", "difficulty": "medium", "explanation": "Equivale al antiguo comando 'route -n'."},
    {"text": "¿Qué es el comando 'TRIM' en los SSD?", "option_a": "Cortar el disco", "option_b": "Permite al SO avisar al SSD qué bloques de datos ya no se usan para que el disco los limpie internamente", "option_c": "Un virus de archivos", "option_d": "Un error de RAM", "correct_answer": "b", "difficulty": "hard", "explanation": "Mantiene la velocidad del SSD a largo plazo y alarga su vida útil."},
    {"text": "¿Qué es el 'BitLocker'?", "option_a": "Un virus de 1 bit", "option_b": "Herramienta de cifrado de disco completo integrada en las versiones profesionales de Windows", "option_c": "Un manual de ayuda", "option_d": "Un tipo de monitor", "correct_answer": "b", "difficulty": "easy", "explanation": "Protege tus datos si alguien roba tu portátil o disco duro."},
    {"text": "¿Qué es el 'FileVault'?", "option_a": "Una bóveda de archivos", "option_b": "Sistema de cifrado de disco completo nativo de macOS", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "easy", "explanation": "Equivalente al BitLocker de Windows para ordenadores Apple."},
    {"text": "¿Qué es el 'S3' en servicios cloud (como AWS)?", "option_a": "Un tipo de cable", "option_b": "Servicio de almacenamiento de objetos altamente escalable y duradero", "option_c": "Un virus de red", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "medium", "explanation": "Simple Storage Service; ideal para guardar archivos, fotos y backups."},
    {"text": "¿Qué es un 'EBS Volume' en la nube?", "option_a": "Un volumen de música", "option_b": "Disco duro virtual (almacenamiento de bloques) que se conecta a una instancia (VM)", "option_c": "Un virus de disco", "option_d": "Un error de red", "correct_answer": "b", "difficulty": "medium", "explanation": "Elastic Block Store; es el 'disco C:' o 'disco secundario' de tu servidor en la nube."},
    {"text": "¿Qué significa que el código de salida de un comando sea '0'?", "option_a": "Que ha fallado", "option_b": "Que se ha ejecutado correctamente (Success)", "option_c": "Que no ha hecho nada", "option_d": "Un virus", "correct_answer": "b", "difficulty": "easy", "explanation": "Cualquier valor distinto de 0 suele indicar algún tipo de error."},
    {"text": "¿Qué suele significar un código de salida '127' en Linux?", "option_a": "Éxito total", "option_b": "Comando no encontrado (Command not found)", "option_c": "Permiso denegado", "option_d": "Un virus", "correct_answer": "b", "difficulty": "hard", "explanation": "Ocurre cuando intentas ejecutar algo que no está en el PATH o no existe."},
    {"text": "¿Qué es el 'Legacy BIOS'?", "option_a": "La BIOS del futuro", "option_b": "Modo de arranque antiguo que no soporta las características modernas de UEFI", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "medium", "explanation": "Muchas placas base modernas permiten activarlo (CSM) para compatibilidad con sistemas viejos."},
    {"text": "¿Qué es la 'NVRAM' en el contexto del arranque?", "option_a": "RAM de video", "option_b": "Memoria no volátil que guarda la configuración de la BIOS/UEFI, como el orden de arranque", "option_c": "Un virus de disco", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "hard", "explanation": "Non-Volatile RAM; no se borra al apagar el PC."},
    {"text": "¿Para qué sirve el comando 'df -T'?", "option_a": "Para ver el tiempo", "option_b": "Muestra el espacio en disco incluyendo el tipo de sistema de archivos de cada partición", "option_c": "Un virus", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Te dirá si una partición es ext4, xfs, vfat, etc."},
    {"text": "¿Qué hace el comando 'du -sh *'?", "option_a": "Borra todo", "option_b": "Muestra el tamaño total de cada archivo y carpeta en el directorio actual en formato legible", "option_c": "Un virus de red", "option_d": "Un error de sistema", "correct_answer": "b", "difficulty": "medium", "explanation": "Disk Usage - Summary - Human readable."},
    {"text": "¿Qué es el 'Overclocking'?", "option_a": "Limpiar el reloj", "option_b": "Aumentar la velocidad de reloj de un componente por encima de las especificaciones del fabricante", "option_c": "Un virus de CPU", "option_d": "Un modo de ahorro", "correct_answer": "b", "difficulty": "easy", "explanation": "Ganas rendimiento a cambio de más calor y posible inestabilidad."},
    {"text": "¿Qué es el 'Underclocking'?", "option_a": "Ir muy lento siempre", "option_b": "Reducir la velocidad de reloj para ahorrar energía y bajar la temperatura", "option_c": "Un virus de red", "option_d": "Un error de BIOS", "correct_answer": "b", "difficulty": "medium", "explanation": "Útil en portátiles o tablets para que la batería dure más."},
    {"text": "¿Qué es la 'SRAM' (Static RAM)?", "option_a": "RAM de seguridad", "option_b": "Memoria muy rápida y cara que no necesita refresco; se usa principalmente para la caché de la CPU", "option_c": "Un virus", "option_d": "Un tipo de disco", "correct_answer": "b", "difficulty": "hard", "explanation": "Es mucho más veloz que la DRAM pero ocupa mucho más espacio físico por cada bit."},
    {"text": "¿Qué es un 'Deadlock'?", "option_a": "Un candado roto", "option_b": "Situación donde dos procesos se bloquean mutuamente esperando recursos que el otro tiene (interbloqueo)", "option_c": "Un virus de red", "option_d": "Un manual de ayuda", "correct_answer": "b", "difficulty": "medium", "explanation": "Es uno de los problemas clásicos de la concurrencia en sistemas operativos."},
    {"text": "¿Qué es el 'Southbridge'?", "option_a": "Un puente del sur", "option_b": "Chip que gestiona los periféricos más lentos como USB, audio, SATA y red lenta", "option_c": "Un virus de placa base", "option_d": "Un manual", "correct_answer": "b", "difficulty": "medium", "explanation": "Actualmente suele estar integrado en el PCH (Platform Controller Hub) de la placa base."},
]

if __name__ == "__main__":
    sync_subject_questions(SUBJECT, QUESTIONS + MORE_QUESTIONS)
