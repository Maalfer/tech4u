import { useState } from 'react';
import { ChevronLeft, Copy, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const expandIPv6 = (addr) => {
    const parts = addr.split('::');
    if (parts.length > 2) return null;
    
    if (parts.length === 2) {
        const left = parts[0] ? parts[0].split(':') : [];
        const right = parts[1] ? parts[1].split(':') : [];
        const missing = 8 - left.length - right.length;
        const middle = Array(missing).fill('0000');
        const all = [...left, ...middle, ...right];
        return all.map(p => p.padStart(4, '0')).join(':').toUpperCase();
    }
    
    return addr.split(':').map(p => p.padStart(4, '0')).toUpperCase().join(':');
};

const compressIPv6 = (addr) => {
    let expanded = addr.replace(/:/g, '');
    if (expanded.length !== 32) return addr;
    const parts = addr.split(':').map(p => parseInt(p, 16).toString(16));
    let longestZero = '';
    let currentZero = '';
    let longestStart = -1;
    let currentStart = -1;
    
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === '0') {
            if (!currentZero) currentStart = i;
            currentZero += ':';
        } else {
            if (currentZero.length > longestZero.length) {
                longestZero = currentZero;
                longestStart = currentStart;
            }
            currentZero = '';
        }
    }
    if (currentZero.length > longestZero.length) {
        longestZero = currentZero;
        longestStart = currentStart;
    }
    
    if (longestStart === -1) return parts.join(':');
    
    const before = parts.slice(0, longestStart).join(':');
    const after = parts.slice(longestStart + longestZero.split(':').length - 1).join(':');
    return (before && after) ? `${before}::${after}` : (before ? `${before}::` : `::${after}`);
};

const getIPv6Type = (addr) => {
    const expanded = expandIPv6(addr);
    if (!expanded) return 'unknown';
    
    const prefix = expanded.substring(0, 4);
    
    if (expanded === '0000:0000:0000:0000:0000:0000:0000:0001') return 'loopback';
    if (expanded === '0000:0000:0000:0000:0000:0000:0000:0000') return 'unspecified';
    if (expanded.startsWith('FE80:')) return 'link-local';
    if (expanded.startsWith('FF00:') || expanded.startsWith('FF0')) return 'multicast';
    if (expanded.startsWith('FC') || expanded.startsWith('FD')) return 'unique-local';
    if (expanded.startsWith('2') || expanded.startsWith('3')) return 'global-unicast';
    
    return 'unknown';
};

const typeColors = {
    'loopback': { label: 'Loopback', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/25' },
    'unspecified': { label: 'Sin especificar', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/25' },
    'link-local': { label: 'Enlace local', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/25' },
    'multicast': { label: 'Multidifusión', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25' },
    'unique-local': { label: 'Única Local', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/25' },
    'global-unicast': { label: 'Global Unicast', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' },
    'unknown': { label: 'Desconocido', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/25' },
};

const macToEUI64 = (mac) => {
    const clean = mac.replace(/[:-]/g, '');
    if (clean.length !== 12) return null;
    
    const first = parseInt(clean.substring(0, 2), 16);
    const flipped = (first ^ 0x02).toString(16).padStart(2, '0');
    
    const part1 = flipped + clean.substring(2, 6);
    const part2 = 'FFFE';
    const part3 = clean.substring(6, 12);
    
    return `${part1.toUpperCase()}:${part2}:${part3.toUpperCase()}`;
};

export default function Ipv6Calculator() {
    const navigate = useNavigate();
    const [address, setAddress] = useState('2001:0db8:0000:0000:0000:0000:0000:0001');
    const [prefix, setPrefix] = useState('32');
    const [macInput, setMacInput] = useState('');
    const [copied, setCopied] = useState('');

    const expanded = expandIPv6(address);
    const compressed = expanded ? compressIPv6(expanded) : address;
    const type = expanded ? getIPv6Type(address) : 'unknown';
    const typeInfo = typeColors[type];
    const eui64 = macInput ? macToEUI64(macInput) : null;
    const prefixNum = parseInt(prefix) || 128;
    const hostBits = 128 - prefixNum;
    const totalAddresses = Math.pow(2, hostBits);

    const copy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 1500);
    };

    const prefixRefs = [
        { prefix: '::1', desc: 'Loopback', mask: 128 },
        { prefix: 'fe80::/10', desc: 'Enlace local', mask: 10 },
        { prefix: 'ff00::/8', desc: 'Multidifusión', mask: 8 },
        { prefix: '2000::/3', desc: 'Global Unicast', mask: 3 },
        { prefix: 'fc00::/7', desc: 'Única Local', mask: 7 },
        { prefix: '::ffff:0:0/96', desc: 'IPv4-mapeado', mask: 96 },
    ];

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
                                <h1 className="text-base font-black uppercase tracking-tight text-white leading-none">Calculadora <span className="text-blue-400">IPv6</span></h1>
                                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Direcciones · EUI-64 · Análisis</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 max-w-5xl mx-auto space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                <div className="px-6 py-4 border-b border-white/[0.05]">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Dirección IPv6</span>
                                </div>
                                <div className="p-6 space-y-4">
                                    <input
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        placeholder="2001:db8::1"
                                        className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-blue-400 outline-none focus:border-blue-500/40 transition-all"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={prefix}
                                            onChange={e => setPrefix(e.target.value)}
                                            min="0"
                                            max="128"
                                            className="w-20 bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-cyan-400 outline-none focus:border-blue-500/40 transition-all"
                                        />
                                        <span className="text-slate-500 font-mono text-sm flex items-center">/ {prefixNum}</span>
                                    </div>
                                </div>
                            </div>

                            {expanded && (
                                <>
                                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                        <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Notaciones</span>
                                        </div>
                                        <div className="p-6 space-y-3">
                                            <div>
                                                <p className="text-[9px] font-mono text-slate-600 mb-1 uppercase">Expandida</p>
                                                <div className="flex gap-2 items-center">
                                                    <code className="flex-1 bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-[9px] font-mono text-emerald-400 break-all">{expanded}</code>
                                                    <button onClick={() => copy(expanded, 'exp')} className="p-2 hover:text-blue-400 transition-colors">
                                                        {copied === 'exp' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-600" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-mono text-slate-600 mb-1 uppercase">Comprimida</p>
                                                <div className="flex gap-2 items-center">
                                                    <code className="flex-1 bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-[9px] font-mono text-cyan-400 break-all">{compressed}</code>
                                                    <button onClick={() => copy(compressed, 'comp')} className="p-2 hover:text-blue-400 transition-colors">
                                                        {copied === 'comp' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-600" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`p-4 rounded-xl border ${typeInfo.bg}`}>
                                        <p className={`text-[10px] font-black uppercase ${typeInfo.color}`}>{typeInfo.label}</p>
                                        <p className="text-[9px] text-slate-400 mt-1">Tipo de dirección detectado automáticamente</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                <div className="px-6 py-4 border-b border-white/[0.05]">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Información de Red</span>
                                </div>
                                <div className="p-6 space-y-2 text-[10px] font-mono">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Bits de host:</span>
                                        <span className="text-blue-400">{hostBits}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Total de direcciones:</span>
                                        <span className="text-emerald-400">2^{hostBits}</span>
                                    </div>
                                    <div className="pt-2 border-t border-white/[0.08]">
                                        <p className="text-slate-400">Con /{prefixNum}, hay aproximadamente <strong className="text-cyan-400">{totalAddresses >= 1e15 ? '> 1 billón' : totalAddresses >= 1e9 ? `${(totalAddresses/1e9).toFixed(1)}B` : totalAddresses >= 1e6 ? `${(totalAddresses/1e6).toFixed(1)}M` : totalAddresses}</strong> direcciones disponibles.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                <div className="px-6 py-4 border-b border-white/[0.05]">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Calculadora EUI-64</span>
                                </div>
                                <div className="p-6 space-y-3">
                                    <div>
                                        <label className="text-[9px] font-mono text-slate-600 mb-2 block uppercase">MAC (ej: aa:bb:cc:dd:ee:ff)</label>
                                        <input
                                            value={macInput}
                                            onChange={e => setMacInput(e.target.value)}
                                            placeholder="aa:bb:cc:dd:ee:ff"
                                            className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-orange-400 outline-none focus:border-blue-500/40 transition-all"
                                        />
                                    </div>
                                    {eui64 && (
                                        <div>
                                            <p className="text-[9px] font-mono text-slate-600 mb-1 uppercase">EUI-64</p>
                                            <div className="flex gap-2 items-center">
                                                <code className="flex-1 bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-[9px] font-mono text-violet-400 break-all">{eui64}</code>
                                                <button onClick={() => copy(eui64, 'eui')} className="p-2 hover:text-blue-400 transition-colors">
                                                    {copied === 'eui' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-600" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                        <div className="px-6 py-4 border-b border-white/[0.05]">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Prefijos Comunes</span>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 gap-3">
                            {prefixRefs.map((ref, idx) => (
                                <div key={idx} className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                                    <p className="text-[10px] font-mono text-blue-400 font-black">{ref.prefix}</p>
                                    <p className="text-[9px] text-slate-400 mt-0.5">{ref.desc}</p>
                                    <p className="text-[8px] text-slate-600 mt-1">Máscara: /{ref.mask}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
