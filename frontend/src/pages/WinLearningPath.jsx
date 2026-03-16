import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Circle, Lock, ChevronRight,
  Award, Star, Zap, BookOpen, TrendingUp
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import logoImg from '../assets/tech4u_logo.png';
import { WIN_SCENARIOS, WIN_MODULES } from '../data/winServerScenarios';

function useCompletedLabs() {
  try { return JSON.parse(localStorage.getItem('t4u_winlabs_completed') || '[]'); }
  catch { return []; }
}

// Learning path: secuencia recomendada de labs agrupada por "etapa"
const LEARNING_PATH = [
  {
    stage: 1,
    title: 'Fundamentos',
    subtitle: 'Base sólida de Windows Server',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    glow: 'shadow-emerald-900/30',
    labs: ['ad-install', 'dns-dhcp-basic', 'ps-basic'],
  },
  {
    stage: 2,
    title: 'Administración',
    subtitle: 'Gestión diaria del entorno',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/25',
    glow: 'shadow-sky-900/30',
    labs: ['ad-users', 'gpo-basics', 'fs-shares', 'wsus-install'],
  },
  {
    stage: 3,
    title: 'Infraestructura',
    subtitle: 'Servicios críticos de red',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
    glow: 'shadow-violet-900/30',
    labs: ['hyperv-basics', 'iis-site', 'ad-delegation', 'storage-spaces'],
  },
  {
    stage: 4,
    title: 'Servicios avanzados',
    subtitle: 'Tecnologías de nivel profesional',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    glow: 'shadow-amber-900/30',
    labs: ['rds-install', 'pki-ca', 'ps-remoting', 'wsus-maintenance'],
  },
  {
    stage: 5,
    title: 'Alta disponibilidad',
    subtitle: 'Entornos empresariales críticos',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    glow: 'shadow-red-900/30',
    labs: ['cluster-install', 'cluster-csv', 'rds-gateway', 'hyperv-advanced', 'security-hardening'],
  },
];

function LabNode({ scenario, mod, isCompleted, isLocked, isCurrent, onClick }) {
  return (
    <button
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={`group relative flex items-center gap-3 w-full px-4 py-3 rounded-2xl border text-left transition-all duration-200 ${
        isCompleted
          ? 'border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/30'
          : isLocked
            ? 'border-white/5 bg-white/2 opacity-40 cursor-not-allowed'
            : isCurrent
              ? 'border-sky-500/40 bg-sky-950/20 shadow-lg shadow-sky-900/20 hover:border-sky-500/50'
              : 'border-white/8 bg-white/2 hover:bg-white/5 hover:border-white/15 cursor-pointer'
      }`}
    >
      <div className="flex-shrink-0">
        {isCompleted
          ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          : isLocked
            ? <Lock className="w-4.5 h-4.5 text-slate-700" />
            : <Circle className={`w-5 h-5 ${isCurrent ? 'text-sky-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-[10px] font-mono mb-0.5 ${mod.color}`}>{mod.icon} {mod.label}</div>
        <div className={`text-xs font-bold font-mono leading-tight ${
          isCompleted ? 'text-emerald-300' : isCurrent ? 'text-sky-200' : 'text-slate-300 group-hover:text-white'
        }`}>{scenario.title}</div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2 text-[10px] font-mono text-slate-700">
        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-600/50" />+{scenario.xp}</span>
        {!isLocked && !isCompleted && (
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
    </button>
  );
}

export default function WinLearningPath() {
  const navigate = useNavigate();
  const completed = useCompletedLabs();

  const stats = useMemo(() => {
    const totalXP = WIN_SCENARIOS.filter(s => completed.includes(s.id)).reduce((a, s) => a + s.xp, 0);
    const totalAvailable = WIN_SCENARIOS.reduce((a, s) => a + s.xp, 0);
    const stagesComplete = LEARNING_PATH.filter(stage =>
      stage.labs.every(id => {
        const s = WIN_SCENARIOS.find(x => x.id === id);
        return !s || completed.includes(id);
      })
    ).length;
    return { totalXP, totalAvailable, stagesComplete };
  }, [completed]);

  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="ml-60 flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#0D0D0D]/95 backdrop-blur border-b border-white/5 px-8 py-3 flex items-center gap-3">
          <img src={logoImg} alt="Tech4U" className="w-5 h-5 object-contain" />
          <button onClick={() => navigate('/winlabs')}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Windows Labs
          </button>
          <span className="text-slate-700 text-xs">/</span>
          <span className="text-xs font-mono text-white font-bold">Ruta de Aprendizaje</span>
        </header>

        <div className="flex-1 px-8 py-7 max-w-5xl">
          {/* Hero */}
          <div className="relative rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/20 via-[#0D0D0D] to-[#0D0D0D] px-8 py-6 mb-8 overflow-hidden">
            <div className="absolute top-0 left-0 w-48 h-20 bg-violet-500/8 blur-2xl rounded-full" />
            <div className="relative flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-2xl flex-shrink-0">🗺️</div>
              <div className="flex-1">
                <h1 className="text-2xl font-black text-white font-mono mb-1">Ruta de Aprendizaje</h1>
                <p className="text-xs text-slate-500 font-mono mb-4">Sigue esta secuencia guiada de 5 etapas para dominar Windows Server desde los fundamentos hasta alta disponibilidad.</p>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xl font-black text-violet-400 font-mono">{stats.stagesComplete}/{LEARNING_PATH.length}</div>
                    <div className="text-[10px] font-mono text-slate-600">etapas</div>
                  </div>
                  <div className="w-px h-8 bg-white/8" />
                  <div className="text-center">
                    <div className="text-xl font-black text-amber-400 font-mono">+{stats.totalXP}</div>
                    <div className="text-[10px] font-mono text-slate-600">XP ganados</div>
                  </div>
                  <div className="w-px h-8 bg-white/8" />
                  <div className="text-center">
                    <div className="text-xl font-black text-emerald-400 font-mono">{completed.length}</div>
                    <div className="text-[10px] font-mono text-slate-600">labs completados</div>
                  </div>
                </div>
              </div>
              {/* Overall progress bar */}
              <div className="flex-shrink-0 w-40">
                <div className="text-[10px] font-mono text-slate-600 mb-1.5 flex justify-between">
                  <span>Progreso total</span>
                  <span className="text-violet-400">{Math.round(completed.length / WIN_SCENARIOS.length * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-sky-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round(completed.length / WIN_SCENARIOS.length * 100)}%` }} />
                </div>
                <div className="text-[9px] font-mono text-slate-700 mt-1">{completed.length} / {WIN_SCENARIOS.length} labs</div>
              </div>
            </div>
          </div>

          {/* Path stages */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-emerald-500/30 via-sky-500/20 to-red-500/20" />

            <div className="space-y-8">
              {LEARNING_PATH.map((stage, si) => {
                const stageLabs = stage.labs.map(id => WIN_SCENARIOS.find(s => s.id === id)).filter(Boolean);
                const stageCompleted = stageLabs.filter(s => completed.includes(s.id)).length;
                const prevStageComplete = si === 0 || LEARNING_PATH[si - 1].labs.every(id => {
                  const s = WIN_SCENARIOS.find(x => x.id === id);
                  return !s || completed.includes(id);
                });
                const isStageUnlocked = prevStageComplete;
                const isStageComplete = stageCompleted === stageLabs.length && stageLabs.length > 0;
                const isStageCurrent = isStageUnlocked && !isStageComplete;

                return (
                  <div key={stage.stage} className="relative pl-16">
                    {/* Stage number bubble */}
                    <div className={`absolute left-0 w-12 h-12 rounded-2xl flex items-center justify-center text-lg border shadow-lg transition-all ${
                      isStageComplete
                        ? 'bg-emerald-500/20 border-emerald-500/40 shadow-emerald-900/30'
                        : isStageCurrent
                          ? `${stage.bg} ${stage.border} shadow-lg`
                          : 'bg-white/3 border-white/8'
                    }`}>
                      {isStageComplete
                        ? <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        : isStageUnlocked
                          ? <span className="text-xl">{['🌱', '⚙️', '🏗️', '🚀', '🔥'][si]}</span>
                          : <Lock className="w-5 h-5 text-slate-700" />
                      }
                    </div>

                    {/* Stage card */}
                    <div className={`rounded-2xl border transition-all ${
                      isStageComplete
                        ? 'border-emerald-500/20 bg-emerald-950/10'
                        : isStageCurrent
                          ? `${stage.border} ${stage.bg}`
                          : 'border-white/5 bg-white/2 opacity-60'
                    }`}>
                      {/* Stage header */}
                      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-700 uppercase tracking-wider">Etapa {stage.stage}</span>
                            {isStageComplete && (
                              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">COMPLETADA</span>
                            )}
                            {isStageCurrent && (
                              <span className={`text-[9px] font-mono ${stage.color} ${stage.bg} px-1.5 py-0.5 rounded ${stage.border} border`}>EN CURSO</span>
                            )}
                          </div>
                          <h3 className={`text-sm font-black font-mono ${isStageComplete ? 'text-emerald-300' : isStageCurrent ? stage.color : 'text-slate-500'}`}>
                            {stage.title}
                          </h3>
                          <p className="text-[11px] text-slate-600 font-mono">{stage.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`text-sm font-black font-mono ${isStageComplete ? 'text-emerald-400' : isStageCurrent ? stage.color : 'text-slate-600'}`}>
                              {stageCompleted}/{stageLabs.length}
                            </div>
                            <div className="text-[9px] font-mono text-slate-700">completados</div>
                          </div>
                          <div className="w-16 h-1.5 rounded-full bg-white/8 overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${isStageComplete ? 'bg-emerald-500' : isStageCurrent ? stage.bg.replace('/10', '/70') : 'bg-white/10'}`}
                              style={{ width: `${stageLabs.length > 0 ? Math.round(stageCompleted / stageLabs.length * 100) : 0}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Labs list */}
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {stageLabs.map((scenario, li) => {
                          const mod = WIN_MODULES.find(m => m.id === scenario.subject) || WIN_MODULES[0];
                          const isCompleted_ = completed.includes(scenario.id);
                          const prevLabsComplete = li === 0 || stageLabs.slice(0, li).every(s => completed.includes(s.id));
                          const isLocked_ = !isStageUnlocked || (li > 0 && !prevLabsComplete);
                          const isCurrent_ = isStageUnlocked && !isCompleted_ && !isLocked_;
                          return (
                            <LabNode key={scenario.id} scenario={scenario} mod={mod}
                              isCompleted={isCompleted_} isLocked={isLocked_} isCurrent={isCurrent_}
                              onClick={() => navigate(`/winlabs/${scenario.id}`)} />
                          );
                        })}
                        {stageLabs.length === 0 && (
                          <p className="col-span-2 text-center py-4 text-xs text-slate-700 font-mono">
                            Próximamente — labs en desarrollo
                          </p>
                        )}
                      </div>

                      {/* Stage complete badge */}
                      {isStageComplete && (
                        <div className="px-5 pb-4">
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                            <Award className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold font-mono text-emerald-300">¡Etapa completada! Has dominado {stage.title}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="h-10" />
        </div>
      </main>
    </div>
  );
}
