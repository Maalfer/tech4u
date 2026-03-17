import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, ChevronLeft, ChevronRight, Video, Youtube, BookOpen } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

export default function VideoCourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentLesson, setCurrentLesson] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/video-courses/${id}`);
                const data = res.data;
                setCourse(data);
                if (data.lessons && data.lessons.length > 0) {
                    setCurrentLesson(data.lessons[0]);
                }
            } catch (err) {
                if (import.meta.env.DEV) console.error("Error fetching course", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    // Helper to extract YouTube video ID
    const getYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
        return match ? match[1] : null;
    };

    const currentIdx = course?.lessons?.findIndex(l => l.id === currentLesson?.id) ?? -1;
    const prevLesson = currentIdx > 0 ? course.lessons[currentIdx - 1] : null;
    const nextLesson = currentIdx >= 0 && currentIdx < (course?.lessons?.length ?? 0) - 1 ? course.lessons[currentIdx + 1] : null;

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0D0D0D]">
                <Sidebar />
                <main className="flex-1 ml-0 md:ml-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </main>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex min-h-screen bg-[#0D0D0D]">
                <Sidebar />
                <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 flex flex-col items-center justify-center text-center">
                    <h2 className="text-3xl font-black text-white uppercase mb-4">Colección no encontrada</h2>
                    <button
                        onClick={() => navigate('/video-cursos')}
                        className="px-6 py-3 bg-red-600 text-white font-black uppercase tracking-wider rounded-xl hover:scale-105 transition-transform"
                    >
                        Volver a YT Videos
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 flex flex-col md:flex-row h-screen overflow-hidden">

                {/* ── Columna principal (75%) ────────────────────────────────── */}
                <div className="flex-1 bg-black flex flex-col overflow-y-auto">

                    {/* Top bar */}
                    <div className="p-4 bg-[#111] border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
                        <button
                            onClick={() => navigate('/video-cursos')}
                            className="text-slate-400 hover:text-white flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            YT Videos
                        </button>
                        <div className="flex items-center gap-2 text-slate-600 font-mono text-[10px] uppercase tracking-widest">
                            <BookOpen className="w-3.5 h-3.5" />
                            {course.lessons?.length || 0} vídeos
                        </div>
                    </div>

                    {/* Vídeo y controles */}
                    {currentLesson ? (
                        <div className="flex-1 p-6 md:p-8">

                            {/* Lesson title */}
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div>
                                    <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest mb-1.5">
                                        {course.title}  ·  Vídeo {currentIdx + 1} de {course.lessons.length}
                                    </p>
                                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic leading-tight">
                                        {currentLesson.title}
                                    </h1>
                                </div>
                            </div>

                            {/* Player */}
                            <div className="w-full aspect-video bg-[#050505] rounded-3xl overflow-hidden border border-white/10 mb-6 shadow-2xl relative">
                                {getYouTubeId(currentLesson.youtube_url) ? (
                                    <iframe
                                        key={currentLesson.id}
                                        src={`https://www.youtube.com/embed/${getYouTubeId(currentLesson.youtube_url)}?autoplay=0&rel=0`}
                                        className="absolute inset-0 w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={currentLesson.title}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 font-mono text-sm">
                                        <Video className="w-12 h-12 mb-4 opacity-30" />
                                        URL de vídeo no válida
                                    </div>
                                )}
                            </div>

                            {/* Description + nav */}
                            <div className="bg-[#111] rounded-3xl border border-white/5 overflow-hidden">

                                {/* Description */}
                                {currentLesson.description && (
                                    <div className="p-6 border-b border-white/5">
                                        <p className="text-slate-400 font-mono text-xs leading-relaxed">
                                            {currentLesson.description}
                                        </p>
                                    </div>
                                )}

                                {/* Prev / Next nav */}
                                <div className="p-4 flex items-center justify-between gap-4">
                                    {prevLesson ? (
                                        <button
                                            onClick={() => setCurrentLesson(prevLesson)}
                                            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 transition-all text-slate-300 font-mono text-[11px] uppercase tracking-wide group flex-1 max-w-xs"
                                        >
                                            <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors flex-shrink-0" />
                                            <div className="text-left min-w-0">
                                                <div className="text-[9px] text-slate-600 mb-0.5">Anterior</div>
                                                <div className="truncate font-bold text-slate-300 group-hover:text-white transition-colors">{prevLesson.title}</div>
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="flex-1 max-w-xs" />
                                    )}

                                    {nextLesson ? (
                                        <button
                                            onClick={() => setCurrentLesson(nextLesson)}
                                            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-red-600/30 bg-red-600/5 hover:bg-red-600 hover:border-red-600 transition-all text-slate-300 hover:text-white font-mono text-[11px] uppercase tracking-wide group flex-1 max-w-xs justify-end"
                                        >
                                            <div className="text-right min-w-0">
                                                <div className="text-[9px] text-slate-600 group-hover:text-red-200 mb-0.5">Siguiente</div>
                                                <div className="truncate font-bold text-red-400 group-hover:text-white transition-colors">{nextLesson.title}</div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-white transition-colors flex-shrink-0" />
                                        </button>
                                    ) : (
                                        <div className="flex-1 max-w-xs" />
                                    )}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 font-mono text-sm">
                            No hay vídeos en esta colección todavía.
                        </div>
                    )}
                </div>

                {/* ── Sidebar temario (25%) ──────────────────────────────────── */}
                <div className="w-full md:w-80 bg-[#0A0A0A] border-l border-white/5 flex flex-col h-full">

                    {/* Sidebar header */}
                    <div className="p-5 border-b border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Youtube className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <h3 className="text-white font-black uppercase text-sm leading-tight line-clamp-1">{course.title}</h3>
                        </div>
                        <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">
                            {course.lessons?.length || 0} vídeos en esta colección
                        </p>
                    </div>

                    {/* Lesson list */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-3 space-y-1">
                            {course.lessons && course.lessons.map((lesson, idx) => {
                                const isActive = currentLesson?.id === lesson.id;
                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => setCurrentLesson(lesson)}
                                        className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 group
                                            ${isActive
                                                ? 'bg-red-600/10 border-red-600/25 shadow-[0_0_15px_rgba(220,38,38,0.08)]'
                                                : 'bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/8'}
                                        `}
                                    >
                                        {/* Icon / number */}
                                        <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black font-mono transition-all
                                            ${isActive
                                                ? 'bg-red-600 text-white'
                                                : 'bg-white/5 text-slate-600 group-hover:bg-white/10 group-hover:text-slate-400'}
                                        `}>
                                            {isActive
                                                ? <PlayCircle className="w-3.5 h-3.5" />
                                                : <span>{idx + 1}</span>
                                            }
                                        </div>

                                        {/* Title */}
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-mono text-[11px] font-bold leading-snug truncate transition-colors
                                                ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}
                                            `}>
                                                {lesson.title}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
