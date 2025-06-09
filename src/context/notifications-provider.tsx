'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Notification } from '@/components/layout/NotificationItem';
import { createClient } from '@/lib/supabase';

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (page?: number, append?: boolean) => Promise<boolean | void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

const PAGE_SIZE = 10;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async (
    page = 0,
    append = false
  ): Promise<boolean | void> => {
    if (!user) return;
    if (!append) setIsLoading(true);
    try {
      const supabase = createClient();
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      setNotifications(prev =>
        append ? [...prev, ...(data as Notification[])] : (data as Notification[])
      );
      return count ? to + 1 < count : false;
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      if (!append) setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      setNotifications(current =>
        current.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);
      if (error) throw error;
      setNotifications(current => current.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    // Initial fetch for existing notifications
    fetchNotifications();

    const supabase = createClient();
    
    // Set up real-time subscription for new and updated notifications
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on<Notification>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Add the new notification to the top of the list
          setNotifications((current) => [payload.new as Notification, ...current]);
        }
      )
      .on<Notification>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Update the notification in the list
          setNotifications((current) =>
            current.map((n) =>
              n.id === payload.new.id ? { ...n, ...(payload.new as Notification) } : n
            )
          );
        }
      )
      .subscribe();
      
    // Cleanup function to remove the subscription when the component unmounts
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}

