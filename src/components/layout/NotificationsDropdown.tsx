import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Bell, X, Check, CheckCheck, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { NotificationItem, type Notification } from './NotificationItem';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase';
import { useMediaQuery } from '@/hooks/use-media-query';
import { RealtimeChannel } from '@supabase/supabase-js';

export function NotificationsDropdown() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 5; // Smaller initial page size for better UX
  
  // Periodically poll for new notifications
  useEffect(() => {
    if (!user) return;
    
    // Initial fetch
    fetchNotifications();
    
    // Set up interval to check for new notifications every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 10000); // 10 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // Refetch when dropdown opens
  useEffect(() => {
    if (user && isOpen) {
      fetchNotifications();
    }
  }, [user, isOpen]);

  // Handle clicking outside the mobile dropdown
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isOpen]);

  // Reset pagination when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setPage(0);
      setHasMore(true);
    }
  }, [isOpen]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const fetchNotifications = async (isPolling = false) => {
    if (!user) return;
    
    // Only show loading state when the dropdown is open and not polling
    if (isOpen && !isPolling) {
      setIsLoading(true);
      // Reset pagination when manually fetching
      if (!isPolling) {
        setPage(0);
        setHasMore(true);
      }
    }
    
    try {
      const supabase = createClient();
      const from = 0;
      const to = PAGE_SIZE - 1;
      
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      setNotifications(data as Notification[]);
      
      // Check if there are more notifications to load
      if (count) {
        setHasMore(count > PAGE_SIZE);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      if (isOpen && !isPolling) {
        setError('Failed to load notifications');
      }
    } finally {
      if (isOpen && !isPolling) {
        setIsLoading(false);
      }
    }
  };

  const loadMoreNotifications = async () => {
    if (!user || !hasMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const supabase = createClient();
      const nextPage = page + 1;
      const from = nextPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setNotifications([...notifications, ...(data as Notification[])]);
        setPage(nextPage);
        
        // Check if there are more notifications to load
        if (count) {
          setHasMore((from + data.length) < count);
        } else {
          setHasMore(data.length === PAGE_SIZE);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more notifications:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // The loading and empty state components reused in both mobile and desktop views
  const renderNotificationContent = () => {
    if (isLoading) {
      return (
        <div className={cn(
          "flex items-center justify-center h-32",
          isDark ? "text-zinc-400" : "text-gray-500"
        )}>
          Loading...
        </div>
      );
    }
    
    if (error) {
      return (
        <div className={cn(
          "flex items-center justify-center h-32 text-sm",
          isDark ? "text-zinc-400" : "text-gray-500"
        )}>
          {error}
        </div>
      );
    }
    
    if (notifications.length === 0) {
      return (
        <div className={cn(
          "flex flex-col items-center justify-center h-32 text-sm gap-2",
          isDark ? "text-zinc-400" : "text-gray-500"
        )}>
          <Bell className="h-10 w-10 opacity-20 mb-1" />
          <p>No notifications yet</p>
        </div>
      );
    }
    
    return (
      <>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
        
        {hasMore && (
          <div className="p-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs font-medium w-full justify-center",
                isDark ? "text-zinc-400 hover:text-zinc-300" : "text-gray-600 hover:text-gray-900",
                isLoadingMore && "opacity-70 cursor-not-allowed"
              )}
              onClick={loadMoreNotifications}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  Load more
                </span>
              )}
            </Button>
          </div>
        )}
      </>
    );
  };

  // Mobile specific rendering
  if (isMobile) {
    return (
      <div className="relative" ref={containerRef}>
        <Button
          size="icon"
          variant={isDark ? "ghost" : "secondary"}
          className={cn(
            "relative h-10 w-10 rounded-full", 
            !isDark && "bg-blue-50/80 hover:bg-blue-100/80"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-blue-600'}`} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Mobile dropdown */}
        {isOpen && (
          <div className={cn(
            "fixed top-16 inset-x-4 z-50 rounded-lg shadow-lg overflow-hidden border",
            isDark 
              ? "bg-zinc-900 border-zinc-800" 
              : "bg-white border-gray-200"
          )}>
            <div className={cn(
              "flex items-center justify-between p-3 border-b",
              isDark ? "border-zinc-800" : "border-gray-200"
            )}>
              <h3 className={cn(
                "font-semibold text-sm",
                isDark ? "text-zinc-200" : "text-gray-900"
              )}>
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 text-xs font-medium",
                      isDark 
                        ? "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800" 
                        : "text-gray-600 hover:text-gray-900"
                    )}
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCheck className="h-3.5 w-3.5 mr-1" /> 
                    Mark all read
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className={cn(
              "overflow-y-auto",
              "max-h-[calc(70vh-4rem)]"
            )}>
              {renderNotificationContent()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop rendering with Popover
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant={isDark ? "ghost" : "secondary"}
          className={cn(
            "relative h-10 w-10 rounded-full", 
            !isDark && "bg-blue-50/80 hover:bg-blue-100/80"
          )}
        >
          <Bell className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-blue-600'}`} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className={cn(
          "w-80 p-0 overflow-hidden z-50",
          isDark 
            ? "bg-zinc-900 border-zinc-800" 
            : "bg-white"
        )}
      >
        <div className={cn(
          "flex items-center justify-between p-3 border-b",
          isDark ? "border-zinc-800" : "border-gray-200"
        )}>
          <h3 className={cn(
            "font-semibold text-sm",
            isDark ? "text-zinc-200" : "text-gray-900"
          )}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 text-xs font-medium",
                isDark 
                  ? "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800" 
                  : "text-gray-600 hover:text-gray-900"
              )}
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" /> 
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className={cn(
          "max-h-[calc(100vh-200px)] overflow-y-auto",
          isDark ? "scrollbar-thin scrollbar-thumb-zinc-700" : "scrollbar-thin scrollbar-thumb-gray-300"
        )}>
          {renderNotificationContent()}
        </div>
      </PopoverContent>
    </Popover>
  );
} 