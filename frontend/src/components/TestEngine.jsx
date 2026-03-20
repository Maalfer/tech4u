import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ChevronRight, ChevronLeft, Clock, LogOut, Flag,
    Trophy, Activity, CheckCircle2, Circle, AlertTriangle,
    BookOpen, Zap, Target, BarChart3, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Paletas por modo ───────────────────────────────────────────────────────────
const THEME = {
    exam: {
        accent:       '#ef4444',
        accentRgb:    '239,68,68',
        accentDim:    'rgba(239,68,68,0.12)',
        accentBorder: 'rgba(239,68,68,0.25)',
        glow:         '0 0 40px rgba(239,68,68,0.15)',
        bg:           'radial-gradient(ellipse at 50% -10%, rgba(239,68,68,0.06) 0%, transparent 60%), #080808',
        badge:        'Modo Supervivencia',
        badgeBg:      'rgba(239,68,68,0.12)',
        badgeBorder:  'rgba(239,68,68,0.3)',
        badgeText:    '#fca5a5',
        timerCritical:'#ef4444',
        optionSel:    { border: 'rgba(239,68,68,0.6)', bg: 'rgba(239,68,68,0.1)', letter: { bg: '#ef4444', text: '#fff' } },
        navCurrent:   'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]',
        navAnswered:  'bg-red-500/15 text-red-400 border-red-500/30',
        btnNext:      'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]',
        btnFinish:    'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white',
        progressBar:  'linear-gradient(90deg,#991b1b,#ef4444)',
        scanLine:     'rgba(239,68,68,0.03)',
    },
    normal: {
        accent:       '#a3e635',
        accentRgb:    '163,230,53',
        accentDim:    'rgba(163,230,53,0.1)',
        accentBorder: 'rgba(163,230,53,0.22)',
        glow:         '0 0 40px rgba(163,230,53,0.08)',
        bg:           'radial-gradient(ellipse at 50% -10%, rgba(163,230,53,0.04) 0%, transparent 60%), #080808',
        badge:        'Test Normal',
        badgeBg:      'rgba(163,230,53,0.1)',
        badgeBorder:  'rgba(163,230,53,0.25)',
        badgeText:    '#bef264',
        timerCritical:'#ef4444',
        optionSel:    { border: 'rgba(163,230,53,0.5)', bg: 'rgba(163,230,53,0.08)', letter: { bg: '#a3e635', text: '#000' } },
        navCurrent:   'bg-lime-400 text-black shadow-[0_0_12px_rgba(163,230,53,0.5)]',
        navAnswered:  'bg-lime-400/12 text-lime-400/70 border-lime-400/25',
        btnNext:      'bg-lime-400 hover:bg-lime-300 text-black shadow-[0_0_20px_rgba(163,230,53,0.25)]',
        btnFinish:    'bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-black',
        progressBar:  'linear-gradient(90deg,#4d7c0f,#a3e635)',
        scanLine:     'rgba(163,230,53,0.025)',
    },
    errors: {
        accent:       '#f97316',
        accentRgb:    '249,115,22',
        accentDim:    'rgba(249,115,22,0.1)',
        accentBorder: 'rgba(249,115,22,0.22)',
        glow:         '0 0 40px rgba(249,115,22,0.08)',
        bg:           'radial-gradient(ellipse at 50% -10%, rgba(249,115,22,0.04) 0%, transparent 60%), #080808',
        badge:        'Test de Errores',
        badgeBg:      'rgba(249,115,22,0.1)',
        badgeBorder:  'rgba(249,115,22,0.25)',
        badgeText:    '#fdba74',
        timerCritical:'#ef4444',
        optionSel:    { border: 'rgba(249,115,22,0.5)', bg: 'rgba(249,115,22,0.08)', letter: { bg: '#f97316', text: '#000' } },
        navCurrent:   'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.5)]',
        navAnswered:  'bg-orange-500/12 text-orange-400/70 border-orange-500/25',
        btnNext:      'bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.25)]',
        btnFinish:    'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
        progressBar:  'linear-gradient(90deg,#9a3412,#f97316)',
        scanLine:     'rgba(249,115,22,0.025)',
    },
}

export default function TestEngine({ questions = [], mode = 'normal', onFinish, timeLimit = null, onQuit }) {
    const navigate = useNavigate()
    const [current,      setCurrent]      = useState(0)
    const [answers,      setAnswers]      = useState({})
    const [timeLeft,     setTimeLeft]     = useState(timeLimit)
    const [startTime,    setStartTime]    = useState(Date.now())
    const [direction,    setDirection]    = useState(0)
    const [confirmFinish, setConfirmFinish] = useState(false)
    const [confirmQuit,  setConfirmQuit]  = useState(false)
    const timerRef   = useRef(null)
    const answersRef = useRef(answers)
    const t = THEME[mode] || THEME.normal

    // ── sync ref ──────────────────────────────────────────────────────────────
    useEffect(() => { answersRef.current = answers }, [answers])

    // ── timer ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (timeLeft === null) return
        if (timeLeft <= 0) { handleFinish(); return }
        timerRef.current = setTimeout(() => setTimeLeft(v => v - 1), 1000)
        return () => clearTimeout(timerRef.current)
    }, [timeLeft])

    // ── keyboard ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const h = (e) => {
            if (['INPUT','TEXTAREA'].includes(e.target.tagName)) return
            const map = { '1':'a','2':'b','3':'c','4':'d' }
            if (map[e.key]) handleSelect(map[e.key])
            else if ((e.key === 'Enter' || e.key === 'ArrowRight') && current < questions.length - 1) goTo(current + 1)
            else if (e.key === 'ArrowLeft' && current > 0) goTo(current - 1)
        }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [current, questions])

    // ── helpers ───────────────────────────────────────────────────────────────
    const q             = questions[current]
    const OPTIONS       = ['a','b','c','d']
    const selected      = q ? answers[q.id]?.selected_answer : null
    const isMarked      = q ? answers[q.id]?.marked : false
    const answeredCount = Object.values(answers).filter(a => a?.selected_answer).length
    const pct           = Math.round((answeredCount / questions.length) * 100)
    const mins          = timeLeft !== null ? String(Math.floor(timeLeft / 60)).padStart(2,'0') : null
    const secs          = timeLeft !== null ? String(timeLeft % 60).padStart(2,'0') : null
    const isCritical    = timeLeft !== null && timeLeft < 120

    const persistTime = () => {
        if (!q) return
        const spent = (Date.now() - startTime) / 1000
        setAnswers(p => ({ ...p, [q.id]: { selected_answer: p[q.id]?.selected_answer||null, time_spent_seconds: (p[q.id]?.time_spent_seconds||0)+spent, marked: p[q.id]?.marked||false } }))
        setStartTime(Date.now())
    }
    const handleSelect = (opt) => {
        const spent = (Date.now() - startTime) / 1000
        setAnswers(p => ({ ...p, [q.id]: { selected_answer: opt, time_spent_seconds: (p[q.id]?.time_spent_seconds||0)+spent, marked: p[q.id]?.marked||false } }))
        setStartTime(Date.now())
    }
    const toggleMark = () => setAnswers(p => ({ ...p, [q.id]: { selected_answer: p[q.id]?.selected_answer||null, time_spent_seconds: p[q.id]?.time_spent_seconds||0, marked: !p[q.id]?.marked } }))
    const goTo = (i) => { if (i<0||i>=questions.length) return; setDirection(i>current?1:-1); persistTime(); setCurrent(i) }
    const handleFinish = () => {
        persistTime()
        const formatted = Object.entries(answersRef.current).filter(([_,d])=>d.selected_answer).map(([id,d])=>({ question_id:Number(id), selected_answer:d.selected_answer, time_spent_seconds:d.time_spent_seconds }))
        if (onFinish) onFinish(formatted)
    }
    const handleQuit = () => setConfirmQuit(true)

    if (!q) return null

    // Nav bubble state
    const getBubble = (i) => {
        const a = answers[questions[i].id]
        if (i === current) return t.navCurrent + ' scale-110 z-10 font-black'
        if (a?.marked) return 'bg-amber-500/15 text-amber-400 border border-amber-500/35 font-semibold'
        if (a?.selected_answer) return t.navAnswered + ' border font-medium'
        return 'bg-white/[0.03] text-slate-600 border border-white/[0.06] hover:border-white/20 hover:text-slate-300 font-medium'
    }

    const unanswered = questions.length - answeredCount

    return (
        <div className="flex flex-col min-h-screen select-none" style={{ background: t.bg }}>

            {/* ══ TOP HUD BAR ══════════════════════════════════════════════════ */}
            <div className="sticky top-0 z-50 border-b" style={{ borderColor: t.accentBorder, background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(20px)' }}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

                    {/* Left: quit + badge */}
                    <div className="flex items-center gap-4 min-w-0">
                        <button onClick={handleQuit}
                            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/[0.04] hover:bg-red-500/15 hover:border-red-500/40 text-slate-500 hover:text-red-400 transition-all">
                            <LogOut size={14} />
                        </button>
                        <div className="flex items-center gap-2.5">
                            <span className="hidden sm:flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border"
                                style={{ background: t.badgeBg, borderColor: t.badgeBorder, color: t.badgeText }}>
                                {t.badge}
                            </span>
                        </div>
                    </div>

                    {/* Center: timer */}
                    <div className="flex flex-col items-center">
                        {timeLeft !== null ? (
                            <div className={`flex items-center gap-2.5 px-5 py-2 rounded-2xl border transition-all ${isCritical ? 'border-red-500/40 bg-red-500/10 animate-pulse' : ''}`}
                                style={!isCritical ? { borderColor: t.accentBorder, background: t.accentDim } : {}}>
                                <Clock size={14} style={{ color: isCritical ? '#ef4444' : t.accent }} />
                                <span className="text-2xl font-black font-mono tabular-nums tracking-tighter"
                                    style={{ color: isCritical ? '#ef4444' : '#fff' }}>
                                    {mins}:{secs}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/10 bg-white/[0.04]">
                                <Activity size={13} className="text-slate-500" />
                                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Sin límite</span>
                            </div>
                        )}
                    </div>

                    {/* Right: stats */}
                    <div className="flex items-center gap-5 min-w-0">
                        <div className="text-right">
                            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Respondidas</p>
                            <p className="text-sm font-black text-white tabular-nums">
                                {answeredCount}<span className="text-slate-600 font-normal">/{questions.length}</span>
                            </p>
                        </div>
                        <div className="hidden sm:block w-px h-7 bg-white/10" />
                        <div className="hidden sm:block text-right">
                            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Progreso</p>
                            <p className="text-sm font-black tabular-nums" style={{ color: t.accent }}>{pct}%</p>
                        </div>
                        {/* mini progress bar */}
                        <div className="hidden md:block w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct}%`, background: t.progressBar }} />
                        </div>
                    </div>
                </div>

                {/* thin accent line */}
                <div className="h-[1.5px]" style={{ background: `linear-gradient(90deg,transparent,${t.accent}55,transparent)` }} />
            </div>

            {/* ══ BODY ═════════════════════════════════════════════════════════ */}
            <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-5">

                {/* ── LEFT: Question Navigator ─────────────────────────────── */}
                <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
                    <div className="sticky top-24 flex flex-col gap-3">
                        {/* Header */}
                        <div className="px-1 flex items-center justify-between mb-1">
                            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Preguntas</span>
                            <span className="text-[9px] font-mono" style={{ color: t.accent }}>{answeredCount}/{questions.length}</span>
                        </div>

                        {/* Bubble grid */}
                        <div className="flex flex-wrap gap-1.5">
                            {questions.map((_, i) => (
                                <button key={i} onClick={() => goTo(i)}
                                    className={`w-8 h-8 text-[10px] rounded-lg transition-all flex items-center justify-center ${getBubble(i)}`}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-3 flex flex-col gap-1.5 px-1">
                            {[
                                { color: t.accent,    label: 'Respondida', dot: true },
                                { color: '#f59e0b',   label: 'Marcada',    dot: true },
                                { color: '#4b5563',   label: 'Sin responder', dot: true },
                            ].map(({ color, label, dot }) => (
                                <div key={label} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, opacity: 0.7 }} />
                                    <span className="text-[9px] font-mono text-slate-600">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ── RIGHT: Main content ───────────────────────────────────── */}
                <main className="flex-1 flex flex-col gap-5 min-w-0">

                    {/* Mobile nav bubbles */}
                    <div className="lg:hidden flex flex-wrap gap-1.5 justify-center">
                        {questions.map((_, i) => (
                            <button key={i} onClick={() => goTo(i)}
                                className={`w-7 h-7 text-[9px] rounded-md transition-all flex items-center justify-center ${getBubble(i)}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div key={current} custom={direction}
                            variants={{ enter: d => ({ x: d>0?30:-30, opacity:0 }), center: { x:0, opacity:1 }, exit: d => ({ x: d<0?30:-30, opacity:0 }) }}
                            initial="enter" animate="center" exit="exit"
                            transition={{ x: { type:'spring', stiffness:500, damping:40 }, opacity: { duration:0.12 } }}
                            className="flex flex-col gap-4">

                            {/* ── QUESTION CARD ──────────────────────────────── */}
                            <div className="relative rounded-3xl border overflow-hidden"
                                style={{ borderColor: t.accentBorder, background: 'rgba(12,12,12,0.9)', boxShadow: t.glow }}>

                                {/* Top gradient line */}
                                <div className="h-[2px]" style={{ background: `linear-gradient(90deg,transparent 0%,${t.accent} 50%,transparent 100%)` }} />

                                {/* Scan-line texture */}
                                <div className="absolute inset-0 pointer-events-none opacity-30"
                                    style={{ backgroundImage: `repeating-linear-gradient(0deg,${t.scanLine} 0px,transparent 1px,transparent 3px)` }} />

                                <div className="relative p-7 md:p-10">
                                    {/* Question meta row */}
                                    <div className="flex items-center justify-between mb-7">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
                                                style={{ background: t.accentDim, borderColor: t.accentBorder }}>
                                                <Target size={11} style={{ color: t.accent }} />
                                                <span className="text-[9px] font-black uppercase tracking-[0.25em]"
                                                    style={{ color: t.accent }}>
                                                    Pregunta {String(current + 1).padStart(2,'0')} / {questions.length}
                                                </span>
                                            </div>
                                            {q.subject && (
                                                <span className="hidden sm:flex px-2.5 py-1 rounded-lg text-[9px] font-mono text-slate-500 border border-white/[0.07] bg-white/[0.03]">
                                                    {q.subject}
                                                </span>
                                            )}
                                        </div>

                                        <button onClick={toggleMark}
                                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                isMarked
                                                    ? 'bg-amber-500/15 border-amber-500/35 text-amber-400'
                                                    : 'bg-white/[0.03] border-white/[0.08] text-slate-600 hover:text-slate-300 hover:border-white/20'
                                            }`}>
                                            <Flag size={11} className={isMarked ? 'fill-current' : ''} />
                                            <span className="hidden sm:inline">{isMarked ? 'Marcada' : 'Marcar'}</span>
                                        </button>
                                    </div>

                                    {/* Question text */}
                                    <h2 className="text-2xl md:text-3xl lg:text-[2rem] font-black text-white leading-snug tracking-tight">
                                        {q.text}
                                    </h2>
                                </div>
                            </div>

                            {/* ── ANSWER OPTIONS ─────────────────────────────── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {OPTIONS.map((opt, idx) => {
                                    const isSelected = selected === opt
                                    const optText = q[`option_${opt}`]
                                    if (!optText) return null
                                    return (
                                        <button key={opt} onClick={() => handleSelect(opt)}
                                            className="group relative rounded-2xl border text-left transition-all duration-200 active:scale-[0.985] overflow-hidden"
                                            style={{
                                                borderColor: isSelected ? t.optionSel.border : 'rgba(255,255,255,0.07)',
                                                background:  isSelected ? t.optionSel.bg     : 'rgba(12,12,12,0.8)',
                                                boxShadow:   isSelected ? `0 0 20px ${t.optionSel.border}` : 'none',
                                            }}
                                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}>

                                            {/* Left accent bar on select */}
                                            {isSelected && (
                                                <div className="absolute left-0 top-0 bottom-0 w-[3px]"
                                                    style={{ background: t.accent }} />
                                            )}

                                            <div className="flex items-center gap-4 p-5">
                                                {/* Letter badge */}
                                                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-200"
                                                    style={isSelected
                                                        ? { background: t.optionSel.letter.bg, color: t.optionSel.letter.text }
                                                        : { background: 'rgba(255,255,255,0.05)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }
                                                    }>
                                                    {opt.toUpperCase()}
                                                </div>

                                                {/* Option text */}
                                                <span className={`flex-1 text-sm font-medium leading-relaxed transition-colors duration-150 ${
                                                    isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                                                }`}>
                                                    {optText}
                                                </span>

                                                {/* Check icon on selected */}
                                                {isSelected ? (
                                                    <CheckCircle2 size={18} className="flex-shrink-0" style={{ color: t.accent }} />
                                                ) : (
                                                    <Circle size={18} className="flex-shrink-0 text-white/[0.08] group-hover:text-white/20 transition-colors" />
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* ── NAVIGATION BAR ─────────────────────────────────────── */}
                    <div className="flex items-center gap-3 mt-2">
                        {/* Previous */}
                        <button onClick={() => goTo(current - 1)} disabled={current === 0}
                            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400 text-[11px] font-black uppercase tracking-widest hover:bg-white/[0.07] hover:border-white/20 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                            <ChevronLeft size={15} /> Anterior
                        </button>

                        {/* Progress pill (center) */}
                        <div className="flex-1 flex items-center justify-center">
                            <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                                <div className="w-20 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background: t.progressBar }} />
                                </div>
                                <span className="text-[9px] font-mono text-slate-600 tabular-nums">{answeredCount}/{questions.length}</span>
                            </div>
                        </div>

                        {/* Next / Finish */}
                        {current < questions.length - 1 ? (
                            <button onClick={() => goTo(current + 1)}
                                className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] ${t.btnNext}`}>
                                Siguiente <ChevronRight size={15} />
                            </button>
                        ) : (
                            <button onClick={() => setConfirmFinish(true)}
                                className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] ${t.btnFinish}`}>
                                <Trophy size={14} /> Corregir Test
                            </button>
                        )}
                    </div>

                    {/* Keyboard hint */}
                    <p className="text-center text-[9px] font-mono text-slate-700 uppercase tracking-widest">
                        1–4 elegir · ← → navegar · Enter confirmar
                    </p>
                </main>
            </div>

            {/* ══ CONFIRM QUIT MODAL ═════════════════════════════════════════ */}
            <AnimatePresence>
                {confirmQuit && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ background:'rgba(0,0,0,0.88)', backdropFilter:'blur(8px)' }}
                        onClick={() => setConfirmQuit(false)}>
                        <motion.div initial={{ scale:0.93, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.93, opacity:0 }}
                            transition={{ type:'spring', stiffness:400, damping:30 }}
                            className="w-full max-w-sm rounded-3xl border p-8 relative"
                            style={{ background:'#0e0e0e', borderColor:'rgba(239,68,68,0.35)', boxShadow:'0 0 40px rgba(239,68,68,0.15)' }}
                            onClick={e => e.stopPropagation()}>
                            <div className="h-[2px] absolute top-0 left-0 right-0 rounded-t-3xl"
                                style={{ background:'linear-gradient(90deg,transparent,#ef4444,transparent)' }} />
                            <button onClick={() => setConfirmQuit(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 text-slate-500 hover:text-white hover:border-white/25 transition-all">
                                <X size={14} />
                            </button>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 mx-auto bg-red-500/10 border border-red-500/25">
                                <LogOut size={26} className="text-red-400" />
                            </div>
                            <h3 className="text-xl font-black text-white text-center mb-2">¿Abandonar el test?</h3>
                            <p className="text-sm text-slate-500 text-center mb-6">
                                Has respondido <span className="text-white font-bold">{answeredCount}</span> de <span className="text-white font-bold">{questions.length}</span> preguntas.
                                <br /><span className="text-red-400/80">El progreso se perderá.</span>
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmQuit(false)}
                                    className="flex-1 py-3 rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 text-[11px] font-black uppercase tracking-widest hover:bg-white/[0.08] transition-all">
                                    Continuar
                                </button>
                                <button onClick={onQuit || (() => navigate('/tests'))}
                                    className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-widest transition-all">
                                    Salir
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══ CONFIRM FINISH MODAL ════════════════════════════════════════ */}
            <AnimatePresence>
                {confirmFinish && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)' }}
                        onClick={() => setConfirmFinish(false)}>
                        <motion.div initial={{ scale:0.93, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.93, opacity:0 }}
                            transition={{ type:'spring', stiffness:400, damping:30 }}
                            className="w-full max-w-sm rounded-3xl border p-8 relative"
                            style={{ background:'#0e0e0e', borderColor: t.accentBorder, boxShadow: t.glow }}
                            onClick={e => e.stopPropagation()}>

                            <div className="h-[2px] absolute top-0 left-0 right-0 rounded-t-3xl"
                                style={{ background:`linear-gradient(90deg,transparent,${t.accent},transparent)` }} />

                            <button onClick={() => setConfirmFinish(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 text-slate-500 hover:text-white hover:border-white/25 transition-all">
                                <X size={14} />
                            </button>

                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 mx-auto"
                                style={{ background: t.accentDim, border:`1.5px solid ${t.accentBorder}` }}>
                                <Trophy size={26} style={{ color: t.accent }} />
                            </div>

                            <h3 className="text-xl font-black text-white text-center mb-2">¿Finalizar el test?</h3>
                            <p className="text-sm text-slate-500 text-center mb-1">
                                Has respondido <span className="text-white font-bold">{answeredCount}</span> de <span className="text-white font-bold">{questions.length}</span> preguntas.
                            </p>
                            {unanswered > 0 && (
                                <div className="flex items-center gap-2 justify-center mt-3 mb-4 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25">
                                    <AlertTriangle size={13} className="text-amber-400" />
                                    <p className="text-[11px] font-mono text-amber-400">{unanswered} preguntas sin responder</p>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setConfirmFinish(false)}
                                    className="flex-1 py-3 rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 text-[11px] font-black uppercase tracking-widest hover:bg-white/[0.08] transition-all">
                                    Continuar
                                </button>
                                <button onClick={handleFinish}
                                    className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] ${t.btnFinish}`}>
                                    Finalizar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
