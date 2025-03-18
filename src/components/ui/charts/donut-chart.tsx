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

  // Calculate dimensions
  const radius = size / 2;
  const circumference = 2 * Math.PI * innerRadius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  // The SVG viewBox should match the size exactly
  const viewBox = `0 0 ${size} ${size}`;

  return (
    <div className={cn("flex-shrink-0 relative flex items-center justify-center", className)}>
      {/* Background circle */}
      <svg width="100%" height="100%" viewBox={viewBox} className="absolute">
        <circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
          strokeWidth={thickness}
        />
      </svg>
      
      {/* Foreground arc */}
      <svg 
        width="100%" 
        height="100%" 
        viewBox={viewBox} 
        className="absolute rotate-[-90deg]"
      >
        <circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
} 