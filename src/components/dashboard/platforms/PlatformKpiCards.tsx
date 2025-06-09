'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Wifi, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type KpiData = {
  totalPlatforms: number;
  activeSyncsToday: number;
  lastSuccessfulSync: string;
  syncErrorsToday: number;
};

interface PlatformKpiCardsProps {
  data: KpiData;
}

export function PlatformKpiCards({ data }: PlatformKpiCardsProps) {
  const kpiItems = [
    {
      title: 'Total Platforms Connected',
      value: data.totalPlatforms,
      icon: <Wifi className="h-6 w-6 text-blue-500" />,
    },
    {
      title: 'Active Syncs Today',
      value: data.activeSyncsToday,
      icon: <Zap className="h-6 w-6 text-green-500" />,
    },
    {
      title: 'Last Successful Sync',
      value: data.lastSuccessfulSync ? `${formatDistanceToNow(new Date(data.lastSuccessfulSync))} ago` : 'N/A',
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    },
    {
      title: 'Sync Errors Today',
      value: data.syncErrorsToday,
      icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
      isError: data.syncErrorsToday > 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiItems.map((item) => (
        <GlassCard 
            key={item.title}
            title={item.title}
            headerContent={
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">{item.title}</h3>
                    {item.icon}
                </div>
            }
            contentClassName='p-4'
        >
            <div className={`text-2xl font-bold ${item.isError ? 'text-red-500' : ''}`}>
              {item.value}
            </div>
        </GlassCard>
      ))}
    </div>
  );
} 