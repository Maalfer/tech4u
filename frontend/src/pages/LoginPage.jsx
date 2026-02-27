import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const [params] = useSearchParams()
    const defaultTab = params.get('tab') === 'register' ? 'register' : 'login'
    const defaultPlan = params.get('plan') || 'free'

    const [tab, setTab] = useState(defaultTab)
    const [showPass, setShowPass] = useState(false)
    const [error, setError] = useState(null)
    const [form, setForm] = useState({ nombre: '', email: '', password: '', plan: defaultPlan })

    const { login, register, loading } = useAuth()
    const navigate = useNavigate()

    const handle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        try {
            if (tab === 'login') {
                await login(form.email, form.password)
            } else {
                await register(form.nombre, form.email, form.password, form.plan)
            }
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.detail || 'Ha ocurrido un error. Inténtalo de nuevo.')
        }
    }

    const inputClass = "w-full bg-[#1A1A1A] border border-[rgba(57,255,20,0.2)] rounded-lg px-4 py-3 text-sm text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-[#39FF14] focus:shadow-[0_0_0_2px_rgba(57,255,20,0.1)] transition-all duration-200"

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
            {/* BG glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.06)_0%,transparent_70%)]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 justify-center mb-8">
                    <div className="p-2 rounded-lg bg-[rgba(57,255,20,0.1)] neon-border">
                        <Shield className="w-6 h-6 text-[#39FF14]" />
                    </div>
                    <span className="text-2xl font-black text-[#39FF14] glow-text font-mono">Tech4U</span>
                </Link>

                {/* Card */}
                <div className="glass rounded-2xl p-8">
                    {/* Tabs */}
                    <div className="flex p-1 bg-[#0D0D0D] rounded-xl mb-6">
                        {[['login', 'Iniciar sesión'], ['register', 'Crear cuenta']].map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => { setTab(val); setError(null) }}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-mono transition-all duration-200 ${tab === val ? 'bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[rgba(57,255,20,0.3)]' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {tab === 'register' && (
                            <div>
                                <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Nombre</label>
                                <input className={inputClass} placeholder="Tu nombre" value={form.nombre} onChange={handle('nombre')} required />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
                            <input className={inputClass} type="email" placeholder="you@example.com" value={form.email} onChange={handle('email')} required />
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Contraseña</label>
                            <div className="relative">
                                <input className={inputClass} type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handle('password')} required minLength={6} />
                                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#39FF14] transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {tab === 'register' && (
                            <div>
                                <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Plan</label>
                                <select
                                    className={inputClass + ' cursor-pointer'}
                                    value={form.plan}
                                    onChange={handle('plan')}
                                >
                                    <option value="free">Gratuito</option>
                                    <option value="monthly">Mensual — 9.99€/mes</option>
                                    <option value="quarterly">Trimestral — 24.99€/trimestre</option>
                                    <option value="annual">Anual — 79.99€/año</option>
                                </select>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-start gap-2 text-sm text-red-400 bg-[rgba(255,50,50,0.08)] border border-[rgba(255,50,50,0.2)] rounded-lg p-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-neon-solid py-3 mt-2 flex items-center justify-center gap-2">
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                tab === 'login' ? 'Acceder →' : 'Crear cuenta →'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-slate-600 mt-6 font-mono">
                    Volver a{' '}
                    <Link to="/" className="text-[#39FF14] hover:underline">Tech4U.es</Link>
                </p>
            </div>
        </div>
    )
}
