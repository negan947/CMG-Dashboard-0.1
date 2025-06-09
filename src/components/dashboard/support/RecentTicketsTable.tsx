'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, MessageSquare, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SupportTicketModel, TicketStatus } from '@/types/models.types';
import { format } from 'date-fns';

interface RecentTicketsTableProps {
  tickets: SupportTicketModel[];
}

export function RecentTicketsTable({ tickets }: RecentTicketsTableProps) {
  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary">Open</Badge>;
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'on_hold':
        return <Badge variant="outline">On Hold</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'closed':
        return <Badge variant="destructive">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticket</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell className="font-medium">
                <div className="font-bold">#{ticket.id}</div>
                <div className="text-xs text-muted-foreground">{ticket.title}</div>
            </TableCell>
            <TableCell>{ticket.client?.name || 'N/A'}</TableCell>
            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
            <TableCell>{ticket.assignee?.fullName || 'Unassigned'}</TableCell>
            <TableCell>{format(new Date(ticket.updatedAt), "PP")}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Respond
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Close
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 