import { useNavigate } from 'react-router-dom';
import { Hammer, Calculator, Network, Zap, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function Tools() {
    const navigate = useNavigate();

    const tools = [
        {
            id: 'subnet',
            title: 'Subnetting & VLSM',
            description: 'Calculadora avanzada de subredes IPv4. Soporta FLSM (fijo) y VLSM (variable) con exportación de resultados.',
            icon: Network,
            color: 'from-blue-600 to-indigo-600',
            path: '/tools/subnetting'
        },
        // Espacio para futuras herramientas
    ];

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">
                {/* Ambient logic */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -z-10" />

                <header className="mb-12">
                    <div className="flex items-center gap-5 mb-3">
                        <div className="p-4 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 rounded-2xl border border-blue-500/30 shadow-[0_0_40px_rgba(37,99,235,0.15)]">
                            <Hammer className="w-10 h-10 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400">
                                Herramientas <span className="text-white">Academia</span>
                            </h1>
                            <p className="text-[11px] font-mono text-blue-400/70 uppercase tracking-[0.4em] mt-2">
                                // Tech Essentials for Students
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tools.map(tool => (
                        <div
                            key={tool.id}
                            onClick={() => navigate(tool.path)}
                            className="group relative bg-gradient-to-b from-stone-900/60 to-black rounded-[2rem] border border-white/5 p-8 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_0_50px_rgba(37,99,235,0.1)]"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                <tool.icon className="w-8 h-8 text-white" />
                            </div>

                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-3 group-hover:text-blue-400 transition-colors">
                                {tool.title}
                            </h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                                {tool.description}
                            </p>

                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 group-hover:gap-4 transition-all">
                                <span>Abrir Herramienta</span>
                                <ChevronRight className="w-4 h-4" />
                            </div>

                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Zap className="w-5 h-5 text-blue-500/50 animate-pulse" />
                            </div>
                        </div>
                    ))}

                    {/* Placeholder for future tools */}
                    <div className="bg-white/2 rounded-[2rem] border border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center opacity-40">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                            <Calculator className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Próximamente</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
