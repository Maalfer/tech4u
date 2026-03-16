import React, { useState, useEffect } from 'react';
import { Lightbulb, CheckCircle, XCircle, ChevronRight, Database, Edit3 } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

export default function AdminSuggestions() {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSug, setSelectedSug] = useState(null); // Sugerencia que se está editando
    const [showModal, setShowModal] = useState(false);

    // Formulario para convertir sugerencia en pregunta real
    const [formData, setFormData] = useState({
        subject: '', text: '', option_a: '', option_b: '',
        option_c: '', option_d: '', correct_answer: 'a',
        difficulty: 'medium', explanation: ''
    });

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const res = await api.get('/announcements/admin/suggestions');
            setSuggestions(res.data);
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error al cargar sugerencias");
        } finally {
            setLoading(false);
        }
    };

    const handleDevelop = (sug) => {
        setSelectedSug(sug);
        setFormData({
            ...formData,
            subject: sug.subject,
            text: sug.text // Precargamos el texto del alumno
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Seguro que quieres descartar esta sugerencia?")) return;
        try {
            await api.delete(`/admin/users/suggestions/${id}`);
            alert("🗑️ Sugerencia eliminada.");
            fetchSuggestions();
        } catch (err) {
            alert("Error al eliminar la sugerencia.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Enviamos la nueva pregunta y el backend marcará la sugerencia como aprobada
            await api.post(`/announcements/suggestions/${selectedSug.id}/approve`, formData);
            alert("🚀 Pregunta integrada en el Banco de Datos y sugerencia cerrada.");
            setShowModal(false);
            fetchSuggestions(); // Refrescar lista
        } catch (err) {
            alert("Error al procesar la integración.");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <PageHeader
                    title={<>Buzón de <span className="text-blue-400">Propuestas</span></>}
                    subtitle="Inyectar sugerencias de alumnos al mainframe"
                    Icon={Lightbulb}
                    gradient="from-white via-blue-100 to-blue-400"
                    iconColor="text-blue-400"
                    iconBg="bg-blue-600/20"
                    iconBorder="border-blue-500/30"
                    glowColor="bg-blue-600/20"
                />

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {suggestions.length > 0 ? (
                            suggestions.map((sug) => (
                                <div key={sug.id} className="glass p-5 rounded-2xl border border-slate-800 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                                    <div className="flex gap-4 items-center">
                                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                            <Edit3 className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                                                    {sug.subject}
                                                </span>
                                                <span className="text-[10px] text-slate-600 font-mono">#{sug.id}</span>
                                            </div>
                                            <p className="text-sm text-slate-300 font-mono italic">"{sug.text}"</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDevelop(sug)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-50 text-white hover:text-blue-600 rounded-xl text-xs font-black uppercase transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                                        >
                                            Desarrollar <ChevronRight className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sug.id)}
                                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                                            title="Descartar sugerencia"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 glass rounded-3xl border border-dashed border-slate-800">
                                <p className="text-slate-600 font-mono text-xs uppercase tracking-[0.3em]">Mainframe limpio - Sin propuestas pendientes</p>
                            </div>
                        )}
                    </div>
                )}

                {/* MODAL DE DESARROLLO (EDITOR MAESTRO) */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="glass w-full max-w-2xl rounded-3xl border border-blue-500/30 p-8 overflow-y-auto max-h-[90vh]">
                            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-400" /> Integrar Pregunta
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-mono text-slate-500 uppercase ml-2">Asignatura</label>
                                        <input className="w-full bg-black/40 border border-slate-800 rounded-xl p-3 text-xs text-white" value={formData.subject} readOnly />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono text-slate-500 uppercase ml-2">Dificultad</label>
                                        <select className="w-full bg-black/40 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                                            value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}>
                                            <option value="easy">Fácil</option>
                                            <option value="medium">Medio</option>
                                            <option value="hard">Difícil</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase ml-2">Enunciado (Desarrollado)</label>
                                    <textarea className="w-full bg-black/40 border border-slate-800 rounded-xl p-3 text-xs text-white h-20 outline-none focus:border-blue-500"
                                        value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {['a', 'b', 'c', 'd'].map(opt => (
                                        <input key={opt} placeholder={`Opción ${opt.toUpperCase()}`} className="bg-black/40 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                                            onChange={e => setFormData({ ...formData, [`option_${opt}`]: e.target.value })} required />
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-mono text-slate-500 uppercase ml-2">Respuesta Correcta</label>
                                        <select className="w-full bg-black/40 border border-slate-800 rounded-xl p-3 text-xs text-white"
                                            value={formData.correct_answer} onChange={e => setFormData({ ...formData, correct_answer: e.target.value })}>
                                            <option value="a">Opción A</option>
                                            <option value="b">Opción B</option>
                                            <option value="c">Opción C</option>
                                            <option value="d">Opción D</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-800 rounded-xl text-xs font-bold uppercase">Cancelar</button>
                                        <button type="submit" className="flex-1 py-3 bg-blue-600 rounded-xl text-xs font-black uppercase shadow-[0_0_20px_rgba(37,99,235,0.4)]">Integrar</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}