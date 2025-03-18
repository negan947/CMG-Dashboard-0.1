import React from "react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { ChartCard } from "./chart-card";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface PieChartProps {
  title: string;
  description?: string;
  subtitle?: string;
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  innerRadius?: number;
  outerRadius?: string | number;
}

// More contrasting professional color palette
const COLORS = [
  "#475569", // Slate 700
  "#64748b", // Slate 600
  "#94a3b8", // Slate 400
  "#334155", // Slate 800
  "#0f172a", // Slate 950 
];

export function PieChart({
  title,
  description,
  subtitle,
  data,
  className,
  showLegend = true,
  innerRadius = 50,
  outerRadius = "80%",
}: PieChartProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";

  // Process data to ensure unique values for the chart
  const processedData = React.useMemo(() => {
    const uniqueData = Array.from(
      new Map(data.map(item => [item.name, item])).values()
    );
    
    return uniqueData.map((item, index) => ({
      ...item,
      color: item.color || COLORS[index % COLORS.length],
    }));
  }, [data]);

  // Custom legend render - simple and clean
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-3 px-3 py-3">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className={cn(
              "text-xs font-medium",
              isDark ? "text-zinc-300" : "text-gray-600"
            )}>
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ChartCard title={title} description={description} subtitle={subtitle} className={className}>
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={processedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              strokeWidth={1}
              stroke={isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.5)"}
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {processedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{
                    filter: isDark 
                      ? "brightness(1.15)" 
                      : "brightness(0.95)",
                  }}
                />
              ))}
            </Pie>
            {showLegend && (
              <Legend 
                content={renderLegend}
                verticalAlign="bottom"
                align="center"
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}