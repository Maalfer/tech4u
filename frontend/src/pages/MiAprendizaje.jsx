import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useUserStore from '../store/userStore';
import {
  BookOpen, Play, CheckCircle2, Clock, Trophy,
  FlaskConical, Target, ChevronRight, Zap, Flame,
  TrendingUp, Award, BarChart2, Shield, Lock,
  Circle, ArrowRight, Layers, ArrowLeft
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────────────────────────────────────

function timeAgo(isoDate) {
  if (!isoDate) return null;
  const diff = (Date.now() - new Date(isoDate)) / 1000;
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;
  return new Date(isoDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

const XP_PER_LEVEL = 500;
function xpToNextLevel(xp) {
  const currentLevelXp = xp % XP_PER_LEVEL;
  return { current: currentLevelXp, needed: XP_PER_LEVEL, pct: Math.round((currentLevelXp / XP_PER_LEVEL) * 100) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Micro components
// ─────────────────────────────────────────────────────────────────────────────

function Bar({ pct, color = 'bg-lime-500', height = 'h-1.5', rounded = 'rounded-full' }) {
  return (
    <div className={`w-full ${height} bg-white/5 ${rounded} overflow-hidden`}>
      <div
        className={`${height} ${color} ${rounded} transition-all duration-700`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function Tag({ children, color = 'bg-slate-800 text-slate-400' }) {
  return (
    <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-md ${color}`}>
      {children}
    </span>
  );
}

function AccuracyDot({ acc }) {
  if (acc >= 80) return <span className="text-emerald-400 font-bold font-mono">{acc}%</span>;
  if (acc >= 60) return <span className="text-yellow-400 font-bold font-mono">{acc}%</span>;
  return <span className="text-red-400 font-bold font-mono">{acc}%</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero Stats (top bar)
// ─────────────────────────────────────────────────────────────────────────────

function HeroStats({ stats }) {
  const xpInfo = xpToNextLevel(stats.xp);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

      {/* XP + Level */}
      <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-lime-500/10 to-lime-400/5 border border-lime-500/20 rounded-2xl p-4 flex flex-col justify-between gap-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-lime-400/70 font-mono uppercase tracking-widest">Nivel</p>
            <p className="text-4xl font-black text-white mt-0.5">{stats.level}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-lime-500/15 flex items-center justify-center">
            <Zap size={18} className="text-lime-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 font-mono">{xpInfo.current} / {xpInfo.needed} XP</span>
            <span className="text-[10px] text-lime-400 font-mono">{stats.xp.toLocaleString()} total</span>
          </div>
          <Bar pct={xpInfo.pct} color="bg-gradient-to-r from-lime-500 to-lime-300" />
        </div>
      </div>

      {/* Racha */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 flex flex-col justify-between gap-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Racha</p>
            <p className="text-3xl font-black text-white mt-0.5">{stats.streak}<span className="text-base font-normal text-slate-500 ml-1">días</span></p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-lime-500/10 flex items-center justify-center">
            <Flame size={18} className={stats.streak > 0 ? 'text-lime-400' : 'text-slate-600'} />
          </div>
        </div>
        <p className="text-[10px] text-slate-600 font-mono">
          {stats.streak > 7 ? '🔥 ¡Racha impresionante!' : stats.streak > 0 ? 'Sigue así cada día' : 'Empieza hoy'}
        </p>
      </div>

      {/* Tests */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 flex flex-col justify-between gap-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Tests</p>
            <p className="text-3xl font-black text-white mt-0.5">{stats.total_tests}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <Target size={18} className="text-sky-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 font-mono">precisión media</span>
            <AccuracyDot acc={stats.avg_accuracy} />
          </div>
          <Bar pct={stats.avg_accuracy} color={stats.avg_accuracy >= 80 ? 'bg-emerald-500' : stats.avg_accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'} />
        </div>
      </div>

      {/* Labs */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 flex flex-col justify-between gap-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Labs</p>
            <p className="text-3xl font-black text-white mt-0.5">
              {stats.labs_completed}
              <span className="text-base font-normal text-slate-500 ml-1">/ {stats.total_labs}</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FlaskConical size={18} className="text-emerald-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 font-mono">completados</span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {stats.total_labs > 0 ? Math.round((stats.labs_completed / stats.total_labs) * 100) : 0}%
            </span>
          </div>
          <Bar pct={stats.total_labs > 0 ? (stats.labs_completed / stats.total_labs) * 100 : 0} color="bg-emerald-500" />
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Course Card — large horizontal
// ─────────────────────────────────────────────────────────────────────────────

function CourseCard({ course, isShop = false }) {
  const link = isShop
    ? `/watch/${course.id}`
    : course.slug ? `/certificacion/${course.slug}` : `/video-courses/${course.id}`;

  const pct = course.progress_pct;
  const isNew = !course.started;
  const isDone = course.completed;

  const barColor = isDone
    ? 'bg-emerald-500'
    : pct >= 50
      ? 'bg-gradient-to-r from-lime-500 to-lime-300'
      : 'bg-lime-500';

  return (
    <Link to={link} className="group block bg-[#111827] border border-white/5 hover:border-lime-500/25 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-lime-500/5">

      {/* Top accent bar */}
      <div className={`h-0.5 w-full ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-lime-500 to-transparent'}`} />

      <div className="p-5">
        <div className="flex items-start gap-4">

          {/* Icon */}
          <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center ${isDone ? 'bg-emerald-500/15' : isShop ? 'bg-sky-500/15' : 'bg-lime-500/15'}`}>
            {isDone
              ? <CheckCircle2 size={20} className="text-emerald-400" />
              : isShop
                ? <BookOpen size={20} className="text-sky-400" />
                : <Shield size={20} className="text-lime-400" />
            }
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                {isShop && <Tag color="bg-sky-500/10 text-sky-400">Comprado</Tag>}
                {!isShop && !isDone && <Tag color="bg-lime-500/10 text-lime-400">Suscripción</Tag>}
                {isDone && <Tag color="bg-emerald-500/10 text-emerald-400">✓ Completado</Tag>}
              </div>
              <ChevronRight size={15} className="text-slate-700 group-hover:text-lime-400 transition-colors mt-0.5 flex-shrink-0" />
            </div>
            <h3 className="text-sm font-semibold text-white mt-1.5 group-hover:text-lime-200 transition-colors leading-snug">{course.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {course.completed_lessons} / {course.total_lessons} clases
              {course.quiz_count > 0 && ` · ${course.quiz_count} quizzes`}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-600 font-mono">Progreso</span>
            <span className={`text-[11px] font-bold font-mono ${isDone ? 'text-emerald-400' : pct > 0 ? 'text-lime-400' : 'text-slate-600'}`}>{pct}%</span>
          </div>
          <Bar pct={pct} color={barColor} height="h-2" />
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          {course.last_accessed
            ? <span className="text-[10px] text-slate-600 flex items-center gap-1"><Clock size={9} />{timeAgo(course.last_accessed)}</span>
            : <span className="text-[10px] text-slate-600">Sin actividad</span>
          }
          {isNew && (
            <span className="text-[10px] font-mono text-lime-400 flex items-center gap-1">
              <Play size={9} /> Empezar
            </span>
          )}
          {!isNew && !isDone && (
            <span className="text-[10px] font-mono text-lime-400 flex items-center gap-1">
              <ArrowRight size={9} /> Continuar
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill Path Card
// ─────────────────────────────────────────────────────────────────────────────

function PathCard({ path }) {
  const pct = path.progress_pct;
  const diffMap = {
    easy: { label: 'Fácil', color: 'text-emerald-400 bg-emerald-500/10' },
    medium: { label: 'Medio', color: 'text-yellow-400 bg-yellow-500/10' },
    hard: { label: 'Difícil', color: 'text-red-400 bg-red-500/10' },
  };
  const diff = diffMap[path.difficulty] || diffMap.medium;

  return (
    <Link to="/labs" className="group bg-[#111827] border border-white/5 hover:border-sky-500/25 rounded-2xl p-4 transition-all duration-200 block">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
          <Layers size={16} className="text-sky-400" />
        </div>
        <Tag color={diff.color}>{diff.label}</Tag>
      </div>
      <h3 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors leading-snug mb-3">{path.title}</h3>
      <Bar pct={pct} color="bg-sky-500" />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-slate-600 font-mono">{path.completed_labs} / {path.total_labs} labs</span>
        <span className={`text-[10px] font-mono font-bold ${pct > 0 ? 'text-sky-400' : 'text-slate-600'}`}>{pct}%</span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests Table
// ─────────────────────────────────────────────────────────────────────────────

const SUBJECT_MAP = {
  redes: { label: 'Redes', color: 'bg-blue-500/10 text-blue-400' },
  linux: { label: 'Linux', color: 'bg-emerald-500/10 text-emerald-400' },
  seguridad: { label: 'Seguridad', color: 'bg-red-500/10 text-red-400' },
  ciberseguridad: { label: 'Ciberseguridad', color: 'bg-red-500/10 text-red-400' },
  sql: { label: 'SQL', color: 'bg-purple-500/10 text-purple-400' },
  asir: { label: 'ASIR', color: 'bg-yellow-500/10 text-yellow-400' },
};

function subjectTag(subject) {
  const key = (subject || '').toLowerCase();
  const match = Object.keys(SUBJECT_MAP).find(k => key.includes(k));
  const { label, color } = match ? SUBJECT_MAP[match] : { label: subject || '—', color: 'bg-slate-700 text-slate-400' };
  return <Tag color={color}>{label}</Tag>;
}

const MODE_LABEL = { study: 'Estudio', practice: 'Práctica', exam: 'Examen', mixed: 'Mixto' };

function TestsPanel({ tests }) {
  if (!tests.length) return (
    <div className="py-10 text-center">
      <Target size={28} className="text-slate-700 mx-auto mb-2" />
      <p className="text-sm text-slate-600">Aún no has hecho ningún test</p>
      <Link to="/tests" className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 mt-2 transition-colors">
        Ir a Test Center <ArrowRight size={12} />
      </Link>
    </div>
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-[10px] text-slate-600 font-mono uppercase py-2 px-3">Materia</th>
              <th className="text-left text-[10px] text-slate-600 font-mono uppercase py-2 px-3 hidden sm:table-cell">Modo</th>
              <th className="text-center text-[10px] text-slate-600 font-mono uppercase py-2 px-3">Precisión</th>
              <th className="text-center text-[10px] text-slate-600 font-mono uppercase py-2 px-3 hidden md:table-cell">Correctas</th>
              <th className="text-right text-[10px] text-slate-600 font-mono uppercase py-2 px-3 hidden sm:table-cell">XP</th>
              <th className="text-right text-[10px] text-slate-600 font-mono uppercase py-2 px-3">Cuando</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {tests.map(t => {
              const acc = t.accuracy ?? 0;
              return (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3">{subjectTag(t.subject)}</td>
                  <td className="py-2.5 px-3 hidden sm:table-cell text-slate-500 font-mono">{MODE_LABEL[t.mode] || t.mode}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`font-bold font-mono ${acc >= 80 ? 'text-emerald-400' : acc >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {acc}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-500 font-mono hidden md:table-cell">{t.correct}/{t.total}</td>
                  <td className="py-2.5 px-3 text-right hidden sm:table-cell">
                    <span className="text-yellow-400 font-mono">+{t.xp_gained}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 font-mono">{timeAgo(t.completed_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-white/5 pt-3 px-3">
        <Link to="/test-stats" className="text-[10px] text-slate-500 hover:text-lime-400 transition-colors flex items-center gap-1.5 font-mono">
          Ver estadísticas completas <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, label, color = 'text-slate-500', href, hrefLabel }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon size={13} className={color} />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 font-mono">{label}</span>
      </div>
      {href && (
        <Link to={href} className="text-[10px] text-slate-600 hover:text-lime-400 transition-colors flex items-center gap-1 font-mono">
          {hrefLabel} <ArrowRight size={10} />
        </Link>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-[#111827] border border-white/5 flex items-center justify-center">
          <BookOpen size={32} className="text-lime-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-lime-500 flex items-center justify-center">
          <span className="text-black text-xs font-bold">0</span>
        </div>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">Tu camino empieza aquí</h3>
      <p className="text-slate-500 text-sm max-w-xs mb-8 leading-relaxed">
        Explora la academia, completa labs o realiza tu primer test para ver tu progreso aquí.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/explora" className="inline-flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
          <BookOpen size={14} /> Explorar Cursos
        </Link>
        <Link to="/labs" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors border border-white/10">
          <FlaskConical size={14} /> Skill Labs
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

export default function MiAprendizaje() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('cursos'); // cursos | paths | tests
  const user = useUserStore(s => s.user);

  useEffect(() => {
    api.get('/auth/learning-summary')
      .then(r => setData(r.data))
      .catch(() => setError('No se pudo cargar el resumen.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-800 border-t-lime-500 rounded-full animate-spin" />
        <p className="text-[11px] text-slate-600 font-mono">Cargando tu progreso...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <p className="text-slate-500 text-sm">{error}</p>
    </div>
  );

  const { stats, subscription_courses, shop_courses, recent_tests, skill_paths } = data;
  const allCourses = [...subscription_courses, ...shop_courses];
  const isEmpty = allCourses.length === 0 && recent_tests.length === 0 && skill_paths.length === 0;

  const activeCourses = allCourses.filter(c => c.started && !c.completed);
  const notStarted = allCourses.filter(c => !c.started);
  const completedCourses = allCourses.filter(c => c.completed);

  const TABS = [
    { id: 'cursos', label: 'Cursos', count: allCourses.length, icon: BookOpen },
    { id: 'paths', label: 'Skill Paths', count: skill_paths.length, icon: Layers },
    { id: 'tests', label: 'Historial Tests', count: recent_tests.length, icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D]">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.04]">

        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-lime-400/3 rounded-full blur-2xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(rgba(163,230,53,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-9">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 mb-6 text-slate-500 hover:text-white transition-colors duration-200"
          >
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 flex items-center justify-center transition-all group-hover:bg-white/8">
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-mono">Volver</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            {/* Left — title + description */}
            <div className="max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/20 rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                <span className="text-[11px] font-mono text-lime-400 uppercase tracking-widest">
                  {user?.nombre || 'Alumno'} · Nivel {stats.level}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                Tu centro de<br />
                <span className="text-lime-400">progreso</span>
              </h1>

              <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-md">
                Aquí tienes una visión completa de todo lo que has hecho y lo que te queda por delante.
                Cursos, certificaciones, labs, tests — todo en un único sitio.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mt-5">
                {[
                  { icon: Shield, label: 'Certificaciones' },
                  { icon: FlaskConical, label: 'Skill Labs' },
                  { icon: Target, label: 'Tests' },
                  { icon: TrendingUp, label: 'Estadísticas' },
                  { icon: Award, label: 'Logros' },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1">
                    <Icon size={11} className="text-lime-400/70" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — quick stats strip */}
            <div className="flex flex-row lg:flex-col gap-3 lg:gap-2 lg:min-w-[200px]">
              {[
                { label: 'Cursos activos', value: allCourses.filter(c => c.started && !c.completed).length, color: 'text-lime-400' },
                { label: 'Labs completados', value: stats.labs_completed, color: 'text-emerald-400' },
                { label: 'Precisión tests', value: `${stats.avg_accuracy}%`, color: stats.avg_accuracy >= 80 ? 'text-emerald-400' : stats.avg_accuracy >= 60 ? 'text-yellow-400' : 'text-red-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between lg:bg-white/[0.03] lg:border lg:border-white/[0.05] lg:rounded-xl lg:px-3 lg:py-2 gap-4">
                  <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">{label}</span>
                  <span className={`text-sm font-black font-mono ${color}`}>{value}</span>
                </div>
              ))}
              <Link
                to="/tests"
                className="hidden lg:inline-flex items-center justify-center gap-2 mt-1 text-[11px] font-mono bg-lime-500/10 hover:bg-lime-500/15 border border-lime-500/20 px-3 py-2 rounded-xl text-lime-400 transition-colors"
              >
                <Target size={11} /> Hacer un test ahora
              </Link>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {isEmpty ? <EmptyState /> : (
          <>
            {/* ── Hero Stats ────────────────────────────────────────── */}
            <HeroStats stats={stats} />

            {/* ── In Progress (quick access) ────────────────────────── */}
            {activeCourses.length > 0 && (
              <div>
                <SectionTitle icon={Play} label="Continúa donde lo dejaste" color="text-lime-400" />
                <div className="grid sm:grid-cols-2 gap-3">
                  {activeCourses.map(c => (
                    <CourseCard key={c.id} course={c} isShop={!subscription_courses.find(sc => sc.id === c.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Tabs ─────────────────────────────────────────────── */}
            <div>
              {/* Tab bar */}
              <div className="flex items-center gap-1 border-b border-white/[0.04] mb-6">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono transition-all border-b-2 -mb-px ${
                      tab === t.id
                        ? 'border-lime-500 text-lime-400'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <t.icon size={12} />
                    {t.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${tab === t.id ? 'bg-lime-500/20 text-lime-400' : 'bg-white/5 text-slate-600'}`}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* ── Tab: Cursos ─────────────────────────── */}
              {tab === 'cursos' && (
                <div className="space-y-8">

                  {/* All sub courses */}
                  {subscription_courses.length > 0 && (
                    <div>
                      <SectionTitle icon={Shield} label="Certificaciones (suscripción)" color="text-lime-400" />
                      <div className="grid sm:grid-cols-2 gap-3">
                        {subscription_courses.map(c => <CourseCard key={c.id} course={c} isShop={false} />)}
                      </div>
                    </div>
                  )}

                  {/* Shop courses */}
                  {shop_courses.length > 0 && (
                    <div>
                      <SectionTitle icon={BookOpen} label="Cursos comprados" color="text-sky-400" />
                      <div className="grid sm:grid-cols-2 gap-3">
                        {shop_courses.map(c => <CourseCard key={c.id} course={c} isShop={true} />)}
                      </div>
                    </div>
                  )}

                  {/* Completed */}
                  {completedCourses.length > 0 && (
                    <div>
                      <SectionTitle icon={Award} label="Completados" color="text-emerald-400" />
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {completedCourses.map(c => (
                          <div key={c.id} className="bg-[#111827] border border-emerald-500/15 rounded-2xl p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 size={16} className="text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                              <p className="text-[10px] text-emerald-500 font-mono">100% completado</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {allCourses.length === 0 && (
                    <div className="py-16 text-center">
                      <Lock size={24} className="text-slate-700 mx-auto mb-3" />
                      <p className="text-sm text-slate-600">No tienes cursos activos todavía.</p>
                      <Link to="/explora" className="text-xs text-lime-400 hover:text-lime-300 mt-2 inline-block transition-colors">
                        Explorar academia →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Skill Paths ─────────────────────── */}
              {tab === 'paths' && (
                <div>
                  {skill_paths.length > 0 ? (
                    <>
                      {/* Summary bar */}
                      <div className="flex items-center gap-6 p-4 bg-[#111827] border border-white/5 rounded-2xl mb-5">
                        <div className="text-center">
                          <p className="text-xl font-black text-white">{skill_paths.filter(p => p.started).length}</p>
                          <p className="text-[10px] text-slate-500 font-mono">en progreso</p>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="text-center">
                          <p className="text-xl font-black text-white">{skill_paths.filter(p => p.progress_pct === 100).length}</p>
                          <p className="text-[10px] text-slate-500 font-mono">completados</p>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="text-center">
                          <p className="text-xl font-black text-white">{skill_paths.reduce((a, p) => a + p.completed_labs, 0)}</p>
                          <p className="text-[10px] text-slate-500 font-mono">labs hechos</p>
                        </div>
                        <div className="flex-1" />
                        <Link to="/labs" className="text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1">
                          Ver todos <ArrowRight size={11} />
                        </Link>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {skill_paths.map(p => <PathCard key={p.id} path={p} />)}
                      </div>
                    </>
                  ) : (
                    <div className="py-16 text-center">
                      <Layers size={24} className="text-slate-700 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-3">Aún no has empezado ningún skill path.</p>
                      <Link to="/labs" className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors">
                        Explorar labs <ArrowRight size={11} />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Tests ──────────────────────────── */}
              {tab === 'tests' && (
                <div>
                  {stats.total_tests > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-white">{stats.total_tests}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">tests totales</p>
                      </div>
                      <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 text-center">
                        <p className={`text-2xl font-black ${stats.avg_accuracy >= 80 ? 'text-emerald-400' : stats.avg_accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {stats.avg_accuracy}%
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">precisión media</p>
                      </div>
                      <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-yellow-400">
                          {recent_tests.reduce((a, t) => a + (t.xp_gained || 0), 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">XP (últimos 10)</p>
                      </div>
                    </div>
                  )}
                  <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
                    <TestsPanel tests={recent_tests} />
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}
