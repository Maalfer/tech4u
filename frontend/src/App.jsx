import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import TestCenter from './pages/TestCenter'
import Resources from './pages/Resources'
import AdminUsers from './pages/AdminUsers'
import AdminContent from './pages/AdminContent'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Area */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/tests" element={<ProtectedRoute><TestCenter /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />

          {/* Admin & Docente Area */}
          <Route path="/gestion-usuarios" element={<RoleRoute allowedRoles={['admin']}><AdminUsers /></RoleRoute>} />
          <Route path="/gestion-contenido" element={<RoleRoute allowedRoles={['admin', 'docente']}><AdminContent /></RoleRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
