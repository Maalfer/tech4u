import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../services/api';

export default function SubscriptionSuccess() {
    const [searchParams] = useSearchParams();
    const { refreshUser } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading | success | error

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                const res = await api.get(`/subscriptions/verify-session?session_id=${sessionId}`);
                if (res.data.success) {
                    await refreshUser(); // Actualiza el token/usuario en el contexto
                    setStatus('success');
                    setTimeout(() => navigate('/dashboard'), 3500);
                } else {
                    setStatus('error');
                }
            } catch {
                setStatus('error');
            }
        };

        verify();
    }, []);

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                {status === 'loading' && (
                    <>
                        <Loader className="w-16 h-16 text-[#39FF14] animate-spin mx-auto mb-6" />
                        <h1 className="text-2xl font-black text-white uppercase italic mb-2">Verificando pago…</h1>
                        <p className="text-slate-500 font-mono text-sm">Estamos confirmando tu suscripción. Un momento.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="mb-6 relative">
                            <div className="w-24 h-24 rounded-full bg-[#39FF14]/10 border-2 border-[#39FF14] flex items-center justify-center mx-auto animate-pulse">
                                <CheckCircle className="w-12 h-12 text-[#39FF14]" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase italic mb-3">
                            ¡Suscripción <span className="text-[#39FF14]">Activada!</span>
                        </h1>
                        <p className="text-slate-400 font-mono text-sm mb-6">
                            Bienvenido al lado premium de Tech4U. Ahora tienes acceso a todos los tests, recursos y funcionalidades.
                        </p>
                        <div className="p-4 rounded-2xl bg-[#39FF14]/5 border border-[#39FF14]/30 font-mono text-xs text-[#39FF14]">
                            Redirigiendo al dashboard en unos segundos…
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-black text-white uppercase italic mb-2">Algo salió mal</h1>
                        <p className="text-slate-400 font-mono text-sm mb-6">
                            No pudimos verificar tu pago. Si se realizó el cobro, contacta con soporte. Si no, inténtalo de nuevo.
                        </p>
                        <button
                            onClick={() => navigate('/suscripcion')}
                            className="px-6 py-3 bg-[#39FF14] text-black font-black rounded-xl uppercase text-sm"
                        >
                            Volver a planes
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
