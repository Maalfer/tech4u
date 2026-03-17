import { useEffect, useState } from 'react';
import { Megaphone, Bell, Clock, Sparkles, Radio } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import api from '../services/api';

// ── Hero ──────────────────────────────────────────────────────────────────────
function NewsFeedHero({ announcements }) {
    return (
        <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/8"
             style={{ background: 'linear-gradient(135deg, #050f03 0%, #09180a 40%, #060e05 100%)' }}>
            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.07]"
                 style={{
                     backgroundImage: `linear-gradient(rgba(198,255,51,0.6) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(198,255,51,0.6) 1px, transparent 1px)`,
                     backgroundSize: '42px 42px'
                 }} />

            {/* Glows */}
            <div className="absolute top-0 left-1/4 w-[480px] h-64 rounded-full opacity-20 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(198,255,51,0.4) 0%, transparent 70%)', filter: 'blur(50px)' }} />
            <div className="absolute bottom-0 right-1/3 w-80 h-52 rounded-full opacity-12 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(134,239,172,0.3) 0%, transparent 70%)', filter: 'blur(55px)' }} />

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
                            Noticias · Boletín Oficial Academia
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                        <Radio size={10} style={{ color: '#c6ff33' }} />
                        <span className="text-[10px] font-mono text-slate-500">Tech4U Academy · Sistema Alpha</span>
                    </div>
                </div>

                {/* Headline */}
                <div className="mb-7">
                    <h1 className="text-6xl font-black tracking-tight leading-none mb-4">
                        <span className="text-white">Noticias de</span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(90deg, #c6ff33 0%, #78e03a 40%, #c6ff33 80%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            la Comunidad
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                        Actualizaciones, novedades y anuncios oficiales de la academia.{' '}
                        <span className="text-slate-300 font-medium">Mantente al día con todo lo que ocurre.</span>
                    </p>
                </div>

                {/* Stats pills */}
                <div className="flex items-center gap-3 flex-wrap">
                    {[
                        { label: 'Publicaciones', value: String(announcements.length || 0), color: '#c6ff33' },
                        { label: 'Actualizaciones', value: 'Live', color: '#86efac' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03]">
                            <span className="text-xl font-black" style={{ color }}>{value}</span>
                            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `Hace ${diff}s`;
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    return `Hace ${Math.floor(diff / 86400)} días`;
}

export default function NewsFeed() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/announcements/history')
            .then(r => setAnnouncements(r.data))
            .catch(err => { if (import.meta.env.DEV) console.error(err) })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex h-screen bg-[#0D0D0D] items-center justify-center">
            <div className="w-10 h-10 border-4 border-neon border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 relative overflow-hidden">

                <NewsFeedHero announcements={announcements} />

                {/* Bulletin Board */}
                {announcements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-30">
                        <Megaphone className="w-16 h-16 text-neon mb-4" />
                        <p className="font-mono text-slate-600 uppercase tracking-widest text-sm">Sin noticias por el momento</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-3xl">
                        {announcements.map((ann, i) => (
                            <div
                                key={ann.id}
                                className="group relative flex gap-5 p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-neon/20 rounded-2xl transition-all duration-300 animate-in fade-in slide-in-from-left-4"
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                {/* Neon Line */}
                                <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-neon/60 to-transparent rounded-full group-hover:opacity-100 opacity-40 transition-opacity" />

                                {/* Icon */}
                                <div className="flex-shrink-0 p-2.5 bg-neon/10 border border-neon/20 rounded-xl h-fit mt-1 group-hover:scale-110 transition-transform">
                                    <Megaphone className="w-4 h-4 text-neon" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[9px] font-mono text-neon/50 uppercase tracking-[0.3em] font-black">[SISTEMA ALPHA]</span>
                                        {i === 0 && (
                                            <span className="px-2 py-0.5 bg-neon/20 text-neon text-[8px] font-black uppercase rounded tracking-wider animate-pulse">
                                                Reciente
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-mono text-slate-200 leading-relaxed">
                                        {ann.content}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-3 text-[10px] font-mono text-slate-600">
                                        <Clock className="w-3 h-3" />
                                        <span>{timeAgo(ann.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
