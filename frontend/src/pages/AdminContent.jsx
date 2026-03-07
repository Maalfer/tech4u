import React, { useState, useEffect, useRef } from 'react';
import {
    Database, ChevronRight, ArrowLeft,
    Trash2, Edit3, Plus, Search, FileText, UploadCloud, Eye, EyeOff
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

// Custom PNG Icons
import bbddIcon from '../assets/basededatos_icon.png';
import redesIcon from '../assets/redes_icon.png';
import soIcon from '../assets/sistemasoperativos_icon.png';
import hardwareIcon from '../assets/fundamentsohardware_icon.png';
import marcasIcon from '../assets/lenguajemarcas.png';
import ciberIcon from '../assets/ciberseguridad_icon.png';

const SUBJECTS = [
    { id: "Bases de Datos", icon: bbddIcon, color: "text-blue-400" },
    { id: "Redes", icon: redesIcon, color: "text-purple-400" },
    { id: "Sistemas Operativos", icon: soIcon, color: "text-orange-400" },
    { id: "Ciberseguridad", icon: ciberIcon, color: "text-red-400" },
    { id: "Fundamentos de Hardware", icon: hardwareIcon, color: "text-yellow-400" },
    { id: "Lenguaje de Marcas", icon: marcasIcon, color: "text-cyan-400" }
];

export default function AdminContent() {
    const [activeTab, setActiveTab] = useState('questions');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Modales y Forms
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    const fetchContent = async () => {
        if (!selectedSubject) return;
        setLoading(true);
        try {
            // CORRECCIÓN: Peticiones consistentes con los nuevos endpoints del backend
            if (activeTab === 'questions') {
                const res = await api.get('/admin/questions', { params: { subject: selectedSubject } });
                setQuestions(res.data);
            } else {
                const res = await api.get(
                    activeTab === 'resources'
                        ? '/resources/admin/all'
                        : `/resources/subject/${selectedSubject}`
                );
                setResources(res.data);
            }
        } catch (err) {
            console.error("Error al sincronizar sector:", err);
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
                file_type: 'pdf', url: '', requires_subscription: true
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
                // Al crear, forzamos que el subject sea el seleccionado en la carpeta
                await api.post(path, { ...formData, subject: selectedSubject });
            }
            setShowModal(false);
            fetchContent();
        } catch (err) {
            alert("Error en la operación del mainframe");
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('bulk-upload-file');
        if (!fileInput.files.length) return alert('Selecciona un archivo primero');

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

                        // Robust CSV line parser that handles commas inside quotes
                        const values = [];
                        let current = '';
                        let inQuotes = false;
                        for (let char of lines[i]) {
                            if (char === '"') {
                                inQuotes = !inQuotes;
                            } else if (char === ',' && !inQuotes) {
                                values.push(current.trim().replace(/^"|"$/g, ''));
                                current = '';
                            } else {
                                current += char;
                            }
                        }
                        values.push(current.trim().replace(/^"|"$/g, ''));

                        let obj = {};
                        headers.forEach((h, index) => {
                            obj[h] = values[index];
                        });

                        // Añadir o forzar el subject si no existe o se quiere sobreescribir
                        if (!obj.subject) obj.subject = selectedSubject;
                        // Defaults
                        if (!obj.difficulty) obj.difficulty = 'medium';
                        if (!obj.explanation) obj.explanation = '';

                        payload.push(obj);
                    }
                } else {
                    return alert('Formato no soportado. Usa CSV o JSON.');
                }

                // Asegurar que el subject sea el correcto
                payload = payload.map(item => ({ ...item, subject: selectedSubject }));

                setLoading(true);
                const res = await api.post('/admin/questions/bulk', payload);
                alert(`¡Éxito! ${res.data.imported_count} preguntas inyectadas al sistema.`);
                setShowBulkModal(false);
                fetchContent();
            } catch (err) {
                console.error(err);
                alert("Error crítico parseando el archivo o enviando al servidor.");
            } finally {
                setLoading(false);
            }
        };

        if (file.name.endsWith('.json') || file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            alert('Formato no soportado.');
        }
    };

    const handleTogglePublish = async (id, currentVal) => {
        try {
            await api.patch(`/resources/${id}/toggle-publish`);
            setResources(prev => prev.map(r => r.id === id ? { ...r, is_published: !currentVal } : r));
        } catch { alert('Error al cambiar estado de publicación.') }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Confirmas la purga de este registro?")) return;
        try {
            const path = activeTab === 'questions' ? `/admin/questions/${id}` : `/admin/resources/${id}`;
            await api.delete(path);
            fetchContent();
        } catch (err) {
            alert("Error al eliminar");
        }
    };

    // Filtrado local para el buscador
    const displayList = activeTab === 'questions' ? questions : resources;
    const filteredList = displayList.filter(item => {
        const textToSearch = activeTab === 'questions' ? item.text : item.title;
        return (textToSearch || "").toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">

                {/* Header Dinámico */}
                <PageHeader
                    title={<>Gestión de <span className="text-neon">{activeTab === 'questions' ? 'Preguntas' : 'Recursos'}</span></>}
                    subtitle={selectedSubject ? `Sector Activo: ${selectedSubject}` : "Selección de unidad de almacenamiento"}
                    Icon={Database}
                    gradient="from-white via-slate-100 to-neon"
                    iconColor="text-neon"
                    iconBg="bg-neon/20"
                    iconBorder="border-neon/30"
                    glowColor="bg-neon/20"
                >
                    <div className="flex bg-black/40 border border-slate-800 rounded-xl p-1">
                        <button
                            onClick={() => { setActiveTab('questions'); setSelectedSubject(null) }}
                            className={`px-4 py-2 text-[10px] font-mono rounded-lg transition-all uppercase tracking-widest ${activeTab === 'questions' ? 'bg-neon/10 text-neon border border-neon/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            Preguntas
                        </button>
                        <button
                            onClick={() => { setActiveTab('resources'); setSelectedSubject(null) }}
                            className={`px-4 py-2 text-[10px] font-mono rounded-lg transition-all uppercase tracking-widest ${activeTab === 'resources' ? 'bg-neon/10 text-neon border border-neon/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            Recursos
                        </button>
                    </div>
                </PageHeader>

                {!selectedSubject ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
                        {SUBJECTS.map((sub) => (
                            <button key={sub.id} onClick={() => setSelectedSubject(sub.id)}
                                className="glass p-10 rounded-3xl border border-slate-800 flex items-center gap-8 group hover:border-neon/40 hover:bg-neon/5 transition-all text-left w-full">
                                <div className="w-20 h-20 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <img src={sub.icon} alt={sub.id} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                    <span className={`font-black uppercase tracking-[0.1em] text-lg block mb-2 ${sub.color}`}>{sub.id}</span>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 group-hover:text-white transition-colors">
                                        EXPLORAR DIRECTORIO <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex justify-between items-center">
                            <button onClick={() => setSelectedSubject(null)} className="flex items-center gap-2 text-slate-500 hover:text-neon transition-colors text-[10px] font-mono uppercase tracking-widest">
                                <ArrowLeft className="w-4 h-4" /> Volver a directorios
                            </button>

                            <div className="flex gap-4">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        className="bg-black border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-neon outline-none w-64 focus:border-neon"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {activeTab === 'questions' && (
                                    <button onClick={() => setShowBulkModal(true)} className="px-4 py-2 border border-neon text-neon rounded-xl font-black uppercase text-[10px] flex items-center gap-2 hover:bg-neon/10 transition-colors">
                                        <Database className="w-4 h-4" /> Importar Lote
                                    </button>
                                )}

                                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-neon text-black rounded-xl font-black uppercase text-[10px] flex items-center gap-2 hover:shadow-[0_0_15px_var(--neon-alpha-40)]">
                                    <Plus className="w-4 h-4" /> Subir {activeTab === 'questions' ? 'Pregunta' : 'Recurso'}
                                </button>
                            </div>
                        </div>

                        <div className="glass rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                            <table className="w-full text-left text-[11px] font-mono">
                                <thead className="bg-white/5 text-slate-500 uppercase font-bold">
                                    <tr>
                                        <th className="p-5">{activeTab === 'questions' ? 'ID' : 'Tipo'}</th>
                                        <th className="p-5">Título / Contenido</th>
                                        <th className="p-5">{activeTab === 'questions' ? 'Nivel' : 'Acceso'}</th>
                                        <th className="p-5 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredList.map((item) => (
                                        <tr key={item.id} className="hover:bg-neon/5 transition-colors group">
                                            <td className="p-5">
                                                {activeTab === 'questions' ? (
                                                    <span className="text-neon/60 font-black">#{item.id}</span>
                                                ) : (
                                                    <FileText className={`w-4 h-4 ${item.file_type === 'pdf' ? 'text-red-400' : 'text-blue-400'}`} />
                                                )}
                                            </td>
                                            <td className="p-5 text-slate-300 max-w-md truncate">
                                                {activeTab === 'questions' ? item.text : item.title}
                                            </td>
                                            <td className="p-5 uppercase font-bold">
                                                {activeTab === 'questions' ? (
                                                    <span className="px-2 py-0.5 rounded border border-white/10 text-[9px]">{item.difficulty}</span>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`text-[9px] ${item.requires_subscription ? 'text-yellow-500' : 'text-green-500'}`}>
                                                            {item.requires_subscription ? 'PREMIUM' : 'OPEN'}
                                                        </span>
                                                        <span className={`text-[9px] font-black ${item.is_published ? 'text-neon' : 'text-slate-600'
                                                            }`}>
                                                            {item.is_published ? '● PUBLICADO' : '○ BORRADOR'}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {activeTab === 'resources' && (
                                                        <button
                                                            onClick={() => handleTogglePublish(item.id, item.is_published)}
                                                            title={item.is_published ? 'Ocultar a alumnos' : 'Publicar para alumnos'}
                                                            className={`p-2 rounded-lg transition-all ${item.is_published
                                                                ? 'bg-neon/10 text-neon hover:bg-red-500/10 hover:text-red-400'
                                                                : 'bg-white/5 text-slate-600 hover:text-neon'
                                                                }`}
                                                        >
                                                            {item.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleOpenModal(item)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-neon transition-all"><Edit3 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredList.length === 0 && !loading && (
                                <div className="p-10 text-center text-slate-600 font-mono text-[10px] uppercase tracking-widest">No hay datos en este sector</div>
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL UNIFICADO */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                        <form onSubmit={handleSubmit} className="glass w-full max-w-2xl rounded-3xl border border-neon/30 p-8 overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2 italic">
                                <UploadCloud className="w-5 h-5 text-neon" /> {isEditing ? 'Sincronizar' : 'Inyectar'} {activeTab === 'questions' ? 'Pregunta' : 'Recurso'}
                            </h2>

                            {activeTab === 'questions' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest">Sector</label>
                                            <input value={selectedSubject} readOnly className="w-full bg-black/50 border border-slate-800 rounded-xl p-3 text-xs text-slate-400" /></div>
                                        <div><label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest">Dificultad</label>
                                            <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-neon">
                                                <option value="easy">Fácil</option><option value="medium">Media</option><option value="hard">Difícil</option>
                                            </select></div>
                                    </div>
                                    <textarea placeholder="Enunciado de la pregunta..." value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })} required className="w-full bg-black border border-slate-800 rounded-xl p-4 text-xs text-white h-24 focus:border-neon outline-none" />
                                    <div className="grid grid-cols-2 gap-4">
                                        {['a', 'b', 'c', 'd'].map(opt => (
                                            <input key={opt} placeholder={`Opción ${opt.toUpperCase()}`} value={formData[`option_${opt}`]} onChange={e => setFormData({ ...formData, [`option_${opt}`]: e.target.value })} required className="bg-black border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-neon" />
                                        ))}
                                    </div>
                                    <select value={formData.correct_answer} onChange={e => setFormData({ ...formData, correct_answer: e.target.value })} className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white">
                                        <option value="a">Correcta: A</option><option value="b">Correcta: B</option><option value="c">Correcta: C</option><option value="d">Correcta: D</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest">Título</label>
                                            <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-neon" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest">Tipo</label>
                                            <select value={formData.file_type} onChange={e => setFormData({ ...formData, file_type: e.target.value })} className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white">
                                                <option value="pdf">PDF</option><option value="cheatsheet">Cheat Sheet</option><option value="video">Video</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest">Ruta (Public/Resources)</label>
                                            <input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} placeholder="/resources/archivo.pdf" className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-neon" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <input type="checkbox" checked={formData.requires_subscription} onChange={e => setFormData({ ...formData, requires_subscription: e.target.checked })} className="w-4 h-4 accent-[var(--color-neon)]" />
                                        <span className="text-xs font-mono text-slate-300">Restringir a usuarios PREMIUM</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-neon/5 rounded-xl border border-neon/20">
                                        <input type="checkbox" checked={formData.is_published || false} onChange={e => setFormData({ ...formData, is_published: e.target.checked })} className="w-4 h-4 accent-[var(--color-neon)]" />
                                        <div>
                                            <span className="text-xs font-mono text-white font-black">Publicar recurso</span>
                                            <p className="text-[10px] font-mono text-slate-500">Si está desmarcado, sólo tú lo verás (borrador)</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase hover:bg-white/10 transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-neon text-black rounded-xl text-xs font-black uppercase shadow-[0_0_20px_var(--neon-alpha-40)]">Confirmar Operación</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* MODAL BULK UPLOAD */}
                {showBulkModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                        <form onSubmit={handleBulkUpload} className="glass w-full max-w-lg rounded-3xl border border-neon/30 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2 italic">
                                <Database className="w-5 h-5 text-neon" /> Importar Lote CSV / JSON
                            </h2>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl border border-slate-700 bg-black/50 text-xs text-slate-400 font-mono leading-relaxed">
                                    <p className="mb-2 text-white">Formato CSV esperado:</p>
                                    <p className="text-neon/70 break-all">subject, text, option_a, option_b, option_c, option_d, correct_answer, difficulty, explanation</p>
                                    <p className="mt-2">- <b>correct_answer</b>: a, b, c, o d</p>
                                    <p>- <b>difficulty</b>: easy, medium, hard</p>
                                </div>

                                <div className="border-2 border-dashed border-slate-700 hover:border-neon/50 transition-colors p-8 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer bg-black/20" onClick={() => document.getElementById('bulk-upload-file').click()}>
                                    <UploadCloud className="w-10 h-10 text-slate-500 mb-3" />
                                    <span className="text-sm font-bold text-white mb-1">Haz clic para seleccionar el archivo</span>
                                    <span className="text-xs font-mono text-slate-500">.csv o .json</span>
                                    <input type="file" id="bulk-upload-file" accept=".csv,.json" className="hidden" />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase hover:bg-white/10 transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-neon text-black rounded-xl text-xs font-black uppercase shadow-[0_0_20px_var(--neon-alpha-40)]" disabled={loading}>
                                    {loading ? 'Procesando...' : 'Iniciar Inyección'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}