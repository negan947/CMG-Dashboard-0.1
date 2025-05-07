import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface SubmitButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  isLoading = false,
  loadingText = 'Loading...',
  className = '',
  onClick,
  type = 'submit',
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // After mounting, we can safely check the theme
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted && theme === 'dark';
  
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "relative flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 disabled:opacity-70",
        "transform transition-transform duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98]",
        isDark
          ? "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-600 focus:ring-offset-1 focus:ring-offset-zinc-900"
          : "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-full">
          <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="sr-only">{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}; 