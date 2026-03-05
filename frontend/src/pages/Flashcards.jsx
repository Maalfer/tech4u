import React, { useState, useEffect } from 'react';
import {
    Sword,
    Shield,
    Ghost,
    Flame,
    Sparkles,
    Skull,
    Zap,
    Scroll,
    Compass,
    Crown,
    Layers,
    ChevronLeft,
    ChevronRight,
    RotateCcw
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import api from '../services/api';

export default function Flashcards() {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState('general');

    const fetchFlashcards = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tests/questions', { params: { subject, limit: 50 } });
            setQuestions(res.data);
            setCurrentIndex(0);
            setFlipped(false);
        } catch (err) {
            console.error("Error fetching flashcards", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlashcards();
    }, [subject]);

    const handleNext = () => {
        setFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % questions.length);
        }, 150);
    };

    const handlePrev = () => {
        setFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
        }, 150);
    };

    const getAnswerText = (q) => {
        if (!q) return "";
        const mapping = {
            'a': q.option_a,
            'b': q.option_b,
            'c': q.option_c,
            'd': q.option_d
        };
        return mapping[q.correct_answer.toLowerCase()] || "Respuesta no disponible";
    };

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-orange-500/30">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 overflow-hidden relative">
                {/* RPG Ambient Atmosphere */}
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-orange-600/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-900/10 blur-[100px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.15] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />

                {/* Legend Header */}
                <PageHeader
                    title={<>Quest<span className="text-white">Cards</span></>}
                    subtitle="Codex of Mastery"
                    Icon={Sword}
                    gradient="from-white via-orange-100 to-orange-500"
                    iconColor="text-orange-500"
                    iconBg="bg-orange-500/20"
                    iconBorder="border-orange-500/30"
                    glowColor="bg-orange-500/20"
                >
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <span className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3 group hover:border-orange-500/30 transition-all">
                                <Scroll className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                                    <span className="text-orange-500 font-black">{questions.length}</span> Tomos Descubiertos
                                </p>
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[280px]">
                            <div className="flex items-center gap-2 mb-1">
                                <Compass className="w-3 h-3 text-slate-500" />
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">Elegir Reino</label>
                            </div>
                            <div className="relative group">
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-black/60 backdrop-blur-2xl border-2 border-white/5 rounded-2xl px-6 py-4 text-xs font-black text-orange-400 outline-none focus:border-orange-500/50 appearance-none shadow-2xl cursor-pointer hover:bg-orange-500/5 transition-all uppercase tracking-tighter"
                                >
                                    <option value="general">Materia: Todas</option>
                                    <option value="Bases de Datos">Bases de Datos</option>
                                    <option value="Redes">Redes</option>
                                    <option value="Sistemas Operativos">Sistemas Operativos</option>
                                    <option value="Ciberseguridad">Ciberseguridad</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500/40">
                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                </div>
                            </div>
                        </div>
                    </div>
                </PageHeader>

                {
                    loading ? (
                        <div className="h-[50vh] flex flex-col items-center justify-center gap-6" >
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 border-4 border-orange-500/10 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin" />
                                <div className="absolute inset-4 border-4 border-b-blue-500/40 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                                <Skull className="w-10 h-10 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-mono text-orange-600 uppercase tracking-[0.4em] font-black italic">Consultando Crónicas Antiguas...</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-2">Invocando contenido del Reino {subject === 'general' ? 'Universal' : subject}</p>
                            </div>
                        </div>
                    ) : questions.length > 0 ? (
                        <div className="max-w-2xl mx-auto relative z-10">
                            {/* THE SACRED CARD (RPG TGC STYLE) */}
                            <div
                                className="relative h-[560px] w-full perspective-2000 cursor-pointer group"
                                onClick={() => setFlipped(!flipped)}
                            >
                                {/* Card Gloom/Aura */}
                                <div className="absolute -inset-10 bg-gradient-to-br from-orange-500/20 via-transparent to-purple-500/20 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                <div className={`relative w-full h-full transition-all duration-[0.9s] cubic-bezier(0.34, 1.56, 0.64, 1) preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>

                                    {/* CARD FRONT: THE CHALLENGE */}
                                    <div className="absolute inset-0 backface-hidden rounded-[3rem] p-1.5 flex flex-col bg-gradient-to-b from-[#1a1a1a] via-[#0a0a0a] to-[#000] border-2 border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
                                        <div className="absolute inset-2 border-2 border-white/5 rounded-[2.5rem] pointer-events-none" />

                                        {/* TGC Visual Header Decor */}
                                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent opacity-50" />
                                        <div className="absolute top-6 flex justify-center w-full">
                                            <div className="px-6 py-1.5 rounded-full border border-orange-500/30 bg-black/80 backdrop-blur-md flex items-center gap-2">
                                                <Flame className="w-3 h-3 text-orange-500 animate-[pulse_2s_infinite]" />
                                                <span className="text-[9px] font-mono font-black text-orange-500 uppercase tracking-[0.3em]">Nivel de Desafío</span>
                                            </div>
                                        </div>

                                        <div className="relative h-full flex flex-col items-center justify-center p-14 text-center">
                                            <div className="mb-12 relative">
                                                <div className="absolute inset-0 bg-orange-500/20 blur-2xl animate-pulse" />
                                                <div className="relative p-6 bg-gradient-to-tr from-orange-500/10 to-transparent border-2 border-orange-500/20 rounded-3xl backdrop-blur-xl group-hover:scale-110 transition-transform duration-700 shadow-2xl">
                                                    <Ghost className="w-12 h-12 text-orange-500" />
                                                </div>
                                            </div>

                                            <div className="relative overflow-hidden px-2">
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-20">
                                                    <Zap className="w-20 h-20 text-orange-500" />
                                                </div>
                                                <h2 className="text-3xl font-black text-white leading-[1.15] tracking-[ -0.01em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] relative z-10">
                                                    {questions[currentIndex].text}
                                                </h2>
                                            </div>

                                            <div className="mt-16 flex flex-col items-center gap-5">
                                                <div className="flex gap-2.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-[bounce_1s_infinite_0ms]" />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-[bounce_1s_infinite_200ms]" />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-[bounce_1s_infinite_400ms]" />
                                                </div>
                                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em] font-black italic tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Invocar Verdad</p>
                                            </div>
                                        </div>

                                        {/* TGC Corner Symbols */}
                                        <div className="absolute top-10 left-10 opacity-20"><Shield className="w-5 h-5" /></div>
                                        <div className="absolute top-10 right-10 opacity-20"><Zap className="w-5 h-5" /></div>
                                        <div className="absolute bottom-10 left-10 opacity-20"><Ghost className="w-5 h-5" /></div>
                                        <div className="absolute bottom-10 right-10 opacity-20"><Flame className="w-5 h-5" /></div>
                                    </div>

                                    {/* CARD BACK: THE TRUTH */}
                                    <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-[3rem] p-1.5 flex flex-col bg-gradient-to-tr from-[#050505] via-[#111] to-[#1a0f02] border-2 border-orange-500/40 shadow-[0_0_100px_rgba(255,165,0,0.15)] overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-[0.05] animate-pulse" />
                                        <div className="absolute inset-2 border-2 border-orange-500/10 rounded-[2.5rem] pointer-events-none" />

                                        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
                                            <div className="mb-10 relative">
                                                <div className="absolute inset-0 bg-orange-500/40 blur-[40px] animate-pulse rounded-full" />
                                                <div className="relative p-6 bg-orange-500 rounded-[2rem] shadow-[0_0_50px_rgba(255,165,0,0.4)] group-hover:rotate-[360deg] transition-transform duration-[1.5s]">
                                                    <Crown className="w-14 h-14 text-black" />
                                                </div>
                                            </div>

                                            <div className="relative z-10 self-stretch animate-in zoom-in fade-in duration-1000">
                                                <div className="bg-white/[0.03] border-2 border-white/5 p-10 rounded-[2.5rem] shadow-inner backdrop-blur-3xl relative overflow-hidden group/reveal">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.03] to-transparent pointer-events-none" />
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

                                                    <h3 className="text-4xl font-black text-orange-500 uppercase tracking-tighter italic mb-4 drop-shadow-[0_0_15px_rgba(255,165,0,0.4)]">
                                                        {questions[currentIndex].correct_answer.toUpperCase()}
                                                    </h3>
                                                    <p className="text-2xl font-black text-white mb-8 leading-tight tracking-tight">
                                                        {getAnswerText(questions[currentIndex])}
                                                    </p>

                                                    <div className="h-px w-32 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent mx-auto mb-8" />

                                                    <div className="max-h-32 overflow-y-auto custom-scrollbar px-4">
                                                        <p className="text-xs font-mono text-slate-400 leading-relaxed italic tracking-wide">
                                                            {questions[currentIndex].explanation || "Las crónicas no contienen detalles adicionales de este tomo arcano."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Progress Gems */}
                                            <div className="mt-12 flex gap-2">
                                                {Array.from({ length: 8 }).map((_, i) => (
                                                    <div key={i} className={`w-2.5 h-2.5 rounded-full rotate-45 border border-white/10 ${i < 3 ? 'bg-orange-500 shadow-[0_0_10px_rgba(255,165,0,0.5)]' : 'bg-black/40'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* LEGENDARY CONTROLS */}
                            <div className="mt-16 relative">
                                <div className="flex items-center justify-between px-4 mb-12">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                        className="p-6 rounded-3xl bg-black/40 border-2 border-white/5 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all group active:scale-90 shadow-2xl relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <ChevronLeft className="w-10 h-10 text-slate-600 group-hover:text-orange-500 transition-colors" />
                                    </button>

                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-6 font-black text-4xl mb-3 tracking-tighter">
                                            <span className="text-orange-500 font-mono drop-shadow-[0_0_20px_rgba(255,165,0,0.5)]">
                                                {String(currentIndex + 1).padStart(2, '0')}
                                            </span>
                                            <div className="h-8 w-px bg-white/10 rotate-[20deg]" />
                                            <span className="text-slate-800 font-mono">
                                                {String(questions.length).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-mono text-slate-500 uppercase tracking-[0.3em] font-black">
                                                Nivel del Codex
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                        className="p-6 rounded-3xl bg-black/40 border-2 border-white/5 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all group active:scale-90 shadow-2xl relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <ChevronRight className="w-10 h-10 text-slate-600 group-hover:text-orange-500 transition-colors" />
                                    </button>
                                </div>

                                <div className="flex justify-center gap-6 relative z-20">
                                    <button
                                        onClick={() => setFlipped(!flipped)}
                                        className="flex items-center gap-4 px-14 py-6 rounded-[2rem] bg-gradient-to-r from-orange-600 to-orange-400 text-black text-[13px] font-black uppercase tracking-[0.2em] hover:scale-105 hover:shadow-[0_0_50px_rgba(255,165,0,0.4)] transition-all duration-500 group relative overflow-hidden shadow-2xl"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        <RotateCcw className={`w-5 h-5 group-hover:rotate-[360deg] transition-transform duration-1000`} />
                                        Transmutar
                                    </button>
                                    <button
                                        onClick={() => handleNext()}
                                        className="flex items-center gap-4 px-12 py-6 rounded-[2rem] bg-white/[0.03] border-2 border-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/5 hover:text-white/80 hover:border-white/10 transition-all backdrop-blur-3xl group"
                                    >
                                        Flee Realm <Ghost className="w-4 h-4 text-slate-600 group-hover:text-white" />
                                    </button>
                                </div>

                                {/* Background Progress Rail */}
                                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-y-1/2 -z-10" />
                            </div>
                        </div>
                    ) : (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center relative z-10 animate-in zoom-in duration-1000">
                            <div className="w-48 h-48 bg-slate-900/40 rounded-[3rem] flex items-center justify-center mb-10 border-2 border-white/5 border-dashed relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent blur-2xl" />
                                <Layers className="w-24 h-24 text-slate-800 transition-transform group-hover:scale-110 duration-700" />
                                <Skull className="w-12 h-12 text-slate-700 absolute -bottom-2 -right-2 opacity-30 animate-pulse" />
                            </div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-slate-400 italic">Abismo Vacío</h2>
                            <p className="text-slate-600 font-mono text-xs uppercase tracking-[0.5em] max-w-sm font-bold leading-relaxed">No se han encontrado pergaminos de sabiduría en este reino perdido.</p>
                            <button
                                onClick={() => setSubject('general')}
                                className="mt-12 px-14 py-5 bg-orange-500/10 border-2 border-orange-500/30 text-orange-500 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-orange-500 hover:text-black transition-all shadow-[0_0_30px_rgba(255,165,0,0.1)]"
                            >
                                Retornar al Origen
                            </button>
                        </div>
                    )
                }
            </main >

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                .perspective-2000 { 
                    perspective: 2000px; 
                }
                .preserve-3d { 
                    transform-style: preserve-3d; 
                    will-change: transform;
                }
                .backface-hidden { 
                    backface-visibility: hidden; 
                    -webkit-backface-visibility: hidden;
                    transform: translateZ(2px);
                }
                .rotate-y-180 { 
                    transform: rotateY(180deg) translateZ(2px); 
                }
                .glass {
                    background: rgba(10, 10, 10, 0.85);
                    backdrop-filter: blur(40px);
                    -webkit-backdrop-filter: blur(40px);
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 165, 0, 0.3); border-radius: 10px; }
                
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                
                .cubic-bezier {
                    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
                }
            `}} />
        </div >
    );
}
