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

const THEME_ICONS = { dark: Moon, light: Sun, system: Monitor };
const THEME_LABELS = { dark: 'Dark Mode', light: 'Light Mode', system: 'System' };

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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Keyboard Escape closes dropdowns
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

  // Outside click — close notification and profile dropdowns
  useEffect(() => {
    const onMousedown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowNotifications(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', onMousedown);
    return () => document.removeEventListener('mousedown', onMousedown);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await chatService.getNotifications();
      if (res.success) setNotifications(res.notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [isAuthenticated]);

  // Visibility-aware polling (pauses when tab is hidden)
  useEffect(() => {
    fetchNotifications();
    let interval = setInterval(fetchNotifications, 15000);
    const onVisibility = () => {
      if (document.hidden) { clearInterval(interval); }
      else { fetchNotifications(); interval = setInterval(fetchNotifications, 15000); }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisibility); };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Auto mark-all-read when notification panel is opened ──────────────────
  const handleToggleNotifications = async () => {
    const willOpen = !showNotifications;
    setShowNotifications(willOpen);
    setShowProfileMenu(false);
    if (willOpen && unreadCount > 0) {
      // Optimistic update first, then call API
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      try {
        await chatService.markAllNotificationsRead();
      } catch (err) {
        console.error('Failed to auto-mark notifications read:', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try { await chatService.markAllNotificationsRead(); }
    catch (err) { console.error('Failed to mark all read:', err); }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await chatService.markNotificationRead(notif._id);
        setNotifications((prev) => prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n)));
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

  // ── Notification list (shared desktop + mobile) ───────────────────────────
  const NotificationList = () => (
    <>
      <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-slate-900">
        <span className="text-xs font-semibold text-purple-400">Notifications</span>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-[10px] text-slate-400 hover:text-white hover:underline">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto overscroll-contain">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
            <Bell className="w-6 h-6 text-slate-600" />
            <p className="text-xs font-medium text-slate-500">No notifications yet.</p>
            <p className="text-[10px] text-slate-600">Guardian requests and SOS alerts will appear here.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notif)}
              className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!notif.read ? 'bg-purple-500/5' : ''}`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs font-medium ${!notif.read ? 'text-white' : 'text-slate-300'}`}>{notif.title}</span>
                <span className="text-[9px] text-slate-500 ml-2 shrink-0">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
            </div>
          ))
        )}
      </div>
    </>
  );

  // ── Mobile Drawer (Portal) ────────────────────────────────────────────────
  const MobileDrawer = () =>
    createPortal(
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999]"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
        {/* Drawer Panel */}
        <div
          className="fixed top-0 right-0 h-full w-[min(320px,100vw)] z-[1000] border-l border-white/10 shadow-2xl flex flex-col"
          style={{ background: 'var(--bg-surface)', animation: 'slideInRight 0.25s ease-out forwards' }}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-fuchsia-500" />
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>SafeHer AI</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* User info */}
          {isAuthenticated && user && (
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3">
              <img
                src={getAvatarSrc(user.avatar, user.name)}
                alt={user.name}
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
            <div className="px-5 py-3 border-b border-white/5">
              <label className="text-[9px] font-extrabold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Workspace
              </label>
              <select
                value={activeWorkspace}
                onChange={(e) => {
                  const ws = e.target.value;
                  setActiveWorkspace(ws);
                  setMobileMenuOpen(false);
                  if (ws === 'user') navigate('/dashboard');
                  else if (ws === 'guardian') navigate('/guardian');
                  else if (ws === 'admin') navigate('/admin');
                }}
                className="w-full rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              >
                {userRoles.includes('user')     && <option value="user">User Dashboard</option>}
                {userRoles.includes('guardian') && <option value="guardian">Guardian Command</option>}
                {userRoles.includes('admin')    && <option value="admin">Admin Dashboard</option>}
              </select>
            </div>
          )}

          {/* Nav links */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const displayName = (activeWorkspace === 'user' && link.path === '/guardian') ? 'Guardian Dashboard' : link.name;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive(link.path) ? 'page' : undefined}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-purple-600/20 text-fuchsia-400 border border-purple-500/20'
                        : 'hover:bg-white/5'
                    }`}
                    style={{ color: isActive(link.path) ? undefined : 'var(--text-secondary)' }}
                  >
                    {displayName}
                  </Link>
                );
              })}

              {/* Extra links for authenticated users */}
              {isAuthenticated && (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Settings
                  </Link>
                </>
              )}
            </nav>

            {!isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary w-full text-center text-sm py-2.5 block">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-center text-sm py-2.5 block">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {isAuthenticated && (
            <div className="px-3 py-3 border-t border-white/10 space-y-1">
              <button
                onClick={cycleTheme}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'light' ? <Sun className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                {THEME_LABELS[theme]}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Logout
              </button>
            </div>
          )}
        </div>
      </>,
      document.body
    );

  const ThemeIcon = THEME_ICONS[theme] || Moon;

  return (
    <>
      <nav className="sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between border-b shadow-lg"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-muted)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent shrink-0">
          <Shield className="w-6 h-6 text-fuchsia-500 fill-fuchsia-500/10 shrink-0" />
          <span>
            SafeHer{' '}
            <span className="text-white font-extrabold text-sm px-1.5 py-0.5 rounded bg-purple-600/30 border border-purple-500/30">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              aria-current={isActive(link.path) ? 'page' : undefined}
              className={`text-sm font-medium transition-colors hover:text-purple-400 ${isActive(link.path) ? 'text-fuchsia-400 font-semibold' : ''}`}
              style={{ color: isActive(link.path) ? undefined : 'var(--text-secondary)' }}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleToggleNotifications}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors relative"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] font-bold flex items-center justify-center text-white border border-slate-900">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 rounded-xl overflow-hidden border border-white/10 shadow-2xl z-50 bg-slate-900">
                    <NotificationList />
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                  className="flex items-center gap-2 focus:outline-none pl-2 border-l border-white/10"
                  aria-label="Profile menu"
                  aria-expanded={showProfileMenu}
                >
                  <img
                    src={getAvatarSrc(user.avatar, user.name)}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-purple-500/30 hover:border-purple-500/70 transition-colors"
                    onError={(e) => { e.target.src = getAvatarSrc('', user.name); }}
                  />
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl overflow-hidden border border-white/10 shadow-2xl z-50 bg-slate-900 py-1.5">
                    {/* User info */}
                    <div className="px-4 py-2.5 border-b border-white/5">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      Profile Settings
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4 text-purple-400" />
                      Settings
                    </Link>

                    {/* Theme cycle */}
                    <button
                      onClick={() => { cycleTheme(); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <ThemeIcon className="w-4 h-4 text-purple-400" />
                      {THEME_LABELS[theme]}
                    </button>

                    {/* Guardian workspace */}
                    {userRoles.includes('guardian') && (
                      <button
                        onClick={() => {
                          const target = activeWorkspace === 'guardian' ? 'user' : 'guardian';
                          setActiveWorkspace(target);
                          setShowProfileMenu(false);
                          navigate(target === 'user' ? '/dashboard' : '/guardian');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <HeartHandshake className="w-4 h-4 text-purple-400" />
                        Switch to {activeWorkspace === 'guardian' ? 'User Workspace' : 'Guardian Workspace'}
                      </button>
                    )}

                    {/* Admin link */}
                    {userRoles.includes('admin') && activeWorkspace !== 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => { setActiveWorkspace('admin'); setShowProfileMenu(false); }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <ShieldPlus className="w-4 h-4 text-fuchsia-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-white/5 my-1" />

                    <button
                      onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium px-4 py-2 hover:text-purple-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>Login</Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-xs font-semibold">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile: Bell + Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          {isAuthenticated && (
            <button
              onClick={() => { setShowNotifications(!showNotifications); setMobileMenuOpen(false); }}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors relative"
              aria-label="Notifications"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-600 rounded-full text-[8px] font-bold flex items-center justify-center text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
          <button
            ref={hamburgerRef}
            onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setShowNotifications(false); }}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            style={{ color: 'var(--text-secondary)' }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Notification Dropdown */}
      {showNotifications && (
        <div className="lg:hidden fixed top-[57px] left-3 right-3 rounded-xl overflow-hidden border border-white/10 shadow-2xl z-[998] bg-slate-900">
          <NotificationList />
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && <MobileDrawer />}
    </>
  );
};

export default Navbar;
