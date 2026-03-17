import { useState, useMemo } from 'react';
import { ChevronLeft, Copy, Plus, Trash2, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// IP LOGIC UTILS
const ipToLong = (ip) => ip.split('.').reduce((acc, o) => (acc << 8) + parseInt(o), 0) >>> 0;
const longToIp = (n) => [(n>>>24)&0xFF,(n>>>16)&0xFF,(n>>>8)&0xFF,n&0xFF].join('.');

const validateIp = (ip) => {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(p => { const n = Number(p); return /^\d+$/.test(p) && n >= 0 && n <= 255; });
};

const validateCIDR = (cidr) => {
    const num = parseInt(cidr);
    return num >= 0 && num <= 32;
};

const parseCIDR = (input) => {
    const parts = input.trim().split('/');
    if (parts.length !== 2) return null;
    const ip = parts[0].trim();
    const mask = parts[1].trim();
    if (!validateIp(ip) || !validateCIDR(mask)) return null;
    return { ip, mask: parseInt(mask) };
};

const getMask = (cidr) => {
    const mask = (0xffffffff << (32 - cidr)) >>> 0;
    return longToIp(mask);
};

const getNetwork = (ip, cidr) => {
    const ipLong = ipToLong(ip);
    const mask = (0xffffffff << (32 - cidr)) >>> 0;
    const netLong = ipLong & mask;
    return longToIp(netLong);
};

const getBroadcast = (ip, cidr) => {
    const ipLong = ipToLong(ip);
    const mask = (0xffffffff << (32 - cidr)) >>> 0;
    const netLong = ipLong & mask;
    const broadLong = netLong | (~mask >>> 0);
    return longToIp(broadLong);
};

const getFirstHost = (ip) => {
    const ipLong = ipToLong(ip);
    return longToIp((ipLong + 1) >>> 0);
};

const getLastHost = (broadcast) => {
    const bcLong = ipToLong(broadcast);
    return longToIp((bcLong - 1) >>> 0);
};

const getUsableHosts = (cidr) => {
    return Math.max(0, (1 << (32 - cidr)) - 2);
};

export default function VlsmCalculator() {
    const navigate = useNavigate();
    const [baseNetwork, setBaseNetwork] = useState('192.168.1.0/24');
    const [subnets, setSubnets] = useState([
        { id: 1, name: 'Red A', hosts: 120 },
        { id: 2, name: 'Red B', hosts: 50 },
        { id: 3, name: 'Red C', hosts: 20 },
    ]);
    const [nextId, setNextId] = useState(4);
    const [copied, setCopied] = useState('');

    const parsed = parseCIDR(baseNetwork);

    const calculateVLSM = useMemo(() => {
        if (!parsed) return { valid: false, results: [] };

        const { ip, mask } = parsed;
        const baseNet = getNetwork(ip, mask);
        const baseNetLong = ipToLong(baseNet);
        const baseMask = (0xffffffff << (32 - mask)) >>> 0;

        const sorted = [...subnets].sort((a, b) => b.hosts - a.hosts);

        let results = [];
        let currentNetLong = baseNetLong;
        let valid = true;

        for (const subnet of sorted) {
            const hostsNeeded = subnet.hosts;
            let requiredCidr = 30;
            for (let c = 30; c >= 0; c--) {
                if (getUsableHosts(c) >= hostsNeeded) {
                    requiredCidr = c;
                }
            }

            const subnetMask = (0xffffffff << (32 - requiredCidr)) >>> 0;
            const subnetNetLong = currentNetLong;
            const subnetNet = longToIp(subnetNetLong);

            if ((subnetNetLong & baseMask) !== baseNetLong) {
                valid = false;
                break;
            }

            const broadcast = getBroadcast(subnetNet, requiredCidr);
            const broadLong = ipToLong(broadcast);
            const firstHost = getFirstHost(subnetNet);
            const lastHost = getLastHost(broadcast);
            const usable = getUsableHosts(requiredCidr);

            results.push({
                ...subnet,
                network: subnetNet,
                mask: getMask(requiredCidr),
                cidr: requiredCidr,
                broadcast,
                firstHost,
                lastHost,
                usable,
            });

            currentNetLong = (broadLong + 1) >>> 0;

            const baseNetBroadcast = ipToLong(getBroadcast(baseNet, mask));
            if (currentNetLong > baseNetBroadcast) {
                valid = false;
                break;
            }
        }

        return { valid, results };
    }, [baseNetwork, subnets]);

    const addSubnet = () => {
        setSubnets([...subnets, { id: nextId, name: `Red ${String.fromCharCode(65 + subnets.length)}`, hosts: 10 }]);
        setNextId(nextId + 1);
    };

    const removeSubnet = (id) => {
        setSubnets(subnets.filter(s => s.id !== id));
    };

    const updateSubnet = (id, field, value) => {
        setSubnets(subnets.map(s => s.id === id ? { ...s, [field]: field === 'hosts' ? parseInt(value) || 0 : value } : s));
    };

    const copyResults = () => {
        let text = `VLSM Calculator Results\n`;
        text += `Base Network: ${baseNetwork}\n\n`;
        calculateVLSM.results.forEach(r => {
            text += `${r.name}:\n`;
            text += `  Network: ${r.network}/${r.cidr}\n`;
            text += `  Mask: ${r.mask}\n`;
            text += `  Broadcast: ${r.broadcast}\n`;
            text += `  First Host: ${r.firstHost}\n`;
            text += `  Last Host: ${r.lastHost}\n`;
            text += `  Usable Hosts: ${r.usable}\n\n`;
        });
        navigator.clipboard.writeText(text);
        setCopied('results');
        setTimeout(() => setCopied(''), 1500);
    };

    const allocationPercentage = useMemo(() => {
        if (!parsed) return 0;
        const { mask } = parsed;
        const totalAddresses = 1 << (32 - mask);
        const usedAddresses = calculateVLSM.results.reduce((sum, r) => sum + (1 << (32 - r.cidr)), 0);
        return Math.round((usedAddresses / totalAddresses) * 100);
    }, [parsed, calculateVLSM]);

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
                                <h1 className="text-base font-black uppercase tracking-tight text-white leading-none">Calculadora <span className="text-blue-400">VLSM</span></h1>
                                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Subredes Variables · Asignación Óptima</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 max-w-6xl mx-auto space-y-8">
                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                        <div className="px-6 py-4 border-b border-white/[0.05]">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Red Base (CIDR)</span>
                        </div>
                        <div className="p-6 flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2 block">Ej: 192.168.1.0/24</label>
                                <input
                                    value={baseNetwork}
                                    onChange={e => setBaseNetwork(e.target.value)}
                                    placeholder="192.168.0.0/16"
                                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-lg font-mono text-blue-400 outline-none focus:border-blue-500/40 transition-all"
                                />
                            </div>
                            {!parsed && baseNetwork && (
                                <div className="text-red-400 text-[10px] font-mono">Formato inválido</div>
                            )}
                        </div>
                    </div>

                    {parsed && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                    <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Subredes Requeridas</span>
                                        <button
                                            onClick={addSubnet}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 border border-blue-500/25 rounded-lg text-blue-400 text-[9px] font-black uppercase tracking-widest hover:bg-blue-500/25 transition-all"
                                        >
                                            <Plus className="w-3 h-3" /> Agregar
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-3">
                                        {subnets.map(subnet => (
                                            <div key={subnet.id} className="flex gap-3 items-end p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                                                <input
                                                    value={subnet.name}
                                                    onChange={e => updateSubnet(subnet.id, 'name', e.target.value)}
                                                    placeholder="Nombre"
                                                    className="flex-1 bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/40 transition-all"
                                                />
                                                <input
                                                    type="number"
                                                    value={subnet.hosts}
                                                    onChange={e => updateSubnet(subnet.id, 'hosts', e.target.value)}
                                                    placeholder="Hosts"
                                                    className="w-20 bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/40 transition-all"
                                                />
                                                <button
                                                    onClick={() => removeSubnet(subnet.id)}
                                                    className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {calculateVLSM.valid && (
                                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                        <div className="px-6 py-4 border-b border-white/[0.05]">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Uso de Espacio</span>
                                        </div>
                                        <div className="p-6 space-y-3">
                                            <div className="flex items-center justify-between text-[10px] mb-2">
                                                <span className="text-slate-400">Asignado</span>
                                                <span className="text-blue-400 font-mono font-black">{allocationPercentage}%</span>
                                            </div>
                                            <div className="w-full h-3 bg-black/40 rounded-full border border-white/[0.08] overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                                                    style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {!calculateVLSM.valid && parsed && (
                                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] text-red-400 text-[10px]">
                                        No hay suficiente espacio. Intenta con una red base mayor o reduce los hosts requeridos.
                                    </div>
                                )}

                                {calculateVLSM.valid && calculateVLSM.results.length > 0 && (
                                    <>
                                        <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                            <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Asignaciones VLSM</span>
                                                <button
                                                    onClick={copyResults}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                        copied === 'results'
                                                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                                                            : 'bg-blue-500/15 border border-blue-500/25 text-blue-400 hover:bg-blue-500/25'
                                                    }`}
                                                >
                                                    {copied === 'results' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                    Copiar
                                                </button>
                                            </div>
                                            <div className="p-6 overflow-x-auto">
                                                <table className="w-full text-[9px] font-mono">
                                                    <thead>
                                                        <tr className="border-b border-white/[0.08] text-slate-500">
                                                            <th className="text-left py-2 px-2 font-black uppercase">Red</th>
                                                            <th className="text-left py-2 px-2 font-black uppercase">/CIDR</th>
                                                            <th className="text-left py-2 px-2 font-black uppercase">Red</th>
                                                            <th className="text-left py-2 px-2 font-black uppercase">Máscara</th>
                                                            <th className="text-left py-2 px-2 font-black uppercase">Hosts</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {calculateVLSM.results.map((r) => (
                                                            <tr key={r.id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                                                                <td className="py-3 px-2 text-blue-400 font-black">{r.name}</td>
                                                                <td className="py-3 px-2 text-cyan-400">/{r.cidr}</td>
                                                                <td className="py-3 px-2 text-white">{r.network}</td>
                                                                <td className="py-3 px-2 text-violet-400">{r.mask}</td>
                                                                <td className="py-3 px-2 text-emerald-400">{r.usable}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                            {calculateVLSM.results.map(r => (
                                                <div key={r.id} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-[10px] font-black text-blue-400 uppercase">{r.name}</h3>
                                                        <span className="text-[9px] font-mono text-cyan-400">/{r.cidr}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
                                                        <div className="text-slate-400">Red: <span className="text-white">{r.network}</span></div>
                                                        <div className="text-slate-400">Máscara: <span className="text-violet-400">{r.mask}</span></div>
                                                        <div className="text-slate-400">Primera: <span className="text-emerald-400">{r.firstHost}</span></div>
                                                        <div className="text-slate-400">Última: <span className="text-emerald-400">{r.lastHost}</span></div>
                                                        <div className="text-slate-400">Broadcast: <span className="text-orange-400">{r.broadcast}</span></div>
                                                        <div className="text-slate-400">Usables: <span className="text-blue-400">{r.usable}</span></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                        <div className="px-6 py-4 border-b border-white/[0.05]">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">¿Qué es VLSM?</span>
                        </div>
                        <div className="p-6 space-y-3 text-[10px] leading-relaxed text-slate-400">
                            <p>VLSM (<strong>Variable Length Subnet Mask</strong>) permite asignar máscaras de subred de diferentes longitudes dentro de una misma red.</p>
                            <p>Esta calculadora ordena subredes de mayor a menor, aplicando la mejor práctica VLSM para evitar fragmentación y maximizar eficiencia.</p>
                            <p>Cada subred recibe el CIDR mínimo necesario, reduciendo el desperdicio de direcciones IP.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
