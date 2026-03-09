import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    Edit2,
    Trash2,
    ChevronUp,
    ChevronDown,
    Save,
    X,
    ChevronLeft,
    Target,
    ShieldCheck,
    HelpCircle,
    Zap,
    Code,
    FileCode
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function AdminChallenges() {
    const { labId } = useParams();
    const navigate = useNavigate();
    const [lab, setLab] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState(null);

    const [form, setForm] = useState({
        id: '',
        title: '',
        description: '',
        validation_type: 'path_exact',
        validation_value: '',
        validation_extra: '',
        order_index: 0,
        xp: 10,
        hints: ''
    });

    const { addNotification } = useNotification();

    useEffect(() => {
        fetchLabDetails();
        fetchChallenges();
    }, [labId]);

    const fetchLabDetails = async () => {
        try {
            const res = await api.get(`/labs/${labId}`);
            setLab(res.data);
        } catch (err) {
            (import.meta.env.DEV && console.error)("Error fetching lab details", err);
        }
    };

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            // NOTE: The API might expect challenges as a sub-resource or separate endpoint.
            // Based on database.py, challenges are related to Lab.
            // We'll try to fetch them from /labs/{labId}/challenges if it exists, 
            // otherwise we'll check if they come with the lab object.
            const res = await api.get(`/labs/${labId}/challenges`);
            const sorted = res.data.sort((a, b) => a.order_index - b.order_index);
            setChallenges(sorted);
        } catch (err) {
            // Fallback: check if lab object has them (unlikely for many challenges but possible)
            if (lab?.challenges) {
                setChallenges(lab.challenges.sort((a, b) => a.order_index - b.order_index));
            } else {
                addNotification({ title: 'Aviso', description: 'No se encontraron retos o el endpoint no está disponible', type: 'info' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (chall = null) => {
        if (chall) {
            setEditingChallenge(chall);
            setForm({
                id: chall.id || '',
                title: chall.title || '',
                description: chall.description || '',
                validation_type: chall.validation_type || 'path_exact',
                validation_value: chall.validation_value || '',
                validation_extra: chall.validation_extra || '',
                order_index: chall.order_index || 0,
                xp: chall.xp || 10,
                hints: chall.hints || ''
            });
        } else {
            setEditingChallenge(null);
            setForm({
                id: `CHALL_${challenges.length + 1}`,
                title: '',
                description: '',
                validation_type: 'path_exact',
                validation_value: '',
                validation_extra: '',
                order_index: challenges.length,
                xp: 10,
                hints: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingChallenge) {
                await api.put(`/labs/${labId}/challenges/${editingChallenge.id}`, form);
                addNotification({ title: 'Éxito', description: 'Reto actualizado', type: 'success' });
            } else {
                await api.post(`/labs/${labId}/challenges`, form);
                addNotification({ title: 'Éxito', description: 'Reto creado', type: 'success' });
            }
            setIsModalOpen(false);
            fetchChallenges();
        } catch (err) {
            addNotification({ title: 'Error', description: 'Fallo al guardar el reto', type: 'error' });
        }
    };

    const handleDelete = async (challId) => {
        if (!confirm('¿Eliminar este reto?')) return;
        try {
            await api.delete(`/labs/${labId}/challenges/${challId}`);
            addNotification({ title: 'Eliminado', description: 'Reto eliminado', type: 'info' });
            fetchChallenges();
        } catch (err) {
            addNotification({ title: 'Error', description: 'No se pudo eliminar', type: 'error' });
        }
    };

    const handleReorder = async (chall, direction) => {
        const index = challenges.findIndex(c => c.id === chall.id);
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === challenges.length - 1) return;

        const newChalls = [...challenges];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        [newChalls[index], newChalls[targetIndex]] = [newChalls[targetIndex], newChalls[index]];

        const updatedChalls = newChalls.map((c, idx) => ({ ...c, order_index: idx }));
        setChallenges(updatedChalls);

        try {
            await Promise.all([
                api.put(`/labs/${labId}/challenges/${updatedChalls[index].id}`, updatedChalls[index]),
                api.put(`/labs/${labId}/challenges/${updatedChalls[targetIndex].id}`, updatedChalls[targetIndex])
            ]);
        } catch (err) {
            fetchChallenges();
        }
    };

    if (loading && challenges.length === 0 && !lab) {
        return <div className="flex items-center justify-center p-20 text-neon animate-pulse uppercase font-black tracking-widest">Sincronizando Retos...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
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
                            <Target className="w-3 h-3" /> {lab?.title || 'Laboratorio'}
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Challenges & Validation</h2>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-neon text-black px-6 py-3 rounded-xl font-black uppercase tracking-tighter hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" /> Nuevo Reto
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <Code className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Retos</span>
                    </div>
                    <div className="text-4xl font-black text-white italic">{challenges.length}</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <Zap className="w-4 h-4 text-neon" />
                        <span className="text-[10px] font-black uppercase tracking-widest">XP Total Lab</span>
                    </div>
                    <div className="text-4xl font-black text-neon italic">{challenges.reduce((acc, c) => acc + (c.xp || 0), 0)} XP</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sistema de Validación</span>
                    </div>
                    <div className="text-xl font-black text-blue-400 italic uppercase">Advanced Auto-Check</div>
                </div>
            </div>

            {/* Challenges List */}
            <div className="space-y-4">
                {challenges.map((chall) => (
                    <div key={chall.id} className="group bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.04] transition-all flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-slate-700 italic">
                                {chall.order_index + 1}
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                    {chall.title}
                                    <span className="text-[9px] bg-white/5 text-slate-500 px-2 py-0.5 rounded border border-white/10 font-mono">{chall.id}</span>
                                    <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">{chall.validation_type}</span>
                                </h3>
                                <p className="text-slate-500 text-xs mt-1 italic">{chall.description || 'Sin descripción'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1 mr-4">
                                <button onClick={() => handleReorder(chall, 'up')} className="p-1 hover:text-neon text-slate-700 transition-colors"><ChevronUp className="w-4 h-4" /></button>
                                <button onClick={() => handleReorder(chall, 'down')} className="p-1 hover:text-neon text-slate-700 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                            </div>

                            <button onClick={() => handleOpenModal(chall)} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(chall.id)} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/20 hover:border-red-500/30 transition-all text-red-400">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] w-full max-w-3xl max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-neon"></div>

                        <form onSubmit={handleSave} className="flex flex-col h-full">
                            <div className="p-10 pb-6 flex items-center justify-between">
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                                    {editingChallenge ? 'Editar Reto' : 'Nuevo Reto'}
                                </h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-8 h-8 text-slate-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Challenge ID</label>
                                        <input
                                            required
                                            value={form.id}
                                            onChange={e => setForm({ ...form, id: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono"
                                            placeholder="L1_C1"
                                            disabled={!!editingChallenge}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">XP Reward</label>
                                        <input
                                            type="number"
                                            value={form.xp}
                                            onChange={e => setForm({ ...form, xp: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Título del Reto</label>
                                    <input
                                        required
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono"
                                        placeholder="Crea un directorio llamado 'tech4u'..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Descripción / Instrucciones</label>
                                    <textarea
                                        rows="2"
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all resize-none font-mono"
                                        placeholder="Instrucciones específicas para este reto..."
                                    />
                                </div>

                                <div className="p-8 border border-blue-500/10 bg-blue-500/5 rounded-[2rem] space-y-6">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                                        <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Motor de Validación</h4>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Tipo de Validación</label>
                                            <select
                                                value={form.validation_type}
                                                onChange={e => setForm({ ...form, validation_type: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all appearance-none font-mono"
                                            >
                                                <option value="path_exact">Checking Path Existance (path_exact)</option>
                                                <option value="directory_listing_exact">Directory Listing Exact (ls -R)</option>
                                                <option value="file_content_exact">File Content Exact (cat file)</option>
                                                <option value="command_output_exact">Manual Command Check</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Valor Esperado (Validation Value)</label>
                                            <div className="relative">
                                                <FileCode className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/40" />
                                                <input
                                                    value={form.validation_value}
                                                    onChange={e => setForm({ ...form, validation_value: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-mono italic text-blue-400"
                                                    placeholder="/home/user/tech4u"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4">Contexto Extra (Opcional)</label>
                                            <input
                                                value={form.validation_extra}
                                                onChange={e => setForm({ ...form, validation_extra: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-mono italic text-blue-300/60"
                                                placeholder="e.g. root directory or specific flag"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-4 flex items-center gap-2">
                                        <HelpCircle className="w-3 h-3" /> Pistas (Separadas por '|')
                                    </label>
                                    <textarea
                                        rows="2"
                                        value={form.hints}
                                        onChange={e => setForm({ ...form, hints: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono italic"
                                        placeholder="Pista 1 | Pista 2 | ..."
                                    />
                                </div>
                            </div>

                            <div className="p-10 border-t border-white/5 bg-white/[0.01] flex items-center justify-end gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-black uppercase tracking-tighter text-slate-600 hover:text-white transition-colors">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-neon text-black px-12 py-4 rounded-2xl font-black uppercase tracking-tighter hover:scale-105 transition-transform flex items-center gap-3 shadow-[0_10px_30px_rgba(198,255,51,0.2)]"
                                >
                                    <Save className="w-5 h-5" /> {editingChallenge ? 'Sincronizar Reto' : 'Implementar Reto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
