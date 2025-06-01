'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WidgetConfigProps } from '../types';

// Data source options
const DATA_SOURCES = [
  { id: 'clients', name: 'Clients' },
  { id: 'projects', name: 'Projects' },
  { id: 'invoices', name: 'Invoices' },
  { id: 'tasks', name: 'Tasks' }
];

export function DataTableConfig({ id, config, onChange, onClose }: WidgetConfigProps) {
  // Init local state with current config values
  const [title, setTitle] = useState(config.title || 'Data Table');
  const [dataSource, setDataSource] = useState(config.dataSource || 'clients');
  const [rowsToDisplay, setRowsToDisplay] = useState(config.rowsToDisplay || 5);
  
  // Save config changes
  const handleSave = () => {
    onChange({
      ...config,
      title,
      dataSource,
      rowsToDisplay: parseInt(rowsToDisplay.toString(), 10)
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure Data Table</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dataSource" className="text-right">
              Data Source
            </Label>
            <Select
              value={dataSource}
              onValueChange={setDataSource}
            >
              <SelectTrigger className="col-span-3">
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
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rowsToDisplay" className="text-right">
              Rows to Display
            </Label>
            <Select
              value={rowsToDisplay.toString()}
              onValueChange={(value) => setRowsToDisplay(parseInt(value, 10))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select rows to display" />
              </SelectTrigger>
              <SelectContent>
                {[3, 5, 7, 10].map((number) => (
                  <SelectItem key={number} value={number.toString()}>
                    {number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 