import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartCard } from "./chart-card";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "./pie-chart";

interface ClientTrend {
  name: string;
  [clientName: string]: number | string;
}

interface ClientTrendsChartProps {
  title: string;
  subtitle?: string;
  description?: string;
  data: ClientTrend[];
  className?: string;
}

export function ClientTrendsChart({
  title,
  subtitle,
  description,
  data,
  className,
}: ClientTrendsChartProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  // Extract client names from the first data point (excluding "name" property)
  const clientNames = React.useMemo(() => {
    if (!data.length) return [];
    const firstPoint = data[0];
    return Object.keys(firstPoint).filter(key => key !== "name");
  }, [data]);
  
  // Custom legend renderer for better control over appearance
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 px-3 pb-3 pt-1">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-1.5 shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className={cn(
              "text-xs font-medium truncate max-w-[90px]",
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
    <ChartCard title={title} subtitle={subtitle} description={description} className={className}>
      <div className="flex flex-col h-full pb-4">
        {/* Increased minimum height with min-h-[350px] to make the chart taller */}
        <div className="flex-1 min-h-[350px] pt-2 pb-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true}
                vertical={false}
                stroke={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} 
              />
              
              <XAxis
                dataKey="name"
                stroke={isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
                tickMargin={5}
              />
              
              <YAxis
                stroke={isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={30}
                tickMargin={5}
              />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "rgba(30, 35, 60, 0.85)" : "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(8px)",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  padding: "8px 12px",
                }}
                itemStyle={{ color: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.75)" }}
                labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
              />
              
              {clientNames.map((clientName, index) => (
                <Line
                  key={clientName}
                  type="monotone"
                  dataKey={clientName}
                  name={clientName}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fill: isDark ? "#1e1e2d" : "#ffffff",
                    stroke: CHART_COLORS[index % CHART_COLORS.length],
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: isDark ? "rgba(255, 255, 255, 0.8)" : "#ffffff",
                    strokeWidth: 2,
                    fill: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                  isAnimationActive={true}
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                />
              ))}
              
              {/* External legend positioned at the bottom with proper spacing */}
              <Legend 
                content={renderLegend}
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  position: 'relative',
                  paddingTop: 20,
                  width: '100%'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  );
} 