import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Terminal as TerminalIcon,
    Play,
    Lock,
    CheckCircle,
    Clock,
    Zap,
    ChevronRight,
    Search,
    Filter,
    HardDrive,
    ShieldCheck,
    Cpu,
    Network,
    ArrowLeft,
    Crown,
    Sparkles,
    BookOpen,
    FlaskConical,
    Star,
    CheckCircle2,
    Layers,
    Target,
    Trophy,
    Flame,
    BarChart3,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PathCoverComponent, ModuleCoverSVG } from '../components/LabCovers';

const CATEGORY_ICONS = {
    'Sistemas':   HardDrive,
    'Redes':      Network,
    'Seguridad':  ShieldCheck,
    'Hardware':   Cpu,
    'Linux':      TerminalIcon,
};

// Neon lime accent
const NEON = '#c6ff33';
const NEON_RGB = '198,255,51';


// ── Hero ──────────────────────────────────────────────────────────────────────
function TerminalSkillsHero({ skillPaths, user }) {
    const totalPaths = skillPaths.length;
    const subType    = user?.subscription_type || 'free';
    const planLabel  = subType === 'annual'    ? 'Plan Anual'
                     : subType === 'quarterly' ? 'Plan Trimestral'
                     : 'Plan Premium';

    return (
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/[0.07]"
            style={{ background: 'linear-gradient(135deg, #030d03 0%, #061506 50%, #030a03 100%)' }}>

            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.1]"
                style={{
                    backgroundImage: `linear-gradient(rgba(${NEON_RGB},0.6) 1px, transparent 1px),
                                       linear-gradient(90deg, rgba(${NEON_RGB},0.6) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }} />

            {/* Scan line */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)',
                }} />

            {/* Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-80 rounded-full opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(ellipse, rgba(${NEON_RGB},0.8) 0%, transparent 70%)`, filter: 'blur(55px)' }} />
            <div className="absolute bottom-0 right-1/4 w-96 h-60 rounded-full opacity-10 pointer-events-none"
                style={{ background: `radial-gradient(ellipse, rgba(${NEON_RGB},0.6) 0%, transparent 70%)`, filter: 'blur(50px)' }} />
            <div className="absolute top-1/2 right-8 w-80 h-64 rounded-full opacity-8 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.4) 0%, transparent 70%)', filter: 'blur(65px)' }} />

            {/* Bottom edge */}
            <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: `linear-gradient(90deg, transparent, rgba(${NEON_RGB},0.4), transparent)` }} />

            <div className="relative z-10 px-10 pt-12 pb-11">
                {/* Badge row */}
                <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-sm"
                            style={{ borderColor: `rgba(${NEON_RGB},0.25)`, background: `rgba(${NEON_RGB},0.1)` }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: NEON }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: NEON }}>
                                Terminal Skills · Labs Interactivos
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                            <TerminalIcon size={10} style={{ color: NEON }} />
                            <span className="text-[10px] font-mono text-slate-500">Entorno Real · Linux</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                        style={{ background: `rgba(${NEON_RGB},0.08)`, borderColor: `rgba(${NEON_RGB},0.25)` }}>
                        {subType === 'annual' && <Crown size={10} style={{ color: NEON }} />}
                        <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: NEON }}>{planLabel}</span>
                    </div>
                </div>

                {/* Headline */}
                <div className="mb-7">
                    <h1 className="text-6xl font-black tracking-tight leading-none mb-4">
                        <span className="text-white">Domina la</span>
                        <br />
                        <span className="text-transparent bg-clip-text"
                            style={{ backgroundImage: `linear-gradient(90deg, ${NEON} 0%, #78ff78 45%, ${NEON} 80%, #a3e635 100%)` }}>
                            Terminal Linux
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                        Laboratorios interactivos con entorno real.{' '}
                        <span className="text-slate-300 font-medium">Practica comandos, scripting Bash y administración de sistemas Linux.</span>
                    </p>
                </div>

                {/* Stats pills */}
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                    {[
                        { label: 'Rutas de aprendizaje', value: totalPaths, color: NEON },
                        { label: 'Laboratorios reales',  value: '∞',        color: '#34d399' },
                        { label: 'XP por lab',           value: '150+',     color: '#fbbf24' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
                            <span className="text-xl font-black" style={{ color }}>{value}</span>
                            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
                        </div>
                    ))}

                    <div className="w-px h-8 bg-white/10 mx-1" />

                    {['Linux', 'Bash', 'Scripting', 'Storage', 'Permisos'].map(tag => (
                        <span key={tag} className="hidden lg:inline-flex px-2.5 py-1 rounded-lg text-[10px] font-mono font-black tracking-wide border"
                            style={{ borderColor: `rgba(${NEON_RGB},0.15)`, background: `rgba(${NEON_RGB},0.08)`, color: NEON }}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Drill-down section header ─────────────────────────────────────────────────
function SectionHeader({ label, title, subtitle, pathTitle, onBack }) {
    return (
        <div className="relative rounded-3xl border overflow-hidden mb-8"
            style={{
                background: `linear-gradient(135deg, #030d03 0%, #060e06 100%)`,
                borderColor: `rgba(${NEON_RGB},0.2)`,
            }}>

            {/* Top bar */}
            <div className="h-[2px] w-full"
                style={{ background: `linear-gradient(90deg, transparent, rgba(${NEON_RGB},1) 40%, rgba(${NEON_RGB},0.5) 70%, transparent)` }} />

            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage: `linear-gradient(rgba(${NEON_RGB},0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(${NEON_RGB},0.6) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }} />

            {/* Glow */}
            <div className="absolute top-0 left-0 w-[40%] h-full pointer-events-none opacity-15"
                style={{ background: `radial-gradient(ellipse at 15% 50%, rgba(${NEON_RGB},0.8) 0%, transparent 70%)`, filter: 'blur(50px)' }} />

            {/* SVG cover art as subtle right-side background */}
            {pathTitle && (
                <div className="absolute right-0 top-0 bottom-0 w-[35%] pointer-events-none overflow-hidden">
                    <div className="w-full h-full opacity-20">
                        <PathCoverComponent pathTitle={pathTitle} />
                    </div>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #030d03 15%, transparent 100%)' }} />
                </div>
            )}

            <div className="relative z-10 px-10 py-8 flex items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: NEON }} />
                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">{label}</span>
                    </div>
                    <h2 className="text-3xl font-black italic uppercase text-white leading-none tracking-tight mb-2">{title}</h2>
                    {subtitle && <p className="font-mono text-[11px] text-slate-500">{subtitle}</p>}
                </div>
                <button onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all font-mono text-[11px] text-slate-400 hover:text-white flex-shrink-0 group">
                    <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                    Volver
                </button>
            </div>
        </div>
    );
}

// ── Skill Path Card ───────────────────────────────────────────────────────────
function PathCard({ path, onClick }) {
    return (
        <div onClick={() => onClick(path)}
            className="group relative overflow-hidden cursor-pointer transition-all duration-500 rounded-[2rem]"
            style={{ aspectRatio: '4/5', boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)' }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 20px 60px rgba(${NEON_RGB},0.2), 0 0 0 1px rgba(${NEON_RGB},0.4)`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)';
            }}>

            {/* SVG Cover art */}
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]">
                <PathCoverComponent pathTitle={path.title} />
            </div>

            {/* Bottom gradient overlay */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.05) 100%)' }} />

            {/* Hover neon overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 30% 85%, rgba(${NEON_RGB},0.07) 0%, transparent 65%)` }} />

            {/* Top neon bar on hover */}
            <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, rgba(${NEON_RGB},1) 50%, transparent)` }} />

            {/* Module count badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm"
                style={{ background: 'rgba(0,0,0,0.7)' }}>
                <TerminalIcon size={10} style={{ color: NEON }} />
                <span className="font-mono text-[9px] text-white font-bold">{path.modules?.length || 0} módulos</span>
            </div>

            {/* Bottom content */}
            <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] mb-2 block font-bold" style={{ color: NEON }}>
                    Skill Path
                </span>
                <h3 className="text-[1.35rem] font-black uppercase italic leading-tight tracking-tighter mb-2.5 text-white transition-colors duration-200 group-hover:text-[#c6ff33]">
                    {path.title}
                </h3>
                {path.description && (
                    <p className="text-slate-400 text-[10px] font-mono line-clamp-2 mb-5 uppercase leading-relaxed">
                        {path.description}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500 uppercase tracking-wider">
                        <Zap size={9} style={{ color: NEON }} />
                        <span>ASIR · Linux</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-black font-black transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]"
                        style={{ background: NEON, boxShadow: `0 0 20px rgba(${NEON_RGB},0.4)` }}>
                        <ChevronRight size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Module Card ───────────────────────────────────────────────────────────────
function ModuleCard({ module, idx, pathTitle, onClick }) {
    return (
        <div onClick={() => onClick(module)}
            className="group relative overflow-hidden cursor-pointer transition-all duration-500 rounded-[2rem]"
            style={{ aspectRatio: '4/5', boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)' }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 20px 60px rgba(${NEON_RGB},0.2), 0 0 0 1px rgba(${NEON_RGB},0.4)`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)';
            }}>

            {/* SVG Cover art — unique per module index */}
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]">
                <ModuleCoverSVG index={idx} />
            </div>

            {/* Bottom gradient */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.05) 100%)' }} />

            {/* Hover neon */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 30% 85%, rgba(${NEON_RGB},0.07) 0%, transparent 65%)` }} />

            {/* Top neon bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, rgba(${NEON_RGB},1) 50%, transparent)` }} />

            {/* Module index badge */}
            <div className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 rounded-2xl border border-white/20 backdrop-blur-sm font-black font-mono text-sm"
                style={{ background: `rgba(${NEON_RGB},0.15)`, color: NEON, boxShadow: `0 0 12px rgba(${NEON_RGB},0.2)` }}>
                M{idx + 1}
            </div>

            {/* Bottom content */}
            <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] mb-2 block font-bold" style={{ color: NEON }}>
                    Módulo
                </span>
                <h3 className="text-[1.3rem] font-black uppercase italic leading-tight tracking-tighter mb-2.5 text-white transition-colors duration-200 group-hover:text-[#c6ff33]">
                    {module.title}
                </h3>
                {module.description && (
                    <p className="text-slate-400 text-[10px] font-mono line-clamp-2 mb-5 uppercase leading-relaxed">
                        {module.description}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500 uppercase tracking-wider">
                        <Zap size={9} style={{ color: NEON }} />
                        <span>Click para ver labs</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-black font-black transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]"
                        style={{ background: NEON, boxShadow: `0 0 20px rgba(${NEON_RGB},0.4)` }}>
                        <ChevronRight size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Lab Card ──────────────────────────────────────────────────────────────────
function LabCard({ lab, idx, user, onStart }) {
    const Icon = CATEGORY_ICONS[lab.category] || TerminalIcon;
    const isFree = idx < 2;
    const isLockedByProgress = !lab.is_unlocked;
    const isLockedByPaywall  = !isFree && !['quarterly', 'annual', 'lifetime'].includes(user?.subscription_type);
    const isLocked           = isLockedByProgress || isLockedByPaywall;
    const isCompleted        = lab.is_completed;
    const isNext             = lab.is_unlocked && !lab.is_completed && !isLockedByPaywall;

    const statusColor = isCompleted ? '#34d399'
                      : isNext      ? NEON
                      : '#475569';
    const statusRgb   = isCompleted ? '52,211,153'
                      : isNext      ? NEON_RGB
                      : '71,85,105';

    return (
        <div onClick={() => !isLocked && onStart(lab)}
            className="group relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-300"
            style={{
                background: isCompleted
                    ? 'radial-gradient(ellipse at 0% 0%, rgba(52,211,153,0.06) 0%, transparent 60%), #070f0b'
                    : isNext
                    ? `radial-gradient(ellipse at 0% 0%, rgba(${NEON_RGB},0.06) 0%, transparent 60%), #07100a`
                    : 'rgba(255,255,255,0.02)',
                borderColor: isCompleted ? 'rgba(52,211,153,0.2)'
                           : isNext      ? `rgba(${NEON_RGB},0.25)`
                           : 'rgba(255,255,255,0.07)',
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLockedByProgress ? 0.5 : 1,
            }}
            onMouseEnter={e => {
                if (!isLocked) {
                    e.currentTarget.style.borderColor = `rgba(${statusRgb},0.5)`;
                    e.currentTarget.style.boxShadow = `0 8px 40px rgba(${statusRgb},0.12)`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }
            }}
            onMouseLeave={e => {
                if (!isLocked) {
                    e.currentTarget.style.borderColor = isCompleted ? 'rgba(52,211,153,0.2)'
                                                       : isNext     ? `rgba(${NEON_RGB},0.25)`
                                                       : 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'none';
                }
            }}>

            {/* Top color bar */}
            <div className="h-[2px] w-full"
                style={{ background: `linear-gradient(90deg, transparent, rgba(${statusRgb},${isLocked ? '0.1' : '0.7'}), transparent)` }} />

            <div className="p-7 flex-1 flex flex-col">
                {/* Header row */}
                <div className="flex items-start justify-between mb-5 gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Category badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider"
                            style={isLocked ? {
                                background: 'rgba(255,255,255,0.03)',
                                borderColor: 'rgba(255,255,255,0.06)',
                                color: '#475569',
                            } : {
                                background: `rgba(${NEON_RGB},0.08)`,
                                borderColor: `rgba(${NEON_RGB},0.2)`,
                                color: NEON,
                            }}>
                            <Icon size={9} />
                            {lab.category}
                        </div>

                        {/* Free badge */}
                        {isFree && !['quarterly', 'annual', 'lifetime'].includes(user?.subscription_type) && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                                Gratis
                            </span>
                        )}

                        {/* Paywall badge */}
                        {isLockedByPaywall && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-wider">
                                <Lock size={8} /> Premium
                            </span>
                        )}
                    </div>

                    {/* Status */}
                    {isCompleted && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                            <CheckCircle2 size={10} className="text-emerald-400" />
                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Hecho</span>
                        </div>
                    )}
                    {isNext && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0 border"
                            style={{ background: `rgba(${NEON_RGB},0.1)`, borderColor: `rgba(${NEON_RGB},0.25)` }}>
                            <Zap size={9} style={{ color: NEON }} />
                            <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: NEON }}>Siguiente</span>
                        </div>
                    )}
                    {isLockedByProgress && (
                        <Lock size={14} className="text-slate-700 flex-shrink-0" />
                    )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-black uppercase italic leading-tight tracking-tight mb-3 transition-colors duration-200"
                    style={{ color: isLocked ? '#475569' : 'white' }}>
                    {lab.title}
                </h3>

                {/* Description */}
                <p className="font-mono text-[10px] leading-relaxed flex-1 mb-6"
                    style={{ color: isLocked ? '#374151' : '#94a3b8' }}>
                    {(lab.description || '').replace(/[#*]/g, '').slice(0, 160)}{lab.description?.length > 160 ? '…' : ''}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t"
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <Zap size={11} style={{ color: isLocked ? '#374151' : NEON }} />
                            <span className="font-mono text-[10px] font-bold"
                                style={{ color: isLocked ? '#374151' : '#e2e8f0' }}>
                                {lab.xp_reward} XP
                            </span>
                        </div>
                        {!isLocked && (
                            <div className="font-mono text-[9px] text-slate-600 uppercase tracking-wider">
                                Lab interactivo
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2">
                        {isLockedByPaywall && (
                            <span className="font-mono text-[9px] text-slate-600 uppercase">Plan trimestral+</span>
                        )}
                        <div className="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300"
                            style={{
                                background: isLocked ? 'transparent' : `rgba(${statusRgb},0.08)`,
                                borderColor: isLocked ? 'rgba(255,255,255,0.06)' : `rgba(${statusRgb},0.25)`,
                            }}>
                            {isLocked
                                ? <Lock size={14} className="text-slate-700" />
                                : isCompleted
                                ? <Play size={14} className="text-emerald-400" />
                                : <Play size={14} style={{ color: NEON }} />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Subscription lock overlay ─────────────────────────────────────────────────
function TerminalSkillsLocked() {
    const navigate = useNavigate();
    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 flex items-center justify-center p-8">
                <div className="max-w-lg w-full text-center">
                    <div className="relative mx-auto w-28 h-28 mb-8">
                        <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: `rgba(${NEON_RGB},0.15)` }} />
                        <div className="relative w-28 h-28 rounded-full flex items-center justify-center border-2"
                            style={{ background: 'linear-gradient(135deg, #0a1a0a, #0d0d0d)', borderColor: `rgba(${NEON_RGB},0.3)`, boxShadow: `0 0 40px rgba(${NEON_RGB},0.15)` }}>
                            <Lock className="w-12 h-12" style={{ color: `rgba(${NEON_RGB},0.7)` }} />
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6"
                        style={{ borderColor: `rgba(${NEON_RGB},0.3)`, background: `rgba(${NEON_RGB},0.05)` }}>
                        <Crown className="w-3.5 h-3.5" style={{ color: NEON }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: NEON }}>Plan Trimestral o Anual</span>
                    </div>

                    <h2 className="text-3xl font-black uppercase italic tracking-tight text-white mb-3 leading-tight">
                        Terminal Skills<br />
                        <span style={{ color: NEON }}>Exclusivo</span>
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed font-mono mb-8 max-w-sm mx-auto">
                        Los entornos interactivos de Terminal Skills están disponibles a partir del plan{' '}
                        <span className="text-white font-black">Trimestral</span> o{' '}
                        <span className="text-white font-black">Anual</span>.
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[
                            { icon: '🐧', label: 'Linux Labs' },
                            { icon: '⚡', label: 'Bash Scripting' },
                            { icon: '💾', label: 'Storage & Disk' },
                        ].map(({ icon, label }) => (
                            <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 flex flex-col items-center gap-2">
                                <span className="text-2xl grayscale opacity-50">{icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button onClick={() => navigate('/subscription')}
                            className="px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all flex items-center gap-2 text-black"
                            style={{ background: NEON, boxShadow: `0 0 30px rgba(${NEON_RGB},0.25)` }}>
                            <Sparkles className="w-4 h-4" /> Mejorar Plan
                        </button>
                        <button onClick={() => navigate('/dashboard')}
                            className="px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs transition-all">
                            Volver
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LabsPage() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [skillPaths,    setSkillPaths]    = useState([]);
    const [modules,       setModules]       = useState([]);
    const [labs,          setLabs]          = useState([]);
    const [selectedPath,  setSelectedPath]  = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [loading,       setLoading]       = useState(true);

    const pathId   = searchParams.get('path');
    const moduleId = searchParams.get('module');

    useEffect(() => {
        const fetchContext = async () => {
            setLoading(true);
            try {
                const pathsRes = await api.get('/labs/paths');
                setSkillPaths(pathsRes.data);

                let currentPath = null;
                if (pathId) {
                    currentPath = pathsRes.data.find(p => String(p.id) === String(pathId));
                    setSelectedPath(currentPath);
                } else {
                    setSelectedPath(null);
                    setModules([]);
                    setSelectedModule(null);
                }

                if (pathId) {
                    const modulesRes = await api.get(`/labs/paths/${pathId}/modules`);
                    setModules(modulesRes.data);

                    if (moduleId) {
                        const currentModule = modulesRes.data.find(m => String(m.id) === String(moduleId));
                        setSelectedModule(currentModule);
                        const labsRes = await api.get(`/labs/modules/${moduleId}/labs`);
                        setLabs(labsRes.data);
                    } else {
                        setSelectedModule(null);
                        setLabs([]);
                    }
                }
            } catch (err) {
                if (import.meta.env.DEV) console.error('Error fetching labs context:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchContext();
    }, [pathId, moduleId]);

    const handleSelectPath   = (path)   => setSearchParams({ path: path.id });
    const handleSelectModule = (module) => setSearchParams({ path: pathId, module: module.id });
    const handleBack = () => {
        if (moduleId) setSearchParams({ path: pathId });
        else if (pathId) setSearchParams({});
    };

    // Monthly plan → locked
    if (user?.role === 'alumno' && user?.subscription_type === 'monthly') {
        return <TerminalSkillsLocked />;
    }

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">

                {/* ── Hero — only on landing ── */}
                {!selectedPath && !selectedModule && !loading && (
                    <TerminalSkillsHero skillPaths={skillPaths} user={user} />
                )}

                {/* ── Section header when drilling into a path ── */}
                {selectedPath && !selectedModule && !loading && (
                    <SectionHeader
                        label="Skill Path"
                        title={selectedPath.title}
                        subtitle={`${modules.length} módulos · Entorno real Linux`}
                        pathTitle={selectedPath.title}
                        onBack={handleBack}
                    />
                )}

                {/* ── Section header when drilling into a module ── */}
                {selectedModule && !loading && (
                    <SectionHeader
                        label={`${selectedPath?.title} · Módulo`}
                        title={selectedModule.title}
                        subtitle={`${labs.length} laboratorios disponibles`}
                        pathTitle={selectedPath?.title}
                        onBack={handleBack}
                    />
                )}

                {/* ── Loading skeleton ── */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="rounded-[2rem] bg-white/5 border border-white/[0.05]"
                                style={{ aspectRatio: '4/5' }} />
                        ))}
                    </div>
                )}

                {!loading && (
                    <>
                        {/* ── VIEW 1: Skill Paths ── */}
                        {!selectedPath && !selectedModule && (
                            <>
                                {/* Section divider */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-px flex-1 bg-white/[0.06]" />
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border"
                                        style={{ borderColor: `rgba(${NEON_RGB},0.25)`, background: `rgba(${NEON_RGB},0.06)` }}>
                                        <FlaskConical size={12} style={{ color: NEON }} />
                                        <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: NEON }}>
                                            Elige tu ruta
                                        </span>
                                    </div>
                                    <div className="h-px flex-1 bg-white/[0.06]" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {skillPaths.map(path => (
                                        <PathCard
                                            key={path.id}
                                            path={path}
                                            onClick={handleSelectPath}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── VIEW 2: Modules ── */}
                        {selectedPath && !selectedModule && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {modules.map((module, idx) => (
                                    <ModuleCard
                                        key={module.id}
                                        module={module}
                                        idx={idx}
                                        pathTitle={selectedPath.title}
                                        onClick={handleSelectModule}
                                    />
                                ))}
                            </div>
                        )}

                        {/* ── VIEW 3: Labs ── */}
                        {selectedModule && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {labs.map((lab, idx) => (
                                    <LabCard
                                        key={lab.id}
                                        lab={lab}
                                        idx={idx}
                                        user={user}
                                        onStart={(l) => navigate(`/labs/${l.id}`)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* ── Empty state ── */}
                        {skillPaths.length === 0 && !selectedPath && (
                            <div className="flex flex-col items-center justify-center h-96 rounded-3xl border border-white/[0.05] bg-white/[0.02]">
                                <Search className="w-12 h-12 text-slate-700 mb-4" />
                                <h3 className="text-xl font-black uppercase italic text-slate-600">
                                    No hay rutas disponibles
                                </h3>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
