import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, AlertCircle, Users, Activity, BookOpen, Eye, Award } from 'lucide-react';
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
    const [userGrowth, setUserGrowth] = useState(null);
    const [topUsers, setTopUsers] = useState([]);
    const [testCompletions, setTestCompletions] = useState(null);
    const [topPages, setTopPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async (days) => {
        setLoading(true);
        setError(null);
        try {
            const [
                overviewRes,
                labsRes,
                questionsRes,
                eventsRes,
                growthRes,
                topUsersRes,
                testCompletionsRes,
                topPagesRes,
            ] = await Promise.all([
                api.get('/analytics/admin/overview', { params: { days } }),
                api.get('/analytics/admin/labs/abandoned', { params: { limit: 10 } }),
                api.get('/analytics/admin/tests/failed-questions', { params: { limit: 10 } }),
                api.get('/analytics/admin/events/breakdown', { params: { days } }),
                api.get('/analytics/admin/users/growth', { params: { days } }),
                api.get('/analytics/admin/users/top-active', { params: { days, limit: 10 } }),
                api.get('/analytics/admin/tests/completions', { params: { days } }),
                api.get('/analytics/admin/pages/top', { params: { days, limit: 10 } }),
            ]);

            setOverview(overviewRes.data);
            setAbandonedLabs(labsRes.data);
            setFailedQuestions(questionsRes.data);
            setEventBreakdown(eventsRes.data);
            setUserGrowth(growthRes.data);
            setTopUsers(topUsersRes.data);
            setTestCompletions(testCompletionsRes.data);
            setTopPages(topPagesRes.data);
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
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8">
                {/* Skeleton header */}
                <div className="mb-10 flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-white/5 rounded-xl animate-pulse" />
                        <div className="h-4 w-80 bg-white/3 rounded-lg animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                        {[1,2,3].map(i => <div key={i} className="h-9 w-14 bg-white/5 rounded-xl animate-pulse" />)}
                    </div>
                </div>
                {/* Skeleton stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="bg-stone-900/50 rounded-[2rem] p-6 border border-white/5 space-y-4 animate-pulse">
                            <div className="w-9 h-9 bg-white/5 rounded-xl" />
                            <div className="h-3 w-24 bg-white/5 rounded" />
                            <div className="h-9 w-16 bg-white/5 rounded-lg" />
                            <div className="h-2 w-28 bg-white/5 rounded" />
                        </div>
                    ))}
                </div>
                {/* Skeleton chart */}
                <div className="bg-stone-900/50 rounded-[2rem] p-7 border border-white/5 mb-8 animate-pulse">
                    <div className="h-4 w-40 bg-white/5 rounded mb-6" />
                    <div className="flex items-end gap-1 h-52">
                        {Array.from({length: 30}).map((_,i) => (
                            <div key={i} className="flex-1 bg-white/5 rounded-t-sm" style={{height: `${20 + Math.random()*70}%`}} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );

    if (error) return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 flex items-center justify-center flex-col gap-4 text-red-500 font-mono">
                <AlertCircle className="w-12 h-12 animate-pulse" />
                <h1 className="text-2xl font-black uppercase tracking-tighter italic">Error de Carga</h1>
                <p className="text-sm opacity-80 text-center max-w-md">{error}</p>
                <button
                    onClick={() => fetchData(period)}
                    className="mt-4 px-6 py-2 bg-violet-500/20 border border-violet-500/40 rounded-xl text-violet-400 font-mono text-xs font-bold uppercase tracking-wider hover:bg-violet-500/30 transition-all"
                >
                    Reintentar
                </button>
            </main>
        </div>
    );

    if (!overview) return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 flex items-center justify-center flex-col gap-4 text-slate-500 font-mono">
                <BarChart2 className="w-12 h-12 opacity-30" />
                <h1 className="text-2xl font-black uppercase tracking-tighter italic">Sin Datos</h1>
                <p className="text-sm opacity-80 text-center max-w-md">No hay datos de análisis para el período seleccionado.</p>
            </main>
        </div>
    );

    // Normalise daily_events: backend returns [{day, count}]
    const dailyCounts = (overview.daily_events || []).map(d => (typeof d === 'object' ? d.count : d));
    const dailyLabels = (overview.daily_events || []).map(d => (typeof d === 'object' ? d.day : ''));
    const maxDailyVal = dailyCounts.length > 0 ? Math.max(...dailyCounts, 1) : 1;

    // User growth daily counts
    const growthCounts = (userGrowth?.daily || []).map(d => d.count);
    const growthLabels = (userGrowth?.daily || []).map(d => d.day);
    const maxGrowthVal = growthCounts.length > 0 ? Math.max(...growthCounts, 1) : 1;

    return (
        <div className="flex min-h-screen bg-[#050505] text-slate-200 selection:bg-violet-500 selection:text-white">
            <Sidebar />

            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 relative overflow-hidden">
                {/* Background glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full -z-10" />

                {/* ── Header ── */}
                <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
                    <PageHeader
                        title={<>Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-violet-500">Dashboard</span></>}
                        subtitle={`Análisis de eventos y comportamiento de usuarios · Últimos ${period} días`}
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

                {/* ── Overview stat cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    <StatCard title="Eventos Totales" value={overview.total_events ?? 0} icon={<Activity className="w-4 h-4 text-violet-400" />} colorClass="violet" trend={`+${overview.daily_avg ?? 0} por día`} />
                    <StatCard title="Usuarios Únicos" value={overview.unique_users ?? 0} icon={<Users className="w-4 h-4 text-emerald-400" />} colorClass="emerald" trend="Activos en el período" />
                    <StatCard title="Día Más Activo" value={overview.peak_day_events ?? 0} icon={<TrendingUp className="w-4 h-4 text-sky-400" />} colorClass="sky" trend={overview.peak_day_name ?? '—'} />
                    <StatCard title="Evento Principal" value={overview.top_event_type ?? '—'} icon={<BarChart2 className="w-4 h-4 text-amber-400" />} colorClass="amber" trend={`${overview.top_event_count ?? 0} veces`} isText />
                </div>

                {/* ── Daily events bar chart ── */}
                {dailyCounts.length > 0 && (
                    <SectionCard title="Eventos por Día" icon={<TrendingUp className="w-4 h-4 text-violet-400" />} iconBg="bg-violet-500/10 border-violet-500/20" className="mb-8">
                        <BarChart
                            counts={dailyCounts}
                            labels={dailyLabels}
                            maxVal={maxDailyVal}
                            colorClass="violet"
                            formatLabel={d => {
                                if (!d) return '';
                                try { return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }); }
                                catch { return d; }
                            }}
                        />
                    </SectionCard>
                )}

                {/* ── Test completion funnel ── */}
                {testCompletions && (
                    <SectionCard title="Embudo de Tests" icon={<Award className="w-4 h-4 text-emerald-400" />} iconBg="bg-emerald-500/10 border-emerald-500/20" className="mb-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <FunnelStat label="Iniciados" value={testCompletions.started} color="text-sky-400" />
                            <FunnelStat label="Completados" value={testCompletions.completed} color="text-emerald-400" />
                            <FunnelStat label="Abandonados" value={testCompletions.abandoned} color="text-rose-400" />
                            <FunnelStat label="Tasa completado" value={`${testCompletions.completion_rate}%`} color="text-violet-400" />
                        </div>
                        {testCompletions.started > 0 && (
                            <div className="space-y-2">
                                <FunnelBar label="Iniciados" value={testCompletions.started} max={testCompletions.started} color="from-sky-500/40 to-sky-400" />
                                <FunnelBar label="Completados" value={testCompletions.completed} max={testCompletions.started} color="from-emerald-500/40 to-emerald-400" />
                                <FunnelBar label="Abandonados" value={testCompletions.abandoned} max={testCompletions.started} color="from-rose-500/40 to-rose-400" />
                            </div>
                        )}
                    </SectionCard>
                )}

                {/* ── User growth chart ── */}
                {userGrowth && growthCounts.length > 0 && (
                    <SectionCard title={`Nuevos Usuarios · ${userGrowth.total_new_users ?? 0} en total`} icon={<Users className="w-4 h-4 text-emerald-400" />} iconBg="bg-emerald-500/10 border-emerald-500/20" className="mb-8">
                        <BarChart
                            counts={growthCounts}
                            labels={growthLabels}
                            maxVal={maxGrowthVal}
                            colorClass="emerald"
                            formatLabel={d => {
                                if (!d) return '';
                                try { return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }); }
                                catch { return d; }
                            }}
                        />
                    </SectionCard>
                )}

                {/* ── Two-column: abandoned labs + failed questions ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <SectionCard title="Labs con Más Abandonos" icon={<BookOpen className="w-4 h-4 text-rose-400" />} iconBg="bg-rose-500/10 border-rose-500/20">
                        {abandonedLabs.length > 0 ? (
                            <div className="space-y-3">
                                {abandonedLabs.map((item, i) => {
                                    const maxVal = Math.max(...abandonedLabs.map(x => x.abandons || 0), 1);
                                    return (
                                        <HorizBar
                                            key={`lab-${i}`}
                                            label={`Lab #${item.lab_id ?? i + 1}`}
                                            value={item.abandons ?? 0}
                                            maxVal={maxVal}
                                            valueLabel={`${item.abandons ?? 0} abandonos`}
                                            color="from-rose-500/60 to-rose-400"
                                            textColor="text-rose-400"
                                        />
                                    );
                                })}
                            </div>
                        ) : <EmptyState />}
                    </SectionCard>

                    <SectionCard title="Preguntas Más Falladas" icon={<AlertCircle className="w-4 h-4 text-sky-400" />} iconBg="bg-sky-500/10 border-sky-500/20">
                        {failedQuestions.length > 0 ? (
                            <div className="space-y-3">
                                {failedQuestions.map((item, i) => {
                                    const maxVal = Math.max(...failedQuestions.map(x => x.fail_count || 0), 1);
                                    return (
                                        <HorizBar
                                            key={`q-${i}`}
                                            label={`Q#${item.question_id ?? i + 1}`}
                                            value={item.fail_count ?? 0}
                                            maxVal={maxVal}
                                            valueLabel={`${item.fail_count ?? 0} fallos`}
                                            color="from-sky-500/60 to-sky-400"
                                            textColor="text-sky-400"
                                        />
                                    );
                                })}
                            </div>
                        ) : <EmptyState />}
                    </SectionCard>
                </div>

                {/* ── Top active users ── */}
                {topUsers.length > 0 && (
                    <SectionCard title="Usuarios Más Activos" icon={<Users className="w-4 h-4 text-violet-400" />} iconBg="bg-violet-500/10 border-violet-500/20" className="mb-8">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs font-mono">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left py-2 pr-4 text-slate-500 font-bold uppercase tracking-wider">#</th>
                                        <th className="text-left py-2 pr-4 text-slate-500 font-bold uppercase tracking-wider">Usuario</th>
                                        <th className="text-right py-2 pr-4 text-slate-500 font-bold uppercase tracking-wider">Eventos</th>
                                        <th className="text-right py-2 text-slate-500 font-bold uppercase tracking-wider">Última actividad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topUsers.map((u, i) => (
                                        <tr key={`user-${u.user_id}`} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                            <td className="py-2.5 pr-4 text-slate-600 font-bold">{i + 1}</td>
                                            <td className="py-2.5 pr-4">
                                                <span className="text-slate-300 font-bold">{u.username}</span>
                                                <span className="ml-2 text-slate-600 text-[10px]">#{u.user_id}</span>
                                            </td>
                                            <td className="py-2.5 pr-4 text-right">
                                                <span className="text-violet-400 font-bold">{u.event_count}</span>
                                            </td>
                                            <td className="py-2.5 text-right text-slate-500">{u.last_seen}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {/* ── Top pages ── */}
                {topPages.length > 0 && (
                    <SectionCard title="Páginas Más Visitadas" icon={<Eye className="w-4 h-4 text-cyan-400" />} iconBg="bg-cyan-500/10 border-cyan-500/20" className="mb-8">
                        <div className="space-y-3">
                            {topPages.map((page, i) => {
                                const maxVal = Math.max(...topPages.map(x => x.views || 0), 1);
                                return (
                                    <div key={`page-${i}`} className="group/item">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs font-mono text-slate-400 font-bold truncate max-w-[65%]">{page.page || `Página ${i + 1}`}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-mono text-slate-600">{page.unique_views} únicos</span>
                                                <span className="text-xs font-mono text-cyan-400 font-bold">{page.views} visitas</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500/60 to-cyan-400 rounded-full transition-all duration-300 group-hover/item:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                                style={{ width: `${(page.views / maxVal) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>
                )}

                {/* ── Event type breakdown ── */}
                {eventBreakdown.length > 0 && (
                    <SectionCard title="Desglose por Tipo de Evento" icon={<BarChart2 className="w-4 h-4 text-amber-400" />} iconBg="bg-amber-500/10 border-amber-500/20" className="mb-8">
                        <div className="flex items-end justify-between h-48 gap-3 px-1">
                            {eventBreakdown.map((item, i) => {
                                const maxVal = Math.max(...eventBreakdown.map(x => x.count || 0), 1);
                                const height = Math.max((item.count / maxVal) * 100, 3);
                                const colors = [
                                    'from-violet-500/20 to-violet-400 border-violet-400',
                                    'from-emerald-500/20 to-emerald-400 border-emerald-400',
                                    'from-sky-500/20 to-sky-400 border-sky-400',
                                    'from-amber-500/20 to-amber-400 border-amber-400',
                                    'from-rose-500/20 to-rose-400 border-rose-400',
                                    'from-indigo-500/20 to-indigo-400 border-indigo-400',
                                    'from-cyan-500/20 to-cyan-400 border-cyan-400',
                                    'from-orange-500/20 to-orange-400 border-orange-400',
                                ];
                                return (
                                    <div key={`evt-${i}`} className="flex-1 flex flex-col items-center gap-2 group/bar min-w-0">
                                        <div
                                            className={`w-full bg-gradient-to-t ${colors[i % colors.length]} border-t rounded-t-md transition-all duration-300`}
                                            style={{ height: `${height}%` }}
                                            title={`${item.event_type}: ${item.count}`}
                                        />
                                        <div className="flex flex-col items-center gap-0.5 w-full">
                                            <span className="text-[9px] font-mono text-slate-400 font-bold text-center w-full truncate px-0.5">{item.event_type}</span>
                                            <span className="text-[8px] text-slate-500 font-bold">{item.count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>
                )}
            </main>
        </div>
    );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function SectionCard({ title, icon, iconBg, children, className = '' }) {
    return (
        <div className={`bg-gradient-to-b from-stone-900/50 to-transparent rounded-[2rem] p-7 border border-white/5 ${className}`}>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg border flex items-center justify-center ${iconBg}`}>
                    {icon}
                </span>
                {title}
            </h3>
            {children}
        </div>
    );
}

function BarChart({ counts, labels, maxVal, colorClass, formatLabel }) {
    const colorMap = {
        violet: 'from-violet-500/20 via-violet-500/40 to-violet-400 border-violet-400',
        emerald: 'from-emerald-500/20 via-emerald-500/40 to-emerald-400 border-emerald-400',
    };
    const cls = colorMap[colorClass] || colorMap.violet;

    return (
        <div className="flex items-end justify-between h-52 gap-1 px-1">
            {counts.map((val, i) => {
                const height = Math.max((val / maxVal) * 100, 2);
                const label = formatLabel ? formatLabel(labels[i]) : labels[i] || `D${i + 1}`;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar min-w-0">
                        <div
                            className={`w-full bg-gradient-to-t ${cls} border-t rounded-t-md transition-all duration-300 group-hover/bar:brightness-125 cursor-default`}
                            style={{ height: `${height}%` }}
                            title={`${label}: ${val}`}
                        />
                        {counts.length <= 31 && (
                            <span className="text-[8px] font-mono text-slate-600 font-bold truncate w-full text-center">{label}</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function HorizBar({ label, value, maxVal, valueLabel, color, textColor }) {
    const width = maxVal > 0 ? (value / maxVal) * 100 : 0;
    return (
        <div className="group/item">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-mono text-slate-400 font-bold truncate">{label}</span>
                <span className={`text-xs font-mono font-bold ${textColor}`}>{valueLabel}</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div
                    className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}

function FunnelStat({ label, value, color }) {
    return (
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 text-center">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-black font-mono tracking-tighter ${color}`}>{value}</p>
        </div>
    );
}

function FunnelBar({ label, value, max, color }) {
    const width = max > 0 ? Math.max((value / max) * 100, 2) : 0;
    return (
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-500 w-24 text-right shrink-0">{label}</span>
            <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden border border-white/5 relative">
                <div
                    className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
                    style={{ width: `${width}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white/60">
                    {value} ({Math.round(width)}%)
                </span>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, colorClass, trend, isText = false }) {
    const bgs = {
        violet: 'bg-violet-500/10 border-violet-500/20',
        emerald: 'bg-emerald-500/10 border-emerald-500/20',
        sky: 'bg-sky-500/10 border-sky-500/20',
        amber: 'bg-amber-500/10 border-amber-500/20',
    };
    const glows = {
        violet: 'bg-violet-500',
        emerald: 'bg-emerald-500',
        sky: 'bg-sky-500',
        amber: 'bg-amber-500',
    };
    const textColors = {
        violet: 'text-violet-400',
        emerald: 'text-emerald-400',
        sky: 'text-sky-400',
        amber: 'text-amber-400',
    };

    return (
        <div className="group relative bg-gradient-to-br from-stone-900 to-black p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all duration-500 shadow-xl overflow-hidden">
            <div className={`absolute -right-10 -top-10 w-32 h-32 opacity-20 blur-2xl rounded-full ${glows[colorClass]}`} />
            <div className="flex justify-between items-start mb-5">
                <div className={`p-2 rounded-xl border ${bgs[colorClass]} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-1">{title}</p>
            <h2 className={`font-black font-mono text-white tracking-tighter mb-2 ${isText ? 'text-xl leading-tight break-all' : 'text-4xl'}`}>{value}</h2>
            <p className={`text-[9px] font-mono font-bold uppercase tracking-tighter ${textColors[colorClass]}`}>{trend}</p>
        </div>
    );
}

function EmptyState() {
    return <p className="text-xs text-slate-600 italic text-center py-8">Sin datos para el período seleccionado</p>;
}

/* ─── Re-export trackEvent from shared utility ───────────────────────────── */
export { trackEvent } from '../utils/analytics';
