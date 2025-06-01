import { GlassCard } from '@/components/ui/glass-card';
import { Suspense } from 'react';

export default function DashboardLoading() {
  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF] dark:from-[#0F0F12] dark:via-[#171720] dark:to-[#1C1C25]" />
      
      <div className="space-y-4 sm:space-y-5 md:space-y-6 py-4">
        {/* Header skeleton */}
        <GlassCard contentClassName="p-4 lg:p-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
          <div className="h-4 w-96 mt-2 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
        </GlassCard>
        
        {/* Metric cards skeleton - first row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonMetricCard key={`metric-1-${i}`} />
          ))}
        </div>
        
        {/* Metric cards skeleton - second row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonMetricCard key={`metric-2-${i}`} />
          ))}
        </div>
        
        {/* Charts skeleton - first row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonChartCard />
          <SkeletonChartCard />
        </div>
        
        {/* Charts skeleton - second row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonChartCard />
          <SkeletonChartCard />
        </div>
        
        {/* Table skeleton */}
        <GlassCard>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
              <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
            </div>
            
            <div className="mt-6">
              <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
              
              <div className="mt-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={`row-${i}`} className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function SkeletonMetricCard() {
  return (
    <GlassCard>
      <div className="p-4">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
        <div className="mt-3 h-8 w-16 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
        <div className="mt-2 h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
      </div>
    </GlassCard>
  );
}

function SkeletonChartCard() {
  return (
    <GlassCard>
      <div className="p-6">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
        <div className="mt-2 h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
        <div className="mt-6 h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
      </div>
    </GlassCard>
  );
} 