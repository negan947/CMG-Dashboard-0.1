import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartCard } from "./chart-card";
import { useTheme } from "next-themes";

interface DataPoint {
  name: string;
  [key: string]: any;
}

interface BarDataSeries {
  name: string;
  key: string;
  color?: string;
  radius?: number | [number, number, number, number];
  barSize?: number;
  stackId?: string;
}

interface BarChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  series: BarDataSeries[];
  className?: string;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  layout?: "vertical" | "horizontal";
  yAxisWidth?: number;
}

// Beautiful color palette for charts
const COLORS = [
  "hsl(210, 100%, 65%)", // Bright blue
  "hsl(280, 90%, 70%)",  // Purple
  "hsl(150, 80%, 55%)",  // Green
  "hsl(35, 100%, 65%)",  // Amber
  "hsl(240, 80%, 70%)",  // Indigo
  "hsl(0, 90%, 70%)",    // Red
];

export function BarChart({
  title,
  description,
  data,
  series,
  className,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  showTooltip = true,
  layout = "horizontal",
  yAxisWidth = 50,
}: BarChartProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  // Assign colors to series if not provided
  const formattedSeries = series.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length],
    radius: item.radius || [8, 8, 0, 0] as [number, number, number, number],
    barSize: item.barSize || 24,
  }));

  return (
    <ChartCard title={title} description={description} className={className}>
      <div className="min-w-[280px] h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            layout={layout}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            barGap={12}
            barCategoryGap={20}
            className="[&_.recharts-bar]:hover:opacity-80 [&_.recharts-bar]:transition-opacity [&_.recharts-bar]:duration-300"
          >
            {/* Define gradients */}
            <defs>
              <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              
              {formattedSeries.map((s, index) => (
                <linearGradient key={`gradient-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)"}
                strokeOpacity={0.5}
              />
            )}
            
            {showXAxis && (
              <XAxis
                dataKey="name"
                type={layout === "horizontal" ? "category" : "number"}
                stroke={isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.65)"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
                angle={layout === "horizontal" ? -10 : 0}
                textAnchor={layout === "horizontal" ? "end" : "middle"}
                height={50}
                tickMargin={10}
                {...(layout === "vertical" && { type: "number", domain: [0, "auto"] })}
              />
            )}
            
            {showYAxis && (
              <YAxis
                stroke={isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.65)"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={yAxisWidth}
                tickMargin={10}
                {...(layout === "vertical" && { type: "category", dataKey: "name", width: 80 })}
                {...(layout === "horizontal" && { type: "number", domain: [0, "auto"] })}
              />
            )}
            
            {showTooltip && (
              <Tooltip
                cursor={{ fill: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}
                contentStyle={{
                  backgroundColor: isDark ? "rgba(30, 35, 60, 0.85)" : "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(10px)",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
                  borderRadius: "0.75rem",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
                  padding: "10px 14px",
                  color: isDark ? "white" : "rgba(0, 0, 0, 0.8)",
                }}
                itemStyle={{ color: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.75)" }}
                labelStyle={{ 
                  fontWeight: "bold", 
                  marginBottom: "6px", 
                  color: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)" 
                }}
                animationDuration={200}
                animationEasing="ease-out"
              />
            )}
            
            {showLegend && (
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ 
                  paddingBottom: "20px",
                  fontWeight: 500,
                  color: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.75)"
                }}
              />
            )}
            
            {formattedSeries.map((s, index) => (
              <Bar
                key={`bar-${index}`}
                dataKey={s.key}
                name={s.name}
                fill={`url(#barGradient-${index})`}
                radius={s.radius}
                barSize={s.barSize}
                stackId={s.stackId}
                filter="brightness(1.2)"
                animationDuration={1500}
                animationEasing="ease-out"
                {...(layout === "vertical" && { dataKey: s.key })}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}