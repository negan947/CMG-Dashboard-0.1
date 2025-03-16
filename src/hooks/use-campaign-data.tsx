import { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboard-service';
import { useAuth } from './use-auth';

interface Campaign {
  id: number;
  agency_id: number;
  name: string;
  status: string;
  platform: string;
  start_date: string;
  end_date: string | null;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roi: number;
  created_at: string;
  updated_at: string;
}

interface CampaignPerformance {
  campaign_name: string;
  platform: string;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_spend: number;
  avg_ctr: number;
  avg_conversion_rate: number;
  avg_cpa: number;
}

interface CampaignStatusCount {
  status: string;
  count: number;
}

interface PlatformPerformance {
  platform: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

// Default fallback data for development or when database is unavailable
const fallbackStatusData = [
  { status: 'active', count: 3 },
  { status: 'completed', count: 1 },
  { status: 'planned', count: 1 },
];

const fallbackPlatformData = [
  { platform: 'Facebook', impressions: 85000, clicks: 3200, conversions: 128, spend: 2500 },
  { platform: 'Google Ads', impressions: 135000, clicks: 6600, conversions: 283, spend: 4050 },
  { platform: 'Instagram', impressions: 200000, clicks: 4300, conversions: 95, spend: 3000 },
  { platform: 'Mixed', impressions: 0, clicks: 0, conversions: 0, spend: 0 },
];

export function useCampaignData(agencyId?: number) {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [performance, setPerformance] = useState<CampaignPerformance[]>([]);
  const [statusCounts, setStatusCounts] = useState<CampaignStatusCount[]>(fallbackStatusData);
  const [platformPerformance, setPlatformPerformance] = useState<PlatformPerformance[]>(fallbackPlatformData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const service = DashboardService.getInstance();
        
        // Use agencyId from props or default to 3 (as in our sample data)
        const currentAgencyId = agencyId || 3;

        // Fetch campaigns
        const campaignsData = await service.getCampaigns(currentAgencyId);
        if (campaignsData.length > 0 && isMounted) {
          setCampaigns(campaignsData);
        }

        // Fetch campaign performance
        const performanceData = await service.getCampaignPerformance(currentAgencyId, 30);
        if (performanceData.length > 0 && isMounted) {
          setPerformance(performanceData);
        }

        // Fetch campaign status counts
        const statusData = await service.getCampaignStatusCounts(currentAgencyId);
        if (statusData.length > 0 && isMounted) {
          setStatusCounts(statusData);
        }

        // Fetch platform performance
        const platformData = await service.getPlatformPerformance(currentAgencyId);
        if (platformData.length > 0 && isMounted) {
          setPlatformPerformance(platformData);
        }

      } catch (err) {
        console.error('Error fetching campaign data:', err);
        if (isMounted) {
          setError('Failed to load campaign data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [user, agencyId]);

  return {
    campaigns,
    performance,
    statusCounts,
    platformPerformance,
    isLoading,
    error,
  };
} 