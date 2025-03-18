import React, { useState } from "react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Sector } from "recharts";
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

// Shared color palette for consistency across all charts
export const CHART_COLORS = [
  "#475569", // Slate 700
  "#64748b", // Slate 600
  "#94a3b8", // Slate 400
  "#334155", // Slate 800
  "#0f172a", // Slate 950 
];

// Custom active shape renderer for when a segment is clicked
const renderActiveShape = (props: any) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, 
    fill, payload, percent, name, value, isDark
  } = props;

  // Expand the active segment by making it larger
  const expandedRadius = Number(outerRadius) * 1.1;
  
  return (
    <g>
      {/* Draw the active segment larger */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={expandedRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke={fill}
        strokeWidth={0.5}
        strokeOpacity={0.5}
      />
      
      {/* Add a semi-transparent outer glow */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={expandedRadius + 1}
        outerRadius={expandedRadius + 3}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.15}
      />
      
      {/* Add label inside the segment */}
      <text
        x={cx}
        y={cy - 15}
        dy={8}
        textAnchor="middle"
        fill={isDark ? "#fff" : "#000"}
        fontSize={12}
        fontWeight="500"
        style={{ filter: isDark ? "drop-shadow(0px 1px 2px rgba(0,0,0,0.4))" : "none" }}
      >
        {name}
      </text>
      <text 
        x={cx} 
        y={cy + 10} 
        textAnchor="middle" 
        fill={isDark ? "#fff" : "#000"}
        fontSize={14}
        fontWeight="bold"
        style={{ filter: isDark ? "drop-shadow(0px 1px 2px rgba(0,0,0,0.4))" : "none" }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

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
  
  // State to track which segment is active
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Handle segment click to set active segment
  const onPieSegmentClick = (data: any, index: number) => {
    setActiveIndex(activeIndex === index ? undefined : index);
  };
  
  // Process data to ensure unique values for the chart
  const processedData = React.useMemo(() => {
    const uniqueData = Array.from(
      new Map(data.map(item => [item.name, item])).values()
    );
    
    return uniqueData.map((item, index) => ({
      ...item,
      color: item.color || CHART_COLORS[index % CHART_COLORS.length],
      isDark,
    }));
  }, [data, isDark]);

  // Custom legend render - simple and clean
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center items-center gap-x-4 gap-y-3 px-3 py-3">
        {payload.map((entry: any, index: number) => (
          <li 
            key={`item-${index}`} 
            className={cn(
              "flex items-center cursor-pointer transition-opacity duration-200",
              activeIndex !== undefined && activeIndex !== index ? "opacity-50" : "opacity-100"
            )}
            onClick={() => onPieSegmentClick(null, index)}
          >
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
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-[280px] pt-2 pb-6">
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
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onClick={onPieSegmentClick}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-in-out"
              >
                {processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{
                      filter: isDark 
                        ? "brightness(1.15)" 
                        : "brightness(0.95)",
                      transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Pie>
              {showLegend && (
                <Legend 
                  content={renderLegend}
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    width: '100%',
                    paddingTop: 10,
                  }}
                />
              )}
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  );
}