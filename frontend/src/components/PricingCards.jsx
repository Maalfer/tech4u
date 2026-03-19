/**
 * PricingCards — Shared pricing component used in:
 *  · SubscriptionPlans.jsx  (public /planes page)
 *  · SubscriptionPage.jsx   (logged-in /suscripcion page)
 *  · LandingPage.jsx        (landing pricing section)
 *
 * Props:
 *  onSelectPlan(planType)  — called when user clicks a plan CTA
 *  renderActions(plan)     — optional: override CTA slot per-plan (for payment buttons)
 *  compact                 — smaller variant for landing page
 */

import {
    Check, Lock, Terminal, Zap, BookOpen, BarChart3, Trophy,
    FlaskConical, Sparkles, Crown, Star, ArrowRight, Rocket,
    Shield, Clock, Gift
} from 'lucide-react';

// ─── Plan definitions ─────────────────────────────────────────────────────────
export const PLAN_DATA = [
    {
        id: 'monthly',
        name: 'Mensual',
        tagline: 'Perfecto para empezar',
        price: '9,99',
        priceSuffix: '€/mes',
        period: 'mes',
        rawPrice: '9.99',
        savingsLabel: null,
        oldPrice: null,
        monthlyEquiv: null,
        accentColor: 'sky',
        accentHex: '#38bdf8',
        accentShadow: 'rgba(56,189,248,0.2)',
        accentBorder: 'border-sky-500/25',
        accentBg: 'bg-sky-500/8',
        accentText: 'text-sky-400',
        highlight: false,
        badge: null,
        icon: BookOpen,
        features: [
            { icon: FlaskConical, text: 'Acceso ilimitado al Test Center',       included: true },
            { icon: BookOpen,     text: 'Todos los recursos y apuntes PDF',       included: true },
            { icon: BarChart3,    text: 'Estadísticas de rendimiento',            included: true },
            { icon: Trophy,       text: 'Ranking competitivo y gamificación',     included: true },
            { icon: Terminal,     text: 'Terminal Skills (5 labs/mes)',            included: true, isLimited: true },
            { icon: Rocket,       text: 'NetLabs y WinLabs ilimitados',           included: false, lockLabel: 'Trimestral+' },
            { icon: Rocket,       text: 'Acceso anticipado a novedades',          included: false, lockLabel: 'Trimestral+' },
            { icon: Sparkles,     text: 'Nuevos modos en acceso anticipado',      included: false, lockLabel: 'Solo Anual' },
        ],
    },
    {
        id: 'quarterly',
        name: 'Trimestral',
        tagline: 'El equilibrio perfecto',
        price: '24,99',
        priceSuffix: '€/trim.',
        period: 'trim.',
        rawPrice: '24.99',
        savingsLabel: '17% ahorro',
        oldPrice: '29,97 €',
        monthlyEquiv: '≈ 8,33 €/mes',
        accentColor: 'neon',
        accentHex: 'var(--color-neon)',
        accentShadow: 'var(--neon-alpha-20)',
        accentBorder: 'border-neon/40',
        accentBg: 'bg-neon/8',
        accentText: 'text-neon',
        highlight: true,
        badge: 'Más Popular',
        icon: Zap,
        features: [
            { icon: FlaskConical, text: 'Acceso ilimitado al Test Center',       included: true },
            { icon: BookOpen,     text: 'Todos los recursos y apuntes PDF',       included: true },
            { icon: BarChart3,    text: 'Estadísticas de rendimiento',            included: true },
            { icon: Trophy,       text: 'Ranking competitivo y gamificación',     included: true },
            { icon: Terminal,     text: 'Terminal Skills interactiva',            included: true, isExclusive: true },
            { icon: Rocket,       text: 'Acceso anticipado a novedades',          included: true, isExclusive: true },
            { icon: Sparkles,     text: 'Nuevos modos en acceso anticipado',      included: false, lockLabel: 'Solo Anual' },
        ],
    },
    {
        id: 'annual',
        name: 'Anual',
        tagline: 'El máximo potencial',
        price: '79,99',
        priceSuffix: '€/año',
        period: 'año',
        rawPrice: '79.99',
        savingsLabel: '44% ahorro',
        oldPrice: '119,88 €',
        monthlyEquiv: '≈ 6,67 €/mes',
        accentColor: 'violet',
        accentHex: '#a78bfa',
        accentShadow: 'rgba(167,139,250,0.2)',
        accentBorder: 'border-violet-500/30',
        accentBg: 'bg-violet-500/8',
        accentText: 'text-violet-400',
        highlight: false,
        badge: 'Máximo Ahorro',
        icon: Crown,
        features: [
            { icon: FlaskConical, text: 'Acceso ilimitado al Test Center',       included: true },
            { icon: BookOpen,     text: 'Todos los recursos y apuntes PDF',       included: true },
            { icon: BarChart3,    text: 'Estadísticas de rendimiento',            included: true },
            { icon: Trophy,       text: 'Ranking competitivo y gamificación',     included: true },
            { icon: Terminal,     text: 'Terminal Skills interactiva',            included: true },
            { icon: Rocket,       text: 'Acceso anticipado a novedades',          included: true },
            { icon: Sparkles,     text: 'Nuevos modos en acceso anticipado',      included: true, isExclusive: true },
        ],
    },
];

// ─── Single plan card ─────────────────────────────────────────────────────────
function PlanCard({ plan, onSelectPlan, renderActions, compact, discount = 0 }) {
    const Icon = plan.icon;

    // Calculate discounted price if applicable
    const numericPrice = parseFloat(plan.rawPrice);
    const hasDiscount = discount > 0 && discount <= 100;
    const finalPrice = hasDiscount 
        ? (numericPrice * (1 - discount / 100)).toFixed(2)
        : plan.price;

    const displayPrice = hasDiscount ? finalPrice.replace('.', ',') : plan.price;

    return (
        /* Outer wrapper — provides space for the badge above + pulse ring */
        <div className={`relative ${plan.badge ? 'pt-5' : ''}`}>

            {/* ── Pulse glow ring (quarterly only) ── */}
            {plan.highlight && (
                <>
                    {/* Static outer ring */}
                    <div
                        className="absolute inset-0 rounded-[2.2rem] pointer-events-none"
                        style={{
                            border: '1.5px solid rgba(198,255,51,0.35)',
                            top: plan.badge ? '20px' : '0',
                        }}
                    />
                    {/* Pulsing glow ring */}
                    <div
                        className="absolute inset-0 rounded-[2.2rem] pointer-events-none animate-pulse"
                        style={{
                            boxShadow: '0 0 0 4px rgba(198,255,51,0.08), 0 0 40px rgba(198,255,51,0.18)',
                            top: plan.badge ? '20px' : '0',
                        }}
                    />
                </>
            )}

            {/* ── Badge (outside card, so overflow-hidden doesn't clip it) ── */}
            {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                    <span
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border
                            ${plan.highlight
                                ? 'bg-neon text-black border-neon shadow-[0_0_24px_rgba(198,255,51,0.7)]'
                                : `${plan.accentBg} ${plan.accentText} ${plan.accentBorder}`
                            }`}
                    >
                        {plan.highlight ? <Star className="w-2.5 h-2.5 fill-current" /> : <Crown className="w-2.5 h-2.5" />}
                        {plan.badge}
                    </span>
                </div>
            )}

            {/* ── Card body ── */}
            <div
                className={`relative flex flex-col rounded-[2rem] border transition-all duration-500 overflow-hidden
                    ${plan.highlight
                        ? 'border-neon/50 bg-gradient-to-br from-[#081408] via-[#0a100a] to-[#060a06]'
                        : plan.id === 'annual'
                            ? `${plan.accentBorder} bg-gradient-to-br from-[#0d0a18] via-[#0a0a14] to-[#070710]`
                            : `${plan.accentBorder} bg-[#0c0c0f]`
                    }
                    ${compact ? 'p-6' : 'p-8'}
                    group hover:-translate-y-1 hover:shadow-2xl
                `}
                style={plan.highlight ? { boxShadow: `0 0 50px rgba(198,255,51,0.14)` } : {}}
            >
            {/* ── Top glow bar ── */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${plan.accentHex}60, transparent)` }}
            />

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${plan.accentBg} ${plan.accentBorder}`}>
                        <Icon className={`w-5 h-5 ${plan.accentText}`} />
                    </div>
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${plan.accentText} opacity-80`}>{plan.tagline}</p>
                        <h3 className="text-white font-black text-xl uppercase tracking-tight leading-none">{plan.name}</h3>
                    </div>
                </div>

                {plan.savingsLabel && (
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${plan.accentBg} ${plan.accentText} ${plan.accentBorder}`}>
                        {plan.savingsLabel}
                    </span>
                )}
            </div>

            {/* ── Price ── */}
            <div className="mb-6">
                <div className="flex items-end gap-1.5 text-white">
                    {hasDiscount && (
                        <span className="text-slate-500 font-mono text-sm line-through mb-1.5 mr-1">
                            {plan.price}€
                        </span>
                    )}
                    <span
                        className={`font-black font-mono leading-none ${compact ? 'text-4xl' : 'text-5xl'} ${plan.highlight ? 'text-neon drop-shadow-[0_0_20px_var(--neon-alpha-50)]' : plan.id === 'annual' ? 'text-violet-300' : 'text-white'}`}
                    >
                        {displayPrice.split(',')[0]}
                        <span className={compact ? 'text-2xl' : 'text-3xl'}>,{displayPrice.split(',')[1]}</span>
                    </span>
                    <span className="text-slate-500 font-mono text-xs mb-1.5">{plan.priceSuffix}</span>
                </div>

                <div className="flex items-center gap-2 mt-2 min-h-[20px]">
                    {plan.oldPrice && (
                        <span className="text-slate-600 font-mono text-[11px] line-through">{plan.oldPrice}</span>
                    )}
                    {plan.monthlyEquiv && (
                        <span className={`font-mono text-[11px] font-black ${plan.highlight ? 'text-neon/80' : plan.accentText}`}>
                            {plan.monthlyEquiv}
                        </span>
                    )}
                    {!plan.oldPrice && (
                        <span className="text-slate-600 font-mono text-[11px]">Pago mes a mes</span>
                    )}
                </div>
            </div>

            {/* ── Divider ── */}
            <div
                className="h-px mb-5 opacity-30"
                style={{ background: `linear-gradient(90deg, transparent, ${plan.accentHex}, transparent)` }}
            />

            {/* ── Features ── */}
            <ul className={`flex-1 space-y-3 ${compact ? 'mb-5' : 'mb-6'}`}>
                {plan.features.map((feat) => {
                    const FeatIcon = feat.icon;
                    return (
                        <li key={feat.text} className={`flex items-start gap-3 ${!feat.included ? 'opacity-38' : ''}`}>
                            {feat.included ? (
                                <div className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5
                                    ${feat.isExclusive || feat.isLimited
                                        ? `${plan.accentBg} border ${plan.accentBorder}`
                                        : 'bg-white/5 border border-white/10'
                                    }`}>
                                    {feat.isLimited ? (
                                        <span className="text-[10px] font-black text-amber-400">!</span>
                                    ) : (
                                        <Check className={`w-3 h-3 ${feat.isExclusive ? plan.accentText : 'text-white/60'}`} />
                                    )}
                                </div>
                            ) : (
                                <div className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5 bg-white/3 border border-white/8">
                                    <Lock className="w-2.5 h-2.5 text-slate-600" />
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <span className={`font-mono text-xs leading-relaxed ${feat.included ? (feat.isExclusive || feat.isLimited ? `font-bold ${plan.accentText === 'text-neon' ? 'text-white' : 'text-white'}` : 'text-slate-300') : 'text-slate-600 line-through'}`}>
                                    {feat.text}
                                </span>
                                {!feat.included && feat.lockLabel && (
                                    <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-700 bg-white/5 px-1.5 py-0.5 rounded border border-white/8">
                                        {feat.lockLabel}
                                    </span>
                                )}
                                {feat.included && feat.isExclusive && (
                                    <span className={`ml-1.5 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${plan.accentBg} ${plan.accentText} ${plan.accentBorder} opacity-80`}>
                                        Exclusivo
                                    </span>
                                )}
                                {feat.included && feat.isLimited && (
                                    <span className="ml-1.5 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 opacity-90">
                                        Limitado
                                    </span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>

            {/* ── CTA slot ── */}
            {renderActions ? renderActions(plan) : (
                <button
                    onClick={() => onSelectPlan?.(plan.id)}
                    className={`w-full py-4 rounded-2xl font-black font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300
                        ${plan.highlight
                            ? 'bg-neon text-black shadow-[0_0_20px_var(--neon-alpha-40)] hover:shadow-[0_0_40px_var(--neon-alpha-60)] hover:scale-[1.02]'
                            : plan.id === 'annual'
                                ? 'bg-violet-500/15 border-2 border-violet-500/40 text-violet-300 hover:bg-violet-500/25 hover:border-violet-500/60'
                                : 'bg-white/5 border border-white/12 text-white hover:bg-white/10 hover:border-neon/30'
                        }`}
                >
                    {plan.highlight
                        ? <><ArrowRight className="w-4 h-4" /> Empezar Ahora</>
                        : plan.id === 'annual'
                            ? <><Crown className="w-4 h-4" /> Plan Anual</>
                            : <><BookOpen className="w-4 h-4" /> Plan Mensual</>
                    }
                </button>
            )}
            </div>
        </div>
    );
}

// ─── Exported component ───────────────────────────────────────────────────────
export default function PricingCards({ onSelectPlan, renderActions, compact = false, discount = 0 }) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-6 ${compact ? '' : 'lg:gap-8'}`}>
            {PLAN_DATA.map((plan) => (
                <PlanCard
                    key={plan.id}
                    plan={plan}
                    onSelectPlan={onSelectPlan}
                    renderActions={renderActions}
                    compact={compact}
                    discount={discount}
                />
            ))}
        </div>
    );
}
