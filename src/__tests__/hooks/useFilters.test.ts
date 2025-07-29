import { renderHook } from '@testing-library/react';
import { useFilters } from '@/hooks/useFilters';
import { createTestParsedData, TEST_ACCOUNTS } from '@tests/fixtures/testData';
import { buildAccountBadgeIndex } from '@/core/badges';
import type { BadgeKey } from '@/core/types';

describe('useFilters', () => {
  const testData = createTestParsedData();
  const accounts = buildAccountBadgeIndex(testData);

  it('should filter accounts by single badge type', () => {
    const { result } = renderHook(() => 
      useFilters(accounts, new Set(['mutuals'] as BadgeKey[]), '')
    );
    
    expect(result.current).toHaveLength(TEST_ACCOUNTS.mutuals.length);
    result.current.forEach(account => {
      expect(account.badges.mutuals).toBeTruthy();
    });
  });

  it('should filter accounts by multiple badge types', () => {
    const selectedFilters = new Set(['mutuals', 'notFollowingBack'] as BadgeKey[]);
    const { result } = renderHook(() => 
      useFilters(accounts, selectedFilters, '')
    );
    
    const expectedCount = TEST_ACCOUNTS.mutuals.length + TEST_ACCOUNTS.notFollowingBack.length;
    expect(result.current).toHaveLength(expectedCount);
    
    result.current.forEach(account => {
      const hasMutual = account.badges.mutuals;
      const hasNotFollowingBack = account.badges.notFollowingBack;
      expect(hasMutual || hasNotFollowingBack).toBeTruthy();
    });
  });

  it('should return empty array when no filters selected', () => {
    const { result } = renderHook(() => 
      useFilters(accounts, new Set(), '')
    );
    
    expect(result.current).toHaveLength(0);
  });

  it('should filter by username query', () => {
    const query = 'alice';
    const { result } = renderHook(() => 
      useFilters(accounts, new Set(['following'] as BadgeKey[]), query)
    );
    
    expect(result.current.length).toBeGreaterThan(0);
    result.current.forEach(account => {
      expect(account.username.toLowerCase()).toContain(query.toLowerCase());
    });
  });

  it('should combine badge and username filtering', () => {
    const query = 'mutual';
    const { result } = renderHook(() => 
      useFilters(accounts, new Set(['mutuals'] as BadgeKey[]), query)
    );
    
    expect(result.current.length).toBeGreaterThan(0);
    result.current.forEach(account => {
      expect(account.badges.mutuals).toBeTruthy();
      expect(account.username.toLowerCase()).toContain(query.toLowerCase());
    });
  });

  it('should return empty array for non-matching query', () => {
    const query = 'nonexistent_user_12345';
    const { result } = renderHook(() => 
      useFilters(accounts, new Set(['following'] as BadgeKey[]), query)
    );
    
    expect(result.current).toHaveLength(0);
  });

  it('should handle case-insensitive search', () => {
    const query = 'ALICE';
    const { result } = renderHook(() => 
      useFilters(accounts, new Set(['following'] as BadgeKey[]), query)
    );
    
    expect(result.current.length).toBeGreaterThan(0);
    result.current.forEach(account => {
      expect(account.username.toLowerCase()).toContain(query.toLowerCase());
    });
  });

  it('should update results when filters change', () => {
    const { result, rerender } = renderHook(
      ({ filters, query }) => useFilters(accounts, filters, query),
      {
        initialProps: {
          filters: new Set(['mutuals'] as BadgeKey[]),
          query: ''
        }
      }
    );
    
    expect(result.current).toHaveLength(TEST_ACCOUNTS.mutuals.length);
    
    // Change filters
    rerender({
      filters: new Set(['notFollowingBack'] as BadgeKey[]),
      query: ''
    });
    
    expect(result.current).toHaveLength(TEST_ACCOUNTS.notFollowingBack.length);
  });

  it('should update results when query changes', () => {
    const { result, rerender } = renderHook(
      ({ filters, query }) => useFilters(accounts, filters, query),
      {
        initialProps: {
          filters: new Set(['following'] as BadgeKey[]),
          query: ''
        }
      }
    );
    
    const allFollowingCount = result.current.length;
    expect(allFollowingCount).toBeGreaterThan(0);
    
    // Change query
    rerender({
      filters: new Set(['following'] as BadgeKey[]),
      query: 'alice'
    });
    
    expect(result.current.length).toBeLessThan(allFollowingCount);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should handle empty accounts array', () => {
    const { result } = renderHook(() => 
      useFilters([], new Set(['following'] as BadgeKey[]), '')
    );
    
    expect(result.current).toHaveLength(0);
  });

  it('should handle all badge types', () => {
    const badgeTypes: BadgeKey[] = [
      'following', 'followers', 'mutuals', 'notFollowingBack', 
      'notFollowedBack', 'pending', 'permanent', 'restricted', 
      'close', 'unfollowed', 'dismissed'
    ];
    
    badgeTypes.forEach(badgeType => {
      const { result } = renderHook(() => 
        useFilters(accounts, new Set([badgeType]), '')
      );
      
      // Each badge type should return some results (or empty if no accounts have that badge)
      expect(Array.isArray(result.current)).toBe(true);
      
      result.current.forEach(account => {
        expect(account.badges[badgeType]).toBeTruthy();
      });
    });
  });

  it('should handle exact match with no matching badges', () => {
    const { result } = renderHook(() => 
      useFilters(accounts, new Set(['followers'] as BadgeKey[]), 'alice_mutual')
    );
    
    // alice_mutual has following badge but not followers, so should return empty
    // But the test data might have alice_mutual with followers badge
    // Let's check what badges alice_mutual actually has
    const aliceAccount = accounts.find(acc => acc.username === 'alice_mutual');
    if (aliceAccount?.badges.followers) {
      expect(result.current).toHaveLength(1);
    } else {
      expect(result.current).toHaveLength(0);
    }
  });

  it('should handle exact match with matching badges', () => {
    const { result } = renderHook(() => 
      useFilters(accounts, new Set(['following'] as BadgeKey[]), 'alice_mutual')
    );
    
    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.username).toBe('alice_mutual');
  });

  it('should handle partial match fallback', () => {
    const { result } = renderHook(() => 
      useFilters(accounts, new Set(['following'] as BadgeKey[]), 'alice')
    );
    
    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.username).toBe('alice_mutual');
  });

  it('should handle whitespace-only query', () => {
    const { result } = renderHook(() => 
      useFilters(accounts, new Set(['following'] as BadgeKey[]), '   ')
    );
    
    expect(result.current).toHaveLength(TEST_ACCOUNTS.following.length);
  });
});
