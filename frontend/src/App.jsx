import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

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
import Dashboard from './pages/Dashboard';
import GuardianDashboard from './pages/GuardianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReportIncident from './pages/ReportIncident';
import MapPage from './pages/MapPage';
import SafePlaces from './pages/SafePlaces';
import SosAlerts from './pages/SosAlerts';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';
import ComingSoon from './pages/ComingSoon';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
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
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user']}><Dashboard /></ProtectedRoute>} />
            <Route path="/sos" element={<ProtectedRoute allowedRoles={['user']}><SosAlerts /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute allowedRoles={['user']}><MapPage /></ProtectedRoute>} />
            <Route path="/report-incident" element={<ProtectedRoute allowedRoles={['user']}><ReportIncident /></ProtectedRoute>} />
            <Route path="/nearby" element={<ProtectedRoute allowedRoles={['user']}><SafePlaces /></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute allowedRoles={['user']}><AIAssistant /></ProtectedRoute>} />
            <Route path="/guardian" element={<ProtectedRoute allowedRoles={['user', 'guardian']}><GuardianDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'guardian', 'admin']}><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
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
            iconTheme: {
              primary: '#a855f7',
              secondary: '#ffffff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff'
            }
          }
        }}
      />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
