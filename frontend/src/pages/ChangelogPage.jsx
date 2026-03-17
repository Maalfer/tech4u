import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import logoImg from '../assets/tech4u_logo.png';
import { useSEO } from '../hooks/useSEO';

const CHANGELOG_ENTRIES = [
    {
        date: 'Marzo 2025',
        badge: 'Contenido',
        badgeColor: '#00ff64',
        title: 'Ciberseguridad ya disponible: 40 preguntas, 5 guías y SkillLabs',
        description: 'Añadimos el subject de Ciberseguridad completo. 40 preguntas de test (malware, OWASP, criptografía), 5 guías técnicas completas y ejercicios de SkillLabs sobre Nmap, iptables y más.',
    },
    {
        date: 'Febrero 2025',
        badge: 'Labs',
        badgeColor: '#3b82f6',
        title: '21 nuevos escenarios de NetLabs: OSPF, BGP, IPv6 y más',
        description: 'Ampliamos el simulador de Cisco IOS con 7 módulos nuevos: OSPF multiárea, BGP básico, IPv6, Port Security, DHCP Snooping, EtherChannel y Troubleshooting sistemático.',
    },
    {
        date: 'Febrero 2025',
        badge: 'SQL',
        badgeColor: '#8b5cf6',
        title: '3 nuevos datasets SQL: Instituto, Hospital y Red Social',
        description: 'Añadimos el Dataset Instituto (ciclos FP, alumnos, notas), Hospital (pacientes, médicos, prescripciones) y Red Social (posts, likes, followers). Cada uno con ejercicios nombrados y progresivos.',
    },
    {
        date: 'Enero 2025',
        badge: 'Herramientas',
        badgeColor: '#f59e0b',
        title: '6 nuevas herramientas: VLSM, IPv6, Regex, Hash, DNS y Cron Builder',
        description: 'La sección Herramientas estrena 6 calculadoras y utilidades nuevas para ASIR y FP Informática.',
    },
    {
        date: 'Enero 2025',
        badge: 'WinLabs',
        badgeColor: '#06b6d4',
        title: 'PowerShell avanzado, NPS/RADIUS y Acceso Remoto en WinLabs',
        description: '4 nuevos módulos en Windows Server Labs: PowerShell AD automation, NPS con autenticación 802.1X, RRAS VPN, RD Gateway y VSS/Backup.',
    },
    {
        date: 'Diciembre 2024',
        badge: 'Plataforma',
        badgeColor: '#ef4444',
        title: 'Recuperación de contraseña, cookie consent y seguridad mejorada',
        description: 'Implementamos el flujo completo de recuperación de contraseña por email, banner GDPR/LSSI, cabeceras de seguridad HTTP y animaciones de confeti en logros.',
    },
];

export default function ChangelogPage() {
    const navigate = useNavigate();

    useSEO({
        title: 'Novedades y Actualizaciones — Tech4U Academy',
        description: 'Entérate de todas las nuevas características, contenidos y mejoras que añadimos a Tech4U Academy.',
        path: '/novedades',
    });

    return (
        <div className="min-h-screen overflow-x-hidden text-white" style={{ background: '#050510', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* ── STYLES ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;700&display=swap');

                * { box-sizing: border-box; }

                .t4-heading {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    line-height: 0.95;
                }
                .t4-mono {
                    font-family: 'IBM Plex Mono', monospace;
                }
                .t4-grad {
                    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.65) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .t4-neon-grad {
                    background: linear-gradient(135deg, #00ff64 0%, #00d4aa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .anim-0 { animation: fade-up 0.6s ease both; }
                .anim-1 { animation: fade-up 0.6s 0.1s ease both; }
                .anim-2 { animation: fade-up 0.6s 0.2s ease both; }
            `}</style>

            {/* ── FIXED BACKGROUND ── */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', inset: 0, background: '#050510' }} />

                {/* Orb — neon green, top-left */}
                <div style={{
                    position: 'absolute', top: '-100px', left: '-80px',
                    width: '600px', height: '600px',
                    background: 'radial-gradient(circle, rgba(0,255,100,0.12) 0%, transparent 65%)',
                    filter: 'blur(30px)',
                }} />

                {/* Orb — indigo, top-right */}
                <div style={{
                    position: 'absolute', top: '5%', right: '-100px',
                    width: '550px', height: '550px',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)',
                    filter: 'blur(30px)',
                }} />

                {/* Dot grid */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                    opacity: 0.15,
                    maskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black 30%, transparent 100%)',
                }} />

                {/* Subtle vignette */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse 90% 60% at 50% 0%, transparent 0%, rgba(5,5,16,0.7) 100%)',
                }} />
            </div>

            {/* ── NAVBAR ── */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(5,5,16,0.7)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Left: logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <img src={logoImg} alt="Tech4U" style={{ height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(0,255,100,0.3))' }} />
                        <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Novedades</span>
                    </div>

                    {/* Right: back link */}
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.4)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            padding: '7px 14px',
                            borderRadius: '8px',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent' }}
                    >
                        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Volver
                    </button>
                </div>
            </header>

            {/* ── MAIN CONTENT ── */}
            <main style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '80px 24px' }}>

                {/* Header */}
                <div className="anim-0" style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h1 className="t4-heading" style={{ fontSize: 'clamp(36px, 5vw, 56px)', marginBottom: '16px' }}>
                        <span className="t4-grad">Novedades y</span><br />
                        <span className="t4-neon-grad">Actualizaciones</span>
                    </h1>
                    <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
                        Todo lo que añadimos a Tech4U Academy — nuevos contenidos, laboratorios, herramientas y mejoras de la plataforma.
                    </p>
                </div>

                {/* Timeline */}
                <div style={{ position: 'relative' }}>
                    {/* Vertical line */}
                    <div style={{
                        position: 'absolute',
                        left: '16px',
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        background: 'linear-gradient(180deg, rgba(0,255,100,0.3) 0%, rgba(0,255,100,0.05) 100%)',
                    }} />

                    {/* Entries */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                        {CHANGELOG_ENTRIES.map((entry, idx) => (
                            <div
                                key={idx}
                                className={`anim-${Math.min(idx, 2)}`}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '60px 1fr',
                                    gap: '24px',
                                    alignItems: 'flex-start',
                                }}
                            >
                                {/* Left — dot and badge */}
                                <div style={{ position: 'relative', paddingTop: '4px' }}>
                                    {/* Dot */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '8px',
                                        top: '8px',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: entry.badgeColor,
                                        border: '3px solid #050510',
                                        boxShadow: `0 0 16px ${entry.badgeColor}60`,
                                        zIndex: 10,
                                    }} />
                                </div>

                                {/* Right — content */}
                                <div style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                                    borderLeft: `3px solid ${entry.badgeColor}`,
                                    transition: 'all 0.3s ease',
                                    cursor: 'default',
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = entry.badgeColor;
                                        e.currentTarget.style.background = 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 100%)';
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                                        e.currentTarget.style.background = 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    {/* Top row — date + badge */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '12px' }}>
                                        <span className="t4-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                            {entry.date}
                                        </span>
                                        <span style={{
                                            fontSize: '8px',
                                            fontWeight: 700,
                                            letterSpacing: '0.15em',
                                            textTransform: 'uppercase',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            background: `${entry.badgeColor}15`,
                                            border: `1px solid ${entry.badgeColor}35`,
                                            color: entry.badgeColor,
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {entry.badge}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="t4-heading" style={{ fontSize: '18px', marginBottom: '10px', color: '#fff', lineHeight: 1.3 }}>
                                        {entry.title}
                                    </h3>

                                    {/* Description */}
                                    <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>
                                        {entry.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA at bottom */}
                <div className="anim-2" style={{ marginTop: '80px', textAlign: 'center', paddingTop: '48px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                        ¿Tienes alguna sugerencia para la plataforma?
                    </p>
                    <a
                        href="mailto:feedback@tech4u.academy"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: '#000',
                            textDecoration: 'none',
                            padding: '12px 24px',
                            background: '#00ff64',
                            borderRadius: '10px',
                            transition: 'all 0.2s',
                            boxShadow: '0 0 20px rgba(0,255,100,0.3)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,100,0.5)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,100,0.3)'}
                    >
                        <MessageCircle style={{ width: '14px', height: '14px' }} /> Escríbenos tus ideas
                    </a>
                </div>
            </main>
        </div>
    );
}
