"""
Script to insert seed questions for the two new ASIR subjects:
- Fundamentos de Hardware
- Lenguaje de Marcas
Run: cd backend && python seed_new_subjects.py
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Question, Base

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tech4u.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

HW_QUESTIONS = [
    {
        "text": "¿Cuál es la función principal de la BIOS/UEFI en un ordenador?",
        "option_a": "Gestionar el Sistema Operativo",
        "option_b": "Proporcionar la interfaz gráfica de usuario",
        "option_c": "Inicializar el hardware y arrancar el sistema operativo",
        "option_d": "Controlar la conexión a Internet",
        "correct_answer": "c",
        "explanation": "La BIOS/UEFI es el firmware que realiza el POST (Power-On Self-Test) e inicializa los componentes de hardware antes de ceder el control al sistema operativo.",
        "subject": "Fundamentos de Hardware",
    },
    {
        "text": "¿Qué significa el acrónimo RAM?",
        "option_a": "Read Access Memory",
        "option_b": "Random Access Memory",
        "option_c": "Rapid Application Module",
        "option_d": "Redundant Array Memory",
        "correct_answer": "b",
        "explanation": "RAM (Random Access Memory) es la memoria de acceso aleatorio que almacena datos temporalmente mientras el ordenador está en uso.",
        "subject": "Fundamentos de Hardware",
    },
    {
        "text": "¿Qué tipo de memoria conserva los datos sin necesidad de alimentación eléctrica?",
        "option_a": "RAM DRAM",
        "option_b": "RAM SRAM",
        "option_c": "ROM (Read-Only Memory)",
        "option_d": "Caché L1",
        "correct_answer": "c",
        "explanation": "La memoria ROM y las memorias flash (como SSD) son memorias no volátiles: conservan los datos aunque se retire la corriente eléctrica.",
        "subject": "Fundamentos de Hardware",
    },
    {
        "text": "¿Cuál de los siguientes es un estándar de interfaz de almacenamiento de alta velocidad para SSD?",
        "option_a": "IDE",
        "option_b": "SATA II",
        "option_c": "NVMe",
        "option_d": "SCSI",
        "correct_answer": "c",
        "explanation": "NVMe (Non-Volatile Memory Express) es el protocolo moderno para SSD conectados vía PCIe, ofreciendo velocidades muy superiores a SATA.",
        "subject": "Fundamentos de Hardware",
    },
    {
        "text": "En una CPU, ¿qué hace la ALU (Unidad Aritmético-Lógica)?",
        "option_a": "Almacena los resultados de los cálculos permanentemente",
        "option_b": "Ejecuta operaciones matemáticas y lógicas",
        "option_c": "Controla el flujo de instrucciones del programa",
        "option_d": "Gestiona la memoria RAM",
        "correct_answer": "b",
        "explanation": "La ALU es el componente de la CPU responsable de realizar operaciones aritméticas (suma, resta) y lógicas (AND, OR, NOT) sobre los datos.",
        "subject": "Fundamentos de Hardware",
    },
    {
        "text": "¿Qué factor de forma es el más común en los servidores de rack?",
        "option_a": "Torre (Tower)",
        "option_b": "Mini-ITX",
        "option_c": "1U / 2U Rack",
        "option_d": "Micro-ATX",
        "correct_answer": "c",
        "explanation": "Los servidores de rack suelen tener formato 1U o 2U (Unit), que hace referencia a la altura estándar de 1,75\" por unidad de rack.",
        "subject": "Fundamentos de Hardware",
    },
    {
        "text": "¿Cuál es la diferencia principal entre un HDD y un SSD?",
        "option_a": "Los SSD usan discos magnéticos giratorios; los HDD, chips de memoria",
        "option_b": "Los HDD usan chips de memoria flash; los SSD, discos magnéticos",
        "option_c": "Los HDD tienen discos magnéticos giratorios; los SSD usan memoria flash sin partes móviles",
        "option_d": "No hay diferencia, son sinónimos",
        "correct_answer": "c",
        "explanation": "Los HDD (Hard Disk Drive) basan su almacenamiento en platos magnéticos giratorios y un cabezal lector. Los SSD (Solid State Drive) usan chips de memoria NAND flash y no tienen partes móviles, siendo más rápidos y resistentes.",
        "subject": "Fundamentos de Hardware",
    },
    {
        "text": "¿Qué ranura de expansión ofrece mayor ancho de banda para tarjetas gráficas modernas?",
        "option_a": "PCI",
        "option_b": "AGP",
        "option_c": "PCIe x16",
        "option_d": "ISA",
        "correct_answer": "c",
        "explanation": "PCIe x16 (PCI Express) es la interfaz estándar para tarjetas gráficas actuales, ofreciendo 16 líneas de transferencia de alta velocidad.",
        "subject": "Fundamentos de Hardware",
    },
    {
        "text": "¿Qué componente en una placa base sincroniza las operaciones de la CPU?",
        "option_a": "Chipset Norte (Northbridge)",
        "option_b": "El cristal oscilador (reloj del sistema)",
        "option_c": "El módulo de RAM",
        "option_d": "La pila CMOS",
        "correct_answer": "b",
        "explanation": "El cristal oscilador de la placa base genera la señal de reloj que sincroniza todos los componentes. La frecuencia del reloj (en GHz) determina cuántas operaciones puede realizar la CPU por segundo.",
        "subject": "Fundamentos de Hardware",
    },
    {
        "text": "¿Para qué se utiliza principalmente la pila CMOS en una placa base?",
        "option_a": "Para alimentar el procesador durante los picos de carga",
        "option_b": "Para mantener la hora del sistema y la configuración BIOS/UEFI cuando el ordenador está apagado",
        "option_c": "Para almacenar el sistema operativo",
        "option_d": "Para refrigerar el chipset",
        "correct_answer": "b",
        "explanation": "La pila CMOS (normalmente CR2032) alimenta el chip RTC (Real-Time Clock) y la memoria CMOS donde se guardan la hora y la configuración de la BIOS cuando el ordenador está desconectado.",
        "subject": "Fundamentos de Hardware",
    },
]

XML_QUESTIONS = [
    {
        "text": "¿Cuál de los siguientes es el marcado correcto para un elemento XML con un atributo?",
        "option_a": '<producto precio=19.99>Teclado</producto>',
        "option_b": '<producto precio="19.99">Teclado</producto>',
        "option_c": '<producto: precio="19.99">Teclado</producto>',
        "option_d": '<producto [precio="19.99"]>Teclado</producto>',
        "correct_answer": "b",
        "explanation": "En XML, los valores de los atributos deben ir siempre entre comillas dobles o simples. La forma correcta es: <elemento atributo=\"valor\">.",
        "subject": "Lenguaje de Marcas",
    },
    {
        "text": "¿Qué significa HTML?",
        "option_a": "HyperText Markup Language",
        "option_b": "High Transfer Markup Language",
        "option_c": "HyperText Management Language",
        "option_d": "Hyperlink and Text Markup Language",
        "correct_answer": "a",
        "explanation": "HTML (HyperText Markup Language) es el lenguaje estándar para definir la estructura y el contenido de páginas web.",
        "subject": "Lenguaje de Marcas",
    },
    {
        "text": "En HTML5, ¿cuál es la etiqueta correcter para definir el área de contenido principal de la página?",
        "option_a": "<content>",
        "option_b": "<main>",
        "option_c": "<body>",
        "option_d": "<section id='main'>",
        "correct_answer": "b",
        "explanation": "La etiqueta <main> de HTML5 identifica semánticamente el contenido principal del documento. Solo debe haber uno por página.",
        "subject": "Lenguaje de Marcas",
    },
    {
        "text": "¿Qué es un DTD (Document Type Definition) en XML?",
        "option_a": "Un editor visual de XML",
        "option_b": "Un lenguaje de estilos para XML",
        "option_c": "Un documento que define la estructura y los elementos válidos de un documento XML",
        "option_d": "Un protocolo de transferencia de datos XML",
        "correct_answer": "c",
        "explanation": "Un DTD define las reglas que debe seguir un documento XML: qué elementos pueden aparecer, en qué order y con qué atributos. Permite validar la estructura del XML.",
        "subject": "Lenguaje de Marcas",
    },
    {
        "text": "¿Cuál es la declaración correcta al inicio de un documento XML?",
        "option_a": '<!DOCTYPE xml version="1.0">',
        "option_b": '<!-- XML -->',
        "option_c": '<?xml version="1.0" encoding="UTF-8"?>',
        "option_d": '<xml version="1.0">',
        "correct_answer": "c",
        "explanation": "El prólogo XML estándar es <?xml version=\"1.0\" encoding=\"UTF-8\"?>. Esta instrucción de procesamiento debe ser la primera línea del documento.",
        "subject": "Lenguaje de Marcas",
    },
    {
        "text": "En CSS, ¿cómo se seleccionan todos los elementos <p> que son hijos directos de un <div>?",
        "option_a": "div p { }",
        "option_b": "div + p { }",
        "option_c": "div > p { }",
        "option_d": "div ~ p { }",
        "correct_answer": "c",
        "explanation": "El selector 'div > p' selecciona SOLO los <p> que son hijos directos del <div>. El selector 'div p' selecciona cualquier <p> descendiente, sin importar el nivel de anidamiento.",
        "subject": "Lenguaje de Marcas",
    },
    {
        "text": "¿Qué significa XHTML comparado con HTML?",
        "option_a": "XHTML es una versión extendida de HTML con más etiquetas",
        "option_b": "XHTML es HTML reformulado como XML, con reglas sintácticas más estrictas",
        "option_c": "XHTML es una versión exclusiva para móviles de HTML",
        "option_d": "XHTML y HTML son idénticos",
        "correct_answer": "b",
        "explanation": "XHTML (Extensible HyperText Markup Language) es esencialmente HTML4 reformulado siguiendo las reglas de XML: etiquetas en minúsculas, atributos con comillas, elementos cerrados correctamente.",
        "subject": "Lenguaje de Marcas",
    },
    {
        "text": "¿Cuál de las siguientes NO es una característica de un documento XML bien formado?",
        "option_a": "Tener un único elemento raíz",
        "option_b": "Los atributos deben tener valores entre comillas",
        "option_c": "Las etiquetas pueden solaparse (por ej. <a><b></a></b>)",
        "option_d": "Las etiquetas son sensibles a mayúsculas y minúsculas",
        "correct_answer": "c",
        "explanation": "En XML, los elementos deben estar correctamente anidados. Nunca pueden solaparse. <a><b></b></a> es correcto; <a><b></a></b> no lo es.",
        "subject": "Lenguaje de Marcas",
    },
    {
        "text": "¿Qué lenguaje se usa para transformar documentos XML en otros formatos (como HTML)?",
        "option_a": "XPath",
        "option_b": "XQuery",
        "option_c": "XSLT",
        "option_d": "DTD",
        "correct_answer": "c",
        "explanation": "XSLT (Extensible Stylesheet Language Transformations) es el lenguaje estándar para transformar documentos XML en otros formatos como HTML, texto plano u otro XML.",
        "subject": "Lenguaje de Marcas",
    },
    {
        "text": "En HTML5, ¿qué atributo hace que un campo de formulario sea obligatorio?",
        "option_a": "mandatory",
        "option_b": "obligatory",
        "option_c": "required",
        "option_d": "validate",
        "correct_answer": "c",
        "explanation": "El atributo 'required' en HTML5 indica que el campo debe ser completado por el usuario antes de enviar el formulario. Ejemplo: <input type='text' required>.",
        "subject": "Lenguaje de Marcas",
    },
]

added = 0
for q_data in HW_QUESTIONS + XML_QUESTIONS:
    exists = db.query(Question).filter(
        Question.text == q_data["text"],
        Question.subject == q_data["subject"]
    ).first()
    if not exists:
        q = Question(approved=True, **q_data)
        db.add(q)
        added += 1

db.commit()
db.close()
print(f"✅ Se insertaron {added} preguntas nuevas.")
