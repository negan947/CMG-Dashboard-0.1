import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useTheme } from 'next-themes';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - now managed with responsive behavior */}
      <Sidebar 
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onClose={closeSidebar}
      />
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />
        
        {/* Page content */}
        <main className={`flex-1 overflow-auto p-6 ${
          isDark ? 'bg-[#121212]' : 'bg-gray-50'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
} 