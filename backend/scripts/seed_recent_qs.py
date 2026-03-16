import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Configuración de base de datos
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tech4u.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from database import Question

bd_questions = [
    {
        "subject": "Bases de Datos",
        "text": "¿Cuál de estos no es un tipo de campo en ficheros?",
        "options": ["Numérico", "Alfanumérico", "Jerárquico", "Lógico"],
        "correct": "Jerárquico"
    },
    {
        "subject": "Bases de Datos",
        "text": "¿Qué modo de acceso a un fichero exige leer los registros uno tras otro en el orden en que se grabaron?",
        "options": ["Secuencial", "Directo (relativo)", "Indexado", "Aleatorio"],
        "correct": "Secuencial"
    },
    {
        "subject": "Bases de Datos",
        "text": "Un Sistema Gestor de Base de Datos (SGBD):",
        "options": [
            "Realiza la función de interfaz entre el usuario, la propia base de datos, y las aplicaciones que trabajan con ella.",
            "Está compuesta por tablas y ficheros.",
            "Es un conjunto de tablas o entidades.",
            "Es únicamente un servidor web para páginas estáticas."
        ],
        "correct": "Realiza la función de interfaz entre el usuario, la propia base de datos, y las aplicaciones que trabajan con ella."
    },
    {
        "subject": "Bases de Datos",
        "text": "Un campo de tipo alfanumérico:",
        "options": [
            "Pueden contener caracteres numéricos no susceptibles de realizar operaciones aritméticas con ellos, caracteres alfabéticos (letras) y caracteres especiales.",
            "Pueden contener caracteres numéricos susceptibles de realizar operaciones aritméticas con ellos, caracteres alfabéticos (letras) y caracteres especiales.",
            "Contienen únicamente caracteres alfabéticos.",
            "Solo puede almacenar números enteros y decimales."
        ],
        "correct": "Pueden contener caracteres numéricos no susceptibles de realizar operaciones aritméticas con ellos, caracteres alfabéticos (letras) y caracteres especiales."
    },
    {
        "subject": "Bases de Datos",
        "text": "Los elementos más importantes de una base de datos son:",
        "options": ["Las columnas.", "Las tablas.", "Las filas.", "Los índices."],
        "correct": "Las tablas."
    },
    {
        "subject": "Bases de Datos",
        "text": "¿Cuál es la definición correcta de una transacción en un SGBD?",
        "options": [
            "Conjunto de sentencias SQL que se ejecutan como una unidad atómica y mantienen las propiedades ACID.",
            "Secuencia de operaciones de copia de seguridad de la base de datos.",
            "Programa externo que gestiona y planifica tareas (jobs).",
            "La instalación física del motor de base de datos."
        ],
        "correct": "Conjunto de sentencias SQL que se ejecutan como una unidad atómica y mantienen las propiedades ACID."
    },
    {
        "subject": "Bases de Datos",
        "text": "Una base de datos relacional:",
        "options": [
            "Permite constituir vínculos de información a través de la unión de tablas, favoreciendo de este modo la consecución de estadísticas derivadas de la relación entre una gran cantidad de datos.",
            "Es aquella que está conformada por un conjunto de registros conectados y relacionados entre sí a través de enlaces en una red.",
            "Es aquella en la que se almacena la información utilizando una estructura de árbol, donde se relacionan los registros (filas) de tal modo que un nodo padre puede tener varios nodos hijo.",
            "Es un documento de texto plano sin esquema definido."
        ],
        "correct": "Permite constituir vínculos de información a través de la unión de tablas, favoreciendo de este modo la consecución de estadísticas derivadas de la relación entre una gran cantidad de datos."
    },
    {
        "subject": "Bases de Datos",
        "text": "¿Cuál de los siguientes no es un componente típico de un SGBD?",
        "options": ["Optimizador de consultas.", "Gestor de transacciones.", "Navegador web.", "Gestor de almacenamiento."],
        "correct": "Navegador web."
    },
    {
        "subject": "Bases de Datos",
        "text": "¿Cómo se clasifican los SGBD según el número de usuarios que pueden acceder de forma concurrente?",
        "options": ["Monousuario y multiusuario.", "Centralizados y distribuidos.", "Propietarios y no propietarios.", "Relacionales y NoSQL."],
        "correct": "Monousuario y multiusuario."
    },
    {
        "subject": "Bases de Datos",
        "text": "Una tabla es:",
        "options": [
            "Un conjunto de filas que, a su vez, constan de una o más columnas.",
            "Un conjunto de columnas referentes a una misma entidad.",
            "Cada uno de los campos referentes a una misma entidad.",
            "Una relación lógica entre dos entidades foráneas."
        ],
        "correct": "Un conjunto de filas que, a su vez, constan de una o más columnas."
    },
    {
        "subject": "Bases de Datos",
        "text": "Una entidad asociativa es:",
        "options": [
            "Una entidad que surge para resolver relaciones muchos-a-muchos entre otras entidades.",
            "Una entidad que solo tiene atributos propios y no se relaciona con otras.",
            "Una entidad que agrupa los atributos más comunes entre varias subentidades.",
            "Una clave primaria autoincremental."
        ],
        "correct": "Una entidad que surge para resolver relaciones muchos-a-muchos entre otras entidades."
    },
    {
        "subject": "Bases de Datos",
        "text": "Un determinante es:",
        "options": [
            "El subconjunto más pequeño de atributos perteneciente a una superclave que prevalece como identificador único.",
            "Aquel atributo del cual depende funcionalmente otro atributo.",
            "Una sentencia donde dos o más atributos son independientes unos de otros.",
            "Una clave ajena que no puede ser nula."
        ],
        "correct": "Aquel atributo del cual depende funcionalmente otro atributo."
    },
    {
        "subject": "Bases de Datos",
        "text": "Una clave foránea es:",
        "options": [
            "La utilizada para referirse a un registro único en otra tabla (utilizando la clave primaria de esa otra tabla).",
            "Una columna o un conjunto de columnas cuyos valores identifican de forma exclusiva una fila de la tabla.",
            "Una relación que contiene valores para cada uno de los atributos (equivale a los registros).",
            "Un ídice único que acelera las consultas de filtrado."
        ],
        "correct": "La utilizada para referirse a un registro único en otra tabla (utilizando la clave primaria de esa otra tabla)."
    },
    {
        "subject": "Bases de Datos",
        "text": "La normalización es:",
        "options": [
            "La transformación de las vistas de usuario complejas y del almacén de datos a un juego de estructuras de datos más pequeñas y estables.",
            "Un elemento dentro de una tabla que permite identificar de manera única una entidad de un conjunto de entidades.",
            "La relación que existe entre distintos atributos en el mundo real recogidas en el modelo lógico de la base de datos.",
            "El proceso de hacer copias de seguridad incrementales."
        ],
        "correct": "La transformación de las vistas de usuario complejas y del almacén de datos a un juego de estructuras de datos más pequeñas y estables."
    },
    {
        "subject": "Bases de Datos",
        "text": "Una tupla:",
        "options": [
            "Cada una de las filas de una tabla o una relación que comprende valores para cada uno de los atributos.",
            "Campo de valor único para cada registro de una misma tabla.",
            "Cada una de las columnas de una tabla o una relación que comprende valores para cada uno de los atributos.",
            "Una conexión de red entre el gestor y el cliente."
        ],
        "correct": "Cada una de las filas de una tabla o una relación que comprende valores para cada uno de los atributos."
    },
    {
        "subject": "Bases de Datos",
        "text": "Modelo entidad relación (ERD) es:",
        "options": [
            "Un diagrama de flujo a partir del cual se representa la manera en la que las entidades (tablas y/o vistas), objetos y conceptos se relacionan entre sí dentro de un sistema.",
            "Una sucesión de caracteres utilizada para nombrar un objeto.",
            "Un conjunto de filas que, a su vez, están relacionadas con una o más columnas.",
            "Un script SQL que genera esquemas automáticamente."
        ],
        "correct": "Un diagrama de flujo a partir del cual se representa la manera en la que las entidades (tablas y/o vistas), objetos y conceptos se relacionan entre sí dentro de un sistema."
    },
    {
        "subject": "Bases de Datos",
        "text": "El lenguaje DML:",
        "options": [
            "Está compuesto por una serie de sentencias SQL con las que podremos modificar, añadir y eliminar datos de una tabla.",
            "Consta de una serie de instrucciones SQL con las que podremos administrar el acceso a la información que hay en la base de datos.",
            "Está compuesto por una serie de sentencias SQL con las que podremos definir una base de datos.",
            "Sirve exclusivamente para crear y destruir usuarios."
        ],
        "correct": "Está compuesto por una serie de sentencias SQL con las que podremos modificar, añadir y eliminar datos de una tabla."
    },
    {
        "subject": "Bases de Datos",
        "text": "El lenguaje DCL:",
        "options": [
            "Consta de una serie de instrucciones SQL con las que podremos administrar el acceso a la información que hay en la base de datos.",
            "Está compuesto por una serie de sentencias SQL con las que podremos modificar, añadir y eliminar datos de una tabla.",
            "Está compuesto por una serie de sentencias SQL con las que podremos definir una base de datos.",
            "Es el módulo de compilación de consultas."
        ],
        "correct": "Consta de una serie de instrucciones SQL con las que podremos administrar el acceso a la información que hay en la base de datos."
    },
    {
        "subject": "Bases de Datos",
        "text": "La cláusula COMMIT:",
        "options": [
            "Sirve para finalizar una transacción (tarea) salvando en la base de datos la totalidad de los cambios realizados a través de una transacción, liberando cualquier bloqueo que se mantuviera durante la misma.",
            "Sirve para eliminar los derechos o privilegios a nivel de usuario sobre una o más tablas concedidos anteriormente mediante la utilización de la sentencia GRANT.",
            "Sirve para establecer accesos (asignación de derechos o privilegios) a nivel de usuario sobre una o más tablas.",
            "Restablece la base de datos a un punto de guardado (savepoint) previo."
        ],
        "correct": "Sirve para finalizar una transacción (tarea) salvando en la base de datos la totalidad de los cambios realizados a través de una transacción, liberando cualquier bloqueo que se mantuviera durante la misma."
    },
    {
        "subject": "Bases de Datos",
        "text": "La cláusula UPDATE:",
        "options": [
            "Sirve para modificar datos dentro de la tabla. En este caso no es obligatorio modificar los datos de toda una fila, sino que también puede ser un campo en concreto.",
            "Sirve para insertar datos en la tabla.",
            "Con esta sentencia nos referimos a la información que deseamos obtener de una tabla o de un sistema de tablas.",
            "Crea una copia de la tabla estructurando nuevos campos."
        ],
        "correct": "Sirve para modificar datos dentro de la tabla. En este caso no es obligatorio modificar los datos de toda una fila, sino que también puede ser un campo en concreto."
    },
    {
        "subject": "Bases de Datos",
        "text": "Al utilizar Inner Join:",
        "options": [
            "Devolverá únicamente las filas en las que el valor del campo de la tabla A (utilizado para hacer el Join) coincida con el valor del campo correspondiente en la tabla B.",
            "Devolverá todas las filas en las que el valor del campo de la tabla A (utilizado para hacer el Join) coincida con el valor del campo correspondiente en la tabla B, incluyendo además las no coincidentes con el valor del campo correspondiente en la tabla B.",
            "Devolverá las filas tanto de la tabla A como las de la tabla B, coincidan o no los campos por los que hacemos el JOIN.",
            "Retorna permanentemente la tabla B vacía si no hay coincidencias estrictas de claves candidatas cruzadas."
        ],
        "correct": "Devolverá únicamente las filas en las que el valor del campo de la tabla A (utilizado para hacer el Join) coincida con el valor del campo correspondiente en la tabla B."
    },
    {
        "subject": "Bases de Datos",
        "text": "La Atomicidad es una propiedad de las transacciones mediante la cual:",
        "options": [
            "Se asegura que la totalidad de las operaciones de una secuencia de trabajo sean completadas de manera satisfactoria. De no ser así, las operaciones se retroceden a su estado inicial.",
            "Se permite que la base de datos modifique estados en una transacción finalizada de manera correcta.",
            "Las operaciones permanecen aisladas y a un mismo tiempo transparentes las unas de las otras.",
            "Se mantiene la consistencia de los datos en disco evitando fallos de hardware."
        ],
        "correct": "Se asegura que la totalidad de las operaciones de una secuencia de trabajo sean completadas de manera satisfactoria. De no ser así, las operaciones se retroceden a su estado inicial."
    },
    {
        "subject": "Bases de Datos",
        "text": "¿Qué efecto tiene la sentencia START TRANSACTION en MySQL?",
        "options": [
            "Inicia una nueva transacción agrupando varias operaciones que se ejecutarán de forma atómica.",
            "Crea una nueva tabla temporal para almacenar datos transitorios.",
            "Guarda automáticamente todos los cambios realizados desde el último COMMIT.",
            "Borra el historial de logs de transacciones del gestor."
        ],
        "correct": "Inicia una nueva transacción agrupando varias operaciones que se ejecutarán de forma atómica."
    },
    {
        "subject": "Bases de Datos",
        "text": "La sentencia ROLLBACK:",
        "options": [
            "Es utilizada con el propósito de abandonar la transacción y deshacer los cambios que se hubieran hecho en la misma.",
            "Se utiliza para guardar los cambios.",
            "Genera puntos concretos en la transacción o “checkpoints” a partir de los cuales deshacer la transacción.",
            "Sincroniza los cambios con las tablas en memoria antes del COMMIT."
        ],
        "correct": "Es utilizada con el propósito de abandonar la transacción y deshacer los cambios que se hubieran hecho en la misma."
    },
    {
        "subject": "Bases de Datos",
        "text": "¿Cuál es la función de la sentencia SAVEPOINT en una transacción en MySQL?",
        "options": [
            "Crear un punto intermedio dentro de una transacción desde el que se puede deshacer parcialmente.",
            "Almacenar los cambios realizados permanentemente en disco.",
            "Crear una copia completa de seguridad de la base de datos.",
            "Crear una tabla que guarda automáticamente volcados de sistema."
        ],
        "correct": "Crear un punto intermedio dentro de una transacción desde el que se puede deshacer parcialmente."
    },
    {
        "subject": "Bases de Datos",
        "text": "La Consistencia es una propiedad de las transacciones mediante la cual:",
        "options": [
            "Se permite que la base de datos modifique estados en una transacción finalizada de manera correcta preservando la validez de los datos según las reglas definidas.",
            "Las operaciones permanecen aisladas y a un mismo tiempo transparentes las unas de las otras.",
            "En caso de error del sistema el resultado de una transacción completa permanece pase lo que pase.",
            "Garantiza que no habrá lecturas sucias durante un JOIN masivo."
        ],
        "correct": "Se permite que la base de datos modifique estados en una transacción finalizada de manera correcta preservando la validez de los datos según las reglas definidas."
    },
    {
        "subject": "Bases de Datos",
        "text": "Un bloqueo (lock) es:",
        "options": [
            "Una restricción sobre el tipo de acceso permitido o no a un elemento de datos en concreto para gestionar la concurrencia.",
            "Una biblioteca que alberga tanto código como datos que pueden ser utilizados por más de un programa a la vez.",
            "La reproducción de uno o más cambios en la base de datos, tanto a la hora de la creación, la modificación o la eliminación de un registro.",
            "Una falla fatal del servidor que causa la pérdida de la tabla."
        ],
        "correct": "Una restricción sobre el tipo de acceso permitido o no a un elemento de datos en concreto para gestionar la concurrencia."
    },
    {
        "subject": "Bases de Datos",
        "text": "¿Cómo se referencia en MySQL una tabla que vive en otra base de datos sin usar USE?",
        "options": [
            "OtraBase.Tabla",
            "@OtraBase.Tabla",
            ".OtraBase.Tabla",
            "Tabla@OtraBase"
        ],
        "correct": "OtraBase.Tabla"
    },
    {
        "subject": "Bases de Datos",
        "text": "¿Cuál es la sintaxis correcta para crear una vista en MySQL?",
        "options": [
            "CREATE VIEW nombre AS SELECT …",
            "CREATE VISTA nombre AS SELECT …",
            "CREATE TABLE VIEW nombre AS SELECT …",
            "INSERT VIEW nombre FROM SELECT …"
        ],
        "correct": "CREATE VIEW nombre AS SELECT …"
    },
    {
        "subject": "Bases de Datos",
        "text": "Un índice de cluster:",
        "options": [
            "Es aquel donde se clasifica, ordena y almacena físicamente las filas de una tabla a partir de los valores que alberguen la clave que conforme el citado índice clúster.",
            "Está formado por un grupo de atributos de una tabla y por una clave alternativa únicamente.",
            "Es aquel que se crea de manera automática independientemente del índice de clave primaria.",
            "Es utilizado solo para vistas distribuidas en distintas ubicaciones geográficas."
        ],
        "correct": "Es aquel donde se clasifica, ordena y almacena físicamente las filas de una tabla a partir de los valores que alberguen la clave que conforme el citado índice clúster."
    },
    {
        "subject": "Bases de Datos",
        "text": "¿Qué afirmación describe correctamente el propósito de un procedimiento almacenado en MySQL?",
        "options": [
            "Permite encapsular una o varias instrucciones SQL para ser ejecutadas en lote (rutina).",
            "Ejecuta una única consulta dinámica y no permite usar variables locales.",
            "Solo puede contener sentencias SELECT.",
            "Sustituye completamente a una vista de sólo lectura."
        ],
        "correct": "Permite encapsular una o varias instrucciones SQL para ser ejecutadas en lote (rutina)."
    },
    {
        "subject": "Bases de Datos",
        "text": "Los cursores se utilizan en los programas de aplicación con el fin de:",
        "options": [
            "Recorrer y procesar fila a fila un conjunto de resultados (result set) previamente seleccionado.",
            "Seleccionar parte de una única fila y almacenar el resultado en sesiones HTML.",
            "Limitar o bloquear filas en tablas sin emplear transacciones.",
            "Procesar variables booleanas como booleanos reales, sin usar un entorno TINYINT."
        ],
        "correct": "Recorrer y procesar fila a fila un conjunto de resultados (result set) previamente seleccionado."
    },
    {
        "subject": "Bases de Datos",
        "text": "La instrucción FETCH en el contexto de cursores:",
        "options": [
            "Recupera la fila actual del conjunto de resultados del cursor y avanza el puntero hacia la siguiente.",
            "Cierra el cursor y, por lo tanto, libera todos los recursos utilizados por él.",
            "Abre el cursor permitiendo la lectura inicial de todo el bloque.",
            "Borra el resultado desde la base de datos de manera definitiva."
        ],
        "correct": "Recupera la fila actual del conjunto de resultados del cursor y avanza el puntero hacia la siguiente."
    },
    {
        "subject": "Bases de Datos",
        "text": "Una base de datos distribuida podría definirse como:",
        "options": [
            "Un tipo de objeto virtual, cuyos componentes se encuentran almacenados físicamente en diferentes bases de datos reales ubicadas en diversos lugares o nodos conectados en red.",
            "Un tipo de objeto virtual, cuyos componentes no se encuentran almacenados físicamente en ninguna base real, es decir, es un simulador.",
            "Un clúster donde todos los componentes se encuentran físicamente en el mismo servidor pero en particiones lógicas diferentes.",
            "Un conjunto de esquemas aislados que no mantienen relación de integridad."
        ],
        "correct": "Un tipo de objeto virtual, cuyos componentes se encuentran almacenados físicamente en diferentes bases de datos reales ubicadas en diversos lugares o nodos conectados en red."
    }
]

redes_questions = [
    {
        "subject": "Redes",
        "text": "¿Qué problema en la transmisión de la señal ocurre cuando dos o más señales coinciden al mismo tiempo y por el mismo lugar, afectando principalmente a comunicaciones electromagnéticas, pero no a las ópticas?",
        "options": [
            "Interferencia electromagnética",
            "Atenuación",
            "Diafonía",
            "Dispersión modal"
        ],
        "correct": "Interferencia electromagnética"
    },
    {
        "subject": "Redes",
        "text": "¿Cuál de los siguientes dispositivos de interconexión opera en la capa de enlace de datos del modelo OSI, utiliza direcciones MAC para filtrar y transmitir paquetes, y es capaz de proporcionar un ancho de banda dedicado para cada dispositivo conectado?",
        "options": [
            "Switch.",
            "Puente (Bridge).",
            "Concentrador (Hub).",
            "Router."
        ],
        "correct": "Switch."
    },
    {
        "subject": "Redes",
        "text": "¿Cuáles son los dos beneficios principales de implementar la Agregación de Enlaces (también conocida como EtherChannel o Link Aggregation) en una red de computadoras?",
        "options": [
            "Aumento de la capacidad de ancho de banda y mejora de la redundancia.",
            "Reducción de la latencia de la red y simplificación de la configuración de red.",
            "Menor consumo de energía y mejora de la seguridad mediante filtrado de MAC.",
            "Creación automática de VLANs y segmentación estática."
        ],
        "correct": "Aumento de la capacidad de ancho de banda y mejora de la redundancia."
    },
    {
        "subject": "Redes",
        "text": "En el ámbito de la seguridad de redes inalámbricas (IEEE 802.11), ¿cuál es el protocolo de cifrado actualmente más utilizado y recomendado debido a su uso del cifrado AES?",
        "options": [
            "WPA2 (Wi-Fi Protected Access 2) / WPA3.",
            "WEP (Wired Equivalent Privacy).",
            "WPA (Wi-Fi Protected Access).",
            "TKIP (Temporal Key Integrity Protocol)."
        ],
        "correct": "WPA2 (Wi-Fi Protected Access 2) / WPA3."
    },
    {
        "subject": "Redes",
        "text": "Al crear un cable Ethernet utilizando el estándar EIA/TIA 568B, ¿cuál es la secuencia correcta de colores para los hilos de los pines 1 y 2 en el conector RJ45?",
        "options": [
            "Pin 1: Blanco/Naranja, Pin 2: Naranja.",
            "Pin 1: Verde/Blanco, Pin 2: Verde.",
            "Pin 1: Blanco/Azul, Pin 2: Azul.",
            "Pin 1: Blanco/Marrón, Pin 2: Marrón."
        ],
        "correct": "Pin 1: Blanco/Naranja, Pin 2: Naranja."
    },
    {
        "subject": "Redes",
        "text": "¿Cuál de las siguientes afirmaciones describe correctamente las características principales de las ondas de radio y microondas?",
        "options": [
            "Las microondas tienen un ancho de banda mucho mayor que las ondas de radio, pero su alcance es más limitado y pueden ser bloqueadas por obstáculos físicos.",
            "Las ondas de radio tienen un ancho de banda mucho mayor que las microondas, aunque un alcance más limitado.",
            "Ambos tipos de ondas tienen un alcance similar, pero las microondas son más eficaces para atravesar obstáculos.",
            "Las ondas satelitales operan en frecuencias inferiores a las acústicas para optimizar la seguridad y el alcance global sin atenuación de red oculta."
        ],
        "correct": "Las microondas tienen un ancho de banda mucho mayor que las ondas de radio, pero su alcance es más limitado y pueden ser bloqueadas por obstáculos físicos."
    },
    {
        "subject": "Redes",
        "text": "En una red Ethernet, cuando múltiples dispositivos están conectados a un mismo concentrador (hub), ¿qué tipo de dominio comparten, lo que puede provocar colisiones y una disminución del rendimiento de la red?",
        "options": [
            "Un dominio de colisión.",
            "Solo un dominio de broadcast.",
            "Un dominio híbrido de colisión y broadcast separado para cada dispositivo.",
            "Múltiples dominios lógicos segmentados vía etiquetas dot1Q."
        ],
        "correct": "Un dominio de colisión."
    },
    {
        "subject": "Redes",
        "text": "Según los pasos generales para la implantación de una red de área local (LAN), ¿cuál es el primer paso fundamental a realizar?",
        "options": [
            "Diseño de la red.",
            "Adquisición de equipo.",
            "Instalación del cableado.",
            "Configuración del rúter de acceso a internet principal."
        ],
        "correct": "Diseño de la red."
    },
    {
        "subject": "Redes",
        "text": "En el formato de trama Ethernet (IEEE 802.3), ¿cuál es la función principal del campo CRC (Cyclic Redundancy Check)?",
        "options": [
            "Comprobar la integridad de la trama detectando errores de transmisión.",
            "Sincronizar los relojes de los dispositivos en la red.",
            "Indicar el protocolo de la capa superior utilizado.",
            "Identificar únicamente la dirección MAC de origen y de destino cifrándolas por completo."
        ],
        "correct": "Comprobar la integridad de la trama detectando errores de transmisión."
    },
    {
        "subject": "Redes",
        "text": "¿Cuál es la responsabilidad principal de la subcapa LLC (Logical Link Control) dentro del Nivel de Enlace en las redes de área local?",
        "options": [
            "Proporcionar control de flujo y corrección de errores para la transferencia de datos, y demultiplexar los protocolos de capa de red superior.",
            "Controlar el acceso al medio físico compartido y definir identidades MAC en los dispositivos.",
            "Definir las características físicas de los cables y la modulación base.",
            "Garantizar que no ocurran bucles lógicos en la capa de distribución general."
        ],
        "correct": "Proporcionar control de flujo y corrección de errores para la transferencia de datos, y demultiplexar los protocolos de capa de red superior."
    },
    {
        "subject": "Redes",
        "text": "En el diseño de redes locales a tres capas (núcleo, distribución y acceso), ¿cuál es la función principal de la capa de 'núcleo' (Core)?",
        "options": [
            "Alta capacidad de conmutación del tráfico de la red y enrutamiento a alta velocidad, con mínima latencia y alta disponibilidad.",
            "Proporcionar conectividad a los dispositivos finales de los usuarios como PCs o teléfonos IP.",
            "Aplicar políticas estrictas de seguridad de tráfico, listas de acceso (ACLs) perimetrales y NAT.",
            "Dar servicio a los servidores DNS o Proxy cache que alojan portales cautivos localizados."
        ],
        "correct": "Alta capacidad de conmutación del tráfico de la red y enrutamiento a alta velocidad, con mínima latencia y alta disponibilidad."
    },
    {
        "subject": "Redes",
        "text": "¿Cuál es una diferencia clave entre la configuración estática y dinámica de la tabla de direcciones MAC en un conmutador?",
        "options": [
            "La configuración estática ofrece un control más granular sobre las asociaciones puerto-MAC dictadas manualmente, mientras que la dinámica aprende las MACs automáticamente a partir de las tramas entrantes.",
            "La configuración dinámica requiere que el administrador ingrese manualmente cada dirección MAC para evitar bloqueos del port-security.",
            "La configuración estática es altamente vulnerable a ataques de envenenamiento en caché de ARP y DHCP spoofing de manera nativa.",
            "Ninguna es escalable. Ambas necesitan control humano y de software de gestión."
        ],
        "correct": "La configuración estática ofrece un control más granular sobre las asociaciones puerto-MAC dictadas manualmente, mientras que la dinámica aprende las MACs automáticamente a partir de las tramas entrantes."
    },
    {
        "subject": "Redes",
        "text": "¿Cuál de los siguientes NO es un beneficio directo y principal de la segmentación de redes (ej: uso de VLANs)?",
        "options": [
            "Facilitar la asignación dinámica de direcciones IP mediante un único servidor central estático.",
            "Mejora de la seguridad al limitar la exposición de datos y limitar la propagación de ciertos problemas informáticos.",
            "Mejora del rendimiento y eficiencia reduciendo la propagación innecesaria de broadcast (aislamiento de dominios).",
            "Gestión escalable y ordenada al separar tráfico y políticas."
        ],
        "correct": "Facilitar la asignación dinámica de direcciones IP mediante un único servidor central estático."
    },
    {
        "subject": "Redes",
        "text": "En un conmutador (Switch), ¿cuál es el propósito principal de la tabla de direcciones MAC (Tabla CAM)?",
        "options": [
            "Determinar por qué puerto específico se debe reenviar una trama destinada a una MAC unicast concreta aprendida previamente.",
            "Almacenar las direcciones IP de todos los dispositivos de subred estáticas en rutinas de capa de acceso.",
            "Identificar el destino ideal que reduce los saltos OSI a una WAN.",
            "Interpretar dominios HTTP y enlazar las DNS queries internamente."
        ],
        "correct": "Determinar por qué puerto específico se debe reenviar una trama destinada a una MAC unicast concreta aprendida previamente."
    },
    {
        "subject": "Redes",
        "text": "¿Qué método de reenvío de paquetes en un conmutador asegura la verificación completa de la integridad de la trama antes de su reenvío, siendo más confiable pero incluyendo mayor latencia?",
        "options": [
            "Store-and-Forward.",
            "Fragment-Free.",
            "Cut-Through.",
            "Fast-Forward."
        ],
        "correct": "Store-and-Forward."
    },
    {
        "subject": "Redes",
        "text": "¿De qué manera contribuyen los conmutadores (switches) a la eliminación de las colisiones en una red local full-duplex moderna?",
        "options": [
            "Al crear un dominio de colisión independiente y aislado para cada puerto (micro-segmentación).",
            "Al limitar los paquetes de broadcast que pueden viajar más allá de un router.",
            "Al permitir a todos los host compartir un mismo canal de radio en turnos de escucha y detección de energía TDM.",
            "Inyectando mensajes lógicos de 'pausa' en colisiones mediante un hub pasivo de monitorización."
        ],
        "correct": "Al crear un dominio de colisión independiente y aislado para cada puerto (micro-segmentación)."
    },
    {
        "subject": "Redes",
        "text": "¿Qué mejora significativa introdujo RSTP (Rapid Spanning Tree Protocol) respecto al STP tradicional (IEEE 802.1D)?",
        "options": [
            "RSTP baja drásticamente el tiempo de convergencia de la red en caso de fallo topológico e introduce un concepto avanzado de roles/estados de puertos más eficiente.",
            "La total eliminación de enlaces redundantes como método preventivo, garantizando su baja escalabilidad artificialmente.",
            "La capacidad de cifrar todo el árbol de dominio STP incluyendo las BPDU entre conmutadores Root.",
            "Funciona únicamente y exclusivamente sobre conexiones Gigabit y fibras multi-modo (OM4)."
        ],
        "correct": "RSTP baja drásticamente el tiempo de convergencia de la red en caso de fallo topológico e introduce un concepto avanzado de roles/estados de puertos más eficiente."
    },
    {
        "subject": "Redes",
        "text": "En el proceso de arranque de un conmutador Cisco típico, ¿qué paso ocurre inmediatamente a la terminación del POST (Autocomprobación)?",
        "options": [
            "Carga y descompresión del firmware (Sistema Operativo / IOS) desde la Flash a la RAM.",
            "Configuración inicial manual a través de puerto de consola exigido al administrador obligatoriamente.",
            "Descubrimiento de dispositivos y ejecución total de STP para bloquear puertos de acceso final.",
            "Reconstrucción completa de la base de registros en NVRAM para un Factory Reset cíclico normal."
        ],
        "correct": "Carga y descompresión del firmware (Sistema Operativo / IOS) desde la Flash a la RAM."
    },
    {
        "subject": "Redes",
        "text": "En el IOS de Cisco, ¿cuál es el modo que suele pedir contraseña para entrar, donde un administrador puede guardar/reiniciar configuraciones, hacer borrados parciales o correr diagnósticos avanzados y comandos SHOW?",
        "options": [
            "Modo EXEC privilegiado.",
            "Modo EXEC de usuario.",
            "Modo Configuración Global.",
            "Modo Configuración de Interfaz."
        ],
        "correct": "Modo EXEC privilegiado."
    },
    {
        "subject": "Redes",
        "text": "Para el acceso remoto administrativo a un conmutador gestionable, ¿cuál de los siguientes protocolos es el recomendado debido a la seguridad y cifrado que lo blinda ante intentos de escucha de contraseñas de red?",
        "options": [
            "SSH.",
            "Telnet.",
            "HTTP.",
            "TFTP."
        ],
        "correct": "SSH."
    }
]

db = SessionLocal()

print("Borrando preguntas redundantes o antiguas insertando lote fresco...")
# (opcional: limpiar las especificas o todo) -> no voy a limpiar para no borrar el progreso.

def add_questions(question_list):
    added = 0
    for q_data in question_list:
        # Check if question exists
        exists = db.query(Question).filter_by(text=q_data["text"]).first()
        if not exists:
            opts = q_data["options"]
            db_q = Question(
                subject=q_data["subject"],
                text=q_data["text"],
                option_a=opts[0],
                option_b=opts[1],
                option_c=opts[2],
                option_d=opts[3],
                correct_answer=q_data["correct"],
                difficulty="medium"
            )
            db.add(db_q)
            added += 1
    db.commit()
    return added

print(f"Added {add_questions(bd_questions)} questions to Bases de Datos.")
print(f"Added {add_questions(redes_questions)} questions to Redes.")

db.close()
