import os, sys
from seed_utils import sync_subject_questions

SUBJECT = "Fundamentos de Hardware"

QUESTIONS = [
    # --- FÁCIL (Componentes y Funciones) ---
    {
        "text": "¿Cuál es el componente conocido como el 'cerebro' del ordenador?",
        "option_a": "Memoria RAM",
        "option_b": "Disco Duro",
        "option_c": "Microprocesador (CPU)",
        "option_d": "Tarjeta Gráfica (GPU)",
        "correct_answer": "c",
        "difficulty": "easy",
        "explanation": "La CPU (Central Processing Unit) se encarga de ejecutar las instrucciones de los programas y procesar los datos."
    },
    {
        "text": "¿Qué tipo de memoria es volátil y pierde su contenido al apagar el equipo?",
        "option_a": "SSD",
        "option_b": "Disco Duro HDD",
        "option_c": "Memoria RAM",
        "option_d": "Memoria ROM",
        "correct_answer": "c",
        "difficulty": "easy",
        "explanation": "La RAM (Random Access Memory) es una memoria de acceso rápido y temporal que requiere energía para mantener la información."
    },
    {
        "text": "¿Cuál de estos es un componente de almacenamiento de estado sólido (sin partes móviles)?",
        "option_a": "HDD",
        "option_b": "Disco Flexible",
        "option_c": "SSD",
        "option_d": "Cinta Magnética",
        "correct_answer": "c",
        "difficulty": "easy",
        "explanation": "Los SSD (Solid State Drive) utilizan memoria flash, lo que los hace mucho más rápidos y resistentes que los discos mecánicos HDD."
    },
    {
        "text": "¿Qué componente conecta todos los elementos internos del ordenador?",
        "option_a": "Fuente de Alimentación",
        "option_b": "Placa Base (Motherboard)",
        "option_c": "Caja (Chasis)",
        "option_d": "Unidad Óptica",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "La placa base es el circuito principal que comunica la CPU, la RAM, el almacenamiento y las tarjetas de expansión."
    },
    {
        "text": "¿Cuál es la función de la Fuente de Alimentación (PSU)?",
        "option_a": "Almacenar archivos.",
        "option_b": "Transformar la corriente alterna del enchufe en corriente continua para los componentes.",
        "option_c": "Enfriar el procesador.",
        "option_d": "Conectar el monitor.",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "La fuente de alimentación suministra la energía necesaria con los voltajes correctos (12V, 5V, 3.3V) a cada pieza del PC."
    },
    # --- MEDIO (Especificaciones y Conectores) ---
    {
        "text": "¿Qué ranura de expansión se utiliza actualmente para conectar las tarjetas gráficas?",
        "option_a": "PCI",
        "option_b": "AGP",
        "option_c": "PCI Express (PCIe)",
        "option_d": "ISA",
        "correct_answer": "c",
        "difficulty": "medium",
        "explanation": "PCI Express es el estándar actual de alta velocidad para tarjetas gráficas, discos NVMe y otros periféricos."
    },
    {
        "text": "¿Qué significan las siglas BIOS?",
        "option_a": "Binary Input Output System",
        "option_b": "Basic Input Output System",
        "option_c": "Basic Internal Operating System",
        "option_d": "Binary Intelligent Online Setup",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "La BIOS es el firmware que realiza el test inicial (POST) y carga el sistema operativo."
    },
    {
        "text": "¿Qué medida se utiliza para indicar la velocidad de reloj de un procesador moderno?",
        "option_a": "Megabytes (MB)",
        "option_b": "Gigahertz (GHz)",
        "option_c": "Nanómetros (nm)",
        "option_d": "Terabits (Tb)",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "El GHz indica cuántos miles de millones de ciclos por segundo puede realizar el procesador."
    },
    {
        "text": "¿Cuál es el propósito de la pasta térmica?",
        "option_a": "Pegar el procesador a la placa base definitivamente.",
        "option_b": "Mejorar la transferencia de calor entre el procesador y el disipador.",
        "option_c": "Aislar la electricidad de la placa base.",
        "option_d": "Limpiar los componentes de polvo.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "La pasta térmica rellena las micro-imperfecciones de las superficies metálicas para maximizar la refrigeración."
    },
    {
        "text": "¿Qué tipo de conector se usa mayoritariamente para los discos duros y SSDs internos hoy en día?",
        "option_a": "IDE (PATA)",
        "option_b": "SATA",
        "option_c": "SCSI",
        "option_d": "USB-C",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "SATA es el estándar de conexión de cables para discos, aunque el formato M.2 lo está sustituyendo en rendimiento."
    },
    # --- DIFÍCIL (Arquitectura avanzada) ---
    {
        "text": "¿Qué es el 'Socket' de una placa base?",
        "option_a": "El conector donde se enchufa la fuente de alimentación.",
        "option_b": "El zócalo físico donde se instala el microprocesador.",
        "option_c": "La pila que mantiene la hora del sistema.",
        "option_d": "El puerto para conectar la tarjeta de red.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "Cada fabricante (Intel/AMD) usa tipos de sockets diferentes (LGA, AM4, etc.) que deben ser compatibles con el procesador."
    },
    {
        "text": "¿Qué es la memoria Caché L1, L2 y L3?",
        "option_a": "Memoria lenta pero de gran capacidad.",
        "option_b": "Memorias ultrarrápidas situadas dentro o muy cerca de la CPU para evitar esperas a la RAM.",
        "option_c": "Memoria que solo se usa para el arranque.",
        "option_d": "Un tipo de memoria que desapareció hace años.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "La jerarquía de memoria caché es vital para el rendimiento, siendo L1 la más rápida y pequeña."
    },
    {
        "text": "¿Para qué sirve un sistema RAID 1?",
        "option_a": "Para sumar la capacidad de dos discos.",
        "option_b": "Para mejorar la velocidad de lectura uniendo discos.",
        "option_c": "Para crear un espejo (mirroring) y tener redundancia de datos.",
        "option_d": "Para borrar datos de forma segura.",
        "correct_answer": "c",
        "difficulty": "hard",
        "explanation": "En RAID 1, si un disco falla, el otro tiene la copia exacta de los datos, garantizando la continuidad."
    },
    {
        "text": "¿Qué indica el 'TDP' (Thermal Design Power) de un componente?",
        "option_a": "La temperatura máxima que soporta.",
        "option_b": "La cantidad máxima de calor que el sistema de refrigeración debe ser capaz de disipar.",
        "option_c": "La velocidad del ventilador.",
        "option_d": "El voltaje de entrada.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "El TDP es una guía para elegir el disipador o fuente de alimentación adecuada según el consumo de calor."
    },
    {
        "text": "En el contexto de monitores, ¿qué es la 'Tasa de Refresco'?",
        "option_a": "El número de colores que puede mostrar.",
        "option_b": "El número de veces por segundo que se actualiza la imagen (en Hertzios).",
        "option_c": "La distancia entre píxeles.",
        "option_d": "El tiempo de respuesta del teclado.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "Una mayor tasa de refresco (60Hz, 144Hz) proporciona una experiencia visual más fluida."
    }
]

if __name__ == "__main__":
    sync_subject_questions(SUBJECT, QUESTIONS)
