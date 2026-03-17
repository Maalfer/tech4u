import { useNavigate, Link } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import { Terminal, Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFoundPage() {
    useSEO({ title: '404 — Página no encontrada', path: '/404' })
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Background dots */}
            <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(var(--color-neon) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />
            {/* Glow blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 text-center max-w-xl w-full">
                {/* Terminal window */}
                <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl mb-10">
                    {/* Terminal title bar */}
                    <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.03] border-b border-white/5">
                        <span className="w-3 h-3 rounded-full bg-red-500/80" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <span className="w-3 h-3 rounded-full bg-neon/80" />
                        <span className="ml-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                            tech4u — bash
                        </span>
                    </div>
                    {/* Terminal body */}
                    <div className="p-8 font-mono text-left">
                        <p className="text-slate-500 text-sm mb-1">
                            <span className="text-neon">alumno@tech4u</span>
                            <span className="text-slate-600">:</span>
                            <span className="text-blue-400">~</span>
                            <span className="text-slate-500">$</span>{' '}
                            <span className="text-white">navigate {window.location.pathname}</span>
                        </p>
                        <p className="text-red-400 text-sm mb-1">
                            bash: {window.location.pathname}: Ruta no encontrada
                        </p>
                        <p className="text-slate-500 text-sm mb-4">
                            Error 404: El recurso solicitado no existe en este servidor.
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-neon">alumno@tech4u</span>
                            <span className="text-slate-600">:</span>
                            <span className="text-blue-400">~</span>
                            <span className="text-slate-500">$</span>
                            <span className="w-2 h-4 bg-neon animate-pulse ml-1" />
                        </div>
                    </div>
                </div>

                {/* 404 text */}
                <div className="mb-4 select-none">
                    <span className="text-[7rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-neon/80 to-neon/20">
                        404
                    </span>
                </div>

                <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                    Página no encontrada
                </h1>
                <p className="text-slate-500 text-sm font-mono mb-10 max-w-sm mx-auto">
                    La URL que buscas no existe o ha sido movida. Puede que hayas escrito mal la dirección.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-black uppercase tracking-wider text-slate-400 hover:text-white hover:border-white/20 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver atrás
                    </button>
                    <Link
                        to="/dashboard"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-neon text-black rounded-2xl text-sm font-black uppercase tracking-wider shadow-[0_0_20px_rgba(198,255,51,0.3)] hover:scale-105 active:scale-95 transition-all"
                    >
                        <Home className="w-4 h-4" /> Ir al Dashboard
                    </Link>
                </div>

                {/* Quick links */}
                <div className="mt-12 flex flex-wrap justify-center gap-3">
                    {[
                        { label: 'Tests', href: '/tests' },
                        { label: 'Laboratorios', href: '/labs' },
                        { label: 'SQL Skills', href: '/sql-skills' },
                        { label: 'Teoría', href: '/teoria' },
                        { label: 'Leaderboard', href: '/leaderboard' },
                    ].map(({ label, href }) => (
                        <Link
                            key={href}
                            to={href}
                            className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-[11px] font-mono text-slate-500 hover:text-neon hover:border-neon/20 transition-all"
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
