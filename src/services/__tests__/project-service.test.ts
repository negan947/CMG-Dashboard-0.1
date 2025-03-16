import { ProjectService } from '../project-service';
import { MCP } from '@/lib/mcp';

// Mock MCP to avoid actual database calls
jest.mock('@/lib/mcp', () => ({
  MCP: {
    supabase: {
      query: jest.fn()
    }
  }
}));

describe('ProjectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should return all projects when no clientId provided', async () => {
      const mockRows = [
        { 
          id: 1, 
          name: 'Project 1', 
          slug: 'project-1', 
          description: 'Description 1',
          client_id: 1, 
          status: 'active',
          created_at: new Date() 
        },
        { 
          id: 2, 
          name: 'Project 2', 
          slug: 'project-2', 
          description: 'Description 2',
          client_id: 2, 
          status: 'active',
          created_at: new Date() 
        }
      ];

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: mockRows
      });

      const projects = await ProjectService.getProjects();

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        'SELECT * FROM projects ORDER BY name',
        []
      );
      expect(projects).toHaveLength(2);
      expect(projects[0].id).toBe(1);
      expect(projects[0].name).toBe('Project 1');
      expect(projects[1].id).toBe(2);
      expect(projects[1].name).toBe('Project 2');
    });

    it('should filter projects by clientId when provided', async () => {
      const mockRows = [
        { 
          id: 1, 
          name: 'Project 1', 
          slug: 'project-1', 
          description: 'Description 1',
          client_id: 1, 
          status: 'active',
          created_at: new Date() 
        }
      ];

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: mockRows
      });

      const projects = await ProjectService.getProjects(1);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        'SELECT * FROM projects WHERE client_id = $1 ORDER BY name',
        [1]
      );
      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe(1);
      expect(projects[0].clientId).toBe(1);
    });

    it('should handle error', async () => {
      (MCP.supabase.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(ProjectService.getProjects()).rejects.toThrow('Database error');
    });
  });

  describe('getProjectById', () => {
    it('should return project by id', async () => {
      const mockRow = { 
        id: 1, 
        name: 'Project 1', 
        slug: 'project-1', 
        description: 'Description 1',
        client_id: 1, 
        status: 'active',
        created_at: new Date() 
      };

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: [mockRow]
      });

      const project = await ProjectService.getProjectById(1);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        'SELECT * FROM projects WHERE id = $1',
        [1]
      );
      expect(project).toBeDefined();
      expect(project?.id).toBe(1);
      expect(project?.name).toBe('Project 1');
      expect(project?.clientId).toBe(1);
    });

    it('should return null if project not found', async () => {
      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: []
      });

      const project = await ProjectService.getProjectById(999);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        'SELECT * FROM projects WHERE id = $1',
        [999]
      );
      expect(project).toBeNull();
    });
  });

  describe('getProjectsByClientId', () => {
    it('should return projects for a specific client', async () => {
      const mockRows = [
        { 
          id: 1, 
          name: 'Project 1', 
          slug: 'project-1', 
          description: 'Description 1',
          client_id: 1, 
          status: 'active',
          created_at: new Date() 
        },
        { 
          id: 3, 
          name: 'Project 3', 
          slug: 'project-3', 
          description: 'Description 3',
          client_id: 1, 
          status: 'active',
          created_at: new Date() 
        }
      ];

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: mockRows
      });

      const projects = await ProjectService.getProjectsByClientId(1);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        'SELECT * FROM projects WHERE client_id = $1 ORDER BY name',
        [1]
      );
      expect(projects).toHaveLength(2);
      expect(projects[0].id).toBe(1);
      expect(projects[0].clientId).toBe(1);
      expect(projects[1].id).toBe(3);
      expect(projects[1].clientId).toBe(1);
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const mockProject = {
        name: 'New Project',
        slug: 'new-project',
        description: 'New project description',
        clientId: 1,
        status: 'active'
      };

      const mockResult = {
        id: 1,
        name: 'New Project',
        slug: 'new-project',
        description: 'New project description',
        client_id: 1,
        status: 'active',
        created_at: new Date()
      };

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: [mockResult]
      });

      const result = await ProjectService.createProject(mockProject);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO projects'),
        expect.arrayContaining([
          'New Project',
          'new-project',
          'New project description',
          1,
          'active'
        ])
      );
      expect(result.id).toBe(1);
      expect(result.name).toBe('New Project');
      expect(result.slug).toBe('new-project');
      expect(result.description).toBe('New project description');
      expect(result.clientId).toBe(1);
      expect(result.status).toBe('active');
    });

    it('should use default active status when not provided', async () => {
      const mockProject = {
        name: 'New Project',
        slug: 'new-project',
        description: 'New project description',
        clientId: 1
      };

      const mockResult = {
        id: 1,
        name: 'New Project',
        slug: 'new-project',
        description: 'New project description',
        client_id: 1,
        status: 'active',
        created_at: new Date()
      };

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: [mockResult]
      });

      await ProjectService.createProject(mockProject);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO projects'),
        expect.arrayContaining([
          'New Project',
          'new-project',
          'New project description',
          1,
          'active'
        ])
      );
    });
  });

  describe('updateProject', () => {
    it('should update an existing project', async () => {
      const mockProject = {
        id: 1,
        name: 'Updated Project',
        slug: 'updated-project',
        description: 'Updated description',
        clientId: 2,
        status: 'completed'
      };

      const mockResult = {
        id: 1,
        name: 'Updated Project',
        slug: 'updated-project',
        description: 'Updated description',
        client_id: 2,
        status: 'completed',
        created_at: new Date()
      };

      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: [mockResult]
      });

      const result = await ProjectService.updateProject(mockProject);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE projects SET'),
        expect.arrayContaining([
          'Updated Project',
          'updated-project',
          'Updated description',
          2,
          'completed',
          1
        ])
      );
      expect(result.id).toBe(1);
      expect(result.name).toBe('Updated Project');
      expect(result.slug).toBe('updated-project');
      expect(result.description).toBe('Updated description');
      expect(result.clientId).toBe(2);
      expect(result.status).toBe('completed');
    });

    it('should throw error if project id is missing', async () => {
      const mockProject = {
        name: 'Invalid Project',
        slug: 'invalid-project',
        description: 'Invalid description',
        clientId: 1
      };

      await expect(ProjectService.updateProject(mockProject as any)).rejects.toThrow(
        'Project ID is required for update'
      );
      expect(MCP.supabase.query).not.toHaveBeenCalled();
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      (MCP.supabase.query as jest.Mock).mockResolvedValue({
        rows: []
      });

      await ProjectService.deleteProject(1);

      expect(MCP.supabase.query).toHaveBeenCalledWith(
        'DELETE FROM projects WHERE id = $1',
        [1]
      );
    });
  });
}); 