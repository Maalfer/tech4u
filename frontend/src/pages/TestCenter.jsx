import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    AlertCircle, Zap, ChevronRight, ChevronLeft,
    BookOpen, ClipboardList, Bug, Target, Clock, Shield, Flame, Trophy,
    Sparkles, ArrowLeft, FlaskConical, BarChart3, Star,
    Database, Network, Monitor, Cpu, Code2,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import TestEngine from '../components/TestEngine'
import TestResults from '../components/TestResults'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { SubjectCoverComponent } from '../components/TestCenterCovers'
import { trackEvent } from '../utils/analytics'

const SUBJECTS = [
    { key: 'general',                  label: 'Examen General',          Icon: Trophy,    accent: '#f59e0b', accentRgb: '245,158,11',  topics: ['Mixto', 'ASIR', 'Global'] },
    { key: 'Bases de Datos',           label: 'Bases de Datos',          Icon: Database,  accent: '#8b5cf6', accentRgb: '139,92,246',  topics: ['SQL', 'ER', 'Normalización'] },
    { key: 'Redes',                    label: 'Redes',                   Icon: Network,   accent: '#0ea5e9', accentRgb: '14,165,233',  topics: ['OSI', 'TCP/IP', 'VLAN'] },
    { key: 'Sistemas Operativos',      label: 'Sistemas Operativos',     Icon: Monitor,   accent: '#22c55e', accentRgb: '34,197,94',   topics: ['Linux', 'Windows', 'Bash'] },
    { key: 'Fundamentos de Hardware',  label: 'Fundamentos de Hardware', Icon: Cpu,       accent: '#f97316', accentRgb: '249,115,22',  topics: ['CPU', 'RAM', 'Buses', 'CPD'] },
    { key: 'Lenguaje de Marcas',       label: 'Lenguaje de Marcas',      Icon: Code2,     accent: '#06b6d4', accentRgb: '6,182,212',   topics: ['HTML5', 'XML', 'CSS'] },
    { key: 'Ciberseguridad',           label: 'Ciberseguridad',          Icon: Shield,    accent: '#ef4444', accentRgb: '239,68,68',   topics: ['Malware', 'Forense', 'Redes'] },
]

const MODES = [
    { key: 'normal', label: 'Test Normal',    desc: 'Práctica libre, 20 minutos',              icon: BookOpen,     accent: '#a3e635', accentRgb: '163,230,53', time: 1200 },
    { key: 'exam',   label: 'Modo Examen',    desc: '60 preguntas, 35 minutos. Supervivencia', icon: ClipboardList, accent: '#ef4444', accentRgb: '239,68,68', time: 2100 },
    { key: 'errors', label: 'Test de Errores', desc: 'Repasa tus fallos sin límite de tiempo',  icon: Bug,          accent: '#f97316', accentRgb: '249,115,22', time: null },
]

// ── Hero ──────────────────────────────────────────────────────────────────────
function TestCenterHero({ level, rankName, currentXP, nextLevelXP }) {
    const xpPct = Math.min(Math.round((currentXP / (nextLevelXP || 1000)) * 100), 100)
    return (
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/[0.07]"
            style={{ background: 'linear-gradient(135deg, #040f08 0%, #071a0d 40%, #050d07 100%)' }}>

            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.1]"
                style={{
                    backgroundImage: `linear-gradient(rgba(34,197,94,0.6) 1px, transparent 1px),
                                       linear-gradient(90deg, rgba(34,197,94,0.6) 1px, transparent 1px)`,
                    backgroundSize: '44px 44px',
                }} />

            {/* Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-72 rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.7) 0%, transparent 70%)', filter: 'blur(55px)' }} />
            <div className="absolute bottom-0 right-1/4 w-80 h-60 rounded-full opacity-12 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(163,230,53,0.6) 0%, transparent 70%)', filter: 'blur(50px)' }} />
            <div className="absolute top-1/2 right-8 w-72 h-48 rounded-full opacity-8 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.4) 0%, transparent 70%)', filter: 'blur(65px)' }} />

            {/* Bottom edge */}
            <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.4), rgba(163,230,53,0.4), transparent)' }} />

            <div className="relative z-10 px-10 pt-12 pb-11">
                {/* Badge row */}
                <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Test Center · Dungeon of Knowledge</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                            <FlaskConical size={10} className="text-emerald-400" />
                            <span className="text-[10px] font-mono text-slate-500">7 asignaturas · 3 modos</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                        <Star size={10} className="text-slate-500" />
                        <span className="text-[10px] font-mono text-slate-500">{rankName} · Nv. {level}</span>
                    </div>
                </div>

                {/* Headline */}
                <div className="mb-7">
                    <h1 className="text-6xl font-black tracking-tight leading-none mb-4">
                        <span className="text-white">Valida tus</span>
                        <br />
                        <span className="text-transparent bg-clip-text"
                            style={{ backgroundImage: 'linear-gradient(90deg, #4ade80 0%, #a3e635 35%, #34d399 70%, #60a5fa 100%)' }}>
                            conocimientos ASIR
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                        Simulacros de examen, test de errores y modo supervivencia.{' '}
                        <span className="text-slate-300 font-medium">Prepárate como si fuera el día real.</span>
                    </p>
                </div>

                {/* Stats pills */}
                <div className="flex items-center gap-4 mb-8 flex-wrap">
                    {[
                        { label: 'Asignaturas', value: '6',   color: 'text-emerald-400' },
                        { label: 'Modos de test', value: '3', color: 'text-lime-400'    },
                        { label: 'XP acumulada', value: `${currentXP}`, color: 'text-amber-400' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
                            <span className={`text-xl font-black ${color}`}>{value}</span>
                            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
                        </div>
                    ))}

                    <div className="w-px h-8 bg-white/10 mx-1" />

                    {['Normal', 'Examen', 'Errores', 'ASIR'].map(kw => (
                        <span key={kw}
                            className="hidden lg:inline-flex px-2.5 py-1 rounded-lg text-[10px] font-mono font-black tracking-wide border border-emerald-500/15 bg-emerald-500/8 text-emerald-400">
                            {kw}
                        </span>
                    ))}
                </div>

                {/* XP bar */}
                <div className="max-w-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span className="text-[11px] font-mono text-slate-400">Experiencia · Nivel {level}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black font-mono bg-emerald-500/15 border border-emerald-500/20 text-emerald-400">
                            {rankName}
                        </span>
                    </div>
                    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(34,197,94,0.08)' }} />
                        <div className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${xpPct}%`,
                                background: 'linear-gradient(90deg, #15803d 0%, #22c55e 40%, #a3e635 80%, #84cc16 100%)',
                                boxShadow: '0 0 12px rgba(34,197,94,0.5)',
                            }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] font-mono text-slate-600">{currentXP} XP</span>
                        <span className="text-[10px] font-mono text-slate-600">{nextLevelXP} XP</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Subject Card ───────────────────────────────────────────────────────────────
function SubjectCard({ sub, onClick }) {
    return (
        <button
            onClick={() => onClick(sub)}
            className="group relative rounded-2xl overflow-hidden cursor-pointer text-left transition-all duration-300 hover:-translate-y-2"
            style={{
                aspectRatio: '4/5',
                border: `1.5px solid rgba(${sub.accentRgb},0.18)`,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = `rgba(${sub.accentRgb},0.55)`
                e.currentTarget.style.boxShadow = `0 8px 40px rgba(${sub.accentRgb},0.18), 0 0 0 1px rgba(${sub.accentRgb},0.12)`
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = `rgba(${sub.accentRgb},0.18)`
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            {/* SVG Cover — full-bleed background */}
            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                <SubjectCoverComponent subjectKey={sub.key} />
            </div>

            {/* Dark gradient overlay toward bottom */}
            <div className="absolute inset-0" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.08) 70%, transparent 100%)',
            }} />

            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] opacity-55 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, rgba(${sub.accentRgb},1), transparent)` }} />

            {/* Bottom content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2.5">

                {/* Topic tags */}
                <div className="flex flex-wrap gap-1">
                    {sub.topics.map(t => (
                        <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 rounded backdrop-blur-sm"
                            style={{
                                color: sub.accent,
                                border: `1px solid rgba(${sub.accentRgb},0.3)`,
                                background: 'rgba(0,0,0,0.55)',
                            }}>
                            {t}
                        </span>
                    ))}
                </div>

                {/* Icon + title */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm"
                        style={{
                            background: `rgba(${sub.accentRgb},0.15)`,
                            border: `1px solid rgba(${sub.accentRgb},0.35)`,
                            boxShadow: `0 0 14px rgba(${sub.accentRgb},0.2)`,
                        }}>
                        <sub.Icon size={18} style={{ color: sub.accent }} />
                    </div>
                    <h3 className="font-black text-white text-sm uppercase italic leading-tight tracking-tight">
                        {sub.label}
                    </h3>
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between pt-0.5">
                    <span className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">ASIR</span>
                    <div className="flex items-center gap-1 font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1.5 group-hover:translate-x-0"
                        style={{ color: sub.accent }}>
                        <span>Iniciar test</span>
                        <ChevronRight size={11} />
                    </div>
                </div>
            </div>
        </button>
    )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TestCenter() {
    const navigate = useNavigate()
    const { user }  = useAuth()

    const [phase,           setPhase]           = useState('subjects')
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [mode,            setMode]            = useState('')
    const [questionCount,   setQuestionCount]   = useState(20)
    const [questions,       setQuestions]       = useState([])
    const [results,         setResults]         = useState(null)
    const [loading,         setLoading]         = useState(false)
    const [error,           setError]           = useState(null)
    const [stats,           setStats]           = useState(null)

    useEffect(() => {
        api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {})
    }, [])

    const currentXP  = stats?.current_xp   || 0
    const nextLevelXP = stats?.next_level_xp || 1000
    const rankName   = stats?.rank_name     || 'Estudiante ASIR'
    const userLevel  = stats?.level         || user?.level || 1

    // Arranca un examen general (todas las asignaturas, modo examen, 60 preguntas)
    // sin pasar por el menú de selección de modo.
    const startGeneralExam = async (sub) => {
        setSelectedSubject(sub)
        setMode('exam')
        setError(null)
        setLoading(true)
        try {
            const res = await api.get('/tests/questions', { params: { subject: 'general', limit: 60 } })
            if (res.data.length === 0) {
                setError('No hay preguntas disponibles para el examen general.')
                return
            }
            setQuestions(res.data)
            setPhase('running')
            trackEvent('test_started', sub.key, 'test', { mode: 'exam', question_count: 60 })
        } catch {
            setError('Fallo de conexión con el servidor.')
        } finally {
            setLoading(false)
        }
    }

    const handleSelectSubject = (sub) => {
        if (sub.key === 'general') {
            // Examen General: arrancar directamente sin menú de selección
            startGeneralExam(sub)
            return
        }
        setSelectedSubject(sub); setPhase('detail'); setMode(''); setError(null)
    }

    const startTest = async () => {
        if (!mode) return
        setLoading(true); setError(null)
        try {
            const endpoint   = mode === 'errors' ? '/tests/failed' : '/tests/questions'
            let finalLimit   = questionCount
            if (mode === 'exam')   finalLimit = 60
            if (mode === 'errors') finalLimit = 200
            const res = await api.get(endpoint, { params: { subject: selectedSubject?.key, limit: finalLimit } })
            if (res.data.length === 0) {
                setError(mode === 'errors' ? 'No tienes errores registrados. ¡Estás al día!' : 'No hay preguntas disponibles para esta asignatura.')
                setLoading(false); return
            }
            setQuestions(res.data); setPhase('running')
            trackEvent('test_started', selectedSubject?.key, 'test', { mode, question_count: res.data.length })
        } catch { setError('Fallo de conexión con el servidor.') }
        finally { setLoading(false) }
    }

    const handleFinish = async (answers) => {
        setLoading(true)
        try {
            const res = await api.post('/tests/submit', { subject: selectedSubject?.key || 'General', answers, test_mode: mode })
            setResults(res.data)
            api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {})
            const score = res.data?.score ?? null
            trackEvent('test_completed', selectedSubject?.key, 'test', { mode, score, total: answers.length })
        } catch (err) {
            setResults(null)
            trackEvent('test_abandoned', selectedSubject?.key, 'test', { mode })
            // Extract the real error from the backend (e.g. 429 cooldown message)
            const apiMsg = err?.response?.data?.detail
            const status = err?.response?.status
            if (status === 429) {
                setError(apiMsg || 'Debes esperar unos minutos antes de realizar otro test.')
            } else if (status === 400) {
                setError(apiMsg || 'Error al procesar las respuestas. Comprueba tu conexión.')
            } else {
                setError(apiMsg || 'Error de servidor al enviar el test. Inténtalo de nuevo.')
            }
            // Go back to detail screen so the student can see the error and retry
            setPhase('detail')
            return
        }
        finally { setLoading(false) }
        setPhase('results')
    }

    const handleReset = () => {
        setPhase('subjects'); setSelectedSubject(null); setMode(''); setQuestionCount(20)
        setQuestions([]); setResults(null); setError(null)
    }

    const sub = selectedSubject

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8">

                {/* ══ PHASE: SUBJECTS ══════════════════════════════════════════ */}
                {phase === 'subjects' && (
                    <div className="animate-in fade-in duration-500">

                        <TestCenterHero
                            level={userLevel} rankName={rankName}
                            currentXP={currentXP} nextLevelXP={nextLevelXP}
                        />

                        {/* Section label */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px flex-1 bg-white/6" />
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/6">
                                <FlaskConical size={12} className="text-emerald-400" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">Elige tu asignatura</span>
                            </div>
                            <div className="h-px flex-1 bg-white/6" />
                        </div>

                        <div className="flex flex-col xl:flex-row gap-7 items-start">
                            {/* Subject cards grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 flex-1 w-full">
                                {SUBJECTS.map(s => <SubjectCard key={s.key} sub={s} onClick={handleSelectSubject} />)}
                            </div>

                            {/* Side info panel */}
                            <div className="w-full xl:w-[300px] rounded-3xl border border-emerald-500/15 overflow-hidden xl:sticky xl:top-8 shrink-0"
                                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.05) 0%, transparent 70%), #0c0c0c' }}>
                                <div className="h-[2px] w-full"
                                    style={{ background: 'linear-gradient(90deg, rgba(34,197,94,0), rgba(34,197,94,1) 50%, rgba(34,197,94,0))' }} />
                                <div className="p-7">
                                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-5">
                                        <ClipboardList size={20} className="text-emerald-400" />
                                    </div>
                                    <h3 className="text-lg font-black uppercase italic text-white mb-5">¿Qué es Test Center?</h3>
                                    <div className="space-y-4">
                                        {[
                                            { icon: BookOpen, color: 'text-emerald-400', title: 'Test Normal', desc: 'Practica a tu ritmo con 10, 20 o 40 preguntas en 20 minutos.' },
                                            { icon: Shield,   color: 'text-red-400',     title: 'Modo Examen', desc: 'Simula el examen real: 60 preguntas, 35 minutos, sin marcha atrás.' },
                                            { icon: Flame,    color: 'text-orange-400',  title: 'Test de Errores', desc: 'Carga todas las preguntas que has fallado para reforzarlas.' },
                                        ].map(item => (
                                            <div key={item.title} className="flex items-start gap-3">
                                                <item.icon size={14} className={`flex-shrink-0 mt-0.5 ${item.color}`} />
                                                <div>
                                                    <p className="font-mono text-xs font-bold text-white">{item.title}</p>
                                                    <p className="font-mono text-[10px] text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ PHASE: DETAIL ════════════════════════════════════════════ */}
                {phase === 'detail' && sub && (
                    <div className="max-w-5xl mx-auto animate-in fade-in duration-400">

                        {/* Back button */}
                        <button onClick={() => { setPhase('subjects'); setMode(''); setError(null) }}
                            className="flex items-center gap-2 font-mono text-[11px] text-slate-500 hover:text-white transition-colors mb-6 group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            Volver a asignaturas
                        </button>

                        {/* ── Subject hero banner ── */}
                        <div className="relative rounded-3xl border overflow-hidden mb-8"
                            style={{
                                background: `radial-gradient(ellipse at 25% 50%, rgba(${sub.accentRgb},0.12) 0%, transparent 65%), radial-gradient(ellipse at 80% 20%, rgba(${sub.accentRgb},0.06) 0%, transparent 55%), #080808`,
                                borderColor: `rgba(${sub.accentRgb},0.25)`,
                            }}>

                            {/* Top accent bar */}
                            <div className="h-[2px] w-full"
                                style={{ background: `linear-gradient(90deg, transparent 0%, rgba(${sub.accentRgb},1) 40%, rgba(${sub.accentRgb},0.6) 70%, transparent 100%)` }} />

                            {/* Subtle grid */}
                            <div className="absolute inset-0 opacity-[0.04]"
                                style={{
                                    backgroundImage: `linear-gradient(rgba(${sub.accentRgb},1) 1px, transparent 1px), linear-gradient(90deg, rgba(${sub.accentRgb},1) 1px, transparent 1px)`,
                                    backgroundSize: '48px 48px',
                                }} />

                            {/* Glow */}
                            <div className="absolute top-0 left-0 w-[50%] h-full opacity-15 pointer-events-none"
                                style={{ background: `radial-gradient(ellipse at 20% 50%, rgba(${sub.accentRgb},0.8) 0%, transparent 70%)`, filter: 'blur(60px)' }} />

                            <div className="relative z-10 px-10 py-9 flex items-center justify-between gap-8 flex-wrap">
                                <div className="flex items-center gap-7">
                                    {/* Icon */}
                                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background: `rgba(${sub.accentRgb},0.12)`,
                                            border: `2px solid rgba(${sub.accentRgb},0.3)`,
                                            boxShadow: `0 0 40px rgba(${sub.accentRgb},0.15)`,
                                        }}>
                                        <sub.Icon size={36} style={{ color: sub.accent }} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sub.accent }} />
                                            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Asignatura · ASIR</span>
                                        </div>
                                        <h2 className="text-4xl font-black italic uppercase text-white leading-none mb-3 tracking-tight">{sub.label}</h2>
                                        <div className="flex flex-wrap gap-1.5">
                                            {sub.topics.map(t => (
                                                <span key={t} className="font-mono text-[10px] px-2.5 py-1 rounded-lg border"
                                                    style={{ color: sub.accent, borderColor: `rgba(${sub.accentRgb},0.3)`, background: `rgba(${sub.accentRgb},0.08)` }}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Mini stats */}
                                <div className="flex gap-4 flex-wrap">
                                    {[
                                        { label: 'Modos', value: '3' },
                                        { label: 'Dificultad', value: 'ASIR' },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="px-5 py-3.5 rounded-2xl border border-white/[0.07] text-center"
                                            style={{ background: 'rgba(255,255,255,0.03)' }}>
                                            <p className="font-black text-lg text-white">{value}</p>
                                            <p className="font-mono text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Two column layout ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left: Mode cards (2/3 width) */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-1 h-4 rounded-full" style={{ background: sub.accent }} />
                                    <p className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.3em]">Elige el tipo de test</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    {MODES.map(m => {
                                        const MIcon = m.icon
                                        const isSelected = mode === m.key
                                        return (
                                            <button key={m.key} onClick={() => setMode(m.key)}
                                                className="relative rounded-2xl p-6 border text-left transition-all duration-250 flex flex-col gap-4 group overflow-hidden"
                                                style={{
                                                    background: isSelected
                                                        ? `radial-gradient(ellipse at 30% 0%, rgba(${m.accentRgb},0.12) 0%, transparent 70%), rgba(${m.accentRgb},0.04)`
                                                        : 'rgba(255,255,255,0.02)',
                                                    borderColor: isSelected ? `rgba(${m.accentRgb},0.5)` : 'rgba(255,255,255,0.07)',
                                                    boxShadow: isSelected ? `0 0 30px rgba(${m.accentRgb},0.12), inset 0 1px 0 rgba(${m.accentRgb},0.1)` : 'none',
                                                    transform: isSelected ? 'translateY(-2px)' : 'none',
                                                }}>

                                                {/* Top bar */}
                                                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl transition-opacity duration-200"
                                                    style={{
                                                        background: `linear-gradient(90deg, transparent, rgba(${m.accentRgb},1), transparent)`,
                                                        opacity: isSelected ? 1 : 0,
                                                    }} />

                                                {/* Selection dot */}
                                                <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full border-2 transition-all duration-200"
                                                    style={{
                                                        background: isSelected ? m.accent : 'transparent',
                                                        borderColor: isSelected ? m.accent : 'rgba(255,255,255,0.15)',
                                                        boxShadow: isSelected ? `0 0 8px ${m.accent}80` : 'none',
                                                    }} />

                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                                    style={{
                                                        background: `rgba(${m.accentRgb},0.1)`,
                                                        border: `1.5px solid rgba(${m.accentRgb},${isSelected ? '0.35' : '0.2'})`,
                                                    }}>
                                                    <MIcon size={20} style={{ color: m.accent }} />
                                                </div>

                                                <div>
                                                    <p className="font-black uppercase italic text-sm text-white mb-1">{m.label}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono leading-relaxed">{m.desc}</p>
                                                </div>

                                                {m.time && (
                                                    <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                                                        <Clock size={10} style={{ color: m.accent }} />
                                                        <span className="font-mono text-[9px] uppercase tracking-wide"
                                                            style={{ color: m.accent }}>
                                                            {m.key === 'exam' ? '35 min' : '20 min'}
                                                        </span>
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Question count — solo modo normal */}
                                {mode === 'normal' && (
                                    <div className="rounded-2xl border border-white/[0.07] p-5 mb-5"
                                        style={{ background: 'rgba(163,230,53,0.03)' }}>
                                        <p className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.25em] mb-4">Número de preguntas</p>
                                        <div className="flex gap-3">
                                            {[10, 20, 40].map(n => (
                                                <button key={n} onClick={() => setQuestionCount(n)}
                                                    className="flex-1 py-3.5 rounded-xl font-black font-mono text-sm border-2 transition-all duration-200"
                                                    style={{
                                                        background: questionCount === n ? '#a3e635' : 'rgba(255,255,255,0.04)',
                                                        color: questionCount === n ? '#000' : '#94a3b8',
                                                        borderColor: questionCount === n ? '#a3e635' : 'rgba(255,255,255,0.08)',
                                                        boxShadow: questionCount === n ? '0 0 20px rgba(163,230,53,0.25)' : 'none',
                                                        transform: questionCount === n ? 'scale(1.04)' : 'none',
                                                    }}>
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Mode info banners */}
                                {mode === 'exam' && (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-red-500/20 mb-5"
                                        style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(239,68,68,0.07) 0%, transparent 70%)' }}>
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center flex-shrink-0">
                                            <AlertCircle size={16} className="text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase text-red-400 italic">Modo Examen Real</p>
                                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">60 preguntas · 35 minutos · Sin retroceso</p>
                                        </div>
                                    </div>
                                )}
                                {mode === 'errors' && (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-orange-500/20 mb-5"
                                        style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(249,115,22,0.07) 0%, transparent 70%)' }}>
                                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                                            <Bug size={16} className="text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase text-orange-400 italic">Repaso de Errores</p>
                                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">Se cargan todas las preguntas falladas · Sin límite de tiempo</p>
                                        </div>
                                    </div>
                                )}

                                {/* Empty / Error state */}
                                {error && (
                                    <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 mb-5">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-mono text-[11px] font-black text-orange-400 uppercase tracking-wider mb-1">
                                                    {mode === 'errors' ? 'Sin errores registrados' : 'Sin preguntas disponibles'}
                                                </p>
                                                <p className="font-mono text-[10px] text-slate-400 leading-relaxed">{error}</p>
                                                {mode === 'errors' && (
                                                    <p className="font-mono text-[10px] text-slate-500 mt-2">
                                                        ¡Estás al día! Prueba el <strong className="text-slate-400">modo normal</strong> para practicar más preguntas.
                                                    </p>
                                                )}
                                                {mode !== 'errors' && (
                                                    <p className="font-mono text-[10px] text-slate-500 mt-2">
                                                        Esta asignatura aún no tiene preguntas aprobadas. Vuelve pronto o prueba otra asignatura.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right: Summary + CTA (1/3 width) */}
                            <div className="lg:col-span-1 flex flex-col gap-4">

                                {/* Config summary */}
                                <div className="rounded-2xl border border-white/[0.07] overflow-hidden"
                                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <div className="h-[1px] w-full"
                                        style={{ background: `linear-gradient(90deg, transparent, rgba(${sub.accentRgb},0.5), transparent)` }} />
                                    <div className="p-6">
                                        <p className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.25em] mb-5">Resumen</p>
                                        <div className="space-y-3.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-mono text-slate-500">Asignatura</span>
                                                <span className="text-[11px] font-mono font-bold text-white">{sub.label}</span>
                                            </div>
                                            <div className="h-px bg-white/5" />
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-mono text-slate-500">Modo</span>
                                                <span className="text-[11px] font-mono font-bold"
                                                    style={{ color: mode ? MODES.find(m => m.key === mode)?.accent : '#475569' }}>
                                                    {mode ? MODES.find(m => m.key === mode)?.label : '—'}
                                                </span>
                                            </div>
                                            <div className="h-px bg-white/5" />
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-mono text-slate-500">Preguntas</span>
                                                <span className="text-[11px] font-mono font-bold text-white">
                                                    {mode === 'exam' ? '60' : mode === 'errors' ? 'Todas' : mode === 'normal' ? questionCount : '—'}
                                                </span>
                                            </div>
                                            <div className="h-px bg-white/5" />
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-mono text-slate-500">Tiempo</span>
                                                <span className="text-[11px] font-mono font-bold text-white">
                                                    {mode === 'exam' ? '35 min' : mode === 'errors' ? '∞' : mode === 'normal' ? '20 min' : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA button */}
                                <button onClick={startTest} disabled={!mode || loading}
                                    className="w-full py-5 rounded-2xl font-black uppercase italic tracking-[0.12em] transition-all duration-200 flex items-center justify-center gap-3 text-sm"
                                    style={{
                                        background: !mode
                                            ? 'rgba(255,255,255,0.04)'
                                            : `linear-gradient(135deg, rgba(${MODES.find(m=>m.key===mode)?.accentRgb},0.7) 0%, rgba(${MODES.find(m=>m.key===mode)?.accentRgb},1) 100%)`,
                                        color: !mode ? '#374151' : '#000',
                                        cursor: !mode ? 'not-allowed' : 'pointer',
                                        boxShadow: mode && !loading
                                            ? `0 0 40px rgba(${MODES.find(m=>m.key===mode)?.accentRgb},0.35)`
                                            : 'none',
                                        transform: mode && !loading ? 'translateY(-1px)' : 'none',
                                    }}>
                                    {loading
                                        ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        : <><Zap size={18} /> {mode ? `Iniciar ${MODES.find(m => m.key === mode)?.label}` : 'Elige un modo'}</>
                                    }
                                </button>

                                <p className="text-center text-[9px] font-mono text-slate-700 uppercase tracking-widest">
                                    1–4 para responder · Enter para confirmar
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ PHASE: RUNNING ═══════════════════════════════════════════ */}
                {phase === 'running' && (
                    <div className={`min-h-[80vh] rounded-[3rem] p-12 relative overflow-hidden flex flex-col items-center justify-center border transition-all duration-700 ${
                        mode === 'exam' ? 'border-red-500/15' : 'border-emerald-500/15'
                    }`} style={{
                        background: mode === 'exam'
                            ? 'linear-gradient(135deg, #0f0000 0%, #06000e 100%)'
                            : 'linear-gradient(135deg, #040f08 0%, #060810 100%)',
                    }}>
                        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] blur-[180px] rounded-full opacity-[0.04] pointer-events-none"
                            style={{ background: mode === 'exam' ? '#ef4444' : '#22c55e' }} />
                        <div className="relative z-10 w-full">
                            <TestEngine questions={questions} mode={mode} onFinish={handleFinish}
                                timeLimit={MODES.find(m => m.key === mode)?.time} />
                        </div>
                    </div>
                )}

                {/* ══ PHASE: RESULTS ═══════════════════════════════════════════ */}
                {phase === 'results' && (
                    <TestResults results={results} selectedSubject={selectedSubject} mode={mode}
                        onReset={handleReset}
                        onRepeat={() => {
                            setQuestions([]); setResults(null); setError(null)
                            if (selectedSubject?.key === 'general') {
                                // Relanzar examen general directamente
                                startGeneralExam(selectedSubject)
                            } else {
                                setPhase('detail'); setMode('')
                            }
                        }} />
                )}

            </main>
        </div>
    )
}
