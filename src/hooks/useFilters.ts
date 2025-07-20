import { useMemo } from 'react';
import { filterAccountsByBadges } from '@/core/badges';
import type { AccountBadges, BadgeKey } from '@/core/types';

export function useFilters(accounts: AccountBadges[], selectedFilters: Set<BadgeKey>, query: string) {
  // Create username index for faster search
  const usernameIndex = useMemo(() => {
    return new Map(accounts.map(acc => [acc.username.toLowerCase(), acc]));
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    // If query is provided, use index for faster search
    if (query.trim()) {
      const queryLower = query.toLowerCase();
      const exactMatch = usernameIndex.get(queryLower);
      
      if (exactMatch) {
        // Check if exact match passes badge filters
        for (const filter of selectedFilters) {
          if (exactMatch.badges[filter]) {
            return [exactMatch];
          }
        }
        return [];
      }
      
      // Fallback to partial search for non-exact matches
      const partialMatches = accounts.filter(acc => 
        acc.username.toLowerCase().includes(queryLower)
      );
      
      return filterAccountsByBadges(partialMatches, selectedFilters, '');
    }
    
    // No query - use standard filtering
    return filterAccountsByBadges(accounts, selectedFilters, '');
  }, [accounts, selectedFilters, query, usernameIndex]);

  return filteredAccounts;
}
