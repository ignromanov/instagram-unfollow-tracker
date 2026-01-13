import type { LossSeverity, AccountSize, UserSegment, SegmentKey, SeverityStyle } from './types';

/**
 * Segmentation Logic
 *
 * Computes user segment based on unfollowed percentage and account size.
 * Used to select appropriate tools and messaging.
 */

/** Thresholds for severity classification */
const SEVERITY_THRESHOLDS = {
  critical: 10, // >10% unfollowed
  warning: 3, // 3-10% unfollowed
  // growth: <3% unfollowed
} as const;

/** Thresholds for account size classification */
const SIZE_THRESHOLDS = {
  influencer: 10000,
  power: 3000,
  regular: 500,
  // casual: <500
} as const;

/**
 * Compute severity level based on unfollowed percentage
 */
export function computeSeverity(unfollowedCount: number, totalCount: number): LossSeverity {
  if (totalCount === 0) return 'growth';

  const percent = (unfollowedCount / totalCount) * 100;

  if (percent > SEVERITY_THRESHOLDS.critical) return 'critical';
  if (percent >= SEVERITY_THRESHOLDS.warning) return 'warning';
  return 'growth';
}

/**
 * Compute account size tier based on total accounts
 */
export function computeSize(totalCount: number): AccountSize {
  if (totalCount >= SIZE_THRESHOLDS.influencer) return 'influencer';
  if (totalCount >= SIZE_THRESHOLDS.power) return 'power';
  if (totalCount >= SIZE_THRESHOLDS.regular) return 'regular';
  return 'casual';
}

/**
 * Compute full user segment from filter counts
 */
export function computeSegment(
  filterCounts: Record<string, number>,
  totalCount: number
): UserSegment {
  const unfollowedCount = filterCounts.unfollowed ?? 0;
  const unfollowedPercent = totalCount > 0 ? (unfollowedCount / totalCount) * 100 : 0;

  return {
    severity: computeSeverity(unfollowedCount, totalCount),
    size: computeSize(totalCount),
    unfollowedPercent,
    totalAccounts: totalCount,
  };
}

/**
 * Get segment key for tool matrix lookup
 */
export function getSegmentKey(segment: UserSegment): SegmentKey {
  return `${segment.severity}_${segment.size}`;
}

/**
 * Show delay (ms) based on severity level
 * - Critical: Show faster (urgent pain)
 * - Warning: Moderate delay
 * - Growth: Let them explore first
 */
export const SHOW_DELAY_BY_SEVERITY: Record<LossSeverity, number> = {
  critical: 15000, // 15s - urgent
  warning: 25000, // 25s - analyzing
  growth: 40000, // 40s - exploring
};

/**
 * Styling configuration for each severity level
 */
export const SEVERITY_STYLES: Record<LossSeverity, SeverityStyle> = {
  critical: {
    iconType: 'alert',
    gradientClass: 'from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30',
    borderClass: 'border-red-200 dark:border-red-900',
    iconColorClass: 'text-red-500',
  },
  warning: {
    iconType: 'warning',
    gradientClass: 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
    borderClass: 'border-amber-200 dark:border-amber-900',
    iconColorClass: 'text-amber-500',
  },
  growth: {
    iconType: 'growth',
    gradientClass: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
    borderClass: 'border-emerald-200 dark:border-emerald-900',
    iconColorClass: 'text-emerald-500',
  },
};
