import type { AccountBadges, BadgeKey } from '@/core/types';

/**
 * Pure function to filter accounts by search query and active filters
 * This function can be safely unit-tested without Web Workers
 */
export function filterAccounts(
  accounts: AccountBadges[],
  searchQuery: string,
  activeFilters: string[]
): AccountBadges[] {
  let filtered = accounts;

  // Apply badge filters with AND logic (all filters must match)
  if (activeFilters.length > 0) {
    filtered = filtered.filter(account =>
      activeFilters.every(filter => account.badges[filter as BadgeKey])
    );
  }

  // Apply search query filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(account => account.username.toLowerCase().includes(query));
  }

  return filtered;
}

/**
 * Calculate filter counts for all badge types
 */
export function calculateFilterCounts(accounts: AccountBadges[]): Record<BadgeKey, number> {
  const counts = {} as Record<BadgeKey, number>;

  // Initialize all badge counts to 0
  const badgeTypes: BadgeKey[] = [
    'following',
    'followers',
    'mutuals',
    'notFollowingBack',
    'notFollowedBack',
    'pending',
    'restricted',
    'close',
    'unfollowed',
    'dismissed',
  ];

  badgeTypes.forEach(badge => {
    counts[badge] = 0;
  });

  // Count accounts for each badge type
  for (const account of accounts) {
    Object.keys(account.badges).forEach(key => {
      const badgeKey = key as BadgeKey;
      if (badgeKey in counts && account.badges[badgeKey]) {
        counts[badgeKey]++;
      }
    });
  }

  return counts;
}

/**
 * Generate cache key for filtering operations
 */
export function generateFilterCacheKey(searchQuery: string, activeFilters: string[]): string {
  return `${searchQuery}|${activeFilters.sort().join(',')}`;
}

/**
 * Check if cache entry is still valid (within 30 seconds)
 */
export function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < 30000;
}
