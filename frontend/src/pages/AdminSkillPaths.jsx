import React, { useState, useEffect } from 'react';
import {
    Globe,
    Plus,
    Edit2,
    Trash2,
    ChevronUp,
    ChevronDown,
    Save,
    X,
    Image as ImageIcon,
    Activity,
    Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function AdminSkillPaths() {
    const navigate = useNavigate();
    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPath, setEditingPath] = useState(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        difficulty: 'easy',
        order_index: 0,
        is_active: true,
        cover_image: ''
    });

    const { addNotification } = useNotification();

    useEffect(() => {
        fetchPaths();
    }, []);

    const fetchPaths = async () => {
        setLoading(true);
        try {
            const res = await api.get('/labs/paths');
            // Sort by order_index just in case API doesn't
            const sorted = res.data.sort((a, b) => a.order_index - b.order_index);
            setPaths(sorted);
        } catch (err) {
            addNotification({ title: 'Error', description: 'Error al cargar rutas', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (path = null) => {
        if (path) {
            setEditingPath(path);
            setForm({
                title: path.title || '',
                description: path.description || '',
                difficulty: path.difficulty || 'easy',
                order_index: path.order_index || 0,
                is_active: path.is_active ?? true,
                cover_image: path.cover_image || ''
            });
        } else {
            setEditingPath(null);
            setForm({
                title: '',
                description: '',
                difficulty: 'easy',
                order_index: paths.length,
                is_active: true,
                cover_image: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingPath) {
                await api.put(`/labs/admin/paths/${editingPath.id}`, form);
                addNotification({ title: 'Éxito', description: 'Ruta actualizada correctamente', type: 'success' });
            } else {
                await api.post('/labs/admin/paths', form);
                addNotification({ title: 'Éxito', description: 'Ruta creada correctamente', type: 'success' });
            }
            setIsModalOpen(false);
            fetchPaths();
        } catch (err) {
            addNotification({ title: 'Error', description: 'Fallo al guardar la ruta', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta ruta? Todos los módulos y laboratorios asociados se verán afectados.')) return;
        try {
            await api.delete(`/labs/admin/paths/${id}`);
            addNotification({ title: 'Eliminado', description: 'Ruta eliminada correctamente', type: 'info' });
            fetchPaths();
        } catch (err) {
            addNotification({ title: 'Error', description: 'No se pudo eliminar la ruta', type: 'error' });
        }
    };

    const handleReorder = async (path, direction) => {
        const index = paths.findIndex(p => p.id === path.id);
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === paths.length - 1) return;

        const newPaths = [...paths];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap
        [newPaths[index], newPaths[targetIndex]] = [newPaths[targetIndex], newPaths[index]];

        // Update order_indices
        const updatedPaths = newPaths.map((p, idx) => ({ ...p, order_index: idx }));
        setPaths(updatedPaths);

        // Save sequentially or bulk if API supports it (here we do individual for safety as per standard patterns)
        try {
            await Promise.all([
                api.put(`/labs/admin/paths/${updatedPaths[index].id}`, { ...updatedPaths[index] }),
                api.put(`/labs/admin/paths/${updatedPaths[targetIndex].id}`, { ...updatedPaths[targetIndex] })
            ]);
        } catch (err) {
            addNotification({ title: 'Error', description: 'Error al reordenar', type: 'error' });
            fetchPaths(); // Rollback
        }
    };

    if (loading && paths.length === 0) {
        return <div className="flex items-center justify-center p-20 text-neon animate-pulse">CARGANDO RUTAS...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Skill Paths</h2>
                    <p className="text-slate-500 text-xs italic mt-1">Gestión de rutas de aprendizaje de alto nivel.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-neon text-black px-6 py-3 rounded-xl font-black uppercase tracking-tighter hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" /> Nueva Ruta
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {paths.map((path, idx) => (
                    <div key={path.id} className="group bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.04] transition-all flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                {path.cover_image ? (
                                    <img src={path.cover_image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Globe className="w-8 h-8 text-slate-700" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                    {path.title}
                                    {!path.is_active && <span className="text-[9px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/30">OCULTO</span>}
                                </h3>
                                <p className="text-slate-500 text-xs mt-1 max-w-xl line-clamp-1 italic">{path.description || 'Sin descripción'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Reordering */}
                            <div className="flex flex-col gap-1 mr-4">
                                <button onClick={() => handleReorder(path, 'up')} className="p-1 hover:text-neon text-slate-700 transition-colors"><ChevronUp className="w-4 h-4" /></button>
                                <button onClick={() => handleReorder(path, 'down')} className="p-1 hover:text-neon text-slate-700 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                            </div>

                            <button
                                onClick={() => navigate(`/admin/terminal-builder/paths/${path.id}/modules`)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 transition-all text-slate-400 text-[10px] font-black uppercase tracking-widest"
                            >
                                <Layers className="w-4 h-4" /> Módulos
                            </button>

                            <button onClick={() => handleOpenModal(path)} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(path.id)} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/20 hover:border-red-500/30 transition-all text-red-400">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
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
                                    {editingPath ? 'Editar Ruta' : 'Crear Nueva Ruta'}
                                </h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-8 h-8 text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Título</label>
                                        <input
                                            required
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all"
                                            placeholder="Linux Fundamentals..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Dificultad</label>
                                        <select
                                            value={form.difficulty}
                                            onChange={e => setForm({ ...form, difficulty: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all appearance-none"
                                        >
                                            <option value="easy">Principiante</option>
                                            <option value="medium">Intermedio</option>
                                            <option value="hard">Avanzado</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Descripción</label>
                                    <textarea
                                        rows="3"
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all resize-none"
                                        placeholder="Descripción detallada de la ruta..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Imagen de Portada (URL)</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                            <input
                                                value={form.cover_image}
                                                onChange={e => setForm({ ...form, cover_image: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Estado</label>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${form.is_active ? 'bg-neon/10 border-neon/30 text-neon' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                        >
                                            <span className="font-black uppercase tracking-widest text-xs">{form.is_active ? 'Activo' : 'Oculto'}</span>
                                            <Activity className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-neon text-black px-8 py-5 rounded-[2rem] font-black uppercase tracking-tighter flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
                                >
                                    <Save className="w-6 h-6" /> {editingPath ? 'Guardar Cambios' : 'Crear Ruta'}
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
