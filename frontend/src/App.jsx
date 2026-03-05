import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import PremiumRoute from './components/PremiumRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SubscriptionPlans from './pages/SubscriptionPlans';
import InfoPage from './pages/InfoPage';

// Alumno Pages
import Dashboard from './pages/Dashboard';
import CharacterProfile from './pages/CharacterProfile';
import Courses from './pages/Courses';
import TestCenter from './pages/TestCenter';
import SkillLabs from './pages/SkillLabs';
import Resources from './pages/Resources';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import ManageSubscription from './pages/ManageSubscription';
import Leaderboard from './pages/Leaderboard';
import TestHistory from './pages/TestHistory';
import ResourceViewer from './pages/ResourceViewer';
import VideoCoursesList from './pages/VideoCoursesList';
import VideoCourseDetail from './pages/VideoCourseDetail';
import Flashcards from './pages/Flashcards';
import Cybersecurity from './pages/Cybersecurity';
import MyCourses from './pages/MyCourses';
import LabsPage from './pages/LabsPage';
import LabDetail from './pages/LabDetail';

// Admin & Docente Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminContent from './pages/AdminContent';
import AdminTickets from './pages/AdminTickets';
import AdminSuggestions from './pages/AdminSuggestions';
import AdminVideoCourses from './pages/AdminVideoCourses';
import AdminCoupons from './pages/AdminCoupons';
import AdminBroadcast from './pages/AdminBroadcast';
import AdminCharacterProfile from './pages/AdminCharacterProfile';
import AcademiaWorld from './pages/AcademiaWorld';
import VirtualWorldView from './pages/VirtualWorldView';
import VirtualWorldComingSoon from './pages/VirtualWorldComingSoon';
import AcademyShop from './pages/AcademyShop';
import NewsFeed from './pages/NewsFeed';
import ShopCourseDetail from './pages/ShopCourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import AdminAcademyShop from './pages/AdminAcademyShop';
import Tools from './pages/Tools';
import SubnetCalculator from './pages/SubnetCalculator';
import ExploraAcademia from './pages/ExploraAcademia';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminReferrals from './pages/AdminReferrals';
import AdminLabs from './pages/AdminLabs';

import { useAuth } from './context/AuthContext';

// HOC for Virtual World wrapper
const VirtualWorldGuard = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/dashboard" replace />;

  if (user.role === 'admin') {
    return <AcademiaWorld />;
  }
  return <VirtualWorldComingSoon />;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. RUTAS PÚBLICAS */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/planes" element={<SubscriptionPlans />} />
            <Route path="/descubre" element={<InfoPage />} />

            {/* 2. ÁREA PROTEGIDA (ALUMNOS Y GENERAL) */}
            {/* Las ponemos antes de los dashboards para asegurar prioridad de coincidencia */}
            <Route
              path="/resources"
              element={<PremiumRoute><Resources /></PremiumRoute>}
            />
            <Route
              path="/tests"
              element={<PremiumRoute><TestCenter /></PremiumRoute>}
            />
            <Route
              path="/skill-labs"
              element={<PremiumRoute><SkillLabs /></PremiumRoute>}
            />
            <Route
              path="/labs"
              element={<PremiumRoute><LabsPage /></PremiumRoute>}
            />
            <Route
              path="/labs/:id"
              element={<PremiumRoute><LabDetail /></PremiumRoute>}
            />
            <Route
              path="/courses"
              element={<PremiumRoute><Courses /></PremiumRoute>}
            />
            <Route
              path="/flashcards"
              element={<PremiumRoute><Flashcards /></PremiumRoute>}
            />
            <Route
              path="/ciberseguridad"
              element={<PremiumRoute><Cybersecurity /></PremiumRoute>}
            />
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/explora"
              element={<ProtectedRoute><ExploraAcademia /></ProtectedRoute>}
            />
            <Route
              path="/personaje"
              element={<ProtectedRoute><CharacterProfile /></ProtectedRoute>}
            />
            <Route
              path="/mundo"
              element={<ProtectedRoute><VirtualWorldGuard /></ProtectedRoute>}
            />
            <Route
              path="/mundo-virtual"
              element={<ProtectedRoute><VirtualWorldView /></ProtectedRoute>}
            />
            <Route
              path="/shop"
              element={<ProtectedRoute><AcademyShop /></ProtectedRoute>}
            />
            <Route
              path="/shop/:id"
              element={<ProtectedRoute><ShopCourseDetail /></ProtectedRoute>}
            />
            <Route
              path="/noticias"
              element={<ProtectedRoute><NewsFeed /></ProtectedRoute>}
            />
            <Route
              path="/watch/:id"
              element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>}
            />
            <Route
              path="/my-courses"
              element={<ProtectedRoute><MyCourses /></ProtectedRoute>}
            />
            <Route
              path="/admin/shop"
              element={<RoleRoute allowedRoles={['admin']}><AdminAcademyShop /></RoleRoute>}
            />
            <Route
              path="/tools"
              element={<ProtectedRoute><Tools /></ProtectedRoute>}
            />
            <Route
              path="/tools/subnetting"
              element={<ProtectedRoute><SubnetCalculator /></ProtectedRoute>}
            />
            <Route
              path="/admin/personaje"
              element={<ProtectedRoute><AdminCharacterProfile /></ProtectedRoute>}
            />
            <Route
              path="/video-cursos"
              element={<PremiumRoute><VideoCoursesList /></PremiumRoute>}
            />
            <Route
              path="/video-cursos/:id"
              element={<PremiumRoute><VideoCourseDetail /></PremiumRoute>}
            />
            <Route
              path="/suscripcion"
              element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>}
            />
            <Route
              path="/suscripcion/exito"
              element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>}
            />
            <Route
              path="/suscripcion/gestionar"
              element={<ProtectedRoute><ManageSubscription /></ProtectedRoute>}
            />
            <Route
              path="/leaderboard"
              element={<ProtectedRoute><Leaderboard /></ProtectedRoute>}
            />
            <Route
              path="/test-stats"
              element={<ProtectedRoute><TestHistory /></ProtectedRoute>}
            />
            <Route
              path="/recursos/:id"
              element={<ProtectedRoute><ResourceViewer /></ProtectedRoute>}
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
              path="/admin/users/:id"
              element={<RoleRoute allowedRoles={['admin']}><AdminUserDetail /></RoleRoute>}
            />
            <Route
              path="/admin/cupones"
              element={<RoleRoute allowedRoles={['admin']}><AdminCoupons /></RoleRoute>}
            />
            <Route
              path="/admin/referidos"
              element={<RoleRoute allowedRoles={['admin']}><AdminReferrals /></RoleRoute>}
            />
            <Route
              path="/gestion-contenido"
              element={<RoleRoute allowedRoles={['admin', 'docente']}><AdminContent /></RoleRoute>}
            />
            <Route
              path="/admin/cursos"
              element={<RoleRoute allowedRoles={['admin', 'docente']}><AdminVideoCourses /></RoleRoute>}
            />
            <Route
              path="/admin/tickets"
              element={<RoleRoute allowedRoles={['admin']}><AdminTickets /></RoleRoute>}
            />
            <Route
              path="/admin/sugerencias"
              element={<RoleRoute allowedRoles={['admin']}><AdminSuggestions /></RoleRoute>}
            />
            <Route
              path="/admin/noticias"
              element={<RoleRoute allowedRoles={['admin']}><AdminBroadcast /></RoleRoute>}
            />
            <Route
              path="/admin/labs"
              element={<RoleRoute allowedRoles={['admin']}><AdminLabs /></RoleRoute>}
            />

            {/* 4. FALLBACK ESTRATÉGICO */}
            {/* Si la ruta no existe, enviamos a dashboard (que tiene su propia lógica de redirección si no hay token) */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}