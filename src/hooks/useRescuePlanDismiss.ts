import { useState, useCallback } from 'react';

import type { UserSegment } from '@/lib/rescue-plan';

/**
 * Hook for managing rescue plan banner dismiss state with localStorage persistence.
 *
 * Features:
 * - 7-day TTL for dismiss state
 * - Stores segment info for analytics
 * - SSR-safe (checks window)
 */

const STORAGE_KEY = 'rescue_plan_dismissed';
const TTL_DAYS = 7;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

interface DismissState {
  dismissedAt: number;
  segment: string;
}

/**
 * Check if dismiss state is still valid (within TTL)
 */
function isDismissValid(): boolean {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;

  try {
    const state: DismissState = JSON.parse(stored);
    const now = Date.now();

    // Check TTL expiry
    if (now - state.dismissedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }

    return true;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
}

/**
 * Hook to manage rescue plan dismiss state
 *
 * @param segment - Current user segment for analytics
 * @returns isDismissed state and dismiss function
 */
export function useRescuePlanDismiss(segment: UserSegment | null) {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => isDismissValid());

  const dismiss = useCallback(() => {
    if (typeof window === 'undefined' || !segment) return;

    const state: DismissState = {
      dismissedAt: Date.now(),
      segment: `${segment.severity}_${segment.size}`,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setIsDismissed(true);
  }, [segment]);

  return { isDismissed, dismiss };
}

/**
 * Clear dismiss state (for testing)
 */
export function clearRescuePlanDismiss(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
