import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Database, ChevronRight, ChevronLeft, CheckCircle, Play, BookOpen,
    RotateCcw, Zap, AlertCircle, Code2, Hash, Layers, Sparkles, Lock, X,
    Rocket, Terminal, Check, ShieldCheck, Cpu, MonitorCheck, Activity, AlertTriangle,
    Flame, Trophy, BarChart2, Lightbulb, Star,
    Table, Filter, ArrowUpDown, GitMerge, ListFilter, Braces,
    Award, Download
} from 'lucide-react';
import DOMPurify from 'dompurify';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import { trackEvent } from '../utils/analytics';

// ─── SVG Covers (replacing PNG covers) ──────────────────────────────────────
import { SQLModeCoverComponent, CoverEscribeConsulta } from '../components/SQLLabCovers';

// ─── Level Road Icons (10 custom SVGs, indexed 0-9) ─────────────────────
const LEVEL_ICONS = [
    // 0 — Fundamentos: SELECT, table grid
    ({ color, size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <rect x="2" y="3" width="16" height="14" rx="2" stroke={color} strokeWidth="1.5" />
            <line x1="2" y1="8.5" x2="18" y2="8.5" stroke={color} strokeWidth="1.1" strokeOpacity="0.55" />
            <line x1="7.5" y1="8.5" x2="7.5" y2="17" stroke={color} strokeWidth="1.1" strokeOpacity="0.55" />
            <line x1="13.5" y1="8.5" x2="13.5" y2="17" stroke={color} strokeWidth="1.1" strokeOpacity="0.55" />
            <rect x="4" y="5" width="4" height="1.8" rx="0.8" fill={color} fillOpacity="0.5" />
        </svg>
    ),
    // 1 — Filtrado Crítico: WHERE, filter funnel
    ({ color, size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <path d="M3 4.5h14l-5.2 6.2V17l-3.6-1.8v-4.5L3 4.5z"
                stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
            <line x1="5.5" y1="4.5" x2="14.5" y2="4.5" stroke={color} strokeWidth="0.8" strokeOpacity="0.4" />
        </svg>
    ),
    // 2 — Búsqueda Avanzada: LIKE, IN, BETWEEN — magnify + wildcard
    ({ color, size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5" stroke={color} strokeWidth="1.5" />
            <path d="M13 13.5l4.5 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M6 8.5h5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.7" />
            <path d="M8.5 6v5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.7" />
            <circle cx="13.5" cy="5.5" r="1" fill={color} fillOpacity="0.7" />
            <path d="M16 5l-1 1M16 6l-1-1" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6" />
        </svg>
    ),
    // 3 — Agregación: COUNT/SUM/AVG — sigma Σ
    ({ color, size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <path d="M14 4H6L10.5 10 6 16h8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="6" y1="4" x2="14" y2="4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
            <line x1="6" y1="16" x2="14" y2="16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    ),
    // 4 — Agrupación: GROUP BY — stacked layers
    ({ color, size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <rect x="3" y="4" width="14" height="3" rx="1.5" stroke={color} strokeWidth="1.4" />
            <rect x="3" y="9" width="10" height="2.5" rx="1.25" stroke={color} strokeWidth="1.4" />
            <rect x="3" y="14" width="7" height="2.5" rx="1.25" stroke={color} strokeWidth="1.4" />
            <path d="M15 10.25 L17.5 10.25" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.5" />
            <path d="M16.25 9 L16.25 11.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.5" />
        </svg>
    ),
    // 5 — Relaciones: JOINs — two overlapping circles (Venn)
    ({ color, size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <circle cx="7.5" cy="10" r="5" stroke={color} strokeWidth="1.5" />
            <circle cx="12.5" cy="10" r="5" stroke={color} strokeWidth="1.5" />
            <path d="M10 6.5c1.2 1 2 2.2 2 3.5s-.8 2.5-2 3.5c-1.2-1-2-2.2-2-3.5s.8-2.5 2-3.5z"
                fill={color} fillOpacity="0.25" />
        </svg>
    ),
    // 6 — Subconsultas: nested SELECT — concentric squares
    ({ color, size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2.5" width="16" height="15" rx="2" stroke={color} strokeWidth="1.5" />
            <rect x="5" y="6" width="10" height="7.5" rx="1.5" stroke={color} strokeWidth="1.3" strokeOpacity="0.6" />
            <rect x="7.5" y="8.5" width="5" height="3" rx="1" stroke={color} strokeWidth="1.1" strokeOpacity="0.38" />
        </svg>
    ),
    // 7 — Lógica Condicional: CASE WHEN — diamond with paths
    ({ color, size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <path d="M10 3L17.5 10 10 17 2.5 10 10 3z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
            <path d="M10 10 L15 14.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.7" />
            <path d="M10 10 L5 14.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.7" />
            <circle cx="10" cy="10" r="1.3" fill={color} />
        </svg>
    ),
    // 8 — Funciones Avanzadas: f(x) curly bracket notation
    ({ color, size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <path d="M7 4C5.5 4 5 4.8 5 6v2.5c0 1-.5 1.5-1.5 1.5C4.5 10 5 10.5 5 11.5V14c0 1.2.5 2 2 2"
                stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M13 4c1.5 0 2 .8 2 2v2.5c0 1 .5 1.5 1.5 1.5-1 0-1.5.5-1.5 1.5V14c0 1.2-.5 2-2 2"
                stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="10" r="1.2" fill={color} />
        </svg>
    ),
    // 9 — Maestría SQL: crown / winner
    ({ color, size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <path d="M3 15 L5 7.5 L8.5 12 L10 4 L11.5 12 L15 7.5 L17 15 Z"
                stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.15" />
            <path d="M3 15h14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="5" cy="7.5" r="1.3" fill={color} />
            <circle cx="10" cy="4" r="1.3" fill={color} />
            <circle cx="15" cy="7.5" r="1.3" fill={color} />
        </svg>
    ),
];

// ─── Premium SVG Icons ────────────────────────────────────────────────────
const IconTerminal = ({ size = 28, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
        <rect x="2" y="4" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
        <rect x="2" y="4" width="24" height="6" rx="3" fill="currentColor" fillOpacity="0.12" />
        <circle cx="6.5" cy="7" r="1.2" fill="#ff5f57" />
        <circle cx="10.5" cy="7" r="1.2" fill="#ffbd2e" />
        <circle cx="14.5" cy="7" r="1.2" fill="#28c840" />
        <path d="M6 15l3 2.5L6 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 20h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.6" />
    </svg>
);

const IconFillBlank = ({ size = 28, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
        <rect x="2" y="9" width="7" height="5" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="9" width="6" height="5" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 1.5" />
        <rect x="19" y="9" width="7" height="5" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 18h20M4 21h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.35" strokeDasharray="3 2" />
        <circle cx="14" cy="11.5" r="1.5" fill="currentColor" fillOpacity="0.3" />
    </svg>
);

const IconFindBug = ({ size = 28, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17.5 17.5l5.5 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M9.5 10l5 3.5M14.5 10l-5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="14" r="1.2" fill="currentColor" fillOpacity="0.6" />
    </svg>
);

const IconOrderClauses = ({ size = 28, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
        <rect x="2" y="5" width="13" height="5" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="5" y="12" width="13" height="5" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8" y="19" width="13" height="5" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 7.5h4M22 5.5l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.55" />
    </svg>
);

const IconReverseQuery = ({ size = 28, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
        <rect x="2" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 11h18M8 11v8" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.5" />
        <path d="M24 10c2 0 3-1.5 3-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M22 4l3 2.5-3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// DATASET METADATA (visual theme por dataset)
// ─────────────────────────────────────────────────────────────────────────────
const DATASET_META = {
    'Tienda': {
        emoji: '🏪',
        tag: 'Comercio',
        gradientFrom: 'from-emerald-500/25',
        gradientTo: 'to-emerald-500/0',
        border: 'border-emerald-500/20',
        borderHover: 'hover:border-emerald-400/50',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/10',
        tables: ['categoria', 'proveedor', 'producto', 'cliente', 'pedido', 'linea_pedido'],
        topics: ['SELECT', 'WHERE', 'ORDER BY', 'Agregación', 'GROUP BY', 'HAVING', 'Subconsultas'],
    },
    'Empresa IT': {
        emoji: '💼',
        tag: 'Tecnología',
        gradientFrom: 'from-blue-500/25',
        gradientTo: 'to-blue-500/0',
        border: 'border-blue-500/20',
        borderHover: 'hover:border-blue-400/50',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/10',
        tables: ['departamento', 'empleado', 'cliente', 'proyecto', 'tarea', 'factura'],
        topics: ['SELECT', 'WHERE', 'ORDER BY', 'Agregación', 'GROUP BY', 'HAVING', 'Subconsultas'],
    },
    'Pokemon': {
        emoji: '⚡',
        tag: 'Videojuegos',
        gradientFrom: 'from-yellow-500/25',
        gradientTo: 'to-yellow-500/0',
        border: 'border-yellow-500/20',
        borderHover: 'hover:border-yellow-400/50',
        text: 'text-yellow-400',
        glow: 'shadow-yellow-500/10',
        tables: ['pokemon', 'movimiento'],
        topics: ['SELECT', 'WHERE', 'ORDER BY', 'Agregación', 'GROUP BY', 'HAVING', 'Subconsultas'],
    },
};

const DEFAULT_META = {
    emoji: '📊',
    tag: 'Base de datos',
    gradientFrom: 'from-purple-500/25',
    gradientTo: 'to-purple-500/0',
    border: 'border-purple-500/20',
    borderHover: 'hover:border-purple-400/50',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/10',
    tables: [],
    topics: [],
};

function getDatasetMeta(name) {
    return DATASET_META[name] || DEFAULT_META;
}

// Strip leading "01 - ", "02 - " … prefixes (used in some seeds)
function normalizeCat(cat) {
    return cat.replace(/^\d+\s*[-–]\s*/, '');
}
function normalizeTitle(title) {
    return title.replace(/^\d+\s*[-–]\s*/, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// WIKI INTRO por comando SQL (panel derecho)
// ─────────────────────────────────────────────────────────────────────────────
const WIKI_INTROS = {
    'SELECT': 'La sentencia `SELECT` en SQL es el comando fundamental para consultar, recuperar y visualizar datos almacenados en una o varias tablas de una base de datos. Es la base de cualquier consulta SQL y se usa en prácticamente todas las operaciones de lectura.',
    'AS': 'Los alias en SQL permiten renombrar temporalmente columnas o tablas en el resultado de una consulta, haciendo el output más legible y profesional.',
    'WHERE': 'La cláusula `WHERE` en SQL permite filtrar registros y recuperar únicamente aquellos que cumplen una condición específica, siendo esencial para trabajar con datos selectivos.',
    'BETWEEN': 'El operador `BETWEEN` en SQL filtra registros cuyo valor se encuentra dentro de un rango numérico, de texto o de fechas, incluyendo ambos extremos del rango.',
    'LIKE': 'El operador `LIKE` en SQL permite realizar búsquedas de patrones en columnas de texto usando caracteres comodín, siendo muy útil para búsquedas flexibles.',
    'NOT IN': 'El operador `NOT IN` en SQL permite excluir filas cuyos valores coinciden con algún elemento de una lista especificada, siendo la negación del operador IN.',
    'ORDER BY': 'La cláusula `ORDER BY` en SQL permite ordenar los resultados de una consulta de forma ascendente o descendente según el valor de una o varias columnas.',
    'LIMIT': 'La cláusula `LIMIT` en SQL restringe el número máximo de filas devueltas por una consulta, siendo fundamental para paginación, rankings y optimización del rendimiento.',
    'COUNT': 'La función `COUNT` en SQL es una función de agregación que cuenta el número de filas o valores no nulos en un conjunto de resultados.',
    'SUM': 'La función `SUM` en SQL suma todos los valores numéricos de una columna, permitiendo calcular totales como ventas, stocks o presupuestos de forma directa.',
    'AVG': 'La función `AVG` en SQL calcula la media aritmética de los valores de una columna numérica, siendo muy utilizada en análisis estadístico de datos.',
    'MAX': 'Las funciones `MAX` y `MIN` en SQL devuelven respectivamente el valor más alto y más bajo de una columna, funcionando con números, texto y fechas.',
    'GROUP BY': 'La cláusula `GROUP BY` en SQL agrupa las filas que tienen los mismos valores en columnas especificadas, permitiendo aplicar funciones de agregación a cada grupo por separado.',
    'HAVING': 'La cláusula `HAVING` en SQL filtra los grupos creados por `GROUP BY`, actuando igual que `WHERE` pero sobre los grupos resultantes en lugar de sobre las filas individuales.',
    'Subconsulta': 'Una subconsulta en SQL es una consulta anidada dentro de otra. La consulta interior se ejecuta primero y su resultado es usado por la consulta exterior, permitiendo operaciones muy potentes.',
    'columna': 'Las columnas calculadas en SQL permiten crear nuevos campos en el resultado combinando operadores aritméticos y funciones directamente en el `SELECT`.',
    'Varias': 'SQL permite combinar múltiples funciones de agregación en una sola consulta, generando estadísticas descriptivas completas en una única consulta avanzada.',
    'Examen': 'Este ejercicio de examen combina todos los conceptos estudiados: `SELECT`, `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY` y funciones de agregación en una única consulta avanzada.',
    'DISTINCT': 'La palabra clave `DISTINCT` en SQL elimina las filas duplicadas del resultado, mostrando únicamente los valores únicos de la columna o combinación de columnas indicada.',
};

function getWikiIntro(wikiTitle) {
    if (!wikiTitle) return '';
    const key = Object.keys(WIKI_INTROS).find(k =>
        wikiTitle.toLowerCase().includes(k.toLowerCase())
    );
    return key ? WIKI_INTROS[key] : '';
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE METADATA (for new exercise types)
// ─────────────────────────────────────────────────────────────────────────────
const MODE_META = {
    'fill_blank': {
        Icon: IconFillBlank,
        modeKey: 'fill_blank',
        title: 'Completa el Hueco',
        description: 'Rellena los huecos que faltan en la consulta SQL',
        color: 'amber',
        gradientFrom: 'from-amber-500/25',
        gradientTo: 'to-amber-500/0',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
        accentRgb: '245,158,11',
        glow: 'shadow-amber-500/10',
    },
    'find_bug': {
        Icon: IconFindBug,
        modeKey: 'find_bug',
        title: 'Encuentra el Error',
        description: 'Detecta y corrige el bug oculto en la query',
        color: 'red',
        gradientFrom: 'from-orange-500/25',
        gradientTo: 'to-orange-500/0',
        border: 'border-orange-500/20',
        text: 'text-orange-400',
        accentRgb: '249,115,22',
        glow: 'shadow-orange-500/10',
    },
    'order_clauses': {
        Icon: IconOrderClauses,
        modeKey: 'order_clauses',
        title: 'Ordena las Cláusulas',
        description: 'Coloca los fragmentos SQL en el orden correcto',
        color: 'purple',
        gradientFrom: 'from-purple-500/25',
        gradientTo: 'to-purple-500/0',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
        accentRgb: '139,92,246',
        glow: 'shadow-purple-500/10',
    },
    'reverse_query': {
        Icon: IconReverseQuery,
        modeKey: 'reverse_query',
        title: 'Query Inversa',
        description: 'Escribe la query que produce el resultado mostrado',
        color: 'cyan',
        gradientFrom: 'from-cyan-500/25',
        gradientTo: 'to-cyan-500/0',
        border: 'border-cyan-500/20',
        text: 'text-cyan-400',
        accentRgb: '6,182,212',
        glow: 'shadow-cyan-500/10',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// DIFFICULTY BADGE
// ─────────────────────────────────────────────────────────────────────────────
const DIFF_STYLES = {
    basico: { label: 'Básico', cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
    intermedio: { label: 'Intermedio', cls: 'bg-amber-500/10  border-amber-500/20  text-amber-400' },
    avanzado: { label: 'Avanzado', cls: 'bg-red-500/10    border-red-500/20    text-red-400' },
};
const DiffBadge = ({ d }) => {
    const s = DIFF_STYLES[d] || DIFF_STYLES.basico;
    return (
        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${s.cls}`}>
            {s.label}
        </span>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// HIGHLIGHTER LOGIC
// ─────────────────────────────────────────────────────────────────────────────
const highlightSQL = (text) => {
    if (!text) return '';
    const keywords = [
        'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
        'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON', 'AS', 'DISTINCT', 'UNION', 'ALL',
        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'BETWEEN', 'LIKE', 'IN', 'IS', 'NULL', 'WITH', 'EXPLAIN'
    ];
    let escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
    escaped = escaped.replace(kwRegex, (match) => `<span class="text-blue-400 font-bold uppercase">${match}</span>`);
    escaped = escaped.replace(/'([^']*)'/g, '<span class="text-emerald-400">\'$1\'</span>');
    escaped = escaped.replace(/(--.*$)/gm, '<span class="text-slate-600 italic font-normal">$1</span>');
    escaped = escaped.replace(/\*/g, '<span class="text-amber-400">*</span>');

    return escaped;
};

// ─────────────────────────────────────────────────────────────────────────────
// SQL EDITOR
// ─────────────────────────────────────────────────────────────────────────────
const SQLEditor = ({ value, onChange, disabled }) => {
    const lines = (value || '').split('\n');
    const editorRef = useRef(null);
    const preRef = useRef(null);

    const handleScroll = (e) => {
        if (preRef.current) {
            preRef.current.scrollTop = e.target.scrollTop;
            preRef.current.scrollLeft = e.target.scrollLeft;
        }
    };

    return (
        <div className="relative font-mono text-sm rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a] group">
            <div className="flex">
                <div className="select-none py-4 px-3 text-right text-slate-700 text-xs leading-6 border-r border-white/5 min-w-[40px] bg-black/40 z-20">
                    {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
                    <div>&nbsp;</div>
                </div>

                <div className="relative flex-1 min-h-[220px] cursor-text" onClick={() => editorRef.current?.focus()}>
                    {/* Highlighting Overlay */}
                    <pre
                        ref={preRef}
                        aria-hidden="true"
                        className="absolute inset-0 py-4 px-4 bg-transparent m-0 pointer-events-none whitespace-pre-wrap break-words leading-6 text-slate-300 z-10 overflow-hidden font-mono text-sm"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlightSQL(value) + '\n') }}
                    />

                    {/* Real Textarea */}
                    <textarea
                        ref={editorRef}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        onScroll={handleScroll}
                        onKeyDown={e => {
                            // Tab → insert 2 spaces instead of shifting focus
                            if (e.key === 'Tab') {
                                e.preventDefault();
                                const el = e.target;
                                const start = el.selectionStart;
                                const end = el.selectionEnd;
                                const indent = '  ';
                                onChange(value.substring(0, start) + indent + value.substring(end));
                                // Restore cursor after React re-render
                                requestAnimationFrame(() => {
                                    el.selectionStart = el.selectionEnd = start + indent.length;
                                });
                            }
                        }}
                        disabled={disabled}
                        spellCheck={false}
                        className="w-full h-full py-4 px-4 bg-transparent text-white leading-6 resize-none outline-none placeholder-slate-800 z-20 block relative overflow-auto font-mono text-sm"
                        placeholder="-- Escribe tu consulta SQL aquí..."
                        rows={Math.max(10, lines.length + 1)}
                        style={{
                            caretColor: '#60a5fa', // blue-400
                            color: 'transparent',
                            WebkitTextFillColor: 'transparent',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                        }}
                    />
                </div>
            </div>

            {/* Legend / Hover Tip */}
            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="px-2 py-1 rounded bg-black/60 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Sintaxis activa
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// FILL BLANK EDITOR
// ─────────────────────────────────────────────────────────────────────────────
const FillBlankEditor = ({ template_sql, onQueryChange, disabled }) => {
    // Parse template_sql to find ___ positions and split text
    const parts = (template_sql || '').split(/(_+)/);
    const [blanks, setBlanks] = useState(Array(parts.filter((_, i) => i % 2 === 1).length).fill(''));

    const handleBlankChange = (index, value) => {
        const newBlanks = [...blanks];
        newBlanks[index] = value;
        setBlanks(newBlanks);

        // Reconstruct SQL using newBlanks (not the stale `blanks` closure)
        let blankIdx = 0;
        const reconstructed = parts.map((part, i) => {
            if (i % 2 === 1) {
                // This is a ___ marker — use newBlanks so the current keystroke is included
                return newBlanks[blankIdx++] || '';
            }
            return part;
        }).join('');
        onQueryChange(reconstructed);
    };

    let blankIdx = 0;
    const assembledQuery = parts.map((part, i) => {
        if (i % 2 === 1) {
            const idx = blankIdx++;
            return blanks[idx] || '';
        }
        return part;
    }).join('');

    return (
        <div className="space-y-4">
            {/* Template with inline inputs */}
            <div className="glass rounded-2xl border border-white/8 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                    Completa los huecos
                </p>
                <div className="font-mono text-sm text-slate-300 flex flex-wrap gap-x-2 gap-y-3 items-center leading-relaxed">
                    {parts.map((part, i) => {
                        if (i % 2 === 1) {
                            const idx = Math.floor(i / 2);
                            const val = blanks[idx] || '';
                            // Dynamic width: characters * 8px + 24px padding, min 60px
                            const width = Math.max(60, val.length * 9 + 24);
                            return (
                                <input
                                    key={i}
                                    type="text"
                                    value={val}
                                    onChange={(e) => handleBlankChange(idx, e.target.value)}
                                    disabled={disabled}
                                    placeholder="..."
                                    className="bg-blue-500/10 border border-blue-400/30 rounded px-2 py-0.5 text-blue-300 font-mono text-xs focus:outline-none focus:border-blue-400 focus:bg-blue-500/20 transition-all text-center"
                                    style={{ width: `${width}px` }}
                                />
                            );
                        }
                        return (
                            <span key={i} className="whitespace-pre">
                                {part}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Preview */}
            <div className="glass rounded-2xl border border-white/8 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                    Vista previa
                </p>
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
                    <div className="px-4 py-3 font-mono text-xs leading-6 whitespace-pre-wrap overflow-x-auto text-slate-300">
                        {assembledQuery || '-- Tu consulta aparecerá aquí'}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDER CLAUSES EDITOR
// ─────────────────────────────────────────────────────────────────────────────
const OrderClausesEditor = ({ fragments, onQueryChange, disabled }) => {
    // Shuffle fragments deterministically: sort alphabetically for stable UI
    const shuffled = [...fragments].sort();
    const [assembled, setAssembled] = useState([]);
    const [available, setAvailable] = useState(shuffled);

    const addFragment = (fragment) => {
        const newAssembled = [...assembled, fragment];
        setAssembled(newAssembled);
        setAvailable(available.filter(f => f !== fragment));
        onQueryChange(newAssembled.join(' '));
    };

    const removeFragment = (fragment) => {
        const newAssembled = assembled.filter(f => f !== fragment);
        setAssembled(newAssembled);
        setAvailable([...available, fragment].sort());
        onQueryChange(newAssembled.join(' '));
    };

    const handleReset = () => {
        setAssembled([]);
        setAvailable([...fragments].sort());
        onQueryChange('');
    };

    return (
        <div className="space-y-4">
            {/* Available fragments */}
            <div className="glass rounded-2xl border border-white/8 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                    Fragmentos disponibles
                </p>
                <div className="flex flex-wrap gap-2">
                    {available.map((fragment, i) => (
                        <button
                            key={i}
                            onClick={() => addFragment(fragment)}
                            disabled={disabled}
                            className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs font-mono transition-all disabled:opacity-50"
                        >
                            {fragment}
                        </button>
                    ))}
                </div>
            </div>

            {/* Assembled query */}
            <div className="glass rounded-2xl border border-white/8 p-5">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Consulta armada
                    </p>
                    {assembled.length > 0 && (
                        <button
                            onClick={handleReset}
                            disabled={disabled}
                            className="px-2 py-1 text-[10px] font-mono text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            Reset
                        </button>
                    )}
                </div>
                {assembled.length > 0 ? (
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {assembled.map((fragment, i) => (
                                <button
                                    key={i}
                                    onClick={() => removeFragment(fragment)}
                                    disabled={disabled}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-mono transition-all disabled:opacity-50"
                                >
                                    {fragment} ✕
                                </button>
                            ))}
                        </div>
                        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
                            <div className="px-4 py-3 font-mono text-xs leading-6 whitespace-pre-wrap overflow-x-auto text-slate-300">
                                {assembled.join(' ')}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-600 font-mono text-xs">Haz clic en los fragmentos para armar la consulta</p>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// RESULT TABLE
// ─────────────────────────────────────────────────────────────────────────────
const ResultTable = ({ result, accent = 'slate' }) => {
    if (!result) return null;
    const { columns, rows } = result;
    if (!columns?.length) return <p className="text-slate-500 font-mono text-xs p-4">Sin columnas.</p>;
    const headerCls = accent === 'blue' ? 'text-blue-400'
        : accent === 'emerald' ? 'text-emerald-400'
            : accent === 'yellow' ? 'text-yellow-400'
                : 'text-slate-400';
    return (
        <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-xs font-mono">
                <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                        {columns.map((col, i) => (
                            <th key={i} className={`px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest ${headerCls}`}>
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0
                        ? <tr><td colSpan={columns.length} className="px-4 py-3 text-slate-600 text-center">Sin resultados</td></tr>
                        : rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                {row.map((cell, ci) => (
                                    <td key={ci} className="px-4 py-2 text-slate-300">
                                        {cell === null ? <span className="text-slate-600 italic">NULL</span> : String(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <div className="px-4 py-2 border-t border-white/5 text-[10px] text-slate-600 font-mono">
                {rows.length} fila{rows.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// WIKI PANEL
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// INLINE MARKDOWN RENDERER (bold, italic, inline code)
// ─────────────────────────────────────────────────────────────────────────────
function renderInline(text) {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
            return <strong key={i} className="text-white font-black">{part.slice(2, -2)}</strong>;
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
            return <em key={i} className="text-slate-200 italic">{part.slice(1, -1)}</em>;
        if (part.startsWith('`') && part.endsWith('`'))
            return <code key={i} className="text-blue-300 bg-black/40 px-1.5 py-0.5 rounded text-[11px] font-mono">{part.slice(1, -1)}</code>;
        return part;
    });
}

// Full block markdown renderer (headings, code blocks, tables, lists, blockquotes)
function renderMarkdown(text, accentColor = '#3b82f6') {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let i = 0;
    let kIdx = 0;
    const nk = () => kIdx++;

    while (i < lines.length) {
        const line = lines[i];

        // Empty line
        if (line.trim() === '') { i++; continue; }

        // Fenced code block ```lang
        if (line.trimStart().startsWith('```')) {
            const lang = line.replace(/```/, '').trim().toLowerCase();
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            i++; // consume closing ```
            const code = codeLines.join('\n');
            const isSql = lang === 'sql' || lang === '';
            elements.push(
                <div key={nk()} className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/5 bg-black/50">
                        <div className="w-2 h-2 rounded-full bg-red-500/60" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                        <div className="w-2 h-2 rounded-full bg-green-500/60" />
                        <span className="text-[9px] font-mono text-slate-600 ml-2 uppercase tracking-widest">{lang || 'sql'}</span>
                    </div>
                    <pre className="px-4 py-3 font-mono text-xs leading-relaxed overflow-x-auto text-slate-300"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(isSql ? highlightSQL(code) : code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')) }} />
                </div>
            );
            continue;
        }

        // Table: | col | col |  (skip separator rows like |---|---|)
        if (line.startsWith('|') && !line.replace(/\|/g, '').replace(/-/g, '').replace(/:/g,'').trim().match(/^[\s]*$/)) {
            const tableLines = [];
            while (i < lines.length && lines[i].startsWith('|')) {
                tableLines.push(lines[i]);
                i++;
            }
            const nonSep = tableLines.filter(l => !l.replace(/\|/g,'').replace(/-/g,'').replace(/:/g,'').replace(/\s/g,'').match(/^$/));
            const [headerRow, ...dataRows] = nonSep;
            const parseCells = r => r.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(h => h.trim());
            const headers = parseCells(headerRow || '');
            elements.push(
                <div key={nk()} className="my-3 overflow-x-auto rounded-xl border border-white/8">
                    <table className="w-full text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-white/8 bg-white/[0.04]">
                                {headers.map((h, j) => <th key={j} className="px-3 py-2 text-left font-black text-slate-400 uppercase tracking-wider text-[10px]">{renderInline(h)}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {dataRows.map((row, j) => (
                                <tr key={j} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    {parseCells(row).map((cell, k) => <td key={k} className="px-3 py-2 text-slate-300">{renderInline(cell)}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            continue;
        }

        // Blockquote: > text
        if (line.startsWith('> ')) {
            elements.push(
                <div key={nk()} className="my-2 pl-3 border-l-2 py-1" style={{ borderColor: accentColor + '60' }}>
                    <p className="text-xs text-slate-400 italic leading-relaxed">{renderInline(line.slice(2))}</p>
                </div>
            );
            i++; continue;
        }

        // Headers
        if (line.startsWith('### ')) { elements.push(<h4 key={nk()} className="text-sm font-black text-white mt-4 mb-1">{renderInline(line.slice(4))}</h4>); i++; continue; }
        if (line.startsWith('## '))  { elements.push(<h3 key={nk()} className="text-base font-black text-white mt-4 mb-1">{renderInline(line.slice(3))}</h3>); i++; continue; }
        if (line.startsWith('# '))   { elements.push(<h2 key={nk()} className="text-lg font-black text-white mt-4 mb-2">{renderInline(line.slice(2))}</h2>); i++; continue; }

        // Unordered list: - or *
        if (line.match(/^[-*] /)) {
            const items = [];
            while (i < lines.length && lines[i].match(/^[-*] /)) { items.push(lines[i].replace(/^[-*] /, '')); i++; }
            elements.push(
                <ul key={nk()} className="my-2 space-y-1 pl-2">
                    {items.map((it, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accentColor }} />
                            <span>{renderInline(it)}</span>
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        // Normal paragraph
        elements.push(<p key={nk()} className="text-xs text-slate-300 leading-relaxed my-1">{renderInline(line)}</p>);
        i++;
    }
    return <div className="space-y-0.5">{elements}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULT DIFF — visual comparison of actual vs expected query results
// ─────────────────────────────────────────────────────────────────────────────
const ResultDiff = ({ actualResult, exercise }) => {
    if (!actualResult || !exercise?.expected_result) return null;
    let expected;
    try { expected = typeof exercise.expected_result === 'string' ? JSON.parse(exercise.expected_result) : exercise.expected_result; }
    catch { return null; }

    const actualRows = actualResult.rows || [];
    const expectedRows = expected.rows || [];
    const expectedCols = expected.columns || [];
    const actualCols = actualResult.columns || [];
    const rowKey = r => JSON.stringify(r);
    const expectedSet = new Set(expectedRows.map(rowKey));
    const actualSet   = new Set(actualRows.map(rowKey));
    const missing = expectedRows.filter(r => !actualSet.has(rowKey(r)));
    const extra   = actualRows.filter(r => !expectedSet.has(rowKey(r)));
    const colMismatch = actualCols.join(',') !== expectedCols.join(',');

    const MiniTable = ({ rows, cols, highlightFn, border, headerColor }) => (
        <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${border}` }}>
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr className="border-b" style={{ borderColor: border }}>
                        {cols.map((c, i) => <th key={i} className="px-2 py-1.5 text-left font-black text-[10px] uppercase tracking-wider" style={{ color: headerColor }}>{c}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.slice(0, 7).map((row, i) => {
                        const hi = highlightFn(row);
                        return (
                            <tr key={i} className="border-b border-white/5" style={{ background: hi ? `${border}18` : 'transparent' }}>
                                {(Array.isArray(row) ? row : cols.map(c => row[c])).map((cell, j) => (
                                    <td key={j} className="px-2 py-1.5 font-mono text-[11px]" style={{ color: hi ? headerColor : '#94a3b8' }}>
                                        {cell === null ? <span className="italic opacity-40">NULL</span> : String(cell)}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                    {rows.length > 7 && <tr><td colSpan={cols.length} className="px-2 py-1 text-center text-[10px] text-slate-600 font-mono">+{rows.length - 7} más</td></tr>}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="mt-5 space-y-4 pt-5 border-t border-white/6">
            <div className="flex items-center gap-2">
                <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">Comparar resultados</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500/70" />
                        <span className="text-[10px] font-black uppercase text-red-400">Tu resultado</span>
                        <span className="text-[10px] font-mono text-slate-600 ml-1">{actualRows.length} filas</span>
                    </div>
                    <MiniTable rows={actualRows} cols={actualCols} highlightFn={r => extra.some(e => rowKey(e) === rowKey(r))} border="#ef4444" headerColor="#fca5a5" />
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
                        <span className="text-[10px] font-black uppercase text-emerald-400">Esperado</span>
                        <span className="text-[10px] font-mono text-slate-600 ml-1">{expectedRows.length} filas</span>
                    </div>
                    <MiniTable rows={expectedRows} cols={expectedCols} highlightFn={r => missing.some(m => rowKey(m) === rowKey(r))} border="#10b981" headerColor="#6ee7b7" />
                </div>
            </div>
            <div className="px-4 py-3 rounded-xl space-y-1.5" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/70 mb-2">🔍 Diagnóstico</p>
                {colMismatch && <p className="text-[11px] text-amber-300">⚠️ Columnas distintas — esperadas: <code className="font-mono bg-black/30 px-1 rounded">{expectedCols.join(', ')}</code></p>}
                {missing.length > 0 && <p className="text-[11px] text-amber-300">❌ Faltan {missing.length} fila(s) en tu resultado</p>}
                {extra.length > 0 && <p className="text-[11px] text-amber-300">➕ {extra.length} fila(s) extra que no deberían aparecer</p>}
                {!colMismatch && missing.length === 0 && extra.length === 0 && actualRows.length !== expectedRows.length && <p className="text-[11px] text-amber-300">📊 Número de filas distinto: tienes {actualRows.length}, esperado {expectedRows.length}</p>}
                {!colMismatch && missing.length === 0 && extra.length === 0 && actualRows.length === expectedRows.length && <p className="text-[11px] text-amber-300">✨ Las filas coinciden pero quizás el orden es distinto — prueba a añadir ORDER BY</p>}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// HINTS PANEL — 3 progressive hints with XP cost
// ─────────────────────────────────────────────────────────────────────────────
const HintsPanel = ({ exercise, hintsUsed, onUseHint }) => {
    if (!exercise) return null;
    const XP_COST = [3, 5, 10];

    const buildHints = (ex) => {
        const typeHints = {
            free_query:    '💡 Identifica qué tabla contiene los datos que necesitas. Luego decide qué columnas mostrar. Empieza con SELECT.',
            fill_blank:    '💡 Lee la query de izquierda a derecha. Cada ___ es exactamente una palabra SQL. El contexto a su alrededor te da la pista.',
            order_clauses: '💡 El orden estándar de SQL es: SELECT → FROM → WHERE → GROUP BY → ORDER BY → LIMIT. Organiza los fragmentos siguiendo este patrón.',
            find_bug:      '💡 Lee la query letra a letra. Los bugs más frecuentes son: palabra clave mal escrita, coma de más/menos, o cláusula en posición incorrecta.',
            reverse_query: '💡 Los nombres de columna del resultado son tu SELECT. La tabla con esos datos es tu FROM. Empieza ahí.',
        };
        const hint1 = typeHints[ex.exercise_type] || typeHints.free_query;

        let hint2;
        if (ex.wiki_syntax) {
            hint2 = `🔧 La estructura que necesitas:\n${ex.wiki_syntax}`;
        } else {
            const structHints = {
                free_query:    '🔧 Empieza con SELECT y decide si necesitas * (todo) o columnas específicas. Luego FROM y el nombre exacto de la tabla.',
                fill_blank:    `🔧 El template completo es:\n"${ex.template_sql || '...'}"`,
                find_bug:      `🔧 La query con el bug:\n"${ex.buggy_sql || '...'}"\nBusca la diferencia con la sintaxis estándar.`,
                order_clauses: '🔧 Cada fragmento es una cláusula SQL completa. El primer fragmento siempre empieza con SELECT.',
                reverse_query: '🔧 Fíjate en cuántas columnas tiene el resultado y cómo se llaman — eso es tu SELECT exacto.',
            };
            hint2 = structHints[ex.exercise_type] || structHints.free_query;
        }

        let hint3;
        if (ex.exercise_type === 'find_bug') {
            hint3 = `🎯 La solución es corregir:\n"${ex.buggy_sql}"\nEl error está en una sola palabra — ¿ves la diferencia con la sintaxis correcta?`;
        } else if (ex.exercise_type === 'fill_blank') {
            hint3 = `🎯 Rellena los huecos en: "${ex.template_sql}"\nEl resultado final debe ser SQL válido que ejecute sin error.`;
        } else {
            const sol = (ex.solution_sql || '').replace(/'[^']*'/g, "'...'");
            hint3 = `🎯 La solución sigue esta estructura:\n${sol}`;
        }
        return [hint1, hint2, hint3];
    };

    const hints = buildHints(exercise);

    return (
        <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={13} className="text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Pistas</span>
                {hintsUsed > 0 && <span className="text-[10px] font-mono text-slate-600">({hintsUsed} usada{hintsUsed > 1 ? 's' : ''})</span>}
            </div>
            {hints.slice(0, hintsUsed).map((hint, i) => (
                <div key={i} className="px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.20)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-500/80">Pista {i + 1}</span>
                    </div>
                    <p className="text-xs text-amber-200 leading-relaxed whitespace-pre-line">{hint}</p>
                </div>
            ))}
            {hintsUsed < hints.length && (
                <button onClick={() => onUseHint(XP_COST[hintsUsed])}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group"
                    style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.22)' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(251,191,36,0.10)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(251,191,36,0.05)'}>
                    <div className="flex items-center gap-2">
                        <Lightbulb size={14} className="text-amber-400" />
                        <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                            Ver pista {hintsUsed + 1} de {hints.length}
                        </span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-600">-{XP_COST[hintsUsed]} XP</span>
                </button>
            )}
            {hintsUsed === hints.length && (
                <p className="text-center text-[10px] text-slate-600 font-mono py-1">— Todas las pistas reveladas —</p>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// XP FLOAT ANIMATION
// ─────────────────────────────────────────────────────────────────────────────
const XPFloat = ({ amount, color = '#10b981', onDone }) => {
    useEffect(() => {
        const t = setTimeout(onDone, 1800);
        return () => clearTimeout(t);
    }, [onDone]);
    return (
        <div className="fixed z-50 pointer-events-none select-none"
            style={{
                top: '30%', right: '22rem',
                animation: 'xpFloat 1.8s ease-out forwards',
            }}>
            <style>{`@keyframes xpFloat { 0%{opacity:0;transform:translateY(0) scale(0.7)} 15%{opacity:1;transform:translateY(-10px) scale(1.1)} 70%{opacity:1;transform:translateY(-50px) scale(1)} 100%{opacity:0;transform:translateY(-80px) scale(0.9)} }`}</style>
            <div className="px-5 py-2.5 rounded-2xl font-black text-xl"
                style={{ background: `${color}20`, border: `1.5px solid ${color}60`, color, boxShadow: `0 0 24px ${color}50`, textShadow: `0 0 12px ${color}` }}>
                +{amount} XP ✨
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL UP MODAL
// ─────────────────────────────────────────────────────────────────────────────
const LevelUpModal = ({ color = '#10b981', glow, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}>
        <div className="relative max-w-sm w-full mx-4 p-10 rounded-3xl text-center"
            style={{ background: `linear-gradient(135deg, ${color}18, #060810)`, border: `1px solid ${color}45`, boxShadow: `0 0 100px ${glow || color + '40'}, 0 0 200px ${glow || color + '20'}` }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${color}99,transparent)` }} />
            <div className="text-7xl mb-6 inline-block" style={{ animation: 'bounce 0.8s ease infinite alternate' }}>🏆</div>
            <h2 className="text-4xl font-black text-white mb-3">¡Nivel Superado!</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">Has completado todos los ejercicios y desbloqueado el siguiente nivel de tu ruta de aprendizaje.</p>
            <button onClick={onClose}
                className="w-full py-4 rounded-2xl font-black text-base transition-all active:scale-[0.98] hover:brightness-110"
                style={{ background: `linear-gradient(135deg, ${color}cc, ${color})`, color: '#000', boxShadow: `0 8px 32px ${glow || color + '50'}` }}>
                Continuar la aventura →
            </button>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// BADGES DEFINITIONS + PANEL
// ─────────────────────────────────────────────────────────────────────────────
const BADGES = [
    { id: 'first_query',   icon: '🚀', title: 'Primera consulta',      desc: 'Completa tu primer ejercicio SQL',               check: (p) => p.completed >= 1 },
    { id: 'ten_done',      icon: '🔥', title: 'En racha',              desc: 'Completa 10 ejercicios',                         check: (p) => p.completed >= 10 },
    { id: 'twenty_five',   icon: '⭐', title: 'Aprendiz SQL',           desc: 'Completa 25 ejercicios',                         check: (p) => p.completed >= 25 },
    { id: 'fifty',         icon: '👑', title: 'SQL Maestro',            desc: 'Completa 50 ejercicios',                         check: (p) => p.completed >= 50 },
    { id: 'no_hints',      icon: '🧠', title: 'Mente brillante',        desc: 'Resuelve un ejercicio sin usar pistas',          check: (p, s) => (s.noHintsSolved || 0) >= 1 },
    { id: 'no_hints_5',    icon: '💎', title: 'Perfeccionista',         desc: 'Resuelve 5 ejercicios sin usar pistas',          check: (p, s) => (s.noHintsSolved || 0) >= 5 },
    { id: 'bug_hunter',    icon: '🐛', title: 'Cazador de bugs',        desc: 'Completa 3 ejercicios "Encuentra el error"',     check: (p, s) => (s.findBugDone || 0) >= 3 },
    { id: 'polyglot',      icon: '🎯', title: 'Polivalente',            desc: 'Completa un ejercicio de cada tipo',             check: (p, s) => (s.typesCompleted || 0) >= 5 },
];

const BadgesPanel = ({ progress }) => {
    const stats = {
        noHintsSolved: parseInt(localStorage.getItem('t4u_noHintsSolved') || '0'),
        findBugDone: parseInt(localStorage.getItem('t4u_findBugDone') || '0'),
        typesCompleted: parseInt(localStorage.getItem('t4u_typesCompleted') || '0'),
    };
    const earned = BADGES.filter(b => b.check(progress, stats));
    const locked = BADGES.filter(b => !b.check(progress, stats));
    return (
        <div className="h-full overflow-y-auto p-5 space-y-5 scrollbar-thin">
            {earned.length > 0 && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-3">✅ Conseguidos ({earned.length})</p>
                    <div className="grid grid-cols-2 gap-2">
                        {earned.map(b => (
                            <div key={b.id} className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 flex flex-col items-center text-center gap-1">
                                <span className="text-2xl">{b.icon}</span>
                                <p className="text-[11px] font-black text-emerald-300 leading-tight">{b.title}</p>
                                <p className="text-[10px] text-slate-500 leading-tight">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {locked.length > 0 && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">🔒 Por conseguir ({locked.length})</p>
                    <div className="grid grid-cols-2 gap-2">
                        {locked.map(b => (
                            <div key={b.id} className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col items-center text-center gap-1 opacity-45">
                                <span className="text-2xl grayscale">{b.icon}</span>
                                <p className="text-[11px] font-black text-slate-400 leading-tight">{b.title}</p>
                                <p className="text-[10px] text-slate-600 leading-tight">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS VIEW
// ─────────────────────────────────────────────────────────────────────────────
const AnalyticsView = ({ progress, onBack }) => {
    const totalAttempts = parseInt(localStorage.getItem('t4u_totalAttempts') || '0');
    const accuracy = totalAttempts > 0 ? Math.round((progress.completed / Math.max(progress.completed, totalAttempts)) * 100) : 0;
    const streak = parseInt(localStorage.getItem('t4u_streak') || '0');
    const byType = {
        free_query:    parseInt(localStorage.getItem('t4u_done_free_query') || '0'),
        fill_blank:    parseInt(localStorage.getItem('t4u_done_fill_blank') || '0'),
        order_clauses: parseInt(localStorage.getItem('t4u_done_order_clauses') || '0'),
        find_bug:      parseInt(localStorage.getItem('t4u_done_find_bug') || '0'),
        reverse_query: parseInt(localStorage.getItem('t4u_done_reverse_query') || '0'),
    };
    const typeInfo = {
        free_query:    { label: 'Escribe la consulta', color: '#3b82f6', icon: '💬' },
        fill_blank:    { label: 'Completa el hueco',   color: '#f59e0b', icon: '✏️' },
        order_clauses: { label: 'Ordena fragmentos',   color: '#8b5cf6', icon: '↕️' },
        find_bug:      { label: 'Encuentra el error',  color: '#ef4444', icon: '🐛' },
        reverse_query: { label: 'Query inversa',       color: '#06b6d4', icon: '🔄' },
    };
    const maxByType = Math.max(...Object.values(byType), 1);
    return (
        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4 space-y-6 scrollbar-thin">
            {/* Header row with back button */}
            <div className="flex items-center gap-4">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-slate-400 hover:text-white text-xs font-mono uppercase tracking-widest transition-all"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" /> Volver
                    </button>
                )}
                <h2 className="text-2xl font-black text-white">Tu progreso</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Completados', value: progress.completed, icon: '✅', color: '#10b981' },
                    { label: 'Días de racha', value: streak, icon: '🔥', color: '#f59e0b' },
                    { label: 'Precisión', value: `${accuracy}%`, icon: '🎯', color: '#3b82f6' },
                ].map((s, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-white/8 bg-white/[0.02] text-center">
                        <div className="text-3xl mb-2">{s.icon}</div>
                        <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>
            <div className="p-5 rounded-2xl border border-white/8 bg-white/[0.01]">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4">Ejercicios por tipo</p>
                <div className="space-y-3">
                    {Object.entries(byType).map(([type, count]) => {
                        const meta = typeInfo[type];
                        const pct = Math.round((count / maxByType) * 100);
                        return (
                            <div key={type} className="flex items-center gap-3">
                                <span className="text-base w-6 flex-shrink-0">{meta.icon}</span>
                                <span className="text-[11px] text-slate-400 w-36 flex-shrink-0">{meta.label}</span>
                                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${pct}%`, background: meta.color }} />
                                </div>
                                <span className="text-[11px] font-mono text-slate-500 w-6 text-right">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="p-5 rounded-2xl border border-white/8 bg-white/[0.01]">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4">Logros desbloqueados</p>
                <div className="grid grid-cols-4 gap-2">
                    {BADGES.filter(b => b.check(progress, { noHintsSolved: parseInt(localStorage.getItem('t4u_noHintsSolved')||'0'), findBugDone: parseInt(localStorage.getItem('t4u_findBugDone')||'0'), typesCompleted: parseInt(localStorage.getItem('t4u_typesCompleted')||'0') })).map(b => (
                        <div key={b.id} title={b.title} className="flex flex-col items-center gap-1 p-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5">
                            <span className="text-2xl">{b.icon}</span>
                            <p className="text-[9px] font-black text-emerald-400 text-center leading-tight">{b.title}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// WIKI PANEL
// ─────────────────────────────────────────────────────────────────────────────
const WikiPanel = ({ exercise }) => {
    if (!exercise) return null;
    const intro = getWikiIntro(exercise.wiki_title);
    return (
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
            {intro && (
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <p className="text-slate-300 text-xs leading-relaxed">{renderInline(intro)}</p>
                </div>
            )}
            {exercise.wiki_title && (
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">{exercise.wiki_title}</span>
                </div>
            )}
            {exercise.wiki_content && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Teoría</p>
                    <div className="text-slate-300 text-xs leading-relaxed">
                        {renderMarkdown(exercise.wiki_content)}
                    </div>
                </div>
            )}
            {exercise.wiki_syntax && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sintaxis</p>
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/5 bg-black/50">
                            <div className="w-2 h-2 rounded-full bg-red-500/60" /><div className="w-2 h-2 rounded-full bg-yellow-500/60" /><div className="w-2 h-2 rounded-full bg-green-500/60" />
                            <span className="text-[9px] font-mono text-slate-600 ml-2 uppercase tracking-widest">sintaxis</span>
                        </div>
                        <pre className="px-4 py-3 font-mono text-xs leading-relaxed overflow-x-auto text-slate-300"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlightSQL(exercise.wiki_syntax || '')) }} />
                    </div>
                </div>
            )}
            {/* wiki_example omitted intentionally — not shown to avoid giving away exercise solutions */}
            {exercise.er_diagram_url && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Diagrama ER</p>
                    <div className="rounded-xl border border-white/10 overflow-hidden bg-black/40 p-2">
                        <img src={exercise.er_diagram_url} alt="ER Diagram"
                            className="w-full h-auto rounded-lg opacity-80 hover:opacity-100 transition-opacity cursor-zoom-in"
                            onClick={() => window.open(exercise.er_diagram_url, '_blank')} />
                    </div>
                </div>
            )}
            {exercise.dataset_name && (
                <div className="pt-2 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Dataset activo</p>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/8">
                        <Database className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-mono text-slate-300">{exercise.dataset_name}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Map SQLite native types to human-friendly SQL standard types for display
function mapSqlType(raw) {
    const t = (raw || '').toUpperCase().trim();
    if (t === 'TEXT' || t.startsWith('VARCHAR') || t.startsWith('CHAR') || t.startsWith('CLOB') || t.startsWith('NVAR')) return 'VARCHAR';
    if (t === 'INTEGER' || t === 'INT' || t === 'TINYINT' || t === 'SMALLINT' || t === 'BIGINT') return 'INTEGER';
    if (t === 'REAL' || t === 'FLOAT' || t === 'DOUBLE') return 'FLOAT';
    if (t.startsWith('DECIMAL') || t === 'NUMERIC') return 'DECIMAL';
    if (t === 'BLOB' || t === 'BINARY') return 'BLOB';
    if (t.includes('BOOL')) return 'BOOLEAN';
    if (t === 'DATETIME' || (t.includes('DATE') && t.includes('TIME'))) return 'DATETIME';
    if (t.includes('DATE')) return 'DATE';
    if (t.includes('TIME')) return 'TIME';
    return raw || 'TEXT'; // fallback: show as-is
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA EXPLORER
// ─────────────────────────────────────────────────────────────────────────────
const SchemaExplorer = ({ datasetId }) => {
    const [schema, setSchema] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!datasetId) return;
        const load = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/sql/datasets/${datasetId}/schema`);
                setSchema(res.data);
            } catch (e) {
                console.error("Error loading schema", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [datasetId]);

    if (loading) return (
        <div className="p-5 space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded-xl bg-white/5" />
            ))}
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            {schema.map((table, i) => (
                <div key={i} className="glass rounded-xl border border-white/8 overflow-hidden">
                    <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/5 flex items-center gap-2">
                        <Database className="w-3 h-3 text-blue-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-white">{table.table}</span>
                    </div>
                    <div className="p-3 space-y-1.5">
                        {table.columns.map((col, ci) => (
                            <div key={ci} className="flex items-center justify-between text-[11px] font-mono">
                                <div className="flex items-center gap-2">
                                    <Hash className={`w-3 h-3 ${col.pk ? 'text-yellow-500' : 'text-slate-600'}`} />
                                    <span className={col.pk ? 'text-yellow-400' : 'text-slate-300'}>{col.name}</span>
                                </div>
                                <span className="text-slate-600 lowercase">{mapSqlType(col.type)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// DATASET CARD (landing page)
// ─────────────────────────────────────────────────────────────────────────────
const DatasetCard = ({ dataset, onSelect }) => {
    const meta = getDatasetMeta(dataset.name);
    return (
        <div
            onClick={() => onSelect(dataset.id)}
            className={`group relative glass rounded-3xl border ${meta.border} ${meta.borderHover} cursor-pointer
                        transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${meta.glow}
                        overflow-hidden flex flex-col`}
        >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-b ${meta.gradientFrom} ${meta.gradientTo} opacity-60 pointer-events-none`} />

            <div className="relative p-7 flex flex-col flex-1">
                {/* Top row: emoji + tag */}
                <div className="flex items-start justify-between mb-5">
                    <div className="text-5xl select-none">{meta.emoji}</div>
                    <span className={`px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest ${meta.text}`}>
                        {meta.tag}
                    </span>
                </div>

                {/* Dataset name */}
                <h3 className="text-xl font-black text-white mb-2 group-hover:text-white transition-colors">
                    {dataset.name}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-xs leading-relaxed mb-5 flex-1 line-clamp-4">
                    {dataset.description || `Practica SQL con datos del dataset ${dataset.name}.`}
                </p>

                {/* Tables chips */}
                {meta.tables.length > 0 && (
                    <div className="mb-4">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Tablas</p>
                        <div className="flex flex-wrap gap-1.5">
                            {meta.tables.map(t => (
                                <span key={t}
                                    className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/8 text-[9px] font-mono text-slate-500">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Topics / SQL concepts chips */}
                {meta.topics.length > 0 && (
                    <div className="mb-5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Aprenderás</p>
                        <div className="flex flex-wrap gap-1.5">
                            {meta.topics.map(t => (
                                <span key={t}
                                    className={`px-2 py-0.5 rounded-md bg-white/[0.04] border ${meta.border} text-[9px] font-mono ${meta.text} opacity-80`}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress bar per dataset */}
                {dataset.exercise_count > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mb-1.5">
                            <span>Progreso</span>
                            <span className={dataset.completed_count > 0 ? meta.text : ''}>
                                {dataset.completed_count}/{dataset.exercise_count}
                                {dataset.completed_count === dataset.exercise_count && dataset.exercise_count > 0 && ' ✓'}
                            </span>
                        </div>
                        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${meta.gradientFrom} to-white/30`}
                                style={{ width: `${Math.round((dataset.completed_count / dataset.exercise_count) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className={`flex items-center justify-between pt-4 border-t border-white/8`}>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                        <Layers className="w-3 h-3" />
                        <span>{dataset.exercise_count} ejercicios</span>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-black ${meta.text} group-hover:translate-x-1 transition-transform`}>
                        {dataset.completed_count > 0 ? 'Continuar' : 'Empezar'} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MODE CARD (for new exercise types)
// ─────────────────────────────────────────────────────────────────────────────
const ModeCard = ({ mode, meta, exerciseCount, completedCount, onSelect }) => {
    const ModeIcon = meta.Icon;
    return (
        <div
            onClick={() => onSelect(mode)}
            className={`group relative glass rounded-3xl border ${meta.border} cursor-pointer
                        transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${meta.glow}
                        overflow-hidden flex flex-col h-full`}
        >
            {/* Cover — SVG full-bleed header */}
            <div className="relative h-36 overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                    <SQLModeCoverComponent modeKey={meta.modeKey || 'write_query'} />
                </div>
                {/* Dark overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-black/20 to-transparent" />
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, rgba(${meta.accentRgb || '255,255,255'},1), transparent)` }} />
                {/* Icon chip bottom-left */}
                <div className={`absolute bottom-3 left-4 w-10 h-10 flex items-center justify-center rounded-xl bg-black/60 border ${meta.border} backdrop-blur-sm ${meta.text}`}>
                    {ModeIcon && <ModeIcon size={20} />}
                </div>
                {/* Exercise count chip top-right */}
                <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-[9px] font-black uppercase tracking-widest backdrop-blur-sm ${meta.text}`}>
                        {exerciseCount} ejercicios
                    </span>
                </div>
            </div>

            <div className="relative p-5 flex flex-col flex-1">
                {/* Title */}
                <h3 className="text-base font-black text-white mb-1.5 leading-tight">
                    {meta.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-xs leading-relaxed mb-4 flex-1">
                    {meta.description}
                </p>

                {/* Progress bar */}
                {exerciseCount > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mb-1.5">
                            <span>Progreso</span>
                            <span className={completedCount > 0 ? meta.text : ''}>
                                {completedCount}/{exerciseCount}
                                {completedCount === exerciseCount && exerciseCount > 0 && ' ✓'}
                            </span>
                        </div>
                        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${meta.gradientFrom} to-white/30`}
                                style={{ width: `${Math.round((completedCount / exerciseCount) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Footer button */}
                <div className="flex items-center justify-between pt-3 border-t border-white/8">
                    <span className={`flex items-center gap-1 text-xs font-black ${meta.text} group-hover:translate-x-1 transition-transform`}>
                        Practicar <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ESCRIBIR CONSULTA MASTER CARD
// ─────────────────────────────────────────────────────────────────────────────
const EscribirConsultaCard = ({ datasets, progress, onClick, isExpanded, onSelectDataset }) => {
    const meta = {
        Icon: IconTerminal,
        title: 'Escribe tu consulta',
        description: 'Domina SQL escribiendo consultas reales desde cero sobre diferentes escenarios únicos.',
        color: 'blue',
        gradientFrom: 'from-blue-600/25',
        gradientTo: 'to-blue-600/0',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/10',
    };

    const totalExercises = datasets.reduce((acc, ds) => acc + (ds.exercise_count || 0), 0);
    const completedExercises = datasets.reduce((acc, ds) => acc + (ds.completed_count || 0), 0);

    return (
        <div
            className={`group relative glass rounded-3xl border ${meta.border} transition-all duration-700 ease-in-out
                        ${isExpanded ? 'lg:col-span-4 ring-2 ring-blue-500/40 shadow-2xl shadow-blue-500/20 bg-blue-500/[0.02]' : 'hover:-translate-y-2 hover:shadow-2xl cursor-pointer'} ${meta.glow}
                        overflow-hidden flex flex-col h-full`}
            onClick={!isExpanded ? onClick : undefined}
        >
            {/* Cover — SVG full-bleed (hidden when expanded) */}
            {!isExpanded && (
                <div className="relative h-36 overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                        <CoverEscribeConsulta />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-black/20 to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,1), transparent)' }} />
                    <div className={`absolute bottom-3 left-4 w-10 h-10 flex items-center justify-center rounded-xl bg-black/60 border ${meta.border} backdrop-blur-sm ${meta.text}`}>
                        <IconTerminal size={20} />
                    </div>
                    <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-[9px] font-black uppercase tracking-widest backdrop-blur-sm ${meta.text}`}>
                            {datasets.length} escenarios
                        </span>
                    </div>
                </div>
            )}

            <div className="relative p-7 flex flex-col flex-1">
                {/* Header row with Close button if expanded */}
                {isExpanded && (
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 border ${meta.border} ${meta.text}`}>
                            <IconTerminal size={20} />
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClick(); }}
                            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all transform hover:rotate-90"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                    </div>
                )}

                {/* Title & Description */}
                <div className={isExpanded ? 'max-w-2xl' : ''}>
                    <h3 className={`font-black text-white mb-2 ${isExpanded ? 'text-xl' : 'text-base'}`}>
                        {meta.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                        {meta.description}
                    </p>
                </div>

                {/* Conditional Content: Expanded Grid vs Collapsed Progress */}
                {isExpanded ? (
                    <div className="mt-4 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-2 mb-6">
                            <Database className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selecciona un escenario para empezar</span>
                        </div>

                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {datasets.map((ds, idx) => (
                                <div key={ds.id} className="animate-in fade-in zoom-in-95 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <DatasetCard dataset={ds} onSelect={onSelectDataset} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Exercise count badge */}
                        <div className="mb-4 flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest ${meta.text}`}>
                                {datasets.length} laboratorios · {totalExercises} ejercicios
                            </span>
                        </div>

                        {/* Progress bar */}
                        {totalExercises > 0 && (
                            <div className="mb-5">
                                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mb-1.5">
                                    <span>Progreso total</span>
                                    <span className={completedExercises > 0 ? meta.text : ''}>
                                        {completedExercises}/{totalExercises}
                                        {completedExercises === totalExercises && totalExercises > 0 && ' ✓'}
                                    </span>
                                </div>
                                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${meta.gradientFrom} to-white/30`}
                                        style={{ width: `${Math.round((completedExercises / totalExercises) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Footer button */}
                        <div className={`mt-auto flex items-center justify-between pt-4 border-t border-white/8`}>
                            <span className={`flex items-center gap-1 text-xs font-black ${meta.text} group-hover:translate-x-1 transition-transform`}>
                                Explorar labs <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROADMAP VIEW — Ruta de Aprendizaje Guiada
// ─────────────────────────────────────────────────────────────────────────────
const LEVEL_CFG = [
    { color: '#3b82f6', glow: 'rgba(59,130,246,0.4)', keywords: ['SELECT', 'AS', 'LIMIT', 'DISTINCT', 'ORDER BY'] },
    { color: '#f59e0b', glow: 'rgba(245,158,11,0.4)', keywords: ['WHERE', 'AND', 'OR', 'NOT', '<>'] },
    { color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)', keywords: ['IN', 'BETWEEN', 'LIKE', 'IS NULL', 'NOT IN'] },
    { color: '#10b981', glow: 'rgba(16,185,129,0.4)', keywords: ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'] },
    { color: '#f97316', glow: 'rgba(249,115,22,0.4)', keywords: ['GROUP BY', 'HAVING'] },
    { color: '#06b6d4', glow: 'rgba(6,182,212,0.4)', keywords: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN'] },
    { color: '#a78bfa', glow: 'rgba(167,139,250,0.4)', keywords: ['IN (SELECT)', 'EXISTS', 'Derivadas'] },
    { color: '#f43f5e', glow: 'rgba(244,63,94,0.4)', keywords: ['CASE', 'WHEN', 'THEN', 'ELSE', 'END'] },
    { color: '#fb923c', glow: 'rgba(251,146,60,0.4)', keywords: ['EXTRACT', 'CONCAT', 'UPPER', 'TRIM', 'COALESCE'] },
    { color: '#c6ff33', glow: 'rgba(198,255,51,0.5)', keywords: ['ROW_NUMBER', 'RANK', 'PARTITION BY', 'UNION'] },
];

const RoadmapView = ({ onEnterLevel, onBack }) => {
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingEx, setLoadingEx] = useState(false);

    useEffect(() => {
        api.get('/sql/roadmap')
            .then(r => setLevels(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handlePickLevel = async (lvl) => {
        if (lvl.status === 'locked') return;
        setLoadingEx(true);
        try {
            const r = await api.get(`/sql/level/${lvl.id}/exercises`);
            onEnterLevel(lvl, r.data);
        } catch (_) { } finally { setLoadingEx(false); }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-slate-500 font-mono text-sm animate-pulse">Cargando roadmap…</div>
        </div>
    );

    if (levels.length === 0) return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="text-5xl">🗺️</div>
            <p className="text-slate-400 text-sm max-w-sm">
                El Roadmap aún no tiene niveles.
                <br />Ejecuta <code className="text-neon font-mono text-xs bg-neon/10 px-1.5 py-0.5 rounded">python seed_roadmap_levels.py</code>
            </p>
            <button onClick={onBack} className="mt-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-slate-300 transition-all">
                ← Volver
            </button>
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto pb-32">
            {/* ── CSS animations ── */}
            <style>{`
                @keyframes rm-pulse-down {
                    0%   { top: -100px; opacity: 0; }
                    15%  { opacity: 1; }
                    85%  { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .rm-pulse { animation: rm-pulse-down 2.8s ease-in-out infinite; }

                @keyframes rm-ring-out {
                    0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.7; }
                    100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
                }
                .rm-ring { animation: rm-ring-out 1.8s ease-out infinite; }

                @keyframes rm-card-in {
                    from { opacity:0; transform: translateY(12px) scale(0.97); }
                    to   { opacity:1; transform: translateY(0)    scale(1); }
                }
                .rm-card { animation: rm-card-in 0.35s ease forwards; }

                .rm-level-card:hover { transform: translateY(-2px) scale(1.015); }
                .rm-level-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }

                /* Subtle scanning shimmer across card surface */
                @keyframes rm-scan-line {
                    0%   { transform: translateX(-180%) skewX(-18deg); opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { transform: translateX(500%) skewX(-18deg); opacity: 0; }
                }
                .rm-scan { animation: rm-scan-line 5s ease-in-out infinite; }

                /* Border glow breathe — only on active/unlocked cards */
                @keyframes rm-border-breathe {
                    0%,100% { opacity: 0.35; }
                    50%     { opacity: 0.85; }
                }
                .rm-border-anim { animation: rm-border-breathe 3.5s ease-in-out infinite; }
            `}</style>

            <div className="max-w-3xl mx-auto px-6 pt-2">

                {/* ── PREMIUM HEADER ──────────────────────────────── */}
                <div className="relative mb-14 rounded-3xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(160deg, #080d18 0%, #060810 100%)',
                        border: '1px solid rgba(198,255,51,0.12)',
                        boxShadow: '0 0 80px rgba(198,255,51,0.06), 0 32px 80px rgba(0,0,0,0.5)',
                    }}>
                    {/* Grid dot pattern background */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(198,255,51,0.055) 1px, transparent 1px)',
                            backgroundSize: '26px 26px',
                        }} />
                    {/* Central radial glow */}
                    <div className="absolute pointer-events-none"
                        style={{
                            top: '-30%', left: '50%', transform: 'translateX(-50%)',
                            width: 520, height: 320,
                            background: 'radial-gradient(ellipse, rgba(198,255,51,0.1) 0%, transparent 70%)',
                        }} />
                    {/* Top border glow line */}
                    <div className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg,transparent 10%,rgba(198,255,51,0.5) 50%,transparent 90%)' }} />

                    <div className="relative z-10 pt-12 pb-10 px-8 text-center">

                        {/* Pill badge */}
                        <div className="inline-flex items-center gap-2.5 px-5 py-1.5 rounded-full mb-7"
                            style={{ background: 'rgba(198,255,51,0.07)', border: '1px solid rgba(198,255,51,0.22)' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c6ff33] animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#c6ff33]">Ruta de Aprendizaje SQL</span>
                        </div>

                        {/* Title block */}
                        <div className="mb-5">
                            <p className="text-[11px] font-medium text-slate-600 uppercase tracking-[0.4em] mb-2">De cero a</p>
                            <h2 className="text-5xl font-black uppercase tracking-tight leading-none"
                                style={{
                                    background: 'linear-gradient(135deg,#ffffff 0%,#d4ff80 45%,#c6ff33 100%)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                    filter: 'drop-shadow(0 0 28px rgba(198,255,51,0.45))',
                                }}>
                                MAESTRÍA SQL
                            </h2>
                        </div>

                        <p className="text-slate-600 text-[11px] max-w-xs mx-auto leading-relaxed">
                            10 niveles progresivos · Desbloquea el siguiente al completar el anterior
                        </p>

                        {/* Journey path + stats */}
                        {levels.length > 0 && (() => {
                            const done = levels.filter(l => l.status === 'completed').length;
                            const pct = Math.round((done / levels.length) * 100);
                            return (
                                <div className="mt-9">
                                    {/* Nodes path */}
                                    <div className="flex items-center justify-center flex-wrap gap-y-2 mb-7">
                                        {levels.map((l, i) => {
                                            const lCfg = LEVEL_CFG[i] || LEVEL_CFG[0];
                                            const isDone = l.status === 'completed';
                                            const isOpen = l.status === 'unlocked';
                                            const LvlIcon = LEVEL_ICONS[i] || LEVEL_ICONS[0];
                                            return (
                                                <React.Fragment key={i}>
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                                                            style={{
                                                                background: isDone ? '#c6ff33' : isOpen ? `${lCfg.color}22` : 'rgba(255,255,255,0.04)',
                                                                border: `1.5px solid ${isDone ? '#c6ff33' : isOpen ? lCfg.color : 'rgba(255,255,255,0.08)'}`,
                                                                boxShadow: isDone ? '0 0 10px rgba(198,255,51,0.55)' : isOpen ? `0 0 8px ${lCfg.glow}` : 'none',
                                                            }}>
                                                            {isDone
                                                                ? <span className="text-[#000] text-[10px] font-black">✓</span>
                                                                : <LvlIcon color={isDone ? '#000' : isOpen ? lCfg.color : '#2d3748'} size={14} />
                                                            }
                                                        </div>
                                                        <span className="text-[7px] font-black font-mono"
                                                            style={{ color: isDone ? '#c6ff33' : isOpen ? lCfg.color : '#374151' }}>
                                                            {l.order_index}
                                                        </span>
                                                    </div>
                                                    {i < levels.length - 1 && (
                                                        <div className="w-4 h-px mb-4 flex-shrink-0"
                                                            style={{ background: i < done ? 'rgba(198,255,51,0.35)' : 'rgba(255,255,255,0.06)' }} />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>

                                    {/* Stats trio */}
                                    <div className="flex items-center justify-center gap-8">
                                        <div className="text-center">
                                            <div className="text-3xl font-black leading-none" style={{ color: '#c6ff33' }}>{done}</div>
                                            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-700 mt-1">Completados</div>
                                        </div>
                                        <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.06)' }} />
                                        <div className="text-center">
                                            <div className="text-3xl font-black leading-none text-white">{pct}<span className="text-xl">%</span></div>
                                            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-700 mt-1">Progreso</div>
                                        </div>
                                        <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.06)' }} />
                                        <div className="text-center">
                                            <div className="text-3xl font-black leading-none text-slate-500">{levels.length - done}</div>
                                            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-700 mt-1">Por hacer</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Bottom border glow */}
                    <div className="absolute bottom-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg,transparent 10%,rgba(198,255,51,0.2) 50%,transparent 90%)' }} />
                </div>

                {/* ── ZIGZAG ROADMAP ──────────────────────────────── */}
                <div className="relative">

                    {/* Central line with neon pulse */}
                    <div className="absolute top-10 bottom-10 pointer-events-none overflow-hidden"
                        style={{ left: '50%', transform: 'translateX(-50%)', width: 3 }}>
                        {/* Static line */}
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(198,255,51,0.08) 0%, rgba(198,255,51,0.18) 50%, rgba(198,255,51,0.08) 100%)' }} />
                        {/* Travelling neon pulse */}
                        <div className="rm-pulse absolute w-full" style={{
                            height: 100,
                            background: 'linear-gradient(to bottom, transparent 0%, #c6ff33 35%, #c6ff33 65%, transparent 100%)',
                            boxShadow: '0 0 16px #c6ff33, 0 0 40px rgba(198,255,51,0.4)',
                        }} />
                    </div>

                    {levels.map((lvl, i) => {
                        const cfg = LEVEL_CFG[i] || LEVEL_CFG[0];
                        const isLeft = i % 2 === 0;
                        const isLocked = lvl.status === 'locked';
                        const isDone = lvl.status === 'completed';
                        const isNext = !isLocked && !isDone && (i === 0 || levels[i - 1]?.status !== 'locked');
                        const pct = lvl.exercises_count > 0
                            ? Math.round((lvl.completed_count / lvl.exercises_count) * 100) : 0;

                        const nodeColor = isLocked ? '#1e2030' : isDone ? '#c6ff33' : cfg.color;
                        const nodeBorder = isLocked ? 'rgba(255,255,255,0.07)' : isDone ? '#c6ff33' : cfg.color;

                        return (
                            <div key={lvl.id} className="rm-card relative flex items-center mb-8"
                                style={{
                                    justifyContent: isLeft ? 'flex-start' : 'flex-end',
                                    animationDelay: `${i * 0.06}s`, opacity: 0
                                }}>

                                {/* ── Central node ── */}
                                <div className="absolute z-20" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
                                    {/* Pulse ring for active level */}
                                    {isNext && (
                                        <div className="rm-ring absolute rounded-full pointer-events-none"
                                            style={{ width: 40, height: 40, border: `2px solid ${cfg.color}`, top: '50%', left: '50%' }} />
                                    )}
                                    <div className="relative flex items-center justify-center rounded-full z-10"
                                        style={{
                                            width: 40, height: 40,
                                            background: isDone ? '#c6ff33' : isLocked ? '#0d0f1a' : `${cfg.color}22`,
                                            border: `2px solid ${nodeBorder}`,
                                            boxShadow: isLocked ? 'none' : isDone
                                                ? '0 0 20px rgba(198,255,51,0.6)'
                                                : `0 0 20px ${cfg.glow}`,
                                        }}>
                                        {isDone
                                            ? <span className="text-[#0d0f1a] text-sm font-black">✓</span>
                                            : isLocked
                                                ? <Lock className="w-3.5 h-3.5 text-slate-700" />
                                                : <span className="text-xs font-black" style={{ color: cfg.color }}>{lvl.order_index}</span>
                                        }
                                    </div>
                                </div>

                                {/* ── Horizontal connector ── */}
                                <div className="absolute z-10" style={{
                                    top: '50%', transform: 'translateY(-50%)',
                                    left: isLeft ? 'calc(50% + 20px)' : 'auto',
                                    right: isLeft ? 'auto' : 'calc(50% + 20px)',
                                    width: 'calc(6% - 4px)', height: 2,
                                    background: isLocked
                                        ? 'rgba(255,255,255,0.04)'
                                        : isDone
                                            ? `linear-gradient(${isLeft ? '90deg' : '270deg'},rgba(198,255,51,0.5),rgba(198,255,51,0.1))`
                                            : `linear-gradient(${isLeft ? '90deg' : '270deg'},${cfg.color}55,${cfg.color}11)`,
                                }} />

                                {/* ── Level card ── */}
                                {(() => {
                                    const LvlIcon = LEVEL_ICONS[i] || LEVEL_ICONS[0];
                                    const borderColor = isLocked ? 'rgba(255,255,255,0.05)' : isDone ? 'rgba(198,255,51,0.3)' : `${cfg.color}40`;
                                    return (
                                        <div
                                            className="rm-level-card relative overflow-hidden rounded-2xl cursor-pointer"
                                            onClick={() => !isLocked && handlePickLevel(lvl)}
                                            style={{
                                                width: 'calc(43% - 6px)',
                                                background: isLocked
                                                    ? 'rgba(255,255,255,0.015)'
                                                    : isDone
                                                        ? 'rgba(198,255,51,0.05)'
                                                        : `linear-gradient(135deg, ${cfg.color}0d 0%, rgba(13,15,26,0.9) 100%)`,
                                                border: `1px solid ${borderColor}`,
                                                boxShadow: isLocked ? 'none'
                                                    : isDone ? '0 0 24px rgba(198,255,51,0.1), 0 8px 32px rgba(0,0,0,0.4)'
                                                        : `0 0 24px ${cfg.glow}22, 0 8px 32px rgba(0,0,0,0.4)`,
                                                opacity: isLocked ? 0.4 : 1,
                                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                            }}>

                                            {/* Top glow line */}
                                            {!isLocked && (
                                                <div className="absolute top-0 left-0 right-0 h-px"
                                                    style={{ background: `linear-gradient(90deg,transparent,${isDone ? '#c6ff33' : cfg.color}88,transparent)` }} />
                                            )}

                                            {/* Animated border breathe overlay (unlocked only) */}
                                            {!isLocked && (
                                                <div className="rm-border-anim absolute inset-0 pointer-events-none rounded-2xl"
                                                    style={{
                                                        boxShadow: `inset 0 0 0 1px ${isDone ? 'rgba(198,255,51,0.4)' : `${cfg.color}55`}`,
                                                    }} />
                                            )}

                                            {/* Scanning shimmer (only on unlocked, not locked) */}
                                            {!isLocked && (
                                                <div className="rm-scan absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                                                    <div style={{
                                                        position: 'absolute', top: 0, bottom: 0, width: '40%',
                                                        background: `linear-gradient(90deg, transparent 0%, ${isDone ? 'rgba(198,255,51,0.06)' : `${cfg.color}08`} 50%, transparent 100%)`,
                                                    }} />
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="p-4">
                                                {/* Level badge + title row */}
                                                <div className="flex items-center gap-3 mb-3">
                                                    {/* Icon box — SVG icon */}
                                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                                        style={{
                                                            background: isLocked ? 'rgba(255,255,255,0.04)'
                                                                : isDone ? 'rgba(198,255,51,0.15)'
                                                                    : `${cfg.color}18`,
                                                            border: `1px solid ${isLocked ? 'rgba(255,255,255,0.07)' : isDone ? 'rgba(198,255,51,0.3)' : `${cfg.color}30`}`,
                                                        }}>
                                                        {isLocked
                                                            ? <Lock className="w-4 h-4 text-slate-700" />
                                                            : <LvlIcon color={isDone ? '#c6ff33' : cfg.color} size={20} />
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <span className="text-[8px] font-black uppercase tracking-[0.18em]"
                                                                style={{ color: isLocked ? '#374151' : isDone ? '#c6ff33' : cfg.color }}>
                                                                NV.{lvl.order_index}
                                                            </span>
                                                            {isDone && <span className="text-[7px] font-black uppercase tracking-wide px-1 py-0.5 rounded-full bg-neon/15 text-neon border border-neon/30">✓ OK</span>}
                                                            {isNext && <span className="text-[7px] font-black uppercase tracking-wide px-1 py-0.5 rounded-full animate-pulse" style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}>SIGUIENTE</span>}
                                                        </div>
                                                        <p className="font-black text-[13px] text-white leading-tight truncate">{lvl.title}</p>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                {!isLocked && (
                                                    <p className="text-[10px] text-slate-500 leading-relaxed mb-3 line-clamp-2">{lvl.description}</p>
                                                )}

                                                {/* SQL keywords */}
                                                {!isLocked && (
                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                        {cfg.keywords.slice(0, 4).map(kw => (
                                                            <span key={kw} className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold"
                                                                style={{
                                                                    background: isDone ? 'rgba(198,255,51,0.08)' : `${cfg.color}12`,
                                                                    border: `1px solid ${isDone ? 'rgba(198,255,51,0.2)' : `${cfg.color}25`}`,
                                                                    color: isDone ? '#c6ff33' : cfg.color,
                                                                }}>
                                                                {kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Progress */}
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                        {!isLocked && (
                                                            <div className="h-full rounded-full transition-all duration-700"
                                                                style={{
                                                                    width: isLocked ? 0 : `${pct}%`,
                                                                    background: isDone ? '#c6ff33' : `linear-gradient(90deg,${cfg.color}99,${cfg.color})`,
                                                                    boxShadow: isDone ? '0 0 8px rgba(198,255,51,0.5)' : `0 0 8px ${cfg.glow}`,
                                                                }} />
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] font-mono flex-shrink-0"
                                                        style={{ color: isLocked ? '#374151' : isDone ? '#c6ff33' : cfg.color }}>
                                                        {isLocked ? '🔒' : `${lvl.completed_count}/${lvl.exercises_count}`}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bottom hover CTA */}
                                            {!isLocked && (
                                                <div className="px-4 pb-3 flex justify-end">
                                                    <span className="text-[9px] font-bold opacity-60"
                                                        style={{ color: isDone ? '#c6ff33' : cfg.color }}>
                                                        {isDone ? 'Repasar →' : pct > 0 ? 'Continuar →' : 'Empezar →'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ); // close IIFE return
                                })()} {/* close IIFE */}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── LOADING OVERLAY ── */}
            {loadingEx && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0d1017] border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-4 shadow-2xl">
                        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-400 animate-pulse">Abriendo Nivel...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// LANDING VIEW
// ─────────────────────────────────────────────────────────────────────────────
const LandingView = ({ datasets, modes, progress, onSelectDataset, onSelectMode, onOpenRoadmap, onOpenAnalytics }) => {
    const [showDatasets, setShowDatasets] = useState(false);
    const completedPct = progress.total > 0
        ? Math.round((progress.completed / progress.total) * 100)
        : 0;

    return (
        <div className="flex-1 overflow-y-auto pb-20">
            <div className="px-8 pt-0 max-w-7xl mx-auto">

                {/* ── PREMIUM HERO ─────────────────────────────────────────── */}
                <div className="relative mb-14 overflow-hidden rounded-3xl border border-white/[0.06]"
                    style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1526 40%, #080d18 100%)' }}>

                    {/* Animated grid background */}
                    <div className="absolute inset-0 opacity-[0.18]"
                        style={{
                            backgroundImage: `linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px),
                                               linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)`,
                            backgroundSize: '48px 48px',
                        }} />

                    {/* Radial glows */}
                    <div className="absolute top-0 left-1/4 w-96 h-64 rounded-full opacity-20 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.6) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                    <div className="absolute bottom-0 right-1/4 w-80 h-56 rounded-full opacity-15 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.5) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-40 opacity-10 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.5) 0%, transparent 70%)', filter: 'blur(60px)' }} />

                    {/* Content */}
                    <div className="relative z-10 px-10 pt-12 pb-10">

                        {/* Top badge row */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">SQL Skills · Práctica Interactiva</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03]">
                                <Code2 className="w-3 h-3 text-slate-500" />
                                <span className="text-[10px] font-mono text-slate-500">SQLite Engine</span>
                            </div>
                        </div>

                        {/* Main headline */}
                        <div className="mb-8">
                            <h1 className="text-5xl font-black tracking-tight leading-none mb-4">
                                <span className="text-white">Domina el lenguaje</span>
                                <br />
                                <span className="text-transparent bg-clip-text"
                                    style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa 0%, #34d399 50%, #818cf8 100%)' }}>
                                    de los datos
                                </span>
                            </h1>
                            <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                                Entrena con escenarios reales — desde <span className="text-slate-300 font-medium">SELECT básico</span> hasta <span className="text-slate-300 font-medium">subconsultas avanzadas</span>. Feedback instantáneo en cada consulta.
                            </p>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 mb-8">
                            {[
                                { label: 'Ejercicios', value: progress.total || '400+', color: 'text-blue-400' },
                                { label: 'Datasets', value: '3', color: 'text-emerald-400' },
                                { label: 'Modos', value: '5', color: 'text-violet-400' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
                                    <span className={`text-xl font-black ${color}`}>{value}</span>
                                    <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
                                </div>
                            ))}

                            {/* Vertical divider */}
                            <div className="w-px h-8 bg-white/10 mx-1" />

                            {/* Mode pills */}
                            {['SELECT', 'WHERE', 'JOIN', 'GROUP BY', 'HAVING'].map(kw => (
                                <span key={kw} className="hidden lg:inline-flex px-2.5 py-1 rounded-lg text-[10px] font-mono font-black tracking-wide border border-blue-500/15 bg-blue-500/8 text-blue-400">
                                    {kw}
                                </span>
                            ))}
                        </div>

                        {/* Progress bar — premium version */}
                        {progress.total > 0 && (
                            <div className="max-w-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-blue-400" />
                                        <span className="text-[11px] font-mono text-slate-400">Rendimiento Global</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-mono text-slate-500">{progress.completed} completados</span>
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black font-mono bg-blue-500/15 border border-blue-500/20 text-blue-400">
                                            {completedPct}%
                                        </span>
                                    </div>
                                </div>
                                {/* Track */}
                                <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    {/* Shimmer glow under bar */}
                                    <div className="absolute inset-0 rounded-full"
                                        style={{ background: 'rgba(59,130,246,0.08)' }} />
                                    {/* Fill */}
                                    <div className="h-full rounded-full transition-all duration-1000 ease-out relative"
                                        style={{
                                            width: `${completedPct}%`,
                                            background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 40%, #10b981 80%, #34d399 100%)',
                                            boxShadow: '0 0 12px rgba(59,130,246,0.5)',
                                        }} />
                                </div>
                                <div className="flex justify-between mt-1.5">
                                    <span className="text-[10px] font-mono text-slate-600">0%</span>
                                    <span className="text-[10px] font-mono text-slate-600">100%</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom edge fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), rgba(16,185,129,0.3), transparent)' }} />
                </div>

                {/* ══════════════════════════════════════════════════════════
                    SECTION: PATH DE APRENDIZAJE
                ══════════════════════════════════════════════════════════ */}
                <div className="mb-14">

                    {/* ── Section header ── */}
                    <div className="mb-6">
                        {/* Label pill */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">Path Aprendizaje</span>
                        </div>

                        {/* Big headline */}
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-3">
                            <span className="text-white">Ruta de</span>{' '}
                            <span className="text-transparent bg-clip-text"
                                style={{ backgroundImage: 'linear-gradient(90deg, #34d399 0%, #60a5fa 60%, #818cf8 100%)' }}>
                                Aprendizaje SQL
                            </span>
                        </h2>

                        {/* Tagline */}
                        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                            7 niveles progresivos con desbloqueo secuencial — desde{' '}
                            <span className="text-slate-200 font-medium font-mono">SELECT básico</span> hasta{' '}
                            <span className="text-slate-200 font-medium font-mono">subconsultas avanzadas</span>.
                            Sigue tu evolución en tiempo real con el panel de analíticas integrado.
                        </p>
                    </div>

                    {/* ── Cards grid: Roadmap (2/3) + Analytics (1/3) ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* ROADMAP CARD — 2/3 width */}
                        <div
                            onClick={() => onOpenRoadmap(true)}
                            className="lg:col-span-2 relative overflow-hidden rounded-2xl border cursor-pointer group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(16,185,129,0.12)]"
                            style={{
                                background: 'linear-gradient(135deg, #060f0b 0%, #081018 50%, #060c0f 100%)',
                                borderColor: 'rgba(16,185,129,0.22)',
                            }}>

                            {/* Mesh glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none"
                                style={{ background: 'radial-gradient(ellipse at top right, rgba(16,185,129,0.6) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                            <div className="absolute bottom-0 left-0 w-48 h-40 opacity-10 pointer-events-none"
                                style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.7) 0%, transparent 70%)', filter: 'blur(50px)' }} />

                            {/* Top border glow */}
                            <div className="absolute top-0 left-0 right-0 h-px"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), rgba(59,130,246,0.3), transparent)' }} />

                            <div className="relative z-10 px-8 pt-7 pb-6">
                                {/* Badges row */}
                                <div className="flex items-center gap-2 mb-5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.18em] border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                        Aprendizaje Guiado
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">·</span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">7 Niveles Progresivos</span>
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-black text-white mb-1.5 tracking-tight">Ruta de Aprendizaje SQL</h3>
                                <p className="text-slate-400 text-[13px] leading-relaxed mb-6">
                                    Cada nivel desbloquea el siguiente. Completa los ejercicios en orden para consolidar cada concepto antes de avanzar al siguiente.
                                </p>

                                {/* Level progression */}
                                <div className="flex items-center gap-2 mb-5">
                                    {[
                                        { Icon: Table,         label: 'SELECT', bg: 'rgba(59,130,246,0.18)',  border: 'rgba(59,130,246,0.35)',  iconCol: '#60a5fa' },
                                        { Icon: Filter,        label: 'WHERE',  bg: 'rgba(16,185,129,0.14)',  border: 'rgba(16,185,129,0.30)',  iconCol: '#34d399' },
                                        { Icon: ArrowUpDown,   label: 'ORDER',  bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.09)', iconCol: '#64748b' },
                                        { Icon: Layers,        label: 'GROUP',  bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.09)', iconCol: '#64748b' },
                                        { Icon: GitMerge,      label: 'JOIN',   bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.09)', iconCol: '#64748b' },
                                        { Icon: ListFilter,    label: 'HAVING', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.09)', iconCol: '#64748b' },
                                        { Icon: Braces,        label: 'SUB',    bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.09)', iconCol: '#64748b' },
                                    ].map(({ Icon, label, bg, border, iconCol }, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1.5" style={{ opacity: i > 1 ? 0.4 : 1 }}>
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center border"
                                                style={{ background: bg, borderColor: border }}
                                            >
                                                <Icon className="w-4.5 h-4.5" style={{ color: iconCol, width: '18px', height: '18px' }} />
                                            </div>
                                            <span className="text-[8px] font-mono font-black uppercase text-slate-600">{label}</span>
                                        </div>
                                    ))}
                                    <div className="flex-1 flex items-center justify-center opacity-30">
                                        <div className="h-px flex-1 border-t border-dashed border-slate-600" />
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500/60" /> Desbloqueo secuencial</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500/60" /> Feedback instantáneo</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 font-black text-xs group-hover:bg-emerald-500/18 transition-all group-hover:translate-x-0.5">
                                        Iniciar ruta <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom accent */}
                            <div className="absolute bottom-0 left-0 right-0 h-px"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.4), rgba(59,130,246,0.3), transparent)' }} />
                        </div>

                        {/* ANALYTICS CARD — 1/3 width */}
                        <div
                            onClick={onOpenAnalytics}
                            className="relative overflow-hidden rounded-2xl border cursor-pointer group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(99,102,241,0.12)]"
                            style={{
                                background: 'linear-gradient(160deg, #09080f 0%, #0d0a18 50%, #080710 100%)',
                                borderColor: 'rgba(99,102,241,0.22)',
                            }}>

                            {/* Glow */}
                            <div className="absolute top-0 right-0 w-48 h-48 opacity-20 pointer-events-none"
                                style={{ background: 'radial-gradient(ellipse at top right, rgba(168,85,247,0.7) 0%, transparent 70%)', filter: 'blur(40px)' }} />

                            {/* Top border */}
                            <div className="absolute top-0 left-0 right-0 h-px"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(168,85,247,0.4), transparent)' }} />

                            <div className="relative z-10 px-7 pt-7 pb-6 flex flex-col h-full">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-500/25 bg-violet-500/10 text-[9px] font-black uppercase tracking-[0.18em] text-violet-400 w-fit mb-5">
                                    <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
                                    Panel de Analíticas
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-black text-white mb-1.5 tracking-tight">Tu Progreso</h3>
                                <p className="text-slate-500 text-[12px] leading-relaxed mb-6 flex-1">
                                    Precisión por tipo de consulta, racha diaria, logros y estadísticas completas de tu evolución.
                                </p>

                                {/* Live stats */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                                        <div className="text-2xl font-black text-violet-400 font-mono">{progress.completed}</div>
                                        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wide mt-0.5">Completados</div>
                                    </div>
                                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                                        <div className="text-2xl font-black text-amber-400 font-mono">
                                            {(() => { try { return localStorage.getItem('t4u_streak') || 0; } catch { return 0; } })()}
                                        </div>
                                        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wide mt-0.5">Racha</div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-slate-600">Logros · Ranking · Precisión</span>
                                    <div className="flex items-center gap-1.5 text-violet-400 font-black text-xs group-hover:translate-x-0.5 transition-transform">
                                        Ver todo <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom accent */}
                            <div className="absolute bottom-0 left-0 right-0 h-px"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(168,85,247,0.3), transparent)' }} />
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════
                    SECTION: EJERCICIOS PRÁCTICOS SQL
                ══════════════════════════════════════════════════════════ */}
                <div className="mb-8">
                    {/* Label pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/8 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-400">Práctica Libre</span>
                    </div>

                    {/* Big headline */}
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-3">
                        <span className="text-white">Ejercicios</span>{' '}
                        <span className="text-transparent bg-clip-text"
                            style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa 0%, #818cf8 70%, #a78bfa 100%)' }}>
                            Prácticos SQL
                        </span>
                    </h2>
                    <p className="text-slate-400 text-sm max-w-2xl leading-relaxed mb-8">
                        Elige tu modo de práctica libre y pon a prueba tus consultas sobre datasets reales con feedback instantáneo.
                    </p>
                </div>

                {/* MAIN GRID: Escribe tu consulta + Modes */}
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[auto_auto] mb-12">

                    {/* MASTER CARD: Escribe tu consulta (Expands internally) */}
                    <EscribirConsultaCard
                        datasets={datasets}
                        progress={progress}
                        onClick={() => setShowDatasets(!showDatasets)}
                        isExpanded={showDatasets}
                        onSelectDataset={onSelectDataset}
                    />

                    {/* REST OF MODES (Hidden if master is expanded to focus UI) */}
                    {!showDatasets && modes && modes.map(mode => {
                        const meta = MODE_META[mode.mode] || {};
                        return (
                            <ModeCard
                                key={mode.mode}
                                mode={mode.mode}
                                meta={meta}
                                exerciseCount={mode.total}
                                completedCount={mode.completed}
                                onSelect={onSelectMode}
                            />
                        );
                    })}
                </div>

                {/* Footer info — premium strip */}
                <div className="mt-12 flex items-center justify-center gap-6">
                    {[
                        { icon: <Code2 className="w-3 h-3" />, text: 'Motor SQLite persistente' },
                        { icon: <Zap className="w-3 h-3" />, text: 'Feedback instantáneo' },
                        { icon: <Sparkles className="w-3 h-3" />, text: 'Progreso sincronizado' },
                    ].map(({ icon, text }) => (
                        <div key={text} className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
                            <span className="text-blue-500/40">{icon}</span>
                            {text}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS FOR EDITOR COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const ExerciseSidebar = ({
    title, subtitle, color, glow, icon: Icon, progressText,
    loading, exercises, selectedId, setSelectedId, exerciseListRef,
    sortedGroupEntries, normalizeCat, normalizeTitle, nextExId, activeLevelCfg
}) => (
    <div className="w-56 flex-shrink-0 flex flex-col glass rounded-2xl border border-white/8 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 flex-shrink-0 flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 flex-shrink-0" style={{ color }}>
                {Icon ? <Icon size={16} /> : <Database size={16} />}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{subtitle}</p>
                <p className="text-[11px] font-black truncate" style={{ color }}>{title}</p>
            </div>
            <div className="flex-shrink-0 text-right">
                <p className="text-[10px] font-black font-mono" style={{ color }}>{progressText}</p>
            </div>
        </div>

        <div ref={exerciseListRef} className="flex-1 overflow-y-auto py-2 scrollbar-thin">
            {loading ? (
                <div className="space-y-1 px-2">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : sortedGroupEntries.map(([cat, exList]) => (
                <div key={cat} className="mb-1">
                    <p className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-600">
                        {normalizeCat(cat)}
                    </p>
                    {exList.map(ex => {
                        const isActive = ex.id === selectedId;
                        const isDoneEx = ex.completed;
                        const isNextEx = ex.id === nextExId && !isActive;
                        const acEx = color || '#3b82f6';
                        const acGlowEx = glow || 'rgba(59,130,246,0.3)';

                        return (
                            <button
                                key={ex.id}
                                ref={el => { if (el && isActive) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }}
                                onClick={() => setSelectedId(ex.id)}
                                className="w-full flex items-center gap-2 px-2.5 py-2 text-left transition-all relative"
                                style={{
                                    background: isActive ? `${acEx}18` : isDoneEx ? 'rgba(255,255,255,0.015)' : 'transparent',
                                    borderRight: isActive ? `2.5px solid ${acEx}` : '2.5px solid transparent',
                                    borderLeft: isNextEx ? `2px solid ${acEx}66` : '2px solid transparent',
                                }}
                            >
                                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-[8px] font-black transition-all"
                                    style={{
                                        background: isDoneEx ? `${acEx}25` : isActive ? `${acEx}30` : isNextEx ? `${acEx}15` : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${isDoneEx ? `${acEx}50` : isActive ? acEx : isNextEx ? `${acEx}40` : 'rgba(255,255,255,0.08)'}`,
                                        boxShadow: isActive ? `0 0 6px ${acGlowEx}` : 'none',
                                        color: isDoneEx ? acEx : isActive ? acEx : isNextEx ? `${acEx}99` : '#374151',
                                    }}>
                                    {isDoneEx ? '✓' : isActive ? '▶' : ex.order_num}
                                </div>
                                <span className="text-[11px] font-mono truncate flex-1 transition-all"
                                    style={{ color: isDoneEx ? '#4b5563' : isActive ? '#ffffff' : isNextEx ? '#94a3b8' : '#475569' }}>
                                    {normalizeTitle(ex.title)}
                                </span>
                                {isDoneEx && <span className="flex-shrink-0 text-[8px] font-black" style={{ color: `${acEx}60` }}>✓</span>}
                                {isNextEx && <span className="flex-shrink-0 text-[7px] font-black uppercase tracking-wide animate-pulse" style={{ color: acEx }}>→</span>}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STANDARD EDITOR COMPONENT (Preserves existing UI)
// ─────────────────────────────────────────────────────────────────────────────
const StandardEditor = ({
    datasetMeta, activeMode, activeDatasetName, exercises, loadingExercises,
    selectedId, setSelectedId, exercise, activeTab, setActiveTab, query, setQuery,
    running, handleRun, autoAdvanceCountdown, setAutoAdvanceCountdown, setAutoAdvanceTarget,
    nextExercise, handleRevealSolution, loadingSolution, solution, setSolution,
    feedback, setFeedback, solutionError, actualResult, setActualResult, history,
    activeSideTab, setActiveSideTab, activeDatasetId, highlightSQL, TABS, SIDE_TABS,
    MODE_META, normalizeCat, normalizeTitle, sortedGroupEntries, exerciseListRef, user
}) => {
    const firstUndone = exercises.find(ex => !ex.completed);
    const nextExId = firstUndone?.id;

    return (
        <div className="relative flex flex-1 overflow-hidden px-8 pb-8 gap-4 min-h-0 transition-all duration-700">
            <ExerciseSidebar
                title={activeMode ? MODE_META[activeMode]?.title : activeDatasetName}
                subtitle={activeMode ? 'Modo' : 'Dataset'}
                color={datasetMeta.color}
                glow={datasetMeta.glow}
                icon={datasetMeta.Icon}
                progressText={`${exercises.filter(e => e.completed).length}/${exercises.length}`}
                loading={loadingExercises}
                exercises={exercises}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                exerciseListRef={exerciseListRef}
                sortedGroupEntries={sortedGroupEntries}
                normalizeCat={normalizeCat}
                normalizeTitle={normalizeTitle}
                nextExId={nextExId}
            />

            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto">
                {exercise ? (
                    <>
                        <div className="glass rounded-2xl border border-white/8 p-5">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono uppercase tracking-widest">
                                    <span className="text-slate-500">{activeMode ? MODE_META[activeMode]?.title : exercise.dataset_name}</span>
                                    <ChevronRight className="w-3 h-3 text-slate-700" />
                                    <span className="text-slate-500">{exercise.category}</span>
                                    <ChevronRight className="w-3 h-3 text-slate-700" />
                                    <span className="text-blue-400">{exercise.title}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <DiffBadge d={exercise.difficulty} />
                                    {exercise.completed && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                                            <CheckCircle className="w-2.5 h-2.5" /> Completado
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1 border-b border-white/8 mb-4">
                                {TABS.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-px ${activeTab === tab.id ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-white'}`}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            {activeTab === 'ejercicio' && <p className="text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exercise.description || '') }} />}
                            {activeTab === 'resultado-esp' && (exercise.expected_result ? <div className="space-y-2"><p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Esto es lo que debe devolver tu consulta correcta:</p><ResultTable result={exercise.expected_result} accent="blue" /></div> : <p className="text-slate-600 font-mono text-xs">No hay resultado esperado disponible.</p>)}
                        </div>

                        {exercise.exercise_type === 'reverse_query' && exercise.expected_result && (
                            <div className="glass rounded-2xl border border-white/8 p-5 space-y-3">
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Este es el resultado esperado — escribe la query que lo produce</p>
                                <ResultTable result={exercise.expected_result} accent="blue" />
                            </div>
                        )}

                        {(!user?.isPremium && exercise.order_num > 2) ? (
                            <div className="glass rounded-2xl border border-blue-500/20 p-8 text-center bg-blue-500/5 mt-4">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                                    <Lock size={32} className="text-blue-400" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">Este contenido es Premium</h3>
                                <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                                    Desbloquea todos los laboratorios y ejercicios avanzados con Tech4U Premium.
                                </p>
                                <button
                                    onClick={() => navigate('/planes')}
                                    className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/25"
                                >
                                    Ver planes
                                </button>
                            </div>
                        ) : (
                            <>
                                {(exercise.exercise_type === 'free_query' || exercise.exercise_type === 'find_bug' || exercise.exercise_type === 'reverse_query') && (
                                    <div className="glass rounded-2xl border border-white/8 p-5 space-y-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <Code2 className="w-4 h-4 text-blue-400" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{exercise.exercise_type === 'find_bug' ? 'Encuentra y corrige el bug' : 'Editor SQL'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-mono text-slate-600 hidden sm:block">Ctrl + Shift + Enter para ejecutar</span>
                                                <button onClick={() => setQuery('')} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors" title="Limpiar editor"><RotateCcw className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                        <SQLEditor value={query} onChange={setQuery} disabled={running} />
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button onClick={handleRun} disabled={running || !query.trim()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/30">
                                                <Play className="w-3.5 h-3.5" /> {running ? 'Ejecutando...' : 'Ejecutar'} <span className="text-blue-300 font-normal text-[9px]">Ctrl+Shift+↵</span>
                                            </button>
                                            <button onClick={() => { setQuery(''); setActualResult(null); setFeedback(null); }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono uppercase transition-all"><RotateCcw className="w-3 h-3" /> Limpiar</button>
                                        </div>
                                        {feedback && <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${feedback.correct ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>{feedback.correct ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}<div><p className="font-bold">{feedback.correct ? '¡Correcto!' : 'Incorrecto'}</p><p className="text-[11px] opacity-80 font-mono mt-0.5">{feedback.message}</p></div></div>}
                                        {actualResult && <div className="space-y-2 pt-1"><p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Resultado de tu consulta · {actualResult.rows?.length ?? 0} filas</p><ResultTable result={actualResult} accent={feedback?.correct ? 'emerald' : 'slate'} /></div>}
                                    </div>
                                )}

                                {exercise.exercise_type === 'fill_blank' && (
                                    <div className="space-y-4">
                                        <FillBlankEditor key={exercise.id} template_sql={exercise.template_sql} onQueryChange={setQuery} disabled={running} />
                                        <div className="glass rounded-2xl border border-white/8 p-5 space-y-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button onClick={handleRun} disabled={running || !query.trim()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/30">
                                                    <Play className="w-3.5 h-3.5" /> {running ? 'Ejecutando...' : 'Ejecutar'}
                                                </button>
                                            </div>
                                            {feedback && <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${feedback.correct ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><div><p className="font-bold">{feedback.correct ? '¡Correcto!' : 'Incorrecto'}</p><p className="text-[11px] opacity-80 font-mono mt-0.5">{feedback.message}</p></div></div>}
                                        </div>
                                    </div>
                                )}

                                {exercise.exercise_type === 'order_clauses' && (
                                    <div className="space-y-4">
                                        <div className="glass rounded-2xl border border-white/8 p-5 space-y-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button onClick={handleRun} disabled={running || !query.trim()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/30">
                                                    <Play className="w-3.5 h-3.5" /> {running ? 'Verificando...' : 'Verificar'}
                                                </button>
                                            </div>
                                            {feedback && <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${feedback.correct ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><div><p className="font-bold">{feedback.correct ? '¡Correcto!' : 'Incorrecto'}</p><p className="text-[11px] opacity-80 font-mono mt-0.5">{feedback.message}</p></div></div>}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 glass rounded-2xl border border-white/8">
                        <Database className="w-10 h-10 text-slate-700 mb-3" />
                        <p className="text-slate-500 font-mono text-sm">Selecciona un ejercicio</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PathEditor = ({
    datasetMeta, activeLevelCfg, exercises, loadingExercises,
    selectedId, setSelectedId, exercise, activeTab, setActiveTab, query, setQuery,
    running, handleRun, autoAdvanceCountdown, setAutoAdvanceCountdown, setAutoAdvanceTarget,
    nextExercise, handleRevealSolution, loadingSolution, solution, setSolution,
    feedback, setFeedback, solutionError, actualResult, setActualResult, history,
    activeSideTab, setActiveSideTab, activeDatasetId, highlightSQL, TABS, SIDE_TABS,
    MODE_META, normalizeCat, normalizeTitle, sortedGroupEntries, exerciseListRef,
    progress, hintsUsed, onUseHint, user
}) => {
    // Determine "next to do" exercise id
    const firstUndone = exercises.find(ex => !ex.completed);
    const nextExId = firstUndone?.id;

    const accentColor = activeLevelCfg?.color || '#3b82f6';
    const accentGlow = activeLevelCfg?.glow || 'rgba(59,130,246,0.3)';

    // Local state for the collapsible info panel (Wiki / Schema) at the top
    const [infoTab, setInfoTab] = useState('wiki');
    const [infoOpen, setInfoOpen] = useState(true);

    return (
        <div className="relative flex flex-1 overflow-hidden px-6 pb-6 gap-6 min-h-0 transition-all duration-700 bg-gradient-to-b from-black via-[#080b14] to-black">
            {/* ── COMMAND TIMELINE (SIDEBAR) ─────────────────── */}
            <div className="w-64 flex-shrink-0 flex flex-col gap-4">
                {/* ── MISIÓN ESPECIAL CARD ── */}
                {(() => {
                    const doneEx = exercises.filter(e => e.completed).length;
                    const totalEx = exercises.length;
                    const pct = totalEx > 0 ? Math.round((doneEx / totalEx) * 100) : 0;
                    const LvlIconSidebar = LEVEL_ICONS[(activeLevelCfg?.order_index ?? 1) - 1] || LEVEL_ICONS[0];
                    return (
                        <div className="relative overflow-hidden rounded-2xl p-4"
                            style={{
                                background: `linear-gradient(135deg, ${accentColor}12 0%, rgba(13,15,26,0.9) 100%)`,
                                border: `1px solid ${accentColor}30`,
                                boxShadow: `0 0 20px ${accentGlow}20`,
                            }}>
                            {/* Top glow line */}
                            <div className="absolute top-0 left-0 right-0 h-px"
                                style={{ background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)` }} />

                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0"
                                    style={{
                                        background: `${accentColor}18`,
                                        border: `1px solid ${accentColor}35`,
                                        boxShadow: `0 0 12px ${accentGlow}30`,
                                    }}>
                                    <LvlIconSidebar color={accentColor} size={22} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.22em]"
                                        style={{ color: `${accentColor}90` }}>
                                        Misión Especial
                                    </p>
                                    <p className="text-sm font-black text-white leading-tight truncate">
                                        {activeLevelCfg?.title || `Nivel ${activeLevelCfg?.order_index}`}
                                    </p>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="text-center">
                                        <p className="text-lg font-black leading-none" style={{ color: accentColor }}>{doneEx}</p>
                                        <p className="text-[7px] font-black uppercase tracking-wide text-slate-600 mt-0.5">Hechos</p>
                                    </div>
                                    <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.06)' }} />
                                    <div className="text-center">
                                        <p className="text-lg font-black leading-none text-slate-400">{totalEx - doneEx}</p>
                                        <p className="text-[7px] font-black uppercase tracking-wide text-slate-600 mt-0.5">Quedan</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black leading-none" style={{ color: accentColor }}>
                                        {pct}<span className="text-sm">%</span>
                                    </p>
                                    <p className="text-[7px] font-black uppercase tracking-wide text-slate-600 mt-0.5">Progreso</p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${pct}%`,
                                        background: `linear-gradient(90deg, ${accentColor}80, ${accentColor})`,
                                        boxShadow: pct > 0 ? `0 0 12px ${accentGlow}` : 'none',
                                    }} />
                            </div>
                        </div>
                    );
                })()}

                <div className="flex-1 glass rounded-2xl border border-white/8 overflow-hidden flex flex-col bg-white/[0.01]">
                    <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Timeline de Comandos</span>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full animate-pulse bg-emerald-500" />
                            <div className="w-1 h-1 rounded-full animate-pulse bg-emerald-500 delay-75" />
                        </div>
                    </div>

                    <div ref={exerciseListRef} className="flex-1 overflow-y-auto py-3 scrollbar-thin">
                        {loadingExercises ? (
                            <div className="space-y-2 px-3">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="relative px-3">

                                <div className="space-y-0.5">
                                    {exercises.map((ex, idx) => {
                                        const isActive = ex.id === selectedId;
                                        const isDone = ex.completed;
                                        const isNext = ex.id === nextExId && !isActive;
                                        // Locked = not completed AND not the current "next to do" exercise
                                        const isLocked = !isDone && ex.id !== nextExId && !isActive;
                                        const exType = ex.exercise_type || 'free_query';

                                        const prevCat = idx > 0 ? normalizeCat(exercises[idx - 1].category) : null;
                                        const curCat = normalizeCat(ex.category);
                                        const showCatHeader = curCat !== prevCat;

                                        const TYPE_LABELS = {
                                            free_query: 'CONSULTA',
                                            fill_blank: 'HUECO',
                                            find_bug: 'BUG',
                                            order_clauses: 'ORDEN',
                                            reverse_query: 'INVERSA',
                                        };

                                        // ── Category header ───────────────────────
                                        const catHeader = showCatHeader ? (
                                            <div className={`flex items-center gap-2 ml-10 ${idx === 0 ? 'pb-1.5' : 'pt-3 pb-1.5'}`}>
                                                <span className="text-[7px] font-black uppercase tracking-[0.25em]"
                                                    style={{
                                                        color: isLocked
                                                            ? 'rgba(255,255,255,0.07)'
                                                            : isDone ? '#10b981' : `${accentColor}70`
                                                    }}>
                                                    {isLocked ? '••••••' : curCat}
                                                </span>
                                                <div className="flex-1 h-px"
                                                    style={{ background: isLocked ? 'rgba(255,255,255,0.04)' : `${accentColor}18` }} />
                                            </div>
                                        ) : null;

                                        // ── LOCKED exercise ───────────────────────
                                        if (isLocked) {
                                            return (
                                                <React.Fragment key={ex.id}>
                                                    {catHeader}
                                                    <div className="relative group w-full cursor-not-allowed">
                                                        {/* Dimmed content */}
                                                        <div className="w-full flex items-center gap-2.5 py-1 pr-3 rounded-xl select-none"
                                                            style={{ opacity: 0.22 }}>
                                                            {/* Nodo — candado */}
                                                            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full"
                                                                style={{
                                                                    background: 'rgba(255,255,255,0.02)',
                                                                    border: '2px solid rgba(255,255,255,0.05)',
                                                                }}>
                                                                <Lock size={11} className="text-slate-600" />
                                                            </div>
                                                            {/* Texto borroso */}
                                                            <div className="min-w-0 flex-1 text-left overflow-hidden">
                                                                <p className="text-[11px] font-bold text-slate-500 truncate leading-tight"
                                                                    style={{ filter: 'blur(3.5px)', userSelect: 'none' }}>
                                                                    {normalizeTitle(ex.title)}
                                                                </p>
                                                                <span className="text-[7px] font-black uppercase tracking-[0.18em] text-slate-700">
                                                                    {TYPE_LABELS[exType] || 'CONSULTA'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Hover overlay — tooltip de candado */}
                                                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                                                            transition-opacity duration-150 flex items-center justify-center gap-2 px-3"
                                                            style={{
                                                                background: 'rgba(4,6,14,0.92)',
                                                                backdropFilter: 'blur(4px)',
                                                                border: `1px solid ${accentColor}25`,
                                                            }}>
                                                            <Lock size={11} style={{ color: accentColor, flexShrink: 0 }} />
                                                            <span className="text-[9px] font-black uppercase tracking-wider leading-tight"
                                                                style={{ color: accentColor }}>
                                                                Completa el ejercicio actual para desbloquear
                                                            </span>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        }

                                        // ── UNLOCKED exercise (done / active / next) ──
                                        const nodeBg = isDone
                                            ? 'rgba(16,185,129,0.12)'
                                            : isActive
                                                ? `${accentColor}22`
                                                : 'rgba(255,255,255,0.025)';
                                        const nodeBorder = isDone
                                            ? 'rgba(16,185,129,0.55)'
                                            : isActive
                                                ? accentColor
                                                : isNext
                                                    ? `${accentColor}45`
                                                    : 'rgba(255,255,255,0.07)';
                                        const nodeGlow = isActive
                                            ? `0 0 14px ${accentColor}55, inset 0 0 8px ${accentColor}12`
                                            : isDone
                                                ? '0 0 8px rgba(16,185,129,0.3)'
                                                : 'none';

                                        return (
                                            <React.Fragment key={ex.id}>
                                                {catHeader}
                                                <button
                                                    onClick={() => setSelectedId(ex.id)}
                                                    className="w-full group relative flex items-center gap-2.5 py-1 pr-3 rounded-xl transition-all"
                                                    style={{
                                                        background: isActive ? `${accentColor}0d` : 'transparent',
                                                    }}
                                                >
                                                    {/* Nodo circular */}
                                                    <div className="relative z-10 w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full transition-all"
                                                        style={{
                                                            background: nodeBg,
                                                            border: `2px solid ${nodeBorder}`,
                                                            boxShadow: nodeGlow,
                                                        }}>
                                                        {isDone
                                                            ? <Check size={12} className="text-emerald-400" />
                                                            : isActive
                                                                ? <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: accentColor }} />
                                                                : <span className="text-[9px] font-black font-mono"
                                                                    style={{ color: isNext ? accentColor : '#2d3748' }}>
                                                                    {ex.order_num}
                                                                </span>
                                                        }
                                                    </div>

                                                    {/* Contenido */}
                                                    <div className="min-w-0 flex-1 text-left">
                                                        <p className={`text-[11px] font-bold truncate leading-tight transition-colors
                                                            ${isActive ? 'text-white' : isDone ? 'text-slate-500' : isNext ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                                            {normalizeTitle(ex.title)}
                                                        </p>
                                                        <span className="text-[7px] font-black uppercase tracking-[0.18em]"
                                                            style={{
                                                                color: isActive ? `${accentColor}99` : isDone ? 'rgba(16,185,129,0.5)' : '#2d3748'
                                                            }}>
                                                            {TYPE_LABELS[exType] || 'CONSULTA'}
                                                        </span>
                                                    </div>

                                                    {isActive && (
                                                        <ChevronRight size={11} style={{ color: accentColor, flexShrink: 0 }} />
                                                    )}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── COMMAND TERMINAL (CENTER) ─────────────────── */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto scrollbar-thin">
                {exercise && (
                    <>
                        {/* ── COLLAPSIBLE INFO PANEL (Wiki / Esquema) ── */}
                        <div className="glass rounded-2xl border border-white/8 bg-white/[0.01] overflow-hidden flex-shrink-0">
                            {/* Tab bar */}
                            <div className="flex items-center border-b border-white/8 bg-black/30">
                                {[
                                    { id: 'wiki',   label: 'Wiki',    icon: BookOpen },
                                    { id: 'schema', label: 'Esquema', icon: Database },
                                ].map(tab => {
                                    const Icon = tab.icon;
                                    const active = infoTab === tab.id && infoOpen;
                                    return (
                                        <button key={tab.id}
                                            onClick={() => {
                                                if (infoOpen && infoTab === tab.id) setInfoOpen(false);
                                                else { setInfoTab(tab.id); setInfoOpen(true); }
                                            }}
                                            className={`flex items-center gap-1.5 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all relative
                                                ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                                            <Icon size={12} style={{ color: active ? accentColor : undefined }} />
                                            {tab.label}
                                            {active && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                                                    style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
                                            )}
                                        </button>
                                    );
                                })}
                                <div className="flex-1" />
                                {/* Collapse toggle */}
                                <button onClick={() => setInfoOpen(v => !v)}
                                    className="flex items-center gap-1 px-3 py-2.5 text-[9px] font-mono text-slate-600 hover:text-slate-300 transition-colors uppercase tracking-widest">
                                    {infoOpen ? 'Ocultar' : 'Ver teoría'}
                                    <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${infoOpen ? '-rotate-90' : 'rotate-90'}`} />
                                </button>
                            </div>
                            {/* Content — max height to keep it compact */}
                            {infoOpen && (
                                <div className="max-h-56 overflow-y-auto scrollbar-thin">
                                    {infoTab === 'wiki'
                                        ? <WikiPanel exercise={exercise} />
                                        : <SchemaExplorer datasetId={activeDatasetId || exercise?.dataset_id} />
                                    }
                                </div>
                            )}
                        </div>

                        <div className="glass rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col">
                            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between bg-black/40">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                    </div>
                                    <div className="h-4 w-px bg-white/10 mx-2" />
                                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                                        <Terminal size={12} />
                                        <span>Terminal v4.2 // Input_Channel</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <DiffBadge d={exercise.difficulty} />
                                    {exercise?.completed && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black tracking-widest uppercase">
                                            <ShieldCheck size={12} /> Desbloqueado
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Teoría inlined removed — now in the collapsible Wiki tab above */}

                            {/* ── Enunciado ── */}
                            <div className="px-6 pt-5 pb-4 border-b border-white/6">
                                {/* Badge de tipo */}
                                {(() => {
                                    const TYPE_INFO = {
                                        free_query:     { label: 'Escribe la consulta',      color: accentColor },
                                        fill_blank:     { label: 'Completa el hueco',         color: '#f59e0b' },
                                        order_clauses:  { label: 'Ordena los fragmentos',     color: '#8b5cf6' },
                                        find_bug:       { label: 'Encuentra el error',        color: '#ef4444' },
                                        reverse_query:  { label: 'Query inversa',             color: '#06b6d4' },
                                    };
                                    const info = TYPE_INFO[exercise.exercise_type] || TYPE_INFO.free_query;
                                    return (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-2"
                                            style={{ background: `${info.color}15`, border: `1px solid ${info.color}35`, color: info.color }}>
                                            {info.label}
                                        </span>
                                    );
                                })()}
                                <h2 className="text-xl font-black text-white mb-1.5">{exercise.title}</h2>
                                <p className="text-slate-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exercise.description || '') }} />

                                {/* Tablas disponibles para free_query */}
                                {exercise.exercise_type === 'free_query' && exercise.dataset_name && (() => {
                                    const meta = getDatasetMeta(exercise.dataset_name);
                                    if (!meta.tables || meta.tables.length === 0) return null;
                                    return (
                                        <div className="flex items-start gap-2 mt-3 px-3 py-2.5 rounded-xl"
                                            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)' }}>
                                            <span className="text-sm">🗂️</span>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-400/70 mb-1">Tablas disponibles en esta base de datos</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {meta.tables.map(t => (
                                                        <code key={t} className="px-2 py-0.5 rounded text-[11px] font-mono font-black text-blue-300"
                                                            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
                                                            {t}
                                                        </code>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Hint contextual por tipo cuando no hay wiki */}
                                {!exercise.wiki_content && (() => {
                                    const HINTS = {
                                        free_query:    null, // Sin hint extra, el enunciado ya lo explica
                                        fill_blank:    { icon: '✏️', text: 'Rellena cada ___ con la palabra SQL correcta. Los huecos forman la consulta completa.' },
                                        order_clauses: { icon: '🧩', text: 'Haz clic en los fragmentos en el orden correcto para construir la query válida.' },
                                        find_bug:      { icon: '🐛', text: 'La query de abajo contiene un error. Encuéntralo, corrígelo y pulsa Ejecutar.' },
                                        reverse_query: { icon: '🔄', text: 'Analiza el resultado esperado y escribe la query SQL que lo genera.' },
                                    };
                                    const hint = HINTS[exercise.exercise_type];
                                    if (!hint) return null;
                                    return (
                                        <div className="flex items-start gap-2 mt-3 px-3 py-2.5 rounded-xl"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <span className="text-sm">{hint.icon}</span>
                                            <p className="text-[11px] text-slate-400 leading-relaxed">{hint.text}</p>
                                        </div>
                                    );
                                })()}

                                {/* Tabla esperada para reverse_query */}
                                {exercise.exercise_type === 'reverse_query' && exercise.expected_result && (
                                    <div className="mt-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                            Resultado esperado — escribe la query que lo produce:
                                        </p>
                                        <ResultTable result={exercise.expected_result} accent="cyan" />
                                    </div>
                                )}
                            </div>

                            {/* ── Editor SQL (tipo-específico) ── */}
                            <div className="px-6 pt-5 pb-4">
                                {(!user?.isPremium && exercise.order_num > 2) ? (
                                    <div className="glass rounded-2xl border border-blue-500/20 p-6 text-center bg-blue-500/5 my-4">
                                        <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3">
                                            <Lock size={24} className="text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-black text-white mb-2">Este contenido es Premium</h3>
                                        <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">
                                            Desbloquea todos los laboratorios y ejercicios avanzados con Tech4U Premium.
                                        </p>
                                        <button
                                            onClick={() => window.location.href = '/planes'}
                                            className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase tracking-widest transition-all"
                                        >
                                            Ver planes
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {exercise.exercise_type !== 'order_clauses' && (
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                                    <Code2 size={12} />
                                                    <span>{exercise.exercise_type === 'fill_blank' ? 'Completa el hueco' : exercise.exercise_type === 'find_bug' ? 'Corrige el error' : 'Editor SQL'}</span>
                                                </div>
                                                {exercise.exercise_type !== 'fill_blank' && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[9px] font-mono text-slate-700 hidden sm:block">Tab para indentar</span>
                                                        <button onClick={() => setQuery('')}
                                                            className="p-1.5 rounded-lg border border-white/5 hover:border-white/15 hover:bg-white/5 text-slate-600 hover:text-slate-300 transition-all"
                                                            title="Limpiar editor">
                                                            <RotateCcw size={13} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {exercise.exercise_type === 'fill_blank' ? (
                                            <FillBlankEditor
                                                key={exercise.id}
                                                template_sql={exercise.template_sql}
                                                onQueryChange={setQuery}
                                                disabled={running}
                                            />
                                        ) : exercise.exercise_type === 'order_clauses' ? (
                                            <OrderClausesEditor
                                                key={exercise.id}
                                                fragments={(() => {
                                                    try {
                                                        return typeof exercise.fragments === 'string'
                                                            ? JSON.parse(exercise.fragments)
                                                            : (exercise.fragments || []);
                                                    } catch { return []; }
                                                })()}
                                                onQueryChange={setQuery}
                                                disabled={running}
                                            />
                                        ) : (
                                            <SQLEditor value={query} onChange={setQuery} disabled={running} />
                                        )}
                                    </>
                                )}
                            </div>

                            {/* ── Barra de acciones fija al fondo de la tarjeta ── */}
                            <div className="px-6 py-4 border-t border-white/6 flex items-center gap-3 flex-wrap"
                                style={{ background: 'rgba(0,0,0,0.25)' }}>
                                {/* Run button */}
                                <button
                                    onClick={handleRun}
                                    disabled={running || !query.trim()}
                                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-extrabold text-sm uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                                    style={{
                                        background: running ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg, ${accentColor}cc, ${accentColor})`,
                                        color: '#000',
                                        boxShadow: !running && query.trim() ? `0 0 24px ${accentGlow}, 0 4px 16px rgba(0,0,0,0.4)` : 'none',
                                    }}
                                >
                                    <Play size={15} fill="currentColor" />
                                    {running ? 'Ejecutando...' : 'Ejecutar'}
                                </button>

                                {/* Keyboard shortcut */}
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-700">
                                    <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">Ctrl</kbd>
                                    <span>+</span>
                                    <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">⇧</kbd>
                                    <span>+</span>
                                    <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">↵</kbd>
                                </div>

                                {/* XP reward + streak inline */}
                                <div className="flex items-center gap-3 ml-auto">
                                    {/* Streak */}
                                    {progress && (
                                        <div className="flex items-center gap-1 text-[10px] font-mono">
                                            <Flame size={11} className="text-orange-400" />
                                            <span className="text-orange-400 font-black">{parseInt(localStorage.getItem('t4u_streak') || '0')}</span>
                                            <span className="text-slate-600">días</span>
                                        </div>
                                    )}
                                    {/* Divider */}
                                    {progress && <div className="w-px h-4 bg-white/10" />}
                                    {/* XP reward */}
                                    {exercise?.xp_reward && (
                                        <div className="flex items-center gap-1 text-[10px] font-mono">
                                            <Zap size={11} style={{ color: accentColor }} />
                                            <span className="font-black" style={{ color: accentColor }}>{exercise.xp_reward} XP</span>
                                            {hintsUsed > 0 && (
                                                <span className="text-amber-500 font-bold">
                                                    (-{[3,5,10].slice(0,hintsUsed).reduce((a,b)=>a+b,0)})
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Siguiente button (when correct) */}
                                {feedback?.correct && (
                                    <button onClick={nextExercise}
                                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500/25 transition-all animate-pulse">
                                        Siguiente <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ── HINTS PANEL (shown when not correct yet) ── */}
                        {exercise && !feedback?.correct && (
                            <div className="glass rounded-2xl border border-amber-500/15 bg-amber-500/[0.02] px-6 py-4">
                                <HintsPanel exercise={exercise} hintsUsed={hintsUsed} onUseHint={onUseHint} />
                            </div>
                        )}

                        {/* ── RESULTS DOCK ──────────────────────────── */}
                        <div className="glass rounded-2xl border border-white/8 bg-white/[0.01] flex flex-col overflow-hidden min-h-[260px]">
                            <div className="px-6 py-3 border-b border-white/8 bg-black/20 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <Activity size={14} /> Resultado de la consulta
                                </div>
                                {actualResult && (
                                    <span className="text-[10px] font-mono text-slate-600">{actualResult.rows?.length} fila{actualResult.rows?.length !== 1 ? 's' : ''}</span>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                                {feedback && (
                                    <div className={`mb-5 p-4 rounded-xl border flex gap-4 items-start ${feedback.correct ? 'bg-emerald-500/10 border-emerald-500/30' : feedback.isError ? 'bg-orange-500/10 border-orange-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                        <div className={`p-2 rounded-lg ${feedback.correct ? 'bg-emerald-500/20 text-emerald-400' : feedback.isError ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {feedback.correct ? <MonitorCheck size={20} /> : feedback.isError ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-black uppercase tracking-tight ${feedback.correct ? 'text-emerald-400' : feedback.isError ? 'text-orange-400' : 'text-red-400'}`}>
                                                {feedback.correct ? '✅ ¡Correcto!' : feedback.isError ? '⚠️ Error de sintaxis' : '❌ Resultado incorrecto'}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 font-mono break-words">{feedback.message}</p>
                                            {feedback.xp && <p className="text-xs font-black text-emerald-400 mt-1">+{feedback.xp} XP ganados 🎉</p>}
                                        </div>
                                    </div>
                                )}

                                {actualResult ? (
                                    <>
                                        <ResultTable result={actualResult} accent={feedback?.correct ? 'emerald' : 'slate'} />
                                        {/* Show diff only when incorrect and not a syntax error */}
                                        {feedback && !feedback.correct && !feedback.isError && (
                                            <ResultDiff actualResult={actualResult} exercise={exercise} />
                                        )}
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-12">
                                        <Cpu size={48} className="mb-4" />
                                        <p className="text-xs font-mono uppercase tracking-[0.3em]">Ejecuta tu consulta para ver los resultados</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Right panel removed — Wiki and Schema are now in the top collapsible tab */}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SQLSkillsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    // View state
    const [view, setView] = useState('landing'); // 'landing' | 'editor' | 'roadmap'
    const [activeDatasetId, setActiveDatasetId] = useState(null);
    const [activeDatasetName, setActiveDatasetName] = useState('');
    const [activeMode, setActiveMode] = useState(null); // null | 'fill_blank' | 'find_bug' | 'order_clauses' | 'reverse_query'
    const [activeLevelCfg, setActiveLevelCfg] = useState(null); // set when entering from roadmap
    const [showLevelIntro, setShowLevelIntro] = useState(false); // intro splash when entering a level

    // Ref for exercise list scroll-to-active
    const exerciseListRef = useRef(null);

    // Data state
    const [datasets, setDatasets] = useState([]);
    const [modes, setModes] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [exercise, setExercise] = useState(null);

    // Editor state
    const [query, setQuery] = useState('');
    const [actualResult, setActualResult] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [running, setRunning] = useState(false);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('ejercicio');

    // Solution reveal (unlocked after 3 attempts)
    const [solution, setSolution] = useState(null);
    const [loadingSolution, setLoadingSolution] = useState(false);
    const [solutionError, setSolutionError] = useState('');

    // Auto-advance countdown after a correct answer
    const [autoAdvanceTarget, setAutoAdvanceTarget] = useState(null); // id of next exercise
    const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(null); // 3,2,1 → 0

    // Loading states
    const [loadingDatasets, setLoadingDatasets] = useState(true);
    const [loadingExercises, setLoadingExercises] = useState(false);

    // Global progress
    const [progress, setProgress] = useState({ total: 0, completed: 0 });

    // ── Gamification state ──────────────────────────────────────────────
    const [hintsUsed, setHintsUsed] = useState(0);         // hints used for current exercise
    const [xpFloat, setXPFloat] = useState(null);          // { amount, color } for floating animation
    const [showLevelUpModal, setShowLevelUpModal] = useState(false);

    // Reset hints when switching exercises
    useEffect(() => { setHintsUsed(0); }, [selectedId]);

    // Handle hint usage with XP penalty tracking
    const handleUseHint = useCallback((xpCost) => {
        setHintsUsed(prev => prev + 1);
        // Track total hints used in localStorage for analytics
        const prev = parseInt(localStorage.getItem('t4u_totalAttempts') || '0');
        localStorage.setItem('t4u_totalAttempts', String(prev + 1));
    }, []);

    // Update streak on mount (rough daily streak logic)
    useEffect(() => {
        const today = new Date().toDateString();
        const lastDay = localStorage.getItem('t4u_lastStudyDay');
        if (!lastDay) {
            localStorage.setItem('t4u_lastStudyDay', today);
            localStorage.setItem('t4u_streak', '1');
        } else if (lastDay !== today) {
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (lastDay === yesterday) {
                const s = parseInt(localStorage.getItem('t4u_streak') || '0') + 1;
                localStorage.setItem('t4u_streak', String(s));
            } else {
                localStorage.setItem('t4u_streak', '1');
            }
            localStorage.setItem('t4u_lastStudyDay', today);
        }
    }, []);

    // ── Load datasets + modes + progress on mount ────────────────────
    useEffect(() => {
        const init = async () => {
            setLoadingDatasets(true);
            try {
                const [dsRes, progRes, modesRes] = await Promise.all([
                    api.get('/sql/datasets'),
                    api.get('/sql/progress'),
                    api.get('/sql/modes').catch(() => ({ data: [] })), // Fallback if not available
                ]);
                setDatasets(dsRes.data);
                setProgress(progRes.data);
                setModes(modesRes.data || []);
            } catch (e) {
                if (import.meta.env.DEV) console.error('Error loading datasets', e);
            } finally {
                setLoadingDatasets(false);
            }
        };
        init();
    }, []);

    // ── Select dataset → go to editor ────────────────────────
    const handleSelectDataset = useCallback(async (datasetId) => {
        const ds = datasets.find(d => d.id === datasetId);
        setActiveDatasetId(datasetId);
        setActiveDatasetName(ds?.name || '');
        setActiveMode(null);
        setExercises([]);
        setSelectedId(null);
        setExercise(null);
        setActualResult(null);
        setFeedback(null);
        setQuery('');
        setView('editor');

        setLoadingExercises(true);
        try {
            const res = await api.get(`/sql/exercises?dataset_id=${datasetId}`);
            setExercises(res.data);
            if (res.data.length) setSelectedId(res.data[0].id);
        } catch (e) {
            if (import.meta.env.DEV) console.error('Error loading exercises', e);
        } finally {
            setLoadingExercises(false);
        }
    }, [datasets]);

    // ── Select mode → load mode exercises ────────────────────
    const handleSelectMode = useCallback(async (mode) => {
        setActiveMode(mode);
        setActiveDatasetId(null);
        setActiveDatasetName('');
        setExercises([]);
        setSelectedId(null);
        setExercise(null);
        setActualResult(null);
        setFeedback(null);
        setQuery('');
        setView('editor');

        setLoadingExercises(true);
        try {
            const res = await api.get(`/sql/exercises?exercise_type=${mode}`);
            setExercises(res.data);
            if (res.data.length) setSelectedId(res.data[0].id);
        } catch (e) {
            if (import.meta.env.DEV) console.error('Error loading exercises', e);
        } finally {
            setLoadingExercises(false);
        }
    }, []);

    // ── Back to landing ───────────────────────────────────────
    const handleBackToLanding = useCallback(() => {
        setView('landing');
        setActiveDatasetId(null);
        setActiveMode(null);
        setActiveLevelCfg(null);
        setShowLevelIntro(false);
        setExercise(null);
        setActualResult(null);
        setFeedback(null);
        setQuery('');
        setHistory([]);
    }, []);

    // ── Back to roadmap (from level editor) ──────────────────
    const handleBackToRoadmap = useCallback(() => {
        setView('roadmap');
        setActiveLevelCfg(null);
        setShowLevelIntro(false);
        setExercise(null);
        setActualResult(null);
        setFeedback(null);
        setQuery('');
    }, []);

    // ── Enter level from Roadmap ──────────────────────────────
    const handleEnterLevel = useCallback((lvl, lvlExercises) => {
        if (!lvlExercises || lvlExercises.length === 0) return;
        const idx = (lvl.order_index || 1) - 1;
        const cfg = LEVEL_CFG[idx] || LEVEL_CFG[0];

        // ── Ordenar por order_num para respetar la estructura de conceptos del currículo ──
        const sorted = [...lvlExercises].sort((a, b) => (a.order_num ?? 999) - (b.order_num ?? 999));

        // Resume from first uncompleted exercise (not always #1)
        const firstUncompleted = sorted.find(ex => !ex.completed);
        const startId = firstUncompleted?.id || sorted[0].id;
        setActiveMode(null);
        setActiveDatasetId(null);
        setActiveDatasetName(`Nivel ${lvl.order_index}: ${lvl.title}`);
        setActiveLevelCfg({
            order_index: lvl.order_index,
            title: lvl.title,
            description: lvl.description || '',
            color: cfg.color,
            glow: cfg.glow,
            keywords: cfg.keywords || [],
            totalEx: sorted.length,
            doneEx: sorted.filter(e => e.completed).length,
        });
        setExercises(sorted);
        setSelectedId(startId);
        setExercise(null);
        setActualResult(null);
        setFeedback(null);
        setQuery('');
        setShowLevelIntro(true);  // show intro splash before exercises
        setView('editor');
    }, []);

    // ── Open Roadmap / Auto-start ────────────────────────────
    const handleOpenRoadmap = useCallback(async (autoStart = false) => {
        if (!autoStart) {
            setView('roadmap');
            return;
        }

        // Auto-start logic: Find current level
        try {
            const r = await api.get('/sql/roadmap');
            const levels = r.data;
            const currentLvl = levels.find(l => l.status === 'unlocked') || levels[0];

            if (currentLvl) {
                // Fetch exercises for this level and enter
                const exRes = await api.get(`/sql/level/${currentLvl.id}/exercises`);
                handleEnterLevel(currentLvl, exRes.data);
            } else {
                setView('roadmap');
            }
        } catch (e) {
            setView('roadmap');
        }
    }, [handleEnterLevel]);

    // ── Load single exercise ─────────────────────────────────
    useEffect(() => {
        if (!selectedId) return;
        const load = async () => {
            try {
                const res = await api.get(`/sql/exercises/${selectedId}`);
                setExercise(res.data);

                // Handle initial query based on exercise type
                if (res.data.exercise_type === 'find_bug') {
                    // For find_bug, use buggy_sql as default
                    setQuery(res.data.completed ? '' : (res.data.buggy_sql || ''));
                } else {
                    // For other types, use last_query if available
                    setQuery(res.data.completed ? '' : (res.data.last_query || ''));
                }

                setActualResult(null);
                setFeedback(null);
                setActiveTab('ejercicio');
            } catch (e) {
                if (import.meta.env.DEV) console.error('Error loading exercise', e);
            }
        };
        load();
    }, [selectedId]);

    // ── Execute query ────────────────────────────────────────
    const handleRun = useCallback(async () => {
        if (!query.trim() || !exercise) return;
        setRunning(true);
        setFeedback(null);
        try {
            const res = await api.post('/sql/execute', { exercise_id: exercise.id, query });
            const data = res.data;

            if (!data.ok) {
                setFeedback({ correct: false, message: data.error, isError: true });
                setActualResult(null);
            } else {
                setActualResult(data.result);
                setFeedback({
                    correct: data.is_correct,
                    message: data.is_correct
                        ? data.xp_gained ? `+${data.xp_gained} XP obtenidos` : 'Ejercicio ya completado anteriormente'
                        : 'El resultado no coincide con la solución esperada. Compara las tablas e inténtalo de nuevo.',
                    xp: data.xp_gained,
                    leveled_up: data.leveled_up,
                });

                if (data.is_correct) {
                    setExercises(prev => prev.map(ex =>
                        ex.id === exercise.id ? { ...ex, completed: true } : ex
                    ));
                    if (data.xp_gained > 0) {
                        setProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
                        trackEvent('sql_exercise_completed', String(exercise.id), 'sql_exercise', {
                            exercise_type: exercise.exercise_type,
                            xp_gained: data.xp_gained,
                        });
                        // Trigger XP float animation
                        setXPFloat({ amount: data.xp_gained, color: activeLevelCfg?.color || '#10b981' });
                        // Track per-type completed count for analytics
                        const typeKey = `t4u_done_${exercise.exercise_type}`;
                        localStorage.setItem(typeKey, String(parseInt(localStorage.getItem(typeKey) || '0') + 1));
                        // Track types diversity for badges
                        const doneTypes = new Set(['free_query','fill_blank','order_clauses','find_bug','reverse_query']
                            .filter(t => parseInt(localStorage.getItem(`t4u_done_${t}`) || '0') > 0));
                        localStorage.setItem('t4u_typesCompleted', String(doneTypes.size));
                        // Track no-hints solves
                        if (hintsUsed === 0) {
                            const nh = parseInt(localStorage.getItem('t4u_noHintsSolved') || '0') + 1;
                            localStorage.setItem('t4u_noHintsSolved', String(nh));
                        }
                        // Track find_bug completions
                        if (exercise.exercise_type === 'find_bug') {
                            const fb = parseInt(localStorage.getItem('t4u_findBugDone') || '0') + 1;
                            localStorage.setItem('t4u_findBugDone', String(fb));
                        }
                        // Track total attempts
                        const ta = parseInt(localStorage.getItem('t4u_totalAttempts') || '0') + 1;
                        localStorage.setItem('t4u_totalAttempts', String(ta));
                        // Level up modal
                        if (data.leveled_up) setShowLevelUpModal(true);
                    }
                    setExercise(prev => prev ? { ...prev, completed: true } : prev);

                    // Start auto-advance countdown to next exercise
                    const curIdx = exercises.findIndex(ex => ex.id === exercise.id);
                    const nxt = curIdx >= 0 && curIdx < exercises.length - 1 ? exercises[curIdx + 1] : null;
                    if (nxt) {
                        setAutoAdvanceTarget(nxt.id);
                        setAutoAdvanceCountdown(6);
                    }
                } else {
                    // Track failed attempts
                    const ta = parseInt(localStorage.getItem('t4u_totalAttempts') || '0') + 1;
                    localStorage.setItem('t4u_totalAttempts', String(ta));
                }
            }

            // Add to history only for exercise types that produce SQL strings
            if (exercise.exercise_type !== 'order_clauses') {
                setHistory(prev => {
                    const entry = { query, ts: new Date().toLocaleTimeString('es-ES') };
                    return [entry, ...prev].slice(0, 5);
                });
            }
        } catch (e) {
            const msg =
                e?.response?.data?.detail ||
                e?.response?.data?.error ||
                e?.message ||
                'Error de red. Inténtalo de nuevo.';
            setFeedback({ correct: false, message: msg, isError: true });
        } finally {
            setRunning(false);
        }
    }, [query, exercise, exercises]);

    // Ctrl+Shift+Enter shortcut
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
                e.preventDefault();
                handleRun();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleRun]);

    // Auto-advance countdown: tick every second, navigate when it hits 0
    useEffect(() => {
        if (autoAdvanceCountdown === null) return;
        if (autoAdvanceCountdown === 0) {
            setSelectedId(autoAdvanceTarget);
            setAutoAdvanceCountdown(null);
            setAutoAdvanceTarget(null);
            return;
        }
        const t = setTimeout(() => setAutoAdvanceCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [autoAdvanceCountdown, autoAdvanceTarget]);

    // Reset solution reveal + countdown when the user changes exercise
    useEffect(() => {
        setSolution(null);
        setSolutionError('');
        setAutoAdvanceCountdown(null);
        setAutoAdvanceTarget(null);
    }, [selectedId]);

    // ── Reveal solution (unlocked after 3 attempts) ──────────
    const handleRevealSolution = useCallback(async () => {
        if (!exercise) return;
        setLoadingSolution(true);
        setSolutionError('');
        try {
            const res = await api.get(`/sql/exercises/${exercise.id}/solution`);
            setSolution(res.data.solution_sql);
        } catch (e) {
            const detail = e?.response?.data?.detail || 'Error al obtener la solución.';
            setSolutionError(detail);
        } finally {
            setLoadingSolution(false);
        }
    }, [exercise]);

    // ── Derived state ────────────────────────────────────────
    const grouped = exercises.reduce((acc, ex) => {
        if (!acc[ex.category]) acc[ex.category] = [];
        acc[ex.category].push(ex);
        return acc;
    }, {});

    // Sort categories by the minimum order_num of their exercises (guaranteed sequential order)
    const sortedGroupEntries = Object.entries(grouped).sort(([, aList], [, bList]) => {
        const aMin = Math.min(...aList.map(e => e.order_num));
        const bMin = Math.min(...bList.map(e => e.order_num));
        return aMin - bMin;
    });

    // Next exercise for the "Siguiente →" button
    const currentIdx = exercises.findIndex(ex => ex.id === selectedId);
    const nextExercise = currentIdx >= 0 && currentIdx < exercises.length - 1
        ? exercises[currentIdx + 1]
        : null;

    const completedPct = progress.total > 0
        ? Math.round((progress.completed / progress.total) * 100)
        : 0;

    const datasetMeta = activeMode ? MODE_META[activeMode] : getDatasetMeta(activeDatasetName);

    const TABS = [
        { id: 'ejercicio', label: '✏️ Ejercicio' },
    ];

    // Add "Resultado Esperado" tab only for free_query and reverse_query
    if (!exercise || exercise.exercise_type === 'free_query' || exercise.exercise_type === 'reverse_query') {
        TABS.push({ id: 'resultado-esp', label: '🎯 Resultado Esperado' });
    }

    const SIDE_TABS = [
        { id: 'wiki', label: 'Wiki', icon: BookOpen },
        { id: 'schema', label: 'Esquema', icon: Database },
    ];

    const [activeSideTab, setActiveSideTab] = useState('wiki');

    // ─────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────
    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />

            <div className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-hidden">

                {/* ── HEADER (always visible) ───────────────── */}
                <div className="px-8 pt-8 pb-4 flex-shrink-0">
                    <div className="flex items-start gap-4">
                        {/* Back buttons (editor and roadmap) */}
                        {(view === 'editor' || view === 'roadmap') && (
                            <div className="mt-0.5 flex items-center gap-2.5 flex-shrink-0">
                                {/* Roadmap back button – only when in level mode */}
                                {view === 'editor' && activeLevelCfg && (
                                    <button
                                        onClick={handleBackToRoadmap}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 border"
                                        style={{
                                            background: `${activeLevelCfg.color}18`,
                                            borderColor: `${activeLevelCfg.color}50`,
                                            color: activeLevelCfg.color,
                                            boxShadow: `0 0 12px ${activeLevelCfg.glow}`,
                                        }}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Mapa</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleBackToLanding}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>Inicio</span>
                                </button>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <PageHeader
                                title={
                                    view === 'editor' && activeLevelCfg
                                        ? <span style={{ color: activeLevelCfg.color }}>Nivel {activeLevelCfg.order_index}: {activeLevelCfg.title}</span>
                                        : view === 'editor' && (activeDatasetName || activeMode)
                                            ? <>
                                                {activeDatasetName || MODE_META[activeMode]?.title}
                                                {activeMode && <span className={`${datasetMeta.text}`}> {activeMode === 'fill_blank' ? 'Mode' : 'Modo'}</span>}
                                                {activeDatasetName && !activeLevelCfg && <span className={datasetMeta.text}> Skills</span>}
                                                {activeLevelCfg && <span className="text-white/40 ml-2 text-xs font-black uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-lg bg-white/5">PRO PATH</span>}
                                            </>
                                            : <>SQL <span className="text-blue-400">Skills</span></>
                                }
                                subtitle={
                                    view === 'editor' && activeLevelCfg
                                        ? `${exercises.length} ejercicios · ${activeLevelCfg.doneEx ?? 0} completados`
                                        : view === 'editor' && (activeDatasetName || activeMode)
                                            ? activeDatasetName
                                                ? `Practicando con el dataset "${activeDatasetName}" · ${exercises.length} ejercicios`
                                                : `Practicando: ${MODE_META[activeMode]?.title} · ${exercises.length} ejercicios`
                                            : 'Elige una base de datos y practica consultas SQL reales'
                                }
                                Icon={Database}
                                gradient="from-white via-blue-100 to-blue-400"
                                iconColor="text-blue-400"
                                iconBg="bg-blue-500/20"
                                iconBorder="border-blue-500/30"
                                glowColor="bg-blue-500/20"
                            />
                        </div>
                    </div>

                    {/* Progress bar (only in editor, non-level mode) */}
                    {view === 'editor' && !activeLevelCfg && (
                        <div className="mt-4 flex items-center gap-4">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full transition-all duration-700"
                                    style={{ width: `${completedPct}%` }}
                                />
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                                {progress.completed}/{progress.total} completados · {completedPct}%
                            </span>
                            {completedPct >= 100 && (
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await api.get('/certificates/sql', { responseType: 'blob' });
                                            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = 'certificado_sql_tech4u.pdf';
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        } catch (e) {
                                            alert('No se pudo generar el certificado. Contacta con soporte.');
                                        }
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/25 transition-all text-xs font-mono font-bold whitespace-nowrap"
                                >
                                    <Award className="w-3.5 h-3.5" />
                                    🎓 Diploma SQL
                                    <Download className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── Level context banner (only when coming from roadmap) ── */}
                    {view === 'editor' && activeLevelCfg && (() => {
                        const lvlDone = exercises.filter(e => e.completed).length;
                        const lvlTotal = exercises.length;
                        const lvlPct = lvlTotal ? Math.round((lvlDone / lvlTotal) * 100) : 0;
                        return (
                            <div className="mt-3 flex items-center gap-4 px-4 py-3 rounded-2xl"
                                style={{
                                    background: `linear-gradient(135deg, ${activeLevelCfg.color}12, ${activeLevelCfg.color}05)`,
                                    border: `1px solid ${activeLevelCfg.color}30`,
                                    boxShadow: `0 0 20px ${activeLevelCfg.glow}`,
                                }}>
                                {/* Icon + label */}
                                {(() => {
                                    const BannerIcon = LEVEL_ICONS[(activeLevelCfg.order_index - 1)] || LEVEL_ICONS[0];
                                    return (
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: `${activeLevelCfg.color}20`, border: `1px solid ${activeLevelCfg.color}30` }}>
                                            <BannerIcon color={activeLevelCfg.color} size={18} />
                                        </div>
                                    );
                                })()}
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-0.5"
                                        style={{ color: activeLevelCfg.color }}>
                                        🗺 Ruta de Aprendizaje · Nivel {activeLevelCfg.order_index}
                                    </p>
                                    <p className="text-xs font-bold text-white truncate">{activeLevelCfg.title}</p>
                                </div>
                                {/* Progress */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-black font-mono leading-none"
                                            style={{ color: activeLevelCfg.color }}>
                                            {lvlDone}/{lvlTotal}
                                        </p>
                                        <p className="text-[9px] text-slate-600 mt-0.5">ejercicios</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${lvlPct}%`,
                                                    background: `linear-gradient(90deg, ${activeLevelCfg.color}99, ${activeLevelCfg.color})`,
                                                    boxShadow: lvlPct > 0 ? `0 0 6px ${activeLevelCfg.glow}` : 'none',
                                                }} />
                                        </div>
                                        <p className="text-[9px] font-mono text-right"
                                            style={{ color: activeLevelCfg.color }}>{lvlPct}%</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* ── LANDING VIEW ──────────────────────────── */}
                {view === 'landing' && (
                    loadingDatasets ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-slate-500 font-mono text-sm animate-pulse">Cargando datasets...</div>
                        </div>
                    ) : (
                        <LandingView
                            datasets={datasets}
                            modes={modes}
                            progress={progress}
                            onSelectDataset={handleSelectDataset}
                            onSelectMode={handleSelectMode}
                            onOpenRoadmap={handleOpenRoadmap}
                            onOpenAnalytics={() => setView('analytics')}
                        />
                    )
                )}

                {/* ── ANALYTICS VIEW ─────────────────────────── */}
                {view === 'analytics' && (
                    <AnalyticsView progress={progress} onBack={() => setView('landing')} />
                )}

                {/* ── ROADMAP VIEW ───────────────────────────── */}
                {view === 'roadmap' && (
                    <RoadmapView
                        onEnterLevel={handleEnterLevel}
                        onBack={handleBackToLanding}
                    />
                )}

                {/* ── LEVEL INTRO SPLASH ────────────────────── */}
                {view === 'editor' && showLevelIntro && activeLevelCfg && (() => {
                    const IntroIcon = LEVEL_ICONS[(activeLevelCfg.order_index - 1)] || LEVEL_ICONS[0];
                    const exByType = exercises.reduce((acc, ex) => {
                        const t = ex.exercise_type || 'free_query';
                        acc[t] = (acc[t] || 0) + 1;
                        return acc;
                    }, {});
                    const typeLabels = {
                        fill_blank: '✏️ Completa el hueco',
                        find_bug: '🐛 Encuentra el error',
                        order_clauses: '↕️ Ordena las cláusulas',
                        reverse_query: '🔄 Query inversa',
                        free_query: '💬 Escribe la consulta',
                    };
                    const alreadyStarted = activeLevelCfg.doneEx > 0;
                    return (
                        <div className="flex-1 flex items-center justify-center px-8 pb-8 overflow-y-auto">
                            <div className="w-full max-w-2xl py-8">
                                {/* Header card */}
                                <div className="relative rounded-3xl overflow-hidden mb-6"
                                    style={{
                                        background: `linear-gradient(135deg, ${activeLevelCfg.color}12 0%, #080b14 100%)`,
                                        border: `1px solid ${activeLevelCfg.color}35`,
                                        boxShadow: `0 0 60px ${activeLevelCfg.glow}25, 0 24px 60px rgba(0,0,0,0.5)`,
                                    }}>
                                    {/* Top glow */}
                                    <div className="absolute top-0 left-0 right-0 h-px"
                                        style={{ background: `linear-gradient(90deg,transparent,${activeLevelCfg.color}88,transparent)` }} />
                                    <div className="absolute pointer-events-none"
                                        style={{
                                            top: '-20%', right: '-10%', width: 300, height: 250,
                                            background: `radial-gradient(ellipse, ${activeLevelCfg.glow} 0%, transparent 70%)`
                                        }} />
                                    <div className="relative z-10 p-8">
                                        {/* Level badge + icon */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: `${activeLevelCfg.color}20`, border: `1.5px solid ${activeLevelCfg.color}50`, boxShadow: `0 0 20px ${activeLevelCfg.glow}` }}>
                                                <IntroIcon color={activeLevelCfg.color} size={30} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-1"
                                                    style={{ color: activeLevelCfg.color }}>
                                                    Ruta de Aprendizaje · Nivel {activeLevelCfg.order_index} de 10
                                                </p>
                                                <h2 className="text-2xl font-black text-white leading-tight">{activeLevelCfg.title}</h2>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {activeLevelCfg.description && (
                                            <p className="text-sm text-slate-400 leading-relaxed mb-6 border-l-2 pl-4"
                                                style={{ borderColor: `${activeLevelCfg.color}50` }}>
                                                {activeLevelCfg.description}
                                            </p>
                                        )}

                                        {/* SQL keywords you'll learn */}
                                        {activeLevelCfg.keywords?.length > 0 && (
                                            <div className="mb-6">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">
                                                    SQL que aprenderás
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {activeLevelCfg.keywords.map(kw => (
                                                        <span key={kw} className="px-3 py-1 rounded-lg text-[11px] font-mono font-bold"
                                                            style={{
                                                                background: `${activeLevelCfg.color}15`,
                                                                border: `1px solid ${activeLevelCfg.color}35`,
                                                                color: activeLevelCfg.color,
                                                            }}>
                                                            {kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Exercise type breakdown */}
                                        {Object.keys(exByType).length > 0 && (
                                            <div className="mb-6">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3">
                                                    Tipos de ejercicios
                                                </p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.entries(exByType).map(([type, count]) => (
                                                        <div key={type} className="flex items-center justify-between px-3 py-2 rounded-xl"
                                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                            <span className="text-[11px] text-slate-400">{typeLabels[type] || type}</span>
                                                            <span className="text-[11px] font-black font-mono" style={{ color: activeLevelCfg.color }}>{count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Progress (if already started) */}
                                        {alreadyStarted && (
                                            <div className="mb-6 flex items-center gap-4 px-4 py-3 rounded-xl"
                                                style={{ background: `${activeLevelCfg.color}10`, border: `1px solid ${activeLevelCfg.color}25` }}>
                                                <span className="text-lg">▶</span>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-white">Continúas donde lo dejaste</p>
                                                    <p className="text-[10px] text-slate-500">{activeLevelCfg.doneEx} de {activeLevelCfg.totalEx} ejercicios completados</p>
                                                </div>
                                                <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{
                                                        width: `${Math.round((activeLevelCfg.doneEx / activeLevelCfg.totalEx) * 100)}%`,
                                                        background: activeLevelCfg.color,
                                                    }} />
                                                </div>
                                            </div>
                                        )}

                                        {/* CTA */}
                                        <button
                                            onClick={() => setShowLevelIntro(false)}
                                            className="w-full py-4 rounded-2xl font-black text-base transition-all active:scale-[0.98] hover:brightness-110"
                                            style={{
                                                background: `linear-gradient(135deg, ${activeLevelCfg.color}cc, ${activeLevelCfg.color})`,
                                                boxShadow: `0 8px 32px ${activeLevelCfg.glow}`,
                                                color: '#000',
                                            }}>
                                            {alreadyStarted
                                                ? `▶ Continuar — ejercicio ${activeLevelCfg.doneEx + 1}/${activeLevelCfg.totalEx}`
                                                : `🚀 Empezar Nivel ${activeLevelCfg.order_index} — ${activeLevelCfg.totalEx} ejercicios`
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* ── EDITOR VIEW ───────────────────────────── */}
                {view === 'editor' && !showLevelIntro && (() => {
                    const editorProps = {
                        datasetMeta, activeMode, activeDatasetName, exercises, loadingExercises,
                        selectedId, setSelectedId, exercise, activeTab, setActiveTab, query, setQuery,
                        running, handleRun, autoAdvanceCountdown, setAutoAdvanceCountdown, setAutoAdvanceTarget,
                        nextExercise, handleRevealSolution, loadingSolution, solution, setSolution,
                        feedback, setFeedback, solutionError, actualResult, setActualResult, history,
                        activeSideTab, setActiveSideTab, activeDatasetId, highlightSQL, TABS, SIDE_TABS,
                        MODE_META, normalizeCat, normalizeTitle, sortedGroupEntries, exerciseListRef,
                        activeLevelCfg,
                        progress,
                        hintsUsed,
                        user,
                        onUseHint: handleUseHint,
                    };

                    return activeLevelCfg
                        ? <PathEditor {...editorProps} />
                        : <StandardEditor {...editorProps} />;
                })()}

            </div>

            {/* ── FLOATING XP ANIMATION ─────────────────────── */}
            {xpFloat && (
                <XPFloat
                    amount={xpFloat.amount}
                    color={xpFloat.color}
                    onDone={() => setXPFloat(null)}
                />
            )}

            {/* ── LEVEL UP MODAL ────────────────────────────── */}
            {showLevelUpModal && activeLevelCfg && (
                <LevelUpModal
                    color={activeLevelCfg.color}
                    glow={activeLevelCfg.glow}
                    onClose={() => setShowLevelUpModal(false)}
                />
            )}

        </div>
    );
}
