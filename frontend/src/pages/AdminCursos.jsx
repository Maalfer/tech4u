import { useState, useEffect, useRef } from 'react';
import {
    Video, Upload, Edit2, Save, X, ChevronDown, ChevronRight,
    Trash2, Plus, FileText, CheckCircle, AlertCircle, Loader2,
    PlayCircle, Download, BookOpen, ClipboardList,
    Eye, EyeOff, ShoppingBag, Settings, Globe
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { API_BASE } from '../constants/api';

function formatBytes(bytes) {
    if (!bytes) return '';
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ── Toggle switch component ─────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, disabled, labelOn, labelOff, colorOn = 'bg-emerald-500' }) {
    return (
        <button
            onClick={onChange}
            disabled={disabled}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed
                ${checked
                    ? `${colorOn === 'bg-emerald-500' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20' : 'bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20'}`
                    : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-white'}`}>
            <div className={`relative w-7 h-4 rounded-full transition-colors ${checked ? (colorOn === 'bg-emerald-500' ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-white/10'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
            </div>
            {checked ? labelOn : labelOff}
        </button>
    );
}

// ── Lesson row component ────────────────────────────────────────────────────
function LessonRow({ lesson, onVideoUploaded, onMaterialAdded, onMaterialDeleted, onLessonUpdated, onDeleteLesson }) {
    const [expanded, setExpanded] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ title: lesson.title, description: lesson.description || '', section_title: lesson.section_title || '' });
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadingMaterial, setUploadingMaterial] = useState(false);
    const [materialTitle, setMaterialTitle] = useState('');
    const [videoProgress, setVideoProgress] = useState(null);
    const [confirmDeleteMaterialId, setConfirmDeleteMaterialId] = useState(null);
    const [confirmDeleteLesson, setConfirmDeleteLesson] = useState(false);
    const videoInputRef = useRef();
    const materialInputRef = useRef();

    const handleVideoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingVideo(true);
        setVideoProgress(0);
        try {
            const fd = new FormData();
            fd.append('video', file);
            await api.post(`/admin/video-courses/lessons/${lesson.id}/upload-video`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (ev) => {
                    if (ev.total) setVideoProgress(Math.round((ev.loaded / ev.total) * 100));
                }
            });
            onVideoUploaded(lesson.id);
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
            alert('Error al subir el vídeo. Comprueba el formato (MP4, WebM, MOV).');
        } finally {
            setUploadingVideo(false);
            setVideoProgress(null);
            e.target.value = '';
        }
    };

    const handleMaterialChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !materialTitle.trim()) {
            alert('Escribe un título para el material antes de seleccionar el archivo.');
            return;
        }
        setUploadingMaterial(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('title', materialTitle.trim());
            const res = await api.post(`/admin/video-courses/lessons/${lesson.id}/materials`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMaterialTitle('');
            onMaterialAdded(lesson.id, res.data);
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
            alert('Error al subir el material.');
        } finally {
            setUploadingMaterial(false);
            e.target.value = '';
        }
    };

    const handleSaveEdit = async () => {
        try {
            await api.put(`/admin/video-courses/lessons/${lesson.id}`, {
                title: editForm.title,
                description: editForm.description,
                section_title: editForm.section_title,
                order_index: lesson.order_index,
                is_quiz: lesson.is_quiz,
            });
            setEditMode(false);
            onLessonUpdated(lesson.id, editForm);
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
            alert('Error al guardar cambios.');
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        try {
            await api.delete(`/admin/video-courses/materials/${materialId}`);
            onMaterialDeleted(lesson.id, materialId);
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
        } finally {
            setConfirmDeleteMaterialId(null);
        }
    };

    const handleDeleteLesson = async () => {
        try {
            await api.delete(`/admin/video-courses/lessons/${lesson.id}`);
            onDeleteLesson(lesson.id);
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
        } finally {
            setConfirmDeleteLesson(false);
        }
    };

    const hasVideo = !!lesson.video_file_path;
    const materials = lesson.materials || [];

    return (
        <div className={`border rounded-2xl overflow-hidden transition-all ${expanded ? 'border-orange-500/30 bg-[#0e0e0e]' : 'border-white/5 bg-[#0a0a0a] hover:border-white/10'}`}>
            {/* Row header */}
            <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[9px] font-black border
                    ${lesson.is_quiz ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : hasVideo ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-600'}`}>
                    {lesson.is_quiz ? <ClipboardList className="w-3.5 h-3.5" /> : hasVideo ? <CheckCircle className="w-3.5 h-3.5" /> : <span>{lesson.order_index}</span>}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{lesson.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                        {hasVideo
                            ? <span className="text-[9px] font-mono text-emerald-400 uppercase">✓ Vídeo subido</span>
                            : <span className="text-[9px] font-mono text-slate-600 uppercase">Sin vídeo</span>
                        }
                        {materials.length > 0 && (
                            <span className="text-[9px] font-mono text-orange-400/70">{materials.length} material{materials.length > 1 ? 'es' : ''}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {/* Delete lesson */}
                    {confirmDeleteLesson ? (
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-red-400">¿Eliminar?</span>
                            <button onClick={handleDeleteLesson}
                                className="px-2 py-1 text-[9px] font-black uppercase bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">Sí</button>
                            <button onClick={() => setConfirmDeleteLesson(false)}
                                className="px-2 py-1 text-[9px] font-mono bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 transition-colors">No</button>
                        </div>
                    ) : (
                        <button onClick={() => setConfirmDeleteLesson(true)}
                            className="w-7 h-7 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    )}

                    {/* Quick video upload button */}
                    <button
                        onClick={() => videoInputRef.current.click()}
                        disabled={uploadingVideo}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all
                            ${hasVideo
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20'
                                : 'bg-orange-600 text-white hover:bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.3)]'}`}>
                        {uploadingVideo
                            ? <><Loader2 className="w-3 h-3 animate-spin" /> {videoProgress !== null ? `${videoProgress}%` : '...'}</>
                            : <><Upload className="w-3 h-3" /> {hasVideo ? 'Reemplazar' : 'Subir vídeo'}</>
                        }
                    </button>
                    <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideoChange} />
                    {expanded ? <ChevronDown className="w-4 h-4 text-slate-500 cursor-pointer" onClick={() => setExpanded(e => !e)} /> : <ChevronRight className="w-4 h-4 text-slate-500 cursor-pointer" onClick={() => setExpanded(e => !e)} />}
                </div>
            </div>

            {/* Expanded panel */}
            {expanded && (
                <div className="border-t border-white/5 p-5 space-y-5">

                    {/* Edit lesson info */}
                    {editMode ? (
                        <div className="space-y-3">
                            <input
                                value={editForm.title}
                                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-orange-500 outline-none"
                                placeholder="Título de la clase"
                            />
                            <input
                                value={editForm.section_title}
                                onChange={e => setEditForm(f => ({ ...f, section_title: e.target.value }))}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-orange-500 outline-none"
                                placeholder="Título de sección (ej: Sección 3: Manejo básico…)"
                            />
                            <textarea
                                value={editForm.description}
                                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-orange-500 outline-none h-24 resize-none"
                                placeholder="Descripción de la clase (herramientas, conceptos clave, etc.)"
                            />
                            <div className="flex gap-3">
                                <button onClick={handleSaveEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white font-black uppercase text-xs rounded-xl hover:bg-orange-500 transition-colors">
                                    <Save className="w-3.5 h-3.5" /> Guardar
                                </button>
                                <button onClick={() => { setEditMode(false); setEditForm({ title: lesson.title, description: lesson.description || '', section_title: lesson.section_title || '' }); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-400 font-mono text-xs rounded-xl hover:bg-white/10 transition-colors">
                                    <X className="w-3.5 h-3.5" /> Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                {lesson.description
                                    ? <p className="text-slate-400 font-mono text-xs leading-relaxed">{lesson.description}</p>
                                    : <p className="text-slate-700 font-mono text-xs italic">Sin descripción</p>
                                }
                            </div>
                            <button onClick={() => setEditMode(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-slate-400 font-mono text-[10px] uppercase rounded-lg hover:bg-white/10 hover:text-white transition-colors flex-shrink-0">
                                <Edit2 className="w-3 h-3" /> Editar
                            </button>
                        </div>
                    )}

                    {/* Current video */}
                    {hasVideo && (
                        <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            <PlayCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-0.5">Vídeo actual</p>
                                <a href={`${API_BASE}${lesson.video_file_path}`} target="_blank" rel="noreferrer"
                                    className="text-xs text-slate-400 font-mono truncate block hover:text-white transition-colors">
                                    {lesson.video_file_path}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Materials section */}
                    <div>
                        <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Download className="w-3.5 h-3.5" /> Material adicional
                        </p>

                        {/* Existing materials */}
                        {materials.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {materials.map(mat => (
                                    <div key={mat.id} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                                        <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-mono truncate">{mat.title}</p>
                                            <p className="text-[9px] text-slate-600 font-mono">
                                                {mat.file_type?.toUpperCase()} {mat.file_size ? `· ${formatBytes(mat.file_size)}` : ''}
                                            </p>
                                        </div>
                                        <a href={`${API_BASE}${mat.file_path}`} target="_blank" rel="noreferrer"
                                            className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                                            <Download className="w-3 h-3" />
                                        </a>
                                        {/* Inline material delete confirm */}
                                        {confirmDeleteMaterialId === mat.id ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-mono text-red-400">¿Borrar?</span>
                                                <button onClick={() => handleDeleteMaterial(mat.id)}
                                                    className="px-2 py-1 text-[9px] font-black uppercase bg-red-600 text-white rounded-lg hover:bg-red-500">Sí</button>
                                                <button onClick={() => setConfirmDeleteMaterialId(null)}
                                                    className="px-2 py-1 text-[9px] font-mono bg-white/5 text-slate-400 rounded-lg hover:bg-white/10">No</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setConfirmDeleteMaterialId(mat.id)}
                                                className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload new material */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={materialTitle}
                                onChange={e => setMaterialTitle(e.target.value)}
                                placeholder="Título del material (ej: Cheatsheet Nmap)"
                                className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-orange-500 outline-none"
                            />
                            <button
                                disabled={uploadingMaterial || !materialTitle.trim()}
                                onClick={() => materialInputRef.current.click()}
                                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 text-slate-300 font-mono text-xs uppercase rounded-xl hover:bg-orange-500/10 hover:text-orange-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                                {uploadingMaterial ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                Adjuntar
                            </button>
                            <input ref={materialInputRef} type="file"
                                accept=".pdf,.zip,.txt,.md,.docx,.png,.jpg,.gif"
                                className="hidden"
                                onChange={handleMaterialChange} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AdminCursos() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Course management state
    const [confirmDeleteCourse, setConfirmDeleteCourse] = useState(null);
    const [editCourseModal, setEditCourseModal] = useState(null);
    const [savingCourse, setSavingCourse] = useState(false);
    const [togglingCourse, setTogglingCourse] = useState(null);
    const [deletingCourse, setDeletingCourse] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/admin/video-courses/all');
            setCourses(res.data);
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadCourseDetail = async (course) => {
        try {
            const res = await api.get(`/admin/video-courses/all`);
            const full = res.data.find(c => c.id === course.id);
            setSelectedCourse(full);
            const sectionTitles = [...new Set((full?.lessons || []).map(l => l.section_title))];
            const exp = {};
            sectionTitles.forEach(t => { exp[t] = true; });
            setExpandedSections(exp);
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
        }
    };

    const handleSelectCourse = (course) => {
        loadCourseDetail(course);
    };

    const refreshCourse = async () => {
        if (!selectedCourse) return;
        const res = await api.get(`/admin/video-courses/all`);
        const updated = res.data.find(c => c.id === selectedCourse.id);
        if (updated) {
            setSelectedCourse(updated);
            setCourses(res.data);
        }
    };

    // ── Course-level handlers ──────────────────────────────────────────────
    const handleToggleActive = async (courseId) => {
        setTogglingCourse(courseId);
        try {
            await api.patch(`/admin/video-courses/${courseId}/toggle-active`);
            const res = await api.get('/admin/video-courses/all');
            setCourses(res.data);
            if (selectedCourse?.id === courseId) {
                const updated = res.data.find(c => c.id === courseId);
                if (updated) setSelectedCourse(updated);
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
        } finally {
            setTogglingCourse(null);
        }
    };

    const handleToggleShop = async (courseId) => {
        setTogglingCourse(courseId);
        try {
            await api.patch(`/admin/video-courses/${courseId}/toggle-shop`);
            const res = await api.get('/admin/video-courses/all');
            setCourses(res.data);
            if (selectedCourse?.id === courseId) {
                const updated = res.data.find(c => c.id === courseId);
                if (updated) setSelectedCourse(updated);
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
        } finally {
            setTogglingCourse(null);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        setDeletingCourse(true);
        try {
            await api.delete(`/admin/video-courses/${courseId}`);
            setConfirmDeleteCourse(null);
            setSelectedCourse(null);
            await fetchCourses();
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
        } finally {
            setDeletingCourse(false);
        }
    };

    const handleSaveCourseEdit = async (courseId, data) => {
        setSavingCourse(true);
        try {
            await api.put(`/admin/video-courses/${courseId}`, data);
            setEditCourseModal(null);
            const res = await api.get('/admin/video-courses/all');
            setCourses(res.data);
            if (selectedCourse?.id === courseId) {
                const updated = res.data.find(c => c.id === courseId);
                if (updated) setSelectedCourse(updated);
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
        } finally {
            setSavingCourse(false);
        }
    };

    // ── Lesson-level handlers ─────────────────────────────────────────────
    const handleVideoUploaded = () => refreshCourse();
    const handleMaterialAdded = () => refreshCourse();
    const handleMaterialDeleted = () => refreshCourse();
    const handleLessonUpdated = (lessonId, newData) => {
        setSelectedCourse(prev => ({
            ...prev,
            lessons: prev.lessons.map(l => l.id === lessonId ? { ...l, ...newData } : l)
        }));
    };
    const handleDeleteLesson = (lessonId) => {
        setSelectedCourse(prev => ({
            ...prev,
            lessons: prev.lessons.filter(l => l.id !== lessonId)
        }));
    };

    // Group lessons by section
    const sections = (() => {
        if (!selectedCourse) return [];
        const map = new Map();
        const sorted = [...(selectedCourse.lessons || [])].sort((a, b) => a.order_index - b.order_index);
        for (const lesson of sorted) {
            const key = lesson.section_title || 'Sin sección';
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(lesson);
        }
        return Array.from(map.entries()).map(([title, lessons]) => ({ title, lessons }));
    })();

    const totalLessons = selectedCourse?.lessons?.length || 0;
    const withVideo = selectedCourse?.lessons?.filter(l => l.video_file_path).length || 0;

    if (loading) return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </main>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 overflow-y-auto">

                <PageHeader
                    title={<>Gestión <span className="text-orange-500">Cursos</span></>}
                    subtitle="Administra el contenido de los cursos: sube vídeos por clase, edita descripciones y añade material adicional."
                    Icon={Video}
                    gradient="from-white via-slate-100 to-orange-400"
                    iconColor="text-orange-500"
                    iconBg="bg-orange-500/20"
                    iconBorder="border-orange-500/30"
                    glowColor="bg-orange-500/20"
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">

                    {/* ── Course selector ──────────────────────────────────── */}
                    <div className="lg:col-span-1 space-y-3">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">Cursos disponibles</p>
                        {courses.map(course => (
                            <button key={course.id}
                                onClick={() => handleSelectCourse(course)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all
                                    ${selectedCourse?.id === course.id
                                        ? 'bg-orange-500/10 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                                        : 'bg-[#111] border-white/5 hover:border-white/15'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-black border border-white/10 flex items-center justify-center flex-shrink-0">
                                        <Video className={`w-5 h-5 ${selectedCourse?.id === course.id ? 'text-orange-500' : 'text-slate-500'}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-black uppercase truncate ${selectedCourse?.id === course.id ? 'text-white' : 'text-slate-300'}`}>
                                            {course.title}
                                        </p>
                                        <p className="text-[9px] font-mono text-slate-600">
                                            {course.lessons?.length || 0} clases
                                            {course.slug && <> · <span className="text-orange-400/60">/{course.slug}</span></>}
                                        </p>
                                        {/* Status badges */}
                                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                            {course.is_active
                                                ? <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase">Activo</span>
                                                : <span className="text-[8px] font-mono text-slate-600 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full uppercase">Inactivo</span>
                                            }
                                            {course.is_shop_course && (
                                                <span className="text-[8px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase">Tienda</span>
                                            )}
                                            {course.price > 0 && (
                                                <span className="text-[8px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded-full">{course.price}€</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* ── Course content ───────────────────────────────────── */}
                    <div className="lg:col-span-3">
                        {!selectedCourse ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-3 bg-[#111] border border-white/5 rounded-3xl">
                                <BookOpen className="w-10 h-10 text-slate-700" />
                                <p className="text-slate-600 font-mono text-sm uppercase tracking-widest">Selecciona un curso para gestionar</p>
                            </div>
                        ) : (
                            <div>
                                {/* ── Course action bar ─────────────────────────────── */}
                                <div className="mb-6 bg-[#111] border border-white/5 rounded-2xl p-4">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        {/* Course info */}
                                        <div className="min-w-0">
                                            <h2 className="text-base font-black text-white uppercase truncate">{selectedCourse.title}</h2>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {selectedCourse.slug && (
                                                    <span className="text-[9px] font-mono text-orange-400/60">/{selectedCourse.slug}</span>
                                                )}
                                                {selectedCourse.price > 0 && (
                                                    <span className="text-[9px] font-mono text-sky-400">{selectedCourse.price}€</span>
                                                )}
                                                {selectedCourse.description && (
                                                    <span className="text-[9px] font-mono text-slate-600 truncate max-w-[200px]">{selectedCourse.description}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                                            {/* Toggle público/privado */}
                                            <ToggleSwitch
                                                checked={selectedCourse.is_active}
                                                onChange={() => handleToggleActive(selectedCourse.id)}
                                                disabled={togglingCourse === selectedCourse.id}
                                                labelOn="Público"
                                                labelOff="Privado"
                                                colorOn="bg-emerald-500"
                                            />

                                            {/* Toggle tienda */}
                                            <ToggleSwitch
                                                checked={selectedCourse.is_shop_course}
                                                onChange={() => handleToggleShop(selectedCourse.id)}
                                                disabled={togglingCourse === selectedCourse.id}
                                                labelOn="Tienda"
                                                labelOff="Libre"
                                                colorOn="bg-amber-500"
                                            />

                                            {/* Edit course */}
                                            <button
                                                onClick={() => setEditCourseModal({ ...selectedCourse })}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 font-mono text-xs uppercase hover:text-white hover:border-white/20 transition-all">
                                                <Settings className="w-3.5 h-3.5" /> Editar
                                            </button>

                                            {/* Delete course */}
                                            <button
                                                onClick={() => setConfirmDeleteCourse(selectedCourse)}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 font-mono text-xs uppercase hover:bg-red-500/20 transition-all">
                                                <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats strip */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {[
                                        { label: 'Total clases', value: totalLessons, color: 'text-white' },
                                        { label: 'Con vídeo', value: withVideo, color: 'text-emerald-400' },
                                        { label: 'Sin vídeo', value: totalLessons - withVideo, color: totalLessons - withVideo > 0 ? 'text-orange-400' : 'text-slate-600' },
                                    ].map(stat => (
                                        <div key={stat.label} className="bg-[#111] border border-white/5 rounded-2xl p-4 text-center">
                                            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mt-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress bar */}
                                <div className="mb-6 bg-[#111] border border-white/5 rounded-2xl p-4">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase mb-2">
                                        <span>Progreso de subida</span>
                                        <span className="text-orange-400 font-black">
                                            {totalLessons > 0 ? Math.round((withVideo / totalLessons) * 100) : 0}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                                            style={{ width: `${totalLessons > 0 ? (withVideo / totalLessons) * 100 : 0}%` }} />
                                    </div>
                                </div>

                                {/* Sections */}
                                <div className="space-y-4">
                                    {sections.map((section, sIdx) => {
                                        const isExpanded = expandedSections[section.title] !== false;
                                        const sectionWithVideo = section.lessons.filter(l => l.video_file_path).length;
                                        return (
                                            <div key={sIdx} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                                                {/* Section header */}
                                                <button
                                                    onClick={() => setExpandedSections(prev => ({ ...prev, [section.title]: !prev[section.title] }))}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors text-left">
                                                    <div>
                                                        <p className="text-sm font-black text-orange-400 uppercase tracking-wide">{section.title}</p>
                                                        <p className="text-[9px] font-mono text-slate-600 mt-0.5">
                                                            {sectionWithVideo}/{section.lessons.length} vídeos subidos
                                                        </p>
                                                    </div>
                                                    {isExpanded
                                                        ? <ChevronDown className="w-4 h-4 text-slate-500" />
                                                        : <ChevronRight className="w-4 h-4 text-slate-500" />
                                                    }
                                                </button>

                                                {/* Lessons */}
                                                {isExpanded && (
                                                    <div className="border-t border-white/5 p-4 space-y-3">
                                                        {section.lessons.map(lesson => (
                                                            <LessonRow
                                                                key={lesson.id}
                                                                lesson={lesson}
                                                                onVideoUploaded={handleVideoUploaded}
                                                                onMaterialAdded={handleMaterialAdded}
                                                                onMaterialDeleted={handleMaterialDeleted}
                                                                onLessonUpdated={handleLessonUpdated}
                                                                onDeleteLesson={handleDeleteLesson}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ── Delete course confirmation modal ─────────────────────────────── */}
            {confirmDeleteCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111] border border-red-500/30 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.12)]">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white uppercase">Eliminar curso</p>
                                <p className="text-[10px] font-mono text-red-400/80">Esta acción no se puede deshacer</p>
                            </div>
                        </div>

                        <p className="text-slate-400 font-mono text-xs mb-1">Vas a eliminar el curso:</p>
                        <p className="text-white font-black text-sm mb-1 truncate">"{confirmDeleteCourse.title}"</p>
                        <p className="text-slate-600 font-mono text-xs mb-6">
                            Se eliminarán permanentemente todas sus clases ({confirmDeleteCourse.lessons?.length || 0}), vídeos y materiales adjuntos.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDeleteCourse(confirmDeleteCourse.id)}
                                disabled={deletingCourse}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs rounded-xl transition-colors disabled:opacity-60">
                                {deletingCourse ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                Sí, eliminar
                            </button>
                            <button
                                onClick={() => setConfirmDeleteCourse(null)}
                                disabled={deletingCourse}
                                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs rounded-xl transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit course modal ─────────────────────────────────────────────── */}
            {editCourseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111] border border-orange-500/20 rounded-3xl p-6 max-w-lg w-full shadow-[0_0_50px_rgba(249,115,22,0.08)] max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                                    <Settings className="w-4.5 h-4.5 text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white uppercase">Editar curso</p>
                                    <p className="text-[10px] font-mono text-slate-500">Metadatos e información general</p>
                                </div>
                            </div>
                            <button onClick={() => setEditCourseModal(null)}
                                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">Título *</label>
                                <input
                                    value={editCourseModal.title}
                                    onChange={e => setEditCourseModal(m => ({ ...m, title: e.target.value }))}
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-orange-500 outline-none"
                                    placeholder="Título del curso"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">Slug (URL)</label>
                                <input
                                    value={editCourseModal.slug || ''}
                                    onChange={e => setEditCourseModal(m => ({ ...m, slug: e.target.value }))}
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-orange-500 outline-none"
                                    placeholder="ej: curso-sql-avanzado"
                                />
                                <p className="text-[9px] font-mono text-slate-600 mt-1">Se usa en la URL: /cursos/<span className="text-orange-400/60">{editCourseModal.slug || 'slug'}</span></p>
                            </div>

                            <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">Descripción</label>
                                <textarea
                                    value={editCourseModal.description || ''}
                                    onChange={e => setEditCourseModal(m => ({ ...m, description: e.target.value }))}
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-orange-500 outline-none h-20 resize-none"
                                    placeholder="Descripción del curso"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">URL Thumbnail</label>
                                <input
                                    value={editCourseModal.thumbnail_url || ''}
                                    onChange={e => setEditCourseModal(m => ({ ...m, thumbnail_url: e.target.value }))}
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-orange-500 outline-none"
                                    placeholder="https://..."
                                />
                                {editCourseModal.thumbnail_url && (
                                    <img src={editCourseModal.thumbnail_url} alt="thumb"
                                        className="mt-2 h-16 rounded-lg object-cover border border-white/10"
                                        onError={e => e.target.style.display = 'none'} />
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">Precio (€)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editCourseModal.price ?? ''}
                                    onChange={e => setEditCourseModal(m => ({ ...m, price: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-orange-500 outline-none"
                                    placeholder="0"
                                />
                                <p className="text-[9px] font-mono text-slate-600 mt-1">0 o vacío = gratuito para suscriptores · &gt;0 = curso de tienda</p>
                            </div>

                            {/* Visibility toggles inside modal */}
                            <div className="flex gap-3 pt-1">
                                <div className="flex-1 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <p className="text-[9px] font-mono text-slate-500 uppercase mb-2">Visibilidad</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono text-slate-400">{editCourseModal.is_active ? 'Público' : 'Privado'}</span>
                                        <button
                                            onClick={() => setEditCourseModal(m => ({ ...m, is_active: !m.is_active }))}
                                            className={`relative w-10 h-5 rounded-full transition-colors ${editCourseModal.is_active ? 'bg-emerald-500' : 'bg-white/10'}`}>
                                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${editCourseModal.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <p className="text-[9px] font-mono text-slate-500 uppercase mb-2">Tipo</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono text-slate-400">{editCourseModal.is_shop_course ? 'Tienda' : 'Libre'}</span>
                                        <button
                                            onClick={() => setEditCourseModal(m => ({ ...m, is_shop_course: !m.is_shop_course }))}
                                            className={`relative w-10 h-5 rounded-full transition-colors ${editCourseModal.is_shop_course ? 'bg-amber-500' : 'bg-white/10'}`}>
                                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${editCourseModal.is_shop_course ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => handleSaveCourseEdit(editCourseModal.id, {
                                    title: editCourseModal.title,
                                    slug: editCourseModal.slug || null,
                                    description: editCourseModal.description || null,
                                    thumbnail_url: editCourseModal.thumbnail_url || null,
                                    price: editCourseModal.price ?? null,
                                    is_active: editCourseModal.is_active,
                                    is_shop_course: editCourseModal.is_shop_course,
                                })}
                                disabled={savingCourse || !editCourseModal.title?.trim()}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-xs rounded-xl transition-colors disabled:opacity-50">
                                {savingCourse ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                Guardar cambios
                            </button>
                            <button
                                onClick={() => setEditCourseModal(null)}
                                disabled={savingCourse}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs rounded-xl transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
