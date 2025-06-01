import React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  description,
  children,
  className
}: ChartCardProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  return (
    <div className={cn("flex flex-col", className)}>
      {(title || subtitle || description) && (
        <div className="mb-2">
          {title && (
            <h3 className={cn(
              "text-lg font-semibold",
              isDark ? "text-zinc-100" : "text-gray-800"
            )}>
              {title}
            </h3>
          )}
          
          {(subtitle || description) && (
            <p className={cn(
              "text-xs",
              isDark ? "text-zinc-400" : "text-gray-500"
            )}>
              {subtitle || description}
            </p>
          )}
        </div>
      )}
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 