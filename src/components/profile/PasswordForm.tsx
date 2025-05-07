import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordChangeSchema, PasswordChangeFormValues } from '@/lib/schemas/profile-schemas';
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
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface PasswordFormProps {
  onSubmit: (data: PasswordChangeFormValues) => Promise<{ success: boolean }>;
}

export function PasswordForm({ onSubmit }: PasswordFormProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Set up form with validation
  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    }
  });
  
  // Handle form submission
  const handleSubmit = async (data: PasswordChangeFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await onSubmit(data);
      
      if (response.success) {
        // Reset form on success
        form.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="current_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Current Password
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showCurrentPassword ? "text" : "password"} 
                    placeholder="Enter your current password" 
                    {...field} 
                  />
                </FormControl>
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="new_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                New Password
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showNewPassword ? "text" : "password"} 
                    placeholder="Enter new password" 
                    {...field} 
                  />
                </FormControl>
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirm New Password
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm your new password" 
                    {...field} 
                  />
                </FormControl>
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-2">
          <ul className={cn(
            "list-disc pl-5 text-sm",
            isDark ? "text-zinc-400" : "text-gray-600"
          )}>
            <li>Password must be at least 8 characters long</li>
            <li>Include at least one uppercase letter</li>
            <li>Include at least one number</li>
            <li>Include at least one special character</li>
          </ul>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={cn(
              "min-w-[160px] flex items-center justify-center",
              isDark 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-red-500 hover:bg-red-600"
            )}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            {isSubmitting ? 'Changing...' : 'Change Password'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 