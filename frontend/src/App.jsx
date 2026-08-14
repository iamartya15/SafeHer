import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/i18nContext';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Core Public Pages (Instant Bundle Entry)
import Home from './pages/Home';
import GuestSOS from './pages/GuestSOS';
import Login from './pages/Login';
import Register from './pages/Register';

import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Global Floating SOS Component
import FloatingSOSButton from './components/FloatingSOSButton';

// Lazy Loaded Secondary Public & Legal Pages (Code-Split for minimal bundle size)
const MissingDashboard = lazy(() => import('./pages/MissingDashboard'));
const Reports = lazy(() => import('./pages/Reports'));
const Awareness = lazy(() => import('./pages/Awareness'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Accessibility = lazy(() => import('./pages/Accessibility'));
const Security = lazy(() => import('./pages/Security'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));

// Lazy Loaded Heavy Dashboard Components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const GuardianDashboard = lazy(() => import('./pages/GuardianDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ReportIncident = lazy(() => import('./pages/ReportIncident'));
const MapPage = lazy(() => import('./pages/MapPage'));
const SafePlaces = lazy(() => import('./pages/SafePlaces'));
const SosAlerts = lazy(() => import('./pages/SosAlerts'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

const PageLoader = () => (
  <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center bg-slate-900/50">
    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
  </div>
);

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  return (
    <ThemeProvider>
      <LanguageProvider>
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <NotificationProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                  {/* Public Page Routes */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/guest-sos" element={<GuestSOS />} />
                    
                    {/* Lazy-loaded Legal & Info Routes */}
                    <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
                    <Route path="/terms" element={<Suspense fallback={<PageLoader />}><TermsOfService /></Suspense>} />
                    <Route path="/about" element={<Suspense fallback={<PageLoader />}><AboutUs /></Suspense>} />
                    <Route path="/accessibility" element={<Suspense fallback={<PageLoader />}><Accessibility /></Suspense>} />
                    <Route path="/security" element={<Suspense fallback={<PageLoader />}><Security /></Suspense>} />
                    <Route path="/missing-women" element={<Suspense fallback={<PageLoader />}><MissingDashboard /></Suspense>} />
                    <Route path="/reports" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
                    <Route path="/awareness" element={<Suspense fallback={<PageLoader />}><Awareness /></Suspense>} />
                    <Route path="/coming-soon" element={<Suspense fallback={<PageLoader />}><ComingSoon /></Suspense>} />

                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/forgot-password" element={<PublicRoute><Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense></PublicRoute>} />
                    <Route path="/reset-password" element={<PublicRoute><Suspense fallback={<PageLoader />}><ResetPassword /></Suspense></PublicRoute>} />
                    <Route path="/verify-email" element={<PublicRoute><Suspense fallback={<PageLoader />}><VerifyEmail /></Suspense></PublicRoute>} />
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
                    <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'guardian', 'admin']}><Suspense fallback={<PageLoader />}><Profile /></Suspense></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute allowedRoles={['user', 'guardian', 'admin']}><Suspense fallback={<PageLoader />}><Settings /></Suspense></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense></ProtectedRoute>} />
                  </Route>

                  {/* Fallback redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* Global Persistent Floating Emergency Button */}
                <FloatingSOSButton />

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
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
