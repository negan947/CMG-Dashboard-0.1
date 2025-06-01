'use client';

import { useTheme } from 'next-themes';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';
import { BarChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsLoading() {
  const { theme } = useTheme();
  const isDark = theme !== "light";

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
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="quarter">Quarter</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </GlassCard>
        
        {/* Key Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-5 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
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
          ))}
        </div>

        {/* Charts: Traffic & Conversion */}
        <div className="grid grid-cols-1 gap-3 md:gap-5 lg:grid-cols-2">
          <GlassCard>
            <div className="p-4 flex flex-col gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <div className="flex justify-center items-center h-[240px]">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="p-4 flex flex-col gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <div className="flex justify-center items-center h-[240px]">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              </div>
            </div>
          </GlassCard>
        </div>
        
        {/* Performance Trends */}
        <GlassCard>
          <div className="p-4 flex flex-col gap-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-40" />
            <div className="h-[300px] mt-4 w-full">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 