import { describe, it, expect } from 'vitest';
import {
  filterAccounts,
  calculateFilterCounts,
  generateFilterCacheKey,
  isCacheValid,
} from '@/lib/accountFiltering';
import type { AccountBadges } from '@/core/types';

// Test data
const createTestAccounts = (): AccountBadges[] => [
  {
    username: 'user1',
    badges: {
      following: true,
      followers: true,
      mutuals: true,
      notFollowingBack: undefined,
      notFollowedBack: undefined,
      pending: undefined,
      restricted: undefined,
      close: undefined,
      unfollowed: undefined,
      dismissed: undefined,
    },
  },
  {
    username: 'user2',
    badges: {
      following: true,
      followers: undefined,
      mutuals: undefined,
      notFollowingBack: true,
      notFollowedBack: undefined,
      pending: undefined,
      restricted: undefined,
      close: undefined,
      unfollowed: undefined,
      dismissed: undefined,
    },
  },
  {
    username: 'user3',
    badges: {
      following: undefined,
      followers: true,
      mutuals: undefined,
      notFollowingBack: undefined,
      notFollowedBack: true,
      pending: undefined,
      restricted: undefined,
      close: undefined,
      unfollowed: undefined,
      dismissed: undefined,
    },
  },
  {
    username: 'alice',
    badges: {
      following: true,
      followers: true,
      mutuals: true,
      notFollowingBack: undefined,
      notFollowedBack: undefined,
      pending: undefined,
      restricted: undefined,
      close: true,
      unfollowed: undefined,
      dismissed: undefined,
    },
  },
];

describe('accountFiltering', () => {
  describe('filterAccounts', () => {
    const accounts = createTestAccounts();

    it('should return all accounts when no filters applied', () => {
      const result = filterAccounts(accounts, '', []);
      expect(result).toHaveLength(4);
      expect(result).toEqual(accounts);
    });

    it('should filter by single badge type', () => {
      const result = filterAccounts(accounts, '', ['following']);
      expect(result).toHaveLength(3);
      expect(result.map(a => a.username)).toEqual(['user1', 'user2', 'alice']);
    });

    it('should filter by multiple badge types with AND logic', () => {
      const result = filterAccounts(accounts, '', ['following', 'followers']);
      expect(result).toHaveLength(2);
      expect(result.map(a => a.username)).toEqual(['user1', 'alice']);
    });

    it('should filter by search query', () => {
      const result = filterAccounts(accounts, 'user', []);
      expect(result).toHaveLength(3);
      expect(result.map(a => a.username)).toEqual(['user1', 'user2', 'user3']);
    });

    it('should filter by search query (case insensitive)', () => {
      const result = filterAccounts(accounts, 'ALICE', []);
      expect(result).toHaveLength(1);
      expect(result[0]?.username).toBe('alice');
    });

    it('should combine search query and badge filters', () => {
      const result = filterAccounts(accounts, 'user', ['following']);
      expect(result).toHaveLength(2);
      expect(result.map(a => a.username)).toEqual(['user1', 'user2']);
    });

    it('should return empty array when no matches found', () => {
      const result = filterAccounts(accounts, 'nonexistent', []);
      expect(result).toHaveLength(0);
    });

    it('should return empty array when badge filter has no matches', () => {
      const result = filterAccounts(accounts, '', ['pending']);
      expect(result).toHaveLength(0);
    });

    it('should handle empty accounts array', () => {
      const result = filterAccounts([], 'test', ['following']);
      expect(result).toHaveLength(0);
    });

    it('should handle whitespace-only search query', () => {
      const result = filterAccounts(accounts, '   ', []);
      expect(result).toHaveLength(4);
      expect(result).toEqual(accounts);
    });
  });

  describe('calculateFilterCounts', () => {
    const accounts = createTestAccounts();

    it('should calculate correct counts for all badge types', () => {
      const counts = calculateFilterCounts(accounts);

      expect(counts.following).toBe(3); // user1, user2, alice
      expect(counts.followers).toBe(3); // user1, user3, alice
      expect(counts.mutuals).toBe(2); // user1, alice
      expect(counts.notFollowingBack).toBe(1); // user2
      expect(counts.notFollowedBack).toBe(1); // user3
      expect(counts.close).toBe(1); // alice
      expect(counts.pending).toBe(0);
      expect(counts.restricted).toBe(0);
      expect(counts.unfollowed).toBe(0);
      expect(counts.dismissed).toBe(0);
    });

    it('should handle empty accounts array', () => {
      const counts = calculateFilterCounts([]);

      Object.values(counts).forEach(count => {
        expect(count).toBe(0);
      });
    });

    it('should handle accounts with no badges', () => {
      const accountsWithNoBadges: AccountBadges[] = [
        {
          username: 'empty',
          badges: {
            following: undefined,
            followers: undefined,
            mutuals: undefined,
            notFollowingBack: undefined,
            notFollowedBack: undefined,
            pending: undefined,
            restricted: undefined,
            close: undefined,
            unfollowed: undefined,
            dismissed: undefined,
          },
        },
      ];

      const counts = calculateFilterCounts(accountsWithNoBadges);

      Object.values(counts).forEach(count => {
        expect(count).toBe(0);
      });
    });
  });

  describe('generateFilterCacheKey', () => {
    it('should generate consistent cache keys', () => {
      const key1 = generateFilterCacheKey('test', ['following', 'followers']);
      const key2 = generateFilterCacheKey('test', ['followers', 'following']);
      const key3 = generateFilterCacheKey('test', ['following', 'followers']);

      expect(key1).toBe(key2); // Should be same regardless of filter order
      expect(key1).toBe(key3); // Should be same for identical inputs
    });

    it('should generate different keys for different inputs', () => {
      const key1 = generateFilterCacheKey('test1', ['following']);
      const key2 = generateFilterCacheKey('test2', ['following']);
      const key3 = generateFilterCacheKey('test1', ['followers']);

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
    });

    it('should handle empty search query and filters', () => {
      const key = generateFilterCacheKey('', []);
      expect(key).toBe('|');
    });
  });

  describe('isCacheValid', () => {
    it('should return true for recent timestamps', () => {
      const recentTimestamp = Date.now() - 1000; // 1 second ago
      expect(isCacheValid(recentTimestamp)).toBe(true);
    });

    it('should return false for old timestamps', () => {
      const oldTimestamp = Date.now() - 35000; // 35 seconds ago
      expect(isCacheValid(oldTimestamp)).toBe(false);
    });

    it('should return true for timestamps exactly at 30 seconds', () => {
      const timestamp = Date.now() - 29999; // Just under 30 seconds ago
      expect(isCacheValid(timestamp)).toBe(true);
    });

    it('should return false for timestamps just over 30 seconds', () => {
      const timestamp = Date.now() - 30001; // Just over 30 seconds ago
      expect(isCacheValid(timestamp)).toBe(false);
    });
  });
});
