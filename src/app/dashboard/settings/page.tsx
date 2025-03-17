'use client';

import { TestNotificationsButton } from './components/TestNotificationsButton';
import { GlassCard } from '@/components/ui/glass-card';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className={cn("text-2xl font-bold", isDark ? "text-zinc-100" : "text-gray-800")}>Settings</h1>
      
      <GlassCard title="Developer Tools" contentClassName="p-6">
        <div className="space-y-4">
          <div>
            <h3 className={cn("text-sm font-medium mb-2", isDark ? "text-zinc-200" : "text-gray-700")}>Test Notifications</h3>
            <p className={cn("text-sm mb-4", isDark ? "text-zinc-400" : "text-gray-500")}>
              Create test notifications to see how they appear in the UI.
            </p>
            <TestNotificationsButton />
          </div>
        </div>
      </GlassCard>
    </div>
  );
} 