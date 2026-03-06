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
    FolderPlus,
    FilePlus,
    Command
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function AdminLabs() {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLab, setEditingLab] = useState(null);
    const { addNotification } = useNotification();

    // Visual Builder State
    const [formData, setFormData] = useState({
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
        expected_flag: '',
    });

    // Scenario Setup Visual State
    const [directories, setDirectories] = useState([]);
    const [files, setFiles] = useState([]);
    const [setupCommands, setSetupCommands] = useState([]);

    // Multi-Challenge Visual State
    const [challenges, setChallenges] = useState([]);

    const [activeTab, setActiveTab] = useState('basic'); // basic | scenario | validation | guide

    const fetchLabs = async () => {
        try {
            const res = await api.get('/labs/admin/all');
            setLabs(res.data);
            setLoading(false);
        } catch (err) {
            addNotification('Error al cargar labs', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLabs();
    }, []);

    const handleOpenModal = (lab = null) => {
        if (lab) {
            setEditingLab(lab);
            setFormData({
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
                expected_flag: lab.expected_flag || '',
            });

            // Parse visual states from JSON strings
            try {
                const setup = JSON.parse(lab.scenario_setup || '{}');
                setDirectories(setup.directories || []);
                setFiles(setup.files || []);
                setSetupCommands(setup.commands || []);
            } catch (e) {
                console.error("Error parsing scenario_setup", e);
            }

            try {
                const rulesData = JSON.parse(lab.validation_rules || '{"challenges":[]}');
                setChallenges(rulesData.challenges || []);
            } catch (e) {
                console.error("Error parsing validation_rules", e);
            }
        } else {
            setEditingLab(null);
            setFormData({
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
                expected_flag: '',
            });
            setDirectories([]);
            setFiles([]);
            setSetupCommands([]);
            setChallenges([]);
        }
        setIsModalOpen(true);
        setActiveTab('basic');
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Construct JSON strings for the backend
        const scenario_setup = JSON.stringify({
            directories,
            files,
            commands: setupCommands
        });

        const validation_rules = JSON.stringify({
            challenges
        });

        const finalData = {
            ...formData,
            scenario_setup,
            validation_rules
        };

        try {
            if (editingLab) {
                await api.put(`/labs/${editingLab.id}`, finalData);
                addNotification('Laboratorio actualizado correctamente', 'success');
            } else {
                await api.post('/labs/', finalData);
                addNotification('Laboratorio creado correctamente', 'success');
            }
            setIsModalOpen(false);
            fetchLabs();
        } catch (err) {
            addNotification('Error al guardar el laboratorio', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este laboratorio?')) return;
        try {
            await api.delete(`/labs/${id}`);
            addNotification('Laboratorio eliminado', 'info');
            fetchLabs();
        } catch (err) {
            addNotification('Error al eliminar laboratory', 'error');
        }
    };

    // Helper functions for visual builders
    const addDirectory = () => setDirectories([...directories, ""]);
    const updateDirectory = (index, val) => {
        const next = [...directories];
        next[index] = val;
        setDirectories(next);
    };
    const removeDirectory = (index) => setDirectories(directories.filter((_, i) => i !== index));

    const addFile = () => setFiles([...files, { path: "", content: "" }]);
    const updateFile = (index, key, val) => {
        const next = [...files];
        next[index][key] = val;
        setFiles(next);
    };
    const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

    const addCommand = () => setSetupCommands([...setupCommands, ""]);
    const updateCommand = (index, val) => {
        const next = [...setupCommands];
        next[index] = val;
        setSetupCommands(next);
    };
    const removeCommand = (index) => setSetupCommands(setupCommands.filter((_, i) => i !== index));

    const addChallenge = () => setChallenges([...challenges, { id: challenges.length + 1, title: "", description: "", rules: [] }]);
    const updateChallenge = (index, key, val) => {
        const next = [...challenges];
        next[index][key] = val;
        setChallenges(next);
    };
    const removeChallenge = (index) => setChallenges(challenges.filter((_, i) => i !== index));

    const addRuleToChallenge = (cIdx) => {
        const next = [...challenges];
        next[cIdx].rules = [...next[cIdx].rules, { command: "", expected: "" }];
        setChallenges(next);
    };
    const updateRuleInChallenge = (cIdx, rIdx, key, val) => {
        const next = [...challenges];
        next[cIdx].rules[rIdx][key] = val;
        setChallenges(next);
    };
    const removeRuleFromChallenge = (cIdx, rIdx) => {
        const next = [...challenges];
        next[cIdx].rules = next[cIdx].rules.filter((_, i) => i !== rIdx);
        setChallenges(next);
    };

    if (loading) return <div className="p-8 text-center font-mono animate-pulse text-neon">Cargando base de datos de transmisiones...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
                <div className="relative">
                    <h1 className="text-3xl font-black text-white font-mono flex items-center gap-3">
                        <Terminal className="w-8 h-8 text-neon" />
                        LABS MANAGER
                    </h1>
                    <p className="text-slate-400 font-mono text-sm mt-1">
                        Arquitectura de simulación interactiva y validación por reglas.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-neon text-black font-black font-mono rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,157,0.3)] relative group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Plus className="relative w-5 h-5" />
                    <span className="relative">NUEVO LABORATORIO</span>
                </button>
            </div>

            {/* Labs Table */}
            <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left font-mono">
                    <thead className="bg-white/5 text-[11px] uppercase tracking-widest text-slate-500 border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4 font-black">ID</th>
                            <th className="px-6 py-4 font-black">Laboratorio</th>
                            <th className="px-6 py-4 font-black">Dificultad</th>
                            <th className="px-6 py-4 font-black items-center gap-2">XP</th>
                            <th className="px-6 py-4 font-black">Estado</th>
                            <th className="px-6 py-4 font-black text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {labs.map(lab => (
                            <tr key={lab.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 text-xs text-slate-600">#{lab.id}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-sm">{lab.title}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">{lab.category}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase border ${lab.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                                        lab.difficulty === 'medium' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                                            'text-red-400 bg-red-400/10 border-red-400/20'
                                        }`}>
                                        {lab.difficulty}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-neon font-black text-sm">{lab.xp_reward} <span className="text-[10px] opacity-60">XP</span></span>
                                </td>
                                <td className="px-6 py-4">
                                    {lab.is_active ? (
                                        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            Activo
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold uppercase">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                            Borrador
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenModal(lab)}
                                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(lab.id)}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal / Builder */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-neon/10 rounded-lg">
                                    <FlaskConical className="w-6 h-6 text-neon" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white font-mono uppercase tracking-tight">
                                        {editingLab ? 'EDITANDO LABORATORIO' : 'CONSTRUCT LAB MODULE'}
                                    </h2>
                                    <p className="text-xs text-slate-500 font-mono">Panel de configuración paramétrica de sandbox.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex px-6 border-b border-white/5 bg-white/2">
                            {[
                                { id: 'basic', icon: FileText, label: 'Datos Básicos' },
                                { id: 'scenario', icon: Layers, label: 'Scenario Builder' },
                                { id: 'validation', icon: Code, label: 'Validation Rules' },
                                { id: 'guide', icon: Eye, label: 'Guía y Objetivos' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-mono text-[11px] uppercase tracking-wider transition-all relative ${activeTab === tab.id ? 'text-neon' : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon shadow-[0_0_10px_#00ff9d]" />}
                                </button>
                            ))}
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <form onSubmit={handleSave} id="lab-form">
                                {activeTab === 'basic' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-300">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Título de la Misión</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.title}
                                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-neon outline-none transition-all placeholder:text-slate-700"
                                                    placeholder="Ej: Análisis de Logs de Apache"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Descripción Corta</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm h-24 focus:border-neon outline-none transition-all resize-none"
                                                    placeholder="Breve resumen del laboratorio..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Categoría</label>
                                                    <select
                                                        value={formData.category}
                                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-neon outline-none transition-all"
                                                    >
                                                        <option value="Linux">Linux</option>
                                                        <option value="Redes">Redes</option>
                                                        <option value="Seguridad">Seguridad</option>
                                                        <option value="Servicios">Servicios</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Dificultad</label>
                                                    <select
                                                        value={formData.difficulty}
                                                        onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-neon outline-none transition-all"
                                                    >
                                                        <option value="easy">Easy</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="hard">Hard</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">XP de Recompensa</label>
                                                    <input
                                                        type="number"
                                                        value={formData.xp_reward}
                                                        onChange={e => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-neon outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Tiempo Límite (min)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.time_limit}
                                                        onChange={e => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-neon outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Docker Image Base</label>
                                                <input
                                                    type="text"
                                                    value={formData.docker_image}
                                                    onChange={e => setFormData({ ...formData, docker_image: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-neon outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Estado Publicación</label>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, is_active: true })}
                                                        className={`flex-1 py-3 rounded-xl border font-mono text-[10px] uppercase font-black transition-all ${formData.is_active ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 border-white/10 text-slate-600'
                                                            }`}
                                                    >
                                                        Activo / Visible
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, is_active: false })}
                                                        className={`flex-1 py-3 rounded-xl border font-mono text-[10px] uppercase font-black transition-all ${!formData.is_active ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/10 text-slate-600'
                                                            }`}
                                                    >
                                                        Borrador / Oculto
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'scenario' && (
                                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                                        {/* Directories Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                                        <FolderPlus className="w-4 h-4 text-indigo-400" />
                                                    </div>
                                                    <h3 className="text-white font-mono text-xs font-black uppercase tracking-widest">Directorios a Crear</h3>
                                                </div>
                                                <button type="button" onClick={addDirectory} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-black uppercase flex items-center gap-1 transition-colors">
                                                    <Plus className="w-3 h-3" /> Añadir Directorio
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {directories.map((dir, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 group">
                                                        <input
                                                            type="text"
                                                            value={dir}
                                                            onChange={e => updateDirectory(idx, e.target.value)}
                                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500/50 outline-none"
                                                            placeholder="/var/log/custom..."
                                                        />
                                                        <button type="button" onClick={() => removeDirectory(idx)} className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {directories.length === 0 && <p className="text-[10px] text-slate-600 font-mono italic">No hay directorios específicos. /home/student se crea por defecto.</p>}
                                            </div>
                                        </div>

                                        {/* Files Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                        <FilePlus className="w-4 h-4 text-emerald-400" />
                                                    </div>
                                                    <h3 className="text-white font-mono text-xs font-black uppercase tracking-widest">Inyectar Archivos</h3>
                                                </div>
                                                <button type="button" onClick={addFile} className="text-[10px] text-emerald-400 hover:text-emerald-300 font-black uppercase flex items-center gap-1 transition-colors">
                                                    <Plus className="w-3 h-3" /> Añadir Archivo
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {files.map((file, idx) => (
                                                    <div key={idx} className="bg-white/3 border border-white/5 rounded-xl p-4 relative group">
                                                        <button type="button" onClick={() => removeFile(idx)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <div className="space-y-3">
                                                            <input
                                                                type="text"
                                                                value={file.path}
                                                                onChange={e => updateFile(idx, 'path', e.target.value)}
                                                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-emerald-500/50 outline-none"
                                                                placeholder="Path absoluto: /var/log/apache2/access.log"
                                                            />
                                                            <textarea
                                                                value={file.content}
                                                                onChange={e => updateFile(idx, 'content', e.target.value)}
                                                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[11px] h-24 focus:border-emerald-500/50 outline-none resize-none"
                                                                placeholder="Contenido del archivo..."
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                {files.length === 0 && <p className="text-[10px] text-slate-600 font-mono italic">No hay archivos para inyectar.</p>}
                                            </div>
                                        </div>

                                        {/* Commands Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                                        <Command className="w-4 h-4 text-amber-400" />
                                                    </div>
                                                    <h3 className="text-white font-mono text-xs font-black uppercase tracking-widest">Comandos de Inicialización</h3>
                                                </div>
                                                <button type="button" onClick={addCommand} className="text-[10px] text-amber-400 hover:text-amber-300 font-black uppercase flex items-center gap-1 transition-colors">
                                                    <Plus className="w-3 h-3" /> Añadir Comando
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {setupCommands.map((cmd, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 group">
                                                        <div className="text-[10px] text-amber-400 font-black px-2 mt-0.5">$</div>
                                                        <input
                                                            type="text"
                                                            value={cmd}
                                                            onChange={e => updateCommand(idx, e.target.value)}
                                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-amber-500/50 outline-none"
                                                            placeholder="chmod 700 /root..."
                                                        />
                                                        <button type="button" onClick={() => removeCommand(idx)} className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {setupCommands.length === 0 && <p className="text-[10px] text-slate-600 font-mono italic">No hay comandos de configuración pre-startup.</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'validation' && (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 text-pink-400" />
                                                </div>
                                                <h3 className="text-white font-mono text-xs font-black uppercase tracking-widest">Retos del Laboratorio (Multi-Challenge)</h3>
                                            </div>
                                            <button type="button" onClick={addChallenge} className="text-[10px] text-pink-400 hover:text-pink-300 font-black uppercase flex items-center gap-1 transition-colors">
                                                <Plus className="w-3 h-3" /> Añadir Reto
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            {challenges.map((ch, cIdx) => (
                                                <div key={cIdx} className="bg-white/3 border border-white/5 rounded-3xl p-6 relative group border-l-2 border-l-pink-500/30">
                                                    <button type="button" onClick={() => removeChallenge(cIdx)} className="absolute top-6 right-6 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                        <div>
                                                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 font-mono">Título del Reto</label>
                                                            <input
                                                                type="text"
                                                                value={ch.title}
                                                                onChange={e => updateChallenge(cIdx, 'title', e.target.value)}
                                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-xs focus:border-pink-500/50 outline-none"
                                                                placeholder="Ej: Crear usuario alumno1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 font-mono">ID / Orden</label>
                                                            <input
                                                                type="number"
                                                                value={ch.id}
                                                                onChange={e => updateChallenge(cIdx, 'id', e.target.value)}
                                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-xs focus:border-pink-500/50 outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mb-6">
                                                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 font-mono">Descripción del Reto</label>
                                                        <textarea
                                                            value={ch.description}
                                                            onChange={e => updateChallenge(cIdx, 'description', e.target.value)}
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-xs h-16 focus:border-pink-500/50 outline-none resize-none"
                                                            placeholder="Instrucciones específicas para este reto..."
                                                        />
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Reglas de Validación</h4>
                                                            <button type="button" onClick={() => addRuleToChallenge(cIdx)} className="text-[8px] text-pink-400 font-black uppercase">+ Añadir Regla</button>
                                                        </div>
                                                        {ch.rules.map((rule, rIdx) => (
                                                            <div key={rIdx} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-black/20 p-3 rounded-xl relative group/rule">
                                                                <button type="button" onClick={() => removeRuleFromChallenge(cIdx, rIdx)} className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/rule:opacity-100 transition-all scale-75">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                                <input
                                                                    type="text"
                                                                    value={rule.command}
                                                                    onChange={e => updateRuleInChallenge(cIdx, rIdx, 'command', e.target.value)}
                                                                    className="bg-transparent border-b border-white/5 text-white font-mono text-[10px] outline-none p-1 focus:border-pink-500"
                                                                    placeholder="Comando (id user...)"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={rule.expected}
                                                                    onChange={e => updateRuleInChallenge(cIdx, rIdx, 'expected', e.target.value)}
                                                                    className="bg-transparent border-b border-white/5 text-white font-mono text-[10px] outline-none p-1 focus:border-emerald-500"
                                                                    placeholder="Esperado (OK)"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {challenges.length === 0 && (
                                                <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center">
                                                    <AlertTriangle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                                    <p className="text-xs text-slate-600 font-mono">Sin retos. El laboratorio será una misión de objetivo único (Legacy).</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex gap-4">
                                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                                            <p className="text-[10px] text-amber-200/60 font-mono leading-relaxed">
                                                <strong className="text-amber-400">💡 Terminal Skills System:</strong> El sistema ahora espera que valides cada reto por separado. El lab solo se completará cuando todos los retos estén en verde.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'guide' && (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Misión / Objetivo Final</label>
                                            <textarea
                                                required
                                                value={formData.goal_description}
                                                onChange={e => setFormData({ ...formData, goal_description: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm h-32 focus:border-neon outline-none transition-all resize-none"
                                                placeholder="Define exactamente qué debe conseguir el alumno para ganar los XP..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Guía Paso a Paso (Markdown)</label>
                                            <textarea
                                                value={formData.step_by_step_guide}
                                                onChange={e => setFormData({ ...formData, step_by_step_guide: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm h-64 focus:border-neon outline-none transition-all resize-none mb-2"
                                                placeholder="### 🚀 Misión: Diagnóstico de Red\n1. Ejecuta ping...\n2. Filtra la IP..."
                                            />
                                            <p className="text-[9px] text-slate-500 font-mono italic">Soporta formateo standard de Markdown (títulos, negritas, bloques de código).</p>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/5 flex items-center justify-between bg-black/20">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 text-[11px] font-black font-mono text-slate-500 hover:text-white transition-all uppercase tracking-widest"
                            >
                                Descargar Cambios
                            </button>
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    form="lab-form"
                                    className="flex items-center gap-2 px-8 py-3 bg-neon text-black font-black font-mono rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,157,0.3)]"
                                >
                                    <Save className="w-5 h-5" />
                                    {editingLab ? 'ACTUALIZAR CORE' : 'DESPLEGAR LABORATORIO'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
