import { useState, useEffect, useRef } from 'react'
import { CheckCircle, XCircle, ChevronRight, Clock, Trophy } from 'lucide-react'

export default function TestEngine({ questions = [], mode = 'normal', onFinish }) {
    const [current, setCurrent] = useState(0)
    const [selected, setSelected] = useState(null)
    const [confirmed, setConfirmed] = useState(false)
    const [answers, setAnswers] = useState([])
    const [timeLeft, setTimeLeft] = useState(mode === 'exam' ? 600 : null) // 10 min for exam
    const [startTime, setStartTime] = useState(Date.now())
    const timerRef = useRef(null)

    const q = questions[current]
    const isLast = current === questions.length - 1
    const OPTIONS = ['a', 'b', 'c', 'd']
    const OPT_LABELS = { a: q?.option_a, b: q?.option_b, c: q?.option_c, d: q?.option_d }

    useEffect(() => {
        if (mode === 'exam' && timeLeft !== null) {
            if (timeLeft <= 0) { handleFinish(); return }
            timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
        }
        return () => clearTimeout(timerRef.current)
    }, [timeLeft, mode])

    const handleSelect = (opt) => {
        if (confirmed) return
        setSelected(opt)
    }

    const handleConfirm = () => {
        if (!selected) return
        const timeSpent = (Date.now() - startTime) / 1000
        setConfirmed(true)
        setAnswers(prev => [...prev, {
            question_id: q.id,
            selected_answer: selected,
            time_spent_seconds: timeSpent,
        }])
    }

    const handleNext = () => {
        if (isLast) {
            handleFinish()
            return
        }
        setCurrent(i => i + 1)
        setSelected(null)
        setConfirmed(false)
        setStartTime(Date.now())
    }

    const handleFinish = () => {
        clearTimeout(timerRef.current)
        if (onFinish) onFinish(answers)
    }

    if (!q) return null

    const optionStyle = (opt) => {
        if (!confirmed) {
            return selected === opt
                ? 'border-[#39FF14] bg-[rgba(57,255,20,0.1)] text-[#39FF14]'
                : 'border-[rgba(57,255,20,0.2)] hover:border-[rgba(57,255,20,0.5)] hover:bg-[rgba(57,255,20,0.05)]'
        }
        if (opt === q.correct_answer) return 'border-[#39FF14] bg-[rgba(57,255,20,0.15)] text-[#39FF14]'
        if (opt === selected && opt !== q.correct_answer) return 'border-red-500 bg-[rgba(255,50,50,0.1)] text-red-400'
        return 'border-[rgba(57,255,20,0.08)] opacity-40'
    }

    const minutes = timeLeft !== null ? String(Math.floor(timeLeft / 60)).padStart(2, '0') : null
    const seconds = timeLeft !== null ? String(timeLeft % 60).padStart(2, '0') : null

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-slate-500">
                    Pregunta {current + 1} / {questions.length}
                </span>
                {timeLeft !== null && (
                    <div className={`flex items-center gap-1.5 font-mono text-sm px-3 py-1 rounded-full glass neon-border ${timeLeft < 60 ? 'text-red-400 border-red-500' : 'text-[#39FF14]'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {minutes}:{seconds}
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full bg-[rgba(57,255,20,0.1)] mb-6">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${((current) / questions.length) * 100}%`,
                        background: 'linear-gradient(90deg, #00FF41, #39FF14)',
                        boxShadow: '0 0 8px rgba(57,255,20,0.5)',
                    }}
                />
            </div>

            {/* Question */}
            <div className="glass rounded-2xl p-6 mb-5 neon-border">
                <span className="inline-block text-xs font-mono text-[#39FF14] bg-[rgba(57,255,20,0.1)] px-2.5 py-0.5 rounded-full mb-3 capitalize">
                    {q.difficulty}
                </span>
                <h2 className="text-lg font-semibold leading-relaxed text-slate-100">{q.text}</h2>
            </div>

            {/* Options */}
            <div className="grid gap-3 mb-5">
                {OPTIONS.map(opt => (
                    <button
                        key={opt}
                        onClick={() => handleSelect(opt)}
                        className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 glass-hover ${optionStyle(opt)} ${confirmed ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                        <span className="flex-shrink-0 w-7 h-7 rounded-full border border-current flex items-center justify-center text-sm font-mono font-bold">{opt.toUpperCase()}</span>
                        <span className="text-sm leading-relaxed">{OPT_LABELS[opt]}</span>
                        {confirmed && opt === q.correct_answer && <CheckCircle className="ml-auto flex-shrink-0 w-5 h-5 text-[#39FF14]" />}
                        {confirmed && opt === selected && opt !== q.correct_answer && <XCircle className="ml-auto flex-shrink-0 w-5 h-5 text-red-400" />}
                    </button>
                ))}
            </div>

            {/* Explanation (shown after confirm, not in exam mode) */}
            {confirmed && mode !== 'exam' && q.explanation && (
                <div className="mb-5 p-4 rounded-xl border border-[rgba(57,255,20,0.2)] bg-[rgba(57,255,20,0.04)]">
                    <p className="text-xs font-mono text-[#39FF14] uppercase tracking-wider mb-1">Explicación</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{q.explanation}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
                {!confirmed ? (
                    <button
                        onClick={handleConfirm}
                        disabled={!selected}
                        className={`btn-neon-solid flex items-center gap-2 ${!selected ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                        Confirmar
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="btn-neon-solid flex items-center gap-2"
                    >
                        {isLast ? (
                            <><Trophy className="w-4 h-4" /> Ver resultados</>
                        ) : (
                            <>Siguiente <ChevronRight className="w-4 h-4" /></>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
