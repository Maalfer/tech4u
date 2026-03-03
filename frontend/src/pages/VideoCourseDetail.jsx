import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle, ChevronLeft, Video } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

export default function VideoCourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/video-courses/${id}`);
                const data = res.data;
                setCourse(data);

                if (data.lessons && data.lessons.length > 0) {
                    // Try to find first uncompleted lesson, otherwise default to first
                    const firstUncompleted = data.lessons.find(l => !l.is_completed);
                    setCurrentLesson(firstUncompleted || data.lessons[0]);
                }
            } catch (err) {
                console.error("Error fetching course", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleLessonToggle = async () => {
        if (!currentLesson || toggling) return;
        setToggling(true);

        try {
            const res = await api.post(`/video-courses/lessons/${currentLesson.id}/complete`);
            const isNowCompleted = res.data.status === 'completed';

            // Optimistic UI update
            const updatedLessons = course.lessons.map(l =>
                l.id === currentLesson.id ? { ...l, is_completed: isNowCompleted } : l
            );

            // Recalculate progress
            const completedCount = updatedLessons.filter(l => l.is_completed).length;
            const newProgress = Math.round((completedCount / updatedLessons.length) * 100);

            setCourse({
                ...course,
                lessons: updatedLessons,
                progress_percentage: newProgress
            });
            setCurrentLesson({ ...currentLesson, is_completed: isNowCompleted });

        } catch (err) {
            console.error("Error toggling completion", err);
        } finally {
            setToggling(false);
        }
    };

    // Helper to extract YouTube video ID
    const getYouTubeEngineId = (url) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
        return match ? match[1] : null;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0D0D0D]">
                <Sidebar />
                <main className="flex-1 ml-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div>
                </main>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex min-h-screen bg-[#0D0D0D]">
                <Sidebar />
                <main className="flex-1 ml-64 p-8 flex flex-col items-center justify-center text-center">
                    <h2 className="text-3xl font-black text-white uppercase mb-4">Curso no encontrado</h2>
                    <button onClick={() => navigate('/video-cursos')} className="px-6 py-3 bg-[#39FF14] text-black font-black uppercase tracking-wider rounded-xl hover:scale-105 transition-transform">Volver a Cursos</button>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col md:flex-row h-screen overflow-hidden">

                {/* Visualizador - Columna Principal (75%) */}
                <div className="flex-1 bg-black flex flex-col overflow-y-auto">

                    {/* Header Top Bar */}
                    <div className="p-4 bg-[#111] border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
                        <button
                            onClick={() => navigate('/video-cursos')}
                            className="text-slate-400 hover:text-white flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Volver al catálogo
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-[#39FF14] font-mono text-[10px] uppercase tracking-widest font-bold border border-[#39FF14] px-3 py-1 rounded-full">Progreso: {course.progress_percentage}%</span>
                        </div>
                    </div>

                    {/* Vídeo y Detalles */}
                    {currentLesson ? (
                        <div className="flex-1 p-8">
                            <h1 className="text-3xl font-black text-white uppercase italic mb-6">
                                {currentLesson.title}
                            </h1>

                            {/* Player de YouTube */}
                            <div className="w-full aspect-video bg-[#050505] rounded-3xl overflow-hidden border border-white/10 mb-8 shadow-2xl relative">
                                {getYouTubeEngineId(currentLesson.youtube_url) ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${getYouTubeEngineId(currentLesson.youtube_url)}?autoplay=0&rel=0`}
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

                            {/* Controles de Clase */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#111] p-6 rounded-3xl border border-white/5">
                                <div className="flex-1 text-slate-400 font-mono text-xs leading-relaxed max-w-2xl">
                                    {currentLesson.description || "No hay descripción adicional para esta lección."}
                                </div>
                                <button
                                    onClick={handleLessonToggle}
                                    disabled={toggling}
                                    className={`flex items-center gap-2 px-6 py-4 rounded-xl font-black font-mono text-xs uppercase tracking-wider transition-all
                                        ${currentLesson.is_completed
                                            ? 'bg-transparent border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                                            : 'bg-[#39FF14] text-black hover:bg-[#32e011] hover:scale-105 shadow-[0_0_20px_rgba(57,255,20,0.3)]'}
                                        ${toggling ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {currentLesson.is_completed ? (
                                        <>Desmarcar <CheckCircle className="w-4 h-4 opacity-50" /></>
                                    ) : (
                                        <>Marcar Completada <CheckCircle className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 font-mono text-sm">
                            No hay lecciones en este curso todavía.
                        </div>
                    )}
                </div>

                {/* Sidebar Temario - Columna Derecha (25%) */}
                <div className="w-full md:w-80 bg-[#0A0A0A] border-l border-white/5 flex flex-col h-full">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-white font-black uppercase text-sm mb-1">{course.title}</h3>
                        <p className="text-slate-500 font-mono text-[10px] uppercase">{course.lessons?.length || 0} Clases</p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 space-y-2">
                            {course.lessons && course.lessons.map((lesson, idx) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => setCurrentLesson(lesson)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 group
                                        ${currentLesson?.id === lesson.id
                                            ? 'bg-white/10 border-white/20 shadow-lg'
                                            : 'bg-transparent border-transparent hover:bg-white/5'}
                                    `}
                                >
                                    <div className={`mt-1 flex-shrink-0 ${lesson.is_completed ? 'text-[#39FF14]' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                        {lesson.is_completed ? <CheckCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-mono text-xs font-bold leading-tight mb-1 truncate
                                            ${currentLesson?.id === lesson.id ? 'text-white' : 'text-slate-400'}
                                        `}>
                                            <span className="opacity-50 mr-2">{idx + 1}.</span>
                                            {lesson.title}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
