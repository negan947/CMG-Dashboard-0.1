'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Tag, Clock, CheckCircle } from 'lucide-react';

type KpiData = {
  openTickets: number;
  avgResponseTime: string; // This will be formatted string like "3h 24m"
  resolvedThisWeek: number;
};

interface SupportKpiCardsProps {
  data: KpiData;
}

export function SupportKpiCards({ data }: SupportKpiCardsProps) {
  const kpiItems = [
    {
      title: 'Open Tickets',
      value: data.openTickets,
      icon: <Tag className="h-6 w-6 text-amber-500" />,
    },
    {
      title: 'Avg. First Response Time',
      value: data.avgResponseTime,
      icon: <Clock className="h-6 w-6 text-blue-500" />,
    },
    {
      title: 'Resolved This Week',
      value: data.resolvedThisWeek,
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {kpiItems.map((item) => (
        <GlassCard 
            key={item.title}
            headerContent={
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">{item.title}</h3>
                    {item.icon}
                </div>
            }
            contentClassName='p-4'
        >
            <div className="text-2xl font-bold">
              {item.value}
            </div>
        </GlassCard>
      ))}
    </div>
  );
} 