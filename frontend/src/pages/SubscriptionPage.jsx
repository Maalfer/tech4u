import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Shield, Check, Zap, BookOpen, FlaskConical,
    Star, Crown, ArrowRight, Lock, ChevronLeft,
    Sparkles, Trophy, BarChart3
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const FEATURES = [
    { icon: FlaskConical, text: 'Acceso ilimitado al Test Center' },
    { icon: BookOpen, text: 'Todos los recursos y apuntes PDF' },
    { icon: BarChart3, text: 'Estadísticas de rendimiento avanzadas' },
    { icon: Trophy, text: 'Ranking competitivo y gamificación' },
    { icon: Sparkles, text: 'Explicaciones detalladas por pregunta' },
    { icon: Shield, text: 'Nuevas preguntas añadidas cada semana' },
];

export default function SubscriptionPage() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [error, setError] = useState('');

    const cancelled = new URLSearchParams(location.search).get('cancelled');

    const handleSubscribe = async (plan) => {
        setLoadingPlan(plan);
        setError('');
        try {
            const res = await api.post(`/subscriptions/create-checkout-session?plan=${plan}`);
            window.location.href = res.data.url;
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (detail?.includes('STRIPE_SECRET_KEY')) {
                setError('⚠️ El servidor no tiene la clave de Stripe configurada. Añade STRIPE_SECRET_KEY al archivo .env del backend y reinicia el servidor.');
            } else {
                setError(detail || 'Error al crear la sesión de pago. Inténtalo de nuevo.');
            }
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">

                {/* Back button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-white font-mono text-xs mb-8 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Volver al Dashboard
                </button>

                {/* Banner de cancelación */}
                {cancelled && (
                    <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-orange-400 font-mono text-sm">
                        ⚠️ Pago cancelado. Puedes intentarlo de nuevo cuando quieras.
                    </div>
                )}

                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 mb-6">
                        <Zap className="w-4 h-4 text-[#39FF14]" />
                        <span className="text-[#39FF14] font-mono text-xs uppercase tracking-widest font-bold">Desbloquea todo el potencial</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic mb-4 leading-tight">
                        Elige tu<br />
                        <span className="text-[#39FF14] drop-shadow-[0_0_20px_rgba(57,255,20,0.4)]">Plan de Acceso</span>
                    </h1>
                    <p className="text-slate-400 font-mono text-sm max-w-lg mx-auto leading-relaxed">
                        Accede a todo el contenido de <strong className="text-white">Tech4U</strong>: tests ilimitados, recursos, estadísticas y mucho más. Sin límites.
                    </p>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 font-mono text-xs leading-relaxed">
                        {error}
                    </div>
                )}

                {/* Pricing cards */}
                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">

                    {/* Plan Mensual */}
                    <div className="relative bg-[#111] border border-slate-700 rounded-3xl p-8 flex flex-col hover:border-[#39FF14]/40 transition-all duration-300 group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-slate-800">
                                <Shield className="w-5 h-5 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Flexibilidad total</p>
                                <h2 className="text-white font-black text-lg uppercase tracking-tight">Plan Mensual</h2>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-black text-white font-mono">9<span className="text-3xl">,99</span></span>
                                <span className="text-slate-400 font-mono text-sm mb-2">€ / mes</span>
                            </div>
                            <p className="text-slate-600 font-mono text-xs mt-1">Cancela cuando quieras</p>
                        </div>

                        <div className="space-y-3 mb-8 flex-1">
                            {FEATURES.map((f) => (
                                <div key={f.text} className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-[#39FF14] flex-shrink-0" />
                                    <span className="text-slate-300 font-mono text-xs">{f.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleSubscribe('monthly')}
                            disabled={loadingPlan !== null}
                            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white/5 border border-slate-600 text-white font-black font-mono text-sm uppercase tracking-wide hover:bg-[#39FF14] hover:border-[#39FF14] hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group-hover:border-[#39FF14]/60"
                        >
                            {loadingPlan === 'monthly' ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>Empezar Mensual <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>

                    {/* Plan Anual — DESTACADO */}
                    <div className="relative bg-gradient-to-br from-[#39FF14]/8 to-[#0D0D0D] border-2 border-[#39FF14]/50 rounded-3xl p-8 flex flex-col shadow-[0_0_40px_rgba(57,255,20,0.1)] hover:shadow-[0_0_60px_rgba(57,255,20,0.2)] transition-all duration-500">
                        {/* Badge */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                            <span className="px-4 py-1 bg-[#39FF14] text-black text-[10px] font-black uppercase rounded-full tracking-widest shadow-[0_0_20px_rgba(57,255,20,0.5)]">
                                ⚡ Más Popular · Ahorra 33%
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mb-6 mt-2">
                            <div className="p-2 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/30">
                                <Crown className="w-5 h-5 text-[#39FF14]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-mono text-[#39FF14] uppercase tracking-widest">Mejor precio</p>
                                <h2 className="text-white font-black text-lg uppercase tracking-tight">Plan Anual</h2>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-black text-[#39FF14] font-mono drop-shadow-[0_0_15px_rgba(57,255,20,0.4)]">79<span className="text-3xl">,99</span></span>
                                <span className="text-slate-400 font-mono text-sm mb-2">€ / año</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-slate-600 font-mono text-xs line-through">119,88 €</span>
                                <span className="text-[#39FF14] font-mono text-xs font-bold">≈ 6,67 €/mes</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8 flex-1">
                            {FEATURES.map((f) => (
                                <div key={f.text} className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-[#39FF14] flex-shrink-0 drop-shadow-[0_0_6px_rgba(57,255,20,0.8)]" />
                                    <span className="text-slate-200 font-mono text-xs">{f.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleSubscribe('annual')}
                            disabled={loadingPlan !== null}
                            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#39FF14] text-black font-black font-mono text-sm uppercase tracking-wide hover:shadow-[0_0_25px_rgba(57,255,20,0.5)] hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingPlan === 'annual' ? (
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Star className="w-4 h-4" />
                                    Empezar Anual
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 max-w-2xl mx-auto mb-8">
                    {[
                        { icon: Lock, text: 'Pago 100% seguro con Stripe' },
                        { icon: Shield, text: 'Sin permanencia. Cancela cuando quieras' },
                        { icon: Zap, text: 'Acceso inmediato tras el pago' },
                    ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                            <Icon className="w-3.5 h-3.5 text-slate-600" />
                            {text}
                        </div>
                    ))}
                </div>

                {/* Test mode notice */}
                <div className="max-w-xl mx-auto text-center p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                    <p className="text-blue-400 font-mono text-[11px]">
                        🧪 <strong>Modo de prueba activo</strong> — Usa la tarjeta <strong className="font-mono">4242 4242 4242 4242</strong>, fecha futura, CVC cualquiera.
                    </p>
                </div>

            </main>
        </div>
    );
}
