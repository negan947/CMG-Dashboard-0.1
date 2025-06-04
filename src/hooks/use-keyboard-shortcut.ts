import { useEffect, useCallback } from 'react';

type KeyboardKey = string;
type KeyboardEventHandler = (e: KeyboardEvent) => void;

/**
 * Hook for handling keyboard shortcuts
 * @param key - The keyboard key to listen for (e.g., 'Escape', 'ArrowDown', 'Enter')
 * @param callback - The function to call when the key is pressed
 * @param deps - Optional dependency array for the callback
 */
export function useKeyboardShortcut(
  key: KeyboardKey,
  callback: KeyboardEventHandler,
  deps: any[] = []
): void {
  // Memoize the callback to avoid unnecessary re-renders
  const memoizedCallback = useCallback(callback, deps);

  useEffect(() => {
    // Event handler for keyboard events
    const handler = (e: KeyboardEvent) => {
      if (e.key === key) {
        memoizedCallback(e);
      }
    };

    // Add event listener
    document.addEventListener('keydown', handler);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [key, memoizedCallback]);
}

/**
 * Hook for handling Cmd/Ctrl+K keyboard shortcut commonly used for search
 * @param callback - The function to call when Cmd/Ctrl+K is pressed
 * @param deps - Optional dependency array for the callback
 */
export function useSearchShortcut(
  callback: () => void,
  deps: any[] = []
): void {
  const memoizedCallback = useCallback(callback, deps);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        memoizedCallback();
      }
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [memoizedCallback]);
} 