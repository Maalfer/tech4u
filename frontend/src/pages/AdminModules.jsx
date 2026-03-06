import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Layers,
    Plus,
    Edit2,
    Trash2,
    ChevronUp,
    ChevronDown,
    Save,
    X,
    Activity,
    ChevronLeft,
    FlaskConical,
    Globe
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function AdminModules() {
    const { pathId } = useParams();
    const navigate = useNavigate();
    const [path, setPath] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        order_index: 0,
        requires_validation: true,
        is_active: true
    });

    const { addNotification } = useNotification();

    useEffect(() => {
        fetchPathDetails();
        fetchModules();
    }, [pathId]);

    const fetchPathDetails = async () => {
        try {
            const res = await api.get('/labs/paths');
            const currentPath = res.data.find(p => p.id === parseInt(pathId));
            setPath(currentPath);
        } catch (err) {
            console.error("Error fetching path details", err);
        }
    };

    const fetchModules = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/labs/paths/${pathId}/modules`);
            const sorted = res.data.sort((a, b) => a.order_index - b.order_index);
            setModules(sorted);
        } catch (err) {
            addNotification({ title: 'Error', description: 'Error al cargar módulos', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mod = null) => {
        if (mod) {
            setEditingModule(mod);
            setForm({
                title: mod.title || '',
                description: mod.description || '',
                order_index: mod.order_index || 0,
                requires_validation: mod.requires_validation ?? true,
                is_active: mod.is_active ?? true
            });
        } else {
            setEditingModule(null);
            setForm({
                title: '',
                description: '',
                order_index: modules.length,
                requires_validation: true,
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = { ...form, skill_path_id: parseInt(pathId) };
        try {
            if (editingModule) {
                await api.put(`/labs/admin/modules/${editingModule.id}`, payload);
                addNotification({ title: 'Éxito', description: 'Módulo actualizado correctamente', type: 'success' });
            } else {
                await api.post('/labs/admin/modules', payload);
                addNotification({ title: 'Éxito', description: 'Módulo creado correctamente', type: 'success' });
            }
            setIsModalOpen(false);
            fetchModules();
        } catch (err) {
            addNotification({ title: 'Error', description: 'Fallo al guardar el módulo', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este módulo? Todos los laboratorios asociados se perderán.')) return;
        try {
            await api.delete(`/labs/admin/modules/${id}`);
            addNotification({ title: 'Eliminado', description: 'Módulo eliminado correctamente', type: 'info' });
            fetchModules();
        } catch (err) {
            addNotification({ title: 'Error', description: 'No se pudo eliminar el módulo', type: 'error' });
        }
    };

    const handleReorder = async (mod, direction) => {
        const index = modules.findIndex(m => m.id === mod.id);
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === modules.length - 1) return;

        const newModules = [...modules];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];

        const updatedModules = newModules.map((m, idx) => ({ ...m, order_index: idx }));
        setModules(updatedModules);

        try {
            await Promise.all([
                api.put(`/labs/admin/modules/${updatedModules[index].id}`, { ...updatedModules[index], skill_path_id: parseInt(pathId) }),
                api.put(`/labs/admin/modules/${updatedModules[targetIndex].id}`, { ...updatedModules[targetIndex], skill_path_id: parseInt(pathId) })
            ]);
        } catch (err) {
            addNotification({ title: 'Error', description: 'Error al reordenar', type: 'error' });
            fetchModules();
        }
    };

    if (loading && modules.length === 0) {
        return <div className="flex items-center justify-center p-20 text-neon animate-pulse uppercase font-black">Escaneando Módulos...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Context */}
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin/terminal-builder/paths')}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neon/60 mb-1">
                            <Globe className="w-3 h-3" /> {path?.title || 'Skill Path'}
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Gestión de Módulos</h2>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-neon text-black px-6 py-3 rounded-xl font-black uppercase tracking-tighter hover:scale-105 transition-transform shadow-[0_0_20px_rgba(198,255,51,0.2)]"
                >
                    <Plus className="w-5 h-5" /> Nuevo Módulo
                </button>
            </div>

            {/* Modules List */}
            <div className="grid grid-cols-1 gap-4">
                {modules.length === 0 ? (
                    <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                        <Layers className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-600 font-black uppercase tracking-tighter italic">No hay módulos registrados en esta ruta</p>
                    </div>
                ) : (
                    modules.map((mod) => (
                        <div key={mod.id} className="group bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.04] transition-all flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                    <Layers className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                        {mod.title}
                                        {!mod.is_active && <span className="text-[9px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/30">OCULTO</span>}
                                        {mod.requires_validation ? (
                                            <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">VALIDACIÓN</span>
                                        ) : (
                                            <span className="text-[9px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30">LIBRE</span>
                                        )}
                                    </h3>
                                    <p className="text-slate-500 text-xs mt-1 max-w-xl line-clamp-1 italic">{mod.description || 'Sin descripción'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1 mr-4">
                                    <button onClick={() => handleReorder(mod, 'up')} className="p-1 hover:text-neon text-slate-700 transition-colors"><ChevronUp className="w-4 h-4" /></button>
                                    <button onClick={() => handleReorder(mod, 'down')} className="p-1 hover:text-neon text-slate-700 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                                </div>

                                <button
                                    onClick={() => navigate(`/admin/terminal-builder/modules/${mod.id}/labs`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-neon/10 hover:border-neon/30 hover:text-neon transition-all text-slate-400 text-[10px] font-black uppercase tracking-widest"
                                >
                                    <FlaskConical className="w-4 h-4" /> Labs
                                </button>

                                <button onClick={() => handleOpenModal(mod)} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(mod.id)} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/20 hover:border-red-500/30 transition-all text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )
                    ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-neon"></div>

                        <form onSubmit={handleSave} className="p-12 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                                    {editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}
                                </h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-8 h-8 text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Título del Módulo</label>
                                    <input
                                        required
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono"
                                        placeholder="Ej: Gestión de Archivos L1"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Descripción</label>
                                    <textarea
                                        rows="3"
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all resize-none font-mono"
                                        placeholder="En este módulo los estudiantes aprenderán..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Validación</label>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, requires_validation: !form.requires_validation })}
                                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${form.requires_validation ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}
                                        >
                                            <span className="font-black uppercase tracking-widest text-xs">{form.requires_validation ? 'Sí (Obligatoria)' : 'No (Libre)'}</span>
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Visibilidad</label>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${form.is_active ? 'bg-neon/10 border-neon/30 text-neon' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                        >
                                            <span className="font-black uppercase tracking-widest text-xs">{form.is_active ? 'Visible' : 'Oculto'}</span>
                                            <Activity className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-neon text-black px-8 py-5 rounded-[2rem] font-black uppercase tracking-tighter flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-[0_10px_30px_rgba(198,255,51,0.2)]"
                                >
                                    <Save className="w-6 h-6" /> {editingModule ? 'Actualizar Módulo' : 'Crear Módulo'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-5 border border-white/10 rounded-[2rem] font-black uppercase tracking-tighter text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
