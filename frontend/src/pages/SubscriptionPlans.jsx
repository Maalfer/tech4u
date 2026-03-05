import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Shield, Check, Zap, BookOpen, FlaskConical,
    Star, Crown, ArrowRight, Lock, ChevronLeft,
    Sparkles, Trophy, BarChart3, Rocket
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const FEATURES = [
    { icon: FlaskConical, text: 'Acceso ilimitado al Test Center' },
    { icon: BookOpen, text: 'Todos los recursos y apuntes PDF' },
    { icon: BarChart3, text: 'Estadísticas de rendimiento avanzadas' },
    { icon: Trophy, text: 'Ranking competitivo y gamificación' },
    { icon: Sparkles, text: 'Explicaciones detalladas por pregunta' },
    { icon: Shield, text: 'Nuevas preguntas añadidas cada semana' },
];

export default function SubscriptionPlans() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSelectPlan = () => {
        if (user) {
            navigate('/suscripcion'); // Redirect logged in users to actual payment page
        } else {
            navigate('/login'); // Redirect guests to login
        }
    };

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex flex-col relative overflow-hidden">

            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,var(--neon-alpha-10)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,var(--neon-alpha-5)_0%,transparent_70%)] pointer-events-none" />

            {/* Header / Navbar simple */}
            <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-md bg-[#0D0D0D]/80">
                <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
                    <img src={logoImg} alt="Tech4U Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_var(--neon-alpha-60)] group-hover:drop-shadow-[0_0_12px_var(--neon-alpha-80)] transition-all" />
                    <span className="text-xl font-black text-neon glow-text font-mono tracking-wider">Tech4U</span>
                </div>

                <button
                    onClick={() => navigate(user ? '/dashboard' : '/login')}
                    className="text-slate-400 hover:text-white font-mono text-sm transition-colors flex items-center gap-2"
                >
                    {user ? 'Ir al Dashboard' : 'Iniciar Sesión'} <ArrowRight className="w-4 h-4" />
                </button>
            </header>

            <main className="flex-1 relative z-10 px-6 py-16 overflow-y-auto custom-scrollbar">

                {/* Hero Section */}
                <div className="text-center mb-16 relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 border border-neon/30 mb-6">
                        <Rocket className="w-4 h-4 text-neon" />
                        <span className="text-neon font-mono text-xs uppercase tracking-widest font-bold">Tech Premium</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic mb-6 leading-tight tracking-tight drop-shadow-2xl">
                        Impulsa tu carrera<br />
                        <span className="text-neon drop-shadow-[0_0_20px_var(--neon-alpha-40)]">Sin Límites</span>
                    </h1>
                    <p className="text-slate-400 font-mono text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        Únete a la élite de estudiantes de <strong className="text-white">Tech4U</strong>. Elige el plan que mejor se adapte a tu ritmo de estudio y desbloquea absolutamente todo el contenido.
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 mb-16 px-4">

                    {/* 1. Plan Mensual */}
                    <div className="relative bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col hover:border-neon/30 hover:bg-[#151515] transition-all duration-300 group mt-4 lg:mt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                                <BookOpen className="w-5 h-5 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Flexibilidad</p>
                                <h2 className="text-white font-black text-xl uppercase tracking-tight">Mensual</h2>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-black text-white font-mono">9<span className="text-3xl">,99</span></span>
                                <span className="text-slate-400 font-mono text-sm mb-2">€ / mes</span>
                            </div>
                            <p className="text-slate-500 font-mono text-xs mt-2 h-4">Pago mes a mes</p>
                        </div>

                        <div className="space-y-4 mb-8 flex-1">
                            {FEATURES.slice(0, 4).map((f) => (
                                <div key={f.text} className="flex items-start gap-3">
                                    <Check className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-300 font-mono text-xs leading-relaxed">{f.text}</span>
                                </div>
                            ))}
                            <div className="flex items-start gap-3 opacity-40">
                                <Check className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                                <span className="text-slate-400 font-mono text-xs line-through">Nuevas preguntas semanales</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSelectPlan}
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black font-mono text-sm uppercase tracking-wide hover:bg-white/10 transition-all duration-300 group-hover:border-neon/40"
                        >
                            Empezar Mensual
                        </button>
                    </div>

                    {/* 2. Plan Trimestral — DESTACADO CENTRO */}
                    <div className="relative bg-gradient-to-br from-neon/10 to-[#111] border-2 border-neon rounded-3xl p-8 flex flex-col shadow-[0_0_40px_var(--neon-alpha-20)] hover:shadow-[0_0_60px_var(--neon-alpha-30)] hover:-translate-y-2 transition-all duration-500 z-10">

                        {/* Corona Flotante Sobresaliendo */}
                        <div className="absolute -top-7 -right-5 w-14 h-14 bg-[#0D0D0D] border-2 border-neon rounded-2xl flex items-center justify-center rotate-12 shadow-[0_0_30px_var(--neon-alpha-60)] z-20 animate-pulse">
                            <Crown className="w-7 h-7 text-neon drop-shadow-[0_0_8px_var(--neon-alpha-80)]" />
                        </div>

                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full flex justify-center">
                            <span className="px-6 py-1.5 bg-neon text-[#0D0D0D] text-[11px] font-black uppercase rounded-full tracking-widest shadow-[0_0_20px_var(--neon-alpha-60)] flex items-center gap-2 border border-neon">
                                <Star className="w-3 h-3 fill-current" /> Más Popular · Mejor Equilibrio
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mb-6 mt-4">
                            <div className="p-2.5 rounded-xl bg-neon/20 border border-neon/40">
                                <Zap className="w-6 h-6 text-neon" />
                            </div>
                            <div>
                                <p className="text-[11px] font-mono text-neon uppercase tracking-widest font-bold">Recomendado</p>
                                <h2 className="text-white font-black text-2xl uppercase tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Trimestral</h2>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-end gap-2">
                                <span className="text-6xl font-black text-neon font-mono drop-shadow-[0_0_20px_var(--neon-alpha-50)]">24<span className="text-4xl">,99</span></span>
                                <span className="text-slate-400 font-mono text-sm mb-2">€ / trim.</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 h-4">
                                <span className="text-slate-500 font-mono text-xs line-through decoration-red-500/50">29,97 €</span>
                                <span className="text-neon font-mono text-sm font-bold bg-neon/10 px-2 py-0.5 rounded">≈ 8,33 €/mes</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 flex-1">
                            {FEATURES.slice(0, 5).map((f) => (
                                <div key={f.text} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-neon flex-shrink-0 drop-shadow-[0_0_8px_var(--neon-alpha-80)]" />
                                    <span className="text-white font-mono text-sm font-medium leading-relaxed">{f.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSelectPlan}
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-neon text-[#0D0D0D] font-black font-mono text-base uppercase tracking-wider shadow-[0_0_20px_var(--neon-alpha-40)] hover:shadow-[0_0_40px_var(--neon-alpha-60)] hover:scale-[1.03] transition-all duration-300"
                        >
                            Empezar Trimestral <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* 3. Plan Anual */}
                    <div className="relative bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col hover:border-neon/30 hover:bg-[#151515] transition-all duration-300 group mt-4 lg:mt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                                <Sparkles className="w-5 h-5 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Máximo Ahorro</p>
                                <h2 className="text-white font-black text-xl uppercase tracking-tight">Anual</h2>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-black text-white font-mono">79<span className="text-3xl">,99</span></span>
                                <span className="text-slate-400 font-mono text-sm mb-2">€ / año</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 h-4">
                                <span className="text-slate-500 font-mono text-xs line-through">119,88 €</span>
                                <span className="text-slate-300 font-mono text-xs font-bold">≈ 6,67 €/mes</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 flex-1">
                            {FEATURES.map((f) => (
                                <div key={f.text} className="flex items-start gap-3">
                                    <Check className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-300 font-mono text-xs leading-relaxed">{f.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSelectPlan}
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black font-mono text-sm uppercase tracking-wide hover:bg-white/10 transition-all duration-300 group-hover:border-neon/40"
                        >
                            Empezar Anual
                        </button>
                    </div>

                </div>

                {/* Trust Section */}
                <div className="mt-16 border-t border-white/5 pt-12">
                    <div className="flex flex-wrap items-center justify-center gap-8 max-w-4xl mx-auto">
                        {[
                            { icon: Lock, title: 'Pago 100% Seguro', desc: 'Procesado mediante Stripe con encriptación bancaria' },
                            { icon: Shield, title: 'Sin Permanencia', desc: 'Cancela tu plan en cualquier momento' },
                            { icon: Zap, title: 'Acceso Inmediato', desc: 'Tu cuenta se actualiza al instante' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex flex-col items-center text-center max-w-[200px] gap-3">
                                <div className="p-3 rounded-full bg-neon/5 border border-neon/10 text-neon">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold font-mono text-sm mb-1">{title}</h4>
                                    <p className="text-slate-500 text-xs font-mono">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}
