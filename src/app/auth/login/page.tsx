'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthCard, FormInput, FormCheckbox, SubmitButton } from '@/components/auth';
import { loginSchema, LoginFormValues } from '@/lib/schemas/auth-schemas';
import { useAuth } from '@/hooks/use-auth';

export default function Login() {
  const [serverError, setServerError] = useState<string | null>(null);
  const { login, error: authError, isLoading, clearError } = useAuth();

  // Clear any previous auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Update server error when auth store error changes
  useEffect(() => {
    if (authError) {
      setServerError(authError);
    }
  }, [authError]);

  // Initialize react-hook-form with zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (formData: LoginFormValues) => {
    setServerError(null);
    
    try {
      const { error } = await login(formData);
      
      if (error) {
        setServerError(error.message);
      }
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <AuthCard 
      title="Sign in to your account"
      subtitle={
        <>
          Or{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            create a new account
          </Link>
        </>
      }
      error={serverError}
      errorType={serverError?.toLowerCase().includes('network') ? 'network' : 'auth'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div className="space-y-4">
          <FormInput
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            error={errors.email}
            {...register('email')}
            showValidState={true}
          />

          <FormInput
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password}
            {...register('password')}
          />
        </div>

        <div className="flex items-center justify-between">
          <FormCheckbox
            id="rememberMe"
            label="Remember me"
            {...register('rememberMe')}
          />

          <div className="text-sm">
            <Link href="/auth/reset-password" className="text-blue-600 hover:underline">
              Forgot your password?
            </Link>
          </div>
        </div>

        <SubmitButton
          isLoading={isLoading}
          loadingText="Signing in..."
        >
          Sign in
        </SubmitButton>
      </form>
    </AuthCard>
  );
} 