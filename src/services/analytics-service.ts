import { supabase } from '@/lib/supabase';

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

  private constructor() {}

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
} 