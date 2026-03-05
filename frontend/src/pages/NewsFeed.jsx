import { useEffect, useState } from 'react';
import { Megaphone, Bell, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

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
            .catch(console.error)
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
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">

                {/* Ambient */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon/5 blur-[150px] rounded-full -z-10 animate-pulse" />

                {/* Header */}
                <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-5 mb-3">
                        <div className="p-4 bg-gradient-to-br from-neon/20 to-transparent rounded-2xl border border-neon/30 shadow-[0_0_40px_rgba(0,255,65,0.1)]">
                            <Bell className="w-10 h-10 text-neon" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-neon">
                                Noticias<span className="text-white"> Academia</span>
                            </h1>
                            <p className="text-[11px] font-mono text-neon/60 uppercase tracking-[0.4em] mt-2">
                                // Boletín Oficial de la Academia Tech4U
                            </p>
                        </div>
                    </div>
                </header>

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
