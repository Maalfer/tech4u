import React, { useState, useEffect } from 'react';
import {
    Users,
    DollarSign,
    AlertCircle,
    BarChart3,
    TrendingUp,
    Activity,
    ShieldCheck,
    Megaphone,
    Send,
    CheckCircle,
    XCircle,
    MessageSquare,
    BookOpen
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Ejecutamos ambas peticiones en paralelo para mayor velocidad
            const [statsRes, sugRes] = await Promise.all([
                api.get('/admin/users/dashboard-stats'),
                api.get('/announcements/admin/suggestions')
            ]);
            setStats(statsRes.data);
            setSuggestions(sugRes.data);
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error recuperando datos de administración", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async () => {
        try {
            const res = await api.get('/admin/users/suggestions');
            setSuggestions(res.data);
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error fetching suggestions", err);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.patch(`/admin/users/suggestions/${id}/approve`);
            fetchSuggestions();
            alert("🚀 Pregunta aprobada y movida al banco para desarrollo.");
        } catch (err) {
            alert("❌ Error al aprobar sugerencia");
        }
    };

    const handleDeleteSuggestion = async (id) => {
        if (!confirm("¿Seguro que quieres descartar esta sugerencia?")) return;
        try {
            await api.delete(`/admin/users/suggestions/${id}`);
            fetchSuggestions();
        } catch (err) {
            alert("❌ Error al eliminar sugerencia");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex h-screen bg-[#050505] items-center justify-center">
            <div className="w-10 h-10 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!stats) return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 flex items-center justify-center flex-col gap-4 text-red-500 font-mono">
                <AlertCircle className="w-12 h-12 animate-pulse" />
                <h1 className="text-2xl font-black uppercase tracking-tighter italic">Fallo de Mainframe</h1>
                <p className="text-sm opacity-80 text-center max-w-md">No se han podido cargar las estadísticas del panel de control maestro. Verifica el estado del núcleo de servidor.</p>
            </main>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#050505] text-slate-200 selection:bg-neon selection:text-black">
            <Sidebar />

            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon/5 blur-[120px] rounded-full -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/5 blur-[100px] rounded-full -z-10" />

                <PageHeader
                    title={<>Terminal <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon via-green-400 to-neon animate-text-shimmer bg-[length:200%_auto]">Alpha</span></>}
                    subtitle="Protocolo de administración activo // Módulo Central"
                    Icon={Activity}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="Usuarios Adscritos"
                        value={stats.total_users}
                        icon={<Users className="w-4 h-4 text-violet-400" />}
                        colorClass="violet"
                        trend="+12% este mes"
                    />
                    {user.role === 'admin' && (
                        <div className="group relative bg-gradient-to-br from-[#0A1A0F] to-black p-6 rounded-[2rem] border border-neon/20 hover:border-neon transition-all duration-500 shadow-[0_0_20px_rgba(0,255,65,0.05)] hover:shadow-[0_0_30px_rgba(0,255,65,0.15)] flex flex-col items-center justify-center overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon/10 blur-[60px] rounded-full group-hover:animate-pulse" />
                            <CircularProgress
                                value={stats.revenue_this_month}
                                target={5000}
                                label="Meta Tesorería"
                            />
                        </div>
                    )}
                    <StatCard
                        title="Alertas Rojas"
                        value={stats.pending_tickets}
                        icon={<AlertCircle className="w-4 h-4 text-orange-400" />}
                        colorClass="orange"
                        trend="Requieren intervención"
                        alert={stats.pending_tickets > 0}
                    />
                    <StatCard
                        title="Banco Base"
                        value={stats.total_questions}
                        icon={<BarChart3 className="w-4 h-4 text-sky-400" />}
                        colorClass="sky"
                        trend="Nodos activos"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <AnnouncementConsole />
                    </div>

                    <div className="lg:col-span-2 bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded bg-neon/10 border border-neon/20 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-neon" />
                            </span>
                            Monitor de Accesos
                        </h3>
                        <div className="flex items-end justify-between h-48 gap-3 px-2">
                            {stats.login_peaks.map((val, i) => (
                                <div key={`peak-${i}`} className="flex-1 flex flex-col items-center gap-3 group/bar">
                                    <div
                                        className="w-full bg-gradient-to-t from-neon/10 via-neon/30 to-neon border-t-2 border-neon rounded-t-xl transition-all duration-500 group-hover/bar:shadow-[0_0_20px_var(--color-neon)] group-hover/bar:from-neon/20 group-hover/bar:to-neon"
                                        style={{ height: `${Math.max((val / Math.max(...stats.login_peaks)) * 100, 5)}%` }}
                                    ></div>
                                    <span className="text-[9px] font-mono text-slate-500 font-bold">D{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-3 bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-8 border border-white/5 mt-2">
                        <h3 className="text-sm font-black uppercase text-white tracking-[0.3em] flex items-center gap-3 mb-8">
                            <span className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-blue-400" />
                            </span>
                            Propuestas I+D Recibidas
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                            {suggestions.length > 0 ? (
                                suggestions.map((sug) => (
                                    <div key={`suggestion-${sug.id}`} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:bg-white/[0.04] hover:border-blue-500/30 transition-all gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase border border-blue-500/20">
                                                    {sug.subject}
                                                </span>
                                                <span className="text-[8px] text-slate-600 font-mono font-bold uppercase tracking-widest">ID: #{sug.id.toString().padStart(4, '0')}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 italic">"{sug.text}"</p>
                                        </div>
                                        <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-white/5">
                                            <button
                                                className="p-2.5 rounded-xl bg-neon/10 border border-neon/20 text-neon hover:bg-neon hover:text-black transition-all group/btn"
                                                title="Aprobar y desarrollar"
                                                onClick={() => handleApprove(sug.id)}
                                            >
                                                <CheckCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                            <button
                                                className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group/btn"
                                                title="Descartar"
                                                onClick={() => handleDeleteSuggestion(sug.id)}
                                            >
                                                <XCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 italic">
                                    <MessageSquare className="w-8 h-8 text-slate-500 mb-4" />
                                    <p className="text-xs font-mono text-slate-600 uppercase tracking-widest">Canal de transmisión vacío.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

/* --- COMPONENTES AUXILIARES --- */

function AnnouncementConsole() {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!text) return;
        setSending(true);
        try {
            await api.post('/announcements/', { content: text });
            alert("🚀 Broadcast emitido con éxito");
            setText("");
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
            alert("❌ Error al enviar el anuncio");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-8 border border-white/5 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon/5 blur-3xl rounded-full" />
            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded bg-neon/10 border border-neon/20 flex items-center justify-center">
                    <Megaphone className="w-4 h-4 text-neon" />
                </span>
                Net.Broadcast
            </h3>
            <textarea
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-white focus:border-neon/50 outline-none h-32 resize-none placeholder:text-slate-700 transition-colors"
                placeholder="Escribe el mensaje global para la red de estudiantes..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={sending}
            />
            <button
                onClick={handleSend}
                disabled={sending || !text.trim()}
                className="mt-6 w-full py-4 bg-neon/80 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-neon hover:shadow-[0_0_20px_var(--color-neon)] transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send className="w-4 h-4" /> {sending ? 'Procesando...' : 'Lanzar Notificación'}
            </button>
        </div>
    );
}

function StatCard({ title, value, icon, colorClass, trend, alert = false }) {
    const borders = {
        violet: 'border-violet-500/20 hover:border-violet-500/50',
        orange: 'border-orange-500/20 hover:border-orange-500/50',
        sky: 'border-sky-500/20 hover:border-sky-500/50',
        neon: 'border-neon/20 hover:border-neon/50',
    };

    const bgs = {
        violet: 'bg-violet-500/10 border-violet-500/20',
        orange: 'bg-orange-500/10 border-orange-500/20',
        sky: 'bg-sky-500/10 border-sky-500/20',
        neon: 'bg-neon/10 border-neon/20',
    };

    const textColors = {
        violet: 'text-violet-400',
        orange: 'text-orange-400',
        sky: 'text-sky-400',
        neon: 'text-neon',
    };

    return (
        <div className={`group relative bg-gradient-to-br from-stone-900 to-black p-6 rounded-[2rem] border ${alert ? 'border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'border-white/5'} transition-all duration-500 shadow-xl overflow-hidden hover:${borders[colorClass]?.split(' ')[1]}`}>
            <div className={`absolute -right-10 -top-10 w-32 h-32 opacity-20 blur-2xl rounded-full ${colorClass === 'violet' ? 'bg-violet-500' : colorClass === 'orange' ? 'bg-orange-500' : 'bg-sky-500'}`} />

            <div className="flex justify-between items-start mb-6">
                <div className={`p-2 rounded-xl border ${bgs[colorClass]} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>

            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-1">{title}</p>
            <h2 className="text-4xl font-black font-mono text-white tracking-tighter mb-2">{value}</h2>
            <p className={`text-[9px] font-mono font-bold uppercase tracking-tighter ${alert && value > 0 ? 'text-orange-500 animate-pulse' : textColors[colorClass]}`}>{trend}</p>
        </div>
    );
}

function CircularProgress({ value, target, label }) {
    const percentage = Math.min(Math.round((value / target) * 100), 100);
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center relative z-10 w-full">
            <div className="flex justify-between w-full px-2 mb-2 items-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">{label}</span>
                <span className="text-[10px] bg-neon/10 text-neon px-2 py-0.5 rounded border border-neon/20 font-black">{value}€</span>
            </div>
            <div className="relative w-28 h-28 my-2">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                    <circle cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="text-neon transition-all duration-1000 shadow-[0_0_15px_var(--neon-alpha-50)]"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black font-mono text-white">{percentage}%</span>
                </div>
            </div>
            <p className="text-[9px] font-mono font-bold text-neon uppercase tracking-widest flex items-center gap-1.5 mt-1">
                <TrendingUp className="w-3 h-3" /> Target: {target}€
            </p>
        </div>
    );
}