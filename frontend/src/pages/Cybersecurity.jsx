import React from 'react';
import {
    Shield, ChevronRight, Lock, Sparkles, TrendingUp, Briefcase,
    Target, Cpu, Zap, BookOpen, Award, CheckCircle, ArrowRight,
    PlayCircle, Video, Clock, Layers, Star, Trophy, Users,
    Terminal, Globe, Key, Wifi, Bug, FileSearch
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// ── Sección hero del curso principal ────────────────────────────────────────
const COURSE_SECTIONS = [
    { n: '13', label: 'Secciones' },
    { n: '44', label: 'Clases' },
    { n: '2',  label: 'Simulacros' },
    { n: '∞',  label: 'Acceso' },
];

const WHAT_YOU_LEARN = [
    'Montar tu propio laboratorio de hacking',
    'Reconocimiento pasivo y activo con OSINT',
    'Escaneo y enumeración con Nmap',
    'Explotación con Metasploit Framework',
    'Ataques web: SQLi, XSS, LFI, Command Injection',
    'Post-explotación y escalada de privilegios',
    'Pentesting sobre WordPress, Joomla y Drupal',
    'Toma de notas y elaboración de informes',
];

const TOOLS = [
    { name: 'Kali Linux',     icon: Terminal,  color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
    { name: 'Nmap',           icon: Wifi,      color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { name: 'Metasploit',     icon: Zap,       color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { name: 'Burp Suite',     icon: Globe,     color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
    { name: 'Gobuster',       icon: FileSearch,color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { name: 'Wireshark',      icon: Cpu,       color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20' },
    { name: 'John the Ripper',icon: Key,       color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20' },
    { name: 'Netcat',         icon: Bug,       color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
];

const ROADMAP = [
    { phase: '01', title: 'Fundamentos',    color: 'border-blue-500/40',   accent: 'text-blue-400',   bg: 'bg-blue-500/5',   topics: ['Redes TCP/IP', 'Linux & Windows', 'Scripting básico'] },
    { phase: '02', title: 'Reconocimiento', color: 'border-cyan-500/40',   accent: 'text-cyan-400',   bg: 'bg-cyan-500/5',   topics: ['OSINT', 'Nmap & Gobuster', 'Enumeración'] },
    { phase: '03', title: 'Explotación',    color: 'border-orange-500/40', accent: 'text-orange-400', bg: 'bg-orange-500/5', topics: ['Metasploit', 'Ataques web', 'CMS hacking'] },
    { phase: '04', title: 'eJPTv2 Exam',   color: 'border-green-500/40',  accent: 'text-green-400',  bg: 'bg-green-500/5',  topics: ['Simulacro examen', 'Informe técnico', '¡Certifícate!'] },
];

export default function Cybersecurity() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 overflow-y-auto">

                {/* ══════════════════════════════════════════════
                    HERO — Course landing
                ══════════════════════════════════════════════ */}
                <section className="relative overflow-hidden min-h-[480px] flex items-end">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] via-[#111] to-[#0D0D0D]" />
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/8 blur-[140px] -z-10" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-600/5 blur-[100px] -z-10" />

                    {/* Decorative grid lines */}
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                    <div className="relative z-10 w-full px-8 pt-20 pb-12 md:px-12">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-6">
                            <Shield className="w-3 h-3 text-orange-500" />
                            <span>Tech4U</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-orange-400">Ciberseguridad</span>
                        </div>

                        <div className="max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left: course info */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1.5 bg-orange-500 text-black rounded-full">
                                        Curso en Vídeo
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                                        Certificación Oficial
                                    </span>
                                </div>

                                <h1 className="text-5xl lg:text-6xl font-black uppercase italic leading-none mb-2">
                                    <span className="text-white">eJPT</span>
                                    <span className="text-orange-500">v2</span>
                                </h1>
                                <p className="text-xl font-mono text-slate-400 uppercase tracking-widest mb-5">
                                    Junior Penetration Tester
                                </p>

                                <p className="text-slate-400 font-mono text-sm leading-relaxed max-w-lg mb-8">
                                    Domina el hacking ético desde cero. Curso completo en vídeo con laboratorios
                                    prácticos, máquinas reales y un simulacro del examen oficial de eLearnSecurity.
                                </p>

                                {/* Stats strip */}
                                <div className="flex flex-wrap gap-6 mb-8">
                                    {COURSE_SECTIONS.map(s => (
                                        <div key={s.label}>
                                            <p className="text-2xl font-black text-orange-400">{s.n}</p>
                                            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    to="/certificacion/ejptv2"
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-sm tracking-wider rounded-2xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] no-underline">
                                    <PlayCircle className="w-5 h-5" />
                                    Empezar el Curso
                                </Link>
                            </div>

                            {/* Right: course card preview */}
                            <div className="hidden lg:block">
                                <div className="relative">
                                    {/* Glow */}
                                    <div className="absolute -inset-4 bg-orange-500/10 blur-2xl rounded-3xl" />
                                    <div className="relative bg-[#111] border border-orange-500/20 rounded-3xl overflow-hidden shadow-2xl">
                                        {/* Fake thumbnail */}
                                        <div className="h-48 bg-gradient-to-br from-orange-900/30 via-[#0D0D0D] to-orange-900/20 flex items-center justify-center relative">
                                            <div className="absolute inset-0 opacity-[0.04]"
                                                style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                                            <div className="w-20 h-20 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center backdrop-blur-sm">
                                                <PlayCircle className="w-10 h-10 text-orange-400" />
                                            </div>
                                            <div className="absolute top-3 right-3 text-[9px] font-black bg-orange-500 text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                NUEVO
                                            </div>
                                        </div>
                                        {/* Course meta */}
                                        <div className="p-5">
                                            <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-1">eJPTv2 — eLearnSecurity</p>
                                            <p className="text-white font-black uppercase text-sm mb-3">Junior Penetration Tester v2</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[['44', 'Clases'], ['13', 'Secciones'], ['2', 'Quiz']].map(([n, l]) => (
                                                    <div key={l} className="bg-black/40 rounded-xl p-2.5 text-center border border-white/5">
                                                        <p className="text-orange-400 font-black text-base">{n}</p>
                                                        <p className="text-[9px] font-mono text-slate-600 uppercase">{l}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="px-8 md:px-12 pb-20 max-w-7xl">

                    {/* ══════════════════════════════════════════════
                        LO QUE APRENDERÁS
                    ══════════════════════════════════════════════ */}
                    <section className="mt-14 mb-14">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-orange-500" /> Lo que aprenderás
                        </p>

                        <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                                {WHAT_YOU_LEARN.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckCircle className="w-3 h-3 text-orange-400" />
                                        </div>
                                        <p className="text-sm font-mono text-slate-300 leading-snug">{item}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-6 flex-wrap">
                                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                        <Video className="w-4 h-4 text-orange-400" />
                                        44 clases en vídeo
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                        <Layers className="w-4 h-4 text-orange-400" />
                                        13 secciones
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                        <Trophy className="w-4 h-4 text-orange-400" />
                                        Simulacro de examen incluido
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                        <Clock className="w-4 h-4 text-orange-400" />
                                        Acceso de por vida
                                    </div>
                                </div>
                                <Link
                                    to="/certificacion/ejptv2"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all hover:scale-105 no-underline shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                                    <PlayCircle className="w-4 h-4" />
                                    Ver el Curso
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════════════════════════════════════
                        ROADMAP
                    ══════════════════════════════════════════════ */}
                    <section className="mb-14">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-orange-500" /> Roadmap del Curso
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {ROADMAP.map((phase, i) => (
                                <div key={i} className={`relative bg-[#111] border ${phase.color} rounded-2xl p-5 ${phase.bg}`}>
                                    {/* Phase number */}
                                    <div className={`text-4xl font-black ${phase.accent} opacity-10 absolute top-4 right-5 select-none`}>
                                        {phase.phase}
                                    </div>
                                    <p className={`text-[10px] font-mono ${phase.accent} uppercase tracking-widest mb-2`}>FASE {phase.phase}</p>
                                    <h4 className="text-base font-black text-white uppercase mb-4">{phase.title}</h4>
                                    <div className="space-y-2">
                                        {phase.topics.map((t, ti) => (
                                            <div key={ti} className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${phase.accent.replace('text-', 'bg-')} flex-shrink-0`} />
                                                <p className="text-xs font-mono text-slate-400">{t}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {i < ROADMAP.length - 1 && (
                                        <div className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10">
                                            <ChevronRight className="w-4 h-4 text-orange-500/30" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ══════════════════════════════════════════════
                        HERRAMIENTAS
                    ══════════════════════════════════════════════ */}
                    <section className="mb-14">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-orange-500" /> Herramientas que dominarás
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {TOOLS.map(tool => {
                                const Icon = tool.icon;
                                return (
                                    <div key={tool.name}
                                        className={`group flex items-center gap-3 px-4 py-3.5 bg-[#111] border border-white/5 hover:border-white/15 rounded-2xl transition-all cursor-default hover:-translate-y-0.5`}>
                                        <div className={`w-8 h-8 rounded-xl ${tool.bg} border ${tool.border} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 ${tool.color}`} />
                                        </div>
                                        <span className="text-sm font-mono text-slate-300 font-bold">{tool.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* ══════════════════════════════════════════════
                        CTA FINAL
                    ══════════════════════════════════════════════ */}
                    <section className="mb-8">
                        <div className="relative overflow-hidden bg-[#111] border border-orange-500/20 rounded-3xl p-10 text-center">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-orange-500/10 blur-[80px]" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5">
                                    <PlayCircle className="w-8 h-8 text-orange-400" />
                                </div>
                                <h2 className="text-3xl font-black uppercase italic text-white mb-3">
                                    ¿Listo para hackear?
                                </h2>
                                <p className="text-slate-400 font-mono text-sm max-w-lg mx-auto mb-8">
                                    Accede al curso completo eJPTv2 con tus clases grabadas, laboratorios y el simulacro del examen oficial.
                                </p>
                                <div className="flex items-center justify-center gap-4 flex-wrap">
                                    <Link
                                        to="/certificacion/ejptv2"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-sm tracking-wider rounded-2xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(249,115,22,0.4)] no-underline">
                                        <PlayCircle className="w-5 h-5" />
                                        Empezar Ahora
                                    </Link>
                                    <Link
                                        to="/tests?subject=Ciberseguridad"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-sm tracking-wider rounded-2xl transition-all border border-white/10 no-underline">
                                        <Target className="w-5 h-5" />
                                        Test de Conocimientos
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer decoration */}
                    <div className="py-8 border-t border-white/5 flex items-center justify-center gap-3 opacity-20">
                        <div className="w-1.5 h-1.5 rotate-45 border border-white" />
                        <p className="text-[9px] font-mono uppercase tracking-[0.5em] text-slate-500">Tech4U Cyber Division — 2026</p>
                        <div className="w-1.5 h-1.5 rotate-45 bg-white" />
                    </div>

                </div>
            </main>
        </div>
    );
}
