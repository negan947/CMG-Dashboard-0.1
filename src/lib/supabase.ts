'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../types/supabase';

// Constants for Supabase configuration
const supabaseUrl = 'https://mkmvxrgfjzogxhbzvgxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbXZ4cmdmanpvZ3hoYnp2Z3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MzY5ODAsImV4cCI6MjA1NzUxMjk4MH0.D02rogTgil1lrLmlDZ9FyWFwQODykZkJzV3dEDTzA5M';

export const createClient = () => {
  return createClientComponentClient<Database>({
    supabaseUrl,
    supabaseKey: supabaseAnonKey
  });
};

export default createClient; 