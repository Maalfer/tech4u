import React, { useState, useEffect } from 'react';
import {
    Database, ChevronRight, ArrowLeft,
    Trash2, Edit3, Plus, Search, FileText, UploadCloud, Eye, EyeOff,
    Wifi, Monitor, Cpu, FileCode, Shield, Check, AlertCircle, Sparkles
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

const SUBJECT_STYLES = {
    'Bases de Datos': { icon: Database, color: 'from-blue-600/20 to-blue-900/10 border-blue-500/30 hover:border-blue-400/60', iconColor: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    'Redes': { icon: Wifi, color: 'from-purple-600/20 to-purple-900/10 border-purple-500/30 hover:border-purple-400/60', iconColor: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    'Sistemas Operativos': { icon: Monitor, color: 'from-orange-600/20 to-orange-900/10 border-orange-500/30 hover:border-orange-400/60', iconColor: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    'Ciberseguridad': { icon: Shield, color: 'from-red-600/20 to-red-900/10 border-red-500/30 hover:border-red-400/60', iconColor: 'text-red-400', badge: 'bg-red-500/10 text-red-400 border-red-500/30' },
    'Fundamentos de Hardware': { icon: Cpu, color: 'from-yellow-600/20 to-yellow-900/10 border-yellow-500/30 hover:border-yellow-400/60', iconColor: 'text-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    'Lenguaje de Marcas': { icon: FileCode, color: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/30 hover:border-cyan-400/60', iconColor: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
};

const DEFAULT_STYLE = { icon: Database, color: 'from-slate-600/20 to-slate-900/10 border-slate-500/30 hover:border-slate-400/60', iconColor: 'text-slate-400', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };

export default function AdminContent() {
    const [activeTab, setActiveTab] = useState('questions');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState({ msg: '', type: '' });

    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    const showStatus = (msg, type = 'success') => {
        setStatus({ msg, type });
        setTimeout(() => setStatus({ msg: '', type: '' }), 4000);
    };

    const fetchContent = async () => {
        if (!selectedSubject) return;
        setLoading(true);
        try {
            if (activeTab === 'questions') {
                const res = await api.get('/admin/questions', { params: { subject: selectedSubject } });
                // Res is paginated: { items, total_count, ... }
                setQuestions(res.data.items || []);
            } else {
                const res = await api.get(`/resources/subject/${selectedSubject}`);
                // Resources might be a direct array
                setResources(Array.isArray(res.data) ? res.data : (res.data.items || []));
            }
        } catch (err) {
            showStatus("Error al sincronizar sector", "error");
            setQuestions([]);
            setResources([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchContent(); }, [selectedSubject, activeTab]);

    const handleOpenModal = (item = null) => {
        setIsEditing(!!item);
        if (activeTab === 'questions') {
            setFormData(item || {
                subject: selectedSubject, text: '', option_a: '', option_b: '',
                option_c: '', option_d: '', correct_answer: 'a', difficulty: 'medium', explanation: ''
            });
        } else {
            setFormData(item || {
                title: '', subject: selectedSubject, description: '',
                file_type: 'pdf', url: '', requires_subscription: true, is_published: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const path = activeTab === 'questions' ? '/admin/questions' : '/admin/resources';
            if (isEditing) {
                await api.put(`${path}/${formData.id}`, formData);
            } else {
                await api.post(path, { ...formData, subject: selectedSubject });
            }
            setShowModal(false);
            showStatus(`Registro ${isEditing ? 'actualizado' : 'inyectado'} con éxito`);
            fetchContent();
        } catch (err) {
            showStatus("Error en la operación del mainframe", "error");
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('bulk-upload-file');
        if (!fileInput.files.length) return showStatus('Selecciona un archivo primero', 'error');

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                let payload = [];

                if (file.name.endsWith('.json')) {
                    payload = JSON.parse(text);
                } else if (file.name.endsWith('.csv')) {
                    const lines = text.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim());
                    for (let i = 1; i < lines.length; i++) {
                        if (!lines[i].trim()) continue;
                        const values = [];
                        let current = '', inQuotes = false;
                        for (let char of lines[i]) {
                            if (char === '"') inQuotes = !inQuotes;
                            else if (char === ',' && !inQuotes) { values.push(current.trim().replace(/^"|"$/g, '')); current = ''; }
                            else current += char;
                        }
                        values.push(current.trim().replace(/^"|"$/g, ''));
                        let obj = {};
                        headers.forEach((h, index) => { obj[h] = values[index]; });
                        if (!obj.subject) obj.subject = selectedSubject;
                        if (!obj.difficulty) obj.difficulty = 'medium';
                        payload.push(obj);
                    }
                } else {
                    return showStatus('Formato no soportado', 'error');
                }

                payload = payload.map(item => ({ ...item, subject: selectedSubject }));
                setLoading(true);
                const res = await api.post('/admin/questions/bulk', payload);
                showStatus(`${res.data.imported_count} preguntas inyectadas.`);
                setShowBulkModal(false);
                fetchContent();
            } catch (err) {
                showStatus("Error crítico parseando el archivo", "error");
            } finally {
                setLoading(false);
            }
        };

        reader.readAsText(file);
    };

    const handleTogglePublish = async (id, currentVal) => {
        try {
            await api.patch(`/resources/${id}/toggle-publish`);
            setResources(prev => prev.map(r => r.id === id ? { ...r, is_published: !currentVal } : r));
            showStatus('Estado de publicación actualizado');
        } catch { showStatus('Error al cambiar estado', 'error') }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Confirmas la purga de este registro?")) return;
        try {
            const path = activeTab === 'questions' ? `/admin/questions/${id}` : `/admin/resources/${id}`;
            await api.delete(path);
            showStatus('Registro purgado');
            fetchContent();
        } catch (err) {
            showStatus("Error al eliminar", "error");
        }
    };

    const displayList = (activeTab === 'questions' ? questions : resources) || [];
    const filteredList = Array.isArray(displayList) ? displayList.filter(item => {
        const textToSearch = activeTab === 'questions' ? item.text : item.title;
        return (textToSearch || "").toLowerCase().includes(searchTerm.toLowerCase());
    }) : [];

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8">
                <PageHeader
                    title={<>Gestión de <span className="text-neon">{activeTab === 'questions' ? 'Preguntas' : 'Recursos'}</span></>}
                    subtitle={selectedSubject ? `Sector Activo: ${selectedSubject}` : "Nucleus de Almacenamiento Técnico"}
                    Icon={Database}
                    gradient="from-white via-slate-100 to-neon"
                    iconColor="text-neon"
                    iconBg="bg-neon/20"
                    iconBorder="border-neon/30"
                    glowColor="bg-neon/20"
                >
                    <div className="flex items-center gap-4">
                        {status.msg && (
                            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 animate-in fade-in zoom-in duration-300 ${status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-neon/10 border-neon/30 text-neon'}`}>
                                {status.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
                                <span className="text-[10px] font-mono uppercase font-bold tracking-widest">{status.msg}</span>
                            </div>
                        )}
                        <div className="flex bg-black/40 border border-slate-800 rounded-xl p-1">
                            {['questions', 'resources'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setSelectedSubject(null) }}
                                    className={`px-4 py-2 text-[10px] font-mono rounded-lg transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-neon/10 text-neon border border-neon/20' : 'text-slate-500 hover:text-white'}`}
                                >
                                    {tab === 'questions' ? 'Preguntas' : 'Recursos'}
                                </button>
                            ))}
                        </div>
                    </div>
                </PageHeader>

                {!selectedSubject ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-6xl mx-auto">
                        {Object.entries(SUBJECT_STYLES).map(([name, style]) => {
                            const Icon = style.icon;
                            return (
                                <div
                                    key={name}
                                    onClick={() => setSelectedSubject(name)}
                                    className={`group glass rounded-[2rem] p-8 border-2 bg-gradient-to-br ${style.color} text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] cursor-pointer relative overflow-hidden`}
                                >
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="flex-shrink-0">
                                            <Icon className={`w-12 h-12 ${style.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                                        </div>
                                        <h3 className="text-xl font-black uppercase italic text-white leading-tight">
                                            {name}
                                        </h3>
                                    </div>
                                    <div className="flex items-center justify-between mt-8">
                                        <div className="flex items-center gap-2 text-[10px] font-mono text-neon uppercase tracking-widest font-bold group-hover:translate-x-1 transition-transform">
                                            ACCEDER AL SECTOR <Sparkles size={14} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 max-w-6xl mx-auto">
                        <div className="flex justify-between items-center bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
                            <button onClick={() => setSelectedSubject(null)} className="flex items-center gap-2 text-slate-500 hover:text-neon transition-colors text-[10px] font-mono uppercase tracking-widest group">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver a directorios
                            </button>

                            <div className="flex gap-4">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Filtrar base de datos..."
                                        className="bg-black border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-neon outline-none w-64 focus:border-neon transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {activeTab === 'questions' && (
                                    <button onClick={() => setShowBulkModal(true)} className="px-4 py-2 border border-neon/30 text-neon rounded-xl font-black uppercase text-[10px] flex items-center gap-2 hover:bg-neon/10 transition-colors">
                                        <UploadCloud className="w-4 h-4" /> Importar
                                    </button>
                                )}
                                <button onClick={() => handleOpenModal()} className="px-6 py-2 bg-neon text-black rounded-xl font-black uppercase text-[10px] flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(198,255,51,0.2)]">
                                    <Plus className="w-4 h-4" /> Nuevo
                                </button>
                            </div>
                        </div>

                        {/* ── Question Cards (preguntas) ──────────────────── */}
                        {activeTab === 'questions' ? (
                            <>
                                {/* Stats bar */}
                                <div className="flex items-center gap-4 px-1 mb-2">
                                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                        {filteredList.length} pregunta{filteredList.length !== 1 ? 's' : ''}
                                        {searchTerm && ' encontradas'}
                                    </span>
                                    <div className="flex gap-3 ml-auto">
                                        {['easy','medium','hard'].map(d => {
                                            const count = filteredList.filter(q => q.difficulty === d).length
                                            const colors = { easy: 'text-emerald-400', medium: 'text-amber-400', hard: 'text-red-400' }
                                            const labels = { easy: 'Fácil', medium: 'Media', hard: 'Difícil' }
                                            return count > 0 ? (
                                                <span key={d} className={`text-[9px] font-mono ${colors[d]}`}>
                                                    {count} {labels[d]}
                                                </span>
                                            ) : null
                                        })}
                                    </div>
                                </div>

                                {filteredList.length === 0 && !loading ? (
                                    <div className="glass rounded-[2rem] border border-white/5 p-20 text-center">
                                        <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                        <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">
                                            {searchTerm ? 'No hay preguntas que coincidan con la búsqueda' : 'No hay preguntas en este sector. Crea la primera.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {filteredList.map((item) => {
                                            const diffColors = {
                                                easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                                medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                                                hard: 'bg-red-500/10 text-red-400 border-red-500/20',
                                            }
                                            const diffLabels = { easy: 'Fácil', medium: 'Media', hard: 'Difícil' }
                                            const opts = [
                                                { key: 'a', text: item.option_a },
                                                { key: 'b', text: item.option_b },
                                                { key: 'c', text: item.option_c },
                                                { key: 'd', text: item.option_d },
                                            ]
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="glass rounded-2xl border border-white/5 p-5 hover:border-neon/20 transition-all duration-200 group flex flex-col gap-4"
                                                >
                                                    {/* Header: ID + difficulty + actions */}
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <span className="text-[10px] font-mono font-black text-neon/50">#{item.id}</span>
                                                            <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-mono font-black uppercase ${diffColors[item.difficulty] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                                {diffLabels[item.difficulty] || item.difficulty}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleOpenModal(item)}
                                                                className="p-2 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-neon hover:border-neon/20 transition-all"
                                                                title="Editar"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="p-2 bg-red-500/5 border border-red-500/10 rounded-xl text-slate-500 hover:text-red-400 transition-all"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Question text */}
                                                    <p className="text-sm text-white font-medium leading-relaxed line-clamp-3">
                                                        {item.text}
                                                    </p>

                                                    {/* Options grid */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {opts.map(({ key, text }) => {
                                                            const isCorrect = item.correct_answer === key
                                                            return (
                                                                <div
                                                                    key={key}
                                                                    className={`flex items-start gap-2 p-2.5 rounded-xl border text-[11px] font-mono transition-all ${
                                                                        isCorrect
                                                                            ? 'bg-neon/10 border-neon/30 text-neon'
                                                                            : 'bg-white/[0.02] border-white/5 text-slate-400'
                                                                    }`}
                                                                >
                                                                    <span className={`flex-shrink-0 w-4 h-4 rounded-md flex items-center justify-center text-[9px] font-black uppercase ${
                                                                        isCorrect ? 'bg-neon text-black' : 'bg-white/10 text-slate-500'
                                                                    }`}>
                                                                        {key}
                                                                    </span>
                                                                    <span className="line-clamp-2 leading-snug">{text || '—'}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>

                                                    {/* Explanation preview */}
                                                    {item.explanation && (
                                                        <p className="text-[10px] text-slate-600 font-mono italic line-clamp-1 border-t border-white/5 pt-2">
                                                            💡 {item.explanation}
                                                        </p>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            /* ── Resources Table ─────────────────────────── */
                            <div className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                                <table className="w-full text-left text-[11px] font-mono">
                                    <thead className="bg-white/[0.03] text-slate-500 uppercase font-bold border-b border-white/5">
                                        <tr>
                                            <th className="p-5">Tipo</th>
                                            <th className="p-5">Título</th>
                                            <th className="p-5">Acceso</th>
                                            <th className="p-5 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredList.map((item) => (
                                            <tr key={item.id} className="hover:bg-neon/5 transition-colors group">
                                                <td className="p-5">
                                                    <FileText className={`w-5 h-5 ${item.file_type === 'pdf' ? 'text-red-400' : 'text-blue-400'}`} />
                                                </td>
                                                <td className="p-5 text-slate-300 max-w-lg">
                                                    <p className="line-clamp-2 font-medium">{item.title}</p>
                                                    {item.url && <p className="text-[9px] text-slate-600 mt-0.5 truncate max-w-xs">{item.url}</p>}
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`text-[9px] font-black ${item.requires_subscription ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                            {item.requires_subscription ? '🔒 PREMIUM' : '🌐 OPEN'}
                                                        </span>
                                                        <span className={`text-[8px] ${item.is_published ? 'text-neon' : 'text-slate-600'}`}>
                                                            {item.is_published ? '● PUBLICADO' : '○ BORRADOR'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleTogglePublish(item.id, item.is_published)} className={`p-2.5 rounded-xl transition-all ${item.is_published ? 'bg-neon/10 text-neon' : 'bg-white/5 text-slate-600 hover:text-neon'}`}>
                                                            {item.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                        <button onClick={() => handleOpenModal(item)} className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-neon hover:border-neon/20 transition-all"><Edit3 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredList.length === 0 && !loading && (
                                    <div className="p-20 text-center text-slate-600 font-mono text-[10px] uppercase tracking-widest italic">
                                        No se encontraron recursos en este sector.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                        <form onSubmit={handleSubmit} className="glass w-full max-w-2xl rounded-[2.5rem] border border-neon/20 p-10 overflow-y-auto max-h-[90vh] shadow-2xl relative">
                            <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-3 italic tracking-tighter">
                                <UploadCloud className="w-7 h-7 text-neon" /> {isEditing ? 'Sincronizar' : 'Inyectar'} {activeTab === 'questions' ? 'Pregunta' : 'Recurso'}
                            </h2>

                            {activeTab === 'questions' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest block mb-2">Sector</label>
                                            <input value={selectedSubject} readOnly className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-slate-400 font-mono" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest block mb-2">Dificultad</label>
                                            <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-neon appearance-none cursor-pointer">
                                                <option value="easy">Fácil</option><option value="medium">Media</option><option value="hard">Difícil</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest block mb-2">Enunciado</label>
                                        <textarea value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })} required className="w-full bg-black border border-white/10 rounded-2xl p-5 text-xs text-white h-32 focus:border-neon outline-none transition-all resize-none" placeholder="..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['a', 'b', 'c', 'd'].map(opt => (
                                            <div key={opt}>
                                                <label className="text-[9px] font-mono text-slate-500 uppercase ml-2 tracking-widest block mb-1">Opción {opt.toUpperCase()}</label>
                                                <input value={formData[`option_${opt}`]} onChange={e => setFormData({ ...formData, [`option_${opt}`]: e.target.value })} required className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-neon" />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest block mb-2">Respuesta Correcta</label>
                                        <select value={formData.correct_answer} onChange={e => setFormData({ ...formData, correct_answer: e.target.value })} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs text-white focus:border-neon">
                                            {['a', 'b', 'c', 'd'].map(opt => <option key={opt} value={opt}>OPCIÓN {opt.toUpperCase()}</option>)}
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest block mb-1">Título</label>
                                            <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-neon shadow-inner" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest block mb-1">Tipo de Archivo</label>
                                            <select value={formData.file_type} onChange={e => setFormData({ ...formData, file_type: e.target.value })} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs text-white">
                                                <option value="pdf">PDF Técnico</option><option value="cheatsheet">Cheat Sheet</option><option value="video">Videotutorial</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest block mb-1">Ruta Nucleus</label>
                                            <input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} placeholder="/resources/..." className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-neon" />
                                        </div>
                                    </div>
                                    <div className="p-1 gap-2 flex flex-col">
                                        <label className="flex items-center gap-4 p-5 bg-white/[0.02] rounded-2xl border border-white/5 cursor-pointer hover:bg-white/[0.05] transition-all">
                                            <input type="checkbox" checked={formData.requires_subscription} onChange={e => setFormData({ ...formData, requires_subscription: e.target.checked })} className="w-5 h-5 accent-neon" />
                                            <div>
                                                <span className="text-xs font-black uppercase text-white">REDUCIR ACCESO A PREMIUM</span>
                                                <p className="text-[9px] text-slate-500 font-mono tracking-wider italic">Solo usuarios con suscripción activa verán este contenido.</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-4 p-5 bg-neon/5 rounded-2xl border border-neon/10 cursor-pointer hover:bg-neon/10 transition-all">
                                            <input type="checkbox" checked={formData.is_published} onChange={e => setFormData({ ...formData, is_published: e.target.checked })} className="w-5 h-5 accent-neon" />
                                            <div>
                                                <span className="text-xs font-black uppercase text-neon">DESPLEGAR REGISTRO</span>
                                                <p className="text-[9px] text-neon/40 font-mono tracking-wider italic">Si se desmarca, el recurso quedará oculto como borrador.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 mt-10">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-slate-400">Abortar</button>
                                <button type="submit" className="flex-1 py-4 bg-neon text-black rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(198,255,51,0.2)] hover:scale-[1.02] active:scale-95 transition-all">Ejecutar Comando</button>
                            </div>
                        </form>
                    </div>
                )}

                {showBulkModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleBulkUpload} className="glass w-full max-w-lg rounded-[2.5rem] border border-neon/30 p-10 shadow-2xl space-y-8">
                            <div>
                                <h2 className="text-2xl font-black uppercase flex items-center gap-3 italic tracking-tighter">
                                    <Database className="w-7 h-7 text-neon" /> Inyección de Datos Masiva
                                </h2>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Sincronización por protocolo CSV / JSON</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-[10px] text-slate-400 font-mono leading-relaxed relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10"><Database size={40} /></div>
                                    <p className="mb-3 text-white font-black underline underline-offset-4">ESTRUCTURA REQUERIDA:</p>
                                    <p className="text-neon/80 break-all select-all py-2 border-y border-white/5 mb-3">text, option_a, option_b, option_c, option_d, correct_answer, difficulty</p>
                                    <ul className="space-y-1 opacity-60">
                                        <li>• <b>correct_answer</b>: a | b | c | d</li>
                                        <li>• <b>difficulty</b>: easy | medium | hard</li>
                                    </ul>
                                </div>

                                <div 
                                    className="border-2 border-dashed border-white/10 hover:border-neon/40 transition-all p-12 rounded-[2rem] flex flex-col items-center justify-center text-center cursor-pointer bg-black/40 group" 
                                    onClick={() => document.getElementById('bulk-upload-file').click()}
                                >
                                    <div className="w-16 h-16 bg-neon/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(198,255,51,0.1)]">
                                        <UploadCloud className="w-8 h-8 text-neon" />
                                    </div>
                                    <span className="text-sm font-black text-white mb-1 uppercase tracking-tighter">Subir archivo de datos</span>
                                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Formatos admitidos: .json y .csv</span>
                                    <input type="file" id="bulk-upload-file" accept=".csv,.json" className="hidden" />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 py-4 bg-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500">Cancelar</button>
                                <button type="submit" className="flex-1 py-4 bg-neon text-black rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(198,255,51,0.2)] disabled:opacity-50" disabled={loading}>
                                    {loading ? 'Sincronizando...' : 'Iniciar Carga'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}