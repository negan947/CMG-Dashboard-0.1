'use client';

import { MetricCard } from '@/components/ui/charts';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';
import { useQuery } from '@tanstack/react-query';
import { WidgetProps } from './types';
import { DashboardService } from '@/services/dashboard-service';
import { WidgetEditControls } from './WidgetEditControls';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

// Define a more explicit type for default metrics
interface MetricData {
  metric_name: string;
  current_value: number;
  previous_value: number | null;
  change_percentage: number | null;
}

// Default metrics to use when database metrics aren't found
const DEFAULT_METRICS: Record<string, MetricData> = {
  objectives: { metric_name: 'Objectives', current_value: 53, previous_value: 48, change_percentage: 18 },
  inquiry_success_rate: { metric_name: 'Inquiry Success Rate', current_value: 36.2, previous_value: 37.1, change_percentage: -2.5 },
  new_leads: { metric_name: 'New Leads', current_value: 134, previous_value: 106, change_percentage: 18 },
  overdue_tasks: { metric_name: 'Overdue Tasks', current_value: 12, previous_value: 5, change_percentage: 12 },
  total_clients: { metric_name: 'Total Clients', current_value: 87, previous_value: 76, change_percentage: 14 },
  support_requests: { metric_name: 'Support Requests', current_value: 24, previous_value: 22, change_percentage: 8 },
  overdue_payments: { metric_name: 'Overdue Payments', current_value: 5, previous_value: null, change_percentage: null },
  team_productivity: { metric_name: 'Team Productivity', current_value: 68, previous_value: 64, change_percentage: 6 },
};

export function MetricsCardWidget({ id, config, isEditing, onConfigChange, onRemove }: WidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const service = DashboardService.getInstance();
  
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics', config.dataSource],
    queryFn: async () => {
      const allMetrics = await service.getMetrics();
      // Try to find the metric in the database
      const metric = allMetrics.find(m => m.metric_name.toLowerCase() === config.dataSource.toLowerCase());
      
      // If not found, return a default metric
      if (!metric) {
        const defaultKey = config.dataSource.toLowerCase();
        return DEFAULT_METRICS[defaultKey as string] || { 
          metric_name: config.title || 'Metric', 
          current_value: 0, 
          previous_value: null, 
          change_percentage: null 
        };
      }
      
      return metric;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Safely handle function props
  const handleConfigure = () => {
    if (onConfigChange) onConfigChange(id);
  };

  const handleRemove = () => {
    console.log('MetricsCardWidget handling remove for id:', id);
    if (onRemove) {
      // Call after a small delay to ensure event propagation is complete
      setTimeout(() => {
        onRemove();
      }, 10);
    }
  };

  // Handle cases when data isn't available
  if (!metrics) {
    return (
      <div className="w-full h-full flex flex-col">
        {isEditing && (
          <WidgetEditControls 
            onConfigure={handleConfigure} 
            onRemove={handleRemove} 
          />
        )}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <h3 className={cn(
            "text-sm font-medium mb-1",
            isDark ? "text-zinc-400" : "text-gray-600"
          )}>
            {config.title || "Loading..."}
          </h3>
          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-10 w-24 rounded-md"></div>
        </div>
      </div>
    );
  }

  // Format values to handle potential floating point issues
  const formatValue = (value: number | null): number => {
    if (value === null) return 0;
    // Round to 1 decimal place
    return Math.round(value * 10) / 10;
  };

  const currentValue = formatValue(metrics.current_value);
  const previousValue = formatValue(metrics.previous_value);
  const changePercentage = formatValue(metrics.change_percentage);
  const changeValue = previousValue ? formatValue(currentValue - previousValue) : 0;

  // Format the display value
  const hasDecimal = currentValue % 1 !== 0;
  const valueDisplay = hasDecimal ? currentValue.toFixed(1) : currentValue.toString();

  // Determine color based on change
  const isPositive = changePercentage >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const changePrefix = isPositive ? '↑' : '↓';

  return (
    <div className="w-full h-full flex flex-col">
      {isEditing && (
        <WidgetEditControls 
          onConfigure={handleConfigure} 
          onRemove={handleRemove} 
        />
      )}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className={cn(
          "text-sm font-medium mb-1",
          isDark ? "text-zinc-400" : "text-gray-600"
        )}>
          {config.title || metrics.metric_name}
        </h3>
        <div className="flex items-end gap-2 mb-1">
          <span className="text-3xl font-bold">
            {valueDisplay}{config.suffix || ''}
          </span>
          {changePercentage !== null && (
            <span className={`text-sm font-medium ${changeColor} mb-1`}>
              {changePrefix} {Math.abs(changePercentage)}%
            </span>
          )}
        </div>
        {changeValue !== 0 && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {isPositive ? '+' : '-'} {Math.abs(changeValue)} vs. last period
          </div>
        )}
        {config.showDonut && (
          <div className="mt-2 h-24 w-24">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                strokeWidth="12" 
                stroke={isDark ? "#333" : "#eee"} 
              />
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                strokeWidth="12" 
                stroke={config.color || CHART_COLORS[0]} 
                strokeDasharray={`${currentValue * 2.51} 251`}
                strokeDashoffset="0" 
                transform="rotate(-90 50 50)" 
              />
              <text 
                x="50" y="55" 
                textAnchor="middle" 
                dominantBaseline="middle"
                fontSize="18"
                fontWeight="bold"
                fill={isDark ? "#fff" : "#333"}
              >
                {currentValue}%
              </text>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
} 