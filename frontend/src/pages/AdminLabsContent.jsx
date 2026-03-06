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
    Globe
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
    const [activeTab, setActiveTab] = useState('basic'); // basic | content | structural

    const [form, setForm] = useState({
        title: '',
        description: '',
        goal_description: '',
        step_by_step_guide: '',
        difficulty: 'medium',
        xp_reward: 150,
        is_active: true,
        order_index: 0,
        docker_image: 'ubuntu:22.04'
    });
    const [isDirty, setIsDirty] = useState(false);

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
            console.log("Auto-saved lab:", editingLab.id);
        } catch (err) {
            console.error("Auto-save failed", err);
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
            // We don't have a direct "get module" but we can find it in paths
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
            console.error("Error fetching module details", err);
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
                docker_image: lab.docker_image || 'ubuntu:22.04'
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
                docker_image: 'ubuntu:22.04'
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

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este laboratorio?')) return;
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
                                <button onClick={() => handleDelete(lab.id)} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/20 hover:border-red-500/30 transition-all text-red-400">
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
                                    <Zap className="w-3 h-3 text-neon" /> ID: {editingLab?.id || 'TEMP_UUID'} • {editingLab?.docker_image}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-8 h-8 text-slate-500" />
                            </button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="px-10 py-4 flex items-center gap-8 border-b border-white/5">
                            {[
                                { id: 'basic', label: 'Datos Básicos', icon: Layout },
                                { id: 'content', label: 'Guía y Objetivos', icon: BookOpen },
                                { id: 'structural', label: 'Configuración VM', icon: Target },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pb-4 transition-all relative ${activeTab === tab.id ? 'text-neon' : 'text-slate-500 hover:text-white'
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
                                                rows="8"
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

                                {activeTab === 'structural' && (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        <div className="p-8 border border-white/5 rounded-3xl bg-white/[0.01]">
                                            <div className="flex items-center gap-3 mb-6">
                                                <Target className="w-5 h-5 text-blue-400" />
                                                <h4 className="text-sm font-black uppercase tracking-tighter text-slate-300">Virtual Environment</h4>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4 font-black">Docker Image</label>
                                                    <input
                                                        value={form.docker_image}
                                                        onChange={e => handleFormChange({ docker_image: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-mono text-blue-400"
                                                        placeholder="ubuntu:22.04"
                                                    />
                                                </div>
                                                <p className="text-[9px] text-slate-600 italic px-4 leading-relaxed">
                                                    Nota: Por seguridad, solo usa imágenes verificadas por el equipo de Tech4U Academy.
                                                    El resto de la configuración del escenario se gestionará en la siguiente fase de desarrollo.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-8 border border-blue-500/10 rounded-3xl bg-blue-500/[0.02]">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Target className="w-5 h-5 text-blue-400" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-blue-400">Retos & Validación</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/admin/terminal-builder/labs/${editingLab.id}/challenges`)}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-colors flex items-center gap-2"
                                                >
                                                    <Plus className="w-3 h-3" /> Configurar Retos
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-mono italic">
                                                Personaliza los hitos de validación, comandos esperados y recompensas de XP para este escenario.
                                            </p>
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
        </div>
    );
}
