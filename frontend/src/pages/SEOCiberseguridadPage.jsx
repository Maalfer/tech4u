/**
 * SEO Landing Page: /ciberseguridad-labs
 * Target keywords: "ciberseguridad práctica ASIR", "laboratorios ciberseguridad", "hacking ético FP"
 */
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, ChevronRight, Zap } from 'lucide-react';
import { useSEO, schemaFAQ, schemaBreadcrumb, schemaOrganization } from '../hooks/useSEO';
import logoImg from '../assets/tech4u_logo.png';

const FAQS = [
    {
        question: '¿Qué aprendo en los labs de Ciberseguridad de Tech4U?',
        answer: 'Aprenderás fundamentos de seguridad informática: criptografía, seguridad en redes, vulnerabilidades comunes, análisis de tráfico y hardening de sistemas Linux y Windows.',
    },
    {
        question: '¿Los labs de ciberseguridad son prácticos o solo teoría?',
        answer: 'Son 100% prácticos. Cada lab plantea un escenario real donde debes aplicar técnicas de análisis, detección o protección, con corrección automática del sistema.',
    },
    {
        question: '¿Son los labs de ciberseguridad apropiados para ASIR?',
        answer: 'Sí. El temario cubre exactamente lo que se exige en la asignatura de Seguridad y Alta Disponibilidad del ciclo ASIR, además de preparación para certificaciones CompTIA.',
    },
    {
        question: '¿Necesito conocimientos previos para los labs de ciberseguridad?',
        answer: 'Se recomienda tener nociones básicas de redes y Linux. Puedes completar primero los laboratorios de Terminal Linux y Redes antes de abordar los de ciberseguridad.',
    },
];

const TOPICS = [
    { icon: '🔐', label: 'Criptografía y PKI' },
    { icon: '🌐', label: 'Firewalls y VPNs' },
    { icon: '🦠', label: 'Análisis de malware básico' },
    { icon: '📡', label: 'Sniffing y análisis de tráfico' },
    { icon: '🛡️', label: 'Hardening de servidores Linux' },
    { icon: '🔍', label: 'OSINT y reconocimiento' },
];

export default function SEOCiberseguridadPage() {
    const navigate = useNavigate();

    useSEO({
        title: 'Labs de Ciberseguridad — Práctica para ASIR y SMR',
        description: 'Laboratorios prácticos de ciberseguridad: criptografía, firewalls, análisis de tráfico, hardening. Diseñados para ASIR — Seguridad y Alta Disponibilidad.',
        keywords: 'ciberseguridad ASIR, laboratorios hacking ético, seguridad informática práctica, firewall linux, criptografía ejercicios',
        path: '/ciberseguridad-labs',
        schemas: [
            schemaOrganization(),
            schemaFAQ(FAQS),
            schemaBreadcrumb([
                { name: 'Inicio', url: '/' },
                { name: 'Labs de Ciberseguridad', url: '/ciberseguridad-labs' },
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
                    <Link to="/teoria" className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Teoría</Link>
                    <Link to="/planes" className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Planes</Link>
                    <Link to="/login" className="px-5 py-2 bg-neon text-black text-[11px] font-black uppercase tracking-widest rounded-full hover:shadow-[0_0_20px_rgba(0,255,100,0.4)] transition-all">Empezar gratis</Link>
                </nav>
            </header>

            <section className="max-w-5xl mx-auto px-8 pt-24 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-8">
                    <Shield className="w-4 h-4 text-red-400" aria-hidden="true" />
                    <span className="text-red-400 font-mono text-xs uppercase tracking-widest font-bold">Ciberseguridad Labs</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9] mb-6">
                    Laboratorios de<br />
                    <span className="text-red-400">Ciberseguridad</span>
                </h1>
                <p className="text-lg text-slate-400 font-mono max-w-2xl mx-auto leading-relaxed mb-4">
                    Practica ciberseguridad real: firewalls, criptografía, hardening y análisis de tráfico.
                    Preparación para <strong className="text-white">ASIR</strong> y certificaciones de seguridad.
                </p>
                <p className="text-sm text-slate-500 font-mono mb-10">Actualizado: 15 de enero de 2025 · 8 min de lectura</p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link to="/login?tab=register" className="px-10 py-4 bg-red-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all">
                        Empezar gratis <ArrowRight className="inline w-4 h-4 ml-2" aria-hidden="true" />
                    </Link>
                    <Link to="/redes-informaticas" className="px-10 py-4 border border-white/10 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-white/5 transition-all">
                        Ver labs de Redes
                    </Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-8 py-16" aria-labelledby="cibersec-topics-heading">
                <h2 id="cibersec-topics-heading" className="text-3xl font-black uppercase italic tracking-tighter text-white mb-10 text-center">Áreas de práctica</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TOPICS.map(({ icon, label }) => (
                        <div key={label} className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-red-500/20 transition-all">
                            <span className="text-2xl" aria-hidden="true">{icon}</span>
                            <span className="text-sm font-medium text-slate-300">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-8 py-12 border-t border-white/5" aria-labelledby="cibersec-related-heading">
                <h2 id="cibersec-related-heading" className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">Contenido relacionado</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Redes Informáticas', href: '/redes-informaticas', desc: 'Protocolos, VLANs y ACLs.' },
                        { label: 'Terminal Linux', href: '/linux-terminal-exercises', desc: 'Base para administración segura.' },
                        { label: 'Teoría de Seguridad', href: '/teoria', desc: 'Fundamentos teóricos ASIR.' },
                    ].map(({ label, href, desc }) => (
                        <Link key={label} to={href} className="group block p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-500/20 hover:bg-white/[0.04] transition-all no-underline">
                            <p className="font-bold text-white text-sm mb-1 group-hover:text-red-400 transition-colors">{label}</p>
                            <p className="text-slate-500 text-xs font-mono">{desc}</p>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-red-400 mt-2 transition-colors" aria-hidden="true" />
                        </Link>
                    ))}
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-8 py-16" aria-labelledby="cibersec-faq-heading">
                <h2 id="cibersec-faq-heading" className="text-3xl font-black uppercase italic tracking-tighter text-white mb-10 text-center">Preguntas frecuentes</h2>
                <div className="space-y-4">
                    {FAQS.map(({ question, answer }) => (
                        <details key={question} className="group rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none font-bold text-sm text-white hover:text-red-400 transition-colors">
                                {question}
                                <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform flex-shrink-0" aria-hidden="true" />
                            </summary>
                            <p className="px-6 pb-5 text-slate-400 font-mono text-sm leading-relaxed">{answer}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-8 py-16 text-center">
                <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.03] p-12">
                    <Zap className="w-10 h-10 text-red-400 mx-auto mb-4" aria-hidden="true" />
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-4">¿Listo para el lab?</h2>
                    <p className="text-slate-400 font-mono mb-8">Accede a los labs de ciberseguridad con tu cuenta Tech4U.</p>
                    <Link to="/login?tab=register" className="inline-flex items-center gap-3 px-10 py-4 bg-red-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all">
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
