import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Terminal as TerminalIcon,
    Play,
    Lock,
    CheckCircle,
    Clock,
    Zap,
    ChevronRight,
    Search,
    Filter,
    HardDrive,
    ShieldCheck,
    Cpu,
    Network
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const CATEGORY_ICONS = {
    'Sistemas': HardDrive,
    'Redes': Network,
    'Seguridad': ShieldCheck,
    'Hardware': Cpu,
    'Linux': TerminalIcon
};

export default function LabsPage() {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLabs = async () => {
            try {
                const res = await api.get('/labs');
                setLabs(res.data);
            } catch (err) {
                console.error("Error fetching labs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLabs();
    }, []);

    const filteredLabs = labs.filter(lab =>
        lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 rounded-2xl bg-neon/10 border border-neon/30">
                            <TerminalIcon className="w-8 h-8 text-neon" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                                Terminal <span className="text-neon">Skills</span>
                            </h1>
                            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">
                                Entornos interactivos de práctica real
                            </p>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-slate-500 group-hover:text-neon transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar laboratorios (ej: permisos linux, subredes...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/5 focus:border-neon focus:bg-black/60 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-mono text-white outline-none transition-all placeholder:text-slate-600 shadow-2xl backdrop-blur-xl"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-5 py-3.5 rounded-2xl bg-black/40 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition-all backdrop-blur-xl flex items-center gap-2 text-sm font-bold">
                            <Filter className="w-4 h-4" /> Filtros
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 rounded-3xl bg-white/5 border border-white/10" />
                        ))}
                    </div>
                ) : filteredLabs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLabs.map(lab => {
                            const Icon = CATEGORY_ICONS[lab.category] || TerminalIcon;
                            const isLocked = lab.is_unlocked === false;
                            const isCompleted = lab.is_completed === true;
                            const isNext = lab.is_unlocked && !lab.is_completed;

                            return (
                                <div
                                    key={lab.id}
                                    onClick={() => !isLocked && navigate(`/labs/${lab.id}`)}
                                    className={`group relative glass rounded-3xl border transition-all duration-500 overflow-hidden flex flex-col h-full 
                                        ${isLocked ? 'opacity-40 grayscale border-white/5 cursor-not-allowed' :
                                            isNext ? 'border-neon/50 shadow-[0_0_30px_rgba(198,255,51,0.1)] hover:border-neon cursor-pointer' :
                                                'border-white/5 hover:border-neon/30 cursor-pointer'} 
                                        ${isCompleted ? 'hover:shadow-[0_0_40px_rgba(16,185,129,0.05)]' : 'hover:shadow-[0_0_40px_rgba(198,255,51,0.05)]'}`}
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                                        {isLocked ? <Lock className="w-24 h-24 text-white" /> : <Icon className="w-24 h-24 text-white" />}
                                    </div>

                                    <div className="p-6 flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest
                                                    ${isLocked ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-neon/10 border-neon/20 text-neon'}`}>
                                                    {lab.category}
                                                </span>
                                                {isCompleted && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                                                        <CheckCircle className="w-2.5 h-2.5" /> Completado
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9px] uppercase">
                                                <Clock className="w-3 h-3" /> {lab.difficulty === 'easy' ? '15 min' : lab.difficulty === 'medium' ? '30 min' : '1h+'}
                                            </div>
                                        </div>

                                        <h3 className={`text-xl font-black transition-colors mb-2 leading-tight uppercase italic tracking-tight
                                            ${isLocked ? 'text-slate-600' : 'text-white group-hover:text-neon'}`}>
                                            {lab.title}
                                            {isLocked && <Lock className="inline-block ml-2 w-4 h-4 text-slate-700" />}
                                        </h3>
                                        <p className="text-slate-400 font-mono text-xs line-clamp-2 leading-relaxed mb-6">
                                            {lab.description}
                                        </p>

                                        <div className="flex items-center gap-4 mt-auto">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${lab.difficulty === 'easy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : lab.difficulty === 'medium' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                                <span className="text-[10px] font-mono text-slate-500 uppercase">{lab.difficulty}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Zap className={`w-3.5 h-3.5 ${isLocked ? 'text-slate-700' : 'text-neon'}`} />
                                                <span className="text-[10px] font-mono text-slate-500 uppercase">{lab.xp_reward} XP</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`p-4 border-t transition-all flex items-center justify-between
                                        ${isLocked ? 'bg-black/20 border-white/5' : 'bg-white/[0.02] border-white/5 group-hover:bg-neon/5'}`}>
                                        <span className={`text-[10px] font-black uppercase tracking-widest 
                                            ${isLocked ? 'text-slate-700' : 'text-slate-500 group-hover:text-white'}`}>
                                            {isLocked ? 'Bloqueado' : isCompleted ? 'Repetir Práctica' : 'Iniciar Práctica'}
                                        </span>
                                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all
                                            ${isLocked ? 'bg-black/10 border-white/5' : 'bg-black/40 border-white/10 group-hover:bg-neon group-hover:border-neon'}`}>
                                            {isLocked ? (
                                                <Lock className="w-3.5 h-3.5 text-slate-700" />
                                            ) : (
                                                <Play className="w-3.5 h-3.5 text-white group-hover:fill-current group-hover:text-black transition-all" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-96 glass rounded-4xl border border-white/5">
                        <Search className="w-12 h-12 text-slate-700 mb-4" />
                        <h3 className="text-xl font-black uppercase italic text-slate-500">No se encontraron laboratorios</h3>
                        <p className="text-slate-600 font-mono text-sm mt-2">Intenta con otros términos de búsqueda.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
