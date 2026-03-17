"""
seed_ejptv2_course.py
─────────────────────────────────────────────────────────────
Crea el curso completo eJPTv2 – Junior Penetration Tester v2
en la tabla video_courses / video_lessons.

Uso:
    cd backend
    python scripts/seed_ejptv2_course.py

Notas:
  • Si ya existe un curso con ese título se omite la inserción (idempotente).
  • Los campos youtube_url están vacíos (se rellenan en el panel de admin).
  • section_title agrupa visualmente las lecciones en la UI.
  • is_quiz = True marca los cuestionarios / simulacros de examen.
"""

import sys
import os

# Allow import of backend modules (database.py, etc.)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from database import SessionLocal, engine, Base, VideoCourse, VideoLesson

# ── Ensure tables exist ───────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)


# ── Course definition ─────────────────────────────────────────────────────────
COURSE = {
    "title":       "eJPTv2 – Junior Penetration Tester",
    "slug":        "ejptv2",
    "description": (
        "Prepárate para la certificación eJPTv2 de eLearnSecurity (INE). "
        "Aprende desde cero los fundamentos del hacking ético: montaje de laboratorio, "
        "metodología de pentesting, fuzzing web, escaneo y enumeración con Nmap, "
        "explotación con Metasploit, post-explotación, vulnerabilidades web comunes y "
        "mucho más. El curso culmina con un simulacro completo del examen oficial."
    ),
    "thumbnail_url": None,
    "price":         None,
    "is_shop_course": False,
    "is_active":     True,
}

# ── Lessons ───────────────────────────────────────────────────────────────────
# Format: (order_index, section_title, title, description, is_quiz)
LESSONS = [
    # ── Sección 1: Módulo de Introducción ─────────────────────────────────────
    (1,  "Sección 1: Módulo de Introducción",
         "Presentación del curso y del instructor",
         "Conoce la estructura del curso, qué vas a aprender y el perfil del instructor. "
         "Se presenta el temario de la certificación eJPTv2 y los requisitos previos.",
         False),
    (2,  "Sección 1: Módulo de Introducción",
         "¿Qué es el Ethical Hacking y la certificación eJPTv2?",
         "Definición de hacking ético, diferencias con el hacking malicioso y por qué "
         "la eJPTv2 es el punto de entrada ideal al mundo del pentesting profesional.",
         False),

    # ── Sección 2: Montando el laboratorio ────────────────────────────────────
    (3,  "Sección 2: Montando el laboratorio",
         "Instalación de VirtualBox y primeros pasos",
         "Descarga e instalación de VirtualBox. Configuración inicial, creación de una "
         "red NAT y ajustes de rendimiento recomendados para máquinas virtuales.",
         False),
    (4,  "Sección 2: Montando el laboratorio",
         "Instalación y configuración de Kali Linux",
         "Descarga de la imagen oficial de Kali Linux, creación de la VM e instalación "
         "paso a paso. Primeras actualizaciones del sistema y configuración de idioma.",
         False),
    (5,  "Sección 2: Montando el laboratorio",
         "Instalación de máquinas Windows vulnerables (víctimas)",
         "Cómo descargar y configurar Metasploitable y máquinas Windows vulnerables "
         "en VirtualBox para practicar los ataques del curso de forma segura.",
         False),
    (6,  "Sección 2: Montando el laboratorio",
         "Configuración de red y comprobación de conectividad",
         "Configuración de adaptadores de red en VirtualBox para que atacante y víctimas "
         "se vean entre sí. Verificación con ping y primeros comandos de red.",
         False),

    # ── Sección 3: Manejo básico de Kali Linux y Windows ─────────────────────
    (7,  "Sección 3: Manejo básico de Kali Linux y Windows",
         "Comandos esenciales de Linux para pentesting",
         "Navegación por el sistema de ficheros, gestión de permisos, pipes, redirección, "
         "grep, find, netstat y otros comandos críticos que usarás en cada prueba.",
         False),
    (8,  "Sección 3: Manejo básico de Kali Linux y Windows",
         "Comandos esenciales de Windows para pentesting",
         "CMD y PowerShell básico: ipconfig, net user, whoami, tasklist, netstat. "
         "Manejo de usuarios locales y grupos. Navegación del registro de Windows.",
         False),
    (9,  "Sección 3: Manejo básico de Kali Linux y Windows",
         "Cuestionario 1 – Fundamentos y laboratorio",
         "Pon a prueba los conocimientos adquiridos en los módulos de introducción, "
         "montaje del laboratorio y comandos básicos de Linux y Windows.",
         True),   # ← Quiz

    # ── Sección 4: Metodología del Pentesting ─────────────────────────────────
    (10, "Sección 4: Metodología del Pentesting",
         "Fases del pentesting: reconocimiento, escaneo, explotación y post-explotación",
         "Visión general de las fases estándar de un pentest (PTES, OWASP). "
         "Diferencia entre reconocimiento pasivo y activo. Importancia de la documentación.",
         False),
    (11, "Sección 4: Metodología del Pentesting",
         "Reconocimiento pasivo: OSINT y recopilación de información",
         "Técnicas OSINT: Google Dorks, Shodan, theHarvester, Maltego, WHOIS, DNS lookup. "
         "Cómo obtener información del objetivo sin enviar ningún paquete.",
         False),

    # ── Sección 5: Fuzzing Web ────────────────────────────────────────────────
    (12, "Sección 5: Fuzzing Web",
         "Introducción al fuzzing web y herramientas",
         "Qué es el fuzzing, para qué sirve en pentesting web y cuáles son las "
         "principales herramientas: Gobuster, Dirb, Feroxbuster y wfuzz.",
         False),
    (13, "Sección 5: Fuzzing Web",
         "Fuzzing de directorios y archivos con Gobuster",
         "Uso práctico de Gobuster para descubrir rutas ocultas, paneles de admin y "
         "archivos sensibles. Wordlists recomendadas y flags más importantes.",
         False),
    (14, "Sección 5: Fuzzing Web",
         "Fuzzing de subdominios",
         "Enumeración de subdominios con Gobuster (modo dns) y con wfuzz. "
         "Configuración del /etc/hosts para laboratorio local y casos reales.",
         False),
    (15, "Sección 5: Fuzzing Web",
         "Fuzzing de parámetros y Virtual Hosts (VHosts)",
         "Descubrimiento de parámetros GET/POST ocultos y Virtual Hosts con ffuf. "
         "Interpretación de códigos de respuesta HTTP para filtrar resultados.",
         False),
    (16, "Sección 5: Fuzzing Web",
         "Práctica completa de fuzzing web sobre máquina objetivo",
         "Ejercicio guiado de reconocimiento web completo sobre una máquina de laboratorio: "
         "enumeración de directorios, subdominios y VHosts encadenados.",
         False),

    # ── Sección 6: Escaneo, Enumeración y Explotación ─────────────────────────
    (17, "Sección 6: Escaneo, Enumeración y Explotación",
         "Escaneo de redes con Nmap – fundamentos",
         "Conceptos de TCP/UDP, handshake y por qué importan en el escaneo. "
         "Tipos de escaneo de Nmap: SYN, Connect, UDP. Flags esenciales (-sV, -sC, -O).",
         False),
    (18, "Sección 6: Escaneo, Enumeración y Explotación",
         "Nmap avanzado: scripts NSE y evasión básica",
         "Uso de los scripts NSE más relevantes para pentesting. Técnicas básicas de "
         "evasión de firewall: fragmentación, timing, decoys y spoofing de IP.",
         False),
    (19, "Sección 6: Escaneo, Enumeración y Explotación",
         "Enumeración de servicios: SMB, FTP, SSH, HTTP",
         "Cómo enumerar servicios comunes con herramientas especializadas: "
         "enum4linux para SMB, Hydra para fuerza bruta SSH/FTP, Nikto para HTTP.",
         False),
    (20, "Sección 6: Escaneo, Enumeración y Explotación",
         "Metasploit Framework – introducción y estructura",
         "Arquitectura de Metasploit: msfconsole, módulos (exploits, payloads, auxiliares). "
         "Comandos básicos: search, use, set, run/exploit. Msfvenom para generar payloads.",
         False),
    (21, "Sección 6: Escaneo, Enumeración y Explotación",
         "Explotación con Metasploit sobre servicios vulnerables",
         "Explotación práctica de servicios vulnerables (EternalBlue MS17-010, vsftpd 2.3.4, "
         "UnrealIRCd) usando módulos de Metasploit. Obtención de shell remota.",
         False),
    (22, "Sección 6: Escaneo, Enumeración y Explotación",
         "Shells y listeners: bind shell vs reverse shell",
         "Diferencias entre bind shell y reverse shell. Configuración de listeners con "
         "Netcat y Metasploit (multi/handler). Estabilización de shells interactivas.",
         False),

    # ── Sección 7: CMS Comunes ────────────────────────────────────────────────
    (23, "Sección 7: CMS Comunes",
         "Pentesting sobre WordPress",
         "Enumeración de WordPress con WPScan: plugins y temas vulnerables, usuarios. "
         "Ataques de fuerza bruta a xmlrpc.php. Explotación de plugins desactualizados.",
         False),
    (24, "Sección 7: CMS Comunes",
         "Pentesting sobre Joomla",
         "Enumeración de Joomla con JoomScan. Identificación de versión, extensiones "
         "vulnerables y rutas de administración. Explotación de vulnerabilidades conocidas.",
         False),
    (25, "Sección 7: CMS Comunes",
         "Pentesting sobre Drupal",
         "Identificación de versiones de Drupal vulnerables (Drupalgeddon). "
         "Enumeración con Droopescan y explotación con módulos de Metasploit.",
         False),

    # ── Sección 8: Post-Explotación ───────────────────────────────────────────
    (26, "Sección 8: Post-Explotación",
         "Post-explotación en Linux: escalada de privilegios",
         "Técnicas de escalada de privilegios en Linux: SUID, sudo -l, cron jobs, "
         "capabilities, PATH hijacking. Uso de LinPEAS para automatizar la enumeración.",
         False),
    (27, "Sección 8: Post-Explotación",
         "Post-explotación en Windows: escalada de privilegios",
         "Escalada de privilegios en Windows: tokens de acceso, servicios misconfigured, "
         "DLL hijacking, Always Install Elevated. WinPEAS y PowerUp para enumeración.",
         False),

    # ── Sección 9: Vulnerabilidades Básicas ───────────────────────────────────
    (28, "Sección 9: Vulnerabilidades Básicas",
         "SQL Injection – fundamentos y explotación manual",
         "Tipos de SQLi: clásica, blind (boolean/time-based), error-based. "
         "Explotación manual con apostrophe, comentarios SQL y extracción de datos.",
         False),
    (29, "Sección 9: Vulnerabilidades Básicas",
         "SQL Injection con SQLMap",
         "Automatización de SQLi con SQLMap: detección, extracción de bases de datos, "
         "tablas, columnas y volcado de credenciales. Flags --dbs, -D, -T, --dump.",
         False),
    (30, "Sección 9: Vulnerabilidades Básicas",
         "Cross-Site Scripting (XSS) – Reflected, Stored y DOM",
         "Qué es XSS y sus tres variantes. Payloads básicos de prueba. Casos de uso "
         "en pentesting: robo de cookies, redirección y defacement. Bypass de filtros.",
         False),
    (31, "Sección 9: Vulnerabilidades Básicas",
         "File Inclusion: LFI y RFI",
         "Local File Inclusion y Remote File Inclusion: funcionamiento, vectores de "
         "ataque comunes y cómo escalar de LFI a RCE mediante log poisoning.",
         False),
    (32, "Sección 9: Vulnerabilidades Básicas",
         "Command Injection y File Upload",
         "Inyección de comandos OS: detección, payloads (;, &&, |, backtick) y explotación. "
         "Vulnerabilidades de subida de ficheros: bypass de extensión y MIME type.",
         False),
    (33, "Sección 9: Vulnerabilidades Básicas",
         "Uso de BurpSuite Community Edition",
         "Configuración del proxy de BurpSuite en el navegador. Intercepción y modificación "
         "de peticiones HTTP. Uso del Repeater e Intruder para pruebas manuales.",
         False),

    # ── Sección 10: Toma de Notas ─────────────────────────────────────────────
    (34, "Sección 10: Toma de Notas",
         "Metodología de toma de notas con Obsidian",
         "Por qué documentar es clave en pentesting. Configuración de Obsidian "
         "para crear un vault de notas estructurado por fases del pentest.",
         False),
    (35, "Sección 10: Toma de Notas",
         "Plantillas de informe y cheatsheets para el examen",
         "Plantillas listas para usar durante el examen eJPTv2: host discovery, "
         "escaneo de puertos, explotación y post-explotación. Cheatsheets de comandos.",
         False),

    # ── Sección 11: Empezamos a HACKEAR! ──────────────────────────────────────
    (36, "Sección 11: ¡Empezamos a HACKEAR!",
         "Máquina 1 – Resolución guiada (Linux easy)",
         "Resolución completa de una máquina Linux de dificultad fácil: reconocimiento, "
         "enumeración, explotación y escalada de privilegios hasta root.",
         False),
    (37, "Sección 11: ¡Empezamos a HACKEAR!",
         "Máquina 2 – Resolución guiada (Windows easy)",
         "Resolución completa de una máquina Windows de dificultad fácil aplicando "
         "los conceptos de SMB, credenciales débiles y escalada de privilegios.",
         False),
    (38, "Sección 11: ¡Empezamos a HACKEAR!",
         "Máquina 3 – Web + SQLi",
         "Máquina centrada en pentesting web: fuzzing, descubrimiento de panel de login, "
         "inyección SQL y escalada hasta shell del sistema.",
         False),
    (39, "Sección 11: ¡Empezamos a HACKEAR!",
         "Máquina 4 – WordPress vulnerable",
         "Explotación completa de un WordPress real con plugin vulnerable: enumeración "
         "con WPScan, explotación del plugin y escalada de privilegios.",
         False),
    (40, "Sección 11: ¡Empezamos a HACKEAR!",
         "Máquina 5 – Pivoting básico (red interna)",
         "Introducción al pivoting: cómo acceder a subredes internas desde un host "
         "comprometido. Uso de Metasploit route, Chisel y Proxychains.",
         False),
    (41, "Sección 11: ¡Empezamos a HACKEAR!",
         "Máquina 6 – LFI a RCE",
         "Máquina con vulnerabilidad de Local File Inclusion escalada a Remote Code "
         "Execution mediante log poisoning y obtención de shell reversa.",
         False),
    (42, "Sección 11: ¡Empezamos a HACKEAR!",
         "Máquina 7 – Post-explotación completa",
         "Máquina de nivel medio centrada en la fase de post-explotación: "
         "movimiento lateral, volcado de credenciales y persistencia.",
         False),
    (43, "Sección 11: ¡Empezamos a HACKEAR!",
         "Máquina 8 – Reto libre (sin pistas)",
         "Máquina sin guía para que apliques todo lo aprendido de forma autónoma. "
         "Ideal para calibrar tu nivel antes del examen real.",
         False),
    (44, "Sección 11: ¡Empezamos a HACKEAR!",
         "Simulacro de examen eJPTv2",
         "Simulacro completo del examen oficial: 3 horas, entorno multi-máquina, "
         "preguntas de opción múltiple y ejercicios prácticos. Revisión de respuestas.",
         True),   # ← Quiz / simulacro

    # ── Sección 12: Tips para el examen ───────────────────────────────────────
    (45, "Sección 12: Tips para el examen",
         "Consejos finales y estrategia para el día del examen",
         "Gestión del tiempo durante el examen eJPTv2, errores más comunes, "
         "cómo leer las preguntas, qué herramientas tener siempre a mano y mindset.",
         False),

    # ── Sección 13: Despedida ─────────────────────────────────────────────────
    (46, "Sección 13: Despedida del curso",
         "Cierre del curso y próximos pasos",
         "Resumen de todo lo aprendido, felicitación por completar el curso y orientación "
         "sobre los siguientes pasos: eJPTv2, PNPT, OSCP y recursos adicionales.",
         False),
]


# ── Seed function ─────────────────────────────────────────────────────────────
def seed():
    db = SessionLocal()
    try:
        # Idempotency: skip if already seeded
        existing = db.query(VideoCourse).filter_by(title=COURSE["title"]).first()
        if existing:
            print(f"[SKIP] El curso '{COURSE['title']}' ya existe (id={existing.id}).")
            return

        print(f"[CREATE] Creando curso: {COURSE['title']}")
        course = VideoCourse(**COURSE)
        db.add(course)
        db.flush()  # get course.id without committing

        for order_index, section_title, title, description, is_quiz in LESSONS:
            lesson = VideoLesson(
                course_id=course.id,
                title=title,
                description=description,
                section_title=section_title,
                order_index=order_index,
                is_quiz=is_quiz,
                youtube_url=None,
                video_file_path=None,
            )
            db.add(lesson)
            tag = "[ QUIZ]" if is_quiz else "[CLASE]"
            print(f"  {tag} {order_index:02d}. {title}")

        db.commit()
        print(f"\n✅ Curso creado con éxito: {len(LESSONS)} lecciones insertadas.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
