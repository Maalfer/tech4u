import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import {
    Zap, BookOpen, FlaskConical, Layers, Trophy, Shield,
    Star, BarChart2, CreditCard, Play, Wrench, Globe2,
    Swords, MessageSquare, ChevronRight, Flame, Lock,
    ShieldCheck, ShieldOff, Award, Hammer, Target, AlertTriangle,
    Map, Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import pj1 from '../assets/pj_lvl_1.png';
import pj2 from '../assets/pj_lvl_2.png';
import pj3 from '../assets/pj_lvl_3.png';
import pj4 from '../assets/pj_lvl_4.png';
import pj5 from '../assets/pj_lvl_5.png';
import pj6 from '../assets/pj_lvl_6.png';
import pj7 from '../assets/pj_lvl_7.png';
import pj8 from '../assets/pj_lvl_8.png';
import pj9 from '../assets/pj_lvl_9.png';
import pj10 from '../assets/pj_lvl_10.png';
import pj11 from '../assets/pj_lvl_11.png';
import pj12 from '../assets/pj_lvl_12.png';
import pj13 from '../assets/pj_lvl_13.png';
import pj14 from '../assets/pj_lvl_14.png';
import pj15 from '../assets/pj_lvl_15.png';
import pj16 from '../assets/pj_lvl_16.png';
import pj17 from '../assets/pj_lvl_17.png';
import pj18 from '../assets/pj_lvl_18.png';
import pj19 from '../assets/pj_lvl_19.png';
import pj20 from '../assets/pj_lvl_20.png';

const PJ_ASSETS = {
    1: pj1, 2: pj2, 3: pj3, 4: pj4, 5: pj5,
    6: pj6, 7: pj7, 8: pj8, 9: pj9, 10: pj10,
    11: pj11, 12: pj12, 13: pj13, 14: pj14, 15: pj15,
    16: pj16, 17: pj17, 18: pj18, 19: pj19, 20: pj20
};

// ── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
    {
        id: 'dashboard',
        emoji: '🗺️',
        color: 'violet',
        label: 'Dashboard',
        path: '/dashboard',
        headline: 'Tu centro de mando RPG',
        desc: 'El Dashboard es tu página de inicio dentro de la academia. Verás tus KPIs en tiempo real: nivel actual, XP acumulado, racha de conexión diaria, tests realizados hoy, y estadísticas globales por módulo. Es el punto de partida de cada sesión.'
    },
    {
        id: 'tests',
        emoji: '🎯',
        color: 'green',
        label: 'Test Center',
        path: '/tests',
        headline: 'El corazón del aprendizaje',
        desc: 'El Test Center es donde practicas y te examinas. Tienes varias modalidades disponibles, cada una con un propósito diferente.'
    },
    {
        id: 'skilllabs',
        emoji: '🧪',
        color: 'fuchsia',
        label: 'Skill Labs',
        path: '/skill-labs',
        headline: 'Aprende haciendo, no memorizando',
        desc: 'Skill Labs son ejercicios interactivos de tipo drag & drop. Tienes fragmentos de comandos, conceptos o configuraciones, y debes arrastrarlos al lugar correcto para completar el enunciado. Tienes 3 intentos por ejercicio antes de ver la solución. Están organizados por asignatura ASIR.'
    },
    {
        id: 'flashcards',
        emoji: '📚',
        color: 'purple',
        label: 'Flashcards',
        path: '/flashcards',
        headline: 'Repaso rápido visual',
        desc: 'Las Flashcards son tarjetas interactivas para repasar conceptos clave. Voltea la tarjeta, evalúa tu conocimiento y continúa. Ideales para repasar antes de un examen o para fijar términos técnicos en pocos minutos.'
    },
    {
        id: 'recursos',
        emoji: '📂',
        color: 'blue',
        label: 'Recursos',
        path: '/resources',
        headline: 'Documentación y materiales ASIR',
        desc: 'La sección de Recursos contiene apuntes, esquemas, PDFs y material de referencia organizado por módulo ASIR. Puedes visualizarlos directamente en la academia o descargarlos.'
    },
    {
        id: 'videos',
        emoji: '▶️',
        color: 'red',
        label: 'YT Videos',
        path: '/video-cursos',
        headline: 'Aprende con vídeos estructurados',
        desc: 'Explora cursos en vídeo integrados directamente desde YouTube, organizados por asignatura. Puedes marcar vídeos como vistos y llevar un seguimiento de tu progreso en cada curso.'
    },
    {
        id: 'cursos',
        emoji: '🎓',
        color: 'cyan',
        label: 'Mis Cursos',
        path: '/my-courses',
        headline: 'Tu ruta de aprendizaje personalizada',
        desc: 'En Mis Cursos puedes comprar cursos individuales y acceder a contenido premium adicional de la academia. Cada curso desbloqueado queda en tu perfil de forma permanente.'
    },
    {
        id: 'herramientas',
        emoji: '🔧',
        color: 'orange',
        label: 'Herramientas',
        path: '/tools',
        headline: 'Utilidades técnicas para el día a día',
        desc: 'La sección de Herramientas incluye utilidades prácticas de sysadmin: calculadora de subredes IP, conversor de máscaras, tablas de referencia y más. Recursos que usarás tanto en la academia como en el mundo real.'
    },
    {
        id: 'ranking',
        emoji: '🏆',
        color: 'yellow',
        label: 'Ranking',
        path: '/leaderboard',
        headline: 'Mide tu progreso frente al resto',
        desc: 'El Ranking muestra la tabla de clasificación global de todos los alumnos, ordenada por nivel y XP. Tu posición se actualiza en tiempo real cada vez que subes de nivel. ¿Puedes llegar al top 3?'
    },
    {
        id: 'stats',
        emoji: '📊',
        color: 'cyan',
        label: 'Test Stats',
        path: '/test-stats',
        headline: 'Tu historial y análisis de rendimiento',
        desc: 'Test Stats es tu archivo personal de exámenes. Puedes ver todos los tests que has realizado: fecha, número de preguntas, aciertos, fallos, porcentaje y modo. Úsalo para analizar tus puntos débiles por módulo.'
    },
    {
        id: 'suscripcion',
        emoji: '💳',
        color: 'emerald',
        label: 'Mi Suscripción',
        path: '/suscripcion/gestionar',
        headline: 'Gestiona tu acceso premium',
        desc: 'En Mi Suscripción puedes ver cuando empezó tu suscripción, cuándo vence, el tipo de plan que tienes y el estado general de tu cuenta. También puedes gestionar tu suscripción y acceder al portal de Stripe para cancelar o actualizar tu plan.'
    },
    {
        id: 'personaje',
        emoji: '🧙',
        color: 'blue',
        label: 'Mi Personaje',
        path: '/personaje',
        headline: 'Tu hoja de personaje RPG',
        desc: 'Mi Personaje es tu perfil gamificado completo. Muestra tu nivel, rango, XP, racha diaria, estadísticas por módulo ASIR (HW, OS, Redes, SQL, WEB, Cyber), equipamiento desbloqueado y medallas obtenidas. Es la representación completa de tu progreso.'
    },
    {
        id: 'mundo',
        emoji: '🌍',
        color: 'teal',
        label: 'Virtual World',
        path: '/mundo',
        headline: 'Explora el mundo RPG de la academia',
        desc: 'El Virtual World es un mapa interactivo RPG donde puedes moverte con tu personaje, explorar zonas temáticas por módulo ASIR, leer infografías técnicas y desbloquear contenido oculto. Una experiencia inmersiva única en una academia FP.'
    },
    {
        id: 'incidencias',
        emoji: '🆘',
        color: 'slate',
        label: 'Soporte / Incidencias',
        path: '/dashboard',
        headline: 'Canal directo con el equipo docente',
        desc: 'Desde el Dashboard puedes abrir tickets de soporte para reportar errores en preguntas, proponer mejoras o contactar con el equipo técnico. Los tickets son gestionados directamente por los administradores de la academia.'
    },
];

const TEST_MODES = [
    {
        icon: <BookOpen className="w-6 h-6 text-green-400" />,
        color: 'green',
        name: 'Práctica Libre',
        badge: 'Sin XP',
        badgeC: 'bg-slate-800 text-slate-400 border-slate-600',
        desc: 'Entrena sin presión. Elige entre 10, 20 ó 40 preguntas de cualquier módulo ASIR. No hay límite de tiempo. No otorga XP, pero es la forma perfecta de repasar y detectar puntos débiles.'
    },
    {
        icon: <Target className="w-6 h-6 text-neon" />,
        color: 'neon',
        name: 'Modo Examen',
        badge: '⚡ Otorga XP',
        badgeC: 'bg-neon/20 text-neon border-neon/40',
        desc: 'El único modo que premia con XP. Exactamente 40 preguntas, temario mixto, modo cronometrado. Está diseñado para simular las condiciones reales del examen oficial de ASIR. Cada examen superado suma experiencia a tu personaje.'
    },
    {
        icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
        color: 'orange',
        name: 'Sala de Errores',
        badge: 'Sin XP',
        badgeC: 'bg-slate-800 text-slate-400 border-slate-600',
        desc: 'El sistema lleva un registro de cada respuesta incorrecta que hayas dado. La Sala de Errores genera un test personalizado solo con tus fallos históricos. La forma más eficiente de convertir debilidades en fortalezas.'
    },
    {
        icon: <Award className="w-6 h-6 text-purple-400" />,
        color: 'purple',
        name: 'Flashcards',
        badge: 'Sin XP',
        badgeC: 'bg-slate-800 text-slate-400 border-slate-600',
        desc: 'Tarjetas interactivas de repaso. Voltéalas, valora tu conocimiento y continúa. No otorgan XP pero son ideales para memorizar terminología técnica ASIR de forma rápida.'
    },
    {
        icon: <Hammer className="w-6 h-6 text-fuchsia-400" />,
        color: 'fuchsia',
        name: 'Skill Labs',
        badge: 'Sin XP',
        badgeC: 'bg-slate-800 text-slate-400 border-slate-600',
        desc: 'Ejercicios de drag & drop donde ensamblas comandos y conceptos reales. 3 intentos por ejercicio y feedback inmediato. Orientado a la práctica real de administración de sistemas.'
    },
];

const XP_TABLE = [
    { score: '≥ 90%', xp: '+80 XP', note: 'Excelente' },
    { score: '≥ 70%', xp: '+50 XP', note: 'Aprobado' },
    { score: '≥ 50%', xp: '+25 XP', note: 'Suficiente' },
    { score: '< 50%', xp: '+0 XP', note: 'Insuficiente' },
];

const RANKS = [
    { id: 1, name: '🥉 Estudiante ASIR', levels: 'Niveles 1 – 4', xp: '0 – 1.999 XP', desc: 'Primer contacto con la administración de sistemas. Aprenderás hardware, redes básicas y los fundamentos de ASIR.', cardC: 'border-slate-700 bg-slate-900/40', textC: 'text-slate-300', icon: '🎒' },
    { id: 2, name: '🥈 Informático Nerd', levels: 'Niveles 5 – 9', xp: '2.000 – 8.999 XP', desc: 'Ya te manejas en la terminal. Configuración de equipos, redes intermedias y sistemas operativos. Te empiezas a diferenciar.', cardC: 'border-blue-700/50 bg-blue-900/20', textC: 'text-blue-300', icon: '💻' },
    { id: 3, name: '🥇 Técnico Junior', levels: 'Niveles 10 – 14', xp: '9.000 – 24.999 XP', desc: 'Dominio intermedio probado. Despliegas servicios, configuras VLANs estructuradas y comprendes la arquitectura de red compartmentada.', cardC: 'border-yellow-600/50 bg-yellow-900/20', textC: 'text-yellow-400', icon: '🔧' },
    { id: 4, name: '⚔️ Técnico L3', levels: 'Niveles 15 – 17', xp: '25.000 – 39.999 XP', desc: 'Experto en diagnóstico y resolución de incidencias críticas. Las infraestructuras de producción dependen de tu criterio.', cardC: 'border-orange-600/50 bg-orange-900/20', textC: 'text-orange-400', icon: '⚡' },
    { id: 5, name: '🛡️ Admin Senior', levels: 'Niveles 18 – 19', xp: '40.000 – 49.999 XP', desc: 'Élite de la academia. Gestionas servidores a nivel empresarial y aseguras la red corporativa contra amenazas reales.', cardC: 'border-purple-600/50 bg-purple-900/20', textC: 'text-purple-400', icon: '🔐' },
    { id: 6, name: '👑 SysAdmin Dios', levels: 'Nivel 20+', xp: '50.000+ XP', desc: 'Leyenda absoluta. El sistema te obedece de forma nativa. Tienes acceso root al universo digital de la academia.', cardC: 'border-yellow-400/60 bg-gradient-to-br from-yellow-900/40 to-amber-900/40 shadow-[0_0_25px_rgba(234,179,8,0.15)]', textC: 'text-yellow-200', icon: '⚜️' },
];

const MEDALS = [
    { emoji: '🔩', name: 'Tuerca de Principiante', rarity: 'Común', how: 'Alcanzar nivel 1', rarityC: 'text-slate-400' },
    { emoji: '🌐', name: 'Globo de Red', rarity: 'Común', how: 'Alcanzar nivel 5', rarityC: 'text-slate-400' },
    { emoji: '🏅', name: 'Placa de Técnico', rarity: 'Raro', how: 'Alcanzar nivel 10', rarityC: 'text-blue-400' },
    { emoji: '⚔️', name: 'Espada del Root', rarity: 'Épico', how: 'Alcanzar nivel 15', rarityC: 'text-purple-400' },
    { emoji: '🕵️', name: 'Insignia del Admin', rarity: 'Épico', how: 'Alcanzar nivel 18', rarityC: 'text-purple-400' },
    { emoji: '👑', name: 'Corona del SysAdmin', rarity: 'Legendario', how: 'Alcanzar nivel 20', rarityC: 'text-yellow-400' },
    { emoji: '🔑', name: 'Clave SSH del Root', rarity: 'Legendario', how: 'Ítem de equipo desbloqueado en tienda', rarityC: 'text-yellow-400' },
    { emoji: '🔥', name: 'Firewall Élite', rarity: 'Épico', how: 'Ítem de equipo de nivel 14', rarityC: 'text-purple-400' },
];

const COLOR_MAP = {
    violet: { border: 'border-violet-700/50', bg: 'bg-violet-900/20', text: 'text-violet-400', pill: 'bg-violet-900/30 text-violet-300 border-violet-700/40' },
    green: { border: 'border-green-700/50', bg: 'bg-green-900/20', text: 'text-green-400', pill: 'bg-green-900/30 text-green-300 border-green-700/40' },
    fuchsia: { border: 'border-fuchsia-700/50', bg: 'bg-fuchsia-900/20', text: 'text-fuchsia-400', pill: 'bg-fuchsia-900/30 text-fuchsia-300 border-fuchsia-700/40' },
    purple: { border: 'border-purple-700/50', bg: 'bg-purple-900/20', text: 'text-purple-400', pill: 'bg-purple-900/30 text-purple-300 border-purple-700/40' },
    blue: { border: 'border-blue-700/50', bg: 'bg-blue-900/20', text: 'text-blue-400', pill: 'bg-blue-900/30 text-blue-300 border-blue-700/40' },
    red: { border: 'border-red-700/50', bg: 'bg-red-900/20', text: 'text-red-400', pill: 'bg-red-900/30 text-red-300 border-red-700/40' },
    cyan: { border: 'border-cyan-700/50', bg: 'bg-cyan-900/20', text: 'text-cyan-400', pill: 'bg-cyan-900/30 text-cyan-300 border-cyan-700/40' },
    orange: { border: 'border-orange-700/50', bg: 'bg-orange-900/20', text: 'text-orange-400', pill: 'bg-orange-900/30 text-orange-300 border-orange-700/40' },
    yellow: { border: 'border-yellow-700/50', bg: 'bg-yellow-900/20', text: 'text-yellow-400', pill: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/40' },
    emerald: { border: 'border-emerald-700/50', bg: 'bg-emerald-900/20', text: 'text-emerald-400', pill: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/40' },
    neon: { border: 'border-neon/40', bg: 'bg-neon/10', text: 'text-neon', pill: 'bg-neon/10 text-neon border-neon/30' },
    teal: { border: 'border-teal-700/50', bg: 'bg-teal-900/20', text: 'text-teal-400', pill: 'bg-teal-900/30 text-teal-300 border-teal-700/40' },
    slate: { border: 'border-slate-700/50', bg: 'bg-slate-900/20', text: 'text-slate-400', pill: 'bg-slate-800/60 text-slate-300 border-slate-600/40' },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ExploraAcademia() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const level = user?.level || 1;

    const Section = ({ id, title, icon, color = 'neon', children }) => (
        <section id={id} className="mb-16 scroll-mt-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                <div className={`flex items-center gap-3 px-5 py-2 rounded-full border ${COLOR_MAP[color].border} ${COLOR_MAP[color].bg}`}>
                    <span className={COLOR_MAP[color].text}>{icon}</span>
                    <h2 className={`font-black font-mono uppercase tracking-[0.2em] text-sm ${COLOR_MAP[color].text}`}>{title}</h2>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>
            {children}
        </section>
    );

    return (
        <div className="flex min-h-screen bg-[#080810] text-white selection:bg-neon selection:text-black">
            {/* Ambient */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-neon/3 blur-[180px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-blue-500/4 blur-[150px] rounded-full" />
            </div>

            <Sidebar />

            <main className="flex-1 ml-60 min-h-screen">
                <div className="px-10 pt-10">
                    <PageHeader
                        title="Explora"
                        subtitle="Tu guía completa de Tech4U // Protocolo de Reconocimiento"
                        Icon={Compass}
                    />
                </div>

                <div className="px-10 py-10 max-w-6xl mx-auto">

                    {/* ── HERO ── */}
                    <div className="relative rounded-3xl overflow-hidden border border-white/5 mb-16">
                        <div className="absolute inset-0 bg-gradient-to-br from-neon/8 via-blue-900/10 to-purple-900/10" />
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neon/40 to-transparent" />
                        <div className="relative px-10 py-14 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon/10 border border-neon/20 mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
                                <span className="text-[10px] font-mono text-neon uppercase tracking-[0.3em] font-bold">Guía completa · Tech4U Academy</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 leading-tight">
                                <span className="text-white">Todo lo que puedes</span><br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon via-cyan-300 to-blue-400">hacer en la academia</span>
                            </h1>
                            <p className="text-slate-400 font-mono text-base max-w-2xl mx-auto leading-relaxed">
                                Esta guía te explica <span className="text-white font-bold">absolutamente todo</span>: secciones, modos de estudio, el sistema RPG de progresión, rangos, XP, rachas, escudos, medallas y mucho más. Léela con calma y aprovecha cada herramienta.
                            </p>
                        </div>
                    </div>

                    {/* ── NAVEGACIÓN INTERNA ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
                        {[
                            { href: '#secciones', label: '🗂️ Secciones', color: 'border-white/10 hover:border-neon/30' },
                            { href: '#test-center', label: '🎯 Test Center', color: 'border-white/10 hover:border-green-500/30' },
                            { href: '#xp-system', label: '⚡ Sistema XP', color: 'border-white/10 hover:border-neon/30' },
                            { href: '#rachas', label: '🔥 Rachas', color: 'border-white/10 hover:border-orange-500/30' },
                            { href: '#escudos', label: '🛡️ Escudos', color: 'border-white/10 hover:border-blue-500/30' },
                            { href: '#ligas', label: '🏆 Ligas', color: 'border-white/10 hover:border-yellow-500/30' },
                            { href: '#personaje', label: '🧙 Personaje', color: 'border-white/10 hover:border-purple-500/30' },
                            { href: '#medallas', label: '🏅 Medallas', color: 'border-white/10 hover:border-amber-500/30' },
                        ].map(({ href, label, color }) => (
                            <a key={href} href={href} className={`block text-center py-3 px-4 rounded-xl border bg-black/30 font-mono text-xs text-slate-300 hover:text-white transition-all ${color}`}>
                                {label}
                            </a>
                        ))}
                    </div>

                    {/* ── SECCIONES ── */}
                    <Section id="secciones" title="Todas las Secciones" icon={<Map className="w-4 h-4" />} color="violet">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {SECTIONS.map((s) => {
                                const c = COLOR_MAP[s.color] || COLOR_MAP.slate;
                                return (
                                    <div key={s.id} className={`rounded-2xl border p-6 ${c.border} ${c.bg} group relative overflow-hidden hover:scale-[1.01] transition-all`}>
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => navigate(s.path)} className={`text-[10px] font-mono px-2 py-1 rounded border inline-flex items-center gap-1 ${c.pill}`}>
                                                Ir <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-3xl">{s.emoji}</span>
                                            <div>
                                                <h3 className={`font-black text-base ${c.text}`}>{s.label}</h3>
                                                <p className="text-xs font-mono text-slate-500">{s.headline}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-mono text-slate-300 leading-relaxed">{s.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>

                    {/* ── TEST CENTER ── */}
                    <Section id="test-center" title="Modos de Test" icon={<Target className="w-4 h-4" />} color="green">
                        <div className="mb-6 p-4 rounded-xl border border-neon/25 bg-neon/5 flex items-start gap-3">
                            <Zap className="w-5 h-5 text-neon shrink-0 mt-0.5" />
                            <p className="text-sm font-mono text-neon leading-relaxed">
                                <span className="font-black">Regla de XP:</span> Solo el <span className="font-black">Modo Examen con 40 preguntas</span> otorga experiencia. El resto de modos te entrena pero no modifica tu nivel.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {TEST_MODES.map((m) => {
                                const isXP = m.color === 'neon';
                                return (
                                    <div key={m.name} className={`rounded-2xl border p-6 relative overflow-hidden ${isXP ? 'border-neon/40 bg-neon/5 shadow-[0_0_20px_rgba(0,255,136,0.05)]' : 'border-white/5 bg-black/20'}`}>
                                        {isXP && <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-neon/60 to-transparent" />}
                                        <div className="flex items-center gap-3 mb-3">
                                            {m.icon}
                                            <h3 className="font-black text-base text-white">{m.name}</h3>
                                        </div>
                                        <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded border inline-block mb-3 ${m.badgeC}`}>{m.badge}</span>
                                        <p className="text-sm font-mono text-slate-400 leading-relaxed">{m.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>

                    {/* ── XP SYSTEM ── */}
                    <Section id="xp-system" title="Sistema de XP" icon={<Zap className="w-4 h-4" />} color="neon">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-black text-white text-lg mb-4">¿Cómo se calcula el XP?</h3>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-6">
                                    Solo el <span className="text-neon font-bold">Modo Examen con exactamente 40 preguntas</span> otorga XP. La cantidad de XP que recibes depende del porcentaje de aciertos:
                                </p>
                                <div className="rounded-xl border border-white/5 overflow-hidden">
                                    <div className="bg-black/40 px-4 py-2 border-b border-white/5">
                                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Tabla de recompensas</span>
                                    </div>
                                    {XP_TABLE.map((row, i) => (
                                        <div key={i} className={`flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-b-0 ${i === 0 ? 'bg-neon/5' : ''}`}>
                                            <span className="font-mono text-sm text-slate-300">{row.score}</span>
                                            <span className={`font-black font-mono text-sm ${i === 0 ? 'text-neon' : i === 3 ? 'text-slate-500' : 'text-white'}`}>{row.xp}</span>
                                            <span className={`text-xs font-mono ${i === 0 ? 'text-neon' : i === 3 ? 'text-slate-600' : 'text-slate-400'}`}>{row.note}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-black text-white text-lg mb-4">¿Para qué sirve el XP?</h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: '📈', text: 'Cada vez que acumulas suficiente XP, subes de nivel automáticamente.' },
                                        { icon: '🏆', text: 'Tu nivel determina tu posición en el Ranking global de alumnos.' },
                                        { icon: '🎖️', text: 'Al alcanzar ciertos niveles, cambia tu Liga y desbloqueas nuevas medallas.' },
                                        { icon: '🧙', text: 'Tu nivel se refleja en tu perfil de personaje con estadísticas y equipo únicos.' },
                                        { icon: '🔥', text: 'Combinar una buena racha con exámenes de alto porcentaje es la forma más eficiente de subir.' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-black/20">
                                            <span className="text-xl shrink-0">{item.icon}</span>
                                            <p className="text-sm font-mono text-slate-300 leading-relaxed">{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* ── RACHAS ── */}
                    <Section id="rachas" title="Sistema de Rachas" icon={<Flame className="w-4 h-4" />} color="orange">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-black text-white text-lg mb-3">¿Qué es una racha?</h3>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-5">
                                    La racha mide cuántos <span className="text-orange-400 font-bold">días consecutivos</span> te has conectado a la academia. Cada vez que inicias sesión un día nuevo, tu racha sube en +1. Si te conectas el mismo día dos veces, no cuenta doble.
                                </p>
                                <div className="space-y-3">
                                    {[
                                        { icon: '🔥', color: 'text-orange-400', title: 'Racha activa', desc: 'Si te conectas al día siguiente de tu última sesión, la racha sube.' },
                                        { icon: '⏸️', color: 'text-slate-400', title: 'Misma sesión', desc: 'Conectarse el mismo día no suma ni resta. La racha permanece igual.' },
                                        { icon: '💀', color: 'text-red-400', title: 'Racha rota', desc: 'Si pasan más de 24h sin conectarte y no tienes escudos, tu racha se reinicia a 1 y pierdes 100 XP.' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-black/20">
                                            <span className={`text-xl shrink-0 ${item.color}`}>{item.icon}</span>
                                            <div>
                                                <p className={`font-black text-sm ${item.color} mb-0.5`}>{item.title}</p>
                                                <p className="text-xs font-mono text-slate-400">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-black text-white text-lg mb-3">Penalización por racha rota</h3>
                                <div className="p-4 rounded-xl border border-red-800/40 bg-red-950/20 mb-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldOff className="w-4 h-4 text-red-400" />
                                        <span className="font-black text-red-400 text-sm">Sin escudos disponibles</span>
                                    </div>
                                    <ul className="space-y-1.5 font-mono text-xs text-slate-300">
                                        <li>🔴 Tu racha se reinicia a <strong>1</strong></li>
                                        <li>🔴 Pierdes <strong>100 XP</strong> de tu total acumulado</li>
                                        <li>🔴 Si tenías 0 XP, permanece en 0 (no va a negativo)</li>
                                    </ul>
                                </div>
                                <h3 className="font-black text-white text-lg mb-3">La importancia de la racha</h3>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed">
                                    Mantener una racha alta demuestra constancia y disciplina. En el Ranking y en tu perfil de personaje la racha es visible, y forma parte de tu identidad como alumno. Las rachas largas son señal de dedicación real.
                                </p>
                            </div>
                        </div>
                    </Section>

                    {/* ── ESCUDOS ── */}
                    <Section id="escudos" title="Escudos de Protección" icon={<ShieldCheck className="w-4 h-4" />} color="blue">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div>
                                <h3 className="font-black text-white text-lg mb-3">¿Qué son los escudos?</h3>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-5">
                                    Los escudos de protección son un mecanismo de seguridad que <span className="text-blue-300 font-bold">protege tu racha</span> si un día no puedes conectarte. Cada escudo activo absorbe un día de ausencia sin que pierdas tu racha ni tus 100 XP.
                                </p>
                                <div className="p-5 rounded-2xl border border-blue-700/40 bg-blue-900/20">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Shield className="w-5 h-5 text-blue-400" />
                                        <span className="font-black text-blue-400">Cómo funcionan</span>
                                    </div>
                                    <div className="space-y-3 font-mono text-sm">
                                        <div className="flex items-start gap-3">
                                            <span className="text-blue-400 font-black shrink-0">01.</span>
                                            <p className="text-slate-300">Si llevas un día sin conectarte y tienes escudos, el sistema consume <strong>1 escudo</strong> automáticamente.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="text-blue-400 font-black shrink-0">02.</span>
                                            <p className="text-slate-300">Tu racha se <strong>conserva íntegra</strong> como si hubieras entrado ese día.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="text-blue-400 font-black shrink-0">03.</span>
                                            <p className="text-slate-300">No pierdes XP. No se penaliza de ninguna forma.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="text-blue-400 font-black shrink-0">04.</span>
                                            <p className="text-slate-300">Si no tienes escudos, la racha se rompe y pierdes 100 XP.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-black text-white text-lg mb-3">¿Cómo conseguir escudos?</h3>
                                <div className="space-y-3 mb-6">
                                    {[
                                        { icon: '🎁', text: 'Los alumnos premium reciben escudos de bonificación al activar su suscripción.' },
                                        { icon: '🛒', text: 'Próximamente disponibles en la Academy Shop como ítem de protección.' },
                                        { icon: '⭐', text: 'Eventos especiales de la academia pueden recompensar escudos a los participantes.' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-black/20">
                                            <span className="text-xl shrink-0">{item.icon}</span>
                                            <p className="text-sm font-mono text-slate-300 leading-relaxed">{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border border-white/5 rounded-xl bg-black/30 text-center">
                                    <div className="flex justify-center gap-2 mb-2">
                                        {[...Array(3)].map((_, i) => (
                                            <Shield key={i} className="w-7 h-7 text-blue-400" />
                                        ))}
                                        {[...Array(1)].map((_, i) => (
                                            <Shield key={i} className="w-7 h-7 text-slate-700" />
                                        ))}
                                    </div>
                                    <p className="text-xs font-mono text-slate-500">Ejemplo: 3 escudos activos de 4 máximos</p>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* ── LIGAS Y RANGOS ── */}
                    <Section id="ligas" title="Las 6 Ligas de Progresión" icon={<Trophy className="w-4 h-4" />} color="yellow">
                        <p className="text-slate-400 font-mono text-sm leading-relaxed mb-8 max-w-3xl">
                            Tu nivel determina tu <span className="text-white font-bold">Liga</span>. Las ligas son grupos de niveles que representan tu dominio global de la administración de sistemas ASIR. Hay 20 niveles en total, agrupados en 6 ligas.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {RANKS.map((rank) => (
                                <div key={rank.id} className={`rounded-2xl border p-6 relative overflow-hidden hover:scale-[1.02] transition-all group ${rank.cardC}`}>
                                    <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                        <span className="text-6xl">{rank.icon}</span>
                                    </div>
                                    <h3 className={`font-black text-xl mb-2 ${rank.textC}`}>{rank.name}</h3>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-xs font-mono px-2 py-1 rounded bg-black/40 border border-white/10 text-white">{rank.levels}</span>
                                        <span className="text-xs font-mono text-slate-500">{rank.xp}</span>
                                    </div>
                                    <p className="text-sm font-mono text-slate-300 leading-relaxed">{rank.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Level → XP table */}
                        <div className="mt-10">
                            <h3 className="font-black text-white text-base mb-5 flex items-center gap-2">
                                <BarChart2 className="w-4 h-4 text-yellow-400" /> Tabla completa de niveles y XP
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-2 mb-8">
                                {[
                                    { lv: 1, xp: '0', tag: 'Estudiante ASIR', c: 'border-slate-700 bg-slate-900/30 text-slate-400' },
                                    { lv: 2, xp: '500', tag: 'Estudiante ASIR', c: 'border-slate-700 bg-slate-900/30 text-slate-400' },
                                    { lv: 3, xp: '1.000', tag: 'Estudiante ASIR', c: 'border-slate-700 bg-slate-900/30 text-slate-400' },
                                    { lv: 4, xp: '1.500', tag: 'Estudiante ASIR', c: 'border-slate-700 bg-slate-900/30 text-slate-400' },
                                    { lv: 5, xp: '2.000', tag: 'Inf. Nerd', c: 'border-blue-700/40 bg-blue-900/20 text-blue-400' },
                                    { lv: 6, xp: '3.000', tag: 'Inf. Nerd', c: 'border-blue-700/40 bg-blue-900/20 text-blue-400' },
                                    { lv: 7, xp: '4.000', tag: 'Inf. Nerd', c: 'border-blue-700/40 bg-blue-900/20 text-blue-400' },
                                    { lv: 8, xp: '5.000', tag: 'Inf. Nerd', c: 'border-blue-700/40 bg-blue-900/20 text-blue-400' },
                                    { lv: 9, xp: '7.000', tag: 'Inf. Nerd', c: 'border-blue-700/40 bg-blue-900/20 text-blue-400' },
                                    { lv: 10, xp: '9.000', tag: 'Téc. Junior', c: 'border-yellow-600/40 bg-yellow-900/20 text-yellow-400' },
                                    { lv: 11, xp: '12.000', tag: 'Téc. Junior', c: 'border-yellow-600/40 bg-yellow-900/20 text-yellow-400' },
                                    { lv: 12, xp: '15.000', tag: 'Téc. Junior', c: 'border-yellow-600/40 bg-yellow-900/20 text-yellow-400' },
                                    { lv: 13, xp: '18.000', tag: 'Téc. Junior', c: 'border-yellow-600/40 bg-yellow-900/20 text-yellow-400' },
                                    { lv: 14, xp: '21.000', tag: 'Téc. Junior', c: 'border-yellow-600/40 bg-yellow-900/20 text-yellow-400' },
                                    { lv: 15, xp: '25.000', tag: 'Téc. L3', c: 'border-orange-600/40 bg-orange-900/20 text-orange-400' },
                                    { lv: 16, xp: '30.000', tag: 'Téc. L3', c: 'border-orange-600/40 bg-orange-900/20 text-orange-400' },
                                    { lv: 17, xp: '35.000', tag: 'Téc. L3', c: 'border-orange-600/40 bg-orange-900/20 text-orange-400' },
                                    { lv: 18, xp: '40.000', tag: 'Admin Senior', c: 'border-purple-600/40 bg-purple-900/20 text-purple-400' },
                                    { lv: 19, xp: '45.000', tag: 'Admin Senior', c: 'border-purple-600/40 bg-purple-900/20 text-purple-400' },
                                    { lv: 20, xp: '50.000', tag: 'SysAdmin Dios', c: 'border-yellow-400/50 bg-yellow-900/30 text-yellow-300' },
                                ].map(({ lv, xp, tag, c }) => (
                                    <div key={lv} className={`rounded-xl border p-3 text-center transition-all hover:scale-105 ${c}`}>
                                        <div className="font-black font-mono text-lg mb-0.5">Lv.{lv}</div>
                                        <div className="text-[10px] font-mono text-slate-500">{xp} XP</div>
                                        <div className="text-[9px] font-mono mt-1 opacity-70">{tag}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Mini Character Gallery Section */}
                            <div className="p-6 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md">
                                <h4 className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <Layers className="w-3 h-3" /> Previsualización de evolución de personaje
                                </h4>
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                                    {Object.entries(PJ_ASSETS).map(([lvl, img]) => {
                                        const isCurrent = level === parseInt(lvl);
                                        const isUnlocked = level >= parseInt(lvl);
                                        return (
                                            <div
                                                key={lvl}
                                                className={`relative aspect-square rounded-lg border flex items-center justify-center p-1 group transition-all
                                                    ${isCurrent ? 'border-neon bg-neon/10 ring-1 ring-neon/40' :
                                                        isUnlocked ? 'border-white/20 bg-white/5' :
                                                            'border-white/5 bg-black/60 grayscale opacity-40'}`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`PJ ${lvl}`}
                                                    className={`w-full h-full object-contain ${isCurrent ? 'animate-pulse' : ''}`}
                                                />
                                                <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-black border border-white/10 text-[7px] font-bold font-mono text-white pointer-events-none">
                                                    {lvl}
                                                </div>

                                                {/* Tooltip hint on hover */}
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/90 border border-white/10 text-[7px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none uppercase tracking-tighter">
                                                    Nivel {lvl} {isCurrent ? '(Actual)' : !isUnlocked ? '(Bloqueado)' : ''}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* ── PERSONAJE ── */}
                    <Section id="personaje" title="Tu Personaje RPG" icon={<Star className="w-4 h-4" />} color="purple">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-black text-white text-lg mb-3">Estadísticas por módulo</h3>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-5">
                                    Tu personaje tiene <span className="text-white font-bold">6 estadísticas técnicas</span> que reflejan tu rendimiento en cada módulo ASIR. Se calculan en base a tus aciertos históricos en tests de cada asignatura.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { stat: 'HW', name: 'Fundamentos Hardware', color: 'text-orange-400', bg: 'bg-orange-900/20 border-orange-700/40' },
                                        { stat: 'OS', name: 'Sistemas Operativos', color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-700/40' },
                                        { stat: 'NET', name: 'Redes Locales', color: 'text-sky-400', bg: 'bg-sky-900/20 border-sky-700/40' },
                                        { stat: 'SQL', name: 'Bases de Datos', color: 'text-violet-400', bg: 'bg-violet-900/20 border-violet-700/40' },
                                        { stat: 'WEB', name: 'Lenguaje de Marcas', color: 'text-cyan-400', bg: 'bg-cyan-900/20 border-cyan-700/40' },
                                        { stat: 'SEC', name: 'Ciberseguridad', color: 'text-red-400', bg: 'bg-red-900/20 border-red-700/40' },
                                    ].map((s) => (
                                        <div key={s.stat} className={`rounded-xl border p-3 ${s.bg}`}>
                                            <span className={`font-black font-mono text-sm ${s.color}`}>{s.stat}</span>
                                            <p className="text-[10px] font-mono text-slate-400 leading-tight mt-0.5">{s.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-black text-white text-lg mb-3">Equipo del personaje</h3>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-5">
                                    Tu personaje tiene <span className="text-white font-bold">4 ranuras de equipo</span>: Arma, Armadura, Defensa y Accesorio. Los ítems se desbloquean en la tienda (Academy Shop) o se obtienen al alcanzar ciertos hitos de nivel.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { slot: 'Arma', emoji: '⌨️', example: 'Teclado Mecánico' },
                                        { slot: 'Armadura', emoji: '🧥', example: 'Sudadera Hack' },
                                        { slot: 'Defensa', emoji: '🕶️', example: 'Gafas Filtro Azul' },
                                        { slot: 'Accesorio', emoji: '💾', example: 'Pendrive Booteable' },
                                    ].map((s) => (
                                        <div key={s.slot} className="rounded-xl border border-white/5 bg-black/30 p-4 text-center">
                                            <span className="text-3xl block mb-1">{s.emoji}</span>
                                            <p className="font-black text-xs text-slate-400 uppercase tracking-widest">{s.slot}</p>
                                            <p className="text-[10px] font-mono text-slate-600 mt-0.5">{s.example}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 rounded-xl border border-white/5 bg-black/20 text-center">
                                    <button onClick={() => navigate('/personaje')} className="text-xs font-black font-mono text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1">
                                        Ver mi personaje <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* ── MEDALLAS ── */}
                    <Section id="medallas" title="Medallas y Logros" icon={<Award className="w-4 h-4" />} color="orange">
                        <p className="text-slate-400 font-mono text-sm leading-relaxed mb-8 max-w-3xl">
                            Las medallas son reconocimientos que se desbloquean automáticamente al alcanzar ciertos hitos. Aparecen en tu perfil de personaje y demuestran tus logros de forma permanente.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {MEDALS.map((m) => (
                                <div key={m.name} className="rounded-xl border border-white/5 bg-black/20 p-4 text-center hover:bg-white/3 transition-colors">
                                    <span className="text-4xl block mb-2">{m.emoji}</span>
                                    <p className="font-black text-sm text-white mb-1">{m.name}</p>
                                    <span className={`text-[10px] font-mono font-bold uppercase ${m.rarityC}`}>{m.rarity}</span>
                                    <p className="text-[10px] font-mono text-slate-500 mt-2 leading-tight">{m.how}</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl border border-white/5 bg-black/20 overflow-hidden">
                            <div className="bg-black/40 px-5 py-3 border-b border-white/5">
                                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Clasificación de rareza</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
                                {[
                                    { name: 'Común', color: 'text-slate-400', desc: 'Alcanzarlos es cuestión de tiempo y constancia.' },
                                    { name: 'Raro', color: 'text-blue-400', desc: 'Requieren dedicación y progresión sostenida.' },
                                    { name: 'Épico', color: 'text-purple-400', desc: 'Solo los alumnos más comprometidos los logran.' },
                                    { name: 'Legendario', color: 'text-yellow-400', desc: 'Los hitos máximos de la academia. Pocos los alcanzan.' },
                                ].map((r) => (
                                    <div key={r.name} className="p-4 text-center">
                                        <p className={`font-black text-sm mb-1 ${r.color}`}>{r.name}</p>
                                        <p className="text-[10px] font-mono text-slate-500 leading-tight">{r.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>

                    {/* ── CTA ── */}
                    <div className="relative rounded-3xl overflow-hidden border border-neon/20 text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-neon/8 via-transparent to-blue-900/10" />
                        <div className="relative px-10 py-12">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-3">¿Listo para subir de nivel?</h2>
                            <p className="text-slate-400 font-mono text-sm mb-8 max-w-xl mx-auto">Ya conoces todo lo que tiene la academia. Ahora solo queda una cosa: hacer el primer examen de 40 preguntas y empezar a sumar XP.</p>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <button onClick={() => navigate('/tests')} className="px-8 py-3 bg-neon text-black font-black uppercase tracking-widest rounded-xl text-sm hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,255,136,0.2)] hover:shadow-[0_0_40px_rgba(0,255,136,0.4)]">
                                    Ir al Test Center ⚡
                                </button>
                                <button onClick={() => navigate('/personaje')} className="px-8 py-3 border border-white/10 text-slate-300 font-black uppercase tracking-widest rounded-xl text-sm hover:bg-white/5 hover:text-white transition-all">
                                    Ver mi personaje →
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="h-16" />
                </div>
            </main>
        </div>
    );
}
