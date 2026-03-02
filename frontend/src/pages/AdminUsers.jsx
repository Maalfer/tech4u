import { useState, useEffect } from 'react'
import { Users, Trash2, Shield, Key, Crown, Clock, AlertCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function AdminUsers() {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [editingRole, setEditingRole] = useState(null)
    const [editingPass, setEditingPass] = useState(null)
    const [newRole, setNewRole] = useState('')
    const [newPass, setNewPass] = useState('')

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

    const handleRoleChange = async () => {
        if (!editingRole || !newRole) return
        try {
            await api.put(`/admin/users/${editingRole.id}/role`, { role: newRole })
            setEditingRole(null)
            fetchUsers()
        } catch (err) { alert('Error: ' + err.response?.data?.detail) }
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
        return { text: `${diffDays}d restantes`, color: 'text-[#39FF14]', icon: Clock };
    }

    // Funciones de Password y Delete se mantienen igual...
    const handlePassChange = async () => {
        if (!editingPass || !newPass) return
        try {
            await api.put(`/admin/users/${editingPass.id}/password`, { new_password: newPass })
            setEditingPass(null); setNewPass('');
            alert('Contraseña actualizada');
        } catch (err) { alert('Error: ' + err.response?.data?.detail) }
    }

    const handleDelete = async (u) => {
        if (u.id === user.id) return alert('No puedes eliminarte a ti mismo.')
        if (!window.confirm(`¿Seguro que quieres eliminar a ${u.nombre}?`)) return
        try {
            await api.delete(`/admin/users/${u.id}`)
            fetchUsers()
        } catch (err) { alert('Error: ' + err.response?.data?.detail) }
    }

    return (
        <div className="flex min-h-screen bg-[#0D0D0D]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-5 h-5 text-[#39FF14]" />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Control de Academia</h1>
                    </div>
                    <p className="text-slate-500 font-mono text-xs italic">Panel de gestión de accesos y membresías Tech4U</p>
                </div>

                <div className="glass rounded-xl overflow-hidden neon-border">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[rgba(57,255,20,0.05)] text-[10px] font-mono text-slate-400 uppercase tracking-widest border-b border-[rgba(57,255,20,0.2)]">
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
                                    <tr key={u.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(57,255,20,0.02)] transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-white">{u.nombre}</p>
                                            <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase border ${
                                                u.role === 'admin' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                                                u.role === 'docente' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                                                'border-slate-700 text-slate-400 bg-slate-800/50'
                                            }`}>{u.role}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <select 
                                                value={u.subscription_type}
                                                onChange={(e) => handleSubscriptionChange(u.id, e.target.value)}
                                                className={`bg-black border text-[11px] font-mono rounded-md px-2 py-1 outline-none transition-all ${
                                                    u.subscription_type === 'lifetime' ? 'border-yellow-500 text-yellow-500' : 'border-[#39FF14]/30 text-[#39FF14]'
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
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => { setEditingRole(u); setNewRole(u.role) }} className="p-2 text-slate-500 hover:text-blue-400"><Shield className="w-4 h-4" /></button>
                                                <button onClick={() => setEditingPass(u)} className="p-2 text-slate-500 hover:text-yellow-500"><Key className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(u)} disabled={u.id === user.id} className="p-2 text-slate-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                
                {/* Modales se mantienen igual... */}
                {editingRole && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="glass p-6 rounded-2xl w-full max-w-sm neon-border">
                            <h3 className="text-lg font-bold text-white mb-4">Modificar Nivel: {editingRole.nombre}</h3>
                            <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm text-white mb-4 outline-none">
                                <option value="alumno">Alumno</option>
                                <option value="docente">Docente</option>
                                <option value="admin">Administrador</option>
                            </select>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setEditingRole(null)} className="px-4 py-2 text-sm text-slate-400">Cancelar</button>
                                <button onClick={handleRoleChange} className="btn-neon-solid px-4 py-2">Confirmar</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}