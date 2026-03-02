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
    MessageSquare
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

export default function AdminDashboard() {
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
            console.error("Error recuperando datos de administración", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex h-screen bg-[#0D0D0D] items-center justify-center">
            <Activity className="w-10 h-10 text-[#39FF14] animate-spin" />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />
            
            <main className="flex-1 ml-64 p-8">
                {/* Header Estratégico */}
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-8 h-8 text-[#39FF14]" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter">
                            Panel de <span className="text-[#39FF14]">Control Maestro</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                        Estado del sistema: <span className="text-[#39FF14]">Operativo</span> • {new Date().toLocaleDateString()}
                    </p>
                </header>

                {/* KPIs & Meta Circular */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard 
                        title="Usuarios Totales" 
                        value={stats.total_users} 
                        icon={<Users className="text-blue-400" />} 
                        trend="+12% este mes"
                    />
                    <div className="glass p-6 rounded-3xl border border-slate-800 flex items-center justify-center">
                        <CircularProgress 
                            value={stats.revenue_this_month} 
                            target={5000} 
                            label="Meta Ingresos" 
                        />
                    </div>
                    <StatCard 
                        title="Incidencias" 
                        value={stats.pending_tickets} 
                        icon={<AlertCircle className="text-red-500" />} 
                        trend="Requieren atención"
                        alert={stats.pending_tickets > 0}
                    />
                    <StatCard 
                        title="Banco de Preguntas" 
                        value={stats.total_questions} 
                        icon={<BarChart3 className="text-purple-400" />} 
                        trend="Activos en DB"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Consola de Broadcast */}
                    <div className="lg:col-span-1">
                        <AnnouncementConsole />
                    </div>
                    
                    {/* Monitor de Actividad */}
                    <div className="lg:col-span-2 glass p-6 rounded-3xl border border-slate-800">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Activity className="w-4 h-4 text-[#39FF14]" /> Picos de Actividad
                        </h3>
                        <div className="flex items-end justify-between h-48 gap-2 px-2">
                            {stats.login_peaks.map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div 
                                        className="w-full bg-gradient-to-t from-[#39FF14]/5 to-[#39FF14]/40 border-t-2 border-[#39FF14] rounded-t-lg transition-all duration-500 hover:to-[#39FF14]/60"
                                        style={{ height: `${(val / Math.max(...stats.login_peaks)) * 100}%` }}
                                    ></div>
                                    <span className="text-[10px] font-mono text-slate-500">D{i+1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nueva Sección: Sugerencias de Alumnos */}
                    <div className="lg:col-span-3 glass p-6 rounded-3xl border border-slate-800 mt-2">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                            <MessageSquare className="w-4 h-4 text-[#39FF14]" /> Sugerencias de Alumnos
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {suggestions.length > 0 ? (
                                suggestions.map((sug) => (
                                    <div key={sug.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center group hover:border-[#39FF14]/30 transition-all">
                                        <div className="max-w-[75%]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#39FF14]/10 text-[#39FF14] uppercase border border-[#39FF14]/20">
                                                    {sug.subject}
                                                </span>
                                                <span className="text-[9px] text-slate-600 font-mono">ID: #{sug.id}</span>
                                            </div>
                                            <p className="text-xs text-slate-300 italic">"{sug.text}"</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                className="p-2 rounded-lg bg-[#39FF14]/10 text-[#39FF14] hover:bg-[#39FF14] hover:text-black transition-all"
                                                title="Desarrollar pregunta"
                                                onClick={() => alert('Abriendo editor para: ' + sug.text)}
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button 
                                                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                title="Descartar"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 py-10 text-center">
                                    <p className="text-slate-600 font-mono text-xs tracking-widest uppercase">No hay sugerencias entrantes</p>
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
            console.error(err);
            alert("❌ Error al enviar el anuncio");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="glass p-6 rounded-3xl border border-[#39FF14]/20 bg-[#39FF14]/5 h-full">
            <h3 className="text-xs font-black uppercase mb-4 text-[#39FF14] flex items-center gap-2">
                <Megaphone className="w-4 h-4" /> Broadcast Global
            </h3>
            <textarea 
                className="w-full bg-black/40 border border-slate-800 rounded-xl p-3 text-xs font-mono text-[#39FF14] focus:border-[#39FF14] outline-none h-32 resize-none"
                placeholder="Escribe el mensaje neón para todos los alumnos..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={sending}
            />
            <button 
                onClick={handleSend} 
                disabled={sending}
                className="mt-4 w-full py-3 bg-[#39FF14] text-black text-xs font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-[#32e612] transition-colors disabled:opacity-50"
            >
                <Send className="w-3 h-3" /> {sending ? 'Enviando...' : 'Lanzar Notificación'}
            </button>
        </div>
    );
}

function StatCard({ title, value, icon, trend, alert = false }) {
    return (
        <div className={`glass p-6 rounded-3xl border ${alert ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-slate-800'} transition-all hover:border-[#39FF14]/30 group`}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-black/40 rounded-2xl border border-slate-800 group-hover:border-[#39FF14]/20 transition-colors">
                    {icon}
                </div>
                <TrendingUp className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{title}</p>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-1">{value}</h2>
            <p className="text-[10px] font-mono text-[#39FF14]/60">{trend}</p>
        </div>
    );
}

function CircularProgress({ value, target, label }) {
    const percentage = Math.min(Math.round((value / target) * 100), 100);
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                    <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" 
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="text-[#39FF14] transition-all duration-1000 shadow-[0_0_10px_rgba(57,255,20,0.5)]" 
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black font-mono text-white">{percentage}%</span>
                </div>
            </div>
            <p className="text-[9px] font-mono uppercase mt-2 text-slate-500 tracking-tighter">{label}</p>
            <p className="text-[10px] font-bold text-[#39FF14]">{value}€</p>
        </div>
    );
}