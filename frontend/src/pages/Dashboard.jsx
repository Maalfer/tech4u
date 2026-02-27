import { useEffect, useState } from 'react'
import { TrendingUp, Target, Clock, AlertTriangle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StreakCounter from '../components/StreakCounter'
import ProgressBar from '../components/ProgressBar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/dashboard/stats')
            .then(r => setStats(r.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const totalTime = stats?.subjects.reduce((a, s) => a + s.time_invested_minutes, 0) || 0
    const overallAcc = stats?.subjects.length
        ? Math.round(stats.subjects.reduce((a, s) => a + s.accuracy, 0) / stats.subjects.length)
        : 0

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-white mb-1">
                        Bienvenido, <span className="text-[#39FF14] glow-text">{user?.nombre}</span> 👋
                    </h1>
                    <p className="text-slate-500 font-mono text-sm">Tu progreso en tiempo real</p>
                </div>

                {/* Top metric cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* Streak */}
                    <div className="glass glass-hover rounded-2xl p-5 col-span-2 lg:col-span-1 neon-border">
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Racha</p>
                        <StreakCounter streak={user?.streak_count || 0} size="lg" />
                    </div>

                    {/* Accuracy */}
                    <div className="glass glass-hover rounded-2xl p-5 neon-border">
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Precisión global</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black font-mono text-[#39FF14] glow-text">{overallAcc}%</span>
                        </div>
                        <div className="mt-3">
                            <ProgressBar percent={overallAcc} />
                        </div>
                    </div>

                    {/* Total answered */}
                    <div className="glass glass-hover rounded-2xl p-5 neon-border">
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Preguntas</p>
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-[#39FF14]" />
                            <span className="text-3xl font-black font-mono text-white">{stats?.total_questions_answered || 0}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-mono">respondidas en total</p>
                    </div>

                    {/* Time invested */}
                    <div className="glass glass-hover rounded-2xl p-5 neon-border">
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Tiempo</p>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#39FF14]" />
                            <span className="text-3xl font-black font-mono text-white">{Math.round(totalTime)}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-mono">minutos invertidos</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Subject progress */}
                    <div className="glass rounded-2xl p-6 neon-border">
                        <div className="flex items-center gap-2 mb-5">
                            <TrendingUp className="w-4 h-4 text-[#39FF14]" />
                            <h2 className="text-sm font-black font-mono text-white uppercase tracking-wider">Progreso por asignatura</h2>
                        </div>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-8 rounded bg-[rgba(57,255,20,0.05)] animate-pulse" />)}
                            </div>
                        ) : stats?.subjects.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {stats.subjects.map(s => (
                                    <ProgressBar key={s.subject} subject={s.subject} percent={Math.round(s.accuracy)} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-600 font-mono text-sm text-center py-6">Completa tu primer test para ver tu progreso</p>
                        )}
                    </div>

                    {/* Error stats + subscription info */}
                    <div className="flex flex-col gap-5">
                        <div className="glass rounded-2xl p-6 neon-border">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-4 h-4 text-orange-400" />
                                <h2 className="text-sm font-black font-mono text-white uppercase tracking-wider">Errores pendientes</h2>
                            </div>
                            <div className="flex items-end gap-3">
                                <span className="text-5xl font-black font-mono text-orange-400">{stats?.total_errors || 0}</span>
                                <p className="text-xs text-slate-500 font-mono mb-1 leading-relaxed">preguntas falladas<br />que debes repasar</p>
                            </div>
                        </div>

                        {/* Subscription card */}
                        <div className={`glass rounded-2xl p-6 ${user?.subscription_type !== 'free' ? 'border border-[rgba(57,255,20,0.4)]' : 'neon-border'}`}>
                            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Tu suscripción</p>
                            <p className={`text-2xl font-black font-mono capitalize ${user?.subscription_type !== 'free' ? 'text-[#39FF14] glow-text' : 'text-slate-400'}`}>
                                {user?.subscription_type === 'free' ? 'Gratuita' : user?.subscription_type}
                            </p>
                            {user?.subscription_type === 'free' && (
                                <a href="/#pricing" className="mt-3 inline-block btn-neon text-xs">
                                    Mejorar plan →
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
