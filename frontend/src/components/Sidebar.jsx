import { useState, useEffect } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Ticket,
    Database,
    LogOut,
    FlaskConical,
    Shield,
    Lightbulb,
    CreditCard,
    Video
} from 'lucide-react';
import api from '../services/api';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const [ticketCount, setTicketCount] = useState(0);
    const [suggestionCount, setSuggestionCount] = useState(0); // Nuevo estado
    const location = useLocation();
    const navigate = useNavigate();

    const fetchNotificationCounts = async () => {
        if (!user || user.role !== 'admin') return;
        try {
            // Sincronizamos Errores y Sugerencias en paralelo
            const [ticketRes, suggestionRes] = await Promise.all([
                api.get('/admin/users/tickets/count'),
                api.get('/announcements/admin/suggestions')
            ]);
            setTicketCount(ticketRes.data.count);
            setSuggestionCount(suggestionRes.data.length);
        } catch (err) {
            console.error("Error al sincronizar notificaciones");
        }
    };

    useEffect(() => {
        fetchNotificationCounts();
        const interval = setInterval(fetchNotificationCounts, 60000);
        return () => clearInterval(interval);
    }, [location.pathname, user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            path: user?.role === 'admin' ? '/admin-dashboard' : '/dashboard'
        },
        { icon: BookOpen, label: 'Asignaturas', path: '/courses' },
        { icon: FlaskConical, label: 'Test Center', path: '/tests' },
        { icon: BookOpen, label: 'Recursos', path: '/resources' },
        { icon: Video, label: 'Cursos en Vídeo', path: '/video-cursos' }
    ];

    if (!user) return null;

    return (
        <aside className="w-64 bg-[#0D0D0D] border-r border-[rgba(57,255,20,0.15)] h-screen fixed left-0 top-0 flex flex-col z-50">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[rgba(57,255,20,0.1)] border border-[rgba(57,255,20,0.2)]">
                        <Shield className="w-6 h-6 text-[#39FF14]" />
                    </div>
                    <span className="text-xl font-bold text-[#39FF14] font-mono tracking-tighter uppercase">Tech4U</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">

                {/* BOTÓN SUSCRIPCIÓN — solo alumnos sin plan activo */}
                {user.role === 'alumno' && (user.subscription_type === 'free' || !user.subscription_type) && (
                    <NavLink
                        to="/suscripcion"
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 font-mono text-xs mb-3 border ${isActive
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)] animate-pulse'
                            }`
                        }
                    >
                        <CreditCard className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">Suscripción</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-amber-400 font-black">🔒</span>
                    </NavLink>
                )}

                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-4 mb-2 text-center">Menú Principal</p>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 font-mono text-xs ${isActive
                            ? 'bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[rgba(57,255,20,0.4)]'
                            : 'text-slate-400 hover:text-[#39FF14] hover:bg-[rgba(57,255,20,0.06)]'
                            }`}
                    >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {item.label}
                    </NavLink>
                ))}

                {(user.role === 'admin' || user.role === 'docente') && (
                    <div className="pt-6 space-y-1">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-4 mb-2 flex items-center gap-2">
                            <Shield className="w-3 h-3 text-yellow-500" /> Gestión
                        </p>

                        <NavLink to="/gestion-contenido" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 font-mono text-xs ${isActive ? 'bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[rgba(57,255,20,0.4)]' : 'text-slate-400 hover:text-[#39FF14] hover:bg-[rgba(57,255,20,0.06)]'}`}>
                            <Database className="w-4 h-4 flex-shrink-0" />
                            Banco de Preguntas
                        </NavLink>

                        <NavLink to="/admin/cursos" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 font-mono text-xs ${isActive ? 'bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[rgba(57,255,20,0.4)]' : 'text-slate-400 hover:text-[#39FF14] hover:bg-[rgba(57,255,20,0.06)]'}`}>
                            <Video className="w-4 h-4 flex-shrink-0" />
                            Gestión Cursos
                        </NavLink>

                        {user.role === 'admin' && (
                            <>
                                {/* NUEVO: Buzón de Sugerencias con contador neón azul */}
                                <NavLink to="/admin/sugerencias" className={({ isActive }) => `flex items-center justify-between p-3 rounded-xl transition-all duration-200 font-mono text-xs ${isActive ? 'bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[rgba(57,255,20,0.4)]' : 'text-slate-400 hover:text-[#39FF14] hover:bg-[rgba(57,255,20,0.06)]'}`}>
                                    <div className="flex items-center gap-3">
                                        <Lightbulb className="w-4 h-4 flex-shrink-0 text-blue-400" />
                                        <span>Propuestas Alumnos</span>
                                    </div>
                                    {suggestionCount > 0 && (
                                        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] font-black rounded shadow-[0_0_10px_rgba(37,99,235,0.6)] animate-pulse border border-blue-400/50">
                                            {suggestionCount}
                                        </span>
                                    )}
                                </NavLink>

                                <NavLink to="/admin/tickets" className={({ isActive }) => `flex items-center justify-between p-3 rounded-xl transition-all duration-200 font-mono text-xs ${isActive ? 'bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[rgba(57,255,20,0.4)]' : 'text-slate-400 hover:text-[#39FF14] hover:bg-[rgba(57,255,20,0.06)]'}`}>
                                    <div className="flex items-center gap-3">
                                        <Ticket className="w-4 h-4 flex-shrink-0 text-red-400" />
                                        <span>Buzón Errores</span>
                                    </div>
                                    {ticketCount > 0 && (
                                        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-black rounded shadow-[0_0_8px_rgba(220,38,38,0.5)] animate-pulse border border-red-400/50">
                                            {ticketCount}
                                        </span>
                                    )}
                                </NavLink>

                                <NavLink to="/gestion-usuarios" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 font-mono text-xs ${isActive ? 'bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[rgba(57,255,20,0.4)]' : 'text-slate-400 hover:text-[#39FF14] hover:bg-[rgba(57,255,20,0.06)]'}`}>
                                    <Users className="w-4 h-4 flex-shrink-0" />
                                    Usuarios & Roles
                                </NavLink>
                            </>
                        )}
                    </div>
                )}
            </nav>

            <div className="p-4 mt-auto border-t border-[rgba(57,255,20,0.1)] pt-4">
                <div className="px-2 mb-3">
                    <p className="text-xs text-[#39FF14] font-mono truncate">{user.nombre}</p>
                    <p className="text-[10px] text-slate-500 truncate lowercase">{user.role} • {user.subscription_type}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-slate-500 hover:text-red-400 hover:bg-[rgba(255,50,50,0.06)] rounded-lg text-xs font-mono transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}