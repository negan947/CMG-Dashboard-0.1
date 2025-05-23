'use client';

import { useState, useTransition } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
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
  Loader2 
} from 'lucide-react';

// Import settings components
import { SecureGeneralSettingsForm } from '@/components/settings/SecureGeneralSettingsForm';
import { TeamManagement } from '@/components/settings/TeamManagement';

// Server actions
import { updateGeneralSettings, updateSecuritySettings } from './actions';

interface SettingsData {
  generalSettings: any;
  billingSettings: any;
  notificationSettings: any;
  teamSettings: any;
  securitySettings: any;
  integrationSettings: any;
  teamMembers: any[];
  agencyId: string;
}

interface SettingsPageClientProps {
  initialData: SettingsData;
}

export function SettingsPageClient({ initialData }: SettingsPageClientProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [activeTab, setActiveTab] = useState('general');
  const [isPending, startTransition] = useTransition();

  // Handle server action with optimistic updates
  const handleGeneralSettingsSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateGeneralSettings(formData);
      
      if (result.success) {
        toast.success('General settings updated successfully');
      } else {
        toast.error(result.error || 'Failed to update settings');
      }
    });
  };

  const handleSecuritySettingsSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateSecuritySettings(formData);
      
      if (result.success) {
        toast.success('Security settings updated successfully');
      } else {
        toast.error(result.error || 'Failed to update security settings');
      }
    });
  };

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold md:text-3xl ${
                isDark ? "text-zinc-100" : "text-gray-800"
              }`}>Agency Settings</h1>
              <p className={`mt-2 text-sm md:text-base ${
                isDark ? "text-zinc-300" : "text-gray-600"
              }`}>
                Configure your agency settings, billing, notifications, team, security, and integrations
              </p>
            </div>
            {isPending && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
          </div>
        </GlassCard>

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
                    disabled={isPending}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-left transition-colors disabled:opacity-50",
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
                  <TabsTrigger value="general" className="flex-1" disabled={isPending}>General</TabsTrigger>
                  <TabsTrigger value="billing" className="flex-1" disabled={isPending}>Billing</TabsTrigger>
                  <TabsTrigger value="notifications" className="flex-1" disabled={isPending}>Notifications</TabsTrigger>
                  <TabsTrigger value="team" className="flex-1" disabled={isPending}>Team</TabsTrigger>
                  <TabsTrigger value="security" className="flex-1" disabled={isPending}>Security</TabsTrigger>
                  <TabsTrigger value="integrations" className="flex-1" disabled={isPending}>Integrations</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <GlassCard 
                contentClassName="p-6"
                title="General Settings"
                description="Configure your agency's basic information and regional settings"
                color="blue"
              >
                <SecureGeneralSettingsForm 
                  initialData={initialData.generalSettings}
                  onSubmit={handleGeneralSettingsSubmit}
                  isSubmitting={isPending}
                />
              </GlassCard>
            )}
            
            {/* Billing Settings Tab */}
            {activeTab === 'billing' && (
              <GlassCard 
                contentClassName="p-6"
                title="Billing Settings"
                description="Configure your billing information and payment preferences"
                color="green"
              >
                <div className="p-4 text-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                  <p>Billing settings component will be implemented in the next sprint.</p>
                  <p className="text-sm mt-2 opacity-75">This will include payment methods, billing history, and subscription management.</p>
                </div>
              </GlassCard>
            )}
            
            {/* Notification Settings Tab */}
            {activeTab === 'notifications' && (
              <GlassCard 
                contentClassName="p-6"
                title="Notification Settings"
                description="Configure how and when you receive notifications"
                color="amber"
              >
                <div className="p-4 text-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                  <p>Notification settings component will be implemented in the next sprint.</p>
                  <p className="text-sm mt-2 opacity-75">This will include email notifications, push notifications, and alert preferences.</p>
                </div>
              </GlassCard>
            )}
            
            {/* Team Settings Tab */}
            {activeTab === 'team' && (
              <GlassCard 
                contentClassName="p-6"
                title="Team Management"
                description="Manage your team members and their permissions"
                color="indigo"
              >
                <TeamManagement 
                  members={initialData.teamMembers}
                  isLoading={isPending}
                />
              </GlassCard>
            )}
            
            {/* Security Settings Tab */}
            {activeTab === 'security' && (
              <GlassCard 
                contentClassName="p-6"
                title="Security Settings"
                description="Configure security settings and policies"
                color="red"
              >
                <div className="space-y-6">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800 dark:text-red-200">Security Notice</h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          Changes to security settings require your current password for verification.
                          All security changes are logged for audit purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <form action={handleSecuritySettingsSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Current Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="current_password"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        placeholder="Enter your current password"
                      />
                    </div>
                    
                    <div className="p-4 text-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                      <p>Additional security settings will be implemented in the next sprint.</p>
                      <p className="text-sm mt-2 opacity-75">This will include 2FA, session management, and access controls.</p>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating Security Settings...
                        </>
                      ) : (
                        'Update Security Settings'
                      )}
                    </Button>
                  </form>
                </div>
              </GlassCard>
            )}
            
            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <GlassCard 
                contentClassName="p-6"
                title="Integrations"
                description="Connect with external tools and services"
                color="purple"
              >
                <div className="p-4 text-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                  <p>Integrations component will be implemented in the next sprint.</p>
                  <p className="text-sm mt-2 opacity-75">This will include API keys, webhooks, and third-party service connections.</p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 