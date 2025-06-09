'use client';

import { PlusCircle, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { SupportKpiCards } from '@/components/dashboard/support/SupportKpiCards';
import { RecentTicketsTable } from '@/components/dashboard/support/RecentTicketsTable';
import { KnowledgeBaseSearch } from '@/components/dashboard/support/KnowledgeBaseSearch';
import { SupportResources } from '@/components/dashboard/support/SupportResources';
// import { SupportService } from '@/services/support-service';

export default function SupportPage() {
  const { theme } = useTheme();
  const isDark = theme !== 'light';

  // Mock data for now
  const tickets = [
    { id: 1, title: 'Problem with Google Ads', client: { name: 'Client A' }, status: 'in_progress', assignee: { fullName: 'John Doe' }, updatedAt: new Date().toISOString() },
    { id: 2, title: 'Question about billing', client: { name: 'Client B' }, status: 'open', assignee: { fullName: 'Unassigned' }, updatedAt: new Date().toISOString() },
    { id: 3, title: 'API rate limit question', client: { name: 'Client C' }, status: 'closed', assignee: { fullName: 'Jane Smith' }, updatedAt: new Date().toISOString() },
  ];
  const kpiData = {
    openTickets: 7,
    avgResponseTime: '3h 24m',
    resolvedThisWeek: 15,
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <GlassCard
        headerContent={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LifeBuoy className={cn("h-8 w-8", isDark ? "text-green-400" : "text-green-600")} />
              <div>
                <h1 className={cn("text-2xl font-bold md:text-3xl", isDark ? "text-zinc-100" : "text-gray-800")}>
                  Support
                </h1>
                <p className={cn("text-md", isDark ? "text-zinc-300" : "text-gray-600")}>
                  Get help, track tickets, and access resources
                </p>
              </div>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Support Ticket
            </Button>
          </div>
        }
        contentClassName="p-0"
      />

      {tickets.length === 0 ? (
        <GlassCard contentClassName="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-2xl font-bold">No open tickets</div>
              <p className="text-muted-foreground mt-2">
                Raise your first support request to get started.
              </p>
              <Button className="mt-6">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create a Ticket
              </Button>
            </div>
        </GlassCard>
      ) : (
        <div className="space-y-8">
          <SupportKpiCards data={kpiData} />
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <GlassCard className="lg:col-span-2" title="Recent Tickets" contentClassName='p-0'>
              <RecentTicketsTable tickets={tickets} />
            </GlassCard>
            <GlassCard title="Ticket Status">
              {/* Ticket Status Chart will go here */}
            </GlassCard>
          </div>

          <GlassCard title="Knowledge Base" contentClassName="p-0">
            <KnowledgeBaseSearch />
          </GlassCard>
          
          <GlassCard title="Support Resources" contentClassName="p-0">
            <SupportResources />
          </GlassCard>
        </div>
      )}
    </div>
  );
} 