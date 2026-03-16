/**
 * AnnouncementPopup.jsx
 * Shows a slide-in popup with unread admin announcements to students.
 * Fetches /announcements/unread on mount, marks each as read when dismissed.
 */
import { useState, useEffect } from 'react'
import { Megaphone, X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../services/api'

export default function AnnouncementPopup() {
    const [announcements, setAnnouncements] = useState([])
    const [current, setCurrent] = useState(0)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        api.get('/announcements/unread')
            .then(r => {
                if (r.data.length > 0) {
                    setAnnouncements(r.data)
                    setVisible(true)
                }
            })
            .catch(() => { })
    }, [])

    const markRead = async (id) => {
        try { await api.post(`/announcements/mark-read/${id}`) } catch { }
    }

    const dismiss = async () => {
        // Mark all as read
        await Promise.all(announcements.map(a => markRead(a.id)))
        setVisible(false)
    }

    const dismissCurrent = async () => {
        const ann = announcements[current]
        if (ann) await markRead(ann.id)
        if (announcements.length === 1) {
            setVisible(false)
        } else {
            setAnnouncements(prev => prev.filter((_, i) => i !== current))
            setCurrent(prev => Math.min(prev, announcements.length - 2))  // -2 porque ya se filtró el actual
        }
    }

    if (!visible || announcements.length === 0) return null

    const ann = announcements[current]

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md glass rounded-3xl border border-neon/30 shadow-[0_0_60px_var(--neon-alpha-15)] animate-in slide-in-from-bottom-6 duration-400">

                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-neon via-cyan-400 to-neon rounded-t-3xl" />

                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0">
                                <Megaphone className="w-5 h-5 text-neon" />
                            </div>
                            <div>
                                <p className="text-[9px] font-mono text-neon uppercase tracking-[0.3em]">Noticia de Tech4U</p>
                                <p className="text-[10px] font-mono text-slate-500">
                                    {new Date(ann.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
                                </p>
                            </div>
                        </div>
                        {announcements.length > 1 && (
                            <span className="text-[10px] font-mono text-slate-500">
                                {current + 1} / {announcements.length}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <p className="text-white font-mono text-sm leading-relaxed mb-8">
                        {ann.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {announcements.length > 1 ? (
                            <>
                                <button
                                    onClick={() => setCurrent(p => Math.max(0, p - 1))}
                                    disabled={current === 0}
                                    className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={dismissCurrent}
                                    className="flex-1 py-3 bg-neon text-black font-black text-xs uppercase rounded-xl hover:shadow-[0_0_20px_var(--neon-alpha-40)] transition-all"
                                >
                                    Entendido ✓
                                </button>
                                <button
                                    onClick={() => setCurrent(p => Math.min(announcements.length - 1, p + 1))}
                                    disabled={current === announcements.length - 1}
                                    className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={dismiss}
                                    className="flex-1 py-3 bg-neon text-black font-black text-xs uppercase rounded-xl hover:shadow-[0_0_20px_var(--neon-alpha-40)] transition-all"
                                >
                                    ¡Entendido! 🚀
                                </button>
                                <button
                                    onClick={dismiss}
                                    className="p-3 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>

                    {announcements.length > 1 && (
                        <button
                            onClick={dismiss}
                            className="mt-3 w-full text-center text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors"
                        >
                            Marcar todas como leídas y cerrar
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
