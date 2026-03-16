import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Hammer, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SkillEngine({ exercises, onFinish }) {
    const [currentIndex, setCurrentIndex]   = useState(0);
    const [stats, setStats]                 = useState({ total: exercises.length, correct: 0, mistakes: 0 });
    const [sentenceFragments, setSentenceFragments] = useState([]);
    const [droppedWords, setDroppedWords]   = useState([]);
    const [wordPool, setWordPool]           = useState([]);
    const [attemptsLeft, setAttemptsLeft]   = useState(3);
    const [feedback, setFeedback]           = useState(null); // null | 'error' | 'success' | 'failed'
    const [draggingWord, setDraggingWord]   = useState(null);
    const [shake, setShake]                 = useState(false);
    const feedbackRef = useRef(null);

    const currentEx = exercises[currentIndex];

    useEffect(() => {
        if (feedback === 'success' || feedback === 'failed') {
            setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
        }
    }, [feedback]);

    useEffect(() => {
        if (!currentEx) return;
        const parts    = currentEx.sentence.split('[BLANK]');
        const numBlanks = parts.length - 1;
        setDroppedWords(Array(numBlanks).fill(null));
        setWordPool([...currentEx.pool]);
        setSentenceFragments(parts);
        setAttemptsLeft(3);
        setFeedback(null);
        setShake(false);
    }, [currentIndex, currentEx]);

    // ── drag handlers ──────────────────────────────────────────────────────
    const handleDragStart = (word) => setDraggingWord(word);

    const handleDropToBlank = (blankIndex) => {
        if (!draggingWord) return;
        const existingWord = droppedWords[blankIndex];
        const newDropped   = [...droppedWords];
        newDropped[blankIndex] = draggingWord;
        setDroppedWords(newDropped);

        const newPool = [...wordPool];
        const wi = newPool.indexOf(draggingWord);
        if (wi !== -1) newPool.splice(wi, 1);
        if (existingWord) newPool.push(existingWord);
        setWordPool(newPool);
        setDraggingWord(null);
    };

    const handleDropToPool = () => {
        if (!draggingWord) return;
        const blankIndex = droppedWords.indexOf(draggingWord);
        if (blankIndex !== -1) {
            const newDropped = [...droppedWords];
            newDropped[blankIndex] = null;
            setDroppedWords(newDropped);
            setWordPool([...wordPool, draggingWord]);
        }
        setDraggingWord(null);
    };

    // ── check ──────────────────────────────────────────────────────────────
    const normalizeWord = (w) =>
        String(w).trim().replace(/\s+/g, ' ').toLowerCase().normalize('NFC');

    const checkAnswers = () => {
        const isPerfect = droppedWords.every((word, idx) => {
            if (!word) return false;
            return normalizeWord(word) === normalizeWord(currentEx.answers[idx]);
        });

        if (isPerfect) {
            setFeedback('success');
            setStats(s => ({ ...s, correct: s.correct + 1 }));
        } else {
            const newAttempts = attemptsLeft - 1;
            setAttemptsLeft(newAttempts);
            setStats(s => ({ ...s, mistakes: s.mistakes + 1 }));

            if (newAttempts <= 0) {
                setFeedback('failed');
                setDroppedWords([...currentEx.answers]);
                setWordPool([]);
            } else {
                setFeedback('error');
                setShake(true);
                setTimeout(() => { setFeedback(null); setShake(false); }, 900);
            }
        }
    };

    const advance = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            onFinish(stats);
        }
    };

    if (!currentEx) return null;

    const allFilled   = droppedWords.every(w => w !== null);
    const isDone      = feedback === 'success' || feedback === 'failed';
    const progress    = ((currentIndex) / exercises.length) * 100;
    const isLastEx    = currentIndex === exercises.length - 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col w-full gap-6"
        >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="relative flex items-center justify-between px-6 py-5 rounded-2xl border border-white/[0.06] overflow-hidden"
                style={{ background: '#0c0c0c' }}>

                {/* Progress bar bg */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.04]">
                    <motion.div
                        className="h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ background: 'linear-gradient(90deg, #a21caf, #d946ef)', boxShadow: '0 0 10px rgba(217,70,239,0.6)' }}
                    />
                </div>

                {/* Left: title */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center flex-shrink-0">
                        <Hammer size={16} className="text-fuchsia-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black italic uppercase text-white tracking-tight leading-none">
                            Prueba de <span className="text-fuchsia-400">Ensamblaje</span>
                        </h2>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                            Vector {currentIndex + 1} de {exercises.length}
                        </p>
                    </div>
                </div>

                {/* Center: difficulty badge if present */}
                {currentEx.difficulty && (
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border"
                            style={{
                                color: currentEx.difficulty === 'hard' ? '#ef4444' : currentEx.difficulty === 'medium' ? '#f59e0b' : '#22c55e',
                                borderColor: currentEx.difficulty === 'hard' ? 'rgba(239,68,68,0.25)' : currentEx.difficulty === 'medium' ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)',
                                background: currentEx.difficulty === 'hard' ? 'rgba(239,68,68,0.07)' : currentEx.difficulty === 'medium' ? 'rgba(245,158,11,0.07)' : 'rgba(34,197,94,0.07)',
                            }}>
                            {currentEx.difficulty === 'hard' ? 'Difícil' : currentEx.difficulty === 'medium' ? 'Medio' : 'Fácil'}
                        </span>
                    </div>
                )}

                {/* Right: attempts */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <Shield size={11} className="text-slate-500" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Intentos</span>
                    </div>
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                animate={{ opacity: i <= attemptsLeft ? 1 : 0.18, scale: i <= attemptsLeft ? 1 : 0.85 }}
                                transition={{ duration: 0.25 }}
                                className="w-7 h-2.5 rounded-sm"
                                style={{
                                    background: i <= attemptsLeft
                                        ? `linear-gradient(90deg, #a3e635, #65a30d)`
                                        : 'rgba(239,68,68,0.25)',
                                    boxShadow: i <= attemptsLeft ? '0 0 8px rgba(163,230,53,0.5)' : 'none',
                                    transform: 'skewX(-8deg)',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Sentence card ────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0, ...(shake ? { x: [-6, 6, -6, 6, -3, 3, 0] } : {}) }}
                    transition={{ duration: shake ? 0.45 : 0.35 }}
                    className="relative rounded-3xl overflow-hidden border"
                    style={{
                        background: feedback === 'success'
                            ? 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 60%), #0d1a0d'
                            : feedback === 'failed'
                                ? 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.05) 0%, transparent 60%), #1a0d0d'
                                : feedback === 'error'
                                    ? 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.06) 0%, transparent 50%), #140808'
                                    : 'radial-gradient(ellipse at 50% 20%, rgba(217,70,239,0.05) 0%, transparent 60%), #0e0e0e',
                        borderColor: feedback === 'success' ? 'rgba(34,197,94,0.3)'
                            : feedback === 'failed'  ? 'rgba(239,68,68,0.3)'
                            : feedback === 'error'   ? 'rgba(239,68,68,0.4)'
                            : 'rgba(255,255,255,0.07)',
                    }}
                >
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }} />

                    {/* Top glow line */}
                    <div className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{
                            background: feedback === 'success' ? 'linear-gradient(90deg, transparent, rgba(34,197,94,0.7), transparent)'
                                : feedback === 'failed' ? 'linear-gradient(90deg, transparent, rgba(239,68,68,0.7), transparent)'
                                : feedback === 'error' ? 'linear-gradient(90deg, transparent, rgba(239,68,68,0.8), transparent)'
                                : 'linear-gradient(90deg, transparent, rgba(217,70,239,0.4), transparent)',
                        }} />

                    <div className="relative z-10 px-10 py-14 text-center"
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleDropToPool}
                    >
                        <p className="text-2xl font-mono font-bold leading-[3.2] text-slate-200 tracking-tight select-none">
                            {sentenceFragments.map((frag, idx) => (
                                <span key={idx}>
                                    {frag}
                                    {idx < sentenceFragments.length - 1 && (
                                        <span
                                            className="inline-flex items-center justify-center min-w-[140px] h-12 mx-2 rounded-xl border-2 transition-all duration-200 cursor-pointer align-middle"
                                            style={{
                                                borderStyle: droppedWords[idx] ? 'solid' : 'dashed',
                                                borderColor: feedback === 'success' ? '#22c55e'
                                                    : feedback === 'failed'  ? '#f97316'
                                                    : feedback === 'error'   ? '#ef4444'
                                                    : droppedWords[idx]      ? '#d946ef'
                                                    : 'rgba(255,255,255,0.15)',
                                                background: feedback === 'success' ? 'rgba(34,197,94,0.12)'
                                                    : feedback === 'failed'  ? 'rgba(249,115,22,0.12)'
                                                    : feedback === 'error'   ? 'rgba(239,68,68,0.12)'
                                                    : droppedWords[idx]      ? 'rgba(217,70,239,0.1)'
                                                    : 'rgba(255,255,255,0.03)',
                                                boxShadow: feedback === 'success' ? '0 0 16px rgba(34,197,94,0.2)'
                                                    : droppedWords[idx] && !feedback ? '0 0 12px rgba(217,70,239,0.15)'
                                                    : 'none',
                                            }}
                                            onDragOver={e => e.preventDefault()}
                                            onDrop={() => handleDropToBlank(idx)}
                                        >
                                            {droppedWords[idx] ? (
                                                <motion.span
                                                    initial={{ scale: 0.85, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    draggable={!isDone}
                                                    onDragStart={() => !isDone && handleDragStart(droppedWords[idx])}
                                                    className="px-4 text-sm font-black tracking-wide cursor-grab active:cursor-grabbing"
                                                    style={{
                                                        color: feedback === 'success' ? '#4ade80'
                                                            : feedback === 'failed'  ? '#fb923c'
                                                            : feedback === 'error'   ? '#f87171'
                                                            : '#e879f9',
                                                    }}
                                                >
                                                    {droppedWords[idx]}
                                                </motion.span>
                                            ) : (
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/15">drop</span>
                                            )}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* ── Word pool ────────────────────────────────────────────────── */}
            <AnimatePresence>
                {!isDone && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                        className="rounded-2xl border border-white/[0.06] min-h-[100px] flex items-center justify-center"
                        style={{ background: '#080808' }}
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleDropToPool}
                    >
                        {wordPool.length === 0 ? (
                            <div className="flex items-center gap-2 opacity-25">
                                <Zap size={14} className="text-fuchsia-400" />
                                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Pool vaciado</span>
                            </div>
                        ) : (
                            <div className="flex flex-wrap justify-center gap-3 p-7">
                                {wordPool.map((word, i) => (
                                    <motion.div
                                        key={`${word}-${i}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.04 }}
                                        whileHover={{ y: -3, scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        draggable
                                        onDragStart={() => handleDragStart(word)}
                                        className="group relative px-6 py-3 rounded-xl border cursor-grab active:cursor-grabbing select-none transition-all duration-200"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(217,70,239,0.06) 0%, rgba(139,92,246,0.04) 100%)',
                                            borderColor: 'rgba(217,70,239,0.2)',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(217,70,239,0.55)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(217,70,239,0.15)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(217,70,239,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <span className="font-mono text-sm font-black uppercase tracking-wide text-fuchsia-300/90 group-hover:text-fuchsia-200 transition-colors">
                                            {word}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Feedback panel ───────────────────────────────────────────── */}
            <AnimatePresence>
                {isDone && (
                    <motion.div
                        ref={feedbackRef}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="rounded-2xl border overflow-hidden"
                        style={{
                            background: feedback === 'success'
                                ? 'radial-gradient(ellipse at 20% 50%, rgba(34,197,94,0.07) 0%, transparent 70%), #0a100a'
                                : 'radial-gradient(ellipse at 20% 50%, rgba(249,115,22,0.07) 0%, transparent 70%), #100a08',
                            borderColor: feedback === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(249,115,22,0.25)',
                        }}
                    >
                        {/* Top accent */}
                        <div className="h-[2px]"
                            style={{ background: feedback === 'success' ? 'linear-gradient(90deg, transparent, rgba(34,197,94,0.8), transparent)' : 'linear-gradient(90deg, transparent, rgba(249,115,22,0.8), transparent)' }} />

                        <div className="p-7 flex flex-col gap-5">
                            {/* Status row */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: feedback === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.15)',
                                        border: `1.5px solid ${feedback === 'success' ? 'rgba(34,197,94,0.35)' : 'rgba(249,115,22,0.35)'}`,
                                    }}>
                                    {feedback === 'success'
                                        ? <CheckCircle2 size={22} className="text-emerald-400" />
                                        : <XCircle size={22} className="text-orange-400" />
                                    }
                                </div>
                                <div>
                                    <p className="font-mono text-[9px] uppercase tracking-[0.25em] mb-0.5"
                                        style={{ color: feedback === 'success' ? '#4ade80' : '#fb923c' }}>
                                        {feedback === 'success' ? 'Ensamblaje perfecto' : 'Fallo de integridad'}
                                    </p>
                                    <h4 className="font-black text-base text-white uppercase italic leading-tight">
                                        {feedback === 'success' ? '¡Vector resuelto!' : 'Intentos agotados'}
                                    </h4>
                                </div>
                            </div>

                            {/* Correct sentence reveal (on fail) */}
                            {feedback === 'failed' && (
                                <div className="rounded-xl border border-orange-500/15 bg-orange-500/[0.06] px-5 py-4">
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-orange-500/50 mb-2">Fragmento correcto:</p>
                                    <p className="font-mono text-sm text-slate-200 leading-relaxed italic">
                                        {sentenceFragments.map((frag, idx) => (
                                            <span key={idx}>
                                                {frag}
                                                {idx < currentEx.answers.length && (
                                                    <span className="font-black not-italic" style={{ color: '#fb923c' }}>
                                                        {currentEx.answers[idx]}
                                                    </span>
                                                )}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                            )}

                            {/* Explanation */}
                            {currentEx.explanation && (
                                <div className="rounded-xl border bg-white/[0.02] px-5 py-4"
                                    style={{ borderColor: feedback === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,22,0.12)' }}>
                                    <p className="font-mono text-[9px] uppercase tracking-widest mb-2 opacity-40"
                                        style={{ color: feedback === 'success' ? '#4ade80' : '#fb923c' }}>Explicación</p>
                                    <p className="font-mono text-sm text-slate-300 leading-relaxed italic">
                                        "{currentEx.explanation}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Action bar ───────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3">
                {!isDone ? (
                    <motion.button
                        whileHover={allFilled ? { scale: 1.02 } : {}}
                        whileTap={allFilled ? { scale: 0.97 } : {}}
                        onClick={checkAnswers}
                        disabled={!allFilled}
                        className="px-10 py-4 rounded-xl font-mono text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                        style={{
                            background: allFilled
                                ? 'linear-gradient(135deg, #a21caf, #d946ef)'
                                : 'rgba(255,255,255,0.04)',
                            color: allFilled ? 'white' : '#374151',
                            boxShadow: allFilled ? '0 0 24px rgba(217,70,239,0.3)' : 'none',
                            cursor: allFilled ? 'pointer' : 'not-allowed',
                            border: allFilled ? 'none' : '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        Validar
                    </motion.button>
                ) : (
                    <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={advance}
                        className="flex items-center gap-2.5 px-10 py-4 rounded-xl font-mono text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all"
                        style={{
                            background: feedback === 'success'
                                ? 'linear-gradient(135deg, #15803d, #22c55e)'
                                : 'linear-gradient(135deg, #9a3412, #f97316)',
                            boxShadow: feedback === 'success'
                                ? '0 0 24px rgba(34,197,94,0.35)'
                                : '0 0 24px rgba(249,115,22,0.3)',
                        }}
                    >
                        {isLastEx ? 'Ver resultados' : 'Siguiente'}
                        <ArrowRight size={14} />
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}
