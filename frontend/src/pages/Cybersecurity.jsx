import React from 'react';
import {
    Shield, ChevronRight, Lock, Sparkles, TrendingUp, Briefcase,
    Target, Cpu, Zap, BookOpen, Award, CheckCircle, ArrowRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

export default function Cybersecurity() {
    const navigate = useNavigate();

    const certifications = [
        {
            id: 'ejptv2',
            name: 'Certificación eJPTv2',
            slug: 'ejptv2',
            description: 'Junior Penetration Tester v2 - Fundamentos de Hacking Ético.',
            icon: Shield,
            color: 'from-orange-600/20 to-orange-900/10 border-orange-500/30 hover:border-orange-400/60',
            iconColor: 'text-orange-400',
            badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
            status: 'available',
            modules: 7,
            questions: 40
        },
        {
            id: 'oscp',
            name: 'Preparación OSCP',
            slug: 'oscp',
            description: 'Offensive Security Certified Professional - Próximamente.',
            icon: Shield,
            color: 'from-red-600/10 to-transparent border-white/5 opacity-40 grayscale pointer-events-none',
            iconColor: 'text-slate-500',
            badge: 'bg-white/5 text-slate-500 border-white/10',
            status: 'locked'
        }
    ];

    const whyLearnSections = [
        {
            icon: TrendingUp,
            title: 'Salario Medio',
            value: '€35.000-60.000/año',
            description: 'En España, los profesionales de ciberseguridad cuentan con salarios competitivos y en constante crecimiento.',
            color: 'from-green-600/20 to-green-900/10 border-green-500/30'
        },
        {
            icon: Briefcase,
            title: 'Demanda Laboral',
            value: '+30% empleos',
            description: 'Aumento de empleos en ciberseguridad en 2025. Sector en expansión constante.',
            color: 'from-blue-600/20 to-blue-900/10 border-blue-500/30'
        },
        {
            icon: Award,
            title: 'Empresas que Contratan',
            value: '5+ Empresas',
            description: 'INCIBE, CNI-CCN, Deloitte, PwC, Indra, GMV y muchas más.',
            color: 'from-purple-600/20 to-purple-900/10 border-purple-500/30'
        }
    ];

    const roadmapPhases = [
        {
            phase: 'FASE 1',
            title: 'Fundamentos',
            color: 'from-blue-600/20 to-blue-900/10 border-blue-500/30',
            topics: ['Redes TCP/IP', 'Sistemas Operativos', 'Scripting Bash/Python', 'Conceptos de Seguridad']
        },
        {
            phase: 'FASE 2',
            title: 'Reconocimiento',
            color: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/30',
            topics: ['Nmap & Escaneo', 'OSINT', 'Enumeración', 'Fingerprinting']
        },
        {
            phase: 'FASE 3',
            title: 'Explotación',
            color: 'from-orange-600/20 to-orange-900/10 border-orange-500/30',
            topics: ['Metasploit', 'Ataques Web', 'Privilege Escalation', 'Post-Explotación']
        },
        {
            phase: 'FASE 4',
            title: 'Certificación',
            color: 'from-green-600/20 to-green-900/10 border-green-500/30',
            topics: ['eJPTv2 Exam', 'Portfolio Técnico', 'Informe de Auditoría', 'Certificaciones']
        }
    ];

    const tools = [
        {
            name: 'Kali Linux',
            description: 'Distribución especializada en pruebas de penetración',
            icon: Cpu,
            color: 'from-red-600/20 border-red-500/30'
        },
        {
            name: 'Nmap',
            description: 'Escáner de puertos y servicios',
            icon: Target,
            color: 'from-orange-600/20 border-orange-500/30'
        },
        {
            name: 'Metasploit',
            description: 'Framework de explotación avanzado',
            icon: Zap,
            color: 'from-purple-600/20 border-purple-500/30'
        },
        {
            name: 'Burp Suite',
            description: 'Testing de seguridad web',
            icon: Shield,
            color: 'from-blue-600/20 border-blue-500/30'
        },
        {
            name: 'Wireshark',
            description: 'Análisis de tráfico de red',
            icon: TrendingUp,
            color: 'from-cyan-600/20 border-cyan-500/30'
        },
        {
            name: 'Netcat',
            description: 'Swiss Army knife de redes',
            icon: Cpu,
            color: 'from-green-600/20 border-green-500/30'
        },
        {
            name: 'John the Ripper',
            description: 'Cracking de contraseñas',
            icon: Lock,
            color: 'from-pink-600/20 border-pink-500/30'
        },
        {
            name: 'Gobuster',
            description: 'Fuzzing y enumeración web',
            icon: BookOpen,
            color: 'from-indigo-600/20 border-indigo-500/30'
        }
    ];

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8">

                {/* ── Header ── */}
                <PageHeader
                    title={<>Ciber<span className="text-white">seguridad</span></>}
                    subtitle="Cyber Warfare Division — Certificaciones y Entrenamiento"
                    Icon={Shield}
                    gradient="from-white via-orange-100 to-orange-500"
                    iconColor="text-orange-500"
                    iconBg="bg-orange-500/20"
                    iconBorder="border-orange-500/30"
                    glowColor="bg-orange-500/20"
                />

                <div className="animate-in fade-in duration-700 max-w-7xl">

                    {/* ════ Hero Banner ════ */}
                    <div className="relative overflow-hidden glass rounded-3xl border border-white/5 mb-12 p-8 lg:p-12">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] -z-10" />
                        <div className="relative z-10">
                            <h2 className="text-3xl lg:text-4xl font-black uppercase italic text-white mb-4">
                                Zona de Entrenamiento
                            </h2>
                            <p className="text-slate-400 font-mono text-sm leading-relaxed max-w-3xl mb-6">
                                Bienvenido a la división de operaciones especiales. Aquí encontrarás material estructurado
                                para la preparación de certificaciones industriales y laboratorios avanzados de hacking ético.
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                <div className="glass rounded-xl p-4 border border-white/5">
                                    <p className="text-orange-400 font-bold text-lg">7</p>
                                    <p className="text-slate-400 text-xs font-mono">Módulos Teóricos</p>
                                </div>
                                <div className="glass rounded-xl p-4 border border-white/5">
                                    <p className="text-orange-400 font-bold text-lg">40+</p>
                                    <p className="text-slate-400 text-xs font-mono">Preguntas Prácticas</p>
                                </div>
                                <div className="glass rounded-xl p-4 border border-white/5">
                                    <p className="text-orange-400 font-bold text-lg">∞</p>
                                    <p className="text-slate-400 text-xs font-mono">Labs Prácticos</p>
                                </div>
                                <div className="glass rounded-xl p-4 border border-white/5">
                                    <p className="text-orange-400 font-bold text-lg">24/7</p>
                                    <p className="text-slate-400 text-xs font-mono">Acceso Total</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ════ Certification Paths Section ════ */}
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-orange-500" /> Caminos de Certificación
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                        {certifications.map(cert => (
                            <Link
                                key={cert.id}
                                to={cert.status === 'available' ? `/teoria/${cert.slug}` : '#'}
                                className={`group glass rounded-3xl p-8 border-2 bg-gradient-to-br transition-all duration-500 block no-underline overflow-hidden relative ${cert.color} ${cert.status === 'available' ? 'hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(249,115,22,0.2)]' : ''}`}
                            >
                                {cert.status === 'locked' && (
                                    <div className="absolute top-4 right-4 z-20">
                                        <Lock className="w-5 h-5 text-slate-500" />
                                    </div>
                                )}

                                <div className="flex items-center gap-6 mb-6">
                                    <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center">
                                        <cert.icon className={`w-full h-full ${cert.iconColor} transition-transform duration-500 ${cert.status === 'available' ? 'group-hover:scale-110 group-hover:rotate-3' : ''}`} />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase italic text-white leading-tight">
                                        {cert.name}
                                    </h3>
                                </div>

                                <p className="text-sm text-slate-400 font-mono mb-6 leading-relaxed">
                                    {cert.description}
                                </p>

                                {cert.status === 'available' && (
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="glass rounded-lg p-3 border border-white/5">
                                            <p className="text-orange-400 font-bold text-lg">{cert.modules}</p>
                                            <p className="text-slate-500 text-xs font-mono">Módulos</p>
                                        </div>
                                        <div className="glass rounded-lg p-3 border border-white/5">
                                            <p className="text-orange-400 font-bold text-lg">{cert.questions}</p>
                                            <p className="text-slate-500 text-xs font-mono">Preguntas</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className={`text-[9px] font-mono uppercase px-3 py-1 rounded border ${cert.badge}`}>
                                        {cert.status === 'available' ? 'ACTIVO' : 'EN DESARROLLO'}
                                    </span>
                                    {cert.status === 'available' && (
                                        <ChevronRight className={`w-5 h-5 ${cert.iconColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* ════ Why Learn Cybersecurity ════ */}
                    <div className="mb-16">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-orange-500" /> ¿Por qué aprender Ciberseguridad?
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {whyLearnSections.map((section, idx) => {
                                const Icon = section.icon;
                                return (
                                    <div
                                        key={idx}
                                        className={`glass rounded-2xl p-8 border-2 bg-gradient-to-br ${section.color} transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)]`}
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <Icon className="w-8 h-8 text-orange-400 flex-shrink-0" />
                                            <h3 className="text-lg font-black uppercase italic text-white">
                                                {section.title}
                                            </h3>
                                        </div>
                                        <p className="text-2xl font-bold text-orange-400 mb-3">
                                            {section.value}
                                        </p>
                                        <p className="text-sm text-slate-400 font-mono leading-relaxed">
                                            {section.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ════ Learning Roadmap ════ */}
                    <div className="mb-16">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-orange-500" /> Roadmap de Aprendizaje
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {roadmapPhases.map((roadmap, idx) => (
                                <div
                                    key={idx}
                                    className={`glass rounded-2xl p-6 border-2 bg-gradient-to-br ${roadmap.color} relative group`}
                                >
                                    {/* Phase indicator */}
                                    <div className="absolute -top-3 left-6 bg-[#0D0D0D] px-3 py-1 rounded border border-white/10">
                                        <p className="text-xs font-mono font-bold text-orange-400">{roadmap.phase}</p>
                                    </div>

                                    <h3 className="text-xl font-black uppercase italic text-white mt-4 mb-4">
                                        {roadmap.title}
                                    </h3>

                                    <div className="space-y-2">
                                        {roadmap.topics.map((topic, topicIdx) => (
                                            <div key={topicIdx} className="flex items-start gap-3">
                                                <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-slate-400 font-mono">
                                                    {topic}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Arrow connector (not on last item) */}
                                    {idx < roadmapPhases.length - 1 && (
                                        <div className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2">
                                            <ArrowRight className="w-5 h-5 text-orange-500/50" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ════ Key Tools Section ════ */}
                    <div className="mb-16">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-orange-500" /> Herramientas Clave
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {tools.map((tool, idx) => {
                                const Icon = tool.icon;
                                return (
                                    <div
                                        key={idx}
                                        className={`glass rounded-xl p-5 border-2 bg-gradient-to-br ${tool.color} border-white/10 transition-all duration-500 hover:-translate-y-1 hover:border-orange-500/30 group`}
                                    >
                                        <Icon className="w-6 h-6 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
                                        <h4 className="text-sm font-black text-white mb-2">
                                            {tool.name}
                                        </h4>
                                        <p className="text-xs text-slate-400 font-mono leading-snug">
                                            {tool.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ════ Knowledge Test CTA ════ */}
                    <div className="relative overflow-hidden glass rounded-3xl border border-white/5 p-8 lg:p-12 mb-16">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/5 blur-[100px] -z-10" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1">
                                <h2 className="text-2xl lg:text-3xl font-black uppercase italic text-white mb-3">
                                    Test de Conocimientos
                                </h2>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed max-w-2xl">
                                    Evalúa tus conocimientos en ciberseguridad con preguntas diseñadas por expertos. Mejora tus habilidades y prepárate para las certificaciones.
                                </p>
                            </div>
                            <Link
                                to="/tests?subject=Ciberseguridad"
                                className="flex-shrink-0 glass rounded-2xl px-6 py-3 border border-orange-500/30 hover:border-orange-400/60 text-orange-400 font-bold uppercase text-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(249,115,22,0.2)] flex items-center gap-2 no-underline"
                            >
                                Ir a Tests
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* ════ Footer decoration ════ */}
                    <div className="py-12 border-t border-white/5 flex flex-col items-center opacity-30">
                        <div className="flex gap-4 mb-4">
                            <div className="w-2 h-2 rotate-45 border border-white" />
                            <div className="w-2 h-2 rotate-45 bg-white" />
                            <div className="w-2 h-2 rotate-45 border border-white" />
                        </div>
                        <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-slate-500">
                            Tech4U Cyber Division — 2026
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}
