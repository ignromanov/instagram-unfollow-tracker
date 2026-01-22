import { useCallback, useEffect, useRef } from 'react';

import { analytics } from '@/lib/analytics';
import type { UserSegment, RescueTool } from '@/lib/rescue-plan';

/**
 * Hook for Rescue Plan Banner analytics tracking
 *
 * Consolidates all analytics logic:
 * - Impression tracking (once per session)
 * - Tool click tracking
 * - Tool hover tracking (500ms+ hovers)
 * - View time tracking (on unmount)
 * - Dismiss tracking
 */

interface UseRescuePlanAnalyticsOptions {
  segment: UserSegment;
  isVisible: boolean;
  isDevMode: boolean;
}

export function useRescuePlanAnalytics({
  segment,
  isVisible,
  isDevMode,
}: UseRescuePlanAnalyticsOptions) {
  const hasTrackedImpression = useRef(false);
  const visibilityStartRef = useRef<number>(0);
  const hoverTimersRef = useRef<Map<string, number>>(new Map());

  // Track impression when visible (once per session)
  useEffect(() => {
    if (isVisible && !hasTrackedImpression.current && !isDevMode) {
      analytics.rescuePlanImpression(segment.severity, segment.size, segment.unfollowedPercent);
      hasTrackedImpression.current = true;
      visibilityStartRef.current = Date.now();
    }
  }, [isVisible, segment, isDevMode]);

  // Track view time on unmount
  useEffect(() => {
    return () => {
      if (visibilityStartRef.current > 0 && !isDevMode) {
        const viewTime = (Date.now() - visibilityStartRef.current) / 1000;
        analytics.rescuePlanViewTime?.(viewTime, segment.severity, segment.size);
      }
    };
  }, [segment, isDevMode]);

  // Handle tool hover for analytics
  const handleToolHover = useCallback(
    (toolId: string, isEntering: boolean) => {
      if (isDevMode) return;

      if (isEntering) {
        hoverTimersRef.current.set(toolId, Date.now());
      } else {
        const startTime = hoverTimersRef.current.get(toolId);
        if (startTime) {
          const duration = Date.now() - startTime;
          if (duration > 500) {
            analytics.rescuePlanHover?.(toolId, duration);
          }
          hoverTimersRef.current.delete(toolId);
        }
      }
    },
    [isDevMode]
  );

  // Handle tool click with analytics
  const handleToolClick = useCallback(
    (tool: RescueTool, e: React.MouseEvent) => {
      if (isDevMode) {
        e.preventDefault();
        return;
      }
      analytics.rescuePlanToolClick(tool.id, segment.severity, segment.size);
    },
    [segment, isDevMode]
  );

  // Track dismiss
  const trackDismiss = useCallback(() => {
    if (isDevMode) return;
    analytics.rescuePlanDismiss(segment.severity, segment.size, segment.unfollowedPercent);
  }, [segment, isDevMode]);

  return {
    handleToolHover,
    handleToolClick,
    trackDismiss,
  };
}
