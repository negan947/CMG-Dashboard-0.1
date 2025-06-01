import { MetricsCardWidget } from './MetricsCardWidget';
import { ClientTrendsWidget } from './ClientTrendsWidget';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';
import { MetricsCardConfig } from './config/MetricsCardConfig';
import { ClientTrendsConfig } from './config/ClientTrendsConfig';
import { PieChartWidget } from './PieChartWidget';
import { PieChartConfig } from './config/PieChartConfig';
import { DataTableWidget } from './DataTableWidget';
import { DataTableConfig } from './config/DataTableConfig';

export enum WidgetSize {
  SMALL = "small", // 1x1
  MEDIUM = "medium", // 2x1
  LARGE = "large", // 2x2
  WIDE = "wide", // 4x1
}

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  defaultSize: { w: number, h: number };
  defaultConfig: Record<string, any>;
  configComponent?: React.ComponentType<any>; // Optional config UI
}

// Register all available widgets
export const availableWidgets: Record<string, WidgetDefinition> = {
  metricsCard: {
    id: "metricsCard",
    name: "Metrics Card",
    description: "Display key metric with change indicator",
    component: MetricsCardWidget,
    defaultSize: { w: 1, h: 1 },
    defaultConfig: {
      title: "Metric",
      dataSource: "objectives", // References a predefined data source
      suffix: "%",
      showDonut: true,
      color: CHART_COLORS[0]
    },
    configComponent: MetricsCardConfig
  },
  clientTrends: {
    id: "clientTrends",
    name: "Client Trends Chart",
    description: "Display client activity trends over time",
    component: ClientTrendsWidget,
    defaultSize: { w: 2, h: 1 },
    defaultConfig: {
      title: "Client Trends",
      timeRange: "last30days",
    },
    configComponent: ClientTrendsConfig
  },
  pieChart: {
    id: "pieChart",
    name: "Distribution Chart",
    description: "Display data as a pie or donut chart",
    component: PieChartWidget,
    defaultSize: { w: 1, h: 1 },
    defaultConfig: {
      title: "Distribution",
      chartType: "pie", // 'pie' or 'donut'
    },
    configComponent: PieChartConfig
  },
  dataTable: {
    id: "dataTable",
    name: "Data Table",
    description: "Display data in a tabular format",
    component: DataTableWidget,
    defaultSize: { w: 2, h: 1 },
    defaultConfig: {
      title: "Data Table",
      dataSource: "clients",
      rowsToDisplay: 5
    },
    configComponent: DataTableConfig
  }
}; 