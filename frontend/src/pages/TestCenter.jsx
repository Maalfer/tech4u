import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FlaskConical, AlertCircle, Trophy, RefreshCw } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import TestEngine from '../components/TestEngine'
import api from '../services/api'

const MODES = [
    { key: 'normal', label: 'Test Normal', desc: 'Práctica libre con explicaciones inmediatas', icon: '📚', color: 'border-[rgba(57,255,20,0.3)] hover:border-[#39FF14]' },
    { key: 'exam', label: 'Modo Examen', desc: '10 minutos. Sin pistas. Puntúa tu rendimiento real', icon: '⏱️', color: 'border-blue-500/30 hover:border-blue-400' },
    { key: 'errors', label: 'Test de Errores', desc: 'Solo las preguntas que has fallado anteriormente', icon: '🔥', color: 'border-orange-500/30 hover:border-orange-400' },
]

const SUBJECTS = ['Bases de Datos', 'Redes', 'Sistemas Operativos', 'Ciberseguridad', 'Programación']

export default function TestCenter() {
    const [params] = useSearchParams()
    const navigate = useNavigate()

    const [subject, setSubject] = useState(params.get('subject') || '')
    const [mode, setMode] = useState('')
    const [questions, setQuestions] = useState([])
    const [phase, setPhase] = useState('select') // select | running | results
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const startTest = async () => {
        if (!mode) return
        setLoading(true)
        setError(null)
        try {
            const endpoint = mode === 'errors' ? '/tests/failed' : '/tests/questions'
            const res = await api.get(endpoint, { params: { subject: subject || undefined, limit: 20 } })
            if (res.data.length === 0) {
                setError(mode === 'errors' ? 'No tienes errores registrados en esta asignatura. ¡Buen trabajo!' : 'No se encontraron preguntas para esta asignatura.')
                setLoading(false)
                return
            }
            setQuestions(res.data)
            setPhase('running')
        } catch {
            setError('No se pudieron cargar las preguntas. Comprueba que el servidor está activo.')
        } finally {
            setLoading(false)
        }
    }

    const handleFinish = async (answers) => {
        try {
            const res = await api.post('/tests/submit', {
                subject: subject || 'General',
                answers,
                test_mode: mode,
            })
            setResults(res.data)
            setPhase('results')
        } catch {
            setPhase('results')
            setResults(null)
        }
    }

    const handleReset = () => { setPhase('select'); setQuestions([]); setResults(null); setError(null) }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <FlaskConical className="w-5 h-5 text-[#39FF14]" />
                        <h1 className="text-2xl font-black text-white">Test Center</h1>
                    </div>
                    <p className="text-slate-500 font-mono text-sm">Selecciona modo y asignatura para empezar</p>
                </div>

                {/* SELECT PHASE */}
                {phase === 'select' && (
                    <div className="max-w-2xl">
                        {/* Subject selector */}
                        <div className="mb-6">
                            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Asignatura</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSubject('')}
                                    className={`px-4 py-2 rounded-lg text-sm font-mono border transition-all duration-200 ${!subject ? 'bg-[rgba(57,255,20,0.12)] text-[#39FF14] border-[rgba(57,255,20,0.4)]' : 'text-slate-400 border-[rgba(57,255,20,0.15)] hover:border-[rgba(57,255,20,0.4)]'}`}
                                >
                                    Todas
                                </button>
                                {SUBJECTS.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSubject(s)}
                                        className={`px-4 py-2 rounded-lg text-sm font-mono border transition-all duration-200 ${subject === s ? 'bg-[rgba(57,255,20,0.12)] text-[#39FF14] border-[rgba(57,255,20,0.4)]' : 'text-slate-400 border-[rgba(57,255,20,0.15)] hover:border-[rgba(57,255,20,0.4)]'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mode selector */}
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Modo de test</p>
                        <div className="grid gap-4 mb-6">
                            {MODES.map(m => (
                                <button
                                    key={m.key}
                                    onClick={() => setMode(m.key)}
                                    className={`glass rounded-xl p-5 border text-left transition-all duration-200 group ${m.color} ${mode === m.key ? 'bg-[rgba(57,255,20,0.06)]' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{m.icon}</span>
                                        <div>
                                            <p className="font-black font-mono text-white">{m.label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                                        </div>
                                        {mode === m.key && <div className="ml-auto w-3 h-3 rounded-full bg-[#39FF14] glow-neon" />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 text-sm text-orange-400 bg-[rgba(255,150,50,0.08)] border border-orange-500/20 rounded-lg p-3 mb-4">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={startTest}
                            disabled={!mode || loading}
                            className={`btn-neon-solid w-full py-4 text-base flex items-center justify-center gap-3 ${!mode ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>🚀 Empezar Test</>
                            )}
                        </button>
                    </div>
                )}

                {/* RUNNING PHASE */}
                {phase === 'running' && (
                    <TestEngine
                        questions={questions}
                        mode={mode}
                        onFinish={handleFinish}
                    />
                )}

                {/* RESULTS PHASE */}
                {phase === 'results' && results && (
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="glass rounded-2xl p-10 neon-border mb-6">
                            <Trophy className="w-16 h-16 text-[#39FF14] mx-auto mb-4 glow-neon" style={{ filter: 'drop-shadow(0 0 15px #39FF14)' }} />
                            <h2 className="text-3xl font-black text-white mb-2">
                                {results.accuracy >= 80 ? '¡Excelente!' : results.accuracy >= 60 ? '¡Buen trabajo!' : 'Sigue practicando'}
                            </h2>
                            <p className="text-slate-500 font-mono text-sm mb-8">Resultado del test completado</p>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {[
                                    ['Correctas', results.correct, 'text-[#39FF14]'],
                                    ['Falladas', results.total - results.correct, 'text-red-400'],
                                    ['Precisión', `${results.accuracy}%`, 'text-[#39FF14] glow-text'],
                                ].map(([label, value, style]) => (
                                    <div key={label} className="glass rounded-xl p-4 neon-border">
                                        <p className={`text-3xl font-black font-mono ${style}`}>{value}</p>
                                        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mt-1">{label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button onClick={handleReset} className="btn-neon flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4" /> Otro test
                                </button>
                                <button onClick={() => navigate('/dashboard')} className="btn-neon-solid">
                                    Ver progreso →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
