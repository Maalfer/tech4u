import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useUserStore from '../store/userStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ERROR_MESSAGES = {
  no_email:              'Tu cuenta de Google no tiene email verificado.',
  email_not_verified:    'Tu email de Google no está verificado.',
  invalid_state:         'Sesión caducada o petición inválida. Inténtalo de nuevo.',
  no_code:               'No se recibió código de autorización.',
  no_sub:                'No se pudo identificar tu cuenta.',
  token_exchange_failed: 'Error al conectar con Google. Inténtalo de nuevo.',
  profile_fetch_failed:  'No se pudo obtener tu perfil. Inténtalo de nuevo.',
  token_failed:          'Error interno al crear la sesión.',
  account_error:         'Error en la cuenta. Contacta con soporte.',
  oauth_not_configured:  'OAuth no está configurado en el servidor.',
  access_denied:         'Acceso denegado. Cancelaste el proceso.',
};

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [errorMsg, setErrorMsg] = useState('');

  // Acceso directo al store para poder actualizar user + token en un solo paso
  const setUserFromOAuth = useUserStore.setState;

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      setErrorMsg(ERROR_MESSAGES[error] || `Error: ${error}`);
      setStatus('error');
      setTimeout(() => navigate('/login?oauth_error=' + error), 3000);
      return;
    }

    if (!token) {
      setErrorMsg('No se recibió token de sesión.');
      setStatus('error');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // 1. Guardar el token primero para que las llamadas API lo usen
    localStorage.setItem('tech4u_token', token);

    // 2. Obtener el perfil del usuario con ese token
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((userData) => {
        // 3. Guardar el usuario en localStorage (lo mismo que hace el login normal)
        localStorage.setItem('tech4u_user', JSON.stringify(userData));

        // 4. Actualizar el store de Zustand directamente (sin recargar)
        setUserFromOAuth({ user: userData });

        setStatus('success');

        // 5. Navegar al dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      })
      .catch((err) => {
        console.error('OAuthCallback: error obteniendo perfil', err);
        // Si /auth/me falla limpiamos para evitar estado inconsistente
        localStorage.removeItem('tech4u_token');
        localStorage.removeItem('tech4u_user');
        setErrorMsg('No se pudo cargar el perfil. Inténtalo de nuevo.');
        setStatus('error');
        setTimeout(() => navigate('/login'), 2500);
      });
  }, [params, navigate, setUserFromOAuth]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="text-center max-w-sm px-6">
        {status === 'processing' && (
          <>
            <div className="w-12 h-12 border-2 border-slate-700 border-t-sky-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-mono text-sm">Iniciando sesión...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-emerald-400">✓</span>
            </div>
            <p className="text-emerald-400 font-mono text-sm">¡Sesión iniciada! Redirigiendo...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl text-red-400">✗</span>
            </div>
            <p className="text-red-400 font-mono text-sm mb-2">Error al autenticar</p>
            {errorMsg && (
              <p className="text-slate-500 font-mono text-xs">{errorMsg}</p>
            )}
            <p className="text-slate-600 font-mono text-xs mt-3">Volviendo al login...</p>
          </>
        )}
      </div>
    </div>
  );
}
