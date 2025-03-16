import { LucideIcon, BarChart3, Users, Monitor, LifeBuoy, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  isOpen?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Platforms', href: '/dashboard/platforms', icon: Monitor },
  { name: 'Support', href: '/dashboard/support', icon: LifeBuoy },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({ isOpen, isMobile, onClose }: SidebarProps = {}) {
  const pathname = usePathname();
  
  return (
    <>
      {/* Overlay - only on mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col border-r bg-white transition-transform duration-300 md:static md:transform-none",
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-xl font-bold hover:text-blue-600 transition-colors">CMG Dashboard</h1>
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            // Check if current path matches this nav item (safely)
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
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
} 