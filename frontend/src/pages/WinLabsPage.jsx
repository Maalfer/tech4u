import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor, ChevronRight, Clock, Star, Lock, CheckCircle2,
  Search, BookOpen, Zap, Award, TrendingUp, Users, Filter,
  Shield, Database, Globe, Server, Terminal, HardDrive, Cpu,
  Map, FlaskConical, FileText, GraduationCap, LayoutGrid, Play
} from 'lucide-react';
import { WIN_SCENARIOS as WIN_SCENARIOS_RAW, WIN_MODULES as WIN_MODULES_RAW } from '../data/winServerScenarios';
import Sidebar from '../components/Sidebar';

// ── Normalise modules: winServerData3 / troubleshoot use a different schema ──
const MODULE_COLORS = {
  hyperv:             { color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20'  },
  dsc:                { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  wds:                { color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20'     },
  'azure-ad-connect': { color: 'text-blue-400',   bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    },
  troubleshoot:       { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20'     },
  rds:                { color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20'  },
  clustering:         { color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20'    },
  wsus:               { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20'   },
  storage:            { color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20'    },
  pki:                { color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20'  },
};

function normaliseModule(mod) {
  if (mod.bg) return mod; // already in old format
  const c = MODULE_COLORS[mod.id] || { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
  return { ...mod, label: mod.title || mod.label || mod.id, desc: mod.description || mod.desc || '', ...c };
}

// ── Normalise scenarios: new format uses moduleId / minutes / lowercase difficulty ──
const DIFF_MAP = { basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado' };
function normaliseScenario(s) {
  return {
    ...s,
    subject: s.subject || s.moduleId || '',
    estimatedMinutes: s.estimatedMinutes || s.minutes || 20,
    difficulty: DIFF_MAP[s.difficulty] || s.difficulty || 'Básico',
  };
}

const WIN_MODULES   = WIN_MODULES_RAW.map(normaliseModule);
const WIN_SCENARIOS = WIN_SCENARIOS_RAW.map(normaliseScenario);
import logoImg from '../assets/tech4u_logo.png';

const DIFF_CFG = {
  'Básico':     { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', dot: 'bg-emerald-400', label: '● Básico' },
  'Intermedio': { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   dot: 'bg-amber-400',   label: '● Intermedio' },
  'Avanzado':   { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     dot: 'bg-red-400',     label: '● Avanzado' },
};

function useCompletedLabs() {
  try {
    return JSON.parse(localStorage.getItem('t4u_winlabs_completed') || '[]');
  } catch { return []; }
}

function getScenarioById(id) {
  return WIN_SCENARIOS.find(s => s.id === id);
}

// Path view component for a single module
function PathViewModule({ mod, scenarios, completed }) {
  const isFirstLab = scenarios[0];

  return (
    <div className="mb-12">
      {/* Module header with progress */}
      <div className="mb-6 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${mod.bg} border ${mod.border}`}>
          {mod.icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-black font-mono ${mod.color}`}>{mod.label}</h3>
          <p className="text-xs text-slate-600 font-mono mt-0.5">{mod.desc}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-black text-white font-mono mb-1">
            {scenarios.filter(s => completed.includes(s.id)).length}/{scenarios.length} completados
          </div>
          <div className="w-32 h-2 rounded-full bg-white/8 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${mod.bg.replace('/10', '/70')}`}
              style={{ width: `${Math.round((scenarios.filter(s => completed.includes(s.id)).length / scenarios.length) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Labs as vertical path */}
      <div className="space-y-0 ml-8">
        {scenarios.map((scenario, idx) => {
          const isCompleted = completed.includes(scenario.id);
          const isLocked = (scenario.prerequisites || []).some(p => !completed.includes(p));
          const prereqScenarios = (scenario.prerequisites || []).map(getScenarioById).filter(Boolean);
          const isFirstAvailable = !isCompleted && !isLocked && scenarios.slice(0, idx).some(s => !completed.includes(s.id));

          return (
            <div key={scenario.id}>
              <div className="flex gap-4 items-start">
                {/* Connector line and circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCompleted
                      ? `${mod.color} border-current bg-current`
                      : isLocked
                        ? 'border-slate-700 bg-transparent'
                        : `border-current ${mod.color} bg-transparent`
                  }`}>
                    {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  {idx < scenarios.length - 1 && (
                    <div className={`w-0.5 h-16 transition-all ${
                      isCompleted ? mod.color : isLocked ? 'bg-slate-800/50' : 'bg-slate-700/50'
                    }`} />
                  )}
                </div>

                {/* Lab card */}
                <button
                  onClick={() => !isLocked && navigate(`/winlabs/${scenario.id}`)}
                  disabled={isLocked}
                  className={`flex-1 group relative flex flex-col rounded-xl border text-left transition-all py-3 px-4 mb-2
                    ${isLocked
                      ? 'border-white/5 bg-white/2 opacity-40 cursor-not-allowed'
                      : isCompleted
                        ? `border-emerald-500/25 bg-gradient-to-r from-emerald-950/40 to-[#0D0D0D] hover:border-emerald-500/40 cursor-pointer`
                        : `border-white/10 bg-white/3 hover:bg-white/5 hover:border-white/20 cursor-pointer`
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-black font-mono transition-colors ${
                      isCompleted ? 'text-emerald-300' : isLocked ? 'text-slate-600' : 'text-white'
                    }`}>
                      {scenario.title}
                    </h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isLocked && <Lock className="w-3.5 h-3.5 text-slate-700" />}
                      {!isCompleted && !isLocked && isFirstAvailable && (
                        <div className="relative">
                          <div className="absolute inset-0 bg-emerald-500/30 blur-lg animate-pulse" />
                          <Play className="w-3.5 h-3.5 text-emerald-400 relative fill-emerald-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-2 leading-snug">{scenario.description}</p>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{scenario.estimatedMinutes} min</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500/70" />+{scenario.xp} XP</span>
                    <span className="text-slate-700">{scenario.steps.length} pasos</span>
                  </div>

                  {isLocked && prereqScenarios.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-slate-600 font-mono">
                      <span className="block text-slate-700 mb-1">Completa primero:</span>
                      {prereqScenarios.map(p => (
                        <div key={p.id} className="flex items-center gap-1 text-slate-600">
                          <Lock className="w-2 h-2" /> {p.title}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, module: mod, isCompleted, isLocked, onClick }) {
  const diff = DIFF_CFG[scenario.difficulty] || DIFF_CFG['Básico'];
  return (
    <button
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={`group relative flex flex-col rounded-2xl border text-left transition-all duration-200 overflow-hidden
        ${isLocked
          ? 'border-white/5 bg-white/2 opacity-40 cursor-not-allowed'
          : isCompleted
            ? 'border-emerald-500/25 bg-gradient-to-b from-emerald-950/30 to-[#0D0D0D] hover:border-emerald-500/40 cursor-pointer'
            : 'border-white/8 bg-gradient-to-b from-white/3 to-[#0D0D0D] hover:bg-white/5 hover:border-white/15 cursor-pointer'
        }`}
    >
      {/* Top accent bar */}
      {!isLocked && (
        <div className={`absolute top-0 left-0 right-0 h-[2px] ${isCompleted ? 'bg-emerald-500/50' : `${mod.bg.replace('/10', '/60').replace('bg-', 'bg-')} opacity-0 group-hover:opacity-100`} transition-opacity`} />
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-black font-mono uppercase tracking-widest px-2 py-0.5 rounded-md border ${mod.color} ${mod.bg} ${mod.border}`}>
              {mod.icon} {mod.label}
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${diff.color} ${diff.bg} ${diff.border}`}>
              {scenario.difficulty}
            </span>
          </div>
          {isCompleted
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            : isLocked
              ? <Lock className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
              : null
          }
        </div>

        <h3 className={`text-sm font-black font-mono mb-1.5 leading-tight transition-colors ${
          isCompleted ? 'text-emerald-300' : 'text-white group-hover:text-sky-300'
        }`}>
          {scenario.title}
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-3">{scenario.description}</p>

        <div className="space-y-1 mb-4">
          {scenario.objectives.slice(0, 2).map((obj, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 font-mono">
              <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-sky-700" />
              <span className="leading-snug">{obj}</span>
            </div>
          ))}
          {scenario.objectives.length > 2 && (
            <p className="text-[10px] text-slate-700 font-mono pl-4">+{scenario.objectives.length - 2} objetivos más</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{scenario.estimatedMinutes} min</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500/70" />+{scenario.xp} XP</span>
            <span className="flex items-center gap-1 text-slate-700">{scenario.steps.length} pasos</span>
          </div>
          {!isLocked && (
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
      </div>
    </button>
  );
}

// Module icon mapping for hero
const MOD_HERO_ICONS = {
  'ad':           <Server className="w-5 h-5" />,
  'gpo':          <Shield className="w-5 h-5" />,
  'dns-dhcp':     <Globe className="w-5 h-5" />,
  'hyperv':       <Cpu className="w-5 h-5" />,
  'iis':          <Globe className="w-5 h-5" />,
  'powershell':   <Terminal className="w-5 h-5" />,
  'fileservices': <HardDrive className="w-5 h-5" />,
  'security':     <Shield className="w-5 h-5" />,
};

export default function WinLabsPage() {
  const navigate = useNavigate();
  const completed = useCompletedLabs();
  const [activeModule, setActiveModule] = useState('all');
  const [activeDiff, setActiveDiff] = useState('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'path'

  const totalXP = useMemo(() =>
    WIN_SCENARIOS.filter(s => completed.includes(s.id)).reduce((acc, s) => acc + s.xp, 0),
    [completed]);

  const filtered = useMemo(() => WIN_SCENARIOS.filter(s => {
    if (activeModule !== 'all' && s.subject !== activeModule) return false;
    if (activeDiff !== 'all' && s.difficulty !== activeDiff) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    }
    return true;
  }), [activeModule, activeDiff, search]);

  const byModule = useMemo(() => {
    if (activeModule !== 'all') return null;
    return WIN_MODULES.map(mod => ({
      mod,
      scenarios: WIN_SCENARIOS.filter(s => s.subject === mod.id)
        .sort((a, b) => (a.module_order || 99) - (b.module_order || 99)),
    })).filter(g => g.scenarios.length > 0);
  }, [activeModule]);

  const totalLabs = WIN_SCENARIOS.length;
  const completedCount = WIN_SCENARIOS.filter(s => completed.includes(s.id)).length;
  const progressPct = Math.round((completedCount / totalLabs) * 100);
  const totalMinutes = WIN_SCENARIOS.reduce((a, s) => a + s.estimatedMinutes, 0);
  const totalAvailableXP = WIN_SCENARIOS.reduce((a, s) => a + s.xp, 0);

  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="ml-60 flex-1 flex flex-col">

        {/* ── Sticky header ──────────────────────────────────────── */}
        <header className="sticky top-0 z-20 bg-[#0D0D0D]/95 backdrop-blur border-b border-white/5 px-8 py-3 flex items-center gap-3">
          <img src={logoImg} alt="Tech4U" className="w-5 h-5 object-contain" />
          <Monitor className="w-3.5 h-3.5 text-sky-400" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white font-mono">Windows Server Labs</span>
              <span className="text-[9px] font-mono text-slate-700 px-1.5 py-0.5 rounded bg-white/5 border border-white/5 uppercase tracking-wider">PREMIUM</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8">
            <div className="w-16 h-1.5 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-[11px] font-mono text-slate-400">{completedCount}/{totalLabs}</span>
          </div>
        </header>

        <div className="flex-1 px-8 py-8">

          {/* ── HERO ──────────────────────────────────────────────────── */}
          <div className="relative rounded-3xl border border-sky-500/20 overflow-hidden mb-10">

            {/* Background layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#030D1A] via-[#051222] to-[#0D0D0D]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.025)_1px,transparent_1px)] bg-[size:40px_40px]" />
            {/* Glow spots */}
            <div className="absolute -top-20 left-1/4 w-[500px] h-56 bg-sky-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute top-10 right-0 w-72 h-72 bg-blue-600/8 blur-[60px] rounded-full pointer-events-none" />

            <div className="relative px-10 py-12">
              {/* Top badge row */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black font-mono uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  MÓDULO PREMIUM
                </span>
                <span className="text-[10px] font-mono text-slate-600 tracking-wider">ASIR · SMR · DAM · CFGS</span>
                <span className="ml-auto text-[10px] font-mono text-slate-600 border border-white/8 px-2 py-0.5 rounded">Windows Server 2022</span>
              </div>

              {/* Main layout */}
              <div className="flex items-start gap-10">
                {/* Left: icon + text */}
                <div className="flex items-start gap-6 flex-1">
                  {/* Windows icon treatment */}
                  <div className="flex-shrink-0 relative mt-1">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/25 to-blue-600/15 border border-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-900/30">
                      <Monitor className="w-8 h-8 text-sky-300" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#030D1A] flex items-center justify-center">
                      <span className="text-[7px] font-black text-white">PS</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h1 className="text-4xl font-black text-white font-mono tracking-tight mb-3 leading-none">
                      Windows Server
                      <span className="text-sky-400"> 2022</span>
                    </h1>
                    <p className="text-base text-slate-400 leading-relaxed max-w-2xl mb-6">
                      Laboratorios interactivos de PowerShell para dominar la administración de sistemas Windows desde cero hasta nivel profesional.
                      Cada lab incluye teoría, comandos reales y salidas esperadas — exactamente lo que el mercado laboral exige.
                    </p>

                    {/* Stats row */}
                    <div className="flex flex-wrap items-center gap-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                        </div>
                        <div>
                          <div className="text-sm font-black font-mono text-white">{totalLabs}</div>
                          <div className="text-[10px] font-mono text-slate-600">labs guiados</div>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-white/8" />
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-sm font-black font-mono text-white">{totalAvailableXP.toLocaleString()}</div>
                          <div className="text-[10px] font-mono text-slate-600">XP disponibles</div>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-white/8" />
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-sm font-black font-mono text-white">{totalMinutes}+</div>
                          <div className="text-[10px] font-mono text-slate-600">min de práctica</div>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-white/8" />
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                        <div>
                          <div className="text-sm font-black font-mono text-white">{WIN_MODULES.length}</div>
                          <div className="text-[10px] font-mono text-slate-600">módulos</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: progress card */}
                <div className="flex-shrink-0 rounded-2xl border border-white/10 bg-white/3 p-5 w-44 text-center backdrop-blur">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#0ea5e9" strokeWidth="3"
                        strokeDasharray={`${progressPct * 0.879} ${87.9 - progressPct * 0.879}`} strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.6s ease' }}/>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-white font-mono leading-none">{progressPct}%</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 mb-1">{completedCount} de {totalLabs} completados</p>
                  {totalXP > 0
                    ? <p className="text-xs font-black text-amber-400 font-mono">+{totalXP} XP ganados</p>
                    : <p className="text-[10px] text-slate-700 font-mono">Empieza a ganar XP</p>
                  }
                </div>
              </div>

              {/* Module chips row */}
              <div className="mt-8 pt-7 border-t border-white/6">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-3">Módulos incluidos</p>
                <div className="flex flex-wrap gap-2">
                  {WIN_MODULES.map(mod => {
                    const modCompleted = WIN_SCENARIOS.filter(s => s.subject === mod.id && completed.includes(s.id)).length;
                    const modTotal = WIN_SCENARIOS.filter(s => s.subject === mod.id).length;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => { setActiveModule(mod.id); document.getElementById('labs-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                        className={`group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all hover:scale-105 ${mod.bg} ${mod.border}`}
                      >
                        <span className="text-base">{mod.icon}</span>
                        <div className="text-left">
                          <div className={`text-[11px] font-black font-mono ${mod.color}`}>{mod.label}</div>
                          <div className="text-[9px] font-mono text-slate-600">{modCompleted}/{modTotal} labs</div>
                        </div>
                        {modCompleted === modTotal && modTotal > 0 && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* What you'll learn */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: '🏗️', title: 'Active Directory', desc: 'Instala y configura AD DS, OUs, usuarios y grupos' },
                  { icon: '⚙️', title: 'GPO & Directivas', desc: 'Políticas de grupo, auditoría y control de software' },
                  { icon: '🌐', title: 'DNS · DHCP · IIS', desc: 'Servicios de red esenciales en entornos empresariales' },
                  { icon: '🔒', title: 'Seguridad & PS', desc: 'Hardening, Firewall, auditoría y scripting avanzado' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-white/3 border border-white/6">
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <div className="text-xs font-black font-mono text-white mb-0.5">{item.title}</div>
                      <div className="text-[10px] font-mono text-slate-600 leading-snug">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Feature quick-access row ────────────────── */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            {[
              {
                icon: <Map className="w-5 h-5 text-violet-400" />,
                title: 'Ruta de Aprendizaje',
                desc: 'Secuencia guiada en 5 etapas',
                href: '/winlabs/path',
                color: 'border-violet-500/20 hover:border-violet-500/35',
                bg: 'bg-violet-500/5',
              },
              {
                icon: <FileText className="w-5 h-5 text-amber-400" />,
                title: 'PowerShell Cheat Sheet',
                desc: '100+ comandos de referencia rápida',
                href: '/winlabs/cheatsheet',
                color: 'border-amber-500/20 hover:border-amber-500/35',
                bg: 'bg-amber-500/5',
              },
              {
                icon: <GraduationCap className="w-5 h-5 text-emerald-400" />,
                title: 'Certificados',
                desc: `${WIN_MODULES.filter(m => WIN_SCENARIOS.filter(s => s.subject === m.id).every(s => completed.includes(s.id)) && WIN_SCENARIOS.filter(s => s.subject === m.id).length > 0).length} módulos completados`,
                href: '/winlabs',
                color: 'border-emerald-500/20 hover:border-emerald-500/35',
                bg: 'bg-emerald-500/5',
              },
            ].map(item => (
              item.href ? (
                <button key={item.title} onClick={() => navigate(item.href)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border ${item.color} ${item.bg} text-left transition-all group`}>
                  <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <div className="text-xs font-black font-mono text-white mb-0.5 group-hover:text-sky-300 transition-colors">{item.title}</div>
                    <div className="text-[10px] font-mono text-slate-600">{item.desc}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 ml-auto flex-shrink-0 self-center transition-all" />
                </button>
              ) : (
                <div key={item.title}
                  className={`flex items-start gap-3 p-4 rounded-2xl border ${item.color} ${item.bg} opacity-70`}>
                  <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <div className="text-xs font-black font-mono text-white mb-0.5">{item.title}</div>
                    <div className="text-[10px] font-mono text-slate-600">{item.desc2 || item.desc}</div>
                  </div>
                </div>
              )
            ))}
          </div>

          {/* ── Search + filters ──────────────────────────── */}
          <div id="labs-section" className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar lab por nombre o descripción..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm text-white placeholder-slate-600 font-mono focus:outline-none focus:border-sky-500/40 transition-all"
              />
            </div>
            {activeModule === 'all' && !search && activeDiff === 'all' && (
              <button
                onClick={() => setViewMode(v => v === 'grid' ? 'path' : 'grid')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-mono transition-all ${viewMode === 'path' ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' : 'bg-white/5 border-white/8 text-slate-500 hover:text-white'}`}
              >
                {viewMode === 'grid' ? <Map className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
                {viewMode === 'grid' ? 'Vista Camino' : 'Vista Cuadrícula'}
              </button>
            )}
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-mono transition-all ${showFilters ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'bg-white/5 border-white/8 text-slate-500 hover:text-white'}`}
            >
              <Filter className="w-3.5 h-3.5" /> Filtros
            </button>
          </div>

          {/* Filter row */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-5 p-4 rounded-2xl border border-white/5 bg-white/2">
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setActiveModule('all')} className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${activeModule==='all'?'bg-white/10 text-white border-white/20':'text-slate-500 border-white/5 hover:text-slate-300 hover:border-white/12'}`}>
                  Todos los módulos
                </button>
                {WIN_MODULES.map(mod => (
                  <button key={mod.id} onClick={() => setActiveModule(mod.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${activeModule===mod.id?`${mod.bg} ${mod.color} ${mod.border}`:'text-slate-500 border-white/5 hover:text-slate-300'}`}>
                    {mod.icon} {mod.label}
                  </button>
                ))}
              </div>
              <div className="w-full flex gap-1.5 mt-1">
                {['all','Básico','Intermedio','Avanzado'].map(d => (
                  <button key={d} onClick={() => setActiveDiff(d)}
                    className={`px-3 py-1 rounded-lg border text-xs font-mono transition-all ${activeDiff===d?'bg-white/10 text-white border-white/20':'text-slate-600 border-white/5 hover:text-slate-400'}`}>
                    {d === 'all' ? 'Cualquier nivel' : d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Content ── */}
          {byModule && !search && activeModule === 'all' && activeDiff === 'all' && viewMode === 'path' ? (
            // PATH VIEW
            <div className="space-y-8">
              {byModule.map(({ mod, scenarios }) => (
                <PathViewModule key={mod.id} mod={mod} scenarios={scenarios} completed={completed} />
              ))}
            </div>
          ) : byModule && !search && activeModule === 'all' && activeDiff === 'all' ? (
            // GRID VIEW (default)
            <div className="space-y-10">
              {byModule.map(({ mod, scenarios }) => {
                const modCompleted = scenarios.filter(s => completed.includes(s.id)).length;
                const modPct = Math.round(modCompleted / scenarios.length * 100);
                return (
                  <section key={mod.id}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${mod.bg} border ${mod.border}`}>
                        {mod.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-sm font-black font-mono ${mod.color}`}>{mod.label}</h3>
                          <span className="text-[10px] font-mono text-slate-600 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                            {modCompleted}/{scenarios.length} labs
                          </span>
                          {/* XP ganado en este módulo */}
                          {modCompleted > 0 && (
                            <span className="text-[10px] font-mono text-amber-500/80 flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5" />
                              +{scenarios.filter(s => completed.includes(s.id)).reduce((a, s) => a + s.xp, 0)} XP
                            </span>
                          )}
                          {modCompleted === scenarios.length && (
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> 100% · Certificado disponible
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-mono mt-0.5">{mod.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-white/8 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${mod.bg.replace('/10', '/70')}`}
                            style={{ width: `${modPct}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 w-8 text-right">{modPct}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                      {scenarios.map(s => {
                        const isCompleted = completed.includes(s.id);
                        const isLocked = (s.prerequisites || []).some(p => !completed.includes(p));
                        return (
                          <ScenarioCard key={s.id} scenario={s} module={mod}
                            isCompleted={isCompleted} isLocked={isLocked}
                            onClick={() => navigate(`/winlabs/${s.id}`)} />
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-600 font-mono text-sm">
                No se encontraron labs con ese criterio.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.map(s => {
                  const mod = WIN_MODULES.find(m => m.id === s.subject) || WIN_MODULES[0];
                  const isCompleted = completed.includes(s.id);
                  const isLocked = (s.prerequisites || []).some(p => !completed.includes(p));
                  return (
                    <ScenarioCard key={s.id} scenario={s} module={mod}
                      isCompleted={isCompleted} isLocked={isLocked}
                      onClick={() => navigate(`/winlabs/${s.id}`)} />
                  );
                })}
              </div>
            )
          )}

          <div className="h-10" />
        </div>
      </main>
    </div>
  );
}
