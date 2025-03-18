import React from "react";
import { DonutChart } from "./donut-chart";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { GlassCard } from "../glass-card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  maxValue?: number;
  color?: string;
  className?: string;
  changePercentage?: number;
  changeValue?: number;
  showDonut?: boolean;
}

const colorMap = {
  blue: "hsl(220, 80%, 60%)",
  purple: "hsl(280, 70%, 65%)",
  green: "hsl(150, 70%, 50%)",
  amber: "hsl(35, 95%, 55%)",
  indigo: "hsl(240, 70%, 65%)",
  red: "hsl(0, 80%, 65%)",
};

export function MetricCard({
  title,
  value,
  suffix = "",
  maxValue = 100,
  color = "blue",
  className,
  changePercentage,
  changeValue,
  showDonut = true,
}: MetricCardProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  const chartColor = colorMap[color as keyof typeof colorMap] || color;
  
  // Determine if change is positive, negative, or neutral
  const isPositive = changePercentage !== undefined && changePercentage > 0;
  const isNegative = changePercentage !== undefined && changePercentage < 0;
  
  return (
    <GlassCard 
      className={className}
      color={color}
      contentClassName="p-5 md:p-6"
    >
      <h3 className={cn(
        "text-sm font-medium",
        isDark ? "text-zinc-300" : "text-gray-700"
      )}>
        {title}
      </h3>
      <div className="mt-2.5 flex items-center">
        <div className={showDonut ? "" : "w-full"}>
          <div className={cn(
            "text-2xl font-bold md:text-3xl",
            isDark ? "text-zinc-100" : "text-gray-800"
          )}>
            {value}{suffix}
          </div>
          
          {/* Change indicator */}
          {changePercentage !== undefined && (
            <div className="mt-1.5 flex items-center">
              <div className={cn(
                "flex items-center text-xs font-medium",
                isPositive ? "text-emerald-500" : 
                isNegative ? "text-red-500" : 
                isDark ? "text-zinc-400" : "text-gray-500"
              )}>
                {isPositive && (
                  <ArrowUp className="mr-0.5 h-3 w-3 text-emerald-500" />
                )}
                {isNegative && (
                  <ArrowDown className="mr-0.5 h-3 w-3 text-red-500" />
                )}
                <span>
                  {Math.abs(changePercentage)}%
                  {changeValue !== undefined && (
                    <span className={cn(
                      "ml-1",
                      isDark ? "text-zinc-400" : "text-gray-500"
                    )}>
                      ({changeValue > 0 ? "+" : ""}{changeValue})
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {showDonut && (
          <div className="ml-auto">
            <DonutChart 
              value={value} 
              maxValue={maxValue} 
              color={chartColor}
              size={58} 
              thickness={6}
            />
          </div>
        )}
      </div>
    </GlassCard>
  );
} 