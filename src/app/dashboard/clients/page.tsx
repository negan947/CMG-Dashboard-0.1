'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { MetricCard } from '@/components/ui/charts/metric-card';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { 
  User, ArrowUp, Search, Filter, Check, Phone, Clock, ArrowUpRight, 
  Plus, Target, BarChart, LightbulbIcon, XCircle, ChevronRight, Info, 
  Facebook, Twitter, TrendingUp, Instagram
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Define types for our data
interface Objective {
  name: string;
  progress: number;
}

interface Platform {
  name: string;
  stats: string;
}

interface DataPoint {
  name: string;
  value: number;
}

interface Client {
  id: string;
  name: string;
  status: string;
  initials: string;
  progress: number;
  platforms: Platform[];
  objectives?: Objective[];
  aovData?: DataPoint[];
  cpaData?: DataPoint[];
}

// Modern chart component using recharts to match the client trends chart exactly
const ChartComponent = ({ 
  data, 
  isDark,
  prefix = '$',
  color = CHART_COLORS[0] // Default to first chart color
}: { 
  data: DataPoint[]; 
  isDark: boolean;
  prefix?: string;
  color?: string;
}): React.ReactNode => {
  if (!data || !data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className={isDark ? "text-zinc-400" : "text-gray-500"}>No chart data available</p>
      </div>
    );
  }

  // Convert data to format needed by recharts
  const formattedData = data.map(point => ({
    name: point.name,
    value: point.value
  }));
  
  // Create custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={cn(
          "px-3 py-2 rounded-md text-sm",
          isDark 
            ? "bg-[rgba(30,35,60,0.85)] text-white border border-white/20" 
            : "bg-white/85 text-gray-800 border border-gray-200/50",
          "backdrop-blur-md shadow-lg"
        )}>
          <p className="font-medium mb-1">{label}</p>
          <p className="text-sm">
            <span className="font-medium">{prefix}{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Create a unique ID for the gradient
  const gradientId = `colorGradient-${color.replace('#', '')}`;
  const glowFilterId = `glow-${color.replace('#', '')}`;
  
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            horizontal={true}
            vertical={false}
            stroke={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} 
          />
          
          <XAxis
            dataKey="name"
            stroke={isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
            tickMargin={5}
          />
          
          <YAxis
            stroke={isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={30}
            tickMargin={5}
            tickFormatter={(value) => `${prefix}${value}`}
          />
          
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeDasharray: '3 3'}}
          />
          
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
            </linearGradient>
            <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          <Line
            type="monotone"
            dataKey="value"
            name="Value"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`} // Fill area under the line
            fillOpacity={0.2}
            dot={{
              r: 4,
              fill: isDark ? "#1e1e2d" : "#ffffff",
              stroke: color,
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              stroke: isDark ? "rgba(255, 255, 255, 0.8)" : "#ffffff",
              strokeWidth: 2,
              fill: color,
              filter: `url(#${glowFilterId})`
            }}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

function ClientsContent() {
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
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
      ],
      cpaData: [
        { name: 'October', value: 18 },
        { name: 'November', value: 15 },
        { name: 'December', value: 12 },
        { name: 'January', value: 11 }
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
      ],
      cpaData: [
        { name: 'October', value: 20 },
        { name: 'November', value: 19 },
        { name: 'December', value: 17 },
        { name: 'January', value: 16 }
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
      ],
      cpaData: [
        { name: 'October', value: 0 },
        { name: 'November', value: 0 },
        { name: 'December', value: 25 },
        { name: 'January', value: 22 }
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
      ],
      cpaData: [
        { name: 'October', value: 16 },
        { name: 'November', value: 14 },
        { name: 'December', value: 12 },
        { name: 'January', value: 13 }
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
  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    // Show modal with a slight delay for better UX
    setTimeout(() => setIsModalVisible(true), 50);
  };

  // Handle close client detail view
  const handleCloseDetail = () => {
    console.log('Closing modal'); // Debug log
    setIsModalVisible(false);
    // Remove selected client after animation completes
    setTimeout(() => {
      console.log('Clearing selected client'); // Debug log
      setSelectedClient(null);
    }, 300);
  };

  // Handle clicks globally - close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Only process if the modal is visible
      if (!isModalVisible) return;
      
      // Check if click was outside the modal content
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCloseDetail();
      }
    }
    
    // Add the event listener directly to document
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalVisible, modalRef]);

  // Fully rewritten modal that will work reliably
  const ClientDetailModal = ({ isOpen, onClose, client }: { 
    isOpen: boolean; 
    onClose: () => void; 
    client: Client | null;
  }) => {
    // Don't render anything if no client or modal not open
    if (!client || !isOpen) return null;
    
    // Prevent scroll on body when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);
    
    // Modal content
    return (
      <>
        {/* Backdrop */}
        <div 
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
            "transition-opacity duration-300 cursor-pointer",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onClose}
        />
        
        {/* Modal content */}
        <div 
          className={cn(
            "fixed z-50 inset-0 overflow-y-auto p-4",
            "flex items-center justify-center"
          )}
          onClick={onClose} // Close when clicking outside
        >
          <div 
            className={cn(
              "w-full max-w-4xl max-h-[90vh] rounded-xl relative",
              "transition-all duration-300",
              isDark 
                ? "bg-gradient-to-br from-[#0F0F12] via-[#171720] to-[#1C1C25] text-zinc-100" 
                : "bg-gradient-to-br from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF] text-gray-800",
              "border overflow-y-auto",
              isDark ? "border-zinc-700/40" : "border-white/40",
              "shadow-2xl",
              isOpen ? "opacity-100 transform-none" : "opacity-0 translate-y-8 scale-95"
            )}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on content
          >
            {/* Close button - removing since we have backdrop click working */}
            
            {/* Background patterns - simplified for reliability */}
            <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
              <div className="absolute inset-0" style={{
                backgroundImage: isDark 
                  ? "radial-gradient(#60a5fa60 1px, transparent 1px)" 
                  : "radial-gradient(#60a5fa40 1px, transparent 1px)",
                backgroundSize: '60px 60px'
              }} />
            </div>
            
            {/* Client Header */}
            <div className={cn(
              "p-6 border-b relative z-10",
              isDark ? "border-zinc-700/40" : "border-gray-200/40"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-16 w-16 mr-5 shadow-lg">
                    <AvatarFallback className={cn(
                      isDark 
                        ? "bg-zinc-800/70 text-zinc-200" 
                        : "bg-blue-100/70 text-blue-700",
                      "backdrop-blur-sm"
                    )}>
                      {client.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{client.name}</h2>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-zinc-400" : "text-gray-500"
                    )}>
                      {client.status}
                    </p>
                  </div>
                </div>
                <div>
                  <button 
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                      isDark 
                        ? "bg-zinc-800/70 hover:bg-zinc-700/70 border border-zinc-700/30 text-zinc-100" 
                        : "bg-white/70 hover:bg-white/90 border border-gray-200/40 text-gray-800",
                      "backdrop-blur-sm"
                    )}
                    style={{
                      color: CHART_COLORS[0],
                      borderColor: `${CHART_COLORS[0]}40`
                    }}
                  >
                    <Phone className="h-4 w-4" />
                    <span>Contact Details</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Client Content - using Grid layout */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Objectives */}
                <div className={cn(
                  "p-5 rounded-xl",
                  isDark 
                    ? "bg-zinc-800/40 border border-zinc-700/30" 
                    : "bg-white/40 border border-gray-200/40",
                  "backdrop-blur-sm"
                )}>
                  <div className="flex items-center mb-4">
                    <Target className="h-5 w-5 mr-2" />
                    <h3 className="text-lg font-semibold">Objectives</h3>
                  </div>
                  <div className="space-y-4">
                    {client.objectives?.map((objective, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{objective.name}</span>
                        </div>
                        <div className={cn(
                          "w-full h-2 rounded-full overflow-hidden",
                          isDark ? "bg-zinc-700/70" : "bg-gray-200/70"
                        )}>
                          <div 
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${objective.progress}%`,
                              backgroundColor: CHART_COLORS[idx % CHART_COLORS.length]
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platforms */}
                <div className={cn(
                  "p-5 rounded-xl",
                  isDark 
                    ? "bg-zinc-800/40 border border-zinc-700/30" 
                    : "bg-white/40 border border-gray-200/40",
                  "backdrop-blur-sm"
                )}>
                  <div className="flex items-center mb-4">
                    <BarChart className="h-5 w-5 mr-2" />
                    <h3 className="text-lg font-semibold">Platforms</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className={cn(
                      "p-4 rounded-lg flex items-center justify-center",
                      isDark 
                        ? "bg-zinc-900/60 border border-zinc-800/60" 
                        : "bg-white/60 border border-gray-200/40",
                      "hover:shadow-md transition-all duration-200"
                    )}>
                      <Facebook className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className={cn(
                      "p-4 rounded-lg flex items-center justify-center",
                      isDark 
                        ? "bg-zinc-900/60 border border-zinc-800/60" 
                        : "bg-white/60 border border-gray-200/40",
                      "hover:shadow-md transition-all duration-200"
                    )}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-8 w-8" style={{ color: '#E1306C' }}>
                        <rect x="2" y="2" width="20" height="20" rx="5" strokeWidth="2" />
                        <circle cx="12" cy="12" r="4" strokeWidth="2" />
                        <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
                      </svg>
                    </div>
                    <div className={cn(
                      "p-4 rounded-lg flex items-center justify-center",
                      isDark 
                        ? "bg-zinc-900/60 border border-zinc-800/60" 
                        : "bg-white/60 border border-gray-200/40",
                      "hover:shadow-md transition-all duration-200"
                    )}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-black">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Charts and action buttons */}
                {/* A.O.V Chart */}
                <div className={cn(
                  "p-5 rounded-xl",
                  isDark 
                    ? "bg-zinc-800/40 border border-zinc-700/30" 
                    : "bg-white/40 border border-gray-200/40",
                  "backdrop-blur-sm"
                )}>
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
                    {client.aovData ? (
                      <ChartComponent 
                        data={client.aovData}
                        isDark={isDark}
                        color={CHART_COLORS[0]}
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

                {/* CPA Chart */}
                <div className={cn(
                  "p-5 rounded-xl",
                  isDark 
                    ? "bg-zinc-800/40 border border-zinc-700/30" 
                    : "bg-white/40 border border-gray-200/40",
                  "backdrop-blur-sm"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      Cost Per Acquisition
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
                    {client.cpaData ? (
                      <ChartComponent 
                        data={client.cpaData}
                        isDark={isDark}
                        color={CHART_COLORS[1]}
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
                <div className="space-y-3 mt-6">
                  <button className={cn(
                    "w-full p-3 rounded-lg flex items-center gap-2 transition-colors",
                    isDark 
                      ? "bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/30 text-zinc-100" 
                      : "bg-white/60 hover:bg-gray-100/60 border border-gray-200/40 text-gray-800",
                    "backdrop-blur-sm"
                  )}>
                    <LightbulbIcon className="h-5 w-5" />
                    <span>Send Follow-up!</span>
                  </button>
                  <button className={cn(
                    "w-full p-3 rounded-lg flex items-center gap-2 transition-colors",
                    isDark 
                      ? "bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/30 text-zinc-100" 
                      : "bg-white/60 hover:bg-gray-100/60 border border-gray-200/40 text-gray-800",
                    "backdrop-blur-sm"
                  )}>
                    <Clock className="h-5 w-5" />
                    <span>Payment due in 48h</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
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
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 lg:grid-cols-4 h-auto">
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
              contentClassName="p-2 sm:p-3 md:p-4"
            >
              <div className="space-y-2">
                {delaysAndFollowups.map((item) => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "flex items-center p-2 sm:p-3 rounded-lg transition-colors",
                      isDark ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"
                    )}
                  >
                    {/* Priority marker */}
                    <div className={cn(
                      "h-2 w-2 rounded-full mr-2 sm:mr-3 flex-shrink-0",
                      item.priority === 'high' ? "bg-red-500" : "bg-amber-400"
                    )} />
                    
                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <p className={cn(
                        "text-xs sm:text-sm md:text-base font-medium truncate",
                        isDark ? "text-zinc-200" : "text-gray-700"
                      )}>
                        {item.title}
                      </p>
                    </div>
                    
                    {/* Action icon */}
                    <div className="flex-shrink-0 ml-2">
                      {item.title.includes('Call') ? (
                        <Phone className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isDark ? "text-zinc-400" : "text-gray-500")} />
                      ) : item.title.includes('Update') ? (
                        <Clock className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isDark ? "text-zinc-400" : "text-gray-500")} />
                      ) : (
                        <Check className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isDark ? "text-zinc-400" : "text-gray-500")} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
            
            {/* Quick Actions Card */}
            <GlassCard
              title="Quick Actions"
              contentClassName="p-2 sm:p-3 md:p-4"
            >
              <div className="space-y-1.5 sm:space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    className={cn(
                      "flex items-center w-full p-2 sm:p-3 rounded-lg transition-colors text-left",
                      isDark 
                        ? "hover:bg-zinc-800/50 text-zinc-200" 
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full mr-2 sm:mr-3",
                      isDark ? "bg-zinc-800" : "bg-gray-100"
                    )}>
                      <span className="h-3 w-3 sm:h-4 sm:w-4">{action.icon}</span>
                    </span>
                    <span className="text-xs sm:text-sm md:text-base font-medium">{action.title}</span>
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
                      "p-3 sm:p-4 rounded-xl mb-2 sm:mb-3 transition-colors cursor-pointer",
                      isDark ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"
                    )}
                    onClick={() => handleClientClick(client)}
                  >
                    {/* Client Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 mr-3 sm:mr-4">
                          <AvatarFallback className={cn(
                            isDark ? "bg-zinc-800" : "bg-blue-100",
                            isDark ? "text-zinc-200" : "text-blue-700",
                            "text-xs sm:text-sm"
                          )}>
                            {client.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className={cn(
                            "font-semibold text-sm sm:text-base",
                            isDark ? "text-zinc-100" : "text-gray-800"
                          )}>
                            {client.name}
                          </h3>
                          <p className={cn(
                            "text-[10px] sm:text-sm",
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
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-3">
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
                    <div className="space-y-1.5 sm:space-y-2">
                      {client.platforms.map((platform, idx) => (
                        <div key={idx} className="flex items-center">
                          <span className={cn(
                            "text-[10px] sm:text-sm font-bold w-14 sm:w-16",
                            isDark ? "text-zinc-300" : "text-gray-700"
                          )}>
                            {platform.name}:
                          </span>
                          <span className={cn(
                            "text-[8px] sm:text-xs ml-1 sm:ml-2",
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

      {/* Client Detail Modal - using our new component */}
      <ClientDetailModal 
        isOpen={isModalVisible}
        onClose={handleCloseDetail}
        client={selectedClient}
      />
    </div>
  );
}

// Default export with DashboardLayout
export default function ClientsPage() {
  // Use client-side only rendering
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null; // Return nothing during SSR to avoid hydration issues
  }
  
  // When mounted, render with DashboardLayout
  return (
    <DashboardLayout>
      <ClientsContent />
    </DashboardLayout>
  );
} 