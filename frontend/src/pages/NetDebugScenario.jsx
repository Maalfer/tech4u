import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Terminal, Lightbulb, CheckCircle2, XCircle,
    Star, Clock, AlertTriangle, Zap, ChevronDown, ChevronRight,
    RefreshCw, Trophy, CornerDownRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { SCENARIOS } from '../data/netDebugScenarios';

// ─── Device colours ───────────────────────────────────────────────────────────
const DEVICE_STYLE = {
    pc:     { fill: '#1e3a5f', stroke: '#3b82f6', label: 'PC',  accent: '#60a5fa' },
    router: { fill: '#3b1f0a', stroke: '#f97316', label: 'RTR', accent: '#fb923c' },
    switch: { fill: '#2e1a4a', stroke: '#a855f7', label: 'SW',  accent: '#c084fc' },
    server: { fill: '#0a2e1e', stroke: '#10b981', label: 'SRV', accent: '#34d399' },
};

// ─── Topology node SVG ────────────────────────────────────────────────────────
function DeviceNode({ node, isSelected, onClick }) {
    const st = DEVICE_STYLE[node.type] || DEVICE_STYLE.pc;
    const x = node.x;
    const y = node.y;

    return (
        <g
            transform={`translate(${x},${y})`}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            {/* Glow when selected */}
            {isSelected && (
                <ellipse cx="0" cy="0" rx="46" ry="36"
                    fill={st.accent}
                    opacity="0.12"
                    filter="url(#glow)"
                />
            )}

            {/* Main body — larger than before */}
            <rect
                x="-40" y="-30" width="80" height="60"
                rx="10"
                fill={isSelected ? st.fill + 'ff' : st.fill + 'cc'}
                stroke={isSelected ? st.accent : st.stroke}
                strokeWidth={isSelected ? 2.5 : 1.5}
            />

            {/* Type badge */}
            <rect x="-20" y="-28" width="40" height="16"
                rx="5"
                fill={st.accent + '28'}
            />
            <text
                textAnchor="middle"
                y="-15"
                fill={st.accent}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
            >
                {st.label}
            </text>

            {/* Device label */}
            <text
                textAnchor="middle"
                y="4"
                fill="white"
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
            >
                {node.label}
            </text>

            {/* Sub label (IP) — larger, more readable */}
            <text
                textAnchor="middle"
                y="19"
                fill={st.accent + 'cc'}
                fontSize="9"
                fontFamily="monospace"
            >
                {node.sublabel}
            </text>

            {/* Selected ring */}
            {isSelected && (
                <rect
                    x="-43" y="-33" width="86" height="66"
                    rx="13"
                    fill="none"
                    stroke={st.accent}
                    strokeWidth="1.2"
                    strokeDasharray="5 3"
                    opacity="0.7"
                />
            )}
        </g>
    );
}

// ─── Topology Link SVG ────────────────────────────────────────────────────────
function TopologyLink({ link, nodes }) {
    const from = nodes.find(n => n.id === link.from);
    const to   = nodes.find(n => n.id === link.to);
    if (!from || !to) return null;

    const dx  = to.x - from.x;
    const dy  = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux  = dx / len;
    const uy  = dy / len;

    // Place labels just outside node boundaries (node half-width = 40px + 12px gap)
    const clearance = 52;
    const liftY     = 12; // pixels above the line

    const fromLX = from.x + ux * clearance;
    const fromLY = from.y + uy * clearance - liftY;
    const toLX   = to.x   - ux * clearance;
    const toLY   = to.y   - uy * clearance - liftY;

    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;

    return (
        <g>
            <line
                x1={from.x} y1={from.y}
                x2={to.x}   y2={to.y}
                stroke={link.faulty ? '#f97316' : '#334155'}
                strokeWidth={link.faulty ? 2 : 1.5}
                strokeDasharray={link.faulty ? '6 3' : 'none'}
            />

            {/* Interface labels — anchored away from the node they sit near */}
            {link.fromLabel && (
                <text
                    x={fromLX} y={fromLY}
                    textAnchor="start"
                    fill="#64748b" fontSize="8" fontFamily="monospace"
                >
                    {link.fromLabel}
                </text>
            )}
            {link.toLabel && (
                <text
                    x={toLX} y={toLY}
                    textAnchor="end"
                    fill="#64748b" fontSize="8" fontFamily="monospace"
                >
                    {link.toLabel}
                </text>
            )}

            {/* Fault indicator at midpoint */}
            {link.faulty && (
                <g transform={`translate(${mx},${my})`}>
                    <circle cx="0" cy="0" r="8" fill="#431407" stroke="#f97316" strokeWidth="1.5" />
                    <text
                        textAnchor="middle" dominantBaseline="central"
                        fill="#fb923c" fontSize="9" fontFamily="monospace" fontWeight="bold"
                    >!</text>
                </g>
            )}
        </g>
    );
}

// ─── Topology SVG ─────────────────────────────────────────────────────────────
function Topology({ topology, selectedDevice, onSelectDevice }) {
    return (
        <svg
            viewBox={topology.viewBox}
            className="w-full"
            style={{ height: '230px' }}
        >
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Links (below nodes) */}
            {topology.links.map((link, i) => (
                <TopologyLink key={i} link={link} nodes={topology.nodes} />
            ))}

            {/* Nodes */}
            {topology.nodes.map(node => (
                <DeviceNode
                    key={node.id}
                    node={node}
                    isSelected={selectedDevice === node.id}
                    onClick={() => onSelectDevice(node.id === selectedDevice ? null : node.id)}
                />
            ))}
        </svg>
    );
}

// ─── CLI Output syntax ─────────────────────────────────────────────────────────
function CliLine({ text }) {
    // Colourize key status keywords
    const segments = [];
    let remaining = text;

    const patterns = [
        { re: /administratively down/gi, color: '#f87171' },
        { re: /\bdown\b/gi,              color: '#fb923c' },
        { re: /\bup\b/gi,               color: '#4ade80' },
        { re: /\bshutdown\b/gi,          color: '#f87171' },
        { re: /no shutdown/gi,           color: '#4ade80' },
        { re: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, color: '#67e8f9' },
        { re: /VLAN\s*\d+/gi,            color: '#c084fc' },
        { re: /\b(Gi|Fa|GigabitEthernet|FastEthernet)\d+\/\d+(\/\d+)?\b/gi, color: '#fbbf24' },
        { re: /\!\!\!\!\!/g,             color: '#4ade80' },
        { re: /\.\.\.\.\.+/g,            color: '#f87171' },
    ];

    const allMatches = [];
    patterns.forEach(({ re, color }) => {
        let m;
        re.lastIndex = 0;
        while ((m = re.exec(text)) !== null) {
            allMatches.push({ start: m.index, end: m.index + m[0].length, text: m[0], color });
        }
    });

    // Sort by start, remove overlaps
    allMatches.sort((a, b) => a.start - b.start);
    const clean = [];
    let last = 0;
    for (const m of allMatches) {
        if (m.start < last) continue;
        if (m.start > last) clean.push({ text: text.slice(last, m.start), color: null });
        clean.push({ text: m.text, color: m.color });
        last = m.end;
    }
    if (last < text.length) clean.push({ text: text.slice(last), color: null });

    return (
        <span>
            {clean.map((seg, i) =>
                seg.color
                    ? <span key={i} style={{ color: seg.color }}>{seg.text}</span>
                    : <span key={i} className="text-slate-300">{seg.text}</span>
            )}
        </span>
    );
}

function CliOutput({ text }) {
    return (
        <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {text.split('\n').map((line, i) => (
                <div key={i}><CliLine text={line} /></div>
            ))}
        </pre>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NetDebugScenario() {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const scenario     = useMemo(() => SCENARIOS.find(s => s.id === id), [id]);

    const [selectedDevice, setSelectedDevice]   = useState(null);
    const [cmdHistory,     setCmdHistory]        = useState([]);
    const [phase,          setPhase]             = useState('investigate'); // investigate | diagnose | solved | failed
    const [selectedAnswer, setSelectedAnswer]    = useState(null);
    const [hintsUsed,      setHintsUsed]         = useState(0);
    const [showHint,       setShowHint]          = useState(false);
    const [wrongAttempts,  setWrongAttempts]      = useState(0);
    const [startTime,      setStartTime]         = useState(() => Date.now());
    const [elapsed,        setElapsed]           = useState(0);
    const [finalScore,     setFinalScore]        = useState(null);
    const termRef = useRef(null);

    // Resetear todo el estado cuando cambia el escenario (navegación al siguiente)
    useEffect(() => {
        setCmdHistory([]);
        setPhase('investigate');
        setSelectedAnswer(null);
        setHintsUsed(0);
        setShowHint(false);
        setWrongAttempts(0);
        setFinalScore(null);
        setSelectedDevice(null);
        setElapsed(0);
        setStartTime(Date.now());
    }, [id]);

    // Timer
    useEffect(() => {
        if (phase === 'solved' || phase === 'failed') return;
        const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
        return () => clearInterval(t);
    }, [phase, startTime]);

    // Auto-scroll terminal
    useEffect(() => {
        if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
    }, [cmdHistory]);

    if (!scenario) {
        return (
            <div className="flex min-h-screen bg-[#050505] text-white items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-500 font-mono mb-4">Escenario no encontrado</p>
                    <button onClick={() => navigate('/netlab')} className="text-orange-400 font-mono text-sm hover:underline">
                        ← Volver al NetLab
                    </button>
                </div>
            </div>
        );
    }

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const selectedNode = scenario.topology.nodes.find(n => n.id === selectedDevice);
    const availableCommands = selectedDevice ? (scenario.commands[selectedDevice] || []) : [];

    const runCommand = (cmd) => {
        const alreadyRun = cmdHistory.some(e => e.deviceId === selectedDevice && e.cmd === cmd.cmd);
        setCmdHistory(prev => [...prev, {
            deviceId:  selectedDevice,
            deviceLabel: selectedNode?.label || selectedDevice,
            cmd:       cmd.cmd,
            output:    cmd.output,
            revealsFault: !!cmd.revealsFault,
            duplicate: alreadyRun,
        }]);
    };

    const computeScore = () => {
        const base    = scenario.points;
        const cmdPenalty  = Math.max(0, cmdHistory.length - 3) * 3;
        const hintPenalty = hintsUsed * 12;
        const wrongPenalty = wrongAttempts * 15;
        return Math.max(10, base - cmdPenalty - hintPenalty - wrongPenalty);
    };

    const handleDiagnose = () => {
        if (!selectedAnswer) return;
        const correct = scenario.diagnosisOptions.find(o => o.id === selectedAnswer)?.correct;
        if (correct) {
            const score = computeScore();
            setFinalScore(score);
            setPhase('solved');
            // Persist
            const prev = JSON.parse(localStorage.getItem('netlab_completions') || '{}');
            const existing = prev[scenario.id]?.score || 0;
            prev[scenario.id] = { score: Math.max(score, existing), ts: Date.now() };
            localStorage.setItem('netlab_completions', JSON.stringify(prev));
        } else {
            setWrongAttempts(w => w + 1);
            setSelectedAnswer(null);
            setPhase('failed-attempt');
            setTimeout(() => setPhase('diagnose'), 1200);
        }
    };

    const resetScenario = () => {
        setCmdHistory([]);
        setPhase('investigate');
        setSelectedAnswer(null);
        setHintsUsed(0);
        setShowHint(false);
        setWrongAttempts(0);
        setFinalScore(null);
        setSelectedDevice(null);
    };

    // ─── Solved screen ────────────────────────────────────────────────────────
    if (phase === 'solved') {
        return (
            <div className="flex min-h-screen bg-[#050505] text-white">
                <Sidebar />
                <main className="flex-1 ml-64 flex items-center justify-center p-8">
                    <div className="max-w-lg w-full text-center space-y-6">
                        {/* Trophy */}
                        <div className="relative mx-auto w-24 h-24">
                            <div className="absolute inset-0 bg-amber-400/15 rounded-full blur-xl animate-pulse" />
                            <div className="relative w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                <Trophy className="w-12 h-12 text-amber-400" />
                            </div>
                        </div>

                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.25em] text-amber-400/70 mb-1">
                                Diagnóstico correcto
                            </p>
                            <h1 className="font-black text-4xl text-white uppercase italic tracking-tight">
                                ¡Problema Resuelto!
                            </h1>
                        </div>

                        {/* Score */}
                        <div className="flex items-center justify-center gap-6 py-4 px-6 rounded-2xl bg-white/3 border border-white/8">
                            <div className="text-center">
                                <div className="font-black text-4xl font-mono text-amber-400">{finalScore}</div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-600">Puntos</div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <div className="font-black text-2xl font-mono text-slate-300">{cmdHistory.length}</div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-600">Comandos</div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <div className="font-black text-2xl font-mono text-slate-300">{formatTime(elapsed)}</div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-600">Tiempo</div>
                            </div>
                        </div>

                        {/* Fix command */}
                        <div className="text-left p-5 rounded-2xl bg-emerald-500/6 border border-emerald-500/20">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400/70 mb-2">
                                Comando de solución
                            </p>
                            <pre className="font-mono text-sm text-emerald-300 leading-relaxed whitespace-pre-wrap">
                                {scenario.fault.fixCommand}
                            </pre>
                        </div>

                        {/* Explanation */}
                        <div className="text-left p-5 rounded-2xl bg-white/3 border border-white/8">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">
                                Explicación
                            </p>
                            <p className="font-mono text-xs text-slate-300 leading-relaxed">
                                {scenario.solutionExplanation}
                            </p>
                        </div>

                        {/* Actions */}
                        {(() => {
                            const currentIdx = SCENARIOS.findIndex(s => s.id === id);
                            const nextScenario = SCENARIOS[currentIdx + 1] || null;
                            return (
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={resetScenario}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-slate-400 hover:text-white transition-colors"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Repetir escenario
                                    </button>
                                    {nextScenario ? (
                                        <button
                                            onClick={() => navigate(`/netlab/${nextScenario.id}`)}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 font-mono text-xs text-orange-400 hover:bg-orange-500/20 transition-colors"
                                        >
                                            Siguiente escenario
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate('/netlab')}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 font-mono text-xs text-orange-400 hover:bg-orange-500/20 transition-colors"
                                        >
                                            Ver todos los escenarios
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </main>
            </div>
        );
    }

    // ─── Main lab UI ──────────────────────────────────────────────────────────
    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">

                {/* ── Top bar ── */}
                <div className="flex-shrink-0 flex items-center gap-4 px-6 py-4 border-b border-white/6 bg-[#080808]">
                    <button
                        onClick={() => navigate('/netlab')}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-white transition-colors font-mono text-xs"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        NetLab
                    </button>

                    <div className="w-px h-5 bg-white/10" />

                    <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
                        Escenario {scenario.num}
                    </span>

                    <h1 className="font-black text-white uppercase italic tracking-tight text-lg flex-1">
                        {scenario.title}
                    </h1>

                    {/* Difficulty */}
                    <span
                        className="font-mono text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border"
                        style={{ color: scenario.difficultyColor, background: scenario.difficultyColor + '18', borderColor: scenario.difficultyColor + '40' }}
                    >
                        {scenario.difficulty}
                    </span>

                    {/* Timer */}
                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(elapsed)}
                    </div>

                    {/* Points */}
                    <div className="flex items-center gap-1.5 font-mono text-xs text-amber-500">
                        <Star className="w-3.5 h-3.5" />
                        {computeScore()} / {scenario.points}
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-hidden flex">

                    {/* ── LEFT: Topology + commands ── */}
                    <div className="w-[57%] flex flex-col border-r border-white/6 overflow-hidden">

                        {/* Symptom banner */}
                        <div className="flex-shrink-0 mx-4 mt-4 p-4 rounded-2xl bg-orange-500/6 border border-orange-500/20">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-orange-400/70 mb-1">Síntoma reportado</p>
                                    <p className="font-mono text-xs text-orange-200/80 leading-relaxed">{scenario.symptom}</p>
                                </div>
                            </div>
                        </div>

                        {/* Topology */}
                        <div className="flex-shrink-0 mx-4 mt-4 p-3 rounded-2xl bg-white/2 border border-white/6">
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-2 px-1">
                                Topología — haz clic en un dispositivo para inspeccionarlo
                            </p>
                            <Topology
                                topology={scenario.topology}
                                selectedDevice={selectedDevice}
                                onSelectDevice={setSelectedDevice}
                            />
                        </div>

                        {/* Device command panel */}
                        <div className="flex-1 overflow-y-auto mx-4 mt-3 mb-4">
                            {selectedDevice ? (
                                <div className="rounded-2xl border border-white/8 overflow-hidden">
                                    {/* Panel header */}
                                    <div
                                        className="px-4 py-3 border-b border-white/6 flex items-center gap-3"
                                        style={{ background: `${DEVICE_STYLE[selectedNode?.type]?.accent || '#60a5fa'}10` }}
                                    >
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ background: DEVICE_STYLE[selectedNode?.type]?.accent || '#60a5fa' }}
                                        />
                                        <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                                            {selectedNode?.label}
                                        </span>
                                        <span className="font-mono text-[10px] text-slate-600">{selectedNode?.sublabel}</span>
                                        <span className="ml-auto font-mono text-[10px] text-slate-600 uppercase tracking-widest">
                                            {availableCommands.length} comandos disponibles
                                        </span>
                                    </div>

                                    {/* Commands */}
                                    <div className="p-3 grid grid-cols-1 gap-1.5 bg-[#0a0a0a]">
                                        {availableCommands.map((cmd, i) => {
                                            const wasRun = cmdHistory.some(e => e.deviceId === selectedDevice && e.cmd === cmd.cmd);
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => runCommand(cmd)}
                                                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all font-mono text-xs
                                                        ${wasRun
                                                            ? 'border-white/5 bg-white/2 text-slate-600'
                                                            : 'border-white/8 bg-white/3 text-slate-300 hover:bg-white/6 hover:border-white/15 hover:text-white'
                                                        }`}
                                                >
                                                    <CornerDownRight
                                                        className={`w-3 h-3 flex-shrink-0 ${wasRun ? 'text-slate-700' : 'text-slate-500 group-hover:text-orange-400'}`}
                                                    />
                                                    <span className={wasRun ? 'line-through' : ''}>{cmd.cmd}</span>
                                                    {wasRun && <span className="ml-auto text-[9px] text-slate-700">ejecutado</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-white/8 p-8 flex flex-col items-center justify-center text-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/4 flex items-center justify-center">
                                        <Terminal className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <p className="font-mono text-xs text-slate-600">
                                        Selecciona un dispositivo en el diagrama para ver los comandos disponibles
                                    </p>
                                </div>
                            )}

                            {/* Hint + Diagnose actions */}
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => { setHintsUsed(h => Math.min(h + 1, scenario.hints.length)); setShowHint(true); }}
                                    disabled={hintsUsed >= scenario.hints.length}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-xs transition-all
                                        border-amber-500/25 bg-amber-500/6 text-amber-500 hover:bg-amber-500/12
                                        disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Lightbulb className="w-3.5 h-3.5" />
                                    Pista ({hintsUsed}/{scenario.hints.length})
                                </button>

                                <button
                                    onClick={() => setPhase('diagnose')}
                                    disabled={cmdHistory.length < 2 || phase === 'diagnose'}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border font-mono text-xs font-bold uppercase tracking-widest transition-all
                                        border-orange-500/35 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20
                                        disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Zap className="w-3.5 h-3.5" />
                                    {phase === 'diagnose' ? 'Diagnosticando…' : 'Diagnosticar'}
                                </button>
                            </div>

                            {/* Hint display */}
                            {showHint && hintsUsed > 0 && (
                                <div className="mt-3 p-4 rounded-2xl bg-amber-500/6 border border-amber-500/20">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-2">
                                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-mono text-[10px] text-amber-400/70 uppercase tracking-widest mb-1">Pista {hintsUsed}</p>
                                                <p className="font-mono text-xs text-amber-200/80 leading-relaxed">
                                                    {scenario.hints[hintsUsed - 1]}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowHint(false)} className="text-amber-700 hover:text-amber-400 text-xs flex-shrink-0">✕</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Terminal log + diagnosis ── */}
                    <div className="flex-1 flex flex-col overflow-hidden">

                        {/* Terminal header */}
                        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-[#080808]">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                            </div>
                            <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest ml-2">
                                Terminal — {cmdHistory.length} comando{cmdHistory.length !== 1 ? 's' : ''} ejecutado{cmdHistory.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Terminal log */}
                        <div
                            ref={termRef}
                            className="flex-1 overflow-y-auto p-4 bg-[#060606] space-y-4 font-mono"
                        >
                            {cmdHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 gap-3 text-center">
                                    <Terminal className="w-8 h-8 text-slate-800" />
                                    <p className="font-mono text-xs text-slate-700">
                                        Selecciona un dispositivo y ejecuta comandos para comenzar el diagnóstico
                                    </p>
                                </div>
                            ) : (
                                cmdHistory.map((entry, i) => (
                                    <div key={i} className="space-y-1.5">
                                        {/* Prompt line */}
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
                                                style={{
                                                    color: DEVICE_STYLE[scenario.topology.nodes.find(n => n.id === entry.deviceId)?.type]?.accent || '#60a5fa',
                                                    background: (DEVICE_STYLE[scenario.topology.nodes.find(n => n.id === entry.deviceId)?.type]?.accent || '#60a5fa') + '20',
                                                }}
                                            >
                                                {entry.deviceLabel}
                                            </span>
                                            <span className="text-slate-500">&gt;</span>
                                            <span className="text-white text-xs">{entry.cmd}</span>
                                            {entry.revealsFault && (
                                                <span className="ml-1 text-[9px] font-black text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                                    ⚠ relevante
                                                </span>
                                            )}
                                            {entry.duplicate && (
                                                <span className="ml-1 text-[9px] text-slate-700 border border-white/8 px-1.5 py-0.5 rounded">duplicado</span>
                                            )}
                                        </div>
                                        {/* Output */}
                                        <div className="ml-4 pl-3 border-l border-white/5">
                                            <CliOutput text={entry.output} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* ── Diagnosis panel ── */}
                        {phase === 'diagnose' || phase === 'failed-attempt' ? (
                            <div className="flex-shrink-0 border-t border-white/8 bg-[#080808] p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                                        Identifica la causa raíz
                                    </p>
                                    {phase === 'failed-attempt' && (
                                        <span className="font-mono text-xs text-red-400 flex items-center gap-1.5 animate-pulse">
                                            <XCircle className="w-3.5 h-3.5" />
                                            Incorrecto, inténtalo de nuevo
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {scenario.diagnosisOptions.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setSelectedAnswer(opt.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left font-mono text-xs transition-all
                                                ${selectedAnswer === opt.id
                                                    ? 'bg-orange-500/12 border-orange-500/40 text-white'
                                                    : 'bg-white/2 border-white/6 text-slate-400 hover:border-white/15 hover:text-slate-200'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all
                                                ${selectedAnswer === opt.id ? 'border-orange-400' : 'border-slate-700'}`}>
                                                {selectedAnswer === opt.id && (
                                                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                                                )}
                                            </div>
                                            <span className="leading-relaxed">{opt.text}</span>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleDiagnose}
                                    disabled={!selectedAnswer || phase === 'failed-attempt'}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-xs font-black uppercase tracking-widest transition-all
                                        bg-orange-500/15 border border-orange-500/40 text-orange-400 hover:bg-orange-500/25
                                        disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Confirmar diagnóstico
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </main>
        </div>
    );
}
