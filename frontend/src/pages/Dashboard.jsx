import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    TrendingUp, Target, Clock, AlertTriangle, 
    Megaphone, Lightbulb, Send, MessageSquare, 
    Shield, CheckCircle 
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StreakCounter from '../components/StreakCounter'
import ProgressBar from '../components/ProgressBar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [announcements, setAnnouncements] = useState([])
    const [mySuggestions, setMySuggestions] = useState([])
    const [suggestion, setSuggestion] = useState({ subject: '', text: '' })

    // Lógica de Suscripción: Cálculo de días restantes
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
                setStats(statsRes.data);
                setAnnouncements(annRes.data);
                setMySuggestions(sugRes.data);
            } catch (err) {
                console.error("Error cargando Dashboard:", err);
            } finally {
                setLoading(false);
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
            setMySuggestions(res.data);
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
                                <p className="text-sm font-mono text-[#39FF14] font-bold">[SISTEMA]: {ann.content}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-1">
                        Bienvenido, <span className="text-[#39FF14] glow-text">{user?.nombre}</span> 👋
                    </h1>
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Protocolo de aprendizaje activo</p>
                </div>

                {/* KPIs SUPERIORES */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
                    <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <p className="text-[10px] font-mono text-slate-500 uppercase mb-3 tracking-widest">Racha</p>
                        <StreakCounter streak={user?.streak_count || 0} size="lg" />
                    </div>

                    <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <p className="text-[10px] font-mono text-slate-500 uppercase mb-3 tracking-widest">Precisión</p>
                        <span className="text-3xl font-black font-mono text-[#39FF14] glow-text">{overallAcc}%</span>
                        <div className="mt-4"><ProgressBar percent={overallAcc} /></div>
                    </div>

                    {/* TARJETA DE SUSCRIPCIÓN PREMIUM */}
                    <div className="glass-premium p-5 rounded-2xl flex flex-col justify-between group transition-all duration-500 hover:scale-[1.02]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <h3 className="text-xl font-black italic text-white uppercase tracking-tighter group-hover:text-[#39FF14] transition-colors">
                                    {user?.subscription_type === 'free' ? 'Core' : user?.subscription_type}
                                </h3>
                            </div>
                            <Shield className={`w-5 h-5 ${user?.subscription_type === 'free' ? 'text-slate-500' : 'text-[#39FF14]'}`} />
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[9px] font-mono text-slate-400 uppercase">Validez</span>
                                <span className="text-[10px] font-mono text-[#39FF14] font-bold">
                                    {user?.subscription_type === 'free' ? '∞' : `${daysLeft}D`}
                                </span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-[#39FF14] to-cyan-400 shadow-[0_0_10px_#39FF14]" 
                                    style={{ width: user?.subscription_type === 'free' ? '100%' : `${(daysLeft / 30) * 100}%` }}
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
                                {mySuggestions.map(sug => (
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
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Sugerir + Anomalías */}
                    <div className="flex flex-col gap-6">
                        <div className="glass rounded-3xl p-6 border border-[#39FF14]/20 bg-[#39FF14]/5">
                            <h2 className="text-xs font-black font-mono uppercase tracking-widest mb-4 text-[#39FF14] flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" /> Sugerir Pregunta
                            </h2>
                            <form onSubmit={handleSuggest} className="space-y-3">
                                <select required className="w-full bg-black border border-slate-800 rounded-xl p-2 text-[11px] font-mono text-white outline-none focus:border-[#39FF14]"
                                    value={suggestion.subject} onChange={(e) => setSuggestion({...suggestion, subject: e.target.value})}>
                                    <option value="">Módulo</option>
                                    <option value="Redes">Redes</option>
                                    <option value="Sistemas Operativos">Sistemas Operativos</option>
                                    <option value="Bases de Datos">Bases de Datos</option>
                                </select>
                                <textarea required className="w-full bg-black border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-white outline-none h-24 focus:border-[#39FF14] resize-none"
                                    placeholder="Enunciado de la pregunta..." value={suggestion.text} onChange={(e) => setSuggestion({...suggestion, text: e.target.value})} />
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
                                <p className="text-[10px] text-slate-500 font-mono mb-1 leading-tight">Fallos que<br />debes corregir</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}