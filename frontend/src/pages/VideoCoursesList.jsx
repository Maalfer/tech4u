import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Award, Clock, ArrowRight, Video } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';

export default function VideoCoursesList() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/video-courses/');
                setCourses(res.data);
            } catch (err) {
                console.error("Error fetching courses", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0D0D0D]">
                <Sidebar />
                <main className="flex-1 ml-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">

                <PageHeader
                    Icon={Video}
                    gradient="from-white via-green-100 to-[var(--color-neon)]"
                    iconColor="text-neon"
                    iconBg="bg-neon/20"
                    iconBorder="border-neon/30"
                    glowColor="bg-neon/20"
                    title={<>Cursos en <span className="text-neon">Vídeo</span></>}
                    subtitle="Aprende paso a paso"
                />

                <div className="mb-8 mt-6">
                    <p className="text-slate-400 font-mono text-sm max-w-2xl leading-relaxed">
                        Explora nuestro catálogo de cursos en vídeo interactivos. Rastrea tu progreso y domina los módulos con explicaciones paso a paso.
                    </p>
                </div>

                {courses.length === 0 ? (
                    <div className="p-12 text-center bg-white/5 border border-white/10 rounded-3xl">
                        <Video className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                        <h3 className="text-white font-mono text-lg mb-2">Aún no hay cursos</h3>
                        <p className="text-slate-500 font-mono text-xs">Vuelve más tarde para ver nuevos contenidos en vídeo.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div key={course.id} className="bg-[#111] border border-slate-800 rounded-3xl overflow-hidden hover:border-neon/50 transition-all duration-300 group flex flex-col">
                                {/* Thumbnail fallback/Image */}
                                <div className="h-40 bg-gradient-to-br from-slate-800 to-black relative">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <PlayCircle className="w-16 h-16 text-slate-700" />
                                        </div>
                                    )}
                                    {/* Badge Clases */}
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/80 backdrop-blur border border-white/10 rounded-full font-mono text-[10px] text-white flex items-center gap-1">
                                        <PlayCircle className="w-3 h-3 text-neon" />
                                        {course.lessons?.length || 0} clases
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h2 className="text-white font-black text-lg uppercase tracking-tight mb-2 line-clamp-2">
                                        {course.title}
                                    </h2>
                                    <p className="text-slate-400 font-mono text-xs line-clamp-3 mb-6 flex-1">
                                        {course.description || "Sin descripción"}
                                    </p>

                                    <div className="space-y-4 mt-auto">
                                        {/* Progreso */}
                                        <div>
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-[10px] font-mono text-slate-500 uppercase">Tu Progreso</span>
                                                <span className="text-[10px] font-mono text-neon font-bold">{course.progress_percentage}%</span>
                                            </div>
                                            <ProgressBar percent={course.progress_percentage} />
                                        </div>

                                        <button
                                            onClick={() => navigate(`/video-cursos/${course.id}`)}
                                            className="w-full py-3 bg-white/5 border border-slate-700 text-white font-black font-mono text-xs uppercase tracking-wide rounded-xl group-hover:bg-neon group-hover:text-black group-hover:border-neon transition-all flex items-center justify-center gap-2"
                                        >
                                            {course.progress_percentage > 0 && course.progress_percentage < 100 ? "Continuar Curso" : "Ver Curso"}
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
