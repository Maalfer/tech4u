import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useSEO } from '../hooks/useSEO';
import Sidebar from '../components/Sidebar';
import logo from '../assets/tech4u_logo.png';
import {
    Zap, BookOpen, FlaskConical, Layers, Trophy, Shield,
    Star, BarChart2, CreditCard, Play, Wrench, Globe2,
    Swords, MessageSquare, ChevronRight, Flame, Lock,
    ShieldCheck, ShieldOff, Award, Hammer, Target, AlertTriangle,
    Map, Compass, Terminal, TrendingUp, Database, Network, Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ToolCoverComponent } from '../components/ToolCovers';

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
        Icon: Map,
        accent: '#8b5cf6',
        accentRgb: '139,92,246',
        color: 'violet',
        label: 'Dashboard',
        path: '/dashboard',
        headline: 'Tu centro de mando RPG',
        desc: 'El Dashboard es tu página de inicio dentro de la academia. Verás tus KPIs en tiempo real: nivel actual, XP acumulado, racha de conexión diaria, tests realizados hoy, y estadísticas globales por módulo. Es el punto de partida de cada sesión.'
    },
    {
        id: 'tests',
        Icon: Target,
        accent: '#22c55e',
        accentRgb: '34,197,94',
        color: 'green',
        label: 'Test Center',
        path: '/tests',
        headline: 'El corazón del aprendizaje',
        desc: 'El Test Center es donde practicas y te examinas. Tienes varias modalidades disponibles, cada una con un propósito diferente.'
    },
    {
        id: 'skilllabs',
        Icon: FlaskConical,
        accent: '#e879f9',
        accentRgb: '232,121,249',
        color: 'fuchsia',
        label: 'Skill Labs',
        path: '/skill-labs',
        headline: 'Aprende haciendo, no memorizando',
        desc: 'Skill Labs son ejercicios interactivos de tipo drag & drop. Tienes fragmentos de comandos, conceptos o configuraciones, y debes arrastrarlos al lugar correcto para completar el enunciado. Tienes 3 intentos por ejercicio antes de ver la solución. Están organizados por asignatura ASIR.'
    },
    {
        id: 'flashcards',
        Icon: CreditCard,
        accent: '#a855f7',
        accentRgb: '168,85,247',
        color: 'purple',
        label: 'Flashcards',
        path: '/flashcards',
        headline: 'Repaso rápido visual',
        desc: 'Las Flashcards son tarjetas interactivas para repasar conceptos clave. Voltea la tarjeta, evalúa tu conocimiento y continúa. Ideales para repasar antes de un examen o para fijar términos técnicos en pocos minutos.'
    },
    {
        id: 'recursos',
        Icon: Layers,
        accent: '#3b82f6',
        accentRgb: '59,130,246',
        color: 'blue',
        label: 'Recursos',
        path: '/resources',
        headline: 'Documentación y materiales ASIR',
        desc: 'La sección de Recursos contiene apuntes, esquemas, PDFs y material de referencia organizado por módulo ASIR. Puedes visualizarlos directamente en la academia o descargarlos.'
    },
    {
        id: 'netlabs',
        Icon: Network,
        accent: '#14b8a6',
        accentRgb: '20,184,166',
        color: 'teal',
        label: 'NetLabs',
        path: '/skill-labs',
        headline: 'Laboratorios de red virtuales',
        desc: 'NetLabs son ejercicios interactivos especializados en redes locales. Practica la configuración de VLANs, enrutamiento, subredes y protocolos de red con drag & drop avanzado. El entrenamiento definitivo para el módulo de Redes de ASIR.'
    },
    {
        id: 'sql-skills',
        Icon: Database,
        accent: '#8b5cf6',
        accentRgb: '139,92,246',
        color: 'violet',
        label: 'SQL Skills',
        path: '/skill-labs',
        headline: 'Domina el lenguaje de bases de datos',
        desc: 'SQL Skills son ejercicios interactivos centrados en consultas SQL y diseño de bases de datos. SELECT, JOINs, DDL, DML... Construye sentencias reales mediante drag & drop orientado al módulo de Bases de Datos de ASIR.'
    },
    {
        id: 'winlabs',
        Icon: Server,
        accent: '#3b82f6',
        accentRgb: '59,130,246',
        color: 'blue',
        label: 'Windows Server',
        path: '/winlabs',
        headline: 'Laboratorios Windows Server',
        desc: 'Instala AD DS, configura GPOs, DHCP, DNS, Hyper-V y PowerShell con laboratorios paso a paso y terminal interactivo.'
    },
    {
        id: 'terminal-skills',
        Icon: Terminal,
        accent: '#10b981',
        accentRgb: '16,185,129',
        color: 'emerald',
        label: 'Terminal Skills',
        path: '/skill-labs',
        headline: 'Entrenamiento técnico puro',
        desc: 'Entorno de terminal interactivo para dominar comandos Linux, gestión de almacenamiento, redes y despliegue de servicios en tiempo real.'
    },
    {
        id: 'herramientas',
        Icon: Wrench,
        accent: '#f97316',
        accentRgb: '249,115,22',
        color: 'orange',
        label: 'Herramientas',
        path: '/tools',
        headline: 'Utilidades técnicas para el día a día',
        desc: 'La sección de Herramientas incluye utilidades prácticas de sysadmin: calculadora de subredes IP, conversor de máscaras, tablas de referencia y más. Recursos que usarás tanto en la academia como en el mundo real.'
    },
    {
        id: 'ranking',
        Icon: Trophy,
        accent: '#eab308',
        accentRgb: '234,179,8',
        color: 'yellow',
        label: 'Ranking',
        path: '/leaderboard',
        headline: 'Mide tu progreso frente al resto',
        desc: 'El Ranking muestra la tabla de clasificación global de todos los alumnos, ordenada por nivel y XP. Tu posición se actualiza en tiempo real cada vez que subes de nivel. ¿Puedes llegar al top 3?'
    },
    {
        id: 'personaje',
        Icon: Star,
        accent: '#3b82f6',
        accentRgb: '59,130,246',
        color: 'blue',
        label: 'Mi Personaje',
        path: '/personaje',
        headline: 'Tu hoja de personaje RPG',
        desc: 'Mi Personaje es tu perfil gamificado completo. Muestra tu nivel, rango, XP, racha diaria, estadísticas por módulo ASIR (HW, OS, Redes, SQL, WEB, Cyber), equipamiento desbloqueado y medallas obtenidas. Es la representación completa de tu progreso.'
    },
    {
        id: 'incidencias',
        Icon: MessageSquare,
        accent: '#64748b',
        accentRgb: '100,116,139',
        color: 'slate',
        label: 'Soporte / Incidencias',
        path: '/dashboard',
        headline: 'Canal directo con el equipo docente',
        desc: 'Desde el Dashboard puedes abrir tickets de soporte para reportar errores en preguntas, proponer mejoras o contactar con el equipo técnico. Los tickets son gestionados directamente por los administradores de la academia.'
    },
];

const TEST_MODES = [
    {
        id: 'tests',
        icon: <BookOpen className="w-6 h-6 text-green-400" />,
        color: 'green',
        name: 'Práctica Libre',
        badge: 'Sin XP',
        badgeC: 'bg-slate-800 text-slate-400 border-slate-600',
        desc: 'Entrena sin presión. Elige entre 10, 20 ó 40 preguntas de cualquier módulo ASIR. No hay límite de tiempo. No otorga XP, pero es la forma perfecta de repasar y detectar puntos débiles.'
    },
    {
        id: 'tests',
        icon: <Target className="w-6 h-6 text-neon" />,
        color: 'neon',
        name: 'Modo Examen',
        badge: '⚡ Otorga XP',
        badgeC: 'bg-neon/20 text-neon border-neon/40',
        desc: 'Este modo premia con XP. Exactamente 60 preguntas, temario mixto, modo cronometrado. Está diseñado para simular las condiciones reales del examen oficial de ASIR. Cada examen realizado suma experiencia a tu personaje, tanto si apruebas como si suspendes.'
    },
    {
        id: 'tests',
        icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
        color: 'orange',
        name: 'Sala de Errores',
        badge: 'Sin XP',
        badgeC: 'bg-slate-800 text-slate-400 border-slate-600',
        desc: 'El sistema lleva un registro de cada respuesta incorrecta que hayas dado. La Sala de Errores genera un test personalizado solo con tus fallos históricos. La forma más eficiente de convertir debilidades en fortalezas.'
    },
    {
        id: 'flashcards',
        icon: <Award className="w-6 h-6 text-purple-400" />,
        color: 'purple',
        name: 'Flashcards',
        badge: 'Sin XP',
        badgeC: 'bg-slate-800 text-slate-400 border-slate-600',
        desc: 'Tarjetas interactivas de repaso. Voltéalas, valora tu conocimiento y continúa. No otorgan XP pero son ideales para memorizar terminología técnica ASIR de forma rápida.'
    },
    {
        id: 'skilllabs',
        icon: <Hammer className="w-6 h-6 text-fuchsia-400" />,
        color: 'fuchsia',
        name: 'Skill Labs',
        badge: 'Sin XP',
        badgeC: 'bg-slate-800 text-slate-400 border-slate-600',
        desc: 'Ejercicios de drag & drop donde ensamblas comandos y conceptos reales. 3 intentos por ejercicio y feedback inmediato. Orientado a la práctica real de administración de sistemas.'
    },
];

const XP_TABLE = [
    { score: '≥ 90%', xp: '+80 XP', note: 'Excelente', pct: 100, color: 'bg-neon', textC: 'text-neon' },
    { score: '≥ 70%', xp: '+50 XP', note: 'Aprobado', pct: 63, color: 'bg-cyan-400', textC: 'text-cyan-400' },
    { score: '≥ 50%', xp: '+25 XP', note: 'Suficiente', pct: 31, color: 'bg-blue-400', textC: 'text-blue-400' },
    { score: '< 50%', xp: '+0 XP', note: 'Suspendido', pct: 0, color: 'bg-slate-700', textC: 'text-slate-500' },
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

// ── WindowPreview component ──────────────────────────────────────────────────
function WindowPreview({ title, icon, color = 'neon', children, toolId }) {
    const c = COLOR_MAP[color] || COLOR_MAP.slate;
    return (
        <div className={`rounded-2xl border ${c.border} bg-black/40 overflow-hidden group shadow-2xl relative`}>
            {/* Header */}
            <div className={`px-4 py-3 border-b ${c.border} bg-white/5 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    </div>
                    <div className="h-4 w-px bg-white/10 mx-1" />
                    <div className="flex items-center gap-2">
                        <span className={c.text}>{icon}</span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">{title}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 opacity-40">
                    <div className="w-12 h-1.5 rounded-full bg-white/10" />
                </div>
            </div>
            
            {/* Content Area */}
            <div className="aspect-video relative overflow-hidden bg-[#050505]">
                {toolId ? (
                    <ToolCoverComponent toolId={toolId} />
                ) : (
                    children
                )}
                
                {/* Overlay gloss */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/[0.02] to-white/[0.1]" />
            </div>
        </div>
    );
}

// ── Section component (MUST be outside the main component to avoid remount on re-render) ──
function Section({ id, title, icon, color = 'neon', children }) {
    return (
        <section id={id} className="mb-16 scroll-mt-8 explora-reveal">
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
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function ExploraHero() {
    return (
        <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/8"
             style={{ background: 'linear-gradient(135deg, #050312 0%, #090624 40%, #040212 100%)' }}>
            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.07]"
                 style={{
                     backgroundImage: `linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)`,
                     backgroundSize: '42px 42px'
                 }} />

            {/* Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-72 rounded-full opacity-20 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.45) 0%, transparent 70%)', filter: 'blur(50px)' }} />
            <div className="absolute top-0 right-1/4 w-80 h-52 rounded-full opacity-15 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.35) 0%, transparent 70%)', filter: 'blur(55px)' }} />
            <div className="absolute bottom-0 left-1/3 w-96 h-48 rounded-full opacity-10 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(198,255,51,0.25) 0%, transparent 70%)', filter: 'blur(60px)' }} />

            {/* Bottom edge */}
            <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                 style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)' }} />

            <div className="relative z-10 px-10 pt-12 pb-11">
                {/* Badge row */}
                <div className="flex items-center gap-3 mb-7 flex-wrap">
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-sm"
                         style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.08)' }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#8b5cf6' }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#8b5cf6' }}>
                            Guía Completa · Tech4U Academy
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                        <Compass size={10} style={{ color: '#06b6d4' }} />
                        <span className="text-[10px] font-mono text-slate-500">Protocolo de Reconocimiento · Sistema Alpha</span>
                    </div>
                </div>

                {/* Headline */}
                <div className="mb-7">
                    <h1 className="text-6xl font-black tracking-tight leading-none mb-4">
                        <span className="text-white">Explora</span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 50%, #c6ff33 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            la Academia
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                        Tu guía completa de todo lo que puedes hacer en Tech4U.{' '}
                        <span className="text-slate-300 font-medium">Secciones, modos de estudio, XP, rangos y mucho más.</span>
                    </p>
                </div>

                {/* Stats pills */}
                <div className="flex items-center gap-3 flex-wrap">
                    {[
                        { label: 'Secciones', value: '13+', color: '#8b5cf6' },
                        { label: 'Modos de Test', value: '5', color: '#06b6d4' },
                        { label: 'Niveles', value: '20', color: '#c6ff33' },
                        { label: 'Ligas', value: '6', color: '#f59e0b' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03]">
                            <span className="text-xl font-black" style={{ color }}>{value}</span>
                            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ExploraAcademia() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [scrollPct, setScrollPct] = useState(0);
    const [activeSection, setActiveSection] = useState('secciones');

    useSEO({
        title: 'Explora la Academia · Tech4U Academy',
        description: 'Descubre todas las funcionalidades de Tech4U Academy: laboratorios Linux, SQL Skills Path, NetLabs de redes, Battle Arena, sistema de niveles y certificaciones. La plataforma premium para ASIR y SMR.',
        path: '/explora',
    });

    // Scroll-reveal — runs once on mount only
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('explora-reveal-in');
                    }
                });
            },
            { threshold: 0.06, rootMargin: '0px 0px -30px 0px' }
        );
        const els = document.querySelectorAll('.explora-reveal');
        els.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    // Scroll progress bar
    useEffect(() => {
        const onScroll = () => {
            const el = document.documentElement;
            const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
            setScrollPct(Math.min(100, Math.max(0, pct)));
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Active section tracker
    useEffect(() => {
        const sectionIds = ['secciones', 'test-center', 'terminal-skills', 'sql-skills', 'netlabs', 'winlabs', 'flashcards-detail', 'xp-system', 'rachas', 'escudos', 'ligas', 'personaje', 'medallas'];
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); });
            },
            { threshold: 0.3 }
        );
        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white selection:bg-neon selection:text-black">
            {/* Reveal animation CSS */}
            <style>{`
                .explora-reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
                .explora-reveal.explora-reveal-in { opacity: 1; transform: translateY(0); }
            `}</style>

            {/* Scroll progress bar */}
            <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] bg-black/20">
                <div
                    className="h-full bg-gradient-to-r from-neon via-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(0,255,136,0.6)] transition-all duration-100"
                    style={{ width: `${scrollPct}%` }}
                />
            </div>

            {/* Floating mini-nav */}
            <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-1.5">
                {[
                    { href: '#secciones', Icon: Map, id: 'secciones', color: '#8b5cf6' },
                    { href: '#test-center', Icon: Target, id: 'test-center', color: '#22c55e' },
                    { href: '#terminal-skills', Icon: Terminal, id: 'terminal-skills', color: '#10b981' },
                    { href: '#sql-skills', Icon: Database, id: 'sql-skills', color: '#8b5cf6' },
                    { href: '#netlabs', Icon: Network, id: 'netlabs', color: '#14b8a6' },
                    { href: '#winlabs', Icon: Server, id: 'winlabs', color: '#3b82f6' },
                    { href: '#flashcards-detail', Icon: CreditCard, id: 'flashcards-detail', color: '#a855f7' },
                    { href: '#xp-system', Icon: Zap, id: 'xp-system', color: '#c6ff33' },
                    { href: '#rachas', Icon: Flame, id: 'rachas', color: '#f97316' },
                    { href: '#ligas', Icon: Trophy, id: 'ligas', color: '#eab308' },
                    { href: '#personaje', Icon: Star, id: 'personaje', color: '#8b5cf6' },
                ].map(({ href, Icon: NavIcon, id, color }) => (
                    <a
                        key={id}
                        href={href}
                        title={id}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200 ${activeSection === id
                                ? 'scale-110'
                                : 'border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/5'
                            }`}
                        style={activeSection === id ? {
                            borderColor: `${color}60`,
                            background: `${color}20`,
                            boxShadow: `0 0 10px ${color}30`
                        } : {}}
                    >
                        <NavIcon size={12} style={{ color: activeSection === id ? color : '#64748b' }} />
                    </a>
                ))}
            </div>

            {/* Premium Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute inset-0 bg-[#0D0D0D]"></div>
                {/* Dots grid */}
                <div className="absolute inset-0 opacity-[0.1]"
                    style={{ backgroundImage: 'radial-gradient(var(--color-neon) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
                {/* Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-neon/5 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-purple-500/5 blur-[180px] rounded-full" />
            </div>

            {user && <Sidebar />}

            <main className={`flex-1 ${user ? 'ml-60' : 'ml-0'} min-h-screen`}>
                {!user && (
                    <header className="fixed w-full top-0 z-50 bg-[#080810]/80 backdrop-blur-xl border-b border-white/5">
                        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                            <div
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => navigate('/')}
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-neon/20 blur-xl rounded-full group-hover:bg-neon/40 transition-all duration-500" />
                                    <img src={logo} alt="Tech4U Logo" className="w-8 h-8 relative z-10 drop-shadow-[0_0_8px_var(--neon-alpha-50)]" />
                                </div>
                                <span className="text-xl font-black italic tracking-tighter text-white">
                                    Tech<span className="text-neon">4</span>U
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="hidden md:block text-slate-300 font-mono text-sm hover:text-white transition-colors"
                                >
                                    Iniciar Sesión
                                </button>
                                <button
                                    onClick={() => navigate('/suscripcion')}
                                    className="bg-neon text-[#0D0D0D] px-6 py-2.5 rounded-full font-black text-sm uppercase transition-all hover:shadow-[0_0_20px_var(--neon-alpha-40)] hover:scale-105"
                                >
                                    Ver Planes
                                </button>
                            </div>
                        </div>
                    </header>
                )}
                <div className="px-10 py-10 max-w-6xl mx-auto">

                    <ExploraHero />

                    {/* ── NAVEGACIÓN INTERNA ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16 explora-reveal">
                        {[
                            { href: '#secciones', label: 'Secciones', Icon: Map, color: 'border-white/10 hover:border-violet-500/30' },
                            { href: '#test-center', label: 'Test Center', Icon: Target, color: 'border-white/10 hover:border-green-500/30' },
                            { href: '#terminal-skills', label: 'Terminal Skills', Icon: Terminal, color: 'border-white/10 hover:border-emerald-500/30' },
                            { href: '#sql-skills', label: 'SQL Skills', Icon: Database, color: 'border-white/10 hover:border-violet-500/30' },
                            { href: '#netlabs', label: 'NetLabs', Icon: Network, color: 'border-white/10 hover:border-teal-500/30' },
                            { href: '#winlabs', label: 'Windows Server', Icon: Server, color: 'border-white/10 hover:border-blue-500/30' },
                            { href: '#flashcards-detail', label: 'Flashcards', Icon: CreditCard, color: 'border-white/10 hover:border-purple-500/30' },
                            { href: '#xp-system', label: 'Sistema XP', Icon: Zap, color: 'border-white/10 hover:border-neon/30' },
                            { href: '#ligas', label: 'Ligas', Icon: Trophy, color: 'border-white/10 hover:border-yellow-500/30' },
                        ].map(({ href, label, Icon: NavIcon, color }) => (
                            <a key={href} href={href} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border bg-black/30 font-mono text-xs text-slate-300 hover:text-white transition-all ${color}`}>
                                <NavIcon className="w-3 h-3 opacity-60" />
                                {label}
                            </a>
                        ))}
                    </div>

                    {/* ── SECCIONES ── */}
                    <Section id="secciones" title="Herramientas y Secciones" icon={<Map className="w-4 h-4" />} color="violet">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {SECTIONS.map((s) => {
                                const c = COLOR_MAP[s.color] || COLOR_MAP.slate;
                                
                                // Enablement logic
                                let enabled = true;
                                if (user?.group_info) {
                                    const e = user.group_info.enabled_modules || [];
                                    if (s.id === 'tests') enabled = e.includes('tests');
                                    else if (s.id === 'skilllabs') enabled = e.includes('skill_labs');
                                    else if (s.id === 'terminal-skills') enabled = e.includes('terminal_skills');
                                    else if (s.id === 'sql-skills') enabled = e.includes('sql_skills');
                                    else if (s.id === 'netlabs') enabled = e.includes('netlabs');
                                    else if (s.id === 'teoria') enabled = e.includes('theory');
                                }

                                return (
                                    <div 
                                        key={s.id} 
                                        className={`rounded-2xl border ${c.border} ${c.bg} group relative overflow-hidden transition-all flex flex-col ${
                                            !enabled ? 'opacity-40 grayscale pointer-events-none' : 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50'
                                        }`}
                                    >
                                        <div className="aspect-[16/10] relative overflow-hidden bg-black/40 border-b border-white/5">
                                            <ToolCoverComponent toolId={s.id} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                            
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button onClick={() => enabled && navigate(s.path)} className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border inline-flex items-center gap-2 backdrop-blur-md shadow-lg ${c.pill}`}>
                                                    Acceder <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        {!enabled && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-[2px]">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Lock className="w-6 h-6 text-white/60" />
                                                    <span className="text-[10px] font-black font-mono text-white/60 uppercase tracking-widest text-center px-4">Módulo inhabilitado</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner"
                                                     style={{ background: `rgba(${s.accentRgb}, 0.1)`, borderColor: `rgba(${s.accentRgb}, 0.2)` }}>
                                                    <s.Icon size={18} style={{ color: s.accent }} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-black text-base tracking-tight ${c.text}`}>{s.label}</h3>
                                                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{s.headline}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs font-mono text-slate-400 leading-relaxed line-clamp-3">{s.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>

                    {/* ── TEST CENTER ── */}
                    <Section id="test-center" title="Test Center" icon={<Target className="w-4 h-4" />} color="green">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div>
                                <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight">Valida tus conocimientos</h3>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-8">
                                    El Test Center es el motor de evaluación de la academia. Practica con miles de preguntas reales extraídas de exámenes oficiales de ASIR, organizadas por módulos y dificultad.
                                </p>
                                <div className="grid grid-cols-1 gap-3">
                                    {TEST_MODES.map((mode, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                                            <div className="shrink-0">{mode.icon}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-white">{mode.name}</span>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${mode.badgeC}`}>{mode.badge}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-mono line-clamp-1">{mode.desc}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-neon transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <WindowPreview title="Test Engine v2.0" icon={<Target className="w-3 h-3" />} color="green" toolId="test-center" />
                        </div>
                    </Section>

                    {/* ── TERMINAL SKILLS ── */}
                    <Section id="terminal-skills" title="Terminal Skills" icon={<Terminal className="w-4 h-4" />} color="emerald">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div className="order-2 lg:order-1">
                                <WindowPreview title="Linux Terminal" icon={<Terminal className="w-3 h-3" />} color="emerald" toolId="terminal-skills" />
                            </div>
                            <div className="order-1 lg:order-2">
                                <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight">Domina la consola</h3>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-6">
                                    No hay administrador de sistemas sin dominio de la terminal. En Terminal Skills te enfrentarás a retos reales de configuración, gestión de usuarios, permisos y redes directamente desde tu navegador.
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {[
                                        'Entorno Linux real 100% interactivo',
                                        'Retos guiados paso a paso',
                                        'Validación automática de comandos',
                                        'Preparación directa para el mundo laboral'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs font-mono text-slate-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => navigate('/skill-labs')} className="w-full py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black uppercase text-sm tracking-widest hover:bg-emerald-500/20 transition-all">
                                    Abrir Consola de Entrenamiento
                                </button>
                            </div>
                        </div>
                    </Section>

                    {/* ── SQL SKILLS ── */}
                    <Section id="sql-skills" title="SQL Skills" icon={<Database className="w-4 h-4" />} color="violet">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div>
                                <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight">El lenguaje de los datos</h3>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-6">
                                    Aprende a diseñar y consultar bases de datos relacionales. Desde SELECT básicos hasta JOINs complejos y transacciones, SQL Skills te guía a través del temario de Bases de Datos de una forma visual e interactiva.
                                </p>
                                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 space-y-3">
                                    <div className="flex justify-between text-[10px] font-mono text-violet-400 uppercase tracking-widest">
                                        <span>Progresión DB</span>
                                        <span>75%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-violet-950/30 rounded-full overflow-hidden">
                                        <div className="h-full bg-violet-500 w-3/4 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                                    </div>
                                </div>
                            </div>
                            <WindowPreview title="SQL Query Editor" icon={<Database className="w-3 h-3" />} color="violet" toolId="sql-skills" />
                        </div>
                    </Section>

                    {/* ── NETLABS ── */}
                    <Section id="netlabs" title="NetLabs" icon={<Network className="w-4 h-4" />} color="teal">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div className="order-2 lg:order-1">
                                <WindowPreview title="Network Simulator" icon={<Network className="w-3 h-3" />} color="teal" toolId="netlabs" />
                            </div>
                            <div className="order-1 lg:order-2">
                                <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight">Infraestructura y Redes</h3>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-6">
                                    Configura routers, switches y firewalls en un entorno virtual seguro. Aprende subnetting, VLANs y enrutamiento dinámico con laboratorios prácticos diseñados para el mundo real.
                                </p>
                                <div className="space-y-4 mb-8">
                                    <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/10 flex items-center gap-3">
                                        <Zap className="w-4 h-4 text-teal-400" />
                                        <span className="text-[11px] font-mono text-slate-300">Laboratorios de Subnetting Avanzado</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/10 flex items-center gap-3">
                                        <Network className="w-4 h-4 text-teal-400" />
                                        <span className="text-[11px] font-mono text-slate-300">Configuración de Switches Cisco/HPE</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* ── WINDOWS SERVER ── */}
                    <Section id="winlabs" title="Windows Server" icon={<Server className="w-4 h-4" />} color="blue">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div>
                                <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight">Administración Empresarial</h3>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-6">
                                    Domina el ecosistema de Microsoft para empresas. Desde la gestión de Active Directory hasta la configuración de GPOs y servicios de red, Windows Server es una pieza clave en cualquier infraestructura IT avanzada.
                                </p>
                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                        <Server className="text-blue-400" />
                                    </div>
                                    <div className="flex-1 text-xs font-mono text-slate-400 italic leading-relaxed">
                                        "El 90% de las empresas Fortune 500 utilizan Active Directory. Tu formación no estaría completa sin dominar este entorno."
                                    </div>
                                </div>
                            </div>
                            <WindowPreview title="Windows Server Hub" icon={<Server className="w-3 h-3" />} color="blue" toolId="winlabs" />
                        </div>
                    </Section>

                    {/* ── FLASHCARDS ── */}
                    <Section id="flashcards-detail" title="Flashcards" icon={<CreditCard className="w-4 h-4" />} color="purple">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div className="order-2 lg:order-1">
                                <WindowPreview title="Flashcards Engine" icon={<CreditCard className="w-3 h-3" />} color="purple" toolId="theory" />
                            </div>
                            <div className="order-1 lg:order-2">
                                <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight">Repaso Visual Ultrarrápido</h3>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-6">
                                    Las Flashcards son tarjetas de repaso interactivas organizadas por asignatura. Voltea la tarjeta para ver la respuesta, evalúa tu propio conocimiento y el sistema adapta las siguientes tarjetas a tus áreas de mejora.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        { t: 'Repaso por Asignatura', d: 'Bases de Datos, Redes, SO, Hardware y Lenguaje de Marcas.' },
                                        { t: 'Auto-evaluación Activa', d: 'Marca si lo sabías o no. El sistema prioriza tus puntos débiles.' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                            <div>
                                                <p className="text-sm font-bold text-white">{item.t}</p>
                                                <p className="text-xs font-mono text-slate-500">{item.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* ── XP SYSTEM ── */}
                    <Section id="xp-system" title="Sistema de XP" icon={<Zap className="w-4 h-4" />} color="neon">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-black text-white text-lg mb-4">¿Cómo se calcula el XP?</h3>
                                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-6">
                                    El <span className="text-neon font-bold">Modo Examen (60 preguntas)</span> otorga XP. Lo recibes tanto si apruebas como si suspendes, aunque la cantidad varía según tu resultado:
                                </p>
                                <div className="rounded-xl border border-white/5 overflow-hidden">
                                    <div className="bg-black/40 px-4 py-2 border-b border-white/5">
                                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Tabla de recompensas · Modo Examen</span>
                                    </div>
                                    {XP_TABLE.map((row, i) => (
                                        <div key={i} className={`px-4 py-3 border-b border-white/5 last:border-b-0 ${i === 0 ? 'bg-neon/5' : ''}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-mono text-sm text-slate-300">{row.score}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-black font-mono text-sm ${row.textC}`}>{row.xp}</span>
                                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${i === 0 ? 'border-neon/40 bg-neon/10 text-neon' : i === 3 ? 'border-slate-700 bg-slate-900/40 text-slate-500' : 'border-white/10 bg-white/5 text-slate-400'}`}>{row.note}</span>
                                                </div>
                                            </div>
                                            {/* XP progress bar */}
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full ${row.color} rounded-full transition-all duration-1000`} style={{ width: `${row.pct}%` }} />
                                            </div>
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
                                        { icon: '👑', text: 'Suscripción Anual: recibes 4 escudos de bonificación automáticamente al activar tu plan.', hi: true },
                                        { icon: '⚡', text: 'Suscripción Trimestral: recibes 2 escudos de bonificación al activar tu plan.', hi: true },
                                        { icon: '🛒', text: 'Próximamente disponibles en la Academy Shop como ítem de protección.' },
                                        { icon: '⭐', text: 'Eventos especiales de la academia pueden recompensar escudos a los participantes.' },
                                    ].map((item, i) => (
                                        <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border bg-black/20 ${item.hi ? 'border-blue-500/30 bg-blue-900/10' : 'border-white/5'}`}>
                                            <span className="text-xl shrink-0">{item.icon}</span>
                                            <p className={`text-sm font-mono leading-relaxed ${item.hi ? 'text-blue-200' : 'text-slate-300'}`}>{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-5 border border-white/5 rounded-xl bg-black/30 text-center">
                                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">Ejemplo visual de escudos</p>
                                    <div className="flex justify-center gap-3 mb-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="flex flex-col items-center gap-1.5">
                                                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${i <= 3 ? 'border-blue-500/50 bg-blue-900/30 shadow-[0_0_12px_rgba(59,130,246,0.3)]' : 'border-slate-700/40 bg-slate-900/30'}`}>
                                                    <Shield className={`w-6 h-6 ${i <= 3 ? 'text-blue-400' : 'text-slate-700'}`} />
                                                </div>
                                                <span className={`text-[8px] font-mono ${i <= 3 ? 'text-blue-400' : 'text-slate-700'}`}>{i <= 3 ? 'ACTIVO' : 'VACÍO'}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs font-mono text-slate-500">3 escudos activos · 1 vacío (suscripción anual = 4)</p>
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

                        {/* Level → XP table with embedded character thumbnails */}
                        <div className="mt-10">
                            <h3 className="font-black text-white text-base mb-5 flex items-center gap-2">
                                <BarChart2 className="w-4 h-4 text-yellow-400" /> Tabla completa de niveles y XP
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-2">
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
                                    <div key={lv} className={`rounded-xl border p-2.5 text-center transition-all hover:scale-105 relative group ${c}`}>
                                        {/* Character thumbnail */}
                                        <img
                                            src={PJ_ASSETS[lv]}
                                            alt={`Nivel ${lv}`}
                                            className="w-10 h-10 mx-auto object-contain mb-1.5"
                                        />
                                        <div className="font-black font-mono text-sm leading-none">Lv.{lv}</div>
                                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">{xp} XP</div>
                                        <div className="text-[8px] font-mono mt-0.5 opacity-60 leading-tight">{tag}</div>
                                        {/* Tooltip */}
                                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/90 border border-white/10 text-[7px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                            Nivel {lv} · {tag}
                                        </div>
                                    </div>
                                ))}
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
                            <p className="text-slate-400 font-mono text-sm mb-8 max-w-xl mx-auto">Ya conoces todo lo que tiene la academia. Ahora solo queda una cosa: hacer el primer examen de 60 preguntas y empezar a sumar XP.</p>
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
