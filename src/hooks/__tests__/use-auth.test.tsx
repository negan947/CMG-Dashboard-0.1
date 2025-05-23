import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../use-auth';
import { useAuthStore } from '@/lib/stores/auth-store';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock auth store
jest.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: jest.fn()
}));

describe('useAuth', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn()
  };
  
  const mockAuthStore = {
    user: null,
    session: null,
    isLoading: false,
    error: null,
    initialize: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    updatePassword: jest.fn(),
    setError: jest.fn(),
    clearState: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    (useRouter as any).mockReturnValue(mockRouter);
    (useAuthStore as any).mockReturnValue(mockAuthStore);
  });
  
  it('should initialize auth state on mount', () => {
    // Act
    renderHook(() => useAuth());
    
    // Assert
    expect(mockAuthStore.initialize).toHaveBeenCalled();
  });
  
  describe('login', () => {
    it('should call signIn and navigate on success', async () => {
      // Arrange
      mockAuthStore.signIn.mockResolvedValue({ error: null });
      const credentials = { email: 'test@example.com', password: 'password123', rememberMe: false };
      
      // Act
      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.login(credentials);
      });
      
      // Assert
      expect(mockAuthStore.signIn).toHaveBeenCalledWith(credentials);
      expect(mockRouter.push).toHaveBeenCalledWith('/');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
    
    it('should not navigate if login fails', async () => {
      // Arrange
      const mockError = { message: 'Invalid credentials', statusCode: 401 };
      mockAuthStore.signIn.mockResolvedValue({ error: mockError });
      const credentials = { email: 'wrong@example.com', password: 'wrong', rememberMe: false };
      
      // Act
      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.login(credentials);
      });
      
      // Assert
      expect(mockAuthStore.signIn).toHaveBeenCalledWith(credentials);
      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(mockRouter.refresh).not.toHaveBeenCalled();
    });
  });
  
  describe('logout', () => {
    it('should call signOut and navigate on success', async () => {
      // Arrange
      mockAuthStore.signOut.mockResolvedValue({ error: null });
      
      // Act
      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.logout();
      });
      
      // Assert
      expect(mockAuthStore.signOut).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });
  
  describe('isAuthenticated', () => {
    it('should return true when user and session exist', () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { user: mockUser };
      
      (useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        user: mockUser,
        session: mockSession
      });
      
      // Act
      const { result } = renderHook(() => useAuth());
      
      // Assert
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    it('should return false when user or session does not exist', () => {
      // Arrange
      (useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        user: null,
        session: null
      });
      
      // Act
      const { result } = renderHook(() => useAuth());
      
      // Assert
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
}); 