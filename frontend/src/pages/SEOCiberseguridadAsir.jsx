import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Shield, Lock, Network, Zap, Eye, Code2 } from 'lucide-react';
import logoImg from '../assets/tech4u_logo.png';

const SEOCiberseguridadAsir = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    // Add JSON-LD structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Ciberseguridad para ASIR: Laboratorios de hacking ético y seguridad informática',
      description: 'Labs prácticos de ciberseguridad para ASIR. Domina hacking ético, OSINT, análisis de vulnerabilidades, seguridad de redes y CTF challenges.',
      url: 'https://tech4u.academy/ciberseguridad-asir',
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
            name: '¿Qué son los labs de ciberseguridad para ASIR?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Son laboratorios prácticos especializados en ciberseguridad, hacking ético y vulnerabilidades. Diseñados para estudiantes de ASIR con escenarios reales virtualizados.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Es legal practicar hacking ético?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sí, hacking ético es totalmente legal cuando se practica en entornos autorizados como nuestros labs virtualizados. Aprendes técnicas reales de forma segura.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Qué herramientas de seguridad usaré?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Nmap, Metasploit, Wireshark, Burp Suite, SQLmap, John the Ripper y otras herramientas profesionales de ciberseguridad.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Necesito conocimientos previos en seguridad?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No, nuestros labs van desde principiante hasta avanzado. Empezamos con conceptos básicos y escalamos progresivamente en dificultad.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Hay desafíos tipo CTF?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sí, incluimos desafíos tipo Capture The Flag (CTF) donde debes encontrar flags ocultas en máquinas vulnerables para aprender penetration testing.'
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

  const securityTopics = [
    {
      icon: Eye,
      title: 'OSINT',
      description: 'Open Source Intelligence. Recopila información pública sobre objetivos, dominios y organizaciones.'
    },
    {
      icon: Network,
      title: 'Análisis de Red',
      description: 'Escaneo con Nmap, análisis de tráfico con Wireshark, enumeración de servicios.'
    },
    {
      icon: Lock,
      title: 'Cracking de Contraseñas',
      description: 'Técnicas de fuerza bruta, diccionarios y ataques de contraseñas con herramientas profesionales.'
    },
    {
      icon: Code2,
      title: 'Inyecciones y Exploits',
      description: 'SQL injection, XSS, RFI/LFI, ataques web. Identifica y explota vulnerabilidades comunes.'
    },
    {
      icon: Zap,
      title: 'Penetration Testing',
      description: 'Metasploit, payload generation, post-exploitation. Auditoría completa de seguridad.'
    },
    {
      icon: Shield,
      title: 'Defensa y Hardening',
      description: 'Securización de sistemas, firewall, IDS/IPS, detección de intrusiones.'
    }
  ];

  const features = [
    {
      title: 'Máquinas Vulnerables',
      description: 'Máquinas virtuales propositadamente vulnerables para explotar de forma legal y segura.'
    },
    {
      title: 'Herramientas Profesionales',
      description: 'Acceso a Metasploit, Burp Suite, Nmap, Wireshark y otras herramientas de penetration testing.'
    },
    {
      title: 'Escenarios Realistas',
      description: 'Situaciones que encontrarás en auditorías reales de seguridad y pentests profesionales.'
    },
    {
      title: 'Ejercicios Progresivos',
      description: 'Desde identificación de vulnerabilidades hasta explotación completa de sistemas.'
    },
    {
      title: 'Certificación CTF',
      description: 'Demuestra tus habilidades completando desafíos Capture The Flag y obtén certificados.'
    },
    {
      title: 'Monitoreo Educador',
      description: 'Docentes pueden asignar labs, monitorear progreso y evaluar habilidades de seguridad.'
    }
  ];

  const faqs = [
    {
      question: '¿Qué son los labs de ciberseguridad para ASIR?',
      answer: 'Los labs de ciberseguridad para ASIR son laboratorios prácticos virtualizados donde estudiantes aprenden hacking ético, penetration testing y seguridad informática. Incluyen máquinas vulnerables legales, herramientas profesionales de seguridad y escenarios realistas de auditoría. Todo en entornos completamente controlados y autorizados.'
    },
    {
      question: '¿Es legal practicar hacking ético en estos labs?',
      answer: 'Completamente legal. Hacking ético es legal cuando se practica con autorización sobre sistemas que son tuyos o donde tienes permiso. Nuestros labs son máquinas virtuales que tú controlas, así que puedes explorarlas, vulnerarlas e intentar romper la seguridad sin problemas legales. Esta es la forma correcta de aprender seguridad ofensiva.'
    },
    {
      question: '¿Qué herramientas de ciberseguridad usaré?',
      answer: 'Utilizarás herramientas profesionales estándar en pentesting: Nmap para escaneo de redes, Metasploit para generación de exploits, Burp Suite para análisis web, Wireshark para análisis de tráfico, John the Ripper y Hashcat para cracking, SQLmap para inyecciones SQL, y muchas más. Todas están disponibles en nuestros labs.'
    },
    {
      question: '¿Necesito conocimientos previos en ciberseguridad?',
      answer: 'No, nuestros labs están diseñados para principiantes. Comenzamos con conceptos básicos de seguridad, introducción a herramientas y vulnerabilidades simples. Progresivamente aumentamos la dificultad hasta escenarios complejos de pentesting. Cualquier estudiante de ASIR puede comenzar sin experiencia previa.'
    },
    {
      question: '¿Hay desafíos tipo Capture The Flag (CTF)?',
      answer: 'Sí, incluimos desafíos CTF donde debes encontrar "flags" (códigos) ocultos en máquinas vulnerables. Es una forma gamificada y motivadora de aprender pentesting. Completa máquinas, gana puntos, desbloquea certificados y demuestra tus habilidades de seguridad.'
    },
    {
      question: '¿Cuál es la diferencia entre ofensivo y defensivo?',
      answer: 'Nuestros labs cubren ambos aspectos. OFENSIVO: aprendes a identificar vulnerabilidades y explotar sistemas (pentesting). DEFENSIVO: aprendes a hardening, firewall, IDS/IPS y detección de intrusiones. Entender el lado ofensivo te ayuda a defender mejor. Es la filosofía de "conoce al enemigo".'
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
            Ciberseguridad para <span className="text-neon">ASIR</span>
          </h1>
          <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
            Laboratorios de hacking ético y seguridad informática. Aprende pentesting, análisis de vulnerabilidades y hardening de sistemas.
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Herramientas profesionales, máquinas vulnerables y desafíos CTF. Todo dentro de tu navegador de forma legal y segura.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/planes"
              className="px-8 py-4 rounded-lg bg-neon text-black font-mono font-bold text-lg hover:bg-neon/90 transition-colors"
            >
              Empezar Labs Seguridad
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

      {/* Security Topics */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-4 text-center">
          Temas de seguridad que aprenderás
        </h2>
        <p className="text-gray-300 text-center mb-12 max-w-3xl mx-auto">
          Nuestros labs cubren seguridad ofensiva y defensiva. Desde reconocimiento hasta explotación, y desde hardening hasta detección de intrusiones.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityTopics.map((topic, index) => {
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

      {/* How Labs Work */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-12 text-center">
          Cómo funcionan los labs de ciberseguridad
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
                <h3 className="text-lg font-bold font-mono mb-2">Selecciona el objetivo</h3>
                <p className="text-gray-300">
                  Elige entre OSINT, análisis de red, cracking, inyecciones web o penetration testing completo. Labs organizados por dificultad.
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
                <h3 className="text-lg font-bold font-mono mb-2">Recibe la máquina vulnerable</h3>
                <p className="text-gray-300">
                  Se despliega una máquina virtual Linux con vulnerabilidades reales. Tu objetivo es explorarla, encontrar fallos y obtener acceso.
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
                <h3 className="text-lg font-bold font-mono mb-2">Accede a herramientas de pentesting</h3>
                <p className="text-gray-300">
                  Tenemos Metasploit, Burp Suite, Nmap, Wireshark y otras herramientas disponibles en nuestro entorno. Realiza reconocimiento y análisis.
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
                <h3 className="text-lg font-bold font-mono mb-2">Explota vulnerabilidades</h3>
                <p className="text-gray-300">
                  Identifica la vulnerabilidad, desarrolla o ejecuta el exploit, obtén acceso remoto (shell) y escala privilegios si es necesario.
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
                <h3 className="text-lg font-bold font-mono mb-2">Captura flags y documentación</h3>
                <p className="text-gray-300">
                  Busca flags de usuario y root, documenta el flujo de ataque, aprende la lecciónde seguridad y demuestra competencia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-8 text-center">
          Lo que dominarás en ciberseguridad
        </h2>
        <div className="space-y-6">
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-neon font-mono mb-3">Reconocimiento y OSINT</h3>
            <p className="text-gray-300">
              Recopila información pública de objetivos, sitios, dominios y organizaciones. Identifica direcciones IP, empleados, tecnologías y vectores de ataque potenciales.
            </p>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-neon font-mono mb-3">Enumeración y Escaneo</h3>
            <p className="text-gray-300">
              Usa Nmap para identificar puertos abiertos, servicios y versiones. Mapea la arquitectura de red, identifica máquinas y descubre oportunidades.
            </p>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-neon font-mono mb-3">Explotación de Vulnerabilidades</h3>
            <p className="text-gray-300">
              Domina técnicas como inyección SQL, XSS, RFI/LFI. Utiliza Metasploit para exploits de kernel. Obtén reverse shells y acceso remoto.
            </p>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-neon font-mono mb-3">Post-Explotación</h3>
            <p className="text-gray-300">
              Escalada de privilegios, lateral movement, instalación de backdoors. Mantén acceso persistente y busca información sensible en el sistema.
            </p>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-neon font-mono mb-3">Cracking y Fuerza Bruta</h3>
            <p className="text-gray-300">
              Usa John the Ripper y Hashcat para crackear contraseñas. Ataca servicios con fuerza bruta. Entiende hashing, salts y mejores prácticas.
            </p>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-neon font-mono mb-3">Seguridad Defensiva</h3>
            <p className="text-gray-300">
              Hardening de sistemas, configuración de firewall, IDS/IPS, detección de intrusiones. Aprende a defender basándote en el conocimiento ofensivo.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-12 text-center">
          Ventajas de practicar seguridad en Tech4U
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

      {/* CTF Details */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-8 text-center">
          Desafíos Capture The Flag (CTF)
        </h2>
        <div className="glass rounded-2xl border border-white/5 p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-neon font-mono mb-3">¿Qué es un CTF?</h3>
            <p className="text-gray-300">
              Un Capture The Flag es un desafío de seguridad donde explotas vulnerabilidades en una máquina y buscas "flags" (códigos especiales). Encontrar flags significa que completaste con éxito la explotación y probaste tu habilidad de pentesting.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-neon font-mono mb-3">Flujo típico de CTF</h3>
            <p className="text-gray-300 mb-4">
              1. Recibes una máquina vulnerable. 2. Realizas reconocimiento e identificas el vector de ataque. 3. Ejecutas el exploit. 4. Ganas acceso (generalmente cuenta de usuario). 5. Buscas la flag de usuario. 6. Escalas privilegios a root. 7. Buscas la flag de root. 8. Documentas el flujo de ataque completo.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-neon font-mono mb-3">Beneficios educativos</h3>
            <p className="text-gray-300">
              Los CTFs son la forma más efectiva de aprender penetration testing porque: (1) Simulan escenarios reales de auditoría, (2) Te obligan a resolver problemas creativamente, (3) Aprendendes a usar múltiples herramientas en conjunto, (4) Obtienes feedback inmediato (flags), (5) Son motivadores y gamificados, (6) Construyen confianza en tus habilidades.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-12 text-center">
          Preguntas frecuentes sobre ciberseguridad
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
            <Shield className="w-8 h-8 text-neon mb-3 group-hover:scale-110 transition-transform" />
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
            to="/sql-practice-asir"
            className="glass rounded-2xl border border-white/5 p-6 hover:border-neon/50 transition-all group"
          >
            <Database className="w-8 h-8 text-neon mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-mono font-bold mb-2 group-hover:text-neon transition-colors">
              Práctica de SQL para ASIR
            </h3>
            <p className="text-sm text-gray-300">
              Ejercicios de SQL con corrección automática para ASIR.
            </p>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="glass rounded-2xl border border-neon/30 p-12">
          <h2 className="text-3xl font-bold font-mono mb-4">
            Empieza a practicar ciberseguridad hoy
          </h2>
          <p className="text-gray-300 mb-8">
            Herramientas profesionales, máquinas vulnerables y desafíos CTF. Aprende hacking ético de forma legal y segura.
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
                  <Link to="/sql-practice-asir" className="hover:text-neon transition-colors">
                    Práctica SQL
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

export default SEOCiberseguridadAsir;
