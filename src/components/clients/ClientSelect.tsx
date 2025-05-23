import { useState, useEffect } from 'react';
import { useClients } from '@/hooks/use-clients';
import { ClientModel } from '@/types/models.types';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Check, ChevronsUpDown, Loader2, User } from 'lucide-react';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ClientSelectProps {
  selectedClient: ClientModel | null;
  onClientSelect: (client: ClientModel) => void;
  className?: string;
}

export function ClientSelect({ selectedClient, onClientSelect, className }: ClientSelectProps) {
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  const { clients, isLoading, error } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.contactName && client.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn("w-full justify-between", className)}
        >
          {selectedClient ? (
            <div className="flex items-center">
              {selectedClient.avatarUrl ? (
                <img
                  src={selectedClient.avatarUrl}
                  alt={selectedClient.name}
                  className="w-6 h-6 rounded-full mr-2 object-cover"
                />
              ) : (
                <User className="w-5 h-5 mr-2 text-muted-foreground" />
              )}
              <span className="truncate">{selectedClient.name}</span>
            </div>
          ) : (
            "Select client..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-[300px] p-0",
          isDark ? "bg-zinc-900 border-zinc-800" : ""
        )}
      >
        <div className="p-2">
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "h-9 mb-2",
              isDark ? "bg-zinc-800/70" : ""
            )}
          />
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading clients...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-red-500">
            {error}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No clients found
          </div>
        ) : (
          <div className={cn(
            "max-h-[300px] overflow-y-auto",
            isDark ? "scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800" : "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          )}>
            {filteredClients.map(client => (
              <div
                key={client.id}
                className={cn(
                  "flex items-center px-2 py-2 cursor-pointer hover:bg-accent",
                  selectedClient?.id === client.id ? "bg-accent/50" : "",
                  "transition-colors duration-150"
                )}
                onClick={() => {
                  onClientSelect(client);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center flex-1">
                  {client.avatarUrl ? (
                    <img
                      src={client.avatarUrl}
                      alt={client.name}
                      className="w-8 h-8 rounded-full mr-3 object-cover"
                    />
                  ) : (
                    <div className={cn(
                      "w-8 h-8 rounded-full mr-3 flex items-center justify-center",
                      isDark ? "bg-zinc-800" : "bg-gray-200"
                    )}>
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{client.name}</span>
                    {client.email && (
                      <span className="text-xs text-muted-foreground">{client.email}</span>
                    )}
                  </div>
                </div>
                {selectedClient?.id === client.id && (
                  <Check className="h-4 w-4 mr-2 text-primary" />
                )}
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
} 