import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'

// Public Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'

// Alumno Pages
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import TestCenter from './pages/TestCenter'
import Resources from './pages/Resources'

// Admin & Docente Pages
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminContent from './pages/AdminContent'
import AdminTickets from './pages/AdminTickets' 
import AdminSuggestions from './pages/AdminSuggestions' // <--- IMPORTANTE: Importar la nueva página

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Area (General) */}
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/tests" element={<ProtectedRoute><TestCenter /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />

          {/* Dashboard Dinámico */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin & Docente Area (Rutas Privadas de Gestión) */}
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

          {/* NUEVA RUTA: Buzón de Propuestas de Alumnos */}
          <Route 
            path="/admin/sugerencias" 
            element={<RoleRoute allowedRoles={['admin']}><AdminSuggestions /></RoleRoute>} 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}