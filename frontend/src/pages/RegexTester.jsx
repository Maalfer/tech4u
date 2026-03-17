import { useState } from 'react';
import { ChevronLeft, Copy, Info, CheckCircle2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import Sidebar from '../components/Sidebar';

const PRESETS = [
    { name: 'Email', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', example: 'user@example.com' },
    { name: 'IPv4', pattern: '^(\\d{1,3}\\.){3}\\d{1,3}$', example: '192.168.1.1' },
    { name: 'Teléfono ES', pattern: '^\\+?34[67]\\d{8}$', example: '+34612345678' },
    { name: 'DNI ES', pattern: '^\\d{8}[A-Z]$', example: '12345678A' },
    { name: 'Fecha YYYY-MM-DD', pattern: '^\\d{4}-\\d{2}-\\d{2}$', example: '2024-03-15' },
    { name: 'URL', pattern: '^https?://[\\w.-]+(\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#\\[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$', example: 'https://example.com' },
];

const CHEATSHEET = [
    { symbol: '\\d', desc: 'Dígito (0-9)' },
    { symbol: '\\w', desc: 'Palabra (a-z, A-Z, 0-9, _)' },
    { symbol: '\\s', desc: 'Espacio en blanco' },
    { symbol: '.', desc: 'Cualquier carácter excepto salto de línea' },
    { symbol: '*', desc: '0 o más repeticiones' },
    { symbol: '+', desc: '1 o más repeticiones' },
    { symbol: '?', desc: '0 o 1 repetición' },
    { symbol: '^', desc: 'Inicio de línea' },
    { symbol: '$', desc: 'Final de línea' },
    { symbol: '[]', desc: 'Clase de caracteres' },
    { symbol: '()', desc: 'Grupo' },
    { symbol: '{}', desc: 'Repetición exacta' },
    { symbol: '|', desc: 'Alternancia (OR)' },
    { symbol: '(?=...)', desc: 'Lookahead positivo' },
];

export default function RegexTester() {
    const navigate = useNavigate();
    const [pattern, setPattern] = useState('\\d{3}-\\d{3}-\\d{4}');
    const [flags, setFlags] = useState({ g: false, i: false, m: false, s: false });
    const [testString, setTestString] = useState('123-456-7890\n987-654-3210');
    const [mode, setMode] = useState('test');
    const [replacement, setReplacement] = useState('[REDACTED]');
    const [showCheat, setShowCheat] = useState(false);
    const [copied, setCopied] = useState('');

    let regex;
    let matches = [];
    let replaced = '';
    let error = '';

    try {
        const flagStr = Object.entries(flags).filter(([k, v]) => v).map(([k]) => k).join('');
        regex = new RegExp(pattern, flagStr);
        
        if (mode === 'test') {
            if (flags.g) {
                let match;
                while ((match = regex.exec(testString)) !== null) {
                    matches.push({ text: match[0], index: match.index });
                }
            } else {
                const match = regex.exec(testString);
                if (match) matches.push({ text: match[0], index: match.index });
            }
        } else {
            replaced = testString.replace(regex, replacement);
        }
    } catch (e) {
        error = e.message;
    }

    const highlightText = () => {
        if (error || mode !== 'test') return testString;
        
        let result = '';
        let lastIndex = 0;
        matches.forEach(m => {
            result += testString.substring(lastIndex, m.index);
            result += `<mark>${m.text}</mark>`;
            lastIndex = m.index + m.text.length;
        });
        result += testString.substring(lastIndex);
        return result;
    };

    const copy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 1500);
    };

    const loadPreset = (p) => {
        setPattern(p.pattern);
        setTestString(p.example);
    };

    return (
        <div className="flex min-h-screen bg-[#050507] text-white">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 overflow-y-auto h-screen custom-scrollbar">
                <div className="relative border-b border-white/[0.05] overflow-hidden" style={{ background: 'linear-gradient(135deg,#080a0f,#0a0d0a,#080a06)' }}>
                    <div className="absolute inset-0 opacity-[0.10]" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                    <div className="absolute top-0 right-1/3 w-80 h-28 opacity-15 pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(59,130,246,0.8) 0%,transparent 70%)', filter: 'blur(40px)' }} />
                    <div className="relative z-10 px-8 py-6 flex items-center gap-5">
                        <button onClick={() => navigate('/tools')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest"><ChevronLeft className="w-4 h-4" /> Herramientas</button>
                        <div className="w-px h-5 bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl border border-blue-500/30 bg-blue-500/15 flex items-center justify-center"><Info className="w-4 h-4 text-blue-400" /></div>
                            <div>
                                <h1 className="text-base font-black uppercase tracking-tight text-white leading-none">Probador <span className="text-blue-400">Regex</span></h1>
                                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Expresiones Regulares · Pruebas · Búsqueda</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 max-w-6xl mx-auto space-y-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-4">
                            <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                <div className="px-6 py-4 border-b border-white/[0.05]">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Patrón RegEx</span>
                                </div>
                                <div className="p-6 space-y-3">
                                    <textarea
                                        value={pattern}
                                        onChange={e => setPattern(e.target.value)}
                                        placeholder="\\d{3}-\\d{3}-\\d{4}"
                                        className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-blue-400 outline-none focus:border-blue-500/40 transition-all resize-none h-20"
                                    />
                                    <div className="flex gap-2">
                                        {[
                                            { key: 'g', label: 'Global' },
                                            { key: 'i', label: 'Case-Insensitive' },
                                            { key: 'm', label: 'Multiline' },
                                            { key: 's', label: 'DotAll' },
                                        ].map(f => (
                                            <button
                                                key={f.key}
                                                onClick={() => setFlags({...flags, [f.key]: !flags[f.key]})}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                                                    flags[f.key]
                                                        ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                                                        : 'bg-white/[0.05] border border-white/[0.1] text-slate-500 hover:text-slate-300'
                                                }`}
                                            >
                                                /{f.key}
                                            </button>
                                        ))}
                                    </div>
                                    {error && <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-red-400 text-[9px]">Error: {error}</div>}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Modo</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setMode('test')}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                                                mode === 'test'
                                                    ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                                                    : 'bg-white/[0.05] border border-white/[0.1] text-slate-500'
                                            }`}
                                        >
                                            Prueba
                                        </button>
                                        <button
                                            onClick={() => setMode('replace')}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                                                mode === 'replace'
                                                    ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                                                    : 'bg-white/[0.05] border border-white/[0.1] text-slate-500'
                                            }`}
                                        >
                                            Reemplazar
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 space-y-3">
                                    <div>
                                        <label className="text-[9px] font-mono text-slate-600 mb-2 block uppercase">Cadena de Prueba</label>
                                        <textarea
                                            value={testString}
                                            onChange={e => setTestString(e.target.value)}
                                            placeholder="Texto para probar..."
                                            className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-slate-300 outline-none focus:border-blue-500/40 transition-all resize-none h-24"
                                        />
                                    </div>
                                    {mode === 'replace' && (
                                        <div>
                                            <label className="text-[9px] font-mono text-slate-600 mb-2 block uppercase">Reemplazo</label>
                                            <input
                                                value={replacement}
                                                onChange={e => setReplacement(e.target.value)}
                                                placeholder="[REDACTED]"
                                                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-violet-400 outline-none focus:border-blue-500/40 transition-all"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {mode === 'test' && !error && (
                                <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                    <div className="px-6 py-4 border-b border-white/[0.05]">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Resultado con Resaltado</span>
                                    </div>
                                    <div className="p-6">
                                        <div className="bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono whitespace-pre-wrap break-words">
                                            <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(highlightText().replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/<mark>/g, '<span style="background: rgba(34, 197, 94, 0.3); color: #22c55e;">').replace(/<\/mark>/g, '</span>'))}} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {mode === 'replace' && !error && (
                                <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                    <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Resultado</span>
                                        <button
                                            onClick={() => copy(replaced, 'result')}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                copied === 'result'
                                                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                                                    : 'bg-blue-500/15 border border-blue-500/25 text-blue-400'
                                            }`}
                                        >
                                            {copied === 'result' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <textarea
                                            value={replaced}
                                            readOnly
                                            className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 outline-none resize-none h-24"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {mode === 'test' && !error && (
                                <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                    <div className="px-6 py-4 border-b border-white/[0.05]">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Coincidencias Encontradas</span>
                                    </div>
                                    <div className="p-6 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                        {matches.length === 0 ? (
                                            <p className="text-[9px] text-slate-500">Sin coincidencias</p>
                                        ) : (
                                            matches.map((m, i) => (
                                                <div key={i} className="p-2 bg-white/[0.05] rounded-lg border border-white/[0.08]">
                                                    <p className="text-[9px] font-mono text-blue-400 break-all">{m.text}</p>
                                                    <p className="text-[8px] text-slate-500 mt-0.5">Posición: {m.index}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Presets</span>
                                </div>
                                <div className="p-6 space-y-2">
                                    {PRESETS.map((p, i) => (
                                        <button
                                            key={i}
                                            onClick={() => loadPreset(p)}
                                            className="w-full p-2 text-left rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-all text-[9px]"
                                        >
                                            <p className="font-black text-blue-400">{p.name}</p>
                                            <p className="text-[8px] text-slate-500 mt-0.5 truncate">{p.pattern}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowCheat(!showCheat)}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] transition-all"
                            >
                                <span className="text-[9px] font-black uppercase text-slate-400">Referencia Rápida</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showCheat ? 'rotate-180' : ''}`} />
                            </button>

                            {showCheat && (
                                <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                    <div className="p-4 space-y-2">
                                        {CHEATSHEET.map((item, i) => (
                                            <div key={i} className="p-2 bg-white/[0.02] rounded-lg border border-white/[0.08]">
                                                <p className="text-[9px] font-mono text-cyan-400 font-black">{item.symbol}</p>
                                                <p className="text-[8px] text-slate-400 mt-0.5">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
