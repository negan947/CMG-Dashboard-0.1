import React, { ReactNode, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: ReactNode;
  error?: string | null;
  success?: string | null;
  errorType?: 'auth' | 'validation' | 'network' | 'server';
}

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  title,
  subtitle,
  error,
  success,
  errorType = 'auth',
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // After mounting, we can safely check the theme
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted && theme === 'dark';
  
  // State for animation trigger
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    // Ensure this runs after mount to allow CSS transition
    if (mounted) {
      const timer = setTimeout(() => setIsContentVisible(true), 50); // Small delay to ensure mounted state is picked up for transition
      return () => clearTimeout(timer);
    }
  }, [mounted]);
  
  // Generate appropriate icon and bg color based on error type
  const getErrorStyles = () => {
    switch (errorType) {
      case 'network':
        return {
          bgColor: isDark ? 'bg-orange-950/30' : 'bg-orange-50',
          textColor: isDark ? 'text-orange-300' : 'text-orange-700',
          borderColor: isDark ? 'border-orange-800/50' : 'border-orange-200',
          icon: (
            <svg className={cn("h-5 w-5", isDark ? "text-orange-500" : "text-orange-400")} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'server':
        return {
          bgColor: isDark ? 'bg-purple-950/30' : 'bg-purple-50',
          textColor: isDark ? 'text-purple-300' : 'text-purple-700',
          borderColor: isDark ? 'border-purple-800/50' : 'border-purple-200',
          icon: (
            <svg className={cn("h-5 w-5", isDark ? "text-purple-500" : "text-purple-400")} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'validation':
        return {
          bgColor: isDark ? 'bg-yellow-950/30' : 'bg-yellow-50',
          textColor: isDark ? 'text-yellow-300' : 'text-yellow-700',
          borderColor: isDark ? 'border-yellow-800/50' : 'border-yellow-200',
          icon: (
            <svg className={cn("h-5 w-5", isDark ? "text-yellow-500" : "text-yellow-400")} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          )
        };
      default: // auth errors
        return {
          bgColor: isDark ? 'bg-red-950/30' : 'bg-red-50',
          textColor: isDark ? 'text-red-300' : 'text-red-700',
          borderColor: isDark ? 'border-red-800/50' : 'border-red-200',
          icon: (
            <svg className={cn("h-5 w-5", isDark ? "text-red-500" : "text-red-400")} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  return (
    <div className={cn(
      "flex min-h-screen flex-col items-center justify-center p-4",
      isDark ? "bg-gradient-to-br from-[#0F0F12] via-[#171720] to-[#1C1C25]" : "bg-gradient-to-br from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF]"
    )}>
      <div className={cn(
        "w-full max-w-md space-y-6 rounded-lg p-6 shadow-md",
        "transition-all duration-500 ease-out", // Base transition classes
        isContentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5", // Animation states
        isDark 
          ? "border border-zinc-800/40 bg-zinc-900/70 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.2)]" 
          : "border border-gray-200 bg-white/90 backdrop-blur-sm shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
      )}>
        <div className="text-center">
          <h1 className={cn("text-2xl font-bold", isDark ? "text-zinc-100" : "text-gray-800")}>{title}</h1>
          {subtitle && <div className={cn("mt-2 text-sm", isDark ? "text-zinc-400" : "text-gray-600")}>{subtitle}</div>}
        </div>

        {error && (
          <div className={`rounded-md ${getErrorStyles().bgColor} border ${getErrorStyles().borderColor} p-4 ${getErrorStyles().textColor}`} role="alert" aria-live="assertive">
            <div className="flex">
              <div className="flex-shrink-0">
                {getErrorStyles().icon}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">{error}</h3>
                {errorType === 'network' && (
                  <div className="mt-2 text-sm">
                    <p>Please check your connection and try again.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className={cn(
            "rounded-md border p-4 text-sm",
            isDark ? "bg-green-950/30 border-green-800/50 text-green-300" : "bg-green-50 border-green-200 text-green-700"
          )} role="status" aria-live="polite">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={cn("h-5 w-5", isDark ? "text-green-500" : "text-green-400")} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}; 