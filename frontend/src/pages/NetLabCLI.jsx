import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SCENARIOS } from '../data/netDebugScenarios';
import {
    Terminal, Network, ChevronLeft, Lightbulb, CheckCircle2,
    XCircle, AlertTriangle, Monitor, Cpu, Server, Router,
    RotateCcw, Trophy, Clock, Eye, EyeOff, Info, Zap, Lock
} from 'lucide-react';

// ── Constantes de seguridad ──────────────────────────────────────────────────
const MAX_CMD_LENGTH = 120;
const MAX_HISTORY_LINES = 300;
const CMD_RATE_LIMIT_MS = 400; // mínimo entre comandos (ms)
const BLOCKED_PATTERNS = [/[;&|`$<>{}()\[\]\\]/]; // caracteres no permitidos en CLI simulado

// ── Utilidades ───────────────────────────────────────────────────────────────
function sanitizeInput(raw) {
    return raw
        .slice(0, MAX_CMD_LENGTH)
        .replace(/[^\w\s./\-:?,!@#%^*+='"~]/g, ''); // solo chars CLI legítimos
}

function deviceIcon(type) {
    const map = { router: Router, switch: Server, pc: Monitor, server: Server, firewall: Lock };
    return map[type] || Cpu;
}

function deviceColor(type) {
    const map = {
        router: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
        switch: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
        pc: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
        server: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
        firewall: 'text-red-400 border-red-500/40 bg-red-500/10',
    };
    return map[type] || 'text-slate-400 border-slate-500/40 bg-slate-500/10';
}

// ── Respuestas genéricas por tipo de error ────────────────────────────────────
const GENERIC_ERRORS = [
    "% Invalid input detected at '^' marker.",
    "% Incomplete command.",
    "% Ambiguous command: \"{cmd}\"",
];

function getNotFoundResponse(cmd) {
    if (cmd.length === 0) return '';
    const clean = cmd.trim().toLowerCase();
    if (clean.startsWith('ping')) return "Sending 5, 100-byte ICMP Echos\n...\nSuccess rate is 0 percent (0/5)";
    if (clean.startsWith('traceroute') || clean.startsWith('tracert'))
        return "Tracing the route...\n1  * * *\n2  * * *\n3  * * *\nTimeout.";
    if (clean === 'help' || clean === '?')
        return "Exec commands:\n  enable       Turn on privileged commands\n  ping         Send echo messages\n  show         Show running system information\n  traceroute   Trace route to destination\n  exit         Exit from the EXEC";
    if (clean === 'exit') return null; // señal especial
    return GENERIC_ERRORS[Math.floor(Math.random() * 2)].replace('{cmd}', cmd);
}

// ── Componente TopologyCanvas ─────────────────────────────────────────────────
function TopologyCanvas({ scenario, selectedDevice, onSelectDevice, faultFixed }) {
    if (!scenario?.topology) return null;
    const { viewBox, nodes, links } = scenario.topology;

    return (
        <div className="relative w-full bg-[#0A0F1A] border border-white/8 rounded-xl overflow-hidden">
            <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-mono text-slate-500 z-10">
                <Network className="w-3 h-3" />
                <span>TOPOLOGÍA DE RED — haz clic en un dispositivo para seleccionarlo</span>
            </div>
            <svg
                viewBox={viewBox || "0 0 800 400"}
                className="w-full"
                style={{ minHeight: 200, maxHeight: 320 }}
            >
                {/* Links */}
                {links?.map((link, i) => {
                    const from = nodes?.find(n => n.id === link.from);
                    const to = nodes?.find(n => n.id === link.to);
                    if (!from || !to) return null;
                    const isFaulty = link.faulty && !faultFixed;
                    return (
                        <g key={i}>
                            <line
                                x1={from.x} y1={from.y}
                                x2={to.x} y2={to.y}
                                stroke={isFaulty ? '#ef4444' : '#334155'}
                                strokeWidth={isFaulty ? 2.5 : 1.5}
                                strokeDasharray={isFaulty ? '6 3' : 'none'}
                                opacity={isFaulty ? 1 : 0.6}
                            />
                            {isFaulty && (
                                <text
                                    x={(from.x + to.x) / 2}
                                    y={(from.y + to.y) / 2 - 8}
                                    fill="#ef4444"
                                    fontSize="10"
                                    textAnchor="middle"
                                    fontFamily="monospace"
                                >⚠ FAULT</text>
                            )}
                            {link.fromLabel && (
                                <text x={from.x + (to.x - from.x) * 0.18} y={from.y + (to.y - from.y) * 0.18 - 6}
                                    fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">{link.fromLabel}</text>
                            )}
                            {link.toLabel && (
                                <text x={from.x + (to.x - from.x) * 0.82} y={from.y + (to.y - from.y) * 0.82 - 6}
                                    fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">{link.toLabel}</text>
                            )}
                        </g>
                    );
                })}

                {/* Nodes */}
                {nodes?.map(node => {
                    const isSelected = selectedDevice === node.id;
                    const colors = {
                        router: { fill: '#7c3aed', stroke: '#a78bfa' },
                        switch: { fill: '#1d4ed8', stroke: '#60a5fa' },
                        pc: { fill: '#065f46', stroke: '#34d399' },
                        server: { fill: '#4c1d95', stroke: '#a78bfa' },
                        firewall: { fill: '#7f1d1d', stroke: '#f87171' },
                    };
                    const c = colors[node.type] || { fill: '#1e293b', stroke: '#475569' };
                    return (
                        <g
                            key={node.id}
                            onClick={() => onSelectDevice(node.id)}
                            className="cursor-pointer"
                            style={{ transition: 'all 0.2s' }}
                        >
                            {isSelected && (
                                <circle cx={node.x} cy={node.y} r={28}
                                    fill="none" stroke="#22d3ee" strokeWidth={2}
                                    opacity={0.6} strokeDasharray="4 2">
                                    <animate attributeName="stroke-dashoffset" from="0" to="-12"
                                        dur="1s" repeatCount="indefinite" />
                                </circle>
                            )}
                            <rect
                                x={node.x - 22} y={node.y - 22}
                                width={44} height={44} rx={8}
                                fill={c.fill}
                                stroke={isSelected ? '#22d3ee' : c.stroke}
                                strokeWidth={isSelected ? 2 : 1}
                                opacity={isSelected ? 1 : 0.85}
                            />
                            <text x={node.x} y={node.y + 5} textAnchor="middle"
                                fill={isSelected ? '#22d3ee' : 'white'}
                                fontSize={node.type === 'router' ? "18" : "16"}
                                fontFamily="monospace">
                                {node.type === 'router' ? '⬡' : node.type === 'switch' ? '⬡' : node.type === 'pc' ? '▨' : '▣'}
                            </text>
                            <text x={node.x} y={node.y + 38} textAnchor="middle"
                                fill={isSelected ? '#22d3ee' : '#94a3b8'}
                                fontSize="10" fontFamily="monospace" fontWeight={isSelected ? 'bold' : 'normal'}>
                                {node.label}
                            </text>
                            {node.sublabel && (
                                <text x={node.x} y={node.y + 50} textAnchor="middle"
                                    fill="#475569" fontSize="8" fontFamily="monospace">
                                    {node.sublabel}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// ── Componente TerminalPane ───────────────────────────────────────────────────
function TerminalPane({ lines, input, onInput, onSubmit, selectedDevice, devices, disabled }) {
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    useEffect(() => {
        if (!disabled) inputRef.current?.focus();
    }, [selectedDevice, disabled]);

    const prompt = selectedDevice
        ? `${selectedDevice.toUpperCase()}#`
        : 'SELECCIONA UN DISPOSITIVO>';

    return (
        <div
            className="flex flex-col bg-[#060B12] border border-white/8 rounded-xl overflow-hidden font-mono"
            onClick={() => !disabled && inputRef.current?.focus()}
        >
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A1020] border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest">CLI Simulado</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded">SIMULACIÓN SEGURA</span>
                </div>
                {selectedDevice && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[11px] text-emerald-400">{selectedDevice.toUpperCase()}</span>
                    </div>
                )}
            </div>

            {/* Output */}
            <div className="flex-1 overflow-y-auto p-4 space-y-0.5 min-h-[240px] max-h-[340px] custom-scrollbar">
                {lines.map((line, i) => (
                    <div key={i} className={`text-[12px] leading-relaxed whitespace-pre-wrap break-all
                        ${line.type === 'prompt' ? 'text-cyan-400' :
                            line.type === 'output' ? 'text-slate-300' :
                            line.type === 'error' ? 'text-red-400' :
                            line.type === 'success' ? 'text-emerald-400' :
                            line.type === 'info' ? 'text-amber-400' :
                            line.type === 'hint' ? 'text-yellow-300' :
                            'text-slate-500'}`}>
                        {line.text}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/5 bg-[#080E1A]">
                {disabled ? (
                    <p className="text-xs text-slate-600 font-mono">Terminal bloqueado.</p>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-cyan-400 text-[12px] flex-shrink-0">{prompt}</span>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => onInput(sanitizeInput(e.target.value))}
                            onKeyDown={e => {
                                if (e.key === 'Enter') onSubmit();
                                if (e.key === 'Tab') { e.preventDefault(); }
                            }}
                            className="flex-1 bg-transparent text-emerald-300 text-[12px] outline-none caret-emerald-400 placeholder-slate-700"
                            placeholder={selectedDevice ? "Escribe un comando..." : "Selecciona un dispositivo en el diagrama"}
                            disabled={!selectedDevice}
                            maxLength={MAX_CMD_LENGTH}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        <span className="text-[10px] text-slate-700">{input.length}/{MAX_CMD_LENGTH}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Componente DiagnosisPanel ─────────────────────────────────────────────────
function DiagnosisPanel({ options, onSelect, selected, submitted, onSubmit }) {
    return (
        <div className="bg-[#0A0F1A] border border-amber-500/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-amber-300 font-mono">DIAGNÓSTICO: ¿Cuál es la causa del problema?</h3>
            </div>
            <div className="space-y-2">
                {options.map(opt => {
                    const isSelected = selected === opt.id;
                    const showResult = submitted;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => !submitted && onSelect(opt.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg border text-[13px] font-mono transition-all
                                ${showResult && opt.correct ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300' :
                                    showResult && isSelected && !opt.correct ? 'border-red-500/60 bg-red-500/10 text-red-300' :
                                    isSelected && !submitted ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300' :
                                    'border-white/8 bg-white/3 text-slate-400 hover:border-white/20 hover:text-white'}`}
                        >
                            <span className="mr-3 opacity-60">{opt.id.toUpperCase()})</span>
                            {opt.text}
                        </button>
                    );
                })}
            </div>
            {!submitted && selected && (
                <button
                    onClick={onSubmit}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-lg font-mono transition-all"
                >
                    Confirmar diagnóstico
                </button>
            )}
        </div>
    );
}

// ── Página Principal: NetLabCLI ───────────────────────────────────────────────
export default function NetLabCLI() {
    const { id } = useParams();
    const navigate = useNavigate();
    const scenario = SCENARIOS.find(s => s.id === id);

    // Estado del terminal
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [termLines, setTermLines] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [cmdHistory, setCmdHistory] = useState([]);
    const [historyIdx, setHistoryIdx] = useState(-1);
    const lastCmdTime = useRef(0);

    // Estado del escenario
    const [faultFound, setFaultFound] = useState(false);
    const [faultFixed, setFaultFixed] = useState(false);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHints, setShowHints] = useState(false);
    const [commandsTyped, setCommandsTyped] = useState(0);

    // Diagnóstico
    const [showDiagnosis, setShowDiagnosis] = useState(false);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
    const [diagnosisSubmitted, setDiagnosisSubmitted] = useState(false);
    const [diagnosisCorrect, setDiagnosisCorrect] = useState(false);

    // Timer
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef(null);
    const startedRef = useRef(false);

    // Completado
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (!scenario) return;
        // Bienvenida
        setTermLines([
            { type: 'info', text: `╔══════════════════════════════════════════════════════════╗` },
            { type: 'info', text: `║  🖥  NetLab CLI — Modo Interactivo Simulado              ║` },
            { type: 'info', text: `║  Escenario: ${scenario.title.slice(0, 44).padEnd(44)}║` },
            { type: 'info', text: `╚══════════════════════════════════════════════════════════╝` },
            { type: 'hint', text: `\n⚠  SIMULACIÓN: Todos los comandos y respuestas son ficticios.` },
            { type: 'hint', text: `   No se ejecuta nada real en ningún servidor.` },
            { type: '', text: `\n📋 SÍNTOMA: ${scenario.symptom}` },
            { type: '', text: `\n👆 Haz clic en un dispositivo del diagrama para seleccionarlo,` },
            { type: '', text: `   luego escribe comandos como en un terminal Cisco real.` },
            { type: '', text: `   Usa "?" o "help" para ver comandos disponibles.\n` },
        ]);
    }, [scenario]);

    // Timer — arranca al primer comando
    const startTimer = useCallback(() => {
        if (startedRef.current) return;
        startedRef.current = true;
        timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    }, []);

    useEffect(() => () => clearInterval(timerRef.current), []);

    const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const addLines = useCallback((newLines) => {
        setTermLines(prev => {
            const combined = [...prev, ...newLines];
            return combined.length > MAX_HISTORY_LINES
                ? combined.slice(combined.length - MAX_HISTORY_LINES)
                : combined;
        });
    }, []);

    const handleSelectDevice = useCallback((deviceId) => {
        setSelectedDevice(deviceId);
        const node = scenario?.topology?.nodes?.find(n => n.id === deviceId);
        addLines([
            { type: '', text: '' },
            { type: 'info', text: `[Conectando a ${node?.label || deviceId}...]` },
            { type: 'prompt', text: `${deviceId.toUpperCase()}#` },
        ]);
    }, [scenario, addLines]);

    const handleSubmitCommand = useCallback(() => {
        const raw = currentInput.trim();
        setCurrentInput('');
        if (!selectedDevice || !raw) return;

        // Rate limiting
        const now = Date.now();
        if (now - lastCmdTime.current < CMD_RATE_LIMIT_MS) return;
        lastCmdTime.current = now;

        // Comprobar caracteres bloqueados
        for (const pattern of BLOCKED_PATTERNS) {
            if (pattern.test(raw)) {
                addLines([
                    { type: 'prompt', text: `${selectedDevice.toUpperCase()}# ${raw}` },
                    { type: 'error', text: `% Invalid character in command.` },
                ]);
                return;
            }
        }

        startTimer();
        setCommandsTyped(c => c + 1);
        setCmdHistory(h => [raw, ...h.slice(0, 49)]);
        setHistoryIdx(-1);

        const deviceCmds = scenario?.commands?.[selectedDevice] || [];
        const cleanRaw = raw.toLowerCase().trim();

        // Buscar comando en el mapa del escenario
        const match = deviceCmds.find(c =>
            c.cmd.toLowerCase() === cleanRaw ||
            cleanRaw.startsWith(c.cmd.toLowerCase().split(' ')[0]) && c.cmd.toLowerCase().startsWith(cleanRaw)
        );

        if (match) {
            addLines([
                { type: 'prompt', text: `${selectedDevice.toUpperCase()}# ${raw}` },
                { type: 'output', text: match.output },
            ]);
            // ¿Revela el fallo?
            if (match.revealsFault && !faultFound) {
                setFaultFound(true);
                setTimeout(() => {
                    addLines([
                        { type: 'success', text: `\n✅ Has identificado indicios del problema. ¡Ahora diagnostica la causa y aplica la solución!` },
                    ]);
                    setShowDiagnosis(true);
                }, 600);
            }
            // ¿Es el comando correcto de solución?
            const fault = scenario?.fault;
            if (
                fault &&
                selectedDevice === fault.deviceId &&
                cleanRaw.includes(fault.fixCommand.toLowerCase())
            ) {
                setFaultFixed(true);
                setTimeout(() => {
                    addLines([
                        { type: 'success', text: `\n🔧 Configuración aplicada.` },
                        { type: 'success', text: `✅ ¡El fallo ha sido corregido! La red debería recuperarse.` },
                    ]);
                    if (!diagnosisSubmitted) setShowDiagnosis(true);
                }, 400);
            }
        } else {
            const notFound = getNotFoundResponse(raw);
            if (notFound === null) {
                // exit
                addLines([{ type: 'info', text: `${selectedDevice.toUpperCase()}# exit\n[Desconectado de ${selectedDevice.toUpperCase()}]` }]);
                setSelectedDevice(null);
            } else {
                addLines([
                    { type: 'prompt', text: `${selectedDevice.toUpperCase()}# ${raw}` },
                    { type: 'error', text: notFound },
                ]);
            }
        }
    }, [currentInput, selectedDevice, scenario, faultFound, diagnosisSubmitted, startTimer, addLines]);

    const handleDiagnosisSubmit = useCallback(() => {
        if (!selectedDiagnosis) return;
        const correct = scenario.diagnosisOptions?.find(o => o.id === selectedDiagnosis)?.correct;
        setDiagnosisSubmitted(true);
        setDiagnosisCorrect(!!correct);
        if (correct && faultFixed) {
            handleComplete(true);
        } else if (correct && !faultFixed) {
            addLines([{ type: 'success', text: `\n✅ Diagnóstico correcto. ¡Ahora aplica el fix en el dispositivo correcto!` }]);
        } else {
            addLines([{ type: 'error', text: `\n❌ Diagnóstico incorrecto. Sigue investigando con los comandos.` }]);
        }
    }, [selectedDiagnosis, scenario, faultFixed]);

    const handleComplete = useCallback((diagOk) => {
        clearInterval(timerRef.current);
        setCompleted(true);
        const score = Math.max(20, scenario.points - (hintsUsed * 15) - (commandsTyped > 20 ? 10 : 0));
        const prev = JSON.parse(localStorage.getItem('netlab_completions') || '{}');
        if (!prev[scenario.id] || prev[scenario.id].score < score) {
            prev[scenario.id] = { score, time: elapsed, completed_at: Date.now() };
            localStorage.setItem('netlab_completions', JSON.stringify(prev));
        }
    }, [scenario, hintsUsed, commandsTyped, elapsed]);

    const handleHint = useCallback(() => {
        const hints = scenario?.hints || [];
        if (hintsUsed < hints.length) {
            addLines([
                { type: 'hint', text: `\n💡 Pista ${hintsUsed + 1}: ${hints[hintsUsed]}` },
            ]);
            setHintsUsed(h => h + 1);
        }
    }, [scenario, hintsUsed, addLines]);

    const handleReset = useCallback(() => {
        setSelectedDevice(null);
        setFaultFound(false);
        setFaultFixed(false);
        setHintsUsed(0);
        setCommandsTyped(0);
        setShowDiagnosis(false);
        setSelectedDiagnosis(null);
        setDiagnosisSubmitted(false);
        setDiagnosisCorrect(false);
        setCompleted(false);
        setElapsed(0);
        startedRef.current = false;
        clearInterval(timerRef.current);
        setTermLines([
            { type: 'info', text: `[Escenario reiniciado — ${scenario?.title}]` },
            { type: '', text: `📋 SÍNTOMA: ${scenario?.symptom}` },
            { type: '', text: `Selecciona un dispositivo para comenzar.\n` },
        ]);
    }, [scenario]);

    if (!scenario) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#0D0D0D] text-white">
                <XCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold font-mono mb-2">Escenario no encontrado</h2>
                <button onClick={() => navigate('/netlab')}
                    className="mt-4 px-6 py-2 bg-orange-600 rounded-lg text-sm font-mono hover:bg-orange-500">
                    ← Volver al NetLab
                </button>
            </div>
        );
    }

    const diffColors = { facil: 'text-emerald-400', medio: 'text-amber-400', dificil: 'text-red-400' };
    const score = completed
        ? Math.max(20, scenario.points - (hintsUsed * 15) - (commandsTyped > 20 ? 10 : 0))
        : null;

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#0D0D0D] text-white pb-10">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/5 px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/netlab')}
                            className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm font-mono transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            NetLab
                        </button>
                        <span className="text-slate-700">/</span>
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-cyan-400" />
                            <span className="text-white font-mono text-sm font-bold">{scenario.title}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                scenario.difficulty === 'facil' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' :
                                scenario.difficulty === 'medio' ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' :
                                'border-red-500/40 bg-red-500/10 text-red-400'
                            }`}>{scenario.difficulty}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Timer */}
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            <span className={elapsed > (scenario.estimatedTime?.split('–')[1]?.replace(/\D/g, '') || 20) * 60
                                ? 'text-red-400' : 'text-slate-400'}>
                                {formatTime(elapsed)}
                            </span>
                        </div>
                        {/* Cmds */}
                        <div className="text-[11px] font-mono text-slate-600">
                            <span className="text-slate-400">{commandsTyped}</span> cmds
                        </div>
                        {/* Hints */}
                        <button
                            onClick={handleHint}
                            disabled={hintsUsed >= (scenario.hints?.length || 0)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg hover:bg-yellow-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <Lightbulb className="w-3.5 h-3.5" />
                            Pista ({hintsUsed}/{scenario.hints?.length || 0})
                        </button>
                        {/* Reset */}
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono text-slate-500 border border-white/8 rounded-lg hover:text-white hover:bg-white/5 transition-all"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reiniciar
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-6 pt-6 space-y-6">

                {/* Info banner */}
                <div className="flex items-center gap-3 px-4 py-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-sm">
                    <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <p className="text-slate-400 font-mono text-xs">
                        <span className="text-cyan-400 font-bold">Modo CLI Interactivo</span> — Simula una sesión de terminal Cisco.
                        Selecciona un dispositivo en el diagrama y escribe comandos reales.
                        <span className="text-amber-400 ml-2">⚠ Todo es simulado: ningún comando se ejecuta en un servidor real.</span>
                    </p>
                </div>

                {/* Symptom */}
                <div className="px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">🚨 Síntoma reportado</p>
                    <p className="text-sm text-red-300 font-mono">{scenario.symptom}</p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-6">
                    {/* Left: Topology + Devices */}
                    <div className="space-y-4">
                        {/* Topology */}
                        <TopologyCanvas
                            scenario={scenario}
                            selectedDevice={selectedDevice}
                            onSelectDevice={handleSelectDevice}
                            faultFixed={faultFixed}
                        />

                        {/* Device list */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {scenario.topology?.nodes?.map(node => {
                                const Icon = deviceIcon(node.type);
                                const isSelected = selectedDevice === node.id;
                                const hasCmds = !!(scenario.commands?.[node.id]?.length);
                                return (
                                    <button
                                        key={node.id}
                                        onClick={() => handleSelectDevice(node.id)}
                                        disabled={!hasCmds}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all text-xs font-mono
                                            ${isSelected
                                                ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
                                                : hasCmds
                                                    ? `border-white/10 bg-white/3 text-slate-400 hover:border-white/25 hover:text-white`
                                                    : 'border-white/5 bg-white/2 text-slate-700 cursor-not-allowed'
                                            }`}
                                    >
                                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-bold">{node.label}</div>
                                            <div className="text-[9px] opacity-60">{hasCmds ? `${scenario.commands[node.id].length} cmds` : 'sin acceso'}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Diagnosis */}
                        {showDiagnosis && (
                            <DiagnosisPanel
                                options={scenario.diagnosisOptions || []}
                                selected={selectedDiagnosis}
                                submitted={diagnosisSubmitted}
                                onSelect={setSelectedDiagnosis}
                                onSubmit={handleDiagnosisSubmit}
                            />
                        )}

                        {/* Solution explanation */}
                        {diagnosisSubmitted && (
                            <div className={`px-4 py-4 rounded-xl border text-sm font-mono
                                ${diagnosisCorrect && faultFixed
                                    ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                                    : 'border-slate-700 bg-white/3 text-slate-300'}`}>
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">📖 Explicación</p>
                                <p>{scenario.solutionExplanation}</p>
                                {faultFixed && diagnosisCorrect && (
                                    <div className="mt-3 flex items-center gap-2 text-emerald-400 font-bold">
                                        <CheckCircle2 className="w-4 h-4" />
                                        ¡Escenario completado con éxito!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Terminal */}
                    <div className="space-y-4">
                        <TerminalPane
                            lines={termLines}
                            input={currentInput}
                            onInput={setCurrentInput}
                            onSubmit={handleSubmitCommand}
                            selectedDevice={selectedDevice}
                            devices={scenario.topology?.nodes || []}
                            disabled={completed && !faultFixed}
                        />

                        {/* Available commands cheat sheet */}
                        {selectedDevice && scenario.commands?.[selectedDevice]?.length > 0 && (
                            <details className="bg-[#0A0F1A] border border-white/8 rounded-xl overflow-hidden">
                                <summary className="px-4 py-3 text-xs font-mono text-slate-500 cursor-pointer hover:text-slate-300 transition-all flex items-center gap-2">
                                    <Eye className="w-3.5 h-3.5" />
                                    Ver comandos disponibles en {selectedDevice.toUpperCase()} ({scenario.commands[selectedDevice].length})
                                </summary>
                                <div className="px-4 pb-4 space-y-1">
                                    {scenario.commands[selectedDevice].map((c, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setCurrentInput(c.cmd);
                                                document.querySelector('input[type=text]')?.focus();
                                            }}
                                            className="block w-full text-left px-3 py-1.5 text-[11px] font-mono text-cyan-400 hover:bg-cyan-500/10 rounded transition-all"
                                        >
                                            <span className="text-slate-600 mr-2">&gt;</span>{c.cmd}
                                        </button>
                                    ))}
                                </div>
                            </details>
                        )}

                        {/* Progress / Status */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'Dispositivo', value: selectedDevice?.toUpperCase() || '—', color: selectedDevice ? 'text-cyan-400' : 'text-slate-600' },
                                { label: 'Fallo detectado', value: faultFound ? '✅' : '🔍', color: faultFound ? 'text-emerald-400' : 'text-slate-600' },
                                { label: 'Fix aplicado', value: faultFixed ? '✅' : '⏳', color: faultFixed ? 'text-emerald-400' : 'text-slate-600' },
                            ].map(s => (
                                <div key={s.label} className="bg-white/3 border border-white/5 rounded-lg px-3 py-2.5 text-center">
                                    <div className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</div>
                                    <div className="text-[9px] text-slate-600 mt-0.5 font-mono">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Completion Card */}
                {completed && (
                    <div className="bg-gradient-to-br from-emerald-900/30 to-cyan-900/20 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4">
                        <Trophy className="w-12 h-12 text-yellow-400 mx-auto" />
                        <h2 className="text-2xl font-black font-mono text-white">
                            {diagnosisCorrect ? '¡Escenario resuelto!' : 'Fallo corregido'}
                        </h2>
                        <div className="flex items-center justify-center gap-8">
                            <div>
                                <div className="text-3xl font-black text-emerald-400">{score}</div>
                                <div className="text-xs text-slate-500 font-mono">puntos</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-cyan-400">{formatTime(elapsed)}</div>
                                <div className="text-xs text-slate-500 font-mono">tiempo</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-amber-400">{hintsUsed}</div>
                                <div className="text-xs text-slate-500 font-mono">pistas</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={handleReset}
                                className="px-6 py-2.5 bg-white/8 border border-white/15 text-white rounded-xl font-mono text-sm hover:bg-white/15 transition-all"
                            >
                                Repetir
                            </button>
                            <button
                                onClick={() => navigate('/netlab')}
                                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-mono text-sm font-bold transition-all"
                            >
                                Volver al NetLab →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
