import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

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
  thickness = 8,
  color = "hsl(220, 70%, 60%)",
  backgroundColor,
  className,
}: DonutChartProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  // Default background color based on theme
  const bgColor = backgroundColor || (isDark ? "rgba(40, 40, 45, 0.6)" : "rgba(0, 0, 0, 0.05)");
  
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
  const glowId = `donutGlow-${uniqueId}`;
  const fillId = `donutFill-${uniqueId}`;
  const shineId = `donutShine-${uniqueId}`;

  return (
    <div className={cn(className, "relative")} style={{ width: size, height: size }}>
      {/* Glow effect */}
      <div className="absolute inset-0 blur-md opacity-40" style={{ 
        background: isDark 
          ? `radial-gradient(circle, ${color}60 0%, transparent 70%)` 
          : `radial-gradient(circle, ${color}70 0%, transparent 70%)`
      }} />
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            {/* Glow filter */}
            <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* Fill gradient */}
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={color} stopOpacity="0.7" />
            </linearGradient>
            
            {/* Metallic shine effect */}
            <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.2)" stopOpacity="0.7" />
              <stop offset="50%" stopColor="rgba(255,255,255,0)" stopOpacity="0" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" stopOpacity="0.3" />
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
            filter={`url(#${glowId})`}
          >
            <Cell 
              fill={`url(#${fillId})`} 
              stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)"}
              strokeWidth={0.5}
              style={{ 
                filter: "brightness(1.1)",
                transition: "all 0.3s ease-in-out" 
              }} 
            />
            <Cell 
              fill={bgColor} 
              stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"}
              strokeWidth={0.5}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Shine overlay */}
      <div className="absolute inset-0 opacity-30 rounded-full pointer-events-none" style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.05) 100%)`,
      }} />
    </div>
  );
} 