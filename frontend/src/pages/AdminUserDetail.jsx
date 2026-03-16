import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Shield, Zap, Flame, Crown, Key, User as UserIcon,
    Mail, Calendar, CreditCard, Star, BarChart2, ShieldCheck,
    Save, AlertTriangle, Trash2, RefreshCw, ChevronRight, Clock,
    TrendingUp, Layers
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

import marcoImg from '../assets/marco_pj.png';
import pj1 from '../assets/pj_lvl_1.png';
import pj2 from '../assets/pj_lvl_2.png';
import pj3 from '../assets/pj_lvl_3.png';
import pj4 from '../assets/pj_lvl_4.png';
import pj5 from '../assets/pj_lvl_5.png';
import pj6 from '../assets/pj_lvl_6.png';
import pj7 from '../assets/pj_lvl_7.png';
import pj8 from '../assets/pj_lvl_8.png';
import pj9 from '../assets/pj_lvl_9.png';
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
    16: pj16, 17: pj17, 18: pj18, 19: pj19, 20: pj20
};

const RANK_MAP = {
    1: '🥉 Estudiante ASIR', 2: '🥉 Estudiante ASIR', 3: '🥉 Estudiante ASIR', 4: '🥉 Estudiante ASIR',
    5: '🥈 Informático Nerd', 6: '🥈 Informático Nerd', 7: '🥈 Informático Nerd', 8: '🥈 Informático Nerd', 9: '🥈 Informático Nerd',
    10: '🥇 Técnico Junior', 11: '🥇 Técnico Junior', 12: '🥇 Técnico Junior', 13: '🥇 Técnico Junior', 14: '🥇 Técnico Junior',
    15: '⚔️ Técnico L3', 16: '⚔️ Técnico L3', 17: '⚔️ Técnico L3',
    18: '🛡️ Admin Senior', 19: '🛡️ Admin Senior',
    20: '👑 SysAdmin Dios',
};

const LEAGUE_COLORS = {
    '🥉 Estudiante ASIR': { border: 'border-slate-600', bg: 'bg-slate-900/40', text: 'text-slate-300' },
    '🥈 Informático Nerd': { border: 'border-blue-600', bg: 'bg-blue-900/20', text: 'text-blue-300' },
    '🥇 Técnico Junior': { border: 'border-yellow-600', bg: 'bg-yellow-900/20', text: 'text-yellow-400' },
    '⚔️ Técnico L3': { border: 'border-orange-600', bg: 'bg-orange-900/20', text: 'text-orange-400' },
    '🛡️ Admin Senior': { border: 'border-purple-600', bg: 'bg-purple-900/20', text: 'text-purple-400' },
    '👑 SysAdmin Dios': { border: 'border-yellow-400', bg: 'bg-gradient-to-br from-yellow-900/40 to-amber-900/40', text: 'text-yellow-200' },
};

const inputClass = "w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-neon/50 transition-all placeholder:text-slate-700";
const selectClass = "w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-neon/50 transition-all cursor-pointer";

const UserCard = ({ title, icon, color = 'neon', children, onSave, danger = false, saving = false }) => (
    <div className={`rounded-2xl border p-6 ${danger ? 'border-red-800/40 bg-red-950/10' : 'border-white/5 bg-black/20'} relative`}>
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${danger ? 'bg-red-500/10 border border-red-500/30' : `bg-${color}-500/10 border border-${color}-500/30`}`}>
                    {icon}
                </div>
                <h3 className={`font-black text-sm uppercase tracking-widest ${danger ? 'text-red-400' : 'text-white'}`}>{title}</h3>
            </div>
            {onSave && (
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-neon/10 text-neon border border-neon/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neon hover:text-black transition-all disabled:opacity-50"
                >
                    <Save className="w-3 h-3" /> Guardar
                </button>
            )}
        </div>
        {children}
    </div>
);

const UserField = ({ label, children }) => (
    <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">{label}</label>
        {children}
    </div>
);

export default function AdminUserDetail() {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editable fields
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('alumno');
    const [subType, setSubType] = useState('free');
    const [xp, setXp] = useState(0);
    const [shields, setShields] = useState(0);
    const [streak, setStreak] = useState(0);
    const [newPass, setNewPass] = useState('');

    const fetchUser = async () => {
        try {
            const res = await api.get(`/admin/users/${id}/full`);
            const u = res.data;
            setUserData(u);
            setNombre(u.nombre);
            setEmail(u.email);
            setRole(u.role);
            setSubType(u.subscription_type);
            setXp(u.xp);
            setShields(u.streak_protections);
            setStreak(u.streak_count);
        } catch (err) {
            if (import.meta.env.DEV) console.error(err);
            alert('Error al cargar usuario');
            navigate('/admin-users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUser(); }, [id]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await api.put(`/admin/users/${id}/profile`, { nombre, email });
            alert('✅ Perfil actualizado');
            fetchUser();
        } catch (err) { alert('Error: ' + (err.response?.data?.detail || '')); }
        finally { setSaving(false); }
    };

    const handleSaveRole = async () => {
        setSaving(true);
        try {
            await api.put(`/admin/users/${id}/role`, { role });
            alert('✅ Rol actualizado');
            fetchUser();
        } catch (err) { alert('Error: ' + (err.response?.data?.detail || '')); }
        finally { setSaving(false); }
    };

    const handleSaveSubscription = async () => {
        setSaving(true);
        try {
            await api.patch(`/admin/users/${id}/subscription`, { subscription_type: subType });
            alert('✅ Suscripción actualizada');
            fetchUser();
        } catch (err) { alert('Error: ' + (err.response?.data?.detail || '')); }
        finally { setSaving(false); }
    };

    const handleSaveXP = async () => {
        setSaving(true);
        try {
            await api.patch(`/admin/users/${id}/xp`, { xp: parseInt(xp, 10) });
            alert('✅ XP actualizado');
            fetchUser();
        } catch (err) { alert('Error: ' + (err.response?.data?.detail || '')); }
        finally { setSaving(false); }
    };

    const handleSaveShields = async () => {
        setSaving(true);
        try {
            await api.patch(`/admin/users/${id}/shields`, { shields: parseInt(shields, 10) });
            alert('✅ Escudos actualizados');
            fetchUser();
        } catch (err) { alert('Error: ' + (err.response?.data?.detail || '')); }
        finally { setSaving(false); }
    };

    const handleSaveStreak = async () => {
        setSaving(true);
        try {
            await api.patch(`/admin/users/${id}/streak`, { streak: parseInt(streak, 10) });
            alert('✅ Racha actualizada');
            fetchUser();
        } catch (err) { alert('Error: ' + (err.response?.data?.detail || '')); }
        finally { setSaving(false); }
    };

    const handleResetPassword = async () => {
        if (!newPass.trim()) return alert('Introduce una contraseña');
        if (!confirm('¿Seguro que quieres restablecer la contraseña?')) return;
        setSaving(true);
        try {
            await api.put(`/admin/users/${id}/password`, { password: newPass });
            alert('✅ Contraseña restablecida');
            setNewPass('');
        } catch (err) { alert('Error: ' + (err.response?.data?.detail || '')); }
        finally { setSaving(false); }
    };

    const handleDeleteUser = async () => {
        if (!confirm(`⚠️ ¿Seguro que quieres ELIMINAR permanentemente a ${userData?.nombre}? Esta acción no se puede deshacer.`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            alert('Usuario eliminado');
            navigate('/admin-users');
        } catch (err) { alert('Error: ' + (err.response?.data?.detail || '')); }
    };

    if (loading) return (
        <div className="flex h-screen bg-[#050505] items-center justify-center">
            <div className="w-10 h-10 border-4 border-neon border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const rank = RANK_MAP[userData?.level] || RANK_MAP[1];
    const lc = LEAGUE_COLORS[rank] || LEAGUE_COLORS['🥉 Estudiante ASIR'];

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-neon selection:text-black">
            {/* Ambient */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-neon/4 blur-[150px] rounded-full" />
                <div className="absolute bottom-[10%] left-[25%] w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full" />
            </div>

            <Sidebar />

            <main className="flex-1 ml-60 min-h-screen">
                <PageHeader
                    title={<>{userData?.nombre} <span className="text-white/40">[{userData?.id}]</span></>}
                    subtitle="Gestión de usuario y expediente académico Tech4U"
                    Icon={ShieldCheck}
                    gradient="from-white via-blue-100 to-blue-500"
                    iconColor="text-blue-400"
                    iconBg="bg-blue-600/20"
                    iconBorder="border-blue-500/30"
                    glowColor="bg-blue-600/20"
                >
                    <button onClick={() => navigate('/admin-users')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-2xl backdrop-blur-xl">
                        <ArrowLeft className="w-4 h-4" /> Volver a Lista
                    </button>
                </PageHeader>

                <div className="px-10 py-8 max-w-6xl mx-auto">

                    {/* ── User Overview Banner ── */}
                    <div className={`rounded-2xl border ${lc.border} ${lc.bg} p-6 mb-8 flex items-center gap-6 relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-40 h-40 opacity-5 pointer-events-none flex items-center justify-center">
                            <span className="text-[80px]">{rank.split(' ')[0]}</span>
                        </div>
                        <div className="relative w-24 h-24 shrink-0 group">
                            <div className="absolute -inset-2 bg-white/5 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            {/* Frame */}
                            <img
                                src={marcoImg}
                                alt="Frame"
                                className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                            />
                            {/* PJ Avatar */}
                            <div className="absolute inset-0 flex items-center justify-center p-2.5">
                                <img
                                    src={PJ_ASSETS[userData?.level] || pj1}
                                    alt="User Character"
                                    className="w-full h-full object-contain z-10 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110"
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className={`text-2xl font-black uppercase tracking-tighter ${lc.text}`}>{userData?.nombre}</h2>
                            <p className="text-xs font-mono text-slate-500">{userData?.email}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded border ${userData?.role === 'admin' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                                    userData?.role === 'developer' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' :
                                        userData?.role === 'docente' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                                            'border-slate-700 text-slate-400 bg-slate-800/50'
                                    } uppercase`}>{userData?.role}</span>
                                <span className={`text-[10px] font-mono ${lc.text}`}>{rank}</span>
                                <span className="text-[10px] font-mono text-slate-600">Lv. {userData?.level}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 shrink-0">
                            <div className="text-center p-3 rounded-xl bg-black/30 border border-white/5">
                                <Zap className="w-4 h-4 text-neon mx-auto mb-1" />
                                <p className="text-lg font-black font-mono text-white">{userData?.xp?.toLocaleString()}</p>
                                <p className="text-[8px] font-mono text-slate-600 uppercase">XP</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-black/30 border border-white/5">
                                <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                                <p className="text-lg font-black font-mono text-white">{userData?.streak_count}</p>
                                <p className="text-[8px] font-mono text-slate-600 uppercase">Racha</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-black/30 border border-white/5">
                                <Shield className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                                <p className="text-lg font-black font-mono text-white">{userData?.streak_protections}</p>
                                <p className="text-[8px] font-mono text-slate-600 uppercase">Escudos</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Grid de cartas ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Perfil */}
                        <UserCard saving={saving} title="Identidad" icon={<UserIcon className="w-4 h-4 text-violet-400" />} color="violet" onSave={handleSaveProfile}>
                            <div className="space-y-4">
                                <UserField label="Nombre completo">
                                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className={inputClass} />
                                </UserField>
                                <UserField label="Email">
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                                </UserField>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                        <p className="text-[9px] font-mono text-slate-600 uppercase">Último login</p>
                                        <p className="text-xs font-mono text-slate-300 mt-0.5">
                                            {userData?.last_login ? new Date(userData.last_login).toLocaleString() : 'Nunca'}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                        <p className="text-[9px] font-mono text-slate-600 uppercase">Meses suscritos</p>
                                        <p className="text-xs font-mono text-slate-300 mt-0.5">{userData?.months_subscribed || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </UserCard>

                        {/* Rol */}
                        <UserCard saving={saving} title="Rol de Acceso" icon={<Crown className="w-4 h-4 text-yellow-400" />} color="yellow" onSave={currentUser?.role === 'admin' ? handleSaveRole : null}>
                            <UserField label="Nivel de acceso">
                                <select
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    className={selectClass}
                                    disabled={currentUser?.role !== 'admin'}
                                >
                                    <option value="alumno">🎓 Alumno</option>
                                    <option value="docente">📘 Docente</option>
                                    <option value="developer">🛠️ Developer</option>
                                    <option value="admin">🔴 Administrador</option>
                                </select>
                            </UserField>
                            <div className="mt-4 p-3 rounded-xl border border-white/5 bg-black/20">
                                <div className="flex gap-3">
                                    {[
                                        { r: 'alumno', c: 'border-slate-700 text-slate-400', desc: 'Acceso estándar' },
                                        { r: 'docente', c: 'border-blue-500/50 text-blue-400', desc: 'Gestión contenido' },
                                        { r: 'developer', c: 'border-amber-500/50 text-amber-400', desc: 'Técnico Senior' },
                                        { r: 'admin', c: 'border-red-500/50 text-red-400', desc: 'Control total' },
                                    ].map(({ r, c, desc }) => (
                                        <div key={r} className={`flex-1 text-center p-2 rounded-lg border ${role === r ? c + ' bg-white/5' : 'border-transparent text-slate-700'} transition-all`}>
                                            <p className="text-[10px] font-black uppercase">{r}</p>
                                            <p className="text-[8px] font-mono mt-0.5">{desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </UserCard>

                        {/* Suscripción */}
                        <UserCard saving={saving} title="Suscripción" icon={<CreditCard className="w-4 h-4 text-emerald-400" />} color="emerald" onSave={currentUser?.role === 'admin' ? handleSaveSubscription : null}>
                            <div className="space-y-4">
                                <UserField label="Plan de suscripción">
                                    <select
                                        value={subType}
                                        onChange={e => setSubType(e.target.value)}
                                        className={selectClass}
                                        disabled={currentUser?.role !== 'admin'}
                                    >
                                        <option value="free">🆓 Gratuito</option>
                                        <option value="monthly">📅 Mensual</option>
                                        <option value="quarterly">📆 Trimestral</option>
                                        <option value="annual">📅 Anual</option>
                                        <option value="lifetime">♾️ Vitalicio</option>
                                    </select>
                                </UserField>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                        <p className="text-[9px] font-mono text-slate-600 uppercase">Inicio</p>
                                        <p className="text-xs font-mono text-emerald-400 mt-0.5">
                                            {userData?.subscription_start ? new Date(userData.subscription_start).toLocaleDateString('es-ES') : '—'}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                        <p className="text-[9px] font-mono text-slate-600 uppercase">Vencimiento</p>
                                        <p className="text-xs font-mono text-orange-400 mt-0.5">
                                            {userData?.subscription_type === 'lifetime' ? '♾️ Infinito' : userData?.subscription_end ? new Date(userData.subscription_end).toLocaleDateString('es-ES') : '—'}
                                        </p>
                                    </div>
                                </div>
                                {userData?.stripe_subscription_id && (
                                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                        <p className="text-[9px] font-mono text-slate-600 uppercase">Stripe ID</p>
                                        <p className="text-[10px] font-mono text-slate-400 mt-0.5 break-all">{userData.stripe_subscription_id}</p>
                                    </div>
                                )}
                            </div>
                        </UserCard>

                        {/* XP y Nivel */}
                        <UserCard saving={saving} title="XP y Nivel" icon={<Zap className="w-4 h-4 text-neon" />} color="neon" onSave={handleSaveXP}>
                            <div className="space-y-4">
                                <UserField label="Experiencia total (XP)">
                                    <input type="number" min="0" value={xp} onChange={e => setXp(e.target.value)} className={inputClass} />
                                </UserField>
                                <div className="p-4 rounded-xl border border-neon/20 bg-neon/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-mono text-neon font-bold">Nivel calculado: Lv.{userData?.level}</span>
                                        <span className={`text-xs font-mono ${lc.text}`}>{rank}</span>
                                    </div>
                                    <p className="text-[10px] font-mono text-slate-500">El nivel se recalcula automáticamente al guardar el XP según la tabla de umbrales.</p>
                                </div>
                            </div>
                        </UserCard>

                        {/* Racha */}
                        <UserCard saving={saving} title="Racha Diaria" icon={<Flame className="w-4 h-4 text-orange-400" />} color="orange" onSave={handleSaveStreak}>
                            <div className="space-y-4">
                                <UserField label="Días de racha consecutivos">
                                    <input type="number" min="0" value={streak} onChange={e => setStreak(e.target.value)} className={inputClass} />
                                </UserField>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/5">
                                    <Flame className="w-5 h-5 text-orange-400" />
                                    <div>
                                        <p className="text-sm font-black font-mono text-orange-400">{userData?.streak_count} Días</p>
                                        <p className="text-[9px] font-mono text-slate-600">Racha actual del usuario</p>
                                    </div>
                                </div>
                            </div>
                        </UserCard>

                        {/* Escudos */}
                        <UserCard saving={saving} title="Escudos de Protección" icon={<ShieldCheck className="w-4 h-4 text-sky-400" />} color="sky" onSave={handleSaveShields}>
                            <div className="space-y-4">
                                <UserField label="Número de escudos">
                                    <input type="number" min="0" max="10" value={shields} onChange={e => setShields(e.target.value)} className={inputClass} />
                                </UserField>
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-black/30 border border-white/5">
                                    {Array.from({ length: Math.max(parseInt(shields) || 0, 4) }).map((_, i) => {
                                        const has = i < (parseInt(shields) || 0);
                                        return (
                                            <Shield
                                                key={i}
                                                className={`w-7 h-7 transition-all ${has
                                                    ? 'text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]'
                                                    : 'text-slate-700'
                                                    }`}
                                            />
                                        );
                                    })}
                                    <span className="ml-2 text-xs font-mono font-bold text-sky-400">{shields} activos</span>
                                </div>
                            </div>
                        </UserCard>

                        {/* Contraseña */}
                        {currentUser?.role === 'admin' && (
                            <UserCard saving={saving} title="Restablecer Contraseña" icon={<Key className="w-4 h-4 text-red-400" />} color="red">
                                <div className="space-y-4">
                                    <UserField label="Nueva contraseña">
                                        <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className={inputClass} placeholder="Introduce la nueva contraseña..." />
                                    </UserField>
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={saving || !newPass.trim()}
                                        className="w-full py-3 bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Key className="w-3.5 h-3.5" /> Ejecutar Reset de Contraseña
                                    </button>
                                </div>
                            </UserCard>
                        )}

                        {/* Referidos */}
                        <UserCard saving={saving} title="Referidos y Premios" icon={<TrendingUp className="w-4 h-4 text-indigo-400" />} color="indigo">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                        <p className="text-[9px] font-mono text-slate-600 uppercase">Código</p>
                                        <p className="text-xs font-mono text-indigo-400 mt-0.5">{userData?.referral_code || '—'}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                        <p className="text-[9px] font-mono text-slate-600 uppercase">Total Invitados</p>
                                        <p className="text-xs font-mono text-white mt-0.5">{userData?.referral_reward_count || 0}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                        <p className="text-[9px] font-mono text-slate-600 uppercase">Descuentos 10%</p>
                                        <p className="text-xs font-mono text-neon mt-0.5">{userData?.pending_10p_discounts || 0}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                        <p className="text-[9px] font-mono text-slate-600 uppercase">Meses Gratis</p>
                                        <p className="text-xs font-mono text-orange-400 mt-0.5">{userData?.free_months_accumulated || 0}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (confirm("¿Resetear todos los premios acumulados?")) {
                                            await api.patch(`/admin/users/${id}/reset-referrals`);
                                            fetchUser();
                                        }
                                    }}
                                    className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-red-400 transition-all"
                                >
                                    Limpiar Recompensas
                                </button>
                            </div>
                        </UserCard>

                        {/* Zona peligrosa */}
                        {currentUser?.role === 'admin' && (
                            <UserCard saving={saving} title="Zona Peligrosa" icon={<AlertTriangle className="w-4 h-4 text-red-400" />} danger>
                                <p className="text-xs font-mono text-slate-500 mb-4">
                                    Estas acciones son irreversibles. Asegúrate de lo que estás haciendo antes de proceder.
                                </p>
                                <button
                                    onClick={handleDeleteUser}
                                    className="w-full py-3 bg-red-900/40 border border-red-800/50 hover:bg-red-800/60 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar usuario permanentemente
                                </button>
                            </UserCard>
                        )}
                    </div>

                    <div className="h-16" />
                </div>
            </main>
        </div>
    );
}
