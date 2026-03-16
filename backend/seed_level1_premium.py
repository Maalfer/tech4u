"""
Seed: Level 1 Premium — Currículo Profesional para Nivel 1 "Fundamentos SELECT"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Estructura del currículo (6 conceptos × ~4 tipos de ejercicio = 24 ejercicios):

  CONCEPTO 1 — SELECT y FROM          (order 1–4)
  CONCEPTO 2 — Columnas específicas   (order 5–8)
  CONCEPTO 3 — Alias con AS           (order 9–11)
  CONCEPTO 4 — DISTINCT               (order 12–14)
  CONCEPTO 5 — ORDER BY               (order 15–18)
  CONCEPTO 6 — LIMIT                  (order 19–22)

Tipos por concepto: free_query → fill_blank → order_clauses → find_bug (± reverse_query)
Cada ejercicio tiene teoría ESPECÍFICA para ese concepto + tipo de ejercicio.

Uso:
  DATABASE_URL=sqlite:///./tech4u.db python seed_level1_premium.py
  DATABASE_URL=postgresql://user:pass@host/db python seed_level1_premium.py
"""

import json
import sqlite3
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, SQLDataset, SQLExercise, SQLLevel, create_tables

# ──────────────────────────────────────────────────────────────────────────────
# DATASET TIENDA — Esquema e inserción de datos
# ──────────────────────────────────────────────────────────────────────────────

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
(1,1,1,1,59.99),(2,1,4,1,79.99),(3,2,8,1,399.99),(4,3,9,1,299.99),
(5,3,3,2,49.99),(6,3,16,1,12.99),(7,4,5,1,34.99),(8,4,7,1,59.99),
(9,5,6,1,199.99),(10,6,9,1,299.99),(11,7,5,1,34.99),(12,7,13,1,29.99),
(13,7,19,1,24.99),(14,7,20,1,21.99),(15,8,6,1,199.99),(16,8,7,1,59.99),
(17,8,11,1,49.99),(18,8,4,1,79.99),(19,8,5,1,34.99),(20,8,12,1,39.99),
(21,9,2,1,89.99),(22,9,3,2,49.99),(23,9,16,1,12.99),(24,10,4,1,79.99),
(25,10,8,1,299.99),(26,11,6,1,199.99),(27,11,8,1,399.99),(28,12,9,1,299.99),
(29,13,6,1,199.99),(30,13,4,1,79.99),(31,13,10,1,179.99),(32,13,14,1,89.99),
(33,13,1,1,59.99),(34,14,5,1,34.99),(35,14,13,1,29.99),(36,14,12,1,39.99),
(37,15,8,1,399.99),(38,15,1,1,59.99);
"""


# ──────────────────────────────────────────────────────────────────────────────
# HELPER: ejecutar SQL en memoria y devolver expected_result JSON
# ──────────────────────────────────────────────────────────────────────────────

def compute_expected(sql: str) -> str:
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    for stmt in SCHEMA_SQL.strip().split(";"):
        s = stmt.strip()
        if s:
            cur.execute(s)
    for stmt in SEED_SQL.strip().split(";"):
        s = stmt.strip()
        if s:
            try:
                cur.execute(s)
            except Exception:
                pass
    conn.commit()
    cur.execute(sql)
    cols = [d[0] for d in cur.description]
    rows = [list(r) for r in cur.fetchall()]
    conn.close()
    return json.dumps({"columns": cols, "rows": rows}, ensure_ascii=False)


# ──────────────────────────────────────────────────────────────────────────────
# CURRÍCULO NIVEL 1 — 6 conceptos × ~4 ejercicios
# ──────────────────────────────────────────────────────────────────────────────

EXERCISES = [

    # ══════════════════════════════════════════════════════════════════════════
    # CONCEPTO 1: SELECT y FROM  (order_num 1–4)
    # ══════════════════════════════════════════════════════════════════════════

    {
        "order_num": 1,
        "exercise_type": "free_query",
        "category": "SELECT y FROM",
        "title": "Tu primera consulta SQL",
        "difficulty": "beginner",
        "description": "Muestra <strong>todos los datos</strong> de la tabla <code>producto</code>.",
        "wiki_title": "SELECT y FROM — Las dos palabras clave del lenguaje SQL",
        "wiki_content": """En SQL, toda consulta empieza con dos ingredientes fundamentales:

**SELECT** — ¿qué quieres ver?
**FROM** — ¿de qué tabla lo sacas?

La combinación más básica es pedir *todas las columnas* de una tabla. Para eso se usa el carácter especial `*` (asterisco), que en SQL significa "todo":

```sql
SELECT *
FROM nombre_tabla;
```

El asterisco es un comodín: le dice a la base de datos "dame todas las columnas que tenga esta tabla, sin excepción". Es el punto de partida ideal cuando quieres explorar un conjunto de datos por primera vez.

> **Dato curioso:** El punto y coma `;` al final es opcional en muchos motores, pero es buena práctica incluirlo siempre. Indica dónde termina la instrucción.""",
        "wiki_syntax": "SELECT * FROM nombre_tabla;",
        "wiki_example": "SELECT * FROM cliente;",
        "solution_sql": "SELECT * FROM producto;",
        "xp_reward": 10,
        "template_sql": None,
        "buggy_sql": None,
        "fragments": None,
    },

    {
        "order_num": 2,
        "exercise_type": "fill_blank",
        "category": "SELECT y FROM",
        "title": "Completa tu primera SELECT",
        "difficulty": "beginner",
        "description": "Completa los huecos para seleccionar <strong>todos los datos</strong> de la tabla <code>proveedor</code>.",
        "wiki_title": "Sintaxis: SELECT ___ FROM ___",
        "wiki_content": """Ya conoces `SELECT *` y `FROM`. Ahora es el momento de practicar la sintaxis rellenando los huecos.

Recuerda la estructura:

```
SELECT [qué columnas]
FROM   [qué tabla];
```

- Después de `SELECT` indicamos qué queremos ver (`*` = todo).
- Después de `FROM` escribimos el nombre exacto de la tabla.

El nombre de la tabla distingue mayúsculas/minúsculas en algunos motores, así que escríbelo tal cual aparece en el esquema.""",
        "wiki_syntax": "SELECT ___ FROM ___;",
        "wiki_example": "SELECT * FROM categoria;",
        "solution_sql": "SELECT * FROM proveedor;",
        "xp_reward": 10,
        "template_sql": "SELECT ___ FROM ___;",
        "buggy_sql": None,
        "fragments": None,
    },

    {
        "order_num": 3,
        "exercise_type": "order_clauses",
        "category": "SELECT y FROM",
        "title": "Ordena la consulta",
        "difficulty": "beginner",
        "description": "Arrastra los fragmentos para construir la consulta que muestre <strong>todos los datos</strong> de la tabla <code>categoria</code>.",
        "wiki_title": "El orden importa: SELECT va antes que FROM",
        "wiki_content": """Una consulta SQL tiene un orden fijo que nunca cambia:

1. **SELECT** — primero defines qué columnas quieres
2. **FROM**   — después dices de qué tabla

Si los intercambias (`FROM categoria SELECT *`), el motor SQL dará un error de sintaxis. El orden es parte del lenguaje.

Piénsalo como una frase en español: "Quiero ver (`SELECT`) todo (`*`) de la tabla categoría (`FROM categoria`)." El sujeto de la acción (la tabla) va después del verbo (SELECT).""",
        "wiki_syntax": "SELECT * FROM nombre_tabla;",
        "wiki_example": "SELECT * FROM proveedor;",
        "solution_sql": "SELECT * FROM categoria;",
        "xp_reward": 10,
        "template_sql": None,
        "buggy_sql": None,
        "fragments": json.dumps(["SELECT *", "FROM categoria;"]),
    },

    {
        "order_num": 4,
        "exercise_type": "find_bug",
        "category": "SELECT y FROM",
        "title": "¿Dónde está el error?",
        "difficulty": "beginner",
        "description": "La siguiente consulta tiene un <strong>error de sintaxis</strong>. Encuéntralo y corrígelo para mostrar todos los datos de la tabla <code>producto</code>.",
        "wiki_title": "Errores comunes en SELECT ... FROM",
        "wiki_content": """Los errores de sintaxis más frecuentes en una SELECT básica son:

| Error típico | Causa |
|---|---|
| `SELCT *` | Palabra clave mal escrita |
| `SELECT * FORM producto` | `FROM` mal escrito como `FORM` |
| `SELECT FROM producto` | Falta indicar qué columnas (o el `*`) |
| `SELECT * producto` | Falta la palabra `FROM` |

SQL no es flexible con la ortografía: una letra de más o de menos en una palabra reservada (`SELECT`, `FROM`, `WHERE`...) provoca un error inmediato.

**Estrategia:** Lee la consulta en voz alta. Si suena raro, probablemente hay un error.""",
        "wiki_syntax": "SELECT * FROM nombre_tabla;",
        "wiki_example": "-- Error: SELCT * FROM producto;\n-- Correcto: SELECT * FROM producto;",
        "solution_sql": "SELECT * FROM producto;",
        "xp_reward": 15,
        "template_sql": None,
        "buggy_sql": "SELCT * FROM producto;",
        "fragments": None,
    },

    # ══════════════════════════════════════════════════════════════════════════
    # CONCEPTO 2: Columnas específicas  (order_num 5–8)
    # ══════════════════════════════════════════════════════════════════════════

    {
        "order_num": 5,
        "exercise_type": "free_query",
        "category": "Columnas específicas",
        "title": "Solo lo que necesitas",
        "difficulty": "beginner",
        "description": "Muestra únicamente el <strong>nombre</strong> y el <strong>precio</strong> de todos los productos.",
        "wiki_title": "Seleccionar columnas concretas con SELECT",
        "wiki_content": """El asterisco `*` es cómodo, pero en el mundo real rara vez necesitas *todas* las columnas. Imagina una tabla con 50 columnas — sería muy incómodo verlas todas cuando solo te interesan dos.

En SQL puedes elegir exactamente qué columnas mostrar, separándolas con comas:

```sql
SELECT columna1, columna2
FROM tabla;
```

**Reglas importantes:**
- Escribe los nombres de columna tal cual aparecen en la tabla (respeta mayúsculas).
- Separa cada columna con una coma `,`.
- El orden en el que las listas es el orden en que aparecerán en el resultado.

```sql
-- Devuelve solo nombre y precio, en ese orden
SELECT nombre, precio
FROM producto;
```

> **Buena práctica:** Listar solo las columnas que necesitas hace las consultas más rápidas y los resultados más fáciles de leer.""",
        "wiki_syntax": "SELECT columna1, columna2 FROM nombre_tabla;",
        "wiki_example": "SELECT nombre, ciudad FROM cliente;",
        "solution_sql": "SELECT nombre, precio FROM producto;",
        "xp_reward": 10,
        "template_sql": None,
        "buggy_sql": None,
        "fragments": None,
    },

    {
        "order_num": 6,
        "exercise_type": "fill_blank",
        "category": "Columnas específicas",
        "title": "Elige las columnas correctas",
        "difficulty": "beginner",
        "description": "Completa la consulta para mostrar el <strong>nombre</strong> y la <strong>ciudad</strong> de todos los clientes.",
        "wiki_title": "Selección de columnas: rellena los nombres",
        "wiki_content": """Cuando seleccionas columnas específicas, el hueco después de `SELECT` es donde listas los nombres de columna separados por comas.

Mira el esquema de la tabla `cliente`:
- `id` — identificador único
- `nombre` — nombre del cliente
- `email` — correo electrónico
- `ciudad` — ciudad donde vive
- `edad` — edad en años
- `fecha_registro` — fecha en que se registró

Para mostrar solo nombre y ciudad:

```sql
SELECT nombre, ciudad
FROM cliente;
```

Fíjate: no hay coma después de la última columna, solo un espacio antes de `FROM`.""",
        "wiki_syntax": "SELECT col1, col2 FROM tabla;",
        "wiki_example": "SELECT nombre, email FROM cliente;",
        "solution_sql": "SELECT nombre, ciudad FROM cliente;",
        "xp_reward": 10,
        "template_sql": "SELECT ___, ___ FROM cliente;",
        "buggy_sql": None,
        "fragments": None,
    },

    {
        "order_num": 7,
        "exercise_type": "order_clauses",
        "category": "Columnas específicas",
        "title": "Construye la consulta con columnas",
        "difficulty": "beginner",
        "description": "Arrastra los fragmentos para obtener el <strong>nombre</strong> de todas las categorías.",
        "wiki_title": "Una columna, una tabla: la consulta mínima útil",
        "wiki_content": """Seleccionar una sola columna es perfectamente válido en SQL. Es muy útil cuando quieres ver los valores únicos de un campo o simplemente explorar qué hay en una columna.

```sql
SELECT nombre
FROM categoria;
```

Esta consulta devuelve únicamente la columna `nombre` de la tabla `categoria`, sin ninguna otra información adicional.

**Tip:** Cuando ordenas los fragmentos de una consulta, el flujo mental es: primero decides qué (SELECT nombre), luego de dónde (FROM categoria). Siempre en ese orden.""",
        "wiki_syntax": "SELECT columna FROM tabla;",
        "wiki_example": "SELECT nombre FROM proveedor;",
        "solution_sql": "SELECT nombre FROM categoria;",
        "xp_reward": 10,
        "template_sql": None,
        "buggy_sql": None,
        "fragments": json.dumps(["SELECT nombre", "FROM categoria;"]),
    },

    {
        "order_num": 8,
        "exercise_type": "find_bug",
        "category": "Columnas específicas",
        "title": "Coma en el lugar equivocado",
        "difficulty": "beginner",
        "description": "Esta consulta debería mostrar el <strong>nombre</strong> y el <strong>precio</strong> de los productos, pero hay un error. ¡Encuéntralo!",
        "wiki_title": "Error frecuente: la coma de más (o de menos)",
        "wiki_content": """Al listar columnas, la coma separa cada par de columnas — pero **no** se pone después de la última.

**Errores habituales con comas:**

```sql
-- ❌ Coma de más al final
SELECT nombre, precio,
FROM producto;

-- ❌ Coma de menos entre columnas
SELECT nombre precio
FROM producto;

-- ✅ Correcto
SELECT nombre, precio
FROM producto;
```

El motor SQL interpreta la coma como "y además dame esta otra columna". Si después de la coma no hay ningún nombre de columna (solo `FROM`), el motor no sabe qué esperas y produce un error de sintaxis.""",
        "wiki_syntax": "SELECT col1, col2 FROM tabla;",
        "wiki_example": "-- Correcto:\nSELECT nombre, precio FROM producto;",
        "solution_sql": "SELECT nombre, precio FROM producto;",
        "xp_reward": 15,
        "template_sql": None,
        "buggy_sql": "SELECT nombre, precio, FROM producto;",
        "fragments": None,
    },

    # ══════════════════════════════════════════════════════════════════════════
    # CONCEPTO 3: Alias con AS  (order_num 9–11)
    # ══════════════════════════════════════════════════════════════════════════

    {
        "order_num": 9,
        "exercise_type": "free_query",
        "category": "Alias con AS",
        "title": "Renombra las columnas",
        "difficulty": "beginner",
        "description": "Muestra el nombre y el precio de todos los productos usando los alias <strong>Producto</strong> y <strong>Precio</strong> respectivamente.",
        "wiki_title": "AS — Dale un nombre legible a tus columnas",
        "wiki_content": """Los nombres de columna en la base de datos suelen ser técnicos (`nombre`, `precio_unitario`, `fecha_registro`). Con la palabra clave `AS` puedes renombrarlos en el resultado para que sean más legibles o estén en el idioma que necesites.

```sql
SELECT columna AS 'Nombre que quieres'
FROM tabla;
```

**Ejemplos:**

```sql
-- Sin alias
SELECT nombre, precio FROM producto;
-- Resultado: columnas "nombre" y "precio"

-- Con alias
SELECT nombre AS Producto, precio AS Precio FROM producto;
-- Resultado: columnas "Producto" y "Precio"
```

**Notas importantes:**
- `AS` es opcional en muchos motores (puedes escribir solo `nombre Producto`), pero incluirlo hace el código más legible.
- Si el alias contiene espacios, usa comillas: `AS 'Mi Producto'`.
- El alias **no** cambia la tabla, solo el nombre en la pantalla de resultados.""",
        "wiki_syntax": "SELECT columna AS alias FROM tabla;",
        "wiki_example": "SELECT nombre AS Cliente, ciudad AS Ciudad FROM cliente;",
        "solution_sql": "SELECT nombre AS Producto, precio AS Precio FROM producto;",
        "xp_reward": 15,
        "template_sql": None,
        "buggy_sql": None,
        "fragments": None,
    },

    {
        "order_num": 10,
        "exercise_type": "fill_blank",
        "category": "Alias con AS",
        "title": "Aplica los alias correctos",
        "difficulty": "beginner",
        "description": "Completa la consulta para mostrar el <strong>nombre</strong> como <em>Nombre</em> y la <strong>ciudad</strong> como <em>Ciudad</em> de todos los clientes.",
        "wiki_title": "Sintaxis de AS: columna AS alias",
        "wiki_content": """El patrón para poner un alias es siempre:

```
nombre_columna AS nombre_alias
```

Cada par columna-alias va separado del siguiente por una coma, igual que cuando listamos columnas normales:

```sql
SELECT nombre AS Nombre, ciudad AS Ciudad
FROM cliente;
```

Los alias son muy útiles cuando:
- Envías los resultados a una hoja de cálculo y quieres cabeceras legibles.
- La columna original tiene un nombre técnico difícil de entender.
- Quieres mostrar resultados en otro idioma al del esquema.""",
        "wiki_syntax": "SELECT col AS alias1, col2 AS alias2 FROM tabla;",
        "wiki_example": "SELECT nombre AS Producto FROM producto;",
        "solution_sql": "SELECT nombre AS Nombre, ciudad AS Ciudad FROM cliente;",
        "xp_reward": 15,
        "template_sql": "SELECT nombre ___ Nombre, ciudad ___ Ciudad FROM cliente;",
        "buggy_sql": None,
        "fragments": None,
    },

    {
        "order_num": 11,
        "exercise_type": "find_bug",
        "category": "Alias con AS",
        "title": "Alias mal escrito",
        "difficulty": "beginner",
        "description": "La consulta debería mostrar el nombre de las categorías con el alias <strong>Categoría</strong>, pero algo está mal.",
        "wiki_title": "Error común: posición de AS",
        "wiki_content": """El alias siempre va **después** de la columna, no antes:

```sql
-- ❌ El alias va antes de la columna (incorrecto)
SELECT AS Categoría nombre FROM categoria;

-- ❌ Falta la palabra AS (en este motor concreto da error)
SELECT nombre Categoría FROM categoria;

-- ✅ Correcto
SELECT nombre AS Categoría FROM categoria;
```

Otro error frecuente es poner el alias entre la coma y el siguiente nombre de columna:

```sql
-- ❌
SELECT nombre, AS Ciudad ciudad FROM cliente;

-- ✅
SELECT nombre, ciudad AS Ciudad FROM cliente;
```

La regla de oro: `[columna] AS [alias]` — siempre en ese orden.""",
        "wiki_syntax": "SELECT columna AS alias FROM tabla;",
        "wiki_example": "SELECT nombre AS Categoria FROM categoria;",
        "solution_sql": "SELECT nombre AS Categoria FROM categoria;",
        "xp_reward": 15,
        "template_sql": None,
        "buggy_sql": "SELECT AS Categoria nombre FROM categoria;",
        "fragments": None,
    },

    # ══════════════════════════════════════════════════════════════════════════
    # CONCEPTO 4: DISTINCT  (order_num 12–14)
    # ══════════════════════════════════════════════════════════════════════════

    {
        "order_num": 12,
        "exercise_type": "free_query",
        "category": "DISTINCT",
        "title": "Sin duplicados",
        "difficulty": "beginner",
        "description": "Muestra todas las <strong>ciudades distintas</strong> en las que hay clientes (sin repetir ninguna).",
        "wiki_title": "DISTINCT — Elimina los valores duplicados",
        "wiki_content": """Cuando varias filas tienen el mismo valor en una columna, una `SELECT` normal las muestra todas — incluyendo duplicados. Si solo quieres ver los valores únicos, usa `DISTINCT`:

```sql
SELECT DISTINCT columna
FROM tabla;
```

**Ejemplo práctico:**
La tabla `cliente` tiene 15 clientes pero solo 7 ciudades diferentes. Sin `DISTINCT` obtendrías 15 filas con la ciudad de cada cliente. Con `DISTINCT` obtienes solo las 7 ciudades únicas.

```sql
-- Sin DISTINCT → 15 filas (una por cliente)
SELECT ciudad FROM cliente;

-- Con DISTINCT → solo las ciudades únicas
SELECT DISTINCT ciudad FROM cliente;
```

**`DISTINCT` va justo después de `SELECT`**, antes del nombre de columna. No va en otro lugar.

> **Uso avanzado:** Puedes aplicar `DISTINCT` sobre varias columnas (`SELECT DISTINCT ciudad, edad`) — en ese caso elimina filas donde la *combinación* de columnas sea idéntica.""",
        "wiki_syntax": "SELECT DISTINCT columna FROM tabla;",
        "wiki_example": "SELECT DISTINCT estado FROM pedido;",
        "solution_sql": "SELECT DISTINCT ciudad FROM cliente;",
        "xp_reward": 15,
        "template_sql": None,
        "buggy_sql": None,
        "fragments": None,
    },

    {
        "order_num": 13,
        "exercise_type": "fill_blank",
        "category": "DISTINCT",
        "title": "Completa con DISTINCT",
        "difficulty": "beginner",
        "description": "Completa la consulta para obtener los <strong>estados únicos</strong> de todos los pedidos (sin repetir).",
        "wiki_title": "¿Dónde exactamente va DISTINCT?",
        "wiki_content": """`DISTINCT` se coloca **entre `SELECT` y el nombre de la columna**:

```
SELECT DISTINCT columna_sin_duplicados
FROM tabla;
```

No lo confundas con una columna más — es una instrucción que modifica cómo `SELECT` devuelve los datos. Va pegado a `SELECT`, no separado por coma.

```sql
-- ❌ No es una columna más
SELECT ciudad, DISTINCT estado FROM pedido;

-- ✅ Modifica el SELECT completo
SELECT DISTINCT estado FROM pedido;
```

En la tabla `pedido`, la columna `estado` puede tener valores como `entregado`, `enviado`, `cancelado`, `procesando`. Con `DISTINCT` verás cada estado solo una vez.""",
        "wiki_syntax": "SELECT DISTINCT columna FROM tabla;",
        "wiki_example": "SELECT DISTINCT ciudad FROM cliente;",
        "solution_sql": "SELECT DISTINCT estado FROM pedido;",
        "xp_reward": 15,
        "template_sql": "SELECT ___ estado FROM pedido;",
        "buggy_sql": None,
        "fragments": None,
    },

    {
        "order_num": 14,
        "exercise_type": "find_bug",
        "category": "DISTINCT",
        "title": "DISTINCT en el lugar incorrecto",
        "difficulty": "beginner",
        "description": "La consulta intenta mostrar los <strong>países únicos</strong> de los proveedores, pero tiene un error. Corrígelo.",
        "wiki_title": "Error: DISTINCT no va después de la columna",
        "wiki_content": """Un error habitual es poner `DISTINCT` después del nombre de columna o después de la coma:

```sql
-- ❌ DISTINCT después de la columna
SELECT pais DISTINCT FROM proveedor;

-- ❌ DISTINCT al final
SELECT pais FROM proveedor DISTINCT;

-- ✅ DISTINCT inmediatamente después de SELECT
SELECT DISTINCT pais FROM proveedor;
```

Si ves un error como `syntax error near 'DISTINCT'` en tu motor SQL, lo más probable es que hayas colocado `DISTINCT` en una posición incorrecta.

**Regla fácil de recordar:** `SELECT DISTINCT` se lee como una unidad, como si fueran una sola palabra.""",
        "wiki_syntax": "SELECT DISTINCT columna FROM tabla;",
        "wiki_example": "SELECT DISTINCT pais FROM proveedor;",
        "solution_sql": "SELECT DISTINCT pais FROM proveedor;",
        "xp_reward": 15,
        "template_sql": None,
        "buggy_sql": "SELECT pais DISTINCT FROM proveedor;",
        "fragments": None,
    },

    # ══════════════════════════════════════════════════════════════════════════
    # CONCEPTO 5: ORDER BY  (order_num 15–18)
    # ══════════════════════════════════════════════════════════════════════════

    {
        "order_num": 15,
        "exercise_type": "free_query",
        "category": "ORDER BY",
        "title": "Ordena los productos",
        "difficulty": "beginner",
        "description": "Lista todos los productos ordenados por <strong>precio de menor a mayor</strong>.",
        "wiki_title": "ORDER BY — Controla el orden de tus resultados",
        "wiki_content": """Por defecto, SQL no garantiza ningún orden en los resultados. Cada motor puede devolver las filas en cualquier orden. Para controlar el orden usamos `ORDER BY`:

```sql
SELECT columnas
FROM tabla
ORDER BY columna_orden [ASC | DESC];
```

- **ASC** (Ascending = ascendente): de menor a mayor. Es el **valor por defecto** si no pones nada.
- **DESC** (Descending = descendente): de mayor a menor.

**Ejemplos:**

```sql
-- Productos más baratos primero
SELECT nombre, precio FROM producto ORDER BY precio ASC;

-- Productos más caros primero
SELECT nombre, precio FROM producto ORDER BY precio DESC;
```

`ORDER BY` siempre va **al final de la consulta**, después de `FROM` (y después de `WHERE` si existe, como verás en niveles superiores).

> **Tip:** Puedes ordenar por varias columnas: `ORDER BY ciudad ASC, nombre ASC` ordenará primero por ciudad y, dentro de cada ciudad, por nombre.""",
        "wiki_syntax": "SELECT * FROM tabla ORDER BY columna ASC;",
        "wiki_example": "SELECT * FROM producto ORDER BY precio DESC;",
        "solution_sql": "SELECT * FROM producto ORDER BY precio ASC;",
        "xp_reward": 15,
        "template_sql": None,
        "buggy_sql": None,
        "fragments": None,
    },

    {
        "order_num": 16,
        "exercise_type": "fill_blank",
        "category": "ORDER BY",
        "title": "Completa el ORDER BY",
        "difficulty": "beginner",
        "description": "Completa la consulta para mostrar los clientes ordenados por <strong>nombre alfabéticamente</strong> (de A a Z).",
        "wiki_title": "ORDER BY con texto: orden alfabético",
        "wiki_content": """`ORDER BY` funciona con cualquier tipo de dato:

- **Números:** ordena de menor a mayor (ASC) o de mayor a menor (DESC).
- **Texto:** ordena alfabéticamente A→Z (ASC) o Z→A (DESC).
- **Fechas:** ordena de más antigua a más reciente (ASC) o viceversa (DESC).

Para texto en orden alfabético (A → Z) usamos `ASC`:

```sql
SELECT * FROM cliente ORDER BY nombre ASC;
```

El `ASC` es técnicamente opcional (es el orden por defecto), pero ponerlo hace el código más legible e intencional.""",
        "wiki_syntax": "SELECT * FROM tabla ORDER BY columna ASC;",
        "wiki_example": "SELECT * FROM proveedor ORDER BY nombre ASC;",
        "solution_sql": "SELECT * FROM cliente ORDER BY nombre ASC;",
        "xp_reward": 15,
        "template_sql": "SELECT * FROM cliente ORDER BY nombre ___;",
        "buggy_sql": None,
        "fragments": None,
    },

    {
        "order_num": 17,
        "exercise_type": "order_clauses",
        "category": "ORDER BY",
        "title": "Construye el ORDER BY",
        "difficulty": "beginner",
        "description": "Arrastra los fragmentos para listar los productos ordenados por <strong>precio de mayor a menor</strong>.",
        "wiki_title": "La posición de ORDER BY en la consulta",
        "wiki_content": """La estructura completa de una consulta con `ORDER BY` es:

```
SELECT [columnas]
FROM   [tabla]
ORDER BY [columna] [ASC|DESC];
```

El orden de las cláusulas es **obligatorio**: primero `SELECT`, luego `FROM`, finalmente `ORDER BY`. Si los intercambias, el motor SQL devolverá un error.

En este ejercicio deberás ordenar los fragmentos para construir:

```sql
SELECT nombre, precio
FROM producto
ORDER BY precio DESC;
```

El fragmento `ORDER BY precio DESC` va **al final**, después de `FROM producto`.""",
        "wiki_syntax": "SELECT columnas FROM tabla ORDER BY col DESC;",
        "wiki_example": "SELECT * FROM producto ORDER BY precio ASC;",
        "solution_sql": "SELECT nombre, precio FROM producto ORDER BY precio DESC;",
        "xp_reward": 15,
        "template_sql": None,
        "buggy_sql": None,
        "fragments": json.dumps(["SELECT nombre, precio", "FROM producto", "ORDER BY precio DESC;"]),
    },

    {
        "order_num": 18,
        "exercise_type": "find_bug",
        "category": "ORDER BY",
        "title": "ORDER BY en el lugar incorrecto",
        "difficulty": "beginner",
        "description": "Esta consulta debería mostrar los productos ordenados por nombre, pero tiene un error de posición. Corrígelo.",
        "wiki_title": "Error: ORDER BY no puede ir antes de FROM",
        "wiki_content": """`ORDER BY` siempre va **al final** de la consulta SELECT básica. No puede ir entre `SELECT` y `FROM`, ni antes de `FROM`.

```sql
-- ❌ ORDER BY entre SELECT y FROM (incorrecto)
SELECT * ORDER BY nombre FROM producto;

-- ❌ ORDER BY antes de FROM (incorrecto)
SELECT * ORDER BY nombre ASC FROM producto;

-- ✅ ORDER BY al final, después de FROM
SELECT * FROM producto ORDER BY nombre ASC;
```

Una regla útil para recordar el orden de cláusulas SQL:
**S**elect → **F**rom → **W**here → **O**rder by → **L**imit

La nemotecnia "SF-WOL" te ayudará cuando las consultas se vuelvan más complejas.""",
        "wiki_syntax": "SELECT * FROM tabla ORDER BY columna ASC;",
        "wiki_example": "SELECT * FROM producto ORDER BY nombre ASC;",
        "solution_sql": "SELECT * FROM producto ORDER BY nombre ASC;",
        "xp_reward": 15,
        "template_sql": None,
        "buggy_sql": "SELECT * ORDER BY nombre ASC FROM producto;",
        "fragments": None,
    },

    # ══════════════════════════════════════════════════════════════════════════
    # CONCEPTO 6: LIMIT  (order_num 19–22)
    # ══════════════════════════════════════════════════════════════════════════

    {
        "order_num": 19,
        "exercise_type": "free_query",
        "category": "LIMIT",
        "title": "Los 5 primeros productos",
        "difficulty": "beginner",
        "description": "Muestra solo los <strong>5 primeros productos</strong> de la tabla.",
        "wiki_title": "LIMIT — Restringe cuántas filas devuelve la consulta",
        "wiki_content": """Las tablas reales pueden tener millones de filas. Pedir todas cuando solo necesitas las primeras diez es un desperdicio de recursos. `LIMIT` te permite indicar cuántas filas como máximo quieres recibir:

```sql
SELECT columnas
FROM tabla
LIMIT número;
```

**Ejemplos:**

```sql
-- Solo las primeras 5 filas
SELECT * FROM producto LIMIT 5;

-- Solo la primera fila
SELECT * FROM cliente LIMIT 1;
```

**LIMIT va al final de todo**, después de `FROM` y de `ORDER BY` si los hay.

```sql
-- Los 3 productos más baratos
SELECT nombre, precio
FROM producto
ORDER BY precio ASC
LIMIT 3;
```

> **Nota importante:** Sin `ORDER BY`, "los primeros N" es arbitrario — la base de datos elige cuáles. Si quieres los primeros por algún criterio específico (más baratos, más recientes...), combina siempre `ORDER BY` con `LIMIT`.""",
        "wiki_syntax": "SELECT * FROM tabla LIMIT n;",
        "wiki_example": "SELECT * FROM cliente LIMIT 10;",
        "solution_sql": "SELECT * FROM producto LIMIT 5;",
        "xp_reward": 15,
        "template_sql": None,
        "buggy_sql": None,
        "fragments": None,
    },

    {
        "order_num": 20,
        "exercise_type": "fill_blank",
        "category": "LIMIT",
        "title": "Completa el LIMIT",
        "difficulty": "beginner",
        "description": "Completa la consulta para obtener solo los <strong>3 primeros pedidos</strong>.",
        "wiki_title": "LIMIT: pon el número correcto",
        "wiki_content": """La sintaxis de `LIMIT` es muy simple: la palabra reservada `LIMIT` seguida de un número entero positivo.

```sql
SELECT * FROM pedido LIMIT 3;
-- → Devuelve como máximo 3 filas de la tabla pedido
```

**¿Qué pasa si pido más filas de las que existen?**
No hay error. Si la tabla tiene 15 filas y pones `LIMIT 100`, simplemente obtienes las 15 filas.

**¿Puedo usar LIMIT 0?**
Sí, aunque devuelve 0 filas. Es útil a veces para obtener solo el esquema de columnas sin datos.

En el hueco, escribe el número de filas que quieres ver.""",
        "wiki_syntax": "SELECT * FROM tabla LIMIT número;",
        "wiki_example": "SELECT * FROM producto LIMIT 5;",
        "solution_sql": "SELECT * FROM pedido LIMIT 3;",
        "xp_reward": 15,
        "template_sql": "SELECT * FROM pedido LIMIT ___;",
        "buggy_sql": None,
        "fragments": None,
    },

    {
        "order_num": 21,
        "exercise_type": "order_clauses",
        "category": "LIMIT",
        "title": "Los más caros primero",
        "difficulty": "beginner",
        "description": "Arrastra los fragmentos para mostrar el <strong>nombre y precio</strong> de los <strong>5 productos más caros</strong>.",
        "wiki_title": "Combinar ORDER BY y LIMIT: el dúo más poderoso",
        "wiki_content": """La combinación `ORDER BY ... LIMIT` es una de las más utilizadas en SQL. Permite responder preguntas como:

- "¿Cuáles son los 10 productos más vendidos?"
- "¿Cuál es el cliente con mayor edad?"
- "¿Los 3 pedidos más recientes?"

La estructura es:

```sql
SELECT columnas
FROM tabla
ORDER BY columna DESC   -- primero ordena
LIMIT n;                -- luego recorta
```

El orden de ejecución en SQL es:
1. `FROM` — coge todas las filas de la tabla
2. `ORDER BY` — ordénalas
3. `LIMIT` — quédate con las primeras N

Por eso `LIMIT` siempre va **después de `ORDER BY`**.""",
        "wiki_syntax": "SELECT cols FROM tabla ORDER BY col DESC LIMIT n;",
        "wiki_example": "SELECT nombre, precio FROM producto ORDER BY precio ASC LIMIT 3;",
        "solution_sql": "SELECT nombre, precio FROM producto ORDER BY precio DESC LIMIT 5;",
        "xp_reward": 20,
        "template_sql": None,
        "buggy_sql": None,
        "fragments": json.dumps([
            "SELECT nombre, precio",
            "FROM producto",
            "ORDER BY precio DESC",
            "LIMIT 5;"
        ]),
    },

    {
        "order_num": 22,
        "exercise_type": "find_bug",
        "category": "LIMIT",
        "title": "LIMIT antes de ORDER BY",
        "difficulty": "beginner",
        "description": "La consulta debería devolver los <strong>3 clientes más jóvenes</strong>, pero el orden de las cláusulas está mal. Corrígelo.",
        "wiki_title": "Error: LIMIT no puede ir antes de ORDER BY",
        "wiki_content": """El orden de cláusulas en SQL es estricto. `LIMIT` **siempre va después de `ORDER BY`** (cuando ambos están presentes):

```sql
-- ❌ LIMIT antes de ORDER BY (incorrecto)
SELECT * FROM cliente LIMIT 3 ORDER BY edad ASC;

-- ✅ ORDER BY primero, LIMIT al final
SELECT * FROM cliente ORDER BY edad ASC LIMIT 3;
```

Si pones `LIMIT` antes de `ORDER BY`, algunos motores SQL darán error de sintaxis; otros lo ignorarán y darán resultados incorrectos.

**Orden correcto de cláusulas (memorízalo):**
```
SELECT
FROM
WHERE      ← (lo verás en el siguiente nivel)
ORDER BY
LIMIT
```

Cuando veas una consulta con varias cláusulas, verifica que estén en este orden exacto.""",
        "wiki_syntax": "SELECT * FROM tabla ORDER BY col ASC LIMIT n;",
        "wiki_example": "SELECT * FROM cliente ORDER BY edad ASC LIMIT 3;",
        "solution_sql": "SELECT * FROM cliente ORDER BY edad ASC LIMIT 3;",
        "xp_reward": 20,
        "template_sql": None,
        "buggy_sql": "SELECT * FROM cliente LIMIT 3 ORDER BY edad ASC;",
        "fragments": None,
    },
]


# ──────────────────────────────────────────────────────────────────────────────
# RUNNER
# ──────────────────────────────────────────────────────────────────────────────

def run():
    create_tables()
    db = SessionLocal()

    try:
        # 1. Obtener dataset Tienda
        dataset = db.query(SQLDataset).filter(SQLDataset.name == "Tienda").first()
        if not dataset:
            print("❌ El dataset 'Tienda' no existe. Ejecuta primero seed_sql_skills.py")
            return
        print(f"✓ Dataset 'Tienda' encontrado (ID={dataset.id})")

        # 2. Obtener Level 1 (order_index=1)
        level = db.query(SQLLevel).filter(SQLLevel.order_index == 1).first()
        if not level:
            print("❌ El nivel 1 no existe. Ejecuta primero seed_roadmap_levels.py")
            return
        print(f"✓ Nivel 1 encontrado: '{level.title}' (ID={level.id})")

        # 3. Desactivar ejercicios anteriores del Level 1 con este dataset
        old = db.query(SQLExercise).filter(
            SQLExercise.dataset_id == dataset.id,
            SQLExercise.level_id == level.id,
        ).all()
        if old:
            for ex in old:
                ex.is_active = False
            db.commit()
            print(f"  ⚠️  {len(old)} ejercicios anteriores del Nivel 1 marcados como inactivos")

        # 4. Insertar / actualizar ejercicios premium
        print(f"\n📚 Insertando {len(EXERCISES)} ejercicios premium para Nivel 1...")
        created, updated = 0, 0

        for ex_data in EXERCISES:
            try:
                expected = compute_expected(ex_data["solution_sql"])
            except Exception as e:
                print(f"  ⚠️  Error al calcular expected para '{ex_data['title']}': {e}")
                expected = json.dumps({"columns": [], "rows": []})

            # Buscar por order_num + dataset_id + level_id para updates idempotentes
            ex = db.query(SQLExercise).filter(
                SQLExercise.dataset_id == dataset.id,
                SQLExercise.level_id == level.id,
                SQLExercise.order_num == ex_data["order_num"],
            ).first()

            fragments_val = ex_data.get("fragments")
            if fragments_val is not None and not isinstance(fragments_val, str):
                fragments_val = json.dumps(fragments_val, ensure_ascii=False)

            if ex:
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
                ex.exercise_type = ex_data["exercise_type"]
                ex.template_sql = ex_data.get("template_sql")
                ex.buggy_sql = ex_data.get("buggy_sql")
                ex.fragments = fragments_val
                ex.is_active = True
                updated += 1
                print(f"  ↺  Actualizado: [{ex_data['category']}] {ex_data['title']}")
            else:
                ex = SQLExercise(
                    dataset_id=dataset.id,
                    level_id=level.id,
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
                    exercise_type=ex_data["exercise_type"],
                    template_sql=ex_data.get("template_sql"),
                    buggy_sql=ex_data.get("buggy_sql"),
                    fragments=fragments_val,
                    is_active=True,
                )
                db.add(ex)
                created += 1
                print(f"  +  Creado:     [{ex_data['category']}] {ex_data['title']}")

        db.commit()

        print(f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Seed Level 1 Premium completado
   Creados:      {created}
   Actualizados: {updated}
   Total:        {created + updated}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Currículo:
  Concepto 1 — SELECT y FROM        (ej. 1–4)
  Concepto 2 — Columnas específicas (ej. 5–8)
  Concepto 3 — Alias con AS         (ej. 9–11)
  Concepto 4 — DISTINCT             (ej. 12–14)
  Concepto 5 — ORDER BY             (ej. 15–18)
  Concepto 6 — LIMIT                (ej. 19–22)
""")

    finally:
        db.close()


if __name__ == "__main__":
    run()
