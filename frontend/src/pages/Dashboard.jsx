import { useEffect, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    TrendingUp, Target, Clock, AlertTriangle,
    Megaphone, Lightbulb, Send, MessageSquare,
    Shield, CheckCircle, Star, Zap, ChevronRight,
    Crosshair, Timer, BarChart2, Flame, LifeBuoy, ShieldAlert,
    History, Sparkles, Share2, Copy, Check, Gift
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import AnnouncementPopup from '../components/AnnouncementPopup'
import StreakCounter from '../components/StreakCounter'
import ProgressBar from '../components/ProgressBar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const initialState = {
    stats: null,
    loading: true,
    announcements: [],
    mySuggestions: [],
    myTickets: [],
}

function dashboardReducer(state, action) {
    switch (action.type) {
        case 'LOADED':
            return {
                ...state,
                stats: action.stats,
                announcements: action.announcements,
                mySuggestions: action.mySuggestions,
                myTickets: action.myTickets || [],
                loading: false,
            }
        case 'ERROR':
            return { ...state, loading: false }
        case 'SET_SUGGESTIONS':
            return { ...state, mySuggestions: action.mySuggestions }
        case 'SET_TICKETS':
            return { ...state, myTickets: action.myTickets }
        default:
            return state
    }
}

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [state, dispatch] = useReducer(dashboardReducer, initialState)
    const [suggestion, setSuggestion] = useState({ subject: '', text: '' })
    const [ticket, setTicket] = useState({ subject: '', description: '' })
    const [replyDrafts, setReplyDrafts] = useState({}) // { ticketId: draft }
    const [timeLeft, setTimeLeft] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const diff = endOfDay - now;

            if (diff <= 0) {
                setTimeLeft('00h 00m 00s');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`);
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, []);

    const { stats, loading, announcements, mySuggestions, myTickets } = state

    // --- LÓGICA DE GAMIFICACIÓN REAL ---
    const currentXP = stats?.current_xp || 0;
    const nextLevelXP = stats?.next_level_xp || 1000;
    const xpPercentage = Math.min(Math.round((currentXP / nextLevelXP) * 100), 100);
    const userRank = stats?.rank_name || "Recruit";

    const getDaysLeft = () => {
        if (!user?.subscription_end) return null;
        const end = new Date(user.subscription_end);
        const today = new Date();
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const daysLeft = getDaysLeft();

    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin-dashboard');
            return;
        }

        const fetchData = async () => {
            try {
                const [statsRes, annRes, sugRes, tickRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/announcements/active'),
                    api.get('/announcements/my-suggestions'),
                    api.get('/support/my-tickets')
                ]);
                dispatch({
                    type: 'LOADED',
                    stats: statsRes.data,
                    announcements: annRes.data,
                    mySuggestions: sugRes.data,
                    myTickets: tickRes.data,
                });
            } catch (err) {
                console.error("Error cargando Dashboard:", err);
                dispatch({ type: 'ERROR' });
            }
        };
        fetchData();
    }, [user, navigate]);

    const handleSuggest = async (e) => {
        e.preventDefault();
        try {
            await api.post('/announcements/suggest', suggestion);
            alert("🚀 ¡Gracias! Tu sugerencia ha sido enviada con éxito.");
            setSuggestion({ subject: '', text: '' });
            const res = await api.get('/announcements/my-suggestions');
            dispatch({ type: 'SET_SUGGESTIONS', mySuggestions: res.data });
        } catch (err) {
            alert("Error al enviar la sugerencia.");
        }
    };

    const handleTicket = async (e) => {
        e.preventDefault();
        try {
            await api.post('/support/tickets', ticket);
            alert("🛠️ Incidencia reportada. El equipo de soporte lo revisará pronto.");
            setTicket({ subject: '', description: '' });
            const res = await api.get('/support/my-tickets');
            dispatch({ type: 'SET_TICKETS', myTickets: res.data });
        } catch (err) {
            alert("Error al enviar el reporte.");
        }
    };

    const handleSendTicketMessage = async (ticketId) => {
        const content = replyDrafts[ticketId] || '';
        if (!content.trim()) return;

        try {
            await api.post(`/support/tickets/${ticketId}/messages`, { content });
            setReplyDrafts(prev => {
                const newDrafts = { ...prev };
                delete newDrafts[ticketId];
                return newDrafts;
            });
            // Refresh tickets to get new messages
            const res = await api.get('/support/my-tickets');
            dispatch({ type: 'SET_TICKETS', myTickets: res.data });
        } catch (err) {
            alert("Error al enviar el mensaje.");
        }
    };

    const totalTime = stats?.subjects.reduce((a, s) => a + s.time_invested_minutes, 0) || 0;
    const overallAcc = stats?.subjects.length
        ? Math.round(stats.subjects.reduce((a, s) => a + s.accuracy, 0) / stats.subjects.length)
        : 0;

    if (loading) return (
        <div className="flex h-screen bg-[#0D0D0D] items-center justify-center">
            <div className="w-10 h-10 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#050505] selection:bg-neon selection:text-black">
            <AnnouncementPopup />
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">
                {/* Background ambient effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon/5 blur-[120px] rounded-full -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/5 blur-[100px] rounded-full -z-10" />

                {/* ANUNCIO GLOBAL - solo el más reciente */}
                {announcements.length > 0 && (
                    <div className="mb-4">
                        <div className="group flex items-center gap-4 p-4 bg-neon/5 border border-neon/30 rounded-2xl animate-in slide-in-from-top-4 duration-700">
                            <div className="p-2 rounded-lg bg-neon/10 animate-pulse flex-shrink-0">
                                <Megaphone className="w-4 h-4 text-neon" />
                            </div>
                            <p className="text-sm font-mono text-neon font-bold uppercase tracking-tight flex-1">
                                <span className="opacity-50">[SISTEMA]:</span> {announcements[0].content}
                            </p>
                        </div>
                    </div>
                )}

                {/* REWARD ALERT */}
                {(stats?.pending_10p_discounts > 0 || stats?.free_months_accumulated > 0) && (
                    <div className="mb-8">
                        <div
                            onClick={() => navigate('/subscription')}
                            className="group flex items-center gap-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl cursor-pointer hover:bg-indigo-500/20 transition-all animate-pulse"
                        >
                            <div className="p-2 rounded-lg bg-indigo-500/20 flex-shrink-0">
                                <Gift className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black text-white uppercase tracking-widest">
                                    ¡Tienes recompensas disponibles!
                                </p>
                                <p className="text-[10px] font-mono text-indigo-300 uppercase opacity-70">
                                    {stats.free_months_accumulated > 0 && `${stats.free_months_accumulated} Mes(es) Gratis `}
                                    {stats.pending_10p_discounts > 0 && `${stats.pending_10p_discounts} Cupón(es) del 10% `}
                                    — Haz clic para canjear en tu suscripción.
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                )}

                {/* Header */}
                <header className="mb-14 flex justify-between items-end relative z-10">
                    <div className="animate-in fade-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-5 mb-4">
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-[var(--color-neon)]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-4 bg-gradient-to-br from-[var(--color-neon)]/20 to-transparent rounded-2xl border-2 border-[var(--color-neon)]/30 shadow-[0_0_40px_var(--neon-alpha-10)] relative overflow-hidden backdrop-blur-xl">
                                    <Target className="w-10 h-10 text-neon group-hover:rotate-[15deg] transition-transform duration-500" />
                                    <div className="absolute top-0 right-0 p-1">
                                        <Sparkles className="w-3 h-3 text-neon animate-pulse" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-[var(--color-neon)] drop-shadow-sm">
                                    Base<span className="text-white">Camp</span>
                                </h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="h-px w-8 bg-neon/50" />
                                    <p className="text-[10px] font-mono text-neon/70 uppercase tracking-[0.4em] font-black">
                                        Bienvenido, {user?.nombre || 'Guerrero'} // Protocolo Activo
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* KPIs SUPERIORES */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
                    {/* Racha / Misión */}
                    <div className="group relative bg-gradient-to-br from-stone-900 to-black p-6 rounded-[2rem] border border-white/5 hover:border-orange-500/30 transition-all duration-500 shadow-xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -z-10 group-hover:bg-orange-500/10 transition-colors" />
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 group-hover:scale-110 transition-transform">
                                <Flame className="w-4 h-4 text-orange-400" />
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">Estado de Misión</p>
                        </div>

                        <StreakCounter streak={user?.streak_count || 0} size="lg" />

                        <div className="mt-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Escudos activos:</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {Array.from({ length: 4 }).map((_, i) => {
                                    const hasShield = i < (user?.streak_protections || 0);
                                    return (
                                        <Shield
                                            key={i}
                                            className={`w-6 h-6 transition-all ${hasShield
                                                ? 'text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]'
                                                : 'text-slate-700'
                                                }`}
                                        />
                                    );
                                })}
                                <span className="ml-1 text-[10px] font-mono font-bold text-sky-400">
                                    {user?.streak_protections || 0}/4
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Precisión */}
                    <div className="group relative bg-gradient-to-br from-stone-900 to-black p-6 rounded-[2rem] border border-white/5 hover:border-sky-500/30 transition-all duration-500 shadow-xl">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 group-hover:scale-110 transition-transform">
                                <BarChart2 className="w-4 h-4 text-sky-400" />
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">Puntería</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black font-mono text-white tracking-tighter">{overallAcc}</span>
                            <span className="text-sky-400 font-mono text-xl font-bold">%</span>
                        </div>
                        <p className="text-[9px] font-mono text-slate-600 uppercase mt-1 tracking-tighter font-bold">% de aciertos en los test</p>
                        <div className="mt-4"><ProgressBar percent={overallAcc} /></div>
                    </div>

                    {/* Rango / XP */}
                    <div className="group relative lg:col-span-1 bg-gradient-to-br from-[#0A1A0F] to-black p-6 rounded-[2rem] border border-neon/20 hover:border-neon transition-all duration-500 shadow-[0_0_20px_rgba(0,255,65,0.05)] hover:shadow-[0_0_30px_rgba(0,255,65,0.15)] overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon/10 blur-[60px] rounded-full animate-pulse" />
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded-xl bg-neon/10 border border-neon/20 group-hover:rotate-12 transition-transform">
                                        <Shield className="w-4 h-4 text-neon" />
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-neon text-[#050505] text-[8px] font-black uppercase tracking-tighter">Clave {userRank.charAt(0)}</span>
                                </div>
                                <p className="text-[9px] font-mono text-neon uppercase tracking-widest mb-1">Rango Actual</p>
                                <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter group-hover:translate-x-1 transition-transform">{userRank}</h3>
                            </div>
                            <div className="mt-8">
                                <div className="flex justify-between items-end mb-1.5">
                                    <span className="text-[9px] font-mono text-slate-500 uppercase">Progreso XP</span>
                                    <span className="text-[10px] font-mono text-neon font-black">{currentXP} / {nextLevelXP}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-neon via-cyan-400 to-neon bg-[length:200%_auto] animate-text-shimmer rounded-full transition-all duration-1000"
                                        style={{ width: `${xpPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Referidos / Invitar */}
                    <div className="group relative bg-gradient-to-br from-indigo-950/30 to-black p-6 rounded-[2rem] border border-indigo-500/10 hover:border-indigo-500/40 transition-all duration-500 shadow-xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10" />
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                <Share2 className="w-4 h-4 text-indigo-400" />
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">Programa de Referidos</p>
                        </div>

                        <div className="mb-4">
                            <p className="text-[10px] font-mono text-indigo-300 uppercase mb-1">Tu Código</p>
                            <div className="flex items-center gap-2">
                                <code className="px-3 py-1.5 bg-black/50 border border-indigo-500/20 rounded-lg text-sm font-mono text-white tracking-widest uppercase">
                                    {user?.referral_code || '---'}
                                </code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(user?.referral_code || '');
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-indigo-400"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[12px] font-bold text-white">¡Gana un 10% de descuento!</p>
                            <p className="text-[9px] text-slate-400 leading-tight">Por cada amigo que se registre con tu código, acumulas recompensas.</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-500 uppercase">Éxitos:</span>
                            <span className="text-xl font-black font-mono text-indigo-400">{stats?.referral_reward_count || 0}</span>
                        </div>

                        <div className="mt-2 text-[9px] font-mono space-y-1">
                            <div className="flex justify-between items-center text-slate-400">
                                <span>10% OFF Pendientes:</span>
                                <span className="font-bold text-indigo-400">{stats?.pending_10p_discounts || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                                <span>Meses Gratis:</span>
                                <span className="font-bold text-indigo-400">{stats?.free_months_accumulated || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Preguntas Totales */}
                    <div className="group relative bg-gradient-to-br from-stone-900 to-black p-6 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 shadow-xl">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                <Crosshair className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">Incursiones</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black font-mono text-white tracking-tighter">{stats?.total_questions_answered || 0}</span>
                            <span className="text-slate-600 font-mono text-xs uppercase font-bold tracking-widest">HITS</span>
                        </div>
                        <p className="mt-2 text-[9px] font-mono text-slate-500 uppercase tracking-tighter font-bold">Preguntas realizadas</p>
                        <p className="mt-2 text-[9px] font-mono text-slate-700 italic opacity-60">Datos validados por el núcleo</p>
                    </div>

                    {/* TiempoInvertido */}
                    <div className="group relative bg-gradient-to-br from-stone-900 to-black p-6 rounded-[2rem] border border-white/5 hover:border-violet-500/30 transition-all duration-500 shadow-xl">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:scale-110 transition-transform">
                                <Timer className="w-4 h-4 text-violet-400" />
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">Conexión</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black font-mono text-white tracking-tighter">{Math.round(totalTime)}</span>
                            <span className="text-violet-400 font-mono text-lg font-bold italic">m</span>
                        </div>
                        <div className="mt-4 h-1 w-12 bg-violet-500/20 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 w-2/3 animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Columna Izquierda: Rendimiento + Historial */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-8 border border-white/5">
                            <h2 className="text-sm font-black font-mono text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-sky-400" />
                                </span>
                                Maestría por Sector
                            </h2>
                            <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                                {stats?.subjects.map(s => (
                                    <ProgressBar key={s.subject} subject={s.subject} percent={Math.round(s.accuracy)} />
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-8 border border-white/5">
                                <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-3 tracking-[0.3em]">
                                    <span className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <MessageSquare className="w-4 h-4 text-blue-400" />
                                    </span>
                                    <span className="text-white">Mis Propuestas</span>
                                </h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-4 custom-scrollbar">
                                    {mySuggestions.length > 0 ? mySuggestions.map(sug => (
                                        <div key={sug.id} className="flex justify-between items-center p-4 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 transition-all group">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-mono text-slate-500 uppercase font-black">{sug.subject}</span>
                                                <p className="text-[11px] text-slate-300 font-mono italic max-w-md line-clamp-1">"{sug.text}"</p>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border flex items-center gap-2 ${sug.status === 'aprobada' ? 'bg-neon/10 text-neon border-neon/30 animate-pulse' :
                                                sug.status === 'descartada' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                                                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                                                }`}>
                                                {sug.status === 'aprobada' ? 'ACEPTADA' : sug.status.toUpperCase()}
                                            </span>
                                        </div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-30 italic">
                                            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest">Esperando propuestas...</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-8 border border-white/5">
                                <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-3 tracking-[0.3em]">
                                    <span className="w-8 h-8 rounded bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                        <LifeBuoy className="w-4 h-4 text-orange-400" />
                                    </span>
                                    <span className="text-white">Mis Incidencias</span>
                                </h3>
                                <div className="space-y-6 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                                    {myTickets.length > 0 ? myTickets.map(tick => (
                                        <div key={tick.id} className="p-6 bg-white/[0.02] hover:bg-white/[0.04] rounded-[2rem] border border-white/5 transition-all group flex flex-col gap-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-black text-white uppercase italic tracking-tighter">{tick.subject}</span>
                                                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded border ${tick.status === 'resuelto' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30 animate-pulse'}`}>
                                                    {tick.status}
                                                </span>
                                            </div>

                                            <p className="text-[11px] font-mono text-slate-400 italic bg-black/40 p-4 rounded-xl border border-white/5">
                                                "{tick.description}"
                                            </p>

                                            {tick.admin_reply && (
                                                <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                                                    <p className="text-[11px] text-orange-200 font-mono italic">
                                                        <span className="text-orange-400 font-black not-italic uppercase mr-2">[LEGACY]:</span>
                                                        "{tick.admin_reply}"
                                                    </p>
                                                </div>
                                            )}

                                            {tick.messages && tick.messages.length > 0 && (
                                                <div className="space-y-3 mt-2">
                                                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <MessageSquare className="w-3.5 h-3.5" /> Hilo de Mensajes
                                                    </p>
                                                    {tick.messages.map(msg => (
                                                        <div key={msg.id} className={`p-4 rounded-2xl flex flex-col gap-2 ${msg.sender_role === 'admin' ? 'bg-orange-500/10 border border-orange-500/20 ml-6' : 'bg-white/5 border border-white/5 mr-6'}`}>
                                                            <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-widest">
                                                                <span className={msg.sender_role === 'admin' ? 'text-orange-400' : 'text-slate-400'}>
                                                                    {msg.sender_role === 'admin' ? 'SOPORTE ALPHA' : 'TÚ'}
                                                                </span>
                                                                <span className="text-slate-600">{new Date(msg.created_at).toLocaleString()}</span>
                                                            </div>
                                                            <p className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                                {msg.content}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {tick.status === 'pendiente' && (
                                                <div className="mt-4 flex flex-col gap-3">
                                                    <textarea
                                                        className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-xs font-mono text-white placeholder:text-slate-700 focus:border-orange-500/50 outline-none transition-all resize-none min-h-[60px]"
                                                        placeholder="Añade un mensaje o respuesta al hilo..."
                                                        value={replyDrafts[tick.id] || ''}
                                                        onChange={(e) => setReplyDrafts(prev => ({ ...prev, [tick.id]: e.target.value }))}
                                                        rows="2"
                                                    />
                                                    <button
                                                        onClick={() => handleSendTicketMessage(tick.id)}
                                                        disabled={!replyDrafts[tick.id]?.trim()}
                                                        className="self-end px-6 py-3 bg-orange-500 text-black text-[10px] font-black uppercase rounded-xl hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                    >
                                                        <Send className="w-3.5 h-3.5" /> Enviar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-30 italic">
                                            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest">No hay reportes activos.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Alertas + Soporte */}
                    <div className="flex flex-col gap-8">
                        {/* ANOMALÍAS (TOP) */}
                        <div className="relative group bg-gradient-to-br from-red-600/10 to-transparent p-8 rounded-[2.5rem] border border-red-500/20 overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl group-hover:bg-red-500/10 transition-colors" />
                            <div className="flex items-center gap-3 mb-6">
                                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                                <h2 className="text-xs font-black font-mono uppercase tracking-[0.4em] text-red-500">Alerta: Anomalías</h2>
                            </div>
                            <div className="flex items-end gap-4 relative z-10">
                                <span className="text-6xl font-black font-mono text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] group-hover:scale-110 transition-transform duration-500">{stats?.total_errors || 0}</span>
                                <div className="mb-2">
                                    <p className="text-[10px] text-slate-400 font-mono leading-tight uppercase tracking-tighter font-bold">Preguntas de error<br />acumuladas por corregir</p>
                                    <div className="h-1 w-full bg-red-500/20 mt-1 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 w-1/2 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, white, transparent)', backgroundSize: '200% 100%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BUZÓN DE INCIDENCIAS */}
                        <div className="bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-8 border border-white/5">
                            <h2 className="text-sm font-black font-mono uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                    <LifeBuoy className="w-4 h-4 text-orange-400" />
                                </span>
                                <span className="text-white">Incidencias Academia</span>
                            </h2>
                            <form onSubmit={handleTicket} className="space-y-4">
                                <input
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-[11px] font-mono text-white outline-none focus:border-orange-500 transition-colors placeholder:text-slate-700 font-bold"
                                    placeholder="ASUNTO DE LA INCIDENCIA..."
                                    value={ticket.subject}
                                    onChange={(e) => setTicket(prev => ({ ...prev, subject: e.target.value }))}
                                />
                                <textarea
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] font-mono text-white outline-none h-32 focus:border-orange-500 resize-none transition-colors placeholder:text-slate-700"
                                    placeholder="Describe tu incidencia o sugerencia para la academia..."
                                    value={ticket.description}
                                    onChange={(e) => setTicket(prev => ({ ...prev, description: e.target.value }))}
                                />
                                <button className="w-full py-4 bg-orange-500/80 hover:bg-orange-500 text-white text-xs font-black uppercase rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all duration-300 transform active:scale-[0.98]">
                                    <ShieldAlert className="w-4 h-4" /> Enviar Reporte
                                </button>
                            </form>
                        </div>

                        {/* SUGERENCIAS I+D */}
                        <div className="bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-8 border border-white/5 opacity-70 hover:opacity-100 transition-opacity">
                            <h2 className="text-sm font-black font-mono uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded bg-neon/10 border border-neon/20 flex items-center justify-center">
                                    <Lightbulb className="w-4 h-4 text-neon" />
                                </span>
                                <span className="text-white">Proponer I+D</span>
                            </h2>
                            <form onSubmit={handleSuggest} className="space-y-4">
                                <div className="relative group">
                                    <select required className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-[11px] font-mono text-white outline-none focus:border-neon transition-colors appearance-none"
                                        value={suggestion.subject} onChange={(e) => setSuggestion(prev => ({ ...prev, subject: e.target.value }))}>
                                        <option value="">SELECCIONAR MÓDULO</option>
                                        <option value="Redes">REDES</option>
                                        <option value="Sistemas Operativos">SISTEMAS OPERATIVOS</option>
                                        <option value="Bases de Datos">BASES DE DATOS</option>
                                        <option value="Ciberseguridad">CIBERSEGURIDAD</option>
                                        <option value="Fundamentos de Hardware">HARDWARE</option>
                                        <option value="Lenguaje de Marcas">LENGUAJE DE MARCAS</option>
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 rotate-90 pointer-events-none" />
                                </div>
                                <textarea required className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] font-mono text-white outline-none h-24 focus:border-neon resize-none transition-colors placeholder:text-slate-700"
                                    placeholder="Vulnerabilidad a añadir..." value={suggestion.text} onChange={(e) => setSuggestion(prev => ({ ...prev, text: e.target.value }))} />
                                <button className="w-full py-3 bg-neon/80 hover:bg-neon text-black text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-3 transition-all">
                                    <Send className="w-3 h-3" /> Proponer
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite linear;
                }
                @keyframes text-shimmer {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }
                .animate-text-shimmer {
                    animation: text-shimmer 3s infinite linear;
                }
            `}} />
        </div>
    )
}