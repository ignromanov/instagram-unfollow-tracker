import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';

/**
 * Custom hook to handle Zustand store hydration
 * Ensures the store has finished loading from localStorage before rendering
 */
export function useHydration() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const _hasHydrated = useAppStore(s => s._hasHydrated);

  useEffect(() => {
    // Check if store has hydrated
    if (_hasHydrated) {
      setHasHydrated(true);
    } else {
      // If not hydrated yet, wait for it
      try {
        const unsubscribe = useAppStore.subscribe(state => {
          if (state._hasHydrated) {
            setHasHydrated(true);
            unsubscribe();
          }
        });

        return unsubscribe;
      } catch (error) {
        // If subscription fails, just set hydrated to true as fallback
        console.warn('[useHydration] Store subscription failed, assuming hydrated:', error);
        setHasHydrated(true);
      }
    }
  }, [_hasHydrated]);

  return hasHydrated;
}
