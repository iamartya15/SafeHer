import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as chatService from '../services/chatService';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const abortControllerRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await chatService.getNotifications(abortControllerRef.current.signal);
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        console.error('Failed to load notifications:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      pollingIntervalRef.current = setInterval(fetchNotifications, 15000);

      const onVis = () => {
        if (document.hidden) {
          clearInterval(pollingIntervalRef.current);
        } else {
          fetchNotifications();
          pollingIntervalRef.current = setInterval(fetchNotifications, 15000);
        }
      };
      
      document.addEventListener('visibilitychange', onVis);
      return () => {
        clearInterval(pollingIntervalRef.current);
        document.removeEventListener('visibilitychange', onVis);
        if (abortControllerRef.current) abortControllerRef.current.abort();
      };
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [isAuthenticated, fetchNotifications]);

  const markAllRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await chatService.markAllNotificationsRead();
      // Only fetch if necessary, but optimistic update is already applied.
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
      // Rollback on failure (fetch from server to restore actual state)
      fetchNotifications();
    }
  };

  const markRead = async (id) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    try {
      await chatService.markNotificationRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      fetchNotifications();
    }
  };

  const deleteNotificationItem = async (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await chatService.deleteNotification(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAllRead,
        markRead,
        deleteNotificationItem
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
