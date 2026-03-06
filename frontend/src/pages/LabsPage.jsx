import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    Network,
    ArrowLeft
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

// Assets
import linuxCover1 from '../assets/linux_lab_1.png';
const defaultCover = linuxCover1;
import linuxCover3 from '../assets/linux_lab_3.png';
import linuxCover4 from '../assets/linux_lab_4.png';
import linuxCover2 from '../assets/linux_lab_2.png';

const CATEGORY_ICONS = {
    'Sistemas': HardDrive,
    'Redes': Network,
    'Seguridad': ShieldCheck,
    'Hardware': Cpu,
    'Linux': TerminalIcon
};

const MODULE_COVERS = {
    'Linux Labs L1 — Terminal Basics': linuxCover1,
    'Linux Labs L2 — Users and Permissions': linuxCover2,
    'Linux Labs L3 — Processes and System Monitoring': linuxCover3,
    'Linux Labs L4 — File Management Commands': linuxCover4,
};

export default function LabsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [skillPaths, setSkillPaths] = useState([]);
    const [modules, setModules] = useState([]);
    const [labs, setLabs] = useState([]);

    const [selectedPath, setSelectedPath] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);

    const [loading, setLoading] = useState(true);
    const pathId = searchParams.get('path');
    const moduleId = searchParams.get('module');

    useEffect(() => {
        const fetchContext = async () => {
            setLoading(true);
            try {
                // 1. Fetch Skill Paths (Always needed)
                const pathsRes = await api.get('/labs/paths');
                setSkillPaths(pathsRes.data);

                let currentPath = null;
                if (pathId) {
                    currentPath = pathsRes.data.find(p => String(p.id) === String(pathId));
                    setSelectedPath(currentPath);
                } else {
                    setSelectedPath(null);
                    setModules([]);
                    setSelectedModule(null);
                }

                // 2. Fetch Modules if path is selected
                if (pathId) {
                    const modulesRes = await api.get(`/labs/paths/${pathId}/modules`);
                    setModules(modulesRes.data);

                    if (moduleId) {
                        const currentModule = modulesRes.data.find(m => String(m.id) === String(moduleId));
                        setSelectedModule(currentModule);

                        // 3. Fetch Labs if module is selected
                        const labsRes = await api.get(`/labs/modules/${moduleId}/labs`);
                        setLabs(labsRes.data);
                    } else {
                        setSelectedModule(null);
                        setLabs([]);
                    }
                }
            } catch (err) {
                console.error("Error fetching labs context:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchContext();
    }, [pathId, moduleId]);

    const handleSelectPath = (path) => {
        setSearchParams({ path: path.id });
    };

    const handleSelectModule = (module) => {
        setSearchParams({ path: pathId, module: module.id });
    };

    const handleBack = () => {
        if (moduleId) {
            setSearchParams({ path: pathId });
        } else if (pathId) {
            setSearchParams({});
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <header className="mb-12">
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-neon/10 border border-neon/30">
                                <TerminalIcon className="w-8 h-8 text-neon" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                                    Terminal <span className="text-neon">Skills</span>
                                </h1>
                                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">
                                    {selectedModule ? `Módulo: ${selectedModule.title}` :
                                        selectedPath ? `Ruta: ${selectedPath.title}` :
                                            "Entornos interactivos de práctica real"}
                                </p>
                            </div>
                        </div>

                        {(selectedPath || selectedModule) && (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-mono text-xs uppercase"
                            >
                                <ArrowLeft className="w-4 h-4" /> Volver
                            </button>
                        )}
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 rounded-3xl bg-white/5 border border-white/10" />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* VIEW 1: SKILL PATHS */}
                        {!selectedPath && !selectedModule && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {skillPaths.map(path => (
                                    <div
                                        key={path.id}
                                        onClick={() => handleSelectPath(path)}
                                        className="group relative bg-white/5 border border-white/10 rounded-[2rem] p-8 cursor-pointer hover:border-neon/50 transition-all overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 group-hover:scale-125 transition-all">
                                            <HardDrive className="w-20 h-20" />
                                        </div>
                                        <span className="text-neon font-mono text-[9px] uppercase tracking-[0.3em] mb-4 block">Skill Path</span>
                                        <h3 className="text-2xl font-black italic uppercase italic tracking-tighter group-hover:text-neon transition-colors mb-2">
                                            {path.title}
                                        </h3>
                                        <p className="text-slate-500 text-xs font-mono line-clamp-2 mb-6">
                                            {path.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono uppercase">
                                                <ChevronRight className="w-4 h-4 text-neon" />
                                                <span>{path.modules?.length || 0} Módulos</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-xl bg-neon/10 flex items-center justify-center text-neon group-hover:bg-neon group-hover:text-black transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* VIEW 2: MODULES (with Covers) */}
                        {selectedPath && !selectedModule && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {modules.map(module => (
                                    <div
                                        key={module.id}
                                        onClick={() => handleSelectModule(module)}
                                        className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 bg-black cursor-pointer hover:border-neon/50 transition-all duration-500 shadow-2xl"
                                    >
                                        <div className="absolute inset-0">
                                            <img
                                                src={MODULE_COVERS[module.title] || defaultCover}
                                                alt={module.title}
                                                className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 p-8">
                                            <span className="text-neon font-mono text-[10px] uppercase tracking-[0.3em] mb-2 block">Module</span>
                                            <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter group-hover:text-neon transition-colors mb-4">
                                                {module.title}
                                            </h2>
                                            <p className="text-slate-400 text-[10px] font-mono line-clamp-2 mb-6 uppercase leading-relaxed">
                                                {module.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-500 font-mono text-[9px] uppercase">
                                                    <Zap className="w-3.5 h-3.5 text-neon" />
                                                    <span>Click para ver labs</span>
                                                </div>
                                                <div className="w-10 h-10 rounded-2xl bg-neon flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* VIEW 3: LABS */}
                        {selectedModule && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {labs.map(lab => {
                                    const Icon = CATEGORY_ICONS[lab.category] || TerminalIcon;
                                    const isLocked = !lab.is_unlocked;
                                    const isCompleted = lab.is_completed;
                                    const isNext = lab.is_unlocked && !lab.is_completed;

                                    return (
                                        <div
                                            key={lab.id}
                                            onClick={() => !isLocked && navigate(`/labs/${lab.id}`)}
                                            className={`group relative glass rounded-3xl border transition-all duration-500 overflow-hidden flex flex-col h-full 
                                                ${isLocked ? 'opacity-40 grayscale border-white/5 cursor-not-allowed' :
                                                    isNext ? 'border-neon/50 shadow-[0_0_30px_rgba(198,255,51,0.1)] hover:border-neon cursor-pointer' :
                                                        'border-white/5 hover:border-neon/30 cursor-pointer'}`}
                                        >
                                            <div className="p-6 flex-1">
                                                <div className="flex items-center justify-between mb-4">
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
                                                <h3 className={`text-xl font-black mb-2 leading-tight uppercase italic tracking-tight ${isLocked ? 'text-slate-600' : 'text-white group-hover:text-neon'}`}>
                                                    {lab.title}
                                                </h3>
                                                <p className="text-slate-400 font-mono text-xs line-clamp-2 leading-relaxed mb-6">
                                                    {(lab.description || "").replace(/[#*]/g, '')}
                                                </p>
                                                <div className="flex items-center gap-4 mt-auto">
                                                    <div className="flex items-center gap-1.5">
                                                        <Zap className={`w-3.5 h-3.5 ${isLocked ? 'text-slate-700' : 'text-neon'}`} />
                                                        <span className="text-[10px] font-mono text-slate-500 uppercase">{lab.xp_reward} XP</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`p-4 border-t transition-all flex items-center justify-between ${isLocked ? 'bg-black/20 border-white/5' : 'bg-white/[0.02] border-white/5 group-hover:bg-neon/5'}`}>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isLocked ? 'text-slate-700' : 'text-slate-500 group-hover:text-white'}`}>
                                                    {isLocked ? 'Bloqueado' : isCompleted ? 'Repetir Práctica' : 'Iniciar Práctica'}
                                                </span>
                                                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${isLocked ? 'bg-black/10 border-white/5' : 'bg-black/40 border-white/10 group-hover:bg-neon'}`}>
                                                    {isLocked ? <Lock className="w-3.5 h-3.5 text-slate-700" /> : <Play className="w-3.5 h-3.5 text-white group-hover:text-black" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {!loading && skillPaths.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-96 glass rounded-4xl border border-white/5">
                        <Search className="w-12 h-12 text-slate-700 mb-4" />
                        <h3 className="text-xl font-black uppercase italic text-slate-500">No se encontraron rutas de aprendizaje</h3>
                    </div>
                )}
            </main>
        </div>
    );
}
