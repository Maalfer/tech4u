import os, sys
from seed_utils import sync_subject_questions

SUBJECT = "Lenguaje de Marcas"

QUESTIONS = [
    # --- FÁCIL (HTML y Estructura) ---
    {
        "text": "¿Qué significa HTML?",
        "option_a": "Hyper Text Markup Language",
        "option_b": "High Technical Modern Language",
        "option_c": "Hyper Transfer Markup Language",
        "option_d": "Home Tool Markup Language",
        "correct_answer": "a",
        "difficulty": "easy",
        "explanation": "HTML es el lenguaje de marcado estándar para la creación de páginas web."
    },
    {
        "text": "¿Cuál es la etiqueta correcta para el título más importante de una página?",
        "option_a": "<head>",
        "option_b": "<h6>",
        "option_c": "<h1>",
        "option_d": "<title>",
        "correct_answer": "c",
        "difficulty": "easy",
        "explanation": "La etiqueta <h1> define el encabezado de mayor nivel jerárquico y es vital para el SEO."
    },
    {
        "text": "¿Qué etiqueta se usa para crear un enlace (vínculo)?",
        "option_a": "<link>",
        "option_b": "<a>",
        "option_c": "<href>",
        "option_d": "<url>",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "La etiqueta <a> (anchor) junto con el atributo 'href' se utiliza para navegar entre páginas."
    },
    {
        "text": "¿Cuál de estos es un formato de intercambio de datos basado en texto ligero y fácil de leer?",
        "option_a": "HTML",
        "option_b": "JSON",
        "option_c": "JPEG",
        "option_d": "MP4",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "JSON (JavaScript Object Notation) es el estándar 'de facto' para el intercambio de datos en APIs modernas por su ligereza."
    },
    {
        "text": "¿Qué etiqueta HTML se usa para insertar una imagen?",
        "option_a": "<picture>",
        "option_b": "<img>",
        "option_c": "<src>",
        "option_d": "<figure>",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "La etiqueta <img> requiere el atributo 'src' para indicar la ruta de la imagen."
    },
    # --- MEDIO (CSS y XML) ---
    {
        "text": "¿Qué significa CSS?",
        "option_a": "Computer Style Sheets",
        "option_b": "Cascading Style Sheets",
        "option_c": "Creative Style Systems",
        "option_d": "Colorful Style Sheets",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "CSS permite separar el contenido (HTML) de la presentación visual de la web."
    },
    {
        "text": "¿Cómo se selecciona un elemento con un id específico en CSS?",
        "option_a": ".nombre-id",
        "option_b": "#nombre-id",
        "option_c": "*nombre-id",
        "option_d": "@nombre-id",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "El selector de ID utiliza el símbolo de almohadilla (#), mientras que el punto (.) es para clases."
    },
    {
        "text": "¿Cuál es la principal diferencia entre XML y HTML?",
        "option_a": "HTML es más nuevo.",
        "option_b": "XML fue diseñado para transportar y almacenar datos, mientras que HTML para mostrarlos.",
        "option_c": "XML solo funciona en servidores Linux.",
        "option_d": "No hay diferencias, son el mismo lenguaje.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "XML permite definir etiquetas personalizadas para estructurar información de forma semántica."
    },
    {
        "text": "¿Qué propiedad CSS se usa para cambiar el color de fondo?",
        "option_a": "color",
        "option_b": "background-color",
        "option_c": "bgcolor",
        "option_d": "fill-color",
        "correct_answer": "b",
        "difficulty": "easy",
        "explanation": "'color' cambia el texto, mientras que 'background-color' afecta al fondo del elemento."
    },
    {
        "text": "En el modelo de caja de CSS (Box Model), ¿qué es el 'padding'?",
        "option_a": "El espacio entre el borde y el contenido del elemento.",
        "option_b": "El espacio exterior entre el borde y otros elementos.",
        "option_c": "El grosor del borde.",
        "option_d": "La sombra del elemento.",
        "correct_answer": "a",
        "difficulty": "medium",
        "explanation": "Padding es el relleno interno; Margin es el espacio externo."
    },
    # --- DIFÍCIL (Avanzado y Estándares) ---
    {
        "text": "¿Qué es el DOM (Document Object Model)?",
        "option_a": "Una base de datos para guardar webs.",
        "option_b": "Una interfaz de programación que representa el documento HTML como una estructura de árbol.",
        "option_c": "Un servidor de nombres de dominio.",
        "option_d": "Un lenguaje de programación alternativo a JavaScript.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "El DOM permite que lenguajes como JavaScript accedan y manipulen dinámicamente el contenido y estilo de la página."
    },
    {
        "text": "¿Para qué sirve un DTD (Document Type Definition) en XML?",
        "option_a": "Para definir el diseño visual del XML.",
        "option_b": "Para definir la estructura legal y los elementos permitidos dentro del documento XML.",
        "option_c": "Para convertir XML a PDF.",
        "option_d": "Para encriptar el archivo.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "El DTD valida que el documento XML siga unas reglas específicas de jerarquía y tipos de datos."
    },
    {
        "text": "¿Qué es la 'Especificidad' en CSS?",
        "option_a": "La velocidad de carga de los estilos.",
        "option_b": "El peso o jerarquía que determina qué regla se aplica cuando hay conflictos entre selectores.",
        "option_c": "Un tipo de fuente especial.",
        "option_d": "La compatibilidad con navegadores antiguos.",
        "correct_answer": "b",
        "difficulty": "hard",
        "explanation": "Un selector de ID tiene más especificidad que una clase, y esta más que un selector de etiqueta."
    },
    {
        "text": "¿Cuál es el propósito del atributo 'alt' en una etiqueta <img>?",
        "option_a": "Definir el tamaño de la imagen.",
        "option_b": "Ofrecer un texto alternativo por accesibilidad y por si la imagen no carga.",
        "option_c": "Poner un marco a la foto.",
        "option_d": "Hacer que la imagen sea un enlace.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "Es fundamental para lectores de pantalla usados por personas con discapacidad visual y para el SEO de imágenes."
    },
    {
        "text": "¿Qué es 'Flexbox' en CSS?",
        "option_a": "Una base de datos de estilos.",
        "option_b": "Un modelo de diseño unidimensional para distribuir espacio entre elementos en una interfaz.",
        "option_c": "Una librería externa como Bootstrap.",
        "option_d": "Un tipo de animación 3D.",
        "correct_answer": "b",
        "difficulty": "medium",
        "explanation": "Flexbox facilita enormemente la creación de layouts alineados y centrados de forma responsiva."
    }
]

if __name__ == "__main__":
    sync_subject_questions(SUBJECT, QUESTIONS)
