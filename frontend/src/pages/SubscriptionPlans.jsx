import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Shield, Zap, Lock, Star, ArrowRight,
    MessageCircle, Rocket, Terminal, CheckCircle, Tag, Sparkles, Copy, Check, Gift, Flame
} from 'lucide-react';
import PricingCards from '../components/PricingCards';
import logoImg from '../assets/tech4u_logo.png';
import { useSEO } from '../hooks/useSEO';

export default function SubscriptionPlans() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const handleCopyCoupon = () => {
        navigator.clipboard.writeText('BIENVENIDOS100').then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

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

                {/* ── Launch Offer Banner ── */}
                <div className="max-w-3xl mx-auto mb-12">
                    {/* Outer glow container */}
                    <div
                        className="relative rounded-3xl overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, rgba(198,255,51,0.06) 0%, rgba(99,102,241,0.06) 50%, rgba(198,255,51,0.04) 100%)',
                            border: '1px solid rgba(198,255,51,0.2)',
                            boxShadow: '0 0 60px rgba(198,255,51,0.08), inset 0 1px 0 rgba(198,255,51,0.1)',
                        }}
                    >
                        {/* Top accent line */}
                        <div
                            className="absolute top-0 left-0 right-0 h-[2px]"
                            style={{ background: 'linear-gradient(90deg, transparent 0%, #c6ff33 30%, #a78bfa 70%, transparent 100%)' }}
                        />

                        <div className="px-8 py-8 md:px-12 md:py-10">
                            {/* Badge */}
                            <div className="flex justify-center mb-5">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon/15 border border-neon/30">
                                    <Flame className="w-3.5 h-3.5 text-neon" />
                                    <span className="text-neon font-mono text-[10px] uppercase tracking-[0.25em] font-black">Oferta de Lanzamiento · Plazas Limitadas</span>
                                </div>
                            </div>

                            {/* Main text */}
                            <div className="text-center mb-6">
                                <h2 className="text-white font-black font-mono text-2xl md:text-3xl uppercase tracking-tight mb-2">
                                    Para los{' '}
                                    <span
                                        className="text-transparent bg-clip-text"
                                        style={{ backgroundImage: 'linear-gradient(90deg, #c6ff33, #a78bfa)' }}
                                    >
                                        100 primeros alumnos
                                    </span>
                                </h2>
                                <p className="text-slate-400 font-mono text-sm">
                                    Únete ahora y consigue un{' '}
                                    <span className="text-neon font-black text-lg">15% de descuento</span>
                                    {' '}en cualquier plan.
                                </p>
                            </div>

                            {/* Coupon box */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                                <div
                                    className="flex items-center gap-3 px-6 py-3.5 rounded-2xl"
                                    style={{
                                        background: 'rgba(198,255,51,0.04)',
                                        border: '1.5px dashed rgba(198,255,51,0.4)',
                                    }}
                                >
                                    <Gift className="w-5 h-5 text-neon/70 flex-shrink-0" />
                                    <span
                                        className="font-mono font-black tracking-[0.3em] text-xl"
                                        style={{ color: '#c6ff33', textShadow: '0 0 20px rgba(198,255,51,0.4)' }}
                                    >
                                        BIENVENIDOS100
                                    </span>
                                </div>
                                <button
                                    onClick={handleCopyCoupon}
                                    className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-mono font-bold text-sm transition-all"
                                    style={{
                                        background: copied ? 'rgba(198,255,51,0.15)' : 'rgba(198,255,51,0.08)',
                                        border: copied ? '1px solid rgba(198,255,51,0.5)' : '1px solid rgba(198,255,51,0.2)',
                                        color: copied ? '#c6ff33' : 'rgba(198,255,51,0.7)',
                                    }}
                                >
                                    {copied
                                        ? <><Check className="w-4 h-4" /> ¡Copiado!</>
                                        : <><Copy className="w-4 h-4" /> Copiar cupón</>
                                    }
                                </button>
                            </div>

                            {/* How to use */}
                            <p className="text-center text-slate-500 font-mono text-[11px]">
                                Introduce el cupón al elegir tu plan · El descuento se aplica de forma inmediata
                            </p>
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
                                <span className="text-lg">🤝</span> ¿Ya tienes cuenta? Invita a <strong className="text-neon">10 amigos</strong> y consigue <strong className="text-neon">1 mes gratis</strong>
                            </span>
                            <Link
                                to="/mi-referral"
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
