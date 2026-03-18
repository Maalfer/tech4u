import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, PlayCircle, ChevronDown, ChevronRight,
    Menu, X, BookOpen, FileText, Download, ClipboardList, Loader2,
    Shield, AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import logoImg from '../assets/tech4u_logo.png';
import { API_BASE } from '../constants/api';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

function fileIcon(type) {
    if (!type) return <FileText className="w-3.5 h-3.5" />;
    if (type === 'pdf') return <span className="text-red-400 font-black text-[9px]">PDF</span>;
    if (['zip', 'tar', 'gz'].includes(type)) return <span className="text-amber-400 font-black text-[9px]">ZIP</span>;
    return <FileText className="w-3.5 h-3.5" />;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CertificacionPlayer() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});

    // ── Fetch course ────────────────────────────────────────────────────────
    const fetchCourse = useCallback(async () => {
        try {
            const res = await api.get(`/video-courses/slug/${slug}`);
            const data = res.data;
            data.lessons = [...(data.lessons || [])].sort((a, b) => a.order_index - b.order_index);
            setCourse(data);

            // Auto-select first incomplete lesson
            if (!activeLesson && data.lessons.length > 0) {
                const first = data.lessons.find(l => !l.is_completed) || data.lessons[0];
                setActiveLesson(first);
            }

            // Expand all sections initially
            const sectionTitles = [...new Set(data.lessons.map(l => l.section_title))];
            const expanded = {};
            sectionTitles.forEach(t => { expanded[t] = true; });
            setExpandedSections(expanded);
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
            setError('No se pudo cargar el curso.');
        } finally {
            setLoading(false);
        }
    }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { fetchCourse(); }, [fetchCourse]);

    // ── Sections grouping ───────────────────────────────────────────────────
    const sections = useMemo(() => {
        if (!course) return [];
        const map = new Map();
        for (const lesson of course.lessons) {
            const key = lesson.section_title || 'Sin sección';
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(lesson);
        }
        return Array.from(map.entries()).map(([title, lessons]) => ({ title, lessons }));
    }, [course]);

    // ── Progress ────────────────────────────────────────────────────────────
    const lessons = course?.lessons || [];
    const completedCount = lessons.filter(l => l.is_completed).length;
    const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

    // ── Navigation ──────────────────────────────────────────────────────────
    const activeLessonIdx = lessons.findIndex(l => l.id === activeLesson?.id);

    const goNext = () => {
        if (activeLessonIdx < lessons.length - 1) setActiveLesson(lessons[activeLessonIdx + 1]);
    };
    const goPrev = () => {
        if (activeLessonIdx > 0) setActiveLesson(lessons[activeLessonIdx - 1]);
    };

    // ── Toggle complete ─────────────────────────────────────────────────────
    const handleToggleComplete = async (lesson) => {
        try {
            await api.post(`/video-courses/lessons/${lesson.id}/complete`);
            await fetchCourse();
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
        }
    };

    // ── Toggle section expand ───────────────────────────────────────────────
    const toggleSection = (title) => {
        setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
    };

    // ── Loading / error states ──────────────────────────────────────────────
    if (loading) return (
        <div className="flex h-screen bg-[#050505] items-center justify-center">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
    );

    if (error || !course) return (
        <div className="flex h-screen bg-[#050505] items-center justify-center flex-col gap-4">
            <AlertTriangle className="w-12 h-12 text-orange-500/50" />
            <p className="text-slate-500 font-mono uppercase tracking-widest text-sm">{error || 'Curso no encontrado.'}</p>
            <button onClick={() => navigate('/ciberseguridad')}
                className="mt-2 px-4 py-2 bg-orange-500/10 text-orange-400 font-mono text-xs uppercase rounded-lg hover:bg-orange-500/20 transition-colors">
                ← Volver a Ciberseguridad
            </button>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">

            {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
            <aside className={`flex-shrink-0 bg-[#0A0A0A] border-r border-white/5 flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden
                ${sidebarOpen ? 'w-[320px]' : 'w-0'}`}>

                {/* Header */}
                <div className="p-5 border-b border-white/5 flex-shrink-0">
                    <button onClick={() => navigate('/ciberseguridad')}
                        className="flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-orange-400 uppercase tracking-widest mb-4 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Ciberseguridad
                    </button>

                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-orange-400" />
                        </div>
                        <h2 className="text-sm font-black text-white uppercase italic leading-snug line-clamp-2">{course.title}</h2>
                    </div>

                    {/* Progress bar */}
                    <div>
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase mb-1.5">
                            <span>{completedCount}/{lessons.length} clases</span>
                            <span className="text-orange-400 font-black">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500 rounded-full"
                                style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>

                {/* Sections & lessons list */}
                <div className="flex-1 overflow-y-auto py-2">
                    {sections.map((section, sIdx) => {
                        const sectionDone = section.lessons.filter(l => l.is_completed).length;
                        const isExpanded = expandedSections[section.title] !== false;
                        return (
                            <div key={sIdx}>
                                {/* Section header */}
                                <button
                                    onClick={() => toggleSection(section.title)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-orange-400/80 uppercase tracking-wider truncate">
                                            {section.title}
                                        </p>
                                        <p className="text-[9px] font-mono text-slate-600 mt-0.5">
                                            {sectionDone}/{section.lessons.length} completadas
                                        </p>
                                    </div>
                                    {isExpanded
                                        ? <ChevronDown className="w-3 h-3 text-slate-600 flex-shrink-0" />
                                        : <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                                    }
                                </button>

                                {/* Lessons */}
                                {isExpanded && section.lessons.map((lesson) => (
                                    <button key={lesson.id}
                                        onClick={() => setActiveLesson(lesson)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 border-b border-white/[0.03] group
                                            ${activeLesson?.id === lesson.id
                                                ? 'bg-orange-500/8 border-l-2 border-l-orange-500'
                                                : 'hover:bg-white/[0.03] border-l-2 border-l-transparent'}`}>
                                        {/* Status icon */}
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black border transition-colors
                                            ${lesson.is_completed
                                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                                : activeLesson?.id === lesson.id
                                                    ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                                                    : 'bg-white/5 border-white/5 text-slate-600'}`}>
                                            {lesson.is_quiz
                                                ? <ClipboardList className="w-3 h-3" />
                                                : lesson.is_completed
                                                    ? <CheckCircle className="w-3 h-3" />
                                                    : activeLesson?.id === lesson.id
                                                        ? <PlayCircle className="w-3 h-3" />
                                                        : <span>{lesson.order_index}</span>
                                            }
                                        </div>
                                        {/* Title */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[11px] font-bold truncate transition-colors leading-snug
                                                ${lesson.is_completed ? 'text-emerald-300/80' : activeLesson?.id === lesson.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                                {lesson.title}
                                            </p>
                                            {lesson.is_quiz && (
                                                <span className="text-[8px] font-mono text-amber-400/80 uppercase tracking-wider">Cuestionario</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* ── MAIN AREA ─────────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                {/* Top bar */}
                <header className="flex items-center justify-between px-5 py-3 bg-[#0A0A0A]/80 border-b border-white/5 flex-shrink-0 backdrop-blur-md">
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => setSidebarOpen(s => !s)}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0">
                            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                        <img src={logoImg} alt="Tech4U" className="w-7 h-7 object-contain drop-shadow-[0_0_5px_rgba(249,115,22,0.4)] flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[9px] font-mono text-orange-400 uppercase tracking-widest truncate">{course.title}</p>
                            <p className="text-xs font-bold text-white truncate max-w-[400px]">{activeLesson?.title}</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={goPrev} disabled={activeLessonIdx <= 0}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[10px] font-mono uppercase rounded-lg transition-all">
                            ← Anterior
                        </button>
                        {activeLesson && !activeLesson.is_quiz && (
                            <button onClick={() => handleToggleComplete(activeLesson)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all
                                    ${activeLesson.is_completed
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                                        : 'bg-orange-600 hover:bg-orange-500 text-white'}`}>
                                <CheckCircle className="w-3.5 h-3.5" />
                                {activeLesson.is_completed ? '✓ Completada' : 'Marcar Completada'}
                            </button>
                        )}
                        <button onClick={goNext} disabled={activeLessonIdx >= lessons.length - 1}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[10px] font-mono uppercase rounded-lg transition-all">
                            Siguiente →
                        </button>
                    </div>
                </header>

                {/* Video + info */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {activeLesson ? (
                        <>
                            {/* Video player */}
                            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                                {activeLesson.video_file_path ? (
                                    <video
                                        key={activeLesson.id}
                                        src={`${API_BASE}${activeLesson.video_file_path}`}
                                        className="w-full h-full object-contain"
                                        controls
                                        autoPlay
                                        controlsList="nodownload"
                                    />
                                ) : (
                                    // Placeholder: vídeo no subido aún
                                    <div className="flex flex-col items-center gap-5 text-center px-8">
                                        <div className="w-24 h-24 rounded-3xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-center">
                                            <PlayCircle className="w-12 h-12 text-orange-500/30" />
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase text-lg mb-2">{activeLesson.title}</p>
                                            <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">
                                                {activeLesson.is_quiz ? 'Cuestionario — Próximamente disponible' : 'Vídeo próximamente disponible'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description + Materials */}
                            {(activeLesson.description || (activeLesson.materials && activeLesson.materials.length > 0)) && (
                                <div className="flex-shrink-0 bg-[#080808] border-t border-white/5 max-h-48 overflow-y-auto">
                                    <div className="px-8 py-5 flex gap-12">
                                        {/* Description */}
                                        {activeLesson.description && (
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <BookOpen className="w-3.5 h-3.5" /> Descripción
                                                </p>
                                                <p className="text-sm font-mono text-slate-400 leading-relaxed whitespace-pre-line">
                                                    {activeLesson.description}
                                                </p>
                                            </div>
                                        )}
                                        {/* Materials */}
                                        {activeLesson.materials && activeLesson.materials.length > 0 && (
                                            <div className="flex-shrink-0 w-64">
                                                <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Download className="w-3.5 h-3.5" /> Material adicional
                                                </p>
                                                <div className="space-y-2">
                                                    {activeLesson.materials.map(mat => (
                                                        <a key={mat.id}
                                                            href={`${API_BASE}${mat.file_path}`}
                                                            target="_blank" rel="noreferrer"
                                                            className="flex items-center gap-2.5 px-3 py-2 bg-white/5 hover:bg-orange-500/10 rounded-lg transition-colors group">
                                                            <span className="w-6 h-6 bg-black rounded flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:text-orange-400">
                                                                {fileIcon(mat.file_type)}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] text-white font-mono truncate">{mat.title}</p>
                                                                {mat.file_size && (
                                                                    <p className="text-[9px] text-slate-600 font-mono">{formatBytes(mat.file_size)}</p>
                                                                )}
                                                            </div>
                                                            <Download className="w-3 h-3 text-slate-600 group-hover:text-orange-400 flex-shrink-0" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-black/50">
                            <Shield className="w-16 h-16 text-orange-500/20" />
                            <p className="text-slate-600 font-mono uppercase tracking-widest text-sm">Selecciona una clase del temario</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
