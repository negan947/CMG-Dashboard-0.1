'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useQuery, useMutation } from '@tanstack/react-query';
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
  Percent,
  Plus
} from 'lucide-react';
import { AnalyticsService } from '@/services/analytics-service';
import { ChannelData, ConversionData, PerformanceTrendData } from '@/services/analytics-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { UserWidget } from '@/components/dashboard/widgets/types';
import { EditableDashboard } from '@/components/dashboard/EditableDashboard';
import { AddWidgetModal } from '@/components/dashboard/AddWidgetModal';
import { WidgetConfigModal } from '@/components/dashboard/WidgetConfigModal';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// Define types for the props
interface AnalyticsData {
  metrics: Array<{
    id: number;
    name: string;
    value: number;
    previousValue: number | null;
    changePercentage: number | null;
    period: string | null;
  }>;
  channelData: ChannelData[];
  conversionData: ConversionData[];
  performanceTrends: PerformanceTrendData[];
}

interface ClientPageProps {
  initialAnalyticsData: AnalyticsData;
}

export default function ClientPage({ initialAnalyticsData }: ClientPageProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const service = AnalyticsService.getInstance();
  
  // State for the editable dashboard
  const [isEditing, setIsEditing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [configWidget, setConfigWidget] = useState<UserWidget | null>(null);
  const [userWidgets, setUserWidgets] = useState<UserWidget[]>([]);
  const [pendingChanges, setPendingChanges] = useState<UserWidget[]>([]);
  
  // Use React Query to fetch and cache data, with initial data from the server
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-data', timeFrame],
    queryFn: async () => {
      const metrics = await service.getMetrics();
      const channelData = await service.getChannelData();
      const conversionData = await service.getConversionData();
      const performanceTrends = await service.getPerformanceTrends();
      
      return {
        metrics: metrics.map((metric) => ({
          id: metric.id,
          name: metric.metric_name,
          value: metric.current_value,
          previousValue: metric.previous_value,
          changePercentage: metric.change_percentage,
          period: metric.period,
        })),
        channelData,
        conversionData,
        performanceTrends
      };
    },
    initialData: initialAnalyticsData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user's analytics widgets
  const { data: widgets, isLoading: isLoadingWidgets, refetch: refetchWidgets } = useQuery({
    queryKey: ['user-analytics-widgets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return service.getUserAnalyticsWidgets(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Mutation for saving widgets
  const saveWidgetsMutation = useMutation({
    mutationFn: async (widgets: UserWidget[]) => {
      if (!user?.id) return false;
      return service.saveUserAnalyticsWidgets(user.id, widgets);
    },
    onSuccess: () => {
      refetchWidgets();
      toast.success('Analytics dashboard layout saved');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to save analytics dashboard layout');
    },
  });
  
  // If user has no saved widgets, use default layout
  useEffect(() => {
    if (!isLoadingWidgets) {
      if (!widgets || widgets.length === 0) {
        setUserWidgets(service.getDefaultAnalyticsWidgets());
      } else {
        setUserWidgets(widgets);
      }
    }
  }, [widgets, isLoadingWidgets, service]);
  
  const userName = user?.email ? user.email.split('@')[0] : 'User';
  
  // Handle editing mode
  const startEditing = () => {
    setPendingChanges([...userWidgets]);
    setIsEditing(true);
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setPendingChanges([]);
    setConfigWidget(null);
  };
  
  const saveLayout = () => {
    saveWidgetsMutation.mutate(pendingChanges);
  };
  
  // Add/remove widgets
  const handleAddWidget = (widget: UserWidget) => {
    setPendingChanges([...pendingChanges, widget]);
  };
  
  /**
   * Removes a widget from the dashboard
   */
  const handleRemoveWidget = (widgetId: string) => {
    console.log('Handling widget removal for widget ID:', widgetId);
    
    // Get the current widgets based on edit state
    const currentWidgets = isEditing ? pendingChanges : userWidgets;
    
    // Create new array without the widget to remove
    const updatedWidgets = currentWidgets.filter(w => w.id !== widgetId);
    console.log(`Filtered widgets from ${currentWidgets.length} to ${updatedWidgets.length}`);
    
    if (isEditing) {
      // In edit mode, just update the pending changes
      setPendingChanges(updatedWidgets);
    } else {
      // In view mode, update both states and persist changes
      setUserWidgets(updatedWidgets);
      setPendingChanges(updatedWidgets);
      
      // If user is removing a widget outside of edit mode, we need to save the change
      // First enable edit mode temporarily
      setIsEditing(true);
      
      // Then save the changes after a short delay
      setTimeout(() => {
        saveWidgetsMutation.mutate(updatedWidgets);
      }, 0);
    }
  };
  
  // Configure widget
  const handleConfigureWidget = (widgetId: string) => {
    // Find the widget in either userWidgets or pendingChanges based on edit mode
    const widget = isEditing 
      ? pendingChanges.find(w => w.id === widgetId)
      : userWidgets.find(w => w.id === widgetId);
    
    if (widget) {
      console.log('Configuring widget:', widget);
      
      // If not in edit mode, start editing mode and set pending changes first
      if (!isEditing) {
        setPendingChanges([...userWidgets]);
        setIsEditing(true);
        // Use setTimeout to ensure state updates before setting config widget
        setTimeout(() => {
          setConfigWidget(widget);
        }, 0);
      } else {
        setConfigWidget(widget);
      }
    } else {
      console.error(`Widget with ID ${widgetId} not found for configuration`);
    }
  };
  
  const handleSaveWidgetConfig = (widgetId: string, newConfig: Record<string, any>) => {
    setPendingChanges(pendingChanges.map(widget => 
      widget.id === widgetId 
        ? { ...widget, config: newConfig }
        : widget
    ));
    setConfigWidget(null);
  };
  
  // Update layout
  const handleLayoutChange = (layout: any) => {
    const updatedWidgets = pendingChanges.map(widget => {
      const layoutItem = layout.find((item: any) => item.i === widget.id);
      if (!layoutItem) return widget;
      
      return {
        ...widget,
        gridPosition: {
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h
        }
      };
    });
    
    setPendingChanges(updatedWidgets);
  };

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
            
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
              <Tabs defaultValue="month" className="w-full md:w-auto">
                <TabsList className="grid grid-cols-4 w-full md:w-auto">
                  <TabsTrigger value="week" onClick={() => setTimeFrame('week')}>Week</TabsTrigger>
                  <TabsTrigger value="month" onClick={() => setTimeFrame('month')}>Month</TabsTrigger>
                  <TabsTrigger value="quarter" onClick={() => setTimeFrame('quarter')}>Quarter</TabsTrigger>
                  <TabsTrigger value="year" onClick={() => setTimeFrame('year')}>Year</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex-shrink-0">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={saveLayout}
                      className={cn(
                        "px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base",
                        "bg-blue-600 text-white hover:bg-blue-700",
                        "shadow-sm"
                      )}
                    >
                      Save Layout
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      className={cn(
                        "px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base",
                        isDark 
                          ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700" 
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300",
                        "shadow-sm"
                      )}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={startEditing}
                    className={cn(
                      "px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base",
                      isDark 
                        ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700" 
                        : "bg-white text-gray-700 hover:bg-gray-100",
                      "border border-solid",
                      isDark ? "border-zinc-700" : "border-gray-200",
                      "shadow-sm"
                    )}
                  >
                    Edit Dashboard
                  </Button>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
        
        <EditableDashboard 
          widgets={isEditing ? pendingChanges : userWidgets}
          isEditing={isEditing}
          onLayoutChange={handleLayoutChange}
          onRemoveWidget={handleRemoveWidget}
          onConfigureWidget={handleConfigureWidget}
          onAddWidget={() => setShowAddWidget(true)}
        />
        
        {/* Widget modals */}
        <AddWidgetModal 
          isOpen={showAddWidget}
          onClose={() => setShowAddWidget(false)}
          onAddWidget={handleAddWidget}
        />
        
        <WidgetConfigModal 
          widget={configWidget}
          onClose={() => setConfigWidget(null)}
          onSave={handleSaveWidgetConfig}
        />
      </div>
    </div>
  );
} 