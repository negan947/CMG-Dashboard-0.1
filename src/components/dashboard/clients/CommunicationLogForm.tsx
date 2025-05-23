import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CreateCommunicationLogInput } from '@/types/models.types';

// Define the form schema
const formSchema = z.object({
  communicationType: z.enum(['email_sent', 'email_received', 'call_made', 'call_received', 'meeting', 'internal_note'], {
    required_error: 'Please select the type of communication',
  }),
  summary: z.string().min(3, {
    message: 'Summary must be at least 3 characters',
  }).max(255, {
    message: 'Summary cannot exceed 255 characters',
  }),
  metadata: z.any().optional(),
});

// Form type based on schema
type FormValues = z.infer<typeof formSchema>;

interface CommunicationLogFormProps {
  logCommunication: (input: Omit<CreateCommunicationLogInput, 'agencyId' | 'createdByUserId' | 'clientId'>) => Promise<boolean>;
  onSuccess?: () => void;
}

export function CommunicationLogForm({ logCommunication, onSuccess }: CommunicationLogFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Communication type options
  const communicationTypes = [
    { value: 'email_sent', label: 'Email Sent' },
    { value: 'email_received', label: 'Email Received' },
    { value: 'call_made', label: 'Call Made' },
    { value: 'call_received', label: 'Call Received' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'internal_note', label: 'Internal Note' },
  ];
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      communicationType: 'email_sent',
      summary: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      await logCommunication({
        communicationType: values.communicationType,
        summary: values.summary,
        metadata: values.metadata || {},
      });
      
      toast.success("Client interaction logged successfully");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to log interaction");
      console.error('Error logging interaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="communicationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Communication Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {communicationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Brief description of the interaction"
                  disabled={isSubmitting}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Metadata fields could be added here conditionally based on communication type */}
        {form.watch('communicationType') === 'email_sent' && (
          <FormField
            control={form.control}
            name="metadata"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Subject</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Subject line of the email"
                    disabled={isSubmitting}
                    onChange={(e) => {
                      const currentMetadata = field.value || {};
                      field.onChange({
                        ...currentMetadata,
                        subject: e.target.value
                      });
                    }}
                    value={field.value?.subject || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onSuccess?.()} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Interaction'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 