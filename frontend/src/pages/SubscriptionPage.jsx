import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Shield, Check, Zap, BookOpen, FlaskConical,
    Star, Crown, ArrowRight, Lock, ChevronLeft,
    Sparkles, Trophy, BarChart3, Tag, CheckCircle, XCircle, Gift, CreditCard
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

// Componente para el botón de PayPal
const PayPalButton = ({ planId, onPaypalClick, useReferralDiscount, useFreeMonth, couponCode }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!window.paypal) return;

        // Limpiar contenedor previo
        if (containerRef.current) containerRef.current.innerHTML = "";

        window.paypal.Buttons({
            style: {
                layout: 'horizontal',
                color: 'blue',
                shape: 'pill',
                label: 'pay',
                height: 48
            },
            createOrder: async () => {
                try {
                    const res = await api.post(`/paypal/create-order?plan=${planId}${useReferralDiscount ? '&use_referral_discount=true' : ''}${useFreeMonth ? '&use_free_month=true' : ''}${couponCode ? `&coupon_code=${couponCode}` : ''}`);
                    return res.data.order_id;
                } catch (err) {
                    console.error("PayPal Order Error:", err);
                    alert("Error al iniciar el pago con PayPal.");
                    throw err;
                }
            },
            onApprove: async (data) => {
                try {
                    await api.post(`/paypal/capture-order/${data.orderID}`);
                    window.location.href = "/suscripcion/exito";
                } catch (err) {
                    console.error("PayPal Capture Error:", err);
                    alert("Error al procesar el pago de PayPal.");
                }
            }
        }).render(containerRef.current);
    }, [planId, useReferralDiscount, useFreeMonth, couponCode]);

    return <div ref={containerRef} className="w-full mt-3" />;
};

export default function SubscriptionPage() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [error, setError] = useState('');
    const [couponInput, setCouponInput] = useState('');
    const [couponStatus, setCouponStatus] = useState(null); // null | 'valid' | 'invalid'
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [useReferralDiscount, setUseReferralDiscount] = useState(false);
    const [useFreeMonth, setUseFreeMonth] = useState(false);

    const cancelled = new URLSearchParams(location.search).get('cancelled');

    const handleValidateCoupon = async (selectedPlan = "monthly") => {
        if (!couponInput.trim()) return;
        setValidatingCoupon(true);
        setCouponStatus(null);
        setUseReferralDiscount(false);
        setUseFreeMonth(false);
        setError('');
        try {
            const res = await api.get(`/subscriptions/validate-coupon?code=${couponInput.trim().toUpperCase()}&plan=${selectedPlan}`);
            setCouponDiscount(res.data.discount_percent);
            setCouponStatus('valid');
        } catch (err) {
            setCouponStatus('invalid');
            setCouponDiscount(0);
            setError(err.response?.data?.detail || 'Cupón inválido para este plan.');
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleSubscribe = async (plan) => {
        setLoadingPlan(plan);
        setError('');
        try {
            const validCode = couponStatus === 'valid' && !useReferralDiscount && !useFreeMonth ? couponInput.trim().toUpperCase() : null;
            let url = `/subscriptions/create-checkout-session?plan=${plan}`;
            if (validCode) url += `&coupon_code=${validCode}`;
            if (useReferralDiscount) url += `&use_referral_discount=true`;
            if (useFreeMonth) url += `&use_free_month=true`;
            const res = await api.post(url);
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

    const validCouponCode = couponStatus === 'valid' && !useReferralDiscount && !useFreeMonth ? couponInput.trim().toUpperCase() : null;

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">

                {/* Header */}
                <header className="mb-14 flex flex-col items-start relative z-10 w-full">
                    <div className="animate-in fade-in slide-in-from-left duration-700 w-full">
                        <div className="flex items-center gap-5 mb-4">
                            <button onClick={() => navigate('/dashboard')} className="p-4 rounded-2xl text-slate-500 hover:text-neon border border-transparent hover:border-neon/30 hover:bg-neon/10 transition-all bg-black/40 mb-1 active:scale-95 shadow-2xl backdrop-blur-xl group">
                                <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                            </button>

                            <div className="relative group">
                                <div className="absolute -inset-2 bg-[var(--color-neon)]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-4 bg-gradient-to-br from-[var(--color-neon)]/20 to-transparent rounded-2xl border-2 border-[var(--color-neon)]/30 shadow-[0_0_40px_var(--neon-alpha-10)] relative overflow-hidden backdrop-blur-xl">
                                    <Zap className="w-10 h-10 text-neon group-hover:rotate-[15deg] transition-transform duration-500" />
                                    <div className="absolute top-0 right-0 p-1">
                                        <Sparkles className="w-3 h-3 text-neon animate-pulse" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-[var(--color-neon)] drop-shadow-sm">
                                    Elige tu <span className="text-white">Plan</span>
                                </h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="h-px w-8 bg-neon/50" />
                                    <p className="text-[10px] font-mono text-neon/70 uppercase tracking-[0.4em] font-black">
                                        Desbloquea todo el potencial
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-400 font-mono text-sm max-w-lg mt-6 leading-relaxed md:ml-24">
                            Accede a todo el contenido de <strong className="text-white">Tech4U</strong>: tests ilimitados, recursos, estadísticas y mucho más. Sin límites.
                        </p>
                    </div>
                </header>

                {/* Error banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 font-mono text-xs leading-relaxed">
                        {error}
                    </div>
                )}

                {/* COUPON CODE WIDGET */}
                <div className="max-w-md mx-auto mb-10">
                    <div className="glass rounded-2xl border border-slate-800 p-5">
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-neon" /> Código de Descuento
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="GRUPO-ASIR-100"
                                value={couponInput}
                                onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponStatus(null); }}
                                onKeyDown={e => e.key === 'Enter' && handleValidateCoupon()}
                                disabled={useReferralDiscount || useFreeMonth}
                                className="flex-1 bg-black border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-neon outline-none focus:border-neon uppercase placeholder:normal-case placeholder:text-slate-600 transition-colors disabled:opacity-50"
                            />
                            <button
                                onClick={() => handleValidateCoupon('monthly')}
                                disabled={!couponInput.trim() || validatingCoupon}
                                className="px-4 py-2.5 rounded-xl bg-neon/10 border border-neon/30 text-neon text-xs font-black uppercase hover:bg-neon hover:text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {validatingCoupon ? '...' : 'Aplicar'}
                            </button>
                        </div>

                        {couponStatus === 'valid' && (
                            <div className="mt-3 flex items-center gap-2 text-neon text-xs font-mono font-bold">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                <span>¡Cupón válido! <strong>{couponDiscount}% de descuento</strong> aplicado en tu pedido.</span>
                                {couponDiscount === 100 && <span className="ml-1 text-yellow-400">(Acceso gratuito 🎉)</span>}
                            </div>
                        )}
                        {couponStatus === 'invalid' && (
                            <div className="mt-3 flex items-center gap-2 text-red-400 text-xs font-mono">
                                <XCircle className="w-4 h-4 flex-shrink-0" />
                                <span>Código inválido, inactivo o ya sin usos disponibles.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* REFERRAL REWARDS WIDGET */}
                {(user?.pending_10p_discounts > 0 || user?.free_months_accumulated > 0) && (
                    <div className="max-w-md mx-auto mb-10 flex flex-col gap-3">
                        {user?.free_months_accumulated > 0 && (
                            <label className={`glass rounded-2xl border p-4 flex flex-col gap-1 cursor-pointer transition-all ${useFreeMonth ? 'border-neon bg-neon/10' : 'border-slate-800'}`}>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" className="accent-neon w-4 h-4 rounded"
                                        checked={useFreeMonth}
                                        onChange={(e) => {
                                            setUseFreeMonth(e.target.checked);
                                            if (e.target.checked) {
                                                setUseReferralDiscount(false);
                                                setCouponInput('');
                                                setCouponStatus(null);
                                                setCouponDiscount(0);
                                            }
                                        }}
                                    />
                                    <span className="text-sm font-bold text-white uppercase flex items-center gap-2">
                                        <Gift className="w-4 h-4 text-neon" /> Usar Mes Gratis (Tienes {user.free_months_accumulated})
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono pl-7">Obtén la suscripción directamente sin coste usando uno de tus meses gratis acumulados.</p>
                            </label>
                        )}

                        {user?.pending_10p_discounts > 0 && (
                            <label className={`glass rounded-2xl border p-4 flex flex-col gap-1 cursor-pointer transition-all ${useReferralDiscount ? 'border-neon bg-neon/10' : 'border-slate-800'}`}>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" className="accent-neon w-4 h-4 rounded"
                                        checked={useReferralDiscount}
                                        onChange={(e) => {
                                            setUseReferralDiscount(e.target.checked);
                                            if (e.target.checked) {
                                                setUseFreeMonth(false);
                                                setCouponInput('');
                                                setCouponStatus(null);
                                                setCouponDiscount(0);
                                            }
                                        }}
                                    />
                                    <span className="text-sm font-bold text-white uppercase flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-neon" /> 10% Descuento por Referido (Tienes {user.pending_10p_discounts})
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono pl-7">Aplica un 10% de descuento en tu pago. No acumulable con otros cupones.</p>
                            </label>
                        )}
                    </div>
                )}

                {/* Pricing cards */}
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

                        <div className="space-y-4 mb-4 flex-1">
                            {FEATURES.slice(0, 4).map((f) => (
                                <div key={f.text} className="flex items-start gap-3">
                                    <Check className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-300 font-mono text-xs leading-relaxed">{f.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleSubscribe('monthly')}
                            disabled={loadingPlan !== null}
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black font-mono text-sm uppercase tracking-wide hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group-hover:border-neon/40 mb-2"
                        >
                            {loadingPlan === 'monthly' ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><CreditCard className="w-4 h-4" />{useFreeMonth ? 'Canjear Mes Gratis' : 'Pagar con Tarjeta'}</>
                            )}
                        </button>

                        {!useFreeMonth && (
                            <PayPalButton
                                planId="monthly"
                                useReferralDiscount={useReferralDiscount}
                                useFreeMonth={useFreeMonth}
                                couponCode={validCouponCode}
                            />
                        )}
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

                        <div className="space-y-4 mb-4 flex-1">
                            {FEATURES.slice(0, 5).map((f) => (
                                <div key={f.text} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-neon flex-shrink-0 drop-shadow-[0_0_8px_var(--neon-alpha-80)]" />
                                    <span className="text-white font-mono text-sm font-medium leading-relaxed">{f.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                if (useFreeMonth) {
                                    alert("El mes gratis solo se puede aplicar al plan mensual.");
                                    return;
                                }
                                handleSubscribe('quarterly');
                            }}
                            disabled={loadingPlan !== null || useFreeMonth}
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-neon text-[#0D0D0D] font-black font-mono text-base uppercase tracking-wider shadow-[0_0_20px_var(--neon-alpha-40)] hover:shadow-[0_0_40px_var(--neon-alpha-60)] hover:scale-[1.03] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                        >
                            {loadingPlan === 'quarterly' ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><CreditCard className="w-5 h-5" />Pagar con Tarjeta</>
                            )}
                        </button>

                        {!useFreeMonth && (
                            <PayPalButton
                                planId="quarterly"
                                useReferralDiscount={useReferralDiscount}
                                useFreeMonth={useFreeMonth}
                                couponCode={validCouponCode}
                            />
                        )}
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

                        <div className="space-y-4 mb-4 flex-1">
                            {FEATURES.map((f) => (
                                <div key={f.text} className="flex items-start gap-3">
                                    <Check className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-300 font-mono text-xs leading-relaxed">{f.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                if (useFreeMonth) {
                                    alert("El mes gratis solo se puede aplicar al plan mensual.");
                                    return;
                                }
                                handleSubscribe('annual');
                            }}
                            disabled={loadingPlan !== null || useFreeMonth}
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black font-mono text-sm uppercase tracking-wide hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group-hover:border-neon/40 mb-2"
                        >
                            {loadingPlan === 'annual' ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><CreditCard className="w-4 h-4" />Pagar con Tarjeta</>
                            )}
                        </button>

                        {!useFreeMonth && (
                            <PayPalButton
                                planId="annual"
                                useReferralDiscount={useReferralDiscount}
                                useFreeMonth={useFreeMonth}
                                couponCode={validCouponCode}
                            />
                        )}
                    </div>

                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 max-w-2xl mx-auto mb-8">
                    {[
                        { icon: Lock, text: 'Pagos seguros con Stripe y PayPal' },
                        { icon: Shield, text: 'Sin permanencia. Cancela cuando quieras' },
                        { icon: Zap, text: 'Acceso inmediato tras el pago' },
                    ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                            <Icon className="w-3.5 h-3.5 text-slate-600" />
                            {text}
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
