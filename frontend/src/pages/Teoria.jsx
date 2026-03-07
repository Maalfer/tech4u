import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Monitor,
    Wifi,
    Database,
    Cpu,
    FileCode,
    Zap,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../index.css';

const SUBJECT_STYLES = {
    'general': { icon: Zap, color: 'from-yellow-600/20 to-yellow-900/10 border-yellow-500/30 hover:border-yellow-400/60', iconColor: 'text-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    'Bases de Datos': { icon: Database, color: 'from-violet-600/20 to-violet-900/10 border-violet-500/30 hover:border-violet-400/60', iconColor: 'text-violet-400', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
    'Redes': { icon: Wifi, color: 'from-sky-600/20 to-sky-900/10 border-sky-500/30 hover:border-sky-400/60', iconColor: 'text-sky-400', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    'Sistemas Operativos': { icon: Monitor, color: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30 hover:border-emerald-400/60', iconColor: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    'Fundamentos de Hardware': { icon: Cpu, color: 'from-orange-600/20 to-orange-900/10 border-orange-500/30 hover:border-orange-400/60', iconColor: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    'Lenguaje de Marcas': { icon: FileCode, color: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/30 hover:border-cyan-400/60', iconColor: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
};

const DEFAULT_STYLE = { icon: BookOpen, color: 'from-slate-600/20 to-slate-900/10 border-slate-500/30 hover:border-slate-400/60', iconColor: 'text-slate-400', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };

export default function Teoria() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/teoria/subjects'),
            api.get('/dashboard/stats')
        ]).then(([subjRes, statsRes]) => {
            setSubjects(Array.isArray(subjRes.data) ? subjRes.data : []);
            setStats(statsRes.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // Current XP info from real dashboard stats
    const currentXP = stats?.current_xp || 0;
    const nextLevelXP = stats?.next_level_xp || 1000;
    const xpPercent = Math.min(Math.round((currentXP / nextLevelXP) * 100), 100);
    const rankName = stats?.rank_name || user?.rank_name || 'Estudiante';
    const userLevel = user?.level || 1;

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">

                {/* ── Header ── */}
                <PageHeader
                    title={<>Teoría<span className="text-white"> / Temario</span></>}
                    subtitle="Dungeon of Knowledge — ASIR, DAW, DAM, SMR"
                    Icon={BookOpen}
                    gradient="from-white via-neon-alpha-70 to-[#c6ff33]"
                    iconColor="text-[#c6ff33]"
                    iconBg="bg-[#c6ff33]/20"
                    iconBorder="border-[#c6ff33]/30"
                    glowColor="bg-[#c6ff33]/20"
                />

                <div className="animate-in fade-in duration-500">
                    {/* XP bar — identical to TestCenter */}
                    <div className="glass rounded-2xl px-6 py-4 border border-slate-800 mb-8 flex items-center gap-6 max-w-2xl">
                        <div className="flex-shrink-0 text-center">
                            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">Rango</p>
                            <p className="text-sm font-black uppercase italic text-white leading-tight">{rankName}</p>
                            <p className="text-[9px] font-mono text-neon">Lv.{userLevel}</p>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-mono mb-1.5">
                                <span className="text-slate-400 uppercase">Experiencia</span>
                                <span className="text-neon font-bold">{currentXP} / {nextLevelXP} XP</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-neon to-cyan-400 shadow-[0_0_10px_var(--color-neon)] transition-all duration-1000 rounded-full"
                                    style={{ width: `${xpPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-6">
                        Elige tu asignatura
                    </p>

                    {loading ? (
                        <div className="flex items-center gap-3 text-slate-500 font-mono text-[10px] uppercase animate-pulse">
                            <Sparkles className="w-4 h-4" /> Cargando base de datos...
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className="glass rounded-3xl p-12 border-2 border-dashed border-white/5 text-center max-w-3xl">
                            <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">No hay contenido disponible todavía</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl">
                            {subjects.map(s => {
                                const style = SUBJECT_STYLES[s.name] || DEFAULT_STYLE;
                                const Icon = style.icon;

                                return (
                                    <Link
                                        key={s.id}
                                        to={`/teoria/${s.slug}`}
                                        className={`group glass rounded-3xl p-7 border-2 bg-gradient-to-br ${style.color} text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] block no-underline`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                            <Icon className={`w-6 h-6 ${style.iconColor}`} />
                                        </div>
                                        <h3 className="text-sm font-black uppercase italic text-white leading-tight mb-1 group-hover:text-white">
                                            {s.name}
                                        </h3>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${style.badge}`}>
                                                ASIR
                                            </span>
                                            <ChevronRight className={`w-4 h-4 ${style.iconColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
