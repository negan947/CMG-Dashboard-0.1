import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { CHART_COLORS } from "./pie-chart";

interface DonutChartProps {
  value: number;
  maxValue?: number;
  size?: number;
  thickness?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export function DonutChart({
  value,
  maxValue = 100,
  size = 56,
  thickness = 6,
  color = CHART_COLORS[0],
  backgroundColor,
  className,
}: DonutChartProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  // Default background color based on theme
  const bgColor = backgroundColor || (isDark ? "rgba(40, 40, 50, 0.3)" : "rgba(0, 0, 0, 0.08)");
  
  // Calculate percentage and ensure it's between 0 and 100
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  
  // Create data for the donut chart
  const data = [
    { name: "Value", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  // Calculate inner radius based on thickness
  const outerRadius = size / 2;
  const innerRadius = outerRadius - thickness;

  // Generate unique ID for this instance to avoid filter conflicts
  const uniqueId = React.useId();
  const gradientId = `donutGradient-${uniqueId}`;

  return (
    <div 
      className={cn(className, "relative")} 
      style={{ width: size, height: size }}
      title={`${percentage.toFixed(1)}%`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            {/* Fill gradient */}
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={90}
            endAngle={-270}
            paddingAngle={0}
            stroke="none"
            animationDuration={1000}
            animationEasing="ease-out"
            isAnimationActive={true}
          >
            <Cell 
              fill={`url(#${gradientId})`} 
              stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)"}
              strokeWidth={0.5}
              style={{ 
                transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)" 
              }} 
            />
            <Cell 
              fill={bgColor} 
              stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
              strokeWidth={0.5}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Inner shadow for depth - ShadCN style */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{
        boxShadow: isDark 
          ? "inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 2px rgba(255,255,255,0.05)" 
          : "inset 0 1px 2px rgba(0,0,0,0.1), 0 1px 2px rgba(255,255,255,0.1)",
      }} />
    </div>
  );
} 