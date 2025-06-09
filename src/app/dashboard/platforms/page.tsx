'use client';

import { PlusCircle, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlatformKpiCards } from '@/components/dashboard/platforms/PlatformKpiCards';
import { PlatformListTable } from '@/components/dashboard/platforms/PlatformListTable';
import { PlatformHealthChart } from '@/components/dashboard/platforms/PlatformHealthChart';
import { DataVolumeChart } from '@/components/dashboard/platforms/DataVolumeChart';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
// import { PlatformService } from '@/services/platform-service';
// import { getAuthenticatedUser } from '@/lib/auth';

export default function PlatformsPage() {
  const { theme } = useTheme();
  const isDark = theme !== 'light';

  // const user = await getAuthenticatedUser();
  // const agencyId = user?.agencyId;
  // const platforms = agencyId ? await PlatformService.getPlatforms(agencyId) : [];
  // const kpiData = agencyId ? await PlatformService.getPlatformKpis(agencyId) : {};
  
  const platforms = [ // Using mock array for now
    { id: 1, name: 'Google Ads', status: 'active', createdAt: new Date().toISOString(), agencyId: 1, logoUrl: '...' },
    { id: 2, name: 'Facebook Ads', status: 'active', createdAt: new Date().toISOString(), agencyId: 1, logoUrl: '...' },
    { id: 3, name: 'Google Analytics', status: 'disabled', createdAt: new Date().toISOString(), agencyId: 1, logoUrl: '...' },
    { id: 4, name: 'LinkedIn Ads', status: 'error', createdAt: new Date().toISOString(), agencyId: 1, logoUrl: '...' },
  ];
  const kpiData = { // Mock data
    totalPlatforms: 5,
    activeSyncsToday: 12,
    lastSuccessfulSync: new Date().toISOString(),
    syncErrorsToday: 1,
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <GlassCard
        title="Platforms"
        description="Connect, monitor, and manage your data sources"
        headerContent={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Monitor className={cn("h-8 w-8", isDark ? "text-blue-400" : "text-blue-600")} />
              <div>
                <h1 className={cn("text-2xl font-bold md:text-3xl", isDark ? "text-zinc-100" : "text-gray-800")}>
                  Platforms
                </h1>
                <p className={cn("text-md", isDark ? "text-zinc-300" : "text-gray-600")}>
                  Connect, monitor, and manage your data sources
                </p>
              </div>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Connect New Platform
            </Button>
          </div>
        }
        contentClassName="p-0"
      >
        {/* The GlassCard is now just a header, content is outside */}
      </GlassCard>

      {platforms.length === 0 ? (
        <GlassCard contentClassName="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-2xl font-bold">No platforms connected</div>
              <p className="text-muted-foreground mt-2">
                Connect your first platform to start ingesting data.
              </p>
              <Button className="mt-6">
                <PlusCircle className="mr-2 h-4 w-4" />
                Connect Your First Platform
              </Button>
            </div>
        </GlassCard>
      ) : (
        <div className="space-y-8">
          <PlatformKpiCards data={kpiData} />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
            <GlassCard className="lg:col-span-4" contentClassName="p-4">
              <PlatformHealthChart />
            </GlassCard>
            <GlassCard className="lg:col-span-3" contentClassName="p-4">
              <DataVolumeChart />
            </GlassCard>
          </div>
          <GlassCard title="Platform List" contentClassName="p-0">
            <PlatformListTable platforms={platforms} />
          </GlassCard>
          <GlassCard title="Upcoming Scheduled Syncs">
            <p className="p-6">Upcoming syncs will be displayed here.</p>
          </GlassCard>
        </div>
      )}
    </div>
  );
} 