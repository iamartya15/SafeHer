import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export const DashboardLayout = () => {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1 relative overflow-x-hidden">
          {/* Dashboard Navigation Sidebar */}
          <Sidebar />
          
          {/* Dashboard Content Container */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden bg-slate-950/40 backdrop-blur-md min-h-[calc(100vh-64px)] fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};
export default DashboardLayout;
