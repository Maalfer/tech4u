import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Users, Shield, Zap, BookOpen, Terminal, BarChart3,
    CheckCircle, ArrowRight, Mail, Star, Crown,
    GraduationCap, Trophy, Network, Database, Monitor, Code2,
    ChevronRight, Lock
} from 'lucide-react';
import logoImg from '../assets/tech4u_logo.png';
import { useSEO } from '../hooks/useSEO';

// ─── Institutional plan data ───────────────────────────────────────────────────
const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        licenses: 15,
        monthly: '24,99',
        annual: '249,90',
        annualId: 'starter_annual',
        savings: '2 meses gratis',
        color: 'sky',
        accentHex: '#38bdf8',
        accentBorder: 'border-sky-500/30',
        accentBg: 'bg-sky-500/8',
        accentText: 'text-sky-400',
        highlight: false,
        badge: null,
    },
    {
        id: 'clase',
        name: 'Clase',
        licenses: 30,
        monthly: '39,99',
        annual: '399,90',
        annualId: 'clase_annual',
        savings: '2 meses gratis',
        color: 'neon',
        accentHex: '#c6ff33',
        accentBorder: 'border-neon/40',
        accentBg: 'bg-neon/8',
        accentText: 'text-neon',
        highlight: true,
        badge: 'Más popular',
    },
    {
        id: 'centro',
        name: 'Centro',
        licenses: 60,
        monthly: '59,99',
        annual: '599,90',
        annualId: 'centro_annual',
        savings: '2 meses gratis',
        color: 'violet',
        accentHex: '#8b5cf6',
        accentBorder: 'border-violet-500/30',
        accentBg: 'bg-violet-500/8',
        accentText: 'text-violet-400',
        highlight: false,
        badge: null,
    },
    {
        id: 'campus',
        name: 'Campus',
        licenses: 100,
        monthly: '89,99',
        annual: '899,90',
        annualId: 'campus_annual',
        savings: '2 meses gratis',
        color: 'amber',
        accentHex: '#f59e0b',
        accentBorder: 'border-amber-500/30',
        accentBg: 'bg-amber-500/8',
        accentText: 'text-amber-400',
        highlight: false,
        badge: 'Máximo ahorro',
    },
];

// ─── Feature list ─────────────────────────────────────────────────────────────
const FEATURES = [
    { icon: Terminal,    label: 'Terminal Skills Linux',          desc: 'Laboratorios reales de Bash, LVM, permisos y scripting' },
    { icon: Database,    label: 'SQL Skills interactivo',         desc: 'Motor SQL en vivo con feedback inmediato por ejercicio' },
    { icon: Network,     label: 'NetLabs Troubleshooting',        desc: '36 escenarios de redes reales con topologías Cisco' },
    { icon: BookOpen,    label: 'Teoría y apuntes PDF',           desc: 'Guías estructuradas por asignatura y módulo ASIR/SMR' },
    { icon: Code2,       label: 'Ciberseguridad & Hacking',       desc: 'Módulos CTF, vulnerabilidades y hardening' },
    { icon: BarChart3,   label: 'Panel docente con analíticas',   desc: 'Ve el progreso, XP y fallos de cada alumno en tiempo real' },
    { icon: Users,       label: 'Grupos y licencias gestionadas', desc: 'Asigna, activa y desactiva plazas desde el panel admin' },
    { icon: Trophy,      label: 'Gamificación y ranking',         desc: 'Sistema de XP, niveles y leaderboard para motivar a tus alumnos' },
];

// ─── Testimonial ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
    {
        text: "Los alumnos llevan las prácticas de Linux con mucho más soltura desde que usamos Tech4U. El tiempo de corrección también ha bajado un 60%.",
        name: "Carlos M.", role: "Profesor de ASIR · IES Valencia",
        stars: 5,
    },
    {
        text: "El panel docente me permite ver en segundos qué alumnos están atascados antes de que lleguen a la evaluación. Imprescindible.",
        name: "Laura G.", role: "Docente SMR · Ciclo Formativo Málaga",
        stars: 5,
    },
    {
        text: "Con el sistema de XP y retos diarios, la asistencia en las prácticas ha subido notablemente. Los alumnos compiten entre sí por el top del ranking.",
        name: "Andrés P.", role: "Coordinador FP Informática · Madrid",
        stars: 5,
    },
];

function TestimonialCard({ t }) {
    return (
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-7 flex flex-col gap-4">
            <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
            </div>
            <p className="text-slate-300 font-mono text-sm leading-relaxed flex-1">"{t.text}"</p>
            <div>
                <p className="font-black text-white text-sm">{t.name}</p>
                <p className="text-[11px] font-mono text-slate-500">{t.role}</p>
            </div>
        </div>
    );
}

export default function ParaCentros() {
    const navigate = useNavigate();
    const { user }  = useAuth();

    useSEO({
        title: 'Tech4U para Centros Educativos — Planes de grupo ASIR',
        description: 'Planes institucionales Tech4U para IES e institutos de FP. Licencias grupales, panel docente con analíticas, labs de Linux, SQL y redes para tus alumnos de ASIR y SMR.',
        path: '/para-centros',
    });

    const handleSelectPlan = (planId) => {
        if (user) {
            navigate(`/suscripcion?plan=${planId}`);
        } else {
            navigate(`/login?next=/suscripcion?plan=${planId}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex flex-col relative overflow-hidden">

            {/* ── Background ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[#0D0D0D]" />
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(rgba(99,102,241,0.8) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
                <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full blur-[180px]"
                    style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 left-[20%] w-[600px] h-[400px] rounded-full blur-[200px]"
                    style={{ background: 'radial-gradient(ellipse, rgba(198,255,51,0.04) 0%, transparent 70%)' }} />
            </div>

            {/* ── Navbar ── */}
            <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-md bg-[#0D0D0D]/80">
                <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
                    <img src={logoImg} alt="Tech4U" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(198,255,51,0.5)] group-hover:drop-shadow-[0_0_14px_rgba(198,255,51,0.7)] transition-all" />
                    <span className="text-xl font-black text-neon font-mono tracking-wider">Tech4U</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/planes')}
                        className="text-slate-400 hover:text-white font-mono text-sm transition-colors"
                    >
                        Planes individuales
                    </button>
                    <button
                        onClick={() => navigate(user ? '/dashboard' : '/login')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon text-black font-black text-xs uppercase tracking-wider hover:bg-neon/90 transition-all"
                    >
                        {user ? 'Ir al Dashboard' : 'Iniciar Sesión'} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 relative z-10 overflow-y-auto">

                {/* ── Hero ── */}
                <section className="px-6 py-20 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/25 mb-6">
                        <GraduationCap className="w-4 h-4 text-violet-400" />
                        <span className="text-violet-400 font-mono text-[11px] uppercase tracking-[0.2em] font-black">Para Centros Educativos</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tight leading-none mb-6">
                        La plataforma que tus<br />
                        <span className="text-transparent bg-clip-text"
                            style={{ backgroundImage: 'linear-gradient(90deg, #c6ff33 0%, #818cf8 50%, #a78bfa 100%)' }}>
                            alumnos de ASIR necesitan
                        </span>
                    </h1>
                    <p className="text-slate-400 font-mono text-base leading-relaxed max-w-2xl mx-auto mb-8">
                        Labs interactivos de Linux, SQL y redes. Panel docente con analíticas por alumno. Sistema de gamificación que engancha.
                        Todo en una sola plataforma diseñada para la FP de informática.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <a
                            href="mailto:info@tech4u.academy?subject=Consulta%20Planes%20Centros"
                            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-neon text-black font-black uppercase tracking-wider text-sm hover:shadow-[0_0_30px_rgba(198,255,51,0.4)] transition-all"
                        >
                            <Mail className="w-4 h-4" />
                            Solicitar demo gratuita
                        </a>
                        <button
                            onClick={() => document.getElementById('planes').scrollIntoView({ behavior: 'smooth' })}
                            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-white/15 text-white font-black uppercase tracking-wider text-sm hover:border-white/30 hover:bg-white/5 transition-all"
                        >
                            Ver precios <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                {/* ── Trust bar ── */}
                <section className="px-6 py-6 max-w-5xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-6 px-8 py-5 rounded-3xl border border-white/[0.06] bg-white/[0.02]">
                        {[
                            { value: '+850',  label: 'alumnos activos' },
                            { value: '+120',  label: 'nuevos este mes' },
                            { value: '4.9★',  label: 'valoración media' },
                            { value: '36+',   label: 'labs de redes' },
                            { value: '200+',  label: 'ejercicios SQL' },
                            { value: '500+',  label: 'preguntas de test' },
                        ].map(({ value, label }) => (
                            <div key={label} className="text-center px-4">
                                <div className="text-2xl font-black text-neon font-mono">{value}</div>
                                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Features grid ── */}
                <section className="px-6 py-16 max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-3">
                            Todo lo que necesitas para dar clase
                        </h2>
                        <p className="text-slate-500 font-mono text-sm">Módulos activos para tu grupo con un clic desde el panel docente.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {FEATURES.map(feat => {
                            const Icon = feat.icon;
                            return (
                                <div key={feat.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col gap-3 hover:border-neon/20 hover:bg-neon/[0.02] transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-neon" />
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-sm mb-1">{feat.label}</p>
                                        <p className="text-[11px] font-mono text-slate-500 leading-relaxed">{feat.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Plans ── */}
                <section id="planes" className="px-6 py-16 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-3">
                            Planes para centros
                        </h2>
                        <p className="text-slate-500 font-mono text-sm">Sin permanencia. Cancela cuando quieras. Todas las licencias se gestionan desde tu panel docente.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {PLANS.map(plan => (
                            <div key={plan.id} className={`relative rounded-3xl border p-6 flex flex-col gap-4 transition-all hover:-translate-y-1 ${
                                plan.highlight
                                    ? `border-neon/40 bg-gradient-to-br from-[#081408] to-[#060a06] shadow-[0_0_40px_rgba(198,255,51,0.08)]`
                                    : `${plan.accentBorder} bg-[#0c0c0f]`
                            }`}>
                                {plan.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            plan.highlight
                                                ? 'bg-neon text-black border-neon shadow-[0_0_16px_rgba(198,255,51,0.5)]'
                                                : `${plan.accentBg} ${plan.accentText} ${plan.accentBorder}`
                                        }`}>
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}

                                {/* Header */}
                                <div>
                                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] font-mono ${plan.accentText} mb-1`}>
                                        {plan.licenses} licencias
                                    </p>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{plan.name}</h3>
                                </div>

                                {/* Price */}
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-3xl font-black font-mono ${plan.accentText}`}>{plan.monthly}€</span>
                                        <span className="text-slate-500 font-mono text-xs">/mes</span>
                                    </div>
                                    <p className="text-[10px] font-mono text-slate-600 mt-0.5">
                                        O <strong className="text-slate-400">{plan.annual}€/año</strong> · {plan.savings}
                                    </p>
                                </div>

                                {/* Per-student cost */}
                                <div className={`px-3 py-2 rounded-xl border text-center ${plan.accentBg} ${plan.accentBorder}`}>
                                    <p className={`text-[11px] font-mono font-black ${plan.accentText}`}>
                                        ≈ {(parseFloat(plan.monthly.replace(',','.')) / plan.licenses).toFixed(2).replace('.',',')}€ / alumno / mes
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="space-y-2 flex-1">
                                    {[
                                        'Panel docente completo',
                                        'Todos los módulos activables',
                                        'Analíticas por alumno',
                                        'Gestión de grupos y licencias',
                                        'Soporte prioritario por email',
                                    ].map(f => (
                                        <div key={f} className="flex items-center gap-2">
                                            <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${plan.accentText}`} />
                                            <span className="text-[11px] font-mono text-slate-400">{f}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className={`w-full py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                                        plan.highlight
                                            ? 'bg-neon text-black hover:shadow-[0_0_24px_rgba(198,255,51,0.4)]'
                                            : `${plan.accentBg} ${plan.accentText} ${plan.accentBorder} border hover:${plan.accentBg}`
                                    }`}
                                >
                                    Empezar con {plan.name}
                                </button>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-[11px] font-mono text-slate-600 mt-6">
                        ¿Necesitas más de 100 licencias o un acuerdo personalizado?{' '}
                        <a href="mailto:info@tech4u.academy?subject=Acuerdo%20Personalizado" className="text-neon hover:underline">Contáctanos →</a>
                    </p>
                </section>

                {/* ── Testimonials ── */}
                <section className="px-6 py-16 max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-10 text-center">
                        Lo que dicen los docentes
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map(t => (
                            <TestimonialCard key={t.name} t={t} />
                        ))}
                    </div>
                </section>

                {/* ── Bottom CTA ── */}
                <section className="px-6 py-20 text-center">
                    <div className="max-w-2xl mx-auto p-10 rounded-3xl border border-neon/20 bg-neon/[0.03]">
                        <GraduationCap className="w-12 h-12 text-neon mx-auto mb-4" />
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-3">
                            ¿Listo para modernizar tus clases?
                        </h2>
                        <p className="text-slate-400 font-mono text-sm leading-relaxed mb-8">
                            Escríbenos y te preparamos una demo personalizada para tu centro en menos de 24 horas. Sin compromisos.
                        </p>
                        <a
                            href="mailto:info@tech4u.academy?subject=Demo%20Tech4U%20Para%20Centros"
                            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-neon text-black font-black uppercase tracking-widest text-sm hover:shadow-[0_0_40px_rgba(198,255,51,0.4)] transition-all"
                        >
                            <Mail className="w-5 h-5" />
                            Solicitar demo gratuita
                        </a>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/5 px-8 py-8 flex items-center justify-between max-w-6xl mx-auto">
                    <span className="text-[11px] font-mono text-slate-600">© {new Date().getFullYear()} Tech4U Academy · info@tech4u.academy</span>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/privacidad')} className="text-[10px] font-mono text-slate-700 hover:text-slate-400 transition-colors">Privacidad</button>
                        <button onClick={() => navigate('/terminos')} className="text-[10px] font-mono text-slate-700 hover:text-slate-400 transition-colors">Términos</button>
                        <button onClick={() => navigate('/planes')} className="text-[10px] font-mono text-slate-700 hover:text-slate-400 transition-colors">Planes individuales</button>
                    </div>
                </footer>

            </main>
        </div>
    );
}
