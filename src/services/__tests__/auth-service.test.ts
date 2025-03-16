import { AuthService } from '../auth-service';
import { supabase } from '@/lib/supabase-browser';

// Mock Supabase client
jest.mock('@/lib/supabase-browser', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn()
    }
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in a user successfully', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { user: mockUser };
      const mockResult = { data: { user: mockUser, session: mockSession }, error: null };
      
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(mockResult);
      
      // Act
      const result = await AuthService.signIn({ 
        email: 'test@example.com', 
        password: 'password123', 
        rememberMe: false 
      });
      
      // Assert
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result.data).toEqual({ user: mockUser, session: mockSession });
      expect(result.error).toBeNull();
    });
    
    it('should handle sign in errors', async () => {
      // Arrange
      const mockError = { message: 'Invalid login credentials', status: 401 };
      const mockResult = { data: { user: null, session: null }, error: mockError };
      
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(mockResult);
      
      // Act
      const result = await AuthService.signIn({ 
        email: 'wrong@example.com', 
        password: 'wrongpassword', 
        rememberMe: false 
      });
      
      // Assert
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain('incorrect');
    });
  });
  
  describe('signOut', () => {
    it('should sign out a user successfully', async () => {
      // Arrange
      const mockResult = { error: null };
      
      (supabase.auth.signOut as jest.Mock).mockResolvedValue(mockResult);
      
      // Act
      const result = await AuthService.signOut();
      
      // Assert
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });
  
  describe('getSession', () => {
    it('should get the current session', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { user: mockUser };
      const mockResult = { data: { session: mockSession }, error: null };
      
      (supabase.auth.getSession as jest.Mock).mockResolvedValue(mockResult);
      
      // Act
      const result = await AuthService.getSession();
      
      // Assert
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });
  });
}); 