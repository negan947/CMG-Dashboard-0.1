'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  // Simple loading indicator while checking auth
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">Loading...</p>
    </div>
  );
}
