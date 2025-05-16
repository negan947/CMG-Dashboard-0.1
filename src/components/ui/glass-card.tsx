import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface GlassCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  color?: string;
  variant?: "default" | "subtle" | "outline";
  contentClassName?: string;
  headerClassName?: string;
  footerContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

// Default colors for accent
const colorMap = {
  blue: "hsl(220, 80%, 60%)",
  purple: "hsl(280, 70%, 65%)",
  green: "hsl(150, 70%, 50%)",
  amber: "hsl(35, 95%, 55%)",
  indigo: "hsl(240, 70%, 65%)",
  red: "hsl(0, 80%, 65%)",
  cyan: "hsl(190, 80%, 55%)",
  pink: "hsl(320, 70%, 65%)",
};

export function GlassCard({
  title,
  description,
  children,
  className,
  color = "blue",
  variant = "default",
  contentClassName,
  headerClassName,
  footerContent,
  headerContent,
  onClick,
}: GlassCardProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  
  const accentColor = colorMap[color as keyof typeof colorMap] || color;
  
  // Set glass effect variables based on the variant
  const glassBackgroundOpacity = variant === "subtle" 
    ? (isDark ? "0.35" : "0.35") 
    : variant === "outline" 
      ? (isDark ? "0.2" : "0.15") 
      : (isDark ? "0.45" : "0.45");
  
  const glassBorderOpacity = variant === "subtle"
    ? (isDark ? "0.4" : "0.45")
    : variant === "outline"
      ? (isDark ? "0.6" : "0.7")
      : (isDark ? "0.5" : "0.6");
  
  const showAccentBar = variant !== "outline";
  const blurAmount = variant === "subtle" ? "backdrop-blur-md" : "backdrop-blur-xl";
  
  return (
    <Card className={cn(
      "overflow-hidden relative",
      blurAmount,
      isDark 
        ? `bg-[rgba(20,20,25,${glassBackgroundOpacity})] border-[rgba(60,60,75,${glassBorderOpacity})]` 
        : `bg-[rgba(255,255,255,${glassBackgroundOpacity})] border-[rgba(240,245,255,${glassBorderOpacity})]`,
      "border rounded-xl",
      variant === "outline" 
        ? "shadow-sm" 
        : variant === "subtle" 
          ? isDark 
            ? "shadow-[0_4px_20px_rgba(0,0,0,0.15)]" 
            : "shadow-[0_4px_15px_rgba(0,0,0,0.06)]" 
          : isDark 
            ? "shadow-[0_8px_30px_rgba(0,0,0,0.2)]" 
            : "shadow-[0_6px_20px_rgba(0,0,0,0.08)]",
      // Inner shine gradient
      "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-40 before:rounded-xl",
      isDark 
        ? "before:from-zinc-100/[0.05] before:via-zinc-300/[0.02] before:to-transparent" 
        : "before:from-white/60 before:via-white/30 before:to-transparent",
      // Top border light
      "after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r",
      isDark 
        ? "after:from-transparent after:via-zinc-300/30 after:to-transparent" 
        : "after:from-transparent after:via-white/90 after:to-transparent",
      variant === "default" && (isDark 
        ? "hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all duration-300"
        : "hover:shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-all duration-300"),
      className
    )}
    onClick={onClick}>
      {/* Subtle brushed metal texture */}
      {isDark && (
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none hidden sm:block" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'600\' height=\'600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
        }} />
      )}
      
      {/* Inner shadow effect - more subtle in light mode */}
      <div className={cn(
        "absolute inset-0 pointer-events-none rounded-xl hidden sm:block",
        isDark 
          ? "shadow-[inset_0_0_15px_rgba(0,0,0,0.12)]" 
          : "shadow-[inset_0_0_10px_rgba(0,0,0,0.03)]"
      )} />
      
      {/* Card content */}
      {(title || description || headerContent) && (
        <CardHeader className={cn("relative z-10 p-2 sm:p-3 md:p-4 lg:p-6", headerClassName)}>
          {headerContent ? (
            headerContent
          ) : title && (
            <CardTitle className={cn(
              "text-xs sm:text-sm md:text-base lg:text-lg font-semibold",
              isDark ? "text-zinc-100" : "text-gray-800"
            )}>
              {title}
            </CardTitle>
          )}
          {!headerContent && description && (
            <CardDescription className={cn(
              "text-[10px] sm:text-xs md:text-sm",
              isDark ? "text-zinc-300" : "text-gray-600"
            )}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      
      <CardContent className={cn("relative z-10", contentClassName)}>
        {children}
      </CardContent>
      
      {footerContent && (
        <CardFooter className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-6">
          {footerContent}
        </CardFooter>
      )}
    </Card>
  );
} 