import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartCard } from "./chart-card";

interface DataPoint {
  name: string;
  [key: string]: any;
}

interface LineDataSeries {
  name: string;
  key: string;
  color?: string;
  strokeWidth?: number;
  type?: "monotone" | "basis" | "linear" | "step";
}

interface LineChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  series: LineDataSeries[];
  className?: string;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showAreaGradient?: boolean;
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

export function LineChart({
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
  showAreaGradient = true,
  yAxisWidth = 40,
}: LineChartProps) {
  // Assign colors to series if not provided
  const formattedSeries = series.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length],
    strokeWidth: item.strokeWidth || 3,
    type: item.type || "monotone",
  }));

  return (
    <ChartCard title={title} description={description} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          className="[&_.recharts-default-tooltip]:!transition-opacity [&_.recharts-default-tooltip]:!duration-300"
        >
          {/* Define filters and gradients */}
          <defs>
            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {formattedSeries.map((s, index) => (
              <React.Fragment key={`defs-${index}`}>
                <linearGradient id={`lineGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id={`gradientStroke-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="1" />
                </linearGradient>
              </React.Fragment>
            ))}
          </defs>
          
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(255, 255, 255, 0.15)" 
              strokeOpacity={0.5}
            />
          )}
          
          {showXAxis && (
            <XAxis
              dataKey="name"
              stroke="rgba(255, 255, 255, 0.7)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
              tickMargin={10}
            />
          )}
          
          {showYAxis && (
            <YAxis
              stroke="rgba(255, 255, 255, 0.7)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={yAxisWidth}
              tickMargin={10}
            />
          )}
          
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(30, 35, 60, 0.85)",
                backdropFilter: "blur(10px)",
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "0.75rem",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
                padding: "10px 14px",
                color: "white",
              }}
              itemStyle={{ color: "rgba(255, 255, 255, 0.9)" }}
              labelStyle={{ fontWeight: "bold", marginBottom: "6px", color: "rgba(255, 255, 255, 0.9)" }}
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
                color: "rgba(255, 255, 255, 0.9)" 
              }}
            />
          )}
          
          {formattedSeries.map((s, index) => (
            <Line
              key={`line-${index}`}
              type={s.type}
              dataKey={s.key}
              name={s.name}
              stroke={`url(#gradientStroke-${index})`}
              strokeWidth={s.strokeWidth}
              dot={{
                r: 4,
                fill: "rgba(30, 35, 60, 0.8)",
                stroke: s.color,
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                stroke: "rgba(255, 255, 255, 0.9)",
                strokeWidth: 2,
                fill: s.color,
                filter: "url(#lineGlow)"
              }}
              fill={showAreaGradient ? `url(#lineGradient-${index})` : "none"}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-in-out"
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
} 