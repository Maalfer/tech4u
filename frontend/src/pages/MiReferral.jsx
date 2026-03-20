import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Gift, Copy, Check, Share2, Users, Trophy, Zap,
    ChevronRight, Star, RefreshCw, ExternalLink, Info,
    Crown, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── WhatsApp share icon ──────────────────────────────────────────────────────
const WhatsAppIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);

// ─── Status badge ─────────────────────────────────────────────────────────────
function ReferralStatusBadge({ status }) {
    const cfg = {
        confirmed: { label: 'Confirmado', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', icon: CheckCircle2 },
        pending:   { label: 'Pendiente',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/25',   icon: Clock },
        rejected:  { label: 'Rechazado',  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/25',       icon: XCircle },
        fraud:     { label: 'Fraude',     color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/25',     icon: XCircle },
    };
    const c = cfg[status] || cfg.pending;
    const Icon = c.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${c.bg} ${c.color}`}>
            <Icon size={10} />
            {c.label}
        </span>
    );
}

export default function MiReferral() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats]           = useState(null);
    const [loading, setLoading]       = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied]         = useState(false);
    const [error, setError]           = useState('');

    const loadStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/referrals/stats');
            setStats(res.data);
        } catch {
            setError('No se pudieron cargar las estadísticas de referidos.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    const generateCode = async () => {
        setGenerating(true);
        try {
            const res = await api.post('/referrals/generate-code');
            setStats(prev => ({ ...prev, referral_code: res.data.referral_code }));
        } catch {
            setError('No se pudo generar el código.');
        } finally {
            setGenerating(false);
        }
    };

    const copyCode = () => {
        if (!stats?.referral_code) return;
        const link = `https://tech4uacademy.es/?ref=${stats.referral_code}`;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
            if (typeof window.trackEvent === 'function') {
                window.trackEvent('referral_link_copied', { code: stats.referral_code });
            }
        });
    };

    const shareWhatsApp = () => {
        if (!stats?.referral_code) return;
        const link = `https://tech4uacademy.es/?ref=${stats.referral_code}`;
        const text = encodeURIComponent(
            `🚀 Únete a Tech4U Academy y domina la FP de ASIR con labs reales de Linux, SQL, redes y ciberseguridad.\n\nUsa mi enlace y obtendrás un 10% de descuento en tu primera suscripción:\n${link}`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
        if (typeof window.trackEvent === 'function') {
            window.trackEvent('referral_whatsapp_share', { code: stats.referral_code });
        }
    };

    const referralLink = stats?.referral_code
        ? `tech4uacademy.es/?ref=${stats.referral_code}`
        : null;

    // Progress to next free month
    const progress       = stats?.progress_to_free_month ?? 0;
    const nextAt         = stats?.next_free_month_at ?? 10;
    const progressPct    = Math.round((progress / nextAt) * 100);

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 overflow-y-auto">

                {/* Ambient glow */}
                <div className="fixed top-0 right-1/4 w-[500px] h-[400px] bg-violet-600/4 blur-[160px] rounded-full pointer-events-none -z-10" />
                <div className="fixed bottom-0 left-0 w-[400px] h-[300px] bg-fuchsia-600/3 blur-[150px] rounded-full pointer-events-none -z-10" />

                <PageHeader
                    title={<>Mi <span className="text-white">Programa</span> de Referidos</>}
                    subtitle="// Invita amigos · Gana descuentos · Acumula meses gratis"
                    Icon={Gift}
                    gradient="from-white via-violet-200 to-fuchsia-500"
                    iconColor="text-violet-400"
                    iconBg="bg-violet-500/20"
                    iconBorder="border-violet-500/30"
                    glowColor="bg-violet-500/20"
                />

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-mono text-xs">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6 max-w-4xl">

                        {/* ── How it works ── */}
                        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-7">
                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-5">Cómo funciona</p>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { step: '01', icon: Share2,     color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/25', title: 'Comparte tu enlace', desc: 'Envía tu enlace único a tus compañeros. Se aplica automáticamente al registrarse.' },
                                    { step: '02', icon: Users,      color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10 border-fuchsia-500/25', title: 'Pagan el plan mensual', desc: 'Por cada amigo que se suscriba, recibes 1 cupón del 10% (válido solo en plan mensual).' },
                                    { step: '03', icon: Trophy,     color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/25',  title: '10 referidos = 1 mes gratis', desc: 'Al llegar a 10 confirmados, los cupones del 10% se convierten en 1 mes 100% gratis.' },
                                ].map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.step} className="flex gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${item.bg}`}>
                                                <Icon className={`w-5 h-5 ${item.color}`} />
                                            </div>
                                            <div>
                                                <p className={`text-[9px] font-black uppercase tracking-widest font-mono ${item.color} mb-0.5`}>Paso {item.step}</p>
                                                <p className="font-black text-sm text-white mb-1">{item.title}</p>
                                                <p className="text-[11px] text-slate-500 font-mono leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Your referral link ── */}
                        <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-7">
                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-violet-400 mb-4">Tu enlace de referido</p>

                            {stats?.referral_code ? (
                                <>
                                    {/* Link display */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 font-mono text-sm text-white overflow-hidden">
                                            <ExternalLink className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                            <span className="truncate">{referralLink}</span>
                                        </div>

                                        <button
                                            onClick={copyCode}
                                            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border"
                                            style={copied
                                                ? { background: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.4)', color: '#4ade80' }
                                                : { background: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.4)', color: '#a78bfa' }
                                            }
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'Copiado' : 'Copiar'}
                                        </button>
                                    </div>

                                    {/* Code chip */}
                                    <div className="flex items-center gap-2 mb-5">
                                        <span className="text-[11px] font-mono text-slate-500">Código:</span>
                                        <span className="px-3 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 font-black font-mono tracking-widest text-sm">
                                            {stats.referral_code}
                                        </span>
                                    </div>

                                    {/* Share buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={shareWhatsApp}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] font-black text-xs uppercase tracking-wider transition-all hover:bg-[#25D366]/25"
                                        >
                                            <WhatsAppIcon size={16} />
                                            Compartir en WhatsApp
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-slate-400 font-mono text-sm mb-4">Aún no tienes un código de referido.</p>
                                    <button
                                        onClick={generateCode}
                                        disabled={generating}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider transition-all mx-auto"
                                    >
                                        {generating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
                                        Generar mi código
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Stats row ── */}
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Invitados',         value: stats?.total_sent ?? 0,               color: 'text-slate-300',   accent: 'border-white/10' },
                                { label: 'Pendientes',        value: stats?.pending ?? 0,                   color: 'text-amber-400',   accent: 'border-amber-500/20' },
                                { label: 'Confirmados',       value: stats?.confirmed ?? 0,                 color: 'text-emerald-400', accent: 'border-emerald-500/20' },
                                { label: 'Cupones 10% listos',value: stats?.pending_10p_discounts ?? 0,     color: 'text-violet-400',  accent: 'border-violet-500/20' },
                            ].map(stat => (
                                <div key={stat.label} className={`rounded-2xl border bg-white/[0.02] p-5 text-center ${stat.accent}`}>
                                    <div className={`text-3xl font-black font-mono ${stat.color} mb-1`}>{stat.value}</div>
                                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* ── Progress to free month ── */}
                        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.03] p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Crown className="w-5 h-5 text-amber-400" />
                                    <div>
                                        <p className="font-black text-white text-sm">Progreso hacia el Mes Gratis</p>
                                        <p className="text-[11px] font-mono text-slate-500">Cada 10 referidos confirmados = 1 mes de suscripción gratis</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-2xl font-mono text-amber-400">
                                        {progress}<span className="text-slate-600 text-lg">/{nextAt}</span>
                                    </div>
                                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">
                                        {stats?.free_months_accumulated ?? 0} meses acumulados
                                    </div>
                                </div>
                            </div>
                            <div className="relative h-2.5 rounded-full overflow-hidden bg-white/5">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${progressPct}%`,
                                        background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #fde68a)',
                                        boxShadow: '0 0 10px rgba(245,158,11,0.5)',
                                    }}
                                />
                            </div>
                            <div className="flex justify-between mt-1.5">
                                <span className="text-[10px] font-mono text-slate-600">{progress} confirmados</span>
                                <span className="text-[10px] font-mono text-amber-500/70">{nextAt - progress} para el siguiente mes gratis</span>
                            </div>
                        </div>

                        {/* ── Referrals list ── */}
                        {stats?.referrals?.length > 0 && (
                            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                                <div className="px-7 py-5 border-b border-white/[0.06]">
                                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Historial de referidos</p>
                                </div>
                                <div className="divide-y divide-white/[0.04]">
                                    {stats.referrals.map((r, i) => (
                                        <div key={r.id} className="flex items-center justify-between px-7 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-slate-500">
                                                    {String(i + 1).padStart(2, '0')}
                                                </div>
                                                <div>
                                                    <p className="font-mono text-xs text-slate-400">
                                                        {new Date(r.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                    {r.confirmed_at && (
                                                        <p className="font-mono text-[10px] text-emerald-500/70">
                                                            Confirmado: {new Date(r.confirmed_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <ReferralStatusBadge status={r.status} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Info note ── */}
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                            <p className="text-[11px] font-mono text-slate-500 leading-relaxed">
                                Los cupones del 10% son válidos <span className="text-white font-bold">solo para el plan mensual</span> y se usan en <span className="text-white font-bold">/suscripcion</span>.
                                Al acumular 10 referidos confirmados, los cupones del 10% se canjean automáticamente por <span className="text-amber-400 font-bold">1 mes gratis</span> (plan mensual).
                                Un referido se confirma cuando el invitado completa su primer pago.
                            </p>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
