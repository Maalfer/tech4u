import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PremiumRoute({ children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === 'alumno' && (user.subscription_type === 'free' || !user.subscription_type)) {
        return <Navigate to="/suscripcion" replace />;
    }

    return children;
}
