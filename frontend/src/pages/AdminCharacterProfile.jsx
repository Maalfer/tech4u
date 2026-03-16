import { useNavigate } from 'react-router-dom';
import {
    User, ArrowLeft, Shield, Swords, Activity,
    Crosshair, Zap, Database, Globe, Terminal,
    BookOpen, Cpu, FileCode, CheckCircle, Flame,
    Coffee, Star, Gift, Lock, Crown
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import marcoImg from '../assets/marco_pj.png';
import pj1 from '../assets/pj_lvl_1.png';
import pj2 from '../assets/pj_lvl_2.png';
import pj3 from '../assets/pj_lvl_3.png';
import pj4 from '../assets/pj_lvl_4.png';
import pj5 from '../assets/pj_lvl_5.png';
import pj6 from '../assets/pj_lvl_6.png';
import pj7 from '../assets/pj_lvl_7.png';
import pj8 from '../assets/pj_lvl_8.png';
import pj9 from '../assets/pj_lvl_9.png';
import pj10 from '../assets/pj_lvl_10.png';
import pj11 from '../assets/pj_lvl_11.png';
import pj12 from '../assets/pj_lvl_12.png';
import pj13 from '../assets/pj_lvl_13.png';
import pj14 from '../assets/pj_lvl_14.png';
import pj15 from '../assets/pj_lvl_15.png';
import pj16 from '../assets/pj_lvl_16.png';
import pj17 from '../assets/pj_lvl_17.png';
import pj18 from '../assets/pj_lvl_18.png';
import pj19 from '../assets/pj_lvl_19.png';
import pj20 from '../assets/pj_lvl_20.png';
import newSkinPj20 from '../assets/new_skin_pj_lvl20.png';

const PJ_ASSETS = {
    1: pj1, 2: pj2, 3: pj3, 4: pj4, 5: pj5,
    6: pj6, 7: pj7, 8: pj8, 9: pj9, 10: pj10,
    11: pj11, 12: pj12, 13: pj13, 14: pj14, 15: pj15,
    16: pj16, 17: pj17, 18: pj18, 19: pj19, 20: pj20
};

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

// ── Max-level static data for the Admin character ───────────────────────────
const ADMIN_LEVEL = 20;
const ADMIN_RANK = '👑 SysAdmin Dios';
const ADMIN_HP = 500;
const ADMIN_MP = 250;
const ADMIN_XP = 50000;
const ADMIN_NEXT_XP = 50000;   // full bar

const STATS = {
    hw: 100,
    os: 100,
    redes: 100,
    sql: 100,
    web: 100,
    cyber: 100,
};

const ADMIN_RANKS_DISPLAY = [
    {
        id: 1,
        name: '🥉 Estudiante ASIR',
        levels: 'Niveles 1 – 4',
        xpRange: '0 – 1.999 XP',
        desc: 'Iniciando tu camino en la administración. Aquí aprenderás las bases de hardware y redes.',
        cardC: 'border-slate-700 bg-slate-900/40 text-slate-300',
        icon: '🎒'
    },
    {
        id: 2,
        name: '🥈 Informático Nerd',
        levels: 'Niveles 5 – 9',
        xpRange: '2.000 – 8.999 XP',
        desc: 'Ya te defiendes en la terminal y la configuración de equipos no es un misterio para ti.',
        cardC: 'border-blue-700/50 bg-blue-900/20 text-blue-300',
        icon: '💻'
    },
    {
        id: 3,
        name: '🥇 Técnico Junior',
        levels: 'Niveles 10 – 14',
        xpRange: '9.000 – 24.999 XP',
        desc: 'Dominio intermedio. Eres capaz de desplegar servicios y configurar redes estructuradas.',
        cardC: 'border-yellow-600/50 bg-yellow-900/20 text-yellow-400',
        icon: '🔧'
    },
    {
        id: 4,
        name: '⚔️ Técnico L3',
        levels: 'Niveles 15 – 17',
        xpRange: '25.000 – 39.999 XP',
        desc: 'Experto en resolución de problemas críticos. Las infraestructuras confían en tu criterio.',
        cardC: 'border-orange-600/50 bg-orange-900/20 text-orange-400',
        icon: '⚡'
    },
    {
        id: 5,
        name: '🛡️ Admin Senior',
        levels: 'Niveles 18 – 19',
        xpRange: '40.000 – 49.999 XP',
        desc: 'La élite de la academia. Mantienes servidores a nivel empresarial y aseguras la red corporativa.',
        cardC: 'border-purple-600/50 bg-purple-900/20 text-purple-400',
        icon: '🔐'
    },
    {
        id: 6,
        name: '👑 SysAdmin Dios',
        levels: 'Nivel 20+',
        xpRange: '50.000+ XP',
        desc: 'Leyenda absoluta. El sistema te obedece de forma nativa. Tienes acceso root al universo.',
        cardC: 'border-yellow-400/60 bg-gradient-to-br from-yellow-900/40 to-amber-900/40 text-yellow-200',
        icon: '⚜️'
    },
];

export default function AdminCharacterProfile() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen bg-[#020510] selection:bg-neon selection:text-black overflow-hidden relative">

            {/* Background: Gold-tinted cyber grid */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-900/20 via-[#020510] to-[#020510] -z-20" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTkgMEgwVjU5IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjM0LDE3OSw4LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)] -z-10" />

            {/* Glowing orbs */}
            <div className="absolute top-[15%] right-[8%]  w-[600px] h-[600px] bg-yellow-600/8  blur-[150px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] bg-amber-600/8  blur-[120px] rounded-full -z-10" />

            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative z-10 overflow-y-auto h-screen custom-scrollbar">

                <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full -z-10 animate-pulse" />

                <PageHeader
                    title={<>Mi <span className="text-white">Personaje</span></>}
                    subtitle="Perfil del Administrador · Nivel Máximo · TECH4U CORE"
                    Icon={Crown}
                    gradient="from-white via-yellow-100 to-yellow-500"
                    iconColor="text-yellow-400"
                    iconBg="bg-yellow-600/20"
                    iconBorder="border-yellow-500/30"
                    glowColor="bg-yellow-600/20"
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin-dashboard')}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-300 hover:text-white hover:bg-white/10 transition-all font-mono shadow-2xl backdrop-blur-xl"
                        >
                            <ArrowLeft className="w-4 h-4" /> Al Dashboard
                        </button>
                    </div>
                </PageHeader>

                {/* ── JRPG Character Sheet ── */}
                <div className="max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-500">

                    <div className="bg-[#0b101e]/90 border-[3px] border-yellow-600/60 rounded-xl shadow-[0_0_60px_rgba(234,179,8,0.15)] overflow-hidden relative backdrop-blur-md">

                        {/* Inner gold border accent */}
                        <div className="absolute inset-1 border border-yellow-400/40 rounded-lg pointer-events-none" />

                        {/* MAX LEVEL badge */}
                        <div className="absolute top-4 right-4 z-20">
                            <span className="bg-gradient-to-r from-yellow-500 to-amber-400 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)] tracking-widest animate-pulse">
                                👑 NIVEL MÁX
                            </span>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-stretch">

                            {/* LEFT COLUMN: Avatar & Identity */}
                            <div className="lg:col-span-5 flex flex-col items-center relative">
                                {/* Avatar Portrait Box with Frame */}
                                <div className="w-full flex-1 min-h-[400px] relative flex items-center justify-center group mb-4">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-yellow-500/10 blur-[80px] rounded-full -z-10 group-hover:bg-yellow-400/20 transition-colors duration-700" />

                                    {/* Character Image (New skin lvl 20, no frame) */}
                                    <div className="relative w-[90%] h-[90%] flex items-center justify-center overflow-hidden">
                                        <img
                                            src={newSkinPj20}
                                            alt="Admin Character"
                                            className="w-full h-full object-contain hover:scale-110 transition-transform duration-700 drop-shadow-[0_0_20px_rgba(234,179,8,0.2)] z-10"
                                        />
                                    </div>
                                </div>

                                {/* Identity Plate */}
                                <div className="relative z-20 w-3/4 max-w-[250px] shadow-2xl">
                                    <div className="bg-gradient-to-b from-yellow-900/90 to-black/90 border-2 border-yellow-400/90 rounded-xl p-4 text-center shadow-[0_0_40px_rgba(234,179,8,0.25)] backdrop-blur-md relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-yellow-300 pointer-events-none" />
                                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-yellow-300 pointer-events-none" />
                                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-yellow-300 pointer-events-none" />
                                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-yellow-300 pointer-events-none" />

                                        <p className="text-white font-black text-2xl leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,1)] mb-1">
                                            {user?.nombre || 'Administrador'}
                                        </p>
                                        <div className="h-px w-3/4 mx-auto bg-yellow-500/60 my-1" />
                                        <p className="text-yellow-300 font-mono text-xs uppercase tracking-[0.2em] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5">
                                            {ADMIN_RANK}
                                        </p>
                                        <div className="mt-2 text-[9px] font-mono text-yellow-600 uppercase tracking-widest">⚙️ ADMINISTRADOR DEL SISTEM</div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Stats */}
                            <div className="lg:col-span-7 flex flex-col gap-6 relative z-30 justify-center">

                                {/* Row 1: Top Level Bars */}
                                <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-lg border border-yellow-800/40">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-yellow-400 font-black font-mono text-lg w-16">LVL:</span>
                                            <span className="text-3xl font-black text-yellow-300 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">{ADMIN_LEVEL}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-emerald-400 font-black font-mono text-sm">HP:</span>
                                                <span className="text-white font-mono text-sm">{ADMIN_HP} / {ADMIN_HP}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-emerald-900">
                                                <div className="h-full bg-emerald-400 shadow-[0_0_10px_#34d399]" style={{ width: '100%' }} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-blue-400 font-black font-mono text-sm">MP:</span>
                                                <span className="text-white font-mono text-sm">{ADMIN_MP} / {ADMIN_MP}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-blue-900">
                                                <div className="h-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" style={{ width: '100%' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-end">
                                        <div className="space-y-1 w-full pl-4 border-l border-yellow-800/40">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-yellow-500 font-black font-mono text-xs uppercase tracking-widest">EXP:</span>
                                                <span className="text-slate-300 font-mono text-xs">{ADMIN_XP.toLocaleString()} / {ADMIN_NEXT_XP.toLocaleString()}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-yellow-900/50">
                                                <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.4)]" style={{ width: '100%' }} />
                                            </div>
                                            <p className="text-[9px] font-mono text-yellow-600 text-right mt-1">MÁXIMO ALCANZADO</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Stats Grid — all maxed */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 border-b border-yellow-800/40 pb-1">
                                            <Zap className="w-4 h-4 text-yellow-400" />
                                            <h3 className="text-white font-black uppercase tracking-widest text-sm">Skills Tecnológicos</h3>
                                        </div>
                                        <div className="space-y-3 font-mono text-sm">
                                            {[
                                                { icon: Cpu, col: 'text-orange-400', label: 'Hardware (HW)', val: STATS.hw },
                                                { icon: Terminal, col: 'text-emerald-400', label: 'Sistemas (OS)', val: STATS.os },
                                                { icon: Globe, col: 'text-sky-400', label: 'Redes (NET)', val: STATS.redes },
                                            ].map(({ icon: Icon, col, label, val }) => (
                                                <div key={label} className="flex justify-between items-center group">
                                                    <span className={`text-slate-300 flex items-center gap-2`}>
                                                        <Icon className={`w-3.5 h-3.5 ${col}`} /> {label}
                                                    </span>
                                                    <span className={`${col} font-bold`}>{val} Pts ✓</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-3 border-b border-yellow-800/40 pb-1">
                                            <Shield className="w-4 h-4 text-yellow-400" />
                                            <h3 className="text-white font-black uppercase tracking-widest text-sm">Defensa & Lógica</h3>
                                        </div>
                                        <div className="space-y-3 font-mono text-sm">
                                            {[
                                                { icon: Database, col: 'text-violet-400', label: 'Datos (SQL)', val: STATS.sql },
                                                { icon: FileCode, col: 'text-cyan-400', label: 'Marcas (WEB)', val: STATS.web },
                                                { icon: Shield, col: 'text-red-400', label: 'Ciberseguridad', val: STATS.cyber },
                                            ].map(({ icon: Icon, col, label, val }) => (
                                                <div key={label} className="flex justify-between items-center group">
                                                    <span className="text-slate-300 flex items-center gap-2">
                                                        <Icon className={`w-3.5 h-3.5 ${col}`} /> {label}
                                                    </span>
                                                    <span className={`${col} font-bold`}>{val} Pts ✓</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3: Equipment */}
                                <div className="mt-2 p-4 border border-yellow-800/40 bg-black/20 rounded-lg flex flex-col items-center justify-center w-full">
                                    <h3 className="text-yellow-400 font-black font-mono uppercase tracking-widest text-[10px] mb-4 text-center">
                                        —— Equipamiento Legendario ——
                                    </h3>
                                    <div className="grid grid-cols-4 w-full gap-4 text-center font-mono text-xs">
                                        {[
                                            { slot: 'Arma', Icon: Swords, name: 'Teclado\nMecánico +5' },
                                            { slot: 'Armadura', Icon: Shield, name: 'Sudadera\nAdmin Root' },
                                            { slot: 'Defensa', Icon: Activity, name: 'Firewall\nPersonal' },
                                            { slot: 'Accesorio', Icon: Crosshair, name: 'Badge\nAdministrador' },
                                        ].map(({ slot, Icon, name }) => (
                                            <div key={slot} className="flex flex-col items-center justify-center gap-2">
                                                <span className="text-slate-500 uppercase text-[9px] mb-1">{slot}</span>
                                                <Icon className="w-5 h-5 text-yellow-400 mb-1" />
                                                <span className="text-white leading-tight">{name.split('\n').map((l, i) => <span key={i}>{l}{i === 0 && <br />}</span>)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Row 4: Buffs & Drops */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div className="p-4 border border-yellow-900/50 bg-yellow-950/20 rounded-lg relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent z-0 pointer-events-none" />
                                        <h3 className="text-yellow-400 font-black font-mono uppercase tracking-widest text-[10px] mb-4 relative z-10 flex items-center gap-2">
                                            <Flame className="w-3.5 h-3.5" /> Estados Activos
                                        </h3>
                                        <div className="space-y-3 relative z-10 font-mono text-xs">
                                            {[
                                                { icon: Crown, col: 'text-yellow-400', bg: 'bg-yellow-500/20', title: 'Aura de Administrador', desc: 'Acceso total al sistema garantizado.' },
                                                { icon: Star, col: 'text-emerald-400', bg: 'bg-emerald-500/20', title: 'Bono de XP Infinito (+∞%)', desc: 'Nivel máximo alcanzado permanentemente.' },
                                                { icon: Coffee, col: 'text-cyan-400', bg: 'bg-cyan-500/20', title: 'Modo Dios Activo', desc: 'sudo su -. Sin restricciones.' },
                                            ].map(({ icon: Icon, col, bg, title, desc }) => (
                                                <div key={title} className="flex items-start gap-3 bg-black/40 p-2 rounded border border-yellow-900/30">
                                                    <div className={`p-1.5 ${bg} rounded mt-0.5`}><Icon className={`w-3.5 h-3.5 ${col}`} /></div>
                                                    <div>
                                                        <p className={`${col} font-bold mb-0.5`}>{title}</p>
                                                        <p className="text-slate-500 text-[10px] leading-tight">{desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════
                        TABLÓN DE ITEMS: Admin Inventory (All Unlocked)
                        ══════════════════════════════════════════════ */}
                    <div className="max-w-5xl mx-auto mt-10 animate-in fade-in slide-in-from-bottom duration-700">

                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/30" />
                            <div className="flex items-center gap-3 px-6 py-2 border border-yellow-500/30 rounded-full bg-yellow-900/10 backdrop-blur-sm">
                                <span className="text-lg">🎒</span>
                                <h2 className="text-yellow-400 font-black font-mono uppercase tracking-[0.3em] text-sm">Colección Maestra de Items</h2>
                                <span className="text-lg">⚔️</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/30" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {ITEM_CATALOG_LIST.map((item) => (
                                <div
                                    key={item.key}
                                    className="relative group rounded-xl border p-4 transition-all duration-300 overflow-hidden flex flex-col items-center text-center gap-2 border-yellow-500/50 bg-yellow-900/10 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:scale-105"
                                >
                                    <div className={`absolute top-1 right-1 px-1 rounded-[4px] text-[6px] font-black font-mono uppercase border transition-opacity
                                        ${item.rarity === 'legendario' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                            item.rarity === 'epico' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                                item.rarity === 'raro' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                    'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                        }`}
                                    >
                                        {item.rarity}
                                    </div>

                                    <div className="text-3xl transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">
                                        {item.emoji}
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-black uppercase mb-0.5 leading-none text-white">
                                            {item.name}
                                        </p>
                                        <p className="text-[8px] font-mono leading-tight text-yellow-600/70">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Tablón de Información: 6 Ligas ── */}

                    <div className="mt-16">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/30" />
                            <div className="flex items-center gap-3 px-6 py-2 border border-yellow-500/30 rounded-full bg-yellow-900/10">
                                <span>🏆</span>
                                <h3 className="text-yellow-400 font-black font-mono uppercase tracking-[0.3em] text-sm">Las 6 Ligas de Progresión</h3>
                                <span>📋</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/30" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ADMIN_RANKS_DISPLAY.map((rank) => {
                                const isAdmin = rank.id === 6; // Admin is level 20 (SysAdmin Dios)
                                return (
                                    <div key={rank.id} className={`relative overflow-hidden rounded-xl border p-6 transition-all duration-300 ${rank.cardC} ${isAdmin ? 'ring-2 ring-yellow-400 scale-105 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'hover:scale-[1.02]'}`}>
                                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                            <span className="text-6xl">{rank.icon}</span>
                                        </div>

                                        <h4 className="font-black text-xl mb-2 flex items-center gap-2 text-current drop-shadow-md">
                                            {rank.name}
                                        </h4>

                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-xs font-mono px-2 py-1 rounded bg-black/40 border border-white/10 text-white shadow-inner">
                                                {rank.levels}
                                            </span>
                                            <span className="text-xs font-mono text-slate-400 font-bold">
                                                {rank.xpRange}
                                            </span>
                                        </div>

                                        <p className="text-sm font-mono text-slate-300/80 leading-relaxed max-w-[85%]">
                                            {rank.desc}
                                        </p>

                                        {isAdmin && (
                                            <div className="mt-4 text-[10px] inline-block font-black font-mono bg-yellow-500 text-black px-2 py-1 rounded shadow-[0_0_10px_var(--tw-shadow-color)] shadow-yellow-500/50 uppercase tracking-widest animate-[pulse_2s_ease-in-out_infinite]">
                                                ← TÚ ESTÁS AQUÍ
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════
                        GALERÍA DE PERSONAJES: Evolution Path (Admin View)
                        ══════════════════════════════════════════════ */}
                    <div className="max-w-5xl mx-auto mt-16 animate-in fade-in slide-in-from-bottom duration-1000 mb-20">
                        {/* Section Header */}
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/30" />
                            <div className="flex items-center gap-3 px-8 py-3 border border-yellow-500/30 rounded-full bg-yellow-900/20 backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                                <Cpu className="w-5 h-5 text-yellow-400" />
                                <h2 className="text-yellow-400 font-black font-mono uppercase tracking-[0.4em] text-sm">Archivo de Evolución Maestro</h2>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/30" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {Object.entries(PJ_ASSETS).map(([lvl, img]) => {
                                const isCurrent = parseInt(lvl) === 20; // Admin is level 20
                                const isUnlocked = true; // Admin has all unlocked

                                return (
                                    <div
                                        key={lvl}
                                        className={`relative group rounded-2xl border aspect-[4/5] p-3 transition-all duration-500 overflow-hidden flex flex-col items-center justify-center
                                            ${isCurrent
                                                ? 'border-yellow-400 bg-yellow-400/5 shadow-[0_0_25px_rgba(234,179,8,0.15)] ring-1 ring-yellow-400/30'
                                                : 'border-white/20 bg-white/5 hover:border-yellow-400/40 hover:bg-yellow-400/5'}`}
                                    >
                                        {/* Level Badge */}
                                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black font-mono border z-10
                                            ${isCurrent ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-black/60 text-slate-400 border-white/10'}`}>
                                            LVL {lvl}
                                        </div>

                                        {/* Avatar in Gallery */}
                                        <div className="relative w-full h-full flex items-center justify-center p-2">
                                            <img
                                                src={img}
                                                alt={`PJ Nivel ${lvl}`}
                                                className={`w-full h-full object-contain transition-all duration-700
                                                    ${isCurrent ? 'scale-110 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-pulse' : 'group-hover:scale-105'}`}
                                            />
                                        </div>

                                        {/* Label */}
                                        <div className={`absolute bottom-0 inset-x-0 p-2 text-center bg-gradient-to-t from-black to-transparent
                                            ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                            <p className="text-[8px] font-black font-mono text-white uppercase tracking-tighter">
                                                {isCurrent ? 'Tu Nivel Actual' : 'Estado: Maestro'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
