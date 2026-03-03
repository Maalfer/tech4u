import React, { useState, useEffect, useRef } from 'react'
import {
    ChevronRight,
    ChevronLeft,
    Clock,
    LogOut,
    Flag
} from 'lucide-react'
import api from '../services/api'

export default function TestEngine({ questions = [], mode = 'normal', onFinish }) {

    const [current, setCurrent] = useState(0)
    const [answers, setAnswers] = useState({})
    const [timeLeft, setTimeLeft] = useState(mode === 'exam' ? 1200 : null)
    const [startTime, setStartTime] = useState(Date.now())
    const timerRef = useRef(null)

    const q = questions[current]
    const OPTIONS = ['a', 'b', 'c', 'd']

    // ---------- TIMER ----------
    useEffect(() => {
        if (mode === 'exam' && timeLeft !== null) {
            if (timeLeft <= 0) {
                handleFinish()
                return
            }
            timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
        }
        return () => clearTimeout(timerRef.current)
    }, [timeLeft])

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
            return base + "border-2 border-[#39FF14] bg-[#39FF14] text-black"

        if (ans?.marked)
            return base + "bg-yellow-500 text-black"

        if (ans?.selected_answer)
            return base + "bg-[#39FF14]/30 text-[#39FF14]"

        return base + "bg-white/5 text-slate-500"
    }

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">

            {/* HEADER SUPERIOR */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={handleQuit}
                    className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase hover:text-red-400"
                >
                    <LogOut className="w-4 h-4" />
                    Abandonar Test
                </button>

                {timeLeft !== null && (
                    <div className="flex items-center gap-2 font-mono text-xs text-[#39FF14]">
                        <Clock className="w-4 h-4" />
                        {minutes}:{seconds}
                    </div>
                )}
            </div>

            {/* BOLITAS */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
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

            {/* BARRA PROGRESO */}
            <div className="h-2 bg-white/5 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-[#39FF14] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* PREGUNTA */}
            <div className="glass rounded-3xl p-8 mb-6 border border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-slate-400">
                        Pregunta {current + 1} de {questions.length}
                    </span>

                    <button
                        onClick={toggleMark}
                        className={`relative z-10 flex items-center gap-2 text-xs font-bold uppercase transition-all ${
                            isMarked
                                ? 'text-orange-500'
                                : 'text-orange-400 hover:text-orange-500'
                        }`}
                    >
                        <Flag className="w-4 h-4" />
                        {isMarked ? 'Desmarcar' : 'Marcar para después'}
                    </button>
                </div>

                <h2 className="text-lg font-bold">{q.text}</h2>
            </div>

            {/* OPCIONES */}
            <div className="grid gap-3 mb-8">
                {OPTIONS.map(opt => (
                    <button
                        key={opt}
                        onClick={() => handleSelect(opt)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                            selected === opt
                                ? 'border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]'
                                : 'border-white/10 text-slate-400 hover:border-[#39FF14]/40'
                        }`}
                    >
                        {q[`option_${opt}`]}
                    </button>
                ))}
            </div>

            {/* BOTONES INFERIORES */}
            <div className="flex justify-between items-center mt-8">

                <div className="flex gap-6 mx-auto">
                    <button
                        onClick={() => goToQuestion(current - 1)}
                        disabled={current === 0}
                        className="px-8 py-3 bg-[#39FF14] text-black rounded-xl font-black uppercase text-xs disabled:opacity-30 hover:scale-105 transition-all"
                    >
                        <ChevronLeft className="inline w-4 h-4 mr-2" />
                        Pregunta Anterior
                    </button>

                    <button
                        onClick={() => goToQuestion(current + 1)}
                        disabled={current === questions.length - 1}
                        className="px-8 py-3 bg-[#39FF14] text-black rounded-xl font-black uppercase text-xs disabled:opacity-30 hover:scale-105 transition-all"
                    >
                        Siguiente Pregunta
                        <ChevronRight className="inline w-4 h-4 ml-2" />
                    </button>
                </div>

                <button
                    onClick={handleFinish}
                    className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase text-xs transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                >
                    Finalizar Test
                </button>

            </div>

        </div>
    )
}