import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Hammer, AlertCircle, RefreshCw, ChevronRight, Zap, Trophy,
    Shield, Code2, Database, Wifi, Monitor, Cpu, FileCode, ArrowLeft, Star, Sparkles, Terminal
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import SkillEngine from '../components/SkillEngine'
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
    { key: 'general', label: 'Todos', icon: examIcon, isCustom: true, color: 'from-fuchsia-600/20 to-fuchsia-900/10 border-fuchsia-500/30 hover:border-fuchsia-400/60', iconColor: 'text-fuchsia-400', badge: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' },
    { key: 'Bases de Datos', label: 'Bases de Datos', icon: bbddIcon, isCustom: true, color: 'from-violet-600/20 to-violet-900/10 border-violet-500/30 hover:border-violet-400/60', iconColor: 'text-violet-400', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
    { key: 'Redes', label: 'Redes', icon: redesIcon, isCustom: true, color: 'from-sky-600/20 to-sky-900/10 border-sky-500/30 hover:border-sky-400/60', iconColor: 'text-sky-400', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    { key: 'Sistemas Operativos', label: 'Sistemas Operativos', icon: soIcon, isCustom: true, color: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30 hover:border-emerald-400/60', iconColor: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    { key: 'Fundamentos de Hardware', label: 'Fundamentos de Hardware', icon: hardwareIcon, isCustom: true, color: 'from-orange-600/20 to-orange-900/10 border-orange-500/30 hover:border-orange-400/60', iconColor: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    { key: 'Lenguaje de Marcas', label: 'Lenguaje de Marcas', icon: marcasIcon, isCustom: true, color: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/30 hover:border-cyan-400/60', iconColor: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
]

export default function SkillLabs() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [phase, setPhase] = useState('subjects')
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [exercises, setExercises] = useState([])
    const [results, setResults] = useState(null)
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => { })
    }, [])

    // Current XP info from real dashboard stats
    const currentXP = stats?.current_xp || 0
    const nextLevelXP = stats?.next_level_xp || 1000
    const xpPercent = Math.min(Math.round((currentXP / nextLevelXP) * 100), 100)
    const rankName = stats?.rank_name || (user?.rank_name) || 'Estudiante'
    const userLevel = stats?.level || user?.level || 1

    const handleSelectSubject = (sub) => {
        setSelectedSubject(sub)
        setPhase('detail')
        setError(null)
    }

    const startLab = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await api.get('/skill-labs/exercises', { params: { subject: selectedSubject?.key, limit: 10 } })
            if (res.data.length === 0) {
                setError('Aún no hay ejercicios de ensamblaje para esta asignatura.')
                setLoading(false)
                return
            }
            setExercises(res.data)
            setPhase('running')
        } catch {
            setError('Fallo de conexión con el servidor.')
        } finally {
            setLoading(false)
        }
    }

    const handleFinish = async (stats) => {
        setLoading(true)
        try {
            const res = await api.post('/skill-labs/submit', {
                subject: selectedSubject?.key || 'General',
                total_exercises: stats.total,
                correct_exercises: stats.correct,
                failed_attempts: stats.mistakes
            })
            setResults({ ...stats, ...res.data }) // combine frontend stats with backend xp reward
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
        setExercises([])
        setResults(null)
        setError(null)
    }

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">

                {/* ── Header ── */}
                <PageHeader
                    title={<>Skill<span className="text-white">Labs</span></>}
                    subtitle={phase === 'subjects' ? 'Ensamblaje y Pruebas PRÁCTICAS' :
                        phase === 'detail' ? `Laboratorio: ${selectedSubject?.label}` :
                            phase === 'running' ? 'Ensamblaje en curso...' : 'Reporte de Síntesis'}
                    Icon={Hammer}
                    gradient="from-white via-fuchsia-100 to-fuchsia-500"
                    iconColor="text-fuchsia-400"
                    iconBg="bg-fuchsia-500/20"
                    iconBorder="border-fuchsia-500/30"
                    glowColor="bg-fuchsia-500/20"
                />

                {phase === 'subjects' && (
                    <div className="animate-in fade-in duration-500">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-6">
                            Elige un entorno de pruebas
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
                                                <h3 className="text-sm font-black uppercase italic text-white leading-tight">
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
                            <div className="w-full xl:w-[350px] glass rounded-3xl p-8 border-2 bg-gradient-to-br from-fuchsia-900/10 to-black/40 border-fuchsia-500/20 shadow-2xl xl:sticky xl:top-8 shrink-0">
                                <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center mb-6">
                                    <Terminal className="w-6 h-6 text-fuchsia-400" />
                                </div>
                                <h3 className="text-xl font-black uppercase italic text-white mb-4">
                                    ¿Qué es Skill Labs?
                                </h3>
                                <div className="space-y-5 text-sm text-slate-400 leading-relaxed font-mono">
                                    <p>
                                        Skill Labs es un entorno de entrenamiento intensivo diseñado para poner a prueba tus conocimientos técnicos sobre el terreno.
                                    </p>
                                    <div>
                                        <p className="text-fuchsia-400 font-bold mb-1 uppercase tracking-widest text-[10px]">Dinámica de Ensamblaje</p>
                                        <p>En lugar de tests tradicionales, deberás arrastrar piezas de código o conceptos desde el banco de palabras hacia los huecos exactos para restaurar el sistema.</p>
                                    </div>
                                    <div>
                                        <p className="text-neon font-bold mb-1 uppercase tracking-widest text-[10px]">Reglas de Integridad</p>
                                        <p>Solo dispones de <span className="text-white bg-white/10 px-1.5 py-0.5 rounded">3 intentos</span> físicos por vector. Los fallos restarán agresivamente XP de tu recompensa final.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {phase === 'detail' && selectedSubject && (
                    <div className="max-w-xl animate-in fade-in duration-400">
                        <div className={`glass rounded-3xl p-8 border-2 bg-gradient-to-br ${selectedSubject.color} mb-8 flex items-center gap-5`}>
                            <div className="w-16 h-16 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                                {selectedSubject.isCustom ? (
                                    <img src={selectedSubject.icon} className="w-8 h-8 object-contain" alt="" />
                                ) : (
                                    <selectedSubject.icon className={`w-8 h-8 ${selectedSubject.iconColor}`} />
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Asignatura</p>
                                <h2 className="text-2xl font-black italic uppercase text-white">{selectedSubject.label}</h2>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 text-[10px] font-mono text-orange-400 bg-orange-400/5 border border-orange-400/20 rounded-xl p-4 mb-6 uppercase tracking-wider">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                            </div>
                        )}

                        <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-2xl p-6 mb-8 text-sm text-slate-400 leading-relaxed italic">
                            En el Laboratorio de Skills, no enfrentarás tests interactivos normales. En su lugar, el sistema central presentará definiciones y afirmaciones crudas con componentes sustraidos.
                            Deberás arrastrar y ensamblar las piezas sueltas (variables, comandos, o fragmentos) de vuelta a los vectores corruptos para repararlos.
                            <br /><br />
                            <strong className="text-fuchsia-400 not-italic">Regla Estricta:</strong> Tienes <span className="text-neon border-b border-neon">3 intentos físicos</span> por compilación. Si agotas el ciclo en una frase, se purgará forzosamente revelando el espectro original. Todo fallo restará XP de la recompensa global.
                        </div>

                        <button
                            onClick={startLab}
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black uppercase italic tracking-[0.15em] transition-all flex items-center justify-center gap-3 text-sm bg-fuchsia-600/90 text-white hover:bg-fuchsia-500 hover:scale-[1.01] hover:shadow-[0_0_40px_var(--color-fuchsia-500)]`}
                        >
                            {loading
                                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <><Hammer className="w-5 h-5" /> Demuestra tus Skills 🔨</>
                            }
                        </button>
                    </div>
                )}

                {phase === 'running' && (
                    <div className={`animate-in fade-in zoom-in duration-1000 min-h-[70vh] rounded-[3.5rem] p-12 relative overflow-hidden flex flex-col items-center justify-center border-2 border-fuchsia-900/50 shadow-[0_40px_100px_-20px_rgba(217,70,239,0.1)] bg-gradient-to-tl from-[#130321] via-[#05000a] to-[#0a0011]`}>
                        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] blur-[180px] rounded-full opacity-[0.05] bg-fuchsia-600" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/microbial-mat.png')] opacity-[0.1] pointer-events-none" />

                        <div className="relative z-10 w-full max-w-4xl">
                            <SkillEngine
                                exercises={exercises}
                                onFinish={handleFinish}
                            />
                        </div>
                    </div>
                )}

                {phase === 'results' && results && (
                    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-10 duration-700">
                        <div className="glass rounded-[2rem] p-12 border border-white/5 mb-10 text-center relative overflow-hidden">

                            <div className="absolute top-0 left-0 w-full h-1 bg-fuchsia-500" />
                            <Trophy className="w-20 h-20 mx-auto mb-6 text-fuchsia-500" />
                            <h2 className="text-4xl font-black text-white uppercase italic mb-2">
                                Pruebas Finalizadas
                            </h2>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-12">Reporte de Laboratorio</p>

                            <div className="grid grid-cols-4 gap-6 mb-12">
                                {[
                                    ['Completados', results.total, 'text-fuchsia-400'],
                                    ['Sin Fallos', results.correct, 'text-neon'],
                                    ['Errores', results.mistakes, 'text-red-400'],
                                    ['XP Obtenida', `+${results.xp_gained} XP`, 'text-blue-400'],
                                ].map(([label, value, color]) => (
                                    <div key={label} className="bg-white/[0.02] border border-white/5 rounded-2xl py-8 flex flex-col items-center justify-center">
                                        <p className={`text-3xl font-black font-mono mb-1 ${color}`}>{value}</p>
                                        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">{label}</p>
                                    </div>
                                ))}
                            </div>

                            {results.leveled_up && (
                                <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-neon/10 to-blue-500/10 border border-neon/30 animate-pulse flex items-center justify-center gap-4">
                                    <Star className="w-8 h-8 text-neon" />
                                    <div className="text-left">
                                        <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">¡Subida de nivel!</p>
                                        <h3 className="text-xl font-black italic text-white uppercase">Has alcanzado el Nivel {results.new_level}</h3>
                                    </div>
                                    <Star className="w-8 h-8 text-neon" />
                                </div>
                            )}

                            <div className="flex gap-4 justify-center">
                                <button onClick={handleReset} className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 text-white">
                                    <RefreshCw className="w-4 h-4" /> Otro Lab
                                </button>
                                <button onClick={() => navigate('/dashboard')} className="px-10 py-4 bg-fuchsia-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                    Ir al Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
