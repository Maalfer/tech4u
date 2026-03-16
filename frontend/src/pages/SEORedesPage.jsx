/**
 * SEO Landing Page: /redes-informaticas
 * Target keywords: "redes informáticas ASIR", "VLANs configuración práctica", "TCP/IP ejercicios"
 */
import { Link, useNavigate } from 'react-router-dom';
import { Network, ArrowRight, ChevronRight, Zap } from 'lucide-react';
import { useSEO, schemaFAQ, schemaBreadcrumb, schemaOrganization } from '../hooks/useSEO';
import logoImg from '../assets/tech4u_logo.png';

const FAQS = [
    {
        question: '¿Qué aprendo sobre redes informáticas en Tech4U?',
        answer: 'Aprenderás los fundamentos del modelo OSI, TCP/IP, configuración de routers y switches, VLANs, routing estático y dinámico (RIP, OSPF), y resolución de problemas de red.',
    },
    {
        question: '¿Las prácticas de redes simulan equipos reales?',
        answer: 'Sí. Los NetLabs de Tech4U simulan entornos de red reales donde puedes configurar routers, switches, ACLs y VLANs con la misma sintaxis que en equipos físicos Cisco.',
    },
    {
        question: '¿Son los labs de redes adecuados para el examen de ASIR?',
        answer: 'Completamente. El contenido cubre el temario de Planificación y Administración de Redes de ASIR, además de ser útil para preparar la certificación CCNA de Cisco.',
    },
    {
        question: '¿Necesito saber programar para los labs de redes?',
        answer: 'No. Los labs de redes no requieren programación. Sí es útil conocer comandos básicos de Linux para la configuración de interfaces en servidores.',
    },
];

const TOPICS = [
    { icon: '🌐', label: 'Modelo OSI y TCP/IP' },
    { icon: '📡', label: 'VLANs y Spanning Tree' },
    { icon: '🛣️', label: 'Routing: RIP, OSPF, EIGRP' },
    { icon: '🔥', label: 'ACLs y segmentación de redes' },
    { icon: '🔌', label: 'DHCP, DNS y servicios de red' },
    { icon: '🔍', label: 'Diagnóstico con Wireshark' },
];

export default function SEORedesPage() {
    const navigate = useNavigate();

    useSEO({
        title: 'Redes Informáticas — Laboratorios Prácticos ASIR',
        description: 'Practica redes informáticas con simuladores: VLANs, routing, ACLs, DNS, DHCP. Diseñado para ASIR — Planificación y Administración de Redes.',
        keywords: 'redes informáticas ASIR, VLANs configuración, routing OSPF práctica, TCP/IP ejercicios, Cisco CCNA práctica',
        path: '/redes-informaticas',
        schemas: [
            schemaOrganization(),
            schemaFAQ(FAQS),
            schemaBreadcrumb([
                { name: 'Inicio', url: '/' },
                { name: 'Redes Informáticas', url: '/redes-informaticas' },
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
                    <Link to="/teoria/redes" className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Teoría Redes</Link>
                    <Link to="/planes" className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Planes</Link>
                    <Link to="/login" className="px-5 py-2 bg-neon text-black text-[11px] font-black uppercase tracking-widest rounded-full hover:shadow-[0_0_20px_rgba(0,255,100,0.4)] transition-all">Empezar gratis</Link>
                </nav>
            </header>

            <section className="max-w-5xl mx-auto px-8 pt-24 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/30 mb-8">
                    <Network className="w-4 h-4 text-sky-400" aria-hidden="true" />
                    <span className="text-sky-400 font-mono text-xs uppercase tracking-widest font-bold">NetLabs</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9] mb-6">
                    Redes<br />
                    <span className="text-sky-400">Informáticas</span>
                </h1>
                <p className="text-lg text-slate-400 font-mono max-w-2xl mx-auto leading-relaxed mb-10">
                    Laboratorios de redes interactivos: VLANs, routing, ACLs y más. Preparación completa para
                    <strong className="text-white"> ASIR</strong> y la certificación <strong className="text-white">CCNA</strong>.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link to="/login?tab=register" className="px-10 py-4 bg-sky-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all">
                        Empezar gratis <ArrowRight className="inline w-4 h-4 ml-2" aria-hidden="true" />
                    </Link>
                    <Link to="/teoria/redes" className="px-10 py-4 border border-white/10 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-white/5 transition-all">
                        Ver teoría Redes
                    </Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-8 py-16" aria-labelledby="redes-topics-heading">
                <h2 id="redes-topics-heading" className="text-3xl font-black uppercase italic tracking-tighter text-white mb-10 text-center">Temario cubierto</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TOPICS.map(({ icon, label }) => (
                        <div key={label} className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-sky-500/20 transition-all">
                            <span className="text-2xl" aria-hidden="true">{icon}</span>
                            <span className="text-sm font-medium text-slate-300">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-8 py-12 border-t border-white/5" aria-labelledby="redes-related-heading">
                <h2 id="redes-related-heading" className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">Contenido relacionado</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Teoría de Redes', href: '/teoria/redes', desc: 'OSI, TCP/IP, protocolos fundamentales.' },
                        { label: 'Ciberseguridad Labs', href: '/ciberseguridad-labs', desc: 'Firewalls, ACLs y análisis de tráfico.' },
                        { label: 'Terminal Linux', href: '/linux-terminal-exercises', desc: 'Configuración de redes en Linux.' },
                    ].map(({ label, href, desc }) => (
                        <Link key={label} to={href} className="group block p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-sky-500/20 hover:bg-white/[0.04] transition-all no-underline">
                            <p className="font-bold text-white text-sm mb-1 group-hover:text-sky-400 transition-colors">{label}</p>
                            <p className="text-slate-500 text-xs font-mono">{desc}</p>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 mt-2 transition-colors" aria-hidden="true" />
                        </Link>
                    ))}
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-8 py-16" aria-labelledby="redes-faq-heading">
                <h2 id="redes-faq-heading" className="text-3xl font-black uppercase italic tracking-tighter text-white mb-10 text-center">Preguntas frecuentes</h2>
                <div className="space-y-4">
                    {FAQS.map(({ question, answer }) => (
                        <details key={question} className="group rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none font-bold text-sm text-white hover:text-sky-400 transition-colors">
                                {question}
                                <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform flex-shrink-0" aria-hidden="true" />
                            </summary>
                            <p className="px-6 pb-5 text-slate-400 font-mono text-sm leading-relaxed">{answer}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-8 py-16 text-center">
                <div className="rounded-3xl border border-sky-500/20 bg-sky-500/[0.03] p-12">
                    <Zap className="w-10 h-10 text-sky-400 mx-auto mb-4" aria-hidden="true" />
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-4">¿Listo para configurar redes?</h2>
                    <p className="text-slate-400 font-mono mb-8">Accede a NetLabs y practica desde el primer día.</p>
                    <Link to="/login?tab=register" className="inline-flex items-center gap-3 px-10 py-4 bg-sky-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all">
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
