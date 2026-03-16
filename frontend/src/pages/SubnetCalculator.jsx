import { useState, useMemo } from 'react';
import {
    Network, Calculator, Trash2, Plus, Info,
    ChevronLeft, Download, Eye, EyeOff, Trophy,
    FileText, CheckCircle2, XCircle,
    Terminal, Copy, Monitor, Cpu as CpuIcon, X,
    AlertTriangle, RefreshCw, TrendingUp, Zap,
    ChevronDown, HelpCircle, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// ── IP LOGIC UTILS ──────────────────────────────────────────────────────────
const ipToLong  = (ip) => ip.split('.').reduce((acc, o) => (acc << 8) + parseInt(o), 0) >>> 0;
const longToIp  = (n)  => [(n>>>24)&0xFF,(n>>>16)&0xFF,(n>>>8)&0xFF,n&0xFF].join('.');
const getWild   = (m)  => (~m) >>> 0;
const longToBin = (n)  => { const b=(n>>>0).toString(2).padStart(32,'0'); return [b.slice(0,8),b.slice(8,16),b.slice(16,24),b.slice(24,32)].join('.'); };

const validateIp = (ip) => {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(p => { const n = Number(p); return /^\d+$/.test(p) && n >= 0 && n <= 255; });
};

const getNetworkClass = (ip) => {
    const first = parseInt(ip.split('.')[0]);
    if (first >= 1   && first <= 126) return { cls: 'A', color: 'text-emerald-400', range: '1–126' };
    if (first >= 128 && first <= 191) return { cls: 'B', color: 'text-blue-400',    range: '128–191' };
    if (first >= 192 && first <= 223) return { cls: 'C', color: 'text-violet-400',  range: '192–223' };
    if (first >= 224 && first <= 239) return { cls: 'D', color: 'text-amber-400',   range: '224–239 (Multicast)' };
    return { cls: '?', color: 'text-slate-400', range: '' };
};

const SUBNET_COLORS = [
    'bg-blue-500',  'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-rose-500',  'bg-cyan-500',   'bg-indigo-500',  'bg-teal-500',
    'bg-fuchsia-500','bg-orange-500','bg-sky-500',     'bg-lime-500',
];
const SUBNET_TEXT = [
    'text-blue-400','text-violet-400','text-emerald-400','text-amber-400',
    'text-rose-400','text-cyan-400',  'text-indigo-400', 'text-teal-400',
    'text-fuchsia-400','text-orange-400','text-sky-400', 'text-lime-400',
];
const SUBNET_BORDER = [
    'border-blue-500/30','border-violet-500/30','border-emerald-500/30','border-amber-500/30',
    'border-rose-500/30','border-cyan-500/30',  'border-indigo-500/30', 'border-teal-500/30',
    'border-fuchsia-500/30','border-orange-500/30','border-sky-500/30', 'border-lime-500/30',
];

// ── CHALLENGE TEMPLATES ──────────────────────────────────────────────────────
const CHALLENGE_TYPES = ['hosts_to_cidr', 'cidr_to_hosts', 'broadcast', 'network_addr'];

function buildChallenge() {
    const type = CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)];
    const baseOptions = [
        { ip: '192.168.1.0',  cidr: 24 }, { ip: '172.16.0.0',   cidr: 16 },
        { ip: '10.0.0.0',     cidr: 8  }, { ip: '192.168.100.0', cidr: 24 },
        { ip: '172.20.0.0',   cidr: 20 }, { ip: '10.10.0.0',     cidr: 16 },
    ];
    const base = baseOptions[Math.floor(Math.random() * baseOptions.length)];
    const hostOptions = [10, 14, 20, 30, 50, 62, 100, 126, 200, 254, 500, 510];
    const reqHosts = hostOptions[Math.floor(Math.random() * hostOptions.length)];

    let power = 0;
    while (Math.pow(2, power) < (reqHosts + 2)) power++;
    const correctCidr = 32 - power;
    const maxHosts = Math.pow(2, power) - 2;
    const maskLong = (0xFFFFFFFF << power) >>> 0;
    const netLong = ipToLong(base.ip);
    const broadcastLong = (netLong + Math.pow(2, 32 - base.cidr) - 1) >>> 0;
    const cidrHosts = Math.pow(2, 32 - base.cidr) - 2;

    switch (type) {
        case 'hosts_to_cidr':
            return {
                type, question: `Necesitas una subred para exactamente ${reqHosts} hosts utilizables.`,
                question2: `¿Cuál es el prefijo CIDR mínimo que lo soporta?`,
                answer: String(correctCidr), answerDisplay: `/${correctCidr}`,
                explanation: `Necesitas ${reqHosts}+2=${reqHosts+2} IPs totales. La potencia de 2 más cercana es 2^${power}=${Math.pow(2,power)}. Por tanto el CIDR es 32-${power} = /${correctCidr}.`,
                placeholder: '/ ej: 26', ip: null, cidr: null,
            };
        case 'cidr_to_hosts':
            return {
                type, question: `Tienes una subred con prefijo /${correctCidr}.`,
                question2: `¿Cuántos hosts utilizables admite?`,
                answer: String(maxHosts), answerDisplay: `${maxHosts} hosts`,
                explanation: `Con /${correctCidr} tienes 2^(32-${correctCidr}) = ${Math.pow(2,power)} IPs totales. Restando red y broadcast: ${Math.pow(2,power)}-2 = ${maxHosts} hosts.`,
                placeholder: 'ej: 30', ip: null, cidr: null,
            };
        case 'broadcast':
            return {
                type, question: `Red: ${base.ip}/${base.cidr}`,
                question2: `¿Cuál es la dirección de broadcast de esta red?`,
                answer: longToIp(broadcastLong), answerDisplay: longToIp(broadcastLong),
                explanation: `Red: ${base.ip}/${base.cidr}. Tamaño del bloque: 2^(32-${base.cidr})=${Math.pow(2,32-base.cidr)}. Broadcast = Red + tamaño - 1 = ${longToIp(broadcastLong)}.`,
                placeholder: 'ej: 192.168.1.255', ip: base.ip, cidr: base.cidr,
            };
        case 'network_addr': {
            // Generate a host inside the network
            const hostOffset = Math.floor(Math.random() * (Math.pow(2, 32-base.cidr) - 2)) + 1;
            const hostLong = (netLong + hostOffset) >>> 0;
            return {
                type, question: `Host: ${longToIp(hostLong)}/${base.cidr}`,
                question2: `¿Cuál es la dirección de red (network address)?`,
                answer: base.ip, answerDisplay: base.ip,
                explanation: `Aplicando la máscara al host: ${longToIp(hostLong)} AND ${longToIp(maskLong)} = ${base.ip}.`,
                placeholder: 'ej: 192.168.1.0', ip: base.ip, cidr: base.cidr,
            };
        }
        default: return buildChallenge();
    }
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function SubnetCalculator() {
    const navigate = useNavigate();
    const [mode, setMode]         = useState('FLSM');
    const [baseIp, setBaseIp]     = useState('192.168.1.0');
    const [baseCidr, setBaseCidr] = useState(24);
    const [ipError, setIpError]   = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'binary'
    const [showTutorial, setShowTutorial] = useState(false);
    const [results, setResults]   = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);

    // FLSM
    const [subnetCount, setSubnetCount] = useState(4);

    // VLSM
    const [requirements, setRequirements] = useState([
        { id: 1, name: 'Ventas', hosts: 50 },
        { id: 2, name: 'RRHH',   hosts: 20 },
        { id: 3, name: 'IT',     hosts: 10 },
    ]);

    // Challenge
    const [challenge, setChallenge]   = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isCorrect, setIsCorrect]   = useState(null);
    const [showSol, setShowSol]       = useState(false);
    const [streak, setStreak]         = useState(0);
    const [totalAnswered, setTotalAnswered] = useState(0);

    // Script generator
    const [scriptSub, setScriptSub]     = useState(null);
    const [scriptType, setScriptType]   = useState('cisco');
    const [copied, setCopied]           = useState(false);

    // ── Stats derived from results ───────────────────────────────────────────
    const stats = useMemo(() => {
        if (!results.length) return null;
        const totalBlock = Math.pow(2, 32 - baseCidr);
        const usedIps    = results.reduce((a, s) => a + s.hosts + 2, 0);
        const efficiency = Math.round((usedIps / totalBlock) * 100);
        const wasted     = totalBlock - usedIps;
        return { totalBlock, usedIps, efficiency, wasted };
    }, [results, baseCidr]);

    const netClass = useMemo(() => validateIp(baseIp) ? getNetworkClass(baseIp) : null, [baseIp]);

    // ── Validate IP on change ────────────────────────────────────────────────
    const handleIpChange = (val) => {
        setBaseIp(val);
        if (!validateIp(val)) setIpError('Dirección IP no válida');
        else setIpError('');
    };

    // ── FLSM ─────────────────────────────────────────────────────────────────
    const calculateFLSM = () => {
        if (!validateIp(baseIp)) { setIpError('Dirección IP no válida'); return; }
        setIpError('');
        try {
            const baseLong  = ipToLong(baseIp);
            const bits      = Math.ceil(Math.log2(Math.max(subnetCount, 2)));
            const newCidr   = baseCidr + bits;
            if (newCidr > 30) { setIpError(`Bloque insuficiente. Con /${baseCidr} y ${subnetCount} subredes necesitarías /${newCidr}.`); return; }
            const size = Math.pow(2, 32 - newCidr);
            const subs = [];
            for (let i = 0; i < subnetCount; i++) {
                const netL  = (baseLong + i * size) >>> 0;
                const bcL   = (netL + size - 1) >>> 0;
                const maskL = (0xFFFFFFFF << (32 - newCidr)) >>> 0;
                subs.push({
                    id: i+1, name: `Subred ${i+1}`,
                    network: longToIp(netL), mask: longToIp(maskL),
                    cidr: `/${newCidr}`, gateway: longToIp(netL+1),
                    firstUsable: longToIp(netL+1),
                    lastUsable:  longToIp(bcL-1),
                    range: `${longToIp(netL+1)} – ${longToIp(bcL-1)}`,
                    broadcast: longToIp(bcL), wildcard: longToIp(getWild(maskL)),
                    hosts: size - 2, binary: longToBin(netL), maskBinary: longToBin(maskL),
                });
            }
            setResults(subs);
            setExpandedRow(null);
        } catch { setIpError('Error en el cálculo. Verifica los parámetros.'); }
    };

    // ── VLSM ─────────────────────────────────────────────────────────────────
    const calculateVLSM = () => {
        if (!validateIp(baseIp)) { setIpError('Dirección IP no válida'); return; }
        const invalidReqs = requirements.filter(r => !r.name || parseInt(r.hosts) < 1);
        if (invalidReqs.length) { setIpError('Todos los departamentos necesitan nombre y al menos 1 host.'); return; }
        setIpError('');
        try {
            const sorted = [...requirements].sort((a, b) => b.hosts - a.hosts);
            let cur = ipToLong(baseIp);
            const blockEnd = (cur + Math.pow(2, 32 - baseCidr) - 1) >>> 0;
            const subs = [];
            for (let idx = 0; idx < sorted.length; idx++) {
                const req = sorted[idx];
                let power = 0;
                while (Math.pow(2, power) < (parseInt(req.hosts) + 2)) power++;
                const size  = Math.pow(2, power);
                const cidr  = 32 - power;
                const netL  = cur;
                const bcL   = (netL + size - 1) >>> 0;
                if (bcL > blockEnd) { setIpError(`No hay suficiente espacio en /${baseCidr} para todas las subredes.`); return; }
                const maskL = (0xFFFFFFFF << power) >>> 0;
                subs.push({
                    id: idx+1, name: req.name || `Subred ${idx+1}`,
                    requested: parseInt(req.hosts),
                    network: longToIp(netL), mask: longToIp(maskL),
                    cidr: `/${cidr}`, gateway: longToIp(netL+1),
                    firstUsable: longToIp(netL+1),
                    lastUsable:  longToIp(bcL-1),
                    range: `${longToIp(netL+1)} – ${longToIp(bcL-1)}`,
                    broadcast: longToIp(bcL), wildcard: longToIp(getWild(maskL)),
                    hosts: size - 2, binary: longToBin(netL), maskBinary: longToBin(maskL),
                });
                cur = (bcL + 1) >>> 0;
            }
            setResults(subs);
            setExpandedRow(null);
        } catch { setIpError('Error en el cálculo. Verifica los parámetros.'); }
    };

    // ── Challenge ────────────────────────────────────────────────────────────
    const newChallenge = () => {
        setChallenge(buildChallenge());
        setUserAnswer(''); setIsCorrect(null); setShowSol(false);
    };

    const checkAnswer = () => {
        const norm = (s) => s.trim().replace(/^\//, '').toLowerCase();
        const correct = norm(userAnswer) === norm(challenge.answer);
        setIsCorrect(correct);
        setTotalAnswered(t => t + 1);
        if (correct) setStreak(s => s + 1);
        else setStreak(0);
    };

    // ── Export CSV ───────────────────────────────────────────────────────────
    const exportCSV = () => {
        const h = 'ID,Nombre,Red,CIDR,Mascara,Gateway,Primer Host,Ultimo Host,Broadcast,Wildcard,Hosts Utiles\n';
        const r = results.map(s =>
            `${s.id},${s.name},${s.network},${s.cidr},${s.mask},${s.gateway},${s.firstUsable},${s.lastUsable},${s.broadcast},${s.wildcard},${s.hosts}`
        ).join('\n');
        const blob = new Blob([h + r], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: 'subredes_tech4u.csv', style: 'display:none' });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ── Script generator ─────────────────────────────────────────────────────
    const getScript = (sub) => {
        if (!sub) return '';
        switch (scriptType) {
            case 'cisco':
                return `! === Configuración Cisco IOS — ${sub.name} ===\ninterface GigabitEthernet0/0\n description ${sub.name}\n ip address ${sub.gateway} ${sub.mask}\n no shutdown\n exit\n!\nip route ${sub.network} ${sub.mask} null0`;
            case 'linux':
                return `# === Netplan config — ${sub.name} ===\nnetwork:\n  version: 2\n  ethernets:\n    eth0:\n      addresses:\n        - ${sub.gateway}${sub.cidr}\n      nameservers:\n        addresses: [8.8.8.8, 1.1.1.1]`;
            case 'windows':
                return `# === PowerShell — ${sub.name} ===\nNew-NetIPAddress \`\n  -InterfaceAlias "Ethernet" \`\n  -IPAddress ${sub.gateway} \`\n  -PrefixLength ${sub.cidr.slice(1)} \`\n  -DefaultGateway ${sub.gateway}\nSet-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 8.8.8.8`;
            default: return '';
        }
    };

    const copy = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <div className="flex min-h-screen bg-[#050507] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 overflow-y-auto h-screen custom-scrollbar">

                {/* ── HERO HEADER ─── */}
                <div className="relative overflow-hidden border-b border-white/[0.05]"
                    style={{ background: 'linear-gradient(135deg, #050510 0%, #07091a 40%, #050510 100%)' }}>
                    <div className="absolute inset-0 opacity-[0.12]"
                        style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                    <div className="absolute top-0 left-1/4 w-96 h-32 opacity-20 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse,rgba(99,102,241,0.8) 0%,transparent 70%)', filter: 'blur(40px)' }} />

                    <div className="relative z-10 px-8 py-6 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button onClick={() => navigate('/tools')}
                                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest">
                                <ChevronLeft className="w-4 h-4" /> Herramientas
                            </button>
                            <div className="w-px h-5 bg-white/10" />
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl border border-blue-500/30 bg-blue-500/15 flex items-center justify-center">
                                    <Network className="w-4.5 h-4.5 text-blue-400" style={{width:18,height:18}} />
                                </div>
                                <div>
                                    <h1 className="text-base font-black uppercase tracking-tight text-white leading-none">Subnetting <span className="text-blue-400">Pro</span></h1>
                                    <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">FLSM · VLSM · Calculadora de Subredes</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowTutorial(v => !v)}
                                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border transition-all ${showTutorial ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-white/[0.03] border-white/[0.07] text-slate-500 hover:text-white'}`}>
                                <HelpCircle className="w-3.5 h-3.5" /> Guía
                            </button>
                            {results.length > 0 && (
                                <button onClick={exportCSV}
                                    className="px-3 py-2 bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-slate-400 transition-all">
                                    <Download className="w-3.5 h-3.5" /> CSV
                                </button>
                            )}
                            <button onClick={newChallenge}
                                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border transition-all ${challenge ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-white/[0.03] border-white/[0.07] text-slate-500 hover:text-white'}`}>
                                <Trophy className="w-3.5 h-3.5" />
                                Desafío {streak > 0 && <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px]">{streak}🔥</span>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-8">

                    {/* ── TUTORIAL ─── */}
                    {showTutorial && (
                        <div className="mb-8 rounded-2xl border border-amber-500/15 overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.04) 0%, rgba(0,0,0,0) 100%)' }}>
                            <div className="px-7 py-5 border-b border-amber-500/10 flex items-center gap-3">
                                <Info className="w-4 h-4 text-amber-400" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400">Guía de Subnetting</span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-0 divide-x divide-white/5">
                                {[
                                    { title: 'FLSM — Fixed Length', color: 'text-blue-400 border-blue-400/20', points: [
                                        'Divide una red en bloques exactamente iguales.',
                                        'Fórmula: necesitas 2ⁿ ≥ número de subredes. Esos n bits se "prestan" al host.',
                                        'Ejemplo: /24 con 4 subredes → n=2 bits → /26. Cada subred tiene 62 hosts.',
                                        'Desventaja: desperdicia IPs si los departamentos tienen necesidades distintas.',
                                    ]},
                                    { title: 'VLSM — Variable Length', color: 'text-emerald-400 border-emerald-400/20', points: [
                                        'Asigna a cada departamento solo el bloque que necesita.',
                                        'Regla de oro: ordenar siempre de MAYOR a MENOR número de hosts.',
                                        'Para cada req: busca 2^n ≥ (hosts + 2). El CIDR = 32 - n.',
                                        'Ventaja: máxima eficiencia en el uso del espacio de direcciones.',
                                    ]},
                                ].map(({ title, color, points }) => (
                                    <div key={title} className="px-7 py-6">
                                        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${color.split(' ')[0]} mb-4 pb-2 border-b ${color.split(' ')[1]}`}>{title}</h3>
                                        <ul className="space-y-2.5">
                                            {points.map((p, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
                                                    <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.split(' ')[0].replace('text-','bg-')} opacity-70`} />
                                                    {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-8 items-start">

                        {/* ════════════════════════════════════════
                            LEFT PANEL
                        ════════════════════════════════════════ */}
                        <div className="w-full lg:w-[380px] flex-shrink-0 space-y-5 sticky top-6">

                            {/* Challenge mode */}
                            {challenge ? (
                                <div className="rounded-2xl border border-emerald-500/20 overflow-hidden"
                                    style={{ background: 'linear-gradient(160deg,#04100a,#060e0a)' }}>
                                    <div className="px-6 py-4 border-b border-emerald-500/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Trophy className="w-4 h-4 text-emerald-400" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Reto Académico</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {streak > 0 && <span className="text-[10px] font-black text-amber-400">{streak} racha 🔥</span>}
                                            <button onClick={() => setChallenge(null)} className="text-slate-600 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {/* Question */}
                                        <div className="rounded-xl border border-emerald-500/10 bg-black/30 p-4">
                                            <p className="text-xs text-slate-400 leading-relaxed mb-1">{challenge.question}</p>
                                            <p className="text-sm font-black text-white">{challenge.question2}</p>
                                        </div>

                                        {/* Answer input */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={userAnswer}
                                                onChange={(e) => setUserAnswer(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !isCorrect && checkAnswer()}
                                                placeholder={challenge.placeholder}
                                                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 placeholder-slate-700 outline-none focus:border-emerald-500/40 transition-all"
                                            />
                                            <button onClick={isCorrect ? newChallenge : checkAnswer}
                                                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isCorrect ? 'bg-emerald-500 text-black' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
                                                {isCorrect ? <RefreshCw className="w-4 h-4" /> : 'OK'}
                                            </button>
                                        </div>

                                        {/* Feedback */}
                                        {isCorrect !== null && (
                                            <div className={`flex items-start gap-3 p-3.5 rounded-xl ${isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                                {isCorrect
                                                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                                    : <XCircle     className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                                                <div>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {isCorrect ? '¡Correcto!' : `Incorrecto — era: ${challenge.answerDisplay}`}
                                                    </p>
                                                    {!isCorrect && <p className="text-[10px] text-slate-500 mt-0.5">Revisa el razonamiento abajo.</p>}
                                                </div>
                                            </div>
                                        )}

                                        {/* Explanation toggle */}
                                        <button onClick={() => setShowSol(v => !v)}
                                            className="w-full py-2.5 text-[9px] uppercase font-mono text-slate-600 hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5">
                                            <ChevronDown className={`w-3 h-3 transition-transform ${showSol ? 'rotate-180' : ''}`} />
                                            {showSol ? 'Ocultar razonamiento' : 'Ver razonamiento'}
                                        </button>
                                        {showSol && (
                                            <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] text-[11px] text-slate-400 leading-relaxed font-mono">
                                                {challenge.explanation}
                                            </div>
                                        )}

                                        <button onClick={newChallenge}
                                            className="w-full py-2.5 border border-white/[0.07] rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-white/15 transition-all flex items-center justify-center gap-1.5">
                                            <RefreshCw className="w-3 h-3" /> Nuevo reto
                                        </button>

                                        {/* Score */}
                                        {totalAnswered > 0 && (
                                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-700 px-1">
                                                <span>Respondidos: {totalAnswered}</span>
                                                <span className="text-emerald-800">Aciertos: {streak > 0 ? '🔥' : ''} {Math.round((streak/totalAnswered)*100)}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            ) : (
                                <>
                                    {/* ── Network Config ── */}
                                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden"
                                        style={{ background: 'linear-gradient(160deg,#09090f,#07070d)' }}>
                                        <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-2.5">
                                            <Network className="w-4 h-4 text-blue-400" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Configuración de Red</span>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            {/* IP Input */}
                                            <div>
                                                <label className="flex items-center justify-between text-[9px] uppercase font-mono text-slate-600 tracking-widest mb-2">
                                                    <span>Red Base (Network Address)</span>
                                                    {netClass && <span className={`font-black ${netClass.color}`}>Clase {netClass.cls}</span>}
                                                </label>
                                                <input
                                                    type="text" value={baseIp}
                                                    onChange={(e) => handleIpChange(e.target.value)}
                                                    className={`w-full bg-black/50 border rounded-xl px-4 py-3 text-sm font-mono outline-none transition-all ${ipError ? 'border-red-500/50 text-red-400' : 'border-white/10 text-white focus:border-blue-500/50'}`}
                                                    placeholder="192.168.1.0"
                                                />
                                                {ipError && (
                                                    <p className="flex items-center gap-1.5 mt-2 text-[10px] text-red-400">
                                                        <AlertTriangle className="w-3 h-3" /> {ipError}
                                                    </p>
                                                )}
                                            </div>

                                            {/* CIDR + Mode */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[9px] uppercase font-mono text-slate-600 tracking-widest mb-2">Prefijo CIDR</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">/</span>
                                                        <input type="number" value={baseCidr} min={1} max={30}
                                                            onChange={(e) => setBaseCidr(Math.max(1, Math.min(30, parseInt(e.target.value)||24)))}
                                                            className="w-full bg-black/50 border border-white/10 rounded-xl pl-7 pr-4 py-3 text-sm font-mono outline-none focus:border-blue-500/50 transition-all"
                                                        />
                                                    </div>
                                                    <p className="text-[9px] font-mono text-slate-700 mt-1.5 ml-1">
                                                        {Math.pow(2, 32-baseCidr).toLocaleString()} IPs · {Math.pow(2,32-baseCidr)-2} hosts
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] uppercase font-mono text-slate-600 tracking-widest mb-2">Modo</label>
                                                    <div className="grid grid-cols-2 bg-black/50 border border-white/10 rounded-xl p-1 h-[46px]">
                                                        {['FLSM','VLSM'].map(m => (
                                                            <button key={m} onClick={() => { setMode(m); setResults([]); }}
                                                                className={`rounded-lg text-[10px] font-black uppercase transition-all ${mode===m ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-300'}`}>{m}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Mode-specific config ── */}
                                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden"
                                        style={{ background: 'linear-gradient(160deg,#09090f,#07070d)' }}>
                                        <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-2.5">
                                            <Calculator className="w-4 h-4 text-blue-400" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                {mode === 'FLSM' ? 'Parámetros FLSM' : 'Departamentos VLSM'}
                                            </span>
                                        </div>
                                        <div className="p-6">
                                            {mode === 'FLSM' ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-[9px] uppercase font-mono text-slate-600 tracking-widest mb-2">Número de Subredes</label>
                                                        <input type="number" value={subnetCount} min={2} max={256}
                                                            onChange={(e) => setSubnetCount(Math.max(2, parseInt(e.target.value)||2))}
                                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-blue-500/50 transition-all"
                                                        />
                                                        <p className="text-[9px] font-mono text-slate-700 mt-1.5 ml-1">
                                                            Bits a prestar: {Math.ceil(Math.log2(Math.max(subnetCount,2)))} → CIDR resultante: /{baseCidr + Math.ceil(Math.log2(Math.max(subnetCount,2)))}
                                                        </p>
                                                    </div>
                                                    <button onClick={calculateFLSM}
                                                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                                        <Zap className="w-3.5 h-3.5" /> Generar Subredes
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                                                        {requirements.map((req, idx) => (
                                                            <div key={req.id} className="flex gap-2 items-center">
                                                                <div className={`w-2 h-8 rounded-full flex-shrink-0 ${SUBNET_COLORS[idx % SUBNET_COLORS.length]}`} />
                                                                <input placeholder="Departamento"
                                                                    value={req.name}
                                                                    onChange={(e) => { const n=[...requirements]; n[idx].name=e.target.value; setRequirements(n); }}
                                                                    className="flex-1 bg-black/40 border border-white/[0.07] rounded-lg px-3 py-2 text-[11px] font-mono outline-none focus:border-blue-500/30 transition-all"
                                                                />
                                                                <input type="number" placeholder="Hosts"
                                                                    value={req.hosts}
                                                                    onChange={(e) => { const n=[...requirements]; n[idx].hosts=e.target.value; setRequirements(n); }}
                                                                    className="w-20 bg-black/40 border border-white/[0.07] rounded-lg px-3 py-2 text-[11px] font-mono outline-none focus:border-blue-500/30 transition-all text-center"
                                                                />
                                                                <button onClick={() => requirements.length > 1 && setRequirements(requirements.filter(r=>r.id!==req.id))}
                                                                    className="p-1.5 text-slate-700 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button onClick={() => setRequirements([...requirements, {id:Date.now(),name:'',hosts:0}])}
                                                        className="w-full py-2.5 border border-dashed border-white/[0.08] text-slate-600 hover:text-slate-300 hover:border-white/15 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5">
                                                        <Plus className="w-3 h-3" /> Añadir departamento
                                                    </button>
                                                    <button onClick={calculateVLSM}
                                                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                                        <Zap className="w-3.5 h-3.5" /> Calcular VLSM
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ── Stats widget ── */}
                            {stats && !challenge && (
                                <div className="rounded-2xl border border-white/[0.07] overflow-hidden"
                                    style={{ background: 'linear-gradient(160deg,#09090f,#07070d)' }}>
                                    <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-2.5">
                                        <BarChart3 className="w-4 h-4 text-violet-400" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Eficiencia del Bloque</span>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        {/* Segmented bar */}
                                        <div>
                                            <div className="h-3 rounded-full overflow-hidden bg-black/60 flex">
                                                {results.map((s, i) => (
                                                    <div key={i}
                                                        className={`h-full ${SUBNET_COLORS[i % SUBNET_COLORS.length]} transition-all`}
                                                        style={{ width: `${((s.hosts+2)/stats.totalBlock)*100}%` }}
                                                        title={s.name}
                                                    />
                                                ))}
                                                <div className="h-full bg-white/[0.04] flex-1" title="Sin asignar" />
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[9px] font-mono text-slate-700">0</span>
                                                <span className="text-[9px] font-mono text-slate-700">{stats.totalBlock.toLocaleString()} IPs</span>
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'Usadas', value: stats.usedIps.toLocaleString(), color: 'text-blue-400' },
                                                { label: 'Libres',  value: stats.wasted.toLocaleString(),  color: 'text-slate-500' },
                                                { label: 'Efic.',  value: `${stats.efficiency}%`,          color: stats.efficiency >= 80 ? 'text-emerald-400' : stats.efficiency >= 50 ? 'text-amber-400' : 'text-red-400' },
                                            ].map(({ label, value, color }) => (
                                                <div key={label} className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5 text-center">
                                                    <div className={`text-base font-black font-mono ${color}`}>{value}</div>
                                                    <div className="text-[8px] font-mono text-slate-700 uppercase mt-0.5">{label}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Subnet legend */}
                                        <div className="space-y-1.5">
                                            {results.map((s, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[9px] font-mono">
                                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${SUBNET_COLORS[i % SUBNET_COLORS.length]}`} />
                                                    <span className="text-slate-400 flex-1 truncate">{s.name}</span>
                                                    <span className={`${SUBNET_TEXT[i % SUBNET_TEXT.length]} font-black`}>{s.cidr}</span>
                                                    <span className="text-slate-700">{s.hosts}h</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ════════════════════════════════════════
                            RIGHT PANEL — RESULTS
                        ════════════════════════════════════════ */}
                        <div className="flex-1 min-w-0 space-y-5">
                            {results.length > 0 ? (
                                <>
                                    {/* View toggle */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex bg-white/[0.04] border border-white/[0.06] p-1 rounded-xl gap-1">
                                            {[
                                                { id: 'table',  label: 'Tabla',   Icon: FileText },
                                                { id: 'binary', label: 'Binario', Icon: Eye },
                                            ].map(({ id, label, Icon: Ic }) => (
                                                <button key={id} onClick={() => setViewMode(id)}
                                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${viewMode===id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>
                                                    <Ic className="w-3 h-3" /> {label}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-mono text-slate-700">{results.length} subred{results.length>1?'es':''} · /{baseCidr} base</p>
                                    </div>

                                    {/* TABLE VIEW */}
                                    {viewMode === 'table' && (
                                        <div className="rounded-2xl border border-white/[0.07] overflow-hidden overflow-x-auto">
                                            <table className="w-full text-left font-mono min-w-[860px]">
                                                <thead>
                                                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                                        {['#','Nombre','Red / CIDR','Máscara','Gateway','Rango Utilizable','Broadcast','Wildcard','Hosts','Cmds'].map((h,i) => (
                                                            <th key={h} className={`px-4 py-3.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-600 border-b border-white/[0.05] ${i===9?'text-right':''}`}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {results.map((sub, idx) => {
                                                        const isExp = expandedRow === idx;
                                                        const col = SUBNET_TEXT[idx % SUBNET_TEXT.length];
                                                        const bdr = SUBNET_BORDER[idx % SUBNET_BORDER.length];
                                                        return (
                                                            <>
                                                                <tr key={idx}
                                                                    onClick={() => setExpandedRow(isExp ? null : idx)}
                                                                    className={`border-b border-white/[0.04] cursor-pointer transition-colors ${isExp ? 'bg-blue-500/5' : 'hover:bg-white/[0.02]'}`}>
                                                                    <td className="px-4 py-3.5">
                                                                        <span className={`inline-flex w-6 h-6 items-center justify-center rounded-lg text-[10px] font-black border ${col} ${bdr} bg-white/[0.03]`}>{sub.id}</span>
                                                                    </td>
                                                                    <td className="px-4 py-3.5">
                                                                        <span className="text-[11px] font-bold text-white">{sub.name}</span>
                                                                        {sub.requested && <span className="ml-1.5 text-[9px] text-slate-600">({sub.requested} req)</span>}
                                                                    </td>
                                                                    <td className="px-4 py-3.5">
                                                                        <span className={`text-xs font-black ${col}`}>{sub.network}</span>
                                                                        <span className="text-slate-600 text-[10px]">{sub.cidr}</span>
                                                                    </td>
                                                                    <td className="px-4 py-3.5 text-[11px] text-slate-300">{sub.mask}</td>
                                                                    <td className="px-4 py-3.5 text-[11px] text-amber-400 font-bold">{sub.gateway}</td>
                                                                    <td className="px-4 py-3.5 text-[10px] text-slate-400">{sub.firstUsable} – {sub.lastUsable}</td>
                                                                    <td className="px-4 py-3.5 text-[11px] text-red-400/80 font-bold">{sub.broadcast}</td>
                                                                    <td className="px-4 py-3.5 text-[10px] text-slate-600">{sub.wildcard}</td>
                                                                    <td className="px-4 py-3.5">
                                                                        <span className={`text-[11px] font-black ${col}`}>{sub.hosts}</span>
                                                                    </td>
                                                                    <td className="px-4 py-3.5 text-right">
                                                                        <button onClick={(e) => { e.stopPropagation(); setScriptSub(sub); }}
                                                                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-blue-500/15 text-slate-600 hover:text-blue-400 transition-all">
                                                                            <Terminal className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                                {/* Expanded binary row */}
                                                                {isExp && (
                                                                    <tr key={`exp-${idx}`} className="bg-blue-500/[0.04]">
                                                                        <td colSpan={10} className="px-6 py-5">
                                                                            <div className="space-y-4">
                                                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Representación Binaria</p>
                                                                                <div className="grid md:grid-cols-2 gap-5">
                                                                                    <div>
                                                                                        <p className="text-[9px] font-mono text-slate-600 mb-2 uppercase tracking-wider">Network: {sub.network}</p>
                                                                                        <BinaryLine binary={sub.binary} cidr={sub.cidr.slice(1)} label="Red" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-[9px] font-mono text-slate-600 mb-2 uppercase tracking-wider">Mask: {sub.mask}</p>
                                                                                        <BinaryLine binary={sub.maskBinary} cidr={sub.cidr.slice(1)} isMask label="Máscara" />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-4 text-[9px] font-mono">
                                                                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-cyan-500/80 inline-block" /> Bits de red</span>
                                                                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-slate-700 inline-block" /> Bits de host</span>
                                                                                    <span className="text-slate-700">·  CIDR {sub.cidr} = {sub.cidr.slice(1)} bits de red + {32-parseInt(sub.cidr.slice(1))} bits de host</span>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* BINARY VIEW */}
                                    {viewMode === 'binary' && (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                            {results.map((sub, idx) => {
                                                const col = SUBNET_TEXT[idx % SUBNET_TEXT.length];
                                                const bdr = SUBNET_BORDER[idx % SUBNET_BORDER.length];
                                                return (
                                                    <div key={idx} className={`rounded-2xl border ${bdr} overflow-hidden`}
                                                        style={{ background: 'linear-gradient(160deg,#09090f,#07070d)' }}>
                                                        <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className={`text-xs font-black ${col}`}>{sub.name}</span>
                                                                <span className="text-[9px] font-mono text-slate-700">{sub.network}{sub.cidr}</span>
                                                            </div>
                                                            <span className={`text-[9px] font-black ${col}`}>{sub.hosts} hosts</span>
                                                        </div>
                                                        <div className="p-5 space-y-5">
                                                            <div>
                                                                <p className="text-[9px] text-slate-600 uppercase tracking-widest font-mono mb-2">Network Address</p>
                                                                <BinaryLine binary={sub.binary} cidr={sub.cidr.slice(1)} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] text-slate-600 uppercase tracking-widest font-mono mb-2">Subnet Mask</p>
                                                                <BinaryLine binary={sub.maskBinary} cidr={sub.cidr.slice(1)} isMask />
                                                            </div>
                                                            <div className="flex items-center gap-3 text-[9px] font-mono text-slate-700 pt-2 border-t border-white/[0.04]">
                                                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-cyan-500/70 inline-block" /> Bits red ({sub.cidr.slice(1)})</span>
                                                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-slate-700 inline-block" /> Bits host ({32-parseInt(sub.cidr.slice(1))})</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Empty state */
                                <div className="min-h-[500px] rounded-2xl border border-dashed border-white/[0.07] flex flex-col items-center justify-center text-center px-12"
                                    style={{ background: 'linear-gradient(160deg,#08080f,#060609)' }}>
                                    <div className="w-16 h-16 rounded-2xl border border-blue-500/20 bg-blue-500/8 flex items-center justify-center mb-6">
                                        <Network className="w-7 h-7 text-blue-400/60" />
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-tight text-white/30 mb-2">Calculadora Lista</h3>
                                    <p className="text-[11px] text-slate-700 max-w-xs leading-relaxed font-mono">
                                        Introduce una red base y selecciona el modo. Los resultados aparecerán aquí con representación binaria, eficiencia y comandos de configuración.
                                    </p>
                                    <div className="mt-8 flex items-center gap-4 text-[9px] font-mono text-slate-800 uppercase tracking-widest">
                                        <span>FLSM — subredes iguales</span>
                                        <span>·</span>
                                        <span>VLSM — tamaño variable</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* ── SCRIPT GENERATOR MODAL ─── */}
            {scriptSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
                    onClick={(e) => e.target === e.currentTarget && setScriptSub(null)}>
                    <div className="w-full max-w-2xl rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl"
                        style={{ background: 'linear-gradient(160deg,#0c0c12,#09090e)' }}>

                        {/* Modal header */}
                        <div className="px-7 py-5 border-b border-white/[0.06] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-blue-400" />
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Generador de Comandos</h3>
                                    <p className="text-[9px] font-mono text-slate-600 mt-0.5">{scriptSub.name} · {scriptSub.network}{scriptSub.cidr}</p>
                                </div>
                            </div>
                            <button onClick={() => setScriptSub(null)} className="p-2 text-slate-600 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="p-7 space-y-5">
                            {/* Platform tabs */}
                            <div className="grid grid-cols-3 gap-2 p-1 bg-black/40 rounded-xl border border-white/[0.06]">
                                {[
                                    { id: 'cisco',   label: 'Cisco IOS',    Icon: CpuIcon  },
                                    { id: 'linux',   label: 'Linux Netplan', Icon: Terminal },
                                    { id: 'windows', label: 'Windows PS',   Icon: Monitor  },
                                ].map(({ id, label, Icon }) => (
                                    <button key={id} onClick={() => setScriptType(id)}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${scriptType===id ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-300'}`}>
                                        <Icon className="w-3.5 h-3.5" /> {label}
                                    </button>
                                ))}
                            </div>

                            {/* Code block */}
                            <div className="relative">
                                <pre className="w-full bg-black/70 p-5 rounded-xl border border-white/[0.06] font-mono text-[11px] text-blue-200 overflow-x-auto leading-relaxed min-h-[130px] whitespace-pre">
                                    {getScript(scriptSub)}
                                </pre>
                                <button onClick={() => copy(getScript(scriptSub))}
                                    className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${copied ? 'bg-emerald-500 text-black' : 'bg-white/10 hover:bg-white/15 text-white'}`}>
                                    {copied ? <><CheckCircle2 className="w-3 h-3" />Copiado</> : <><Copy className="w-3 h-3" />Copiar</>}
                                </button>
                            </div>

                            {/* Info strip */}
                            <div className="flex items-start gap-3 p-4 bg-blue-500/[0.05] rounded-xl border border-blue-500/[0.1]">
                                <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                    El gateway configurado es <span className="text-blue-400 font-mono font-bold">{scriptSub.gateway}</span> con máscara <span className="font-mono text-slate-400">{scriptSub.mask}</span>. Rango útil: {scriptSub.firstUsable} – {scriptSub.lastUsable}.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── BINARY LINE COMPONENT ─────────────────────────────────────────────────────
function BinaryLine({ binary, cidr, isMask = false, label }) {
    const cidrNum = parseInt(cidr);
    const bits = binary.replace(/\./g, '');

    return (
        <div className="space-y-1.5">
            {label && <p className="text-[8px] text-slate-700 font-mono uppercase tracking-widest">{label}</p>}
            <div className="flex flex-wrap items-end gap-px font-mono">
                {bits.split('').map((bit, idx) => {
                    const isNet  = idx < cidrNum;
                    const isOct  = (idx + 1) % 8 === 0 && idx < 31;
                    return (
                        <span key={idx} className="inline-flex flex-col items-center">
                            <span className={`text-[11px] font-black leading-none px-[1px] ${
                                isNet
                                    ? (isMask ? 'text-blue-400' : 'text-cyan-400')
                                    : (isMask ? 'text-slate-700' : 'text-slate-700')
                            }`}>{bit}</span>
                            {isOct && <span className="text-[9px] text-slate-800 leading-none">·</span>}
                        </span>
                    );
                })}
            </div>
            {/* Ruler */}
            <div className="flex gap-px mt-0.5">
                {bits.split('').map((_, idx) => (
                    <div key={idx} className={`w-[10px] h-0.5 rounded-full ${idx < cidrNum ? 'bg-cyan-500/40' : 'bg-white/[0.04]'}`} />
                ))}
            </div>
        </div>
    );
}
