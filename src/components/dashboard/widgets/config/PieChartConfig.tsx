'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WidgetConfigProps } from '../types';

const DATA_SOURCES = [
  { id: 'leadSources', name: 'Lead Sources' },
  { id: 'clientCategories', name: 'Client Categories' },
  { id: 'conversions', name: 'Conversion Methods' },
];

export function PieChartConfig({ id, config, onChange, onClose }: WidgetConfigProps) {
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
          <DialogTitle>Configure Distribution Chart</DialogTitle>
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
            <Label htmlFor="chartType">Chart Type</Label>
            <Select
              value={localConfig.chartType || 'pie'}
              onValueChange={(value) => handleChange('chartType', value)}
            >
              <SelectTrigger id="chartType">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="donut">Donut Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="dataSource">Data Source</Label>
            <Select
              value={localConfig.dataSource || 'leadSources'}
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
            <Label htmlFor="showLegend">Legend</Label>
            <Select
              value={localConfig.showLegend === false ? 'false' : 'true'}
              onValueChange={(value) => handleChange('showLegend', value === 'true')}
            >
              <SelectTrigger id="showLegend">
                <SelectValue placeholder="Show legend?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Show Legend</SelectItem>
                <SelectItem value="false">Hide Legend</SelectItem>
              </SelectContent>
            </Select>
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