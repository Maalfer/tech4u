import { useState, useEffect } from 'react';
import {
    Network, Calculator, ArrowRight, Save, Trash2, Plus, Info,
    ChevronLeft, Download, Eye, EyeOff, Trophy, HelpCircle,
    ChevronDown, ChevronUp, FileText, CheckCircle2, XCircle,
    Terminal, Copy, Monitor, Cpu as CpuIcon, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// ── IP LOGIC UTILS ──────────────────────────────────────────────────────────
const ipToLong = (ip) => ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
const longToIp = (long) => [(long >>> 24) & 0xFF, (long >>> 16) & 0xFF, (long >>> 8) & 0xFF, long & 0xFF].join('.');
const getWildcard = (mask) => (~mask) >>> 0;
const longToBinary = (long) => {
    let bin = (long >>> 0).toString(2).padStart(32, '0');
    return [bin.slice(0, 8), bin.slice(8, 16), bin.slice(16, 24), bin.slice(24, 32)].join('.');
};

export default function SubnetCalculator() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('FLSM'); // 'FLSM' or 'VLSM'
    const [baseIp, setBaseIp] = useState('192.168.1.0');
    const [baseCidr, setBaseCidr] = useState(24);

    // UI State
    const [showBinary, setShowBinary] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [challengeMode, setChallengeMode] = useState(false);
    const [results, setResults] = useState([]);

    // FLSM State
    const [subnetCount, setSubnetCount] = useState(4);

    // VLSM State
    const [requirements, setRequirements] = useState([
        { id: 1, name: 'Ventas', hosts: 50 },
        { id: 2, name: 'RRHH', hosts: 20 },
    ]);

    // Challenge Mode State
    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [showSolution, setShowSolution] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);

    // Command Generator State
    const [selectedSubnetForScript, setSelectedSubnetForScript] = useState(null);
    const [scriptType, setScriptType] = useState('cisco'); // 'cisco', 'linux', 'windows'
    const [copied, setCopied] = useState(false);

    const addRequirement = () => {
        setRequirements([...requirements, { id: Date.now(), name: '', hosts: 0 }]);
    };

    const removeRequirement = (id) => {
        setRequirements(requirements.filter(r => r.id !== id));
    };

    // ── CALCULATION LOGIC ────────────────────────────────────────────────────
    const calculateFLSM = () => {
        try {
            const baseLong = ipToLong(baseIp);
            const bitsNeeded = Math.ceil(Math.log2(subnetCount));
            const newCidr = baseCidr + bitsNeeded;

            if (newCidr > 32) throw new Error("Bloque insuficiente para tantas subredes.");

            const subnets = [];
            const subnetSize = Math.pow(2, 32 - newCidr);

            for (let i = 0; i < subnetCount; i++) {
                const networkLong = (baseLong + (i * subnetSize)) >>> 0;
                const broadcastLong = (networkLong + subnetSize - 1) >>> 0;
                const maskLong = (0xFFFFFFFF << (32 - newCidr)) >>> 0;

                subnets.push({
                    id: i + 1,
                    network: longToIp(networkLong),
                    mask: longToIp(maskLong),
                    cidr: `/${newCidr}`,
                    gateway: longToIp(networkLong + 1),
                    range: `${longToIp(networkLong + 2)} - ${longToIp(broadcastLong - 1)}`,
                    broadcast: longToIp(broadcastLong),
                    wildcard: longToIp(getWildcard(maskLong)),
                    hosts: subnetSize - 2,
                    binary: longToBinary(networkLong),
                    maskBinary: longToBinary(maskLong)
                });
            }
            setResults(subnets);
            setChallengeMode(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const calculateVLSM = () => {
        try {
            const sortedReqs = [...requirements].sort((a, b) => b.hosts - a.hosts);
            let currentLong = ipToLong(baseIp);
            const subnets = [];

            sortedReqs.forEach((req, idx) => {
                let power = 0;
                while (Math.pow(2, power) < (parseInt(req.hosts) + 2)) power++;
                const size = Math.pow(2, power);
                const cidr = 32 - power;

                const networkLong = currentLong;
                const broadcastLong = (networkLong + size - 1) >>> 0;
                const maskLong = (0xFFFFFFFF << (32 - cidr)) >>> 0;

                subnets.push({
                    id: idx + 1,
                    name: req.name || `Subred ${idx + 1}`,
                    network: longToIp(networkLong),
                    mask: longToIp(maskLong),
                    cidr: `/${cidr}`,
                    gateway: longToIp(networkLong + 1),
                    range: `${longToIp(networkLong + 2)} - ${longToIp(broadcastLong - 1)}`,
                    broadcast: longToIp(broadcastLong),
                    wildcard: longToIp(getWildcard(maskLong)),
                    hosts: size - 2,
                    requested: req.hosts,
                    binary: longToBinary(networkLong),
                    maskBinary: longToBinary(maskLong)
                });
                currentLong = (broadcastLong + 1) >>> 0;
            });
            setResults(subnets);
            setChallengeMode(false);
        } catch (err) {
            alert("Error en el cálculo. Verifica los datos.");
        }
    };

    // ── GAME LOGIC ───────────────────────────────────────────────────────────
    const generateChallenge = () => {
        const types = ['/24', '/16', '/8'];
        const prefixes = [24, 16, 8];
        const r = Math.floor(Math.random() * 3);
        const ip = r === 0 ? '192.168.1.0' : (r === 1 ? '172.16.0.0' : '10.0.0.0');
        const reqHosts = [10, 20, 50, 100, 200, 500][Math.floor(Math.random() * 6)];

        // Logical answer
        let power = 0;
        while (Math.pow(2, power) < (reqHosts + 2)) power++;
        const correctCidr = 32 - power;

        setCurrentChallenge({
            ip: ip,
            cidr: prefixes[r],
            hosts: reqHosts,
            correctCidr: correctCidr,
            mask: longToIp((0xFFFFFFFF << (32 - correctCidr)) >>> 0)
        });
        setUserAnswer('');
        setIsCorrect(null);
        setShowSolution(false);
        setChallengeMode(true);
        setResults([]);
    };

    const checkChallenge = () => {
        if (parseInt(userAnswer) === currentChallenge.correctCidr) {
            setIsCorrect(true);
        } else {
            setIsCorrect(false);
        }
    };

    // ── EXPORT LOGIC ────────────────────────────────────────────────────────
    const exportCSV = () => {
        const headers = "ID/Nombre,Red,Mascara,CIDR,Rango,Broadcast\n";
        const rows = results.map(s => `${s.name || s.id},${s.network},${s.mask},${s.cidr},${s.range},${s.broadcast}`).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'subredes_academy.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const getScript = (sub) => {
        if (!sub) return '';
        const mask = sub.mask;
        const gateway = sub.gateway;
        const net = sub.network;

        switch (scriptType) {
            case 'cisco':
                return `! Configuración para ${sub.name || 'Subred ' + sub.id}\ninterface GigabitEthernet0/0\n ip address ${gateway} ${mask}\n no shutdown\n exit`;
            case 'linux':
                return `# Netplan config for ${sub.name || 'Subred ' + sub.id}\nnetwork:\n  version: 2\n  ethernets:\n    eth0:\n      addresses:\n        - ${gateway}${sub.cidr}\n      routes:\n        - to: default\n          via: ${gateway}`;
            case 'windows':
                return `# PowerShell config for ${sub.name || 'Subred ' + sub.id}\nNew-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress ${gateway} -PrefixLength ${sub.cidr.slice(1)} -DefaultGateway ${gateway}`;
            default:
                return '';
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative overflow-y-auto h-screen custom-scrollbar">

                {/* Header Actions */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate('/tools')}
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest"
                    >
                        <ChevronLeft className="w-4 h-4" /> Herramientas
                    </button>

                    <div className="flex gap-4">
                        <button
                            onClick={exportCSV}
                            disabled={results.length === 0}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-20 transition-all"
                        >
                            <Download className="w-3.5 h-3.5" /> CSV
                        </button>
                        <button
                            onClick={() => setShowTutorial(!showTutorial)}
                            className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${showTutorial ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                            <HelpCircle className="w-3.5 h-3.5" /> Tutorial
                        </button>
                        <button
                            onClick={generateChallenge}
                            className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${challengeMode ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                            <Trophy className="w-3.5 h-3.5" /> Desafío
                        </button>
                    </div>
                </div>

                {/* Tutorial Section */}
                {showTutorial && (
                    <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <section className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-8 backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-6">
                                <Info className="w-6 h-6 text-amber-400" />
                                <h2 className="text-xl font-black uppercase italic tracking-tight text-amber-200">Guía de Aprendizaje: Subnetting</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed text-slate-300">
                                <div>
                                    <h3 className="font-mono text-[11px] uppercase tracking-widest text-amber-400 mb-3 border-b border-amber-400/20 pb-1">1. FLSM (Fixed Length)</h3>
                                    <p className="mb-3">Se usa cuando quieres dividir una red en partes **exactamente iguales**. </p>
                                    <ul className="space-y-2 list-disc ml-4 font-medium">
                                        <li>Fórmula: 2^n ≥ número de subredes.</li>
                                        <li>Ejemplo: Para 4 subredes, n=2 bits prestados.</li>
                                        <li>Si eres /24, pasas a ser /26 (24+2).</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-mono text-[11px] uppercase tracking-widest text-amber-400 mb-3 border-b border-amber-400/20 pb-1">2. VLSM (Variable Length)</h3>
                                    <p className="mb-3">Es el método moderno. Evita desperdiciar IPs asignando a cada red **solo lo que necesita**.</p>
                                    <ul className="space-y-2 list-disc ml-4 font-medium">
                                        <li>Se ordena siempre de **MAYOR a MENOR** necesidad de hosts.</li>
                                        <li>Se busca la potencia de 2 que cubra (Hosts + 2).</li>
                                        <li>Cada subred puede tener su propio prefijo CIDR.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Control Panel */}
                    <div className="w-full lg:w-[400px] space-y-6 sticky top-8">

                        {challengeMode ? (
                            <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 backdrop-blur-sm animate-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <Trophy className="w-6 h-6 text-emerald-400" />
                                    <h2 className="text-sm font-black uppercase tracking-widest text-emerald-300">Reto de Academia</h2>
                                </div>

                                <div className="p-4 bg-black/40 rounded-2xl border border-emerald-500/10 mb-6">
                                    <p className="text-xs text-slate-400 mb-2">Tienes una red:</p>
                                    <p className="text-xl font-mono font-bold text-white mb-4">{currentChallenge.ip}{currentChallenge.cidr}</p>
                                    <p className="text-xs text-slate-300 leading-relaxed uppercase tracking-tighter">
                                        ¿Qué prefijo <span className="text-emerald-400 font-bold">CIDR</span> necesitas para albergar exactamente <span className="text-emerald-400 font-bold">{currentChallenge.hosts} hosts</span> utilizables?
                                    </p>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="number"
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        className="flex-1 bg-black border border-white/10 rounded-xl px-4 text-center font-mono font-bold text-emerald-400 outline-none focus:border-emerald-500/50"
                                        placeholder="/"
                                    />
                                    <button
                                        onClick={checkChallenge}
                                        className="px-6 py-3 bg-emerald-500 text-black font-black uppercase text-[10px] rounded-xl hover:bg-emerald-400 transition-all"
                                    >Comprobar</button>
                                </div>

                                {isCorrect !== null && (
                                    <div className={`p-3 rounded-xl flex items-center gap-3 mb-4 ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        <p className="text-[10px] font-bold uppercase tracking-widest">{isCorrect ? '¡Correcto! Eres un hacha.' : 'Casi... Inténtalo de nuevo.'}</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowSolution(!showSolution)}
                                    className="w-full py-2 text-[9px] uppercase font-mono text-slate-500 hover:text-white"
                                >{showSolution ? 'Ocultar Solución' : 'Ver Razonamiento'}</button>

                                {showSolution && (
                                    <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5 text-[10px] font-medium leading-relaxed text-slate-400">
                                        <p>Para {currentChallenge.hosts} hosts necesitas un bloque que soporte {currentChallenge.hosts + 2} IPs totales.
                                            La potencia de 2 más cercana es {Math.pow(2, 32 - currentChallenge.correctCidr)}.
                                            Como 2^(32 - prefijo) = IPs, el prefijo es **{currentChallenge.correctCidr}**.</p>
                                    </div>
                                )}
                            </section>
                        ) : (
                            <>
                                <section className="bg-stone-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                                            <Network className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <h1 className="text-xl font-black uppercase tracking-tight italic">Subnetting <span className="text-blue-400">Pro</span></h1>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] uppercase font-mono text-slate-500 tracking-widest mb-1.5 ml-1">Red Base (Network IP)</label>
                                            <input
                                                type="text"
                                                value={baseIp}
                                                onChange={(e) => setBaseIp(e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all font-mono"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-white">
                                            <div>
                                                <label className="block text-[10px] uppercase font-mono text-slate-500 tracking-widest mb-1.5 ml-1">Cidr Base</label>
                                                <input
                                                    type="number"
                                                    value={baseCidr}
                                                    onChange={(e) => setBaseCidr(parseInt(e.target.value))}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 font-mono outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase font-mono text-slate-500 tracking-widest mb-1.5 ml-1">Modo</label>
                                                <div className="flex bg-black/50 border border-white/10 rounded-xl p-1 h-[46px]">
                                                    <button onClick={() => setMode('FLSM')} className={`flex-1 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'FLSM' ? 'bg-blue-500 text-white' : 'text-slate-500'}`}>FLSM</button>
                                                    <button onClick={() => setMode('VLSM')} className={`flex-1 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'VLSM' ? 'bg-blue-500 text-white' : 'text-slate-500'}`}>VLSM</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-stone-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                                    {mode === 'FLSM' ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] uppercase font-mono text-slate-500 tracking-widest mb-1.5 ml-1">Número de Subredes</label>
                                                <input
                                                    type="number"
                                                    value={subnetCount}
                                                    onChange={(e) => setSubnetCount(parseInt(e.target.value))}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                                                />
                                            </div>
                                            <button onClick={calculateFLSM} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-xs shadow-lg transition-all active:scale-95">Generar Subredes</button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {requirements.map((req, idx) => (
                                                    <div key={req.id} className="flex gap-2">
                                                        <input
                                                            placeholder="Dep"
                                                            value={req.name}
                                                            onChange={(e) => {
                                                                const n = [...requirements];
                                                                n[idx].name = e.target.value;
                                                                setRequirements(n);
                                                            }}
                                                            className="flex-1 bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-xs outline-none"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Hosts"
                                                            value={req.hosts}
                                                            onChange={(e) => {
                                                                const n = [...requirements];
                                                                n[idx].hosts = e.target.value;
                                                                setRequirements(n);
                                                            }}
                                                            className="w-20 bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-xs font-mono outline-none"
                                                        />
                                                        <button onClick={() => removeRequirement(req.id)} className="p-2 text-slate-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={addRequirement} className="w-full py-2 border border-dashed border-white/10 text-slate-500 rounded-xl text-[10px] font-bold uppercase hover:bg-white/5">+ Añadir Hosts</button>
                                            <button onClick={calculateVLSM} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-xs shadow-lg active:scale-95">Calcular VLSM</button>
                                        </div>
                                    )}
                                </section>
                            </>
                        )}

                        {/* Visual Usage Widget */}
                        {results.length > 0 && (
                            <section className="bg-stone-900/40 border border-white/5 rounded-3xl p-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex justify-between">
                                    Consumo de IPs <span>{Math.round((results.reduce((a, b) => a + b.hosts + 2, 0) / Math.pow(2, 32 - baseCidr)) * 100)}%</span>
                                </h3>
                                <div className="h-3 bg-black rounded-full overflow-hidden flex">
                                    {results.map((s, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-full ${idx % 2 === 0 ? 'bg-blue-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${((s.hosts + 2) / Math.pow(2, 32 - baseCidr)) * 100}%` }}
                                            title={s.name || s.id}
                                        />
                                    ))}
                                </div>
                                <p className="text-[9px] text-slate-600 italic mt-2 uppercase tracking-tight font-medium">Bloque total: {Math.pow(2, 32 - baseCidr)} IPs</p>
                            </section>
                        )}
                    </div>

                    {/* Results Container */}
                    <div className="flex-1 w-full space-y-6">
                        {results.length > 0 ? (
                            <div className="space-y-6">
                                {/* Dashboard View Toggle */}
                                <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
                                    <button
                                        onClick={() => setShowBinary(false)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${!showBinary ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-white'}`}
                                    > <FileText className="w-3 h-3" /> Tabla Datos </button>
                                    <button
                                        onClick={() => setShowBinary(true)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${showBinary ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-white'}`}
                                    > <Eye className="w-3 h-3" /> Vista Binaria </button>
                                </div>

                                {showBinary ? (
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {results.map((sub, idx) => (
                                            <div key={idx} className="bg-stone-900/60 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="text-sm font-black uppercase italic text-blue-400">{sub.name || `Subred ${sub.id}`}</h4>
                                                    <span className="text-[10px] font-mono text-slate-500">{sub.cidr}</span>
                                                </div>
                                                <div className="space-y-4 font-mono">
                                                    <div>
                                                        <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-1">Network: {sub.network}</p>
                                                        <BinaryLine binary={sub.binary} cidr={sub.cidr.slice(1)} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-1">Mask: {sub.mask}</p>
                                                        <BinaryLine binary={sub.maskBinary} cidr={sub.cidr.slice(1)} isMask />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-stone-900/60 border border-white/5 rounded-[2.5rem] overflow-hidden overflow-x-auto backdrop-blur-md">
                                        <table className="w-full text-left font-mono min-w-[800px]">
                                            <thead>
                                                <tr className="bg-white/2">
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">Subred / ID</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">Red (Network)</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">Default Gateway</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">Usable Range</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">Broadcast</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5 text-right">Scripts</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">Mascara (Wildcard)</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">Hosts Totales</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {results.map((sub, idx) => (
                                                    <tr key={idx} className="hover:bg-blue-500/5 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 flex items-center justify-center bg-white/5 rounded text-[10px] text-slate-400">{sub.id}</span>
                                                                <span className="text-xs font-bold text-white uppercase truncate max-w-[120px]">{sub.name || '-'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-bold text-blue-400">{sub.network}<span className="text-slate-600 ml-1">{sub.cidr}</span></td>
                                                        <td className="px-6 py-4 text-[11px] text-amber-400/90 font-bold">{sub.gateway}</td>
                                                        <td className="px-6 py-4 text-[11px] text-slate-300">{sub.range}</td>
                                                        <td className="px-6 py-4 text-xs text-red-400/80 font-bold">{sub.broadcast}</td>
                                                        <td className="px-6 py-4 text-xs">
                                                            <p className="text-white leading-none mb-1">{sub.mask}</p>
                                                            <p className="text-[9px] text-slate-600">WC: {sub.wildcard}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-[11px] font-black text-emerald-400 italic">
                                                            {sub.hosts} <span className="text-slate-600 text-[9px] font-normal not-italic">{sub.requested && `(Req: ${sub.requested})`}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => setSelectedSubnetForScript(sub)}
                                                                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all group-hover:scale-110"
                                                                title="Generar Comandos"
                                                            >
                                                                <Terminal className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full min-h-[500px] border border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center opacity-30 text-center px-16 animate-pulse">
                                <Calculator className="w-16 h-16 mb-8 text-blue-500" />
                                <h3 className="text-xl font-black uppercase italic tracking-widest mb-3">Calculadora Operativa</h3>
                                <p className="text-xs font-medium max-w-sm leading-relaxed">Asigna tus parámetros de red a la izquierda. Si necesitas aprender, pulsa el botón de tutorial superior.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Command Generator Modal */}
                {selectedSubnetForScript && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-stone-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                                <div className="flex items-center gap-3">
                                    <Terminal className="w-5 h-5 text-blue-400" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Generador de Comandos</h3>
                                </div>
                                <button onClick={() => setSelectedSubnetForScript(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8">
                                <p className="text-xs text-slate-400 mb-6 font-medium">Configuración sugerida para <span className="text-blue-400 font-bold uppercase">{selectedSubnetForScript.name || 'Subred ' + selectedSubnetForScript.id}</span></p>

                                <div className="flex gap-2 p-1 bg-black rounded-2xl border border-white/5 mb-6">
                                    {[
                                        { id: 'cisco', label: 'Cisco IOS', icon: CpuIcon },
                                        { id: 'linux', label: 'Linux (Netplan)', icon: Terminal },
                                        { id: 'windows', label: 'Windows (PS)', icon: Monitor }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setScriptType(opt.id)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${scriptType === opt.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            <opt.icon className="w-3.5 h-3.5" /> {opt.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative group">
                                    <pre className="w-full bg-black p-6 rounded-2xl border border-white/10 font-mono text-[11px] text-blue-100 overflow-x-auto min-h-[140px] leading-relaxed">
                                        {getScript(selectedSubnetForScript)}
                                    </pre>
                                    <button
                                        onClick={() => copyToClipboard(getScript(selectedSubnetForScript))}
                                        className={`absolute top-4 right-4 px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2 shadow-xl ${copied ? 'bg-emerald-500 text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                    >
                                        {copied ? <><CheckCircle2 className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                                    </button>
                                </div>

                                <div className="mt-8 flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                    <Info className="w-4 h-4 text-blue-400 shrink-0" />
                                    <p className="text-[10px] text-slate-400 leading-normal">
                                        Estos comandos configuran la interfaz con la dirección IP seleccionada como **Gateway** ({selectedSubnetForScript.gateway}) y su máscara correspondiente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function BinaryLine({ binary, cidr, isMask = false }) {
    const cidrNum = parseInt(cidr);
    const bits = binary.replace(/\./g, '');

    return (
        <div className="flex flex-wrap gap-0.5 text-[10px] leading-tight">
            {bits.split('').map((bit, idx) => {
                const isNetwork = idx < cidrNum;
                return (
                    <div key={idx} className="flex flex-col items-center">
                        <span className={`font-bold ${isNetwork ? (isMask ? 'text-blue-400' : 'text-cyan-400') : 'text-slate-600'}`}>
                            {bit}
                        </span>
                        {(idx + 1) % 8 === 0 && idx < 31 && <span className="mx-0.5 text-slate-800">.</span>}
                    </div>
                );
            })}
        </div>
    );
}
