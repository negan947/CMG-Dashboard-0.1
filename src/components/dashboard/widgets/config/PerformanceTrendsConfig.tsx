'use client';

import { useState } from 'react';
import { WidgetConfigProps } from '../types';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function PerformanceTrendsConfig({ id, config, onChange, onClose }: WidgetConfigProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Local state for form
  const [formState, setFormState] = useState({
    title: config.title || 'Performance Trends',
    timeRange: config.timeRange || 'month'
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
          <DialogTitle>Configure Performance Trends</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="title">Chart Title</Label>
            <Input
              id="title"
              value={formState.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Performance Trends"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeRange">Time Range</Label>
            <Select
              value={formState.timeRange}
              onValueChange={(value) => handleChange('timeRange', value)}
            >
              <SelectTrigger id="timeRange">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
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