'use client';

import { ReactElement, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { UserWidget } from './widgets/types';
import { availableWidgets } from './widgets/registry';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Apply width provider to make the grid responsive
const ResponsiveGridLayout = WidthProvider(Responsive);

interface EditableDashboardProps {
  widgets: UserWidget[];
  isEditing: boolean;
  onLayoutChange: (layout: any) => void;
  onRemoveWidget: (widgetId: string) => void;
  onConfigureWidget: (widgetId: string) => void;
  onAddWidget: () => void;
}

export function EditableDashboard({
  widgets,
  isEditing,
  onLayoutChange,
  onRemoveWidget,
  onConfigureWidget,
  onAddWidget,
}: EditableDashboardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Create layouts object for react-grid-layout
  const layouts = {
    lg: widgets.map(widget => ({
      i: widget.id,
      x: widget.gridPosition.x,
      y: widget.gridPosition.y,
      w: widget.gridPosition.w,
      h: widget.gridPosition.h,
      minW: 1,
      minH: 1,
      maxW: 4,
      maxH: 2,
    })),
  };

  // Create stable handler functions with useCallback
  const handleRemoveWidget = useCallback((widgetId: string) => {
    console.log('EditableDashboard removing widget:', widgetId); // For debugging
    
    // Add a small delay to ensure React-Grid-Layout has completed any current operations
    setTimeout(() => {
      onRemoveWidget(widgetId);
    }, 50);
  }, [onRemoveWidget]);

  const handleConfigureWidget = useCallback((widgetId: string) => {
    console.log('EditableDashboard configuring widget:', widgetId); // For debugging
    
    // Add a small delay to ensure React-Grid-Layout has completed any current operations
    setTimeout(() => {
      onConfigureWidget(widgetId);
    }, 50);
  }, [onConfigureWidget]);

  // Render a specific widget based on its type
  const renderWidget = (widget: UserWidget): ReactElement | null => {
    const widgetDef = availableWidgets[widget.type];
    
    if (!widgetDef) {
      console.error(`Widget type ${widget.type} not found`);
      return null;
    }
    
    const WidgetComponent = widgetDef.component;
    
    return (
      <WidgetComponent
        id={widget.id}
        config={widget.config}
        isEditing={isEditing}
        onConfigChange={() => handleConfigureWidget(widget.id)}
        onRemove={() => handleRemoveWidget(widget.id)}
      />
    );
  };

  return (
    <div className="relative">
      {isEditing && (
        <div className={cn(
          "sticky top-0 z-20 p-4 mb-4 rounded-lg",
          isDark 
            ? "bg-zinc-900/80 border border-zinc-800" 
            : "bg-white/80 border border-gray-200",
          "backdrop-blur-lg"
        )}>
          <div className="flex justify-between items-center">
            <h2 className={cn(
              "text-lg font-medium",
              isDark ? "text-zinc-100" : "text-gray-900"
            )}>
              Edit Dashboard
            </h2>
            <Button onClick={onAddWidget} variant="outline" size="sm" className="gap-1">
              <Plus size={16} />
              Add Widget
            </Button>
          </div>
          <p className={cn(
            "text-sm mt-1",
            isDark ? "text-zinc-400" : "text-gray-500"
          )}>
            Drag widgets to rearrange or resize them. Click the settings icon to configure.
          </p>
        </div>
      )}
      
      <div className="mb-5">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 4, md: 4, sm: 2, xs: 1, xxs: 1 }}
          rowHeight={220}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          isDraggable={isEditing}
          isResizable={isEditing}
          onLayoutChange={(layout) => onLayoutChange(layout)}
          useCSSTransforms={true}
          isBounded={true}
          preventCollision={false}
          compactType="vertical"
          draggableCancel=".draggableCancel"
        >
          {widgets.map(widget => (
            <div 
              key={widget.id} 
              className={cn(
                "rounded-lg overflow-hidden h-full", 
                isDark ? "bg-zinc-900/80 border border-zinc-800" : "bg-white/80 border border-gray-200",
                isEditing ? (isDark ? "shadow-lg shadow-blue-900/10" : "shadow-lg shadow-blue-500/10") : "",
                isEditing ? "cursor-move" : ""
              )}
              style={{ width: '100%', height: '100%' }}
            >
              {renderWidget(widget)}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
      
      {widgets.length === 0 && (
        <div className={cn(
          "flex flex-col items-center justify-center p-12 rounded-lg border border-dashed text-center",
          isDark 
            ? "border-zinc-800 bg-zinc-900/30" 
            : "border-gray-200 bg-gray-50/30"
        )}>
          <h3 className={cn(
            "text-lg font-medium mb-2",
            isDark ? "text-zinc-300" : "text-gray-700"
          )}>
            Your dashboard is empty
          </h3>
          <p className={cn(
            "text-sm mb-4 max-w-md",
            isDark ? "text-zinc-400" : "text-gray-500"
          )}>
            Add widgets to create your personalized dashboard
          </p>
          <Button onClick={onAddWidget} className="gap-1">
            <Plus size={16} />
            Add Your First Widget
          </Button>
        </div>
      )}
    </div>
  );
} 