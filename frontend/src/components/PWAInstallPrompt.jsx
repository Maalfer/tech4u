import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if user hasn't dismissed before
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', '1');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 rounded-2xl border border-sky-500/25 bg-[#0a1628] shadow-2xl shadow-sky-900/20 p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black font-mono text-white mb-0.5">Instalar Tech4U</p>
          <p className="text-[11px] text-slate-400 font-mono leading-snug">
            Accede sin conexión y estudia desde cualquier lugar.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition-all"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-500 hover:text-slate-300 font-mono text-xs transition-all"
            >
              Ahora no
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
