/**
 * PayPalReturnPage — handles the redirect back from PayPal after the user approves payment.
 *
 * PayPal redirects to: /suscripcion/paypal-retorno?token=ORDER_ID&PayerID=xxx
 *
 * This page:
 *  1. Reads the order token (= PayPal order ID) from the URL
 *  2. Calls our authenticated backend to capture the payment
 *  3. On success → navigates to /suscripcion/exito
 *  4. On failure → shows an error with a "Reintentar" link
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../services/api';

export default function PayPalReturnPage() {
    const [searchParams]        = useSearchParams();
    const { refreshUser }       = useAuth();
    const navigate              = useNavigate();
    const [status, setStatus]   = useState('loading'); // 'loading' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        // PayPal passes the order ID as the 'token' query param
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setErrorMsg('No se encontró el identificador de la orden en la URL.');
            return;
        }

        const capture = async () => {
            try {
                const res = await api.post(`/paypal/capture-order/${token}`);
                if (res.data.status === 'COMPLETED') {
                    await refreshUser(); // update local auth context
                    setStatus('success');
                    // Short delay so the user sees the success state before redirect
                    setTimeout(() => {
                        navigate(`/suscripcion/exito?session_id=${token}&method=paypal`, { replace: true });
                    }, 1200);
                } else {
                    setStatus('error');
                    setErrorMsg(`Estado del pago: ${res.data.status}. Contacta con soporte si se cobró el importe.`);
                }
            } catch (err) {
                setStatus('error');
                const detail = err.response?.data?.detail || 'Error desconocido al procesar el pago.';
                setErrorMsg(detail);
            }
        };

        capture();
    }, []); // run once on mount

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-8">
            <div className="max-w-md w-full text-center">

                {status === 'loading' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <Loader className="w-16 h-16 text-neon animate-spin" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                                Procesando Pago
                            </h1>
                            <p className="text-slate-400 font-mono text-sm">
                                Confirmando tu pago con PayPal…
                            </p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <CheckCircle className="w-16 h-16 text-neon" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                                ¡Pago Completado!
                            </h1>
                            <p className="text-slate-400 font-mono text-sm">
                                Redirigiendo…
                            </p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <XCircle className="w-16 h-16 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                                Error al Procesar el Pago
                            </h1>
                            <p className="text-slate-400 font-mono text-sm leading-relaxed mb-6">
                                {errorMsg}
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate('/suscripcion')}
                                    className="w-full py-3 rounded-2xl bg-neon text-black font-black font-mono text-sm uppercase hover:opacity-90 transition-all"
                                >
                                    Volver a Suscripción
                                </button>
                                <p className="text-slate-600 font-mono text-xs">
                                    Si se realizó un cargo, contacta con soporte desde el dashboard.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
