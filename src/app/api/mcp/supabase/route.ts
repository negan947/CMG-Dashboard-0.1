import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
const supabaseUrl = 'https://mkmvxrgfjzogxhbzvgxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbXZ4cmdmanpvZ3hoYnp2Z3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MzY5ODAsImV4cCI6MjA1NzUxMjk4MH0.D02rogTgil1lrLmlDZ9FyWFwQODykZkJzV3dEDTzA5M';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * API endpoint for executing SQL queries against Supabase
 * This allows secure access to the database from client components
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { sql, params = [] } = await request.json();

    // Validate request
    if (!sql) {
      return NextResponse.json(
        { error: 'SQL query is required' },
        { status: 400 }
      );
    }

    // Execute the query using the Supabase client
    const { data, error } = await supabase.rpc('execute_sql', {
      query_text: sql,
      query_params: params,
    });

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Return the query results
    return NextResponse.json({ rows: data });
  } catch (error) {
    console.error('Error in Supabase API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 