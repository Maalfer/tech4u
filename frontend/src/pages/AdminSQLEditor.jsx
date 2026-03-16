import React, { useState, useEffect } from 'react';
import {
    Database, Plus, Edit2, Trash2, RefreshCw, Check,
    X, ChevronDown, ChevronUp, AlertCircle, Search, Hash, Layers, BookOpen
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const DIFF_OPTIONS = ['basico', 'intermedio', 'avanzado'];

const EXERCISE_TYPE_OPTIONS = [
    { value: 'free_query', label: '✏️  Escribe tu query (clásico)' },
    { value: 'fill_blank', label: '🔲 Completa el hueco' },
    { value: 'find_bug', label: '🐛 Encuentra el error' },
    { value: 'order_clauses', label: '🔀 Ordena las cláusulas' },
    { value: 'reverse_query', label: '🔍 Query inversa' },
];

const emptyForm = {
    dataset_id: '',
    title: '',
    category: '01 - SELECT Básico',
    order_num: 1,
    difficulty: 'basico',
    description: '',
    wiki_title: '',
    wiki_content: '',
    wiki_syntax: '',
    wiki_example: '',
    solution_sql: '',
    xp_reward: 50,
    exercise_type: 'free_query',
    template_sql: '',
    buggy_sql: '',
    fragments: '',
};

const emptyDatasetForm = {
    name: '',
    description: '',
    schema_sql: '',
    seed_sql: '',
    er_diagram_url: '',
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const SchemaExplorer = ({ datasetId }) => {
    const [schema, setSchema] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!datasetId) return;
        const load = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/sql/datasets/${datasetId}/schema`);
                setSchema(res.data);
            } catch (e) {
                console.error("Error loading schema", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [datasetId]);

    if (loading) return (
        <div className="space-y-4 animate-pulse">
            {[1, 2].map(i => (
                <div key={i} className="h-16 rounded-xl bg-white/5" />
            ))}
        </div>
    );

    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
            {schema.map((table, i) => (
                <div key={i} className="glass rounded-xl border border-white/8 overflow-hidden">
                    <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/5 flex items-center gap-2">
                        <Database className="w-3 h-3 text-blue-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-white">{table.table}</span>
                    </div>
                    <div className="p-3 space-y-1.5">
                        {table.columns.map((col, ci) => (
                            <div key={ci} className="flex items-center justify-between text-[11px] font-mono">
                                <div className="flex items-center gap-2">
                                    <Hash className={`w-3 h-3 ${col.pk ? 'text-yellow-500' : 'text-slate-600'}`} />
                                    <span className={col.pk ? 'text-yellow-400' : 'text-slate-300'}>{col.name}</span>
                                </div>
                                <span className="text-slate-600 lowercase">{col.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const Label = ({ children }) => (
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
        {children}
    </label>
);

const Input = ({ value, onChange, ...props }) => (
    <input
        value={value ?? ''}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-blue-400 transition-colors"
        {...props}
    />
);

const Textarea = ({ value, onChange, rows = 4, ...props }) => (
    <textarea
        value={value ?? ''}
        onChange={onChange}
        rows={rows}
        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-blue-400 transition-colors resize-y"
        {...props}
    />
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminSQLEditor() {
    const [view, setView] = useState('exercises'); // 'exercises' | 'datasets'
    const [datasets, setDatasets] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    // Exercise Form
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Dataset Form
    const [dsForm, setDsForm] = useState(emptyDatasetForm);
    const [dsEditId, setDsEditId] = useState(null);
    const [showDsForm, setShowDsForm] = useState(false);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');
    const [filterDataset, setFilterDataset] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [activeTab, setActiveTab] = useState('data'); // 'data' | 'wiki' | 'schema'

    const loadData = async () => {
        setLoading(true);
        try {
            const [dsRes, exRes] = await Promise.all([
                api.get('/sql/admin/datasets'),
                api.get('/sql/admin/exercises'),
            ]);
            setDatasets(dsRes.data);
            setExercises(exRes.data);
        } catch (e) {
            setError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleField = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const handleDsField = (k, v) => setDsForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.dataset_id || !form.title || !form.solution_sql) {
            setError('Dataset, título y solución SQL son obligatorios.');
            return;
        }
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            // Convert fragments newline text → JSON array string for the backend
            const payload = { ...form };
            if (form.exercise_type === 'order_clauses' && form.fragments) {
                const arr = form.fragments.split('\n').map(s => s.trim()).filter(Boolean);
                payload.fragments = JSON.stringify(arr);
            } else if (form.exercise_type !== 'order_clauses') {
                payload.fragments = null;
            }
            if (form.exercise_type !== 'fill_blank') payload.template_sql = null;
            if (form.exercise_type !== 'find_bug') payload.buggy_sql = null;

            if (editId) {
                await api.put(`/sql/admin/exercises/${editId}`, payload);
                setSuccess('Ejercicio actualizado correctamente.');
            } else {
                await api.post('/sql/admin/exercises', payload);
                setSuccess('Ejercicio creado correctamente.');
            }
            setForm(emptyForm);
            setEditId(null);
            setShowForm(false);
            await loadData();
        } catch (e) {
            setError(e?.response?.data?.detail || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDsSubmit = async () => {
        if (!dsForm.name || !dsForm.schema_sql) {
            setError('Nombre y Schema SQL son obligatorios.');
            return;
        }
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            if (dsEditId) {
                await api.put(`/sql/admin/datasets/${dsEditId}`, dsForm);
                setSuccess('Dataset actualizado correctamente.');
            } else {
                await api.post('/sql/admin/datasets', dsForm);
                setSuccess('Dataset creado correctamente.');
            }
            setDsForm(emptyDatasetForm);
            setDsEditId(null);
            setShowDsForm(false);
            await loadData();
        } catch (e) {
            setError(e?.response?.data?.detail || 'Error al guardar dataset');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (ex) => {
        // Convert JSON fragments array back to newline-separated text for the textarea
        let fragmentsText = '';
        if (ex.fragments) {
            try {
                const arr = typeof ex.fragments === 'string' ? JSON.parse(ex.fragments) : ex.fragments;
                fragmentsText = Array.isArray(arr) ? arr.join('\n') : ex.fragments;
            } catch {
                fragmentsText = ex.fragments;
            }
        }
        setForm({
            dataset_id: ex.dataset_id,
            title: ex.title,
            category: ex.category || '01 - SELECT Básico',
            order_num: ex.order_num,
            difficulty: ex.difficulty,
            description: ex.description,
            wiki_title: ex.wiki_title || '',
            wiki_content: ex.wiki_content || '',
            wiki_syntax: ex.wiki_syntax || '',
            wiki_example: ex.wiki_example || '',
            solution_sql: ex.solution_sql,
            xp_reward: ex.xp_reward,
            exercise_type: ex.exercise_type || 'free_query',
            template_sql: ex.template_sql || '',
            buggy_sql: ex.buggy_sql || '',
            fragments: fragmentsText,
        });
        setEditId(ex.id);
        setShowForm(true);
        setError('');
        setSuccess('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDsEdit = (ds) => {
        setDsForm({
            name: ds.name,
            description: ds.description || '',
            schema_sql: ds.schema_sql || '',
            seed_sql: ds.seed_sql || '',
            er_diagram_url: ds.er_diagram_url || '',
        });
        setDsEditId(ds.id);
        setShowDsForm(true);
        setError('');
        setSuccess('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este ejercicio?')) return;
        try {
            await api.delete(`/sql/admin/exercises/${id}`);
            await loadData();
            setSuccess('Ejercicio eliminado.');
        } catch (e) {
            setError('Error al eliminar');
        }
    };

    const handleDsDelete = async (id) => {
        if (!window.confirm('¿Eliminar este dataset? Esto eliminará todos sus ejercicios asociados.')) return;
        try {
            await api.delete(`/sql/admin/datasets/${id}`);
            await loadData();
            setSuccess('Dataset eliminado.');
        } catch (e) {
            setError('Error al eliminar dataset');
        }
    };

    const handleRecompute = async (id) => {
        try {
            await api.post(`/sql/admin/exercises/${id}/recompute`);
            setSuccess(`Resultado esperado recalculado para ejercicio #${id}.`);
        } catch (e) {
            setError(e?.response?.data?.detail || 'Error al recalcular');
        }
    };

    const filtered = exercises.filter(ex => {
        const matchSearch = !search || ex.title.toLowerCase().includes(search.toLowerCase())
            || ex.description?.toLowerCase().includes(search.toLowerCase());
        const matchDs = !filterDataset || String(ex.dataset_id) === String(filterDataset);
        return matchSearch && matchDs;
    });

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                            <Database className="w-8 h-8 text-blue-400" /> SQL Skills Admin
                        </h1>
                        <div className="flex gap-4 mt-2">
                            <button
                                onClick={() => setView('exercises')}
                                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${view === 'exercises' ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Ejercicios ({exercises.length})
                            </button>
                            <button
                                onClick={() => setView('datasets')}
                                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${view === 'datasets' ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Datasets ({datasets.length})
                            </button>
                        </div>
                    </div>
                    {view === 'exercises' ? (
                        <button
                            onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(v => !v); setError(''); setSuccess(''); }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-black uppercase tracking-widest transition-all"
                        >
                            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {showForm ? 'Cancelar' : 'Nuevo ejercicio'}
                        </button>
                    ) : (
                        <button
                            onClick={() => { setDsForm(emptyDatasetForm); setDsEditId(null); setShowDsForm(v => !v); setError(''); setSuccess(''); }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-black uppercase tracking-widest transition-all"
                        >
                            {showDsForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {showDsForm ? 'Cancelar' : 'Nuevo dataset'}
                        </button>
                    )}
                </div>

                {/* Alerts */}
                {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono mb-4">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono mb-4">
                        <Check className="w-4 h-4 flex-shrink-0" /> {success}
                    </div>
                )}

                {/* VIEW: EXERCISES */}
                {view === 'exercises' && (
                    <>
                        {/* Form Exercise */}
                        {showForm && (
                            <div className="glass rounded-2xl border border-blue-500/20 p-6 mb-8 space-y-5">
                                <div className="flex flex-col gap-5">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-sm font-black uppercase tracking-widest text-blue-400">
                                            {editId ? `Editar Ejercicio #${editId}` : 'Crear Ejercicio'}
                                        </h2>
                                        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
                                            {[
                                                { id: 'data', label: 'Datos', icon: Database },
                                                { id: 'wiki', label: 'Wiki', icon: BookOpen },
                                                { id: 'schema', label: 'Esquema', icon: Layers },
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setActiveTab(t.id)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                                                        ${activeTab === t.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                                >
                                                    <t.icon className="w-3 h-3" />
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {activeTab === 'data' && (
                                        <div className="space-y-5 animate-in fade-in slide-in-from-top-1 duration-300">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Dataset *</Label>
                                                    <select
                                                        value={form.dataset_id}
                                                        onChange={e => handleField('dataset_id', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-blue-400 transition-colors"
                                                    >
                                                        <option value="">— Seleccionar —</option>
                                                        {datasets.map(d => (
                                                            <option key={d.id} value={d.id}>{d.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label>Título *</Label>
                                                    <Input
                                                        value={form.title}
                                                        onChange={e => handleField('title', e.target.value)}
                                                        placeholder="Ejercicio 1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Categoría</Label>
                                                    <Input
                                                        value={form.category}
                                                        onChange={e => handleField('category', e.target.value)}
                                                        placeholder="01 - SELECT Básico"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Orden</Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={form.order_num}
                                                        onChange={e => handleField('order_num', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Dificultad</Label>
                                                    <select
                                                        value={form.difficulty}
                                                        onChange={e => handleField('difficulty', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-blue-400 transition-colors"
                                                    >
                                                        {DIFF_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label>XP Recompensa</Label>
                                                    <Input
                                                        type="number"
                                                        min={10}
                                                        step={10}
                                                        value={form.xp_reward}
                                                        onChange={e => handleField('xp_reward', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Tipo de ejercicio *</Label>
                                                <select
                                                    value={form.exercise_type}
                                                    onChange={e => handleField('exercise_type', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-blue-400 transition-colors"
                                                >
                                                    {EXERCISE_TYPE_OPTIONS.map(o => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <Label>Descripción del ejercicio (acepta HTML básico)</Label>
                                                <Textarea
                                                    rows={3}
                                                    value={form.description}
                                                    onChange={e => handleField('description', e.target.value)}
                                                    placeholder="Lista el nombre de todos los productos..."
                                                />
                                            </div>

                                            {form.exercise_type === 'fill_blank' && (
                                                <div className="animate-in slide-in-from-left-2 duration-300">
                                                    <Label>Template SQL — usa ___ para cada hueco</Label>
                                                    <Textarea
                                                        rows={3}
                                                        value={form.template_sql}
                                                        onChange={e => handleField('template_sql', e.target.value)}
                                                        placeholder="SELECT ___ FROM ___;"
                                                        className="font-mono text-amber-300"
                                                    />
                                                </div>
                                            )}

                                            {form.exercise_type === 'find_bug' && (
                                                <div className="animate-in slide-in-from-left-2 duration-300">
                                                    <Label>Query con Bug (pre-cargada en el editor)</Label>
                                                    <Textarea
                                                        rows={3}
                                                        value={form.buggy_sql}
                                                        onChange={e => handleField('buggy_sql', e.target.value)}
                                                        placeholder="SELECT nombre, prize FROM producto;"
                                                        className="font-mono text-orange-300"
                                                    />
                                                </div>
                                            )}

                                            {form.exercise_type === 'order_clauses' && (
                                                <div className="animate-in slide-in-from-left-2 duration-300">
                                                    <Label>Fragmentos SQL (uno por línea, en el orden correcto)</Label>
                                                    <Textarea
                                                        rows={6}
                                                        value={form.fragments}
                                                        onChange={e => handleField('fragments', e.target.value)}
                                                        placeholder={"SELECT nombre, precio\nFROM producto\nWHERE precio > 100"}
                                                        className="font-mono text-purple-300"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <Label>Solución SQL *</Label>
                                                <Textarea
                                                    rows={4}
                                                    value={form.solution_sql}
                                                    onChange={e => handleField('solution_sql', e.target.value)}
                                                    placeholder="SELECT nombre FROM producto;"
                                                    className="font-mono text-[var(--color-neon)]"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'wiki' && (
                                        <div className="space-y-5 animate-in fade-in slide-in-from-top-1 duration-300">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Título Wiki</Label>
                                                    <Input
                                                        value={form.wiki_title}
                                                        onChange={e => handleField('wiki_title', e.target.value)}
                                                        placeholder="SELECT — Seleccionar columnas"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Sintaxis</Label>
                                                    <Input
                                                        value={form.wiki_syntax}
                                                        onChange={e => handleField('wiki_syntax', e.target.value)}
                                                        placeholder="SELECT col FROM tabla;"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Contenido Wiki (Markdown básico)</Label>
                                                <Textarea
                                                    rows={8}
                                                    value={form.wiki_content}
                                                    onChange={e => handleField('wiki_content', e.target.value)}
                                                    placeholder="La sentencia SELECT permite..."
                                                />
                                            </div>

                                            <div>
                                                <Label>Ejemplo de query</Label>
                                                <Textarea
                                                    rows={3}
                                                    value={form.wiki_example}
                                                    onChange={e => handleField('wiki_example', e.target.value)}
                                                    placeholder="SELECT nombre FROM empleado;"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'schema' && (
                                        <div className="animate-in fade-in slide-in-from-top-1 duration-300 min-h-[400px]">
                                            <Label>Explorador del Dataset Seleccionado</Label>
                                            {form.dataset_id ? (
                                                <div className="glass p-5 rounded-2xl border border-white/5 bg-black/20">
                                                    <SchemaExplorer datasetId={form.dataset_id} />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-40 glass rounded-2xl border border-white/5 text-slate-500">
                                                    <Database className="w-8 h-8 opacity-20 mb-2" />
                                                    <p className="text-[10px] uppercase font-black tracking-widest">Selecciona un dataset primero</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-5 border-t border-white/5">
                                    <button
                                        onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null); }}
                                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono uppercase transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={saving}
                                        className="px-6 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest transition-all"
                                    >
                                        {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear ejercicio'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="flex gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Buscar ejercicio..."
                                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-blue-400 transition-colors"
                                />
                            </div>
                            <select
                                value={filterDataset}
                                onChange={e => setFilterDataset(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-blue-400 transition-colors"
                            >
                                <option value="">Todos los datasets</option>
                                {datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>

                        {/* Exercise list */}
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filtered.map(ex => (
                                    <div key={ex.id} className="glass rounded-2xl border border-white/8 overflow-hidden">
                                        <div
                                            className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                            onClick={() => setExpandedId(expandedId === ex.id ? null : ex.id)}
                                        >
                                            <span className="text-slate-600 font-mono text-xs w-8">#{ex.id}</span>
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ex.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-white text-sm font-bold">{ex.title}</span>
                                                <span className="text-slate-500 font-mono text-[10px] ml-2">{ex.category}</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest
                                                ${ex.difficulty === 'basico' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                    ex.difficulty === 'intermedio' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                        'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                                {ex.difficulty}
                                            </span>
                                            {ex.exercise_type && ex.exercise_type !== 'free_query' && (
                                                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest
                                                    ${ex.exercise_type === 'fill_blank' ? 'bg-amber-500/10  border-amber-500/20  text-amber-400' :
                                                        ex.exercise_type === 'find_bug' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                                            ex.exercise_type === 'order_clauses' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                                                'bg-cyan-500/10   border-cyan-500/20   text-cyan-400'
                                                    }`}>
                                                    {{ fill_blank: 'hueco', find_bug: 'bug', order_clauses: 'orden', reverse_query: 'inversa' }[ex.exercise_type]}
                                                </span>
                                            )}
                                            <span className="text-blue-400 font-mono text-xs">{ex.xp_reward} XP</span>
                                            <div className="flex items-center gap-1 ml-2">
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleEdit(ex); }}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleRecompute(ex.id); }}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors"
                                                    title="Recalcular resultado esperado"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleDelete(ex.id); }}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            {expandedId === ex.id ? <ChevronUp className="w-4 h-4 text-slate-600 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                                        </div>

                                        {expandedId === ex.id && (
                                            <div className="px-5 pb-4 pt-2 border-t border-white/5 grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Descripción</p>
                                                    <p className="text-slate-400 text-xs font-mono"
                                                        dangerouslySetInnerHTML={{ __html: ex.description }} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Solución SQL</p>
                                                    <pre className="text-[var(--color-neon)] text-xs font-mono bg-black/40 px-3 py-2 rounded-xl overflow-x-auto">
                                                        {ex.solution_sql}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {filtered.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-40 glass rounded-2xl border border-white/5">
                                        <Database className="w-8 h-8 text-slate-700 mb-2" />
                                        <p className="text-slate-500 font-mono text-xs">No se encontraron ejercicios</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* VIEW: DATASETS */}
                {view === 'datasets' && (
                    <>
                        {/* Form Dataset */}
                        {showDsForm && (
                            <div className="glass rounded-2xl border border-blue-500/20 p-6 mb-8 space-y-5">
                                <h2 className="text-sm font-black uppercase tracking-widest text-blue-400">
                                    {dsEditId ? `Editar Dataset #${dsEditId}` : 'Crear Dataset'}
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Nombre *</Label>
                                        <Input
                                            value={dsForm.name}
                                            onChange={e => handleDsField('name', e.target.value)}
                                            placeholder="Tienda de Informática"
                                        />
                                    </div>
                                    <div>
                                        <Label>ER Diagram URL</Label>
                                        <Input
                                            value={dsForm.er_diagram_url}
                                            onChange={e => handleDsField('er_diagram_url', e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Descripción</Label>
                                    <Textarea
                                        rows={2}
                                        value={dsForm.description}
                                        onChange={e => handleDsField('description', e.target.value)}
                                        placeholder="Descripción breve del dataset..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label>Schema SQL * (CREATE TABLEs)</Label>
                                            <span className="text-[9px] text-slate-500 font-mono">Motor: SQLite</span>
                                        </div>
                                        <Textarea
                                            rows={12}
                                            value={dsForm.schema_sql}
                                            onChange={e => handleDsField('schema_sql', e.target.value)}
                                            placeholder="CREATE TABLE producto (id INTEGER PRIMARY KEY, ...);"
                                            className="font-mono text-blue-300 text-[11px]"
                                        />
                                    </div>
                                    <div>
                                        <Label>Vista Previa Esquema (Basado en Schema SQL guardado)</Label>
                                        {dsEditId ? (
                                            <div className="p-4 rounded-xl bg-black/40 border border-white/5 h-[260px] overflow-auto">
                                                <SchemaExplorer datasetId={dsEditId} />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-[260px] rounded-xl bg-white/5 border border-white/5 border-dashed text-slate-600 text-[10px] font-mono uppercase">
                                                Guarda el dataset para ver el esquema
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label>Seed SQL (INSERT INTOs)</Label>
                                    <Textarea
                                        rows={6}
                                        value={dsForm.seed_sql}
                                        onChange={e => handleDsField('seed_sql', e.target.value)}
                                        placeholder="INSERT INTO producto VALUES (1, 'Portátil', ...);"
                                        className="font-mono text-emerald-400 text-[11px]"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={() => { setShowDsForm(false); setDsForm(emptyDatasetForm); setDsEditId(null); }}
                                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono uppercase transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDsSubmit}
                                        disabled={saving}
                                        className="px-6 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest transition-all"
                                    >
                                        {saving ? 'Guardando...' : dsEditId ? 'Actualizar Dataset' : 'Crear Dataset'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Dataset list */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="h-40 rounded-3xl bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {datasets.map(ds => (
                                    <div key={ds.id} className="glass rounded-3xl border border-white/8 overflow-hidden group hover:border-blue-500/30 transition-all flex flex-col">
                                        <div className="p-6 flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                                                    <Database className="w-6 h-6" />
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDsEdit(ds)}
                                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDsDelete(ds.id)}
                                                        className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-black text-white mb-2">{ds.name}</h3>
                                            <p className="text-slate-500 text-xs font-mono line-clamp-3 mb-4">{ds.description}</p>
                                            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
                                                    <Layers className="w-3.5 h-3.5" />
                                                    <span>{ds.exercise_count} ejercicios</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
                                                    <Hash className="w-3.5 h-3.5" />
                                                    <span>ID: {ds.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div >
    );
}
