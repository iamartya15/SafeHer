import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ComingSoon from './pages/ComingSoon';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Lazy load heavy dashboard components to significantly reduce the main bundle size
const Dashboard = lazy(() => import('./pages/Dashboard'));
const GuardianDashboard = lazy(() => import('./pages/GuardianDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ReportIncident = lazy(() => import('./pages/ReportIncident'));
const MapPage = lazy(() => import('./pages/MapPage'));
const SafePlaces = lazy(() => import('./pages/SafePlaces'));
const SosAlerts = lazy(() => import('./pages/SosAlerts'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));

const PageLoader = () => (
  <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center bg-slate-900/50">
    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
  </div>
);

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <NotificationProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Page Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
              <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
              <Route path="/coming-soon" element={<ComingSoon />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user']}><Suspense fallback={<PageLoader />}><Dashboard /></Suspense></ProtectedRoute>} />
              <Route path="/sos" element={<ProtectedRoute allowedRoles={['user']}><Suspense fallback={<PageLoader />}><SosAlerts /></Suspense></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute allowedRoles={['user']}><Suspense fallback={<PageLoader />}><MapPage /></Suspense></ProtectedRoute>} />
              <Route path="/report-incident" element={<ProtectedRoute allowedRoles={['user']}><Suspense fallback={<PageLoader />}><ReportIncident /></Suspense></ProtectedRoute>} />
              <Route path="/nearby" element={<ProtectedRoute allowedRoles={['user']}><Suspense fallback={<PageLoader />}><SafePlaces /></Suspense></ProtectedRoute>} />
              <Route path="/ai" element={<ProtectedRoute allowedRoles={['user']}><Suspense fallback={<PageLoader />}><AIAssistant /></Suspense></ProtectedRoute>} />
              <Route path="/guardian" element={<ProtectedRoute allowedRoles={['user', 'guardian', 'admin']}><Suspense fallback={<PageLoader />}><GuardianDashboard /></Suspense></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'guardian', 'admin']}><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute allowedRoles={['user', 'guardian', 'admin']}><Settings /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense></ProtectedRoute>} />
            </Route>

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'glass-card text-white border border-white/10 text-xs font-medium rounded-xl px-4 py-3',
            style: {
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(12px)'
            },
            success: {
              iconTheme: { primary: '#a855f7', secondary: '#ffffff' }
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#ffffff' }
            }
          }}
        />
          </NotificationProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;
