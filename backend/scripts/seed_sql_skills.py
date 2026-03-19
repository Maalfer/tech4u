"""
Seed: SQL Skills — Dataset "Tienda" + 36 Ejercicios de Consultas Sencillas
Ejecutar una sola vez: python seed_sql_skills.py
"""
import json
import sqlite3
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, SQLDataset, SQLExercise, create_tables

# ──────────────────────────────────────────────────────────────
# DATASET: TIENDA
# ──────────────────────────────────────────────────────────────

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS categoria (
    id      INTEGER PRIMARY KEY,
    nombre  TEXT    NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS proveedor (
    id      INTEGER PRIMARY KEY,
    nombre  TEXT    NOT NULL,
    ciudad  TEXT,
    pais    TEXT
);

CREATE TABLE IF NOT EXISTS producto (
    id           INTEGER PRIMARY KEY,
    nombre       TEXT    NOT NULL,
    precio       REAL    NOT NULL,
    stock        INTEGER NOT NULL DEFAULT 0,
    categoria_id INTEGER REFERENCES categoria(id),
    proveedor_id INTEGER REFERENCES proveedor(id)
);

CREATE TABLE IF NOT EXISTS cliente (
    id               INTEGER PRIMARY KEY,
    nombre           TEXT    NOT NULL,
    email            TEXT,
    ciudad           TEXT,
    edad             INTEGER,
    fecha_registro   TEXT
);

CREATE TABLE IF NOT EXISTS pedido (
    id          INTEGER PRIMARY KEY,
    cliente_id  INTEGER REFERENCES cliente(id),
    fecha       TEXT,
    total       REAL,
    estado      TEXT
);

CREATE TABLE IF NOT EXISTS linea_pedido (
    id               INTEGER PRIMARY KEY,
    pedido_id        INTEGER REFERENCES pedido(id),
    producto_id      INTEGER REFERENCES producto(id),
    cantidad         INTEGER,
    precio_unitario  REAL
);
"""

SEED_SQL = """
INSERT INTO categoria VALUES
(1, 'Electrónica',  'Dispositivos y gadgets electrónicos'),
(2, 'Informática',  'Hardware y accesorios para ordenadores'),
(3, 'Periféricos',  'Teclados, ratones, monitores y más'),
(4, 'Audio',        'Auriculares, altavoces y sistemas de sonido'),
(5, 'Almacenamiento','Discos duros, SSDs y memorias USB');

INSERT INTO proveedor VALUES
(1, 'TechDistrib SL',  'Madrid',    'España'),
(2, 'InfoParts Ltd',   'Barcelona', 'España'),
(3, 'GlobalComp GmbH', 'Berlín',    'Alemania'),
(4, 'SoundPro Inc',    'Nueva York','EEUU'),
(5, 'StorageWorld SA', 'París',     'Francia');

INSERT INTO producto VALUES
(1,  'Disco duro SATA 1TB',        59.99,  120, 5, 5),
(2,  'SSD NVMe 500GB',            89.99,   85, 5, 5),
(3,  'Memoria RAM DDR4 16GB',      49.99,  200, 2, 2),
(4,  'Teclado mecánico RGB',       79.99,   60, 3, 1),
(5,  'Ratón inalámbrico',          34.99,  150, 3, 2),
(6,  'Monitor IPS 24"',           199.99,   40, 3, 3),
(7,  'Auriculares Gaming',         59.99,   75, 4, 4),
(8,  'Tarjeta gráfica RTX 3060', 399.99,   25, 2, 3),
(9,  'Procesador Intel i7',       299.99,   30, 2, 3),
(10, 'Placa base ATX',            179.99,   45, 2, 2),
(11, 'Webcam Full HD',             49.99,   90, 1, 1),
(12, 'Altavoz Bluetooth',          39.99,  110, 4, 4),
(13, 'Hub USB-C 7 puertos',        29.99,  200, 1, 2),
(14, 'Fuente de alimentación 650W',89.99,   55, 2, 1),
(15, 'Caja ATX Mid-Tower',         69.99,   35, 2, 3),
(16, 'Memoria USB 64GB',           12.99,  500, 5, 5),
(17, 'Tarjeta SD 128GB',           19.99,  300, 5, 5),
(18, 'Micrófono de condensador',   89.99,   40, 4, 4),
(19, 'Alfombrilla XL gaming',      24.99,  180, 3, 1),
(20, 'Regleta con USB',            21.99,  250, 1, 1);

INSERT INTO cliente VALUES
(1,  'Ana García',       'ana@email.com',     'Madrid',    28, '2023-01-15'),
(2,  'Carlos López',     'carlos@email.com',  'Barcelona', 35, '2023-02-20'),
(3,  'María Martínez',   'maria@email.com',   'Madrid',    42, '2023-03-10'),
(4,  'Juan Sánchez',     'juan@email.com',    'Valencia',  25, '2023-04-05'),
(5,  'Laura Rodríguez',  'laura@email.com',   'Sevilla',   31, '2023-04-18'),
(6,  'Pedro Fernández',  'pedro@email.com',   'Madrid',    38, '2023-05-22'),
(7,  'Sofía González',   'sofia@email.com',   'Bilbao',    29, '2023-06-01'),
(8,  'Andrés Jiménez',   'andres@email.com',  'Barcelona', 45, '2023-06-15'),
(9,  'Elena Ruiz',       'elena@email.com',   'Madrid',    33, '2023-07-08'),
(10, 'David Díaz',       'david@email.com',   'Zaragoza',  27, '2023-07-20'),
(11, 'Isabel Torres',    'isabel@email.com',  'Valencia',  40, '2023-08-03'),
(12, 'Miguel Moreno',    'miguel@email.com',  'Madrid',    36, '2023-08-19'),
(13, 'Carmen López',     'carmen@email.com',  'Málaga',    52, '2023-09-11'),
(14, 'Alberto Navarro',  'alberto@email.com', 'Barcelona', 24, '2023-09-25'),
(15, 'Patricia Castro',  'patricia@email.com','Sevilla',   30, '2023-10-07');

INSERT INTO pedido VALUES
(1,  1,  '2024-01-10', 149.98, 'entregado'),
(2,  2,  '2024-01-15', 399.99, 'entregado'),
(3,  3,  '2024-01-20', 699.97, 'enviado'),
(4,  4,  '2024-02-05',  84.98, 'entregado'),
(5,  5,  '2024-02-12', 199.99, 'entregado'),
(6,  1,  '2024-02-18', 299.99, 'cancelado'),
(7,  6,  '2024-03-01', 129.98, 'entregado'),
(8,  7,  '2024-03-08', 479.98, 'enviado'),
(9,  8,  '2024-03-15', 249.98, 'entregado'),
(10, 9,  '2024-03-22', 109.98, 'procesando'),
(11, 10, '2024-04-02', 399.99, 'entregado'),
(12, 2,  '2024-04-10', 179.99, 'entregado'),
(13, 11, '2024-04-18', 629.98, 'enviado'),
(14, 12, '2024-05-05',  99.98, 'entregado'),
(15, 3,  '2024-05-14', 449.98, 'entregado');

INSERT INTO linea_pedido VALUES
(1,  1,  1,  1, 59.99),
(2,  1,  4,  1, 79.99),
(3,  2,  8,  1,399.99),
(4,  3,  9,  1,299.99),
(5,  3,  3,  2, 49.99),
(6,  3, 16,  1, 12.99),
(7,  4,  5,  1, 34.99),
(8,  4,  7,  1, 59.99),
(9,  5,  6,  1,199.99),
(10, 6,  9,  1,299.99),
(11, 7,  5,  1, 34.99),
(12, 7, 13,  1, 29.99),
(13, 7, 19,  1, 24.99),
(14, 7, 20,  1, 21.99),
(15, 8,  6,  1,199.99),
(16, 8,  7,  1, 59.99),
(17, 8, 11,  1, 49.99),
(18, 8,  4,  1, 79.99),
(19, 8,  5,  1, 34.99),
(20, 8, 12,  1, 39.99),
(21, 9,  2,  1, 89.99),
(22, 9,  3,  2, 49.99),
(23,10,  7,  1, 59.99),
(24,10, 12,  1, 39.99),
(25,11,  8,  1,399.99),
(26,12, 10,  1,179.99),
(27,13,  8,  1,399.99),
(28,13,  9,  1,299.99),
(29,13, 16,  1, 12.99),
(30,14,  5,  1, 34.99),
(31,14, 19,  1, 24.99),
(32,14, 13,  1, 29.99),
(33,15,  6,  1,199.99),
(34,15,  4,  1, 79.99),
(35,15,  2,  1, 89.99),
(36,15, 18,  1, 89.99);
"""


# ──────────────────────────────────────────────────────────────
# HELPER: calcular expected_result
# ──────────────────────────────────────────────────────────────

def compute_expected(solution_sql: str) -> str:
    conn = sqlite3.connect(":memory:")
    conn.executescript(SCHEMA_SQL)
    conn.executescript(SEED_SQL)
    cursor = conn.execute(solution_sql)
    columns = [d[0] for d in cursor.description] if cursor.description else []
    rows = [list(r) for r in cursor.fetchall()]
    conn.close()
    return json.dumps({"columns": columns, "rows": rows})


# ──────────────────────────────────────────────────────────────
# 36 EJERCICIOS
# ──────────────────────────────────────────────────────────────

EXERCISES = [
    # ── 1-6: 01 - SELECT básico ──────────────────────────────
    {
        "title": "Ejercicio 1",
        "category": "01 - SELECT básico",
        "order_num": 1,
        "difficulty": "basico",
        "description": "Lista el nombre de todos los productos que hay en la tabla <code>producto</code>.",
        "wiki_title": "SELECT — Seleccionar columnas",
        "wiki_content": """La sentencia **SELECT** es la más utilizada en SQL. Permite extraer datos de una o varias columnas de una tabla.

Cuando solo necesitas ver el contenido de una columna concreta, especificas su nombre después de `SELECT`. Esto es más eficiente que traer todas las columnas, especialmente en tablas con muchos campos.""",
        "wiki_syntax": "SELECT columna FROM tabla;",
        "wiki_example": "SELECT nombre FROM empleado;",
        "solution_sql": "SELECT nombre FROM producto;",
        "xp_reward": 30,
    },
    {
        "title": "Ejercicio 2",
        "category": "01 - SELECT básico",
        "order_num": 2,
        "difficulty": "basico",
        "description": "Muestra el nombre y el precio de todos los productos.",
        "wiki_title": "SELECT — Múltiples columnas",
        "wiki_content": """Puedes seleccionar **varias columnas** separándolas con comas. El orden en que las escribas es el orden en que aparecerán en el resultado.

Seleccionar solo las columnas que necesitas es una buena práctica: reduce el tráfico de datos y hace las consultas más legibles.""",
        "wiki_syntax": "SELECT columna1, columna2 FROM tabla;",
        "wiki_example": "SELECT nombre, salario FROM empleado;",
        "solution_sql": "SELECT nombre, precio FROM producto;",
        "xp_reward": 30,
    },
    {
        "title": "Ejercicio 3",
        "category": "01 - SELECT básico",
        "order_num": 3,
        "difficulty": "basico",
        "description": "Muestra todos los datos de la tabla <code>producto</code>.",
        "wiki_title": "SELECT * — Todas las columnas",
        "wiki_content": """El asterisco `*` es un comodín que significa **"todas las columnas"**. Es muy útil para explorar rápidamente el contenido de una tabla sin tener que escribir todos los nombres de columna.

⚠️ En producción es preferible especificar los nombres de columna en lugar de usar `*`, ya que si la tabla cambia la consulta puede devolver datos inesperados.""",
        "wiki_syntax": "SELECT * FROM tabla;",
        "wiki_example": "SELECT * FROM empleado;",
        "solution_sql": "SELECT * FROM producto;",
        "xp_reward": 30,
    },
    {
        "title": "Ejercicio 4",
        "category": "01 - SELECT básico",
        "order_num": 4,
        "difficulty": "basico",
        "description": "Muestra el nombre y el precio de todos los productos usando los alias <b>Nombre</b> y <b>Precio</b>.",
        "wiki_title": "AS — Alias de columna",
        "wiki_content": """Los **alias** permiten asignar un nombre temporal a una columna en el resultado. Son útiles para hacer el resultado más legible o para renombrar expresiones calculadas.

Se definen con la palabra clave `AS` seguida del nuevo nombre. Si el alias contiene espacios, debe ir entre comillas o corchetes.""",
        "wiki_syntax": "SELECT columna AS alias FROM tabla;",
        "wiki_example": "SELECT nombre AS Empleado, salario AS Sueldo FROM empleado;",
        "solution_sql": "SELECT nombre AS Nombre, precio AS Precio FROM producto;",
        "xp_reward": 40,
    },
    {
        "title": "Ejercicio 5",
        "category": "01 - SELECT básico",
        "order_num": 5,
        "difficulty": "basico",
        "description": "Muestra todos los datos de la tabla <code>cliente</code>.",
        "wiki_title": "Explorando otras tablas",
        "wiki_content": """Una base de datos suele tener múltiples tablas relacionadas entre sí. En este ejercicio practicamos el `SELECT *` sobre la tabla `cliente`, que contiene información personal de los compradores de la tienda.

Conocer la estructura de cada tabla es el primer paso para construir consultas más complejas con JOINs.""",
        "wiki_syntax": "SELECT * FROM tabla;",
        "wiki_example": "SELECT * FROM cliente;",
        "solution_sql": "SELECT * FROM cliente;",
        "xp_reward": 30,
    },
    {
        "title": "Ejercicio 6",
        "category": "01 - SELECT básico",
        "order_num": 6,
        "difficulty": "basico",
        "description": "Lista el nombre y la ciudad de todos los clientes.",
        "wiki_title": "Selección de columnas en cliente",
        "wiki_content": """Practicamos de nuevo la selección de columnas específicas, esta vez sobre la tabla `cliente`.

Es muy común en aplicaciones reales mostrar solo nombre y ciudad de los usuarios en listados o informes de resumen.""",
        "wiki_syntax": "SELECT columna1, columna2 FROM tabla;",
        "wiki_example": "SELECT nombre, email FROM cliente;",
        "solution_sql": "SELECT nombre, ciudad FROM cliente;",
        "xp_reward": 30,
    },

    # ── 7-13: 02 - Filtros WHERE ─────────────────────────────
    {
        "title": "Ejercicio 7",
        "category": "02 - Filtros WHERE",
        "order_num": 7,
        "difficulty": "basico",
        "description": "Lista todos los productos cuyo precio sea mayor que <b>100</b>.",
        "wiki_title": "WHERE — Filtrar filas",
        "wiki_content": """La cláusula **WHERE** permite filtrar los resultados y devolver solo las filas que cumplan una condición.

Los **operadores de comparación** más usados son:
- `=`  igual a
- `>` mayor que / `<` menor que
- `>=` mayor o igual / `<=` menor o igual
- `<>` o `!=` distinto de""",
        "wiki_syntax": "SELECT columnas FROM tabla WHERE condición;",
        "wiki_example": "SELECT nombre, salario FROM empleado WHERE salario > 2000;",
        "solution_sql": "SELECT * FROM producto WHERE precio > 100;",
        "xp_reward": 40,
    },
    {
        "title": "Ejercicio 8",
        "category": "02 - Filtros WHERE",
        "order_num": 8,
        "difficulty": "basico",
        "description": "Muestra los productos cuyo <code>stock</code> sea igual a <b>0</b>.",
        "wiki_title": "WHERE con igualdad",
        "wiki_content": """El operador `=` es el más sencillo: filtra exactamente los registros donde el valor de la columna coincide con el valor indicado.

Es importante no confundir `=` (comparación) con `==` — en SQL solo se usa un signo igual para comparar. Los textos se encierran en comillas simples `'texto'`.""",
        "wiki_syntax": "SELECT * FROM tabla WHERE columna = valor;",
        "wiki_example": "SELECT * FROM producto WHERE stock = 0;",
        "solution_sql": "SELECT * FROM producto WHERE stock = 0;",
        "xp_reward": 40,
    },
    {
        "title": "Ejercicio 9",
        "category": "02 - Filtros WHERE",
        "order_num": 9,
        "difficulty": "basico",
        "description": "Lista los clientes cuya ciudad sea <b>'Madrid'</b>.",
        "wiki_title": "WHERE con texto",
        "wiki_content": """Al filtrar por texto (cadenas de caracteres), el valor debe ir entre **comillas simples** `'valor'`.

SQL distingue entre mayúsculas y minúsculas en las comparaciones de texto según el motor y la configuración de collation. En MySQL, por defecto, `'Madrid'` y `'madrid'` son iguales, pero es buena práctica ser explícito.""",
        "wiki_syntax": "SELECT * FROM tabla WHERE columna = 'texto';",
        "wiki_example": "SELECT * FROM cliente WHERE ciudad = 'Barcelona';",
        "solution_sql": "SELECT * FROM cliente WHERE ciudad = 'Madrid';",
        "xp_reward": 40,
    },
    {
        "title": "Ejercicio 10",
        "category": "02 - Filtros WHERE",
        "order_num": 10,
        "difficulty": "basico",
        "description": "Muestra los productos con precio entre <b>50</b> y <b>100</b> (ambos incluidos).",
        "wiki_title": "BETWEEN — Rango de valores",
        "wiki_content": """**BETWEEN** simplifica las condiciones de rango. Es equivalente a escribir `columna >= valor1 AND columna <= valor2`, pero más legible.

Ambos extremos son **inclusivos**: `BETWEEN 50 AND 100` incluye el 50 y el 100. Funciona con números, fechas y textos.""",
        "wiki_syntax": "SELECT * FROM tabla WHERE columna BETWEEN valor1 AND valor2;",
        "wiki_example": "SELECT * FROM producto WHERE precio BETWEEN 10 AND 50;",
        "solution_sql": "SELECT * FROM producto WHERE precio BETWEEN 50 AND 100;",
        "xp_reward": 50,
    },
    {
        "title": "Ejercicio 11",
        "category": "02 - Filtros WHERE",
        "order_num": 11,
        "difficulty": "basico",
        "description": "Encuentra los productos cuyo nombre empiece por la letra <b>'M'</b>.",
        "wiki_title": "LIKE — Búsqueda de patrones",
        "wiki_content": """**LIKE** permite buscar patrones en texto usando caracteres comodín:
- `%` — representa cero o más caracteres
- `_` — representa exactamente un carácter

Ejemplos:
- `LIKE 'M%'` → empieza por M
- `LIKE '%USB%'` → contiene "USB"
- `LIKE '_at%'` → el segundo y tercer carácter son "at"

⚠️ En MySQL, LIKE no distingue mayúsculas/minúsculas por defecto.""",
        "wiki_syntax": "SELECT * FROM tabla WHERE columna LIKE 'patrón';",
        "wiki_example": "SELECT * FROM producto WHERE nombre LIKE 'A%';",
        "solution_sql": "SELECT * FROM producto WHERE nombre LIKE 'M%';",
        "xp_reward": 50,
    },
    {
        "title": "Ejercicio 12",
        "category": "02 - Filtros WHERE",
        "order_num": 12,
        "difficulty": "basico",
        "description": "Lista los productos que contengan la palabra <b>'USB'</b> en el nombre.",
        "wiki_title": "LIKE con % en ambos lados",
        "wiki_content": """Colocando `%` a ambos lados del texto buscamos que el patrón aparezca **en cualquier posición** del valor: al principio, en medio o al final.

Esta búsqueda es más flexible pero también más costosa en rendimiento cuando la tabla es muy grande, ya que el motor no puede usar índices de forma óptima.""",
        "wiki_syntax": "SELECT * FROM tabla WHERE columna LIKE '%texto%';",
        "wiki_example": "SELECT * FROM producto WHERE nombre LIKE '%HD%';",
        "solution_sql": "SELECT * FROM producto WHERE nombre LIKE '%USB%';",
        "xp_reward": 50,
    },
    {
        "title": "Ejercicio 13",
        "category": "02 - Filtros WHERE",
        "order_num": 13,
        "difficulty": "basico",
        "description": "Muestra los clientes que <b>no</b> sean de Madrid ni de Barcelona.",
        "wiki_title": "NOT IN — Excluir valores",
        "wiki_content": """**IN** permite comprobar si un valor pertenece a una lista. **NOT IN** hace lo contrario: devuelve filas donde el valor NO está en la lista.

Es mucho más limpio que encadenar varios `AND columna <> valor`.""",
        "wiki_syntax": "SELECT * FROM tabla WHERE columna NOT IN ('v1', 'v2');",
        "wiki_example": "SELECT * FROM cliente WHERE ciudad IN ('Madrid', 'Sevilla');",
        "solution_sql": "SELECT * FROM cliente WHERE ciudad NOT IN ('Madrid', 'Barcelona');",
        "xp_reward": 50,
    },

    # ── 14-18: 03 - Ordenación y Límites ─────────────────────
    {
        "title": "Ejercicio 14",
        "category": "03 - Ordenación y Límites",
        "order_num": 14,
        "difficulty": "basico",
        "description": "Lista todos los productos ordenados por precio de <b>menor a mayor</b>.",
        "wiki_title": "ORDER BY — Ordenar resultados",
        "wiki_content": """**ORDER BY** ordena los resultados de una consulta. Por defecto el orden es **ascendente (ASC)**, es decir, de menor a mayor (números) o de la A a la Z (texto).

Puedes ordenar por cualquier columna, incluso por columnas que no aparecen en el SELECT.""",
        "wiki_syntax": "SELECT * FROM tabla ORDER BY columna ASC;",
        "wiki_example": "SELECT nombre, precio FROM producto ORDER BY precio ASC;",
        "solution_sql": "SELECT * FROM producto ORDER BY precio ASC;",
        "xp_reward": 40,
    },
    {
        "title": "Ejercicio 15",
        "category": "03 - Ordenación y Límites",
        "order_num": 15,
        "difficulty": "basico",
        "description": "Lista todos los productos ordenados por precio de <b>mayor a menor</b>.",
        "wiki_title": "ORDER BY DESC — Orden descendente",
        "wiki_content": """Con **DESC** (descendente) el orden se invierte: de mayor a menor (números) o de la Z a la A (texto).

Es muy útil para mostrar rankings, artículos más caros, fechas más recientes, etc.""",
        "wiki_syntax": "SELECT * FROM tabla ORDER BY columna DESC;",
        "wiki_example": "SELECT nombre, precio FROM producto ORDER BY precio DESC;",
        "solution_sql": "SELECT * FROM producto ORDER BY precio DESC;",
        "xp_reward": 40,
    },
    {
        "title": "Ejercicio 16",
        "category": "03 - Ordenación y Límites",
        "order_num": 16,
        "difficulty": "basico",
        "description": "Muestra los clientes ordenados alfabéticamente por nombre.",
        "wiki_title": "ORDER BY con texto",
        "wiki_content": """ORDER BY también funciona con columnas de texto, aplicando orden **alfabético**. El orden ASC va de la A a la Z.

En MySQL el orden depende del **collation** de la columna: con `utf8_general_ci` la ordenación ignora mayúsculas y acentos.""",
        "wiki_syntax": "SELECT * FROM tabla ORDER BY columna_texto ASC;",
        "wiki_example": "SELECT nombre FROM empleado ORDER BY nombre ASC;",
        "solution_sql": "SELECT * FROM cliente ORDER BY nombre ASC;",
        "xp_reward": 40,
    },
    {
        "title": "Ejercicio 17",
        "category": "03 - Ordenación y Límites",
        "order_num": 17,
        "difficulty": "basico",
        "description": "Muestra nombre y precio de los productos ordenados primero por <b>precio descendente</b> y, en caso de empate, por <b>nombre ascendente</b>.",
        "wiki_title": "ORDER BY — Múltiples columnas",
        "wiki_content": """Puedes ordenar por **varias columnas** separándolas con comas. El motor aplica el orden de izquierda a derecha: primero ordena por la primera columna y, cuando hay empate, aplica la siguiente.

Puedes mezclar ASC y DESC para cada columna.""",
        "wiki_syntax": "SELECT * FROM tabla ORDER BY col1 DESC, col2 ASC;",
        "wiki_example": "SELECT nombre, precio FROM producto ORDER BY precio DESC, nombre ASC;",
        "solution_sql": "SELECT nombre, precio FROM producto ORDER BY precio DESC, nombre ASC;",
        "xp_reward": 50,
    },
    {
        "title": "Ejercicio 18",
        "category": "03 - Ordenación y Límites",
        "order_num": 18,
        "difficulty": "basico",
        "description": "Muestra solo los <b>5 productos más caros</b> (nombre y precio).",
        "wiki_title": "LIMIT — Limitar resultados",
        "wiki_content": """**LIMIT** restringe el número de filas devueltas. Se coloca siempre al final de la consulta, después de ORDER BY.

Es fundamental para paginación, rankings y consultas de rendimiento.""",
        "wiki_syntax": "SELECT * FROM tabla ORDER BY columna DESC LIMIT n;",
        "wiki_example": "SELECT nombre, precio FROM producto ORDER BY precio DESC LIMIT 10;",
        "solution_sql": "SELECT nombre, precio FROM producto ORDER BY precio DESC LIMIT 5;",
        "xp_reward": 50,
    },

    # ── 19-20: 03 - Ordenación y Límites ─────────────────────
    {
        "title": "Ejercicio 19",
        "category": "03 - Ordenación y Límites",
        "order_num": 19,
        "difficulty": "basico",
        "description": "Lista los productos con precio menor de <b>50€</b>, ordenados por nombre alfabéticamente.",
        "wiki_title": "Combinando WHERE y ORDER BY",
        "wiki_content": """En SQL puedes (y debes) combinar cláusulas. El orden correcto de escritura es:

```
SELECT  →  FROM  →  WHERE  →  ORDER BY  →  LIMIT
```

**WHERE** filtra primero las filas, y **ORDER BY** ordena solo las filas que han pasado el filtro.""",
        "wiki_syntax": "SELECT * FROM tabla WHERE condición ORDER BY columna;",
        "wiki_example": "SELECT * FROM producto WHERE precio < 100 ORDER BY nombre ASC;",
        "solution_sql": "SELECT * FROM producto WHERE precio < 50 ORDER BY nombre ASC;",
        "xp_reward": 50,
    },
    {
        "title": "Ejercicio 20",
        "category": "03 - Ordenación y Límites",
        "order_num": 20,
        "difficulty": "basico",
        "description": "Muestra los <b>3 clientes más jóvenes</b> de Madrid (nombre, edad).",
        "wiki_title": "WHERE + ORDER BY + LIMIT",
        "wiki_content": """Combinar WHERE, ORDER BY y LIMIT es muy potente: filtras un subconjunto, lo ordenas y tomas los primeros N registros.

Este patrón se usa constantemente en aplicaciones reales: "los 10 últimos pedidos del cliente X", "los 5 productos más vendidos de la categoría Y", etc.""",
        "wiki_syntax": "SELECT columnas FROM tabla WHERE condición ORDER BY col LIMIT n;",
        "wiki_example": "SELECT nombre, edad FROM cliente WHERE ciudad='Sevilla' ORDER BY edad ASC LIMIT 5;",
        "solution_sql": "SELECT nombre, edad FROM cliente WHERE ciudad = 'Madrid' ORDER BY edad ASC LIMIT 3;",
        "xp_reward": 60,
    },

    # ── 21-26: 04 - Agregaciones ─────────────────────────────
    {
        "title": "Ejercicio 21",
        "category": "04 - Agregaciones",
        "order_num": 21,
        "difficulty": "basico",
        "description": "¿Cuántos productos hay en total en la tabla <code>producto</code>?",
        "wiki_title": "COUNT — Contar filas",
        "wiki_content": """Las **funciones de agregación** calculan un valor resumen a partir de un conjunto de filas.

**COUNT(*)** cuenta el número total de filas. **COUNT(columna)** cuenta las filas donde esa columna no es NULL.

Son funciones que "colapsan" todas las filas en un único valor de resultado.""",
        "wiki_syntax": "SELECT COUNT(*) FROM tabla;",
        "wiki_example": "SELECT COUNT(*) FROM cliente;",
        "solution_sql": "SELECT COUNT(*) FROM producto;",
        "xp_reward": 50,
    },
    {
        "title": "Ejercicio 22",
        "category": "04 - Agregaciones",
        "order_num": 22,
        "difficulty": "basico",
        "description": "¿Cuántos clientes son de <b>Madrid</b>?",
        "wiki_title": "COUNT con WHERE",
        "wiki_content": """Puedes combinar `COUNT(*)` con `WHERE` para contar solo las filas que cumplen una condición.

El motor ejecuta primero el filtro WHERE y después aplica la función COUNT sobre las filas resultantes.""",
        "wiki_syntax": "SELECT COUNT(*) FROM tabla WHERE condición;",
        "wiki_example": "SELECT COUNT(*) FROM cliente WHERE ciudad = 'Barcelona';",
        "solution_sql": "SELECT COUNT(*) FROM cliente WHERE ciudad = 'Madrid';",
        "xp_reward": 50,
    },
    {
        "title": "Ejercicio 23",
        "category": "04 - Agregaciones",
        "order_num": 23,
        "difficulty": "basico",
        "description": "Calcula el precio total (suma) de todos los productos del catálogo.",
        "wiki_title": "SUM — Suma de valores",
        "wiki_content": """**SUM(columna)** devuelve la suma de todos los valores numéricos de esa columna, ignorando los NULL.

Es muy útil para calcular totales: ventas, presupuestos, stock valorado, etc.""",
        "wiki_syntax": "SELECT SUM(columna) FROM tabla;",
        "wiki_example": "SELECT SUM(precio) FROM producto;",
        "solution_sql": "SELECT SUM(precio) FROM producto;",
        "xp_reward": 50,
    },
    {
        "title": "Ejercicio 24",
        "category": "04 - Agregaciones",
        "order_num": 24,
        "difficulty": "basico",
        "description": "Calcula el precio medio de todos los productos.",
        "wiki_title": "AVG — Media aritmética",
        "wiki_content": """**AVG(columna)** calcula la media aritmética de los valores numéricos, ignorando los NULL.

La media es útil para comparaciones: ¿está este producto por encima o por debajo del precio medio?""",
        "wiki_syntax": "SELECT AVG(columna) FROM tabla;",
        "wiki_example": "SELECT AVG(precio) FROM producto;",
        "solution_sql": "SELECT AVG(precio) FROM producto;",
        "xp_reward": 50,
    },
    {
        "title": "Ejercicio 25",
        "category": "04 - Agregaciones",
        "order_num": 25,
        "difficulty": "basico",
        "description": "Encuentra el producto más caro y el más barato (en la misma consulta).",
        "wiki_title": "MAX y MIN",
        "wiki_content": """**MAX(columna)** devuelve el valor más alto y **MIN(columna)** el más bajo.

Puedes usarlos en la misma consulta separados por comas. También funcionan con texto (orden alfabético) y fechas.""",
        "wiki_syntax": "SELECT MAX(col), MIN(col) FROM tabla;",
        "wiki_example": "SELECT MAX(precio), MIN(precio) FROM producto;",
        "solution_sql": "SELECT MAX(precio), MIN(precio) FROM producto;",
        "xp_reward": 50,
    },
    {
        "title": "Ejercicio 26",
        "category": "04 - Agregaciones",
        "order_num": 26,
        "difficulty": "basico",
        "description": "Calcula el valor total del inventario (suma de <code>precio × stock</code> para cada producto).",
        "wiki_title": "Expresiones calculadas",
        "wiki_content": """SQL permite crear **columnas calculadas** directamente en el SELECT usando operadores aritméticos: `+`, `-`, `*`, `/`.

Combinar esto con `SUM()` permite obtener métricas de negocio muy útiles, como el valor total del stock.""",
        "wiki_syntax": "SELECT SUM(col1 * col2) FROM tabla;",
        "wiki_example": "SELECT SUM(precio * stock) AS valor_inventario FROM producto;",
        "solution_sql": "SELECT SUM(precio * stock) FROM producto;",
        "xp_reward": 60,
    },

    # ── 27-30: 05 - Agrupaciones (GROUP BY) ──────────────────
    {
        "title": "Ejercicio 27",
        "category": "05 - Agrupaciones (GROUP BY)",
        "order_num": 27,
        "difficulty": "intermedio",
        "description": "Muestra cuántos productos hay por cada <code>categoria_id</code>.",
        "wiki_title": "GROUP BY — Agrupar filas",
        "wiki_content": """**GROUP BY** agrupa las filas que tienen el mismo valor en la columna especificada y permite aplicar funciones de agregación a cada grupo.

Regla importante: **todas las columnas del SELECT que no sean funciones de agregación deben aparecer en el GROUP BY**.""",
        "wiki_syntax": "SELECT columna, COUNT(*) FROM tabla GROUP BY columna;",
        "wiki_example": "SELECT categoria_id, COUNT(*) FROM producto GROUP BY categoria_id;",
        "solution_sql": "SELECT categoria_id, COUNT(*) FROM producto GROUP BY categoria_id;",
        "xp_reward": 70,
    },
    {
        "title": "Ejercicio 28",
        "category": "05 - Agrupaciones (GROUP BY)",
        "order_num": 28,
        "difficulty": "intermedio",
        "description": "Calcula el precio medio de los productos para cada <code>categoria_id</code>, ordenado de mayor a menor precio medio.",
        "wiki_title": "GROUP BY con AVG",
        "wiki_content": """Combinar GROUP BY con funciones de agregación es la base del análisis de datos en SQL.

Puedes usar ORDER BY sobre la función de agregación (o su alias) para ordenar los grupos resultantes.""",
        "wiki_syntax": "SELECT columna, AVG(col2) FROM tabla GROUP BY columna ORDER BY AVG(col2) DESC;",
        "wiki_example": "SELECT categoria_id, AVG(precio) FROM producto GROUP BY categoria_id;",
        "solution_sql": "SELECT categoria_id, AVG(precio) FROM producto GROUP BY categoria_id ORDER BY AVG(precio) DESC;",
        "xp_reward": 70,
    },
    {
        "title": "Ejercicio 29",
        "category": "05 - Agrupaciones (GROUP BY)",
        "order_num": 29,
        "difficulty": "intermedio",
        "description": "Muestra cuántos clientes hay en cada ciudad, ordenado de mayor a menor.",
        "wiki_title": "GROUP BY con texto",
        "wiki_content": """GROUP BY funciona igual con columnas de texto. Es ideal para obtener distribuciones: cuántos clientes por ciudad, cuántos pedidos por estado, etc.""",
        "wiki_syntax": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad ORDER BY COUNT(*) DESC;",
        "wiki_example": "SELECT ciudad, COUNT(*) AS total FROM cliente GROUP BY ciudad;",
        "solution_sql": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad ORDER BY COUNT(*) DESC;",
        "xp_reward": 70,
    },
    {
        "title": "Ejercicio 30",
        "category": "05 - Agrupaciones (GROUP BY)",
        "order_num": 30,
        "difficulty": "intermedio",
        "description": "Muestra el estado de los pedidos y cuántos pedidos hay de cada estado.",
        "wiki_title": "GROUP BY sobre estados",
        "wiki_content": """Agrupar por estados o categorías es una forma habitual de obtener un **resumen ejecutivo** de los datos.

En este caso agrupamos los pedidos por su estado (entregado, enviado, cancelado, procesando) para ver la distribución.""",
        "wiki_syntax": "SELECT estado, COUNT(*) FROM pedido GROUP BY estado;",
        "wiki_example": "SELECT estado, COUNT(*) FROM pedido GROUP BY estado;",
        "solution_sql": "SELECT estado, COUNT(*) FROM pedido GROUP BY estado;",
        "xp_reward": 70,
    },

    # ── 31-32: 06 - Filtros de Grupo (HAVING) ────────────────
    {
        "title": "Ejercicio 31",
        "category": "06 - Filtros de Grupo (HAVING)",
        "order_num": 31,
        "difficulty": "intermedio",
        "description": "Muestra las ciudades que tienen <b>más de 2</b> clientes registrados.",
        "wiki_title": "HAVING — Filtrar grupos",
        "wiki_content": """**HAVING** filtra los grupos creados por GROUP BY, igual que WHERE filtra las filas.

Diferencia clave:
- **WHERE** filtra filas **antes** de agrupar
- **HAVING** filtra grupos **después** de agrupar

Por eso HAVING puede usar funciones de agregación y WHERE no.""",
        "wiki_syntax": "SELECT columna, COUNT(*) FROM tabla GROUP BY columna HAVING COUNT(*) > n;",
        "wiki_example": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad HAVING COUNT(*) >= 3;",
        "solution_sql": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad HAVING COUNT(*) > 2;",
        "xp_reward": 80,
    },
    {
        "title": "Ejercicio 32",
        "category": "06 - Filtros de Grupo (HAVING)",
        "order_num": 32,
        "difficulty": "intermedio",
        "description": "Lista los <code>categoria_id</code> cuyo precio medio sea <b>mayor que 80€</b>.",
        "wiki_title": "HAVING con AVG",
        "wiki_content": """HAVING es especialmente útil con funciones como AVG, SUM o MAX para filtrar grupos que superan un umbral.

En este ejercicio buscamos categorías "premium" donde el precio medio es elevado.""",
        "wiki_syntax": "SELECT columna, AVG(col) FROM tabla GROUP BY columna HAVING AVG(col) > n;",
        "wiki_example": "SELECT categoria_id, AVG(precio) FROM producto GROUP BY categoria_id HAVING AVG(precio) > 50;",
        "solution_sql": "SELECT categoria_id, AVG(precio) FROM producto GROUP BY categoria_id HAVING AVG(precio) > 80;",
        "xp_reward": 80,
    },

    # ── 33-36: 07 - Subconsultas y otros ─────────────────────
    {
        "title": "Ejercicio 33",
        "category": "07 - Subconsultas y otros",
        "order_num": 33,
        "difficulty": "intermedio",
        "description": "Lista los productos cuyo precio sea superior al precio medio del catálogo.",
        "wiki_title": "Subconsulta en WHERE",
        "wiki_content": """Una **subconsulta** es una consulta dentro de otra. La consulta interior se ejecuta primero y su resultado se usa en la consulta exterior.

Son muy potentes para comparar valores con agregaciones (como la media) sin necesidad de calcularla manualmente.""",
        "wiki_syntax": "SELECT * FROM tabla WHERE col > (SELECT AVG(col) FROM tabla);",
        "wiki_example": "SELECT nombre, precio FROM producto WHERE precio > (SELECT AVG(precio) FROM producto);",
        "solution_sql": "SELECT nombre, precio FROM producto WHERE precio > (SELECT AVG(precio) FROM producto);",
        "xp_reward": 90,
    },
    {
        "title": "Ejercicio 34",
        "category": "07 - Subconsultas y otros",
        "order_num": 34,
        "difficulty": "intermedio",
        "description": "Muestra el nombre y precio de los productos junto con el <b>valor de su stock</b> (precio × stock) como columna <code>valor_stock</code>. Ordena por valor_stock descendente.",
        "wiki_title": "Columnas calculadas con alias",
        "wiki_content": """Puedes crear columnas calculadas directamente en el SELECT y asignarles un alias con AS. Estas columnas calculadas se pueden referenciar en ORDER BY.

En MySQL también puedes usar el alias directamente en ORDER BY (no es estándar SQL pero MySQL lo acepta).""",
        "wiki_syntax": "SELECT col, col1*col2 AS alias FROM tabla ORDER BY alias DESC;",
        "wiki_example": "SELECT nombre, precio*stock AS valor FROM producto ORDER BY valor DESC;",
        "solution_sql": "SELECT nombre, precio, precio * stock AS valor_stock FROM producto ORDER BY valor_stock DESC;",
        "xp_reward": 80,
    },
    {
        "title": "Ejercicio 35",
        "category": "07 - Subconsultas y otros",
        "order_num": 35,
        "difficulty": "intermedio",
        "description": "Muestra la edad media, la edad mínima y la edad máxima de los clientes de <b>Madrid</b>.",
        "wiki_title": "Varias agregaciones combinadas",
        "wiki_content": """Puedes usar múltiples funciones de agregación en la misma consulta. El resultado siempre es una sola fila cuando no hay GROUP BY.

Este tipo de consulta es muy útil para generar estadísticas descriptivas sobre un subconjunto de datos.""",
        "wiki_syntax": "SELECT AVG(col), MIN(col), MAX(col) FROM tabla WHERE condición;",
        "wiki_example": "SELECT AVG(edad), MIN(edad), MAX(edad) FROM cliente WHERE ciudad='Sevilla';",
        "solution_sql": "SELECT AVG(edad), MIN(edad), MAX(edad) FROM cliente WHERE ciudad = 'Madrid';",
        "xp_reward": 80,
    },
    {
        "title": "Ejercicio 36",
        "category": "07 - Subconsultas y otros",
        "order_num": 36,
        "difficulty": "intermedio",
        "description": "Para cada <code>categoria_id</code>, muestra el número de productos, el precio mínimo y el precio máximo. Muestra solo las categorías con <b>al menos 3 productos</b>, ordenado por número de productos descendente.",
        "wiki_title": "GROUP BY + HAVING + ORDER BY",
        "wiki_content": """Este ejercicio combina todo lo aprendido: GROUP BY para agrupar, funciones de agregación para resumir, HAVING para filtrar grupos y ORDER BY para ordenar el resultado final.

Es el patrón más completo de análisis de datos básico en SQL, equivalente a las tablas dinámicas en Excel pero mucho más potente.""",
        "wiki_syntax": "SELECT col, COUNT(*), MIN(c), MAX(c) FROM tabla GROUP BY col HAVING COUNT(*) >= n ORDER BY COUNT(*) DESC;",
        "wiki_example": "SELECT categoria_id, COUNT(*), MIN(precio), MAX(precio) FROM producto GROUP BY categoria_id HAVING COUNT(*) >= 2;",
        "solution_sql": "SELECT categoria_id, COUNT(*), MIN(precio), MAX(precio) FROM producto GROUP BY categoria_id HAVING COUNT(*) >= 3 ORDER BY COUNT(*) DESC;",
        "xp_reward": 100,
    },
    # ── 37: EXAMEN FINAL ─────────────────────────────────────
    {
        "title": "Ejercicio 37 — Examen",
        "category": "08 - Examen Final",
        "order_num": 37,
        "difficulty": "avanzado",
        "description": """🎓 <b>Examen: Consultas Sencillas</b><br><br>
Demuestra lo que has aprendido con esta consulta avanzada:<br><br>
Muestra el <b>estado de los pedidos</b> junto con el <b>número de pedidos</b> de cada estado,
el <b>total facturado</b> (suma de <code>total</code>) y el <b>importe medio por pedido</b>.
Solo incluye estados con <b>más de 1 pedido</b>.
Ordena los resultados de mayor a menor total facturado.
<br><br>
<i>Columnas esperadas: estado, num_pedidos, total_facturado, importe_medio</i>""",
        "wiki_title": "Examen — Consultas Sencillas",
        "wiki_content": """Este ejercicio final combina todos los conocimientos del módulo:

- **SELECT** con columnas calculadas y alias
- **GROUP BY** para agrupar por estado del pedido
- **COUNT**, **SUM** y **AVG** como funciones de agregación
- **HAVING** para filtrar grupos con más de 1 pedido
- **ORDER BY** para ordenar el resultado final

Si llegas hasta aquí y resuelves este ejercicio, dominas las bases de SQL para consultas de selección y análisis.""",
        "wiki_syntax": """SELECT col, COUNT(*) AS alias1, SUM(col2) AS alias2, AVG(col2) AS alias3
FROM tabla
GROUP BY col
HAVING COUNT(*) > n
ORDER BY alias2 DESC;""",
        "wiki_example": """SELECT estado, COUNT(*) AS num_pedidos,
       SUM(total) AS total_facturado,
       AVG(total) AS importe_medio
FROM pedido
GROUP BY estado
HAVING COUNT(*) > 1
ORDER BY total_facturado DESC;""",
        "solution_sql": """SELECT estado,
       COUNT(*) AS num_pedidos,
       SUM(total) AS total_facturado,
       AVG(total) AS importe_medio
FROM pedido
GROUP BY estado
HAVING COUNT(*) > 1
ORDER BY total_facturado DESC;""",
        "xp_reward": 200,
    },
]


# ──────────────────────────────────────────────────────────────
# MAIN: insertar en BD
# ──────────────────────────────────────────────────────────────

def run():
    create_tables()
    db = SessionLocal()

    # Buscar dataset existente
    dataset = db.query(SQLDataset).filter(SQLDataset.name == "Tienda").first()
    
    if not dataset:
        print("[+] Creando nuevo dataset 'Tienda'...")
        dataset = SQLDataset(
            name="Tienda",
            description="Base de datos de una tienda de informática con productos, clientes, pedidos y proveedores.",
            schema_sql=SCHEMA_SQL,
            seed_sql=SEED_SQL,
            er_diagram_url=None,
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
    else:
        print(f"⚠️  El dataset 'Tienda' ya existe (ID={dataset.id}). Actualizando metadatos y ejercicios...")
        dataset.description = "Base de datos de una tienda de informática con productos, clientes, pedidos y proveedores."
        dataset.schema_sql = SCHEMA_SQL
        dataset.seed_sql = SEED_SQL
        db.commit()

    # Crear o actualizar ejercicios
    for i, ex_data in enumerate(EXERCISES):
        try:
            expected = compute_expected(ex_data["solution_sql"])
            
            # Intentar buscar ejercicio por order_num dentro de este dataset
            ex = db.query(SQLExercise).filter(
                SQLExercise.dataset_id == dataset.id,
                SQLExercise.order_num == ex_data["order_num"]
            ).first()

            if ex:
                # Actualizar existente (evita romper FK con progreso de alumnos)
                ex.title = ex_data["title"]
                ex.category = ex_data["category"]
                ex.difficulty = ex_data["difficulty"]
                ex.description = ex_data["description"]
                ex.wiki_title = ex_data.get("wiki_title")
                ex.wiki_content = ex_data.get("wiki_content")
                ex.wiki_syntax = ex_data.get("wiki_syntax")
                ex.wiki_example = ex_data.get("wiki_example")
                ex.solution_sql = ex_data["solution_sql"]
                ex.expected_result = expected
                ex.xp_reward = ex_data["xp_reward"]
                ex.is_active = True
                print(f"  ✓ Actualizado: {ex_data['title']}")
            else:
                # Crear nuevo
                ex = SQLExercise(
                    dataset_id=dataset.id,
                    title=ex_data["title"],
                    category=ex_data["category"],
                    order_num=ex_data["order_num"],
                    difficulty=ex_data["difficulty"],
                    description=ex_data["description"],
                    wiki_title=ex_data.get("wiki_title"),
                    wiki_content=ex_data.get("wiki_content"),
                    wiki_syntax=ex_data.get("wiki_syntax"),
                    wiki_example=ex_data.get("wiki_example"),
                    solution_sql=ex_data["solution_sql"],
                    expected_result=expected,
                    xp_reward=ex_data["xp_reward"],
                    is_active=True,
                )
                db.add(ex)
                print(f"  + Creado: {ex_data['title']}")

        except Exception as e:
            print(f"  ❌ Error en {ex_data['title']}: {e}")

    db.commit()
    db.close()
    print(f"\n🎉 Seed completado para 'Tienda'")


if __name__ == "__main__":
    run()
