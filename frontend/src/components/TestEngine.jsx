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
    Scroll
} from 'lucide-react'
import api from '../services/api'

export default function TestEngine({ questions = [], mode = 'normal', onFinish, timeLimit = null }) {

    const [current, setCurrent] = useState(0)
    const [answers, setAnswers] = useState({})
    const [timeLeft, setTimeLeft] = useState(timeLimit)
    const [startTime, setStartTime] = useState(Date.now())
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
            // Don't interfere with text inputs
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

        let base = "w-8 h-8 text-xs font-black rounded-full transition-all flex items-center justify-center "

        if (index === current)
            return base + "border-2 border-neon bg-neon text-black"

        if (ans?.marked)
            return base + "bg-yellow-500 text-black"

        if (ans?.selected_answer)
            return base + "bg-neon/30 text-neon"

        return base + "bg-white/5 text-slate-500"
    }

    return (
        <div className={`max-w-4xl mx-auto animate-in fade-in duration-700 relative ${mode === 'exam' ? 'selection:bg-red-500/30' : 'selection:bg-neon/30'}`}>

            {/* RPG Background Elements for Exam - SACRED MIST */}
            {mode === 'exam' && (
                <>
                    <div className="absolute top-[-25%] right-[-15%] w-[70%] h-[70%] bg-gradient-to-br from-red-950/10 via-red-900/5 to-transparent blur-[160px] rounded-full opacity-30 pointer-events-none" />
                    <div className="absolute bottom-[-15%] left-[-15%] w-[50%] h-[50%] bg-gradient-to-tr from-stone-900/40 via-red-950/5 to-transparent blur-[120px] rounded-full opacity-20 pointer-events-none" />
                </>
            )}

            {/* HEADER SUPERIOR */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <button
                    onClick={handleQuit}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase transition-all px-5 py-2.5 rounded-xl border-2 backdrop-blur-md ${mode === 'exam'
                        ? 'text-stone-400 border-stone-800 bg-stone-950/40 hover:text-white hover:border-stone-700 hover:bg-stone-900/60'
                        : 'text-slate-500 border-white/5 bg-white/5 hover:text-white hover:border-white/10 hover:bg-white/10'}`}
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Finalizar Sesión
                </button>

                {timeLeft !== null && (
                    <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border bg-stone-950/80 backdrop-blur-xl font-mono text-xs shadow-2xl transition-all ${mode === 'exam' ? 'border-stone-800 text-stone-300' : 'text-neon border-neon/30'}`}>
                        <div className="relative">
                            <Flame className={`w-4 h-4 ${mode === 'exam' ? 'text-stone-600' : 'text-neon'}`} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[7px] uppercase opacity-40 font-black tracking-[0.3em] mb-0.5">Tiempo Restante</span>
                            <span className="text-base font-black tracking-tighter tabular-nums leading-none">{minutes}:{seconds}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* BOLITAS (SQUIRES) */}
            <div className="flex flex-wrap gap-2.5 mb-8 justify-center relative z-10">
                {questions.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={getBubbleStyle(index)}
                    >
                        <span className="relative z-10">{index + 1}</span>
                        {index === current && <div className="absolute inset-0 bg-current blur-md opacity-20" />}
                    </button>
                ))}
            </div>

            {/* BARRA PROGRESO (XP BAR STYLE) */}
            <div className={`h-4 bg-black/40 border rounded-full mb-10 overflow-hidden relative z-10 p-1 ${mode === 'exam' ? 'border-red-500/20' : 'border-white/5'}`}>
                <div
                    className={`h-full transition-all duration-700 rounded-full relative overflow-hidden ${mode === 'exam' ? 'bg-gradient-to-r from-red-600 via-orange-500 to-red-500' : 'bg-gradient-to-r from-neon to-cyan-400'}`}
                    style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full" />
                </div>
            </div>

            {/* PREGUNTA (ANCIENT STONE TABLET) */}
            <div className={`relative mb-12 group z-10 ${mode === 'exam' ? 'animate-in zoom-in duration-1000' : ''}`}>
                {mode === 'exam' && (
                    <>
                        {/* Tablet Shadow & Glow */}
                        <div className="absolute -inset-2 bg-stone-950/60 blur-xl opacity-80 pointer-events-none" />

                        {/* Structural Pillars (Visual only) */}
                        <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-stone-700 z-20 rounded-tl-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
                        <div className="absolute -top-4 -right-4 w-12 h-12 border-t-4 border-r-4 border-stone-700 z-20 rounded-tr-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
                        <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-4 border-l-4 border-stone-700 z-20 rounded-bl-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-stone-700 z-20 rounded-br-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)]" />

                        {/* Runic Connector Lines */}
                        <div className="absolute top-1/2 -left-1 w-1 h-32 -translate-y-1/2 bg-stone-800/40 blur-[1px] rounded-full z-10" />
                        <div className="absolute top-1/2 -right-1 w-1 h-32 -translate-y-1/2 bg-stone-800/40 blur-[1px] rounded-full z-10" />
                    </>
                )}

                <div className={`relative rounded-[3.5rem] p-0.5 overflow-hidden transition-all duration-1000 ${mode === 'exam' ? 'bg-[#1a1a1a] border-2 border-stone-800 shadow-[0_35px_80px_-20px_rgba(0,0,0,1)]' : 'glass border border-white/10'}`}>
                    {/* Stone Texture Layers */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.4] pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-stone-950/0 via-white/[0.01] to-stone-950/30 pointer-events-none" />

                    <div className={`relative p-16 text-center overflow-hidden h-full ${mode === 'exam' ? 'bg-gradient-to-b from-stone-900/60 to-stone-950/90' : ''}`}>
                        <div className="flex justify-between items-center mb-12 relative z-10 px-4">
                            <div className="flex items-center gap-4">
                                <Scroll className={`w-5 h-5 ${mode === 'exam' ? 'text-stone-500' : 'text-slate-500'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${mode === 'exam' ? 'text-stone-400/60' : 'text-slate-400'}`}>
                                    Entrada {current + 1} <span className="opacity-30">/</span> {questions.length}
                                </span>
                            </div>

                            <button
                                onClick={toggleMark}
                                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-6 py-3 rounded-2xl border ${isMarked
                                    ? 'text-orange-400 border-orange-900/40 bg-orange-950/20 shadow-[0_0_20px_rgba(249,115,22,0.05)]'
                                    : 'text-stone-500 border-stone-800 hover:text-white hover:border-stone-700'
                                    }`}
                            >
                                <Flag className={`w-4 h-4 ${isMarked ? 'animate-bounce' : ''}`} />
                                {isMarked ? 'Fichado' : 'Marcar para después'}
                            </button>
                        </div>

                        <div className="relative inline-block mb-4 max-w-2xl px-8">
                            {mode === 'exam' && (
                                <Skull className="w-40 h-40 text-stone-100/[0.01] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            )}
                            <h2 className={`text-2xl font-black leading-relaxed tracking-tight relative z-10 ${mode === 'exam' ? 'text-stone-100 drop-shadow-[0_4px_15px_rgba(0,0,0,1)]' : 'text-white/90'}`}>
                                {q.text}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* OPCIONES (LEGENDARY SLOTS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 relative z-10">
                {OPTIONS.map((opt, idx) => (
                    <button
                        key={opt}
                        onClick={() => handleSelect(opt)}
                        className={`group relative p-7 rounded-[2rem] border-2 text-left transition-all duration-400 transform active:scale-[0.98] overflow-hidden ${selected === opt
                            ? (mode === 'exam' ? 'border-stone-400 bg-stone-900/60 shadow-[0_15px_40px_rgba(0,0,0,0.4)]' : 'border-neon bg-neon/10 shadow-[0_0_40px_var(--neon-alpha-20)]')
                            : 'border-white/5 bg-white/[0.01] text-stone-500 hover:border-white/10 hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-black transition-all ${selected === opt
                                ? (mode === 'exam' ? 'bg-stone-100 border-white text-black shadow-[0_0_20px_white/10]' : 'bg-neon border-neon text-black')
                                : 'bg-black/40 border-white/5 group-hover:border-white/20 text-stone-500 group-hover:text-stone-300'
                                }`}>
                                {opt.toUpperCase()}
                            </div>
                            <span className={`text-sm font-bold leading-relaxed flex-1 ${selected === opt ? 'text-stone-100' : 'group-hover:text-stone-200'}`}>
                                {q[`option_${opt}`]}
                            </span>
                        </div>
                        {selected === opt && (
                            <div className="absolute top-0 right-0 p-4 opacity-30">
                                <Zap className={`w-5 h-5 ${mode === 'exam' ? 'text-stone-100' : 'text-neon'}`} />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* BOTONES INFERIORES (BATTLE CONTROLS) */}
            <div className="flex items-center gap-6 relative z-10">
                <button
                    onClick={() => goToQuestion(current - 1)}
                    disabled={current === 0}
                    className={`flex-1 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] disabled:opacity-20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-2xl ${mode === 'exam' ? 'bg-white/5 border-2 border-white/10 text-white' : 'bg-white/5 text-slate-400 border border-white/10'}`}
                >
                    <ChevronLeft className="w-5 h-5" />
                    Retorno
                </button>

                <button
                    onClick={() => goToQuestion(current + 1)}
                    disabled={current === questions.length - 1}
                    className={`flex-1 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] disabled:opacity-20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-2xl ${mode === 'exam' ? 'bg-gradient-to-r from-red-600 to-red-500 text-black shadow-[0_0_40px_rgba(239,68,68,0.3)]' : 'bg-neon text-black shadow-[0_0_30px_var(--neon-alpha-40)]'}`}
                >
                    Avanzar
                    <ChevronRight className="w-5 h-5" />
                </button>

                <button
                    onClick={handleFinish}
                    className="group relative px-12 py-5 rounded-[2.5rem] bg-stone-900 border-2 border-stone-800 hover:border-stone-600 hover:bg-stone-800 text-stone-400 hover:text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all overflow-hidden flex items-center justify-center gap-4 shadow-2xl"
                >
                    <div className="absolute inset-0 bg-white/5 skew-x-[-20deg] translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-1000" />
                    <Trophy className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Finalizar Test
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2.5s infinite;
                }
            `}} />
        </div>
    )
}