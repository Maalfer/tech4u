"""
seed_empresa_it.py
──────────────────
Crea el dataset "Empresa IT" en la base de datos de Tech4U Academy.
Tablas: departamento, empleado, cliente, proyecto, tarea, factura
37 ejercicios: SELECT → WHERE → ORDER BY → Agregaciones → GROUP BY → HAVING → Subconsultas → Examen

Uso:  python3 seed_empresa_it.py
Idempotente: comprueba si el dataset ya existe antes de insertar.
"""

import sys
import os
import json
import sqlite3

# Añadir el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, SQLDataset, SQLExercise

# ─────────────────────────────────────────────────────────────────────────────
# SCHEMA SQL  (SQLite compatible, PRAGMA foreign_keys no obligatorio)
# ─────────────────────────────────────────────────────────────────────────────

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS departamento (
    id                INTEGER PRIMARY KEY,
    nombre            TEXT    NOT NULL,
    presupuesto_anual REAL
);

CREATE TABLE IF NOT EXISTS empleado (
    id              INTEGER PRIMARY KEY,
    nombre          TEXT    NOT NULL,
    apellido        TEXT    NOT NULL,
    puesto          TEXT    NOT NULL,
    departamento_id INTEGER,
    salario         REAL    NOT NULL,
    ciudad          TEXT    NOT NULL,
    fecha_alta      TEXT    NOT NULL,
    activo          INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS cliente (
    id                INTEGER PRIMARY KEY,
    empresa           TEXT NOT NULL,
    sector            TEXT NOT NULL,
    ciudad            TEXT NOT NULL,
    presupuesto_anual REAL,
    contacto          TEXT,
    fecha_alta        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS proyecto (
    id               INTEGER PRIMARY KEY,
    nombre           TEXT NOT NULL,
    cliente_id       INTEGER,
    responsable_id   INTEGER,
    estado           TEXT NOT NULL,
    presupuesto      REAL,
    fecha_inicio     TEXT NOT NULL,
    fecha_entrega    TEXT
);

CREATE TABLE IF NOT EXISTS tarea (
    id               INTEGER PRIMARY KEY,
    proyecto_id      INTEGER,
    empleado_id      INTEGER,
    titulo           TEXT NOT NULL,
    prioridad        TEXT NOT NULL,
    estado           TEXT NOT NULL,
    horas_estimadas  INTEGER,
    horas_reales     INTEGER
);

CREATE TABLE IF NOT EXISTS factura (
    id             INTEGER PRIMARY KEY,
    cliente_id     INTEGER,
    proyecto_id    INTEGER,
    fecha_emision  TEXT NOT NULL,
    importe        REAL NOT NULL,
    pagada         INTEGER DEFAULT 0
);
"""

# ─────────────────────────────────────────────────────────────────────────────
# SEED SQL
# ─────────────────────────────────────────────────────────────────────────────

SEED_SQL = """
-- Departamentos
INSERT INTO departamento VALUES (1, 'Sistemas',   120000);
INSERT INTO departamento VALUES (2, 'Redes',        95000);
INSERT INTO departamento VALUES (3, 'Seguridad',   110000);
INSERT INTO departamento VALUES (4, 'Desarrollo',  150000);
INSERT INTO departamento VALUES (5, 'Soporte',      80000);

-- Empleados  (id, nombre, apellido, puesto, dep_id, salario, ciudad, fecha_alta, activo)
INSERT INTO empleado VALUES (1,  'Carlos',  'Garcia',    'Administrador de Sistemas',  1, 38000, 'Madrid',    '2021-03-15', 1);
INSERT INTO empleado VALUES (2,  'Laura',   'Martinez',  'Administradora de Sistemas', 1, 40000, 'Madrid',    '2020-06-01', 1);
INSERT INTO empleado VALUES (3,  'Miguel',  'Torres',    'Tecnico de Sistemas',        1, 30000, 'Barcelona', '2022-01-10', 1);
INSERT INTO empleado VALUES (4,  'Ana',     'Lopez',     'Administradora de Redes',    2, 36000, 'Valencia',  '2021-09-20', 1);
INSERT INTO empleado VALUES (5,  'Pedro',   'Sanchez',   'Tecnico de Redes',           2, 28000, 'Valencia',  '2023-02-14', 1);
INSERT INTO empleado VALUES (6,  'David',   'Fernandez', 'Tecnico de Redes',           2, 29000, 'Sevilla',   '2022-07-05', 1);
INSERT INTO empleado VALUES (7,  'Sara',    'Gonzalez',  'Analista de Seguridad',      3, 42000, 'Madrid',    '2020-11-30', 1);
INSERT INTO empleado VALUES (8,  'Javier',  'Ruiz',      'Tecnico de Seguridad',       3, 33000, 'Barcelona', '2021-05-18', 1);
INSERT INTO empleado VALUES (9,  'Elena',   'Diaz',      'Tecnica de Seguridad',       3, 34000, 'Madrid',    '2023-04-01', 0);
INSERT INTO empleado VALUES (10, 'Pablo',   'Moreno',    'Desarrollador Full Stack',   4, 45000, 'Madrid',    '2019-08-12', 1);
INSERT INTO empleado VALUES (11, 'Isabel',  'Jimenez',   'Desarrolladora Frontend',    4, 43000, 'Barcelona', '2020-03-25', 1);
INSERT INTO empleado VALUES (12, 'Raul',    'Navarro',   'Desarrollador Backend',      4, 44000, 'Valencia',  '2021-11-08', 1);
INSERT INTO empleado VALUES (13, 'Marta',   'Romero',    'Tecnica de Soporte',         5, 25000, 'Sevilla',   '2022-09-15', 1);
INSERT INTO empleado VALUES (14, 'Luis',    'Castro',    'Tecnico de Soporte',         5, 24000, 'Madrid',    '2023-01-20', 1);
INSERT INTO empleado VALUES (15, 'Sofia',   'Herrera',   'Administradora de Redes',    2, 37000, 'Bilbao',    '2020-04-07', 1);

-- Clientes  (id, empresa, sector, ciudad, presupuesto_anual, contacto, fecha_alta)
INSERT INTO cliente VALUES (1,  'BancoSur S.A.',        'Banca',         'Madrid',    250000, 'Roberto Vidal',      '2020-01-15');
INSERT INTO cliente VALUES (2,  'RetailMax S.L.',        'Retail',        'Barcelona', 180000, 'Ana Costa',          '2020-06-20');
INSERT INTO cliente VALUES (3,  'ClinicaSalud',          'Salud',         'Valencia',  120000, 'Manuel Prieto',      '2021-03-08');
INSERT INTO cliente VALUES (4,  'TransLog Express',      'Logistica',     'Sevilla',    95000, 'Carmen Blanco',      '2021-07-14');
INSERT INTO cliente VALUES (5,  'EduTech Institute',     'Educacion',     'Madrid',     75000, 'Francisco Gil',      '2022-01-30');
INSERT INTO cliente VALUES (6,  'HotelGroup Premium',    'Hosteleria',    'Barcelona', 160000, 'Pilar Santos',       '2020-09-05');
INSERT INTO cliente VALUES (7,  'Constructora Norte',    'Construccion',  'Bilbao',    200000, 'Alberto Vega',       '2021-11-22');
INSERT INTO cliente VALUES (8,  'AgroTech Sur',          'Agricultura',   'Sevilla',    85000, 'Inmaculada Leon',    '2022-04-18');
INSERT INTO cliente VALUES (9,  'MediaDigital S.A.',     'Comunicacion',  'Madrid',    140000, 'Diego Ramos',        '2020-12-10');
INSERT INTO cliente VALUES (10, 'FitLife Centers',       'Deporte',       'Valencia',   60000, 'Nuria Ortega',       '2023-02-28');

-- Proyectos  (id, nombre, cliente_id, responsable_id, estado, presupuesto, fecha_inicio, fecha_entrega)
INSERT INTO proyecto VALUES (1,  'Migracion Infraestructura BancoSur', 1,  2, 'completado', 45000, '2021-01-10', '2021-06-30');
INSERT INTO proyecto VALUES (2,  'Red Corporativa RetailMax',          2,  4, 'completado', 28000, '2021-03-15', '2021-09-20');
INSERT INTO proyecto VALUES (3,  'Sistema de Seguridad ClinicaSalud',  3,  7, 'activo',     32000, '2023-01-05', '2024-03-31');
INSERT INTO proyecto VALUES (4,  'Plataforma Logistica TransLog',      4, 10, 'activo',     55000, '2022-06-01', '2023-12-31');
INSERT INTO proyecto VALUES (5,  'Campus Virtual EduTech',             5, 11, 'activo',     38000, '2023-03-01', '2024-06-30');
INSERT INTO proyecto VALUES (6,  'Firewall y UTM HotelGroup',          6,  8, 'completado', 18000, '2021-09-10', '2022-02-28');
INSERT INTO proyecto VALUES (7,  'ERP Constructora Norte',             7, 12, 'pausado',    70000, '2022-11-01', NULL);
INSERT INTO proyecto VALUES (8,  'App Movil AgroTech',                 8, 10, 'activo',     25000, '2023-05-15', '2024-01-31');
INSERT INTO proyecto VALUES (9,  'Portal Web MediaDigital',            9, 11, 'completado', 42000, '2020-08-01', '2021-04-30');
INSERT INTO proyecto VALUES (10, 'App Fitness FitLife',               10, 12, 'activo',     20000, '2023-07-01', '2024-03-31');
INSERT INTO proyecto VALUES (11, 'Auditoria Seguridad BancoSur',       1,  7, 'completado', 15000, '2022-03-01', '2022-05-31');
INSERT INTO proyecto VALUES (12, 'Monitoring RetailMax',               2,  1, 'activo',     12000, '2023-09-01', NULL);

-- Tareas  (id, proyecto_id, empleado_id, titulo, prioridad, estado, horas_estimadas, horas_reales)
-- Proyectos 1-10 tienen tareas. Proyectos 11 y 12 NO tienen tareas asignadas aun.
INSERT INTO tarea VALUES (1,  1, 2,  'Analisis de requerimientos',          'alta',  'completada',   20, 22);
INSERT INTO tarea VALUES (2,  1, 3,  'Instalacion de servidores',           'alta',  'completada',   40, 45);
INSERT INTO tarea VALUES (3,  1, 8,  'Configuracion firewall perimetral',   'media', 'completada',   16, 14);
INSERT INTO tarea VALUES (4,  2, 4,  'Diseno de red corporativa',           'alta',  'completada',   30, 32);
INSERT INTO tarea VALUES (5,  2, 5,  'Instalacion de switches y routers',   'media', 'completada',   24, 20);
INSERT INTO tarea VALUES (6,  3, 7,  'Auditoria de vulnerabilidades',       'alta',  'en_progreso',  35, 20);
INSERT INTO tarea VALUES (7,  3, 8,  'Implementacion IDS/IPS',              'alta',  'pendiente',    28, NULL);
INSERT INTO tarea VALUES (8,  4, 10, 'Desarrollo modulo de pedidos',        'alta',  'en_progreso',  60, 35);
INSERT INTO tarea VALUES (9,  4, 12, 'Diseno de base de datos logistica',   'alta',  'completada',   20, 18);
INSERT INTO tarea VALUES (10, 5, 11, 'Desarrollo frontend campus virtual',  'alta',  'en_progreso',  80, 40);
INSERT INTO tarea VALUES (11, 5, 12, 'Backend API campus virtual',          'alta',  'en_progreso',  70, 30);
INSERT INTO tarea VALUES (12, 5, 10, 'Testing y QA campus virtual',         'baja',  'pendiente',    30, NULL);
INSERT INTO tarea VALUES (13, 6, 8,  'Configuracion UTM y firewall',        'alta',  'completada',   20, 22);
INSERT INTO tarea VALUES (14, 7, 12, 'Analisis modulos ERP',                'alta',  'pausado',      45, 10);
INSERT INTO tarea VALUES (15, 7, 10, 'Migracion de datos al ERP',           'alta',  'pausado',      60, NULL);
INSERT INTO tarea VALUES (16, 8, 11, 'Desarrollo app movil iOS',            'alta',  'en_progreso',  90, 55);
INSERT INTO tarea VALUES (17, 8, 10, 'Desarrollo app movil Android',        'alta',  'en_progreso',  90, 50);
INSERT INTO tarea VALUES (18, 9, 11, 'Diseno UI portal web',                'media', 'completada',   25, 28);
INSERT INTO tarea VALUES (19, 9, 12, 'Backend y API portal web',            'media', 'completada',   35, 33);
INSERT INTO tarea VALUES (20, 10, 10, 'App fitness y tracking GPS',         'alta',  'en_progreso',  50, 20);

-- Facturas  (id, cliente_id, proyecto_id, fecha_emision, importe, pagada)
INSERT INTO factura VALUES (1,  1, 1,  '2021-07-05', 45000, 1);
INSERT INTO factura VALUES (2,  2, 2,  '2021-10-01', 28000, 1);
INSERT INTO factura VALUES (3,  3, 3,  '2023-04-01', 10000, 0);
INSERT INTO factura VALUES (4,  4, 4,  '2022-12-01', 20000, 1);
INSERT INTO factura VALUES (5,  4, 4,  '2023-06-01', 15000, 1);
INSERT INTO factura VALUES (6,  5, 5,  '2023-09-01', 12000, 0);
INSERT INTO factura VALUES (7,  6, 6,  '2022-03-01', 18000, 1);
INSERT INTO factura VALUES (8,  7, 7,  '2023-01-01', 25000, 0);
INSERT INTO factura VALUES (9,  8, 8,  '2023-07-01',  8000, 0);
INSERT INTO factura VALUES (10, 9, 9,  '2021-05-01', 42000, 1);
INSERT INTO factura VALUES (11, 1, 11, '2022-06-01', 15000, 1);
INSERT INTO factura VALUES (12, 2, 12, '2023-10-01',  6000, 0);
INSERT INTO factura VALUES (13, 5, 5,  '2024-01-15', 13000, 0);
INSERT INTO factura VALUES (14, 3, 3,  '2024-01-10', 10000, 0);
INSERT INTO factura VALUES (15, 8, 8,  '2023-12-01', 10000, 0);
"""


# ─────────────────────────────────────────────────────────────────────────────
# MOTOR DE EJECUCIÓN (igual al router, standalone para el seed)
# ─────────────────────────────────────────────────────────────────────────────

def _execute_in_memory(schema_sql: str, seed_sql: str, query: str) -> dict:
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    try:
        conn.executescript(schema_sql)
        conn.executescript(seed_sql)
        cursor = conn.execute(query)
        columns = [d[0] for d in cursor.description] if cursor.description else []
        rows = [list(r) for r in cursor.fetchall()]
        return {"columns": columns, "rows": rows}
    except sqlite3.Error as e:
        raise ValueError(f"SQL Error: {e}")
    finally:
        conn.close()


def compute_expected(solution_sql: str) -> str:
    result = _execute_in_memory(SCHEMA_SQL, SEED_SQL, solution_sql)
    return json.dumps(result)


# ─────────────────────────────────────────────────────────────────────────────
# DEFINICIÓN DE EJERCICIOS
# ─────────────────────────────────────────────────────────────────────────────

EXERCISES = [
    # ── SELECT BÁSICO (1-6) ───────────────────────────────────────────────────
    {
        "order_num": 1,
        "category": "01 - SELECT Básico",
        "difficulty": "basico",
        "title": "01 - Todos los empleados",
        "description": (
            "Muestra <strong>todos los datos</strong> de todos los empleados de la empresa.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "SELECT — Consulta básica",
        "wiki_content": (
            "La sentencia SELECT es el comando fundamental para leer datos de una base de datos.\n"
            "El asterisco (*) se utiliza para seleccionar TODAS las columnas de una tabla.\n\n"
            "- Es la instrucción más usada en SQL.\n"
            "- Siempre va acompañada de FROM, que indica la tabla de origen.\n"
            "- Con (*) obtenemos todas las columnas disponibles en la tabla."
        ),
        "wiki_syntax": "SELECT * FROM nombre_tabla;",
        "wiki_example": "SELECT * FROM empleado;",
        "solution_sql": "SELECT * FROM empleado",
        "xp_reward": 30,
    },
    {
        "order_num": 2,
        "category": "01 - SELECT Básico",
        "difficulty": "basico",
        "title": "02 - Nombre, apellido y puesto",
        "description": (
            "Muestra únicamente el <strong>nombre</strong>, <strong>apellido</strong> y "
            "<strong>puesto</strong> de cada empleado.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "SELECT — Columnas específicas",
        "wiki_content": (
            "En lugar de seleccionar todas las columnas con (*), puedes indicar exactamente "
            "qué columnas quieres recuperar, separándolas por comas.\n\n"
            "- Recuperar solo las columnas necesarias es más eficiente.\n"
            "- Las columnas se muestran en el orden en que las escribas.\n"
            "- El nombre de cada columna debe coincidir exactamente con el de la tabla."
        ),
        "wiki_syntax": "SELECT columna1, columna2, columna3\nFROM nombre_tabla;",
        "wiki_example": "SELECT nombre, apellido, puesto\nFROM empleado;",
        "solution_sql": "SELECT nombre, apellido, puesto FROM empleado",
        "xp_reward": 30,
    },
    {
        "order_num": 3,
        "category": "01 - SELECT Básico",
        "difficulty": "basico",
        "title": "03 - Alias de columna",
        "description": (
            "Muestra el <strong>nombre</strong>, <strong>apellido</strong> y <strong>salario</strong> "
            "de cada empleado. Renombra la columna salario con el alias <code>sueldo</code>.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "AS — Alias de columna",
        "wiki_content": (
            "La palabra clave AS permite renombrar una columna en el resultado de la consulta, "
            "sin modificar la tabla original. Se denomina 'alias'.\n\n"
            "- El alias aparece como cabecera de la columna en el resultado.\n"
            "- Es temporal: solo afecta a esa consulta.\n"
            "- Si el alias contiene espacios, debe ir entre comillas: AS 'mi alias'."
        ),
        "wiki_syntax": "SELECT columna AS alias\nFROM nombre_tabla;",
        "wiki_example": "SELECT nombre, salario AS sueldo\nFROM empleado;",
        "solution_sql": "SELECT nombre, apellido, salario AS sueldo FROM empleado",
        "xp_reward": 30,
    },
    {
        "order_num": 4,
        "category": "01 - SELECT Básico",
        "difficulty": "basico",
        "title": "04 - Valor constante como columna",
        "description": (
            "Muestra el <strong>nombre</strong> y <strong>apellido</strong> de cada empleado, "
            "junto con el texto <code>'Tech4U'</code> en una columna llamada <code>academia</code>.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "AS — Valores constantes",
        "wiki_content": (
            "En SQL puedes incluir valores literales (textos, números) directamente en el SELECT. "
            "Son columnas calculadas que muestran el mismo valor para cada fila.\n\n"
            "- Los textos van entre comillas simples: 'Mi texto'.\n"
            "- Los números se escriben directamente: 2024.\n"
            "- Es útil para añadir etiquetas o constantes a un informe."
        ),
        "wiki_syntax": "SELECT columna, 'valor fijo' AS etiqueta\nFROM nombre_tabla;",
        "wiki_example": "SELECT nombre, 'Tech4U' AS academia\nFROM empleado;",
        "solution_sql": "SELECT nombre, apellido, 'Tech4U' AS academia FROM empleado",
        "xp_reward": 30,
    },
    {
        "order_num": 5,
        "category": "01 - SELECT Básico",
        "difficulty": "basico",
        "title": "05 - Ciudades únicas (DISTINCT)",
        "description": (
            "Muestra todas las <strong>ciudades distintas</strong> donde la empresa tiene empleados, "
            "sin repeticiones.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "DISTINCT — Eliminar duplicados",
        "wiki_content": (
            "DISTINCT elimina las filas duplicadas del resultado. Solo aparecerá una vez cada "
            "valor único en la columna indicada.\n\n"
            "- Se escribe justo después de SELECT.\n"
            "- Afecta a todas las columnas del SELECT.\n"
            "- Muy útil para obtener listas de valores únicos (ciudades, categorías, estados, etc.)."
        ),
        "wiki_syntax": "SELECT DISTINCT columna\nFROM nombre_tabla;",
        "wiki_example": "SELECT DISTINCT ciudad\nFROM empleado;",
        "solution_sql": "SELECT DISTINCT ciudad FROM empleado",
        "xp_reward": 30,
    },
    {
        "order_num": 6,
        "category": "01 - SELECT Básico",
        "difficulty": "basico",
        "title": "06 - Salario con aumento del 10%",
        "description": (
            "Muestra el <strong>nombre</strong>, <strong>apellido</strong> y el salario actual "
            "incrementado un 10%. Llama a la nueva columna <code>salario_con_aumento</code>. "
            "Usa <code>ROUND(..., 2)</code> para redondear a 2 decimales.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "Columnas calculadas",
        "wiki_content": (
            "SQL permite realizar operaciones aritméticas directamente en el SELECT, creando "
            "columnas calculadas al vuelo sin modificar los datos originales.\n\n"
            "- Operadores disponibles: + - * /\n"
            "- ROUND(valor, decimales) redondea a N decimales.\n"
            "- El resultado puede tener un alias descriptivo con AS."
        ),
        "wiki_syntax": "SELECT nombre, salario * 1.10 AS nuevo_salario\nFROM empleado;",
        "wiki_example": "SELECT nombre, ROUND(salario * 1.10, 2) AS salario_con_aumento\nFROM empleado;",
        "solution_sql": "SELECT nombre, apellido, ROUND(salario * 1.10, 2) AS salario_con_aumento FROM empleado",
        "xp_reward": 40,
    },

    # ── WHERE (7-13) ──────────────────────────────────────────────────────────
    {
        "order_num": 7,
        "category": "02 - Filtro WHERE",
        "difficulty": "basico",
        "title": "07 - Empleados de Desarrollo",
        "description": (
            "Muestra <strong>todos los datos</strong> de los empleados que pertenecen al "
            "departamento con id <code>4</code> (Desarrollo).<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "WHERE — Filtrar filas",
        "wiki_content": (
            "La cláusula WHERE filtra las filas y devuelve solo las que cumplen la condición indicada.\n\n"
            "- Va después del FROM.\n"
            "- Los textos se comparan con comillas simples: WHERE ciudad = 'Madrid'.\n"
            "- Los números se comparan directamente: WHERE salario > 30000.\n"
            "- Operadores de comparación: = <> > < >= <="
        ),
        "wiki_syntax": "SELECT *\nFROM nombre_tabla\nWHERE columna = valor;",
        "wiki_example": "SELECT * FROM empleado\nWHERE departamento_id = 4;",
        "solution_sql": "SELECT * FROM empleado WHERE departamento_id = 4",
        "xp_reward": 40,
    },
    {
        "order_num": 8,
        "category": "02 - Filtro WHERE",
        "difficulty": "basico",
        "title": "08 - Salario superior a 35.000€",
        "description": (
            "Muestra el <strong>nombre</strong>, <strong>apellido</strong> y <strong>salario</strong> "
            "de los empleados que cobran <strong>más de 35.000€</strong>.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "WHERE — Comparaciones numéricas",
        "wiki_content": (
            "WHERE admite comparaciones numéricas con los operadores >, <, >=, <=, =, <>.\n\n"
            "- > mayor que\n"
            "- < menor que\n"
            "- >= mayor o igual\n"
            "- <= menor o igual\n"
            "- <> distinto de (equivale a !=)"
        ),
        "wiki_syntax": "SELECT columna1, columna2\nFROM tabla\nWHERE columna_numerica > valor;",
        "wiki_example": "SELECT nombre, salario\nFROM empleado\nWHERE salario > 35000;",
        "solution_sql": "SELECT nombre, apellido, salario FROM empleado WHERE salario > 35000",
        "xp_reward": 40,
    },
    {
        "order_num": 9,
        "category": "02 - Filtro WHERE",
        "difficulty": "basico",
        "title": "09 - Proyectos activos",
        "description": (
            "Muestra <strong>todos los datos</strong> de los proyectos que están actualmente "
            "en estado <code>'activo'</code>.<br><br>"
            "Tabla: <code>proyecto</code>"
        ),
        "wiki_title": "WHERE — Comparar texto",
        "wiki_content": (
            "Para comparar texto en SQL, los valores deben ir entre comillas simples. "
            "La comparación es sensible a mayúsculas y minúsculas en la mayoría de motores.\n\n"
            "- WHERE estado = 'activo' selecciona solo ese valor exacto.\n"
            "- WHERE estado <> 'activo' excluye ese valor.\n"
            "- Recuerda siempre usar comillas simples para texto, nunca dobles."
        ),
        "wiki_syntax": "SELECT * FROM tabla\nWHERE columna_texto = 'valor';",
        "wiki_example": "SELECT * FROM proyecto\nWHERE estado = 'activo';",
        "solution_sql": "SELECT * FROM proyecto WHERE estado = 'activo'",
        "xp_reward": 40,
    },
    {
        "order_num": 10,
        "category": "02 - Filtro WHERE",
        "difficulty": "basico",
        "title": "10 - Empleados activos en Redes",
        "description": (
            "Muestra el <strong>nombre</strong> y <strong>apellido</strong> de los empleados que "
            "están <strong>activos</strong> (<code>activo = 1</code>) <strong>Y</strong> pertenecen "
            "al departamento <code>2</code> (Redes).<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "WHERE — AND / OR",
        "wiki_content": (
            "Puedes combinar múltiples condiciones en WHERE usando AND y OR:\n\n"
            "- **AND**: las DOS condiciones deben cumplirse.\n"
            "- **OR**: basta con que se cumpla UNA de las condiciones.\n"
            "- Puedes usar paréntesis para agrupar condiciones complejas.\n"
            "- En el campo activo, el valor 1 significa 'sí' y 0 significa 'no'."
        ),
        "wiki_syntax": "SELECT columnas\nFROM tabla\nWHERE condicion1 AND condicion2;",
        "wiki_example": "SELECT nombre, apellido\nFROM empleado\nWHERE activo = 1 AND departamento_id = 2;",
        "solution_sql": "SELECT nombre, apellido FROM empleado WHERE activo = 1 AND departamento_id = 2",
        "xp_reward": 40,
    },
    {
        "order_num": 11,
        "category": "02 - Filtro WHERE",
        "difficulty": "basico",
        "title": "11 - Facturas entre 10.000€ y 25.000€",
        "description": (
            "Muestra <strong>todas las facturas</strong> cuyo importe esté entre "
            "<strong>10.000€ y 25.000€</strong> (ambos valores incluidos).<br><br>"
            "Tabla: <code>factura</code>"
        ),
        "wiki_title": "BETWEEN — Rango de valores",
        "wiki_content": (
            "El operador BETWEEN filtra valores dentro de un rango, incluyendo ambos extremos.\n\n"
            "- Equivale a: columna >= valor_min AND columna <= valor_max.\n"
            "- Funciona con números, fechas y texto.\n"
            "- Su negación es NOT BETWEEN para excluir el rango."
        ),
        "wiki_syntax": "SELECT * FROM tabla\nWHERE columna BETWEEN valor_min AND valor_max;",
        "wiki_example": "SELECT * FROM factura\nWHERE importe BETWEEN 10000 AND 25000;",
        "solution_sql": "SELECT * FROM factura WHERE importe BETWEEN 10000 AND 25000",
        "xp_reward": 50,
    },
    {
        "order_num": 12,
        "category": "02 - Filtro WHERE",
        "difficulty": "basico",
        "title": "12 - Clientes con 'Tech' en el nombre",
        "description": (
            "Muestra la <strong>empresa</strong> y <strong>ciudad</strong> de los clientes cuya "
            "empresa contiene la palabra <code>Tech</code> en cualquier parte del nombre.<br><br>"
            "Tabla: <code>cliente</code>"
        ),
        "wiki_title": "LIKE — Búsqueda de patrones",
        "wiki_content": (
            "El operador LIKE permite buscar patrones en columnas de texto usando comodines:\n\n"
            "- **%** (porcentaje): representa cero o más caracteres.\n"
            "- **_** (guion bajo): representa exactamente un carácter.\n\n"
            "- '%Tech%' → contiene 'Tech' en cualquier posición.\n"
            "- 'Tech%' → empieza por 'Tech'.\n"
            "- '%Tech' → termina en 'Tech'."
        ),
        "wiki_syntax": "SELECT columnas\nFROM tabla\nWHERE columna LIKE '%patron%';",
        "wiki_example": "SELECT empresa, ciudad\nFROM cliente\nWHERE empresa LIKE '%Tech%';",
        "solution_sql": "SELECT empresa, ciudad FROM cliente WHERE empresa LIKE '%Tech%'",
        "xp_reward": 50,
    },
    {
        "order_num": 13,
        "category": "02 - Filtro WHERE",
        "difficulty": "basico",
        "title": "13 - Tareas sin baja prioridad",
        "description": (
            "Muestra el <strong>título</strong> y <strong>prioridad</strong> de todas las tareas "
            "que <strong>NO</strong> tienen prioridad <code>'baja'</code>. "
            "Ordena por <code>id</code> ascendente.<br><br>"
            "Tabla: <code>tarea</code>"
        ),
        "wiki_title": "NOT IN — Excluir valores",
        "wiki_content": (
            "El operador IN comprueba si un valor pertenece a una lista. NOT IN hace lo contrario: "
            "excluye las filas cuyo valor coincide con alguno de la lista.\n\n"
            "- IN ('a', 'b', 'c') → el valor ES alguno de ellos.\n"
            "- NOT IN ('a', 'b', 'c') → el valor NO ES ninguno de ellos.\n"
            "- Es equivalente a múltiples condiciones unidas con OR / AND <>."
        ),
        "wiki_syntax": "SELECT columnas\nFROM tabla\nWHERE columna NOT IN ('val1', 'val2');",
        "wiki_example": "SELECT titulo, prioridad\nFROM tarea\nWHERE prioridad NOT IN ('baja')\nORDER BY id;",
        "solution_sql": "SELECT titulo, prioridad FROM tarea WHERE prioridad NOT IN ('baja') ORDER BY id",
        "xp_reward": 50,
    },

    # ── ORDER BY + LIMIT (14-18) ──────────────────────────────────────────────
    {
        "order_num": 14,
        "category": "03 - ORDER BY y LIMIT",
        "difficulty": "basico",
        "title": "14 - Empleados por salario descendente",
        "description": (
            "Muestra el <strong>nombre</strong>, <strong>apellido</strong> y <strong>salario</strong> "
            "de todos los empleados, ordenados de <strong>mayor a menor salario</strong>.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "ORDER BY — Ordenar resultados",
        "wiki_content": (
            "ORDER BY ordena el resultado de la consulta según los valores de una o varias columnas.\n\n"
            "- **ASC** (por defecto): orden ascendente (A→Z, 1→9).\n"
            "- **DESC**: orden descendente (Z→A, 9→1).\n"
            "- Va siempre al final de la consulta, después de WHERE.\n"
            "- Puedes ordenar por columnas que no estén en el SELECT."
        ),
        "wiki_syntax": "SELECT columnas\nFROM tabla\nORDER BY columna DESC;",
        "wiki_example": "SELECT nombre, salario\nFROM empleado\nORDER BY salario DESC;",
        "solution_sql": "SELECT nombre, apellido, salario FROM empleado ORDER BY salario DESC",
        "xp_reward": 40,
    },
    {
        "order_num": 15,
        "category": "03 - ORDER BY y LIMIT",
        "difficulty": "basico",
        "title": "15 - Empleados por apellido (A-Z)",
        "description": (
            "Muestra el <strong>nombre</strong> y <strong>apellido</strong> de todos los empleados, "
            "ordenados <strong>alfabéticamente por apellido</strong> (ascendente).<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "ORDER BY ASC — Orden alfabético",
        "wiki_content": (
            "ORDER BY ASC ordena de menor a mayor: números del 1 al 9 y texto de la A a la Z. "
            "Es el orden por defecto si no se especifica ASC ni DESC.\n\n"
            "- ORDER BY apellido es igual a ORDER BY apellido ASC.\n"
            "- Para texto, el orden depende del juego de caracteres (collation).\n"
            "- Se puede ordenar por múltiples columnas separadas por comas."
        ),
        "wiki_syntax": "SELECT columnas\nFROM tabla\nORDER BY columna ASC;",
        "wiki_example": "SELECT nombre, apellido\nFROM empleado\nORDER BY apellido ASC;",
        "solution_sql": "SELECT nombre, apellido FROM empleado ORDER BY apellido ASC",
        "xp_reward": 40,
    },
    {
        "order_num": 16,
        "category": "03 - ORDER BY y LIMIT",
        "difficulty": "basico",
        "title": "16 - Top 5 empleados mejor pagados",
        "description": (
            "Muestra el <strong>nombre</strong>, <strong>apellido</strong> y <strong>salario</strong> "
            "de los <strong>5 empleados con mayor salario</strong>.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "LIMIT — Limitar filas",
        "wiki_content": (
            "LIMIT restringe cuántas filas devuelve la consulta. Es muy usado junto con ORDER BY "
            "para obtener los N primeros o últimos registros.\n\n"
            "- LIMIT 5 devuelve las primeras 5 filas.\n"
            "- Combinado con ORDER BY DESC obtiene los N mayores.\n"
            "- Es fundamental para rankings, top-N y paginación."
        ),
        "wiki_syntax": "SELECT columnas\nFROM tabla\nORDER BY columna DESC\nLIMIT n;",
        "wiki_example": "SELECT nombre, salario\nFROM empleado\nORDER BY salario DESC\nLIMIT 5;",
        "solution_sql": "SELECT nombre, apellido, salario FROM empleado ORDER BY salario DESC LIMIT 5",
        "xp_reward": 50,
    },
    {
        "order_num": 17,
        "category": "03 - ORDER BY y LIMIT",
        "difficulty": "basico",
        "title": "17 - Los 3 proyectos más recientes",
        "description": (
            "Muestra el <strong>nombre</strong> y <strong>fecha_inicio</strong> de los "
            "<strong>3 proyectos iniciados más recientemente</strong>.<br><br>"
            "Tabla: <code>proyecto</code>"
        ),
        "wiki_title": "ORDER BY + LIMIT combinados",
        "wiki_content": (
            "Combinar ORDER BY y LIMIT es una de las técnicas más usadas en SQL para "
            "obtener los primeros o últimos N registros de una lista ordenada.\n\n"
            "- Para fechas más recientes: ORDER BY fecha DESC LIMIT N.\n"
            "- Las fechas en formato 'AAAA-MM-DD' se ordenan correctamente como texto.\n"
            "- Para los más antiguos: ORDER BY fecha ASC LIMIT N."
        ),
        "wiki_syntax": "SELECT columnas\nFROM tabla\nORDER BY fecha DESC\nLIMIT 3;",
        "wiki_example": "SELECT nombre, fecha_inicio\nFROM proyecto\nORDER BY fecha_inicio DESC\nLIMIT 3;",
        "solution_sql": "SELECT nombre, fecha_inicio FROM proyecto ORDER BY fecha_inicio DESC LIMIT 3",
        "xp_reward": 50,
    },
    {
        "order_num": 18,
        "category": "03 - ORDER BY y LIMIT",
        "difficulty": "intermedio",
        "title": "18 - Proyectos por presupuesto y nombre",
        "description": (
            "Muestra el <strong>nombre</strong> y <strong>presupuesto</strong> de todos los proyectos, "
            "ordenados primero por <strong>presupuesto descendente</strong> y en caso de empate, "
            "por <strong>nombre ascendente</strong>.<br><br>"
            "Tabla: <code>proyecto</code>"
        ),
        "wiki_title": "ORDER BY — Ordenación múltiple",
        "wiki_content": (
            "Puedes ordenar por varias columnas separándolas con comas. "
            "La segunda columna solo se aplica cuando la primera tiene valores iguales.\n\n"
            "- ORDER BY col1 DESC, col2 ASC: primero ordena por col1 descendente y, "
            "si hay empate, por col2 ascendente.\n"
            "- Muy útil para ordenaciones complejas como rankings con desempate."
        ),
        "wiki_syntax": "SELECT columnas\nFROM tabla\nORDER BY col1 DESC, col2 ASC;",
        "wiki_example": "SELECT nombre, presupuesto\nFROM proyecto\nORDER BY presupuesto DESC, nombre ASC;",
        "solution_sql": "SELECT nombre, presupuesto FROM proyecto ORDER BY presupuesto DESC, nombre ASC",
        "xp_reward": 50,
    },

    # ── COMBOS (19-20) ────────────────────────────────────────────────────────
    {
        "order_num": 19,
        "category": "04 - WHERE + ORDER BY",
        "difficulty": "intermedio",
        "title": "19 - Empleados de Madrid con buen salario",
        "description": (
            "Muestra el <strong>nombre</strong>, <strong>apellido</strong>, <strong>ciudad</strong> "
            "y <strong>salario</strong> de los empleados de <strong>Madrid</strong> con salario "
            "<strong>mayor de 35.000€</strong>, ordenados por <strong>salario descendente</strong>.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "WHERE + ORDER BY combinados",
        "wiki_content": (
            "WHERE y ORDER BY se pueden combinar en la misma consulta. "
            "WHERE filtra primero, y ORDER BY ordena el resultado filtrado.\n\n"
            "- Orden de cláusulas: SELECT → FROM → WHERE → ORDER BY → LIMIT.\n"
            "- WHERE puede tener múltiples condiciones con AND/OR.\n"
            "- ORDER BY se aplica sobre las filas que ya pasaron el filtro WHERE."
        ),
        "wiki_syntax": "SELECT columnas\nFROM tabla\nWHERE cond1 AND cond2\nORDER BY columna DESC;",
        "wiki_example": "SELECT nombre, ciudad, salario\nFROM empleado\nWHERE ciudad = 'Madrid' AND salario > 35000\nORDER BY salario DESC;",
        "solution_sql": "SELECT nombre, apellido, ciudad, salario FROM empleado WHERE ciudad = 'Madrid' AND salario > 35000 ORDER BY salario DESC",
        "xp_reward": 60,
    },
    {
        "order_num": 20,
        "category": "04 - WHERE + ORDER BY",
        "difficulty": "intermedio",
        "title": "20 - Facturas pendientes altas",
        "description": (
            "Muestra <strong>todas las columnas</strong> de las facturas que están "
            "<strong>sin pagar</strong> (<code>pagada = 0</code>) y cuyo importe es "
            "<strong>superior a 8.000€</strong>, ordenadas por <strong>importe descendente</strong>.<br><br>"
            "Tabla: <code>factura</code>"
        ),
        "wiki_title": "WHERE + ORDER BY — Facturas",
        "wiki_content": (
            "Este ejercicio combina dos condiciones en WHERE con AND, más ORDER BY:\n\n"
            "- La columna 'pagada' usa 0 (no pagada) y 1 (pagada) — son valores booleanos.\n"
            "- Combinar filtros numéricos y de estado es muy habitual en facturación.\n"
            "- ORDER BY importe DESC presenta primero las facturas más urgentes."
        ),
        "wiki_syntax": "SELECT *\nFROM tabla\nWHERE cond_booleana = 0 AND cond_numerica > valor\nORDER BY columna DESC;",
        "wiki_example": "SELECT * FROM factura\nWHERE pagada = 0 AND importe > 8000\nORDER BY importe DESC;",
        "solution_sql": "SELECT * FROM factura WHERE pagada = 0 AND importe > 8000 ORDER BY importe DESC",
        "xp_reward": 60,
    },

    # ── FUNCIONES DE AGREGACIÓN (21-26) ──────────────────────────────────────
    {
        "order_num": 21,
        "category": "05 - Funciones de Agregación",
        "difficulty": "intermedio",
        "title": "21 - Total de empleados",
        "description": (
            "Muestra el <strong>número total de empleados</strong> en la empresa. "
            "Llama a la columna <code>total_empleados</code>.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "COUNT — Contar filas",
        "wiki_content": (
            "COUNT es una función de agregación que cuenta el número de filas o valores no nulos.\n\n"
            "- **COUNT(*)** cuenta todas las filas, incluidas las que tienen NULL.\n"
            "- **COUNT(columna)** cuenta solo las filas donde esa columna NO es NULL.\n"
            "- El resultado es siempre un único número (una sola fila)."
        ),
        "wiki_syntax": "SELECT COUNT(*) AS total\nFROM tabla;",
        "wiki_example": "SELECT COUNT(*) AS total_empleados\nFROM empleado;",
        "solution_sql": "SELECT COUNT(*) AS total_empleados FROM empleado",
        "xp_reward": 50,
    },
    {
        "order_num": 22,
        "category": "05 - Funciones de Agregación",
        "difficulty": "intermedio",
        "title": "22 - Presupuesto total de proyectos activos",
        "description": (
            "Muestra la <strong>suma total de presupuestos</strong> de todos los proyectos en estado "
            "<code>'activo'</code>. Llama a la columna <code>total_presupuesto</code>.<br><br>"
            "Tabla: <code>proyecto</code>"
        ),
        "wiki_title": "SUM — Sumar valores",
        "wiki_content": (
            "SUM suma todos los valores numéricos de una columna. Solo cuenta valores no nulos.\n\n"
            "- Muy útil para totales: ventas, presupuestos, horas, importes.\n"
            "- Se puede combinar con WHERE para sumar solo las filas filtradas.\n"
            "- Devuelve NULL si no hay filas o todos los valores son NULL."
        ),
        "wiki_syntax": "SELECT SUM(columna) AS total\nFROM tabla\nWHERE condicion;",
        "wiki_example": "SELECT SUM(presupuesto) AS total_presupuesto\nFROM proyecto\nWHERE estado = 'activo';",
        "solution_sql": "SELECT SUM(presupuesto) AS total_presupuesto FROM proyecto WHERE estado = 'activo'",
        "xp_reward": 50,
    },
    {
        "order_num": 23,
        "category": "05 - Funciones de Agregación",
        "difficulty": "intermedio",
        "title": "23 - Salario medio de la empresa",
        "description": (
            "Muestra el <strong>salario medio</strong> de todos los empleados, redondeado a "
            "2 decimales. Llama a la columna <code>salario_medio</code>.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "AVG — Media aritmética",
        "wiki_content": (
            "AVG calcula la media aritmética de los valores de una columna numérica.\n\n"
            "- Ignora los valores NULL en el cálculo.\n"
            "- Devuelve un número decimal; usa ROUND(AVG(...), 2) para limitar decimales.\n"
            "- Es la función más usada en estadística descriptiva con SQL."
        ),
        "wiki_syntax": "SELECT ROUND(AVG(columna), 2) AS media\nFROM tabla;",
        "wiki_example": "SELECT ROUND(AVG(salario), 2) AS salario_medio\nFROM empleado;",
        "solution_sql": "SELECT ROUND(AVG(salario), 2) AS salario_medio FROM empleado",
        "xp_reward": 50,
    },
    {
        "order_num": 24,
        "category": "05 - Funciones de Agregación",
        "difficulty": "intermedio",
        "title": "24 - Salario máximo y mínimo",
        "description": (
            "Muestra el <strong>salario más alto</strong> y el <strong>más bajo</strong> de toda "
            "la empresa en una sola consulta. Columnas: <code>salario_max</code> y "
            "<code>salario_min</code>.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "MAX y MIN — Extremos",
        "wiki_content": (
            "MAX y MIN devuelven el valor más alto y más bajo de una columna respectivamente.\n\n"
            "- Funcionan con números, texto y fechas.\n"
            "- Para texto: MAX devuelve el último en orden alfabético, MIN el primero.\n"
            "- Se pueden usar juntos en la misma consulta SELECT."
        ),
        "wiki_syntax": "SELECT MAX(columna) AS maximo, MIN(columna) AS minimo\nFROM tabla;",
        "wiki_example": "SELECT MAX(salario) AS salario_max, MIN(salario) AS salario_min\nFROM empleado;",
        "solution_sql": "SELECT MAX(salario) AS salario_max, MIN(salario) AS salario_min FROM empleado",
        "xp_reward": 50,
    },
    {
        "order_num": 25,
        "category": "05 - Funciones de Agregación",
        "difficulty": "intermedio",
        "title": "25 - Estadísticas de horas en tareas",
        "description": (
            "Muestra en una sola consulta: la <strong>suma total</strong>, la <strong>media</strong> "
            "(redondeada a 1 decimal), el <strong>máximo</strong> y el <strong>mínimo</strong> de "
            "<code>horas_estimadas</code> en todas las tareas. Columnas: "
            "<code>total_horas</code>, <code>media_horas</code>, <code>max_horas</code>, <code>min_horas</code>.<br><br>"
            "Tabla: <code>tarea</code>"
        ),
        "wiki_title": "Varias funciones de agregación",
        "wiki_content": (
            "Puedes combinar múltiples funciones de agregación (COUNT, SUM, AVG, MAX, MIN) "
            "en una sola consulta SELECT, generando un resumen estadístico completo.\n\n"
            "- Cada función devuelve un único valor.\n"
            "- El resultado tiene tantas columnas como funciones se usen.\n"
            "- El resultado siempre será una sola fila."
        ),
        "wiki_syntax": "SELECT SUM(col) AS total,\n       ROUND(AVG(col), 1) AS media,\n       MAX(col) AS maximo,\n       MIN(col) AS minimo\nFROM tabla;",
        "wiki_example": "SELECT SUM(horas_estimadas) AS total_horas,\n       ROUND(AVG(horas_estimadas), 1) AS media_horas,\n       MAX(horas_estimadas) AS max_horas,\n       MIN(horas_estimadas) AS min_horas\nFROM tarea;",
        "solution_sql": "SELECT SUM(horas_estimadas) AS total_horas, ROUND(AVG(horas_estimadas), 1) AS media_horas, MAX(horas_estimadas) AS max_horas, MIN(horas_estimadas) AS min_horas FROM tarea",
        "xp_reward": 60,
    },
    {
        "order_num": 26,
        "category": "05 - Funciones de Agregación",
        "difficulty": "intermedio",
        "title": "26 - Total y media de facturación",
        "description": (
            "Muestra el <strong>importe total facturado</strong> (suma de todos los importes) y el "
            "<strong>importe medio por factura</strong> (redondeado a 2 decimales). Columnas: "
            "<code>total_facturado</code>, <code>media_factura</code>.<br><br>"
            "Tabla: <code>factura</code>"
        ),
        "wiki_title": "SUM + AVG combinados",
        "wiki_content": (
            "SUM y AVG se usan conjuntamente en análisis financieros y de facturación.\n\n"
            "- SUM(importe): total acumulado de todas las facturas.\n"
            "- AVG(importe): ticket medio por factura.\n"
            "- Ambas funciones ignoran valores NULL.\n"
            "- Redondear con ROUND mejora la legibilidad del resultado."
        ),
        "wiki_syntax": "SELECT SUM(columna) AS total,\n       ROUND(AVG(columna), 2) AS media\nFROM tabla;",
        "wiki_example": "SELECT SUM(importe) AS total_facturado,\n       ROUND(AVG(importe), 2) AS media_factura\nFROM factura;",
        "solution_sql": "SELECT SUM(importe) AS total_facturado, ROUND(AVG(importe), 2) AS media_factura FROM factura",
        "xp_reward": 60,
    },

    # ── GROUP BY (27-30) ──────────────────────────────────────────────────────
    {
        "order_num": 27,
        "category": "06 - GROUP BY",
        "difficulty": "intermedio",
        "title": "27 - Empleados por departamento",
        "description": (
            "Muestra el <strong>departamento_id</strong> y el <strong>número de empleados</strong> "
            "de cada departamento (<code>num_empleados</code>). Ordena por número de empleados "
            "descendente y en caso de empate, por <code>departamento_id</code> ascendente.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "GROUP BY — Agrupar filas",
        "wiki_content": (
            "GROUP BY agrupa las filas con el mismo valor en la columna indicada, permitiendo "
            "aplicar funciones de agregación a cada grupo por separado.\n\n"
            "- Va después de WHERE y antes de ORDER BY.\n"
            "- En el SELECT, solo puedes tener: la columna agrupada y funciones de agregación.\n"
            "- Muy potente para generar resúmenes y estadísticas por categorías."
        ),
        "wiki_syntax": "SELECT columna, COUNT(*) AS total\nFROM tabla\nGROUP BY columna\nORDER BY total DESC;",
        "wiki_example": "SELECT departamento_id, COUNT(*) AS num_empleados\nFROM empleado\nGROUP BY departamento_id\nORDER BY num_empleados DESC;",
        "solution_sql": "SELECT departamento_id, COUNT(*) AS num_empleados FROM empleado GROUP BY departamento_id ORDER BY num_empleados DESC, departamento_id ASC",
        "xp_reward": 70,
    },
    {
        "order_num": 28,
        "category": "06 - GROUP BY",
        "difficulty": "intermedio",
        "title": "28 - Salario medio por ciudad",
        "description": (
            "Muestra cada <strong>ciudad</strong> y el <strong>salario medio</strong> de sus empleados "
            "(redondeado a 2 decimales, columna <code>salario_medio</code>). Ordena por "
            "<code>salario_medio</code> descendente.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "GROUP BY + AVG",
        "wiki_content": (
            "Combinar GROUP BY con AVG es ideal para calcular medias por categoría o grupo.\n\n"
            "- GROUP BY ciudad crea un grupo por cada ciudad distinta.\n"
            "- AVG(salario) calcula la media dentro de cada grupo.\n"
            "- ROUND evita decimales excesivos en el resultado."
        ),
        "wiki_syntax": "SELECT columna, ROUND(AVG(valor), 2) AS media\nFROM tabla\nGROUP BY columna\nORDER BY media DESC;",
        "wiki_example": "SELECT ciudad, ROUND(AVG(salario), 2) AS salario_medio\nFROM empleado\nGROUP BY ciudad\nORDER BY salario_medio DESC;",
        "solution_sql": "SELECT ciudad, ROUND(AVG(salario), 2) AS salario_medio FROM empleado GROUP BY ciudad ORDER BY salario_medio DESC",
        "xp_reward": 70,
    },
    {
        "order_num": 29,
        "category": "06 - GROUP BY",
        "difficulty": "intermedio",
        "title": "29 - Proyectos por estado",
        "description": (
            "Muestra cada <strong>estado</strong> de proyecto y cuántos proyectos (<code>total</code>) "
            "hay en ese estado. Ordena por <code>total</code> descendente.<br><br>"
            "Tabla: <code>proyecto</code>"
        ),
        "wiki_title": "GROUP BY + COUNT",
        "wiki_content": (
            "GROUP BY con COUNT es la combinación más habitual para contar registros por categoría.\n\n"
            "- Cada valor distinto de la columna agrupada se convierte en una fila del resultado.\n"
            "- COUNT(*) cuenta todos los proyectos de cada grupo.\n"
            "- Ideal para dashboards e informes de estado."
        ),
        "wiki_syntax": "SELECT estado, COUNT(*) AS total\nFROM tabla\nGROUP BY estado\nORDER BY total DESC;",
        "wiki_example": "SELECT estado, COUNT(*) AS total\nFROM proyecto\nGROUP BY estado\nORDER BY total DESC;",
        "solution_sql": "SELECT estado, COUNT(*) AS total FROM proyecto GROUP BY estado ORDER BY total DESC",
        "xp_reward": 70,
    },
    {
        "order_num": 30,
        "category": "06 - GROUP BY",
        "difficulty": "intermedio",
        "title": "30 - Facturación total por cliente",
        "description": (
            "Muestra el <strong>cliente_id</strong> y el <strong>total facturado</strong> a cada "
            "cliente (<code>total_facturado</code>). Ordena por <code>total_facturado</code> "
            "descendente y en caso de empate, por <code>cliente_id</code> ascendente.<br><br>"
            "Tabla: <code>factura</code>"
        ),
        "wiki_title": "GROUP BY + SUM",
        "wiki_content": (
            "GROUP BY con SUM es fundamental en análisis de ventas y facturación.\n\n"
            "- Agrupa todas las facturas por cliente y suma sus importes.\n"
            "- El resultado muestra un resumen financiero por cliente.\n"
            "- ORDER BY con criterio secundario garantiza un orden determinista en empates."
        ),
        "wiki_syntax": "SELECT id_grupo, SUM(valor) AS total\nFROM tabla\nGROUP BY id_grupo\nORDER BY total DESC;",
        "wiki_example": "SELECT cliente_id, SUM(importe) AS total_facturado\nFROM factura\nGROUP BY cliente_id\nORDER BY total_facturado DESC, cliente_id ASC;",
        "solution_sql": "SELECT cliente_id, SUM(importe) AS total_facturado FROM factura GROUP BY cliente_id ORDER BY total_facturado DESC, cliente_id ASC",
        "xp_reward": 70,
    },

    # ── HAVING (31-32) ────────────────────────────────────────────────────────
    {
        "order_num": 31,
        "category": "07 - HAVING",
        "difficulty": "avanzado",
        "title": "31 - Departamentos con 3 o más empleados",
        "description": (
            "Muestra el <strong>departamento_id</strong> y el <strong>número de empleados</strong> "
            "de aquellos departamentos que tienen <strong>3 o más empleados</strong>. "
            "Ordena por <code>departamento_id</code> ascendente.<br><br>"
            "Tabla: <code>empleado</code>"
        ),
        "wiki_title": "HAVING — Filtrar grupos",
        "wiki_content": (
            "HAVING filtra los grupos generados por GROUP BY. "
            "Es como el WHERE, pero actúa sobre grupos en lugar de filas individuales.\n\n"
            "- WHERE filtra filas ANTES de agrupar.\n"
            "- HAVING filtra grupos DESPUÉS de agrupar.\n"
            "- En HAVING puedes usar funciones de agregación como COUNT, SUM, AVG, etc.\n"
            "- Orden: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY."
        ),
        "wiki_syntax": "SELECT columna, COUNT(*) AS total\nFROM tabla\nGROUP BY columna\nHAVING COUNT(*) >= n\nORDER BY columna;",
        "wiki_example": "SELECT departamento_id, COUNT(*) AS num_empleados\nFROM empleado\nGROUP BY departamento_id\nHAVING COUNT(*) >= 3\nORDER BY departamento_id;",
        "solution_sql": "SELECT departamento_id, COUNT(*) AS num_empleados FROM empleado GROUP BY departamento_id HAVING COUNT(*) >= 3 ORDER BY departamento_id",
        "xp_reward": 80,
    },
    {
        "order_num": 32,
        "category": "07 - HAVING",
        "difficulty": "avanzado",
        "title": "32 - Clientes con facturación superior a 20.000€",
        "description": (
            "Muestra el <strong>cliente_id</strong> y el <strong>total facturado</strong> de aquellos "
            "clientes cuya facturación total <strong>supera los 20.000€</strong>. Ordena por "
            "<code>total_facturado</code> descendente y en caso de empate por <code>cliente_id</code> "
            "ascendente.<br><br>"
            "Tabla: <code>factura</code>"
        ),
        "wiki_title": "HAVING + SUM — Filtrar por total",
        "wiki_content": (
            "Combinar HAVING con SUM permite filtrar grupos según su total acumulado.\n\n"
            "- Primero se agrupan las facturas por cliente y se suman los importes.\n"
            "- HAVING SUM(importe) > 20000 descarta los clientes con menos facturación.\n"
            "- No se podría hacer con WHERE porque WHERE no permite funciones de agregación."
        ),
        "wiki_syntax": "SELECT id, SUM(valor) AS total\nFROM tabla\nGROUP BY id\nHAVING SUM(valor) > umbral\nORDER BY total DESC;",
        "wiki_example": "SELECT cliente_id, SUM(importe) AS total_facturado\nFROM factura\nGROUP BY cliente_id\nHAVING SUM(importe) > 20000\nORDER BY total_facturado DESC, cliente_id ASC;",
        "solution_sql": "SELECT cliente_id, SUM(importe) AS total_facturado FROM factura GROUP BY cliente_id HAVING SUM(importe) > 20000 ORDER BY total_facturado DESC, cliente_id ASC",
        "xp_reward": 80,
    },

    # ── SUBCONSULTAS (33-36) ──────────────────────────────────────────────────
    {
        "order_num": 33,
        "category": "08 - Subconsultas",
        "difficulty": "avanzado",
        "title": "33 - Empleados con salario superior a la media",
        "description": (
            "Muestra el <strong>nombre</strong>, <strong>apellido</strong> y <strong>salario</strong> "
            "de los empleados cuyo salario es <strong>superior al salario medio</strong> de la empresa. "
            "Ordena por <code>salario</code> descendente.<br><br>"
            "Tabla: <code>empleado</code> (usa subconsulta para calcular la media)"
        ),
        "wiki_title": "Subconsulta — Valor escalar",
        "wiki_content": (
            "Una subconsulta es una consulta SQL dentro de otra. La consulta interior se ejecuta "
            "primero y su resultado es usado por la consulta exterior.\n\n"
            "- La subconsulta va entre paréntesis.\n"
            "- Una subconsulta escalar devuelve un único valor (una fila, una columna).\n"
            "- Se puede usar en WHERE: WHERE salario > (SELECT AVG(salario) FROM empleado).\n"
            "- La subconsulta se evalúa una vez para toda la consulta exterior."
        ),
        "wiki_syntax": "SELECT columnas\nFROM tabla\nWHERE columna > (SELECT AVG(columna) FROM tabla)\nORDER BY columna DESC;",
        "wiki_example": "SELECT nombre, salario\nFROM empleado\nWHERE salario > (SELECT AVG(salario) FROM empleado)\nORDER BY salario DESC;",
        "solution_sql": "SELECT nombre, apellido, salario FROM empleado WHERE salario > (SELECT AVG(salario) FROM empleado) ORDER BY salario DESC",
        "xp_reward": 90,
    },
    {
        "order_num": 34,
        "category": "08 - Subconsultas",
        "difficulty": "avanzado",
        "title": "34 - Proyectos sin tareas asignadas",
        "description": (
            "Muestra el <strong>nombre</strong> de los proyectos que <strong>no tienen ninguna "
            "tarea asignada</strong>. Ordena por <code>nombre</code> ascendente.<br><br>"
            "Tablas: <code>proyecto</code>, <code>tarea</code> (subconsulta)"
        ),
        "wiki_title": "Subconsulta — NOT IN",
        "wiki_content": (
            "Las subconsultas con NOT IN permiten encontrar registros que no tienen "
            "correspondencia en otra tabla. Es una alternativa sencilla a los LEFT JOIN.\n\n"
            "- La subconsulta devuelve una lista de ids existentes en la tabla relacionada.\n"
            "- NOT IN filtra los registros que NO están en esa lista.\n"
            "- ¡Precaución! Si la subconsulta puede devolver NULL, NOT IN puede dar resultados inesperados."
        ),
        "wiki_syntax": "SELECT columnas\nFROM tabla_a\nWHERE id NOT IN (SELECT id_externo FROM tabla_b)\nORDER BY columna;",
        "wiki_example": "SELECT nombre\nFROM proyecto\nWHERE id NOT IN (SELECT DISTINCT proyecto_id FROM tarea)\nORDER BY nombre;",
        "solution_sql": "SELECT nombre FROM proyecto WHERE id NOT IN (SELECT DISTINCT proyecto_id FROM tarea) ORDER BY nombre",
        "xp_reward": 90,
    },
    {
        "order_num": 35,
        "category": "08 - Subconsultas",
        "difficulty": "avanzado",
        "title": "35 - Responsables de proyectos activos",
        "description": (
            "Muestra el <strong>nombre</strong> y <strong>apellido</strong> de los empleados que "
            "son <strong>responsables de algún proyecto activo</strong>, sin duplicados. "
            "Ordena por <code>apellido</code> ascendente.<br><br>"
            "Tablas: <code>empleado</code>, <code>proyecto</code> (subconsulta)"
        ),
        "wiki_title": "Subconsulta — IN con filtro",
        "wiki_content": (
            "Las subconsultas con IN filtran registros cuyo id aparece en el resultado de otra consulta. "
            "Combinando con WHERE en la subconsulta, se filtran solo los registros relevantes.\n\n"
            "- La subconsulta interior aplica su propio WHERE (estado = 'activo').\n"
            "- La consulta exterior usa esos resultados para filtrar empleados.\n"
            "- DISTINCT en la consulta exterior evita filas duplicadas cuando un empleado\n"
            "  gestiona varios proyectos activos."
        ),
        "wiki_syntax": "SELECT DISTINCT nombre, apellido\nFROM empleado\nWHERE id IN (\n    SELECT responsable_id FROM proyecto WHERE estado = 'activo'\n)\nORDER BY apellido;",
        "wiki_example": "SELECT DISTINCT nombre, apellido\nFROM empleado\nWHERE id IN (\n    SELECT responsable_id FROM proyecto WHERE estado = 'activo'\n)\nORDER BY apellido;",
        "solution_sql": "SELECT DISTINCT nombre, apellido FROM empleado WHERE id IN (SELECT responsable_id FROM proyecto WHERE estado = 'activo') ORDER BY apellido",
        "xp_reward": 90,
    },
    {
        "order_num": 36,
        "category": "08 - Subconsultas",
        "difficulty": "avanzado",
        "title": "36 - Departamentos con presupuesto por encima de la media",
        "description": (
            "Muestra el <strong>nombre</strong> y <strong>presupuesto_anual</strong> de los "
            "departamentos cuyo presupuesto supera el <strong>presupuesto medio</strong> de todos "
            "los departamentos. Ordena por <code>presupuesto_anual</code> descendente.<br><br>"
            "Tabla: <code>departamento</code>"
        ),
        "wiki_title": "Subconsulta — Comparar con promedio del grupo",
        "wiki_content": (
            "Comparar cada fila con el promedio de su propia tabla es un patrón muy habitual "
            "en SQL. Requiere una subconsulta escalar que calcula el AVG globalmente.\n\n"
            "- La subconsulta (SELECT AVG(...) FROM tabla) devuelve un único número.\n"
            "- Ese número se compara con cada fila de la consulta exterior.\n"
            "- Se puede aplicar igual con MAX, MIN, SUM, COUNT, etc."
        ),
        "wiki_syntax": "SELECT nombre, presupuesto\nFROM departamento\nWHERE presupuesto > (\n    SELECT AVG(presupuesto) FROM departamento\n)\nORDER BY presupuesto DESC;",
        "wiki_example": "SELECT nombre, presupuesto_anual\nFROM departamento\nWHERE presupuesto_anual > (SELECT AVG(presupuesto_anual) FROM departamento)\nORDER BY presupuesto_anual DESC;",
        "solution_sql": "SELECT nombre, presupuesto_anual FROM departamento WHERE presupuesto_anual > (SELECT AVG(presupuesto_anual) FROM departamento) ORDER BY presupuesto_anual DESC",
        "xp_reward": 90,
    },

    # ── EXAMEN FINAL (37) ─────────────────────────────────────────────────────
    {
        "order_num": 37,
        "category": "09 - Examen Final",
        "difficulty": "avanzado",
        "title": "37 - Examen: Análisis de departamentos activos",
        "description": (
            "<strong>🎓 EXAMEN FINAL</strong><br><br>"
            "Muestra el <strong>departamento_id</strong>, el <strong>número de empleados activos</strong> "
            "(<code>num_empleados_activos</code>) y el <strong>salario medio</strong> de los empleados "
            "activos (<code>salario_medio</code>, redondeado a 2 decimales) de aquellos departamentos "
            "que tienen <strong>más de 2 empleados activos</strong>.<br><br>"
            "Ordena por <code>salario_medio</code> descendente.<br><br>"
            "Tabla: <code>empleado</code><br><br>"
            "<em>Necesitarás combinar: WHERE, GROUP BY, HAVING y ORDER BY.</em>"
        ),
        "wiki_title": "Examen — Consulta completa",
        "wiki_content": (
            "Este examen combina todos los conceptos del módulo en una única consulta:\n\n"
            "- **WHERE activo = 1** → filtra empleados activos antes de agrupar.\n"
            "- **GROUP BY departamento_id** → agrupa por departamento.\n"
            "- **COUNT(*) / AVG(salario)** → calcula estadísticas por grupo.\n"
            "- **HAVING COUNT(*) > 2** → filtra departamentos con más de 2 activos.\n"
            "- **ORDER BY salario_medio DESC** → ordena el resultado final.\n\n"
            "Orden obligatorio: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY."
        ),
        "wiki_syntax": "SELECT col, COUNT(*) AS n, ROUND(AVG(val), 2) AS media\nFROM tabla\nWHERE filtro\nGROUP BY col\nHAVING COUNT(*) > umbral\nORDER BY media DESC;",
        "wiki_example": (
            "SELECT departamento_id,\n"
            "       COUNT(*) AS num_empleados_activos,\n"
            "       ROUND(AVG(salario), 2) AS salario_medio\nFROM empleado\n"
            "WHERE activo = 1\nGROUP BY departamento_id\nHAVING COUNT(*) > 2\nORDER BY salario_medio DESC;"
        ),
        "solution_sql": (
            "SELECT departamento_id, COUNT(*) AS num_empleados_activos, "
            "ROUND(AVG(salario), 2) AS salario_medio "
            "FROM empleado WHERE activo = 1 "
            "GROUP BY departamento_id HAVING COUNT(*) > 2 ORDER BY salario_medio DESC"
        ),
        "xp_reward": 200,
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# RUNNER PRINCIPAL
# ─────────────────────────────────────────────────────────────────────────────

def run():
    db = SessionLocal()
    try:
        # Verificar si el dataset ya existe
        existing = db.query(SQLDataset).filter(SQLDataset.name == "Empresa IT").first()
        if existing:
            print(f"[!] El dataset 'Empresa IT' ya existe (id={existing.id}). Borrando para actualizar...")
            db.query(SQLExercise).filter(SQLExercise.dataset_id == existing.id).delete()
            db.delete(existing)
            db.commit()

        # Crear el dataset
        print("[+] Creando dataset 'Empresa IT'...")
        dataset = SQLDataset(
            name="Empresa IT",
            description=(
                "Base de datos de una empresa de servicios IT con 5 tablas: "
                "departamento, empleado, cliente, proyecto, tarea y factura. "
                "Perfecto para practicar consultas SQL reales del entorno empresarial."
            ),
            schema_sql=SCHEMA_SQL,
            seed_sql=SEED_SQL,
            er_diagram_url=None,
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        print(f"    Dataset creado con id={dataset.id}")

        # Verificar que el schema+seed funciona
        print("[+] Verificando schema y seed SQL...")
        try:
            test = _execute_in_memory(SCHEMA_SQL, SEED_SQL, "SELECT COUNT(*) AS n FROM empleado")
            assert test["rows"][0][0] == 15, f"Esperados 15 empleados, encontrados {test['rows'][0][0]}"
            print("    ✓ empleado: 15 filas")
            test = _execute_in_memory(SCHEMA_SQL, SEED_SQL, "SELECT COUNT(*) AS n FROM cliente")
            assert test["rows"][0][0] == 10
            print("    ✓ cliente: 10 filas")
            test = _execute_in_memory(SCHEMA_SQL, SEED_SQL, "SELECT COUNT(*) AS n FROM proyecto")
            assert test["rows"][0][0] == 12
            print("    ✓ proyecto: 12 filas")
            test = _execute_in_memory(SCHEMA_SQL, SEED_SQL, "SELECT COUNT(*) AS n FROM tarea")
            assert test["rows"][0][0] == 20
            print("    ✓ tarea: 20 filas")
            test = _execute_in_memory(SCHEMA_SQL, SEED_SQL, "SELECT COUNT(*) AS n FROM factura")
            assert test["rows"][0][0] == 15
            print("    ✓ factura: 15 filas")
        except Exception as e:
            print(f"    ✗ Error en verificación: {e}")
            db.delete(dataset)
            db.commit()
            return

        # Insertar ejercicios
        print(f"[+] Insertando {len(EXERCISES)} ejercicios...")
        errors = 0
        for ex_data in EXERCISES:
            try:
                expected = compute_expected(ex_data["solution_sql"])
                result_preview = json.loads(expected)
                rows_count = len(result_preview.get("rows", []))

                exercise = SQLExercise(
                    dataset_id=dataset.id,
                    order_num=ex_data["order_num"],
                    category=ex_data["category"],
                    difficulty=ex_data["difficulty"],
                    title=ex_data["title"],
                    description=ex_data["description"],
                    wiki_title=ex_data.get("wiki_title"),
                    wiki_content=ex_data.get("wiki_content"),
                    wiki_syntax=ex_data.get("wiki_syntax"),
                    wiki_example=ex_data.get("wiki_example"),
                    solution_sql=ex_data["solution_sql"],
                    expected_result=expected,
                    xp_reward=ex_data.get("xp_reward", 50),
                    is_active=True,
                )
                db.add(exercise)
                print(f"    ✓ [{ex_data['order_num']:02d}] {ex_data['title']} — {rows_count} filas")
            except Exception as e:
                print(f"    ✗ [{ex_data['order_num']:02d}] {ex_data['title']}: {e}")
                errors += 1

        db.commit()

        if errors == 0:
            print(f"\n✅ Dataset 'Empresa IT' creado correctamente con {len(EXERCISES)} ejercicios.")
        else:
            print(f"\n⚠️  Dataset creado con {errors} error(es). Revisa los ejercicios marcados con ✗.")

        print("\n📊 Resumen de resultados esperados:")
        print("   Ej01 → 15 filas  | Ej06 → 15 filas  | Ej13 → 19 filas")
        print("   Ej16 → 5 filas   | Ej21 → 1 fila    | Ej27 → 5 filas")
        print("   Ej31 → 4 filas   | Ej32 → 6 filas   | Ej33 → 8 filas")
        print("   Ej34 → 2 filas   | Ej35 → 5 filas   | Ej36 → 2 filas")
        print("   Ej37 → 3 filas   (Examen)")

    finally:
        db.close()


if __name__ == "__main__":
    run()
