import { TaskService } from '../task-service'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { mockTask } from '@/lib/test-utils'

// Mock the Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}))

const mockedCreateClient = createClientComponentClient as jest.MockedFunction<typeof createClientComponentClient>

const mockSupabase = {
  from: jest.fn(),
  auth: {
    getSession: jest.fn(),
  },
}

const mockQuery = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  single: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  mockedCreateClient.mockReturnValue(mockSupabase as any)
  mockSupabase.from.mockReturnValue(mockQuery)
})

describe('TaskService', () => {
  describe('getTasksByClientId', () => {
    it('should fetch tasks for a specific client', async () => {
      const mockTasks = [mockTask(), mockTask({ id: 2, title: 'Second Task' })]
      const mockProjects = [{ id: 1 }, { id: 2 }]
      
      // First call to from('projects') - simple chain
      const projectsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockProjects, error: null })
      }
      
      // Second call to from('tasks') - complex chain with multiple orders
      // Create a fresh mock for each method in the chain
      const selectMock = jest.fn()
      const inMock = jest.fn()
      const order1Mock = jest.fn()
      const order2Mock = jest.fn()
      const order3Mock = jest.fn()
      
      selectMock.mockReturnValue({ in: inMock })
      inMock.mockReturnValue({ order: order1Mock })
      order1Mock.mockReturnValue({ order: order2Mock })
      order2Mock.mockReturnValue({ order: order3Mock })
      order3Mock.mockResolvedValue({ data: mockTasks, error: null })
      
      const tasksQuery = { select: selectMock }
      
      // Mock from() to return different queries
      mockSupabase.from
        .mockReturnValueOnce(projectsQuery)  // First call - projects
        .mockReturnValueOnce(tasksQuery)     // Second call - tasks

      const result = await TaskService.getTasksByClientId(1)

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Test Task')
    })

    it('should return empty array when no projects found', async () => {
      const projectsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      }
      
      mockSupabase.from.mockReturnValueOnce(projectsQuery)

      const result = await TaskService.getTasksByClientId(1)

      expect(result).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      const projectsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
      }
      
      mockSupabase.from.mockReturnValueOnce(projectsQuery)

      await expect(TaskService.getTasksByClientId(1)).rejects.toThrow()
    })
  })

  describe('getTasksByProjectId', () => {
    it('should fetch tasks for a specific project', async () => {
      const mockTasks = [mockTask(), mockTask({ id: 2, title: 'Second Task' })]
      
      // Create a fresh mock chain for getTasksByProjectId
      const selectMock = jest.fn()
      const eqMock = jest.fn()
      const order1Mock = jest.fn()
      const order2Mock = jest.fn()
      
      selectMock.mockReturnValue({ eq: eqMock })
      eqMock.mockReturnValue({ order: order1Mock })
      order1Mock.mockReturnValue({ order: order2Mock })
      order2Mock.mockResolvedValue({ data: mockTasks, error: null })
      
      const tasksQuery = { select: selectMock }
      
      mockSupabase.from.mockReturnValueOnce(tasksQuery)

      const result = await TaskService.getTasksByProjectId(1)

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks')
      expect(result).toHaveLength(2)
    })
  })

  describe('getTasksByAgencyId', () => {
    it('should fetch tasks for an agency with pagination', async () => {
      const agencyId = 1
      const mockTasks = [mockTask(), mockTask({ id: 2 })]
      
      // Create chain for getTasksByAgencyId (select -> eq -> order -> order -> order -> limit)
      const selectMock = jest.fn()
      const eqMock = jest.fn()
      const order1Mock = jest.fn()
      const order2Mock = jest.fn() 
      const order3Mock = jest.fn()
      const limitMock = jest.fn()
      
      selectMock.mockReturnValue({ eq: eqMock })
      eqMock.mockReturnValue({ order: order1Mock })
      order1Mock.mockReturnValue({ order: order2Mock })
      order2Mock.mockReturnValue({ order: order3Mock })
      order3Mock.mockReturnValue({ limit: limitMock })
      limitMock.mockResolvedValue({ data: mockTasks, error: null })
      
      const tasksQuery = { select: selectMock }
      
      mockSupabase.from.mockReturnValueOnce(tasksQuery)

      const result = await TaskService.getTasksByAgencyId(agencyId)

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks')
      expect(result).toHaveLength(2)
    })
  })

  describe('createTask', () => {
    it('should create a new task successfully', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New description',
        projectId: 1,
        priority: 'high' as const,
        dueDate: '2023-12-31T00:00:00Z',
        agencyId: 1,
        createdByUserId: 'user-1',
      }

      const createdTask = mockTask(newTask)
      
      const insertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: createdTask, error: null })
      }
      
      mockSupabase.from.mockReturnValueOnce(insertQuery)

      const result = await TaskService.createTask(newTask)

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks')
      expect(result.title).toBe(newTask.title)
    })

    it('should handle creation errors', async () => {
      const newTask = {
        title: 'New Task',
        projectId: 1,
        agencyId: 1,
        createdByUserId: 'user-1',
      }

      const insertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Creation failed' } })
      }
      
      mockSupabase.from.mockReturnValueOnce(insertQuery)

      await expect(TaskService.createTask(newTask)).rejects.toThrow()
    })
  })

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const updates = {
        id: 1,
        title: 'Updated Task',
        status: 'completed' as const,
      }

      const updatedTask = mockTask(updates)
      
      const updateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: updatedTask, error: null })
      }
      
      mockSupabase.from.mockReturnValueOnce(updateQuery)

      const result = await TaskService.updateTask(updates)

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks')
      expect(result.title).toBe(updates.title)
    })

    it('should handle update errors', async () => {
      const updates = { id: 1, title: 'Updated Task' }
      
      const updateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Update failed' } })
      }
      
      mockSupabase.from.mockReturnValueOnce(updateQuery)

      await expect(TaskService.updateTask(updates)).rejects.toThrow()
    })
  })

  describe('completeTask', () => {
    it('should mark a task as completed', async () => {
      const taskId = 1
      const completedTask = mockTask({ id: taskId, status: 'completed' })
      
      const updateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: completedTask, error: null })
      }
      
      mockSupabase.from.mockReturnValueOnce(updateQuery)

      const result = await TaskService.completeTask(taskId)

      expect(result.status).toBe('completed')
    })
  })

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const taskId = 1
      
      const deleteQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      }
      
      mockSupabase.from.mockReturnValueOnce(deleteQuery)

      await TaskService.deleteTask(taskId)

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks')
    })

    it('should handle deletion errors', async () => {
      const taskId = 1
      
      const deleteQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'Deletion failed' } })
      }
      
      mockSupabase.from.mockReturnValueOnce(deleteQuery)

      await expect(TaskService.deleteTask(taskId)).rejects.toThrow()
    })
  })
}) 