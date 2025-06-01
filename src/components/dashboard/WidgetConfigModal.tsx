'use client';

import { availableWidgets } from './widgets/registry';
import { UserWidget } from './widgets/types';

interface WidgetConfigModalProps {
  widget: UserWidget | null;
  onClose: () => void;
  onSave: (id: string, newConfig: Record<string, any>) => void;
}

export function WidgetConfigModal({ widget, onClose, onSave }: WidgetConfigModalProps) {
  if (!widget) return null;
  
  const widgetDef = availableWidgets[widget.type];
  
  if (!widgetDef || !widgetDef.configComponent) {
    console.error(`Widget type ${widget.type} not found or has no config component`);
    return null;
  }
  
  const ConfigComponent = widgetDef.configComponent;
  
  return (
    <ConfigComponent
      id={widget.id}
      config={widget.config}
      onChange={(newConfig) => onSave(widget.id, newConfig)}
      onClose={onClose}
    />
  );
} 