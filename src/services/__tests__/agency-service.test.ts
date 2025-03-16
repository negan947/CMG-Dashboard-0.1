import { AgencyService } from '../agency-service';
import { MCP } from '@/lib/mcp';

// Mock MCP to avoid actual database calls
jest.mock('@/lib/mcp', () => ({
  MCP: {
    supabase: {
      query: jest.fn()
    }
  }
}));

describe('AgencyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAgencies', () => {
    it('should return all agencies', async () => {
      const mockRows = [
        { id: 1, name: 'Agency 1', slug: 'agency-1', created_at: new Date() },
        { id: 2, name: 'Agency 2', slug: 'agency-2', created_at: new Date() }
      ];

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: mockRows
      });

      const agencies = await AgencyService.getAgencies();

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM agencies')
      );
      expect(agencies).toHaveLength(2);
      expect(agencies[0].id).toBe(1);
      expect(agencies[0].name).toBe('Agency 1');
      expect(agencies[1].id).toBe(2);
      expect(agencies[1].name).toBe('Agency 2');
    });

    it('should handle empty result', async () => {
      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: []
      });

      const agencies = await AgencyService.getAgencies();

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM agencies')
      );
      expect(agencies).toEqual([]);
    });

    it('should handle error', async () => {
      (MCP.supabase.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(AgencyService.getAgencies()).rejects.toThrow('Database error');
    });
  });

  describe('getAgencyById', () => {
    it('should return agency by id', async () => {
      const mockRow = { id: 1, name: 'Agency 1', slug: 'agency-1', created_at: new Date() };

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: [mockRow]
      });

      const agency = await AgencyService.getAgencyById(1);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM agencies WHERE id = $1'),
        [1]
      );
      expect(agency).toBeDefined();
      expect(agency?.id).toBe(1);
      expect(agency?.name).toBe('Agency 1');
    });

    it('should return null if agency not found', async () => {
      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: []
      });

      const agency = await AgencyService.getAgencyById(999);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM agencies WHERE id = $1'),
        [999]
      );
      expect(agency).toBeNull();
    });
  });

  describe('createAgency', () => {
    it('should create a new agency', async () => {
      const mockAgency = {
        name: 'New Agency',
        slug: 'new-agency'
      };

      const mockResult = {
        id: 1,
        name: 'New Agency',
        slug: 'new-agency',
        created_at: new Date()
      };

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: [mockResult]
      });

      const result = await AgencyService.createAgency(mockAgency);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO agencies'),
        expect.arrayContaining([
          'New Agency',
          'new-agency'
        ])
      );
      expect(result.id).toBe(1);
      expect(result.name).toBe('New Agency');
      expect(result.slug).toBe('new-agency');
    });
  });

  describe('updateAgency', () => {
    it('should update an existing agency', async () => {
      const mockAgency = {
        id: 1,
        name: 'Updated Agency',
        slug: 'updated-agency'
      };

      const mockResult = {
        id: 1,
        name: 'Updated Agency',
        slug: 'updated-agency',
        created_at: new Date()
      };

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: [mockResult]
      });

      const result = await AgencyService.updateAgency(mockAgency);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE agencies SET'),
        expect.arrayContaining([
          'Updated Agency',
          'updated-agency',
          1
        ])
      );
      expect(result.id).toBe(1);
      expect(result.name).toBe('Updated Agency');
      expect(result.slug).toBe('updated-agency');
    });

    it('should throw error if agency id is missing', async () => {
      const mockAgency = {
        name: 'Invalid Agency',
        slug: 'invalid-agency'
      };

      await expect(AgencyService.updateAgency(mockAgency as any)).rejects.toThrow(
        'Agency ID is required for update'
      );
      expect(MCP.supabase.query).not.toHaveBeenCalled();
    });
  });

  describe('deleteAgency', () => {
    it('should delete an agency', async () => {
      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: []
      });

      await AgencyService.deleteAgency(1);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM agencies WHERE id = $1'),
        [1]
      );
    });
  });
}); 