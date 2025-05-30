export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSettingsData, checkSettingsAccess } from './actions';
import { SettingsPageClient } from './client';
import { GlassCard } from '@/components/ui/glass-card';
import { Shield } from 'lucide-react';

/**
 * Server-side settings page with proper authentication and authorization
 * This page handles initial data loading securely on the server
 */
export default async function SettingsPage() {
  // Server-side access check
  const accessCheck = await checkSettingsAccess();
  
  if (!accessCheck.success) {
    return (
      <div className="relative min-h-screen">
        <div className="space-y-6 md:space-y-8 relative z-10 py-2">
          <GlassCard contentClassName="p-6" color="red">
            <div className="flex flex-col items-center text-center p-4">
              <Shield className="h-12 w-12 text-red-500 mb-3" />
              <h3 className="text-lg font-medium text-red-600 dark:text-red-300">
                Settings Access Error
              </h3>
              <p className="mt-2 max-w-md mx-auto">
                {accessCheck.error || 'Unable to access settings. Please contact your administrator.'}
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (!accessCheck.tablesExist) {
    return (
      <div className="relative min-h-screen">
        <div className="space-y-6 md:space-y-8 relative z-10 py-2">
          <GlassCard contentClassName="p-6" color="amber">
            <div className="flex flex-col items-center text-center p-4">
              <Shield className="h-12 w-12 text-amber-500 mb-3" />
              <h3 className="text-lg font-medium text-amber-600 dark:text-amber-300">
                Settings Database Not Ready
              </h3>
              <p className="mt-2 max-w-md mx-auto">
                The settings database tables have not been created yet. Please contact your administrator 
                to set up the required database schema.
              </p>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>Administrator Note:</strong> Run the database migration scripts to create 
                  the required settings tables.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (!accessCheck.hasAccess) {
    return (
      <div className="relative min-h-screen">
        <div className="space-y-6 md:space-y-8 relative z-10 py-2">
          <GlassCard contentClassName="p-6" color="red">
            <div className="flex flex-col items-center text-center p-4">
              <Shield className="h-12 w-12 text-red-500 mb-3" />
              <h3 className="text-lg font-medium text-red-600 dark:text-red-300">
                Access Denied
              </h3>
              <p className="mt-2 max-w-md mx-auto">
                You do not have permission to access these settings. This may be because:
              </p>
              <ul className="mt-2 max-w-md mx-auto text-left list-disc list-inside text-sm">
                <li>You are not an owner or administrator of this agency</li>
                <li>Your team role doesn't include settings management permissions</li>
                <li>Your account access has been restricted</li>
              </ul>
              <p className="mt-3 max-w-md mx-auto text-sm opacity-80">
                Contact your agency administrator for assistance.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Server-side data fetching with proper authentication
  const settingsResult = await getSettingsData();
  
  if (!settingsResult.success) {
    return (
      <div className="relative min-h-screen">
        <div className="space-y-6 md:space-y-8 relative z-10 py-2">
          <GlassCard contentClassName="p-6" color="red">
            <div className="flex flex-col items-center text-center p-4">
              <Shield className="h-12 w-12 text-red-500 mb-3" />
              <h3 className="text-lg font-medium text-red-600 dark:text-red-300">
                Failed to Load Settings
              </h3>
              <p className="mt-2 max-w-md mx-auto">
                {settingsResult.error || 'An unexpected error occurred while loading your settings.'}
              </p>
              <div className="mt-4">
                <form action="">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Retry
                  </button>
                </form>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Successfully loaded settings - render client component with server data
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsPageClient initialData={settingsResult.data!} />
    </Suspense>
  );
}

/**
 * Loading skeleton for settings page
 */
function SettingsPageSkeleton() {
  return (
    <div className="relative min-h-screen">
      <div className="space-y-6 md:space-y-8 relative z-10 py-2">
        <GlassCard contentClassName="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </GlassCard>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <GlassCard contentClassName="p-4">
              <div className="animate-pulse space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </GlassCard>
          </div>
          
          <div className="lg:col-span-3">
            <GlassCard contentClassName="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
} 