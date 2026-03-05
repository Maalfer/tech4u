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
    FileText,
    Cpu,
    Trophy,
    History,
    LifeBuoy,
    Gamepad2,
    Globe,
    Bell,
    ShoppingBag,
    PlayCircle,
    Hammer,
    Wrench,
    Compass
} from 'lucide-react';
import api from '../services/api';
import logoImg from '../assets/logo.png';
import customIcon from '../assets/banco_preguntas_icon.png';
import flashcardIcon from '../assets/flashcard_icon.png';
import miPersonajeIcon from '../assets/mipersonaje_icon.png';
import academyShopIcon from '../assets/academyshop_icon.png';
import testCenterIcon from '../assets/testcenter_icon.png';
import recursosIcon from '../assets/recursos_icon.png';
import cursosVideosIcon from '../assets/cursosvideos_icon.png';
import herramientasIcon from '../assets/herramientas_icon.png';
import mundoVirtualIcon from '../assets/mundovirtual_icon.png';
import ytHelpIcon from '../assets/ythelp_icon.png';
import incidenciasAcademiaIcon from '../assets/incidenciasacademia_icon.png';
import userRolesIcon from '../assets/useryroles_icon.png';
import cuponesDescuentoIcon from '../assets/cuponesdescuento_icon.png';
import ciberseguridadIcon from '../assets/ciberseguridad_icon.png';
import enviarNoticiaIcon from '../assets/enviarnoticia_icon.png';
import propuestasAlumnosIcon from '../assets/preguntasalumnos_icon.png';
import dashboardIcon from '../assets/dashboard_icon.png';
import misCursosIcon from '../assets/miscursos_icon.png';
import rankingIcon from '../assets/ranking_icon.png';
import miHistorialIcon from '../assets/mihistorial_icon.png';
import miSuscripcionIcon from '../assets/misuscripcion_icon.png';
import noticiasAcademiaIcon from '../assets/noticiasacademia_icon.png';
import skillLabsIcon from '../assets/skilllabs_icon.png';
import exploraIcon from '../assets/explora_icon.png';

// ── Palette: every icon has a fixed semantic color ──────────────────────────
const IC = {
    dashboard: 'text-violet-400',
    courses: 'text-sky-400',
    tests: 'text-emerald-400',
    resources: 'text-cyan-400',
    video: 'text-indigo-400',
    sub: 'text-amber-400',
    // Admin
    db: 'text-neon',
    adminVideo: 'text-indigo-400',
    suggest: 'text-blue-400',
    ticket: 'text-red-400',
    users: 'text-violet-400',
    coupons: 'text-amber-400',
    shield: 'text-yellow-500',
};

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
        { icon: dashboardIcon, isCustom: true, label: 'Dashboard', path: (user?.role === 'admin' || user?.role === 'developer') ? '/admin-dashboard' : '/dashboard', customSize: 'w-8 h-8 scale-[1.5] origin-center -ml-1' },
        { icon: exploraIcon, isCustom: true, label: 'Explora', path: '/explora', customSize: 'w-8 h-8 scale-[1.8] origin-center -ml-1.5' },
        ...((user?.role !== 'admin' && user?.role !== 'developer')
            ? [{ icon: miPersonajeIcon, isCustom: true, label: 'Mi Personaje', path: '/personaje', customSize: 'w-8 h-8 scale-[2.8] origin-center -ml-1.5' }]
            : [{ icon: miPersonajeIcon, isCustom: true, label: 'Mi Personaje', path: '/admin/personaje', customSize: 'w-8 h-8 scale-[2.8] origin-center -ml-1.5' }]
        ),
        { icon: testCenterIcon, isCustom: true, label: 'Test Center', path: '/tests', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
        { icon: skillLabsIcon, isCustom: true, label: 'Skill Labs', path: '/skill-labs', customSize: 'w-8 h-8 scale-[1.8] origin-center -ml-1.5' },
        { icon: recursosIcon, isCustom: true, label: 'Recursos', path: '/resources', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
        { icon: cursosVideosIcon, isCustom: true, label: 'YT Videos', path: '/video-cursos', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
        ...((user?.role !== 'admin' && user?.role !== 'developer') ? [{ icon: misCursosIcon, isCustom: true, label: 'Mis Cursos', path: '/my-courses', customSize: 'w-8 h-8 scale-[1.5] origin-center -ml-1' }] : []),
        { icon: flashcardIcon, isCustom: true, label: 'Flashcards', path: '/flashcards', customSize: 'w-8 h-8 scale-[1.8] origin-center -ml-1.5' },
        { icon: herramientasIcon, isCustom: true, label: 'Herramientas', path: '/tools', customSize: 'w-8 h-8 scale-[1.5] origin-center -ml-1' },
        ...((user?.role !== 'admin' && user?.role !== 'developer') ? [
            { icon: rankingIcon, isCustom: true, label: 'Ranking', path: '/leaderboard', customSize: 'w-8 h-8 scale-[1.2] origin-center' },
            { icon: miHistorialIcon, isCustom: true, label: 'Test Stats', path: '/test-stats', customSize: 'w-8 h-8 scale-[1.2] origin-center' },
            { icon: miSuscripcionIcon, isCustom: true, label: 'Mi Suscripción', path: '/suscripcion/gestionar', customSize: 'w-8 h-8 scale-[1.5] origin-center -ml-1' },
        ] : []),
    ];

    const extraItems = [
        { icon: mundoVirtualIcon, isCustom: true, label: 'Virtual World', path: '/mundo', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
        { icon: ciberseguridadIcon, isCustom: true, label: 'Ciberseguridad', path: '/ciberseguridad', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
        ...((user?.role !== 'admin' && user?.role !== 'developer') ? [
            { icon: noticiasAcademiaIcon, isCustom: true, label: 'Noticias Academia', path: '/noticias', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
            { icon: academyShopIcon, isCustom: true, label: 'Academy Shop', path: '/shop', customSize: 'w-8 h-8 scale-[1.8] origin-center -ml-1.5' },
        ] : []),
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

                {/* SUSCRIPCIÓN ALERT — solo alumnos sin plan */}
                {user.role === 'alumno' && (user.subscription_type === 'free' || !user.subscription_type) && (
                    <NavLink
                        to="/suscripcion"
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] mb-3 border ${isActive
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                                : 'bg-amber-500/8 text-amber-400 border-amber-500/25 hover:bg-amber-500/15 hover:border-amber-500/50 animate-pulse'
                            }`}
                    >
                        <CreditCard className="w-5 h-5 flex-shrink-0 text-amber-400" />
                        <span className="flex-1">Suscripción</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-amber-400 font-black">🔒</span>
                    </NavLink>
                )}

                {/* MENÚ PRINCIPAL */}
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] px-3 pt-2 pb-1.5">Menú Principal</p>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive
                            ? 'bg-white/8 text-white border border-white/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {item.isCustom ? (
                            <img src={item.icon} className={`${item.customSize || 'w-8 h-8'} flex-shrink-0 object-contain`} alt="" />
                        ) : (
                            <item.icon className={`w-5 h-5 flex-shrink-0 ${item.iconClass}`} />
                        )}
                        {item.label}
                    </NavLink>
                ))}

                {/* SECCIÓN EXTRA */}
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] px-3 pt-5 pb-1.5">Contenido Extra</p>
                {extraItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive
                            ? 'bg-white/8 text-white border border-white/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {item.isCustom ? (
                            <img src={item.icon} className={`${item.customSize || 'w-8 h-8'} flex-shrink-0 object-contain`} alt="" />
                        ) : (
                            <item.icon className={`w-5 h-5 flex-shrink-0 ${item.iconClass}`} />
                        )}
                        {item.label}
                    </NavLink>
                ))}

                {/* GESTIÓN — admin/developer/docente */}
                {(user.role === 'admin' || user.role === 'developer' || user.role === 'docente') && (
                    <div className="pt-5 space-y-0.5">
                        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] px-3 pb-1.5 flex items-center gap-1.5">
                            <Shield className={`w-4 h-4 ${IC.shield}`} /> Gestión
                        </p>

                        <NavLink to="/admin/noticias" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <img src={enviarNoticiaIcon} className="w-8 h-8 scale-[1.5] origin-center -ml-1 flex-shrink-0 object-contain" alt="" />
                            Enviar Noticia
                        </NavLink>

                        <NavLink to="/gestion-contenido" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            {/* Restablecido a w-8 h-8 para que visualmente esté a la par con el de Flashcards */}
                            <img src={customIcon} className="w-8 h-8 flex-shrink-0 object-contain" alt="" />
                            Banco de Preguntas
                        </NavLink>

                        <NavLink to="/admin/cursos" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <img src={ytHelpIcon} className="w-8 h-8 scale-[1.5] origin-center -ml-1 flex-shrink-0 object-contain" alt="" />
                            YT Help
                        </NavLink>

                        <NavLink to="/admin/shop" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <img src={academyShopIcon} className="w-8 h-8 scale-[1.8] origin-center -ml-1.5 flex-shrink-0 object-contain" alt="" />
                            Academy Shop
                        </NavLink>

                        {(user.role === 'admin' || user.role === 'developer') && (
                            <>
                                {/* Propuestas con contador azul */}
                                <NavLink to="/admin/sugerencias" className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <div className="flex items-center gap-4">
                                        <img src={propuestasAlumnosIcon} className="w-8 h-8 scale-[1.5] origin-center -ml-1 flex-shrink-0 object-contain" alt="" />
                                        <span>Propuestas Alumnos</span>
                                    </div>
                                    {suggestionCount > 0 && (
                                        <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-blue-600 text-white text-[10px] font-black rounded-full shadow-[0_0_10px_rgba(37,99,235,0.7)] border border-blue-400/50">
                                            {suggestionCount}
                                        </span>
                                    )}
                                </NavLink>

                                {/* Incidencias Academia con contador rojo */}
                                <NavLink to="/admin/tickets" className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <div className="flex items-center gap-4">
                                        <img src={incidenciasAcademiaIcon} className="w-8 h-8 scale-[1.5] origin-center -ml-1 flex-shrink-0 object-contain" alt="" />
                                        <span>Incidencias Academia</span>
                                    </div>
                                    {ticketCount > 0 && (
                                        <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full shadow-[0_0_8px_rgba(220,38,38,0.6)] border border-red-400/50">
                                            {ticketCount}
                                        </span>
                                    )}
                                </NavLink>

                                <NavLink to="/gestion-usuarios" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <img src={userRolesIcon} className="w-8 h-8 scale-[1.5] origin-center -ml-1 flex-shrink-0 object-contain" alt="" />
                                    Usuarios & Roles
                                </NavLink>

                                <NavLink to="/admin/cupones" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <img src={cuponesDescuentoIcon} className="w-8 h-8 scale-[1.5] origin-center -ml-1 flex-shrink-0 object-contain" alt="" />
                                    Cupones de Descuento
                                </NavLink>
                            </>
                        )}
                    </div>
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