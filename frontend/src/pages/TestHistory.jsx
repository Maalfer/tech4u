import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, ArrowLeft, CheckCircle, XCircle, Clock, Zap, BookOpen, Shield, Database, Monitor, Wifi, Cpu, FileCode, Bug, ClipboardList, Sparkles } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import api from '../services/api'

const SUBJECT_ICONS = {
    'Bases de Datos': { icon: Database, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    'Redes': { icon: Wifi, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    'Sistemas Operativos': { icon: Monitor, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    'Ciberseguridad': { icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10' },
    'Fundamentos de Hardware': { icon: Cpu, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    'Lenguaje de Marcas': { icon: FileCode, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
}

const MODE_LABELS = {
    normal: { label: 'Test Normal', icon: BookOpen, color: 'text-neon' },
    exam: { label: 'Modo Examen', icon: ClipboardList, color: 'text-blue-400' },
    errors: { label: 'Test de Errores', icon: Bug, color: 'text-orange-400' },
}

function formatDate(iso) {
    return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds) {
    if (!seconds) return '—'
    const m = Math.floor(seconds / 60)
    const s = Math.round(seconds % 60)
    return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function AccuracyBadge({ accuracy }) {
    const color = accuracy >= 80 ? 'text-neon bg-neon/10 border-neon/30' :
        accuracy >= 60 ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' :
            accuracy >= 40 ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' :
                'text-red-400 bg-red-500/10 border-red-500/30'
    return (
        <span className={`px-2.5 py-1 rounded-full font-black font-mono text-xs border ${color}`}>
            {accuracy.toFixed(1)}%
        </span>
    )
}

export default function TestHistory() {
    const navigate = useNavigate()
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/tests/history?limit=50')
            .then(r => setSessions(r.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const totalTests = sessions.length
    const avgAccuracy = sessions.length > 0
        ? (sessions.reduce((s, a) => s + a.accuracy, 0) / sessions.length).toFixed(1)
        : '—'
    const totalXP = sessions.reduce((s, a) => s + (a.xp_gained || 0), 0)

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1400px] w-full mx-auto relative">
                    {/* Background glow */}
                    <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

                    {/* Back button */}
                    <button onClick={() => navigate('/dashboard')} className="p-4 rounded-2xl text-slate-500 hover:text-sky-400 border border-transparent hover:border-sky-500/30 hover:bg-sky-500/10 transition-all bg-black/40 mb-4 active:scale-95 shadow-2xl backdrop-blur-xl group">
                        <ArrowLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                    </button>

                    {/* Header with PageHeader */}
                    <PageHeader
                        Icon={History}
                        gradient="from-white via-sky-100 to-sky-500"
                        iconColor="text-sky-500"
                        iconBg="bg-sky-500/20"
                        iconBorder="border-sky-500/30"
                        glowColor="bg-sky-500/20"
                        title={<>Test <span className="text-white">Stats</span></>}
                        subtitle="Registro Operativo de Exámenes"
                    />

                    {/* Summary cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {[
                            { label: 'Misiones Completadas', value: totalTests, icon: BookOpen, color: 'text-sky-400', border: 'hover:border-sky-500/40', glow: 'group-hover:shadow-[0_0_30px_rgba(56,189,248,0.15)]' },
                            { label: 'Precisión Global', value: `${avgAccuracy}%`, icon: CheckCircle, color: 'text-neon', border: 'hover:border-neon/40', glow: 'group-hover:shadow-[0_0_30px_rgba(198,255,51,0.15)]' },
                            { label: 'Experiencia Total', value: totalXP.toLocaleString(), icon: Zap, color: 'text-yellow-400', border: 'hover:border-yellow-500/40', glow: 'group-hover:shadow-[0_0_30px_rgba(250,204,21,0.15)]' },
                        ].map(({ label, value, icon: Icon, color, border, glow }) => (
                            <div key={label} className={`glass rounded-3xl p-6 lg:p-8 border border-white/5 flex items-center gap-6 relative overflow-hidden group transition-all duration-500 ${border} ${glow}`}>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 pointer-events-none">
                                    <Icon className="w-40 h-40" />
                                </div>
                                <div className={`w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-500`}>
                                    <div className={`absolute inset-0 opacity-20 blur-md rounded-xl ${color.replace('text-', 'bg-')}`} />
                                    <Icon className={`w-7 h-7 relative z-10 ${color}`} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                                    <p className="text-3xl lg:text-4xl font-black text-white tracking-tight">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl">
                            <History className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">Aún no has hecho ningún test</p>
                            <button onClick={() => navigate('/tests')} className="mt-6 px-6 py-3 bg-neon text-black font-black text-xs rounded-xl uppercase">
                                Hacer mi primer test →
                            </button>
                        </div>
                    ) : (
                        <div className="glass rounded-3xl border border-white/5 overflow-hidden shadow-2xl bg-black/20 backdrop-blur-3xl">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/[0.02]">
                                        <th className="text-left py-4 px-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">Asignatura</th>
                                        <th className="text-left py-4 px-5 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">Protocolo</th>
                                        <th className="text-center py-4 px-5 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black hidden lg:table-cell">Aciertos</th>
                                        <th className="text-center py-4 px-5 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">Precisión</th>
                                        <th className="text-center py-4 px-5 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black hidden sm:table-cell">Potencia (XP)</th>
                                        <th className="text-center py-4 px-5 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black hidden md:table-cell">Tiempo</th>
                                        <th className="text-right py-4 px-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">Registro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map((s) => {
                                        const sub = SUBJECT_ICONS[s.subject] || { icon: BookOpen, color: 'text-slate-400', bg: 'bg-white/5' }
                                        const SubIcon = sub.icon
                                        const mode = MODE_LABELS[s.mode] || MODE_LABELS.normal
                                        const ModeIcon = mode.icon
                                        return (
                                            <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl ${sub.bg} flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner`}>
                                                            <SubIcon className={`w-4 h-4 ${sub.color}`} />
                                                        </div>
                                                        <span className="text-white text-sm font-bold truncate max-w-[150px] lg:max-w-xs">{s.subject}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-2">
                                                        <ModeIcon className={`w-4 h-4 ${mode.color}`} />
                                                        <span className={`text-xs font-mono font-bold ${mode.color}`}>{mode.label}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5 text-center hidden lg:table-cell">
                                                    <span className="text-white font-mono text-base">
                                                        <span className="text-neon font-black drop-shadow-[0_0_8px_rgba(198,255,51,0.5)]">{s.correct}</span>
                                                        <span className="text-slate-600 font-bold">/{s.total}</span>
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-center">
                                                    <AccuracyBadge accuracy={s.accuracy} />
                                                </td>
                                                <td className="py-4 px-5 text-center hidden sm:table-cell">
                                                    <span className={`text-sm font-black font-mono ${s.xp_gained >= 0 ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.4)]' : 'text-red-400'}`}>
                                                        {s.xp_gained >= 0 ? '+' : ''}{s.xp_gained}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-center hidden md:table-cell">
                                                    <span className="text-slate-400/80 font-mono text-[11px] font-bold tracking-wider">{formatDuration(s.duration_seconds)}</span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">{formatDate(s.completed_at)}</span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
