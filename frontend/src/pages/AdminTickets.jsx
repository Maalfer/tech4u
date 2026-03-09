import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Ticket,
    CheckCircle,
    Clock,
    AlertTriangle,
    User,
    ExternalLink,
    RefreshCcw,
    Search,
    History,
    Check,
    Send,
    MessageSquare,
    ShieldAlert,
    X,
    Crown,
    Flame
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import api from '../services/api'

export default function AdminTickets() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [replyDrafts, setReplyDrafts] = useState({}) // { ticketId: draft }
    const [selectedUser, setSelectedUser] = useState(null)
    const navigate = useNavigate()

    const fetchTickets = async () => {
        setLoading(true)
        try {
            const res = await api.get('/admin/users/tickets')
            setTickets(res.data)
        } catch (err) {
            (import.meta.env.DEV && console.error)("Error al sincronizar tickets:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [])

    const handleSendMessage = async (ticketId) => {
        const content = replyDrafts[ticketId] || '';
        if (!content.trim()) return;

        try {
            await api.post(`/admin/users/tickets/${ticketId}/messages`, { content });
            setReplyDrafts(prev => {
                const newDrafts = { ...prev };
                delete newDrafts[ticketId];
                return newDrafts;
            });
            fetchTickets();
        } catch (err) {
            alert("Error al enviar el mensaje.");
            (import.meta.env.DEV && console.error)(err);
        }
    }

    const handleResolve = async (ticketId) => {
        if (!confirm("¿Seguro que deseas marcar este ticket como resuelto? No se podrán enviar más correos en este hilo.")) return;

        try {
            await api.patch(`/admin/users/tickets/${ticketId}/status`, {
                status: 'resuelto'
            });
            fetchTickets();
        } catch (err) {
            alert("Error al intentar cerrar el ticket.");
            (import.meta.env.DEV && console.error)(err);
        }
    };

    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(filter.toLowerCase()) ||
        t.description.toLowerCase().includes(filter.toLowerCase()) ||
        (t.user_info && t.user_info.nombre.toLowerCase().includes(filter.toLowerCase()))
    )

    const pendientes = filteredTickets.filter(t => t.status === 'pendiente');
    const corregidos = filteredTickets.filter(t => t.status === 'resuelto');

    return (
        <div className="flex min-h-screen bg-[#050505] text-slate-200 selection:bg-orange-500 selection:text-white">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 relative">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 blur-[100px] -z-10" />

                <PageHeader
                    title={<>Terminal <span className="text-white">de Soporte</span></>}
                    subtitle="Gestión de incidencias y comunicaciones // SECTOR ALPHA"
                    Icon={ShieldAlert}
                    gradient="from-white via-orange-100 to-orange-500"
                    iconColor="text-orange-400"
                    iconBg="bg-orange-500/20"
                    iconBorder="border-orange-500/30"
                    glowColor="bg-orange-500/20"
                >
                    <button
                        onClick={fetchTickets}
                        className="group flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-2xl backdrop-blur-xl"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                        Sincronizar Mainframe
                    </button>
                </PageHeader>

                <div className="relative mb-12">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-slate-600" />
                    </div>
                    <input
                        type="text"
                        placeholder="BUSCAR EN EL REGISTRO DE INCIDENCIAS..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-stone-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-mono text-white placeholder:text-slate-700 focus:border-orange-500/50 outline-none transition-all"
                    />
                </div>

                {/* Pendientes */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                            <h2 className="font-mono text-xs uppercase tracking-[0.3em] font-black text-orange-400">AMENAZAS ACTIVAS ({pendientes.length})</h2>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-orange-500/20 to-transparent ml-6" />
                    </div>

                    <div className="grid gap-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                <RefreshCcw className="w-10 h-10 animate-spin mb-4" />
                                <p className="font-mono text-xs uppercase tracking-widest">Escaneando registros...</p>
                            </div>
                        ) : pendientes.length === 0 ? (
                            <div className="p-16 border border-dashed border-white/5 rounded-[2.5rem] text-center bg-white/[0.01]">
                                <CheckCircle className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-50" />
                                <p className="text-slate-600 font-mono text-xs uppercase tracking-[0.2em]">Cero incidencias reportadas. El sistema está nominal.</p>
                            </div>
                        ) : (
                            pendientes.map(t => (
                                <div key={t.id} className="group relative bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-white/5 hover:border-orange-500/20 transition-all duration-500 overflow-hidden shadow-2xl flex flex-col gap-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="flex-1 space-y-4">
                                            <h3 className="text-white font-black text-xl uppercase tracking-tighter italic mb-1">
                                                {t.subject}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold bg-white/5 p-3 rounded-xl border border-white/5 w-fit">
                                                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-orange-500" /> ID: {t.user_id}</span>
                                                <span className="text-white">{t.user_info?.nombre || 'Usuario Desconocido'}</span>
                                                <span className="text-orange-400">{t.user_info?.subscription_type || 'free'}</span>
                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /> {new Date(t.created_at).toLocaleString()}</span>
                                            </div>

                                            <div className="relative">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500/20 rounded-full" />
                                                <div className="pl-6 py-4 bg-white/[0.02] rounded-r-2xl border border-white/5">
                                                    <p className="text-sm text-slate-300 font-mono leading-relaxed italic">
                                                        "{t.description}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                            <span className="px-3 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest">
                                                Estado: Pendiente
                                            </span>
                                            <button
                                                onClick={() => setSelectedUser(t.user_info)}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/5 text-slate-300 text-[9px] font-bold uppercase rounded-xl hover:text-white hover:bg-white/10 transition-all shadow-sm"
                                            >
                                                <ExternalLink className="w-3 h-3" /> Analizar Perfil
                                            </button>
                                            <button
                                                onClick={() => handleResolve(t.id)}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-orange-500/50 text-orange-400 text-[9px] font-black uppercase rounded-xl hover:bg-orange-500/10 transition-all"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" /> Marcar como Resuelto
                                            </button>
                                        </div>
                                    </div>

                                    {/* Hilo de Chat */}
                                    <div className="border-t border-white/5 pt-6 mt-2">
                                        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Registro de Comunicaciones
                                        </p>

                                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                            {t.messages?.length === 0 ? (
                                                <p className="text-[10px] text-slate-600 font-mono italic">No hay mensajes previos en este hilo.</p>
                                            ) : (
                                                t.messages?.map(msg => (
                                                    <div key={msg.id} className={`p-4 rounded-2xl flex flex-col gap-2 ${msg.sender_role === 'admin' ? 'bg-orange-500/10 border border-orange-500/20 ml-8' : 'bg-white/5 border border-white/5 mr-8'}`}>
                                                        <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-widest">
                                                            <span className={msg.sender_role === 'admin' ? 'text-orange-400' : 'text-slate-400'}>
                                                                {msg.sender_role === 'admin' ? 'SOPORTE ALPHA' : t.user_info?.nombre}
                                                            </span>
                                                            <span className="text-slate-600">{new Date(msg.created_at).toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                            {msg.content}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="flex items-end gap-3">
                                            <textarea
                                                className="flex-1 bg-black/60 border border-white/10 rounded-2xl p-4 text-xs font-mono text-white placeholder:text-slate-700 focus:border-orange-500/50 outline-none transition-all resize-none min-h-[60px]"
                                                placeholder="Responde en el hilo a este alumno..."
                                                value={replyDrafts[t.id] || ''}
                                                onChange={(e) => setReplyDrafts(prev => ({ ...prev, [t.id]: e.target.value }))}
                                                rows="2"
                                            />
                                            <button
                                                onClick={() => handleSendMessage(t.id)}
                                                disabled={!replyDrafts[t.id]?.trim()}
                                                className="flex items-center justify-center h-full px-6 py-4 bg-orange-500 text-black text-[10px] font-black uppercase rounded-2xl hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Send className="w-4 h-4 mr-2" /> Enviar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="opacity-40 hover:opacity-100 transition-all duration-500 pb-10">
                    <div className="flex items-center gap-3 mb-8">
                        <History className="w-5 h-5 text-slate-600" />
                        <h2 className="font-mono text-xs uppercase tracking-[0.3em] font-black text-slate-500">REGISTRO DE OPERACIONES COMPLETADAS</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-slate-600/20 to-transparent ml-6" />
                    </div>

                    <div className="grid gap-4">
                        {corregidos.map(t => (
                            <div key={t.id} className="bg-stone-900/20 p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-neon/10 rounded-lg border border-neon/30 mt-1">
                                            <Check className="w-3.5 h-3.5 text-neon" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-tight">{t.subject}</h4>
                                                <span className="text-[9px] px-1.5 py-0.5 bg-neon/5 text-neon/60 border border-neon/20 rounded uppercase font-black">Fixed</span>
                                            </div>
                                            <p className="text-[10px] font-mono text-slate-600 uppercase mb-4">Neutralizada el {new Date(t.created_at).toLocaleDateString('es-ES')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-[9px] font-mono text-slate-700 uppercase">
                                        Operation ID: #{t.id.toString().padStart(4, '0')}
                                    </div>
                                </div>
                                <div className="pl-14 space-y-2">
                                    <p className="text-xs text-slate-500 font-mono italic border-l-2 border-white/10 pl-3">Original: "{t.description}"</p>

                                    {t.admin_reply && (
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5 mt-2">
                                            <p className="text-[10px] text-slate-500 italic font-mono"><span className="text-neon/80 uppercase not-italic font-black">Respuesta Legacy:</span> "{t.admin_reply}"</p>
                                        </div>
                                    )}

                                    {t.messages && t.messages.length > 0 && (
                                        <div className="mt-4 border-l-2 border-orange-500/20 pl-4 space-y-2">
                                            <p className="text-[9px] text-orange-400 font-mono uppercase font-black tracking-widest mb-2">HILO DE MENSAJES</p>
                                            {t.messages.map(msg => (
                                                <div key={msg.id} className="text-[10px] font-mono text-slate-400 flex gap-4">
                                                    <span className={`uppercase font-bold w-20 flex-shrink-0 ${msg.sender_role === 'admin' ? 'text-orange-500' : 'text-slate-500'}`}>{msg.sender_role}</span>
                                                    <span className="text-slate-300">{msg.content}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Modal de Perfil de Alumno */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="glass p-8 rounded-[2.5rem] w-full max-w-lg border border-white/10 shadow-[0_0_50px_rgba(249,115,22,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] -z-10" />

                        <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30 flex items-center justify-center flex-shrink-0">
                                    <User className="w-6 h-6 text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none mb-2">
                                        Id. <span className="text-orange-400">{selectedUser.nombre}</span>
                                    </h3>
                                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{selectedUser.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-black/40 p-5 rounded-3xl border border-white/5 flex flex-col gap-2">
                                <Crown className="w-5 h-5 text-yellow-500 mb-1" />
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Suscripción</span>
                                <span className="text-lg font-black text-white uppercase">{selectedUser.subscription_type}</span>
                                {selectedUser.subscription_type !== 'lifetime' && selectedUser.subscription_type !== 'free' && selectedUser.subscription_end && (
                                    <span className="text-[9px] font-mono text-slate-600 tracking-wider">
                                        Vence: {new Date(selectedUser.subscription_end).toLocaleDateString('es-ES')}
                                    </span>
                                )}
                            </div>

                            <div className="bg-black/40 p-5 rounded-3xl border border-white/5 flex flex-col gap-2">
                                <Flame className="w-5 h-5 text-orange-500 mb-1" />
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Estado de Racha</span>
                                <span className="text-lg font-black text-orange-400 uppercase">{selectedUser.streak_count} Días</span>
                                <span className="text-[9px] font-mono text-slate-600 tracking-wider">
                                    {selectedUser.streak_protections} Escudos Activos
                                </span>
                            </div>

                            <div className="bg-black/40 p-5 rounded-3xl border border-white/5 flex flex-col gap-2 col-span-2">
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Métricas Generales</span>
                                <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                                    <span className="text-xs font-mono text-slate-400">Nivel de Acceso</span>
                                    <span className="text-xs font-black text-white uppercase">{selectedUser.role}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                                    <span className="text-xs font-mono text-slate-400">Meses en Academia</span>
                                    <span className="text-xs font-black text-white uppercase">{selectedUser.months_subscribed} Meses</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setSelectedUser(null);
                                    navigate('/gestion-usuarios', { state: { searchEmail: selectedUser.email } })
                                }}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black uppercase rounded-2xl hover:bg-orange-500 hover:text-black transition-all"
                            >
                                <ExternalLink className="w-4 h-4" /> Ir a Gestión de Usuarios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}