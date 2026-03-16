"""
Seed script: populate the database with sample questions and resources.
Run once with: python seed.py
"""
import os
from database import SessionLocal, create_tables, Question, Resource

# Eliminar bbdd existente para reescribir con datos de FP si existe (demo mode)
if os.path.exists("tech4u.db"):
    os.remove("tech4u.db")
create_tables()

QUESTIONS = [
    # ── Bases de Datos (SQL) ──
    {"subject": "Bases de Datos", "difficulty": "easy", "text": "¿Qué comando SQL se usa para añadir una nueva fila a una tabla?", "option_a": "ADD NEW", "option_b": "INSERT INTO", "option_c": "UPDATE", "option_d": "APPEND ROW", "correct_answer": "b", "explanation": "INSERT INTO es la sentencia DML estándar para insertar nuevos registros en una tabla."},
    {"subject": "Bases de Datos", "difficulty": "medium", "text": "Al unir dos tablas con JOIN, ¿qué tipo de JOIN devuelve todas las filas de la tabla izquierda y las coincidencias de la derecha?", "option_a": "INNER JOIN", "option_b": "LEFT JOIN", "option_c": "RIGHT JOIN", "option_d": "FULL OUTER JOIN", "correct_answer": "b", "explanation": "LEFT JOIN (o LEFT OUTER JOIN) mantiene todos los registros de la primera tabla especificada (la izquierda)."},
    {"subject": "Bases de Datos", "difficulty": "hard", "text": "¿Para qué sirve el comando COMMIT en el control de transacciones?", "option_a": "Para deshacer los cambios pendientes", "option_b": "Para guardar de forma permanente los cambios realizados en la transacción actual", "option_c": "Para bloquear una tabla", "option_d": "Para borrar el registro de transacciones", "correct_answer": "b", "explanation": "COMMIT finaliza la transacción actual e implementa todos los cambios de forma duradera."},

    # ── Redes ──
    {"subject": "Redes", "difficulty": "easy", "text": "¿En qué capa del modelo OSI operan los routers IP?", "option_a": "Capa 2 (Enlace)", "option_b": "Capa 3 (Red)", "option_c": "Capa 4 (Transporte)", "option_d": "Capa 7 (Aplicación)", "correct_answer": "b", "explanation": "El enrutamiento IP y las direcciones lógicas son responsabilidad de la Capa de Red (Capa 3)."},
    {"subject": "Redes", "difficulty": "medium", "text": "Dada la IP 192.168.1.50 con máscara /26, ¿cuál es la dirección de red?", "option_a": "192.168.1.0", "option_b": "192.168.1.32", "option_c": "192.168.1.48", "option_d": "192.168.1.64", "correct_answer": "a", "explanation": "Un /26 significa que los últimos 6 bits son de host (tamaño de bloque 64). La primera red es .0, la siguiente .64."},
    {"subject": "Redes", "difficulty": "hard", "text": "¿Cuál protocolo de enrutamiento es un protocolo vector de distancia y utiliza el conteo de saltos como métrica?", "option_a": "OSPF", "option_b": "EIGRP", "option_c": "BGP", "option_d": "RIP", "correct_answer": "d", "explanation": "Routing Information Protocol (RIP) usa el conteo de saltos como métrica con un límite máximo de 15 saltos."},

    # ── Sistemas Operativos ──
    {"subject": "Sistemas Operativos", "difficulty": "easy", "text": "En Linux, ¿qué comando muestra el directorio de trabajo actual?", "option_a": "cd", "option_b": "pwd", "option_c": "ls", "option_d": "dir", "correct_answer": "b", "explanation": "pwd significa 'print working directory', que imprime la ruta absoluta actual."},
    {"subject": "Sistemas Operativos", "difficulty": "medium", "text": "¿Qué representa el permiso 755 en un fichero de Linux?", "option_a": "Lectura y escritura para todos", "option_b": "R/W/X para dueño, R/X para grupo, R/X para otros", "option_c": "Solo ejecución para todos", "option_d": "R/W/X para dueño, sin permisos para los demás", "correct_answer": "b", "explanation": "7 (4+2+1) es leer/escribir/ejecutar para dueño. 5 (4+1) es leer/ejecutar para grupo y otros."},
    {"subject": "Sistemas Operativos", "difficulty": "hard", "text": "En Windows Server, ¿qué rol se encarga de gestionar políticas de grupo (GPO) y un directorio jerárquico?", "option_a": "IIS", "option_b": "DNS", "option_c": "DHCP", "option_d": "Active Directory Domain Services (AD DS)", "correct_answer": "d", "explanation": "AD DS proporciona características como la base de datos de directorio y su gestión a través de GPOs."},

    # ── Ciberseguridad ──
    {"subject": "Ciberseguridad", "difficulty": "easy", "text": "¿Cuál de los siguientes es un algoritmo de cifrado asimétrico?", "option_a": "AES", "option_b": "DES", "option_c": "RSA", "option_d": "RC4", "correct_answer": "c", "explanation": "RSA es el algoritmo más conocido que utiliza un par de claves: pública y privada."},
    {"subject": "Ciberseguridad", "difficulty": "medium", "text": "En pentesting, ¿qué herramienta es un escáner de red por excelencia?", "option_a": "Nmap", "option_b": "John The Ripper", "option_c": "Gobuster", "option_d": "Hashcat", "correct_answer": "a", "explanation": "Nmap se usa para el descubrimiento de hosts y escaneo de puertos operativos."},

    # ── Programación ──
    {"subject": "Programación", "difficulty": "easy", "text": "¿Para qué sirve el concepto de 'Herencia' en POO?", "option_a": "Para crear bucles infinitos", "option_b": "Para aislar variables de un programa global", "option_c": "Para que una clase adquiera atributos y métodos de otra", "option_d": "Para manejar excepciones", "correct_answer": "c", "explanation": "La herencia fomenta la reutilización de código mediante la derivación de clases."},
    {"subject": "Programación", "difficulty": "medium", "text": "¿Cuál es la diferencia principal entre un Array y una List en lenguajes como Java o C#?", "option_a": "El Array tiene tamaño fijo, la List es dinámica", "option_b": "Un Array solo puede almacenar números", "option_c": "La List no necesita importar librerías", "option_d": "Son exactamente la misma estructura", "correct_answer": "a", "explanation": "Los arreglos nativos requieren conocer su tamaño al inicializarse. Las estructuras tipo List redimensionan su capacidad automáticamente."},
]

RESOURCES = [
    {"title": "Cheat Sheet: Comandos SQL Básicos (DAW/DAM)", "subject": "Bases de Datos", "description": "Resumen de consultas DDL y DML para módulos de BBDD.", "file_type": "cheatsheet", "url": "#", "requires_subscription": False},
    {"title": "Subnetting Rápido para ASIR", "subject": "Redes", "description": "Estrategias y trucos para dividir redes IPv4 sin usar calculadora.", "file_type": "pdf", "url": "#", "requires_subscription": True},
    {"title": "Comandos Linux y Bash Scripting", "subject": "Sistemas Operativos", "description": "Chuleta esencial para el módulo de Sistemas Operativos en FP.", "file_type": "cheatsheet", "url": "#", "requires_subscription": True},
    {"title": "Conceptos de Hacking Ético en FP", "subject": "Ciberseguridad", "description": "Introducción al curso de Especialización en Ciberseguridad.", "file_type": "pdf", "url": "#", "requires_subscription": True},
    {"title": "Fundamentos de POO (Java/Python)", "subject": "Programación", "description": "Clases, herencia, interfaces y polimorfismo.", "file_type": "cheatsheet", "url": "#", "requires_subscription": True},
]


def seed():
    db = SessionLocal()
    try:
        if db.query(Question).count() == 0:
            for q in QUESTIONS:
                db.add(Question(**q))
            print(f"✅ Seeded {len(QUESTIONS)} questions")
        else:
            print("ℹ️  Questions already seeded, skipping")

        if db.query(Resource).count() == 0:
            for r in RESOURCES:
                db.add(Resource(**r))
            print(f"✅ Seeded {len(RESOURCES)} resources")
        else:
            print("ℹ️  Resources already seeded, skipping")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
    print("🎉 Seed complete!")
