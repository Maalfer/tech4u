import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Code2, Database, Shield, Network, BookOpen, Zap } from 'lucide-react';
import logoImg from '../assets/tech4u_logo.png';

const SEOAsirPage = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    // Add JSON-LD structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Plataforma de prácticas para ASIR | Tech4U Academy',
      description: 'Plataforma educativa especializada en ASIR con labs de Linux, SQL, ciberseguridad y más. Aprende administración de sistemas informáticos en red con ejercicios prácticos.',
      url: 'https://tech4u.academy/plataforma-asir',
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
            name: '¿Qué es la plataforma ASIR de Tech4U?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Es una plataforma educativa especializada en Administración de Sistemas Informáticos en Red con módulos prácticos de Linux, SQL, ciberseguridad, redes, scripting y más.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Cuántos módulos de práctica incluye?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'La plataforma incluye 6 módulos principales: Labs de Linux, Práctica de SQL, Ciberseguridad, Configuración de Redes, Scripting Avanzado y Administración de Servicios.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Puedo practicar sin descargar nada?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sí, todos nuestros labs funcionan directamente en el navegador. No necesitas instalar software adicional en tu ordenador.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Hay corrección automática de ejercicios?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sí, disponemos de corrección automática en SQL y scripting. Para otros módulos, recibes feedback detallado de nuestros correctores.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Cuántos estudiantes usan Tech4U para ASIR?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Miles de estudiantes de ASIR en España utilizan Tech4U para mejorar sus habilidades prácticas y prepararse para el mercado laboral.'
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

  const modules = [
    {
      icon: Code2,
      title: 'Labs de Linux',
      description: 'Practica administración de sistemas con comandos, permisos, servicios y configuración de redes en entornos reales.'
    },
    {
      icon: Database,
      title: 'Práctica de SQL',
      description: 'Ejercicios de bases de datos con corrección automática. Domina SELECT, JOIN, subqueries, DDL y DML.'
    },
    {
      icon: Shield,
      title: 'Ciberseguridad',
      description: 'Labs de hacking ético, escaneo de vulnerabilidades y configuración segura de sistemas.'
    },
    {
      icon: Network,
      title: 'Redes',
      description: 'Configuración de routers, switches, protocolos TCP/IP y arquitectura de redes empresariales.'
    },
    {
      icon: Zap,
      title: 'Scripting Avanzado',
      description: 'Automatización con Bash, Python y PowerShell. Crea scripts profesionales para administración.'
    },
    {
      icon: BookOpen,
      title: 'Administración de Servicios',
      description: 'Instalación y configuración de Apache, Nginx, DNS, DHCP, FTP y otros servicios críticos.'
    }
  ];

  const faqs = [
    {
      question: '¿Qué es la plataforma ASIR de Tech4U?',
      answer: 'Tech4U Academy es una plataforma educativa especializada en Administración de Sistemas Informáticos en Red (ASIR). Ofrecemos un entorno práctico completo donde estudiantes de ASIR pueden practicar todas las habilidades requeridas en el ciclo formativo, desde administración básica de Linux hasta ciberseguridad avanzada.'
    },
    {
      question: '¿Cuántos módulos de práctica incluye la plataforma ASIR?',
      answer: 'Nuestra plataforma ASIR incluye 6 módulos principales: Labs de Linux, Práctica de SQL, Ciberseguridad, Configuración de Redes, Scripting Avanzado y Administración de Servicios. Cada módulo contiene decenas de ejercicios prácticos adaptados al currículum de ASIR.'
    },
    {
      question: '¿Puedo practicar sin descargar ni instalar software?',
      answer: 'Sí, una de las ventajas principales de Tech4U es que todos nuestros labs funcionan 100% en el navegador. No necesitas instalar Linux, bases de datos o herramientas de seguridad. Todo está virtualizado y accesible desde cualquier dispositivo con navegador web.'
    },
    {
      question: '¿Hay corrección automática en los ejercicios?',
      answer: 'Sí, implementamos corrección automática en módulos de SQL y scripting. Para labs de configuración de sistemas, recibes feedback detallado sobre si has completado correctamente las tareas propuestas. Además, docentes pueden monitorear el progreso de sus estudiantes.'
    },
    {
      question: '¿Cuántos estudiantes de ASIR usan Tech4U?',
      answer: 'Miles de estudiantes de ciclos ASIR en toda España utilizan Tech4U para complementar su formación presencial. Muchos centros educativos han integrado nuestra plataforma como herramienta oficial de prácticas, permitiendo que sus estudiantes practiquen desde casa con ejercicios reales.'
    },
    {
      question: '¿Cómo puedo acceder a la plataforma ASIR?',
      answer: 'Puedes crear una cuenta gratuita en Tech4U Academy. Los docentes pueden crear aulas virtuales y asignar ejercicios específicos a sus estudiantes. También ofrecemos planes premium con características adicionales como reportes detallados y acceso a labs avanzados.'
    }
  ];

  const features = [
    {
      title: 'Ambiente Virtualizado',
      description: 'Práctica en entornos Linux reales, servidores de bases de datos y laboratorios de seguridad sin afectar tu máquina local.'
    },
    {
      title: 'Ejercicios Actualizados',
      description: 'Contenido constantemente actualizado según los cambios en tecnologías y tendencias de seguridad informática.'
    },
    {
      title: 'Corrección Automática',
      description: 'Obtén feedback inmediato en ejercicios de SQL y scripting con validación automática de soluciones.'
    },
    {
      title: 'Seguimiento de Progreso',
      description: 'Docentes pueden monitorear el avance individual de cada estudiante y asignar ejercicios personalizados.'
    },
    {
      title: 'Acceso 24/7',
      description: 'Estudia cuando quieras desde cualquier lugar. Sin límites de sesiones ni horarios restrictivos.'
    },
    {
      title: 'Comunidad Activa',
      description: 'Interactúa con otros estudiantes de ASIR, comparte soluciones y aprende de la comunidad.'
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
            Plataforma de prácticas para <span className="text-neon">ASIR</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Domina Administración de Sistemas Informáticos en Red con labs prácticos de Linux, SQL, ciberseguridad y más. Aprende con ejercicios reales en tu navegador.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/planes"
              className="px-8 py-4 rounded-lg bg-neon text-black font-mono font-bold text-lg hover:bg-neon/90 transition-colors"
            >
              Empezar Prácticas ASIR
            </Link>
            <Link
              to="/docente-planes"
              className="px-8 py-4 rounded-lg border border-neon text-neon font-mono font-bold text-lg hover:bg-neon/10 transition-colors"
            >
              Ver Planes para Docentes
            </Link>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-4 text-center">
          Los 6 Módulos Principales para ASIR
        </h2>
        <p className="text-gray-300 text-center mb-12 max-w-3xl mx-auto">
          Nuestra plataforma cubre todos los temas esenciales del ciclo formativo de Administración de Sistemas Informáticos en Red. Cada módulo incluye decenas de ejercicios prácticos progresivos.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <div
                key={index}
                className="glass rounded-2xl border border-white/5 p-6 hover:border-neon/30 transition-all group"
              >
                <Icon className="w-8 h-8 text-neon mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold font-mono mb-2">{module.title}</h3>
                <p className="text-gray-300 text-sm">{module.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-12 text-center">
          Por qué elegir Tech4U para ASIR
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

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-12 text-center">
          Cómo funciona para estudiantes ASIR
        </h2>
        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-neon/20 border border-neon text-neon font-mono font-bold">
                1
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono mb-2">Crea tu cuenta gratuita</h3>
              <p className="text-gray-300">
                Accede con tu email y comienza a practicar inmediatamente. No se requiere tarjeta de crédito.
              </p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-neon/20 border border-neon text-neon font-mono font-bold">
                2
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono mb-2">Elige el módulo que desees</h3>
              <p className="text-gray-300">
                Selecciona entre Labs de Linux, SQL, Ciberseguridad, Redes, Scripting o Administración de Servicios.
              </p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-neon/20 border border-neon text-neon font-mono font-bold">
                3
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono mb-2">Realiza ejercicios progresivos</h3>
              <p className="text-gray-300">
                Práctica con ejercicios que van desde básico a avanzado, con enunciados claros y feedback detallado.
              </p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-neon/20 border border-neon text-neon font-mono font-bold">
                4
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono mb-2">Obtén corrección automática</h3>
              <p className="text-gray-300">
                En SQL y scripting, tu código se valida automáticamente. Aprende de los errores y mejora al instante.
              </p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-neon/20 border border-neon text-neon font-mono font-bold">
                5
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono mb-2">Mejora tus habilidades</h3>
              <p className="text-gray-300">
                Completa ejercicios, acumula puntos y desbloquea certificados que puedes mostrar en tu perfil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-12 text-center">
          Preguntas frecuentes sobre ASIR
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

      {/* Related Resources Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-8 text-center">Recursos relacionados</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/labs-linux-asir"
            className="glass rounded-2xl border border-white/5 p-6 hover:border-neon/50 transition-all group"
          >
            <Code2 className="w-8 h-8 text-neon mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-mono font-bold mb-2 group-hover:text-neon transition-colors">
              Labs de Linux para ASIR
            </h3>
            <p className="text-sm text-gray-300">
              Practica comandos, administración de usuarios y servicios en entornos reales.
            </p>
          </Link>
          <Link
            to="/sql-practice-asir"
            className="glass rounded-2xl border border-white/5 p-6 hover:border-neon/50 transition-all group"
          >
            <Database className="w-8 h-8 text-neon mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-mono font-bold mb-2 group-hover:text-neon transition-colors">
              Práctica de SQL para ASIR
            </h3>
            <p className="text-sm text-gray-300">
              Domina consultas SQL, joins y administración de bases de datos.
            </p>
          </Link>
          <Link
            to="/ciberseguridad-asir"
            className="glass rounded-2xl border border-white/5 p-6 hover:border-neon/50 transition-all group"
          >
            <Shield className="w-8 h-8 text-neon mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-mono font-bold mb-2 group-hover:text-neon transition-colors">
              Ciberseguridad para ASIR
            </h3>
            <p className="text-sm text-gray-300">
              Labs de hacking ético, análisis de vulnerabilidades y seguridad de sistemas.
            </p>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="glass rounded-2xl border border-neon/30 p-12">
          <h2 className="text-3xl font-bold font-mono mb-4">
            Empieza tu aprendizaje en ASIR hoy mismo
          </h2>
          <p className="text-gray-300 mb-8">
            Acceso gratuito a ejercicios prácticos. Sin necesidad de instalar nada. Disponible 24/7.
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
                  <Link to="/labs-linux-asir" className="hover:text-neon transition-colors">
                    Labs Linux
                  </Link>
                </li>
                <li>
                  <Link to="/sql-practice-asir" className="hover:text-neon transition-colors">
                    Práctica SQL
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

export default SEOAsirPage;
