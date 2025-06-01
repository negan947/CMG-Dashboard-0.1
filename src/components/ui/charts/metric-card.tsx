import React from "react";
import { GlassCard } from "../glass-card";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { ArrowUp, ArrowDown } from "lucide-react";
import { DonutChart } from "./donut-chart";

interface MetricCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  changePercentage?: number;
  changeValue?: number;
  changeLabel?: string;
  changeType?: "increase" | "decrease" | string;
  period?: string;
  secondaryLabel?: string;
  secondaryValue?: string | number;
  color?: string;
  showDonut?: boolean;
  className?: string;
  icon?: React.ReactNode;
  isDark?: boolean;
}

export function MetricCard({
  title,
  value,
  suffix = "",
  prefix = "",
  changePercentage,
  changeValue,
  changeLabel = "vs. last period",
  changeType,
  period,
  secondaryLabel,
  secondaryValue,
  color = "blue",
  showDonut = false,
  className,
  icon,
  isDark: propIsDark,
}: MetricCardProps) {
  const { theme } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme !== "light";
  
  // Determine color for percentage change
  const isPositiveChange = changeType ? changeType === "increase" : (changePercentage !== undefined ? changePercentage >= 0 : true);
  const changeColor = isPositiveChange ? "text-green-500" : "text-red-500";
  
  // Convert value to number for DonutChart if necessary
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0 : value;
  
  return (
    <GlassCard 
      className={className}
      color={color}
      contentClassName="p-3 sm:p-3.5 md:p-4 h-full flex flex-col"
    >
      <div className="flex flex-col h-full justify-between">
        <h3 className={`text-[11px] sm:text-xs md:text-sm font-medium mb-2 sm:mb-3 flex items-center gap-1 ${
          isDark ? "text-zinc-300" : "text-gray-600"
        }`}>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {title}
        </h3>
        
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1">
          {showDonut && (
            <DonutChart
              value={numericValue}
              color={color}
              size={36}
              className="shrink-0 sm:size-40 md:size-44 lg:size-48"
            />
          )}
          
          <div className="flex flex-col justify-center flex-1">
            <div className="flex items-baseline">
              {prefix && (
                <span className={`text-base sm:text-lg md:text-xl font-medium mr-0.5 ${
                  isDark ? "text-zinc-300" : "text-gray-700"
                }`}>
                  {prefix}
                </span>
              )}
              <span className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold ${
                isDark ? "text-zinc-100" : "text-gray-900"
              }`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {suffix && (
                <span className={`ml-0.5 text-base sm:text-lg md:text-xl font-medium ${
                  isDark ? "text-zinc-300" : "text-gray-700"
                }`}>
                  {suffix}
                </span>
              )}
            </div>
            
            <div className="flex items-center mt-1 sm:mt-2">
              {changePercentage !== undefined && (
                <span className={`flex items-center text-[10px] sm:text-xs md:text-sm font-medium ${changeColor}`}>
                  {isPositiveChange ? (
                    <ArrowUp className="mr-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                  ) : (
                    <ArrowDown className="mr-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                  )}
                  {Math.abs(changePercentage)}%
                </span>
              )}
              
              {changeValue !== undefined && (
                <span className={`ml-1 text-[10px] sm:text-xs md:text-sm ${
                  isDark ? "text-zinc-400" : "text-gray-500"
                }`}>
                  ({isPositiveChange ? "+" : ""}{changeValue})
                </span>
              )}
            </div>
            
            {period && (
              <div className={`text-[8px] sm:text-[10px] md:text-xs ${
                isDark ? "text-zinc-500" : "text-gray-500"
              }`}>
                {period}
              </div>
            )}
            
            {changeLabel && (changePercentage !== undefined || changeValue !== undefined) && !period && (
              <div className={`text-[8px] sm:text-[10px] md:text-xs ${
                isDark ? "text-zinc-500" : "text-gray-500"
              }`}>
                {changeLabel}
              </div>
            )}
            
            {secondaryLabel && secondaryValue && (
              <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-gray-200 dark:border-zinc-700">
                <div className={`text-[9px] sm:text-[10px] md:text-xs ${
                  isDark ? "text-zinc-400" : "text-gray-500"
                }`}>
                  {secondaryLabel}
                </div>
                <div className={`text-xs sm:text-sm md:text-base font-semibold ${
                  isDark ? "text-zinc-200" : "text-gray-800"
                }`}>
                  {secondaryValue}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
} 