import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Info, Play, Monitor, Zap, Globe } from 'lucide-react';

export default function AcademiaWorld() {
    const { user } = useAuth();

    if (!user) return null;

    const handleLaunch = () => {
        window.open('/mundo-virtual', '_blank');
    };

    return (
        <div className="flex min-h-screen bg-[#020510] overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 relative z-10 flex flex-col items-center justify-center">

                {/* Header Section */}
                <div className="w-full max-w-[800px] mb-12 flex flex-col items-center animate-in fade-in slide-in-from-top duration-700">
                    <div className="flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-neon/10 border border-neon/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon"></span>
                        </span>
                        <span className="text-[10px] font-black text-neon uppercase tracking-widest font-mono">PREMIUM ENGINE v3.5</span>
                    </div>
                    <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter text-center leading-none">
                        Mundo Virtual <br />
                        <span className="text-neon">Academia Tech4U</span>
                    </h1>
                </div>

                {/* Launch Card */}
                <div className="w-full max-w-[600px] relative group animate-in zoom-in duration-500">
                    <div className="absolute -inset-1 bg-gradient-to-r from-neon via-blue-500 to-neon rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

                    <div className="relative bg-[#050a18] border border-white/10 rounded-[2.2rem] p-10 flex flex-col items-center text-center shadow-2xl">
                        <div className="w-24 h-24 rounded-full bg-neon/10 border border-neon/20 flex items-center justify-center mb-8 shadow-2xl shadow-neon/10">
                            <Monitor className="w-10 h-10 text-neon" />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-4 italic uppercase tracking-tighter">Entorno de Exploración</h3>
                        <p className="text-slate-400 leading-relaxed mb-10 text-lg">
                            Hemos optimizado el mundo virtual para ejecutarse en una **pestaña independiente**.
                            Esto garantiza el máximo rendimiento gráfico y una captura de teclado perfecta sin distracciones.
                        </p>

                        <div className="grid grid-cols-3 gap-4 w-full mb-10">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Suavidad</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-2">
                                <Monitor className="w-5 h-5 text-blue-500" />
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Fullscreen</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-2">
                                <Globe className="w-5 h-5 text-neon" />
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Interactivo</span>
                            </div>
                        </div>

                        <button
                            onClick={handleLaunch}
                            className="w-full bg-neon hover:bg-neon/90 text-black px-8 py-5 rounded-[1.5rem] font-black text-xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(0,255,170,0.3)] flex items-center justify-center gap-4 group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                            <Play className="w-6 h-6 fill-black" />
                            <span className="uppercase tracking-widest">Lanzar Aldea Tech4U</span>
                        </button>

                        <div className="mt-8 flex items-center gap-2 text-slate-600 font-mono text-[10px] uppercase tracking-widest">
                            <Info className="w-4 h-4" />
                            <span>Requiere Auth v2.0 - Sesión activa</span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
