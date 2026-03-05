import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Globe, Terminal, Lock, Search, BookOpen, Cpu, FileCode, Sparkles } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

const SUBJECTS = [
    {
        key: 'Bases de Datos',
        icon: Database,
        label: 'Bases de Datos (SQL)',
        description: 'Diseño relacional, consultas SQL, joins y optimización para DAW y DAM.',
        questions: 30,
        difficulty: 'Fácil → Difícil',
        color: 'from-blue-500/10 to-transparent',
        border: 'border-blue-500/20 hover:border-blue-400/50',
        accent: 'text-blue-400',
    },
    {
        key: 'Redes',
        icon: Globe,
        label: 'Redes Locales & Telemáticas',
        description: 'Modelo OSI, enrutamiento, subnetting, VLANs y configuración de equipos de red para ASIR y SMR.',
        questions: 25,
        difficulty: 'Medio',
        color: 'from-purple-500/10 to-transparent',
        border: 'border-purple-500/20 hover:border-purple-400/50',
        accent: 'text-purple-400',
    },
    {
        key: 'Sistemas Operativos',
        icon: Terminal,
        label: 'Sistemas Operativos',
        description: 'Administración de Linux (Bash) y Windows Server (PowerShell), gestión de usuarios y permisos (ASIR/SMR).',
        questions: 40,
        difficulty: 'Medio → Difícil',
        color: 'from-[var(--neon-alpha-6)] to-transparent',
        border: 'border-[var(--neon-alpha-20)] hover:border-[var(--neon-alpha-50)]',
        accent: 'text-neon',
    },
    {
        key: 'Ciberseguridad',
        icon: Lock,
        label: 'Ciberseguridad & Hacking',
        description: 'Fundamentos de hacking ético, criptografía básica y bastionado de sistemas para el CE de Ciberseguridad.',
        questions: 20,
        difficulty: 'Fácil → Medio',
        color: 'from-yellow-500/10 to-transparent',
        border: 'border-yellow-500/20 hover:border-yellow-400/50',
        accent: 'text-yellow-400',
    },
    {
        key: 'Fundamentos de Hardware',
        icon: Search,
        label: 'Fundamentos de Hardware',
        description: 'Componentes de un equipo informático, BIOS/UEFI, memoria RAM, almacenamiento SSD/HDD, tarjetas y perifos para ASIR.',
        questions: 10,
        difficulty: 'Fácil → Medio',
        color: 'from-orange-500/10 to-transparent',
        border: 'border-orange-500/20 hover:border-orange-400/50',
        accent: 'text-orange-400',
    },
    {
        key: 'Lenguaje de Marcas',
        icon: BookOpen,
        label: 'Lenguaje de Marcas',
        description: 'HTML5, CSS3, XML, DTD, XSLT y formularios web para ASIR y DAW.',
        questions: 10,
        difficulty: 'Fácil → Medio',
        color: 'from-cyan-500/10 to-transparent',
        border: 'border-cyan-500/20 hover:border-cyan-400/50',
        accent: 'text-cyan-400',
    },
]

export default function Courses() {
    const navigate = useNavigate()
    const [counts, setCounts] = useState({})

    useEffect(() => {
        api.get('/tests/counts').then(r => setCounts(r.data)).catch(() => { })
    }, [])

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                {/* ── Header ── */}
                <header className="mb-14 flex justify-between items-end relative z-10">
                    <div className="animate-in fade-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-5 mb-4">
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-transparent rounded-2xl border-2 border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden backdrop-blur-xl">
                                    <BookOpen className="w-10 h-10 text-blue-500 group-hover:rotate-[15deg] transition-transform duration-500" />
                                    <div className="absolute top-0 right-0 p-1">
                                        <Sparkles className="w-3 h-3 text-blue-300 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-500 drop-shadow-sm">
                                    Aca<span className="text-white">demia</span>
                                </h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="h-px w-8 bg-blue-500/50" />
                                    <p className="text-[10px] font-mono text-blue-500/70 uppercase tracking-[0.4em] font-black">
                                        Rutas de Aprendizaje
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {SUBJECTS.map(({ key, icon: Icon, label, description, questions, difficulty, color, border, accent }) => (
                        <div
                            key={key}
                            onClick={() => navigate(`/tests?subject=${key}`)}
                            className={`relative glass rounded-2xl p-6 border cursor-pointer transition-all duration-300 group ${border}`}
                        >
                            {/* BG gradient */}
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} pointer-events-none`} />

                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                                    <Icon className={`w-6 h-6 ${accent}`} />
                                </div>
                                <h3 className={`text-base font-black font-mono mb-2 ${accent}`}>{label}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed mb-4">{description}</p>
                                <div className="flex items-center justify-between text-xs font-mono">
                                    <span className="text-slate-600">{counts[key] != null ? `${counts[key]} preguntas` : `${questions}+ preguntas`}</span>
                                    <span className="text-slate-600">{difficulty}</span>
                                </div>
                                <button
                                    className={`mt-4 w-full btn-neon text-xs py-2 ${accent} border-current group-hover:bg-current group-hover:text-[#0D0D0D] transition-all duration-200`}
                                    style={{ borderColor: 'currentcolor' }}
                                >
                                    Empezar Test →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
