import { useEffect, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Target, AlertTriangle,
    Megaphone, Lightbulb, Send, MessageSquare,
    Shield, ChevronRight,
    Timer, Flame, LifeBuoy, ShieldAlert,
    Sparkles, Share2, Copy, Check, Gift,
    Zap, TrendingUp, Users, Star, Crown, BarChart2
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import AnnouncementPopup from '../components/AnnouncementPopup'
import StreakCounter from '../components/StreakCounter'
import ProgressBar from '../components/ProgressBar'
import PageHeader from '../components/PageHeader'
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
    const [replyDrafts, setReplyDrafts] = useState({})
    const [timeLeft, setTimeLeft] = useState('');
    const [copied, setCopied] = useState(false);
    const [sendingTicket, setSendingTicket] = useState(false);
    const [sendingSuggestion, setSendingSuggestion] = useState(false);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const diff = endOfDay - now;
            if (diff <= 0) { setTimeLeft('00h 00m 00s'); return; }
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
        if (user?.role === 'admin') { navigate('/admin-dashboard'); return; }
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
                (import.meta.env.DEV && console.error)("Error cargando Dashboard:", err);
                dispatch({ type: 'ERROR' });
            }
        };
        fetchData();
    }, [user, navigate]);

    const handleSuggest = async (e) => {
        e.preventDefault();
        if (!suggestion.subject) { alert("⚠️ Por favor, selecciona un submódulo para tu propuesta."); return; }
        setSendingSuggestion(true);
        try {
            await api.post('/announcements/suggest', suggestion);
            alert("🚀 ¡Gracias! Tu sugerencia ha sido enviada con éxito.");
            setSuggestion({ subject: '', text: '' });
            const res = await api.get('/announcements/my-suggestions');
            dispatch({ type: 'SET_SUGGESTIONS', mySuggestions: res.data });
        } catch (err) {
            const detail = err.response?.data?.detail;
            alert("❌ " + (Array.isArray(detail) ? detail.map(d => d.msg).join(", ") : detail || "Error al enviar."));
        } finally { setSendingSuggestion(false); }
    };

    const handleTicket = async (e) => {
        e.preventDefault();
        setSendingTicket(true);
        try {
            await api.post('/support/tickets', ticket);
            alert("🛠️ Incidencia reportada. El equipo de soporte lo revisará pronto.");
            setTicket({ subject: '', description: '' });
            const res = await api.get('/support/my-tickets');
            dispatch({ type: 'SET_TICKETS', myTickets: res.data });
        } catch (err) {
            const detail = err.response?.data?.detail;
            alert("❌ " + (Array.isArray(detail) ? detail.map(d => d.msg).join(", ") : detail || "Error."));
        } finally { setSendingTicket(false); }
    };

    const handleSendTicketMessage = async (ticketId) => {
        const content = replyDrafts[ticketId] || '';
        if (!content.trim()) return;
        try {
            await api.post(`/support/tickets/${ticketId}/messages`, { content });
            setReplyDrafts(prev => { const d = { ...prev }; delete d[ticketId]; return d; });
            const res = await api.get('/support/my-tickets');
            dispatch({ type: 'SET_TICKETS', myTickets: res.data });
        } catch { alert("Error al enviar el mensaje."); }
    };

    // Early return para admin — evita renderizar la vista de alumno incluso un frame
    if (user?.role === 'admin') return null;

    if (loading) return (
        <div className="flex h-screen bg-[#0D0D0D] items-center justify-center">
            <div className="w-10 h-10 border-4 border-neon border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const referralProgress = Math.min(stats?.referral_reward_count || 0, 10);
    const hasPendingRewards = (stats?.pending_10p_discounts > 0 || stats?.free_months_accumulated > 0);

    return (
        <div className="flex min-h-screen bg-[#050505] selection:bg-neon selection:text-black">
            <AnnouncementPopup />
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">

                {/* Background ambient */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon/5 blur-[120px] rounded-full -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/5 blur-[100px] rounded-full -z-10" />

                {/* Announcement */}
                {announcements.length > 0 && (
                    <div className="mb-4 group flex items-center gap-4 p-4 bg-neon/5 border border-neon/30 rounded-2xl animate-in slide-in-from-top-4 duration-700">
                        <div className="p-2 rounded-lg bg-neon/10 animate-pulse flex-shrink-0">
                            <Megaphone className="w-4 h-4 text-neon" />
                        </div>
                        <p className="text-sm font-mono text-neon font-bold uppercase tracking-tight flex-1">
                            <span className="opacity-50">[SISTEMA]:</span> {announcements[0].content}
                        </p>
                    </div>
                )}

                {/* Reward Alert */}
                {hasPendingRewards && (
                    <div
                        onClick={() => navigate('/subscription')}
                        className="mb-6 group flex items-center gap-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl cursor-pointer hover:bg-indigo-500/20 transition-all animate-pulse"
                    >
                        <div className="p-2 rounded-lg bg-indigo-500/20 flex-shrink-0">
                            <Gift className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black text-white uppercase tracking-widest">¡Tienes recompensas disponibles!</p>
                            <p className="text-[10px] font-mono text-indigo-300 uppercase opacity-70">
                                {stats.free_months_accumulated > 0 && `${stats.free_months_accumulated} Mes(es) Gratis `}
                                {stats.pending_10p_discounts > 0 && `${stats.pending_10p_discounts} Cupón(es) 10% `}
                                — Clic para canjear.
                            </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                )}

                {/* Header */}
                <PageHeader
                    title={<>Base<span className="text-white">Camp</span></>}
                    subtitle={`Status: Operational // Bienvenido, ${user?.nombre || 'Guerrero'}`}
                    Icon={Target}
                    gradient="from-neon via-white to-sky-400"
                />

                {/* ── TOP ROW: RACHA + RANGO + REFERIDOS + RECOMPENSAS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                    {/* RACHA */}
                    <div className="group relative bg-gradient-to-br from-stone-900 to-black p-6 rounded-[2rem] border border-white/5 hover:border-orange-500/30 transition-all duration-500 shadow-xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -z-10 group-hover:bg-orange-500/10 transition-colors" />
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 group-hover:scale-110 transition-transform">
                                <Flame className="w-4 h-4 text-orange-400" />
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">Racha Activa</p>
                        </div>
                        <StreakCounter streak={user?.streak_count || 0} size="lg" />
                        {user?.streak_protections > 0 && (
                            <div className="mt-3 flex items-center gap-1.5">
                                {Array.from({ length: Math.min(user.streak_protections, 4) }).map((_, i) => (
                                    <Shield key={i} className="w-3.5 h-3.5 text-sky-400 drop-shadow-[0_0_4px_rgba(56,189,248,0.5)]" />
                                ))}
                                <span className="text-[9px] font-mono text-sky-400/70 ml-1">{user.streak_protections} escudo{user.streak_protections !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                        <p className="text-[10px] font-mono text-slate-600 mt-2 flex items-center gap-1">
                            <Timer className="w-3 h-3" /> Reset en {timeLeft}
                        </p>
                    </div>

                    {/* RANGO / XP */}
                    <div className="group relative bg-gradient-to-br from-[#0A1A0F] to-black p-6 rounded-[2rem] border border-neon/20 hover:border-neon transition-all duration-500 shadow-[0_0_20px_rgba(0,255,65,0.05)] overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon/10 blur-[60px] rounded-full animate-pulse" />
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded-xl bg-neon/10 border border-neon/20 group-hover:rotate-12 transition-transform">
                                        <Shield className="w-4 h-4 text-neon" />
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-neon text-[#050505] text-[8px] font-black uppercase tracking-tighter">LVL {stats?.level || 1}</span>
                                </div>
                                <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">{userRank}</h3>
                                <p className="text-[10px] font-mono text-neon/50 mt-0.5">{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</p>
                            </div>
                            <div className="mt-4">
                                <ProgressBar percent={xpPercentage} />
                            </div>
                        </div>
                    </div>

                    {/* REFERIDOS */}
                    <div className="group relative bg-gradient-to-br from-indigo-950/40 to-black p-6 rounded-[2rem] border border-indigo-500/15 hover:border-indigo-500/40 transition-all duration-500 shadow-xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors" />
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                <Share2 className="w-4 h-4 text-indigo-400" />
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">Referidos</p>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            <code className="px-2 py-1 bg-black/50 border border-indigo-500/20 rounded-lg text-sm font-mono text-white tracking-widest uppercase flex-1 text-center">
                                {user?.referral_code || '---'}
                            </code>
                            <button
                                onClick={() => { navigator.clipboard.writeText(user?.referral_code || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                className="p-2 hover:bg-indigo-500/10 rounded-lg transition-colors text-indigo-400 flex-shrink-0"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Progress bar to free month */}
                        <div className="mb-1">
                            <div className="flex justify-between text-[9px] font-mono mb-1">
                                <span className="text-slate-500">Progreso mes gratis</span>
                                <span className="text-indigo-400 font-black">{referralProgress}/10</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-700"
                                    style={{ width: `${(referralProgress / 10) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[9px] font-mono text-slate-600">Invitados confirmados</span>
                            <span className="text-sm font-black font-mono text-indigo-400">{stats?.referral_reward_count || 0}</span>
                        </div>
                    </div>

                    {/* RECOMPENSAS */}
                    <div className="group relative bg-gradient-to-br from-violet-950/30 to-black p-6 rounded-[2rem] border border-violet-500/10 hover:border-violet-500/30 transition-all duration-500 shadow-xl overflow-hidden cursor-pointer"
                        onClick={() => navigate('/suscripcion/gestionar')}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 blur-3xl -z-10 group-hover:bg-violet-500/10 transition-colors" />
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:scale-110 transition-transform">
                                <Star className="w-4 h-4 text-violet-400" />
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">Recompensas</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-slate-500 uppercase">Cupones 10%</span>
                                <span className={`text-lg font-black font-mono ${(stats?.pending_10p_discounts || 0) > 0 ? 'text-violet-400' : 'text-slate-700'}`}>
                                    {stats?.pending_10p_discounts || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-slate-500 uppercase">Meses gratis</span>
                                <span className={`text-lg font-black font-mono ${(stats?.free_months_accumulated || 0) > 0 ? 'text-yellow-400' : 'text-slate-700'}`}>
                                    {stats?.free_months_accumulated || 0}
                                </span>
                            </div>
                            {daysLeft !== null && (
                                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                    <span className="text-[9px] font-mono text-slate-500 uppercase">Suscripción</span>
                                    <span className={`text-xs font-black font-mono ${daysLeft <= 7 ? 'text-red-400' : 'text-neon'}`}>
                                        {daysLeft}d
                                    </span>
                                </div>
                            )}
                        </div>

                        {hasPendingRewards && (
                            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                        )}
                    </div>
                </div>

                {/* ── ANOMALÍAS BANNER ── */}
                {(stats?.total_errors || 0) > 0 && (
                    <div className="mb-8 relative group bg-gradient-to-r from-red-600/10 via-transparent to-transparent p-5 rounded-[2rem] border border-red-500/20 overflow-hidden shadow-xl flex items-center gap-6">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 blur-2xl" />
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                            <div>
                                <p className="text-xs font-black font-mono uppercase tracking-[0.3em] text-red-500">Anomalías Detectadas</p>
                                <p className="text-[10px] font-mono text-slate-500">Preguntas falladas pendientes de repasar</p>
                            </div>
                        </div>
                        <span className="text-5xl font-black font-mono text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] ml-auto relative z-10">{stats?.total_errors || 0}</span>
                        <button
                            onClick={() => navigate('/tests')}
                            className="px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-wide hover:bg-red-500 hover:text-white transition-all relative z-10 flex-shrink-0"
                        >
                            Repasar ahora
                        </button>
                    </div>
                )}

                {/* ── FORMS ROW ── */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* REPORTAR INCIDENCIA */}
                    <div className="group relative glass rounded-[2.5rem] p-7 border border-white/5 hover:border-orange-500/20 transition-all duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:rotate-6 transition-transform">
                                <LifeBuoy className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white uppercase italic tracking-tighter">Reportar Incidencia</h2>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Soporte técnico directo</p>
                            </div>
                        </div>
                        <form onSubmit={handleTicket} className="space-y-3">
                            <input required className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-mono text-white outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-700"
                                placeholder="Asunto (e.g. Error en Test Redes)"
                                value={ticket.subject}
                                onChange={(e) => setTicket(prev => ({ ...prev, subject: e.target.value }))} />
                            <textarea required className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-xs font-mono text-white outline-none h-24 focus:border-orange-500/50 resize-none transition-all placeholder:text-slate-700"
                                placeholder="Describe el problema detalladamente..."
                                value={ticket.description}
                                onChange={(e) => setTicket(prev => ({ ...prev, description: e.target.value }))} />
                            <button disabled={sendingTicket} className="w-full py-4 bg-orange-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <ShieldAlert className={`w-4 h-4 ${sendingTicket ? 'animate-spin' : ''}`} />
                                {sendingTicket ? 'Enviando...' : 'Enviar Reporte'}
                            </button>
                        </form>
                    </div>

                    {/* PROPUESTA DE PREGUNTA */}
                    <div className="group relative glass rounded-[2.5rem] p-7 border border-white/5 hover:border-neon/20 transition-all duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-neon/10 border border-neon/20 flex items-center justify-center group-hover:-rotate-6 transition-transform">
                                <Lightbulb className="w-5 h-5 text-neon" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white uppercase italic tracking-tighter">Propuesta de Pregunta</h2>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Contribuye al Banco I+D</p>
                            </div>
                        </div>
                        <form onSubmit={handleSuggest} className="space-y-3">
                            <div className="relative">
                                <select required className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-mono text-white outline-none focus:border-neon/40 transition-all appearance-none"
                                    value={suggestion.subject} onChange={(e) => setSuggestion(prev => ({ ...prev, subject: e.target.value }))}>
                                    <option value="" disabled>SELECCIONAR SUBMÓDULO</option>
                                    <option value="Redes">REDES</option>
                                    <option value="Sistemas Operativos">SISTEMAS OPERATIVOS</option>
                                    <option value="Bases de Datos">BASES DE DATOS</option>
                                    <option value="Ciberseguridad">CIBERSEGURIDAD</option>
                                    <option value="Fundamentos de Hardware">HARDWARE</option>
                                    <option value="Lenguaje de Marcas">LENGUAJE DE MARCAS</option>
                                </select>
                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 rotate-90 pointer-events-none" />
                            </div>
                            <textarea required className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-xs font-mono text-white outline-none h-24 focus:border-neon/40 resize-none transition-all placeholder:text-slate-700"
                                placeholder="Propón una pregunta con sus opciones..." value={suggestion.text} onChange={(e) => setSuggestion(prev => ({ ...prev, text: e.target.value }))} />
                            <button disabled={sendingSuggestion} className="w-full py-4 bg-neon text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-[0_0_30px_rgba(198,255,51,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Send className={`w-3.5 h-3.5 ${sendingSuggestion ? 'animate-pulse' : ''}`} />
                                {sendingSuggestion ? 'Enviando...' : 'Enviar Propuesta'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── BOTTOM SECTION ── */}
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Mis Incidencias */}
                    <div className="bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-7 border border-white/5">
                        <h3 className="text-sm font-black uppercase mb-5 flex items-center gap-3 tracking-[0.2em]">
                            <span className="w-8 h-8 rounded bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                <LifeBuoy className="w-4 h-4 text-orange-400" />
                            </span>
                            <span className="text-white">Mis Incidencias</span>
                        </h3>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {myTickets.length > 0 ? myTickets.map(tick => (
                                <div key={tick.id} className="p-5 bg-white/[0.02] hover:bg-white/[0.04] rounded-[2rem] border border-white/5 transition-all flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-black text-white uppercase italic tracking-tighter">{tick.subject}</span>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${tick.status === 'resuelto' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30 animate-pulse'}`}>
                                            {tick.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-mono text-slate-400 italic bg-black/40 p-3 rounded-xl border border-white/5">"{tick.description}"</p>
                                    {tick.admin_reply && (
                                        <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                                            <p className="text-[11px] text-orange-200 font-mono italic">
                                                <span className="text-orange-400 font-black not-italic uppercase mr-2">[SOPORTE]:</span>"{tick.admin_reply}"
                                            </p>
                                        </div>
                                    )}
                                    {tick.messages?.length > 0 && (
                                        <div className="space-y-2">
                                            {tick.messages.map(msg => (
                                                <div key={msg.id} className={`p-3 rounded-2xl ${msg.sender_role === 'admin' ? 'bg-orange-500/10 border border-orange-500/20 ml-4' : 'bg-white/5 border border-white/5 mr-4'}`}>
                                                    <div className="flex justify-between text-[9px] font-mono font-bold uppercase mb-1">
                                                        <span className={msg.sender_role === 'admin' ? 'text-orange-400' : 'text-slate-400'}>{msg.sender_role === 'admin' ? 'SOPORTE' : 'TÚ'}</span>
                                                        <span className="text-slate-600">{new Date(msg.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-[11px] font-mono text-slate-300">{msg.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {tick.status === 'pendiente' && (
                                        <div className="flex gap-2 mt-1">
                                            <textarea className="flex-1 bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono text-white placeholder:text-slate-700 focus:border-orange-500/50 outline-none resize-none min-h-[50px]"
                                                placeholder="Añade un mensaje..."
                                                value={replyDrafts[tick.id] || ''}
                                                onChange={(e) => setReplyDrafts(prev => ({ ...prev, [tick.id]: e.target.value }))} rows="2" />
                                            <button onClick={() => handleSendTicketMessage(tick.id)} disabled={!replyDrafts[tick.id]?.trim()}
                                                className="px-4 py-2 bg-orange-500 text-black text-[9px] font-black uppercase rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5">
                                                <Send className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <p className="text-xs font-mono text-slate-600 uppercase tracking-widest text-center py-8 opacity-40">No hay reportes activos.</p>
                            )}
                        </div>
                    </div>

                    {/* Mis Propuestas */}
                    <div className="bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-7 border border-white/5">
                        <h3 className="text-sm font-black uppercase mb-5 flex items-center gap-3 tracking-[0.2em]">
                            <span className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-blue-400" />
                            </span>
                            <span className="text-white">Mis Propuestas</span>
                        </h3>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {mySuggestions.length > 0 ? mySuggestions.map(sug => (
                                <div key={sug.id} className="flex justify-between items-center p-4 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 transition-all">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-mono text-slate-500 uppercase font-black">{sug.subject}</span>
                                        <p className="text-[11px] text-slate-300 font-mono italic max-w-xs line-clamp-1">"{sug.text}"</p>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border flex-shrink-0 ${sug.status === 'aprobada' ? 'bg-neon/10 text-neon border-neon/30 animate-pulse' : sug.status === 'descartada' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'}`}>
                                        {sug.status === 'aprobada' ? 'ACEPTADA' : sug.status.toUpperCase()}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-xs font-mono text-slate-600 uppercase tracking-widest text-center py-8 opacity-40">Esperando propuestas...</p>
                            )}
                        </div>
                    </div>

                    {/* Maestría por Sector */}
                    <div className="bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-7 border border-white/5">
                        <h3 className="text-sm font-black uppercase mb-5 flex items-center gap-3 tracking-[0.2em]">
                            <span className="w-8 h-8 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                                <BarChart2 className="w-4 h-4 text-sky-400" />
                            </span>
                            <span className="text-white">Maestría por Sector</span>
                        </h3>
                        <div className="space-y-5">
                            {stats?.subjects.map(s => (
                                <ProgressBar key={s.subject} subject={s.subject} percent={Math.round(s.accuracy)} />
                            ))}
                        </div>
                    </div>
                </div>

            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                .animate-shimmer { animation: shimmer 2s infinite linear; }
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}} />
        </div>
    )
}
