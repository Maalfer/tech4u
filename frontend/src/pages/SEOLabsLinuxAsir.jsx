import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Terminal, Users, Lock, Network, FileCode, Zap, Database, Shield } from 'lucide-react';
import { useSEO, schemaFAQ, schemaOrganization } from '../hooks/useSEO';
import logoImg from '../assets/tech4u_logo.png';

const SEOLabsLinuxAsir = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useSEO({
    title: 'Labs de Linux para ASIR',
    description: 'Laboratorios prácticos de Linux para estudiantes de ASIR. Domina bash, permisos, servicios, networking y scripting en entornos virtualizados.',
    path: '/labs-linux-asir',
    type: 'article',
    schemas: [
      schemaOrganization(),
      schemaFAQ([
        {
          question: '¿Qué son los labs de Linux para ASIR?',
          answer: 'Son laboratorios prácticos virtualizados donde estudiantes de ASIR pueden practicar administración de sistemas Linux, desde comandos básicos hasta configuración avanzada de servicios.'
        },
        {
          question: '¿Necesito Linux instalado en mi ordenador?',
          answer: 'No, todos los labs funcionan en el navegador. Tenemos máquinas virtuales Linux listas para usar sin necesidad de instalación.'
        },
        {
          question: '¿Qué temas cubre la práctica de Linux?',
          answer: 'Cubrimos bash, permisos de archivos, usuarios y grupos, procesos, servicios, networking, SSH, cron jobs, scripting y administración de paquetes.'
        },
        {
          question: '¿Los ejercicios tienen corrección automática?',
          answer: 'Sí, nuestros scripts validan automáticamente si has completado correctamente cada tarea. Recibes feedback inmediato y puedes reintentar.'
        },
        {
          question: '¿Puedo practicar con Debian y Ubuntu?',
          answer: 'Sí, ofrecemos labs en múltiples distribuciones Linux incluyendo Debian, Ubuntu y Red Hat Enterprise, las más comunes en ASIR.'
        }
      ])
    ]
  });

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const labTopics = [
    {
      icon: Terminal,
      title: 'Comandos Bash',
      description: 'Domina los comandos esenciales de Linux. Aprende ls, cd, grep, sed, awk, find y mucho más.'
    },
    {
      icon: Lock,
      title: 'Usuarios y Permisos',
      description: 'Gestión de usuarios, grupos, permisos POSIX y ACL. Seguridad en el acceso a archivos y directorios.'
    },
    {
      icon: Zap,
      title: 'Procesos y Servicios',
      description: 'Control de procesos, systemd, servicios del sistema. Inicia, detén y monitorea servicios.'
    },
    {
      icon: Network,
      title: 'Configuración de Red',
      description: 'Networking en Linux: TCP/IP, interfaces de red, DNS, DHCP, rutas y firewall con iptables.'
    },
    {
      icon: FileCode,
      title: 'Scripting de Sistemas',
      description: 'Automatiza tareas con Bash scripting. Escribe scripts para backup, monitoreo y mantenimiento.'
    },
    {
      icon: Users,
      title: 'Administración Remota',
      description: 'SSH, SCP, rsync y otras herramientas para administrar servidores remotamente de forma segura.'
    }
  ];

  const features = [
    {
      title: 'Entorno Virtualizado',
      description: 'Práctica en máquinas virtuales Linux reales, accesibles directamente desde tu navegador.'
    },
    {
      title: 'Ejercicios Progresivos',
      description: 'Desde ejercicios básicos para principiantes hasta laboratorios complejos para administradores avanzados.'
    },
    {
      title: 'Validación Automática',
      description: 'Cada ejercicio se valida automáticamente. Sabrás inmediatamente si lo hiciste bien o qué debes corregir.'
    },
    {
      title: 'Múltiples Distribuciones',
      description: 'Practica en Debian, Ubuntu y Red Hat. Entiende las diferencias y adapta tus conocimientos.'
    },
    {
      title: 'Historial y Resimenes',
      description: 'Tracking automático de tu progreso. Accede a tus ejercicios anteriores y resúmenes de aprendizaje.'
    },
    {
      title: 'Soporte Docente',
      description: 'Los docentes pueden asignar labs específicos, monitorear progreso y proporcionar feedback personalizado.'
    }
  ];

  const faqs = [
    {
      question: '¿Qué son los labs de Linux para ASIR?',
      answer: 'Los labs de Linux para ASIR son laboratorios prácticos virtualizados diseñados específicamente para estudiantes de Administración de Sistemas Informáticos en Red. Ofrecen un entorno seguro donde puedes practicar comandos, configuración de usuarios, administración de servicios, networking y scripting sin riesgo de dañar un sistema real.'
    },
    {
      question: '¿Necesito tener Linux instalado en mi ordenador para practicar?',
      answer: 'No, absolutamente no. Todos nuestros labs funcionan 100% en el navegador web. Ofrecemos máquinas virtuales Linux completamente configuradas que puedes usar directamente. Solo necesitas un navegador moderno y conexión a internet.'
    },
    {
      question: '¿Qué temas y comandos de Linux puedo practicar?',
      answer: 'Cubrimos todos los temas esenciales de ASIR: comandos Bash (ls, grep, awk, sed, find), gestión de usuarios y permisos, administración de procesos y servicios, configuración de networking, scripting de sistemas, SSH remoto, cron jobs, gestión de paquetes y mucho más.'
    },
    {
      question: '¿Los ejercicios de Linux tienen corrección automática?',
      answer: 'Sí, cada ejercicio incluye validación automática. Nuestros scripts verifican si completaste correctamente la tarea solicitada. Recibes feedback inmediato: si algo no está correcto, te indicamos qué revisar. Puedes reintentar tantas veces como necesites.'
    },
    {
      question: '¿En qué distribuciones Linux puedo practicar?',
      answer: 'Ofrecemos labs en múltiples distribuciones Linux: Debian, Ubuntu (LTS y versiones recientes) y Red Hat Enterprise. Esto te permite aprender las particularidades de cada una y adaptarte a diferentes entornos laborales, que es fundamental en ASIR.'
    },
    {
      question: '¿Qué ventajas hay practicar en Tech4U vs instalar Linux?',
      answer: 'En Tech4U no necesitas instalar nada, no ocupas espacio en disco duro, practicas en entornos reales virtualizados, tienes acceso 24/7 desde cualquier dispositivo, tus ejercicios quedan guardados, y puedes resetear los labs infinitas veces sin perder datos personales. Perfecto para aprender sin preocupaciones.'
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
            Labs de Linux para <span className="text-neon">ASIR</span>
          </h1>
          <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
            Practica comandos y administración de sistemas en entornos Linux reales, virtualizados en tu navegador.
          </p>
          <p className="text-lg text-gray-400 mb-4 max-w-2xl mx-auto">
            Domina bash, permisos de archivos, servicios, networking y scripting con ejercicios progresivos y corrección automática.
          </p>
          <p className="text-sm text-gray-400 mb-8">Actualizado: 15 de enero de 2025 · 8 min de lectura</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/planes"
              className="px-8 py-4 rounded-lg bg-neon text-black font-mono font-bold text-lg hover:bg-neon/90 transition-colors"
            >
              Empezar Labs Linux
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

      {/* Lab Topics Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-4 text-center">
          Temas prácticos que cubre Linux ASIR
        </h2>
        <p className="text-gray-300 text-center mb-12 max-w-3xl mx-auto">
          Nuestros labs cubren todos los comandos y conceptos esenciales de Linux para la administración de sistemas. Desde lo básico hasta configuraciones avanzadas.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labTopics.map((topic, index) => {
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
          Cómo funcionan nuestros labs Linux
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
                  Elige entre comandos Bash, permisos, servicios, networking o scripting. Los ejercicios están organizados por nivel de dificultad.
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
                  Cada ejercicio tiene un enunciado claro describiendo qué debes hacer en la máquina virtual Linux. Ejemplo: "Crea un usuario llamado 'juan' con permisos específicos".
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
                <h3 className="text-lg font-bold font-mono mb-2">Abre la terminal virtual</h3>
                <p className="text-gray-300">
                  Accede a una terminal Linux completa dentro del navegador. Ejecuta comandos, edita archivos y configura lo que necesites.
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
                <h3 className="text-lg font-bold font-mono mb-2">Valida tu trabajo</h3>
                <p className="text-gray-300">
                  Nuestro sistema valida automáticamente si completaste correctamente la tarea. Recibes feedback inmediato sobre qué funciona y qué no.
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
                <h3 className="text-lg font-bold font-mono mb-2">Avanza al siguiente ejercicio</h3>
                <p className="text-gray-300">
                  Una vez completes correctamente, desbloquea el siguiente ejercicio. Ganas puntos y desbloqueas certificados a medida que progresas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-12 text-center">
          Ventajas de practicar Linux en Tech4U
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

      {/* What You'll Learn */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-8 text-center">
          Lo que aprenderás en labs Linux ASIR
        </h2>
        <div className="glass rounded-2xl border border-white/5 p-8">
          <h3 className="text-xl font-bold text-neon font-mono mb-6">Comandos esenciales</h3>
          <p className="text-gray-300 mb-6">
            Dominarás los 50+ comandos más importantes: ls, cd, cat, grep, sed, awk, find, locate, chmod, chown, ps, kill, systemctl, journalctl y mucho más.
          </p>

          <h3 className="text-xl font-bold text-neon font-mono mb-6">Gestión de usuarios</h3>
          <p className="text-gray-300 mb-6">
            Aprenderás a crear y gestionar usuarios y grupos, configurar sudoers, entender los archivos passwd, shadow y group, y aplicar políticas de acceso.
          </p>

          <h3 className="text-xl font-bold text-neon font-mono mb-6">Administración de servicios</h3>
          <p className="text-gray-300 mb-6">
            Mantendrás servicios con systemd, Apache, Nginx, SSH, DNS y otros servicios típicos de ASIR. Logs con journalctl y monitoreo de recursos.
          </p>

          <h3 className="text-xl font-bold text-neon font-mono mb-6">Networking</h3>
          <p className="text-gray-300 mb-6">
            Configurarás interfaces de red, TCP/IP, rutas, firewall con iptables, DNS, DHCP y entenderás protocolos fundamentales.
          </p>

          <h3 className="text-xl font-bold text-neon font-mono">Scripting y automatización</h3>
          <p className="text-gray-300">
            Escribirás scripts Bash para automatizar tareas de administración, realizar backups, monitorear sistemas y mantener servidores.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-12 text-center">
          Preguntas frecuentes sobre Linux ASIR
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
            <Terminal className="w-8 h-8 text-neon mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-mono font-bold mb-2 group-hover:text-neon transition-colors">
              Plataforma ASIR Completa
            </h3>
            <p className="text-sm text-gray-300">
              Accede a todos los 6 módulos prácticos de ASIR en una sola plataforma.
            </p>
          </Link>
          <Link
            to="/sql-practice-asir"
            className="glass rounded-2xl border border-white/5 p-6 hover:border-neon/50 transition-all group"
          >
            <Database className="w-8 h-8 text-neon mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-mono font-bold mb-2 group-hover:text-neon transition-colors">
              Práctica de SQL
            </h3>
            <p className="text-sm text-gray-300">
              Ejercicios de SQL con corrección automática para ASIR.
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
            Empieza a practicar Linux hoy
          </h2>
          <p className="text-gray-300 mb-8">
            Acceso completo a todos los labs de Linux sin instalar nada. Práctica inmediata en tu navegador.
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

      {/* Internal Links */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-mono mb-8 text-center">También te puede interesar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/plataforma-asir"
            className="glass rounded-2xl border border-white/5 p-6 hover:border-neon/50 transition-all group"
          >
            <Terminal className="w-8 h-8 text-neon mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-mono font-bold mb-2 group-hover:text-neon transition-colors">
              Plataforma ASIR Completa
            </h3>
            <p className="text-sm text-gray-300">
              Accede a todos los 6 módulos prácticos de ASIR en una sola plataforma.
            </p>
          </Link>
          <Link
            to="/sql-practice-asir"
            className="glass rounded-2xl border border-white/5 p-6 hover:border-neon/50 transition-all group"
          >
            <Database className="w-8 h-8 text-neon mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-mono font-bold mb-2 group-hover:text-neon transition-colors">
              SQL para ASIR
            </h3>
            <p className="text-sm text-gray-300">
              Ejercicios de SQL con corrección automática para ASIR.
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

export default SEOLabsLinuxAsir;
