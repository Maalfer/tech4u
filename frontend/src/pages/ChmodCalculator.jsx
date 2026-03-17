import { useState } from 'react';
import { ChevronLeft, Copy, CheckCircle2, Terminal, RefreshCw, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// ── PERMISSION LOGIC ─────────────────────────────────────────────────────────
const ENTITIES = [
    { id: 'owner', label: 'Owner (u)', labelEs: 'Propietario', color: 'blue'   },
    { id: 'group', label: 'Group (g)', labelEs: 'Grupo',       color: 'violet' },
    { id: 'other', label: 'Other (o)', labelEs: 'Otros',       color: 'amber'  },
];
const PERMS = [
    { id: 'r', label: 'Read',    labelEs: 'Leer',      bit: 4, symbol: 'r', desc: 'Ver contenido del archivo o listar el directorio.' },
    { id: 'w', label: 'Write',   labelEs: 'Escribir',  bit: 2, symbol: 'w', desc: 'Modificar el archivo o crear/eliminar archivos en el directorio.' },
    { id: 'x', label: 'Execute', labelEs: 'Ejecutar',  bit: 1, symbol: 'x', desc: 'Ejecutar el archivo o acceder al directorio (cd).' },
];
const SPECIAL = [
    { id: 'suid', label: 'SUID', bit: 4, symbol: 's', pos: 'owner', desc: 'Set-UID: el proceso se ejecuta con permisos del propietario del archivo, no del que lo ejecuta.', risk: 'high' },
    { id: 'sgid', label: 'SGID', bit: 2, symbol: 's', pos: 'group', desc: 'Set-GID: el proceso hereda el grupo del archivo. En directorios: archivos nuevos heredan el grupo del dir.', risk: 'medium' },
    { id: 'sticky', label: 'Sticky', bit: 1, symbol: 't', pos: 'other', desc: 'Sticky bit: solo el propietario del archivo puede eliminarlo. Usado en /tmp.', risk: 'low' },
];

const colorMap = {
    blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/25',   text: 'text-blue-400',   checked: 'bg-blue-500 border-blue-500'   },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/25', text: 'text-violet-400', checked: 'bg-violet-500 border-violet-500' },
    amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/25',  text: 'text-amber-400',  checked: 'bg-amber-500 border-amber-500'  },
};

const PRESETS = [
    { label: '755', octal: '755', desc: 'Ejecutable público',  who: 'Propietario: rwx · Grupo: r-x · Otros: r-x', common: true },
    { label: '644', octal: '644', desc: 'Archivo estándar',    who: 'Propietario: rw- · Grupo: r-- · Otros: r--', common: true },
    { label: '600', octal: '600', desc: 'Privado (SSH key)',    who: 'Propietario: rw- · Grupo: --- · Otros: ---', common: true },
    { label: '777', octal: '777', desc: '¡Peligroso! Todo',    who: 'Todos: rwx',                                  common: false },
    { label: '700', octal: '700', desc: 'Solo propietario',    who: 'Propietario: rwx · resto: ---',               common: true },
    { label: '664', octal: '664', desc: 'Grupo puede editar',  who: 'Propietario: rw- · Grupo: rw- · Otros: r--', common: false },
    { label: '444', octal: '444', desc: 'Solo lectura global', who: 'Todos: r--',                                  common: false },
    { label: '000', octal: '000', desc: 'Sin permisos',        who: 'Todos: ---',                                  common: false },
];

function octalToPerms(octal) {
    const [sStr, oStr, gStr, otStr] = octal.length === 4
        ? [octal[0], octal[1], octal[2], octal[3]]
        : ['0', octal[0]||'0', octal[1]||'0', octal[2]||'0'];
    const toBits = (n) => ({ r: !!(n & 4), w: !!(n & 2), x: !!(n & 1) });
    const sp = parseInt(sStr);
    return {
        owner: toBits(parseInt(oStr)),
        group: toBits(parseInt(gStr)),
        other: toBits(parseInt(otStr)),
        suid: !!(sp & 4), sgid: !!(sp & 2), sticky: !!(sp & 1),
    };
}

function permsToOctal(perms, special) {
    const toBit = (p) => (p.r?4:0)+(p.w?2:0)+(p.x?1:0);
    const sp = (special.suid?4:0)+(special.sgid?2:0)+(special.sticky?1:0);
    const o = toBit(perms.owner), g = toBit(perms.group), ot = toBit(perms.other);
    return sp > 0 ? `${sp}${o}${g}${ot}` : `${o}${g}${ot}`;
}

function permsToSymbolic(perms, special) {
    const s = (p, sbit, sym) => p.r?'r':'-' + (p.w?'w':'-') + (p.x ? (sbit?sym:'x') : (sbit?sym.toUpperCase():'-'));
    const o = perms.owner, g = perms.group, ot = perms.other;
    return '-'
        + (o.r?'r':'-') + (o.w?'w':'-') + (o.x?(special.suid?'s':'x'):(special.suid?'S':'-'))
        + (g.r?'r':'-') + (g.w?'w':'-') + (g.x?(special.sgid?'s':'x'):(special.sgid?'S':'-'))
        + (ot.r?'r':'-') + (ot.w?'w':'-') + (ot.x?(special.sticky?'t':'x'):(special.sticky?'T':'-'));
}

function getRiskLevel(perms, special) {
    if (special.suid || special.sgid) return { level: 'high', label: 'Riesgo Alto', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
    const others = perms.other;
    if (others.w) return { level: 'high', label: 'Riesgo Alto', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
    if (others.x) return { level: 'medium', label: 'Riesgo Medio', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { level: 'low', label: 'Seguro', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
}

export default function ChmodCalculator() {
    const navigate = useNavigate();
    const [perms, setPerms] = useState({ owner:{r:true,w:true,x:true}, group:{r:true,w:false,x:true}, other:{r:true,w:false,x:true} });
    const [special, setSpecial] = useState({ suid:false, sgid:false, sticky:false });
    const [copied, setCopied] = useState('');
    const [octalInput, setOctalInput] = useState('');

    const octal    = permsToOctal(perms, special);
    const symbolic = permsToSymbolic(perms, special);
    const cmd      = `chmod ${octal} <archivo>`;
    const cmdSym   = `chmod ${
        (special.suid?'u+s ':'') + (special.sgid?'g+s ':'') + (special.sticky?'+t ':'')
        + 'u=' + (perms.owner.r?'r':'') + (perms.owner.w?'w':'') + (perms.owner.x?'x':'')
        + ',g=' + (perms.group.r?'r':'') + (perms.group.w?'w':'') + (perms.group.x?'x':'')
        + ',o=' + (perms.other.r?'r':'') + (perms.other.w?'w':'') + (perms.other.x?'x':'')
    } <archivo>`;
    const risk = getRiskLevel(perms, special);

    const toggle = (entity, perm) => setPerms(p => ({ ...p, [entity]: { ...p[entity], [perm]: !p[entity][perm] } }));
    const toggleSpecial = (s) => setSpecial(p => ({ ...p, [s]: !p[s] }));

    const applyOctal = (val) => {
        if (/^[0-7]{3,4}$/.test(val)) {
            const p = octalToPerms(val);
            setPerms({ owner: p.owner, group: p.group, other: p.other });
            setSpecial({ suid: p.suid, sgid: p.sgid, sticky: p.sticky });
        }
    };

    const applyPreset = (octal) => {
        const p = octalToPerms(octal);
        setPerms({ owner: p.owner, group: p.group, other: p.other });
        setSpecial({ suid: p.suid, sgid: p.sgid, sticky: p.sticky });
        setOctalInput(octal);
    };

    const copy = (text, key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 1500); };

    return (
        <div className="flex min-h-screen bg-[#050507] text-white">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 overflow-y-auto h-screen custom-scrollbar">

                {/* Header */}
                <div className="relative border-b border-white/[0.05] overflow-hidden" style={{ background: 'linear-gradient(135deg,#080a05,#0a0f06,#080a04)' }}>
                    <div className="absolute inset-0 opacity-[0.10]" style={{ backgroundImage: 'linear-gradient(rgba(132,204,22,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(132,204,22,0.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                    <div className="absolute top-0 right-1/3 w-80 h-28 opacity-15 pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(132,204,22,0.8) 0%,transparent 70%)', filter: 'blur(40px)' }} />
                    <div className="relative z-10 px-8 py-6 flex items-center gap-5">
                        <button onClick={() => navigate('/tools')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest"><ChevronLeft className="w-4 h-4" /> Herramientas</button>
                        <div className="w-px h-5 bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl border border-lime-500/30 bg-lime-500/15 flex items-center justify-center"><Terminal className="w-4 h-4 text-lime-400" /></div>
                            <div>
                                <h1 className="text-base font-black uppercase tracking-tight text-white leading-none">Calculadora <span className="text-lime-400">chmod</span></h1>
                                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Permisos UNIX · Octal · Simbólico</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 max-w-5xl mx-auto space-y-8">
                    <div className="grid lg:grid-cols-2 gap-8 items-start">

                        {/* Left: Permission matrix */}
                        <div className="space-y-5">

                            {/* Octal input */}
                            <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                <div className="px-5 py-4 border-b border-white/[0.05]">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Introducir Octal Directamente</span>
                                </div>
                                <div className="p-5 flex gap-3">
                                    <input value={octalInput} onChange={e => setOctalInput(e.target.value)} onBlur={e => applyOctal(e.target.value)}
                                        placeholder="ej: 755 ó 4755"
                                        className="flex-1 bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-lg font-mono text-lime-400 outline-none focus:border-lime-500/40 transition-all" />
                                    <button onClick={() => applyOctal(octalInput)} className="px-4 py-3 bg-lime-500/15 border border-lime-500/25 rounded-xl text-lime-400 text-[10px] font-black uppercase tracking-widest hover:bg-lime-500/25 transition-all">Aplicar</button>
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Permisos por Entidad</span>
                                    <button onClick={() => { setPerms({owner:{r:false,w:false,x:false},group:{r:false,w:false,x:false},other:{r:false,w:false,x:false}}); setSpecial({suid:false,sgid:false,sticky:false}); }}
                                        className="text-slate-700 hover:text-slate-400 transition-colors flex items-center gap-1 text-[9px] font-mono"><RefreshCw className="w-3 h-3" /> Reset</button>
                                </div>
                                <div className="p-5">
                                    {/* Header row */}
                                    <div className="grid grid-cols-4 gap-3 mb-3">
                                        <div />
                                        {PERMS.map(p => (
                                            <div key={p.id} className="text-center text-[9px] font-black uppercase tracking-widest text-slate-600">{p.label}</div>
                                        ))}
                                    </div>
                                    {ENTITIES.map(({ id, label, labelEs, color }) => {
                                        const c = colorMap[color];
                                        return (
                                            <div key={id} className={`grid grid-cols-4 gap-3 mb-3 p-3 rounded-xl border ${c.border} ${c.bg}`}>
                                                <div>
                                                    <p className={`text-[10px] font-black uppercase ${c.text}`}>{labelEs}</p>
                                                    <p className="text-[8px] font-mono text-slate-700">{label}</p>
                                                </div>
                                                {PERMS.map(p => {
                                                    const active = perms[id][p.id];
                                                    return (
                                                        <button key={p.id} onClick={() => toggle(id, p.id)}
                                                            className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-[10px] font-black transition-all ${active ? c.checked + ' text-white' : 'bg-black/30 border-white/[0.06] text-slate-700 hover:text-slate-400'}`}>
                                                            <span className="font-mono text-base">{active ? p.symbol : '-'}</span>
                                                            <span className="text-[7px] uppercase tracking-widest opacity-70 mt-0.5">{p.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}

                                    {/* Special bits */}
                                    <div className="mt-4 pt-4 border-t border-white/[0.05]">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-3">Bits Especiales</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {SPECIAL.map(sp => (
                                                <button key={sp.id} onClick={() => toggleSpecial(sp.id)}
                                                    className={`p-3 rounded-xl border text-left transition-all ${special[sp.id] ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'bg-white/[0.03] border-white/[0.07] text-slate-600 hover:text-slate-300'}`}>
                                                    <p className="text-[10px] font-black uppercase">{sp.label}</p>
                                                    <p className="text-[8px] font-mono opacity-60 mt-0.5">{sp.id === 'sticky' ? '/tmp' : sp.id.toUpperCase()}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Result + info */}
                        <div className="space-y-5">

                            {/* Result display */}
                            <div className="rounded-2xl border border-lime-500/20 overflow-hidden" style={{background:'linear-gradient(160deg,#07090a,#080a07)'}}>
                                <div className="px-6 py-5 border-b border-lime-500/10">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-lime-400 mb-4">Resultado</p>
                                    <div className="flex items-center gap-4">
                                        <div className="text-6xl font-black font-mono text-lime-400">{octal}</div>
                                        <div>
                                            <p className="text-[10px] font-mono text-slate-600 mb-1">Notación simbólica:</p>
                                            <p className="text-xl font-black font-mono text-white tracking-widest">{symbolic}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 space-y-3">
                                    {/* Risk badge */}
                                    <div className={`flex items-center gap-2 p-3 rounded-xl border text-[10px] font-black ${risk.bg} ${risk.color}`}>
                                        <ShieldCheck className="w-4 h-4" />
                                        {risk.label} — {risk.level === 'high' ? 'Revisa los permisos antes de aplicar.' : risk.level === 'medium' ? 'Úsalo con precaución.' : 'Configuración segura.'}
                                    </div>

                                    {/* Commands */}
                                    {[{ label: 'Comando Octal', val: cmd, key: 'oct' }, { label: 'Comando Simbólico', val: cmdSym, key: 'sym' }].map(({ label, val, key }) => (
                                        <div key={key} className="relative">
                                            <p className="text-[9px] font-mono text-slate-700 uppercase tracking-widest mb-1.5">{label}</p>
                                            <div className="bg-black/50 border border-white/[0.07] rounded-xl p-3 pr-12">
                                                <code className="text-[11px] font-mono text-lime-400 break-all">{val}</code>
                                            </div>
                                            <button onClick={() => copy(val, key)} className={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-all ${copied===key ? 'text-emerald-400' : 'text-slate-700 hover:text-white'}`}>
                                                {copied===key ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Permission breakdown */}
                            <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                                <div className="px-5 py-4 border-b border-white/[0.05]">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Desglose Visual</span>
                                </div>
                                <div className="p-5 font-mono">
                                    <div className="text-2xl tracking-[0.3em] text-center mb-4">
                                        <span className="text-slate-600">-</span>
                                        <span className={perms.owner.r ? 'text-blue-400' : 'text-slate-700'}>r</span>
                                        <span className={perms.owner.w ? 'text-blue-400' : 'text-slate-700'}>w</span>
                                        <span className={perms.owner.x ? (special.suid?'text-red-400':'text-blue-400') : (special.suid?'text-red-700':'text-slate-700')}>{perms.owner.x?(special.suid?'s':'x'):(special.suid?'S':'-')}</span>
                                        <span className="text-slate-800 mx-1">|</span>
                                        <span className={perms.group.r ? 'text-violet-400' : 'text-slate-700'}>r</span>
                                        <span className={perms.group.w ? 'text-violet-400' : 'text-slate-700'}>w</span>
                                        <span className={perms.group.x ? (special.sgid?'text-orange-400':'text-violet-400') : (special.sgid?'text-orange-700':'text-slate-700')}>{perms.group.x?(special.sgid?'s':'x'):(special.sgid?'S':'-')}</span>
                                        <span className="text-slate-800 mx-1">|</span>
                                        <span className={perms.other.r ? 'text-amber-400' : 'text-slate-700'}>r</span>
                                        <span className={perms.other.w ? 'text-amber-400' : 'text-slate-700'}>w</span>
                                        <span className={perms.other.x ? (special.sticky?'text-cyan-400':'text-amber-400') : (special.sticky?'text-cyan-700':'text-slate-700')}>{perms.other.x?(special.sticky?'t':'x'):(special.sticky?'T':'-')}</span>
                                    </div>
                                    <div className="flex justify-center gap-6 text-[9px]">
                                        {ENTITIES.map(({id,labelEs,color}) => {
                                            const c = colorMap[color];
                                            const p = perms[id];
                                            const val = (p.r?4:0)+(p.w?2:0)+(p.x?1:0);
                                            return <span key={id} className={`${c.text} font-black`}>{labelEs}: {val}</span>;
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Special bits explanation */}
                            {(special.suid || special.sgid || special.sticky) && (
                                <div className="space-y-2">
                                    {SPECIAL.filter(s => special[s.id]).map(s => (
                                        <div key={s.id} className="p-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] text-[10px] leading-relaxed text-slate-400">
                                            <span className="text-red-400 font-black">{s.label}: </span>{s.desc}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{background:'linear-gradient(160deg,#09090f,#07070d)'}}>
                        <div className="px-6 py-4 border-b border-white/[0.05]">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Configuraciones Habituales</span>
                        </div>
                        <div className="p-5 grid md:grid-cols-4 gap-3">
                            {PRESETS.map(p => (
                                <button key={p.label} onClick={() => applyPreset(p.octal)}
                                    className={`p-4 rounded-xl border text-left transition-all hover:-translate-y-0.5 ${octal === p.octal ? 'border-lime-500/30 bg-lime-500/[0.08]' : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15]'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xl font-black font-mono ${octal===p.octal ? 'text-lime-400' : 'text-white'}`}>{p.label}</span>
                                        {!p.common && <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">Cuidado</span>}
                                    </div>
                                    <p className={`text-[10px] font-black mb-1 ${octal===p.octal ? 'text-lime-400' : 'text-slate-400'}`}>{p.desc}</p>
                                    <p className="text-[8px] font-mono text-slate-700">{p.who}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
