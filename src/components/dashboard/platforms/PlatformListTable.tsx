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
import { MoreHorizontal, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlatformModel } from '@/types/models.types';
import { format } from 'date-fns';

interface PlatformListTableProps {
  platforms: PlatformModel[];
}

export function PlatformListTable({ platforms }: PlatformListTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'disabled':
        return <Badge variant="secondary">Disabled</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Platform</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Sync</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {platforms.map((platform) => (
          <TableRow key={platform.id}>
            <TableCell className="font-medium">{platform.name}</TableCell>
            <TableCell>{getStatusBadge(platform.status)}</TableCell>
            <TableCell>
              {/* This will be dynamic later */}
              {format(new Date(), "PPpp")}
            </TableCell>
            <TableCell>{format(new Date(platform.createdAt), "PP")}</TableCell>
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
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reconnect
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
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