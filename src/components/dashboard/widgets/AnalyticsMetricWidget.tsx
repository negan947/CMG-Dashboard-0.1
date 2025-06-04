'use client';

import { useState, useEffect } from 'react';
import { WidgetProps } from './types';
import { WidgetEditControls } from './WidgetEditControls';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics-service';
import { MetricCard } from '@/components/ui/charts';
import { Skeleton } from '@/components/ui/skeleton';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';

export function AnalyticsMetricWidget({
  id,
  config,
  isEditing,
  onConfigChange,
  onRemove,
}: WidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const analyticsService = AnalyticsService.getInstance();
  
  // Get configured values
  const title = config.title || 'Analytics Metric';
  const metricName = config.metricName || 'Engagement';
  const color = config.color || '#3b82f6';
  const showDonut = config.showDonut !== undefined ? config.showDonut : true;
  const suffix = config.suffix || '%';
  const prefix = config.prefix || '';
  
  // Safely handle function props
  const handleConfigure = () => {
    if (onConfigChange) onConfigChange(id);
  };

  const handleRemove = () => {
    console.log('AnalyticsMetricWidget handling remove for id:', id);
    if (onRemove) {
      // Call after a small delay to ensure event propagation is complete
      setTimeout(() => {
        onRemove();
      }, 10);
    }
  };
  
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['analytics-metrics', metricName],
    queryFn: async () => {
      const allMetrics = await analyticsService.getMetrics();
      return allMetrics.find(m => 
        m.metric_name.toLowerCase() === metricName.toLowerCase()
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle cases when data isn't available
  if (isLoading) {
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
            {title}
          </h3>
          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-10 w-24 rounded-md"></div>
        </div>
      </div>
    );
  }

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
            {title}
          </h3>
          <div className={cn(
            "text-sm",
            isDark ? "text-zinc-500" : "text-gray-500"
          )}>
            Metric "{metricName}" not found
          </div>
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
  const previousValue = metrics.previous_value !== null ? formatValue(metrics.previous_value) : null;
  const changePercentage = metrics.change_percentage !== null ? formatValue(metrics.change_percentage) : null;
  const changeValue = previousValue !== null ? formatValue(currentValue - previousValue) : 0;

  // Format the display value
  const hasDecimal = currentValue % 1 !== 0;
  const valueDisplay = hasDecimal ? currentValue.toFixed(1) : currentValue.toString();

  // Determine color based on change
  const isPositive = changePercentage !== null ? changePercentage >= 0 : false;
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
          {title}
        </h3>
        <div className="flex items-end gap-2 mb-1">
          <span className="text-3xl font-bold">
            {prefix}{valueDisplay}{suffix}
          </span>
          {changePercentage !== null && (
            <span className={`text-sm font-medium ${changeColor} mb-1`}>
              {changePrefix} {Math.abs(changePercentage)}%
            </span>
          )}
        </div>
        {changeValue !== 0 && previousValue !== null && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {isPositive ? '+' : '-'} {Math.abs(changeValue)} vs. last period
          </div>
        )}
        {showDonut && (
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
                stroke={color || CHART_COLORS[0]} 
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