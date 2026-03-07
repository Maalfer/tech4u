import React from 'react';
import { Sparkles, Swords, ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

// Reemplaza esto con las rutas reales de tus imágenes en assets
import monsterImg from '../assets/guerrero-hacker.png';
import magaImg from '../assets/maga-hacker.png';

export default function Cybersecurity() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative overflow-hidden flex flex-col items-center justify-center">

                {/* ── AMBIENT BACKGROUND ── */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-600/5 blur-[180px] rounded-full mix-blend-screen" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-600/5 blur-[180px] rounded-full mix-blend-screen" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/90 to-[#050505]" />
                </div>

                {/* ── CONTENT CONTAINER ── */}
                <div className="relative z-10 max-w-full w-full text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-12 duration-1000 px-4">

                    {/* BACK BUTTON — kept outside PageHeader as a standalone button */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center gap-3 mb-8 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 rounded-2xl transition-all duration-500 font-mono text-xs uppercase tracking-[0.3em] text-slate-400 hover:text-orange-400 shadow-2xl backdrop-blur-md active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
                        Volver al campamento
                    </button>

                    {/* BATTLE SCENE - NORMALIZED SCALE */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full mb-12 relative mt-4">

                        {/* MAGA HACKER (Left) */}
                        <div className="relative group w-48 h-48 md:w-80 md:h-80 lg:w-96 lg:h-96 flex-shrink-0 z-20 animate-float" style={{ animationDuration: '7s' }}>
                            <img
                                src={magaImg}
                                alt="Maga Hacker"
                                className="relative z-10 w-full h-full object-contain transform transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://cdn-icons-png.flaticon.com/512/8200/8200371.png'; }}
                            />
                            {/* Battle Icons - Swords instead of stars */}
                            <div className="absolute top-1/4 right-0 md:-right-8 space-y-4 flex flex-col items-center">
                                <Swords className="w-10 h-10 md:w-12 md:h-12 text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-bounce" style={{ animationDelay: '0s' }} />
                                <Swords className="w-6 h-6 md:w-8 md:h-8 text-orange-400/60 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)] animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                        </div>

                        {/* CLASH CENTER (VS) */}
                        <div className="relative z-30 flex flex-col items-center justify-center -my-8 md:my-0">
                            <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full animate-pulse" />
                            <div className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-black/80 border-2 border-white/20 backdrop-blur-xl z-40 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                                <Zap className="w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 text-yellow-500 animate-pulse drop-shadow-[0_0_30px_rgba(234,179,8,1)]" />
                                <div className="absolute -inset-2 md:-inset-4 border border-white/10 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
                                <div className="absolute -inset-4 md:-inset-8 border border-white/5 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                            </div>
                        </div>

                        {/* MONSTER (Right) */}
                        <div className="relative group w-48 h-48 md:w-80 md:h-80 lg:w-96 lg:h-96 flex-shrink-0 z-20 animate-float" style={{ animationDuration: '6.5s', animationDelay: '0.5s' }}>
                            <img
                                src={monsterImg}
                                alt="Guerrero Hacker Monstruo"
                                className="relative z-10 w-full h-full object-contain transform [transform:rotateY(180deg)] transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://cdn-icons-png.flaticon.com/512/8200/8200371.png'; }}
                            />
                            {/* Enemy Battle Icons - Swords */}
                            <div className="absolute top-1/4 left-0 md:-left-8 space-y-4 flex flex-col items-center">
                                <Swords className="w-10 h-10 md:w-12 md:h-12 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <Swords className="w-6 h-6 md:w-8 md:h-8 text-red-400/60 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-bounce" style={{ animationDelay: '0.3s' }} />
                            </div>
                        </div>

                        {/* Impact Energy Beam */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] md:h-[450px] bg-gradient-to-r from-transparent via-orange-500/5 to-transparent blur-[80px] md:blur-[120px] -z-10" />
                    </div>

                    {/* TYPOGRAPHY - NORMALIZED */}
                    <div className="space-y-6 relative z-30 max-w-4xl mx-auto text-center px-4 mt-8 md:mt-12">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-64 md:w-96 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-[0.2em] md:tracking-[0.4em] bg-clip-text text-transparent bg-gradient-to-b from-white via-stone-200 to-stone-500 drop-shadow-xl mb-4 md:mb-6">
                            Zona de Guerra
                        </h1>

                        <div className="inline-flex items-center gap-3 md:gap-6 px-6 md:px-12 py-3 md:py-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl mb-6 md:mb-10 group hover:border-orange-500/50 transition-colors duration-500">
                            <Swords className="w-6 h-6 md:w-10 md:h-10 text-orange-500 animate-pulse group-hover:rotate-45 transition-transform" />
                            <span className="text-sm md:text-lg font-mono font-black tracking-[0.3em] md:tracking-[0.6em] uppercase text-white">
                                Desbloqueo en Progreso
                            </span>
                            <Swords className="w-6 h-6 md:w-10 md:h-10 text-red-500 animate-pulse group-hover:-rotate-45 transition-transform" />
                        </div>

                        <p className="text-base md:text-xl lg:text-3xl text-slate-300 font-mono leading-relaxed drop-shadow-md font-light max-w-3xl mx-auto">
                            Nuestros <span className="text-orange-400 font-black tracking-widest uppercase border-b-2 border-orange-500/30">Guerreros Hackers</span> están luchando en esta mazmorra para neutralizar el cortafuegos.
                        </p>

                        <p className="text-xs md:text-sm lg:text-lg text-red-500 font-black uppercase tracking-[0.3em] md:tracking-[0.5em] animate-pulse mt-6 md:mt-8">
                            Nuevas misiones próximamente...
                        </p>
                    </div>

                    {/* DECORATIVE ORNAMENTS */}
                    <div className="mt-20 flex items-center justify-center gap-12 opacity-20">
                        <div className="w-48 h-[1px] bg-gradient-to-r from-transparent to-white" />
                        <div className="flex gap-4">
                            <div className="w-3 h-3 rotate-45 border border-white" />
                            <div className="w-3 h-3 rotate-45 bg-white shadow-[0_0_15px_white]" />
                            <div className="w-3 h-3 rotate-45 border border-white" />
                        </div>
                        <div className="w-48 h-[1px] bg-gradient-to-l from-transparent to-white" />
                    </div>

                </div>
            </main>

            {/* Floating Animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-40px) rotate(2deg); }
                }
                .animate-float {
                    animation: float ease-in-out infinite;
                }
            `}} />
        </div>
    );
}
