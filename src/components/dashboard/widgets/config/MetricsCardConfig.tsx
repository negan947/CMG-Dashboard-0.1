'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { WidgetConfigProps } from '../types';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';

// Predefined data sources
const DATA_SOURCES = [
  { id: 'objectives', name: 'Objectives' },
  { id: 'inquiry_success_rate', name: 'Inquiry Success Rate' },
  { id: 'new_leads', name: 'New Leads' },
  { id: 'overdue_tasks', name: 'Overdue Tasks' },
  { id: 'total_clients', name: 'Total Clients' },
  { id: 'support_requests', name: 'Support Requests' },
  { id: 'overdue_payments', name: 'Overdue Payments' },
  { id: 'team_productivity', name: 'Team Productivity' }
];

export function MetricsCardConfig({ id, config, onChange, onClose }: WidgetConfigProps) {
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
          <DialogTitle>Configure Metric Card</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={localConfig.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Metric Title"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="dataSource">Data Source</Label>
            <Select
              value={localConfig.dataSource || 'objectives'}
              onValueChange={(value) => handleChange('dataSource', value)}
            >
              <SelectTrigger id="dataSource">
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                {DATA_SOURCES.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="suffix">Value Suffix</Label>
            <Input
              id="suffix"
              value={localConfig.suffix || ''}
              onChange={(e) => handleChange('suffix', e.target.value)}
              placeholder="%"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="color">Color Theme</Label>
            <div className="flex gap-2">
              {CHART_COLORS.map((color, index) => (
                <button
                  key={index}
                  className={`w-8 h-8 rounded-full ${localConfig.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange('color', color)}
                  aria-label={`Color ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="showDonut"
              checked={localConfig.showDonut !== false}
              onCheckedChange={(checked) => handleChange('showDonut', checked)}
            />
            <Label htmlFor="showDonut">Show Donut Chart</Label>
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