'use client';

import { WidgetProps } from './types';
import { WidgetEditControls } from './WidgetEditControls';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics-service';
import { ClientTrendsChart } from '@/components/ui/charts';
import { Skeleton } from '@/components/ui/skeleton';
import { PerformanceTrendData } from '@/services/analytics-service';

export function PerformanceTrendsWidget({
  id,
  config,
  isEditing,
  onConfigChange,
  onRemove,
}: WidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const analyticsService = AnalyticsService.getInstance();
  
  // Get configured values
  const title = config.title || 'Performance Trends';
  const timeRange = config.timeRange || 'month';
  
  // Use React Query to fetch the trend data
  const { data, isLoading } = useQuery({
    queryKey: ['performance-trends', timeRange],
    queryFn: async () => {
      return await analyticsService.getPerformanceTrends();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Safely handle function props
  const handleConfigure = () => {
    if (onConfigChange) onConfigChange(id);
  };

  const handleRemove = () => {
    console.log('PerformanceTrendsWidget handling remove for id:', id);
    if (onRemove) {
      // Call after a small delay to ensure event propagation is complete
      setTimeout(() => {
        onRemove();
      }, 10);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {isEditing && (
        <WidgetEditControls 
          onConfigure={handleConfigure} 
          onRemove={handleRemove} 
        />
      )}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className={cn(
          "text-lg font-semibold mb-2",
          isDark ? "text-zinc-100" : "text-gray-900"
        )}>
          {title}
        </h3>
        {timeRange && (
          <p className={cn(
            "text-xs mb-2",
            isDark ? "text-zinc-400" : "text-gray-500"
          )}>
            This {timeRange}
          </p>
        )}
        <div className="flex-1 w-full" style={{ minHeight: "160px" }}>
          {isLoading ? (
            <div className="w-full h-full flex justify-center items-center">
              <Skeleton className="h-[90%] w-[95%]" />
            </div>
          ) : data && data.length > 0 ? (
            <ClientTrendsChart 
              data={data as any[]} 
              className="w-full h-full"
            />
          ) : (
            <div className={cn(
              "flex flex-col items-center justify-center h-full text-center",
              isDark ? "text-zinc-400" : "text-gray-500"
            )}>
              <p className="text-sm">No performance trend data available</p>
              <p className="text-xs mt-1">Try changing the time range or check your data source</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 