/**
 * PSTerminal.jsx — Client-side PowerShell emulator for WinLabs
 *
 * Architecture:
 *  • Zero server execution — 100% safe, no code runs anywhere
 *  • Validates typed commands against expected patterns (fuzzy, case-insensitive)
 *  • Returns scripted output from scenario data
 *  • Subscription-gated: quarterly / annual / admin / developer only
 *  • Zero extra dependencies — pure React + vanilla JS
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Terminal, CheckCircle, ChevronRight, RotateCcw, Lightbulb, Info, KeyRound, ChevronDown } from 'lucide-react';

// ── Command normalisation ──────────────────────────────────────────────────────
// Makes comparison case-insensitive, collapses spaces, strips redundant quotes
function normalise(cmd) {
    return cmd
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/["']/g, '')          // strip quotes
        .replace(/\s*-(\w)/g, ' -$1'); // normalise param spacing
}

// Extract the root cmdlet name from a PS command
function extractCmdlet(cmd) {
    return normalise(cmd).split(' ')[0];
}

// Returns true for lines that should NOT be used as validation targets:
// variable-only assignments, flow-control openers, bare braces, Write-Host, etc.
function isSkippableLine(line) {
    const l = line.trim();
    if (!l || l.startsWith('#')) return true;
    if (l === '{' || l === '}' || l === '};') return true;
    // Simple variable assignment with no Verb-Noun cmdlet on the same line
    if (/^\$[\w:]+\s*=/.test(l) && !/[A-Z][a-z]+-[A-Z][a-z]+/.test(l)) return true;
    // Array/hash literal variable
    if (/^\$[\w:]+\s*=\s*@[\(\{]/.test(l)) return true;
    // Flow-control keywords
    if (/^(foreach|for|if|else(?:if)?|while|do|switch|try|catch|finally)\b/i.test(l)) return true;
    // Pure output helpers (not the actual action)
    if (/^Write-(Host|Output|Verbose|Warning|Error)\b/i.test(l)) return true;
    return false;
}

// Join backtick-continuation lines so multi-line PS commands become one string
function joinContinuations(commandStr) {
    if (!commandStr?.trim()) return [];
    const result = [];
    let current = '';
    for (const raw of commandStr.split('\n')) {
        const trimmed = raw.trim();
        if (trimmed.endsWith('`')) {
            current += (current ? ' ' : '') + trimmed.slice(0, -1).trim();
        } else if (current) {
            current += ' ' + trimmed;
            result.push(current.trim());
            current = '';
        } else {
            result.push(trimmed);
        }
    }
    if (current) result.push(current.trim());
    return result;
}

// Get the ONE command the terminal should validate for a step.
// Priority: step.keyCommand → first meaningful Verb-Noun cmdlet (skipping trivials)
function getValidationCommand(step) {
    if (step?.keyCommand?.trim()) return step.keyCommand.trim();
    const commandStr = step?.command || '';
    const lines = joinContinuations(commandStr);
    for (const line of lines) {
        if (!isSkippableLine(line)) return line;
    }
    return lines.find(l => l && !l.startsWith('#')) || commandStr.trim();
}

// Score how well typed matches a SINGLE expected command line (0–1)
function matchScore(typed, expected) {
    const t = normalise(typed);
    const e = normalise(expected);
    if (t === e) return 1;

    // Same cmdlet + contains all key tokens from expected
    const tCmdlet = extractCmdlet(t);
    const eCmdlet = extractCmdlet(e);
    if (tCmdlet !== eCmdlet) return 0;

    // Split expected into tokens, check how many are present in typed
    const eTokens = e.split(' ').filter(tok => tok.startsWith('-') || tok.length > 3);
    if (eTokens.length === 0) return tCmdlet === eCmdlet ? 0.9 : 0;
    const matched = eTokens.filter(tok => t.includes(tok)).length;
    return matched / eTokens.length;
}

// Validate typed command against the step's primary validation command
function bestMatchScore(typed, step) {
    const primaryCmd = getValidationCommand(step);
    return matchScore(typed, primaryCmd);
}

// ── ANSI-like colour helpers (rendered as styled spans) ──────────────────────
const C = {
    green:   text => ({ text, color: '#4ade80' }),
    red:     text => ({ text, color: '#f87171' }),
    yellow:  text => ({ text, color: '#fbbf24' }),
    blue:    text => ({ text, color: '#60a5fa' }),
    cyan:    text => ({ text, color: '#22d3ee' }),
    violet:  text => ({ text, color: '#c084fc' }),
    white:   text => ({ text, color: '#f1f5f9' }),
    gray:    text => ({ text, color: '#64748b' }),
    neon:    text => ({ text, color: '#c6ff33' }),
};

// ── Well-known generic commands with canned responses ─────────────────────────
const GENERIC = {
    'cls':           () => null, // clears screen
    'clear':         () => null,
    'exit':          () => [C.yellow('La sesión de PS está activa. Usa los controles del lab para salir.')],
    'pwd':           () => [C.blue('Path\n----\nC:\\Windows\\System32')],
    'whoami':        () => [C.white('WINSERVER\\Administrator')],
    'hostname':      () => [C.white('WINSERVER2022')],
    'get-date':      () => [C.white(new Date().toString())],
    'get-host':      () => [C.cyan('Name             : ConsoleHost\nVersion          : 5.1.19041.3570\nInstanceId       : ps-sim-winlab')],
    'get-help':      () => [C.yellow('Tip: Escribe un cmdlet concreto. Ej: Get-Help Get-WindowsFeature -Full')],
    '$psversiontable': () => [C.cyan('PSVersion      : 5.1.19041.3570\nPSEdition      : Desktop\nPSCompatibleVersions: {1.0, 2.0, 3.0, 4.0, 5.0, 5.1}')],
};

// ── Line renderer ─────────────────────────────────────────────────────────────
function OutputLine({ line }) {
    if (line.type === 'prompt') {
        return (
            <div className="flex items-start gap-0 font-mono text-sm leading-relaxed">
                <span style={{ color: '#c084fc' }}>PS </span>
                <span style={{ color: '#60a5fa' }}>C:\Windows\System32</span>
                <span style={{ color: '#f1f5f9' }}>&gt; </span>
                <span style={{ color: '#f1f5f9' }}>{line.text}</span>
            </div>
        );
    }
    if (line.type === 'success') {
        return (
            <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#4ade80' }}>
                {line.text}
            </div>
        );
    }
    if (line.type === 'error') {
        return (
            <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#f87171' }}>
                {line.text}
            </div>
        );
    }
    if (line.type === 'warning') {
        return (
            <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#fbbf24' }}>
                {line.text}
            </div>
        );
    }
    if (line.type === 'info') {
        return (
            <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#22d3ee' }}>
                {line.text}
            </div>
        );
    }
    // default: output
    return (
        <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#cbd5e1' }}>
            {line.text}
        </div>
    );
}

// ── Subscription gate ──────────────────────────────────────────────────────────
function SubscriptionGate() {
    return (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-base font-black text-white font-mono mb-2">Terminal PowerShell</h3>
            <p className="text-sm text-slate-400 font-mono mb-1">Disponible en planes <span className="text-amber-400 font-bold">Mensual</span>, <span className="text-amber-400 font-bold">Trimestral</span> y <span className="text-amber-400 font-bold">Anual</span></p>
            <p className="text-xs text-slate-600 font-mono mb-5">Practica comandos reales de PowerShell en un entorno 100% seguro</p>
            <a href="/suscripcion" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-wide transition-all">
                <ChevronRight className="w-4 h-4" />
                Ver planes
            </a>
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PSTerminal({ step, onStepComplete, stepIndex = 0 }) {
    const { user } = useAuth();

    // ── Subscription check ─────────────────────────────────────────────────────
    const allowed = ['monthly', 'quarterly', 'annual'].includes(user?.subscription_type)
        || user?.role === 'admin'
        || user?.role === 'developer'
        || user?.role === 'docente';

    // ── State ──────────────────────────────────────────────────────────────────
    const [lines, setLines]           = useState([]);
    const [inputVal, setInputVal]     = useState('');
    const [history, setHistory]       = useState([]);
    const [histIdx, setHistIdx]       = useState(-1);
    const [processing, setProcessing] = useState(false);
    const [stepDone, setStepDone]     = useState(false);
    const [attempts, setAttempts]     = useState(0);
    const [showHint, setShowHint]     = useState(false);
    const [showGuide, setShowGuide]   = useState(() => {
        // Show guide only on first ever visit
        try { return !localStorage.getItem('t4u_psterminal_seen'); } catch { return true; }
    });

    const inputRef   = useRef(null);
    const bottomRef  = useRef(null);
    const prevStep   = useRef(null);

    // ── Init / reset on step change ────────────────────────────────────────────
    useEffect(() => {
        if (prevStep.current === stepIndex) return;
        prevStep.current = stepIndex;
        setLines([
            { type: 'info', text: `\n═══ Paso ${stepIndex + 1}: ${step?.title || ''} ═══` },
            { type: 'info', text: `Escribe el comando PowerShell para completar este paso.\n` },
        ]);
        setInputVal('');
        setStepDone(false);
        setAttempts(0);
        setShowHint(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [stepIndex, step]);

    // ── Auto-scroll to bottom ──────────────────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    // ── Command handler ────────────────────────────────────────────────────────
    const handleCommand = useCallback((raw) => {
        const cmd = raw.trim();
        if (!cmd) return;

        // Append to history
        setHistory(prev => [cmd, ...prev.slice(0, 49)]);
        setHistIdx(-1);

        // Show prompt line
        const newLines = [{ type: 'prompt', text: cmd }];

        // Check for CLS / clear
        if (['cls', 'clear'].includes(cmd.toLowerCase())) {
            setLines([{ type: 'info', text: '' }]);
            setInputVal('');
            return;
        }

        // Check generic commands
        const normCmd = normalise(cmd);
        const genericKey = Object.keys(GENERIC).find(k => normCmd === k || normCmd.startsWith(k + ' '));
        if (genericKey) {
            const result = GENERIC[genericKey]();
            if (result) {
                result.forEach(r => newLines.push({ type: 'output', text: r.text }));
            }
            setLines(prev => [...prev, ...newLines, { type: 'output', text: '' }]);
            setInputVal('');
            return;
        }

        setProcessing(true);
        setAttempts(prev => prev + 1);

        // Simulate a brief processing delay for realism
        setTimeout(() => {
            // The ONE command this step validates against
            const expected = getValidationCommand(step);
            const score = bestMatchScore(cmd, step);

            if (score >= 0.75) {
                // ✅ CORRECT
                newLines.push({ type: 'success', text: '' });
                newLines.push({
                    type: 'success',
                    text: step?.expectedOutput?.trim()
                        || 'Comando ejecutado correctamente.',
                });
                newLines.push({ type: 'success', text: '' });
                newLines.push({ type: 'success', text: '✅ ¡Correcto! Paso completado.' });
                newLines.push({ type: 'output', text: '' });
                setStepDone(true);
                if (typeof onStepComplete === 'function') {
                    setTimeout(onStepComplete, 800);
                }
            } else if (score > 0 && score < 0.75) {
                // ⚠️ PARTIAL — right cmdlet, missing params
                newLines.push({
                    type: 'warning',
                    text: `WARNING: El cmdlet es correcto pero faltan parámetros.\nRevisa los parámetros requeridos e inténtalo de nuevo.`,
                });
                newLines.push({ type: 'output', text: '' });
            } else {
                // ❌ WRONG
                const psError = generatePSError(cmd, expected);
                newLines.push({ type: 'error', text: psError });
                newLines.push({ type: 'output', text: '' });
            }

            setLines(prev => [...prev, ...newLines]);
            setProcessing(false);
            setInputVal('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }, 350 + Math.random() * 200);
    }, [step, onStepComplete]);

    // ── Generate realistic PS error message ───────────────────────────────────
    function generatePSError(typed, expected) {
        const typedCmdlet = extractCmdlet(typed);
        const expectedCmdlet = extractCmdlet(expected);
        if (!typed || typedCmdlet.length < 2) {
            return `El término '${typed}' no se reconoce como cmdlet, función, archivo de script ni programa ejecutable.`;
        }
        if (typedCmdlet !== expectedCmdlet) {
            return `El cmdlet '${typed.split(' ')[0]}' no es el adecuado para este paso.\n` +
                   `Revisa la explicación del paso e intenta de nuevo.`;
        }
        return `Error en parámetros: El comando tiene la estructura incorrecta.\nRevisa los parámetros y valores requeridos.`;
    }

    // ── Keyboard handler ───────────────────────────────────────────────────────
    const handleKey = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!processing && !stepDone) handleCommand(inputVal);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIdx = Math.min(histIdx + 1, history.length - 1);
            setHistIdx(newIdx);
            setInputVal(history[newIdx] || '');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newIdx = Math.max(histIdx - 1, -1);
            setHistIdx(newIdx);
            setInputVal(newIdx === -1 ? '' : history[newIdx]);
        } else if (e.key === 'c' && e.ctrlKey) {
            e.preventDefault();
            setLines(prev => [...prev, { type: 'prompt', text: inputVal }, { type: 'warning', text: '^C' }, { type: 'output', text: '' }]);
            setInputVal('');
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            setLines([{ type: 'info', text: '' }]);
        }
    }, [processing, stepDone, inputVal, histIdx, history, handleCommand]);

    // ── Reset terminal ─────────────────────────────────────────────────────────
    const resetTerminal = () => {
        setLines([
            { type: 'info', text: `\n═══ Paso ${stepIndex + 1}: ${step?.title || ''} ═══` },
            { type: 'info', text: `Escribe el comando PowerShell para completar este paso.\n` },
        ]);
        setInputVal('');
        setStepDone(false);
        setAttempts(0);
        setShowHint(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const dismissGuide = () => {
        setShowGuide(false);
        try { localStorage.setItem('t4u_psterminal_seen', '1'); } catch {}
    };

    // ── Gate ───────────────────────────────────────────────────────────────────
    if (!allowed) return <SubscriptionGate />;

    return (
        <div className="space-y-3">

        {/* ── Onboarding / Help panel ── */}
        {showGuide && (
            <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/6 to-[#0d0d1a] p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
                            <Terminal className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-xs font-black font-mono text-white">¿Qué es el Terminal PowerShell?</p>
                            <p className="text-[10px] font-mono text-violet-400/70">Simulador educativo seguro — sin ejecución real</p>
                        </div>
                    </div>
                    <button onClick={dismissGuide}
                        className="text-[10px] font-mono text-slate-600 hover:text-slate-400 flex items-center gap-1 flex-shrink-0 transition-colors px-2 py-1 rounded hover:bg-white/5">
                        <ChevronDown className="w-3 h-3" /> Cerrar
                    </button>
                </div>

                <p className="text-[11px] font-mono text-slate-400 leading-relaxed mb-4">
                    Este terminal te permite <span className="text-violet-300 font-bold">practicar comandos PowerShell reales</span> de cada paso del lab.
                    No ejecuta nada en ningún servidor — es un simulador que valida que escribes el comando correcto
                    y te devuelve la salida esperada. Así entrenas la memoria muscular de PS sin riesgos.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                        { icon: '⌨️', title: 'Escribe el comando', desc: 'Escribe el comando PS del paso actual y pulsa Enter para validarlo' },
                        { icon: '✅', title: 'Validación inteligente', desc: 'El terminal acepta variaciones válidas: mayúsculas/minúsculas, comillas opcionales, etc.' },
                        { icon: '💡', title: 'Pistas automáticas', desc: 'Tras 2 intentos fallidos aparece el botón "Pista" con una ayuda del paso' },
                        { icon: '⬆️', title: 'Historial de comandos', desc: 'Usa ↑ ↓ para navegar por comandos anteriores, como en una terminal real' },
                    ].map(item => (
                        <div key={item.title} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/3 border border-white/6">
                            <span className="text-base flex-shrink-0">{item.icon}</span>
                            <div>
                                <p className="text-[10px] font-black font-mono text-white mb-0.5">{item.title}</p>
                                <p className="text-[10px] font-mono text-slate-600 leading-snug">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/8 border border-violet-500/15">
                    <KeyRound className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <div>
                        <p className="text-[10px] font-black font-mono text-violet-300 mb-0.5">Atajos de teclado</p>
                        <p className="text-[10px] font-mono text-slate-500">
                            <span className="text-slate-400">Enter</span> ejecutar ·
                            <span className="text-slate-400"> ↑↓</span> historial ·
                            <span className="text-slate-400"> Ctrl+C</span> cancelar ·
                            <span className="text-slate-400"> Ctrl+L</span> limpiar pantalla ·
                            <span className="text-slate-400"> cls</span> limpiar
                        </p>
                    </div>
                </div>
            </div>
        )}

        {!showGuide && (
            <button onClick={() => setShowGuide(true)}
                className="flex items-center gap-1.5 text-[10px] font-mono text-violet-600/70 hover:text-violet-400 transition-colors">
                <Info className="w-3 h-3" /> ¿Cómo usar el terminal?
            </button>
        )}

        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
             onClick={() => inputRef.current?.focus()}>

            {/* Title bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a2e] border-b border-white/8">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500/80" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <span className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <Terminal className="w-3.5 h-3.5 text-violet-400 ml-2" />
                    <span className="text-[11px] font-mono text-slate-400">Windows PowerShell — Simulador Seguro</span>
                    <span className="text-[9px] font-mono text-violet-500/60 px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">SANDBOX</span>
                </div>
                <div className="flex items-center gap-2">
                    {attempts > 1 && !stepDone && !showHint && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                            className="flex items-center gap-1 text-[10px] font-mono text-amber-500/70 hover:text-amber-400 transition-colors px-2 py-1 rounded hover:bg-amber-500/10">
                            <Lightbulb className="w-3 h-3" /> Pista
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); resetTerminal(); }}
                        className="flex items-center gap-1 text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors px-2 py-1 rounded hover:bg-white/5">
                        <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                </div>
            </div>

            {/* Hint bar */}
            {showHint && !stepDone && (
                <div className="px-4 py-2.5 bg-amber-500/8 border-b border-amber-500/15 flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-mono text-amber-400 font-bold mb-0.5">Pista</p>
                        <p className="text-[11px] font-mono text-amber-300/80">{step?.hint || 'Revisa la explicación del paso y el cmdlet esperado.'}</p>
                    </div>
                </div>
            )}

            {/* Output area */}
            <div
                className="min-h-[260px] max-h-[420px] overflow-y-auto px-4 py-3 space-y-0.5 cursor-text"
                style={{ background: '#0a0a12', fontFamily: 'JetBrains Mono, Menlo, Consolas, monospace' }}
            >
                {/* Init banner */}
                <div className="text-[11px] font-mono pb-2 border-b border-white/5 mb-2" style={{ color: '#4a5568' }}>
                    Windows PowerShell — Simulador Educativo Tech4U<br />
                    Copyright (C) 2024 Tech4U Academy. Todos los derechos reservados.<br />
                    <span style={{ color: '#2d3748' }}>PS 5.1.19041.3570 | PSEdition Desktop | Sandbox Mode</span>
                </div>

                {lines.map((line, i) => <OutputLine key={i} line={line} />)}

                {/* Processing indicator */}
                {processing && (
                    <div className="flex items-center gap-2 font-mono text-sm" style={{ color: '#64748b' }}>
                        <span className="animate-pulse">▮</span>
                        <span className="text-xs">Procesando…</span>
                    </div>
                )}

                {/* Step completed indicator */}
                {stepDone && (
                    <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl border border-emerald-500/25 bg-emerald-500/8">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-xs font-mono text-emerald-400 font-bold">Paso completado — pasa al siguiente</span>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input row */}
            <div className="flex items-center gap-0 px-4 py-3 border-t border-white/8"
                 style={{ background: '#0d0d1a' }}>
                <span className="font-mono text-sm flex-shrink-0 select-none" style={{
                    fontFamily: 'JetBrains Mono, Menlo, Consolas, monospace'
                }}>
                    <span style={{ color: '#c084fc' }}>PS </span>
                    <span style={{ color: '#60a5fa' }}>C:\&gt;</span>
                    <span style={{ color: '#f1f5f9' }}> </span>
                </span>
                <input
                    ref={inputRef}
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={handleKey}
                    disabled={processing || stepDone}
                    placeholder={stepDone ? 'Paso completado ✓' : 'Escribe un comando PowerShell…'}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className="flex-1 bg-transparent outline-none font-mono text-sm placeholder-slate-700 disabled:opacity-50"
                    style={{
                        color: '#f1f5f9',
                        caretColor: '#c084fc',
                        fontFamily: 'JetBrains Mono, Menlo, Consolas, monospace',
                    }}
                />
                <span className="text-[9px] font-mono text-slate-700 flex-shrink-0 ml-2">
                    {attempts > 0 ? `${attempts} intento${attempts > 1 ? 's' : ''}` : ''}
                </span>
            </div>

            {/* Footer info */}
            <div className="px-4 py-1.5 flex items-center justify-between border-t border-white/5"
                 style={{ background: '#090912' }}>
                <span className="text-[9px] font-mono text-slate-700">↑↓ historial · Ctrl+C cancelar · Ctrl+L limpiar</span>
                <span className="text-[9px] font-mono text-violet-700/60">🔒 Sin ejecución real · 100% seguro</span>
            </div>
        </div>

        </div>
    );
}
