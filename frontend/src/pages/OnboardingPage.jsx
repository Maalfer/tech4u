import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
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

    // Ciclo info with icons and descriptions
    const ciclos = [
        {
            id: 'ASIR',
            icon: '🖥️',
            title: 'ASIR',
            desc: 'Administración de Sistemas Informáticos en Red',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'DAW',
            icon: '💻',
            title: 'DAW',
            desc: 'Desarrollo de Aplicaciones Web',
            color: 'from-green-500 to-emerald-500'
        },
        {
            id: 'DAM',
            icon: '📱',
            title: 'DAM',
            desc: 'Desarrollo de Aplicaciones Multiplataforma',
            color: 'from-purple-500 to-pink-500'
        },
        {
            id: 'SMR',
            icon: '🌐',
            title: 'SMR',
            desc: 'Sistemas Microinformáticos y Redes',
            color: 'from-orange-500 to-red-500'
        }
    ]

    const interestOptions = [
        { id: 'redes', icon: '🌐', label: 'Redes y Protocolos' },
        { id: 'linux', icon: '🐧', label: 'Linux / Sistemas' },
        { id: 'bbdd', icon: '🗄️', label: 'Bases de Datos' },
        { id: 'seguridad', icon: '🔒', label: 'Ciberseguridad' },
        { id: 'prog', icon: '💻', label: 'Programación' },
        { id: 'hardware', icon: '🔧', label: 'Hardware' }
    ]

    // Quick-start resources based on ciclo
    const quickStarts = {
        ASIR: [
            { title: 'Primer lab de Linux →', icon: '🐧' },
            { title: 'Test de Redes →', icon: '🌐' },
            { title: 'Guía de Subnetting →', icon: '📊' }
        ],
        DAW: [
            { title: 'SQL Skills →', icon: '🗄️' },
            { title: 'Test de Programación →', icon: '💻' },
            { title: 'Guía HTML5 →', icon: '🌐' }
        ],
        DAM: [
            { title: 'SQL Skills →', icon: '🗄️' },
            { title: 'Test de Programación →', icon: '💻' },
            { title: 'Guía HTML5 →', icon: '🌐' }
        ],
        SMR: [
            { title: 'Test de Hardware →', icon: '🔧' },
            { title: 'Test de Redes →', icon: '🌐' },
            { title: 'Calculadora de Subredes →', icon: '📊' }
        ]
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
            await api.post('/auth/complete-onboarding', {
                ciclo,
                interests
            })
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al completar onboarding')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 py-8">
            {/* Premium Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[#0D0D0D]"></div>
                <div className="absolute inset-0 opacity-[0.1]"
                    style={{ backgroundImage: 'radial-gradient(#00ff64 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
                <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-green-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Step Indicator */}
                <div className="mb-12">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm transition-all duration-300 ${
                                    s === step
                                        ? 'bg-[#00ff64] text-[#0D0D0D] shadow-[0_0_20px_rgba(0,255,100,0.5)]'
                                        : s < step
                                        ? 'bg-[#00ff64]/30 text-[#00ff64]'
                                        : 'bg-white/10 text-slate-500'
                                }`}>
                                    {s}
                                </div>
                                {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-[#00ff64]/30' : 'bg-white/10'} transition-colors duration-300`} />}
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-xs font-mono text-slate-500 uppercase tracking-wider">
                        Paso {step} de 3
                    </p>
                </div>

                {/* Card Container */}
                <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ff64]/20 to-blue-500/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-[#0D0D0D]/95 rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-3xl">

                        {/* STEP 1: SELECT CICLO */}
                        {step === 1 && (
                            <div className="animate-fadeIn">
                                <h2 className="text-2xl font-black text-white mb-2 font-mono tracking-tight">
                                    ¿Qué ciclo estudias?
                                </h2>
                                <p className="text-sm text-slate-400 font-mono mb-8">
                                    Selecciona tu ciclo formativo para personalizar tu experiencia
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {ciclos.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => setCiclo(c.id)}
                                            className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${
                                                ciclo === c.id
                                                    ? 'border-[#00ff64] bg-[#00ff64]/10'
                                                    : 'border-white/10 bg-white/3 hover:border-white/30 hover:bg-white/5'
                                            }`}
                                        >
                                            {/* Background gradient */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                                            <div className="relative">
                                                <div className="text-3xl mb-2">{c.icon}</div>
                                                <h3 className="text-lg font-black text-white font-mono tracking-tight mb-1">
                                                    {c.title}
                                                </h3>
                                                <p className="text-xs text-slate-400 leading-tight">
                                                    {c.desc}
                                                </p>
                                            </div>

                                            {/* Checkmark */}
                                            {ciclo === c.id && (
                                                <div className="absolute top-3 right-3 w-5 h-5 bg-[#00ff64] rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-[#0D0D0D] font-bold" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {error && (
                                    <div className="mt-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 font-mono">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: SELECT INTERESTS */}
                        {step === 2 && (
                            <div className="animate-fadeIn">
                                <h2 className="text-2xl font-black text-white mb-2 font-mono tracking-tight">
                                    ¿Qué quieres dominar primero?
                                </h2>
                                <p className="text-sm text-slate-400 font-mono mb-8">
                                    Selecciona tus temas de interés (puedes elegir múltiples)
                                </p>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {interestOptions.map(interest => (
                                        <button
                                            key={interest.id}
                                            onClick={() => toggleInterest(interest.id)}
                                            className={`relative group p-4 rounded-xl border-2 transition-all duration-300 text-center overflow-hidden ${
                                                interests.includes(interest.id)
                                                    ? 'border-[#00ff64] bg-[#00ff64]/10'
                                                    : 'border-white/10 bg-white/3 hover:border-white/30 hover:bg-white/5'
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
                            </div>
                        )}

                        {/* STEP 3: COMPLETION */}
                        {step === 3 && (
                            <div className="animate-fadeIn">
                                {/* Progress bar */}
                                <div className="mb-8">
                                    <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden border border-white/10">
                                        <div className="bg-[#00ff64] h-full rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>

                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-black text-[#00ff64] mb-2 font-mono tracking-tight">
                                        ¡Bienvenido a Tech4U!
                                    </h2>
                                    <p className="text-lg font-mono text-white">
                                        {user?.nombre}
                                    </p>
                                </div>

                                {/* Quick Start Cards */}
                                <div className="space-y-3 mb-8">
                                    {quickStarts[ciclo]?.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/3 hover:bg-white/5 hover:border-[#00ff64]/30 transition-all duration-300 group cursor-pointer"
                                        >
                                            <span className="text-2xl">{item.icon}</span>
                                            <span className="flex-1 font-mono text-sm text-slate-300 group-hover:text-[#00ff64] transition-colors">
                                                {item.title}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#00ff64] transition-colors" />
                                        </div>
                                    ))}
                                </div>

                                {error && (
                                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 font-mono">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between gap-4 mt-10 pt-8 border-t border-white/10">
                            <button
                                onClick={() => {
                                    if (step > 1) {
                                        setStep(step - 1)
                                        setError(null)
                                    }
                                }}
                                disabled={step === 1}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-bold text-sm transition-all duration-300 ${
                                    step === 1
                                        ? 'opacity-30 cursor-not-allowed'
                                        : 'text-slate-300 hover:text-white border border-white/20 hover:border-white/40'
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
                                    className="flex items-center gap-2 px-8 py-3 bg-[#00ff64] text-[#0D0D0D] rounded-xl font-mono font-bold text-sm hover:shadow-[0_0_30px_rgba(0,255,100,0.4)] transition-all duration-300"
                                >
                                    Siguiente
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 py-3 bg-[#00ff64] text-[#0D0D0D] rounded-xl font-mono font-bold text-sm hover:shadow-[0_0_30px_rgba(0,255,100,0.4)] transition-all duration-300 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                                            Completando...
                                        </>
                                    ) : (
                                        <>
                                            ¡Empezar ahora!
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}
