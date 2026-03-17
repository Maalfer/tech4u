import React, { useState, useEffect, useMemo } from 'react';
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
    BookOpen,
    Sparkles,
    Brain,
    Star,
    Calendar,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import { FlashSubjectCoverComponent } from '../components/FlashcardCovers';

// ── Hero (shown only on subject selection screen) ─────────────────────────────
function FlashcardsHero() {
    return (
        <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/8"
             style={{ background: 'linear-gradient(135deg, #120600 0%, #1a0900 40%, #0f0500 100%)' }}>
            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.07]"
                 style={{
                     backgroundImage: `linear-gradient(rgba(249,115,22,0.6) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(249,115,22,0.6) 1px, transparent 1px)`,
                     backgroundSize: '42px 42px'
                 }} />

            {/* Glows */}
            <div className="absolute top-0 left-1/4 w-[480px] h-64 rounded-full opacity-20 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.45) 0%, transparent 70%)', filter: 'blur(50px)' }} />
            <div className="absolute bottom-0 right-1/3 w-80 h-52 rounded-full opacity-15 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(234,88,12,0.35) 0%, transparent 70%)', filter: 'blur(55px)' }} />
            <div className="absolute top-1/2 right-8 w-64 h-48 rounded-full opacity-10 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.3) 0%, transparent 70%)', filter: 'blur(60px)' }} />

            {/* Bottom edge */}
            <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                 style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent)' }} />

            <div className="relative z-10 px-10 pt-12 pb-11">
                {/* Badge row */}
                <div className="flex items-center gap-3 mb-7 flex-wrap">
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-sm"
                         style={{ borderColor: 'rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.08)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                            QuestCards · Codex of Mastery
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                        <Brain size={10} className="text-orange-400" />
                        <span className="text-[10px] font-mono text-slate-500">Modo flashcard · Repasa sin límite</span>
                    </div>
                </div>

                {/* Headline */}
                <div className="mb-7">
                    <h1 className="text-6xl font-black tracking-tight leading-none mb-4">
                        <span className="text-white">Memoriza y</span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(90deg, #fb923c 0%, #f97316 40%, #ea580c 80%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Domina el Temario
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                        Flashcards interactivas para repasar conceptos clave.{' '}
                        <span className="text-slate-300 font-medium">Voltea cada carta y pon a prueba tu memoria.</span>
                    </p>
                </div>

                {/* Stats pills */}
                <div className="flex items-center gap-3 flex-wrap">
                    {[
                        { label: 'Asignaturas', value: '5',      color: 'text-orange-400' },
                        { label: 'Hasta 50 cartas', value: '×',  color: 'text-amber-400' },
                        { label: 'Sin límite tiempo', value: '∞', color: 'text-purple-400' },
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

// Quality rating labels and colors
const QUALITY_OPTIONS = [
  { q: 0, label: 'Sin idea', color: 'bg-red-600' },
  { q: 2, label: 'Muy difícil', color: 'bg-orange-500' },
  { q: 3, label: 'Con esfuerzo', color: 'bg-yellow-500' },
  { q: 4, label: 'Bien', color: 'bg-emerald-500' },
  { q: 5, label: 'Perfecto', color: 'bg-sky-500' },
];

export default function Flashcards() {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [started, setStarted] = useState(false);
    const [progressData, setProgressData] = useState({});
    const [dueCardIds, setDueCardIds] = useState([]);
    const [reviewMode, setReviewMode] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [sessionStats, setSessionStats] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(false);

    const fetchFlashcards = async (subj) => {
        setLoading(true);
        try {
            const res = await api.get('/tests/questions', { params: { subject: subj, limit: 50 } });
            setQuestions(res.data);
            setCurrentIndex(0);
            setFlipped(false);
            // Load spaced repetition data
            await fetchProgressAndDue();
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error fetching flashcards', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProgressAndDue = async () => {
        setLoadingProgress(true);
        try {
            const [progressRes, dueRes] = await Promise.all([
                api.get('/flashcards/spaced/progress').catch(() => ({ data: {} })),
                api.get('/flashcards/spaced/due').catch(() => ({ data: [] }))
            ]);
            setProgressData(progressRes.data || {});
            setDueCardIds(dueRes.data || []);
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error fetching spaced repetition data', err);
        } finally {
            setLoadingProgress(false);
        }
    };

    const handleQualityRating = async (quality) => {
        const currentCard = questions[currentIndex];
        if (!currentCard) return;

        try {
            await api.post('/flashcards/spaced/review', {
                card_id: currentCard.id,
                quality: quality
            });
            // Refresh progress data
            await fetchProgressAndDue();
            // Move to next card
            handleNext();
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error submitting review', err);
        }
    };

    // Sort questions: due cards first, then new cards, then scheduled cards
    const sortedQuestions = useMemo(() => {
        return [...questions].sort((a, b) => {
            const aIsDue = dueCardIds.includes(a.id);
            const bIsDue = dueCardIds.includes(b.id);
            const aHasProgress = progressData[a.id];
            const bHasProgress = progressData[b.id];

            // Due cards first
            if (aIsDue && !bIsDue) return -1;
            if (!aIsDue && bIsDue) return 1;

            // Then new cards (no progress)
            if (!aHasProgress && bHasProgress) return -1;
            if (aHasProgress && !bHasProgress) return 1;

            // Then by original order
            return questions.indexOf(a) - questions.indexOf(b);
        });
    }, [questions, dueCardIds, progressData]);

    // Filter to only due cards if review mode is on
    const displayedQuestions = useMemo(() => {
        if (!reviewMode) return sortedQuestions;
        return sortedQuestions.filter(q => dueCardIds.includes(q.id));
    }, [sortedQuestions, reviewMode, dueCardIds]);

    // Get card status badge
    const getCardStatus = (cardId) => {
        if (dueCardIds.includes(cardId)) {
            return { icon: '🔴', label: 'Repasar hoy', color: 'text-red-400' };
        }
        const progress = progressData[cardId];
        if (progress?.next_review) {
            const nextDate = new Date(progress.next_review);
            const today = new Date();
            const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
            if (daysUntil > 0) {
                return { icon: '🟡', label: `En ${daysUntil} días`, color: 'text-yellow-400' };
            }
        }
        if (!progress) {
            return { icon: '⚪', label: 'Nueva', color: 'text-slate-400' };
        }
        return null;
    };

    const handleStart = () => {
        if (!selectedSubject) return;
        setStarted(true);
        fetchFlashcards(selectedSubject.value);
    };

    const handleNext = () => {
        setFlipped(false);
        setTimeout(() => {
            const nextIndex = currentIndex + 1;
            if (nextIndex >= displayedQuestions.length) {
                // Session complete - show summary if in review mode
                if (reviewMode) {
                    setSessionComplete(true);
                    const dueTodayCount = dueCardIds.length - 1; // minus the one we just reviewed
                    const nextSessionDate = new Date();
                    nextSessionDate.setDate(nextSessionDate.getDate() + 1);
                    setSessionStats({
                        reviewed: nextIndex,
                        remaining: dueTodayCount > 0 ? dueTodayCount : 0,
                        nextDate: nextSessionDate.toLocaleDateString('es-ES', { weekday: 'long' })
                    });
                }
            } else {
                setCurrentIndex(nextIndex);
            }
        }, 150);
    };

    const handlePrev = () => {
        setFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + displayedQuestions.length) % displayedQuestions.length);
        }, 150);
    };

    const handleReset = () => {
        setStarted(false);
        setSelectedSubject(null);
        setQuestions([]);
        setCurrentIndex(0);
        setFlipped(false);
        setSessionComplete(false);
        setSessionStats(null);
        setReviewMode(false);
    };

    const handleResumeReview = () => {
        setSessionComplete(false);
        setSessionStats(null);
        setCurrentIndex(0);
    };

    const getAnswerText = (q) => {
        if (!q) return '';
        const mapping = { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d };
        return mapping[q.correct_answer.toLowerCase()] || 'Respuesta no disponible';
    };

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-orange-500/30">
            <Sidebar />

            <main className="flex-1 ml-0 md:ml-64 p-10 overflow-hidden relative">
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
                                    ? <>
                                        <span className="text-orange-500 font-black">{reviewMode ? dueCardIds.length : displayedQuestions.length}</span> Tomos · {selectedSubject?.label}
                                        {reviewMode && <span className="text-amber-400 ml-2">🔄 Modo Repaso</span>}
                                    </>
                                    : <span className="text-slate-500">Elige un reino primero</span>
                                }
                            </p>
                        </span>
                        {started && !sessionComplete && (
                            <>
                                <button
                                    onClick={() => setReviewMode(!reviewMode)}
                                    className={`px-4 py-2 rounded-xl border text-[10px] font-mono uppercase tracking-widest transition-all ${
                                        reviewMode
                                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-orange-400 hover:border-orange-500/30'
                                    }`}
                                >
                                    {reviewMode ? '✓ Modo repaso' : 'Modo repaso'}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-all uppercase tracking-widest"
                                >
                                    ← Cambiar asignatura
                                </button>
                            </>
                        )}
                        {sessionComplete && (
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-all uppercase tracking-widest"
                            >
                                ← Volver
                            </button>
                        )}
                    </div>
                </PageHeader>

                {/* ── LOBBY: SUBJECT SELECTION ── */}
                {!started && (
                    <div className="relative z-10">
                        <FlashcardsHero />
                    <div className="max-w-3xl mx-auto">
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

                        {/* Subject cards grid — full-bleed SVG covers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                            {SUBJECTS.map((s) => {
                                const isSelected = selectedSubject?.value === s.value;
                                return (
                                    <button
                                        key={s.value}
                                        onClick={() => setSelectedSubject(s)}
                                        className={`group relative rounded-2xl overflow-hidden cursor-pointer text-left transition-all duration-300 hover:-translate-y-2 ${isSelected ? 'scale-[1.02]' : ''}`}
                                        style={{
                                            aspectRatio: '4/5',
                                            border: isSelected ? `1.5px solid rgba(249,115,22,0.7)` : `1.5px solid rgba(255,255,255,0.08)`,
                                            boxShadow: isSelected ? '0 8px 40px rgba(249,115,22,0.25)' : 'none',
                                        }}
                                        onMouseEnter={e => {
                                            if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                                        }}
                                        onMouseLeave={e => {
                                            if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                        }}
                                    >
                                        {/* SVG Cover — full-bleed background */}
                                        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                                            <FlashSubjectCoverComponent value={s.value} />
                                        </div>

                                        {/* Dark gradient overlay */}
                                        <div className="absolute inset-0" style={{
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.5) 42%, rgba(0,0,0,0.05) 70%, transparent 100%)',
                                        }} />

                                        {/* Top accent bar */}
                                        <div className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300"
                                            style={{
                                                background: 'linear-gradient(90deg, transparent, rgba(249,115,22,1), transparent)',
                                                opacity: isSelected ? 1 : 0.45,
                                            }} />

                                        {/* Selected checkmark */}
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center z-10">
                                                <span className="text-black text-[11px] font-black">✓</span>
                                            </div>
                                        )}

                                        {/* Bottom content overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
                                            <div className={`transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'} ${s.color}`}>
                                                {s.icon}
                                            </div>
                                            <h3 className={`font-black text-sm uppercase italic leading-tight tracking-tight transition-colors ${isSelected ? 'text-orange-300' : 'text-white'}`}>
                                                {s.label}
                                            </h3>
                                            <p className="text-[9px] font-mono text-slate-500 leading-relaxed">{s.desc}</p>
                                        </div>
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

                {/* ── SESSION COMPLETE SUMMARY ── */}
                {started && !loading && sessionComplete && sessionStats && (
                    <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center justify-center h-[60vh]">
                        <div className="text-center">
                            <div className="mb-8 relative inline-block">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl" />
                                <div className="relative p-8 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-3xl">
                                    <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto" />
                                </div>
                            </div>
                            <h2 className="text-5xl font-black uppercase tracking-tighter text-emerald-400 mb-2">
                                ✅ Sesión Completada
                            </h2>
                            <p className="text-slate-400 font-mono text-sm mb-10">
                                ¡Excelente trabajo, aventurero!
                            </p>

                            <div className="space-y-4 mb-10">
                                <div className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <span className="text-slate-400 font-mono text-sm">Tarjetas repasadas</span>
                                    <span className="text-2xl font-black text-orange-500">🎯 {sessionStats.reviewed}</span>
                                </div>
                                <div className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <span className="text-slate-400 font-mono text-sm">Próxima sesión</span>
                                    <span className="text-lg font-black text-amber-400">📅 {sessionStats.nextDate}</span>
                                </div>
                                {sessionStats.remaining > 0 && (
                                    <div className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                        <span className="text-slate-400 font-mono text-sm">Pendientes</span>
                                        <span className="text-lg font-black text-sky-400">⏰ {sessionStats.remaining} tarjetas</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleReset}
                                className="px-12 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-400 text-black text-sm font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-lg"
                            >
                                Volver al menú
                            </button>
                        </div>
                    </div>
                )}

                {/* ── CARD GAME ── */}
                {started && !loading && !sessionComplete && displayedQuestions.length > 0 && (
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

                                    <div className="absolute top-6 flex justify-center w-full gap-2 px-4 flex-wrap">
                                        <div className="px-6 py-1.5 rounded-full border border-orange-500/30 bg-black/80 backdrop-blur-md flex items-center gap-2">
                                            <Flame className="w-3 h-3 text-orange-500 animate-[pulse_2s_infinite]" />
                                            <span className="text-[9px] font-mono font-black text-orange-500 uppercase tracking-[0.3em]">
                                                {selectedSubject?.label || 'Todas las Materias'}
                                            </span>
                                        </div>
                                        {getCardStatus(displayedQuestions[currentIndex]?.id) && (
                                            <div className={`px-4 py-1.5 rounded-full border border-white/20 bg-black/80 backdrop-blur-md flex items-center gap-2 ${getCardStatus(displayedQuestions[currentIndex]?.id).color}`}>
                                                <span className="text-[9px] font-mono font-black uppercase tracking-[0.3em]">
                                                    {getCardStatus(displayedQuestions[currentIndex]?.id).icon} {getCardStatus(displayedQuestions[currentIndex]?.id).label}
                                                </span>
                                            </div>
                                        )}
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

                                                <div className="max-h-24 overflow-y-auto custom-scrollbar px-2">
                                                    <p className="text-xs font-mono text-slate-400 leading-relaxed italic">
                                                        {displayedQuestions[currentIndex].explanation || 'Las crónicas no contienen detalles adicionales de este tomo arcano.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quality rating buttons */}
                                        {reviewMode && (
                                            <div className="mt-8 flex flex-wrap justify-center gap-2">
                                                {QUALITY_OPTIONS.map(option => (
                                                    <button
                                                        key={option.q}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleQualityRating(option.q);
                                                        }}
                                                        className={`px-3 py-2 rounded-lg text-[10px] font-black text-white border-2 border-white/20 transition-all hover:scale-110 ${option.color}`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
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
                                            {String(displayedQuestions.length).padStart(2, '0')}
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

                            <div className="flex justify-center gap-5 flex-wrap">
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
                                {!reviewMode && (
                                    <button
                                        onClick={() => handleNext()}
                                        className="flex items-center gap-3 px-10 py-5 rounded-[2rem] bg-white/[0.04] border-2 border-white/10 text-white/50 text-[11px] font-black uppercase tracking-[0.25em] hover:bg-white/8 hover:text-white/90 hover:border-white/20 transition-all backdrop-blur-3xl group"
                                    >
                                        Siguiente <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── EMPTY STATE ── */}
                {started && !loading && !sessionComplete && displayedQuestions.length === 0 && (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center relative z-10">
                        <div className="w-40 h-40 bg-slate-900/40 rounded-[3rem] flex items-center justify-center mb-10 border-2 border-white/5 border-dashed relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent blur-2xl" />
                            {reviewMode ? (
                                <AlertCircle className="w-20 h-20 text-amber-600 transition-transform group-hover:scale-110 duration-700" />
                            ) : (
                                <Layers className="w-20 h-20 text-slate-800 transition-transform group-hover:scale-110 duration-700" />
                            )}
                            <Skull className="w-10 h-10 text-slate-700 absolute -bottom-2 -right-2 opacity-30 animate-pulse" />
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-slate-400 italic">
                            {reviewMode ? 'Sin pendientes hoy' : 'Abismo Vacío'}
                        </h2>
                        <p className="text-slate-600 font-mono text-xs uppercase tracking-[0.5em] max-w-sm font-bold leading-relaxed">
                            {reviewMode
                                ? 'No hay tarjetas pendientes de repaso para hoy. ¡Vuelve mañana!'
                                : `No se han encontrado pergaminos en el reino de ${selectedSubject?.label}.`
                            }
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
