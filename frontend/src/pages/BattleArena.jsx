import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Swords, Copy, Check, Users, Trophy, Zap, Clock,
    ChevronLeft, Share2, Crown, Shield, Timer, Flame,
    AlertTriangle, RefreshCw, Target
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../constants/api';

// ─── WhatsApp share icon ───────────────────────────────────────────────────────
const WhatsAppIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);

const SUBJECTS = [
    'Redes', 'Sistemas Operativos', 'Bases de Datos', 'Seguridad',
    'Terminal Skills', 'SQL Skills', 'General'
];

// ─── Answer option button ──────────────────────────────────────────────────────
function AnswerBtn({ label, text, selected, correct, disabled, onClick }) {
    let style = 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:bg-white/8';
    if (selected && correct === null) style = 'border-violet-500/60 bg-violet-500/15 text-white';
    if (correct === true)  style = 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300';
    if (correct === false && selected) style = 'border-red-500/60 bg-red-500/15 text-red-300';
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200 disabled:cursor-default ${style}`}
        >
            <span className="w-6 h-6 rounded-lg border border-current/40 flex items-center justify-center font-black text-[11px] font-mono flex-shrink-0 mt-0.5 opacity-70">
                {label}
            </span>
            <span className="font-mono text-sm leading-relaxed">{text}</span>
        </button>
    );
}

// ─── Player avatar strip ───────────────────────────────────────────────────────
function PlayerStrip({ name, level, score, total, isMe, isWinner, finished }) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
            isWinner ? 'border-amber-500/40 bg-amber-500/8' :
            isMe ? 'border-violet-500/30 bg-violet-500/8' :
            'border-white/8 bg-white/[0.03]'
        }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border ${
                isWinner ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                isMe ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' :
                'bg-white/10 border-white/15 text-slate-300'
            }`}>
                {name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-black text-sm text-white truncate">{name ?? '...'}</p>
                    {isMe && <span className="text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">tú</span>}
                    {isWinner && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[10px] font-mono text-slate-500">Nivel {level ?? 1}</p>
            </div>
            <div className="text-right">
                <p className={`text-xl font-black font-mono ${isWinner ? 'text-amber-400' : isMe ? 'text-violet-400' : 'text-slate-300'}`}>
                    {score}
                </p>
                <p className="text-[9px] font-mono text-slate-600">/{total} pts</p>
            </div>
            {finished && <div className="w-2 h-2 rounded-full bg-emerald-400" title="Terminó" />}
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function BattleArena() {
    const { user } = useAuth();
    const navigate  = useNavigate();
    const wsRef     = useRef(null);
    const timerRef  = useRef(null);

    // ── Phase: lobby | waiting | countdown | battle | results ─────────────────
    const [phase, setPhase]               = useState('lobby');
    const [roomCode, setRoomCode]         = useState('');
    const [joinCode, setJoinCode]         = useState('');
    const [subject, setSubject]           = useState('General');
    const [creating, setCreating]         = useState(false);
    const [joining, setJoining]           = useState(false);
    const [error, setError]               = useState('');
    const [copied, setCopied]             = useState(false);

    // ── Battle state ──────────────────────────────────────────────────────────
    const [countdown, setCountdown]       = useState(3);
    const [questions, setQuestions]       = useState([]);
    const [currentQ, setCurrentQ]         = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerResult, setAnswerResult] = useState(null); // {correct, correctAnswer}
    const [answered, setAnswered]         = useState(false);
    const [timeLeft, setTimeLeft]         = useState(15);
    const [players, setPlayers]           = useState({});
    const [myScore, setMyScore]           = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [results, setResults]           = useState(null);
    const [answerTimes, setAnswerTimes]   = useState({});
    const questionStartTime              = useRef(null);

    const myId = user?.id;

    // ── Cleanup ───────────────────────────────────────────────────────────────
    const cleanup = useCallback(() => {
        if (wsRef.current) { try { wsRef.current.close(); } catch {} wsRef.current = null; }
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }, []);

    useEffect(() => () => cleanup(), [cleanup]);

    // ── Connect WebSocket ─────────────────────────────────────────────────────
    const connectWS = useCallback((code) => {
        cleanup();
        const wsBase = API_BASE.replace(/^http/, 'ws');
        // NOTE: WebSocket connections to the same origin will include httpOnly cookies automatically.
        // The backend should verify authentication using the cookie instead of a query parameter.
        // If backend still requires token param, it will need a one-time ticket from /ws-ticket endpoint.
        const ws = new WebSocket(`${wsBase}/ws/battle/${code}`);
        wsRef.current = ws;

        ws.onopen = () => setError('');

        ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);

            if (msg.type === 'waiting') {
                setPlayers(msg.players || {});
                setPhase('waiting');
            }
            if (msg.type === 'player_joined') {
                setPlayers(msg.players || {});
            }
            if (msg.type === 'countdown') {
                setPhase('countdown');
                setCountdown(msg.seconds);
                const tick = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) { clearInterval(tick); return 0; }
                        return prev - 1;
                    });
                }, 1000);
            }
            if (msg.type === 'start') {
                setQuestions(msg.questions);
                setCurrentQ(0);
                setMyScore(0);
                setOpponentScore(0);
                setPhase('battle');
                startQuestionTimer();
                questionStartTime.current = Date.now();
            }
            if (msg.type === 'score') {
                const scores = msg.scores || {};
                Object.entries(scores).forEach(([uid, s]) => {
                    if (parseInt(uid) === myId) setMyScore(s);
                    else setOpponentScore(s);
                });
            }
            if (msg.type === 'result') {
                cleanup();
                setResults(msg);
                setPhase('results');
                if (typeof window.trackEvent === 'function') {
                    window.trackEvent('battle_completed', {
                        winner: msg.winner_id === myId ? 'me' : 'opponent',
                        xp_earned: msg.xp_earned
                    });
                }
            }
            if (msg.type === 'error') {
                setError(msg.message);
            }
            if (msg.type === 'opponent_disconnected') {
                setError('Tu oponente se ha desconectado. La batalla ha terminado.');
                cleanup();
                setPhase('lobby');
            }
        };

        ws.onerror = () => setError('Error de conexión WebSocket. ¿Está el servidor activo?');
        ws.onclose = (e) => {
            if (e.code !== 1000 && phase !== 'results') {
                setError('Conexión perdida.');
            }
        };
    }, [cleanup, myId, phase]);

    // ── Per-question countdown timer ──────────────────────────────────────────
    const startQuestionTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(15);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    // Auto-submit null (timeout)
                    if (!answered) submitAnswer(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [answered]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Submit answer ─────────────────────────────────────────────────────────
    const submitAnswer = useCallback((answer) => {
        if (answered || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        setAnswered(true);
        if (timerRef.current) clearInterval(timerRef.current);
        const timeTaken = Date.now() - (questionStartTime.current || Date.now());
        setSelectedAnswer(answer);
        wsRef.current.send(JSON.stringify({
            type: 'answer',
            question_id: questions[currentQ]?.id,
            answer,
            time_ms: timeTaken,
        }));
        // Show result briefly then advance
        setTimeout(() => {
            const next = currentQ + 1;
            if (next < questions.length) {
                setCurrentQ(next);
                setSelectedAnswer(null);
                setAnswerResult(null);
                setAnswered(false);
                setTimeLeft(15);
                questionStartTime.current = Date.now();
                startQuestionTimer();
            }
        }, 900);
    }, [answered, questions, currentQ, startQuestionTimer]);

    // ── Create room ───────────────────────────────────────────────────────────
    const createRoom = async () => {
        setCreating(true); setError('');
        try {
            const res = await api.post(`/battle/create?subject=${encodeURIComponent(subject)}`);
            const code = res.data.room_code;
            setRoomCode(code);
            connectWS(code);
        } catch (err) {
            setError(err.response?.data?.detail || 'No se pudo crear la sala.');
        } finally { setCreating(false); }
    };

    const joinRoom = async () => {
        const code = joinCode.trim().toUpperCase();
        if (!code) return;
        setJoining(true); setError('');
        try {
            await api.post(`/battle/join/${code}`);
            setRoomCode(code);
            connectWS(code);
        } catch (err) {
            setError(err.response?.data?.detail || 'Sala no encontrada o llena.');
        } finally { setJoining(false); }
    };

    const copyInvite = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        const text = encodeURIComponent(`⚔️ ¡Te reto a una batalla en Tech4U Academy! Código de sala: *${roomCode}*\nEntra en tech4uacademy.es → Battle Arena y úsalo. ¡Te espero!`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const resetToLobby = () => {
        cleanup();
        setPhase('lobby');
        setRoomCode('');
        setJoinCode('');
        setQuestions([]);
        setCurrentQ(0);
        setResults(null);
        setMyScore(0);
        setOpponentScore(0);
        setError('');
    };

    // ── Opponent data ─────────────────────────────────────────────────────────
    const opponent = Object.values(players).find(p => p.id !== myId);
    const me       = Object.values(players).find(p => p.id === myId);
    const q        = questions[currentQ];
    const OPTIONS  = ['A', 'B', 'C', 'D'];

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-60 p-8 relative overflow-hidden">

                {/* Ambient */}
                <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[500px] bg-violet-600/5 blur-[180px] rounded-full pointer-events-none -z-10" />
                <div className="fixed bottom-0 left-0 w-[500px] h-[400px] bg-red-600/4 blur-[160px] rounded-full pointer-events-none -z-10" />

                {/* Nav bar */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl bg-white/5 border border-white/8 text-slate-500 hover:text-white transition-all">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-slate-600">Dashboard</span>
                    <span className="text-slate-700 text-xs">/</span>
                    <span className="text-xs font-mono text-white font-bold">Battle Arena</span>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 font-mono text-sm">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-400">✕</button>
                    </div>
                )}

                {/* ═══════════ LOBBY ═══════════ */}
                {phase === 'lobby' && (
                    <div className="max-w-3xl mx-auto space-y-6">

                        {/* ── PREMIUM HERO ── */}
                        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06]"
                            style={{ background: 'linear-gradient(135deg, #0d0618 0%, #120820 40%, #0a0514 100%)' }}>

                            {/* Grid overlay */}
                            <div className="absolute inset-0 opacity-[0.14]"
                                style={{
                                    backgroundImage: `linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px),
                                                       linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)`,
                                    backgroundSize: '48px 48px',
                                }} />

                            {/* Radial glows */}
                            <div className="absolute top-0 left-1/4 w-96 h-64 rounded-full opacity-25 pointer-events-none"
                                style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.6) 0%, transparent 70%)', filter: 'blur(50px)' }} />
                            <div className="absolute bottom-0 right-1/4 w-80 h-56 rounded-full opacity-20 pointer-events-none"
                                style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.5) 0%, transparent 70%)', filter: 'blur(50px)' }} />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-32 opacity-10 pointer-events-none"
                                style={{ background: 'radial-gradient(ellipse, rgba(244,114,182,0.5) 0%, transparent 70%)', filter: 'blur(60px)' }} />

                            {/* Content */}
                            <div className="relative z-10 px-10 pt-11 pb-9">

                                {/* Badge row */}
                                <div className="flex items-center justify-between mb-7">
                                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 backdrop-blur-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">⚔️ Battle Arena · PvP en Tiempo Real</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                                        <Zap className="w-3 h-3 text-amber-500" />
                                        <span className="text-[10px] font-mono text-slate-500">WebSocket · Live</span>
                                    </div>
                                </div>

                                {/* Main headline */}
                                <div className="mb-7">
                                    <h1 className="text-5xl font-black tracking-tight leading-none mb-4">
                                        <span className="text-white">Pon a prueba tu</span>
                                        <br />
                                        <span className="text-transparent bg-clip-text"
                                            style={{ backgroundImage: 'linear-gradient(90deg, #c084fc 0%, #f472b6 50%, #fb7185 100%)' }}>
                                            conocimiento en directo
                                        </span>
                                    </h1>
                                    <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                                        Enfrenta a otro alumno en <span className="text-slate-300 font-medium">tiempo real</span>. 10 preguntas, 15 segundos cada una — mismas preguntas para ambos. <span className="text-slate-300 font-medium">Velocidad y precisión</span> son la clave para ganar.
                                    </p>
                                </div>

                                {/* Stats row */}
                                <div className="flex items-center gap-4 mb-2 flex-wrap">
                                    {[
                                        { label: 'Preguntas', value: '10', color: 'text-violet-400' },
                                        { label: 'Segundos/pregunta', value: '15s', color: 'text-rose-400' },
                                        { label: 'XP ganador', value: '+50', color: 'text-amber-400' },
                                        { label: 'Materias', value: '7', color: 'text-sky-400' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
                                            <span className={`text-xl font-black ${color}`}>{value}</span>
                                            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
                                        </div>
                                    ))}

                                    <div className="w-px h-8 bg-white/10 mx-1 hidden lg:block" />

                                    {/* Materia pills */}
                                    {['Redes', 'SQL', 'Sistemas', 'Seguridad', 'Terminal'].map(kw => (
                                        <span key={kw} className="hidden lg:inline-flex px-2.5 py-1 rounded-lg text-[10px] font-mono font-black tracking-wide border border-violet-500/15 bg-violet-500/8 text-violet-400">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* How it works — 3 cards */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: Swords, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/25', n: '01', t: 'Crea o únete', d: 'Crea una sala y comparte el código con tu rival, o únete con el suyo.' },
                                { icon: Zap,    color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/25',  n: '02', t: '10 preguntas', d: '15 segundos por pregunta. Las mismas preguntas para ambos jugadores.' },
                                { icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', n: '03', t: 'Gana XP',   d: '+50 XP al ganador, +10 XP al perdedor. La velocidad suma puntos extra.' },
                            ].map(item => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.n} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mx-auto mb-3 ${item.bg}`}>
                                            <Icon className={`w-5 h-5 ${item.color}`} />
                                        </div>
                                        <p className={`text-[9px] font-black uppercase tracking-widest font-mono ${item.color} mb-1`}>{item.n}</p>
                                        <p className="font-black text-white text-sm mb-1.5">{item.t}</p>
                                        <p className="text-[11px] font-mono text-slate-500 leading-relaxed">{item.d}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Create room */}
                        <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent p-7">
                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-violet-400 mb-4">Crear sala nueva</p>
                            <div className="flex gap-3 mb-4">
                                <select
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-violet-500/50"
                                >
                                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <button
                                    onClick={createRoom}
                                    disabled={creating}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider transition-all"
                                >
                                    {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Swords className="w-4 h-4" />}
                                    Crear sala
                                </button>
                            </div>
                        </div>

                        {/* Join room */}
                        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-7">
                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-4">Unirte a una sala existente</p>
                            <div className="flex gap-3">
                                <input
                                    value={joinCode}
                                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                    onKeyDown={e => e.key === 'Enter' && joinRoom()}
                                    placeholder="Código de sala (ej: ABC123)"
                                    maxLength={6}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-slate-400/50 tracking-widest uppercase"
                                />
                                <button
                                    onClick={joinRoom}
                                    disabled={joining || !joinCode.trim()}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white font-black text-sm uppercase tracking-wider transition-all border border-white/15"
                                >
                                    {joining ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Users className="w-4 h-4" />}
                                    Unirme
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════ WAITING ═══════════ */}
                {phase === 'waiting' && (
                    <div className="max-w-lg mx-auto text-center space-y-6">
                        <div className="rounded-3xl border border-violet-500/25 bg-violet-500/5 p-10">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                                    <Users className="w-8 h-8 text-violet-400" />
                                </div>
                            </div>
                            <p className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-2">Sala creada</p>
                            <p className="text-4xl font-black font-mono text-white tracking-[0.3em] mb-1">{roomCode}</p>
                            <p className="text-[11px] font-mono text-slate-500 mb-6">Esperando a tu oponente…</p>

                            {/* Animated waiting dots */}
                            <div className="flex justify-center gap-2 mb-8">
                                {[0,1,2].map(i => (
                                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-violet-500/60 animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />
                                ))}
                            </div>

                            <div className="flex gap-3 justify-center">
                                <button onClick={copyInvite} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border font-black text-xs uppercase tracking-wider transition-all ${copied ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400' : 'border-violet-500/35 bg-violet-500/10 text-violet-400'}`}>
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copied ? 'Copiado' : 'Copiar código'}
                                </button>
                                <button onClick={shareWhatsApp} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] font-black text-xs uppercase tracking-wider transition-all hover:bg-[#25D366]/20">
                                    <WhatsAppIcon size={14} />
                                    WhatsApp
                                </button>
                            </div>
                        </div>
                        <button onClick={resetToLobby} className="text-slate-600 hover:text-slate-400 font-mono text-xs uppercase tracking-wider transition-colors">
                            Cancelar y volver
                        </button>
                    </div>
                )}

                {/* ═══════════ COUNTDOWN ═══════════ */}
                {phase === 'countdown' && (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-slate-500 mb-4">La batalla empieza en</p>
                            <div
                                className="text-[10rem] font-black font-mono text-transparent bg-clip-text leading-none animate-pulse"
                                style={{ backgroundImage: 'linear-gradient(135deg, #c4b5fd, #f87171)' }}
                            >
                                {countdown > 0 ? countdown : 'GO'}
                            </div>
                            <p className="text-slate-500 font-mono text-sm mt-4">¡Prepárate!</p>
                        </div>
                    </div>
                )}

                {/* ═══════════ BATTLE ═══════════ */}
                {phase === 'battle' && q && (
                    <div className="max-w-3xl mx-auto space-y-5">
                        {/* Scoreboard */}
                        <div className="grid grid-cols-2 gap-3">
                            <PlayerStrip name={me?.nombre ?? user?.nombre} level={me?.level ?? user?.level} score={myScore} total={questions.length} isMe />
                            <PlayerStrip name={opponent?.nombre} level={opponent?.level} score={opponentScore} total={questions.length} />
                        </div>

                        {/* Progress + timer */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-violet-500 to-red-500 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
                            </div>
                            <div className={`flex items-center gap-1.5 font-mono text-sm font-black min-w-[52px] justify-end ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                                <Timer className="w-4 h-4" />
                                {timeLeft}s
                            </div>
                            <span className="text-[11px] font-mono text-slate-600 whitespace-nowrap">{currentQ + 1}/{questions.length}</span>
                        </div>

                        {/* Question card */}
                        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8">
                            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-600 mb-3">Pregunta {currentQ + 1}</p>
                            <p className="text-white font-black text-lg leading-relaxed mb-6">{q.text}</p>

                            <div className="space-y-2.5">
                                {OPTIONS.map((label, i) => {
                                    const optKey = `option_${label.toLowerCase()}`;
                                    const text = q[optKey];
                                    if (!text) return null;
                                    return (
                                        <AnswerBtn
                                            key={label}
                                            label={label}
                                            text={text}
                                            selected={selectedAnswer === label}
                                            correct={answerResult && selectedAnswer === label
                                                ? answerResult.correct
                                                : null}
                                            disabled={answered}
                                            onClick={() => submitAnswer(label)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════ RESULTS ═══════════ */}
                {phase === 'results' && results && (
                    <div className="max-w-lg mx-auto space-y-5">
                        {/* Winner banner */}
                        <div className={`rounded-3xl border p-8 text-center ${
                            results.winner_id === myId
                                ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent'
                                : 'border-white/10 bg-white/[0.02]'
                        }`}>
                            {results.winner_id === myId ? (
                                <>
                                    <Crown className="w-14 h-14 text-amber-400 mx-auto mb-3" />
                                    <p className="text-3xl font-black text-amber-400 uppercase italic mb-1">¡Victoria!</p>
                                    <p className="font-mono text-sm text-slate-400">Eres el más rápido y preciso</p>
                                </>
                            ) : results.winner_id === null ? (
                                <>
                                    <Shield className="w-14 h-14 text-slate-400 mx-auto mb-3" />
                                    <p className="text-3xl font-black text-white uppercase italic mb-1">Empate</p>
                                    <p className="font-mono text-sm text-slate-400">Ambos igualados</p>
                                </>
                            ) : (
                                <>
                                    <Flame className="w-14 h-14 text-red-400 mx-auto mb-3" />
                                    <p className="text-3xl font-black text-red-400 uppercase italic mb-1">Derrota</p>
                                    <p className="font-mono text-sm text-slate-400">¡A entrenar más!</p>
                                </>
                            )}
                            {results.xp_earned > 0 && (
                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 border border-neon/25">
                                    <Zap className="w-4 h-4 text-neon" />
                                    <span className="font-black text-neon font-mono">+{results.xp_earned} XP ganados</span>
                                </div>
                            )}
                        </div>

                        {/* Score breakdown */}
                        <div className="space-y-2">
                            {Object.entries(results.scores || {}).map(([uid, score]) => {
                                const isWinner = parseInt(uid) === results.winner_id;
                                const isMe     = parseInt(uid) === myId;
                                const pData    = players[parseInt(uid)] || {};
                                return (
                                    <PlayerStrip
                                        key={uid}
                                        name={pData.nombre ?? (isMe ? user?.nombre : 'Oponente')}
                                        level={pData.level ?? 1}
                                        score={score}
                                        total={questions.length}
                                        isMe={isMe}
                                        isWinner={isWinner}
                                        finished
                                    />
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button onClick={resetToLobby} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-black text-sm uppercase tracking-wider transition-all">
                                <RefreshCw className="w-4 h-4" />
                                Revancha
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/8 hover:bg-white/12 text-white font-black text-sm uppercase tracking-wider transition-all border border-white/10">
                                <Target className="w-4 h-4" />
                                Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
