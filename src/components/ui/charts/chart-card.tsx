import React from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "../glass-card";
import { useTheme } from "next-themes";

interface ChartCardProps {
  title: string;
  description?: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
  color?: string;
}

export function ChartCard({
  title,
  description,
  subtitle,
  className,
  children,
  color = "blue"
}: ChartCardProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  return (
    <GlassCard
      title={title}
      description={description}
      className={cn("transition-all", className)}
      color={color}
      contentClassName={cn(
        "p-0 min-h-[350px] h-full w-full", // Increased minimum height to match the chart
        isDark 
          ? "pt-0 sm:pt-0" 
          : "pt-0 sm:pt-0",
        "p-4 sm:p-6"
      )}
      headerClassName="px-6 pb-0"
      variant="default"
      headerContent={
        subtitle ? (
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "text-base font-semibold md:text-lg",
              isDark ? "text-zinc-100" : "text-gray-800"
            )}>
              {title}
            </h3>
            <div className="flex items-center">
              <span className={cn(
                "ml-2 text-xs font-medium rounded-full px-2 py-1",
                isDark ? "bg-zinc-800 text-zinc-300" : "bg-green-50/70 text-green-700"
              )}>
                ▼ {subtitle}
              </span>
            </div>
          </div>
        ) : null
      }
    >
      {children}
    </GlassCard>
  );
} 