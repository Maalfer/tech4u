import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, PlayCircle, CheckCircle, Lock,
    ShoppingBag, Unlock, Clock, BookOpen
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function ShopCourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/video-courses/${id}/shop-detail`);
            setCourse(res.data);
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error cargando curso:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const handlePurchase = async () => {
        if (!course) return;
        if (!window.confirm(`¿Confirmas la compra de "${course.title}" por ${course.price?.toFixed(2)}€? Acceso vitalicio garantizado.`)) return;

        setPurchasing(true);
        try {
            await api.post(`/video-courses/${id}/purchase`);
            await fetchCourse();
        } catch (err) {
            alert(err?.response?.data?.detail || 'Error al procesar la compra.');
        } finally {
            setPurchasing(false);
        }
    };

    const handleToggleLesson = async (lessonId) => {
        if (!course?.is_purchased) return;
        try {
            await api.post(`/video-courses/lessons/${lessonId}/complete`);
            await fetchCourse();
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error al marcar lección:', err);
        }
    };

    if (loading) return (
        <div className="flex h-screen bg-[#0D0D0D] items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!course) return (
        <div className="flex h-screen bg-[#0D0D0D] items-center justify-center text-slate-500 font-mono">
            Curso no encontrado.
        </div>
    );

    const lessons = course.lessons || [];

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">

                {/* Ambient */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[150px] rounded-full -z-10 animate-pulse" />

                {/* Back */}
                <button
                    onClick={() => navigate('/shop')}
                    className="group flex items-center gap-2 mb-8 text-[11px] font-mono text-slate-500 hover:text-purple-400 uppercase tracking-widest transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Volver a la tienda
                </button>

                <div className="max-w-4xl mx-auto">
                    {/* Course Header */}
                    <div className="flex flex-col md:flex-row gap-8 mb-10">
                        {/* Thumbnail */}
                        <div className="w-full md:w-72 h-48 flex-shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-black border border-white/5 flex items-center justify-center">
                            {course.thumbnail_url ? (
                                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                                <BookOpen className="w-16 h-16 text-purple-500/30" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-between flex-1">
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-[10px] font-mono text-purple-400 uppercase tracking-widest">
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Academy Shop · Curso Vitalicio</span>
                                </div>
                                <h1 className="text-4xl font-black italic uppercase tracking-tight text-white mb-3 leading-tight">
                                    {course.title}
                                </h1>
                                <p className="text-sm font-mono text-slate-400 leading-relaxed">
                                    {course.description || 'Descripción no disponible.'}
                                </p>
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-center gap-6 mt-6 text-[11px] font-mono text-slate-500 uppercase">
                                <span className="flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {lessons.length} lecciones
                                </span>
                                {course.is_purchased && (
                                    <span className="flex items-center gap-1.5 text-purple-400">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        {course.progress_percentage}% completado
                                    </span>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="mt-6">
                                {course.is_purchased ? (
                                    <div className="flex items-center gap-3 px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl w-fit">
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                        <span className="text-sm font-mono font-black text-emerald-300 uppercase tracking-wider">Curso Adquirido · Acceso Vitalicio</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handlePurchase}
                                        disabled={purchasing}
                                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-black uppercase rounded-2xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all active:scale-95 disabled:opacity-60"
                                    >
                                        {purchasing ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Unlock className="w-5 h-5" />
                                        )}
                                        Comprar por {course.price != null ? `${course.price.toFixed(2)}€` : 'Gratis'} — Acceso Vitalicio
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                    {/* Lessons List */}
                    <h2 className="text-sm font-black font-mono uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-purple-400" />
                        </span>
                        Temario del Curso
                    </h2>

                    <div className="space-y-3">
                        {lessons.map((lesson, i) => (
                            <div
                                key={lesson.id}
                                className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300
                                    ${course.is_purchased
                                        ? 'bg-white/[0.02] hover:bg-white/[0.04] border-white/5 hover:border-purple-500/20 cursor-pointer'
                                        : 'bg-black/40 border-white/5 opacity-50'
                                    }`}
                                onClick={() => course.is_purchased && handleToggleLesson(lesson.id)}
                            >
                                {/* Number */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-xl text-[11px] font-black font-mono flex items-center justify-center
                                    ${lesson.is_completed
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-white/5 text-slate-600 border border-white/5'
                                    }`}>
                                    {lesson.is_completed
                                        ? <CheckCircle className="w-4 h-4" />
                                        : String(i + 1).padStart(2, '0')
                                    }
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${lesson.is_completed ? 'text-emerald-200' : 'text-slate-200'}`}>
                                        {lesson.title}
                                    </p>
                                    {lesson.description && (
                                        <p className="text-[10px] font-mono text-slate-600 mt-0.5 truncate">{lesson.description}</p>
                                    )}
                                </div>

                                {/* Lock / Play */}
                                {course.is_purchased ? (
                                    <PlayCircle className="w-5 h-5 text-purple-500/40 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                                ) : (
                                    <Lock className="w-4 h-4 text-slate-700 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
