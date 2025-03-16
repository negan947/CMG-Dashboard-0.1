'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const { isLoading, isAuthenticated, initializationAttempted, error } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated after auth is initialized
  useEffect(() => {
    if (initializationAttempted && !isLoading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login...");
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, initializationAttempted, router]);

  // Show authentication error if any
  if (error && initializationAttempted) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
          <h1 className="text-xl font-semibold">Authentication Error</h1>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show simplified loading state
  if (!initializationAttempted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the dashboard layout with children
  return <DashboardLayout>{children}</DashboardLayout>;
} 