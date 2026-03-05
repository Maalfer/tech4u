import React, { useState, useEffect } from 'react';
import {
    Terminal, Plus, Trash2, Edit3, Save, X, Search,
    Shield, Clock, Star, Layers, Activity
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

export default function AdminLabs() {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLab, setEditingLab] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        docker_image: 'ubuntu:22.04',
        goal_description: '',
        validation_command: '',
        expected_result: '',
        difficulty: 'medium',
        category: 'Linux',
        time_limit: 30,
        xp_reward: 150,
        is_active: true,
        step_by_step_guide: ''
    });

    const fetchLabs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/labs');
            setLabs(res.data);
        } catch (err) {
            console.error("Error fetching labs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLabs(); }, []);

    const handleOpenModal = (lab = null) => {
        if (lab) {
            setEditingLab(lab);
            setFormData({ ...lab });
        } else {
            setEditingLab(null);
            setFormData({
                title: '',
                description: '',
                docker_image: 'ubuntu:22.04',
                goal_description: '',
                validation_command: '',
                expected_result: '',
                difficulty: 'medium',
                category: 'Linux',
                time_limit: 30,
                xp_reward: 150,
                is_active: true,
                step_by_step_guide: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLab) {
                await api.put(`/admin/labs/${editingLab.id}`, formData);
            } else {
                await api.post('/admin/labs', formData);
            }
            setShowModal(false);
            fetchLabs();
        } catch (err) {
            alert("Error al guardar el laboratorio.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este laboratorio?")) return;
        try {
            await api.delete(`/admin/labs/${id}`);
            fetchLabs();
        } catch (err) {
            alert("Error al eliminar.");
        }
    };

    const filteredLabs = labs.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <PageHeader
                    title={<>Gestión de <span className="text-neon">Laboratorios</span></>}
                    subtitle="Configuración de sandboxes y desafíos técnicos"
                    Icon={Terminal}
                    iconColor="text-neon"
                    iconBg="bg-neon/10"
                >
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar labs..."
                                className="bg-black border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-neon outline-none w-64 focus:border-neon"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-6 py-2.5 bg-neon text-black rounded-xl font-black uppercase text-[10px] flex items-center gap-2 hover:shadow-[0_0_20px_rgba(198,255,51,0.4)] transition-all"
                        >
                            <Plus className="w-4 h-4" /> Nuevo Lab
                        </button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="text-center py-20 font-mono text-slate-500 animate-pulse">SINCRONIZANDO CON DOCKER ENGINE...</div>
                    ) : filteredLabs.map(lab => (
                        <div key={lab.id} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-neon/20 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-neon/30 transition-all">
                                    <Terminal className="w-6 h-6 text-slate-500 group-hover:text-neon" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded bg-neon/10 border border-neon/20 text-neon text-[8px] font-black uppercase tracking-widest">{lab.category}</span>
                                        <span className="text-slate-600 font-mono text-[9px] uppercase">{lab.difficulty}</span>
                                        <span className="text-slate-600 font-mono text-[9px] uppercase italic">● {lab.docker_image}</span>
                                    </div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">{lab.title}</h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] font-mono text-slate-500 uppercase">Recompensa</p>
                                    <p className="text-sm font-black text-neon">+{lab.xp_reward} XP</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModal(lab)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-neon transition-all"><Edit3 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(lab.id)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                        <form onSubmit={handleSubmit} className="glass w-full max-w-3xl rounded-[2.5rem] border border-neon/30 p-10 overflow-y-auto max-h-[90vh] shadow-2xl">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                    {editingLab ? 'Editar' : 'Crear'} <span className="text-neon">Laboratorio</span>
                                </h2>
                                <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors"><X /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest mb-1 block">Título del Lab</label>
                                    <input
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-neon outline-none"
                                        placeholder="Ej: Análisis de Logs de Apache"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest mb-1 block">Imagen Docker</label>
                                    <input
                                        value={formData.docker_image}
                                        onChange={e => setFormData({ ...formData, docker_image: e.target.value })}
                                        className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-neon outline-none"
                                        placeholder="ubuntu:22.04"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest mb-1 block">Categoría</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-neon outline-none"
                                    >
                                        <option value="Linux">Linux</option>
                                        <option value="Servicios">Servicios</option>
                                        <option value="Seguridad">Seguridad</option>
                                        <option value="Redes">Redes</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest mb-1 block">Recompensa (XP)</label>
                                    <input
                                        type="number"
                                        value={formData.xp_reward}
                                        onChange={e => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
                                        className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-neon outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest mb-1 block">Límite tiempo (min)</label>
                                    <input
                                        type="number"
                                        value={formData.time_limit}
                                        onChange={e => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                                        className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-neon outline-none"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest mb-1 block">Descripción Educativa</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-sm text-white h-24 focus:border-neon outline-none"
                                        placeholder="Argumento o historia del lab..."
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest mb-1 block">Meta / Objetivo final</label>
                                    <textarea
                                        value={formData.goal_description}
                                        onChange={e => setFormData({ ...formData, goal_description: e.target.value })}
                                        className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-sm text-white h-24 focus:border-neon outline-none font-mono"
                                        placeholder="Instrucción específica que debe cumplir el alumno..."
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest mb-1 block">Comando de Validación</label>
                                    <input
                                        value={formData.validation_command}
                                        onChange={e => setFormData({ ...formData, validation_command: e.target.value })}
                                        className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-sm text-neon focus:border-neon outline-none font-mono"
                                        placeholder="cat /tmp/test"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest mb-1 block">Resultado Esperado</label>
                                    <input
                                        value={formData.expected_result}
                                        onChange={e => setFormData({ ...formData, expected_result: e.target.value })}
                                        className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-neon outline-none font-mono"
                                        placeholder="ok"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest mb-1 block">Guía Paso a Paso (Markdown)</label>
                                    <textarea
                                        value={formData.step_by_step_guide}
                                        onChange={e => setFormData({ ...formData, step_by_step_guide: e.target.value })}
                                        className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-sm text-white h-40 focus:border-neon outline-none font-mono"
                                        placeholder="### Paso 1: Localizar el log...&#10;Utiliza el comando `ls /var/log` para ver los archivos disponibles."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-10">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                    <X className="w-4 h-4" /> CANCELAR
                                </button>
                                <button type="submit" className="flex-1 py-4 bg-neon text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(198,255,51,0.3)] hover:shadow-[0_0_50px_rgba(198,255,51,0.5)] transition-all flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" /> GUARDAR CONFIGURACIÓN
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
