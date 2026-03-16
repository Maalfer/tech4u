import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

export default function AdminAnalytics() {
    const { user } = useAuth();
    const [period, setPeriod] = useState(30);
    const [overview, setOverview] = useState(null);
    const [abandonedLabs, setAbandonedLabs] = useState([]);
    const [failedQuestions, setFailedQuestions] = useState([]);
    const [eventBreakdown, setEventBreakdown] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async (days) => {
        setLoading(true);
        setError(null);
        try {
            const [overviewRes, labsRes, questionsRes, eventsRes] = await Promise.all([
                api.get('/analytics/admin/overview', { params: { days } }),
                api.get('/analytics/admin/labs/abandoned', { params: { limit: 10 } }),
                api.get('/analytics/admin/tests/failed-questions', { params: { limit: 10 } }),
                api.get('/analytics/admin/events/breakdown', { params: { days } })
            ]);

            setOverview(overviewRes.data);
            setAbandonedLabs(labsRes.data);
            setFailedQuestions(questionsRes.data);
            setEventBreakdown(eventsRes.data);
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error fetching analytics", err);
            setError("No se pudieron cargar los datos de análisis");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(period);
    }, [period]);

    if (loading) return (
        <div className="flex h-screen bg-[#050505] items-center justify-center">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 flex items-center justify-center flex-col gap-4 text-red-500 font-mono">
                <AlertCircle className="w-12 h-12 animate-pulse" />
                <h1 className="text-2xl font-black uppercase tracking-tighter italic">Error de Carga</h1>
                <p className="text-sm opacity-80 text-center max-w-md">{error}</p>
            </main>
        </div>
    );

    if (!overview) return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 flex items-center justify-center flex-col gap-4 text-red-500 font-mono">
                <AlertCircle className="w-12 h-12 animate-pulse" />
                <h1 className="text-2xl font-black uppercase tracking-tighter italic">Sin Datos</h1>
                <p className="text-sm opacity-80 text-center max-w-md">No hay datos de análisis disponibles para el período seleccionado.</p>
            </main>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#050505] text-slate-200 selection:bg-violet-500 selection:text-white">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full -z-10" />

                {/* Header with Period Selector */}
                <div className="mb-10 flex items-center justify-between">
                    <PageHeader
                        title={<>Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-violet-500 animate-text-shimmer bg-[length:200%_auto]">Dashboard</span></>}
                        subtitle="Análisis de eventos y comportamiento de usuarios // Período seleccionado"
                        Icon={BarChart2}
                    />

                    <div className="flex gap-2">
                        {[7, 30, 90].map((days) => (
                            <button
                                key={days}
                                onClick={() => setPeriod(days)}
                                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                                    period === days
                                        ? 'bg-violet-500/80 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                                }`}
                            >
                                {days}d
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="Eventos Totales"
                        value={overview.total_events || 0}
                        icon={<TrendingUp className="w-4 h-4 text-violet-400" />}
                        colorClass="violet"
                        trend={`+${overview.daily_avg || 0} por día`}
                    />
                    <StatCard
                        title="Usuarios Únicos"
                        value={overview.unique_users || 0}
                        icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
                        colorClass="emerald"
                        trend="Activos en el período"
                    />
                    <StatCard
                        title="Día Más Activo"
                        value={overview.peak_day_events || 0}
                        icon={<TrendingUp className="w-4 h-4 text-sky-400" />}
                        colorClass="sky"
                        trend={`${overview.peak_day_name || 'N/A'}`}
                    />
                    <StatCard
                        title="Evento Principal"
                        value={overview.top_event_type || 'N/A'}
                        icon={<TrendingUp className="w-4 h-4 text-amber-400" />}
                        colorClass="amber"
                        trend={`${overview.top_event_count || 0} ocurrencias`}
                    />
                </div>

                {/* Line Chart - Daily Events */}
                {overview.daily_events && overview.daily_events.length > 0 && (
                    <div className="mb-10 bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-violet-400" />
                            </span>
                            Eventos por Día
                        </h3>

                        <div className="flex items-end justify-between h-56 gap-1 px-2">
                            {overview.daily_events.map((val, i) => {
                                const maxVal = Math.max(...overview.daily_events);
                                const height = Math.max((val / maxVal) * 100, 3);
                                return (
                                    <div key={`day-${i}`} className="flex-1 flex flex-col items-center gap-2 group/bar">
                                        <div
                                            className="w-full bg-gradient-to-t from-violet-500/20 via-violet-500/40 to-violet-400 border-t border-violet-400 rounded-t-lg transition-all duration-300 group-hover/bar:shadow-[0_0_20px_rgba(168,85,247,0.6)] group-hover/bar:from-violet-500/30 group-hover/bar:to-violet-300 cursor-pointer"
                                            style={{ height: `${height}%` }}
                                            title={`${val} eventos`}
                                        ></div>
                                        <span className="text-[9px] font-mono text-slate-500 font-bold">D{i + 1}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Two Column Grid: Abandoned Labs + Failed Questions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Abandoned Labs */}
                    <div className="bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-8 border border-white/5">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-emerald-400" />
                            </span>
                            Labs con Más Abandonos
                        </h3>

                        {abandonedLabs.length > 0 ? (
                            <div className="space-y-3">
                                {abandonedLabs.map((item, i) => {
                                    const maxVal = Math.max(...abandonedLabs.map(x => x.abandons || 0));
                                    const width = (item.abandons / maxVal) * 100;
                                    return (
                                        <div key={`lab-${i}`} className="group/item">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-xs font-mono text-slate-400 font-bold truncate">Lab #{item.lab_id || i + 1}</span>
                                                <span className="text-xs font-mono text-emerald-400 font-bold">{item.abandons || 0}</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-400 rounded-full transition-all duration-300 group-hover/item:shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                    style={{ width: `${width}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 italic text-center py-8">Sin datos disponibles</p>
                        )}
                    </div>

                    {/* Failed Questions */}
                    <div className="bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-8 border border-white/5">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-sky-400" />
                            </span>
                            Preguntas Más Falladas
                        </h3>

                        {failedQuestions.length > 0 ? (
                            <div className="space-y-3">
                                {failedQuestions.map((item, i) => {
                                    const maxVal = Math.max(...failedQuestions.map(x => x.fail_count || 0));
                                    const width = (item.fail_count / maxVal) * 100;
                                    return (
                                        <div key={`question-${i}`} className="group/item">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-xs font-mono text-slate-400 font-bold truncate">Q#{item.question_id || i + 1}</span>
                                                <span className="text-xs font-mono text-sky-400 font-bold">{item.fail_count || 0} fallos</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                                                <div
                                                    className="h-full bg-gradient-to-r from-sky-500/60 to-sky-400 rounded-full transition-all duration-300 group-hover/item:shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                                                    style={{ width: `${width}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 italic text-center py-8">Sin datos disponibles</p>
                        )}
                    </div>
                </div>

                {/* Event Type Breakdown */}
                {eventBreakdown.length > 0 && (
                    <div className="bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2.5rem] p-8 border border-white/5">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <BarChart2 className="w-4 h-4 text-amber-400" />
                            </span>
                            Tipos de Eventos
                        </h3>

                        <div className="flex items-end justify-between h-48 gap-4 px-2">
                            {eventBreakdown.map((item, i) => {
                                const maxVal = Math.max(...eventBreakdown.map(x => x.count || 0));
                                const height = (item.count / maxVal) * 100;
                                const colors = ['violet', 'emerald', 'sky', 'amber', 'rose', 'indigo', 'cyan', 'orange'];
                                const colorClass = colors[i % colors.length];

                                const colorMap = {
                                    violet: 'from-violet-500/20 to-violet-400 border-violet-400',
                                    emerald: 'from-emerald-500/20 to-emerald-400 border-emerald-400',
                                    sky: 'from-sky-500/20 to-sky-400 border-sky-400',
                                    amber: 'from-amber-500/20 to-amber-400 border-amber-400',
                                    rose: 'from-rose-500/20 to-rose-400 border-rose-400',
                                    indigo: 'from-indigo-500/20 to-indigo-400 border-indigo-400',
                                    cyan: 'from-cyan-500/20 to-cyan-400 border-cyan-400',
                                    orange: 'from-orange-500/20 to-orange-400 border-orange-400',
                                };

                                return (
                                    <div key={`event-${i}`} className="flex-1 flex flex-col items-center gap-3 group/bar">
                                        <div
                                            className={`w-full bg-gradient-to-t ${colorMap[colorClass]} border-t rounded-t-lg transition-all duration-300 group-hover/bar:shadow-[0_0_15px_rgba(168,85,247,0.4)]`}
                                            style={{ height: `${height}%` }}
                                            title={`${item.event_type}: ${item.count}`}
                                        ></div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[9px] font-mono text-slate-400 font-bold text-center max-w-[60px] truncate">{item.event_type}</span>
                                            <span className="text-[8px] text-slate-500 font-bold">{item.count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

/* --- STAT CARD COMPONENT --- */
function StatCard({ title, value, icon, colorClass, trend }) {
    const borders = {
        violet: 'border-violet-500/20 hover:border-violet-500/50',
        emerald: 'border-emerald-500/20 hover:border-emerald-500/50',
        sky: 'border-sky-500/20 hover:border-sky-500/50',
        amber: 'border-amber-500/20 hover:border-amber-500/50',
    };

    const bgs = {
        violet: 'bg-violet-500/10 border-violet-500/20',
        emerald: 'bg-emerald-500/10 border-emerald-500/20',
        sky: 'bg-sky-500/10 border-sky-500/20',
        amber: 'bg-amber-500/10 border-amber-500/20',
    };

    const textColors = {
        violet: 'text-violet-400',
        emerald: 'text-emerald-400',
        sky: 'text-sky-400',
        amber: 'text-amber-400',
    };

    return (
        <div className={`group relative bg-gradient-to-br from-stone-900 to-black p-6 rounded-[2rem] border border-white/5 transition-all duration-500 shadow-xl overflow-hidden hover:${borders[colorClass]?.split(' ')[1]}`}>
            <div className={`absolute -right-10 -top-10 w-32 h-32 opacity-20 blur-2xl rounded-full ${colorClass === 'violet' ? 'bg-violet-500' : colorClass === 'emerald' ? 'bg-emerald-500' : colorClass === 'sky' ? 'bg-sky-500' : 'bg-amber-500'}`} />

            <div className="flex justify-between items-start mb-6">
                <div className={`p-2 rounded-xl border ${bgs[colorClass]} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>

            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-1">{title}</p>
            <h2 className="text-4xl font-black font-mono text-white tracking-tighter mb-2">{value}</h2>
            <p className={`text-[9px] font-mono font-bold uppercase tracking-tighter ${textColors[colorClass]}`}>{trend}</p>
        </div>
    );
}

/* --- TRACK EVENT UTILITY --- */
export function trackEvent(eventType, resourceId = null, resourceType = null, extra = null) {
    api.post('/analytics/track', {
        event_type: eventType,
        resource_id: resourceId,
        resource_type: resourceType,
        extra,
    }).catch(() => {}); // fire and forget
}
