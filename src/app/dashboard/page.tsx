import { DashboardService } from '@/services/dashboard-service';
import ClientPage from './client';

export default async function DashboardPage() {
  // Fetch data on the server
  const service = DashboardService.getInstance();
  
  // Fetch metrics
  const metrics = await service.getMetrics();
  
  // Fetch categories
  const categories = await service.getClientCategories();
  
  // Fetch trend
  const trend = await service.getClientActivityTrend();
  
  // Fetch campaign data - using default agency ID 3
  const agencyId = 3;
  const campaigns = await service.getCampaigns(agencyId);
  const performance = await service.getCampaignPerformance(agencyId, 30);
  const statusCounts = await service.getCampaignStatusCounts(agencyId);
  const platformPerformance = await service.getPlatformPerformance(agencyId);
  
  // Format the data for the client component
  const dashboardMetrics = {
    metrics: metrics.map((metric) => ({
      id: metric.id,
      name: metric.metric_name,
      value: metric.current_value,
      previousValue: metric.previous_value,
      changePercentage: metric.change_percentage,
      period: metric.period,
    })),
    categories,
    trend: trend.map(item => ({
      name: item.name,
      value: item.value
    }))
  };
  
  const campaignData = {
    campaigns,
    performance,
    statusCounts,
    platformPerformance
  };
  
  return <ClientPage 
    initialDashboardMetrics={dashboardMetrics} 
    initialCampaignData={campaignData} 
  />;
} 