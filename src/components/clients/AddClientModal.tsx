import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateClientFormValues, createClientSchema, clientStatusEnum } from '@/lib/schemas/client-schemas';
import { ClientService } from '@/services/client-service';
import { ClientModel } from '@/types/models.types'; // For the onSubmit return type
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface AddClientModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClientAdded: (newClient: ClientModel) => void;
  agencyId: number; // Now required
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Trim hyphen from start of text
    .replace(/-+$/, ''); // Trim hyphen from end of text
}

export function AddClientModal({ isOpen, onOpenChange, onClientAdded, agencyId }: AddClientModalProps) {
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      status: 'active',
      notes: '',
      website: '',
      industry: '',
      companySize: '',
      contactName: '',
      contactPosition: '',
      agencyId: agencyId, // Directly use the required prop
    },
  });

  useEffect(() => {
    // Ensure agencyId is set when prop changes (e.g., if modal stays mounted)
    form.setValue('agencyId', agencyId);
    
    if (!isOpen) {
       form.reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        status: 'active',
        notes: '',
        website: '',
        industry: '',
        companySize: '',
        contactName: '',
        contactPosition: '',
        agencyId: agencyId, // Reset with the current required prop value
      });
    }
  }, [isOpen, agencyId, form]);

  const onSubmitForm = async (values: CreateClientFormValues) => {
    // No need to check !values.agencyId here anymore, as the type and schema require it
    setIsSubmitting(true);
    try {
      const slug = generateSlug(values.name);
      // Ensure the values passed match CreateClientInput & { slug: string }
      const clientDataWithSlug = { ...values, slug, agencyId: agencyId }; 

      const newClient = await ClientService.createClient(clientDataWithSlug);
      toast.success('Client added successfully!');
      onClientAdded(newClient);
      onOpenChange(false); // Close modal
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error(error.message || 'Failed to add client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[600px]", isDark ? "bg-zinc-900" : "bg-white")}>
        <DialogHeader>
          <DialogTitle className={cn(isDark ? "text-zinc-100" : "text-gray-900")}>Add New Client</DialogTitle>
          <DialogDescription className={cn(isDark ? "text-zinc-400" : "text-gray-500")}>
            Fill in the details below to add a new client.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="client@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientStatusEnum.options.map((statusValue) => (
                        <SelectItem key={statusValue} value={statusValue}>
                          {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add other fields as desired, e.g., address, website, notes etc. */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional notes about the client" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className={cn( isDark ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-500 hover:bg-emerald-600" )}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                {isSubmitting ? 'Adding Client...' : 'Add Client'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 