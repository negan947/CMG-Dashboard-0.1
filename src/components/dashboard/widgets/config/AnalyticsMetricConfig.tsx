'use client';

import { useState, useEffect } from 'react';
import { WidgetConfigProps } from '../types';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics-service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function AnalyticsMetricConfig({ id, config, onChange, onClose }: WidgetConfigProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const analyticsService = AnalyticsService.getInstance();
  
  // Local state for form
  const [formState, setFormState] = useState({
    title: config.title || 'Analytics Metric',
    metricName: config.metricName || 'Engagement',
    color: config.color || CHART_COLORS[0],
    showDonut: config.showDonut !== undefined ? config.showDonut : true,
    suffix: config.suffix || '%',
    prefix: config.prefix || ''
  });
  
  // Fetch available metrics
  const { data: metrics } = useQuery({
    queryKey: ['analytics-metrics-config'],
    queryFn: async () => {
      return await analyticsService.getMetrics();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handle form changes
  const handleChange = (field: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle save
  const handleSave = () => {
    onChange(formState);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure Analytics Metric</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="title">Widget Title</Label>
            <Input
              id="title"
              value={formState.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Analytics Metric"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="metricName">Metric</Label>
            <Select
              value={formState.metricName}
              onValueChange={(value) => handleChange('metricName', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {metrics?.map((metric) => (
                  <SelectItem key={metric.id} value={metric.metric_name}>
                    {metric.metric_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex flex-wrap gap-2">
              {CHART_COLORS.map((color, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-8 h-8 rounded-full cursor-pointer border-2",
                    formState.color === color ? "border-blue-500" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange('color', color)}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showDonut"
              checked={formState.showDonut}
              onCheckedChange={(checked) => handleChange('showDonut', checked)}
            />
            <Label htmlFor="showDonut">Show as donut chart</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prefix">Prefix</Label>
              <Input
                id="prefix"
                value={formState.prefix}
                onChange={(e) => handleChange('prefix', e.target.value)}
                placeholder="$"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="suffix">Suffix</Label>
              <Input
                id="suffix"
                value={formState.suffix}
                onChange={(e) => handleChange('suffix', e.target.value)}
                placeholder="%"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="mr-2"
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 