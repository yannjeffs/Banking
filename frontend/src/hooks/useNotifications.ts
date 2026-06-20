import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import type { Notification } from '../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]      = useState<number>(0);
  const [loading, setLoading]              = useState<boolean>(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get<Notification[]>('/notification'),
        api.get<{ count: number }>('/notification/unread-count'),
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes.data.count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [notifRes, countRes] = await Promise.all([
          api.get<Notification[]>('/notification'),
          api.get<{ count: number }>('/notification/unread-count'),
        ]);
        if (cancelled) return;
        setNotifications(notifRes.data);
        setUnreadCount(countRes.data.count);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    // Rafraîchir automatiquement toutes les 30 secondes
    const interval = setInterval(load, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const markAsRead = async (notificationId: number) => {
    await api.put(`/notification/${notificationId}/read`);
    setNotifications(prev =>
      prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await api.put('/notification/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}