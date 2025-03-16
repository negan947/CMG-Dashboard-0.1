'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

interface AuthContextValue {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isInitialized: false });

/**
 * Context provider that initializes auth state on application start
 * and provides initialization status
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const initialize = useAuthStore(state => state.initialize);

  useEffect(() => {
    const initAuth = async () => {
      await initialize();
      setIsInitialized(true);
    };

    initAuth();
  }, [initialize]);

  return (
    <AuthContext.Provider value={{ isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth initialization status
 */
export function useAuthContext() {
  return useContext(AuthContext);
} 