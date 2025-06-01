'use client';

import { PieChart } from '@/components/ui/charts';
import { CHART_COLORS } from '@/components/ui/charts/pie-chart';
import { WidgetProps } from './types';
import { WidgetEditControls } from './WidgetEditControls';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function PieChartWidget({ id, config, isEditing, onConfigChange, onRemove }: WidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Sample data sets for different chart types
  const dataSets = {
    leadSources: [
      { name: 'Google', value: 42.5, color: CHART_COLORS[0] },
      { name: 'Meta', value: 24.3, color: CHART_COLORS[1] },
      { name: 'TikTok', value: 18.7, color: CHART_COLORS[2] },
      { name: 'Direct', value: 14.5, color: CHART_COLORS[3] }
    ],
    clientCategories: [
      { name: 'Fashion', value: 28.4, color: CHART_COLORS[0] },
      { name: 'Electronics', value: 19.1, color: CHART_COLORS[1] },
      { name: 'Healthcare', value: 27.5, color: CHART_COLORS[2] },
      { name: 'Retail', value: 25, color: CHART_COLORS[3] }
    ],
    conversions: [
      { name: 'Email', value: 35.2, color: CHART_COLORS[0] },
      { name: 'Phone', value: 28.3, color: CHART_COLORS[1] },
      { name: 'Chat', value: 24.7, color: CHART_COLORS[2] },
      { name: 'Other', value: 11.8, color: CHART_COLORS[3] }
    ]
  };

  // Determine which data set to use based on the widget config
  const dataSource = config.dataSource || 'leadSources';
  const chartData = dataSets[dataSource as keyof typeof dataSets] || dataSets.leadSources;

  return (
    <div className="w-full h-full flex flex-col">
      {isEditing && (
        <WidgetEditControls 
          onConfigure={() => onConfigChange?.(id)} 
          onRemove={onRemove || (() => {})} 
        />
      )}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className={cn(
          "text-lg font-semibold mb-2",
          isDark ? "text-zinc-100" : "text-gray-900"
        )}>
          {config.title || "Distribution"}
        </h3>
        <div className="flex-1 flex items-center justify-center" style={{ minHeight: "160px" }}>
          <div className="w-full max-w-[200px] mx-auto">
            <PieChart 
              data={chartData} 
              innerRadius={config.chartType === 'donut' ? 40 : 0}
              outerRadius="90%"
              showLegend={config.showLegend !== false}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 