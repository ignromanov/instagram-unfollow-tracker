import type { BadgeKey } from '@/core/types';

// Single source of truth for badge styles
const BADGE_STYLE_MAP: Record<BadgeKey, string> = {
  following: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  followers: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  mutuals: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  notFollowingBack: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  notFollowedBack: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  permanent: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  restricted: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  close: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  unfollowed: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  dismissed: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
};

// Generated exports for different component needs
export const BADGE_STYLES: Record<string, string> = BADGE_STYLE_MAP;
export const BADGE_CONFIGS: Record<BadgeKey, { color: string }> = Object.fromEntries(
  Object.entries(BADGE_STYLE_MAP).map(([key, value]) => [key, { color: value }])
) as Record<BadgeKey, { color: string }>;
