import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wand2,
    Layers,
    Target,
    Zap,
    BookOpen,
    ListChecks,
    ChevronLeft,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const TEMPLATES = {
    'linux-navigation': {
        name: 'Linux Navigation',
        description: 'Aprende a moverte con soltura por el sistema de ficheros de Linux, el pilar fundamental de la administración de sistemas.',
        goal_description: '- Comprender la jerarquía de directorios en Linux.\n- Utilizar comandos relativos y absolutos.\n- Listar y visualizar contenido básico.',
        step_by_step_guide: '### 📂 Misión: Orientación en el Sistema\n\nPara esta misión, necesitarás usar los comandos `pwd`, `ls` y `cd`.\n1. Comprueba dónde estás.\n2. Navega al directorio raíz.\n3. Explora el directorio actual.',
        challenges: [
            { title: '¿Dónde estoy?', description: 'Muestra tu directorio actual de trabajo.', xp_reward: 50 },
            { title: 'Listado Básico', description: 'Lista los archivos del directorio actual.', xp_reward: 50 },
            { title: 'Navegación Absoluta', description: 'Navega al directorio /var/log.', xp_reward: 100 }
        ]
    },
    'file-management': {
        name: 'File Management',
        description: 'Domina la creación, copia, movimiento y eliminación de archivos y directorios desde la terminal.',
        goal_description: '- Crear archivos y directorios vacíos.\n- Copiar y mover elementos de forma segura.\n- Eliminar elementos sin dejar rastro.',
        step_by_step_guide: '### 📝 Misión: Organización de Archivos\n\nTrabajaremos con `touch`, `mkdir`, `cp`, `mv` y `rm`.\n1. Crea un área de trabajo.\n2. Genera los archivos necesarios.\n3. Organízalos en la estructura pedida.',
        challenges: [
            { title: 'Crear Directorio', description: 'Crea un directorio llamado "workspace".', xp_reward: 50 },
            { title: 'Crear Archivo', description: 'Crea un archivo vacío llamado "report.txt" dentro de workspace.', xp_reward: 75 },
            { title: 'Mover y Renombrar', description: 'Mueve "report.txt" a "final_report.txt".', xp_reward: 100 }
        ]
    },
    'user-management': {
        name: 'User Management',
        description: 'Aprende a gestionar usuarios y grupos en Linux para mantener un sistema organizado y seguro.',
        goal_description: '- Añadir y eliminar usuarios.\n- Crear y asignar grupos.\n- Modificar propiedades de cuenta.',
        step_by_step_guide: '### 👥 Misión: Administrador de Acceso\n\nUtiliza los comandos `useradd`, `usermod`, `groupadd`.\n1. Crea un nuevo grupo para desarrolladores.\n2. Crea un usuario y asígnale el grupo.\n3. Verifica que la asignación es correcta.',
        challenges: [
            { title: 'Nuevo Grupo', description: 'Crea un grupo llamado "developers".', xp_reward: 75 },
            { title: 'Nuevo Usuario', description: 'Crea un usuario llamado "dev1".', xp_reward: 100 },
            { title: 'Asignar Grupo', description: 'Añade "dev1" al grupo "developers".', xp_reward: 125 }
        ]
    },
    'permissions': {
        name: 'Permissions',
        description: 'Controla quién puede leer, escribir y ejecutar archivos en tu sistema usando el sistema de permisos de Linux.',
        goal_description: '- Comprender permisos de propietario, grupo y otros.\n- Modificar permisos con chmod (simbólico y octal).\n- Cambiar propietarios con chown.',
        step_by_step_guide: '### 🔐 Misión: Seguridad de Archivos\n\nUsaremos `chmod` y `chown`.\n1. Revisa los permisos actuales.\n2. Asegura el archivo secreto.\n3. Concede acceso de ejecución al script.',
        challenges: [
            { title: 'Crear Script', description: 'Crea un archivo "script.sh".', xp_reward: 50 },
            { title: 'Permisos de Ejecución', description: 'Dale permisos de ejecución a "script.sh" para el propietario.', xp_reward: 100 },
            { title: 'Bloquear Archivo', description: 'Quita todos los permisos al grupo y a otros en "script.sh".', xp_reward: 150 }
        ]
    },
    'process-management': {
        name: 'Process Management',
        description: 'Monitoriza, controla y finaliza procesos en ejecución para mantener la salud del sistema.',
        goal_description: '- Visualizar procesos activos.\n- Enviar señales a procesos.\n- Gestionar trabajos en segundo plano.',
        step_by_step_guide: '### ⚙️ Misión: Control del Sistema\n\nPractica con `ps`, `top`, `kill` y `jobs`.\n1. Identifica el proceso problemático.\n2. Mándalo a segundo plano.\n3. Finalízalo de forma segura.',
        challenges: [
            { title: 'Listar Procesos', description: 'Muestra todos los procesos del usuario actual.', xp_reward: 50 },
            { title: 'Encontrar PID', description: 'Encuentra el PID del proceso "bash".', xp_reward: 100 },
            { title: 'Matar Proceso', description: 'Ejecuta un comando sleep y mátalo.', xp_reward: 150 }
        ]
    }
};

export default function AdminLabGenerator() {
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [fetchingModules, setFetchingModules] = useState(true);
    const [modules, setModules] = useState([]);

    const [form, setForm] = useState({
        title: '',
        module_id: '',
        difficulty: 'medium',
        base_xp: 100,
        topic: 'linux-navigation',
        num_challenges: 3
    });

    useEffect(() => {
        fetchAllModules();
    }, []);

    const fetchAllModules = async () => {
        setFetchingModules(true);
        try {
            const pathsRes = await api.get('/labs/paths');
            let allModules = [];
            for (const path of pathsRes.data) {
                const modRes = await api.get(`/labs/paths/${path.id}/modules`);
                // Append skill path title logic purely for display if we wanted, 
                // but we just need module objects
                const modsWithContext = modRes.data.map(m => ({
                    ...m,
                    path_title: path.title
                }));
                allModules = [...allModules, ...modsWithContext];
            }
            setModules(allModules);
            if (allModules.length > 0) {
                setForm(prev => ({ ...prev, module_id: allModules[0].id.toString() }));
            }
        } catch (err) {
            addNotification({ title: 'Error', description: 'No se pudieron cargar los módulos.', type: 'error' });
        } finally {
            setFetchingModules(false);
        }
    };

    const handleFormChange = (updates) => {
        setForm(prev => ({ ...prev, ...updates }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (!form.title || !form.module_id) {
            addNotification({ title: 'Atención', description: 'Por favor, rellena los campos obligatorios.', type: 'warning' });
            return;
        }

        setLoading(true);
        const template = TEMPLATES[form.topic];
        const moduleId = parseInt(form.module_id);

        try {
            // Determine order_index by getting current labs in the module
            const existingLabsRes = await api.get(`/labs/modules/${moduleId}/labs`);
            const nextOrderIndex = existingLabsRes.data.length;

            const numChalls = Math.min(Math.max(1, form.num_challenges), 10);

            // Format challenges for the new backend payload
            const challengesPayload = Array.from({ length: numChalls }).map((_, i) => {
                const tplChall = template.challenges[i] || {
                    title: `Challenge Especial ${i + 1}`,
                    description: 'Completa la tarea asignada para superar este reto.',
                    xp_reward: 50
                };
                return {
                    title: tplChall.title,
                    description: tplChall.description,
                    xp_reward: tplChall.xp_reward
                };
            });

            // 1. Send the unified request
            const generatorPayload = {
                title: form.title,
                module_id: moduleId,
                difficulty: form.difficulty,
                base_xp: form.base_xp,
                num_challenges: numChalls,
                description: template.description,
                goal_description: template.goal_description,
                step_by_step_guide: template.step_by_step_guide,
                order_index: nextOrderIndex,
                challenges: challengesPayload
            };

            await api.post('/labs/generate', generatorPayload);

            addNotification({ title: '¡Magia!', description: 'Laboratorio generado correctamente. Configura los validadores ahora.', type: 'success' });

            // 2. Redirect to the labs view of that module to let admin see and edit the draft
            navigate(`/gestion/terminal-builder/modules/${moduleId}/labs`);

        } catch (err) {
            if (import.meta.env.DEV) console.error("Generator Error", err);
            const detailDetail = err.response?.data?.detail;
            const errorMsg = typeof detailDetail === 'string' ? detailDetail : 'Hubo un error durante la generación.';
            addNotification({ title: 'Error', description: errorMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/gestion/terminal-builder')}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neon/60 mb-1">
                            <Wand2 className="w-3 h-3" /> Herramientas de Creación
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Lab Generator</h2>
                    </div>
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10">
                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-10 max-w-2xl">
                    Utiliza esta herramienta para crear automáticamente la estructura base de un laboratorio (Borrador), incluyendo guías, objetivos y retos.
                    <strong className="text-neon font-normal"> Los laboratorios se crearán ocultos por defecto</strong>.
                </p>

                <form onSubmit={handleGenerate} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <Target className="w-3 h-3" /> Título del Laboratorio
                            </label>
                            <input
                                required
                                value={form.title}
                                onChange={e => handleFormChange({ title: e.target.value })}
                                placeholder="Ej: Navegación Básica Táctica"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono"
                            />
                        </div>

                        {/* Module */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <Layers className="w-3 h-3" /> Módulo Destino
                            </label>
                            <select
                                required
                                disabled={fetchingModules}
                                value={form.module_id}
                                onChange={e => handleFormChange({ module_id: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon/50 focus:bg-white/10 transition-all appearance-none font-mono"
                            >
                                {modules.length === 0 && <option value="">Cargando módulos...</option>}
                                {modules.map(mod => (
                                    <option key={mod.id} value={mod.id}>
                                        {mod.path_title} - {mod.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <Target className="w-3 h-3" /> Dificultad
                            </label>
                            <select
                                value={form.difficulty}
                                onChange={e => handleFormChange({ difficulty: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon/50 focus:bg-white/10 transition-all appearance-none font-mono"
                            >
                                <option value="easy">Easy (Principiante)</option>
                                <option value="medium">Medium (Standard)</option>
                                <option value="hard">Hard (Avanzado)</option>
                            </select>
                        </div>

                        {/* Base XP */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <Zap className="w-3 h-3" /> XP Base del Lab
                            </label>
                            <input
                                type="number"
                                required
                                value={form.base_xp}
                                onChange={e => handleFormChange({ base_xp: parseInt(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono"
                            />
                        </div>

                        {/* Topic / Template */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <BookOpen className="w-3 h-3" /> Plantilla de Contenido
                            </label>
                            <select
                                value={form.topic}
                                onChange={e => handleFormChange({ topic: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon/50 focus:bg-white/10 transition-all appearance-none font-mono"
                            >
                                {Object.entries(TEMPLATES).map(([key, template]) => (
                                    <option key={key} value={key}>{template.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Number of Challenges */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <ListChecks className="w-3 h-3" /> Número de Retos
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                required
                                value={form.num_challenges}
                                onChange={e => handleFormChange({ num_challenges: parseInt(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon/50 focus:bg-white/10 transition-all font-mono"
                            />
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="mt-8 p-6 border border-neon/10 bg-neon/5 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Wand2 className="w-32 h-32" />
                        </div>
                        <h4 className="text-neon font-black tracking-widest uppercase text-xs flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-4 h-4" /> Resumen de Generación
                        </h4>
                        <ul className="space-y-2 font-mono text-sm text-slate-300">
                            <li><span className="text-slate-500">Plantilla seleccionada:</span> {TEMPLATES[form.topic]?.name}</li>
                            <li><span className="text-slate-500">Retos a generar:</span> {form.num_challenges} placeholder(s) configurados.</li>
                            <li><span className="text-slate-500">El laboratorio se creará como:</span> <strong className="text-yellow-500">Borrador (Oculto)</strong></li>
                            <li><span className="text-slate-500">Destino:</span> {modules.find(m => m.id === parseInt(form.module_id))?.title || 'Buscando...'}</li>
                        </ul>
                    </div>

                    <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => navigate('/gestion/terminal-builder')}
                            className="px-6 py-3 font-black uppercase tracking-tighter text-slate-500 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || fetchingModules}
                            className="flex items-center gap-3 bg-neon text-black px-8 py-3 rounded-xl font-black uppercase tracking-tighter hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(198,255,51,0.2)]"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                            {loading ? 'Generando Magia...' : 'Generar Laboratorio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
