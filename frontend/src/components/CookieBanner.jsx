/**
 * CookieBanner — GDPR / LSSI Cookie Consent
 * Stores choice in localStorage under 'cookie_consent':
 *   'all'       — analytics + functional cookies accepted
 *   'essential' — only strictly necessary cookies
 *
 * Usage: <CookieBanner /> in App.jsx (outside routes)
 */
import { useState, useEffect } from 'react'
import { Cookie, X, Shield, BarChart2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'cookie_consent'

export default function CookieBanner() {
    const [visible, setVisible] = useState(false)
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) {
            // Small delay to avoid flash on first render
            const t = setTimeout(() => setVisible(true), 800)
            return () => clearTimeout(t)
        }
    }, [])

    const accept = (type) => {
        localStorage.setItem(STORAGE_KEY, type)
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-500"
            role="dialog"
            aria-label="Aviso de cookies"
        >
            <div className="max-w-4xl mx-auto glass border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 pt-5 pb-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-neon/10 border border-neon/20 rounded-2xl flex items-center justify-center">
                            <Cookie className="w-4 h-4 text-neon" />
                        </div>
                        <span className="text-sm font-black text-white uppercase tracking-tight">
                            Configuración de Cookies
                        </span>
                    </div>
                    <button
                        onClick={() => accept('essential')}
                        className="p-2 text-slate-600 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                        aria-label="Cerrar y aceptar solo esenciales"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-6 py-4">
                    <p className="text-slate-400 text-xs leading-relaxed mb-1">
                        Usamos cookies propias y de terceros para mejorar tu experiencia, medir el rendimiento de la plataforma
                        y personalizar el contenido. Al continuar navegando aceptas nuestra{' '}
                        <Link to="/cookies" className="text-neon hover:underline" onClick={() => accept('all')}>
                            Política de Cookies
                        </Link>
                        .
                    </p>

                    {/* Expandable details */}
                    {expanded && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-300">
                            <div className="flex gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <div className="w-8 h-8 bg-neon/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-4 h-4 text-neon" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase mb-0.5">Esenciales</p>
                                    <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                                        Sesión de usuario, preferencias de tema. Siempre activas.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <BarChart2 className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase mb-0.5">Analíticas</p>
                                    <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                                        Estadísticas de uso anónimas para mejorar la plataforma.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setExpanded(v => !v)}
                        className="text-[10px] font-mono text-slate-600 hover:text-neon transition-colors mt-2 uppercase tracking-wider"
                    >
                        {expanded ? '▲ Ocultar detalles' : '▼ Ver detalle de cookies'}
                    </button>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 px-6 pb-5">
                    <button
                        onClick={() => accept('essential')}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white hover:border-white/20 transition-all"
                    >
                        Solo esenciales
                    </button>
                    <button
                        onClick={() => accept('all')}
                        className="flex-1 py-3 bg-neon text-black rounded-2xl text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(198,255,51,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Aceptar todas
                    </button>
                </div>
            </div>
        </div>
    )
}

/** Helper — check user's consent choice */
export function getCookieConsent() {
    return localStorage.getItem(STORAGE_KEY) // 'all' | 'essential' | null
}
