import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertCircle, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { redirectUser } from '../utils/redirectUser'
import { trackEvent } from '../utils/analytics'
import OAuthButtons from '../components/OAuthButtons'
import logoImg from '../assets/tech4u_logo.png';

export default function LoginPage() {
    const [params] = useSearchParams()
    const defaultTab  = params.get('tab') === 'register' ? 'register' : 'login'
    const defaultPlan = params.get('plan') || 'free'
    const isDocenteFlow = params.get('type') === 'docente' || params.get('role') === 'docente'
    const redirectAfter = params.get('redirect') || null
    const oauthError = params.get('oauth_error')

    const [tab, setTab] = useState(defaultTab)
    const [showPass, setShowPass] = useState(false)
    const [error, setError] = useState(oauthError || null)
    const [isDocente, setIsDocente] = useState(isDocenteFlow)
    const [form, setForm] = useState({ nombre: '', email: '', password: '', plan: defaultPlan, referral_code: '' })

    const { login, register, loading } = useAuth()
    const navigate = useNavigate()

    const handle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        try {
            if (tab === 'login') {
                const userData = await login(form.email, form.password)
                trackEvent('login_success', null, 'auth', { method: 'email' })
                redirectUser(userData)
            } else {
                const roleString = isDocenteFlow ? 'docente' : 'alumno'
                const userData = await register(form.nombre, form.email, form.password, form.referral_code || null, 'free', roleString)
                trackEvent('user_registered', null, 'auth', { role: roleString, plan: defaultPlan })
                if (defaultPlan && defaultPlan !== 'free' && roleString !== 'docente') {
                    navigate('/suscripcion')
                } else {
                    redirectUser(userData)
                }
            }
        } catch (err) {
            console.log(err)

            const backendMsg = err.response?.data?.detail

            if (backendMsg) {
                if (backendMsg === "Credenciales incorrectas") {
                    setError("Email o contraseña incorrectos")
                } else {
                    setError(backendMsg)
                }
            } else if (err.response?.status === 429) {
                setError("Demasiados intentos. Intenta más tarde.")
            } else if (err.request) {
                setError("No se pudo conectar con el servidor")
            } else {
                setError("Error inesperado")
            }
        }
    }

    const inputClass = "w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-slate-200 font-mono placeholder-slate-700 focus:outline-none focus:border-neon focus:bg-black/60 transition-all duration-300"

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
            {/* Premium Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[#0D0D0D]"></div>
                {/* Dots grid */}
                <div className="absolute inset-0 opacity-[0.15]"
                    style={{ backgroundImage: 'radial-gradient(var(--color-neon) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                />
                {/* Blobs */}
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-neon/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full" />
                <div className="absolute top-[30%] right-[-5%] w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 justify-center mb-8">
                    <img src={logoImg} alt="Tech4U Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_12px_var(--neon-alpha-60)]" />
                    <span className="text-2xl font-black text-neon glow-text font-mono">Tech4U</span>
                </Link>

                {/* Card Premium */}
                <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-neon/20 to-blue-500/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative glass rounded-3xl p-8 border-white/5 shadow-2xl backdrop-blur-3xl">
                        {/* Tabs Premium */}
                        <div className="flex p-1.5 bg-black/40 rounded-2xl mb-8 border border-white/5">
                            {[['login', 'Iniciar sesión'], ['register', 'Crear cuenta']].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => { setTab(val); setError(null) }}
                                    className={`flex-1 py-3 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-300 ${tab === val
                                        ? 'bg-neon text-black shadow-[0_0_15px_rgba(198,255,51,0.4)]'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                        }`}
                                >
                                    {label.toUpperCase()}
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
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">Contraseña</label>
                                    {tab === 'login' && (
                                        <Link to="/forgot-password" className="text-[10px] font-mono text-slate-600 hover:text-neon transition-colors uppercase tracking-wider">
                                            ¿Olvidaste la contraseña?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <input className={inputClass} type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handle('password')} required minLength={6} />
                                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-neon transition-colors">
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            {tab === 'register' && (
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Código de Invitación (Opcional)</label>
                                    <input className={inputClass} placeholder="EJ: TECH4U123" value={form.referral_code} onChange={handle('referral_code')} />
                                </div>
                            )}

                            {/* Docente toggle */}
                            {tab === 'register' && (
                                <button
                                    type="button"
                                    onClick={() => setIsDocente(d => !d)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                                        isDocente
                                            ? 'bg-violet-500/15 border-violet-500/50 text-violet-300'
                                            : 'bg-white/3 border-white/10 text-slate-500 hover:border-white/20'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDocente ? 'bg-violet-500/20' : 'bg-white/5'}`}>
                                        <GraduationCap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono font-bold uppercase tracking-wider">
                                            Soy docente / centro educativo
                                        </p>
                                        <p className="text-[10px] font-mono opacity-70 mt-0.5">
                                            {isDocente ? 'Te llevaremos a elegir tu pack de licencias' : 'Activa esto si vas a gestionar alumnos'}
                                        </p>
                                    </div>
                                    <div className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 ${isDocente ? 'bg-violet-500 border-violet-500' : 'border-slate-600'}`} />
                                </button>
                            )}

                            {tab === 'register' && !isDocente && (
                                <div className="p-3 bg-neon/5 border border-neon/20 rounded-lg">
                                    <p className="text-[11px] font-mono text-neon/80 leading-relaxed">
                                        ✅ Tu cuenta se creará <strong>gratis</strong>. Después podrás activar tu plan desde el panel de suscripción con pago seguro vía PayPal.
                                    </p>
                                </div>
                            )}
                            {tab === 'register' && isDocente && (
                                <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                                    <p className="text-[11px] font-mono text-violet-300 leading-relaxed">
                                        🎓 Tras crear tu cuenta te llevaremos a elegir tu <strong>pack de licencias</strong> y activarás tu rol de docente automáticamente.
                                    </p>
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

                            <OAuthButtons mode={tab} />
                        </form>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-600 mt-6 font-mono">
                    Volver a{' '}
                    <Link to="/" className="text-neon hover:underline">Tech4U.es</Link>
                </p>
            </div>
        </div>
    )
}
