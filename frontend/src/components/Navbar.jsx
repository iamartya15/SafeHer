import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Bell, Menu, X, LogOut, User, LayoutDashboard, MapPin, Brain } from 'lucide-react';
import * as chatService from '../services/chatService';
import { getAvatarSrc } from '../utils/avatar';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications if logged in
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await chatService.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll notifications every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await chatService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await chatService.markNotificationRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      }
      setShowNotifications(false);
      // Route appropriately based on notification
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
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Map', path: '/map', protected: true },
    { name: 'Nearby Places', path: '/nearby', protected: true },
    { name: 'SOS', path: '/sos', protected: true },
    { name: 'AI Assistant', path: '/ai', protected: true },
    { name: 'Guardian', path: '/guardian', protected: true },
    { name: 'Coming Soon', path: '/coming-soon' }
  ];

  return (
    <nav className="glass-card sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
        <Shield className="w-6 h-6 text-fuchsia-500 fill-fuchsia-500/10" />
        <span>SafeHer <span className="text-white font-extrabold text-sm px-1.5 py-0.5 rounded bg-purple-600/30 border border-purple-500/30">AI</span></span>
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

      {/* Action Buttons & Profile */}
      <div className="hidden lg:flex items-center gap-4">
        {isAuthenticated ? (
          <>
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] font-bold flex items-center justify-center text-white border border-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-card rounded-xl overflow-hidden border border-white/10 shadow-2xl z-50">
                  <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-slate-900/80">
                    <span className="text-xs font-semibold text-purple-400">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] hover:underline text-slate-400 hover:text-white"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
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
                            <span className="text-[9px] text-slate-500">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile menu links */}
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <Link to="/dashboard" className="p-2 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white transition-colors" title="Dashboard">
                <LayoutDashboard className="w-5 h-5" />
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-xs px-2 py-1 rounded bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/20 font-medium">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2">
                <img
                  src={getAvatarSrc(user.avatar, user.name)}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-purple-500/30"
                  onError={(e) => {
                    e.target.src = getAvatarSrc('', user.name);
                  }}
                />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-950/30 text-slate-400 hover:text-red-400 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
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

      {/* Mobile Menu Buttons */}
      <div className="flex items-center gap-3 lg:hidden">
        {isAuthenticated && (
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setMobileMenuOpen(false);
            }}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white relative"
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
          onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen);
            setShowNotifications(false);
          }}
          className="p-2 hover:bg-slate-800 rounded-full text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Notifications Option */}
      {showNotifications && (
        <div className="absolute top-16 left-4 right-4 glass-card rounded-xl shadow-2xl border border-white/10 z-50 block lg:hidden">
          <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-slate-900">
            <span className="text-xs font-semibold text-purple-400">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-[10px] text-slate-400">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No alerts.</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className="p-3 border-b border-white/5"
                >
                  <p className="text-xs font-medium text-white">{notif.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-4 right-4 glass-card p-6 rounded-xl flex flex-col gap-4 border border-white/10 shadow-2xl z-50 block lg:hidden animate-in fade-in">
          {navLinks.map((link) => {
            if (link.protected && !isAuthenticated) return null;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium py-1.5 border-b border-white/5 ${
                  isActive(link.path) ? 'text-fuchsia-400' : 'text-slate-300'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {isAuthenticated ? (
            <div className="flex flex-col gap-4 mt-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-slate-300"
              >
                <LayoutDashboard className="w-5 h-5 text-purple-500" />
                <span>Dashboard</span>
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-slate-300"
                >
                  <Shield className="w-5 h-5 text-fuchsia-500" />
                  <span>Admin Panel</span>
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-slate-300"
              >
                <User className="w-5 h-5 text-blue-500" />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 text-red-400 mt-2 text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary text-center text-sm py-2.5"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary text-center text-sm py-2.5"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
