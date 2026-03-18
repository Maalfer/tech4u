/**
 * SimulacroPage — Simulacro de Examen Oficial ASIR / SMR
 *
 * Format:
 *  - ASIR: 50 preguntas, 90 min — distribución real por módulos
 *  - SMR:  40 preguntas, 75 min — distribución real por módulos
 *
 * Features:
 *  - Timer en tiempo real con aviso al 20% restante
 *  - Sin posibilidad de volver atrás (modo exam real)
 *  - Resultado final con desglose por asignatura
 *  - Submit automático al acabar el tiempo
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Timer, ChevronRight, AlertTriangle, Trophy,
    BarChart2, CheckCircle2, XCircle, ArrowRight,
    Zap, Target, BookOpen, Share2
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

// ── Configuración de simulacros ───────────────────────────────────────────────
const SIMULACROS = {
    ASIR: {
        label: 'ASIR',
        fullName: 'Administración de Sistemas Informáticos en Red',
        icon: '🖥️',
        totalQuestions: 50,
        timeSeconds: 90 * 60,
        color: 'lime',
        colorHex: '#a3e635',
        distribution: [
            { subject: 'Redes',                   label: 'Redes',          n: 15, emoji: '🌐' },
            { subject: 'Sistemas Operativos',      label: 'Sistemas',       n: 15, emoji: '🖥️' },
            { subject: 'Bases de Datos',           label: 'Bases de Datos', n: 10, emoji: '🗄️' },
            { subject: 'Fundamentos de Hardware',  label: 'Hardware',       n: 5,  emoji: '⚙️' },
            { subject: 'Lenguaje de Marcas',       label: 'Marcas',         n: 5,  emoji: '🏷️' },
        ],
    },
    SMR: {
        label: 'SMR',
        fullName: 'Sistemas Microinformáticos y Redes',
        icon: '🌐',
        totalQuestions: 40,
        timeSeconds: 75 * 60,
        color: 'blue',
        colorHex: '#60a5fa',
        distribution: [
            { subject: 'Redes',                   label: 'Redes',          n: 15, emoji: '🌐' },
            { subject: 'Fundamentos de Hardware',  label: 'Hardware',       n: 15, emoji: '⚙️' },
            { subject: 'Sistemas Operativos',      label: 'Sistemas',       n: 10, emoji: '🖥️' },
        ],
    },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtTime(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
}

function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SimulacroPage() {
    const navigate = useNavigate()
    const { user } = useAuth()

    // Phases: 'select' | 'loading' | 'exam' | 'results'
    const [phase, setPhase]   = useState('select')
    const [ciclo, setCiclo]   = useState(null)
    const [questions, setQuestions] = useState([])
    const [answers, setAnswers]     = useState({})  // { questionIdx: optionIndex }
    const [current, setCurrent]     = useState(0)
    const [timeLeft, setTimeLeft]   = useState(0)
    const [results, setResults]     = useState(null)
    const [error, setError]         = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [warningShown, setWarningShown] = useState(false)
    const [copied, setCopied]       = useState(false)

    const timerRef = useRef(null)
    const cfg = ciclo ? SIMULACROS[ciclo] : null

    // ── Fetch questions for each subject ──────────────────────────────────────
    const startExam = async (selectedCiclo) => {
        setCiclo(selectedCiclo)
        setPhase('loading')
        setError(null)

        const config = SIMULACROS[selectedCiclo]
        try {
            const allQuestions = []
            for (const block of config.distribution) {
                const res = await api.get('/tests/questions', {
                    params: { subject: block.subject, limit: block.n + 5 }
                })
                const picked = shuffle(res.data).slice(0, block.n)
                picked.forEach(q => { q._subject = block.subject; q._subjectLabel = block.label; q._emoji = block.emoji })
                allQuestions.push(...picked)
            }

            if (allQuestions.length < Math.floor(config.totalQuestions * 0.6)) {
                throw new Error('No hay suficientes preguntas disponibles para este simulacro.')
            }

            setQuestions(allQuestions)
            setAnswers({})
            setCurrent(0)
            setTimeLeft(config.timeSeconds)
            setWarningShown(false)
            setPhase('exam')
        } catch (e) {
            setError(e.message || 'Error cargando el simulacro. Inténtalo de nuevo.')
            setPhase('select')
        }
    }

    // ── Countdown timer ───────────────────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'exam') return
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current)
                    submitExam(true)
                    return 0
                }
                return t - 1
            })
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [phase])

    // ── Warning at 20% time remaining ─────────────────────────────────────────
    useEffect(() => {
        if (!cfg || warningShown) return
        if (timeLeft > 0 && timeLeft <= cfg.timeSeconds * 0.2) {
            setWarningShown(true)
        }
    }, [timeLeft, cfg, warningShown])

    // ── Submit exam ───────────────────────────────────────────────────────────
    const submitExam = useCallback(async (auto = false) => {
        if (submitting) return
        clearInterval(timerRef.current)
        setSubmitting(true)

        const config = SIMULACROS[ciclo]

        // Build answers payload for /tests/submit
        const answersPayload = questions.map((q, idx) => ({
            question_id: q.id,
            selected_option: answers[idx] ?? -1,
        }))

        // Per-subject results
        const subjectMap = {}
        config.distribution.forEach(b => {
            subjectMap[b.subject] = { label: b.label, emoji: b.emoji, total: 0, correct: 0 }
        })

        questions.forEach((q, idx) => {
            const selected = answers[idx] ?? -1
            const correct = q.correct_answer ?? q.correct ?? 0
            const subj = q._subject
            if (subjectMap[subj]) {
                subjectMap[subj].total++
                if (selected === correct) subjectMap[subj].correct++
            }
        })

        const totalCorrect = Object.values(subjectMap).reduce((s, v) => s + v.correct, 0)
        const totalAnswered = questions.length
        const accuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered * 100) : 0

        // Submit to backend for XP and tracking
        try {
            await api.post('/tests/submit', {
                subject: `Simulacro_${ciclo}`,
                answers: answersPayload,
                test_mode: 'exam',
            })
        } catch { /* XP submission error — non-fatal */ }

        setResults({
            totalCorrect,
            totalAnswered,
            accuracy,
            subjects: Object.values(subjectMap),
            autoSubmitted: auto,
            ciclo,
        })
        setSubmitting(false)
        setPhase('results')
    }, [questions, answers, ciclo, submitting])

    // ── Answer selection ──────────────────────────────────────────────────────
    const selectAnswer = (optionIdx) => {
        setAnswers(prev => ({ ...prev, [current]: optionIdx }))
    }

    const goNext = () => {
        if (current < questions.length - 1) setCurrent(c => c + 1)
    }
    const goPrev = () => {
        if (current > 0) setCurrent(c => c - 1)
    }

    // ── Share result ──────────────────────────────────────────────────────────
    const shareResult = () => {
        if (!results) return
        const text = `🎓 Acabo de hacer el simulacro de examen ${results.ciclo} en Tech4U Academy con un ${results.accuracy.toFixed(0)}% (${results.totalCorrect}/${results.totalAnswered} preguntas). ¡Prepárate para la FP! 🚀 tech4uacademy.es`
        if (navigator.share) {
            navigator.share({ text, url: 'https://tech4uacademy.es' }).catch(() => {})
        } else {
            navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
        }
    }

    const timePct = cfg ? (timeLeft / cfg.timeSeconds) * 100 : 100
    const isUrgent = timePct <= 20
    const currentQ = questions[current]
    const answered = Object.keys(answers).length

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <div className="flex h-screen bg-[#0D0D0D] overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">

                {/* ── PHASE: SELECT ───────────────────────────────────────── */}
                {phase === 'select' && (
                    <div className="min-h-screen flex items-center justify-center px-4 py-12">
                        <div className="w-full max-w-2xl">
                            {/* Header */}
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 font-mono text-xs uppercase tracking-widest mb-4">
                                    <Target className="w-3.5 h-3.5" />
                                    Simulacro Oficial
                                </div>
                                <h1 className="text-4xl font-black text-white font-mono tracking-tight mb-3">
                                    Examen <span className="text-lime-400">simulado</span>
                                </h1>
                                <p className="text-slate-400 font-mono text-sm max-w-md mx-auto">
                                    Condiciones reales: tiempo limitado, sin pausas, sin volver atrás.
                                    El mejor entrenamiento antes del examen.
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 font-mono flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Ciclo cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {Object.entries(SIMULACROS).map(([key, sim]) => (
                                    <button
                                        key={key}
                                        onClick={() => startExam(key)}
                                        className="group relative p-7 rounded-2xl border-2 border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/5 transition-all duration-300 text-left"
                                    >
                                        <div className="text-4xl mb-4">{sim.icon}</div>
                                        <h3 className="text-2xl font-black text-white font-mono mb-1">{sim.label}</h3>
                                        <p className="text-xs text-slate-500 mb-5 leading-relaxed">{sim.fullName}</p>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                                                <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                                                {sim.totalQuestions} preguntas
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                                                <Timer className="w-3.5 h-3.5 text-slate-600" />
                                                {Math.floor(sim.timeSeconds / 60)} minutos
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                                                <BarChart2 className="w-3.5 h-3.5 text-slate-600" />
                                                {sim.distribution.map(d => d.label).join(' · ')}
                                            </div>
                                        </div>
                                        <div className="absolute bottom-5 right-5">
                                            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <p className="text-center text-xs font-mono text-slate-600">
                                Los resultados cuentan para tu XP y aparecen en Mi Aprendizaje
                            </p>
                        </div>
                    </div>
                )}

                {/* ── PHASE: LOADING ──────────────────────────────────────── */}
                {phase === 'loading' && (
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-lime-400/30 border-t-lime-400 rounded-full animate-spin mx-auto mb-4" />
                            <p className="font-mono text-slate-400 text-sm">Preparando el simulacro...</p>
                        </div>
                    </div>
                )}

                {/* ── PHASE: EXAM ─────────────────────────────────────────── */}
                {phase === 'exam' && currentQ && (
                    <div className="min-h-screen flex flex-col">
                        {/* Top bar */}
                        <div className={`sticky top-0 z-20 border-b border-white/8 bg-[#0D0D0D]/95 backdrop-blur px-4 py-3 ${isUrgent ? 'border-red-500/40' : ''}`}>
                            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                                {/* Progress info */}
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs text-slate-500">
                                        {current + 1} / {questions.length}
                                    </span>
                                    <div className="hidden sm:flex items-center gap-1">
                                        <span className="text-xs font-mono text-slate-600">
                                            {answered} respondidas
                                        </span>
                                    </div>
                                </div>

                                {/* Subject badge */}
                                <span className="text-[10px] font-mono text-slate-500 hidden sm:block">
                                    {currentQ._emoji} {currentQ._subjectLabel}
                                </span>

                                {/* Timer */}
                                <div className={`flex items-center gap-2 font-mono text-lg font-black tabular-nums ${isUrgent ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                    <Timer className={`w-4 h-4 ${isUrgent ? 'text-red-400' : 'text-slate-500'}`} />
                                    {fmtTime(timeLeft)}
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="max-w-3xl mx-auto mt-2">
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? 'bg-red-400' : 'bg-lime-400'}`}
                                        style={{ width: `${timePct}%` }}
                                    />
                                </div>
                            </div>

                            {/* Urgency warning */}
                            {isUrgent && warningShown && (
                                <div className="max-w-3xl mx-auto mt-2 flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                    <span className="text-xs font-mono text-red-400">
                                        ¡Menos del 20% del tiempo! Revisa las preguntas sin responder.
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Question area */}
                        <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
                            {/* Question text */}
                            <div className="mb-8">
                                <p className="text-white font-mono text-base sm:text-lg leading-relaxed">
                                    {currentQ.question_text || currentQ.text || currentQ.question}
                                </p>
                            </div>

                            {/* Options */}
                            <div className="space-y-3 mb-10">
                                {[
                                    currentQ.option_a || currentQ.options?.[0],
                                    currentQ.option_b || currentQ.options?.[1],
                                    currentQ.option_c || currentQ.options?.[2],
                                    currentQ.option_d || currentQ.options?.[3],
                                ].filter(Boolean).map((opt, i) => {
                                    const isSelected = answers[current] === i
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => selectAnswer(i)}
                                            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                                                isSelected
                                                    ? 'border-lime-400 bg-lime-400/8 shadow-[0_0_20px_rgba(163,230,53,0.1)]'
                                                    : 'border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/5'
                                            }`}
                                        >
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 mt-0.5 ${
                                                isSelected ? 'bg-lime-400 text-[#0D0D0D]' : 'bg-white/8 text-slate-500'
                                            }`}>
                                                {['A','B','C','D'][i]}
                                            </div>
                                            <span className={`font-mono text-sm leading-relaxed ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                {opt}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={goPrev}
                                    disabled={current === 0}
                                    className="px-5 py-2.5 rounded-xl border border-white/15 font-mono text-sm text-slate-400 hover:text-white hover:border-white/30 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                                >
                                    ← Anterior
                                </button>

                                {/* Question navigator (mini dots) */}
                                <div className="hidden sm:flex items-center gap-1">
                                    {questions.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrent(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${
                                                idx === current ? 'bg-lime-400 scale-125' :
                                                answers[idx] !== undefined ? 'bg-lime-400/40' :
                                                'bg-white/15'
                                            }`}
                                        />
                                    ))}
                                </div>

                                {current < questions.length - 1 ? (
                                    <button
                                        onClick={goNext}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 text-[#0D0D0D] font-mono font-bold text-sm hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all"
                                    >
                                        Siguiente
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => submitExam(false)}
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-lime-400 text-[#0D0D0D] font-mono font-bold text-sm hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <span className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Trophy className="w-4 h-4" />
                                        )}
                                        Entregar examen
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── PHASE: RESULTS ──────────────────────────────────────── */}
                {phase === 'results' && results && (
                    <div className="min-h-screen flex items-center justify-center px-4 py-12">
                        <div className="w-full max-w-2xl">
                            {/* Auto-submitted notice */}
                            {results.autoSubmitted && (
                                <div className="mb-6 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-mono text-red-400">
                                    <Timer className="w-4 h-4 flex-shrink-0" />
                                    Tiempo agotado — el examen se entregó automáticamente
                                </div>
                            )}

                            {/* Score card */}
                            <div className="relative rounded-3xl border border-white/10 bg-white/3 p-8 mb-6 overflow-hidden text-center">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />

                                {/* Grade */}
                                <div className={`text-7xl font-black font-mono mb-2 ${
                                    results.accuracy >= 70 ? 'text-lime-400' :
                                    results.accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                    {results.accuracy.toFixed(0)}%
                                </div>
                                <p className="text-white font-mono font-bold text-lg mb-1">
                                    {results.totalCorrect} / {results.totalAnswered} correctas
                                </p>
                                <p className={`text-sm font-mono mb-6 ${
                                    results.accuracy >= 70 ? 'text-lime-400' :
                                    results.accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                    {results.accuracy >= 70 ? '✅ Aprobado — Buen trabajo' :
                                     results.accuracy >= 50 ? '⚠️ Cerca — Sigue practicando' :
                                     '❌ Suspendido — Repasa los módulos débiles'}
                                </p>

                                {/* Subject breakdown */}
                                <div className="space-y-2 text-left">
                                    {results.subjects.filter(s => s.total > 0).map((s, i) => {
                                        const pct = s.total > 0 ? (s.correct / s.total * 100) : 0
                                        return (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-sm w-4">{s.emoji}</span>
                                                <span className="text-xs font-mono text-slate-400 w-24 truncate">{s.label}</span>
                                                <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${
                                                            pct >= 70 ? 'bg-lime-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                                                        }`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-mono font-bold w-10 text-right ${
                                                    pct >= 70 ? 'text-lime-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                    {s.correct}/{s.total}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => { setPhase('select'); setCiclo(null); setResults(null) }}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-lime-400 text-[#0D0D0D] font-mono font-bold text-sm hover:shadow-[0_0_25px_rgba(163,230,53,0.3)] transition-all"
                                >
                                    <Zap className="w-4 h-4" />
                                    Repetir simulacro
                                </button>
                                <button
                                    onClick={shareResult}
                                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/15 text-slate-400 font-mono text-sm hover:text-white hover:border-white/30 transition-colors"
                                >
                                    {copied ? <CheckCircle2 className="w-4 h-4 text-lime-400" /> : <Share2 className="w-4 h-4" />}
                                    {copied ? 'Copiado' : 'Compartir resultado'}
                                </button>
                                <button
                                    onClick={() => navigate('/tests')}
                                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/15 text-slate-400 font-mono text-sm hover:text-white hover:border-white/30 transition-colors"
                                >
                                    Test por asignatura
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
