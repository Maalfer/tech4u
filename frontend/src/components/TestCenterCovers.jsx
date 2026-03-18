/**
 * TestCenterCovers.jsx — Premium SVG cover art for TestCenter subject cards
 * One unique cover per subject, themed with relevant technical content
 */

// ─── 1. EXAMEN GENERAL ── Amber #f59e0b ───────────────────────────────────────
export function CoverExamenGeneral() {
    return (
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="eg-bg" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#0e0800" />
                    <stop offset="100%" stopColor="#080500" />
                </linearGradient>
                <radialGradient id="eg-g1" cx="40%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="eg-g2" cx="80%" cy="75%" r="40%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </radialGradient>
                <pattern id="eg-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(245,158,11,0.1)" strokeWidth="0.5" />
                </pattern>
                <pattern id="eg-scan" width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect y="2" width="1" height="2" fill="rgba(0,0,0,0.2)" />
                </pattern>
                <filter id="eg-gf"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="eg-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            <rect width="400" height="500" fill="url(#eg-bg)" />
            <rect width="400" height="500" fill="url(#eg-grid)" />
            <rect width="400" height="500" fill="url(#eg-g1)" />
            <rect width="400" height="500" fill="url(#eg-g2)" />

            {/* Trophy decoration */}
            <text x="120" y="280" fontFamily="monospace" fontSize="180" fill="rgba(245,158,11,0.04)" fontWeight="bold">★</text>

            {/* Main exam card */}
            <rect x="25" y="35" width="350" height="185" rx="10"
                fill="rgba(12,8,0,0.9)" stroke="rgba(245,158,11,0.3)" strokeWidth="1.2" />
            <rect x="25" y="35" width="350" height="21" rx="10" fill="rgba(245,158,11,0.12)" />
            <rect x="25" y="45" width="350" height="11" fill="rgba(245,158,11,0.12)" />
            <circle cx="43" cy="46" r="4.5" fill="#ef4444" opacity="0.8" />
            <circle cx="58" cy="46" r="4.5" fill="#fbbf24" opacity="0.8" />
            <circle cx="73" cy="46" r="4.5" fill="#22c55e" opacity="0.8" />
            <text x="95" y="49" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.3)">ASIR — Examen Final · 60 preguntas</text>

            {/* Exam header */}
            <text x="40" y="80" fontFamily="monospace" fontSize="9.5" fill="rgba(245,158,11,0.6)" fontWeight="bold">CONVOCATORIA OFICIAL · ASIR 2024</text>
            <rect x="40" y="85" width="320" height="1" fill="rgba(245,158,11,0.15)" />

            {/* Question preview */}
            {[
                { n: '01', q: 'En el modelo OSI, ¿en qué capa opera el switch?', a: 'A) Capa 1  B) Capa 2  C) Capa 3  D) Capa 4' },
                { n: '02', q: 'Sintaxis correcta de SELECT con JOIN en SQL:', a: 'A) INNER JOIN  B) CROSS  C) LEFT  D) Todas' },
                { n: '03', q: '¿Qué comando muestra procesos activos en Linux?', a: 'A) ls  B) ps aux  C) top  D) B y C' },
            ].map((item, i) => (
                <g key={i}>
                    <text x="40" y={105 + i * 30} fontFamily="monospace" fontSize="8" fill="rgba(245,158,11,0.7)">[{item.n}]</text>
                    <text x="62" y={105 + i * 30} fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.6)">{item.q.slice(0, 42)}</text>
                    <text x="62" y={117 + i * 30} fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.3)">{item.a}</text>
                </g>
            ))}

            {/* Stats row */}
            <rect x="40" y="200" width="320" height="1" fill="rgba(245,158,11,0.12)" />
            <text x="40" y="218" fontFamily="monospace" fontSize="8.5" fill="rgba(245,158,11,0.6)">Tiempo: 35 min</text>
            <text x="165" y="218" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">Preguntas: 60</text>
            <text x="290" y="218" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">Nota: 0–10</text>

            {/* Subject breakdown */}
            <rect x="25" y="242" width="350" height="135" rx="8"
                fill="rgba(0,0,0,0.5)" stroke="rgba(245,158,11,0.18)" strokeWidth="1" />
            <text x="42" y="263" fontFamily="monospace" fontSize="8.5" fill="rgba(245,158,11,0.7)" fontWeight="bold">DISTRIBUCIÓN DE TEMAS</text>
            {[
                { sub: 'Bases de Datos',           c: '#8b5cf6', pct: 20 },
                { sub: 'Redes',                    c: '#0ea5e9', pct: 20 },
                { sub: 'Sistemas Operativos',      c: '#22c55e', pct: 20 },
                { sub: 'Fundamentos de Hardware',  c: '#f97316', pct: 20 },
                { sub: 'Lenguaje de Marcas',       c: '#06b6d4', pct: 20 },
            ].map((s, i) => (
                <g key={s.sub}>
                    <text x="42" y={282 + i * 17} fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.5)">{s.sub}</text>
                    <rect x="200" y={274 + i * 17} width="130" height="7" rx="3.5" fill="rgba(255,255,255,0.05)" />
                    <rect x="200" y={274 + i * 17} width={130 * s.pct / 100} height="7" rx="3.5" fill={s.c} opacity="0.7" />
                    <text x="338" y={281 + i * 17} fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.35)">{s.pct}%</text>
                </g>
            ))}

            {/* Score legend */}
            <rect x="25" y="395" width="350" height="85" rx="8"
                fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.18)" strokeWidth="1" />
            <text x="42" y="416" fontFamily="monospace" fontSize="8.5" fill="rgba(245,158,11,0.7)" fontWeight="bold">CRITERIOS DE CALIFICACIÓN</text>
            <text x="42" y="434" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.5)">Aprobado: ≥5.0   Sobresaliente: ≥9.0</text>
            <text x="42" y="450" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.4)">Penalización: -0.33 por error</text>
            <text x="42" y="466" fontFamily="monospace" fontSize="8.5" fill="rgba(245,158,11,0.6)">Modo supervivencia · Sin retroceso</text>

            <rect width="400" height="500" fill="url(#eg-scan)" opacity="0.5" style={{pointerEvents:'none'}} />
            <rect width="400" height="3" fill="url(#eg-tb)" opacity="0.9" />
        </svg>
    );
}

// ─── 2. BASES DE DATOS ── Purple #8b5cf6 ─────────────────────────────────────
export function CoverBasesDatos() {
    return (
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="bd-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#06000f" />
                    <stop offset="100%" stopColor="#040008" />
                </linearGradient>
                <radialGradient id="bd-g" cx="35%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
                <pattern id="bd-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="0.5" />
                </pattern>
                <pattern id="bd-scan" width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect y="2" width="1" height="2" fill="rgba(0,0,0,0.2)" />
                </pattern>
                <filter id="bd-gf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="bd-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor="#8b5cf6" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            <rect width="400" height="500" fill="url(#bd-bg)" />
            <rect width="400" height="500" fill="url(#bd-grid)" />
            <rect width="400" height="500" fill="url(#bd-g)" />

            {/* Database cylinder stack decoration */}
            {[0,1].map(i => (
                <g key={i} transform={`translate(${225 - i*5}, ${38 + i*12})`}>
                    <ellipse cx="85" cy="45" rx="75" ry="14" fill={`rgba(139,92,246,${0.07-i*0.01})`} stroke={`rgba(139,92,246,${0.4-i*0.08})`} strokeWidth="1"/>
                    <rect x="10" y="45" width="150" height="28" fill={`rgba(139,92,246,${0.05-i*0.01})`} stroke={`rgba(139,92,246,${0.25-i*0.04})`} strokeWidth="0.8"/>
                    <ellipse cx="85" cy="73" rx="75" ry="14" fill="rgba(5,0,12,0.8)" stroke={`rgba(139,92,246,${0.28-i*0.05})`} strokeWidth="1"/>
                </g>
            ))}
            <text x="260" y="118" fontFamily="monospace" fontSize="9" fill="rgba(139,92,246,0.7)" fontWeight="bold">PostgreSQL 16</text>

            {/* SQL query window */}
            <rect x="25" y="140" width="350" height="175" rx="10"
                fill="rgba(5,0,12,0.92)" stroke="rgba(139,92,246,0.3)" strokeWidth="1.2" />
            <rect x="25" y="140" width="350" height="21" rx="10" fill="rgba(139,92,246,0.12)" />
            <rect x="25" y="150" width="350" height="11" fill="rgba(139,92,246,0.12)" />
            <circle cx="43" cy="151" r="4.5" fill="#ef4444" opacity="0.8" />
            <circle cx="58" cy="151" r="4.5" fill="#fbbf24" opacity="0.8" />
            <circle cx="73" cy="151" r="4.5" fill="#22c55e" opacity="0.8" />
            <text x="95" y="154" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.3)">psql · database.sql — editor</text>

            {/* SQL code */}
            <text x="40" y="183" fontFamily="monospace" fontSize="10" fill="#a78bfa" filter="url(#bd-gf)">SELECT</text>
            <text x="94" y="183" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.7)"> a.nombre, a.nota,</text>
            <text x="40" y="198" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.5)">       m.asignatura</text>
            <text x="40" y="213" fontFamily="monospace" fontSize="10" fill="#a78bfa">FROM</text>
            <text x="78" y="213" fontFamily="monospace" fontSize="10" fill="#fbbf24">  alumnos a</text>
            <text x="40" y="228" fontFamily="monospace" fontSize="10" fill="#a78bfa">INNER JOIN</text>
            <text x="114" y="228" fontFamily="monospace" fontSize="10" fill="#fbbf24"> matriculas m</text>
            <text x="40" y="243" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.5)">  ON a.id = m.alumno_id</text>
            <text x="40" y="258" fontFamily="monospace" fontSize="10" fill="#a78bfa">WHERE</text>
            <text x="88" y="258" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.6)"> a.nota &gt;= </text>
            <text x="185" y="258" fontFamily="monospace" fontSize="10" fill="#22c55e">5.0</text>
            <text x="40" y="273" fontFamily="monospace" fontSize="10" fill="#a78bfa">ORDER BY</text>
            <text x="110" y="273" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.5)"> a.nota DESC</text>
            <text x="40" y="288" fontFamily="monospace" fontSize="10" fill="#a78bfa">LIMIT</text>
            <text x="83" y="288" fontFamily="monospace" fontSize="10" fill="#22c55e"> 10</text>
            <text x="97" y="288" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.35)">;</text>

            {/* Results table */}
            <rect x="25" y="333" width="350" height="140" rx="8"
                fill="rgba(0,0,0,0.5)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
            {/* Header row */}
            <rect x="25" y="333" width="350" height="20" rx="8" fill="rgba(139,92,246,0.15)" />
            <rect x="25" y="343" width="350" height="10" fill="rgba(139,92,246,0.15)" />
            <text x="40" y="347" fontFamily="monospace" fontSize="8.5" fill="rgba(139,92,246,0.9)" fontWeight="bold">nombre</text>
            <text x="160" y="347" fontFamily="monospace" fontSize="8.5" fill="rgba(139,92,246,0.9)" fontWeight="bold">nota</text>
            <text x="230" y="347" fontFamily="monospace" fontSize="8.5" fill="rgba(139,92,246,0.9)" fontWeight="bold">asignatura</text>
            {/* Separator */}
            <rect x="35" y="354" width="330" height="1" fill="rgba(139,92,246,0.2)" />
            {/* Data rows */}
            {[
                ['García López, M.', '9.5', 'Redes'],
                ['Martínez Torres', '8.7', 'Bases de Datos'],
                ['Rodríguez Pérez', '8.2', 'Sistemas Op.'],
                ['Fernández Gil',   '7.9', 'HW & Marcas'],
                ['López Sánchez',   '7.3', 'Lenguaje Marc.'],
            ].map((row, i) => (
                <g key={i}>
                    <rect x="25" y={358 + i*18} width="350" height="18"
                        fill={i % 2 === 0 ? 'rgba(139,92,246,0.03)' : 'transparent'} />
                    <text x="40" y={370 + i*18} fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.55)">{row[0]}</text>
                    <text x="160" y={370 + i*18} fontFamily="monospace" fontSize="8.5" fill="#a78bfa" fontWeight="bold">{row[1]}</text>
                    <text x="230" y={370 + i*18} fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.4)">{row[2]}</text>
                </g>
            ))}
            <text x="40" y="463" fontFamily="monospace" fontSize="8" fill="rgba(139,92,246,0.5)">5 rows in set (0.004 sec)</text>

            <rect width="400" height="500" fill="url(#bd-scan)" opacity="0.5" style={{pointerEvents:'none'}} />
            <rect width="400" height="3" fill="url(#bd-tb)" opacity="0.9" />
        </svg>
    );
}

// ─── 3. REDES ── Sky #0ea5e9 ──────────────────────────────────────────────────
export function CoverRedes() {
    return (
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="rd-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#000d14" />
                    <stop offset="100%" stopColor="#00060e" />
                </linearGradient>
                <radialGradient id="rd-g" cx="50%" cy="35%" r="55%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </radialGradient>
                <pattern id="rd-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(14,165,233,0.09)" strokeWidth="0.5" />
                </pattern>
                <pattern id="rd-scan" width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect y="2" width="1" height="2" fill="rgba(0,0,0,0.2)" />
                </pattern>
                <filter id="rd-gf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="rd-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor="#0ea5e9" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            <rect width="400" height="500" fill="url(#rd-bg)" />
            <rect width="400" height="500" fill="url(#rd-grid)" />
            <rect width="400" height="500" fill="url(#rd-g)" />

            {/* Network topology */}
            {/* Router center */}
            <circle cx="200" cy="115" r="22" fill="rgba(14,165,233,0.1)" stroke="rgba(14,165,233,0.45)" strokeWidth="1.5" />
            <text x="200" y="120" fontFamily="monospace" fontSize="8" fill="rgba(14,165,233,0.9)" textAnchor="middle" fontWeight="bold">ROUTER</text>
            {/* Lines to nodes */}
            {[[95,65],[305,65],[95,165],[305,165],[200,55]].map(([nx,ny],i) => (
                <line key={i} x1="200" y1="115" x2={nx} y2={ny}
                    stroke="rgba(14,165,233,0.25)" strokeWidth="1" strokeDasharray="4,3" />
            ))}
            {/* Switch */}
            <circle cx="200" cy="55" r="14" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.3)" strokeWidth="1.2" />
            <text x="200" y="59" fontFamily="monospace" fontSize="7" fill="rgba(14,165,233,0.8)" textAnchor="middle">SW</text>
            {/* Nodes */}
            {[
                {x:75, y:58, label:'PC-01', ip:'10.0.0.2'},
                {x:305, y:58, label:'PC-02', ip:'10.0.0.3'},
                {x:68, y:168, label:'SRV',  ip:'10.0.1.1'},
                {x:312, y:168, label:'AP',   ip:'192.168.1.1'},
            ].map(n => (
                <g key={n.label}>
                    <rect x={n.x-20} y={n.y-12} width="40" height="22" rx="4"
                        fill="rgba(14,165,233,0.07)" stroke="rgba(14,165,233,0.25)" strokeWidth="1" />
                    <text x={n.x} y={n.y+2} fontFamily="monospace" fontSize="7" fill="rgba(255,255,255,0.7)" textAnchor="middle" fontWeight="bold">{n.label}</text>
                    <text x={n.x} y={n.y+18} fontFamily="monospace" fontSize="6.5" fill="rgba(14,165,233,0.6)" textAnchor="middle">{n.ip}</text>
                </g>
            ))}

            {/* Terminal window */}
            <rect x="25" y="205" width="350" height="165" rx="10"
                fill="rgba(0,8,16,0.92)" stroke="rgba(14,165,233,0.28)" strokeWidth="1.2" />
            <rect x="25" y="205" width="350" height="21" rx="10" fill="rgba(14,165,233,0.12)" />
            <rect x="25" y="215" width="350" height="11" fill="rgba(14,165,233,0.12)" />
            <circle cx="43" cy="216" r="4.5" fill="#ef4444" opacity="0.8" />
            <circle cx="58" cy="216" r="4.5" fill="#fbbf24" opacity="0.8" />
            <circle cx="73" cy="216" r="4.5" fill="#22c55e" opacity="0.8" />
            <text x="95" y="219" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.3)">network diagnostics · wireshark</text>

            <text x="40" y="248" fontFamily="monospace" fontSize="10" fill="#0ea5e9" filter="url(#rd-gf)">$ ping -c 4 8.8.8.8</text>
            <text x="40" y="263" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.4)">PING 8.8.8.8 (8.8.8.8) 56 bytes</text>
            <text x="40" y="278" fontFamily="monospace" fontSize="8.5" fill="#22c55e">64 bytes from 8.8.8.8: icmp=1 ttl=115 time=12.4 ms</text>
            <text x="40" y="293" fontFamily="monospace" fontSize="8.5" fill="#22c55e">64 bytes from 8.8.8.8: icmp=2 ttl=115 time=11.8 ms</text>
            <text x="40" y="308" fontFamily="monospace" fontSize="8.5" fill="#22c55e">64 bytes from 8.8.8.8: icmp=3 ttl=115 time=13.1 ms</text>
            <text x="40" y="323" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.4)">--- 8.8.8.8 ping statistics ---</text>
            <text x="40" y="338" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.55)">4 packets: 4 rcvd, 0% loss, avg 12.4ms</text>
            <text x="40" y="355" fontFamily="monospace" fontSize="10" fill="#0ea5e9" filter="url(#rd-gf)">$ ip route show</text>

            {/* OSI Model panel */}
            <rect x="25" y="388" width="350" height="94" rx="8"
                fill="rgba(0,0,0,0.5)" stroke="rgba(14,165,233,0.18)" strokeWidth="1" />
            <text x="42" y="407" fontFamily="monospace" fontSize="8.5" fill="rgba(14,165,233,0.7)" fontWeight="bold">MODELO OSI</text>
            {[
                {n:7,l:'Aplicación',   c:'#a78bfa', proto:'HTTP · FTP · DNS'},
                {n:4,l:'Transporte',   c:'#0ea5e9', proto:'TCP · UDP · SCTP'},
                {n:3,l:'Red',          c:'#22c55e', proto:'IP · ICMP · ARP'},
                {n:2,l:'Enlace',       c:'#f97316', proto:'Ethernet · MAC'},
                {n:1,l:'Física',       c:'#ef4444', proto:'Cables · WiFi'},
            ].map((layer, i) => (
                <g key={layer.n}>
                    <text x="42" y={422 + i * 13} fontFamily="monospace" fontSize="7.5" fill={layer.c} fontWeight="bold">L{layer.n}</text>
                    <text x="60" y={422 + i * 13} fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.5)">{layer.l.padEnd(12)}</text>
                    <text x="168" y={422 + i * 13} fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.35)">{layer.proto}</text>
                </g>
            ))}

            <rect width="400" height="500" fill="url(#rd-scan)" opacity="0.5" style={{pointerEvents:'none'}} />
            <rect width="400" height="3" fill="url(#rd-tb)" opacity="0.9" />
        </svg>
    );
}

// ─── 4. SISTEMAS OPERATIVOS ── Green #22c55e ──────────────────────────────────
export function CoverSistemasOperativos() {
    return (
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="so-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#030e04" />
                    <stop offset="100%" stopColor="#020802" />
                </linearGradient>
                <radialGradient id="so-g" cx="35%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </radialGradient>
                <pattern id="so-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(34,197,94,0.09)" strokeWidth="0.5" />
                </pattern>
                <pattern id="so-scan" width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect y="2" width="1" height="2" fill="rgba(0,0,0,0.2)" />
                </pattern>
                <filter id="so-gf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="so-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor="#22c55e" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            <rect width="400" height="500" fill="url(#so-bg)" />
            <rect width="400" height="500" fill="url(#so-grid)" />
            <rect width="400" height="500" fill="url(#so-g)" />

            {/* Giant Linux tux silhouette - simplified */}
            <text x="230" y="260" fontFamily="serif" fontSize="180" fill="rgba(34,197,94,0.04)">🐧</text>

            {/* ps aux window */}
            <rect x="25" y="35" width="350" height="210" rx="10"
                fill="rgba(2,10,3,0.92)" stroke="rgba(34,197,94,0.3)" strokeWidth="1.2" />
            <rect x="25" y="35" width="350" height="21" rx="10" fill="rgba(34,197,94,0.12)" />
            <rect x="25" y="45" width="350" height="11" fill="rgba(34,197,94,0.12)" />
            <circle cx="43" cy="46" r="4.5" fill="#ef4444" opacity="0.8" />
            <circle cx="58" cy="46" r="4.5" fill="#fbbf24" opacity="0.8" />
            <circle cx="73" cy="46" r="4.5" fill="#22c55e" opacity="0.8" />
            <text x="95" y="49" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.3)">root@debian — htop · procesos</text>

            <text x="40" y="80" fontFamily="monospace" fontSize="10" fill="#22c55e" filter="url(#so-gf)">$ ps aux --sort=-%cpu | head</text>
            {/* Table header */}
            <text x="40" y="97" fontFamily="monospace" fontSize="8" fill="rgba(34,197,94,0.7)" fontWeight="bold">USER     PID   %CPU  %MEM  COMMAND</text>
            <rect x="35" y="100" width="330" height="1" fill="rgba(34,197,94,0.15)" />
            {[
                ['root',    '1',    '0.0', '0.1', 'systemd'],
                ['www-data','1234', '12.5','1.8', 'nginx: worker'],
                ['mysql',   '1567', '8.3', '3.2', 'mysqld'],
                ['alumno',  '2341', '4.7', '0.9', 'python3 app.py'],
                ['root',    '891',  '2.1', '0.5', 'sshd: alumno'],
                ['alumno',  '3421', '0.8', '0.3', 'bash'],
                ['root',    '2',    '0.0', '0.0', 'kthreadd'],
            ].map((p, i) => (
                <g key={i}>
                    <text x="40" y={114 + i*16} fontFamily="monospace" fontSize="8.5"
                        fill={p[0]==='alumno' ? '#a3e635' : p[0]==='root' ? '#ef4444' : 'rgba(255,255,255,0.5)'}>{p[0]}</text>
                    <text x="110" y={114 + i*16} fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">{p[1]}</text>
                    <text x="155" y={114 + i*16} fontFamily="monospace" fontSize="8.5"
                        fill={parseFloat(p[2]) > 8 ? '#ef4444' : '#22c55e'}>{p[2]}</text>
                    <text x="207" y={114 + i*16} fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">{p[3]}</text>
                    <text x="255" y={114 + i*16} fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.5)">{p[4]}</text>
                </g>
            ))}

            {/* systemctl panel */}
            <rect x="25" y="262" width="215" height="130" rx="8"
                fill="rgba(0,0,0,0.5)" stroke="rgba(34,197,94,0.18)" strokeWidth="1" />
            <text x="40" y="282" fontFamily="monospace" fontSize="8.5" fill="rgba(34,197,94,0.7)" fontWeight="bold">$ systemctl status</text>
            {[
                ['● nginx.service',     'active',  '#22c55e'],
                ['● mysql.service',     'active',  '#22c55e'],
                ['● ssh.service',       'active',  '#22c55e'],
                ['● firewalld',         'inactive','#ef4444'],
                ['● cron.service',      'active',  '#22c55e'],
            ].map((s, i) => (
                <g key={s[0]}>
                    <circle cx="42" cy={296 + i*17} r="4" fill={s[2]} opacity="0.7" />
                    <text x="52" y={300 + i*17} fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.55)">{s[0]}</text>
                    <text x="52" y={300 + i*17} fontFamily="monospace" fontSize="8" fill={s[2]}>{''}</text>
                </g>
            ))}

            {/* CPU/Memory gauges */}
            <rect x="255" y="262" width="120" height="130" rx="8"
                fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.2)" strokeWidth="1" />
            <text x="268" y="282" fontFamily="monospace" fontSize="8.5" fill="rgba(34,197,94,0.7)" fontWeight="bold">RECURSOS</text>
            {[
                {label:'CPU',  val:42, c:'#22c55e'},
                {label:'RAM',  val:68, c:'#0ea5e9'},
                {label:'SWAP', val:15, c:'#f97316'},
                {label:'DISK', val:55, c:'#a78bfa'},
            ].map((r, i) => (
                <g key={r.label}>
                    <text x="268" y={300 + i*22} fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.5)">{r.label}</text>
                    <rect x="300" y={292 + i*22} width="60" height="8" rx="4" fill="rgba(255,255,255,0.05)" />
                    <rect x="300" y={292 + i*22} width={60*r.val/100} height="8" rx="4" fill={r.c} opacity="0.75" />
                    <text x="368" y={300 + i*22} fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.4)">{r.val}%</text>
                </g>
            ))}

            {/* Commands row */}
            <rect x="25" y="408" width="350" height="72" rx="8"
                fill="rgba(0,0,0,0.45)" stroke="rgba(34,197,94,0.15)" strokeWidth="1" />
            {[
                ['$ kill -9 1234',   '#ef4444'],
                ['$ crontab -e',     '#22c55e'],
                ['$ journalctl -f',  '#0ea5e9'],
                ['$ df -h',          '#22c55e'],
            ].map(([cmd, c], i) => (
                <text key={cmd} x={42 + (i % 2) * 170} y={428 + Math.floor(i/2) * 22}
                    fontFamily="monospace" fontSize="9" fill={`${c}cc`}>{cmd}</text>
            ))}

            <rect width="400" height="500" fill="url(#so-scan)" opacity="0.5" style={{pointerEvents:'none'}} />
            <rect width="400" height="3" fill="url(#so-tb)" opacity="0.9" />
        </svg>
    );
}

// ─── 5. FUNDAMENTOS DE HARDWARE ── Orange #f97316 ────────────────────────────
export function CoverFundamentosHardware() {
    return (
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="hw-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#0e0500" />
                    <stop offset="100%" stopColor="#080400" />
                </linearGradient>
                <radialGradient id="hw-g" cx="40%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
                <pattern id="hw-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(249,115,22,0.09)" strokeWidth="0.5" />
                </pattern>
                <pattern id="hw-scan" width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect y="2" width="1" height="2" fill="rgba(0,0,0,0.2)" />
                </pattern>
                <filter id="hw-gf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="hw-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor="#f97316" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            <rect width="400" height="500" fill="url(#hw-bg)" />
            <rect width="400" height="500" fill="url(#hw-grid)" />
            <rect width="400" height="500" fill="url(#hw-g)" />

            {/* CPU die diagram */}
            <rect x="130" y="35" width="140" height="140" rx="6"
                fill="rgba(249,115,22,0.06)" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" />
            {/* CPU core grid 2x2 */}
            {[[0,0],[1,0],[0,1],[1,1]].map(([cx,cy],i) => (
                <g key={i}>
                    <rect x={150 + cx*58} y={55 + cy*56} width="48" height="46" rx="4"
                        fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />
                    <text x={174 + cx*58} y={83 + cy*56} fontFamily="monospace" fontSize="8" fill="rgba(249,115,22,0.7)" textAnchor="middle">Core {i}</text>
                </g>
            ))}
            {/* CPU label */}
            <text x="200" y="168" fontFamily="monospace" fontSize="9" fill="rgba(249,115,22,0.8)" textAnchor="middle" fontWeight="bold">Intel i7-12700K</text>
            <text x="200" y="182" fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.35)" textAnchor="middle">3.60 GHz · 12 Cores · LGA1700</text>

            {/* CPU pins */}
            {Array.from({length:14}).map((_,i) => (
                <rect key={`t${i}`} x={133 + i*10} y="172" width="6" height="4" rx="1" fill="rgba(249,115,22,0.3)" />
            ))}

            {/* Specs window */}
            <rect x="25" y="205" width="350" height="160" rx="10"
                fill="rgba(10,4,0,0.92)" stroke="rgba(249,115,22,0.28)" strokeWidth="1.2" />
            <rect x="25" y="205" width="350" height="21" rx="10" fill="rgba(249,115,22,0.12)" />
            <rect x="25" y="215" width="350" height="11" fill="rgba(249,115,22,0.12)" />
            <circle cx="43" cy="216" r="4.5" fill="#ef4444" opacity="0.8" />
            <circle cx="58" cy="216" r="4.5" fill="#fbbf24" opacity="0.8" />
            <circle cx="73" cy="216" r="4.5" fill="#22c55e" opacity="0.8" />
            <text x="95" y="219" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.3)">lshw · CPU-Z · hardware info</text>

            <text x="40" y="248" fontFamily="monospace" fontSize="10" fill="#f97316" filter="url(#hw-gf)">$ lshw -C cpu | grep -E "product|speed"</text>
            <text x="40" y="264" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">     product: 12th Gen Intel Core i7-12700K</text>
            <text x="40" y="279" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">       width: 64 bits · bus info: cpu@0</text>
            <text x="40" y="294" fontFamily="monospace" fontSize="10" fill="#f97316" filter="url(#hw-gf)">$ dmidecode -t memory | head -20</text>
            <text x="40" y="310" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.4)">  Size: 32 GB · Type: DDR5 · Speed: 5200</text>
            <text x="40" y="325" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">  Manufacturer: Kingston · Slots: 4</text>
            <text x="40" y="341" fontFamily="monospace" fontSize="10" fill="#f97316" filter="url(#hw-gf)">$ lspci | grep -i vga</text>
            <text x="40" y="357" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.4)">  NVIDIA GeForce RTX 4070 · VRAM: 12GB</text>

            {/* Component chart */}
            <rect x="25" y="382" width="350" height="100" rx="8"
                fill="rgba(0,0,0,0.45)" stroke="rgba(249,115,22,0.15)" strokeWidth="1" />
            <text x="42" y="401" fontFamily="monospace" fontSize="8.5" fill="rgba(249,115,22,0.7)" fontWeight="bold">ARQUITECTURA DEL SISTEMA</text>
            {[
                {comp:'CPU',  bus:'Front-Side Bus', bw:'192 GB/s', c:'#f97316'},
                {comp:'RAM',  bus:'Memory Channel', bw:'83.2 GB/s', c:'#0ea5e9'},
                {comp:'GPU',  bus:'PCIe 4.0 x16',   bw:'32 GB/s',  c:'#a78bfa'},
                {comp:'NVMe', bus:'PCIe 4.0 x4',    bw:'7 GB/s',   c:'#22c55e'},
            ].map((c, i) => (
                <g key={c.comp}>
                    <rect x="42" y={410 + i*16} width="6" height="10" rx="1" fill={c.c} opacity="0.7" />
                    <text x="54" y={420 + i*16} fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.6)">{c.comp}</text>
                    <text x="95" y={420 + i*16} fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.35)">{c.bus}</text>
                    <text x="310" y={420 + i*16} fontFamily="monospace" fontSize="8" fill={c.c} textAnchor="end">{c.bw}</text>
                </g>
            ))}

            <rect width="400" height="500" fill="url(#hw-scan)" opacity="0.5" style={{pointerEvents:'none'}} />
            <rect width="400" height="3" fill="url(#hw-tb)" opacity="0.9" />
        </svg>
    );
}

// ─── 6. LENGUAJE DE MARCAS ── Cyan #06b6d4 ───────────────────────────────────
export function CoverLenguajeMarcas() {
    return (
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="lm-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#000e10" />
                    <stop offset="100%" stopColor="#000708" />
                </linearGradient>
                <radialGradient id="lm-g" cx="35%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </radialGradient>
                <pattern id="lm-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(6,182,212,0.09)" strokeWidth="0.5" />
                </pattern>
                <pattern id="lm-scan" width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect y="2" width="1" height="2" fill="rgba(0,0,0,0.2)" />
                </pattern>
                <filter id="lm-gf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="lm-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            <rect width="400" height="500" fill="url(#lm-bg)" />
            <rect width="400" height="500" fill="url(#lm-grid)" />
            <rect width="400" height="500" fill="url(#lm-g)" />

            {/* Big decorative tag */}
            <text x="190" y="200" fontFamily="monospace" fontSize="140" fill="rgba(6,182,212,0.04)" fontWeight="bold">&lt;/&gt;</text>

            {/* HTML editor window */}
            <rect x="25" y="35" width="350" height="235" rx="10"
                fill="rgba(0,8,10,0.92)" stroke="rgba(6,182,212,0.28)" strokeWidth="1.2" />
            <rect x="25" y="35" width="350" height="21" rx="10" fill="rgba(6,182,212,0.12)" />
            <rect x="25" y="45" width="350" height="11" fill="rgba(6,182,212,0.12)" />
            <circle cx="43" cy="46" r="4.5" fill="#ef4444" opacity="0.8" />
            <circle cx="58" cy="46" r="4.5" fill="#fbbf24" opacity="0.8" />
            <circle cx="73" cy="46" r="4.5" fill="#22c55e" opacity="0.8" />
            <text x="95" y="49" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.3)">index.html — VSCode · HTML5</text>

            {/* Line numbers */}
            <rect x="25" y="56" width="28" height="214" fill="rgba(6,182,212,0.04)" />
            {[1,2,3,4,5,6,7,8,9,10,11,12,13].map((n,i) => (
                <text key={n} x="38" y={75+i*16} fontFamily="monospace" fontSize="8"
                    fill="rgba(6,182,212,0.3)" textAnchor="middle">{n}</text>
            ))}

            {/* HTML code */}
            <text x="62" y="75" fontFamily="monospace" fontSize="9.5" fill="rgba(255,255,255,0.3)">&lt;!DOCTYPE html&gt;</text>
            <text x="62" y="91" fontFamily="monospace" fontSize="9.5"><tspan fill="#06b6d4">&lt;html </tspan><tspan fill="#a78bfa">lang</tspan><tspan fill="rgba(255,255,255,0.5)">=</tspan><tspan fill="#22c55e">"es"</tspan><tspan fill="#06b6d4">&gt;</tspan></text>
            <text x="62" y="107" fontFamily="monospace" fontSize="9.5"><tspan fill="#06b6d4">  &lt;head&gt;</tspan></text>
            <text x="62" y="123" fontFamily="monospace" fontSize="9.5"><tspan fill="#06b6d4">    &lt;meta </tspan><tspan fill="#a78bfa">charset</tspan><tspan fill="rgba(255,255,255,0.5)">=</tspan><tspan fill="#22c55e">"UTF-8"</tspan><tspan fill="#06b6d4">&gt;</tspan></text>
            <text x="62" y="139" fontFamily="monospace" fontSize="9.5"><tspan fill="#06b6d4">    &lt;title&gt;</tspan><tspan fill="rgba(255,255,255,0.6)">ASIR</tspan><tspan fill="#06b6d4">&lt;/title&gt;</tspan></text>
            <text x="62" y="155" fontFamily="monospace" fontSize="9.5"><tspan fill="#06b6d4">    &lt;link </tspan><tspan fill="#a78bfa">rel</tspan><tspan fill="rgba(255,255,255,0.5)">=</tspan><tspan fill="#22c55e">"stylesheet"</tspan><tspan fill="#06b6d4">&gt;</tspan></text>
            <text x="62" y="171" fontFamily="monospace" fontSize="9.5"><tspan fill="#06b6d4">  &lt;/head&gt;</tspan></text>
            <text x="62" y="187" fontFamily="monospace" fontSize="9.5"><tspan fill="#06b6d4">  &lt;body&gt;</tspan></text>
            <text x="62" y="203" fontFamily="monospace" fontSize="9.5"><tspan fill="#06b6d4">    &lt;h1 </tspan><tspan fill="#a78bfa">class</tspan><tspan fill="rgba(255,255,255,0.5)">=</tspan><tspan fill="#22c55e">"title"</tspan><tspan fill="#06b6d4">&gt;</tspan><tspan fill="rgba(255,255,255,0.6)">Hola</tspan><tspan fill="#06b6d4">&lt;/h1&gt;</tspan></text>
            <text x="62" y="219" fontFamily="monospace" fontSize="9.5"><tspan fill="#06b6d4">    &lt;nav </tspan><tspan fill="#a78bfa">id</tspan><tspan fill="rgba(255,255,255,0.5)">=</tspan><tspan fill="#22c55e">"menu"</tspan><tspan fill="#06b6d4">&gt;&lt;/nav&gt;</tspan></text>
            <text x="62" y="235" fontFamily="monospace" fontSize="9.5"><tspan fill="#06b6d4">  &lt;/body&gt;</tspan></text>
            <rect x="258" y="227" width="8" height="12" fill="#06b6d4" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0;0.8" dur="1.1s" repeatCount="indefinite" />
            </rect>

            {/* CSS panel */}
            <rect x="25" y="288" width="170" height="192" rx="8"
                fill="rgba(0,5,8,0.85)" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
            <text x="40" y="308" fontFamily="monospace" fontSize="8.5" fill="rgba(6,182,212,0.7)" fontWeight="bold">styles.css</text>
            <text x="40" y="326" fontFamily="monospace" fontSize="8.5"><tspan fill="#a78bfa">.title</tspan><tspan fill="rgba(255,255,255,0.5)"> {'{'}</tspan></text>
            <text x="40" y="342" fontFamily="monospace" fontSize="8.5"><tspan fill="rgba(255,255,255,0.35)">  </tspan><tspan fill="#f97316">color</tspan><tspan fill="rgba(255,255,255,0.5)">: </tspan><tspan fill="#22c55e">#06b6d4</tspan><tspan fill="rgba(255,255,255,0.5)">;</tspan></text>
            <text x="40" y="358" fontFamily="monospace" fontSize="8.5"><tspan fill="#f97316">  font-size</tspan><tspan fill="rgba(255,255,255,0.5)">: </tspan><tspan fill="#22c55e">2rem</tspan><tspan fill="rgba(255,255,255,0.5)">;</tspan></text>
            <text x="40" y="374" fontFamily="monospace" fontSize="8.5"><tspan fill="#f97316">  display</tspan><tspan fill="rgba(255,255,255,0.5)">: </tspan><tspan fill="#22c55e">flex</tspan><tspan fill="rgba(255,255,255,0.5)">;</tspan></text>
            <text x="40" y="390" fontFamily="monospace" fontSize="8.5"><tspan fill="rgba(255,255,255,0.5)">{'}'}</tspan></text>
            <text x="40" y="408" fontFamily="monospace" fontSize="8.5"><tspan fill="#a78bfa">@media</tspan><tspan fill="rgba(255,255,255,0.4)"> (max-width:</tspan></text>
            <text x="40" y="424" fontFamily="monospace" fontSize="8.5"><tspan fill="rgba(255,255,255,0.4)">         </tspan><tspan fill="#22c55e">768px</tspan><tspan fill="rgba(255,255,255,0.4)">) {'{'}</tspan></text>
            <text x="40" y="440" fontFamily="monospace" fontSize="8.5"><tspan fill="#f97316">  flex-dir</tspan><tspan fill="rgba(255,255,255,0.4)">: col;</tspan></text>
            <text x="40" y="456" fontFamily="monospace" fontSize="8.5"><tspan fill="rgba(255,255,255,0.5)">}</tspan></text>
            <text x="40" y="472" fontFamily="monospace" fontSize="8.5" fill="rgba(6,182,212,0.4)">/* XML · XSD · XSLT */</text>

            {/* XML panel */}
            <rect x="210" y="288" width="165" height="192" rx="8"
                fill="rgba(0,0,0,0.45)" stroke="rgba(6,182,212,0.15)" strokeWidth="1" />
            <text x="225" y="308" fontFamily="monospace" fontSize="8.5" fill="rgba(6,182,212,0.7)" fontWeight="bold">config.xml</text>
            <text x="225" y="326" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.3)">&lt;?xml version="1.0"?&gt;</text>
            <text x="225" y="342" fontFamily="monospace" fontSize="8.5"><tspan fill="#06b6d4">&lt;config&gt;</tspan></text>
            <text x="225" y="358" fontFamily="monospace" fontSize="8.5"><tspan fill="#06b6d4">  &lt;server&gt;</tspan></text>
            <text x="225" y="374" fontFamily="monospace" fontSize="8.5"><tspan fill="#a78bfa">    &lt;host&gt;</tspan><tspan fill="#22c55e">localhost</tspan><tspan fill="#a78bfa">&lt;/&gt;</tspan></text>
            <text x="225" y="390" fontFamily="monospace" fontSize="8.5"><tspan fill="#a78bfa">    &lt;port&gt;</tspan><tspan fill="#22c55e">8080</tspan><tspan fill="#a78bfa">&lt;/&gt;</tspan></text>
            <text x="225" y="406" fontFamily="monospace" fontSize="8.5"><tspan fill="#06b6d4">  &lt;/server&gt;</tspan></text>
            <text x="225" y="422" fontFamily="monospace" fontSize="8.5"><tspan fill="#06b6d4">  &lt;db&gt;</tspan></text>
            <text x="225" y="438" fontFamily="monospace" fontSize="8.5"><tspan fill="#a78bfa">    &lt;name&gt;</tspan><tspan fill="#22c55e">asir</tspan><tspan fill="#a78bfa">&lt;/&gt;</tspan></text>
            <text x="225" y="454" fontFamily="monospace" fontSize="8.5"><tspan fill="#06b6d4">  &lt;/db&gt;</tspan></text>
            <text x="225" y="470" fontFamily="monospace" fontSize="8.5"><tspan fill="#06b6d4">&lt;/config&gt;</tspan></text>

            <rect width="400" height="500" fill="url(#lm-scan)" opacity="0.5" style={{pointerEvents:'none'}} />
            <rect width="400" height="3" fill="url(#lm-tb)" opacity="0.9" />
        </svg>
    );
}

// ─── 7. CIBERSEGURIDAD ── Red #ef4444 ────────────────────────────────────────
export function CoverCiberseguridad() {
    return (
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="cs-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#0e0000" />
                    <stop offset="100%" stopColor="#080000" />
                </linearGradient>
                <radialGradient id="cs-g1" cx="35%" cy="25%" r="55%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="cs-g2" cx="75%" cy="72%" r="40%">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                </radialGradient>
                <pattern id="cs-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(239,68,68,0.09)" strokeWidth="0.5" />
                </pattern>
                <pattern id="cs-scan" width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect y="2" width="1" height="2" fill="rgba(0,0,0,0.2)" />
                </pattern>
                <filter id="cs-gf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="cs-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor="#ef4444" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            <rect width="400" height="500" fill="url(#cs-bg)" />
            <rect width="400" height="500" fill="url(#cs-grid)" />
            <rect width="400" height="500" fill="url(#cs-g1)" />
            <rect width="400" height="500" fill="url(#cs-g2)" />

            {/* Faint hex stream decoration */}
            <text x="18" y="195" fontFamily="monospace" fontSize="7.5" fill="rgba(239,68,68,0.07)" letterSpacing="1.5">4d5a900003000000040000ffff000000b8000000000000004000000000000000</text>
            <text x="18" y="205" fontFamily="monospace" fontSize="7.5" fill="rgba(239,68,68,0.05)" letterSpacing="1.5">000000000000000000000000000000000000000000000000000000000000e800</text>

            {/* Outer shield */}
            <path d="M200 36 L268 64 L268 122 Q268 170 200 196 Q132 170 132 122 L132 64 Z"
                fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.25)" strokeWidth="1.5" />
            {/* Inner shield */}
            <path d="M200 52 L252 74 L252 118 Q252 158 200 178 Q148 158 148 118 L148 74 Z"
                fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.18)" strokeWidth="1" />

            {/* Lock shackle */}
            <path d="M194 122 L194 111 Q194 102 200 102 Q206 102 206 111 L206 122"
                fill="none" stroke="rgba(239,68,68,0.75)" strokeWidth="2.2" strokeLinecap="round" />
            {/* Lock body */}
            <rect x="187" y="122" width="26" height="22" rx="4"
                fill="rgba(239,68,68,0.28)" stroke="rgba(239,68,68,0.75)" strokeWidth="1.3" />
            {/* Keyhole */}
            <circle cx="200" cy="130" r="3.8" fill="rgba(8,0,0,0.9)" />
            <rect x="198.5" y="131" width="3" height="6" rx="1.2" fill="rgba(8,0,0,0.9)" />

            {/* Shield label */}
            <text x="200" y="164" fontFamily="monospace" fontSize="8" fill="rgba(239,68,68,0.8)"
                textAnchor="middle" fontWeight="bold" letterSpacing="3">CIBERSEGURIDAD</text>

            {/* Alert badges flanking shield */}
            <rect x="32" y="78" width="48" height="15" rx="7.5"
                fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.35)" strokeWidth="0.8" />
            <text x="56" y="89" fontFamily="monospace" fontSize="7" fill="#ef4444"
                textAnchor="middle" fontWeight="bold">⚠ ALERT</text>
            <rect x="320" y="78" width="48" height="15" rx="7.5"
                fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.25)" strokeWidth="0.8" />
            <text x="344" y="89" fontFamily="monospace" fontSize="7" fill="rgba(239,68,68,0.7)"
                textAnchor="middle">CVE-2024</text>

            {/* Topic tags row */}
            {['Malware','Forense','Cifrado','Redes'].map((tag, i) => (
                <g key={tag}>
                    <rect x={25 + i*90} y="198" width={tag.length*6.5+10} height="13" rx="6.5"
                        fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" strokeWidth="0.7" />
                    <text x={30 + i*90} y="208" fontFamily="monospace" fontSize="7.5"
                        fill="rgba(239,68,68,0.65)">{tag}</text>
                </g>
            ))}

            {/* nmap terminal window */}
            <rect x="25" y="220" width="350" height="168" rx="10"
                fill="rgba(10,0,0,0.93)" stroke="rgba(239,68,68,0.28)" strokeWidth="1.2" />
            <rect x="25" y="220" width="350" height="21" rx="10" fill="rgba(239,68,68,0.12)" />
            <rect x="25" y="230" width="350" height="11" fill="rgba(239,68,68,0.12)" />
            <circle cx="43" cy="231" r="4.5" fill="#ef4444" opacity="0.8" />
            <circle cx="58" cy="231" r="4.5" fill="#fbbf24" opacity="0.8" />
            <circle cx="73" cy="231" r="4.5" fill="#22c55e" opacity="0.8" />
            <text x="95" y="234" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.3)">security-audit · nmap · snort</text>

            <text x="40" y="264" fontFamily="monospace" fontSize="9.5" fill="#ef4444" filter="url(#cs-gf)">$ nmap -sV --script vuln 10.0.0.1</text>
            <text x="40" y="279" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.3)">Starting Nmap 7.94 · vuln scan</text>
            {[
                {port:'22/tcp',  st:'open',     svc:'OpenSSH 8.9p1',   c:'#22c55e'},
                {port:'80/tcp',  st:'open',     svc:'nginx 1.24.0',    c:'#22c55e'},
                {port:'443/tcp', st:'open',     svc:'TLS 1.3 · HTTPS', c:'#22c55e'},
                {port:'3389/tcp',st:'filtered', svc:'ms-wbt-server',   c:'#fbbf24'},
                {port:'4444/tcp',st:'open',     svc:'!! SHELL ALERT',  c:'#ef4444'},
            ].map((r, i) => (
                <g key={i}>
                    <text x="40"  y={297 + i*16} fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.5)">{r.port}</text>
                    <text x="118" y={297 + i*16} fontFamily="monospace" fontSize="8" fill={r.c}>{r.st}</text>
                    <text x="195" y={297 + i*16} fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.4)">{r.svc}</text>
                </g>
            ))}
            <text x="40" y="380" fontFamily="monospace" fontSize="8" fill="rgba(239,68,68,0.6)" filter="url(#cs-gf)">5 hosts · 1 critical: port 4444 exposed</text>

            {/* Firewall rules panel */}
            <rect x="25" y="398" width="168" height="86" rx="8"
                fill="rgba(0,0,0,0.5)" stroke="rgba(239,68,68,0.18)" strokeWidth="1" />
            <text x="40" y="416" fontFamily="monospace" fontSize="8.5" fill="rgba(239,68,68,0.7)" fontWeight="bold">FIREWALL · iptables</text>
            {[
                {r:'ACCEPT  tcp  dpt:22',    c:'rgba(255,255,255,0.45)'},
                {r:'ACCEPT  tcp  dpt:443',   c:'rgba(255,255,255,0.45)'},
                {r:'DROP    tcp  dpt:4444',  c:'#ef4444bb'},
                {r:'DROP    all  0.0.0.0/0', c:'#ef4444aa'},
            ].map((rule, i) => (
                <text key={i} x="40" y={433 + i*14} fontFamily="monospace" fontSize="7.5" fill={rule.c}>{rule.r}</text>
            ))}

            {/* Threat matrix panel */}
            <rect x="207" y="398" width="168" height="86" rx="8"
                fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" strokeWidth="1" />
            <text x="222" y="416" fontFamily="monospace" fontSize="8.5" fill="rgba(239,68,68,0.7)" fontWeight="bold">THREAT MATRIX</text>
            {[
                {label:'Malware',  val:78, c:'#ef4444'},
                {label:'Phishing', val:55, c:'#f97316'},
                {label:'Intrusión',val:32, c:'#fbbf24'},
                {label:'DDoS',     val:14, c:'#22c55e'},
            ].map((t, i) => (
                <g key={t.label}>
                    <text x="222" y={433 + i*14} fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.5)">{t.label}</text>
                    <rect x="282" y={425 + i*14} width="68" height="7" rx="3.5" fill="rgba(255,255,255,0.05)" />
                    <rect x="282" y={425 + i*14} width={68*t.val/100} height="7" rx="3.5" fill={t.c} opacity="0.7" />
                    <text x="357" y={432 + i*14} fontFamily="monospace" fontSize="7" fill="rgba(255,255,255,0.35)">{t.val}%</text>
                </g>
            ))}

            <rect width="400" height="500" fill="url(#cs-scan)" opacity="0.5" style={{pointerEvents:'none'}} />
            <rect width="400" height="3" fill="url(#cs-tb)" opacity="0.9" />
        </svg>
    );
}

// ─── LOOKUP MAP ───────────────────────────────────────────────────────────────
const COVER_MAP = {
    'general':                   CoverExamenGeneral,
    'Bases de Datos':            CoverBasesDatos,
    'Redes':                     CoverRedes,
    'Sistemas Operativos':       CoverSistemasOperativos,
    'Fundamentos de Hardware':   CoverFundamentosHardware,
    'Lenguaje de Marcas':        CoverLenguajeMarcas,
    'Ciberseguridad':            CoverCiberseguridad,
};

export function SubjectCoverComponent({ subjectKey }) {
    const Component = COVER_MAP[subjectKey] || CoverExamenGeneral;
    return <Component />;
}
