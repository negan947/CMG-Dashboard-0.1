import { AuthService } from '../auth-service';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}));

const mockAuth = {
  signInWithPassword: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
  getUser: jest.fn(),
  resetPasswordForEmail: jest.fn(),
  updateUser: jest.fn(),
};

const mockSupabase = {
  auth: mockAuth,
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        limit: jest.fn().mockResolvedValue({ data: [], error: null })
      }))
    }))
  }))
};

beforeEach(() => {
  jest.clearAllMocks();
  (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);
});

describe('AuthService', () => {
  describe('signIn', () => {
    it('should sign in a user successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { user: mockUser };
      const mockResult = { data: { user: mockUser, session: mockSession }, error: null };
      
      mockAuth.signInWithPassword.mockResolvedValue(mockResult);
      
      const result = await AuthService.signIn({ 
        email: 'test@example.com', 
        password: 'password123', 
        rememberMe: false 
      });
      
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result.data).toEqual({ user: mockUser, session: mockSession });
      expect(result.error).toBeNull();
    });
    
    it('should handle sign in errors', async () => {
      const mockError = { message: 'Invalid login credentials', status: 401 };
      const mockResult = { data: { user: null, session: null }, error: mockError };
      
      mockAuth.signInWithPassword.mockResolvedValue(mockResult);
      
      const result = await AuthService.signIn({ 
        email: 'wrong@example.com', 
        password: 'wrongpassword', 
        rememberMe: false 
      });
      
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe('Invalid login credentials');
    });
  });

  describe('signUp', () => {
    it('should sign up a new user successfully', async () => {
      const mockUser = { id: 'user-123', email: 'new@example.com' };
      const mockResult = { 
        data: { user: mockUser, session: null }, 
        error: null 
      };
      
      // Mock checking for existing user (none found)
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue({ data: [], error: null })
          }))
        }))
      });
      
      mockAuth.signUp.mockResolvedValue(mockResult);
      
      const result = await AuthService.signUp({ 
        email: 'new@example.com', 
        password: 'password123',
        confirmPassword: 'password123'
      });
      
      expect(result.data?.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle existing user error', async () => {
      // Mock existing user found
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue({ 
              data: [{ id: 'existing-user' }], 
              error: null 
            })
          }))
        }))
      });
      
      const result = await AuthService.signUp({ 
        email: 'existing@example.com', 
        password: 'password123',
        confirmPassword: 'password123'
      });
      
      expect(result.data).toBeNull();
      expect(result.error?.message).toContain('already exists');
      expect(result.isExistingUser).toBe(true);
    });
  });
  
  describe('signOut', () => {
    it('should sign out a user successfully', async () => {
      const mockResult = { error: null };
      
      mockAuth.signOut.mockResolvedValue(mockResult);
      
      const result = await AuthService.signOut();
      
      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });
  
  describe('getSession', () => {
    it('should get the current session', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { user: mockUser };
      const mockResult = { data: { session: mockSession }, error: null };
      
      mockAuth.getSession.mockResolvedValue(mockResult);
      
      const result = await AuthService.getSession();
      
      expect(mockAuth.getSession).toHaveBeenCalled();
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should handle no session', async () => {
      const mockResult = { data: { session: null }, error: null };
      
      mockAuth.getSession.mockResolvedValue(mockResult);
      
      const result = await AuthService.getSession();
      
      expect(result.session).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should get the current user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockResult = { data: { user: mockUser }, error: null };
      
      mockAuth.getUser.mockResolvedValue(mockResult);
      
      const result = await AuthService.getUser();
      
      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(result.user).toEqual(mockUser);
    });

    it('should handle no user', async () => {
      const mockResult = { data: { user: null }, error: null };
      
      mockAuth.getUser.mockResolvedValue(mockResult);
      
      const result = await AuthService.getUser();
      
      expect(result.user).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockResult = { error: null };
      
      mockAuth.resetPasswordForEmail.mockResolvedValue(mockResult);
      
      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:3000' },
        writable: true
      });
      
      const result = await AuthService.resetPassword({ email: 'test@example.com' });
      
      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'http://localhost:3000/auth/update-password' }
      );
      expect(result.error).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const mockResult = { error: null };
      
      mockAuth.updateUser.mockResolvedValue(mockResult);
      
      const result = await AuthService.updatePassword({ 
        password: 'newpassword123',
        confirmPassword: 'newpassword123'
      });
      
      expect(mockAuth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123'
      });
      expect(result.error).toBeNull();
    });
  });
}); 