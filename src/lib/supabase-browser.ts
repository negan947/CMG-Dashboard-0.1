import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Create a single supabase client for interacting with your database in client components
export const supabase = createClientComponentClient({
  supabaseUrl: 'https://mkmvxrgfjzogxhbzvgxk.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbXZ4cmdmanpvZ3hoYnp2Z3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MzY5ODAsImV4cCI6MjA1NzUxMjk4MH0.D02rogTgil1lrLmlDZ9FyWFwQODykZkJzV3dEDTzA5M'
}) 