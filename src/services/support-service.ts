import { createClient } from '@/lib/supabase';
import { mapDbRow } from '@/lib/data-mapper';
import { SupportTicketModel, KnowledgeBaseArticleModel } from '@/types/models.types';

export const SupportService = {
  async getTickets(agencyId: number): Promise<SupportTicketModel[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        client:clients(name),
        assignee:profiles(full_name)
      `)
      .eq('agency_id', agencyId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching support tickets:', error);
      throw new Error('Could not fetch support tickets.');
    }

    return data.map(row => mapDbRow(row) as SupportTicketModel);
  },

  async searchKnowledgeBase(query: string): Promise<KnowledgeBaseArticleModel[]> {
    const supabase = createClient();
    if (!query) return [];

    const { data, error } = await supabase
      .from('knowledge_base_articles')
      .select('*')
      .textSearch('title', query, { type: 'websearch' });
      
    if (error) {
      console.error('Error searching knowledge base:', error);
      throw new Error('Could not search knowledge base.');
    }

    return data.map(row => mapDbRow(row) as KnowledgeBaseArticleModel);
  },
  
  async getSupportKpis(agencyId: number) {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_support_kpis', { p_agency_id: agencyId });

    if (error) {
      console.error('Error fetching support KPIs:', error);
      throw new Error('Could not fetch support KPIs.');
    }

    return data.length > 0 ? mapDbRow(data[0]) : null;
  },
  
  // We will add more methods here for KPIs and other data needs.
}; 