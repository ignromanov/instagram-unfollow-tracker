import { analytics } from '@/lib/analytics';
import { useEffect } from 'react';

const SESSION_START_KEY = 'analytics_session_start';
const PAGES_VIEWED_KEY = 'analytics_pages_viewed';

/**
 * Track session duration and pages viewed.
 * Uses sessionStorage to persist across page navigations within the same session.
 * Fires analytics event on beforeunload (tab/window close).
 */
export function useSessionDuration() {
  useEffect(() => {
    // Initialize session start time if not set
    const existingStart = sessionStorage.getItem(SESSION_START_KEY);
    if (!existingStart) {
      sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    }

    // Increment pages viewed counter
    const currentPages = parseInt(sessionStorage.getItem(PAGES_VIEWED_KEY) ?? '0', 10);
    sessionStorage.setItem(PAGES_VIEWED_KEY, (currentPages + 1).toString());

    // Fire event on tab/window close
    const handleBeforeUnload = () => {
      const startTime = parseInt(sessionStorage.getItem(SESSION_START_KEY) ?? '0', 10);
      const pagesViewed = parseInt(sessionStorage.getItem(PAGES_VIEWED_KEY) ?? '1', 10);

      if (startTime > 0) {
        const durationSeconds = (Date.now() - startTime) / 1000;

        // Only fire if session was meaningful (>10 seconds)
        if (durationSeconds >= 10) {
          analytics.sessionDuration(durationSeconds, pagesViewed);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
