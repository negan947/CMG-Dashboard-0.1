'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WidgetConfigProps } from '../types';

const TIME_RANGES = [
  { id: 'last7days', name: 'Last 7 Days' },
  { id: 'last30days', name: 'Last 30 Days' },
  { id: 'last90days', name: 'Last 90 Days' },
  { id: 'thisMonth', name: 'This Month' },
  { id: 'lastMonth', name: 'Last Month' },
  { id: 'thisQuarter', name: 'This Quarter' },
  { id: 'lastQuarter', name: 'Last Quarter' }
];

export function ClientTrendsConfig({ id, config, onChange, onClose }: WidgetConfigProps) {
  const [localConfig, setLocalConfig] = useState<Record<string, any>>({ ...config });

  const handleChange = (key: string, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onChange(localConfig);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure Client Trends Chart</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={localConfig.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Chart Title"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="timeRange">Time Range</Label>
            <Select
              value={localConfig.timeRange || 'last30days'}
              onValueChange={(value) => handleChange('timeRange', value)}
            >
              <SelectTrigger id="timeRange">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((range) => (
                  <SelectItem key={range.id} value={range.id}>
                    {range.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label>Clients to Display</Label>
            <p className="text-sm text-muted-foreground">
              Currently using sample data. In a full implementation, this would allow selecting specific clients.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 