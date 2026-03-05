import { ChevronRight, Target, Shield, Zap, Award, Star, BookOpen, Clock, AlertTriangle, MessageSquare, Play, Hammer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function InfoPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white font-sans selection:bg-neon selection:text-black scroll-smooth">

            {/* Ambient Backgrounds */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="fixed w-full top-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-xl border-b border-white/5">
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
                            onClick={() => navigate('/planes')}
                            className="bg-neon text-[#0D0D0D] px-6 py-2.5 rounded-full font-black text-sm uppercase transition-all hover:shadow-[0_0_20px_var(--neon-alpha-40)] hover:scale-105"
                        >
                            Ver Planes
                        </button>
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-24 relative z-10">
                {/* 1. HERO SECTION */}
                <section className="min-h-[80vh] flex flex-col items-center justify-center max-w-5xl mx-auto px-6 text-center mb-20 relative">

                    {/* Ambient glow orbs */}
                    <div className="absolute left-[-15%] top-[10%] w-72 h-72 bg-neon/8 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute right-[-10%] bottom-[10%] w-64 h-64 bg-blue-500/8 rounded-full blur-[100px] pointer-events-none" />

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-neon animate-pulse shadow-[0_0_8px_var(--color-neon)]" />
                        <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-[0.25em]">Tech4U Academy · ASIR Gamificado</span>
                    </div>

                    {/* Main headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter mb-6 leading-[1.05] break-words">
                        <span className="block text-white">Sumérgete en</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neon via-cyan-300 to-blue-400 drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]">
                            Un mundo nuevo
                        </span>
                    </h1>

                    {/* Sub-tagline */}
                    <p className="text-slate-300 text-lg md:text-xl font-mono leading-relaxed max-w-2xl mx-auto mb-4">
                        La primera academia de FP donde estudiar <span className="text-white font-bold">se siente como jugar</span>.
                    </p>
                    <p className="text-slate-500 font-mono text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-12">
                        Cada test que haces te da experiencia real. Cada error que corriges te hace más fuerte. Cada módulo superado te acerca a un rango que nadie puede quitarte. Sigue bajando y descúbrelo.
                    </p>

                    {/* CTA Group */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
                        <button
                            onClick={() => navigate('/planes')}
                            className="group relative px-8 py-4 bg-neon text-black font-black uppercase tracking-widest rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-[0_0_40px_var(--neon-alpha-20)] hover:shadow-[0_0_60px_var(--neon-alpha-40)] text-sm"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Empezar Ahora <Play className="w-4 h-4 fill-current" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>

                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-4 rounded-2xl border border-white/10 text-slate-300 font-black uppercase tracking-widest text-sm hover:bg-white/5 hover:border-white/20 hover:text-white transition-all duration-300"
                        >
                            Ya tengo cuenta →
                        </button>
                    </div>

                    {/* Social proof strip */}
                    <div className="flex items-center gap-6 text-center mb-14 flex-wrap justify-center">
                        {[
                            { val: '+500', desc: 'preguntas reales ASIR' },
                            { val: '20 lvl', desc: 'sistema de progresión' },
                            { val: '100%', desc: 'orientado a la certificación' },
                        ].map(({ val, desc }) => (
                            <div key={val} className="flex items-center gap-3">
                                <span className="text-neon font-black font-mono text-sm">{val}</span>
                                <span className="text-slate-600 font-mono text-xs uppercase tracking-widest">{desc}</span>
                            </div>
                        ))}
                    </div>

                    {/* Scroll indicator */}
                    <div className="flex flex-col items-center gap-2 opacity-50 hover:opacity-80 transition-opacity cursor-default select-none">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Descubre todo</span>
                        <div className="w-[1px] h-10 bg-gradient-to-b from-slate-500 to-transparent" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
                    </div>
                </section>


                {/* 2. CAMPOS DE ENTRENAMIENTO (Test Center) */}
                <section className="max-w-6xl mx-auto px-6 mb-32">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 border border-neon/20 mb-4">
                            <Zap className="w-4 h-4 text-neon" />
                            <span className="text-xs font-mono text-neon font-bold uppercase tracking-widest">Módulos de Combate</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-4">Campos de <span className="text-neon">Entrenamiento</span></h2>
                        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Elige tu modo de combate técnico</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">

                        {/* Práctica Libre */}
                        <div className="glass p-6 rounded-3xl border border-white/5 hover:border-green-500/40 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-lg font-black uppercase italic mb-2 text-white group-hover:text-green-300 transition-colors">Práctica Libre</h3>
                            <p className="text-slate-400 font-mono text-xs leading-relaxed mb-4">Entrena sin presión. Escoge entre <span className="text-green-400 font-bold">10, 20 ó 40 preguntas</span> de cualquier módulo ASIR. Ideal para repasar sin presión de tiempo.</p>
                            <div className="flex gap-2 flex-wrap">
                                {['10 Q', '20 Q', '40 Q'].map(q => (
                                    <span key={q} className="text-[10px] font-mono bg-green-900/30 text-green-400 border border-green-700/40 px-2 py-0.5 rounded-full">{q}</span>
                                ))}
                            </div>
                        </div>

                        {/* Modo Examen */}
                        <div className="glass p-6 rounded-3xl border border-neon/30 bg-gradient-to-b from-neon/5 to-transparent relative overflow-hidden group hover:shadow-[0_0_30px_var(--neon-alpha-10)] transition-all">
                            <div className="absolute top-3 right-3 animate-pulse">
                                <span className="bg-neon text-black text-[9px] font-black uppercase px-2 py-1 rounded">Hardcore</span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6 text-neon" />
                            </div>
                            <h3 className="text-lg font-black uppercase italic mb-2 text-white group-hover:text-neon transition-colors">Modo Examen</h3>
                            <p className="text-slate-400 font-mono text-xs leading-relaxed mb-4">Simetría total con el examen oficial. Exactamente <span className="text-neon font-bold">40 preguntas</span> con límite de tiempo implacable. <span className="text-neon font-bold">Única modalidad que otorga XP.</span></p>
                            <span className="text-[10px] font-mono bg-neon/10 text-neon border border-neon/30 px-2 py-0.5 rounded-full">40 Q · Cronometrado · +XP</span>
                        </div>

                        {/* Sala de Errores */}
                        <div className="glass p-6 rounded-3xl border border-white/5 hover:border-orange-500/40 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <AlertTriangle className="w-6 h-6 text-orange-400" />
                            </div>
                            <h3 className="text-lg font-black uppercase italic mb-2 text-white group-hover:text-orange-300 transition-colors">Sala de Errores</h3>
                            <p className="text-slate-400 font-mono text-xs leading-relaxed mb-4">El sistema memoriza cada fallo. Aquí solo verás las preguntas que has fallado para que las <span className="text-orange-400 font-bold">conviertas en tus fortalezas</span>.</p>
                            <span className="text-[10px] font-mono bg-orange-900/30 text-orange-400 border border-orange-700/40 px-2 py-0.5 rounded-full">Personalizado · Adaptativo</span>
                        </div>

                        {/* FlashCards */}
                        <div className="glass p-6 rounded-3xl border border-white/5 hover:border-purple-500/40 transition-all group relative overflow-hidden">
                            <div className="absolute top-3 right-3">
                                <span className="text-[9px] font-black font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded">Nuevo</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <Award className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-black uppercase italic mb-2 text-white group-hover:text-purple-300 transition-colors">FlashCards</h3>
                            <p className="text-slate-400 font-mono text-xs leading-relaxed mb-4">Repasa conceptos clave con tarjetas interactivas. Voltéalas, valora tu conocimiento y <span className="text-purple-400 font-bold">fija los términos técnicos</span> en segundos.</p>
                            <span className="text-[10px] font-mono bg-purple-900/30 text-purple-400 border border-purple-700/40 px-2 py-0.5 rounded-full">Repaso Rápido · Visual</span>
                        </div>

                        {/* Skill Labs */}
                        <div className="glass p-6 rounded-3xl border border-white/5 hover:border-fuchsia-500/40 transition-all group relative overflow-hidden">
                            <div className="absolute top-3 right-3">
                                <span className="text-[9px] font-black font-mono uppercase bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 px-2 py-1 rounded">Nuevo</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <Hammer className="w-6 h-6 text-fuchsia-400" />
                            </div>
                            <h3 className="text-lg font-black uppercase italic mb-2 text-white group-hover:text-fuchsia-300 transition-colors">Skill Labs</h3>
                            <p className="text-slate-400 font-mono text-xs leading-relaxed mb-4">Entorno interactivo tipo puzzle. Arrastra conceptos y variables para <span className="text-fuchsia-400 font-bold">ensamblar comandos y tecnologías</span> reales.</p>
                            <span className="text-[10px] font-mono bg-fuchsia-900/30 text-fuchsia-400 border border-fuchsia-700/40 px-2 py-0.5 rounded-full">Drag & Drop · Práctico</span>
                        </div>

                    </div>
                </section>

                {/* 2b. RANKING GLOBAL */}
                <section className="max-w-6xl mx-auto px-6 mb-32">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs font-mono text-yellow-400 font-bold uppercase tracking-widest">Clasificación Global</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-4">Ranking de <span className="text-yellow-400">Alumnos</span></h2>
                        <p className="text-slate-400 font-mono text-sm max-w-xl mx-auto">Cuantos más tests hagas y mejor lo hagas, más alto subes. El ranking es público, actualizado en tiempo real y premia a los que más se esfuerzan.</p>
                    </div>

                    {/* Leaderboard mockup */}
                    <div className="relative max-w-3xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-900/10 via-transparent to-amber-900/10 rounded-3xl blur-xl" />
                        <div className="relative glass rounded-3xl border border-yellow-500/20 overflow-hidden">
                            {/* Header */}
                            <div className="bg-black/40 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Star className="w-5 h-5 text-yellow-400" />
                                    <span className="text-yellow-400 font-black font-mono uppercase tracking-widest text-xs">Leaderboard Global · Temporada 1</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 animate-pulse">🟢 En vivo</span>
                            </div>

                            {/* Top 5 rows */}
                            {[
                                { pos: 1, emoji: '👑', name: 'SysAdmin_Z3r0', rank: '🥇 Técnico Junior', lv: 12, xp: '14.820 XP', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-600/40' },
                                { pos: 2, emoji: '🥈', name: 'NetW0rk_Master', rank: '🥈 Informático Nerd', lv: 8, xp: '6.540 XP', badge: 'bg-slate-700/30 text-slate-300 border-slate-600/40' },
                                { pos: 3, emoji: '🥉', name: 'h4ck3r_Novato', rank: '🥈 Informático Nerd', lv: 6, xp: '3.210 XP', badge: 'bg-orange-900/20 text-orange-300 border-orange-700/40' },
                                { pos: 4, emoji: '', name: 'Sudo_Apprentice', rank: '🥉 Estudiante ASIR', lv: 4, xp: '1.950 XP', badge: 'bg-white/5 text-slate-400 border-white/10' },
                                { pos: 5, emoji: '', name: 'LinuxBaby99', rank: '🥉 Estudiante ASIR', lv: 2, xp: '780 XP', badge: 'bg-white/5 text-slate-400 border-white/10' },
                            ].map(({ pos, emoji, name, rank, lv, xp, badge }) => (
                                <div key={pos} className={`flex items-center gap-4 px-6 py-3 border-b border-white/5 hover:bg-white/3 transition-colors ${pos === 1 ? 'bg-yellow-900/10' : ''}`}>
                                    <span className="w-6 text-center font-black font-mono text-sm text-slate-500">{emoji || `#${pos}`}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm text-white truncate">{name}</p>
                                        <p className="text-[10px] font-mono text-slate-500">{rank}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badge} inline-block`}>Lv. {lv}</div>
                                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{xp}</p>
                                    </div>
                                </div>
                            ))}

                            {/* CTA */}
                            <div className="px-6 py-4 text-center bg-black/20">
                                <button onClick={() => navigate('/planes')} className="text-xs font-black font-mono text-yellow-400 hover:text-yellow-300 uppercase tracking-widest transition-colors inline-flex items-center gap-2">
                                    Únete y aparece en el ranking <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* RPG INTRO TEASER */}
                <section className="max-w-5xl mx-auto px-6 mb-20 text-center">
                    <div className="relative rounded-3xl overflow-hidden border border-white/5">
                        {/* Background glows */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-[#0D0D0D] z-0" />
                        <div className="absolute top-0 left-[20%] w-[60%] h-[2px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

                        <div className="relative z-10 px-8 py-14 md:py-20">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-[0.3em]">⚔️ Sistema de Juego de Rol</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-6 leading-tight">
                                <span className="text-white">El aprendizaje</span><br />
                                <span className="text-purple-400">convertido en aventura</span>
                            </h2>

                            <p className="text-slate-300 font-mono text-base leading-relaxed max-w-2xl mx-auto mb-4">
                                Hemos rediseñado la experiencia completa para que estudiar ASIR <span className="text-white font-bold">se sienta como jugar un RPG</span>. Cada vez que te conectas, no eres solo un alumno más: eres un personaje con un nivel, un rango y unas estadísticas que reflejan exactamente lo que sabes.
                            </p>
                            <p className="text-slate-500 font-mono text-sm leading-relaxed max-w-xl mx-auto mb-10">
                                Así de simple: haz tests → gana XP → sube de nivel → cambia de rango → desbloquea nuevas recompensas. Y todo eso queda plasmado en tu <span className="text-blue-300">hoja de personaje</span> exclusiva.
                            </p>

                            {/* Stats strip */}
                            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                                {[
                                    { val: '20', label: 'Niveles disponibles', color: 'text-blue-400' },
                                    { val: '6+', label: 'Categorías de stats', color: 'text-purple-400' },
                                    { val: '∞', label: 'XP por ganar', color: 'text-cyan-400' },
                                ].map(({ val, label, color }) => (
                                    <div key={label} className="bg-black/30 border border-white/5 rounded-2xl p-4">
                                        <p className={`text-3xl font-black font-mono ${color} mb-1`}>{val}</p>
                                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-tight">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. CHARACTER PROFILE PREVIEW + 20-LEVEL PROGRESSION */}
                <section className="max-w-6xl mx-auto px-6 mb-32">

                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                            <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-widest">Sistema RPG de Progresión</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">
                            Tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Personaje</span>,<br />Tu Progreso Real
                        </h2>
                        <p className="text-slate-400 font-mono text-sm max-w-2xl mx-auto leading-relaxed">
                            Cada test superado se transforma en experiencia real. Observa tus estadísticas ASIR en tu propia hoja de personaje gamificada: subes de nivel, cambias de rango y desbloqueas medallas únicas.
                        </p>
                    </div>

                    {/* Mock Character Sheet Preview */}
                    <div className="relative mb-20">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-purple-900/20 rounded-[3rem] blur-2xl" />
                        <div className="relative bg-[#0b101e]/90 border-[3px] border-[#3b5998] rounded-2xl shadow-[0_0_60px_rgba(59,130,246,0.12)] overflow-hidden backdrop-blur-md">
                            <div className="absolute inset-1 border border-yellow-500/20 rounded-xl pointer-events-none" />
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Left: Character Portrait */}
                                <div className="lg:col-span-4 flex flex-col items-center justify-center gap-4">
                                    <div className="relative w-full max-w-[220px] mx-auto">
                                        <div className="absolute inset-0 bg-blue-500/10 blur-[40px] rounded-full" />
                                        <div className="w-full aspect-[3/4] bg-gradient-to-b from-blue-900/30 to-black/80 border border-[#5c7ebf]/40 rounded-xl flex items-center justify-center relative overflow-hidden">
                                            <div className="text-8xl mt-auto mb-4">🧙</div>
                                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 p-4 text-center">
                                                <p className="text-white font-black text-lg leading-none">Tu Nombre</p>
                                                <p className="text-yellow-400 font-mono text-[10px] uppercase tracking-widest mt-1">🥇 Técnico Junior Certificado</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Stats Preview */}
                                <div className="lg:col-span-8 flex flex-col gap-5 justify-center">
                                    {/* Level bars */}
                                    <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-lg border border-[#2c4070]">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-yellow-400 font-black font-mono">LVL:</span>
                                                <span className="text-2xl font-black text-white">10</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-mono">
                                                    <span className="text-emerald-400 font-bold">HP:</span>
                                                    <span className="text-white">300 / 300</span>
                                                </div>
                                                <div className="h-1.5 bg-black rounded-full border border-emerald-900 overflow-hidden">
                                                    <div className="h-full bg-emerald-400" style={{ width: '100%' }} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1 pl-4 border-l border-[#2c4070] flex flex-col justify-center">
                                            <div className="flex justify-between text-xs font-mono mb-1">
                                                <span className="text-yellow-500 font-bold">EXP:</span>
                                                <span className="text-slate-300">8,200 / 9,000</span>
                                            </div>
                                            <div className="h-1.5 bg-black rounded-full border border-yellow-900/50 overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400" style={{ width: '91%' }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills grid */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 border-b border-[#2c4070] pb-1">
                                                <Zap className="w-4 h-4 text-cyan-400" />
                                                <h3 className="text-white font-black uppercase text-xs tracking-widest">Skills Tecnológicos</h3>
                                            </div>
                                            <div className="space-y-2 font-mono text-xs">
                                                {[['Hardware (HW)', 'text-orange-400', '78'], ['Sistemas (OS)', 'text-emerald-400', '91'], ['Redes (NET)', 'text-sky-400', '85']].map(([n, c, v]) => (
                                                    <div key={n} className="flex justify-between items-center">
                                                        <span className="text-slate-400">{n}</span><span className={`${c} font-bold`}>{v} Pts</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 border-b border-[#2c4070] pb-1">
                                                <Shield className="w-4 h-4 text-red-400" />
                                                <h3 className="text-white font-black uppercase text-xs tracking-widest">Defensa & Lógica</h3>
                                            </div>
                                            <div className="space-y-2 font-mono text-xs">
                                                {[['Datos (SQL)', 'text-violet-400', '72'], ['Marcas (WEB)', 'text-cyan-400', '68'], ['Ciberseguridad', 'text-red-400', '60']].map(([n, c, v]) => (
                                                    <div key={n} className="flex justify-between items-center">
                                                        <span className="text-slate-400">{n}</span><span className={`${c} font-bold`}>{v} Pts</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Equipment row */}
                                    <div className="border-t border-[#2c4070] pt-4 grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
                                        {[['Arma', '⌨️', 'Teclado Mec.'], ['Armadura', '🧥', 'Sudadera Hack'], ['Defensa', '👓', 'Gafas Filtro'], ['Accesorio', '💾', 'Pendrive Boot']].map(([slot, icon, name]) => (
                                            <div key={slot} className="flex flex-col items-center gap-1">
                                                <span className="text-slate-500 text-[9px] uppercase">{slot}</span>
                                                <span className="text-2xl">{icon}</span>
                                                <span className="text-white leading-tight">{name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 6-Rank Progression Board */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/30" />
                        <div className="flex items-center gap-3 px-6 py-2 border border-yellow-500/30 rounded-full bg-yellow-900/10">
                            <span>🏆</span>
                            <h3 className="text-yellow-400 font-black font-mono uppercase tracking-[0.3em] text-sm">Las 6 Ligas de Progresión</h3>
                            <span>📋</span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/30" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {RANKS_DISPLAY.map((rank) => (
                            <div key={rank.id} className={`rounded-xl border p-6 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group ${rank.cardStyle}`}>
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="text-6xl">{rank.icon}</span>
                                </div>

                                <h4 className={`font-black text-xl mb-2 flex items-center gap-2 ${rank.textStyle}`}>
                                    {rank.name}
                                </h4>

                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-xs font-mono px-2 py-1 rounded bg-black/40 border border-white/10 text-white">
                                        {rank.levels}
                                    </span>
                                    <span className="text-xs font-mono text-slate-400">
                                        {rank.xp}
                                    </span>
                                </div>

                                <p className="text-sm font-mono text-slate-300 leading-relaxed">
                                    {rank.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 border border-neon/20 bg-neon/5 rounded-xl text-center">
                        <p className="text-neon font-mono text-xs leading-relaxed">
                            <span className="font-black">⚡ Cómo ganar XP:</span> Solo el <span className="font-black">Modo Examen con 40 preguntas</span> otorga experiencia real. Todas las modalidades te entrenan, pero solo el examen oficial sube tu nivel.
                        </p>
                    </div>
                </section>

                {/* 5. GESTIÓN DE LA COMUNIDAD */}
                <section className="max-w-5xl mx-auto px-6 text-center">
                    <div className="glass rounded-3xl border border-blue-500/20 p-10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                                <MessageSquare className="w-8 h-8 text-blue-400" />
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 ml-4">
                                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">Comunidad Abierta</span>
                            </div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Voz de la <span className="text-blue-400">Academia</span></h2>
                            <p className="text-slate-400 font-mono text-sm leading-relaxed max-w-2xl mx-auto mb-3">
                                Cualquier alumno puede <span className="text-white font-bold">enviar sugerencias de preguntas, reportar errores o proponer mejoras</span> para la academia directamente desde el panel de alumno.
                            </p>
                            <p className="text-slate-500 font-mono text-xs leading-relaxed max-w-xl mx-auto mb-8">
                                Cada sugerencia aprobada por los docentes otorga medallas exclusivas de reconocimiento y se integra en la base de preguntas real del próximo examen.
                            </p>
                            <button
                                onClick={() => navigate('/planes')}
                                className="px-8 py-3 rounded-xl border border-blue-500/30 bg-blue-500/10 font-black uppercase tracking-widest text-xs hover:bg-blue-500/20 hover:border-blue-400/50 transition-all gap-2 inline-flex items-center text-blue-300"
                            >
                                Únete y Participa <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    )
}

const RANKS_DISPLAY = [
    {
        id: 1,
        name: "🥉 Estudiante ASIR",
        levels: "Niveles 1 – 4",
        xp: "0 – 1.999 XP",
        desc: "Iniciando tu camino en la administración. Aquí aprenderás las bases de hardware y redes.",
        cardStyle: "border-slate-700 bg-slate-900/40",
        textStyle: "text-slate-300",
        icon: "🎒"
    },
    {
        id: 2,
        name: "🥈 Informático Nerd",
        levels: "Niveles 5 – 9",
        xp: "2.000 – 8.999 XP",
        desc: "Ya te defiendes en la terminal y la configuración de equipos no es un misterio para ti.",
        cardStyle: "border-blue-700/50 bg-blue-900/20",
        textStyle: "text-blue-300",
        icon: "💻"
    },
    {
        id: 3,
        name: "🥇 Técnico Junior",
        levels: "Niveles 10 – 14",
        xp: "9.000 – 24.999 XP",
        desc: "Dominio intermedio. Eres capaz de desplegar servicios y configurar redes estructuradas.",
        cardStyle: "border-yellow-600/50 bg-yellow-900/20",
        textStyle: "text-yellow-400",
        icon: "🔧"
    },
    {
        id: 4,
        name: "⚔️ Técnico L3",
        levels: "Niveles 15 – 17",
        xp: "25.000 – 39.999 XP",
        desc: "Experto en resolución de problemas críticos. Las infraestructuras confían en tu criterio.",
        cardStyle: "border-orange-600/50 bg-orange-900/20",
        textStyle: "text-orange-400",
        icon: "⚡"
    },
    {
        id: 5,
        name: "🛡️ Admin Senior",
        levels: "Niveles 18 – 19",
        xp: "40.000 – 49.999 XP",
        desc: "La élite de la academia. Mantienes servidores a nivel empresarial y aseguras la red corporativa.",
        cardStyle: "border-purple-600/50 bg-purple-900/20",
        textStyle: "text-purple-400",
        icon: "🔐"
    },
    {
        id: 6,
        name: "👑 SysAdmin Dios",
        levels: "Nivel 20+",
        xp: "50.000+ XP",
        desc: "Leyenda absoluta. El sistema te obedece de forma nativa. Tienes acceso root al universo.",
        cardStyle: "border-yellow-400/60 bg-gradient-to-br from-yellow-900/40 to-amber-900/40 shadow-[0_0_30px_rgba(234,179,8,0.2)]",
        textStyle: "text-yellow-200",
        icon: "⚜️"
    },
];
