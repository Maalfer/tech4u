import React, { useEffect, useState, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import {
    BookOpen,
    Plus,
    Check,
    Trash2,
    ChevronLeft,
    FileText,
    AlertCircle,
    ArrowRight,
    Settings,
    Layers,
    Monitor,
    Wifi,
    Database,
    Cpu,
    FileCode,
    Zap,
    Sparkles
} from 'lucide-react';

const SUBJECT_STYLES = {
    'general': { icon: Zap, color: 'from-yellow-600/20 to-yellow-900/10 border-yellow-500/30 hover:border-yellow-400/60', iconColor: 'text-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    'Bases de Datos': { icon: Database, color: 'from-violet-600/20 to-violet-900/10 border-violet-500/30 hover:border-violet-400/60', iconColor: 'text-violet-400', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
    'Redes': { icon: Wifi, color: 'from-sky-600/20 to-sky-900/10 border-sky-500/30 hover:border-sky-400/60', iconColor: 'text-sky-400', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    'Sistemas Operativos': { icon: Monitor, color: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30 hover:border-emerald-400/60', iconColor: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    'Fundamentos de Hardware': { icon: Cpu, color: 'from-orange-600/20 to-orange-900/10 border-orange-500/30 hover:border-orange-400/60', iconColor: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    'Lenguaje de Marcas': { icon: FileCode, color: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/30 hover:border-cyan-400/60', iconColor: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
};

const DEFAULT_STYLE = { icon: BookOpen, color: 'from-slate-600/20 to-slate-900/10 border-slate-500/30 hover:border-slate-400/60', iconColor: 'text-slate-400', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };

export default function AdminTeoria() {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [posts, setPosts] = useState([]);
    const [editingPost, setEditingPost] = useState(null);
    const [view, setView] = useState('subjects'); // 'subjects' | 'posts' | 'editor'

    // Form states
    const [subjectForm, setSubjectForm] = useState({ name: '', description: '', icon: '📚' });
    const [postForm, setPostForm] = useState({ title: '', markdown_content: '', subject_slug: '' });
    const [status, setStatus] = useState({ msg: '', type: '' });
    const [loading, setLoading] = useState(false);

    const showStatus = (msg, type = 'success') => {
        setStatus({ msg, type });
        setTimeout(() => setStatus({ msg: '', type: '' }), 4000);
    };

    const loadSubjects = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.get('/teoria/subjects');
            setSubjects(Array.isArray(r.data) ? r.data : []);
        } catch (err) {
            showStatus('Error cargando asignaturas', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadSubjects(); }, [loadSubjects]);

    const loadPosts = async (subject) => {
        setLoading(true);
        setSelectedSubject(subject);
        try {
            const r = await api.get(`/teoria/subjects/${subject.slug}`);
            setPosts(r.data.posts || []);
            setView('posts');
        } catch (err) {
            showStatus('Error cargando artículos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openEditor = (post = null) => {
        if (post) {
            setLoading(true);
            api.get(`/teoria/subjects/${selectedSubject.slug}/posts/${post.slug}`)
                .then(r => {
                    setEditingPost(r.data);
                    setPostForm({
                        title: r.data.title,
                        markdown_content: r.data.markdown_content,
                        subject_slug: selectedSubject.slug
                    });
                    setView('editor');
                    setLoading(false);
                })
                .catch(() => {
                    showStatus('Error al abrir el editor', 'error');
                    setLoading(false);
                });
        } else {
            setEditingPost(null);
            setPostForm({
                title: '',
                markdown_content: '# Nuevo Artículo\n\nEscribe aquí...',
                subject_slug: selectedSubject?.slug || ''
            });
            setView('editor');
        }
    };

    const savePost = async () => {
        if (!postForm.title.trim() || !postForm.subject_slug) {
            showStatus('Título y asignatura obligatorios', 'error');
            return;
        }
        setLoading(true);
        try {
            let res;
            if (editingPost) {
                res = await api.put(`/teoria/posts/${editingPost.slug}`, postForm);
            } else {
                res = await api.post(`/teoria/subjects/${postForm.subject_slug}/posts`, postForm);
            }

            if (res.status === 200 || res.status === 201) {
                showStatus('Artículo guardado con éxito');
                const targetSub = subjects.find(s => s.slug === postForm.subject_slug);
                if (targetSub) loadPosts(targetSub);
                else setView('subjects');
            }
        } catch (err) {
            showStatus('Error al guardar', 'error');
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (slug) => {
        if (!window.confirm('¿Eliminar este artículo?')) return;
        try {
            await api.delete(`/teoria/posts/${slug}`);
            showStatus('Artículo eliminado');
            loadPosts(selectedSubject);
        } catch (err) {
            showStatus('Error al eliminar', 'error');
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">

                <PageHeader
                    title={<>Admin<span className="text-white"> Teoría</span></>}
                    subtitle={view === 'subjects' ? 'Dungeon Editor — Selecciona Asignatura' :
                        view === 'posts' ? `Material de ${selectedSubject?.name}` :
                            'Redactor de Material'}
                    Icon={Settings}
                    gradient="from-white via-[#c6ff33] to-emerald-500"
                    iconColor="text-[#c6ff33]"
                    iconBg="bg-[#c6ff33]/20"
                    iconBorder="border-[#c6ff33]/30"
                    glowColor="bg-[#c6ff33]/20"
                >
                    {status.msg && (
                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 animate-in fade-in zoom-in duration-300 ${status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-neon/10 border-neon/30 text-neon'}`}>
                            {status.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
                            <span className="text-[10px] font-mono uppercase font-bold tracking-widest">{status.msg}</span>
                        </div>
                    )}
                </PageHeader>

                {/* ── SUBJECTS VIEW ── */}
                {view === 'subjects' && (
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subjects.map(s => {
                                const style = SUBJECT_STYLES[s.name] || DEFAULT_STYLE;
                                const Icon = style.icon;

                                return (
                                    <div
                                        key={s.id}
                                        onClick={() => loadPosts(s)}
                                        className={`group glass rounded-[2rem] p-8 border-2 bg-gradient-to-br ${style.color} text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] cursor-pointer relative overflow-hidden`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                            <Icon className={`w-7 h-7 ${style.iconColor}`} />
                                        </div>
                                        <h3 className="text-lg font-black uppercase italic text-white leading-tight mb-2 group-hover:text-white">
                                            {s.name}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest line-clamp-2 h-8">
                                            {s.description || 'Sin descripción técnica.'}
                                        </p>
                                        <div className="flex items-center justify-between mt-8">
                                            <span className={`text-[10px] font-mono uppercase px-3 py-1 rounded-full border ${style.badge} font-bold`}>
                                                {s.post_count} Artículos
                                            </span>
                                            <div className="flex items-center gap-2 text-[10px] font-mono text-neon uppercase tracking-widest font-bold group-hover:translate-x-1 transition-transform">
                                                GESTIONAR material <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── POSTS VIEW ── */}
                {view === 'posts' && selectedSubject && (
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-10">
                            <button onClick={() => setView('subjects')} className="flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-white transition-colors uppercase tracking-[0.3em] group">
                                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a Asignaturas
                            </button>
                            <button
                                onClick={() => openEditor(null)}
                                className="bg-neon text-black font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-xl hover:scale-[1.02] transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(198,255,51,0.3)]"
                            >
                                <Plus size={16} /> NUEVO ARTÍCULO
                            </button>
                        </div>

                        <div className="space-y-4">
                            {posts.length === 0 ? (
                                <div className="glass rounded-[2rem] p-16 border-2 border-dashed border-white/5 text-center">
                                    <FileText className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest font-bold">Sin material en esta sección</p>
                                </div>
                            ) : (
                                posts.map((p, idx) => (
                                    <div key={p.id} className="glass rounded-[2rem] p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-slate-500">
                                                <span className="font-mono text-xs opacity-50">{String(idx + 1).padStart(2, '0')}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">{p.title}</h3>
                                                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                                                    Slug: /{p.slug} · Actualizado: {new Date(p.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditor(p)}
                                                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-300 hover:border-neon hover:text-neon transition-all"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => deletePost(p.slug)}
                                                className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ── EDITOR VIEW ── */}
                {view === 'editor' && (
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="flex justify-between items-center mb-8">
                            <button onClick={() => setView(selectedSubject ? 'posts' : 'subjects')} className="flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-white transition-colors uppercase tracking-[0.3em] group">
                                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Descartar cambios
                            </button>
                            <button
                                onClick={savePost}
                                className="bg-neon text-black font-black uppercase text-[11px] tracking-[0.2em] px-12 py-5 rounded-2xl hover:scale-[1.02] transition-transform shadow-[0_10px_40px_rgba(198,255,51,0.2)]"
                            >
                                {editingPost ? 'ACTUALIZAR ARTÍCULO' : 'PUBLICAR EN ESTA ASIGNATURA'}
                            </button>
                        </div>

                        <div className="glass rounded-[2rem] p-10 border border-neon/20 shadow-[0_40px_100px_-20px_rgba(198,255,51,0.05)]">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 block font-bold flex items-center gap-2">
                                        <FileText size={12} /> Título del Material
                                    </label>
                                    <input
                                        value={postForm.title}
                                        onChange={e => setPostForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Ej: Análisis de protocolos TCP/IP"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl font-bold text-white focus:border-neon outline-none"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 block font-bold flex items-center gap-2">
                                        <Layers size={12} /> Asignatura Vinculada
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={postForm.subject_slug}
                                            onChange={e => setPostForm(p => ({ ...p, subject_slug: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-neon outline-none appearance-none"
                                        >
                                            <option value="" disabled className="bg-[#0d0d0d]">Selecciona destino...</option>
                                            {subjects.map(s => (
                                                <option key={s.slug} value={s.slug} className="bg-[#0d0d0d]">{s.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <Sparkles size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div data-color-mode="dark" className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                                <MDEditor
                                    value={postForm.markdown_content}
                                    onChange={val => setPostForm(p => ({ ...p, markdown_content: val || '' }))}
                                    height={550}
                                    preview="live"
                                    style={{ background: 'transparent' }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
