import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ShieldAlert, ShieldCheck, Settings, LogIn, LogOut, Lock, User, RefreshCw } from 'lucide-react';

interface SecurityLogsProps {
  logs: any[];
}

export function SecurityLogs({ logs }: SecurityLogsProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  // No logs to display
  if (!logs.length) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-6 text-center",
        isDark ? "text-zinc-400" : "text-gray-500"
      )}>
        <ShieldCheck className="h-12 w-12 mb-3 opacity-50" />
        <p>No security activity recorded yet</p>
      </div>
    );
  }
  
  // Map security event types to icons
  const getEventIcon = (actionType: string) => {
    switch (actionType) {
      case 'login':
        return <LogIn className="h-5 w-5" />;
      case 'logout':
        return <LogOut className="h-5 w-5" />;
      case 'password_change':
        return <Lock className="h-5 w-5" />;
      case 'profile_update':
        return <User className="h-5 w-5" />;
      case 'preferences_update':
        return <Settings className="h-5 w-5" />;
      case 'password_reset':
        return <RefreshCw className="h-5 w-5" />;
      default:
        return <ShieldAlert className="h-5 w-5" />;
    }
  };
  
  // Format the security event description
  const formatEventDescription = (log: any) => {
    switch (log.action_type) {
      case 'login':
        return 'Successful login';
      case 'logout':
        return 'Logged out';
      case 'password_change':
        return 'Password changed';
      case 'password_reset':
        return 'Password reset requested';
      case 'profile_update':
        return 'Profile information updated';
      case 'preferences_update':
        return 'Account preferences updated';
      default:
        return log.description || 'Unknown action';
    }
  };
  
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {logs.map((log) => (
          <li 
            key={log.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-md border",
              isDark 
                ? "border-zinc-700 bg-zinc-800/50" 
                : "border-gray-200 bg-gray-50"
            )}
          >
            <div className={cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
              isDark ? "bg-zinc-700" : "bg-gray-200"
            )}>
              {getEventIcon(log.action_type)}
            </div>
            
            <div className="flex-1 space-y-1">
              <p className={cn(
                "font-medium",
                isDark ? "text-zinc-100" : "text-gray-900"
              )}>
                {formatEventDescription(log)}
              </p>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className={cn(
                  "text-sm",
                  isDark ? "text-zinc-400" : "text-gray-500"
                )}>
                  {log.created_at ? format(new Date(log.created_at), 'PPp') : 'Unknown date'}
                </p>
                
                {log.ip_address && (
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-zinc-400" : "text-gray-500"
                  )}>
                    IP: {log.ip_address}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 