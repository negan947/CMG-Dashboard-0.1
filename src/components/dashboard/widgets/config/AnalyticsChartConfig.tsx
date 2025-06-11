'use client';

import { useState } from 'react';
import { WidgetConfigProps } from '../types';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function AnalyticsChartConfig({ id, config, onChange, onClose }: WidgetConfigProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Local state for form
  const [formState, setFormState] = useState({
    title: config.title || 'Analytics Chart',
    chartType: config.chartType || 'pie',
    dataSource: config.dataSource || 'channelData'
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
          <DialogTitle>Configure Analytics Chart</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="title">Chart Title</Label>
            <Input
              id="title"
              value={formState.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Analytics Chart"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Chart Type</Label>
            <RadioGroup 
              value={formState.chartType} 
              onValueChange={(value) => handleChange('chartType', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pie" id="pie" />
                <Label htmlFor="pie">Pie Chart</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="donut" id="donut" />
                <Label htmlFor="donut">Donut Chart</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataSource">Data Source</Label>
            <Select
              value={formState.dataSource}
              onValueChange={(value) => handleChange('dataSource', value)}
            >
              <SelectTrigger id="dataSource">
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="channelData">Traffic by Channel</SelectItem>
                <SelectItem value="conversionData">Conversion Funnel</SelectItem>
              </SelectContent>
            </Select>
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