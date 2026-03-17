import { useState } from 'react';
import { ChevronLeft, Copy, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const RECORD_TYPES = [
    { type: 'A', desc: 'Dirección IPv4' },
    { type: 'AAAA', desc: 'Dirección IPv6' },
    { type: 'MX', desc: 'Intercambio de correo' },
    { type: 'TXT', desc: 'Texto (SPF, DKIM)' },
    { type: 'NS', desc: 'Servidor de nombres' },
    { type: 'CNAME', desc: 'Alias' },
    { type: 'SOA', desc: 'Autoridad de zona' },
];

export default function DnsLookup() {
    const navigate = useNavigate();
    const [domain, setDomain] = useState('example.com');
    const [selectedTypes, setSelectedTypes] = useState(['A', 'AAAA', 'MX', 'TXT']);
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState('');

    const toggleType = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const query = async () => {
        if (!domain.trim()) {
            setError('Introduce un dominio válido');
            return;
        }

        setLoading(true);
        setError('');
        setResults({});

        try {
            const newResults = {};
            for (const type of selectedTypes) {
                try {
                    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`;
                    const response = await fetch(url, {
                        headers: { 'Accept': 'application/dns-json' }
                    });

                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                    const data = await response.json();

                    if (data.Answer) {
                        newResults[type] = data.Answer.map(record => ({
                            name: record.name,
                            type: record.type,
                            ttl: record.TTL,
                            data: record.data,
                        }));
                    } else {
                        newResults[type] = [];
                    }
                } catch (e) {
                    newResults[type] = { error: e.message };
                }
            }
            setResults(newResults);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
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
                                <h1 className="text-base font-black uppercase tracking-tight text-white leading-none">Consulta <span className="text-blue-400">DNS</span></h1>
                                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Cloudflare API · Registros</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 max-w-5xl mx-auto space-y-8">
                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                        <div className="px-6 py-4 border-b border-white/[0.05]">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Dominio</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <input
                                value={domain}
                                onChange={e => setDomain(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && query()}
                                placeholder="example.com"
                                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-lg font-mono text-blue-400 outline-none focus:border-blue-500/40 transition-all"
                            />
                            <button
                                onClick={query}
                                disabled={loading}
                                className="w-full px-4 py-3 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400 font-black uppercase text-[10px] hover:bg-blue-600/30 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Consultando...' : 'Consultar'}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                        <div className="px-6 py-4 border-b border-white/[0.05]">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Tipos de Registro</span>
                        </div>
                        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {RECORD_TYPES.map(r => (
                                <button
                                    key={r.type}
                                    onClick={() => toggleType(r.type)}
                                    className={`p-3 rounded-lg border text-[9px] font-black uppercase transition-all ${
                                        selectedTypes.includes(r.type)
                                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                                            : 'bg-white/[0.05] border-white/[0.1] text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    <p>{r.type}</p>
                                    <p className="text-[7px] mt-0.5 opacity-70">{r.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] text-red-400 text-[10px]">
                            Error: {error}
                        </div>
                    )}

                    {Object.keys(results).length > 0 && (
                        <div className="space-y-4">
                            {Object.entries(results).map(([type, records]) => (
                                <div key={type} className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                    <div className="px-6 py-4 border-b border-white/[0.05]">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Registros {type}</span>
                                    </div>
                                    <div className="p-6">
                                        {records.error ? (
                                            <p className="text-[10px] text-slate-500">Error: {records.error}</p>
                                        ) : records.length === 0 ? (
                                            <p className="text-[10px] text-slate-500">No se encontraron registros</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {records.map((record, idx) => (
                                                    <div key={idx} className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.08]">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 text-[9px] font-mono">
                                                                <div className="text-blue-400 break-all"><strong>Dominio:</strong> {record.name}</div>
                                                                <div className="text-cyan-400 mt-1"><strong>TTL:</strong> {record.ttl}</div>
                                                                <div className="text-emerald-400 mt-1 break-all"><strong>Valor:</strong> {record.data}</div>
                                                            </div>
                                                            <button
                                                                onClick={() => copy(record.data, `dns-${type}-${idx}`)}
                                                                className="p-2 text-slate-600 hover:text-blue-400 transition-colors"
                                                            >
                                                                {copied === `dns-${type}-${idx}` ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                        <div className="px-6 py-4 border-b border-white/[0.05]">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Información</span>
                        </div>
                        <div className="p-6 space-y-3 text-[10px] leading-relaxed text-slate-400">
                            <p>Esta herramienta usa la API pública de <strong>Cloudflare DNS over HTTPS</strong>.</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>A:</strong> Mapea dominio a IPv4</li>
                                <li><strong>AAAA:</strong> Mapea dominio a IPv6</li>
                                <li><strong>MX:</strong> Servidores de correo del dominio</li>
                                <li><strong>TXT:</strong> Registros de texto (SPF, DKIM, DMARC)</li>
                                <li><strong>NS:</strong> Servidores de nombres autorizados</li>
                                <li><strong>CNAME:</strong> Alias de dominio</li>
                                <li><strong>SOA:</strong> Datos de autoridad de la zona</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
