import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface ChartCardProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  className,
  children,
}: ChartCardProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";

  return (
    <Card className={cn(
      "overflow-hidden relative",
      "backdrop-blur-2xl",
      isDark 
        ? "bg-[rgba(25,25,25,0.5)] border-[rgba(50,50,55,0.6)]" 
        : "bg-[rgba(255,255,255,0.65)] border-[rgba(255,255,255,0.4)]",
      "border rounded-xl",
      "shadow-[0_15px_40px_rgba(0,0,0,0.15)]",
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
      "hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300",
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
      
      <CardHeader className="px-6 pb-0 relative z-10">
        <CardTitle className={cn(
          "text-base font-semibold md:text-lg",
          isDark ? "text-zinc-200" : "text-gray-800"
        )}>
          {title}
        </CardTitle>
        {description && (
          <CardDescription className={isDark ? "text-zinc-400" : "text-gray-600"}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0 relative z-10">
        <div className="h-[250px] w-full p-4 pt-0 sm:p-6 sm:pt-0">
          {children}
        </div>
      </CardContent>
    </Card>
  );
} 