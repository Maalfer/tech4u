import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Shield, Zap, ChevronRight, Check, Terminal, Globe,
    Database, MessageCircle, Code2, Cpu, Lock, Star,
    FlaskConical, BookOpen, Gift, Fingerprint,
    Sparkles, Layout, Rocket, Hammer,
    Network, Mail, Server
} from 'lucide-react'
import Typewriter from 'typewriter-effect'
import brandCombinedImg from '../assets/tech4u_logo.png'
import PricingCards from '../components/PricingCards'
import { useSEO, schemaOrganization, schemaFAQ } from '../hooks/useSEO'

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
        highlight: 'bg-neon/10 text-neon'
    },
    {
        icon: Hammer,
        title: 'Skill Labs',
        desc: 'Experimentos interactivos "Drag & Drop" para dominar conceptos complejos de redes y sistemas.',
        highlight: 'bg-indigo-500/10 text-indigo-400'
    },
    {
        icon: Server,
        title: 'Windows Server',
        desc: 'Instala AD DS, configura GPOs, DHCP, DNS, Hyper-V y PowerShell con laboratorios paso a paso y terminal interactivo.',
        highlight: 'bg-blue-500/10 text-blue-400'
    },
    {
        icon: Terminal,
        title: 'Terminal Skills',
        desc: 'Entorno de terminal interactivo para dominar comandos Linux, gestión de almacenamiento y despliegue de servicios.',
        highlight: 'bg-indigo-500/10 text-indigo-400'
    },
    {
        icon: Database,
        title: 'SQL Skills',
        desc: 'Editor SQL interactivo con ejercicios reales. Practica consultas, diseño de bases de datos y optimización directamente en el navegador.',
        highlight: 'bg-neon/10 text-neon'
    },
    {
        icon: Network,
        title: 'NetLabs',
        desc: 'Laboratorios de redes interactivos: configura ACLs, VLANs, routing y switching en entornos simulados paso a paso.',
        highlight: 'bg-indigo-500/10 text-indigo-400'
    },
]


// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
    const navigate = useNavigate()

    const LANDING_FAQS = [
        { question: '¿Qué es Tech4U Academy?', answer: 'Tech4U Academy es una plataforma de formación interactiva para estudiantes de ASIR y SMR. Incluye teoría, laboratorios de Linux, editor SQL, tests de examen y gamificación con XP y rankings.' },
        { question: '¿Necesito conocimientos previos para empezar?', answer: 'No. Tech4U está diseñada para acompañar al alumno desde el principio del ciclo. El contenido está organizado de forma progresiva por asignatura y nivel.' },
        { question: '¿Puedo probar Tech4U Academy de forma gratuita?', answer: 'Sí. La primera lección de cada asignatura es completamente gratuita sin necesidad de cuenta. Además puedes explorar la plataforma antes de suscribirte.' },
        { question: '¿Qué incluye la suscripción Premium?', answer: 'La suscripción Premium da acceso a todo el temario, laboratorios de Linux, SQL Skills, NetLabs de redes, flashcards, simulacros de examen y el ranking ASIR.' },
        { question: '¿Cuánto cuesta Tech4U Academy?', answer: 'Desde 9,99€/mes (plan mensual), 24,99€/trimestre o 89,99€/año. Todos los planes incluyen acceso completo sin permanencia.' },
        { question: '¿Tech4U Academy sirve también para SMR?', answer: 'Sí. Aunque el contenido está orientado principalmente a ASIR, muchas asignaturas (Hardware, Redes, Sistemas Operativos, Bases de Datos) son compartidas con SMR.' },
    ];

    useSEO({
        title: 'Tech4U — Domina la FP de ASIR',
        description: 'La plataforma que transforma estudiantes de SMR y ASIR en profesionales reales. Laboratorios SQL, Terminal Linux, Tests y Gamificación.',
        path: '/',
        schemas: [schemaOrganization(), schemaFAQ(LANDING_FAQS)],
    })

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
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(-2deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
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
                        className="h-14 -my-2 object-contain drop-shadow-[0_0_15px_rgba(0,255,100,0.4)] hover:scale-110 transition-transform cursor-pointer origin-left"
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

                <div className="relative w-full mb-12 flex justify-center items-center">
                    {/* Contenedor extra ancho absoluto para dar espacio al logo sin fastidiar el centering de la pantalla normal */}
                    <div className="hidden xl:block absolute inset-0 z-20 pointer-events-none max-w-7xl mx-auto">
                        <img 
                            src={brandCombinedImg} 
                            alt="Tech4U Mascot" 
                            className="absolute -left-40 2xl:-left-52 top-1/2 -translate-y-1/2 w-72 2xl:w-80 drop-shadow-[0_0_50px_rgba(0,255,100,0.6)] animate-[float_6s_ease-in-out_infinite]"
                        />
                    </div>
                    
                    <div className="text-center w-full max-w-5xl z-10 relative">
                        <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-8 tracking-tighter uppercase italic mx-auto">
                            Conviértete en un <span className="text-neon selection:text-black">SysAdmin</span> <br />
                            <span>Entrenando</span> como en un RPG
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed font-mono font-medium mx-auto">
                            La plataforma que transforma estudiantes de SMR y ASIR en profesionales reales mediante laboratorios, XP y desafíos técnicos.
                        </p>
                    </div>
                </div>

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
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 ${bg}`}>
                                <Icon className={`w-6 h-6 ${color}`} />
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
            <section className="relative z-10 px-8 py-32 bg-white/[0.01] border-t border-white/[0.04]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {FEATURES.map(({ icon: Icon, title, desc, highlight }) => (
                                    <div key={title} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all relative overflow-hidden">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12 ${highlight}`}>
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

                <div className="mb-16 px-4">
                    <PricingCards
                        compact
                        onSelectPlan={(planId) => navigate(`/login?tab=register&plan=${planId}`)}
                    />
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
                        ¿Eres docente? Gestiona tu clase en nuestro <a href={import.meta.env.VITE_EDU_APP || 'http://localhost:5174'} className="text-neon font-bold hover:underline">Portal Educativo</a>.
                    </p>
                    <div className="flex gap-4">
                        <a
                            href={import.meta.env.VITE_EDU_APP || 'http://localhost:5174'}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white/10 transition-all"
                        >
                            Ver Portal Docente
                        </a>
                        <a
                            href="mailto:info@tech4u.academy?subject=Consulta%20Grupo%20Academia"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-neon text-black font-black uppercase tracking-widest text-xs rounded-xl hover:shadow-[0_0_30px_rgba(0,255,100,0.4)] transition-all"
                        >
                            <MessageCircle className="w-4 h-4" /> Contactar Soporte
                        </a>
                    </div>
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
            <footer className="relative z-10 border-t border-white/[0.06] bg-[#0A0A0A] overflow-hidden">
                {/* Subtle top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-neon/20 to-transparent" />

                <div className="max-w-6xl mx-auto px-8 pt-20 pb-10">

                    {/* Main grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

                        {/* Brand column */}
                        <div className="md:col-span-4">
                            <img src={brandCombinedImg} alt="Tech4U Academy" className="h-8 mb-6 opacity-90" />
                            <p className="text-slate-500 font-mono text-xs leading-relaxed mb-8 max-w-xs">
                                La plataforma de entrenamiento líder para ciclos formativos de informática. Tecnología, comunidad y gamificación al máximo nivel.
                            </p>
                            <div className="flex items-center gap-3">
                                <a
                                    href="https://discord.gg/tech4u"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-neon hover:border-neon/30 hover:bg-neon/5 transition-all"
                                    aria-label="Discord"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.055a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-neon hover:border-neon/30 hover:bg-neon/5 transition-all"
                                    aria-label="Twitter / X"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-neon hover:border-neon/30 hover:bg-neon/5 transition-all"
                                    aria-label="GitHub"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Plataforma */}
                        <div className="md:col-span-2 md:col-start-6">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6">Plataforma</h3>
                            <ul className="space-y-3">
                                {[
                                    ['Test Center', '/login'],
                                    ['Skill Labs', '/login'],
                                    ['Windows Server', '/winlabs'],
                                    ['Terminal Skills', '/login'],
                                    ['SQL Skills', '/login'],
                                    ['NetLabs', '/login'],
                                ].map(([label, href]) => (
                                    <li key={label}>
                                        <Link to={href} className="text-[11px] font-mono text-slate-500 hover:text-white transition-colors">{label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Academia */}
                        <div className="md:col-span-2">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6">Academia</h3>
                            <ul className="space-y-3">
                                {[
                                    ['Explorar', '/explora'],
                                    ['Tarifas', '/planes'],
                                    ['Login', '/login'],
                                    ['Crear cuenta', '/login?tab=register'],
                                ].map(([label, href]) => (
                                    <li key={label}>
                                        <Link to={href} className="text-[11px] font-mono text-slate-500 hover:text-white transition-colors">{label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contacto */}
                        <div className="md:col-span-3">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6">Contacto</h3>
                            <p className="text-[11px] font-mono text-slate-500 leading-relaxed mb-5">
                                ¿Tienes dudas, sugerencias o quieres descuentos para tu clase? Escríbenos.
                            </p>
                            <a
                                href="mailto:info@tech4u.academy"
                                className="inline-flex items-center gap-2 text-[11px] font-mono text-neon/80 hover:text-neon transition-colors mb-6 group"
                            >
                                <Mail className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                info@tech4u.academy
                            </a>
                            <div className="p-4 rounded-2xl border border-neon/10 bg-neon/[0.03]">
                                <p className="text-[9px] font-black text-neon uppercase tracking-[0.2em] mb-2">Descuentos para grupos</p>
                                <p className="text-[10px] font-mono text-slate-500 leading-relaxed mb-3">
                                    Tarifas especiales para clases enteras. Hasta 40% de descuento.
                                </p>
                                <a
                                    href="mailto:info@tech4u.academy?subject=Consulta%20Descuento%20Grupo"
                                    className="text-[9px] font-black uppercase tracking-widest text-neon/70 hover:text-neon transition-colors"
                                >
                                    Solicitar info →
                                </a>
                            </div>
                        </div>
                    </div>
                    {/* FAQ Section */}
                    <div className="py-12 border-t border-white/[0.04]" id="faq">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Preguntas Frecuentes</h2>
                            <p className="text-slate-600 font-mono text-[11px] uppercase tracking-widest">Todo lo que necesitas saber</p>
                        </div>
                        <div className="max-w-2xl mx-auto space-y-2">
                            {LANDING_FAQS.map(({ question, answer }) => (
                                <details key={question} className="group rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                                    <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer list-none text-sm font-bold text-white hover:text-neon transition-colors">
                                        {question}
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-open:rotate-90 transition-transform flex-shrink-0 ml-3" aria-hidden="true" />
                                    </summary>
                                    <p className="px-5 pb-4 text-slate-400 font-mono text-xs leading-relaxed">{answer}</p>
                                </details>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center mt-8">
                            {[
                                { label: '→ Linux Terminal', href: '/linux-terminal-exercises' },
                                { label: '→ SQL Practice', href: '/sql-practice' },
                                { label: '→ Ciberseguridad', href: '/ciberseguridad-labs' },
                                { label: '→ Redes', href: '/redes-informaticas' },
                            ].map(({ label, href }) => (
                                <Link key={href} to={href} className="text-[10px] font-mono text-slate-600 hover:text-neon transition-colors px-3 py-1.5 rounded-lg border border-white/5 hover:border-neon/20">
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] font-mono text-slate-700">
                            © 2026 Tech4U Academy — Built for the next generation of SysAdmins.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link to="/privacidad" className="text-[10px] font-mono text-slate-700 hover:text-slate-400 transition-colors">Privacidad</Link>
                            <Link to="/terminos" className="text-[10px] font-mono text-slate-700 hover:text-slate-400 transition-colors">Términos</Link>
                            <Link to="/cookies" className="text-[10px] font-mono text-slate-700 hover:text-slate-400 transition-colors">Cookies</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}