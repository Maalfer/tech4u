import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, ChevronUp } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

/* ── Character assets — importados desde el módulo compartido ── */
import { getCharacterImage } from '../constants/characterAssets'

/* ─────────────────────────────────────────────────────────────────
   GLOBAL STYLES — fonts + keyframe animations
   NOTE: No class names that conflict with Tailwind utilities
───────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;700;800&display=swap');

@keyframes lbd-shimmer {
  0%   { transform: translateX(-120%) skewX(-20deg); }
  100% { transform: translateX(400%)  skewX(-20deg); }
}
@keyframes lbd-crown {
  0%,100% { transform: translateY(0px) rotate(-3deg); }
  50%      { transform: translateY(-10px) rotate(3deg); }
}
@keyframes lbd-fadeup {
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes lbd-spotlight {
  0%,100% { opacity:.16; }
  50%      { opacity:.30; }
}
@keyframes lbd-goldring {
  0%,100% { box-shadow: 0 0 35px 4px rgba(251,191,36,.22); }
  50%      { box-shadow: 0 0 65px 14px rgba(251,191,36,.42); }
}
@keyframes lbd-rowflash {
  0%   { opacity:0; left:-60%; }
  50%  { opacity:1; }
  100% { opacity:0; left:140%; }
}
@keyframes lbd-dotdrift {
  0%   { background-position: 0 0; }
  100% { background-position: 40px 40px; }
}
@keyframes lbd-liveping {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.3; transform:scale(1.8); }
}
@keyframes lbd-grid-scroll {
  0%   { background-position: center 0px; }
  100% { background-position: center 70px; }
}
@keyframes lbd-horizon-pulse {
  0%,100% { opacity:.55; transform:scaleX(1); }
  50%      { opacity:.9;  transform:scaleX(1.08); }
}
@keyframes lbd-speedline {
  0%   { opacity:0;   transform:scaleY(0) translateY(-50%); }
  30%  { opacity:.6; }
  100% { opacity:0;   transform:scaleY(1) translateY(0); }
}

/* Safe class names — no Tailwind conflicts */
.lbd-font-display { font-family: 'Bebas Neue', cursive !important; letter-spacing:.04em; }
.lbd-font-mono    { font-family: 'JetBrains Mono', monospace !important; }

.lbd-podium-enter { animation: lbd-fadeup .55s cubic-bezier(.22,1,.36,1) both; }
.lbd-p1 { animation-delay:.05s; }
.lbd-p2 { animation-delay:0s;   }
.lbd-p3 { animation-delay:.1s;  }

.lbd-shimmer-card { overflow:hidden; position:relative; }
.lbd-shimmer-card::after {
  content:'';
  position:absolute; top:-60%; width:35%; height:220%;
  background: linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);
  animation: lbd-shimmer 2.8s ease-in-out infinite;
  pointer-events:none; z-index:20;
}
.lbd-goldring { animation: lbd-goldring 2.5s ease-in-out infinite; }
.lbd-crown-float { animation: lbd-crown 2.8s ease-in-out infinite; }
.lbd-spotlight { animation: lbd-spotlight 3s ease-in-out infinite; }

.lbd-row { position:relative; overflow:hidden; display:grid !important; }
.lbd-row:hover .lbd-sweep {
  animation: lbd-rowflash .55s ease forwards;
}
.lbd-sweep {
  position:absolute; top:0; bottom:0; width:60%;
  background: linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);
  pointer-events:none;
}
.lbd-row-anim { animation: lbd-fadeup .4s ease both; }

/* lbd-dotbg removed — replaced by CyberGrid + ParticleCanvas */
.lbd-live {
  display:inline-block;
  animation: lbd-liveping 1.6s ease-in-out infinite;
}
`

/* ─────────────────────────────────────────────────────────────────
   CYBER GRID — perspective floor that rushes toward the viewer
───────────────────────────────────────────────────────────────── */
function CyberGrid() {
    return (
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:1 }}>

            {/* Top fade — sky darkness */}
            <div style={{
                position:'absolute', top:0, left:0, right:0, height:'55%',
                background:'linear-gradient(180deg,#060608 0%,transparent 100%)',
                zIndex:4,
            }} />

            {/* Bottom fade */}
            <div style={{
                position:'absolute', bottom:0, left:0, right:0, height:'12%',
                background:'linear-gradient(0deg,#060608 0%,transparent 100%)',
                zIndex:4,
            }} />

            {/* Horizon glow line */}
            <div style={{
                position:'absolute', top:'44%', left:'5%', right:'5%', height:2,
                background:'linear-gradient(90deg,transparent,rgba(251,191,36,.35),rgba(6,182,212,.35),transparent)',
                filter:'blur(2px)',
                animation:'lbd-horizon-pulse 3s ease-in-out infinite',
                zIndex:3,
            }} />

            {/* Horizon soft bloom */}
            <div style={{
                position:'absolute', top:'38%', left:'20%', right:'20%', height:80,
                background:'radial-gradient(ellipse,rgba(251,191,36,.12) 0%,transparent 70%)',
                zIndex:3,
            }} />

            {/* THE GRID — perspective floor */}
            <div style={{
                position:'absolute',
                bottom:0, left:'-80%', right:'-80%',
                height:'62%',
                transform:'perspective(280px) rotateX(68deg)',
                transformOrigin:'center bottom',
                backgroundImage:`
                    linear-gradient(rgba(251,191,36,.22) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(6,182,212,.14) 1px, transparent 1px)
                `,
                backgroundSize:'70px 70px',
                animation:'lbd-grid-scroll 1.4s linear infinite',
                zIndex:2,
            }} />

            {/* Center vertical speed line */}
            <div style={{
                position:'absolute', top:'14%', bottom:'38%',
                left:'50%', width:1,
                background:'linear-gradient(180deg,transparent,rgba(251,191,36,.5),rgba(251,191,36,.1))',
                transform:'translateX(-50%)',
                zIndex:3,
            }} />

            {/* Left diagonal speed line */}
            <div style={{
                position:'absolute', top:'22%', bottom:'38%',
                left:'calc(50% - 180px)', width:1,
                background:'linear-gradient(180deg,transparent,rgba(6,182,212,.3),rgba(6,182,212,.05))',
                transform:'translateX(-50%)',
                zIndex:3,
            }} />

            {/* Right diagonal speed line */}
            <div style={{
                position:'absolute', top:'22%', bottom:'38%',
                left:'calc(50% + 180px)', width:1,
                background:'linear-gradient(180deg,transparent,rgba(6,182,212,.3),rgba(6,182,212,.05))',
                transform:'translateX(-50%)',
                zIndex:3,
            }} />
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────
   PARTICLE CANVAS — floating orbs + connecting lines
───────────────────────────────────────────────────────────────── */
function ParticleCanvas() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        const resize = () => {
            canvas.width  = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
        }
        resize()
        window.addEventListener('resize', resize)

        // Particle palette — gold, cyan, white
        const COLORS = ['rgba(251,191,36,', 'rgba(6,182,212,', 'rgba(255,255,255,']

        const N = 90
        const particles = Array.from({ length: N }, () => {
            const color = COLORS[Math.floor(Math.random() * COLORS.length)]
            return {
                x:      Math.random() * canvas.width,
                y:      Math.random() * canvas.height,
                vx:     (Math.random() - 0.5) * 0.35,
                vy:     (Math.random() - 0.5) * 0.35,
                r:      Math.random() * 1.8 + 0.4,
                color,
                alpha:  Math.random() * 0.55 + 0.15,
                // Pulse phase
                phase:  Math.random() * Math.PI * 2,
                speed:  Math.random() * 0.02 + 0.008,
            }
        })

        let raf
        let tick = 0

        const draw = () => {
            tick++
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw connections first (below particles)
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx   = particles[i].x - particles[j].x
                    const dy   = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 130) {
                        const a = (1 - dist / 130) * 0.12
                        // Use gold for connections between gold particles
                        const cA = particles[i].color
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `${cA}${a})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                }
            }

            // Draw particles
            for (const p of particles) {
                // Move
                p.x += p.vx
                p.y += p.vy
                p.phase += p.speed

                // Wrap around edges
                if (p.x < -10) p.x = canvas.width  + 10
                if (p.x > canvas.width  + 10) p.x = -10
                if (p.y < -10) p.y = canvas.height + 10
                if (p.y > canvas.height + 10) p.y = -10

                // Pulsing alpha
                const pulseAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.phase))

                // Glow halo
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5)
                gradient.addColorStop(0,   `${p.color}${pulseAlpha})`)
                gradient.addColorStop(0.4, `${p.color}${pulseAlpha * 0.3})`)
                gradient.addColorStop(1,   `${p.color}0)`)
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2)
                ctx.fillStyle = gradient
                ctx.fill()

                // Core dot
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `${p.color}${Math.min(1, pulseAlpha * 1.8)})`
                ctx.fill()
            }

            raf = requestAnimationFrame(draw)
        }

        draw()
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position:'absolute', inset:0,
                width:'100%', height:'100%',
                zIndex:2, pointerEvents:'none',
                opacity: 0.75,
            }}
        />
    )
}

/* ─────────────────────────────────────────────────────────────────
   CONFIG PER PLACE
───────────────────────────────────────────────────────────────── */
const PCFG = {
    1: {
        accent:'#FBBF24', accentAlpha:'rgba(251,191,36,.18)',
        border:'rgba(251,191,36,.55)',
        topBar:'linear-gradient(90deg,#92400e,#F59E0B,#FCD34D,#F59E0B,#92400e)',
        label:'CAMPEÓN', labelColor:'#FCD34D',
        statBg:'rgba(251,191,36,.1)', statBorder:'rgba(251,191,36,.25)',
        podiumH:110, podiumGrad:'linear-gradient(180deg,rgba(251,191,36,.35),rgba(251,191,36,.04))',
        podiumBorder:'rgba(251,191,36,.4)',
        order:2, cardW:210, imgH:200, isFirst:true,
        nameSize:24, glow:'drop-shadow(0 0 20px rgba(251,191,36,.5))',
    },
    2: {
        accent:'#CBD5E1', accentAlpha:'rgba(203,213,225,.12)',
        border:'rgba(203,213,225,.35)',
        topBar:'linear-gradient(90deg,#334155,#94A3B8,#E2E8F0,#94A3B8,#334155)',
        label:'SUBCAMPEÓN', labelColor:'#94A3B8',
        statBg:'rgba(203,213,225,.08)', statBorder:'rgba(203,213,225,.2)',
        podiumH:68, podiumGrad:'linear-gradient(180deg,rgba(148,163,184,.3),rgba(148,163,184,.04))',
        podiumBorder:'rgba(148,163,184,.3)',
        order:1, cardW:185, imgH:165, isFirst:false,
        nameSize:20, glow:'drop-shadow(0 4px 10px rgba(0,0,0,.6))',
    },
    3: {
        accent:'#FB923C', accentAlpha:'rgba(251,146,60,.12)',
        border:'rgba(251,146,60,.35)',
        topBar:'linear-gradient(90deg,#7c2d12,#F97316,#FDBA74,#F97316,#7c2d12)',
        label:'3er LUGAR', labelColor:'#FB923C',
        statBg:'rgba(251,146,60,.08)', statBorder:'rgba(251,146,60,.2)',
        podiumH:44, podiumGrad:'linear-gradient(180deg,rgba(251,146,60,.3),rgba(251,146,60,.04))',
        podiumBorder:'rgba(251,146,60,.3)',
        order:3, cardW:185, imgH:155, isFirst:false,
        nameSize:20, glow:'drop-shadow(0 4px 10px rgba(0,0,0,.6))',
    },
}

// Alias para mantener compatibilidad con el código existente del componente
const getPjImage = lvl => getCharacterImage(lvl)

/* ─────────────────────────────────────────────────────────────────
   PODIUM CARD
───────────────────────────────────────────────────────────────── */
function PodiumCard({ entry, place }) {
    if (!entry) return null
    const c = PCFG[place]

    return (
        <div style={{ order: c.order, display:'flex', flexDirection:'column', alignItems:'center' }}
            className={`lbd-podium-enter lbd-p${place}`}>

            {/* Floating crown — only #1 */}
            {place === 1 && (
                <div className="lbd-crown-float" style={{
                    fontSize:36, marginBottom:10, userSelect:'none',
                    filter:'drop-shadow(0 0 14px rgba(251,191,36,.8))',
                }}>👑</div>
            )}

            {/* ── CARD ── */}
            <div
                className={`lbd-shimmer-card${place === 1 ? ' lbd-goldring' : ''}`}
                style={{
                    width: c.cardW,
                    background:'linear-gradient(180deg,rgba(255,255,255,.06) 0%,rgba(0,0,0,.88) 100%)',
                    border: `1px solid ${c.border}`,
                    borderRadius: 18,
                    overflow:'hidden',
                    flexShrink: 0,
                }}
            >
                {/* Top metallic bar */}
                <div style={{ height:3, background:c.topBar }} />

                {/* Spotlight for #1 */}
                {place === 1 && (
                    <div className="lbd-spotlight" style={{
                        position:'absolute', inset:0, pointerEvents:'none', zIndex:1,
                        background:'linear-gradient(180deg,rgba(251,191,36,.14) 0%,transparent 55%)',
                    }} />
                )}

                {/* Label chip */}
                <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 8px', position:'relative', zIndex:2 }}>
                    <span className="lbd-font-mono" style={{
                        fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'.22em',
                        color:c.labelColor, background:c.accentAlpha,
                        border:`1px solid ${c.statBorder}`, padding:'3px 10px', borderRadius:999,
                    }}>{c.label}</span>
                </div>

                {/* Character image — fixed height, no flex-1 */}
                <div style={{
                    height: c.imgH, position:'relative', overflow:'hidden',
                    display:'flex', alignItems:'flex-end', justifyContent:'center',
                    zIndex:2,
                }}>
                    {/* Fade bottom */}
                    <div style={{
                        position:'absolute', bottom:0, left:0, right:0, height:64,
                        background:'linear-gradient(0deg,rgba(0,0,0,.9),transparent)',
                        zIndex:1, pointerEvents:'none',
                    }} />
                    <img
                        src={getPjImage(entry.level)}
                        alt="char"
                        style={{
                            height: c.imgH, width:'auto', objectFit:'contain',
                            filter: c.glow, position:'relative', zIndex:0,
                            display:'block',
                        }}
                        onError={e => { e.target.src = '/src/assets/pj_lvl_1.png' }}
                    />
                </div>

                {/* Info */}
                <div style={{ padding:'10px 14px 14px', position:'relative', zIndex:2 }}>
                    <h3 className="lbd-font-display" style={{
                        fontSize: c.nameSize, color:'#fff', textAlign:'center',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                        marginBottom:6,
                        textShadow: place===1 ? '0 0 20px rgba(251,191,36,.4)' : 'none',
                    }}>{entry.nombre}</h3>

                    <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}>
                        <span className="lbd-font-mono" style={{
                            fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'.2em',
                            color:c.labelColor, background:c.accentAlpha,
                            border:`1px solid ${c.statBorder}`, padding:'3px 10px', borderRadius:999,
                        }}>LVL {entry.level}</span>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        <div style={{
                            background:c.statBg, border:`1px solid ${c.statBorder}`,
                            borderRadius:10, padding:'7px 4px', textAlign:'center',
                        }}>
                            <p className="lbd-font-mono" style={{ fontSize:7, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.15em', marginBottom:3 }}>XP</p>
                            <p className="lbd-font-mono" style={{ fontSize:11, fontWeight:700, color:c.accent }}>{entry.xp.toLocaleString()}</p>
                        </div>
                        <div style={{
                            background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)',
                            borderRadius:10, padding:'7px 4px', textAlign:'center',
                        }}>
                            <p className="lbd-font-mono" style={{ fontSize:7, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.15em', marginBottom:3 }}>Racha</p>
                            <p className="lbd-font-mono" style={{ fontSize:11, fontWeight:700, color: entry.streak > 0 ? '#F87171' : 'rgba(255,255,255,.2)' }}>
                                {entry.streak > 0 ? `🔥 ${entry.streak}` : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Podium step */}
            <div style={{
                width: c.cardW, height: c.podiumH,
                background: c.podiumGrad,
                border: `1px solid ${c.podiumBorder}`, borderTop:'none',
                borderRadius:'0 0 12px 12px', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
            }}>
                <span className="lbd-font-display" style={{
                    fontSize: place===1 ? 96 : place===2 ? 68 : 56,
                    color: c.accentAlpha, lineHeight:1,
                    WebkitTextStroke:`1px ${c.accentAlpha}`,
                }}>{place}</span>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────
   TABLE ROW HELPERS
───────────────────────────────────────────────────────────────── */
const RCFG = {
    1: { bar:'#FBBF24', bg:'rgba(251,191,36,.05)', text:'#FBBF24', badge:'rgba(251,191,36,.12)', badgeBorder:'rgba(251,191,36,.3)' },
    2: { bar:'#94A3B8', bg:'rgba(148,163,184,.04)', text:'#CBD5E1', badge:'rgba(148,163,184,.1)',  badgeBorder:'rgba(148,163,184,.25)' },
    3: { bar:'#F97316', bg:'rgba(249,115,22,.04)',  text:'#FB923C', badge:'rgba(249,115,22,.1)',   badgeBorder:'rgba(249,115,22,.25)' },
}
const rCfg = pos => RCFG[pos] || { bar:'#1e293b', bg:'transparent', text:'#64748B', badge:'rgba(255,255,255,.05)', badgeBorder:'rgba(255,255,255,.08)' }

const COLS = '56px 52px 1fr 100px 140px 120px'

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
export default function Leaderboard() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [data, setData]             = useState(null)
    const [loading, setLoading]       = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true)
        try { const res = await api.get('/leaderboard/global'); setData(res.data) } catch {}
        finally { setLoading(false); setRefreshing(false) }
    }
    useEffect(() => { fetchData() }, [])

    const top3  = data?.leaderboard?.slice(0, 3) || []
    const myPos = data?.my_position

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

            <div style={{ display:'flex', minHeight:'100vh', background:'#060608' }}>
                <Sidebar />

                <main style={{ flex:1, marginLeft:256, position:'relative', overflowX:'hidden' }}>

                    {/* ── EPIC BACKGROUND ── */}
                    <CyberGrid />
                    <ParticleCanvas />

                    {/* Deep atmospheric glows on top of grid */}
                    <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
                        width:800, height:500, zIndex:3, pointerEvents:'none',
                        background:'radial-gradient(ellipse,rgba(251,191,36,.07) 0%,transparent 65%)' }} />
                    <div style={{ position:'absolute', top:100, left:-80, width:450, height:450, zIndex:3, pointerEvents:'none',
                        background:'radial-gradient(ellipse,rgba(124,58,237,.06) 0%,transparent 70%)' }} />
                    <div style={{ position:'absolute', top:100, right:-80, width:450, height:450, zIndex:3, pointerEvents:'none',
                        background:'radial-gradient(ellipse,rgba(6,182,212,.05) 0%,transparent 70%)' }} />

                    <div style={{ position:'relative', zIndex:10, maxWidth:960, margin:'0 auto', padding:'40px 32px 60px' }}>

                        {/* ── HEADER ──────────────────────────────────────── */}
                        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:56 }}>
                            <div>
                                <p className="lbd-font-mono" style={{
                                    fontSize:10, textTransform:'uppercase', letterSpacing:'.35em',
                                    color:'rgba(251,191,36,.6)', marginBottom:6,
                                }}>⚔ Temporada Activa · Global</p>
                                <h1 className="lbd-font-display" style={{
                                    fontSize:'clamp(56px,8vw,96px)', color:'#fff', lineHeight:1,
                                    textShadow:'0 0 60px rgba(251,191,36,.2)',
                                }}>RANKING</h1>
                                <p className="lbd-font-mono" style={{ fontSize:11, color:'rgba(255,255,255,.28)', marginTop:4 }}>
                                    Demuestra de qué estás hecho
                                </p>
                            </div>

                            <div style={{ display:'flex', alignItems:'center', gap:12, paddingBottom:4 }}>
                                {/* Live badge */}
                                <div style={{
                                    display:'flex', alignItems:'center', gap:8,
                                    padding:'7px 14px', borderRadius:999,
                                    background:'rgba(34,197,94,.07)', border:'1px solid rgba(34,197,94,.2)',
                                }}>
                                    <span className="lbd-live" style={{
                                        width:7, height:7, borderRadius:'50%', background:'#22C55E',
                                    }} />
                                    <span className="lbd-font-mono" style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.2em', color:'#22C55E' }}>Live</span>
                                </div>
                                {/* Sync button */}
                                <button
                                    onClick={() => fetchData(true)} disabled={refreshing}
                                    className="lbd-font-mono"
                                    style={{
                                        display:'flex', alignItems:'center', gap:8,
                                        padding:'8px 18px', borderRadius:999,
                                        background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)',
                                        color:'rgba(255,255,255,.45)', cursor:'pointer',
                                        fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.2em',
                                        transition:'color .2s',
                                    }}
                                >
                                    <RefreshCw style={{ width:13, height:13 }} className={refreshing ? 'animate-spin' : ''} />
                                    Sync
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', gap:20 }}>
                                <div style={{ position:'relative', width:52, height:52 }}>
                                    <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid rgba(251,191,36,.15)' }} />
                                    <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid transparent', borderTopColor:'#FBBF24',
                                        animation:'spin 1s linear infinite', boxShadow:'0 0 18px rgba(251,191,36,.3)' }} />
                                </div>
                                <p className="lbd-font-mono" style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'.4em', color:'rgba(255,255,255,.2)' }}>
                                    Cargando arena…
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* ── PODIUM ──────────────────────────────────── */}
                                {top3.length > 0 && (
                                    <section style={{ marginBottom:72 }}>

                                        {/* Hall of Fame label */}
                                        <div style={{ display:'flex', alignItems:'center', gap:20, justifyContent:'center', marginBottom:48 }}>
                                            <div style={{ flex:1, maxWidth:180, height:1, background:'linear-gradient(90deg,transparent,rgba(251,191,36,.25))' }} />
                                            <span className="lbd-font-display" style={{
                                                fontSize:22, letterSpacing:'.12em', color:'rgba(251,191,36,.8)',
                                                textShadow:'0 0 30px rgba(251,191,36,.3)',
                                            }}>HALL OF FAME</span>
                                            <div style={{ flex:1, maxWidth:180, height:1, background:'linear-gradient(90deg,rgba(251,191,36,.25),transparent)' }} />
                                        </div>

                                        {/* Podium — items-end aligns all bases at the bottom */}
                                        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:16 }}>
                                            <PodiumCard entry={top3[1]} place={2} />
                                            <PodiumCard entry={top3[0]} place={1} />
                                            <PodiumCard entry={top3[2]} place={3} />
                                        </div>

                                        <div style={{ height:1, maxWidth:660, margin:'0 auto',
                                            background:'linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent)' }} />
                                    </section>
                                )}

                                {/* ── MY POSITION ─────────────────────────────── */}
                                {myPos && myPos.position > 3 && (
                                    <div style={{
                                        marginBottom:32, borderRadius:14, overflow:'hidden',
                                        border:'1px solid rgba(251,191,36,.2)',
                                        background:'linear-gradient(135deg,rgba(251,191,36,.07),rgba(0,0,0,.6))',
                                    }}>
                                        <div style={{ height:2, background:'linear-gradient(90deg,transparent,rgba(251,191,36,.6),transparent)' }} />
                                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'20px 28px' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                                                <div style={{
                                                    width:56, height:56, borderRadius:12, flexShrink:0,
                                                    background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.3)',
                                                    display:'flex', alignItems:'center', justifyContent:'center',
                                                    boxShadow:'0 0 20px rgba(251,191,36,.15)',
                                                }}>
                                                    <span className="lbd-font-display" style={{ fontSize:26, color:'#FBBF24', lineHeight:1 }}>#{myPos.position}</span>
                                                </div>
                                                <div>
                                                    <p className="lbd-font-mono" style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.15em', color:'rgba(255,255,255,.85)', marginBottom:6 }}>Tu Posición</p>
                                                    <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:12 }}>
                                                        {[
                                                            { l:'Nivel', v:myPos.level, c:'rgba(255,255,255,.38)' },
                                                            { l:'XP', v:`${myPos.xp.toLocaleString()} xp`, c:'#FBBF24' },
                                                            { l:'Racha', v: myPos.streak>0 ? `🔥 ${myPos.streak}d` : '—', c: myPos.streak>0?'#F87171':'rgba(255,255,255,.2)' },
                                                        ].map(({ l, v, c }) => (
                                                            <span key={l} className="lbd-font-mono" style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'.15em', color:c }}>
                                                                {l}: <strong>{v}</strong>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate('/tests')}
                                                className="lbd-font-mono"
                                                style={{
                                                    display:'flex', alignItems:'center', gap:8, flexShrink:0,
                                                    padding:'11px 22px', borderRadius:12, cursor:'pointer',
                                                    background:'#FBBF24', color:'#000',
                                                    fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'.15em',
                                                    boxShadow:'0 0 24px rgba(251,191,36,.3)', border:'none',
                                                    transition:'box-shadow .2s, transform .15s',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 42px rgba(251,191,36,.55)'; e.currentTarget.style.transform='scale(1.04)' }}
                                                onMouseLeave={e => { e.currentTarget.style.boxShadow='0 0 24px rgba(251,191,36,.3)';  e.currentTarget.style.transform='scale(1)' }}
                                            >
                                                <ChevronUp style={{ width:13, height:13 }} />
                                                Subir Puestos
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ── TABLE ───────────────────────────────────── */}
                                <div style={{
                                    borderRadius:18, overflow:'hidden',
                                    border:'1px solid rgba(255,255,255,.06)',
                                    background:'rgba(0,0,0,.55)', backdropFilter:'blur(24px)',
                                    boxShadow:'0 40px 80px rgba(0,0,0,.55)',
                                }}>
                                    {/* Header */}
                                    <div style={{
                                        display:'grid', gridTemplateColumns: COLS,
                                        alignItems:'center', gap:16,
                                        padding:'14px 24px',
                                        background:'rgba(0,0,0,.7)', backdropFilter:'blur(16px)',
                                        borderBottom:'1px solid rgba(255,255,255,.06)',
                                        position:'sticky', top:0, zIndex:10,
                                    }}>
                                        {[['#','center'],['LVL','center'],['JUGADOR','left'],['RACHA','center'],['EXPERIENCIA','right'],['RANGO','right']].map(([col,align]) => (
                                            <span key={col} className="lbd-font-mono" style={{
                                                fontSize:8, fontWeight:700, textTransform:'uppercase',
                                                letterSpacing:'.28em', color:'rgba(255,255,255,.22)', textAlign:align,
                                            }}>{col}</span>
                                        ))}
                                    </div>

                                    {/* Rows */}
                                    <div>
                                        {data?.leaderboard?.map((entry, idx) => {
                                            const rc = rCfg(entry.position)
                                            return (
                                                <div
                                                    key={entry.user_id}
                                                    className="lbd-row lbd-row-anim"
                                                    style={{
                                                        gridTemplateColumns: COLS,
                                                        alignItems:'center', gap:16,
                                                        padding:'14px 24px',
                                                        background: entry.is_me ? 'rgba(251,191,36,.06)' : rc.bg,
                                                        borderBottom:'1px solid rgba(255,255,255,.04)',
                                                        borderLeft:`3px solid ${entry.is_me ? '#FBBF24' : rc.bar}`,
                                                        animationDelay:`${idx * 0.03}s`,
                                                        transition:'background .15s',
                                                        cursor:'default',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = entry.is_me ? 'rgba(251,191,36,.09)' : 'rgba(255,255,255,.025)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = entry.is_me ? 'rgba(251,191,36,.06)' : rc.bg}
                                                >
                                                    <div className="lbd-sweep" />

                                                    {/* # */}
                                                    <div style={{ textAlign:'center' }}>
                                                        {entry.position <= 3
                                                            ? <span style={{ fontSize:18 }}>{['👑','🥈','🥉'][entry.position-1]}</span>
                                                            : <span className="lbd-font-mono" style={{ fontSize:13, fontWeight:700, color: entry.is_me ? '#FBBF24' : rc.text }}>
                                                                #{entry.position}
                                                              </span>
                                                        }
                                                    </div>

                                                    {/* LVL */}
                                                    <div style={{ display:'flex', justifyContent:'center' }}>
                                                        <div style={{
                                                            width:34, height:34, borderRadius:9,
                                                            background:rc.badge, border:`1px solid ${rc.badgeBorder}`,
                                                            display:'flex', alignItems:'center', justifyContent:'center',
                                                        }}>
                                                            <span className="lbd-font-mono" style={{ fontSize:12, fontWeight:700, color:rc.text }}>{entry.level}</span>
                                                        </div>
                                                    </div>

                                                    {/* Name */}
                                                    <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0, overflow:'hidden' }}>
                                                        <div style={{
                                                            width:30, height:30, borderRadius:'50%', flexShrink:0,
                                                            overflow:'hidden', border:`1px solid ${rc.badgeBorder}`,
                                                            background:'rgba(0,0,0,.6)',
                                                        }}>
                                                            <img
                                                                src={getPjImage(entry.level)}
                                                                style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.85, display:'block' }}
                                                                onError={e => { e.target.src='/src/assets/pj_lvl_1.png' }}
                                                            />
                                                        </div>
                                                        <span className="lbd-font-mono" style={{
                                                            fontSize:13, fontWeight:700, color: entry.is_me ? '#FBBF24' : '#E2E8F0',
                                                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                                                        }}>{entry.nombre}</span>
                                                        {entry.is_me && (
                                                            <span className="lbd-font-mono" style={{
                                                                fontSize:7, fontWeight:800, textTransform:'uppercase', letterSpacing:'.15em',
                                                                padding:'2px 6px', borderRadius:4,
                                                                background:'rgba(251,191,36,.18)', border:'1px solid rgba(251,191,36,.4)',
                                                                color:'#FBBF24', flexShrink:0,
                                                            }}>TÚ</span>
                                                        )}
                                                    </div>

                                                    {/* Streak */}
                                                    <div style={{ textAlign:'center' }}>
                                                        <span className="lbd-font-mono" style={{
                                                            fontSize:12, fontWeight:700,
                                                            color: entry.streak > 0 ? '#F87171' : 'rgba(255,255,255,.18)',
                                                        }}>{entry.streak > 0 ? `🔥 ${entry.streak}` : '—'}</span>
                                                    </div>

                                                    {/* XP */}
                                                    <div style={{ textAlign:'right' }}>
                                                        <span className="lbd-font-mono" style={{ fontSize:13, fontWeight:700, color: entry.is_me ? '#fff' : rc.text }}>
                                                            {entry.xp.toLocaleString()}
                                                        </span>
                                                        <span className="lbd-font-mono" style={{ fontSize:9, color:'rgba(255,255,255,.2)', marginLeft:3 }}>xp</span>
                                                    </div>

                                                    {/* Rank */}
                                                    <div style={{ display:'flex', justifyContent:'flex-end' }}>
                                                        <span className="lbd-font-mono" style={{
                                                            fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'.15em',
                                                            padding:'5px 10px', borderRadius:8,
                                                            background:rc.badge, border:`1px solid ${rc.badgeBorder}`,
                                                            color:rc.text,
                                                        }}>{entry.rank_name}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Empty */}
                                    {(!data?.leaderboard || data.leaderboard.length === 0) && (
                                        <div style={{ padding:'80px 0', textAlign:'center' }}>
                                            <div style={{ fontSize:44, opacity:.25, marginBottom:16 }}>⚔️</div>
                                            <p className="lbd-font-mono" style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'.4em', color:'rgba(255,255,255,.2)' }}>
                                                El trono espera a su primer ocupante
                                            </p>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    {data?.leaderboard?.length > 0 && (
                                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 24px', borderTop:'1px solid rgba(255,255,255,.04)' }}>
                                            <span className="lbd-font-mono" style={{ fontSize:8, textTransform:'uppercase', letterSpacing:'.2em', color:'rgba(255,255,255,.18)' }}>
                                                {data.leaderboard.length} guerreros clasificados
                                            </span>
                                            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                                <span className="lbd-live" style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E', display:'inline-block' }} />
                                                <span className="lbd-font-mono" style={{ fontSize:8, textTransform:'uppercase', letterSpacing:'.2em', color:'rgba(255,255,255,.18)' }}>
                                                    Tiempo real
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    )
}
