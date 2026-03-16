import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Search, Youtube, X, BookOpen, ChevronRight } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

// ── Hero ──────────────────────────────────────────────────────────────────────
function YTVideosHero({ totalCourses, totalLessons }) {
    return (
        <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/8"
             style={{ background: 'linear-gradient(135deg, #130202 0%, #1e0303 40%, #100202 100%)' }}>
            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.07]"
                 style={{
                     backgroundImage: `linear-gradient(rgba(239,68,68,0.6) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(239,68,68,0.6) 1px, transparent 1px)`,
                     backgroundSize: '42px 42px'
                 }} />

            {/* Glows */}
            <div className="absolute top-0 left-1/4 w-[480px] h-64 rounded-full opacity-20 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.45) 0%, transparent 70%)', filter: 'blur(50px)' }} />
            <div className="absolute bottom-0 right-1/3 w-80 h-52 rounded-full opacity-12 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(220,38,38,0.35) 0%, transparent 70%)', filter: 'blur(55px)' }} />

            {/* Bottom edge */}
            <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                 style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)' }} />

            <div className="relative z-10 px-10 pt-12 pb-11">
                {/* Badge row */}
                <div className="flex items-center gap-3 mb-7 flex-wrap">
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-sm"
                         style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300">
                            YT Videos · Material de Apoyo
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                        <Youtube size={10} className="text-red-400" />
                        <span className="text-[10px] font-mono text-slate-500">Contenido gratuito · YouTube</span>
                    </div>
                </div>

                {/* Headline */}
                <div className="mb-7">
                    <h1 className="text-6xl font-black tracking-tight leading-none mb-4">
                        <span className="text-white">Aprende con</span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(90deg, #f87171 0%, #ef4444 40%, #dc2626 80%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Vídeos YouTube
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                        Material audiovisual seleccionado para complementar tu formación.{' '}
                        <span className="text-slate-300 font-medium">100% gratuito y siempre actualizado.</span>
                    </p>
                </div>

                {/* Stats pills */}
                <div className="flex items-center gap-3 flex-wrap">
                    {[
                        { label: 'Colecciones', value: String(totalCourses || 0), color: 'text-red-400' },
                        { label: 'Vídeos',      value: String(totalLessons || 0), color: 'text-orange-400' },
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
                if (import.meta.env.DEV) console.error("Error fetching courses", err);
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

    const totalLessons = courses.reduce((a, c) => a + (c.lessons?.length || 0), 0);

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

                <YTVideosHero totalCourses={courses.length} totalLessons={totalLessons} />

                {/* Search Bar */}
                {courses.length > 0 && (
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Buscar colecciones..."
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
                        <p className="text-slate-500 font-mono text-xs max-w-sm mx-auto">El profesor está preparando material en vídeo. Vuelve pronto para ver las primeras colecciones.</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-500 font-mono text-sm">No se encontraron colecciones para "<span className="text-red-400">{search}</span>"</p>
                    </div>
                ) : (
                    <div>
                        {/* Section header */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <Youtube className="w-4 h-4 text-red-400" />
                            </div>
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Todas las Colecciones</h2>
                            <span className="text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded-full border border-white/5 bg-white/3">{filtered.length}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map(course => (
                                <CourseCard key={course.id} course={course} navigate={navigate} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function CourseCard({ course, navigate }) {
    const lessons = course.lessons?.length || 0;

    return (
        <div
            onClick={() => navigate(`/video-cursos/${course.id}`)}
            className="bg-[#111] border border-slate-800 rounded-3xl overflow-hidden transition-all duration-300 group flex flex-col cursor-pointer hover:border-slate-600 hover:shadow-[0_0_30px_rgba(239,68,68,0.06)]"
        >
            {/* Thumbnail */}
            <div className="h-44 bg-gradient-to-br from-slate-800 to-black relative overflow-hidden flex-shrink-0">
                {course.thumbnail_url ? (
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Youtube className="w-14 h-14 text-slate-700 group-hover:text-slate-500 transition-colors" />
                    </div>
                )}

                {/* Play overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-xl">
                        <PlayCircle className="w-7 h-7 text-white" />
                    </div>
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />

                {/* Lessons badge */}
                <div className="absolute top-3 right-3">
                    <div className="px-2.5 py-1 bg-black/80 backdrop-blur border border-white/10 rounded-full font-mono text-[9px] text-white flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-red-400" />
                        {lessons} {lessons === 1 ? 'vídeo' : 'vídeos'}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <h2 className="text-white font-black text-base uppercase tracking-tight mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                    {course.title}
                </h2>
                <p className="text-slate-500 font-mono text-xs line-clamp-2 mb-5 flex-1 leading-relaxed">
                    {course.description || "Material de apoyo gratuito para complementar tu formación."}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Ver vídeos</span>
                    <div className="w-7 h-7 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-all">
                        <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
}
