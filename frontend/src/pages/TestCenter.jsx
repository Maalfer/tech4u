import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    AlertCircle, Zap, ChevronRight, ChevronLeft,
    BookOpen, ClipboardList, Bug, Target, Clock, Shield, Flame, Trophy
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import TestEngine from '../components/TestEngine'
import TestResults from '../components/TestResults'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

// Custom PNG Icons
import examIcon from '../assets/exam_icon.png';
import bbddIcon from '../assets/basededatos_icon.png';
import redesIcon from '../assets/redes_icon.png';
import soIcon from '../assets/sistemasoperativos_icon.png';
import hardwareIcon from '../assets/fundamentsohardware_icon.png';
import marcasIcon from '../assets/lenguajemarcas.png';

const SUBJECTS = [
    { key: 'general', label: 'Examen General', icon: examIcon, isCustom: true, color: 'from-yellow-600/20 to-yellow-900/10 border-yellow-500/30 hover:border-yellow-400/60', iconColor: 'text-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    { key: 'Bases de Datos', label: 'Bases de Datos', icon: bbddIcon, isCustom: true, color: 'from-violet-600/20 to-violet-900/10 border-violet-500/30 hover:border-violet-400/60', iconColor: 'text-violet-400', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
    { key: 'Redes', label: 'Redes', icon: redesIcon, isCustom: true, color: 'from-sky-600/20 to-sky-900/10 border-sky-500/30 hover:border-sky-400/60', iconColor: 'text-sky-400', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    { key: 'Sistemas Operativos', label: 'Sistemas Operativos', icon: soIcon, isCustom: true, color: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30 hover:border-emerald-400/60', iconColor: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    { key: 'Fundamentos de Hardware', label: 'Fundamentos de Hardware', icon: hardwareIcon, isCustom: true, color: 'from-orange-600/20 to-orange-900/10 border-orange-500/30 hover:border-orange-400/60', iconColor: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    { key: 'Lenguaje de Marcas', label: 'Lenguaje de Marcas', icon: marcasIcon, isCustom: true, color: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/30 hover:border-cyan-400/60', iconColor: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
]

const MODES = [
    { key: 'normal', label: 'Test Normal', desc: 'Práctica libre, 20 minutos', icon: BookOpen, color: 'border-neon/30 hover:border-neon/70', iconColor: 'text-neon', time: 1200 },
    { key: 'exam', label: 'Modo Examen', desc: '60 preguntas, 35 minutos. Supervivencia', icon: ClipboardList, color: 'border-red-500/30 hover:border-red-500/70', iconColor: 'text-red-500', time: 2100 },
    { key: 'errors', label: 'Test de Errores', desc: 'Repasa tus fallos sin límite de tiempo', icon: Bug, color: 'border-orange-500/30 hover:border-orange-400/70', iconColor: 'text-orange-400', time: null },
]

export default function TestCenter() {
    const navigate = useNavigate()
    const { user } = useAuth()

    // phases: 'subjects' → 'detail' → 'running' → 'results'
    const [phase, setPhase] = useState('subjects')
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [mode, setMode] = useState('')
    const [questionCount, setQuestionCount] = useState(20)
    const [questions, setQuestions] = useState([])
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [stats, setStats] = useState(null)

    useEffect(() => {
        api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => { })
    }, [])

    const currentXP = stats?.current_xp || 0
    const nextLevelXP = stats?.next_level_xp || 1000
    const xpPercent = Math.min(Math.round((currentXP / nextLevelXP) * 100), 100)
    const rankName = stats?.rank_name || (user?.rank_name) || 'Recruit'
    const userLevel = stats?.level || user?.level || 1

    const handleSelectSubject = (sub) => {
        setSelectedSubject(sub)
        setPhase('detail')
        setMode('')
        setError(null)
    }

    const startTest = async () => {
        if (!mode) return
        setLoading(true)
        setError(null)
        try {
            const endpoint = mode === 'errors' ? '/tests/failed' : '/tests/questions'
            let finalLimit = questionCount
            if (mode === 'exam') finalLimit = 60
            if (mode === 'errors') finalLimit = 1000

            const res = await api.get(endpoint, { params: { subject: selectedSubject?.key, limit: finalLimit } })
            if (res.data.length === 0) {
                setError(mode === 'errors' ? 'No tienes errores registrados. ¡Estás al día!' : 'No hay preguntas disponibles para esta asignatura.')
                setLoading(false)
                return
            }
            setQuestions(res.data)
            setPhase('running')
        } catch {
            setError('Fallo de conexión con el servidor.')
        } finally {
            setLoading(false)
        }
    }

    const handleFinish = async (answers) => {
        setLoading(true)
        try {
            const res = await api.post('/tests/submit', {
                subject: selectedSubject?.key || 'General',
                answers,
                test_mode: mode,
            })
            setResults(res.data)
            api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => { })
        } catch {
            setResults(null)
        } finally {
            setLoading(false)
            setPhase('results')
        }
    }

    const handleReset = () => {
        setPhase('subjects')
        setSelectedSubject(null)
        setMode('')
        setQuestionCount(20)
        setQuestions([])
        setResults(null)
        setError(null)
    }

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">

                {/* ── Header ── */}
                <PageHeader
                    title={<>Test<span className="text-white">Center</span></>}
                    subtitle={phase === 'subjects' ? 'Dungeon of Knowledge' :
                        phase === 'detail' ? `Asignatura: ${selectedSubject?.label}` :
                            phase === 'running' ? 'Test en curso...' : 'Resultados'}
                    Icon={Target}
                    gradient="from-white via-emerald-100 to-emerald-500"
                    iconColor="text-emerald-400"
                    iconBg="bg-emerald-500/20"
                    iconBorder="border-emerald-500/30"
                    glowColor="bg-emerald-500/20"
                />

                {/* ── PHASE: SUBJECTS GRID ── */}
                {phase === 'subjects' && (
                    <div className="animate-in fade-in duration-500">
                        {/* XP bar */}
                        <div className="glass rounded-2xl px-6 py-4 border border-slate-800 mb-8 flex items-center gap-6 max-w-2xl">
                            <div className="flex-shrink-0 text-center">
                                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">Rango</p>
                                <p className="text-sm font-black uppercase italic text-white leading-tight">{rankName}</p>
                                <p className="text-[9px] font-mono text-neon">Lv.{userLevel}</p>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between text-[10px] font-mono mb-1.5">
                                    <span className="text-slate-400 uppercase">Experiencia</span>
                                    <span className="text-neon font-bold">{currentXP} / {nextLevelXP} XP</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-neon to-cyan-400 shadow-[0_0_10px_var(--color-neon)] transition-all duration-1000 rounded-full"
                                        style={{ width: `${xpPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-6">
                            Elige tu asignatura
                        </p>
                        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-8 items-start">
                            {/* Grid de Asignaturas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 flex-1 w-full">
                                {SUBJECTS.map(sub => {
                                    const Icon = sub.icon
                                    return (
                                        <button
                                            key={sub.key}
                                            onClick={() => handleSelectSubject(sub)}
                                            className={`group glass rounded-3xl p-7 border-2 bg-gradient-to-br ${sub.color} text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]`}
                                        >
                                            <div className="flex items-center gap-5 mb-6">
                                                <div className="flex-shrink-0">
                                                    {sub.isCustom ? (
                                                        <img src={sub.icon} className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300" alt="" />
                                                    ) : (
                                                        <Icon className={`w-12 h-12 ${sub.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-black uppercase italic text-white leading-tight group-hover:text-white">
                                                    {sub.label}
                                                </h3>
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${sub.badge}`}>
                                                    ASIR
                                                </span>
                                                <ChevronRight className={`w-4 h-4 ${sub.iconColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Panel de Descripción lateral */}
                            <div className="w-full xl:w-[350px] glass rounded-3xl p-8 border-2 bg-gradient-to-br from-emerald-900/10 to-black/40 border-emerald-500/20 shadow-2xl xl:sticky xl:top-8 shrink-0">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
                                    <ClipboardList className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-black uppercase italic text-white mb-4">
                                    ¿Qué es Test Center?
                                </h3>
                                <div className="space-y-5 text-sm text-slate-400 leading-relaxed font-mono">
                                    <p>
                                        El Test Center es el núcleo de evaluación de Tech4U, donde validas tus conocimientos técnicos antes de enfrentarte al mundo real.
                                    </p>
                                    <div>
                                        <p className="text-emerald-400 font-bold mb-1 uppercase tracking-widest text-[10px]">Simulacros de Examen</p>
                                        <p>Entrena con preguntas reales de certificación y exámenes oficiales de ASIR para garantizar tu aprobado.</p>
                                    </div>
                                    <div>
                                        <p className="text-neon font-bold mb-1 uppercase tracking-widest text-[10px]">Modo Supervivencia</p>
                                        <p>Pon a prueba tu resistencia técnica. Responde sin fallos mientras la dificultad escala. Un solo error y estás fuera.</p>
                                    </div>
                                    <div>
                                        <p className="text-white/50 font-bold mb-1 uppercase tracking-widest text-[10px]">Análisis de Fallos</p>
                                        <p>Cada test fallido genera un reporte detallado para que sepas exactamente qué áreas de la teoría debes reforzar.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── PHASE: SUBJECT DETAIL (choose mode) ── */}
                {phase === 'detail' && selectedSubject && (
                    <div className="animate-in fade-in duration-400">

                        {/* Botón Volver */}
                        <button
                            onClick={() => { setPhase('subjects'); setMode(''); setError(null); }}
                            className="flex items-center gap-2 mb-6 text-slate-500 hover:text-white transition-colors group text-[11px] font-mono uppercase tracking-widest"
                        >
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </div>
                            Volver a asignaturas
                        </button>

                        <div className="flex flex-col xl:flex-row gap-8 items-start max-w-7xl">

                            {/* ── Columna izquierda: selección ── */}
                            <div className="flex-1 w-full">

                                {/* Subject hero */}
                                <div className={`glass rounded-3xl p-7 border-2 bg-gradient-to-br ${selectedSubject.color} mb-8 flex items-center gap-5`}>
                                    <div className="w-16 h-16 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                                        {selectedSubject.isCustom ? (
                                            <img src={selectedSubject.icon} className="w-9 h-9 object-contain" alt="" />
                                        ) : (
                                            <selectedSubject.icon className={`w-8 h-8 ${selectedSubject.iconColor}`} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Asignatura seleccionada</p>
                                        <h2 className="text-2xl font-black italic uppercase text-white">{selectedSubject.label}</h2>
                                    </div>
                                </div>

                                {/* Mode selection */}
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-4">
                                    Elige el tipo de test
                                </p>
                                <div className="space-y-3 mb-8">
                                    {MODES.map(m => {
                                        const MIcon = m.icon
                                        const isSelected = mode === m.key
                                        return (
                                            <button
                                                key={m.key}
                                                onClick={() => setMode(m.key)}
                                                className={`w-full glass rounded-2xl p-5 border-2 text-left transition-all duration-200 flex items-center gap-5 group ${m.color} ${isSelected ? 'bg-white/5 scale-[1.01]' : 'hover:bg-white/[0.03]'}`}
                                            >
                                                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-white/10 border-white/20' : 'bg-black/40 border-white/10 group-hover:border-white/20'}`}>
                                                    <MIcon className={`w-5 h-5 ${m.iconColor}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black uppercase italic text-sm text-white">{m.label}</p>
                                                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{m.desc}</p>
                                                </div>
                                                <div className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${isSelected ? `${m.iconColor.replace('text-', 'bg-')} border-transparent shadow-[0_0_8px_currentColor]` : 'bg-transparent border-white/10'}`} />
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Question count - solo modo normal */}
                                {mode === 'normal' && (
                                    <div className="mb-8">
                                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-4">
                                            Número de preguntas
                                        </p>
                                        <div className="flex gap-3">
                                            {[10, 20, 40].map(n => (
                                                <button
                                                    key={n}
                                                    onClick={() => setQuestionCount(n)}
                                                    className={`flex-1 py-3 rounded-xl font-black font-mono text-sm border-2 transition-all ${questionCount === n
                                                        ? 'bg-neon text-black border-neon shadow-[0_0_20px_rgba(198,255,51,0.3)]'
                                                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-neon/40 hover:text-white'
                                                        }`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {mode === 'exam' && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8 flex items-center gap-4">
                                        <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-black uppercase text-red-500 italic">Configuración de Examen</p>
                                            <p className="text-[10px] font-mono text-slate-400 uppercase">60 preguntas bloqueadas &middot; 35 minutos</p>
                                        </div>
                                    </div>
                                )}

                                {mode === 'errors' && (
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5 mb-8 flex items-center gap-4">
                                        <Bug className="text-orange-500 w-5 h-5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-black uppercase text-orange-500 italic">Modo Entrenamiento de Errores</p>
                                            <p className="text-[10px] font-mono text-slate-400 uppercase">Se cargarán todas tus preguntas falladas</p>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="flex items-center gap-3 text-[10px] font-mono text-orange-400 bg-orange-400/5 border border-orange-400/20 rounded-xl p-4 mb-6 uppercase tracking-wider">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                                    </div>
                                )}

                                <button
                                    onClick={startTest}
                                    disabled={!mode || loading}
                                    className={`w-full py-5 rounded-2xl font-black uppercase italic tracking-[0.15em] transition-all flex items-center justify-center gap-3 text-sm ${!mode ? 'bg-white/5 text-slate-700 cursor-not-allowed' : 'bg-neon text-black hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(198,255,51,0.4)]'}`}
                                >
                                    {loading
                                        ? <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        : <><Zap className="w-5 h-5" /> Iniciar {MODES.find(m => m.key === mode)?.label || 'Test'} — {mode === 'exam' ? '60' : mode === 'errors' ? 'Todas' : questionCount} preguntas 🚀</>
                                    }
                                </button>
                                <p className="text-center text-[9px] font-mono text-slate-700 mt-3 uppercase tracking-widest">
                                    Atajo: 1–4 para elegir respuesta &middot; Enter para confirmar
                                </p>
                            </div>

                            {/* ── Columna derecha: panel explicativo ── */}
                            <div className="w-full xl:w-[360px] shrink-0 xl:sticky xl:top-8 space-y-4">

                                {/* Card modo normal */}
                                <div className={`glass rounded-2xl p-6 border-2 transition-all duration-300 ${mode === 'normal' ? 'border-neon/40 bg-neon/[0.04] shadow-[0_0_30px_rgba(198,255,51,0.07)]' : 'border-white/5 bg-white/[0.01]'}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="w-4 h-4 text-neon" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-mono text-neon/60 uppercase tracking-widest">Modo</p>
                                            <p className="text-sm font-black uppercase italic text-white">Test Normal</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-[11px] font-mono text-slate-400 leading-relaxed">
                                        <p>Ideal para repasar un tema a tu ritmo, sin presión. Puedes elegir entre <span className="text-white font-bold">10, 20 o 40 preguntas</span> y tienes hasta <span className="text-neon font-bold">20 minutos</span> para completarlas.</p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <Clock className="w-3 h-3 text-neon/60" />
                                            <span className="text-neon/60 uppercase tracking-wider text-[10px]">20 min · Sin penalización</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card modo examen */}
                                <div className={`glass rounded-2xl p-6 border-2 transition-all duration-300 ${mode === 'exam' ? 'border-red-500/40 bg-red-500/[0.04] shadow-[0_0_30px_rgba(239,68,68,0.07)]' : 'border-white/5 bg-white/[0.01]'}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                            <Shield className="w-4 h-4 text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-mono text-red-400/60 uppercase tracking-widest">Modo</p>
                                            <p className="text-sm font-black uppercase italic text-white">Examen Oficial</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-[11px] font-mono text-slate-400 leading-relaxed">
                                        <p>Simula las condiciones reales del examen oficial. <span className="text-white font-bold">60 preguntas fijas</span> en <span className="text-red-400 font-bold">35 minutos</span>. Sin marcha atrás: prepárate como si fuera el día D.</p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <Clock className="w-3 h-3 text-red-400/60" />
                                            <span className="text-red-400/60 uppercase tracking-wider text-[10px]">35 min · 60 preguntas bloqueadas</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card test de errores */}
                                <div className={`glass rounded-2xl p-6 border-2 transition-all duration-300 ${mode === 'errors' ? 'border-orange-500/40 bg-orange-500/[0.04] shadow-[0_0_30px_rgba(249,115,22,0.07)]' : 'border-white/5 bg-white/[0.01]'}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                                            <Flame className="w-4 h-4 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-mono text-orange-400/60 uppercase tracking-widest">Modo</p>
                                            <p className="text-sm font-black uppercase italic text-white">Test de Errores</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-[11px] font-mono text-slate-400 leading-relaxed">
                                        <p>Carga automáticamente <span className="text-white font-bold">todas las preguntas que has fallado</span> en tests anteriores. Sin límite de tiempo: céntrate en convertir tus debilidades en fortalezas.</p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <Trophy className="w-3 h-3 text-orange-400/60" />
                                            <span className="text-orange-400/60 uppercase tracking-wider text-[10px]">Sin límite · Solo tus fallos</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* ── PHASE: RUNNING ── */}
                {phase === 'running' && (
                    <div className={`animate-in fade-in zoom-in duration-1000 min-h-[80vh] rounded-[3.5rem] p-12 relative overflow-hidden flex flex-col items-center justify-center border-2 transition-all duration-1000 ${mode === 'exam'
                        ? 'bg-stone-950 border-stone-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]'
                        : 'bg-gradient-to-br from-[#051a05] via-[#000500] to-[#001100] border-emerald-500/20 shadow-[0_40px_100px_-20px_rgba(0,255,0,0.1)]'
                        }`}>

                        <div className={`absolute top-[-20%] right-[-10%] w-[70%] h-[70%] blur-[180px] rounded-full opacity-[0.03] ${mode === 'exam' ? 'bg-red-900' : 'bg-emerald-900'}`} />
                        <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] blur-[150px] rounded-full opacity-[0.02] ${mode === 'exam' ? 'bg-stone-800' : 'bg-blue-950'}`} />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.2] pointer-events-none" />

                        <div className="relative z-10 w-full">
                            <TestEngine
                                questions={questions}
                                mode={mode}
                                onFinish={handleFinish}
                                timeLimit={MODES.find(m => m.key === mode)?.time}
                            />
                        </div>
                    </div>
                )}

                {/* ── PHASE: RESULTS ── */}
                {phase === 'results' && (
                    <TestResults
                        results={results}
                        selectedSubject={selectedSubject}
                        mode={mode}
                        onReset={handleReset}
                        onRepeat={() => { setPhase('detail'); setQuestions([]); setResults(null); setError(null); setMode('') }}
                    />
                )}

            </main>
        </div>
    )
}