import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Lock, Unlock, PlayCircle, Star, ChevronRight,
    Video, CheckCircle, Zap, BookOpen, Sparkles, Crown,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LazyImage from '../components/LazyImage';
import api from '../services/api';

// ── Hero ──────────────────────────────────────────────────────────────────────
function ShopHero({ courses }) {
    const available = courses.length;
    const owned = courses.filter(c => c.is_purchased).length;

    return (
        <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/8"
             style={{ background: 'linear-gradient(135deg, #0a0214 0%, #100320 40%, #080110 100%)' }}>
            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.07]"
                 style={{
                     backgroundImage: `linear-gradient(rgba(168,85,247,0.6) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(168,85,247,0.6) 1px, transparent 1px)`,
                     backgroundSize: '42px 42px'
                 }} />

            {/* Glows */}
            <div className="absolute top-0 left-1/4 w-[480px] h-64 rounded-full opacity-20 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.45) 0%, transparent 70%)', filter: 'blur(50px)' }} />
            <div className="absolute bottom-0 right-1/3 w-80 h-52 rounded-full opacity-15 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, transparent 70%)', filter: 'blur(55px)' }} />

            {/* Bottom edge */}
            <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                 style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)' }} />

            <div className="relative z-10 px-10 pt-12 pb-11">
                {/* Badge row */}
                <div className="flex items-center gap-3 mb-7 flex-wrap">
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-sm"
                         style={{ borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.08)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
                            Academy Shop · Compra Vitalicia
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                        <Crown size={10} className="text-purple-400" />
                        <span className="text-[10px] font-mono text-slate-500">Pago único · Acceso para siempre</span>
                    </div>
                </div>

                {/* Headline */}
                <div className="mb-7">
                    <h1 className="text-6xl font-black tracking-tight leading-none mb-4">
                        <span className="text-white">Invierte en tu</span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(90deg, #c084fc 0%, #a855f7 40%, #7c3aed 80%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Formación IT
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                        Cursos premium de pago único y acceso vitalicio.{' '}
                        <span className="text-slate-300 font-medium">Una compra, tuyo para siempre sin suscripción.</span>
                    </p>
                </div>

                {/* Stats pills */}
                <div className="flex items-center gap-3 flex-wrap">
                    {[
                        { label: 'Cursos disponibles', value: String(available), color: 'text-purple-400' },
                        { label: 'Adquiridos',          value: String(owned),    color: 'text-emerald-400' },
                        { label: 'Pago único',          value: '✓',              color: 'text-violet-400' },
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

export default function AcademyShop() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(null); // ID del curso en proceso de compra

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/video-courses/shop');
            setCourses(res.data);
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error cargando tienda:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handlePurchase = async (course) => {
        if (course.is_purchased) {
            navigate(`/watch/${course.id}`);
            return;
        }

        if (!window.confirm(`¿Confirmas la compra de "${course.title}" por ${course.price?.toFixed(2)}€? Te redirigiremos a Stripe para completar el pago de forma segura.`)) return;

        setPurchasing(course.id);
        try {
            const res = await api.post(`/video-courses/${course.id}/create-checkout-session`);
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (err) {
            const msg = err?.response?.data?.detail || 'Error al procesar la compra.';
            alert(msg);
        } finally {
            setPurchasing(null);
        }
    };

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
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[150px] rounded-full -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 blur-[120px] rounded-full -z-10" />

                <ShopHero courses={courses} />

                {/* Info Banner */}
                <div className="mb-8 p-5 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in duration-700">
                    <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 animate-pulse" />
                    <p className="text-sm font-mono text-purple-200/80">
                        Los cursos de la <span className="text-purple-300 font-bold">Academy Shop</span> se compran con un único pago vitalicio. Una vez adquiridos, son tuyos para siempre, independientemente de tu suscripción.
                    </p>
                </div>

                {/* Courses Grid */}
                {courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-40">
                        <ShoppingBag className="w-16 h-16 text-purple-500 mb-4" />
                        <p className="font-mono text-slate-500 uppercase tracking-widest text-sm">Próximamente habrá cursos disponibles</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onAction={() => handlePurchase(course)}
                                onView={() => navigate(course.is_purchased ? `/watch/${course.id}` : `/shop/${course.id}`)}
                                purchasing={purchasing === course.id}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function CourseCard({ course, onAction, onView, purchasing }) {
    const lessonCount = course.lessons?.length || 0;
    const isOwned = course.is_purchased;

    return (
        <div className={`group relative bg-gradient-to-b from-stone-900/60 to-black rounded-[2rem] border overflow-hidden transition-all duration-500 shadow-xl hover:-translate-y-1 flex flex-col
            ${isOwned
                ? 'border-purple-500/40 hover:border-purple-400/60 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]'
                : 'border-white/5 hover:border-purple-500/20 hover:shadow-[0_8px_30px_rgba(168,85,247,0.1)]'
            }`}>

            {/* Thumbnail / Cover */}
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-purple-900/30 to-black flex-shrink-0">
                {course.thumbnail_url ? (
                    <LazyImage src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-16 h-16 text-purple-500/40" />
                    </div>
                )}

                {/* Status Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2
                    ${isOwned
                        ? 'bg-emerald-500/90 text-black'
                        : 'bg-black/70 border border-white/10 text-slate-300 backdrop-blur'
                    }`}>
                    {isOwned
                        ? <><CheckCircle className="w-3 h-3" /> Adquirido</>
                        : <><Lock className="w-3 h-3" /> Precio: {course.price != null ? `${course.price.toFixed(2)}€` : 'Gratis'}</>
                    }
                </div>

                {/* Progress if owned */}
                {isOwned && course.progress_percentage > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
                        <div className="h-full bg-purple-500 transition-all" style={{ width: `${course.progress_percentage}%` }} />
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-purple-400 uppercase tracking-widest">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{lessonCount} lección{lessonCount !== 1 ? 'es' : ''}</span>
                    {isOwned && <span className="ml-auto text-emerald-400">{course.progress_percentage}% completado</span>}
                </div>

                <h2 className="text-lg font-black text-white uppercase italic tracking-tight mb-2 leading-snug group-hover:text-purple-100 transition-colors">
                    {course.title}
                </h2>
                <p className="text-[12px] font-mono text-slate-500 leading-relaxed flex-1 line-clamp-3">
                    {course.description || 'Descripción no disponible.'}
                </p>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                    {isOwned ? (
                        <button
                            onClick={onView}
                            className="flex-1 py-3 bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95"
                        >
                            <PlayCircle className="w-4 h-4" /> Continuar Curso
                        </button>
                    ) : (
                        <button
                            onClick={onAction}
                            disabled={purchasing}
                            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-[11px] font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {purchasing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Unlock className="w-4 h-4" />
                                    Comprar Ahora
                                </>
                            )}
                        </button>
                    )}
                    {isOwned && (
                        <button
                            onClick={onView}
                            className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                        >
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
