import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CreditCard, CheckCircle, XCircle, RefreshCw, Calendar,
    Clock, Award, AlertCircle, Zap, ToggleLeft, ToggleRight,
    ArrowLeft, Flame, ExternalLink, TrendingUp, Shield
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import api from '../services/api'

const PLAN_CONFIG = {
    free: {
        badge: 'bg-slate-700/50 text-slate-400 border-slate-600/30',
        border: 'border-slate-700/50',
        glow: '',
        gradientBg: 'bg-gradient-to-br from-slate-800/20 to-transparent',
        accentBar: 'bg-slate-600',
        accentBarGlow: '',
        accentText: 'text-slate-300',
        barFill: 'bg-gradient-to-r from-slate-500 to-slate-400',
    },
    monthly: {
        badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        border: 'border-sky-500/25',
        glow: 'shadow-[0_0_60px_rgba(14,165,233,0.07)]',
        gradientBg: 'bg-gradient-to-br from-sky-950/40 to-transparent',
        accentBar: 'bg-gradient-to-r from-sky-500 to-cyan-400',
        accentBarGlow: 'shadow-[0_0_15px_rgba(14,165,233,0.5)]',
        accentText: 'text-sky-400',
        barFill: 'bg-gradient-to-r from-sky-500 to-cyan-400',
    },
    quarterly: {
        badge: 'bg-neon/10 text-neon border-neon/30',
        border: 'border-neon/25',
        glow: 'shadow-[0_0_60px_rgba(198,255,51,0.07)]',
        gradientBg: 'bg-gradient-to-br from-lime-950/40 to-transparent',
        accentBar: 'bg-gradient-to-r from-neon to-cyan-400',
        accentBarGlow: 'shadow-[0_0_15px_rgba(198,255,51,0.5)]',
        accentText: 'text-neon',
        barFill: 'bg-gradient-to-r from-neon to-cyan-400',
    },
    annual: {
        badge: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
        border: 'border-violet-500/25',
        glow: 'shadow-[0_0_60px_rgba(139,92,246,0.09)]',
        gradientBg: 'bg-gradient-to-br from-violet-950/40 to-transparent',
        accentBar: 'bg-gradient-to-r from-violet-500 to-purple-400',
        accentBarGlow: 'shadow-[0_0_15px_rgba(139,92,246,0.5)]',
        accentText: 'text-violet-400',
        barFill: 'bg-gradient-to-r from-violet-500 to-purple-400',
    },
}

function formatDate(iso) {
    if (!iso) return null
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

function daysLeft(iso) {
    if (!iso) return null
    return Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24))
}

function getRank(months) {
    if (months >= 12) return { label: 'Premium', emoji: '🏆', color: 'text-amber-400' }
    if (months >= 6)  return { label: 'Avanzado', emoji: '⭐', color: 'text-violet-400' }
    if (months >= 3)  return { label: 'Regular',  emoji: '🎯', color: 'text-sky-400' }
    if (months >= 1)  return { label: 'Nuevo',    emoji: '🌱', color: 'text-emerald-400' }
    return { label: '—', emoji: '', color: 'text-slate-500' }
}

export default function ManageSubscription() {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)
    const [error, setError] = useState(null)
    const [cancelling, setCancelling] = useState(false)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/subscriptions/my')
            setData(res.data)
        } catch {
            setError('No se pudo cargar la información de tu suscripción.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const handleToggleAutoRenew = async () => {
        setToggling(true)
        try {
            const res = await api.post('/subscriptions/toggle-auto-renew')
            setData(d => ({ ...d, auto_renew: res.data.auto_renew }))
        } catch {
            setError('No se pudo cambiar la configuración de aviso.')
        } finally {
            setToggling(false)
        }
    }

    const handleCancelSubscription = async () => {
        setCancelling(true)
        setError(null)
        try {
            await api.post('/subscriptions/cancel')
            await fetchData()
            setShowCancelConfirm(false)
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al cancelar la suscripción.')
        } finally {
            setCancelling(false)
        }
    }

    const cfg = data ? (PLAN_CONFIG[data.subscription_type] || PLAN_CONFIG.free) : PLAN_CONFIG.free
    const days = data ? daysLeft(data.subscription_end) : null
    const rank = data ? getRank(data.months_subscribed) : null
    const totalDays = data?.subscription_type === 'monthly' ? 30
        : data?.subscription_type === 'quarterly' ? 90 : 365
    const pct = days !== null ? Math.max(2, Math.min(100, (days / totalDays) * 100)) : 0

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-6 md:p-8 pt-16 md:pt-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 rounded-xl text-slate-600 hover:text-white hover:bg-white/5 transition-all mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <PageHeader
                    Icon={CreditCard}
                    gradient="from-white via-amber-100 to-amber-400"
                    iconColor="text-amber-400"
                    iconBg="bg-amber-400/20"
                    iconBorder="border-amber-400/30"
                    glowColor="bg-amber-400/20"
                    title={<>Gestionar <span className="text-amber-400">Suscripción</span></>}
                    subtitle="Información y configuración de tu plan"
                />

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-mono text-xs mb-6">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : data && (
                    <div className="max-w-4xl w-full mx-auto space-y-4">

                        {/* ─── HERO CARD ─────────────────────────────────────── */}
                        <div className={`relative glass rounded-3xl border-2 ${cfg.border} ${cfg.glow} overflow-hidden`}>
                            {/* Top accent line */}
                            <div className={`h-[3px] w-full ${cfg.accentBar}`} />
                            {/* Background tint */}
                            <div className={`absolute inset-0 ${cfg.gradientBg} pointer-events-none`} />

                            <div className="relative p-7 md:p-8">
                                {/* Top row: plan info + actions */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">

                                    {/* Plan identity */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-2">
                                            Entorno Actual
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <h2 className={`text-5xl md:text-6xl font-black uppercase italic leading-none ${cfg.accentText}`}>
                                                {data.plan_label}
                                            </h2>
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border ${cfg.badge}`}>
                                                {data.is_active
                                                    ? <><CheckCircle className="w-3 h-3" /> Suscripción Activa</>
                                                    : <><XCircle className="w-3 h-3" /> Sin Suscripción</>}
                                            </span>
                                        </div>
                                        {data.is_active && data.subscription_end && (
                                            <div className="flex flex-wrap items-center gap-3">
                                                <p className="text-sm text-slate-400 font-mono">
                                                    Acceso hasta el{' '}
                                                    <span className="text-white font-black">{formatDate(data.subscription_end)}</span>
                                                </p>
                                                {days !== null && (
                                                    <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${
                                                        days <= 7
                                                            ? 'bg-red-500/15 text-red-400 border-red-500/20'
                                                            : days <= 30
                                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    }`}>
                                                        {days > 0 ? `${days} días restantes` : 'Expirado'}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-row sm:flex-col gap-2.5 shrink-0">
                                        {!data.is_active ? (
                                            <button
                                                onClick={() => navigate('/suscripcion')}
                                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-neon text-black font-black uppercase text-xs hover:shadow-[0_0_25px_rgba(198,255,51,0.35)] hover:scale-[1.02] transition-all group"
                                            >
                                                <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                Activar Plan
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => navigate('/suscripcion')}
                                                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-neon/40 hover:bg-neon/5 text-slate-300 hover:text-white font-black uppercase text-xs transition-all tracking-wider group"
                                                >
                                                    <TrendingUp className="w-4 h-4 group-hover:text-neon transition-colors" />
                                                    Escalar Plan
                                                </button>
                                                <a
                                                    href="mailto:info@tech4uacademy.es"
                                                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-500 hover:text-slate-300 font-black uppercase text-xs transition-all tracking-wider group"
                                                >
                                                    <ExternalLink className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                                    Soporte
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                {data.is_active && days !== null && (
                                    <div className="mt-7 pt-6 border-t border-white/[0.06]">
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                                                Integridad del Periodo
                                            </span>
                                            <span className="text-[9px] font-mono text-slate-500">
                                                {Math.round(pct)}% restante
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/[0.04]">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${
                                                    days <= 7
                                                        ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                                                        : `${cfg.barFill} ${cfg.accentBarGlow}`
                                                }`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ─── STATS STRIP ───────────────────────────────────── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                            <div className="glass rounded-2xl p-4 border border-white/5 hover:border-sky-500/20 transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/10 flex items-center justify-center">
                                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Inicio</span>
                                </div>
                                {formatDate(data.subscription_start)
                                    ? <p className="text-sm font-black text-white leading-tight">{formatDate(data.subscription_start)}</p>
                                    : <p className="text-xs font-mono text-slate-600">No disponible</p>
                                }
                            </div>

                            <div className="glass rounded-2xl p-4 border border-white/5 hover:border-emerald-500/20 transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Finaliza</span>
                                </div>
                                {formatDate(data.subscription_end)
                                    ? <p className="text-sm font-black text-white leading-tight">{formatDate(data.subscription_end)}</p>
                                    : <p className="text-xs font-mono text-slate-600">—</p>
                                }
                            </div>

                            <div className="glass rounded-2xl p-4 border border-white/5 hover:border-orange-500/20 transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/10 flex items-center justify-center">
                                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Lealtad</span>
                                </div>
                                <p className="text-sm font-black text-white">
                                    {data.months_subscribed}
                                    <span className="text-slate-500 font-normal text-xs ml-1">
                                        mes{data.months_subscribed !== 1 ? 'es' : ''}
                                    </span>
                                </p>
                            </div>

                            <div className="glass rounded-2xl p-4 border border-white/5 hover:border-violet-500/20 transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/10 flex items-center justify-center">
                                        <Award className="w-3.5 h-3.5 text-violet-400" />
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Rango</span>
                                </div>
                                <p className={`text-sm font-black ${rank.color}`}>
                                    {rank.emoji} {rank.label}
                                </p>
                            </div>

                        </div>

                        {/* ─── SETTINGS CARD ─────────────────────────────────── */}
                        {data.is_active && (
                            <div className="glass rounded-3xl border border-white/5 overflow-hidden">

                                {/* Toggle row */}
                                <div className="p-6 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                            data.auto_renew
                                                ? 'bg-neon/10 border border-neon/25'
                                                : 'bg-white/5 border border-white/8'
                                        }`}>
                                            <RefreshCw className={`w-4.5 h-4.5 transition-colors ${data.auto_renew ? 'text-neon' : 'text-slate-500'}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-black text-white uppercase tracking-wide mb-0.5">
                                                Aviso de Renovación
                                            </h3>
                                            <p className="text-[11px] font-mono text-slate-500 leading-relaxed">
                                                {data.auto_renew
                                                    ? 'Recibirás un email cuando tu plan esté próximo a expirar. Sin cargos automáticos.'
                                                    : `Sin avisos activos. Tu acceso finaliza el ${formatDate(data.subscription_end)}.`}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleToggleAutoRenew}
                                        disabled={toggling}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase border transition-all shrink-0 ${
                                            data.auto_renew
                                                ? 'bg-neon/10 border-neon/30 text-neon hover:bg-neon/15 hover:shadow-[0_0_20px_rgba(198,255,51,0.12)]'
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                                        }`}
                                    >
                                        {toggling ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : data.auto_renew ? (
                                            <><ToggleRight className="w-5 h-5" /> Activado</>
                                        ) : (
                                            <><ToggleLeft className="w-5 h-5" /> Desactivado</>
                                        )}
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-white/[0.05] mx-6" />

                                {/* Cancel row */}
                                <div className="p-6 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center shrink-0">
                                            <XCircle className="w-4.5 h-4.5 text-red-500/50" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-black text-red-400/70 uppercase tracking-wide mb-0.5">
                                                Cancelar Suscripción
                                            </h3>
                                            <p className="text-[11px] font-mono text-slate-600 leading-relaxed">
                                                Mantendrás el acceso hasta el {formatDate(data.subscription_end)}. No se realizará ningún cargo futuro.
                                            </p>
                                        </div>
                                    </div>
                                    {!showCancelConfirm ? (
                                        <button
                                            onClick={() => setShowCancelConfirm(true)}
                                            className="px-5 py-2.5 rounded-xl border border-red-500/15 text-red-500/60 hover:bg-red-500 hover:text-white hover:border-red-500 text-xs font-black uppercase transition-all shrink-0"
                                        >
                                            Cancelar
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">¿Confirmar?</span>
                                            <button
                                                onClick={handleCancelSubscription}
                                                disabled={cancelling}
                                                className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-red-700 transition-all disabled:opacity-60"
                                            >
                                                {cancelling ? 'Procesando...' : 'Sí, cancelar'}
                                            </button>
                                            <button
                                                onClick={() => setShowCancelConfirm(false)}
                                                className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all"
                                            >
                                                Volver
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ─── FOOTER ────────────────────────────────────────── */}
                        <div className="pt-1 pb-4 flex items-center justify-center gap-4 text-[10px] font-mono text-slate-700">
                            <span className="flex items-center gap-1.5">
                                <Shield className="w-3 h-3" /> Pagos cifrados vía Stripe
                            </span>
                            <span>·</span>
                            <span>Cancela en cualquier momento</span>
                        </div>

                    </div>
                )}
            </main>
        </div>
    )
}
