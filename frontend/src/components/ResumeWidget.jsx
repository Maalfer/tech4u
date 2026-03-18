/**
 * ResumeWidget — "Continuar donde lo dejaste"
 * Shows the 3 most recent activities (lab, test, course) on the Dashboard.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Terminal, FlaskConical, Play, ArrowRight, Loader2 } from 'lucide-react'
import api from '../services/api'

const ICON_MAP = {
    terminal: { Icon: Terminal, color: 'text-lime-400', bg: 'bg-lime-400/10', border: 'border-lime-400/20', glow: 'hover:shadow-[0_0_20px_rgba(163,230,53,0.15)]' },
    flask:    { Icon: FlaskConical, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', glow: 'hover:shadow-[0_0_20px_rgba(96,165,250,0.15)]' },
    video:    { Icon: Play, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', glow: 'hover:shadow-[0_0_20px_rgba(192,132,252,0.15)]' },
}

function timeAgo(isoStr) {
    if (!isoStr) return ''
    const diff = (Date.now() - new Date(isoStr + 'Z').getTime()) / 1000
    if (diff < 3600)  return `hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
    const d = Math.floor(diff / 86400)
    return `hace ${d} día${d > 1 ? 's' : ''}`
}

export default function ResumeWidget() {
    const navigate = useNavigate()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/dashboard/resume')
            .then(r => setItems(r.data.items || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
            </div>
        )
    }

    if (items.length === 0) return null

    return (
        <div className="mb-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-lime-400 rounded-full" />
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Continuar donde lo dejaste
                </h3>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {items.map((item, idx) => {
                    const meta = ICON_MAP[item.icon] || ICON_MAP.flask
                    const { Icon, color, bg, border, glow } = meta
                    return (
                        <button
                            key={idx}
                            onClick={() => navigate(item.url)}
                            className={`group relative flex flex-col gap-3 p-4 rounded-2xl bg-white/3 border ${border} ${glow} hover:bg-white/5 transition-all duration-200 text-left overflow-hidden`}
                        >
                            {/* Top accent line */}
                            <div className={`absolute inset-x-0 top-0 h-px ${
                                item.accent === 'lime'   ? 'bg-gradient-to-r from-transparent via-lime-400/50 to-transparent' :
                                item.accent === 'blue'   ? 'bg-gradient-to-r from-transparent via-blue-400/50 to-transparent' :
                                                          'bg-gradient-to-r from-transparent via-purple-400/50 to-transparent'
                            }`} />

                            {/* Icon + time */}
                            <div className="flex items-center justify-between">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                                    <Icon className={`w-4 h-4 ${color}`} />
                                </div>
                                {item.last_at && (
                                    <span className="text-[10px] font-mono text-slate-600">
                                        {timeAgo(item.last_at)}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-mono font-bold text-white leading-tight truncate group-hover:${color.replace('text-', 'text-')} transition-colors`}>
                                    {item.title}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                    {item.subtitle}
                                </p>
                            </div>

                            {/* CTA */}
                            <div className={`flex items-center gap-1 text-[11px] font-mono font-bold ${color} mt-auto`}>
                                <span>{item.action}</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
