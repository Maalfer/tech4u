import { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    FlaskConical,
    Layers,
    Code,
    FileText,
    Terminal,
    ChevronRight,
    CheckCircle,
    AlertTriangle,
    Eye,
    EyeOff,
    FolderPlus,
    FilePlus,
    Command,
    ArrowLeft,
    Settings,
    MoreHorizontal,
    Box,
    Layout,
    Shield,
    ShieldOff,
    Info,
    HelpCircle,
    Activity,
    Zap,
    Globe,
    Lock,
    Unlock
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

// Helper for tooltips/help text
const HelpText = ({ children }) => (
    <div className="flex items-start gap-2 mt-1.5 px-1">
        <Info className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-slate-500 font-mono leading-relaxed italic">{children}</p>
    </div>
);

export default function AdminLabs() {
    // Navigation State
    const [view, setView] = useState('paths'); // paths | modules | labs
    const [selectedPath, setSelectedPath] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);

    // Data State
    const [paths, setPaths] = useState([]);
    const [modules, setModules] = useState([]);
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isPathModalOpen, setIsPathModalOpen] = useState(false);
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);

    // Editing Models
    const [editingPath, setEditingPath] = useState(null);
    const [editingModule, setEditingModule] = useState(null);

    const { addNotification } = useNotification();

    // Delete confirm dialog state
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: null, id: null, title: '' });

    // Form States
    const [pathForm, setPathForm] = useState({ title: '', description: '', difficulty: 'easy', order_index: 0, is_active: true });
    const [moduleForm, setModuleForm] = useState({ title: '', description: '', order_index: 0, requires_validation: true, is_active: true });
    const [labForm, setLabForm] = useState(null); // Will be rebuilt from scratch


    useEffect(() => {
        fetchPaths();
    }, []);

    // --- FETCHING ---

    const fetchPaths = async () => {
        setLoading(true);
        try {
            const res = await api.get('/labs/paths');
            setPaths(res.data);
        } catch (err) {
            addNotification({ title: 'Error', description: 'Error al cargar rutas', type: 'error' });
        } finally { setLoading(false); }
    };

    const fetchModules = async (pathId) => {
        setLoading(true);
        try {
            const res = await api.get(`/labs/paths/${pathId}/modules`);
            setModules(res.data);
        } catch (err) {
            addNotification({ title: 'Error', description: 'Error al cargar módulos', type: 'error' });
        } finally { setLoading(false); }
    };

    const fetchLabs = async (moduleId) => {
        setLoading(true);
        try {
            const res = await api.get(`/labs/modules/${moduleId}/labs`);
            setLabs(res.data);
        } catch (err) {
            addNotification({ title: 'Error', description: 'Error al cargar laboratorios', type: 'error' });
        } finally { setLoading(false); }
    };

    // --- CRUD ACTIONS ---

    const handleSavePath = async (e) => {
        e.preventDefault();
        try {
            if (editingPath) await api.put(`/labs/admin/paths/${editingPath.id}`, pathForm);
            else await api.post('/labs/admin/paths', pathForm);
            addNotification({ title: 'Sincronizado', description: 'Ruta guardada correctamente', type: 'success' });
            setIsPathModalOpen(false);
            fetchPaths();
        } catch (err) {
            (import.meta.env.DEV && console.error)(err);
            addNotification({ title: 'Error', description: 'Fallo al guardar ruta', type: 'error' });
        }
    };

    const handleSaveModule = async (e) => {
        e.preventDefault();
        const payload = { ...moduleForm, skill_path_id: selectedPath.id };
        try {
            if (editingModule) await api.put(`/labs/admin/modules/${editingModule.id}`, payload);
            else await api.post('/labs/admin/modules', payload);
            addNotification({ title: 'Sincronizado', description: 'Módulo guardado correctamente', type: 'success' });
            setIsModuleModalOpen(false);
            fetchModules(selectedPath.id);
        } catch (err) {
            (import.meta.env.DEV && console.error)(err);
            addNotification({ title: 'Error', description: 'Fallo al guardar módulo', type: 'error' });
        }
    };


    const handleDeletePath = (id, title) => {
        setDeleteConfirm({ show: true, type: 'path', id, title: title || `Path #${id}` });
    };

    const handleDeleteModule = (id, title) => {
        setDeleteConfirm({ show: true, type: 'module', id, title: title || `Módulo #${id}` });
    };

    const handleDeleteLab = (id, title) => {
        setDeleteConfirm({ show: true, type: 'lab', id, title: title || `Lab #${id}` });
    };

    const confirmDelete = async () => {
        const { type, id } = deleteConfirm;
        setDeleteConfirm({ show: false, type: null, id: null, title: '' });
        try {
            if (type === 'path') {
                await api.delete(`/labs/admin/paths/${id}`);
                addNotification({ title: 'Eliminado', description: 'Ruta eliminada completamente', type: 'info' });
                fetchPaths();
                setView('paths'); setSelectedPath(null); setSelectedModule(null);
            } else if (type === 'module') {
                await api.delete(`/labs/admin/modules/${id}`);
                addNotification({ title: 'Eliminado', description: 'Módulo eliminado completamente', type: 'info' });
                fetchModules(selectedPath.id);
                setView('modules'); setSelectedModule(null);
            } else if (type === 'lab') {
                await api.delete(`/labs/${id}`);
                addNotification({ title: 'Borrado', description: 'Laboratorio eliminado', type: 'info' });
                fetchLabs(selectedModule.id);
            }
        } catch (err) {
            addNotification({ title: 'Error', description: 'Fallo al eliminar', type: 'error' });
        }
    };

    // --- MODAL POPULATORS ---

    const openPathModal = (path = null) => {
        if (path) {
            setEditingPath(path);
            setPathForm({ title: path.title, description: path.description || '', difficulty: path.difficulty || 'easy', order_index: path.order_index || 0, is_active: path.is_active });
        } else {
            setEditingPath(null);
            setPathForm({ title: '', description: '', difficulty: 'easy', order_index: paths.length, is_active: true });
        }
        setIsPathModalOpen(true);
    };

    const openModuleModal = (mod = null) => {
        if (mod) {
            setEditingModule(mod);
            setModuleForm({ title: mod.title, description: mod.description || '', order_index: mod.order_index || 0, requires_validation: mod.requires_validation, is_active: mod.is_active });
        } else {
            setEditingModule(null);
            setModuleForm({ title: '', description: '', order_index: modules.length, requires_validation: true, is_active: true });
        }
        setIsModuleModalOpen(true);
    };


    // --- QUICK TOGGLES ---

    const togglePathActive = async (e, path) => {
        e.stopPropagation();
        try {
            await api.patch(`/labs/admin/paths/${path.id}/toggle`);
            fetchPaths();
            addNotification({ title: 'Visibilidad', description: `${path.title} ${path.is_active ? 'oculto' : 'visible'}`, type: 'info' });
        } catch (e) { addNotification({ title: 'Error', description: 'Fallo al cambiar visibilidad', type: 'error' }); }
    };

    const toggleModuleActive = async (e, mod) => {
        e.stopPropagation();
        try {
            await api.patch(`/labs/admin/modules/${mod.id}/toggle-visibility`);
            fetchModules(selectedPath.id);
            addNotification({ title: 'Visibilidad', description: `${mod.title} ${mod.is_active ? 'oculto' : 'visible'}`, type: 'info' });
        } catch (e) { addNotification({ title: 'Error', description: 'Fallo al cambiar visibilidad', type: 'error' }); }
    };

    const toggleLabActive = async (e, lab) => {
        e.stopPropagation();
        try {
            await api.patch(`/labs/${lab.id}/toggle`);
            fetchLabs(selectedModule.id);
            addNotification({ title: 'Visibilidad', description: `${lab.title} ${lab.is_active ? 'oculto' : 'visible'}`, type: 'info' });
        } catch (e) { addNotification({ title: 'Error', description: 'Fallo al cambiar visibilidad', type: 'error' }); }
    };

    const handlePathClick = (path) => {
        setSelectedPath(path);
        setView('modules');
        fetchModules(path.id);
    };

    const handleModuleClick = (mod) => {
        setSelectedModule(mod);
        setView('labs');
        fetchLabs(mod.id);
    };

    // Visual Helpers

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 min-h-screen bg-[#060606] text-slate-200">
            {/* Nav & Header */}
            <div className="space-y-6">
                <nav className="flex items-center gap-3 text-[11px] font-black font-mono text-slate-500 tracking-widest uppercase">
                    <span onClick={() => { setView('paths'); setSelectedPath(null); setSelectedModule(null); fetchPaths(); }} className="hover:text-neon cursor-pointer transition-colors flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Academy</span>
                    {selectedPath && <><ChevronRight className="w-3.5 h-3.5" /> <span onClick={() => { setView('modules'); setSelectedModule(null); fetchModules(selectedPath.id); }} className="hover:text-neon cursor-pointer transition-colors">{selectedPath.title}</span></>}
                    {selectedModule && <><ChevronRight className="w-3.5 h-3.5" /> <span className="text-neon">{selectedModule.title}</span></>}
                </nav>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-neon/10 blur-[100px] -mr-40 -mt-40 rounded-full" />
                    <div className="relative space-y-3">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-neon/10 rounded-3xl border border-neon/20 shadow-[0_0_20px_rgba(198,255,51,0.1)]">
                                <FlaskConical className="w-10 h-10 text-neon" />
                            </div>
                            <h1 className="text-5xl font-black italic uppercase italic tracking-tighter leading-none">
                                Labs <span className="text-neon">Manager</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 font-mono text-xs max-w-xl pl-1">
                            {view === 'paths' ? 'Panel central de rutas de aprendizaje y currículum técnico.' :
                                view === 'modules' ? `Configurando módulos estructurales para ${selectedPath.title}.` :
                                    `Arquitectura de laboratorios terminales para ${selectedModule.title}.`}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        {view !== 'paths' && (
                            <button onClick={() => { if (view === 'labs') { setView('modules'); setSelectedModule(null); } else { setView('paths'); setSelectedPath(null); } }} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                        )}
                        <button
                            onClick={() => { if (view === 'paths') openPathModal(); else if (view === 'modules') openModuleModal(); }}
                            className={`flex items-center gap-4 px-10 py-5 bg-neon text-black font-black font-mono rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_40px_rgba(198,255,51,0.2)] ${view === 'labs' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={view === 'labs'}
                        >
                            <Plus className="w-6 h-6" />
                            <span>{view === 'paths' ? 'NUEVA RUTA' : view === 'modules' ? 'NUEVO MÓDULO' : 'EDITOR DESACTIVADO'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-32 text-center font-mono text-neon flex flex-col items-center gap-6">
                    <div className="relative">
                        <Terminal className="w-16 h-16 animate-pulse" />
                        <div className="absolute inset-0 bg-neon/20 blur-xl animate-ping rounded-full" />
                    </div>
                    <span className="text-sm tracking-[0.5em] font-black uppercase">Cargando Matrix...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-12 duration-700">

                    {/* PATHS */}
                    {view === 'paths' && paths.map(p => (
                        <div key={p.id} className={`group relative glass rounded-[2.5rem] p-10 border hover:border-neon/40 transition-all cursor-pointer overflow-hidden flex flex-col h-full bg-white/[0.01] ${!p.is_active ? 'opacity-50 grayscale' : 'border-white/5'}`}>
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-neon font-mono text-[10px] uppercase font-black tracking-[0.4em]">Skill Path</span>
                                <div className="flex gap-2">
                                    <button onClick={(e) => togglePathActive(e, p)} className={`p-2 rounded-xl transition-all ${p.is_active ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                        {p.is_active ? <Eye className="w-4.5 h-4.5" /> : <EyeOff className="w-4.5 h-4.5" />}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); openPathModal(p); }} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white"><Edit2 className="w-4.5 h-4.5" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeletePath(p.id, p.title); }} className="p-2 bg-red-500/5 rounded-xl text-red-400 hover:bg-red-500/20 transition-all"><Trash2 className="w-4.5 h-4.5" /></button>
                                </div>
                            </div>
                            <h3 className="text-3xl font-black italic uppercase italic tracking-tighter mb-4 group-hover:text-neon transition-colors leading-tight">{p.title}</h3>
                            <p className="text-slate-500 text-[11px] font-mono line-clamp-3 mb-10 leading-relaxed italic">{p.description}</p>

                            <div className="mt-auto">
                                <button onClick={() => handlePathClick(p)} className="w-full py-4 rounded-2xl bg-neon/5 text-neon font-black font-mono text-[11px] uppercase border border-neon/20 group-hover:bg-neon group-hover:text-black transition-all flex items-center justify-center gap-2">
                                    Configurar Módulos <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* MODULES */}
                    {view === 'modules' && modules.map(m => (
                        <div key={m.id} className={`group relative glass rounded-[2.5rem] p-10 border hover:border-indigo-400/40 transition-all cursor-pointer overflow-hidden flex flex-col h-full bg-white/[0.01] ${!m.is_active ? 'opacity-50 grayscale' : 'border-white/5'}`}>
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-indigo-400 font-mono text-[10px] uppercase font-black tracking-[0.4em]">Modulo</span>
                                <div className="flex gap-2">
                                    <div className={`p-2 rounded-xl ${m.requires_validation ? 'text-emerald-400 bg-emerald-400/5' : 'text-slate-600 bg-white/5'}`}>
                                        {m.requires_validation ? <Shield className="w-4.5 h-4.5" /> : <ShieldOff className="w-4.5 h-4.5" />}
                                    </div>
                                    <button onClick={(e) => toggleModuleActive(e, m)} className={`p-2 rounded-xl transition-all ${m.is_active ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                        {m.is_active ? <Eye className="w-4.5 h-4.5" /> : <EyeOff className="w-4.5 h-4.5" />}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); openModuleModal(m); }} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white"><Edit2 className="w-4.5 h-4.5" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(m.id, m.title); }} className="p-2 bg-red-500/5 rounded-xl text-red-400 hover:bg-red-500/20 transition-all"><Trash2 className="w-4.5 h-4.5" /></button>
                                </div>
                            </div>
                            <h3 className="text-3xl font-black italic uppercase italic tracking-tighter mb-4 group-hover:text-indigo-400 transition-colors leading-tight">{m.title}</h3>
                            <p className="text-slate-500 text-[11px] font-mono line-clamp-3 mb-10 leading-relaxed italic">{m.description || 'Sin descripción técnica disponible.'}</p>

                            <div className="mt-auto">
                                <button onClick={() => handleModuleClick(m)} className="w-full py-4 rounded-2xl bg-indigo-500/5 text-indigo-400 font-black font-mono text-[11px] uppercase border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all flex items-center justify-center gap-2">
                                    Configurar Labs <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* LABS */}
                    {view === 'labs' && labs.map(l => (
                        <div key={l.id} className={`group relative glass rounded-[2rem] p-8 border hover:border-neon/40 transition-all bg-white/[0.01] flex flex-col h-full ${!l.is_active ? 'opacity-50 grayscale' : 'border-white/5'}`}>
                            <div className="flex items-center justify-between mb-5">
                                <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase border tracking-tighter ${l.difficulty === 'easy' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' : 'text-amber-400 border-amber-400/20 bg-amber-400/10'}`}>{l.difficulty}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => toggleLabActive(e, l)} className={`p-2 rounded-lg transition-all ${l.is_active ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>{l.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteLab(l.id, l.title); }} className="p-2 bg-red-500/5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <h4 className="text-xl font-black uppercase italic tracking-tighter mb-3 group-hover:text-neon transition-colors">{l.title}</h4>
                            <div className="mt-auto pt-6 flex items-center gap-4 text-[11px] font-mono text-slate-500">
                                <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-neon" /> {l.xp_reward} XP</div>
                                <div className="flex items-center gap-1.5"><Activity className={`w-3.5 h-3.5 ${l.is_active ? 'text-emerald-400' : 'text-red-400'}`} /> {l.is_active ? 'LIVE' : 'DOWN'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- PATH MODAL --- */}
            {isPathModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in zoom-in-95 duration-200">
                    <div className="bg-[#0b0b0b] border border-white/10 rounded-[3rem] w-full max-w-xl p-10 shadow-2xl space-y-8">
                        <div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Path <span className="text-neon">Architect</span></h2>
                            <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mt-1">Configuración técnica de Ruta</p>
                        </div>
                        <form onSubmit={handleSavePath} className="space-y-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[11px] font-black text-slate-500 uppercase font-mono mb-2 block">Nombre de la Ruta</label>
                                    <input value={pathForm.title} onChange={e => setPathForm({ ...pathForm, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-mono text-white focus:border-neon outline-none" required placeholder="Ej: Fundamentos de Linux" />
                                    <HelpText>El nombre público que verán los estudiantes en el catálogo.</HelpText>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-500 uppercase font-mono mb-2 block">Descripción Detallada</label>
                                    <textarea value={pathForm.description} onChange={e => setPathForm({ ...pathForm, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-mono text-white h-32 focus:border-neon outline-none resize-none" placeholder="Breve introducción técnica..." />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-500 uppercase font-mono mb-2 block">Dificultad</label>
                                        <select value={pathForm.difficulty} onChange={e => setPathForm({ ...pathForm, difficulty: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-white focus:border-neon outline-none">
                                            <option value="easy">Fácil</option>
                                            <option value="medium">Intermedio</option>
                                            <option value="hard">Difícil</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-slate-500 uppercase font-mono mb-2 block">Orden</label>
                                        <input type="number" value={pathForm.order_index} onChange={e => setPathForm({ ...pathForm, order_index: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-white focus:border-neon outline-none" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                                    <div>
                                        <span className="text-[11px] font-black text-white uppercase block mb-1">Visibilidad Pública</span>
                                        <span className="text-[9px] text-slate-500 font-mono italic">Determina si la ruta aparece en la academia.</span>
                                    </div>
                                    <button type="button" onClick={() => setPathForm({ ...pathForm, is_active: !pathForm.is_active })} className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all ${pathForm.is_active ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 'border-red-500/30 text-red-400 bg-red-500/5'}`}>
                                        {pathForm.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        <span className="text-[11px] font-black uppercase font-mono">{pathForm.is_active ? 'Visible' : 'Oculto'}</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                                <button type="button" onClick={() => setIsPathModalOpen(false)} className="px-8 py-3 text-[11px] font-mono text-slate-500 uppercase font-black hover:text-white transition-colors">Cancelar</button>
                                <button className="px-10 py-4 bg-neon text-black font-black font-mono rounded-2xl text-[11px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(198,255,51,0.2)]">GUARDAR RUTA</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODULE MODAL --- */}
            {isModuleModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in zoom-in-95 duration-200">
                    <div className="bg-[#0b0b0b] border border-white/10 rounded-[3rem] w-full max-w-xl p-10 shadow-2xl space-y-8">
                        <div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Module <span className="text-indigo-400">Config</span></h2>
                            <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mt-1">Nivel ESTRUCTURAL del CURRÍCULUM</p>
                        </div>
                        <form onSubmit={handleSaveModule} className="space-y-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[11px] font-black text-slate-500 uppercase font-mono mb-2 block">Título del Módulo</label>
                                    <input value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-mono text-white focus:border-indigo-400 outline-none" required placeholder="L1 — Navegación del Sistema" />
                                    <HelpText>Los módulos agrupan laboratorios similares en una secuencia lógica.</HelpText>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-500 uppercase font-mono mb-2 block">Contexto del Módulo</label>
                                    <textarea value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-mono text-white h-32 focus:border-indigo-400 outline-none resize-none" placeholder="Propósito educativo de este módulo..." />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-500 uppercase font-mono mb-2 block">Orden de Aparición</label>
                                    <input type="number" value={moduleForm.order_index} onChange={e => setModuleForm({ ...moduleForm, order_index: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-white focus:border-indigo-400 outline-none" />
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <div>
                                            <span className="text-[11px] font-black text-white uppercase block mb-1">Motor de Validación</span>
                                            <span className="text-[9px] text-slate-500 font-mono italic">¿Requiere que los alumnos pasen retos técnicos?</span>
                                        </div>
                                        <button type="button" onClick={() => setModuleForm({ ...moduleForm, requires_validation: !moduleForm.requires_validation })} className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all ${moduleForm.requires_validation ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 'border-slate-500/30 text-slate-500 bg-slate-500/5'}`}>
                                            {moduleForm.requires_validation ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                                            <span className="text-[11px] font-black uppercase font-mono">{moduleForm.requires_validation ? 'ACTIVA' : 'DESACTIVADA'}</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <div>
                                            <span className="text-[11px] font-black text-white uppercase block mb-1">Estado de Despliegue</span>
                                            <span className="text-[9px] text-slate-500 font-mono italic">Visibilidad de este módulo y sus labs.</span>
                                        </div>
                                        <button type="button" onClick={() => setModuleForm({ ...moduleForm, is_active: !moduleForm.is_active })} className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all ${moduleForm.is_active ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 'border-red-500/30 text-red-400 bg-red-500/5'}`}>
                                            {moduleForm.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            <span className="text-[11px] font-black uppercase font-mono">{moduleForm.is_active ? 'VISIBLE' : 'OCULTO'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                                <button type="button" onClick={() => setIsModuleModalOpen(false)} className="px-8 py-3 text-[11px] font-mono text-slate-500 uppercase font-black hover:text-white transition-colors">Cancelar</button>
                                <button className="px-10 py-4 bg-indigo-500 text-white font-black font-mono rounded-2xl text-[11px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]">SINCRONIZAR MÓDULO</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- LAB MODAL (PREMIUM) --- */}

            {/* Delete Confirm Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-200">
                    <div className="bg-[#0A0A0A] border border-red-500/30 rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                                    Eliminar {deleteConfirm.type === 'path' ? 'Ruta' : deleteConfirm.type === 'module' ? 'Módulo' : 'Lab'}
                                </h3>
                                <p className="text-[10px] font-mono text-slate-500 mt-1">Esta acción no se puede deshacer</p>
                            </div>
                        </div>
                        <p className="text-slate-300 font-mono text-sm leading-relaxed">
                            ¿Confirmas eliminar <span className="text-red-400 font-black">"{deleteConfirm.title}"</span>?
                            {deleteConfirm.type === 'path' && ' Se eliminarán todos sus módulos y laboratorios.'}
                            {deleteConfirm.type === 'module' && ' Se eliminarán todos sus laboratorios y retos.'}
                            {deleteConfirm.type === 'lab' && ' Se eliminarán también todos sus retos.'}
                        </p>
                        <div className="flex gap-4 pt-4 border-t border-white/5">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, type: null, id: null, title: '' })}
                                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-[11px] hover:bg-white/10 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black uppercase text-[11px] hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
