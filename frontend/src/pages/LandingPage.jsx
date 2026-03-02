import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Zap, ChevronRight, Check, Terminal, Globe, Database, MessageCircle } from 'lucide-react'
import Typewriter from 'typewriter-effect';

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
    { icon: Database, label: 'SQL & Bases de Datos' },
    { icon: Globe, label: 'Redes & Protocolos' },
    { icon: Terminal, label: 'Pentesting' },
    { icon: Shield, label: 'Sistemas Operativos' },
    { icon: Zap, label: 'Programación' },
]

export default function LandingPage() {
    const navigate = useNavigate()
    const [selectedPlan, setSelectedPlan] = useState('monthly')

    return (
        <div className="min-h-screen bg-[#0D0D0D] overflow-x-hidden">
            {/* Background radial glow mejorado */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.04)_0%,transparent_70%)]" />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.03)_0%,transparent_70%)]" />
            </div>

            {/* Navbar */}
            <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[rgba(57,255,20,0.1)] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[rgba(57,255,20,0.1)] neon-border">
                        <Shield className="w-5 h-5 text-[#39FF14]" />
                    </div>
                    <span className="text-xl font-black text-[#39FF14] glow-text font-mono tracking-wider">Tech4U</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="btn-neon text-sm">Iniciar sesión</Link>
                    <Link to="/login?tab=register" className="btn-neon-solid text-sm">Empezar gratis →</Link>
                </div>
            </header>

            {/* Hero */}
            <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-[#39FF14] border border-[rgba(57,255,20,0.3)] bg-[rgba(57,255,20,0.06)] px-4 py-1.5 rounded-full mb-8">
                    <Zap className="w-3.5 h-3.5" /> Comunidad #1 para Estudiantes de FP Informática
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 max-w-4xl tracking-tight">
                    Domina tu{' '}
                    <span className="text-[#39FF14]" style={{ textShadow: '0 0 15px rgba(57,255,20,0.4)' }}>
                        FP de Informática
                    </span>{' '}
                    con práctica real
                </h1>

                {/* Efecto Typewriter */}
                <div className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed font-mono h-[60px]">
                    <Typewriter
                        options={{
                            strings: [
                                'Tests para ASIR, DAW, DAM y SMR.',
                                'Gamificación y Ranking Global.',
                                'Cheat Sheets y Recursos Tech.',
                                'Aprende Redes, Bases de Datos y Sistemas.'
                            ],
                            autoStart: true,
                            loop: true,
                            delay: 50,
                            deleteSpeed: 30,
                            wrapperClassName: "text-[#39FF14] opacity-80"
                        }}
                    />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4">
                    <button onClick={() => navigate('/login?tab=register')} className="btn-neon-solid text-base px-8 py-3 flex items-center gap-2">
                        Empezar ahora <ChevronRight className="w-5 h-5" />
                    </button>
                    <button onClick={() => navigate('/login')} className="btn-neon text-base px-8 py-3">
                        Ver demo
                    </button>
                    <a href="https://discord.gg/tech4u" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-[#39FF14] transition-colors font-mono text-sm px-4">
                        <MessageCircle className="w-4 h-4" /> Únete al Discord
                    </a>
                </div>

                {/* Stats row */}
                <div className="mt-16 flex flex-wrap items-center justify-center gap-10 border border-[rgba(57,255,20,0.1)] rounded-2xl bg-[rgba(57,255,20,0.03)] px-10 py-6">
                    {[['500+', 'Preguntas'], ['5', 'Asignaturas'], ['3', 'Modos de test'], ['∞', 'Práctica']].map(([num, txt]) => (
                        <div key={txt} className="text-center">
                            <p className="text-3xl font-black font-mono text-[#39FF14]" style={{ textShadow: '0 0 10px rgba(57,255,20,0.3)' }}>{num}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">{txt}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Subjects */}
            <section className="relative z-10 px-8 py-16 max-w-5xl mx-auto">
                <h2 className="text-center text-3xl font-black text-white mb-3">Asignaturas disponibles</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {SUBJECTS.map(({ icon: Icon, label }) => (
                        <div key={label} className="glass glass-hover rounded-xl p-5 flex flex-col items-center gap-3 text-center cursor-pointer border border-transparent hover:border-[rgba(57,255,20,0.3)] transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[rgba(57,255,20,0.1)] flex items-center justify-center">
                                <Icon className="w-6 h-6 text-[#39FF14]" />
                            </div>
                            <span className="text-xs font-mono text-slate-300">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing SECTION RESTAURADA */}
            <section className="relative z-10 px-8 py-16 max-w-5xl mx-auto" id="pricing">
                <h2 className="text-center text-3xl font-black text-white mb-3">Elige tu plan</h2>
                <p className="text-center text-slate-500 font-mono mb-12 text-sm">Sin permanencia. Cancela cuando quieras.</p>
                <div className="grid md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.type}
                            className={`relative glass rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300 cursor-pointer ${plan.highlight
                                ? 'border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.2)] scale-105 z-20'
                                : 'neon-border hover:border-[rgba(57,255,20,0.5)]'
                                }`}
                            onClick={() => setSelectedPlan(plan.type)}
                        >
                            {plan.badge && (
                                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-black font-mono bg-[#39FF14] text-[#0D0D0D] px-3 py-1 rounded-full tracking-widest">
                                    {plan.badge}
                                </span>
                            )}
                            <div>
                                <h3 className="text-lg font-black font-mono text-[#39FF14]">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-4xl font-black text-white">{plan.price}€</span>
                                    <span className="text-sm text-slate-500 font-mono">/{plan.period}</span>
                                </div>
                            </div>
                            <ul className="flex flex-col gap-2.5">
                                {plan.features.map(f => (
                                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                                        <Check className="w-4 h-4 text-[#39FF14] flex-shrink-0 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to={`/login?tab=register&plan=${plan.type}`}
                                className={`mt-auto text-center text-sm py-3 rounded-lg font-bold transition-all ${
                                    plan.highlight 
                                    ? 'bg-[#39FF14] text-black hover:bg-[#32e612]' 
                                    : 'border border-[#39FF14] text-[#39FF14] hover:bg-[rgba(57,255,20,0.1)]'
                                }`}
                            >
                                Elegir {plan.name}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-[rgba(57,255,20,0.1)] text-center py-8 text-xs text-slate-600 font-mono">
                © 2026 Tech4U — La academia para estudiantes de FP (ASIR, DAW, DAM, SMR). Todos los derechos reservados.
            </footer>
        </div>
    )
}