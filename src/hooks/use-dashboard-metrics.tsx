import { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboard-service';

interface DashboardMetric {
  id: number;
  name: string;
  value: number;
  previousValue: number | null;
  changePercentage: number | null;
  period: string | null;
}

interface ClientCategory {
  id: number;
  name: string;
  color: string | null;
  count: number;
}

interface TrendPoint {
  name: string;
  value: number;
}

// Fallback data for development/when database queries fail
const fallbackData = {
  metrics: [
    {
      id: 1,
      name: 'Objectives',
      value: 78,
      previousValue: 72,
      changePercentage: 8.33,
      period: 'last week',
    },
    {
      id: 2,
      name: 'New Leads',
      value: 24,
      previousValue: 18,
      changePercentage: 33.33,
      period: 'last week',
    },
    {
      id: 3,
      name: 'Inquiry Success Rate',
      value: 65,
      previousValue: 58,
      changePercentage: 12.07,
      period: 'last week',
    },
    {
      id: 4,
      name: 'Overview',
      value: 92,
      previousValue: 85,
      changePercentage: 8.24,
      period: 'last week',
    },
  ],
  categories: [
    { id: 1, name: 'E-commerce', color: '#4f46e5', count: 12 },
    { id: 2, name: 'SaaS', color: '#0ea5e9', count: 8 },
    { id: 3, name: 'Healthcare', color: '#10b981', count: 5 },
    { id: 4, name: 'Finance', color: '#f59e0b', count: 7 },
    { id: 5, name: 'Education', color: '#ef4444', count: 4 },
  ],
  trend: Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return {
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(Math.random() * 30) + 20,
    };
  }),
};

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>(fallbackData.metrics);
  const [categories, setCategories] = useState<ClientCategory[]>(fallbackData.categories);
  const [trend, setTrend] = useState<TrendPoint[]>(fallbackData.trend);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      try {
        setIsLoading(true);
        const service = DashboardService.getInstance();

        // Fetch metrics
        const metricsData = await service.getMetrics();
        if (metricsData.length > 0 && isMounted) {
          setMetrics(
            metricsData.map((metric) => ({
              id: metric.id,
              name: metric.metric_name,
              value: metric.current_value,
              previousValue: metric.previous_value,
              changePercentage: metric.change_percentage,
              period: metric.period,
            }))
          );
        }

        // Fetch categories
        const categoriesData = await service.getClientCategories();
        if (categoriesData.length > 0 && isMounted) {
          setCategories(categoriesData);
        }

        // Fetch trend
        const trendData = await service.getClientActivityTrend();
        if (trendData.length > 0 && isMounted) {
          setTrend(trendData);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (isMounted) {
          setError('Failed to load dashboard data');
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
  }, []);

  return {
    metrics,
    categories,
    trend,
    isLoading,
    error,
  };
} 