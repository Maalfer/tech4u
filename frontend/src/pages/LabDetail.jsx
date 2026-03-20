import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logoImg from '../assets/tech4u_logo.png';
import {
    ChevronLeft, Terminal as TerminalIcon,
    BookOpen, CheckCircle, Play, Info, RotateCcw, Zap,
    Trophy, Loader2, Eye, EyeOff, Lock, Crown,
    PanelLeftClose, PanelLeftOpen, Lightbulb, Target,
    Circle, Wifi
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TerminalComponent from '../components/TerminalComponent';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MarkdownPreview from '@uiw/react-markdown-preview';

// ── helpers ────────────────────────────────────────────────────────────────
const DIFF_COLOR = {
    easy:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-amber-400  bg-amber-500/10  border-amber-500/20',
    hard:   'text-red-400    bg-red-500/10    border-red-500/20',
};

export default function LabDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const [lab,                setLab]                = useState(null);
    const [loading,            setLoading]            = useState(true);
    const [startingLab,        setStartingLab]        = useState(false);
    const [activeTab,          setActiveTab]          = useState('guide');
    const [panelOpen,          setPanelOpen]          = useState(true);
    const [wsUrl,              setWsUrl]              = useState(null);
    const [completedChallenges,setCompletedChallenges]= useState([]);
    const [validatingChallenge,setValidatingChallenge]= useState(null);
    const [completed,          setCompleted]          = useState(false);
    const [showSuccess,        setShowSuccess]        = useState(false);
    const [challengeInputs,    setChallengeInputs]    = useState({});
    const [failedAttempts,     setFailedAttempts]     = useState({});
    const [checkingDir,        setCheckingDir]        = useState(false);
    const [dirContent,         setDirContent]         = useState(null);

    useEffect(() => {
        const fetchLabAndProgress = async () => {
            try {
                const [labRes, progressRes] = await Promise.all([
                    api.get(`/labs/${id}`),
                    api.get(`/labs/${id}/challenges/completed`),
                ]);
                setLab(labRes.data);
                setCompletedChallenges(progressRes.data);
            } catch (err) {
                if (import.meta.env.DEV) console.error('Error fetching lab context:', err);
                navigate('/labs');
            } finally {
                setLoading(false);
            }
        };
        fetchLabAndProgress();
    }, [id, navigate]);

    const handleStartLab = async () => {
        setStartingLab(true);
        try {
            const res = await api.post(`/labs/${id}/start`, {});
            setWsUrl(res.data.ws_url);
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error starting lab:', err);
            alert('No se pudo iniciar el sandbox. Contacta con soporte.');
        } finally {
            setStartingLab(false);
        }
    };

    const handleRestartLab = async () => {
        setWsUrl(null);
        setStartingLab(true);
        try {
            const res = await api.post(`/labs/${id}/restart`, {});
            setWsUrl(res.data.ws_url);
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error restarting lab:', err);
            alert('No se pudo reiniciar el sandbox.');
        } finally {
            setStartingLab(false);
        }
    };

    const handleValidateChallenge = async (challengeId) => {
        const studentInput = challengeInputs[challengeId];
        setValidatingChallenge(challengeId);
        try {
            const res = await api.post(`/labs/${id}/challenges/validate`, {
                challenge_id: challengeId,
                student_input: studentInput || '',
            });
            if (res.data.success) {
                if (!completedChallenges.includes(challengeId)) {
                    const next = [...completedChallenges, challengeId];
                    setCompletedChallenges(next);
                    setFailedAttempts(prev => ({ ...prev, [challengeId]: 0 }));
                    if (next.length === (lab.challenges || []).length) handleComplete();
                }
            } else {
                setFailedAttempts(prev => ({ ...prev, [challengeId]: (prev[challengeId] || 0) + 1 }));
                alert(res.data.message || 'Valor incorrecto. Revisa tu terminal.');
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error validating challenge:', err);
            alert('Error de validación.');
        } finally {
            setValidatingChallenge(null);
        }
    };

    const handleCheckDirectory = async (path = '/home/student') => {
        setCheckingDir(true);
        try {
            const res = await api.get(`/labs/${id}/utils/ls`, { params: { path } });
            setDirContent(res.data.content);
        } catch {
            alert('No se pudo obtener el contenido. Asegúrate de que el sandbox esté activo.');
        } finally {
            setCheckingDir(false);
        }
    };

    const handleComplete = async () => {
        try {
            const res = await api.post(`/labs/${id}/complete`);
            if (res.data.success) {
                setCompleted(true);
                setShowSuccess(true);
                refreshUser();
            } else {
                alert(res.data.message || 'Aún no has completado todos los retos.');
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error completing lab:', err);
        }
    };

    if (loading || !lab) return null;

    const isLocked = !lab.is_unlocked;
    const diffCls  = DIFF_COLOR[lab.difficulty] || DIFF_COLOR.easy;
    const challenges = lab.challenges || [];
    const completedCount = challenges.filter(c => completedChallenges.includes(c.id)).length;

    // ── TABS ──────────────────────────────────────────────────────────────
    const tabs = [
        { id: 'guide',      Icon: BookOpen,   label: 'Guía'    },
        { id: 'challenges', Icon: Target,      label: 'Retos'   },
        { id: 'solution',   Icon: Lightbulb,  label: 'Solución' },
    ];

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />

            <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-hidden">

                {/* ── TOP HEADER ─────────────────────────────────────────── */}
                <header className="shrink-0 h-[52px] px-5 flex items-center justify-between border-b border-white/[0.06] bg-[#0f0f0f]/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/5 transition-all shrink-0"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <img src={logoImg} alt="Tech4U" className="w-6 h-6 object-contain opacity-70 shrink-0 hidden sm:block" />
                        <div className="flex items-center gap-2 min-w-0">
                            <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest shrink-0 ${diffCls}`}>
                                {lab.difficulty}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-neon/10 border border-neon/30 text-neon text-[8px] font-black uppercase tracking-widest shrink-0">
                                {lab.category}
                            </span>
                            <span className="text-slate-600 hidden sm:inline">·</span>
                            <h1 className="text-sm font-black uppercase italic tracking-tighter leading-none text-white truncate hidden sm:block">
                                {lab.title}
                            </h1>
                        </div>
                    </div>

                    {!isLocked && (
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleRestartLab}
                                disabled={startingLab}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all text-[10px] font-black uppercase tracking-wider disabled:opacity-40"
                            >
                                <RotateCcw className={`w-3 h-3 ${startingLab ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Reiniciar</span>
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={completed || !wsUrl}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-black uppercase tracking-wider text-[10px] transition-all ${
                                    completed
                                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                        : 'bg-neon text-black hover:shadow-[0_0_20px_rgba(198,255,51,0.3)] hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
                                }`}
                            >
                                {completed
                                    ? <><CheckCircle className="w-3.5 h-3.5" /> Completado</>
                                    : <><Play className="w-3.5 h-3.5" /> Completar Misión</>
                                }
                            </button>
                        </div>
                    )}
                </header>

                {/* ── BODY ────────────────────────────────────────────────── */}
                <div className="flex-1 flex min-h-0 overflow-hidden">

                    {/* ── LEFT PANEL ──────────────────────────────────────── */}
                    <div className={`flex flex-col shrink-0 border-r border-white/[0.05] bg-[#0c0c0c] transition-all duration-300 ${panelOpen ? 'w-[340px]' : 'w-11'}`}>
                        {panelOpen ? (
                            <>
                                {/* Tab bar */}
                                <div className="flex items-center gap-0.5 p-1.5 border-b border-white/[0.05] shrink-0">
                                    {tabs.map(({ id: tid, Icon, label }) => (
                                        <button
                                            key={tid}
                                            onClick={() => setActiveTab(tid)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                activeTab === tid
                                                    ? 'bg-white/[0.07] text-neon'
                                                    : 'text-slate-600 hover:text-slate-400'
                                            }`}
                                        >
                                            <Icon className="w-3 h-3" />
                                            {label}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPanelOpen(false)}
                                        className="p-1.5 rounded-lg text-slate-700 hover:text-slate-400 transition-all ml-0.5"
                                        title="Colapsar panel"
                                    >
                                        <PanelLeftClose className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Tab content */}
                                <div className="flex-1 overflow-y-auto scrollbar-premium">

                                    {/* ── GUIDE tab ─────────────────────── */}
                                    {activeTab === 'guide' && (
                                        <div className="p-5 space-y-5 animate-in fade-in slide-in-from-left-2 duration-200">
                                            <section>
                                                <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">
                                                    <Info className="w-3.5 h-3.5 text-neon" /> Teoría / Conceptos
                                                </h4>
                                                <div className="lab-markdown bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                                                    <MarkdownPreview
                                                        source={lab.description || 'Sin descripción.'}
                                                        wrapperElement={{ 'data-color-mode': 'dark' }}
                                                        style={{ background: 'transparent', fontSize: '11px', fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
                                                    />
                                                </div>
                                            </section>

                                            {lab.step_by_step_guide && (
                                                <section>
                                                    <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">
                                                        <Zap className="w-3.5 h-3.5 text-neon" /> Guía Paso a Paso
                                                    </h4>
                                                    <div className="lab-markdown bg-neon/[0.03] rounded-xl p-4 border border-neon/[0.08]">
                                                        <MarkdownPreview
                                                            source={lab.step_by_step_guide}
                                                            wrapperElement={{ 'data-color-mode': 'dark' }}
                                                            style={{ background: 'transparent', fontSize: '11px', fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
                                                        />
                                                    </div>
                                                </section>
                                            )}
                                        </div>
                                    )}

                                    {/* ── CHALLENGES tab ─────────────────── */}
                                    {activeTab === 'challenges' && (
                                        <div className="p-5 space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                                                    Retos del Sistema
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    {challenges.length > 0 && (
                                                        <span className="text-[9px] font-mono text-slate-500">
                                                            {completedCount}/{challenges.length}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => handleCheckDirectory()}
                                                        disabled={checkingDir || !wsUrl}
                                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 hover:text-neon hover:border-neon/30 transition-all disabled:opacity-40"
                                                    >
                                                        {checkingDir
                                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                                            : <Eye className="w-3 h-3" />
                                                        }
                                                        ls
                                                    </button>
                                                </div>
                                            </div>

                                            {dirContent && (
                                                <div className="p-3 rounded-xl bg-neon/5 border border-neon/15 animate-in zoom-in-95 duration-150">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-[8px] font-black text-neon uppercase tracking-widest">/home/student</span>
                                                        <button onClick={() => setDirContent(null)} className="text-slate-600 hover:text-white text-xs">×</button>
                                                    </div>
                                                    <pre className="text-[10px] font-mono text-neon/70 whitespace-pre-wrap leading-relaxed">{dirContent}</pre>
                                                </div>
                                            )}

                                            {challenges.length === 0 ? (
                                                <p className="text-[10px] text-slate-600 font-mono italic text-center py-8">
                                                    No hay retos definidos para este lab.
                                                </p>
                                            ) : challenges.map((ch) => {
                                                const done = completedChallenges.includes(ch.id);
                                                return (
                                                    <div
                                                        key={ch.id}
                                                        className={`rounded-xl border p-4 space-y-2 transition-colors ${
                                                            done
                                                                ? 'border-emerald-500/20 bg-emerald-500/5'
                                                                : 'border-white/[0.05] bg-white/[0.02]'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${done ? 'bg-emerald-400' : 'bg-neon shadow-[0_0_5px_var(--neon)]'}`} />
                                                            <h5 className={`text-[10px] font-black uppercase tracking-tight ${done ? 'text-emerald-400' : 'text-white'}`}>
                                                                {ch.title}
                                                            </h5>
                                                            {done && <CheckCircle className="w-3 h-3 text-emerald-400 ml-auto" />}
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                                                            {ch.description}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* ── SOLUTION tab ───────────────────── */}
                                    {activeTab === 'solution' && (
                                        <div className="p-5 animate-in fade-in slide-in-from-left-2 duration-200">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                                                <h4 className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                                                    Guía Táctica
                                                </h4>
                                            </div>
                                            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl mb-4">
                                                <p className="text-[10px] font-mono text-amber-400/80 leading-relaxed">
                                                    Consulta la solución solo si llevas más de 10 minutos atascado. Intentar resolver el reto por tu cuenta es lo que te hace crecer.
                                                </p>
                                            </div>
                                            {lab.step_by_step_guide ? (
                                                <div className="lab-markdown bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                                                    <MarkdownPreview
                                                        source={lab.step_by_step_guide}
                                                        wrapperElement={{ 'data-color-mode': 'dark' }}
                                                        style={{ background: 'transparent', fontSize: '11px', fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-slate-600 font-mono italic text-center py-8">
                                                    No hay guía detallada para este laboratorio.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Practice badge */}
                                <div className="shrink-0 px-5 py-3 border-t border-white/[0.04] flex items-center gap-2.5">
                                    <Zap className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-600 tracking-wider">Lab de Práctica · Sin XP</p>
                                        <p className="text-[9px] font-mono text-slate-700 leading-tight">Gana XP en Skill Labs y Tests</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* ── COLLAPSED state ─── */
                            <div className="flex flex-col items-center gap-1.5 p-1.5 pt-3">
                                <button
                                    onClick={() => setPanelOpen(true)}
                                    title="Expandir panel"
                                    className="p-2 rounded-lg text-slate-600 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    <PanelLeftOpen className="w-3.5 h-3.5" />
                                </button>
                                <div className="w-px h-4 bg-white/5 my-1" />
                                {tabs.map(({ id: tid, Icon, label }) => (
                                    <button
                                        key={tid}
                                        onClick={() => { setActiveTab(tid); setPanelOpen(true); }}
                                        title={label}
                                        className={`p-2 rounded-lg transition-all ${activeTab === tid ? 'text-neon bg-neon/10' : 'text-slate-700 hover:text-slate-400'}`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── TERMINAL AREA ───────────────────────────────────── */}
                    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#0a0a0a]">

                        {/* Terminal chrome header */}
                        <div className="shrink-0 h-9 px-4 flex items-center justify-between bg-[#111] border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                {/* macOS-style dots in hacker palette */}
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60 hover:bg-amber-500 transition-colors" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 hover:bg-emerald-500 transition-colors" />
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                                    <TerminalIcon className="w-3 h-3 text-slate-600" />
                                    bash — student@sandbox
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-[9px] font-mono">
                                {wsUrl ? (
                                    <span className="flex items-center gap-1.5 text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                                        CONECTADO
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-slate-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block" />
                                        DESCONECTADO
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Terminal body — fills ALL remaining vertical space */}
                        <div className="flex-1 relative overflow-hidden min-h-0">
                            {isLocked ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/95 backdrop-blur-xl p-8 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                                        <Lock className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">
                                        Contenido Premium
                                    </h3>
                                    <p className="text-slate-500 font-mono text-xs mb-7 leading-relaxed max-w-xs">
                                        Desbloquea todos los laboratorios con Tech4U Premium.
                                    </p>
                                    <button
                                        onClick={() => navigate('/planes')}
                                        className="px-7 py-3 rounded-xl bg-amber-500 text-black font-black uppercase tracking-widest text-xs hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2"
                                    >
                                        <Crown className="w-4 h-4" /> Ver planes
                                    </button>
                                </div>
                            ) : !wsUrl ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm p-8 text-center">
                                    {/* Animated terminal lines decoration */}
                                    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                                        {[...Array(8)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute font-mono text-neon/5 text-[10px] whitespace-nowrap"
                                                style={{ top: `${i * 13 + 5}%`, left: '5%' }}
                                            >
                                                {['$ systemctl status nginx', '$ ls -la /home/student', '$ chmod +x script.sh',
                                                  '$ cat /var/log/auth.log', '$ netstat -tulnp', '$ ps aux | grep apache',
                                                  '$ grep -r "password" /etc', '$ find / -perm -4000'][i]}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-3xl bg-neon/10 border border-neon/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(198,255,51,0.1)]">
                                            <TerminalIcon className="w-10 h-10 text-neon" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">
                                            Sandbox Desconectado
                                        </h3>
                                        <p className="text-slate-500 font-mono text-xs mb-8 max-w-xs">
                                            Inicia un entorno de servidor aislado para comenzar el ejercicio.
                                        </p>
                                        <button
                                            onClick={handleStartLab}
                                            disabled={startingLab}
                                            className="px-8 py-3.5 rounded-2xl bg-neon text-black font-black uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(198,255,51,0.4)] hover:scale-[1.02] transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            {startingLab
                                                ? <><Loader2 className="w-5 h-5 animate-spin" /> Preparando...</>
                                                : <><Play className="w-5 h-5" /> Iniciar Terminal</>
                                            }
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* TerminalComponent fills 100% of this flex container */
                                <div className="absolute inset-0 p-3">
                                    <TerminalComponent wsUrl={wsUrl} />
                                </div>
                            )}
                        </div>

                        {/* Ultra-thin bottom status strip */}
                        <div className="shrink-0 h-6 px-4 flex items-center justify-between bg-[#0d0d0d] border-t border-white/[0.04]">
                            <span className="text-[8px] font-mono text-slate-700 uppercase tracking-widest">
                                {wsUrl ? '● SANDBOX ACTIVO' : '○ SANDBOX INACTIVO'}
                            </span>
                            <div className="flex items-center gap-3 text-[8px] font-mono text-slate-700">
                                <span>pts/0</span>
                                <span className="text-slate-800">·</span>
                                <span>student@tech4u:~</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── SUCCESS OVERLAY ─────────────────────────────────────────── */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass p-12 rounded-[3rem] border border-neon/30 text-center max-w-md relative overflow-hidden shadow-[0_0_100px_rgba(198,255,51,0.12)] animate-in zoom-in-95 duration-500">
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-neon/15 rounded-full blur-[80px] pointer-events-none" />
                        <div className="relative z-10">
                            <div className="w-20 h-20 rounded-3xl bg-neon flex items-center justify-center mx-auto mb-7 rotate-6 shadow-[0_0_40px_rgba(198,255,51,0.35)]">
                                <Trophy className="w-10 h-10 text-black" />
                            </div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">
                                ¡Lab <span className="text-neon">Superado!</span>
                            </h2>
                            <p className="text-slate-400 font-mono text-xs mb-8 leading-relaxed">
                                Has completado el laboratorio. Sigue practicando para dominar el tema.
                            </p>
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Tipo</p>
                                    <p className="text-base font-black text-slate-300">Práctica</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Módulo</p>
                                    <p className="text-base font-black text-white">{lab.category}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(-1)}
                                className="w-full py-3.5 rounded-2xl bg-neon text-black font-black uppercase tracking-widest text-xs hover:shadow-[0_0_25px_rgba(198,255,51,0.3)] hover:scale-[1.01] transition-all"
                            >
                                Continuar Formación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
