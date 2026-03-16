/**
 * ToolCovers.jsx — Premium SVG cover art for Herramientas tool cards
 * One unique cover per tool, themed with relevant technical content
 */

// ─── 1. SUBNETTING & VLSM ── Blue #3b82f6 ────────────────────────────────────
export function CoverSubnetting() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="sn-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#00060f" />
                    <stop offset="100%" stopColor="#000408" />
                </linearGradient>
                <radialGradient id="sn-g" cx="35%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
                <pattern id="sn-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
                </pattern>
                <linearGradient id="sn-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#sn-bg)"/>
            <rect width="400" height="240" fill="url(#sn-grid)"/>
            <rect width="400" height="240" fill="url(#sn-g)"/>

            {/* IP breakdown visual */}
            <text x="20" y="35" fontFamily="monospace" fontSize="9" fill="rgba(96,165,250,0.7)" fontWeight="bold">IPv4 · CIDR · VLSM Calculator</text>

            {/* IP address binary breakdown */}
            <rect x="18" y="42" width="364" height="70" rx="7"
                fill="rgba(0,3,10,0.9)" stroke="rgba(59,130,246,0.25)" strokeWidth="1"/>
            <text x="30" y="61" fontFamily="monospace" fontSize="9.5">
                <tspan fill="#60a5fa" fontWeight="bold">192</tspan>
                <tspan fill="rgba(255,255,255,0.3)">.</tspan>
                <tspan fill="#60a5fa" fontWeight="bold">168</tspan>
                <tspan fill="rgba(255,255,255,0.3)">.</tspan>
                <tspan fill="#60a5fa" fontWeight="bold">10</tspan>
                <tspan fill="rgba(255,255,255,0.3)">.</tspan>
                <tspan fill="#fbbf24" fontWeight="bold">0</tspan>
                <tspan fill="rgba(255,255,255,0.4)"> / </tspan>
                <tspan fill="#22c55e" fontWeight="bold">24</tspan>
            </text>
            <rect x="30" y="65" width="335" height="1" fill="rgba(59,130,246,0.15)"/>
            <text x="30" y="80" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">11000000.10101000.00001010.</text>
            <text x="210" y="80" fontFamily="monospace" fontSize="8.5" fill="#fbbf24">00000000</text>
            <text x="30" y="96" fontFamily="monospace" fontSize="8.5">
                <tspan fill="rgba(59,130,246,0.8)">Máscara: </tspan>
                <tspan fill="rgba(255,255,255,0.5)">255.255.255.</tspan>
                <tspan fill="#fbbf24">0</tspan>
                <tspan fill="rgba(59,130,246,0.6)">   Hosts: </tspan>
                <tspan fill="#22c55e">254</tspan>
                <tspan fill="rgba(59,130,246,0.5)">   Broadcast: </tspan>
                <tspan fill="#ef4444">.255</tspan>
            </text>

            {/* VLSM subnets table */}
            <rect x="18" y="122" width="364" height="102" rx="7"
                fill="rgba(0,0,0,0.45)" stroke="rgba(59,130,246,0.18)" strokeWidth="1"/>
            <text x="30" y="140" fontFamily="monospace" fontSize="8.5" fill="rgba(59,130,246,0.7)" fontWeight="bold">VLSM — Subredes asignadas</text>
            <rect x="24" y="143" width="352" height="1" fill="rgba(59,130,246,0.12)"/>
            {/* Header */}
            <text x="30" y="156" fontFamily="monospace" fontSize="7.5" fill="rgba(59,130,246,0.6)" fontWeight="bold">Subred</text>
            <text x="130" y="156" fontFamily="monospace" fontSize="7.5" fill="rgba(59,130,246,0.6)" fontWeight="bold">Red</text>
            <text x="230" y="156" fontFamily="monospace" fontSize="7.5" fill="rgba(59,130,246,0.6)" fontWeight="bold">Hosts</text>
            <text x="295" y="156" fontFamily="monospace" fontSize="7.5" fill="rgba(59,130,246,0.6)" fontWeight="bold">Broadcast</text>
            {[
                ['Ventas /26',   '192.168.10.0',  '62', '192.168.10.63'],
                ['IT     /27',   '192.168.10.64', '30', '192.168.10.95'],
                ['MGMT   /28',   '192.168.10.96', '14', '192.168.10.111'],
                ['WAN    /30',   '192.168.10.112','2',  '192.168.10.115'],
            ].map((row, i) => (
                <g key={i}>
                    <rect x="18" y={160+i*16} width="364" height="16" fill={i%2===0 ? 'rgba(59,130,246,0.02)' : 'transparent'}/>
                    <text x="30" y={172+i*16} fontFamily="monospace" fontSize="8" fill="#60a5fa">{row[0]}</text>
                    <text x="130" y={172+i*16} fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.5)">{row[1]}</text>
                    <text x="230" y={172+i*16} fontFamily="monospace" fontSize="8" fill="#22c55e">{row[2]}</text>
                    <text x="295" y={172+i*16} fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.35)">{row[3]}</text>
                </g>
            ))}

            <rect width="400" height="3" fill="url(#sn-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── 2. CONVERSOR NUMÉRICO ── Emerald #10b981 ─────────────────────────────────
export function CoverBinaryConverter() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="bc-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#00100a" />
                    <stop offset="100%" stopColor="#000805" />
                </linearGradient>
                <radialGradient id="bc-g" cx="35%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <pattern id="bc-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5"/>
                </pattern>
                <linearGradient id="bc-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#10b981" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#bc-bg)"/>
            <rect width="400" height="240" fill="url(#bc-grid)"/>
            <rect width="400" height="240" fill="url(#bc-g)"/>

            {/* Big binary watermark */}
            <text x="-5" y="200" fontFamily="monospace" fontSize="130" fill="rgba(16,185,129,0.04)" fontWeight="bold">01</text>

            {/* Conversion flow boxes */}
            <text x="20" y="30" fontFamily="monospace" fontSize="9" fill="rgba(16,185,129,0.65)" fontWeight="bold">Conversor DEC · BIN · HEX · OCT</text>

            {[
                { base: 'DEC', val: '255', color: '#10b981', rgb: '16,185,129' },
                { base: 'BIN', val: '1111 1111', color: '#34d399', rgb: '52,211,153' },
                { base: 'HEX', val: '0xFF', color: '#6ee7b7', rgb: '110,231,183' },
                { base: 'OCT', val: '0377', color: '#a7f3d0', rgb: '167,243,208' },
            ].map((conv, i) => (
                <g key={conv.base}>
                    <rect x="18" y={40+i*44} width="364" height="36" rx="6"
                        fill={`rgba(${conv.rgb},0.07)`} stroke={`rgba(${conv.rgb},0.25)`} strokeWidth="1"/>
                    <text x="30" y={62+i*44} fontFamily="monospace" fontSize="8" fill={`rgba(${conv.rgb},0.7)`} fontWeight="bold">{conv.base}</text>
                    <text x="75" y={62+i*44} fontFamily="monospace" fontSize="12" fill={conv.color} fontWeight="bold">{conv.val}</text>
                    {i < 3 && (
                        <text x="195" y={79+i*44} fontFamily="monospace" fontSize="9" fill={`rgba(${conv.rgb},0.3)`} textAnchor="middle">↓</text>
                    )}
                    {/* Bit visualization for BIN */}
                    {conv.base === 'BIN' && (
                        <g>
                            {[1,1,1,1,1,1,1,1].map((bit, bi) => (
                                <rect key={bi} x={280+bi*11} y={49+i*44} width="9" height="16" rx="2"
                                    fill="rgba(52,211,153,0.25)" stroke="rgba(52,211,153,0.5)" strokeWidth="0.8"/>
                            ))}
                        </g>
                    )}
                </g>
            ))}

            <rect width="400" height="3" fill="url(#bc-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── 3. REFERENCIA DE PUERTOS ── Amber #f59e0b ────────────────────────────────
export function CoverPorts() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="po-bg" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#0e0700" />
                    <stop offset="100%" stopColor="#080400" />
                </linearGradient>
                <radialGradient id="po-g" cx="35%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
                <pattern id="po-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(245,158,11,0.07)" strokeWidth="0.5"/>
                </pattern>
                <linearGradient id="po-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#po-bg)"/>
            <rect width="400" height="240" fill="url(#po-grid)"/>
            <rect width="400" height="240" fill="url(#po-g)"/>

            <text x="20" y="28" fontFamily="monospace" fontSize="9" fill="rgba(245,158,11,0.65)" fontWeight="bold">Referencia de Puertos · 47 puertos esenciales</text>
            <rect x="18" y="32" width="364" height="1" fill="rgba(245,158,11,0.15)"/>

            {/* Port table */}
            <rect x="18" y="38" width="364" height="185" rx="7"
                fill="rgba(8,5,0,0.9)" stroke="rgba(245,158,11,0.2)" strokeWidth="1"/>
            {/* Header */}
            <rect x="18" y="38" width="364" height="18" rx="7" fill="rgba(245,158,11,0.1)"/>
            <rect x="18" y="46" width="364" height="10" fill="rgba(245,158,11,0.1)"/>
            <text x="28" y="50" fontFamily="monospace" fontSize="7.5" fill="rgba(245,158,11,0.7)" fontWeight="bold">Puerto</text>
            <text x="88" y="50" fontFamily="monospace" fontSize="7.5" fill="rgba(245,158,11,0.7)" fontWeight="bold">Protocolo</text>
            <text x="188" y="50" fontFamily="monospace" fontSize="7.5" fill="rgba(245,158,11,0.7)" fontWeight="bold">Servicio</text>
            <text x="292" y="50" fontFamily="monospace" fontSize="7.5" fill="rgba(245,158,11,0.7)" fontWeight="bold">Riesgo</text>
            <rect x="24" y="57" width="352" height="1" fill="rgba(245,158,11,0.12)"/>
            {[
                { port: '21',   proto: 'TCP',     srv: 'FTP',         risk: 'ALTO',    rc: '#ef4444' },
                { port: '22',   proto: 'TCP',     srv: 'SSH',         risk: 'MEDIO',   rc: '#fbbf24' },
                { port: '23',   proto: 'TCP',     srv: 'Telnet',      risk: 'CRÍTICO', rc: '#dc2626' },
                { port: '25',   proto: 'TCP',     srv: 'SMTP',        risk: 'MEDIO',   rc: '#fbbf24' },
                { port: '53',   proto: 'TCP/UDP', srv: 'DNS',         risk: 'BAJO',    rc: '#22c55e' },
                { port: '80',   proto: 'TCP',     srv: 'HTTP',        risk: 'MEDIO',   rc: '#fbbf24' },
                { port: '443',  proto: 'TCP',     srv: 'HTTPS',       risk: 'BAJO',    rc: '#22c55e' },
                { port: '3306', proto: 'TCP',     srv: 'MySQL',       risk: 'ALTO',    rc: '#ef4444' },
                { port: '3389', proto: 'TCP',     srv: 'RDP',         risk: 'CRÍTICO', rc: '#dc2626' },
                { port: '8080', proto: 'TCP',     srv: 'HTTP-Alt',    risk: 'BAJO',    rc: '#22c55e' },
            ].map((row, i) => (
                <g key={row.port}>
                    <rect x="18" y={60+i*16} width="364" height="16"
                        fill={i%2===0 ? 'rgba(245,158,11,0.02)' : 'transparent'}/>
                    <text x="28" y={72+i*16} fontFamily="monospace" fontSize="8" fill="#f59e0b" fontWeight="bold">{row.port}</text>
                    <text x="88" y={72+i*16} fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.45)">{row.proto}</text>
                    <text x="188" y={72+i*16} fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.6)">{row.srv}</text>
                    <rect x="290" y={63+i*16} width="48" height="10" rx="3" fill={row.rc + '22'}/>
                    <text x="314" y={72+i*16} fontFamily="monospace" fontSize="7" fill={row.rc} textAnchor="middle" fontWeight="bold">{row.risk}</text>
                </g>
            ))}

            <rect width="400" height="3" fill="url(#po-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── 4. CALCULADORA CHMOD ── Rose #f43f5e ─────────────────────────────────────
export function CoverChmod() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="cm-bg" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#0e0007" />
                    <stop offset="100%" stopColor="#070005" />
                </linearGradient>
                <radialGradient id="cm-g" cx="35%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>
                <pattern id="cm-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(244,63,94,0.07)" strokeWidth="0.5"/>
                </pattern>
                <linearGradient id="cm-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#f43f5e" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#cm-bg)"/>
            <rect width="400" height="240" fill="url(#cm-grid)"/>
            <rect width="400" height="240" fill="url(#cm-g)"/>

            <text x="20" y="28" fontFamily="monospace" fontSize="9" fill="rgba(244,63,94,0.65)" fontWeight="bold">chmod · Permisos Unix · Notación Octal</text>

            {/* Permission grid */}
            <rect x="18" y="35" width="364" height="102" rx="7"
                fill="rgba(10,0,5,0.9)" stroke="rgba(244,63,94,0.22)" strokeWidth="1"/>
            {/* Header row */}
            <rect x="18" y="35" width="364" height="18" rx="7" fill="rgba(244,63,94,0.08)"/>
            <rect x="18" y="43" width="364" height="10" fill="rgba(244,63,94,0.08)"/>
            <text x="28" y="47" fontFamily="monospace" fontSize="8" fill="rgba(244,63,94,0.6)"/>
            {['Propietario', 'Grupo', 'Otros'].map((role, i) => (
                <g key={role}>
                    <text x={120 + i*90} y="47" fontFamily="monospace" fontSize="8" fill="rgba(244,63,94,0.6)" textAnchor="middle">{role}</text>
                </g>
            ))}
            {/* rwx header */}
            {[0,1,2].map(col => ['r','w','x'].map((bit, bi) => (
                <text key={`${col}-${bi}`} x={93 + col*90 + bi*24} y="63" fontFamily="monospace" fontSize="9"
                    fill="rgba(255,255,255,0.35)" textAnchor="middle" fontWeight="bold">{bit}</text>
            )))}
            <rect x="24" y="65" width="352" height="1" fill="rgba(244,63,94,0.12)"/>
            {/* Permissions for 755 */}
            {[
                { role: 'Owner (7)', bits: [1,1,1], octal: '7' },
                { role: 'Group (5)', bits: [1,0,1], octal: '5' },
                { role: 'Other (5)', bits: [1,0,1], octal: '5' },
            ].map((row, ri) => (
                <g key={row.role}>
                    <text x="28" y={83+ri*20} fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.5)">{row.role}</text>
                    {row.bits.map((bit, bi) => (
                        <rect key={bi} x={80 + ri*90 + bi*24} y={72+ri*20} width="18" height="16" rx="3"
                            fill={bit ? 'rgba(244,63,94,0.25)' : 'rgba(255,255,255,0.04)'}
                            stroke={bit ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.08)'} strokeWidth="1"/>
                    ))}
                    {row.bits.map((bit, bi) => (
                        <text key={bi} x={89 + ri*90 + bi*24} y={84+ri*20} fontFamily="monospace" fontSize="9"
                            fill={bit ? '#f43f5e' : 'rgba(255,255,255,0.2)'} textAnchor="middle" fontWeight="bold">{bit ? '✓' : '—'}</text>
                    ))}
                </g>
            ))}

            {/* chmod command output */}
            <rect x="18" y="148" width="364" height="80" rx="7"
                fill="rgba(0,0,0,0.5)" stroke="rgba(244,63,94,0.18)" strokeWidth="1"/>
            <text x="30" y="167" fontFamily="monospace" fontSize="10" fill="#f43f5e">$ chmod 755 script.sh</text>
            <text x="30" y="185" fontFamily="monospace" fontSize="10" fill="#f43f5e">$ chmod u+x,g-w archivo.txt</text>
            <text x="30" y="200" fontFamily="monospace" fontSize="9">
                <tspan fill="rgba(255,255,255,0.4)">$ ls -la →  </tspan>
                <tspan fill="#f43f5e">-rwxr-xr-x</tspan>
                <tspan fill="rgba(255,255,255,0.4)"> root root</tspan>
            </text>
            <text x="30" y="218" fontFamily="monospace" fontSize="9">
                <tspan fill="rgba(255,255,255,0.3)">SUID:</tspan>
                <tspan fill="#f87171"> 4xxx  </tspan>
                <tspan fill="rgba(255,255,255,0.3)">SGID:</tspan>
                <tspan fill="#fb7185"> 2xxx  </tspan>
                <tspan fill="rgba(255,255,255,0.3)">Sticky:</tspan>
                <tspan fill="#fda4af"> 1xxx</tspan>
            </text>

            <rect width="400" height="3" fill="url(#cm-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── 5. MODELO OSI EXPLORER ── Violet #8b5cf6 ─────────────────────────────────
export function CoverOSI() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="os-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#05000e" />
                    <stop offset="100%" stopColor="#030008" />
                </linearGradient>
                <radialGradient id="os-g" cx="35%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
                <pattern id="os-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5"/>
                </pattern>
                <linearGradient id="os-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#8b5cf6" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#os-bg)"/>
            <rect width="400" height="240" fill="url(#os-grid)"/>
            <rect width="400" height="240" fill="url(#os-g)"/>

            <text x="20" y="24" fontFamily="monospace" fontSize="9" fill="rgba(139,92,246,0.65)" fontWeight="bold">Modelo OSI · 7 Capas · TCP/IP Explorer</text>

            {/* OSI Layer stack */}
            {[
                { n: 7, name: 'Aplicación',  proto: 'HTTP · FTP · DNS · SMTP',   c: '#a78bfa', rgb: '167,139,250' },
                { n: 6, name: 'Presentación', proto: 'SSL/TLS · JPEG · MPEG',    c: '#8b5cf6', rgb: '139,92,246' },
                { n: 5, name: 'Sesión',      proto: 'NetBIOS · RPC · PPTP',      c: '#7c3aed', rgb: '124,58,237' },
                { n: 4, name: 'Transporte',  proto: 'TCP · UDP · SCTP',          c: '#06b6d4', rgb: '6,182,212' },
                { n: 3, name: 'Red',         proto: 'IP · ICMP · ARP · OSPF',    c: '#22c55e', rgb: '34,197,94' },
                { n: 2, name: 'Enlace',      proto: 'Ethernet · PPP · VLAN',     c: '#f97316', rgb: '249,115,22' },
                { n: 1, name: 'Física',      proto: 'Cables · WiFi · Fibra',     c: '#ef4444', rgb: '239,68,68' },
            ].map((layer, i) => (
                <g key={layer.n}>
                    <rect x="18" y={28+i*28} width="364" height="25" rx="4"
                        fill={`rgba(${layer.rgb},0.09)`} stroke={`rgba(${layer.rgb},0.3)`} strokeWidth="1"/>
                    {/* Layer number badge */}
                    <rect x="22" y={32+i*28} width="22" height="17" rx="3"
                        fill={`rgba(${layer.rgb},0.18)`} stroke={`rgba(${layer.rgb},0.4)`} strokeWidth="0.8"/>
                    <text x="33" y={45+i*28} fontFamily="monospace" fontSize="9" fill={layer.c} textAnchor="middle" fontWeight="bold">{layer.n}</text>
                    <text x="52" y={45+i*28} fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.7)" fontWeight="bold">{layer.name.padEnd(13)}</text>
                    <text x="175" y={45+i*28} fontFamily="monospace" fontSize="8" fill={`rgba(${layer.rgb},0.7)`}>{layer.proto}</text>
                </g>
            ))}

            <rect width="400" height="3" fill="url(#os-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── LOOKUP MAP ──────────────────────────────────────────────────────────────
const TOOL_COVER_MAP = {
    'subnet':  CoverSubnetting,
    'binary':  CoverBinaryConverter,
    'ports':   CoverPorts,
    'chmod':   CoverChmod,
    'osi':     CoverOSI,
};

export function ToolCoverComponent({ toolId }) {
    const Component = TOOL_COVER_MAP[toolId] || CoverSubnetting;
    return <Component />;
}
