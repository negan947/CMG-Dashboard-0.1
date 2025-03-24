import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generalSettingsSchema, GeneralSettingsFormValues } from '@/lib/schemas/settings-schemas';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
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
import { 
  Building, 
  Mail, 
  Globe, 
  Phone, 
  DollarSign, 
  Globe2,
  Clock,
  Calendar
} from 'lucide-react';

interface GeneralSettingsFormProps {
  initialData?: any;
  onSubmit: (data: GeneralSettingsFormValues) => Promise<{ success: boolean }>;
}

export function GeneralSettingsForm({ initialData = {}, onSubmit }: GeneralSettingsFormProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ensure initialData is not null or undefined
  const safeInitialData = initialData || {};
  
  // Set up form with validation
  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      agency_name: safeInitialData.agency_name || '',
      agency_email: safeInitialData.agency_email || '',
      agency_logo_url: safeInitialData.agency_logo_url || '',
      agency_website: safeInitialData.agency_website || '',
      agency_phone: safeInitialData.agency_phone || '',
      default_currency: safeInitialData.default_currency || 'USD',
      timezone: safeInitialData.timezone || '',
      date_format: safeInitialData.date_format || 'MM/DD/YYYY',
      time_format: safeInitialData.time_format || '12h',
    }
  });
  
  // Handle form submission
  const handleSubmit = async (data: GeneralSettingsFormValues) => {
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
        <div className="space-y-4">
          <h3 className={cn(
            "text-lg font-medium",
            isDark ? "text-zinc-200" : "text-gray-700"
          )}>
            Agency Information
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="agency_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Agency Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your agency name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="agency_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Agency Email
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your agency email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="agency_website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Agency Website
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://youragency.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="agency_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Agency Phone
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your agency phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="agency_logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Agency Logo URL
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://youragency.com/logo.png" {...field} />
                </FormControl>
                <FormDescription>
                  URL to your agency logo image (will be displayed in the dashboard)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <h3 className={cn(
            "text-lg font-medium",
            isDark ? "text-zinc-200" : "text-gray-700"
          )}>
            Regional Settings
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="default_currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Default Currency
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                      <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Globe2 className="h-4 w-4" />
                    Timezone
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. America/New_York" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="date_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Format
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Format
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
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
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 