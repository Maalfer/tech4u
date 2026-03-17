import { useState, useMemo } from 'react';
import { ChevronLeft, Search, Shield, ShieldAlert, Globe, Database, Mail, Lock, Terminal, Wifi, Server, HelpCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// ── DATA ─────────────────────────────────────────────────────────────────────
const PORTS = [
    // WEB
    { port:20,  proto:'TCP', layer:'Aplicación', cat:'file',     name:'FTP-DATA',    desc:'FTP — transferencia de datos activa.',        secure:false, risk:'medium', exam:true  },
    { port:21,  proto:'TCP', layer:'Aplicación', cat:'file',     name:'FTP',         desc:'FTP — control de conexión. Datos en claro.',   secure:false, risk:'high',   exam:true  },
    { port:22,  proto:'TCP', layer:'Aplicación', cat:'shell',    name:'SSH',         desc:'Secure Shell. Acceso remoto cifrado.',         secure:true,  risk:'low',    exam:true  },
    { port:23,  proto:'TCP', layer:'Aplicación', cat:'shell',    name:'Telnet',      desc:'Acceso remoto sin cifrar. Obsoleto.',          secure:false, risk:'high',   exam:true  },
    { port:25,  proto:'TCP', layer:'Aplicación', cat:'mail',     name:'SMTP',        desc:'Envío de correo electrónico entre servidores.',secure:false, risk:'medium', exam:true  },
    { port:53,  proto:'TCP/UDP',layer:'Aplicación',cat:'net',   name:'DNS',         desc:'Sistema de Nombres de Dominio.',               secure:false, risk:'medium', exam:true  },
    { port:67,  proto:'UDP', layer:'Aplicación', cat:'net',     name:'DHCP Server', desc:'Servidor DHCP asigna IPs dinámicas.',          secure:false, risk:'low',    exam:true  },
    { port:68,  proto:'UDP', layer:'Aplicación', cat:'net',     name:'DHCP Client', desc:'Cliente DHCP solicita configuración IP.',      secure:false, risk:'low',    exam:true  },
    { port:69,  proto:'UDP', layer:'Aplicación', cat:'file',    name:'TFTP',        desc:'FTP trivial. Sin autenticación. Usado en PXE.',secure:false, risk:'high',   exam:false },
    { port:80,  proto:'TCP', layer:'Aplicación', cat:'web',     name:'HTTP',        desc:'Web sin cifrar. Tráfico en texto plano.',      secure:false, risk:'medium', exam:true  },
    { port:110, proto:'TCP', layer:'Aplicación', cat:'mail',    name:'POP3',        desc:'Recepción de correo. Descarga y borra.',       secure:false, risk:'medium', exam:true  },
    { port:119, proto:'TCP', layer:'Aplicación', cat:'other',   name:'NNTP',        desc:'Protocolo de noticias Usenet.',                secure:false, risk:'low',    exam:false },
    { port:123, proto:'UDP', layer:'Aplicación', cat:'net',     name:'NTP',         desc:'Sincronización de tiempo en red.',             secure:false, risk:'low',    exam:true  },
    { port:135, proto:'TCP', layer:'Aplicación', cat:'other',   name:'RPC',         desc:'Llamada a Procedimiento Remoto de Windows.',   secure:false, risk:'high',   exam:false },
    { port:137, proto:'UDP', layer:'Aplicación', cat:'net',     name:'NetBIOS-NS',  desc:'Resolución de nombres NetBIOS.',               secure:false, risk:'medium', exam:false },
    { port:139, proto:'TCP', layer:'Aplicación', cat:'file',    name:'NetBIOS-SSN', desc:'Sesiones NetBIOS sobre TCP/IP.',               secure:false, risk:'high',   exam:false },
    { port:143, proto:'TCP', layer:'Aplicación', cat:'mail',    name:'IMAP',        desc:'Acceso a correo en servidor (no descarga).',   secure:false, risk:'medium', exam:true  },
    { port:161, proto:'UDP', layer:'Aplicación', cat:'net',     name:'SNMP',        desc:'Gestión de red. Monitorización de dispositivos.',secure:false,risk:'medium', exam:true  },
    { port:194, proto:'TCP', layer:'Aplicación', cat:'other',   name:'IRC',         desc:'Internet Relay Chat.',                         secure:false, risk:'low',    exam:false },
    { port:389, proto:'TCP', layer:'Aplicación', cat:'other',   name:'LDAP',        desc:'Protocolo de Directorio Ligero (directorio AD).', secure:false, risk:'medium', exam:true },
    { port:443, proto:'TCP', layer:'Aplicación', cat:'web',     name:'HTTPS',       desc:'HTTP sobre TLS/SSL. Web cifrada.',             secure:true,  risk:'low',    exam:true  },
    { port:445, proto:'TCP', layer:'Aplicación', cat:'file',    name:'SMB',         desc:'Compartición de archivos Windows. Objetivo habitual de ransomware.', secure:false, risk:'high', exam:true },
    { port:465, proto:'TCP', layer:'Aplicación', cat:'mail',    name:'SMTPS',       desc:'SMTP sobre SSL (legacy). Ver también 587.',    secure:true,  risk:'low',    exam:false },
    { port:500, proto:'UDP', layer:'Red',        cat:'net',     name:'IKE / IPSec', desc:'Intercambio de claves para VPN IPSec.',        secure:true,  risk:'low',    exam:false },
    { port:514, proto:'UDP', layer:'Aplicación', cat:'other',   name:'Syslog',      desc:'Envío de logs del sistema a servidor remoto.', secure:false, risk:'medium', exam:false },
    { port:587, proto:'TCP', layer:'Aplicación', cat:'mail',    name:'SMTP (sub.)', desc:'SMTP autenticado para envío de correo.',       secure:true,  risk:'low',    exam:false },
    { port:636, proto:'TCP', layer:'Aplicación', cat:'other',   name:'LDAPS',       desc:'LDAP sobre SSL/TLS.',                          secure:true,  risk:'low',    exam:false },
    { port:853, proto:'TCP', layer:'Aplicación', cat:'net',     name:'DNS-over-TLS',desc:'DNS cifrado sobre TLS (DoT).',                secure:true,  risk:'low',    exam:false },
    { port:993, proto:'TCP', layer:'Aplicación', cat:'mail',    name:'IMAPS',       desc:'IMAP sobre SSL/TLS.',                          secure:true,  risk:'low',    exam:false },
    { port:995, proto:'TCP', layer:'Aplicación', cat:'mail',    name:'POP3S',       desc:'POP3 sobre SSL/TLS.',                          secure:true,  risk:'low',    exam:false },
    { port:1433,proto:'TCP', layer:'Aplicación', cat:'db',      name:'MSSQL',       desc:'Microsoft SQL Server.',                        secure:false, risk:'high',   exam:true  },
    { port:1521,proto:'TCP', layer:'Aplicación', cat:'db',      name:'Oracle DB',   desc:'Oracle Database listener.',                   secure:false, risk:'high',   exam:false },
    { port:1723,proto:'TCP', layer:'Aplicación', cat:'net',     name:'PPTP',        desc:'VPN punto a punto (protocolo viejo, inseguro).',secure:false,risk:'high',  exam:false },
    { port:2082,proto:'TCP', layer:'Aplicación', cat:'web',     name:'cPanel HTTP', desc:'Panel de control web de hosting.',             secure:false, risk:'medium', exam:false },
    { port:2083,proto:'TCP', layer:'Aplicación', cat:'web',     name:'cPanel HTTPS',desc:'cPanel sobre SSL.',                           secure:true,  risk:'low',    exam:false },
    { port:3306,proto:'TCP', layer:'Aplicación', cat:'db',      name:'MySQL/MariaDB',desc:'Base de datos MySQL y MariaDB.',              secure:false, risk:'high',   exam:true  },
    { port:3389,proto:'TCP', layer:'Aplicación', cat:'shell',   name:'RDP',         desc:'Escritorio Remoto de Windows. Vector de ataque frecuente.', secure:false, risk:'high', exam:true },
    { port:4443,proto:'TCP', layer:'Aplicación', cat:'web',     name:'HTTPS-alt',   desc:'HTTPS en puerto alternativo.',                 secure:true,  risk:'low',    exam:false },
    { port:5000,proto:'TCP', layer:'Aplicación', cat:'web',     name:'Flask Dev',   desc:'Puerto por defecto del servidor dev de Flask/Python.', secure:false, risk:'medium', exam:false },
    { port:5432,proto:'TCP', layer:'Aplicación', cat:'db',      name:'PostgreSQL',  desc:'Base de datos PostgreSQL.',                    secure:false, risk:'high',   exam:true  },
    { port:5900,proto:'TCP', layer:'Aplicación', cat:'shell',   name:'VNC',         desc:'Virtual Network Computing. Control remoto gráfico.', secure:false, risk:'high', exam:false },
    { port:6379,proto:'TCP', layer:'Aplicación', cat:'db',      name:'Redis',       desc:'Base de datos en memoria. Sin auth por defecto.',secure:false,risk:'high',  exam:false },
    { port:8080,proto:'TCP', layer:'Aplicación', cat:'web',     name:'HTTP-alt',    desc:'HTTP en puerto alternativo. Proxies y servidores dev.', secure:false, risk:'medium', exam:true },
    { port:8443,proto:'TCP', layer:'Aplicación', cat:'web',     name:'HTTPS-alt',   desc:'HTTPS en puerto alternativo.',                 secure:true,  risk:'low',    exam:false },
    { port:8888,proto:'TCP', layer:'Aplicación', cat:'web',     name:'Jupyter',     desc:'Jupyter Notebook. Interfaz web Python.',       secure:false, risk:'medium', exam:false },
    { port:9200,proto:'TCP', layer:'Aplicación', cat:'db',      name:'Elasticsearch',desc:'Motor de búsqueda distribuido.',              secure:false, risk:'high',   exam:false },
    { port:27017,proto:'TCP',layer:'Aplicación', cat:'db',      name:'MongoDB',     desc:'Base de datos NoSQL orientada a documentos.',  secure:false, risk:'high',   exam:true  },
];

const CATS = [
    { id: 'all',   label: 'Todos',     Icon: Globe   },
    { id: 'web',   label: 'Web',       Icon: Globe   },
    { id: 'mail',  label: 'Correo',    Icon: Mail    },
    { id: 'shell', label: 'Acceso',    Icon: Terminal},
    { id: 'db',    label: 'Bases de Datos', Icon: Database },
    { id: 'file',  label: 'Archivos',  Icon: Server  },
    { id: 'net',   label: 'Red',       Icon: Wifi    },
    { id: 'other', label: 'Otros',     Icon: HelpCircle },
];

const RISK_STYLE = {
    low:    { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Bajo' },
    medium: { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',    label: 'Medio' },
    high:   { text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',        label: 'Alto' },
};

export default function PortReference() {
    const navigate = useNavigate();
    const [search, setSearch]     = useState('');
    const [cat, setCat]           = useState('all');
    const [onlyExam, setOnlyExam] = useState(false);
    const [onlySecure, setOnlySecure] = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [favorites, setFavorites] = useState(new Set([80, 443, 22, 3306, 53]));

    const toggleFav = (port) => setFavorites(prev => { const s=new Set(prev); s.has(port)?s.delete(port):s.add(port); return s; });

    const filtered = useMemo(() => PORTS.filter(p => {
        const q = search.toLowerCase();
        if (onlyExam && !p.exam) return false;
        if (onlySecure && !p.secure) return false;
        if (cat !== 'all' && p.cat !== cat) return false;
        if (!q) return true;
        return p.port.toString().includes(q) || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.proto.toLowerCase().includes(q);
    }), [search, cat, onlyExam, onlySecure]);

    return (
        <div className="flex min-h-screen bg-[#050507] text-white">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 overflow-y-auto h-screen custom-scrollbar">

                {/* Header */}
                <div className="relative border-b border-white/[0.05] overflow-hidden" style={{ background: 'linear-gradient(135deg,#050b0d,#060e10,#040b0d)' }}>
                    <div className="absolute inset-0 opacity-[0.10]" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                    <div className="absolute top-0 left-1/3 w-80 h-28 opacity-15 pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(6,182,212,0.8) 0%,transparent 70%)', filter: 'blur(40px)' }} />
                    <div className="relative z-10 px-8 py-6 flex items-center gap-5">
                        <button onClick={() => navigate('/tools')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest"><ChevronLeft className="w-4 h-4" /> Herramientas</button>
                        <div className="w-px h-5 bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl border border-cyan-500/30 bg-cyan-500/15 flex items-center justify-center"><Shield className="w-4 h-4 text-cyan-400" /></div>
                            <div>
                                <h1 className="text-base font-black uppercase tracking-tight text-white leading-none">Puertos <span className="text-cyan-400">&amp; Protocolos</span></h1>
                                <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">{PORTS.length} puertos · TCP/UDP · Referencia de red</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">

                    {/* Search + filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por puerto, nombre o protocolo..."
                                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-sm font-mono outline-none focus:border-cyan-500/40 transition-all placeholder-slate-700" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setOnlyExam(v => !v)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${onlyExam ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-white/[0.03] border-white/[0.07] text-slate-500 hover:text-white'}`}>
                                <Star className="w-3 h-3" /> Examen
                            </button>
                            <button onClick={() => setOnlySecure(v => !v)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${onlySecure ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-white/[0.03] border-white/[0.07] text-slate-500 hover:text-white'}`}>
                                <Lock className="w-3 h-3" /> Seguros
                            </button>
                        </div>
                    </div>

                    {/* Category pills */}
                    <div className="flex flex-wrap gap-2">
                        {CATS.map(({ id, label, Icon }) => (
                            <button key={id} onClick={() => setCat(id)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${cat===id ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' : 'bg-white/[0.03] border-white/[0.07] text-slate-600 hover:text-slate-300'}`}>
                                <Icon className="w-3 h-3" /> {label}
                                {id !== 'all' && <span className="opacity-50">({PORTS.filter(p=>p.cat===id).length})</span>}
                            </button>
                        ))}
                    </div>

                    {/* Stats strip */}
                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-700">
                        <span>{filtered.length} puerto{filtered.length!==1?'s':''} mostrados</span>
                        <span>·</span>
                        <span className="text-emerald-700">{filtered.filter(p=>p.secure).length} seguros</span>
                        <span>·</span>
                        <span className="text-red-700">{filtered.filter(p=>p.risk==='high').length} riesgo alto</span>
                        <span>·</span>
                        <span className="text-amber-700">{filtered.filter(p=>p.exam).length} en examen</span>
                    </div>

                    {/* Port table */}
                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
                        <table className="w-full font-mono">
                            <thead>
                                <tr style={{background:'rgba(255,255,255,0.02)'}} className="border-b border-white/[0.05]">
                                    {['★','Puerto','Protocolo','Nombre','Descripción','Seguro','Riesgo'].map(h => (
                                        <th key={h} className="px-4 py-3.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-600 text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p, i) => {
                                    const risk = RISK_STYLE[p.risk];
                                    const isFav = favorites.has(p.port);
                                    const isExp = expanded === p.port;
                                    return (
                                        <>
                                            <tr key={p.port} onClick={() => setExpanded(isExp ? null : p.port)}
                                                className={`border-b border-white/[0.03] cursor-pointer transition-colors ${isExp ? 'bg-cyan-500/[0.04]' : 'hover:bg-white/[0.02]'}`}>
                                                <td className="px-4 py-3">
                                                    <button onClick={e => { e.stopPropagation(); toggleFav(p.port); }}
                                                        className={`transition-colors ${isFav ? 'text-amber-400' : 'text-slate-800 hover:text-slate-500'}`}>
                                                        <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-cyan-400 font-black text-sm">{p.port}</span>
                                                    {p.exam && <span className="ml-1.5 text-[7px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/20 font-black uppercase">exam</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] text-slate-500 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">{p.proto}</span>
                                                </td>
                                                <td className="px-4 py-3 text-[11px] font-black text-white">{p.name}</td>
                                                <td className="px-4 py-3 text-[10px] text-slate-500 max-w-xs truncate">{p.desc}</td>
                                                <td className="px-4 py-3">
                                                    {p.secure
                                                        ? <span className="flex items-center gap-1 text-[9px] text-emerald-400"><Lock className="w-3 h-3" /> Sí</span>
                                                        : <span className="flex items-center gap-1 text-[9px] text-red-400/70"><ShieldAlert className="w-3 h-3" /> No</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${risk.bg} ${risk.text}`}>{risk.label}</span>
                                                </td>
                                            </tr>
                                            {isExp && (
                                                <tr key={`exp-${p.port}`} className="bg-cyan-500/[0.03]">
                                                    <td colSpan={7} className="px-8 py-5">
                                                        <div className="grid md:grid-cols-3 gap-6">
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">Descripción Completa</p>
                                                                <p className="text-[11px] text-slate-300 leading-relaxed">{p.desc}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">Detalles Técnicos</p>
                                                                <div className="space-y-1.5 text-[10px] font-mono">
                                                                    <p><span className="text-slate-600">Puerto:</span> <span className="text-cyan-400 font-black">{p.port}</span></p>
                                                                    <p><span className="text-slate-600">Protocolo:</span> <span className="text-white">{p.proto}</span></p>
                                                                    <p><span className="text-slate-600">Capa OSI:</span> <span className="text-white">{p.layer}</span></p>
                                                                    <p><span className="text-slate-600">Categoría:</span> <span className="text-white capitalize">{p.cat}</span></p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">Seguridad</p>
                                                                <div className={`p-3 rounded-xl border text-[10px] leading-relaxed ${risk.bg} ${risk.text}`}>
                                                                    {p.risk === 'high' && '⚠ Riesgo alto. ' + (p.secure ? 'Usa siempre con autenticación robusta.' : 'Evita exponer a internet. Usa firewall.')}
                                                                    {p.risk === 'medium' && 'Riesgo moderado. Monitoriza el tráfico y aplica restricciones de acceso.'}
                                                                    {p.risk === 'low' && p.secure ? '✓ Protocolo seguro con cifrado.' : '✓ Bajo riesgo en redes internas.'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="py-16 text-center text-slate-700 font-mono text-sm">No se encontraron puertos para "{search}"</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
