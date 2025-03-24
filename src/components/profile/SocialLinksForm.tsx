import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { socialLinksSchema, SocialLinksFormValues } from '@/lib/schemas/profile-schemas';
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
import { Button } from '@/components/ui/button';
import { 
  Linkedin, 
  Twitter, 
  Github, 
  Globe, 
  Facebook, 
  Instagram 
} from 'lucide-react';

interface SocialLinksFormProps {
  initialData?: any;
  onSubmit: (data: SocialLinksFormValues) => Promise<{ success: boolean }>;
}

export function SocialLinksForm({ initialData = {}, onSubmit }: SocialLinksFormProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ensure initialData is not null or undefined
  const safeInitialData = initialData || {};
  
  // Set up form with validation
  const form = useForm<SocialLinksFormValues>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      linkedin: safeInitialData.linkedin || '',
      twitter: safeInitialData.twitter || '',
      facebook: safeInitialData.facebook || '',
      instagram: safeInitialData.instagram || '',
      github: safeInitialData.github || '',
      website: safeInitialData.website || '',
    }
  });
  
  // Handle form submission
  const handleSubmit = async (data: SocialLinksFormValues) => {
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
            name="linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/in/username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://twitter.com/username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://facebook.com/username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://instagram.com/username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="github"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://github.com/username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://yourwebsite.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={cn(
              "min-w-[120px]",
              isDark 
                ? "bg-indigo-600 hover:bg-indigo-700" 
                : "bg-indigo-500 hover:bg-indigo-600"
            )}
          >
            {isSubmitting ? 'Saving...' : 'Save Links'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 