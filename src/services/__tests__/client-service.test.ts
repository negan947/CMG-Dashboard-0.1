import { ClientService } from '../client-service';
import { MCP } from '@/lib/mcp';

// Mock MCP to avoid actual database calls
jest.mock('@/lib/mcp', () => ({
  MCP: {
    supabase: {
      query: jest.fn()
    }
  }
}));

describe('ClientService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClients', () => {
    it('should return all clients when no agencyId provided', async () => {
      const mockRows = [
        { id: 1, name: 'Client 1', slug: 'client-1', agency_id: 1, created_at: new Date() },
        { id: 2, name: 'Client 2', slug: 'client-2', agency_id: 2, created_at: new Date() }
      ];

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: mockRows
      });

      const clients = await ClientService.getClients();

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        'SELECT * FROM clients ORDER BY name',
        []
      );
      expect(clients).toHaveLength(2);
      expect(clients[0].id).toBe(1);
      expect(clients[0].name).toBe('Client 1');
      expect(clients[1].id).toBe(2);
      expect(clients[1].name).toBe('Client 2');
    });

    it('should filter clients by agencyId when provided', async () => {
      const mockRows = [
        { id: 1, name: 'Client 1', slug: 'client-1', agency_id: 1, created_at: new Date() }
      ];

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: mockRows
      });

      const clients = await ClientService.getClients(1);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        'SELECT * FROM clients WHERE agency_id = $1 ORDER BY name',
        [1]
      );
      expect(clients).toHaveLength(1);
      expect(clients[0].id).toBe(1);
      expect(clients[0].agencyId).toBe(1);
    });

    it('should handle error', async () => {
      (MCP.supabase.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(ClientService.getClients()).rejects.toThrow('Database error');
    });
  });

  describe('getClientById', () => {
    it('should return client by id', async () => {
      const mockRow = { 
        id: 1, 
        name: 'Client 1', 
        slug: 'client-1', 
        agency_id: 1, 
        created_at: new Date() 
      };

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: [mockRow]
      });

      const client = await ClientService.getClientById(1);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        'SELECT * FROM clients WHERE id = $1',
        [1]
      );
      expect(client).toBeDefined();
      expect(client?.id).toBe(1);
      expect(client?.name).toBe('Client 1');
      expect(client?.agencyId).toBe(1);
    });

    it('should return null if client not found', async () => {
      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: []
      });

      const client = await ClientService.getClientById(999);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        'SELECT * FROM clients WHERE id = $1',
        [999]
      );
      expect(client).toBeNull();
    });
  });

  describe('getClientsByAgencyId', () => {
    it('should return clients for a specific agency', async () => {
      const mockRows = [
        { id: 1, name: 'Client 1', slug: 'client-1', agency_id: 1, created_at: new Date() },
        { id: 3, name: 'Client 3', slug: 'client-3', agency_id: 1, created_at: new Date() }
      ];

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: mockRows
      });

      const clients = await ClientService.getClientsByAgencyId(1);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        'SELECT * FROM clients WHERE agency_id = $1 ORDER BY name',
        [1]
      );
      expect(clients).toHaveLength(2);
      expect(clients[0].id).toBe(1);
      expect(clients[0].agencyId).toBe(1);
      expect(clients[1].id).toBe(3);
      expect(clients[1].agencyId).toBe(1);
    });
  });

  describe('createClient', () => {
    it('should create a new client', async () => {
      const mockClient = {
        name: 'New Client',
        slug: 'new-client',
        agencyId: 1
      };

      const mockResult = {
        id: 1,
        name: 'New Client',
        slug: 'new-client',
        agency_id: 1,
        created_at: new Date()
      };

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: [mockResult]
      });

      const result = await ClientService.createClient(mockClient);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO clients'),
        expect.arrayContaining([
          'New Client',
          'new-client',
          1
        ])
      );
      expect(result.id).toBe(1);
      expect(result.name).toBe('New Client');
      expect(result.slug).toBe('new-client');
      expect(result.agencyId).toBe(1);
    });
  });

  describe('updateClient', () => {
    it('should update an existing client', async () => {
      const mockClient = {
        id: 1,
        name: 'Updated Client',
        slug: 'updated-client',
        agencyId: 2
      };

      const mockResult = {
        id: 1,
        name: 'Updated Client',
        slug: 'updated-client',
        agency_id: 2,
        created_at: new Date()
      };

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: [mockResult]
      });

      const result = await ClientService.updateClient(mockClient);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE clients SET'),
        expect.arrayContaining([
          'Updated Client',
          'updated-client',
          2,
          1
        ])
      );
      expect(result.id).toBe(1);
      expect(result.name).toBe('Updated Client');
      expect(result.slug).toBe('updated-client');
      expect(result.agencyId).toBe(2);
    });

    it('should throw error if client id is missing', async () => {
      const mockClient = {
        name: 'Invalid Client',
        slug: 'invalid-client',
        agencyId: 1
      };

      await expect(ClientService.updateClient(mockClient as any)).rejects.toThrow(
        'Client ID is required for update'
      );
      expect(MCP.supabase.query).not.toHaveBeenCalled();
    });
  });

  describe('deleteClient', () => {
    it('should delete a client', async () => {
      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: []
      });

      await ClientService.deleteClient(1);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        'DELETE FROM clients WHERE id = $1',
        [1]
      );
    });
  });
}); 