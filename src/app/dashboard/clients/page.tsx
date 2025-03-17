'use client';

import { UserCircle, Plus } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export default function ClientsPage() {
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  
  return (
    <div className="space-y-6 py-2">
      <GlassCard 
        variant="subtle"
        title="Clients"
        description="Manage your client relationships and projects."
      >
        <div className={cn(
          "flex justify-between items-center pt-4",
        )}>
          <div></div>
          <button className={cn(
            "px-4 py-2 rounded-md text-white flex items-center gap-2 transition-colors",
            "bg-blue-600 hover:bg-blue-700"
          )}>
            <Plus className="h-4 w-4" />
            Add Client
          </button>
        </div>
      </GlassCard>
      
      <GlassCard
        color="indigo"
        title="Your Clients"
      >
        <div className="space-y-4 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "flex items-center p-4 border rounded-lg transition-colors",
                isDark 
                  ? "border-zinc-700/50 hover:bg-zinc-800/30" 
                  : "border-gray-200 hover:bg-gray-50/50"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center mr-4",
                isDark ? "bg-zinc-800/70" : "bg-gray-100/70"
              )}>
                <UserCircle className={cn(
                  "h-6 w-6",
                  isDark ? "text-zinc-300" : "text-gray-500"
                )} />
              </div>
              <div>
                <h3 className={cn(
                  "font-medium",
                  isDark ? "text-zinc-100" : "text-gray-800"
                )}>
                  Client {i + 1}
                </h3>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-zinc-400" : "text-gray-500"
                )}>
                  client{i + 1}@example.com
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
} 