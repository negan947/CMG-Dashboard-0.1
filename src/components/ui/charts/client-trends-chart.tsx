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
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "./pie-chart";

// Make this interface more flexible to accept various data shapes
interface ClientTrend {
  name: string;
  [key: string]: string | number | undefined;
}

interface ClientTrendsChartProps {
  data: ClientTrend[];
  className?: string;
}

export function ClientTrendsChart({
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
      <ul className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 px-2 text-[10px]">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center">
            <div 
              className="w-2 h-2 rounded-full mr-1 shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className={cn(
              "text-[10px] font-medium truncate max-w-[60px]",
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
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
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
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={5}
            tickMargin={5}
          />
          
          <YAxis
            stroke={isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            width={25}
            tickMargin={5}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "rgba(30, 35, 60, 0.85)" : "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(8px)",
              borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              padding: "6px 8px",
              fontSize: "11px"
            }}
            itemStyle={{ color: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.75)" }}
            labelStyle={{ fontWeight: "bold", marginBottom: "2px", fontSize: "11px" }}
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
                r: 3,
                fill: isDark ? "#1e1e2d" : "#ffffff",
                stroke: CHART_COLORS[index % CHART_COLORS.length],
                strokeWidth: 1.5,
              }}
              activeDot={{
                r: 4,
                stroke: isDark ? "rgba(255, 255, 255, 0.8)" : "#ffffff",
                strokeWidth: 1.5,
                fill: CHART_COLORS[index % CHART_COLORS.length],
              }}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          ))}
          
          <Legend 
            content={renderLegend}
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              position: 'absolute',
              bottom: '-5px',
              width: '100%',
              fontSize: '10px'
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 