import { useState, useEffect, useRef } from 'react'
import { 
    CheckCircle, 
    XCircle, 
    ChevronRight, 
    Clock, 
    Trophy, 
    AlertTriangle, 
    X, 
    Send,
    LogOut 
} from 'lucide-react'
import api from '../services/api'

export default function TestEngine({ questions = [], mode = 'normal', onFinish }) {
    const [current, setCurrent] = useState(0)
    const [selected, setSelected] = useState(null)
    const [confirmed, setConfirmed] = useState(false)
    const [answers, setAnswers] = useState([])
    // MEJORA: Tiempo de examen ampliado a 20 minutos (1200 segundos)
    const [timeLeft, setTimeLeft] = useState(mode === 'exam' ? 1200 : null) 
    const [startTime, setStartTime] = useState(Date.now())
    const timerRef = useRef(null)

    // Estados para el Modal de Reporte
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportText, setReportText] = useState('')
    const [isSendingReport, setIsSendingReport] = useState(false)

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

    // NUEVA FUNCIÓN: Enviar reporte de error
    const handleSendReport = async () => {
        if (!reportText.trim()) return
        setIsSendingReport(true)
        try {
            await api.post('/tests/report-error', {
                subject: `Error en Pregunta ID: ${q.id}`,
                description: reportText
            })
            alert("Reporte enviado con éxito. El administrador lo revisará.")
            setShowReportModal(false)
            setReportText('')
        } catch (err) {
            alert("Error al enviar el reporte. Inténtalo de nuevo.")
        } finally {
            setIsSendingReport(false)
        }
    }

    // NUEVA FUNCIÓN: Abandonar test
    const handleQuit = () => {
        if (window.confirm("¿Estás seguro de que quieres abandonar el test? No se guardará el progreso.")) {
            window.location.href = '/tests'
        }
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
        return 'border-[rgba(255,255,255,0.05)] opacity-40'
    }

    const minutes = timeLeft !== null ? String(Math.floor(timeLeft / 60)).padStart(2, '0') : null
    const seconds = timeLeft !== null ? String(timeLeft % 60).padStart(2, '0') : null

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleQuit}
                        className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" /> Abandonar
                    </button>
                    <span className="text-xs font-mono text-slate-500">
                        Pregunta {current + 1} / {questions.length}
                    </span>
                </div>
                
                {timeLeft !== null && (
                    <div className={`flex items-center gap-1.5 font-mono text-sm px-3 py-1 rounded-full glass neon-border ${timeLeft < 60 ? 'text-red-400 border-red-500' : 'text-[#39FF14]'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {minutes}:{seconds}
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full bg-[rgba(255,255,255,0.05)] mb-6 overflow-hidden">
                <div
                    className="h-full transition-all duration-500"
                    style={{
                        width: `${((current + (confirmed ? 1 : 0)) / questions.length) * 100}%`,
                        background: 'linear-gradient(90deg, #00FF41, #39FF14)',
                        boxShadow: '0 0 10px rgba(57,255,20,0.3)',
                    }}
                />
            </div>

            {/* Question Card */}
            <div className="glass rounded-2xl p-6 mb-5 neon-border relative group">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-mono text-[#39FF14] bg-[rgba(57,255,20,0.1)] px-2 py-0.5 rounded border border-[#39FF14]/20 uppercase tracking-widest">
                        {q.difficulty}
                    </span>
                    {/* BOTÓN REPORTAR ERROR */}
                    <button 
                        onClick={() => setShowReportModal(true)}
                        className="text-slate-600 hover:text-orange-400 transition-colors flex items-center gap-1 text-[10px] font-mono uppercase"
                        title="Reportar fallo en esta pregunta"
                    >
                        <AlertTriangle className="w-3.5 h-3.5" /> Reportar
                    </button>
                </div>
                <h2 className="text-lg font-bold leading-relaxed text-white">{q.text}</h2>
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

            {/* Explanation */}
            {confirmed && mode !== 'exam' && q.explanation && (
                <div className="mb-5 p-4 rounded-xl border border-[rgba(57,255,20,0.15)] bg-[rgba(57,255,20,0.02)] animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-mono text-[#39FF14] uppercase tracking-widest mb-2 opacity-70">Análisis técnico</p>
                    <p className="text-sm text-slate-400 leading-relaxed italic">{q.explanation}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
                {!confirmed ? (
                    <button
                        onClick={handleConfirm}
                        disabled={!selected}
                        className={`btn-neon-solid px-8 py-2.5 ${!selected ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                        Confirmar respuesta
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="btn-neon-solid flex items-center gap-2 px-8 py-2.5"
                    >
                        {isLast ? (
                            <><Trophy className="w-4 h-4" /> Finalizar y Evaluar</>
                        ) : (
                            <>Siguiente pregunta <ChevronRight className="w-4 h-4" /></>
                        )}
                    </button>
                )}
            </div>

            {/* MODAL DE REPORTE DE ERROR */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
                    <div className="glass p-6 rounded-2xl w-full max-w-md neon-border border-orange-500/30">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                                <AlertTriangle className="w-5 h-5 text-orange-400" /> Avisar de un error
                            </h3>
                            <button onClick={() => setShowReportModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-4 font-mono leading-relaxed">
                            ¿Crees que la respuesta es incorrecta o el enunciado tiene errores? Tu reporte ayuda a mejorar la academia.
                        </p>
                        <textarea 
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            className="w-full bg-black/50 border border-slate-800 rounded-xl p-4 text-sm text-white mb-4 h-32 outline-none focus:border-orange-500/50 font-mono transition-all"
                            placeholder="Describe el fallo detectado aquí..."
                        />
                        <button 
                            onClick={handleSendReport}
                            disabled={isSendingReport || !reportText.trim()}
                            className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl font-bold transition-all ${
                                !reportText.trim() 
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                                : 'bg-orange-500 text-black hover:bg-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                            }`}
                        >
                            <Send className="w-4 h-4" />
                            {isSendingReport ? 'Codificando reporte...' : 'Enviar a Revisión'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}