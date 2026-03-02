import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText,
    BookOpen,
    Search,
    Folder,
    Lock,
    CheckCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function Resources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const fetchResources = async () => {
            try {
                const res = await api.get('/resources', {
                    signal: controller.signal
                });

                setResources(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                    return;
                }

                if (err.name !== "CanceledError") {
                    console.error("Error cargando recursos:", err);
                    setResources([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
        return () => controller.abort();
    }, []);

    // 🔎 Filtrado seguro
    const filteredResources = useMemo(() => {
        const term = searchTerm.toLowerCase();

        return resources.filter(r =>
            (r.title || "").toLowerCase().includes(term) ||
            (r.subject || "").toLowerCase().includes(term)
        );
    }, [resources, searchTerm]);

    // 📁 Agrupación optimizada
    const groupedResources = useMemo(() => {
        return filteredResources.reduce((acc, item) => {
            const key = item.subject || "Sin Categoría";
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    }, [filteredResources]);

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">

                {/* HEADER */}
                <header className="mb-10 flex justify-between items-end border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[#39FF14]/10 rounded-lg border border-[#39FF14]/20">
                                <BookOpen className="w-6 h-6 text-[#39FF14]" />
                            </div>
                            <h1 className="text-3xl font-black uppercase italic">
                                REPOSITORIO DE <span className="text-[#39FF14]">RECURSOS</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">
                            Material técnico clasificado
                        </p>
                    </div>

                    <div className="relative group">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#39FF14]" />
                        <input
                            type="text"
                            placeholder="Buscar en la base de datos..."
                            className="bg-black/60 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-[#39FF14] focus:border-[#39FF14] outline-none w-72"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {/* LOADING */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[#39FF14] font-mono text-[10px] uppercase tracking-widest">
                            Cargando módulos...
                        </span>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {Object.keys(groupedResources).length > 0 ? (
                            Object.entries(groupedResources).map(([subject, items]) => (
                                <section key={subject}>
                                    <div className="flex items-center gap-4 mb-8">
                                        <h2 className="text-xs font-black uppercase tracking-[0.5em] bg-white/5 px-4 py-2 rounded-md border-l-2 border-[#39FF14] flex items-center gap-3">
                                            <Folder className="w-4 h-4 text-[#39FF14]" /> {subject}
                                        </h2>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-800 to-transparent"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {items.map((res) => {
                                            const locked = res.requires_subscription && !res.url;

                                            return (
                                                <div
                                                    key={res.id}
                                                    className={`glass group rounded-3xl border border-white/5 p-6 transition-all relative flex flex-col justify-between overflow-hidden ${
                                                        locked
                                                            ? 'cursor-not-allowed'
                                                            : 'hover:border-[#39FF14]/40 hover:shadow-[0_0_30px_rgba(57,255,20,0.1)]'
                                                    }`}
                                                >

                                                    {/* OVERLAY BLOQUEADO */}
                                                    {locked && (
                                                        <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center p-6 text-center">
                                                            <Lock className="w-8 h-8 text-yellow-500 mb-3" />
                                                            <p className="text-[10px] font-black uppercase text-white mb-1">
                                                                Contenido Protegido
                                                            </p>
                                                            <p className="text-[9px] font-mono text-yellow-500/80 uppercase mb-4">
                                                                Requiere suscripción PRO
                                                            </p>
                                                            <button className="px-4 py-2 bg-[#39FF14] text-black text-[9px] font-black uppercase rounded-lg">
                                                                Ver Planes
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className={`${locked ? 'grayscale blur-[1px]' : ''} flex flex-col h-full`}>
                                                        <div className="flex justify-between items-start mb-6">
                                                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest bg-black/40 px-2 py-1 rounded">
                                                                {res.file_type || 'DOC'}
                                                            </span>

                                                            {locked ? (
                                                                <Lock className="w-3 h-3 text-yellow-500" />
                                                            ) : (
                                                                <CheckCircle className="w-4 h-4 text-[#39FF14] opacity-60" />
                                                            )}
                                                        </div>

                                                        <div className="flex items-start gap-4 mb-8">
                                                            <div className="p-3 bg-white/5 rounded-xl">
                                                                <FileText className={`w-6 h-6 ${locked ? 'text-slate-700' : 'text-slate-500 group-hover:text-[#39FF14]'}`} />
                                                            </div>
                                                            <div>
                                                                <h3 className={`text-sm font-black mb-1 uppercase ${locked ? 'text-slate-500' : 'text-white group-hover:text-[#39FF14]'}`}>
                                                                    {res.title}
                                                                </h3>
                                                                <p className="text-[11px] text-slate-600 font-mono italic">
                                                                    {res.description || "Material clasificado."}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {locked ? (
                                                            <div className="w-full py-3 bg-white/5 border border-white/10 text-slate-700 rounded-xl text-[10px] font-black uppercase flex justify-center">
                                                                Bloqueado
                                                            </div>
                                                        ) : (
                                                            <a
                                                                href={res.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full py-3 bg-[#39FF14] text-black rounded-xl text-[10px] font-black uppercase flex justify-center"
                                                            >
                                                                Acceder al recurso
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))
                        ) : (
                            <div className="py-32 flex flex-col items-center border border-dashed border-white/5 rounded-[40px]">
                                <Search className="w-12 h-12 text-slate-800 mb-4" />
                                <p className="text-slate-600 font-mono text-[10px] uppercase tracking-[0.5em]">
                                    No se han encontrado recursos
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}