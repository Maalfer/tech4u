import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronDown, Mail, MessageCircle, BookOpen, CreditCard, Terminal, User } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'

// ── FAQ DATA ────────────────────────────────────────────────────────────────
const FAQ_CATEGORIES = [
    {
        id: 'general',
        label: 'General',
        icon: BookOpen,
        color: '#00ff64',
        items: [
            {
                q: '¿Qué es Tech4U Academy?',
                a: 'Tech4U Academy es una plataforma de formación interactiva diseñada específicamente para estudiantes de ASIR y SMR. Combina teoría estructurada, laboratorios de práctica real, ejercicios SQL interactivos, tests de examen y un sistema de gamificación con XP, rankings y logros. En el futuro tenemos previsto ampliar el contenido a otros ciclos como DAW y DAM.'
            },
            {
                q: '¿Para quién está pensada?',
                a: 'Principalmente para alumnos de ASIR y SMR que quieren complementar sus clases con práctica real. También es útil para docentes que quieran recomendar recursos adicionales, y para profesionales que quieran repasar conceptos de redes, Linux y ciberseguridad.'
            },
            {
                q: '¿Necesito conocimientos previos para empezar?',
                a: 'No. El contenido está organizado de forma progresiva desde cero. Puedes empezar sin saber nada de Linux o redes: los primeros módulos introducen los conceptos básicos antes de avanzar hacia temas más complejos.'
            },
            {
                q: '¿Puedo probar la plataforma antes de suscribirme?',
                a: 'Puedes crear una cuenta gratuita y explorar la interfaz: ver el catálogo completo de asignaturas, el roadmap de contenidos y las secciones de la plataforma. El acceso a laboratorios, lecciones, tests, ejercicios SQL, Battle Arena y el resto del contenido requiere suscripción Premium.'
            },
            {
                q: '¿Tech4U Academy funciona en móvil o tablet?',
                a: 'Sí. La plataforma es totalmente responsive y funciona en cualquier dispositivo. Además, es una PWA (Progressive Web App): puedes instalarla en tu móvil desde el navegador para acceder como una app nativa sin pasar por la App Store.'
            },
            {
                q: '¿Necesito instalar algún programa?',
                a: 'No. Todo funciona directamente en el navegador: los laboratorios de Linux, el editor SQL, los tests y las herramientas de red. Solo necesitas una conexión a internet.'
            },
        ]
    },
    {
        id: 'planes',
        label: 'Planes y Precios',
        icon: CreditCard,
        color: '#a78bfa',
        items: [
            {
                q: '¿Cuánto cuesta Tech4U Academy?',
                a: 'Tenemos tres planes: Mensual (9,99€/mes), Trimestral (24,99€ cada 3 meses, ahorro del 17%) y Anual (79,99€/año, ahorro del 33%). Todos dan acceso completo a la plataforma sin límites de contenido.'
            },
            {
                q: '¿Qué incluye la suscripción Premium?',
                a: 'Todo: teoría completa de todas las asignaturas, laboratorios de Linux con terminal interactivo, SQL Skills Path con más de 40 ejercicios progresivos, NetLabs de redes, WinLabs de Windows Server, flashcards con repetición espaciada, simulacros de examen cronometrados, Battle Arena PvP, ranking ASIR, logros y más.'
            },
            {
                q: '¿Hay permanencia o compromiso de tiempo?',
                a: 'No. Puedes cancelar en cualquier momento desde tu panel de suscripción. Tu acceso Premium se mantiene hasta el final del período ya pagado.'
            },
            {
                q: '¿Puedo cambiar de plan mensual a anual (o viceversa)?',
                a: 'Para cambiar de plan, cancela tu suscripción actual desde "Gestionar suscripción" y suscríbete al nuevo plan. Tu acceso Premium se mantiene activo hasta el final del período ya pagado. No realizamos cambios automáticos de plan ni prorratas.'
            },
            {
                q: '¿Aceptáis pago con PayPal?',
                a: 'Sí. Aceptamos pagos con tarjeta de crédito/débito a través de Stripe y también con PayPal. Ambos métodos son seguros y no almacenamos datos de tu tarjeta en nuestros servidores.'
            },
            {
                q: '¿Hay descuentos para estudiantes o centros educativos?',
                a: 'Tenemos planes especiales para centros educativos con licencias de grupo. Si eres docente o diriges un instituto, escríbenos a info@tech4uacademy.es y te preparamos una propuesta personalizada.'
            },
            {
                q: '¿Tenéis política de devolución?',
                a: 'Las devoluciones se gestionan de forma individual y manual. Si has tenido algún problema con tu suscripción, escríbenos a info@tech4uacademy.es con el asunto "Devolución" y lo valoramos caso por caso. Consulta la sección 13 de nuestras Condiciones Generales de Venta para conocer las condiciones legales de desistimiento aplicables a contenido digital.'
            },
            {
                q: '¿Cómo funciona el sistema de referidos?',
                a: 'Al compartir tu código de referido con un amigo, cuando ese amigo complete su primera suscripción recibes un cupón del 10% de descuento para tu próxima renovación. Por cada 10 referidos confirmados, consigues un mes gratis.'
            },
        ]
    },
    {
        id: 'contenido',
        label: 'Contenido y Labs',
        icon: Terminal,
        color: '#38bdf8',
        items: [
            {
                q: '¿Qué asignaturas están disponibles?',
                a: 'Actualmente cubrimos: Sistemas Operativos (Linux y Windows Server), Redes (fundamentos, subnetting, VLANs, enrutamiento), Bases de Datos (SQL desde cero hasta consultas avanzadas), Seguridad Informática, Servicios en Red, y el curso completo de preparación para el certificado eJPTv2 (hacking ético).'
            },
            {
                q: '¿El contenido sirve también para SMR?',
                a: 'Sí. Aunque el foco principal es ASIR, la mayoría de las asignaturas de primer curso (Sistemas Operativos, Redes, Seguridad, Bases de Datos) son compartidas con SMR. Puedes usar la plataforma perfectamente como alumno de SMR.'
            },
            {
                q: '¿Qué son los laboratorios de Linux?',
                a: 'Son terminales Linux reales ejecutándose en contenedores Docker en nuestros servidores. Recibes un reto, te conectas a la máquina virtual y lo resuelves en tiempo real. No simula comandos: ejecutas Linux de verdad, igual que en un examen o en el trabajo.'
            },
            {
                q: '¿Qué es el SQL Skills Path?',
                a: 'Es un camino de aprendizaje de SQL estructurado en niveles. Cada nivel introduce nuevos conceptos (SELECT, WHERE, JOIN, GROUP BY, subconsultas...) y te plantea ejercicios que debes resolver escribiendo SQL real contra una base de datos en vivo. El sistema evalúa automáticamente si tu solución es correcta.'
            },
            {
                q: '¿Qué es el eJPTv2 y cómo me ayuda Tech4U?',
                a: 'El eJPTv2 (Junior Penetration Tester) es una certificación de hacking ético de nivel inicial de eLearnSecurity. Es el certificado de entrada al mundo de la ciberseguridad más reconocido en España para FP. Estamos trabajando en un curso completo de preparación con teoría, laboratorios de pentesting y simulacros del examen. ¡Estará disponible próximamente!'
            },
            {
                q: '¿Con qué frecuencia se actualiza el contenido?',
                a: 'Publicamos nuevo contenido regularmente: nuevos laboratorios, ejercicios SQL, preguntas de test y guías teóricas. Puedes ver todos los cambios en la sección "Novedades" (changelog público) de la plataforma.'
            },
            {
                q: '¿Hay certificados al completar los cursos?',
                a: 'Sí. Al completar el SQL Skills Path completo obtienes un certificado descargable en PDF. Estamos trabajando en ampliar los certificados a más rutas de aprendizaje durante 2025-2026.'
            },
            {
                q: '¿Qué es la Battle Arena?',
                a: 'Es el modo PvP (jugador contra jugador) de Tech4U. Dos alumnos compiten en tiempo real respondiendo preguntas de test sobre la misma asignatura. Gana el que más respuestas correctas acumule antes de que acabe el tiempo. Es una forma divertida de repasar con compañeros.'
            },
        ]
    },
    {
        id: 'cuenta',
        label: 'Cuenta y Soporte',
        icon: User,
        color: '#fb923c',
        items: [
            {
                q: '¿Cómo cancelo mi suscripción?',
                a: 'Desde tu perfil → "Gestionar suscripción" → "Cancelar suscripción". La cancelación es inmediata y sin penalización. Seguirás teniendo acceso Premium hasta el final del período ya pagado.'
            },
            {
                q: '¿Cómo funciona el XP y el sistema de niveles?',
                a: 'Ganas XP completando tests, laboratorios, ejercicios SQL y otros retos. Al acumular suficiente XP subes de nivel (hay 10 niveles desde Nivel 1 hasta "Leyenda"). El nivel afecta a tu posición en el ranking ASIR y desbloquea nuevos logros y cosméticos para tu perfil.'
            },
            {
                q: '¿Puedo recuperar mi contraseña si la olvido?',
                a: 'Sí. En la pantalla de login haz clic en "¿Olvidaste tu contraseña?" e introduce tu email. Recibirás un enlace de recuperación válido durante 15 minutos.'
            },
            {
                q: '¿Puedo registrarme con Google?',
                a: 'Sí. En la pantalla de registro/login tienes el botón de Google para acceder directamente con tu cuenta de Google, sin necesidad de crear una contraseña nueva.'
            },
            {
                q: '¿Qué hago si tengo un problema técnico o una duda?',
                a: 'Escríbenos a info@tech4uacademy.es con una descripción del problema. Respondemos habitualmente en menos de 24 horas en días laborables. También puedes unirte a nuestro Discord donde la comunidad y el equipo estamos activos.'
            },
            {
                q: '¿Mis datos están seguros?',
                a: 'Sí. La plataforma cumple con el RGPD y la LOPD-GDD. Tus datos no se comparten con terceros ni se usan con fines publicitarios. Puedes consultar nuestra Política de Privacidad completa para más detalles. Las contraseñas se almacenan con hash bcrypt y nunca en texto plano.'
            },
        ]
    },
]

// ── FAQ ITEM (acordeón individual) ──────────────────────────────────────────
function FAQItem({ question, answer, accentColor, isOpen, onToggle }) {
    return (
        <div
            onClick={onToggle}
            style={{
                borderRadius: '14px',
                border: `1px solid ${isOpen ? `${accentColor}30` : 'rgba(255,255,255,0.06)'}`,
                background: isOpen ? `${accentColor}08` : 'rgba(255,255,255,0.02)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
            }}
        >
            <div style={{
                padding: '18px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
            }}>
                <span style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isOpen ? '#fff' : 'rgba(255,255,255,0.75)',
                    lineHeight: 1.4,
                    flex: 1,
                }}>
                    {question}
                </span>
                <ChevronDown
                    style={{
                        width: '16px',
                        height: '16px',
                        color: isOpen ? accentColor : 'rgba(255,255,255,0.25)',
                        flexShrink: 0,
                        transition: 'transform 0.25s, color 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                />
            </div>
            {isOpen && (
                <div style={{
                    padding: '0 20px 18px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                    <p style={{
                        paddingTop: '14px',
                        margin: 0,
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.8,
                    }}>
                        {answer}
                    </p>
                </div>
            )}
        </div>
    )
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('general')
    const [search, setSearch] = useState('')
    const [openIndex, setOpenIndex] = useState(null)

    useSEO({
        title: 'Preguntas Frecuentes — Tech4U Academy',
        description: 'Resuelve todas tus dudas sobre Tech4U Academy: planes, contenido, laboratorios, pagos, certificados y soporte técnico.',
        path: '/faq',
    })

    const currentCategory = FAQ_CATEGORIES.find(c => c.id === activeCategory)

    // Cuando hay búsqueda activa, busca en todas las categorías
    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return currentCategory?.items || []
        return FAQ_CATEGORIES.flatMap(cat =>
            cat.items
                .filter(item =>
                    item.q.toLowerCase().includes(q) ||
                    item.a.toLowerCase().includes(q)
                )
                .map(item => ({ ...item, _catColor: cat.color, _catLabel: cat.label }))
        )
    }, [search, currentCategory])

    const totalQuestions = FAQ_CATEGORIES.reduce((acc, c) => acc + c.items.length, 0)

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050510',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#fff',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
                .faq-cat-btn { transition: all 0.2s; }
                .faq-cat-btn:hover { opacity: 1 !important; }
                .faq-search-input:focus { outline: none; border-color: rgba(0,255,100,0.4) !important; background: rgba(255,255,255,0.04) !important; }
                .faq-back-link { transition: color 0.2s; }
                .faq-back-link:hover { color: #00ff64 !important; }
            `}</style>

            {/* ── NAV ── */}
            <nav style={{
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '16px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                maxWidth: '1000px',
                margin: '0 auto',
            }}>
                <Link to="/" className="faq-back-link" style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.3)',
                    textDecoration: 'none',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                }}>
                    ← tech4uacademy.es
                </Link>
                <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '12px' }}>/</span>
                <span style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.05em',
                }}>
                    faq
                </span>
            </nav>

            {/* ── HERO ── */}
            <header style={{
                maxWidth: '1000px',
                margin: '0 auto',
                padding: '64px 32px 48px',
                textAlign: 'center',
            }}>
                {/* Badge */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(0,255,100,0.07)',
                    border: '1px solid rgba(0,255,100,0.2)',
                    borderRadius: '20px',
                    padding: '5px 14px',
                    marginBottom: '24px',
                }}>
                    <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#00ff64' }}>
                        {totalQuestions} preguntas respondidas
                    </span>
                </div>

                <h1 style={{
                    fontSize: 'clamp(32px, 5vw, 52px)',
                    fontWeight: 900,
                    lineHeight: 1.05,
                    letterSpacing: '-0.03em',
                    marginBottom: '16px',
                }}>
                    ¿Tienes alguna{' '}
                    <span style={{
                        background: 'linear-gradient(135deg, #00ff64, #00d4aa)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        duda?
                    </span>
                </h1>
                <p style={{
                    fontSize: '15px',
                    color: 'rgba(255,255,255,0.4)',
                    maxWidth: '520px',
                    margin: '0 auto 36px',
                    lineHeight: 1.7,
                }}>
                    Todo lo que necesitas saber sobre Tech4U Academy. Si no encuentras tu respuesta, escríbenos directamente.
                </p>

                {/* Search */}
                <div style={{ position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
                    <Search style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        color: 'rgba(255,255,255,0.25)',
                        pointerEvents: 'none',
                    }} />
                    <input
                        type="text"
                        className="faq-search-input"
                        placeholder="Buscar en las preguntas frecuentes..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setOpenIndex(null) }}
                        style={{
                            width: '100%',
                            padding: '14px 16px 14px 44px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '14px',
                            color: '#fff',
                            fontSize: '13px',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s, background 0.2s',
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255,255,255,0.3)',
                                cursor: 'pointer',
                                fontSize: '18px',
                                lineHeight: 1,
                                padding: '4px',
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
            </header>

            {/* ── BODY ── */}
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 32px 80px' }}>

                {/* Category tabs — solo cuando no hay búsqueda */}
                {!search && (
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        marginBottom: '32px',
                    }}>
                        {FAQ_CATEGORIES.map(cat => {
                            const Icon = cat.icon
                            const isActive = activeCategory === cat.id
                            return (
                                <button
                                    key={cat.id}
                                    className="faq-cat-btn"
                                    onClick={() => { setActiveCategory(cat.id); setOpenIndex(null) }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '7px',
                                        padding: '9px 18px',
                                        borderRadius: '12px',
                                        border: `1px solid ${isActive ? `${cat.color}50` : 'rgba(255,255,255,0.07)'}`,
                                        background: isActive ? `${cat.color}12` : 'rgba(255,255,255,0.02)',
                                        color: isActive ? cat.color : 'rgba(255,255,255,0.4)',
                                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        opacity: isActive ? 1 : 0.75,
                                    }}
                                >
                                    <Icon style={{ width: '13px', height: '13px' }} />
                                    {cat.label}
                                    <span style={{
                                        background: isActive ? `${cat.color}25` : 'rgba(255,255,255,0.06)',
                                        color: isActive ? cat.color : 'rgba(255,255,255,0.3)',
                                        borderRadius: '8px',
                                        padding: '1px 7px',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                    }}>
                                        {cat.items.length}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Resultados de búsqueda */}
                {search && (
                    <p style={{
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.25)',
                        marginBottom: '20px',
                        letterSpacing: '0.05em',
                    }}>
                        {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''} para "{search}"
                    </p>
                )}

                {/* Lista de preguntas */}
                {filteredItems.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {filteredItems.map((item, idx) => {
                            const color = item._catColor || currentCategory?.color || '#00ff64'
                            return (
                                <FAQItem
                                    key={`${idx}-${item.q}`}
                                    question={item.q}
                                    answer={item.a}
                                    accentColor={color}
                                    isOpen={openIndex === idx}
                                    onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                                />
                            )
                        })}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '64px 24px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '20px',
                        background: 'rgba(255,255,255,0.01)',
                    }}>
                        <p style={{ fontSize: '32px', marginBottom: '16px' }}>🔍</p>
                        <p style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.6)',
                            marginBottom: '8px',
                        }}>
                            Sin resultados para "{search}"
                        </p>
                        <p style={{
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.3)',
                            marginBottom: '24px',
                        }}>
                            Prueba con otras palabras o escríbenos directamente.
                        </p>
                        <button
                            onClick={() => setSearch('')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.04)',
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'Plus Jakarta Sans, sans-serif',
                            }}
                        >
                            Limpiar búsqueda
                        </button>
                    </div>
                )}

                {/* ── CTA DE CONTACTO ── */}
                <div style={{
                    marginTop: '64px',
                    padding: '40px',
                    borderRadius: '24px',
                    border: '1px solid rgba(0,255,100,0.12)',
                    background: 'rgba(0,255,100,0.03)',
                    textAlign: 'center',
                }}>
                    <p style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#00ff64',
                        marginBottom: '12px',
                        opacity: 0.7,
                    }}>
                        ¿No encontraste lo que buscabas?
                    </p>
                    <h2 style={{
                        fontSize: 'clamp(20px, 3vw, 28px)',
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        marginBottom: '10px',
                    }}>
                        Escríbenos directamente
                    </h2>
                    <p style={{
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.4)',
                        maxWidth: '400px',
                        margin: '0 auto 28px',
                        lineHeight: 1.7,
                    }}>
                        Respondemos en menos de 24 horas en días laborables. También puedes unirte a nuestra comunidad en Discord.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a
                            href="mailto:info@tech4uacademy.es?subject=Consulta"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                background: '#00ff64',
                                color: '#000',
                                fontFamily: 'Plus Jakarta Sans, sans-serif',
                                fontSize: '12px',
                                fontWeight: 800,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                textDecoration: 'none',
                            }}
                        >
                            <Mail style={{ width: '14px', height: '14px' }} />
                            Enviar email
                        </a>
                        <a
                            href="https://discord.gg/tech4u"
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.04)',
                                color: 'rgba(255,255,255,0.6)',
                                fontFamily: 'Plus Jakarta Sans, sans-serif',
                                fontSize: '12px',
                                fontWeight: 800,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                textDecoration: 'none',
                            }}
                        >
                            <MessageCircle style={{ width: '14px', height: '14px' }} />
                            Discord
                        </a>
                    </div>
                </div>
            </main>

            {/* ── MINI FOOTER ── */}
            <footer style={{
                borderTop: '1px solid rgba(255,255,255,0.04)',
                padding: '20px 32px',
                maxWidth: '1000px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
            }}>
                <span style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.15)',
                    letterSpacing: '0.05em',
                }}>
                    © {new Date().getFullYear()} Tech4U Academy · Alberto Hidalgo Moreno
                </span>
                <div style={{ display: 'flex', gap: '16px' }}>
                    {[['Privacidad', '/privacidad'], ['Cookies', '/cookies'], ['Términos', '/terminos'], ['Aviso Legal', '/aviso-legal']].map(([label, href]) => (
                        <Link
                            key={href}
                            to={href}
                            style={{
                                fontFamily: 'IBM Plex Mono, monospace',
                                fontSize: '10px',
                                color: 'rgba(255,255,255,0.2)',
                                textDecoration: 'none',
                                letterSpacing: '0.05em',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            </footer>
        </div>
    )
}
