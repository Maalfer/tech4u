import { useEffect, useState } from 'react'
import { FileText, ExternalLink, Lock, AlertCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const TYPE_ICON = {
    pdf: '📄',
    cheatsheet: '⚡',
}

export default function Resources() {
    const { user } = useAuth()
    const [resources, setResources] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const hasSub = user?.subscription_type !== 'free'

    useEffect(() => {
        // Try to get all resources if subscribed, otherwise get free ones
        const endpoint = hasSub ? '/resources/' : '/resources/free'
        api.get(endpoint)
            .then(r => setResources(r.data))
            .catch(() => setError('Error cargando recursos. Verifica tu conexión.'))
            .finally(() => setLoading(false))
    }, [hasSub])

    const subjects = [...new Set(resources.map(r => r.subject))]

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-5 h-5 text-[#39FF14]" />
                        <h1 className="text-2xl font-black text-white">Recursos</h1>
                    </div>
                    <p className="text-slate-500 font-mono text-sm">Cheat Sheets y PDFs de referencia profesional</p>
                </div>

                {/* Subscription banner */}
                {!hasSub && (
                    <div className="glass rounded-xl p-5 mb-8 border border-orange-500/30 flex items-start gap-3">
                        <Lock className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-black text-orange-400 mb-0.5">Acceso limitado</p>
                            <p className="text-xs text-slate-500 font-mono">Con una suscripción de pago accedes a todos los Cheat Sheets y PDFs premium.</p>
                        </div>
                        <a href="/#pricing" className="text-xs btn-neon whitespace-nowrap py-1.5">Ver planes →</a>
                    </div>
                )}

                {loading ? (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 rounded-2xl bg-[rgba(57,255,20,0.03)] animate-pulse border border-[rgba(57,255,20,0.08)]" />)}
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                ) : (
                    subjects.map(sub => (
                        <section key={sub} className="mb-8">
                            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="flex-shrink-0">//</span> {sub}
                            </h2>
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {resources.filter(r => r.subject === sub).map(r => (
                                    <div key={r.id} className={`glass glass-hover rounded-xl p-5 neon-border flex flex-col gap-3 ${r.requires_subscription && !hasSub ? 'opacity-50' : ''}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <span className="text-xl mr-2">{TYPE_ICON[r.file_type] || '📁'}</span>
                                                <span className="text-xs font-mono text-slate-500 uppercase">{r.file_type}</span>
                                            </div>
                                            {r.requires_subscription && !hasSub && <Lock className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-white mb-1">{r.title}</h3>
                                            {r.description && <p className="text-xs text-slate-500 leading-relaxed">{r.description}</p>}
                                        </div>
                                        <a
                                            href={r.url || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`mt-auto flex items-center justify-center gap-1.5 text-xs font-mono py-2 rounded-lg border transition-all duration-200 ${r.requires_subscription && !hasSub
                                                    ? 'text-slate-600 border-slate-800 cursor-not-allowed'
                                                    : 'btn-neon text-[#39FF14]'
                                                }`}
                                            onClick={r.requires_subscription && !hasSub ? (e) => e.preventDefault() : undefined}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            {r.requires_subscription && !hasSub ? 'Requiere suscripción' : 'Ver recurso'}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))
                )}

                {!loading && resources.length === 0 && !error && (
                    <p className="text-slate-600 font-mono text-sm">No hay recursos disponibles por el momento.</p>
                )}
            </main>
        </div>
    )
}
