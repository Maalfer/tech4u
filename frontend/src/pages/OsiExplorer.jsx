import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layers, Search, ChevronLeft, ChevronDown, ChevronRight,
    Wifi, Globe, Router, Monitor, Server, Shield, Zap,
    ArrowLeft, ArrowRight, Info, Copy, Check, Network,
    Terminal, Database, Lock, Radio, Cable, Cpu, Hash,
    RefreshCw, BookOpen, AlertTriangle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

// ─── OSI Layer data ────────────────────────────────────────────────────────────
const OSI_LAYERS = [
    {
        num: 7,
        name: 'Aplicación',
        nameEn: 'Application',
        color: '#f43f5e',
        colorAlpha: 'rgba(244,63,94,0.15)',
        colorBorder: 'rgba(244,63,94,0.35)',
        colorLight: '#fb7185',
        pdu: 'Datos / Message',
        icon: Globe,
        tcpLayer: 'Aplicación',
        description: 'Interfaz directa con las aplicaciones del usuario final. Proporciona servicios de red a las aplicaciones como HTTP, FTP, DNS, SMTP.',
        function: 'Proveer servicios de comunicación a las aplicaciones. Define los protocolos que los programas usan para comunicarse.',
        protocols: [
            { name: 'HTTP',  port: '80',  desc: 'HyperText Transfer Protocol — navegación web' },
            { name: 'HTTPS', port: '443', desc: 'HTTP Secure — web cifrada con TLS' },
            { name: 'FTP',   port: '21',  desc: 'File Transfer Protocol — transferencia de ficheros' },
            { name: 'SMTP',  port: '25',  desc: 'Simple Mail Transfer Protocol — envío de correo' },
            { name: 'DNS',   port: '53',  desc: 'Domain Name System — resolución de nombres' },
            { name: 'DHCP',  port: '67/68', desc: 'Dynamic Host Config — asignación de IPs' },
            { name: 'SSH',   port: '22',  desc: 'Secure Shell — acceso remoto cifrado' },
            { name: 'Telnet',port: '23',  desc: 'Terminal remota (no cifrada)' },
            { name: 'SNMP',  port: '161', desc: 'Simple Network Management Protocol' },
            { name: 'POP3',  port: '110', desc: 'Post Office Protocol v3 — recepción de correo' },
            { name: 'IMAP',  port: '143', desc: 'Internet Message Access Protocol' },
            { name: 'NTP',   port: '123', desc: 'Network Time Protocol — sincronización horaria' },
        ],
        devices: ['PC', 'Servidor Web', 'Servidor de Correo', 'Servidor DNS'],
        keywords: ['HTTP', 'FTP', 'DNS', 'SMTP', 'SNMP', 'API', 'sockets', 'usuario'],
        examTip: 'Recuerda: esta capa NO es la interfaz gráfica. Es la capa de servicios de red para aplicaciones. HTTP ≠ HTML.',
    },
    {
        num: 6,
        name: 'Presentación',
        nameEn: 'Presentation',
        color: '#f97316',
        colorAlpha: 'rgba(249,115,22,0.15)',
        colorBorder: 'rgba(249,115,22,0.35)',
        colorLight: '#fb923c',
        pdu: 'Datos / Message',
        icon: RefreshCw,
        tcpLayer: 'Aplicación',
        description: 'Responsable del formato, cifrado y compresión de datos. Traduce entre formatos de datos de la red y de la aplicación.',
        function: 'Traducción de formatos (EBCDIC↔ASCII), compresión de datos y cifrado/descifrado (TLS/SSL actúa aquí).',
        protocols: [
            { name: 'TLS/SSL', port: '—',   desc: 'Transport Layer Security — cifrado de datos' },
            { name: 'JPEG',    port: '—',   desc: 'Compresión de imágenes' },
            { name: 'MPEG',    port: '—',   desc: 'Compresión de vídeo/audio' },
            { name: 'ASCII',   port: '—',   desc: 'Codificación de caracteres estándar' },
            { name: 'EBCDIC',  port: '—',   desc: 'Extended Binary Coded Decimal — IBM' },
            { name: 'XDR',     port: '—',   desc: 'External Data Representation' },
        ],
        devices: ['Pasarela de cifrado', 'Servidor TLS'],
        keywords: ['cifrado', 'compresión', 'formato', 'TLS', 'SSL', 'codec', 'traducción'],
        examTip: 'La capa más olvidada. Recuerda: cifrado TLS, compresión, conversión de formatos (ASCII/EBCDIC). En el modelo TCP/IP se fusiona con la capa de Aplicación.',
    },
    {
        num: 5,
        name: 'Sesión',
        nameEn: 'Session',
        color: '#eab308',
        colorAlpha: 'rgba(234,179,8,0.15)',
        colorBorder: 'rgba(234,179,8,0.35)',
        colorLight: '#facc15',
        pdu: 'Datos / Message',
        icon: Database,
        tcpLayer: 'Aplicación',
        description: 'Establece, gestiona y termina sesiones entre aplicaciones. Controla el diálogo entre hosts (semiduplex / full-duplex).',
        function: 'Sincronización de sesiones (checkpoints), control de diálogo (dúplex), establecimiento y cierre de sesiones.',
        protocols: [
            { name: 'NetBIOS',  port: '137-139', desc: 'Network Basic Input/Output System' },
            { name: 'RPC',      port: '—',       desc: 'Remote Procedure Call' },
            { name: 'PPTP',     port: '1723',    desc: 'Point-to-Point Tunneling Protocol' },
            { name: 'L2TP',     port: '1701',    desc: 'Layer 2 Tunneling Protocol' },
            { name: 'SAP',      port: '—',       desc: 'Session Announcement Protocol' },
            { name: 'SIP',      port: '5060',    desc: 'Session Initiation Protocol — VoIP' },
        ],
        devices: ['Gateway', 'Servidor de aplicaciones'],
        keywords: ['sesión', 'checkpoints', 'sincronización', 'RPC', 'NetBIOS', 'dúplex'],
        examTip: 'Recuerda las 3 fases: establecimiento → mantenimiento → terminación. SIP (VoIP) opera en esta capa.',
    },
    {
        num: 4,
        name: 'Transporte',
        nameEn: 'Transport',
        color: '#22c55e',
        colorAlpha: 'rgba(34,197,94,0.15)',
        colorBorder: 'rgba(34,197,94,0.35)',
        colorLight: '#4ade80',
        pdu: 'Segmento / Datagrama',
        icon: Shield,
        tcpLayer: 'Transporte',
        description: 'Comunicación extremo a extremo (end-to-end). Segmentación, control de flujo, control de errores y multiplexación mediante puertos.',
        function: 'Segmentación y reensamblado, control de flujo (ventana deslizante), control de congestión, multiplexación por puertos.',
        protocols: [
            { name: 'TCP',    port: '—',   desc: 'Transmission Control Protocol — orientado a conexión, fiable' },
            { name: 'UDP',    port: '—',   desc: 'User Datagram Protocol — sin conexión, rápido' },
            { name: 'SCTP',   port: '—',   desc: 'Stream Control Transmission Protocol' },
            { name: 'DCCP',   port: '—',   desc: 'Datagram Congestion Control Protocol' },
            { name: 'SPX',    port: '—',   desc: 'Sequenced Packet Exchange (Novell)' },
        ],
        devices: ['Firewall L4', 'Load Balancer'],
        keywords: ['TCP', 'UDP', 'puertos', 'segmentos', 'fiabilidad', 'control de flujo', 'three-way handshake'],
        examTip: 'TCP = fiable, orientado a conexión (3-way handshake: SYN→SYN-ACK→ACK). UDP = rápido, sin garantía. Puertos 0-1023 son bien conocidos.',
    },
    {
        num: 3,
        name: 'Red',
        nameEn: 'Network',
        color: '#3b82f6',
        colorAlpha: 'rgba(59,130,246,0.15)',
        colorBorder: 'rgba(59,130,246,0.35)',
        colorLight: '#60a5fa',
        pdu: 'Paquete',
        icon: Router,
        tcpLayer: 'Internet',
        description: 'Enrutamiento lógico entre redes. Determina la mejor ruta para los paquetes. Trabaja con direcciones IP (lógicas).',
        function: 'Enrutamiento, direccionamiento lógico (IP), fragmentación de paquetes, selección de ruta (routing).',
        protocols: [
            { name: 'IP v4',  port: '—',   desc: 'Internet Protocol v4 — direccionamiento 32-bit' },
            { name: 'IP v6',  port: '—',   desc: 'Internet Protocol v6 — direccionamiento 128-bit' },
            { name: 'ICMP',   port: '—',   desc: 'Internet Control Message Protocol — ping, traceroute' },
            { name: 'OSPF',   port: '—',   desc: 'Open Shortest Path First — protocolo de enrutamiento link-state' },
            { name: 'BGP',    port: '179', desc: 'Border Gateway Protocol — enrutamiento inter-AS' },
            { name: 'EIGRP',  port: '—',   desc: 'Enhanced IGRP — enrutamiento Cisco híbrido' },
            { name: 'RIP',    port: '520', desc: 'Routing Information Protocol — distance-vector' },
            { name: 'ARP',    port: '—',   desc: 'Address Resolution Protocol — IP→MAC' },
            { name: 'NAT',    port: '—',   desc: 'Network Address Translation' },
            { name: 'IPsec',  port: '—',   desc: 'IP Security — cifrado a nivel de red' },
        ],
        devices: ['Router', 'Switch L3', 'Firewall L3'],
        keywords: ['IP', 'router', 'enrutamiento', 'paquete', 'TTL', 'ICMP', 'ping', 'subnet'],
        examTip: 'Dispositivo clave: ROUTER. Dirección lógica = IP. El TTL disminuye en cada salto. ARP resuelve IP→MAC (opera entre L2 y L3).',
    },
    {
        num: 2,
        name: 'Enlace de Datos',
        nameEn: 'Data Link',
        color: '#8b5cf6',
        colorAlpha: 'rgba(139,92,246,0.15)',
        colorBorder: 'rgba(139,92,246,0.35)',
        colorLight: '#a78bfa',
        pdu: 'Trama (Frame)',
        icon: Cable,
        tcpLayer: 'Acceso a Red',
        description: 'Transferencia fiable de tramas entre nodos adyacentes. Acceso al medio (MAC), detección de errores y control de flujo local.',
        function: 'Encapsulación en tramas, direccionamiento físico (MAC), detección de errores (CRC), control de acceso al medio (CSMA/CD, CSMA/CA).',
        protocols: [
            { name: 'Ethernet',  port: '—',   desc: 'IEEE 802.3 — LAN cableada estándar' },
            { name: 'Wi-Fi',     port: '—',   desc: 'IEEE 802.11 — LAN inalámbrica' },
            { name: 'PPP',       port: '—',   desc: 'Point-to-Point Protocol — WAN' },
            { name: 'HDLC',      port: '—',   desc: 'High-level Data Link Control — Cisco serial' },
            { name: 'Frame Relay',port: '—',  desc: 'Protocolo WAN (legado)' },
            { name: 'ATM',       port: '—',   desc: 'Asynchronous Transfer Mode' },
            { name: 'VLAN',      port: '—',   desc: 'Virtual LAN — IEEE 802.1Q' },
            { name: 'STP',       port: '—',   desc: 'Spanning Tree Protocol — IEEE 802.1D' },
            { name: 'LLC',       port: '—',   desc: 'Logical Link Control — IEEE 802.2' },
        ],
        devices: ['Switch L2', 'Bridge', 'NIC', 'Access Point'],
        keywords: ['MAC', 'Ethernet', 'trama', 'switch', 'VLAN', 'STP', 'CRC', 'CSMA'],
        examTip: 'Dispositivo clave: SWITCH. Dirección física = MAC (48 bits, 6 octetos hex). Sub-capas: LLC (superior) y MAC (inferior). CRC detecta errores de bits.',
    },
    {
        num: 1,
        name: 'Física',
        nameEn: 'Physical',
        color: '#94a3b8',
        colorAlpha: 'rgba(148,163,184,0.15)',
        colorBorder: 'rgba(148,163,184,0.3)',
        colorLight: '#cbd5e1',
        pdu: 'Bits',
        icon: Radio,
        tcpLayer: 'Acceso a Red',
        description: 'Transmisión de bits crudos sobre el medio físico. Define cables, conectores, voltajes, frecuencias y características eléctricas/ópticas.',
        function: 'Conversión de bits a señales (eléctricas, ópticas, radio). Define topología física, velocidad, tipos de cable, conectores.',
        protocols: [
            { name: 'Ethernet (físico)', port: '—', desc: 'IEEE 802.3 — especificación eléctrica' },
            { name: 'USB',              port: '—', desc: 'Universal Serial Bus' },
            { name: 'DSL',              port: '—', desc: 'Digital Subscriber Line' },
            { name: 'RS-232',           port: '—', desc: 'Serial estándar — interfaz COM' },
            { name: '1000BASE-T',       port: '—', desc: 'Gigabit Ethernet sobre par trenzado Cat5e+' },
            { name: '10GBASE-SR',       port: '—', desc: '10G Ethernet sobre fibra óptica' },
            { name: 'Bluetooth',        port: '—', desc: 'IEEE 802.15 — radio de corto alcance' },
            { name: 'SONET/SDH',        port: '—', desc: 'Redes ópticas síncronas WAN' },
        ],
        devices: ['Hub', 'Repetidor', 'Cable RJ45', 'Fibra óptica', 'Módem'],
        keywords: ['bits', 'cable', 'hub', 'voltaje', 'señal', 'repetidor', 'fibra', 'conector'],
        examTip: 'Dispositivo clave: HUB (y repetidor). No entiende MACs ni IPs — solo transmite bits. Los tipos de cable (Cat5e, Cat6, fibra monomodo/multimodo) son de esta capa.',
    },
];

const TCP_IP_LAYERS = [
    { name: 'Aplicación', osiLayers: [7, 6, 5], color: '#f43f5e' },
    { name: 'Transporte',  osiLayers: [4],       color: '#22c55e' },
    { name: 'Internet',    osiLayers: [3],       color: '#3b82f6' },
    { name: 'Acceso a Red',osiLayers: [2, 1],    color: '#8b5cf6' },
];

// ─── Protocol quick-lookup ─────────────────────────────────────────────────────
const ALL_PROTOCOLS = OSI_LAYERS.flatMap(layer =>
    layer.protocols.map(p => ({ ...p, layer: layer.num, layerName: layer.name, layerColor: layer.color }))
);

// ─── Mnemonic helper ───────────────────────────────────────────────────────────
const MNEMONICS = [
    { text: '"All People Seem To Need Data Processing"', lang: 'EN (7→1)' },
    { text: '"Please Do Not Throw Sausage Pizza Away"', lang: 'EN (1→7)' },
    { text: '"Algunos Programas Saben Transportar Redes Eléctricamente Físicas"', lang: 'ES (7→1)' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function OsiExplorer() {
    const navigate = useNavigate();
    const [activeLayer, setActiveLayer] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('osi'); // 'osi' | 'tcpip' | 'compare'
    const [copiedItem, setCopiedItem] = useState(null);
    const [showMnemonic, setShowMnemonic] = useState(false);
    const [mnemonicIdx, setMnemonicIdx] = useState(0);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedItem(id);
            setTimeout(() => setCopiedItem(null), 1500);
        });
    };

    // Filter protocols by search
    const filteredProtocols = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return ALL_PROTOCOLS.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.desc.toLowerCase().includes(q) ||
            p.port.includes(q)
        );
    }, [searchQuery]);

    const layer = activeLayer !== null ? OSI_LAYERS.find(l => l.num === activeLayer) : null;

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">

                {/* Ambient glows */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-violet-600/4 blur-[180px] rounded-full -z-10 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/4 blur-[150px] rounded-full -z-10 pointer-events-none" />

                {/* Back nav */}
                <button
                    onClick={() => navigate('/tools')}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 font-mono text-xs uppercase tracking-widest"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Volver a Herramientas
                </button>

                <PageHeader
                    title={<>Modelo <span className="text-white">OSI</span></>}
                    subtitle="// 7-Layer Interactive Explorer"
                    Icon={Layers}
                    gradient="from-white via-violet-200 to-violet-500"
                    iconColor="text-violet-400"
                    iconBg="bg-violet-600/20"
                    iconBorder="border-violet-500/30"
                    glowColor="bg-violet-600/20"
                />

                {/* ── View mode tabs ── */}
                <div className="flex items-center gap-2 mb-8 flex-wrap">
                    {[
                        { id: 'osi',     label: 'Modelo OSI',       icon: Layers },
                        { id: 'compare', label: 'OSI vs TCP/IP',     icon: ArrowRight },
                        { id: 'search',  label: 'Buscar Protocolo',  icon: Search },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setViewMode(tab.id); setActiveLayer(null); setSearchQuery(''); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-widest transition-all border
                                ${viewMode === tab.id
                                    ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                                    : 'bg-white/3 border-white/8 text-slate-500 hover:text-white hover:border-white/20'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}

                    {/* Mnemonic button */}
                    <button
                        onClick={() => { setShowMnemonic(!showMnemonic); setMnemonicIdx(0); }}
                        className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-widest transition-all border bg-white/3 border-white/8 text-slate-500 hover:text-amber-400 hover:border-amber-500/30"
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        Mnemotécnia
                    </button>
                </div>

                {/* ── Mnemonic banner ── */}
                {showMnemonic && (
                    <div className="mb-6 p-5 rounded-2xl bg-amber-500/8 border border-amber-500/25 flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400/70 mb-1">
                                Regla mnemotécnica — {MNEMONICS[mnemonicIdx].lang}
                            </p>
                            <p className="font-mono text-amber-300 text-sm font-bold">
                                {MNEMONICS[mnemonicIdx].text}
                            </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => setMnemonicIdx((mnemonicIdx + MNEMONICS.length - 1) % MNEMONICS.length)}
                                className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/20 transition-colors">
                                <ChevronLeft className="w-3.5 h-3.5 text-amber-400" />
                            </button>
                            <button onClick={() => setMnemonicIdx((mnemonicIdx + 1) % MNEMONICS.length)}
                                className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/20 transition-colors">
                                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    VIEW: OSI Stack
                ══════════════════════════════════════════════════════════════ */}
                {viewMode === 'osi' && (
                    <div className="grid xl:grid-cols-[1fr_1.3fr] gap-8">

                        {/* Layer stack */}
                        <div className="flex flex-col gap-2.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1 font-mono">
                                — Haz clic en una capa para explorarla —
                            </p>
                            {OSI_LAYERS.map((l, idx) => {
                                const LayerIcon = l.icon;
                                const isActive = activeLayer === l.num;
                                return (
                                    <button
                                        key={l.num}
                                        onClick={() => setActiveLayer(isActive ? null : l.num)}
                                        className="group relative flex items-center gap-4 px-5 py-4 rounded-[1.4rem] border transition-all duration-300 text-left w-full overflow-hidden"
                                        style={{
                                            background: isActive ? l.colorAlpha : 'rgba(255,255,255,0.02)',
                                            borderColor: isActive ? l.colorBorder : 'rgba(255,255,255,0.06)',
                                            boxShadow: isActive ? `0 0 30px ${l.colorAlpha}` : 'none',
                                        }}
                                    >
                                        {/* Layer number pill */}
                                        <div
                                            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black font-mono text-base"
                                            style={{ background: l.colorAlpha, border: `1px solid ${l.colorBorder}`, color: l.colorLight }}
                                        >
                                            {l.num}
                                        </div>

                                        {/* Icon */}
                                        <div
                                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{ background: l.colorAlpha, border: `1px solid ${l.colorBorder}` }}
                                        >
                                            <LayerIcon className="w-4 h-4" style={{ color: l.colorLight }} />
                                        </div>

                                        {/* Names */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <span className="font-black text-white text-sm uppercase tracking-tight">{l.name}</span>
                                                <span className="font-mono text-[10px] text-slate-600 uppercase">{l.nameEn}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span
                                                    className="font-mono text-[10px] font-bold uppercase tracking-widest"
                                                    style={{ color: l.colorLight + 'aa' }}
                                                >
                                                    PDU: {l.pdu}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Chevron */}
                                        <ChevronRight
                                            className="w-4 h-4 flex-shrink-0 transition-transform duration-300"
                                            style={{ color: isActive ? l.colorLight : '#475569', transform: isActive ? 'rotate(90deg)' : 'none' }}
                                        />

                                        {/* Active indicator bar */}
                                        {isActive && (
                                            <div
                                                className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                                                style={{ background: l.color }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Detail panel */}
                        {layer ? (
                            <div className="sticky top-8 self-start">
                                <LayerDetail layer={layer} copiedItem={copiedItem} copyToClipboard={copyToClipboard} />
                            </div>
                        ) : (
                            <div className="rounded-[2rem] border border-white/5 bg-white/2 flex flex-col items-center justify-center text-center p-16 gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                    <Layers className="w-8 h-8 text-violet-400/50" />
                                </div>
                                <div>
                                    <p className="font-black text-white text-lg uppercase tracking-tight mb-2">Selecciona una capa</p>
                                    <p className="text-slate-600 font-mono text-xs">Haz clic en cualquier capa del modelo OSI para ver sus protocolos, PDU, dispositivos y notas de examen.</p>
                                </div>
                                <div className="grid grid-cols-7 gap-1.5 mt-2">
                                    {OSI_LAYERS.map(l => (
                                        <div
                                            key={l.num}
                                            className="h-1.5 rounded-full"
                                            style={{ background: l.color, opacity: 0.6 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    VIEW: OSI vs TCP/IP comparison
                ══════════════════════════════════════════════════════════════ */}
                {viewMode === 'compare' && (
                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-blue-500/8 border border-blue-500/20">
                            <p className="font-mono text-xs text-blue-300/80 leading-relaxed">
                                El modelo <strong className="text-blue-300">OSI</strong> es un marco de referencia teórico de 7 capas.
                                El modelo <strong className="text-blue-300">TCP/IP</strong> (DoD) es el modelo práctico usado en Internet, con 4 capas.
                                Las capas OSI 5, 6 y 7 se condensan en una sola capa de Aplicación en TCP/IP.
                            </p>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
                            {/* OSI column */}
                            <div>
                                <div className="text-center mb-4">
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 font-black text-xs uppercase tracking-widest">
                                        Modelo OSI (7 capas)
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {OSI_LAYERS.map(l => (
                                        <button
                                            key={l.num}
                                            onClick={() => { setViewMode('osi'); setActiveLayer(l.num); }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:brightness-125 text-left"
                                            style={{ background: l.colorAlpha, borderColor: l.colorBorder }}
                                        >
                                            <span
                                                className="w-7 h-7 rounded-lg flex items-center justify-center font-black font-mono text-xs flex-shrink-0"
                                                style={{ background: l.color + '22', color: l.colorLight }}
                                            >
                                                {l.num}
                                            </span>
                                            <div>
                                                <div className="font-black text-white text-xs uppercase">{l.name}</div>
                                                <div className="font-mono text-[10px] mt-0.5" style={{ color: l.colorLight + '99' }}>{l.pdu}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Arrows */}
                            <div className="flex flex-col pt-14 gap-2">
                                {OSI_LAYERS.map(l => (
                                    <div key={l.num} className="h-[56px] flex items-center">
                                        <ArrowRight className="w-4 h-4 text-slate-700" />
                                    </div>
                                ))}
                            </div>

                            {/* TCP/IP column */}
                            <div>
                                <div className="text-center mb-4">
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 font-black text-xs uppercase tracking-widest">
                                        Modelo TCP/IP (4 capas)
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0">
                                    {TCP_IP_LAYERS.map((tl, idx) => {
                                        const osiCount = tl.osiLayers.length;
                                        // height = number of OSI layers * (56px per row + 8px gap) - 8px
                                        const heightPx = osiCount * 56 + (osiCount - 1) * 8;
                                        return (
                                            <div
                                                key={tl.name}
                                                className="rounded-xl border flex items-center justify-center px-4 mb-2"
                                                style={{
                                                    background: tl.color + '18',
                                                    borderColor: tl.color + '40',
                                                    height: `${heightPx}px`,
                                                }}
                                            >
                                                <div className="text-center">
                                                    <div className="font-black text-white text-xs uppercase tracking-tight">{tl.name}</div>
                                                    <div className="font-mono text-[10px] mt-1" style={{ color: tl.color + 'aa' }}>
                                                        OSI {tl.osiLayers.length > 1
                                                            ? `${tl.osiLayers[tl.osiLayers.length - 1]}–${tl.osiLayers[0]}`
                                                            : tl.osiLayers[0]}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Key differences table */}
                        <div className="mt-8 rounded-2xl border border-white/8 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/6 bg-white/2">
                                <h3 className="font-black text-white text-sm uppercase tracking-wider">Diferencias Clave</h3>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/6">
                                        <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-slate-500">Aspecto</th>
                                        <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-violet-400">OSI</th>
                                        <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-blue-400">TCP/IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        ['Número de capas',   '7',                           '4 (o 5 en algunos modelos)'],
                                        ['Origen',            'ISO (teórico, 1984)',          'DoD / ARPA (práctico, 1970s)'],
                                        ['Uso',               'Referencia y formación',       'Internet real (implementado)'],
                                        ['Capas de aplicación','3 (App + Pres + Sesión)',     '1 (Aplicación)'],
                                        ['Separación de funciones', 'Muy clara por capa',     'Menos estricta'],
                                        ['Protocolos',        'Independiente de protocolos',  'Ligado a TCP/IP/UDP'],
                                        ['Examen CCNA',       'Base teórica obligatoria',     'Modelo operativo'],
                                    ].map(([asp, osi, tcp]) => (
                                        <tr key={asp} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                                            <td className="px-6 py-3 font-mono text-xs text-slate-400">{asp}</td>
                                            <td className="px-6 py-3 font-mono text-xs text-violet-300/80">{osi}</td>
                                            <td className="px-6 py-3 font-mono text-xs text-blue-300/80">{tcp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    VIEW: Protocol search
                ══════════════════════════════════════════════════════════════ */}
                {viewMode === 'search' && (
                    <div className="space-y-6">
                        {/* Search box */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Busca un protocolo por nombre, descripción o puerto... (ej: HTTP, 443, DNS)"
                                className="w-full bg-white/4 border border-white/10 rounded-2xl pl-11 pr-5 py-4 font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/6 transition-all"
                                autoFocus
                            />
                        </div>

                        {/* Results */}
                        {searchQuery && filteredProtocols.length === 0 && (
                            <div className="text-center py-12 text-slate-600 font-mono text-sm">
                                No se encontró ningún protocolo para "{searchQuery}"
                            </div>
                        )}

                        {filteredProtocols.length > 0 && (
                            <div className="space-y-2">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600 mb-3">
                                    {filteredProtocols.length} resultado{filteredProtocols.length !== 1 ? 's' : ''}
                                </p>
                                {filteredProtocols.map((p, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all hover:border-white/15"
                                        style={{
                                            background: p.layerColor + '10',
                                            borderColor: p.layerColor + '25',
                                        }}
                                    >
                                        {/* Layer badge */}
                                        <div
                                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black font-mono text-xs"
                                            style={{ background: p.layerColor + '22', color: p.layerColor, border: `1px solid ${p.layerColor}40` }}
                                        >
                                            L{p.layer}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-3 flex-wrap">
                                                <span className="font-black text-white text-sm">{p.name}</span>
                                                {p.port !== '—' && (
                                                    <span
                                                        className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border"
                                                        style={{ color: p.layerColor, background: p.layerColor + '15', borderColor: p.layerColor + '35' }}
                                                    >
                                                        :{p.port}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="font-mono text-xs text-slate-500 mt-0.5">{p.desc}</p>
                                        </div>

                                        <div className="flex-shrink-0 text-right">
                                            <span
                                                className="font-mono text-[10px] uppercase tracking-widest"
                                                style={{ color: p.layerColor + 'aa' }}
                                            >
                                                Capa {p.layer} — {p.layerName}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Protocol count overview */}
                        {!searchQuery && (
                            <div className="space-y-3">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                                    Base de datos de protocolos por capa
                                </p>
                                {OSI_LAYERS.map(l => (
                                    <button
                                        key={l.num}
                                        onClick={() => setSearchQuery(l.name.split(' ')[0])}
                                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all hover:brightness-125 text-left"
                                        style={{ background: l.colorAlpha, borderColor: l.colorBorder }}
                                    >
                                        <span
                                            className="font-black font-mono text-xs w-6 flex-shrink-0"
                                            style={{ color: l.colorLight }}
                                        >
                                            L{l.num}
                                        </span>
                                        <span className="font-black text-white text-xs uppercase flex-1">{l.name}</span>
                                        <span
                                            className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border"
                                            style={{ color: l.colorLight, background: l.colorAlpha, borderColor: l.colorBorder }}
                                        >
                                            {l.protocols.length} protocolos
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

// ─── Layer Detail Panel ────────────────────────────────────────────────────────
function LayerDetail({ layer, copiedItem, copyToClipboard }) {
    const LayerIcon = layer.icon;

    return (
        <div
            className="rounded-[2rem] border overflow-hidden"
            style={{ background: layer.colorAlpha, borderColor: layer.colorBorder }}
        >
            {/* Header */}
            <div
                className="px-7 pt-7 pb-5 border-b"
                style={{ borderColor: layer.colorBorder }}
            >
                <div className="flex items-center gap-4 mb-4">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: layer.color + '25', border: `1.5px solid ${layer.colorBorder}` }}
                    >
                        <LayerIcon className="w-6 h-6" style={{ color: layer.colorLight }} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span
                                className="font-mono text-xs font-black px-2 py-0.5 rounded border"
                                style={{ color: layer.colorLight, background: layer.color + '20', borderColor: layer.colorBorder }}
                            >
                                CAPA {layer.num}
                            </span>
                            <span className="font-mono text-[10px] text-slate-600 uppercase">{layer.nameEn}</span>
                        </div>
                        <h2 className="font-black text-white text-2xl uppercase tracking-tight mt-0.5">{layer.name}</h2>
                    </div>
                </div>

                {/* PDU + TCP/IP */}
                <div className="flex gap-3 flex-wrap">
                    <span
                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border"
                        style={{ color: layer.colorLight, background: layer.color + '15', borderColor: layer.colorBorder }}
                    >
                        PDU: {layer.pdu}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 bg-white/5">
                        TCP/IP: {layer.tcpLayer}
                    </span>
                </div>
            </div>

            <div className="px-7 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                {/* Description */}
                <p className="text-slate-300 text-sm leading-relaxed font-mono">{layer.description}</p>

                {/* Function */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 mb-2">Función Principal</p>
                    <p className="text-slate-400 text-xs leading-relaxed font-mono">{layer.function}</p>
                </div>

                {/* Devices */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 mb-2">Dispositivos</p>
                    <div className="flex flex-wrap gap-2">
                        {layer.devices.map(d => (
                            <span
                                key={d}
                                className="text-xs font-mono font-bold px-3 py-1 rounded-lg border"
                                style={{ color: layer.colorLight, background: layer.color + '12', borderColor: layer.colorBorder }}
                            >
                                {d}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Protocols table */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 mb-3">Protocolos</p>
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: layer.colorBorder + '80' }}>
                        {layer.protocols.map((p, i) => (
                            <div
                                key={p.name}
                                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/3"
                                style={{ borderBottom: i < layer.protocols.length - 1 ? `1px solid ${layer.colorBorder}50` : 'none' }}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-black text-white text-xs">{p.name}</span>
                                        {p.port !== '—' && (
                                            <span
                                                className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border"
                                                style={{ color: layer.colorLight, background: layer.color + '15', borderColor: layer.colorBorder }}
                                            >
                                                :{p.port}
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-mono text-[11px] text-slate-500 mt-0.5 leading-snug">{p.desc}</p>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(p.name, `proto-${p.name}`)}
                                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/8 border border-white/5"
                                    title="Copiar nombre"
                                >
                                    {copiedItem === `proto-${p.name}`
                                        ? <Check className="w-3 h-3 text-green-400" />
                                        : <Copy className="w-3 h-3 text-slate-600" />
                                    }
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Keywords */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 mb-2">Palabras Clave</p>
                    <div className="flex flex-wrap gap-1.5">
                        {layer.keywords.map(kw => (
                            <span
                                key={kw}
                                className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-white/4 border border-white/8 text-slate-400"
                            >
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Exam tip */}
                <div
                    className="flex items-start gap-3 p-4 rounded-xl border"
                    style={{ background: layer.color + '10', borderColor: layer.colorBorder }}
                >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: layer.colorLight }} />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: layer.colorLight + 'cc' }}>
                            Tip de Examen
                        </p>
                        <p className="font-mono text-xs text-slate-300 leading-relaxed">{layer.examTip}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
