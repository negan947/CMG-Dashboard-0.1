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
import { motion } from 'framer-motion';
import { ClientListItem } from '@/components/clients/ClientListItem';

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

// ... At the top of ClientDetailModal or within ClientsContent, define variants ...
const modalContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: delay * 0.1 + 0.2, duration: 0.4, ease: 'easeOut' } // Stagger based on delay, add base delay for modal itself
  })
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
    setIsModalVisible(true);
  };

  // Handle close client detail view
  const handleCloseDetail = () => {
    setIsModalVisible(false);
    // Small delay to allow animation out before clearing, prevents content flash
    setTimeout(() => setSelectedClient(null), 300); 
  };

  // Handle clicks globally - close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCloseDetail();
      }
    }
    if (isModalVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalVisible]);

  // Fully rewritten modal that will work reliably
  const ClientDetailModal = ({ isOpen, onClose, client }: { 
    isOpen: boolean; 
    onClose: () => void; 
    client: Client | null;
  }) => {
    const { theme } = useTheme();
    const isDark = theme !== 'light';
    const internalModalRef = useRef<HTMLDivElement>(null);

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

    if (!isOpen || !client) return null;

    return (
      <motion.div
        ref={internalModalRef}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4"
        )}
        onClick={onClose}
      >
        <motion.div
          ref={internalModalRef}
          className={cn(
            "w-full bg-white rounded-lg shadow-xl overflow-hidden",
            "max-h-[90vh] md:max-h-[85vh]",
            "max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl",
            isDark ? "bg-zinc-800 border border-zinc-700" : "bg-slate-50 border border-gray-200"
          )}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className={cn(
            "flex items-center justify-between p-4 sm:p-5 border-b",
            isDark ? "border-zinc-700" : "border-gray-200"
          )}>
            <div className="flex items-center">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 mr-3">
                <AvatarFallback className={cn(isDark ? "bg-zinc-700 text-zinc-200" : "bg-blue-100 text-blue-600", "text-lg sm:text-xl")}>
                  {client.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className={cn("text-lg sm:text-xl font-semibold", isDark ? "text-zinc-100" : "text-gray-900")}>{client.name}</h2>
                <p className={cn("text-xs sm:text-sm", isDark ? "text-zinc-400" : "text-gray-500")}>{client.status}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className={cn("p-1.5 rounded-full", isDark ? "hover:bg-zinc-700" : "hover:bg-gray-200")}
              aria-label="Close modal"
            >
              <XCircle className={cn("h-5 w-5 sm:h-6 sm:w-6", isDark ? "text-zinc-400" : "text-gray-500")} />
            </button>
          </div>

          <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(90vh-120px)] md:max-h-[calc(85vh-130px)]">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6">
              <div className="md:col-span-2 space-y-4 sm:space-y-5">
                <div>
                  <h3 className={cn("text-base sm:text-lg font-semibold mb-2", isDark ? "text-zinc-200" : "text-gray-700")}>Client Details</h3>
                  <div className={cn("p-3 sm:p-4 rounded-md space-y-2 text-sm", isDark ? "bg-zinc-700/50" : "bg-gray-100")}>
                    <p><strong>Phone:</strong> {client.platforms?.[0]?.stats || 'N/A'}</p>
                    <p><strong>Email:</strong> {client.name.toLowerCase().replace(' ', '.')}@example.com</p>
                  </div>
                </div>
                <div>
                  <h3 className={cn("text-base sm:text-lg font-semibold mb-2", isDark ? "text-zinc-200" : "text-gray-700")}>Key Objectives</h3>
                  <div className={cn("p-3 sm:p-4 rounded-md space-y-3", isDark ? "bg-zinc-700/50" : "bg-gray-100")}>
                    {client.objectives?.map((obj, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs sm:text-sm mb-1">
                          <span>{obj.name}</span>
                          <span>{obj.progress}%</span>
                        </div>
                        <div className={cn("h-2 rounded-full w-full", isDark ? "bg-zinc-600" : "bg-gray-200")}>
                          <div className="h-2 rounded-full bg-blue-500" style={{ width: `${obj.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                    {!client.objectives?.length && <p className="text-xs text-center text-gray-400">No objectives defined.</p>}
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 space-y-4 sm:space-y-5">
                <div>
                  <h3 className={cn("text-base sm:text-lg font-semibold mb-2", isDark ? "text-zinc-200" : "text-gray-700")}>Performance Snapshot</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <GlassCard isDark={isDark} className="h-48 sm:h-56" contentClassName="p-2 sm:p-3">
                      <h4 className={cn("text-xs sm:text-sm font-medium mb-1 text-center", isDark ? "text-zinc-300" : "text-gray-600")}>Avg. Order Value</h4>
                      <ChartComponent data={client.aovData || []} isDark={isDark} prefix="$" />
                    </GlassCard>
                    <GlassCard isDark={isDark} className="h-48 sm:h-56" contentClassName="p-2 sm:p-3">
                      <h4 className={cn("text-xs sm:text-sm font-medium mb-1 text-center", isDark ? "text-zinc-300" : "text-gray-600")}>Cost Per Acquisition</h4>
                      <ChartComponent data={client.cpaData || []} isDark={isDark} prefix="$" />
                    </GlassCard>
                  </div>
                </div>
                <div>
                  <h3 className={cn("text-base sm:text-lg font-semibold mb-2", isDark ? "text-zinc-200" : "text-gray-700")}>Active Platforms</h3>
                  <div className={cn("p-3 sm:p-4 rounded-md grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-center", isDark ? "bg-zinc-700/50" : "bg-gray-100")}>
                    {client.platforms?.map((platform, i) => (
                      <div key={i} className={cn("p-2 rounded", isDark ? "bg-zinc-600" : "bg-gray-200")}>
                        {platform.name === 'META' && <Facebook className="h-5 w-5 mx-auto mb-1 text-blue-500" />}
                        {platform.name === 'Google' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-1 text-red-500"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.5,18.33 21.5,12.33C21.5,11.76 21.45,11.43 21.35,11.1Z"></path></svg>}
                        {platform.name === 'TikTok' && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mx-auto mb-1 text-black dark:text-white"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>}
                        <span className="text-xs">{platform.name}</span>
                      </div>
                    ))}
                    {!client.platforms?.length && <p className="col-span-full text-xs text-center text-gray-400">No platforms specified.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        // staggerChildren is applied by the parent of ClientListItem
        // No need for staggerChildren here if ClientListItem itself handles its delay via custom prop
      }
    }
  };

  return (
    <div className={cn(
      "flex-1 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
    )}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <h1 className={cn("text-2xl lg:text-3xl font-bold", isDark ? "text-white" : "text-gray-900")}>
          Clients
        </h1>
        <div className="flex items-center space-x-2">
          <button 
            className={cn(
              "flex items-center px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium rounded-md shadow-sm",
              isDark ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
            )}
          >
            <Plus className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" />
            Add Client
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard title="Total Clients" value={metrics.totalClients} isDark={isDark} icon={<User />} />
        <MetricCard title="New This Month" value={metrics.newClients} change={`+${metrics.newClientsChange}%`} isDark={isDark} icon={<ArrowUp />} />
        <MetricCard title="Inquiry Success" value={`${metrics.inquirySuccessRate}%`} change={`${metrics.inquiryRateChange}%`} isDark={isDark} icon={<Check />} />
        <MetricCard title="Overdue Tasks" value={metrics.overdueTasks} change={`+${metrics.overdueTasksChange}`} isDark={isDark} icon={<Clock />} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="relative w-full flex-grow">
              <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", isDark ? "text-zinc-400" : "text-gray-400")} />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm rounded-md border",
                  isDark ? "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
                  "focus:ring-blue-500 focus:border-blue-500"
                )}
              />
            </div>
            <button 
              className={cn(
                "flex items-center justify-center w-full sm:w-auto px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md border",
                isDark ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-100 border-zinc-600" : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
              )}
            >
              <Filter className="mr-1.5 h-4 w-4" />
              Filter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {filteredClients.map((client, index) => (
              <ClientListItem 
                key={client.id} 
                client={client} 
                isDark={isDark} 
                onClick={handleClientClick}
                index={index} 
              />
            ))}
            {filteredClients.length === 0 && (
              <p className={cn("md:col-span-2 text-center py-10", isDark ? "text-zinc-400" : "text-gray-500")}>
                No clients found.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          <h2 className={cn("text-lg lg:text-xl font-semibold", isDark ? "text-zinc-100" : "text-gray-800")}>
            Delays & Follow-ups
          </h2>
          <GlassCard contentClassName="p-3 sm:p-4" isDark={isDark}>
            <ul className="space-y-2.5 sm:space-y-3">
              {delaysAndFollowups.map((item) => (
                <li 
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-2.5 sm:p-3 rounded-md",
                     isDark ? "bg-zinc-800 hover:bg-zinc-700/70" : "bg-gray-100 hover:bg-gray-200/80"
                  )}
                >
                  <div className="flex items-center">
                    <div className={cn("w-2 h-2 rounded-full mr-2", item.priority === 'high' ? "bg-red-500" : "bg-yellow-400")}></div>
                    <span className={cn("text-sm", isDark ? "text-zinc-200" : "text-gray-700")}>{item.title}</span>
                  </div>
                  <Phone className={cn("h-4 w-4", isDark ? "text-zinc-400" : "text-gray-500")} />
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>

      <ClientDetailModal 
        isOpen={isModalVisible} 
        onClose={handleCloseDetail} 
        client={selectedClient} 
      />
    </div>
  );
}

export default function ClientsPage() {
  return (
    // <DashboardLayout> // This wrapper is redundant if app/dashboard/layout.tsx provides it
      <ClientsContent />
    // </DashboardLayout>
  );
}