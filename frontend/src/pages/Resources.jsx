import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    FileText,
    BookOpen,
    Search,
    Folder,
    Lock,
    CheckCircle,
    Inbox
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function Resources() {
    // --- ESTADOS ---
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // --- CARGA DE DATOS (Optimización de limpieza y errores) ---
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchResources = async () => {
            try {
                setLoading(true);
                const res = await api.get('/resources', { 
                    signal: controller.signal 
                });

                if (isMounted) {
                    setResources(Array.isArray(res.data) ? res.data : []);
                    setError(null);
                }
            } catch (err) {
                if (err.name === "CanceledError") return;
                
                if (err.response?.status === 401) {
                    localStorage.removeItem("tech4u_token");
                    localStorage.removeItem("tech4u_user");
                    window.location.href = "/login";
                    return;
                }

                console.error("Error cargando recursos:", err);
                if (isMounted) {
                    setError("No se pudo conectar con el servidor de recursos.");
                    setResources([]);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchResources();
        
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    // --- LÓGICA DE FILTRADO Y AGRUPACIÓN (Evita Cascading setState) ---
    // Usamos useMemo para procesar los datos una sola vez por renderizado
    const groupedResources = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        
        // 1. Filtrar
        const filtered = resources.filter(r =>
            (r.title || "").toLowerCase().includes(term) ||
            (r.subject || "").toLowerCase().includes(term)
        );

        // 2. Agrupar
        return filtered.reduce((acc, item) => {
            const key = item.subject || "Sin Categoría";
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    }, [resources, searchTerm]);

    // Handler para optimizar el input de búsqueda
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* HEADER */}
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[#39FF14]/10 rounded-lg border border-[#39FF14]/20">
                                <BookOpen className="w-6 h-6 text-[#39FF14]" aria-hidden="true" />
                            </div>
                            <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                                REPOSITORIO DE <span className="text-[#39FF14]">RECURSOS</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">
                            Protocolo de consulta: Material técnico clasificado
                        </p>
                    </div>

                    <div className="relative group w-full md:w-72">
                        <label htmlFor="resource-search" className="sr-only">Buscar recursos</label>
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#39FF14] transition-colors" />
                        <input
                            id="resource-search"
                            type="text"
                            placeholder="Buscar en la base de datos..."
                            className="bg-black/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-[#39FF14] focus:border-[#39FF14] outline-none w-full transition-all"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </header>

                {/* ESTADO CARGANDO */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-12 h-12 border-2 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin"></div>
                        <span className="text-[#39FF14] font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">
                            Sincronizando base de datos...
                        </span>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center border border-red-500/20 bg-red-500/5 rounded-3xl">
                        <p className="text-red-500 font-mono text-xs uppercase">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {Object.keys(groupedResources).length > 0 ? (
                            Object.entries(groupedResources).map(([subject, items]) => (
                                <section key={subject} aria-labelledby={`section-${subject}`}>
                                    <div className="flex items-center gap-4 mb-8">
                                        <h2 
                                            id={`section-${subject}`}
                                            className="text-[10px] font-black uppercase tracking-[0.5em] bg-white/5 px-4 py-2 rounded-md border-l-2 border-[#39FF14] flex items-center gap-3 text-white"
                                        >
                                            <Folder className="w-3.5 h-3.5 text-[#39FF14]" /> {subject}
                                        </h2>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-800 to-transparent"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {items.map((res) => {
                                            // Lógica de bloqueo basada en la respuesta del servidor
                                            const isLocked = res.requires_subscription && !res.url;

                                            return (
                                                <article
                                                    key={res.id}
                                                    className={`glass group rounded-3xl border border-white/5 p-6 transition-all relative flex flex-col overflow-hidden h-full ${
                                                        isLocked
                                                            ? 'opacity-80'
                                                            : 'hover:border-[#39FF14]/40 hover:shadow-[0_0_40px_rgba(57,255,20,0.05)]'
                                                    }`}
                                                >
                                                    {/* OVERLAY BLOQUEO */}
                                                    {isLocked && (
                                                        <div className="absolute inset-0 z-10 bg-[#0D0D0D]/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center">
                                                            <Lock className="w-8 h-8 text-yellow-500 mb-3 animate-bounce" />
                                                            <h4 className="text-xs font-black uppercase text-white mb-1">Contenido Protegido</h4>
                                                            <p className="text-[9px] font-mono text-yellow-500/80 uppercase mb-5 leading-relaxed">
                                                                Adquiere una suscripción PRO<br/>para desbloquear
                                                            </p>
                                                            <button 
                                                                onClick={() => window.location.href = '/plans'}
                                                                className="px-6 py-2.5 bg-[#39FF14] text-black text-[10px] font-black uppercase rounded-full hover:scale-105 transition-transform"
                                                            >
                                                                Ver Planes
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-start mb-6">
                                                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest bg-white/5 border border-white/5 px-2 py-1 rounded">
                                                            {res.file_type || 'PDF'}
                                                        </span>
                                                        {isLocked ? (
                                                            <Lock className="w-3.5 h-3.5 text-yellow-600" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4 text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.5)] opacity-60" />
                                                        )}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-4 mb-6">
                                                            <div className={`p-3 rounded-2xl transition-colors ${isLocked ? 'bg-white/5' : 'bg-[#39FF14]/5 group-hover:bg-[#39FF14]/10'}`}>
                                                                <FileText className={`w-6 h-6 ${isLocked ? 'text-slate-700' : 'text-slate-400 group-hover:text-[#39FF14]'}`} />
                                                            </div>
                                                            <div>
                                                                <h3 className={`text-[13px] font-bold mb-1.5 uppercase tracking-tight leading-tight ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                                                                    {res.title}
                                                                </h3>
                                                                <p className="text-[11px] text-slate-600 font-mono italic leading-relaxed line-clamp-2">
                                                                    {res.description || "Material técnico clasificado."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto pt-6">
                                                        {isLocked ? (
                                                            <div className="w-full py-3.5 bg-white/5 border border-white/10 text-slate-700 rounded-2xl text-[10px] font-black uppercase flex justify-center items-center gap-2 cursor-not-allowed">
                                                                Bloqueado
                                                            </div>
                                                        ) : (
                                                            <a
                                                                href={res.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full py-3.5 bg-[#39FF14] hover:bg-[#2ed610] text-black rounded-2xl text-[10px] font-black uppercase flex justify-center items-center gap-2 transition-all"
                                                            >
                                                                Acceder al recurso
                                                            </a>
                                                        )}
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))
                        ) : (
                            <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                                <Inbox className="w-12 h-12 text-slate-800 mb-4" />
                                <p className="text-slate-600 font-mono text-[10px] uppercase tracking-[0.5em] text-center">
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