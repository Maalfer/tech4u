/**
 * SQLLabCovers.jsx — Premium SVG cover art for SQL Lab exercise type cards
 * One unique cover per exercise mode, themed with relevant SQL/technical content
 */

// ─── 1. ESCRIBE CONSULTA ── Blue #3b82f6 ────────────────────────────────────
export function CoverEscribeConsulta() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="ec-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#00060f" />
                    <stop offset="100%" stopColor="#000408" />
                </linearGradient>
                <radialGradient id="ec-g" cx="30%" cy="25%" r="60%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
                <pattern id="ec-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
                </pattern>
                <filter id="ec-gf"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="ec-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#ec-bg)"/>
            <rect width="400" height="240" fill="url(#ec-grid)"/>
            <rect width="400" height="240" fill="url(#ec-g)"/>

            {/* Big faint SELECT watermark */}
            <text x="0" y="180" fontFamily="monospace" fontSize="130" fill="rgba(59,130,246,0.04)" fontWeight="bold">SQL</text>

            {/* Editor window */}
            <rect x="18" y="18" width="364" height="195" rx="8"
                fill="rgba(0,5,15,0.92)" stroke="rgba(59,130,246,0.28)" strokeWidth="1.2"/>
            <rect x="18" y="18" width="364" height="20" rx="8" fill="rgba(59,130,246,0.12)"/>
            <rect x="18" y="28" width="364" height="10" fill="rgba(59,130,246,0.12)"/>
            <circle cx="33" cy="28" r="4" fill="#ef4444" opacity="0.8"/>
            <circle cx="46" cy="28" r="4" fill="#fbbf24" opacity="0.8"/>
            <circle cx="59" cy="28" r="4" fill="#22c55e" opacity="0.8"/>
            <text x="76" y="31" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.3)">query.sql — SQL Skills · Editor</text>

            {/* Line numbers gutter */}
            <rect x="18" y="38" width="24" height="175" fill="rgba(59,130,246,0.04)"/>
            {[1,2,3,4,5,6,7,8].map((n,i) => (
                <text key={n} x="30" y={53+i*18} fontFamily="monospace" fontSize="7.5"
                    fill="rgba(59,130,246,0.35)" textAnchor="middle">{n}</text>
            ))}

            {/* SQL code lines */}
            <text x="48" y="53" fontFamily="monospace" fontSize="9.5" filter="url(#ec-gf)">
                <tspan fill="#60a5fa" fontWeight="bold">SELECT</tspan>
                <tspan fill="rgba(255,255,255,0.6)">  p.nombre, p.precio,</tspan>
            </text>
            <text x="48" y="71" fontFamily="monospace" fontSize="9.5">
                <tspan fill="rgba(255,255,255,0.45)">       </tspan>
                <tspan fill="#34d399">c.nombre</tspan>
                <tspan fill="rgba(255,255,255,0.4)"> AS categoría</tspan>
            </text>
            <text x="48" y="89" fontFamily="monospace" fontSize="9.5">
                <tspan fill="#60a5fa" fontWeight="bold">FROM</tspan>
                <tspan fill="#fbbf24">   productos p</tspan>
            </text>
            <text x="48" y="107" fontFamily="monospace" fontSize="9.5">
                <tspan fill="#60a5fa" fontWeight="bold">INNER JOIN</tspan>
                <tspan fill="#fbbf24"> categorias c</tspan>
            </text>
            <text x="48" y="125" fontFamily="monospace" fontSize="9.5">
                <tspan fill="rgba(255,255,255,0.4)">  ON </tspan>
                <tspan fill="rgba(255,255,255,0.6)">p.categoria_id = c.id</tspan>
            </text>
            <text x="48" y="143" fontFamily="monospace" fontSize="9.5">
                <tspan fill="#60a5fa" fontWeight="bold">WHERE</tspan>
                <tspan fill="rgba(255,255,255,0.6)">  p.precio &gt; </tspan>
                <tspan fill="#34d399">50</tspan>
            </text>
            <text x="48" y="161" fontFamily="monospace" fontSize="9.5">
                <tspan fill="#60a5fa" fontWeight="bold">ORDER BY</tspan>
                <tspan fill="rgba(255,255,255,0.5)"> p.precio </tspan>
                <tspan fill="#60a5fa">DESC</tspan>
            </text>
            <text x="48" y="179" fontFamily="monospace" fontSize="9.5">
                <tspan fill="#60a5fa" fontWeight="bold">LIMIT</tspan>
                <tspan fill="#34d399"> 10</tspan>
                <tspan fill="rgba(255,255,255,0.3)">;</tspan>
            </text>
            {/* Blinking cursor */}
            <rect x="88" y="183" width="7" height="11" fill="#3b82f6" opacity="0.9">
                <animate attributeName="opacity" values="0.9;0;0.9" dur="1s" repeatCount="indefinite"/>
            </rect>

            {/* Run button */}
            <rect x="294" y="196" width="82" height="10" rx="4" fill="rgba(59,130,246,0.25)" stroke="rgba(59,130,246,0.4)" strokeWidth="0.8"/>
            <text x="335" y="204" fontFamily="monospace" fontSize="7.5" fill="#60a5fa" textAnchor="middle" fontWeight="bold">▶ Ejecutar</text>

            <rect width="400" height="3" fill="url(#ec-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── 2. COMPLETA EL HUECO ── Amber #f59e0b ────────────────────────────────────
export function CoverCompletaHueco() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="ch-bg" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#0f0800" />
                    <stop offset="100%" stopColor="#080500" />
                </linearGradient>
                <radialGradient id="ch-g" cx="35%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
                <pattern id="ch-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(245,158,11,0.08)" strokeWidth="0.5"/>
                </pattern>
                <filter id="ch-gf"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="ch-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#ch-bg)"/>
            <rect width="400" height="240" fill="url(#ch-grid)"/>
            <rect width="400" height="240" fill="url(#ch-g)"/>

            {/* Editor window */}
            <rect x="18" y="18" width="364" height="148" rx="8"
                fill="rgba(12,7,0,0.92)" stroke="rgba(245,158,11,0.28)" strokeWidth="1.2"/>
            <rect x="18" y="18" width="364" height="20" rx="8" fill="rgba(245,158,11,0.1)"/>
            <rect x="18" y="28" width="364" height="10" fill="rgba(245,158,11,0.1)"/>
            <circle cx="33" cy="28" r="4" fill="#ef4444" opacity="0.8"/>
            <circle cx="46" cy="28" r="4" fill="#fbbf24" opacity="0.8"/>
            <circle cx="59" cy="28" r="4" fill="#22c55e" opacity="0.8"/>
            <text x="76" y="31" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.3)">fill_blank.sql — Completa los huecos</text>

            {/* SQL with blanks */}
            <text x="32" y="60" fontFamily="monospace" fontSize="10">
                <tspan fill="#fbbf24" fontWeight="bold">SELECT</tspan>
                <tspan fill="rgba(255,255,255,0.6)"> nombre, </tspan>
            </text>
            {/* Blank box 1 */}
            <rect x="175" y="49" width="60" height="16" rx="3"
                fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.6)" strokeWidth="1.2" strokeDasharray="3,2"/>
            <text x="205" y="61" fontFamily="monospace" fontSize="8" fill="rgba(245,158,11,0.6)" textAnchor="middle">_______</text>

            <text x="32" y="82" fontFamily="monospace" fontSize="10">
                <tspan fill="#fbbf24" fontWeight="bold">FROM</tspan>
                <tspan fill="rgba(255,255,255,0.6)">   empleados</tspan>
            </text>
            <text x="32" y="104" fontFamily="monospace" fontSize="10">
                <tspan fill="#fbbf24" fontWeight="bold">WHERE</tspan>
                <tspan fill="rgba(255,255,255,0.6)">  salario </tspan>
            </text>
            {/* Blank box 2 */}
            <rect x="148" y="93" width="55" height="16" rx="3"
                fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.6)" strokeWidth="1.2" strokeDasharray="3,2"/>
            <text x="175" y="105" fontFamily="monospace" fontSize="8" fill="rgba(245,158,11,0.6)" textAnchor="middle">_______</text>
            <text x="208" y="104" fontFamily="monospace" fontSize="10" fill="#34d399"> 3000</text>

            <text x="32" y="126" fontFamily="monospace" fontSize="10">
                <tspan fill="#fbbf24" fontWeight="bold">ORDER BY</tspan>
                <tspan fill="rgba(255,255,255,0.6)"> salario </tspan>
            </text>
            {/* Blank box 3 */}
            <rect x="178" y="115" width="50" height="16" rx="3"
                fill="rgba(245,158,11,0.2)" stroke="rgba(245,158,11,0.8)" strokeWidth="1.5"/>
            <text x="203" y="127" fontFamily="monospace" fontSize="8.5" fill="#fbbf24" textAnchor="middle" fontWeight="bold">DESC</text>
            {/* Check mark for filled blank */}
            <circle cx="240" cy="123" r="7" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.5)" strokeWidth="1"/>
            <text x="240" y="127" fontFamily="monospace" fontSize="9" fill="#22c55e" textAnchor="middle">✓</text>

            <text x="32" y="148" fontFamily="monospace" fontSize="10">
                <tspan fill="#fbbf24" fontWeight="bold">LIMIT</tspan>
                <tspan fill="#34d399"> 5</tspan>
                <tspan fill="rgba(255,255,255,0.3)">;</tspan>
            </text>

            {/* Score/hint panel */}
            <rect x="18" y="178" width="364" height="48" rx="8"
                fill="rgba(0,0,0,0.5)" stroke="rgba(245,158,11,0.18)" strokeWidth="1"/>
            <text x="32" y="198" fontFamily="monospace" fontSize="8.5" fill="rgba(245,158,11,0.7)" fontWeight="bold">Huecos completados</text>
            {/* Progress dots */}
            {[0,1,2].map(i => (
                <circle key={i} cx={200 + i*20} cy={193} r="6"
                    fill={i < 1 ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.15)'}
                    stroke={i < 1 ? 'rgba(34,197,94,0.7)' : 'rgba(245,158,11,0.45)'} strokeWidth="1"/>
            ))}
            <text x="32" y="216" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.4)">1 / 3 completados · 2 huecos restantes</text>

            <rect width="400" height="3" fill="url(#ch-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── 3. ENCUENTRA EL ERROR ── Orange-Red #f97316 ──────────────────────────────
export function CoverEncuentraError() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="ee-bg" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#0e0300" />
                    <stop offset="100%" stopColor="#070200" />
                </linearGradient>
                <radialGradient id="ee-g" cx="40%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
                <pattern id="ee-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(249,115,22,0.08)" strokeWidth="0.5"/>
                </pattern>
                <filter id="ee-gf"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="ee-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#f97316" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#ee-bg)"/>
            <rect width="400" height="240" fill="url(#ee-grid)"/>
            <rect width="400" height="240" fill="url(#ee-g)"/>

            {/* Bug watermark */}
            <text x="260" y="190" fontFamily="monospace" fontSize="140" fill="rgba(249,115,22,0.04)" fontWeight="bold">🐛</text>

            {/* Editor window */}
            <rect x="18" y="18" width="250" height="195" rx="8"
                fill="rgba(12,3,0,0.92)" stroke="rgba(249,115,22,0.25)" strokeWidth="1.2"/>
            <rect x="18" y="18" width="250" height="20" rx="8" fill="rgba(249,115,22,0.1)"/>
            <rect x="18" y="28" width="250" height="10" fill="rgba(249,115,22,0.1)"/>
            <circle cx="33" cy="28" r="4" fill="#ef4444" opacity="0.8"/>
            <circle cx="46" cy="28" r="4" fill="#fbbf24" opacity="0.8"/>
            <circle cx="59" cy="28" r="4" fill="#22c55e" opacity="0.8"/>
            <text x="74" y="31" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.3)">buggy_query.sql</text>

            {/* SQL code with error line highlighted */}
            <text x="32" y="58" fontFamily="monospace" fontSize="9.5"><tspan fill="#fb923c">SELECT</tspan><tspan fill="rgba(255,255,255,0.6)"> nombre, salario</tspan></text>
            <text x="32" y="76" fontFamily="monospace" fontSize="9.5"><tspan fill="#fb923c">FROM</tspan><tspan fill="rgba(255,255,255,0.6)">   empleados</tspan></text>
            {/* Error line - highlighted in red */}
            <rect x="22" y="80" width="242" height="18" rx="2" fill="rgba(239,68,68,0.12)"/>
            <rect x="22" y="80" width="3" height="18" fill="#ef4444" opacity="0.8"/>
            <text x="32" y="93" fontFamily="monospace" fontSize="9.5"><tspan fill="#ef4444">WHER</tspan><tspan fill="rgba(255,100,100,0.9)">  salario &gt;</tspan><tspan fill="#34d399"> 3000</tspan></text>
            {/* Error squiggle */}
            <path d="M 32 96 Q 35 98 38 96 Q 41 94 44 96 Q 47 98 50 96 Q 53 94 56 96 Q 59 98 62 96" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.8"/>

            <text x="32" y="111" fontFamily="monospace" fontSize="9.5"><tspan fill="#fb923c">AND</tspan><tspan fill="rgba(255,255,255,0.6)">    departamento = </tspan><tspan fill="#34d399">'IT'</tspan></text>
            <text x="32" y="129" fontFamily="monospace" fontSize="9.5"><tspan fill="#fb923c">ORDER BY</tspan><tspan fill="rgba(255,255,255,0.5)"> nombre</tspan></text>
            <text x="32" y="147" fontFamily="monospace" fontSize="9.5"><tspan fill="#fb923c">LIMIT</tspan><tspan fill="#34d399"> 10</tspan><tspan fill="rgba(255,255,255,0.3)">;</tspan></text>

            {/* Error count */}
            <rect x="22" y="162" width="242" height="40" rx="6" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.25)" strokeWidth="1"/>
            <text x="32" y="178" fontFamily="monospace" fontSize="8.5" fill="#ef4444" fontWeight="bold">✗ ERROR en línea 3</text>
            <text x="32" y="193" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.4)">Keyword incompleto detectado</text>

            {/* Right panel - analysis */}
            <rect x="280" y="18" width="102" height="195" rx="8"
                fill="rgba(0,0,0,0.5)" stroke="rgba(249,115,22,0.2)" strokeWidth="1"/>
            <text x="331" y="38" fontFamily="monospace" fontSize="8" fill="rgba(249,115,22,0.7)" textAnchor="middle" fontWeight="bold">ANÁLISIS</text>
            {/* Magnifying glass icon */}
            <circle cx="331" cy="80" r="22" fill="rgba(249,115,22,0.06)" stroke="rgba(249,115,22,0.25)" strokeWidth="1"/>
            <circle cx="326" cy="75" r="11" fill="none" stroke="rgba(249,115,22,0.5)" strokeWidth="1.5"/>
            <line x1="333" y1="82" x2="340" y2="89" stroke="rgba(249,115,22,0.7)" strokeWidth="2" strokeLinecap="round"/>
            <text x="326" y="79" fontFamily="monospace" fontSize="9" fill="#fb923c" textAnchor="middle">?!</text>
            {/* Error list */}
            {['Keyword', 'Sintaxis', 'Cláusula'].map((item, i) => (
                <g key={item}>
                    <circle cx="292" cy={115+i*18} r="4" fill={i===0 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.05)'}
                        stroke={i===0 ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.1)'} strokeWidth="1"/>
                    <text x="302" y={119+i*18} fontFamily="monospace" fontSize="8"
                        fill={i===0 ? '#ef4444' : 'rgba(255,255,255,0.3)'}>{item}</text>
                </g>
            ))}
            <text x="331" y="192" fontFamily="monospace" fontSize="7.5" fill="rgba(249,115,22,0.5)" textAnchor="middle">1 bug</text>

            <rect width="400" height="3" fill="url(#ee-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── 4. ORDENA LAS CLÁUSULAS ── Purple #8b5cf6 ────────────────────────────────
export function CoverOrdenaClauses() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="oc-bg" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#05000e" />
                    <stop offset="100%" stopColor="#030008" />
                </linearGradient>
                <radialGradient id="oc-g" cx="40%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
                <pattern id="oc-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5"/>
                </pattern>
                <filter id="oc-gf"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="oc-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#8b5cf6" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#oc-bg)"/>
            <rect width="400" height="240" fill="url(#oc-grid)"/>
            <rect width="400" height="240" fill="url(#oc-g)"/>

            <text x="32" y="35" fontFamily="monospace" fontSize="9" fill="rgba(139,92,246,0.6)" fontWeight="bold">Arrastra las cláusulas al orden correcto</text>
            <rect x="18" y="40" width="364" height="1" fill="rgba(139,92,246,0.15)"/>

            {/* Shuffled clauses on left */}
            <text x="26" y="60" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.35)" fontWeight="bold">FRAGMENTOS</text>
            {[
                { label: 'ORDER BY nombre', c: '#a78bfa', shuffle: true },
                { label: 'WHERE salario > 3000', c: '#a78bfa', shuffle: false },
                { label: 'FROM empleados', c: '#a78bfa', shuffle: true },
                { label: 'SELECT nombre', c: '#a78bfa', shuffle: false },
                { label: 'LIMIT 5', c: '#a78bfa', shuffle: true },
            ].map((cl, i) => (
                <g key={i}>
                    <rect x={26 + (i%2)*100} y={68+Math.floor(i/2)*30} width="92" height="22" rx="5"
                        fill={cl.shuffle ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.18)'}
                        stroke={cl.shuffle ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.5)'} strokeWidth="1"
                        strokeDasharray={cl.shuffle ? "4,2" : "none"}/>
                    <text x={72 + (i%2)*100} y={82+Math.floor(i/2)*30} fontFamily="monospace" fontSize="7.5"
                        fill={cl.shuffle ? 'rgba(167,139,250,0.6)' : '#a78bfa'} textAnchor="middle">{cl.label}</text>
                </g>
            ))}

            {/* Arrow separator */}
            <line x1="232" y1="60" x2="232" y2="210" stroke="rgba(139,92,246,0.2)" strokeWidth="1" strokeDasharray="4,3"/>
            <text x="232" y="138" fontFamily="monospace" fontSize="18" fill="rgba(139,92,246,0.4)" textAnchor="middle">→</text>

            {/* Correct order on right */}
            <text x="245" y="60" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.35)" fontWeight="bold">ORDEN CORRECTO</text>
            {[
                { n: '1', label: 'SELECT nombre', c: '#22c55e' },
                { n: '2', label: 'FROM empleados', c: '#22c55e' },
                { n: '3', label: 'WHERE sal > 3000', c: '#fbbf24' },
                { n: '4', label: 'ORDER BY nombre', c: '#a78bfa' },
                { n: '5', label: 'LIMIT 5', c: '#a78bfa' },
            ].map((cl, i) => (
                <g key={i}>
                    <rect x="243" y={68+i*28} width="130" height="22" rx="5"
                        fill={i < 2 ? 'rgba(34,197,94,0.1)' : i === 2 ? 'rgba(251,191,36,0.08)' : 'rgba(139,92,246,0.08)'}
                        stroke={i < 2 ? 'rgba(34,197,94,0.4)' : i === 2 ? 'rgba(251,191,36,0.3)' : 'rgba(139,92,246,0.2)'} strokeWidth="1"/>
                    <text x="255" y={82+i*28} fontFamily="monospace" fontSize="7"
                        fill={i < 2 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.25)'} fontWeight="bold">{cl.n}.</text>
                    <text x="267" y={82+i*28} fontFamily="monospace" fontSize="7.5"
                        fill={i < 2 ? '#4ade80' : i === 2 ? '#fbbf24' : 'rgba(167,139,250,0.7)'}>{cl.label}</text>
                    {i < 2 && <text x="364" y={82+i*28} fontFamily="monospace" fontSize="9" fill="#22c55e" textAnchor="end">✓</text>}
                </g>
            ))}

            {/* Score */}
            <rect x="18" y="210" width="364" height="22" rx="6"
                fill="rgba(139,92,246,0.06)" stroke="rgba(139,92,246,0.15)" strokeWidth="1"/>
            <text x="30" y="225" fontFamily="monospace" fontSize="8.5" fill="rgba(139,92,246,0.6)">Cláusulas en posición correcta:</text>
            <text x="265" y="225" fontFamily="monospace" fontSize="8.5" fill="#a78bfa" fontWeight="bold">2 / 5</text>

            <rect width="400" height="3" fill="url(#oc-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── 5. QUERY INVERSA ── Cyan #06b6d4 ──────────────────────────────────────────
export function CoverQueryInversa() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="qi-bg" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#000e10" />
                    <stop offset="100%" stopColor="#000708" />
                </linearGradient>
                <radialGradient id="qi-g" cx="40%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </radialGradient>
                <pattern id="qi-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="0.5"/>
                </pattern>
                <filter id="qi-gf"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="qi-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#qi-bg)"/>
            <rect width="400" height="240" fill="url(#qi-grid)"/>
            <rect width="400" height="240" fill="url(#qi-g)"/>

            {/* Top: Result table (the "given") */}
            <text x="18" y="30" fontFamily="monospace" fontSize="8.5" fill="rgba(6,182,212,0.7)" fontWeight="bold">RESULTADO DADO → Escribe la query que lo produce</text>
            <rect x="18" y="36" width="364" height="90" rx="7"
                fill="rgba(0,8,10,0.92)" stroke="rgba(6,182,212,0.28)" strokeWidth="1.2"/>
            {/* Table header */}
            <rect x="18" y="36" width="364" height="18" rx="7" fill="rgba(6,182,212,0.12)"/>
            <rect x="18" y="44" width="364" height="10" fill="rgba(6,182,212,0.12)"/>
            <text x="32" y="49" fontFamily="monospace" fontSize="8" fill="rgba(6,182,212,0.9)" fontWeight="bold">nombre</text>
            <text x="152" y="49" fontFamily="monospace" fontSize="8" fill="rgba(6,182,212,0.9)" fontWeight="bold">salario</text>
            <text x="242" y="49" fontFamily="monospace" fontSize="8" fill="rgba(6,182,212,0.9)" fontWeight="bold">departamento</text>
            <rect x="24" y="55" width="352" height="1" fill="rgba(6,182,212,0.2)"/>
            {[
                ['García, Ana',    '4500', 'Desarrollo'],
                ['López, Carlos',  '3800', 'Diseño'],
                ['Martínez, Eva',  '3200', 'QA'],
            ].map((row, i) => (
                <g key={i}>
                    <rect x="18" y={57+i*20} width="364" height="20"
                        fill={i%2===0 ? 'rgba(6,182,212,0.02)' : 'transparent'}/>
                    <text x="32" y={70+i*20} fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.6)">{row[0]}</text>
                    <text x="152" y={70+i*20} fontFamily="monospace" fontSize="8.5" fill="#06b6d4">{row[1]}</text>
                    <text x="242" y={70+i*20} fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.45)">{row[2]}</text>
                </g>
            ))}
            <text x="32" y="118" fontFamily="monospace" fontSize="7.5" fill="rgba(6,182,212,0.4)">3 rows · ORDER BY salario DESC</text>

            {/* Reverse arrow */}
            <g transform="translate(195,133)">
                <line x1="0" y1="0" x2="0" y2="16" stroke="rgba(6,182,212,0.5)" strokeWidth="1.5" strokeDasharray="3,2"/>
                <path d="M -5 16 L 5 16 L 0 22 Z" fill="rgba(6,182,212,0.6)"/>
            </g>
            <text x="215" y="148" fontFamily="monospace" fontSize="8" fill="rgba(6,182,212,0.5)">¿Qué query generó esto?</text>

            {/* Bottom: SQL editor */}
            <rect x="18" y="158" width="364" height="66" rx="7"
                fill="rgba(0,5,8,0.9)" stroke="rgba(6,182,212,0.22)" strokeWidth="1"/>
            <rect x="18" y="158" width="364" height="16" rx="7" fill="rgba(6,182,212,0.08)"/>
            <circle cx="30" cy="166" r="3.5" fill="#ef4444" opacity="0.7"/>
            <circle cx="41" cy="166" r="3.5" fill="#fbbf24" opacity="0.7"/>
            <circle cx="52" cy="166" r="3.5" fill="#22c55e" opacity="0.7"/>
            <text x="66" y="169" fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.25)">Tu respuesta aquí...</text>

            <text x="30" y="193" fontFamily="monospace" fontSize="9.5">
                <tspan fill="#22d3ee">SELECT</tspan>
                <tspan fill="rgba(255,255,255,0.5)"> nombre, salario, departamento</tspan>
            </text>
            <text x="30" y="211" fontFamily="monospace" fontSize="9.5">
                <tspan fill="#22d3ee">FROM</tspan>
                <tspan fill="rgba(255,255,255,0.5)">   empleados </tspan>
                <tspan fill="#22d3ee">WHERE</tspan>
                <tspan fill="rgba(255,255,255,0.3)"> salario &gt; </tspan>
            </text>
            {/* Blinking cursor */}
            <rect x="282" y="200" width="7" height="11" fill="#06b6d4" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0;0.8" dur="1.1s" repeatCount="indefinite"/>
            </rect>

            <rect width="400" height="3" fill="url(#qi-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── LOOKUP MAP ──────────────────────────────────────────────────────────────
const SQL_COVER_MAP = {
    'write_query':    CoverEscribeConsulta,
    'fill_blank':     CoverCompletaHueco,
    'find_bug':       CoverEncuentraError,
    'order_clauses':  CoverOrdenaClauses,
    'reverse_query':  CoverQueryInversa,
};

export function SQLModeCoverComponent({ modeKey }) {
    const Component = SQL_COVER_MAP[modeKey] || CoverEscribeConsulta;
    return <Component />;
}
