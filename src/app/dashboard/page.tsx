'use client';

import { useAuth } from '@/hooks/use-auth';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { useCampaignData } from '@/hooks/use-campaign-data';
import { useTheme } from 'next-themes';
import {
  BarChart,
  LineChart,
  PieChart,
  MetricCard
} from '@/components/ui/charts';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { metrics, categories, trend, isLoading: metricsLoading } = useDashboardMetrics();
  const { 
    statusCounts, 
    platformPerformance, 
    isLoading: campaignsLoading 
  } = useCampaignData();
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  const userName = user?.email ? user.email.split('@')[0] : 'User';
  const isLoading = metricsLoading || campaignsLoading;

  // Format campaign status data for pie chart
  const campaignStatusData = statusCounts.map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
    color: s.status === 'active' ? 'hsl(150, 85%, 60%)' : 
           s.status === 'completed' ? 'hsl(240, 85%, 75%)' : 
           s.status === 'planned' ? 'hsl(35, 100%, 65%)' : 'hsl(0, 95%, 75%)',
  }));

  // Format platform performance data for bar chart
  const platformPerformanceData = platformPerformance.map(p => ({
    name: p.platform,
    impressions: p.impressions / 1000, // Convert to thousands
    clicks: p.clicks,
    conversions: p.conversions,
  }));

  // Format client categories data for pie chart
  const clientCategoriesData = categories.map(c => ({
    name: c.name,
    value: c.count,
    color: c.color || undefined,
  }));

  // Format client activity trend data for line chart
  const clientActivityData = trend.map(t => ({
    name: t.name,
    activity: t.value,
  }));

  // Platform performance chart series
  const platformSeries = [
    { name: 'Impressions (x1000)', key: 'impressions', color: 'hsl(220, 100%, 70%)' },
    { name: 'Clicks', key: 'clicks', color: 'hsl(150, 85%, 60%)' },
    { name: 'Conversions', key: 'conversions', color: 'hsl(35, 100%, 65%)' },
  ];
  
  // Client activity chart series
  const activitySeries = [
    { name: 'Client Activity', key: 'activity', color: 'hsl(220, 100%, 70%)', type: 'monotone' as const },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className={`text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Colorful background with gradient - using same gradient as in DashboardLayout */}
      <div className={cn(
        "fixed inset-0 -z-10",
        isDark 
          ? "bg-gradient-to-br from-[#0F0F12] via-[#171720] to-[#1C1C25]" 
          : "bg-gradient-to-br from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF]"
      )} />
      
      {/* Glowing accent orbs for visual effect - matched with DashboardLayout */}
      <div className={cn(
        "fixed -top-20 -left-20 -z-5 h-72 w-72 rounded-full blur-[100px]",
        isDark ? "bg-purple-900 opacity-[0.15]" : "bg-purple-400 opacity-[0.18]"
      )} />
      <div className={cn(
        "fixed top-1/3 right-1/4 -z-5 h-60 w-60 rounded-full blur-[80px]",
        isDark ? "bg-blue-900 opacity-[0.15]" : "bg-blue-400 opacity-[0.18]"
      )} />
      <div className={cn(
        "fixed bottom-1/4 -right-10 -z-5 h-48 w-48 rounded-full blur-[70px]",
        isDark ? "bg-fuchsia-900 opacity-[0.1]" : "bg-pink-300 opacity-[0.15]"
      )} />
      <div className={cn(
        "fixed top-2/3 left-1/4 -z-5 h-36 w-36 rounded-full blur-[60px]",
        isDark ? "bg-indigo-900 opacity-[0.1]" : "bg-indigo-400 opacity-[0.15]"
      )} />
      
      {/* Subtle brushed metal texture overlay */}
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
          }`}>Welcome back, {userName}</h1>
          <p className={`mt-2 text-sm md:text-base ${
            isDark ? "text-zinc-300" : "text-gray-600"
          }`}>
            Here's an overview of your marketing performance and client activities.
          </p>
        </GlassCard>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          <MetricCard 
            title="Objectives" 
            value={metrics[0]?.value || 78} 
            suffix="%" 
            color="blue" 
          />
          
          <MetricCard 
            title="New Leads" 
            value={metrics[1]?.value || 24} 
            maxValue={50} 
            color="purple" 
          />
          
          <MetricCard 
            title="Inquiry Success Rate" 
            value={metrics[2]?.value || 65} 
            suffix="%" 
            color="green" 
          />
          
          <MetricCard 
            title="Overview" 
            value={metrics[3]?.value || 92} 
            suffix="%" 
            color="amber" 
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PieChart
            title="Campaign Status"
            data={campaignStatusData}
            innerRadius={50}
          />
          
          <BarChart
            title="Platform Performance"
            data={platformPerformanceData}
            series={platformSeries}
          />
        </div>
        
        <PieChart
          title="Client Categories"
          data={clientCategoriesData}
          innerRadius={0}
        />
        
        <LineChart
          title="Client Activity Trend"
          data={clientActivityData}
          series={activitySeries}
          showAreaGradient={true}
        />

        <GlassCard contentClassName="p-6">
          <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <h2 className={`text-base font-semibold md:text-lg ${
              isDark ? "text-zinc-100" : "text-gray-800"
            }`}>Campaign Overview</h2>
            <div className="mt-2 md:mt-0">
              <a href="/dashboard/campaigns" className={`text-sm font-medium transition-colors ${
                isDark 
                  ? "text-zinc-300 hover:text-white" 
                  : "text-blue-600 hover:text-blue-800"
              }`}>
                View all campaigns
              </a>
            </div>
          </div>
          
          <div className="mt-6 overflow-x-auto">
            <table className={`min-w-full divide-y ${
              isDark ? "divide-zinc-700" : "divide-gray-200"
            }`}>
              <thead>
                <tr>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-zinc-400" : "text-gray-500"
                  }`}>
                    Campaign
                  </th>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-zinc-400" : "text-gray-500"
                  }`}>
                    Platform
                  </th>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-zinc-400" : "text-gray-500"
                  }`}>
                    Status
                  </th>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-zinc-400" : "text-gray-500"
                  }`}>
                    Budget
                  </th>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-zinc-400" : "text-gray-500"
                  }`}>
                    Spent
                  </th>
                  <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-zinc-400" : "text-gray-500"
                  }`}>
                    ROI
                  </th>
                </tr>
              </thead>
              <tbody className={isDark ? "divide-y divide-zinc-700" : "divide-y divide-gray-200"}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={`transition-colors ${
                    isDark ? "hover:bg-zinc-800/40" : "hover:bg-gray-50/80"
                  }`}>
                    <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                      isDark ? "text-zinc-300" : "text-gray-800"
                    }`}>
                      Campaign {i + 1}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                      isDark ? "text-zinc-300" : "text-gray-800"
                    }`}>
                      {['Facebook', 'Instagram', 'Google', 'Twitter', 'LinkedIn'][i]}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-4 text-sm`}>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        i % 3 === 0 
                          ? "bg-green-100 text-green-800" 
                          : i % 3 === 1 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-amber-100 text-amber-800"
                      }`}>
                        {i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Completed' : 'Planned'}
                      </span>
                    </td>
                    <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                      isDark ? "text-zinc-300" : "text-gray-800"
                    }`}>
                      ${(2000 + i * 1500).toLocaleString()}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                      isDark ? "text-zinc-300" : "text-gray-800"
                    }`}>
                      ${Math.floor((1500 + i * 800) * (i % 3 === 1 ? 1 : 0.7)).toLocaleString()}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                      isDark ? "text-zinc-300" : "text-gray-800"
                    }`}>
                      {(120 + i * 15)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 