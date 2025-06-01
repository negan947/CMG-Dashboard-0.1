'use client';

import { Settings, Trash2 } from 'lucide-react';
import { WidgetEditControlsProps } from './types';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Widget edit controls component with delete and configure buttons.
 * 
 * This uses onMouseDown instead of onClick to prevent conflicts with
 * React Grid Layout's drag handling. React Grid Layout treats onClick
 * events as potential drag operations, which is why the delete button
 * wasn't working properly with a single click.
 */
export function WidgetEditControls({ onConfigure, onRemove }: WidgetEditControlsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use mouseDown and touchStart to prevent conflicts with react-grid-layout
  const stopPropagationAndExecute = (
    e: React.MouseEvent | React.TouchEvent,
    callback: () => void
  ) => {
    // Prevent any default actions
    e.preventDefault();
    
    // Stop event propagation to prevent react-grid-layout from handling it
    e.stopPropagation();
    
    // Execute the callback
    callback();
  };

  return (
    <div 
      className={cn(
        "absolute right-2 top-2 flex gap-1 z-50 rounded-md p-1",
        isDark ? "bg-zinc-800/80" : "bg-white/80",
        "backdrop-blur-sm shadow-sm"
      )}
      // Apply cancellation to the container as well
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      // Add draggableCancel class to help react-grid-layout identify non-draggable areas
      data-grid-draggable-cancel="true"
    >
      <button
        type="button"
        className={cn(
          "rounded-md p-1 transition-colors draggableCancel",
          isDark 
            ? "hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100" 
            : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
        )}
        aria-label="Configure widget"
        // Use mouseDown instead of click to avoid conflict with drag
        onMouseDown={(e) => stopPropagationAndExecute(e, onConfigure)}
        onTouchStart={(e) => stopPropagationAndExecute(e, onConfigure)}
      >
        <Settings size={16} />
      </button>
      <button
        type="button"
        className={cn(
          "rounded-md p-1 transition-colors draggableCancel",
          isDark 
            ? "hover:bg-red-900/60 text-zinc-300 hover:text-red-300" 
            : "hover:bg-red-100 text-gray-600 hover:text-red-600"
        )}
        aria-label="Remove widget"
        // Use mouseDown instead of click to avoid conflict with drag
        onMouseDown={(e) => stopPropagationAndExecute(e, onRemove)}
        onTouchStart={(e) => stopPropagationAndExecute(e, onRemove)}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
} 