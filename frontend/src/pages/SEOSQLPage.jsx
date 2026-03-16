/**
 * SEO Landing Page: /sql-practice
 * Target keywords: "ejercicios SQL práctica", "SQL ASIR ejercicios", "aprender SQL online"
 */
import { Link, useNavigate } from 'react-router-dom';
import { Database, ArrowRight, ChevronRight, Zap } from 'lucide-react';
import { useSEO, schemaFAQ, schemaBreadcrumb, schemaOrganization } from '../hooks/useSEO';
import logoImg from '../assets/tech4u_logo.png';

const FAQS = [
    {
        question: '¿Qué aprendo con los ejercicios SQL de Tech4U?',
        answer: 'Aprenderás SQL desde cero: SELECT, WHERE, JOIN, GROUP BY, subconsultas, diseño de bases de datos y optimización de consultas, con ejercicios prácticos corregidos al instante.',
    },
    {
        question: '¿Necesito instalar MySQL o PostgreSQL para practicar?',
        answer: 'No. Tech4U incluye un editor SQL interactivo en el navegador. Puedes ejecutar consultas reales y ver los resultados de forma inmediata sin configurar nada.',
    },
    {
        question: '¿Es SQL importante para el examen de ASIR?',
        answer: 'Sí. La asignatura de Bases de Datos es una de las más technicas del ciclo ASIR. Dominar SQL es imprescindible para aprobar y para conseguir empleo.',
    },
    {
        question: '¿Qué nivel de SQL se trabaja en Tech4U?',
        answer: 'Desde nivel básico (SELECT, INSERT) hasta nivel avanzado (JOINs complejos, procedimientos almacenados, optimización). Hay ejercicios progresivos para cada nivel.',
    },
    {
        question: '¿Puedo acceder a los ejercicios SQL gratis?',
        answer: 'La primera lección de teoría de Bases de Datos es gratuita. Para acceder al SQL Skills completo con el editor interactivo necesitas un plan de suscripción.',
    },
];

const TOPICS = [
    { icon: '🔍', label: 'Consultas SELECT y filtros WHERE' },
    { icon: '🔗', label: 'JOINs: INNER, LEFT, RIGHT, FULL' },
    { icon: '📊', label: 'GROUP BY, HAVING y funciones de agregado' },
    { icon: '📝', label: 'INSERT, UPDATE y DELETE' },
    { icon: '🏗️', label: 'Diseño de tablas y relaciones' },
    { icon: '⚡', label: 'Subconsultas y optimización' },
];

export default function SEOSQLPage() {
    const navigate = useNavigate();

    useSEO({
        title: 'Ejercicios SQL — Práctica Interactiva para ASIR y SMR',
        description: 'Practica SQL con ejercicios interactivos en el navegador. SELECT, JOIN, GROUP BY, diseño de BBDD. Ideal para estudiantes de ASIR y Bases de Datos.',
        keywords: 'ejercicios SQL, SQL ASIR, práctica SQL online, bases de datos ejercicios, SQL JOIN, SQL SELECT',
        path: '/sql-practice',
        schemas: [
            schemaOrganization(),
            schemaFAQ(FAQS),
            schemaBreadcrumb([
                { name: 'Inicio', url: '/' },
                { name: 'Práctica SQL', url: '/sql-practice' },
            ]),
        ],
    });

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden">

            <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#0D0D0D]/90 backdrop-blur-xl">
                <button onClick={() => navigate('/')} aria-label="Ir a inicio">
                    <img src={logoImg} alt="Tech4U Academy" className="h-8 w-auto" />
                </button>
                <nav aria-label="Navegación principal" className="flex items-center gap-6">
                    <Link to="/teoria/bases-de-datos" className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Teoría BBDD</Link>
                    <Link to="/planes" className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Planes</Link>
                    <Link to="/login" className="px-5 py-2 bg-neon text-black text-[11px] font-black uppercase tracking-widest rounded-full hover:shadow-[0_0_20px_rgba(0,255,100,0.4)] transition-all">Empezar gratis</Link>
                </nav>
            </header>

            <section className="max-w-5xl mx-auto px-8 pt-24 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-8">
                    <Database className="w-4 h-4 text-violet-400" aria-hidden="true" />
                    <span className="text-violet-400 font-mono text-xs uppercase tracking-widest font-bold">SQL Skills</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9] mb-6">
                    Práctica SQL<br />
                    <span className="text-violet-400">Interactiva</span>
                </h1>
                <p className="text-lg text-slate-400 font-mono max-w-2xl mx-auto leading-relaxed mb-10">
                    Editor SQL en el navegador con corrección automática. Desde consultas básicas hasta diseño
                    avanzado de bases de datos para <strong className="text-white">ASIR</strong> y <strong className="text-white">SMR</strong>.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link to="/login?tab=register" className="px-10 py-4 bg-violet-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all">
                        Empezar gratis <ArrowRight className="inline w-4 h-4 ml-2" aria-hidden="true" />
                    </Link>
                    <Link to="/teoria/bases-de-datos" className="px-10 py-4 border border-white/10 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-white/5 transition-all">
                        Ver teoría BBDD
                    </Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-8 py-16" aria-labelledby="sql-topics-heading">
                <h2 id="sql-topics-heading" className="text-3xl font-black uppercase italic tracking-tighter text-white mb-10 text-center">
                    Temario SQL cubierto
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TOPICS.map(({ icon, label }) => (
                        <div key={label} className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 transition-all">
                            <span className="text-2xl" aria-hidden="true">{icon}</span>
                            <span className="text-sm font-medium text-slate-300">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-8 py-12 border-t border-white/5" aria-labelledby="sql-related-heading">
                <h2 id="sql-related-heading" className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">Contenido relacionado</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Teoría de Bases de Datos', href: '/teoria/bases-de-datos', desc: 'Fundamentos: ERD, normalización, SQL.' },
                        { label: 'Ejercicios Terminal Linux', href: '/linux-terminal-exercises', desc: 'MySQL en terminal, administración.' },
                        { label: 'Redes Informáticas', href: '/redes-informaticas', desc: 'Protocolos y arquitectura de redes.' },
                    ].map(({ label, href, desc }) => (
                        <Link key={label} to={href} className="group block p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/20 hover:bg-white/[0.04] transition-all no-underline">
                            <p className="font-bold text-white text-sm mb-1 group-hover:text-violet-400 transition-colors">{label}</p>
                            <p className="text-slate-500 text-xs font-mono">{desc}</p>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 mt-2 transition-colors" aria-hidden="true" />
                        </Link>
                    ))}
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-8 py-16" aria-labelledby="sql-faq-heading">
                <h2 id="sql-faq-heading" className="text-3xl font-black uppercase italic tracking-tighter text-white mb-10 text-center">Preguntas frecuentes</h2>
                <div className="space-y-4">
                    {FAQS.map(({ question, answer }) => (
                        <details key={question} className="group rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none font-bold text-sm text-white hover:text-violet-400 transition-colors">
                                {question}
                                <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform flex-shrink-0" aria-hidden="true" />
                            </summary>
                            <p className="px-6 pb-5 text-slate-400 font-mono text-sm leading-relaxed">{answer}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-8 py-16 text-center">
                <div className="rounded-3xl border border-violet-500/20 bg-violet-500/[0.03] p-12">
                    <Zap className="w-10 h-10 text-violet-400 mx-auto mb-4" aria-hidden="true" />
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-4">¿Listo para dominar SQL?</h2>
                    <p className="text-slate-400 font-mono mb-8">Crea una cuenta y practica SQL desde el primer minuto.</p>
                    <Link to="/login?tab=register" className="inline-flex items-center gap-3 px-10 py-4 bg-violet-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all">
                        Crear cuenta gratis <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <p className="text-slate-600 font-mono text-xs mt-4">Acceso premium desde 9,99€/mes · Sin permanencia</p>
                </div>
            </section>

            <footer className="border-t border-white/5 py-8 text-center" role="contentinfo">
                <p className="text-slate-600 font-mono text-xs">© 2026 Tech4U Academy · <Link to="/privacidad" className="hover:text-slate-400 transition-colors">Privacidad</Link> · <Link to="/aviso-legal" className="hover:text-slate-400 transition-colors">Aviso legal</Link></p>
            </footer>
        </div>
    );
}
