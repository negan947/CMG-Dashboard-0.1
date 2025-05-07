import React, { InputHTMLAttributes, forwardRef, useState, useEffect, ReactNode } from 'react';
import { FieldError } from 'react-hook-form';
import { useTheme } from 'next-themes';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  description?: string;
  showValidState?: boolean;
  canTogglePassword?: boolean;
  leadingIcon?: ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, description, id, className = "", showValidState = false, type, canTogglePassword = false, leadingIcon, ...props }, ref) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    useEffect(() => {
      setMounted(true);
      if (props.defaultValue) {
        setHasValue(true);
      }
    }, [props.defaultValue]);
    
    const isDark = mounted && theme === 'dark';
    
    const currentType = type === 'password' && isPasswordVisible ? 'text' : type;

    const inputProps: Record<string, any> = {
      ref,
      id,
      type: currentType,
      className: cn(
        "mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none",
        "transition-all duration-200 ease-in-out",
        leadingIcon ? 'pl-10' : 'pl-3',
        (error || (hasValue && !isFocused && showValidState) || (type === 'password' && canTogglePassword)) ? 'pr-10' : 'pr-3',
        error 
          ? isDark
            ? 'border-red-700 ring-1 ring-red-700 focus:border-red-700 focus:ring-red-700 focus:scale-[1.01] bg-red-950/20'
            : 'border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 focus:scale-[1.01]' 
          : hasValue && !isFocused && showValidState 
            ? isDark
              ? 'border-green-700 ring-1 ring-green-700 focus:border-green-700 focus:ring-green-700 bg-green-950/10'
              : 'border-green-500 ring-1 ring-green-500 focus:border-green-500 focus:ring-green-500' 
            : isDark
              ? 'border-zinc-700 focus:border-blue-600 focus:ring-blue-600 focus:scale-[1.01] focus:shadow-md focus:shadow-blue-700/30 bg-zinc-800/70'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:scale-[1.01] focus:shadow-md focus:shadow-blue-500/30',
        className
      ),
      onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (props.onFocus) props.onFocus(e);
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        setHasValue(!!e.target.value);
        if (props.onBlur) props.onBlur(e);
      },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasValue(!!e.target.value);
        if (props.onChange) props.onChange(e);
      },
      ...props
    };
    
    if (error) {
      inputProps['aria-invalid'] = true;
      inputProps['aria-describedby'] = `${id}-error`;
    } else if (description) {
      inputProps['aria-describedby'] = `${id}-description`;
    }

    const focusClasses = "focus:outline-none focus:ring-2 focus:ring-offset-0";
    if (inputProps.className && !inputProps.className.includes('focus:ring-')) {
      inputProps.className += ` ${focusClasses}`;
    }

    const renderLeadingIcon = () => {
      if (leadingIcon) {
        return (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {React.cloneElement(leadingIcon as React.ReactElement, { 
              className: cn("h-5 w-5", error ? (isDark ? 'text-red-600' : 'text-red-500') : (isDark ? 'text-zinc-400' : 'text-gray-400')) 
            })}
          </div>
        );
      }
      return null;
    };

    const renderValidationIcon = () => {
      if (error) {
        return (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className={cn("h-5 w-5", isDark ? "text-red-600" : "text-red-500")} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        );
      } else if (hasValue && !isFocused && showValidState && !(type === 'password' && canTogglePassword)) {
        return (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className={cn("h-5 w-5", isDark ? "text-green-600" : "text-green-500")} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          </div>
        );
      }
      return null;
    };

    const renderPasswordToggle = () => {
      if (type === 'password' && canTogglePassword) {
        const Icon = isPasswordVisible ? EyeOff : Eye;
        return (
          <button 
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className={cn(
              "absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none",
              error ? 'pr-9' : 'pr-3'
            )}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      }
      return null;
    };

    return (
      <div className="space-y-1">
        <label htmlFor={id} className={cn("block text-sm font-medium", isDark ? "text-zinc-300" : "text-gray-700")}>
          {label}
        </label>
        <div className="relative">
          {renderLeadingIcon()}
          <input {...inputProps} />
          {!error && renderPasswordToggle()}
          {error && <>
            {renderValidationIcon()}
            {renderPasswordToggle()}
          </>}
          {!error && !(type === 'password' && canTogglePassword) && renderValidationIcon()}
        </div>
        {error && (
          <p className={cn("mt-1 text-sm flex items-center gap-1", isDark ? "text-red-400" : "text-red-600")} id={`${id}-error`} role="alert">
            <span>{error.message}</span>
          </p>
        )}
        {description && !error && (
          <p className={cn("mt-1 text-xs", isDark ? "text-zinc-400" : "text-gray-500")} id={`${id}-description`}>
            {description}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput'; 