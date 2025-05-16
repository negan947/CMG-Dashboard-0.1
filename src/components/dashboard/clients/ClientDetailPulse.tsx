import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { ClientPulseCard } from './ClientPulseCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientDetailPulseProps {
  clientId: number;
}

export function ClientDetailPulse({ clientId }: ClientDetailPulseProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [agencyId, setAgencyId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch agency ID and user ID on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClientComponentClient();
        
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error fetching user:', userError);
          setIsLoading(false);
          return;
        }
        
        // Get the user's profile to find their agency_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setIsLoading(false);
          return;
        }
        
        // Get the first project for this client (if there is one)
        if (clientId) {
          const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id')
            .eq('client_id', clientId)
            .limit(1);
            
          if (!projectsError && projects && projects.length > 0) {
            setProjectId(projects[0].id);
          }
        }
        
        // Set the user ID and agency ID
        setUserId(user.id);
        setAgencyId(profile?.agency_id || null);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [clientId]);
  
  if (isLoading) {
    return <PulseSkeleton />;
  }
  
  if (!userId || !agencyId) {
    return (
      <div className="p-4 text-muted-foreground text-sm border rounded-md">
        Unable to load client pulse data. Please ensure you're logged in and associated with an agency.
      </div>
    );
  }
  
  return (
    <ClientPulseCard
      clientId={clientId}
      agencyId={agencyId}
      userId={userId}
      projectId={projectId || undefined}
      className="my-4"
    />
  );
}

function PulseSkeleton() {
  return (
    <div className="my-4 border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Skeleton className="h-6 w-6 mr-2" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      
      <div className="space-y-4 pt-2">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex space-x-2 pt-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  );
} 