"""
Seed: SQL Skills — 4 Nuevos Modos de Ejercicios
  · fill_blank    (Completa el hueco)   — 10 ejercicios
  · find_bug      (Encuentra el error)  — 10 ejercicios
  · order_clauses (Ordena las cláusulas)— 10 ejercicios
  · reverse_query (Query inversa)       — 10 ejercicios

Ejecutar: python seed_new_modes.py
Los ejercicios usan el dataset "Tienda" ya existente.
"""
import json
import sqlite3
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, SQLDataset, SQLExercise, create_tables

# ── SCHEMA + SEED del dataset Tienda (igual que seed_sql_skills.py) ──────────
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
(1,'Electrónica','Dispositivos y gadgets electrónicos'),
(2,'Informática','Hardware y accesorios para ordenadores'),
(3,'Periféricos','Teclados, ratones, monitores y más'),
(4,'Audio','Auriculares, altavoces y sistemas de sonido'),
(5,'Almacenamiento','Discos duros, SSDs y memorias USB');

INSERT INTO proveedor VALUES
(1,'TechDistrib SL','Madrid','España'),
(2,'InfoParts Ltd','Barcelona','España'),
(3,'GlobalComp GmbH','Berlín','Alemania'),
(4,'SoundPro Inc','Nueva York','EEUU'),
(5,'StorageWorld SA','París','Francia');

INSERT INTO producto VALUES
(1,'Disco duro SATA 1TB',59.99,120,5,5),
(2,'SSD NVMe 500GB',89.99,85,5,5),
(3,'Memoria RAM DDR4 16GB',49.99,200,2,2),
(4,'Teclado mecánico RGB',79.99,60,3,1),
(5,'Ratón inalámbrico',34.99,150,3,2),
(6,'Monitor IPS 24"',199.99,40,3,3),
(7,'Auriculares Gaming',59.99,75,4,4),
(8,'Tarjeta gráfica RTX 3060',399.99,25,2,3),
(9,'Procesador Intel i7',299.99,30,2,3),
(10,'Placa base ATX',179.99,45,2,2),
(11,'Webcam Full HD',49.99,90,1,1),
(12,'Altavoz Bluetooth',39.99,110,4,4),
(13,'Hub USB-C 7 puertos',29.99,200,1,2),
(14,'Fuente de alimentación 650W',89.99,55,2,1),
(15,'Caja ATX Mid-Tower',69.99,35,2,3),
(16,'Memoria USB 64GB',12.99,500,5,5),
(17,'Tarjeta SD 128GB',19.99,300,5,5),
(18,'Micrófono de condensador',89.99,40,4,4),
(19,'Alfombrilla XL gaming',24.99,180,3,1),
(20,'Regleta con USB',21.99,250,1,1);

INSERT INTO cliente VALUES
(1,'Ana García','ana@email.com','Madrid',28,'2023-01-15'),
(2,'Carlos López','carlos@email.com','Barcelona',35,'2023-02-20'),
(3,'María Martínez','maria@email.com','Madrid',42,'2023-03-10'),
(4,'Juan Sánchez','juan@email.com','Valencia',25,'2023-04-05'),
(5,'Laura Rodríguez','laura@email.com','Sevilla',31,'2023-04-18'),
(6,'Pedro Fernández','pedro@email.com','Madrid',38,'2023-05-22'),
(7,'Sofía González','sofia@email.com','Bilbao',29,'2023-06-01'),
(8,'Andrés Jiménez','andres@email.com','Barcelona',45,'2023-06-15'),
(9,'Elena Ruiz','elena@email.com','Madrid',33,'2023-07-08'),
(10,'David Díaz','david@email.com','Zaragoza',27,'2023-07-20'),
(11,'Isabel Torres','isabel@email.com','Valencia',40,'2023-08-03'),
(12,'Miguel Moreno','miguel@email.com','Madrid',36,'2023-08-19'),
(13,'Carmen López','carmen@email.com','Málaga',52,'2023-09-11'),
(14,'Alberto Navarro','alberto@email.com','Barcelona',24,'2023-09-25'),
(15,'Patricia Castro','patricia@email.com','Sevilla',30,'2023-10-07');

INSERT INTO pedido VALUES
(1,1,'2024-01-10',149.98,'entregado'),
(2,2,'2024-01-15',399.99,'entregado'),
(3,3,'2024-01-20',699.97,'enviado'),
(4,4,'2024-02-05',84.98,'entregado'),
(5,5,'2024-02-12',199.99,'entregado'),
(6,1,'2024-02-18',299.99,'cancelado'),
(7,6,'2024-03-01',129.98,'entregado'),
(8,7,'2024-03-08',479.98,'enviado'),
(9,8,'2024-03-15',249.98,'entregado'),
(10,9,'2024-03-22',109.98,'procesando'),
(11,10,'2024-04-02',399.99,'entregado'),
(12,2,'2024-04-10',179.99,'entregado'),
(13,11,'2024-04-18',629.98,'enviado'),
(14,12,'2024-05-05',99.98,'entregado'),
(15,3,'2024-05-14',449.98,'entregado');

INSERT INTO linea_pedido VALUES
(1,1,1,1,59.99),(2,1,4,1,79.99),(3,2,8,1,399.99),
(4,3,9,1,299.99),(5,3,3,2,49.99),(6,3,16,1,12.99),
(7,4,5,1,34.99),(8,4,7,1,59.99),(9,5,6,1,199.99),
(10,6,9,1,299.99),(11,7,5,1,34.99),(12,7,13,1,29.99),
(13,7,19,1,24.99),(14,7,20,1,21.99),(15,8,6,1,199.99),
(16,8,7,1,59.99),(17,8,11,1,49.99),(18,8,4,1,79.99),
(19,8,5,1,34.99),(20,8,12,1,39.99),(21,9,2,1,89.99),
(22,9,3,2,49.99),(23,10,7,1,59.99),(24,10,12,1,39.99),
(25,11,8,1,399.99),(26,12,10,1,179.99),(27,13,8,1,399.99),
(28,13,9,1,299.99),(29,13,16,1,12.99),(30,14,5,1,34.99),
(31,14,19,1,24.99),(32,14,13,1,29.99),(33,15,6,1,199.99),
(34,15,4,1,79.99),(35,15,2,1,89.99),(36,15,18,1,89.99);
"""


def compute_expected(solution_sql: str) -> str:
    conn = sqlite3.connect(":memory:")
    conn.executescript(SCHEMA_SQL)
    conn.executescript(SEED_SQL)
    cursor = conn.execute(solution_sql)
    columns = [d[0] for d in cursor.description] if cursor.description else []
    rows = [list(r) for r in cursor.fetchall()]
    conn.close()
    return json.dumps({"columns": columns, "rows": rows})


# ══════════════════════════════════════════════════════════════════════════════
# 1. COMPLETA EL HUECO (fill_blank)
#    template_sql: query con ___ en los huecos a rellenar
#    solution_sql: query completa y correcta para validar
# ══════════════════════════════════════════════════════════════════════════════

FILL_BLANK_EXERCISES = [
    {
        "title": "Hueco 1 — SELECT básico",
        "category": "Completa el Hueco",
        "order_num": 1,
        "difficulty": "basico",
        "description": "Completa los huecos para listar el <b>nombre</b> de todos los productos de la tabla <code>producto</code>.",
        "wiki_title": "SELECT — Columnas específicas",
        "wiki_content": "**SELECT** seguido de un nombre de columna extrae solo esa columna de la tabla indicada en **FROM**.",
        "wiki_syntax": "SELECT ___ FROM ___;",
        "wiki_example": "SELECT nombre FROM categoria;",
        "solution_sql": "SELECT nombre FROM producto;",
        "template_sql": "SELECT ___ FROM ___;",
        "xp_reward": 30,
        "exercise_type": "fill_blank",
    },
    {
        "title": "Hueco 2 — Dos columnas",
        "category": "Completa el Hueco",
        "order_num": 2,
        "difficulty": "basico",
        "description": "Rellena los huecos para mostrar el <b>nombre</b> y el <b>precio</b> de todos los productos.",
        "wiki_title": "SELECT con varias columnas",
        "wiki_content": "Puedes seleccionar múltiples columnas separándolas por comas.",
        "wiki_syntax": "SELECT col1, ___ FROM ___;",
        "wiki_example": "SELECT nombre, stock FROM producto;",
        "solution_sql": "SELECT nombre, precio FROM producto;",
        "template_sql": "SELECT nombre, ___ FROM ___;",
        "xp_reward": 30,
        "exercise_type": "fill_blank",
    },
    {
        "title": "Hueco 3 — WHERE numérico",
        "category": "Completa el Hueco",
        "order_num": 3,
        "difficulty": "basico",
        "description": "Completa el hueco del operador para obtener los productos con precio <b>mayor que 100€</b>.",
        "wiki_title": "WHERE con operadores",
        "wiki_content": "Los operadores de comparación en SQL son: `=`, `<>`, `>`, `<`, `>=`, `<=`.",
        "wiki_syntax": "SELECT * FROM producto WHERE precio ___ 100;",
        "wiki_example": "SELECT * FROM producto WHERE precio > 50;",
        "solution_sql": "SELECT * FROM producto WHERE precio > 100;",
        "template_sql": "SELECT * FROM producto WHERE precio ___ 100;",
        "xp_reward": 40,
        "exercise_type": "fill_blank",
    },
    {
        "title": "Hueco 4 — ORDER BY",
        "category": "Completa el Hueco",
        "order_num": 4,
        "difficulty": "basico",
        "description": "Rellena los huecos para obtener los nombres de productos ordenados por precio de <b>mayor a menor</b>.",
        "wiki_title": "ORDER BY descendente",
        "wiki_content": "`ORDER BY columna DESC` ordena los resultados de mayor a menor.",
        "wiki_syntax": "SELECT nombre FROM producto ORDER BY ___ ___;",
        "wiki_example": "SELECT nombre FROM producto ORDER BY stock DESC;",
        "solution_sql": "SELECT nombre FROM producto ORDER BY precio DESC;",
        "template_sql": "SELECT nombre FROM producto ORDER BY ___ ___;",
        "xp_reward": 40,
        "exercise_type": "fill_blank",
    },
    {
        "title": "Hueco 5 — COUNT",
        "category": "Completa el Hueco",
        "order_num": 5,
        "difficulty": "basico",
        "description": "Completa para contar el <b>número total de clientes</b> registrados.",
        "wiki_title": "COUNT(*)",
        "wiki_content": "`COUNT(*)` devuelve el número total de filas de la tabla.",
        "wiki_syntax": "SELECT ___(*) FROM cliente;",
        "wiki_example": "SELECT COUNT(*) FROM pedido;",
        "solution_sql": "SELECT COUNT(*) FROM cliente;",
        "template_sql": "SELECT ___(*) FROM cliente;",
        "xp_reward": 40,
        "exercise_type": "fill_blank",
    },
    {
        "title": "Hueco 6 — LIMIT",
        "category": "Completa el Hueco",
        "order_num": 6,
        "difficulty": "basico",
        "description": "Rellena para obtener solo los <b>3 productos más baratos</b>.",
        "wiki_title": "LIMIT — Limitar resultados",
        "wiki_content": "`LIMIT n` restringe el número de filas devueltas a los primeros *n* registros.",
        "wiki_syntax": "SELECT nombre, precio FROM producto ORDER BY precio ASC LIMIT ___;",
        "wiki_example": "SELECT nombre FROM producto ORDER BY stock ASC LIMIT 5;",
        "solution_sql": "SELECT nombre, precio FROM producto ORDER BY precio ASC LIMIT 3;",
        "template_sql": "SELECT nombre, precio FROM producto ORDER BY precio ASC LIMIT ___;",
        "xp_reward": 40,
        "exercise_type": "fill_blank",
    },
    {
        "title": "Hueco 7 — GROUP BY",
        "category": "Completa el Hueco",
        "order_num": 7,
        "difficulty": "intermedio",
        "description": "Completa los huecos para contar cuántos clientes hay en cada <b>ciudad</b>.",
        "wiki_title": "GROUP BY + COUNT",
        "wiki_content": "`GROUP BY` agrupa las filas con el mismo valor en una columna. Combinado con `COUNT(*)` cuenta cuántas hay por grupo.",
        "wiki_syntax": "SELECT ciudad, ___(*) FROM cliente GROUP BY ___;",
        "wiki_example": "SELECT estado, COUNT(*) FROM pedido GROUP BY estado;",
        "solution_sql": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad;",
        "template_sql": "SELECT ciudad, ___(*) FROM cliente GROUP BY ___;",
        "xp_reward": 60,
        "exercise_type": "fill_blank",
    },
    {
        "title": "Hueco 8 — AVG y alias",
        "category": "Completa el Hueco",
        "order_num": 8,
        "difficulty": "intermedio",
        "description": "Rellena los huecos para calcular el <b>precio medio</b> de los productos con el alias <code>precio_medio</code>.",
        "wiki_title": "AVG + AS alias",
        "wiki_content": "`AVG(columna)` calcula la media. `AS alias` le pone nombre al resultado.",
        "wiki_syntax": "SELECT ___(precio) AS ___ FROM producto;",
        "wiki_example": "SELECT SUM(total) AS total_ventas FROM pedido;",
        "solution_sql": "SELECT AVG(precio) AS precio_medio FROM producto;",
        "template_sql": "SELECT ___(precio) AS ___ FROM producto;",
        "xp_reward": 60,
        "exercise_type": "fill_blank",
    },
    {
        "title": "Hueco 9 — HAVING",
        "category": "Completa el Hueco",
        "order_num": 9,
        "difficulty": "intermedio",
        "description": "Completa la query para mostrar solo las <b>ciudades con más de 2 clientes</b>.",
        "wiki_title": "HAVING — Filtrar grupos",
        "wiki_content": "`HAVING` filtra después del `GROUP BY`, igual que `WHERE` filtra filas individuales. Es obligatorio usar `HAVING` (no `WHERE`) cuando el filtro involucra una función de agregación.",
        "wiki_syntax": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad ___ COUNT(*) > 2;",
        "wiki_example": "SELECT estado, COUNT(*) FROM pedido GROUP BY estado HAVING COUNT(*) > 3;",
        "solution_sql": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad HAVING COUNT(*) > 2;",
        "template_sql": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad ___ COUNT(*) > 2;",
        "xp_reward": 70,
        "exercise_type": "fill_blank",
    },
    {
        "title": "Hueco 10 — Subconsulta",
        "category": "Completa el Hueco",
        "order_num": 10,
        "difficulty": "avanzado",
        "description": "Completa los huecos para listar productos cuyo precio supera el <b>precio medio del catálogo</b>.",
        "wiki_title": "Subconsulta en WHERE",
        "wiki_content": "Una subconsulta es una `SELECT` dentro de otra. La interior se ejecuta primero y su resultado se usa como valor de comparación.",
        "wiki_syntax": "SELECT nombre, precio FROM producto WHERE precio > (___ ___(___) FROM producto);",
        "wiki_example": "SELECT nombre FROM producto WHERE stock > (SELECT AVG(stock) FROM producto);",
        "solution_sql": "SELECT nombre, precio FROM producto WHERE precio > (SELECT AVG(precio) FROM producto);",
        "template_sql": "SELECT nombre, precio FROM producto WHERE precio > (___ ___(___) FROM producto);",
        "xp_reward": 90,
        "exercise_type": "fill_blank",
    },
]


# ══════════════════════════════════════════════════════════════════════════════
# 2. ENCUENTRA EL ERROR (find_bug)
#    buggy_sql: la query incorrecta pre-cargada en el editor
#    solution_sql: la query correcta para comparar el resultado
# ══════════════════════════════════════════════════════════════════════════════

FIND_BUG_EXERCISES = [
    {
        "title": "Bug 1 — Nombre de columna",
        "category": "Encuentra el Error",
        "order_num": 1,
        "difficulty": "basico",
        "description": "La query debería listar el <b>nombre</b> y el <b>precio</b> de todos los productos, pero falla. <b>Encuentra y corrige el error.</b>",
        "wiki_title": "Nombres de columna correctos",
        "wiki_content": "Los nombres de columna deben coincidir exactamente con los de la tabla. Usa `PRAGMA table_info(tabla)` o el panel Schema para consultarlos.",
        "wiki_syntax": "SELECT nombre_columna_correcto FROM tabla;",
        "wiki_example": "SELECT nombre, precio FROM producto;",
        "solution_sql": "SELECT nombre, precio FROM producto;",
        "buggy_sql": "SELECT nombre, prize FROM producto;",
        "xp_reward": 40,
        "exercise_type": "find_bug",
    },
    {
        "title": "Bug 2 — Tabla incorrecta",
        "category": "Encuentra el Error",
        "order_num": 2,
        "difficulty": "basico",
        "description": "La query quiere obtener todos los clientes de Madrid, pero apunta a la tabla equivocada. <b>Corrígela.</b>",
        "wiki_title": "Nombre de tabla correcto",
        "wiki_content": "El nombre de la tabla en `FROM` debe coincidir exactamente con el de la base de datos.",
        "wiki_syntax": "SELECT * FROM nombre_tabla_correcto WHERE ciudad = 'Madrid';",
        "wiki_example": "SELECT * FROM cliente WHERE ciudad = 'Madrid';",
        "solution_sql": "SELECT * FROM cliente WHERE ciudad = 'Madrid';",
        "buggy_sql": "SELECT * FROM clientes WHERE ciudad = 'Madrid';",
        "xp_reward": 40,
        "exercise_type": "find_bug",
    },
    {
        "title": "Bug 3 — Operador lógico",
        "category": "Encuentra el Error",
        "order_num": 3,
        "difficulty": "basico",
        "description": "La query quiere mostrar productos con precio entre 50€ y 150€, pero devuelve resultados incorrectos. <b>¿Cuál es el operador equivocado?</b>",
        "wiki_title": "AND vs OR",
        "wiki_content": "**AND** requiere que ambas condiciones sean verdaderas. **OR** solo requiere que una lo sea. Para rangos siempre usa AND.",
        "wiki_syntax": "SELECT * FROM producto WHERE precio >= 50 AND precio <= 150;",
        "wiki_example": "SELECT * FROM producto WHERE precio >= 30 AND precio <= 60;",
        "solution_sql": "SELECT * FROM producto WHERE precio >= 50 AND precio <= 150;",
        "buggy_sql": "SELECT * FROM producto WHERE precio >= 50 OR precio <= 150;",
        "xp_reward": 50,
        "exercise_type": "find_bug",
    },
    {
        "title": "Bug 4 — ORDER y dirección",
        "category": "Encuentra el Error",
        "order_num": 4,
        "difficulty": "basico",
        "description": "La query debería mostrar los 5 productos más <b>caros</b>, pero los ordena al revés. <b>Corrige la dirección del orden.</b>",
        "wiki_title": "ORDER BY ASC vs DESC",
        "wiki_content": "`ASC` ordena de menor a mayor (por defecto). `DESC` ordena de mayor a menor. Para encontrar los más caros necesitas `DESC`.",
        "wiki_syntax": "SELECT nombre, precio FROM producto ORDER BY precio DESC LIMIT 5;",
        "wiki_example": "SELECT nombre FROM producto ORDER BY precio DESC LIMIT 3;",
        "solution_sql": "SELECT nombre, precio FROM producto ORDER BY precio DESC LIMIT 5;",
        "buggy_sql": "SELECT nombre, precio FROM producto ORDER BY precio ASC LIMIT 5;",
        "xp_reward": 40,
        "exercise_type": "find_bug",
    },
    {
        "title": "Bug 5 — WHERE vs HAVING",
        "category": "Encuentra el Error",
        "order_num": 5,
        "difficulty": "intermedio",
        "description": "La query quiere mostrar ciudades con más de 2 clientes, pero da error de sintaxis. <b>¿Qué cláusula hay que cambiar?</b>",
        "wiki_title": "WHERE no puede filtrar agregaciones",
        "wiki_content": "No puedes usar `WHERE COUNT(*) > 2` porque WHERE se ejecuta antes del agrupamiento. Necesitas `HAVING`, que filtra después de `GROUP BY`.",
        "wiki_syntax": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad HAVING COUNT(*) > 2;",
        "wiki_example": "SELECT estado, COUNT(*) FROM pedido GROUP BY estado HAVING COUNT(*) > 1;",
        "solution_sql": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad HAVING COUNT(*) > 2;",
        "buggy_sql": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad WHERE COUNT(*) > 2;",
        "xp_reward": 60,
        "exercise_type": "find_bug",
    },
    {
        "title": "Bug 6 — GROUP BY incompleto",
        "category": "Encuentra el Error",
        "order_num": 6,
        "difficulty": "intermedio",
        "description": "La query calcula el precio medio por categoría, pero da error porque falta algo en el <code>SELECT</code>. <b>Identifica qué sobra o falta.</b>",
        "wiki_title": "SELECT debe coincidir con GROUP BY",
        "wiki_content": "Toda columna no agregada del `SELECT` debe aparecer en `GROUP BY`. Si agregas `nombre` al SELECT, también debe ir en GROUP BY (o eliminarlo).",
        "wiki_syntax": "SELECT categoria_id, AVG(precio) FROM producto GROUP BY categoria_id;",
        "wiki_example": "SELECT categoria_id, COUNT(*) FROM producto GROUP BY categoria_id;",
        "solution_sql": "SELECT categoria_id, AVG(precio) FROM producto GROUP BY categoria_id;",
        "buggy_sql": "SELECT categoria_id, nombre, AVG(precio) FROM producto GROUP BY categoria_id;",
        "xp_reward": 70,
        "exercise_type": "find_bug",
    },
    {
        "title": "Bug 7 — Comillas en texto",
        "category": "Encuentra el Error",
        "order_num": 7,
        "difficulty": "basico",
        "description": "La query busca pedidos con estado 'entregado', pero usa comillas dobles en lugar de simples. <b>Corrígela.</b>",
        "wiki_title": "Comillas en SQL",
        "wiki_content": "En SQL estándar, los valores de texto van entre **comillas simples** `'texto'`. Las comillas dobles `\"nombre\"` se reservan para identificadores (nombres de columnas).",
        "wiki_syntax": "SELECT * FROM pedido WHERE estado = 'entregado';",
        "wiki_example": "SELECT * FROM cliente WHERE ciudad = 'Madrid';",
        "solution_sql": "SELECT * FROM pedido WHERE estado = 'entregado';",
        "buggy_sql": 'SELECT * FROM pedido WHERE estado = "entregado";',
        "xp_reward": 40,
        "exercise_type": "find_bug",
    },
    {
        "title": "Bug 8 — Función mal escrita",
        "category": "Encuentra el Error",
        "order_num": 8,
        "difficulty": "basico",
        "description": "La query quiere calcular el stock total de todos los productos, pero la función de agregación está mal escrita. <b>Corrígela.</b>",
        "wiki_title": "Funciones de agregación",
        "wiki_content": "Las funciones de agregación en SQL son: `COUNT()`, `SUM()`, `AVG()`, `MAX()`, `MIN()`. Todas en mayúsculas por convención, aunque no son sensibles a mayúsculas.",
        "wiki_syntax": "SELECT SUM(stock) FROM producto;",
        "wiki_example": "SELECT SUM(total) FROM pedido;",
        "solution_sql": "SELECT SUM(stock) FROM producto;",
        "buggy_sql": "SELECT SUMA(stock) FROM producto;",
        "xp_reward": 40,
        "exercise_type": "find_bug",
    },
    {
        "title": "Bug 9 — Subconsulta incompleta",
        "category": "Encuentra el Error",
        "order_num": 9,
        "difficulty": "avanzado",
        "description": "La query debería listar productos más caros que el precio medio, pero la subconsulta está mal construida. <b>Encuéntra el error.</b>",
        "wiki_title": "Subconsultas: tabla y columna correctas",
        "wiki_content": "La subconsulta debe calcular la media sobre la misma columna `precio` y la misma tabla `producto`. Si la tabla o columna son incorrectas, el resultado será erróneo.",
        "wiki_syntax": "SELECT nombre FROM producto WHERE precio > (SELECT AVG(precio) FROM producto);",
        "wiki_example": "SELECT nombre FROM producto WHERE stock > (SELECT AVG(stock) FROM producto);",
        "solution_sql": "SELECT nombre, precio FROM producto WHERE precio > (SELECT AVG(precio) FROM producto);",
        "buggy_sql": "SELECT nombre, precio FROM producto WHERE precio > (SELECT AVG(total) FROM pedido);",
        "xp_reward": 80,
        "exercise_type": "find_bug",
    },
    {
        "title": "Bug 10 — LIKE mal aplicado",
        "category": "Encuentra el Error",
        "order_num": 10,
        "difficulty": "intermedio",
        "description": "La query busca productos cuyo nombre <b>empiece</b> por 'Memoria', pero el patrón LIKE está mal colocado. <b>Corrígelo.</b>",
        "wiki_title": "LIKE y comodines",
        "wiki_content": "`%` es el comodín de LIKE que representa cualquier secuencia de caracteres. Para 'empiece por X' usa `'X%'`. Para 'termine en X' usa `'%X'`. Para 'contenga X' usa `'%X%'`.",
        "wiki_syntax": "SELECT nombre FROM producto WHERE nombre LIKE 'Memoria%';",
        "wiki_example": "SELECT nombre FROM producto WHERE nombre LIKE 'SSD%';",
        "solution_sql": "SELECT nombre FROM producto WHERE nombre LIKE 'Memoria%';",
        "buggy_sql": "SELECT nombre FROM producto WHERE nombre LIKE '%Memoria';",
        "xp_reward": 60,
        "exercise_type": "find_bug",
    },
]


# ══════════════════════════════════════════════════════════════════════════════
# 3. ORDENA LAS CLÁUSULAS (order_clauses)
#    fragments: JSON array con los fragmentos SQL a ordenar (pre-mezclados)
#    solution_sql: la query completa y correcta (para validar resultado)
# ══════════════════════════════════════════════════════════════════════════════

ORDER_CLAUSES_EXERCISES = [
    {
        "title": "Orden 1 — SELECT básico",
        "category": "Ordena las Cláusulas",
        "order_num": 1,
        "difficulty": "basico",
        "description": "Arrastra los fragmentos para construir una query que liste el <b>nombre y precio</b> de todos los productos.",
        "wiki_title": "Estructura SELECT … FROM",
        "wiki_content": "El orden básico de SQL es: **SELECT** (qué columnas) → **FROM** (de qué tabla). Siempre SELECT antes que FROM.",
        "wiki_syntax": "SELECT columnas FROM tabla;",
        "wiki_example": "SELECT nombre FROM categoria;",
        "solution_sql": "SELECT nombre, precio FROM producto;",
        "fragments": json.dumps(["FROM producto", "SELECT nombre, precio"]),
        "xp_reward": 30,
        "exercise_type": "order_clauses",
    },
    {
        "title": "Orden 2 — Con WHERE",
        "category": "Ordena las Cláusulas",
        "order_num": 2,
        "difficulty": "basico",
        "description": "Ordena los fragmentos para obtener los productos con stock <b>mayor que 100</b>.",
        "wiki_title": "SELECT → FROM → WHERE",
        "wiki_content": "Cuando añades un filtro, el orden es: **SELECT** → **FROM** → **WHERE**. La cláusula WHERE siempre va después de FROM.",
        "wiki_syntax": "SELECT col FROM tabla WHERE condición;",
        "wiki_example": "SELECT nombre FROM producto WHERE precio > 50;",
        "solution_sql": "SELECT nombre, stock FROM producto WHERE stock > 100;",
        "fragments": json.dumps(["WHERE stock > 100", "FROM producto", "SELECT nombre, stock"]),
        "xp_reward": 40,
        "exercise_type": "order_clauses",
    },
    {
        "title": "Orden 3 — Con ORDER BY",
        "category": "Ordena las Cláusulas",
        "order_num": 3,
        "difficulty": "basico",
        "description": "Construye la query que lista clientes ordenados por <b>edad ascendente</b>.",
        "wiki_title": "ORDER BY al final",
        "wiki_content": "**ORDER BY** siempre va al final de la consulta, después de FROM y WHERE.",
        "wiki_syntax": "SELECT col FROM tabla ORDER BY col ASC;",
        "wiki_example": "SELECT nombre FROM cliente ORDER BY edad DESC;",
        "solution_sql": "SELECT nombre, edad FROM cliente ORDER BY edad ASC;",
        "fragments": json.dumps(["SELECT nombre, edad", "ORDER BY edad ASC", "FROM cliente"]),
        "xp_reward": 40,
        "exercise_type": "order_clauses",
    },
    {
        "title": "Orden 4 — WHERE + ORDER BY",
        "category": "Ordena las Cláusulas",
        "order_num": 4,
        "difficulty": "basico",
        "description": "Ordena los fragmentos para listar los productos de categoría 2, ordenados por precio de menor a mayor.",
        "wiki_title": "Orden: FROM → WHERE → ORDER BY",
        "wiki_content": "Cuando combinas **WHERE** y **ORDER BY**, el orden es: SELECT → FROM → WHERE → ORDER BY. WHERE filtra primero, luego se ordena.",
        "wiki_syntax": "SELECT * FROM tabla WHERE col = val ORDER BY otro_col ASC;",
        "wiki_example": "SELECT nombre FROM producto WHERE categoria_id = 1 ORDER BY precio ASC;",
        "solution_sql": "SELECT nombre, precio FROM producto WHERE categoria_id = 2 ORDER BY precio ASC;",
        "fragments": json.dumps(["SELECT nombre, precio", "WHERE categoria_id = 2", "FROM producto", "ORDER BY precio ASC"]),
        "xp_reward": 50,
        "exercise_type": "order_clauses",
    },
    {
        "title": "Orden 5 — Con LIMIT",
        "category": "Ordena las Cláusulas",
        "order_num": 5,
        "difficulty": "basico",
        "description": "Construye la query que obtiene los <b>5 pedidos más recientes</b>.",
        "wiki_title": "LIMIT va al final del todo",
        "wiki_content": "**LIMIT** siempre es la última cláusula. El orden completo es: SELECT → FROM → WHERE → ORDER BY → LIMIT.",
        "wiki_syntax": "SELECT * FROM tabla ORDER BY col DESC LIMIT n;",
        "wiki_example": "SELECT * FROM pedido ORDER BY fecha DESC LIMIT 3;",
        "solution_sql": "SELECT * FROM pedido ORDER BY fecha DESC LIMIT 5;",
        "fragments": json.dumps(["ORDER BY fecha DESC", "SELECT *", "LIMIT 5", "FROM pedido"]),
        "xp_reward": 50,
        "exercise_type": "order_clauses",
    },
    {
        "title": "Orden 6 — GROUP BY",
        "category": "Ordena las Cláusulas",
        "order_num": 6,
        "difficulty": "intermedio",
        "description": "Ordena los fragmentos para contar cuántos productos hay en cada categoría.",
        "wiki_title": "FROM → GROUP BY",
        "wiki_content": "Cuando usas funciones de agregación, el orden es: SELECT → FROM → GROUP BY. El GROUP BY agrupa las filas antes de que se aplique la función de agregación.",
        "wiki_syntax": "SELECT col, COUNT(*) FROM tabla GROUP BY col;",
        "wiki_example": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad;",
        "solution_sql": "SELECT categoria_id, COUNT(*) FROM producto GROUP BY categoria_id;",
        "fragments": json.dumps(["SELECT categoria_id, COUNT(*)", "GROUP BY categoria_id", "FROM producto"]),
        "xp_reward": 60,
        "exercise_type": "order_clauses",
    },
    {
        "title": "Orden 7 — GROUP BY + HAVING",
        "category": "Ordena las Cláusulas",
        "order_num": 7,
        "difficulty": "intermedio",
        "description": "Construye la query que muestra ciudades con <b>más de 2 clientes</b>.",
        "wiki_title": "GROUP BY → HAVING",
        "wiki_content": "**HAVING** siempre va después de **GROUP BY**. No puede ir antes ni en lugar de WHERE.",
        "wiki_syntax": "SELECT col, COUNT(*) FROM tabla GROUP BY col HAVING COUNT(*) > n;",
        "wiki_example": "SELECT estado, COUNT(*) FROM pedido GROUP BY estado HAVING COUNT(*) > 2;",
        "solution_sql": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad HAVING COUNT(*) > 2;",
        "fragments": json.dumps(["FROM cliente", "HAVING COUNT(*) > 2", "SELECT ciudad, COUNT(*)", "GROUP BY ciudad"]),
        "xp_reward": 70,
        "exercise_type": "order_clauses",
    },
    {
        "title": "Orden 8 — WHERE + GROUP BY + HAVING",
        "category": "Ordena las Cláusulas",
        "order_num": 8,
        "difficulty": "intermedio",
        "description": "Ordena todos los fragmentos para listar categorías (solo Electrónica e Informática) con precio medio mayor de 80€.",
        "wiki_title": "WHERE → GROUP BY → HAVING",
        "wiki_content": "**WHERE** filtra filas individuales antes del agrupamiento. **GROUP BY** agrupa. **HAVING** filtra grupos. Este orden es obligatorio.",
        "wiki_syntax": "SELECT col, AVG(c) FROM tabla WHERE condición GROUP BY col HAVING AVG(c) > n;",
        "wiki_example": "SELECT categoria_id, AVG(precio) FROM producto WHERE categoria_id < 4 GROUP BY categoria_id HAVING AVG(precio) > 50;",
        "solution_sql": "SELECT categoria_id, AVG(precio) FROM producto WHERE categoria_id IN (1,2) GROUP BY categoria_id HAVING AVG(precio) > 80;",
        "fragments": json.dumps([
            "SELECT categoria_id, AVG(precio)",
            "FROM producto",
            "WHERE categoria_id IN (1,2)",
            "GROUP BY categoria_id",
            "HAVING AVG(precio) > 80"
        ]),
        "xp_reward": 80,
        "exercise_type": "order_clauses",
    },
    {
        "title": "Orden 9 — Consulta completa",
        "category": "Ordena las Cláusulas",
        "order_num": 9,
        "difficulty": "avanzado",
        "description": "Construye la query que obtiene el <b>estado del pedido</b>, su <b>total facturado</b> y número de pedidos, solo para estados con más de 1 pedido, ordenado por total desc.",
        "wiki_title": "Orden completo SQL",
        "wiki_content": "El orden completo de cláusulas en SQL es: **SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT**. Memorizarlo es fundamental.",
        "wiki_syntax": "SELECT col, SUM(c) FROM tabla GROUP BY col HAVING COUNT(*) > n ORDER BY SUM(c) DESC;",
        "wiki_example": "SELECT estado, COUNT(*) FROM pedido GROUP BY estado HAVING COUNT(*) > 1 ORDER BY COUNT(*) DESC;",
        "solution_sql": "SELECT estado, COUNT(*) AS num_pedidos, SUM(total) AS total_facturado FROM pedido GROUP BY estado HAVING COUNT(*) > 1 ORDER BY total_facturado DESC;",
        "fragments": json.dumps([
            "SELECT estado, COUNT(*) AS num_pedidos, SUM(total) AS total_facturado",
            "FROM pedido",
            "GROUP BY estado",
            "HAVING COUNT(*) > 1",
            "ORDER BY total_facturado DESC"
        ]),
        "xp_reward": 100,
        "exercise_type": "order_clauses",
    },
    {
        "title": "Orden 10 — Columna calculada",
        "category": "Ordena las Cláusulas",
        "order_num": 10,
        "difficulty": "avanzado",
        "description": "Ordena los fragmentos para listar nombre, precio y <b>valor_stock</b> (precio × stock) de productos con valor_stock > 5000, de mayor a menor.",
        "wiki_title": "Columnas calculadas con ORDER BY",
        "wiki_content": "Puedes ordenar por un alias definido en el SELECT. El alias `valor_stock` se puede usar directamente en ORDER BY y WHERE no (usa el cálculo original).",
        "wiki_syntax": "SELECT nombre, precio*stock AS valor_stock FROM producto WHERE precio*stock > n ORDER BY valor_stock DESC;",
        "wiki_example": "SELECT nombre, precio*stock AS vs FROM producto ORDER BY vs DESC LIMIT 5;",
        "solution_sql": "SELECT nombre, precio, precio*stock AS valor_stock FROM producto WHERE precio*stock > 5000 ORDER BY valor_stock DESC;",
        "fragments": json.dumps([
            "SELECT nombre, precio, precio*stock AS valor_stock",
            "FROM producto",
            "WHERE precio*stock > 5000",
            "ORDER BY valor_stock DESC"
        ]),
        "xp_reward": 100,
        "exercise_type": "order_clauses",
    },
]


# ══════════════════════════════════════════════════════════════════════════════
# 4. QUERY INVERSA (reverse_query)
#    solution_sql: query que produce el resultado que verá el usuario
#    El usuario ve el resultado esperado y tiene que escribir la query
# ══════════════════════════════════════════════════════════════════════════════

REVERSE_QUERY_EXERCISES = [
    {
        "title": "Inversa 1 — Una columna",
        "category": "Query Inversa",
        "order_num": 1,
        "difficulty": "basico",
        "description": "El resultado que ves a la derecha son los <b>nombres de todos los productos</b>. Escribe la query que lo produce.",
        "wiki_title": "SELECT de una columna",
        "wiki_content": "Para obtener una sola columna de una tabla, usa `SELECT nombre_columna FROM nombre_tabla`.",
        "wiki_syntax": "SELECT columna FROM tabla;",
        "wiki_example": "SELECT nombre FROM categoria;",
        "solution_sql": "SELECT nombre FROM producto;",
        "xp_reward": 30,
        "exercise_type": "reverse_query",
    },
    {
        "title": "Inversa 2 — Filtro de precio",
        "category": "Query Inversa",
        "order_num": 2,
        "difficulty": "basico",
        "description": "El resultado muestra productos con <b>precio inferior a 30€</b>. Escribe la query que reproduce este resultado exacto.",
        "wiki_title": "WHERE con operador <",
        "wiki_content": "`WHERE precio < 30` filtra solo las filas donde el precio es menor que 30. El `<` excluye el valor exacto 30.",
        "wiki_syntax": "SELECT * FROM producto WHERE precio < 30;",
        "wiki_example": "SELECT * FROM producto WHERE precio < 25;",
        "solution_sql": "SELECT * FROM producto WHERE precio < 30;",
        "xp_reward": 40,
        "exercise_type": "reverse_query",
    },
    {
        "title": "Inversa 3 — Top 3",
        "category": "Query Inversa",
        "order_num": 3,
        "difficulty": "basico",
        "description": "El resultado muestra los <b>3 productos más caros</b> (nombre y precio). Escribe la query.",
        "wiki_title": "ORDER BY + LIMIT",
        "wiki_content": "Para los N más caros: ordena por precio `DESC` y limita con `LIMIT N`.",
        "wiki_syntax": "SELECT nombre, precio FROM producto ORDER BY precio DESC LIMIT 3;",
        "wiki_example": "SELECT nombre FROM producto ORDER BY precio DESC LIMIT 5;",
        "solution_sql": "SELECT nombre, precio FROM producto ORDER BY precio DESC LIMIT 3;",
        "xp_reward": 50,
        "exercise_type": "reverse_query",
    },
    {
        "title": "Inversa 4 — Clientes de Madrid",
        "category": "Query Inversa",
        "order_num": 4,
        "difficulty": "basico",
        "description": "El resultado muestra solo los clientes cuya ciudad es <b>Madrid</b>. Escribe la query que lo produce.",
        "wiki_title": "WHERE con texto",
        "wiki_content": "Para filtrar por un valor de texto exacto usa comillas simples: `WHERE ciudad = 'Madrid'`.",
        "wiki_syntax": "SELECT * FROM cliente WHERE ciudad = 'Madrid';",
        "wiki_example": "SELECT nombre FROM cliente WHERE ciudad = 'Barcelona';",
        "solution_sql": "SELECT * FROM cliente WHERE ciudad = 'Madrid';",
        "xp_reward": 40,
        "exercise_type": "reverse_query",
    },
    {
        "title": "Inversa 5 — Productos baratos ordenados",
        "category": "Query Inversa",
        "order_num": 5,
        "difficulty": "basico",
        "description": "El resultado muestra nombre y precio de productos con precio menor de 50€, <b>ordenados por precio ascendente</b>.",
        "wiki_title": "WHERE + ORDER BY ASC",
        "wiki_content": "Combina `WHERE` para filtrar y `ORDER BY ... ASC` para ordenar de menor a mayor.",
        "wiki_syntax": "SELECT nombre, precio FROM producto WHERE precio < 50 ORDER BY precio ASC;",
        "wiki_example": "SELECT nombre FROM producto WHERE precio < 80 ORDER BY precio ASC;",
        "solution_sql": "SELECT nombre, precio FROM producto WHERE precio < 50 ORDER BY precio ASC;",
        "xp_reward": 50,
        "exercise_type": "reverse_query",
    },
    {
        "title": "Inversa 6 — Conteo por ciudad",
        "category": "Query Inversa",
        "order_num": 6,
        "difficulty": "intermedio",
        "description": "El resultado muestra <b>cada ciudad y cuántos clientes</b> hay en ella. Escribe la query que agrupa por ciudad.",
        "wiki_title": "GROUP BY + COUNT",
        "wiki_content": "`GROUP BY ciudad` agrupa las filas por ciudad. `COUNT(*)` cuenta cuántas hay en cada grupo.",
        "wiki_syntax": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad;",
        "wiki_example": "SELECT estado, COUNT(*) FROM pedido GROUP BY estado;",
        "solution_sql": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad;",
        "xp_reward": 60,
        "exercise_type": "reverse_query",
    },
    {
        "title": "Inversa 7 — Media por categoría",
        "category": "Query Inversa",
        "order_num": 7,
        "difficulty": "intermedio",
        "description": "El resultado muestra el <b>precio medio por categoria_id</b>. Reconstruye la query de agregación.",
        "wiki_title": "AVG + GROUP BY",
        "wiki_content": "`AVG(precio)` calcula la media de precios. Combinado con `GROUP BY categoria_id` la calcula por cada categoría.",
        "wiki_syntax": "SELECT categoria_id, AVG(precio) FROM producto GROUP BY categoria_id;",
        "wiki_example": "SELECT proveedor_id, AVG(precio) FROM producto GROUP BY proveedor_id;",
        "solution_sql": "SELECT categoria_id, AVG(precio) FROM producto GROUP BY categoria_id;",
        "xp_reward": 60,
        "exercise_type": "reverse_query",
    },
    {
        "title": "Inversa 8 — Ciudades grandes",
        "category": "Query Inversa",
        "order_num": 8,
        "difficulty": "intermedio",
        "description": "El resultado muestra solo las ciudades con <b>más de 2 clientes</b>. Requiere GROUP BY y HAVING.",
        "wiki_title": "GROUP BY + HAVING",
        "wiki_content": "Usa `HAVING COUNT(*) > 2` para filtrar los grupos (ciudades) que tienen más de 2 clientes.",
        "wiki_syntax": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad HAVING COUNT(*) > 2;",
        "wiki_example": "SELECT estado, COUNT(*) FROM pedido GROUP BY estado HAVING COUNT(*) > 3;",
        "solution_sql": "SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad HAVING COUNT(*) > 2;",
        "xp_reward": 70,
        "exercise_type": "reverse_query",
    },
    {
        "title": "Inversa 9 — Productos sobre la media",
        "category": "Query Inversa",
        "order_num": 9,
        "difficulty": "avanzado",
        "description": "El resultado muestra productos con precio <b>superior al precio medio</b> del catálogo. Requiere una subconsulta.",
        "wiki_title": "Subconsulta correlacionada",
        "wiki_content": "Usa `WHERE precio > (SELECT AVG(precio) FROM producto)`. La subconsulta calcula la media primero y luego la consulta exterior filtra.",
        "wiki_syntax": "SELECT nombre, precio FROM producto WHERE precio > (SELECT AVG(precio) FROM producto);",
        "wiki_example": "SELECT nombre FROM producto WHERE stock > (SELECT AVG(stock) FROM producto);",
        "solution_sql": "SELECT nombre, precio FROM producto WHERE precio > (SELECT AVG(precio) FROM producto);",
        "xp_reward": 90,
        "exercise_type": "reverse_query",
    },
    {
        "title": "Inversa 10 — Resumen de pedidos",
        "category": "Query Inversa",
        "order_num": 10,
        "difficulty": "avanzado",
        "description": "El resultado muestra para cada estado: número de pedidos, total facturado y media por pedido. Solo estados con más de 1 pedido, ordenado por total desc.",
        "wiki_title": "Consulta de análisis completa",
        "wiki_content": "Combina `COUNT(*)`, `SUM()`, `AVG()`, `GROUP BY`, `HAVING` y `ORDER BY` en una sola consulta.",
        "wiki_syntax": "SELECT estado, COUNT(*) AS n, SUM(total) AS total, AVG(total) AS media FROM pedido GROUP BY estado HAVING COUNT(*) > 1 ORDER BY total DESC;",
        "wiki_example": "SELECT estado, COUNT(*) FROM pedido GROUP BY estado HAVING COUNT(*) > 2;",
        "solution_sql": "SELECT estado, COUNT(*) AS num_pedidos, SUM(total) AS total_facturado, AVG(total) AS importe_medio FROM pedido GROUP BY estado HAVING COUNT(*) > 1 ORDER BY total_facturado DESC;",
        "xp_reward": 120,
        "exercise_type": "reverse_query",
    },
]


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def run():
    create_tables()
    db = SessionLocal()

    # Buscar el dataset Tienda (debe existir)
    dataset = db.query(SQLDataset).filter(SQLDataset.name == "Tienda").first()
    if not dataset:
        print("❌ ERROR: El dataset 'Tienda' no existe. Ejecuta primero seed_sql_skills.py")
        db.close()
        return

    print(f"✓ Dataset 'Tienda' encontrado (ID={dataset.id})")

    all_groups = [
        ("fill_blank",     FILL_BLANK_EXERCISES,    "Completa el Hueco"),
        ("find_bug",       FIND_BUG_EXERCISES,       "Encuentra el Error"),
        ("order_clauses",  ORDER_CLAUSES_EXERCISES,  "Ordena las Cláusulas"),
        ("reverse_query",  REVERSE_QUERY_EXERCISES,  "Query Inversa"),
    ]

    for ex_type, exercises, type_label in all_groups:
        print(f"\n[{type_label}]")
        for ex_data in exercises:
            try:
                expected = compute_expected(ex_data["solution_sql"])

                # Buscar por tipo + order_num (evita duplicados)
                ex = db.query(SQLExercise).filter(
                    SQLExercise.dataset_id == dataset.id,
                    SQLExercise.exercise_type == ex_type,
                    SQLExercise.order_num == ex_data["order_num"]
                ).first()

                fields = dict(
                    title=ex_data["title"],
                    category=ex_data["category"],
                    difficulty=ex_data["difficulty"],
                    description=ex_data["description"],
                    wiki_title=ex_data.get("wiki_title"),
                    wiki_content=ex_data.get("wiki_content"),
                    wiki_syntax=ex_data.get("wiki_syntax"),
                    wiki_example=ex_data.get("wiki_example"),
                    solution_sql=ex_data["solution_sql"],
                    expected_result=expected,
                    xp_reward=ex_data["xp_reward"],
                    exercise_type=ex_type,
                    template_sql=ex_data.get("template_sql"),
                    buggy_sql=ex_data.get("buggy_sql"),
                    fragments=ex_data.get("fragments"),
                    is_active=True,
                )

                if ex:
                    for k, v in fields.items():
                        setattr(ex, k, v)
                    print(f"  ✓ Actualizado: {ex_data['title']}")
                else:
                    new_ex = SQLExercise(
                        dataset_id=dataset.id,
                        order_num=ex_data["order_num"],
                        **fields
                    )
                    db.add(new_ex)
                    print(f"  + Creado: {ex_data['title']}")

                db.commit()

            except Exception as e:
                db.rollback()
                print(f"  ✗ Error en '{ex_data['title']}': {e}")

    print("\n✅ Seed de nuevos modos completado.")
    db.close()


if __name__ == "__main__":
    run()
