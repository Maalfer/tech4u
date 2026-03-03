import { useEffect, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    TrendingUp, Target, Clock, AlertTriangle,
    Megaphone, Lightbulb, Send, MessageSquare,
    Shield, CheckCircle, Star, Zap, ChevronRight
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StreakCounter from '../components/StreakCounter'
import ProgressBar from '../components/ProgressBar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const initialState = {
    stats: null,
    loading: true,
    announcements: [],
    mySuggestions: [],
}

function dashboardReducer(state, action) {
    switch (action.type) {
        case 'LOADED':
            return {
                ...state,
                stats: action.stats,
                announcements: action.announcements,
                mySuggestions: action.mySuggestions,
                loading: false,
            }
        case 'ERROR':
            return { ...state, loading: false }
        case 'SET_SUGGESTIONS':
            return { ...state, mySuggestions: action.mySuggestions }
        default:
            return state
    }
}

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [state, dispatch] = useReducer(dashboardReducer, initialState)
    const [suggestion, setSuggestion] = useState({ subject: '', text: '' })

    const { stats, loading, announcements, mySuggestions } = state

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
                const [statsRes, annRes, sugRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/announcements/active'),
                    api.get('/announcements/my-suggestions')
                ]);
                dispatch({
                    type: 'LOADED',
                    stats: statsRes.data,
                    announcements: annRes.data,
                    mySuggestions: sugRes.data,
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

    const totalTime = stats?.subjects.reduce((a, s) => a + s.time_invested_minutes, 0) || 0;
    const overallAcc = stats?.subjects.length
        ? Math.round(stats.subjects.reduce((a, s) => a + s.accuracy, 0) / stats.subjects.length)
        : 0;

    if (loading) return (
        <div className="flex h-screen bg-[#0D0D0D] items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">

                {/* ANUNCIOS GLOBALES */}
                {announcements.length > 0 && (
                    <div className="mb-8 space-y-3">
                        {announcements.map(ann => (
                            <div key={ann.id} className="flex items-center gap-4 p-4 bg-[#39FF14]/5 border border-[#39FF14]/30 rounded-2xl animate-pulse">
                                <Megaphone className="w-5 h-5 text-[#39FF14]" />
                                <p className="text-sm font-mono text-[#39FF14] font-bold uppercase tracking-tighter">[SISTEMA]: {ann.content}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-1 uppercase italic">
                        Bienvenido, <span className="text-[#39FF14] shadow-[#39FF14]/20 drop-shadow-lg">{user?.nombre}</span> 👋
                    </h1>
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em]">Protocolo de aprendizaje activo</p>
                </div>

                {/* KPIs SUPERIORES */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
                    <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <p className="text-[10px] font-mono text-slate-500 uppercase mb-3 tracking-widest">Racha</p>
                        <StreakCounter streak={user?.streak_count || 0} size="lg" />
                    </div>

                    <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <p className="text-[10px] font-mono text-slate-500 uppercase mb-3 tracking-widest">Precisión</p>
                        <span className="text-3xl font-black font-mono text-[#39FF14]">{overallAcc}%</span>
                        <div className="mt-4"><ProgressBar percent={overallAcc} /></div>
                    </div>

                    {/* TARJETA DE RANGO PROFESIONAL (GAMIFICADA) */}
                    <div className="glass p-5 rounded-2xl border border-[#39FF14]/30 bg-gradient-to-br from-[#39FF14]/10 to-transparent flex flex-col justify-between group transition-all duration-500 hover:scale-[1.02]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-mono text-[#39FF14] uppercase tracking-widest mb-1">Estatus</p>
                                <h3 className="text-lg font-black italic text-white uppercase tracking-tighter group-hover:text-[#39FF14] transition-colors">
                                    {userRank}
                                </h3>
                            </div>
                            <Shield className="w-5 h-5 text-[#39FF14] animate-pulse" />
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[9px] font-mono text-slate-400 uppercase">Experiencia</span>
                                <span className="text-[10px] font-mono text-[#39FF14] font-bold">
                                    {currentXP} / {nextLevelXP} XP
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#39FF14] to-cyan-400 shadow-[0_0_10px_#39FF14] transition-all duration-1000"
                                    style={{ width: `${xpPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <p className="text-[10px] font-mono text-slate-500 uppercase mb-3 tracking-widest">Preguntas</p>
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-[#39FF14]" />
                            <span className="text-3xl font-black font-mono text-white">{stats?.total_questions_answered || 0}</span>
                        </div>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <p className="text-[10px] font-mono text-slate-500 uppercase mb-3 tracking-widest">Tiempo</p>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#39FF14]" />
                            <span className="text-3xl font-black font-mono text-white">{Math.round(totalTime)} min</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Columna Izquierda: Rendimiento + Historial */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass rounded-3xl p-6 border border-slate-800">
                            <h2 className="text-xs font-black font-mono text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[#39FF14]" /> Rendimiento por sector
                            </h2>
                            <div className="flex flex-col gap-5">
                                {stats?.subjects.map(s => (
                                    <ProgressBar key={s.subject} subject={s.subject} percent={Math.round(s.accuracy)} />
                                ))}
                            </div>
                        </div>

                        <div className="glass rounded-3xl p-6 border border-slate-800">
                            <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2 text-blue-400 tracking-widest">
                                <MessageSquare className="w-4 h-4" /> Mis Propuestas
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {mySuggestions.length > 0 ? mySuggestions.map(sug => (
                                    <div key={sug.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <p className="text-[11px] text-slate-300 font-mono truncate max-w-[70%]">"{sug.text}"</p>
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border flex items-center gap-1 ${
                                            sug.status === 'aprobada' ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30 animate-pulse' :
                                            sug.status === 'descartada' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                                        }`}>
                                            {sug.status === 'aprobada' && <CheckCircle className="w-2 h-2" />}
                                            {sug.status === 'aprobada' ? '¡Añadida!' : sug.status}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-[10px] font-mono text-slate-600 italic">No hay propuestas enviadas aún.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Sugerir + Acceso Rápido */}
                    <div className="flex flex-col gap-6">
                        {/* ACCESO RÁPIDO AL TEST CENTER */}
                        <button 
                            onClick={() => navigate('/test-center')}
                            className="glass rounded-3xl p-6 border border-[#39FF14]/40 bg-[#39FF14]/5 group hover:bg-[#39FF14] transition-all duration-300 text-left"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-mono text-[#39FF14] group-hover:text-black uppercase mb-1 font-bold">Siguiente Misión</p>
                                    <h4 className="text-white group-hover:text-black font-black uppercase italic text-sm">Entrenar Sectores 🚀</h4>
                                </div>
                                <ChevronRight className="w-6 h-6 text-[#39FF14] group-hover:text-black group-hover:translate-x-1 transition-all" />
                            </div>
                        </button>

                        <div className="glass rounded-3xl p-6 border border-slate-800">
                            <h2 className="text-xs font-black font-mono uppercase tracking-widest mb-4 text-[#39FF14] flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" /> Sugerir Pregunta
                            </h2>
                            <form onSubmit={handleSuggest} className="space-y-3">
                                <select required className="w-full bg-black border border-slate-800 rounded-xl p-2 text-[11px] font-mono text-white outline-none focus:border-[#39FF14]"
                                    value={suggestion.subject} onChange={(e) => setSuggestion(prev => ({ ...prev, subject: e.target.value }))}>
                                    <option value="">Módulo</option>
                                    <option value="Redes">Redes</option>
                                    <option value="Sistemas Operativos">Sistemas Operativos</option>
                                    <option value="Bases de Datos">Bases de Datos</option>
                                    <option value="Ciberseguridad">Ciberseguridad</option>
                                    <option value="Programación">Programación</option>
                                </select>
                                <textarea required className="w-full bg-black border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-white outline-none h-24 focus:border-[#39FF14] resize-none"
                                    placeholder="Enunciado de la pregunta..." value={suggestion.text} onChange={(e) => setSuggestion(prev => ({ ...prev, text: e.target.value }))} />
                                <button className="w-full py-2 bg-[#39FF14] text-black text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all">
                                    <Send className="w-3 h-3" /> Enviar Propuesta
                                </button>
                            </form>
                        </div>

                        <div className="glass rounded-3xl p-6 border border-orange-500/20 bg-orange-500/5">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-4 h-4 text-orange-400" />
                                <h2 className="text-xs font-black font-mono uppercase tracking-widest text-orange-400">Anomalías</h2>
                            </div>
                            <div className="flex items-end gap-3">
                                <span className="text-5xl font-black font-mono text-orange-400">{stats?.total_errors || 0}</span>
                                <p className="text-[10px] text-slate-500 font-mono mb-1 leading-tight uppercase tracking-tighter font-bold">Fallos por<br />corregir</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}