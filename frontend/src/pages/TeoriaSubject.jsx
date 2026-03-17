import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    FileText,
    Calendar,
    ArrowRight,
    Sparkles,
    BookOpen,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import Breadcrumb from '../components/Breadcrumb';
import api from '../services/api';
import '../index.css';
import { useSEO, schemaCourse, schemaBreadcrumb } from '../hooks/useSEO';

const SUBJECT_STYLES = {
    'Bases de Datos': { iconBg: 'bg-violet-500/20', iconBorder: 'border-violet-500/30', iconColor: 'text-violet-400', gradient: 'from-violet-400 to-violet-600' },
    'Redes': { iconBg: 'bg-sky-500/20', iconBorder: 'border-sky-500/30', iconColor: 'text-sky-400', gradient: 'from-sky-400 to-sky-600' },
    'Sistemas Operativos': { iconBg: 'bg-emerald-500/20', iconBorder: 'border-emerald-500/30', iconColor: 'text-emerald-400', gradient: 'from-emerald-400 to-emerald-600' },
    'Fundamentos de Hardware': { iconBg: 'bg-orange-500/20', iconBorder: 'border-orange-500/30', iconColor: 'text-orange-400', gradient: 'from-orange-400 to-orange-600' },
    'Lenguaje de Marcas': { iconBg: 'bg-cyan-500/20', iconBorder: 'border-cyan-500/30', iconColor: 'text-cyan-400', gradient: 'from-cyan-400 to-cyan-600' },
};

const DEFAULT_STYLE = { iconBg: 'bg-slate-500/20', iconBorder: 'border-slate-500/30', iconColor: 'text-slate-400', gradient: 'from-slate-400 to-slate-600' };

export default function TeoriaSubject() {
    const { subjectSlug } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get(`/teoria/subjects/${subjectSlug}`)
            .then(res => {
                setSubject(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Asignatura no encontrada.');
                setLoading(false);
            });
    }, [subjectSlug]);

    const style = subject ? (SUBJECT_STYLES[subject.name] || DEFAULT_STYLE) : DEFAULT_STYLE;

    // Dynamic SEO per subject
    useSEO({
        title: subject ? `${subject.name} — Temario Completo` : 'Teoría',
        description: subject
            ? `Aprende ${subject.name} para ASIR y SMR. ${subject.posts?.length || 0} artículos técnicos con explicaciones paso a paso. | Tech4U Academy`
            : 'Temario completo para ciclos formativos de informática.',
        path: `/teoria/${subjectSlug}`,
        schemas: subject ? [
            schemaCourse({
                name: subject.name,
                description: `Temario completo de ${subject.name} para ASIR y SMR. ${subject.posts?.length || 0} lecciones.`,
                slug: subjectSlug,
                postCount: subject.posts?.length || 0,
            }),
            schemaBreadcrumb([
                { name: 'Inicio', url: '/' },
                { name: 'Teoría', url: '/teoria' },
                { name: subject.name, url: `/teoria/${subjectSlug}` },
            ]),
        ] : undefined,
    });

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8">

                <Breadcrumb items={[
                    { name: 'Inicio', href: '/' },
                    { name: 'Teoría', href: '/teoria' },
                    { name: subject?.name || subjectSlug },
                ]} />

                {loading ? (
                    <div className="flex items-center gap-3 text-slate-500 font-mono text-[10px] uppercase animate-pulse">
                        <Sparkles className="w-4 h-4" /> Consultando archivos...
                    </div>
                ) : error ? (
                    <div className="glass rounded-3xl p-12 border-2 border-dashed border-red-500/20 text-center max-w-3xl">
                        <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest">{error}</p>
                    </div>
                ) : subject && (
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <PageHeader
                            title={subject.name}
                            subtitle={`Contenido técnico — ${subject.posts?.length || 0} artículos`}
                            Icon={BookOpen}
                            gradient={`from-white via-${style.iconColor.split('-')[1]}-100 to-${style.iconColor.split('-')[1]}-500`}
                            iconColor={style.iconColor}
                            iconBg={style.iconBg}
                            iconBorder={style.iconBorder}
                            glowColor={style.iconBg}
                        />

                        <div className="max-w-4xl space-y-4">
                            {subject.posts?.length === 0 ? (
                                <div className="glass rounded-3xl p-16 border-2 border-dashed border-white/5 text-center">
                                    <FileText className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Esta sección está vacía por ahora</p>
                                </div>
                            ) : (
                                subject.posts.map((post, idx) => (
                                    <Link
                                        key={post.id}
                                        to={`/teoria/${subjectSlug}/${post.slug}`}
                                        className="group block no-underline"
                                    >
                                        <div className="glass rounded-[2rem] p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all flex items-center justify-between group-hover:translate-x-1">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-neon group-hover:border-neon/30 transition-all">
                                                    <span className="font-mono text-xs opacity-50">{String(idx + 1).padStart(2, '0')}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white group-hover:text-neon transition-colors mb-1">{post.title}</h3>
                                                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(post.updated_at).toLocaleDateString('es-ES')}</span>
                                                        <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                                        <span>Lectura técnica</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-neon group-hover:border-neon/30 transition-all">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
