/**
 * FlashcardCovers.jsx — Premium SVG cover art for Flashcard subject selection
 * One unique cover per subject, themed with spaced-repetition + topic content
 */

// ─── 1. TODAS LAS MATERIAS ── Orange #f97316 ─────────────────────────────────
export function CoverFlashGeneral() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="fg-bg" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#100500" />
                    <stop offset="100%" stopColor="#080300" />
                </linearGradient>
                <radialGradient id="fg-g" cx="40%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
                <pattern id="fg-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(249,115,22,0.08)" strokeWidth="0.5"/>
                </pattern>
                <linearGradient id="fg-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#f97316" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#fg-bg)"/>
            <rect width="400" height="240" fill="url(#fg-grid)"/>
            <rect width="400" height="240" fill="url(#fg-g)"/>

            {/* Stacked cards decoration (back to front) */}
            {[
                { x: 32, y: 55, rot: '-8', c: 'rgba(139,92,246,0.35)' },
                { x: 38, y: 50, rot: '5', c: 'rgba(6,182,212,0.35)' },
                { x: 25, y: 45, rot: '-3', c: 'rgba(249,115,22,0.8)' },
            ].map((card, i) => (
                <rect key={i} x={card.x} y={card.y} width="120" height="75" rx="6"
                    fill={card.c} stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"
                    transform={`rotate(${card.rot}, 85, 90)`}/>
            ))}
            <rect x="25" y="45" width="120" height="75" rx="6"
                fill="rgba(249,115,22,0.18)" stroke="rgba(249,115,22,0.55)" strokeWidth="1.2"/>
            <text x="85" y="78" fontFamily="monospace" fontSize="9" fill="rgba(249,115,22,0.8)" textAnchor="middle" fontWeight="bold">TODAS LAS</text>
            <text x="85" y="93" fontFamily="monospace" fontSize="9" fill="rgba(249,115,22,0.8)" textAnchor="middle" fontWeight="bold">MATERIAS</text>
            <text x="85" y="110" fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.4)" textAnchor="middle">QuestCards · ASIR</text>

            {/* Subject pills */}
            {[
                { label: 'Redes', c: '#0ea5e9', rgb: '14,165,233', x: 180, y: 55 },
                { label: 'Bases de Datos', c: '#8b5cf6', rgb: '139,92,246', x: 180, y: 80 },
                { label: 'Sistemas Op.', c: '#22c55e', rgb: '34,197,94', x: 180, y: 105 },
                { label: 'Ciberseguridad', c: '#ef4444', rgb: '239,68,68', x: 180, y: 130 },
            ].map(pill => (
                <g key={pill.label}>
                    <rect x={pill.x} y={pill.y} width="185" height="18" rx="4"
                        fill={`rgba(${pill.rgb},0.1)`} stroke={`rgba(${pill.rgb},0.3)`} strokeWidth="0.8"/>
                    <circle cx={pill.x + 10} cy={pill.y + 9} r="3.5" fill={pill.c} opacity="0.8"/>
                    <text x={pill.x + 20} y={pill.y + 13} fontFamily="monospace" fontSize="8"
                        fill="rgba(255,255,255,0.6)">{pill.label}</text>
                </g>
            ))}

            {/* Spaced rep progress */}
            <rect x="18" y="160" width="364" height="66" rx="7"
                fill="rgba(0,0,0,0.45)" stroke="rgba(249,115,22,0.18)" strokeWidth="1"/>
            <text x="30" y="179" fontFamily="monospace" fontSize="8.5" fill="rgba(249,115,22,0.7)" fontWeight="bold">SISTEMA DE REPASO ESPACIADO</text>
            {[
                { label: 'Hoy',      val: 12, c: '#ef4444' },
                { label: 'Mañana',   val: 7,  c: '#f97316' },
                { label: 'Esta semana', val: 24, c: '#fbbf24' },
            ].map((r, i) => (
                <g key={r.label}>
                    <text x={30 + i*120} y="197" fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.4)">{r.label}</text>
                    <text x={30 + i*120} y="213" fontFamily="monospace" fontSize="11" fill={r.c} fontWeight="bold">{r.val}</text>
                </g>
            ))}

            <rect width="400" height="3" fill="url(#fg-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── 2. BASES DE DATOS ── Violet #8b5cf6 ─────────────────────────────────────
export function CoverFlashBD() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="fb-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#06000f" />
                    <stop offset="100%" stopColor="#040008" />
                </linearGradient>
                <radialGradient id="fb-g" cx="35%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
                <pattern id="fb-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5"/>
                </pattern>
                <linearGradient id="fb-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#8b5cf6" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#fb-bg)"/>
            <rect width="400" height="240" fill="url(#fb-grid)"/>
            <rect width="400" height="240" fill="url(#fb-g)"/>

            {/* Front card (Question) */}
            <rect x="20" y="22" width="172" height="108" rx="8"
                fill="rgba(5,0,12,0.92)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.2"/>
            <rect x="20" y="22" width="172" height="18" rx="8" fill="rgba(139,92,246,0.12)"/>
            <rect x="20" y="30" width="172" height="10" fill="rgba(139,92,246,0.12)"/>
            <text x="106" y="34" fontFamily="monospace" fontSize="7.5" fill="rgba(139,92,246,0.6)" textAnchor="middle">PREGUNTA</text>
            <text x="106" y="62" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.7)" textAnchor="middle">¿Cuál es la diferencia</text>
            <text x="106" y="76" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.7)" textAnchor="middle">entre INNER JOIN</text>
            <text x="106" y="90" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.7)" textAnchor="middle">y LEFT JOIN?</text>
            <text x="106" y="116" fontFamily="monospace" fontSize="7.5" fill="rgba(139,92,246,0.5)" textAnchor="middle">Tap para revelar →</text>

            {/* Back card (Answer) - slightly offset */}
            <rect x="210" y="30" width="172" height="108" rx="8"
                fill="rgba(10,0,20,0.92)" stroke="rgba(139,92,246,0.25)" strokeWidth="1"/>
            <rect x="210" y="30" width="172" height="18" rx="8" fill="rgba(34,197,94,0.1)"/>
            <rect x="210" y="38" width="172" height="10" fill="rgba(34,197,94,0.1)"/>
            <text x="296" y="42" fontFamily="monospace" fontSize="7.5" fill="rgba(34,197,94,0.6)" textAnchor="middle">RESPUESTA</text>
            <text x="296" y="66" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.6)" textAnchor="middle">INNER: solo filas</text>
            <text x="296" y="80" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.6)" textAnchor="middle">que coinciden</text>
            <text x="296" y="96" fontFamily="monospace" fontSize="8" fill="#a78bfa" textAnchor="middle">LEFT: todas las</text>
            <text x="296" y="110" fontFamily="monospace" fontSize="8" fill="#a78bfa" textAnchor="middle">de la tabla izq.</text>
            <text x="296" y="126" fontFamily="monospace" fontSize="7.5" fill="rgba(34,197,94,0.5)" textAnchor="middle">✓ Correcto</text>

            {/* SQL snippet preview */}
            <rect x="20" y="145" width="364" height="80" rx="7"
                fill="rgba(0,0,0,0.5)" stroke="rgba(139,92,246,0.18)" strokeWidth="1"/>
            <text x="30" y="163" fontFamily="monospace" fontSize="8.5" fill="rgba(139,92,246,0.7)" fontWeight="bold">Ejemplo SQL · Bases de Datos</text>
            <text x="30" y="181" fontFamily="monospace" fontSize="9">
                <tspan fill="#a78bfa">SELECT</tspan>
                <tspan fill="rgba(255,255,255,0.5)"> a.*, b.nombre</tspan>
            </text>
            <text x="30" y="197" fontFamily="monospace" fontSize="9">
                <tspan fill="#a78bfa">FROM</tspan>
                <tspan fill="#fbbf24"> tabla_a a </tspan>
                <tspan fill="#a78bfa">LEFT JOIN</tspan>
                <tspan fill="#fbbf24"> tabla_b b</tspan>
            </text>
            <text x="30" y="213" fontFamily="monospace" fontSize="9">
                <tspan fill="rgba(255,255,255,0.4)">ON a.id = b.ref_id;</tspan>
            </text>

            <rect width="400" height="3" fill="url(#fb-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── 3. REDES ── Sky #0ea5e9 ──────────────────────────────────────────────────
export function CoverFlashRedes() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="fr-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#000c12" />
                    <stop offset="100%" stopColor="#00060a" />
                </linearGradient>
                <radialGradient id="fr-g" cx="35%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </radialGradient>
                <pattern id="fr-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(14,165,233,0.07)" strokeWidth="0.5"/>
                </pattern>
                <linearGradient id="fr-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#0ea5e9" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#fr-bg)"/>
            <rect width="400" height="240" fill="url(#fr-grid)"/>
            <rect width="400" height="240" fill="url(#fr-g)"/>

            {/* Mini network topology */}
            <circle cx="200" cy="65" r="16" fill="rgba(14,165,233,0.1)" stroke="rgba(14,165,233,0.4)" strokeWidth="1.2"/>
            <text x="200" y="70" fontFamily="monospace" fontSize="7" fill="rgba(14,165,233,0.8)" textAnchor="middle" fontWeight="bold">ROUTER</text>
            {[[90,35],[310,35],[90,100],[310,100]].map(([nx,ny],i) => (
                <line key={i} x1="200" y1="65" x2={nx} y2={ny}
                    stroke="rgba(14,165,233,0.2)" strokeWidth="1" strokeDasharray="4,3"/>
            ))}
            {[
                {x:75, y:28, l:'PC-01'},
                {x:302, y:28, l:'PC-02'},
                {x:72, y:95, l:'SRV'},
                {x:304, y:95, l:'AP'},
            ].map(n => (
                <g key={n.l}>
                    <rect x={n.x-15} y={n.y-10} width="35" height="18" rx="3"
                        fill="rgba(14,165,233,0.07)" stroke="rgba(14,165,233,0.25)" strokeWidth="0.8"/>
                    <text x={n.x+2} y={n.y+3} fontFamily="monospace" fontSize="6.5" fill="rgba(255,255,255,0.6)" textAnchor="middle">{n.l}</text>
                </g>
            ))}

            {/* Flash card with networking question */}
            <rect x="18" y="118" width="364" height="108" rx="8"
                fill="rgba(0,6,10,0.92)" stroke="rgba(14,165,233,0.28)" strokeWidth="1.2"/>
            <rect x="18" y="118" width="364" height="18" rx="8" fill="rgba(14,165,233,0.1)"/>
            <rect x="18" y="126" width="364" height="10" fill="rgba(14,165,233,0.1)"/>
            <text x="55" y="130" fontFamily="monospace" fontSize="7.5" fill="rgba(14,165,233,0.6)">FLASHCARD · Redes Locales</text>

            <text x="32" y="155" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.5)">P: ¿Cuántos bits tiene una dirección IPv4?</text>
            <rect x="32" y="162" width="335" height="1" fill="rgba(14,165,233,0.12)"/>
            <text x="32" y="180" fontFamily="monospace" fontSize="9.5" fill="#38bdf8" fontWeight="bold">R: 32 bits → 4 octetos de 8 bits</text>
            <text x="32" y="197" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.4)">   Ej: 192.168.1.10 → 11000000.10101000.00000001.00001010</text>
            <text x="32" y="215" fontFamily="monospace" fontSize="8.5" fill="rgba(14,165,233,0.5)">Máscara /24 = 255.255.255.0 = 11111111.11111111.11111111.00000000</text>

            <rect width="400" height="3" fill="url(#fr-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── 4. SISTEMAS OPERATIVOS ── Emerald #22c55e ───────────────────────────────
export function CoverFlashSO() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="fs-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#020a03" />
                    <stop offset="100%" stopColor="#010502" />
                </linearGradient>
                <radialGradient id="fs-g" cx="35%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </radialGradient>
                <pattern id="fs-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(34,197,94,0.07)" strokeWidth="0.5"/>
                </pattern>
                <linearGradient id="fs-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#22c55e" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#fs-bg)"/>
            <rect width="400" height="240" fill="url(#fs-grid)"/>
            <rect width="400" height="240" fill="url(#fs-g)"/>

            {/* Terminal prompt strip */}
            <rect x="18" y="18" width="364" height="95" rx="8"
                fill="rgba(1,6,2,0.92)" stroke="rgba(34,197,94,0.28)" strokeWidth="1.2"/>
            <rect x="18" y="18" width="364" height="18" rx="8" fill="rgba(34,197,94,0.1)"/>
            <rect x="18" y="26" width="364" height="10" fill="rgba(34,197,94,0.1)"/>
            <circle cx="33" cy="27" r="3.5" fill="#ef4444" opacity="0.8"/>
            <circle cx="44" cy="27" r="3.5" fill="#fbbf24" opacity="0.8"/>
            <circle cx="55" cy="27" r="3.5" fill="#22c55e" opacity="0.8"/>
            <text x="70" y="30" fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.3)">alumno@debian:~$ — Sistemas Operativos</text>

            {[
                { cmd: '$ chmod 755 script.sh',   out: '' },
                { cmd: '$ ps aux | grep nginx',   out: 'root  1234 0.0 nginx: master' },
                { cmd: '$ systemctl status ssh',  out: '● ssh.service: active (running)' },
            ].map((line, i) => (
                <g key={i}>
                    <text x="30" y={53 + i*25} fontFamily="monospace" fontSize="9" fill="#4ade80">{line.cmd}</text>
                    {line.out && <text x="30" y={65 + i*25} fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.4)">{line.out}</text>}
                </g>
            ))}
            <rect x="30" y="99" width="7" height="11" fill="#22c55e" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="indefinite"/>
            </rect>

            {/* Command flash cards */}
            <rect x="18" y="128" width="364" height="98" rx="8"
                fill="rgba(0,0,0,0.45)" stroke="rgba(34,197,94,0.18)" strokeWidth="1"/>
            <text x="30" y="147" fontFamily="monospace" fontSize="8.5" fill="rgba(34,197,94,0.7)" fontWeight="bold">Tarjetas de Comandos</text>
            {[
                { cmd: 'chmod', def: 'Cambiar permisos de archivo' },
                { cmd: 'chown', def: 'Cambiar propietario/grupo' },
                { cmd: 'crontab -e', def: 'Editar tareas programadas' },
                { cmd: 'journalctl -f', def: 'Ver logs del sistema en tiempo real' },
            ].map((c, i) => (
                <g key={c.cmd}>
                    <text x="30" y={165 + i*16} fontFamily="monospace" fontSize="8">
                        <tspan fill="#4ade80" fontWeight="bold">{c.cmd.padEnd(16)}</tspan>
                        <tspan fill="rgba(255,255,255,0.45)">— {c.def}</tspan>
                    </text>
                </g>
            ))}

            <rect width="400" height="3" fill="url(#fs-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── 5. CIBERSEGURIDAD ── Red #ef4444 ─────────────────────────────────────────
export function CoverFlashCiber() {
    return (
        <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="fc-bg" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#0f0000" />
                    <stop offset="100%" stopColor="#070000" />
                </linearGradient>
                <radialGradient id="fc-g" cx="40%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <pattern id="fc-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(239,68,68,0.07)" strokeWidth="0.5"/>
                </pattern>
                <filter id="fc-gf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="fc-tb" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="40%" stopColor="#ef4444" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#fc-bg)"/>
            <rect width="400" height="240" fill="url(#fc-grid)"/>
            <rect width="400" height="240" fill="url(#fc-g)"/>

            {/* Shield icon */}
            <path d="M 55 22 L 110 22 L 110 65 Q 110 88 82 98 Q 55 88 55 65 Z"
                fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.45)" strokeWidth="1.5"
                filter="url(#fc-gf)"/>
            <path d="M 68 54 L 78 65 L 97 43" fill="none" stroke="#ef4444" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>

            {/* Threat log panel */}
            <rect x="130" y="18" width="252" height="100" rx="8"
                fill="rgba(10,0,0,0.92)" stroke="rgba(239,68,68,0.25)" strokeWidth="1.2"/>
            <rect x="130" y="18" width="252" height="18" rx="8" fill="rgba(239,68,68,0.1)"/>
            <rect x="130" y="26" width="252" height="10" fill="rgba(239,68,68,0.1)"/>
            <text x="165" y="30" fontFamily="monospace" fontSize="7.5" fill="rgba(239,68,68,0.6)">auth.log · Seguridad</text>
            {[
                { line: 'Failed ssh: root@192.168.1.5', c: '#ef4444' },
                { line: 'Firewall DROP: port 22 from 10.0.0.9', c: '#f97316' },
                { line: 'SSL cert expires in 7 days', c: '#fbbf24' },
                { line: 'Brute force attempt: 48 tries', c: '#ef4444' },
                { line: 'iptables -A INPUT -p tcp ok', c: '#22c55e' },
            ].map((l, i) => (
                <text key={i} x="142" y={53+i*13} fontFamily="monospace" fontSize="7.5" fill={l.c + 'cc'}>{l.line}</text>
            ))}

            {/* Flash cards for security terms */}
            <rect x="18" y="130" width="175" height="96" rx="7"
                fill="rgba(0,0,0,0.5)" stroke="rgba(239,68,68,0.2)" strokeWidth="1"/>
            <text x="30" y="149" fontFamily="monospace" fontSize="8.5" fill="rgba(239,68,68,0.7)" fontWeight="bold">Conceptos Clave</text>
            {[
                { term: 'SQL Injection', def: 'Ataque via input SQL' },
                { term: 'XSS', def: 'Cross-Site Scripting' },
                { term: 'MITM', def: 'Man in the Middle' },
                { term: 'DDoS', def: 'Denegación de servicio' },
            ].map((c, i) => (
                <g key={c.term}>
                    <text x="30" y={165+i*15} fontFamily="monospace" fontSize="8">
                        <tspan fill="#f87171" fontWeight="bold">{c.term}: </tspan>
                        <tspan fill="rgba(255,255,255,0.45)">{c.def}</tspan>
                    </text>
                </g>
            ))}

            {/* Stats */}
            <rect x="208" y="130" width="174" height="96" rx="7"
                fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.18)" strokeWidth="1"/>
            <text x="220" y="149" fontFamily="monospace" fontSize="8.5" fill="rgba(239,68,68,0.7)" fontWeight="bold">Progreso del Reino</text>
            {[
                { l: 'Amenazas', v: 18, c: '#ef4444' },
                { l: 'Protocolos', v: 12, c: '#f97316' },
                { l: 'Cifrado', v: 9, c: '#fbbf24' },
            ].map((s, i) => (
                <g key={s.l}>
                    <text x="220" y={168+i*22} fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.4)">{s.l}</text>
                    <rect x="220" y={172+i*22} width="100" height="7" rx="3.5" fill="rgba(255,255,255,0.05)"/>
                    <rect x="220" y={172+i*22} width={100*s.v/20} height="7" rx="3.5" fill={s.c} opacity="0.7"/>
                    <text x="328" y={179+i*22} fontFamily="monospace" fontSize="7" fill="rgba(255,255,255,0.35)">{s.v}</text>
                </g>
            ))}

            <rect width="400" height="3" fill="url(#fc-tb)" opacity="0.9"/>
        </svg>
    );
}

// ─── LOOKUP MAP ──────────────────────────────────────────────────────────────
const FLASH_COVER_MAP = {
    'general':           CoverFlashGeneral,
    'Bases de Datos':    CoverFlashBD,
    'Redes':             CoverFlashRedes,
    'Sistemas Operativos': CoverFlashSO,
    'Ciberseguridad':    CoverFlashCiber,
};

export function FlashSubjectCoverComponent({ value }) {
    const Component = FLASH_COVER_MAP[value] || CoverFlashGeneral;
    return <Component />;
}
