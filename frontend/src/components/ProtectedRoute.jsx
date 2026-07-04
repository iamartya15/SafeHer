import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
    // Redirect to login, saving the state of the attempted navigation URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role-based authorization is configured
  const userRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role || 'user'];
  const hasAllowedRole = allowedRoles.some(role => userRoles.includes(role));
  if (allowedRoles.length > 0 && !hasAllowedRole) {
    // Redirect back to allowed pages if user has invalid permissions
    const fallbackPath = userRoles.includes('admin') ? '/admin' : userRoles.includes('guardian') ? '/guardian' : '/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};
export default ProtectedRoute;
