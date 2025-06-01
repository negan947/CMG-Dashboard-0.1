import ClientPage from './client';
import { AnalyticsService } from '@/services/analytics-service';

export default async function AnalyticsPage() {
  // Fetch data on the server
  const service = AnalyticsService.getInstance();
  
  // Fetch analytics data
  const metrics = await service.getMetrics();
  const channelData = await service.getChannelData();
  const conversionData = await service.getConversionData();
  const performanceTrends = await service.getPerformanceTrends();
  
  // Format the data for the client component
  const analyticsData = {
    metrics: metrics.map((metric) => ({
      id: metric.id,
      name: metric.metric_name,
      value: metric.current_value,
      previousValue: metric.previous_value,
      changePercentage: metric.change_percentage,
      period: metric.period,
    })),
    channelData,
    conversionData,
    performanceTrends
  };
  
  return <ClientPage initialAnalyticsData={analyticsData} />;
} 