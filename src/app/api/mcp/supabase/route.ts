import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * API endpoint for executing SQL queries against Supabase
 * This allows secure access to the database from client components
 * 
 * SECURITY NOTE: This endpoint should be used sparingly and only for
 * complex queries that cannot be handled by direct Supabase client methods
 */
export async function POST(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const { sql, params = [] } = await request.json();

    // Validate request
    if (!sql || typeof sql !== 'string') {
      return NextResponse.json(
        { error: 'Invalid SQL query' },
        { status: 400 }
      );
    }
    
    // Additional security: Log the query for audit purposes
    console.log(`[MCP Query] User: ${session.user.id}, Query: ${sql.substring(0, 100)}...`);
    
    // Execute the query using the Supabase client with user context
    const { data, error } = await supabase.rpc('execute_sql', {
      query_text: sql,
      query_params: params,
    });

    if (error) {
      console.error('Database query error:', error);
      // Don't expose detailed database errors to client
      return NextResponse.json(
        { error: 'Query execution failed' },
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