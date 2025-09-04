import { describe, it, expect, beforeEach } from 'vitest';
import { runFilter, resetFilterState } from '@/lib/filtering/runFilter';
import type { AccountBadges } from '@/core/types';

describe('runFilter', () => {
  beforeEach(() => {
    resetFilterState();
  });

  const mockAccounts: AccountBadges[] = [
    {
      username: 'user1',
      badges: { following: 1234567890, mutuals: true },
    },
    {
      username: 'user2',
      badges: { followers: 1234567890 },
    },
    {
      username: 'user3',
      badges: { following: 1234567890, notFollowingBack: true },
    },
    {
      username: 'testUser',
      badges: { following: 1234567890, close: 1234567890 },
    },
  ];

  describe('input validation', () => {
    it('should throw error if accounts is not an array', () => {
      expect(() => runFilter({} as any, '', [])).toThrow('Accounts must be an array');
    });

    it('should return empty array for empty accounts', () => {
      const result = runFilter([], '', []);
      expect(result).toEqual([]);
    });

    it('should skip invalid account structures', () => {
      const invalidAccounts = [
        { username: 'valid', badges: { following: 123 } },
        { username: null, badges: {} } as any,
        { username: 'valid2' } as any,
      ];

      const result = runFilter(invalidAccounts, '', []);
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('valid');
    });
  });

  describe('search filtering', () => {
    it('should filter by exact username match', () => {
      const result = runFilter(mockAccounts, 'user1', []);
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('user1');
    });

    it('should filter by partial username match', () => {
      const result = runFilter(mockAccounts, 'user', []);
      expect(result).toHaveLength(4);
    });

    it('should be case insensitive', () => {
      const result = runFilter(mockAccounts, 'USER1', []);
      expect(result).toHaveLength(1);
      expect(result[0]?.username).toBe('user1');
    });

    it('should trim search query', () => {
      const result = runFilter(mockAccounts, '  user1  ', []);
      expect(result).toHaveLength(1);
      expect(result[0]?.username).toBe('user1');
    });

    it('should return all accounts for empty query', () => {
      const result = runFilter(mockAccounts, '', []);
      expect(result).toHaveLength(4);
    });

    it('should handle special regex characters', () => {
      const accountsWithSpecialChars: AccountBadges[] = [
        { username: 'user.name', badges: { following: 123 } },
        { username: 'user*name', badges: { following: 123 } },
      ];

      const result = runFilter(accountsWithSpecialChars, 'user.name', []);
      expect(result).toHaveLength(1);
      expect(result[0]?.username).toBe('user.name');
    });
  });

  describe('badge filtering', () => {
    it('should filter by single badge', () => {
      const result = runFilter(mockAccounts, '', ['mutuals']);
      expect(result).toHaveLength(1);
      expect(result[0]?.username).toBe('user1');
    });

    it('should filter by multiple badges with AND logic', () => {
      const result = runFilter(mockAccounts, '', ['following', 'close']);
      expect(result).toHaveLength(1);
      expect(result[0]?.username).toBe('testUser');
    });

    it('should return empty array if no accounts match all filters', () => {
      const result = runFilter(mockAccounts, '', ['following', 'followers']);
      expect(result).toHaveLength(0);
    });

    it('should handle non-existent badge filters', () => {
      const result = runFilter(mockAccounts, '', ['nonExistent']);
      expect(result).toHaveLength(0);
    });
  });

  describe('combined filtering', () => {
    it('should filter by both search and badges', () => {
      const result = runFilter(mockAccounts, 'user', ['following']);
      expect(result).toHaveLength(3);
      expect(result.every(acc => acc.badges.following)).toBe(true);
    });

    it('should apply search after badge filters', () => {
      const result = runFilter(mockAccounts, 'testUser', ['following']);
      expect(result).toHaveLength(1);
      expect(result[0]?.username).toBe('testUser');
    });
  });

  describe('performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset: AccountBadges[] = Array.from({ length: 10000 }, (_, i) => ({
        username: `user${i}`,
        badges: { following: 123 },
      }));

      const startTime = performance.now();
      const result = runFilter(largeDataset, 'user999', []);
      const endTime = performance.now();

      expect(result.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
    });

    it('should reuse compiled regex for same query', () => {
      // First call compiles regex
      runFilter(mockAccounts, 'user', []);

      const startTime = performance.now();
      // Second call should reuse compiled regex
      runFilter(mockAccounts, 'user', []);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
    });
  });
});
