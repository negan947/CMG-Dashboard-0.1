'use client';

import { ClientTrendsChart } from '@/components/ui/charts';
import { ChartCard } from '@/components/ui/charts/chart-card';
import { WidgetProps } from './types';
import { WidgetEditControls } from './WidgetEditControls';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function ClientTrendsWidget({ id, config, isEditing, onConfigChange, onRemove }: WidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Sample client trends data with more realistic values
  const clientTrendsData = [
    { name: 'Week 1', 'KLINT.RO': 14, 'Rustufuria': 12, 'Nike': 8, 'Amazon': 5 },
    { name: 'Week 2', 'KLINT.RO': 10, 'Rustufuria': 16, 'Nike': 30, 'Amazon': 12 },
    { name: 'Week 3', 'KLINT.RO': 38, 'Rustufuria': 20, 'Nike': 25, 'Amazon': 15 },
    { name: 'Week 4', 'KLINT.RO': 30, 'Rustufuria': 15, 'Nike': 40, 'Amazon': 22 },
    { name: 'Week 5', 'KLINT.RO': 42, 'Rustufuria': 22, 'Nike': 35, 'Amazon': 28 },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {isEditing && (
        <WidgetEditControls 
          onConfigure={() => onConfigChange?.(id)} 
          onRemove={onRemove || (() => {})} 
        />
      )}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className={cn(
          "text-lg font-semibold mb-2",
          isDark ? "text-zinc-100" : "text-gray-900"
        )}>
          {config.title || "Client Trends"}
        </h3>
        <div className="flex-1 w-full" style={{ minHeight: "160px" }}>
          <ClientTrendsChart data={clientTrendsData} />
        </div>
      </div>
    </div>
  );
} 