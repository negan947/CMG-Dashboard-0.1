'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthCard, FormInput, SubmitButton } from '@/components/auth';
import { resetPasswordSchema, ResetPasswordFormValues } from '@/lib/schemas/auth-schemas';
import { useAuth } from '@/hooks/use-auth';
import { APP_ROUTES } from '@/lib/constants/routes';
import { Mail } from 'lucide-react';

export default function ResetPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { requestPasswordReset, isLoading, error: authHookError, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  useState(() => {
    if (authHookError) {
      setServerError(authHookError);
    }
  }, [authHookError]);

  useState(() => {
    clearError();
    setServerError(null);
  }, [errors, clearError]);

  const onSubmit = async (formData: ResetPasswordFormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    clearError();

    const { error } = await requestPasswordReset(formData);

    if (error) {
      setServerError(error.message);
    } else {
      setSuccessMessage('If an account with this email exists, password reset instructions have been sent.');
      reset();
    }
  };

  return (
    <AuthCard 
      title="Reset Your Password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      error={serverError || errors.email?.message}
      success={successMessage}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <FormInput
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email}
          {...register('email')}
          leadingIcon={<Mail />}
          showValidState={true}
        />

        <SubmitButton
          isLoading={isLoading}
          loadingText="Sending instructions..."
          fullWidth
        >
          Send Reset Instructions
        </SubmitButton>
      </form>
      <div className="mt-6 text-center">
        <Link href={APP_ROUTES.LOGIN} className="text-sm text-blue-600 hover:underline dark:text-blue-400 hover:opacity-80 transition-opacity duration-150">
          Back to Login
        </Link>
      </div>
    </AuthCard>
  );
} 