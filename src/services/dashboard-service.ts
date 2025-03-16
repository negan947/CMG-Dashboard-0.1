import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';

interface Metric {
  id: number;
  agency_id: number;
  metric_name: string;
  current_value: number;
  previous_value: number | null;
  change_percentage: number | null;
  period: string | null;
  created_at: string;
  updated_at: string;
}

interface ClientCategory {
  id: number;
  name: string;
  color: string | null;
  count: number;
}

interface ClientActivity {
  id: number;
  client_id: number;
  activity_date: string;
  activity_count: number;
  created_at: string;
}

interface TrendPoint {
  name: string;
  value: number;
}

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

interface CampaignStats {
  campaign_id: number;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
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

export class DashboardService {
  private supabase: SupabaseClient;
  private static instance: DashboardService;

  constructor() {
    // Initialize Supabase client
    this.supabase = createClientComponentClient();
  }

  // Singleton pattern to avoid multiple client instances
  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * Get dashboard metrics
   */
  async getMetrics(): Promise<Metric[]> {
    try {
      const { data, error } = await this.supabase
        .from('metrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching metrics:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching metrics:', err);
      return [];
    }
  }

  /**
   * Get client categories with counts
   */
  async getClientCategories(): Promise<ClientCategory[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_client_categories_with_count');

      if (error) {
        console.error('Error fetching client categories:', error);
        
        // Fallback to a more basic query if the RPC isn't available
        try {
          const { data: fallbackData, error: fallbackError } = await this.supabase
            .from('client_categories')
            .select(`
              id,
              name,
              color,
              client_category_mapping!inner(client_id)
            `)
            .order('name');
          
          if (fallbackError) {
            console.error('Fallback error:', fallbackError);
            return [];
          }
          
          // Transform the data to include counts
          return (fallbackData || []).map(category => ({
            id: category.id,
            name: category.name,
            color: category.color,
            count: Array.isArray(category.client_category_mapping) 
              ? category.client_category_mapping.length 
              : 0
          }));
        } catch (fallbackErr) {
          console.error('Fallback query error:', fallbackErr);
          return [];
        }
      }

      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
      return [];
    }
  }

  /**
   * Get client activity trend data
   */
  async getClientActivityTrend(): Promise<TrendPoint[]> {
    try {
      const { data, error } = await this.supabase
        .from('client_activity')
        .select('activity_date, activity_count')
        .order('activity_date', { ascending: true })
        .limit(30);

      if (error) {
        console.error('Error fetching client activity trend:', error);
        return [];
      }

      return (data || []).map(item => ({
        name: new Date(item.activity_date).toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric' 
        }),
        value: item.activity_count
      }));
    } catch (err) {
      console.error('Unexpected error fetching activity trend:', err);
      return [];
    }
  }

  /**
   * Get campaign performance data using the database function
   */
  async getCampaignPerformance(agencyId: number, days: number = 30): Promise<CampaignPerformance[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_campaign_performance', { 
          p_agency_id: agencyId,
          p_days: days 
        });

      if (error) {
        console.error('Error fetching campaign performance:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching campaign performance:', err);
      return [];
    }
  }

  /**
   * Get all campaigns for an agency
   */
  async getCampaigns(agencyId: number): Promise<Campaign[]> {
    try {
      const { data, error } = await this.supabase
        .from('campaigns')
        .select('*')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching campaigns:', err);
      return [];
    }
  }

  /**
   * Get campaign stats grouped by status
   */
  async getCampaignStatusCounts(agencyId: number): Promise<CampaignStatusCount[]> {
    try {
      const { data, error } = await this.supabase
        .from('campaigns')
        .select('status')
        .eq('agency_id', agencyId);

      if (error) {
        console.error('Error fetching campaign status counts:', error);
        return [];
      }

      // Group by status and count
      const statusCounts: Record<string, number> = {};
      data?.forEach(campaign => {
        statusCounts[campaign.status] = (statusCounts[campaign.status] || 0) + 1;
      });

      // Convert to array format
      return Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }));
    } catch (err) {
      console.error('Unexpected error fetching campaign status counts:', err);
      return [];
    }
  }

  /**
   * Get platform performance metrics (aggregated)
   */
  async getPlatformPerformance(agencyId: number): Promise<PlatformPerformance[]> {
    try {
      const { data, error } = await this.supabase
        .from('campaigns')
        .select('platform, impressions, clicks, conversions, spent')
        .eq('agency_id', agencyId);

      if (error) {
        console.error('Error fetching platform performance:', error);
        return [];
      }

      // Group by platform and aggregate metrics
      const platformMetrics: Record<string, PlatformPerformance> = {};
      
      data?.forEach(campaign => {
        if (!platformMetrics[campaign.platform]) {
          platformMetrics[campaign.platform] = {
            platform: campaign.platform,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            spend: 0
          };
        }
        
        platformMetrics[campaign.platform].impressions += campaign.impressions || 0;
        platformMetrics[campaign.platform].clicks += campaign.clicks || 0;
        platformMetrics[campaign.platform].conversions += campaign.conversions || 0;
        platformMetrics[campaign.platform].spend += campaign.spent || 0;
      });

      return Object.values(platformMetrics);
    } catch (err) {
      console.error('Unexpected error fetching platform performance:', err);
      return [];
    }
  }

  /**
   * Get campaign stats for the last n days for a specific campaign
   */
  async getCampaignDailyStats(campaignId: number, days: number = 7): Promise<CampaignStats[]> {
    try {
      const { data, error } = await this.supabase
        .from('campaign_stats')
        .select('*')
        .eq('campaign_id', campaignId)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching campaign daily stats:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching campaign daily stats:', err);
      return [];
    }
  }
} 