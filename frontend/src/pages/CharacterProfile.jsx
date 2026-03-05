import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, ArrowLeft, Shield, Swords, Activity,
    Crosshair, Zap, Database, Globe, Terminal,
    BookOpen, Cpu, FileCode, CheckCircle, Flame,
    Coffee, Star, Info, Gift, Lock
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Import character assets (placeholder until 20 custom images are ready)
import guerreroImg from '../assets/guerrero-hacker.png';
import magaImg from '../assets/maga-hacker.png';

// ── Item Catalog List ────────────────────────────────────────────────────────
const ITEM_CATALOG_LIST = [
    { key: "cable_rj45", name: "Cable RJ45", emoji: "🔌", rarity: "comun", desc: "Un cable crimpado a mano. Casi funciona." },
    { key: "usb_random", name: "USB sin etiquetar", emoji: "💾", rarity: "comun", desc: "No sabes qué hay dentro. Mejor no conectarlo." },
    { key: "post_it_config", name: "Post-it de Config", emoji: "📝", rarity: "comun", desc: "Garabatos ilegibles que eran comandos de red." },
    { key: "keyboard_basic", name: "Teclado de Membrana", emoji: "⌨️", rarity: "comun", desc: "El arma del principiante." },
    { key: "monitor_old", name: "Monitor CRT", emoji: "🖥️", rarity: "comun", desc: "Pesa 20 kg. Pero ¿a qué resolución llega?" },
    { key: "manual_asir", name: "Manual ASIR Fotocopiado", emoji: "📚", rarity: "comun", desc: "Subrayado en 5 colores por generaciones anteriores." },
    { key: "switch_managed", name: "Switch Gestionable", emoji: "🔀", rarity: "raro", desc: "VLANs ilimitadas. Casi ilimitadas." },
    { key: "keyboard_mech", name: "Teclado Mecánico", emoji: "⌨️", rarity: "raro", desc: "Cherry MX Red. Se oye desde el pasillo." },
    { key: "vpn_scroll", name: "Pergamino VPN", emoji: "📜", rarity: "raro", desc: "Conecta dos redes remotas sin que nadie lo sepa." },
    { key: "pendrive_boot", name: "Pendrive Booteable", emoji: "💾", rarity: "raro", desc: "Tiene Kali, Ubuntu y algo más raro." },
    { key: "glasses_filter", name: "Gafas Filtro Azul", emoji: "🕶️", rarity: "raro", desc: "Para los 14 monitores que tienes a la vez." },
    { key: "firewall_elite", name: "Firewall de Élite", emoji: "🔥", rarity: "epico", desc: "Bloquea hasta los paquetes que no existen." },
    { key: "server_rack", name: "Rack de Servidores", emoji: "🖥️", rarity: "epico", desc: "Temperatura: 5ºC. Ruido: ensordecedor." },
    { key: "script_bash", name: "Script Automatizador", emoji: "📝", rarity: "epico", desc: "Un script que hace lo que 10 admins tardarían un día." },
    { key: "cert_cisco", name: "Certificado Cisco", emoji: "🏅", rarity: "epico", desc: "Vale máximo? Ya mismo entra en vigor." },
    { key: "ssh_key_god", name: "Clave SSH del Root", emoji: "🔑", rarity: "legendario", desc: "Acceso total a cualquier servidor del planeta Tierra." },
    { key: "keyboard_legendary", name: "Teclado Legendario", emoji: "⌨️", rarity: "legendario", desc: "Cada pulsación ejecuta comandos perfectos." },
    { key: "bgp_tome", name: "Tomo del BGP", emoji: "📚", rarity: "legendario", desc: "El libro que solo 12 personas en el mundo entienden." },
    { key: "quantum_drink", name: "Bebida Cuántica", emoji: "⚗️", rarity: "legendario", desc: "+999 Velocidad Mental. Sabor: electrones." },
];

export default function CharacterProfile() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/dashboard/stats'),
            api.get('/tests/inventory')
        ])
            .then(([statsRes, invRes]) => {
                setStats(statsRes.data);
                setInventory(invRes.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0D0D0D] items-center justify-center">
                <div className="w-10 h-10 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // RPG Calculations
    const currentXP = stats?.current_xp || 0;
    const nextLevelXP = stats?.next_level_xp || 1000;
    const progressXP = Math.min((currentXP / nextLevelXP) * 100, 100);
    const level = stats?.level || 1;

    // Choose avatar based on level (Placeholder logic)
    const avatarImg = level % 2 === 0 ? magaImg : guerreroImg;
    const rankName = stats?.rank_name || 'Novato Digital';

    // Helper functions for ASIR Stats
    const getSubjectAcc = (subjectKey) => {
        const sub = stats?.subjects?.find(s => s.subject === subjectKey);
        return sub ? Math.round(sub.accuracy) : 0;
    };

    // Mapping ASIR subjects to RPG Stats
    const redAcc = getSubjectAcc('Redes');
    const dbAcc = getSubjectAcc('Bases de Datos');
    const osAcc = getSubjectAcc('Sistemas Operativos');
    const hwAcc = getSubjectAcc('Fundamentos de Hardware');
    const cyberAcc = getSubjectAcc('Ciberseguridad');
    const webAcc = getSubjectAcc('Lenguaje de Marcas');

    // Pseudo-RPG Base Stats derived from level and interaction
    const totalTests = stats?.subjects?.reduce((sum, s) => sum + s.tests_taken, 0) || 0;
    const maxHP = 100 + (level * 20);
    const currentHP = maxHP; // In a real game this would drain, for now we keep it full.
    const maxMP = 50 + (level * 10);
    const currentMP = maxMP;

    return (
        <div className="flex min-h-screen bg-[#020510] selection:bg-neon selection:text-black overflow-hidden relative">

            {/* Base Background: Deep Space/Cyber Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020510] to-[#020510] -z-20" />

            {/* Animated Grid lines (subtle) */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTkgMEgwVjU5IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)] -z-10" />

            {/* Glowing orbs */}
            <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full -z-10 animate-pulse delay-700" />
            <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10" />

            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative z-10 overflow-y-auto h-screen custom-scrollbar">

                {/* Background ambient effect */}
                <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -z-10 animate-pulse" />

                {/* ── Header ── */}
                <header className="mb-10 flex justify-between items-end relative z-10">
                    <div className="animate-in fade-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-5 mb-4">
                            <button onClick={() => navigate('/dashboard')} className="p-4 rounded-2xl text-slate-500 hover:text-white border border-transparent hover:border-white/30 hover:bg-white/10 transition-all bg-black/40 mb-1 active:scale-95 shadow-2xl backdrop-blur-xl group">
                                <ArrowLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                            </button>

                            <div className="relative group">
                                <div className="absolute -inset-2 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-transparent rounded-2xl border-2 border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden backdrop-blur-xl">
                                    <User className="w-10 h-10 text-blue-500 group-hover:rotate-[15deg] transition-transform duration-500" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-500 drop-shadow-sm">
                                    Per<span className="text-white">sonaje</span>
                                </h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="h-px w-8 bg-blue-500/50" />
                                    <p className="text-[10px] font-mono text-blue-500/70 uppercase tracking-[0.4em] font-black">
                                        Hoja de Atributos ASIR
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── JRPG Character Sheet Container ── */}
                <div className="max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-500">

                    {/* Main Frame (Retro JRPG style adapted to modern Tech UI) */}
                    <div className="bg-[#0b101e]/90 border-[3px] border-[#3b5998] rounded-xl shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden relative backdrop-blur-md">

                        {/* Inner gold/yellow border accent to match typical FF menus */}
                        <div className="absolute inset-1 border border-yellow-500/30 rounded-lg pointer-events-none" />

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-stretch">

                            {/* LEFT COLUMN: Avatar & Identity */}
                            <div className="lg:col-span-5 flex flex-col items-center relative">

                                {/* Avatar Portrait Box (Freestanding) - flex-1 so it fills remaining space */}
                                <div className="w-full flex-1 min-h-[300px] relative flex items-end justify-center group mb-[-8px]">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/20 blur-[60px] rounded-full -z-10 group-hover:bg-blue-400/30 transition-colors duration-700" />
                                    <img
                                        src={avatarImg}
                                        alt="Character Avatar"
                                        className="w-auto max-w-full h-full max-h-[550px] object-contain object-bottom hover:scale-105 transition-transform duration-700 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] z-10"
                                    />
                                </div>

                                {/* Identity Plate */}
                                <div className="relative z-20 w-3/4 max-w-[250px] shadow-2xl">
                                    <div className="bg-gradient-to-b from-yellow-900/80 to-black/90 border-2 border-yellow-500/80 rounded-xl p-4 text-center shadow-[0_0_30px_rgba(234,179,8,0.15)] backdrop-blur-md relative overflow-hidden">
                                        {/* Corner accents */}
                                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-yellow-300 pointer-events-none" />
                                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-yellow-300 pointer-events-none" />
                                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-yellow-300 pointer-events-none" />
                                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-yellow-300 pointer-events-none" />

                                        <p className="text-white font-black text-2xl leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,1)] mb-1">
                                            {user?.nombre}
                                        </p>
                                        <div className="h-px w-3/4 mx-auto bg-yellow-500/50 my-1" />
                                        <p className="text-yellow-400 font-mono text-xs uppercase tracking-[0.2em] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5">
                                            <span>🏅</span> {rankName}
                                        </p>
                                    </div>
                                </div>

                            </div>

                            {/* RIGHT COLUMN: Stats & Attributes */}
                            <div className="lg:col-span-7 flex flex-col gap-6 relative z-30 justify-center">

                                {/* Row 1: Top Level Bars (Lv, HP, MP, EXP) */}
                                <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-lg border border-[#2c4070]">

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-yellow-400 font-black font-mono text-lg w-16">LVL:</span>
                                            <span className="text-2xl font-black text-white">{level}</span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-emerald-400 font-black font-mono text-sm">HP:</span>
                                                <span className="text-white font-mono text-sm">{currentHP} / {maxHP}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-emerald-900">
                                                <div className="h-full bg-emerald-400 shadow-[0_0_10px_#34d399]" style={{ width: '100%' }} />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-blue-400 font-black font-mono text-sm">MP:</span>
                                                <span className="text-white font-mono text-sm">{currentMP} / {maxMP}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-blue-900">
                                                <div className="h-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" style={{ width: '100%' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-end">
                                        <div className="space-y-1 w-full pl-4 border-l border-[#2c4070]">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-yellow-500 font-black font-mono text-xs uppercase tracking-widest">EXP:</span>
                                                <span className="text-slate-300 font-mono text-xs">{currentXP} / {nextLevelXP}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-yellow-900/50">
                                                <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 relative" style={{ width: `${progressXP}%` }}>
                                                    <div className="absolute inset-0 bg-white/20" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Row 2: ASIR Core Stats Grid */}
                                <div className="grid grid-cols-2 gap-8">

                                    {/* Sub-Column 1 */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 border-b border-[#2c4070] pb-1">
                                            <Zap className="w-4 h-4 text-cyan-400" />
                                            <h3 className="text-white font-black uppercase tracking-widest text-sm">Skills Tecnológicos</h3>
                                        </div>

                                        <div className="space-y-3 font-mono text-sm">
                                            <div className="flex justify-between items-center group">
                                                <span className="text-slate-300 flex items-center gap-2"><Cpu className="w-3.5 h-3.5 text-orange-400" /> Hardware (HW)</span>
                                                <span className="text-orange-400 font-bold group-hover:drop-shadow-[0_0_5px_currentColor]">{hwAcc} Pts</span>
                                            </div>
                                            <div className="flex justify-between items-center group">
                                                <span className="text-slate-300 flex items-center gap-2"><Terminal className="w-3.5 h-3.5 text-emerald-400" /> Sistemas (OS)</span>
                                                <span className="text-emerald-400 font-bold group-hover:drop-shadow-[0_0_5px_currentColor]">{osAcc} Pts</span>
                                            </div>
                                            <div className="flex justify-between items-center group">
                                                <span className="text-slate-300 flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-sky-400" /> Redes (NET)</span>
                                                <span className="text-sky-400 font-bold group-hover:drop-shadow-[0_0_5px_currentColor]">{redAcc} Pts</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sub-Column 2 */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 border-b border-[#2c4070] pb-1">
                                            <Shield className="w-4 h-4 text-red-400" />
                                            <h3 className="text-white font-black uppercase tracking-widest text-sm">Defensa & Lógica</h3>
                                        </div>

                                        <div className="space-y-3 font-mono text-sm">
                                            <div className="flex justify-between items-center group">
                                                <span className="text-slate-300 flex items-center gap-2"><Database className="w-3.5 h-3.5 text-violet-400" /> Datos (SQL)</span>
                                                <span className="text-violet-400 font-bold group-hover:drop-shadow-[0_0_5px_currentColor]">{dbAcc} Pts</span>
                                            </div>
                                            <div className="flex justify-between items-center group">
                                                <span className="text-slate-300 flex items-center gap-2"><FileCode className="w-3.5 h-3.5 text-cyan-400" /> Marcas (WEB)</span>
                                                <span className="text-cyan-400 font-bold group-hover:drop-shadow-[0_0_5px_currentColor]">{webAcc} Pts</span>
                                            </div>
                                            <div className="flex justify-between items-center group">
                                                <span className="text-slate-300 flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-red-400" /> Ciberseguridad</span>
                                                <span className="text-red-400 font-bold group-hover:drop-shadow-[0_0_5px_currentColor]">{cyberAcc} Pts</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Row 3: Equipment */}
                                <div className="mt-4 p-4 border border-[#2c4070] bg-black/20 rounded-lg flex flex-col items-center justify-center w-full">
                                    <h3 className="text-yellow-500 font-black font-mono uppercase tracking-widest text-[10px] mb-4 text-center">
                                        —— Equipamiento Actual ——
                                    </h3>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 w-full gap-4 text-center font-mono text-xs">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <span className="text-slate-500 uppercase text-[9px] mb-1">Arma</span>
                                            <Swords className="w-5 h-5 text-slate-400 mb-1" />
                                            <span className="text-white leading-tight">Teclado<br />Mecánico</span>
                                        </div>

                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <span className="text-slate-500 uppercase text-[9px] mb-1">Armadura</span>
                                            <Shield className="w-5 h-5 text-slate-400 mb-1" />
                                            <span className="text-white leading-tight">Sudadera<br />Securizada</span>
                                        </div>

                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <span className="text-slate-500 uppercase text-[9px] mb-1">Defensa</span>
                                            <Activity className="w-5 h-5 text-slate-400 mb-1" />
                                            <span className="text-white leading-tight">Gafas<br />Filtro-Azul</span>
                                        </div>

                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <span className="text-slate-500 uppercase text-[9px] mb-1">Accesorio</span>
                                            <Crosshair className="w-5 h-5 text-slate-400 mb-1" />
                                            <span className="text-white leading-tight">Pendrive<br />Booteable</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 4: Status Buffs & Loot Drops */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">

                                    {/* Buffs / Status Effects */}
                                    <div className="p-4 border border-emerald-900/50 bg-emerald-950/20 rounded-lg relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent z-0 pointer-events-none" />
                                        <h3 className="text-emerald-400 font-black font-mono uppercase tracking-widest text-[10px] mb-4 relative z-10 flex items-center gap-2">
                                            <Flame className="w-3.5 h-3.5" /> Estados Activos
                                        </h3>

                                        <div className="space-y-3 relative z-10 font-mono text-xs max-h-[140px] overflow-y-auto custom-scrollbar pr-2">
                                            <div className="flex items-start gap-3 bg-black/40 p-2 rounded border border-emerald-900/30">
                                                <div className="p-1.5 bg-emerald-500/20 rounded mt-0.5">
                                                    <Star className="w-3.5 h-3.5 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-emerald-300 font-bold mb-0.5">Bono de Exp (+10%)</p>
                                                    <p className="text-slate-500 text-[10px] leading-tight">Racha de tests aprobados mantenida.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 bg-black/40 p-2 rounded border border-emerald-900/30">
                                                <div className="p-1.5 bg-cyan-500/20 rounded mt-0.5">
                                                    <Coffee className="w-3.5 h-3.5 text-cyan-400" />
                                                </div>
                                                <div>
                                                    <p className="text-cyan-300 font-bold mb-0.5">Café en Vena</p>
                                                    <p className="text-slate-500 text-[10px] leading-tight">+10 Velocidad Mental (Focus Activo).</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Loot / Possible Drops */}
                                    <div className="p-4 border border-purple-900/50 bg-purple-950/20 rounded-lg relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent z-0 pointer-events-none" />

                                        <div className="flex items-center justify-between mb-4 relative z-10">
                                            <h3 className="text-purple-400 font-black font-mono uppercase tracking-widest text-[10px] flex items-center gap-2">
                                                <Gift className="w-3.5 h-3.5" /> Posibles Objetos
                                            </h3>
                                            <div className="group/tooltip relative cursor-help">
                                                <Info className="w-4 h-4 text-purple-500/50 hover:text-purple-400 transition-colors" />
                                                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black/90 border border-purple-500/30 rounded text-[9px] text-purple-200 font-mono invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all z-50">
                                                    Supera exámenes y retos para probability de dropear estos objetos para tu inventario.
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 relative z-10">

                                            {/* Locked Item 1 */}
                                            <div className="aspect-square bg-black/50 border border-purple-900/30 rounded flex flex-col items-center justify-center gap-1 opacity-60 hover:opacity-100 hover:border-purple-500/50 hover:bg-purple-900/20 transition-all cursor-not-allowed group/item">
                                                <Lock className="w-4 h-4 text-slate-600 group-hover/item:text-purple-400 transition-colors" />
                                                <span className="text-[8px] font-mono text-slate-500 uppercase text-center px-1 group-hover/item:text-purple-300">Teclado Legendario</span>
                                            </div>

                                            {/* Locked Item 2 */}
                                            <div className="aspect-square bg-black/50 border border-purple-900/30 rounded flex flex-col items-center justify-center gap-1 opacity-60 hover:opacity-100 hover:border-purple-500/50 hover:bg-purple-900/20 transition-all cursor-not-allowed group/item">
                                                <Lock className="w-4 h-4 text-slate-600 group-hover/item:text-purple-400 transition-colors" />
                                                <span className="text-[8px] font-mono text-slate-500 uppercase text-center px-1 group-hover/item:text-purple-300">Bebida Cuántica</span>
                                            </div>

                                            {/* Locked Item 3 */}
                                            <div className="aspect-square bg-black/50 border border-purple-900/30 rounded flex flex-col items-center justify-center gap-1 opacity-60 hover:opacity-100 hover:border-purple-500/50 hover:bg-purple-900/20 transition-all cursor-not-allowed group/item">
                                                <Lock className="w-4 h-4 text-slate-600 group-hover/item:text-purple-400 transition-colors" />
                                                <span className="text-[8px] font-mono text-slate-500 uppercase text-center px-1 group-hover/item:text-purple-300">Script Épico</span>
                                            </div>

                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                    TABLÓN DE ITEMS: User Inventory
                    ══════════════════════════════════════════════ */}
                <div className="max-w-5xl mx-auto mt-10 animate-in fade-in slide-in-from-bottom duration-700">

                    {/* Section Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-500/30" />
                        <div className="flex items-center gap-3 px-6 py-2 border border-purple-500/30 rounded-full bg-purple-900/10 backdrop-blur-sm">
                            <span className="text-lg">🎒</span>
                            <h2 className="text-purple-400 font-black font-mono uppercase tracking-[0.3em] text-sm">Tablón de Items</h2>
                            <span className="text-lg">⚔️</span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-500/30" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {ITEM_CATALOG_LIST.map((item) => {
                            const ownedItem = inventory.find(it => it.item_key === item.key);
                            const isOwned = !!ownedItem;

                            return (
                                <div
                                    key={item.key}
                                    className={`relative group rounded-xl border p-4 transition-all duration-300 overflow-hidden flex flex-col items-center text-center gap-2
                                        ${isOwned
                                            ? 'border-purple-500/50 bg-purple-900/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                                            : 'border-white/5 bg-black/40 grayscale opacity-40 hover:opacity-60 cursor-help'}`}
                                >
                                    {/* Rarity badge (only if owned or on hover) */}
                                    <div className={`absolute top-1 right-1 px-1 rounded-[4px] text-[6px] font-black font-mono uppercase border transition-opacity
                                        ${!isOwned ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
                                        ${item.rarity === 'legendario' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                            item.rarity === 'epico' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                                item.rarity === 'raro' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                    'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                        }`}
                                    >
                                        {item.rarity}
                                    </div>

                                    {/* Icon */}
                                    <div className={`text-3xl transition-transform duration-500 ${isOwned ? 'group-hover:scale-125 group-hover:rotate-12' : ''}`}>
                                        {item.emoji}
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <p className={`text-[10px] font-black uppercase mb-0.5 leading-none ${isOwned ? 'text-white' : 'text-slate-600'}`}>
                                            {item.name}
                                        </p>
                                        <p className={`text-[8px] font-mono leading-tight ${isOwned ? 'text-slate-400' : 'text-slate-800'}`}>
                                            {isOwned ? item.desc : '???'}
                                        </p>
                                    </div>

                                    {/* Lock overlay if not owned */}
                                    {!isOwned && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] pointer-events-none">
                                            <Lock className="w-4 h-4 text-slate-700/50" />
                                        </div>
                                    )}

                                    {/* Tooltip if not owned */}
                                    {!isOwned && (
                                        <div className="absolute inset-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform bg-black/90 p-2 z-10">
                                            <p className="text-[7px] text-white font-mono uppercase tracking-widest leading-relaxed">
                                                Obtén este item superando exámenes (15% drop)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                    TABLÓN DE INFORMACIÓN: 20-Level Progression
                    ══════════════════════════════════════════════ */}

                <div className="max-w-5xl mx-auto mt-10 animate-in fade-in slide-in-from-bottom duration-700">

                    {/* Section Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/30" />
                        <div className="flex items-center gap-3 px-6 py-2 border border-yellow-500/30 rounded-full bg-yellow-900/10 backdrop-blur-sm">
                            <span className="text-lg">📋</span>
                            <h2 className="text-yellow-400 font-black font-mono uppercase tracking-[0.3em] text-sm">Tablón de Información</h2>
                            <span className="text-lg">🏆</span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/30" />
                    </div>

                    {/* Subtitle */}
                    <p className="text-center text-slate-400 font-mono text-xs mb-8 max-w-lg mx-auto leading-relaxed">
                        Completa simulacros, mantén rachas y supera retos para subir de nivel y desbloquear rangos, medallas y logros exclusivos.
                    </p>

                    {/* Level Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {LEVELS.map((lv) => {
                            const isCurrentLevel = level === lv.level;
                            const isUnlocked = level >= lv.level;
                            return (
                                <div
                                    key={lv.level}
                                    className={`relative rounded-xl border p-4 transition-all duration-300 overflow-hidden group
                                        ${isCurrentLevel
                                            ? 'border-yellow-400/70 bg-yellow-900/10 shadow-[0_0_30px_rgba(234,179,8,0.12)]'
                                            : isUnlocked
                                                ? 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
                                                : 'border-white/5 bg-black/20 opacity-60 hover:opacity-80'
                                        }`}
                                >
                                    {/* Current level indicator */}
                                    {isCurrentLevel && (
                                        <div className="absolute top-2 right-2">
                                            <span className="text-[9px] font-black font-mono uppercase bg-yellow-500 text-black px-2 py-0.5 rounded-full tracking-widest animate-pulse">TÚ</span>
                                        </div>
                                    )}

                                    {/* Level badge */}
                                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black font-mono border mb-3
                                        ${isCurrentLevel ? 'bg-yellow-500 text-black border-yellow-300' :
                                            isUnlocked ? 'bg-white/10 text-white border-white/20' :
                                                'bg-black/30 text-slate-600 border-white/5'}`}>
                                        {lv.level}
                                    </div>

                                    {/* Rank name */}
                                    <p className={`font-black text-sm mb-1 leading-tight ${isCurrentLevel ? 'text-yellow-300' : isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                                        {lv.rank}
                                    </p>

                                    {/* XP Range */}
                                    <p className="text-[10px] font-mono text-slate-500 mb-2">{lv.xpRange}</p>

                                    {/* Medal */}
                                    <div className={`text-xs font-mono px-2 py-1 rounded-md inline-block mb-2 border ${lv.medalStyle}`}>
                                        {lv.medal}
                                    </div>

                                    {/* Achievement */}
                                    <p className={`text-[10px] font-mono leading-tight ${isUnlocked ? 'text-slate-400' : 'text-slate-700'}`}>
                                        🏆 {lv.achievement}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer note */}
                    <div className="mt-8 mb-4 p-4 border border-blue-900/30 bg-blue-950/20 rounded-xl text-center">
                        <p className="text-blue-300 font-mono text-xs leading-relaxed">
                            <span className="font-black">⚡ Cómo subir de nivel:</span> Cada test superado otorga XP según la dificultad. Mantener rachas de aciertos da bonus. Los niveles del 15 al 20 requieren superar retos especiales de cada módulo ASIR.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
}

// ── 20-Level Progression Table ───────────────────────────────────────────────
const LEVELS = [
    {
        level: 1,
        rank: "🥉 Informático Noob",
        xpRange: "0 – 499 XP",
        medal: "🔩 Tuerca de Principiante",
        medalStyle: "bg-slate-800 text-slate-400 border-slate-700",
        achievement: "Arrancaste el sistema por primera vez.",
    },
    {
        level: 2,
        rank: "🥉 Aprendiz del Cable",
        xpRange: "500 – 999 XP",
        medal: "🔌 Conector RJ45",
        medalStyle: "bg-slate-800 text-slate-400 border-slate-700",
        achievement: "Completaste tu primer simulacro sin rendirte.",
    },
    {
        level: 3,
        rank: "🥉 Usuario con Curiosidad",
        xpRange: "1000 – 1499 XP",
        medal: "💾 Disquete Retro",
        medalStyle: "bg-slate-800 text-slate-400 border-slate-700",
        achievement: "Superaste el 50% en hardware por primera vez.",
    },
    {
        level: 4,
        rank: "🥉 Técnico en Prácticas",
        xpRange: "1500 – 1999 XP",
        medal: "📡 Antena de Señal",
        medalStyle: "bg-slate-800 text-slate-400 border-slate-700",
        achievement: "Mantuviste una racha de 5 tests seguidos.",
    },
    {
        level: 5,
        rank: "🥈 Proyecto de Informático",
        xpRange: "2000 – 2999 XP",
        medal: "🌐 Globo de Red",
        medalStyle: "bg-blue-900/40 text-blue-300 border-blue-700/50",
        achievement: "Desbloqueaste el rango Plata. ¡Vas bien!",
    },
    {
        level: 6,
        rank: "🥈 Operador de Sistemas",
        xpRange: "3000 – 3999 XP",
        medal: "🖥️ Monitor Dual",
        medalStyle: "bg-blue-900/40 text-blue-300 border-blue-700/50",
        achievement: "Superaste el módulo de Sistemas Operativos.",
    },
    {
        level: 7,
        rank: "🥈 Ingeniero de Red Júnior",
        xpRange: "4000 – 4999 XP",
        medal: "🔗 Cadena de Paquetes",
        medalStyle: "bg-blue-900/40 text-blue-300 border-blue-700/50",
        achievement: "Dominaste los fundamentos de TCP/IP.",
    },
    {
        level: 8,
        rank: "🥈 Configurador de Switches",
        xpRange: "5000 – 6999 XP",
        medal: "🔀 Switch VLAN",
        medalStyle: "bg-blue-900/40 text-blue-300 border-blue-700/50",
        achievement: "10 simulacros completados con nota.",
    },
    {
        level: 9,
        rank: "🥈 Admin Linux Baby",
        xpRange: "7000 – 8999 XP",
        medal: "🐧 Pingüino del Shell",
        medalStyle: "bg-blue-900/40 text-blue-300 border-blue-700/50",
        achievement: "Completaste todos los tests de redes globales.",
    },
    {
        level: 10,
        rank: "🥇 Técnico Junior Certificado",
        xpRange: "9000 – 11999 XP",
        medal: "🏅 Placa de Técnico",
        medalStyle: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
        achievement: "¡Rango Oro! Primer jalón profesional.",
    },
    {
        level: 11,
        rank: "🥇 Sysadmin Aspirante",
        xpRange: "12000 – 14999 XP",
        medal: "🗄️ Rack de Servidores",
        medalStyle: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
        achievement: "Dominaste virtualización y contenedores.",
    },
    {
        level: 12,
        rank: "🥇 Arquitecto de VLAN",
        xpRange: "15000 – 17999 XP",
        medal: "🏗️ Plano de Red",
        medalStyle: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
        achievement: "Diseñaste una red segmentada sin errores.",
    },
    {
        level: 13,
        rank: "🥇 DevSecOps en Formación",
        xpRange: "18000 – 20999 XP",
        medal: "🛡️ Escudo de Código",
        medalStyle: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
        achievement: "Superaste el 80% en Ciberseguridad.",
    },
    {
        level: 14,
        rank: "🥇 Maestro del Firewall",
        xpRange: "21000 – 24999 XP",
        medal: "🔥 Firewall Élite",
        medalStyle: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
        achievement: "Completaste todos los retos de seguridad perimetral.",
    },
    {
        level: 15,
        rank: "⚔️ Administrador Senior",
        xpRange: "25000 – 29999 XP",
        medal: "⚔️ Espada del Root",
        medalStyle: "bg-orange-900/40 text-orange-300 border-orange-700/50",
        achievement: "¡Nivel de Élite! Administrador con plenas competencias.",
    },
    {
        level: 16,
        rank: "⚔️ Guerrero de la Terminal",
        xpRange: "30000 – 34999 XP",
        medal: "💀 Cráneo del Shell",
        medalStyle: "bg-orange-900/40 text-orange-300 border-orange-700/50",
        achievement: "500 comandos domados en registros de terminal.",
    },
    {
        level: 17,
        rank: "⚔️ Explorador de Subredes",
        xpRange: "35000 – 39999 XP",
        medal: "🗺️ Mapa de Red",
        medalStyle: "bg-orange-900/40 text-orange-300 border-orange-700/50",
        achievement: "Calculaste subredes avanzadas con precisión del 95%.",
    },
    {
        level: 18,
        rank: "🛡️ Hacker Ético Certificado",
        xpRange: "40000 – 44999 XP",
        medal: "🕵️ Insignia del Hacker",
        medalStyle: "bg-purple-900/40 text-purple-300 border-purple-700/50",
        achievement: "¡Penetración ética superada! Nivel legendario.",
    },
    {
        level: 19,
        rank: "🛡️ Guardián de la Infraestructura",
        xpRange: "45000 – 49999 XP",
        medal: "🌩️ Rayo del Datacenter",
        medalStyle: "bg-purple-900/40 text-purple-300 border-purple-700/50",
        achievement: "Completaste todos los módulos sin un solo fallo.",
    },
    {
        level: 20,
        rank: "👑 SysAdmin Dios",
        xpRange: "50000+ XP",
        medal: "👑 Corona del SysAdmin",
        medalStyle: "bg-gradient-to-r from-yellow-900/60 to-amber-900/60 text-yellow-200 border-yellow-400/60",
        achievement: "Nivel máximo. Eres la leyenda de Tech4U Academy.",
    },
];
