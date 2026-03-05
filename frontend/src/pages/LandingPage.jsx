import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Shield, Zap, ChevronRight, Check, Terminal, Globe,
    Database, MessageCircle, Code2, Cpu, Lock, Star,
    Trophy, FlaskConical, BookOpen
} from 'lucide-react'
import Typewriter from 'typewriter-effect'
import brandCombinedImg from '../assets/brand-combined.png'

// ── DATA ─────────────────────────────────────────────────────────────────────
const PLANS = [
    {
        name: 'Mensual',
        price: '9.99',
        period: 'mes',
        type: 'monthly',
        features: ['Acceso a todos los tests', 'Cheat Sheets incluidos', 'Modo Error-Review', 'Estadísticas básicas'],
        highlight: false,
    },
    {
        name: 'Trimestral',
        price: '24.99',
        period: '3 meses',
        type: 'quarterly',
        features: ['Todo lo del plan Mensual', 'Ahorra un 17%', 'Progreso avanzado', 'Soporte prioritario'],
        highlight: true,
        badge: 'MÁS POPULAR',
    },
    {
        name: 'Anual',
        price: '79.99',
        period: 'año',
        type: 'annual',
        features: ['Todo lo Trimestral', 'Ahorra un 33%', 'Acceso anticipado', 'Certificados de completado'],
        highlight: false,
    },
]

const SUBJECTS = [
    { icon: Database, label: 'Bases de Datos', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { icon: Globe, label: 'Redes & Protocolos', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
    { icon: Terminal, label: 'Ciberseguridad', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { icon: Shield, label: 'Sistemas Operativos', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: Cpu, label: 'Fundamentos de Hardware', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { icon: Code2, label: 'Lenguaje de Marcas', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
]

const FEATURES = [
    { icon: FlaskConical, title: 'Test Center', desc: '500+ preguntas tipo test para ASIR, DAW, DAM y SMR con explicaciones detalladas.' },
    { icon: Trophy, title: 'Sistema de Rangos', desc: 'Sube de nivel, gana XP y compite en el ranking global contra otros alumnos.' },
    { icon: BookOpen, title: 'Recursos & Apuntes', desc: 'Cheat sheets, PDFs y materiales de estudio organizados por asignatura.' },
    { icon: Star, title: 'Logros y Medallas', desc: 'Desbloquea recompensas por tus rachas, tests perfectos y progreso semanal.' },
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
            <div className="landing-dot-grid" />

            {/* ── NAVBAR ── */}
            <header className="relative z-20 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0D0D0D]/80 backdrop-blur-md sticky top-0">
                <img
                    src={brandCombinedImg}
                    alt="Tech4U Academy"
                    className="h-10 object-contain drop-shadow-[0_0_12px_rgba(0,255,100,0.5)]"
                />
                <nav className="flex items-center gap-2">
                    <Link to="/descubre" className="px-4 py-2 text-sm font-mono text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        Descubre
                    </Link>
                    <Link to="/login" className="px-4 py-2 text-sm font-mono text-slate-300 border border-white/10 rounded-lg hover:border-neon/40 hover:text-neon transition-all">
                        Iniciar sesión
                    </Link>
                    <Link to="/login?tab=register" className="px-5 py-2 text-sm font-black bg-neon text-black rounded-lg hover:shadow-[0_0_20px_rgba(0,255,100,0.4)] transition-all">
                        Empezar gratis →
                    </Link>
                </nav>
            </header>

            {/* ── HERO ── */}
            <section className="relative z-10 flex flex-col items-center text-center px-8 pt-24 pb-20 max-w-5xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 text-xs font-mono text-neon border border-neon/25 bg-neon/5 px-4 py-1.5 rounded-full mb-8">
                    <Zap className="w-3.5 h-3.5" />
                    Comunidad #1 para Estudiantes de FP Informática
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6 max-w-4xl tracking-tight">
                    Domina tu{' '}
                    <span className="text-neon drop-shadow-[0_0_20px_rgba(0,255,100,0.3)]">
                        FP de Informática
                    </span>{' '}
                    con práctica real
                </h1>

                <div className="text-base text-slate-400 max-w-xl mb-10 leading-relaxed font-mono h-14 flex items-center justify-center">
                    <Typewriter
                        options={{
                            strings: [
                                'Tests para ASIR, DAW, DAM y SMR.',
                                'Gamificación y Ranking Global.',
                                'Cheat Sheets y Recursos Tech.',
                                'Aprende Redes, Bases de Datos y Sistemas.',
                            ],
                            autoStart: true,
                            loop: true,
                            delay: 50,
                            deleteSpeed: 30,
                            wrapperClassName: 'text-neon opacity-80',
                        }}
                    />
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
                    <button
                        onClick={() => navigate('/login?tab=register')}
                        className="flex items-center gap-2 px-8 py-3.5 bg-neon text-black text-sm font-black rounded-xl hover:shadow-[0_0_30px_rgba(0,255,100,0.4)] hover:scale-[1.02] transition-all"
                    >
                        Empezar ahora <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigate('/descubre')}
                        className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold border border-neon/30 text-neon rounded-xl hover:border-neon/60 hover:bg-neon/5 transition-all"
                    >
                        Ver cómo funciona
                    </button>
                    <a
                        href="https://discord.gg/tech4u"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-3.5 text-slate-500 hover:text-neon transition-colors font-mono text-sm"
                    >
                        <MessageCircle className="w-4 h-4" /> Discord
                    </a>
                </div>

                {/* Stats strip */}
                <div className="w-full flex flex-wrap items-center justify-center gap-8 md:gap-12 border border-white/5 rounded-2xl bg-white/[0.02] px-8 py-6">
                    {[['500+', 'Preguntas'], ['6', 'Asignaturas'], ['3', 'Modos de test'], ['∞', 'Práctica libre']].map(([num, txt]) => (
                        <div key={txt} className="text-center">
                            <p className="text-3xl font-black font-mono text-neon drop-shadow-[0_0_8px_rgba(0,255,100,0.3)]">{num}</p>
                            <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-1 font-mono">{txt}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SUBJECTS ── */}
            <section className="relative z-10 px-8 py-20 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <p className="text-[11px] font-mono text-neon uppercase tracking-[0.3em] mb-3">Contenido</p>
                    <h2 className="text-3xl md:text-4xl font-black text-white">Asignaturas disponibles</h2>
                    <p className="text-slate-500 font-mono text-sm mt-3">Temario completo del ciclo formativo ASIR</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {SUBJECTS.map(({ icon: Icon, label, color, bg }) => (
                        <div
                            key={label}
                            className="group glass rounded-2xl p-6 flex items-center gap-4 border border-white/5 hover:border-white/15 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${bg}`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <span className="text-sm font-bold text-slate-200 leading-tight">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="relative z-10 px-8 py-20 bg-white/[0.01] border-t border-b border-white/5">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-[11px] font-mono text-neon uppercase tracking-[0.3em] mb-3">Funcionalidades</p>
                        <h2 className="text-3xl md:text-4xl font-black text-white">Todo lo que encontrarás</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="glass rounded-2xl p-6 border border-white/5 hover:border-neon/20 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Icon className="w-5 h-5 text-neon" />
                                </div>
                                <h3 className="font-black text-white uppercase text-sm mb-2">{title}</h3>
                                <p className="text-xs text-slate-500 font-mono leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section className="relative z-10 px-8 py-20 max-w-5xl mx-auto" id="pricing">
                <div className="text-center mb-12">
                    <p className="text-[11px] font-mono text-neon uppercase tracking-[0.3em] mb-3">Planes</p>
                    <h2 className="text-3xl md:text-4xl font-black text-white">Elige tu plan de acceso</h2>
                    <p className="text-slate-500 font-mono text-sm mt-3">Sin permanencia. Cancela cuando quieras.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-center">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.type}
                            className={`relative glass rounded-2xl p-8 flex flex-col gap-5 border transition-all duration-300 ${plan.highlight
                                ? 'border-neon shadow-[0_0_40px_rgba(0,255,100,0.12)] scale-[1.03] z-10'
                                : 'border-white/8 hover:border-white/20'
                                }`}
                        >
                            {plan.badge && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-black font-mono bg-neon text-black px-4 py-1.5 rounded-full tracking-widest whitespace-nowrap">
                                    {plan.badge}
                                </span>
                            )}
                            <div>
                                <h3 className={`text-base font-black font-mono uppercase tracking-wide ${plan.highlight ? 'text-neon' : 'text-slate-300'}`}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-1.5 mt-3">
                                    <span className="text-4xl font-black text-white font-mono">{plan.price}€</span>
                                    <span className="text-sm text-slate-500 font-mono">/{plan.period}</span>
                                </div>
                            </div>
                            <ul className="flex flex-col gap-3 flex-1">
                                {plan.features.map(f => (
                                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                                        <Check className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to={`/login?tab=register&plan=${plan.type}`}
                                className={`mt-auto text-center text-sm py-3.5 rounded-xl font-black transition-all ${plan.highlight
                                    ? 'bg-neon text-black hover:shadow-[0_0_20px_rgba(0,255,100,0.4)]'
                                    : 'border border-neon/30 text-neon hover:bg-neon/5 hover:border-neon/60'
                                    }`}
                            >
                                Elegir {plan.name}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
                    {[
                        [Lock, 'Pago 100% seguro con Stripe'],
                        [Shield, 'Sin permanencia'],
                        [Zap, 'Acceso inmediato'],
                    ].map(([Icon, txt]) => (
                        <div key={txt} className="flex items-center gap-2 text-slate-600 font-mono text-xs">
                            <Icon className="w-3.5 h-3.5" />
                            {txt}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA DESCUBRE ── */}
            <section className="relative z-10 py-24 bg-gradient-to-b from-transparent via-neon/[0.03] to-transparent border-t border-white/5">
                <div className="max-w-2xl mx-auto text-center px-8">
                    <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tight text-white mb-5">
                        ¿Aún tienes <span className="text-neon">dudas?</span>
                    </h2>
                    <p className="text-slate-400 font-mono mb-10 text-sm leading-relaxed max-w-lg mx-auto">
                        Tech4U no es una academia normal. Es un RPG donde tu carrera IT es el personaje principal — XP, rangos, logros y mucho más.
                    </p>
                    <button
                        onClick={() => navigate('/descubre')}
                        className="inline-flex items-center gap-3 px-10 py-4 bg-black border-2 border-neon text-neon font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-neon hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(0,255,100,0.15)] hover:shadow-[0_0_40px_rgba(0,255,100,0.35)]"
                    >
                        Descubre todo lo que encontrarás aquí <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="relative z-10 border-t border-white/5 text-center py-8 text-xs text-slate-700 font-mono">
                © 2026 Tech4U Academy — ASIR · DAW · DAM · SMR. Todos los derechos reservados.
            </footer>
        </div>
    )
}