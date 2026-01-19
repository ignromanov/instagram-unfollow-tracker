import { analytics } from '@/lib/analytics';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Track time spent on results page and user engagement.
 * Fires analytics event on unmount or when page becomes hidden.
 *
 * @param accountCount - Total number of accounts being viewed
 * @param isActive - Whether the results are currently being displayed
 */
export function useTimeOnResults(accountCount: number, isActive: boolean) {
  const startTimeRef = useRef<number | null>(null);
  const actionsCountRef = useRef(0);
  const hasFiredRef = useRef(false);

  // Track user actions (filter, search, click)
  const trackAction = useCallback(() => {
    actionsCountRef.current += 1;
  }, []);

  // Fire the analytics event
  const fireEvent = useCallback(() => {
    if (hasFiredRef.current || startTimeRef.current === null) {
      return;
    }

    const timeSpent = (Date.now() - startTimeRef.current) / 1000;

    // Only fire if user spent meaningful time (>5 seconds)
    if (timeSpent >= 5) {
      analytics.timeOnResults(timeSpent, accountCount, actionsCountRef.current);
      hasFiredRef.current = true;
    }
  }, [accountCount]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Start tracking
    startTimeRef.current = Date.now();
    actionsCountRef.current = 0;
    hasFiredRef.current = false;

    // Handle visibility change (user switches tab)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        fireEvent();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Fire on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      fireEvent();
    };
  }, [isActive, fireEvent]);

  return { trackAction };
}
