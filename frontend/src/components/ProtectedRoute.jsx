import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, LogIn, PhoneCall, Lock } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-slate-800 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-b-fuchsia-500 border-slate-800 animate-pulse"></div>
        </div>
        <p className="mt-4 text-purple-400 font-medium animate-pulse text-sm">Verifying Session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // If user attempted to access SOS or Map while unauthenticated, show helpful prompt with Guest SOS option
    const isEmergencyRoute = location.pathname.includes('/sos') || location.pathname.includes('/map');

    if (isEmergencyRoute) {
      return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
          <div className="glass-card rounded-3xl p-8 max-w-md w-full border border-red-500/30 bg-slate-900/90 text-center space-y-6 shadow-2xl">
            <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Sign In Required for Cloud Sync</h2>
              <p className="text-slate-300 text-xs leading-relaxed">
                Full guardian tracking and saved safety routes require signing in to your account.
              </p>
            </div>

            {/* Emergency Guest SOS Callout */}
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-left space-y-3">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                In an Immediate Emergency?
              </span>
              <p className="text-[11px] text-slate-300">
                You can dial 112 directly or share your live GPS location instantly without an account.
              </p>
              <Link
                to="/guest-sos"
                className="btn-primary bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 w-full"
              >
                <PhoneCall className="w-4 h-4" /> Launch Guest SOS Mode (No Login)
              </Link>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link
                to="/login"
                state={{ from: location }}
                className="btn-secondary py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Sign In to Your Account
              </Link>
              <Link to="/register" className="text-xs text-purple-400 font-semibold hover:underline">
                Don't have an account? Register free
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role-based authorization is configured
  const userRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role || 'user'];
  const hasAllowedRole = allowedRoles.some(role => userRoles.includes(role));
  if (allowedRoles.length > 0 && !hasAllowedRole) {
    const fallbackPath = userRoles.includes('admin') ? '/admin' : userRoles.includes('guardian') ? '/guardian' : '/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
