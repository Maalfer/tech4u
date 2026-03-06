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
    const [isLabModalOpen, setIsLabModalOpen] = useState(false);
    const [isPathModalOpen, setIsPathModalOpen] = useState(false);
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);

    // Editing Models
    const [editingLab, setEditingLab] = useState(null);
    const [editingPath, setEditingPath] = useState(null);
    const [editingModule, setEditingModule] = useState(null);

    const [activeTab, setActiveTab] = useState('basic');
    const { addNotification } = useNotification();

    // Form States
    const [pathForm, setPathForm] = useState({ title: '', description: '', difficulty: 'easy', order_index: 0, is_active: true });
    const [moduleForm, setModuleForm] = useState({ title: '', description: '', order_index: 0, requires_validation: true, is_active: true });
    const [labForm, setLabForm] = useState({
        title: '',
        description: '',
        category: 'Linux',
        difficulty: 'medium',
        xp_reward: 150,
        time_limit: 30,
        docker_image: 'ubuntu:22.04',
        goal_description: '',
        step_by_step_guide: '',
        is_active: true,
        scenario_setup: '',
        validation_rules: '',
        order_index: 0,
        module_id: null
    });

    // Visual states for scenario
    const [directories, setDirectories] = useState([]);
    const [files, setFiles] = useState([]);
    const [setupCommands, setSetupCommands] = useState([]);
    const [challenges, setChallenges] = useState([]);

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
            console.error(err);
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
            console.error(err);
            addNotification({ title: 'Error', description: 'Fallo al guardar módulo', type: 'error' });
        }
    };

    const handleSaveLab = async (e) => {
        e.preventDefault();
        const scenario_setup = JSON.stringify({ directories, files, commands: setupCommands });
        const validation_rules = JSON.stringify({ challenges });
        const payload = { ...labForm, scenario_setup, validation_rules, module_id: selectedModule.id };

        try {
            if (editingLab) {
                await api.put(`/labs/${editingLab.id}`, payload);
                addNotification({ title: 'Éxito', description: 'Lab actualizado', type: 'success' });
            } else {
                const res = await api.post('/labs/', payload);
                setEditingLab(res.data);
                addNotification({ title: 'Creado', description: 'Nuevo Lab desplegado', type: 'success' });
            }
            fetchLabs(selectedModule.id);
        } catch (err) {
            console.error(err);
            addNotification({ title: 'Error', description: 'Fallo al guardar laboratorio', type: 'error' });
        }
    };

    const handleDeleteLab = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este laboratorio permanentemente?')) return;
        try {
            await api.delete(`/labs/${id}`);
            addNotification({ title: 'Borrado', description: 'Laboratorio eliminado', type: 'info' });
            fetchLabs(selectedModule.id);
        } catch (err) { addNotification({ title: 'Error', description: 'Fallo al eliminar', type: 'error' }); }
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

    const openLabModal = (lab = null) => {
        setActiveTab('basic');
        if (lab) {
            setEditingLab(lab);
            setLabForm({
                title: lab.title,
                description: lab.description || '',
                category: lab.category || 'Linux',
                difficulty: lab.difficulty || 'medium',
                xp_reward: lab.xp_reward || 150,
                time_limit: lab.time_limit || 30,
                docker_image: lab.docker_image || 'ubuntu:22.04',
                goal_description: lab.goal_description || '',
                step_by_step_guide: lab.step_by_step_guide || '',
                is_active: lab.is_active,
                scenario_setup: lab.scenario_setup || '{}',
                validation_rules: lab.validation_rules || '{"challenges":[]}',
                order_index: lab.order_index || 0,
                module_id: lab.module_id || selectedModule.id
            });
            try {
                const setup = JSON.parse(lab.scenario_setup || '{}');
                setDirectories(setup.directories || []);
                setFiles(setup.files || []);
                setSetupCommands(setup.commands || []);
                const rules = JSON.parse(lab.validation_rules || '{"challenges":[]}');
                setChallenges(rules.challenges || []);
            } catch (e) { console.error(e); }
        } else {
            setEditingLab(null);
            setLabForm({
                title: '',
                description: '',
                category: 'Linux',
                difficulty: 'medium',
                xp_reward: 150,
                time_limit: 30,
                docker_image: 'ubuntu:22.04',
                goal_description: '',
                step_by_step_guide: '',
                is_active: true,
                scenario_setup: '',
                validation_rules: '',
                order_index: labs.length,
                module_id: selectedModule.id
            });
            setDirectories([]); setFiles([]); setSetupCommands([]); setChallenges([]);
        }
        setIsLabModalOpen(true);
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
    const addDirectory = () => setDirectories([...directories, ""]);
    const updateDirectory = (i, v) => { const n = [...directories]; n[i] = v; setDirectories(n); };
    const removeDirectory = (i) => setDirectories(directories.filter((_, idx) => idx !== i));
    const addFile = () => setFiles([...files, { path: "", content: "" }]);
    const updateFile = (i, k, v) => { const n = [...files]; n[i][k] = v; setFiles(n); };
    const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));
    const addCmd = () => setSetupCommands([...setupCommands, ""]);
    const updateCmd = (i, v) => { const n = [...setupCommands]; n[i] = v; setSetupCommands(n); };
    const removeCmd = (i) => setSetupCommands(setupCommands.filter((_, idx) => idx !== i));
    const addChallenge = () => setChallenges([...challenges, { title: "", description: "", rules: [] }]);
    const updateChallenge = (i, k, v) => { const n = [...challenges]; n[i][k] = v; setChallenges(n); };
    const removeChallenge = (i) => setChallenges(challenges.filter((_, idx) => idx !== i));
    const addRule = (cI) => { const n = [...challenges]; n[cI].rules = [...n[cI].rules, { command: "", expected: "" }]; setChallenges(n); };
    const updateRule = (cI, rI, k, v) => { const n = [...challenges]; n[cI].rules[rI][k] = v; setChallenges(n); };
    const removeRule = (cI, rI) => { const n = [...challenges]; n[cI].rules = n[cI].rules.filter((_, idx) => idx !== rI); setChallenges(n); };

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
                            onClick={() => { if (view === 'paths') openPathModal(); else if (view === 'modules') openModuleModal(); else openLabModal(); }}
                            className="flex items-center gap-4 px-10 py-5 bg-neon text-black font-black font-mono rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_40px_rgba(198,255,51,0.2)]"
                        >
                            <Plus className="w-6 h-6" />
                            <span>{view === 'paths' ? 'NUEVA RUTA' : view === 'modules' ? 'NUEVO MÓDULO' : 'NUEVO LAB'}</span>
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
                                    <button onClick={() => openLabModal(l)} className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteLab(l.id)} className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
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
            {isLabModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-[3.5rem] w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,1)]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-10 border-b border-white/5 bg-white/[0.01]">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-neon/10 rounded-2xl border border-neon/30">
                                    <Terminal className="w-8 h-8 text-neon" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black italic uppercase italic tracking-widest">{editingLab ? 'Update' : 'Architect'} <span className="text-neon">Lab</span></h2>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                        <Settings className="w-3.5 h-3.5" /> Core System Integration Protocol v5.1
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsLabModalOpen(false)} className="p-4 rounded-full bg-white/5 text-slate-500 hover:text-white hover:rotate-90 transition-all duration-300"><X className="w-8 h-8" /></button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-10 border-b border-white/5 bg-white/[0.005]">
                            {[
                                { id: 'basic', icon: FileText, label: 'Datos Base' },
                                { id: 'guide', icon: Eye, label: 'Contenido (Guías)' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-10 py-6 font-mono text-[11px] uppercase font-black tracking-widest transition-all relative ${activeTab === tab.id ? 'text-neon shadow-[inset_0_-2px_0_#c6ff33]' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <tab.icon className="w-4.5 h-4.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                            <form id="lab-form" onSubmit={handleSaveLab}>
                                {activeTab === 'basic' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in slide-in-from-bottom-6">
                                        <div className="space-y-8">
                                            <div>
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block font-mono">Título de la Misión</label>
                                                <input type="text" required value={labForm.title} onChange={e => setLabForm({ ...labForm, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-mono text-sm focus:border-neon outline-none" />
                                                <HelpText>El nombre del laboratorio que aparecerá en la lista de ejercicios.</HelpText>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block font-mono">Sinopsis Técnica (Short Desc)</label>
                                                <textarea value={labForm.description} onChange={e => setLabForm({ ...labForm, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-mono text-sm h-32 focus:border-neon outline-none resize-none" />
                                                <HelpText>Un resumen muy corto del objetivo (aparece en las cards).</HelpText>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block font-mono">Dificultad</label>
                                                    <select value={labForm.difficulty} onChange={e => setLabForm({ ...labForm, difficulty: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-mono text-xs focus:border-neon outline-none">
                                                        <option value="easy">Fácil</option>
                                                        <option value="medium">Intermedio</option>
                                                        <option value="hard">Difícil</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block font-mono">XP de Recompensa</label>
                                                    <input type="number" value={labForm.xp_reward} onChange={e => setLabForm({ ...labForm, xp_reward: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-mono text-sm focus:border-neon outline-none" />
                                                </div>
                                                <div>
                                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block font-mono">Orden (Index)</label>
                                                    <input type="number" value={labForm.order_index} onChange={e => setLabForm({ ...labForm, order_index: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-mono text-sm focus:border-neon outline-none" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block font-mono">ID de Módulo</label>
                                                    <input type="number" value={labForm.module_id} onChange={e => setLabForm({ ...labForm, module_id: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-mono text-sm focus:border-neon outline-none" />
                                                </div>
                                                <div>
                                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block font-mono">Categoría</label>
                                                    <input type="text" value={labForm.category} onChange={e => setLabForm({ ...labForm, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-mono text-sm focus:border-neon outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <div>
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block font-mono">Imagen Base (Docker)</label>
                                                <input type="text" value={labForm.docker_image} onChange={e => setLabForm({ ...labForm, docker_image: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-mono text-sm focus:border-neon outline-none" />
                                                <HelpText>El contenedor que se iniciará (por defecto ubuntu:22.04).</HelpText>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block font-mono">Límite de Tiempo (minutos)</label>
                                                <input type="number" value={labForm.time_limit} onChange={e => setLabForm({ ...labForm, time_limit: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-mono text-sm focus:border-neon outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block font-mono">Estado del Sistema</label>
                                                <div className="flex p-2 bg-black/40 rounded-3xl border border-white/10">
                                                    <button type="button" onClick={() => setLabForm({ ...labForm, is_active: true })} className={`flex-1 py-4 rounded-2xl font-black font-mono text-[11px] uppercase transition-all flex items-center justify-center gap-2 ${labForm.is_active ? 'bg-neon text-black shadow-lg shadow-neon/10' : 'text-slate-500'}`}><Zap className="w-4 h-4" /> Activo (Live)</button>
                                                    <button type="button" onClick={() => setLabForm({ ...labForm, is_active: false })} className={`flex-1 py-4 rounded-2xl font-black font-mono text-[11px] uppercase transition-all flex items-center justify-center gap-2 ${!labForm.is_active ? 'bg-red-500 text-white shadow-lg shadow-red-500/10' : 'text-slate-500'}`}><EyeOff className="w-4 h-4" /> Inactivo</button>
                                                </div>
                                                <HelpText>Si está inactivo, el lab no será accesible para alumnos.</HelpText>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'scenario' && (
                                    <div className="space-y-16 animate-in slide-in-from-bottom-6">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                <h3 className="text-white font-black font-mono text-sm uppercase tracking-[0.3em] flex items-center gap-3 text-indigo-400"><FolderPlus className="w-5 h-5" /> Inyección de Directorios</h3>
                                                <button type="button" onClick={addDirectory} className="px-5 py-2 rounded-xl bg-indigo-400/10 text-indigo-400 text-[10px] font-black uppercase hover:bg-indigo-400 hover:text-white transition-all">+ Añadir Directorio</button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {directories.map((dir, i) => (
                                                    <div key={i} className="flex gap-3 group/item">
                                                        <div className="bg-white/5 border border-white/10 rounded-2xl flex-1 flex items-center px-6 py-4 focus-within:border-indigo-400 transition-all">
                                                            <span className="text-slate-500 font-mono text-xs mr-3">mkdir -p</span>
                                                            <input value={dir} onChange={e => updateDirectory(i, e.target.value)} className="bg-transparent border-none text-xs font-mono text-white outline-none w-full" placeholder="/home/student/workspace" />
                                                        </div>
                                                        <button type="button" onClick={() => removeDirectory(i)} className="p-4 text-slate-500 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                                    </div>
                                                ))}
                                                {directories.length === 0 && <p className="col-span-2 text-center py-8 text-slate-600 font-mono text-[10px] italic border-2 border-dashed border-white/5 rounded-3xl">Sin inyecciones de directorios configuradas.</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                <h3 className="text-white font-black font-mono text-sm uppercase tracking-[0.3em] flex items-center gap-3 text-emerald-400"><FilePlus className="w-5 h-5" /> Datos: Archivos Iniciales</h3>
                                                <button type="button" onClick={addFile} className="px-5 py-2 rounded-xl bg-emerald-400/10 text-emerald-400 text-[10px] font-black uppercase hover:bg-emerald-400 hover:text-white transition-all">+ Crear Archivo</button>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {files.map((file, i) => (
                                                    <div key={i} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 space-y-5 relative group">
                                                        <button type="button" onClick={() => removeFile(i)} className="absolute top-6 right-6 text-slate-600 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                                        <div>
                                                            <label className="text-[10px] text-slate-500 font-mono uppercase font-black block mb-2">Ruta Absoluta</label>
                                                            <input value={file.path} onChange={e => updateFile(i, 'path', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-xs font-mono text-emerald-400 focus:border-emerald-400 outline-none" placeholder="/etc/config.conf" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-slate-500 font-mono uppercase font-black block mb-2">Contenido de Datos</label>
                                                            <textarea value={file.content} onChange={e => updateFile(i, 'content', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 h-40 text-[11px] font-mono text-white resize-none outline-none focus:border-emerald-400" placeholder="KEY=VALUE..." />
                                                        </div>
                                                    </div>
                                                ))}
                                                {files.length === 0 && <p className="col-span-2 text-center py-8 text-slate-600 font-mono text-[10px] italic border-2 border-dashed border-white/5 rounded-3xl">No hay archivos en el sandbox inicial.</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                <h3 className="text-white font-black font-mono text-sm uppercase tracking-[0.3em] flex items-center gap-3 text-amber-400"><Command className="w-5 h-5" /> Scripting: Comandos Setup</h3>
                                                <button type="button" onClick={addCmd} className="px-5 py-2 rounded-xl bg-amber-400/10 text-amber-400 text-[10px] font-black uppercase hover:bg-amber-400 hover:text-white transition-all">+ Inyectar Comando</button>
                                            </div>
                                            <div className="space-y-4">
                                                {setupCommands.map((cmd, i) => (
                                                    <div key={i} className="flex gap-4 group/cmd">
                                                        <div className="bg-black border border-white/10 rounded-2xl flex-1 flex items-center px-6 py-4 font-mono text-xs focus-within:border-amber-400 transition-all">
                                                            <span className="text-amber-400 font-black mr-4 font-mono">ROOT#</span>
                                                            <input value={cmd} onChange={e => updateCmd(i, e.target.value)} className="bg-transparent border-none text-white outline-none w-full" placeholder="useradd -m tech4u && chown ..." />
                                                        </div>
                                                        <button type="button" onClick={() => removeCmd(i)} className="p-4 text-slate-600 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                                                    </div>
                                                ))}
                                                <HelpText>Estos comandos se ejecutan como ROOT una sola vez cuando el contenedor arranca.</HelpText>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'validation' && (
                                    <div className="space-y-10 animate-in slide-in-from-bottom-6">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                            <div className="space-y-1">
                                                <h3 className="text-white font-black font-mono text-sm uppercase tracking-[0.3em] flex items-center gap-3 text-pink-500"><Code className="w-5 h-5" /> Heurística de Validación</h3>
                                                <p className="text-[10px] text-slate-500 font-mono">Configura los "Checkpoints" que el sistema verificará en tiempo real.</p>
                                            </div>
                                            <button type="button" onClick={addChallenge} className="px-8 py-4 rounded-2xl bg-pink-500/10 text-pink-400 text-[11px] font-black uppercase hover:bg-pink-500 hover:text-white transition-all shadow-xl shadow-pink-500/5">+ Crear Nuevo Reto</button>
                                        </div>
                                        <div className="space-y-12">
                                            {challenges.map((ch, cI) => (
                                                <div key={cI} className="bg-white/[0.01] border border-white/10 rounded-[2.5rem] p-10 border-l-[10px] border-l-pink-500 group relative">
                                                    <button type="button" onClick={() => removeChallenge(cI)} className="absolute top-10 right-10 p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                                                    <div className="flex items-center gap-4 mb-8">
                                                        <div className="w-10 h-10 rounded-xl bg-pink-500 text-black flex items-center justify-center font-black font-mono">{cI + 1}</div>
                                                        <input value={ch.title} onChange={e => updateChallenge(cI, 'title', e.target.value)} className="bg-transparent border-none text-3xl font-black italic uppercase tracking-tighter text-white focus:text-pink-400 outline-none w-full" placeholder="NOMBRE DEL RETO (Ej: Crear Usuario)" />
                                                    </div>

                                                    <div className="space-y-8">
                                                        <div>
                                                            <label className="text-[11px] font-black text-slate-500 uppercase font-mono mb-2 block tracking-widest">Instrucciones de Validación</label>
                                                            <textarea value={ch.description} onChange={e => updateChallenge(cI, 'description', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-xs font-mono text-white italic h-24 resize-none focus:border-pink-500 outline-none" placeholder="Describe qué debe hacer el alumno exactamente para este reto..." />
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="flex items-center justify-between">
                                                                <h5 className="text-[11px] font-black text-white uppercase tracking-widest font-mono flex items-center gap-2"><Zap className="w-4 h-4 text-pink-400" /> Sondas de Verificación (Rules)</h5>
                                                                <button type="button" onClick={() => addRule(cI)} className="text-[10px] text-pink-400 font-black uppercase flex items-center gap-1.5 hover:underline transition-all"><Plus className="w-3.5 h-3.5" /> Añadir Regla</button>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                {ch.rules?.map((r, rI) => (
                                                                    <div key={rI} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4 relative group/rule">
                                                                        <button type="button" onClick={() => removeRule(cI, rI)} className="absolute top-4 right-4 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-rule:opacity-100"><X className="w-4 h-4" /></button>
                                                                        <div>
                                                                            <label className="text-[9px] text-slate-500 block mb-1 font-black uppercase">Comando de Sonda</label>
                                                                            <input value={r.command} onChange={e => updateRule(cI, rI, 'command', e.target.value)} className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-neon outline-none focus:border-neon" placeholder="ls -l /etc/shadow..." />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[9px] text-slate-500 block mb-1 font-black uppercase">Señal Esperada (Output)</label>
                                                                            <input value={r.expected} onChange={e => updateRule(cI, rI, 'expected', e.target.value)} className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-indigo-400 outline-none focus:border-indigo-400" placeholder="root:root..." />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {(!ch.rules || ch.rules.length === 0) && <p className="col-span-2 text-center py-6 text-slate-700 font-mono text-[9px] uppercase tracking-widest">Añade al menos una regla para activar la validación técnica.</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {challenges.length === 0 && (
                                                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] space-y-4">
                                                    <ShieldOff className="w-12 h-12 text-slate-700 mx-auto" />
                                                    <p className="text-slate-500 font-mono text-xs italic">Modo Teórico: Sin validación técnica configurada.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'guide' && (
                                    <div className="space-y-12 animate-in slide-in-from-bottom-6">
                                        <div>
                                            <h3 className="text-white font-black font-mono text-sm uppercase tracking-[0.3em] mb-4 flex items-center gap-3 text-neon"><CheckCircle className="w-5 h-5" /> Objetivos de la Misión (goal_description)</h3>
                                            <textarea required value={labForm.goal_description} onChange={e => setLabForm({ ...labForm, goal_description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white font-mono text-sm h-40 focus:border-neon outline-none resize-none leading-relaxed" placeholder="Ej: Tu objetivo es auditar los permisos..." />
                                            <HelpText>Este texto es lo primero que verá el alumno al iniciar el laboratorio.</HelpText>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black font-mono text-sm uppercase tracking-[0.3em] mb-4 flex items-center gap-3 text-slate-400"><FileText className="w-5 h-5" /> Guía Paso a Paso (step_by_step_guide)</h3>
                                            <textarea value={labForm.step_by_step_guide} onChange={e => setLabForm({ ...labForm, step_by_step_guide: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-8 text-white font-mono text-xs h-[500px] focus:border-neon outline-none resize-none leading-relaxed" placeholder="### 💡 Paso 1: Enumeración..." />
                                            <HelpText>Soporta formato Markdown.</HelpText>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-10 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                                <Activity className="w-4 h-4" /> Integrity Scan: <span className="text-emerald-500">OPTIMAL</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <button onClick={() => setIsLabModalOpen(false)} className="px-10 py-4 text-[11px] font-black font-mono text-slate-500 hover:text-white uppercase tracking-widest transition-all">Cancelar</button>
                                <button type="submit" form="lab-form" className="flex items-center gap-4 px-12 py-5 bg-neon text-black font-black font-mono rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-neon/20">
                                    <Save className="w-6 h-6" />
                                    <span>{editingLab ? 'SINCRONIZAR CAMBIOS' : 'DESPLEGAR LABORATORIO'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
