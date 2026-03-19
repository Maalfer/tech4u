import os, sys
from seed_utils import sync_subject_questions

SUBJECT = "Programación"

QUESTIONS = [
    # --- FÁCIL (Conceptos y Lógica) ---
    {
        "text": "¿Qué es una variable?",
        "option_a": "Un tipo de monitor.",
        "option_b": "Un espacio en memoria para almacenar un dato que puede cambiar durante la ejecución.",
        "option_c": "Una función estéticamente agradable.",
        "option_d": "Un error del compilador.",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "Las variables son fundamentales en programación para guardar información de diversos tipos (int, string, bool...)."
    },
    {
        "text": "¿Cuál es la función del operador recíproco '%' (Módulo)?",
        "option_a": "Calcular porcentajes.",
        "option_b": "Obtener el resto de una división entera.",
        "option_c": "Dividir dos números flotantes.",
        "option_d": "Multiplicar por 100.",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "Por ejemplo, 10 % 3 devuelve 1, que es el resto de la división."
    },
    {
        "text": "¿Qué estructura de control se usa para repetir un bloque de código un número determinado de veces?",
        "option_a": "if / else",
        "option_b": "for",
        "option_c": "switch",
        "option_d": "try / catch",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "El bucle 'for' es el estándar para iteraciones con un rango o contador conocido de antemano."
    },
    {
        "text": "¿Qué significa POO (o OOP en inglés)?",
        "option_a": "Programación Orientada a Objetos",
        "option_b": "Procesamiento Operativo Online",
        "option_c": "Programación Ordenada y Óptima",
        "option_d": "Paquete de Operaciones Originales",
        "correct_answer": "a",
        "difficulty": "easy",
        "explanation": "La POO es el paradigma dominante basado en la creación de 'clases' y sus instancias llamadas 'objetos'."
    },
    {
        "text": "¿Qué lenguaje de programación es ampliamente usado para el desarrollo de Inteligencia Artificial y Ciencia de Datos?",
        "option_a": "HTML",
        "option_b": "Python",
        "option_c": "C++",
        "option_d": "PHP",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "Python es el lenguaje líder gracias a su sintaxis limpia y potentes librerías como NumPy, Pandas y TensorFlow."
    },
    # --- MEDIO (POO y Estructuras) ---
    {
        "text": "En POO, ¿qué es la 'Herencia'?",
        "option_a": "El dinero que deja un programador al retirarse.",
        "option_b": "La capacidad de una clase de derivar de otra, adquiriendo sus atributos y métodos.",
        "option_c": "La copia de archivos de un servidor a otro.",
        "option_d": "Un tipo de variable global.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "La herencia permite la reutilización de código mediante la creación de jerarquías de clases (ej. Coche hereda de Vehículo)."
    },
    {
        "text": "¿Qué es el 'Encapsulamiento'?",
        "option_a": "Manejar errores de red.",
        "option_b": "Ocultar los detalles internos de un objeto y permitir el acceso solo a través de métodos públicos.",
        "option_c": "Meter el código en un archivo comprimido .zip.",
        "option_d": "Comentar excesivamente el código.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "Se logra mediante modificadores de acceso como private, protected y public."
    },
    {
        "text": "¿Cuál es la diferencia principal entre un Array y una Lista Enlazada?",
        "option_a": "No hay diferencia.",
        "option_b": "El Array tiene acceso aleatorio rápido; la Lista Enlazada es eficiente para inserciones y borrados.",
        "option_c": "Una Lista Enlazada solo puede guardar caracteres.",
        "option_d": "Un Array es siempre más pequeño físicamente.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "En un Array las posiciones son contiguas en memoria; en una lista los nodos apuntan al siguiente."
    },
    {
        "text": "¿Qué es una función recursiva?",
        "option_a": "Una función que usa muchos recursos de CPU.",
        "option_b": "Una función que se llama a sí misma para resolver sub-problemas más pequeños.",
        "option_c": "Una función que solo puede ser usada una vez.",
        "option_d": "Una función importada de una librería externa.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "La recursividad es común para resolver problemas como el cálculo del factorial o el recorrido de árboles."
    },
    {
        "text": "¿Qué es un 'objeto' en programación?",
        "option_a": "Un archivo de texto.",
        "option_b": "Una instancia específica creada a partir de una plantilla llamada clase.",
        "option_c": "Una función matemática compleja.",
        "option_d": "El hardware físico (monitor, ratón).",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "Si 'Coche' es la clase (el plano), el coche rojo aparcado fuera es el objeto (la instancia)."
    },
    # --- DIFÍCIL (Algoritmia y Avanzado) ---
    {
        "text": "¿Qué es la complejidad algorítmica Big O?",
        "option_a": "El tamaño del archivo de código fuente.",
        "option_b": "La medida del tiempo de ejecución o espacio en memoria que requiere un algoritmo según el tamaño de la entrada.",
        "option_c": "El número de líneas de comentarios por función.",
        "option_d": "Un lenguaje de programación secreto.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "Big O nos ayuda a predecir cómo escalará un algoritmo (ej. O(1), O(n), O(n²))."
    },
    {
        "text": "¿Qué es el Polimorfismo?",
        "option_a": "La capacidad de un objeto de tomar muchas formas dependiendo del contexto (normalmente mediante interfaces).",
        "option_b": "Un error que ocurre cuando el código tiene muchas líneas.",
        "option_c": "Traducir el código a varios idiomas automáticamente.",
        "option_d": "Tener muchas copias de la base de datos.",
        "correct_answer": "a",
        "difficulty": "hard",
        "explanation": "Permite que diferentes objetos respondan al mismo mensaje o método de manera distinta (ej. un perro ladra y un gato maúlla al llamar al método 'hablar()')."
    },
    {
        "text": "¿Qué es un 'Puntero' (Pointer)?",
        "option_a": "El cursor del ratón.",
        "option_b": "Una variable que almacena la dirección de memoria de otra variable.",
        "option_c": "Un tipo de dato para números muy grandes.",
        "option_d": "Un error de sintaxis en Python.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "Fundamental en lenguajes como C y C++ para una gestión directa y eficiente de la memoria."
    },
    {
        "text": "¿Para qué sirve el patrón de diseño 'Singleton'?",
        "option_a": "Para crear miles de objetos iguales rápidamente.",
        "option_b": "Para garantizar que una clase tenga solo una instancia y proporcionar un punto de acceso global a ella.",
        "option_c": "Para que el programa corra en un solo hilo (Single Thread).",
        "option_d": "Para que el código solo tenga una línea.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "Es útil para gestores de logs, conexiones a DB o configuraciones globales del sistema."
    },
    {
        "text": "¿Qué es 'Git'?",
        "option_a": "Un lenguaje de programación.",
        "option_b": "Un sistema de control de versiones distribuido para rastrear cambios en el código fuente.",
        "option_c": "Un servidor web como Apache.",
        "option_d": "Un tipo de base de datos NoSQL.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "Git permite trabajar en equipo, crear ramas (branches) y revertir cambios de forma segura."
    }
]

if __name__ == "__main__":
    sync_subject_questions(SUBJECT, QUESTIONS)
