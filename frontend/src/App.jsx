import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import PremiumRoute from './components/PremiumRoute';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import CookieBanner from './components/CookieBanner';
import { useAuth } from './context/AuthContext';
import { trackEvent } from './utils/analytics';
import useUserStore from './store/userStore';

// ── Silent token refresh on app boot ─────────────────────────────────────────
function SilentRefresh() {
    const silentRefreshToken = useUserStore(s => s.silentRefreshToken);
    useEffect(() => {
        silentRefreshToken();
    }, []);
    return null;
}

// ── Page view tracker (GA4 + backend analytics) ───────────────────────────────
function PageViewTracker() {
  const location = useLocation();
  const { user } = useAuth();
  useEffect(() => {
    // GA4 (if present)
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('page_view', { page_path: location.pathname + location.search });
    }
    // Backend analytics — only track authenticated users
    if (user) {
      trackEvent('page_view', location.pathname, 'page');
    }
  }, [location, user]);
  return null;
}

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
const SubscriptionPlans = lazy(() => import('./pages/SubscriptionPlans'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Alumno Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const CharacterProfile = lazy(() => import('./pages/CharacterProfile'));
const Courses = lazy(() => import('./pages/Courses'));
const TestCenter = lazy(() => import('./pages/TestCenter'));
const SkillLabs = lazy(() => import('./pages/SkillLabs'));
const Resources = lazy(() => import('./pages/Resources'));
const MiReferral = lazy(() => import('./pages/MiReferral'));
const ParaCentros = lazy(() => import('./pages/ParaCentros'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const SubscriptionSuccess = lazy(() => import('./pages/SubscriptionSuccess'));
const PayPalReturnPage = lazy(() => import('./pages/PayPalReturnPage'));
const ManageSubscription = lazy(() => import('./pages/ManageSubscription'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const TestHistory = lazy(() => import('./pages/TestHistory'));
const ResourceViewer = lazy(() => import('./pages/ResourceViewer'));
const Flashcards = lazy(() => import('./pages/Flashcards'));
const Cybersecurity = lazy(() => import('./pages/Cybersecurity'));
const MyCourses = lazy(() => import('./pages/MyCourses'));
const LabsPage = lazy(() => import('./pages/LabsPage'));
const LabDetail = lazy(() => import('./pages/LabDetail'));
const SQLSkillsPage = lazy(() => import('./pages/SQLSkillsPage'));
const AdminSQLEditor = lazy(() => import('./pages/AdminSQLEditor'));

// Admin & Docente Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminContent = lazy(() => import('./pages/AdminContent'));
const AdminTickets = lazy(() => import('./pages/AdminTickets'));
const AdminSuggestions = lazy(() => import('./pages/AdminSuggestions'));
const AdminCoupons = lazy(() => import('./pages/AdminCoupons'));
const AdminBroadcast = lazy(() => import('./pages/AdminBroadcast'));
const AdminCharacterProfile = lazy(() => import('./pages/AdminCharacterProfile'));
// VirtualWorld removed — replaced by Battle mode and WinLabs
const AcademyShop = lazy(() => import('./pages/AcademyShop'));
const NewsFeed = lazy(() => import('./pages/NewsFeed'));
const ShopCourseDetail = lazy(() => import('./pages/ShopCourseDetail'));
const CoursePlayer = lazy(() => import('./pages/CoursePlayer'));
const AdminAcademyShop = lazy(() => import('./pages/AdminAcademyShop'));
const Tools = lazy(() => import('./pages/Tools'));
const SubnetCalculator = lazy(() => import('./pages/SubnetCalculator'));
const BinaryConverter = lazy(() => import('./pages/BinaryConverter'));
const PortReference = lazy(() => import('./pages/PortReference'));
const ChmodCalculator = lazy(() => import('./pages/ChmodCalculator'));
const OsiExplorer = lazy(() => import('./pages/OsiExplorer'));
const VlsmCalculator = lazy(() => import('./pages/VlsmCalculator'));
const Ipv6Calculator = lazy(() => import('./pages/Ipv6Calculator'));
const RegexTester = lazy(() => import('./pages/RegexTester'));
const HashGenerator = lazy(() => import('./pages/HashGenerator'));
const DnsLookup = lazy(() => import('./pages/DnsLookup'));
const CronBuilder = lazy(() => import('./pages/CronBuilder'));
const NetDebugLab = lazy(() => import('./pages/NetDebugLab'));
const NetDebugScenario = lazy(() => import('./pages/NetDebugScenario'));
const NetLabCLI = lazy(() => import('./pages/NetLabCLI'));
const ExploraAcademia = lazy(() => import('./pages/ExploraAcademia'));
const AdminUserDetail = lazy(() => import('./pages/AdminUserDetail'));
const AdminReferrals = lazy(() => import('./pages/AdminReferrals'));
const AdminLabs = lazy(() => import('./pages/AdminLabs'));
const AdminTerminalBuilder = lazy(() => import('./pages/AdminTerminalBuilder'));
const Teoria = lazy(() => import('./pages/Teoria'));
const TeoriaSubject = lazy(() => import('./pages/TeoriaSubject'));
const TeoriaPost = lazy(() => import('./pages/TeoriaPost'));
const AdminTeoria = lazy(() => import('./pages/AdminTeoria'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));

// Legal Pages (fully public)
const AvisoLegalPage = lazy(() => import('./pages/AvisoLegalPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));
const PrivacidadPage = lazy(() => import('./pages/PrivacidadPage'));
const TerminosPage = lazy(() => import('./pages/TerminosPage'));

// Video Courses Pages
const VideoCoursesList = lazy(() => import('./pages/VideoCoursesList'));
const VideoCourseDetail = lazy(() => import('./pages/VideoCourseDetail'));
const AdminVideoCourses = lazy(() => import('./pages/AdminVideoCourses'));

// Admin Labs Management Pages
const AdminSkillPaths = lazy(() => import('./pages/AdminSkillPaths'));
const AdminModules = lazy(() => import('./pages/AdminModules'));
const AdminLabsContent = lazy(() => import('./pages/AdminLabsContent'));
const AdminChallenges = lazy(() => import('./pages/AdminChallenges'));
const AdminLabGenerator = lazy(() => import('./pages/AdminLabGenerator'));
const BattleArena = lazy(() => import('./pages/BattleArena'));
const WinLabsPage = lazy(() => import('./pages/WinLabsPage'));
const WinLabScenario = lazy(() => import('./pages/WinLabScenario'));
const WinCheatSheet = lazy(() => import('./pages/WinCheatSheet'));
const WinLearningPath = lazy(() => import('./pages/WinLearningPath'));

// SEO Landing Pages (fully public)
const SEOLinuxPage = lazy(() => import('./pages/SEOLinuxPage'));
const SEOSQLPage = lazy(() => import('./pages/SEOSQLPage'));
const SEOCiberseguridadPage = lazy(() => import('./pages/SEOCiberseguridadPage'));
const SEORedesPage = lazy(() => import('./pages/SEORedesPage'));

// SEO ASIR pages
const SEOAsirPage = lazy(() => import('./pages/SEOAsirPage'));
const SEOLabsLinuxAsir = lazy(() => import('./pages/SEOLabsLinuxAsir'));
const SEOSqlAsir = lazy(() => import('./pages/SEOSqlAsir'));
const SEOCiberseguridadAsir = lazy(() => import('./pages/SEOCiberseguridadAsir'));

// Changelog
const ChangelogPage = lazy(() => import('./pages/ChangelogPage'));


export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
              <SilentRefresh />
              <PageViewTracker />
              <PWAInstallPrompt />
              <CookieBanner />
              <Suspense fallback={<PageLoader />}>
                <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="/planes" element={<SubscriptionPlans />} />
              <Route path="/para-centros" element={<ParaCentros />} />
              <Route path="/plataforma-asir" element={<SEOAsirPage />} />
              <Route path="/labs-linux-asir" element={<SEOLabsLinuxAsir />} />
              <Route path="/sql-practice-asir" element={<SEOSqlAsir />} />
              <Route path="/ciberseguridad-asir" element={<SEOCiberseguridadAsir />} />
              <Route path="/novedades" element={<ChangelogPage />} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/resources" element={<PremiumRoute><Resources /></PremiumRoute>} />
              <Route path="/tests" element={<PremiumRoute module="tests"><TestCenter /></PremiumRoute>} />
              <Route path="/skill-labs" element={<PremiumRoute module="skill_labs"><SkillLabs /></PremiumRoute>} />
              <Route path="/labs" element={<PremiumRoute module="terminal_skills"><LabsPage /></PremiumRoute>} />
              <Route path="/labs/:id" element={<PremiumRoute module="terminal_skills"><LabDetail /></PremiumRoute>} />
              <Route path="/sql-skills" element={<PremiumRoute module="sql_skills"><SQLSkillsPage /></PremiumRoute>} />
              <Route path="/teoria" element={<PremiumRoute module="theory"><Teoria /></PremiumRoute>} />
              <Route path="/teoria/:subjectSlug" element={<PremiumRoute module="theory"><TeoriaSubject /></PremiumRoute>} />
              <Route path="/teoria/:subjectSlug/:postSlug" element={<PremiumRoute module="theory"><TeoriaPost /></PremiumRoute>} />

              {/* ── Páginas Legales (públicas) ────────────────────────────────────── */}
              <Route path="/aviso-legal" element={<AvisoLegalPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/privacidad" element={<PrivacidadPage />} />
              <Route path="/terminos" element={<TerminosPage />} />

              {/* ── SEO Landing Pages (fully public) ──────────────────────────────── */}
              <Route path="/linux-terminal-exercises" element={<SEOLinuxPage />} />
              <Route path="/sql-practice" element={<SEOSQLPage />} />
              <Route path="/ciberseguridad-labs" element={<SEOCiberseguridadPage />} />
              <Route path="/redes-informaticas" element={<SEORedesPage />} />

              <Route path="/courses" element={<PremiumRoute><Courses /></PremiumRoute>} />
              <Route path="/flashcards" element={<PremiumRoute><Flashcards /></PremiumRoute>} />
              <Route path="/ciberseguridad" element={<PremiumRoute><Cybersecurity /></PremiumRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/explora" element={<ProtectedRoute><ExploraAcademia /></ProtectedRoute>} />
              <Route path="/personaje" element={<ProtectedRoute><CharacterProfile /></ProtectedRoute>} />
              {/* /mundo and /mundo-virtual removed — functionality replaced */}
              <Route path="/shop" element={<ProtectedRoute><AcademyShop /></ProtectedRoute>} />
              <Route path="/shop/:id" element={<ProtectedRoute><ShopCourseDetail /></ProtectedRoute>} />
              <Route path="/noticias" element={<ProtectedRoute><NewsFeed /></ProtectedRoute>} />
              <Route path="/watch/:id" element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />
              <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
              <Route path="/video-courses" element={<PremiumRoute><VideoCoursesList /></PremiumRoute>} />
              <Route path="/video-courses/:id" element={<PremiumRoute><VideoCourseDetail /></PremiumRoute>} />

              {/* ── Admin-only (usuarios + finanzas) ──────────────────────────────── */}
              <Route path="/gestion-usuarios" element={<RoleRoute allowedRoles={['admin']}><AdminUsers /></RoleRoute>} />
              <Route path="/admin/users/:id" element={<RoleRoute allowedRoles={['admin']}><AdminUserDetail /></RoleRoute>} />
              <Route path="/admin/cupones" element={<RoleRoute allowedRoles={['admin']}><AdminCoupons /></RoleRoute>} />
              <Route path="/admin/referidos" element={<RoleRoute allowedRoles={['admin']}><AdminReferrals /></RoleRoute>} />

              {/* ── Admin + Developer (técnico / operaciones) ─────────────────────── */}
              <Route path="/admin/shop" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminAcademyShop /></RoleRoute>} />
              <Route path="/admin-dashboard" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminDashboard /></RoleRoute>} />
              <Route path="/admin/tickets" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminTickets /></RoleRoute>} />
              <Route path="/admin/sugerencias" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminSuggestions /></RoleRoute>} />
              <Route path="/admin/labs" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminLabs /></RoleRoute>} />
              <Route path="/admin/terminal-builder/*" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminTerminalBuilder /></RoleRoute>} />
              <Route path="/admin/sql-editor" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminSQLEditor /></RoleRoute>} />
              <Route path="/admin/video-courses" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminVideoCourses /></RoleRoute>} />
              <Route path="/admin/skill-paths" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminSkillPaths /></RoleRoute>} />
              <Route path="/admin/skill-paths/:pathId/modules" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminModules /></RoleRoute>} />
              <Route path="/admin/skill-paths/:pathId/modules/:moduleId/labs" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminLabsContent /></RoleRoute>} />
              <Route path="/admin/labs/:labId/challenges" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminChallenges /></RoleRoute>} />
              <Route path="/admin/lab-generator" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminLabGenerator /></RoleRoute>} />

              {/* ── Admin + Developer + Docente (contenido editorial) ─────────────── */}
              <Route path="/gestion-contenido" element={<RoleRoute allowedRoles={['admin', 'developer', 'docente']}><AdminContent /></RoleRoute>} />
              <Route path="/admin/noticias" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminBroadcast /></RoleRoute>} />
              <Route path="/admin/teoria" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminTeoria /></RoleRoute>} />
              <Route path="/admin/analytics" element={<RoleRoute allowedRoles={['admin', 'developer']}><AdminAnalytics /></RoleRoute>} />

              {/* ── Otras rutas protegidas ────────────────────────────────────────── */}
              <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
              <Route path="/tools/subnetting" element={<ProtectedRoute><SubnetCalculator /></ProtectedRoute>} />
              <Route path="/tools/binary" element={<ProtectedRoute><BinaryConverter /></ProtectedRoute>} />
              <Route path="/tools/ports" element={<ProtectedRoute><PortReference /></ProtectedRoute>} />
              <Route path="/tools/chmod" element={<ProtectedRoute><ChmodCalculator /></ProtectedRoute>} />
              <Route path="/tools/osi" element={<ProtectedRoute><OsiExplorer /></ProtectedRoute>} />
              <Route path="/tools/vlsm" element={<ProtectedRoute><VlsmCalculator /></ProtectedRoute>} />
              <Route path="/tools/ipv6" element={<ProtectedRoute><Ipv6Calculator /></ProtectedRoute>} />
              <Route path="/tools/regex" element={<ProtectedRoute><RegexTester /></ProtectedRoute>} />
              <Route path="/tools/hash" element={<ProtectedRoute><HashGenerator /></ProtectedRoute>} />
              <Route path="/tools/dns" element={<ProtectedRoute><DnsLookup /></ProtectedRoute>} />
              <Route path="/tools/cron" element={<ProtectedRoute><CronBuilder /></ProtectedRoute>} />
              <Route path="/battle" element={<PremiumRoute><BattleArena /></PremiumRoute>} />
              <Route path="/winlabs" element={<PremiumRoute module="terminal_skills"><WinLabsPage /></PremiumRoute>} />
              <Route path="/winlabs/path" element={<PremiumRoute module="terminal_skills"><WinLearningPath /></PremiumRoute>} />
              <Route path="/winlabs/cheatsheet" element={<PremiumRoute module="terminal_skills"><WinCheatSheet /></PremiumRoute>} />
              <Route path="/winlabs/:id" element={<PremiumRoute module="terminal_skills"><WinLabScenario /></PremiumRoute>} />
              <Route path="/netlab" element={<PremiumRoute module="netlabs"><NetDebugLab /></PremiumRoute>} />
              <Route path="/netlab/cli/:id" element={<PremiumRoute module="netlabs"><NetLabCLI /></PremiumRoute>} />
              <Route path="/netlab/:id" element={<PremiumRoute module="netlabs"><NetDebugScenario /></PremiumRoute>} />
              
              <Route path="/admin/personaje" element={<ProtectedRoute><AdminCharacterProfile /></ProtectedRoute>} />
              <Route path="/suscripcion" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
              <Route path="/suscripcion/exito" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
              <Route path="/suscripcion/paypal-retorno" element={<ProtectedRoute><PayPalReturnPage /></ProtectedRoute>} />
              <Route path="/suscripcion/gestionar" element={<ProtectedRoute><ManageSubscription /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/test-stats" element={<ProtectedRoute><TestHistory /></ProtectedRoute>} />
              <Route path="/mi-referral" element={<ProtectedRoute><MiReferral /></ProtectedRoute>} />
              <Route path="/recursos/:id" element={<ProtectedRoute><ResourceViewer /></ProtectedRoute>} />
              {/* 404 catch-all — must be last */}
              <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
  );
}