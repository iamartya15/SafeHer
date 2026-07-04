import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Shield,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  HeartHandshake,
  ShieldPlus,
  ChevronDown
} from 'lucide-react';
import * as chatService from '../services/chatService';
import { getAvatarSrc } from '../utils/avatar';

export const Navbar = () => {
  const { user, logout, isAuthenticated, activeWorkspace, setActiveWorkspace } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const profileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu and notifications on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          // Return focus to the hamburger button
          hamburgerRef.current?.focus();
        }
        if (showNotifications) {
          setShowNotifications(false);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, showNotifications]);

  // Close desktop notification / profile dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications if logged in
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await chatService.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [isAuthenticated]);

  // Visibility-aware notification polling — pause when tab is not visible
  useEffect(() => {
    fetchNotifications();

    let interval = setInterval(fetchNotifications, 15000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        fetchNotifications();
        interval = setInterval(fetchNotifications, 15000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await chatService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await chatService.markNotificationRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
      }
      setShowNotifications(false);
      setMobileMenuOpen(false);
      if (notif.type === 'guardian_request') {
        navigate('/guardian');
      } else if (notif.type === 'sos') {
        navigate(user?.role === 'guardian' ? '/guardian' : '/dashboard');
      }
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

  const allNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard', protected: true, roles: ['user'] },
    { name: 'SOS Center', path: '/sos', protected: true, roles: ['user'] },
    { name: 'Safety Map', path: '/map', protected: true, roles: ['user'] },
    { name: 'Report Incident', path: '/report-incident', protected: true, roles: ['user'] },
    { name: 'Nearby Places', path: '/nearby', protected: true, roles: ['user'] },
    { name: 'AI Companion', path: '/ai', protected: true, roles: ['user'] },
    { name: 'Admin Dashboard', path: '/admin', protected: true, roles: ['admin'] },
    { name: 'Guardian Command Center', path: '/guardian', protected: true, roles: ['guardian', 'admin'] },
    { name: 'Profile Settings', path: '/profile', protected: true, roles: ['user', 'guardian', 'admin'] }
  ];

  const userRoles = user?.roles && user?.roles.length > 0 ? user.roles : [user?.role || 'user'];

  const navLinks = allNavLinks.filter(link => {
    if (!link.protected) return true;
    if (!isAuthenticated) return false;
    
    if (link.roles) {
      if (link.roles.includes(activeWorkspace)) {
        if (link.path === '/admin' && activeWorkspace !== 'admin') return false;
        return true;
      }
      if (activeWorkspace === 'user' && link.path === '/guardian') {
        return userRoles.includes('guardian');
      }
      return false;
    }
    return true;
  });

  // Notification list shared between desktop dropdown and mobile
  const NotificationList = () => (
    <>
      <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-slate-900">
        <span className="text-xs font-semibold text-purple-400">Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[10px] text-slate-400 hover:text-white hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-64 overflow-y-auto overscroll-contain">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">No alerts or notifications.</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                !notif.read ? 'bg-purple-500/5' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs font-medium ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                  {notif.title}
                </span>
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

  // Mobile Drawer rendered via portal to document.body — correct z-index, full screen overlay
  const MobileDrawer = () =>
    createPortal(
      <>
        {/* Full-screen backdrop overlay */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999]"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in drawer panel */}
        <div
          className="fixed top-0 right-0 h-full w-[min(320px,100vw)] z-[1000] bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col"
          style={{ animation: 'slideInRight 0.25s ease-out forwards' }}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
            >
              <Shield className="w-5 h-5 text-fuchsia-500 fill-fuchsia-500/10 shrink-0" />
              <span>SafeHer <span className="text-white font-extrabold text-xs px-1 py-0.5 rounded bg-purple-600/30 border border-purple-500/30">AI</span></span>
            </Link>
            <button
              ref={closeButtonRef}
              onClick={() => {
                setMobileMenuOpen(false);
                hamburgerRef.current?.focus();
              }}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
              autoFocus
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain py-4 px-3">

            {/* Auth user profile strip */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 p-3 mb-4 bg-white/5 rounded-xl border border-white/5">
                <img
                  src={getAvatarSrc(user.avatar, user.name)}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-purple-500/40 shrink-0"
                  onError={(e) => { e.target.src = getAvatarSrc('', user.name); }}
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wide">
                    {activeWorkspace === 'admin' ? 'Administrator' : activeWorkspace === 'guardian' ? 'Guardian' : 'SafeHer User'}
                  </span>
                </div>
              </div>
            )}

            {/* Mobile Workspace Selector Dropdown */}
            {isAuthenticated && userRoles.length > 1 && (
              <div className="mb-4 px-3">
                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1">Select Workspace</label>
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
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-purple-500/50 cursor-pointer"
                >
                  {userRoles.includes('user') && <option value="user">User Dashboard</option>}
                  {userRoles.includes('guardian') && <option value="guardian">Guardian Command</option>}
                  {userRoles.includes('admin') && <option value="admin">Admin Dashboard</option>}
                </select>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navLinks.map((link) => {
                if (link.protected && !isAuthenticated) return null;
                const displayName = (activeWorkspace === 'user' && link.path === '/guardian') ? 'Guardian Dashboard' : link.name;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-purple-600/20 text-fuchsia-400 border border-purple-500/20'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {displayName}
                  </Link>
                );
              })}
            </nav>

            {!isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary w-full text-center text-sm py-2.5 block"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-center text-sm py-2.5 block"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Drawer Footer: Logout */}
          {isAuthenticated && (
            <div className="px-3 py-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
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

  return (
    <>
      <nav className="sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between border-b border-white/5 bg-slate-950/90 backdrop-blur-md shadow-lg">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent shrink-0"
        >
          <Shield className="w-6 h-6 text-fuchsia-500 fill-fuchsia-500/10 shrink-0" />
          <span>
            SafeHer{' '}
            <span className="text-white font-extrabold text-sm px-1.5 py-0.5 rounded bg-purple-600/30 border border-purple-500/30">
              AI
            </span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            if (link.protected && !isAuthenticated) return null;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                  isActive(link.path) ? 'text-fuchsia-400 font-semibold' : 'text-slate-300'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop Action Buttons & Profile */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] font-bold flex items-center justify-center text-white border border-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Desktop Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 rounded-xl overflow-hidden border border-white/10 shadow-2xl z-50 bg-slate-900">
                    <NotificationList />
                  </div>
                )}
              </div>

              {/* Profile Menu Trigger & Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 focus:outline-none pl-2 border-l border-white/10"
                  aria-label="Profile menu"
                >
                  <img
                    src={getAvatarSrc(user.avatar, user.name)}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-purple-500/30 hover:border-purple-500/80 transition-colors"
                    onError={(e) => { e.target.src = getAvatarSrc('', user.name); }}
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                </button>

                {/* Profile Dropdown Box */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl overflow-hidden border border-white/10 shadow-2xl z-50 bg-slate-900 text-xs py-1.5 space-y-1">
                    
                    {/* User Info Section */}
                    <div className="px-4 py-2 border-b border-white/5 space-y-0.5">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    {/* Links */}
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      <span>Profile Settings</span>
                    </Link>

                    {/* Guardian Workspace Switch Option */}
                    {userRoles.includes('guardian') && (
                      <button
                        onClick={() => {
                          const target = activeWorkspace === 'guardian' ? 'user' : 'guardian';
                          setActiveWorkspace(target);
                          setShowProfileMenu(false);
                          navigate(target === 'user' ? '/dashboard' : '/guardian');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <HeartHandshake className="w-4 h-4 text-purple-400" />
                        <span>Switch to {activeWorkspace === 'guardian' ? 'User Workspace' : 'Guardian Workspace'}</span>
                      </button>
                    )}

                    {/* Admin Dashboard Option */}
                    {userRoles.includes('admin') && activeWorkspace !== 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => {
                          setActiveWorkspace('admin');
                          setShowProfileMenu(false);
                        }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white transition-colors animate-pulse"
                      >
                        <ShieldPlus className="w-4 h-4 text-fuchsia-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-white/5 my-1" />

                    {/* Logout Option */}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>

                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium px-4 py-2">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-xs font-semibold">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: Notification Bell + Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          {isAuthenticated && (
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setMobileMenuOpen(false);
              }}
              className="p-2 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white relative transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-600 rounded-full text-[8px] font-bold flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <button
            ref={hamburgerRef}
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setShowNotifications(false);
            }}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Notification Dropdown (inline, below navbar) */}
      {showNotifications && (
        <div className="lg:hidden fixed top-[57px] left-3 right-3 rounded-xl overflow-hidden border border-white/10 shadow-2xl z-[998] bg-slate-900">
          <NotificationList />
        </div>
      )}

      {/* Mobile Drawer via Portal */}
      {mobileMenuOpen && <MobileDrawer />}
    </>
  );
};

export default Navbar;
