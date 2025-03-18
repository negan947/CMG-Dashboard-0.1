'use client';

import { useAuth } from '@/hooks/use-auth';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { useCampaignData } from '@/hooks/use-campaign-data';
import { useTheme } from 'next-themes';
import {
  PieChart,
  ClientTrendsChart,
  MetricCard
} from '@/components/ui/charts';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';
import { SupportRequestsCard } from '@/components/support-requests-card';

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

  // Sample client trends data (based on the screenshot)
  const clientTrendsData = [
    { name: 'Week 1', 'KLINT.RO': 14, 'Rustufuria': 12, 'Nike': 0 },
    { name: 'Week 2', 'KLINT.RO': 10, 'Rustufuria': 6, 'Nike': 30 },
    { name: 'Week 3', 'KLINT.RO': 38, 'Rustufuria': 20, 'Nike': 25 },
    { name: 'Week 4', 'KLINT.RO': 30, 'Rustufuria': 15, 'Nike': 40 },
  ];

  // Sample funnel channel data
  const funnelChannelData = [
    { name: 'Google', value: 42.5, color: CHART_COLORS[0] },
    { name: 'Meta', value: 24.3, color: CHART_COLORS[1] },
    { name: 'TikTok', value: 18.7, color: CHART_COLORS[2] },
    { name: 'IRL', value: 14.5, color: CHART_COLORS[3] }
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
      
      {/* Crisp dot pattern background */}
      <div className="fixed inset-0 -z-8 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: isDark 
            ? "radial-gradient(" + CHART_COLORS[0] + "60 1px, transparent 1px), " + 
              "radial-gradient(" + CHART_COLORS[1] + "60 1px, transparent 1px), " +
              "radial-gradient(" + CHART_COLORS[2] + "40 1px, transparent 1px), " +
              "radial-gradient(" + CHART_COLORS[3] + "40 1px, transparent 1px)"
            : "radial-gradient(" + CHART_COLORS[0] + "40 1px, transparent 1px), " +
              "radial-gradient(" + CHART_COLORS[1] + "40 1px, transparent 1px), " +
              "radial-gradient(" + CHART_COLORS[2] + "30 1px, transparent 1px), " +
              "radial-gradient(" + CHART_COLORS[3] + "30 1px, transparent 1px)",
          backgroundSize: '60px 60px, 80px 80px, 70px 70px, 100px 100px',
          backgroundPosition: '0 0, 30px 30px, 15px 15px, 45px 45px',
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
      
      <div className="space-y-2 sm:space-y-3 md:space-y-5 relative z-10 py-1 md:py-2">
        <GlassCard contentClassName="p-1.5 sm:p-2 md:p-4 lg:p-6">
          <h1 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold ${
            isDark ? "text-zinc-100" : "text-gray-800"
          }`}>Welcome back, {userName}</h1>
          <p className={`text-[10px] sm:text-xs md:text-sm ${
            isDark ? "text-zinc-300" : "text-gray-600"
          }`}>
            Here's an overview of your marketing performance and client activities.
          </p>
        </GlassCard>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 lg:grid-cols-4">
          <MetricCard 
            title="Objectives" 
            value={53} 
            suffix="%" 
            changePercentage={18}
            changeValue={5}
            color={CHART_COLORS[0]}
            showDonut={true}
          />
          
          <MetricCard 
            title="Inquiry Success Rate" 
            value={36.2} 
            suffix="%"
            changePercentage={-2.5}
            changeValue={-0.9}
            color={CHART_COLORS[2]}
            showDonut={true} 
          />
          
          <MetricCard 
            title="New Leads" 
            value={134} 
            changePercentage={18}
            changeValue={28}
            color={CHART_COLORS[1]}
            showDonut={false}
          />
          
          <MetricCard 
            title="Overdue Tasks" 
            value={12} 
            changeValue={7}
            changePercentage={12}
            color={CHART_COLORS[0]}
            showDonut={false}
          />
        </div>

        {/* New Row of Metric Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 lg:grid-cols-4">
          <MetricCard 
            title="Total Clients" 
            value={87} 
            changePercentage={14}
            changeValue={11}
            color={CHART_COLORS[3]}
            showDonut={false}
          />
          
          <MetricCard 
            title="Support Requests" 
            value={24} 
            changePercentage={8}
            changeValue={2}
            color={CHART_COLORS[1]}
            showDonut={false} 
          />
          
          <MetricCard 
            title="Overdue Payments" 
            value={5} 
            secondaryLabel="Total Value"
            secondaryValue="$12,500"
            color={CHART_COLORS[2]}
            showDonut={false}
          />
          
          <MetricCard 
            title="Team Productivity" 
            value={68} 
            suffix="%"
            changeValue={4}
            changePercentage={6}
            color={CHART_COLORS[0]}
            showDonut={true}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:gap-6 lg:grid-cols-2">
          <PieChart
            title="Client Category"
            subtitle="This Month"
            data={[
              { name: 'Fashion', value: 18.4, color: CHART_COLORS[0] },
              { name: 'Electronics', value: 29.1, color: CHART_COLORS[1] },
              { name: 'Healthcare', value: 27.5, color: CHART_COLORS[2] },
              { name: 'Sporting Goods', value: 25, color: CHART_COLORS[3] }
            ]}
            innerRadius={50}
            outerRadius="80%"
            showLegend={true}
          />
          
          <ClientTrendsChart
            title="Clients Trends"
            subtitle="This Month"
            data={clientTrendsData}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:gap-6 lg:grid-cols-2">
          <PieChart
            title="Funnel Channel"
            subtitle="This Month"
            data={funnelChannelData}
            innerRadius={50}
            outerRadius="80%"
            showLegend={true}
          />
          
          <SupportRequestsCard />
        </div>

        <GlassCard>
          <div className="p-6">
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
            
            <div className="mt-6 overflow-x-auto -mx-6 px-6 pb-2">
              <div className="min-w-[600px] lg:min-w-full">
                <table className={`w-full divide-y ${
                  isDark ? "divide-zinc-700" : "divide-gray-200"
                }`}>
                  <colgroup>
                    <col className="w-[22%]" />
                    <col className="w-[18%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                  </colgroup>
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
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 