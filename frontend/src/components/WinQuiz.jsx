import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, Star, RotateCcw, Award } from 'lucide-react';

export default function WinQuiz({ questions, scenarioTitle, xp, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]); // [{selected, correct}]
  const [done, setDone] = useState(false);

  if (!questions || questions.length === 0) {
    onFinish?.(100);
    return null;
  }

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const isCorrect = confirmed && selected === q.answer;
  const isWrong = confirmed && selected !== q.answer;

  const handleConfirm = () => {
    if (selected === null) return;
    setConfirmed(true);
    if (selected === q.answer) setScore(s => s + 1);
    setAnswers(prev => [...prev, { selected, correct: q.answer }]);
  };

  const handleNext = () => {
    if (isLast) {
      const finalScore = score + (selected === q.answer ? 1 : 0);
      const pct = Math.round((finalScore / questions.length) * 100);
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setConfirmed(false);
    }
  };

  const handleRetry = () => {
    setCurrent(0);
    setSelected(null);
    setConfirmed(false);
    setScore(0);
    setAnswers([]);
    setDone(false);
  };

  const finalScore = Math.round((score / questions.length) * 100);

  // ── Results screen ─────────────────────────────────────────────────────
  if (done) {
    const passed = finalScore >= 70;
    return (
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/3 to-[#0D0D0D] p-7 text-center">
        <div className={`inline-flex w-20 h-20 rounded-3xl items-center justify-center mb-4 ${passed ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/20'}`}>
          {passed
            ? <Award className="w-10 h-10 text-emerald-400" />
            : <XCircle className="w-10 h-10 text-red-400" />
          }
        </div>
        <h3 className={`text-xl font-black font-mono mb-1 ${passed ? 'text-emerald-300' : 'text-slate-300'}`}>
          {passed ? '¡Quiz superado!' : 'Sigue practicando'}
        </h3>
        <p className="text-xs text-slate-500 font-mono mb-5">{score} de {questions.length} respuestas correctas</p>

        {/* Score circle */}
        <div className="relative w-24 h-24 mx-auto mb-5">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
            <circle cx="18" cy="18" r="14" fill="none"
              stroke={passed ? '#10b981' : '#ef4444'} strokeWidth="3"
              strokeDasharray={`${finalScore * 0.879} ${87.9 - finalScore * 0.879}`}
              strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-black font-mono ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{finalScore}%</span>
          </div>
        </div>

        {passed && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-300 font-bold mb-5">
            <Star className="w-4 h-4 text-amber-400" />
            Bonus +{Math.round(xp * 0.2)} XP por el quiz
          </div>
        )}

        {/* Answer review */}
        <div className="text-left mt-4 space-y-2 mb-5">
          {questions.map((question, i) => {
            const ans = answers[i];
            const ok = ans?.selected === ans?.correct;
            return (
              <div key={i} className={`rounded-xl border px-4 py-3 ${ok ? 'border-emerald-500/15 bg-emerald-500/5' : 'border-red-500/15 bg-red-500/5'}`}>
                <div className="flex items-start gap-2">
                  {ok
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  }
                  <div className="flex-1">
                    <p className="text-xs font-mono text-slate-300 mb-1">{question.q}</p>
                    {!ok && (
                      <p className="text-[10px] font-mono text-emerald-400">
                        ✓ {question.options[question.answer]}
                      </p>
                    )}
                    {question.explanation && (
                      <p className="text-[10px] font-mono text-slate-600 mt-1 leading-relaxed">{question.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white font-mono text-xs transition-all">
            <RotateCcw className="w-3.5 h-3.5" /> Repetir quiz
          </button>
          <button onClick={() => onFinish?.(finalScore)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition-all">
            Continuar <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ── Question screen ───────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/3 to-[#0D0D0D] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black font-mono text-white">Quiz: {scenarioTitle}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
          <span>Pregunta {current + 1} de {questions.length}</span>
          <div className="flex gap-1 ml-2">
            {questions.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${
                i < current ? 'bg-emerald-500' : i === current ? 'bg-sky-400 scale-125' : 'bg-white/12'
              }`} />
            ))}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="p-5">
        <p className="text-sm font-bold font-mono text-white mb-5 leading-relaxed">{q.q}</p>

        {/* Options */}
        <div className="space-y-2 mb-5">
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrectOpt = confirmed && i === q.answer;
            const isWrongOpt = confirmed && isSelected && i !== q.answer;
            return (
              <button key={i} onClick={() => !confirmed && setSelected(i)}
                disabled={confirmed}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-xs font-mono transition-all ${
                  isCorrectOpt
                    ? 'border-emerald-500/40 bg-emerald-500/12 text-emerald-200'
                    : isWrongOpt
                      ? 'border-red-500/40 bg-red-500/10 text-red-300'
                      : isSelected && !confirmed
                        ? 'border-sky-500/40 bg-sky-500/10 text-sky-200'
                        : confirmed
                          ? 'border-white/5 bg-white/2 text-slate-600'
                          : 'border-white/8 bg-white/3 text-slate-300 hover:border-sky-500/30 hover:bg-sky-500/8 hover:text-white'
                }`}
              >
                <div className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                  isCorrectOpt ? 'border-emerald-500 bg-emerald-500 text-white' :
                  isWrongOpt ? 'border-red-500 bg-red-500 text-white' :
                  isSelected ? 'border-sky-400 bg-sky-500/20 text-sky-300' :
                  'border-white/20 text-slate-600'
                }`}>
                  {isCorrectOpt ? '✓' : isWrongOpt ? '✗' : String.fromCharCode(65 + i)}
                </div>
                <span className="leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {confirmed && q.explanation && (
          <div className={`rounded-xl border px-4 py-3 mb-4 text-xs font-mono leading-relaxed ${
            isCorrect ? 'border-emerald-500/20 bg-emerald-500/6 text-emerald-200/80' : 'border-amber-500/20 bg-amber-500/6 text-amber-200/80'
          }`}>
            {isCorrect ? '✓ ' : '💡 '}{q.explanation}
          </div>
        )}

        {/* Action buttons */}
        {!confirmed ? (
          <button onClick={handleConfirm} disabled={selected === null}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-white/5 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-mono text-xs font-bold transition-all">
            Confirmar respuesta
          </button>
        ) : (
          <button onClick={handleNext}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
              isCorrect
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-white/8 hover:bg-white/12 text-slate-300'
            }`}>
            {isLast ? 'Ver resultados' : 'Siguiente pregunta'} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
