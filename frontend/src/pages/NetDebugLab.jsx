import { useNavigate } from 'react-router-dom';
import {
    Stethoscope, Clock, Zap, ChevronRight, CheckCircle2,
    Lock, Star, Shield, TrendingUp, Flame, Sparkles, Network,
    Terminal, Cpu,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { SCENARIOS } from '../data/netDebugScenarios';

// ─── Hero intro ──────────────────────────────────────────────────────────────
function NetLabHero({ totalDone, totalScenarios, earnedPoints, totalPoints }) {
    const completedPct = totalScenarios > 0 ? Math.round((totalDone / totalScenarios) * 100) : 0;

    return (
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/[0.06]"
            style={{ background: 'linear-gradient(135deg, #110a00 0%, #1a0e00 40%, #0d0800 100%)' }}>

            {/* Animated grid */}
            <div className="absolute inset-0 opacity-[0.15]"
                style={{
                    backgroundImage: `linear-gradient(rgba(249,115,22,0.45) 1px, transparent 1px),
                                       linear-gradient(90deg, rgba(249,115,22,0.45) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }} />

            {/* Radial glows */}
            <div className="absolute top-0 left-1/4 w-96 h-64 rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.7) 0%, transparent 70%)', filter: 'blur(45px)' }} />
            <div className="absolute bottom-0 right-1/4 w-80 h-56 rounded-full opacity-15 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.5) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-40 opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(251,146,60,0.4) 0%, transparent 70%)', filter: 'blur(60px)' }} />

            {/* Content */}
            <div className="relative z-10 px-10 pt-12 pb-10">

                {/* Top badge row */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-orange-500/25 bg-orange-500/10 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">NetLab · Troubleshooting Guiado</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                        <Network className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] font-mono text-slate-500">Simulador sin ejecución real</span>
                    </div>
                </div>

                {/* Headline */}
                <div className="mb-8">
                    <h1 className="text-5xl font-black tracking-tight leading-none mb-4">
                        <span className="text-white">Aprende a diagnosticar</span>
                        <br />
                        <span className="text-transparent bg-clip-text"
                            style={{ backgroundImage: 'linear-gradient(90deg, #fb923c 0%, #f97316 40%, #ef4444 80%, #f43f5e 100%)' }}>
                            redes reales
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                        Simula fallos de red, lanza comandos Cisco IOS y Windows CLI, analiza las salidas e identifica la causa raíz.{' '}
                        <span className="text-slate-300 font-medium">Metodología OSI layer by layer.</span>
                    </p>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 mb-8 flex-wrap">
                    {[
                        { label: 'Labs',     value: totalScenarios, color: 'text-orange-400' },
                        { label: 'Niveles',  value: '3',            color: 'text-amber-400'  },
                        { label: 'Capas',    value: 'L1–L7',        color: 'text-rose-400'   },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
                            <span className={`text-xl font-black ${color}`}>{value}</span>
                            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
                        </div>
                    ))}

                    <div className="w-px h-8 bg-white/10 mx-1" />

                    {/* CLI keyword pills */}
                    {['show ip route', 'show vlan', 'ping', 'tracert', 'debug ip ospf'].map(cmd => (
                        <span key={cmd}
                            className="hidden lg:inline-flex px-2.5 py-1 rounded-lg text-[10px] font-mono font-black tracking-wide border border-orange-500/15 bg-orange-500/8 text-orange-400">
                            {cmd}
                        </span>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="max-w-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-orange-400" />
                            <span className="text-[11px] font-mono text-slate-400">Progreso Global</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-500">{totalDone} completados · {earnedPoints}/{totalPoints} pts</span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-black font-mono bg-orange-500/15 border border-orange-500/20 text-orange-400">
                                {completedPct}%
                            </span>
                        </div>
                    </div>
                    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(249,115,22,0.08)' }} />
                        <div className="h-full rounded-full transition-all duration-1000 ease-out relative"
                            style={{
                                width: `${completedPct}%`,
                                background: 'linear-gradient(90deg, #ea580c 0%, #f97316 40%, #fb923c 80%, #f43f5e 100%)',
                                boxShadow: '0 0 12px rgba(249,115,22,0.5)',
                            }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] font-mono text-slate-600">0%</span>
                        <span className="text-[10px] font-mono text-slate-600">100%</span>
                    </div>
                </div>
            </div>

            {/* Bottom edge line */}
            <div className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.4), rgba(239,68,68,0.4), transparent)' }} />
        </div>
    );
}

// ─── Difficulty config ────────────────────────────────────────────────────────
const DIFF_CONFIG = {
    facil: {
        label: 'Fácil',
        icon: Shield,
        accent: '#22c55e',
        accentRgb: '34,197,94',
        badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        cardHover: 'hover:border-emerald-500/35 hover:shadow-[0_0_36px_rgba(34,197,94,0.07)]',
        bar: 'from-emerald-500 to-green-400',
        sectionBg: 'rgba(34,197,94,0.03)',
        sectionBorder: 'rgba(34,197,94,0.14)',
        desc: 'IP, interfaces, gateways, VLANs básicas, puertos de acceso · Capas 1–3',
        labelColor: '#22c55e',
    },
    medio: {
        label: 'Medio',
        icon: TrendingUp,
        accent: '#f59e0b',
        accentRgb: '245,158,11',
        badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        cardHover: 'hover:border-amber-500/35 hover:shadow-[0_0_36px_rgba(245,158,11,0.07)]',
        bar: 'from-amber-500 to-yellow-400',
        sectionBg: 'rgba(245,158,11,0.03)',
        sectionBorder: 'rgba(245,158,11,0.14)',
        desc: 'Trunks, OSPF, ACLs, STP, DHCP relay, Inter-VLAN routing · Capas 2–4',
        labelColor: '#f59e0b',
    },
    dificil: {
        label: 'Difícil',
        icon: Flame,
        accent: '#f43f5e',
        accentRgb: '244,63,94',
        badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        cardHover: 'hover:border-rose-500/35 hover:shadow-[0_0_36px_rgba(244,63,94,0.07)]',
        bar: 'from-rose-500 to-pink-400',
        sectionBg: 'rgba(244,63,94,0.03)',
        sectionBorder: 'rgba(244,63,94,0.14)',
        desc: 'BGP, NAT, redistribución, HSRP, IPv6 · Expert',
        labelColor: '#f43f5e',
    },
};

const DIFFICULTIES = ['facil', 'medio', 'dificil'];

// ─── Scenario card ────────────────────────────────────────────────────────────
function ScenarioCard({ sc, completions, cfg }) {
    const navigate = useNavigate();
    const done     = !!completions[sc.id];
    const score    = completions[sc.id]?.score;

    return (
        <div
            onClick={() => navigate(`/netlab/${sc.id}`)}
            className={`group relative flex flex-col rounded-2xl border cursor-pointer
                transition-all duration-300 overflow-hidden hover:-translate-y-1
                ${done
                    ? 'bg-emerald-500/4 border-emerald-500/18 hover:border-emerald-400/35 hover:shadow-[0_0_30px_rgba(34,197,94,0.07)]'
                    : `bg-[#0c0c0c] border-white/5 ${cfg.cardHover}`
                }`}
        >
            {/* Top stripe */}
            <div className="h-[2px] w-full flex-shrink-0"
                style={{ background: done ? '#4ade80' : cfg.accent, opacity: done ? 1 : 0.5 }} />

            <div className="p-5 flex flex-col gap-3 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center font-black font-mono text-xs text-white flex-shrink-0">
                            {String(sc.num).padStart(2, '0')}
                        </div>
                        <span className={`font-mono text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${cfg.badge}`}>
                            {cfg.label}
                        </span>
                    </div>
                    {done
                        ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        : <div className="w-4 h-4 rounded-full border border-white/15 flex-shrink-0 mt-0.5" />
                    }
                </div>

                {/* Title */}
                <div>
                    <h3 className="font-black text-white text-[15px] uppercase italic tracking-tight leading-tight">
                        <span className="transition-colors duration-200"
                            style={{ '--tw-text-opacity': 1 }}
                            onMouseEnter={e => e.currentTarget.style.color = cfg.accent}
                            onMouseLeave={e => e.currentTarget.style.color = 'white'}
                        >
                            {sc.title}
                        </span>
                    </h3>
                    <p className="font-mono text-[10px] text-slate-600 mt-0.5 uppercase tracking-wider">{sc.category}</p>
                </div>

                {/* Symptom */}
                <p className="font-mono text-[11px] text-slate-500 leading-relaxed line-clamp-2 flex-1">
                    {sc.symptom}
                </p>

                {/* Footer */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 font-mono text-[10px] text-slate-600">
                                <Clock size={11} />
                                {sc.estimatedTime}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[10px] text-amber-500">
                                <Star size={11} />
                                {done ? `${score} / ${sc.points}` : `${sc.points} pts`}
                            </span>
                        </div>
                    </div>
                    {/* Botones de modo */}
                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/netlab/${sc.id}`); }}
                            className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-mono font-bold rounded-lg border border-white/10 bg-white/3 hover:bg-white/8 text-slate-300 hover:text-white transition-all"
                        >
                            <Stethoscope size={10} />
                            Guiado
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/netlab/cli/${sc.id}`); }}
                            className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-mono font-bold rounded-lg border transition-all"
                            style={{ borderColor: `${cfg.accent}40`, background: `${cfg.accent}10`, color: cfg.accent }}
                            onMouseEnter={e => e.currentTarget.style.background = `${cfg.accent}20`}
                            onMouseLeave={e => e.currentTarget.style.background = `${cfg.accent}10`}
                        >
                            <Terminal size={10} />
                            CLI
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Difficulty section block ─────────────────────────────────────────────────
function DifficultySection({ diffKey, completions }) {
    const cfg      = DIFF_CONFIG[diffKey];
    const Icon     = cfg.icon;
    const group    = SCENARIOS.filter(sc => sc.difficulty === diffKey);
    const done     = group.filter(sc => completions[sc.id]).length;
    const earned   = group.reduce((s, sc) => s + (completions[sc.id]?.score || 0), 0);
    const maxPts   = group.reduce((s, sc) => s + sc.points, 0);
    const pct      = group.length ? (done / group.length) * 100 : 0;

    return (
        <div className="rounded-3xl border overflow-hidden"
            style={{ background: cfg.sectionBg, borderColor: cfg.sectionBorder }}>

            {/* ── Section header ── */}
            <div className="px-7 py-6 flex items-center gap-5 border-b"
                style={{ borderColor: cfg.sectionBorder }}>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `rgba(${cfg.accentRgb},0.12)`, border: `1.5px solid rgba(${cfg.accentRgb},0.3)` }}>
                    <Icon size={26} style={{ color: cfg.accent }} />
                </div>

                {/* Title + desc */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                        <h2 className="font-black text-2xl uppercase italic tracking-tight"
                            style={{ color: cfg.accent }}>
                            {cfg.label}
                        </h2>
                        <span className="font-mono text-[11px] text-slate-600 uppercase tracking-wider">
                            {group.length} labs
                        </span>
                    </div>
                    <p className="font-mono text-xs text-slate-500 mt-0.5">{cfg.desc}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 flex-shrink-0">
                    <div className="text-right">
                        <div className="font-black text-3xl font-mono text-white">
                            {done}<span className="text-slate-700 font-normal text-xl">/{group.length}</span>
                        </div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-slate-600">completados</div>
                    </div>
                    <div className="text-right">
                        <div className="font-black text-3xl font-mono" style={{ color: cfg.accent }}>
                            {earned}<span className="text-slate-700 font-normal text-xl">/{maxPts}</span>
                        </div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-slate-600">puntos</div>
                    </div>
                </div>
            </div>

            {/* Progress bar (full width under header) */}
            <div className="h-[3px] w-full bg-white/4">
                <div className={`h-full bg-gradient-to-r ${cfg.bar} transition-all duration-700`}
                    style={{ width: `${pct}%` }} />
            </div>

            {/* ── Labs grid ── */}
            <div className="p-6 grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
                {group.map(sc => (
                    <ScenarioCard key={sc.id} sc={sc} completions={completions} cfg={cfg} />
                ))}
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NetDebugLab() {
    const completions  = JSON.parse(localStorage.getItem('netlab_completions') || '{}');
    const totalPoints  = SCENARIOS.reduce((s, sc) => s + sc.points, 0);
    const earnedPoints = SCENARIOS.reduce((s, sc) => s + (completions[sc.id]?.score || 0), 0);
    const totalDone    = SCENARIOS.filter(sc => completions[sc.id]).length;

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">

                {/* Ambient glows */}
                <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-orange-500/4 blur-[160px] rounded-full -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-red-600/4 blur-[150px] rounded-full -z-10 pointer-events-none" />

                <PageHeader
                    title={<>NetLab <span className="text-white">Troubleshooting</span></>}
                    subtitle="// Diagnóstico de Redes Guiado · 36 escenarios reales"
                    Icon={Stethoscope}
                    gradient="from-white via-orange-200 to-orange-500"
                    iconColor="text-orange-400"
                    iconBg="bg-orange-500/20"
                    iconBorder="border-orange-500/30"
                    glowColor="bg-orange-500/20"
                />

                {/* ── Hero intro ── */}
                <NetLabHero
                    totalDone={totalDone}
                    totalScenarios={SCENARIOS.length}
                    earnedPoints={earnedPoints}
                    totalPoints={totalPoints}
                />

                {/* ── Difficulty sections ── */}
                <div className="flex flex-col gap-7">
                    {DIFFICULTIES.map(d => (
                        <DifficultySection key={d} diffKey={d} completions={completions} />
                    ))}
                </div>

                {/* ── Scoring legend ── */}
                <div className="mt-10 p-5 rounded-2xl bg-white/2 border border-white/6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-4">Sistema de puntuación</p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {[
                            { icon: Zap,  color: 'text-amber-400',  title: 'Eficiencia en comandos',  desc: 'Cada comando extra más allá del camino óptimo resta puntos.' },
                            { icon: Lock, color: 'text-rose-400',   title: 'Pistas',                  desc: 'Cada pista usada reduce la puntuación final del lab.' },
                            { icon: Star, color: 'text-violet-400', title: 'Diagnóstico correcto',    desc: 'Identificar la causa raíz es el único camino a la puntuación máxima.' },
                        ].map(item => (
                            <div key={item.title} className="flex items-start gap-3">
                                <item.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${item.color}`} />
                                <div>
                                    <p className="font-mono text-xs font-bold text-white">{item.title}</p>
                                    <p className="font-mono text-[10px] text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}
