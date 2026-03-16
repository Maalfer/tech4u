import { useState, useEffect } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    UserCircle,
    BookOpen,
    Users,
    Ticket,
    Database,
    LogOut,
    FlaskConical,
    Shield,
    Lightbulb,
    CreditCard,
    Video,
    Megaphone,
    Tag,
    TrendingUp,
    BarChart3,
    Trophy,
    Gamepad2,
    Globe,
    Bell,
    ShoppingBag,
    Hammer,
    Wrench,
    Terminal,
    Layers,
    BrainCircuit,
    Stethoscope,
    Compass,
    Gift,
    Swords,
    Monitor,
    BarChart2,
} from 'lucide-react';
import api from '../services/api';
import logoImg from '../assets/tech4u_logo.png';

// ── NavIcon Component: Reusable styled lucide icon container ──────────────────
const NavIcon = ({ icon: Icon, color, bg }) => (
    <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
    </div>
);

export default function Sidebar() {
    const { user, logout } = useAuth();
    const [ticketCount, setTicketCount] = useState(0);
    const [suggestionCount, setSuggestionCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    const fetchNotificationCounts = async () => {
        if (!user || (user.role !== 'admin' && user.role !== 'developer')) return;
        try {
            const [ticketRes, suggestionRes] = await Promise.all([
                api.get('/admin/users/tickets/count'),
                api.get('/announcements/admin/suggestions'),
            ]);
            setTicketCount(ticketRes.data.count);
            setSuggestionCount(suggestionRes.data.length);
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error al sincronizar notificaciones");
        }
    };

    useEffect(() => {
        fetchNotificationCounts();
        const interval = setInterval(fetchNotificationCounts, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const dashboardItem = {
        icon: LayoutDashboard,
        iconColor: 'text-violet-400',
        iconBg: 'bg-violet-500/10',
        label: 'Dashboard',
        path: (user?.role === 'admin' || user?.role === 'developer') ? '/admin-dashboard' : '/dashboard',
    };

    // --- ALUMNO SPECIFIC GROUPS ---
    const studentStatsGroup = [
        { icon: Compass, iconColor: 'text-sky-400', iconBg: 'bg-sky-500/10', label: 'Explora', path: '/explora' },
        { icon: UserCircle, iconColor: 'text-purple-400', iconBg: 'bg-purple-500/10', label: 'Mi Personaje', path: '/personaje' },
        { icon: CreditCard, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10', label: 'Mi Suscripción', path: '/suscripcion/gestionar' },
        { icon: BarChart3, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10', label: 'Test Stats', path: '/test-stats' },
        { icon: Trophy, iconColor: 'text-yellow-400', iconBg: 'bg-yellow-500/10', label: 'Ranking', path: '/leaderboard' },
        { icon: Gift, iconColor: 'text-violet-400', iconBg: 'bg-violet-500/10', label: 'Mis Referidos', path: '/mi-referral' },
    ];

    const studentAcademiaGroup = [
        { icon: Swords, iconColor: 'text-rose-400', iconBg: 'bg-rose-500/10', label: '⚔️ Battle Arena', path: '/battle' },
        { icon: FlaskConical, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10', label: 'Test Center', path: '/tests' },
        { icon: Gamepad2, iconColor: 'text-indigo-400', iconBg: 'bg-indigo-500/10', label: 'Skill Labs', path: '/skill-labs' },
        { icon: Terminal, iconColor: 'text-[var(--color-neon)]', iconBg: 'bg-[var(--color-neon)]/10', label: 'Terminal Skills', path: '/labs' },
        { icon: Monitor, iconColor: 'text-sky-300', iconBg: 'bg-sky-500/10', label: 'Windows Server', path: '/winlabs' },
        { icon: BrainCircuit, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10', label: 'SQL Skills', path: '/sql-skills' },
        { icon: Stethoscope, iconColor: 'text-orange-400', iconBg: 'bg-orange-500/10', label: 'NetLab', path: '/netlab' },
        { icon: BookOpen, iconColor: 'text-cyan-400', iconBg: 'bg-cyan-500/10', label: 'Teoría', path: '/teoria' },
        { icon: Layers, iconColor: 'text-violet-400', iconBg: 'bg-violet-500/10', label: 'Flashcards', path: '/flashcards' },
        { icon: Wrench, iconColor: 'text-slate-300', iconBg: 'bg-slate-500/10', label: 'Herramientas', path: '/tools' },
    ];

    const studentResourcesGroup = [
        { icon: Video, iconColor: 'text-indigo-400', iconBg: 'bg-indigo-500/10', label: 'Mis Cursos', path: '/my-courses' },
        { icon: ShoppingBag, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10', label: 'Academy Shop', path: '/shop' },
    ];

    // --- ADMIN GROUPS ---
    const menuItemsRest = [
        { icon: Compass, iconColor: 'text-sky-400', iconBg: 'bg-sky-500/10', label: 'Explora', path: '/explora' },
        { icon: UserCircle, iconColor: 'text-purple-400', iconBg: 'bg-purple-500/10', label: 'Mi Personaje', path: '/admin/personaje' },
        { icon: Swords, iconColor: 'text-rose-400', iconBg: 'bg-rose-500/10', label: '⚔️ Battle Arena', path: '/battle' },
        { icon: FlaskConical, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10', label: 'Test Center', path: '/tests' },
        { icon: Gamepad2, iconColor: 'text-indigo-400', iconBg: 'bg-indigo-500/10', label: 'Skill Labs', path: '/skill-labs' },
        { icon: Terminal, iconColor: 'text-[var(--color-neon)]', iconBg: 'bg-[var(--color-neon)]/10', label: 'Terminal Skills', path: '/labs' },
        { icon: Monitor, iconColor: 'text-sky-300', iconBg: 'bg-sky-500/10', label: 'Windows Server', path: '/winlabs' },
        { icon: BrainCircuit, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10', label: 'SQL Skills', path: '/sql-skills' },
        { icon: Stethoscope, iconColor: 'text-orange-400', iconBg: 'bg-orange-500/10', label: 'NetLab', path: '/netlab' },
        { icon: BookOpen, iconColor: 'text-cyan-400', iconBg: 'bg-cyan-500/10', label: 'Teoría', path: '/teoria' },
        { icon: Layers, iconColor: 'text-violet-400', iconBg: 'bg-violet-500/10', label: 'Flashcards', path: '/flashcards' },
        { icon: Wrench, iconColor: 'text-slate-300', iconBg: 'bg-slate-500/10', label: 'Herramientas', path: '/tools' },
        { icon: Bell, iconColor: 'text-sky-400', iconBg: 'bg-sky-500/10', label: 'Noticias Comunidad', path: '/noticias' },
        { icon: ShoppingBag, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10', label: 'Academy Shop', path: '/shop' },
    ];

    const upcomingItems = [
        { icon: Shield, iconColor: 'text-red-400', iconBg: 'bg-red-500/10', label: 'Ciberseguridad', path: '/ciberseguridad' },
    ];

    if (!user) return null;

    return (
        <aside className="w-60 bg-[#0A0A0A] border-r border-white/5 h-screen fixed left-0 top-0 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 pb-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-neon/20 blur-lg rounded-full" />
                        <img src={logoImg} alt="Tech4U Logo" className="relative w-10 h-10 object-contain" />
                    </div>
                    <div>
                        <span className="text-lg font-black text-white font-mono tracking-tighter uppercase leading-none">Tech4U</span>
                        <span className="block text-[9px] font-mono text-neon/60 uppercase tracking-[0.2em]">Academy</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">

                {/* 1. DASHBOARD — ALWAYS TOP */}
                <NavLink
                    to={dashboardItem.path}
                    className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive
                        ? 'bg-white/8 text-white border border-white/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <NavIcon icon={dashboardItem.icon} color={dashboardItem.iconColor} bg={dashboardItem.iconBg} />
                    {dashboardItem.label}
                </NavLink>

                {/* SUSCRIPCIÓN ALERT — solo alumnos sin plan */}
                {user.role === 'alumno' && (user.subscription_type === 'free' || !user.subscription_type) && (
                    <NavLink
                        to="/suscripcion"
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] my-3 border ${isActive
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                                : 'bg-amber-500/8 text-amber-400 border-amber-500/25 hover:bg-amber-500/15 hover:border-amber-500/50 animate-pulse'
                            }`}
                    >
                        <CreditCard className="w-5 h-5 flex-shrink-0 text-amber-400" />
                        <span className="flex-1">Suscripción</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-amber-400 font-black">🔒</span>
                    </NavLink>
                )}

                {/* 2. GESTIÓN — admin/developer (BELOW DASHBOARD) */}
                {(user.role === 'admin' || user.role === 'developer') && (
                    <div className="space-y-0.5">
                        <div className="my-4 border-t border-white/5 pt-4">
                            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] px-3 pb-2 flex items-center gap-1.5 font-black">
                                <Shield className="w-3.5 h-3.5 text-yellow-500" /> Gestión de la Academia
                            </p>
                        </div>

                        {/* Banco de Preguntas — solo admin/developer */}
                        <NavLink to="/gestion-contenido" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <NavIcon icon={Database} color="text-[var(--color-neon)]" bg="bg-[var(--color-neon)]/10" />
                            Banco de Preguntas
                        </NavLink>

                        {user.role === 'admin' && (
                            <NavLink to="/gestion-usuarios" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <NavIcon icon={Users} color="text-violet-400" bg="bg-violet-500/10" />
                                Usuarios y Roles
                            </NavLink>
                        )}

                        <NavLink to="/admin/tickets" className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <div className="flex items-center gap-4">
                                <NavIcon icon={Ticket} color="text-red-400" bg="bg-red-500/10" />
                                <span>Incidencias Academia</span>
                            </div>
                            {ticketCount > 0 && (
                                <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full shadow-[0_0_8px_rgba(220,38,38,0.6)] border border-red-400/50">
                                    {ticketCount}
                                </span>
                            )}
                        </NavLink>

                        <NavLink to="/admin/referidos" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <NavIcon icon={TrendingUp} color="text-indigo-400" bg="bg-indigo-500/10" />
                            Ecosistema Referidos
                        </NavLink>

                        <NavLink to="/admin/sugerencias" className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <div className="flex items-center gap-4">
                                <NavIcon icon={Lightbulb} color="text-blue-400" bg="bg-blue-500/10" />
                                <span>Propuestas Alumnos</span>
                            </div>
                            {suggestionCount > 0 && (
                                <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-blue-600 text-white text-[10px] font-black rounded-full shadow-[0_0_10px_rgba(37,99,235,0.7)] border border-blue-400/50">
                                    {suggestionCount}
                                </span>
                            )}
                        </NavLink>

                        <NavLink to="/admin/noticias" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <NavIcon icon={Megaphone} color="text-sky-400" bg="bg-sky-500/10" />
                            Enviar Noticia
                        </NavLink>

                        {user.role === 'admin' && (
                            <NavLink to="/admin/cupones" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <NavIcon icon={Tag} color="text-amber-400" bg="bg-amber-500/10" />
                                Cupones Descuento
                            </NavLink>
                        )}

                        <NavLink to="/admin/shop" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <NavIcon icon={ShoppingBag} color="text-amber-400" bg="bg-amber-500/10" />
                            Academy Shop
                        </NavLink>

                        <NavLink to="/admin/terminal-builder" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <NavIcon icon={Terminal} color="text-[var(--color-neon)]" bg="bg-[var(--color-neon)]/10" />
                            Terminal Builder
                        </NavLink>

                        <NavLink to="/admin/teoria" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <NavIcon icon={BookOpen} color="text-cyan-400" bg="bg-cyan-500/10" />
                            Teoría Admin
                        </NavLink>

                        <NavLink to="/admin/sql-editor" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <NavIcon icon={BrainCircuit} color="text-blue-400" bg="bg-blue-500/10" />
                            SQL Editor
                        </NavLink>

                        <NavLink to="/admin/analytics" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <NavIcon icon={BarChart2} color="text-violet-400" bg="bg-violet-500/10" />
                            Analytics
                        </NavLink>
                    </div>
                )}

                {/* 3. PRÓXIMAMENTE (ONLY ADMIN/DEVELOPER) */}
                {(user.role === 'admin' || user.role === 'developer') && (
                    <div className="space-y-0.5">
                        <div className="my-4 border-t border-white/5 pt-4">
                            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] px-3 pb-2 flex items-center gap-1.5 font-black">
                                <Hammer className="w-3.5 h-3.5 text-orange-500" /> Próximamente / En Desarrollo
                            </p>
                        </div>
                        {upcomingItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive
                                    ? 'bg-white/8 text-white border border-white/10'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <NavIcon icon={item.icon} color={item.iconColor} bg={item.iconBg} />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                )}

                {/* 4. EL RESTO (TODOS) */}
                {(user.role !== 'alumno') ? (
                    <div className="mt-6 border-t border-white/5 pt-4">
                        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] px-3 pb-1.5">Academia</p>
                        {menuItemsRest.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `flex items-center gap-4 ${item.indent ? 'pl-7 pr-4 py-2' : 'px-4 py-3'} rounded-xl transition-all duration-200 font-mono ${item.indent ? 'text-[11px]' : 'text-[13px]'} ${isActive
                                    ? 'bg-white/8 text-white border border-white/10'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <NavIcon icon={item.icon} color={item.iconColor} bg={item.indent ? 'bg-transparent' : item.iconBg} />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="space-y-0.5">
                            {studentStatsGroup.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive
                                        ? 'bg-white/8 text-white border border-white/10'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <NavIcon icon={item.icon} color={item.iconColor} bg={item.iconBg} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="mt-6 border-t border-white/5 pt-4">
                            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] px-3 pb-1.5">Academia</p>
                            {studentAcademiaGroup.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `flex items-center gap-4 ${item.indent ? 'pl-7 pr-4 py-2' : 'px-4 py-3'} rounded-xl transition-all duration-200 font-mono ${item.indent ? 'text-[11px]' : 'text-[13px]'} ${isActive
                                        ? 'bg-white/8 text-white border border-white/10'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <NavIcon icon={item.icon} color={item.iconColor} bg={item.indent ? 'bg-transparent' : item.iconBg} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="mt-6 border-t border-white/5 pt-4">
                            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] px-3 pb-1.5">Formación y Tienda</p>
                            {studentResourcesGroup.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive
                                        ? 'bg-white/8 text-white border border-white/10'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <NavIcon icon={item.icon} color={item.iconColor} bg={item.iconBg} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="mt-6 border-t border-white/5 pt-4">
                            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] px-3 pb-1.5">Comunidad</p>
                            <NavLink
                                to="/noticias"
                                className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <NavIcon icon={Bell} color="text-sky-400" bg="bg-sky-500/10" />
                                Noticias Comunidad
                            </NavLink>
                        </div>
                    </>
                )}
            </nav>

            {/* User Footer */}
            <div className="p-3 border-t border-white/5">
                <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl bg-white/3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon/40 to-cyan-500/40 border border-neon/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-black text-neon">{user.nombre?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-white font-bold font-mono truncate leading-none mb-0.5">{user.nombre}</p>
                        <p className="text-[9px] text-slate-500 font-mono truncate lowercase">{user.role} • {user.subscription_type}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-slate-600 hover:text-red-400 hover:bg-red-500/5 rounded-xl text-xs font-mono transition-all"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}