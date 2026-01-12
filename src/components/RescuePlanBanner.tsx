'use client';

import { TrendingDown, AlertTriangle, TrendingUp, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useRescuePlanDismiss } from '@/hooks/useRescuePlanDismiss';
import { analytics } from '@/lib/analytics';
import {
  computeSegment,
  getToolsForSegment,
  SEVERITY_STYLES,
  type RescueTool,
  type LossSeverity,
} from '@/lib/rescue-plan';

/**
 * Rescue Plan Banner — Monetization Component
 *
 * Shows affiliate tool recommendations based on user segment.
 * Features:
 * - 30-second delayed show (value-first approach)
 * - Segmentation by severity (critical/warning/growth) and size
 * - localStorage dismiss with 7-day TTL
 * - Analytics tracking (impression, click, dismiss)
 */

interface RescuePlanBannerProps {
  filterCounts: Record<string, number>;
  totalCount: number;
  /** Delay before showing banner (ms). Default: 30000 */
  showDelay?: number;
}

const SEVERITY_ICONS = {
  alert: TrendingDown,
  warning: AlertTriangle,
  growth: TrendingUp,
} as const;

export function RescuePlanBanner({
  filterCounts,
  totalCount,
  showDelay = 30000,
}: RescuePlanBannerProps) {
  const { t } = useTranslation('results');
  const [isVisible, setIsVisible] = useState(false);
  const hasTrackedImpression = useRef(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Compute user segment
  const segment = useMemo(
    () => computeSegment(filterCounts, totalCount),
    [filterCounts, totalCount]
  );

  // Get dismiss state from localStorage
  const { isDismissed, dismiss } = useRescuePlanDismiss(segment);

  // Get tools for this segment
  const tools = useMemo(() => getToolsForSegment(segment), [segment]);

  // Get styling for severity
  const style = SEVERITY_STYLES[segment.severity];
  const SeverityIcon = SEVERITY_ICONS[style.iconType];

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
      }
    };
  }, []);

  // Delayed show effect
  useEffect(() => {
    if (isDismissed) return;

    showTimerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);

    return () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
      }
    };
  }, [isDismissed, showDelay]);

  // Track impression when visible
  useEffect(() => {
    if (isVisible && !hasTrackedImpression.current) {
      analytics.rescuePlanImpression(segment.severity, segment.size, segment.unfollowedPercent);
      hasTrackedImpression.current = true;
    }
  }, [isVisible, segment]);

  // Handle tool click with analytics
  const handleToolClick = useCallback(
    (tool: RescueTool) => {
      analytics.rescuePlanToolClick(tool.id, segment.severity, segment.size);
    },
    [segment]
  );

  // Handle dismiss with analytics
  const handleDismiss = useCallback(() => {
    analytics.rescuePlanDismiss(segment.severity, segment.size, segment.unfollowedPercent);
    dismiss();
    setIsVisible(false);
  }, [dismiss, segment]);

  // Don't render if dismissed or not yet visible
  if (isDismissed || !isVisible) return null;

  return (
    <div
      className={`relative bg-gradient-to-r ${style.gradientClass} border ${style.borderClass} rounded-3xl p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-500`}
      role="complementary"
      aria-label={t('rescue.ariaLabel')}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5"
        aria-label={t('rescue.dismiss')}
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`p-3 rounded-2xl shrink-0 ${
            segment.severity === 'critical'
              ? 'bg-red-100 dark:bg-red-900/50'
              : segment.severity === 'warning'
                ? 'bg-amber-100 dark:bg-amber-900/50'
                : 'bg-emerald-100 dark:bg-emerald-900/50'
          }`}
        >
          <SeverityIcon className={`w-6 h-6 ${style.iconColorClass}`} />
        </div>
        <div className="pr-8">
          <h3 className="text-xl md:text-2xl font-display font-bold text-zinc-900 dark:text-white">
            {t(getTitleKey(segment.severity) as any)}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1 text-sm md:text-base">
            {t(getSubtitleKey(segment.severity, segment.size) as any, { count: totalCount })}
          </p>
        </div>
      </div>

      {/* Tools grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {tools.map(tool => (
          <a
            key={tool.id}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleToolClick(tool)}
            className="group p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-primary hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <tool.icon className={`w-5 h-5 ${tool.color}`} />
              <span className="font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                {tool.name}
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t(tool.descKey as any)}</p>
          </a>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-zinc-400 mt-4 text-center">{t('rescue.disclaimer')}</p>
    </div>
  );
}

/** Get i18n key for title based on severity */
function getTitleKey(severity: LossSeverity): string {
  return `rescue.${severity}.title`;
}

/** Get i18n key for subtitle based on severity and size */
function getSubtitleKey(severity: LossSeverity, size: string): string {
  return `rescue.${severity}.subtitle.${size}`;
}
