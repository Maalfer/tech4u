import React from 'react';
import { Shield, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
// Custom PNG Icons (Removed missing assets and replaced with standard icons)

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
            status: 'available'
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

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">

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

                <div className="animate-in fade-in duration-700 max-w-6xl">

                    {/* Intro Banner */}
                    <div className="relative overflow-hidden glass rounded-3xl border border-white/5 mb-12 p-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] -z-10" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1">
                                <h2 className="text-2xl font-black uppercase italic text-white mb-3">Zona de Entrenamiento</h2>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed max-w-2xl">
                                    Bienvenido a la división de operaciones especiales. Aquí encontrarás material estructurado
                                    para la preparación de certificaciones industriales y laboratorios avanzados de hacking ético.
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <Shield className="w-20 h-20 text-orange-500/20 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-orange-500" /> Elige tu camino de certificación
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certifications.map(cert => (
                            <Link
                                key={cert.id}
                                to={cert.status === 'available' ? `/teoria/${cert.slug}` : '#'}
                                className={`group glass rounded-3xl p-7 border-2 bg-gradient-to-br transition-all duration-500 block no-underline overflow-hidden relative ${cert.color} ${cert.status === 'available' ? 'hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(249,115,22,0.2)]' : ''}`}
                            >
                                {cert.status === 'locked' && (
                                    <div className="absolute top-4 right-4 z-20">
                                        <Lock className="w-4 h-4 text-slate-500" />
                                    </div>
                                )}

                                <div className="flex items-center gap-5 mb-6">
                                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                                        <cert.icon className={`w-full h-full ${cert.iconColor} transition-transform duration-500 ${cert.status === 'available' ? 'group-hover:scale-110 group-hover:rotate-3' : ''}`} />
                                    </div>
                                    <h3 className="text-lg font-black uppercase italic text-white leading-tight">
                                        {cert.name}
                                    </h3>
                                </div>

                                <p className="text-xs text-slate-400 font-mono mb-6 leading-relaxed line-clamp-2">
                                    {cert.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${cert.badge}`}>
                                        {cert.status === 'available' ? 'ACTIVO' : 'EN DESARROLLO'}
                                    </span>
                                    {cert.status === 'available' && (
                                        <ChevronRight className={`w-4 h-4 ${cert.iconColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Footer decoration */}
                    <div className="mt-24 py-12 border-t border-white/5 flex flex-col items-center opacity-30">
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
