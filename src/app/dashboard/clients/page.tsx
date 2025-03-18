'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { MetricCard } from '@/components/ui/charts/metric-card';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  User, ArrowUp, Search, Filter, Check, Phone, Clock, ArrowUpRight, 
  Plus, Target, BarChart, LightbulbIcon, XCircle, ChevronRight, Info, 
  Facebook, Twitter, TrendingUp
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

// Chart component to match client trends chart style
const ChartComponent = ({ 
  data, 
  isDark,
  prefix = '$',
  color = '#10b981' // green-500
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

  // Find max value for scaling
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="h-full w-full flex flex-col">
      {/* Y-axis labels */}
      <div className="flex justify-between text-xs mb-2">
        <span className={isDark ? "text-zinc-400" : "text-gray-500"}>{prefix}0</span>
        <span className={isDark ? "text-zinc-400" : "text-gray-500"}>{prefix}{Math.round(maxValue / 2)}</span>
        <span className={isDark ? "text-zinc-400" : "text-gray-500"}>{prefix}{maxValue}</span>
      </div>
      
      {/* Chart area */}
      <div className="flex-1 relative">
        {/* Horizontal grid lines */}
        <div className={`absolute inset-0 border-t border-b ${isDark ? "border-zinc-700/30" : "border-gray-200/50"}`}>
          <div className={`absolute top-1/2 left-0 right-0 border-t ${isDark ? "border-zinc-700/30" : "border-gray-200/50"}`}></div>
        </div>
        
        {/* Data points and line */}
        <div className="absolute inset-0 flex items-end">
          {data.map((point, index) => {
            const height = (point.value / maxValue) * 100;
            const isLast = index === data.length - 1;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center justify-end">
                {/* Line to next point */}
                {index < data.length - 1 && (
                  <div 
                    className="absolute h-0.5 z-10" 
                    style={{
                      width: `${100 / data.length}%`,
                      bottom: `${(point.value / maxValue) * 100}%`,
                      left: `${(index + 0.5) * (100 / data.length)}%`,
                      transform: `rotate(${Math.atan2(
                        (data[index + 1].value - point.value) / maxValue * 100,
                        100 / data.length
                      ) * (180 / Math.PI)}deg)`,
                      transformOrigin: 'left bottom',
                      backgroundColor: color,
                      filter: "drop-shadow(0 0 3px rgba(0,0,0,0.1))"
                    }}
                  ></div>
                )}
                
                {/* Data point */}
                <div className="relative" style={{ height: `${height}%` }}>
                  <div 
                    className="h-3 w-3 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      backgroundColor: color,
                      border: `2px solid ${isDark ? '#1a1a2e' : 'white'}`,
                      boxShadow: `0 0 4px rgba(0,0,0,0.15)`
                    }}
                  ></div>
                  {isLast && (
                    <div 
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-10 text-white text-xs rounded px-2 py-1 font-medium backdrop-blur-sm"
                      style={{ 
                        backgroundColor: `${color}ee`,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                      }}
                    >
                      {prefix}{point.value}
                    </div>
                  )}
                </div>
                
                {/* X-axis label */}
                <div className={`mt-4 text-xs ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                  {point.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
                      "bg-green-600/90 hover:bg-green-700 text-white backdrop-blur-sm"
                    )}
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
                            className="h-full rounded-full bg-green-500 transition-all duration-1000"
                            style={{ width: `${objective.progress}%` }}
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
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8">
                        <path d="M22.18 10.382c-.39-.285-.806-.523-1.239-.719v-.031c.03-.377-.135-8.016-4.182-7.632-3.713.347-5.284 3.03-5.714 4.115-.43-1.086-2-3.768-5.714-4.115-4.049-.384-4.212 7.255-4.183 7.631v.034a7.734 7.734 0 0 0-1.225.718C-3.318 13.96 1.267 23.56 11.992 24h.02c10.725-.439 15.313-10.042 10.169-13.618zm-10.17 5.555l-.002-.005c-.9 1.296-2.222 2.155-3.75 2.155-2.573 0-4.661-2.344-4.661-5.24 0-2.894 2.088-5.24 4.66-5.24 1.675 0 3.122 1.04 3.964 2.58h-.008c.209.38.391.79.537 1.22H9.225a4.613 4.613 0 0 0-.474-1.012l.008-.004A3.307 3.307 0 0 0 8 9.444a3.153 3.153 0 0 0-2.08-.784c-1.861 0-3.369 1.683-3.369 3.757 0 2.073 1.508 3.756 3.369 3.756.832 0 1.588-.32 2.164-.845.476-.433.857-1.013 1.085-1.674h-3.25v-1.783h5.12c.061.362.097.73.097 1.114a6.58 6.58 0 0 1-.162 1.459c.109.321.19.618.19.618l-.006-.019c-.012-.03-.019-.063-.028-.095v-.002zm9.222-.446c-.24.995-.584 1.777-1.05 2.384a4.415 4.415 0 0 1-1.57 1.372c-.594.333-1.283.56-2.06.68v1.375h-1.716v-1.35c-1.124-.079-2.094-.376-2.92-.887l.874-2.023c.335.193.915.455 1.428.627.513.17 1.26.322 1.777.322.517 0 .915-.073 1.191-.218.276-.146.415-.403.415-.77 0-.207-.068-.395-.205-.564a1.69 1.69 0 0 0-.542-.406 9.714 9.714 0 0 0-.757-.3c-.275-.098-.549-.2-.83-.322a8.632 8.632 0 0 1-.859-.398 3.164 3.164 0 0 1-.715-.535 2.443 2.443 0 0 1-.487-.733 2.433 2.433 0 0 1-.175-.972c0-.636.15-1.17.45-1.604.301-.434.702-.784 1.207-1.05a5.446 5.446 0 0 1 1.67-.561V3.5h1.716v1.334c.549.048 1.033.146 1.448.293.415.146.778.307 1.085.48.308.17.547.333.72.486l-.997 1.902a7.91 7.91 0 0 0-.874-.418 6.286 6.286 0 0 0-1.671-.429c-.523-.037-.919.017-1.191.164-.272.146-.408.39-.408.733 0 .185.041.34.123.465.081.125.21.24.384.342.175.101.394.195.659.28l.801.305c.277.11.562.23.856.361.294.13.568.29.82.474.252.186.457.41.616.674.158.266.236.584.236.954.002.65-.138 1.203-.375 1.674v.003z" fill="#4285F4"/>
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
                        color="#10b981" // green-500
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
                        color="#f97316" // orange-500
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