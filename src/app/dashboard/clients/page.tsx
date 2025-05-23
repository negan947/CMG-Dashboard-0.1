'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Facebook, Twitter, TrendingUp, Instagram, Loader2, SlidersHorizontal, FilterX
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientListItem } from '@/components/clients/ClientListItem';
import { AddClientModal } from '@/components/clients/AddClientModal';
import { useProfile } from '@/hooks/use-profile';
import { ClientModel, ClientStatus } from '@/types/models.types';
import { ClientService } from '@/services/client-service';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ClientFollowUps } from '@/components/dashboard/clients/ClientFollowUps';

// Define types for our data

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
  const { 
    profile, 
    isLoading: isProfileLoading, 
    currentAgencyId
  } = useProfile(); 
  const isDark = theme !== 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const detailModalRef = useRef<HTMLDivElement>(null);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);

  // Filter state
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{ status: ClientStatus[] }>({ status: [] });
  const [stagedFilters, setStagedFilters] = useState<{ status: ClientStatus[] }>({ status: [] });

  // --- Data Fetching --- 
  const fetchClients = useCallback(async () => {
    if (!currentAgencyId) return; 

    setIsLoadingClients(true);
    setClientError(null);
    try {
      const fetchedClients: ClientModel[] = await ClientService.getClientsByAgencyId(currentAgencyId);
      
      // Simplified mapping to the updated local Client type
      const mappedClients: Client[] = fetchedClients.map(dbClient => ({
        ...dbClient, // Spread all ClientModel properties
        initials: dbClient.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase(),
      }));

      setClients(mappedClients);
    } catch (error: any) {
      console.error("Error fetching clients:", error);
      setClientError(error.message || "Failed to load clients.");
      toast.error(error.message || "Failed to load clients.");
    } finally {
      setIsLoadingClients(false);
    }
  }, [currentAgencyId]);

  useEffect(() => {
    if (currentAgencyId) {
      fetchClients();
    }
  }, [currentAgencyId, fetchClients]);
  // --- End Data Fetching ---

  // Mock data - keep for metrics/other sections until they are dynamic
  const metrics = {
    totalClients: 73,
    newClients: 20,
    newClientsChange: 2,
    inquirySuccessRate: 36.2,
    inquiryRateChange: -0.9,
    overdueTasks: 12,
    overdueTasksChange: 7
  };

  // Filter clients based on search query and applied filters
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters = appliedFilters.status.length === 0 || appliedFilters.status.includes(client.status as ClientStatus);
    return matchesSearch && matchesFilters;
  });

  // Handle client click
  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsDetailModalVisible(true);
  };

  // Handle close client detail view
  const handleCloseDetail = () => {
    setIsDetailModalVisible(false);
    setTimeout(() => setSelectedClient(null), 300); 
  };

  // Handle clicks globally - close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (detailModalRef.current && !detailModalRef.current.contains(event.target as Node)) {
        handleCloseDetail();
      }
    }
    if (isDetailModalVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDetailModalVisible]);

  const handleClientAdded = (newClientData: ClientModel) => {
    // Simplified mapping for adding new client to local state
    const newListItem: Client = {
      ...newClientData, // Spread all ClientModel properties
      initials: newClientData.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase(),
    };
    setClients(prevClients => [newListItem, ...prevClients]);
    // fetchClients(); // Consider refetching instead for full consistency
  };

  const canAddClient = !isProfileLoading && typeof currentAgencyId === 'number';

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
      const newStatusFilters = prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status];
      return { ...prev, status: newStatusFilters };
    });
  };

  const hasActiveFilters = appliedFilters.status.length > 0;

  // Fully rewritten modal that will work reliably
  const ClientDetailModal = ({ isOpen, onClose, client: currentClient }: { 
    isOpen: boolean; 
    onClose: () => void; 
    client: Client | null;
  }) => {
    const { theme } = useTheme();
    const isDark = theme !== 'light';
    const internalModalRef = useRef<HTMLDivElement>(null);
    const [chartsReady, setChartsReady] = useState(false); 

    useEffect(() => {
      console.log('[ClientDetailModal] isOpen changed:', isOpen);
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
        console.log('[ClientDetailModal] Setting chartsReady to false because modal is closing.');
        setChartsReady(false); 
      }
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    console.log('[ClientDetailModal] Rendering. chartsReady:', chartsReady, 'isOpen:', isOpen, 'client:', !!currentClient);

    if (!isOpen || !currentClient) return null;

    const modalAnimationProps = (delay: number = 0) => ({
      initial: "hidden",
      animate: "visible",
      exit: "hidden",
      variants: modalContentVariants,
      custom: delay
    });

    return (
      <motion.div
        ref={internalModalRef}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          isDark ? "bg-black/70" : "bg-black/50"
        )}
        {...modalAnimationProps(0)} // Apply to backdrop
        style={{ backdropFilter: 'blur(8px)' }} 
      >
        <motion.div 
          className={cn(
            "relative w-full max-w-3xl rounded-xl shadow-2xl",
            isDark ? "bg-zinc-900/90 border border-zinc-700/50" : "bg-white/95 border",
            "overflow-hidden flex flex-col max-h-[90vh]" // Added flex-col and max-height
          )}
          {...modalAnimationProps(0.1)} // Apply to main card, slight delay
          onAnimationComplete={() => {
            console.log('[ClientDetailModal] Main card animationComplete. isOpen:', isOpen);
            if (isOpen) {
              setTimeout(() => {
                console.log('[ClientDetailModal] setTimeout fired, setting chartsReady to true.');
                setChartsReady(true); 
              }, 100); 
            }
          }}
        >
          <div className={cn(
            "flex items-center justify-between p-4 sm:p-6 border-b",
            isDark ? "border-zinc-700" : "border-gray-200"
          )}>
            <div className="flex items-center">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 mr-3">
                <AvatarFallback className={cn(isDark ? "bg-zinc-700 text-zinc-200" : "bg-blue-100 text-blue-600", "text-lg sm:text-xl")}>
                  {currentClient.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className={cn("text-lg sm:text-xl font-semibold", isDark ? "text-zinc-100" : "text-gray-900")}>{currentClient.name}</h2>
                <p className={cn("text-xs sm:text-sm", isDark ? "text-zinc-400" : "text-gray-500")}>{currentClient.status}</p>
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
            <div className={cn("p-3 sm:p-4 rounded-md space-y-2 text-sm", isDark ? "bg-zinc-700/50" : "bg-gray-100")}>
                <p><strong>Status:</strong> {currentClient.status}</p>
                <p><strong>Email:</strong> {currentClient.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {currentClient.phone || 'N/A'}</p>
                {/* Add other available fields from ClientModel/DB here */}
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
            onClick={() => {
              if (canAddClient) {
                setIsAddClientModalOpen(true)
              } else {
                console.warn('Cannot add client: Agency ID not available or profile loading.');
              }
            }}
            disabled={!canAddClient} // Simpler check now
            className={cn(
              "flex items-center px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium rounded-md shadow-sm transition-opacity",
              isDark ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white",
              !canAddClient ? "opacity-50 cursor-not-allowed" : "" // Updated disabled style check
            )}
          >
            {isProfileLoading ? (
              <Loader2 className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <Plus className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" />
            )}
            Add Client
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard title="Total Clients" value={metrics.totalClients} />
        <MetricCard title="New This Month" value={metrics.newClients} changePercentage={metrics.newClientsChange} />
        <MetricCard title="Inquiry Success" value={metrics.inquirySuccessRate} suffix="%" changePercentage={metrics.inquiryRateChange} />
        <MetricCard title="Overdue Tasks" value={metrics.overdueTasks} changeValue={metrics.overdueTasksChange} />
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
            <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  className={cn(
                    "flex items-center justify-center w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md border transition-all duration-200 ease-in-out",
                    isDark ? "border-zinc-600 hover:bg-zinc-700 text-zinc-100" : "border-gray-300 hover:bg-gray-100 text-gray-700",
                    hasActiveFilters && (isDark ? "bg-blue-700/30 border-blue-600" : "bg-blue-500/10 border-blue-500/50")
                  )}
                  onClick={() => setStagedFilters(appliedFilters)} // Initialize staged filters when opening
                >
                  {hasActiveFilters ? (
                    <FilterX className="mr-1.5 h-4 w-4 text-blue-500" />
                  ) : (
                    <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                  )}
                  Filter
                  {hasActiveFilters && (
                     <span className={cn("ml-1.5 px-1.5 py-0.5 rounded-full text-xs", isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white")}>
                       {appliedFilters.status.length}
                     </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className={cn("w-64 p-0", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200")}
                sideOffset={5}
                align="end"
              >
                <AnimatePresence>
                  {isFilterPopoverOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-4"
                    >
                      <h4 className={cn("text-sm font-medium mb-3", isDark ? "text-zinc-100" : "text-gray-800")}>Filter by Status</h4>
                      <div className="space-y-2">
                        {(Object.values(ClientStatus) as ClientStatus[]).map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`filter-status-${status}`}
                              checked={stagedFilters.status.includes(status)}
                              onCheckedChange={() => handleStatusFilterChange(status)}
                              className={cn(isDark ? "border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" : "")}
                            />
                            <Label 
                              htmlFor={`filter-status-${status}`}
                              className={cn("text-sm font-normal cursor-pointer", isDark ? "text-zinc-300" : "text-gray-700")}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <div className={cn("flex justify-end space-x-2 mt-4 pt-3 border-t", isDark ? "border-zinc-700" : "border-gray-200")}>
                        <Button variant="ghost" size="sm" onClick={handleClearFilters} className={cn(isDark ? "text-zinc-300 hover:text-zinc-100" : "")}>
                          Clear
                        </Button>
                        <Button size="sm" onClick={handleApplyFilters} className={cn(isDark ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600")}>
                          Apply
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </PopoverContent>
            </Popover>
          </div>

          {isLoadingClients && (
            <div className="text-center py-10">Loading clients...</div>
          )}
          {!isLoadingClients && clientError && (
            <div className="text-center py-10 text-red-500">Error: {clientError}</div>
          )}
          {!isLoadingClients && !clientError && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {filteredClients.length > 0 ? (
                filteredClients.map((client, index) => (
                  <ClientListItem 
                    key={client.id} 
                    client={client} 
                    isDark={isDark} 
                    onClick={handleClientClick}
                    index={index} 
                  />
                ))
              ) : (
                <p className={cn("md:col-span-2 text-center py-10", isDark ? "text-zinc-400" : "text-gray-500")}>
                  No clients found.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          <ClientFollowUps 
            agencyId={currentAgencyId || undefined}
            className="mt-2" 
          />
        </div>
      </div>

      {typeof currentAgencyId === 'number' && (
        <AddClientModal
          isOpen={isAddClientModalOpen}
          onOpenChange={setIsAddClientModalOpen}
          onClientAdded={handleClientAdded}
          agencyId={currentAgencyId}
        />
      )}

      <ClientDetailModal
        isOpen={isDetailModalVisible}
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