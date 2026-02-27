import { useState, useEffect } from 'react'
import { Users, Trash2, Shield, Key } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function AdminUsers() {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Modals state
    const [editingRole, setEditingRole] = useState(null) // user object
    const [editingPass, setEditingPass] = useState(null) // user object
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

    const handleRoleChange = async () => {
        if (!editingRole || !newRole) return
        try {
            await api.put(`/admin/users/${editingRole.id}/role`, { role: newRole })
            setEditingRole(null)
            fetchUsers()
        } catch (err) { alert('Error: ' + err.response?.data?.detail) }
    }

    const handlePassChange = async () => {
        if (!editingPass || !newPass) return
        try {
            await api.put(`/admin/users/${editingPass.id}/password`, { new_password: newPass })
            setEditingPass(null)
            setNewPass('')
            alert('Contraseña actualizada con éxito')
        } catch (err) { alert('Error: ' + err.response?.data?.detail) }
    }

    const handleDelete = async (u) => {
        if (u.id === user.id) return alert('No puedes eliminarte a ti mismo.')
        if (!window.confirm(`¿Estás seguro de eliminar a ${u.nombre}?`)) return

        try {
            await api.delete(`/admin/users/${u.id}`)
            fetchUsers()
        } catch (err) { alert('Error: ' + err.response?.data?.detail) }
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-5 h-5 text-[#39FF14]" />
                        <h1 className="text-2xl font-black text-white">Gestión de Usuarios</h1>
                    </div>
                    <p className="text-slate-500 font-mono text-sm">Administra roles, accesos y contraseñas (Solo Admin)</p>
                </div>

                {error && <div className="text-red-400 mb-4">{error}</div>}

                <div className="glass rounded-xl overflow-hidden neon-border">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[rgba(57,255,20,0.05)] text-xs font-mono text-slate-400 uppercase tracking-wider border-b border-[rgba(57,255,20,0.2)]">
                                <th className="p-4">ID</th>
                                <th className="p-4">Usuario</th>
                                <th className="p-4">Plan / Rol</th>
                                <th className="p-4">Racha</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Cargando...</td></tr>
                            ) : users.map(u => (
                                <tr key={u.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                    <td className="p-4 font-mono text-slate-500">#{u.id}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-white mb-0.5">{u.nombre}</p>
                                        <p className="text-xs text-slate-500">{u.email}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-mono font-bold ${u.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                    u.role === 'docente' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                        'bg-slate-800 text-slate-300'
                                                }`}>{u.role}</span>
                                            <span className="text-xs text-slate-500 capitalize">{u.subscription_type}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-[#39FF14] font-mono font-bold">{u.streak_count} 🔥</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setEditingRole(u); setNewRole(u.role) }} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Cambiar rol">
                                                <Shield className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setEditingPass(u)} className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors" title="Cambiar contraseña">
                                                <Key className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(u)} disabled={u.id === user.id} className={`p-2 rounded-lg transition-colors ${u.id === user.id ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-red-400 hover:bg-red-400/10'}`} title="Eliminar usuario">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal Rol */}
                {editingRole && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="glass p-6 rounded-2xl w-full max-w-sm neon-border">
                            <h3 className="text-lg font-bold text-white mb-4">Cambiar rol: {editingRole.nombre}</h3>
                            <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full bg-[#0D0D0D] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white mb-4">
                                <option value="alumno">Alumno</option>
                                <option value="docente">Docente</option>
                                <option value="admin">Administrador</option>
                            </select>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setEditingRole(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</button>
                                <button onClick={handleRoleChange} className="btn-neon-solid px-4 py-2">Guardar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Password */}
                {editingPass && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="glass p-6 rounded-2xl w-full max-w-sm neon-border">
                            <h3 className="text-lg font-bold text-white mb-4">Nueva contraseña: {editingPass.nombre}</h3>
                            <input type="text" placeholder="Nueva contraseña" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-[#0D0D0D] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white mb-4" />
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => { setEditingPass(null); setNewPass('') }} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</button>
                                <button onClick={handlePassChange} className="btn-neon-solid px-4 py-2">Guardar</button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}
