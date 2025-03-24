'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LogOut, 
  UserRound, 
  Mail, 
  Shield, 
  Settings as SettingsIcon, 
  Link as LinkIcon, 
  Lock,
  HistoryIcon,
  ExternalLink
} from 'lucide-react';

// Import our components
import { ProfileForm } from '@/components/profile/ProfileForm';
import { SocialLinksForm } from '@/components/profile/SocialLinksForm';
import { PasswordForm } from '@/components/profile/PasswordForm';
import { SecurityLogs } from '@/components/profile/SecurityLogs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const { 
    profile, 
    preferences, 
    securityLogs, 
    isLoading,
    error,
    updateProfile,
    updateSocialLinks,
    updatePreferences,
    changePassword
  } = useProfile();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Extract profile information from user object and profile data
  const email = user?.email || 'No email available';
  const name = profile?.full_name || user?.user_metadata?.name || email.split('@')[0];
  const role = user?.app_metadata?.role || 'User';

  // Safely access social links (they might be null or undefined)
  const socialLinks = profile?.social_links || {};

  return (
    <div className="relative min-h-screen">
      {/* Background elements preserved from original page */}
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
      
      <div className="space-y-6 md:space-y-8 relative z-10 py-2">
        <GlassCard contentClassName="p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className={`text-2xl font-bold md:text-3xl ${
                isDark ? "text-zinc-100" : "text-gray-800"
              }`}>Your Profile</h1>
              <p className={`mt-2 text-sm md:text-base ${
                isDark ? "text-zinc-300" : "text-gray-600"
              }`}>
                Manage your personal information and account preferences
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                asChild
                variant="outline" 
                className={cn(
                  "flex items-center gap-2",
                  isDark 
                    ? "text-zinc-300 hover:text-zinc-100" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Link href="/dashboard/settings">
                  <SettingsIcon className="h-4 w-4" />
                  <span>Agency Settings</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Profile Card - Left Column */}
          <div className="lg:col-span-1">
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
                  {profile?.job_title || role}
                </p>
                
                <div className="mt-4 w-full border-t border-gray-200 dark:border-zinc-700 pt-4">
                  <div className="flex items-start gap-3 mb-2">
                    <Mail className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                      isDark ? "text-zinc-300" : "text-gray-500"
                    }`} />
                    <div className="text-left">
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
                  
                  <div className="flex items-start gap-3 mb-2">
                    <Shield className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                      isDark ? "text-zinc-300" : "text-gray-500"
                    }`} />
                    <div className="text-left">
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
            
            {/* Navigation Menu */}
            <div className="hidden lg:block mt-6">
              <GlassCard contentClassName="p-1">
                <nav className="space-y-1">
                  {[
                    { id: 'profile', label: 'Profile Information', icon: <UserRound className="h-5 w-5" /> },
                    { id: 'social', label: 'Social Links', icon: <LinkIcon className="h-5 w-5" /> },
                    { id: 'security', label: 'Security', icon: <Lock className="h-5 w-5" /> },
                    { id: 'activity', label: 'Activity Log', icon: <HistoryIcon className="h-5 w-5" /> },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-left transition-colors",
                        activeTab === item.id
                          ? isDark 
                            ? "bg-zinc-800 text-white" 
                            : "bg-blue-50 text-blue-700"
                          : isDark 
                            ? "text-zinc-300 hover:bg-zinc-800 hover:text-white" 
                            : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </GlassCard>
            </div>
          </div>
          
          {/* Main Content - Right Column */}
          <div className="lg:col-span-3">
            {/* Mobile Tabs - Only visible on mobile and tablet */}
            <div className="block lg:hidden mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
                  <TabsTrigger value="social" className="flex-1">Social</TabsTrigger>
                  <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
                  <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <GlassCard contentClassName="p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-2">Loading your profile information...</p>
                </div>
              </GlassCard>
            )}
            
            {/* Error State */}
            {error && !isLoading && (
              <GlassCard contentClassName="p-8 text-center" color="red">
                <div className="flex flex-col items-center justify-center">
                  <Shield className="h-12 w-12 text-red-500 mb-3" />
                  <h3 className="text-lg font-medium text-red-500">Error Loading Profile</h3>
                  <p className="mt-1">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-red-600 hover:bg-red-700"
                  >
                    Retry
                  </Button>
                </div>
              </GlassCard>
            )}
            
            {/* Profile Information Tab */}
            {!isLoading && !error && activeTab === 'profile' && (
              <GlassCard 
                contentClassName="p-6"
                title="Profile Information"
                description="Update your basic profile information"
                color="blue"
              >
                <ProfileForm 
                  initialData={profile || {}} 
                  onSubmit={updateProfile} 
                />
              </GlassCard>
            )}
            
            {/* Social Links Tab */}
            {!isLoading && !error && activeTab === 'social' && (
              <GlassCard 
                contentClassName="p-6"
                title="Social Media Links"
                description="Connect your social media accounts"
                color="indigo"
              >
                <SocialLinksForm 
                  initialData={socialLinks} 
                  onSubmit={updateSocialLinks} 
                />
              </GlassCard>
            )}
            
            {/* Security Tab */}
            {!isLoading && !error && activeTab === 'security' && (
              <GlassCard 
                contentClassName="p-6"
                title="Security Settings"
                description="Update your password and security options"
                color="red"
              >
                <PasswordForm 
                  onSubmit={changePassword} 
                />
              </GlassCard>
            )}
            
            {/* Activity Log Tab */}
            {!isLoading && !error && activeTab === 'activity' && (
              <GlassCard 
                contentClassName="p-6"
                title="Security Activity Log"
                description="Recent security events for your account"
                color="amber"
              >
                <SecurityLogs logs={securityLogs || []} />
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 