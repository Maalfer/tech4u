import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, BookOpen } from 'lucide-react';

// Module display names map
const MODULE_LABELS = {
    terminal_skills: 'Terminal Skills',
    sql_skills: 'SQL Skills',
    netlabs: 'NetLab',
    theory: 'Teoría',
    skill_labs: 'Skill Labs',
    tests: 'Test Center',
    ciberseguridad: 'Ciberseguridad',
};

// Shown when a student's group has NOT enabled this module
function ModuleBlocked({ moduleName, groupName }) {
    return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-9 h-9 text-slate-500" />
                </div>
                <h1 className="text-2xl font-black text-white font-mono mb-3">
                    Módulo no disponible
                </h1>
                <p className="text-slate-400 font-mono text-sm leading-relaxed mb-2">
                    <span className="text-amber-400 font-bold">
                        {MODULE_LABELS[moduleName] || moduleName}
                    </span>{' '}
                    no ha sido activado por tu docente para el grupo{' '}
                    <span className="text-violet-400 font-bold">{groupName}</span>.
                </p>
                <p className="text-slate-500 font-mono text-xs mt-4">
                    Contacta a tu docente si crees que debería estar habilitado.
                </p>
            </div>
        </div>
    );
}

/**
 * PremiumRoute: Guards module access using two-tier logic:
 *
 * Tier 1 — Student in a teacher group:
 *   → Access determined by which modules the teacher has enabled
 *   → If module prop is provided and NOT in enabled_modules → show ModuleBlocked
 *   → If module prop not provided → allow (page doesn't require module check)
 *
 * Tier 2 — Student without a group:
 *   → Classic subscription check (free → redirect to /suscripcion)
 *
 * Non-students (admin, developer, docente) always have full access.
 *
 * Usage:
 *   <PremiumRoute module="terminal_skills">  (module-specific check)
 *   <PremiumRoute>                           (just subscription check, no module filter)
 */
export default function PremiumRoute({ children, module: moduleName }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Admin and Developer have unrestricted access to everything
    if (user.role === 'admin' || user.role === 'developer') {
        return children;
    }

    // Docente: full access to all learning content
    if (user.role === 'docente') {
        return children;
    }

    // From here on, we are dealing with 'alumno' (students)

    // ── Tier 1: Student in a teacher group ────────────────────────────────────
    if (user.group_info) {
        // If a specific module is required, check if it's enabled
        if (moduleName && !(user.group_info.enabled_modules || []).includes(moduleName)) {
            return (
                <ModuleBlocked
                    moduleName={moduleName}
                    groupName={user.group_info.group_name}
                />
            );
        }
        // Module is enabled (or no specific module check needed)
        return children;
    }

    // ── Tier 2: No group — use subscription ───────────────────────────────────
    if (user.subscription_type === 'free' || !user.subscription_type) {
        return <Navigate to="/suscripcion" replace />;
    }

    return children;
}
