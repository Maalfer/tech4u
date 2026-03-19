import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Shield, Zap, Lock, ChevronLeft,
    Sparkles, Tag, CheckCircle, XCircle, Gift, CreditCard,
    Terminal
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PricingCards from '../components/PricingCards';
import logoImg from '../assets/tech4u_logo.png';

export default function SubscriptionPage() {
    const { user } = useAuth();
    const navigate  = useNavigate();
    const location  = useLocation();

    const [loadingPlan,         setLoadingPlan]         = useState(null);
    const [error,               setError]               = useState('');
    const [couponInput,           setCouponInput]           = useState('');
    const [couponStatus,          setCouponStatus]          = useState(null);
    const [couponDiscount,        setCouponDiscount]        = useState(0);
    const [couponApplicablePlans, setCouponApplicablePlans] = useState('all');
    const [validatingCoupon,      setValidatingCoupon]      = useState(false);
    const [useReferralDiscount, setUseReferralDiscount] = useState(false);
    const [useFreeMonth,        setUseFreeMonth]        = useState(false);

    const cancelled = new URLSearchParams(location.search).get('cancelled');
    const isLoading = loadingPlan !== null;

    // ── Stripe checkout ───────────────────────────────────────────────────────
    const handleSubscribe = async (plan) => {
        setLoadingPlan(plan);
        setError('');
        try {
            const validCode = couponStatus === 'valid' && !useReferralDiscount && !useFreeMonth
                ? couponInput.trim().toUpperCase() : null;
            let url = `/subscriptions/create-checkout-session?plan=${plan}`;
            if (validCode)           url += `&coupon_code=${validCode}`;
            if (useReferralDiscount) url += `&use_referral_discount=true`;
            if (useFreeMonth)        url += `&use_free_month=true`;
            const res = await api.post(url);
            window.location.href = res.data.url;
        } catch (err) {
            const detail = err.response?.data?.detail;
            setError(detail || 'Error al crear la sesión de pago. Inténtalo de nuevo.');
        } finally {
            setLoadingPlan(null);
        }
    };

    // ── Coupon validation ─────────────────────────────────────────────────────
    const handleValidateCoupon = async () => {
        if (!couponInput.trim()) return;
        setValidatingCoupon(true);
        setCouponStatus(null);
        setUseReferralDiscount(false);
        setUseFreeMonth(false);
        setError('');
        try {
            const res = await api.get(`/subscriptions/validate-coupon?code=${couponInput.trim().toUpperCase()}`);
            setCouponDiscount(res.data.discount_percent);
            setCouponApplicablePlans(res.data.applicable_plans || 'all');
            setCouponStatus('valid');
        } catch (err) {
            setCouponStatus('invalid');
            setCouponDiscount(0);
            setCouponApplicablePlans('all');
            setError(err.response?.data?.detail || 'Cupón inválido o agotado.');
        } finally {
            setValidatingCoupon(false);
        }
    };

    // ── Render payment buttons per plan ──────────────────────────────────────
    const renderActions = (plan) => {
        const isFreeMonthOnly = useFreeMonth && plan.id !== 'monthly';

        return (
            <div className="space-y-2 mt-auto">
                {/* Stripe / free-month button */}
                <button
                    onClick={() => {
                        if (plan.id !== 'monthly' && useFreeMonth) {
                            alert('El mes gratis solo aplica al plan mensual.');
                            return;
                        }
                        handleSubscribe(plan.id);
                    }}
                    disabled={isLoading || isFreeMonthOnly}
                    className={`w-full py-3.5 rounded-2xl font-black font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed
                        ${plan.highlight
                            ? 'bg-neon text-black shadow-[0_0_18px_var(--neon-alpha-40)] hover:shadow-[0_0_35px_var(--neon-alpha-60)] hover:scale-[1.02]'
                            : plan.id === 'annual'
                                ? 'bg-violet-500/15 border-2 border-violet-500/40 text-violet-300 hover:bg-violet-500/25'
                                : 'bg-white/5 border border-white/12 text-white hover:bg-white/10 hover:border-neon/30'
                        }`}
                >
                    {loadingPlan === plan.id
                        ? <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${plan.highlight ? 'border-black' : 'border-current'}`} />
                        : <><CreditCard className="w-4 h-4" />{useFreeMonth && plan.id === 'monthly' ? 'Canjear Mes Gratis' : 'Pagar con Tarjeta'}</>
                    }
                </button>

                {/* PayPal button — temporalmente desactivado */}
                {/* {!useFreeMonth && (
                    <button
                        onClick={() => handlePayPalPay(plan.id)}
                        disabled={isLoading}
                        className="w-full py-2.5 rounded-2xl bg-[#FFC439] hover:bg-[#e6b032] text-[#003087] font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loadingPlan === `paypal-${plan.id}`
                            ? <div className="w-4 h-4 border-2 border-[#003087] border-t-transparent rounded-full animate-spin" />
                            : <><PayPalLogo /><span className="text-xs font-black">Pagar con</span></>
                        }
                    </button>
                )} */}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 overflow-y-auto">

                {/* ── Page header ── */}
                <header className="mb-10 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3.5 rounded-2xl text-slate-500 hover:text-neon border border-transparent hover:border-neon/30 hover:bg-neon/8 transition-all bg-black/40 active:scale-95 shadow-xl backdrop-blur-xl group"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <img
                        src={logoImg}
                        alt="Tech4U"
                        className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(198,255,51,0.5)]"
                    />

                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-neon leading-none">
                            Elige tu Plan
                        </h1>
                        <p className="text-[11px] font-mono text-neon/60 uppercase tracking-[0.3em] font-black mt-1">
                            Desbloquea todo el potencial
                        </p>
                    </div>
                </header>

                {/* ── Banners ── */}
                {/* PayPal cancel banner — temporalmente desactivado */}
                {/* {cancelled === 'paypal' && (
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/25 rounded-2xl text-yellow-400 font-mono text-xs">
                        Cancelaste el pago con PayPal. Puedes intentarlo de nuevo cuando quieras.
                    </div>
                )} */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 font-mono text-xs leading-relaxed">
                        {error}
                    </div>
                )}

                {/* ── Terminal Skills notice ── */}
                <div className="max-w-2xl mb-8 flex items-start gap-3 px-5 py-4 rounded-2xl border border-neon/12 bg-neon/[0.03]">
                    <Terminal className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                    <p className="text-slate-500 font-mono text-xs leading-relaxed">
                        <span className="text-white font-bold">Terminal Skills</span> (entornos Linux interactivos) requiere plan
                        <span className="text-neon font-bold mx-1">Trimestral</span> o <span className="text-neon font-bold">Anual</span>.
                    </p>
                </div>

                {/* ── Coupon widget ── */}
                <div className="max-w-md mb-8">
                    <div className="glass rounded-2xl border border-slate-800 p-5">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-neon" /> Código de Descuento
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="GRUPO-ASIR-100"
                                value={couponInput}
                                onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponStatus(null); setCouponDiscount(0); setCouponApplicablePlans('all'); }}
                                onKeyDown={e => e.key === 'Enter' && handleValidateCoupon()}
                                disabled={useReferralDiscount || useFreeMonth}
                                className="flex-1 bg-black border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-neon outline-none focus:border-neon uppercase placeholder:normal-case placeholder:text-slate-600 transition-colors disabled:opacity-50"
                            />
                            <button
                                onClick={() => handleValidateCoupon()}
                                disabled={!couponInput.trim() || validatingCoupon}
                                className="px-4 py-2.5 rounded-xl bg-neon/10 border border-neon/30 text-neon text-xs font-black uppercase hover:bg-neon hover:text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {validatingCoupon ? '...' : 'Aplicar'}
                            </button>
                        </div>
                        {couponStatus === 'valid' && (
                            <div className="mt-3 flex items-center gap-2 text-neon text-xs font-mono font-bold">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                ¡Cupón válido! <strong>{couponDiscount}% de descuento</strong> aplicado.
                                {couponDiscount === 100 && <span className="text-yellow-400 ml-1">(Acceso gratuito 🎉)</span>}
                            </div>
                        )}
                        {couponStatus === 'invalid' && (
                            <div className="mt-3 flex items-center gap-2 text-red-400 text-xs font-mono">
                                <XCircle className="w-4 h-4 flex-shrink-0" /> Código inválido, inactivo o ya sin usos disponibles.
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Referral rewards ── */}
                {(user?.pending_10p_discounts > 0 || user?.free_months_accumulated > 0) && (
                    <div className="max-w-md mb-8 flex flex-col gap-3">
                        {user?.free_months_accumulated > 0 && (
                            <label className={`glass rounded-2xl border p-4 flex flex-col gap-1 cursor-pointer transition-all ${useFreeMonth ? 'border-neon bg-neon/10' : 'border-slate-800'}`}>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" className="accent-neon w-4 h-4 rounded" checked={useFreeMonth}
                                        onChange={(e) => {
                                            setUseFreeMonth(e.target.checked);
                                            if (e.target.checked) { setUseReferralDiscount(false); setCouponInput(''); setCouponStatus(null); setCouponDiscount(0); setCouponApplicablePlans('all'); }
                                        }}
                                    />
                                    <span className="text-sm font-bold text-white uppercase flex items-center gap-2">
                                        <Gift className="w-4 h-4 text-neon" /> Usar Mes Gratis (Tienes {user.free_months_accumulated})
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono pl-7">Obtén la suscripción mensual sin coste usando uno de tus meses gratis.</p>
                            </label>
                        )}
                        {user?.pending_10p_discounts > 0 && (
                            <label className={`glass rounded-2xl border p-4 flex flex-col gap-1 cursor-pointer transition-all ${useReferralDiscount ? 'border-neon bg-neon/10' : 'border-slate-800'}`}>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" className="accent-neon w-4 h-4 rounded" checked={useReferralDiscount}
                                        onChange={(e) => {
                                            setUseReferralDiscount(e.target.checked);
                                            if (e.target.checked) { setUseFreeMonth(false); setCouponInput(''); setCouponStatus(null); setCouponDiscount(0); setCouponApplicablePlans('all'); }
                                        }}
                                    />
                                    <span className="text-sm font-bold text-white uppercase flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-neon" /> 10% Descuento por Referido (Tienes {user.pending_10p_discounts})
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono pl-7">Aplica un 10% de descuento. No acumulable con otros cupones.</p>
                            </label>
                        )}
                    </div>
                )}

                {/* ── Pricing cards with payment actions ── */}
                <div className="max-w-5xl pt-4 pb-4">
                    <PricingCards 
                        renderActions={renderActions} 
                        discount={useReferralDiscount ? 10 : couponDiscount}
                        applicablePlans={useReferralDiscount ? 'all' : couponApplicablePlans}
                    />
                </div>

                {/* ── Trust badges ── */}
                <div className="flex flex-wrap items-center justify-center gap-6 max-w-2xl mx-auto mt-10">
                    {[
                        { icon: Lock,      text: 'Pagos seguros con tarjeta' },
                        { icon: Shield,    text: 'Sin permanencia. Cancela cuando quieras' },
                        { icon: Zap,       text: 'Acceso inmediato tras el pago' },
                        { icon: Sparkles,  text: 'Soporte disponible en todo momento' },
                    ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2 text-slate-600 font-mono text-[10px]">
                            <Icon className="w-3.5 h-3.5 text-slate-700" /> {text}
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
