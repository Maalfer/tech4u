import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import { useSEO } from '../hooks/useSEO'
import logoImg from '../assets/tech4u_logo.png'

export default function ResetPasswordPage() {
    useSEO({ title: 'Nueva contraseña', path: '/reset-password' })
    const [params] = useSearchParams()
    const token = params.get('token') || ''
    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState(null)

    const strength = (() => {
        if (!password) return 0
        let s = 0
        if (password.length >= 8) s++
        if (/[A-Z]/.test(password)) s++
        if (/[0-9]/.test(password)) s++
        if (/[^A-Za-z0-9]/.test(password)) s++
        return s
    })()

    const strengthLabel = ['', 'Débil', 'Media', 'Buena', 'Fuerte'][strength]
    const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-400', 'bg-neon'][strength]

    const inputClass =
        'w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-slate-200 font-mono placeholder-slate-700 focus:outline-none focus:border-neon focus:bg-black/60 transition-all duration-300'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        if (password !== confirm) {
            setError('Las contraseñas no coinciden.')
            return
        }
        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.')
            return
        }
        setLoading(true)
        try {
            await api.post('/auth/reset-password', { token, new_password: password })
            setDone(true)
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al restablecer la contraseña.')
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h1 className="text-xl font-black text-white uppercase mb-3">Enlace inválido</h1>
                    <p className="text-slate-500 text-sm mb-6">Este enlace de recuperación no es válido o ha expirado.</p>
                    <Link to="/forgot-password" className="px-6 py-3 bg-neon text-black rounded-2xl text-sm font-black uppercase">
                        Solicitar nuevo enlace
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-[0.1]"
                    style={{ backgroundImage: 'radial-gradient(var(--color-neon) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="absolute top-[-10%] left-[20%] w-96 h-96 bg-neon/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <Link to="/" className="flex items-center gap-3 justify-center mb-8">
                    <img src={logoImg} alt="Tech4U Logo" className="w-12 h-12 object-contain" />
                    <span className="text-2xl font-black text-neon font-mono">Tech4U</span>
                </Link>

                <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-neon/20 to-blue-500/20 rounded-3xl blur opacity-75"></div>
                    <div className="relative glass rounded-3xl p-8 border-white/5 shadow-2xl backdrop-blur-3xl">

                        {done ? (
                            <div className="text-center py-4">
                                <div className="w-20 h-20 bg-neon/10 border border-neon/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(198,255,51,0.15)]">
                                    <CheckCircle className="w-10 h-10 text-neon" />
                                </div>
                                <h1 className="text-2xl font-black uppercase text-white mb-3">¡Contraseña actualizada!</h1>
                                <p className="text-slate-400 text-sm mb-8">Ya puedes iniciar sesión con tu nueva contraseña.</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-4 bg-neon text-black rounded-2xl text-sm font-black uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Iniciar sesión
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-neon/10 border border-neon/20 rounded-2xl flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-neon" />
                                    </div>
                                    <h1 className="text-xl font-black uppercase text-white tracking-tight">Nueva contraseña</h1>
                                </div>
                                <p className="text-slate-500 text-xs font-mono mb-8 pl-1">Elige una contraseña segura de al menos 8 caracteres.</p>

                                {error && (
                                    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
                                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                        <span className="text-red-400 text-xs font-mono">{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Nueva contraseña</label>
                                        <div className="relative">
                                            <input
                                                type={showPass ? 'text' : 'password'}
                                                className={`${inputClass} pr-12`}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass(v => !v)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-neon transition-colors"
                                            >
                                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {/* Strength bar */}
                                        {password && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${strengthColor} transition-all duration-300`}
                                                        style={{ width: `${strength * 25}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500">{strengthLabel}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Confirmar contraseña</label>
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            className={inputClass}
                                            placeholder="••••••••"
                                            value={confirm}
                                            onChange={(e) => setConfirm(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-neon text-black rounded-2xl text-sm font-black uppercase tracking-wider shadow-[0_0_20px_rgba(198,255,51,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                                    >
                                        {loading ? 'Actualizando...' : 'Establecer nueva contraseña'}
                                    </button>

                                    <Link to="/login" className="flex items-center justify-center gap-2 text-slate-500 hover:text-neon text-xs font-mono uppercase tracking-wider transition-colors">
                                        <ArrowLeft className="w-3 h-3" /> Cancelar
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
