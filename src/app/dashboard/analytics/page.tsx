'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
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

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Sample data for charts
  const channelData = [
    { name: 'Organic', value: 35.2, color: CHART_COLORS[0] },
    { name: 'Paid', value: 42.8, color: CHART_COLORS[1] },
    { name: 'Social', value: 15.5, color: CHART_COLORS[2] },
    { name: 'Referral', value: 6.5, color: CHART_COLORS[3] }
  ];

  const conversionData = [
    { name: 'Converted', value: 28.4, color: CHART_COLORS[0] },
    { name: 'In Progress', value: 42.6, color: CHART_COLORS[1] },
    { name: 'Lost', value: 29.0, color: CHART_COLORS[2] }
  ];

  // Sample data for performance trends
  const performanceTrendData = [
    { name: 'Week 1', 'Engagement': 42, 'Conversion': 18, 'Revenue': 5400 },
    { name: 'Week 2', 'Engagement': 38, 'Conversion': 24, 'Revenue': 7200 },
    { name: 'Week 3', 'Engagement': 56, 'Conversion': 28, 'Revenue': 9600 },
    { name: 'Week 4', 'Engagement': 64, 'Conversion': 32, 'Revenue': 12800 },
  ];

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
          <MetricCard 
            title="Conversion Rate" 
            value={28.4} 
            suffix="%" 
            changePercentage={3.2}
            color={CHART_COLORS[0]}
            showDonut={true}
          />
          
          <MetricCard 
            title="Avg. Revenue" 
            value={1250} 
            prefix="$"
            changePercentage={12.5}
            color={CHART_COLORS[1]}
            showDonut={false} 
          />
          
          <MetricCard 
            title="Engagement" 
            value={64} 
            suffix="%"
            changePercentage={8.7}
            color={CHART_COLORS[2]}
            showDonut={true}
          />
          
          <MetricCard 
            title="Goal Completion" 
            value={72} 
            suffix="%"
            changePercentage={5.3}
            color={CHART_COLORS[3]}
            showDonut={true}
          />
        </div>

        {/* Charts: Traffic & Conversion */}
        <div className="grid grid-cols-1 gap-3 md:gap-5 lg:grid-cols-2">
          <PieChart
            title="Traffic by Channel"
            subtitle={`This ${timeFrame}`}
            data={channelData}
            innerRadius={50}
            outerRadius="80%"
            showLegend={true}
          />
          
          <PieChart
            title="Conversion Funnel"
            subtitle={`This ${timeFrame}`}
            data={conversionData}
            innerRadius={50}
            outerRadius="80%"
            showLegend={true}
          />
        </div>
        
        {/* Performance Trends */}
        <GlassCard>
          <div className="flex flex-col gap-1 p-4">
            <h2 className={`text-lg font-semibold ${isDark ? "text-zinc-100" : "text-gray-800"}`}>
              Performance Trends
            </h2>
            <p className={`text-xs ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
              Key metrics performance over time
            </p>
            
            <div className="h-[300px] mt-4">
              <ClientTrendsChart 
                title="Performance Trends"
                subtitle={`This ${timeFrame}`}
                data={performanceTrendData} 
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 