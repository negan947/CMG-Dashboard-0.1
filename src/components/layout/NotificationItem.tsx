import { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  read: boolean;
  created_at: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMarkAsRead = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };
  
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <div 
      className={cn(
        "flex gap-3 p-3 transition-colors border-b last:border-b-0",
        notification.read 
          ? isDark 
            ? "bg-transparent hover:bg-zinc-800/60" 
            : "bg-transparent hover:bg-gray-50"
          : isDark 
            ? "bg-zinc-800/40 hover:bg-zinc-800/60" 
            : "bg-blue-50/60 hover:bg-blue-50/80",
        isHovered && "cursor-pointer"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleMarkAsRead}
    >
      <div className="shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "font-medium text-sm",
            notification.read
              ? isDark ? "text-zinc-400" : "text-gray-600"
              : isDark ? "text-zinc-100" : "text-gray-900"
          )}>
            {notification.title}
          </p>
          <div className={cn(
            "text-xs whitespace-nowrap",
            isDark ? "text-zinc-500" : "text-gray-500"
          )}>
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </div>
        </div>
        
        <p className={cn(
          "text-sm mt-0.5 line-clamp-2",
          notification.read
            ? isDark ? "text-zinc-500" : "text-gray-500" 
            : isDark ? "text-zinc-300" : "text-gray-700"
        )}>
          {notification.content}
        </p>
        
        {notification.link && (
          <Link
            href={notification.link}
            className={cn(
              "text-xs inline-flex items-center gap-1 mt-1.5 font-medium",
              isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            View details <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
      
      {!notification.read && (
        <div className="shrink-0 self-center">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
        </div>
      )}
    </div>
  );
} 