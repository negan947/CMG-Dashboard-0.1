'use client';

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Head from 'next/head';

interface CMGLogoProps {
  className?: string;
  showText?: boolean;
}

export function CMGLogo({ 
  className, 
  showText = true 
}: CMGLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {/* CMG Text Logo */}
      <span className={cn(
        "text-2xl font-extrabold tracking-tight transition-colors",
        isDark ? "text-blue-400" : "text-blue-600"
      )}>
        CMG
      </span>
      
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={cn(
            "text-sm font-semibold transition-colors leading-tight",
            isDark ? "text-zinc-100" : "text-gray-900"
          )}>
            Dashboard
          </span>
          <span className={cn(
            "text-xs font-medium transition-colors",
            isDark ? "text-zinc-400" : "text-gray-500"
          )}>
            Management Panel
          </span>
        </div>
      )}
    </div>
  );
}

export function CMGFavicon() {
  return (
    <Head>
      <link rel="icon" href="/favicon.ico" />
      {/* For modern browsers, we would also add SVG format favicons */}
      <link rel="icon" type="image/svg+xml" href="/icon.svg" sizes="any" />
    </Head>
  );
} 