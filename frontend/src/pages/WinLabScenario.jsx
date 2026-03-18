import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Monitor, CheckCircle2, Circle, ChevronRight, ChevronLeft,
  BookOpen, Terminal, Lightbulb, Copy, Check, Star, Award, RotateCcw,
  AlertCircle, ChevronDown, ChevronUp, GraduationCap, Layers, Flag,
  Zap, Clock, Target, FlaskConical, EyeOff, Eye, Timer, Trophy, Sparkles
} from 'lucide-react';
import DOMPurify from 'dompurify';
import Sidebar from '../components/Sidebar';
import SafeHTML from '../components/SafeHTML';
import logoImg from '../assets/tech4u_logo.png';
import { WIN_SCENARIOS as WIN_SCENARIOS_RAW, WIN_MODULES as WIN_MODULES_RAW } from '../data/winServerScenarios';

// Normalise: some scenarios use moduleId instead of subject, and varied difficulty/time formats
const DIFF_MAP_SC = { basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado' };
const MODULE_COLORS_SC = {
  hyperv: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  dsc: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  wds: { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  'azure-ad-connect': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  troubleshoot: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  rds: { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  clustering: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  wsus: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  storage: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  pki: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
};
const WIN_SCENARIOS = WIN_SCENARIOS_RAW.map(s => ({
  ...s,
  subject: s.subject || s.moduleId || '',
  estimatedMinutes: s.estimatedMinutes || s.minutes || 20,
  difficulty: DIFF_MAP_SC[s.difficulty] || s.difficulty || 'Básico',
}));
const WIN_MODULES = WIN_MODULES_RAW.map(mod => {
  if (mod.bg) return mod;
  const c = MODULE_COLORS_SC[mod.id] || { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
  return { ...mod, label: mod.title || mod.label || mod.id, desc: mod.description || mod.desc || '', ...c };
});
import WinQuiz from '../components/WinQuiz';
import WinCertificate from '../components/WinCertificate';
import PSTerminal from '../components/PSTerminal';
import { getQuizForScenario } from '../data/winQuizData';

// ── Time formatter ─────────────────────────────────────────────────────────────
function fmtTime(sec) {
  if (!sec || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Lightweight Markdown renderer ──────────────────────────────────────────────
function MD({ children, compact = false }) {
  if (!children) return null;
  const lines = children.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className={`font-black text-slate-200 font-mono mt-4 mb-1 ${compact ? 'text-xs' : 'text-sm'}`}>{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className={`font-black text-white font-mono mt-5 mb-2 ${compact ? 'text-sm' : 'text-base'}`}>{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className={`font-black text-white font-mono mt-4 mb-2 ${compact ? 'text-sm' : 'text-lg'}`}>{line.slice(2)}</h1>);
    } else if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="my-3 px-4 py-3 rounded-xl bg-[#0A1628] border border-sky-500/15 text-xs font-mono text-sky-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {codeLines.join('\n')}
        </pre>
      );
    } else if (line.startsWith('| ') && line.includes('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const [header, , ...rows] = tableLines;
      const headers = header.split('|').filter(c => c.trim()).map(c => c.trim());
      elements.push(
        <div key={i} className="overflow-x-auto my-3">
          <table className="text-xs font-mono w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                {headers.map((h, hi) => <th key={hi} className="px-3 py-1.5 text-left text-slate-300 font-black">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-white/5 hover:bg-white/3">
                  {row.split('|').filter(c => c.trim()).map((c, ci) => (
                    <td key={ci} className="px-3 py-1.5 text-slate-400">{c.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="my-2 space-y-1">
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2 text-xs text-slate-400">
              <span className="text-violet-400 mt-0.5 font-bold flex-shrink-0">›</span>
              <SafeHTML as="span" html={item
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>')
                .replace(/`(.*?)`/g, '<code class="text-violet-300 bg-violet-900/30 px-1 py-0.5 rounded text-[10px]">$1</code>')} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    } else if (line.trim()) {
      const safeHtml = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200 font-bold">$1</strong>')
        .replace(/`(.*?)`/g, '<code class="text-violet-300 bg-violet-900/30 px-1.5 py-0.5 rounded text-[10px] font-mono">$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
          const safeUrl = (url && (url.startsWith('http://') || url.startsWith('https://'))) ? url : '#';
          return `<a href="${safeUrl}" class="text-violet-400 hover:underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
        });
      elements.push(
        <SafeHTML
          key={i}
          html={safeHtml}
          className="text-xs text-slate-400 leading-relaxed my-1"
        />
      );
    }
    i++;
  }
  return <div>{elements}</div>;
}

// ── PS Code block ──────────────────────────────────────────────────────────────
function PSCodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="rounded-2xl border border-sky-500/25 bg-[#060E1A] overflow-hidden shadow-lg shadow-sky-900/10">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A1830] border-b border-sky-500/15">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="w-px h-3 bg-white/10" />
          <Terminal className="w-3 h-3 text-sky-500/70" />
          <span className="text-[10px] font-mono text-sky-500/70 font-bold tracking-wide">Windows PowerShell</span>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 hover:text-sky-300 transition-colors px-2.5 py-1 rounded-lg hover:bg-sky-500/10 border border-transparent hover:border-sky-500/20">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <div className="px-5 py-5">
        <pre className="text-[13px] font-mono text-sky-100 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
}

// ── Expected output ────────────────────────────────────────────────────────────
function OutputBlock({ output }) {
  if (!output?.trim()) return null;
  return (
    <div className="rounded-xl border border-slate-700/50 bg-[#080808] overflow-hidden">
      <div className="px-4 py-2 border-b border-white/5 bg-white/2 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
        </div>
        <Terminal className="w-3 h-3 text-slate-600 ml-1" />
        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">Salida esperada</span>
      </div>
      <pre className="px-5 py-4 text-xs font-mono text-emerald-300/70 overflow-x-auto whitespace-pre-wrap leading-relaxed">
        {output}
      </pre>
    </div>
  );
}

// ── Theory Card (top panel) ────────────────────────────────────────────────────
function TheoryPanel({ theory, title }) {
  const [expanded, setExpanded] = useState(false);

  // Preview: first non-empty line
  const previewLine = theory?.split('\n').find(l => l.trim() && !l.startsWith('#')) || '';

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden mb-6 ${
      expanded
        ? 'border-violet-500/30 bg-gradient-to-b from-violet-950/30 to-[#0D0D0D] shadow-lg shadow-violet-900/15'
        : 'border-violet-500/20 bg-violet-950/15 hover:border-violet-500/30'
    }`}>
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left group transition-all"
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
          expanded ? 'bg-violet-500/20 border border-violet-500/40' : 'bg-violet-500/10 border border-violet-500/20'
        }`}>
          <GraduationCap className="w-4.5 h-4.5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black font-mono uppercase tracking-[0.15em] text-violet-400/80">Fundamentos Teóricos</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-500">
              {expanded ? 'Contraer' : 'Expandir'}
            </span>
          </div>
          {!expanded && (
            <p className="text-xs text-slate-500 font-mono truncate">{previewLine}</p>
          )}
          {expanded && (
            <p className="text-xs font-bold text-slate-300 font-mono">{title}</p>
          )}
        </div>
        <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
          expanded ? 'bg-violet-500/15 text-violet-300' : 'text-slate-600 group-hover:text-slate-400'
        }`}>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-6 border-t border-violet-500/10">
          <div className="mt-5 prose-violet">
            <MD>{theory}</MD>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Parses a command string into numbered {comment, command} blocks ────────────
function parseSolutionBlocks(commandStr) {
  if (!commandStr?.trim()) return [];
  const lines = commandStr.split('\n');
  const blocks = [];
  let pendingComment = '';

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      // Accumulate comment text (strip leading # chars)
      const txt = line.replace(/^#+\s*/, '');
      pendingComment = pendingComment ? `${pendingComment} ${txt}` : txt;
    } else {
      blocks.push({ comment: pendingComment, command: line });
      pendingComment = '';
    }
  }

  // Fallback: single block if nothing parsed
  if (blocks.length === 0) blocks.push({ comment: '', command: commandStr.trim() });
  return blocks;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function WinLabScenario() {
  const { id } = useParams();
  const navigate = useNavigate();

  const scenario = WIN_SCENARIOS.find(s => s.id === id);
  const mod = WIN_MODULES.find(m => m?.id === scenario?.subject);

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [finished, setFinished] = useState(false);
  const [examMode, setExamMode] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const bestTimeKey = `t4u_winlab_best_${id}`;
  const [bestTime, setBestTime] = useState(() => {
    try { return parseInt(localStorage.getItem(`t4u_winlab_best_${id}`) || '0', 10); } catch { return 0; }
  });
  const [isNewBest, setIsNewBest] = useState(false);

  // ── Module completion ──────────────────────────────────────────────────────
  const [moduleCompleted, setModuleCompleted] = useState(false);

  const storageKey = `t4u_winlab_steps_${id}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setCompletedSteps(new Set(saved));
    } catch {}
  }, [id]);

  const saveProgress = useCallback((steps) => {
    try { localStorage.setItem(storageKey, JSON.stringify([...steps])); } catch {}
  }, [storageKey]);

  useEffect(() => { setShowHint(false); setShowSolution(false); }, [currentStep]);

  // Start timer on mount, clean up on unmount
  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  if (!scenario || !mod) {
    return (
      <div className="flex min-h-screen bg-[#0D0D0D]">
        <Sidebar />
        <main className="ml-60 flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 font-mono mb-4">Lab no encontrado</p>
            <button onClick={() => navigate('/winlabs')} className="text-sky-400 font-mono text-sm hover:underline">
              ← Volver a Windows Labs
            </button>
          </div>
        </main>
      </div>
    );
  }

  const step = scenario.steps[currentStep];
  const totalSteps = scenario.steps.length;
  const progress = Math.round((completedSteps.size / totalSteps) * 100);

  // Called by PSTerminal when the user types the correct command.
  // Only marks the step as done — does NOT auto-advance so the user
  // stays on the same step and chooses when to move forward.
  const markStepComplete = (stepIdx = currentStep) => {
    const updated = new Set(completedSteps);
    updated.add(stepIdx);
    setCompletedSteps(updated);
    saveProgress(updated);

    // If this was the last step, trigger the finish flow
    if (updated.size === totalSteps) {
      // Stop timer & check personal best
      clearInterval(timerRef.current);
      const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(finalTime);
      const prevBest = parseInt(localStorage.getItem(bestTimeKey) || '0', 10);
      if (prevBest === 0 || finalTime < prevBest) {
        setBestTime(finalTime);
        setIsNewBest(true);
        try { localStorage.setItem(bestTimeKey, finalTime.toString()); } catch {}
      }

      setFinished(true);
      try {
        const all = JSON.parse(localStorage.getItem('t4u_winlabs_completed') || '[]');
        const updatedAll = all.includes(scenario.id) ? all : [...all, scenario.id];
        localStorage.setItem('t4u_winlabs_completed', JSON.stringify(updatedAll));

        // Check if ALL labs in this module are now done → module certificate
        if (scenario.subject) {
          const moduleScenarios = WIN_SCENARIOS.filter(s => s.subject === scenario.subject);
          const allModDone = moduleScenarios.every(s => s.id === scenario.id || updatedAll.includes(s.id));
          if (allModDone && moduleScenarios.length > 1) setModuleCompleted(true);
        }
      } catch {}
      // Windows Server Labs no otorgan XP — solo se registra el progreso en localStorage.
    }
  };

  // Called by the navigation button — marks done AND advances to next step
  const markStepDone = () => {
    markStepComplete(currentStep);
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setFinished(false);
    setShowHint(false);
    setShowSolution(false);
    try { localStorage.removeItem(storageKey); } catch {}
  };

  const goToStep = (idx) => {
    setCurrentStep(idx);
    setShowHint(false);
    setShowSolution(false);
  };

  const quizQuestions = getQuizForScenario(id);
  const hasQuiz = quizQuestions.length > 0;

  // ── Finished screen ──────────────────────────────────────────────────────
  if (finished) {
    return (
      <div className="flex min-h-screen bg-[#0D0D0D]">
        <Sidebar />
        <WinCertificate
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          moduleName={mod.label}
          moduleIcon={mod.icon}
          xp={scenario.xp}
          studentName=""
        />
        <main className="ml-60 flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg w-full">
            <div className="text-center mb-8">
              <div className="relative inline-flex">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-500/25 to-sky-500/20 border border-amber-500/30 flex items-center justify-center shadow-2xl shadow-amber-900/20">
                  <Award className="w-14 h-14 text-amber-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#0D0D0D] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-white font-mono mt-5 mb-1">¡Lab Completado!</h2>
              <p className="text-slate-500 font-mono text-sm">{scenario.title}</p>
              <div className={`inline-flex items-center gap-1.5 mt-2 text-[10px] font-mono px-2.5 py-1 rounded-full border ${mod.color} ${mod.bg} ${mod.border}`}>
                {mod.icon} {mod.label}
              </div>
            </div>

            {/* New best time banner */}
            {isNewBest && elapsed > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-2.5 mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs font-mono text-amber-300 font-bold">¡Nuevo récord personal! {fmtTime(elapsed)}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 ml-auto" />
              </div>
            )}

            {/* Module completed banner */}
            {moduleCompleted && (
              <div className="rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-blue-500/5 px-4 py-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span className="text-xs font-mono text-violet-300 font-black">¡Módulo {mod.label} completado al 100%!</span>
                </div>
                <p className="text-[10px] font-mono text-slate-500">Has terminado todos los labs de este módulo. Tu certificado de módulo ya está disponible.</p>
                <button onClick={() => setShowCertificate(true)}
                  className="mt-2 text-[10px] font-mono text-violet-400 hover:text-violet-300 underline transition-colors">
                  Ver certificado de módulo →
                </button>
              </div>
            )}

            {/* Exam mode bonus */}
            {examMode && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 mb-4 flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-red-400 flex-shrink-0" />
                <div>
                  <span className="text-xs font-mono text-red-300 font-bold">Modo Examen completado</span>
                  <p className="text-[10px] font-mono text-slate-600">+{Math.round(scenario.xp * 0.5)} XP bonus por completar sin pistas</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'XP ganados', value: `+${examMode ? Math.round(scenario.xp * 1.5) : scenario.xp}`, color: 'text-amber-400', icon: <Zap className="w-4 h-4 text-amber-400/50" />, bg: 'bg-amber-500/5 border-amber-500/20' },
                { label: 'Pasos', value: `${totalSteps}/${totalSteps}`, color: 'text-emerald-400', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400/50" />, bg: 'bg-emerald-500/5 border-emerald-500/20' },
                { label: elapsed > 0 ? 'Tiempo real' : 'Tiempo est.', value: elapsed > 0 ? fmtTime(elapsed) : `${scenario.estimatedMinutes}m`, color: 'text-sky-400', icon: <Timer className="w-4 h-4 text-sky-400/50" />, bg: 'bg-sky-500/5 border-sky-500/20' },
              ].map(stat => (
                <div key={stat.label} className={`rounded-2xl border ${stat.bg} p-4 text-center`}>
                  <div className="flex justify-center mb-1">{stat.icon}</div>
                  <div className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] text-slate-600 font-mono mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Objectives completed */}
            {scenario.objectives?.length > 0 && (
              <div className="rounded-2xl border border-white/8 bg-white/2 p-4 mb-5">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-3">Objetivos alcanzados</p>
                <div className="space-y-1.5">
                  {scenario.objectives.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {obj}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Theory accordion */}
            {scenario.theory && (
              <div className="rounded-2xl border border-violet-500/20 bg-violet-950/10 mb-5 overflow-hidden">
                <details className="group">
                  <summary className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-violet-500/5 transition-colors list-none">
                    <GraduationCap className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <span className="flex-1 text-sm font-bold font-mono text-slate-300">Repasar teoría del módulo</span>
                    <ChevronDown className="w-4 h-4 text-slate-600 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5 border-t border-violet-500/10 pt-4">
                    <MD>{scenario.theory}</MD>
                  </div>
                </details>
              </div>
            )}

            {/* Quiz section */}
            {hasQuiz && !showQuiz && quizScore === null && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <FlaskConical className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold font-mono text-amber-300">Quiz de conocimientos</p>
                    <p className="text-[10px] font-mono text-slate-600">{quizQuestions.length} preguntas · Gana bonus XP si superas el 70%</p>
                  </div>
                </div>
                <button onClick={() => setShowQuiz(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-all">
                  <FlaskConical className="w-3.5 h-3.5" /> Hacer el quiz ahora
                </button>
              </div>
            )}

            {showQuiz && quizScore === null && (
              <div className="mb-5">
                <WinQuiz
                  questions={quizQuestions}
                  scenarioTitle={scenario.title}
                  xp={scenario.xp}
                  onFinish={(score) => {
                    setQuizScore(score);
                    setShowQuiz(false);
                  }}
                />
              </div>
            )}

            {quizScore !== null && (
              <div className={`rounded-xl border px-4 py-3 mb-5 flex items-center gap-3 ${quizScore >= 70 ? 'border-emerald-500/20 bg-emerald-500/6' : 'border-amber-500/20 bg-amber-500/6'}`}>
                <span className="text-xl">{quizScore >= 70 ? '🎯' : '📖'}</span>
                <div>
                  <p className={`text-xs font-bold font-mono ${quizScore >= 70 ? 'text-emerald-300' : 'text-amber-300'}`}>
                    Quiz completado: {quizScore}%
                  </p>
                  <p className="text-[10px] font-mono text-slate-600">
                    {quizScore >= 70 ? `Bonus +${Math.round(scenario.xp * 0.2)} XP añadidos` : 'Repasa la teoría para mejorar'}
                  </p>
                </div>
              </div>
            )}

            {/* Certificate button */}
            <button onClick={() => setShowCertificate(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/8 text-amber-300 hover:bg-amber-500/15 font-mono text-xs font-bold transition-all mb-4">
              🏆 Ver y descargar certificado
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={restart}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 font-mono text-sm transition-all">
                <RotateCcw className="w-4 h-4" /> Repetir lab
              </button>
              <button onClick={() => navigate('/winlabs')}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-sm font-bold transition-all shadow-lg shadow-sky-900/30">
                Más labs <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Main lab view ──────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="ml-60 flex-1 flex flex-col h-screen overflow-hidden">

        {/* ── Top header bar ───────────────────────────────────────────── */}
        <header className="flex-shrink-0 bg-[#0D0D0D]/95 backdrop-blur border-b border-white/5 px-6 py-3 flex items-center gap-3">
          <img src={logoImg} alt="Tech4U" className="w-5 h-5 object-contain flex-shrink-0" />
          <button onClick={() => navigate('/winlabs')}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-white transition-colors flex-shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" /> Windows Labs
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
          <span className="text-xs font-mono text-slate-400 truncate max-w-sm hidden md:block">{scenario.title}</span>

          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            {/* Live timer */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all
              ${bestTime > 0 ? 'border-amber-500/20 bg-amber-500/5 text-amber-300' : 'border-white/8 bg-white/5 text-slate-400'}`}>
              <Timer className="w-3 h-3" />
              <span>{fmtTime(elapsed)}</span>
              {bestTime > 0 && (
                <span className="text-slate-600 text-[9px] ml-0.5">· récord {fmtTime(bestTime)}</span>
              )}
            </div>
            {/* Exam mode toggle */}
            <button
              onClick={() => setExamMode(m => !m)}
              title={examMode ? 'Desactivar modo examen' : 'Activar modo examen: sin pistas ni soluciones, +50% XP si terminas'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all ${
                examMode
                  ? 'bg-red-500/15 border-red-500/30 text-red-300'
                  : 'bg-white/5 border-white/8 text-slate-500 hover:text-white hover:border-white/15'
              }`}
            >
              {examMode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {examMode ? 'Examen ON' : 'Examen'}
            </button>
            {/* Progress bar */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-600">
              <span className="text-slate-500">{completedSteps.size}/{totalSteps}</span>
              <div className="w-20 h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            {/* Module badge */}
            <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border ${mod.color} ${mod.bg} ${mod.border}`}>
              {mod.icon} {mod.label}
            </span>
          </div>
        </header>

        {/* ── Body: sidebar + main ─────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Steps sidebar */}
          <aside className="w-56 flex-shrink-0 border-r border-white/5 bg-[#080808] overflow-y-auto flex flex-col">
            {/* Lab info mini-card */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${mod.bg} border ${mod.border}`}>
                  {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-black font-mono ${mod.color} truncate`}>{mod.label}</p>
                  <p className="text-[9px] font-mono text-slate-700">{scenario.estimatedMinutes} min · +{scenario.xp} XP</p>
                </div>
              </div>
              {/* Overall progress */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-700 mb-1">
                  <span>Progreso</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-sky-500/60 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            {/* Steps list */}
            <div className="flex-1 p-3">
              <p className="text-[9px] font-mono text-slate-700 uppercase tracking-wider px-2 mb-2">Pasos del lab</p>
              <div className="space-y-0.5">
                {scenario.steps.map((s, idx) => (
                  <button key={s.id} onClick={() => goToStep(idx)}
                    className={`w-full flex items-start gap-2 px-3 py-2.5 rounded-xl text-left transition-all group ${
                      idx === currentStep
                        ? 'bg-sky-500/10 border border-sky-500/20 text-sky-300'
                        : completedSteps.has(idx)
                          ? 'text-emerald-500/70 hover:bg-white/4 hover:text-emerald-400'
                          : 'text-slate-600 hover:text-slate-300 hover:bg-white/4'
                    }`}>
                    <div className="flex-shrink-0 mt-0.5">
                      {completedSteps.has(idx)
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        : idx === currentStep
                          ? <div className="w-3.5 h-3.5 rounded-full border-2 border-sky-400 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                            </div>
                          : <Circle className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-mono text-slate-700 mb-0.5">Paso {idx + 1}</div>
                      <div className="text-[11px] font-mono leading-tight">{s.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Objectives */}
            {scenario.objectives?.length > 0 && (
              <div className="p-3 border-t border-white/5">
                <p className="text-[9px] font-mono text-slate-700 uppercase tracking-wider px-2 mb-2 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Objetivos
                </p>
                <div className="space-y-1 px-2">
                  {scenario.objectives.map((obj, i) => (
                    <div key={i} className="text-[10px] font-mono text-slate-600 flex items-start gap-1.5">
                      <span className="text-sky-700 flex-shrink-0 mt-0.5">›</span>
                      <span className="leading-snug">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ── Main content area ─────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-8 py-7 max-w-3xl">

              {/* ━━━━━━━━━━━━ EXAM MODE BANNER ━━━━━━━━━━━━ */}
              {examMode && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-2.5 mb-5 flex items-center gap-2">
                  <EyeOff className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span className="text-xs font-mono text-red-300 font-bold">Modo Examen activo</span>
                  <span className="text-[10px] font-mono text-red-400/60 ml-1">— sin pistas ni teoría visible</span>
                  <button onClick={() => setExamMode(false)} className="ml-auto text-[10px] font-mono text-red-400/60 hover:text-red-300 transition-colors">Desactivar</button>
                </div>
              )}

              {/* ━━━━━━━━━━━━ TROUBLESHOOT PROBLEM BANNER ━━━━━━━━━━━━ */}
              {scenario.type === 'troubleshoot' && scenario.problem && (
                <div className="mb-5 rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-500/8 to-orange-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-[10px] font-mono font-black text-red-400 uppercase tracking-widest">🔧 Incidencia Reportada</span>
                    <span className="ml-auto text-[9px] font-mono text-red-600 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">TROUBLESHOOT MODE</span>
                  </div>
                  <p className="text-sm font-mono text-red-200/80 leading-relaxed">{scenario.problem}</p>
                  <p className="text-[10px] font-mono text-red-500/60 mt-3">↳ Sigue los pasos para diagnosticar y resolver la incidencia</p>
                </div>
              )}

              {/* ━━━━━━━━━━━━ THEORY PANEL — top ━━━━━━━━━━━━ */}
              {scenario.theory && !examMode && (
                <TheoryPanel theory={scenario.theory} title={scenario.title} />
              )}

              {/* ━━━━━━━━━━━━ STEP CONTENT ━━━━━━━━━━━━ */}

              {/* Step number + title */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                    <Layers className="w-3 h-3" />
                    <span>Paso {currentStep + 1} <span className="text-slate-700">de {totalSteps}</span></span>
                  </div>
                  <div className="flex-1 h-px bg-white/5" />
                  <div className="flex gap-1">
                    {scenario.steps.map((_, idx) => (
                      <button key={idx} onClick={() => goToStep(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          completedSteps.has(idx) ? 'bg-emerald-500' :
                          idx === currentStep ? 'bg-sky-400 scale-125' :
                          'bg-white/12 hover:bg-white/25'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white font-mono leading-tight">{step.title}</h2>
              </div>

              {/* Explanation card */}
              <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/3 to-[#0D0D0D] p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Explicación</span>
                </div>
                <MD>{step.explanation}</MD>
              </div>

              {/* Command reference (collapsed in exam mode) */}
              {!examMode && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Referencia · Comando PowerShell</span>
                  </div>
                  <PSCodeBlock code={step.command} />
                </div>
              )}

              {/* Expected output — shown only outside exam mode */}
              {step.expectedOutput?.trim() && !examMode && (
                <div className="mb-5">
                  <OutputBlock output={step.expectedOutput} />
                </div>
              )}

              {/* ── PS Terminal ─────────────────────────────────────── */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider">Terminal PowerShell Interactivo</span>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-500">SANDBOX · SIN EJECUCIÓN REAL</span>
                </div>
                <PSTerminal
                  step={step}
                  stepIndex={currentStep}
                  onStepComplete={() => markStepComplete(currentStep)}
                />
              </div>

              {/* Hint — hidden in exam mode */}
              <div className="mb-7">
                {examMode ? (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-700 py-1.5 px-3 rounded-xl border border-white/5">
                    <EyeOff className="w-3 h-3" /> Pistas desactivadas en modo examen
                  </div>
                ) : (
                  <>
                    {/* Buttons row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {examMode ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-500/60 px-3 py-1.5 rounded-xl border border-red-500/15 bg-red-500/5">
                          <EyeOff className="w-3 h-3" /> Pistas bloqueadas en modo examen · +50% XP al terminar
                        </div>
                      ) : (
                        <>
                          <button onClick={() => setShowHint(!showHint)}
                            className={`flex items-center gap-2 text-xs font-mono transition-colors py-1.5 px-3 rounded-xl border ${
                              showHint
                                ? 'text-amber-300 bg-amber-500/10 border-amber-500/25'
                                : 'text-amber-500/50 border-transparent hover:text-amber-400 hover:border-amber-500/15 hover:bg-amber-500/5'
                            }`}>
                            <Lightbulb className="w-3.5 h-3.5" />
                            {showHint ? 'Ocultar pista' : '¿Necesitas una pista?'}
                          </button>

                          {step.command && (
                            <button onClick={() => setShowSolution(!showSolution)}
                              className={`flex items-center gap-2 text-xs font-mono transition-colors py-1.5 px-3 rounded-xl border ${
                                showSolution
                                  ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25'
                                  : 'text-emerald-600/50 border-transparent hover:text-emerald-400 hover:border-emerald-500/15 hover:bg-emerald-500/5'
                              }`}>
                              <Eye className="w-3.5 h-3.5" />
                              {showSolution ? 'Ocultar solución' : 'Descubrir solución'}
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Hint panel */}
                    {showHint && (
                      <div className="mt-2 px-4 py-3.5 rounded-xl bg-amber-500/6 border border-amber-500/20 text-xs font-mono text-amber-200/80 leading-relaxed">
                        <span className="text-amber-400 font-bold mr-1">💡</span>
                        {step.hint}
                      </div>
                    )}

                    {/* Solution panel */}
                    {showSolution && (step.keyCommand || step.command) && (() => {
                      const keyCmd = step.keyCommand?.trim() || null;
                      const blocks = step.command ? parseSolutionBlocks(step.command) : [];
                      const hasRef = blocks.length > 0;
                      return (
                        <div className="mt-2 rounded-xl border border-emerald-500/20 bg-[#0a1a10] overflow-hidden">

                          {/* ── Section 1: THE command to type ── */}
                          <div className="px-4 pt-4 pb-3">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                                Escribe esto en el terminal
                              </span>
                            </div>
                            <div className="rounded-lg bg-emerald-500/10 border border-emerald-400/30 px-3.5 py-3">
                              <code className="text-[12px] font-mono text-emerald-200 break-all whitespace-pre-wrap leading-relaxed font-semibold">
                                {keyCmd || blocks[0]?.command || step.command?.trim()}
                              </code>
                            </div>
                          </div>

                          {/* ── Section 2: Full reference script (collapsed by default if keyCmd exists) ── */}
                          {hasRef && blocks.length > 1 && (
                            <details className="border-t border-emerald-500/10">
                              <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer text-[10px] font-mono font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider select-none">
                                <span className="text-slate-600">▶</span>
                                Script completo de referencia · {blocks.length} líneas
                              </summary>
                              <div className="px-4 pb-4 pt-2 space-y-3">
                                {blocks.map((block, i) => (
                                  <div key={i} className="flex gap-2.5">
                                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-slate-700/60 border border-slate-600/40 text-slate-500 text-[8px] font-black flex items-center justify-center mt-0.5">
                                      {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      {block.comment && (
                                        <p className="text-[10px] text-slate-500 mb-1 leading-snug">{block.comment}</p>
                                      )}
                                      <div className="rounded-md bg-black/30 border border-white/5 px-3 py-2">
                                        <code className="text-[10px] font-mono text-slate-400 break-all whitespace-pre-wrap leading-relaxed">
                                          {block.command}
                                        </code>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>

              {/* ── Navigation ─────────────────────────────────────── */}
              <div className="flex items-center gap-3 pt-5 border-t border-white/5">
                <button
                  disabled={currentStep === 0}
                  onClick={() => { goToStep(currentStep - 1); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/8 text-slate-500 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs transition-all">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>

                <button onClick={markStepDone}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black font-mono text-sm transition-all shadow-lg ${
                    completedSteps.has(currentStep)
                      ? 'bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/35'
                      : currentStep === totalSteps - 1
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-900/30'
                        : 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white shadow-sky-900/30'
                  }`}>
                  {completedSteps.has(currentStep) ? (
                    <><CheckCircle2 className="w-4 h-4" /> Paso completado</>
                  ) : currentStep === totalSteps - 1 ? (
                    <><Flag className="w-4 h-4" /> Finalizar lab · +{scenario.xp} XP</>
                  ) : (
                    <>Completado, siguiente paso <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>

              <div className="h-8" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
