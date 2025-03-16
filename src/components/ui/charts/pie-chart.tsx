import React from "react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartCard } from "./chart-card";

interface PieChartProps {
  title: string;
  description?: string;
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

// Beautiful color palette for charts
const COLORS = [
  "hsl(210, 100%, 65%)", // Bright blue
  "hsl(280, 90%, 70%)",  // Purple
  "hsl(150, 80%, 55%)",  // Green
  "hsl(35, 100%, 65%)",  // Amber
  "hsl(240, 80%, 70%)",  // Indigo
  "hsl(0, 90%, 70%)",    // Red
  "hsl(190, 90%, 65%)",  // Cyan
  "hsl(330, 90%, 70%)",  // Pink
  "hsl(45, 100%, 65%)",  // Yellow
  "hsl(170, 80%, 55%)",  // Teal
];

export function PieChart({
  title,
  description,
  data,
  className,
  showLegend = true,
  showTooltip = true,
  innerRadius = 60,
  outerRadius = "80%",
}: PieChartProps) {
  // Format data with colors if not provided
  const formattedData = data.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length],
  }));

  return (
    <ChartCard title={title} description={description} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <defs>
            {/* Glow filter for pie slices */}
            <filter id="pieGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* Gradient definitions for each slice */}
            {formattedData.map((entry, index) => (
              <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
          
          <Pie
            data={formattedData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={4}
            strokeWidth={1}
            stroke="rgba(255, 255, 255, 0.2)"
            filter="url(#pieGlow)"
          >
            {formattedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#pieGradient-${index})`}
                style={{
                  filter: "brightness(1.2)",
                  transition: "all 0.3s ease" // For hover effects
                }}
              />
            ))}
          </Pie>
          
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
            />
          )}
          
          {showLegend && (
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ 
                paddingLeft: "2rem",
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.9)"
              }}
              iconType="circle"
              iconSize={10}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
} 