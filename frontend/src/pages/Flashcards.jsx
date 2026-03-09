import React, { useState } from 'react';
import {
    Sword,
    Shield,
    Ghost,
    Flame,
    Skull,
    Zap,
    Scroll,
    Crown,
    Layers,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Database,
    Globe2,
    Terminal,
    ArrowRight,
    BookOpen
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import api from '../services/api';

// ── Subject data ──────────────────────────────────────────────────────────────
const SUBJECTS = [
    {
        value: 'general',
        label: 'Todas las Materias',
        desc: 'Preguntas mixtas de todas las asignaturas ASIR',
        icon: <Layers className="w-8 h-8" />,
        color: 'text-orange-400',
        border: 'border-orange-500/40',
        activeBg: 'bg-orange-500/15',
        glow: 'shadow-[0_0_30px_rgba(255,165,0,0.2)]',
    },
    {
        value: 'Bases de Datos',
        label: 'Bases de Datos',
        desc: 'SQL, diseño relacional, consultas y modelado de datos',
        icon: <Database className="w-8 h-8" />,
        color: 'text-violet-400',
        border: 'border-violet-500/40',
        activeBg: 'bg-violet-500/15',
        glow: 'shadow-[0_0_30px_rgba(139,92,246,0.2)]',
    },
    {
        value: 'Redes',
        label: 'Redes Locales',
        desc: 'TCP/IP, subnetting, protocolos y topologías de red',
        icon: <Globe2 className="w-8 h-8" />,
        color: 'text-sky-400',
        border: 'border-sky-500/40',
        activeBg: 'bg-sky-500/15',
        glow: 'shadow-[0_0_30px_rgba(56,189,248,0.2)]',
    },
    {
        value: 'Sistemas Operativos',
        label: 'Sistemas Operativos',
        desc: 'Linux, Windows Server, comandos y administración del sistema',
        icon: <Terminal className="w-8 h-8" />,
        color: 'text-emerald-400',
        border: 'border-emerald-500/40',
        activeBg: 'bg-emerald-500/15',
        glow: 'shadow-[0_0_30px_rgba(52,211,153,0.2)]',
    },
    {
        value: 'Ciberseguridad',
        label: 'Ciberseguridad',
        desc: 'Vulnerabilidades, firewalls, cifrado y vectores de ataque',
        icon: <Shield className="w-8 h-8" />,
        color: 'text-red-400',
        border: 'border-red-500/40',
        activeBg: 'bg-red-500/15',
        glow: 'shadow-[0_0_30px_rgba(248,113,113,0.2)]',
    },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Flashcards() {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [started, setStarted] = useState(false);

    const fetchFlashcards = async (subj) => {
        setLoading(true);
        try {
            const res = await api.get('/tests/questions', { params: { subject: subj, limit: 50 } });
            setQuestions(res.data);
            setCurrentIndex(0);
            setFlipped(false);
        } catch (err) {
            console.error('Error fetching flashcards', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStart = () => {
        if (!selectedSubject) return;
        setStarted(true);
        fetchFlashcards(selectedSubject.value);
    };

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

    const handleReset = () => {
        setStarted(false);
        setSelectedSubject(null);
        setQuestions([]);
        setCurrentIndex(0);
        setFlipped(false);
    };

    const getAnswerText = (q) => {
        if (!q) return '';
        const mapping = { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d };
        return mapping[q.correct_answer.toLowerCase()] || 'Respuesta no disponible';
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

                {/* Header */}
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
                    <div className="flex items-center gap-6">
                        <span className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
                            <Scroll className="w-4 h-4 text-orange-400" />
                            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                                {started
                                    ? <><span className="text-orange-500 font-black">{questions.length}</span> Tomos · {selectedSubject?.label}</>
                                    : <span className="text-slate-500">Elige un reino primero</span>
                                }
                            </p>
                        </span>
                        {started && (
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-all uppercase tracking-widest"
                            >
                                ← Cambiar asignatura
                            </button>
                        )}
                    </div>
                </PageHeader>

                {/* ── LOBBY: SUBJECT SELECTION ── */}
                {!started && (
                    <div className="max-w-3xl mx-auto relative z-10">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                <span className="text-[10px] font-mono text-orange-500 uppercase tracking-[0.3em] font-bold">Selecciona tu Reino</span>
                            </div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-3">
                                ¿Qué asignatura quieres dominar?
                            </h2>
                            <p className="text-slate-500 font-mono text-sm max-w-md mx-auto">
                                Elige una materia para invocar sus cartas. Podrás cambiarla en cualquier momento.
                            </p>
                        </div>

                        {/* Subject cards grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {SUBJECTS.map((s) => {
                                const isSelected = selectedSubject?.value === s.value;
                                return (
                                    <button
                                        key={s.value}
                                        onClick={() => setSelectedSubject(s)}
                                        className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-300 group overflow-hidden
                                            ${isSelected
                                                ? `${s.border} ${s.activeBg} ${s.glow} scale-[1.02]`
                                                : 'border-white/5 bg-black/30 hover:border-white/15 hover:bg-white/3 hover:scale-[1.01]'
                                            }`}
                                    >
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                        )}
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                                <span className="text-black text-[10px] font-black">✓</span>
                                            </div>
                                        )}
                                        <div className={`mb-4 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'} ${s.color}`}>
                                            {s.icon}
                                        </div>
                                        <h3 className={`font-black text-base mb-1 transition-colors ${isSelected ? s.color : 'text-white'}`}>
                                            {s.label}
                                        </h3>
                                        <p className="text-xs font-mono text-slate-500 leading-relaxed">{s.desc}</p>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Start button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleStart}
                                disabled={!selectedSubject}
                                className={`flex items-center gap-4 px-14 py-5 rounded-[2rem] text-[13px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative overflow-hidden
                                    ${selectedSubject
                                        ? 'bg-gradient-to-r from-orange-600 to-orange-400 text-black hover:scale-105 hover:shadow-[0_0_50px_rgba(255,165,0,0.4)] shadow-2xl cursor-pointer'
                                        : 'bg-white/5 border-2 border-white/5 text-slate-700 cursor-not-allowed'
                                    }`}
                            >
                                {selectedSubject && (
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                )}
                                <BookOpen className="w-5 h-5" />
                                {selectedSubject ? `Comenzar · ${selectedSubject.label}` : 'Selecciona una asignatura'}
                                {selectedSubject && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── LOADING ── */}
                {started && loading && (
                    <div className="h-[50vh] flex flex-col items-center justify-center gap-6">
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 border-4 border-orange-500/10 rounded-full" />
                            <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin" />
                            <div className="absolute inset-4 border-4 border-b-blue-500/40 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                            <Skull className="w-10 h-10 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-mono text-orange-600 uppercase tracking-[0.4em] font-black italic">Consultando Crónicas Antiguas...</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-2">
                                Invocando tomos de {selectedSubject?.label || 'todos los reinos'}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── CARD GAME ── */}
                {started && !loading && questions.length > 0 && (
                    <div className="max-w-2xl mx-auto relative z-10">
                        {/* THE CARD */}
                        <div
                            className="relative h-[520px] w-full perspective-card cursor-pointer group"
                            onClick={() => setFlipped(!flipped)}
                        >
                            {/* Card Aura */}
                            <div className="absolute -inset-10 bg-gradient-to-br from-orange-500/15 via-transparent to-purple-500/15 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className={`relative w-full h-full card-flip preserve-3d ${flipped ? 'card-flipped' : ''}`}>

                                {/* FRONT */}
                                <div className="absolute inset-0 backface-hidden rounded-[3rem] p-1.5 bg-gradient-to-b from-[#1a1a1a] via-[#0a0a0a] to-[#000] border-2 border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
                                    <div className="absolute inset-2 border-2 border-white/5 rounded-[2.5rem] pointer-events-none" />
                                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent opacity-50" />

                                    <div className="absolute top-6 flex justify-center w-full">
                                        <div className="px-6 py-1.5 rounded-full border border-orange-500/30 bg-black/80 backdrop-blur-md flex items-center gap-2">
                                            <Flame className="w-3 h-3 text-orange-500 animate-[pulse_2s_infinite]" />
                                            <span className="text-[9px] font-mono font-black text-orange-500 uppercase tracking-[0.3em]">
                                                {selectedSubject?.label || 'Todas las Materias'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="relative h-full flex flex-col items-center justify-center p-14 text-center">
                                        <div className="mb-10 relative">
                                            <div className="absolute inset-0 bg-orange-500/20 blur-2xl animate-pulse" />
                                            <div className="relative p-5 bg-gradient-to-tr from-orange-500/10 to-transparent border-2 border-orange-500/20 rounded-3xl backdrop-blur-xl group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                                                <Ghost className="w-10 h-10 text-orange-500" />
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-black text-white leading-[1.2] tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] relative z-10 px-2">
                                            {questions[currentIndex].text}
                                        </h2>

                                        <div className="mt-12 flex flex-col items-center gap-4">
                                            <div className="flex gap-2.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-[bounce_1s_infinite_0ms]" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-[bounce_1s_infinite_200ms]" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-[bounce_1s_infinite_400ms]" />
                                            </div>
                                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] font-black italic opacity-60 group-hover:opacity-100 transition-opacity">
                                                Toca para revelar respuesta
                                            </p>
                                        </div>
                                    </div>

                                    <div className="absolute top-10 left-10 opacity-20"><Shield className="w-5 h-5" /></div>
                                    <div className="absolute top-10 right-10 opacity-20"><Zap className="w-5 h-5" /></div>
                                    <div className="absolute bottom-10 left-10 opacity-20"><Ghost className="w-5 h-5" /></div>
                                    <div className="absolute bottom-10 right-10 opacity-20"><Flame className="w-5 h-5" /></div>
                                </div>

                                {/* BACK */}
                                <div className="absolute inset-0 backface-hidden card-back rounded-[3rem] p-1.5 bg-gradient-to-tr from-[#050505] via-[#111] to-[#1a0f02] border-2 border-orange-500/40 shadow-[0_0_80px_rgba(255,165,0,0.12)] overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-[0.05]" />
                                    <div className="absolute inset-2 border-2 border-orange-500/10 rounded-[2.5rem] pointer-events-none" />

                                    <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
                                        <div className="mb-8 relative">
                                            <div className="absolute inset-0 bg-orange-500/40 blur-[40px] rounded-full" />
                                            <div className="relative p-5 bg-orange-500 rounded-[2rem] shadow-[0_0_40px_rgba(255,165,0,0.4)]">
                                                <Crown className="w-12 h-12 text-black" />
                                            </div>
                                        </div>

                                        <div className="relative z-10 self-stretch">
                                            <div className="bg-white/[0.03] border-2 border-white/5 p-8 rounded-[2.5rem] shadow-inner backdrop-blur-3xl relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.03] to-transparent pointer-events-none" />
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

                                                <h3 className="text-3xl font-black text-orange-500 uppercase tracking-tighter italic mb-3 drop-shadow-[0_0_15px_rgba(255,165,0,0.4)]">
                                                    {questions[currentIndex].correct_answer.toUpperCase()}
                                                </h3>
                                                <p className="text-xl font-black text-white mb-6 leading-tight tracking-tight">
                                                    {getAnswerText(questions[currentIndex])}
                                                </p>

                                                <div className="h-px w-24 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent mx-auto mb-6" />

                                                <div className="max-h-28 overflow-y-auto custom-scrollbar px-2">
                                                    <p className="text-xs font-mono text-slate-400 leading-relaxed italic">
                                                        {questions[currentIndex].explanation || 'Las crónicas no contienen detalles adicionales de este tomo arcano.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CONTROLS */}
                        <div className="mt-12 relative">
                            <div className="flex items-center justify-between px-4 mb-10">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                    className="p-5 rounded-3xl bg-black/40 border-2 border-white/5 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all group active:scale-90 shadow-2xl"
                                >
                                    <ChevronLeft className="w-8 h-8 text-slate-600 group-hover:text-orange-500 transition-colors" />
                                </button>

                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-5 font-black text-4xl mb-2 tracking-tighter">
                                        <span className="text-orange-500 font-mono drop-shadow-[0_0_20px_rgba(255,165,0,0.5)]">
                                            {String(currentIndex + 1).padStart(2, '0')}
                                        </span>
                                        <div className="h-8 w-px bg-white/10 rotate-[20deg]" />
                                        <span className="text-slate-800 font-mono">
                                            {String(questions.length).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-mono text-slate-500 uppercase tracking-[0.3em] font-black">
                                        {selectedSubject?.label || 'Todas las Materias'}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                    className="p-5 rounded-3xl bg-black/40 border-2 border-white/5 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all group active:scale-90 shadow-2xl"
                                >
                                    <ChevronRight className="w-8 h-8 text-slate-600 group-hover:text-orange-500 transition-colors" />
                                </button>
                            </div>

                            <div className="flex justify-center gap-5">
                                {/* Voltear */}
                                <button
                                    onClick={() => setFlipped(!flipped)}
                                    className="flex items-center gap-3 px-12 py-5 rounded-[2rem] bg-gradient-to-r from-orange-600 to-orange-400 text-black text-[12px] font-black uppercase tracking-[0.2em] hover:scale-105 hover:shadow-[0_0_40px_rgba(255,165,0,0.4)] transition-all duration-300 group relative overflow-hidden shadow-2xl"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                    <RotateCcw className="w-4 h-4 group-hover:rotate-[360deg] transition-transform duration-500" />
                                    Voltear
                                </button>
                                {/* Siguiente */}
                                <button
                                    onClick={() => handleNext()}
                                    className="flex items-center gap-3 px-10 py-5 rounded-[2rem] bg-white/[0.04] border-2 border-white/10 text-white/50 text-[11px] font-black uppercase tracking-[0.25em] hover:bg-white/8 hover:text-white/90 hover:border-white/20 transition-all backdrop-blur-3xl group"
                                >
                                    Siguiente <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── EMPTY STATE ── */}
                {started && !loading && questions.length === 0 && (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center relative z-10">
                        <div className="w-40 h-40 bg-slate-900/40 rounded-[3rem] flex items-center justify-center mb-10 border-2 border-white/5 border-dashed relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent blur-2xl" />
                            <Layers className="w-20 h-20 text-slate-800 transition-transform group-hover:scale-110 duration-700" />
                            <Skull className="w-10 h-10 text-slate-700 absolute -bottom-2 -right-2 opacity-30 animate-pulse" />
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-slate-400 italic">Abismo Vacío</h2>
                        <p className="text-slate-600 font-mono text-xs uppercase tracking-[0.5em] max-w-sm font-bold leading-relaxed">
                            No se han encontrado pergaminos en el reino de {selectedSubject?.label}.
                        </p>
                        <button
                            onClick={handleReset}
                            className="mt-10 px-12 py-4 bg-orange-500/10 border-2 border-orange-500/30 text-orange-500 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-orange-500 hover:text-black transition-all shadow-[0_0_30px_rgba(255,165,0,0.1)]"
                        >
                            ← Cambiar asignatura
                        </button>
                    </div>
                )}
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-card { perspective: 1400px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
                .card-back { transform: rotateY(180deg) translateZ(2px); }
                .card-flip { transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
                .card-flipped { transform: rotateY(180deg); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,165,0,0.3); border-radius: 10px; }
            `}} />
        </div>
    );
}
