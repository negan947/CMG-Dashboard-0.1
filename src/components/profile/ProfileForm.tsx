import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileUpdateSchema, ProfileUpdateFormValues } from '@/lib/schemas/profile-schemas';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
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
import { UserRound, Briefcase, Phone, MapPin, Building, Clock } from 'lucide-react';

interface ProfileFormProps {
  initialData?: any;
  onSubmit: (data: ProfileUpdateFormValues) => Promise<{ success: boolean }>;
}

export function ProfileForm({ initialData = {}, onSubmit }: ProfileFormProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ensure initialData is not null or undefined
  const safeInitialData = initialData || {};
  
  // Set up form with validation
  const form = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: safeInitialData.full_name || '',
      job_title: safeInitialData.job_title || '',
      phone: safeInitialData.phone || '',
      bio: safeInitialData.bio || '',
      department: safeInitialData.department || '',
      location: safeInitialData.location || '',
      timezone: safeInitialData.timezone || '',
    }
  });
  
  // Handle form submission
  const handleSubmit = async (data: ProfileUpdateFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="job_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job Title
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your job title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Department
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your department" {...field} />
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
                <FormLabel className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </FormLabel>
                <FormControl>
                  <Input placeholder="City, Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timezone
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. UTC-5 or Europe/London" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about yourself" 
                  rows={4} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={cn(
              "min-w-[120px]",
              isDark 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-blue-500 hover:bg-blue-600"
            )}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 