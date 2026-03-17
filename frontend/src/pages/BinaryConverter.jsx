import { useState, useCallback } from 'react';
import { ChevronLeft, RefreshCw, Copy, CheckCircle2, Cpu, Zap, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// ── UTILS ────────────────────────────────────────────────────────────────────
const toBin  = (n) => (n >>> 0).toString(2);
const toHex  = (n) => (n >>> 0).toString(16).toUpperCase();
const toOct  = (n) => (n >>> 0).toString(8);
const toDec  = (n) => (n >>> 0).toString(10);

const parseSafe = (val, base) => {
    const n = parseInt(val, base);
    return isNaN(n) ? null : n >>> 0;
};

const pad = (s, len) => s.padStart(len, '0');

const BASES = [
    { id: 'dec', label: 'Decimal',     base: 10, prefix: '',   placeholder: '255',       color: 'blue',   validate: /^[0-9]*$/ },
    { id: 'bin', label: 'Binario',     base: 2,  prefix: '0b', placeholder: '11111111',  color: 'emerald',validate: /^[01]*$/ },
    { id: 'hex', label: 'Hexadecimal', base: 16, prefix: '0x', placeholder: 'FF',        color: 'violet', validate: /^[0-9A-Fa-f]*$/ },
    { id: 'oct', label: 'Octal',       base: 8,  prefix: '0o', placeholder: '377',       color: 'amber',  validate: /^[0-7]*$/ },
];

const BITWISE_OPS = [
    { id: 'and', label: 'AND',  symbol: '&',  fn: (a,b) => (a & b) >>> 0 },
    { id: 'or',  label: 'OR',   symbol: '|',  fn: (a,b) => (a | b) >>> 0 },
    { id: 'xor', label: 'XOR',  symbol: '^',  fn: (a,b) => (a ^ b) >>> 0 },
    { id: 'shl', label: 'SHL',  symbol: '<<', fn: (a,b) => (a << b) >>> 0 },
    { id: 'shr', label: 'SHR',  symbol: '>>', fn: (a,b) => (a >>> b) >>> 0 },
];

const QUICK_VALUES = [
    { label: '0',   val: 0   }, { label: '1',    val: 1   }, { label: '127',  val: 127  },
    { label: '128', val: 128 }, { label: '255',  val: 255  }, { label: '256',  val: 256  },
    { label: '512', val: 512 }, { label: '1024', val: 1024 }, { label: '65535',val: 65535 },
];

const colorMap = {
    blue:    { text: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/25',   focus: 'focus:border-blue-500/50',  badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
    emerald: { text: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/25',focus: 'focus:border-emerald-500/50',badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
    violet:  { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/25', focus: 'focus:border-violet-500/50', badge: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
    amber:   { text: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/25',  focus: 'focus:border-amber-500/50',  badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
};

// ── BIT GRID ─────────────────────────────────────────────────────────────────
function BitGrid({ value, bits = 32 }) {
    const bin = pad(toBin(value), bits);
    const groups = [];
    for (let i = 0; i < bits; i += 8) groups.push(bin.slice(i, i+8));

    return (
        <div className="space-y-2">
            <div className="flex gap-3 flex-wrap">
                {groups.map((g, gi) => (
                    <div key={gi} className="space-y-1">
                        <div className="flex gap-0.5">
                            {g.split('').map((bit, bi) => (
                                <div key={bi} className={`w-7 h-7 rounded flex items-center justify-center text-[11px] font-black font-mono transition-all ${bit === '1' ? 'bg-blue-500/25 border border-blue-500/40 text-blue-300' : 'bg-white/[0.03] border border-white/[0.06] text-slate-700'}`}>
                                    {bit}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-0.5">
                            {g.split('').map((_, bi) => (
                                <div key={bi} className="w-7 text-center text-[7px] font-mono text-slate-800">{bits - gi*8 - bi - 1}</div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {bits === 32 && (
                <div className="flex gap-3 flex-wrap text-[8px] font-mono text-slate-700">
                    {groups.map((g, i) => (
                        <div key={i} className="w-[calc(8*1.75rem+7*0.125rem)] text-center">
                            Byte {4-i} = 0x{parseInt(g,2).toString(16).toUpperCase().padStart(2,'0')} = {parseInt(g,2)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function BinaryConverter() {
    const navigate = useNavigate();
    const [values, setValues] = useState({ dec: '255', bin: '11111111', hex: 'FF', oct: '377' });
    const [errors,  setErrors]  = useState({});
    const [bitWidth, setBitWidth] = useState(8);
    const [opA, setOpA] = useState('');
    const [opB, setOpB] = useState('');
    const [opSel, setOpSel] = useState('and');
    const [copied, setCopied] = useState('');

    const numericValue = parseSafe(values.dec, 10) ?? 0;

    const updateAll = useCallback((numVal) => {
        setValues({
            dec: toDec(numVal),
            bin: toBin(numVal),
            hex: toHex(numVal),
            oct: toOct(numVal),
        });
        setErrors({});
    }, []);

    const handleChange = (id, raw, base, validateRe) => {
        const v = id === 'hex' ? raw.toUpperCase() : raw;
        setValues(prev => ({ ...prev, [id]: v }));
        if (v === '') { updateAll(0); return; }
        if (!validateRe.test(v)) { setErrors(prev => ({ ...prev, [id]: true })); return; }
        const n = parseSafe(v, base);
        if (n === null) { setErrors(prev => ({ ...prev, [id]: true })); return; }
        setErrors({});
        const bases = BASES.filter(b => b.id !== id);
        const newVals = { [id]: v };
        bases.forEach(b => { newVals[b.id] = b.base === 10 ? toDec(n) : b.base === 2 ? toBin(n) : b.base === 16 ? toHex(n) : toOct(n); });
        setValues(newVals);
    };

    const opResult = (() => {
        const a = parseSafe(opA, 10);
        const b = parseSafe(opB, 10);
        if (a === null || b === null) return null;
        const op = BITWISE_OPS.find(o => o.id === opSel);
        return op ? op.fn(a, b) : null;
    })();

    const copy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 1500);
    };

    return (
        <div className="flex min-h-screen bg-[#050507] text-white">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 overflow-y-auto h-screen custom-scrollbar">

                {/* Header */}
                <div className="relative border-b border-white/[0.05] overflow-hidden" style={{ background: 'linear-gradient(135deg,#07050f,#090714,#06050e)' }}>
                    <div className="absolute inset-0 opacity-[0.10]" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                    <div className="absolute top-0 right-1/4 w-80 h-28 opacity-15 pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(139,92,246,0.8) 0%,transparent 70%)', filter: 'blur(40px)' }} />
                    <div className="relative z-10 px-8 py-6 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <button onClick={() => navigate('/tools')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest"><ChevronLeft className="w-4 h-4" /> Herramientas</button>
                            <div className="w-px h-5 bg-white/10" />
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl border border-violet-500/30 bg-violet-500/15 flex items-center justify-center"><Cpu className="w-4 h-4 text-violet-400" /></div>
                                <div>
                                    <h1 className="text-base font-black uppercase tracking-tight text-white leading-none">Conversor <span className="text-violet-400">de Bases</span></h1>
                                    <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Decimal · Binario · Hexadecimal · Octal</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {[8,16,32].map(b => (
                                <button key={b} onClick={() => setBitWidth(b)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${bitWidth===b ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'bg-white/[0.03] border-white/[0.07] text-slate-600 hover:text-white'}`}>{b} bits</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8 max-w-5xl mx-auto">

                    {/* Quick values */}
                    <div className="flex flex-wrap gap-2">
                        {QUICK_VALUES.map(({ label, val }) => (
                            <button key={label} onClick={() => updateAll(val)} className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[10px] font-mono text-slate-500 hover:text-white hover:border-white/15 transition-all">
                                {label}
                            </button>
                        ))}
                        <button onClick={() => updateAll(0)} className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[10px] font-mono text-slate-500 hover:text-red-400 transition-all flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reset</button>
                    </div>

                    {/* Conversion grid */}
                    <div className="grid md:grid-cols-2 gap-5">
                        {BASES.map(({ id, label, base, prefix, placeholder, color, validate }) => {
                            const c = colorMap[color];
                            return (
                                <div key={id} className={`rounded-2xl border overflow-hidden ${errors[id] ? 'border-red-500/40' : c.border}`} style={{ background: 'linear-gradient(160deg,#09090f,#07070d)' }}>
                                    <div className={`px-5 py-3 border-b ${errors[id] ? 'border-red-500/20' : 'border-white/[0.05]'} flex items-center justify-between`}>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${errors[id] ? 'text-red-400' : c.text}`}>{label}</span>
                                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${errors[id] ? 'bg-red-500/10 text-red-400 border-red-500/20' : c.badge}`}>base {base}</span>
                                        </div>
                                        <button onClick={() => copy(values[id], id)} className="text-slate-700 hover:text-slate-300 transition-colors">
                                            {copied===id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center gap-2">
                                            {prefix && <span className="text-slate-700 font-mono text-sm">{prefix}</span>}
                                            <input
                                                value={values[id]}
                                                onChange={(e) => handleChange(id, e.target.value, base, validate)}
                                                placeholder={placeholder}
                                                className={`flex-1 bg-transparent text-xl font-black font-mono outline-none transition-all ${errors[id] ? 'text-red-400' : c.text}`}
                                                spellCheck={false}
                                            />
                                        </div>
                                        {id === 'dec' && numericValue !== null && (
                                            <p className="text-[9px] font-mono text-slate-700 mt-2">
                                                {numericValue >= 0 && numericValue <= 127 && 'ASCII: ' + String.fromCharCode(numericValue) + ' · '}
                                                {numericValue.toLocaleString()} · 2^{Math.floor(Math.log2(Math.max(numericValue,1)))+1} = {Math.pow(2,Math.floor(Math.log2(Math.max(numericValue,1)))+1).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bit visualizer */}
                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: 'linear-gradient(160deg,#09090f,#07070d)' }}>
                        <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-2.5">
                            <Zap className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Visualizador de Bits — {bitWidth} bits</span>
                            <span className="ml-auto text-[9px] font-mono text-slate-700">= {pad(toBin(numericValue), bitWidth).replace(/(.{8})/g,'$1 ').trim()}</span>
                        </div>
                        <div className="p-6 overflow-x-auto">
                            <BitGrid value={numericValue} bits={bitWidth} />
                        </div>
                    </div>

                    {/* Bitwise operations */}
                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: 'linear-gradient(160deg,#09090f,#07070d)' }}>
                        <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-2.5">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operaciones Bitwise</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {[{label:'Operando A (decimal)', val: opA, set: setOpA}, {label:'Operando B (decimal)', val: opB, set: setOpB}].map(({label,val,set},i) => (
                                    <div key={i}>
                                        <label className="block text-[9px] font-mono uppercase text-slate-600 tracking-widest mb-2">{label}</label>
                                        <input type="number" value={val} onChange={e => set(e.target.value)} placeholder="ej: 170"
                                            className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-blue-500/40 transition-all" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {BITWISE_OPS.map(op => (
                                    <button key={op.id} onClick={() => setOpSel(op.id)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${opSel===op.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/[0.03] border-white/[0.07] text-slate-500 hover:text-white'}`}>
                                        {op.label} <span className="font-mono opacity-60">{op.symbol}</span>
                                    </button>
                                ))}
                            </div>
                            {opResult !== null && (
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                                    <p className="text-[9px] font-mono text-slate-600 mb-2 uppercase tracking-widest">Resultado</p>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[{l:'Dec',v:toDec(opResult)},{l:'Bin',v:toBin(opResult)},{l:'Hex',v:'0x'+toHex(opResult)},{l:'Oct',v:'0o'+toOct(opResult)}].map(({l,v}) => (
                                            <div key={l}>
                                                <p className="text-[8px] text-slate-700 font-mono uppercase mb-0.5">{l}</p>
                                                <p className="text-sm font-black font-mono text-emerald-400">{v}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reference table */}
                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/[0.05]" style={{background:'rgba(255,255,255,0.02)'}}>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tabla de Referencia Rápida</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full font-mono">
                                <thead>
                                    <tr className="border-b border-white/[0.05]">
                                        {['Decimal','Binario','Hexadecimal','Octal','Descripción'].map(h => (
                                            <th key={h} className="px-5 py-3 text-[9px] font-black uppercase text-slate-600 tracking-widest text-left">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {[
                                        [0,'0000 0000','00','0','Todo ceros / null'],
                                        [1,'0000 0001','01','1','Bit más bajo (LSB)'],
                                        [10,'0000 1010','0A','12',''],
                                        [15,'0000 1111','0F','17','Nibble alto'],
                                        [16,'0001 0000','10','20','2^4'],
                                        [32,'0010 0000','20','40','2^5'],
                                        [64,'0100 0000','40','100','2^6'],
                                        [127,'0111 1111','7F','177','Máx. número positivo 8-bit signed'],
                                        [128,'1000 0000','80','200','MSB encendido / 2^7'],
                                        [255,'1111 1111','FF','377','Todo unos / máscara /24'],
                                        [256,'1 0000 0000','100','400','2^8 = 256'],
                                    ].map(([d,b,h,o,desc]) => (
                                        <tr key={d} onClick={() => updateAll(d)} className="hover:bg-white/[0.02] cursor-pointer transition-colors">
                                            <td className="px-5 py-2.5 text-blue-400 font-black text-sm">{d}</td>
                                            <td className="px-5 py-2.5 text-emerald-400 text-[11px]">{b}</td>
                                            <td className="px-5 py-2.5 text-violet-400 text-[11px]">0x{h}</td>
                                            <td className="px-5 py-2.5 text-amber-400 text-[11px]">0o{o}</td>
                                            <td className="px-5 py-2.5 text-[10px] text-slate-600">{desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
