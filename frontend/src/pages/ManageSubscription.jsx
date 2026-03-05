import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CreditCard, CheckCircle, XCircle, RefreshCw, Calendar,
    Clock, Award, ChevronRight, AlertCircle, Zap, ToggleLeft, ToggleRight,
    ArrowLeft, Flame, ExternalLink
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

const PLAN_COLORS = {
    free: { badge: 'bg-slate-700/50 text-slate-400 border-slate-600/30', border: 'border-slate-700', glow: '' },
    monthly: { badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30', border: 'border-sky-500/30', glow: 'shadow-[0_0_30px_rgba(14,165,233,0.08)]' },
    quarterly: { badge: 'bg-neon/10 text-neon border-neon/30', border: 'border-neon/30', glow: 'shadow-[0_0_30px_rgba(198,255,51,0.10)]' },
    annual: { badge: 'bg-violet-500/10 text-violet-400 border-violet-500/30', border: 'border-violet-500/30', glow: 'shadow-[0_0_30px_rgba(139,92,246,0.10)]' },
}

function StatCard({ icon: Icon, iconColor, label, value, sub }) {
    return (
        <div className="glass rounded-2xl p-5 border border-white/5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-base font-black text-white">{value}</p>
                {sub && <p className="text-[10px] font-mono text-slate-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

function daysLeft(iso) {
    if (!iso) return null
    const diff = Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24))
    return diff
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
            setError('No se pudo cambiar la renovación automática.')
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

    const colors = data ? (PLAN_COLORS[data.subscription_type] || PLAN_COLORS.free) : PLAN_COLORS.free
    const days = data ? daysLeft(data.subscription_end) : null

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-amber-400" />
                            <h1 className="text-2xl font-black uppercase italic tracking-tight text-white">
                                Gestionar <span className="text-amber-400">Suscripción</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                            Información y configuración de tu plan
                        </p>
                    </div>
                </div>

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
                    <div className="max-w-[1400px] w-full mx-auto relative">
                        {/* Ambient glow */}
                        <div className={`absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none -z-10 ${data.is_active ? colors.badge.split(' ')[0] : 'bg-slate-800'}`} />

                        <div className="grid lg:grid-cols-12 gap-8">

                            {/* Left Column (Hero & Renew) */}
                            <div className="lg:col-span-5 flex flex-col gap-6">
                                {/* Plan hero card */}
                                <div className={`glass rounded-3xl p-8 border-2 ${colors.border} ${colors.glow} flex flex-col relative overflow-hidden h-full min-h-[320px]`}>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4 mb-8">
                                            <div>
                                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Entorno Actual</p>
                                                <h2 className="text-4xl lg:text-5xl font-black uppercase italic text-white mb-4 leading-none">{data.plan_label}</h2>
                                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-black font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-lg ${colors.badge}`}>
                                                    {data.is_active ? (
                                                        <><CheckCircle className="w-3.5 h-3.5" /> Suscripción Activa</>
                                                    ) : (
                                                        <><XCircle className="w-3.5 h-3.5" /> Sin Suscripción</>
                                                    )}
                                                </span>
                                            </div>
                                            <div className={`w-16 h-16 rounded-2xl bg-black/40 border-2 ${colors.border} flex items-center justify-center flex-shrink-0 shadow-xl relative`}>
                                                <div className="absolute inset-0 bg-white/5 rounded-2xl backdrop-blur-sm" />
                                                <CreditCard className="w-8 h-8 text-white relative z-10" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Days left bar */}
                                    {data.is_active && days !== null && (
                                        <div className="mt-auto">
                                            <div className="flex items-end justify-between text-[11px] font-mono mb-2">
                                                <span className="text-slate-400 uppercase tracking-widest">Integridad del Periodo</span>
                                                <div className="text-right">
                                                    <span className={`text-xl font-black ${days <= 7 ? 'text-red-400' : 'text-white'}`}>
                                                        {days > 0 ? days : 0}
                                                    </span>
                                                    <span className="text-slate-500 ml-1">días rest.</span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-black/50 rounded-full border border-white/5 overflow-hidden shadow-inner relative">
                                                {(() => {
                                                    const totalDays = data.subscription_type === 'monthly' ? 30 : data.subscription_type === 'quarterly' ? 90 : 365
                                                    const pct = Math.max(0, Math.min(100, (days / totalDays) * 100))
                                                    return (
                                                        <>
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" style={{ width: `${pct}%` }} />
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${days <= 7 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-neon to-cyan-400 shadow-[0_0_15px_rgba(198,255,51,0.4)]'}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </>
                                                    )
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-4">
                                    {!data.is_active ? (
                                        <button
                                            onClick={() => navigate('/suscripcion')}
                                            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-neon text-black font-black uppercase text-sm hover:shadow-[0_0_30px_rgba(198,255,51,0.3)] hover:scale-[1.01] transition-all col-span-2 group"
                                        >
                                            <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" /> Reactivar Plan de Combate
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => navigate('/suscripcion')}
                                                className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-neon/40 text-slate-300 hover:text-white font-black uppercase text-xs transition-all tracking-wider group hover:shadow-[0_0_20px_var(--neon-alpha-20)]"
                                            >
                                                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 text-neon" />
                                                Escalar Plan
                                            </button>
                                            <a
                                                href="mailto:soporte@tech4u.es"
                                                className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-red-500/40 text-slate-400 hover:text-red-400 font-black uppercase text-xs transition-all tracking-wider group hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:bg-red-500/5"
                                            >
                                                <ExternalLink className="w-5 h-5 group-hover:-translate-y-1 transition-transform group-hover:text-red-400" />
                                                Soporte
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Right Column (Stats & Config) */}
                            <div className="lg:col-span-7 flex flex-col gap-6">

                                {/* Stats grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col gap-2 relative overflow-hidden group hover:border-sky-500/30 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all"><Calendar className="w-16 h-16 text-sky-400" /></div>
                                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center relative z-10">
                                            <Calendar className="w-5 h-5 text-sky-400" />
                                        </div>
                                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-2 relative z-10">Despliegue Inicial</p>
                                        <p className="text-xl lg:text-2xl font-black text-white relative z-10">{formatDate(data.subscription_start)}</p>
                                    </div>

                                    <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col gap-2 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all"><Clock className="w-16 h-16 text-emerald-400" /></div>
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative z-10">
                                            <Clock className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-2 relative z-10">Ciclo Finaliza El</p>
                                        <p className="text-xl lg:text-2xl font-black text-white relative z-10 leading-tight">{formatDate(data.subscription_end)}</p>
                                        {days !== null && <p className={`text-[10px] font-mono relative z-10 ${days > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{days > 0 ? `Quedan ${days} días` : 'Expirado'}</p>}
                                    </div>

                                    <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col gap-2 relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all"><Flame className="w-16 h-16 text-orange-400" /></div>
                                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center relative z-10">
                                            <Flame className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-2 relative z-10">Racha de Lealtad</p>
                                        <p className="text-xl lg:text-2xl font-black text-white relative z-10">{data.months_subscribed} mes{data.months_subscribed !== 1 ? 'es' : ''}</p>
                                    </div>

                                    <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col gap-2 relative overflow-hidden group hover:border-violet-500/30 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all"><Award className="w-16 h-16 text-violet-400" /></div>
                                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center relative z-10">
                                            <Award className="w-5 h-5 text-violet-400" />
                                        </div>
                                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-2 relative z-10">Rango Comercial</p>
                                        <p className="text-xl lg:text-2xl font-black text-white relative z-10 truncate">
                                            {data.months_subscribed >= 12 ? '🏆 Premium' :
                                                data.months_subscribed >= 6 ? '⭐ Avanzado' :
                                                    data.months_subscribed >= 3 ? '🎯 Regular' :
                                                        data.months_subscribed >= 1 ? '🌱 Nuevo' : '—'}
                                        </p>
                                    </div>
                                </div>

                                {/* Auto-renew toggle */}
                                {data.is_active && (
                                    <div className="flex flex-col gap-4">
                                        <div className="glass rounded-3xl p-6 lg:p-8 border border-white/5 flex items-center justify-between gap-6 border-l-4 border-l-neon/50">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <RefreshCw className={`w-5 h-5 ${data.auto_renew ? 'text-neon animate-spin-slow' : 'text-slate-600'}`} />
                                                    <h3 className="font-black uppercase text-lg text-white tracking-wide">Renovación Automática</h3>
                                                </div>
                                                <p className="text-xs font-mono text-slate-400 leading-relaxed max-w-md">
                                                    {data.auto_renew
                                                        ? 'Mantenimiento ininterrumpido. El acceso se extenderá automáticamente al final del ciclo actual para que no pierdas privilegios.'
                                                        : 'Desactivada. Los sistemas cortarán el acceso a recursos vitales exactamente el ' + formatDate(data.subscription_end) + '.'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleToggleAutoRenew}
                                                disabled={toggling}
                                                className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase border transition-all shrink-0 ${data.auto_renew
                                                    ? 'bg-gradient-to-r from-neon/10 to-neon/5 border-neon/40 text-neon hover:border-neon hover:shadow-[0_0_20px_rgba(198,255,51,0.2)]'
                                                    : 'bg-black/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                                                    }`}
                                            >
                                                {toggling ? (
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                ) : data.auto_renew ? (
                                                    <><ToggleRight className="w-6 h-6 drop-shadow-[0_0_8px_var(--neon-alpha-80)]" /> Activada</>
                                                ) : (
                                                    <><ToggleLeft className="w-6 h-6" /> Desactivada</>
                                                )}
                                            </button>
                                        </div>

                                        {data.auto_renew && (
                                            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl flex items-center justify-between gap-6">
                                                <div>
                                                    <h4 className="text-sm font-black text-red-400 uppercase tracking-wide">Zona Crítica</h4>
                                                    <p className="text-[10px] font-mono text-slate-500 mt-1">Si cancelas la suscripción, dejarás de recibir cargos automáticos.</p>
                                                </div>
                                                {!showCancelConfirm ? (
                                                    <button
                                                        onClick={() => setShowCancelConfirm(true)}
                                                        className="px-6 py-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase transition-all"
                                                    >
                                                        Cancelar suscripción
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={handleCancelSubscription}
                                                            disabled={cancelling}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-red-700 transition-all"
                                                        >
                                                            {cancelling ? 'Sincronizando...' : 'Confirmar'}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowCancelConfirm(false)}
                                                            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase hover:bg-slate-700 transition-all"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info note */}
                        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-4 text-[10px] font-mono text-slate-500">
                            <span className="flex items-center gap-2"><CreditCard className="w-3.5 h-3.5" /> Pagos cifrados vía Stripe</span>
                            <span className="hidden sm:inline text-slate-700">•</span>
                            <span>Cancela suscripciones en cualquier momento</span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
