import { useState, useMemo } from 'react';
import { ChevronLeft, Copy, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const PRESETS = [
    { label: 'Cada minuto', cron: '* * * * *' },
    { label: 'Cada hora', cron: '0 * * * *' },
    { label: 'Diariamente a medianoche', cron: '0 0 * * *' },
    { label: 'Diariamente a las 9 AM', cron: '0 9 * * *' },
    { label: 'Cada lunes a las 9 AM', cron: '0 9 * * 1' },
    { label: 'Primer día del mes', cron: '0 0 1 * *' },
    { label: 'Cada 15 minutos', cron: '*/15 * * * *' },
    { label: 'Cada 6 horas', cron: '0 */6 * * *' },
];

const generateNextExecutions = (cronString) => {
    const parts = cronString.split(' ');
    if (parts.length !== 5) return [];

    const [minStr, hourStr, dayStr, monthStr, dowStr] = parts;
    
    const parseField = (field, min, max) => {
        if (field === '*') return Array.from({length: max - min + 1}, (_, i) => i + min);
        if (field.startsWith('*/')) {
            const step = parseInt(field.slice(2));
            return Array.from({length: Math.ceil((max - min + 1) / step)}, (_, i) => min + i * step).filter(v => v <= max);
        }
        if (field.includes(',')) return field.split(',').map(Number);
        if (field.includes('-')) {
            const [start, end] = field.split('-').map(Number);
            return Array.from({length: end - start + 1}, (_, i) => start + i);
        }
        return [parseInt(field)];
    };

    const minutes = parseField(minStr, 0, 59);
    const hours = parseField(hourStr, 0, 23);
    const days = parseField(dayStr, 1, 31);
    const months = parseField(monthStr, 1, 12);
    const dows = parseField(dowStr, 0, 6);

    const executions = [];
    const now = new Date();

    for (let i = 0; i < 5 && executions.length < 5; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() + i);

        const month = checkDate.getMonth() + 1;
        const day = checkDate.getDate();
        const dow = checkDate.getDay();

        if (!months.includes(month)) continue;
        if (!days.includes(day) && !dows.includes(dow)) continue;

        for (const hour of hours) {
            for (const minute of minutes) {
                const exec = new Date(checkDate);
                exec.setHours(hour, minute, 0, 0);
                if (exec > now) {
                    executions.push(exec);
                    if (executions.length >= 5) break;
                }
            }
            if (executions.length >= 5) break;
        }
    }

    return executions.slice(0, 5);
};

export default function CronBuilder() {
    const navigate = useNavigate();
    const [minute, setMinute] = useState('*/15');
    const [hour, setHour] = useState('*');
    const [day, setDay] = useState('*');
    const [month, setMonth] = useState('*');
    const [dow, setDow] = useState('*');
    const [copied, setCopied] = useState('');

    const cronExpression = `${minute} ${hour} ${day} ${month} ${dow}`;
    const nextExecutions = useMemo(() => generateNextExecutions(cronExpression), [cronExpression]);

    const copy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 1500);
    };

    const loadPreset = (cron) => {
        const [m, h, d, mo, dw] = cron.split(' ');
        setMinute(m);
        setHour(h);
        setDay(d);
        setMonth(mo);
        setDow(dw);
    };

    const minutePresets = [
        { label: 'Cada minuto', val: '*' },
        { label: 'Cada 5 min', val: '*/5' },
        { label: 'Cada 15 min', val: '*/15' },
        { label: 'Cada 30 min', val: '*/30' },
        { label: 'Top de hora', val: '0' },
    ];

    const hourPresets = [
        { label: 'Cada hora', val: '*' },
        { label: 'Cada 2 horas', val: '*/2' },
        { label: 'Cada 6 horas', val: '*/6' },
        { label: '9 AM', val: '9' },
        { label: '18 (6 PM)', val: '18' },
    ];

    const dayPresets = [
        { label: 'Cada día', val: '*' },
        { label: 'Día 1', val: '1' },
        { label: 'Día 15', val: '15' },
        { label: 'Días pares', val: '*/2' },
        { label: 'Últimos 3 días', val: '28-31' },
    ];

    const dowPresets = [
        { label: 'Cada día', val: '*' },
        { label: 'Lunes', val: '1' },
        { label: 'Viernes', val: '5' },
        { label: 'Fin de semana', val: '0,6' },
        { label: 'Lunes-Viernes', val: '1-5' },
    ];

    return (
        <div className="flex min-h-screen bg-[#050507] text-white">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 overflow-y-auto h-screen custom-scrollbar">
                <div className="relative border-b border-white/[0.05] overflow-hidden" style={{ background: 'linear-gradient(135deg,#080a0f,#0a0d0a,#080a06)' }}>
                    <div className="absolute inset-0 opacity-[0.10]" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                    <div className="absolute top-0 right-1/3 w-80 h-28 opacity-15 pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(59,130,246,0.8) 0%,transparent 70%)', filter: 'blur(40px)' }} />
                    <div className="relative z-10 px-8 py-6 flex items-center gap-5">
                        <button onClick={() => navigate('/tools')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest"><ChevronLeft className="w-4 h-4" /> Herramientas</button>
                        <div className="w-px h-5 bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl border border-blue-500/30 bg-blue-500/15 flex items-center justify-center"><Info className="w-4 h-4 text-blue-400" /></div>
                            <div>
                                <h1 className="text-base font-black uppercase tracking-tight text-white leading-none">Constructor <span className="text-blue-400">Cron</span></h1>
                                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Expresiones · Planificación · Vista Previa</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 max-w-5xl mx-auto space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            {[
                                { label: 'Minuto', value: minute, onChange: setMinute, presets: minutePresets, range: '0-59' },
                                { label: 'Hora', value: hour, onChange: setHour, presets: hourPresets, range: '0-23' },
                                { label: 'Día del Mes', value: day, onChange: setDay, presets: dayPresets, range: '1-31' },
                                { label: 'Mes', value: month, onChange: setMonth, presets: [], range: '1-12' },
                                { label: 'Día de la Semana', value: dow, onChange: setDow, presets: dowPresets, range: '0-6 (0=Dom)' },
                            ].map(field => (
                                <div key={field.label} className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                    <div className="px-6 py-4 border-b border-white/[0.05]">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{field.label}</span>
                                        <p className="text-[8px] text-slate-600 mt-1">Rango: {field.range}</p>
                                    </div>
                                    <div className="p-6 space-y-3">
                                        <input
                                            value={field.value}
                                            onChange={e => field.onChange(e.target.value)}
                                            placeholder="*, 5, */5, 1-5, 1,3,5"
                                            className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-blue-400 outline-none focus:border-blue-500/40 transition-all"
                                        />
                                        {field.presets.length > 0 && (
                                            <div className="flex gap-2 flex-wrap">
                                                {field.presets.map(p => (
                                                    <button
                                                        key={p.val}
                                                        onClick={() => field.onChange(p.val)}
                                                        className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${
                                                            field.value === p.val
                                                                ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                                                                : 'bg-white/[0.05] border border-white/[0.1] text-slate-500 hover:text-slate-300'
                                                        }`}
                                                    >
                                                        {p.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl border border-white/[0.07] overflow-hidden sticky top-4" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Expresión Cron</span>
                                    <button
                                        onClick={() => copy(cronExpression, 'cron')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                            copied === 'cron'
                                                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                                                : 'bg-blue-500/15 border border-blue-500/25 text-blue-400 hover:bg-blue-500/25'
                                        }`}
                                    >
                                        {copied === 'cron' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                </div>
                                <div className="p-6">
                                    <code className="text-3xl font-mono text-emerald-400 break-all">{cronExpression}</code>
                                    <p className="text-[9px] text-slate-500 mt-3 font-mono">
                                        {minute} {hour} {day} {month} {dow}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                <div className="px-6 py-4 border-b border-white/[0.05]">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Próximas 5 Ejecuciones</span>
                                </div>
                                <div className="p-6 space-y-2">
                                    {nextExecutions.length === 0 ? (
                                        <p className="text-[9px] text-slate-500">No hay ejecuciones válidas</p>
                                    ) : (
                                        nextExecutions.map((exec, idx) => (
                                            <div key={idx} className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.08]">
                                                <p className="text-[10px] font-mono text-blue-400">{exec.toLocaleString('es-ES')}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                <div className="px-6 py-4 border-b border-white/[0.05]">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Presets Comunes</span>
                                </div>
                                <div className="p-6 space-y-2">
                                    {PRESETS.map((p, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => loadPreset(p.cron)}
                                            className="w-full p-3 text-left rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-all"
                                        >
                                            <p className="text-[10px] font-black text-blue-400">{p.label}</p>
                                            <p className="text-[8px] text-slate-500 mt-0.5 font-mono">{p.cron}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                        <div className="px-6 py-4 border-b border-white/[0.05]">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Sintaxis Cron</span>
                        </div>
                        <div className="p-6 space-y-3 text-[10px] leading-relaxed text-slate-400">
                            <p><strong>Formato:</strong> <code className="text-cyan-400">minuto hora día mes día-semana</code></p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-black text-slate-300 mb-2">Símbolos especiales:</p>
                                    <ul className="space-y-1 text-[9px]">
                                        <li><strong>*</strong> - Cualquier valor</li>
                                        <li><strong>*/n</strong> - Cada n unidades</li>
                                        <li><strong>n-m</strong> - Rango</li>
                                        <li><strong>n,m</strong> - Lista</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-black text-slate-300 mb-2">Ejemplos:</p>
                                    <ul className="space-y-1 text-[9px]">
                                        <li><code>0 9 * * 1</code> - Lunes a las 9 AM</li>
                                        <li><code>0 0 1 * *</code> - Primer día del mes</li>
                                        <li><code>*/5 * * * *</code> - Cada 5 minutos</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
