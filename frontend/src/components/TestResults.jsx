import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Trophy, Skull, RefreshCw, ArrowRight, Info,
    CheckCircle, XCircle, Star, Gift, Zap,
    Shield, Flame, ChevronDown, ChevronUp, Share2, Copy, Check
} from 'lucide-react'
import { fireConfetti, firePerfectScore } from '../utils/confetti'

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 1200, suffix = '' }) {
    const [display, setDisplay] = useState(0)
    useEffect(() => {
        let start = 0
        const end = parseFloat(value) || 0
        if (end === 0) { setDisplay(0); return }
        const step = end / (duration / 16)
        const timer = setInterval(() => {
            start += step
            if (start >= end) { setDisplay(end); clearInterval(timer) }
            else setDisplay(start)
        }, 16)
        return () => clearInterval(timer)
    }, [value])
    const formatted = Number.isInteger(parseFloat(value))
        ? Math.round(display)
        : display.toFixed(1)
    return <span>{formatted}{suffix}</span>
}

// ─── Particle Burst (CSS only) ───────────────────────────────────────────────
function Particles({ passed }) {
    const colors = passed
        ? ['#C6FF33', '#00ffcc', '#a3ff12', '#ffffff']
        : ['#ef4444', '#f97316', '#dc2626', '#991b1b']
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                        background: colors[i % colors.length],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `particle-float ${1.5 + Math.random() * 2}s ease-out ${Math.random() * 0.8}s forwards`,
                        opacity: 0,
                    }}
                />
            ))}
        </div>
    )
}

// ─── Rarity badge ────────────────────────────────────────────────────────────
function RarityBadge({ rarity }) {
    const styles = {
        legendario: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        epico: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        raro: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        comun: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    }
    return (
        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border inline-block ${styles[rarity] || styles.comun}`}>
            {rarity}
        </span>
    )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function TestResults({ results, selectedSubject, mode, onReset, onRepeat }) {
    const navigate = useNavigate()
    const [visible, setVisible] = useState(false)
    const [showReview, setShowReview] = useState(false)
    const [copied, setCopied] = useState(false)

    const passed = (results?.accuracy ?? 0) >= 50
    const wrong = (results?.total ?? 0) - (results?.correct ?? 0)

    const shareResult = () => {
        const subject = selectedSubject?.label || 'Examen General'
        const accuracy = (results?.accuracy ?? 0).toFixed(0)
        const correct = results?.correct ?? 0
        const total = results?.total ?? 0
        const xp = results?.xp_gained ?? 0
        const emoji = accuracy >= 70 ? '🔥' : accuracy >= 50 ? '💪' : '📚'
        const text = `${emoji} Acabo de hacer un test de ${subject} en Tech4U Academy: ${accuracy}% de precisión (${correct}/${total}) ${xp > 0 ? `+${xp} XP` : ''}. ¡Preparando mi FP de Informática! 🚀 tech4uacademy.es`

        if (navigator.share) {
            navigator.share({ text, url: 'https://tech4uacademy.es' }).catch(() => {})
        } else {
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2500)
            })
        }
    }

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80)
        return () => clearTimeout(t)
    }, [])

    // 🎉 Confetti on pass
    useEffect(() => {
        if (!results) return
        const accuracy = results?.accuracy ?? 0
        if (accuracy === 100) {
            const t = setTimeout(() => firePerfectScore(), 400)
            return () => clearTimeout(t)
        } else if (accuracy >= 70) {
            const t = setTimeout(() => fireConfetti(), 400)
            return () => clearTimeout(t)
        }
    }, [results])

    if (!results) return (
        <div className="glass rounded-[2rem] p-12 border border-red-500/20 text-center max-w-xl mx-auto mt-20">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-white uppercase italic mb-4">Error al procesar resultados</h2>
            <p className="text-slate-400 mb-8 font-mono text-sm">No se pudo recuperar el resultado. Comprueba tu conexión.</p>
            <button onClick={onReset} className="px-10 py-4 bg-neon text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                Volver al Inicio
            </button>
        </div>
    )

    return (
        <>
            <style>{`
                @keyframes particle-float {
                    0%   { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-120px) scale(0); opacity: 0; }
                }
                @keyframes result-drop {
                    0%   { opacity: 0; transform: translateY(-40px) scale(0.95); }
                    60%  { transform: translateY(6px) scale(1.01); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes scan-line {
                    0%   { top: 0%; opacity: 0.6; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.4; }
                    50%       { opacity: 0.9; }
                }
                @keyframes xp-fill {
                    from { width: 0%; }
                    to   { width: var(--xp-w); }
                }
                .result-drop { animation: result-drop 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
                .scan { animation: scan-line 2.5s linear infinite; }
                .glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
            `}</style>

            <div className={`max-w-3xl mx-auto transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>

                {/* ── ITEM DROP ─────────────────────────────────────── */}
                {results.item_drop && (
                    <div className="mb-6 result-drop" style={{ animationDelay: '0.1s' }}>
                        <div className="p-[2px] bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-600 rounded-[2rem] shadow-[0_0_60px_rgba(168,85,247,0.35)]">
                            <div className="bg-[#0b0510] rounded-[1.85rem] p-6 flex items-center gap-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.06]" />
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border-2 border-purple-500/30 flex items-center justify-center flex-shrink-0 relative z-10 animate-bounce">
                                    <Gift className="w-8 h-8 text-purple-400" />
                                </div>
                                <div className="relative z-10 flex-1">
                                    <p className="text-[9px] font-mono text-purple-400 uppercase tracking-[0.4em] mb-1">¡Loot Drop!</p>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-3xl">{results.item_drop.emoji}</span>
                                        <div>
                                            <RarityBadge rarity={results.item_drop.rarity} />
                                            <h4 className="text-lg font-black text-white uppercase leading-tight">{results.item_drop.name}</h4>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 italic">{results.item_drop.description}</p>
                                </div>
                                <div className="text-4xl opacity-20 font-black text-purple-400 relative z-10">✦</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MAIN RESULT CARD ──────────────────────────────── */}
                <div className={`result-drop relative rounded-[2.5rem] overflow-hidden border-2 mb-6 ${passed
                    ? 'border-neon/30 bg-gradient-to-b from-[#0a1a02] via-[#050f01] to-[#000800]'
                    : 'border-red-900/50 bg-gradient-to-b from-[#1a0202] via-[#0f0101] to-[#080000]'
                    } shadow-2xl`}>

                    {/* Particle burst */}
                    <Particles passed={passed} />

                    {/* Scan line effect */}
                    <div className={`scan absolute left-0 w-full h-[2px] pointer-events-none z-10 ${passed ? 'bg-neon/20' : 'bg-red-500/20'}`} />

                    {/* Top accent bar */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${passed
                        ? 'bg-gradient-to-r from-transparent via-neon to-transparent'
                        : 'bg-gradient-to-r from-transparent via-red-500 to-transparent'
                        }`} />

                    {/* Background glow */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] blur-[100px] pointer-events-none glow-pulse ${passed ? 'bg-neon/5' : 'bg-red-500/8'}`} />

                    <div className="relative z-10 p-10 text-center">

                        {/* Icon */}
                        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 border-2 relative ${passed
                            ? 'bg-neon/10 border-neon/30 shadow-[0_0_40px_rgba(198,255,51,0.2)]'
                            : 'bg-red-500/10 border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)]'
                            }`}>
                            <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${passed ? 'bg-neon' : 'bg-red-500'}`} />
                            {passed
                                ? <Trophy className="w-12 h-12 text-neon relative z-10" />
                                : <Skull className="w-12 h-12 text-red-500 relative z-10" />
                            }
                        </div>

                        {/* Verdict */}
                        <div className="mb-2">
                            <h2 className={`text-6xl font-black uppercase italic tracking-tighter leading-none ${passed
                                ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-neon to-neon/60'
                                : 'text-transparent bg-clip-text bg-gradient-to-b from-white via-red-400 to-red-700'
                                }`}>
                                {passed ? 'Aprobado' : 'Suspendido'}
                            </h2>
                        </div>
                        <p className={`text-[10px] font-mono uppercase tracking-[0.5em] mb-10 ${passed ? 'text-neon/50' : 'text-red-500/50'}`}>
                            {passed ? '— Misión completada —' : '— El sistema te ha vencido —'}
                        </p>

                        {/* Stats grid */}
                        <div className="grid grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Correctas', value: results.correct, suffix: '', color: 'text-neon', icon: CheckCircle },
                                { label: 'Falladas', value: wrong, suffix: '', color: 'text-red-400', icon: XCircle },
                                { label: 'Precisión', value: results.accuracy, suffix: '%', color: passed ? 'text-neon' : 'text-red-400', icon: Shield },
                                { label: 'XP', value: results.xp_gained, suffix: '', color: results.xp_gained > 0 ? 'text-yellow-400' : 'text-slate-500', icon: Zap },
                            ].map(({ label, value, suffix, color, icon: Icon }) => (
                                <div key={label} className={`relative rounded-2xl p-5 border overflow-hidden group transition-all duration-300 hover:scale-105 ${passed ? 'bg-black/30 border-neon/10 hover:border-neon/25' : 'bg-black/30 border-red-900/30 hover:border-red-500/30'}`}>
                                    <div className={`absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity`}>
                                        <Icon className={`w-8 h-8 ${color}`} />
                                    </div>
                                    <p className={`text-3xl font-black font-mono mb-1 relative z-10 ${color}`}>
                                        <AnimatedNumber value={value} suffix={suffix} />
                                    </p>
                                    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest relative z-10">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* XP bar (only when xp gained) */}
                        {results.xp_gained > 0 && (
                            <div className="mb-8 text-left">
                                <div className="flex justify-between text-[9px] font-mono mb-1.5">
                                    <span className="text-slate-500 uppercase tracking-wider">XP Ganada esta sesión</span>
                                    <span className="text-yellow-400 font-black">+{results.xp_gained} XP</span>
                                </div>
                                <div className="h-2.5 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                        style={{
                                            width: `${Math.min(100, (results.xp_gained / 300) * 100)}%`,
                                            transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1) 0.5s'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Level up banner */}
                        {results.leveled_up && (
                            <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-yellow-500/5 via-neon/10 to-yellow-500/5 border border-neon/25 flex items-center justify-center gap-4">
                                <Star className="w-6 h-6 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                                <div className="text-center">
                                    <p className="text-[9px] font-mono text-yellow-400 uppercase tracking-[0.4em]">Subida de Nivel</p>
                                    <p className="text-xl font-black italic text-white uppercase">Nivel {results.new_level} desbloqueado</p>
                                </div>
                                <Star className="w-6 h-6 text-yellow-400 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
                            </div>
                        )}

                        {/* Message */}
                        <p className={`text-sm font-mono mb-10 ${passed ? 'text-neon/60' : 'text-red-400/60'}`}>
                            {passed
                                ? results.accuracy >= 90 ? '⚡ Rendimiento excepcional. Eres una máquina.' :
                                    results.accuracy >= 70 ? '✓ Buen trabajo. Sigue así.' :
                                        '~ Aprobado por los pelos. Repasa los fallos.'
                                : results.accuracy >= 40 ? '↑ Cerca. Repasa los errores y vuelve.' :
                                    '✕ Necesitas más práctica. No te rindas.'
                            }
                        </p>

                        {/* Action buttons */}
                        <div className="flex gap-3 justify-center flex-wrap">
                            {/* Share result */}
                            <button
                                onClick={shareResult}
                                className="flex items-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-lime-400/30 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-400 hover:text-lime-400"
                                title="Compartir resultado"
                            >
                                {copied ? <Check className="w-4 h-4 text-lime-400" /> : <Share2 className="w-4 h-4" />}
                                {copied ? 'Copiado' : 'Compartir'}
                            </button>
                            <button
                                onClick={onReset}
                                className="flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-300 hover:text-white"
                            >
                                <RefreshCw className="w-4 h-4" /> Otra asignatura
                            </button>
                            <button
                                onClick={onRepeat}
                                className={`flex items-center gap-2 px-6 py-3.5 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${passed
                                    ? 'bg-neon/5 border-neon/20 text-neon hover:bg-neon/10 hover:border-neon/40'
                                    : 'bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40'
                                    }`}
                            >
                                <Flame className="w-4 h-4" /> Repetir {selectedSubject?.label}
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 ${passed
                                    ? 'bg-neon text-black shadow-[0_0_30px_rgba(198,255,51,0.3)] hover:shadow-[0_0_50px_rgba(198,255,51,0.5)]'
                                    : 'bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:shadow-[0_0_50px_rgba(239,68,68,0.4)]'
                                    }`}
                            >
                                Dashboard <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── DETAILED REVIEW (collapsible) ─────────────────── */}
                <div className="result-drop" style={{ animationDelay: '0.2s' }}>
                    <button
                        onClick={() => setShowReview(v => !v)}
                        className={`w-full flex items-center justify-between px-8 py-5 rounded-2xl border transition-all mb-4 group ${passed
                            ? 'bg-neon/5 border-neon/15 hover:border-neon/30 text-neon'
                            : 'bg-red-500/5 border-red-500/15 hover:border-red-500/30 text-red-400'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Info className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Revisión del examen</span>
                            <span className="text-[9px] font-mono opacity-60">({results.detailed_results?.length} preguntas)</span>
                        </div>
                        {showReview
                            ? <ChevronUp className="w-4 h-4 transition-transform" />
                            : <ChevronDown className="w-4 h-4 transition-transform" />
                        }
                    </button>

                    {showReview && (
                        <div className="space-y-4">
                            {results.detailed_results?.map((res, idx) => (
                                <div
                                    key={idx}
                                    className={`rounded-3xl p-7 border transition-all ${res.correct
                                        ? 'border-neon/15 bg-neon/[0.03]'
                                        : 'border-red-500/15 bg-red-500/[0.03]'
                                        }`}
                                    style={{ animation: `result-drop 0.4s ease forwards`, animationDelay: `${idx * 0.04}s`, opacity: 0 }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-[9px] font-mono font-black uppercase px-3 py-1 rounded-full border ${res.correct
                                            ? 'bg-neon/10 text-neon border-neon/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            #{idx + 1} · {res.correct ? '✓ Correcta' : '✗ Fallada'}
                                        </span>
                                        {res.correct
                                            ? <CheckCircle className="w-5 h-5 text-neon flex-shrink-0" />
                                            : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                        }
                                    </div>

                                    <h4 className="text-base font-bold text-white mb-5 leading-relaxed">{res.question_text}</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
                                        {['a', 'b', 'c', 'd'].map(opt => {
                                            const isCorrect = res.correct_answer?.toLowerCase() === opt
                                            const isSelected = res.selected_answer?.toLowerCase() === opt
                                            return (
                                                <div key={opt} className={`p-3.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 ${isCorrect
                                                    ? 'border-neon/40 bg-neon/10 text-neon font-black'
                                                    : isSelected && !isCorrect
                                                        ? 'border-red-500/40 bg-red-500/10 text-red-400'
                                                        : 'border-white/5 text-slate-600 bg-white/[0.01]'
                                                    }`}>
                                                    <span className={`uppercase w-5 flex-shrink-0 font-black ${isCorrect ? 'text-neon' : isSelected ? 'text-red-400' : 'text-slate-700'}`}>{opt})</span>
                                                    <span>{res[`option_${opt}`]}</span>
                                                    {isCorrect && <CheckCircle className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                                                    {isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-red-500" />}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="w-3.5 h-3.5 text-blue-400" />
                                            <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Explicación Técnica</p>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed italic">
                                            {res.explanation || 'Sin explicación disponible.'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
