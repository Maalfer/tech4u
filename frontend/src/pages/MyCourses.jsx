import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, BookOpen, Video, ChevronRight, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function MyCourses() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyCourses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/video-courses/shop');
            // Filter only purchased courses
            setCourses(res.data.filter(c => c.is_purchased));
        } catch (err) {
            console.error('Error cargando mis cursos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyCourses();
    }, []);

    if (loading) return (
        <div className="flex h-screen bg-[#0D0D0D] items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">
                {/* Ambient BG */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[150px] rounded-full -z-10 animate-pulse" />

                <header className="mb-12">
                    <div className="flex items-center gap-5 mb-3">
                        <div className="p-4 bg-gradient-to-br from-emerald-600/20 to-teal-600/10 rounded-2xl border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                            <BookOpen className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-400">
                                Mis <span className="text-white">Cursos</span>
                            </h1>
                            <p className="text-[11px] font-mono text-emerald-400/70 uppercase tracking-[0.4em] mt-2">
                                // Tu Biblioteca Personal Vitalicia
                            </p>
                        </div>
                    </div>
                </header>

                {courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-40 text-center">
                        <BookOpen className="w-16 h-16 text-emerald-500 mb-4" />
                        <p className="font-mono text-slate-500 uppercase tracking-widest text-sm">Aún no has adquirido ningún curso</p>
                        <button
                            onClick={() => navigate('/shop')}
                            className="mt-6 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-black uppercase transition-all"
                        >
                            Ir a la Academy Shop
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <MyCourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function MyCourseCard({ course }) {
    const navigate = useNavigate();
    const lessonCount = course.lessons?.length || 0;

    return (
        <div className="group relative bg-gradient-to-b from-stone-900/60 to-black rounded-[2rem] border border-emerald-500/20 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] flex flex-col">
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-emerald-900/30 to-black flex-shrink-0">
                {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-16 h-16 text-emerald-500/40" />
                    </div>
                )}
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-500/90 text-black rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" /> Adquirido
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${course.progress_percentage}%` }} />
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                    <Video className="w-3.5 h-3.5" />
                    <span>{lessonCount} lecciones</span>
                    <span className="ml-auto">{course.progress_percentage}% completado</span>
                </div>
                <h2 className="text-lg font-black text-white uppercase italic tracking-tight mb-2 leading-snug group-hover:text-emerald-100 transition-colors">
                    {course.title}
                </h2>
                <button
                    onClick={() => navigate(`/watch/${course.id}`)}
                    className="mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <PlayCircle className="w-4 h-4" /> Entrar al Curso
                </button>
            </div>
        </div>
    );
}
