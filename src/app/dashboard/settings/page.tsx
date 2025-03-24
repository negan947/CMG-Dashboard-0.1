'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  CreditCard, 
  Bell, 
  Users, 
  Shield, 
  Zap, 
  Settings as SettingsIcon 
} from 'lucide-react';

// Import settings components
import { GeneralSettingsForm } from '@/components/settings/GeneralSettingsForm';
import { TeamManagement } from '@/components/settings/TeamManagement';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [activeTab, setActiveTab] = useState('general');
  
  const { 
    generalSettings, 
    billingSettings,
    notificationSettings,
    teamSettings, 
    securitySettings,
    integrationSettings,
    teamMembers,
    isLoading,
    error,
    updateGeneralSettings,
    updateBillingSettings,
    updateNotificationSettings,
    updateTeamSettings,
    updateSecuritySettings,
    updateIntegrationSettings,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
    tablesExist,
    permissionIssue
  } = useSettings();

  // Automatically create default settings for new users
  useEffect(() => {
    const initializeDefaultSettings = async () => {
      if (!isLoading && !error && user) {
        // Check if any settings exist - if all are empty objects, we likely need to initialize
        const hasSettings = 
          Object.keys(generalSettings || {}).length > 0 ||
          Object.keys(billingSettings || {}).length > 0 ||
          Object.keys(notificationSettings || {}).length > 0 ||
          Object.keys(teamSettings || {}).length > 0 ||
          Object.keys(securitySettings || {}).length > 0 ||
          Object.keys(integrationSettings || {}).length > 0;
        
        if (!hasSettings) {
          // Initialize with default general settings
          const defaultGeneralSettings = {
            agency_name: user.email?.split('@')[0] || 'My Agency',
            agency_email: user.email || '',
            agency_logo_url: '',
            agency_website: '',
            agency_phone: '',
            default_currency: 'USD' as const,
            timezone: 'UTC',
            date_format: 'MM/DD/YYYY' as const,
            time_format: '12h' as const
          };
          
          await updateGeneralSettings(defaultGeneralSettings);
        }
      }
    };
    
    initializeDefaultSettings();
  }, [
    isLoading, 
    error, 
    user, 
    generalSettings, 
    billingSettings, 
    notificationSettings, 
    teamSettings, 
    securitySettings, 
    integrationSettings, 
    updateGeneralSettings
  ]);

  return (
    <div className="relative min-h-screen">
      {/* Background elements */}
      <div className={cn(
        "fixed inset-0 -z-10",
        isDark 
          ? "bg-gradient-to-br from-[#0F0F12] via-[#171720] to-[#1C1C25]" 
          : "bg-gradient-to-br from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF]"
      )} />
      
      <div className={cn(
        "fixed -top-20 -left-20 -z-5 h-72 w-72 rounded-full blur-[100px]",
        isDark ? "bg-blue-900 opacity-[0.15]" : "bg-blue-400 opacity-[0.18]"
      )} />
      <div className={cn(
        "fixed top-1/3 right-1/4 -z-5 h-60 w-60 rounded-full blur-[80px]",
        isDark ? "bg-indigo-900 opacity-[0.15]" : "bg-indigo-400 opacity-[0.18]"
      )} />
      <div className={cn(
        "fixed bottom-1/4 -right-10 -z-5 h-48 w-48 rounded-full blur-[70px]",
        isDark ? "bg-cyan-900 opacity-[0.1]" : "bg-cyan-300 opacity-[0.15]"
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
          <h1 className={`text-2xl font-bold md:text-3xl ${
            isDark ? "text-zinc-100" : "text-gray-800"
          }`}>Agency Settings</h1>
          <p className={`mt-2 text-sm md:text-base ${
            isDark ? "text-zinc-300" : "text-gray-600"
          }`}>
            Configure your agency settings, billing, notifications, team, security, and integrations
          </p>
        </GlassCard>

        {/* Tables Don't Exist Message */}
        {!isLoading && !tablesExist && (
          <GlassCard contentClassName="p-6" color="amber">
            <div className="flex flex-col items-center text-center p-4">
              <Shield className="h-12 w-12 text-amber-500 mb-3" />
              <h3 className={`text-lg font-medium ${isDark ? "text-amber-300" : "text-amber-600"}`}>
                Settings Tables Not Available
              </h3>
              <p className="mt-2 max-w-md mx-auto">
                The database tables for settings have not been created yet. This is a demo application 
                so we're handling this gracefully. In a production environment, you would need to run 
                database migrations to set up these tables.
              </p>
              <p className="mt-2 max-w-md mx-auto text-sm opacity-80">
                Contact your administrator to set up the required database tables.
              </p>
            </div>
          </GlassCard>
        )}

        {/* Permission Issues Message */}
        {!isLoading && permissionIssue && (
          <GlassCard contentClassName="p-6" color="red">
            <div className="flex flex-col items-center text-center p-4">
              <Shield className="h-12 w-12 text-red-500 mb-3" />
              <h3 className={`text-lg font-medium ${isDark ? "text-red-300" : "text-red-600"}`}>
                Permission Error
              </h3>
              <p className="mt-2 max-w-md mx-auto">
                You do not have permission to access these settings. This may be because:
              </p>
              <ul className="mt-2 max-w-md mx-auto text-left list-disc list-inside">
                <li>Your user account doesn't have the necessary permissions</li>
                <li>The database RLS (Row Level Security) policies are preventing access</li>
                <li>The agency ID doesn't match your user ID in the database</li>
              </ul>
              <p className="mt-2 max-w-md mx-auto text-sm opacity-80">
                Contact your administrator for assistance.
              </p>
            </div>
          </GlassCard>
        )}

        {tablesExist && !permissionIssue && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Settings Navigation - Left Column */}
            <div className="lg:col-span-1">
              <GlassCard contentClassName="p-1">
                <nav className="space-y-1">
                  {[
                    { id: 'general', label: 'General', icon: <Building className="h-5 w-5" /> },
                    { id: 'billing', label: 'Billing', icon: <CreditCard className="h-5 w-5" /> },
                    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
                    { id: 'team', label: 'Team', icon: <Users className="h-5 w-5" /> },
                    { id: 'security', label: 'Security', icon: <Shield className="h-5 w-5" /> },
                    { id: 'integrations', label: 'Integrations', icon: <Zap className="h-5 w-5" /> },
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
            
            {/* Main Content - Right Column */}
            <div className="lg:col-span-3">
              {/* Mobile Tabs - Only visible on mobile and tablet */}
              <div className="block lg:hidden mb-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
                    <TabsTrigger value="billing" className="flex-1">Billing</TabsTrigger>
                    <TabsTrigger value="notifications" className="flex-1">Notifications</TabsTrigger>
                    <TabsTrigger value="team" className="flex-1">Team</TabsTrigger>
                    <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
                    <TabsTrigger value="integrations" className="flex-1">Integrations</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Loading State */}
              {isLoading && (
                <GlassCard contentClassName="p-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2">Loading settings...</p>
                  </div>
                </GlassCard>
              )}
              
              {/* Error State */}
              {error && !isLoading && !permissionIssue && !tablesExist && (
                <GlassCard contentClassName="p-8 text-center" color="red">
                  <div className="flex flex-col items-center justify-center">
                    <Shield className="h-12 w-12 text-red-500 mb-3" />
                    <h3 className="text-lg font-medium text-red-500">Error Loading Settings</h3>
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
              
              {/* General Settings Tab */}
              {!isLoading && !error && activeTab === 'general' && (
                <GlassCard 
                  contentClassName="p-6"
                  title="General Settings"
                  description="Configure your agency's basic information and regional settings"
                  color="blue"
                >
                  <GeneralSettingsForm 
                    initialData={generalSettings} 
                    onSubmit={updateGeneralSettings} 
                  />
                </GlassCard>
              )}
              
              {/* Billing Settings Tab */}
              {!isLoading && !error && activeTab === 'billing' && (
                <GlassCard 
                  contentClassName="p-6"
                  title="Billing Settings"
                  description="Configure your billing information and payment preferences"
                  color="green"
                >
                  <div className="p-4 text-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                    <p>Billing settings component will be implemented in the next sprint.</p>
                  </div>
                </GlassCard>
              )}
              
              {/* Notification Settings Tab */}
              {!isLoading && !error && activeTab === 'notifications' && (
                <GlassCard 
                  contentClassName="p-6"
                  title="Notification Settings"
                  description="Configure how and when you receive notifications"
                  color="amber"
                >
                  <div className="p-4 text-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                    <p>Notification settings component will be implemented in the next sprint.</p>
                  </div>
                </GlassCard>
              )}
              
              {/* Team Settings Tab */}
              {!isLoading && !error && activeTab === 'team' && (
                <GlassCard 
                  contentClassName="p-6"
                  title="Team Management"
                  description="Manage your team members and their permissions"
                  color="indigo"
                >
                  <TeamManagement 
                    members={teamMembers} 
                    onInvite={inviteTeamMember}
                    onUpdate={updateTeamMember}
                    onRemove={removeTeamMember}
                  />
                </GlassCard>
              )}
              
              {/* Security Settings Tab */}
              {!isLoading && !error && activeTab === 'security' && (
                <GlassCard 
                  contentClassName="p-6"
                  title="Security Settings"
                  description="Configure security settings and policies"
                  color="red"
                >
                  <div className="p-4 text-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                    <p>Security settings component will be implemented in the next sprint.</p>
                  </div>
                </GlassCard>
              )}
              
              {/* Integrations Tab */}
              {!isLoading && !error && activeTab === 'integrations' && (
                <GlassCard 
                  contentClassName="p-6"
                  title="Integrations"
                  description="Connect with external tools and services"
                  color="purple"
                >
                  <div className="p-4 text-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                    <p>Integrations component will be implemented in the next sprint.</p>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 