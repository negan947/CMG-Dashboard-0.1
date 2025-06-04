import { Bell, Search, User, Menu, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from './NotificationsDropdown';
import { SearchResults } from '@/components/ui/search-results';
import { useSearchStore } from '@/lib/stores/search-store';
import { useSearchShortcut } from '@/hooks/use-keyboard-shortcut';

interface TopBarProps {
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  isMobile?: boolean;
}

export function TopBar({ toggleSidebar, isSidebarOpen, isMobile }: TopBarProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Get search store state and actions
  const { isOpen, setIsOpen, setQuery, query } = useSearchStore();
  
  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle click outside to collapse search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchExpanded &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchExpanded]);

  // Determine if we're in dark mode
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const toggleSearch = () => {
    setSearchExpanded(!searchExpanded);
  };
  
  // Handle opening the search modal
  const openSearchModal = () => {
    setIsOpen(true);
  };
  
  // Close the search modal
  const closeSearchModal = () => {
    setIsOpen(false);
    setQuery('');
  };
  
  // Handle search input click to open modal
  const handleSearchInputClick = () => {
    openSearchModal();
  };
  
  // Handle keyboard shortcut for search (Cmd/Ctrl+K)
  useSearchShortcut(() => {
    openSearchModal();
  }, []);

  return (
    <>
      <div 
        className={cn(
          "flex h-16 items-center justify-between border-b backdrop-blur-lg z-30 sticky top-0 px-4 md:px-6",
          isDark 
            ? "bg-[rgba(20,20,25,0.75)] border-[rgba(60,60,75,0.5)] shadow-sm" 
            : "bg-gradient-to-r from-[rgba(232,237,255,0.8)] via-[rgba(240,245,255,0.8)] to-[rgba(245,249,255,0.8)] border-[rgba(255,255,255,0.6)] shadow-md"
        )}
      >
        {/* Subtle shine effect */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b opacity-30 pointer-events-none",
          isDark 
            ? "from-white/[0.05] to-transparent" 
            : "from-white/60 to-white/20"
        )} />
        
        {/* Subtle texture overlay - only in dark mode */}
        {isDark && (
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'600\' height=\'600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat',
          }} />
        )}
        
        <div className="flex items-center z-10 flex-1">
          {/* Mobile view - Menu toggle and search with inline expansion */}
          <div className="flex items-center gap-2 md:gap-4 w-full">
            {isMobile && (
              <Button
                onClick={toggleSidebar}
                size="icon"
                variant={isDark ? "ghost" : "ghost"}
                className="md:hidden"
                aria-label="Toggle Menu"
              >
                {isSidebarOpen ? 
                  <X className={`h-5 w-5 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`} /> : 
                  <Menu className={`h-5 w-5 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`} />
                }
              </Button>
            )}
            
            {/* Inline expanding search for mobile */}
            {isMobile ? (
              <div 
                ref={searchContainerRef}
                className={cn(
                  "flex items-center transition-all duration-300 ease-in-out overflow-hidden",
                  searchExpanded ? "flex-1" : "w-10"
                )}
              >
                <div className={cn(
                  "flex items-center w-full rounded-full",
                  searchExpanded 
                    ? "bg-opacity-80 backdrop-blur-sm" 
                    : "",
                  searchExpanded && isDark 
                    ? 'bg-zinc-800/50' 
                    : searchExpanded && !isDark 
                      ? 'bg-white/90' 
                      : ''
                )}>
                  <Button
                    onClick={toggleSearch}
                    size="icon"
                    variant={searchExpanded ? "ghost" : isDark ? "secondary" : "secondary"}
                    className={cn(
                      "h-10 w-10 rounded-full transition-all duration-200",
                      searchExpanded ? "bg-transparent hover:bg-transparent" : ""
                    )}
                    aria-label="Toggle search"
                  >
                    <Search className={cn(
                      "h-5 w-5 transition-all",
                      isDark
                        ? searchExpanded ? "text-zinc-300" : "text-zinc-300"
                        : searchExpanded ? "text-blue-600" : "text-blue-600"
                    )} />
                  </Button>
                  
                  {searchExpanded && (
                    <input
                      type="text"
                      placeholder="Search..."
                      className={cn(
                        "w-full bg-transparent text-sm border-0 outline-none ring-0 focus:ring-0 focus:outline-none",
                        "p-0",
                        isDark 
                          ? 'text-zinc-300 placeholder:text-zinc-500' 
                          : 'text-gray-800 placeholder:text-blue-400'
                      )}
                      autoFocus
                      onClick={handleSearchInputClick}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-xs">
                <div 
                  className={cn(
                    "flex items-center rounded-full border px-3 py-2 transition-all cursor-pointer",
                    isDark 
                      ? 'bg-zinc-900/50 border-zinc-700/80 hover:bg-zinc-800/70' 
                      : 'bg-white/90 border-blue-200 hover:bg-blue-50/80'
                  )}
                  onClick={handleSearchInputClick}
                >
                  <Search className={`mr-2 h-4 w-4 ${isDark ? 'text-zinc-500' : 'text-blue-500'}`} />
                  <div
                    className={cn(
                      "w-full text-sm border-0 outline-none",
                      "p-0 h-8 flex items-center",
                      isDark 
                        ? 'text-zinc-400 placeholder:text-zinc-500' 
                        : 'text-gray-500 placeholder:text-blue-400'
                    )}
                  >
                    Search...
                  </div>
                  
                  <div className={cn(
                    "flex items-center justify-center px-1.5 py-0.5 rounded text-xs ml-auto",
                    isDark ? "bg-zinc-800 text-zinc-400" : "bg-gray-100 text-gray-500"
                  )}>
                    {navigator.userAgent.includes('Mac') ? '⌘K' : 'Ctrl+K'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className={cn(
          "flex items-center gap-3 md:gap-4 z-10 transition-all duration-300 ease-in-out",
          (isMobile && searchExpanded) ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
        )}>
          {/* Theme toggle button */}
          {mounted && !searchExpanded && (
            <Button
              onClick={toggleTheme}
              size="icon"
              variant={isDark ? "secondary" : "secondary"}
              className="h-10 w-10 rounded-full"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-amber-300" />
              ) : (
                <Moon className="h-5 w-5 text-blue-600" />
              )}
            </Button>
          )}
          
          {!searchExpanded && <NotificationsDropdown />}
          
          {/* Profile - Now clickable and linked to profile page */}
          {!searchExpanded && (
            <Link href="/dashboard/profile" className="flex items-center gap-2">
              <Button
                size="icon"
                variant={isDark ? "secondary" : "secondary"}
                className={cn(
                  "h-10 w-10 rounded-full", 
                  !isDark && "bg-blue-50/80 hover:bg-blue-100/80"
                )}
              >
                <User className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-blue-600'}`} />
              </Button>
              <div className={cn(
                "hidden text-sm font-medium transition-colors sm:block", 
                isDark 
                  ? 'text-zinc-300 hover:text-zinc-100' 
                  : 'text-gray-700 hover:text-gray-900'
              )}>
                {user?.email ? user.email.split('@')[0] : 'User'}
              </div>
            </Link>
          )}
        </div>
      </div>
      
      {/* Search Modal */}
      {isOpen && <SearchResults onClose={closeSearchModal} />}
    </>
  );
} 