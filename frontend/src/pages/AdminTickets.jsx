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
    Check
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

export default function AdminTickets() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const navigate = useNavigate()

    const fetchTickets = async () => {
        setLoading(true)
        try {
            const res = await api.get('/admin/users/tickets')
            setTickets(res.data)
        } catch (err) {
            console.error("Error al sincronizar tickets:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [])

    // --- ACTUALIZADO: CAMBIA EL ESTADO EN LUGAR DE BORRAR ---
    const handleResolve = async (ticketId) => {
        try {
            // Llamamos al nuevo endpoint PATCH para actualizar el estado
            await api.patch(`/admin/users/tickets/${ticketId}/status`, { status: 'resuelto' });
            fetchTickets(); // Recargamos para moverlo de sección
        } catch (err) {
            alert("Error al intentar actualizar el ticket.");
            console.error(err);
        }
    };

    const viewUserProfile = (userId) => {
        navigate('/gestion-usuarios', { state: { searchId: userId } });
    };

    const filteredTickets = tickets.filter(t => 
        t.subject.toLowerCase().includes(filter.toLowerCase()) || 
        t.description.toLowerCase().includes(filter.toLowerCase())
    )

    // SEPARACIÓN DE GRUPOS
    const pendientes = filteredTickets.filter(t => t.status === 'pendiente');
    const corregidos = filteredTickets.filter(t => t.status === 'resuelto');

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-slate-200">
            <Sidebar />
            
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Ticket className="w-6 h-6 text-[#39FF14]" />
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                                Centro de Incidencias
                            </h1>
                        </div>
                        <p className="text-slate-500 font-mono text-xs">
                            Panel de control de errores reportados por la comunidad
                        </p>
                    </div>
                    
                    <button 
                        onClick={fetchTickets}
                        className="flex items-center gap-2 px-4 py-2 bg-[rgba(57,255,20,0.05)] border border-[rgba(57,255,20,0.2)] rounded-lg text-xs font-mono text-[#39FF14] hover:bg-[rgba(57,255,20,0.1)] transition-all"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Sincronizar Mainframe
                    </button>
                </div>

                {/* Filtro rápido */}
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text"
                        placeholder="Filtrar por asignatura, ID o palabra clave..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-black/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-mono focus:border-[#39FF14] outline-none transition-all"
                    />
                </div>

                {/* --- SECCIÓN: PENDIENTES --- */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-6 text-orange-400">
                        <AlertTriangle className="w-4 h-4" />
                        <h2 className="font-mono text-xs uppercase tracking-[0.2em] font-black">Incidencias Críticas ({pendientes.length})</h2>
                    </div>

                    <div className="grid gap-4">
                        {loading ? (
                            <p className="text-center font-mono text-slate-600 text-xs">Cargando registros...</p>
                        ) : pendientes.length === 0 ? (
                            <div className="p-10 border border-dashed border-slate-800 rounded-2xl text-center">
                                <CheckCircle className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                                <p className="text-slate-600 font-mono text-xs uppercase">Sin amenazas pendientes</p>
                            </div>
                        ) : (
                            pendientes.map(t => (
                                <div key={t.id} className="group glass p-6 rounded-2xl border border-[rgba(57,255,20,0.1)] hover:border-orange-500/30 transition-all duration-300 shadow-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-[#39FF14] transition-colors">{t.subject}</h3>
                                                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono uppercase">
                                                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#39FF14]/60" /> ID: #{t.user_id}</span>
                                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#39FF14]/60" /> {new Date(t.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-black uppercase tracking-tighter">Pendiente</span>
                                    </div>
                                    <div className="bg-black/30 p-4 ml-14 rounded-xl border border-slate-800/40">
                                        <p className="text-sm text-slate-300 font-mono italic leading-relaxed">"{t.description}"</p>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => viewUserProfile(t.user_id)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 hover:text-white transition-colors">
                                            <ExternalLink className="w-3 h-3" /> Perfil
                                        </button>
                                        <button onClick={() => handleResolve(t.id)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#39FF14]/60 hover:text-[#39FF14] transition-colors">
                                            <CheckCircle className="w-3 h-3" /> Resolver
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* --- SECCIÓN: CORREGIDOS --- */}
                <section className="opacity-50 hover:opacity-100 transition-opacity duration-500">
                    <div className="flex items-center gap-2 mb-6 text-[#39FF14]">
                        <History className="w-4 h-4" />
                        <h2 className="font-mono text-xs uppercase tracking-[0.2em] font-black">Historial de Errores Solventados</h2>
                    </div>

                    <div className="grid gap-3">
                        {corregidos.map(t => (
                            <div key={t.id} className="glass p-4 rounded-xl border border-slate-800 flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-[#39FF14]/5 rounded-lg border border-[#39FF14]/10">
                                        <Check className="w-4 h-4 text-[#39FF14]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 line-through decoration-slate-700">{t.subject}</p>
                                        <p className="text-[9px] font-mono text-slate-600 uppercase">Solucionado el {new Date(t.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="text-[9px] px-2 py-0.5 rounded border border-[#39FF14]/20 text-[#39FF14]/50 uppercase font-black tracking-tighter">Fixed</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}