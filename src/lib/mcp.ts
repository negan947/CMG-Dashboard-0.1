/**
 * MCP (Model Context Protocol) client for database access
 * This provides a typed API for interacting with the database
 */

interface SupabaseResponse {
  rows: Record<string, any>[];
  error: any | null;
}

class SupabaseClient {
  /**
   * Executes an SQL query against the Supabase database
   * @param sql The SQL query to execute
   * @param params Optional parameters for the query
   * @returns The query result
   */
  async query(sql: string, params: any[] = []): Promise<SupabaseResponse> {
    try {
      // In production, this will use the MCP server
      // During development, we use the endpoint provided in mcp.json
      const response = await fetch('/api/mcp/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params }),
      });

      if (!response.ok) {
        throw new Error(`Database query failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        rows: result.rows || [],
        error: result.error || null,
      };
    } catch (error) {
      console.error('Supabase query error:', error);
      return {
        rows: [],
        error,
      };
    }
  }
}

// Export MCP singleton with Supabase client
export const MCP = {
  supabase: new SupabaseClient(),
}; 