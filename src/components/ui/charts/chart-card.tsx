import React from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "../glass-card";
import { useTheme } from "next-themes";

interface ChartCardProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  color?: string;
}

export function ChartCard({
  title,
  description,
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
        "p-0 h-[280px] w-full", // Increased height for better label visibility
        isDark 
          ? "pt-0 sm:pt-0" 
          : "pt-0 sm:pt-0",
        "p-4 sm:p-6"
      )}
      headerClassName="px-6 pb-0"
      variant="default"
    >
      {children}
    </GlassCard>
  );
} 