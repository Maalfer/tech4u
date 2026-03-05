import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Hammer } from 'lucide-react';

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

        // "La [BLANK] es rapida y [BLANK] lenta."
        const parts = currentEx.sentence.split('[BLANK]');

        // We know that number of blanks = parts.length - 1
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

        // If there's already a word there, we put it back to the pool
        const existingWord = droppedWords[blankIndex];

        const newDropped = [...droppedWords];
        newDropped[blankIndex] = draggingWord;
        setDroppedWords(newDropped);

        const newPool = wordPool.filter(w => w !== draggingWord);
        if (existingWord) newPool.push(existingWord);

        setWordPool(newPool);
        setDraggingWord(null);
    };

    const handleDropToPool = () => {
        if (!draggingWord) return;

        // Return word from blank to pool
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
        const isPerfect = droppedWords.every((word, idx) => word === currentEx.answers[idx]);

        if (isPerfect) {
            setFeedback('success');
            setStats(s => ({ ...s, correct: s.correct + 1 }));
            setTimeout(() => advance(), 2000);
        } else {
            const newAttempts = attemptsLeft - 1;
            setAttemptsLeft(newAttempts);
            setStats(s => ({ ...s, mistakes: s.mistakes + 1 }));

            if (newAttempts <= 0) {
                // Failed completely. Force answers.
                setFeedback('failed');
                setDroppedWords([...currentEx.answers]); // Show correct answers
                setWordPool([]); // Empty the pool
                setTimeout(() => advance(), 12000); // 12 seconds to read why
            } else {
                setFeedback('error');
                setTimeout(() => setFeedback(null), 1000); // Shake effect
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

    // Is the user done filling all blanks?
    const allFilled = droppedWords.every(w => w !== null);

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10 relative">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center border border-white/10">
                        <Hammer className="w-6 h-6 text-fuchsia-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic uppercase text-white">Prueba de Ensamblaje</h2>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none mt-1">
                            Vector {currentIndex + 1} de {exercises.length}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="text-xs font-mono uppercase text-slate-400 mr-2">Integridad</span>
                        <div className="flex gap-1 mt-1 justify-end">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-2.5 w-6 rounded-xs transform -skew-x-12 transition-all ${i <= attemptsLeft ? 'bg-neon shadow-[0_0_8px_var(--color-neon)]' : 'bg-red-500/20 border border-red-500/30'
                                    }`} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Progress bar line */}
                <div className="absolute bottom-0 left-0 h-[1px] bg-white/20 w-full">
                    <div
                        className="h-full bg-fuchsia-500 transition-all duration-500 shadow-[0_0_10px_var(--color-fuchsia-500)]"
                        style={{ width: `${((currentIndex) / exercises.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* The Sentence with Blanks */}
            <div className="glass p-10 rounded-3xl border border-white/5 mb-10 text-center relative overflow-hidden">
                {feedback === 'error' && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />}
                {feedback === 'failed' && <div className="absolute inset-0 bg-red-900/20 pointer-events-none" />}
                {feedback === 'success' && <div className="absolute inset-0 bg-neon/10 animate-pulse pointer-events-none" />}

                <h3 className="text-2xl font-medium leading-[2.5] text-slate-200"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropToPool} // Dropping anywhere outside a blank returns it to the pool
                >
                    {sentenceFragments.map((frag, idx) => (
                        <span key={idx}>
                            {frag}
                            {/* Insert a blank IF it's not the last fragment */}
                            {idx < sentenceFragments.length - 1 && (
                                <span
                                    className={`inline-flex items-center justify-center min-w-[140px] h-12 mx-2 border-b-2 px-4 transition-all pb-1 translate-y-2
                                        ${feedback === 'error' ? 'border-red-500 bg-red-500/10 text-red-500 animate-[shake_0.5s_ease-in-out]' :
                                            feedback === 'failed' ? 'border-orange-500 bg-orange-500/10 text-orange-400' :
                                                feedback === 'success' ? 'border-neon bg-neon/10 text-neon' :
                                                    droppedWords[idx] ? 'border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-300 font-bold shadow-[0_-10px_20px_-10px_rgba(217,70,239,0.3)_inset]' :
                                                        'border-white/20 bg-black/40 border-dashed text-slate-600'
                                        }`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDropToBlank(idx)}
                                >
                                    {droppedWords[idx] ? (
                                        <div
                                            draggable={feedback === null}
                                            onDragStart={() => handleDragStart(droppedWords[idx])}
                                            className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                                        >
                                            {droppedWords[idx]}
                                        </div>
                                    ) : (
                                        <span className="opacity-20 uppercase text-xs font-mono tracking-widest">(Hueco)</span>
                                    )}
                                </span>
                            )}
                        </span>
                    ))}
                </h3>
            </div>

            {/* Word Pool */}
            {(feedback === null || feedback === 'error') && (
                <div className="bg-black/30 border border-white/5 rounded-3xl p-8 min-h-[140px]"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropToPool}
                >
                    <div className="flex flex-wrap justify-center gap-4">
                        {wordPool.map((word, i) => (
                            <div
                                key={`${word}-${i}`}
                                draggable={feedback === null}
                                onDragStart={() => handleDragStart(word)}
                                className="bg-[#1a1120] border-2 border-fuchsia-900/80 px-6 py-3 rounded-xl shadow-xl cursor-grab active:cursor-grabbing hover:border-fuchsia-500 hover:bg-[#251230] hover:text-white transition-all hover:-translate-y-1 font-mono text-sm uppercase text-fuchsia-200"
                            >
                                {word}
                            </div>
                        ))}
                        {wordPool.length === 0 && <span className="text-slate-600 font-mono text-xs uppercase italic mt-4">Banco de palabras vacío</span>}
                    </div>
                </div>
            )}

            {/* Explanation Area (Only shows on success or complete failure) */}
            {feedback && feedback !== 'error' && (
                <div ref={explanationRef} className={`mt-8 p-6 rounded-2xl border flex items-start gap-4 animate-in slide-in-from-bottom-5 ${feedback === 'success' ? 'bg-neon/10 border-neon/30 text-neon' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
                    {feedback === 'success' ? <CheckCircle2 className="w-6 h-6 flex-shrink-0" /> : <XCircle className="w-6 h-6 flex-shrink-0" />}
                    <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-widest mb-2">{feedback === 'success' ? 'Ensamblaje Perfecto' : 'Fallo Crítico — Sistema Sobreescrito'}</p>

                        {feedback === 'failed' && (
                            <div className="mb-3 p-4 bg-orange-950/40 border border-orange-500/20 rounded-xl">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-orange-500/70 mb-1">Vector Corregido:</p>
                                <p className="text-sm text-slate-200 leading-relaxed font-mono">
                                    {sentenceFragments.map((frag, idx) => (
                                        <span key={idx}>
                                            {frag}
                                            {idx < currentEx.answers.length && (
                                                <strong className="text-orange-400">[{currentEx.answers[idx]}]</strong>
                                            )}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}

                        <p className="text-sm opacity-90 leading-relaxed italic">{currentEx.explanation}</p>
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div className="mt-8 flex justify-end">
                {feedback === null && (
                    <button
                        onClick={checkAnswers}
                        disabled={!allFilled}
                        className={`px-12 py-5 rounded-2xl font-black uppercase italic tracking-widest transition-all ${allFilled
                            ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-500 shadow-[0_0_20px_var(--color-fuchsia-500)] hover:scale-105'
                            : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                            }`}
                    >
                        Comprobar Ensamblaje
                    </button>
                )}
            </div>

            {/* Global Shake Animation Keyframes */}
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0) translateY(8px); }
                    25% { transform: translateX(-5px) translateY(8px); }
                    50% { transform: translateX(5px) translateY(8px); }
                    75% { transform: translateX(-5px) translateY(8px); }
                }
            `}</style>
        </div>
    );
}

