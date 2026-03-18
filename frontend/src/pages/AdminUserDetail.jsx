import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Shield, Zap, Flame, Crown, Key, User as UserIcon,
    Mail, Calendar, CreditCard, Star, BarChart2, ShieldCheck,
    Save, AlertTriangle, Trash2, RefreshCw, Clock, CheckCircle,
    XCircle, TrendingUp, Lock, ChevronDown, Info, Loader2
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

import marcoImg from '../assets/marco_pj.png';
import pj1  from '../assets/pj_lvl_1.png';
import pj2  from '../assets/pj_lvl_2.png';
import pj3  from '../assets/pj_lvl_3.png';
import pj4  from '../assets/pj_lvl_4.png';
import pj5  from '../assets/pj_lvl_5.png';
import pj6  from '../assets/pj_lvl_6.png';
import pj7  from '../assets/pj_lvl_7.png';
import pj8  from '../assets/pj_lvl_8.png';
import pj9  from '../assets/pj_lvl_9.png';
import pj10 from '../assets/pj_lvl_10.png';
import pj11 from '../assets/pj_lvl_11.png';
import pj12 from '../assets/pj_lvl_12.png';
import pj13 from '../assets/pj_lvl_13.png';
import pj14 from '../assets/pj_lvl_14.png';
import pj15 from '../assets/pj_lvl_15.png';
import pj16 from '../assets/pj_lvl_16.png';
import pj17 from '../assets/pj_lvl_17.png';
import pj18 from '../assets/pj_lvl_18.png';
import pj19 from '../assets/pj_lvl_19.png';
import pj20 from '../assets/pj_lvl_20.png';

const PJ_ASSETS = {
    1: pj1, 2: pj2, 3: pj3, 4: pj4, 5: pj5,
    6: pj6, 7: pj7, 8: pj8, 9: pj9, 10: pj10,
    11: pj11, 12: pj12, 13: pj13, 14: pj14, 15: pj15,
    16: pj16, 17: pj17, 18: pj18, 19: pj19, 20: pj20,
};

const RANK_MAP = {
    1: '🥉 Estudiante ASIR', 2: '🥉 Estudiante ASIR', 3: '🥉 Estudiante ASIR', 4: '🥉 Estudiante ASIR',
    5: '🥈 Informático Nerd', 6: '🥈 Informático Nerd', 7: '🥈 Informático Nerd', 8: '🥈 Informático Nerd', 9: '🥈 Informático Nerd',
    10: '🥇 Técnico Junior', 11: '🥇 Técnico Junior', 12: '🥇 Técnico Junior', 13: '🥇 Técnico Junior', 14: '🥇 Técnico Junior',
    15: '⚔️ Técnico L3', 16: '⚔️ Técnico L3', 17: '⚔️ Técnico L3',
    18: '🛡️ Admin Senior', 19: '🛡️ Admin Senior',
    20: '👑 SysAdmin Dios',
};

const SUB_LABELS = {
    free:      { label: 'Gratuito',   color: 'text-slate-400',   border: 'border-slate-700',   bg: 'bg-slate-900/30' },
    monthly:   { label: 'Mensual',    color: 'text-sky-400',     border: 'border-sky-700',     bg: 'bg-sky-900/20'  },
    quarterly: { label: 'Trimestral', color: 'text-violet-400',  border: 'border-violet-700',  bg: 'bg-violet-900/20' },
    annual:    { label: 'Anual',      color: 'text-emerald-400', border: 'border-emerald-700', bg: 'bg-emerald-900/20' },
    lifetime:  { label: 'Vitalicio',  color: 'text-yellow-400',  border: 'border-yellow-600',  bg: 'bg-yellow-900/20' },
};

const ROLE_META = {
    alumno:    { label: 'Alumno',        color: 'text-slate-400',  border: 'border-slate-600',   bg: 'bg-slate-800/40',   desc: 'Acceso estándar a cursos' },
    docente:   { label: 'Docente',       color: 'text-blue-400',   border: 'border-blue-600/50', bg: 'bg-blue-900/20',    desc: 'Gestión de contenido' },
    developer: { label: 'Developer',     color: 'text-amber-400',  border: 'border-amber-600/50',bg: 'bg-amber-900/20',   desc: 'Acceso técnico avanzado' },
    admin:     { label: 'Administrador', color: 'text-red-400',    border: 'border-red-600/50',  bg: 'bg-red-900/20',     desc: 'Control total de la academia' },
};

const SECTIONS = [
    { id: 'identidad',   label: 'Identidad',       icon: UserIcon },
    { id: 'suscripcion', label: 'Suscripción',      icon: CreditCard },
    { id: 'rol',         label: 'Rol de Acceso',    icon: Crown },
    { id: 'rpg',         label: 'RPG & Gamif.',     icon: Zap },
    { id: 'seguridad',   label: 'Seguridad',        icon: Lock },
    { id: 'referidos',   label: 'Referidos',        icon: TrendingUp },
    { id: 'peligrosa',   label: 'Zona Peligrosa',   icon: AlertTriangle, danger: true },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) => d ? new Date(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const errMsg = (err) => err?.response?.data?.detail || err?.message || 'Error desconocido. Revisa la consola.';

// ── Sub-components ────────────────────────────────────────────────────────────

function Toast({ toasts }) {
    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl pointer-events-auto text-sm font-mono font-bold animate-[fadeInRight_0.2s_ease] transition-all
                    ${t.type === 'success' ? 'bg-neon/10 border-neon/40 text-neon' : 'bg-red-950/80 border-red-500/40 text-red-300'}`}>
                    {t.type === 'success'
                        ? <CheckCircle className="w-4 h-4 shrink-0" />
                        : <XCircle className="w-4 h-4 shrink-0" />}
                    <span>{t.msg}</span>
                </div>
            ))}
        </div>
    );
}

function ConfirmModal({ modal, onClose }) {
    if (!modal) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto ${modal.danger ? 'bg-red-500/10 border border-red-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                    <AlertTriangle className={`w-7 h-7 ${modal.danger ? 'text-red-400' : 'text-yellow-400'}`} />
                </div>
                <h3 className="text-lg font-black text-white text-center mb-2 uppercase tracking-tight">{modal.title}</h3>
                <p className="text-sm font-mono text-slate-400 text-center mb-8">{modal.message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-black uppercase hover:bg-white/10 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => { modal.onConfirm(); onClose(); }}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${modal.danger
                            ? 'bg-red-600/80 hover:bg-red-600 text-white border border-red-500/50'
                            : 'bg-neon/80 hover:bg-neon text-black border border-neon/50'}`}
                    >
                        {modal.confirmLabel || 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SectionCard({ title, icon: Icon, iconColor = 'text-neon', onSave, saving, children, danger = false }) {
    return (
        <div className={`rounded-2xl border p-6 relative ${danger ? 'border-red-800/30 bg-red-950/10' : 'border-white/5 bg-black/20 backdrop-blur-sm'}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${danger ? 'bg-red-500/10 border-red-500/25' : 'bg-white/5 border-white/10'}`}>
                        <Icon className={`w-4 h-4 ${danger ? 'text-red-400' : iconColor}`} />
                    </div>
                    <h3 className={`font-black text-sm uppercase tracking-widest ${danger ? 'text-red-400' : 'text-white'}`}>{title}</h3>
                </div>
                {onSave && (
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-neon/10 text-neon border border-neon/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neon hover:text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {saving
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Save className="w-3 h-3" />}
                        {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}

const Field = ({ label, children }) => (
    <div>
        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
        {children}
    </div>
);

const inputCls = "w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-all placeholder:text-slate-700";
const selectCls = "w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-neon/50 transition-all cursor-pointer appearance-none";

function InfoChip({ label, value, color = 'text-slate-300' }) {
    return (
        <div className="p-3 rounded-xl bg-black/30 border border-white/5 min-w-0">
            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-xs font-mono font-bold truncate ${color}`}>{value}</p>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminUserDetail() {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('identidad');

    // Editable fields (each isolated)
    const [nombre, setNombre]     = useState('');
    const [email, setEmail]       = useState('');
    const [role, setRole]         = useState('alumno');
    const [subType, setSubType]   = useState('free');
    const [xpTotal, setXpTotal]   = useState(0);
    const [shields, setShields]   = useState(0);
    const [streak, setStreak]     = useState(0);
    const [newPass, setNewPass]   = useState('');
    const [showPass, setShowPass] = useState(false);

    // Per-section saving state
    const [saving, setSaving] = useState({});
    const setSec = (sec, val) => setSaving(s => ({ ...s, [sec]: val }));

    // Toasts
    const [toasts, setToasts]     = useState([]);
    const timerRefs               = useRef([]);
    const toast = (msg, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(t => [...t, { id, msg, type }]);
        const tid = setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
        timerRefs.current.push(tid);
    };
    useEffect(() => () => timerRefs.current.forEach(clearTimeout), []);

    // Confirm modal
    const [confirmModal, setConfirmModal] = useState(null);
    const confirm = (title, message, onConfirm, danger = true, confirmLabel = 'Confirmar') =>
        setConfirmModal({ title, message, onConfirm, danger, confirmLabel });

    // ── Data fetch ──
    const fetchUser = async () => {
        try {
            const { data: u } = await api.get(`/admin/users/${id}/full`);
            setUserData(u);
            setNombre(u.nombre      ?? '');
            setEmail(u.email        ?? '');
            setRole(u.role          ?? 'alumno');
            setSubType(u.subscription_type ?? 'free');
            setXpTotal(u.xp         ?? 0);
            setShields(u.streak_protections ?? 0);
            setStreak(u.streak_count ?? 0);
        } catch (err) {
            toast(errMsg(err), 'error');
            if (import.meta.env.DEV) console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchUser(); }, [id]);

    // ── Save handlers ──
    const saveProfile = async () => {
        setSec('profile', true);
        try {
            await api.put(`/admin/users/${id}/profile`, { nombre, email });
            toast('✅ Perfil actualizado correctamente');
            fetchUser();
        } catch (err) { toast(errMsg(err), 'error'); }
        finally { setSec('profile', false); }
    };

    const saveRole = async () => {
        setSec('role', true);
        try {
            await api.put(`/admin/users/${id}/role`, { role });
            toast('✅ Rol actualizado correctamente');
            fetchUser();
        } catch (err) { toast(errMsg(err), 'error'); }
        finally { setSec('role', false); }
    };

    const saveSubscription = async () => {
        setSec('sub', true);
        try {
            await api.patch(`/admin/users/${id}/subscription`, { subscription_type: subType });
            toast('✅ Suscripción actualizada correctamente');
            fetchUser();
        } catch (err) { toast(errMsg(err), 'error'); }
        finally { setSec('sub', false); }
    };

    const saveXP = async () => {
        setSec('xp', true);
        try {
            await api.patch(`/admin/users/${id}/xp`, { xp: parseInt(xpTotal, 10) || 0 });
            toast('✅ XP y nivel recalculados');
            fetchUser();
        } catch (err) { toast(errMsg(err), 'error'); }
        finally { setSec('xp', false); }
    };

    const saveShields = async () => {
        setSec('shields', true);
        try {
            await api.patch(`/admin/users/${id}/shields`, { shields: parseInt(shields, 10) || 0 });
            toast('✅ Escudos actualizados');
            fetchUser();
        } catch (err) { toast(errMsg(err), 'error'); }
        finally { setSec('shields', false); }
    };

    const saveStreak = async () => {
        setSec('streak', true);
        try {
            await api.patch(`/admin/users/${id}/streak`, { streak: parseInt(streak, 10) || 0 });
            toast('✅ Racha actualizada');
            fetchUser();
        } catch (err) { toast(errMsg(err), 'error'); }
        finally { setSec('streak', false); }
    };

    const resetPassword = async () => {
        if (!newPass.trim()) { toast('Introduce una contraseña válida', 'error'); return; }
        confirm(
            'Restablecer contraseña',
            `Se cambiará la contraseña de ${userData?.nombre} y se invalidarán todas sus sesiones activas.`,
            async () => {
                setSec('pass', true);
                try {
                    await api.put(`/admin/users/${id}/password`, { password: newPass });
                    toast('✅ Contraseña restablecida y sesiones invalidadas');
                    setNewPass('');
                } catch (err) { toast(errMsg(err), 'error'); }
                finally { setSec('pass', false); }
            },
            true, 'Restablecer'
        );
    };

    const resetReferrals = async () => {
        confirm(
            'Limpiar recompensas',
            `Se eliminarán todos los cupones acumulados y meses gratuitos de ${userData?.nombre}.`,
            async () => {
                setSec('ref', true);
                try {
                    await api.patch(`/admin/users/${id}/reset-referrals`);
                    toast('✅ Recompensas de referido reseteadas');
                    fetchUser();
                } catch (err) { toast(errMsg(err), 'error'); }
                finally { setSec('ref', false); }
            }
        );
    };

    const deleteUser = () => {
        confirm(
            '⚠️ Eliminar usuario',
            `Esta acción es IRREVERSIBLE. El usuario "${userData?.nombre}" y todos sus datos serán eliminados permanentemente.`,
            async () => {
                try {
                    await api.delete(`/admin/users/${id}`);
                    toast('✅ Usuario eliminado');
                    setTimeout(() => navigate('/gestion-usuarios'), 800);
                } catch (err) { toast(errMsg(err), 'error'); }
            },
            true, '🗑️ Eliminar permanentemente'
        );
    };

    // ── Derived ──
    const rank    = RANK_MAP[userData?.level ?? 1] ?? RANK_MAP[1];
    const subMeta = SUB_LABELS[userData?.subscription_type] ?? SUB_LABELS.free;
    const roleMeta= ROLE_META[userData?.role ?? 'alumno'] ?? ROLE_META.alumno;

    // ── Loading ──
    if (loading) return (
        <div className="flex h-screen bg-[#050505] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono text-slate-600 uppercase tracking-widest">Cargando expediente...</p>
            </div>
        </div>
    );

    // ── Sections content ──
    const renderSection = () => {
        switch (activeSection) {

            // ── IDENTIDAD ─────────────────────────────────────────────────
            case 'identidad': return (
                <SectionCard
                    title="Identidad"
                    icon={UserIcon}
                    iconColor="text-violet-400"
                    onSave={saveProfile}
                    saving={saving.profile}
                >
                    <div className="space-y-4">
                        <Field label="Nombre completo">
                            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className={inputCls} placeholder="Nombre completo..." />
                        </Field>
                        <Field label="Email">
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="email@tech4u.es" />
                        </Field>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <InfoChip label="Último acceso" value={fmtDate(userData?.last_login)} />
                            <InfoChip label="Meses suscritos" value={`${userData?.months_subscribed ?? 0} meses`} color="text-neon" />
                            <InfoChip label="Registro" value={fmtDateShort(userData?.created_at)} />
                            <InfoChip label="ID de usuario" value={`#${userData?.id}`} color="text-slate-500" />
                        </div>
                    </div>
                </SectionCard>
            );

            // ── SUSCRIPCIÓN ───────────────────────────────────────────────
            case 'suscripcion': return (
                <SectionCard
                    title="Suscripción"
                    icon={CreditCard}
                    iconColor="text-emerald-400"
                    onSave={currentUser?.role === 'admin' ? saveSubscription : undefined}
                    saving={saving.sub}
                >
                    <div className="space-y-5">
                        <Field label="Plan de suscripción">
                            <div className="relative">
                                <select
                                    value={subType}
                                    onChange={e => setSubType(e.target.value)}
                                    className={selectCls}
                                    disabled={currentUser?.role !== 'admin'}
                                >
                                    <option value="free">🆓 Gratuito</option>
                                    <option value="monthly">📅 Mensual</option>
                                    <option value="quarterly">📆 Trimestral</option>
                                    <option value="annual">🗓️ Anual</option>
                                    <option value="lifetime">♾️ Vitalicio</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            </div>
                        </Field>

                        {/* Plan badge row */}
                        <div className={`flex items-center gap-3 p-4 rounded-xl border ${subMeta.border} ${subMeta.bg}`}>
                            <CreditCard className={`w-5 h-5 ${subMeta.color} shrink-0`} />
                            <div>
                                <p className={`text-sm font-black ${subMeta.color}`}>{subMeta.label}</p>
                                <p className="text-[10px] font-mono text-slate-500">Plan actualmente asignado</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <InfoChip
                                label="Inicio de suscripción"
                                value={fmtDateShort(userData?.subscription_start)}
                                color="text-emerald-400"
                            />
                            <InfoChip
                                label="Vencimiento"
                                value={
                                    userData?.subscription_type === 'lifetime'
                                        ? '♾️ Nunca'
                                        : fmtDateShort(userData?.subscription_end)
                                }
                                color={userData?.subscription_type === 'lifetime' ? 'text-yellow-400' : 'text-orange-400'}
                            />
                        </div>
                        {currentUser?.role !== 'admin' && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-900/20 border border-yellow-700/30">
                                <Info className="w-4 h-4 text-yellow-400 shrink-0" />
                                <p className="text-[10px] font-mono text-yellow-400">Solo los administradores pueden cambiar el plan.</p>
                            </div>
                        )}
                    </div>
                </SectionCard>
            );

            // ── ROL ────────────────────────────────────────────────────────
            case 'rol': return (
                <SectionCard
                    title="Rol de Acceso"
                    icon={Crown}
                    iconColor="text-yellow-400"
                    onSave={currentUser?.role === 'admin' ? saveRole : undefined}
                    saving={saving.role}
                >
                    <div className="space-y-5">
                        <Field label="Nivel de acceso">
                            <div className="relative">
                                <select
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    className={selectCls}
                                    disabled={currentUser?.role !== 'admin'}
                                >
                                    <option value="alumno">🎓 Alumno</option>
                                    <option value="docente">📘 Docente</option>
                                    <option value="developer">🛠️ Developer</option>
                                    <option value="admin">🔴 Administrador</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            </div>
                        </Field>

                        {/* Role cards */}
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(ROLE_META).map(([r, m]) => (
                                <button
                                    key={r}
                                    onClick={() => currentUser?.role === 'admin' && setRole(r)}
                                    className={`p-3 rounded-xl border text-left transition-all ${role === r
                                        ? `${m.border} ${m.bg} ${m.color}`
                                        : 'border-white/5 bg-black/20 text-slate-600 hover:border-white/10'}`}
                                >
                                    <p className="text-[10px] font-black uppercase">{m.label}</p>
                                    <p className="text-[9px] font-mono mt-0.5 opacity-70">{m.desc}</p>
                                </button>
                            ))}
                        </div>

                        {currentUser?.role !== 'admin' && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-900/20 border border-yellow-700/30">
                                <Info className="w-4 h-4 text-yellow-400 shrink-0" />
                                <p className="text-[10px] font-mono text-yellow-400">Solo los administradores pueden cambiar el rol.</p>
                            </div>
                        )}
                    </div>
                </SectionCard>
            );

            // ── RPG ────────────────────────────────────────────────────────
            case 'rpg': return (
                <div className="space-y-5">
                    {/* XP */}
                    <SectionCard
                        title="Experiencia & Nivel"
                        icon={Zap}
                        iconColor="text-neon"
                        onSave={saveXP}
                        saving={saving.xp}
                    >
                        <div className="space-y-4">
                            <Field label="XP Total acumulado">
                                <input
                                    type="number"
                                    min="0"
                                    value={xpTotal}
                                    onChange={e => setXpTotal(e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                            <div className="p-4 rounded-xl border border-neon/20 bg-neon/5">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-mono font-bold text-neon">Lv. {userData?.level ?? 1}</span>
                                    <span className="text-[10px] font-mono text-slate-400">{rank}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                                    <div
                                        className="bg-neon h-1.5 rounded-full transition-all"
                                        style={{ width: `${Math.min(((userData?.xp ?? 0) / 800) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[9px] font-mono text-slate-600 mt-1.5">{userData?.xp ?? 0} XP en nivel actual — nivel se recalcula al guardar</p>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Racha */}
                    <SectionCard
                        title="Racha Diaria"
                        icon={Flame}
                        iconColor="text-orange-400"
                        onSave={saveStreak}
                        saving={saving.streak}
                    >
                        <div className="space-y-4">
                            <Field label="Días de racha consecutivos">
                                <input
                                    type="number"
                                    min="0"
                                    value={streak}
                                    onChange={e => setStreak(e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-900/10 border border-orange-800/30">
                                <Flame className="w-6 h-6 text-orange-400 shrink-0" />
                                <div>
                                    <p className="text-lg font-black font-mono text-orange-400">{userData?.streak_count ?? 0} días</p>
                                    <p className="text-[9px] font-mono text-slate-600">Racha activa actual del usuario</p>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Escudos */}
                    <SectionCard
                        title="Escudos de Protección"
                        icon={Shield}
                        iconColor="text-sky-400"
                        onSave={saveShields}
                        saving={saving.shields}
                    >
                        <div className="space-y-4">
                            <Field label="Número de escudos activos (máx 10)">
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={shields}
                                    onChange={e => setShields(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                                    className={inputCls}
                                />
                            </Field>
                            <div className="flex items-center gap-2 flex-wrap p-4 rounded-xl bg-sky-900/10 border border-sky-800/30">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setShields(i + 1)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Shield className={`w-6 h-6 transition-all ${i < (parseInt(shields) || 0)
                                            ? 'text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]'
                                            : 'text-slate-700'}`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-auto text-xs font-mono font-bold text-sky-400">{shields} / 10</span>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            );

            // ── SEGURIDAD ─────────────────────────────────────────────────
            case 'seguridad': return (
                <SectionCard
                    title="Seguridad & Acceso"
                    icon={Lock}
                    iconColor="text-red-400"
                >
                    <div className="space-y-5">
                        {currentUser?.role === 'admin' ? (
                            <>
                                <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/30">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black text-red-400 uppercase mb-1">Atención</p>
                                            <p className="text-[11px] font-mono text-slate-400">
                                                Al restablecer la contraseña se invalidarán automáticamente todas las sesiones activas del usuario (token_version++).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Field label="Nueva contraseña">
                                    <div className="relative">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={newPass}
                                            onChange={e => setNewPass(e.target.value)}
                                            className={inputCls + ' pr-12'}
                                            placeholder="Mínimo 8 caracteres..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(s => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showPass ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </Field>
                                <button
                                    onClick={resetPassword}
                                    disabled={saving.pass || !newPass.trim()}
                                    className="w-full py-3.5 bg-red-700/70 hover:bg-red-700 text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-red-600/50"
                                >
                                    {saving.pass
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : <Key className="w-3.5 h-3.5" />}
                                    {saving.pass ? 'Procesando...' : 'Restablecer contraseña'}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-900/20 border border-yellow-700/30">
                                <Lock className="w-5 h-5 text-yellow-400 shrink-0" />
                                <p className="text-xs font-mono text-yellow-400">Solo los administradores pueden restablecer contraseñas.</p>
                            </div>
                        )}
                    </div>
                </SectionCard>
            );

            // ── REFERIDOS ─────────────────────────────────────────────────
            case 'referidos': return (
                <SectionCard
                    title="Referidos & Recompensas"
                    icon={TrendingUp}
                    iconColor="text-indigo-400"
                >
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            <InfoChip label="Código de referido" value={userData?.referral_code || 'No generado'} color="text-indigo-400" />
                            <InfoChip label="Total invitados" value={`${userData?.referral_reward_count ?? 0} usuarios`} color="text-white" />
                            <InfoChip label="Cupones 10% pendientes" value={`${userData?.pending_10p_discounts ?? 0}`} color="text-neon" />
                            <InfoChip label="Meses gratis acumulados" value={`${userData?.free_months_accumulated ?? 0}`} color="text-orange-400" />
                        </div>

                        {/* Risk indicator */}
                        {(userData?.pending_10p_discounts > 10 || userData?.referral_reward_count > 20) && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/20 border border-red-800/30">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-red-400 uppercase">Actividad sospechosa detectada</p>
                                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                        {userData?.pending_10p_discounts > 10 && 'Más de 10 cupones acumulados. '}
                                        {userData?.referral_reward_count > 20 && 'Volumen de referidos inusualmente alto.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={resetReferrals}
                            disabled={saving.ref}
                            className="w-full py-3 bg-white/5 border border-red-800/30 hover:bg-red-900/20 hover:border-red-700/50 text-red-400 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40"
                        >
                            {saving.ref ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            Limpiar recompensas acumuladas
                        </button>
                    </div>
                </SectionCard>
            );

            // ── ZONA PELIGROSA ────────────────────────────────────────────
            case 'peligrosa': return (
                <SectionCard
                    title="Zona Peligrosa"
                    icon={AlertTriangle}
                    danger
                >
                    <div className="space-y-4">
                        <p className="text-xs font-mono text-slate-500 leading-relaxed">
                            Las acciones de esta sección son <span className="text-red-400 font-bold">permanentes e irreversibles</span>.
                            Actúa con máxima precaución. Todas las acciones quedan registradas en logs del sistema.
                        </p>
                        <div className="space-y-3">
                            {currentUser?.role === 'admin' ? (
                                <button
                                    onClick={deleteUser}
                                    className="w-full py-4 bg-red-900/30 hover:bg-red-900/60 border border-red-800/50 hover:border-red-700 text-red-400 hover:text-red-300 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all group"
                                >
                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Eliminar usuario permanentemente
                                </button>
                            ) : (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-900/20 border border-yellow-700/30">
                                    <Lock className="w-5 h-5 text-yellow-400 shrink-0" />
                                    <p className="text-xs font-mono text-yellow-400">Solo los administradores pueden eliminar usuarios.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </SectionCard>
            );

            default: return null;
        }
    };

    // ── Render ──
    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            {/* Ambient glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[5%] right-[10%]  w-[600px] h-[600px] bg-neon/3   blur-[180px] rounded-full" />
                <div className="absolute bottom-[5%] left-[20%] w-[400px] h-[400px] bg-blue-500/4 blur-[140px] rounded-full" />
            </div>

            {/* Global toast system */}
            <Toast toasts={toasts} />

            {/* Confirmation modal */}
            <ConfirmModal modal={confirmModal} onClose={() => setConfirmModal(null)} />

            <Sidebar />

            <main className="flex-1 ml-0 md:ml-64 min-h-screen flex flex-col">

                {/* ── Top bar ── */}
                <div className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/gestion-usuarios')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 text-xs font-mono font-bold transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-black uppercase tracking-widest text-white truncate">
                            {userData?.nombre}
                            <span className="text-slate-600 ml-2 font-mono text-xs">[#{userData?.id}]</span>
                        </h1>
                        <p className="text-[10px] font-mono text-slate-600">{userData?.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${roleMeta.border} ${roleMeta.bg} ${roleMeta.color}`}>
                            {roleMeta.label}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${subMeta.border} ${subMeta.bg} ${subMeta.color}`}>
                            {subMeta.label}
                        </span>
                    </div>
                </div>

                <div className="flex flex-1 gap-0">

                    {/* ── Left nav (section selector) ── */}
                    <div className="w-56 shrink-0 border-r border-white/5 bg-black/20 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto p-4 flex flex-col gap-1">

                        {/* Mini avatar */}
                        <div className="flex flex-col items-center gap-2 pb-4 mb-2 border-b border-white/5">
                            <div className="relative w-16 h-16">
                                <img src={marcoImg} alt="frame" className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none" />
                                <div className="absolute inset-0 flex items-center justify-center p-2">
                                    <img src={PJ_ASSETS[userData?.level ?? 1] ?? pj1} alt="avatar" className="w-full h-full object-contain z-10" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] font-black font-mono text-neon uppercase">Lv. {userData?.level ?? 1}</p>
                                <p className="text-[8px] font-mono text-slate-600">{rank}</p>
                            </div>
                            {/* Quick stats */}
                            <div className="flex gap-2 w-full">
                                <div className="flex-1 text-center p-1.5 rounded-lg bg-black/30 border border-white/5">
                                    <Zap className="w-3 h-3 text-neon mx-auto mb-0.5" />
                                    <p className="text-[9px] font-black font-mono text-white">{(userData?.xp ?? 0).toLocaleString()}</p>
                                    <p className="text-[7px] font-mono text-slate-700">XP</p>
                                </div>
                                <div className="flex-1 text-center p-1.5 rounded-lg bg-black/30 border border-white/5">
                                    <Flame className="w-3 h-3 text-orange-400 mx-auto mb-0.5" />
                                    <p className="text-[9px] font-black font-mono text-white">{userData?.streak_count ?? 0}</p>
                                    <p className="text-[7px] font-mono text-slate-700">Racha</p>
                                </div>
                                <div className="flex-1 text-center p-1.5 rounded-lg bg-black/30 border border-white/5">
                                    <Shield className="w-3 h-3 text-sky-400 mx-auto mb-0.5" />
                                    <p className="text-[9px] font-black font-mono text-white">{userData?.streak_protections ?? 0}</p>
                                    <p className="text-[7px] font-mono text-slate-700">Escudos</p>
                                </div>
                            </div>
                        </div>

                        {/* Nav items */}
                        {SECTIONS.map(({ id, label, icon: Icon, danger }) => (
                            <button
                                key={id}
                                onClick={() => setActiveSection(id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all
                                    ${activeSection === id
                                        ? danger
                                            ? 'bg-red-900/30 border border-red-700/40 text-red-400'
                                            : 'bg-neon/10 border border-neon/25 text-neon'
                                        : danger
                                            ? 'text-red-600 hover:text-red-400 hover:bg-red-900/20 border border-transparent'
                                            : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span className="text-[10px]">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Right content ── */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-2xl">
                            {renderSection()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
