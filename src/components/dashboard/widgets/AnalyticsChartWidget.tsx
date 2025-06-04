'use client';

import { WidgetProps } from './types';
import { WidgetEditControls } from './WidgetEditControls';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics-service';
import { PieChart, DonutChart } from '@/components/ui/charts';
import { Skeleton } from '@/components/ui/skeleton';

export function AnalyticsChartWidget({
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
  const title = config.title || 'Analytics Chart';
  const chartType = config.chartType || 'pie'; // 'pie' or 'donut'
  const dataSource = config.dataSource || 'channelData'; // 'channelData' or 'conversionData'
  
  // Safely handle function props
  const handleConfigure = () => {
    if (onConfigChange) onConfigChange(id);
  };

  const handleRemove = () => {
    console.log('AnalyticsChartWidget handling remove for id:', id);
    if (onRemove) {
      // Call after a small delay to ensure event propagation is complete
      setTimeout(() => {
        onRemove();
      }, 10);
    }
  };
  
  // Use React Query to fetch the appropriate data
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-chart-data', dataSource],
    queryFn: async () => {
      console.log(`Fetching data for ${dataSource}`);
      try {
        let result;
        if (dataSource === 'channelData') {
          result = await analyticsService.getChannelData();
        } else if (dataSource === 'conversionData') {
          result = await analyticsService.getConversionData();
        } else {
          result = [];
        }
        console.log(`Got ${dataSource} data:`, result);
        return result;
      } catch (err) {
        console.error(`Error fetching ${dataSource}:`, err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log(`Rendering ${dataSource} chart with data:`, data);

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
        <div className="flex-1 w-full" style={{ minHeight: "160px" }}>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Skeleton className="h-[150px] w-[150px] rounded-full" />
            </div>
          ) : error ? (
            <div className={cn(
              "flex flex-col items-center justify-center h-full text-center",
              isDark ? "text-zinc-400" : "text-gray-500"
            )}>
              <p className="text-sm">Error loading data</p>
              <p className="text-xs mt-1">{String(error)}</p>
            </div>
          ) : data && data.length > 0 ? (
            chartType === 'donut' ? (
              <DonutChart
                data={data}
                innerRadius={50}
                outerRadius="70%"
                showLegend={true}
                className="w-full h-full"
              />
            ) : (
              <PieChart
                data={data}
                innerRadius={0}
                outerRadius="70%"
                showLegend={true}
                className="w-full h-full"
              />
            )
          ) : (
            <div className={cn(
              "flex flex-col items-center justify-center h-full text-center",
              isDark ? "text-zinc-400" : "text-gray-500"
            )}>
              <p className="text-sm">No data available</p>
              <p className="text-xs mt-1">Edit widget to select a different data source</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 