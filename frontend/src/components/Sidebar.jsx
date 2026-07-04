import { Link, useLocation } from 'react-router-dom';
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
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'SOS Center', path: '/sos', icon: ShieldAlert },
    { name: 'Safety Map', path: '/map', icon: Map },
    { name: 'Report Incident', path: '/report-incident', icon: PlusCircle },
    { name: 'Safe Places', path: '/nearby', icon: MapPin },
    { name: 'AI Companion', path: '/ai', icon: Bot },
    { name: 'Guardian Dashboard', path: '/guardian', icon: HeartHandshake },
    { name: 'Profile Settings', path: '/profile', icon: User }
  ];

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
            {user?.role === 'admin' ? 'Administrator' : user?.role === 'guardian' ? 'Guardian' : 'SafeHer User'}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex flex-col gap-1.5 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
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
              <span>{item.name}</span>
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group mt-4 border border-dashed ${
              isActive('/admin')
                ? 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500'
                : 'text-slate-400 border-slate-700/50 hover:bg-fuchsia-500/5 hover:text-fuchsia-400 hover:border-fuchsia-500/50'
            }`}
          >
            <ShieldPlus className="w-4 h-4 text-fuchsia-400" />
            <span>Admin Center</span>
          </Link>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-[10px] text-slate-500 text-center font-medium">
        Version 1.0.0 (MVP)
      </div>
    </aside>
  );
};
export default Sidebar;
