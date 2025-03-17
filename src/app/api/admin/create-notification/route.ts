import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Hardcoded values to ensure consistency
const supabaseUrl = 'https://mkmvxrgfjzogxhbzvgxk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbXZ4cmdmanpvZ3hoYnp2Z3hrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTkzNjk4MCwiZXhwIjoyMDU3NTEyOTgwfQ.GpkbA1S7yyCc_oN5hNzts07ZoaN4qVqUQbAWegfIUzw';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { user_id, agency_id, title, content, type, link, read } = requestData;
    
    // Validate required fields
    if (!user_id || !title || !content || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create an admin client with service role key - no authentication needed
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    console.log('Inserting notification for user:', user_id);
    
    // Insert notification using admin client to bypass RLS
    const { data, error } = await adminClient
      .from('notifications')
      .insert({
        user_id,
        agency_id: agency_id || null,
        title,
        content,
        type,
        link: link || null,
        read: read || false,
      })
      .select();
    
    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    console.log('Notification created successfully:', data);
    
    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error - ' + (error as Error).message },
      { status: 500 }
    );
  }
} 