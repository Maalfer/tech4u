import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, PlayCircle, Lock, ChevronRight,
    ChevronDown, ChevronUp, BookOpen, Menu, X
} from 'lucide-react';
import api from '../services/api';

// Convert a youtube URL to embed URL
function getYoutubeEmbedUrl(url) {
    if (!url) return '';
    // Handle youtu.be short links
    const shortMatch = url.match(/youtu\.be\/([^\?&]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    // Handle watch?v= links
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    // Assume it's already an embed URL
    return url;
}

export default function CoursePlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const fetchCourse = useCallback(async () => {
        try {
            const res = await api.get(`/video-courses/${id}/shop-detail`);
            const data = res.data;
            // Sort lessons by order_index
            data.lessons = [...(data.lessons || [])].sort((a, b) => a.order_index - b.order_index);
            setCourse(data);

            // Auto-select first incomplete or just first lesson
            if (!activeLesson && data.lessons.length > 0) {
                const firstIncomplete = data.lessons.find(l => !l.is_completed);
                setActiveLesson(firstIncomplete || data.lessons[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { fetchCourse(); }, [fetchCourse]);

    const handleToggleComplete = async (lesson) => {
        if (!course?.is_purchased) return;
        try {
            await api.post(`/video-courses/lessons/${lesson.id}/complete`);
            await fetchCourse();
        } catch (err) {
            console.error(err);
        }
    };

    const nextLesson = () => {
        if (!course || !activeLesson) return;
        const idx = course.lessons.findIndex(l => l.id === activeLesson.id);
        if (idx < course.lessons.length - 1) {
            setActiveLesson(course.lessons[idx + 1]);
        }
    };

    const prevLesson = () => {
        if (!course || !activeLesson) return;
        const idx = course.lessons.findIndex(l => l.id === activeLesson.id);
        if (idx > 0) {
            setActiveLesson(course.lessons[idx - 1]);
        }
    };

    if (loading) return (
        <div className="flex h-screen bg-[#050505] items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!course) return (
        <div className="flex h-screen bg-[#050505] items-center justify-center text-slate-500 font-mono">
            Curso no encontrado.
        </div>
    );

    if (!course.is_purchased) {
        navigate(`/shop/${id}`);
        return null;
    }

    const lessons = course.lessons || [];
    const completedCount = lessons.filter(l => l.is_completed).length;
    const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
    const activeLessonIdx = lessons.findIndex(l => l.id === activeLesson?.id);

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">

            {/* ── SIDEBAR / SYLLABUS ── */}
            <aside className={`flex-shrink-0 bg-[#0A0A0A] border-r border-white/5 flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden
                ${sidebarOpen ? 'w-80' : 'w-0'}`}>
                {/* Header */}
                <div className="p-5 border-b border-white/5 flex-shrink-0">
                    <button onClick={() => navigate('/shop')}
                        className="flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-purple-400 uppercase tracking-widest mb-4 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Tienda
                    </button>
                    <h2 className="text-base font-black text-white uppercase italic leading-snug line-clamp-2">{course.title}</h2>
                    {/* Progress */}
                    <div className="mt-3">
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase mb-1.5">
                            <span>{completedCount}/{lessons.length} clases</span>
                            <span className="text-purple-400">{progress}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-500 rounded-full"
                                style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>

                {/* Lesson List */}
                <div className="flex-1 overflow-y-auto py-2">
                    {lessons.map((lesson, i) => (
                        <button key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full flex items-center gap-3 p-3.5 text-left transition-all duration-200 border-b border-white/[0.03] group
                                ${activeLesson?.id === lesson.id
                                    ? 'bg-purple-600/10 border-l-2 border-l-purple-500'
                                    : 'hover:bg-white/[0.03] border-l-2 border-l-transparent'
                                }`}>
                            {/* Status icon */}
                            <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black border transition-colors
                                ${lesson.is_completed
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                    : activeLesson?.id === lesson.id
                                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                                        : 'bg-white/5 border-white/5 text-slate-600'
                                }`}>
                                {lesson.is_completed
                                    ? <CheckCircle className="w-3.5 h-3.5" />
                                    : activeLesson?.id === lesson.id
                                        ? <PlayCircle className="w-3.5 h-3.5" />
                                        : <span className="font-mono text-[9px]">{String(i + 1).padStart(2, '0')}</span>
                                }
                            </div>
                            {/* Title */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-[11px] font-bold truncate transition-colors
                                    ${lesson.is_completed ? 'text-emerald-300' : activeLesson?.id === lesson.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                    {lesson.title}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* ── MAIN PLAYER ── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top bar */}
                <header className="flex items-center justify-between px-5 py-3 bg-[#0A0A0A]/80 border-b border-white/5 flex-shrink-0 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(s => !s)}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                        <div>
                            <p className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">{course.title}</p>
                            <p className="text-xs font-bold text-white truncate max-w-[400px]">{activeLesson?.title}</p>
                        </div>
                    </div>
                    {/* Prev / Next */}
                    <div className="flex items-center gap-2">
                        <button onClick={prevLesson} disabled={activeLessonIdx === 0}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[10px] font-mono uppercase rounded-lg transition-all">
                            <ChevronUp className="w-3.5 h-3.5" /> Anterior
                        </button>
                        {activeLesson && (
                            <button
                                onClick={() => handleToggleComplete(activeLesson)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all
                                    ${activeLesson.is_completed
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                                    }`}>
                                <CheckCircle className="w-3.5 h-3.5" />
                                {activeLesson.is_completed ? '✓ Completada' : 'Marcar Completada'}
                            </button>
                        )}
                        <button onClick={nextLesson} disabled={activeLessonIdx >= lessons.length - 1}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[10px] font-mono uppercase rounded-lg transition-all">
                            Siguiente <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </header>

                {/* Video */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {activeLesson ? (
                        <>
                            {/* Player Wrapper */}
                            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                                {activeLesson.video_file_path ? (
                                    <video
                                        key={activeLesson.id}
                                        src={`http://localhost:8000${activeLesson.video_file_path}`}
                                        className="w-full h-full object-contain"
                                        controls
                                        autoPlay
                                        controlsList="nodownload"
                                    />
                                ) : (
                                    <iframe
                                        key={activeLesson.id}
                                        src={getYoutubeEmbedUrl(activeLesson.youtube_url)}
                                        className="w-full h-full"
                                        title={activeLesson.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        style={{ border: 'none' }}
                                    />
                                )}
                            </div>

                            {/* Lesson description */}
                            {activeLesson.description && (
                                <div className="px-8 py-5 bg-[#080808] border-t border-white/5 flex-shrink-0 max-h-32 overflow-y-auto">
                                    <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5" /> Material y Recursos
                                    </p>
                                    <p className="text-sm font-mono text-slate-400 leading-relaxed whitespace-pre-line">
                                        {activeLesson.description}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-black/50">
                            <PlayCircle className="w-16 h-16 text-purple-500/30" />
                            <p className="text-slate-600 font-mono uppercase tracking-widest text-sm">Selecciona una clase del temario</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
