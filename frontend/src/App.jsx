import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Alumno Pages
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import TestCenter from './pages/TestCenter';
import Resources from './pages/Resources';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionSuccess from './pages/SubscriptionSuccess';

// Admin & Docente Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminContent from './pages/AdminContent';
import AdminTickets from './pages/AdminTickets';
import AdminSuggestions from './pages/AdminSuggestions';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. RUTAS PÚBLICAS */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* 2. ÁREA PROTEGIDA (ALUMNOS Y GENERAL) */}
          {/* Las ponemos antes de los dashboards para asegurar prioridad de coincidencia */}
          <Route
            path="/resources"
            element={<ProtectedRoute><Resources /></ProtectedRoute>}
          />
          <Route
            path="/tests"
            element={<ProtectedRoute><TestCenter /></ProtectedRoute>}
          />
          <Route
            path="/courses"
            element={<ProtectedRoute><Courses /></ProtectedRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/suscripcion"
            element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>}
          />
          <Route
            path="/suscripcion/exito"
            element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>}
          />

          {/* 3. ÁREA DE GESTIÓN (ADMIN & DOCENTE) */}
          <Route
            path="/admin-dashboard"
            element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>}
          />
          <Route
            path="/gestion-usuarios"
            element={<RoleRoute allowedRoles={['admin']}><AdminUsers /></RoleRoute>}
          />
          <Route
            path="/gestion-contenido"
            element={<RoleRoute allowedRoles={['admin', 'docente']}><AdminContent /></RoleRoute>}
          />
          <Route
            path="/admin/tickets"
            element={<RoleRoute allowedRoles={['admin']}><AdminTickets /></RoleRoute>}
          />
          <Route
            path="/admin/sugerencias"
            element={<RoleRoute allowedRoles={['admin']}><AdminSuggestions /></RoleRoute>}
          />

          {/* 4. FALLBACK ESTRATÉGICO */}
          {/* Si la ruta no existe, enviamos a dashboard (que tiene su propia lógica de redirección si no hay token) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}