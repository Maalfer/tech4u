import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Hammer, AlertCircle, RefreshCw, ChevronRight, Trophy,
    Shield, Code2, Database, Wifi, Monitor, Cpu, Layers,
    Star, Sparkles, Terminal, ArrowLeft, Zap, Lock, Target,
    Crown, Calendar, Flame, BarChart3, Users, BookOpen, Swords,
    CheckCircle2, Clock, TrendingUp,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import SkillEngine from '../components/SkillEngine'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

// ─── Subject config ────────────────────────────────────────────────────────────
const SUBJECTS = [
    {
        key: 'general',
        label: 'Todos los temas',
        shortLabel: 'Todos',
        icon: Layers,
        accent: '#d946ef',
        accentRgb: '217,70,239',
        desc: 'Mezcla aleatoria de todas las asignaturas',
        topics: ['BD', 'Redes', 'SO', 'HW', 'Marcas'],
        dbKey: 'general',
    },
    {
        key: 'Bases de Datos',
        label: 'Bases de Datos',
        shortLabel: 'BBDD',
        icon: Database,
        accent: '#8b5cf6',
        accentRgb: '139,92,246',
        desc: 'SQL, modelado E-R, normalización, transacciones',
        topics: ['SQL', 'DDL/DML', 'JOIN', 'Índices', 'Triggers'],
        dbKey: 'base_de_datos',
    },
    {
        key: 'Redes',
        label: 'Redes',
        shortLabel: 'Redes',
        icon: Wifi,
        accent: '#0ea5e9',
        accentRgb: '14,165,233',
        desc: 'Modelo OSI, TCP/IP, subnetting, protocolos',
        topics: ['OSI', 'TCP/IP', 'VLAN', 'Routing', 'Subnetting'],
        dbKey: 'redes',
    },
    {
        key: 'Sistemas Operativos',
        label: 'Sistemas Operativos',
        shortLabel: 'SSOO',
        icon: Monitor,
        accent: '#22c55e',
        accentRgb: '34,197,94',
        desc: 'Linux, Windows, procesos, permisos, scripting',
        topics: ['Linux', 'Windows', 'Bash', 'Permisos', 'Procesos'],
        dbKey: 'sistemas_operativos',
    },
    {
        key: 'Fundamentos de Hardware',
        label: 'Fundamentos de Hardware',
        shortLabel: 'Hardware',
        icon: Cpu,
        accent: '#f97316',
        accentRgb: '249,115,22',
        desc: 'Arquitectura, componentes, ensamblaje, diagnóstico',
        topics: ['CPU', 'RAM', 'Almacenamiento', 'Buses', 'BIOS'],
        dbKey: 'hardware',
    },
    {
        key: 'Lenguaje de Marcas',
        label: 'Lenguaje de Marcas',
        shortLabel: 'Marcas',
        icon: Code2,
        accent: '#06b6d4',
        accentRgb: '6,182,212',
        desc: 'HTML, XML, CSS, JSON, validación de documentos',
        topics: ['HTML5', 'XML', 'CSS', 'JSON', 'DTD/XSD'],
        dbKey: 'programacion',
    },
]

const PLAN_LABELS = {
    free: { label: 'Gratis', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
    monthly: { label: 'Mensual', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
    quarterly: { label: 'Trimestral', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
    annual: { label: 'Anual', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
}

const DIFFICULTY_LABELS = {
    easy:   { label: 'Fácil',  color: '#22c55e', accentRgb: '34,197,94' },
    medium: { label: 'Medio',  color: '#f59e0b', accentRgb: '245,158,11' },
    hard:   { label: 'Difícil', color: '#ef4444', accentRgb: '239,68,68' },
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function SkillLabsHero({ totalXP, level, rankName, status }) {
    const plan = status?.plan || 'free'
    const planInfo = PLAN_LABELS[plan] || PLAN_LABELS.free
    const dailyUsed = status?.daily_used ?? 0
    const dailyRemaining = status?.daily_remaining   // null = unlimited
    const multiplier = status?.perks?.xp_multiplier ?? 1.0

    return (
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/[0.06]"
            style={{ background: 'linear-gradient(135deg, #0e0014 0%, #140020 40%, #09000f 100%)' }}>

            <div className="absolute inset-0 opacity-[0.14]"
                style={{
                    backgroundImage: `linear-gradient(rgba(217,70,239,0.45) 1px, transparent 1px),
                                       linear-gradient(90deg, rgba(217,70,239,0.45) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }} />

            <div className="absolute top-0 left-1/4 w-96 h-64 rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(217,70,239,0.7) 0%, transparent 70%)', filter: 'blur(45px)' }} />
            <div className="absolute bottom-0 right-1/4 w-80 h-56 rounded-full opacity-15 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.55) 0%, transparent 70%)', filter: 'blur(40px)' }} />

            <div className="relative z-10 px-10 pt-12 pb-10">
                {/* Badge row */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300">Skill Labs · Ensamblaje Interactivo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Plan badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                            style={{ background: planInfo.bg, borderColor: planInfo.border }}>
                            {plan === 'annual' && <Crown size={10} style={{ color: planInfo.color }} />}
                            <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: planInfo.color }}>
                                {planInfo.label}
                            </span>
                        </div>
                        {/* XP multiplier badge */}
                        {multiplier > 1 && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/10">
                                <Zap size={10} className="text-amber-400" />
                                <span className="text-[10px] font-black text-amber-400">×{multiplier} XP</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                            <Terminal className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-mono text-slate-500">{rankName} · Nv. {level}</span>
                        </div>
                    </div>
                </div>

                {/* Headline */}
                <div className="mb-8">
                    <h1 className="text-5xl font-black tracking-tight leading-none mb-4">
                        <span className="text-white">Pon a prueba tus</span>
                        <br />
                        <span className="text-transparent bg-clip-text"
                            style={{ backgroundImage: 'linear-gradient(90deg, #e879f9 0%, #a855f7 40%, #818cf8 80%, #60a5fa 100%)' }}>
                            conocimientos técnicos
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                        Ensambla definiciones, comandos y conceptos en su lugar exacto.{' '}
                        <span className="text-slate-300 font-medium">Sin tests tradicionales — lógica pura de diagnóstico.</span>
                    </p>
                </div>

                {/* Stats pills */}
                <div className="flex items-center gap-4 mb-8 flex-wrap">
                    {[
                        { label: 'Asignaturas', value: '6',           color: 'text-fuchsia-400' },
                        { label: 'XP acumulada', value: `${totalXP}`, color: 'text-amber-400'   },
                        ...(dailyRemaining !== null
                            ? [{ label: 'Sesiones restantes hoy', value: dailyRemaining, color: dailyRemaining === 0 ? 'text-rose-400' : 'text-emerald-400' }]
                            : [{ label: 'Sesiones hoy', value: '∞', color: 'text-emerald-400' }]
                        ),
                    ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
                            <span className={`text-xl font-black ${color}`}>{value}</span>
                            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
                        </div>
                    ))}
                    <div className="w-px h-8 bg-white/10 mx-1" />
                    {['BBDD', 'Redes', 'Linux', 'HTML', 'HW'].map(kw => (
                        <span key={kw}
                            className="hidden lg:inline-flex px-2.5 py-1 rounded-lg text-[10px] font-mono font-black tracking-wide border border-fuchsia-500/15 bg-fuchsia-500/8 text-fuchsia-400">
                            {kw}
                        </span>
                    ))}
                </div>

                {/* XP bar */}
                <div className="max-w-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-fuchsia-400" />
                            <span className="text-[11px] font-mono text-slate-400">XP Acumulada · Nivel {level}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black font-mono bg-fuchsia-500/15 border border-fuchsia-500/20 text-fuchsia-400">
                            {rankName}
                        </span>
                    </div>
                    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(217,70,239,0.08)' }} />
                        <div className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${Math.min((totalXP % 1000) / 10, 100)}%`,
                                background: 'linear-gradient(90deg, #a21caf 0%, #d946ef 40%, #a855f7 80%, #818cf8 100%)',
                                boxShadow: '0 0 12px rgba(217,70,239,0.5)',
                            }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] font-mono text-slate-600">Nivel {level}</span>
                        <span className="text-[10px] font-mono text-slate-600">Nivel {level + 1}</span>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(217,70,239,0.4), rgba(139,92,246,0.4), transparent)' }} />
        </div>
    )
}

// ─── Daily Challenge Card ──────────────────────────────────────────────────────
function DailyChallengeCard({ status, onStart }) {
    const canPlay    = status?.perks?.daily_challenge ?? false
    const alreadyDone = status?.daily_challenge_done ?? false
    const bonusXp   = status?.perks?.daily_bonus_xp ?? 0
    const today     = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

    return (
        <div className="relative rounded-3xl border overflow-hidden"
            style={{
                background: canPlay
                    ? 'radial-gradient(ellipse at 30% 20%, rgba(245,158,11,0.08) 0%, transparent 60%), #0c0c0c'
                    : '#0a0a0a',
                borderColor: canPlay ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.06)',
            }}>
            <div className="h-[2px] w-full"
                style={{ background: canPlay ? 'linear-gradient(90deg, transparent, rgba(245,158,11,1) 50%, transparent)' : 'rgba(255,255,255,0.05)' }} />

            <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: canPlay ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)', border: canPlay ? '1.5px solid rgba(245,158,11,0.3)' : '1.5px solid rgba(255,255,255,0.08)' }}>
                            {canPlay ? <Flame size={20} className="text-amber-400" /> : <Lock size={18} className="text-slate-600" />}
                        </div>
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Desafío Diario</p>
                            <h3 className="font-black text-sm text-white uppercase italic">Challenge del Día</h3>
                        </div>
                    </div>
                    {canPlay && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/25 bg-amber-500/10 flex-shrink-0">
                            <Zap size={9} className="text-amber-400" />
                            <span className="font-mono text-[10px] font-black text-amber-400">+{bonusXp} XP</span>
                        </div>
                    )}
                </div>

                {!canPlay ? (
                    <div>
                        <p className="font-mono text-[11px] text-slate-600 leading-relaxed mb-4">
                            El desafío diario está disponible desde el plan <span className="text-slate-400 font-bold">Mensual</span>.
                            5 ejercicios únicos, seeded por fecha — todos los usuarios ven el mismo challenge.
                        </p>
                        <div className="py-2.5 px-4 rounded-xl border border-white/5 bg-white/[0.02] font-mono text-[10px] text-slate-600 uppercase tracking-widest text-center">
                            Disponible en Plan Mensual o superior
                        </div>
                    </div>
                ) : alreadyDone ? (
                    <div>
                        <p className="font-mono text-[11px] text-slate-500 mb-3 capitalize">{today}</p>
                        <div className="flex items-center gap-2 py-3 px-4 rounded-xl border border-emerald-500/25 bg-emerald-500/8">
                            <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                            <span className="font-mono text-[11px] text-emerald-400 font-bold">Completado hoy — Vuelve mañana</span>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="font-mono text-[11px] text-slate-500 mb-4 capitalize">{today} · 5 ejercicios</p>
                        <button onClick={onStart}
                            className="w-full py-3 rounded-xl font-mono text-[11px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.01]"
                            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(234,88,12,0.8))', boxShadow: '0 0 20px rgba(245,158,11,0.25)' }}>
                            Iniciar Desafío
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Exam Mode Card ────────────────────────────────────────────────────────────
function ExamModeCard({ status, onStart }) {
    const canExam = status?.perks?.exam_mode ?? false

    return (
        <div className="relative rounded-3xl border overflow-hidden"
            style={{
                background: canExam
                    ? 'radial-gradient(ellipse at 30% 20%, rgba(239,68,68,0.07) 0%, transparent 60%), #0c0c0c'
                    : '#0a0a0a',
                borderColor: canExam ? 'rgba(239,68,68,0.22)' : 'rgba(255,255,255,0.06)',
            }}>
            <div className="h-[2px] w-full"
                style={{ background: canExam ? 'linear-gradient(90deg, transparent, rgba(239,68,68,0.8) 50%, transparent)' : 'rgba(255,255,255,0.05)' }} />

            <div className="p-6">
                <div className="flex items-start gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: canExam ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)', border: canExam ? '1.5px solid rgba(239,68,68,0.28)' : '1.5px solid rgba(255,255,255,0.08)' }}>
                        {canExam ? <Swords size={20} className="text-rose-400" /> : <Lock size={18} className="text-slate-600" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Modo Examen</p>
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center gap-1">
                                <Crown size={8} /> Anual
                            </span>
                        </div>
                        <h3 className="font-black text-sm text-white uppercase italic">Sin pistas · 20 preguntas</h3>
                    </div>
                </div>

                {!canExam ? (
                    <div>
                        <p className="font-mono text-[11px] text-slate-600 leading-relaxed mb-4">
                            20 ejercicios sin explicaciones, 4 por cada asignatura. Simula un examen oficial ASIR.
                            <span className="text-slate-500 font-bold"> Exclusivo Plan Anual.</span>
                        </p>
                        <div className="py-2.5 px-4 rounded-xl border border-white/5 bg-white/[0.02] font-mono text-[10px] text-slate-600 uppercase tracking-widest text-center">
                            Exclusivo Plan Anual
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="font-mono text-[11px] text-slate-500 mb-4">
                            4 preguntas × 6 asignaturas = 20 vectores. Sin explicaciones. ×2.0 XP.
                        </p>
                        <button onClick={onStart}
                            className="w-full py-3 rounded-xl font-mono text-[11px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.01]"
                            style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.85), rgba(190,18,60,0.75))', boxShadow: '0 0 20px rgba(239,68,68,0.2)' }}>
                            Iniciar Examen
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Leaderboard Panel ─────────────────────────────────────────────────────────
function LeaderboardPanel({ entries, weeklyXP }) {
    return (
        <div className="rounded-3xl border border-white/[0.06] overflow-hidden"
            style={{ background: '#0c0c0c' }}>
            <div className="h-[2px] w-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(217,70,239,0.6) 50%, transparent)' }} />
            <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-fuchsia-400" />
                        <h3 className="font-black text-sm text-white uppercase italic">Ranking Semanal</h3>
                    </div>
                    <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">XP esta semana</span>
                </div>

                {/* My XP */}
                <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl mb-4 border border-fuchsia-500/20 bg-fuchsia-500/8">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={12} className="text-fuchsia-400" />
                        <span className="font-mono text-[10px] text-fuchsia-300 font-bold uppercase">Mi XP semanal</span>
                    </div>
                    <span className="font-mono text-[11px] font-black text-fuchsia-400">+{weeklyXP}</span>
                </div>

                {entries.length === 0 ? (
                    <p className="font-mono text-[11px] text-slate-600 text-center py-4">Sin datos esta semana</p>
                ) : (
                    <div className="space-y-2">
                        {entries.map(entry => (
                            <div key={entry.user_id}
                                className="flex items-center gap-3 py-2 px-3 rounded-xl transition-colors"
                                style={{ background: entry.is_me ? 'rgba(217,70,239,0.06)' : 'transparent' }}>
                                <span className="font-mono text-[10px] font-black w-5 text-center"
                                    style={{ color: entry.position === 1 ? '#f59e0b' : entry.position === 2 ? '#94a3b8' : entry.position === 3 ? '#92400e' : '#475569' }}>
                                    {entry.position === 1 ? '🥇' : entry.position === 2 ? '🥈' : entry.position === 3 ? '🥉' : `#${entry.position}`}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-mono text-[11px] font-bold truncate" style={{ color: entry.is_me ? '#e879f9' : 'white' }}>
                                        {entry.username}{entry.is_me ? ' (tú)' : ''}
                                    </p>
                                    <p className="font-mono text-[9px] text-slate-600">{entry.rank} · Nv.{entry.level}</p>
                                </div>
                                <span className="font-mono text-[10px] font-black text-amber-400">+{entry.weekly_xp}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Subject Card ─────────────────────────────────────────────────────────────
function SubjectCard({ sub, mastery, allowedDifficulties, onClick }) {
    const Icon = sub.icon
    const masteryPct = mastery?.[sub.dbKey] ?? 0
    const allDiffs = ['easy', 'medium', 'hard']

    return (
        <button
            onClick={() => onClick(sub)}
            className="group relative flex flex-col rounded-3xl border cursor-pointer text-left
                transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
            style={{
                background: `radial-gradient(ellipse at 30% 20%, rgba(${sub.accentRgb},0.07) 0%, transparent 70%), #0c0c0c`,
                borderColor: `rgba(${sub.accentRgb},0.18)`,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = `rgba(${sub.accentRgb},0.45)`}
            onMouseLeave={e => e.currentTarget.style.borderColor = `rgba(${sub.accentRgb},0.18)`}
        >
            <div className="h-[2px] w-full flex-shrink-0 transition-opacity duration-300 group-hover:opacity-100 opacity-50"
                style={{ background: `linear-gradient(90deg, rgba(${sub.accentRgb},0) 0%, rgba(${sub.accentRgb},1) 50%, rgba(${sub.accentRgb},0) 100%)` }} />

            <div className="p-6 flex flex-col gap-4 flex-1">
                {/* Icon + title */}
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `rgba(${sub.accentRgb},0.1)`, border: `1.5px solid rgba(${sub.accentRgb},0.25)` }}>
                        <Icon size={22} style={{ color: sub.accent }} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="font-black text-white text-sm uppercase italic tracking-tight leading-tight transition-colors duration-200"
                            onMouseEnter={e => e.currentTarget.style.color = sub.accent}
                            onMouseLeave={e => e.currentTarget.style.color = 'white'}>
                            {sub.label}
                        </h3>
                        <p className="font-mono text-[10px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                            {sub.desc}
                        </p>
                    </div>
                </div>

                {/* Mastery bar */}
                {sub.key !== 'general' && (
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">Maestría</span>
                            <span className="font-mono text-[10px] font-black" style={{ color: sub.accent }}>{masteryPct}%</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${masteryPct}%`, background: `rgba(${sub.accentRgb},0.8)` }} />
                        </div>
                    </div>
                )}

                {/* Difficulty availability dots */}
                <div className="flex items-center gap-2">
                    {allDiffs.map(d => {
                        const unlocked = allowedDifficulties?.includes(d)
                        const dl = DIFFICULTY_LABELS[d]
                        return (
                            <div key={d} className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full"
                                    style={{ background: unlocked ? dl.color : 'rgba(255,255,255,0.1)' }} />
                                <span className="font-mono text-[9px]" style={{ color: unlocked ? dl.color : '#374151' }}>{dl.label}</span>
                            </div>
                        )
                    })}
                </div>

                {/* Topics */}
                <div className="flex flex-wrap gap-1.5">
                    {sub.topics.map(t => (
                        <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 rounded-md border"
                            style={{ color: sub.accent, borderColor: `rgba(${sub.accentRgb},0.25)`, background: `rgba(${sub.accentRgb},0.07)` }}>
                            {t}
                        </span>
                    ))}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                    <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">ASIR</span>
                    <div className="flex items-center gap-1 font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0"
                        style={{ color: sub.accent }}>
                        <span>Iniciar Lab</span>
                        <ChevronRight size={12} />
                    </div>
                </div>
            </div>
        </button>
    )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function SkillLabs() {
    const navigate  = useNavigate()
    const { user }  = useAuth()

    const [phase,              setPhase]              = useState('subjects')
    const [selectedSubject,    setSelectedSubject]    = useState(null)
    const [selectedDifficulty, setSelectedDifficulty] = useState('easy')
    const [exercises,          setExercises]          = useState([])
    const [results,            setResults]            = useState(null)
    const [stats,              setStats]              = useState(null)
    const [status,             setStatus]             = useState(null)
    const [leaderboard,        setLeaderboard]        = useState([])
    const [loading,            setLoading]            = useState(false)
    const [error,              setError]              = useState(null)
    // track mode flags for submit
    const [isDailyChallenge,   setIsDailyChallenge]   = useState(false)
    const [isExamMode,         setIsExamMode]         = useState(false)

    useEffect(() => {
        api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {})
        api.get('/skill-labs/status').then(r => setStatus(r.data)).catch(() => {})
        api.get('/skill-labs/leaderboard').then(r => setLeaderboard(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    }, [])

    const currentXP = stats?.current_xp || 0
    const rankName  = stats?.rank_name  || user?.rank_name || 'Estudiante'
    const userLevel = stats?.level      || user?.level     || 1

    const allowedDifficulties = status?.perks?.allowed_difficulties ?? ['easy']
    const canExam    = status?.perks?.exam_mode ?? false

    // ─ Handlers ─────────────────────────────────────────────────────────────
    const handleSelectSubject = (sub) => {
        setSelectedSubject(sub)
        setSelectedDifficulty(allowedDifficulties[0] ?? 'easy')
        setPhase('detail')
        setError(null)
        setIsDailyChallenge(false)
        setIsExamMode(false)
    }

    const startLab = async (opts = {}) => {
        setLoading(true)
        setError(null)
        const isDaily = !!opts.isDaily
        const isExam  = !!opts.isExam
        setIsDailyChallenge(isDaily)
        setIsExamMode(isExam)

        try {
            let exs
            if (isDaily) {
                const res = await api.get('/skill-labs/daily-challenge')
                exs = res.data.exercises
            } else if (isExam) {
                const res = await api.get('/skill-labs/exam-mode')
                exs = res.data.exercises
            } else {
                const res = await api.get('/skill-labs/exercises', {
                    params: {
                        subject: selectedSubject?.key,
                        difficulty: selectedDifficulty,
                        limit: 10,
                    },
                })
                exs = res.data
            }

            if (!exs || exs.length === 0) {
                setError('Aún no hay ejercicios para esta combinación.')
                setLoading(false)
                return
            }
            setExercises(exs)
            setPhase('running')
        } catch (err) {
            const msg = err?.response?.data?.detail || 'Fallo de conexión con el servidor.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleFinish = async (s) => {
        setLoading(true)
        try {
            const res = await api.post('/skill-labs/submit', {
                subject:           selectedSubject?.key || 'General',
                total_exercises:   s.total,
                correct_exercises: s.correct,
                failed_attempts:   s.mistakes,
                difficulty:        selectedDifficulty,
                is_daily_challenge: isDailyChallenge,
                is_exam_mode:      isExamMode,
            })
            setResults({ ...s, ...res.data })
            // refresh status after submit
            api.get('/skill-labs/status').then(r => setStatus(r.data)).catch(() => {})
            api.get('/skill-labs/leaderboard').then(r => setLeaderboard(Array.isArray(r.data) ? r.data : [])).catch(() => {})
        } catch {
            setResults(null)
        } finally {
            setLoading(false)
            setPhase('results')
        }
    }

    const handleReset = () => {
        setPhase('subjects')
        setSelectedSubject(null)
        setExercises([])
        setResults(null)
        setError(null)
        setIsDailyChallenge(false)
        setIsExamMode(false)
    }

    const sub = selectedSubject

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8">

                <PageHeader
                    title={<>Skill<span className="text-white">Labs</span></>}
                    subtitle={
                        phase === 'subjects' ? 'Ensamblaje y pruebas prácticas' :
                        phase === 'detail'   ? `Laboratorio · ${sub?.label}` :
                        phase === 'running'  ? (isExamMode ? 'Modo Examen en curso...' : isDailyChallenge ? 'Desafío Diario en curso...' : 'Ensamblaje en curso...') :
                                              'Reporte de síntesis'
                    }
                    Icon={Hammer}
                    gradient="from-white via-fuchsia-100 to-fuchsia-500"
                    iconColor="text-fuchsia-400"
                    iconBg="bg-fuchsia-500/20"
                    iconBorder="border-fuchsia-500/30"
                    glowColor="bg-fuchsia-500/20"
                />

                {/* ══ PHASE: SUBJECTS ══════════════════════════════════════════ */}
                {phase === 'subjects' && (
                    <div className="animate-in fade-in duration-500">

                        <SkillLabsHero
                            totalXP={currentXP}
                            level={userLevel}
                            rankName={rankName}
                            status={status}
                        />

                        {/* Section label */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px flex-1 bg-white/6" />
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/6">
                                <Hammer size={12} className="text-fuchsia-400" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-400">Elige un entorno de pruebas</span>
                            </div>
                            <div className="h-px flex-1 bg-white/6" />
                        </div>

                        {/* Main layout: grid + sidebar */}
                        <div className="flex flex-col xl:flex-row gap-7 items-start">

                            {/* Left: subject cards + special modes */}
                            <div className="flex-1 w-full space-y-7">
                                {/* Subject grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {SUBJECTS.map(s => (
                                        <SubjectCard
                                            key={s.key}
                                            sub={s}
                                            mastery={status?.mastery}
                                            allowedDifficulties={allowedDifficulties}
                                            onClick={handleSelectSubject}
                                        />
                                    ))}
                                </div>

                                {/* Special modes row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <DailyChallengeCard
                                        status={status}
                                        onStart={() => {
                                            setSelectedSubject({ key: 'General', label: 'Desafío Diario' })
                                            startLab({ isDaily: true })
                                        }}
                                    />
                                    <ExamModeCard
                                        status={status}
                                        onStart={() => {
                                            setSelectedSubject({ key: 'General', label: 'Modo Examen' })
                                            startLab({ isExam: true })
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Right: side panel */}
                            <div className="w-full xl:w-[300px] space-y-5 xl:sticky xl:top-8 shrink-0">

                                {/* Leaderboard */}
                                <LeaderboardPanel entries={leaderboard} weeklyXP={status?.weekly_xp ?? 0} />

                                {/* Info card */}
                                <div className="rounded-3xl border border-fuchsia-500/18 overflow-hidden"
                                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(217,70,239,0.06) 0%, transparent 70%), #0c0c0c' }}>
                                    <div className="h-[2px] w-full"
                                        style={{ background: 'linear-gradient(90deg, rgba(217,70,239,0), rgba(217,70,239,1) 50%, rgba(217,70,239,0))' }} />
                                    <div className="p-6">
                                        <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/25 flex items-center justify-center mb-4">
                                            <BookOpen size={18} className="text-fuchsia-400" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase italic text-white mb-4">¿Cómo funciona?</h3>
                                        <div className="space-y-3.5">
                                            {[
                                                { icon: Target, color: 'text-fuchsia-400', title: 'Ensamblaje activo', desc: 'Arrastra piezas al hueco correcto para reparar cada vector.' },
                                                { icon: Lock,   color: 'text-rose-400',    title: '3 intentos/vector', desc: 'Los fallos restan XP de la recompensa final.' },
                                                { icon: Zap,    color: 'text-amber-400',   title: 'XP instantánea',    desc: 'Tu plan define el multiplicador de XP aplicado.' },
                                            ].map(item => (
                                                <div key={item.title} className="flex items-start gap-3">
                                                    <item.icon size={13} className={`flex-shrink-0 mt-0.5 ${item.color}`} />
                                                    <div>
                                                        <p className="font-mono text-xs font-bold text-white">{item.title}</p>
                                                        <p className="font-mono text-[10px] text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ PHASE: DETAIL ════════════════════════════════════════════ */}
                {phase === 'detail' && sub && (
                    <div className="max-w-xl animate-in fade-in duration-400">

                        <button onClick={handleReset}
                            className="flex items-center gap-2 font-mono text-[11px] text-slate-500 hover:text-white transition-colors mb-6 group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            Volver a asignaturas
                        </button>

                        {/* Subject hero card */}
                        <div className="relative rounded-3xl border overflow-hidden mb-6 p-7 flex items-center gap-6"
                            style={{
                                background: `radial-gradient(ellipse at 20% 50%, rgba(${sub.accentRgb},0.1) 0%, transparent 60%), #0c0c0c`,
                                borderColor: `rgba(${sub.accentRgb},0.3)`,
                            }}>
                            <div className="h-[2px] absolute top-0 left-0 right-0"
                                style={{ background: `linear-gradient(90deg, transparent, rgba(${sub.accentRgb},1), transparent)` }} />
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                                style={{ background: `rgba(${sub.accentRgb},0.12)`, border: `1.5px solid rgba(${sub.accentRgb},0.3)` }}>
                                {sub.icon && <sub.icon size={30} style={{ color: sub.accent }} />}
                            </div>
                            <div>
                                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">Asignatura seleccionada</p>
                                <h2 className="text-2xl font-black italic uppercase text-white leading-tight">{sub.label}</h2>
                                <p className="font-mono text-[11px] text-slate-500 mt-1">{sub.desc}</p>
                            </div>
                        </div>

                        {/* Difficulty selector */}
                        {allowedDifficulties.length > 1 && (
                            <div className="mb-6">
                                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">Dificultad</p>
                                <div className="flex gap-2">
                                    {['easy', 'medium', 'hard'].map(d => {
                                        const dl = DIFFICULTY_LABELS[d]
                                        const unlocked = allowedDifficulties.includes(d)
                                        const active   = selectedDifficulty === d
                                        return (
                                            <button key={d}
                                                disabled={!unlocked}
                                                onClick={() => unlocked && setSelectedDifficulty(d)}
                                                className="flex-1 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wide border transition-all"
                                                style={{
                                                    borderColor: active ? dl.color : unlocked ? `rgba(${dl.accentRgb},0.2)` : 'rgba(255,255,255,0.06)',
                                                    background:  active ? `rgba(${dl.accentRgb},0.15)` : unlocked ? `rgba(${dl.accentRgb},0.05)` : 'rgba(255,255,255,0.02)',
                                                    color: active ? dl.color : unlocked ? dl.color : '#374151',
                                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                                }}>
                                                {!unlocked && <Lock size={9} className="inline mr-1" />}
                                                {dl.label}
                                            </button>
                                        )
                                    })}
                                </div>
                                {/* Plan hint for locked difficulties */}
                                {!allowedDifficulties.includes('hard') && (
                                    <p className="font-mono text-[10px] text-slate-600 mt-2">
                                        {!allowedDifficulties.includes('medium')
                                            ? 'Dificultad media y difícil requieren plan Mensual o superior.'
                                            : 'Dificultad difícil requiere plan Trimestral o superior.'}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Info box */}
                        <div className="rounded-2xl border p-5 mb-6"
                            style={{ background: `rgba(${sub.accentRgb ?? '217,70,239'},0.04)`, borderColor: `rgba(${sub.accentRgb ?? '217,70,239'},0.18)` }}>
                            <p className="font-mono text-xs text-slate-400 leading-relaxed">
                                El sistema presentará definiciones con componentes sustraídos.
                                Arrastra y ensambla las piezas en los huecos correctos.
                                <br /><br />
                                <span className="font-bold" style={{ color: sub.accent || '#d946ef' }}>Regla Estricta:</span>
                                {' '}Tienes <span className="text-white font-bold">3 intentos</span> por compilación.
                                Los fallos restan XP de tu recompensa. Multiplicador activo: ×{status?.perks?.xp_multiplier ?? 1.0}
                            </p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 font-mono text-[11px] text-orange-400 bg-orange-400/5 border border-orange-400/20 rounded-xl p-4 mb-5 uppercase tracking-wider">
                                <AlertCircle size={15} className="flex-shrink-0" /> {error}
                            </div>
                        )}

                        <button
                            onClick={() => startLab()}
                            disabled={loading}
                            className="w-full py-5 rounded-2xl font-black uppercase italic tracking-[0.15em] transition-all flex items-center justify-center gap-3 text-sm text-white hover:scale-[1.01] hover:-translate-y-0.5"
                            style={{
                                background: `linear-gradient(135deg, rgba(${sub.accentRgb ?? '217,70,239'},0.9), rgba(${sub.accentRgb ?? '217,70,239'},0.7))`,
                                boxShadow: loading ? 'none' : `0 0 32px rgba(${sub.accentRgb ?? '217,70,239'},0.3)`,
                            }}
                        >
                            {loading
                                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <><Hammer size={18} /> Iniciar Laboratorio</>
                            }
                        </button>
                    </div>
                )}

                {/* ══ PHASE: RUNNING ═══════════════════════════════════════════ */}
                {phase === 'running' && (
                    <div className="min-h-[70vh] rounded-[3rem] p-10 relative overflow-hidden flex flex-col items-center justify-center border"
                        style={{
                            background: isExamMode
                                ? 'linear-gradient(135deg, #0f0000 0%, #06000e 50%, #0a000a 100%)'
                                : isDailyChallenge
                                    ? 'linear-gradient(135deg, #0a0600 0%, #06000e 50%, #0a0a00 100%)'
                                    : 'linear-gradient(135deg, #0e0018 0%, #06000e 50%, #0a0012 100%)',
                            borderColor: isExamMode ? 'rgba(239,68,68,0.2)' : isDailyChallenge ? 'rgba(245,158,11,0.2)' : 'rgba(168,85,247,0.15)',
                        }}>
                        {/* Mode banner */}
                        {(isExamMode || isDailyChallenge) && (
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full border"
                                style={{
                                    borderColor: isExamMode ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)',
                                    background: isExamMode ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                }}>
                                {isExamMode ? <Swords size={12} className="text-rose-400" /> : <Flame size={12} className="text-amber-400" />}
                                <span className="font-mono text-[10px] font-black uppercase tracking-widest"
                                    style={{ color: isExamMode ? '#f87171' : '#fbbf24' }}>
                                    {isExamMode ? 'Modo Examen — Sin pistas' : 'Desafío Diario'}
                                </span>
                            </div>
                        )}
                        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] blur-[180px] rounded-full opacity-[0.05] pointer-events-none"
                            style={{ background: isExamMode ? '#ef4444' : isDailyChallenge ? '#f59e0b' : '#9333ea' }} />
                        <div className="relative z-10 w-full max-w-4xl">
                            <SkillEngine exercises={exercises} onFinish={handleFinish} />
                        </div>
                    </div>
                )}

                {/* ══ PHASE: RESULTS ═══════════════════════════════════════════ */}
                {phase === 'results' && results && (
                    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-8 duration-600">
                        <div className="rounded-[2rem] border border-white/5 overflow-hidden" style={{ background: '#0c0c0c' }}>
                            <div className="h-[3px] w-full"
                                style={{ background: 'linear-gradient(90deg, #a21caf, #d946ef, #a855f7, #818cf8)' }} />

                            <div className="p-12 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-fuchsia-500/10 border border-fuchsia-500/25 flex items-center justify-center">
                                    <Trophy size={36} className="text-fuchsia-400" />
                                </div>

                                <h2 className="text-4xl font-black text-white uppercase italic mb-1">
                                    {isExamMode ? 'Examen Completado' : isDailyChallenge ? '¡Desafío Superado!' : 'Pruebas Finalizadas'}
                                </h2>
                                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.4em] mb-10">Reporte de Laboratorio</p>

                                {/* XP multiplier pill */}
                                {(results.xp_multiplier ?? 1) > 1 && (
                                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-amber-500/25 bg-amber-500/10">
                                        <Zap size={12} className="text-amber-400" />
                                        <span className="font-mono text-[11px] font-black text-amber-400">
                                            Multiplicador ×{results.xp_multiplier} aplicado
                                        </span>
                                    </div>
                                )}

                                {/* Stats grid */}
                                <div className="grid grid-cols-4 gap-4 mb-10">
                                    {[
                                        { label: 'Completados', value: results.total,           color: '#d946ef' },
                                        { label: 'Sin Fallos',  value: results.correct,         color: '#22c55e' },
                                        { label: 'Errores',     value: results.mistakes,        color: '#f43f5e' },
                                        { label: 'XP Obtenida', value: `+${results.xp_gained}`, color: '#60a5fa' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="rounded-2xl border border-white/5 bg-white/[0.02] py-7 flex flex-col items-center gap-1">
                                            <p className="text-3xl font-black font-mono" style={{ color }}>{value}</p>
                                            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">{label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Perfect run banner */}
                                {results.is_perfect && (
                                    <div className="mb-6 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/8 flex items-center justify-center gap-3">
                                        <CheckCircle2 size={20} className="text-emerald-400" />
                                        <span className="font-mono text-sm font-black text-emerald-400 uppercase">¡Ejecución perfecta! Sin errores.</span>
                                        <CheckCircle2 size={20} className="text-emerald-400" />
                                    </div>
                                )}

                                {/* Level up banner */}
                                {results.leveled_up && (
                                    <div className="mb-6 p-5 rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/6 flex items-center justify-center gap-4">
                                        <Star size={24} className="text-fuchsia-400" />
                                        <div className="text-left">
                                            <p className="font-mono text-[10px] text-fuchsia-400 uppercase tracking-widest font-bold">¡Subida de nivel!</p>
                                            <h3 className="text-xl font-black italic text-white uppercase">Has alcanzado el Nivel {results.new_level}</h3>
                                        </div>
                                        <Star size={24} className="text-fuchsia-400" />
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-4 justify-center flex-wrap">
                                    <button
                                        onClick={() => {
                                            setResults(null);
                                            startLab();
                                        }}
                                        className="px-8 py-3.5 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl font-mono text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 text-white">
                                        <RefreshCw size={14} /> Siguiente ejercicio
                                    </button>
                                    <button onClick={handleReset}
                                        className="px-8 py-3.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:-translate-y-0.5"
                                        style={{ background: 'linear-gradient(135deg, #a21caf, #d946ef)', boxShadow: '0 0 24px rgba(217,70,239,0.3)' }}>
                                        Seleccionar asignatura
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}
