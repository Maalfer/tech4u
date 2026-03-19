import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FlaskConical,
    Plus,
    Edit2,
    Trash2,
    ChevronUp,
    ChevronDown,
    Save,
    X,
    Activity,
    ChevronLeft,
    Eye,
    MessageSquare,
    Target,
    Zap,
    Layout,
    BookOpen,
    Layers,
    Globe,
    Code,
    Settings
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function AdminLabsContent() {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const [module, setModule] = useState(null);
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLab, setEditingLab] = useState(null);
    const [activeTab, setActiveTab] = useState('basic'); // basic | content | validation | advanced

    const [form, setForm] = useState({
        title: '',
        description: '',
        goal_description: '',
        step_by_step_guide: '',
        difficulty: 'medium',
        xp_reward: 150,
        is_active: true,
        order_index: 0,
        docker_image: 'ubuntu:22.04',
        // NEW FIELDS:
        time_limit: 30,
        category: 'Linux',
        validation_command: '',
        expected_result: '',
        expected_flag: '',
        validation_rules: '',
        scenario_setup: '',
        lab_type: 'free' // 'free' or 'ctf'
    });
    const [isDirty, setIsDirty] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });

    const { addNotification } = useNotification();

    // Auto-save logic
    useEffect(() => {
        let interval;
        if (isModalOpen && editingLab && isDirty) {
            interval = setInterval(() => {
                handleAutoSave();
            }, 10000); // 10 seconds
        }
        return () => clearInterval(interval);
    }, [isModalOpen, editingLab, isDirty, form]);

    const handleAutoSave = async () => {
        if (!isDirty || !editingLab) return;
        try {
            await api.put(`/labs/${editingLab.id}`, { ...form, module_id: parseInt(moduleId) });
            setIsDirty(false);
            (import.meta.env.DEV && console.log)("Auto-saved lab:", editingLab.id);
        } catch (err) {
            if (import.meta.env.DEV) console.error("Auto-save failed", err);
        }
    };

    const handleFormChange = (updates) => {
        setForm(prev => ({ ...prev, ...updates }));
        setIsDirty(true);
    };

    useEffect(() => {
        fetchModuleDetails();
        fetchLabs();
    }, [moduleId]);

    const fetchModuleDetails = async () => {
        try {
            const res = await api.get('/labs/paths');
            for (const path of res.data) {
                const modRes = await api.get(`/labs/paths/${path.id}/modules`);
                const found = modRes.data.find(m => m.id === parseInt(moduleId));
                if (found) {
                    setModule(found);
                    break;
                }
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error fetching module details", err);
        }
    };

    const fetchLabs = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/labs/modules/${moduleId}/labs`);
            const sorted = res.data.sort((a, b) => a.order_index - b.order_index);
            setLabs(sorted);
        } catch (err) {
            addNotification({ title: 'Error', description: 'Error al cargar laboratorios', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (lab = null) => {
        if (lab) {
            setEditingLab(lab);
            setForm({
                title: lab.title || '',
                description: lab.description || '',
                goal_description: lab.goal_description || '',
                step_by_step_guide: lab.step_by_step_guide || '',
                difficulty: lab.difficulty || 'medium',
                xp_reward: lab.xp_reward || 150,
                is_active: lab.is_active ?? true,
                order_index: lab.order_index || 0,
                docker_image: lab.docker_image || 'ubuntu:22.04',
                time_limit: lab.time_limit || 30,
                category: lab.category || 'Linux',
                validation_command: lab.validation_command || '',
                expected_result: lab.expected_result || '',
                expected_flag: lab.expected_flag || '',
                validation_rules: lab.validation_rules || '',
                scenario_setup: lab.scenario_setup || '',
                lab_type: lab.expected_flag ? 'ctf' : 'free'
            });
        } else {
            setEditingLab(null);
            setForm({
                title: '',
                description: '',
                goal_description: '',
                step_by_step_guide: '',
                difficulty: 'medium',
                xp_reward: 150,
                is_active: true,
                order_index: labs.length,
                docker_image: 'ubuntu:22.04',
                time_limit: 30,
                category: 'Linux',
                validation_command: '',
                expected_result: '',
                expected_flag: '',
                validation_rules: '',
                scenario_setup: '',
                lab_type: 'free'
            });
        }
        setIsDirty(false);
        setActiveTab('basic');
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        const payload = { ...form, module_id: parseInt(moduleId) };
        try {
            if (editingLab) {
                await api.put(`/labs/${editingLab.id}`, payload);
                addNotification({ title: 'Éxito', description: 'Laboratorio actualizado correctamente', type: 'success' });
            } else {
                await api.post('/labs/', payload);
                addNotification({ title: 'Éxito', description: 'Laboratorio creado correctamente', type: 'success' });
            }
            setIsDirty(false);
            setIsModalOpen(false);
            fetchLabs();
        } catch (err) {
            addNotification({ title: 'Error', description: 'Fallo al guardar el laboratorio', type: 'error' });
        }
    };

    const handleDelete = (id, title) => {
        setDeleteConfirm({ show: true, id, title: title || `Lab #${id}` });
    };

    const confirmDelete = async () => {
        const { id } = deleteConfirm;
        setDeleteConfirm({ show: false, id: null, title: '' });
        try {
            await api.delete(`/labs/${id}`);
            addNotification({ title: 'Eliminado', description: 'Laboratorio eliminado', type: 'info' });
            fetchLabs();
        } catch (err) {
            addNotification({ title: 'Error', description: 'No se pudo eliminar', type: 'error' });
        }
    };

    const handleReorder = async (lab, direction) => {
        const index = labs.findIndex(l => l.id === lab.id);
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === labs.length - 1) return;

        const newLabs = [...labs];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        [newLabs[index], newLabs[targetIndex]] = [newLabs[targetIndex], newLabs[index]];

        const updatedLabs = newLabs.map((l, idx) => ({ ...l, order_index: idx }));
        setLabs(updatedLabs);

        try {
            await Promise.all([
                api.put(`/labs/${updatedLabs[index].id}`, { ...updatedLabs[index], module_id: parseInt(moduleId) }),
                api.put(`/labs/${updatedLabs[targetIndex].id}`, { ...updatedLabs[targetIndex], module_id: parseInt(moduleId) })
            ]);
        } catch (err) {
            addNotification({ title: 'Error', description: 'Error al reordenar', type: 'error' });
            fetchLabs();
        }
    };

    if (loading && labs.length === 0) {
        return <div className="flex items-center justify-center p-20 text-neon animate-pulse uppercase font-black tracking-widest">Iniciando Laboratorios...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Context */}
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neon/60 mb-1">
                            <Layers className="w-3 h-3" /> {module?.title || 'Módulo'}
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Gestión de Labs</h2>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-neon text-black px-6 py-3 rounded-xl font-black uppercase tracking-tighter hover:scale-105 transition-transform shadow-[0_0_20px_rgba(198,255,51,0.2)]"
                >
                    <Plus className="w-5 h-5" /> Nuevo Lab
                </button>
            </div>

            {/* Labs List */}
            <div className="grid grid-cols-1 gap-4">
                {labs.length === 0 ? (
                    <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                        <FlaskConical className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-600 font-black uppercase tracking-tighter italic">No hay laboratorios en este módulo</p>
                    </div>
                ) : (
                    labs.map((lab) => (
                        <div key={lab.id} className="group bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.04] transition-all flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-neon/10 border border-neon/20 flex items-center justify-center">
                                    <FlaskConical className="w-6 h-6 text-neon" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                        {lab.title}
                                        {!lab.is_active && <span className="text-[9px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/30">OCULTO</span>}
                                        <span className={`text-[9px] px-2 py-0.5 rounded border ${lab.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                            lab.difficulty === 'hard' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                            }`}>
                                            {lab.difficulty?.toUpperCase()}
                                        </span>
                                    </h3>
                                    <p className="text-slate-500 text-xs mt-1 max-w-xl line-clamp-1 italic">{lab.description || 'Sin explicación'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1 mr-4">
                                    <button onClick={() => handleReorder(lab, 'up')} className="p-1 hover:text-neon text-slate-700 transition-colors"><ChevronUp className="w-4 h-4" /></button>
                                    <button onClick={() => handleReorder(lab, 'down')} className="p-1 hover:text-neon text-slate-700 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                                </div>

                                <button
                                    onClick={() => handleOpenModal(lab)}
                                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(lab.id, lab.title)} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/20 hover:border-red-500/30 transition-all text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )
                    ))}
            </div>

            {/* Editor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] w-full max-w-4xl max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-neon"></div>

                        {/* Modal Header */}
                        <div className="p-10 pb-6 flex items-center justify-between border-b border-white/5">
                            <div>
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                                    {editingLab ? 'Editar Laboratorio' : 'Crear Laboratorio'}
                                </h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-neon" /> ID: {editingLab?.id || 'TEMP_UUID'} • {editingLab?.docker_image || form.docker_image}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-8 h-8 text-slate-500" />
                            </button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="px-10 py-4 flex items-center gap-8 border-b border-white/5 overflow-x-auto">
                            {[
                                { id: 'basic', label: 'Datos Básicos', icon: Layout },
                                { id: 'content', label: 'Guía y Objetivos', icon: BookOpen },
                                { id: 'validation', label: 'Validación y Retos', icon: Target },
                                { id: 'advanced', label: 'Configuración Avanzada', icon: Settings },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pb-4 transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-neon' : 'text-slate-500 hover:text-white'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon shadow-[0_0_10px_rgba(198,255,51,0.5)]"></div>}
                                </button>
                            ))}
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            <form id="lab-form" onSubmit={handleSave} className="space-y-8">

                                {activeTab === 'basic' && (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Título del Lab</label>
                                                <input
                                                    required
                                                    value={form.title}
                                                    onChange={e => handleFormChange({ title: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono"
                                                    placeholder="Ej: Navegación Básica..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Dificultad</label>
                                                <select
                                                    value={form.difficulty}
                                                    onChange={e => handleFormChange({ difficulty: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all appearance-none font-mono"
                                                >
                                                    <option value="easy">Easy (Principiante)</option>
                                                    <option value="medium">Medium (Standard)</option>
                                                    <option value="hard">Hard (Avanzado)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Categoría</label>
                                                <select
                                                    value={form.category}
                                                    onChange={e => handleFormChange({ category: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all appearance-none font-mono"
                                                >
                                                    <option value="Linux">Linux</option>
                                                    <option value="Redes">Redes</option>
                                                    <option value="Seguridad">Seguridad</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Tiempo Límite (minutos)</label>
                                                <input
                                                    type="number"
                                                    value={form.time_limit}
                                                    onChange={e => handleFormChange({ time_limit: parseInt(e.target.value) || 30 })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono"
                                                    placeholder="30"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Recompensa XP</label>
                                                <div className="relative">
                                                    <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neon/40" />
                                                    <input
                                                        type="number"
                                                        value={form.xp_reward}
                                                        onChange={e => handleFormChange({ xp_reward: parseInt(e.target.value) })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Estado de Visibilidad</label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFormChange({ is_active: !form.is_active })}
                                                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${form.is_active ? 'bg-neon/10 border-neon/30 text-neon font-black' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                                >
                                                    <span className="uppercase tracking-widest text-xs">{form.is_active ? 'Visible en Academia' : 'Oculto (Borrador)'}</span>
                                                    <Activity className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Tagline / Descripción Corta</label>
                                            <textarea
                                                rows="2"
                                                value={form.description}
                                                onChange={e => handleFormChange({ description: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all resize-none font-mono text-sm leading-relaxed"
                                                placeholder="Resumen rápido que aparece en la tarjeta del lab..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'content' && (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4 flex items-center justify-between">
                                                Guía del Laboratorio (Markdown)
                                                <span className="text-neon/40 lowercase font-mono"># H1 ## H2 *italics*</span>
                                            </label>
                                            <textarea
                                                rows="10"
                                                value={form.step_by_step_guide}
                                                onChange={e => handleFormChange({ step_by_step_guide: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono text-sm leading-relaxed"
                                                placeholder="### 📂 Misión: El Primer Directorio..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Objetivos del Laboratorio</label>
                                            <textarea
                                                rows="4"
                                                value={form.goal_description}
                                                onChange={e => handleFormChange({ goal_description: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono text-sm leading-relaxed"
                                                placeholder="Al finalizar este laboratorio el estudiante será capaz de..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'validation' && (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Docker Image</label>
                                            <input
                                                value={form.docker_image}
                                                onChange={e => handleFormChange({ docker_image: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono text-sm"
                                                placeholder="ubuntu:22.04"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Comando de Validación</label>
                                            <textarea
                                                rows="2"
                                                value={form.validation_command}
                                                onChange={e => handleFormChange({ validation_command: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono text-sm leading-relaxed"
                                                placeholder="Ej: ls /home/user/proyecto"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Resultado Esperado</label>
                                            <textarea
                                                rows="3"
                                                value={form.expected_result}
                                                onChange={e => handleFormChange({ expected_result: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono text-sm leading-relaxed"
                                                placeholder="Salida esperada del comando..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Tipo de Laboratorio</label>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleFormChange({ lab_type: 'free' })}
                                                    className={`flex-1 px-4 py-3 rounded-2xl border font-black uppercase text-xs tracking-wider transition-all ${form.lab_type === 'free' ? 'bg-neon/10 border-neon/30 text-neon' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
                                                >
                                                    Comandos Libres
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFormChange({ lab_type: 'ctf' })}
                                                    className={`flex-1 px-4 py-3 rounded-2xl border font-black uppercase text-xs tracking-wider transition-all ${form.lab_type === 'ctf' ? 'bg-neon/10 border-neon/30 text-neon' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
                                                >
                                                    CTF / Flag
                                                </button>
                                            </div>
                                        </div>

                                        {form.lab_type === 'ctf' && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Flag CTF</label>
                                                <input
                                                    value={form.expected_flag}
                                                    onChange={e => handleFormChange({ expected_flag: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono text-sm"
                                                    placeholder="Ej: flag{linux_master_123}"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Reglas de Validación JSON</label>
                                            <textarea
                                                rows="4"
                                                value={form.validation_rules}
                                                onChange={e => handleFormChange({ validation_rules: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono text-xs leading-relaxed"
                                                placeholder='Array JSON de reglas. Ej: [{"type": "file_exists", "path": "/etc/hosts"}]'
                                            />
                                            <p className="text-[9px] text-slate-600 italic px-4">Array JSON de reglas adicionales para validación automática</p>
                                        </div>

                                        {editingLab && (
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/gestion/terminal-builder/labs/${editingLab.id}/challenges`)}
                                                className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" /> Configurar Retos Específicos
                                            </button>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'advanced' && (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        <div className="p-6 border border-emerald-500/20 rounded-3xl bg-emerald-500/[0.02]">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Target className="w-5 h-5 text-emerald-400" />
                                                <h4 className="text-sm font-black uppercase tracking-tighter text-emerald-400">Imágenes Docker Aprobadas</h4>
                                            </div>
                                            <ul className="space-y-2 text-[10px] text-slate-400 font-mono">
                                                <li className="flex items-center gap-2"><span className="text-neon">✓</span> <code className="text-emerald-300">ubuntu:22.04</code> <span className="text-neon text-[8px] ml-auto">(RECOMENDADA)</span></li>
                                                <li className="flex items-center gap-2"><span className="text-slate-600">✓</span> <code className="text-slate-300">debian:12</code></li>
                                                <li className="flex items-center gap-2"><span className="text-slate-600">✓</span> <code className="text-slate-300">alpine:latest</code></li>
                                                <li className="flex items-center gap-2"><span className="text-slate-600">✓</span> <code className="text-slate-300">kali-linux:latest</code></li>
                                                <li className="flex items-center gap-2"><span className="text-slate-600">✓</span> <code className="text-slate-300">centos:8</code></li>
                                            </ul>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Scenario Setup JSON</label>
                                            <textarea
                                                rows="6"
                                                value={form.scenario_setup}
                                                onChange={e => handleFormChange({ scenario_setup: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono text-xs leading-relaxed"
                                                placeholder='Configuración inicial de la máquina virtual. Ej: {"files": [...], "permissions": [...], "services": [...]}'
                                            />
                                            <p className="text-[9px] text-slate-600 italic px-4">Configuración JSON del estado inicial de la VM. Define archivos, permisos, servicios, etc.</p>
                                        </div>
                                    </div>
                                )}

                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-10 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {/* Preview logic later */ }}
                                    className="flex items-center gap-2 px-6 py-4 border border-white/10 rounded-2xl font-black uppercase tracking-tighter text-slate-500 hover:text-white hover:bg-white/5 transition-all text-xs"
                                >
                                    <Eye className="w-4 h-4" /> Preview
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-black uppercase tracking-tighter text-slate-600 hover:text-white transition-colors">
                                    Cancelar
                                </button>
                                <button
                                    form="lab-form"
                                    type="submit"
                                    className="bg-neon text-black px-12 py-4 rounded-2xl font-black uppercase tracking-tighter hover:scale-105 transition-transform flex items-center gap-3 shadow-[0_10px_30px_rgba(198,255,51,0.2)]"
                                >
                                    <Save className="w-5 h-5" /> {editingLab ? 'Guardar Cambios' : 'Lanzar Laboratorio'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-200">
                    <div className="bg-[#0A0A0A] border border-red-500/30 rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Eliminar Lab</h3>
                                <p className="text-[10px] font-mono text-slate-500 mt-1">Esta acción no se puede deshacer</p>
                            </div>
                        </div>
                        <p className="text-slate-300 font-mono text-sm leading-relaxed">
                            ¿Confirmas que quieres eliminar <span className="text-red-400 font-black">"{deleteConfirm.title}"</span>? Se borrarán también todos sus retos.
                        </p>
                        <div className="flex gap-4 pt-4 border-t border-white/5">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, id: null, title: '' })}
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
