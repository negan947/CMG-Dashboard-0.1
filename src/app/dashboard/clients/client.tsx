'use client';

import React, { useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { MetricCard } from '@/components/ui/charts/metric-card';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';
import { 
  User, ArrowUp, Search, Filter, Check, Phone, Clock, ArrowUpRight, 
  Plus, Target, BarChart, LightbulbIcon, XCircle, ChevronRight, Info, 
  Facebook, Twitter, TrendingUp, Instagram, Loader2, SlidersHorizontal, FilterX,
  Globe, DollarSign, Percent
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientListItem } from '@/components/clients/ClientListItem';
import { AddClientModal } from '@/components/clients/AddClientModal';
import { ClientModel, ClientStatus } from '@/types/models.types';
import { ClientService } from '@/services/client-service';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ClientFollowUps } from '@/components/dashboard/clients/ClientFollowUps';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

// Simplified local Client type to match DB + minimal UI needs
interface Client extends ClientModel { 
  initials: string;
}

interface DataPoint {
  name: string;
  value: number;
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
          margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="4 4"
            horizontal={true}
            vertical={false}
            stroke={isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.07)"}
          />
          
          <XAxis
            dataKey="name"
            stroke={isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={10}
            tickMargin={5}
          />
          
          <YAxis
            stroke={isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            width={35}
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
            fill={`url(#${gradientId})`}
            fillOpacity={isDark ? 0.25 : 0.15}
            dot={{
              r: 3,
              fill: isDark ? "#121212" : "#ffffff",
              stroke: color,
              strokeWidth: 1.5,
            }}
            activeDot={{
              r: 6,
              fill: color,
              stroke: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
              strokeWidth: 4,
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

// Modal animation variants
const modalContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: delay * 0.1 + 0.2, duration: 0.4, ease: 'easeOut' }
  })
};

// Client detail modal component
const ClientDetailModal = ({ 
  isOpen, 
  onClose, 
  client: currentClient
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  client: Client | null;
}) => {
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  
  if (!currentClient) return null;
  
  const modalAnimationProps = (delay: number = 0) => ({
    variants: modalContentVariants,
    initial: "hidden",
    animate: "visible",
    custom: delay
  });
  
  // Mock data for the charts
  const revenueData = [
    { name: 'Jan', value: 3200 },
    { name: 'Feb', value: 4500 },
    { name: 'Mar', value: 5200 },
    { name: 'Apr', value: 4800 },
    { name: 'May', value: 6100 },
    { name: 'Jun', value: 7500 },
  ];
  
  // Calculate basic KPIs from the revenue data
  const currentRevenue = revenueData[revenueData.length - 1].value;
  const previousRevenue = revenueData[revenueData.length - 2].value;
  const growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className={cn(
              "relative max-w-4xl mx-auto p-5 rounded-2xl shadow-2xl overflow-hidden",
              isDark 
                ? "bg-zinc-900/95 border border-zinc-700/50" 
                : "bg-white/95 border border-gray-200/50"
            )}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3">
              <button 
                onClick={onClose}
                className={cn(
                  "p-1.5 rounded-full hover:bg-opacity-10 transition-colors", 
                  isDark ? "hover:bg-white text-zinc-400 hover:text-white" : "hover:bg-black text-gray-500 hover:text-black"
                )}
                aria-label="Close details"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Client Profile - Left Column */}
              <motion.div {...modalAnimationProps(0)} className="md:col-span-1">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="relative mb-4">
                    <Avatar className="h-20 w-20 border-2 border-blue-500">
                      {currentClient.avatarUrl ? (
                        <AvatarImage src={currentClient.avatarUrl} alt={currentClient.name} />
                      ) : (
                        <AvatarFallback className={cn(
                          "text-lg font-semibold",
                          isDark ? "bg-zinc-800 text-zinc-200" : "bg-blue-50 text-blue-700"
                        )}>
                          {currentClient.initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 rounded-full p-1.5",
                      currentClient.status === 'active' ? 'bg-green-500' : 
                      currentClient.status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'
                    )}>
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <h2 className={cn(
                    "text-xl font-bold mb-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {currentClient.name}
                  </h2>
                  
                  <p className={cn(
                    "text-sm mb-3",
                    isDark ? "text-zinc-400" : "text-gray-500"
                  )}>
                    {currentClient.industry || 'No industry specified'}
                  </p>
                  
                  <div className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-4",
                    currentClient.status === 'active' 
                      ? isDark ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-green-100 text-green-800 border border-green-200'
                      : currentClient.status === 'inactive' 
                      ? isDark ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : isDark ? 'bg-red-900/40 text-red-400 border border-red-800' : 'bg-red-100 text-red-800 border border-red-200'
                  )}>
                    {currentClient.status.charAt(0).toUpperCase() + currentClient.status.slice(1)}
                  </div>
                  
                  <div className="w-full">
                    <div className="grid grid-cols-1 gap-3">
                      {currentClient.email && (
                        <div className={cn(
                          "flex items-center gap-2 p-2.5 rounded-lg text-sm",
                          isDark ? "bg-zinc-800/50" : "bg-gray-100"
                        )}>
                          <div className={cn(
                            "p-1.5 rounded-md",
                            isDark ? "bg-zinc-700" : "bg-gray-200"
                          )}>
                            <User size={16} className={isDark ? "text-blue-400" : "text-blue-600"} />
                          </div>
                          <span className={cn(
                            "truncate",
                            isDark ? "text-zinc-300" : "text-gray-700"
                          )}>
                            {currentClient.email}
                          </span>
                        </div>
                      )}
                      
                      {currentClient.phone && (
                        <div className={cn(
                          "flex items-center gap-2 p-2.5 rounded-lg text-sm",
                          isDark ? "bg-zinc-800/50" : "bg-gray-100"
                        )}>
                          <div className={cn(
                            "p-1.5 rounded-md",
                            isDark ? "bg-zinc-700" : "bg-gray-200"
                          )}>
                            <Phone size={16} className={isDark ? "text-blue-400" : "text-blue-600"} />
                          </div>
                          <span className={cn(
                            "truncate",
                            isDark ? "text-zinc-300" : "text-gray-700"
                          )}>
                            {currentClient.phone}
                          </span>
                        </div>
                      )}
                      
                      {currentClient.website && (
                        <div className={cn(
                          "flex items-center gap-2 p-2.5 rounded-lg text-sm",
                          isDark ? "bg-zinc-800/50" : "bg-gray-100"
                        )}>
                          <div className={cn(
                            "p-1.5 rounded-md",
                            isDark ? "bg-zinc-700" : "bg-gray-200"
                          )}>
                            <Globe size={16} className={isDark ? "text-blue-400" : "text-blue-600"} />
                          </div>
                          <a 
                            href={currentClient.website.startsWith('http') ? currentClient.website : `https://${currentClient.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "truncate hover:underline",
                              isDark ? "text-blue-400" : "text-blue-600"
                            )}
                          >
                            {currentClient.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Client Performance - Right Columns */}
              <motion.div {...modalAnimationProps(1)} className="md:col-span-2">
                <div className="space-y-4">
                  <h3 className={cn(
                    "text-lg font-semibold",
                    isDark ? "text-zinc-200" : "text-gray-800"
                  )}>
                    Client Performance
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <MetricCard
                      title="Total Revenue"
                      value={`$${currentRevenue.toLocaleString()}`}
                      changePercentage={growthRate}
                      changeType={growthRate >= 0 ? "increase" : "decrease"}
                      period="This Month"
                      icon={<DollarSign className="h-5 w-5" />}
                      isDark={isDark}
                    />
                    
                    <MetricCard
                      title="Campaigns"
                      value="4"
                      changePercentage={25}
                      changeType="increase"
                      period="From Last Month"
                      icon={<Target className="h-5 w-5" />}
                      isDark={isDark}
                    />
                    
                    <MetricCard
                      title="Conversion"
                      value="12.4%"
                      changePercentage={2.3}
                      changeType="increase"
                      period="From Last Month"
                      icon={<Percent className="h-5 w-5" />}
                      isDark={isDark}
                    />
                  </div>
                  
                  <div className={cn(
                    "p-4 rounded-xl",
                    isDark ? "bg-zinc-800/50" : "bg-gray-100"
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={cn(
                        "font-medium",
                        isDark ? "text-zinc-200" : "text-gray-800"
                      )}>
                        Revenue Trend
                      </h4>
                      <span className={cn(
                        "text-xs",
                        isDark ? "text-zinc-400" : "text-gray-500"
                      )}>
                        Last 6 months
                      </span>
                    </div>
                    <div className="h-48">
                      <ChartComponent 
                        data={revenueData} 
                        isDark={isDark} 
                        prefix="$" 
                        color={CHART_COLORS[0]} 
                      />
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-4 rounded-xl",
                    isDark ? "bg-zinc-800/50" : "bg-gray-100"
                  )}>
                    <h4 className={cn(
                      "font-medium mb-3",
                      isDark ? "text-zinc-200" : "text-gray-800"
                    )}>
                      Notes
                    </h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-zinc-300" : "text-gray-600"
                    )}>
                      {currentClient.notes || 'No notes available for this client.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Props for the client component
interface ClientPageProps {
  initialClients: Client[];
}

export default function ClientPage({ initialClients }: ClientPageProps) {
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const detailModalRef = useRef<HTMLDivElement>(null);
  
  // Filter state
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{ status: ClientStatus[] }>({ status: [] });
  const [stagedFilters, setStagedFilters] = useState<{ status: ClientStatus[] }>({ status: [] });

  // Use React Query to fetch clients
  const { data: clients = [], isLoading: isLoadingClients, isFetching } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      // Use the current agency ID from the user's profile (typically stored in React Query or context)
      const agencyId = 3; // Default to 3 if not available
      return ClientService.getClientsByAgencyId(agencyId);
    },
    initialData: initialClients,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Loading state
  const isLoading = isLoadingClients || isFetching;

  // Client handlers
  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsDetailModalVisible(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalVisible(false);
    setSelectedClient(null);
  };

  const handleClientAdded = (newClientData: ClientModel) => {
    setIsAddClientModalOpen(false);
    toast.success(`Client '${newClientData.name}' was added successfully!`);
    // React Query will automatically refetch the clients
  };

  // Filter handlers
  const handleApplyFilters = () => {
    setAppliedFilters(stagedFilters);
    setIsFilterPopoverOpen(false);
  };
  
  const handleClearFilters = () => {
    setStagedFilters({ status: [] });
    setAppliedFilters({ status: [] });
    setIsFilterPopoverOpen(false);
  };
  
  const handleStatusFilterChange = (status: ClientStatus) => {
    setStagedFilters(prev => {
      if (prev.status.includes(status)) {
        return { ...prev, status: prev.status.filter(s => s !== status) };
      } else {
        return { ...prev, status: [...prev.status, status] };
      }
    });
  };

  // Filter clients based on search query and filters
  const filteredClients = clients.filter(client => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.phone && client.phone.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by status
    const matchesStatus = appliedFilters.status.length === 0 || 
      appliedFilters.status.includes(client.status as ClientStatus);
    
    return matchesSearch && matchesStatus;
  });

  // Mock data for metrics
  const metrics = {
    totalClients: clients.length,
    newClients: 8,
    totalRevenue: 52800,
    averageRevenue: 1100,
    revenueGrowth: 12,
    activeClients: clients.filter(c => c.status === 'active').length,
    inactiveClients: clients.filter(c => c.status === 'inactive').length,
  };

  // Chart data
  const clientGrowthData = [
    { name: 'Jan', value: 31 },
    { name: 'Feb', value: 40 },
    { name: 'Mar', value: 45 },
    { name: 'Apr', value: 55 },
    { name: 'May', value: 63 },
    { name: 'Jun', value: metrics.totalClients },
  ];

  return (
    <>
      <div className="space-y-3 md:space-y-5 relative z-10 py-2">
        <GlassCard contentClassName="p-3 md:p-5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold flex items-center gap-2 ${
                isDark ? "text-zinc-100" : "text-gray-800"
              }`}>
                <User className={`h-7 w-7 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                Clients
              </h1>
              <p className={`text-sm ${isDark ? "text-zinc-300" : "text-gray-600"}`}>
                Manage your clients and their accounts
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-10 pr-4 py-2 w-full rounded-lg text-sm focus:outline-none focus:ring-2",
                    isDark
                      ? "bg-zinc-800/70 border-zinc-700/50 text-zinc-200 placeholder-zinc-500 focus:ring-blue-600/50"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/50"
                  )}
                />
              </div>
              
              <div className="flex gap-2">
                <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant={appliedFilters.status.length > 0 ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        appliedFilters.status.length > 0 ? "bg-blue-600" : "",
                        "px-3"
                      )}
                    >
                      <Filter className="mr-1 h-4 w-4" />
                      Filter
                      {appliedFilters.status.length > 0 && (
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-blue-600">
                          {appliedFilters.status.length}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3" align="end">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Client Status</h4>
                        <div className="space-y-2">
                          {(['active', 'inactive', 'suspended'] as ClientStatus[]).map((status) => (
                            <div key={status} className="flex items-center">
                              <Checkbox 
                                id={`status-${status}`} 
                                checked={stagedFilters.status.includes(status)}
                                onCheckedChange={() => handleStatusFilterChange(status)}
                              />
                              <Label
                                htmlFor={`status-${status}`}
                                className="ml-2 text-sm"
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleClearFilters}
                          className="text-xs h-8"
                        >
                          <FilterX className="mr-1 h-3 w-3" />
                          Clear
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleApplyFilters}
                          className="text-xs h-8"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  size="sm"
                  className="px-3"
                  onClick={() => setIsAddClientModalOpen(true)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Client
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
        
        {/* Client Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
          <GlassCard className="md:col-span-3 xl:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                </>
              ) : (
                <>
                  <MetricCard
                    title="Total Clients"
                    value={metrics.totalClients.toString()}
                    changePercentage={10}
                    changeType="increase"
                    period="This Quarter"
                    icon={<User className="h-5 w-5" />}
                    isDark={isDark}
                  />
                  
                  <MetricCard
                    title="New Clients"
                    value={metrics.newClients.toString()}
                    changePercentage={15}
                    changeType="increase"
                    period="This Month"
                    icon={<ArrowUpRight className="h-5 w-5" />}
                    isDark={isDark}
                  />
                  
                  <MetricCard
                    title="Active Clients"
                    value={metrics.activeClients.toString()}
                    changePercentage={5}
                    changeType="increase"
                    period="This Month"
                    icon={<Target className="h-5 w-5" />}
                    isDark={isDark}
                  />
                </>
              )}
            </div>
          </GlassCard>
          
          <GlassCard className="xl:col-span-2 hidden xl:block">
            <div className="p-3 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${isDark ? "text-zinc-200" : "text-gray-800"}`}>
                  Client Growth
                </h3>
                <span className={`text-xs ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                  Last 6 months
                </span>
              </div>
              
              <div className="h-[180px]">
                {isLoading ? (
                  <Skeleton className="h-full rounded-xl" />
                ) : (
                  <ChartComponent 
                    data={clientGrowthData} 
                    isDark={isDark} 
                    prefix="" 
                    color={CHART_COLORS[1]} 
                  />
                )}
              </div>
            </div>
          </GlassCard>
        </div>
        
        {/* Clients List */}
        <GlassCard>
          <div className="p-3 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${isDark ? "text-zinc-200" : "text-gray-800"}`}>
                Client List
              </h3>
              <span className={`text-xs ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                {filteredClients.length} clients
              </span>
            </div>
            
            <div className="space-y-3">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <ClientListItem
                    key={client.id}
                    client={client}
                    isDark={isDark}
                    onClick={() => handleClientClick(client)}
                  />
                ))
              ) : (
                <div className={cn(
                  "text-center py-10 rounded-lg",
                  isDark ? "bg-zinc-800/50" : "bg-gray-100"
                )}>
                  <LightbulbIcon className={cn(
                    "h-10 w-10 mx-auto mb-3",
                    isDark ? "text-zinc-500" : "text-gray-400"
                  )} />
                  <h3 className={cn(
                    "text-lg font-medium mb-1",
                    isDark ? "text-zinc-300" : "text-gray-700"
                  )}>
                    No clients found
                  </h3>
                  <p className={cn(
                    "text-sm max-w-md mx-auto",
                    isDark ? "text-zinc-500" : "text-gray-500"
                  )}>
                    {searchQuery || appliedFilters.status.length > 0 
                      ? "Try adjusting your search or filters to find what you're looking for."
                      : "Get started by adding your first client using the 'Add Client' button."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* Modals */}
      <ClientDetailModal 
        isOpen={isDetailModalVisible}
        onClose={handleCloseDetail}
        client={selectedClient}
      />
      
      <AddClientModal 
        isOpen={isAddClientModalOpen}
        onOpenChange={setIsAddClientModalOpen}
        onClientAdded={handleClientAdded}
        agencyId={3} // Default agency ID
      />
    </>
  );
} 