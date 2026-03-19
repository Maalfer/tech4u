import { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, Power, Percent, Users, CheckCircle, XCircle, Shield, Tag, Calendar, Star, Zap, Gift, Copy, FileText, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function AdminCoupons() {
    const [activeTab, setActiveTab] = useState('list');
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [groupProgress, setGroupProgress] = useState(null);
    const { showNotification } = useNotification();

    // Form state for single coupon creation
    const [formData, setFormData] = useState({
        code: '',
        discount_percent: 50,
        max_uses: 1,
        description: '',
        expiry_date: '',
        applicable_plans: 'all',
        assigned_to_email: '',
        is_active: true
    });

    // Form state for group bulk creation
    const [groupFormData, setGroupFormData] = useState({
        groupName: '',
        discount: 10,
        prefix: '',
        emails: ''
    });

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/admin/coupons');
            setCoupons(res.data);
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
            showNotification('Error al cargar cupones', 'error');
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
                code: formData.code.toUpperCase().replace(/\s+/g, ''),
                discount_percent: formData.discount_percent,
                max_uses: formData.max_uses,
                description: formData.description || null,
                expires_at: formData.expiry_date || null,
                applicable_plans: formData.applicable_plans,
                assigned_to_email: formData.assigned_to_email || null,
                is_active: formData.is_active
            });
            showNotification(`Cupón ${formData.code} creado exitosamente`, 'success');
            setShowModal(false);
            setFormData({
                code: '',
                discount_percent: 50,
                max_uses: 1,
                description: '',
                expiry_date: '',
                applicable_plans: 'all',
                assigned_to_email: '',
                is_active: true
            });
            fetchCoupons();
        } catch (err) {
            showNotification(err.response?.data?.detail || 'Error al crear cupón', 'error');
        }
    };

    const handleCreatePreset = async (preset) => {
        try {
            await api.post('/admin/coupons', {
                code: preset.code,
                discount_percent: preset.discount,
                max_uses: 100,
                description: preset.description,
                is_active: true
            });
            showNotification(`Cupón ${preset.code} creado exitosamente`, 'success');
            fetchCoupons();
        } catch (err) {
            showNotification(err.response?.data?.detail || 'Error al crear cupón', 'error');
        }
    };

    const handleCreateGroupCoupons = async (e) => {
        e.preventDefault();
        const emails = groupFormData.emails
            .split('\n')
            .map(e => e.trim())
            .filter(e => e);

        if (emails.length === 0) {
            showNotification('Por favor añade al menos un email', 'error');
            return;
        }

        setGroupProgress({ current: 0, total: emails.length });

        try {
            // Una sola llamada al endpoint bulk — genera códigos con sufijo aleatorio criptográfico
            const res = await api.post('/admin/coupons/bulk', {
                code_prefix: groupFormData.prefix.toUpperCase().replace(/\s+/g, ''),
                discount_percent: groupFormData.discount,
                group_name: groupFormData.groupName,
                emails: emails,
            });
            setGroupProgress({ current: emails.length, total: emails.length });
            showNotification(
                'Éxito',
                `✅ ${res.data.length} cupones generados para el grupo ${groupFormData.groupName}`,
                'success'
            );
            setGroupFormData({ groupName: '', discount: 10, prefix: '', emails: '' });
            setGroupProgress(null);
            setActiveTab('list');
            fetchCoupons();
        } catch (err) {
            showNotification(err.response?.data?.detail || 'Error al generar cupones del grupo', 'error');
            setGroupProgress(null);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.put(`/admin/coupons/${id}/toggle`);
            fetchCoupons();
            showNotification('Estado del cupón actualizado', 'success');
        } catch (err) {
            showNotification('Error al actualizar estado', 'error');
        }
    };

    const handleDelete = async (id, code) => {
        if (!window.confirm(`¿Seguro que quieres eliminar el código ${code}?`)) return;
        try {
            await api.delete(`/admin/coupons/${id}`);
            showNotification(`Cupón ${code} eliminado`, 'success');
            fetchCoupons();
        } catch (err) {
            showNotification('Error al eliminar', 'error');
        }
    };

    const presets = [
        { icon: '🎄', name: 'Navidad', code: 'NAVIDAD25', discount: 25, description: 'Cupón de temporada navideña. Válido por tiempo limitado.' },
        { icon: '🖤', name: 'Black Friday', code: 'BLACKFRIDAY', discount: 40, description: 'Black Friday Tech4U. Máximo impacto.' },
        { icon: '🎃', name: 'Halloween', code: 'HALLOWEEN20', discount: 20, description: 'Oferta especial de Halloween.' },
        { icon: '🎓', name: 'Inicio de Curso', code: 'BIENVENIDO15', discount: 15, description: 'Cupón de bienvenida para nuevos alumnos.' },
        { icon: '💝', name: 'San Valentín', code: 'VALENTÍN20', discount: 20, description: 'Promo San Valentín.' },
        { icon: '🌞', name: 'Verano', code: 'VERANO10', discount: 10, description: 'Descuento especial de verano.' },
        { icon: '✨', name: 'Año Nuevo', code: 'ANONUEVO30', discount: 30, description: '¡Feliz Año Nuevo! Empieza el año aprendiendo.' },
        { icon: '🤝', name: 'Referido VIP', code: 'REFERIDOVIP', discount: 10, description: 'Cupón estándar para referidos confirmados.' }
    ];

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 relative">
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
                    {activeTab === 'list' && (
                        <button onClick={() => setShowModal(true)} className="btn-neon text-xs py-2.5 px-6 shadow-[0_0_15px_var(--neon-alpha-40)] flex gap-2 items-center hover:scale-105 transition-all">
                            <Plus className="w-4 h-4" /> Crear Cupón
                        </button>
                    )}
                </PageHeader>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-white/10">
                    {[
                        { id: 'list', label: 'Todos los Cupones', icon: Ticket },
                        { id: 'presets', label: 'Temporadas / Presets', icon: Gift },
                        { id: 'groups', label: 'Grupos y Clases', icon: Users }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${
                                activeTab === tab.id
                                    ? 'text-neon border-neon'
                                    : 'text-slate-500 border-transparent hover:text-slate-300'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB 1: Todos los Cupones */}
                {activeTab === 'list' && (
                    <div className="glass rounded-xl overflow-hidden neon-border">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--neon-alpha-5)] text-[10px] font-mono text-slate-400 uppercase tracking-widest border-b border-[var(--neon-alpha-20)]">
                                    <th className="p-4">Código</th>
                                    <th className="p-4 text-center">Descuento</th>
                                    <th className="p-4 text-center">Usos</th>
                                    <th className="p-4 text-center">Plan</th>
                                    <th className="p-4 text-center">Estado</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-mono text-xs">Cargando datos...</td></tr>
                                ) : coupons.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-mono text-xs">No hay cupones creados</td></tr>
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
                                                <span className="text-[9px] text-slate-400 font-mono">
                                                    {c.applicable_plans === 'all' ? 'Todos' : c.applicable_plans === 'monthly' ? 'Mensual' : c.applicable_plans === 'quarterly' ? 'Trimestral' : 'Anual'}
                                                </span>
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
                )}

                {/* TAB 2: Temporadas / Presets */}
                {activeTab === 'presets' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {presets.map((preset) => (
                            <div key={preset.code} className="glass rounded-2xl p-6 border border-white/10 hover:border-neon/50 transition-all group">
                                <div className="text-5xl mb-4">{preset.icon}</div>
                                <h3 className="text-sm font-black uppercase text-white mb-2">{preset.name}</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="font-mono text-neon font-bold text-lg">{preset.code}</span>
                                    <span className="text-white/60 text-xs font-bold">{preset.discount}%</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mb-4 font-mono leading-tight">{preset.description}</p>
                                <button
                                    onClick={() => handleCreatePreset(preset)}
                                    className="w-full py-2.5 bg-neon text-black rounded-lg text-xs font-black uppercase hover:scale-105 transition-transform"
                                >
                                    Crear Ahora
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB 3: Grupos y Clases */}
                {activeTab === 'groups' && (
                    <div className="glass rounded-2xl p-8 border border-white/10 max-w-2xl">
                        <h2 className="text-2xl font-black uppercase mb-2 flex items-center gap-3 text-white">
                            <Users className="w-6 h-6 text-neon" />
                            Generar Cupones para Grupo
                        </h2>
                        <p className="text-xs text-slate-400 font-mono mb-8">Se generará un código individual único para cada alumno de la lista.</p>

                        {groupProgress && (
                            <div className="mb-6 p-4 bg-neon/10 border border-neon/30 rounded-lg">
                                <p className="text-xs font-bold text-neon mb-2">Generando {groupProgress.current}/{groupProgress.total} cupones...</p>
                                <div className="w-full bg-black/50 rounded-full h-2">
                                    <div className="bg-neon h-2 rounded-full transition-all" style={{ width: `${(groupProgress.current / groupProgress.total) * 100}%` }} />
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleCreateGroupCoupons} className="space-y-6">
                            <div>
                                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-2">Nombre del Grupo/Clase</label>
                                <input
                                    type="text"
                                    placeholder="Ej: ASIR 1º Grupo A"
                                    className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-white outline-none focus:border-neon"
                                    value={groupFormData.groupName}
                                    onChange={e => setGroupFormData({ ...groupFormData, groupName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-mono uppercase mb-2">% de Descuento</label>
                                    <input
                                        type="number"
                                        min="1" max="100"
                                        className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-white outline-none focus:border-neon"
                                        value={groupFormData.discount}
                                        onChange={e => setGroupFormData({ ...groupFormData, discount: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-mono uppercase mb-2">Prefijo del Código</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: ASIR1A"
                                        className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-neon outline-none focus:border-neon uppercase"
                                        value={groupFormData.prefix}
                                        onChange={e => setGroupFormData({ ...groupFormData, prefix: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-2">Emails o Nombres (uno por línea)</label>
                                <textarea
                                    placeholder="usuario1@email.com&#10;usuario2@email.com&#10;usuario3@email.com"
                                    className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-white outline-none focus:border-neon h-32 resize-none"
                                    value={groupFormData.emails}
                                    onChange={e => setGroupFormData({ ...groupFormData, emails: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-400 font-mono flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p>Si el email no coincide con una cuenta, el cupón se creará sin restricción de usuario. Cada código tiene 1 uso máximo y está bloqueado a su usuario si existe.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={groupProgress !== null}
                                className="w-full py-3 bg-neon text-black rounded-xl text-xs font-black uppercase hover:scale-105 transition-transform disabled:opacity-50"
                            >
                                {groupProgress ? 'Generando...' : 'Generar Cupones para el Grupo'}
                            </button>
                        </form>
                    </div>
                )}

                {/* MODAL CREAR CUPÓN INDIVIDUAL */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <form onSubmit={handleCreate} className="glass w-full max-w-md rounded-2xl border border-neon/30 p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2 text-white">
                                <Ticket className="w-5 h-5 text-neon" /> Nuevo Código
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Código</label>
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
                                        <input
                                            type="number"
                                            min="1" max="100"
                                            className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-white outline-none focus:border-neon"
                                            value={formData.discount_percent}
                                            onChange={e => setFormData({ ...formData, discount_percent: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Límite de Usos</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-white outline-none focus:border-neon"
                                            value={formData.max_uses}
                                            onChange={e => setFormData({ ...formData, max_uses: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Descripción (opcional)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-slate-300 outline-none focus:border-neon"
                                        placeholder="Ej: Nota interna..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Fecha de Expiración (opcional)</label>
                                    <input
                                        type="date"
                                        className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-slate-300 outline-none focus:border-neon"
                                        value={formData.expiry_date}
                                        onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Plan Aplicable</label>
                                    <select
                                        className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-white outline-none focus:border-neon"
                                        value={formData.applicable_plans}
                                        onChange={e => setFormData({ ...formData, applicable_plans: e.target.value })}
                                    >
                                        <option value="all">Todos los planes</option>
                                        <option value="monthly">Solo Mensual</option>
                                        <option value="quarterly">Solo Trimestral</option>
                                        <option value="annual">Solo Anual</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Asignar a Usuario (email, opcional)</label>
                                    <input
                                        type="email"
                                        className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono text-slate-300 outline-none focus:border-neon"
                                        placeholder="usuario@email.com"
                                        value={formData.assigned_to_email}
                                        onChange={e => setFormData({ ...formData, assigned_to_email: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="activeCheck"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="activeCheck" className="text-xs text-slate-300 font-mono uppercase">Activar inmediatamente</label>
                                </div>

                                {formData.discount_percent === 100 && (
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-500 font-mono flex items-start gap-2">
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
