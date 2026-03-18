export function redirectUser(user) {
    // Admins and developers always go straight to admin panel — skip onboarding
    if (user.role === 'admin' || user.role === 'developer') {
        window.location.href = '/admin-dashboard';
        return;
    }
    // Docentes go to dashboard directly — no onboarding needed
    if (user.role === 'docente') {
        window.location.href = '/dashboard';
        return;
    }
    // Regular students: show onboarding on first login
    if (!user.onboarding_completed) {
        window.location.href = '/onboarding';
        return;
    }
    window.location.href = '/dashboard';
}

