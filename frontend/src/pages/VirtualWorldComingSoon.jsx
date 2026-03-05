import React from 'react';
import { ArrowLeft, MonitorPlay, Settings, Pickaxe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// Reemplaza esto con las rutas reales de tus imágenes en assets
import adminPj from '../assets/admin_pj.png';
import aldeaMapa from '../assets/aldea_mapa.png';

export default function VirtualWorldComingSoon() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative overflow-hidden flex flex-col items-center justify-center">

                {/* ── AMBIENT BACKGROUND ── */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[180px] rounded-full mix-blend-screen" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/5 blur-[180px] rounded-full mix-blend-screen" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />

                    {/* Faint map background */}
                    <div
                        className="absolute inset-0 opacity-5 bg-cover bg-center [image-rendering:pixelated]"
                        style={{ backgroundImage: `url(${aldeaMapa})` }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/95 to-[#050505]" />
                </div>

                {/* ── CONTENT CONTAINER ── */}
                <div className="relative z-10 max-w-full w-full text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-12 duration-1000 px-4">

                    {/* BACK BUTTON */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center gap-3 mb-8 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-2xl transition-all duration-500 font-mono text-xs uppercase tracking-[0.3em] text-slate-400 hover:text-cyan-400 shadow-2xl backdrop-blur-md active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
                        Volver al campamento
                    </button>

                    {/* MUNDO VIRTUAL SCENE */}
                    <div className="flex flex-col items-center justify-center w-full mb-12 relative mt-4">

                        {/* ADMIN CONSTRUCTION */}
                        <div className="relative group w-48 h-48 md:w-64 md:h-64 flex-shrink-0 z-20 animate-float" style={{ animationDuration: '6s' }}>
                            <img
                                src={adminPj}
                                alt="Admin Construyendo"
                                className="relative z-10 w-full h-full object-contain transform transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]"
                            />
                            {/* Building Icons */}
                            <div className="absolute -top-4 -right-4 md:-right-8 space-y-4 flex flex-col items-center">
                                <Pickaxe className="w-10 h-10 md:w-12 md:h-12 text-cyan-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-bounce" style={{ animationDelay: '0s' }} />
                                <Settings className="w-6 h-6 md:w-8 md:h-8 text-cyan-400/60 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-spin" style={{ animationDuration: '4s' }} />
                            </div>
                        </div>

                        {/* Impact Energy Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full -z-10 animate-pulse" />
                    </div>

                    {/* TYPOGRAPHY */}
                    <div className="space-y-6 relative z-30 max-w-4xl mx-auto text-center px-4 mt-8 md:mt-4">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 md:w-96 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-[0.2em] md:tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-100 to-cyan-800 drop-shadow-xl mb-4 md:mb-6 leading-tight">
                            Mundo Virtual <br /> <span className="text-3xl md:text-4xl">Tech4U</span>
                        </h1>

                        <div className="inline-flex items-center gap-3 md:gap-6 px-6 md:px-12 py-3 md:py-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl mb-6 md:mb-10 group hover:border-cyan-500/50 transition-colors duration-500">
                            <MonitorPlay className="w-6 h-6 md:w-10 md:h-10 text-cyan-500 animate-pulse" />
                            <span className="text-sm md:text-lg font-mono font-black tracking-[0.2em] md:tracking-[0.4em] uppercase text-white">
                                En Construcción
                            </span>
                            <MonitorPlay className="w-6 h-6 md:w-10 md:h-10 text-cyan-500 animate-pulse" />
                        </div>

                        <p className="text-base md:text-xl lg:text-2xl text-slate-300 font-mono leading-relaxed drop-shadow-md font-light max-w-3xl mx-auto">
                            Nuestros servidores están compilando una nueva experiencia <span className="text-cyan-400 font-black tracking-widest uppercase border-b-2 border-cyan-500/30">RPG inmersiva</span>. Pronto podrás explorar la academia y conectar con tus portafolios.
                        </p>

                        <p className="text-xs md:text-sm lg:text-lg text-cyan-500 font-black uppercase tracking-[0.3em] md:tracking-[0.5em] animate-pulse mt-6 md:mt-8">
                            Acceso Anticipado Próximamente...
                        </p>
                    </div>

                    {/* DECORATIVE ORNAMENTS */}
                    <div className="mt-20 flex items-center justify-center gap-12 opacity-20">
                        <div className="w-48 h-[1px] bg-gradient-to-r from-transparent to-cyan-500" />
                        <div className="flex gap-4">
                            <div className="w-3 h-3 rotate-45 border border-cyan-500" />
                            <div className="w-3 h-3 rotate-45 bg-cyan-500 shadow-[0_0_15px_#06b6d4]" />
                            <div className="w-3 h-3 rotate-45 border border-cyan-500" />
                        </div>
                        <div className="w-48 h-[1px] bg-gradient-to-l from-transparent to-cyan-500" />
                    </div>

                </div>
            </main>

            {/* Floating Animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(1deg); }
                }
                .animate-float {
                    animation: float ease-in-out infinite;
                }
            `}} />
        </div>
    );
}
