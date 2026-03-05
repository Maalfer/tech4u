import React, { useState, useEffect } from 'react';
import {
    Users,
    TrendingUp,
    AlertTriangle,
    ShieldCheck,
    Search,
    RefreshCw,
    ChevronRight,
    SearchX
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

const AdminReferrals = () => {
    const [referrers, setReferrers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users/referral-ecosystem');
            setReferrers(res.data);
        } catch (err) {
            console.error("Error fetching referrers:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReset = async (userId) => {
        if (!window.confirm("¿Seguro que quieres resetear los premios de este usuario?")) return;
        setUpdatingUserId(userId);
        try {
            await api.patch(`/admin/users/${userId}/reset-referrals`);
            fetchData();
        } catch (err) {
            alert("Error al resetear premios");
        } finally {
            setUpdatingUserId(null);
        }
    };

    const filtered = referrers.filter(r =>
        r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referral_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-neon selection:text-black font-mono">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 relative overflow-hidden">
                {/* Ambient */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-neon/4 blur-[150px] rounded-full" />
                    <div className="absolute bottom-[10%] left-[25%] w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full" />
                </div>

                {/* Header Area */}
                <div className="max-w-7xl mx-auto space-y-8 pb-20">
                    <PageHeader
                        title={<>Ecosistema <span className="text-neon">Referidos</span></>}
                        subtitle="Monitorización avanzada del tráfico de invitaciones, detección de fraude algorítmica y gestión de recompensas."
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
                                    placeholder="BUSCAR USUARIO / CÓDIGO..."
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

                    {/* Main Stats Summary Blocks (Optional - can add totals here) */}

                    {/* Dashboard Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                            <RefreshCw className="w-10 h-10 animate-spin text-neon" />
                            <span className="text-[10px] tracking-widest font-black uppercase">Sincronizando Ecosistema...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center border border-white/5 rounded-3xl bg-white/2">
                            <div className="text-slate-600 mb-2 flex justify-center"><SearchX className="w-12 h-12" /></div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No se encontraron patrones sospechosos o usuarios</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filtered.map((referrer) => (
                                <div
                                    key={referrer.user_id}
                                    className={`group relative bg-white/2 border rounded-3xl p-6 transition-all duration-500 hover:bg-white/5 ${referrer.risk_level === 'alto' ? 'border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.1)]' :
                                        referrer.risk_level === 'medio' ? 'border-amber-500/30' : 'border-white/5'
                                        }`}
                                >
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* User Info */}
                                        <div className="lg:w-1/3 space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${referrer.risk_level === 'alto' ? 'bg-red-500/20 border-red-500/40 text-red-500' :
                                                    referrer.risk_level === 'medio' ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' :
                                                        'bg-white/5 border-white/10 text-neon'
                                                    }`}>
                                                    <Users className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black tracking-tight flex items-center gap-2 uppercase">
                                                        {referrer.nombre}
                                                        {referrer.risk_level === 'alto' && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                                                    </h3>
                                                    <p className="text-[10px] text-slate-500 font-mono tracking-wider">{referrer.email}</p>
                                                    <div className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 bg-neon/10 border border-neon/30 rounded text-[9px] font-black text-neon uppercase italic">
                                                        Code: {referrer.referral_code}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Risk Badge */}
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border shadow-sm ${referrer.risk_level === 'alto' ? 'bg-red-500/10 border-red-500/40 text-red-400' :
                                                    referrer.risk_level === 'medio' ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' :
                                                        'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                                    }`}>
                                                    Riesgo: {referrer.risk_level}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="lg:flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 transition-all group-hover:border-white/10">
                                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Invitaciones</p>
                                                <p className="text-xl font-black text-white">{referrer.referral_reward_count}</p>
                                            </div>
                                            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 transition-all group-hover:border-white/10">
                                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Cupones 10%</p>
                                                <p className="text-xl font-black text-neon">{referrer.pending_10p_discounts}</p>
                                            </div>
                                            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 transition-all group-hover:border-white/10">
                                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Meses Gratis</p>
                                                <p className="text-xl font-black text-indigo-400">{referrer.free_months_accumulated}</p>
                                            </div>
                                            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-center">
                                                <button
                                                    onClick={() => handleReset(referrer.user_id)}
                                                    disabled={updatingUserId === referrer.user_id}
                                                    className="w-full h-full flex items-center justify-center gap-2 text-[10px] font-black uppercase hover:text-red-400 transition-colors disabled:opacity-50"
                                                >
                                                    {updatingUserId === referrer.user_id ? 'PROCESANDO...' : 'RESETEAR'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Warnings Section */}
                                        <div className="lg:w-1/4">
                                            {referrer.warnings.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    <p className="text-[8px] text-red-500/70 font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                                                        <AlertTriangle className="w-2.5 h-2.5" /> Anomalías Detectadas
                                                    </p>
                                                    {referrer.warnings.map((w, idx) => (
                                                        <div key={idx} className="bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2 text-[10px] text-red-400 font-bold italic leading-tight">
                                                            - {w}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col justify-center items-center opacity-20 group-hover:opacity-40 transition-all">
                                                    <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2" />
                                                    <p className="text-[8px] font-black tracking-tighter uppercase">Sin Alertas</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminReferrals;
