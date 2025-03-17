import React from "react";
import { DonutChart } from "./donut-chart";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { GlassCard } from "../glass-card";

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  maxValue?: number;
  color?: string;
  className?: string;
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
}: MetricCardProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  const chartColor = colorMap[color as keyof typeof colorMap] || color;
  
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
      <div className="mt-3 flex items-center">
        <div className={cn(
          "text-2xl font-bold md:text-3xl",
          isDark ? "text-zinc-100" : "text-gray-800"
        )}>
          {value}{suffix}
        </div>
        <div className="ml-auto">
          <DonutChart 
            value={value} 
            maxValue={maxValue} 
            color={chartColor}
            size={64} 
            thickness={8}
          />
        </div>
      </div>
    </GlassCard>
  );
} 