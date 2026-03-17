import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    ChevronRight,
    Sparkles,
    Lock,
    CreditCard,
    Database,
    Network,
    Monitor,
    Cpu,
    Code2,
    GraduationCap,
    FileText,
    Shield,
    Clock,
} from 'lucide-react';

// Slugs que aún no están listos para alumnos — se muestran como "Próximamente"
const COMING_SOON_SLUGS = ['ciberseguridad', 'ejptv2'];
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../index.css';
import { useSEO } from '../hooks/useSEO';
import { SubjectCoverComponent } from '../components/TestCenterCovers';

// ── Premium icon + accent config per subject ──────────────────────────────────
const SUBJECT_CONFIGS = {
    'Bases de Datos': { Icon: Database, accent: '#8b5cf6', accentRgb: '139,92,246' },
    'Redes': { Icon: Network, accent: '#0ea5e9', accentRgb: '14,165,233' },
    'Sistemas Operativos': { Icon: Monitor, accent: '#22c55e', accentRgb: '34,197,94' },
    'Fundamentos de Hardware': { Icon: Cpu, accent: '#f97316', accentRgb: '249,115,22' },
    'Lenguaje de Marcas': { Icon: Code2, accent: '#06b6d4', accentRgb: '6,182,212' },
};
const DEFAULT_CONFIG = { Icon: FileText, accent: '#94a3b8', accentRgb: '148,163,184' };

// ── Hero ──────────────────────────────────────────────────────────────────────
function TeoriaHero({ subjects, stats }) {
    const xpPct = Math.min(Math.round(((stats?.current_xp || 0) / (stats?.next_level_xp || 1000)) * 100), 100);
    const level = stats?.level || 1;
    const rankName = stats?.rank_name || 'Estudiante';
    const currentXP = stats?.current_xp || 0;
    const nextLevelXP = stats?.next_level_xp || 1000;

    return (
        <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/8"
            style={{ background: 'linear-gradient(135deg, #050f03 0%, #09180a 40%, #060e05 100%)' }}>
            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage: `linear-gradient(rgba(198,255,51,0.6) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(198,255,51,0.6) 1px, transparent 1px)`,
                    backgroundSize: '42px 42px'
                }} />

            {/* Glows */}
            <div className="absolute top-0 left-1/4 w-[480px] h-72 rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(198,255,51,0.4) 0%, transparent 70%)', filter: 'blur(50px)' }} />
            <div className="absolute bottom-0 right-1/3 w-80 h-56 rounded-full opacity-15 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(100,210,60,0.3) 0%, transparent 70%)', filter: 'blur(55px)' }} />

            {/* Bottom edge */}
            <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(198,255,51,0.4), transparent)' }} />

            <div className="relative z-10 px-10 pt-12 pb-11">
                {/* Badge row */}
                <div className="flex items-center gap-3 mb-7 flex-wrap">
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-sm"
                        style={{ borderColor: 'rgba(198,255,51,0.3)', background: 'rgba(198,255,51,0.08)' }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#c6ff33' }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#c6ff33' }}>
                            Teoría · Dungeon of Knowledge
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                        <GraduationCap size={10} style={{ color: '#c6ff33' }} />
                        <span className="text-[10px] font-mono text-slate-500">ASIR · DAW · DAM · SMR</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] ml-auto">
                        <Sparkles size={10} className="text-slate-500" />
                        <span className="text-[10px] font-mono text-slate-500">{rankName} · Nv. {level}</span>
                    </div>
                </div>

                {/* Headline */}
                <div className="mb-7">
                    <h1 className="text-6xl font-black tracking-tight leading-none mb-4">
                        <span className="text-white">Amplía tu</span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(90deg, #c6ff33 0%, #78e03a 40%, #c6ff33 80%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Conocimiento ASIR
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                        Temario completo, apuntes y teoría de todas las asignaturas.{' '}
                        <span className="text-slate-300 font-medium">Domina los conceptos antes del examen.</span>
                    </p>
                </div>

                {/* Stats + XP */}
                <div className="flex items-center gap-4 mb-7 flex-wrap">
                    {[
                        { label: 'Asignaturas', value: String(subjects?.length || 6), color: '#c6ff33' },
                        { label: 'XP acumulada', value: String(currentXP), color: '#facc15' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.03]">
                            <span className="text-xl font-black" style={{ color }}>{value}</span>
                            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
                        </div>
                    ))}
                </div>

                {/* XP bar */}
                <div className="max-w-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3" style={{ color: '#c6ff33' }} />
                            <span className="text-[11px] font-mono text-slate-400">Experiencia · Nivel {level}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black font-mono border text-[#c6ff33]"
                            style={{ background: 'rgba(198,255,51,0.1)', borderColor: 'rgba(198,255,51,0.25)' }}>
                            {rankName}
                        </span>
                    </div>
                    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${xpPct}%`,
                                background: 'linear-gradient(90deg, #4a7c00 0%, #84cc16 40%, #c6ff33 80%)',
                                boxShadow: '0 0 12px rgba(198,255,51,0.5)',
                            }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] font-mono text-slate-600">{currentXP} XP</span>
                        <span className="text-[10px] font-mono text-slate-600">{nextLevelXP} XP</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Subject Card — full-bleed SVG cover (same pattern as TestCenter) ───────────
function SubjectCard({ subject }) {
    const cfg = SUBJECT_CONFIGS[subject.name] || DEFAULT_CONFIG;
    const { Icon, accent, accentRgb } = cfg;

    return (
        <Link
            to={`/teoria/${subject.slug}`}
            className="group relative rounded-2xl overflow-hidden cursor-pointer text-left transition-all duration-300 hover:-translate-y-2 no-underline block"
            style={{
                aspectRatio: '4/5',
                border: `1.5px solid rgba(${accentRgb},0.18)`,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = `rgba(${accentRgb},0.55)`;
                e.currentTarget.style.boxShadow = `0 8px 40px rgba(${accentRgb},0.18), 0 0 0 1px rgba(${accentRgb},0.12)`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = `rgba(${accentRgb},0.18)`;
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* SVG Cover — full-bleed background */}
            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                <SubjectCoverComponent subjectKey={subject.name} />
            </div>

            {/* Dark gradient overlay toward bottom */}
            <div className="absolute inset-0" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.08) 70%, transparent 100%)',
            }} />

            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] opacity-55 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, rgba(${accentRgb},1), transparent)` }} />

            {/* Bottom content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2.5">
                {/* Icon + title */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm"
                        style={{
                            background: `rgba(${accentRgb},0.15)`,
                            border: `1px solid rgba(${accentRgb},0.35)`,
                            boxShadow: `0 0 14px rgba(${accentRgb},0.2)`,
                        }}>
                        <Icon size={18} style={{ color: accent }} />
                    </div>
                    <h3 className="font-black text-white text-sm uppercase italic leading-tight tracking-tight">
                        {subject.name}
                    </h3>
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between pt-0.5">
                    <span className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">ASIR</span>
                    <div className="flex items-center gap-1 font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1.5 group-hover:translate-x-0"
                        style={{ color: accent }}>
                        <span>Ver temario</span>
                        <ChevronRight size={11} />
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ── Coming Soon Card ──────────────────────────────────────────────────────────
function ComingSoonCard({ name, icon: Icon, accent, accentRgb, description }) {
    return (
        <div
            className="relative rounded-2xl overflow-hidden select-none"
            style={{
                aspectRatio: '4/5',
                border: `1.5px solid rgba(${accentRgb},0.10)`,
                background: 'rgba(255,255,255,0.02)',
                opacity: 0.55,
            }}
        >
            {/* Subtle grid bg */}
            <div className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: `linear-gradient(rgba(${accentRgb},0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(${accentRgb},0.8) 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                }} />

            {/* Lock badge */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                style={{ borderColor: `rgba(${accentRgb},0.25)`, background: `rgba(${accentRgb},0.08)` }}>
                <Clock size={9} style={{ color: `rgb(${accentRgb})` }} />
                <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: `rgb(${accentRgb})` }}>
                    Próximamente
                </span>
            </div>

            {/* Dark gradient overlay */}
            <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />

            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] opacity-30"
                style={{ background: `linear-gradient(90deg, transparent, rgba(${accentRgb},1), transparent)` }} />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2.5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: `rgba(${accentRgb},0.10)`,
                            border: `1px solid rgba(${accentRgb},0.20)`,
                        }}>
                        <Icon size={18} style={{ color: `rgb(${accentRgb})` }} />
                    </div>
                    <h3 className="font-black text-slate-400 text-sm uppercase italic leading-tight tracking-tight">
                        {name}
                    </h3>
                </div>
                {description && (
                    <p className="text-[10px] font-mono text-slate-600 leading-snug">{description}</p>
                )}
                <div className="flex items-center justify-between pt-0.5">
                    <span className="font-mono text-[9px] text-slate-700 uppercase tracking-widest">ASIR</span>
                    <Lock size={10} className="text-slate-700" />
                </div>
            </div>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Teoria() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useSEO({
        title: 'Teoría — Temario Completo ASIR y SMR',
        description: 'Accede al temario completo de Redes, Sistemas Operativos, Bases de Datos, Fundamentos de Hardware y Lenguaje de Marcas para ASIR y SMR.',
        path: '/teoria',
    });

    useEffect(() => {
        // Fetch subjects publicly — no auth needed
        // Filtramos 'Examen General' y los slugs marcados como próximamente
        api.get('/teoria/subjects')
            .then(res => setSubjects(
                Array.isArray(res.data)
                    ? res.data.filter(s => s.name !== 'Examen General' && !COMING_SOON_SLUGS.includes(s.slug))
                    : []
            ))
            .catch(() => { })
            .finally(() => setLoading(false));

        // Stats only for logged-in users
        if (user) {
            api.get('/dashboard/stats').then(res => setStats(res.data)).catch(() => { });
        }
    }, [user]);

    const isSubscribed = user &&
        user.subscription_type !== 'free' &&
        user.subscription_end &&
        new Date(user.subscription_end) > new Date();
    const isStaff = user && ['admin', 'developer', 'docente'].includes(user.role);

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8">

                <div className="animate-in fade-in duration-500">

                    {/* ── Premium Hero (only for subscribers) ── */}
                    {(isSubscribed || isStaff) ? (
                        <TeoriaHero subjects={subjects} stats={stats} />
                    ) : (
                        <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/8 bg-gradient-to-br from-[#050f03] to-[#09180a] p-10">
                            <div className="absolute top-0 left-1/4 w-96 h-48 rounded-full opacity-10 pointer-events-none"
                                style={{ background: 'radial-gradient(ellipse, rgba(198,255,51,0.5) 0%, transparent 70%)', filter: 'blur(50px)' }} />
                            <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-[0.3em] mb-4">📚 Teoría · Dungeon of Knowledge</p>
                            <h1 className="text-5xl font-black tracking-tight leading-none mb-4">
                                <span className="text-white">Amplía tu</span><br />
                                <span style={{ background: 'linear-gradient(90deg, #c6ff33 0%, #78e03a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Conocimiento ASIR
                                </span>
                            </h1>
                            <p className="text-slate-400 text-base max-w-xl">
                                Temario completo de todas las asignaturas. <span className="text-white font-medium">Explora gratis</span> — suscríbete para acceder a todos los artículos.
                            </p>
                        </div>
                    )}

                    {/* Section divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1 bg-white/6" />
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full border"
                            style={{ borderColor: 'rgba(198,255,51,0.25)', background: 'rgba(198,255,51,0.06)' }}>
                            <BookOpen size={12} style={{ color: '#c6ff33' }} />
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: '#c6ff33' }}>
                                Elige tu asignatura
                            </span>
                        </div>
                        <div className="h-px flex-1 bg-white/6" />
                    </div>

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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                            {subjects.map(s => (
                                <SubjectCard key={s.id} subject={s} />
                            ))}
                            {/* Tarjetas "Próximamente" — visibles pero bloqueadas */}
                            <ComingSoonCard
                                name="Ciberseguridad"
                                icon={Shield}
                                accent="#ef4444"
                                accentRgb="239,68,68"
                                description="OWASP, Pentesting, Criptografía, Firewalls y Análisis Forense"
                            />
                        </div>
                    )}

                    {/* ── Freemium CTA (for non-subscribers) ── */}
                    {!isSubscribed && !isStaff && (
                        <div className="mt-12 max-w-2xl rounded-3xl border border-amber-500/20 bg-amber-500/[0.04] p-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                                    <Lock className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2">Desbloquea todo el temario</h2>
                                    <p className="text-slate-400 font-mono text-sm mb-5 leading-relaxed">
                                        Puedes explorar las asignaturas libremente. Para acceder a todos los artículos elige un plan Premium.
                                    </p>
                                    <Link
                                        to="/planes"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black uppercase tracking-wider transition-all hover:scale-105 text-sm"
                                    >
                                        <CreditCard className="w-5 h-5" /> Ver Planes
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
