'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
import { LogOut, UserRound, Mail, Phone, Building, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Extract profile information from user object
  const email = user?.email || 'No email available';
  const name = user?.user_metadata?.name || email.split('@')[0];
  const role = user?.app_metadata?.role || 'User';

  return (
    <div className="space-y-6 md:space-y-8 relative z-10 py-2">
      <div className={`backdrop-blur-xl ${
        isDark 
          ? "bg-[rgba(30,30,30,0.6)] border-[rgba(60,60,65,0.55)]" 
          : "bg-[rgba(255,255,255,0.65)] border-[rgba(255,255,255,0.4)]"
      } border rounded-xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.15)]`}>
        <h1 className={`text-2xl font-bold md:text-3xl ${
          isDark ? "text-zinc-100" : "text-gray-800"
        }`}>Your Profile</h1>
        <p className={`mt-2 text-sm md:text-base ${
          isDark ? "text-zinc-400" : "text-gray-600"
        }`}>
          Manage your account information and settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className={`rounded-xl border p-6 shadow-sm ${
          isDark ? "bg-[#1C1C1E] border-zinc-800" : "bg-white border-gray-200"
        }`}>
          <div className="flex flex-col items-center text-center">
            <div className={`flex h-24 w-24 items-center justify-center rounded-full ${
              isDark ? "bg-zinc-800" : "bg-blue-100"
            }`}>
              <UserRound className={`h-12 w-12 ${
                isDark ? "text-zinc-300" : "text-blue-700"
              }`} />
            </div>
            <h2 className={`mt-4 text-xl font-semibold ${
              isDark ? "text-zinc-100" : "text-gray-800"
            }`}>
              {name}
            </h2>
            <p className={`text-sm ${
              isDark ? "text-zinc-400" : "text-gray-500"
            }`}>
              {role}
            </p>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-white transition-colors ${
                isDark 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-red-500 hover:bg-red-600"
              } ${isLoggingOut ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Sign Out"}
            </button>
          </div>
        </div>

        {/* Account Details */}
        <div className={`rounded-xl border p-6 shadow-sm ${
          isDark ? "bg-[#1C1C1E] border-zinc-800" : "bg-white border-gray-200"
        }`}>
          <h2 className={`mb-4 text-lg font-semibold ${
            isDark ? "text-zinc-100" : "text-gray-800"
          }`}>
            Account Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                isDark ? "text-zinc-400" : "text-gray-500"
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? "text-zinc-300" : "text-gray-700"
                }`}>
                  Email
                </p>
                <p className={`text-sm ${
                  isDark ? "text-zinc-400" : "text-gray-500"
                }`}>
                  {email}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                isDark ? "text-zinc-400" : "text-gray-500"
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? "text-zinc-300" : "text-gray-700"
                }`}>
                  Role
                </p>
                <p className={`text-sm ${
                  isDark ? "text-zinc-400" : "text-gray-500"
                }`}>
                  {role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Session Information */}
        <div className={`rounded-xl border p-6 shadow-sm ${
          isDark ? "bg-[#1C1C1E] border-zinc-800" : "bg-white border-gray-200"
        }`}>
          <h2 className={`mb-4 text-lg font-semibold ${
            isDark ? "text-zinc-100" : "text-gray-800"
          }`}>
            Session Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className={`text-sm font-medium ${
                isDark ? "text-zinc-300" : "text-gray-700"
              }`}>
                Last Sign In
              </p>
              <p className={`text-sm ${
                isDark ? "text-zinc-400" : "text-gray-500"
              }`}>
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Not available'}
              </p>
            </div>
            <div>
              <p className={`text-sm font-medium ${
                isDark ? "text-zinc-300" : "text-gray-700"
              }`}>
                Account Created
              </p>
              <p className={`text-sm ${
                isDark ? "text-zinc-400" : "text-gray-500"
              }`}>
                {user?.created_at ? new Date(user.created_at).toLocaleString() : 'Not available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 