import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
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
  ShieldPlus,
  LogOut,
  Settings,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

const THEME_ICONS = { dark: Moon, light: Sun, system: Monitor };

export const Sidebar = () => {
  const { user, logout, activeWorkspace, setActiveWorkspace } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const allMenuItems = [
    { name: 'Dashboard',              path: '/dashboard',       icon: LayoutDashboard, roles: ['user'] },
    { name: 'SOS Center',             path: '/sos',             icon: ShieldAlert,     roles: ['user'] },
    { name: 'Safety Map',             path: '/map',             icon: Map,             roles: ['user'] },
    { name: 'Report Incident',        path: '/report-incident', icon: PlusCircle,      roles: ['user'] },
    { name: 'Safe Places',            path: '/nearby',          icon: MapPin,          roles: ['user'] },
    { name: 'AI Companion',           path: '/ai',              icon: Bot,             roles: ['user'] },
    { name: 'Admin Dashboard',        path: '/admin',           icon: ShieldPlus,      roles: ['admin'] },
    { name: 'Guardian Command Center',path: '/guardian',        icon: HeartHandshake,  roles: ['guardian', 'admin'] },
    { name: 'Profile Settings',       path: '/profile',         icon: User,            roles: ['user', 'guardian', 'admin'] },
    { name: 'Settings',               path: '/settings',        icon: Settings,        roles: ['user', 'guardian', 'admin'] },
  ];

  const userRoles = user?.roles?.length > 0 ? user.roles : [user?.role || 'user'];
  const hasMultipleWorkspaces = userRoles.length > 1;

  const menuItems = allMenuItems.filter((item) => {
    if (item.roles.includes(activeWorkspace)) {
      if (item.path === '/admin' && activeWorkspace !== 'admin') return false;
      return true;
    }
    if (activeWorkspace === 'user' && item.path === '/guardian') {
      return userRoles.includes('guardian');
    }
    return false;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const ThemeIcon = THEME_ICONS[theme] || Moon;

  return (
    <aside className="w-64 border-r min-h-[calc(100vh-57px)] hidden md:flex flex-col p-4 gap-4 select-none backdrop-blur-lg"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-muted)',
      }}
    >
      {/* Profile Section */}
      <div className="flex items-center gap-3 p-2 rounded-xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-muted)' }}
      >
        <img
          src={getAvatarSrc(user?.avatar, user?.name)}
          alt={user?.name || 'User avatar'}
          className="w-10 h-10 rounded-full object-cover border border-purple-500/30"
          onError={(e) => { e.target.src = getAvatarSrc('', user?.name); }}
        />
        <div className="overflow-hidden">
          <h4 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</h4>
          <span className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase block">
            {activeWorkspace === 'admin' ? 'Administrator' : activeWorkspace === 'guardian' ? 'Guardian' : 'SafeHer User'}
          </span>
        </div>
      </div>

      {/* Role / Workspace Switcher */}
      {hasMultipleWorkspaces && (
        <div className="space-y-1 px-1">
          <label className="text-[9px] font-extrabold uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
            Select Workspace
          </label>
          <select
            value={activeWorkspace}
            onChange={(e) => {
              const ws = e.target.value;
              setActiveWorkspace(ws);
              if (ws === 'user') navigate('/dashboard');
              else if (ws === 'guardian') navigate('/guardian');
              else if (ws === 'admin') navigate('/admin');
            }}
            className="w-full rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-purple-500/50 cursor-pointer transition-colors"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            {userRoles.includes('user')     && <option value="user">User Dashboard</option>}
            {userRoles.includes('guardian') && <option value="guardian">Guardian Command</option>}
            {userRoles.includes('admin')    && <option value="admin">Admin Dashboard</option>}
          </select>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex flex-col gap-1 flex-1" aria-label="Sidebar navigation">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const displayName = (activeWorkspace === 'user' && item.path === '/guardian') ? 'Guardian Dashboard' : item.name;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 text-fuchsia-400 border-l-4 border-fuchsia-500 shadow-inner'
                  : 'hover:bg-white/5'
              }`}
              style={{ color: active ? undefined : 'var(--text-secondary)' }}
            >
              <Icon className={`w-4 h-4 transition-colors ${active ? 'text-fuchsia-400' : 'group-hover:text-purple-400'}`} />
              <span>{displayName}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="space-y-1 pt-2 border-t" style={{ borderColor: 'var(--border-muted)' }}>
        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
          style={{ color: 'var(--text-secondary)' }}
          title={`Theme: ${theme} (click to cycle)`}
        >
          <ThemeIcon className="w-4 h-4" />
          <span className="capitalize">{theme === 'system' ? 'System Theme' : `${theme.charAt(0).toUpperCase() + theme.slice(1)} Mode`}</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-red-950/20 text-red-400 hover:text-red-300"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
