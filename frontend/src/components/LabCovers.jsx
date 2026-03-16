/**
 * LabCovers.jsx — Premium SVG cover art for Terminal Skills
 * One unique cover per Skill Path + module variant generator
 */

// ─── 1. LINUX FUNDAMENTALS ── Cyan #06b6d4 ────────────────────────────────────
export function CoverLinuxFundamentals() {
    return (
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="lf-bg" x1="0" y1="0" x2="0.5" y2="1">
                    <stop offset="0%" stopColor="#010c14" />
                    <stop offset="100%" stopColor="#010810" />
                </linearGradient>
                <radialGradient id="lf-glow1" cx="30%" cy="25%" r="55%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="lf-glow2" cx="80%" cy="75%" r="40%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </radialGradient>
                <pattern id="lf-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="0.5" />
                </pattern>
                <pattern id="lf-scan" width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect y="2" width="1" height="2" fill="rgba(0,0,0,0.25)" />
                </pattern>
                <filter id="lf-glow-filter">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>

            {/* BG layers */}
            <rect width="400" height="500" fill="url(#lf-bg)" />
            <rect width="400" height="500" fill="url(#lf-grid)" />
            <rect width="400" height="500" fill="url(#lf-glow1)" />
            <rect width="400" height="500" fill="url(#lf-glow2)" />

            {/* Giant decorative ">" character */}
            <text x="-30" y="320" fontFamily="monospace" fontSize="260"
                fill="rgba(6,182,212,0.04)" fontWeight="bold">{'>'}</text>
            <text x="160" y="500" fontFamily="monospace" fontSize="260"
                fill="rgba(6,182,212,0.03)" fontWeight="bold">_</text>

            {/* Main terminal window */}
            <rect x="25" y="35" width="350" height="240" rx="10"
                fill="rgba(1,20,30,0.85)" stroke="rgba(6,182,212,0.3)" strokeWidth="1.2" />
            {/* Titlebar */}
            <rect x="25" y="35" width="350" height="22" rx="10" fill="rgba(6,182,212,0.15)" />
            <rect x="25" y="46" width="350" height="11" fill="rgba(6,182,212,0.15)" />
            <circle cx="45" cy="46" r="5" fill="#ef4444" opacity="0.8" />
            <circle cx="61" cy="46" r="5" fill="#fbbf24" opacity="0.8" />
            <circle cx="77" cy="46" r="5" fill="#22c55e" opacity="0.8" />
            <text x="100" y="50" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">root@linux:~# — terminal</text>

            {/* Terminal lines */}
            <text x="40" y="80" fontFamily="monospace" fontSize="10.5" fill="#06b6d4" filter="url(#lf-glow-filter)">$ ls -la /home/alumno/</text>
            <text x="40" y="97" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.45)">total 64</text>
            <text x="40" y="112" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.55)">drwxr-xr-x  9 alumno  alumno  4096 Jan 15</text>
            <text x="40" y="126" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.45)">-rw-r--r--  1 alumno  alumno   220 Jan 15  .bash_logout</text>
            <text x="40" y="140" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.45)">-rw-r--r--  1 alumno  alumno  3526 Jan 15  .bashrc</text>
            <text x="40" y="154" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.4)">drwxr-xr-x  2 alumno  alumno  4096 Jan 15  Desktop</text>
            <text x="40" y="168" fontFamily="monospace" fontSize="9" fill="#22c55e" opacity="0.9">drwx------  3 alumno  alumno  4096 Jan 15  .ssh</text>
            <text x="40" y="182" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.3)">-rw-------  1 root    root     874 Jan 14  .bash_history</text>
            <text x="40" y="200" fontFamily="monospace" fontSize="10.5" fill="#06b6d4" filter="url(#lf-glow-filter)">$ cd /var/log</text>
            <text x="40" y="217" fontFamily="monospace" fontSize="10.5" fill="#06b6d4" filter="url(#lf-glow-filter)">$ man bash<text fill="rgba(255,255,255,0.15)"> ░</text></text>
            <rect x="148" y="208" width="8" height="12" fill="#06b6d4" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0;0.8" dur="1.2s" repeatCount="indefinite" />
            </rect>

            {/* File tree panel */}
            <rect x="220" y="295" width="155" height="175" rx="8"
                fill="rgba(0,5,12,0.75)" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
            <rect x="220" y="295" width="155" height="20" rx="8" fill="rgba(6,182,212,0.12)" />
            <rect x="220" y="305" width="155" height="10" fill="rgba(6,182,212,0.12)" />
            <text x="237" y="309" fontFamily="monospace" fontSize="8" fill="rgba(6,182,212,0.7)" fontWeight="bold">/ FILE SYSTEM TREE</text>
            <text x="233" y="332" fontFamily="monospace" fontSize="9.5" fill="rgba(255,255,255,0.7)">/</text>
            <text x="233" y="348" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.5)">├── bin</text>
            <text x="233" y="363" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.5)">├── etc</text>
            <text x="233" y="378" fontFamily="monospace" fontSize="9" fill="#06b6d4">├── home</text>
            <text x="241" y="393" fontFamily="monospace" fontSize="9" fill="rgba(6,182,212,0.6)">│   └── alumno</text>
            <text x="233" y="408" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.4)">├── usr</text>
            <text x="233" y="423" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.4)">├── var</text>
            <text x="233" y="438" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.35)">└── proc</text>
            <text x="233" y="456" fontFamily="monospace" fontSize="9" fill="rgba(6,182,212,0.5)">$ uname -r</text>
            <text x="233" y="469" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.6)">6.1.0-amd64</text>

            {/* Kernel badge */}
            <rect x="25" y="295" width="180" height="72" rx="8"
                fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
            <text x="42" y="318" fontFamily="monospace" fontSize="9" fill="rgba(6,182,212,0.6)" fontWeight="bold">KERNEL</text>
            <text x="42" y="338" fontFamily="monospace" fontSize="18" fontWeight="bold" fill="rgba(255,255,255,0.9)">Linux 6.1.0</text>
            <text x="42" y="355" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.35)">x86_64 · Debian GNU/Linux 12</text>

            {/* Bottom strip */}
            <rect x="25" y="385" width="180" height="85" rx="8"
                fill="rgba(0,0,0,0.4)" stroke="rgba(6,182,212,0.12)" strokeWidth="1" />
            <text x="42" y="407" fontFamily="monospace" fontSize="9.5" fill="rgba(6,182,212,0.8)">$ whoami</text>
            <text x="42" y="422" fontFamily="monospace" fontSize="9.5" fill="rgba(255,255,255,0.7)">root</text>
            <text x="42" y="440" fontFamily="monospace" fontSize="9.5" fill="rgba(6,182,212,0.8)">$ echo $SHELL</text>
            <text x="42" y="455" fontFamily="monospace" fontSize="9.5" fill="rgba(255,255,255,0.6)">/bin/bash</text>
            <text x="42" y="472" fontFamily="monospace" fontSize="9.5" fill="rgba(6,182,212,0.8)">$ uptime</text>

            {/* Scan lines + top glow bar */}
            <rect width="400" height="500" fill="url(#lf-scan)" opacity="0.6" style={{pointerEvents:'none'}} />
            <rect width="400" height="3" fill="url(#lf-topbar)" opacity="0.9" />
            <defs>
                <linearGradient id="lf-topbar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ─── 2. BASH SCRIPTING ── Lime #c6ff33 ────────────────────────────────────────
export function CoverBashScripting() {
    return (
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="bs-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#06100a" />
                    <stop offset="100%" stopColor="#030806" />
                </linearGradient>
                <radialGradient id="bs-glow" cx="35%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#84cc16" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#84cc16" stopOpacity="0" />
                </radialGradient>
                <pattern id="bs-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(198,255,51,0.08)" strokeWidth="0.5" />
                </pattern>
                <pattern id="bs-scan" width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect y="2" width="1" height="2" fill="rgba(0,0,0,0.2)" />
                </pattern>
                <filter id="bs-glow-f"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>

            <rect width="400" height="500" fill="url(#bs-bg)" />
            <rect width="400" height="500" fill="url(#bs-grid)" />
            <rect width="400" height="500" fill="url(#bs-glow)" />

            {/* Giant shebang decoration */}
            <text x="-15" y="190" fontFamily="monospace" fontSize="200" fill="rgba(198,255,51,0.04)" fontWeight="bold">#!</text>

            {/* Code editor window */}
            <rect x="25" y="35" width="350" height="270" rx="10"
                fill="rgba(3,12,5,0.9)" stroke="rgba(198,255,51,0.28)" strokeWidth="1.2" />
            <rect x="25" y="35" width="350" height="22" rx="10" fill="rgba(198,255,51,0.12)" />
            <rect x="25" y="46" width="350" height="11" fill="rgba(198,255,51,0.12)" />
            <circle cx="45" cy="46" r="5" fill="#ef4444" opacity="0.8" />
            <circle cx="61" cy="46" r="5" fill="#fbbf24" opacity="0.8" />
            <circle cx="77" cy="46" r="5" fill="#22c55e" opacity="0.8" />
            <text x="100" y="50" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.3)">backup.sh — bash — 80×40</text>

            {/* Line numbers gutter */}
            <rect x="25" y="57" width="30" height="248" fill="rgba(198,255,51,0.04)" />
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map((n, i) => (
                <text key={n} x="38" y={76 + i * 17} fontFamily="monospace" fontSize="8"
                    fill="rgba(198,255,51,0.3)" textAnchor="middle">{n}</text>
            ))}

            {/* Script content */}
            <text x="65" y="76" fontFamily="monospace" fontSize="10" fill="#c6ff33" filter="url(#bs-glow-f)">#!/bin/bash</text>
            <text x="65" y="93" fontFamily="monospace" fontSize="9.5" fill="rgba(255,255,255,0.15)">{' '}</text>
            <text x="65" y="110" fontFamily="monospace" fontSize="9.5" fill="rgba(100,200,255,0.6)"># Backup script v2.0</text>
            <text x="65" y="127" fontFamily="monospace" fontSize="9.5" fill="rgba(255,255,255,0.2)">{' '}</text>
            <text x="65" y="144" fontFamily="monospace" fontSize="9.5"><tspan fill="#a78bfa">SOURCE</tspan><tspan fill="rgba(255,255,255,0.6)">=</tspan><tspan fill="#fbbf24">"/home/alumno"</tspan></text>
            <text x="65" y="161" fontFamily="monospace" fontSize="9.5"><tspan fill="#a78bfa">DEST</tspan><tspan fill="rgba(255,255,255,0.6)">=</tspan><tspan fill="#fbbf24">"/backup/$(date +%F)"</tspan></text>
            <text x="65" y="178" fontFamily="monospace" fontSize="9.5" fill="rgba(255,255,255,0.2)">{' '}</text>
            <text x="65" y="195" fontFamily="monospace" fontSize="9.5"><tspan fill="#c6ff33">for</tspan><tspan fill="rgba(255,255,255,0.7)"> file </tspan><tspan fill="#c6ff33">in</tspan><tspan fill="rgba(255,255,255,0.7)"> </tspan><tspan fill="#fbbf24">"$SOURCE"</tspan><tspan fill="rgba(255,255,255,0.7)">/*; </tspan><tspan fill="#c6ff33">do</tspan></text>
            <text x="65" y="212" fontFamily="monospace" fontSize="9.5"><tspan fill="rgba(255,255,255,0.5)">  </tspan><tspan fill="#c6ff33">if</tspan><tspan fill="rgba(255,255,255,0.6)"> [ -f </tspan><tspan fill="#fbbf24">"$file"</tspan><tspan fill="rgba(255,255,255,0.6)"> ]; </tspan><tspan fill="#c6ff33">then</tspan></text>
            <text x="65" y="229" fontFamily="monospace" fontSize="9.5"><tspan fill="rgba(255,255,255,0.5)">    cp </tspan><tspan fill="#fbbf24">"$file"</tspan><tspan fill="rgba(255,255,255,0.5)"> </tspan><tspan fill="#fbbf24">"$DEST"</tspan></text>
            <text x="65" y="246" fontFamily="monospace" fontSize="9.5"><tspan fill="rgba(255,255,255,0.5)">    echo </tspan><tspan fill="#fbbf24">"✓ Backed up: $file"</tspan></text>
            <text x="65" y="263" fontFamily="monospace" fontSize="9.5"><tspan fill="#c6ff33">  fi</tspan></text>
            <text x="65" y="280" fontFamily="monospace" fontSize="9.5"><tspan fill="#c6ff33">done</tspan></text>
            <rect x="148" y="272" width="8" height="12" fill="#c6ff33" opacity="0.9">
                <animate attributeName="opacity" values="0.9;0;0.9" dur="1s" repeatCount="indefinite" />
            </rect>

            {/* Stats strip */}
            <rect x="25" y="325" width="160" height="155" rx="8"
                fill="rgba(3,12,5,0.8)" stroke="rgba(198,255,51,0.18)" strokeWidth="1" />
            <text x="42" y="348" fontFamily="monospace" fontSize="9" fill="rgba(198,255,51,0.6)" fontWeight="bold">$ ./backup.sh</text>
            <text x="42" y="365" fontFamily="monospace" fontSize="9" fill="#c6ff33">✓ Backed up: notes.txt</text>
            <text x="42" y="381" fontFamily="monospace" fontSize="9" fill="#c6ff33">✓ Backed up: config.yml</text>
            <text x="42" y="397" fontFamily="monospace" fontSize="9" fill="#c6ff33">✓ Backed up: .bashrc</text>
            <text x="42" y="413" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.4)">---</text>
            <text x="42" y="429" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.6)">3 files backed up</text>
            <text x="42" y="448" fontFamily="monospace" fontSize="9.5" fill="rgba(198,255,51,0.8)">$ echo $?</text>
            <text x="42" y="464" fontFamily="monospace" fontSize="13" fontWeight="bold" fill="#c6ff33">0</text>

            {/* Concepts panel */}
            <rect x="200" y="325" width="175" height="155" rx="8"
                fill="rgba(0,0,0,0.45)" stroke="rgba(198,255,51,0.15)" strokeWidth="1" />
            <text x="215" y="348" fontFamily="monospace" fontSize="8" fill="rgba(198,255,51,0.7)" fontWeight="bold">BASH TOOLKIT</text>
            {['Variables', 'Arrays', 'Functions', 'Loops', 'Conditionals', 'Regex', 'Pipes', 'Cron'].map((item, i) => (
                <g key={item}>
                    <rect x="215" y={360 + i * 16} width="6" height="6" rx="1"
                        fill="rgba(198,255,51,0.5)" />
                    <text x="226" y={368 + i * 16} fontFamily="monospace" fontSize="9"
                        fill={i < 3 ? 'rgba(198,255,51,0.9)' : 'rgba(255,255,255,0.5)'}>{item}</text>
                </g>
            ))}

            <rect width="400" height="500" fill="url(#bs-scan)" opacity="0.5" style={{pointerEvents:'none'}} />
            <rect width="400" height="3" fill="url(#bs-topbar)" opacity="0.9" />
            <defs>
                <linearGradient id="bs-topbar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor="#c6ff33" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ─── 3. STORAGE & DISK ADMINISTRATION ── Orange #f97316 ───────────────────────
export function CoverStorageDisk() {
    return (
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="sd-bg" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#0e0600" />
                    <stop offset="100%" stopColor="#080400" />
                </linearGradient>
                <radialGradient id="sd-glow" cx="50%" cy="35%" r="55%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
                <pattern id="sd-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(249,115,22,0.09)" strokeWidth="0.5" />
                </pattern>
                <pattern id="sd-scan" width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect y="2" width="1" height="2" fill="rgba(0,0,0,0.2)" />
                </pattern>
                <filter id="sd-gf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>

            <rect width="400" height="500" fill="url(#sd-bg)" />
            <rect width="400" height="500" fill="url(#sd-grid)" />
            <rect width="400" height="500" fill="url(#sd-glow)" />

            {/* RAID disk stack decoration */}
            {[0,1,2].map(i => (
                <g key={i} transform={`translate(${220 - i*6}, ${40 + i*14})`}>
                    <ellipse cx="90" cy="55" rx="80" ry="18"
                        fill={`rgba(249,115,22,${0.06 - i*0.01})`}
                        stroke={`rgba(249,115,22,${0.4 - i*0.08})`} strokeWidth="1.2" />
                    <rect x="10" y="55" width="160" height="35"
                        fill={`rgba(249,115,22,${0.06 - i*0.01})`}
                        stroke={`rgba(249,115,22,${0.25 - i*0.05})`} strokeWidth="1" />
                    <ellipse cx="90" cy="90" rx="80" ry="18"
                        fill={`rgba(10,6,0,0.8)`}
                        stroke={`rgba(249,115,22,${0.3 - i*0.06})`} strokeWidth="1" />
                </g>
            ))}

            {/* RAID label */}
            <text x="242" y="162" fontFamily="monospace" fontSize="11" fontWeight="bold"
                fill="rgba(249,115,22,0.8)" filter="url(#sd-gf)">RAID 5</text>
            <text x="242" y="178" fontFamily="monospace" fontSize="8.5"
                fill="rgba(255,255,255,0.35)">3 discos · Paridad distribuida</text>

            {/* lsblk output */}
            <rect x="25" y="205" width="350" height="145" rx="8"
                fill="rgba(10,4,0,0.85)" stroke="rgba(249,115,22,0.25)" strokeWidth="1.2" />
            <rect x="25" y="205" width="350" height="20" rx="8" fill="rgba(249,115,22,0.12)" />
            <rect x="25" y="215" width="350" height="10" fill="rgba(249,115,22,0.12)" />
            <circle cx="43" cy="215" r="4.5" fill="#ef4444" opacity="0.8" />
            <circle cx="58" cy="215" r="4.5" fill="#fbbf24" opacity="0.8" />
            <circle cx="73" cy="215" r="4.5" fill="#22c55e" opacity="0.8" />
            <text x="95" y="219" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.3)">root@server — lsblk</text>

            <text x="40" y="244" fontFamily="monospace" fontSize="10" fill="#f97316" filter="url(#sd-gf)">$ lsblk</text>
            <text x="40" y="260" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.6)">NAME     MAJ:MIN  SIZE   TYPE  MOUNTPOINT</text>
            <text x="40" y="275" fontFamily="monospace" fontSize="8.5" fill="rgba(249,115,22,0.9)">sda        8:0   500G   disk</text>
            <text x="40" y="289" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.55)">├─sda1     8:1   512M   part  /boot</text>
            <text x="40" y="303" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.55)">├─sda2     8:2   499G   part</text>
            <text x="40" y="317" fontFamily="monospace" fontSize="8.5" fill="rgba(249,115,22,0.7)">  └─md0    9:0   998G   raid5 /mnt/data</text>
            <text x="40" y="331" fontFamily="monospace" fontSize="8.5" fill="rgba(249,115,22,0.9)">sdb        8:16  500G   disk</text>
            <text x="40" y="345" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.4)">└─sdb1     8:17  500G   part</text>

            {/* Disk usage bars */}
            <rect x="25" y="368" width="350" height="112" rx="8"
                fill="rgba(0,0,0,0.45)" stroke="rgba(249,115,22,0.18)" strokeWidth="1" />
            <text x="42" y="390" fontFamily="monospace" fontSize="9" fill="rgba(249,115,22,0.7)" fontWeight="bold">DISK USAGE</text>
            {[
                { name: '/dev/sda', pct: 72, used: '360G', total: '500G' },
                { name: '/dev/sdb', pct: 48, used: '240G', total: '500G' },
                { name: '/dev/md0', pct: 31, used: '309G', total: '998G' },
            ].map((d, i) => (
                <g key={d.name}>
                    <text x="42" y={410 + i*28} fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.5)">{d.name}</text>
                    <text x="330" y={410 + i*28} fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.35)" textAnchor="end">{d.used}/{d.total}</text>
                    <rect x="42" y={414 + i*28} width="260" height="7" rx="3.5" fill="rgba(255,255,255,0.05)" />
                    <rect x="42" y={414 + i*28} width={260 * d.pct / 100} height="7" rx="3.5"
                        fill={d.pct > 65 ? '#ef4444' : '#f97316'} opacity="0.75" />
                    <text x={42 + 260*d.pct/100 + 5} y={421 + i*28} fontFamily="monospace" fontSize="7.5"
                        fill="rgba(249,115,22,0.7)">{d.pct}%</text>
                </g>
            ))}

            <rect width="400" height="500" fill="url(#sd-scan)" opacity="0.5" style={{pointerEvents:'none'}} />
            <rect width="400" height="3" fill="url(#sd-topbar)" opacity="0.9" />
            <defs>
                <linearGradient id="sd-topbar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor="#f97316" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ─── 4. SEGURIDAD Y ANÁLISIS ── Red #ef4444 ───────────────────────────────────
export function CoverSeguridad() {
    return (
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="sec-bg" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#0f0003" />
                    <stop offset="100%" stopColor="#08000a" />
                </linearGradient>
                <radialGradient id="sec-glow" cx="50%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <pattern id="sec-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(239,68,68,0.1)" strokeWidth="0.5" />
                </pattern>
                <pattern id="sec-scan" width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect y="2" width="1" height="2" fill="rgba(0,0,0,0.2)" />
                </pattern>
                <filter id="sec-gf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>

            <rect width="400" height="500" fill="url(#sec-bg)" />
            <rect width="400" height="500" fill="url(#sec-grid)" />
            <rect width="400" height="500" fill="url(#sec-glow)" />

            {/* Shield icon — large decorative */}
            <path d="M 200 30 L 340 90 L 340 220 Q 340 340 200 400 Q 60 340 60 220 L 60 90 Z"
                fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.12)" strokeWidth="1.5" />
            <path d="M 200 60 L 310 108 L 310 215 Q 310 315 200 368 Q 90 315 90 215 L 90 108 Z"
                fill="rgba(239,68,68,0.03)" stroke="rgba(239,68,68,0.08)" strokeWidth="1" />
            {/* Lock symbol inside shield */}
            <rect x="178" y="195" width="44" height="34" rx="5" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.3)" strokeWidth="1.5" />
            <path d="M 187 195 L 187 183 Q 187 168 200 168 Q 213 168 213 183 L 213 195"
                fill="none" stroke="rgba(239,68,68,0.35)" strokeWidth="2.5" />
            <circle cx="200" cy="207" r="5" fill="rgba(239,68,68,0.6)" />
            <rect x="198.5" y="207" width="3" height="10" rx="1.5" fill="rgba(239,68,68,0.5)" />

            {/* Auth log window */}
            <rect x="25" y="35" width="350" height="200" rx="10"
                fill="rgba(10,0,5,0.9)" stroke="rgba(239,68,68,0.28)" strokeWidth="1.2" />
            <rect x="25" y="35" width="350" height="21" rx="10" fill="rgba(239,68,68,0.12)" />
            <rect x="25" y="45" width="350" height="11" fill="rgba(239,68,68,0.12)" />
            <circle cx="43" cy="46" r="4.5" fill="#ef4444" opacity="0.8" />
            <circle cx="58" cy="46" r="4.5" fill="#fbbf24" opacity="0.8" />
            <circle cx="73" cy="46" r="4.5" fill="#22c55e" opacity="0.8" />
            <text x="92" y="49" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.3)">/var/log/auth.log — tail -f</text>

            {/* Log lines */}
            {[
                { t: 'Jan 15 09:14:03', lvl: 'OK',    c: '#22c55e', msg: 'sshd[2341]: Accepted pub key for alumno' },
                { t: 'Jan 15 09:15:11', lvl: 'WARN',  c: '#fbbf24', msg: 'sudo: alumno: 3 wrong attempts' },
                { t: 'Jan 15 09:16:44', lvl: 'ALERT', c: '#ef4444', msg: 'fail2ban: Ban 192.168.1.105' },
                { t: 'Jan 15 09:17:02', lvl: 'OK',    c: '#22c55e', msg: 'pam: session opened for root' },
                { t: 'Jan 15 09:18:55', lvl: 'ALERT', c: '#ef4444', msg: 'sshd: Invalid user admin 10.0.0.1' },
                { t: 'Jan 15 09:19:33', lvl: 'WARN',  c: '#fbbf24', msg: 'kernel: iptables DROP IN=eth0' },
                { t: 'Jan 15 09:20:01', lvl: 'OK',    c: '#22c55e', msg: 'cron: alumno CMD /etc/backup.sh' },
            ].map((l, i) => (
                <g key={i}>
                    <text x="35" y={76 + i*17} fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.25)">{l.t}</text>
                    <rect x="155" y={67 + i*17} width="32" height="11" rx="2" fill={`${l.c}22`} />
                    <text x="160" y={76 + i*17} fontFamily="monospace" fontSize="7.5" fill={l.c} fontWeight="bold">{l.lvl}</text>
                    <text x="193" y={76 + i*17} fontFamily="monospace" fontSize="7.5" fill="rgba(255,255,255,0.5)"
                        style={{maxWidth:'160px'}}>{l.msg.slice(0,38)}</text>
                </g>
            ))}

            {/* Command strip */}
            <rect x="25" y="250" width="160" height="230" rx="8"
                fill="rgba(8,0,4,0.8)" stroke="rgba(239,68,68,0.18)" strokeWidth="1" />
            <text x="40" y="272" fontFamily="monospace" fontSize="9" fill="rgba(239,68,68,0.7)" fontWeight="bold">SECURITY TOOLKIT</text>
            {[
                ['fail2ban-client', '#ef4444'],
                ['iptables -L', '#f97316'],
                ['nmap -sV host', '#fbbf24'],
                ['netstat -tulpn', '#ef4444'],
                ['ss -antp', '#f97316'],
                ['auditctl -l', '#fbbf24'],
                ['chkrootkit', '#ef4444'],
                ['logwatch', '#f97316'],
            ].map(([cmd, c], i) => (
                <g key={cmd}>
                    <text x="40" y={292 + i*22} fontFamily="monospace" fontSize="9" fill="rgba(239,68,68,0.5)">$</text>
                    <text x="52" y={292 + i*22} fontFamily="monospace" fontSize="9" fill={`${c}cc`}>{cmd}</text>
                </g>
            ))}

            {/* Threat counter */}
            <rect x="200" y="250" width="175" height="110" rx="8"
                fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" strokeWidth="1" />
            <text x="215" y="272" fontFamily="monospace" fontSize="8.5" fill="rgba(239,68,68,0.7)" fontWeight="bold">THREAT MONITOR</text>
            <text x="215" y="295" fontFamily="monospace" fontSize="28" fontWeight="bold" fill="#ef4444" filter="url(#sec-gf)">247</text>
            <text x="215" y="312" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.4)">intentos bloqueados</text>
            <text x="215" y="328" fontFamily="monospace" fontSize="8" fill="rgba(239,68,68,0.5)">── últimas 24h ──────────</text>
            <text x="215" y="344" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.5)">IPs baneadas: <tspan fill="#ef4444">18</tspan></text>
            <text x="215" y="358" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.5)">Puertos abiertos: <tspan fill="#fbbf24">3</tspan></text>

            {/* Firewall */}
            <rect x="200" y="376" width="175" height="104" rx="8"
                fill="rgba(0,0,0,0.4)" stroke="rgba(239,68,68,0.15)" strokeWidth="1" />
            <text x="215" y="396" fontFamily="monospace" fontSize="8.5" fill="rgba(239,68,68,0.6)" fontWeight="bold">FIREWALL RULES</text>
            <text x="215" y="412" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.5)">INPUT DROP  → <tspan fill="#22c55e">default</tspan></text>
            <text x="215" y="427" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.5)">OUTPUT ACCEPT → <tspan fill="#22c55e">all</tspan></text>
            <text x="215" y="442" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.5)">FWD DROP    → <tspan fill="#22c55e">default</tspan></text>
            <text x="215" y="460" fontFamily="monospace" fontSize="8.5" fill="rgba(239,68,68,0.7)">22/tcp ALLOW → trusted</text>
            <text x="215" y="475" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.4)">80,443/tcp ALLOW → any</text>

            <rect width="400" height="500" fill="url(#sec-scan)" opacity="0.5" style={{pointerEvents:'none'}} />
            <rect width="400" height="3" fill="url(#sec-topbar)" opacity="0.9" />
            <defs>
                <linearGradient id="sec-topbar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor="#ef4444" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ─── 5. USUARIOS Y PERMISOS LINUX ── Purple #8b5cf6 ───────────────────────────
export function CoverUsuarios() {
    return (
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="up-bg" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor="#06000f" />
                    <stop offset="100%" stopColor="#04000a" />
                </linearGradient>
                <radialGradient id="up-glow" cx="40%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
                <pattern id="up-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="0.5" />
                </pattern>
                <pattern id="up-scan" width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect y="2" width="1" height="2" fill="rgba(0,0,0,0.2)" />
                </pattern>
                <filter id="up-gf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>

            <rect width="400" height="500" fill="url(#up-bg)" />
            <rect width="400" height="500" fill="url(#up-grid)" />
            <rect width="400" height="500" fill="url(#up-glow)" />

            {/* Large chmod decoration */}
            <text x="-10" y="155" fontFamily="monospace" fontSize="72" fill="rgba(139,92,246,0.07)" fontWeight="bold">rwxr-xr-x</text>
            <text x="30" y="240" fontFamily="monospace" fontSize="72" fill="rgba(139,92,246,0.04)" fontWeight="bold">rw-r--r--</text>

            {/* Permission matrix window */}
            <rect x="25" y="35" width="350" height="200" rx="10"
                fill="rgba(5,0,12,0.9)" stroke="rgba(139,92,246,0.3)" strokeWidth="1.2" />
            <rect x="25" y="35" width="350" height="21" rx="10" fill="rgba(139,92,246,0.12)" />
            <rect x="25" y="45" width="350" height="11" fill="rgba(139,92,246,0.12)" />
            <circle cx="43" cy="46" r="4.5" fill="#ef4444" opacity="0.8" />
            <circle cx="58" cy="46" r="4.5" fill="#fbbf24" opacity="0.8" />
            <circle cx="73" cy="46" r="4.5" fill="#22c55e" opacity="0.8" />
            <text x="92" y="49" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.3)">root@linux — chmod · chown</text>

            {/* Permission table header */}
            <text x="40" y="76" fontFamily="monospace" fontSize="10" fill="#8b5cf6" filter="url(#up-gf)">$ ls -la /etc/passwd</text>
            <text x="40" y="93" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.6)">
                <tspan fill="#a78bfa">-rw-r--r--</tspan>
                <tspan fill="rgba(255,255,255,0.4)"> 1 </tspan>
                <tspan fill="#22c55e">root root</tspan>
                <tspan fill="rgba(255,255,255,0.4)"> 2847 Jan 15 /etc/passwd</tspan>
            </text>

            {/* chmod breakdown */}
            <rect x="35" y="103" width="330" height="118" rx="6" fill="rgba(139,92,246,0.05)" />
            {/* column headers */}
            <text x="40" y="120" fontFamily="monospace" fontSize="8" fill="rgba(139,92,246,0.5)">TYPE</text>
            <text x="80" y="120" fontFamily="monospace" fontSize="8" fill="#a78bfa">OWNER</text>
            <text x="140" y="120" fontFamily="monospace" fontSize="8" fill="#8b5cf6">GROUP</text>
            <text x="200" y="120" fontFamily="monospace" fontSize="8" fill="rgba(139,92,246,0.6)">OTHER</text>
            <text x="270" y="120" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.3)">OCTAL</text>
            <text x="320" y="120" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.3)">MEANING</text>
            {/* rows */}
            {[
                ['-', 'rw-', 'r--', 'r--', '644', 'archivo normal'],
                ['d', 'rwx', 'r-x', 'r-x', '755', 'directorio'],
                ['-', 'rwx', 'rwx', 'rwx', '777', '¡PELIGRO!'],
                ['l', 'rwx', 'rwx', 'rwx', '777', 'symlink'],
                ['-', 'rws', 'r-s', 'r--', '6644', 'SUID/SGID'],
            ].map((r, i) => (
                <g key={i}>
                    <text x="40" y={137 + i*16} fontFamily="monospace" fontSize="8.5"
                        fill="rgba(255,255,255,0.35)">{r[0]}</text>
                    <text x="80" y={137 + i*16} fontFamily="monospace" fontSize="8.5"
                        fill="#a78bfa">{r[1]}</text>
                    <text x="140" y={137 + i*16} fontFamily="monospace" fontSize="8.5"
                        fill="#8b5cf6">{r[2]}</text>
                    <text x="200" y={137 + i*16} fontFamily="monospace" fontSize="8.5"
                        fill="rgba(139,92,246,0.6)">{r[3]}</text>
                    <text x="270" y={137 + i*16} fontFamily="monospace" fontSize="8.5"
                        fill={r[4] === '777' ? '#ef4444' : '#fbbf24'}>{r[4]}</text>
                    <text x="320" y={137 + i*16} fontFamily="monospace" fontSize="8"
                        fill="rgba(255,255,255,0.3)">{r[5]}</text>
                </g>
            ))}

            {/* Commands */}
            <rect x="25" y="253" width="170" height="227" rx="8"
                fill="rgba(5,0,12,0.8)" stroke="rgba(139,92,246,0.18)" strokeWidth="1" />
            <text x="40" y="275" fontFamily="monospace" fontSize="9" fill="rgba(139,92,246,0.7)" fontWeight="bold">COMANDOS</text>
            {[
                ['useradd -m alumno', '#a78bfa'],
                ['passwd alumno', '#8b5cf6'],
                ['usermod -aG sudo alumno', '#a78bfa'],
                ['chown root:www /var', '#8b5cf6'],
                ['chmod 640 secrets.txt', '#a78bfa'],
                ['chmod +x script.sh', '#8b5cf6'],
                ['umask 022', '#a78bfa'],
                ['id alumno', '#8b5cf6'],
                ['groups alumno', '#a78bfa'],
            ].map(([cmd, c], i) => (
                <g key={cmd}>
                    <text x="40" y={293 + i*20} fontFamily="monospace" fontSize="8.5" fill="rgba(139,92,246,0.4)">$</text>
                    <text x="52" y={293 + i*20} fontFamily="monospace" fontSize="8.5" fill={`${c}cc`}>{cmd}</text>
                </g>
            ))}

            {/* User table */}
            <rect x="210" y="253" width="165" height="227" rx="8"
                fill="rgba(0,0,0,0.45)" stroke="rgba(139,92,246,0.15)" strokeWidth="1" />
            <text x="225" y="275" fontFamily="monospace" fontSize="9" fill="rgba(139,92,246,0.7)" fontWeight="bold">/etc/passwd</text>
            {[
                ['root', '0', 'root'],
                ['daemon', '1', 'daemon'],
                ['www-data', '33', 'www'],
                ['alumno', '1000', 'users'],
                ['deploy', '1001', 'deploy'],
                ['backup', '34', 'backup'],
            ].map((u, i) => (
                <g key={u[0]}>
                    <text x="225" y={293 + i*28} fontFamily="monospace" fontSize="9"
                        fill={u[2] === 'root' ? '#ef4444' : u[0] === 'alumno' ? '#a78bfa' : 'rgba(255,255,255,0.5)'}
                        fontWeight={u[0] === 'alumno' ? 'bold' : 'normal'}>{u[0]}</text>
                    <text x="225" y={306 + i*28} fontFamily="monospace" fontSize="7.5"
                        fill="rgba(255,255,255,0.25)">uid={u[1]} gid={u[2]}</text>
                </g>
            ))}

            <rect width="400" height="500" fill="url(#up-scan)" opacity="0.5" style={{pointerEvents:'none'}} />
            <rect width="400" height="3" fill="url(#up-topbar)" opacity="0.9" />
            <defs>
                <linearGradient id="up-topbar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor="#8b5cf6" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ─── MODULE COVER GENERATOR ───────────────────────────────────────────────────
// Generates a unique terminal-art cover based on module index
const MODULE_THEMES = [
    { accent: '#06b6d4', accentRgb: '6,182,212', title: 'TERMINAL\nBASICS',
      lines: ['$ pwd', '/home/alumno', '$ cd ..',  '$ ls -la', '$ cat README'] },
    { accent: '#a78bfa', accentRgb: '167,139,250', title: 'ARCHIVOS\nY DIRS',
      lines: ['$ mkdir -p a/b/c', '$ cp -r src/ dst/', '$ find . -name "*.sh"', '$ tar -czf backup.tgz .', '$ du -sh *'] },
    { accent: '#c6ff33', accentRgb: '198,255,51', title: 'PERMISOS\nY OWNERS',
      lines: ['$ chmod 755 script.sh', '$ chown user:group .', '$ umask 022', '$ stat file.txt', '$ getfacl /path'] },
    { accent: '#f97316', accentRgb: '249,115,22', title: 'PROCESOS\nY SISTEMA',
      lines: ['$ ps aux | grep nginx', '$ top -n 1', '$ kill -9 1234', '$ systemctl status', '$ journalctl -f'] },
    { accent: '#22c55e', accentRgb: '34,197,94', title: 'SCRIPTS\nY VARS',
      lines: ['#!/bin/bash', 'VAR=$(command)', 'if [ $? -eq 0 ]; then', '  echo "OK"', 'fi'] },
    { accent: '#fbbf24', accentRgb: '251,191,36', title: 'REDES\nY PUERTOS',
      lines: ['$ ip addr show', '$ ss -tulpn', '$ ping -c3 8.8.8.8', '$ curl -I example.com', '$ dig +short google.es'] },
];

export function ModuleCoverSVG({ index = 0 }) {
    const t = MODULE_THEMES[index % MODULE_THEMES.length];
    const id = `mc${index}`;
    return (
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg"
            width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#050505" />
                    <stop offset="100%" stopColor="#020202" />
                </linearGradient>
                <radialGradient id={`${id}-g`} cx="35%" cy="35%" r="55%">
                    <stop offset="0%" stopColor={t.accent} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={t.accent} stopOpacity="0" />
                </radialGradient>
                <pattern id={`${id}-grid`} width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke={`rgba(${t.accentRgb},0.1)`} strokeWidth="0.5" />
                </pattern>
                <pattern id={`${id}-scan`} width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect y="2" width="1" height="2" fill="rgba(0,0,0,0.2)" />
                </pattern>
                <linearGradient id={`${id}-tb`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor={t.accent} stopOpacity="0.9" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            <rect width="400" height="500" fill={`url(#${id}-bg)`} />
            <rect width="400" height="500" fill={`url(#${id}-grid)`} />
            <rect width="400" height="500" fill={`url(#${id}-g)`} />

            {/* Big title watermark */}
            {t.title.split('\n').map((line, i) => (
                <text key={i} x="20" y={260 + i * 100} fontFamily="monospace" fontSize="72"
                    fill={`rgba(${t.accentRgb},0.06)`} fontWeight="bold">{line}</text>
            ))}

            {/* Terminal window */}
            <rect x="25" y="30" width="350" height="300" rx="10"
                fill="rgba(3,3,3,0.92)" stroke={`rgba(${t.accentRgb},0.28)`} strokeWidth="1.2" />
            {/* Titlebar */}
            <rect x="25" y="30" width="350" height="21" rx="10" fill={`rgba(${t.accentRgb},0.12)`} />
            <rect x="25" y="40" width="350" height="11" fill={`rgba(${t.accentRgb},0.12)`} />
            <circle cx="43" cy="41" r="4.5" fill="#ef4444" opacity="0.8" />
            <circle cx="58" cy="41" r="4.5" fill="#fbbf24" opacity="0.8" />
            <circle cx="73" cy="41" r="4.5" fill="#22c55e" opacity="0.8" />
            <text x="95" y="44" fontFamily="monospace" fontSize="8.5" fill="rgba(255,255,255,0.3)">alumno@linux — practice lab</text>

            {/* Command lines */}
            {t.lines.map((line, i) => (
                <text key={i} x="40" y={76 + i * 22} fontFamily="monospace" fontSize="11"
                    fill={i % 2 === 0 ? t.accent : 'rgba(255,255,255,0.6)'}
                    opacity={1 - i * 0.08}>
                    {line}
                </text>
            ))}

            {/* Blinking cursor */}
            <rect x="40" y={76 + t.lines.length * 22} width="9" height="14"
                fill={t.accent} opacity="0.8">
                <animate attributeName="opacity" values="0.8;0;0.8" dur="1.1s" repeatCount="indefinite" />
            </rect>

            {/* Circuit decorations */}
            <line x1="200" y1="350" x2="200" y2="390" stroke={`rgba(${t.accentRgb},0.2)`} strokeWidth="1" />
            <line x1="200" y1="390" x2="280" y2="390" stroke={`rgba(${t.accentRgb},0.2)`} strokeWidth="1" />
            <circle cx="280" cy="390" r="4" fill="none" stroke={`rgba(${t.accentRgb},0.4)`} strokeWidth="1" />
            <line x1="200" y1="390" x2="120" y2="390" stroke={`rgba(${t.accentRgb},0.15)`} strokeWidth="1" />
            <circle cx="120" cy="390" r="4" fill="none" stroke={`rgba(${t.accentRgb},0.3)`} strokeWidth="1" />

            {/* Bottom info strip */}
            <rect x="25" y="348" width="350" height="130" rx="8"
                fill={`rgba(${t.accentRgb},0.04)`} stroke={`rgba(${t.accentRgb},0.15)`} strokeWidth="1" />
            <text x="42" y="370" fontFamily="monospace" fontSize="9" fill={`rgba(${t.accentRgb},0.7)`} fontWeight="bold">
                MÓDULO {String(index + 1).padStart(2, '0')} · PRÁCTICA INTERACTIVA
            </text>
            <text x="42" y="388" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.35)">Entorno: Linux · Bash 5.2</text>
            <text x="42" y="405" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.35)">Labs interactivos · XP reward: 150+</text>

            {/* Mini progress dots */}
            <text x="42" y="430" fontFamily="monospace" fontSize="8.5" fill={`rgba(${t.accentRgb},0.5)`}>SKILLS DESBLOQUEADAS</text>
            {Array.from({length: 8}).map((_, i) => (
                <rect key={i} x={42 + i * 18} y="438" width="12" height="8" rx="2"
                    fill={i < (index + 1) * 2 ? t.accent : `rgba(${t.accentRgb},0.12)`}
                    opacity={i < (index + 1) * 2 ? 0.8 : 0.4} />
            ))}

            <rect width="400" height="500" fill={`url(#${id}-scan)`} opacity="0.5" style={{pointerEvents:'none'}} />
            <rect width="400" height="3" fill={`url(#${id}-tb)`} opacity="0.9" />
        </svg>
    );
}

// ─── LOOKUP HELPERS ───────────────────────────────────────────────────────────
const PATH_COVER_MAP = {
    'Linux Fundamentals':            CoverLinuxFundamentals,
    'Bash Scripting':                CoverBashScripting,
    'Storage & Disk Administration': CoverStorageDisk,
    'Seguridad y Análisis':          CoverSeguridad,
    'Usuarios y Permisos Linux':     CoverUsuarios,
};

export function PathCoverComponent({ pathTitle }) {
    const Component = PATH_COVER_MAP[pathTitle];
    if (!Component) return <CoverLinuxFundamentals />;
    return <Component />;
}
