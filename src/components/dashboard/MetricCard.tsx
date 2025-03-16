import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  change?: {
    value: string;
    isPositive: boolean;
    text?: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  change,
  icon,
  className,
}: MetricCardProps) {
  return (
    <div className={cn("rounded-lg border bg-white p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="rounded-full bg-gray-100 p-2">{icon}</div>}
      </div>
      
      <div className="mt-3">
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      
      {change && (
        <div className="mt-4 flex items-center text-sm">
          <div
            className={cn(
              "flex items-center",
              change.isPositive ? "text-green-500" : "text-red-500"
            )}
          >
            {change.isPositive ? (
              <ArrowUpIcon className="mr-1 h-4 w-4" />
            ) : (
              <ArrowDownIcon className="mr-1 h-4 w-4" />
            )}
            <span>{change.value}</span>
          </div>
          {change.text && <span className="ml-1 text-gray-500">{change.text}</span>}
        </div>
      )}
    </div>
  );
} 