import { useState, useEffect } from 'react';
import { Video, Plus, Edit2, Trash2, X, ChevronRight, Save, Layout } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

export default function AdminVideoCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' | 'course_form' | 'lessons_manager'
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Forms
    const [courseForm, setCourseForm] = useState({ title: '', description: '', thumbnail_url: '' });
    const [lessonForm, setLessonForm] = useState({ title: '', description: '', youtube_url: '', order_index: 0 });
    const [editingLessonId, setEditingLessonId] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/video-courses/');
            setCourses(res.data);
        } catch (err) {
            (import.meta.env.DEV && console.error)(err);
        } finally {
            setLoading(false);
        }
    };

    // --- CURSE CRUD ---
    const handleSaveCourse = async (e) => {
        e.preventDefault();
        try {
            if (selectedCourse) {
                await api.put(`/admin/video-courses/${selectedCourse.id}`, courseForm);
            } else {
                await api.post('/admin/video-courses/', courseForm);
            }
            await fetchCourses();
            setView('list');
            setSelectedCourse(null);
        } catch (err) {
            (import.meta.env.DEV && console.error)(err);
            alert("Error al guardar curso");
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este curso y todas sus clases?")) return;
        try {
            await api.delete(`/admin/video-courses/${id}`);
            await fetchCourses();
        } catch (err) {
            (import.meta.env.DEV && console.error)(err);
        }
    };

    // --- LESSON CRUD ---
    const handleManageLessons = (course) => {
        setSelectedCourse(course);
        setEditingLessonId(null);
        setLessonForm({ title: '', description: '', youtube_url: '', order_index: Math.max(...(course.lessons?.map(l => l.order_index) || [0])) + 1 });
        setView('lessons_manager');
    };

    const handleSaveLesson = async (e) => {
        e.preventDefault();
        try {
            if (editingLessonId) {
                await api.put(`/admin/video-courses/lessons/${editingLessonId}`, lessonForm);
            } else {
                await api.post(`/admin/video-courses/${selectedCourse.id}/lessons`, lessonForm);
            }
            // Refetch y actuailzar estado
            const res = await api.get(`/video-courses/${selectedCourse.id}`);
            setSelectedCourse(res.data);

            setEditingLessonId(null);
            setLessonForm({ title: '', description: '', youtube_url: '', order_index: res.data.lessons.length + 1 });
            // Necesario refrescar lista principal para reflejar conteo de clases
            fetchCourses();
        } catch (err) {
            (import.meta.env.DEV && console.error)(err);
            alert("Error al guardar lección");
        }
    };

    const handleDeleteLesson = async (id) => {
        if (!window.confirm("¿Eliminar esta clase?")) return;
        try {
            await api.delete(`/admin/video-courses/lessons/${id}`);
            const res = await api.get(`/video-courses/${selectedCourse.id}`);
            setSelectedCourse(res.data);
            fetchCourses();
        } catch (err) {
            (import.meta.env.DEV && console.error)(err);
        }
    };

    if (loading) return (
        <div className="flex min-h-screen bg-[#0D0D0D]"><Sidebar /><main className="flex-1 ml-64 p-8 text-white">Cargando...</main></div>
    );

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">

                {/* HEADERS */}
                <PageHeader
                    title={<>YT <span className="text-red-500">Videos</span></>}
                    subtitle="Gestión de material de apoyo gratuito linkado de YouTube."
                    Icon={Video}
                    gradient="from-white via-slate-100 to-neon"
                    iconColor="text-red-500"
                    iconBg="bg-red-500/20"
                    iconBorder="border-red-500/30"
                    glowColor="bg-red-500/20"
                >
                    {view === 'list' && (
                        <button
                            onClick={() => { setSelectedCourse(null); setCourseForm({ title: '', description: '', thumbnail_url: '' }); setView('course_form'); }}
                            className="px-6 py-3 bg-red-600 text-white font-black uppercase tracking-wider rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                        >
                            <Plus className="w-5 h-5" />
                            Nuevo Álbum
                        </button>
                    )}
                </PageHeader>

                {view === 'list' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div key={course.id} className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center border border-white/10 mb-4">
                                        <Video className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h3 className="text-white font-black uppercase text-lg mb-2">{course.title}</h3>
                                    <p className="text-slate-500 font-mono text-[10px] mb-6">{course.lessons?.length || 0} Lecciones</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleManageLessons(course)}
                                        className="w-full py-2 bg-white/5 text-white font-mono text-xs uppercase tracking-wide rounded-lg hover:bg-white/10 transition-colors flex justify-center items-center gap-2"
                                    >
                                        <Layout className="w-4 h-4" /> Temario
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setSelectedCourse(course); setCourseForm({ title: course.title, description: course.description || '', thumbnail_url: course.thumbnail_url || '' }); setView('course_form'); }}
                                            className="flex-1 py-2 bg-blue-500/10 text-blue-400 font-mono text-xs uppercase tracking-wide rounded-lg hover:bg-blue-500/20 transition-colors flex justify-center items-center gap-2"
                                        >
                                            <Edit2 className="w-3 h-3" /> Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCourse(course.id)}
                                            className="flex-1 py-2 bg-red-500/10 text-red-400 font-mono text-xs uppercase tracking-wide rounded-lg hover:bg-red-500/20 transition-colors flex justify-center items-center gap-2"
                                        >
                                            <Trash2 className="w-3 h-3" /> Borrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* VIEW: COURSE FORM */}
                {view === 'course_form' && (
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setView('list')} className="w-10 h-10 bg-white/5 rounded-full flex justify-center items-center hover:bg-white/10 transition-colors">
                                <X className="w-5 h-5 text-white" />
                            </button>
                            <h2 className="text-2xl font-black text-white uppercase">{selectedCourse ? 'Editar Álbum' : 'Nuevo Álbum'}</h2>
                        </div>

                        <form onSubmit={handleSaveCourse} className="bg-[#111] border border-white/5 rounded-3xl p-8 space-y-6">
                            <div>
                                <label className="block text-red-500 font-mono text-xs uppercase tracking-wider mb-2">Título del Álbum</label>
                                <input required type="text" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-red-500 outline-none transition-colors" placeholder="Ej: Fundamentos de Networking" />
                            </div>
                            <div>
                                <label className="block text-red-500 font-mono text-xs uppercase tracking-wider mb-2">Descripción (Opcional)</label>
                                <textarea value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-red-500 outline-none transition-colors h-32" placeholder="Resumen de lo que se aprenderá..."></textarea>
                            </div>
                            <div>
                                <label className="block text-red-500 font-mono text-xs uppercase tracking-wider mb-2">URL Miniatura (Opcional)</label>
                                <input type="url" value={courseForm.thumbnail_url} onChange={e => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-red-500 outline-none transition-colors" placeholder="https://ejemplo.com/imagen.jpg" />
                            </div>
                            <button type="submit" className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-wider rounded-xl hover:scale-105 transition-transform flex justify-center items-center gap-2">
                                <Save className="w-5 h-5" /> Guardar Álbum
                            </button>
                        </form>
                    </div>
                )}

                {/* VIEW: LESSONS MANAGER */}
                {view === 'lessons_manager' && selectedCourse && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                        {/* Editor de Lección (Left) */}
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <button onClick={() => setView('list')} className="w-10 h-10 bg-white/5 rounded-full flex justify-center items-center hover:bg-white/10 transition-colors">
                                    <X className="w-5 h-5 text-white" />
                                </button>
                                <div>
                                    <p className="text-red-500 font-mono text-[10px] uppercase">Gestionar Lecciones</p>
                                    <h2 className="text-2xl font-black text-white uppercase">{selectedCourse.title}</h2>
                                </div>
                            </div>

                            <form onSubmit={handleSaveLesson} className="bg-[#111] border border-red-500/30 rounded-3xl p-8 space-y-6">
                                <h3 className="text-white font-mono text-sm border-b border-white/10 pb-4 mb-4">
                                    {editingLessonId ? 'Editar Clase Existente' : 'Añadir Nueva Clase'}
                                </h3>
                                <div>
                                    <label className="block text-slate-400 font-mono text-xs uppercase tracking-wider mb-2">Título de la Clase</label>
                                    <input required type="text" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-neon outline-none" placeholder="Ej: 1. Introducción a la Navegación" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-mono text-xs uppercase tracking-wider mb-2">URL de YouTube</label>
                                    <input required type="url" value={lessonForm.youtube_url} onChange={e => setLessonForm({ ...lessonForm, youtube_url: e.target.value })} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-red-500 font-mono text-sm focus:border-red-500 outline-none" placeholder="https://www.youtube.com/watch?v=..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-slate-400 font-mono text-xs uppercase tracking-wider mb-2">Descripción (Text/Links permitidos)</label>
                                        <textarea value={lessonForm.description} onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-neon outline-none h-24"></textarea>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-slate-400 font-mono text-xs uppercase tracking-wider mb-2">Orden (Index)</label>
                                        <input required type="number" min="0" value={lessonForm.order_index} onChange={e => setLessonForm({ ...lessonForm, order_index: parseInt(e.target.value) })} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-neon outline-none" />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4 border-t border-white/10">
                                    <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-black uppercase tracking-wider rounded-xl hover:scale-105 transition-transform flex justify-center items-center gap-2">
                                        <Save className="w-4 h-4" /> Guardar Lección
                                    </button>
                                    {editingLessonId && (
                                        <button type="button" onClick={() => { setEditingLessonId(null); setLessonForm({ title: '', description: '', youtube_url: '', order_index: selectedCourse.lessons.length + 1 }); }} className="py-3 px-6 bg-white/5 text-white font-mono text-xs uppercase tracking-wider rounded-xl hover:bg-white/10 transition-colors">
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Listado de Lecciones (Right) */}
                        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 lg:h-[calc(100vh-12rem)] flex flex-col">
                            <h3 className="text-white font-black uppercase text-lg mb-4 flex items-center justify-between">
                                Temario Actual
                                <span className="text-red-500 font-mono text-[10px] px-3 py-1 bg-red-500/10 rounded-full">{selectedCourse.lessons?.length || 0} Lecciones</span>
                            </h3>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                {selectedCourse.lessons?.length === 0 ? (
                                    <div className="text-slate-500 font-mono text-sm text-center py-8">No hay clases registradas en este curso.</div>
                                ) : (
                                    [...(selectedCourse.lessons || [])].sort((a, b) => a.order_index - b.order_index).map((lesson, idx) => (
                                        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors ${editingLessonId === lesson.id ? 'bg-red-500/5 border-red-500/50' : 'bg-black border-white/5 hover:border-white/20'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 font-mono text-xs font-bold">{lesson.order_index}</div>
                                                <div>
                                                    <h4 className="text-white font-mono text-sm font-bold truncate max-w-[200px] xl:max-w-[300px]">{lesson.title}</h4>
                                                    <a href={lesson.youtube_url} target="_blank" rel="noreferrer" className="text-red-500 hover:underline font-mono text-[10px] uppercase truncate inline-block max-w-[150px]">Link YouTube</a>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingLessonId(lesson.id); setLessonForm({ title: lesson.title, description: lesson.description || '', youtube_url: lesson.youtube_url, order_index: lesson.order_index }); }} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20"><Edit2 className="w-3 h-3" /></button>
                                                <button onClick={() => handleDeleteLesson(lesson.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div >
    );
}
