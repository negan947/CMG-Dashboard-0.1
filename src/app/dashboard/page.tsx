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
      {/* Colorful background with gradient */}
      <div className={`fixed inset-0 -z-10 ${
        isDark 
          ? "bg-gradient-to-br from-[#121212] via-[#1E1E1E] to-[#262626]" 
          : "bg-gradient-to-br from-[#EAEDFF] via-[#E3E9FF] to-[#D5E3FF]"
      }`} />
      
      {/* White accent orbs for visual effect */}
      <div className={`fixed -top-20 -left-20 -z-5 h-60 w-60 rounded-full ${
        isDark 
          ? "bg-white opacity-[0.02]" 
          : "bg-purple-400 opacity-20"
      } blur-[80px]`} />
      <div className={`fixed top-1/3 right-1/4 -z-5 h-40 w-40 rounded-full ${
        isDark 
          ? "bg-white opacity-[0.015]" 
          : "bg-blue-400 opacity-20"
      } blur-[60px]`} />
      <div className={`fixed bottom-1/4 -right-10 -z-5 h-36 w-36 rounded-full ${
        isDark 
          ? "bg-zinc-200 opacity-[0.01]" 
          : "bg-pink-300 opacity-15"
      } blur-[50px]`} />
      <div className={`fixed top-2/3 left-1/4 -z-5 h-24 w-24 rounded-full ${
        isDark 
          ? "bg-zinc-300 opacity-[0.01]" 
          : "bg-indigo-400 opacity-10"
      } blur-[40px]`} />
      
      {/* Subtle brushed metal texture overlay */}
      <div className={`fixed inset-0 -z-9 opacity-[0.03] pointer-events-none ${
        isDark ? "block" : "hidden"
      }`} style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'600\' height=\'600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.3\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
      }} />
      
      <div className="space-y-6 md:space-y-8 relative z-10 py-2">
        <div className={`backdrop-blur-xl ${
          isDark 
            ? "bg-[rgba(30,30,30,0.6)] border-[rgba(60,60,65,0.55)]" 
            : "bg-[rgba(255,255,255,0.65)] border-[rgba(255,255,255,0.4)]"
        } border rounded-xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.15)]`}>
          <h1 className={`text-2xl font-bold md:text-3xl ${
            isDark ? "text-zinc-100" : "text-gray-800"
          }`}>Welcome back, {userName}</h1>
          <p className={`mt-2 text-sm md:text-base ${
            isDark ? "text-zinc-400" : "text-gray-600"
          }`}>
            Here's an overview of your marketing performance and client activities.
          </p>
        </div>
        
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

        <div className={`backdrop-blur-xl ${
          isDark 
            ? "bg-[rgba(30,30,30,0.6)] border-[rgba(60,60,65,0.55)]" 
            : "bg-[rgba(255,255,255,0.65)] border-[rgba(255,255,255,0.4)]"
        } border rounded-xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.15)]`}>
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
              <tbody className={`divide-y ${
                isDark ? "divide-zinc-700" : "divide-gray-200"
              }`}>
                {!campaignsLoading ? (
                  <>
                    <tr className={`${isDark ? "hover:bg-zinc-800/30" : "hover:bg-gray-50"} transition-colors`}>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm font-medium ${
                        isDark ? "text-zinc-100" : "text-gray-900"
                      }`}>Summer Sale Promotion</td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>Facebook</td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>
                        <span className="inline-flex items-center rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-200">
                          Active
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>$5,000</td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>$2,500</td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>2.4x</td>
                    </tr>
                    <tr className={`${isDark ? "hover:bg-zinc-800/30" : "hover:bg-gray-50"} transition-colors`}>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm font-medium ${
                        isDark ? "text-zinc-100" : "text-gray-900"
                      }`}>Product Launch</td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>Google Ads</td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>
                        <span className="inline-flex items-center rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-200">
                          Active
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>$8,000</td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>$3,600</td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>3.2x</td>
                    </tr>
                    <tr className={`${isDark ? "hover:bg-zinc-800/30" : "hover:bg-gray-50"} transition-colors`}>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm font-medium ${
                        isDark ? "text-zinc-100" : "text-gray-900"
                      }`}>Retargeting Campaign</td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>Google Ads</td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>
                        <span className="inline-flex items-center rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-200">
                          Active
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>$2,000</td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>$450</td>
                      <td className={`whitespace-nowrap px-4 py-4 text-sm ${
                        isDark ? "text-zinc-400" : "text-gray-500"
                      }`}>4.5x</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td className={`px-4 py-4 text-center text-sm ${
                      isDark ? "text-zinc-400" : "text-gray-500"
                    }`} colSpan={6}>
                      Loading campaign data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 