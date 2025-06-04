import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';
import { UserWidget } from '@/components/dashboard/widgets/types';

export interface ChannelData {
  name: string;
  value: number;
  color: string;
}

export interface ConversionData {
  name: string;
  value: number;
  color: string;
}

export interface PerformanceTrendData {
  name: string;
  Engagement: number;
  Conversion: number;
  Revenue: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private supabase: any;

  private constructor() {
    // Initialize Supabase client
    this.supabase = createClientComponentClient();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async getChannelData(): Promise<ChannelData[]> {
    // This would normally fetch from an API or database
    // For now using sample data
    return [
      { name: 'Organic', value: 35.2, color: '#3b82f6' },
      { name: 'Paid', value: 42.8, color: '#10b981' },
      { name: 'Social', value: 15.5, color: '#f59e0b' },
      { name: 'Referral', value: 6.5, color: '#8b5cf6' }
    ];
  }

  public async getConversionData(): Promise<ConversionData[]> {
    // This would normally fetch from an API or database
    return [
      { name: 'Converted', value: 28.4, color: '#3b82f6' },
      { name: 'In Progress', value: 42.6, color: '#10b981' },
      { name: 'Lost', value: 29.0, color: '#f59e0b' }
    ];
  }

  public async getPerformanceTrends(): Promise<PerformanceTrendData[]> {
    // This would normally fetch from an API or database
    return [
      { name: 'Week 1', 'Engagement': 42, 'Conversion': 18, 'Revenue': 5400 },
      { name: 'Week 2', 'Engagement': 38, 'Conversion': 24, 'Revenue': 7200 },
      { name: 'Week 3', 'Engagement': 56, 'Conversion': 28, 'Revenue': 9600 },
      { name: 'Week 4', 'Engagement': 64, 'Conversion': 32, 'Revenue': 12800 },
    ];
  }

  public async getMetrics(): Promise<any[]> {
    // This would normally fetch from an API or database
    return [
      { 
        id: 1, 
        metric_name: 'Conversion Rate', 
        current_value: 28.4, 
        previous_value: 25.2, 
        change_percentage: 3.2, 
        period: '%' 
      },
      { 
        id: 2, 
        metric_name: 'Avg. Revenue', 
        current_value: 1250, 
        previous_value: 1100, 
        change_percentage: 12.5, 
        period: '$' 
      },
      { 
        id: 3, 
        metric_name: 'Engagement', 
        current_value: 64, 
        previous_value: 55.3, 
        change_percentage: 8.7, 
        period: '%' 
      },
      { 
        id: 4, 
        metric_name: 'Goal Completion', 
        current_value: 72, 
        previous_value: 66.7, 
        change_percentage: 5.3, 
        period: '%' 
      }
    ];
  }

  /**
   * Get user's analytics widgets
   */
  async getUserAnalyticsWidgets(userId: string): Promise<UserWidget[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_analytics_widgets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching user analytics widgets:', error);
        return [];
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        type: item.widget_type,
        config: item.widget_config,
        gridPosition: item.grid_position
      }));
    } catch (err) {
      console.error('Unexpected error fetching user analytics widgets:', err);
      return [];
    }
  }

  /**
   * Save user's analytics widgets
   */
  async saveUserAnalyticsWidgets(userId: string, widgets: UserWidget[]): Promise<boolean> {
    try {
      // First remove all existing widgets for this user
      const { error: deleteError } = await this.supabase
        .from('user_analytics_widgets')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('Error deleting existing analytics widgets:', deleteError);
        return false;
      }
      
      if (widgets.length === 0) {
        // If no widgets to save, we're done after deletion
        return true;
      }
      
      // Then insert new widgets
      const { error: insertError } = await this.supabase
        .from('user_analytics_widgets')
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
        console.error('Error saving analytics widgets:', insertError);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error saving analytics dashboard:', err);
      return false;
    }
  }

  /**
   * Get default analytics widgets when user has none configured
   */
  getDefaultAnalyticsWidgets(): UserWidget[] {
    return [
      {
        id: uuidv4(),
        type: 'analyticsMetric',
        config: {
          title: 'Conversion Rate',
          metricName: 'Conversion Rate',
          suffix: '%',
          showDonut: true
        },
        gridPosition: { x: 0, y: 0, w: 1, h: 1 }
      },
      {
        id: uuidv4(),
        type: 'analyticsMetric',
        config: {
          title: 'Average Revenue',
          metricName: 'Avg. Revenue',
          prefix: '$',
          showDonut: false
        },
        gridPosition: { x: 1, y: 0, w: 1, h: 1 }
      },
      {
        id: uuidv4(),
        type: 'analyticsMetric',
        config: {
          title: 'Engagement',
          metricName: 'Engagement',
          suffix: '%',
          showDonut: true
        },
        gridPosition: { x: 2, y: 0, w: 1, h: 1 }
      },
      {
        id: uuidv4(),
        type: 'analyticsMetric',
        config: {
          title: 'Goal Completion',
          metricName: 'Goal Completion',
          suffix: '%',
          showDonut: true
        },
        gridPosition: { x: 3, y: 0, w: 1, h: 1 }
      },
      {
        id: uuidv4(),
        type: 'analyticsChart',
        config: {
          title: 'Traffic by Channel',
          chartType: 'donut',
          dataSource: 'channelData'
        },
        gridPosition: { x: 0, y: 1, w: 2, h: 1 }
      },
      {
        id: uuidv4(),
        type: 'analyticsChart',
        config: {
          title: 'Conversion Funnel',
          chartType: 'donut',
          dataSource: 'conversionData'
        },
        gridPosition: { x: 2, y: 1, w: 2, h: 1 }
      },
      {
        id: uuidv4(),
        type: 'performanceTrends',
        config: {
          title: 'Performance Trends',
          timeRange: 'month'
        },
        gridPosition: { x: 0, y: 2, w: 4, h: 1 }
      }
    ];
  }
} 