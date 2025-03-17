import { LucideIcon, BarChart3, Users, Monitor, LifeBuoy, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <>
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
        "fixed inset-y-0 left-0 flex h-full w-64 flex-col border-r transition-transform duration-300 backdrop-blur-lg md:static md:transform-none",
        // Use higher z-index on mobile when open to ensure it's above the TopBar
        isMobile && isOpen ? "z-40" : "z-30",
        isDark 
          ? "bg-[rgba(20,20,25,0.8)] border-[rgba(60,60,75,0.5)] text-zinc-100" 
          : "bg-gradient-to-b from-[rgba(232,237,255,0.8)] via-[rgba(240,245,255,0.8)] to-[rgba(245,249,255,0.8)] border-[rgba(255,255,255,0.6)] text-gray-900",
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        {/* Subtle shine effect */}
        <div className={cn(
          "absolute inset-0 pointer-events-none",
          isDark 
            ? "bg-gradient-to-br from-zinc-800/30 via-transparent to-transparent" 
            : "bg-gradient-to-br from-white/70 via-white/30 to-transparent"
        )} />
        
        {/* Subtle brushed metal texture - only in dark mode */}
        {isDark && (
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'600\' height=\'600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat',
          }} />
        )}
      
        <div className={cn(
          "flex h-16 items-center border-b px-6 relative z-10",
          isDark ? "border-zinc-700/50" : "border-gray-200/70"
        )}>
          <Link href="/dashboard" className="flex items-center">
            <h1 className={cn(
              "text-xl font-bold transition-colors",
              isDark 
                ? "text-zinc-100 hover:text-white" 
                : "text-gray-900 hover:text-blue-600"
            )}>
              CMG Dashboard
            </h1>
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4 relative z-10">
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
                    ? isDark 
                      ? "bg-zinc-800/80 text-zinc-100" 
                      : "bg-gray-100/80 text-gray-900"
                    : isDark
                      ? "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100" 
                      : "text-gray-500 hover:bg-gray-100/60 hover:text-gray-900"
                )}
                onClick={isMobile ? onClose : undefined}
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