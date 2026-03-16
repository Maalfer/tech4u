import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Users, Search, RefreshCw, Mail, Building2, Globe, Clock,
    CheckCircle, AlertCircle, TrendingUp, ThumbsUp, ThumbsDown,
    Hourglass, Trash2, Sparkles, StickyNote, Check, X,
    GraduationCap, BookOpen, Layers, MessageSquare, Calendar,
    ChevronRight, ArrowRight, Filter, Plus, Info, History, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

// ── Status config ──────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
    { id: 'nuevo',             label: 'Nuevos',      color: 'text-blue-400',     bg: 'bg-blue-500/10',    dot: 'bg-blue-400'    },
    { id: 'contactado',        label: 'Contactados', color: 'text-sky-400',      bg: 'bg-sky-500/10',     dot: 'bg-sky-400'     },
    { id: 'demo',              label: 'Demo',        color: 'text-violet-400',   bg: 'bg-violet-500/10',  dot: 'bg-violet-400'  },
    { id: 'piloto_solicitado', label: 'Piloto Req',  color: 'text-amber-400',    bg: 'bg-amber-500/10',   dot: 'bg-amber-400'   },
    { id: 'piloto_aprobado',   label: 'Piloto Act',  color: 'text-emerald-400',  bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
    { id: 'cliente',           label: 'Clientes',    color: 'text-neon',         bg: 'bg-neon/10',        dot: 'bg-neon'        },
    { id: 'descartado',        label: 'Descartado',  color: 'text-slate-500',    bg: 'bg-slate-500/10',   dot: 'bg-slate-500'   },
];

const COLORS = {
    nuevo: 'blue',
    contactado: 'sky',
    demo: 'violet',
    piloto_solicitado: 'amber',
    piloto_aprobado: 'emerald',
    cliente: 'neon',
    descartado: 'slate'
};

function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isDue(dateIso) {
    if (!dateIso) return false;
    const date = new Date(dateIso);
    const today = new Date();
    today.setHours(0,0,0,0);
    return date <= today;
}

// ── UI Components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, colorClass, suffix = '', description }) {
    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col group hover:border-white/10 transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${colorClass}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-2xl font-black font-mono text-white leading-none">
                        {value}{suffix}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mt-1">{label}</p>
                </div>
            </div>
            {description && (
                <p className="text-[9px] text-slate-600 font-mono leading-tight mt-3 pt-3 border-t border-white/5 group-hover:text-slate-400 transition-colors">
                    {description}
                </p>
            )}
        </div>
    );
}

// ── Modals & Drawers ──────────────────────────────────────────────────────────

function LeadDetailsModal({ leadId, onClose, onRefreshLeads }) {
    const [lead, setLead]           = useState(null);
    const [notes, setNotes]         = useState([]);
    const [activity, setActivity]   = useState([]);
    const [newNote, setNewNote]     = useState('');
    const [loading, setLoading]     = useState(true);
    const [savingNote, setSavingNote] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Buscamos el lead en la lista o lo pedimos (aquí asumimos cargado)
            const [notesRes, activityRes] = await Promise.all([
                api.get(`/education-leads/${leadId}/notes`),
                api.get(`/education-leads/${leadId}/activity`)
            ]);
            setNotes(notesRes.data);
            setActivity(activityRes.data);
        } catch (err) {
            console.error("Error fetching details", err);
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        setSavingNote(true);
        try {
            const res = await api.post(`/education-leads/${leadId}/notes`, { note: newNote });
            setNotes(prev => [res.data, ...prev]);
            setNewNote('');
        } catch (err) {
            alert("Error al guardar nota");
        } finally {
            setSavingNote(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0D0D0D] border border-white/10 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                            <History size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white font-mono uppercase tracking-tight">Historial y Notas</h3>
                            <p className="text-xs font-mono text-slate-500">Traceabilidad completa del lead</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Activity Column */}
                    <div>
                        <h4 className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ArrowRight size={10} /> Actividad Reciente
                        </h4>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-slate-600 font-mono text-[10px] animate-pulse">Cargando eventos...</div>
                            ) : activity.length === 0 ? (
                                <div className="text-slate-700 font-mono text-[10px]">Sin actividad registrada</div>
                            ) : activity.map(a => (
                                <div key={a.id} className="relative pl-5 border-l border-white/5 py-0.5">
                                    <div className="absolute left-[-4.5px] top-2 w-2 h-2 rounded-full bg-violet-500/40 border border-[#0D0D0D]" />
                                    <p className="text-[11px] font-bold text-white font-mono">{a.event_type.replace('_', ' ').toUpperCase()}</p>
                                    <p className="text-[10px] text-slate-500 font-mono leading-tight">{a.description}</p>
                                    <span className="text-[9px] text-slate-600 font-mono italic mt-1 block">{fmtDate(a.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes Column */}
                    <div className="flex flex-col h-full">
                        <h4 className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <StickyNote size={10} /> Notas del Admin
                        </h4>
                        
                        {/* New Note Form */}
                        <form onSubmit={handleAddNote} className="mb-6">
                            <textarea 
                                value={newNote}
                                onChange={e => setNewNote(e.target.value)}
                                placeholder="Escribe un comentario..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white font-mono focus:border-violet-500 outline-none resize-none h-20 transition-colors"
                            />
                            <button 
                                type="submit"
                                disabled={savingNote || !newNote.trim()}
                                className="mt-2 w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[10px] font-black font-mono uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {savingNote ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
                                Añadir Nota
                            </button>
                        </form>

                        <div className="space-y-3 overflow-y-auto max-h-[300px]">
                            {notes.map(n => (
                                <div key={n.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-black text-violet-400/80 font-mono uppercase truncate max-w-[100px]">{n.author_name}</span>
                                        <span className="text-[9px] text-slate-600 font-mono">{fmtDate(n.created_at)}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 font-mono leading-relaxed">{n.note}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ── Lead Card Component ───────────────────────────────────────────────────────

function PipelineCard({ lead, onDetails, onStatusUpdate, onApprove, onReject }) {
    const isOverdue = isDue(lead.next_followup_date);

    return (
        <motion.div 
            layout
            className="group bg-white/[0.03] border border-white/5 rounded-2xl p-4 cursor-grab active:cursor-grabbing hover:bg-white/[0.05] hover:border-white/15 transition-all mb-3 relative overflow-hidden"
        >
            {isOverdue && (
                <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-400 rounded-bl-xl border-b border-l border-red-500/30 animate-pulse" title="Seguimiento pendiente">
                    <AlertCircle size={14} />
                </div>
            )}

            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-xs font-black text-white font-mono group-hover:text-neon transition-colors line-clamp-1">{lead.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{lead.institution}</p>
                    </div>
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {lead.subject && (
                        <span className="px-1.5 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[9px] font-mono rounded-md flex items-center gap-1">
                            <BookOpen size={10} /> {lead.subject}
                        </span>
                    )}
                    {lead.students && (
                        <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-mono rounded-md flex items-center gap-1">
                            <Users size={10} /> {lead.students}
                        </span>
                    )}
                </div>

                {/* Activity Sparkline */}
                {lead.recent_activities?.length > 0 && (
                    <div className="mt-2 py-1.5 border-t border-white/5">
                        <p className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter mb-1 select-none">Última actividad:</p>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 animate-pulse" />
                            <p className="text-[9px] font-mono text-slate-400 truncate tracking-tight italic">
                                "{lead.recent_activities[0].description}"
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer / Actions */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDetails(lead.id); }}
                            onDragStart={(e) => e.stopPropagation()}
                            draggable={false}
                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors cursor-pointer relative z-10"
                            title="Ver detalles e historial"
                        >
                            <Info size={12} />
                        </button>
                        <a 
                            href={`mailto:${lead.email}`}
                            onClick={(e) => e.stopPropagation()}
                            onDragStart={(e) => e.stopPropagation()}
                            draggable={false}
                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors cursor-pointer relative z-10"
                            title="Enviar email"
                        >
                            <Send size={12} />
                        </a>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] font-mono text-slate-600 mr-1">{fmtDate(lead.created_at)}</span>
                        {lead.status === 'piloto_solicitado' && (
                           <button 
                                onClick={(e) => { e.stopPropagation(); onApprove(lead.id); }}
                                onDragStart={(e) => e.stopPropagation()}
                                draggable={false}
                                className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all cursor-pointer relative z-10"
                                title="Aprobar Piloto"
                            >
                                <ThumbsUp size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminLeads() {
    const [leads, setLeads]             = useState([]);
    const [stats, setStats]             = useState(null);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [selectedLead, setSelectedLead] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [leadsRes, statsRes] = await Promise.all([
                api.get('/education-leads'),
                api.get('/education-leads/stats'),
            ]);
            setLeads(leadsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error("Error fetching leads", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Mutations
    const handleStatusMove = async (leadId, newStatus) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead || lead.status === newStatus) return;

        // Optimistic update
        const oldLeads = [...leads];
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

        try {
            await api.patch(`/education-leads/${leadId}/status`, { status: newStatus });
            // Re-fetch stats to update dashboard
            const statsRes = await api.get('/education-leads/stats');
            setStats(statsRes.data);
        } catch (err) {
            setLeads(oldLeads);
            alert("Error al mover el lead");
        }
    };

    const handleApprove = async (id) => {
        if (!confirm("¿Aprobar piloto de 15 días?")) return;
        try {
            await api.post(`/education-leads/${id}/approve`);
            fetchAll();
        } catch (err) {
            alert(err?.response?.data?.detail || "Error al aprobar");
        }
    };

    const handleReject = async (id) => {
        if (!confirm("¿Rechazar solicitud?")) return;
        try {
            await api.post(`/education-leads/${id}/reject`);
            fetchAll();
        } catch {
            alert("Error al rechazar");
        }
    };

    // Filtered Leads
    const filteredLeads = useMemo(() => {
        if (!search) return leads;
        const q = search.toLowerCase();
        return leads.filter(l => 
            l.name.toLowerCase().includes(q) ||
            l.institution.toLowerCase().includes(q) ||
            l.email.toLowerCase().includes(q) ||
            (l.subject || '').toLowerCase().includes(q)
        );
    }, [leads, search]);

    // Metrics calculation
    const metrics = useMemo(() => {
        if (!stats) return { total: 0, pilotReq: 0, conversion: 0, activePilots: 0 };
        const total = stats.total || 0;
        const clients = stats.by_status?.cliente || 0;
        const pilotReq = stats.by_status?.piloto_solicitado || 0;
        const activePilots = stats.by_status?.piloto_aprobado || 0;
        return {
            total,
            pilotReq,
            activePilots,
            clients,
            conversion: total > 0 ? Math.round((clients / total) * 100) : 0
        };
    }, [stats]);

    return (
        <div className="flex min-h-screen bg-[#060606] text-slate-200">
            <Sidebar />
            <main className="flex-1 ml-60 flex flex-col min-h-screen max-w-[calc(100vw-240px)]">
                
                {/* Header Section */}
                <div className="px-8 pt-8 pb-6 border-b border-white/5 space-y-8 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <PageHeader 
                            title="Tech4U CRM" 
                            subtitle="Canal de Ventas y Seguimiento Educativo"
                            icon={TrendingUp}
                        />
                        <div className="flex items-center gap-3">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input 
                                    type="text" 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Buscar docente o centro..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-9 py-2.5 text-xs font-mono focus:border-neon outline-none transition-all placeholder:text-slate-700"
                                />
                            </div>
                            <button onClick={fetchAll} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-slate-400">
                                <RefreshCw size={18} className={loading ? 'animate-spin text-neon' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <StatCard 
                            label="Total Leads" 
                            value={metrics.total} 
                            icon={Users} 
                            colorClass="text-white" 
                            description="Clientes potenciales totales registrados."
                        />
                        <StatCard 
                            label="Pilotos Solicitados" 
                            value={metrics.pilotReq} 
                            icon={Hourglass} 
                            colorClass="text-amber-400" 
                            description="Solicitudes de prueba de 15 días pendientes."
                        />
                        <StatCard 
                            label="Pilotos Activos" 
                            value={metrics.activePilots} 
                            icon={CheckCircle} 
                            colorClass="text-emerald-400" 
                            description="Centros con pruebas en curso actualmente."
                        />
                        <StatCard 
                            label="Conversión" 
                            value={metrics.conversion} 
                            icon={Sparkles} 
                            colorClass="text-neon" 
                            suffix="%" 
                            description="Porcentaje de leads que son clientes."
                        />
                        <StatCard 
                            label="Clientes" 
                            value={metrics.clients} 
                            icon={TrendingUp} 
                            colorClass="text-sky-400" 
                            description="Centros con suscripción institucional activa."
                        />
                    </div>
                </div>

                {/* Pipeline Board */}
                <div className="flex-1 overflow-x-auto p-8 custom-scrollbar relative">
                    <div className="flex gap-6 min-w-[1600px] h-full">
                        {PIPELINE_STAGES.map(stage => {
                            const stageLeads = filteredLeads.filter(l => l.status === stage.id);
                            return (
                                <div key={stage.id} className="flex-1 flex flex-col min-w-[280px] h-full">
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${stage.dot} shadow-[0_0_8px_currentColor]`} />
                                            <h3 className="text-[11px] font-black uppercase tracking-widest font-mono text-slate-400">
                                                {stage.label}
                                            </h3>
                                        </div>
                                        <span className="text-[10px] font-mono font-black text-white px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                                            {stageLeads.length}
                                        </span>
                                    </div>

                                    {/* Column Drop Area */}
                                    <div 
                                        className={`flex-1 overflow-y-auto pr-2 custom-scrollbar bg-white/[0.01] border border-dashed border-white/5 rounded-2xl p-2 transition-colors ${loading ? 'opacity-50' : ''}`}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => {
                                            const leadId = parseInt(e.dataTransfer.getData('leadId'));
                                            handleStatusMove(leadId, stage.id);
                                        }}
                                    >
                                        <AnimatePresence>
                                            {stageLeads.map(lead => (
                                                <div 
                                                    key={lead.id}
                                                    draggable
                                                    onDragStart={e => e.dataTransfer.setData('leadId', lead.id)}
                                                >
                                                    <PipelineCard 
                                                        lead={lead} 
                                                        onDetails={setSelectedLead}
                                                        onApprove={handleApprove}
                                                        onReject={handleReject}
                                                    />
                                                </div>
                                            ))}
                                        </AnimatePresence>
                                        
                                        {stageLeads.length === 0 && !loading && (
                                            <div className="h-24 flex items-center justify-center border border-dashed border-white/5 rounded-xl text-[10px] uppercase font-mono tracking-widest text-slate-800 select-none">
                                                Arrastrar aquí
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Overlays */}
            <AnimatePresence>
                {selectedLead && (
                    <LeadDetailsModal 
                        leadId={selectedLead} 
                        onClose={() => setSelectedLead(null)} 
                        onRefreshLeads={fetchAll}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
