import { LucideIcon, BarChart3, Users, Monitor, LifeBuoy, FileText, Settings, LineChart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { CMGLogo, CMGFavicon } from '@/components/ui/cmg-logo';
import { useQueryClient } from '@tanstack/react-query';
import { InvoiceService } from '@/services/invoice-service';
import { ClientService } from '@/services/client-service';
import { DashboardService } from '@/services/dashboard-service';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  prefetchData?: () => void;
}

interface SidebarProps {
  isOpen?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export function OptimizedSidebar({ isOpen, isMobile, onClose }: SidebarProps = {}) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const queryClient = useQueryClient();
  
  // Prefetch functions for different routes
  const prefetchDashboard = () => {
    queryClient.prefetchQuery({
      queryKey: ['dashboard-metrics'],
      queryFn: () => DashboardService.getInstance().getMetrics(),
      staleTime: 2 * 60 * 1000,
    });
  };
  
  const prefetchInvoices = () => {
    queryClient.prefetchQuery({
      queryKey: ['invoices'],
      queryFn: () => InvoiceService.getInvoices(),
      staleTime: 2 * 60 * 1000,
    });
  };
  
  const prefetchClients = () => {
    queryClient.prefetchQuery({
      queryKey: ['clients'],
      queryFn: () => ClientService.getClients(),
      staleTime: 2 * 60 * 1000,
    });
  };
  
  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, prefetchData: prefetchDashboard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
    { name: 'Clients', href: '/dashboard/clients', icon: Users, prefetchData: prefetchClients },
    { name: 'Platforms', href: '/dashboard/platforms', icon: Monitor },
    { name: 'Support', href: '/dashboard/support', icon: LifeBuoy },
    { name: 'Invoices', href: '/dashboard/invoices', icon: FileText, prefetchData: prefetchInvoices },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];
  
  return (
    <>
      <CMGFavicon />
      
      {/* Overlay - only on mobile when sidebar is open */}
      <div 
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-300",
          isOpen 
            ? "bg-black/50 backdrop-blur-sm opacity-100 pointer-events-auto" 
            : "bg-black/0 backdrop-blur-none opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 flex h-full w-64 flex-col border-r transition-transform duration-300 md:static md:transform-none",
        // Simplified background without heavy effects
        isDark 
          ? "bg-zinc-900 border-zinc-800 text-zinc-100" 
          : "bg-white border-gray-200 text-gray-900",
        isMobile && isOpen ? "z-40" : "z-30",
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        
        <div className={cn(
          "flex h-16 items-center border-b px-6",
          isDark ? "border-zinc-800" : "border-gray-200"
        )}>
          <Link href="/dashboard" className="flex items-center">
            <CMGLogo className="flex-shrink-0" />
          </Link>
        </div>
        
        <div className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = 
              pathname === item.href || 
              (pathname?.startsWith(item.href + '/') && item.href !== '/dashboard');
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? isDark 
                      ? "bg-zinc-800 text-zinc-100" 
                      : "bg-gray-100 text-gray-900"
                    : isDark
                      ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" 
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={isMobile ? onClose : undefined}
                onMouseEnter={() => {
                  // Prefetch data when hovering over nav item
                  if (item.prefetchData && !isActive) {
                    item.prefetchData();
                  }
                }}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive 
                    ? isDark ? "text-blue-400" : "text-blue-600" 
                    : ""
                )} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
} 