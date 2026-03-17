import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, BookOpen, Video, ChevronRight, CheckCircle, Sparkles, GraduationCap } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LazyImage from '../components/LazyImage';
import api from '../services/api';

// ── Hero ──────────────────────────────────────────────────────────────────────
function MyCoursesHero({ courses }) {
    const owned     = courses.length;
    const completed = courses.filter(c => c.progress_percentage === 100).length;
    const inProgress = courses.filter(c => c.progress_percentage > 0 && c.progress_percentage < 100).length;

    return (
        <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/8"
             style={{ background: 'linear-gradient(135deg, #021008 0%, #03180c 40%, #020e07 100%)' }}>
            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.07]"
                 style={{
                     backgroundImage: `linear-gradient(rgba(16,185,129,0.6) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(16,185,129,0.6) 1px, transparent 1px)`,
                     backgroundSize: '42px 42px'
                 }} />

            {/* Glows */}
            <div className="absolute top-0 left-1/4 w-[480px] h-64 rounded-full opacity-20 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.45) 0%, transparent 70%)', filter: 'blur(50px)' }} />
            <div className="absolute bottom-0 right-1/3 w-80 h-52 rounded-full opacity-15 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(5,150,105,0.35) 0%, transparent 70%)', filter: 'blur(55px)' }} />

            {/* Bottom edge */}
            <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                 style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)' }} />

            <div className="relative z-10 px-10 pt-12 pb-11">
                {/* Badge row */}
                <div className="flex items-center gap-3 mb-7 flex-wrap">
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-sm"
                         style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                            Mis Cursos · Biblioteca Personal
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                        <GraduationCap size={10} className="text-emerald-400" />
                        <span className="text-[10px] font-mono text-slate-500">Acceso vitalicio · Siempre disponible</span>
                    </div>
                </div>

                {/* Headline */}
                <div className="mb-7">
                    <h1 className="text-6xl font-black tracking-tight leading-none mb-4">
                        <span className="text-white">Tu Biblioteca</span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(90deg, #34d399 0%, #10b981 40%, #059669 80%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Personal Vitalicia
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                        Todos los cursos que has adquirido, siempre disponibles.{' '}
                        <span className="text-slate-300 font-medium">Una compra, acceso para siempre.</span>
                    </p>
                </div>

                {/* Stats pills */}
                <div className="flex items-center gap-3 flex-wrap">
                    {[
                        { label: 'Adquiridos',  value: String(owned),      color: 'text-emerald-400' },
                        { label: 'En progreso', value: String(inProgress),  color: 'text-amber-400' },
                        { label: 'Completados', value: String(completed),   color: 'text-sky-400' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03]">
                            <span className={`text-xl font-black ${color}`}>{value}</span>
                            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

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
            if (import.meta.env.DEV) console.error('Error cargando mis cursos:', err);
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
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 relative overflow-hidden">
                {/* Ambient BG */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[150px] rounded-full -z-10 animate-pulse" />

                <MyCoursesHero courses={courses} />

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
                    <LazyImage src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
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
