import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { UserWidget } from '@/components/dashboard/widgets/types';
import { v4 as uuidv4 } from 'uuid';

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

interface UserDashboardWidget {
  id: string;
  user_id: string;
  widget_type: string;
  widget_config: Record<string, any>;
  grid_position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  created_at: string;
  updated_at: string;
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

  /**
   * Get user's dashboard widgets
   */
  async getUserDashboardWidgets(userId: string): Promise<UserWidget[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_dashboard_widgets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching user dashboard widgets:', error);
        return [];
      }
      
      return (data || []).map((item: UserDashboardWidget) => ({
        id: item.id,
        type: item.widget_type,
        config: item.widget_config,
        gridPosition: item.grid_position
      }));
    } catch (err) {
      console.error('Unexpected error fetching user dashboard:', err);
      return [];
    }
  }

  /**
   * Save user's dashboard widgets
   */
  async saveUserDashboardWidgets(userId: string, widgets: UserWidget[]): Promise<boolean> {
    try {
      // First remove all existing widgets for this user
      const { error: deleteError } = await this.supabase
        .from('user_dashboard_widgets')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('Error deleting existing widgets:', deleteError);
        return false;
      }
      
      if (widgets.length === 0) {
        // If no widgets to save, we're done after deletion
        return true;
      }
      
      // Then insert new widgets
      const { error: insertError } = await this.supabase
        .from('user_dashboard_widgets')
        .insert(
          widgets.map(widget => ({
            id: widget.id || uuidv4(),
            user_id: userId,
            widget_type: widget.type,
            widget_config: widget.config,
            grid_position: widget.gridPosition
          }))
        );
      
      if (insertError) {
        console.error('Error saving widgets:', insertError);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error saving dashboard:', err);
      return false;
    }
  }

  /**
   * Get default widgets when user has none configured
   */
  getDefaultWidgets(): UserWidget[] {
    return [
      {
        id: uuidv4(),
        type: 'metricsCard',
        config: {
          title: 'Objectives',
          dataSource: 'objectives',
          suffix: '%',
          showDonut: true
        },
        gridPosition: { x: 0, y: 0, w: 1, h: 1 }
      },
      {
        id: uuidv4(),
        type: 'metricsCard',
        config: {
          title: 'Inquiry Success Rate',
          dataSource: 'inquiry_success_rate',
          suffix: '%',
          showDonut: true
        },
        gridPosition: { x: 1, y: 0, w: 1, h: 1 }
      },
      {
        id: uuidv4(),
        type: 'metricsCard',
        config: {
          title: 'New Leads',
          dataSource: 'new_leads',
          showDonut: false
        },
        gridPosition: { x: 2, y: 0, w: 1, h: 1 }
      },
      {
        id: uuidv4(),
        type: 'metricsCard',
        config: {
          title: 'Overdue Tasks',
          dataSource: 'overdue_tasks',
          showDonut: false
        },
        gridPosition: { x: 3, y: 0, w: 1, h: 1 }
      },
      {
        id: uuidv4(),
        type: 'clientTrends',
        config: {
          title: 'Client Activity Trends',
          timeRange: 'last30days'
        },
        gridPosition: { x: 0, y: 1, w: 2, h: 1 }
      },
      {
        id: uuidv4(),
        type: 'pieChart',
        config: {
          title: 'Lead Sources',
          chartType: 'donut'
        },
        gridPosition: { x: 2, y: 1, w: 2, h: 1 }
      },
      {
        id: uuidv4(),
        type: 'dataTable',
        config: {
          title: 'Recent Clients',
          dataSource: 'clients',
          rowsToDisplay: 5
        },
        gridPosition: { x: 0, y: 2, w: 2, h: 1 }
      },
      {
        id: uuidv4(),
        type: 'dataTable',
        config: {
          title: 'Upcoming Projects',
          dataSource: 'projects',
          rowsToDisplay: 5
        },
        gridPosition: { x: 2, y: 2, w: 2, h: 1 }
      }
    ];
  }

  /**
   * Get client data for data table widget
   */
  async getClientTableData(agencyId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('clients')
        .select('id, name, status, updated_at')
        .eq('agency_id', agencyId)
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching client table data:', error);
        return [];
      }
      
      return (data || []).map(client => ({
        id: client.id,
        name: client.name,
        status: client.status,
        lastActivity: this.formatRelativeTime(client.updated_at)
      }));
    } catch (err) {
      console.error('Unexpected error fetching client table data:', err);
      return [];
    }
  }

  /**
   * Get project data for data table widget
   */
  async getProjectTableData(agencyId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('id, name, status, due_date, client_id, clients(name)')
        .eq('agency_id', agencyId)
        .order('due_date', { ascending: true })
        .limit(10);
      
      if (error) {
        console.error('Error fetching project table data:', error);
        return [];
      }
      
      return (data || []).map(project => ({
        id: project.id,
        name: project.name,
        status: project.status,
        clientName: project.clients?.name || 'Unknown',
        dueDate: project.due_date ? new Date(project.due_date).toLocaleDateString() : 'N/A'
      }));
    } catch (err) {
      console.error('Unexpected error fetching project table data:', err);
      return [];
    }
  }

  /**
   * Get invoice data for data table widget
   */
  async getInvoiceTableData(agencyId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('invoices')
        .select('id, invoice_number, status, amount, due_date, client_id, clients(name)')
        .eq('agency_id', agencyId)
        .order('due_date', { ascending: true })
        .limit(10);
      
      if (error) {
        console.error('Error fetching invoice table data:', error);
        return [];
      }
      
      return (data || []).map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.clients?.name || 'Unknown',
        amount: `$${invoice.amount.toFixed(2)}`,
        status: invoice.status,
        dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'
      }));
    } catch (err) {
      console.error('Unexpected error fetching invoice table data:', err);
      return [];
    }
  }

  /**
   * Get task data for data table widget
   */
  async getTaskTableData(agencyId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('tasks')
        .select('id, title, status, due_date, assigned_to, users(full_name)')
        .eq('agency_id', agencyId)
        .order('due_date', { ascending: true })
        .limit(10);
      
      if (error) {
        console.error('Error fetching task table data:', error);
        return [];
      }
      
      return (data || []).map(task => ({
        id: task.id,
        title: task.title,
        assignedTo: task.users?.full_name || 'Unassigned',
        status: task.status,
        dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'
      }));
    } catch (err) {
      console.error('Unexpected error fetching task table data:', err);
      return [];
    }
  }

  /**
   * Format a timestamp into a relative time string (e.g., "2 days ago")
   */
  private formatRelativeTime(timestamp: string): string {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        if (diffMinutes === 0) {
          return 'Just now';
        }
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
} 