import React, { useState, useEffect, useRef } from 'react'
import {
    ChevronRight,
    ChevronLeft,
    Clock,
    LogOut,
    Flag,
    Sword,
    Shield,
    Skull,
    Flame,
    Sparkles,
    Zap,
    Trophy,
    Scroll,
    Target,
    Activity,
    Cpu
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

export default function TestEngine({ questions = [], mode = 'normal', onFinish, timeLimit = null }) {

    const [current, setCurrent] = useState(0)
    const [answers, setAnswers] = useState({})
    const [timeLeft, setTimeLeft] = useState(timeLimit)
    const [startTime, setStartTime] = useState(Date.now())
    const [direction, setDirection] = useState(0) // For slide animation
    const timerRef = useRef(null)

    const q = questions[current]
    const OPTIONS = ['a', 'b', 'c', 'd']

    // ---------- TIMER ----------
    useEffect(() => {
        if (timeLeft !== null) {
            if (timeLeft <= 0) {
                handleFinish()
                return
            }
            timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
        }
        return () => clearTimeout(timerRef.current)
    }, [timeLeft])

    // ---------- KEYBOARD SHORTCUTS ----------
    useEffect(() => {
        const handler = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
            const keyMap = { '1': 'a', '2': 'b', '3': 'c', '4': 'd' }
            if (keyMap[e.key]) {
                handleSelect(keyMap[e.key])
            } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
                if (current < questions.length - 1) {
                    goToQuestion(current + 1)
                }
            } else if (e.key === 'ArrowLeft') {
                if (current > 0) goToQuestion(current - 1)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [current, q])

    const persistTime = () => {
        if (!q) return
        const timeSpent = (Date.now() - startTime) / 1000

        setAnswers(prev => ({
            ...prev,
            [q.id]: {
                selected_answer: prev[q.id]?.selected_answer || null,
                time_spent_seconds: (prev[q.id]?.time_spent_seconds || 0) + timeSpent,
                marked: prev[q.id]?.marked || false
            }
        }))

        setStartTime(Date.now())
    }

    const handleSelect = (opt) => {
        const timeSpent = (Date.now() - startTime) / 1000

        setAnswers(prev => ({
            ...prev,
            [q.id]: {
                selected_answer: opt,
                time_spent_seconds: (prev[q.id]?.time_spent_seconds || 0) + timeSpent,
                marked: prev[q.id]?.marked || false
            }
        }))

        setStartTime(Date.now())
    }

    const toggleMark = () => {
        setAnswers(prev => ({
            ...prev,
            [q.id]: {
                selected_answer: prev[q.id]?.selected_answer || null,
                time_spent_seconds: prev[q.id]?.time_spent_seconds || 0,
                marked: !prev[q.id]?.marked
            }
        }))
    }

    const goToQuestion = (index) => {
        if (index < 0 || index >= questions.length) return
        setDirection(index > current ? 1 : -1)
        persistTime()
        setCurrent(index)
    }

    const handleFinish = () => {
        persistTime()

        const formattedAnswers = Object.entries(answers)
            .filter(([_, data]) => data.selected_answer)
            .map(([question_id, data]) => ({
                question_id: Number(question_id),
                selected_answer: data.selected_answer,
                time_spent_seconds: data.time_spent_seconds
            }))

        if (onFinish) onFinish(formattedAnswers)
    }

    const handleQuit = () => {
        if (window.confirm("¿Seguro que quieres abandonar el test? Se perderá el progreso.")) {
            window.location.href = '/tests'
        }
    }

    if (!q) return null

    const selected = answers[q.id]?.selected_answer
    const isMarked = answers[q.id]?.marked
    const answeredCount = Object.values(answers).filter(a => a?.selected_answer).length
    const progressPercent = (answeredCount / questions.length) * 100

    const minutes = timeLeft !== null ? String(Math.floor(timeLeft / 60)).padStart(2, '0') : null
    const seconds = timeLeft !== null ? String(timeLeft % 60).padStart(2, '0') : null

    const getBubbleStyle = (index) => {
        const question = questions[index]
        const ans = answers[question.id]
        let base = "w-8 h-8 text-[10px] font-black rounded-lg transition-all flex items-center justify-center relative overflow-hidden "

        if (index === current)
            return base + "bg-neon text-black shadow-[0_0_15px_rgba(198,255,51,0.5)] scale-110 z-10"

        if (ans?.marked)
            return base + "bg-orange-500/20 text-orange-400 border border-orange-500/40"

        if (ans?.selected_answer)
            return base + "bg-neon/10 text-neon/60 border border-neon/20"

        return base + "bg-white/5 text-slate-600 border border-white/5 hover:border-white/20 hover:text-slate-400"
    }

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 40 : -40,
            opacity: 0,
            scale: 0.99
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 40 : -40,
            opacity: 0,
            scale: 0.99
        })
    }

    return (
        <div className={`max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-700 relative ${mode === 'exam' ? 'selection:bg-red-500/30' : 'selection:bg-neon/30'}`}>

            {/* ── COCKPIT HUD ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 relative z-20">

                {/* Left Unit: Quit & Info */}
                <div className="glass rounded-2xl p-4 border border-white/5 flex items-center gap-4 bg-black/40 backdrop-blur-xl">
                    <button
                        onClick={handleQuit}
                        className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all group"
                    >
                        <LogOut className="w-4 h-4 group-hover:scale-110" />
                    </button>
                    <div>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Protocolo</p>
                        <p className="text-xs font-black text-white uppercase italic">{mode === 'exam' ? 'Examen Oficial' : 'Simulación Táctica'}</p>
                    </div>
                </div>

                {/* Center Unit: Timer HUD */}
                {timeLeft !== null && (
                    <div className="glass rounded-2xl p-4 border-2 border-neon/20 flex flex-col items-center justify-center relative overflow-hidden bg-black/60 shadow-[0_0_40px_rgba(198,255,51,0.05)]">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon/40 to-transparent" />
                        <p className="text-[9px] font-mono text-neon/60 uppercase tracking-[0.4em] mb-1">Tiempo Restante</p>
                        <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-neon'}`} />
                            <span className={`text-3xl font-black font-mono tracking-tighter tabular-nums ${timeLeft < 60 ? 'text-red-500' : 'text-white'}`}>
                                {minutes}:{seconds}
                            </span>
                        </div>
                    </div>
                )}

                {/* Right Unit: Stats HUD */}
                <div className="glass rounded-2xl p-4 border border-white/5 grid grid-cols-2 gap-2 bg-black/40 backdrop-blur-xl">
                    <div className="text-center border-r border-white/5">
                        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Respondidas</p>
                        <p className="text-xl font-black text-white">{answeredCount}<span className="text-xs text-slate-600 ml-1">/{questions.length}</span></p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Progreso</p>
                        <p className="text-xl font-black text-neon">{Math.round(progressPercent)}<span className="text-[10px]">%</span></p>
                    </div>
                </div>
            </div>

            {/* ── QUESTION NAVIGATOR (SQUIRES) ─────────────────────────────── */}
            <div className="flex flex-wrap gap-1.5 mb-10 justify-center max-w-3xl mx-auto">
                {questions.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={getBubbleStyle(index)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* ── MAIN CONTENT AREA ─────────────────────────────────────────── */}
            <div className="relative min-h-[500px]">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={current}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 600, damping: 45 },
                            opacity: { duration: 0.1 }
                        }}
                        className="w-full"
                    >
                        {/* Question Card */}
                        <div className="relative mb-8">
                            {/* Decorative elements */}
                            <div className="absolute -top-6 left-12 px-4 py-1.5 bg-[#0D0D0D] border border-white/10 rounded-full z-20 flex items-center gap-2">
                                <Target className="w-3 h-3 text-neon" />
                                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Pregunta {String(current + 1).padStart(2, '0')}</span>
                            </div>

                            <div className="glass rounded-[3rem] p-12 border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Cpu className="w-32 h-32" />
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon/20 to-transparent" />

                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center">
                                            <Activity className="w-5 h-5 text-neon" />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Analizando Nodo...</h4>
                                    </div>
                                    <button
                                        onClick={toggleMark}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${isMarked
                                            ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                                            : 'bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-white/30'}`}
                                    >
                                        <Flag className={`w-3.5 h-3.5 ${isMarked ? 'fill-current' : ''}`} />
                                        {isMarked ? 'Para revisar' : 'Marcar pregunta'}
                                    </button>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter leading-tight relative z-10">
                                    {q.text}
                                </h2>
                            </div>
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                            {OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => handleSelect(opt)}
                                    className={`group relative p-6 rounded-3xl border-2 text-left transition-all duration-300 transform active:scale-[0.98] overflow-hidden ${selected === opt
                                        ? 'border-neon bg-neon/10 shadow-[0_0_30px_rgba(198,255,51,0.15)]'
                                        : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-black transition-all ${selected === opt
                                            ? 'bg-neon border-neon text-black shadow-[0_0_15px_rgba(198,255,51,0.4)]'
                                            : 'bg-black/40 border-white/10 text-slate-500 group-hover:text-white group-hover:border-white/30 group-hover:bg-black/60'
                                            }`}>
                                            {opt.toUpperCase()}
                                        </div>
                                        <span className={`text-sm font-bold leading-relaxed flex-1 ${selected === opt ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            {q[`option_${opt}`]}
                                        </span>
                                    </div>

                                    {/* Selection Glow */}
                                    {selected === opt && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-neon/5 via-transparent to-transparent pointer-events-none" />
                                    )}

                                    {/* Decorative Icon */}
                                    <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Zap className={`w-8 h-8 ${selected === opt ? 'text-neon' : 'text-white'}`} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── BATTLE CONTROLS ────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row items-center gap-4 relative z-20">
                <div className="flex flex-1 w-full gap-4">
                    <button
                        onClick={() => goToQuestion(current - 1)}
                        disabled={current === 0}
                        className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 disabled:opacity-20 transition-all flex items-center justify-center gap-3"
                    >
                        <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>
                    <button
                        onClick={() => goToQuestion(current + 1)}
                        disabled={current === questions.length - 1}
                        className="flex-1 py-5 rounded-2xl bg-neon text-black font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(198,255,51,0.3)] hover:scale-[1.02] disabled:opacity-20 transition-all flex items-center justify-center gap-3"
                    >
                        Siguiente <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <button
                    onClick={handleFinish}
                    disabled={current !== questions.length - 1}
                    className="w-full md:w-auto px-12 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-neon transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                    <Trophy className="w-4 h-4" /> Corregir Test
                </button>
            </div>

            {/* Custom Styles for HUD Glow */}
            <style>{`
                .glass {
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(198,255,51,0.2);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}