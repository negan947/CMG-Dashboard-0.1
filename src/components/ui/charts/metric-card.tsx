import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DonutChart } from "./donut-chart";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  maxValue?: number;
  color?: string;
  className?: string;
}

const colorMap = {
  blue: "hsl(220, 70%, 60%)",
  purple: "hsl(280, 60%, 65%)",
  green: "hsl(150, 60%, 50%)",
  amber: "hsl(35, 90%, 55%)",
  indigo: "hsl(240, 60%, 65%)",
  red: "hsl(0, 70%, 65%)",
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
    <Card className={cn(
      "overflow-hidden relative",
      "backdrop-blur-2xl",
      isDark 
        ? "bg-[rgba(28,28,30,0.55)] border-[rgba(50,50,55,0.6)]" 
        : "bg-[rgba(255,255,255,0.65)] border-[rgba(255,255,255,0.4)]",
      "border rounded-xl",
      "shadow-[0_10px_30px_rgba(0,0,0,0.15)]",
      // Inner shine gradient
      "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-30 before:rounded-xl",
      isDark 
        ? "before:from-zinc-200/[0.03] before:via-zinc-400/[0.01] before:to-transparent" 
        : "before:from-white/40 before:via-white/20 before:to-transparent",
      // Top border light
      "after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r",
      isDark 
        ? "after:from-transparent after:via-zinc-400/20 after:to-transparent" 
        : "after:from-transparent after:via-white/70 after:to-transparent",
      "hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)] transition-all duration-300",
      className
    )}>
      {/* Frosted glass backlight effect */}
      <div className="absolute -inset-1 bg-gradient-to-tr from-transparent via-zinc-50/[0.01] to-zinc-50/[0.03] blur-xl opacity-30 z-0 pointer-events-none" />
      
      {/* Subtle brushed metal texture */}
      {isDark && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'600\' height=\'600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.3\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
        }} />
      )}
      
      {/* Inner shadow effect */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_15px_rgba(0,0,0,0.1)] rounded-xl" />
      
      <CardContent className="p-5 md:p-6 relative z-10">
        <h3 className={cn(
          "text-sm font-medium",
          isDark ? "text-zinc-400" : "text-gray-600"
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
      </CardContent>
    </Card>
  );
} 