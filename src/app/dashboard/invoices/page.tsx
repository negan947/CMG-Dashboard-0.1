'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

export default function InvoicesPage() {
  const { theme } = useTheme();
  const isDark = theme !== 'light';

  return (
    <div className="relative min-h-screen">
      {/* Background elements from other dashboard pages */}
      <div className={cn(
        "fixed inset-0 -z-10",
        isDark 
          ? "bg-gradient-to-br from-[#0F0F12] via-[#171720] to-[#1C1C25]" 
          : "bg-gradient-to-br from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF]"
      )} />
      
      <div className={cn(
        "fixed -top-20 -left-20 -z-5 h-72 w-72 rounded-full blur-[100px]",
        isDark ? "bg-purple-900 opacity-[0.15]" : "bg-purple-400 opacity-[0.18]"
      )} />
      <div className={cn(
        "fixed top-1/3 right-1/4 -z-5 h-60 w-60 rounded-full blur-[80px]",
        isDark ? "bg-blue-900 opacity-[0.15]" : "bg-blue-400 opacity-[0.18]"
      )} />
      <div className={cn(
        "fixed bottom-1/4 -right-10 -z-5 h-48 w-48 rounded-full blur-[70px]",
        isDark ? "bg-fuchsia-900 opacity-[0.1]" : "bg-pink-300 opacity-[0.15]"
      )} />
      <div className={cn(
        "fixed top-2/3 left-1/4 -z-5 h-36 w-36 rounded-full blur-[60px]",
        isDark ? "bg-indigo-900 opacity-[0.1]" : "bg-indigo-400 opacity-[0.15]"
      )} />
      
      <div className={cn(
        "fixed inset-0 -z-9 opacity-[0.05] pointer-events-none",
        isDark ? "block" : "hidden"
      )} style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'600\' height=\'600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
      }} />

      <div className="space-y-6 md:space-y-8 relative z-10 py-2 p-4 md:p-6">
        <GlassCard contentClassName="p-6">
          <div className="flex items-center space-x-3">
            <FileText className={cn("h-8 w-8", isDark ? "text-blue-400" : "text-blue-600")} />
            <h1 className={cn(
              "text-2xl font-bold md:text-3xl",
              isDark ? "text-zinc-100" : "text-gray-800"
            )}>
              Invoices
            </h1>
          </div>
          <p className={cn(
            "mt-4 text-md",
            isDark ? "text-zinc-300" : "text-gray-600"
          )}>
            This section is currently under development. Please check back later for invoice management features.
          </p>
        </GlassCard>

        {/* Placeholder for future content, e.g., a table or list of invoices */}
        <GlassCard contentClassName="p-6 min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <FileText className={cn("h-16 w-16 mx-auto mb-4", isDark ? "text-zinc-500" : "text-gray-400")} />
            <p className={cn("text-lg", isDark ? "text-zinc-400" : "text-gray-500")}>
              Invoice data will be displayed here.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 