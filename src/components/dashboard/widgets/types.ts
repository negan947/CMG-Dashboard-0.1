export interface WidgetProps {
  id: string;
  config: Record<string, any>;
  isEditing: boolean;
  onConfigChange?: (id: string) => void;
  onRemove?: () => void;
}

export interface WidgetConfigProps {
  id: string;
  config: Record<string, any>;
  onChange: (newConfig: Record<string, any>) => void;
  onClose: () => void;
}

export interface UserWidget {
  id: string;
  type: string;
  config: Record<string, any>;
  gridPosition: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface WidgetEditControlsProps {
  onConfigure: () => void;
  onRemove: () => void;
} 