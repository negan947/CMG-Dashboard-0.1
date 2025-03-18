'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { MetricCard } from '@/components/ui/charts/metric-card';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';
import { 
  User, ArrowUp, Search, Filter, Check, Phone, Clock, ArrowUpRight, 
  Plus, Target, BarChart, LightbulbIcon, XCircle, ChevronRight, Info, 
  Facebook, Twitter
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LineChart } from '@/components/ui/charts/line-chart';

export default function ClientsPage() {
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Mock data based on the screenshot
  const metrics = {
    totalClients: 73,
    newClients: 20,
    newClientsChange: 2,
    inquirySuccessRate: 36.2,
    inquiryRateChange: -0.9,
    overdueTasks: 12,
    overdueTasksChange: 7
  };

  // Mock data for delays and follow-ups
  const delaysAndFollowups = [
    {
      id: '1',
      title: 'Call Mircea',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Update w/ Klint.ro',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Payment overdue',
      priority: 'high'
    }
  ];

  // Mock data for clients
  const clients = [
    {
      id: '1',
      name: 'Francisco Andrade',
      status: 'High-value Client',
      initials: 'FA',
      progress: 85,
      platforms: [
        { name: 'META', stats: 'ROAS - 15; CPA - 11.4; AOV - 150' },
        { name: 'Google', stats: 'Reach - 10k; Clicks - 2.7k; Orders - 23' },
        { name: 'TikTok', stats: 'Spend - 123.2; Views - 14k; CR - 2%' }
      ],
      objectives: [
        { name: 'Sales of $12k', progress: 75 },
        { name: 'Gain +500 Followers', progress: 60 },
        { name: 'Double December\'s AOV', progress: 85 }
      ],
      aovData: [
        { name: 'October', value: 120 },
        { name: 'November', value: 180 },
        { name: 'December', value: 200 },
        { name: 'January', value: 250 }
      ]
    },
    {
      id: '2',
      name: 'Richard Sanchez',
      status: 'Late Payer',
      initials: 'RS',
      progress: 50,
      platforms: [
        { name: 'META', stats: 'ROAS - 15; CPA - 11.4; AOV - 150' },
        { name: 'Google', stats: 'Reach - 10k; Clicks - 2.7k; Orders - 23' },
        { name: 'TikTok', stats: 'Spend - 123.2; Views - 16k; CR - 2%' }
      ],
      objectives: [
        { name: 'Sales of $8k', progress: 40 },
        { name: 'Gain +200 Followers', progress: 65 },
        { name: 'Improve CTR', progress: 50 }
      ],
      aovData: [
        { name: 'October', value: 100 },
        { name: 'November', value: 130 },
        { name: 'December', value: 110 },
        { name: 'January', value: 140 }
      ]
    },
    {
      id: '3',
      name: 'Marie Johnson',
      status: 'New Client',
      initials: 'MJ',
      progress: 30,
      platforms: [
        { name: 'META', stats: 'ROAS - 8; CPA - 15.2; AOV - 120' },
        { name: 'Google', stats: 'Reach - 5k; Clicks - 1.5k; Orders - 10' }
      ],
      objectives: [
        { name: 'Launch Campaign', progress: 20 },
        { name: 'Set up Accounts', progress: 90 },
        { name: 'Define KPIs', progress: 50 }
      ],
      aovData: [
        { name: 'October', value: 0 },
        { name: 'November', value: 0 },
        { name: 'December', value: 90 },
        { name: 'January', value: 110 }
      ]
    },
    {
      id: '4',
      name: 'Alex Torres',
      status: 'Active Payer',
      initials: 'AT',
      progress: 70,
      platforms: [
        { name: 'META', stats: 'ROAS - 12; CPA - 13.1; AOV - 145' },
        { name: 'Google', stats: 'Reach - 8k; Clicks - 2.3k; Orders - 20' },
        { name: 'TikTok', stats: 'Spend - 95.4; Views - 12k; CR - 1.8%' }
      ],
      objectives: [
        { name: 'Increase ROAS', progress: 60 },
        { name: 'Content Creation', progress: 80 },
        { name: 'Optimize Ad Spend', progress: 75 }
      ],
      aovData: [
        { name: 'October', value: 130 },
        { name: 'November', value: 150 },
        { name: 'December', value: 160 },
        { name: 'January', value: 170 }
      ]
    }
  ];

  // Quick actions
  const quickActions = [
    { id: '1', title: 'Add New Client', icon: <Plus className="h-4 w-4" /> },
    { id: '2', title: 'Import Clients', icon: <ArrowUpRight className="h-4 w-4" /> },
    { id: '3', title: 'Send Bulk Email', icon: <ArrowUp className="h-4 w-4" rotate={45} /> },
    { id: '4', title: 'Export Data', icon: <ArrowUp className="h-4 w-4" /> }
  ];

  // Filtered clients based on search query
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle client click
  const handleClientClick = (client) => {
    setSelectedClient(client);
  };

  // Handle close client detail view
  const handleCloseDetail = () => {
    setSelectedClient(null);
  };

  // Client detail view based on the screenshot
  const renderClientDetail = () => {
    if (!selectedClient) return null;
  
  return (
      <div 
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "bg-black/50 backdrop-blur-sm"
        )}
        onClick={handleCloseDetail}
      >
        <div 
          className={cn(
            "w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl",
            isDark 
              ? "bg-zinc-900 text-zinc-100" 
              : "bg-white text-gray-800",
            "shadow-2xl"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Client Header */}
        <div className={cn(
            "p-6 border-b",
            isDark ? "border-zinc-700" : "border-gray-200"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-16 w-16 mr-5">
                  <AvatarFallback className={cn(
                    isDark ? "bg-zinc-800" : "bg-blue-100",
                    isDark ? "text-zinc-200" : "text-blue-700"
                  )}>
                    {selectedClient.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{selectedClient.name}</h2>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-zinc-400" : "text-gray-500"
                  )}>
                    {selectedClient.status}
                  </p>
                </div>
              </div>
              <div>
                <button 
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md",
                    "bg-green-600 hover:bg-green-700 text-white"
                  )}
                >
                  <Phone className="h-4 w-4" />
                  <span>Contact Details</span>
                </button>
              </div>
            </div>
          </div>

          {/* Client Content */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Objectives */}
              <div>
                <div className="flex items-center mb-4">
                  <Target className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-semibold">Objectives</h3>
                </div>
                <div className="space-y-4">
                  {selectedClient.objectives?.map((objective, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{objective.name}</span>
                      </div>
                      <div className={cn(
                        "w-full h-2 rounded-full overflow-hidden",
                        isDark ? "bg-zinc-700" : "bg-gray-200"
                      )}>
                        <div 
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${objective.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* No Requests Panel */}
              <div className={cn(
                "p-4 rounded-lg flex items-center gap-3",
                isDark ? "bg-zinc-800" : "bg-gray-100"
              )}>
                <LightbulbIcon className={cn(
                  "h-5 w-5",
                  isDark ? "text-zinc-300" : "text-gray-600"
                )} />
                <span className="text-sm font-medium">No requests...</span>
              </div>

              {/* Platforms */}
              <div>
                <div className="flex items-center mb-4">
                  <BarChart className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-semibold">Platforms</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className={cn(
                    "p-4 rounded-lg flex items-center justify-center",
                    isDark ? "bg-zinc-800" : "bg-gray-100"
                  )}>
                    <Facebook className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg flex items-center justify-center",
                    isDark ? "bg-zinc-800" : "bg-gray-100"
                  )}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-red-500">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.46 8.12l-1.97 9.03c-.14.65-.76 1.09-1.43.99-.28-.04-.52-.17-.71-.37l-3.36-3.36-1.99 1.99c-.56.56-1.5.16-1.5-.64V12.8c0-.29.12-.57.33-.78l5.67-5.67c.29-.29.77-.12.89.28.03.11.05.23.05.34v2.04c0 .39-.16.77-.44 1.04l-3.33 3.33 2.71 2.71 3.77-5.13c.22-.3.58-.45.94-.39.81.13 1.09 1.1.58 1.73l-.21.28z" />
                    </svg>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg flex items-center justify-center",
                    isDark ? "bg-zinc-800" : "bg-gray-100"
                  )}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.09 7.06c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41s-1.02.39-1.41 0-.39-1.02 0-1.41zm7.82 9.88c-1.17 1.17-2.73 1.81-4.39 1.81s-3.22-.64-4.39-1.81c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0 .79.79 1.85 1.23 2.98 1.23s2.18-.44 2.98-1.23c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41zm-1.41-8.47c-.39.39-1.02.39-1.41 0s-.39-1.02 0-1.41 1.02-.39 1.41 0c.39.39.39 1.02 0 1.41z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* A.O.V Chart */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    A.O.V
                    <Info className="h-4 w-4 ml-2 text-gray-400" />
                  </h3>
                  <button className="text-gray-400"
                    aria-label="More options">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </button>
                </div>
                <div className="h-72">
                  {selectedClient.aovData ? (
                    <LineChart 
                      data={selectedClient.aovData}
                      xAxisKey="name"
                      yAxisKey="value"
                      categories={["value"]}
                      colors={["#10b981"]}
                      valueFormatter={(value) => `$${value}`}
                      showXAxis={true}
                      showYAxis={true}
                      showLegend={false}
                      showTooltip={true}
                      showGridLines={true}
                      curve="monotone"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className={cn(
                        "text-sm",
                        isDark ? "text-zinc-400" : "text-gray-500"
                      )}>No chart data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className={cn(
                  "w-full p-3 rounded-lg flex items-center gap-2",
                  "bg-gray-100 hover:bg-gray-200 text-gray-800",
                  isDark && "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                )}>
                  <LightbulbIcon className="h-5 w-5" />
                  <span>Send Follow-up!</span>
                </button>
                <button className={cn(
                  "w-full p-3 rounded-lg flex items-center gap-2",
                  "bg-gray-100 hover:bg-gray-200 text-gray-800",
                  isDark && "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                )}>
                  <Clock className="h-5 w-5" />
                  <span>Payment due in 48h</span>
          </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Colorful background with gradient - same as dashboard */}
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
      
      <div className="space-y-6 md:space-y-8 relative z-10 py-2">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            title="Total Clients" 
            value={metrics.totalClients} 
            color={CHART_COLORS[0]}
          />
          
          <MetricCard 
            title="New Clients" 
            value={metrics.newClients} 
            changePercentage={8}
            changeValue={metrics.newClientsChange}
            changeLabel="this week"
            color={CHART_COLORS[1]}
          />
          
          <MetricCard 
            title="Inquiry Success Rate" 
            value={metrics.inquirySuccessRate} 
            suffix="%"
            changePercentage={-2.5}
            changeValue={metrics.inquiryRateChange}
            color={CHART_COLORS[2]}
            showDonut={true}
          />
          
          <MetricCard 
            title="Overdue Tasks" 
            value={metrics.overdueTasks} 
            changeValue={metrics.overdueTasksChange}
            changeLabel="this week"
            color={CHART_COLORS[3]}
          />
        </div>

        {/* Main Content Area - Two Columns on larger screens */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Side: Delays & Follow-ups and Quick Actions */}
          <div className="space-y-6">
            {/* Delays & Follow-ups Card */}
      <GlassCard
              title="Delays & Follow-ups"
              contentClassName="p-4"
      >
              <div className="space-y-3">
                {delaysAndFollowups.map((item) => (
            <div 
                    key={item.id} 
              className={cn(
                      "flex items-center p-3 rounded-lg transition-colors",
                      isDark ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"
                    )}
                  >
                    {/* Priority marker */}
                    <div className={cn(
                      "h-2 w-2 rounded-full mr-3",
                      item.priority === 'high' ? "bg-red-500" : "bg-amber-400"
                    )} />
                    
                    {/* Content */}
                    <div className="flex-grow">
                      <p className={cn(
                        "font-medium",
                        isDark ? "text-zinc-200" : "text-gray-700"
                      )}>
                        {item.title}
                      </p>
                    </div>
                    
                    {/* Action icon */}
                    {item.title.includes('Call') ? (
                      <Phone className={cn("h-4 w-4", isDark ? "text-zinc-400" : "text-gray-500")} />
                    ) : item.title.includes('Update') ? (
                      <Clock className={cn("h-4 w-4", isDark ? "text-zinc-400" : "text-gray-500")} />
                    ) : (
                      <Check className={cn("h-4 w-4", isDark ? "text-zinc-400" : "text-gray-500")} />
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
            
            {/* Quick Actions Card */}
            <GlassCard
              title="Quick Actions"
              contentClassName="p-4"
            >
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    className={cn(
                      "flex items-center w-full p-3 rounded-lg transition-colors text-left",
                      isDark 
                        ? "hover:bg-zinc-800/50 text-zinc-200" 
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center h-6 w-6 rounded-full mr-3",
                      isDark ? "bg-zinc-800" : "bg-gray-100"
                    )}>
                      {action.icon}
                    </span>
                    <span className="font-medium">{action.title}</span>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
          
          {/* Right Side: Client List */}
          <div className="lg:col-span-2">
            <GlassCard contentClassName="p-0">
              {/* Search and Filter Bar */}
              <div className={cn(
                "flex items-center justify-between p-4 border-b",
                isDark ? "border-zinc-700/50" : "border-gray-200"
              )}>
                <div className={cn(
                  "relative flex-grow max-w-md",
                )}>
                  <Search className={cn(
                    "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
                    isDark ? "text-zinc-400" : "text-gray-500"
                  )} />
                  <input 
                    type="text" 
                    placeholder="Search here" 
                    className={cn(
                      "w-full pl-10 pr-4 py-2 rounded-lg",
                      "focus:outline-none focus:ring-1",
                      isDark 
                        ? "bg-zinc-800/50 text-zinc-200 placeholder-zinc-400 focus:ring-zinc-600" 
                        : "bg-gray-100/70 text-gray-800 placeholder-gray-500 focus:ring-gray-300"
                    )}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <button className={cn(
                  "ml-3 p-2 rounded-lg transition-colors",
                  isDark 
                    ? "bg-zinc-800/70 hover:bg-zinc-700/70 text-zinc-300" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                )}
                aria-label="Filter clients">
                  <Filter className="h-5 w-5" />
                </button>
              </div>
              
              {/* Client List */}
              <div className="p-2">
                {filteredClients.map((client) => (
                  <div 
                    key={client.id} 
                    className={cn(
                      "p-4 rounded-xl mb-3 transition-colors cursor-pointer",
                      isDark ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"
                    )}
                    onClick={() => handleClientClick(client)}
                  >
                    {/* Client Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarFallback className={cn(
                            isDark ? "bg-zinc-800" : "bg-blue-100",
                            isDark ? "text-zinc-200" : "text-blue-700"
                          )}>
                            {client.initials}
                          </AvatarFallback>
                        </Avatar>
              <div>
                <h3 className={cn(
                            "font-semibold text-base",
                  isDark ? "text-zinc-100" : "text-gray-800"
                )}>
                            {client.name}
                </h3>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-zinc-400" : "text-gray-500"
                )}>
                            {client.status}
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        className="text-xs text-blue-500 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClientClick(client);
                        }}
                        aria-label={`View ${client.name}'s details`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
                      <div 
                        className={cn(
                          "h-1 rounded-full",
                          client.progress > 70 ? "bg-green-500" : 
                          client.progress > 40 ? "bg-amber-500" : "bg-red-500"
                        )}
                        style={{ width: `${client.progress}%` }}
                      ></div>
                    </div>
                    
                    {/* Client Platforms */}
                    <div className="space-y-3 mt-2">
                      {client.platforms.map((platform, idx) => (
                        <div key={idx} className="flex items-center">
                          <span className={cn(
                            "text-sm font-bold w-16",
                            isDark ? "text-zinc-300" : "text-gray-700"
                          )}>
                            {platform.name}:
                          </span>
                          <span className={cn(
                            "text-xs ml-2",
                            isDark ? "text-zinc-400" : "text-gray-600"
                          )}>
                            {platform.stats}
                          </span>
                        </div>
                      ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
          </div>
        </div>
      </div>

      {/* Client Detail Modal */}
      {renderClientDetail()}
    </div>
  );
} 