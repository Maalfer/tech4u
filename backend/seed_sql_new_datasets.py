"""
Seed: SQL Skills — Tres nuevos datasets: Instituto, Hospital, Red Social
Ejecutar una sola vez: python seed_sql_new_datasets.py
"""
import json
import sqlite3
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, SQLDataset, SQLExercise, create_tables


# ──────────────────────────────────────────────────────────────
# DATASET 1: INSTITUTO (Base de datos académica)
# ──────────────────────────────────────────────────────────────

INSTITUTO_SCHEMA = """
CREATE TABLE IF NOT EXISTS ciclo (
    id      INTEGER PRIMARY KEY,
    nombre  TEXT    NOT NULL,
    codigo  TEXT    NOT NULL,
    duracion_anios INTEGER
);

CREATE TABLE IF NOT EXISTS alumno (
    id              INTEGER PRIMARY KEY,
    nombre          TEXT    NOT NULL,
    apellidos       TEXT    NOT NULL,
    email           TEXT,
    fecha_nacimiento TEXT,
    ciclo_id        INTEGER REFERENCES ciclo(id),
    curso           INTEGER,
    fecha_matricula TEXT
);

CREATE TABLE IF NOT EXISTS profesor (
    id          INTEGER PRIMARY KEY,
    nombre      TEXT    NOT NULL,
    apellidos   TEXT    NOT NULL,
    email       TEXT,
    especialidad TEXT,
    num_colegiado TEXT
);

CREATE TABLE IF NOT EXISTS modulo (
    id          INTEGER PRIMARY KEY,
    nombre      TEXT    NOT NULL,
    codigo      TEXT    NOT NULL,
    horas       INTEGER,
    curso       INTEGER,
    ciclo_id    INTEGER REFERENCES ciclo(id),
    profesor_id INTEGER REFERENCES profesor(id)
);

CREATE TABLE IF NOT EXISTS matricula (
    id              INTEGER PRIMARY KEY,
    alumno_id       INTEGER REFERENCES alumno(id),
    modulo_id       INTEGER REFERENCES modulo(id),
    ano_academico   TEXT,
    fecha_matricula TEXT
);

CREATE TABLE IF NOT EXISTS nota (
    id          INTEGER PRIMARY KEY,
    matricula_id INTEGER REFERENCES matricula(id),
    convocatoria TEXT,
    calificacion REAL,
    fecha       TEXT
);
"""

INSTITUTO_SEED = """
INSERT INTO ciclo VALUES
(1, 'Administración de Sistemas Informáticos en Red', 'ASIR', 2),
(2, 'Desarrollo de Aplicaciones Web', 'DAW', 2),
(3, 'Desarrollo de Aplicaciones Multiplataforma', 'DAM', 2),
(4, 'Sistemas Microinformáticos y Redes', 'SMR', 2);

INSERT INTO alumno VALUES
(1, 'Carlos', 'García López', 'carlos.garcia@email.com', '2005-03-15', 1, 1, '2023-09-01'),
(2, 'Marina', 'Rodríguez Pérez', 'marina.rodriguez@email.com', '2005-05-22', 1, 1, '2023-09-01'),
(3, 'Juan', 'Martínez Sánchez', 'juan.martinez@email.com', '2005-07-10', 1, 1, '2023-09-01'),
(4, 'Ana', 'López García', 'ana.lopez@email.com', '2005-02-28', 2, 1, '2023-09-01'),
(5, 'David', 'Fernández Ruiz', 'david.fernandez@email.com', '2005-08-14', 2, 1, '2023-09-01'),
(6, 'Laura', 'Jiménez Torres', 'laura.jimenez@email.com', '2005-04-19', 2, 1, '2023-09-01'),
(7, 'Miguel', 'Sánchez Moreno', 'miguel.sanchez@email.com', '2005-09-03', 3, 1, '2023-09-01'),
(8, 'Isabel', 'González Díaz', 'isabel.gonzalez@email.com', '2005-06-25', 3, 1, '2023-09-01'),
(9, 'Raúl', 'Flores Ruiz', 'raul.flores@email.com', '2005-01-11', 3, 1, '2023-09-01'),
(10, 'Elena', 'Molina Gómez', 'elena.molina@email.com', '2005-11-07', 4, 1, '2023-09-01'),
(11, 'Jorge', 'Ramírez Castillo', 'jorge.ramirez@email.com', '2005-10-18', 4, 1, '2023-09-01'),
(12, 'Sofía', 'Navarro Iglesias', 'sofia.navarro@email.com', '2005-12-02', 4, 1, '2023-09-01'),
(13, 'Tomás', 'Vargas Herrera', 'tomas.vargas@email.com', '2005-08-30', 1, 2, '2024-09-01'),
(14, 'Beatriz', 'Cabrera Montoya', 'beatriz.cabrera@email.com', '2006-03-05', 1, 2, '2024-09-01'),
(15, 'Ricardo', 'Valdés Rosales', 'ricardo.valdes@email.com', '2006-07-21', 2, 2, '2024-09-01'),
(16, 'Marta', 'Iglesias Delgado', 'marta.iglesias@email.com', '2006-02-14', 2, 2, '2024-09-01'),
(17, 'Andrés', 'Corrales Soto', 'andres.corrales@email.com', '2006-09-09', 3, 2, '2024-09-01'),
(18, 'Valeria', 'Domínguez Campos', 'valeria.dominguez@email.com', '2006-04-28', 3, 2, '2024-09-01'),
(19, 'Enrique', 'Ríos Mendoza', 'enrique.rios@email.com', '2006-05-16', 4, 2, '2024-09-01'),
(20, 'Patricia', 'Medina Quintero', 'patricia.medina@email.com', '2006-10-01', 4, 2, '2024-09-01');

INSERT INTO profesor VALUES
(1, 'Manuel', 'Pérez García', 'manuel.perez@instituto.com', 'Sistemas Operativos', 'P001234'),
(2, 'Teresa', 'Rodríguez López', 'teresa.rodriguez@instituto.com', 'Redes', 'P001235'),
(3, 'Francisco', 'Martínez Sánchez', 'francisco.martinez@instituto.com', 'Seguridad Informática', 'P001236'),
(4, 'Carmen', 'García Jiménez', 'carmen.garcia@instituto.com', 'Programación Web', 'P001237'),
(5, 'Antonio', 'López Moreno', 'antonio.lopez@instituto.com', 'Bases de Datos', 'P001238'),
(6, 'Beatriz', 'Fernández Torres', 'beatriz.fernandez@instituto.com', 'Programación Java', 'P001239'),
(7, 'José', 'Sánchez Ruiz', 'jose.sanchez@instituto.com', 'Arquitectura Software', 'P001240'),
(8, 'Rosario', 'González Díaz', 'rosario.gonzalez@instituto.com', 'Desarrollo Móvil', 'P001241'),
(9, 'Javier', 'Jiménez García', 'javier.jimenez@instituto.com', 'Gestión Proyectos', 'P001242'),
(10, 'María', 'Flores Cabrera', 'maria.flores@instituto.com', 'Inglés Técnico', 'P001243');

INSERT INTO modulo VALUES
(1, 'Sistemas Operativos Monousuario', 'SOM', 150, 1, 1, 1),
(2, 'Redes Locales', 'RLI', 150, 1, 1, 2),
(3, 'Seguridad Informática', 'SEI', 100, 1, 1, 3),
(4, 'Servicios de Red e Internet', 'SRI', 180, 2, 1, 2),
(5, 'Administración de Sistemas Gestores de Bases de Datos', 'ASG', 130, 2, 1, 5),
(6, 'Programación Web', 'DWC', 160, 1, 2, 4),
(7, 'Bases de Datos', 'BD', 150, 1, 2, 5),
(8, 'Desarrollo Web en Servidor', 'DWS', 180, 2, 2, 4),
(9, 'Despliegue de Aplicaciones Web', 'DAW', 100, 2, 2, 3),
(10, 'Programación Orientada a Objetos', 'POO', 150, 1, 3, 6),
(11, 'Bases de Datos Objeto-Relacionales', 'DBOR', 140, 1, 3, 5),
(12, 'Acceso a Datos', 'AD', 160, 2, 3, 6),
(13, 'Desarrollo de Interfaces', 'DI', 130, 2, 3, 8),
(14, 'Montaje y Mantenimiento de Equipos', 'MME', 120, 1, 4, 1),
(15, 'Infraestructura de Redes', 'IRS', 140, 2, 4, 2);

INSERT INTO matricula VALUES
(1, 1, 1, '2023-24', '2023-09-01'),
(2, 1, 2, '2023-24', '2023-09-01'),
(3, 1, 3, '2023-24', '2023-09-01'),
(4, 2, 1, '2023-24', '2023-09-01'),
(5, 2, 2, '2023-24', '2023-09-01'),
(6, 2, 3, '2023-24', '2023-09-01'),
(7, 3, 1, '2023-24', '2023-09-01'),
(8, 3, 2, '2023-24', '2023-09-01'),
(9, 3, 3, '2023-24', '2023-09-01'),
(10, 4, 6, '2023-24', '2023-09-01'),
(11, 4, 7, '2023-24', '2023-09-01'),
(12, 5, 6, '2023-24', '2023-09-01'),
(13, 5, 7, '2023-24', '2023-09-01'),
(14, 6, 6, '2023-24', '2023-09-01'),
(15, 6, 7, '2023-24', '2023-09-01'),
(16, 7, 10, '2023-24', '2023-09-01'),
(17, 7, 11, '2023-24', '2023-09-01'),
(18, 8, 10, '2023-24', '2023-09-01'),
(19, 8, 11, '2023-24', '2023-09-01'),
(20, 9, 10, '2023-24', '2023-09-01'),
(21, 9, 11, '2023-24', '2023-09-01'),
(22, 10, 14, '2023-24', '2023-09-01'),
(23, 10, 15, '2023-24', '2023-09-01'),
(24, 11, 14, '2023-24', '2023-09-01'),
(25, 11, 15, '2023-24', '2023-09-01'),
(26, 12, 14, '2023-24', '2023-09-01'),
(27, 12, 15, '2023-24', '2023-09-01'),
(28, 1, 4, '2024-25', '2024-09-01'),
(29, 1, 5, '2024-25', '2024-09-01'),
(30, 2, 4, '2024-25', '2024-09-01'),
(31, 2, 5, '2024-25', '2024-09-01'),
(32, 3, 4, '2024-25', '2024-09-01'),
(33, 3, 5, '2024-25', '2024-09-01'),
(34, 4, 8, '2024-25', '2024-09-01'),
(35, 4, 9, '2024-25', '2024-09-01'),
(36, 5, 8, '2024-25', '2024-09-01'),
(37, 5, 9, '2024-25', '2024-09-01'),
(38, 6, 8, '2024-25', '2024-09-01'),
(39, 6, 9, '2024-25', '2024-09-01'),
(40, 7, 12, '2024-25', '2024-09-01'),
(41, 7, 13, '2024-25', '2024-09-01'),
(42, 8, 12, '2024-25', '2024-09-01'),
(43, 8, 13, '2024-25', '2024-09-01'),
(44, 9, 12, '2024-25', '2024-09-01'),
(45, 9, 13, '2024-25', '2024-09-01'),
(46, 10, 14, '2024-25', '2024-09-01'),
(47, 10, 15, '2024-25', '2024-09-01'),
(48, 11, 14, '2024-25', '2024-09-01'),
(49, 11, 15, '2024-25', '2024-09-01'),
(50, 12, 14, '2024-25', '2024-09-01');

INSERT INTO nota VALUES
(1, 1, 'ordinaria', 8.5, '2024-01-15'),
(2, 2, 'ordinaria', 7.2, '2024-01-15'),
(3, 3, 'ordinaria', 6.8, '2024-01-15'),
(4, 4, 'ordinaria', 9.1, '2024-01-15'),
(5, 5, 'ordinaria', 7.9, '2024-01-15'),
(6, 6, 'ordinaria', 5.2, '2024-02-10'),
(7, 7, 'ordinaria', 8.3, '2024-01-15'),
(8, 8, 'ordinaria', 6.5, '2024-01-15'),
(9, 9, 'ordinaria', 7.4, '2024-01-15'),
(10, 10, 'ordinaria', 8.9, '2024-02-20'),
(11, 11, 'ordinaria', 9.2, '2024-02-20'),
(12, 12, 'ordinaria', 7.1, '2024-02-20'),
(13, 13, 'ordinaria', 8.0, '2024-02-20'),
(14, 14, 'ordinaria', 6.7, '2024-02-20'),
(15, 15, 'ordinaria', 7.8, '2024-02-20'),
(16, 16, 'ordinaria', 8.4, '2024-03-10'),
(17, 17, 'ordinaria', 7.3, '2024-03-10'),
(18, 18, 'ordinaria', 8.8, '2024-03-10'),
(19, 19, 'ordinaria', 4.9, '2024-03-20'),
(20, 20, 'ordinaria', 5.5, '2024-03-20'),
(21, 21, 'ordinaria', 8.1, '2024-03-20'),
(22, 22, 'ordinaria', 9.0, '2024-04-05'),
(23, 23, 'ordinaria', 7.6, '2024-04-05'),
(24, 24, 'ordinaria', 6.9, '2024-04-05'),
(25, 25, 'ordinaria', 7.2, '2024-04-05'),
(26, 26, 'ordinaria', 8.5, '2024-04-05'),
(27, 27, 'ordinaria', 8.7, '2024-04-05'),
(28, 19, 'extraordinaria', 5.0, '2024-06-15'),
(29, 20, 'extraordinaria', 6.2, '2024-06-15');
"""

# ──────────────────────────────────────────────────────────────
# DATASET 2: HOSPITAL (Base de datos sanitaria)
# ──────────────────────────────────────────────────────────────

HOSPITAL_SCHEMA = """
CREATE TABLE IF NOT EXISTS paciente (
    id              INTEGER PRIMARY KEY,
    nombre          TEXT    NOT NULL,
    apellidos       TEXT    NOT NULL,
    dni             TEXT    NOT NULL,
    fecha_nacimiento TEXT,
    ciudad          TEXT,
    telefono        TEXT
);

CREATE TABLE IF NOT EXISTS medico (
    id              INTEGER PRIMARY KEY,
    nombre          TEXT    NOT NULL,
    apellidos       TEXT    NOT NULL,
    especialidad    TEXT,
    num_colegiado   TEXT,
    telefono_despacho TEXT
);

CREATE TABLE IF NOT EXISTS consulta (
    id              INTEGER PRIMARY KEY,
    paciente_id     INTEGER REFERENCES paciente(id),
    medico_id       INTEGER REFERENCES medico(id),
    fecha           TEXT,
    motivo          TEXT,
    diagnostico     TEXT,
    precio          REAL
);

CREATE TABLE IF NOT EXISTS medicamento (
    id              INTEGER PRIMARY KEY,
    nombre          TEXT    NOT NULL,
    principio_activo TEXT,
    laboratorio     TEXT,
    precio_unidad   REAL
);

CREATE TABLE IF NOT EXISTS prescripcion (
    id              INTEGER PRIMARY KEY,
    consulta_id     INTEGER REFERENCES consulta(id),
    medicamento_id  INTEGER REFERENCES medicamento(id),
    dosis           TEXT,
    duracion_dias   INTEGER
);
"""

HOSPITAL_SEED = """
INSERT INTO paciente VALUES
(1, 'Jorge', 'Sánchez Ruiz', '12345678A', '1945-06-15', 'Madrid', '91-555-0001'),
(2, 'Amparo', 'García López', '23456789B', '1962-03-22', 'Madrid', '91-555-0002'),
(3, 'Vicente', 'Martínez Torres', '34567890C', '1971-07-10', 'Barcelona', '93-666-0003'),
(4, 'Dolores', 'Rodríguez Pérez', '45678901D', '1958-05-28', 'Valencia', '96-777-0004'),
(5, 'Ramón', 'Jiménez García', '56789012E', '1966-11-14', 'Sevilla', '95-888-0005'),
(6, 'Rosa', 'González Moreno', '67890123F', '1952-02-03', 'Bilbao', '94-999-0006'),
(7, 'Pablo', 'Fernández Díaz', '78901234G', '1975-08-19', 'Madrid', '91-555-0007'),
(8, 'Josefina', 'López Sánchez', '89012345H', '1955-04-27', 'Barcelona', '93-666-0008'),
(9, 'Fernando', 'Castillo Navarro', '90123456I', '1968-09-05', 'Madrid', '91-555-0009'),
(10, 'Margarita', 'Molina Flores', '01234567J', '1960-01-12', 'Valencia', '96-777-0010'),
(11, 'Ángel', 'Romero Iglesias', '11234567K', '1973-10-20', 'Sevilla', '95-888-0011'),
(12, 'Francisca', 'Vega Campos', '22234567L', '1959-06-07', 'Bilbao', '94-999-0012'),
(13, 'Miguel Ángel', 'Serrano Medina', '33234567M', '1948-03-25', 'Madrid', '91-555-0013'),
(14, 'Concepción', 'Domínguez Ruiz', '44234567N', '1961-12-08', 'Barcelona', '93-666-0014'),
(15, 'Julio', 'Cortes Baeza', '55234567O', '1970-05-16', 'Valencia', '96-777-0015'),
(16, 'Teresa', 'Herrera Gómez', '66234567P', '1957-07-30', 'Sevilla', '95-888-0016'),
(17, 'Eduardo', 'Montoya García', '77234567Q', '1964-02-11', 'Bilbao', '94-999-0017'),
(18, 'Esperanza', 'Quintero López', '88234567R', '1956-08-23', 'Madrid', '91-555-0018'),
(19, 'Arturo', 'Valenzuela Soto', '99234567S', '1969-04-09', 'Barcelona', '93-666-0019'),
(20, 'Matilde', 'Rojas Delgado', '10234567T', '1953-11-14', 'Valencia', '96-777-0020');

INSERT INTO medico VALUES
(1, 'Carlos', 'Estrada Moreno', 'Cardiología', 'MC001234', '91-555-1001'),
(2, 'Elena', 'Gómez Fernández', 'Medicina Interna', 'MC001235', '91-555-1002'),
(3, 'Luis', 'Ramírez González', 'Neumología', 'MC001236', '93-666-1003'),
(4, 'Susana', 'Vásquez Torres', 'Endocrinología', 'MC001237', '96-777-1004'),
(5, 'Roberto', 'Castillo Ruiz', 'Digestivo', 'MC001238', '95-888-1005'),
(6, 'Marta', 'Ponce García', 'Neurología', 'MC001239', '94-999-1006'),
(7, 'Javier', 'Flores López', 'Traumatología', 'MC001240', '91-555-1007'),
(8, 'Silvia', 'Navarro Díaz', 'Dermatología', 'MC001241', '93-666-1008'),
(9, 'Andrés', 'Soto Jiménez', 'Oftalmología', 'MC001242', '96-777-1009'),
(10, 'Verónica', 'Iglesias Rodríguez', 'Otorrinolaringología', 'MC001243', '95-888-1010');

INSERT INTO consulta VALUES
(1, 1, 1, '2024-01-10', 'Dolor pectoral', 'Angina de pecho estable', 150.00),
(2, 2, 2, '2024-01-12', 'Fiebre persistente', 'Infección viral inespecífica', 80.00),
(3, 3, 3, '2024-01-15', 'Tos con flemas', 'Bronquitis aguda', 90.00),
(4, 4, 4, '2024-01-18', 'Polaquiuria y polidipsia', 'Diabetes mellitus tipo 2', 100.00),
(5, 5, 5, '2024-01-20', 'Reflujo gastroesofágico', 'ERGE leve', 85.00),
(6, 6, 6, '2024-01-22', 'Cefalea recurrente', 'Migraña sin aura', 95.00),
(7, 7, 7, '2024-01-25', 'Dolor de rodilla', 'Artrosis de rodilla grado 2', 110.00),
(8, 8, 8, '2024-01-28', 'Erupciones en la piel', 'Dermatitis atópica', 75.00),
(9, 9, 9, '2024-02-01', 'Visión borrosa', 'Miopía progresiva', 120.00),
(10, 10, 10, '2024-02-03', 'Pérdida de audición', 'Presbiacusia', 100.00),
(11, 1, 1, '2024-02-10', 'Revisión cardíaca', 'Hipertensión bien controlada', 140.00),
(12, 3, 3, '2024-02-12', 'Disnea leve', 'EPOC en remisión', 110.00),
(13, 5, 5, '2024-02-15', 'Dolor epigástrico', 'Gastritis crónica', 90.00),
(14, 7, 7, '2024-02-18', 'Esguince de tobillo', 'Esguince de tobillo grado 1', 105.00),
(15, 2, 2, '2024-02-20', 'Control general', 'Sin hallazgos relevantes', 70.00),
(16, 4, 4, '2024-02-25', 'Control glucosa', 'Diabetes controlada', 95.00),
(17, 6, 6, '2024-03-01', 'Mareos y vértigo', 'Vértigo posicional paroxístico', 125.00),
(18, 8, 8, '2024-03-05', 'Picazón generalizada', 'Urticaria aguda', 80.00),
(19, 9, 9, '2024-03-10', 'Catarata incipiente', 'Catarata nuclear incipiente', 150.00),
(20, 11, 1, '2024-03-15', 'Palpitaciones', 'Extrasístoles ventriculares', 140.00),
(21, 12, 2, '2024-03-18', 'Cansancio extremo', 'Anemia ferropénica leve', 85.00),
(22, 13, 3, '2024-03-20', 'Tos persistente', 'Tosferina', 100.00),
(23, 14, 4, '2024-03-22', 'Fatiga y debilidad', 'Hipotiroidismo primario', 110.00),
(24, 15, 5, '2024-03-25', 'Náuseas matutinas', 'Dispepsia funcional', 88.00),
(25, 16, 6, '2024-03-28', 'Temblores', 'Temblor esencial leve', 115.00),
(26, 17, 7, '2024-04-01', 'Lumbago', 'Lumbalgia inespecífica', 95.00),
(27, 18, 8, '2024-04-05', 'Sequedad cutánea', 'Xerodermia', 75.00),
(28, 19, 9, '2024-04-10', 'Ojo seco', 'Síndrome de ojo seco', 85.00),
(29, 20, 10, '2024-04-12', 'Acúfenos', 'Acúfenos subjetivos', 95.00),
(30, 10, 1, '2024-04-15', 'Segunda revisión cardíaca', 'Presión arterial elevada', 145.00);

INSERT INTO medicamento VALUES
(1, 'Atorvastatina', 'Atorvastatina cálcica', 'Sandoz', 2.50),
(2, 'Metformina', 'Clorhidrato de metformina', 'Actavis', 1.80),
(3, 'Lisinopril', 'Lisinopril dihidratado', 'Cinfa', 3.20),
(4, 'Omeprazol', 'Omeprazol magnésico', 'Normon', 2.10),
(5, 'Amoxicilina', 'Amoxicilina trihydrato', 'Almirall', 4.50),
(6, 'Fluoxetina', 'Fluoxetina clorhidrato', 'Alter', 5.20),
(7, 'Ibuprofeno', 'Ibuprofeno base', 'Bayer', 1.50),
(8, 'Loratadina', 'Loratadina base', 'Kern', 2.80),
(9, 'Salbutamol', 'Salbutamol sulfato', 'Faes Farma', 3.90),
(10, 'Insulina NPH', 'Insulina isófana', 'Novo Nordisk', 28.50),
(11, 'Levotiroxina', 'Levotiroxina sódica', 'Merck', 3.40),
(12, 'Furosemida', 'Furosemida base', 'Sintética', 2.20),
(13, 'Enalapril', 'Enalapril maleato', 'EBEWE', 3.80),
(14, 'Paracetamol', 'Paracetamol base', 'Tafirol', 1.20),
(15, 'Clopidogrel', 'Clopidogrel bisulfato', 'Krka', 6.70);

INSERT INTO prescripcion VALUES
(1, 1, 1, '40mg', 90),
(2, 1, 3, '10mg', 90),
(3, 2, 5, '500mg', 7),
(4, 3, 5, '500mg', 10),
(5, 3, 9, '100mcg', 14),
(6, 4, 2, '850mg', 180),
(7, 4, 11, '50mcg', 180),
(8, 5, 4, '20mg', 30),
(9, 6, 6, '20mg', 90),
(10, 6, 14, '500mg', 20),
(11, 7, 7, '400mg', 14),
(12, 8, 8, '10mg', 30),
(13, 10, 14, '500mg', 30),
(14, 11, 1, '40mg', 90),
(15, 11, 15, '75mg', 90),
(16, 12, 9, '100mcg', 14),
(17, 13, 4, '20mg', 30),
(18, 14, 7, '400mg', 14),
(19, 15, 14, '500mg', 7),
(20, 16, 2, '850mg', 180),
(21, 17, 6, '25mg', 90),
(22, 18, 8, '10mg', 30),
(23, 19, 14, '500mg', 20),
(24, 20, 3, '10mg', 90),
(25, 21, 12, '40mg', 30),
(26, 22, 5, '500mg', 10),
(27, 23, 11, '50mcg', 180),
(28, 24, 4, '20mg', 30),
(29, 25, 6, '20mg', 90),
(30, 26, 7, '400mg', 14);
"""

# ──────────────────────────────────────────────────────────────
# DATASET 3: RED SOCIAL (Base de datos de una red social)
# ──────────────────────────────────────────────────────────────

RED_SOCIAL_SCHEMA = """
CREATE TABLE IF NOT EXISTS usuario (
    id              INTEGER PRIMARY KEY,
    username        TEXT    NOT NULL,
    email           TEXT    NOT NULL,
    fecha_registro  TEXT,
    ciudad          TEXT,
    bio             TEXT,
    activo          INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS post (
    id              INTEGER PRIMARY KEY,
    usuario_id      INTEGER REFERENCES usuario(id),
    contenido       TEXT    NOT NULL,
    fecha_publicacion TEXT,
    likes_count     INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comentario (
    id              INTEGER PRIMARY KEY,
    post_id         INTEGER REFERENCES post(id),
    usuario_id      INTEGER REFERENCES usuario(id),
    contenido       TEXT    NOT NULL,
    fecha           TEXT
);

CREATE TABLE IF NOT EXISTS like_post (
    id              INTEGER PRIMARY KEY,
    post_id         INTEGER REFERENCES post(id),
    usuario_id      INTEGER REFERENCES usuario(id),
    fecha           TEXT
);

CREATE TABLE IF NOT EXISTS follower (
    id              INTEGER PRIMARY KEY,
    seguidor_id     INTEGER REFERENCES usuario(id),
    seguido_id      INTEGER REFERENCES usuario(id),
    fecha           TEXT
);
"""

RED_SOCIAL_SEED = """
INSERT INTO usuario VALUES
(1, 'alejandro_tech', 'alex@email.com', '2023-01-10', 'Madrid', 'Desarrollador Full Stack | Amante del café y la programación', 1),
(2, 'maria_design', 'maria@email.com', '2023-02-15', 'Barcelona', 'Diseñadora Gráfica | Creatividad sin límites', 1),
(3, 'carlos_viajero', 'carlos@email.com', '2023-03-05', 'Valencia', 'Fotógrafo de viajes | El mundo es mi galería', 1),
(4, 'sofia_fitness', 'sofia@email.com', '2023-04-20', 'Bilbao', 'Personal Trainer | Transformando vidas a través del deporte', 1),
(5, 'juan_gamer', 'juan@email.com', '2023-05-12', 'Madrid', 'Streamer | Jugador competitivo de FPS', 1),
(6, 'laura_cook', 'laura@email.com', '2023-06-08', 'Sevilla', 'Chef | Recetas tradicionales con toque moderno', 1),
(7, 'diego_music', 'diego@email.com', '2023-07-19', 'Barcelona', 'Productor Musical | Beats que hacen historia', 1),
(8, 'ana_escritora', 'ana@email.com', '2023-08-03', 'Madrid', 'Autora | Historias que atrapan', 1),
(9, 'pedro_fotografo', 'pedro@email.com', '2023-09-14', 'Valencia', 'Fotógrafo profesional | Cada momento es especial', 1),
(10, 'rosa_artista', 'rosa@email.com', '2023-10-22', 'Barcelona', 'Artista plástica | Colores, formas, emociones', 1),
(11, 'luis_startups', 'luis@email.com', '2023-11-05', 'Madrid', 'Emprendedor | Construyendo el futuro', 1),
(12, 'emma_nature', 'emma@email.com', '2023-12-10', 'Bilbao', 'Bióloga marina | Defensora del océano', 1),
(13, 'victor_deporte', 'victor@email.com', '2024-01-18', 'Sevilla', 'Entrenador de fútbol | Pasión por el balón', 1),
(14, 'marta_psico', 'marta@email.com', '2024-02-07', 'Madrid', 'Psicóloga | Salud mental es lo primero', 1),
(15, 'daniel_tech', 'daniel@email.com', '2024-03-15', 'Barcelona', 'Ingeniero informático | IoT y Cloud', 1),
(16, 'clara_belleza', 'clara@email.com', '2024-04-20', 'Valencia', 'Maquilladora profesional | Belleza natural', 1),
(17, 'raul_viajero', 'raul@email.com', '2024-05-12', 'Madrid', 'Mochilero | Descubriendo el mundo', 1),
(18, 'natalia_moda', 'natalia@email.com', '2024-06-08', 'Barcelona', 'Fashionista | Tendencias y estilo', 1),
(19, 'sergio_cine', 'sergio@email.com', '2024-07-25', 'Sevilla', 'Crítico de cine | La magia del séptimo arte', 1),
(20, 'isabel_negocios', 'isabel@email.com', '2024-08-14', 'Bilbao', 'Empresaria | Liderando el cambio', 1);

INSERT INTO post VALUES
(1, 1, 'Acabo de terminar un proyecto React increíble. El rendimiento mejoró un 40% con hooks personalizados. #React #Desarrollo', '2024-01-10 10:30:00', 45),
(2, 2, 'Nueva paleta de colores para el proyecto de verano. ¿Qué os parece? Feedback bienvenido 🎨 #Diseño', '2024-01-11 14:15:00', 32),
(3, 3, 'Puesta de sol en Marruecos. Estos momentos son los que hacen que viaje. #Viajes #Fotografía', '2024-01-12 19:45:00', 78),
(4, 4, 'Entrenamiento de pierna de 90 minutos. El dolor es debilidad dejando el cuerpo! 💪 #Fitness', '2024-01-13 08:00:00', 23),
(5, 5, 'Competencia online tonight! Transmisión a las 21:00. Voy a por todo! #Gaming #Twitch', '2024-01-14 17:30:00', 56),
(6, 6, 'Receta nuevita: Gazpachuelo andaluz con gamba roja. Tradición en cada cucharada. #Cocina', '2024-01-15 12:00:00', 67),
(7, 7, 'Beat nuevo en el horno. Esta pieza va a ser FUEGO. Escucha preview en mis historias 🔥 #Música', '2024-01-16 16:20:00', 41),
(8, 8, 'Acabo de publicar el capítulo 5 de mi novela. El giro inesperado que todos esperabais. Gracias a vosotros! 📖 #Escritura', '2024-01-17 11:00:00', 89),
(9, 9, 'Sesión de fotos en la playa al atardecer. Cliente muy contento con los resultados. #Fotografía #Profesional', '2024-01-18 20:15:00', 52),
(10, 10, 'Cuadro nuevo en la galería. Técnica mixta, 150x200cm. Tiempo de reflexionar sobre la impermanencia. #Arte', '2024-01-19 15:45:00', 38),
(11, 11, 'Nuestra startup acaba de cerrar una ronda de inversión de 500k. Comienza la etapa 2! 🚀 #Startups', '2024-01-20 09:30:00', 124),
(12, 12, 'Estudio publicado hoy sobre coral en aguas profundas. Datos esperanzadores sobre recuperación. #Medio Ambiente', '2024-01-21 13:00:00', 95),
(13, 13, 'Equipo campeón de tercera regional! Orgullo de trabajar con jugadores así. #Fútbol', '2024-01-22 22:10:00', 71),
(14, 14, 'Taller de inteligencia emocional en consulta. Es increíble cómo transforman las herramientas mentales vidas. #Psicología', '2024-01-23 10:00:00', 48),
(15, 15, 'Implementando edge computing en nuestra infraestructura. Latencia reducida 60%. #Tech #Cloud', '2024-01-24 14:30:00', 63),
(16, 16, 'Tutorial de makeup natural para ojos oscuros. Vídeo subido a YouTube! #Belleza', '2024-01-25 11:20:00', 76),
(17, 17, 'Bangkok es sencillamente mágica. 8 días en paraíso, 30 kilos de fotos. #Viajes', '2024-01-26 18:45:00', 82),
(18, 18, 'Colección primavera lista. Mezcla perfecta de sostenibilidad y moda. #Fashion', '2024-01-27 12:30:00', 91),
(19, 19, 'Reseña de Oppenheimer: obra maestra cinematográfica. Nolan sigue siendo el rey. #Cine', '2024-01-28 21:00:00', 57),
(20, 20, 'Mujer emprendedora del año. Honor recibir este reconocimiento. Gracias al equipo! 👏 #Negocios', '2024-01-29 16:15:00', 112),
(21, 1, 'Testing automático con Jest y React Testing Library. Cobertura del 95%. Best practices! #Testing', '2024-01-30 09:00:00', 34),
(22, 3, 'Templo en la jungla de Camboya. Arquitectura milenaria. #Arqueología #Viajes', '2024-01-31 13:20:00', 73),
(23, 4, 'Nutrición es el 70% del éxito. Nueva calculadora calórica en mi bio. #Salud', '2024-02-01 07:30:00', 44),
(24, 6, 'Caldo de cocido madrileño, hecho como en casa de abuela. #TradicionalConEstilo', '2024-02-02 14:00:00', 58),
(25, 8, 'Capítulo 6 online! Tensión máxima. No podeis imaginaros lo que viene. #Novela', '2024-02-03 19:30:00', 85),
(26, 10, 'Exposición colectiva en galería Reina Sofía. Muy agradecida de participar. #Reconocimiento', '2024-02-04 11:45:00', 42),
(27, 2, 'Rediseño completo de marca para cliente Fortune 500. Resultado espectacular. #DesignWorks', '2024-02-05 10:15:00', 68),
(28, 5, 'Torneo de LoL el fin de semana. Grupo fuerte, ganaremos todo. #CompetitivoGaming', '2024-02-06 20:30:00', 39),
(29, 7, 'Album en proceso. 8 tracks ya mezclados. Sale en abril! 🎵 #MusicalRelease', '2024-02-07 17:00:00', 74),
(30, 12, 'Investigación marina en el Mediterráneo. Datos cruciales para política medioambiental. #Ciencia', '2024-02-08 15:20:00', 81),
(31, 14, 'Podcast nuevo: Conversaciones sobre ansiedad y manejo del estrés. Disponible ya! #MentalHealth', '2024-02-09 12:45:00', 47),
(32, 11, 'Evento de networking para startups tech. 200+ asistentes. Conectando el futuro. #Emprendimiento', '2024-02-10 09:30:00', 53),
(33, 16, 'Antes y después de sesión de makeup artístico. Transformación total! #MakeupArtist', '2024-02-11 13:00:00', 96),
(34, 19, 'Análisis profundo de Killers of the Flower Moon. Scorsese en su mejor momento. #Crítica', '2024-02-12 20:00:00', 61),
(35, 18, 'Desfile de moda sostenible. Algodón orgánico, tintas naturales. El futuro de la moda. #EcoFashion', '2024-02-13 18:30:00', 103),
(36, 20, 'Mentoreo a mujeres emprendedoras. Transmitiendo conocimiento. #Liderazgo', '2024-02-14 14:15:00', 55),
(37, 9, 'Reportaje fotográfico de patrimonio histórico. Restauración de iglesia medieval. #Reportaje', '2024-02-15 11:30:00', 64),
(38, 4, 'Clase magistral de crossfit. 30 participantes. Energía pura en la sala! #CrossFitComunity', '2024-02-16 06:45:00', 29),
(39, 6, 'Menu degustación especial San Valentín. Afrodisíacos en cada plato 💕 #GastronomíaRomántica', '2024-02-17 19:00:00', 79),
(40, 2, 'Identidad visual para startup de biotech. Moderno, limpio, innovador. #BrandDesign', '2024-02-18 15:45:00', 46);

INSERT INTO comentario VALUES
(1, 1, 2, 'Tremendo trabajo! Esos hooks me gustaría aprenderlos', '2024-01-10 11:00:00'),
(2, 1, 5, 'React es lo mejor, definitivamente', '2024-01-10 11:30:00'),
(3, 2, 1, 'Esa paleta de azules es perfecta. Me encanta!', '2024-01-11 14:45:00'),
(4, 3, 7, 'Qué maravilla de foto! Yo quiero ir allí!', '2024-01-12 20:15:00'),
(5, 3, 11, 'Increíble captura. El color del atardecer es espectacular', '2024-01-12 20:45:00'),
(6, 4, 8, 'Eso es dedicación real! Yo mucho no aguanto', '2024-01-13 09:00:00'),
(7, 5, 3, 'Suerte en la competencia! Te lo curras', '2024-01-14 18:00:00'),
(8, 6, 4, 'Se ve delicioso! Tienes que enseñar la receta', '2024-01-15 13:00:00'),
(9, 7, 10, 'Muero por escuchar ese beat! Cuando sale?', '2024-01-16 17:00:00'),
(10, 8, 1, 'El giro final fue impresionante! No me lo esperaba', '2024-01-17 12:00:00'),
(11, 9, 6, 'Fotos profesionales de verdad. Excelente trabajo', '2024-01-18 21:00:00'),
(12, 10, 15, 'Obra maestra! Qué profundidad emocional', '2024-01-19 16:30:00'),
(13, 11, 14, 'Felicidades! Eso es un logro increíble', '2024-01-20 10:00:00'),
(14, 12, 9, 'Investigación importantísima. Hay esperanza! 🌍', '2024-01-21 14:00:00'),
(15, 13, 5, 'Qué equipo! Vosotros a por la segunda regional', '2024-01-22 23:00:00'),
(16, 14, 4, 'Super útil tu perspectiva. Gracias por compartir', '2024-01-23 11:00:00'),
(17, 15, 12, 'Edge computing es el futuro! Bien jugado', '2024-01-24 15:30:00'),
(18, 16, 19, 'Tutorial buenísimo! Lo voy a probar hoy', '2024-01-25 12:00:00'),
(19, 17, 2, 'Bangkok es mi sueño! Envidia positiva al 100%', '2024-01-26 19:00:00'),
(20, 18, 3, 'Sostenibilidad y moda, así es! Bravo!', '2024-01-27 13:00:00'),
(21, 19, 8, 'Oppenheimer es de otro nivel. Tu análisis es acertado', '2024-01-28 21:45:00'),
(22, 20, 14, 'Te lo merecías! Inspiración para todas', '2024-01-29 17:00:00'),
(23, 21, 11, 'Testing es el rey. Calidad antes que todo!', '2024-01-30 09:45:00'),
(24, 22, 13, 'Esos templos son bucólicos. Debo visitarlos', '2024-01-31 14:00:00'),
(25, 23, 19, 'Nutrición científica, lo que había que oír', '2024-02-01 08:15:00'),
(26, 25, 18, 'Tu novela es adictiva! Esperar es tortura', '2024-02-03 20:00:00'),
(27, 26, 5, 'Arte que toca el alma. Qué genio!', '2024-02-04 12:30:00'),
(28, 27, 7, 'Diseño de lujo! Ese cliente tuvo suerte', '2024-02-05 11:00:00'),
(29, 28, 16, 'Dedicación gamer! Vosotros ganáis seguro', '2024-02-06 21:00:00'),
(30, 29, 9, 'Abril no puede llegar más rápido! Ansío ese album', '2024-02-07 18:00:00'),
(31, 30, 2, 'Investigaciones así salvan el planeta. Respeto!', '2024-02-08 16:00:00'),
(32, 31, 6, 'Salud mental matters! Me suscribo ya', '2024-02-09 13:30:00'),
(33, 32, 15, 'Eventos así son cruciales para el ecosistema startup', '2024-02-10 10:15:00'),
(34, 33, 20, 'El makeup artístico es otro nivel. Talento puro!', '2024-02-11 14:00:00'),
(35, 34, 1, 'Análisis crítico impecable. Puro cine!', '2024-02-12 21:00:00'),
(36, 35, 11, 'Moda sostenible es el futuro. Apoyo total!', '2024-02-13 19:00:00'),
(37, 36, 13, 'Liderazgo femenino necesario en los negocios', '2024-02-14 15:00:00'),
(38, 37, 7, 'Fotografía de patrimonio que honra la historia', '2024-02-15 12:15:00'),
(39, 38, 6, 'CrossFit transforma vidas. Tu energía contagia!', '2024-02-16 08:00:00'),
(40, 39, 3, 'Menu de San Valentín se ve romántico y delicioso', '2024-02-17 20:00:00'),
(41, 40, 9, 'Branding impecable para startups tech. Excelente!', '2024-02-18 16:30:00'),
(42, 1, 12, 'Me anoto ese patrón de hooks. Muy útil!', '2024-02-19 10:00:00'),
(43, 8, 14, 'Lectores enganchados! Tu carrera crece a cada capítulo', '2024-02-20 20:15:00'),
(44, 11, 4, 'Inversores inteligentes reconocen buen producto. Suerte!', '2024-02-21 11:00:00'),
(45, 15, 8, 'Cloud que vuela! Innovation at its best', '2024-02-22 14:45:00'),
(46, 17, 18, 'Viajero profesional! Envidio tu vida', '2024-02-23 19:30:00'),
(47, 7, 2, 'Tu música suena profesional! Distribuidora ya?', '2024-02-24 18:00:00'),
(48, 10, 3, 'Arte contemporáneo que emociona. Que siga así!', '2024-02-25 12:00:00'),
(49, 12, 19, 'Oceanografía crucial. Tus datos importan real', '2024-02-26 16:20:00'),
(50, 20, 12, 'Emprenderismo con propósito. Ese es el camino!', '2024-02-27 15:45:00'),
(51, 9, 11, 'Fotografía que cuenta historias. Contratado!', '2024-02-28 10:30:00'),
(52, 14, 6, 'Podcast imprescindible. Ya me suscribí!', '2024-02-29 13:00:00'),
(53, 16, 8, 'Tu arte makeup es cine mismo. Bravo!', '2024-03-01 14:15:00'),
(54, 18, 1, 'Diseñadora con valores. Eso es ropa real', '2024-03-02 11:45:00'),
(55, 2, 5, 'Identidad que atrae. Buen branding!', '2024-03-03 16:30:00'),
(56, 4, 10, 'Fitness con pasión genuina. Se nota!', '2024-03-04 07:00:00'),
(57, 6, 17, 'Chef que entiende la tradición. Voy a tu restaurante!', '2024-03-05 19:30:00'),
(58, 3, 14, 'Fotógrafo viajero. La vida que todos queremos', '2024-03-06 20:00:00'),
(59, 19, 4, 'Crítica de cine certero. Voy a ver eso!', '2024-03-07 21:30:00'),
(60, 5, 20, 'Competencia de ese nivel merece respeto. Vamos!', '2024-03-08 19:00:00');

INSERT INTO like_post VALUES
(1, 1, 2, '2024-01-10 10:45:00'),
(2, 1, 5, '2024-01-10 11:15:00'),
(3, 1, 8, '2024-01-10 12:00:00'),
(4, 1, 11, '2024-01-10 13:30:00'),
(5, 1, 14, '2024-01-10 14:00:00'),
(6, 2, 1, '2024-01-11 14:30:00'),
(7, 2, 5, '2024-01-11 15:00:00'),
(8, 2, 9, '2024-01-11 15:45:00'),
(9, 3, 1, '2024-01-12 20:00:00'),
(10, 3, 4, '2024-01-12 20:30:00'),
(11, 3, 7, '2024-01-12 21:00:00'),
(12, 3, 10, '2024-01-12 21:30:00'),
(13, 4, 2, '2024-01-13 08:30:00'),
(14, 4, 6, '2024-01-13 09:00:00'),
(15, 4, 12, '2024-01-13 10:00:00'),
(16, 5, 1, '2024-01-14 18:00:00'),
(17, 5, 8, '2024-01-14 18:45:00'),
(18, 5, 13, '2024-01-14 19:30:00'),
(19, 6, 2, '2024-01-15 12:30:00'),
(20, 6, 4, '2024-01-15 13:15:00'),
(21, 6, 9, '2024-01-15 14:00:00'),
(22, 7, 3, '2024-01-16 17:00:00'),
(23, 7, 10, '2024-01-16 17:45:00'),
(24, 7, 15, '2024-01-16 18:30:00'),
(25, 8, 1, '2024-01-17 12:15:00'),
(26, 8, 5, '2024-01-17 13:00:00'),
(27, 8, 11, '2024-01-17 14:00:00'),
(28, 8, 14, '2024-01-17 15:00:00'),
(29, 9, 2, '2024-01-18 21:15:00'),
(30, 9, 6, '2024-01-18 22:00:00'),
(31, 9, 12, '2024-01-18 22:45:00'),
(32, 10, 1, '2024-01-19 17:00:00'),
(33, 10, 7, '2024-01-19 17:45:00'),
(34, 10, 13, '2024-01-19 18:30:00'),
(35, 11, 2, '2024-01-20 10:30:00'),
(36, 11, 5, '2024-01-20 11:15:00'),
(37, 11, 8, '2024-01-20 12:00:00'),
(38, 11, 14, '2024-01-20 13:00:00'),
(39, 11, 19, '2024-01-20 14:00:00'),
(40, 12, 1, '2024-01-21 14:30:00'),
(41, 12, 3, '2024-01-21 15:15:00'),
(42, 12, 9, '2024-01-21 16:00:00'),
(43, 13, 2, '2024-01-22 23:30:00'),
(44, 13, 5, '2024-01-23 00:15:00'),
(45, 13, 11, '2024-01-23 01:00:00'),
(46, 14, 1, '2024-01-23 11:30:00'),
(47, 14, 4, '2024-01-23 12:15:00'),
(48, 14, 8, '2024-01-23 13:00:00'),
(49, 15, 2, '2024-01-24 16:00:00'),
(50, 15, 12, '2024-01-24 16:45:00'),
(51, 15, 17, '2024-01-24 17:30:00'),
(52, 16, 1, '2024-01-25 12:30:00'),
(53, 16, 3, '2024-01-25 13:15:00'),
(54, 16, 19, '2024-01-25 14:00:00'),
(55, 17, 2, '2024-01-26 19:30:00'),
(56, 17, 5, '2024-01-26 20:15:00'),
(57, 17, 11, '2024-01-26 21:00:00'),
(58, 17, 18, '2024-01-26 21:45:00'),
(59, 18, 1, '2024-01-27 13:30:00'),
(60, 18, 3, '2024-01-27 14:15:00'),
(61, 18, 9, '2024-01-27 15:00:00'),
(62, 18, 14, '2024-01-27 16:00:00'),
(63, 19, 1, '2024-01-28 21:30:00'),
(64, 19, 8, '2024-01-28 22:15:00'),
(65, 19, 12, '2024-01-29 00:00:00'),
(66, 20, 2, '2024-01-29 17:30:00'),
(67, 20, 5, '2024-01-29 18:15:00'),
(68, 20, 11, '2024-01-29 19:00:00'),
(69, 20, 14, '2024-01-29 20:00:00'),
(70, 20, 19, '2024-01-29 21:00:00'),
(71, 21, 1, '2024-01-30 10:00:00'),
(72, 21, 11, '2024-01-30 10:45:00'),
(73, 22, 3, '2024-01-31 14:30:00'),
(74, 22, 7, '2024-01-31 15:15:00'),
(75, 22, 13, '2024-01-31 16:00:00'),
(76, 23, 2, '2024-02-01 08:45:00'),
(77, 23, 4, '2024-02-01 09:30:00'),
(78, 24, 6, '2024-02-02 14:30:00'),
(79, 24, 10, '2024-02-02 15:15:00'),
(80, 25, 1, '2024-02-03 20:30:00');

INSERT INTO follower VALUES
(1, 2, 1, '2023-02-15'),
(2, 3, 1, '2023-03-05'),
(3, 5, 1, '2023-05-12'),
(4, 8, 1, '2023-08-03'),
(5, 11, 1, '2023-11-05'),
(6, 1, 2, '2023-01-20'),
(7, 4, 2, '2023-04-20'),
(8, 7, 2, '2023-07-19'),
(9, 10, 2, '2023-10-22'),
(10, 14, 2, '2024-02-07'),
(11, 1, 3, '2023-01-10'),
(12, 6, 3, '2023-06-08'),
(13, 9, 3, '2023-09-14'),
(14, 13, 3, '2024-01-18'),
(15, 18, 3, '2024-06-08'),
(16, 2, 4, '2023-02-15'),
(17, 6, 4, '2023-06-08'),
(18, 11, 4, '2023-11-05'),
(19, 15, 4, '2024-03-15'),
(20, 1, 5, '2023-01-20'),
(21, 3, 5, '2023-03-15'),
(22, 7, 5, '2023-07-20'),
(23, 12, 5, '2023-12-15'),
(24, 2, 6, '2023-02-20'),
(25, 4, 6, '2023-04-25'),
(26, 8, 6, '2023-08-10'),
(27, 14, 6, '2024-02-10'),
(28, 1, 7, '2023-01-25'),
(29, 5, 7, '2023-05-15'),
(30, 9, 7, '2023-09-20'),
(31, 13, 7, '2024-01-25'),
(32, 19, 7, '2024-07-25'),
(33, 2, 8, '2023-02-25'),
(34, 6, 8, '2023-06-15'),
(35, 10, 8, '2023-10-25'),
(36, 14, 8, '2024-02-15'),
(37, 1, 9, '2023-01-30'),
(38, 4, 9, '2023-04-30'),
(39, 8, 9, '2023-08-20'),
(40, 12, 9, '2023-12-20'),
(41, 2, 10, '2023-03-05'),
(42, 5, 10, '2023-05-20'),
(43, 9, 10, '2023-09-25'),
(44, 13, 10, '2024-01-30'),
(45, 1, 11, '2023-02-05'),
(46, 3, 11, '2023-03-20'),
(47, 7, 11, '2023-07-25'),
(48, 15, 11, '2024-03-20'),
(49, 2, 12, '2023-03-10'),
(50, 6, 12, '2023-06-20'),
(51, 10, 12, '2023-10-30'),
(52, 12, 11, '2023-12-25'),
(53, 1, 13, '2023-02-10'),
(54, 5, 13, '2023-05-25'),
(55, 9, 13, '2023-09-30'),
(56, 2, 14, '2023-03-15'),
(57, 4, 14, '2023-05-05'),
(58, 8, 14, '2023-08-25'),
(59, 1, 15, '2023-02-15'),
(60, 7, 15, '2023-08-05');
"""

# ──────────────────────────────────────────────────────────────
# HELPER: calcular expected_result
# ──────────────────────────────────────────────────────────────

def compute_expected(schema: str, seed: str, solution_sql: str) -> str:
    conn = sqlite3.connect(":memory:")
    conn.executescript(schema)
    conn.executescript(seed)
    cursor = conn.execute(solution_sql)
    columns = [d[0] for d in cursor.description] if cursor.description else []
    rows = [list(r) for r in cursor.fetchall()]
    conn.close()
    return json.dumps({"columns": columns, "rows": rows})


# ──────────────────────────────────────────────────────────────
# DATASET 1 EXERCISES (Instituto)
# ──────────────────────────────────────────────────────────────

INSTITUTO_EXERCISES = [
    {
        "title": "Alumnos de ASIR ordenados por apellido",
        "category": "01 - Consultas Básicas",
        "order_num": 1,
        "difficulty": "basico",
        "description": "Obtén el nombre y apellidos de todos los alumnos del ciclo ASIR, ordenados alfabéticamente por apellido.",
        "solution_sql": "SELECT nombre, apellidos FROM alumno WHERE ciclo_id = 1 ORDER BY apellidos ASC;",
    },
    {
        "title": "Profesores por especialidad",
        "category": "01 - Consultas Básicas",
        "order_num": 2,
        "difficulty": "basico",
        "description": "Lista el nombre y la especialidad de todos los profesores.",
        "solution_sql": "SELECT nombre, apellidos, especialidad FROM profesor;",
    },
    {
        "title": "Módulos de primer curso",
        "category": "01 - Consultas Básicas",
        "order_num": 3,
        "difficulty": "basico",
        "description": "Muestra el nombre y código de todos los módulos de primer curso.",
        "solution_sql": "SELECT nombre, codigo FROM modulo WHERE curso = 1;",
    },
    {
        "title": "Alumnos menores de 20 años",
        "category": "02 - Filtros WHERE",
        "order_num": 4,
        "difficulty": "basico",
        "description": "Obtén nombre y fecha de nacimiento de alumnos nacidos después del 1 de enero de 2005.",
        "solution_sql": "SELECT nombre, apellidos, fecha_nacimiento FROM alumno WHERE fecha_nacimiento > '2005-01-01' ORDER BY fecha_nacimiento DESC;",
    },
    {
        "title": "Alumnos de ciclos específicos",
        "category": "02 - Filtros WHERE",
        "order_num": 5,
        "difficulty": "basico",
        "description": "Lista todos los alumnos que estudian DAW o DAM.",
        "solution_sql": "SELECT nombre, apellidos FROM alumno WHERE ciclo_id IN (2, 3);",
    },
    {
        "title": "Profesores de especialidades científicas",
        "category": "02 - Filtros WHERE",
        "order_num": 6,
        "difficulty": "basico",
        "description": "Obtén el nombre de todos los profesores cuya especialidad contenga 'Datos' o 'Seguridad'.",
        "solution_sql": "SELECT nombre, apellidos, especialidad FROM profesor WHERE especialidad LIKE '%Datos%' OR especialidad LIKE '%Seguridad%';",
    },
    {
        "title": "Módulos de larga duración",
        "category": "02 - Filtros WHERE",
        "order_num": 7,
        "difficulty": "basico",
        "description": "Muestra módulos con más de 130 horas lectivas.",
        "solution_sql": "SELECT nombre, codigo, horas FROM modulo WHERE horas > 130;",
    },
    {
        "title": "Media de notas por alumno",
        "category": "03 - Agregación",
        "order_num": 8,
        "difficulty": "intermedio",
        "description": "Calcula la calificación promedio de cada alumno en la convocatoria ordinaria.",
        "solution_sql": "SELECT a.nombre, a.apellidos, AVG(n.calificacion) as media FROM alumno a JOIN matricula m ON a.id = m.alumno_id JOIN nota n ON m.id = n.matricula_id WHERE n.convocatoria = 'ordinaria' GROUP BY a.id, a.nombre, a.apellidos ORDER BY media DESC;",
    },
    {
        "title": "Alumnos que han suspendido algún módulo",
        "category": "03 - Agregación",
        "order_num": 9,
        "difficulty": "intermedio",
        "description": "Obtén el nombre de alumnos con alguna calificación inferior a 5 en convocatoria ordinaria.",
        "solution_sql": "SELECT DISTINCT a.nombre, a.apellidos FROM alumno a JOIN matricula m ON a.id = m.alumno_id JOIN nota n ON m.id = n.matricula_id WHERE n.calificacion < 5 AND n.convocatoria = 'ordinaria';",
    },
    {
        "title": "Profesores con más de 2 módulos asignados",
        "category": "03 - Agregación",
        "order_num": 10,
        "difficulty": "intermedio",
        "description": "Encuentra profesores que imparten más de 2 módulos diferentes.",
        "solution_sql": "SELECT p.nombre, p.apellidos, COUNT(DISTINCT m.id) as num_modulos FROM profesor p JOIN modulo m ON p.id = m.profesor_id GROUP BY p.id HAVING COUNT(DISTINCT m.id) > 2;",
    },
    {
        "title": "Módulos sin alumnos matriculados",
        "category": "03 - Agregación",
        "order_num": 11,
        "difficulty": "intermedio",
        "description": "Lista módulos que no tienen ningún alumno matriculado.",
        "solution_sql": "SELECT m.id, m.nombre, m.codigo FROM modulo m LEFT JOIN matricula mat ON m.id = mat.modulo_id WHERE mat.id IS NULL;",
    },
    {
        "title": "Top 5 alumnos con mejor media",
        "category": "04 - Ranking y Límites",
        "order_num": 12,
        "difficulty": "intermedio",
        "description": "Muestra los 5 alumnos con mayor promedio de calificaciones en convocatoria ordinaria.",
        "solution_sql": "SELECT a.nombre, a.apellidos, AVG(n.calificacion) as media FROM alumno a JOIN matricula m ON a.id = m.alumno_id JOIN nota n ON m.id = n.matricula_id WHERE n.convocatoria = 'ordinaria' GROUP BY a.id ORDER BY media DESC LIMIT 5;",
    },
    {
        "title": "Alumnos con extraordinaria",
        "category": "04 - Ranking y Límites",
        "order_num": 13,
        "difficulty": "intermedio",
        "description": "Obtén nombre y calificaciones de alumnos que presentaron convocatoria extraordinaria.",
        "solution_sql": "SELECT DISTINCT a.nombre, a.apellidos FROM alumno a JOIN matricula m ON a.id = m.alumno_id JOIN nota n ON m.id = n.matricula_id WHERE n.convocatoria = 'extraordinaria' ORDER BY a.apellidos;",
    },
    {
        "title": "Matrícula por ciclo y año académico",
        "category": "04 - Ranking y Límites",
        "order_num": 14,
        "difficulty": "avanzado",
        "description": "Cuenta cuántos alumnos están matriculados en cada ciclo para cada año académico.",
        "solution_sql": "SELECT c.nombre, m.ano_academico, COUNT(DISTINCT m.alumno_id) as total_alumnos FROM ciclo c JOIN alumno a ON c.id = a.ciclo_id JOIN matricula m ON a.id = m.alumno_id GROUP BY c.id, m.ano_academico ORDER BY m.ano_academico, c.nombre;",
    },
    {
        "title": "Distribución de alumnos por ciclo",
        "category": "04 - Ranking y Límites",
        "order_num": 15,
        "difficulty": "avanzado",
        "description": "Muestra cuántos alumnos hay en cada ciclo formativo, ordenados por cantidad descendente.",
        "solution_sql": "SELECT c.nombre, COUNT(DISTINCT a.id) as total_alumnos FROM ciclo c LEFT JOIN alumno a ON c.id = a.ciclo_id GROUP BY c.id ORDER BY total_alumnos DESC;",
    },
]

# ──────────────────────────────────────────────────────────────
# DATASET 2 EXERCISES (Hospital)
# ──────────────────────────────────────────────────────────────

HOSPITAL_EXERCISES = [
    {
        "title": "Listado de pacientes por ciudad",
        "category": "01 - Consultas Básicas",
        "order_num": 1,
        "difficulty": "basico",
        "description": "Obtén nombre y apellidos de todos los pacientes ordenados por ciudad.",
        "solution_sql": "SELECT nombre, apellidos, ciudad FROM paciente ORDER BY ciudad, apellidos;",
    },
    {
        "title": "Médicos por especialidad",
        "category": "01 - Consultas Básicas",
        "order_num": 2,
        "difficulty": "basico",
        "description": "Lista el nombre y especialidad de todos los médicos.",
        "solution_sql": "SELECT nombre, apellidos, especialidad FROM medico ORDER BY especialidad;",
    },
    {
        "title": "Medicamentos ordenados por precio",
        "category": "01 - Consultas Básicas",
        "order_num": 3,
        "difficulty": "basico",
        "description": "Muestra el nombre y precio unitario de medicamentos, ordenados por precio descendente.",
        "solution_sql": "SELECT nombre, precio_unidad FROM medicamento ORDER BY precio_unidad DESC;",
    },
    {
        "title": "Consultas del mes de enero",
        "category": "02 - Filtros Temporales",
        "order_num": 4,
        "difficulty": "basico",
        "description": "Lista todas las consultas realizadas en enero de 2024.",
        "solution_sql": "SELECT fecha, paciente_id, medico_id, diagnostico FROM consulta WHERE fecha LIKE '2024-01%' ORDER BY fecha;",
    },
    {
        "title": "Pacientes con más de una consulta",
        "category": "02 - Filtros Temporales",
        "order_num": 5,
        "difficulty": "intermedio",
        "description": "Obtén nombre de pacientes que han tenido más de una consulta en el hospital.",
        "solution_sql": "SELECT p.nombre, p.apellidos, COUNT(c.id) as num_consultas FROM paciente p JOIN consulta c ON p.id = c.paciente_id GROUP BY p.id HAVING COUNT(c.id) > 1 ORDER BY num_consultas DESC;",
    },
    {
        "title": "Coste total por especialidad médica",
        "category": "03 - Cálculos Agregados",
        "order_num": 6,
        "difficulty": "intermedio",
        "description": "Calcula el coste total de consultas agrupado por especialidad del médico.",
        "solution_sql": "SELECT m.especialidad, SUM(c.precio) as coste_total FROM medico m JOIN consulta c ON m.id = c.medico_id GROUP BY m.especialidad ORDER BY coste_total DESC;",
    },
    {
        "title": "Medicamentos más recetados",
        "category": "03 - Cálculos Agregados",
        "order_num": 7,
        "difficulty": "intermedio",
        "description": "Lista los 5 medicamentos más recetados (más prescripciones).",
        "solution_sql": "SELECT med.nombre, COUNT(p.id) as veces_recetado FROM medicamento med JOIN prescripcion p ON med.id = p.medicamento_id GROUP BY med.id ORDER BY veces_recetado DESC LIMIT 5;",
    },
    {
        "title": "Médicos sin consultas registradas",
        "category": "03 - Cálculos Agregados",
        "order_num": 8,
        "difficulty": "intermedio",
        "description": "Encuentra médicos que no tienen ninguna consulta registrada en la base de datos.",
        "solution_sql": "SELECT m.nombre, m.apellidos, m.especialidad FROM medico m LEFT JOIN consulta c ON m.id = c.medico_id WHERE c.id IS NULL;",
    },
    {
        "title": "Consultas por médico y especialidad",
        "category": "03 - Cálculos Agregados",
        "order_num": 9,
        "difficulty": "intermedio",
        "description": "Muestra cuántas consultas ha realizado cada médico, junto con su especialidad.",
        "solution_sql": "SELECT m.nombre, m.apellidos, m.especialidad, COUNT(c.id) as num_consultas FROM medico m LEFT JOIN consulta c ON m.id = c.medico_id GROUP BY m.id ORDER BY num_consultas DESC;",
    },
    {
        "title": "Coste promedio de consulta por especialidad",
        "category": "04 - Análisis Avanzado",
        "order_num": 10,
        "difficulty": "avanzado",
        "description": "Calcula el coste promedio de las consultas para cada especialidad médica.",
        "solution_sql": "SELECT m.especialidad, AVG(c.precio) as coste_promedio, COUNT(c.id) as total_consultas FROM medico m JOIN consulta c ON m.id = c.medico_id GROUP BY m.especialidad ORDER BY coste_promedio DESC;",
    },
    {
        "title": "Pacientes de Madrid con diagnósticos",
        "category": "04 - Análisis Avanzado",
        "order_num": 11,
        "difficulty": "intermedio",
        "description": "Lista nombre y diagnósticos de pacientes de Madrid.",
        "solution_sql": "SELECT p.nombre, p.apellidos, c.diagnostico, c.fecha FROM paciente p JOIN consulta c ON p.id = c.paciente_id WHERE p.ciudad = 'Madrid' ORDER BY c.fecha DESC;",
    },
    {
        "title": "Top 3 pacientes por gasto en consultas",
        "category": "04 - Análisis Avanzado",
        "order_num": 12,
        "difficulty": "avanzado",
        "description": "Muestra los 3 pacientes que más han gastado en consultas médicas.",
        "solution_sql": "SELECT p.nombre, p.apellidos, SUM(c.precio) as gasto_total FROM paciente p JOIN consulta c ON p.id = c.paciente_id GROUP BY p.id ORDER BY gasto_total DESC LIMIT 3;",
    },
    {
        "title": "Medicamentos sin prescripción",
        "category": "04 - Análisis Avanzado",
        "order_num": 13,
        "difficulty": "intermedio",
        "description": "Encuentra medicamentos que nunca han sido prescritos.",
        "solution_sql": "SELECT m.nombre, m.principio_activo FROM medicamento m LEFT JOIN prescripcion p ON m.id = p.medicamento_id WHERE p.id IS NULL;",
    },
    {
        "title": "Consultas con prescripción completa",
        "category": "04 - Análisis Avanzado",
        "order_num": 14,
        "difficulty": "avanzado",
        "description": "Muestra consultas que tienen medicamentos prescritos, con nombre del paciente, médico y fármaco.",
        "solution_sql": "SELECT p.nombre as paciente, m.nombre as medico, med.nombre as medicamento, pr.dosis FROM consulta c JOIN paciente p ON c.paciente_id = p.id JOIN medico m ON c.medico_id = m.id JOIN prescripcion pr ON c.id = pr.consulta_id JOIN medicamento med ON pr.medicamento_id = med.id;",
    },
    {
        "title": "Análisis de duración de tratamientos",
        "category": "04 - Análisis Avanzado",
        "order_num": 15,
        "difficulty": "avanzado",
        "description": "Calcula la duración promedio de tratamientos por especialidad médica.",
        "solution_sql": "SELECT m.especialidad, AVG(pr.duracion_dias) as duracion_promedio FROM medico m JOIN consulta c ON m.id = c.medico_id JOIN prescripcion pr ON c.id = pr.consulta_id GROUP BY m.especialidad ORDER BY duracion_promedio DESC;",
    },
]

# ──────────────────────────────────────────────────────────────
# DATASET 3 EXERCISES (Red Social)
# ──────────────────────────────────────────────────────────────

RED_SOCIAL_EXERCISES = [
    {
        "title": "Usuarios por ciudad",
        "category": "01 - Consultas Básicas",
        "order_num": 1,
        "difficulty": "basico",
        "description": "Lista todos los usuarios ordenados por ciudad, mostrando nombre de usuario y ciudad.",
        "solution_sql": "SELECT username, ciudad FROM usuario ORDER BY ciudad, username;",
    },
    {
        "title": "Posts más recientes",
        "category": "01 - Consultas Básicas",
        "order_num": 2,
        "difficulty": "basico",
        "description": "Muestra los 10 posts más recientes con el nombre de usuario que los publicó.",
        "solution_sql": "SELECT u.username, p.contenido, p.fecha_publicacion FROM post p JOIN usuario u ON p.usuario_id = u.id ORDER BY p.fecha_publicacion DESC LIMIT 10;",
    },
    {
        "title": "Posts de Madrid",
        "category": "02 - Filtros WHERE",
        "order_num": 3,
        "difficulty": "basico",
        "description": "Obtén todos los posts de usuarios que viven en Madrid.",
        "solution_sql": "SELECT u.username, p.contenido, p.fecha_publicacion FROM post p JOIN usuario u ON p.usuario_id = u.id WHERE u.ciudad = 'Madrid' ORDER BY p.fecha_publicacion DESC;",
    },
    {
        "title": "Usuarios inactivos",
        "category": "02 - Filtros WHERE",
        "order_num": 4,
        "difficulty": "basico",
        "description": "Lista usuarios que están marcados como inactivos.",
        "solution_sql": "SELECT username, email, ciudad FROM usuario WHERE activo = 0;",
    },
    {
        "title": "Usuarios con más seguidores",
        "category": "03 - Agregación",
        "order_num": 5,
        "difficulty": "intermedio",
        "description": "Muestra los usuarios ordenados por número de seguidores (descendente).",
        "solution_sql": "SELECT u.username, COUNT(f.id) as num_seguidores FROM usuario u LEFT JOIN follower f ON u.id = f.seguido_id GROUP BY u.id ORDER BY num_seguidores DESC;",
    },
    {
        "title": "Posts con más likes",
        "category": "03 - Agregación",
        "order_num": 6,
        "difficulty": "intermedio",
        "description": "Obtén los 5 posts con mayor cantidad de likes, mostrando usuario, contenido y número de likes.",
        "solution_sql": "SELECT u.username, p.contenido, COUNT(lp.id) as total_likes FROM post p JOIN usuario u ON p.usuario_id = u.id LEFT JOIN like_post lp ON p.id = lp.post_id GROUP BY p.id ORDER BY total_likes DESC LIMIT 5;",
    },
    {
        "title": "Posts sin comentarios",
        "category": "03 - Agregación",
        "order_num": 7,
        "difficulty": "intermedio",
        "description": "Lista posts que no tienen ningún comentario.",
        "solution_sql": "SELECT u.username, p.contenido, p.fecha_publicacion FROM post p JOIN usuario u ON p.usuario_id = u.id LEFT JOIN comentario c ON p.id = c.post_id WHERE c.id IS NULL ORDER BY p.fecha_publicacion DESC;",
    },
    {
        "title": "Usuarios que se siguen mutuamente",
        "category": "03 - Agregación",
        "order_num": 8,
        "difficulty": "avanzado",
        "description": "Encuentra pares de usuarios que se siguen el uno al otro (amigos mutuos).",
        "solution_sql": "SELECT u1.username as usuario1, u2.username as usuario2 FROM follower f1 JOIN follower f2 ON f1.seguidor_id = f2.seguido_id AND f1.seguido_id = f2.seguidor_id JOIN usuario u1 ON f1.seguidor_id = u1.id JOIN usuario u2 ON f1.seguido_id = u2.id WHERE u1.id < u2.id;",
    },
    {
        "title": "Usuarios activos por número de posts",
        "category": "03 - Agregación",
        "order_num": 9,
        "difficulty": "intermedio",
        "description": "Calcula cuántos posts ha publicado cada usuario, mostrando solo los que publicaron al menos un post.",
        "solution_sql": "SELECT u.username, COUNT(p.id) as num_posts FROM usuario u JOIN post p ON u.id = p.usuario_id GROUP BY u.id ORDER BY num_posts DESC;",
    },
    {
        "title": "Comentarios más activos",
        "category": "03 - Agregación",
        "order_num": 10,
        "difficulty": "intermedio",
        "description": "Muestra usuarios que han comentado en más posts diferentes.",
        "solution_sql": "SELECT u.username, COUNT(DISTINCT c.post_id) as posts_comentados FROM usuario u JOIN comentario c ON u.id = c.usuario_id GROUP BY u.id ORDER BY posts_comentados DESC;",
    },
    {
        "title": "Usuarios que siguen a más personas de las que les siguen",
        "category": "04 - Análisis Avanzado",
        "order_num": 11,
        "difficulty": "avanzado",
        "description": "Encuentra usuarios que siguen a más gente de la que les sigue.",
        "solution_sql": "SELECT u.username, COUNT(f1.id) as siguiendo, COUNT(f2.id) as seguidores FROM usuario u LEFT JOIN follower f1 ON u.id = f1.seguidor_id LEFT JOIN follower f2 ON u.id = f2.seguido_id GROUP BY u.id HAVING COUNT(f1.id) > COUNT(f2.id) ORDER BY COUNT(f1.id) DESC;",
    },
    {
        "title": "Actividad por día de la semana",
        "category": "04 - Análisis Avanzado",
        "order_num": 12,
        "difficulty": "avanzado",
        "description": "Cuenta cuántos posts se publicaron cada día de la semana (usando strftime o similar).",
        "solution_sql": "SELECT strftime('%w', p.fecha_publicacion) as dia_semana, COUNT(p.id) as num_posts FROM post p GROUP BY dia_semana ORDER BY dia_semana;",
    },
    {
        "title": "Red de influencers",
        "category": "04 - Análisis Avanzado",
        "order_num": 13,
        "difficulty": "avanzado",
        "description": "Muestra usuarios con más de 50 seguidores y sus posts más populares.",
        "solution_sql": "SELECT u.username, COUNT(DISTINCT f.id) as seguidores, COUNT(p.id) as total_posts, MAX(lp.likes_count) as max_likes FROM usuario u LEFT JOIN follower f ON u.id = f.seguido_id LEFT JOIN post p ON u.id = p.usuario_id LEFT JOIN (SELECT post_id, COUNT(*) as likes_count FROM like_post GROUP BY post_id) lp ON p.id = lp.post_id GROUP BY u.id HAVING COUNT(DISTINCT f.id) >= 5 ORDER BY seguidores DESC;",
    },
    {
        "title": "Interacción usuario post comentario",
        "category": "04 - Análisis Avanzado",
        "order_num": 14,
        "difficulty": "avanzado",
        "description": "Obtén nombre del autor del post, contenido, número de comentarios y likes para los 10 posts más interactuados.",
        "solution_sql": "SELECT u.username, p.contenido, COUNT(DISTINCT c.id) as num_comentarios, COUNT(DISTINCT lp.id) as num_likes FROM post p JOIN usuario u ON p.usuario_id = u.id LEFT JOIN comentario c ON p.id = c.post_id LEFT JOIN like_post lp ON p.id = lp.post_id GROUP BY p.id ORDER BY (COUNT(DISTINCT c.id) + COUNT(DISTINCT lp.id)) DESC LIMIT 10;",
    },
    {
        "title": "Usuarios sin actividad social",
        "category": "04 - Análisis Avanzado",
        "order_num": 15,
        "difficulty": "intermedio",
        "description": "Lista usuarios que no han hecho posts, comentarios ni likes.",
        "solution_sql": "SELECT u.username, u.ciudad FROM usuario u LEFT JOIN post p ON u.id = p.usuario_id LEFT JOIN comentario c ON u.id = c.usuario_id LEFT JOIN like_post lp ON u.id = lp.usuario_id WHERE p.id IS NULL AND c.id IS NULL AND lp.id IS NULL;",
    },
]


# ──────────────────────────────────────────────────────────────
# MAIN SEED FUNCTION
# ──────────────────────────────────────────────────────────────

def seed_datasets():
    create_tables()
    db = SessionLocal()

    try:
        # Dataset 1: INSTITUTO
        if not db.query(SQLDataset).filter(SQLDataset.name == "Instituto").first():
            print("Seeding Dataset 1: Instituto...")

            dataset_instituto = SQLDataset(
                name="Instituto",
                description="Base de datos académica con ciclos, alumnos, profesores, módulos y calificaciones. Incluye 20 alumnos en ciclos de ASIR, DAW, DAM y SMR con sus notas.",
                schema_sql=INSTITUTO_SCHEMA,
                seed_sql=INSTITUTO_SEED,
            )
            db.add(dataset_instituto)
            db.commit()

            for exc in INSTITUTO_EXERCISES:
                expected = compute_expected(INSTITUTO_SCHEMA, INSTITUTO_SEED, exc["solution_sql"])
                exercise = SQLExercise(
                    dataset_id=dataset_instituto.id,
                    title=exc["title"],
                    category=exc["category"],
                    order_num=exc["order_num"],
                    difficulty=exc["difficulty"],
                    description=exc["description"],
                    solution_sql=exc["solution_sql"],
                    expected_result=expected,
                    xp_reward=60,
                )
                db.add(exercise)
            db.commit()
            print("Dataset Instituto seeded successfully!")

        # Dataset 2: HOSPITAL
        if not db.query(SQLDataset).filter(SQLDataset.name == "Hospital").first():
            print("Seeding Dataset 2: Hospital...")

            dataset_hospital = SQLDataset(
                name="Hospital",
                description="Base de datos sanitaria con pacientes, médicos, consultas, medicamentos y prescripciones. Contiene 20 pacientes, 10 médicos con especialidades, 30 consultas y 15 medicamentos.",
                schema_sql=HOSPITAL_SCHEMA,
                seed_sql=HOSPITAL_SEED,
            )
            db.add(dataset_hospital)
            db.commit()

            for exc in HOSPITAL_EXERCISES:
                expected = compute_expected(HOSPITAL_SCHEMA, HOSPITAL_SEED, exc["solution_sql"])
                exercise = SQLExercise(
                    dataset_id=dataset_hospital.id,
                    title=exc["title"],
                    category=exc["category"],
                    order_num=exc["order_num"],
                    difficulty=exc["difficulty"],
                    description=exc["description"],
                    solution_sql=exc["solution_sql"],
                    expected_result=expected,
                    xp_reward=60,
                )
                db.add(exercise)
            db.commit()
            print("Dataset Hospital seeded successfully!")

        # Dataset 3: RED SOCIAL
        if not db.query(SQLDataset).filter(SQLDataset.name == "Red Social").first():
            print("Seeding Dataset 3: Red Social...")

            dataset_red = SQLDataset(
                name="Red Social",
                description="Base de datos de una red social con usuarios, posts, comentarios, likes y followers. Contiene 20 usuarios, 40 posts, 60 comentarios, 80 likes y 60 relaciones de seguimiento.",
                schema_sql=RED_SOCIAL_SCHEMA,
                seed_sql=RED_SOCIAL_SEED,
            )
            db.add(dataset_red)
            db.commit()

            for exc in RED_SOCIAL_EXERCISES:
                expected = compute_expected(RED_SOCIAL_SCHEMA, RED_SOCIAL_SEED, exc["solution_sql"])
                exercise = SQLExercise(
                    dataset_id=dataset_red.id,
                    title=exc["title"],
                    category=exc["category"],
                    order_num=exc["order_num"],
                    difficulty=exc["difficulty"],
                    description=exc["description"],
                    solution_sql=exc["solution_sql"],
                    expected_result=expected,
                    xp_reward=60,
                )
                db.add(exercise)
            db.commit()
            print("Dataset Red Social seeded successfully!")

        print("\n✓ All datasets seeded successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_datasets()
