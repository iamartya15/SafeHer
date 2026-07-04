import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

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

  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
