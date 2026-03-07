import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Hammer, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SkillEngine({ exercises, onFinish }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stats, setStats] = useState({ total: exercises.length, correct: 0, mistakes: 0 });

    // Derived current exercise
    const currentEx = exercises[currentIndex];

    // We parse the sentence template into chunks (text strings vs blanks)
    const [sentenceFragments, setSentenceFragments] = useState([]);

    // The currently dropped words for the active exercise
    const [droppedWords, setDroppedWords] = useState([]);

    // The pool of remaining words the user can pick from
    const [wordPool, setWordPool] = useState([]);

    const [attemptsLeft, setAttemptsLeft] = useState(3);
    const [feedback, setFeedback] = useState(null); // 'success', 'error', 'failed'
    const [draggingWord, setDraggingWord] = useState(null);
    const explanationRef = useRef(null);

    // Auto-scroll to explanation when it appears
    useEffect(() => {
        if (feedback === 'failed' || feedback === 'success') {
            setTimeout(() => {
                explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [feedback]);

    // Initialize an exercise when currentIndex changes
    useEffect(() => {
        if (!currentEx) return;

        const parts = currentEx.sentence.split('[BLANK]');
        const numBlanks = parts.length - 1;
        setDroppedWords(Array(numBlanks).fill(null));
        setWordPool([...currentEx.pool]);
        setSentenceFragments(parts);
        setAttemptsLeft(3);
        setFeedback(null);

    }, [currentIndex, currentEx]);

    const handleDragStart = (word) => setDraggingWord(word);

    const handleDropToBlank = (blankIndex) => {
        if (!draggingWord) return;

        const existingWord = droppedWords[blankIndex];
        const newDropped = [...droppedWords];
        newDropped[blankIndex] = draggingWord;
        setDroppedWords(newDropped);

        const newPool = [...wordPool];
        const wordIndex = newPool.indexOf(draggingWord);
        if (wordIndex !== -1) {
            newPool.splice(wordIndex, 1);
        }
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

    const checkAnswers = () => {
        const isPerfect = droppedWords.every((word, idx) => {
            if (!word) return false;
            // Robust normalization for accents and unseen characters
            const userWord = word.trim().toLowerCase().normalize("NFC");
            const correctWord = currentEx.answers[idx].trim().toLowerCase().normalize("NFC");

            const match = userWord === correctWord;
            return match;
        });

        if (isPerfect) {
            setFeedback('success');
            setStats(s => ({ ...s, correct: s.correct + 1 }));
            setTimeout(() => advance(), 6000);
        } else {
            const newAttempts = attemptsLeft - 1;
            setAttemptsLeft(newAttempts);
            setStats(s => ({ ...s, mistakes: s.mistakes + 1 }));

            if (newAttempts <= 0) {
                setFeedback('failed');
                setDroppedWords([...currentEx.answers]);
                setWordPool([]);
                setTimeout(() => advance(), 15000);
            } else {
                setFeedback('error');
                setTimeout(() => setFeedback(null), 1000);
            }
        }
    };

    const advance = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onFinish(stats);
        }
    };

    if (!currentEx) return null;

    const allFilled = droppedWords.every(w => w !== null);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full w-full"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10 relative">
                <div className="flex items-center gap-4">
                    <motion.div
                        whileHover={{ rotate: 15 }}
                        className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center border border-white/10"
                    >
                        <Hammer className="w-6 h-6 text-fuchsia-500" />
                    </motion.div>
                    <div>
                        <h2 className="text-xl font-black italic uppercase text-white tracking-tighter">Prueba de <span className="text-fuchsia-500">Ensamblaje</span></h2>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none mt-1">
                            Vector {currentIndex + 1} de {exercises.length}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mr-2">Integridad del Buffer</span>
                        <div className="flex gap-1.5 mt-2 justify-end">
                            {[1, 2, 3].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        opacity: i <= attemptsLeft ? 1 : 0.2,
                                        scale: i <= attemptsLeft ? 1 : 0.8
                                    }}
                                    className={`h-2.5 w-8 rounded-sm transform -skew-x-12 transition-all ${i <= attemptsLeft ? 'bg-neon shadow-[0_0_15px_rgba(198,255,51,0.5)]' : 'bg-red-500/20 border border-red-500/30'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 h-[2px] bg-white/5 w-full">
                    <motion.div
                        className="h-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex) / exercises.length) * 100}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
            </div>

            {/* The Sentence with Blanks */}
            <motion.div
                layout
                className={`glass p-12 rounded-[2.5rem] border border-white/5 mb-10 text-center relative overflow-hidden shadow-2xl transition-all duration-500 ${feedback === 'error' ? 'border-red-500/50 bg-red-500/5' : ''}`}
            >
                <AnimatePresence>
                    {feedback === 'error' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-red-500/10 pointer-events-none"
                        />
                    )}
                    {feedback === 'failed' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-red-900/20 pointer-events-none"
                        />
                    )}
                    {feedback === 'success' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-neon/10 pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                <h3 className="text-2xl font-bold leading-[2.8] text-slate-200 font-mono tracking-tight"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropToPool}
                >
                    {sentenceFragments.map((frag, idx) => (
                        <span key={idx}>
                            {frag}
                            {idx < sentenceFragments.length - 1 && (
                                <motion.span
                                    animate={feedback === 'error' ? { x: [-5, 5, -5, 5, 0] } : {}}
                                    className={`inline-flex items-center justify-center min-w-[160px] h-14 mx-3 border-2 rounded-2xl transition-all translate-y-2
                                        ${feedback === 'error' ? 'border-red-500 bg-red-500/20 text-red-500' :
                                            feedback === 'failed' ? 'border-orange-500 bg-orange-500/20 text-orange-400' :
                                                feedback === 'success' ? 'border-neon bg-neon/20 text-neon' :
                                                    droppedWords[idx] ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300 font-black shadow-[0_0_20px_rgba(217,70,239,0.1)]' :
                                                        'border-white/10 bg-black/40 border-dashed text-slate-700'
                                        }`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDropToBlank(idx)}
                                >
                                    {droppedWords[idx] ? (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            draggable={feedback === null}
                                            onDragStart={() => handleDragStart(droppedWords[idx])}
                                            className="cursor-grab active:cursor-grabbing px-4 py-1"
                                        >
                                            {droppedWords[idx]}
                                        </motion.div>
                                    ) : (
                                        <span className="opacity-30 uppercase text-[9px] font-black tracking-[0.2em] font-sans">Hueco</span>
                                    )}
                                </motion.span>
                            )}
                        </span>
                    ))}
                </h3>
            </motion.div>

            {/* Word Pool */}
            <AnimatePresence>
                {(feedback === null || feedback === 'error') && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-black/40 border border-white/5 rounded-[2rem] p-10 min-h-[160px] shadow-inner"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDropToPool}
                    >
                        <div className="flex flex-wrap justify-center gap-5">
                            {wordPool.map((word, i) => (
                                <motion.div
                                    key={`${word}-${i}`}
                                    whileHover={{ scale: 1.05, y: -5, borderColor: '#d946ef' }}
                                    whileTap={{ scale: 0.95 }}
                                    draggable={feedback === null}
                                    onDragStart={() => handleDragStart(word)}
                                    className="bg-[#150a1d] border-2 border-fuchsia-900/40 px-8 py-4 rounded-2xl shadow-xl cursor-grab active:cursor-grabbing transition-colors font-mono text-sm font-bold uppercase text-fuchsia-200/80 hover:text-white"
                                >
                                    {word}
                                </motion.div>
                            ))}
                            {wordPool.length === 0 && (
                                <div className="flex flex-col items-center gap-2 opacity-20">
                                    <Sparkles className="w-8 h-8" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Buffer de palabras purgado</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Explanation Area */}
            <AnimatePresence>
                {feedback && feedback !== 'error' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        ref={explanationRef}
                        className={`mt-10 p-8 rounded-[2rem] border-2 flex items-start gap-6 shadow-2xl ${feedback === 'success' ? 'bg-neon/5 border-neon/30 text-neon' : 'bg-orange-500/5 border-orange-500/30 text-orange-400'}`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${feedback === 'success' ? 'bg-neon text-black' : 'bg-orange-500 text-black'}`}>
                            {feedback === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] mb-3 opacity-80">{feedback === 'success' ? 'Ensamblaje Perfecto' : 'Fallo de Integridad'}</h4>

                            {feedback === 'failed' && (
                                <div className="mb-6 p-6 bg-black/40 border border-orange-500/20 rounded-2xl">
                                    <p className="text-[9px] font-mono uppercase tracking-widest text-orange-500/50 mb-2">Fragmento Restaurado:</p>
                                    <p className="text-base text-slate-100 leading-relaxed font-mono italic">
                                        {sentenceFragments.map((frag, idx) => (
                                            <span key={idx}>
                                                {frag}
                                                {idx < currentEx.answers.length && (
                                                    <span className="text-orange-400 font-black">[{currentEx.answers[idx]}]</span>
                                                )}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                            )}

                            <p className="text-sm font-mono leading-relaxed text-slate-300 italic">“{currentEx.explanation}”</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Bar */}
            <div className="mt-10 flex justify-end">
                {feedback === null && (
                    <motion.button
                        whileHover={allFilled ? { scale: 1.02, boxShadow: '0 0 30px rgba(217,70,239,0.4)' } : {}}
                        whileTap={allFilled ? { scale: 0.98 } : {}}
                        onClick={checkAnswers}
                        disabled={!allFilled}
                        className={`px-16 py-6 rounded-[1.8rem] font-black uppercase italic tracking-[0.2em] transition-all text-sm ${allFilled
                            ? 'bg-fuchsia-600 text-white shadow-lg'
                            : 'bg-white/5 text-slate-700 cursor-not-allowed border border-white/5 opacity-50'
                            }`}
                    >
                        Validar Ensamblaje
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}
