import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Google SVG icon (inline, no external lib needed)
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" className="flex-shrink-0">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

// Microsoft icon
const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" className="flex-shrink-0">
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);

export default function OAuthButtons({ mode = 'login' }) {
  const [loading, setLoading] = useState(null);

  const handleOAuth = (provider) => {
    setLoading(provider);
    // Redirect to backend OAuth endpoint — backend will redirect back to frontend
    window.location.href = `${API_BASE}/oauth/${provider}/login`;
  };

  const label = mode === 'login' ? 'Entrar con' : 'Registrarse con';

  return (
    <div className="space-y-2.5">
      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-[11px] font-mono text-slate-600 uppercase tracking-wider">o continúa con</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      <button
        type="button"
        onClick={() => handleOAuth('google')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/15 transition-all text-sm font-mono text-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading === 'google' ? (
          <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        {label} Google
      </button>

      <button
        type="button"
        onClick={() => handleOAuth('microsoft')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/15 transition-all text-sm font-mono text-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading === 'microsoft' ? (
          <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
        ) : (
          <MicrosoftIcon />
        )}
        {label} Microsoft
      </button>
    </div>
  );
}
