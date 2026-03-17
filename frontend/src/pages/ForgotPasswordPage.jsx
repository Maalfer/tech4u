import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import api from '../services/api'
import { useSEO } from '../hooks/useSEO'
import logoImg from '../assets/tech4u_logo.png'

export default function ForgotPasswordPage() {
    useSEO({ title: 'Recuperar contraseña', path: '/forgot-password' })
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await api.post('/auth/forgot-password', { email })
            setSent(true)
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al enviar el email. Inténtalo de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    const inputClass =
        'w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-slate-200 font-mono placeholder-slate-700 focus:outline-none focus:border-neon focus:bg-black/60 transition-all duration-300'

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-[0.1]"
                    style={{ backgroundImage: 'radial-gradient(var(--color-neon) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="absolute top-[-10%] left-[20%] w-96 h-96 bg-neon/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[10%] w-96 h-96 bg-blue-500/5 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 justify-center mb-8">
                    <img src={logoImg} alt="Tech4U Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_12px_var(--neon-alpha-60)]" />
                    <span className="text-2xl font-black text-neon font-mono">Tech4U</span>
                </Link>

                <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-neon/20 to-blue-500/20 rounded-3xl blur opacity-75 transition duration-1000"></div>
                    <div className="relative glass rounded-3xl p-8 border-white/5 shadow-2xl backdrop-blur-3xl">

                        {sent ? (
                            /* ── Success state ─────────────────────── */
                            <div className="text-center py-4">
                                <div className="w-20 h-20 bg-neon/10 border border-neon/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(198,255,51,0.15)]">
                                    <CheckCircle className="w-10 h-10 text-neon" />
                                </div>
                                <h1 className="text-2xl font-black uppercase text-white mb-3 tracking-tight">
                                    ¡Email enviado!
                                </h1>
                                <p className="text-slate-400 text-sm leading-relaxed mb-2">
                                    Si <strong className="text-white">{email}</strong> existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                                </p>
                                <p className="text-slate-600 text-xs font-mono mb-8">
                                    Revisa también la carpeta de spam.
                                </p>
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center gap-2 w-full py-4 bg-neon text-black rounded-2xl text-sm font-black uppercase tracking-wider shadow-[0_0_20px_rgba(198,255,51,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Volver a iniciar sesión
                                </Link>
                            </div>
                        ) : (
                            /* ── Form state ────────────────────────── */
                            <>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-neon/10 border border-neon/20 rounded-2xl flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-neon" />
                                    </div>
                                    <h1 className="text-xl font-black uppercase text-white tracking-tight">
                                        Recuperar contraseña
                                    </h1>
                                </div>
                                <p className="text-slate-500 text-xs font-mono mb-8 pl-1">
                                    Introduce tu email y te enviaremos un enlace de recuperación.
                                </p>

                                {error && (
                                    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
                                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                        <span className="text-red-400 text-xs font-mono">{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                            <input
                                                type="email"
                                                className={`${inputClass} pl-11`}
                                                placeholder="tu@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-neon text-black rounded-2xl text-sm font-black uppercase tracking-wider shadow-[0_0_20px_rgba(198,255,51,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                                    >
                                        {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                                    </button>

                                    <Link
                                        to="/login"
                                        className="flex items-center justify-center gap-2 text-slate-500 hover:text-neon text-xs font-mono uppercase tracking-wider transition-colors"
                                    >
                                        <ArrowLeft className="w-3 h-3" /> Volver al login
                                    </Link>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
