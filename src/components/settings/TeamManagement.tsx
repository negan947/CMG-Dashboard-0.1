import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { teamMemberSchema, TeamMemberFormValues } from '@/lib/schemas/settings-schemas';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Mail, 
  User, 
  Shield, 
  Check, 
  X 
} from 'lucide-react';

interface TeamManagementProps {
  members: any[];
  onInvite: (data: TeamMemberFormValues) => Promise<{ success: boolean }>;
  onUpdate: (memberId: string, data: TeamMemberFormValues) => Promise<{ success: boolean }>;
  onRemove: (memberId: string) => Promise<{ success: boolean }>;
}

export function TeamManagement({ members = [], onInvite, onUpdate, onRemove }: TeamManagementProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  
  // Form for inviting/editing team members
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      email: '',
      name: '',
      role: 'member',
      can_manage_clients: false,
      can_manage_invoices: false,
      can_manage_team: false,
      can_access_reports: true,
    }
  });
  
  // Reset form when closing dialogs
  const resetForm = () => {
    form.reset({
      email: '',
      name: '',
      role: 'member',
      can_manage_clients: false,
      can_manage_invoices: false,
      can_manage_team: false,
      can_access_reports: true,
    });
  };
  
  // Handle inviting a new team member
  const handleInvite = async (data: TeamMemberFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await onInvite(data);
      if (result.success) {
        setShowInviteDialog(false);
        resetForm();
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle editing an existing team member
  const handleUpdate = async (data: TeamMemberFormValues) => {
    if (!editingMember) return;
    
    setIsSubmitting(true);
    try {
      const result = await onUpdate(editingMember.id, data);
      if (result.success) {
        setEditingMember(null);
        resetForm();
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle removing a team member
  const handleRemove = async () => {
    if (!deletingMemberId) return;
    
    setIsSubmitting(true);
    try {
      const result = await onRemove(deletingMemberId);
      if (result.success) {
        setDeletingMemberId(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Edit team member
  const editMember = (member: any) => {
    setEditingMember(member);
    form.reset({
      email: member.email,
      name: member.name,
      role: member.role,
      can_manage_clients: member.can_manage_clients,
      can_manage_invoices: member.can_manage_invoices,
      can_manage_team: member.can_manage_team,
      can_access_reports: member.can_access_reports,
    });
  };
  
  // Get badge color based on role
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'admin':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'member':
        return 'bg-green-500 hover:bg-green-600';
      case 'guest':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 hover:bg-green-600';
      case 'invited':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'inactive':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  // Form component used for both invite and edit
  const TeamMemberForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(editingMember ? handleUpdate : handleInvite)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter email address" 
                      {...field} 
                      disabled={!!editingMember} // Can't edit email for existing member
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <h4 className={cn(
              "text-sm font-medium",
              isDark ? "text-zinc-300" : "text-gray-600"
            )}>
              Permissions
            </h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="can_manage_clients"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Manage Clients
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="can_manage_invoices"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Manage Invoices
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="can_manage_team"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Manage Team
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="can_access_reports"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Access Reports
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowInviteDialog(false);
              setEditingMember(null);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={cn(
              isDark 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-blue-500 hover:bg-blue-600"
            )}
          >
            {isSubmitting ? 'Saving...' : editingMember ? 'Update Member' : 'Invite Member'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={cn(
          "text-lg font-medium",
          isDark ? "text-zinc-200" : "text-gray-700"
        )}>
          Team Members ({members.length})
        </h3>
        
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setShowInviteDialog(true);
              }}
              className={cn(
                isDark 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-green-500 hover:bg-green-600"
              )}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your team. The user will receive an email with instructions to accept.
              </DialogDescription>
            </DialogHeader>
            
            <TeamMemberForm />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update team member details and permissions.
            </DialogDescription>
          </DialogHeader>
          
          <TeamMemberForm />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMemberId} onOpenChange={(open) => !open && setDeletingMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke access for this team member. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-red-500 hover:bg-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Removing...' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Team Members List */}
      <div className={cn(
        "rounded-lg overflow-hidden border",
        isDark ? "border-zinc-700/50" : "border-gray-200/70"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn(
              isDark ? "bg-zinc-800/50" : "bg-gray-50/70"
            )}>
              <tr>
                <th className={cn(
                  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                  isDark ? "text-zinc-300" : "text-gray-500"
                )}>
                  Name / Email
                </th>
                <th className={cn(
                  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                  isDark ? "text-zinc-300" : "text-gray-500"
                )}>
                  Role
                </th>
                <th className={cn(
                  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                  isDark ? "text-zinc-300" : "text-gray-500"
                )}>
                  Status
                </th>
                <th className={cn(
                  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                  isDark ? "text-zinc-300" : "text-gray-500"
                )}>
                  Permissions
                </th>
                <th className={cn(
                  "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider",
                  isDark ? "text-zinc-300" : "text-gray-500"
                )}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={cn(
              "divide-y",
              isDark ? "divide-zinc-700/50 bg-zinc-800/20" : "divide-gray-200 bg-white"
            )}>
              {members.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-center text-sm" colSpan={5}>
                    No team members found. Use the Invite button to add your first member.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-medium",
                          isDark ? "text-zinc-100" : "text-gray-800"
                        )}>
                          {member.name}
                        </span>
                        <span className={cn(
                          "text-sm",
                          isDark ? "text-zinc-400" : "text-gray-500"
                        )}>
                          {member.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn(
                        getRoleBadgeColor(member.role),
                        "capitalize"
                      )}>
                        {member.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn(
                        getStatusBadgeColor(member.status),
                        "capitalize"
                      )}>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {member.can_manage_clients && (
                          <div className={cn(
                            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                            isDark ? "bg-zinc-700 text-zinc-200" : "bg-gray-100 text-gray-700"
                          )}>
                            <Check className="h-3 w-3" />
                            <span>Clients</span>
                          </div>
                        )}
                        {member.can_manage_invoices && (
                          <div className={cn(
                            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                            isDark ? "bg-zinc-700 text-zinc-200" : "bg-gray-100 text-gray-700"
                          )}>
                            <Check className="h-3 w-3" />
                            <span>Invoices</span>
                          </div>
                        )}
                        {member.can_manage_team && (
                          <div className={cn(
                            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                            isDark ? "bg-zinc-700 text-zinc-200" : "bg-gray-100 text-gray-700"
                          )}>
                            <Check className="h-3 w-3" />
                            <span>Team</span>
                          </div>
                        )}
                        {member.can_access_reports && (
                          <div className={cn(
                            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                            isDark ? "bg-zinc-700 text-zinc-200" : "bg-gray-100 text-gray-700"
                          )}>
                            <Check className="h-3 w-3" />
                            <span>Reports</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => editMember(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-red-400 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => setDeletingMemberId(member.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 