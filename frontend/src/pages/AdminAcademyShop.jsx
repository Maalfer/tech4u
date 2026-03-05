import { useState, useEffect } from 'react';
import {
    ShoppingBag, Plus, Edit2, Trash2, X, Save, Layout,
    ToggleLeft, ToggleRight, Tag, Video, Euro,
    Eye, EyeOff, ChevronUp, ChevronDown, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

export default function AdminAcademyShop() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' | 'course_form' | 'lessons_manager'
    const [selectedCourse, setSelectedCourse] = useState(null);

    const emptyForm = { title: '', description: '', thumbnail_url: '', price: '', is_shop_course: true, is_active: true };
    const [courseForm, setCourseForm] = useState(emptyForm);
    const [lessonForm, setLessonForm] = useState({ title: '', description: '', youtube_url: '', order_index: 0 });
    const [editingLessonId, setEditingLessonId] = useState(null);

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/video-courses/all');
            // Only show shop courses in this panel
            setCourses(res.data.filter(c => c.is_shop_course));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ── COURSE CRUD ──
    const handleSaveCourse = async (e) => {
        e.preventDefault();
        const payload = {
            ...courseForm,
            price: courseForm.price !== '' ? parseFloat(courseForm.price) : null,
            is_shop_course: true,
        };
        try {
            if (selectedCourse) {
                await api.put(`/admin/video-courses/${selectedCourse.id}`, payload);
            } else {
                await api.post('/admin/video-courses/', payload);
            }
            await fetchCourses();
            setView('list');
            setSelectedCourse(null);
            setCourseForm(emptyForm);
        } catch (err) {
            alert('Error al guardar curso');
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm('¿Eliminar este curso de la tienda y todas sus clases?')) return;
        try {
            await api.delete(`/admin/video-courses/${id}`);
            await fetchCourses();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleActive = async (course) => {
        try {
            const res = await api.patch(`/admin/video-courses/${course.id}/toggle-active`);
            setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_active: res.data.is_active } : c));
        } catch (err) {
            console.error(err);
        }
    };

    // ── LESSON CRUD ──
    const [uploading, setUploading] = useState(false);
    const [lessonFile, setLessonFile] = useState(null);

    const handleManageLessons = (course) => {
        setSelectedCourse(course);
        setEditingLessonId(null);
        setLessonFile(null);
        const maxIdx = Math.max(...(course.lessons?.map(l => l.order_index) || [0]));
        setLessonForm({ title: '', description: '', youtube_url: '', order_index: maxIdx + 1 });
        setView('lessons_manager');
    };

    const handleSaveLesson = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            if (editingLessonId) {
                // Editing metadata only for now as per current backend
                await api.put(`/admin/video-courses/lessons/${editingLessonId}`, lessonForm);
            } else {
                if (!lessonFile) {
                    alert('Debes seleccionar un archivo de vídeo');
                    setUploading(false);
                    return;
                }
                const formData = new FormData();
                formData.append('video', lessonFile);
                formData.append('title', lessonForm.title);
                formData.append('description', lessonForm.description || '');
                formData.append('order_index', lessonForm.order_index);

                await api.post(`/admin/video-courses/${selectedCourse.id}/lessons/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            const res = await api.get(`/video-courses/${selectedCourse.id}/shop-detail`);
            setSelectedCourse(res.data);
            setEditingLessonId(null);
            setLessonFile(null);
            setLessonForm({ title: '', description: '', youtube_url: '', order_index: res.data.lessons.length + 1 });
            fetchCourses();
        } catch (err) {
            console.error(err);
            alert('Error al guardar clase');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteLesson = async (id) => {
        if (!window.confirm('¿Eliminar esta clase?')) return;
        try {
            await api.delete(`/admin/video-courses/lessons/${id}`);
            const res = await api.get(`/video-courses/${selectedCourse.id}/shop-detail`);
            setSelectedCourse(res.data);
            fetchCourses();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </main>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto relative">

                {/* Ambient */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 blur-[150px] rounded-full -z-10 pointer-events-none animate-pulse" />

                {/* ── HEADER ── */}
                <PageHeader
                    title={<>Academy <span className="text-purple-400">Shop</span></>}
                    subtitle="Gestión de cursos de compra vitalicia"
                    Icon={ShoppingBag}
                    gradient="from-white via-purple-100 to-purple-500"
                    iconColor="text-purple-400"
                    iconBg="bg-purple-600/20"
                    iconBorder="border-purple-500/30"
                    glowColor="bg-purple-600/20"
                >
                    {view === 'list' && (
                        <button
                            onClick={() => { setSelectedCourse(null); setCourseForm(emptyForm); setView('course_form'); }}
                            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-black uppercase rounded-xl transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> Nuevo Curso
                        </button>
                    )}
                </PageHeader>

                {/* ── VIEW: LIST ── */}
                {view === 'list' && (
                    <>
                        {courses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 opacity-30">
                                <ShoppingBag className="w-16 h-16 text-purple-500 mb-4" />
                                <p className="font-mono text-slate-500 uppercase tracking-widest text-sm">Sin cursos en la tienda</p>
                                <p className="font-mono text-slate-700 text-xs mt-2">Crea tu primer curso usando el botón de arriba</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {courses.map(course => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        onEdit={() => {
                                            setSelectedCourse(course);
                                            setCourseForm({
                                                title: course.title,
                                                description: course.description || '',
                                                thumbnail_url: course.thumbnail_url || '',
                                                price: course.price ?? '',
                                                is_shop_course: true,
                                                is_active: course.is_active,
                                            });
                                            setView('course_form');
                                        }}
                                        onDelete={() => handleDeleteCourse(course.id)}
                                        onToggleActive={() => handleToggleActive(course)}
                                        onManageLessons={() => handleManageLessons(course)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── VIEW: COURSE FORM ── */}
                {view === 'course_form' && (
                    <div className="max-w-2xl mx-auto">
                        <button
                            onClick={() => { setView('list'); setSelectedCourse(null); }}
                            className="flex items-center gap-2 mb-6 text-slate-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors"
                        >
                            <X className="w-4 h-4" /> Cancelar
                        </button>

                        <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-3xl p-8">
                            <h2 className="text-2xl font-black uppercase text-white mb-6 flex items-center gap-3">
                                <ShoppingBag className="w-6 h-6 text-purple-400" />
                                {selectedCourse ? 'Editar Curso' : 'Nuevo Curso de Tienda'}
                            </h2>

                            <form onSubmit={handleSaveCourse} className="space-y-5">
                                {/* Title */}
                                <div>
                                    <label className="block text-purple-400 font-mono text-[10px] uppercase tracking-widest mb-2">Título del Curso *</label>
                                    <input required type="text" value={courseForm.title}
                                        onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-purple-500 outline-none transition-colors"
                                        placeholder="Ej: Curso Completo de Redes y Comunicaciones" />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-purple-400 font-mono text-[10px] uppercase tracking-widest mb-2">Descripción</label>
                                    <textarea value={courseForm.description}
                                        onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-purple-500 outline-none transition-colors h-28 resize-none"
                                        placeholder="Describe qué aprenderá el alumno en este curso..." />
                                </div>

                                {/* Thumbnail + Price row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-purple-400 font-mono text-[10px] uppercase tracking-widest mb-2">URL Miniatura</label>
                                        <input type="url" value={courseForm.thumbnail_url}
                                            onChange={e => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-purple-500 outline-none transition-colors"
                                            placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className="block text-purple-400 font-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <Euro className="w-3 h-3" /> Precio (€) *
                                        </label>
                                        <input required type="number" step="0.01" min="0" value={courseForm.price}
                                            onChange={e => setCourseForm({ ...courseForm, price: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-purple-500 outline-none transition-colors"
                                            placeholder="29.99" />
                                    </div>
                                </div>

                                {/* Active toggle */}
                                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-white">Estado del Curso</p>
                                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">Los cursos inactivos no aparecen a los alumnos</p>
                                    </div>
                                    <button type="button" onClick={() => setCourseForm(f => ({ ...f, is_active: !f.is_active }))}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${courseForm.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {courseForm.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                        {courseForm.is_active ? 'Activo' : 'Inactivo'}
                                    </button>
                                </div>

                                <button type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-black uppercase rounded-xl hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <Save className="w-5 h-5" /> Guardar Curso
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── VIEW: LESSONS MANAGER ── */}
                {view === 'lessons_manager' && selectedCourse && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                        {/* Left: Lesson Form */}
                        <div>
                            <button onClick={() => setView('list')}
                                className="flex items-center gap-2 mb-6 text-slate-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors">
                                <X className="w-4 h-4" /> Volver a la lista
                            </button>

                            <div className="mb-4">
                                <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">Temario del curso</p>
                                <h2 className="text-2xl font-black text-white uppercase">{selectedCourse.title}</h2>
                            </div>

                            <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-purple-500/20 rounded-3xl p-6">
                                <h3 className="text-sm font-mono text-white border-b border-white/10 pb-3 mb-5 uppercase tracking-wider">
                                    {editingLessonId ? '✏️ Editar Clase' : '➕ Añadir Nueva Clase'}
                                </h3>

                                <form onSubmit={handleSaveLesson} className="space-y-4">
                                    <div>
                                        <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-widest mb-2">Título de la Clase *</label>
                                        <input required type="text" value={lessonForm.title}
                                            onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-purple-500 outline-none"
                                            placeholder="Ej: 01. Introducción al protocolo TCP/IP" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-widest mb-2">Archivo de Vídeo (MP4/MOV) *</label>
                                        {!editingLessonId ? (
                                            <input required type="file" accept="video/*"
                                                onChange={e => setLessonFile(e.target.files[0])}
                                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-purple-300 font-mono text-xs focus:border-purple-500 outline-none file:bg-purple-600 file:border-none file:rounded-lg file:text-white file:px-3 file:py-1 file:mr-4 file:font-black file:uppercase file:text-[9px] cursor-pointer" />
                                        ) : (
                                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-[10px] text-slate-500 font-mono">
                                                Edición de archivo no disponible. Elimina y vuelve a subir si necesitas cambiar el vídeo.
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-widest mb-2">Descripción / Recursos</label>
                                            <textarea value={lessonForm.description}
                                                onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-purple-500 outline-none h-20 resize-none"
                                                placeholder="Apuntes, enlaces, material..." />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-widest mb-2">Orden</label>
                                            <input required type="number" min="0" value={lessonForm.order_index}
                                                onChange={e => setLessonForm({ ...lessonForm, order_index: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-purple-500 outline-none" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2 border-t border-white/5">
                                        <button type="submit" disabled={uploading}
                                            className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                                            {uploading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            {uploading ? 'Subiendo...' : 'Guardar Clase'}
                                        </button>
                                        {editingLessonId && (
                                            <button type="button" onClick={() => { setEditingLessonId(null); setLessonForm({ title: '', description: '', youtube_url: '', order_index: selectedCourse.lessons.length + 1 }); }}
                                                className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase rounded-xl transition-all">
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Right: Lessons List */}
                        <div className="bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 rounded-3xl p-6 lg:sticky lg:top-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black uppercase text-white">Temario Actual</h3>
                                <span className="text-purple-400 font-mono text-[10px] px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
                                    {selectedCourse.lessons?.length || 0} Clases
                                </span>
                            </div>
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                                {!selectedCourse.lessons?.length ? (
                                    <div className="text-center py-10 opacity-30">
                                        <Video className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                        <p className="text-slate-600 font-mono text-xs uppercase">Sin clases registradas</p>
                                    </div>
                                ) : (
                                    [...(selectedCourse.lessons || [])].sort((a, b) => a.order_index - b.order_index).map(lesson => (
                                        <div key={lesson.id}
                                            className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${editingLessonId === lesson.id ? 'bg-purple-500/10 border-purple-500/40' : 'bg-black/40 border-white/5 hover:border-white/10'}`}>
                                            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 font-mono text-[10px] font-bold border border-white/5">
                                                {lesson.order_index}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-mono text-sm font-bold truncate">{lesson.title}</p>
                                                <a href={lesson.youtube_url} target="_blank" rel="noreferrer"
                                                    className="text-purple-400 hover:underline font-mono text-[9px] uppercase truncate inline-block max-w-[180px]">
                                                    YouTube Link
                                                </a>
                                            </div>
                                            <div className="flex gap-1.5 flex-shrink-0">
                                                <button onClick={() => { setEditingLessonId(lesson.id); setLessonForm({ title: lesson.title, description: lesson.description || '', youtube_url: lesson.youtube_url, order_index: lesson.order_index }); }}
                                                    className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-colors">
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => handleDeleteLesson(lesson.id)}
                                                    className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function CourseCard({ course, onEdit, onDelete, onToggleActive, onManageLessons }) {
    return (
        <div className={`relative bg-gradient-to-b from-stone-900/50 to-black rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col
            ${course.is_active ? 'border-white/10 hover:border-purple-500/30' : 'border-red-500/20 opacity-60'}`}>

            {/* Status ribbon */}
            {!course.is_active && (
                <div className="absolute top-0 left-0 right-0 py-1.5 bg-red-500/20 border-b border-red-500/30 flex items-center justify-center gap-2 text-[9px] font-mono text-red-400 font-black uppercase tracking-widest">
                    <EyeOff className="w-3 h-3" /> Curso Desactivado — No visible para alumnos
                </div>
            )}

            {/* Thumbnail */}
            <div className={`relative aspect-video w-full overflow-hidden bg-gradient-to-br from-purple-900/20 to-black flex-shrink-0 ${!course.is_active ? 'mt-7' : ''}`}>
                {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-purple-500/30" />
                    </div>
                )}
                {/* Price badge */}
                <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/80 border border-purple-500/30 rounded-xl text-[11px] font-black font-mono text-purple-300 flex items-center gap-1.5 backdrop-blur-sm">
                    <Euro className="w-3 h-3" />
                    {course.price != null ? Number(course.price).toFixed(2) : '—'}
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2 text-[9px] font-mono text-purple-400 uppercase tracking-widest">
                    <Video className="w-3 h-3" />
                    <span>{course.lessons?.length || 0} clases</span>
                </div>
                <h3 className="text-base font-black text-white uppercase italic tracking-tight mb-2 leading-snug">{course.title}</h3>
                <p className="text-[11px] text-slate-600 font-mono leading-relaxed line-clamp-2 flex-1">
                    {course.description || 'Sin descripción'}
                </p>

                {/* Actions */}
                <div className="mt-4 space-y-2">
                    <button onClick={onManageLessons}
                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/20 text-white font-mono text-[11px] uppercase tracking-wide rounded-xl transition-all flex items-center justify-center gap-2">
                        <Layout className="w-4 h-4 text-purple-400" /> Gestionar Temario
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onEdit}
                            className="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-mono text-[10px] uppercase rounded-xl transition-all flex items-center justify-center gap-1.5">
                            <Edit2 className="w-3 h-3" /> Editar
                        </button>
                        <button onClick={onToggleActive}
                            className={`flex-1 py-2 font-mono text-[10px] uppercase rounded-xl transition-all flex items-center justify-center gap-1.5
                                ${course.is_active
                                    ? 'bg-emerald-500/10 hover:bg-yellow-500/10 text-emerald-400 hover:text-yellow-400'
                                    : 'bg-red-500/10 hover:bg-emerald-500/10 text-red-400 hover:text-emerald-400'
                                }`}>
                            {course.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {course.is_active ? 'Activo' : 'Inactivo'}
                        </button>
                        <button onClick={onDelete}
                            className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-[10px] uppercase rounded-xl transition-all flex items-center justify-center">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
