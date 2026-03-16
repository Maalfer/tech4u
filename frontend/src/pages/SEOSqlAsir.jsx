import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Database, Code2, CheckCircle, Zap, BookOpen, Shield } from 'lucide-react';
import logoImg from '../assets/tech4u_logo.png';

const SEOSqlAsir = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    // Add JSON-LD structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Práctica de SQL para ASIR: Ejercicios de bases de datos con corrección automática',
      description: 'Ejercicios prácticos de SQL para estudiantes de ASIR. Domina SELECT, JOIN, subconsultas, DDL y DML con corrección automática en sandbox.',
      url: 'https://tech4u.academy/sql-practice-asir',
      publisher: {
        '@type': 'Organization',
        name: 'Tech4U Academy',
        logo: {
          '@type': 'ImageObject',
          url: 'https://tech4u.academy/logo.png'
        }
      },
      mainEntity: {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '¿Qué es SQL practice para ASIR?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Es una plataforma de ejercicios prácticos de SQL con corrección automática, diseñada para estudiantes de ASIR. Cubre desde consultas básicas hasta procedimientos almacenados.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Necesito instalar una base de datos?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No, todos los ejercicios funcionan en un sandbox en el navegador. Tenemos bases de datos de ejemplo pre-configuradas listas para usar.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Hay corrección automática de SQL?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sí, tu código SQL se valida automáticamente. Recibes feedback inmediato si tu consulta es correcta o necesita ajustes.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Qué temas de SQL se cubren?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'SELECT básicos, WHERE, ORDER BY, JOIN, GROUP BY, HAVING, subconsultas, vistas, DDL, DML, transacciones y procedimientos almacenados.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Puedo practicar con MySQL, PostgreSQL y SQL Server?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sí, ofrecemos ejercicios en múltiples sistemas de bases de datos incluyendo MySQL, PostgreSQL y SQL Server, los más comunes en ASIR.'
            }
          }
        ]
      }
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const sqlTopics = [
    {
      icon: Code2,
      title: 'Consultas SELECT',
      description: 'SELECT básicos, WHERE, ORDER BY, LIMIT. Extrae datos específicos de tus tablas.'
    },
    {
      icon: Database,
      title: 'Joins y Subconsultas',
      description: 'INNER JOIN, LEFT JOIN, RIGHT JOIN, CROSS JOIN. Relaciona datos de múltiples tablas.'
    },
    {
      icon: Zap,
      title: 'Agregación de Datos',
      description: 'GROUP BY, HAVING, funciones agregadas (SUM, COUNT, AVG, MAX, MIN). Analiza datos.'
    },
    {
      icon: CheckCircle,
      title: 'DDL y Creación',
      description: 'CREATE TABLE, ALTER TABLE, DROP TABLE. Define tu estructura de datos.'
    },
    {
      icon: BookOpen,
      title: 'DML y Manipulación',
      description: 'INSERT, UPDATE, DELETE. Modifica datos en tus bases de datos.'
    },
    {
      icon: Shield,
      title: 'Avanzado',
      description: 'Vistas, triggers, procedimientos almacenados, transacciones y funciones SQL.'
    }
  ];

  const features = [
    {
      title: 'Sandbox Integrado',
      description: 'Ejecuta SQL directamente en el navegador sin instalar nada. Bases de datos pre-configuradas y listas para usar.'
    },
    {
      title: 'Corrección Automática',
      description: 'Cada consulta SQL se valida automáticamente. Sabrás inmediatamente si es correcta o qué necesita corregirse.'
    },
    {
      title: 'Múltiples Bases de Datos',
      description: 'Practica con MySQL, PostgreSQL y SQL Server. Entiende las diferencias sintácticas entre motores.'
    },
    {
      title: 'Ejercicios Progresivos',
      description: 'Desde SELECT básicos hasta procedimientos almacenados. Aumenta la dificultad gradualmente.'
    },
    {
      title: 'Historial y Resúmenes',
      description: 'Acceso a tus consultas anteriores, ejecuciones exitosas y métricas de aprendizaje.'
    },
    {
      title: 'Monitoreo Docente',
      description: 'Docentes pueden asignar ejercicios específicos y ver el progreso de cada estudiante en tiempo real.'
    }
  ];

  const faqs = [
    {
      question: '¿Qué es SQL practice para ASIR?',
      answer: 'SQL practice es una plataforma educativa especializada en ejercicios prácticos de SQL para estudiantes de Administración de Sistemas Informáticos en Red (ASIR). Ofrece un sandbox donde puedes escribir, ejecutar y corregir consultas SQL sin instalar bases de datos en tu ordenador.'
    },
    {
      question: '¿Necesito instalar MySQL, PostgreSQL o SQL Server?',
      answer: 'No, absolutamente no. Todos nuestros ejercicios SQL funcionan en un sandbox dentro del navegador. Tenemos instancias de MySQL, PostgreSQL y SQL Server pre-configuradas con bases de datos de ejemplo. Solo necesitas acceder a la plataforma.'
    },
    {
      question: '¿Cómo funciona la corrección automática de SQL?',
      answer: 'Escribes tu consulta SQL en el editor. Cuando haces clic en "Ejecutar", nuestro sistema valida: (1) Si la sintaxis es correcta, (2) Si la consulta devuelve los resultados esperados, (3) Si utiliza eficientemente los índices. Recibes feedback inmediato indicándote si tu solución es correcta o qué necesitas ajustar.'
    },
    {
      question: '¿Qué temas de SQL puedo practicar?',
      answer: 'Cubrimos todos los temas esenciales: SELECT y WHERE, ORDER BY y LIMIT, funciones de texto y fecha, INNER JOIN y LEFT/RIGHT/CROSS JOIN, subconsultas y CTEs, GROUP BY y HAVING, funciones agregadas (SUM, COUNT, AVG, MAX, MIN), CREATE TABLE y DDL, INSERT, UPDATE y DELETE, vistas, índices, triggers, procedimientos almacenados y transacciones.'
    },
    {
      question: '¿Puedo practicar con diferentes sistemas de bases de datos?',
      answer: 'Sí, es una característica clave de nuestro platform. Ofrecemos ejercicios en MySQL 8.0, PostgreSQL 13+ y SQL Server 2019+. Esto es importante en ASIR porque aprendes las diferencias sintácticas reales entre los sistemas que encontrarás en el mercado laboral.'
    },
    {
      question: '¿Cómo es el flujo típico de un ejercicio SQL?',
      answer: 'Típicamente: (1) Lees el enunciado describiendo qué consulta o modificación necesitas hacer, (2) Ves el esquema de la base de datos disponible, (3) Escribes tu código SQL en el editor, (4) Ejecutas tu código, (5) Recibes validación automática, (6) Si es correcto, pasas al siguiente ejercicio. Si hay error, revisas y reintentas sin límite.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0D0D0D]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="Tech4U Academy" className="h-8 w-8" />
            <span className="font-mono text-lg font-bold">Tech4U Academy</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/planes" className="text-sm hover:text-neon transition-colors">
              Para Educadores
            </Link>
            <Link
              to="/planes"
              className="px-4 py-2 rounded-lg bg-neon/10 border border-neon text-neon font-mono text-sm hover:bg-neon/20 transition-colors"
            >
              Empezar Gratis
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-neon text-black font-mono text-sm font-bold hover:bg-neon/90 transition-colors"
            >
              Acceder
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold font-mono mb-6 leading-tight">
            Práctica de SQL para <span className="text-neon">ASIR</span>
          </h1>
          <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
            Ejercicios de bases de datos con corrección automática. Domina SELECT, JOIN, subconsultas, DDL y DML.
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Sandbox completo en tu navegador. Practica con MySQL, PostgreSQL y SQL Server sin instalar nada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/planes"
              className="px-8 py-4 rounded-lg bg-neon text-black font-mono font-bold text-lg hover:bg-neon/90 transition-colors"
            >
              Empezar Práctica SQL
            </Link>
            <Link
              to="/plataforma-asir"
              className="px-8 py-4 rounded-lg border border-neon text-neon font-mono font-bold text-lg hover:bg-neon/10 transition-colors"
            >
              Ver más módulos ASIR
            </Link>
          </div>
        </div>
      </section>

      {/* SQL Topics Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-4 text-center">
          Temas SQL que practicarás
        </h2>
        <p className="text-gray-300 text-center mb-12 max-w-3xl mx-auto">
          Nuestros ejercicios SQL cubren desde consultas básicas hasta características avanzadas como procedimientos almacenados y triggers. Todo con validación automática.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sqlTopics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <div
                key={index}
                className="glass rounded-2xl border border-white/5 p-6 hover:border-neon/30 transition-all group"
              >
                <Icon className="w-8 h-8 text-neon mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold font-mono mb-2">{topic.title}</h3>
                <p className="text-gray-300 text-sm">{topic.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-12 text-center">
          Cómo funciona la práctica SQL
        </h2>
        <div className="space-y-6">
          <div className="glass rounded-2xl border border-white/5 p-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-neon/20 border border-neon text-neon font-mono font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold font-mono mb-2">Selecciona el tema</h3>
                <p className="text-gray-300">
                  Elige entre SELECT básicos, JOINs, subconsultas, DDL/DML o funciones avanzadas. Los ejercicios están ordenados por nivel de dificultad.
                </p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-neon/20 border border-neon text-neon font-mono font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold font-mono mb-2">Lee el enunciado</h3>
                <p className="text-gray-300">
                  Cada ejercicio especifica claramente qué consulta SQL debe ejecutar. Por ejemplo: "Obtén los clientes que compraron más de 5 artículos".
                </p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-neon/20 border border-neon text-neon font-mono font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold font-mono mb-2">Visualiza el esquema</h3>
                <p className="text-gray-300">
                  Ves el diagrama de la base de datos con todas las tablas, columnas, tipos de datos e índices disponibles.
                </p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-neon/20 border border-neon text-neon font-mono font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold font-mono mb-2">Escribe tu consulta SQL</h3>
                <p className="text-gray-300">
                  Usa el editor SQL integrado con syntax highlighting y autocompletado. Escribe tu código con seguridad en el sandbox.
                </p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-neon/20 border border-neon text-neon font-mono font-bold">
                  5
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold font-mono mb-2">Ejecuta y valida</h3>
                <p className="text-gray-300">
                  El sistema ejecuta tu SQL y valida automáticamente si es correcto. Recibes feedback inmediato y puedes reintentar indefinidamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-12 text-center">
          Ventajas de practicar SQL en Tech4U
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass rounded-2xl border border-white/5 p-6 hover:border-neon/30 transition-all"
            >
              <h3 className="text-lg font-bold text-neon font-mono mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sandbox Details */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-8 text-center">
          Sandbox SQL integrado
        </h2>
        <div className="glass rounded-2xl border border-white/5 p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-neon font-mono mb-3">Acceso directo a bases de datos</h3>
            <p className="text-gray-300">
              Nuestro sandbox incluye instancias completas de MySQL, PostgreSQL y SQL Server. Cada una con bases de datos de ejemplo pre-cargadas con datos reales para practicar consultas complejas.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-neon font-mono mb-3">Validación inteligente</h3>
            <p className="text-gray-300">
              No solo validamos si tu SQL es sintácticamente correcto. Además verificamos que: (1) Devuelva los datos esperados, (2) Use la estructura de datos eficientemente, (3) Aproveche los índices disponibles. Te enseña buenos hábitos SQL desde el inicio.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-neon font-mono mb-3">Sin riesgos</h3>
            <p className="text-gray-300">
              Cada ejercicio resetea la base de datos automáticamente. Puedes escribir DELETE FROM * sin miedo. El sandbox se reinicia limpio para el siguiente intento.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-neon font-mono mb-3">Soporte para múltiples dialectos</h3>
            <p className="text-gray-300">
              La mayoría de SQL es universal, pero hay diferencias entre MySQL, PostgreSQL y SQL Server. Nuestros ejercicios te enseñan a manejar estas variantes. Fundamental en ASIR donde trabajarás con diferentes sistemas.
            </p>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-8 text-center">
          Lo que dominarás
        </h2>
        <div className="space-y-4">
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-neon font-mono mb-2">Consultas SELECT avanzadas</h3>
            <p className="text-gray-300">
              SELECT con WHERE complejos, ORDER BY múltiple, LIMIT, OFFSET, DISTINCT. Filtrado y ordenamiento de datos.
            </p>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-neon font-mono mb-2">Uniones de tablas</h3>
            <p className="text-gray-300">
              INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, CROSS JOIN. Combina datos de múltiples tablas eficientemente.
            </p>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-neon font-mono mb-2">Agregación y agrupación</h3>
            <p className="text-gray-300">
              GROUP BY, HAVING. Funciones agregadas: SUM, COUNT, AVG, MAX, MIN. Análisis de datos por categorías.
            </p>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-neon font-mono mb-2">Subconsultas y expresiones</h3>
            <p className="text-gray-300">
              Subconsultas en SELECT, FROM y WHERE. CTEs (Common Table Expressions). Consultas anidadas complejas.
            </p>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-neon font-mono mb-2">Operaciones DDL</h3>
            <p className="text-gray-300">
              CREATE TABLE, ALTER TABLE, DROP TABLE. Define estructuras de datos. Gestión de esquemas.
            </p>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-neon font-mono mb-2">Operaciones DML</h3>
            <p className="text-gray-300">
              INSERT, UPDATE, DELETE. Manipula datos. Transacciones y control de cambios.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-12 text-center">
          Preguntas frecuentes sobre SQL ASIR
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass rounded-2xl border border-white/5 overflow-hidden hover:border-neon/30 transition-all"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 flex items-center justify-between font-mono font-bold text-left hover:bg-white/2 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-neon transition-transform ${
                    openFaqIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaqIndex === index && (
                <div className="px-6 py-4 border-t border-white/5 text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Related Resources */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-8 text-center">Otros módulos ASIR</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/plataforma-asir"
            className="glass rounded-2xl border border-white/5 p-6 hover:border-neon/50 transition-all group"
          >
            <Database className="w-8 h-8 text-neon mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-mono font-bold mb-2 group-hover:text-neon transition-colors">
              Plataforma ASIR Completa
            </h3>
            <p className="text-sm text-gray-300">
              Accede a todos los 6 módulos prácticos de ASIR en una sola plataforma.
            </p>
          </Link>
          <Link
            to="/labs-linux-asir"
            className="glass rounded-2xl border border-white/5 p-6 hover:border-neon/50 transition-all group"
          >
            <Code2 className="w-8 h-8 text-neon mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-mono font-bold mb-2 group-hover:text-neon transition-colors">
              Labs de Linux para ASIR
            </h3>
            <p className="text-sm text-gray-300">
              Practica administración de sistemas con comandos, permisos y servicios.
            </p>
          </Link>
          <Link
            to="/ciberseguridad-asir"
            className="glass rounded-2xl border border-white/5 p-6 hover:border-neon/50 transition-all group"
          >
            <Shield className="w-8 h-8 text-neon mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-mono font-bold mb-2 group-hover:text-neon transition-colors">
              Ciberseguridad ASIR
            </h3>
            <p className="text-sm text-gray-300">
              Labs de seguridad, hacking ético y análisis de vulnerabilidades.
            </p>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="glass rounded-2xl border border-neon/30 p-12">
          <h2 className="text-3xl font-bold font-mono mb-4">
            Empieza a practicar SQL hoy
          </h2>
          <p className="text-gray-300 mb-8">
            Sandbox completo en navegador. Ejercicios con corrección automática. MySQL, PostgreSQL y SQL Server.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/planes"
              className="px-8 py-4 rounded-lg bg-neon text-black font-mono font-bold hover:bg-neon/90 transition-colors"
            >
              Acceso Gratuito
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-lg border border-neon text-neon font-mono font-bold hover:bg-neon/10 transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <img src={logoImg} alt="Tech4U" className="h-6 w-6" />
                <span className="font-mono font-bold">Tech4U Academy</span>
              </Link>
              <p className="text-sm text-gray-400">
                Plataforma educativa especializada en ASIR y formación técnica.
              </p>
            </div>
            <div>
              <h4 className="font-mono font-bold mb-4 text-neon">Recursos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/plataforma-asir" className="hover:text-neon transition-colors">
                    Plataforma ASIR
                  </Link>
                </li>
                <li>
                  <Link to="/labs-linux-asir" className="hover:text-neon transition-colors">
                    Labs Linux
                  </Link>
                </li>
                <li>
                  <Link to="/ciberseguridad-asir" className="hover:text-neon transition-colors">
                    Ciberseguridad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono font-bold mb-4 text-neon">Educadores</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/planes" className="hover:text-neon transition-colors">
                    Para Docentes
                  </Link>
                </li>
                <li>
                  <Link to="/docente-planes" className="hover:text-neon transition-colors">
                    Planes y Precios
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono font-bold mb-4 text-neon">Cuenta</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/login" className="hover:text-neon transition-colors">
                    Acceder
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8">
            <p className="text-center text-sm text-gray-400">
              &copy; 2024 Tech4U Academy. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SEOSqlAsir;
