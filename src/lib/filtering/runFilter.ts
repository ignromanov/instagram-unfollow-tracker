// Pure filtering function - no side effects, easily testable
import type { AccountBadges } from '@/core/types';

/**
 * Regex cache using Map pattern to avoid global mutable state pollution
 * Cache is scoped to the module but with size limit to prevent memory leaks
 */
const regexCache = new Map<string, RegExp>();
const CACHE_SIZE_LIMIT = 50;

/**
 * Get or create a cached regex for the search query
 */
function getSearchRegex(query: string): RegExp | null {
  if (!query) return null;

  // Check cache first
  if (regexCache.has(query)) {
    return regexCache.get(query) ?? null;
  }

  try {
    // Escape special regex characters for literal search
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    // Add to cache with size limit to prevent unbounded growth
    if (regexCache.size >= CACHE_SIZE_LIMIT) {
      const firstKey = regexCache.keys().next().value;
      if (firstKey) regexCache.delete(firstKey);
    }
    regexCache.set(query, regex);
    return regex;
  } catch (regexError) {
    console.warn('Invalid search regex, falling back to string includes:', regexError);
    return null;
  }
}

/**
 * Pure filtering function that filters accounts by search query and active filters
 * @param accounts - Array of accounts to filter
 * @param searchQuery - Search query to filter by username
 * @param activeFilters - Array of badge filters to apply (AND logic)
 * @returns Filtered array of accounts
 * @throws Error if accounts is not an array or invalid structure
 */
export function runFilter(
  accounts: AccountBadges[],
  searchQuery: string,
  activeFilters: string[]
): AccountBadges[] {
  // Input validation
  if (!Array.isArray(accounts)) {
    throw new Error('Accounts must be an array');
  }

  if (accounts.length === 0) {
    return [];
  }

  // Single pass filtering for better performance
  const filtered: AccountBadges[] = [];
  const query = searchQuery.trim().toLowerCase();
  const searchRegex = getSearchRegex(query);

  // Single pass through accounts
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];

    // Validate account structure
    if (!account || typeof account.username !== 'string' || !account.badges) {
      console.warn('Invalid account structure at index', i, account);
      continue;
    }

    // Apply badge filters with AND logic (most selective first)
    if (activeFilters.length > 0) {
      let hasAllFilters = true;
      for (let j = 0; j < activeFilters.length; j++) {
        const filter = activeFilters[j];
        if (!account.badges[filter as keyof typeof account.badges]) {
          hasAllFilters = false;
          break;
        }
      }
      if (!hasAllFilters) {
        continue;
      }
    }

    // Apply search query (most selective last)
    if (query) {
      const username = account.username.toLowerCase();
      if (searchRegex) {
        if (!searchRegex.test(username)) {
          continue;
        }
      } else {
        if (!username.includes(query)) {
          continue;
        }
      }
    }

    filtered.push(account);
  }

  return filtered;
}

/**
 * Reset internal state - useful for tests
 */
export function resetFilterState(): void {
  regexCache.clear();
}
