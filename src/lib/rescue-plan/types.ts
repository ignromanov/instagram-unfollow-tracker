import type { LucideIcon } from 'lucide-react';

/**
 * Rescue Plan Types
 *
 * Defines user segmentation and tool configuration for monetization banners.
 */

/** Severity based on unfollowed percentage */
export type LossSeverity = 'critical' | 'warning' | 'growth';

/** Account size tiers based on total accounts */
export type AccountSize = 'casual' | 'regular' | 'power' | 'influencer';

/** Tool category for grouping */
export type ToolCategory = 'content' | 'engagement' | 'analytics' | 'design' | 'scheduling';

/** Combined user segment (12 combinations) */
export interface UserSegment {
  severity: LossSeverity;
  size: AccountSize;
  unfollowedPercent: number;
  totalAccounts: number;
}

/** Tool definition for affiliate links */
export interface RescueTool {
  id: string;
  name: string;
  descKey: string;
  icon: LucideIcon;
  url: string;
  color: string;
  category: ToolCategory;
}

/** Segment key for tool matrix lookup */
export type SegmentKey = `${LossSeverity}_${AccountSize}`;

/** Styling config for severity levels */
export interface SeverityStyle {
  iconType: 'alert' | 'warning' | 'growth';
  gradientClass: string;
  borderClass: string;
  iconColorClass: string;
}
