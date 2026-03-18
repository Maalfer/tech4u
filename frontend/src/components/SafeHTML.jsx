import DOMPurify from 'dompurify';
import React from 'react';

/**
 * Componente SafeHTML para renderizar contenido HTML de forma segura.
 * Utiliza DOMPurify con una configuración estricta para evitar ataques XSS.
 * 
 * @param {string} html - El string HTML a renderizar.
 * @param {string} className - Clases CSS opcionales para el contenedor.
 * @param {string} tag - Etiqueta del contenedor (por defecto 'div').
 */
const SafeHTML = ({ html, className = '', tag = 'div' }) => {
  if (!html) return null;

  // Configuración de DOMPurify: permitimos etiquetas básicas y seguras,
  // pero bloqueamos scripts, handlers de eventos y esquemas peligrosos.
  const sanitizedHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'code', 'pre', 'blockquote', 'img', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'title', 'class', 'style'],
    FORCE_BODY: true,
  });

  const Component = tag;

  return (
    <Component 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }} 
    />
  );
};

export default SafeHTML;
