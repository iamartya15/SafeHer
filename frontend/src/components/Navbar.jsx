import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/i18nContext';
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
  Monitor,
  PhoneCall,
  Languages
} from 'lucide-react';

import { getAvatarSrc } from '../utils/avatar';
import { formatTime } from '../utils/dateFormatter';

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

export const Navbar = () => {
  const { user, logout, isAuthenticated, activeWorkspace, setActiveWorkspace } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const { language, toggleLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const dropdownRef = useRef(null);
  const profileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
    setShowMoreMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (mobileMenuOpen) { setMobileMenuOpen(false); hamburgerRef.current?.focus(); }
      if (showNotifications) setShowNotifications(false);
      if (showProfileMenu) setShowProfileMenu(false);
      if (showMoreMenu) setShowMoreMenu(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen, showNotifications, showProfileMenu, showMoreMenu]);

  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowNotifications(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setShowProfileMenu(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await markRead(notif._id);
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

  const primaryLinks = [
    { name: t('navHome'), path: '/' },
    { name: t('navSafetyMap'), path: '/map' },
    { name: t('navAwareness'), path: '/awareness' },
  ];

  const moreLinks = [
    { name: t('navGuestSos'), path: '/guest-sos' },
    { name: t('navMissing'), path: '/missing-women' },
    { name: t('navReports'), path: '/reports' },
    { name: 'Nearby Places', path: '/nearby', protected: true, roles: ['user'] },
    { name: 'Report Incident', path: '/report-incident', protected: true, roles: ['user'] },
    { name: 'SOS Center', path: '/sos', protected: true, roles: ['user'] },
    { name: 'AI Companion', path: '/ai', protected: true, roles: ['user'] },
  ];

  const adminGuardianLinks = [
    { name: 'Admin Dashboard', path: '/admin', protected: true, roles: ['admin'] },
    { name: 'Guardian Command Center', path: '/guardian', protected: true, roles: ['guardian', 'admin'] },
  ];

  const filterLinks = (links) => links.filter((link) => {
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

  const filteredPrimary = filterLinks(primaryLinks);
  const filteredMore = filterLinks(moreLinks);
  const filteredAdmin = filterLinks(adminGuardianLinks);

  const renderNotificationList = () => (
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

  const renderMobileDrawer = () => (
    createPortal(
      <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999]" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
        <div
          className="fixed top-0 right-0 h-full w-[min(320px,100vw)] z-[1000] shadow-2xl flex flex-col"
          style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-color)' }}
          role="dialog" aria-modal="true" aria-label="Navigation menu"
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-fuchsia-500" />
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>SafeHer AI</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full transition-colors" style={{ color: 'var(--text-secondary)' }} aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Language</span>
            <button
              onClick={() => toggleLanguage()}
              className="px-3 py-1 bg-purple-500/20 text-purple-300 font-bold text-xs rounded-lg border border-purple-500/30 flex items-center gap-1.5"
            >
              <Languages className="w-3.5 h-3.5" /> {language === 'en' ? 'हिन्दी' : 'English'}
            </button>
          </div>

          <div className="px-5 py-3 border-b border-white/10">
            <Link
              to="/guest-sos"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 w-full shadow-lg"
            >
              <PhoneCall className="w-4 h-4" /> Guest SOS (No Login)
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            <nav className="space-y-1">
              {[...filteredPrimary, ...(isAuthenticated ? [{name: 'Dashboard', path: '/dashboard'}] : []), ...filteredMore, ...filteredAdmin].map((link) => {
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
            </nav>
            {!isAuthenticated && (
              <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary w-full text-center text-sm py-2.5 block">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-center text-sm py-2.5 block">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </>,
      document.body
    )
  );

  return (
    <>
      <nav className="sticky top-0 z-40 px-4 md:px-8 py-3 flex items-center justify-between backdrop-blur-md border-b border-white/10 bg-slate-950/80">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent shrink-0">
          <Shield className="w-6 h-6 text-fuchsia-500 fill-fuchsia-500/10 shrink-0" />
          <span>
            SafeHer{' '}
            <span className="font-extrabold text-sm px-1.5 py-0.5 rounded bg-purple-600/30 border border-purple-500/30 text-purple-300">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6 lg:ml-8">
          {filteredPrimary.map((link) => (
            <Link key={link.name} to={link.path}
              aria-current={isActive(link.path) ? 'page' : undefined}
              className={`text-sm font-medium transition-colors hover:text-purple-400 ${isActive(link.path) ? 'text-fuchsia-400 font-semibold' : ''}`}
              style={{ color: isActive(link.path) ? undefined : 'var(--text-secondary)' }}
            >{link.name}</Link>
          ))}
          {isAuthenticated && (
            <Link to="/dashboard"
              aria-current={isActive('/dashboard') ? 'page' : undefined}
              className={`text-sm font-medium transition-colors hover:text-purple-400 ${isActive('/dashboard') ? 'text-fuchsia-400 font-semibold' : ''}`}
              style={{ color: isActive('/dashboard') ? undefined : 'var(--text-secondary)' }}
            >Dashboard</Link>
          )}

          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-purple-400 focus:outline-none"
              style={{ color: 'var(--text-secondary)' }}
              aria-expanded={showMoreMenu}
            >
              More <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showMoreMenu && (
              <div className="absolute top-full left-0 mt-4 w-48 rounded-xl overflow-hidden shadow-2xl z-50 py-2 border border-white/10"
                style={{ background: 'var(--dropdown-bg)' }}>
                {[...filteredMore, ...filteredAdmin].map((link) => (
                  <Link key={link.name} to={link.path}
                    onClick={() => setShowMoreMenu(false)}
                    className="block px-4 py-2.5 text-sm transition-colors hover:bg-white/5 hover:text-purple-400"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Actions: Guest SOS, i18n, Theme, User */}
        <div className="hidden lg:flex items-center gap-3">
          
          {/* Prominent Red Guest SOS Callout */}
          <Link
            to="/guest-sos"
            className="bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-md shadow-red-950/50 uppercase tracking-wider transition-all hover:scale-105"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t('navGuestSos')}</span>
          </Link>

          {/* Language Switcher */}
          <button
            onClick={() => toggleLanguage()}
            className="px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1 transition-colors"
            title="Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>{language === 'en' ? 'HI' : 'EN'}</span>
          </button>

          <ThemeToggleButton theme={theme} cycleTheme={cycleTheme} />

          {isAuthenticated ? (
            <div className="relative" ref={profileMenuRef}>
              <button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                className="flex items-center gap-2 focus:outline-none pl-2 border-l border-white/10"
              >
                <img src={getAvatarSrc(user.avatar, user.name)} alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-purple-500/30"
                  onError={(e) => { e.target.src = getAvatarSrc('', user.name); }}
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl overflow-hidden shadow-2xl z-50 py-1.5 border border-white/10 bg-slate-900">
                  <div className="px-4 py-2.5 border-b border-white/10">
                    <p className="text-xs font-bold truncate text-white">{user.name}</p>
                    <p className="text-[10px] truncate text-slate-400">{user.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white">
                    <User className="w-4 h-4 text-purple-400" /> Profile Settings
                  </Link>
                  <Link to="/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white">
                    <Settings className="w-4 h-4 text-purple-400" /> Settings
                  </Link>
                  <button onClick={() => { setShowProfileMenu(false); handleLogout(); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:text-red-300">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-xs font-semibold px-3 py-2 text-slate-300 hover:text-white">Sign In</Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-xs font-bold">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link to="/guest-sos" className="bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-full uppercase">SOS</Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </nav>
      {mobileMenuOpen && renderMobileDrawer()}
    </>
  );
};

export default Navbar;
