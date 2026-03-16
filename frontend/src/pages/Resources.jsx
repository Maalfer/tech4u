import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, BookOpen, Search, Download,
    Clock, Sparkles, Database, Wifi,
    Monitor, Shield, Cpu, Code
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import api from '../services/api';

// ── Subject styling map ─────────────────────────────────────────────────────
const SUBJECT_STYLE = {
    'Bases de Datos': { icon: Database, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', glow: 'shadow-violet-500/10' },
    'Redes': { icon: Wifi, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', glow: 'shadow-sky-500/10' },
    'Sistemas Operativos': { icon: Monitor, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
    'Ciberseguridad': { icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'shadow-red-500/10' },
    'Fundamentos de Hardware': { icon: Cpu, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'shadow-orange-500/10' },
    'Lenguaje de Marcas': { icon: Code, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', glow: 'shadow-cyan-500/10' },
};

const DEFAULT_STYLE = { icon: FileText, color: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/10', glow: '' };

// ── Static "coming soon" subjects ────────────────────────────────────────────
const COMING_SOON = [
    { subject: 'Bases de Datos', eta: 'Próximamente' },
    { subject: 'Redes', eta: 'Próximamente' },
    { subject: 'Sistemas Operativos', eta: 'Próximamente' },
    { subject: 'Ciberseguridad', eta: 'Próximamente' },
    { subject: 'Fundamentos de Hardware', eta: 'Próximamente' },
    { subject: 'Lenguaje de Marcas', eta: 'Próximamente' },
];

// ── Resource card (when real resources exist) ─────────────────────────────────
function ResourceCard({ res }) {
    const navigate = useNavigate()
    const style = SUBJECT_STYLE[res.subject] || DEFAULT_STYLE;
    const isLocked = res.requires_subscription && !res.url;
    const Icon = style.icon;

    return (
        <article className={`group glass rounded-2xl border ${style.border} p-5 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] relative overflow-hidden`}>
            {/* top glow strip */}
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent ${style.color} opacity-30`} />

            <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${style.color}`} />
                </div>
                <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded-full border ${isLocked
                    ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                    : `${style.color} ${style.bg} ${style.border}`
                    }`}>
                    {res.file_type || 'PDF'}
                </span>
            </div>

            <div className="flex-1">
                <h3 className="text-sm font-black text-white uppercase leading-tight mb-1">{res.title}</h3>
                <p className="text-[11px] text-slate-500 font-mono leading-relaxed line-clamp-2">{res.description || 'Material técnico para preparar tu titulación.'}</p>
            </div>

            <div className="mt-auto">
                {isLocked ? (
                    <button
                        onClick={() => window.location.href = '/suscripcion'}
                        className="w-full py-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-[10px] font-black uppercase hover:bg-yellow-500/20 transition-all"
                    >
                        🔒 Desbloquear con suscripción
                    </button>
                ) : (
                    <button
                        onClick={() => navigate(`/recursos/${res.id}`)}
                        className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all bg-neon text-black hover:shadow-[0_0_20px_var(--neon-alpha-40)] hover:scale-[1.01]`}
                    >
                        <BookOpen className="w-3.5 h-3.5" /> Ver recurso
                    </button>
                )}
            </div>
        </article>
    );
}

// ── "Coming soon" card ────────────────────────────────────────────────────────
function ComingSoonCard({ subject, eta }) {
    const style = SUBJECT_STYLE[subject] || DEFAULT_STYLE;
    const Icon = style.icon;

    return (
        <div className={`group relative glass rounded-2xl border ${style.border} p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[180px] transition-all duration-300 hover:-translate-y-1 overflow-hidden`}>
            {/* animated bg pulse */}
            <div className={`absolute inset-0 ${style.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className={`relative w-12 h-12 rounded-2xl ${style.bg} border ${style.border} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${style.color}`} />
            </div>

            <div className="relative">
                <p className="text-xs font-black text-white uppercase tracking-tight mb-1">{subject}</p>
                <div className="flex items-center justify-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{eta}</span>
                </div>
            </div>

            <div className={`relative h-1 w-16 rounded-full ${style.bg} overflow-hidden`}>
                <div className={`h-full w-1/3 rounded-full bg-current ${style.color} animate-pulse`} />
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Resources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let mounted = true;
        const ctrl = new AbortController();
        api.get('/resources', { signal: ctrl.signal })
            .then(r => { if (mounted) setResources(Array.isArray(r.data) ? r.data : []) })
            .catch(() => { })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; ctrl.abort(); };
    }, []);

    const groupedResources = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        const filtered = resources.filter(r =>
            (r.title || '').toLowerCase().includes(term) ||
            (r.subject || '').toLowerCase().includes(term)
        );
        return filtered.reduce((acc, item) => {
            const key = item.subject || 'Sin Categoría';
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    }, [resources, searchTerm]);

    const hasResources = Object.keys(groupedResources).length > 0;

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">

                {/* ── Header ── */}
                <PageHeader
                    title={<>Arse<span className="text-white">nal</span></>}
                    subtitle="Apuntes & Esquemas"
                    Icon={BookOpen}
                    gradient="from-white via-green-100 to-neon"
                    iconColor="text-neon"
                    iconBg="bg-neon/20"
                    iconBorder="border-neon/30"
                    glowColor="bg-neon/20"
                >
                    {/* Search — only if there are real resources */}
                    {resources.length > 0 && (
                        <div className="relative group w-full md:w-72">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar recursos..."
                                className="bg-black/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-white focus:border-neon outline-none w-full transition-all placeholder-slate-600"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                </PageHeader>

                {/* ── Loading ── */}
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-8 h-8 border-2 border-neon/30 border-t-neon rounded-full animate-spin" />
                    </div>

                ) : hasResources ? (
                    /* ── Real resources ── */
                    <div className="space-y-14">
                        {Object.entries(groupedResources).map(([subject, items]) => {
                            const style = SUBJECT_STYLE[subject] || DEFAULT_STYLE;
                            const Icon = style.icon;
                            return (
                                <section key={subject}>
                                    {/* Section header */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`p-1.5 rounded-lg ${style.bg} border ${style.border}`}>
                                            <Icon className={`w-4 h-4 ${style.color}`} />
                                        </div>
                                        <h2 className={`text-[11px] font-black uppercase tracking-widest ${style.color}`}>{subject}</h2>
                                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                        <span className="text-[9px] font-mono text-slate-600">{items.length} {items.length === 1 ? 'recurso' : 'recursos'}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {items.map(res => <ResourceCard key={res.id} res={res} />)}
                                    </div>
                                </section>
                            );
                        })}
                    </div>

                ) : (
                    /* ── Coming soon view ── */
                    <div className="space-y-10">

                        {/* Hero banner */}
                        <div className="relative glass rounded-3xl border border-white/5 p-10 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-neon/5 via-transparent to-transparent pointer-events-none" />
                            <div className="relative w-20 h-20 rounded-3xl bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-10 h-10 text-neon" />
                                <div className="absolute inset-0 rounded-3xl bg-neon/10 blur-xl" />
                            </div>
                            <div className="relative text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neon/10 border border-neon/20 rounded-full mb-4">
                                    <Clock className="w-3 h-3 text-neon animate-pulse" />
                                    <span className="text-[9px] font-mono text-neon uppercase tracking-widest">En preparación</span>
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase italic mb-2">
                                    Repositorio de recursos <span className="text-neon">Próximamente</span>
                                </h2>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed max-w-lg">
                                    Estamos preparando apuntes, esquemas y material de estudio premium para todas las asignaturas de ASIR.
                                    ¡Molto pronto!
                                </p>
                            </div>
                        </div>

                        {/* Per-subject coming soon grid */}
                        <div>
                            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-5">
                                Asignaturas en preparación
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {COMING_SOON.map(cs => (
                                    <ComingSoonCard key={cs.subject} subject={cs.subject} eta={cs.eta} />
                                ))}
                            </div>
                        </div>

                        {/* Bottom tip */}
                        <div className="flex items-center gap-4 p-5 bg-sky-500/5 border border-sky-500/20 rounded-2xl">
                            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-4 h-4 text-sky-400" />
                            </div>
                            <p className="text-sm text-slate-300 font-mono">
                                Mientras tanto, practica con los <span className="text-sky-400 font-black">500+ tests tipo examen</span> disponibles en el Test Center 🚀
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}