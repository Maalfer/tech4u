import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FlaskConical, AlertCircle, Trophy, RefreshCw, CheckCircle2, XCircle, Info, Target, Zap, TrendingUp, Star, Award } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import TestEngine from '../components/TestEngine'
import api from '../services/api'

const MODES = [
    { key: 'normal', label: 'Test Normal', desc: 'Práctica libre sin feedback inmediato', icon: '📚', color: 'border-[rgba(57,255,20,0.3)] hover:border-[#39FF14]' },
    { key: 'exam', label: 'Modo Examen', desc: '20 minutos. Simulación real de certificación', icon: '⏱️', color: 'border-blue-500/30 hover:border-blue-400' },
    { key: 'errors', label: 'Test de Errores', desc: 'Enfócate en tus puntos débiles anteriores', icon: '🔥', color: 'border-orange-500/30 hover:border-orange-400' },
]

const SUBJECTS = ['Bases de Datos', 'Redes', 'Sistemas Operativos', 'Ciberseguridad', 'Programación']

// --- COMPONENTE INTERNO: PANEL PREMIUM (LOGROS Y RANGO) ---
const PremiumPanel = ({ stats }) => {
    // Lógica de seguridad para evitar errores si los datos no cargan
    const progresoActual = stats?.weekly_goal?.current || 3;
    const progresoTotal = stats?.weekly_goal?.total || 5;

    return (
        <aside className="w-full lg:w-80 space-y-7 animate-in slide-in-from-right-10 duration-700 pt-6 flex-shrink-0">
            
            {/* CARD 1: RANGO PROFESIONAL */}
            <div className="glass rounded-2xl p-6 border border-[#39FF14]/20 bg-gradient-to-b from-[#39FF14]/5 to-transparent relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#39FF14]/10 rounded-full blur-2xl group-hover:bg-[#39FF14]/20 transition-all" />
                
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Star className="w-3 h-3 text-[#39FF14] animate-pulse" />
                    Nivel de cuenta
                </p>
                
                <h3 className="text-2xl font-black italic uppercase text-white mb-1">
                    Nivel 2<span className="text-[#39FF14]"> Especialista IT</span>
                </h3>
                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-tighter">
                    Próximo Rango: Especialista IT - Tier III
                </p>
                
                {/* Barra de Progreso de Nivel */}
                <div className="mt-5 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#39FF14] shadow-[0_0_10px_#39FF14] transition-all duration-1000" 
                        style={{ width: '65%' }} 
                    />
                </div>
            </div>

            {/* CARD 2: LOGROS RECIENTES (MEDALLAS) */}
            <div className="glass rounded-2xl p-6 border border-white/5 bg-white/[0.01]">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-5">Logros Desbloqueados</p>
                
                <div className="space-y-5">
                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                            <Zap className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-white uppercase italic">Velocidad de Rayo</p>
                            <p className="text-[9px] text-slate-500 font-mono">Test completado en menos de 5 min</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            <Award className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-white uppercase italic">Cero Fallos</p>
                            <p className="text-[9px] text-slate-500 font-mono">Test perfecto eres un crack!</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD 3: PERFORMANCE RÁPIDO */}
            <div className="glass rounded-2xl p-5 border border-white/5 bg-white/[0.01]">
                <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                        <p className="text-[8px] text-slate-500 uppercase mb-1">Racha</p>
                        <p className="text-xl font-black italic text-white">
                            {stats?.streak ?? 5} <span className="text-[#39FF14] text-[9px]">DÍAS</span>
                        </p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                        <p className="text-[8px] text-slate-500 uppercase mb-1">Ranking</p>
                        <p className="text-xl font-black italic text-white">
                            #{stats?.ranking ?? 18}
                        </p>
                    </div>
                </div>
            </div>

            {/* OBJETIVO SEMANAL */}
            <div className="px-2">
                <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase mb-3">
                    <span className="flex items-center gap-1.5">
                        <Target className="w-3 h-3" /> Objetivo Semanal
                    </span>
                    <span className="text-white font-bold">{progresoActual} / {progresoTotal} Tests</span>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div 
                            key={i} 
                            className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${i <= progresoActual ? 'bg-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.4)]' : 'bg-white/10'}`} 
                        />
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default function TestCenter() {
    const [params] = useSearchParams()
    const navigate = useNavigate()

    const [subject, setSubject] = useState(params.get('subject') || '')
    const [mode, setMode] = useState('')
    const [questions, setQuestions] = useState([])
    const [phase, setPhase] = useState('select') 
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [stats, setStats] = useState(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats')
                if (res.data) setStats(res.data)
            } catch (err) {
                console.warn("Error cargando estadísticas, usando fallback.");
            }
        }
        fetchStats()
    }, [])
    
    const startTest = async () => {
        if (!mode) return
        setLoading(true)
        setError(null)
        try {
            const endpoint = mode === 'errors' ? '/tests/failed' : '/tests/questions'
            const res = await api.get(endpoint, { params: { subject: subject || undefined, limit: 20 } })
            if (res.data.length === 0) {
                setError(mode === 'errors' ? 'No tienes errores registrados. ¡Estás al día!' : 'No hay preguntas disponibles para este sector.')
                setLoading(false)
                return
            }
            setQuestions(res.data)
            setPhase('running')
        } catch {
            setError('Fallo de conexión con el núcleo de datos.')
        } finally {
            setLoading(false)
        }
    }

    const handleFinish = async (answers) => {
        setLoading(true)
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
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => { setPhase('select'); setQuestions([]); setResults(null); setError(null) }

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-10 flex flex-col items-center">
                <div className="w-full max-w-[1240px]">
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-1.5">
                            <FlaskConical className="w-6 h-6 text-[#39FF14]" />
                            <h1 className="text-2xl font-black uppercase italic tracking-tight text-white">
                                Test <span className="text-[#39FF14]">Center</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Módulo de evaluación técnica</p>
                    </div>

                    {phase === 'select' && (
                        <div className="flex flex-col lg:flex-row gap-20 animate-in fade-in duration-500 items-start">
                            <div className="flex-1 w-full space-y-12">
                                <div>
                                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-5">Sector de especialización</p>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => setSubject('')}
                                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${!subject ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/40 shadow-[0_0_15px_rgba(57,255,20,0.1)]' : 'text-slate-500 border-white/5 hover:border-white/20'}`}
                                        >
                                            Global
                                        </button>
                                        {SUBJECTS.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setSubject(s)}
                                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${subject === s ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/40 shadow-[0_0_15px_rgba(57,255,20,0.1)]' : 'text-slate-500 border-white/5 hover:border-white/20'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-6">Protocolo de ejecución</p>
                                    <div className="space-y-6">
                                        {MODES.map(m => (
                                            <button
                                                key={m.key}
                                                onClick={() => setMode(m.key)}
                                                className={`w-full glass rounded-2xl p-8 border-2 text-left transition-all group ${m.color} ${mode === m.key ? 'bg-[#39FF14]/5' : 'bg-transparent'}`}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">{m.icon}</span>
                                                    <div className="flex-1">
                                                        <p className="font-black uppercase italic text-sm tracking-tight text-white">{m.label}</p>
                                                        <p className="text-[11px] text-slate-500 font-mono mt-1.5 leading-relaxed">{m.desc}</p>
                                                    </div>
                                                    {mode === m.key && <div className="w-3 h-3 rounded-full bg-[#39FF14] shadow-[0_0_12px_#39FF14]" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-3 text-[10px] font-mono text-orange-400 bg-orange-400/5 border border-orange-400/20 rounded-xl p-5 uppercase tracking-wider">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={startTest}
                                    disabled={!mode || loading}
                                    className={`w-full py-6 rounded-2xl font-black uppercase italic tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${!mode ? 'bg-white/5 text-slate-700 cursor-not-allowed' : 'bg-[#39FF14] text-black hover:scale-[1.01] shadow-[0_0_30px_rgba(57,255,20,0.3)]'}`}
                                >
                                    {loading ? <span className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Inicializar Simulación 🚀'}
                                </button>
                            </div>

                            {/* COLUMNA DERECHA: Premium */}
                            <PremiumPanel stats={stats} />
                        </div>
                    )}

                    {phase === 'running' && (
                        <div className="animate-in fade-in duration-700">
                            <TestEngine questions={questions} mode={mode} onFinish={handleFinish} />
                        </div>
                    )}

                    {phase === 'results' && results && (
                        <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-10 duration-700">
                            <div className="glass rounded-[2rem] p-12 border border-white/5 mb-10 text-center relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-full h-1 ${results.accuracy >= 50 ? 'bg-[#39FF14]' : 'bg-red-500'}`} />
                                <Trophy className={`w-20 h-20 mx-auto mb-6 ${results.accuracy >= 50 ? 'text-[#39FF14]' : 'text-red-500'} drop-shadow-[0_0_20px_rgba(57,255,20,0.3)]`} />
                                <h2 className="text-4xl font-black text-white uppercase italic mb-2">
                                    {results.accuracy >= 50 ? 'Aprobado' : 'Suspendido'}
                                </h2>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-12">Reporte de rendimiento final</p>
                                <div className="grid grid-cols-3 gap-8 mb-12">
                                    {[
                                        ['Correctas', results.correct, 'text-[#39FF14]'],
                                        ['Falladas', (results.total || 0) - (results.correct || 0), 'text-red-500'],
                                        ['Porcentaje', `${results.accuracy}%`, results.accuracy >= 50 ? 'text-[#39FF14]' : 'text-red-500'],
                                    ].map(([label, value, color]) => (
                                        <div key={label} className="bg-white/[0.02] border border-white/5 rounded-2xl py-8">
                                            <p className={`text-3xl font-black font-mono mb-1 ${color}`}>{value}</p>
                                            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">{label}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-4 justify-center">
                                    <button onClick={handleReset} className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 text-white">
                                        <RefreshCw className="w-4 h-4" /> Reintentar
                                    </button>
                                    <button onClick={() => navigate('/dashboard')} className="px-10 py-4 bg-[#39FF14] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                        Finalizar Módulo
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}