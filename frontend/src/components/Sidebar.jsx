import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    LayoutDashboard, BookOpen, FlaskConical, FileText, LogOut, Shield, Database, Users
} from 'lucide-react'

const NAV = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'Asignaturas' },
    { to: '/tests', icon: FlaskConical, label: 'Test Center' },
    { to: '/resources', icon: FileText, label: 'Recursos' },
]

export default function Sidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => { logout(); navigate('/') }

    return (
        <aside className="flex flex-col justify-between w-64 min-h-screen bg-[#0D0D0D] border-r border-[rgba(57,255,20,0.15)] px-4 py-6 fixed top-0 left-0 z-40">
            {/* Logo */}
            <div>
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="p-2 rounded-lg bg-[rgba(57,255,20,0.1)] neon-border">
                        <Shield className="w-6 h-6 text-[#39FF14]" />
                    </div>
                    <span className="text-xl font-bold text-[#39FF14] glow-text font-mono">Tech4U</span>
                </div>

                {/* Nav links */}
                <nav className="flex flex-col gap-1">
                    {NAV.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-mono transition-all duration-200 ${isActive
                                    ? 'bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[rgba(57,255,20,0.4)]'
                                    : 'text-slate-400 hover:text-[#39FF14] hover:bg-[rgba(57,255,20,0.06)]'
                                }`
                            }
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Área de Gestión para Admins/Docentes */}
                {(user?.role === 'admin' || user?.role === 'docente') && (
                    <div className="mt-8">
                        <p className="px-2 mb-2 text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Shield className="w-3 h-3 text-yellow-500" /> Panel de Gestión
                        </p>
                        <nav className="flex flex-col gap-1">
                            <NavLink to="/gestion-contenido" className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-mono transition-all duration-200 ${isActive ? 'bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[rgba(57,255,20,0.4)]' : 'text-slate-400 hover:text-[#39FF14] hover:bg-[rgba(57,255,20,0.06)]'}`}>
                                <Database className="w-4 h-4 flex-shrink-0" />
                                Banco de Preguntas
                            </NavLink>
                            {user?.role === 'admin' && (
                                <NavLink to="/gestion-usuarios" className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-mono transition-all duration-200 ${isActive ? 'bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[rgba(57,255,20,0.4)]' : 'text-slate-400 hover:text-[#39FF14] hover:bg-[rgba(57,255,20,0.06)]'}`}>
                                    <Users className="w-4 h-4 flex-shrink-0" />
                                    Usuarios & Roles
                                </NavLink>
                            )}
                        </nav>
                    </div>
                )}
            </div>

            {/* User + Logout */}
            <div className="mt-8 border-t border-[rgba(57,255,20,0.1)] pt-4">
                {user && (
                    <div className="px-2 mb-3">
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Conectado como</p>
                        <p className="text-sm text-[#39FF14] font-mono truncate mt-0.5">{user.nombre}</p>
                        <p className="text-xs text-slate-600 truncate">{user.email}</p>
                        <span className={`mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full font-mono ${user.subscription_type === 'free'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-[rgba(57,255,20,0.15)] text-[#39FF14]'
                            }`}>
                            {user.subscription_type === 'free' ? 'Gratuito' : user.subscription_type.charAt(0).toUpperCase() + user.subscription_type.slice(1)}
                        </span>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-slate-500 hover:text-red-400 hover:bg-[rgba(255,50,50,0.06)] rounded-lg text-sm font-mono transition-all duration-200"
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                </button>
            </div>
        </aside>
    )
}
