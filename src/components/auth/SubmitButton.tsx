import React from 'react';

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
  return (
    <button
      type={type}
      onClick={onClick}
      className={`relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 ${className}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span className="absolute inset-y-0 left-0 flex items-center pl-3" aria-hidden="true">
            <svg
              className="h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
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
          </span>
          <span className="sr-only">Loading</span>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}; 