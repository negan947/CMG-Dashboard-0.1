'use client';

import { WidgetProps } from './types';
import { WidgetEditControls } from './WidgetEditControls';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard-service';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define a type for table columns
interface TableColumn {
  key: string;
  label: string;
}

export function DataTableWidget({ id, config, isEditing, onConfigChange, onRemove }: WidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const service = new DashboardService();
  
  // Determine data source
  const dataSource = config.dataSource || 'clients';
  
  // Determine column configuration based on data source
  const getColumns = (): TableColumn[] => {
    switch (dataSource) {
      case 'clients':
        return [
          { key: 'name', label: 'Client Name' },
          { key: 'status', label: 'Status' },
          { key: 'lastActivity', label: 'Last Activity' }
        ];
      case 'projects':
        return [
          { key: 'name', label: 'Project Name' },
          { key: 'clientName', label: 'Client' },
          { key: 'status', label: 'Status' },
          { key: 'dueDate', label: 'Due Date' }
        ];
      case 'invoices':
        return [
          { key: 'invoiceNumber', label: 'Invoice #' },
          { key: 'clientName', label: 'Client' },
          { key: 'amount', label: 'Amount' },
          { key: 'status', label: 'Status' },
          { key: 'dueDate', label: 'Due Date' }
        ];
      case 'tasks':
        return [
          { key: 'title', label: 'Task' },
          { key: 'assignedTo', label: 'Assigned To' },
          { key: 'status', label: 'Status' },
          { key: 'dueDate', label: 'Due Date' }
        ];
      default:
        return [
          { key: 'name', label: 'Name' },
          { key: 'status', label: 'Status' }
        ];
    }
  };

  // Get data from the server
  const { data: tableData, isLoading } = useQuery({
    queryKey: ['table-data', dataSource],
    queryFn: async () => {
      const agencyId = 3; // Default agency ID - would come from context in a real app
      
      switch (dataSource) {
        case 'clients':
          return service.getClientTableData(agencyId);
        case 'projects':
          return service.getProjectTableData(agencyId);
        case 'invoices':
          return service.getInvoiceTableData(agencyId);
        case 'tasks':
          return service.getTaskTableData(agencyId);
        default:
          return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Determine columns from config or data source
  const columns = config.columns || getColumns();
  
  // Get rows to display from config or use default
  const rowsToDisplay = config.rowsToDisplay || 5;

  return (
    <div className="w-full h-full flex flex-col">
      {isEditing && (
        <WidgetEditControls 
          onConfigure={() => onConfigChange?.(id)} 
          onRemove={onRemove || (() => {})} 
        />
      )}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className={cn(
          "text-lg font-semibold mb-2",
          isDark ? "text-zinc-100" : "text-gray-900"
        )}>
          {config.title || "Data Table"}
        </h3>
        
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column: TableColumn) => (
                      <TableHead key={column.key} className="text-xs">
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(tableData || []).slice(0, rowsToDisplay).map((row) => (
                    <TableRow key={row.id}>
                      {columns.map((column: TableColumn) => (
                        <TableCell key={`${row.id}-${column.key}`} className="text-xs py-2">
                          {row[column.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {(!tableData || tableData.length === 0) && (
                <div className={cn(
                  "text-center py-4 text-sm",
                  isDark ? "text-zinc-400" : "text-gray-500"
                )}>
                  No data available
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 