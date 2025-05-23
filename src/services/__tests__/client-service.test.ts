import { ClientService } from '../client-service';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { mockClient } from '@/lib/test-utils';

// Mock the Supabase client creation
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(),
}));

const mockSupabase = {
  from: jest.fn(),
  auth: {
    getSession: jest.fn(),
  },
};

const mockQuery = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn(),
  maybeSingle: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  const { createClient } = require('@/lib/supabase');
  (createClient as jest.Mock).mockImplementation(() => mockSupabase);
  mockSupabase.from.mockReturnValue(mockQuery);
});

describe('ClientService', () => {
  describe('getClients', () => {
    it('should fetch all clients when no agencyId provided', async () => {
      const mockClients = [mockClient(), mockClient({ id: 2, name: 'Client 2' })]
      mockQuery.order.mockResolvedValueOnce({ data: mockClients, error: null })

      const result = await ClientService.getClients()

      expect(mockSupabase.from).toHaveBeenCalledWith('clients')
      expect(mockQuery.order).toHaveBeenCalledWith('name')
      expect(result).toHaveLength(2)
    })

    it('should filter by agency when agencyId provided', async () => {
      const mockClients = [mockClient()]
      mockQuery.order.mockResolvedValueOnce({ data: mockClients, error: null })

      const result = await ClientService.getClients(1)

      expect(mockSupabase.from).toHaveBeenCalledWith('clients')
      expect(mockQuery.eq).toHaveBeenCalledWith('agency_id', 1)
      expect(mockQuery.order).toHaveBeenCalledWith('name')
      expect(result).toHaveLength(1)
    })

    it('should handle database errors gracefully', async () => {
      mockQuery.order.mockResolvedValueOnce({ data: null, error: { message: 'Database error' } })

      await expect(ClientService.getClients()).rejects.toThrow()
    })
  })

  describe('getClientById', () => {
    it('should fetch a client by ID', async () => {
      const client = mockClient()
      mockQuery.maybeSingle.mockResolvedValueOnce({ data: client, error: null })

      const result = await ClientService.getClientById(1)

      expect(mockSupabase.from).toHaveBeenCalledWith('clients')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 1)
      expect(result?.id).toBe(1)
    })

    it('should return null when client not found', async () => {
      mockQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null })

      const result = await ClientService.getClientById(999)

      expect(result).toBeNull()
    })

    it('should handle database errors', async () => {
      mockQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'Database error' } })

      await expect(ClientService.getClientById(1)).rejects.toThrow()
    })
  })

  describe('getClientsByAgencyId', () => {
    it('should fetch clients for an agency', async () => {
      const mockClients = [mockClient(), mockClient({ id: 2, name: 'Client 2' })]
      mockQuery.order.mockResolvedValueOnce({ data: mockClients, error: null })

      const result = await ClientService.getClientsByAgencyId(1)

      expect(mockSupabase.from).toHaveBeenCalledWith('clients')
      expect(mockQuery.eq).toHaveBeenCalledWith('agency_id', 1)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Test Client')
    })
  })

  describe('createClient', () => {
    it('should create a new client', async () => {
      const newClient = {
        name: 'New Client',
        slug: 'new-client',
        email: 'new@client.com',
        agencyId: 1,
        createdByUserId: 'user-1',
      }

      const createdClient = mockClient(newClient)
      mockQuery.single.mockResolvedValueOnce({ data: createdClient, error: null })

      const result = await ClientService.createClient(newClient)

      expect(mockSupabase.from).toHaveBeenCalledWith('clients')
      expect(mockQuery.insert).toHaveBeenCalledWith(expect.objectContaining({
        name: newClient.name,
        slug: newClient.slug,
        email: newClient.email,
        agency_id: newClient.agencyId,
      }))
      expect(result.name).toBe(newClient.name)
    })
  })

  describe('updateClient', () => {
    it('should update an existing client', async () => {
      const updates = {
        id: 1,
        name: 'Updated Client',
        email: 'updated@client.com',
      }

      const updatedClient = mockClient(updates)
      mockQuery.single.mockResolvedValueOnce({ data: updatedClient, error: null })

      const result = await ClientService.updateClient(updates)

      expect(mockSupabase.from).toHaveBeenCalledWith('clients')
      expect(mockQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        name: updates.name,
        slug: 'updated-client',
        email: updates.email,
      }))
      expect(mockQuery.eq).toHaveBeenCalledWith('id', updates.id)
      expect(result.name).toBe(updates.name)
    })

    it('should throw error if client id is missing', async () => {
      const updates = {
        name: 'Invalid Client',
        email: 'invalid@client.com',
      }

      await expect(ClientService.updateClient(updates as any)).rejects.toThrow(
        'Client ID is required for update'
      )
    })
  })

  describe('deleteClient', () => {
    it('should delete a client', async () => {
      const clientId = 1
      mockQuery.delete.mockResolvedValueOnce({ data: null, error: null })

      await ClientService.deleteClient(clientId)

      expect(mockSupabase.from).toHaveBeenCalledWith('clients')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', clientId)
    })
    
    it('should handle deletion errors', async () => {
      const clientId = 1
      mockQuery.eq.mockResolvedValueOnce({ data: null, error: { message: 'Deletion failed' } })

      await expect(ClientService.deleteClient(clientId)).rejects.toThrow()
    })
  })
}); 