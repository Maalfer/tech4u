import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Shield, Zap, Terminal, Globe, Database, MessageCircle,
    Code2, Cpu, Lock, Star, FlaskConical, Gift,
    Network, Mail, Server, ArrowRight, ChevronRight,
    Check, Rocket, Sparkles, Flame, BarChart3, BookOpen
} from 'lucide-react'
import brandCombinedImg from '../assets/tech4u_logo.png'
import PricingCards from '../components/PricingCards'
import { useSEO, schemaOrganization, schemaFAQ } from '../hooks/useSEO'

// ─── DATA ──────────────────────────────────────────────────────────────────────
const SUBJECTS = [
    { icon: Database,  label: 'Bases de Datos',      color: '#8b5cf6', desc: 'SQL, ERD, normalización' },
    { icon: Globe,     label: 'Redes & Protocolos',   color: '#0ea5e9', desc: 'TCP/IP, VLANs, routing' },
    { icon: Shield,    label: 'Sistemas Operativos',  color: '#10b981', desc: 'Linux, servicios, procesos' },
    { icon: Cpu,       label: 'Hardware',             color: '#f97316', desc: 'Arquitectura, RAID, buses' },
    { icon: Code2,     label: 'Lenguaje de Marcas',   color: '#06b6d4', desc: 'HTML5, XML, CSS' },
    { icon: Terminal,  label: 'Ciberseguridad',       color: '#ef4444', desc: 'Próximamente', soon: true },
]

const BENTO = [
    {
        id: 'testcenter',
        size: 'large',
        icon: FlaskConical,
        title: 'Test Center v4.0',
        desc: 'Simulacros con 850+ preguntas reales, modo Error-Review y análisis de rendimiento por asignatura.',
        color: '#00ff64',
        tag: 'Core',
        visual: 'test',
    },
    {
        id: 'sql',
        size: 'medium',
        icon: Database,
        title: 'SQL Skills',
        desc: 'Editor SQL interactivo. Escribe, completa huecos, detecta errores y resuelve consultas inversas.',
        color: '#8b5cf6',
        tag: 'Laboratorio',
        visual: 'sql',
    },
    {
        id: 'terminal',
        size: 'medium',
        icon: Terminal,
        title: 'Terminal Skills',
        desc: 'Entorno de terminal real con ejercicios de Linux, LVM, servicios y gestión de usuarios.',
        color: '#6366f1',
        tag: 'Laboratorio',
        visual: 'terminal',
    },
    {
        id: 'netlabs',
        size: 'small',
        icon: Network,
        title: 'NetLabs',
        desc: 'Configura redes, ACLs, VLANs y routing en entornos simulados.',
        color: '#0ea5e9',
        tag: 'Simulador',
    },
    {
        id: 'winserver',
        size: 'small',
        icon: Server,
        title: 'Windows Server',
        desc: 'AD DS, GPOs, Hyper-V y PowerShell con labs interactivos paso a paso.',
        color: '#3b82f6',
        tag: 'Laboratorio',
    },
    {
        id: 'flashcards',
        size: 'small',
        icon: BookOpen,
        title: 'Flashcards',
        desc: 'Repaso inteligente con espaciado adaptativo por materia.',
        color: '#f59e0b',
        tag: 'Estudio',
    },
]

// ─── PLATFORM HUD MOCKUP ───────────────────────────────────────────────────────
const PlatformHUD = () => {
    const [tick, setTick] = useState(0)
    useEffect(() => {
        const t = setInterval(() => setTick(n => (n + 1) % 3), 2200)
        return () => clearInterval(t)
    }, [])

    const questions = [
        { q: '¿Qué protocolo usa el puerto 443?', a: 'HTTPS (TLS)', opts: ['FTP', 'HTTPS (TLS)', 'SSH', 'DNS'] },
        { q: '¿Cuál es la máscara de /26?', a: '255.255.255.192', opts: ['255.255.255.128', '255.255.255.192', '255.255.255.224', '255.255.255.0'] },
        { q: 'Permiso octal rwxr-xr--', a: '754', opts: ['644', '755', '754', '664'] },
    ]
    const cur = questions[tick]

    return (
        <div className="relative w-full max-w-[520px]">
            {/* Outer glow */}
            <div className="absolute -inset-px rounded-2xl opacity-40"
                style={{ background: 'linear-gradient(135deg, rgba(0,255,100,0.4) 0%, rgba(99,102,241,0.4) 50%, rgba(6,182,212,0.3) 100%)', filter: 'blur(8px)' }} />

            <div className="relative rounded-2xl overflow-hidden border border-white/10"
                style={{ background: 'linear-gradient(160deg, #0d0d1a 0%, #080810 100%)' }}>

                {/* Top bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.07]"
                    style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#00ff64', opacity: 0.7 }} />
                    </div>
                    <div className="flex items-center gap-3">
                        {['Test Center', 'SQL', 'Terminal'].map((tab, i) => (
                            <span key={tab} className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded"
                                style={i === 0 ? { background: 'rgba(0,255,100,0.12)', color: '#00ff64', border: '1px solid rgba(0,255,100,0.25)' } : { color: '#4a5568' }}>
                                {tab}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00ff64' }} />
                        <span className="text-[8px] font-mono" style={{ color: '#00ff64' }}>LIVE</span>
                    </div>
                </div>

                <div className="p-4 grid grid-cols-5 gap-3">
                    {/* Left — question panel */}
                    <div className="col-span-3 space-y-3">
                        {/* Progress */}
                        <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Pregunta 23/60 · Redes</span>
                            <span className="text-[8px] font-mono" style={{ color: '#00ff64' }}>38%</span>
                        </div>
                        <div className="h-0.5 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: '38%', background: 'linear-gradient(90deg, #00ff64, #00e5b3)' }} />
                        </div>

                        {/* Question */}
                        <div className="rounded-xl p-3 border border-white/[0.06]"
                            style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <p className="text-[10px] text-slate-300 leading-relaxed font-mono"
                                style={{ transition: 'opacity 0.4s', opacity: 1 }}>
                                {cur.q}
                            </p>
                        </div>

                        {/* Options */}
                        <div className="space-y-1.5">
                            {cur.opts.map((opt, i) => {
                                const isCorrect = opt === cur.a
                                return (
                                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-mono transition-all"
                                        style={{
                                            background: isCorrect ? 'rgba(0,255,100,0.07)' : 'rgba(255,255,255,0.01)',
                                            border: isCorrect ? '1px solid rgba(0,255,100,0.3)' : '1px solid rgba(255,255,255,0.04)',
                                            color: isCorrect ? '#00ff64' : '#64748b',
                                        }}>
                                        <div className="w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center"
                                            style={{
                                                border: isCorrect ? '1px solid rgba(0,255,100,0.6)' : '1px solid rgba(255,255,255,0.1)',
                                                background: isCorrect ? 'rgba(0,255,100,0.15)' : 'transparent',
                                            }}>
                                            {isCorrect && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00ff64' }} />}
                                        </div>
                                        {opt}
                                    </div>
                                )
                            })}
                        </div>

                        {/* SQL snippet */}
                        <div className="rounded-xl p-3 border border-indigo-500/15"
                            style={{ background: 'rgba(99,102,241,0.04)' }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <Database className="w-2.5 h-2.5 text-indigo-400" />
                                <span className="text-[7px] font-mono text-indigo-400 uppercase tracking-widest">SQL Skills</span>
                            </div>
                            <p className="text-[8px] font-mono text-slate-500 leading-relaxed">
                                <span className="text-indigo-400">SELECT</span> nombre, xp <span className="text-indigo-400">FROM</span> alumnos<br />
                                <span className="text-indigo-400">WHERE</span> activo = <span className="text-emerald-400">1</span> <span className="text-indigo-400">ORDER BY</span> xp <span className="text-indigo-400">DESC</span><span className="animate-pulse">█</span>
                            </p>
                        </div>
                    </div>

                    {/* Right — stats */}
                    <div className="col-span-2 space-y-2.5">
                        <div className="rounded-xl p-3 text-center border border-white/[0.05]"
                            style={{ background: 'rgba(0,255,100,0.04)' }}>
                            <p className="text-[22px] font-black leading-none mb-0.5" style={{ color: '#00ff64', fontFamily: 'inherit' }}>2,840</p>
                            <p className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">XP Total</p>
                        </div>

                        <div className="rounded-xl p-3 text-center border border-white/[0.05]"
                            style={{ background: 'rgba(139,92,246,0.04)' }}>
                            <p className="text-[22px] font-black leading-none mb-0.5 text-violet-400">#12</p>
                            <p className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">Ranking</p>
                        </div>

                        <div className="rounded-xl p-2.5 border border-white/[0.05]"
                            style={{ background: 'rgba(255,255,255,0.01)' }}>
                            <p className="text-[7px] font-mono text-slate-600 uppercase tracking-widest mb-1.5">Racha</p>
                            <div className="flex gap-1 flex-wrap">
                                {[1,1,1,1,1,0,0].map((a, i) => (
                                    <div key={i} className="w-3.5 h-3.5 rounded-sm transition-all"
                                        style={{ background: a ? 'rgba(0,255,100,0.45)' : 'rgba(255,255,255,0.04)' }} />
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl p-2.5 border border-white/[0.05]"
                            style={{ background: 'rgba(255,255,255,0.01)' }}>
                            <p className="text-[7px] font-mono text-slate-600 uppercase tracking-widest mb-1.5">Progreso</p>
                            {[
                                { s: 'Redes', v: 78, c: '#0ea5e9' },
                                { s: 'BBDD', v: 62, c: '#8b5cf6' },
                                { s: 'SO', v: 45, c: '#10b981' },
                            ].map(({ s, v, c }) => (
                                <div key={s} className="mb-1.5 last:mb-0">
                                    <div className="flex justify-between mb-0.5">
                                        <span className="text-[7px] font-mono text-slate-600">{s}</span>
                                        <span className="text-[7px] font-mono" style={{ color: c }}>{v}%</span>
                                    </div>
                                    <div className="h-0.5 rounded-full bg-white/5">
                                        <div className="h-full rounded-full" style={{ width: `${v}%`, background: c }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl p-2.5 text-center border border-amber-500/15"
                            style={{ background: 'rgba(245,158,11,0.04)' }}>
                            <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                            <p className="text-[8px] font-mono text-amber-400/80 uppercase tracking-widest leading-tight">5 días<br/>seguidos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── MARQUEE ───────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
    '850+ preguntas de examen', 'SQL interactivo', 'Terminal Linux real',
    'NetLabs de redes', 'Windows Server labs', 'Ranking ASIR',
    'Flashcards adaptativas', 'XP y logros', 'Modo Error-Review',
    'Simulacros cronometrados', 'Gamificado 100%', 'SMR & ASIR',
]

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function LandingPage() {
    const navigate = useNavigate()

    const LANDING_FAQS = [
        { question: '¿Qué es Tech4U Academy?', answer: 'Tech4U Academy es una plataforma de formación interactiva para estudiantes de ASIR y SMR. Incluye teoría, laboratorios de Linux, editor SQL, tests de examen y gamificación con XP y rankings.' },
        { question: '¿Necesito conocimientos previos para empezar?', answer: 'No. Tech4U está diseñada para acompañar al alumno desde el principio del ciclo. El contenido está organizado de forma progresiva por asignatura y nivel.' },
        { question: '¿Puedo probar Tech4U Academy de forma gratuita?', answer: 'Sí. La primera lección de cada asignatura es completamente gratuita sin necesidad de cuenta. Además puedes explorar la plataforma antes de suscribirte.' },
        { question: '¿Qué incluye la suscripción Premium?', answer: 'La suscripción Premium da acceso a todo el temario, laboratorios de Linux, SQL Skills, NetLabs de redes, flashcards, simulacros de examen y el ranking ASIR.' },
        { question: '¿Cuánto cuesta Tech4U Academy?', answer: 'Desde 9,99€/mes (plan mensual), 24,99€/trimestre o 89,99€/año. Todos los planes incluyen acceso completo sin permanencia.' },
        { question: '¿Tech4U Academy sirve también para SMR?', answer: 'Sí. Aunque el contenido está orientado principalmente a ASIR, muchas asignaturas son compartidas con SMR.' },
    ]

    useSEO({
        title: 'Tech4U — Domina la FP de ASIR',
        description: 'La plataforma que transforma estudiantes de SMR y ASIR en profesionales reales. Laboratorios SQL, Terminal Linux, Tests y Gamificación.',
        path: '/',
        schemas: [schemaOrganization(), schemaFAQ(LANDING_FAQS)],
    })

    return (
        <div className="min-h-screen overflow-x-hidden text-white" style={{ background: '#050510', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* ── FONTS + GLOBAL CSS ── */}
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
                .t4-neon {
                    color: #00ff64;
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
                .t4-card {
                    background: linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 20px;
                    transition: all 0.35s ease;
                }
                .t4-card:hover {
                    border-color: rgba(255,255,255,0.13);
                    background: linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.025) 100%);
                }
                .t4-btn-primary {
                    background: #00ff64;
                    color: #000;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    font-size: 11px;
                    padding: 14px 32px;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative;
                    overflow: hidden;
                }
                .t4-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 40px rgba(0,255,100,0.4), 0 8px 32px rgba(0,0,0,0.4);
                }
                .t4-btn-secondary {
                    background: transparent;
                    color: rgba(255,255,255,0.7);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    font-size: 11px;
                    padding: 13px 32px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.12);
                    cursor: pointer;
                    transition: all 0.25s ease;
                }
                .t4-btn-secondary:hover {
                    border-color: rgba(255,255,255,0.25);
                    color: #fff;
                    background: rgba(255,255,255,0.05);
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .marquee-track {
                    animation: marquee 30s linear infinite;
                    display: flex;
                    width: max-content;
                }
                .marquee-track:hover { animation-play-state: paused; }

                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .anim-0 { animation: fade-up 0.6s ease both; }
                .anim-1 { animation: fade-up 0.6s 0.1s ease both; }
                .anim-2 { animation: fade-up 0.6s 0.2s ease both; }
                .anim-3 { animation: fade-up 0.6s 0.3s ease both; }
                .anim-4 { animation: fade-up 0.6s 0.4s ease both; }

                @keyframes orb-a {
                    0%,100% { transform: translate(0,0) scale(1); }
                    50% { transform: translate(30px,-25px) scale(1.06); }
                }
                @keyframes orb-b {
                    0%,100% { transform: translate(0,0) scale(1); }
                    50% { transform: translate(-35px,20px) scale(1.04); }
                }
                @keyframes float {
                    0%,100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes blink-cursor {
                    0%,100% { opacity:1; }
                    50% { opacity:0; }
                }
                .blink { animation: blink-cursor 1s step-end infinite; }

                details > summary { list-style: none; }
                details > summary::-webkit-details-marker { display: none; }
                details[open] .faq-arrow { transform: rotate(90deg); }
                .faq-arrow { transition: transform 0.2s ease; }
            `}</style>

            {/* ── FIXED BACKGROUND ── */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', inset: 0, background: '#050510' }} />

                {/* Orb — neon green, top-left */}
                <div style={{
                    position: 'absolute', top: '-100px', left: '-80px',
                    width: '600px', height: '600px',
                    background: 'radial-gradient(circle, rgba(0,255,100,0.14) 0%, transparent 65%)',
                    filter: 'blur(30px)', animation: 'orb-a 18s ease-in-out infinite',
                }} />

                {/* Orb — indigo, top-right */}
                <div style={{
                    position: 'absolute', top: '5%', right: '-100px',
                    width: '550px', height: '550px',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 65%)',
                    filter: 'blur(30px)', animation: 'orb-b 22s ease-in-out infinite',
                }} />

                {/* Orb — cyan, bottom */}
                <div style={{
                    position: 'absolute', bottom: '5%', left: '25%',
                    width: '500px', height: '400px',
                    background: 'radial-gradient(ellipse, rgba(6,182,212,0.10) 0%, transparent 65%)',
                    filter: 'blur(30px)', animation: 'orb-a 28s ease-in-out infinite reverse',
                }} />

                {/* Dot grid */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                    opacity: 0.18,
                    maskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black 30%, transparent 100%)',
                }} />

                {/* Bottom perspective grid */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50vh', perspective: '800px', perspectiveOrigin: '50% 100%' }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'linear-gradient(rgba(0,255,100,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,100,0.5) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        transform: 'rotateX(70deg) scale(1.6)',
                        opacity: 0.06,
                        maskImage: 'linear-gradient(to top, black 0%, transparent 70%)',
                    }} />
                </div>

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
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Left: logo only */}
                    <img src={brandCombinedImg} alt="Tech4U" style={{ height: '68px', cursor: 'pointer', filter: 'drop-shadow(0 0 16px rgba(0,255,100,0.35))' }} onClick={() => navigate('/')} />

                    {/* Right: descubre + tarifas + divider + acceder + crear cuenta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {[['Descubre', '/explora'], ['Tarifas', '/planes']].map(([l, h]) => (
                            <Link key={l} to={h}
                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', padding: '7px 14px', borderRadius: '8px', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent' }}>
                                {l}
                            </Link>
                        ))}

                        <span style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />

                        <Link to="/login"
                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', padding: '7px 14px', borderRadius: '8px', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent' }}>
                            Acceder
                        </Link>
                        <Link to="/login?tab=register" style={{
                            fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                            textTransform: 'uppercase', color: '#000', textDecoration: 'none',
                            padding: '9px 22px', borderRadius: '10px', background: '#00ff64',
                            transition: 'all 0.2s', boxShadow: '0 0 20px rgba(0,255,100,0.2)', marginLeft: '4px',
                        }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 32px rgba(0,255,100,0.45)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,100,0.2)'}>
                            Crear cuenta
                        </Link>
                    </div>
                </div>
            </header>

            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* ── HERO ── */}
                <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>

                    {/* LEFT */}
                    <div>
                        {/* Live badge */}
                        <div className="anim-0" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', border: '1px solid rgba(0,255,100,0.2)', background: 'rgba(0,255,100,0.06)', marginBottom: '32px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff64', display: 'inline-block', boxShadow: '0 0 6px #00ff64', animation: 'blink-cursor 2s ease-in-out infinite' }} />
                            <span className="t4-mono" style={{ fontSize: '9px', color: '#00ff64', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Academy Engine v4.2</span>
                        </div>

                        {/* Headline */}
                        <h1 className="t4-heading anim-1" style={{ fontSize: 'clamp(52px, 5.5vw, 80px)', marginBottom: '20px' }}>
                            <span className="t4-grad" style={{ display: 'block' }}>Conviértete en un</span>
                            <span className="t4-neon-grad" style={{ display: 'block' }}>SysAdmin</span>
                            <span style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '75%', fontWeight: 700 }}>
                                Entrenando como en un RPG
                            </span>
                        </h1>

                        {/* Body */}
                        <p className="anim-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '440px' }}>
                            La plataforma que transforma estudiantes de <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>SMR y ASIR</span> en profesionales reales — con labs interactivos, XP y simulacros de examen.
                        </p>

                        {/* CTAs */}
                        <div className="anim-3" style={{ display: 'flex', gap: '12px', marginBottom: '48px', flexWrap: 'wrap' }}>
                            <button className="t4-btn-primary" onClick={() => navigate('/login?tab=register')}>
                                Empezar gratis →
                            </button>
                            <button className="t4-btn-secondary" onClick={() => navigate('/explora')}>
                                Ver la academia
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="anim-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {[
                                { n: '850+', l: 'Preguntas' },
                                { n: '6',    l: 'Laboratorios' },
                                { n: '100%', l: 'Gamificado' },
                            ].map(({ n, l }) => (
                                <div key={l} style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.015)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span className="t4-heading" style={{ fontSize: '26px', color: '#00ff64' }}>{n}</span>
                                    <span className="t4-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{l}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — HUD mockup */}
                    <div className="anim-3" style={{ animation: 'float 7s ease-in-out infinite' }}>
                        <PlatformHUD />
                    </div>
                </section>

                {/* ── MARQUEE ── */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,255,100,0.025)', overflow: 'hidden', padding: '12px 0' }}>
                    <div className="marquee-track">
                        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingRight: '20px' }}>
                                <span className="t4-mono" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{item}</span>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(0,255,100,0.4)', flexShrink: 0 }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── BENTO FEATURES ── */}
                <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 24px 80px' }}>
                    <div style={{ marginBottom: '56px' }}>
                        <p className="t4-mono" style={{ fontSize: '9px', color: '#00ff64', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ display: 'inline-block', width: '24px', height: '1px', background: '#00ff64', opacity: 0.6 }} />
                            Ecosistema completo
                        </p>
                        <h2 className="t4-heading" style={{ fontSize: 'clamp(36px, 4vw, 56px)', marginBottom: '16px' }}>
                            <span className="t4-grad">Mucho más que</span><br />
                            <span style={{ color: 'rgba(99,102,241,1)' }}>una academia normal</span>
                        </h2>
                        <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', maxWidth: '480px', lineHeight: 1.7 }}>
                            Tech4U es un simulador profesional. No solo estudias — operas infraestructuras reales dentro de un entorno completamente gamificado.
                        </p>
                    </div>

                    {/* Bento grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto auto', gap: '12px' }}>
                        {BENTO.map((item) => {
                            const Icon = item.icon
                            const isLarge = item.size === 'large'
                            return (
                                <div key={item.id} className="t4-card" style={{
                                    gridColumn: isLarge ? 'span 2' : 'span 1',
                                    padding: isLarge ? '32px' : '24px',
                                    position: 'relative', overflow: 'hidden',
                                    cursor: 'default',
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = `${item.color}30`
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                                        e.currentTarget.style.transform = 'translateY(0)'
                                    }}>
                                    {/* Color glow on hover */}
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                                        background: `linear-gradient(90deg, transparent, ${item.color}60, transparent)`,
                                        opacity: 0.8,
                                    }} />
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at top left, ${item.color}05 0%, transparent 60%)`, pointerEvents: 'none' }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{
                                            width: isLarge ? '44px' : '38px', height: isLarge ? '44px' : '38px',
                                            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: `${item.color}15`, border: `1px solid ${item.color}25`,
                                        }}>
                                            <Icon style={{ width: isLarge ? '20px' : '17px', height: isLarge ? '20px' : '17px', color: item.color }} />
                                        </div>
                                        <span className="t4-mono" style={{
                                            fontSize: '8px', color: item.color, letterSpacing: '0.15em',
                                            textTransform: 'uppercase', padding: '3px 10px', borderRadius: '100px',
                                            background: `${item.color}10`, border: `1px solid ${item.color}20`,
                                        }}>{item.tag}</span>
                                    </div>

                                    <h3 className="t4-heading" style={{ fontSize: isLarge ? '22px' : '17px', marginBottom: '8px', color: '#fff', lineHeight: 1.2 }}>{item.title}</h3>
                                    <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{item.desc}</p>

                                    {/* Ghost icon */}
                                    <Icon style={{ position: 'absolute', bottom: '-8px', right: '-8px', width: isLarge ? '80px' : '60px', height: isLarge ? '80px' : '60px', opacity: 0.03, color: '#fff' }} />
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* ── SUBJECTS ── */}
                <section style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 0' }}>
                    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', gap: '20px', flexWrap: 'wrap' }}>
                            <div>
                                <p className="t4-mono" style={{ fontSize: '9px', color: '#00ff64', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '10px' }}>Módulos</p>
                                <h2 className="t4-heading" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)' }}>
                                    <span className="t4-grad">Asignaturas de</span>{' '}
                                    <span className="t4-neon-grad">alto impacto</span>
                                </h2>
                            </div>
                            <Link to="/explora" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                                Ver todos <ChevronRight style={{ width: '14px', height: '14px' }} />
                            </Link>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                            {SUBJECTS.map(({ icon: Icon, label, color, desc, soon }) => (
                                <div key={label} className="t4-card" style={{ padding: '20px 16px', textAlign: 'center', cursor: 'default', opacity: soon ? 0.5 : 1 }}
                                    onMouseEnter={e => !soon && (e.currentTarget.style.borderColor = `${color}35`)}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px', margin: '0 auto 12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `${color}12`, border: `1px solid ${color}20`,
                                    }}>
                                        <Icon style={{ width: '18px', height: '18px', color }} />
                                    </div>
                                    <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '4px', lineHeight: 1.3 }}>{label}</p>
                                    <p className="t4-mono" style={{ fontSize: '8px', color: soon ? color : 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>{desc}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                                <Zap style={{ width: '13px', height: '13px', color: '#00ff64' }} />
                                <span className="t4-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    Próximamente para estudiantes de <span style={{ color: 'rgba(255,255,255,0.7)' }}>DAM</span> y <span style={{ color: 'rgba(255,255,255,0.7)' }}>DAW</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── REFERRAL SECTION ── */}
                <section style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,255,100,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', position: 'relative' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', background: 'linear-gradient(135deg, rgba(0,255,100,0.05) 0%, rgba(0,255,100,0.02) 100%)', border: '1px solid rgba(0,255,100,0.15)', borderRadius: '24px', padding: '48px' }}>

                            {/* LEFT COLUMN */}
                            <div>
                                <h2 className="t4-heading" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', marginBottom: '20px', color: '#fff' }}>
                                    <span className="t4-neon-grad">Trae a un amigo,</span><br />
                                    <span style={{ color: 'rgba(255,255,255,0.9)' }}>gana 1 mes gratis</span>
                                </h2>
                                <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px', lineHeight: 1.7 }}>
                                    Cada amigo que se suscriba gracias a ti te regala un mes de suscripción. Sin límite.
                                </p>

                                {/* Steps */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '36px' }}>
                                    {[
                                        { num: '1', label: 'Comparte tu link', desc: 'Copia tu código único desde tu dashboard' },
                                        { num: '2', label: 'Tu amigo se suscribe', desc: 'Usa el link y elige su plan' },
                                        { num: '3', label: 'Tú ganas 1 mes gratis', desc: 'Se acredita automáticamente en tu cuenta' },
                                    ].map(({ num, label, desc }) => (
                                        <div key={num} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                            <div style={{
                                                width: '32px', height: '32px', minWidth: '32px',
                                                borderRadius: '8px', background: '#00ff64', color: '#000',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 700, fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif'
                                            }}>
                                                {num}
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{label}</p>
                                                <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p className="t4-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, letterSpacing: '0.05em' }}>
                                    Válido para planes de pago. El mes gratuito se acredita automáticamente.
                                </p>
                            </div>

                            {/* RIGHT COLUMN — CTA */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '100%', padding: '40px 32px',
                                    background: 'linear-gradient(135deg, rgba(0,255,100,0.1) 0%, rgba(0,255,100,0.05) 100%)',
                                    border: '2px solid rgba(0,255,100,0.3)',
                                    borderRadius: '16px',
                                    textAlign: 'center',
                                    boxShadow: '0 0 40px rgba(0,255,100,0.1)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px'
                                }}>
                                    <Gift style={{ width: '36px', height: '36px', color: '#00ff64' }} />
                                    <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>
                                        ¿Ya tienes cuenta?
                                    </p>
                                    <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                                        Accede para ver tu enlace de referido
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate(user ? '/dashboard' : '/login')}
                                    style={{
                                        width: '100%',
                                        padding: '16px 24px',
                                        background: '#00ff64',
                                        color: '#000',
                                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        borderRadius: '12px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.25s ease',
                                        boxShadow: '0 0 20px rgba(0,255,100,0.3)',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,100,0.5)'}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,100,0.3)'}
                                >
                                    Ver mi enlace de referido <ArrowRight style={{ width: '14px', height: '14px' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── PRICING ── */}
                <section id="pricing" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '100px 0' }}>
                    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', border: '1px solid rgba(0,255,100,0.2)', background: 'rgba(0,255,100,0.05)', marginBottom: '20px' }}>
                                <Rocket style={{ width: '12px', height: '12px', color: '#00ff64' }} />
                                <span className="t4-mono" style={{ fontSize: '9px', color: '#00ff64', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Planes Premium</span>
                            </div>
                            <h2 className="t4-heading" style={{ fontSize: 'clamp(36px, 4vw, 56px)', marginBottom: '16px' }}>
                                <span className="t4-grad">Acceso total,</span><br />
                                <span className="t4-neon-grad">sin límites</span>
                            </h2>
                            <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.7 }}>
                                Elige tu plan y desbloquea absolutamente todo el contenido, sin permanencia.
                            </p>
                        </div>

                        <div style={{ marginBottom: '48px' }}>
                            <PricingCards compact onSelectPlan={(planId) => navigate(`/login?tab=register&plan=${planId}`)} />
                        </div>

                        {/* Trust signals */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '640px', margin: '0 auto 40px' }}>
                            {[
                                { icon: Lock,   t: 'Pago seguro', d: 'Stripe + cifrado bancario' },
                                { icon: Shield, t: 'Sin permanencia', d: 'Cancela cuando quieras' },
                                { icon: Zap,    t: 'Acceso inmediato', d: 'Activo al instante' },
                            ].map(({ icon: Icon, t, d }) => (
                                <div key={t} style={{ textAlign: 'center', padding: '20px 16px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,255,100,0.06)', border: '1px solid rgba(0,255,100,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                                        <Icon style={{ width: '15px', height: '15px', color: '#00ff64' }} />
                                    </div>
                                    <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '3px' }}>{t}</p>
                                    <p className="t4-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>{d}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href={import.meta.env.VITE_EDU_APP || 'http://localhost:5174'} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '12px 24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', transition: 'all 0.2s' }}>
                                Portal Docente
                            </a>
                            <a href="mailto:info@tech4u.academy" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000', textDecoration: 'none', padding: '12px 24px', background: '#00ff64', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MessageCircle style={{ width: '13px', height: '13px' }} /> Contactar
                            </a>
                        </div>
                    </div>
                </section>

                {/* ── REFERRAL ── */}
                <section style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative' }}>
                        <Gift style={{ width: '28px', height: '28px', color: 'rgba(99,102,241,0.7)', margin: '0 auto 16px' }} />
                        <h2 className="t4-heading" style={{ fontSize: 'clamp(32px, 4vw, 52px)', marginBottom: '16px' }}>
                            <span className="t4-grad">Invita a tu squad,</span><br />
                            <span style={{ color: 'rgba(99,102,241,1)' }}>gana meses gratis</span>
                        </h2>
                        <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px', lineHeight: 1.7 }}>
                            Por cada amigo que se una, obtienes descuentos y meses de suscripción completamente gratuitos.
                        </p>
                        <Link to="/login" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', textDecoration: 'none', padding: '13px 28px', border: '1px solid rgba(99,102,241,0.35)', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                            Generar mi código <ArrowRight style={{ width: '14px', height: '14px' }} />
                        </Link>
                    </div>
                </section>

                {/* ── CTA FINAL ── */}
                <section style={{ padding: '80px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{
                            position: 'relative', borderRadius: '24px', overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                            padding: '72px 48px', textAlign: 'center',
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(0,255,100,0.6), transparent)' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,255,100,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
                            <div style={{ position: 'relative' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(0,255,100,0.2)', background: 'rgba(0,255,100,0.06)', marginBottom: '24px' }}>
                                    <Sparkles style={{ width: '12px', height: '12px', color: '#00ff64' }} />
                                    <span className="t4-mono" style={{ fontSize: '9px', color: '#00ff64', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Misión disponible</span>
                                </div>
                                <h2 className="t4-heading" style={{ fontSize: 'clamp(32px, 4vw, 52px)', marginBottom: '16px' }}>
                                    <span className="t4-grad">¿Listo para el</span>{' '}
                                    <span className="t4-neon-grad">despegue?</span>
                                </h2>
                                <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', maxWidth: '440px', margin: '0 auto 36px', lineHeight: 1.7 }}>
                                    Únete donde el código se encuentra con el juego. SMR y ASIR nunca volverán a ser lo mismo.
                                </p>
                                <button className="t4-btn-primary" onClick={() => navigate('/login?tab=register')} style={{ fontSize: '12px', padding: '15px 40px' }}>
                                    Empezar mi carrera IT →
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section id="faq" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '80px 0' }}>
                    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h2 className="t4-heading" style={{ fontSize: 'clamp(28px, 3vw, 40px)', marginBottom: '8px' }}>
                                <span className="t4-grad">Preguntas</span>{' '}
                                <span className="t4-neon-grad">frecuentes</span>
                            </h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {LANDING_FAQS.map(({ question, answer }) => (
                                <details key={question} style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                                    <summary style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>
                                        {question}
                                        <ChevronRight className="faq-arrow" style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginLeft: '12px' }} />
                                    </summary>
                                    <p style={{ padding: '0 20px 16px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '14px', margin: 0 }}>{answer}</p>
                                </details>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '24px' }}>
                            {[['Linux Terminal', '/linux-terminal-exercises'], ['SQL Practice', '/sql-practice'], ['Ciberseguridad', '/ciberseguridad-labs'], ['Redes', '/redes-informaticas']].map(([l, h]) => (
                                <Link key={h} to={h} style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', letterSpacing: '0.05em' }}>→ {l}</Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.4)' }}>
                    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 40px 32px' }}>

                        {/* 3-col grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.2fr', gap: '48px', marginBottom: '40px', alignItems: 'start' }}>

                            {/* Col 1: Logo + tagline + social */}
                            <div>
                                <img src={brandCombinedImg} alt="Tech4U" style={{ height: '38px', marginBottom: '16px', opacity: 0.85 }} />
                                <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.8, maxWidth: '260px', marginBottom: '20px' }}>
                                    La plataforma de entrenamiento líder para ciclos formativos de informática.
                                </p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[
                                        { href: 'https://discord.gg/tech4u', title: 'Discord', svg: <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.055a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg> },
                                        { href: 'https://t.me/tech4u', title: 'Telegram', svg: <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
                                    ].map(({ href, title, svg }) => (
                                        <a key={title} href={href} target="_blank" rel="noreferrer" title={title}
                                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'all 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = '#00ff64'; e.currentTarget.style.borderColor = 'rgba(0,255,100,0.3)'; e.currentTarget.style.background = 'rgba(0,255,100,0.05)' }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}>
                                            {svg}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Col 2: Quick links */}
                            <div>
                                <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '18px' }}>Acceso rápido</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[['Explorar plataforma', '/explora'], ['Ver tarifas', '/planes'], ['Crear cuenta gratis', '/login?tab=register'], ['Iniciar sesión', '/login']].map(([l, h]) => (
                                        <Link key={l} to={h}
                                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                                            <ChevronRight style={{ width: '10px', height: '10px', opacity: 0.4 }} />{l}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Col 3: Contacto + legal */}
                            <div>
                                <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '18px' }}>Contacto</p>
                                <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, marginBottom: '14px' }}>
                                    ¿Dudas o sugerencias? Escríbenos directamente.
                                </p>
                                <a href="mailto:info@tech4u.academy"
                                    style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: 'rgba(0,255,100,0.75)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '24px', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#00ff64'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,255,100,0.75)'}>
                                    <Mail style={{ width: '12px', height: '12px' }} />
                                    info@tech4u.academy
                                </a>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[['Política de Privacidad', '/privacidad'], ['Política de Cookies', '/cookies'], ['Condiciones de Venta', '/terminos']].map(([l, h]) => (
                                        <Link key={l} to={h}
                                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '11px', fontWeight: 700, color: '#00ff64', textDecoration: 'none', opacity: 0.7, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}>
                                            <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: '#00ff64', opacity: 0.6 }} />
                                            {l}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom bar */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em', margin: 0 }}>
                                © 2026 Tech4U Academy — Built for the next generation of SysAdmins.
                            </p>
                            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,0.1)', letterSpacing: '0.05em' }}>tech4uacademy.es</span>
                        </div>

                    </div>
                </footer>

            </div>
        </div>
    )
}
