#!/usr/bin/env python3
"""
Seed: Dataset Pokémon
35 Pokémon de las generaciones 1 y 2 | 25 movimientos | 37 ejercicios
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy.orm import Session
from database import SessionLocal, SQLDataset, SQLExercise
import json, sqlite3

# ─── Dataset meta ────────────────────────────────────────────────────────────
DATASET_NAME = "Pokemon"
DATASET_DESC = "Base de datos Pokémon con estadísticas base de las generaciones 1 y 2 y movimientos."

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS pokemon (
    id          INTEGER PRIMARY KEY,
    nombre      TEXT NOT NULL,
    tipo_primario  TEXT NOT NULL,
    tipo_secundario TEXT,
    hp          INTEGER NOT NULL,
    ataque      INTEGER NOT NULL,
    defensa     INTEGER NOT NULL,
    sp_ataque   INTEGER NOT NULL,
    sp_defensa  INTEGER NOT NULL,
    velocidad   INTEGER NOT NULL,
    generacion  INTEGER NOT NULL,
    legendario  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS movimiento (
    id            INTEGER PRIMARY KEY,
    nombre        TEXT NOT NULL,
    tipo          TEXT NOT NULL,
    categoria     TEXT NOT NULL,
    potencia      INTEGER,
    precision_pct INTEGER,
    pp            INTEGER NOT NULL
);
"""

SEED_SQL = """
INSERT INTO pokemon VALUES
(1,'Bulbasaur','Planta','Veneno',45,49,49,65,65,45,1,0),
(2,'Charmander','Fuego',NULL,39,52,43,60,50,65,1,0),
(3,'Squirtle','Agua',NULL,44,48,65,50,64,43,1,0),
(4,'Pikachu','Electrico',NULL,35,55,40,50,50,90,1,0),
(5,'Raichu','Electrico',NULL,60,90,55,90,80,110,1,0),
(6,'Geodude','Roca','Tierra',40,80,100,30,30,20,1,0),
(7,'Gengar','Fantasma','Veneno',60,65,60,130,75,110,1,0),
(8,'Machamp','Lucha',NULL,90,130,80,65,85,55,1,0),
(9,'Alakazam','Psiquico',NULL,55,50,45,135,95,120,1,0),
(10,'Slowbro','Agua','Psiquico',95,75,110,100,80,30,1,0),
(11,'Lapras','Agua','Hielo',130,85,80,85,95,60,1,0),
(12,'Snorlax','Normal',NULL,160,110,65,65,110,30,1,0),
(13,'Ditto','Normal',NULL,48,48,48,48,48,48,1,0),
(14,'Eevee','Normal',NULL,55,55,50,45,65,55,1,0),
(15,'Vaporeon','Agua',NULL,130,65,60,110,95,65,1,0),
(16,'Jolteon','Electrico',NULL,65,65,60,110,95,130,1,0),
(17,'Flareon','Fuego',NULL,65,130,60,95,110,65,1,0),
(18,'Dragonite','Dragon','Volador',91,134,95,100,100,80,1,0),
(19,'Mewtwo','Psiquico',NULL,106,110,90,154,90,130,1,1),
(20,'Mew','Psiquico',NULL,100,100,100,100,100,100,1,1),
(21,'Clefable','Normal',NULL,95,70,73,85,90,60,1,0),
(22,'Venusaur','Planta','Veneno',80,82,83,100,100,80,1,0),
(23,'Charizard','Fuego','Volador',78,84,78,109,85,100,1,0),
(24,'Blastoise','Agua',NULL,79,83,100,85,105,78,1,0),
(25,'Arcanine','Fuego',NULL,90,110,80,100,80,95,1,0),
(26,'Ampharos','Electrico',NULL,90,75,85,115,90,55,2,0),
(27,'Espeon','Psiquico',NULL,65,65,60,130,95,110,2,0),
(28,'Umbreon','Siniestro',NULL,95,65,110,60,130,65,2,0),
(29,'Scizor','Bicho','Acero',70,130,100,55,80,65,2,0),
(30,'Heracross','Bicho','Lucha',80,125,75,40,95,85,2,0),
(31,'Steelix','Acero','Tierra',75,85,200,55,65,30,2,0),
(32,'Tyranitar','Roca','Siniestro',100,134,110,95,100,61,2,0),
(33,'Lugia','Psiquico','Volador',106,90,130,90,154,110,2,1),
(34,'Ho-Oh','Fuego','Volador',106,130,90,110,154,90,2,1),
(35,'Celebi','Planta','Psiquico',100,100,100,100,100,100,2,1);

INSERT INTO movimiento VALUES
(1,'Lanzallamas','Fuego','especial',90,100,15),
(2,'Hidrobomba','Agua','especial',110,80,5),
(3,'Rayo','Electrico','especial',90,100,15),
(4,'Rayo Solar','Planta','especial',120,100,10),
(5,'Psiquico','Psiquico','especial',90,100,10),
(6,'Terremoto','Tierra','fisico',100,100,10),
(7,'Hiperrayo','Normal','especial',150,90,5),
(8,'Puño Hielo','Hielo','fisico',75,100,15),
(9,'Megapuño','Normal','fisico',80,85,20),
(10,'Corte','Normal','fisico',50,95,30),
(11,'Surf','Agua','especial',90,100,15),
(12,'Llamarada','Fuego','especial',110,85,5),
(13,'Trueno','Electrico','especial',110,70,10),
(14,'Trituracion','Normal','fisico',80,100,15),
(15,'Psi Rayo','Psiquico','especial',65,100,20),
(16,'Fuerza','Normal','fisico',80,100,15),
(17,'Roca Afilada','Roca','fisico',50,100,30),
(18,'Megadrain','Planta','especial',75,100,10),
(19,'Vuelo','Volador','fisico',90,95,15),
(20,'Tajo Cruzado','Lucha','fisico',100,80,5),
(21,'Acua Cola','Agua','fisico',90,90,10),
(22,'Puño Trueno','Electrico','fisico',75,100,15),
(23,'Quemapolvo','Fuego','fisico',65,100,25),
(24,'Gruñido','Normal','estado',NULL,100,40),
(25,'Maldicion','Fantasma','estado',NULL,NULL,10);
"""

# ─── Ejercicios ───────────────────────────────────────────────────────────────
EXERCISES = [
    # ── SELECT Básico ──────────────────────────────────────────────────────
    {
        "title": "Seleccionar todos los Pokémon",
        "category": "SELECT Básico",
        "order_num": 1,
        "difficulty": "basico",
        "description": "Muestra los primeros 10 Pokémon de la base de datos.",
        "wiki_title": "SELECT y LIMIT",
        "wiki_content": "SELECT * devuelve todas las columnas de una tabla. LIMIT restringe el número de filas devueltas.",
        "wiki_syntax": "SELECT * FROM tabla LIMIT n;",
        "wiki_example": "SELECT * FROM pokemon LIMIT 5;",
        "solution_sql": "SELECT * FROM pokemon LIMIT 10;",
        "xp_reward": 30,
    },
    {
        "title": "Nombre y tipos de Pokémon",
        "category": "SELECT Básico",
        "order_num": 2,
        "difficulty": "basico",
        "description": "Selecciona el nombre, tipo_primario y tipo_secundario de todos los Pokémon.",
        "wiki_title": "Selección de columnas",
        "wiki_content": "Puedes elegir columnas concretas en lugar de usar *. Esto hace las consultas más eficientes.",
        "wiki_syntax": "SELECT col1, col2, col3 FROM tabla;",
        "wiki_example": "SELECT nombre, tipo_primario FROM pokemon;",
        "solution_sql": "SELECT nombre, tipo_primario, tipo_secundario FROM pokemon;",
        "xp_reward": 30,
    },
    {
        "title": "Estadísticas ofensivas",
        "category": "SELECT Básico",
        "order_num": 3,
        "difficulty": "basico",
        "description": "Muestra el nombre, hp, ataque y defensa de todos los Pokémon.",
        "wiki_title": "Columnas numéricas",
        "wiki_content": "Las estadísticas base de los Pokémon (hp, ataque, defensa, etc.) son valores numéricos enteros.",
        "wiki_syntax": "SELECT nombre, hp, ataque, defensa FROM pokemon;",
        "wiki_example": "SELECT nombre, hp FROM pokemon;",
        "solution_sql": "SELECT nombre, hp, ataque, defensa FROM pokemon;",
        "xp_reward": 30,
    },
    {
        "title": "Información de movimientos",
        "category": "SELECT Básico",
        "order_num": 4,
        "difficulty": "basico",
        "description": "Muestra el nombre, tipo, categoría y potencia de todos los movimientos.",
        "wiki_title": "Tabla de movimientos",
        "wiki_content": "La tabla movimiento contiene los ataques disponibles con sus atributos: tipo, categoría, potencia, precisión y PP.",
        "wiki_syntax": "SELECT nombre, tipo, categoria, potencia FROM movimiento;",
        "wiki_example": "SELECT * FROM movimiento;",
        "solution_sql": "SELECT nombre, tipo, categoria, potencia FROM movimiento;",
        "xp_reward": 30,
    },
    {
        "title": "Tipos únicos de Pokémon",
        "category": "SELECT Básico",
        "order_num": 5,
        "difficulty": "basico",
        "description": "Obtén la lista de tipos primarios únicos (sin repetición) ordenados alfabéticamente.",
        "wiki_title": "DISTINCT",
        "wiki_content": "DISTINCT elimina filas duplicadas del resultado, devolviendo solo valores únicos.",
        "wiki_syntax": "SELECT DISTINCT columna FROM tabla ORDER BY columna;",
        "wiki_example": "SELECT DISTINCT tipo_primario FROM pokemon;",
        "solution_sql": "SELECT DISTINCT tipo_primario FROM pokemon ORDER BY tipo_primario;",
        "xp_reward": 40,
    },
    # ── WHERE ──────────────────────────────────────────────────────────────
    {
        "title": "Pokémon con más de 100 HP",
        "category": "WHERE",
        "order_num": 6,
        "difficulty": "basico",
        "description": "Muestra el nombre y hp de los Pokémon que tienen más de 100 puntos de HP.",
        "wiki_title": "WHERE con comparación",
        "wiki_content": "WHERE filtra filas según una condición. Operadores: >, <, >=, <=, =, != (o <>).",
        "wiki_syntax": "SELECT columnas FROM tabla WHERE columna > valor;",
        "wiki_example": "SELECT nombre, hp FROM pokemon WHERE hp > 100;",
        "solution_sql": "SELECT nombre, hp FROM pokemon WHERE hp > 100;",
        "xp_reward": 40,
    },
    {
        "title": "Pokémon de segunda generación",
        "category": "WHERE",
        "order_num": 7,
        "difficulty": "basico",
        "description": "Lista el nombre y tipo_primario de todos los Pokémon de la generación 2.",
        "wiki_title": "WHERE con igualdad",
        "wiki_content": "Usa = para filtrar por un valor exacto. Los números no necesitan comillas.",
        "wiki_syntax": "SELECT columnas FROM tabla WHERE columna = valor;",
        "wiki_example": "SELECT nombre FROM pokemon WHERE generacion = 2;",
        "solution_sql": "SELECT nombre, tipo_primario FROM pokemon WHERE generacion = 2;",
        "xp_reward": 40,
    },
    {
        "title": "Pokémon legendarios",
        "category": "WHERE",
        "order_num": 8,
        "difficulty": "basico",
        "description": "Muestra el nombre de todos los Pokémon legendarios (legendario = 1).",
        "wiki_title": "Filtrar por valor booleano",
        "wiki_content": "En SQLite los booleanos se almacenan como 0 (falso) y 1 (verdadero).",
        "wiki_syntax": "SELECT nombre FROM tabla WHERE columna_bool = 1;",
        "wiki_example": "SELECT nombre FROM pokemon WHERE legendario = 1;",
        "solution_sql": "SELECT nombre FROM pokemon WHERE legendario = 1;",
        "xp_reward": 40,
    },
    {
        "title": "Movimientos de alta potencia",
        "category": "WHERE",
        "order_num": 9,
        "difficulty": "basico",
        "description": "Lista el nombre y potencia de los movimientos con potencia de 100 o más.",
        "wiki_title": "WHERE con mayor o igual",
        "wiki_content": ">= incluye el valor límite (100 en este caso), a diferencia de > que lo excluye.",
        "wiki_syntax": "SELECT nombre, potencia FROM movimiento WHERE potencia >= 100;",
        "wiki_example": "SELECT nombre FROM movimiento WHERE potencia >= 100;",
        "solution_sql": "SELECT nombre, potencia FROM movimiento WHERE potencia >= 100;",
        "xp_reward": 40,
    },
    {
        "title": "Movimientos físicos",
        "category": "WHERE",
        "order_num": 10,
        "difficulty": "basico",
        "description": "Muestra el nombre y tipo de todos los movimientos de categoría 'fisico'.",
        "wiki_title": "WHERE con texto",
        "wiki_content": "Al filtrar por texto, el valor debe ir entre comillas simples. SQL diferencia 'fisico' de 'Fisico'.",
        "wiki_syntax": "SELECT columnas FROM tabla WHERE columna_texto = 'valor';",
        "wiki_example": "SELECT nombre FROM movimiento WHERE categoria = 'fisico';",
        "solution_sql": "SELECT nombre, tipo FROM movimiento WHERE categoria = 'fisico';",
        "xp_reward": 40,
    },
    {
        "title": "Pokémon con tipo secundario",
        "category": "WHERE",
        "order_num": 11,
        "difficulty": "intermedio",
        "description": "Lista el nombre y tipo_primario de los Pokémon que tienen un tipo secundario (tipo_secundario no es NULL).",
        "wiki_title": "IS NOT NULL",
        "wiki_content": "NULL representa ausencia de valor. Usa IS NOT NULL para filtrar filas que sí tienen valor en esa columna.",
        "wiki_syntax": "SELECT columnas FROM tabla WHERE columna IS NOT NULL;",
        "wiki_example": "SELECT nombre FROM pokemon WHERE tipo_secundario IS NOT NULL;",
        "solution_sql": "SELECT nombre, tipo_primario FROM pokemon WHERE tipo_secundario IS NOT NULL;",
        "xp_reward": 50,
    },
    {
        "title": "Pokémon de fuego de primera generación",
        "category": "WHERE",
        "order_num": 12,
        "difficulty": "intermedio",
        "description": "Muestra el nombre de los Pokémon de tipo Fuego que sean de la generación 1.",
        "wiki_title": "WHERE con AND",
        "wiki_content": "AND combina dos condiciones: ambas deben ser verdaderas para que la fila se incluya.",
        "wiki_syntax": "SELECT columnas FROM tabla WHERE condicion1 AND condicion2;",
        "wiki_example": "SELECT nombre FROM pokemon WHERE tipo_primario = 'Agua' AND generacion = 1;",
        "solution_sql": "SELECT nombre FROM pokemon WHERE tipo_primario = 'Fuego' AND generacion = 1;",
        "xp_reward": 50,
    },
    # ── ORDER BY y LIMIT ───────────────────────────────────────────────────
    {
        "title": "Top 5 Pokémon más rápidos",
        "category": "ORDER BY y LIMIT",
        "order_num": 13,
        "difficulty": "basico",
        "description": "Muestra el nombre y velocidad de los 5 Pokémon más rápidos (mayor a menor). En caso de empate, ordena por nombre ASC.",
        "wiki_title": "ORDER BY DESC y LIMIT",
        "wiki_content": "ORDER BY ordena los resultados. DESC = descendente (mayor primero). LIMIT limita el número de filas.",
        "wiki_syntax": "SELECT columnas FROM tabla ORDER BY col DESC, col2 ASC LIMIT n;",
        "wiki_example": "SELECT nombre, velocidad FROM pokemon ORDER BY velocidad DESC LIMIT 5;",
        "solution_sql": "SELECT nombre, velocidad FROM pokemon ORDER BY velocidad DESC, nombre ASC LIMIT 5;",
        "xp_reward": 40,
    },
    {
        "title": "Top 10 Pokémon con mayor ataque",
        "category": "ORDER BY y LIMIT",
        "order_num": 14,
        "difficulty": "basico",
        "description": "Muestra el nombre y ataque de los 10 Pokémon con mayor ataque. En empate, ordena por nombre ASC.",
        "wiki_title": "Ranking con desempate",
        "wiki_content": "Usar ORDER BY con varias columnas permite criterios de desempate cuando hay valores iguales.",
        "wiki_syntax": "SELECT columnas FROM tabla ORDER BY col1 DESC, col2 ASC LIMIT n;",
        "wiki_example": "SELECT nombre, ataque FROM pokemon ORDER BY ataque DESC LIMIT 10;",
        "solution_sql": "SELECT nombre, ataque FROM pokemon ORDER BY ataque DESC, nombre ASC LIMIT 10;",
        "xp_reward": 40,
    },
    {
        "title": "Top 5 Pokémon con más HP",
        "category": "ORDER BY y LIMIT",
        "order_num": 15,
        "difficulty": "basico",
        "description": "Muestra el nombre y hp de los 5 Pokémon con más HP. En empate, ordena por nombre ASC.",
        "wiki_title": "Ranking por HP",
        "wiki_content": "HP (Hit Points) indica la resistencia del Pokémon en combate.",
        "wiki_syntax": "SELECT nombre, hp FROM tabla ORDER BY hp DESC, nombre ASC LIMIT 5;",
        "wiki_example": "SELECT nombre, hp FROM pokemon ORDER BY hp DESC LIMIT 5;",
        "solution_sql": "SELECT nombre, hp FROM pokemon ORDER BY hp DESC, nombre ASC LIMIT 5;",
        "xp_reward": 40,
    },
    {
        "title": "Movimientos más potentes",
        "category": "ORDER BY y LIMIT",
        "order_num": 16,
        "difficulty": "intermedio",
        "description": "Lista el nombre y potencia de los 5 movimientos con más potencia (excluye movimientos sin potencia). En empate, por nombre ASC.",
        "wiki_title": "WHERE + ORDER BY + LIMIT",
        "wiki_content": "Combina WHERE para excluir NULLs con ORDER BY para ordenar y LIMIT para restringir.",
        "wiki_syntax": "SELECT columnas FROM tabla WHERE col IS NOT NULL ORDER BY col DESC LIMIT n;",
        "wiki_example": "SELECT nombre, potencia FROM movimiento WHERE potencia IS NOT NULL ORDER BY potencia DESC LIMIT 5;",
        "solution_sql": "SELECT nombre, potencia FROM movimiento WHERE potencia IS NOT NULL ORDER BY potencia DESC, nombre ASC LIMIT 5;",
        "xp_reward": 50,
    },
    {
        "title": "Pokémon ordenados por HP ascendente",
        "category": "ORDER BY y LIMIT",
        "order_num": 17,
        "difficulty": "basico",
        "description": "Muestra el nombre, hp, ataque y defensa de todos los Pokémon, ordenados por HP de menor a mayor. En empate, por nombre ASC.",
        "wiki_title": "ORDER BY ASC",
        "wiki_content": "ASC (ascending) es el orden ascendente, de menor a mayor. Es el orden por defecto si no se especifica.",
        "wiki_syntax": "SELECT columnas FROM tabla ORDER BY col ASC, col2 ASC;",
        "wiki_example": "SELECT nombre, hp FROM pokemon ORDER BY hp ASC;",
        "solution_sql": "SELECT nombre, hp, ataque, defensa FROM pokemon ORDER BY hp ASC, nombre ASC;",
        "xp_reward": 40,
    },
    # ── Funciones de Agregación ────────────────────────────────────────────
    {
        "title": "Total de Pokémon en la base de datos",
        "category": "Funciones de Agregación",
        "order_num": 18,
        "difficulty": "basico",
        "description": "Cuenta cuántos Pokémon hay en total en la base de datos.",
        "wiki_title": "COUNT(*)",
        "wiki_content": "COUNT(*) cuenta todas las filas de una tabla, incluyendo las que tienen NULL en alguna columna.",
        "wiki_syntax": "SELECT COUNT(*) AS alias FROM tabla;",
        "wiki_example": "SELECT COUNT(*) AS total FROM pokemon;",
        "solution_sql": "SELECT COUNT(*) AS total_pokemon FROM pokemon;",
        "xp_reward": 40,
    },
    {
        "title": "Total de movimientos",
        "category": "Funciones de Agregación",
        "order_num": 19,
        "difficulty": "basico",
        "description": "Cuenta cuántos movimientos existen en total en la base de datos.",
        "wiki_title": "COUNT en otra tabla",
        "wiki_content": "COUNT funciona igual en cualquier tabla. El alias (AS) le da nombre al resultado.",
        "wiki_syntax": "SELECT COUNT(*) AS alias FROM tabla;",
        "wiki_example": "SELECT COUNT(*) AS total FROM movimiento;",
        "solution_sql": "SELECT COUNT(*) AS total_movimientos FROM movimiento;",
        "xp_reward": 40,
    },
    {
        "title": "Velocidad media de todos los Pokémon",
        "category": "Funciones de Agregación",
        "order_num": 20,
        "difficulty": "basico",
        "description": "Calcula la velocidad media de todos los Pokémon.",
        "wiki_title": "AVG()",
        "wiki_content": "AVG calcula la media aritmética de una columna numérica, ignorando valores NULL.",
        "wiki_syntax": "SELECT AVG(columna) AS alias FROM tabla;",
        "wiki_example": "SELECT AVG(velocidad) FROM pokemon;",
        "solution_sql": "SELECT AVG(velocidad) AS media_velocidad FROM pokemon;",
        "xp_reward": 40,
    },
    {
        "title": "Ataque máximo y mínimo",
        "category": "Funciones de Agregación",
        "order_num": 21,
        "difficulty": "basico",
        "description": "Encuentra el ataque máximo y el ataque mínimo de todos los Pokémon.",
        "wiki_title": "MAX() y MIN()",
        "wiki_content": "MAX devuelve el valor mayor y MIN el menor de una columna. Se pueden usar juntos en un mismo SELECT.",
        "wiki_syntax": "SELECT MAX(col) AS max_col, MIN(col) AS min_col FROM tabla;",
        "wiki_example": "SELECT MAX(hp), MIN(hp) FROM pokemon;",
        "solution_sql": "SELECT MAX(ataque) AS max_ataque, MIN(ataque) AS min_ataque FROM pokemon;",
        "xp_reward": 40,
    },
    {
        "title": "Suma de HP de Pokémon no legendarios",
        "category": "Funciones de Agregación",
        "order_num": 22,
        "difficulty": "intermedio",
        "description": "Calcula la suma total de HP de todos los Pokémon que no son legendarios.",
        "wiki_title": "SUM() con filtro",
        "wiki_content": "SUM calcula la suma de todos los valores de una columna. Se puede combinar con WHERE.",
        "wiki_syntax": "SELECT SUM(columna) AS alias FROM tabla WHERE condicion;",
        "wiki_example": "SELECT SUM(hp) FROM pokemon WHERE legendario = 0;",
        "solution_sql": "SELECT SUM(hp) AS suma_hp FROM pokemon WHERE legendario = 0;",
        "xp_reward": 50,
    },
    {
        "title": "Estadísticas medias globales",
        "category": "Funciones de Agregación",
        "order_num": 23,
        "difficulty": "intermedio",
        "description": "Calcula la media de hp, ataque y velocidad de todos los Pokémon en una sola consulta.",
        "wiki_title": "Múltiples funciones de agregación",
        "wiki_content": "Puedes usar varias funciones de agregación en un mismo SELECT para obtener varios indicadores a la vez.",
        "wiki_syntax": "SELECT AVG(col1) AS a1, AVG(col2) AS a2, AVG(col3) AS a3 FROM tabla;",
        "wiki_example": "SELECT AVG(hp), AVG(ataque) FROM pokemon;",
        "solution_sql": "SELECT AVG(hp) AS media_hp, AVG(ataque) AS media_ataque, AVG(velocidad) AS media_velocidad FROM pokemon;",
        "xp_reward": 50,
    },
    {
        "title": "Movimientos especiales",
        "category": "Funciones de Agregación",
        "order_num": 24,
        "difficulty": "basico",
        "description": "Cuenta cuántos movimientos son de categoría 'especial'.",
        "wiki_title": "COUNT con WHERE",
        "wiki_content": "Combina COUNT(*) con WHERE para contar solo las filas que cumplen una condición.",
        "wiki_syntax": "SELECT COUNT(*) AS alias FROM tabla WHERE condicion;",
        "wiki_example": "SELECT COUNT(*) FROM movimiento WHERE categoria = 'especial';",
        "solution_sql": "SELECT COUNT(*) AS total_especiales FROM movimiento WHERE categoria = 'especial';",
        "xp_reward": 40,
    },
    # ── GROUP BY ───────────────────────────────────────────────────────────
    {
        "title": "Pokémon por tipo primario",
        "category": "GROUP BY",
        "order_num": 25,
        "difficulty": "intermedio",
        "description": "Muestra cuántos Pokémon hay de cada tipo primario, ordenados de mayor a menor cantidad. En empate, ordena el tipo alfabéticamente.",
        "wiki_title": "GROUP BY",
        "wiki_content": "GROUP BY agrupa filas con el mismo valor en una columna y aplica funciones de agregación a cada grupo.",
        "wiki_syntax": "SELECT col, COUNT(*) AS n FROM tabla GROUP BY col ORDER BY n DESC;",
        "wiki_example": "SELECT tipo_primario, COUNT(*) FROM pokemon GROUP BY tipo_primario;",
        "solution_sql": "SELECT tipo_primario, COUNT(*) AS cantidad FROM pokemon GROUP BY tipo_primario ORDER BY cantidad DESC, tipo_primario ASC;",
        "xp_reward": 60,
    },
    {
        "title": "Pokémon por generación",
        "category": "GROUP BY",
        "order_num": 26,
        "difficulty": "intermedio",
        "description": "Cuenta cuántos Pokémon hay en cada generación, ordenados por número de generación.",
        "wiki_title": "GROUP BY con columna numérica",
        "wiki_content": "GROUP BY también funciona con columnas numéricas, creando un grupo por cada valor distinto.",
        "wiki_syntax": "SELECT col_num, COUNT(*) FROM tabla GROUP BY col_num ORDER BY col_num;",
        "wiki_example": "SELECT generacion, COUNT(*) FROM pokemon GROUP BY generacion;",
        "solution_sql": "SELECT generacion, COUNT(*) AS cantidad FROM pokemon GROUP BY generacion ORDER BY generacion;",
        "xp_reward": 60,
    },
    {
        "title": "Movimientos por categoría",
        "category": "GROUP BY",
        "order_num": 27,
        "difficulty": "intermedio",
        "description": "Cuenta cuántos movimientos hay de cada categoría (fisico, especial, estado), ordenados de mayor a menor.",
        "wiki_title": "GROUP BY en movimientos",
        "wiki_content": "GROUP BY agrupa los movimientos por su categoría para obtener el total de cada una.",
        "wiki_syntax": "SELECT categoria, COUNT(*) AS n FROM movimiento GROUP BY categoria ORDER BY n DESC;",
        "wiki_example": "SELECT categoria, COUNT(*) FROM movimiento GROUP BY categoria;",
        "solution_sql": "SELECT categoria, COUNT(*) AS total FROM movimiento GROUP BY categoria ORDER BY total DESC;",
        "xp_reward": 60,
    },
    {
        "title": "Velocidad media por tipo primario",
        "category": "GROUP BY",
        "order_num": 28,
        "difficulty": "intermedio",
        "description": "Calcula la velocidad media de cada tipo primario, ordenado de mayor a menor. En empate, ordena el tipo ASC.",
        "wiki_title": "AVG con GROUP BY",
        "wiki_content": "Combina AVG con GROUP BY para calcular la media de cada grupo.",
        "wiki_syntax": "SELECT col, AVG(num) AS media FROM tabla GROUP BY col ORDER BY media DESC;",
        "wiki_example": "SELECT tipo_primario, AVG(velocidad) FROM pokemon GROUP BY tipo_primario;",
        "solution_sql": "SELECT tipo_primario, AVG(velocidad) AS media_velocidad FROM pokemon GROUP BY tipo_primario ORDER BY media_velocidad DESC, tipo_primario ASC;",
        "xp_reward": 60,
    },
    {
        "title": "HP medio: legendarios vs no legendarios",
        "category": "GROUP BY",
        "order_num": 29,
        "difficulty": "intermedio",
        "description": "Calcula el HP medio agrupando los Pokémon en legendarios (1) y no legendarios (0). Ordena por la columna legendario ASC.",
        "wiki_title": "GROUP BY con booleano",
        "wiki_content": "GROUP BY sobre una columna 0/1 crea exactamente 2 grupos, permitiendo comparar ambas categorías.",
        "wiki_syntax": "SELECT legendario, AVG(hp) FROM pokemon GROUP BY legendario ORDER BY legendario;",
        "wiki_example": "SELECT legendario, AVG(hp) FROM pokemon GROUP BY legendario ORDER BY legendario;",
        "solution_sql": "SELECT legendario, AVG(hp) AS media_hp FROM pokemon GROUP BY legendario ORDER BY legendario;",
        "xp_reward": 60,
    },
    # ── HAVING ─────────────────────────────────────────────────────────────
    {
        "title": "Tipos con al menos 3 Pokémon",
        "category": "HAVING",
        "order_num": 30,
        "difficulty": "avanzado",
        "description": "Muestra los tipos primarios que tienen 3 o más Pokémon, ordenados por cantidad DESC. En empate, por tipo ASC.",
        "wiki_title": "HAVING",
        "wiki_content": "HAVING filtra grupos tras el GROUP BY. No se puede usar WHERE para filtrar resultados de funciones de agregación.",
        "wiki_syntax": "SELECT col, COUNT(*) AS n FROM tabla GROUP BY col HAVING COUNT(*) >= valor ORDER BY n DESC;",
        "wiki_example": "SELECT tipo_primario, COUNT(*) FROM pokemon GROUP BY tipo_primario HAVING COUNT(*) >= 3;",
        "solution_sql": "SELECT tipo_primario, COUNT(*) AS cantidad FROM pokemon GROUP BY tipo_primario HAVING COUNT(*) >= 3 ORDER BY cantidad DESC, tipo_primario ASC;",
        "xp_reward": 70,
    },
    {
        "title": "Tipos de movimiento con potencia media alta",
        "category": "HAVING",
        "order_num": 31,
        "difficulty": "avanzado",
        "description": "Lista los tipos de movimientos cuya potencia media sea mayor de 80 (solo con potencia definida), ordenados por media DESC. En empate, tipo ASC.",
        "wiki_title": "HAVING con AVG",
        "wiki_content": "HAVING puede usarse con cualquier función de agregación. El WHERE previo excluye los NULL antes de agrupar.",
        "wiki_syntax": "SELECT tipo, AVG(potencia) AS media FROM movimiento WHERE potencia IS NOT NULL GROUP BY tipo HAVING AVG(potencia) > 80;",
        "wiki_example": "SELECT tipo, AVG(potencia) FROM movimiento GROUP BY tipo HAVING AVG(potencia) > 80;",
        "solution_sql": "SELECT tipo, AVG(potencia) AS media_potencia FROM movimiento WHERE potencia IS NOT NULL GROUP BY tipo HAVING AVG(potencia) > 80 ORDER BY media_potencia DESC, tipo ASC;",
        "xp_reward": 70,
    },
    # ── Subconsultas ───────────────────────────────────────────────────────
    {
        "title": "Pokémon más rápidos que la media",
        "category": "Subconsultas",
        "order_num": 32,
        "difficulty": "avanzado",
        "description": "Lista el nombre y velocidad de los Pokémon cuya velocidad supera la media de todos. Ordena por velocidad DESC, nombre ASC.",
        "wiki_title": "Subconsulta en WHERE",
        "wiki_content": "Una subconsulta es una SELECT dentro de otra SELECT. Útil para comparar con valores calculados dinámicamente.",
        "wiki_syntax": "SELECT columnas FROM tabla WHERE col > (SELECT AVG(col) FROM tabla);",
        "wiki_example": "SELECT nombre FROM pokemon WHERE hp > (SELECT AVG(hp) FROM pokemon);",
        "solution_sql": "SELECT nombre, velocidad FROM pokemon WHERE velocidad > (SELECT AVG(velocidad) FROM pokemon) ORDER BY velocidad DESC, nombre ASC;",
        "xp_reward": 80,
    },
    {
        "title": "Pokémon con el mayor HP",
        "category": "Subconsultas",
        "order_num": 33,
        "difficulty": "avanzado",
        "description": "Encuentra el nombre y hp del Pokémon (o Pokémon) que tienen el mayor HP de toda la base de datos.",
        "wiki_title": "Subconsulta con MAX",
        "wiki_content": "Usa MAX en una subconsulta para encontrar el valor máximo y filtra por él en la consulta principal.",
        "wiki_syntax": "SELECT columnas FROM tabla WHERE col = (SELECT MAX(col) FROM tabla);",
        "wiki_example": "SELECT nombre FROM pokemon WHERE hp = (SELECT MAX(hp) FROM pokemon);",
        "solution_sql": "SELECT nombre, hp FROM pokemon WHERE hp = (SELECT MAX(hp) FROM pokemon);",
        "xp_reward": 80,
    },
    {
        "title": "Pokémon sin movimientos de su tipo",
        "category": "Subconsultas",
        "order_num": 34,
        "difficulty": "avanzado",
        "description": "Lista los Pokémon cuyo tipo_primario NO aparece como tipo en ningún movimiento. Ordena por nombre ASC.",
        "wiki_title": "NOT IN con subconsulta",
        "wiki_content": "NOT IN filtra filas cuyo valor no está en el conjunto devuelto por la subconsulta. Útil para encontrar 'huérfanos'.",
        "wiki_syntax": "SELECT col FROM tabla WHERE col NOT IN (SELECT DISTINCT col FROM otra_tabla);",
        "wiki_example": "SELECT nombre FROM pokemon WHERE tipo_primario NOT IN (SELECT DISTINCT tipo FROM movimiento);",
        "solution_sql": "SELECT nombre FROM pokemon WHERE tipo_primario NOT IN (SELECT DISTINCT tipo FROM movimiento) ORDER BY nombre ASC;",
        "xp_reward": 80,
    },
    {
        "title": "No legendarios con ataque superior a la media",
        "category": "Subconsultas",
        "order_num": 35,
        "difficulty": "avanzado",
        "description": "Muestra los Pokémon NO legendarios cuyo ataque supera la media de ataque de los no legendarios. Ordena por ataque DESC, nombre ASC.",
        "wiki_title": "Subconsulta con filtro interno",
        "wiki_content": "La subconsulta puede filtrar el conjunto antes de calcular la media (WHERE legendario = 0 dentro).",
        "wiki_syntax": "SELECT col FROM tabla WHERE col > (SELECT AVG(col) FROM tabla WHERE cond) AND cond;",
        "wiki_example": "SELECT nombre FROM pokemon WHERE hp > (SELECT AVG(hp) FROM pokemon WHERE legendario=0) AND legendario=0;",
        "solution_sql": "SELECT nombre, ataque FROM pokemon WHERE ataque > (SELECT AVG(ataque) FROM pokemon WHERE legendario = 0) AND legendario = 0 ORDER BY ataque DESC, nombre ASC;",
        "xp_reward": 80,
    },
    {
        "title": "Movimiento más potente",
        "category": "Subconsultas",
        "order_num": 36,
        "difficulty": "avanzado",
        "description": "Muestra el nombre y potencia del movimiento con mayor potencia.",
        "wiki_title": "Filtrar por máximo con subconsulta",
        "wiki_content": "Selecciona la fila cuya potencia coincide con el máximo obtenido en la subconsulta.",
        "wiki_syntax": "SELECT columnas FROM tabla WHERE col = (SELECT MAX(col) FROM tabla);",
        "wiki_example": "SELECT nombre FROM movimiento WHERE potencia = (SELECT MAX(potencia) FROM movimiento);",
        "solution_sql": "SELECT nombre, potencia FROM movimiento WHERE potencia = (SELECT MAX(potencia) FROM movimiento);",
        "xp_reward": 80,
    },
    # ── Examen Final ───────────────────────────────────────────────────────
    {
        "title": "Examen Final Pokémon",
        "category": "Examen Final",
        "order_num": 37,
        "difficulty": "avanzado",
        "description": (
            "Muestra por tipo_primario: total de Pokémon, media de HP (redondeada a 1 decimal) "
            "y velocidad máxima. Solo tipos con al menos 2 Pokémon. "
            "Ordena por total DESC, media_hp DESC y tipo_primario ASC."
        ),
        "wiki_title": "Consulta compleja final",
        "wiki_content": (
            "Combina GROUP BY con HAVING, ROUND, múltiples funciones de agregación (COUNT, AVG, MAX) "
            "y ORDER BY multicritério para obtener un resumen estadístico por tipo."
        ),
        "wiki_syntax": (
            "SELECT col, COUNT(*) AS n, ROUND(AVG(num),1) AS avg_n, MAX(num2) AS max_num2\n"
            "FROM tabla\n"
            "GROUP BY col\n"
            "HAVING COUNT(*) >= x\n"
            "ORDER BY n DESC, avg_n DESC, col ASC;"
        ),
        "wiki_example": "SELECT tipo_primario, COUNT(*), ROUND(AVG(hp),1) FROM pokemon GROUP BY tipo_primario HAVING COUNT(*) >= 2;",
        "solution_sql": (
            "SELECT tipo_primario, COUNT(*) AS total_pokemon, ROUND(AVG(hp), 1) AS media_hp, "
            "MAX(velocidad) AS max_velocidad "
            "FROM pokemon "
            "GROUP BY tipo_primario "
            "HAVING COUNT(*) >= 2 "
            "ORDER BY total_pokemon DESC, media_hp DESC, tipo_primario ASC;"
        ),
        "xp_reward": 200,
    },
]


# ─── Motor de ejecución en memoria (igual que el backend) ────────────────────
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
    finally:
        conn.close()


def _compute_expected(solution_sql: str) -> str:
    result = _execute_in_memory(SCHEMA_SQL, SEED_SQL, solution_sql)
    return json.dumps(result)


# ─── Seed principal ───────────────────────────────────────────────────────────
def run_seed():
    db: Session = SessionLocal()
    try:
        # ── 1. Dataset ──────────────────────────────────────────────────────
        dataset = db.query(SQLDataset).filter(SQLDataset.name == DATASET_NAME).first()
        if not dataset:
            dataset = SQLDataset(
                name=DATASET_NAME,
                description=DATASET_DESC,
                schema_sql=SCHEMA_SQL,
                seed_sql=SEED_SQL,
                er_diagram_url=None,
            )
            db.add(dataset)
            db.commit()
            db.refresh(dataset)
            print(f"[+] Dataset '{DATASET_NAME}' creado (id={dataset.id})")
        else:
            # Actualizar schema/seed por si cambió
            dataset.schema_sql = SCHEMA_SQL
            dataset.seed_sql = SEED_SQL
            db.commit()
            print(f"[~] Dataset '{DATASET_NAME}' ya existe (id={dataset.id}), actualizado.")

        # ── 2. Ejercicios ────────────────────────────────────────────────────
        existing = {
            ex.order_num: ex
            for ex in db.query(SQLExercise).filter(SQLExercise.dataset_id == dataset.id).all()
        }

        created = updated = 0
        for idx, data in enumerate(EXERCISES, start=1):
            solution = data["solution_sql"]
            try:
                expected_json = _compute_expected(solution)
            except Exception as e:
                print(f"  [ERROR] Ejercicio {idx} '{data['title']}': {e}")
                raise

            ex = existing.get(data["order_num"])
            if ex:
                # Actualizar
                for field, val in data.items():
                    setattr(ex, field, val)
                ex.expected_result = expected_json
                ex.is_active = True
                updated += 1
            else:
                # Crear
                ex = SQLExercise(
                    dataset_id=dataset.id,
                    expected_result=expected_json,
                    is_active=True,
                    **data,
                )
                db.add(ex)
                created += 1

        db.commit()
        print(f"[+] Ejercicios creados: {created}, actualizados: {updated}")
        print(f"\n✅  Seed '{DATASET_NAME}' completado — {len(EXERCISES)} ejercicios listos.")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# ─── Verificación standalone ──────────────────────────────────────────────────
def verify_all():
    """Ejecuta todas las soluciones y muestra los resultados para revisión."""
    import textwrap
    print("=" * 60)
    print(f"  VERIFICACIÓN — Dataset: {DATASET_NAME}")
    print("=" * 60)
    errors = []
    for data in EXERCISES:
        try:
            result = _execute_in_memory(SCHEMA_SQL, SEED_SQL, data["solution_sql"])
            rows = result["rows"]
            cols = result["columns"]
            print(f"\n[{data['order_num']:02d}] {data['title']}")
            print(f"     Columnas : {cols}")
            print(f"     Filas    : {len(rows)}")
            if rows:
                # Mostrar primeras 3 filas
                for r in rows[:3]:
                    print(f"               {r}")
                if len(rows) > 3:
                    print(f"               ... ({len(rows) - 3} más)")
        except Exception as e:
            errors.append((data["order_num"], data["title"], str(e)))
            print(f"\n[{data['order_num']:02d}] ❌ ERROR: {e}")

    print("\n" + "=" * 60)
    if errors:
        print(f"  ❌ {len(errors)} ejercicio(s) con error:")
        for num, title, err in errors:
            print(f"     [{num:02d}] {title}: {err}")
    else:
        print(f"  ✅ Todos los {len(EXERCISES)} ejercicios verificados correctamente.")
    print("=" * 60)
    return len(errors) == 0


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Seed del dataset Pokémon")
    parser.add_argument("--verify-only", action="store_true",
                        help="Solo verificar los SQL sin tocar la base de datos")
    args = parser.parse_args()

    if args.verify_only:
        ok = verify_all()
        sys.exit(0 if ok else 1)
    else:
        verify_all()
        print()
        run_seed()
