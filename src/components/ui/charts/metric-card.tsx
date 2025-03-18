import React from "react";
import { GlassCard } from "../glass-card";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { ArrowUp, ArrowDown } from "lucide-react";
import { DonutChart } from "./donut-chart";

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  changePercentage?: number;
  changeValue?: number;
  changeLabel?: string;
  secondaryLabel?: string;
  secondaryValue?: string | number;
  color?: string;
  showDonut?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  suffix = "",
  prefix = "",
  changePercentage,
  changeValue,
  changeLabel = "vs. last period",
  secondaryLabel,
  secondaryValue,
  color = "blue",
  showDonut = false,
  className,
}: MetricCardProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  // Determine color for percentage change
  const isPositiveChange = changePercentage !== undefined ? changePercentage >= 0 : true;
  const changeColor = isPositiveChange ? "text-green-500" : "text-red-500";
  
  return (
    <GlassCard 
      className={className}
      color={color}
      contentClassName="p-5 sm:p-6"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-medium ${
            isDark ? "text-zinc-300" : "text-gray-600"
          }`}>
            {title}
          </h3>
        </div>
        
        <div className="mt-4 flex items-center gap-4">
          {showDonut && (
            <DonutChart
              value={value}
              color={color}
              size={56}
              className="shrink-0"
            />
          )}
          
          <div className="flex flex-col">
            <div className="flex items-baseline">
              {prefix && (
                <span className={`text-lg font-medium mr-1 ${
                  isDark ? "text-zinc-300" : "text-gray-700"
                }`}>
                  {prefix}
                </span>
              )}
              <span className={`text-2xl font-bold ${
                isDark ? "text-zinc-100" : "text-gray-900"
              }`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {suffix && (
                <span className={`ml-1 text-lg font-medium ${
                  isDark ? "text-zinc-300" : "text-gray-700"
                }`}>
                  {suffix}
                </span>
              )}
            </div>
            
            {changePercentage !== undefined && (
              <div className="mt-1 flex items-center">
                <span className={`flex items-center text-xs font-medium ${changeColor}`}>
                  {isPositiveChange ? (
                    <ArrowUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(changePercentage)}%
                </span>
                {changeValue !== undefined && (
                  <span className={`ml-1 text-xs ${
                    isDark ? "text-zinc-400" : "text-gray-500"
                  }`}>
                    ({isPositiveChange ? "+" : ""}{changeValue})
                  </span>
                )}
              </div>
            )}
            
            {changeLabel && (changePercentage !== undefined || changeValue !== undefined) && (
              <div className={`mt-1 text-xs ${
                isDark ? "text-zinc-500" : "text-gray-500"
              }`}>
                {changeLabel}
              </div>
            )}
            
            {secondaryLabel && secondaryValue && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-zinc-700">
                <div className={`text-xs ${
                  isDark ? "text-zinc-400" : "text-gray-500"
                }`}>
                  {secondaryLabel}
                </div>
                <div className={`mt-1 text-sm font-semibold ${
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