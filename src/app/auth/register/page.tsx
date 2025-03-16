'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthCard, FormInput, SubmitButton } from '@/components/auth';
import { registerSchema, RegisterFormValues } from '@/lib/schemas/auth-schemas';
import { AuthService } from '@/services/auth-service';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  // Initialize react-hook-form with zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (formData: RegisterFormValues) => {
    setLoading(true);
    setServerError(null);
    setMessage(null);

    try {
      const { error, isExistingUser } = await AuthService.signUp(formData);

      if (error) {
        setServerError(error.message);
        return;
      }
      
      // Check if email confirmation is required
      if (isExistingUser) {
        setMessage('This email is already registered. Please sign in instead.');
      } else {
        setMessage('Registration successful! Please check your email for confirmation.');
      }
      
    } catch (error: any) {
      console.error('Unexpected registration error:', error);
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard 
      title="Create a new account"
      subtitle={
        <>
          Or{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            sign in to your account
          </Link>
        </>
      }
      error={serverError}
      success={message}
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
          />

          <FormInput
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password}
            description="Password must be at least 6 characters long, include uppercase, lowercase, and numbers"
            {...register('password')}
          />
        </div>

        <SubmitButton
          isLoading={loading}
          loadingText="Creating account..."
        >
          Create account
        </SubmitButton>
      </form>
    </AuthCard>
  );
} 