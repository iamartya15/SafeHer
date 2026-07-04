import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAvatarSrc } from '../utils/avatar';
import {
  LayoutDashboard,
  ShieldAlert,
  Map,
  PlusCircle,
  MapPin,
  Bot,
  User,
  HeartHandshake,
  ShieldPlus
} from 'lucide-react';

export const Sidebar = () => {
  const { user, activeWorkspace, setActiveWorkspace } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const allMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['user'] },
    { name: 'SOS Center', path: '/sos', icon: ShieldAlert, roles: ['user'] },
    { name: 'Safety Map', path: '/map', icon: Map, roles: ['user'] },
    { name: 'Report Incident', path: '/report-incident', icon: PlusCircle, roles: ['user'] },
    { name: 'Safe Places', path: '/nearby', icon: MapPin, roles: ['user'] },
    { name: 'AI Companion', path: '/ai', icon: Bot, roles: ['user'] },
    { name: 'Admin Dashboard', path: '/admin', icon: ShieldPlus, roles: ['admin'] },
    { name: 'Guardian Command Center', path: '/guardian', icon: HeartHandshake, roles: ['guardian', 'admin'] },
    { name: 'Profile Settings', path: '/profile', icon: User, roles: ['user', 'guardian', 'admin'] }
  ];

  const userRoles = user?.roles && user?.roles.length > 0 ? user.roles : [user?.role || 'user'];
  const hasMultipleWorkspaces = userRoles.length > 1;

  // Filter navigation items dynamically based on current active workspace
  const menuItems = allMenuItems.filter((item) => {
    // If it belongs to active workspace, show it
    if (item.roles.includes(activeWorkspace)) {
      // Admin dashboard is only for admin workspace
      if (item.path === '/admin' && activeWorkspace !== 'admin') return false;
      return true;
    }
    // In User workspace, show Guardian Command Center (labeled Guardian) only if user possesses guardian role
    if (activeWorkspace === 'user' && item.path === '/guardian') {
      return userRoles.includes('guardian');
    }
    return false;
  });

  return (
    <aside className="w-64 glass-card border-r border-white/5 min-h-[calc(100vh-57px)] hidden md:flex flex-col p-4 gap-6 select-none bg-slate-900/40 backdrop-blur-lg">
      
      {/* Profile Section */}
      <div className="flex items-center gap-3 p-2 bg-white/5 border border-white/5 rounded-xl">
        <img
          src={getAvatarSrc(user?.avatar, user?.name)}
          alt={user?.name}
          className="w-10 h-10 rounded-full object-cover border border-purple-500/30"
          onError={(e) => {
            e.target.src = getAvatarSrc('', user?.name);
          }}
        />
        <div className="overflow-hidden">
          <h4 className="text-sm font-bold text-white truncate">{user?.name}</h4>
          <span className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase block">
            {activeWorkspace === 'admin' ? 'Administrator' : activeWorkspace === 'guardian' ? 'Guardian' : 'SafeHer User'}
          </span>
        </div>
      </div>

      {/* Role / Workspace Switcher */}
      {hasMultipleWorkspaces && (
        <div className="space-y-1 px-1">
          <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Select Workspace</label>
          <select
            value={activeWorkspace}
            onChange={(e) => {
              const ws = e.target.value;
              setActiveWorkspace(ws);
              if (ws === 'user') navigate('/dashboard');
              else if (ws === 'guardian') navigate('/guardian');
              else if (ws === 'admin') navigate('/admin');
            }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-purple-500/50 cursor-pointer transition-colors"
          >
            {userRoles.includes('user') && <option value="user">User Dashboard</option>}
            {userRoles.includes('guardian') && <option value="guardian">Guardian Command</option>}
            {userRoles.includes('admin') && <option value="admin">Admin Dashboard</option>}
          </select>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex flex-col gap-1.5 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const displayName = (activeWorkspace === 'user' && item.path === '/guardian') ? 'Guardian Dashboard' : item.name;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 text-fuchsia-400 border-l-4 border-fuchsia-500 shadow-inner'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${
                isActive(item.path) ? 'text-fuchsia-400' : 'text-slate-400 group-hover:text-purple-400'
              }`} />
              <span>{displayName}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="text-[10px] text-slate-500 text-center font-medium">
        Version 1.0.0 (MVP)
      </div>
    </aside>
  );
};
export default Sidebar;
