/**
 * SEO Landing Page: /linux-terminal-exercises
 * Target keywords: "ejercicios terminal linux", "comandos linux práctica", "linux ASIR ejercicios"
 */
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, CheckCircle, BookOpen, ArrowRight, ChevronRight, Zap } from 'lucide-react';
import { useSEO, schemaFAQ, schemaBreadcrumb, schemaOrganization } from '../hooks/useSEO';
import logoImg from '../assets/tech4u_logo.png';

const FAQS = [
    {
        question: '¿Qué aprendo en los ejercicios de Terminal Linux de Tech4U?',
        answer: 'Aprenderás comandos esenciales de Linux: gestión de usuarios, permisos, procesos, redes y scripting bash. Todo en un entorno interactivo sin necesidad de instalar nada.',
    },
    {
        question: '¿Para qué ciclo formativo son los ejercicios de Linux?',
        answer: 'Los laboratorios de Terminal Linux están diseñados para estudiantes de ASIR (Administración de Sistemas Informáticos en Red) y SMR (Sistemas Microinformáticos y Redes).',
    },
    {
        question: '¿Necesito instalar Linux para practicar?',
        answer: 'No. Tech4U ofrece un entorno de terminal interactivo directamente en el navegador. Puedes practicar desde cualquier dispositivo sin configurar nada.',
    },
    {
        question: '¿Cuántos ejercicios de Linux hay disponibles?',
        answer: 'Hay más de 50 laboratorios interactivos de Linux organizados por nivel, desde comandos básicos hasta configuración de servidores y servicios de red.',
    },
    {
        question: '¿Qué suscripción necesito para acceder a los labs de Linux?',
        answer: 'El acceso completo a los labs de Terminal Linux requiere el plan Trimestral o Anual. Puedes ver la primera lección de teoría de Linux de forma gratuita.',
    },
];

const TOPICS = [
    { icon: '📁', label: 'Gestión de ficheros y directorios' },
    { icon: '👤', label: 'Usuarios y grupos (chmod, chown)' },
    { icon: '🔧', label: 'Procesos y servicios (systemd)' },
    { icon: '🌐', label: 'Redes y configuración de interfaces' },
    { icon: '📜', label: 'Scripts Bash y automatización' },
    { icon: '🔒', label: 'SSH, firewall y seguridad básica' },
];

export default function SEOLinuxPage() {
    const navigate = useNavigate();

    useSEO({
        title: 'Ejercicios de Terminal Linux — Práctica Interactiva ASIR',
        description: 'Practica comandos Linux con ejercicios interactivos diseñados para ASIR y SMR. Permisos, usuarios, redes, scripts bash. Sin instalar nada.',
        keywords: 'ejercicios terminal linux, comandos linux ASIR, práctica linux navegador, permisos linux, bash scripting',
        path: '/linux-terminal-exercises',
        schemas: [
            schemaOrganization(),
            schemaFAQ(FAQS),
            schemaBreadcrumb([
                { name: 'Inicio', url: '/' },
                { name: 'Ejercicios Terminal Linux', url: '/linux-terminal-exercises' },
            ]),
        ],
    });

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden">

            {/* ── Navbar ── */}
            <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#0D0D0D]/90 backdrop-blur-xl">
                <button onClick={() => navigate('/')} aria-label="Ir a inicio">
                    <img src={logoImg} alt="Tech4U Academy" className="h-8 w-auto" />
                </button>
                <nav aria-label="Navegación principal" className="flex items-center gap-6">
                    <Link to="/teoria/redes" className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Teoría</Link>
                    <Link to="/planes" className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Planes</Link>
                    <Link to="/login" className="px-5 py-2 bg-neon text-black text-[11px] font-black uppercase tracking-widest rounded-full hover:shadow-[0_0_20px_rgba(0,255,100,0.4)] transition-all">
                        Empezar gratis
                    </Link>
                </nav>
            </header>

            {/* ── Hero ── */}
            <section className="max-w-5xl mx-auto px-8 pt-24 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 border border-neon/30 mb-8">
                    <Terminal className="w-4 h-4 text-neon" aria-hidden="true" />
                    <span className="text-neon font-mono text-xs uppercase tracking-widest font-bold">Terminal Skills</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9] mb-6">
                    Ejercicios de<br />
                    <span className="text-neon">Terminal Linux</span>
                </h1>

                <p className="text-lg text-slate-400 font-mono max-w-2xl mx-auto leading-relaxed mb-4">
                    Practica comandos Linux con laboratorios interactivos en el navegador.
                    Diseñado para estudiantes de <strong className="text-white">ASIR</strong> y <strong className="text-white">SMR</strong>.
                    Sin instalar nada.
                </p>
                <p className="text-sm text-slate-500 font-mono mb-10">Actualizado: 15 de enero de 2025 · 8 min de lectura</p>

                <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                        to="/login?tab=register"
                        className="px-10 py-4 bg-neon text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:shadow-[0_0_30px_rgba(0,255,100,0.4)] transition-all"
                    >
                        Empezar gratis <ArrowRight className="inline w-4 h-4 ml-2" aria-hidden="true" />
                    </Link>
                    <Link
                        to="/teoria/sistemas-operativos"
                        className="px-10 py-4 border border-white/10 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-white/5 transition-all"
                    >
                        Ver teoría Linux
                    </Link>
                </div>
            </section>

            {/* ── Topics ── */}
            <section className="max-w-5xl mx-auto px-8 py-16" aria-labelledby="topics-heading">
                <h2 id="topics-heading" className="text-3xl font-black uppercase italic tracking-tighter text-white mb-10 text-center">
                    ¿Qué practicarás?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TOPICS.map(({ icon, label }) => (
                        <div key={label} className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-neon/20 transition-all">
                            <span className="text-2xl" aria-hidden="true">{icon}</span>
                            <span className="text-sm font-medium text-slate-300">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Internal links: related content ── */}
            <section className="max-w-5xl mx-auto px-8 py-12 border-t border-white/5" aria-labelledby="related-heading">
                <h2 id="related-heading" className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">
                    Contenido relacionado
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Teoría de Sistemas Operativos', href: '/teoria/sistemas-operativos', desc: 'Fundamentos teóricos de Linux y SO.' },
                        { label: 'Laboratorios ASIR', href: '/login', desc: 'Más de 50 labs prácticos.' },
                        { label: 'Redes Informáticas', href: '/redes-informaticas', desc: 'Configura redes en entornos reales.' },
                    ].map(({ label, href, desc }) => (
                        <Link key={label} to={href} className="group block p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-neon/20 hover:bg-white/[0.04] transition-all no-underline">
                            <p className="font-bold text-white text-sm mb-1 group-hover:text-neon transition-colors">{label}</p>
                            <p className="text-slate-500 text-xs font-mono">{desc}</p>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-neon mt-2 transition-colors" aria-hidden="true" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="max-w-3xl mx-auto px-8 py-16" aria-labelledby="faq-heading">
                <h2 id="faq-heading" className="text-3xl font-black uppercase italic tracking-tighter text-white mb-10 text-center">
                    Preguntas frecuentes
                </h2>
                <div className="space-y-4">
                    {FAQS.map(({ question, answer }) => (
                        <details key={question} className="group rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none font-bold text-sm text-white hover:text-neon transition-colors">
                                {question}
                                <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform flex-shrink-0" aria-hidden="true" />
                            </summary>
                            <p className="px-6 pb-5 text-slate-400 font-mono text-sm leading-relaxed">{answer}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="max-w-4xl mx-auto px-8 py-16 text-center">
                <div className="rounded-3xl border border-neon/20 bg-neon/[0.03] p-12">
                    <Zap className="w-10 h-10 text-neon mx-auto mb-4" aria-hidden="true" />
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-4">
                        ¿Listo para practicar Linux?
                    </h2>
                    <p className="text-slate-400 font-mono mb-8">Crea una cuenta gratuita y accede a la primera lección de cada asignatura.</p>
                    <Link
                        to="/login?tab=register"
                        className="inline-flex items-center gap-3 px-10 py-4 bg-neon text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:shadow-[0_0_30px_rgba(0,255,100,0.4)] transition-all"
                    >
                        Crear cuenta gratis <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <p className="text-slate-600 font-mono text-xs mt-4">Acceso premium desde 9,99€/mes · Sin permanencia</p>
                </div>
            </section>

            {/* ── Internal Links ── */}
            <section className="max-w-5xl mx-auto px-8 py-16 border-t border-white/5" aria-labelledby="also-interested">
                <h2 id="also-interested" className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">
                    También te puede interesar
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Práctica SQL Interactiva', href: '/sql-practice', desc: 'Ejercicios SQL en el navegador.' },
                        { label: 'Labs de Ciberseguridad', href: '/ciberseguridad-labs', desc: 'Pentesting y análisis de seguridad.' },
                        { label: 'Redes Informáticas', href: '/redes-informaticas', desc: 'VLANs, routing y ACLs práctica.' },
                    ].map(({ label, href, desc }) => (
                        <Link key={label} to={href} className="group block p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-neon/20 hover:bg-white/[0.04] transition-all no-underline">
                            <p className="font-bold text-white text-sm mb-1 group-hover:text-neon transition-colors">{label}</p>
                            <p className="text-slate-500 text-xs font-mono">{desc}</p>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-neon mt-2 transition-colors" aria-hidden="true" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Footer minimal ── */}
            <footer className="border-t border-white/5 py-8 text-center" role="contentinfo">
                <p className="text-slate-600 font-mono text-xs">© 2026 Tech4U Academy · <Link to="/privacidad" className="hover:text-slate-400 transition-colors">Privacidad</Link> · <Link to="/aviso-legal" className="hover:text-slate-400 transition-colors">Aviso legal</Link></p>
            </footer>
        </div>
    );
}
