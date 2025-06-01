'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';
import {
  PieChart,
  ClientTrendsChart,
  MetricCard
} from '@/components/ui/charts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity,
  Zap,
  Target,
  DollarSign,
  Percent
} from 'lucide-react';
import { AnalyticsService } from '@/services/analytics-service';
import { ChannelData, ConversionData, PerformanceTrendData } from '@/services/analytics-service';
import { Skeleton } from '@/components/ui/skeleton';

// Define types for the props
interface AnalyticsData {
  metrics: Array<{
    id: number;
    name: string;
    value: number;
    previousValue: number | null;
    changePercentage: number | null;
    period: string | null;
  }>;
  channelData: ChannelData[];
  conversionData: ConversionData[];
  performanceTrends: PerformanceTrendData[];
}

interface ClientPageProps {
  initialAnalyticsData: AnalyticsData;
}

export default function ClientPage({ initialAnalyticsData }: ClientPageProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const service = AnalyticsService.getInstance();
  
  // Use React Query to fetch and cache data, with initial data from the server
  const { data: analyticsData, isLoading, isFetching } = useQuery({
    queryKey: ['analytics-data'],
    queryFn: async () => {
      const metrics = await service.getMetrics();
      const channelData = await service.getChannelData();
      const conversionData = await service.getConversionData();
      const performanceTrends = await service.getPerformanceTrends();
      
      return {
        metrics: metrics.map((metric) => ({
          id: metric.id,
          name: metric.metric_name,
          value: metric.current_value,
          previousValue: metric.previous_value,
          changePercentage: metric.change_percentage,
          period: metric.period,
        })),
        channelData,
        conversionData,
        performanceTrends
      };
    },
    initialData: initialAnalyticsData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Determine if we're in a loading state
  const isLoadingData = isLoading || isFetching;

  return (
    <div className="relative min-h-screen">
      {/* Background with gradient */}
      <div className={cn(
        "fixed inset-0 -z-10",
        isDark 
          ? "bg-gradient-to-br from-[#0F0F12] via-[#171720] to-[#1C1C25]" 
          : "bg-gradient-to-br from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF]"
      )} />
      
      {/* Crisp dot pattern background */}
      <div className="fixed inset-0 -z-8 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: isDark 
            ? "radial-gradient(" + CHART_COLORS[0] + "60 1px, transparent 1px), " + 
              "radial-gradient(" + CHART_COLORS[1] + "60 1px, transparent 1px)"
            : "radial-gradient(" + CHART_COLORS[0] + "40 1px, transparent 1px), " +
              "radial-gradient(" + CHART_COLORS[1] + "40 1px, transparent 1px)",
          backgroundSize: '60px 60px, 80px 80px',
          backgroundPosition: '0 0, 30px 30px',
        }} />
      </div>
      
      {/* Subtle texture overlay */}
      <div className={cn(
        "fixed inset-0 -z-9 opacity-[0.05] pointer-events-none",
        isDark ? "block" : "hidden"
      )} style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'600\' height=\'600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
      }} />
      
      <div className="space-y-3 md:space-y-5 relative z-10 py-2">
        <GlassCard contentClassName="p-3 md:p-5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold flex items-center gap-2 ${
                isDark ? "text-zinc-100" : "text-gray-800"
              }`}>
                <BarChart className={`h-7 w-7 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                Analytics Dashboard
              </h1>
              <p className={`text-sm ${isDark ? "text-zinc-300" : "text-gray-600"}`}>
                Track performance metrics, conversion rates, and campaign effectiveness
              </p>
            </div>
            
            <Tabs defaultValue="month" className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="week" onClick={() => setTimeFrame('week')}>Week</TabsTrigger>
                <TabsTrigger value="month" onClick={() => setTimeFrame('month')}>Month</TabsTrigger>
                <TabsTrigger value="quarter" onClick={() => setTimeFrame('quarter')}>Quarter</TabsTrigger>
                <TabsTrigger value="year" onClick={() => setTimeFrame('year')}>Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </GlassCard>
        
        {/* Key Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-5 lg:grid-cols-4">
          {isLoadingData ? (
            // Show skeleton UI when loading
            Array(4).fill(0).map((_, i) => (
              <GlassCard key={i}>
                <div className="p-4 flex flex-col gap-2">
                  <Skeleton className="h-5 w-32" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
              </GlassCard>
            ))
          ) : (
            // Show actual data when loaded
            analyticsData.metrics.map((metric) => (
              <MetricCard 
                key={metric.id}
                title={metric.name} 
                value={metric.value} 
                prefix={metric.period === '$' ? '$' : ''}
                suffix={metric.period === '%' ? '%' : ''}
                changePercentage={metric.changePercentage || 0}
                color={CHART_COLORS[metric.id % CHART_COLORS.length]}
                showDonut={metric.period === '%'}
              />
            ))
          )}
        </div>

        {/* Charts: Traffic & Conversion */}
        <div className="grid grid-cols-1 gap-3 md:gap-5 lg:grid-cols-2">
          {isLoadingData ? (
            // Show skeleton UI when loading
            Array(2).fill(0).map((_, i) => (
              <GlassCard key={i}>
                <div className="p-4 flex flex-col gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex justify-center items-center h-[240px]">
                    <Skeleton className="h-[200px] w-[200px] rounded-full" />
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            // Show actual charts when loaded
            <>
              <GlassCard>
                <div className="flex flex-col gap-1 p-4">
                  <h2 className={`text-lg font-semibold ${isDark ? "text-zinc-100" : "text-gray-800"}`}>
                    Traffic by Channel
                  </h2>
                  <p className={`text-xs ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                    This {timeFrame}
                  </p>
                  
                  <div className="h-[240px] mt-4">
                    <PieChart
                      data={analyticsData.channelData}
                      innerRadius={50}
                      outerRadius="80%"
                      showLegend={true}
                    />
                  </div>
                </div>
              </GlassCard>
              
              <GlassCard>
                <div className="flex flex-col gap-1 p-4">
                  <h2 className={`text-lg font-semibold ${isDark ? "text-zinc-100" : "text-gray-800"}`}>
                    Conversion Funnel
                  </h2>
                  <p className={`text-xs ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                    This {timeFrame}
                  </p>
                  
                  <div className="h-[240px] mt-4">
                    <PieChart
                      data={analyticsData.conversionData}
                      innerRadius={50}
                      outerRadius="80%"
                      showLegend={true}
                    />
                  </div>
                </div>
              </GlassCard>
            </>
          )}
        </div>
        
        {/* Performance Trends */}
        <GlassCard>
          {isLoadingData ? (
            // Show skeleton UI when loading
            <div className="p-4 flex flex-col gap-2">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-40" />
              <div className="h-[300px] mt-4 w-full">
                <Skeleton className="h-full w-full" />
              </div>
            </div>
          ) : (
            // Show actual chart when loaded
            <div className="flex flex-col gap-1 p-4">
              <h2 className={`text-lg font-semibold ${isDark ? "text-zinc-100" : "text-gray-800"}`}>
                Performance Trends
              </h2>
              <p className={`text-xs ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                Key metrics performance over time
              </p>
              
              <div className="h-[300px] mt-4">
                <ClientTrendsChart 
                  data={analyticsData.performanceTrends as any[]} 
                />
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
} 