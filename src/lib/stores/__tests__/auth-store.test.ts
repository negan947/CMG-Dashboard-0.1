import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '../auth-store';
import { AuthService } from '@/services/auth-service';

// Mock AuthService
jest.mock('@/services/auth-service', () => ({
  AuthService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn(),
    resetPassword: jest.fn(),
    updatePassword: jest.fn()
  }
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset store state between tests
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.clearState();
    });
  });

  describe('signIn', () => {
    it('should update state on successful sign in', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() };
      const mockSession = { user: mockUser, access_token: 'mock-access-token', refresh_token: 'mock-refresh-token', expires_in: 3600, token_type: 'bearer' };
      const mockCredentials = { email: 'test@example.com', password: 'password123', rememberMe: false };
      
      (AuthService.signIn as jest.Mock).mockResolvedValue({ 
        data: { user: mockUser, session: mockSession }, 
        error: null 
      });
      
      const { result } = renderHook(() => useAuthStore());
      
      // Act
      await act(async () => {
        await result.current.signIn(mockCredentials);
      });
      
      // Assert
      expect(AuthService.signIn).toHaveBeenCalledWith(mockCredentials);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
    
    it('should update error state on failed sign in', async () => {
      // Arrange
      const mockCredentials = { email: 'wrong@example.com', password: 'wrong', rememberMe: false };
      const mockError = { message: 'Invalid credentials', statusCode: 401 };
      
      (AuthService.signIn as jest.Mock).mockResolvedValue({ 
        data: null, 
        error: mockError
      });
      
      const { result } = renderHook(() => useAuthStore());
      
      // Act
      await act(async () => {
        await result.current.signIn(mockCredentials);
      });
      
      // Assert
      expect(AuthService.signIn).toHaveBeenCalledWith(mockCredentials);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(mockError.message);
    });
  });

  describe('signOut', () => {
    it('should clear state on successful sign out', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() };
      const mockSession = { user: mockUser, access_token: 'mock-access-token', refresh_token: 'mock-refresh-token', expires_in: 3600, token_type: 'bearer' };
      
      (AuthService.signOut as jest.Mock).mockResolvedValue({ error: null });
      
      const { result } = renderHook(() => useAuthStore());
      
      // Initialize state with a user and session
      act(() => {
        result.current.setUser(mockUser);
        result.current.setSession(mockSession);
      });
      
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      
      // Act
      await act(async () => {
        await result.current.signOut();
      });
      
      // Assert
      expect(AuthService.signOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('initialize', () => {
    it('should set session and user on initialization', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() };
      const mockSession = { user: mockUser, access_token: 'mock-access-token', refresh_token: 'mock-refresh-token', expires_in: 3600, token_type: 'bearer' };
      
      (AuthService.getSession as jest.Mock).mockResolvedValue({ 
        session: mockSession, 
        error: null 
      });
      
      (AuthService.getUser as jest.Mock).mockResolvedValue({ 
        user: mockUser, 
        error: null 
      });
      
      const { result } = renderHook(() => useAuthStore());
      
      // Act
      await act(async () => {
        await result.current.initialize();
      });
      
      // Assert
      expect(AuthService.getSession).toHaveBeenCalled();
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
}); 