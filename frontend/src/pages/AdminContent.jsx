import { useState, useEffect } from 'react'
import { Database, FolderTree, Trash2, Plus } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

export default function AdminContent() {
    const [activeTab, setActiveTab] = useState('questions') // questions | resources
    const [questions, setQuestions] = useState([])
    const [resources, setResources] = useState([])
    const [loading, setLoading] = useState(true)

    // New Question form
    const [showQModal, setShowQModal] = useState(false)
    const [qForm, setQForm] = useState({
        subject: 'Bases de Datos', text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a', difficulty: 'easy', explanation: ''
    })

    // New Resource form
    const [showRModal, setShowRModal] = useState(false)
    const [rForm, setRForm] = useState({
        title: '', subject: 'Bases de Datos', description: '', file_type: 'pdf', url: '', requires_subscription: true
    })

    const loadData = async () => {
        setLoading(true)
        try {
            const [qRes, rRes] = await Promise.all([
                activeTab === 'questions' ? api.get('/admin/questions') : Promise.resolve({ data: questions }),
                activeTab === 'resources' ? api.get('/resources') : Promise.resolve({ data: resources }),
            ])
            if (activeTab === 'questions') setQuestions(qRes.data)
            if (activeTab === 'resources') setResources(rRes.data)
        } catch (err) {
            console.error(err)
            alert("Error cargando datos")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [activeTab])

    const handleDeleteQ = async (id) => {
        if (!window.confirm("¿Borrar pregunta?")) return
        try { await api.delete(`/admin/questions/${id}`); loadData() }
        catch (err) { alert("Error al borrar") }
    }

    const handleDeleteR = async (id) => {
        if (!window.confirm("¿Borrar recurso?")) return
        try { await api.delete(`/admin/resources/${id}`); loadData() }
        catch (err) { alert("Error al borrar") }
    }

    const handleCreateQ = async (e) => {
        e.preventDefault()
        try {
            await api.post('/admin/questions', qForm)
            setShowQModal(false)
            loadData()
            setQForm({ ...qForm, text: '', explanation: '' }) // reset partial
        } catch (err) { alert("Error al crear") }
    }

    const handleCreateR = async (e) => {
        e.preventDefault()
        try {
            await api.post('/admin/resources', rForm)
            setShowRModal(false)
            loadData()
            setRForm({ ...rForm, title: '', url: '' }) // reset partial
        } catch (err) { alert("Error al crear") }
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">

                <div className="flex items-end justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Database className="w-5 h-5 text-[#39FF14]" />
                            <h1 className="text-2xl font-black text-white">Gestión de Contenido</h1>
                        </div>
                        <p className="text-slate-500 font-mono text-sm">Gestiona Preguntas (Tests) y Recursos (Admin y Docentes)</p>
                    </div>

                    <div className="flex bg-[#0D0D0D] border border-[rgba(57,255,20,0.2)] rounded-lg p-1 overflow-hidden">
                        <button onClick={() => setActiveTab('questions')} className={`px-4 py-1.5 text-sm font-mono transition-colors rounded ${activeTab === 'questions' ? 'bg-[rgba(57,255,20,0.1)] text-[#39FF14]' : 'text-slate-500 hover:text-white'}`}>Preguntas</button>
                        <button onClick={() => setActiveTab('resources')} className={`px-4 py-1.5 text-sm font-mono transition-colors rounded ${activeTab === 'resources' ? 'bg-[rgba(57,255,20,0.1)] text-[#39FF14]' : 'text-slate-500 hover:text-white'}`}>Recursos</button>
                    </div>
                </div>

                {/* --- PREGUNTAS --- */}
                {activeTab === 'questions' && (
                    <div className="glass rounded-xl p-6 neon-border relative">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-lg font-bold text-white">Banco de Preguntas</h2>
                            <button onClick={() => setShowQModal(true)} className="btn-neon-solid px-4 py-2 text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Añadir</button>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? <p className="text-slate-500 p-4">Cargando...</p> : (
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(57,255,20,0.2)] text-slate-400 font-mono">
                                            <th className="p-3">ID</th><th className="p-3">Tema</th><th className="p-3">Dificultad</th><th className="p-3">Texto</th><th className="p-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {questions.map(q => (
                                            <tr key={q.id} className="border-b border-[rgba(255,255,255,0.05)] text-slate-300">
                                                <td className="p-3 font-mono">#{q.id}</td>
                                                <td className="p-3 whitespace-nowrap"><span className="text-[#39FF14] bg-[rgba(57,255,20,0.05)] px-2 py-1 rounded text-xs">{q.subject}</span></td>
                                                <td className="p-3">{q.difficulty}</td>
                                                <td className="p-3 max-w-sm truncate" title={q.text}>{q.text}</td>
                                                <td className="p-3 text-right">
                                                    <button onClick={() => handleDeleteQ(q.id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* --- RECURSOS --- */}
                {activeTab === 'resources' && (
                    <div className="glass rounded-xl p-6 neon-border relative">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-lg font-bold text-white">Repositorio de Recursos</h2>
                            <button onClick={() => setShowRModal(true)} className="btn-neon-solid px-4 py-2 text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Añadir</button>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? <p className="text-slate-500 p-4">Cargando...</p> : (
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(57,255,20,0.2)] text-slate-400 font-mono">
                                            <th className="p-3">Tipo</th><th className="p-3">Tema</th><th className="p-3">Título</th><th className="p-3">Suscripción</th><th className="p-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resources.map(r => (
                                            <tr key={r.id} className="border-b border-[rgba(255,255,255,0.05)] text-slate-300">
                                                <td className="p-3"><span className="px-2 py-1 rounded text-xs bg-slate-800 uppercase font-bold">{r.file_type}</span></td>
                                                <td className="p-3">{r.subject}</td>
                                                <td className="p-3 font-medium text-white">{r.title}</td>
                                                <td className="p-3">{r.requires_subscription ? <span className="text-yellow-500 text-xs">Premium (PRO)</span> : <span className="text-green-400 text-xs">Gratis</span>}</td>
                                                <td className="p-3 text-right">
                                                    <button onClick={() => handleDeleteR(r.id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Modals Form */}
                {showQModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <form onSubmit={handleCreateQ} className="glass p-6 rounded-2xl w-full max-w-xl neon-border max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-bold text-white mb-4">Nueva Pregunta</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div><label className="text-xs text-slate-400 mb-1 block">Módulo</label>
                                    <select value={qForm.subject} onChange={e => setQForm({ ...qForm, subject: e.target.value })} className="w-full bg-[#0D0D0D] border border-slate-700 rounded p-2 text-white">
                                        <option>Bases de Datos</option><option>Redes</option><option>Sistemas Operativos</option><option>Ciberseguridad</option><option>Programación</option>
                                    </select></div>
                                <div><label className="text-xs text-slate-400 mb-1 block">Dificultad</label>
                                    <select value={qForm.difficulty} onChange={e => setQForm({ ...qForm, difficulty: e.target.value })} className="w-full bg-[#0D0D0D] border border-slate-700 rounded p-2 text-white">
                                        <option value="easy">Fácil</option><option value="medium">Media</option><option value="hard">Difícil</option>
                                    </select></div>
                            </div>
                            <textarea placeholder="Enunciado de la pregunta..." value={qForm.text} onChange={e => setQForm({ ...qForm, text: e.target.value })} required className="w-full bg-[#0D0D0D] border border-slate-700 rounded p-3 text-white mb-4 h-24" />

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input placeholder="Opción A" value={qForm.option_a} onChange={e => setQForm({ ...qForm, option_a: e.target.value })} required className="bg-[#0D0D0D] border border-slate-700 rounded p-2 text-white text-sm" />
                                <input placeholder="Opción B" value={qForm.option_b} onChange={e => setQForm({ ...qForm, option_b: e.target.value })} required className="bg-[#0D0D0D] border border-slate-700 rounded p-2 text-white text-sm" />
                                <input placeholder="Opción C" value={qForm.option_c} onChange={e => setQForm({ ...qForm, option_c: e.target.value })} required className="bg-[#0D0D0D] border border-slate-700 rounded p-2 text-white text-sm" />
                                <input placeholder="Opción D" value={qForm.option_d} onChange={e => setQForm({ ...qForm, option_d: e.target.value })} required className="bg-[#0D0D0D] border border-slate-700 rounded p-2 text-white text-sm" />
                            </div>

                            <div className="mb-4">
                                <label className="text-xs text-slate-400 mb-1 block">Opción Correcta</label>
                                <select value={qForm.correct_answer} onChange={e => setQForm({ ...qForm, correct_answer: e.target.value })} className="w-full bg-[#0D0D0D] border border-slate-700 rounded p-2 text-white">
                                    <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                                </select>
                            </div>

                            <textarea placeholder="Explicación (Opcional)" value={qForm.explanation} onChange={e => setQForm({ ...qForm, explanation: e.target.value })} className="w-full bg-[#0D0D0D] border border-slate-700 rounded p-3 text-white mb-6 h-20 text-sm" />

                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowQModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
                                <button type="submit" className="btn-neon-solid px-4 py-2">Guardar Pregunta</button>
                            </div>
                        </form>
                    </div>
                )}

                {showRModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <form onSubmit={handleCreateR} className="glass p-6 rounded-2xl w-full max-w-md neon-border">
                            <h3 className="text-lg font-bold text-white mb-4">Nuevo Recurso</h3>

                            <input placeholder="Título del recurso..." value={rForm.title} onChange={e => setRForm({ ...rForm, title: e.target.value })} required className="w-full bg-[#0D0D0D] border border-slate-700 rounded p-2 text-white mb-4" />

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div><label className="text-xs text-slate-400 mb-1 block">Módulo</label>
                                    <select value={rForm.subject} onChange={e => setRForm({ ...rForm, subject: e.target.value })} className="w-full bg-[#0D0D0D] border border-slate-700 rounded p-2 text-white text-sm">
                                        <option>Bases de Datos</option><option>Redes</option><option>Sistemas Operativos</option><option>Ciberseguridad</option><option>Programación</option>
                                    </select></div>
                                <div><label className="text-xs text-slate-400 mb-1 block">Tipo de archivo</label>
                                    <select value={rForm.file_type} onChange={e => setRForm({ ...rForm, file_type: e.target.value })} className="w-full bg-[#0D0D0D] border border-slate-700 rounded p-2 text-white text-sm">
                                        <option value="pdf">PDF</option><option value="cheatsheet">Cheat Sheet</option>
                                    </select></div>
                            </div>

                            <textarea placeholder="Descripción" value={rForm.description} onChange={e => setRForm({ ...rForm, description: e.target.value })} className="w-full bg-[#0D0D0D] border border-slate-700 rounded p-3 text-white mb-4 h-24 text-sm" />

                            <input type="url" placeholder="URL real del archivo (opcional)" value={rForm.url} onChange={e => setRForm({ ...rForm, url: e.target.value })} className="w-full bg-[#0D0D0D] border border-slate-700 rounded p-2 text-white text-sm mb-4" />

                            <label className="flex items-center gap-2 mb-6 cursor-pointer">
                                <input type="checkbox" checked={rForm.requires_subscription} onChange={e => setRForm({ ...rForm, requires_subscription: e.target.checked })} className="rounded bg-[#0D0D0D] border-slate-700 text-[#39FF14] focus:ring-[#39FF14]" />
                                <span className="text-sm text-slate-300">Requiere suscripción activa (Contenido PRO)</span>
                            </label>

                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowRModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
                                <button type="submit" className="btn-neon-solid px-4 py-2">Guardar Recurso</button>
                            </div>
                        </form>
                    </div>
                )}

            </main>
        </div>
    )
}
