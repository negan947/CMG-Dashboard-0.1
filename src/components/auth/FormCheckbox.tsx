import React, { InputHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    // Create the input props object
    const inputProps: Record<string, any> = {
      ref,
      id,
      type: 'checkbox',
      className: `h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`,
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
          <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
            {label}
          </label>
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${id}-error`} role="alert">
            {error.message}
          </p>
        )}
      </div>
    );
  }
); 