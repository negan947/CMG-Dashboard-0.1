'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { AuthService } from '@/services/auth-service';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await AuthService.resetPassword({ email });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage('Password reset instructions have been sent to your email');
        // Clear the form
        setEmail('');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Reset password error:', err);
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
          <h1 className={cn("text-3xl font-bold", isDark ? "text-zinc-100" : "text-gray-800")}>Reset Password</h1>
          <p className={cn("mt-2", isDark ? "text-zinc-400" : "text-gray-600")}>
            Enter your email to receive password reset instructions
          </p>
        </div>

        {error && (
          <div className={cn(
            "rounded-md p-4 text-sm", 
            isDark ? "bg-red-950/30 text-red-400 border border-red-800/50" : "bg-red-50 text-red-700"
          )}>
            {error}
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

        <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className={cn("block text-sm font-medium", isDark ? "text-zinc-300" : "text-gray-700")}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2",
                isDark 
                  ? "border-zinc-700 bg-zinc-800/70 text-zinc-200 focus:border-blue-600 focus:ring-blue-600/30" 
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              )}
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
              {loading ? 'Sending instructions...' : 'Send reset instructions'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <Link href="/auth/login" className={cn(
            "text-sm hover:underline",
            isDark ? "text-blue-400" : "text-blue-600"
          )}>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
} 