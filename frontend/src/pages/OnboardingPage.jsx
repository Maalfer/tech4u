import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Terminal, BookOpen, Database, Zap, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function OnboardingPage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [ciclo, setCiclo] = useState(null)
    const [interests, setInterests] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // ── Only ASIR and SMR are available ──────────────────────────────────────
    const ciclos = [
        {
            id: 'ASIR',
            icon: '🖥️',
            title: 'ASIR',
            desc: 'Administración de Sistemas Informáticos en Red',
            color: 'from-lime-500 to-cyan-500',
            features: ['Terminal Linux', 'Redes TCP/IP', 'Subnetting', 'Ciberseguridad'],
        },
        {
            id: 'SMR',
            icon: '🌐',
            title: 'SMR',
            desc: 'Sistemas Microinformáticos y Redes',
            color: 'from-blue-500 to-indigo-500',
            features: ['Hardware PC', 'Redes básicas', 'SO Windows', 'Subredes IPv4'],
        },
    ]

    // ── Interest topics ───────────────────────────────────────────────────────
    const interestOptions = [
        { id: 'redes', icon: '🌐', label: 'Redes y Protocolos' },
        { id: 'linux', icon: '🐧', label: 'Linux / Sistemas' },
        { id: 'bbdd', icon: '🗄️', label: 'Bases de Datos' },
        { id: 'seguridad', icon: '🔒', label: 'Ciberseguridad' },
        { id: 'hardware', icon: '🔧', label: 'Hardware' },
        { id: 'redes_local', icon: '📡', label: 'Redes de Área Local' },
    ]

    // ── Quick-start suggestions by ciclo ─────────────────────────────────────
    const quickStarts = {
        ASIR: [
            {
                icon: Terminal,
                iconColor: 'text-lime-400',
                iconBg: 'bg-lime-400/10',
                title: 'Terminal Skills — Lab 1',
                desc: 'Aprende Linux desde cero con labs interactivos',
                url: '/labs',
            },
            {
                icon: BookOpen,
                iconColor: 'text-blue-400',
                iconBg: 'bg-blue-400/10',
                title: 'Teoría de Redes',
                desc: 'Modelos OSI, TCP/IP, subnetting y más',
                url: '/teoria/redes',
            },
            {
                icon: Database,
                iconColor: 'text-orange-400',
                iconBg: 'bg-orange-400/10',
                title: 'SQL Skills',
                desc: 'Ejercicios prácticos de bases de datos',
                url: '/sql-skills',
            },
            {
                icon: Zap,
                iconColor: 'text-purple-400',
                iconBg: 'bg-purple-400/10',
                title: 'Skill Labs',
                desc: 'Simulaciones guiadas de escenarios reales',
                url: '/skill-labs',
            },
        ],
        SMR: [
            {
                icon: BookOpen,
                iconColor: 'text-blue-400',
                iconBg: 'bg-blue-400/10',
                title: 'Teoría de Redes',
                desc: 'Fundamentos de redes, topologías y protocolos',
                url: '/teoria/redes',
            },
            {
                icon: Terminal,
                iconColor: 'text-lime-400',
                iconBg: 'bg-lime-400/10',
                title: 'Terminal Skills',
                desc: 'Comandos básicos de Linux para sistemas',
                url: '/labs',
            },
            {
                icon: Zap,
                iconColor: 'text-purple-400',
                iconBg: 'bg-purple-400/10',
                title: 'Skill Labs — Redes',
                desc: 'Practica configuración de redes y subnetting',
                url: '/skill-labs',
            },
            {
                icon: Database,
                iconColor: 'text-orange-400',
                iconBg: 'bg-orange-400/10',
                title: 'SQL Skills',
                desc: 'Consultas SQL desde nivel básico',
                url: '/sql-skills',
            },
        ],
    }

    const toggleInterest = (interestId) => {
        setInterests(prev =>
            prev.includes(interestId)
                ? prev.filter(i => i !== interestId)
                : [...prev, interestId]
        )
    }

    const handleComplete = async () => {
        if (!ciclo) {
            setError('Selecciona un ciclo para continuar')
            return
        }
        setLoading(true)
        setError(null)
        try {
            await api.post('/auth/complete-onboarding', { ciclo, interests })
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al completar onboarding')
            setLoading(false)
        }
    }

    const handleQuickStart = async (url) => {
        if (!ciclo) return
        setLoading(true)
        try {
            await api.post('/auth/complete-onboarding', { ciclo, interests })
            navigate(url)
        } catch {
            navigate('/dashboard')
        }
    }

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 py-8">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: 'radial-gradient(#00ff64 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
                <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-lime-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] bg-blue-500/4 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Step Indicator */}
                <div className="mb-10">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm transition-all duration-300 ${
                                    s === step
                                        ? 'bg-[#00ff64] text-[#0D0D0D] shadow-[0_0_20px_rgba(0,255,100,0.4)]'
                                        : s < step
                                        ? 'bg-[#00ff64]/30 text-[#00ff64]'
                                        : 'bg-white/10 text-slate-500'
                                }`}>
                                    {s < step ? '✓' : s}
                                </div>
                                {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-[#00ff64]/40' : 'bg-white/10'} transition-colors duration-300`} />}
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                        Paso {step} de 3
                    </p>
                </div>

                {/* Card */}
                <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ff64]/15 to-blue-500/15 rounded-3xl blur opacity-60" />
                    <div className="relative bg-[#0D0D0D]/98 rounded-3xl p-8 border border-white/10 shadow-2xl">

                        {/* ── STEP 1: SELECT CICLO ── */}
                        {step === 1 && (
                            <div className="animate-fadeIn">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-white font-mono tracking-tight mb-1">
                                        ¿Qué ciclo estudias?
                                    </h2>
                                    <p className="text-sm text-slate-500 font-mono">
                                        Personaliza tu experiencia de aprendizaje
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {ciclos.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => setCiclo(c.id)}
                                            className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${
                                                ciclo === c.id
                                                    ? 'border-[#00ff64] bg-[#00ff64]/8 shadow-[0_0_30px_rgba(0,255,100,0.15)]'
                                                    : 'border-white/10 bg-white/2 hover:border-white/25 hover:bg-white/4'
                                            }`}
                                        >
                                            <div className="text-3xl mb-3">{c.icon}</div>
                                            <h3 className="text-xl font-black text-white font-mono tracking-tight mb-1">
                                                {c.title}
                                            </h3>
                                            <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                                {c.desc}
                                            </p>
                                            {/* Feature tags */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {c.features.map(f => (
                                                    <span key={f} className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                                        ciclo === c.id
                                                            ? 'border-[#00ff64]/30 bg-[#00ff64]/10 text-[#00ff64]'
                                                            : 'border-white/10 bg-white/5 text-slate-500'
                                                    }`}>
                                                        {f}
                                                    </span>
                                                ))}
                                            </div>
                                            {/* Checkmark */}
                                            {ciclo === c.id && (
                                                <div className="absolute top-4 right-4 w-6 h-6 bg-[#00ff64] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,255,100,0.5)]">
                                                    <svg className="w-3.5 h-3.5 text-[#0D0D0D]" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {error && (
                                    <div className="mt-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-mono">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── STEP 2: SELECT INTERESTS ── */}
                        {step === 2 && (
                            <div className="animate-fadeIn">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-white font-mono tracking-tight mb-1">
                                        ¿Qué quieres dominar?
                                    </h2>
                                    <p className="text-sm text-slate-500 font-mono">
                                        Elige tus temas de interés — puedes seleccionar varios
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {interestOptions.map(interest => (
                                        <button
                                            key={interest.id}
                                            onClick={() => toggleInterest(interest.id)}
                                            className={`relative group p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                                                interests.includes(interest.id)
                                                    ? 'border-[#00ff64] bg-[#00ff64]/8 shadow-[0_0_15px_rgba(0,255,100,0.1)]'
                                                    : 'border-white/10 bg-white/2 hover:border-white/25 hover:bg-white/4'
                                            }`}
                                        >
                                            <div className="text-2xl mb-2">{interest.icon}</div>
                                            <p className="text-xs font-mono font-bold text-slate-300 leading-tight">
                                                {interest.label}
                                            </p>
                                            {interests.includes(interest.id) && (
                                                <div className="absolute top-2 right-2 w-4 h-4 bg-[#00ff64] rounded-full flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5 text-[#0D0D0D]" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-center text-[11px] font-mono text-slate-600 mt-4">
                                    {interests.length === 0 ? 'Puedes saltar este paso si quieres' : `${interests.length} tema${interests.length > 1 ? 's' : ''} seleccionado${interests.length > 1 ? 's' : ''}`}
                                </p>
                            </div>
                        )}

                        {/* ── STEP 3: PRIMER PASO ── */}
                        {step === 3 && (
                            <div className="animate-fadeIn">
                                <div className="text-center mb-8">
                                    <div className="text-5xl mb-4">🚀</div>
                                    <h2 className="text-2xl font-black text-[#00ff64] font-mono tracking-tight mb-2">
                                        ¡Todo listo, {user?.nombre?.split(' ')[0]}!
                                    </h2>
                                    <p className="text-sm text-slate-400 font-mono">
                                        Elige por dónde quieres empezar en <span className="text-white">{ciclo}</span>
                                    </p>
                                </div>

                                {/* Quick Start Cards */}
                                <div className="space-y-2 mb-6">
                                    {quickStarts[ciclo]?.map((item, idx) => {
                                        const Icon = item.icon
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleQuickStart(item.url)}
                                                disabled={loading}
                                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/3 hover:bg-[#00ff64]/5 hover:border-[#00ff64]/30 transition-all duration-300 group disabled:opacity-50 text-left"
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                                                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-mono font-bold text-sm text-white group-hover:text-[#00ff64] transition-colors">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-[#00ff64] transition-all group-hover:translate-x-0.5 flex-shrink-0" />
                                            </button>
                                        )
                                    })}
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-mono">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/8">
                            <button
                                onClick={() => { if (step > 1) { setStep(step - 1); setError(null) } }}
                                disabled={step === 1}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono font-bold text-sm transition-all duration-300 ${
                                    step === 1
                                        ? 'opacity-20 cursor-not-allowed text-slate-600'
                                        : 'text-slate-400 hover:text-white border border-white/15 hover:border-white/35'
                                }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Atrás
                            </button>

                            {step < 3 ? (
                                <button
                                    onClick={() => {
                                        if (step === 1 && !ciclo) {
                                            setError('Selecciona un ciclo para continuar')
                                        } else {
                                            setStep(step + 1)
                                            setError(null)
                                        }
                                    }}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-[#00ff64] text-[#0D0D0D] rounded-xl font-mono font-bold text-sm hover:shadow-[0_0_30px_rgba(0,255,100,0.35)] transition-all duration-300"
                                >
                                    Siguiente
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 border border-white/20 text-slate-400 hover:text-white hover:border-white/40 rounded-xl font-mono font-bold text-sm transition-all duration-300 disabled:opacity-50 text-sm"
                                >
                                    {loading ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : null}
                                    Ir al Dashboard
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
            `}</style>
        </div>
    )
}
