import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  HeartHandshake,
  ShieldPlus,
  ChevronDown,
  Settings,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import * as chatService from '../services/chatService';
import { getAvatarSrc } from '../utils/avatar';
import { formatTime } from '../utils/dateFormatter';

/* ────────────────────────────────────────────────────────────────────────
   Theme Toggle — professional animated toggle beside the notification bell
   ──────────────────────────────────────────────────────────────────────── */
const THEME_ORDER = ['dark', 'light', 'system'];
const THEME_META = {
  dark:   { icon: Moon,    tip: 'Dark mode'   },
  light:  { icon: Sun,     tip: 'Light mode'  },
  system: { icon: Monitor, tip: 'System theme' },
};

const ThemeToggleButton = ({ theme, cycleTheme }) => {
  const meta = THEME_META[theme] || THEME_META.dark;
  const Icon = meta.icon;
  return (
    <button
      onClick={cycleTheme}
      className="relative p-2 rounded-full transition-all duration-300 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
      style={{
        color: theme === 'dark' ? '#c084fc' : theme === 'light' ? '#f59e0b' : '#38bdf8',
        backgroundColor: 'var(--hover-bg)'
      }}
      aria-label={meta.tip}
      title={meta.tip}
    >
      <span key={theme} className="theme-icon-enter inline-flex items-center justify-center">
        <Icon className="w-[18px] h-[18px]" />
      </span>
    </button>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   Navbar
   ──────────────────────────────────────────────────────────────────────── */
export const Navbar = () => {
  const { user, logout, isAuthenticated, activeWorkspace, setActiveWorkspace } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const profileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Close drawers on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (mobileMenuOpen) { setMobileMenuOpen(false); hamburgerRef.current?.focus(); }
      if (showNotifications) setShowNotifications(false);
      if (showProfileMenu) setShowProfileMenu(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen, showNotifications, showProfileMenu]);

  // Outside click
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowNotifications(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const pendingUpdateRef = useRef(false);

  // ─── Notifications ───────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await chatService.getNotifications();
      if (res.success && !pendingUpdateRef.current) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    let interval = setInterval(fetchNotifications, 15000);
    const onVis = () => {
      if (document.hidden) clearInterval(interval);
      else { fetchNotifications(); interval = setInterval(fetchNotifications, 15000); }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVis); };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggleNotifications = async () => {
    const willOpen = !showNotifications;
    setShowNotifications(willOpen);
    setShowProfileMenu(false);
    if (willOpen && unreadCount > 0) {
      pendingUpdateRef.current = true;
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      try { await chatService.markAllNotificationsRead(); }
      catch (err) { console.error('Failed to auto-mark read:', err); }
      finally {
        setTimeout(() => { pendingUpdateRef.current = false; fetchNotifications(); }, 500);
      }
    }
  };

  const handleMarkAllRead = async () => {
    pendingUpdateRef.current = true;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try { await chatService.markAllNotificationsRead(); }
    catch (err) { console.error('Failed to mark all read:', err); }
    finally {
      setTimeout(() => { pendingUpdateRef.current = false; fetchNotifications(); }, 500);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        pendingUpdateRef.current = true;
        setNotifications((prev) => prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n)));
        await chatService.markNotificationRead(notif._id);
        setTimeout(() => { pendingUpdateRef.current = false; fetchNotifications(); }, 500);
      }
      setShowNotifications(false);
      setMobileMenuOpen(false);
      if (notif.type === 'guardian_request') navigate('/guardian');
      else if (notif.type === 'sos') navigate(user?.role === 'guardian' ? '/guardian' : '/dashboard');
    } catch (err) {
      console.error('Failed to process notification:', err);
    }
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const userRoles = user?.roles?.length > 0 ? user.roles : [user?.role || 'user'];

  const allNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard',              path: '/dashboard',       protected: true, roles: ['user'] },
    { name: 'SOS Center',             path: '/sos',             protected: true, roles: ['user'] },
    { name: 'Safety Map',             path: '/map',             protected: true, roles: ['user'] },
    { name: 'Report Incident',        path: '/report-incident', protected: true, roles: ['user'] },
    { name: 'Nearby Places',          path: '/nearby',          protected: true, roles: ['user'] },
    { name: 'AI Companion',           path: '/ai',              protected: true, roles: ['user'] },
    { name: 'Admin Dashboard',        path: '/admin',           protected: true, roles: ['admin'] },
    { name: 'Guardian Command Center',path: '/guardian',        protected: true, roles: ['guardian', 'admin'] },
  ];

  const navLinks = allNavLinks.filter((link) => {
    if (!link.protected) return true;
    if (!isAuthenticated) return false;
    if (!link.roles) return true;
    if (link.roles.includes(activeWorkspace)) {
      if (link.path === '/admin' && activeWorkspace !== 'admin') return false;
      return true;
    }
    if (activeWorkspace === 'user' && link.path === '/guardian') return userRoles.includes('guardian');
    return false;
  });

  // ─── Notification List (shared) ─────────────────────────────────
  const NotificationList = () => (
    <>
      <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
        <span className="text-xs font-semibold text-purple-500">Notifications</span>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-[10px] hover:underline" style={{ color: 'var(--text-muted)' }}>
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto overscroll-contain">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
            <Bell className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>No notifications yet.</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Guardian requests and SOS alerts will appear here.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notif)}
              className="p-3 cursor-pointer transition-colors"
              style={{
                borderBottom: '1px solid var(--border-muted)',
                backgroundColor: !notif.read ? 'rgba(168, 85, 247, 0.06)' : 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = !notif.read ? 'rgba(168, 85, 247, 0.06)' : 'transparent'; }}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium" style={{ color: !notif.read ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{notif.title}</span>
                <span className="text-[9px] ml-2 shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {formatTime(notif.createdAt)}
                </span>
              </div>
              <p className="text-[11px] mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{notif.message}</p>
            </div>
          ))
        )}
      </div>
    </>
  );

  // ─── Mobile Drawer ──────────────────────────────────────────────
  const MobileDrawer = () =>
    createPortal(
      <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999]" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
        <div
          className="fixed top-0 right-0 h-full w-[min(320px,100vw)] z-[1000] shadow-2xl flex flex-col"
          style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-color)', animation: 'slideInRight 0.25s ease-out forwards' }}
          role="dialog" aria-modal="true" aria-label="Navigation menu"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-fuchsia-500" />
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>SafeHer AI</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full transition-colors" style={{ color: 'var(--text-secondary)' }} aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          {isAuthenticated && user && (
            <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-muted)' }}>
              <img src={getAvatarSrc(user.avatar, user.name)} alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-purple-500/30"
                onError={(e) => { e.target.src = getAvatarSrc('', user.name); }}
              />
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
              </div>
            </div>
          )}

          {/* Workspace switcher */}
          {isAuthenticated && userRoles.length > 1 && (
            <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-muted)' }}>
              <label className="text-[9px] font-extrabold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Workspace</label>
              <select
                value={activeWorkspace}
                onChange={(e) => { const ws = e.target.value; setActiveWorkspace(ws); setMobileMenuOpen(false); navigate(ws === 'admin' ? '/admin' : ws === 'guardian' ? '/guardian' : '/dashboard'); }}
                className="w-full rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
              >
                {userRoles.includes('user') && <option value="user">User Dashboard</option>}
                {userRoles.includes('guardian') && <option value="guardian">Guardian Command</option>}
                {userRoles.includes('admin') && <option value="admin">Admin Dashboard</option>}
              </select>
            </div>
          )}

          {/* Links */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const displayName = (activeWorkspace === 'user' && link.path === '/guardian') ? 'Guardian Dashboard' : link.name;
                const active = isActive(link.path);
                return (
                  <Link key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'text-fuchsia-400' : ''}`}
                    style={{
                      color: active ? undefined : 'var(--text-secondary)',
                      backgroundColor: active ? 'rgba(168, 85, 247, 0.12)' : undefined,
                      border: active ? '1px solid rgba(168, 85, 247, 0.2)' : undefined,
                    }}
                  >{displayName}</Link>
                );
              })}
              {isAuthenticated && (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: 'var(--text-secondary)' }}>Profile Settings</Link>
                  <Link to="/settings" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: 'var(--text-secondary)' }}>Settings</Link>
                </>
              )}
            </nav>
            {!isAuthenticated && (
              <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary w-full text-center text-sm py-2.5 block">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-center text-sm py-2.5 block">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Footer */}
          {isAuthenticated && (
            <div className="px-3 py-3 space-y-1" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => cycleTheme()}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {(() => {
                  const meta = THEME_META[theme] || THEME_META.dark;
                  const Icon = meta.icon;
                  return <Icon className="w-5 h-5 shrink-0" style={{ color: theme === 'dark' ? '#c084fc' : theme === 'light' ? '#f59e0b' : '#38bdf8' }} />;
                })()}
                <span>{THEME_META[theme]?.tip}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-500 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </>,
      document.body
    );

  return (
    <>
      <nav className="sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between"
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-muted)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent shrink-0">
          <Shield className="w-6 h-6 text-fuchsia-500 fill-fuchsia-500/10 shrink-0" />
          <span>
            SafeHer{' '}
            <span className="font-extrabold text-sm px-1.5 py-0.5 rounded bg-purple-600/30 border border-purple-500/30 text-purple-300">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path}
              aria-current={isActive(link.path) ? 'page' : undefined}
              className={`text-sm font-medium transition-colors hover:text-purple-400 ${isActive(link.path) ? 'text-fuchsia-400 font-semibold' : ''}`}
              style={{ color: isActive(link.path) ? undefined : 'var(--text-secondary)' }}
            >{link.name}</Link>
          ))}
        </div>

        {/* Desktop Right: [ Bell ] [ Theme ] [ Profile ] */}
        <div className="hidden lg:flex items-center gap-1">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={dropdownRef}>
                <button onClick={handleToggleNotifications}
                  className="p-2 rounded-full transition-colors relative"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 rounded-full text-[9px] font-bold flex items-center justify-center text-white animate-pulse" style={{ color: '#fff' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 rounded-xl overflow-hidden shadow-2xl z-50"
                    style={{ background: 'var(--dropdown-bg)', border: '1px solid var(--border-color)' }}>
                    <NotificationList />
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <ThemeToggleButton theme={theme} cycleTheme={cycleTheme} />

              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                  className="flex items-center gap-2 focus:outline-none pl-2"
                  style={{ borderLeft: '1px solid var(--border-muted)' }}
                  aria-label="Profile menu" aria-expanded={showProfileMenu}
                >
                  <img src={getAvatarSrc(user.avatar, user.name)} alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-purple-500/30 hover:border-purple-500/70 transition-colors"
                    onError={(e) => { e.target.src = getAvatarSrc('', user.name); }}
                  />
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl overflow-hidden shadow-2xl z-50 py-1.5"
                    style={{ background: 'var(--dropdown-bg)', border: '1px solid var(--border-color)' }}>
                    <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-muted)' }}>
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                      <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                    </div>

                    <Link to="/profile" onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
                      style={{ color: 'var(--text-secondary)' }}>
                      <User className="w-4 h-4 text-purple-400" /> Profile Settings
                    </Link>
                    <Link to="/settings" onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
                      style={{ color: 'var(--text-secondary)' }}>
                      <Settings className="w-4 h-4 text-purple-400" /> Settings
                    </Link>

                    {userRoles.includes('guardian') && (
                      <button onClick={() => { const t = activeWorkspace === 'guardian' ? 'user' : 'guardian'; setActiveWorkspace(t); setShowProfileMenu(false); navigate(t === 'user' ? '/dashboard' : '/guardian'); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs transition-colors"
                        style={{ color: 'var(--text-secondary)' }}>
                        <HeartHandshake className="w-4 h-4 text-purple-400" />
                        Switch to {activeWorkspace === 'guardian' ? 'User' : 'Guardian'} Workspace
                      </button>
                    )}

                    {userRoles.includes('admin') && activeWorkspace !== 'admin' && (
                      <Link to="/admin" onClick={() => { setActiveWorkspace('admin'); setShowProfileMenu(false); }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
                        style={{ color: 'var(--text-secondary)' }}>
                        <ShieldPlus className="w-4 h-4 text-fuchsia-400" /> Admin Dashboard
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-muted)', margin: '4px 0' }} />

                    <button onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs text-red-500 hover:text-red-400 transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Theme toggle for unauthenticated users too */}
              <ThemeToggleButton theme={theme} cycleTheme={cycleTheme} />
              <Link to="/login" className="text-sm font-medium px-4 py-2 hover:text-purple-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>Login</Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-xs font-semibold">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile: Theme + Bell + Hamburger */}
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggleButton theme={theme} cycleTheme={cycleTheme} />
          {isAuthenticated && (
            <button onClick={() => { setShowNotifications(!showNotifications); setMobileMenuOpen(false); }}
              className="p-2 rounded-full transition-colors relative"
              aria-label="Notifications" style={{ color: 'var(--text-secondary)' }}>
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-600 rounded-full text-[8px] font-bold flex items-center justify-center" style={{ color: '#fff' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
          <button ref={hamburgerRef} onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setShowNotifications(false); }}
            className="p-2 rounded-full transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            style={{ color: 'var(--text-secondary)' }}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Notification Panel */}
      {showNotifications && (
        <div className="lg:hidden fixed top-[57px] left-3 right-3 rounded-xl overflow-hidden shadow-2xl z-[998]"
          style={{ background: 'var(--dropdown-bg)', border: '1px solid var(--border-color)' }}>
          <NotificationList />
        </div>
      )}

      {mobileMenuOpen && <MobileDrawer />}
    </>
  );
};

export default Navbar;
