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
    Compass,
    Terminal
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
import terminalSkillsIcon from '../assets/terminal_skills.png';
import teoriaIcon from '../assets/teoria_icon.png';
import terminalBuilderIcon from '../assets/skilllabs_icon.png'; // Using a placeholder icon or finding a better one

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
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const dashboardItem = {
        icon: dashboardIcon,
        isCustom: true,
        label: 'Dashboard',
        path: (user?.role === 'admin' || user?.role === 'developer') ? '/admin-dashboard' : '/dashboard',
        customSize: 'w-8 h-8 scale-[1.5] origin-center -ml-1'
    };

    // --- ALUMNO SPECIFIC GROUPS ---
    const studentStatsGroup = [
        { icon: exploraIcon, isCustom: true, label: 'Explora', path: '/explora', customSize: 'w-8 h-8 scale-[1.8] origin-center -ml-1.5' },
        { icon: miPersonajeIcon, isCustom: true, label: 'Mi Personaje', path: '/personaje', customSize: 'w-8 h-8 scale-[2.8] origin-center -ml-1.5' },
        { icon: miSuscripcionIcon, isCustom: true, label: 'Mi Suscripción', path: '/suscripcion/gestionar', customSize: 'w-8 h-8 scale-[1.5] origin-center -ml-1' },
        { icon: miHistorialIcon, isCustom: true, label: 'Test Stats', path: '/test-stats', customSize: 'w-8 h-8 scale-[1.2] origin-center' },
        { icon: rankingIcon, isCustom: true, label: 'Ranking', path: '/leaderboard', customSize: 'w-8 h-8 scale-[1.2] origin-center' },
    ];

    const studentAcademiaGroup = [
        { icon: testCenterIcon, isCustom: true, label: 'Test Center', path: '/tests', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
        { icon: skillLabsIcon, isCustom: true, label: 'Skill Labs', path: '/skill-labs', customSize: 'w-8 h-8 scale-[1.8] origin-center -ml-1.5' },
        { icon: terminalSkillsIcon, isCustom: true, label: 'Terminal Skills', path: '/labs', customSize: 'w-8 h-8 scale-[1.3] origin-center -ml-1' },
        { icon: teoriaIcon, isCustom: true, label: 'Teoría', path: '/teoria', customSize: 'w-8 h-8 scale-[1.3] origin-center -ml-1' },
        { icon: flashcardIcon, isCustom: true, label: 'Flashcards', path: '/flashcards', customSize: 'w-8 h-8 scale-[1.8] origin-center -ml-1.5' },
        { icon: herramientasIcon, isCustom: true, label: 'Herramientas', path: '/tools', customSize: 'w-8 h-8 scale-[1.5] origin-center -ml-1' },
    ];

    const studentResourcesGroup = [
        { icon: cursosVideosIcon, isCustom: true, label: 'YT Videos', path: '/video-cursos', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
        { icon: misCursosIcon, isCustom: true, label: 'Mis Cursos', path: '/my-courses', customSize: 'w-8 h-8 scale-[1.5] origin-center -ml-1' },
        { icon: academyShopIcon, isCustom: true, label: 'Academy Shop', path: '/shop', customSize: 'w-8 h-8 scale-[1.8] origin-center -ml-1.5' },
    ];

    // --- ADMIN / DOCENTE GROUPS (Used in the other section) ---
    const menuItemsRest = [
        { icon: exploraIcon, isCustom: true, label: 'Explora', path: '/explora', customSize: 'w-8 h-8 scale-[1.8] origin-center -ml-1.5' },
        { icon: miPersonajeIcon, isCustom: true, label: 'Mi Personaje', path: '/admin/personaje', customSize: 'w-8 h-8 scale-[2.8] origin-center -ml-1.5' },
        { icon: testCenterIcon, isCustom: true, label: 'Test Center', path: '/tests', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
        { icon: skillLabsIcon, isCustom: true, label: 'Skill Labs', path: '/skill-labs', customSize: 'w-8 h-8 scale-[1.8] origin-center -ml-1.5' },
        { icon: terminalSkillsIcon, isCustom: true, label: 'Terminal Skills', path: '/labs', customSize: 'w-8 h-8 scale-[1.3] origin-center -ml-1' },
        { icon: teoriaIcon, isCustom: true, label: 'Teoría', path: '/teoria', customSize: 'w-8 h-8 scale-[1.3] origin-center -ml-1' },
        { icon: recursosIcon, isCustom: true, label: 'Recursos', path: '/resources', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
        { icon: cursosVideosIcon, isCustom: true, label: 'YT Videos', path: '/video-cursos', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
        { icon: flashcardIcon, isCustom: true, label: 'Flashcards', path: '/flashcards', customSize: 'w-8 h-8 scale-[1.8] origin-center -ml-1.5' },
        { icon: herramientasIcon, isCustom: true, label: 'Herramientas', path: '/tools', customSize: 'w-8 h-8 scale-[1.5] origin-center -ml-1' },
        { icon: noticiasAcademiaIcon, isCustom: true, label: 'Noticias Comunidad', path: '/noticias', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
        { icon: academyShopIcon, isCustom: true, label: 'Academy Shop', path: '/shop', customSize: 'w-8 h-8 scale-[1.8] origin-center -ml-1.5' },
    ];

    const upcomingItems = [
        { icon: ciberseguridadIcon, isCustom: true, label: 'Ciberseguridad', path: '/ciberseguridad', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
        { icon: mundoVirtualIcon, isCustom: true, label: 'Virtual World', path: '/mundo', customSize: 'w-8 h-8 scale-[2.0] origin-center -ml-1.5' },
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
                    <img src={dashboardItem.icon} className={`${dashboardItem.customSize} flex-shrink-0 object-contain`} alt="" />
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

                {/* 2. GESTIÓN — admin/developer/docente (BELOW DASHBOARD) */}
                {(user.role === 'admin' || user.role === 'developer' || user.role === 'docente') && (
                    <div className="space-y-0.5">
                        <div className="my-4 border-t border-white/5 pt-4">
                            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] px-3 pb-2 flex items-center gap-1.5 font-black">
                                <Shield className={`w-3.5 h-3.5 ${IC.shield}`} /> Gestión de la Academia
                            </p>
                        </div>

                        {/* Banco de Preguntas (General management) */}
                        <NavLink to="/gestion-contenido" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <img src={customIcon} className="w-8 h-8 flex-shrink-0 object-contain" alt="" />
                            Banco de Preguntas
                        </NavLink>

                        {(user.role === 'admin' || user.role === 'developer') && (
                            <NavLink to="/gestion-usuarios" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <img src={userRolesIcon} className="w-8 h-8 scale-[1.5] origin-center -ml-1 flex-shrink-0 object-contain" alt="" />
                                Usuarios y Roles
                            </NavLink>
                        )}

                        {(user.role === 'admin' || user.role === 'developer') && (
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
                        )}

                        {(user.role === 'admin' || user.role === 'developer') && (
                            <NavLink to="/admin/referidos" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <div className="w-8 h-8 flex items-center justify-center -ml-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                                </div>
                                Ecosistema Referidos
                            </NavLink>
                        )}

                        {(user.role === 'admin' || user.role === 'developer') && (
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
                        )}

                        <NavLink to="/admin/noticias" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <img src={enviarNoticiaIcon} className="w-8 h-8 scale-[1.5] origin-center -ml-1 flex-shrink-0 object-contain" alt="" />
                            Enviar Noticia
                        </NavLink>

                        {(user.role === 'admin' || user.role === 'developer') && (
                            <NavLink to="/admin/cupones" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <img src={cuponesDescuentoIcon} className="w-8 h-8 scale-[1.5] origin-center -ml-1 flex-shrink-0 object-contain" alt="" />
                                Cupones Descuento
                            </NavLink>
                        )}

                        <NavLink to="/admin/shop" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <img src={academyShopIcon} className="w-8 h-8 scale-[1.8] origin-center -ml-1.5 flex-shrink-0 object-contain" alt="" />
                            Academy Shop
                        </NavLink>

                        <NavLink to="/admin/terminal-builder" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <div className="w-8 h-8 flex items-center justify-center -ml-1.5 bg-neon/10 rounded-xl border border-neon/20 shadow-[0_0_15px_rgba(198,255,51,0.15)] group">
                                <Terminal className={`w-4 h-4 transition-colors ${location.pathname.startsWith('/admin/terminal-builder') ? 'text-neon' : 'text-slate-500 group-hover:text-neon'}`} />
                            </div>
                            Terminal Builder
                        </NavLink>

                        <NavLink to="/admin/teoria" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <img src={teoriaIcon} className="w-8 h-8 scale-[1.3] origin-center -ml-1 flex-shrink-0 object-contain" alt="" />
                            Teoría Admin
                        </NavLink>


                        <NavLink to="/admin/cursos" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <img src={ytHelpIcon} className="w-8 h-8 scale-[1.5] origin-center -ml-1 flex-shrink-0 object-contain" alt="" />
                            YT Help
                        </NavLink>
                    </div>
                )}

                {/* 3. PRÓXIMAMENTE (ONLY ADMIN) */}
                {(user.role === 'admin' || user.role === 'developer' || user.role === 'docente') && (
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
                                <img src={item.icon} className={`${item.customSize} flex-shrink-0 object-contain`} alt="" />
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
                                className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive
                                    ? 'bg-white/8 text-white border border-white/10'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <img src={item.icon} className={`${item.customSize || 'w-8 h-8'} flex-shrink-0 object-contain`} alt="" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                ) : (
                    /* ALUMNO SPECIFIC RENDERING */
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
                                    <img src={item.icon} className={`${item.customSize} flex-shrink-0 object-contain`} alt="" />
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
                                    className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-mono text-[13px] ${isActive
                                        ? 'bg-white/8 text-white border border-white/10'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <img src={item.icon} className={`${item.customSize} flex-shrink-0 object-contain`} alt="" />
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
                                    <img src={item.icon} className={`${item.customSize} flex-shrink-0 object-contain`} alt="" />
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
                                <img src={noticiasAcademiaIcon} className="w-8 h-8 scale-[2.0] origin-center -ml-1.5 flex-shrink-0 object-contain" alt="" />
                                Noticias Comunidad
                            </NavLink>
                        </div>

                        {/* PRÓXIMAMENTE — visible para alumnos */}
                        <div className="mt-6 border-t border-white/5 pt-4">
                            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] px-3 pb-2 flex items-center gap-1.5 font-black">
                                <Hammer className="w-3.5 h-3.5 text-orange-500/70" /> Próximamente
                            </p>
                            {upcomingItems.map((item) => (
                                <div
                                    key={item.path}
                                    className="flex items-center gap-4 px-4 py-3 rounded-xl font-mono text-[13px] text-slate-600 cursor-default select-none opacity-60"
                                >
                                    <img src={item.icon} className={`${item.customSize} flex-shrink-0 object-contain grayscale`} alt="" />
                                    <span className="flex-1">{item.label}</span>
                                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-orange-500/30 text-orange-500/70 bg-orange-500/5 whitespace-nowrap">
                                        Soon
                                    </span>
                                </div>
                            ))}
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