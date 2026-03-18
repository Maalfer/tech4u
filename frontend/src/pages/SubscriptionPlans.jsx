import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Shield, Zap, Lock, Star, ArrowRight,
    MessageCircle, Rocket, Terminal, CheckCircle, Users, TrendingUp
} from 'lucide-react';
import PricingCards from '../components/PricingCards';
import logoImg from '../assets/tech4u_logo.png';
import { useSEO } from '../hooks/useSEO';

export default function SubscriptionPlans() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Testimonials for social proof
    const testimonials = [
        { text: 'Suspendía Redes todos los exámenes. Dos semanas con Tech4U y saqué un 8.', author: 'Carlos M.', role: 'ASIR 2024' },
        { text: 'Los labs de SQL son brutales. El dataset del Hospital me lo sé de memoria.', author: 'Lucía P.', role: 'DAM' },
        { text: 'Nunca entendí las ACLs de Cisco hasta que las practiqué aquí.', author: 'Álvaro R.', role: 'ASIR' },
    ];

    useSEO({
        title: 'Planes y Suscripciones',
        description: 'Elige tu plan Tech4U Academy. Accede a todos los laboratorios de ASIR, Terminal Skills, SQL Skills y más. Desde 9,99€/mes sin permanencia.',
        path: '/planes',
    });

    const handleSelectPlan = () => {
        navigate(user ? '/suscripcion' : '/login');
    };

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex flex-col relative overflow-hidden">

            {/* ── Background ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[#0D0D0D]" />
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{ backgroundImage: 'radial-gradient(rgba(198,255,51,0.8) 1px, transparent 1px)', backgroundSize: '44px 44px' }}
                />
                <div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] rounded-full blur-[160px]" style={{ background: 'radial-gradient(ellipse, rgba(198,255,51,0.04) 0%, transparent 70%)' }} />
                <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 left-[25%] w-[600px] h-[400px] rounded-full blur-[200px]" style={{ background: 'radial-gradient(ellipse, rgba(56,189,248,0.04) 0%, transparent 70%)' }} />
            </div>

            {/* ── Navbar ── */}
            <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-md bg-[#0D0D0D]/80">
                <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
                    <img src={logoImg} alt="Tech4U" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(198,255,51,0.5)] group-hover:drop-shadow-[0_0_14px_rgba(198,255,51,0.7)] transition-all" />
                    <span className="text-xl font-black text-neon font-mono tracking-wider">Tech4U</span>
                </div>
                <button
                    onClick={() => navigate(user ? '/dashboard' : '/login')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white font-mono text-sm transition-colors"
                >
                    {user ? 'Ir al Dashboard' : 'Iniciar Sesión'} <ArrowRight className="w-4 h-4" />
                </button>
            </header>

            <main className="flex-1 relative z-10 px-6 py-16 overflow-y-auto">

                {/* ── Hero ── */}
                <div className="text-center mb-14 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 border border-neon/25 mb-6">
                        <Rocket className="w-4 h-4 text-neon" />
                        <span className="text-neon font-mono text-[11px] uppercase tracking-[0.2em] font-black">Tech Premium</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tight leading-none mb-5">
                        Impulsa tu carrera<br />
                        <span
                            className="text-transparent bg-clip-text"
                            style={{ backgroundImage: 'linear-gradient(90deg, #c6ff33 0%, #60a5fa 50%, #a78bfa 100%)' }}
                        >
                            Sin Límites
                        </span>
                    </h1>
                    <p className="text-slate-400 font-mono text-sm md:text-base leading-relaxed">
                        Elige el plan que mejor se adapte a tu ritmo. Todos incluyen acceso completo al contenido base —<br />
                        los planes superiores desbloquean la <span className="text-neon font-bold">Terminal interactiva</span> y acceso anticipado a todo lo nuevo.
                    </p>
                </div>

                {/* ── What's locked notice ── */}
                <div className="max-w-2xl mx-auto mb-10">
                    <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border border-neon/15 bg-neon/[0.04]">
                        <Terminal className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                        <p className="text-slate-400 font-mono text-xs leading-relaxed">
                            <span className="text-white font-bold">Terminal Skills</span> (entornos Linux interactivos) requiere plan
                            <span className="text-neon font-bold mx-1">Trimestral</span> o superior.
                            Los suscriptores mensuales pueden ver los contenidos pero no practicar en la terminal.
                        </p>
                    </div>
                </div>

                {/* ── Social proof with testimonials ── */}
                <div className="max-w-5xl mx-auto mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {testimonials.map((testimonial, idx) => (
                            <div key={idx} className="px-5 py-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-neon/20 hover:bg-white/[0.035] transition-all">
                                <p className="text-slate-300 font-mono text-xs leading-relaxed mb-3">"{testimonial.text}"</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-bold text-xs">{testimonial.author}</p>
                                        <p className="text-slate-500 text-[10px]">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.07]">
                            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                            <span className="text-[11px] font-mono text-slate-300">
                                <strong className="text-white">+18</strong> nuevos este mes
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-[11px] font-mono text-amber-300">
                                <strong>4.9/5</strong> valoración media de los alumnos
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Pricing grid ── */}
                <div className="max-w-5xl mx-auto mb-16 pt-6">
                    <PricingCards onSelectPlan={handleSelectPlan} />
                </div>

                {/* ── Trust strip ── */}
                <div className="max-w-3xl mx-auto border-t border-white/5 pt-10 pb-6">
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        {[
                            { icon: Lock, title: 'Pago 100% Seguro', desc: 'Procesado por Stripe' },
                            { icon: Shield, title: 'Sin Permanencia', desc: 'Cancela cuando quieras' },
                            { icon: Zap, title: 'Acceso Inmediato', desc: 'Se activa al instante tras el pago' },
                            { icon: CheckCircle, title: 'Sin sorpresas', desc: 'Todo incluido en el precio' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex flex-col items-center text-center max-w-[150px] gap-2">
                                <div className="p-2.5 rounded-xl bg-neon/5 border border-neon/10">
                                    <Icon className="w-4 h-4 text-neon/70" />
                                </div>
                                <div>
                                    <p className="text-white font-bold font-mono text-xs mb-0.5">{title}</p>
                                    <p className="text-slate-600 text-[10px] font-mono">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Referral CTA Banner ── */}
                    <div className="mt-12 mb-8 max-w-3xl mx-auto">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-2xl bg-neon/8 border border-neon/25">
                            <span className="text-slate-300 font-mono text-sm">
                                <span className="text-lg">🎁</span> ¿Ya tienes cuenta? Comparte tu enlace de referido y consigue <strong className="text-neon">1 mes gratis</strong>
                            </span>
                            <Link
                                to="/referral"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon text-black font-bold font-mono text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(198,255,51,0.4)] transition-all whitespace-nowrap"
                            >
                                Ver mi enlace <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 text-center flex flex-col items-center gap-5">
                        <button
                            onClick={() => navigate('/para-centros')}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white font-mono text-sm transition-all hover:border-neon/20 hover:bg-neon/[0.03]"
                        >
                            <Star className="w-4 h-4 text-neon" />
                            ¿Sois un grupo o instituto? <strong className="text-neon mx-1">Planes para centros educativos →</strong>
                        </button>
                        <a
                            href="mailto:info@tech4uacademy.es?subject=Consulta%20Grupo%20Academia"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-neon text-black font-black uppercase tracking-widest text-xs rounded-xl hover:shadow-[0_0_30px_rgba(198,255,51,0.4)] transition-all"
                        >
                            <MessageCircle className="w-4 h-4" /> Contactar con Soporte
                        </a>
                    </div>
                </div>

            </main>
        </div>
    );
}
