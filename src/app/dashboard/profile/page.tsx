'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
import { LogOut, UserRound, Mail, Phone, Building, Shield } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // No need to push to login page as the logout function already handles it
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Extract profile information from user object
  const email = user?.email || 'No email available';
  const name = user?.user_metadata?.name || email.split('@')[0];
  const role = user?.app_metadata?.role || 'User';

  return (
    <div className="relative min-h-screen">
      {/* Colorful background with gradient - same as in DashboardPage */}
      <div className={cn(
        "fixed inset-0 -z-10",
        isDark 
          ? "bg-gradient-to-br from-[#0F0F12] via-[#171720] to-[#1C1C25]" 
          : "bg-gradient-to-br from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF]"
      )} />
      
      {/* Glowing accent orbs for visual effect - matched with DashboardPage */}
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
      
      {/* Subtle brushed metal texture overlay */}
      <div className={cn(
        "fixed inset-0 -z-9 opacity-[0.05] pointer-events-none",
        isDark ? "block" : "hidden"
      )} style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'600\' height=\'600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
      }} />
      
      <div className="space-y-6 md:space-y-8 relative z-10 py-2">
        <GlassCard contentClassName="p-6">
          <h1 className={`text-2xl font-bold md:text-3xl ${
            isDark ? "text-zinc-100" : "text-gray-800"
          }`}>Your Profile</h1>
          <p className={`mt-2 text-sm md:text-base ${
            isDark ? "text-zinc-300" : "text-gray-600"
          }`}>
            Manage your account information and settings
          </p>
        </GlassCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <GlassCard 
            contentClassName="p-6" 
            color="purple"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`flex h-24 w-24 items-center justify-center rounded-full ${
                isDark ? "bg-[rgba(25,25,35,0.5)]" : "bg-blue-100/70"
              }`}>
                <UserRound className={`h-12 w-12 ${
                  isDark ? "text-zinc-200" : "text-blue-700"
                }`} />
              </div>
              <h2 className={`mt-4 text-xl font-semibold ${
                isDark ? "text-zinc-100" : "text-gray-800"
              }`}>
                {name}
              </h2>
              <p className={`text-sm ${
                isDark ? "text-zinc-300" : "text-gray-500"
              }`}>
                {role}
              </p>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-white transition-colors ${
                  isDark 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-red-500 hover:bg-red-600"
                } ${isLoggingOut ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Sign Out"}
              </button>
            </div>
          </GlassCard>

          {/* Account Details */}
          <GlassCard 
            contentClassName="p-6"
            color="blue"
            title="Account Information"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                  isDark ? "text-zinc-300" : "text-gray-500"
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    isDark ? "text-zinc-200" : "text-gray-700"
                  }`}>
                    Email
                  </p>
                  <p className={`text-sm ${
                    isDark ? "text-zinc-300" : "text-gray-500"
                  }`}>
                    {email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                  isDark ? "text-zinc-300" : "text-gray-500"
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    isDark ? "text-zinc-200" : "text-gray-700"
                  }`}>
                    Role
                  </p>
                  <p className={`text-sm ${
                    isDark ? "text-zinc-300" : "text-gray-500"
                  }`}>
                    {role}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Session Information */}
          <GlassCard 
            contentClassName="p-6"
            color="green"
            title="Session Information"
          >
            <div className="space-y-4">
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? "text-zinc-200" : "text-gray-700"
                }`}>
                  Last Sign In
                </p>
                <p className={`text-sm ${
                  isDark ? "text-zinc-300" : "text-gray-500"
                }`}>
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Not available'}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? "text-zinc-200" : "text-gray-700"
                }`}>
                  Account Created
                </p>
                <p className={`text-sm ${
                  isDark ? "text-zinc-300" : "text-gray-500"
                }`}>
                  {user?.created_at ? new Date(user.created_at).toLocaleString() : 'Not available'}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
} 