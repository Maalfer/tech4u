import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logoImg from '../assets/tech4u_logo.png';
import {
    ChevronLeft,
    Terminal as TerminalIcon,
    BookOpen,
    CheckCircle,
    Play,
    Info,
    RotateCcw,
    Zap,
    Trophy,
    Loader2,
    Eye,
    EyeOff,
    Lock,
    Crown,
    Sparkles
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TerminalComponent from '../components/TerminalComponent';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DOMPurify from 'dompurify';

export default function LabDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [lab, setLab] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startingLab, setStartingLab] = useState(false);
    const [activeTab, setActiveTab] = useState('instructions');
    const [wsUrl, setWsUrl] = useState(null);
    const [completedChallenges, setCompletedChallenges] = useState([]);
    const [validatingChallenge, setValidatingChallenge] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [challengeInputs, setChallengeInputs] = useState({});
    const [failedAttempts, setFailedAttempts] = useState({});
    const [checkingDir, setCheckingDir] = useState(false);
    const [dirContent, setDirContent] = useState(null);

    useEffect(() => {
        const fetchLabAndProgress = async () => {
            try {
                const [labRes, progressRes] = await Promise.all([
                    api.get(`/labs/${id}`),
                    api.get(`/labs/${id}/challenges/completed`)
                ]);
                setLab(labRes.data);
                setCompletedChallenges(progressRes.data);

                // Complete status is now managed by the backend shortcut
            } catch (err) {
                if (import.meta.env.DEV) console.error("Error fetching lab context:", err);
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
            // Token is now in httpOnly cookie, sent automatically by axios with withCredentials
            const res = await api.post(`/labs/${id}/start`, {});
            setWsUrl(res.data.ws_url);
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error starting lab:", err);
            alert("No se pudo iniciar el sandbox. Contacta con soporte.");
        } finally {
            setStartingLab(false);
        }
    };

    const handleValidateChallenge = async (challengeId) => {
        const studentInput = challengeInputs[challengeId];
        // Note: Some challenges might accept empty input (like navigations), but usually students paste something

        setValidatingChallenge(challengeId);
        try {
            const res = await api.post(`/labs/${id}/challenges/validate`, {
                challenge_id: challengeId,
                student_input: studentInput || ""
            });
            if (res.data.success) {
                if (!completedChallenges.includes(challengeId)) {
                    const nextCompleted = [...completedChallenges, challengeId];
                    setCompletedChallenges(nextCompleted);
                    setFailedAttempts(prev => ({ ...prev, [challengeId]: 0 }));

                    // Check if this was the last one
                    const total = (lab.challenges || []).length;
                    if (nextCompleted.length === total) {
                        handleComplete(); // Finalize lab
                    }
                }
            } else {
                setFailedAttempts(prev => ({ ...prev, [challengeId]: (prev[challengeId] || 0) + 1 }));
                alert(res.data.message || "Valor incorrecto. Revisa tu terminal.");
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error validating challenge:", err);
            alert("Error de validación.");
        } finally {
            setValidatingChallenge(null);
        }
    };

    const handleCheckDirectory = async (path = "/home/student") => {
        setCheckingDir(true);
        try {
            const res = await api.get(`/labs/${id}/utils/ls`, { params: { path } });
            setDirContent(res.data.content);
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error checking directory:", err);
            alert("No se pudo obtener el contenido. Asegúrate de que el sandbox esté activo.");
        } finally {
            setCheckingDir(false);
        }
    };

    const handleInputChange = (challengeId, value) => {
        setChallengeInputs(prev => ({ ...prev, [challengeId]: value }));
    };

    const handleComplete = async () => {
        try {
            const res = await api.post(`/labs/${id}/complete`);
            const data = res.data;

            if (data.success) {
                setCompleted(true);
                setShowSuccess(true);
                refreshUser();
            } else {
                alert(data.message || "Aún no has completado todos los retos.");
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error completing lab:", err);
        }
    };

    const handleRestartLab = async () => {
        setWsUrl(null);
        setStartingLab(true);
        try {
            // Token is sent automatically via httpOnly cookie (withCredentials: true in api.js)
            const res = await api.post(`/labs/${id}/restart`, {});
            setWsUrl(res.data.ws_url);
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error restarting lab:", err);
            alert("No se pudo reiniciar el sandbox.");
        } finally {
            setStartingLab(false);
        }
    };

    if (loading || !lab) return null;

    const isLocked = !lab.is_unlocked;

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="mb-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <img src={logoImg} alt="Tech4U" className="w-8 h-8 object-contain drop-shadow-[0_0_6px_rgba(198,255,51,0.45)] hidden sm:block" />
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-full bg-neon/10 border border-neon/30 text-neon text-[8px] font-black uppercase tracking-widest">{lab.category}</span>
                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-slate-500 font-mono text-[9px] uppercase">{lab.difficulty}</span>
                            </div>
                            <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">
                                {lab.title}
                            </h1>
                        </div>
                    </div>

                    {!isLocked && (
                        <div className="flex items-center gap-3">
                            <button onClick={handleRestartLab} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all text-xs font-bold font-mono">
                                <RotateCcw className="w-3.5 h-3.5" /> REINICIAR
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={completed || !wsUrl}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${completed ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500' : 'bg-neon border border-neon text-black hover:shadow-[0_0_20px_var(--neon-alpha-40)] disabled:opacity-50 disabled:cursor-not-allowed'}`}
                            >
                                {completed ? <CheckCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {completed ? 'COMPLETADO' : 'COMPLETAR MISION'}
                            </button>
                        </div>
                    )}
                </header>

                <div className="flex-1 flex gap-6 min-h-0">
                    {/* Sidebar: Instructions */}
                    <aside className="w-1/3 flex flex-col gap-4 overflow-hidden">
                        <div className="glass rounded-3xl border border-white/5 flex flex-col h-full overflow-hidden">
                            <div className="flex border-b border-white/5 p-1 shrink-0">
                                <button
                                    onClick={() => { setActiveTab('instructions'); setDirContent(null); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'instructions' ? 'bg-white/5 text-neon shadow-[0_0_10px_rgba(198,255,51,0.1)]' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <BookOpen className="w-4 h-4" /> Guía de Lab
                                </button>
                                <button
                                    onClick={() => { setActiveTab('objectives'); setDirContent(null); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'objectives' ? 'bg-white/5 text-neon shadow-[0_0_10px_rgba(198,255,51,0.1)]' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <CheckCircle className="w-4 h-4" /> Objetivos
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 scrollbar-premium">
                                {activeTab === 'instructions' ? (
                                    <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-6">
                                        <section>
                                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white mb-4">
                                                <Info className="w-4 h-4 text-neon" /> Teoría / Conceptos
                                            </h4>
                                            <div className="prose prose-invert prose-xs max-w-none text-slate-400 font-mono leading-relaxed bg-white/2 p-5 rounded-2xl border border-white/5">
                                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize((lab.description || "Sin descripción.").replace(/\n/g, '<br/>')) }} />
                                            </div>
                                        </section>
                                        {lab.step_by_step_guide && (
                                            <section>
                                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white mb-4">
                                                    <Zap className="w-4 h-4 text-neon" /> Guía Paso a Paso
                                                </h4>
                                                <div className="prose prose-invert prose-xs max-w-none text-slate-400 font-mono leading-relaxed bg-neon/3 p-5 rounded-2xl border border-neon/10">
                                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lab.step_by_step_guide.replace(/\n/g, '<br/>')) }} />
                                                </div>
                                            </section>
                                        )}
                                    </div>
                                ) : activeTab === 'objectives' ? (
                                    <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Retos del Sistema</h4>
                                            <button
                                                onClick={() => handleCheckDirectory()}
                                                disabled={checkingDir || !wsUrl}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 hover:text-neon hover:border-neon/30 transition-all"
                                            >
                                                {checkingDir ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                                                VER CONTENIDO
                                            </button>
                                        </div>

                                        {dirContent && (
                                            <div className="p-4 rounded-xl bg-neon/5 border border-neon/20 mb-4 animate-in zoom-in-95 duration-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-black text-neon uppercase tracking-tighter">Explorador Táctico</span>
                                                    <button onClick={() => setDirContent(null)} className="text-slate-500 hover:text-white font-bold">×</button>
                                                </div>
                                                <pre className="text-[10px] font-mono text-neon/80 whitespace-pre-wrap">{dirContent}</pre>
                                            </div>
                                        )}

                                        {!lab.challenges || lab.challenges.length === 0 ? (
                                            <p className="text-[10px] text-slate-500 font-mono italic">No hay retos técnicos definidos para este lab.</p>
                                        ) : lab.challenges.map((ch) => (
                                            <div key={ch.id} className="p-5 rounded-2xl border border-white/5 bg-white/2 space-y-2">
                                                <h5 className="text-[11px] font-black uppercase tracking-tight text-white flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-neon shadow-[0_0_5px_var(--neon)]" />
                                                    {ch.title}
                                                </h5>
                                                <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                                                    {ch.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="p-6 glass rounded-4xl border border-white/5 bg-white/[0.02] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Zap className="w-12 h-12 text-slate-500" />
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Práctica</p>
                            <p className="text-sm font-black text-slate-400 italic tracking-tighter">Lab de refuerzo · Sin XP</p>
                            <p className="text-[9px] font-mono text-slate-600 mt-1">La XP se gana en Skill Labs y Tests</p>
                        </div>
                    </aside>

                    {/* Main Area: Terminal */}
                    <div className="flex-1 flex flex-col gap-4 min-h-0">
                        <div className="flex-1 relative glass rounded-3xl border border-white/5 overflow-hidden">
                            {isLocked ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-xl z-20 p-8 text-center rounded-3xl">
                                    <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
                                        <Lock className="w-7 h-7 text-amber-500" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Este contenido es Premium</h3>
                                    <p className="text-slate-400 font-mono text-xs mb-8 leading-relaxed max-w-sm">
                                        Desbloquea todos los laboratorios y ejercicios avanzados con Tech4U Premium.
                                    </p>
                                    <button
                                        onClick={() => navigate('/planes')}
                                        className="px-8 py-3.5 rounded-xl bg-amber-500 text-black font-black uppercase tracking-widest text-xs hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all flex items-center gap-2"
                                    >
                                        <Crown className="w-4 h-4" /> Ver planes
                                    </button>
                                </div>
                            ) : !wsUrl ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-20">
                                    <div className="w-20 h-20 rounded-4xl bg-neon/10 border border-neon/20 flex items-center justify-center mb-6">
                                        <TerminalIcon className="w-10 h-10 text-neon" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">Sandbox Desconectado</h3>
                                    <p className="text-slate-400 font-mono text-xs mb-8 text-center max-w-xs">Inicia un entorno de servidor aislado para comenzar el ejercicio.</p>
                                    <button
                                        onClick={handleStartLab}
                                        disabled={startingLab}
                                        className="px-8 py-4 rounded-2xl bg-neon text-black font-black uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(198,255,51,0.5)] transition-all flex items-center gap-3"
                                    >
                                        {startingLab ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                        {startingLab ? 'PREPARANDO...' : 'INICIAR TERMINAL'}
                                    </button>
                                </div>
                            ) : (
                                <TerminalComponent wsUrl={wsUrl} />
                            )}
                        </div>

                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${wsUrl ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                                    Estado del Sistema: {wsUrl ? 'Conectado (Sandbox Activo)' : 'Desconectado'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-600">
                                [<span className="text-slate-400 italic">pts/0</span>] student@tech4u:~
                            </div>
                        </div>

                        {/* Solution Accordion */}
                        <div className="glass rounded-2xl border border-white/5 overflow-hidden transition-all duration-500">
                            <button
                                onClick={() => setShowSolution(!showSolution)}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all outline-none group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl transition-all ${showSolution ? 'bg-neon/20 text-neon' : 'bg-white/5 text-slate-500'}`}>
                                        {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-0.5">Solución / Paso a Paso</h4>
                                        <p className="text-[9px] font-mono text-slate-500 uppercase">¿Te has atascado? Consulta la guía táctica</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-lg border text-[8px] font-black uppercase transition-all
                                    ${showSolution ? 'bg-neon text-black border-neon' : 'bg-white/5 border-white/10 text-slate-500 group-hover:text-white'}`}>
                                    {showSolution ? 'Ocultar' : 'Ver Solución'}
                                </div>
                            </button>

                            {showSolution && (
                                <div className="p-6 border-t border-white/5 bg-black/40 animate-in slide-in-from-top-2 duration-300">
                                    <div className="prose prose-invert prose-sm max-w-none font-mono text-slate-400">
                                        {lab.step_by_step_guide ? (
                                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lab.step_by_step_guide.replace(/\n/g, '<br/>')) }} />
                                        ) : (
                                            <p className="italic">No hay una guía detallada disponible para este laboratorio.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SEO Internal Linking */}
                        <div className="mt-4 pt-4 border-t border-white/5 text-center shrink-0">
                            <h3 className="text-sm font-black italic tracking-tight text-slate-400 mb-3">Continúa aprendiendo</h3>
                            <div className="flex justify-center gap-3">
                                <button onClick={() => navigate('/teoria')} className="px-4 py-2 rounded-xl bg-purple-500/5 border border-purple-500/20 text-purple-400 font-black text-[10px] uppercase tracking-widest hover:bg-purple-500/10 transition-all">
                                    📚 Teoría
                                </button>
                                <button onClick={() => navigate('/sql-skills')} className="px-4 py-2 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-400 font-black text-[10px] uppercase tracking-widest hover:bg-blue-500/10 transition-all">
                                    📊 SQL Skills
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Overlay */}
                {showSuccess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                        {/* ... existing success UI ... */}
                        <div className="glass p-12 rounded-[3rem] border border-neon/30 text-center max-w-lg relative overflow-hidden shadow-[0_0_100px_rgba(198,255,51,0.15)] animate-in zoom-in-95 duration-500">
                            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-neon/20 rounded-full blur-[80px]" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 rounded-4xl bg-neon flex items-center justify-center mx-auto mb-8 rotate-12 shadow-[0_0_40px_rgba(198,255,51,0.4)]">
                                    <Trophy className="w-12 h-12 text-black" />
                                </div>
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-2">¡Laboratorio <span className="text-neon">Superado!</span></h2>
                                <p className="text-slate-400 font-mono text-sm mb-8 leading-relaxed">
                                    Has demostrado tus habilidades técnicas. Los puntos de experiencia han sido sumados a tu perfil.
                                </p>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Tipo</p>
                                        <p className="text-lg font-black text-slate-300">Práctica</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Rango</p>
                                        <p className="text-2xl font-black text-white">ASIR</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="w-full py-4 rounded-2xl bg-neon text-black font-black uppercase tracking-widest text-sm hover:shadow-[0_0_30_rgba(198,255,51,0.5)] transition-all"
                                >
                                    Continuar Formación
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
