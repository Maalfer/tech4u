import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Trash2, Shield, Key, Crown, Clock, AlertCircle, Plus } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function AdminUsers() {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [createData, setCreateData] = useState({
        nombre: '', email: '', password: '', role: 'alumno', subscription_type: 'free'
    })

    const handleCreateUser = async (e) => {
        e.preventDefault()
        try {
            await api.post('/admin/users/', createData)
            alert('🚀 Usuario creado correctamente.')
            setShowCreateModal(false)
            setCreateData({ nombre: '', email: '', password: '', role: 'alumno', subscription_type: 'free' })
            fetchUsers()
        } catch (err) {
            alert('Error: ' + (err.response?.data?.detail || 'No se pudo crear el usuario'))
        }
    }

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users')
            setUsers(res.data)
            setError(null)
        } catch (err) {
            setError('Error al cargar usuarios. ' + (err.response?.data?.detail || ''))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchUsers() }, [])

    const handleSubscriptionChange = async (userId, newType) => {
        try {
            await api.patch(`/admin/users/${userId}/subscription`, {
                subscription_type: newType
            });
            fetchUsers(); // Recargamos para obtener las nuevas fechas calculadas por el backend
        } catch (err) {
            alert('Error al actualizar suscripción');
        }
    }

    // Lógica para calcular tiempo restante
    const getSubscriptionStatus = (u) => {
        if (u.subscription_type === 'lifetime') return { text: 'Infinito', color: 'text-yellow-500', icon: Crown };
        if (!u.subscription_end) return { text: 'Sin fecha', color: 'text-slate-600', icon: Clock };

        const end = new Date(u.subscription_end);
        const now = new Date();
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return { text: 'Caducado', color: 'text-red-500', icon: AlertCircle };
        if (diffDays <= 7) return { text: `${diffDays}d restantes`, color: 'text-orange-500', icon: Clock };
        return { text: `${diffDays}d restantes`, color: 'text-neon', icon: Clock };
    }

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-16 md:pt-8 relative">
                <PageHeader
                    title={<>Control <span className="text-white">de Academia</span></>}
                    subtitle="Panel de gestión de accesos y membresías Tech4U"
                    Icon={Users}
                    gradient="from-white via-green-100 to-[var(--color-neon)]"
                    iconColor="text-neon"
                    iconBg="bg-[var(--color-neon)]/20"
                    iconBorder="border-[var(--color-neon)]/30"
                    glowColor="bg-[var(--color-neon)]/20"
                >
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-neon text-black rounded-xl text-xs font-black uppercase shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:scale-105 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Usuario
                    </button>
                </PageHeader>

                <div className="glass rounded-xl overflow-hidden neon-border">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--neon-alpha-5)] text-[10px] font-mono text-slate-400 uppercase tracking-widest border-b border-[var(--neon-alpha-20)]">
                                <th className="p-4">Usuario</th>
                                <th className="p-4">Rol</th>
                                <th className="p-4 text-center">Plan Actual</th>
                                <th className="p-4 text-center">Vencimiento</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Accediendo al mainframe...</td></tr>
                            ) : users.map(u => {
                                const status = getSubscriptionStatus(u);
                                const StatusIcon = status.icon;
                                return (
                                    <tr key={u.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[var(--neon-alpha-2)] transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-white">{u.nombre}</p>
                                            <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase border ${u.role === 'admin' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                                                u.role === 'developer' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' :
                                                    u.role === 'docente' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                                                        'border-slate-700 text-slate-400 bg-slate-800/50'
                                                }`}>{u.role}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <select
                                                disabled={user.role !== 'admin'}
                                                value={u.subscription_type}
                                                onChange={(e) => handleSubscriptionChange(u.id, e.target.value)}
                                                className={`bg-black border text-[11px] font-mono rounded-md px-2 py-1 outline-none transition-all ${u.subscription_type === 'lifetime' ? 'border-yellow-500 text-yellow-500' : 'border-neon/30 text-neon'
                                                    }`}
                                            >
                                                <option value="free">Gratuito</option>
                                                <option value="monthly">Mensual</option>
                                                <option value="quarterly">Trimestral</option>
                                                <option value="annual">Anual</option>
                                                <option value="lifetime">Vitalicio</option>
                                            </select>
                                        </td>
                                        <td className={`p-4 text-center font-mono text-[11px] font-bold ${status.color}`}>
                                            <div className="flex items-center justify-center gap-1.5">
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {status.text}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                to={`/admin/users/${u.id}`}
                                                className="inline-flex items-center gap-1.5 bg-neon/10 border border-neon/30 text-neon hover:bg-neon hover:text-black hover:shadow-[0_0_15px_rgba(57,255,20,0.4)] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                Gestionar
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Modales de Gestión */}

                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <div className="glass p-8 rounded-[2.5rem] w-full max-w-md border border-white/10 shadow-2xl">
                            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter italic">
                                Forjar <span className="text-neon">Nuevo Usuario</span>
                            </h3>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                                    <input
                                        type="text" required
                                        value={createData.nombre}
                                        onChange={e => setCreateData({ ...createData, nombre: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neon transition-all"
                                        placeholder="Ej: John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Email del Sistema</label>
                                    <input
                                        type="email" required
                                        value={createData.email}
                                        onChange={e => setCreateData({ ...createData, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neon transition-all"
                                        placeholder="user@tech4u.edu"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Contraseña Inicial</label>
                                    <input
                                        type="password" required
                                        value={createData.password}
                                        onChange={e => setCreateData({ ...createData, password: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neon transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Rol</label>
                                        <select
                                            value={createData.role}
                                            onChange={e => setCreateData({ ...createData, role: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neon transition-all cursor-pointer"
                                        >
                                            <option value="alumno">Alumno</option>
                                            <option value="docente">Docente</option>
                                            <option value="admin" disabled={user.role !== 'admin'}>Administrador</option>
                                            <option value="developer" disabled={user.role !== 'admin'}>Developer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Plan</label>
                                        <select
                                            value={createData.subscription_type}
                                            onChange={e => setCreateData({ ...createData, subscription_type: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neon transition-all cursor-pointer"
                                        >
                                            <option value="free">Gratuito</option>
                                            <option value="monthly">Mensual</option>
                                            <option value="quarterly">Trimestral</option>
                                            <option value="annual">Anual</option>
                                            <option value="lifetime">Vitalicio</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl text-xs font-black uppercase hover:bg-white/10 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-neon text-black rounded-2xl text-xs font-black uppercase shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:scale-105 transition-all"
                                    >
                                        Crear Usuario
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}