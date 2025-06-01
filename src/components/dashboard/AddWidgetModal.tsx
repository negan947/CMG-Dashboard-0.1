'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { availableWidgets } from './widgets/registry';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { UserWidget } from './widgets/types';
import { v4 as uuidv4 } from 'uuid';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widget: UserWidget) => void;
}

export function AddWidgetModal({ isOpen, onClose, onAddWidget }: AddWidgetModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <DialogDescription>
            Select a widget to add to your dashboard
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {Object.values(availableWidgets).map(widget => (
            <div 
              key={widget.id} 
              className={cn(
                "border rounded-lg p-4 cursor-pointer transition-colors",
                isDark 
                  ? "border-zinc-800 hover:bg-zinc-800/50" 
                  : "border-gray-200 hover:bg-gray-50",
                "flex flex-col gap-2"
              )}
              onClick={() => {
                onAddWidget({
                  id: uuidv4(),
                  type: widget.id,
                  config: widget.defaultConfig,
                  gridPosition: {
                    x: 0, 
                    y: 0, 
                    w: widget.defaultSize.w, 
                    h: widget.defaultSize.h
                  }
                });
                onClose();
              }}
            >
              <h3 className={cn(
                "font-medium",
                isDark ? "text-zinc-100" : "text-gray-900"
              )}>
                {widget.name}
              </h3>
              <p className={cn(
                "text-sm",
                isDark ? "text-zinc-400" : "text-gray-500"
              )}>
                {widget.description}
              </p>
              <div className={cn(
                "text-xs mt-auto pt-2",
                isDark ? "text-zinc-500" : "text-gray-400"
              )}>
                Size: {widget.defaultSize.w}x{widget.defaultSize.h}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 