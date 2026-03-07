import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Shield, Zap, ChevronRight, Check, Terminal, Globe,
    Database, MessageCircle, Code2, Cpu, Lock, Star,
    Trophy, FlaskConical, BookOpen, Gift, ShoppingBag, Fingerprint,
    Gamepad2, Sparkles, Layout, Rocket, ArrowRight, Hammer, AlertTriangle,
    Crown, BarChart3
} from 'lucide-react'
import Typewriter from 'typewriter-effect'
import brandCombinedImg from '../assets/brand-combined.png'

// ── DATA ─────────────────────────────────────────────────────────────────────
const PRICING_FEATURES = [
    { icon: FlaskConical, text: 'Acceso ilimitado al Test Center' },
    { icon: BookOpen, text: 'Todos los recursos y apuntes PDF' },
    { icon: BarChart3, text: 'Estadísticas de rendimiento avanzadas' },
    { icon: Trophy, text: 'Ranking competitivo y gamificación' },
    { icon: Sparkles, text: 'Explicaciones detalladas por pregunta' },
    { icon: Shield, text: 'Nuevas preguntas añadidas cada semana' },
];

const PLANS = [
    {
        name: 'Mensual',
        price: '9.99',
        period: 'mes',
        type: 'monthly',
        features: PRICING_FEATURES.slice(0, 4),
        highlight: false,
        icon: BookOpen,
        sub: 'Flexibilidad',
        desc: 'Pago mes a mes'
    },
    {
        name: 'Trimestral',
        price: '24.99',
        period: 'trim.',
        type: 'quarterly',
        features: PRICING_FEATURES.slice(0, 5),
        highlight: true,
        badge: 'Más Popular · Mejor Equilibrio',
        icon: Zap,
        sub: 'Recomendado',
        oldPrice: '29,97 €',
        monthlyAvg: '≈ 8,33 €/mes'
    },
    {
        name: 'Anual',
        price: '79.99',
        period: 'año',
        type: 'annual',
        features: PRICING_FEATURES,
        highlight: false,
        icon: Sparkles,
        sub: 'Máximo Ahorro',
        oldPrice: '119,88 €',
        monthlyAvg: '≈ 6,67 €/mes'
    },
]

const SUBJECTS = [
    { icon: Database, label: 'Bases de Datos', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { icon: Globe, label: 'Redes & Protocolos', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
    { icon: Shield, label: 'Sistemas Operativos', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: Cpu, label: 'Fundamentos de Hardware', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { icon: Code2, label: 'Lenguaje de Marcas', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { icon: Terminal, label: 'Ciberseguridad', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', status: 'Próximamente...' },
]

const FEATURES = [
    {
        icon: FlaskConical,
        title: 'Test Center v4.0',
        desc: 'Simulacros de examen reales con explicaciones instantáneas y modo Error-Review.',
        highlight: 'bg-blue-500/20 text-blue-400'
    },
    {
        icon: Hammer,
        title: 'Skill Labs',
        desc: 'Experimentos interactivos "Drag & Drop" para dominar conceptos complejos de redes y sistemas.',
        highlight: 'bg-purple-500/20 text-purple-400'
    },
    {
        icon: BookOpen,
        title: 'Dungeon of Knowledge',
        desc: 'Accede a todo el temario teórico organizado por asignaturas. Posts detallados, imágenes y guías paso a paso para dominar los conceptos antes de saltar a la terminal.',
        highlight: 'bg-violet-500/20 text-violet-400'
    },
    {
        icon: Terminal,
        title: 'Terminal Skills',
        desc: 'Entorno de terminal interactivo para dominar comandos Linux, gestión de almacenamiento y despliegue de servicios.',
        highlight: 'bg-emerald-500/20 text-emerald-400'
    },
    {
        icon: Trophy,
        title: 'RPG Engine',
        desc: 'Sube de nivel, gana XP, desbloquea logros y compite en el ranking global de la academia.',
        highlight: 'bg-amber-500/20 text-amber-400'
    },
]

const RECENT_ACTIVITY = [
    { type: 'xp', user: 'AlexK', value: '+450 XP', label: 'Test Redes completado' },
    { type: 'reward', user: 'Maria_IT', value: '1 Mes Gratis', label: '10 Referidos alcanzados' },
    { type: 'shop', user: 'DevGhost', value: 'Curso Comprado', label: 'Ethical Hacking Intro' },
]

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#0D0D0D] overflow-x-hidden text-white">

            {/* Animated background */}
            <div className="landing-bg-blob landing-bg-blob-a" />
            <div className="landing-bg-blob landing-bg-blob-b" />
            <div className="landing-bg-blob landing-bg-blob-c" />
            {/* ── DYNAMIC BACKGROUND ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[#0D0D0D]"></div>
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(circle at 50% 50%, #00ff64 0%, transparent 50%)`,
                        filter: 'blur(120px)',
                    }}
                ></div>
                <div
                    className="absolute bottom-0 left-0 right-0 h-[500px]"
                    style={{
                        perspective: '1000px',
                        transformStyle: 'preserve-3d',
                    }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, rgba(0, 255, 100, 0.1) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(0, 255, 100, 0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: '60px 60px',
                            transform: 'rotateX(60deg) translateY(-100px)',
                            maskImage: 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))',
                            animation: 'grid-move 20s linear infinite',
                        }}
                    ></div>
                </div>
            </div>

            <style>{`
                @keyframes grid-move {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 500px; }
                }
                .outline-text {
                    -webkit-text-stroke: 1px rgba(255,255,255,0.1);
                    color: transparent;
                }
            `}</style>

            {/* ── NAVBAR ── */}
            <header className="relative z-20 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#0D0D0D]/40 backdrop-blur-xl sticky top-0">
                <div className="flex items-center gap-10">
                    <img
                        src={brandCombinedImg}
                        alt="Tech4U Academy"
                        className="h-10 object-contain drop-shadow-[0_0_15px_rgba(0,255,100,0.4)] hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => navigate('/')}
                    />
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/explora" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-neon transition-colors">
                            Descubre
                        </Link>
                        <Link to="/planes" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-neon transition-colors">
                            Tarifas
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                        Login
                    </Link>
                    <Link to="/login?tab=register" className="relative group overflow-hidden px-6 py-2.5 bg-neon text-black text-[11px] font-black uppercase tracking-widest rounded-full transition-all hover:pr-8 hover:shadow-[0_0_20px_rgba(0,255,100,0.4)]">
                        <span className="relative z-10">Crear cuenta</span>
                        <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                </div>
            </header>

            {/* ── HERO ── */}
            <section className="relative z-10 flex flex-col items-center text-center px-8 pt-32 pb-24 max-w-6xl mx-auto">
                {/* Badge */}
                <div className="relative group mb-12 cursor-default">
                    <div className="absolute -inset-1 bg-gradient-to-r from-neon to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-neon bg-black border border-white/10 px-6 py-2 rounded-full">
                        <Fingerprint className="w-3.5 h-3.5" />
                        Next-Gen Academy Engine v4.2.0
                    </div>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-8 max-w-5xl tracking-tighter uppercase italic">
                    Conviértete en un <span className="text-neon selection:text-black">SysAdmin</span> <br />
                    <span>Entrenando</span> como en un RPG
                </h1>

                <p className="text-lg text-slate-400 max-w-2xl mb-12 leading-relaxed font-mono font-medium">
                    La plataforma que transforma estudiantes de SMR y ASIR en profesionales reales mediante laboratorios, XP y desafíos técnicos.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-24">
                    <button
                        onClick={() => navigate('/login?tab=register')}
                        className="group relative px-10 py-5 bg-neon text-black font-black uppercase tracking-widest text-xs rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative flex items-center gap-2">
                            Iniciar Operación <Rocket className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </span>
                    </button>
                    <button
                        onClick={() => navigate('/explora')}
                        className="px-10 py-5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/5 transition-all"
                    >
                        Explorar Ecosistema
                    </button>
                </div>

                {/* Stats strip Premium */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/10 rounded-3xl overflow-hidden w-full max-w-4xl shadow-2xl">
                    {[
                        ['850+', 'Simulacros examen', 'Redes, Sistemas, BBDD'],
                        ['+3', 'Modos de práctica', 'Entrenamiento intensivo'],
                        ['24/7', 'Entrenamiento', 'Skill labs interactivos'],
                        ['100%', 'Gamificado', 'Ranking & Recompensas']
                    ].map(([num, title, sub], idx) => (
                        <div key={idx} className="bg-black/40 p-8 flex flex-col items-center justify-center hover:bg-white/[0.02] transition-colors group">
                            <span className="text-3xl font-black text-neon mb-1 group-hover:scale-110 transition-transform tracking-tighter italic">{num}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white mb-1">{title}</span>
                            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">{sub}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── LIVE ACTIVITY (New) ── */}
            <section className="relative z-10 py-12 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row items-center gap-8 md:gap-20">
                    <div className="flex-shrink-0">
                        <div className="flex items-center gap-2 text-neon mb-2">
                            <div className="w-2 h-2 bg-neon rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Activity</span>
                        </div>
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Operaciones <br /> en Tiempo Real</h2>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        {RECENT_ACTIVITY.map((act, i) => (
                            <div key={i} className="flex items-center gap-4 bg-black/40 border border-white/5 p-4 rounded-2xl group hover:border-white/10 transition-all">
                                <div className={`w - 10 h - 10 rounded - xl flex items - center justify - center border font - black text - xs ${act.type === 'xp' ? 'border-neon/30 bg-neon/10 text-neon' :
                                    act.type === 'reward' ? 'border-orange-500/30 bg-orange-500/10 text-orange-500' :
                                        'border-indigo-500/30 bg-indigo-500/10 text-indigo-500'
                                    } `}>
                                    {act.type === 'xp' ? 'XP' : act.type === 'reward' ? '🎁' : '🛒'}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase">{act.user}</p>
                                    <p className="text-[9px] text-slate-500 font-mono tracking-tighter">{act.label}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white mt-1">{act.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SUBJECTS ── */}
            <section className="relative z-10 px-8 py-32 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                    <div className="max-w-xl text-left">
                        <p className="text-[11px] font-mono text-neon uppercase tracking-[0.3em] mb-4">Módulos Disponibles</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic">Asignaturas de Alto Impacto</h2>
                        <p className="text-slate-500 font-mono text-sm mt-6">Domina el ecosistema completo del ciclo formativo ASIR con contenido actualizado 2026.</p>
                    </div>
                    <Link to="/explora" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all whitespace-nowrap pb-1">
                        Ver todos los módulos <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {SUBJECTS.map(({ icon: Icon, label, color, bg }) => (
                        <div
                            key={label}
                            className="group relative bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col items-center gap-4 text-center hover:bg-white/[0.07] hover:border-white/20 transition-all duration-500"
                        >
                            <div className={`w - 12 h - 12 rounded - 2xl border flex items - center justify - center flex - shrink - 0 transition - transform duration - 500 group - hover: scale - 110 ${bg} `}>
                                <Icon className={`w - 6 h - 6 ${color} `} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 leading-tight uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
                            {SUBJECTS.find(s => s.label === label)?.status && (
                                <span className="text-[8px] font-black text-neon uppercase tracking-tighter mt-1">{SUBJECTS.find(s => s.label === label).status}</span>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-neon scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-2xl opacity-50"></div>
                        </div>
                    ))}
                </div>

                {/* DAM/DAW Update Notice */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-neon/20 transition-all duration-500">
                        <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-neon animate-pulse" />
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed">
                            Próximamente se actualizará para dejar paso a estudiantes de <span className="text-white font-black">DAM</span> y <span className="text-white font-black">DAW</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="relative z-10 px-8 py-32 bg-black">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {FEATURES.map(({ icon: Icon, title, desc, highlight }) => (
                                    <div key={title} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all relative overflow-hidden">
                                        <div className={`w - 12 h - 12 rounded - 2xl flex items - center justify - center mb - 6 transition - transform group - hover: rotate - 12 ${highlight} `}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-black text-white uppercase text-base mb-3 tracking-tighter italic">{title}</h3>
                                        <p className="text-xs text-slate-500 font-mono leading-relaxed">{desc}</p>
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                                            <Sparkles className="w-12 h-12 text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-8">
                            <div className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl uppercase tracking-widest">
                                <Layout className="w-3.5 h-3.5" /> Ecosistema Operativo
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">Mucho más que una <span className="text-indigo-400">academia</span> normal</h2>
                            <p className="text-lg text-slate-400 font-mono leading-relaxed">
                                Hemos diseñado Tech4U como un simulador profesional. Aquí no solo estudias, sino que "operas" infraestructuras reales dentro de un entorno gamificado.
                            </p>
                            <div className="grid grid-cols-1 gap-4 pt-6">
                                {[
                                    { t: 'Detección de Errores', d: 'Algoritmo que prioriza tus puntos débiles automáticamente.' },
                                    { t: 'Certificación On-Chain', d: 'Logros demostrables vinculados a tu progreso real.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all">
                                        <div className="mt-1"><Check className="w-4 h-4 text-neon" /></div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-widest">{item.t}</p>
                                            <p className="text-[11px] text-slate-500 font-mono mt-1">{item.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section className="relative z-10 px-8 py-32 max-w-7xl mx-auto" id="pricing">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 border border-neon/30 mb-6">
                        <Rocket className="w-4 h-4 text-neon" />
                        <span className="text-neon font-mono text-xs uppercase tracking-widest font-bold">Tech Premium</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
                        Impulsa tu carrera <br />
                        <span className="text-neon drop-shadow-[0_0_20px_rgba(0,255,100,0.3)]">Sin Límites</span>
                    </h2>
                    <p className="text-slate-500 font-mono text-sm max-w-2xl mx-auto leading-relaxed">
                        Elige el plan que mejor se adapte a tu ritmo de estudio y desbloquea absolutamente todo el contenido.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 mb-16 px-4">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.type}
                            className={`relative flex flex-col p-8 rounded-3xl transition-all duration-500 group ${plan.highlight
                                ? 'bg-gradient-to-br from-neon/10 to-[#111] border-2 border-neon shadow-[0_0_40px_rgba(0,255,100,0.2)] hover:shadow-[0_0_60px_rgba(0,255,100,0.3)] hover:-translate-y-2 z-10'
                                : 'bg-[#111]/80 backdrop-blur-md border border-white/10 hover:border-neon/30 hover:bg-[#151515] mt-4 lg:mt-8'
                                }`}
                        >
                            {plan.highlight && (
                                <>
                                    <div className="absolute -top-7 -right-5 w-14 h-14 bg-[#0D0D0D] border-2 border-neon rounded-2xl flex items-center justify-center rotate-12 shadow-[0_0_30px_rgba(0,255,100,0.6)] z-20 animate-pulse">
                                        <Crown className="w-7 h-7 text-neon drop-shadow-[0_0_8px_rgba(0,255,100,0.8)]" />
                                    </div>
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full flex justify-center">
                                        <span className="px-6 py-1.5 bg-neon text-[#0D0D0D] text-[11px] font-black uppercase rounded-full tracking-widest shadow-[0_0_20px_rgba(0,255,100,0.6)] flex items-center gap-2 border border-neon">
                                            <Star className="w-3 h-3 fill-current" /> {plan.badge}
                                        </span>
                                    </div>
                                </>
                            )}

                            <div className="flex items-center gap-3 mb-6 mt-4">
                                <div className={`p-2.5 rounded-xl border ${plan.highlight ? 'bg-neon/20 border-neon/40' : 'bg-white/5 border-white/10'}`}>
                                    <plan.icon className={`w-5 h-5 ${plan.highlight ? 'text-neon' : 'text-slate-300'}`} />
                                </div>
                                <div>
                                    <p className={`text-[10px] font-mono uppercase tracking-widest ${plan.highlight ? 'text-neon font-bold' : 'text-slate-500'}`}>{plan.sub}</p>
                                    <h2 className="text-white font-black text-xl uppercase tracking-tight">{plan.name}</h2>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-end gap-2">
                                    <span className={`text-5xl font-black font-mono ${plan.highlight ? 'text-neon drop-shadow-[0_0_20px_rgba(0,255,100,0.5)]' : 'text-white'}`}>
                                        {plan.price.split('.')[0]}<span className="text-3xl">,{plan.price.split('.')[1]}</span>
                                    </span>
                                    <span className="text-slate-400 font-mono text-sm mb-2">€ / {plan.period}</span>
                                </div>
                                {plan.desc && <p className="text-slate-500 font-mono text-xs mt-2 h-4">{plan.desc}</p>}
                                {plan.oldPrice && (
                                    <div className="flex items-center gap-2 mt-2 h-4">
                                        <span className="text-slate-500 font-mono text-xs line-through">{plan.oldPrice}</span>
                                        <span className={`${plan.highlight ? 'text-neon' : 'text-slate-300'} font-mono text-sm font-bold ${plan.highlight ? 'bg-neon/10 px-2 py-0.5 rounded' : ''}`}>{plan.monthlyAvg}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 mb-8 flex-1">
                                {plan.features.map((f, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <Check className={`w-4 h-4 text-neon flex-shrink-0 mt-0.5 ${plan.highlight ? 'drop-shadow-[0_0_8px_rgba(0,255,100,0.8)]' : ''}`} />
                                        <span className={`${plan.highlight ? 'text-white font-medium' : 'text-slate-300'} font-mono text-xs leading-relaxed`}>{f.text}</span>
                                    </div>
                                ))}
                                {plan.type === 'monthly' && (
                                    <div className="flex items-start gap-3 opacity-40">
                                        <Check className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-400 font-mono text-xs line-through">Nuevas preguntas semanales</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => navigate(`/login?tab=register&plan=${plan.type}`)}
                                className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black font-mono text-sm uppercase tracking-wide transition-all duration-300 ${plan.highlight
                                    ? 'bg-neon text-[#0D0D0D] shadow-[0_0_20px_rgba(0,255,100,0.4)] hover:shadow-[0_0_40px_rgba(0,255,100,0.6)] hover:scale-[1.03]'
                                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-neon/40'
                                    }`}
                            >
                                Empezar {plan.name} {plan.highlight && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Trust indications */}
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
                    {[
                        { icon: Lock, title: 'Pago 100% Seguro', desc: 'Procesado con Stripe con encriptación bancaria' },
                        { icon: Shield, title: 'Sin Permanencia', desc: 'Cancela tu plan en cualquier momento' },
                        { icon: Zap, title: 'Acceso Inmediato', desc: 'Tu cuenta se actualiza al instante' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex flex-col items-center text-center gap-3">
                            <div className="p-3 rounded-full bg-neon/5 border border-neon/10 text-neon">
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold font-mono text-sm mb-1">{title}</h4>
                                <p className="text-slate-500 text-xs font-mono">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Group Discount Notice adapted to new style */}
                <div className="mt-20 text-center flex flex-col items-center gap-6">
                    <p className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-500 font-mono text-sm">
                        <Star className="w-4 h-4 text-neon" />
                        ¿Sois un grupo? Consulta nuestros <strong className="text-neon">descuentos para clases y grupos grandes</strong>.
                    </p>
                    <a
                        href="mailto:info@tech4u.academy?subject=Consulta%20Grupo%20Academia"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-neon text-black font-black uppercase tracking-widest text-xs rounded-xl hover:shadow-[0_0_30px_rgba(0,255,100,0.4)] transition-all"
                    >
                        <MessageCircle className="w-4 h-4" /> Contactar con Soporte
                    </a>
                </div>
            </section>

            {/* ── REFERRAL TEASER (New Feature) ── */}
            <section className="relative z-10 py-32 border-y border-white/5 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[150px] rounded-full -z-10"></div>
                <div className="max-w-4xl mx-auto px-8 text-center">
                    <div className="inline-flex items-center gap-2 text-indigo-400 font-black text-[9px] uppercase tracking-[0.4em] mb-6">
                        <Gift className="w-4 h-4" /> Expand the Network
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none mb-8">Invita a tu <span className="text-neon">Squad</span> y gana meses gratis</h2>
                    <p className="text-slate-400 font-mono text-base mb-12 max-w-2xl mx-auto leading-relaxed">
                        Nuestro nuevo sistema de referidos premia tu lealtad. Por cada amigo que se una, obtienes descuentos directos y meses de suscripción 100% gratuitos.
                    </p>
                    <div className="flex justify-center">
                        <Link to="/login" className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-indigo-400 transition-all">
                            Generar mi código de invitación
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── CTA FINAL ── */}
            <section className="relative z-10 py-32">
                <div className="max-w-4xl mx-auto text-center px-8 border border-white/5 rounded-[3rem] bg-gradient-to-br from-white/[0.03] to-transparent py-20 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-neon/30"></div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-6">
                        ¿Estás listo para el <span className="text-neon">despegue?</span>
                    </h2>
                    <p className="text-slate-400 font-mono mb-12 text-sm max-w-lg mx-auto leading-relaxed">
                        Únete a la academia donde el código se encuentra con el juego. SMR y ASIR nunca volverán a ser lo mismo.
                    </p>
                    <button
                        onClick={() => navigate('/login?tab=register')}
                        className="inline-flex items-center gap-4 px-12 py-5 bg-neon text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:shadow-[0_0_50px_rgba(0,255,100,0.5)] transition-all duration-300 transform hover:-translate-y-1"
                    >
                        Empezar mi Carrera IT <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="relative z-10 border-t border-white/5 py-16 px-8 overflow-hidden">
                <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-2 md:col-span-3">
                        <img src={brandCombinedImg} alt="Tech4U" className="h-8 mb-6 opacity-80" />
                        <p className="text-slate-500 font-mono text-xs leading-relaxed max-w-sm">
                            La plataforma de entrenamiento líder para el ciclo superior de informática. Tecnología, comunidad y gamificación.
                        </p>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate-700">
                    <p>© 2026 Tech4U Academy — Developed for the next generation of SysAdmins.</p>
                    <div className="flex gap-6">
                        <a href="https://discord.gg/tech4u" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Discord</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}