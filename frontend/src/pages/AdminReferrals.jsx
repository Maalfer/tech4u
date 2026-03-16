import React, { useState, useEffect } from 'react';
import {
    Users,
    TrendingUp,
    AlertTriangle,
    ShieldCheck,
    Search,
    RefreshCw,
    CheckCircle,
    XCircle,
    Flag,
    Crown,
    Zap,
    Gift,
    AlertCircle
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { useNotification } from '../context/NotificationContext';

const AdminReferrals = () => {
    const [stats, setStats] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { showNotification } = useNotification();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, referralsRes] = await Promise.all([
                api.get('/admin/referrals/stats'),
                api.get('/admin/referrals/')
            ]);
            setStats(statsRes.data);
            setReferrals(referralsRes.data.referrals || []);
        } catch (err) {
            if (import.meta.env.DEV) console.error("Error fetching referrals:", err);
            showNotification('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleConfirm = async (id) => {
        try {
            await api.patch(`/admin/referrals/${id}/confirm`);
            showNotification('Referido confirmado exitosamente', 'success');
            fetchData();
        } catch (err) {
            showNotification('Error al confirmar', 'error');
        }
    };

    const handleReject = async (id) => {
        if (!rejectReason.trim()) {
            showNotification('Por favor añade un motivo', 'error');
            return;
        }
        try {
            await api.patch(`/admin/referrals/${id}/reject`, {
                reason: rejectReason
            });
            showNotification('Referido rechazado', 'success');
            setShowRejectModal(false);
            setRejectReason('');
            setRejectingId(null);
            fetchData();
        } catch (err) {
            showNotification('Error al rechazar', 'error');
        }
    };

    const handleFlagFraud = async (id) => {
        if (!window.confirm('¿Seguro que quieres marcar este referido como fraude?')) return;
        try {
            await api.patch(`/admin/referrals/${id}/flag-fraud`);
            showNotification('Referido marcado como fraude', 'success');
            fetchData();
        } catch (err) {
            showNotification('Error al marcar fraude', 'error');
        }
    };

    const filteredReferrals = referrals.filter(r => {
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesSearch = !searchTerm ||
            r.referrer?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.referrer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.referred?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.referred?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status) => {
        const configs = {
            pending: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: 'Pendiente' },
            confirmed: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Confirmado' },
            rejected: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', label: 'Rechazado' },
            fraud: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Fraude' }
        };
        const config = configs[status] || configs.pending;
        return (
            <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-black px-2 py-1 rounded border ${config.bg} ${config.border} ${config.text}`}>
                {status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                {status === 'rejected' && <XCircle className="w-3 h-3" />}
                {status === 'fraud' && <AlertTriangle className="w-3 h-3" />}
                {status === 'pending' && <AlertCircle className="w-3 h-3" />}
                {config.label}
            </span>
        );
    };

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 relative overflow-hidden">
                <PageHeader
                    title={<>Ecosistema <span className="text-neon">Referidos</span></>}
                    subtitle="Monitorización avanzada de referidos, detección de fraude y gestión de recompensas."
                    Icon={TrendingUp}
                    gradient="from-white via-indigo-100 to-indigo-500"
                    iconColor="text-indigo-400"
                    iconBg="bg-indigo-500/20"
                    iconBorder="border-indigo-500/30"
                    glowColor="bg-indigo-500/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="BUSCAR USUARIO..."
                                className="bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-xs focus:border-neon/50 outline-none w-64 transition-all font-mono"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={fetchData}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-neon shadow-2xl backdrop-blur-xl"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </PageHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                        <RefreshCw className="w-10 h-10 animate-spin text-neon" />
                        <span className="text-[10px] tracking-widest font-black uppercase">Sincronizando Ecosistema...</span>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* STATS SECTION */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="glass rounded-2xl p-6 border border-white/10">
                                    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-2">Total</p>
                                    <p className="text-3xl font-black text-white">{stats.total}</p>
                                </div>
                                <div className="glass rounded-2xl p-6 border border-amber-500/30">
                                    <p className="text-[9px] text-amber-500 font-mono uppercase tracking-widest mb-2">Pendientes</p>
                                    <p className="text-3xl font-black text-amber-400">{stats.pending}</p>
                                </div>
                                <div className="glass rounded-2xl p-6 border border-emerald-500/30">
                                    <p className="text-[9px] text-emerald-500 font-mono uppercase tracking-widest mb-2">Confirmados</p>
                                    <p className="text-3xl font-black text-emerald-400">{stats.confirmed}</p>
                                </div>
                                <div className="glass rounded-2xl p-6 border border-slate-500/30">
                                    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-2">Rechazados</p>
                                    <p className="text-3xl font-black text-slate-400">{stats.rejected}</p>
                                </div>
                                <div className="glass rounded-2xl p-6 border border-red-500/30">
                                    <p className="text-[9px] text-red-500 font-mono uppercase tracking-widest mb-2">Fraude</p>
                                    <p className="text-3xl font-black text-red-400">{stats.fraud}</p>
                                </div>
                            </div>
                        )}

                        {/* FRAUD ALERT */}
                        {stats && (stats.fraud > 0 || (stats.suspicious_ips && stats.suspicious_ips.length > 0)) && (
                            <div className="glass rounded-2xl p-6 border-2 border-red-500/40 bg-red-500/5 relative overflow-hidden animate-pulse">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0" />
                                <div className="relative z-10">
                                    <h3 className="text-lg font-black uppercase text-red-400 flex items-center gap-2 mb-4">
                                        <AlertTriangle className="w-6 h-6 animate-pulse" />
                                        Actividad Sospechosa Detectada
                                    </h3>
                                    {stats.suspicious_ips && stats.suspicious_ips.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-red-300 font-mono uppercase tracking-wider mb-3">IPs Sospechosas:</p>
                                            {stats.suspicious_ips.map((ip, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 bg-red-900/20 rounded border border-red-500/20">
                                                    <code className="text-xs font-mono text-red-400">{ip.ip}</code>
                                                    <span className="text-xs text-red-300 font-bold">{ip.count} referidos</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TOP REFERRERS */}
                        {stats && stats.top_referrers && stats.top_referrers.length > 0 && (
                            <div>
                                <h3 className="text-sm font-black uppercase text-white mb-4 flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-yellow-500" />
                                    Top Referidores
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                                    {stats.top_referrers.map((referrer, idx) => (
                                        <div key={referrer.user_id} className="glass rounded-2xl p-4 border border-white/10 hover:border-neon/50 transition-all">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xl font-black text-neon">#{idx + 1}</span>
                                                {idx === 0 && <span className="text-lg">🥇</span>}
                                                {idx === 1 && <span className="text-lg">🥈</span>}
                                                {idx === 2 && <span className="text-lg">🥉</span>}
                                            </div>
                                            <p className="text-xs font-black text-white mb-1">{referrer.nombre}</p>
                                            <p className="text-[9px] text-slate-400 font-mono mb-3">{referrer.email}</p>
                                            <div className="space-y-1 text-[9px]">
                                                <div className="flex justify-between text-slate-300">
                                                    <span>Confirmados:</span>
                                                    <span className="text-emerald-400 font-bold">{referrer.confirmed_referrals}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-300">
                                                    <span>Pendientes:</span>
                                                    <span className="text-amber-400 font-bold">{referrer.pending_discounts}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-300">
                                                    <span>Meses Gratis:</span>
                                                    <span className="text-neon font-bold">{referrer.free_months}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* REFERRALS TABLE */}
                        <div>
                            <h3 className="text-sm font-black uppercase text-white mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-400" />
                                Lista de Referidos
                            </h3>

                            {/* Filter Tabs */}
                            <div className="flex gap-2 mb-6 border-b border-white/10">
                                {['all', 'pending', 'confirmed', 'rejected', 'fraud'].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setStatusFilter(filter)}
                                        className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                                            statusFilter === filter
                                                ? filter === 'fraud' ? 'text-red-400 border-red-400' : filter === 'confirmed' ? 'text-emerald-400 border-emerald-400' : filter === 'pending' ? 'text-amber-400 border-amber-400' : 'text-neon border-neon'
                                                : 'text-slate-500 border-transparent hover:text-slate-300'
                                        }`}
                                    >
                                        {filter === 'all' && `Todos (${referrals.length})`}
                                        {filter === 'pending' && `Pendientes (${referrals.filter(r => r.status === 'pending').length})`}
                                        {filter === 'confirmed' && `Confirmados (${referrals.filter(r => r.status === 'confirmed').length})`}
                                        {filter === 'rejected' && `Rechazados (${referrals.filter(r => r.status === 'rejected').length})`}
                                        {filter === 'fraud' && `Fraude (${referrals.filter(r => r.status === 'fraud').length})`}
                                    </button>
                                ))}
                            </div>

                            {filteredReferrals.length === 0 ? (
                                <div className="py-12 text-center border border-white/5 rounded-2xl bg-white/2">
                                    <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No se encontraron referidos</p>
                                </div>
                            ) : (
                                <div className="glass rounded-xl overflow-hidden neon-border">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[var(--neon-alpha-5)] text-[9px] font-mono text-slate-400 uppercase tracking-widest border-b border-white/10">
                                                <th className="p-4">Referidor</th>
                                                <th className="p-4">Invitado</th>
                                                <th className="p-4 text-center">Estado</th>
                                                <th className="p-4 text-center">IP</th>
                                                <th className="p-4 text-center">Fecha</th>
                                                <th className="p-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {filteredReferrals.map((referral) => (
                                                <tr key={referral.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                                    <td className="p-4">
                                                        <div>
                                                            <p className="text-xs font-bold text-white">{referral.referrer?.nombre}</p>
                                                            <p className="text-[9px] text-slate-500 font-mono">{referral.referrer?.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div>
                                                            <p className="text-xs font-bold text-white">{referral.referred?.nombre}</p>
                                                            <p className="text-[9px] text-slate-500 font-mono">{referral.referred?.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {getStatusBadge(referral.status)}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <code className="text-[9px] font-mono text-slate-400">{referral.ip_address || '-'}</code>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="text-[9px] text-slate-400 font-mono">
                                                            {referral.created_at ? new Date(referral.created_at).toLocaleDateString('es-ES') : '-'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {referral.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleConfirm(referral.id)}
                                                                        className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded transition-all"
                                                                        title="Confirmar"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setRejectingId(referral.id);
                                                                            setShowRejectModal(true);
                                                                        }}
                                                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-all"
                                                                        title="Rechazar"
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {(referral.status === 'pending' || referral.status === 'confirmed') && (
                                                                <button
                                                                    onClick={() => handleFlagFraud(referral.id)}
                                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-all"
                                                                    title="Marcar como fraude"
                                                                >
                                                                    <Flag className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* REJECT MODAL */}
                {showRejectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="glass w-full max-w-md rounded-2xl border border-red-500/30 p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <h2 className="text-lg font-black uppercase mb-4 flex items-center gap-2 text-red-400">
                                <XCircle className="w-5 h-5" />
                                Rechazar Referido
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-mono uppercase mb-2">Motivo del Rechazo</label>
                                    <textarea
                                        className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-white outline-none focus:border-red-500 resize-none h-24"
                                        placeholder="Ej: Actividad sospechosa, multiple accounts..."
                                        value={rejectReason}
                                        onChange={e => setRejectReason(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectReason('');
                                        setRejectingId(null);
                                    }}
                                    className="flex-1 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase hover:bg-white/10 transition-all text-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleReject(rejectingId)}
                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-black uppercase hover:bg-red-600 transition-all"
                                >
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminReferrals;
