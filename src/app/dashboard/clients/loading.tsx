import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';

export default function ClientsLoading() {
  return (
    <div className="space-y-3 md:space-y-5 relative z-10 py-2">
      <GlassCard contentClassName="p-3 md:p-5">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <User className="h-7 w-7 text-blue-400" />
              <Skeleton className="h-9 w-48" />
            </div>
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          
          <div className="flex flex-col xs:flex-row gap-2">
            <Skeleton className="h-10 w-full xs:w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </div>
      </GlassCard>
      
      {/* Client Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
        <GlassCard className="md:col-span-3 xl:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </GlassCard>
        
        <GlassCard className="xl:col-span-2 hidden xl:block">
          <div className="p-3 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            
            <Skeleton className="h-[180px] rounded-xl" />
          </div>
        </GlassCard>
      </div>
      
      {/* Clients List */}
      <GlassCard>
        <div className="p-3 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
} 