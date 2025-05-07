'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { AuthService } from '@/services/auth-service';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import { APP_ROUTES } from '@/lib/constants/routes';
import { FormInput } from '@/components/auth';
import { updatePasswordSchema, UpdatePasswordFormValues } from '@/lib/schemas/auth-schemas';
import { Lock } from 'lucide-react';

// Loading fallback component
function UpdatePasswordFallback() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={cn(
      "flex min-h-screen flex-col items-center justify-center p-8",
      isDark ? "bg-gradient-to-br from-[#0F0F12] via-[#171720] to-[#1C1C25]" : "bg-gradient-to-br from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF]"
    )}>
      <div className={cn(
        "w-full max-w-md space-y-8 rounded-lg border p-8 shadow-md flex justify-center items-center",
        isDark 
          ? "border-zinc-800/40 bg-zinc-900/70 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.2)]" 
          : "border-gray-200 bg-white/90 backdrop-blur-sm shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
      )}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent text-blue-600" />
        <span className="ml-2">Loading...</span>
      </div>
    </div>
  );
}

// Main component wrapped with suspense
function UpdatePasswordContent() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('password');

  useEffect(() => {
    if (!searchParams?.has('code')) {
      setServerError('Invalid or missing password reset link. Please request a new password reset link.');
    }
  }, [searchParams]);

  const onSubmit = async (formData: UpdatePasswordFormValues) => {
    setLoading(true);
    setServerError(null);
    setSuccessMessage(null);
    
    try {
      const { error: authServiceError } = await AuthService.updatePassword(formData);
      
      if (authServiceError) {
        setServerError(authServiceError.message || 'Failed to update password.');
      } else {
        setSuccessMessage('Your password has been updated successfully.');
        setTimeout(() => {
          router.push(APP_ROUTES.LOGIN);
        }, 3000);
      }
    } catch (err: any) {
      setServerError('An unexpected error occurred. Please try again.');
      console.error('Update password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "flex min-h-screen flex-col items-center justify-center p-8",
      isDark ? "bg-gradient-to-br from-[#0F0F12] via-[#171720] to-[#1C1C25]" : "bg-gradient-to-br from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF]"
    )}>
      <div className={cn(
        "w-full max-w-md space-y-8 rounded-lg border p-8 shadow-md",
        isDark 
          ? "border-zinc-800/40 bg-zinc-900/70 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.2)]" 
          : "border-gray-200 bg-white/90 backdrop-blur-sm shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
      )}>
        <div className="text-center">
          <h1 className={cn("text-3xl font-bold", isDark ? "text-zinc-100" : "text-gray-800")}>Update Password</h1>
          <p className={cn("mt-2", isDark ? "text-zinc-400" : "text-gray-600")}>
            Create a new password for your account
          </p>
        </div>

        {serverError && (
          <div className={cn(
            "rounded-md p-4 text-sm", 
            isDark ? "bg-red-950/30 text-red-400 border border-red-800/50" : "bg-red-50 text-red-700"
          )}>
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className={cn(
            "rounded-md p-4 text-sm", 
            isDark ? "bg-green-950/30 text-green-400 border border-green-800/50" : "bg-green-50 text-green-700"
          )}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <FormInput
              id="password"
              label="New Password"
              type="password"
              autoComplete="new-password"
              canTogglePassword={true}
              error={errors.password}
              {...register('password')}
              leadingIcon={<Lock />}
            />
            <PasswordStrengthIndicator password={newPasswordValue} />

            <FormInput
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              canTogglePassword={true}
              error={errors.confirmPassword}
              {...register('confirmPassword')}
              leadingIcon={<Lock />}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "group relative flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 disabled:opacity-50",
                isDark 
                  ? "bg-blue-600 hover:bg-blue-500 focus:ring-blue-600 focus:ring-offset-1 focus:ring-offset-zinc-900 border-none" 
                  : "border border-transparent bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-2"
              )}
            >
              {loading ? 'Updating password...' : 'Update password'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <Link href={APP_ROUTES.LOGIN} className={cn(
            "text-sm hover:underline hover:opacity-80 transition-opacity duration-150",
            isDark ? "text-blue-400" : "text-blue-600"
          )}>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main export - with Suspense boundary
export default function UpdatePassword() {
  return (
    <Suspense fallback={<UpdatePasswordFallback />}>
      <UpdatePasswordContent />
    </Suspense>
  );
} 