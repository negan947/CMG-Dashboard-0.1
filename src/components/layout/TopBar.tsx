import { Bell, Search, User, Menu, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TopBarProps {
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  isMobile?: boolean;
}

export function TopBar({ toggleSidebar, isSidebarOpen, isMobile }: TopBarProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if we're in dark mode
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <div className={`flex h-16 items-center justify-between border-b px-4 md:px-6 ${
      isDark ? 'bg-[#1C1C1E] border-zinc-800' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center">
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className={`mr-3 flex h-10 w-10 items-center justify-center rounded-md ${
              isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'
            } md:hidden`}
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? 
              <X className={`h-6 w-6 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`} /> : 
              <Menu className={`h-6 w-6 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`} />
            }
          </button>
        )}
        <div className="w-full max-w-xs">
          <div className={`flex items-center rounded-md border px-3 py-2 ${
            isDark ? 
            'bg-zinc-900/70 border-zinc-700' : 
            'bg-gray-50 border-gray-200'
          }`}>
            <Search className={`mr-2 h-4 w-4 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search..."
              className={`w-full bg-transparent text-sm focus:outline-none ${
                isDark ? 'text-zinc-300 placeholder:text-zinc-500' : 'text-gray-700 placeholder:text-gray-400'
              }`}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        {/* Theme toggle button */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-300" />
            ) : (
              <Moon className="h-5 w-5 text-blue-700" />
            )}
          </button>
        )}
        
        <button
          type="button"
          className={`relative flex h-10 w-10 items-center justify-center rounded-full ${
            isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'
          }`}
        >
          <Bell className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </button>
        
        {/* Profile - Now clickable and linked to profile page */}
        <Link href="/dashboard/profile" className="flex items-center gap-2">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
            isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-100 hover:bg-gray-200'
          }`}>
            <User className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`} />
          </div>
          <div className={`hidden text-sm font-medium transition-colors sm:block ${
            isDark ? 'text-zinc-300 hover:text-zinc-100' : 'text-gray-700 hover:text-gray-900'
          }`}>
            {user?.email ? user.email.split('@')[0] : 'User'}
          </div>
        </Link>
      </div>
    </div>
  );
} 