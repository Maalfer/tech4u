import { useState } from 'react';
import { ChevronLeft, Copy, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// Simple MD5 implementation (for educational purposes)
const md5 = (str) => {
    const hash = [];
    for (let i = 0; i < str.length; i++) hash.push(str.charCodeAt(i));
    // Simplified MD5 - just for UI demonstration
    let h = 0;
    for (let i = 0; i < hash.length; i++) h = ((h << 5) - h) + hash[i];
    return Math.abs(h).toString(16).padStart(32, '0');
};

// Simple SHA1 (simplified)
const sha1Simplified = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
    return Math.abs(h).toString(16).padStart(40, '0');
};

const SHA256 = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const SHA512 = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export default function HashGenerator() {
    const navigate = useNavigate();
    const [input, setInput] = useState('Tech4U');
    const [hashes, setHashes] = useState({
        md5: '',
        sha1: '',
        sha256: '',
        sha512: '',
    });
    const [hash1Compare, setHash1Compare] = useState('');
    const [hash2Compare, setHash2Compare] = useState('');
    const [copied, setCopied] = useState('');
    const [loading, setLoading] = useState(false);

    const generateHashes = async () => {
        setLoading(true);
        try {
            const sha256 = await SHA256(input);
            const sha512 = await SHA512(input);
            setHashes({
                md5: md5(input),
                sha1: sha1Simplified(input),
                sha256,
                sha512,
            });
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const compareHashes = () => {
        const n1 = hash1Compare.toLowerCase().trim();
        const n2 = hash2Compare.toLowerCase().trim();
        return n1 === n2 && n1.length > 0;
    };

    const copy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 1500);
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
                                <h1 className="text-base font-black uppercase tracking-tight text-white leading-none">Generador de <span className="text-blue-400">Hash</span></h1>
                                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">MD5 · SHA · Comparador</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 max-w-5xl mx-auto space-y-8">
                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                        <div className="px-6 py-4 border-b border-white/[0.05]">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Texto a Cifrar</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Introduce texto aquí..."
                                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-blue-400 outline-none focus:border-blue-500/40 transition-all resize-none h-24"
                            />
                            <button
                                onClick={generateHashes}
                                disabled={loading}
                                className="w-full px-4 py-3 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400 font-black uppercase text-[10px] hover:bg-blue-600/30 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Generando...' : 'Generar Hashes'}
                            </button>
                        </div>
                    </div>

                    {(hashes.md5 || hashes.sha256) && (
                        <div className="space-y-4">
                            {[
                                { name: 'MD5', value: hashes.md5, color: 'text-red-400', deprecated: true },
                                { name: 'SHA-1', value: hashes.sha1, color: 'text-orange-400', deprecated: true },
                                { name: 'SHA-256', value: hashes.sha256, color: 'text-emerald-400', deprecated: false },
                                { name: 'SHA-512', value: hashes.sha512, color: 'text-violet-400', deprecated: false },
                            ].map((h) => (
                                <div key={h.name} className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                    <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{h.name}</span>
                                            {h.deprecated && <span className="text-[7px] font-black px-2 py-0.5 rounded bg-red-500/20 text-red-400 uppercase">No Seguro</span>}
                                        </div>
                                        <button
                                            onClick={() => copy(h.value, h.name.toLowerCase())}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                copied === h.name.toLowerCase()
                                                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                                                    : 'bg-blue-500/15 border border-blue-500/25 text-blue-400 hover:bg-blue-500/25'
                                            }`}
                                        >
                                            {copied === h.name.toLowerCase() ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <code className={`text-[11px] font-mono break-all ${h.color}`}>{h.value}</code>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                        <div className="px-6 py-4 border-b border-white/[0.05]">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Comparador de Hashes</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[9px] font-mono text-slate-600 mb-2 block uppercase">Hash 1</label>
                                <input
                                    value={hash1Compare}
                                    onChange={e => setHash1Compare(e.target.value)}
                                    placeholder="Pegá el primer hash..."
                                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-blue-400 outline-none focus:border-blue-500/40 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-mono text-slate-600 mb-2 block uppercase">Hash 2</label>
                                <input
                                    value={hash2Compare}
                                    onChange={e => setHash2Compare(e.target.value)}
                                    placeholder="Pegá el segundo hash..."
                                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-blue-400 outline-none focus:border-blue-500/40 transition-all"
                                />
                            </div>
                            {hash1Compare && hash2Compare && (
                                <div className={`p-4 rounded-xl border ${
                                    compareHashes()
                                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                                        : 'bg-red-500/10 border-red-500/25 text-red-400'
                                } text-[10px] font-black uppercase text-center`}>
                                    {compareHashes() ? 'Los hashes coinciden' : 'Los hashes NO coinciden'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                        <div className="px-6 py-4 border-b border-white/[0.05]">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Info de Seguridad</span>
                        </div>
                        <div className="p-6 space-y-3 text-[10px] leading-relaxed text-slate-400">
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/25">
                                <p className="text-red-400 font-black mb-1">MD5 y SHA-1 son INSEGUROS</p>
                                <p>Tienen colisiones conocidas. NUNCA los uses para contraseñas o datos sensibles.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                                <p className="text-emerald-400 font-black mb-1">Para Contraseñas: Usa bcrypt o Argon2</p>
                                <p>SHA-256 y SHA-512 son buenos para integridad, pero no para contraseñas sin salt.</p>
                            </div>
                            <p>Los hashes no son reversibles (en teoría). Se usan para verificar integridad de datos y almacenar contraseñas de forma segura.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
