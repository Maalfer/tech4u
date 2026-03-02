import React, { useState, useEffect } from 'react';
import { 
    Database, BookOpen, ChevronRight, ArrowLeft, 
    Trash2, Edit3, Plus, Search, FileText, UploadCloud, ShieldCheck 
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const SUBJECTS = [
    { id: "Bases de Datos", icon: "🗄️", color: "text-blue-400" },
    { id: "Redes", icon: "🌐", color: "text-purple-400" },
    { id: "Sistemas Operativos", icon: "💻", color: "text-orange-400" },
    { id: "Ciberseguridad", icon: "🛡️", color: "text-red-400" },
    { id: "Programación", icon: "🚀", color: "text-yellow-400" }
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
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    const fetchContent = async () => {
        if (!selectedSubject) return;
        setLoading(true);
        try {
            // CORRECCIÓN: Peticiones consistentes con los nuevos endpoints del backend
            if (activeTab === 'questions') {
                const res = await api.get(`/admin/questions`, { params: { subject: selectedSubject } });
                setQuestions(res.data);
            } else {
                const res = await api.get(`/resources/subject/${selectedSubject}`);
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
        return textToSearch?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                
                {/* Header Dinámico */}
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Database className="w-8 h-8 text-[#39FF14]" />
                            <h1 className="text-3xl font-black uppercase tracking-tighter italic">
                                GESTIÓN DE <span className="text-[#39FF14]">{activeTab === 'questions' ? 'PREGUNTAS' : 'RECURSOS'}</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest italic">
                            {selectedSubject ? `Sector Activo: ${selectedSubject}` : "Selección de unidad de almacenamiento"}
                        </p>
                    </div>

                    <div className="flex bg-black/40 border border-slate-800 rounded-xl p-1">
                        <button onClick={() => {setActiveTab('questions'); setSelectedSubject(null)}} className={`px-4 py-2 text-xs font-mono rounded-lg transition-all ${activeTab === 'questions' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' : 'text-slate-500'}`}>Preguntas</button>
                        <button onClick={() => {setActiveTab('resources'); setSelectedSubject(null)}} className={`px-4 py-2 text-xs font-mono rounded-lg transition-all ${activeTab === 'resources' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' : 'text-slate-500'}`}>Recursos</button>
                    </div>
                </header>

                {!selectedSubject ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
                        {SUBJECTS.map((sub) => (
                            <button key={sub.id} onClick={() => setSelectedSubject(sub.id)}
                                className="glass p-10 rounded-3xl border border-slate-800 flex flex-col items-center gap-6 group hover:border-[#39FF14]/40 hover:bg-[#39FF14]/5 transition-all">
                                <div className="text-4xl group-hover:scale-110 transition-transform">{sub.icon}</div>
                                <span className={`font-black uppercase tracking-widest text-sm ${sub.color}`}>{sub.id}</span>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 group-hover:text-white transition-colors">
                                    EXPLORAR DIRECTORIO <ChevronRight className="w-3 h-3" />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex justify-between items-center">
                            <button onClick={() => setSelectedSubject(null)} className="flex items-center gap-2 text-slate-500 hover:text-[#39FF14] transition-colors text-[10px] font-mono uppercase tracking-widest">
                                <ArrowLeft className="w-4 h-4" /> Volver a directorios
                            </button>
                            
                            <div className="flex gap-4">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar..." 
                                        className="bg-black border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-[#39FF14] outline-none w-64 focus:border-[#39FF14]"
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                    />
                                </div>
                                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-[#39FF14] text-black rounded-xl font-black uppercase text-[10px] flex items-center gap-2 hover:shadow-[0_0_15px_rgba(57,255,20,0.4)]">
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
                                        <tr key={item.id} className="hover:bg-[#39FF14]/5 transition-colors group">
                                            <td className="p-5">
                                                {activeTab === 'questions' ? (
                                                    <span className="text-[#39FF14]/60 font-black">#0{item.id}</span>
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
                                                    <span className={`text-[9px] ${item.requires_subscription ? 'text-yellow-500' : 'text-green-500'}`}>
                                                        {item.requires_subscription ? 'PREMIUM' : 'OPEN'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleOpenModal(item)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-[#39FF14] transition-all"><Edit3 className="w-4 h-4" /></button>
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
                        <form onSubmit={handleSubmit} className="glass w-full max-w-2xl rounded-3xl border border-[#39FF14]/30 p-8 overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2 italic">
                                <UploadCloud className="w-5 h-5 text-[#39FF14]" /> {isEditing ? 'Sincronizar' : 'Inyectar'} {activeTab === 'questions' ? 'Pregunta' : 'Recurso'}
                            </h2>
                            
                            {activeTab === 'questions' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest">Sector</label>
                                            <input value={selectedSubject} readOnly className="w-full bg-black/50 border border-slate-800 rounded-xl p-3 text-xs text-slate-400" /></div>
                                        <div><label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest">Dificultad</label>
                                            <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-[#39FF14]">
                                                <option value="easy">Fácil</option><option value="medium">Media</option><option value="hard">Difícil</option>
                                            </select></div>
                                    </div>
                                    <textarea placeholder="Enunciado de la pregunta..." value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} required className="w-full bg-black border border-slate-800 rounded-xl p-4 text-xs text-white h-24 focus:border-[#39FF14] outline-none" />
                                    <div className="grid grid-cols-2 gap-4">
                                        {['a', 'b', 'c', 'd'].map(opt => (
                                            <input key={opt} placeholder={`Opción ${opt.toUpperCase()}`} value={formData[`option_${opt}`]} onChange={e => setFormData({...formData, [`option_${opt}`]: e.target.value})} required className="bg-black border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-[#39FF14]" />
                                        ))}
                                    </div>
                                    <select value={formData.correct_answer} onChange={e => setFormData({...formData, correct_answer: e.target.value})} className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white">
                                        <option value="a">Correcta: A</option><option value="b">Correcta: B</option><option value="c">Correcta: C</option><option value="d">Correcta: D</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest">Título</label>
                                            <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-[#39FF14]" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest">Tipo</label>
                                            <select value={formData.file_type} onChange={e => setFormData({...formData, file_type: e.target.value})} className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white">
                                                <option value="pdf">PDF</option><option value="cheatsheet">Cheat Sheet</option><option value="video">Video</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-mono text-slate-500 uppercase ml-2 tracking-widest">Ruta (Public/Resources)</label>
                                            <input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="/resources/archivo.pdf" className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-[#39FF14]" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <input type="checkbox" checked={formData.requires_subscription} onChange={e => setFormData({...formData, requires_subscription: e.target.checked})} className="w-4 h-4 accent-[#39FF14]" />
                                        <span className="text-xs font-mono text-slate-300">Restringir a usuarios PREMIUM</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase hover:bg-white/10 transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-[#39FF14] text-black rounded-xl text-xs font-black uppercase shadow-[0_0_20px_rgba(57,255,20,0.4)]">Confirmar Operación</button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}