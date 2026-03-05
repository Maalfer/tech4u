import json
from sqlalchemy.orm import Session
from database import engine, SessionLocal, SkillLabExercise

exercises = [
    # --- Bases de Datos ---
    {
        "subject": "Bases de Datos",
        "sentence_template": "El lenguaje SQL se divide en varios sublenguajes. Utilizamos [BLANK] para crear o modificar la estructura de las tablas, y [BLANK] para insertar o actualizar datos reales en ellas.",
        "correct_answers": '["DDL", "DML"]',
        "distractors": '["DCL", "TCL", "HTML"]',
        "explanation": "DDL (Data Definition Language) gestiona la estructura (CREATE, ALTER, DROP), mientras que DML (Data Manipulation Language) maneja los datos dentro de las tablas (INSERT, UPDATE, DELETE).",
        "difficulty": "medium"
    },
    {
        "subject": "Bases de Datos",
        "sentence_template": "Para asegurar la integridad referencial, la clave [BLANK] de una tabla secundaria debe apuntar obligatoriamente a la clave [BLANK] (o única) de la tabla principal.",
        "correct_answers": '["foránea", "primaria"]',
        "distractors": '["candidata", "superclave", "índice"]',
        "explanation": "Las claves foráneas (Foreign Keys) garantizan que un valor existe en la tabla padre al referenciar su clave primaria (Primary Key).",
        "difficulty": "medium"
    },
    {
        "subject": "Bases de Datos",
        "sentence_template": "Las propiedades ACID de una transacción son: [BLANK], Consistencia, [BLANK] y Durabilidad.",
        "correct_answers": '["Atomicidad", "Aislamiento"]',
        "distractors": '["Anomalía", "Disponibilidad", "Actualización"]',
        "explanation": "ACID significa Atomicity (todo o nada), Consistency (estado válido), Isolation (concurrencia sin interferencias) y Durability (cambios permanentes).",
        "difficulty": "hard"
    },
    {
        "subject": "Bases de Datos",
        "sentence_template": "Para combinar registros de dos tablas basándose en una condición, usamos la cláusula [BLANK]. Si queremos retener todos los registros de la primera tabla aunque no haya coincidencias, usamos un [BLANK].",
        "correct_answers": '["JOIN", "LEFT JOIN"]',
        "distractors": '["UNION", "GROUP BY", "RIGHT JOIN"]',
        "explanation": "JOIN clásico (INNER JOIN) requiere coincidencia. LEFT JOIN preserva la tabla de la izquierda llenando con NULL donde no haya correspondencia en la derecha.",
        "difficulty": "medium"
    },
    {
        "subject": "Bases de Datos",
        "sentence_template": "En la normalización, la Primera Forma Normal (1FN) exige que todos los atributos sean [BLANK]. La Segunda Forma Normal (2FN) requiere además eliminar las dependencias parciales de la clave [BLANK].",
        "correct_answers": '["atómicos", "primaria"]',
        "distractors": '["compuestos", "foránea", "multivaluados"]',
        "explanation": "1FN impide atributos multivalorados (deben ser atómicos). 2FN exige que ningún atributo no clave dependa solo de una parte de una clave primaria compuesta.",
        "difficulty": "hard"
    },
    {
        "subject": "Bases de Datos",
        "sentence_template": "Para deshacer los cambios de una transacción no confirmada utilizamos la instrucción [BLANK], mientras que para confirmarlos y hacerlos permanentes usamos [BLANK].",
        "correct_answers": '["ROLLBACK", "COMMIT"]',
        "distractors": '["DROP", "REVOKE", "GRANT"]',
        "explanation": "COMMIT consolida la transacción. Si hay un error, ROLLBACK la revierte para mantener el estado inicial y la consistencia.",
        "difficulty": "easy"
    },
    {
        "subject": "Bases de Datos",
        "sentence_template": "El sistema gestor que almacena los datos en formato JSON y no requiere un esquema fijo se clasifica como una base de datos [BLANK], concretamente orientada a [BLANK].",
        "correct_answers": '["NoSQL", "documentos"]',
        "distractors": '["relacional", "grafos", "columnar"]',
        "explanation": "Motores como MongoDB son NoSQL orientados a documentos debido a su flexibilidad de esquema comparado con las tablas relacionales estrictas.",
        "difficulty": "medium"
    },
    {
        "subject": "Bases de Datos",
        "sentence_template": "La instrucción CREATE [BLANK] mejora drásticamente la velocidad de las consultas (SELECT) al crear una estructura de árbol, pero puede ralentizar las operaciones de [BLANK].",
        "correct_answers": '["INDEX", "escritura"]',
        "distractors": '["VIEW", "lectura", "TABLE"]',
        "explanation": "Los índices aceleran el acceso aleatorio, pero cada vez que insertas o actualizas (escritura), el motor debe recalcular el árbol, perdiendo rendimiento.",
        "difficulty": "medium"
    },
    {
        "subject": "Bases de Datos",
        "sentence_template": "Al diseñar un esquema conceptual, usamos diagramas de [BLANK]-Relación, donde los atributos clave de cada entidad se subrayan y los vínculos se representan mediante [BLANK].",
        "correct_answers": '["Entidad", "rombos"]',
        "distractors": '["Objeto", "rectángulos", "círculos"]',
        "explanation": "El Diagrama Entidad-Relación (DER) es el estándar. Las Entidades son rectángulos y las Relaciones son rombos.",
        "difficulty": "easy"
    },
    {
        "subject": "Bases de Datos",
        "sentence_template": "Para resumir información usamos funciones de [BLANK] como SUM o COUNT, y para filtrar los resultados de dichas agrupaciones es obligatorio utilizar la cláusula [BLANK] en lugar de WHERE.",
        "correct_answers": '["agregación", "HAVING"]',
        "distractors": '["texto", "ORDER BY", "GROUP BY"]',
        "explanation": "El WHERE filtra registros individuales antes de agrupar. Para filtrar grupos generados por agregación, se usa el condicional HAVING.",
        "difficulty": "medium"
    },

    # --- Redes ---
    {
        "subject": "Redes",
        "sentence_template": "En el modelo OSI, la capa de [BLANK] (la número 3) utiliza direcciones lógicas llamadas [BLANK] para enrutar los paquetes a nivel global.",
        "correct_answers": '["Red", "IP"]',
        "distractors": '["Enlace de datos", "MAC", "Transporte"]',
        "explanation": "La capa 3 es la de Red (Network layer). Se rige mediante el protocolo IP para definir rutas a través de múltiples nodos.",
        "difficulty": "medium"
    },
    {
        "subject": "Redes",
        "sentence_template": "El protocolo [BLANK] traduce dinámicamente direcciones IP en direcciones físicas [BLANK] dentro de la misma red local (LAN).",
        "correct_answers": '["ARP", "MAC"]',
        "distractors": '["DHCP", "DNS", "IPv6"]',
        "explanation": "Address Resolution Protocol (ARP) mapea una IP conocida de la subred a una dirección MAC desconocida para poder entregar la trama a nivel de enlace.",
        "difficulty": "hard"
    },
    {
        "subject": "Redes",
        "sentence_template": "A nivel de transporte, [BLANK] es un protocolo orientado a conexión que garantiza la entrega de paquetes, mientras que [BLANK] es más rápido pero no verifica si llegó la información.",
        "correct_answers": '["TCP", "UDP"]',
        "distractors": '["IP", "ICMP", "HTTP"]',
        "explanation": "TCP tiene acuse de recibo y retransmisión por diseño (fiable pero pesado). UDP simplemente inyecta datagramas muy rápido (streaming de video/juegos).",
        "difficulty": "easy"
    },
    {
        "subject": "Redes",
        "sentence_template": "Para que multitud de ordenadores internos puedan navegar por internet usando una única dirección pública contratada al operador, el router realiza una operación de [BLANK] llamada concretamente [BLANK] o PAT.",
        "correct_answers": '["NAT", "Overload"]',
        "distractors": '["VPN", "Switching", "Routing"]',
        "explanation": "El NAT Overload (o PAT, Port Address Translation) mapea una IP pública única mutando los números de puerto en la tabla NAT para devolver la respuesta al PC interno correcto.",
        "difficulty": "hard"
    },
    {
        "subject": "Redes",
        "sentence_template": "Las redes inalámbricas actúan bajo el estándar IEEE [BLANK], conocido comercialmente como [BLANK].",
        "correct_answers": '["802.11", "Wi-Fi"]',
        "distractors": '["802.3", "Bluetooth", "Ethernet"]',
        "explanation": "802.11 es la familia de estándares WLAN (b/g/n/ac/ax) creados por la IEEE. 802.3 es para redes cableadas Ethernet.",
        "difficulty": "easy"
    },
    {
        "subject": "Redes",
        "sentence_template": "Un dispositivo que opera en la capa 2 es el [BLANK]. Cuando recibe una trama, lee la MAC destino e inyecta la señal solo por un puerto específico consultando su tabla [BLANK].",
        "correct_answers": '["switch", "CAM"]',
        "distractors": '["hub", "router", "routing"]',
        "explanation": "Un switch no propaga por todos los puertos como un hub antiguo. Mantiene una tabla CAM (Content Addressable Memory) que vincula Puertos con MACs.",
        "difficulty": "medium"
    },
    {
        "subject": "Redes",
        "sentence_template": "El comando [BLANK] nos muestra la ruta completa de saltos de routers, enviando repetidos paquetes variando un campo específico llamado [BLANK].",
        "correct_answers": '["traceroute", "TTL"]',
        "distractors": '["ping", "MTU", "ipconfig"]',
        "explanation": "Traceroute (o tracert) manda paquetes ICMP/UDP subiendo el Time To Live (TTL) desde 1. Cuando el router descarta por TTL=0, responde con su identidad de salto.",
        "difficulty": "hard"
    },
    {
        "subject": "Redes",
        "sentence_template": "Al dividir una red IPv4 en subredes más pequeñas (Subnetting), estamos cogiendo bits prestados de la porción de [BLANK] para dárselos a la porción de [BLANK].",
        "correct_answers": '["host", "red"]',
        "distractors": '["red", "broadcast", "multicast"]',
        "explanation": "Aumentar los 1s en la máscara de subred reduce la cantidad de IPs disponibles para hosts, pero nos permite crear mayor número de redes independientes.",
        "difficulty": "medium"
    },
    {
        "subject": "Redes",
        "sentence_template": "El protocolo [BLANK] es el encargado de repartir direcciones IP automáticamente a nuevos clientes entrantes mediante la fase de cuatro pasos llamada DORA (Discover, [BLANK], Request, Ack).",
        "correct_answers": '["DHCP", "Offer"]',
        "distractors": '["DNS", "Observe", "Option"]',
        "explanation": "DHCP server funciona ofreciendo un Lease (Offer) a la petición de descubrimiento inicial (Discover) lanzada por el cliente mediante broadcast local.",
        "difficulty": "easy"
    },
    {
        "subject": "Redes",
        "sentence_template": "Para una transferencia segura de archivos bloqueando sniffers de texto plano, debemos sustituir FTP o Telnet por [BLANK], que funciona por el puerto [BLANK] de TCP.",
        "correct_answers": '["SFTP", "22"]',
        "distractors": '["TFTP", "21", "23"]',
        "explanation": "SFTP transmite a través del túnel seguro de SSH, que opera por defecto en el puerto TCP 22. FTP (21) y Telnet (23) envían información en claro.",
        "difficulty": "medium"
    },

    # --- Sistemas Operativos ---
    {
        "subject": "Sistemas Operativos",
        "sentence_template": "En GNU/Linux, todo el hardware y abstracciones del sistema se representan como un [BLANK]. Por convención, el primer disco SATA aparece montado como /dev/[BLANK].",
        "correct_answers": '["archivo", "sda"]',
        "distractors": '["proceso", "hda", "C:"]',
        "explanation": "En Linux \"todo es un archivo\". Los discos IDE/SATA modernos se mapean dentro de /dev usando la nomenclatura sdx (sda para el primer disco, sdb para el segundo, etc).",
        "difficulty": "medium"
    },
    {
        "subject": "Sistemas Operativos",
        "sentence_template": "El planificador del sistema operativo gestiona el estado de los [BLANK]. Cuando uno necesita acceso a disco, entra forzosamente en estado [BLANK] hasta que la operación de I/O finalice.",
        "correct_answers": '["procesos", "bloqueado"]',
        "distractors": '["hilos", "ejecución", "zombie"]',
        "explanation": "El scheduler retira el uso de la CPU a procesos que están esperando I/O, poniéndolos en Sleep/Bloqueado (Waiting state) para no malgastar ciclos de reloj.",
        "difficulty": "hard"
    },
    {
        "subject": "Sistemas Operativos",
        "sentence_template": "En Linux, utilizamos el comando [BLANK] para modificar los permisos rwx, y el comando [BLANK] para cambiar su propietario absoluto.",
        "correct_answers": '["chmod", "chown"]',
        "distractors": '["chgrp", "passwd", "sudo"]',
        "explanation": "chmod (Change Mode) modifica lectura/escritura/ejecución (rwx). chown (Change Owner) altera el usuario propietario del fichero.",
        "difficulty": "easy"
    },
    {
        "subject": "Sistemas Operativos",
        "sentence_template": "Un sistema operativo sufre de un interbloqueo o [BLANK] cuando dos procesos están esperando un recurso que está retenido mutuamente. Una solución habitual es forzar la terminación o [BLANK] de uno de ellos.",
        "correct_answers": '["deadlock", "kill"]',
        "distractors": '["thrashing", "swap", "fork"]',
        "explanation": "El deadlock (abrazo mortal) ocurre por la exclusión mutua circular. El kernel a veces debe intervenir mediante un OOM o killing (matando) uno para liberar el recurso.",
        "difficulty": "hard"
    },
    {
        "subject": "Sistemas Operativos",
        "sentence_template": "En Windows de tipo servidor, el servicio que centraliza la administración, políticas y autenticación de los miles de equipos domina la red bajo el nombre de [BLANK] Directory, y se comunica internamente mediante el protocolo [BLANK].",
        "correct_answers": '["Active", "LDAP"]',
        "distractors": '["Open", "SMB", "NTLM"]',
        "explanation": "Active Directory (AD) de Microsoft es un servicio de directorio masivo basado en el protocolo Lightweight Directory Access Protocol (LDAP).",
        "difficulty": "medium"
    },
    {
        "subject": "Sistemas Operativos",
        "sentence_template": "El componente central de un sistema operativo, la única pieza que corre en anillo 0 con control absoluto del hardware, se denomina [BLANK]. En Linux, está diseñado bajo el paradigma [BLANK], donde todos los drivers base viven en el mismo binario.",
        "correct_answers": '["Kernel", "monolítico"]',
        "distractors": '["Shell", "microkernel", "híbrido"]',
        "explanation": "El Kernel Linux, al contrario que Windows NT (Híbrido), es Monolítico. Alberga controladores y la pila de red altamente acoplados en su memoria base por temas de rendimiento extremo.",
        "difficulty": "hard"
    },
    {
        "subject": "Sistemas Operativos",
        "sentence_template": "Una ruta [BLANK] en Linux empieza siempre desde la barra (/). Por el contrario, una ruta [BLANK] depende íntegramente de en qué directorio estemos parados actualmente.",
        "correct_answers": '["absoluta", "relativa"]',
        "distractors": '["estática", "dinámica", "virtual"]',
        "explanation": "Las rutas absolutas (/etc/ssh/...) funcionan igual desde cualquier lugar. Las relativas (../logs/...) evalúan el salto en función del PWD (Print Working Directory).",
        "difficulty": "easy"
    },
    {
        "subject": "Sistemas Operativos",
        "sentence_template": "Cuando a un SO se le agota la memoria física (RAM), recurre forzosamente a un archivo o partición conocido como caché de [BLANK], provocando una drástica bajada de rendimiento conocida como [BLANK].",
        "correct_answers": '["Swap", "Thrashing"]',
        "distractors": '["Buffer", "Paging", "Spooling"]',
        "explanation": "El área de Swap/Paginación usa el disco duro. Si el sistema sobre-usa este intercambio, el SO dedica más tiempo a mover páginas que a procesar instrucciones (Thrashing/Hiperpaginación).",
        "difficulty": "medium"
    },
    {
        "subject": "Sistemas Operativos",
        "sentence_template": "El entorno de interfaz gráfica tradicional en los S.O de tipo Unix está orquestado por defecto a través del rígido sistema de ventanas [BLANK]11, que está siendo lentamente reemplazado por la arquitectura [BLANK].",
        "correct_answers": '["X", "Wayland"]',
        "distractors": '["Win", "KDE", "GNOME"]',
        "explanation": "X11 / X-Window ha dominado por décadas como el compositor maestro de GUI en Linux. Wayland es su protocolo sucesor para mayor modernidad, seguridad y frames.",
        "difficulty": "hard"
    },
    {
        "subject": "Sistemas Operativos",
        "sentence_template": "La jerarquía de carpetas FHS de Linux destina el directorio /var a archivos que [BLANK] constantemente y la carpeta /etc a archivos de [BLANK] a nivel de sistema.",
        "correct_answers": '["crecen", "configuración"]',
        "distractors": '["binarios", "usuarios", "permanecen"]',
        "explanation": "/var (Variables) contiene logs y bases de datos dinámicas. /etc (Etcetera) contiene los archivos estáticos de configuración en texto plano del host y servicios.",
        "difficulty": "medium"
    },

    # --- Fundamentos de Hardware ---
    {
        "subject": "Fundamentos de Hardware",
        "sentence_template": "La memoria [BLANK] (Read-Only) contiene el firmware base de la placa madre fundamental para arrancar, conocido coloquialmente como [BLANK] (o el más moderno UEFI).",
        "correct_answers": '["ROM", "BIOS"]',
        "distractors": '["RAM", "POST", "CMOS"]',
        "explanation": "La BIOS (Basic Input/Output System) tradicional o la UEFI residen en un chip de memoria no volátil en placa que despierta todo el chipset.",
        "difficulty": "easy"
    },
    {
        "subject": "Fundamentos de Hardware",
        "sentence_template": "Para comunicarse rápidamente con las memorias RAM, las CPUs modernas albergan una pequeña cantidad de memoria ultra rápida pegada al núcleo llamada caché [BLANK], dividida en nivel 1, nivel 2 y [BLANK].",
        "correct_answers": '["SRAM", "nivel 3"]',
        "distractors": '["DRAM", "nivel 4", "VRAM"]',
        "explanation": "La Static RAM (SRAM) es la que forma las cachés L1, L2 y L3 de la CPU. No requiere refrescos continuos como la DRAM, de ahí su velocidad extrema pero poca capacidad.",
        "difficulty": "medium"
    },
    {
        "subject": "Fundamentos de Hardware",
        "sentence_template": "Un disco de estado sólido [BLANK] carece de partes mecánicas basándose en celdas de memoria NAND Flash. Para la mayor velocidad hoy día, suelen conectarse mediante la interfaz de bus [BLANK] a puerto M.2.",
        "correct_answers": '["SSD", "PCIe / NVMe"]',
        "distractors": '["HDD", "SATA", "IDE"]',
        "explanation": "Los SSD NVMe sobre puertos M.2 utilizan las vías directas del PCI-Express en lugar del cuello de botella histórico del protocolo SATA diseñado para discos duros rotacionales.",
        "difficulty": "medium"
    },
    {
        "subject": "Fundamentos de Hardware",
        "sentence_template": "Dentro de una CPU tradicional, la [BLANK] ejecuta los cálculos matemáticos rudimentarios y lógicos (AND, OR), mientras que la Unidad de [BLANK] dicta la orquestación general de las instrucciones hacia los registros.",
        "correct_answers": '["ALU", "Control"]',
        "distractors": '["FPU", "Medida", "Bus"]',
        "explanation": "La Arithmetic Logic Unit (ALU) es el corazón de cómputo entero, y la Control Unit (CU) dirige el tráfico leyendo el contador de programa y orquestando el Data Path.",
        "difficulty": "hard"
    },
    {
        "subject": "Fundamentos de Hardware",
        "sentence_template": "Para disipar el intenso calor emitido por la CPU, se intercala una masilla térmica entre el IHS de silicio y la base de contacto del [BLANK], forzando luego el flujo térmico con un gran [BLANK].",
        "correct_answers": '["disipador", "ventilador"]',
        "distractors": '["chasis", "chipset", "socket"]',
        "explanation": "El disipador o radiador metálico (Heat sink) distribuye el calor por sus aletas, siendo barrido activamente por ventiladores PWM.",
        "difficulty": "easy"
    },
    {
        "subject": "Fundamentos de Hardware",
        "sentence_template": "El principal sistema de vías o canales trazados por toda la placa base para intercomunicar componentes se denomina de forma global el [BLANK]. Su [BLANK] (ancho) y frecuencia determinan el rendimiento total transferido.",
        "correct_answers": '["Bus", "tamaño"]',
        "distractors": '["Cableado", "puente", "clock"]',
        "explanation": "Los Buses (Bus Frontal / BSB, de datos, direcciones y control) son la espina dorsal. Su Bit-width (tamaño/ancho de bus) es clave para calcular MB/s.",
        "difficulty": "medium"
    },
    {
        "subject": "Fundamentos de Hardware",
        "sentence_template": "En la fuente de alimentación, la especificación principal es su potencia máxima total en [BLANK]. Adicionalmente, cuenta con certificaciones internacionales [BLANK] Plus que miden su eficiencia energética.",
        "correct_answers": '["Vatios (W)", "80"]',
        "distractors": '["Voltaje (V)", "90", "Amperios"]',
        "explanation": "Se escogen en Wattios (ej: 750W). El sello 80 Plus (Bronze, Gold, Titanium) confirma que al menos un 80% de la energía de la pared se convierte en corriente continua util sin perderse puramente en calor.",
        "difficulty": "hard"
    },
    {
        "subject": "Fundamentos de Hardware",
        "sentence_template": "Los pitidos que hace la BIOS al ser inicializada indican el resultado del chequeo de hardware obligatorio llamado [BLANK]. Si falla o se queda frita por una actualización cortada, a la placa se dice que está [BLANK].",
        "correct_answers": '["POST", "brickeada"]',
        "distractors": '["BOOT", "rooteada", "quedada"]',
        "explanation": "Power-On Self-Test (POST) verifica RAM/CPU/VGA. Bricked (Ladrillo) es la jerga para referirse a un dispositivo o hardware inhabilitado por una BIOS o firmware corrupto irreversible por métodos comunes.",
        "difficulty": "hard"
    },
    {
        "subject": "Fundamentos de Hardware",
        "sentence_template": "Las especificaciones de forma física en placas bases y chasis, dictando el posicionamiento de tornillos y tamaño total, se denomina Factor de [BLANK]. El formato estándar de torre mediada hoy día es el [BLANK].",
        "correct_answers": '["Forma", "ATX"]',
        "distractors": '["Medida", "ITX", "Torre"]',
        "explanation": "El Form Factor (Factor de Forma) asegura la compatibilidad cruzada de piezas. ATX, creado por Intel hace mucho, es de 305 × 244 mm y reina el mercado desktop actual.",
        "difficulty": "medium"
    },
    {
        "subject": "Fundamentos de Hardware",
        "sentence_template": "La arquitectura x86 original, utilizada por Intel y AMD en casi todos los ordenadores portátiles y de escritorio (a diferencia de ARM) forma parte de la familia de procesamiento de diseño complejo conocida por las siglas [BLANK], en contraposición al diseño simple de teléfonos llamado [BLANK].",
        "correct_answers": '["CISC", "RISC"]',
        "distractors": '["CPU", "MIPS", "SPARC"]',
        "explanation": "Complex Instruction Set Computer (CISC) manejan instrucciones pesadas que ejecutan muchos ciclos. Reduced Instruction Set Computer (RISC, como ARM o M1) prioriza rapidez eléctrica con más lineas de código en bajo nivel.",
        "difficulty": "hard"
    },

    # --- Lenguaje de Marcas ---
    {
        "subject": "Lenguaje de Marcas",
        "sentence_template": "Un documento genérico XML requiere de la pareja de inicio y fin de etiquetas. Si no posee formato pero tiene una estructura y anidación sintáctica perfecta dictada por la W3C, se dice que es un documento bien [BLANK]. La validación contra un diccionario se hace vía archivo [BLANK].",
        "correct_answers": '["formado", "DTD o XSD"]',
        "distractors": '["formateado", "CSS", "JSON"]',
        "explanation": "Well-Formedness en XML significa que no hay errores de pares/brackets. La validez semántica estricta del vocabulario interno es probada inyectando un Document Type Definition (DTD) o XML Schema (XSD).",
        "difficulty": "hard"
    },
    {
        "subject": "Lenguaje de Marcas",
        "sentence_template": "En HTML5, el atributo semántico fundamental para agrupar un macro-contenedor secundario (como una barra lateral de widgets) que no aporta al texto principal de un blog es el tag llamado [BLANK], muy distinto al bloque invisible viejo llamado [BLANK].",
        "correct_answers": '["<aside>", "<div>"]',
        "distractors": '["<section>", "<span>", "<sidebar>"]',
        "explanation": "HTML5 trajo semanticidad (<article>, <aside>, <nav>, etc) relegando a <div> para lo extrictamente estético cuando nada más cuadra. <aside> se usa para contenido lateralmente derivado del core.",
        "difficulty": "medium"
    },
    {
        "subject": "Lenguaje de Marcas",
        "sentence_template": "Para formatear texto e intercambiar bases o configuraciones en formato de clave:valor entre sistemas de un modo moderno y ligero, la tecnología serializada [BLANK] es la más extendida y usa la sintaxis básica derivada del lenguaje [BLANK].",
        "correct_answers": '["JSON", "JavaScript"]',
        "distractors": '["YAML", "Python", "XML"]',
        "explanation": "JavaScript Object Notation (JSON) ha desplazado a XML como peso pluma para el intercambio de información entre APIs en la era web moderna, siendo básicamente un parseo nativo de Objetos JS.",
        "difficulty": "easy"
    },
    {
        "subject": "Lenguaje de Marcas",
        "sentence_template": "En las hojas de estilo en cascada (CSS), modificar el parámetro de propiedad espacial interna del modelo de caja alejando el contenido de sus bordes se denomina [BLANK], y alejar esa misma caja físicamente empujando a otra contigua es [BLANK].",
        "correct_answers": '["padding", "margin"]',
        "distractors": '["border", "outline", "spacing"]',
        "explanation": "El padding ejerce un margen interno expandiendo la coraza de la caja. El margin es espacio muerto e invisible entre las fronteras limitantes de distintas capas contenedoras en el flow del renderizado.",
        "difficulty": "easy"
    },
    {
        "subject": "Lenguaje de Marcas",
        "sentence_template": "Dentro de un feed/RSS para sindicación de blogs moderno es habitual utilizar el formato derivado de XML y promulgado duramente allá por 2005 por su sencillez llamado [BLANK]. Todo feed precisa siempre los parámetros básicos link e [BLANK].",
        "correct_answers": '["Atom", "id"]',
        "distractors": '["SOAP", "title", "REST"]',
        "explanation": "El estándar web RFC4287 define estandar Atom Syndication como evolución más estricta de RSS. El nodo entry debe poseer title, updated, link además de ID universal inamovible.",
        "difficulty": "hard"
    },
    {
        "subject": "Lenguaje de Marcas",
        "sentence_template": "En la creación de hipervínculos, poner el atributo nativo [BLANK]=\"_blank\" al interior de la directiva de la letra a forzará la apertura del archivo de destino en una pestaña de navegador totalmente [BLANK].",
        "correct_answers": '["target", "nueva"]',
        "distractors": '["href", "misma", "src"]',
        "explanation": "La propiedad target manipula el frame handling base (blank para tab nuevo, parent o self para recargo de red local). href alberga la uri pura conectiva.",
        "difficulty": "medium"
    },
    {
        "subject": "Lenguaje de Marcas",
        "sentence_template": "Cuando transformamos ficheros grandes de hoja de estilo XML en otra diferente de salida amigable de vista a un agente usuario normal interviene la hoja puramente matemática y condicional de familia W3C conocida bajo las iniciales de [BLANK], que funciona parseando el árbol semántico [BLANK].",
        "correct_answers": '["XSLT", "DOM"]',
        "distractors": '["XPATH", "XQUERY", "JSON"]',
        "explanation": "XSL Transformations. Usa iteraciones for-each, choose y templates contra el Document Object Model original logrando outputs que a menudo son HTML/CSS finales sin servidor en-medio.",
        "difficulty": "hard"
    },
    {
        "subject": "Lenguaje de Marcas",
        "sentence_template": "XPath se usa para direccionar rutas precisas en archivos grandes anidados. Para buscar un nodo subyacente obviando todos los pasos intermedios el símbolo o comodín especial a añadir es la [BLANK] doble y la posición 1 base del primer elemento se designa con [BLANK].",
        "correct_answers": '["barra", "[1]"]',
        "distractors": '["estrella", "[0]", "hash"]',
        "explanation": "// selecciona descendants directos desde root de origen obviando el salto jerárquico. XML e XPath por defecto usan convenciones posicionales 1-indexed /nodo/hijo[1] a la vieja usanza a diferencia del resto de arrays formales de la industria tech base indexados 0.",
        "difficulty": "medium"
    },
    {
        "subject": "Lenguaje de Marcas",
        "sentence_template": "Para dar un comportamiento responsive drástico en CSS usamos [BLANK] Queries que escuchan eventos de resoluciones activando clases sólo a determinados anchos. En frameworks nuevos, en vez de fijar floats rígidos ahora se prefiere display: [BLANK].",
        "correct_answers": '["Media", "flex"]',
        "distractors": '["Screen", "grid", "Data"]',
        "explanation": "Media Queries son el núcleo del paradigma adaptativo del viewport (@media min-width). El módulo Flexbox ha simplificado infinitamente el centering frente a viejos clears con inline-blocks.",
        "difficulty": "medium"
    },
    {
        "subject": "Lenguaje de Marcas",
        "sentence_template": "El lenguaje simplificado usado asiduamente en Readme's de repositorios de Github con almohadillas u asteriscos para renderizar formatos en preprocesadores directos omitiendo lo denso de HTML es el [BLANK]. Fue diseñado primigeniamente por creadores natos de portales de foro y John [BLANK].",
        "correct_answers": '["Markdown", "Gruber"]',
        "distractors": '["Textile", "Berners-Lee", "AsciiDoc"]',
        "explanation": "Markdown (.md) fue cocreado por John Gruber buscando ligereza a la hora de escribir sintaxis que pase automáticamente al clásico <h1> y <strong> renderizable por frameworks puros orientados a webs de noticias.",
        "difficulty": "hard"
    }
]

def seed_db():
    print("Iniciando la inserción de datos de laboratorios de Skill Labs...")
    db: Session = SessionLocal()
    
    count = 0
    try:
        for ex in exercises:
            # Check if an exercise with same sentence exists to avoid duplicates
            existing = db.query(SkillLabExercise).filter_by(sentence_template=ex["sentence_template"]).first()
            if not existing:
                new_ex = SkillLabExercise(**ex)
                db.add(new_ex)
                count += 1
                
        db.commit()
        print(f"Éxito: Se han añadido {count} ejercicios nuevos al sistema.")
    except Exception as e:
        db.rollback()
        print(f"Ocurrió un error al seedear: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
