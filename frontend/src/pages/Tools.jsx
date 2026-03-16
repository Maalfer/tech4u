import { useNavigate } from 'react-router-dom';
import {
    Hammer, Calculator, Network, Zap, ChevronRight,
    Binary, Layers, Shield, BookOpen, Globe,
    Wrench, Cpu, Code2, Star,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { ToolCoverComponent } from '../components/ToolCovers';

// ── Hero ──────────────────────────────────────────────────────────────────────
function ToolsHero({ toolCount }) {
    return (
        <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/8"
             style={{ background: 'linear-gradient(135deg, #02050f 0%, #04091a 40%, #030710 100%)' }}>
            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.07]"
                 style={{
                     backgroundImage: `linear-gradient(rgba(59,130,246,0.6) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(59,130,246,0.6) 1px, transparent 1px)`,
                     backgroundSize: '42px 42px'
                 }} />

            {/* Glows */}
            <div className="absolute top-0 left-1/4 w-[480px] h-64 rounded-full opacity-20 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.45) 0%, transparent 70%)', filter: 'blur(50px)' }} />
            <div className="absolute bottom-0 right-1/3 w-80 h-52 rounded-full opacity-15 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, transparent 70%)', filter: 'blur(55px)' }} />

            {/* Bottom edge */}
            <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                 style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), rgba(139,92,246,0.3), transparent)' }} />

            <div className="relative z-10 px-10 pt-12 pb-11">
                {/* Badge row */}
                <div className="flex items-center gap-3 mb-7 flex-wrap">
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-sm"
                         style={{ borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">
                            Herramientas · Tech Essentials
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                        <Wrench size={10} className="text-blue-400" />
                        <span className="text-[10px] font-mono text-slate-500">Redes · Unix · Numeración · Protocolos</span>
                    </div>
                </div>

                {/* Headline */}
                <div className="mb-7">
                    <h1 className="text-6xl font-black tracking-tight leading-none mb-4">
                        <span className="text-white">Herramientas</span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 40%, #818cf8 80%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Esenciales ASIR
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                        Calculadoras interactivas y referencias técnicas para el día a día.{' '}
                        <span className="text-slate-300 font-medium">Optimizadas para el examen y el trabajo real.</span>
                    </p>
                </div>

                {/* Stats pills */}
                <div className="flex items-center gap-3 flex-wrap">
                    {[
                        { label: 'Herramientas', value: String(toolCount), color: 'text-blue-400' },
                        { label: 'Subnetting + VLSM', value: '✓', color: 'text-indigo-400' },
                        { label: 'OSI Explorer',       value: '✓', color: 'text-violet-400' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03]">
                            <span className={`text-xl font-black ${color}`}>{value}</span>
                            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Tools() {
    const navigate = useNavigate();

    const tools = [
        {
            id: 'subnet',
            title: 'Subnetting & VLSM',
            description: 'Calculadora avanzada de subredes IPv4. Soporta FLSM y VLSM con exportación de scripts Cisco/Linux/Windows y modo reto.',
            icon: Network,
            gradient: 'from-blue-600 to-indigo-600',
            glow: 'rgba(37,99,235,0.18)',
            accentColor: '#60a5fa',
            hoverBorderColor: 'rgba(59,130,246,0.5)',
            tag: 'IPv4 · CIDR · VLSM',
            tagColor: 'text-blue-400',
            tagBg: 'bg-blue-500/10 border-blue-500/25',
            path: '/tools/subnetting',
        },
        {
            id: 'binary',
            title: 'Conversor Numérico',
            description: 'Conversión en tiempo real entre decimal, binario, hexadecimal y octal. Incluye cuadrícula de bits, operaciones bitwise y tabla de referencia.',
            icon: Binary,
            gradient: 'from-emerald-600 to-teal-600',
            glow: 'rgba(16,185,129,0.18)',
            accentColor: '#34d399',
            hoverBorderColor: 'rgba(16,185,129,0.5)',
            tag: 'DEC · BIN · HEX · OCT',
            tagColor: 'text-emerald-400',
            tagBg: 'bg-emerald-500/10 border-emerald-500/25',
            path: '/tools/binary',
        },
        {
            id: 'ports',
            title: 'Referencia de Puertos',
            description: 'Guía de los 47 puertos más importantes con niveles de riesgo, protocolos seguros y filtros por categoría. Optimizado para el examen.',
            icon: BookOpen,
            gradient: 'from-amber-500 to-orange-600',
            glow: 'rgba(245,158,11,0.18)',
            accentColor: '#fbbf24',
            hoverBorderColor: 'rgba(245,158,11,0.5)',
            tag: 'TCP · UDP · Seguridad',
            tagColor: 'text-amber-400',
            tagBg: 'bg-amber-500/10 border-amber-500/25',
            path: '/tools/ports',
        },
        {
            id: 'chmod',
            title: 'Calculadora chmod',
            description: 'Generador interactivo de permisos Unix. Notación octal y simbólica en tiempo real con bits especiales SUID/SGID/Sticky y 8 presets.',
            icon: Shield,
            gradient: 'from-rose-600 to-pink-600',
            glow: 'rgba(244,63,94,0.18)',
            accentColor: '#fb7185',
            hoverBorderColor: 'rgba(244,63,94,0.5)',
            tag: 'Unix · Linux · Permisos',
            tagColor: 'text-rose-400',
            tagBg: 'bg-rose-500/10 border-rose-500/25',
            path: '/tools/chmod',
        },
        {
            id: 'osi',
            title: 'Modelo OSI Explorer',
            description: 'Explorador interactivo del modelo OSI. 7 capas con protocolos, PDUs, dispositivos, tips de examen y comparativa con el modelo TCP/IP.',
            icon: Layers,
            gradient: 'from-violet-600 to-purple-600',
            glow: 'rgba(139,92,246,0.18)',
            accentColor: '#a78bfa',
            hoverBorderColor: 'rgba(139,92,246,0.5)',
            tag: 'OSI · TCP/IP · Protocolos',
            tagColor: 'text-violet-400',
            tagBg: 'bg-violet-500/10 border-violet-500/25',
            path: '/tools/osi',
        },
    ];

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">
                {/* Ambient glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/4 blur-[150px] rounded-full -z-10" />
                <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-violet-600/4 blur-[150px] rounded-full -z-10" />

                <ToolsHero toolCount={tools.length} />

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tools.map(tool => (
                        <div
                            key={tool.id}
                            onClick={() => navigate(tool.path)}
                            className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2"
                            style={{
                                aspectRatio: '4/5',
                                border: '1.5px solid rgba(255,255,255,0.08)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = tool.hoverBorderColor || 'rgba(59,130,246,0.4)';
                                e.currentTarget.style.boxShadow = `0 8px 40px ${tool.glow}`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* SVG Cover — full-bleed background */}
                            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                                <ToolCoverComponent toolId={tool.id} />
                            </div>

                            {/* Dark gradient overlay */}
                            <div className="absolute inset-0" style={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.52) 42%, rgba(0,0,0,0.06) 68%, transparent 100%)',
                            }} />

                            {/* Top accent bar */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] opacity-55 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: `linear-gradient(90deg, transparent, ${tool.accentColor || '#3b82f6'}, transparent)` }} />

                            {/* Bottom content */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-3">
                                {/* Tag */}
                                <div className={`inline-flex items-center self-start px-2 py-0.5 rounded-lg border font-mono text-[9px] font-black uppercase tracking-widest ${tool.tagColor} ${tool.tagBg}`}>
                                    {tool.tag}
                                </div>

                                {/* Icon + title */}
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <tool.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-sm font-black text-white uppercase italic tracking-tight leading-tight">
                                        {tool.title}
                                    </h2>
                                </div>

                                {/* Description */}
                                <p className="text-slate-500 text-[10px] leading-relaxed font-mono line-clamp-2">
                                    {tool.description}
                                </p>

                                {/* CTA */}
                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0"
                                    style={{ color: tool.accentColor || '#60a5fa' }}>
                                    <span>Abrir Herramienta</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
