import os, sys
from seed_utils import sync_subject_questions

SUBJECT = "Ciberseguridad"

QUESTIONS = [
    # --- FÁCIL (Identificación y Amenazas) ---
    {
        "text": "¿Qué significa el término 'Malware'?",
        "option_a": "Mal functioning Hardware",
        "option_b": "Malicious Software",
        "option_c": "Manual Warehousing",
        "option_d": "Main Linux Ware",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "Malware es la abreviatura de Malicious Software (Software Malicioso), diseñado para infiltrarse o dañar un sistema."
    },
    {
        "text": "¿Cuál es la principal diferencia entre un virus y un gusano (worm)?",
        "option_a": "El virus es más grande.",
        "option_b": "El virus necesita de un programa anfitrión para propagarse; el gusano lo hace de forma autónoma.",
        "option_c": "El gusano solo afecta a pendrives.",
        "option_d": "No hay ninguna diferencia.",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "Los gusanos son autónomos y se replican por la red, mientras que los virus se adhieren a ficheros ejecutables."
    },
    {
        "text": "¿Qué es el 'Phishing'?",
        "option_a": "Un ataque DDoS masivo.",
        "option_b": "Una técnica de ingeniería social para robar datos mediante engaños por email o web.",
        "option_c": "Un tipo de cifrado asimétrico.",
        "option_d": "La desactivación del antivirus por hardware.",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "El phishing busca engañar al usuario para que revele contraseñas o datos bancarios suplantando identidades de confianza."
    },
    {
        "text": "¿Para qué sirve un Firewall?",
        "option_a": "Para acelerar la conexión a internet.",
        "option_b": "Para filtrar o bloquear el tráfico no deseado basado en un conjunto de reglas.",
        "option_c": "Para proteger el ordenador de incendios físicos.",
        "option_d": "Para guardar copias de seguridad.",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "El firewall (cortafuegos) es la primera línea de defensa que controla la entrada y salida de datos en la red."
    },
    {
        "text": "¿Qué tipo de ataque intenta adivinar una contraseña probando todas las combinaciones posibles?",
        "option_a": "Inyección SQL",
        "option_b": "Ataque de Fuerza Bruta",
        "option_c": "Sniffing",
        "option_d": "Man-in-the-Middle",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "La fuerza bruta consiste en probar masivamente claves hasta dar con la correcta, para lo cual se recomienda usar contraseñas largas y complejas."
    },
    # --- MEDIO (Protección y Criptografía) ---
    {
        "text": "¿Cuál es la principal característica del cifrado asimétrico?",
        "option_a": "Utiliza la misma clave para cifrar y descifrar.",
        "option_b": "Utiliza un par de claves: una pública y otra privada.",
        "option_c": "No puede ser descifrado nunca.",
        "option_d": "Solo funciona en redes locales.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "En el cifrado asimétrico (RSA, por ejemplo), la clave pública cifra y solo su correspondiente pareja privada puede descifrar."
    },
    {
        "text": "¿Qué es un Pentesting o Test de Penetración?",
        "option_a": "Instalar antivirus en todos los PCs de una empresa.",
        "option_b": "Un ataque real con fines delictivos.",
        "option_c": "Un ataque simulado y autorizado para evaluar la seguridad de un sistema.",
        "option_d": "Configurar los permisos de las carpetas compartidas.",
        "correct_answer": "c",
        "difficulty": "medium",
        "explanation": "El pentesting identifica vulnerabilidades explotándolas de forma controlada antes de que lo haga un atacante real."
    },
    {
        "text": "¿Qué busca un ataque de Inyección SQL (SQLi)?",
        "option_a": "Borrar el disco duro del servidor.",
        "option_b": "Manipular las consultas a la base de datos insertando código malicioso.",
        "option_c": "Robar las contraseñas de la BIOS.",
        "option_d": "Apagar el router de la víctima.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "SQLi aprovecha la falta de validación en los inputs para leer, modificar o borrar datos sensibles de la BD."
    },
    {
        "text": "En el modelo CIA de ciberseguridad, ¿qué significan las siglas?",
        "option_a": "Computer Internet Access",
        "option_b": "Confidencialidad, Integridad y Disponibilidad",
        "option_c": "Control de Identidad Avanzado",
        "option_d": "Ciber Inteligencia Artificial",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "Confidencialidad (solo autorizados ven), Integridad (no se alteran) y Disponibilidad (están siempre accesibles)."
    },
    {
        "text": "¿Qué es un certificado SSL/TLS?",
        "option_a": "Un documento para ser técnico de seguridad.",
        "option_b": "Un protocolo criptográfico para establecer comunicaciones seguras por red (HTTPS).",
        "option_c": "Un firewall por software.",
        "option_d": "Un tipo de memoria RAM segura.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "SSL/TLS cifra el tráfico entre el navegador y el servidor para evitar que terceros 'escuchen' la comunicación."
    },
    # --- DIFÍCIL (Avanzado) ---
    {
        "text": "¿Qué es un 'Zero-Day' (Día Zero) en seguridad?",
        "option_a": "Un fallo que ocurre todos los días a las 00:00.",
        "option_b": "Una vulnerabilidad recién descubierta para la cual no existe todavía un parche de seguridad.",
        "option_c": "El primer día de trabajo de un sysadmin.",
        "option_d": "Un ataque que dura menos de un segundo.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "Los 0-day son extremadamente peligrosos porque los atacantes pueden explotarlos sin que los desarrolladores hayan tenido tiempo de lanzar la cura."
    },
    {
        "text": "¿Qué herramienta se especializa en el análisis y escaneo de puertos de red?",
        "option_a": "Wireshark",
        "option_b": "Nmap",
        "option_c": "Metasploit",
        "option_d": "John the Ripper",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "Nmap es la herramienta de referencia para auditoría de red y descubrimiento de puertos y servicios abiertos."
    },
    {
        "text": "¿Cuál es el objetivo principal de un ataque de Denegación de Servicio Distribuido (DDoS)?",
        "option_a": "Robar los datos de las tarjetas de crédito.",
        "option_b": "Inhabilitar un servicio inundándolo con tráfico basura desde múltiples fuentes.",
        "option_c": "Espiar las conversaciones del CEO.",
        "option_d": "Modificar la página web oficial (Defacement).",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "Los DDoS saturan los recursos del servidor o el ancho de banda para que los usuarios legítimos no puedan acceder."
    },
    {
        "text": "¿Qué es un 'HoneyPot' en ciberseguridad?",
        "option_a": "Un antivirus para móviles.",
        "option_b": "Un sistema trampa diseñado para atraer, detectar y estudiar el comportamiento de los atacantes.",
        "option_c": "Una base de datos de contraseñas filtradas.",
        "option_d": "Una red Wi-Fi gratis pero segura.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "El HoneyPot simula ser un sistema vulnerable real para recolectar información sobre las técnicas del atacante."
    },
    {
        "text": "¿Qué función cumple el 'Salting' en el almacenamiento de contraseñas?",
        "option_a": "Hace que el login sea más rápido.",
        "option_b": "Añade datos aleatorios al password antes de aplicar el Hashing para evitar ataques de tablas Rainbow.",
        "option_c": "Comprobar si el usuario es mayor de edad.",
        "option_d": "Encriptar la base de datos completa.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "El salt (sal) asegura que dos usuarios con la misma clave tengan hashes diferentes en la base de datos."
    }
]

if __name__ == "__main__":
    sync_subject_questions(SUBJECT, QUESTIONS)
