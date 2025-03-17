import React, { InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { FieldError } from 'react-hook-form';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    // After mounting, we can safely check the theme
    useEffect(() => {
      setMounted(true);
    }, []);
    
    const isDark = mounted && theme === 'dark';
    
    // Create the input props object
    const inputProps: Record<string, any> = {
      ref,
      id,
      type: 'checkbox',
      className: cn(
        "h-4 w-4 rounded",
        isDark 
          ? "border-zinc-700 text-blue-500 focus:ring-blue-600 bg-zinc-800"
          : "border-gray-300 text-blue-600 focus:ring-blue-500",
        className
      ),
      ...props
    };
    
    // Add aria attributes conditionally
    if (error) {
      inputProps['aria-invalid'] = true;
      inputProps['aria-describedby'] = `${id}-error`;
    }

    return (
      <div>
        <div className="flex items-center">
          <input {...inputProps} />
          <label htmlFor={id} className={cn(
            "ml-2 block text-sm",
            isDark ? "text-zinc-300" : "text-gray-900"
          )}>
            {label}
          </label>
        </div>
        
        {error && (
          <p className={cn(
            "mt-1 text-sm", 
            isDark ? "text-red-400" : "text-red-600"
          )} id={`${id}-error`} role="alert">
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

// Ensure display name is set for debug purposes
FormCheckbox.displayName = 'FormCheckbox'; 