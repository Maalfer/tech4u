import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Terminal, BookOpen, Database, Play, FileText, Zap, ArrowRight, Loader2 } from 'lucide-react'
import api from '../services/api'

// ── Icon map by type ─────────────────────────────────────────────────────────
const TYPE_ICON = {
    lab: Terminal,
    teoria: BookOpen,
    skillpath: Zap,
    sql: Database,
    course: Play,
    resource: FileText,
}

const TYPE_LABEL = {
    lab: 'Lab',
    teoria: 'Teoría',
    skillpath: 'Skill Path',
    sql: 'SQL',
    course: 'Curso',
    resource: 'Recurso',
}

const BADGE_COLORS = {
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    lime: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

// ── Quick navigation shortcuts ───────────────────────────────────────────────
const SHORTCUTS = [
    { icon: Terminal, label: 'Labs de Terminal', url: '/labs', color: 'text-lime-400' },
    { icon: BookOpen, label: 'Teoría', url: '/teoria', color: 'text-blue-400' },
    { icon: Database, label: 'SQL Skills', url: '/sql-skills', color: 'text-orange-400' },
    { icon: Zap, label: 'Skill Labs', url: '/skill-labs', color: 'text-purple-400' },
    { icon: Play, label: 'Certificaciones', url: '/ciberseguridad', color: 'text-red-400' },
    { icon: FileText, label: 'Recursos', url: '/resources', color: 'text-slate-400' },
]

export default function SearchModal({ isOpen, onClose }) {
    const navigate = useNavigate()
    const inputRef = useRef(null)
    const listRef = useRef(null)
    const debounceRef = useRef(null)

    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedIdx, setSelectedIdx] = useState(0)
    const [error, setError] = useState(null)

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setResults([])
            setSelectedIdx(0)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen])

    // Search with debounce
    useEffect(() => {
        if (!query.trim() || query.trim().length < 2) {
            setResults([])
            setLoading(false)
            return
        }

        clearTimeout(debounceRef.current)
        setLoading(true)
        setError(null)

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await api.get('/search', { params: { q: query.trim() } })
                setResults(res.data.results || [])
                setSelectedIdx(0)
            } catch (e) {
                setError('Error al buscar. Intenta de nuevo.')
                setResults([])
            } finally {
                setLoading(false)
            }
        }, 280)

        return () => clearTimeout(debounceRef.current)
    }, [query])

    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        const items = query.trim().length >= 2 ? results : SHORTCUTS

        if (e.key === 'Escape') {
            onClose()
            return
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIdx(i => Math.min(i + 1, items.length - 1))
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIdx(i => Math.max(i - 1, 0))
        }
        if (e.key === 'Enter') {
            e.preventDefault()
            if (query.trim().length >= 2 && results[selectedIdx]) {
                handleNavigate(results[selectedIdx].url)
            } else if (query.trim().length < 2 && SHORTCUTS[selectedIdx]) {
                handleNavigate(SHORTCUTS[selectedIdx].url)
            }
        }
    }, [results, selectedIdx, query, onClose])

    const handleNavigate = (url) => {
        navigate(url)
        onClose()
    }

    // Scroll selected into view
    useEffect(() => {
        const el = listRef.current?.children[selectedIdx]
        el?.scrollIntoView({ block: 'nearest' })
    }, [selectedIdx])

    if (!isOpen) return null

    const showShortcuts = query.trim().length < 2
    const showEmpty = !showShortcuts && !loading && results.length === 0

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4 pointer-events-none">
                <div
                    className="w-full max-w-2xl pointer-events-auto"
                    style={{ animation: 'searchSlideIn 0.18s ease-out' }}
                >
                    {/* Search box */}
                    <div className="relative bg-[#111] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
                        {/* Glow accent */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/60 to-transparent" />

                        {/* Input row */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                            <div className="flex-shrink-0">
                                {loading
                                    ? <Loader2 className="w-5 h-5 text-lime-400 animate-spin" />
                                    : <Search className="w-5 h-5 text-slate-500" />
                                }
                            </div>
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Buscar labs, teoría, SQL, cursos..."
                                className="flex-1 bg-transparent text-white placeholder-slate-500 text-base font-mono outline-none"
                                autoComplete="off"
                                spellCheck={false}
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            )}
                            <kbd className="flex-shrink-0 hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-slate-500">
                                ESC
                            </kbd>
                        </div>

                        {/* Results / Shortcuts */}
                        <div className="max-h-[420px] overflow-y-auto">
                            {/* Shortcuts panel */}
                            {showShortcuts && (
                                <div className="p-3">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 px-2 pb-2">
                                        Acceso rápido
                                    </p>
                                    <div ref={listRef} className="grid grid-cols-2 gap-1">
                                        {SHORTCUTS.map((s, idx) => {
                                            const Icon = s.icon
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleNavigate(s.url)}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group ${
                                                        selectedIdx === idx
                                                            ? 'bg-lime-400/10 border border-lime-400/30'
                                                            : 'hover:bg-white/5 border border-transparent'
                                                    }`}
                                                >
                                                    <Icon className={`w-4 h-4 flex-shrink-0 ${s.color}`} />
                                                    <span className="text-sm font-mono text-slate-300 truncate">{s.label}</span>
                                                    <ArrowRight className={`w-3 h-3 text-slate-600 ml-auto flex-shrink-0 transition-opacity ${selectedIdx === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Search results */}
                            {!showShortcuts && !loading && results.length > 0 && (
                                <div className="p-2" ref={listRef}>
                                    {results.map((item, idx) => {
                                        const Icon = TYPE_ICON[item.type] || Search
                                        const badgeClass = BADGE_COLORS[item.badge_color] || BADGE_COLORS.slate
                                        const isSelected = selectedIdx === idx
                                        return (
                                            <button
                                                key={`${item.type}-${item.id}`}
                                                onClick={() => handleNavigate(item.url)}
                                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-left group ${
                                                    isSelected
                                                        ? 'bg-lime-400/10 border border-lime-400/20'
                                                        : 'hover:bg-white/5 border border-transparent'
                                                }`}
                                            >
                                                {/* Type icon */}
                                                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                                                    isSelected ? 'bg-lime-400/20' : 'bg-white/5'
                                                }`}>
                                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-lime-400' : 'text-slate-400'}`} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-mono font-semibold text-white truncate">
                                                            {item.title}
                                                        </span>
                                                        <span className={`flex-shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeClass}`}>
                                                            {item.badge}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[11px] font-mono text-slate-500">{item.subtitle}</span>
                                                        {item.description && (
                                                            <>
                                                                <span className="text-slate-700">·</span>
                                                                <span className="text-[11px] text-slate-600 truncate">{item.description}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Arrow */}
                                                <ArrowRight className={`flex-shrink-0 w-4 h-4 transition-all ${isSelected ? 'text-lime-400 translate-x-0.5' : 'text-slate-700 group-hover:text-slate-500'}`} />
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Empty state */}
                            {showEmpty && (
                                <div className="py-10 px-6 text-center">
                                    <Search className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                    <p className="text-sm font-mono text-slate-500">
                                        Sin resultados para <span className="text-white">"{query}"</span>
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Prueba con otras palabras clave
                                    </p>
                                </div>
                            )}

                            {/* Error state */}
                            {error && (
                                <div className="py-8 px-6 text-center">
                                    <p className="text-xs font-mono text-red-400">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer hint */}
                        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
                                <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px]">↑↓</kbd>
                                navegar
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
                                <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px]">↵</kbd>
                                abrir
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
                                <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px]">ESC</kbd>
                                cerrar
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes searchSlideIn {
                    from { opacity: 0; transform: translateY(-12px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0)        scale(1); }
                }
            `}</style>
        </>
    )
}
