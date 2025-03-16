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
} 