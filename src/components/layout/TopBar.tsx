import { Bell, Search, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';

interface TopBarProps {
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  isMobile?: boolean;
}

export function TopBar({ toggleSidebar, isSidebarOpen, isMobile }: TopBarProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center">
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 md:hidden"
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? 
              <X className="h-6 w-6 text-gray-700" /> : 
              <Menu className="h-6 w-6 text-gray-700" />
            }
          </button>
        )}
        <div className="w-full max-w-xs">
          <div className="flex items-center rounded-md border bg-gray-50 px-3 py-2">
            <Search className="mr-2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div className="hidden text-sm font-medium sm:block">
            {user?.email ? user.email.split('@')[0] : 'User'}
          </div>
        </div>
      </div>
    </div>
  );
} 