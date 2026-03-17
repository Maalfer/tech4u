import { useState, useEffect } from 'react'
import { Megaphone, Send, Trash2, CheckCircle, Eye, EyeOff, Plus, Users, ChevronDown } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const TEMPLATES = [
    { label: '🎉 Nuevas preguntas', text: '¡Hemos añadido nuevas preguntas al banco de tests! Entra y practica para mejorar tu nivel.' },
    { label: '⚙️ Mantenimiento', text: 'Esta noche realizaremos tareas de mantenimiento. Es posible que la plataforma esté inaccesible durante unos minutos.' },
    { label: '🚀 Nueva funcionalidad', text: '¡Nueva funcionalidad disponible! Ya puedes ver tu historial de tests y ranking global en el menú lateral.' },
    { label: '📅 Recordatorio', text: 'Recuerda repasar los apuntes y practicar en el Test Center antes del próximo examen. ¡Tú puedes!' },
]

export default function AdminBroadcast() {
    const { user } = useAuth()
    const isDocente = user?.role === 'docente'

    const [content, setContent] = useState('')
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(null) // { count, groups }

    // Docente: group selector
    const [groups, setGroups] = useState([])
    const [selectedGroups, setSelectedGroups] = useState([]) // empty = all groups
    const [groupsOpen, setGroupsOpen] = useState(false)

    useEffect(() => {
        fetchAll()
        if (isDocente) fetchGroups()
    }, [isDocente])

    const fetchAll = async () => {
        setLoading(true)
        try {
            const endpoint = isDocente ? '/announcements/docente/my-announcements' : '/announcements/admin/all'
            const res = await api.get(endpoint)
            setAnnouncements(res.data)
        } catch { }
        finally { setLoading(false) }
    }

    const fetchGroups = async () => {
        try {
            const res = await api.get('/docente/groups')
            setGroups(res.data || [])
        } catch { }
    }

    const handleSend = async () => {
        if (!content.trim()) return
        setSending(true)
        try {
            if (isDocente) {
                const payload = {
                    content: content.trim(),
                    group_ids: selectedGroups.length > 0 ? selectedGroups : null
                }
                const res = await api.post('/announcements/docente/send', payload)
                setSent({ count: res.data.student_count, groups: res.data.groups.map(g => g.name) })
            } else {
                await api.post('/announcements/', { content: content.trim() })
                setSent({ count: null, groups: null })
            }
            setContent('')
            fetchAll()
            setTimeout(() => setSent(null), 4000)
        } catch {
            alert('Error al publicar el anuncio.')
        } finally {
            setSending(false)
        }
    }

    const handleToggle = async (id, isActive) => {
        try {
            await api.patch(`/announcements/${id}/toggle`)
            setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_active: !isActive } : a))
        } catch { alert('Error al cambiar estado.') }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar este anuncio permanentemente?')) return
        try {
            await api.delete(`/announcements/${id}`)
            setAnnouncements(prev => prev.filter(a => a.id !== id))
        } catch { alert('Error al eliminar.') }
    }

    const toggleGroup = (id) => {
        setSelectedGroups(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        )
    }

    const charCount = content.length
    const charLimit = 300

    const selectedGroupNames = selectedGroups.length === 0
        ? 'Todos mis grupos'
        : groups.filter(g => selectedGroups.includes(g.id)).map(g => g.name).join(', ')

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8">

                {/* Header */}
                <PageHeader
                    title={<>Enviar <span className="text-neon">Noticia</span></>}
                    subtitle={
                        isDocente
                            ? 'El mensaje se enviará a los alumnos de tus grupos seleccionados'
                            : 'El mensaje se muestra a todos los alumnos al iniciar sesión'
                    }
                    Icon={Megaphone}
                    gradient="from-white via-green-100 to-[var(--color-neon)]"
                    iconColor="text-neon"
                    iconBg="bg-[var(--color-neon)]/20"
                    iconBorder="border-[var(--color-neon)]/30"
                    glowColor="bg-[var(--color-neon)]/20"
                />

                <div className="grid lg:grid-cols-2 gap-8">

                    {/* Composer */}
                    <div className="space-y-5">
                        <div className="glass rounded-2xl border border-white/5 p-6">
                            <h2 className="text-xs font-black font-mono text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-neon" /> Redactar mensaje
                            </h2>

                            {/* Docente: Group selector */}
                            {isDocente && (
                                <div className="mb-5">
                                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Destinatarios</p>
                                    <div className="relative">
                                        <button
                                            onClick={() => setGroupsOpen(o => !o)}
                                            className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-neon/30 transition-all text-left"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Users className="w-4 h-4 text-neon flex-shrink-0" />
                                                <span className="text-[12px] font-mono text-white truncate">{selectedGroupNames}</span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${groupsOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {groupsOpen && (
                                            <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                                                <button
                                                    onClick={() => { setSelectedGroups([]); setGroupsOpen(false) }}
                                                    className={`w-full flex items-center gap-2 px-4 py-3 text-[12px] font-mono transition-all ${selectedGroups.length === 0 ? 'bg-neon/10 text-neon' : 'text-slate-400 hover:bg-white/5'}`}
                                                >
                                                    <span className="w-3 h-3 rounded-full border-2 flex-shrink-0 border-current flex items-center justify-center">
                                                        {selectedGroups.length === 0 && <span className="w-1.5 h-1.5 rounded-full bg-neon block" />}
                                                    </span>
                                                    Todos mis grupos
                                                </button>
                                                {groups.map((g) => (
                                                    <button
                                                        key={`group-${g.id}`}
                                                        onClick={() => toggleGroup(g.id)}
                                                        className={`w-full flex items-center gap-2 px-4 py-3 text-[12px] font-mono transition-all ${selectedGroups.includes(g.id) ? 'bg-neon/10 text-neon' : 'text-slate-400 hover:bg-white/5'}`}
                                                    >
                                                        <span className="w-3 h-3 rounded border flex-shrink-0 border-current flex items-center justify-center">
                                                            {selectedGroups.includes(g.id) && <span className="w-1.5 h-1.5 bg-neon block rounded-sm" />}
                                                        </span>
                                                        {g.name}
                                                        <span className="ml-auto text-[9px] text-slate-600">{g.member_count ?? ''} alumnos</span>
                                                    </button>
                                                ))}
                                                <div className="border-t border-white/5 px-4 py-2">
                                                    <button onClick={() => setGroupsOpen(false)} className="text-[10px] font-mono text-neon hover:underline">Confirmar selección</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Quick templates */}
                            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Plantillas rápidas</p>
                            <div className="grid grid-cols-2 gap-2 mb-5">
                                {TEMPLATES.map((t, idx) => (
                                    <button
                                        key={`template-${idx}-${t.label}`}
                                        onClick={() => setContent(t.text)}
                                        className="text-left p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-neon/30 hover:bg-neon/5 transition-all"
                                    >
                                        <span className="text-[10px] font-mono text-slate-300">{t.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Textarea */}
                            <div className="relative">
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value.slice(0, charLimit))}
                                    placeholder={
                                        isDocente
                                            ? 'Escribe aquí el mensaje que verán tus alumnos al entrar...'
                                            : 'Escribe aquí el mensaje que verán todos los alumnos al entrar...'
                                    }
                                    rows={6}
                                    className="w-full bg-black/40 border border-slate-700 focus:border-neon rounded-xl p-4 text-sm text-white placeholder-slate-600 outline-none resize-none transition-colors font-mono leading-relaxed"
                                />
                                <span className={`absolute bottom-3 right-3 text-[10px] font-mono ${charCount > charLimit * 0.9 ? 'text-orange-400' : 'text-slate-600'}`}>
                                    {charCount}/{charLimit}
                                </span>
                            </div>

                            {/* Send button */}
                            <button
                                onClick={handleSend}
                                disabled={!content.trim() || sending}
                                className={`mt-4 w-full py-4 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all ${sent
                                    ? 'bg-emerald-500 text-black'
                                    : content.trim()
                                        ? 'bg-neon text-black hover:shadow-[0_0_30px_var(--neon-alpha-40)] hover:scale-[1.01]'
                                        : 'bg-white/5 text-slate-700 cursor-not-allowed'
                                    }`}
                            >
                                {sent ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        {sent.count !== null
                                            ? `¡Enviado a ${sent.count} alumnos!`
                                            : '¡Noticia Publicada!'
                                        }
                                    </>
                                ) : sending ? (
                                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        {isDocente ? 'Enviar a mis alumnos' : 'Publicar y Notificar a Todos'}
                                    </>
                                )}
                            </button>

                            <p className="mt-3 text-[9px] font-mono text-slate-600 text-center uppercase tracking-widest">
                                {isDocente
                                    ? 'El mensaje aparece como pop-up cuando tus alumnos entren al dashboard'
                                    : 'El mensaje aparece como pop-up al entrar al dashboard'
                                }
                            </p>
                        </div>
                    </div>

                    {/* History */}
                    <div>
                        <div className="glass rounded-2xl border border-white/5 p-6">
                            <h2 className="text-xs font-black font-mono text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-slate-400" /> Noticias publicadas
                            </h2>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
                                </div>
                            ) : announcements.length === 0 ? (
                                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-xl">
                                    <Megaphone className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">No hay noticias publicadas</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                                    {announcements.map((ann) => (
                                        <div
                                            key={`announcement-${ann.id}`}
                                            className={`p-4 rounded-xl border transition-all ${ann.is_active
                                                ? 'bg-neon/5 border-neon/20'
                                                : 'bg-white/[0.02] border-white/5 opacity-60'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white font-mono leading-relaxed mb-2 line-clamp-3">{ann.content}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${ann.is_active
                                                            ? 'bg-neon/10 text-neon border-neon/30'
                                                            : 'bg-white/5 text-slate-500 border-white/10'
                                                            }`}>
                                                            {ann.is_active ? '● Activo' : '○ Inactivo'}
                                                        </span>
                                                        <span className="text-[9px] font-mono text-slate-600">
                                                            {new Date(ann.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleToggle(ann.id, ann.is_active)}
                                                        title={ann.is_active ? 'Desactivar' : 'Activar'}
                                                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                                                    >
                                                        {ann.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ann.id)}
                                                        title="Eliminar"
                                                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
