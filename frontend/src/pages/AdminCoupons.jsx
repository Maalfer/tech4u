import { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, Power, Percent, Users, CheckCircle, XCircle, Shield } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import api from '../services/api';

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Formulario para nuevo cupón
    const [formData, setFormData] = useState({
        code: '',
        discount_percent: 50,
        max_uses: 1,
        is_active: true
    });

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/admin/coupons');
            setCoupons(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/coupons', {
                ...formData,
                code: formData.code.toUpperCase().replace(/\s+/g, '')
            });
            setShowModal(false);
            setFormData({ code: '', discount_percent: 50, max_uses: 1, is_active: true });
            fetchCoupons();
        } catch (err) {
            alert(err.response?.data?.detail || 'Error al crear cupón');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.put(`/admin/coupons/${id}/toggle`);
            fetchCoupons();
        } catch (err) {
            alert('Error al actualizar estado del cupón');
        }
    };

    const handleDelete = async (id, code) => {
        if (!window.confirm(`¿Seguro que quieres eliminar el código ${code}?`)) return;
        try {
            await api.delete(`/admin/coupons/${id}`);
            fetchCoupons();
        } catch (err) {
            alert('Error al eliminar');
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative">
                <PageHeader
                    title={<>Gestión de <span className="text-white">Cupones</span></>}
                    subtitle="Crea y administra códigos de descuento o acceso gratuito"
                    Icon={Ticket}
                    gradient="from-white via-green-100 to-[var(--color-neon)]"
                    iconColor="text-neon"
                    iconBg="bg-[var(--color-neon)]/20"
                    iconBorder="border-[var(--color-neon)]/30"
                    glowColor="bg-[var(--color-neon)]/20"
                >
                    <button onClick={() => setShowModal(true)} className="btn-neon text-xs py-2.5 px-6 shadow-[0_0_15px_var(--neon-alpha-40)] flex gap-2 items-center hover:scale-105 transition-all">
                        <Plus className="w-4 h-4" /> Crear Cupón
                    </button>
                </PageHeader>

                <div className="glass rounded-xl overflow-hidden neon-border">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--neon-alpha-5)] text-[10px] font-mono text-slate-400 uppercase tracking-widest border-b border-[var(--neon-alpha-20)]">
                                <th className="p-4">Código</th>
                                <th className="p-4 text-center">Descuento</th>
                                <th className="p-4 text-center">Usos</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-mono text-xs">Cargando datos...</td></tr>
                            ) : coupons.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-mono text-xs">No hay cupones creados</td></tr>
                            ) : (
                                coupons.map((c) => (
                                    <tr key={c.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[var(--neon-alpha-2)] transition-colors">
                                        <td className="p-4">
                                            <span className="font-mono text-white font-black text-lg tracking-wider bg-black/50 px-3 py-1 rounded border border-slate-800">{c.code}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 font-bold text-neon">
                                                <Percent className="w-4 h-4" /> {c.discount_percent}%
                                            </div>
                                            {c.discount_percent === 100 && (
                                                <p className="text-[9px] text-yellow-500 mt-1 uppercase font-black tracking-widest">Pase Directo</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Users className="w-4 h-4 text-slate-500" />
                                                <span className={`font-mono font-bold ${c.current_uses >= c.max_uses ? 'text-red-500' : 'text-slate-300'}`}>
                                                    {c.current_uses} / {c.max_uses}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {c.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black text-neon bg-neon/10 px-2 py-1 rounded border border-neon/30">
                                                    <CheckCircle className="w-3 h-3" /> Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                                                    <XCircle className="w-3 h-3" /> Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleToggleStatus(c.id)}
                                                    className={`p-2 transition-colors ${c.is_active ? 'text-slate-500 hover:text-orange-500' : 'text-slate-500 hover:text-neon'}`}
                                                    title={c.is_active ? "Desactivar" : "Activar"}
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.id, c.code)}
                                                    className="p-2 text-slate-500 hover:text-red-500"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MODAL CREAR CUPÓN */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <form onSubmit={handleCreate} className="glass w-full max-w-md rounded-2xl border border-neon/30 p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2 text-white">
                                <Ticket className="w-5 h-5 text-neon" /> Nuevo Código
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Nombre del Código</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-neon outline-none focus:border-neon uppercase"
                                        placeholder="Ej: GRUPO-ASIR-100"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">% de Descuento</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1" max="100"
                                                className="w-full bg-black border border-slate-700 rounded-lg pl-4 pr-8 py-3 text-sm font-mono text-white outline-none focus:border-neon"
                                                value={formData.discount_percent}
                                                onChange={e => setFormData({ ...formData, discount_percent: parseFloat(e.target.value) })}
                                                required
                                            />
                                            <Percent className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Límite de usos</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full bg-black border border-slate-700 rounded-lg pl-4 pr-8 py-3 text-sm font-mono text-white outline-none focus:border-neon"
                                                value={formData.max_uses}
                                                onChange={e => setFormData({ ...formData, max_uses: parseInt(e.target.value) })}
                                                required
                                            />
                                            <Users className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                                        </div>
                                    </div>
                                </div>

                                {formData.discount_percent === 100 && (
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-500 mt-2 font-mono flex items-start gap-2">
                                        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <p>Con 100% de descuento, los usuarios <b>omitirán la pasarela de pago</b> y se les activará la suscripción instantáneamente.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase hover:bg-white/10 transition-all text-white">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-neon text-black rounded-xl text-xs font-black uppercase shadow-[0_0_20px_var(--neon-alpha-40)]">
                                    Generar Código
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
