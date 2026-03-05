import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Crown, Medal, Star, Zap, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const MEDAL = { 1: '👑', 2: '🥇', 3: '🥈', 4: '🥉' }
const SUB_COLOR = {
    free: 'text-slate-500',
    monthly: 'text-sky-400',
    quarterly: 'text-neon',
    annual: 'text-violet-400',
}
const SUB_LABEL = { free: 'Free', monthly: 'Mensual', quarterly: 'Trimestral', annual: 'Anual' }

function PodiumCard({ entry, place }) {
    const heights = { 1: 'h-32', 2: 'h-24', 3: 'h-20' }
    const colors = {
        1: 'from-yellow-400/20 to-transparent border-yellow-400/40',
        2: 'from-slate-400/15 to-transparent border-slate-400/30',
        3: 'from-orange-400/15 to-transparent border-orange-400/30',
    }
    return (
        <div className={`flex flex-col items-center gap-2 ${place === 1 ? '-translate-y-4' : ''}`}>
            <div className="text-3xl">{MEDAL[place]}</div>
            <div className={`w-full glass rounded-2xl border bg-gradient-to-b ${colors[place]} px-4 py-4 ${heights[place]} flex flex-col items-center justify-end`}>
                <p className="text-white font-black text-sm text-center truncate w-full">{entry.nombre}</p>
                <p className="text-[10px] font-mono text-slate-400">Nivel {entry.level}</p>
                <p className="text-[10px] font-mono text-neon">{entry.xp} XP</p>
            </div>
            <div className={`text-[9px] font-mono uppercase tracking-widest ${colors[place].includes('yellow') ? 'text-yellow-400' : colors[place].includes('orange') ? 'text-orange-400' : 'text-slate-400'}`}>
                #{place}
            </div>
        </div>
    )
}

export default function Leaderboard() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetch = async (silent = false) => {
        if (!silent) setLoading(true)
        else setRefreshing(true)
        try {
            const res = await api.get('/leaderboard/global')
            setData(res.data)
        } catch { }
        finally { setLoading(false); setRefreshing(false) }
    }

    useEffect(() => { fetch() }, [])

    const top3 = data?.leaderboard?.slice(0, 3) || []
    const rest = data?.leaderboard?.slice(3) || []
    const myPos = data?.my_position

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1400px] w-full mx-auto relative">
                    {/* Background glow */}
                    <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />                {/* Header */}
                    <header className="mb-14 flex justify-between items-end relative z-10">
                        <div className="animate-in fade-in slide-in-from-left duration-700">
                            <div className="flex items-center gap-5 mb-4">
                                <button onClick={() => navigate('/dashboard')} className="p-4 rounded-2xl text-slate-500 hover:text-yellow-400 border border-transparent hover:border-yellow-500/30 hover:bg-yellow-500/10 transition-all bg-black/40 mb-1 active:scale-95 shadow-2xl backdrop-blur-xl group">
                                    <ArrowLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                                </button>

                                <div className="relative group">
                                    <div className="absolute -inset-2 bg-yellow-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-2xl border-2 border-yellow-500/30 shadow-[0_0_40px_rgba(250,204,21,0.1)] relative overflow-hidden backdrop-blur-xl">
                                        <Trophy className="w-10 h-10 text-yellow-500 group-hover:rotate-[15deg] transition-transform duration-500" />
                                        <div className="absolute top-0 right-0 p-1">
                                            <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-100 to-yellow-500 drop-shadow-sm">
                                        Rank<span className="text-white">ing</span>
                                    </h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-px w-8 bg-yellow-500/50" />
                                        <p className="text-[10px] font-mono text-yellow-500/70 uppercase tracking-[0.4em] font-black">
                                            Hall of Fame
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => fetch(true)} disabled={refreshing} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-slate-400 hover:text-white border border-white/10 hover:border-yellow-500/30 hover:bg-yellow-500/10 hover:shadow-[0_0_20px_rgba(250,204,21,0.1)] text-[11px] uppercase font-black tracking-widest transition-all group">
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} /> Sincronizar Ranking
                        </button>
                    </header>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* My position banner (if not in top 25 shown) */}
                            {myPos && myPos.position > 25 && (
                                <div className="mb-8 p-6 bg-gradient-to-r from-neon/10 to-transparent border-l-4 border-l-neon border-y border-r border-white/5 rounded-3xl flex items-center justify-between shadow-[0_0_30px_rgba(198,255,51,0.05)]">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-black/40 border border-neon/20 flex items-center justify-center shadow-inner">
                                            <span className="text-2xl font-black text-neon font-mono">#{myPos.position}</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-lg uppercase italic tracking-tight">Tu Rango Actual</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-slate-400 font-mono text-[11px] uppercase tracking-widest">Nivel {myPos.level}</span>
                                                <span className="text-slate-600">•</span>
                                                <span className="text-neon/80 font-mono text-[11px] font-bold">{myPos.xp.toLocaleString()} XP</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate('/tests')} className="px-6 py-3.5 bg-neon hover:bg-[#d4ff59] text-black rounded-2xl text-xs font-black uppercase transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(198,255,51,0.4)] group flex items-center gap-2">
                                        <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" /> Escalar Posiciones
                                    </button>
                                </div>
                            )}

                            {/* Podium — top 3 */}
                            {top3.length >= 3 && (
                                <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
                                    <PodiumCard entry={top3[1]} place={2} />
                                    <PodiumCard entry={top3[0]} place={1} />
                                    <PodiumCard entry={top3[2]} place={3} />
                                </div>
                            )}

                            {/* Full table */}
                            <div className="glass rounded-3xl border border-white/5 overflow-hidden shadow-2xl bg-black/20 backdrop-blur-3xl">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/[0.02]">
                                            <th className="text-left py-4 px-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black w-24">Pos.</th>
                                            <th className="text-left py-4 px-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">Identidad del Operador</th>
                                            <th className="text-center py-4 px-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black hidden sm:table-cell">Nivel</th>
                                            <th className="text-center py-4 px-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">Experiencia (XP)</th>
                                            <th className="text-right py-4 px-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black hidden md:table-cell">Clasificación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.leaderboard?.map((entry) => (
                                            <tr
                                                key={entry.user_id}
                                                className={`border-b border-white/[0.03] transition-colors ${entry.is_me ? 'bg-neon/10 shadow-inner' : 'hover:bg-white/[0.02]'}`}
                                            >
                                                <td className="py-4 px-6 font-mono text-base font-black">
                                                    <span className="text-2xl">{MEDAL[entry.position] || ''}</span>
                                                    {!MEDAL[entry.position] && <span className={entry.is_me ? 'text-neon drop-shadow-[0_0_5px_rgba(198,255,51,0.5)]' : 'text-slate-500'}>#{entry.position}</span>}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`font-black text-base md:text-lg tracking-tight ${entry.is_me ? 'text-white drop-shadow-md' : 'text-slate-200'}`}>
                                                        {entry.nombre} {entry.is_me && <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-neon/20 border border-neon/50 font-mono font-bold text-neon uppercase tracking-widest shadow-[0_0_10px_rgba(198,255,51,0.2)]">Tú</span>}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center hidden sm:table-cell">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-inner">
                                                        <span className="text-white font-black font-mono text-sm">{entry.level}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`font-mono text-base font-black ${entry.is_me ? 'text-neon drop-shadow-[0_0_8px_rgba(198,255,51,0.4)]' : 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.3)]'}`}>
                                                        {entry.xp.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right hidden md:table-cell">
                                                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px] uppercase font-bold tracking-widest shadow-sm">
                                                        {entry.rank_name}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!data?.leaderboard || data.leaderboard.length === 0) && (
                                    <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl m-8">
                                        <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Aún no hay pioneros en el ranking</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
