import { createClient } from '@/lib/supabase';
import { mapDbRow } from '@/lib/data-mapper';
import { PlatformModel, PlatformSyncLogModel } from '@/types/models.types';

export const PlatformService = {
  async getPlatforms(agencyId: number): Promise<PlatformModel[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('platforms')
      .select('*')
      .eq('agency_id', agencyId)
      .order('name');

    if (error) {
      console.error('Error fetching platforms:', error);
      throw new Error('Could not fetch platforms.');
    }

    return data.map(row => mapDbRow(row) as PlatformModel);
  },

  async getPlatformSyncLogs(
    platformId: number,
    startDate: string,
    endDate: string
  ): Promise<PlatformSyncLogModel[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('platform_sync_logs')
      .select('*')
      .eq('platform_id', platformId)
      .gte('sync_start_time', startDate)
      .lte('sync_start_time', endDate)
      .order('sync_start_time', { ascending: false });

    if (error) {
      console.error('Error fetching sync logs:', error);
      throw new Error('Could not fetch sync logs.');
    }

    return data.map(row => mapDbRow(row) as PlatformSyncLogModel);
  },
  
  async getPlatformKpis(agencyId: number) {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_platform_kpis', { p_agency_id: agencyId });

    if (error) {
      console.error('Error fetching platform KPIs:', error);
      throw new Error('Could not fetch platform KPIs.');
    }

    return mapDbRow(data[0]);
  },

  // We will add more methods here for KPIs and other data needs.
}; 