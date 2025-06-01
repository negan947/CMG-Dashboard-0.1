'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
import { useQuery, useMutation } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';
import { DashboardService } from '@/services/dashboard-service';
import { EditableDashboard } from '@/components/dashboard/EditableDashboard';
import { useState, useEffect } from 'react';
import { UserWidget } from '@/components/dashboard/widgets/types';
import { AddWidgetModal } from '@/components/dashboard/AddWidgetModal';
import { WidgetConfigModal } from '@/components/dashboard/WidgetConfigModal';
import { toast } from 'sonner';

// Define types for the props
interface DashboardMetricsData {
  metrics: Array<{
    id: number;
    name: string;
    value: number;
    previousValue: number | null;
    changePercentage: number | null;
    period: string | null;
  }>;
  categories: Array<{
    id: number;
    name: string;
    color: string | null;
    count: number;
  }>;
  trend: Array<{
    name: string;
    value: number;
  }>;
}

interface CampaignData {
  campaigns: any[];
  performance: any[];
  statusCounts: Array<{
    status: string;
    count: number;
  }>;
  platformPerformance: Array<{
    platform: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  }>;
}

interface ClientPageProps {
  initialDashboardMetrics: DashboardMetricsData;
  initialCampaignData: CampaignData;
}

export default function ClientPage({ 
  initialDashboardMetrics, 
  initialCampaignData 
}: ClientPageProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const service = DashboardService.getInstance();
  
  // State for the editable dashboard
  const [isEditing, setIsEditing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [configWidget, setConfigWidget] = useState<UserWidget | null>(null);
  const [userWidgets, setUserWidgets] = useState<UserWidget[]>([]);
  const [pendingChanges, setPendingChanges] = useState<UserWidget[]>([]);
  
  // Use React Query to fetch dashboard metrics, with initial data from the server
  const { data: dashboardMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const metrics = await service.getMetrics();
      const categories = await service.getClientCategories();
      const trend = await service.getClientActivityTrend();
      
      return {
        metrics: metrics.map((metric) => ({
          id: metric.id,
          name: metric.metric_name,
          value: metric.current_value,
          previousValue: metric.previous_value,
          changePercentage: metric.change_percentage,
          period: metric.period,
        })),
        categories,
        trend: trend.map(item => ({
          name: item.name,
          value: item.value
        }))
      };
    },
    initialData: initialDashboardMetrics,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Use React Query to fetch campaign data
  const { data: campaignData } = useQuery({
    queryKey: ['campaign-data'],
    queryFn: async () => {
      const agencyId = 3; // Default agency ID
      const campaigns = await service.getCampaigns(agencyId);
      const performance = await service.getCampaignPerformance(agencyId, 30);
      const statusCounts = await service.getCampaignStatusCounts(agencyId);
      const platformPerformance = await service.getPlatformPerformance(agencyId);
      
      return {
        campaigns,
        performance,
        statusCounts,
        platformPerformance
      };
    },
    initialData: initialCampaignData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch user's dashboard widgets
  const { data: widgets, isLoading: isLoadingWidgets, refetch: refetchWidgets } = useQuery({
    queryKey: ['user-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return service.getUserDashboardWidgets(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Mutation for saving widgets
  const saveWidgetsMutation = useMutation({
    mutationFn: async (widgets: UserWidget[]) => {
      if (!user?.id) return false;
      return service.saveUserDashboardWidgets(user.id, widgets);
    },
    onSuccess: () => {
      refetchWidgets();
      toast.success('Dashboard layout saved');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to save dashboard layout');
    },
  });
  
  // If user has no saved widgets, use default layout
  useEffect(() => {
    if (!isLoadingWidgets) {
      if (!widgets || widgets.length === 0) {
        setUserWidgets(service.getDefaultWidgets());
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
   * This implementation ensures widgets are removed both from state
   * and persisted to the backend as needed
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
      
      // Save changes to the server immediately
      saveWidgetsMutation.mutate(updatedWidgets);
    }
  };
  
  // Configure widget
  const handleConfigureWidget = (widgetId: string) => {
    const widget = pendingChanges.find(w => w.id === widgetId);
    if (widget) {
      setConfigWidget(widget);
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
        <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
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
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={saveLayout}
                  className={cn(
                    "px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base",
                    "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  Save Layout
                </button>
                <button
                  onClick={cancelEditing}
                  className={cn(
                    "px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base",
                    isDark 
                      ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  )}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={startEditing}
                className={cn(
                  "px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base",
                  isDark 
                    ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700" 
                    : "bg-white text-gray-700 hover:bg-gray-100",
                  "border",
                  isDark ? "border-zinc-700" : "border-gray-200"
                )}
              >
                Edit Dashboard
              </button>
            )}
          </div>
        </div>
        
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