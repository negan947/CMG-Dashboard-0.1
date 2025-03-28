import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '../types/supabase';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Use hardcoded values to ensure consistency
const supabaseUrl = 'https://mkmvxrgfjzogxhbzvgxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbXZ4cmdmanpvZ3hoYnp2Z3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MzY5ODAsImV4cCI6MjA1NzUxMjk4MH0.D02rogTgil1lrLmlDZ9FyWFwQODykZkJzV3dEDTzA5M';

export async function createClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore
  }, {
    supabaseUrl,
    supabaseKey: supabaseAnonKey
  });
}

// Create an admin client that bypasses RLS
export function createAdminClient() {
  // For security, this requires the SUPABASE_SERVICE_ROLE_KEY environment variable
  // This should be set in your project settings in Vercel or other hosting provider
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    throw new Error('Server configuration error');
  }
  
  return createSupabaseClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
} 