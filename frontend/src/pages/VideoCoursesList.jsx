import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Video, Search, Clock, CheckCircle, ChevronRight, Youtube, Zap, BarChart2, X } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';

export default function VideoCoursesList() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/video-courses/');
                setCourses(res.data);
            } catch (err) {
                (import.meta.env.DEV && console.error)("Error fetching courses", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filtered = courses.filter(c =>
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
    );

    const inProgress = filtered.filter(c => c.progress_percentage > 0 && c.progress_percentage < 100);
    const notStarted = filtered.filter(c => c.progress_percentage === 0 || c.progress_percentage == null);
    const completed = filtered.filter(c => c.progress_percentage === 100);

    const totalLessons = courses.reduce((a, c) => a + (c.lessons?.length || 0), 0);
    const totalCompleted = courses.filter(c => c.progress_percentage === 100).length;
    const avgProgress = courses.length
        ? Math.round(courses.reduce((a, c) => a + (c.progress_percentage || 0), 0) / courses.length)
        : 0;

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0D0D0D]">
                <Sidebar />
                <main className="flex-1 ml-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">

                <PageHeader
                    Icon={Youtube}
                    gradient="from-white via-red-100 to-red-500"
                    iconColor="text-red-500"
                    iconBg="bg-red-500/20"
                    iconBorder="border-red-500/30"
                    glowColor="bg-red-500/20"
                    title={<>YT <span className="text-red-500">Videos</span></>}
                    subtitle="Material de apoyo gratuito linkado desde YouTube"
                />

                {/* Stats Row */}
                {courses.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-8 mt-2">
                        <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <Video className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-xl font-black font-mono text-white">{courses.length}</p>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Cursos totales</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                                <PlayCircle className="w-5 h-5 text-sky-400" />
                            </div>
                            <div>
                                <p className="text-xl font-black font-mono text-white">{totalLessons}</p>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Lecciones disponibles</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <BarChart2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xl font-black font-mono text-white">{avgProgress}%</p>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Progreso medio</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                {courses.length > 0 && (
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Buscar cursos..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-10 py-4 text-sm font-mono text-white outline-none focus:border-red-500/40 transition-all placeholder:text-slate-600"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

                {courses.length === 0 ? (
                    <div className="p-16 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
                        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                            <Youtube className="w-10 h-10 text-red-500/50" />
                        </div>
                        <h3 className="text-white font-black text-lg uppercase italic mb-2">Sin contenido aún</h3>
                        <p className="text-slate-500 font-mono text-xs max-w-sm mx-auto">El profesor está preparando material en vídeo. Vuelve pronto para ver los primeros cursos.</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-500 font-mono text-sm">No se encontraron cursos para "<span className="text-red-400">{search}</span>"</p>
                    </div>
                ) : (
                    <div className="space-y-12">

                        {/* CONTINÚA VIENDO */}
                        {inProgress.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Continúa Viendo</h2>
                                    <span className="text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded-full border border-white/5 bg-white/3">{inProgress.length} en progreso</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {inProgress.map(course => (
                                        <CourseCard key={course.id} course={course} navigate={navigate} highlight />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* POR EMPEZAR */}
                        {notStarted.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                        <PlayCircle className="w-4 h-4 text-red-400" />
                                    </div>
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest">
                                        {inProgress.length > 0 ? 'Por Empezar' : 'Todos los Cursos'}
                                    </h2>
                                    <span className="text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded-full border border-white/5 bg-white/3">{notStarted.length}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {notStarted.map(course => (
                                        <CourseCard key={course.id} course={course} navigate={navigate} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* COMPLETADOS */}
                        {completed.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Completados</h2>
                                    <span className="text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded-full border border-white/5 bg-white/3">{completed.length}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-70">
                                    {completed.map(course => (
                                        <CourseCard key={course.id} course={course} navigate={navigate} done />
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                )}
            </main>
        </div>
    );
}

function CourseCard({ course, navigate, highlight = false, done = false }) {
    const lessons = course.lessons?.length || 0;
    const prog = course.progress_percentage || 0;

    const btnLabel = done
        ? 'Repasar'
        : prog > 0
            ? 'Continuar'
            : 'Comenzar';

    const btnClass = done
        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black hover:border-emerald-500'
        : highlight
            ? 'bg-orange-500 text-black hover:bg-orange-400 hover:scale-105 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
            : 'bg-white/5 border border-slate-700 text-white hover:bg-red-600 hover:border-red-600 hover:scale-105';

    return (
        <div className={`bg-[#111] border rounded-3xl overflow-hidden transition-all duration-300 group flex flex-col ${done ? 'border-emerald-500/10' : highlight ? 'border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.08)]' : 'border-slate-800 hover:border-slate-600'}`}>

            {/* Thumbnail */}
            <div className="h-40 bg-gradient-to-br from-slate-800 to-black relative overflow-hidden flex-shrink-0">
                {course.thumbnail_url ? (
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Youtube className="w-14 h-14 text-slate-700" />
                    </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                    <div className="px-2.5 py-1 bg-black/80 backdrop-blur border border-white/10 rounded-full font-mono text-[9px] text-white flex items-center gap-1">
                        <PlayCircle className="w-3 h-3 text-red-500" />
                        {lessons} lecciones
                    </div>
                    {done && (
                        <div className="px-2.5 py-1 bg-emerald-500/20 backdrop-blur border border-emerald-500/40 rounded-full font-mono text-[9px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Completado
                        </div>
                    )}
                    {highlight && !done && (
                        <div className="px-2.5 py-1 bg-orange-500/20 backdrop-blur border border-orange-500/40 rounded-full font-mono text-[9px] text-orange-400 flex items-center gap-1 animate-pulse">
                            <Zap className="w-3 h-3" /> En progreso
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <h2 className="text-white font-black text-base uppercase tracking-tight mb-1.5 line-clamp-2 group-hover:text-red-400 transition-colors">
                    {course.title}
                </h2>
                <p className="text-slate-500 font-mono text-xs line-clamp-2 mb-4 flex-1 leading-relaxed">
                    {course.description || "Material de apoyo gratuito para complementar tu formación."}
                </p>

                {/* Progress */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Progreso</span>
                        <span className={`text-[10px] font-mono font-black ${done ? 'text-emerald-400' : highlight ? 'text-orange-400' : 'text-slate-400'}`}>{prog}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${done ? 'bg-emerald-500' : highlight ? 'bg-orange-500' : 'bg-red-600'}`}
                            style={{ width: `${prog}%` }}
                        />
                    </div>
                </div>

                <button
                    onClick={() => navigate(`/video-cursos/${course.id}`)}
                    className={`w-full py-3 font-black font-mono text-xs uppercase tracking-wide rounded-xl transition-all flex items-center justify-center gap-2 ${btnClass}`}
                >
                    {btnLabel}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
