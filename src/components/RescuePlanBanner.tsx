'use client';

import { TrendingDown, AlertTriangle, TrendingUp, X, ExternalLink, Bug } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useRescuePlanDismiss } from '@/hooks/useRescuePlanDismiss';
import { analytics } from '@/lib/analytics';
import {
  computeSegment,
  getToolsForSegment,
  SEVERITY_STYLES,
  SHOW_DELAY_BY_SEVERITY,
  type RescueTool,
  type LossSeverity,
  type AccountSize,
  type UserSegment,
} from '@/lib/rescue-plan';

/**
 * Rescue Plan Banner — Monetization Component
 *
 * Shows affiliate tool recommendations based on user segment.
 * Features:
 * - Tiered delayed show based on severity (15s/25s/40s)
 * - Segmentation by severity (critical/warning/growth) and size
 * - localStorage dismiss with 7-day TTL + segment change re-engagement
 * - Trust signals (badges, pricing, social proof)
 * - Analytics tracking (impression, click, dismiss, hover, view time)
 * - DEV: Test button to cycle through all severity/size combinations
 */

interface RescuePlanBannerProps {
  filterCounts: Record<string, number>;
  totalCount: number;
  /** Override delay (ms). If not provided, uses severity-based timing */
  showDelay?: number;
  /** Additional CSS classes for grid positioning */
  className?: string;
}

const SEVERITY_ICONS = {
  alert: TrendingDown,
  warning: AlertTriangle,
  growth: TrendingUp,
} as const;

const BADGE_STYLES = {
  popular: 'bg-orange-500 text-white',
  trial: 'bg-emerald-500 text-white',
  new: 'bg-blue-500 text-white',
} as const;

/** All severity/size combinations for testing */
const ALL_SEVERITIES: LossSeverity[] = ['critical', 'warning', 'growth'];
const ALL_SIZES: AccountSize[] = ['influencer', 'power', 'regular', 'casual'];

export function RescuePlanBanner({
  filterCounts,
  totalCount,
  showDelay,
  className,
}: RescuePlanBannerProps) {
  const { t } = useTranslation('results');
  const [isVisible, setIsVisible] = useState(false);
  const hasTrackedImpression = useRef(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibilityStartRef = useRef<number>(0);
  const hoverTimersRef = useRef<Map<string, number>>(new Map());

  // DEV: Override segment for testing
  const [devOverride, setDevOverride] = useState<UserSegment | null>(null);
  const [devIndex, setDevIndex] = useState(0);

  // Compute user segment
  const realSegment = useMemo(
    () => computeSegment(filterCounts, totalCount),
    [filterCounts, totalCount]
  );

  // Use override in dev mode, otherwise real segment
  const segment = devOverride ?? realSegment;

  // Get dismiss state from localStorage (with segment change detection)
  const { isDismissed, dismiss } = useRescuePlanDismiss(segment);

  // Get tools for this segment
  const tools = useMemo(() => getToolsForSegment(segment), [segment]);

  // Get styling for severity
  const style = SEVERITY_STYLES[segment.severity];
  const SeverityIcon = SEVERITY_ICONS[style.iconType];

  // Use tiered delay based on severity, or override if provided
  const effectiveDelay = showDelay ?? SHOW_DELAY_BY_SEVERITY[segment.severity];

  // DEV: Cycle through all combinations
  const handleDevCycle = useCallback(() => {
    const totalCombinations = ALL_SEVERITIES.length * ALL_SIZES.length;
    const nextIndex = (devIndex + 1) % totalCombinations;
    setDevIndex(nextIndex);

    const severityIdx = Math.floor(nextIndex / ALL_SIZES.length);
    const sizeIdx = nextIndex % ALL_SIZES.length;

    const severity = ALL_SEVERITIES[severityIdx] ?? 'growth';
    const size = ALL_SIZES[sizeIdx] ?? 'casual';

    // Create mock segment
    const mockPercent = severity === 'critical' ? 15 : severity === 'warning' ? 5 : 1;
    const mockTotal =
      size === 'influencer' ? 15000 : size === 'power' ? 5000 : size === 'regular' ? 1000 : 200;

    setDevOverride({
      severity,
      size,
      unfollowedPercent: mockPercent,
      totalAccounts: mockTotal,
    });
  }, [devIndex]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
      }
    };
  }, []);

  // Delayed show effect with tiered timing (skip in dev override mode)
  useEffect(() => {
    if (isDismissed && !devOverride) return;

    // In dev mode with override, show immediately
    if (devOverride) {
      setIsVisible(true);
      visibilityStartRef.current = Date.now();
      return;
    }

    showTimerRef.current = setTimeout(() => {
      setIsVisible(true);
      visibilityStartRef.current = Date.now();
    }, effectiveDelay);

    return () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
      }
    };
  }, [isDismissed, effectiveDelay, devOverride]);

  // Track impression when visible
  useEffect(() => {
    if (isVisible && !hasTrackedImpression.current && !devOverride) {
      analytics.rescuePlanImpression(segment.severity, segment.size, segment.unfollowedPercent);
      hasTrackedImpression.current = true;
    }
  }, [isVisible, segment, devOverride]);

  // Track view time on unmount
  useEffect(() => {
    return () => {
      if (visibilityStartRef.current > 0 && !devOverride) {
        const viewTime = (Date.now() - visibilityStartRef.current) / 1000;
        analytics.rescuePlanViewTime?.(viewTime, segment.severity, segment.size);
      }
    };
  }, [segment, devOverride]);

  // Handle tool hover for analytics
  const handleToolHover = useCallback(
    (toolId: string, isEntering: boolean) => {
      if (devOverride) return; // Skip analytics in dev mode

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
    [devOverride]
  );

  // Handle tool click with analytics
  const handleToolClick = useCallback(
    (tool: RescueTool, e: React.MouseEvent) => {
      if (devOverride) {
        e.preventDefault(); // Don't navigate in dev mode
        return;
      }
      analytics.rescuePlanToolClick(tool.id, segment.severity, segment.size);
    },
    [segment, devOverride]
  );

  // Handle dismiss with analytics
  const handleDismiss = useCallback(() => {
    if (devOverride) {
      setDevOverride(null);
      setDevIndex(0);
      return;
    }
    analytics.rescuePlanDismiss(segment.severity, segment.size, segment.unfollowedPercent);
    dismiss();
    setIsVisible(false);
  }, [dismiss, segment, devOverride]);

  // Don't render if dismissed or not yet visible (unless dev override)
  if ((isDismissed || !isVisible) && !devOverride) return null;

  return (
    <div
      className={`relative bg-gradient-to-r ${style.gradientClass} border-2 ${style.borderClass} rounded-3xl p-6 md:p-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500 ${className ?? ''}`}
      role="complementary"
      aria-label={t('rescue.ariaLabel')}
    >
      {/* DEV: Test button (only in development) */}
      {import.meta.env.DEV && (
        <button
          onClick={handleDevCycle}
          className="absolute top-4 left-4 p-2 text-zinc-400 hover:text-primary transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1 text-xs font-mono"
          title="Cycle through severity/size combinations"
        >
          <Bug size={16} />
          <span className="hidden sm:inline">
            {segment.severity}_{segment.size}
          </span>
        </button>
      )}

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
          className={`p-4 rounded-2xl shrink-0 ${
            segment.severity === 'critical'
              ? 'bg-red-100 dark:bg-red-900/50'
              : segment.severity === 'warning'
                ? 'bg-amber-100 dark:bg-amber-900/50'
                : 'bg-emerald-100 dark:bg-emerald-900/50'
          }`}
        >
          <SeverityIcon className={`w-8 h-8 ${style.iconColorClass}`} />
        </div>
        <div className="pr-8">
          <h3 className="text-xl md:text-2xl font-display font-bold text-zinc-900 dark:text-white">
            {t(getTitleKey(segment.severity) as any, {
              unfollowedPercent: segment.unfollowedPercent.toFixed(1),
            })}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1 text-sm md:text-base">
            {t(getSubtitleKey(segment.severity, segment.size) as any, {
              count: segment.totalAccounts,
            })}
          </p>
        </div>
      </div>

      {/* Tools grid with CTA buttons and trust signals */}
      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {tools.map((tool, index) => (
          <a
            key={tool.id}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => handleToolClick(tool, e)}
            onMouseEnter={() => handleToolHover(tool.id, true)}
            onMouseLeave={() => handleToolHover(tool.id, false)}
            className={`group relative p-4 bg-white dark:bg-zinc-900 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] flex flex-col ${
              index === 0
                ? 'border-zinc-300 dark:border-zinc-700 hover:border-primary hover:ring-2 hover:ring-primary/20 hover:shadow-xl'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-primary hover:shadow-lg'
            }`}
          >
            {/* Badge */}
            {tool.badge && (
              <span
                className={`absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold rounded-full ${BADGE_STYLES[tool.badge]}`}
              >
                {tool.badge === 'popular'
                  ? `🔥 ${t('rescue.badges.popular')}`
                  : tool.badge === 'trial'
                    ? `✨ ${t('rescue.badges.trial')}`
                    : `🆕 ${t('rescue.badges.new')}`}
              </span>
            )}

            {/* Recommended label for first item */}
            {index === 0 && (
              <span className="absolute -top-2 left-3 px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-white">
                ⭐ {t('rescue.recommended')}
              </span>
            )}

            {/* Content area - grows to fill space */}
            <div className="flex-grow">
              {/* Tool header */}
              <div className="flex items-center gap-3 mb-2 mt-2">
                <tool.icon
                  className={`w-5 h-5 ${tool.color} group-hover:scale-110 transition-transform`}
                />
                <span className="font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                  {tool.name}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                {t(tool.descKey as any)}
              </p>
            </div>

            {/* Trust signals - fixed height row */}
            <div className="flex items-center justify-between text-xs mb-3 gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                {t(tool.priceKey as any)}
              </span>
              <span className="text-zinc-400 whitespace-nowrap">{t(tool.socialKey as any)}</span>
            </div>

            {/* CTA Button - always at bottom */}
            <div
              className={`w-full py-2 px-3 rounded-xl text-center text-sm font-semibold transition-all mt-auto ${
                index === 0
                  ? 'bg-primary text-white group-hover:bg-primary/90'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-primary group-hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {t('rescue.tryTool', { name: tool.name })}
                <ExternalLink className="w-3.5 h-3.5 opacity-70 shrink-0" />
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Disclaimer with transparency */}
      <p className="text-xs text-zinc-400 mt-4 text-center">💡 {t('rescue.disclaimer')}</p>
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
