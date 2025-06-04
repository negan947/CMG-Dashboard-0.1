import React, { useState } from "react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Sector, Text } from "recharts";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "./pie-chart";

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  className?: string;
  showLegend?: boolean;
  innerRadius?: number | string;
  outerRadius?: string | number;
}

// Custom active shape renderer for when a segment is clicked
const renderActiveShape = (props: {
  cx: number;
  cy: number;
  innerRadius: number | string;
  outerRadius: number | string;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: { name: string; value: number };
  percent: number;
  name: string;
  value: number;
  isDark: boolean;
}) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, 
    fill, payload, percent, name, value, isDark
  } = props;

  // Get innerRadius and outerRadius as numbers
  const innerR = typeof innerRadius === 'string' ? parseInt(innerRadius) : innerRadius;
  const outerR = typeof outerRadius === 'string' ? parseInt(outerRadius) : outerRadius;
  
  // Expand the active segment by making it larger
  const expandedRadius = outerR * 1.05;
  
  return (
    <g>
      {/* Draw the active segment larger */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerR}
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
        outerRadius={expandedRadius + 2}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.15}
      />
    </g>
  );
};

// Center label for donut chart
const renderCenterLabel = ({ viewBox, value, isDark }: any) => {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        className={cn(
          "fill-current font-medium",
          isDark ? "text-gray-200" : "text-gray-700"
        )}
        fontSize="14px"
      >
        {value}
      </text>
    </g>
  );
};

export function DonutChart({
  data,
  className,
  showLegend = true,
  innerRadius = 60,
  outerRadius = "70%",
}: DonutChartProps) {
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
    if (!data || data.length === 0) {
      return [];
    }
    
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
    
    if (!payload || payload.length === 0) {
      return null;
    }
    
    return (
      <ul className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 px-2 mt-1">
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
              className="w-2 h-2 rounded-full mr-1"
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
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="w-full flex-grow" style={{ minHeight: '150px' }}>
        {processedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <RechartsPieChart margin={{ top: 5, right: 5, bottom: showLegend ? 20 : 5, left: 5 }}>
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
                activeShape={(props: any) => renderActiveShape({...props, isDark})}
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
                    fontSize: '10px',
                    position: 'absolute',
                    bottom: 0
                  }}
                />
              )}
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className={cn(
              "text-sm",
              isDark ? "text-zinc-400" : "text-gray-500"
            )}>
              No data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 