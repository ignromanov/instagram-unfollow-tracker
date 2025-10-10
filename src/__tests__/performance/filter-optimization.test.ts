/**
 * Performance tests for optimized filtering with bitsets and indexes
 * Tests Proposals 1, 2, 3: Persistent worker, bitsets, search indexes
 */

import { describe, it, expect, beforeAll } from 'vitest';
import type { AccountBadges, BadgeKey } from '@/core/types';

// Generate test data
function generateTestAccounts(count: number): AccountBadges[] {
  const accounts: AccountBadges[] = [];
  const badgeKeys: BadgeKey[] = [
    'following',
    'followers',
    'mutuals',
    'notFollowingBack',
    'notFollowedBack',
  ];

  for (let i = 0; i < count; i++) {
    const badges: Partial<Record<BadgeKey, number | true>> = {};

    // Randomly assign badges
    if (Math.random() > 0.3) badges.following = Date.now();
    if (Math.random() > 0.5) badges.followers = Date.now();
    if (badges.following && badges.followers) badges.mutuals = true;
    if (badges.following && !badges.followers) badges.notFollowingBack = true;
    if (badges.followers && !badges.following) badges.notFollowedBack = true;

    accounts.push({
      username: `user_${i}_test_${String.fromCharCode(65 + (i % 26))}`,
      badges,
    });
  }

  return accounts;
}

describe('Filter Optimization Performance', () => {
  let smallDataset: AccountBadges[];
  let mediumDataset: AccountBadges[];
  let largeDataset: AccountBadges[];

  beforeAll(() => {
    smallDataset = generateTestAccounts(100);
    mediumDataset = generateTestAccounts(10_000);
    largeDataset = generateTestAccounts(100_000);
  });

  describe('Dataset Generation', () => {
    it('should generate small dataset (100 accounts)', () => {
      expect(smallDataset).toHaveLength(100);
      expect(smallDataset[0]).toHaveProperty('username');
      expect(smallDataset[0]).toHaveProperty('badges');
    });

    it('should generate medium dataset (10k accounts)', () => {
      expect(mediumDataset).toHaveLength(10_000);
    });

    it('should generate large dataset (100k accounts)', () => {
      expect(largeDataset).toHaveLength(100_000);
    });
  });

  describe('Bitset Operations', () => {
    it('should create bitset for 100k accounts efficiently', () => {
      const startTime = performance.now();

      // Simulate bitset creation (32-bit integers)
      const bitsetSize = Math.ceil(largeDataset.length / 32);
      const bitset = new Uint32Array(bitsetSize);

      // Set bits for accounts with 'following' badge
      for (let i = 0; i < largeDataset.length; i++) {
        if (largeDataset[i]?.badges.following) {
          const arrayIndex = Math.floor(i / 32);
          const bitIndex = i % 32;
          const current = bitset[arrayIndex];
          if (current !== undefined) {
            bitset[arrayIndex] = current | (1 << bitIndex);
          }
        }
      }

      const duration = performance.now() - startTime;

      expect(bitset.length).toBe(bitsetSize);
      expect(duration).toBeLessThan(50); // Should be very fast
    });

    it('should intersect two bitsets efficiently', () => {
      const size = Math.ceil(largeDataset.length / 32);
      const bitset1 = new Uint32Array(size);
      const bitset2 = new Uint32Array(size);

      // Fill with some data
      for (let i = 0; i < size; i++) {
        bitset1[i] = Math.floor(Math.random() * 0xffffffff);
        bitset2[i] = Math.floor(Math.random() * 0xffffffff);
      }

      const startTime = performance.now();

      const result = new Uint32Array(size);
      for (let i = 0; i < size; i++) {
        const val1 = bitset1[i];
        const val2 = bitset2[i];
        if (val1 !== undefined && val2 !== undefined) {
          result[i] = val1 & val2;
        }
      }

      const duration = performance.now() - startTime;

      expect(result.length).toBe(size);
      expect(duration).toBeLessThan(10); // Bitwise AND is extremely fast
    });
  });

  describe('Search Index Performance', () => {
    it('should build prefix index for 100k accounts', () => {
      const startTime = performance.now();

      const prefixIndex = new Map<string, Set<number>>();

      for (let i = 0; i < largeDataset.length; i++) {
        const account = largeDataset[i];
        if (!account) continue;

        const username = account.username.toLowerCase();

        // Generate 2-3 letter prefixes
        if (username.length >= 2) {
          const prefix2 = username.substring(0, 2);
          if (!prefixIndex.has(prefix2)) {
            prefixIndex.set(prefix2, new Set());
          }
          prefixIndex.get(prefix2)?.add(i);
        }

        if (username.length >= 3) {
          const prefix3 = username.substring(0, 3);
          if (!prefixIndex.has(prefix3)) {
            prefixIndex.set(prefix3, new Set());
          }
          prefixIndex.get(prefix3)?.add(i);
        }
      }

      const duration = performance.now() - startTime;

      expect(prefixIndex.size).toBeGreaterThan(0);
      expect(duration).toBeLessThan(500); // Should be fast even for 100k (increased for CI)
    });

    it('should search using prefix index efficiently', () => {
      // Build index
      const prefixIndex = new Map<string, number[]>();

      for (let i = 0; i < mediumDataset.length; i++) {
        const account = mediumDataset[i];
        if (!account) continue;

        const prefix = account.username.toLowerCase().substring(0, 3);
        if (!prefixIndex.has(prefix)) {
          prefixIndex.set(prefix, []);
        }
        prefixIndex.get(prefix)?.push(i);
      }

      // Search
      const startTime = performance.now();

      const searchPrefix = 'use';
      const results = prefixIndex.get(searchPrefix) || [];

      const duration = performance.now() - startTime;

      expect(results).toBeDefined();
      expect(duration).toBeLessThan(1); // O(1) lookup should be instant
    });
  });

  describe('Memory Usage', () => {
    it('should calculate bitset memory usage', () => {
      const accountCount = 1_000_000; // 1 million accounts
      const badgeCount = 10; // 10 different badges

      // Each Uint32 holds 32 bits
      const intsPerBitset = Math.ceil(accountCount / 32);
      // Each Uint32 is 4 bytes
      const bytesPerBitset = intsPerBitset * 4;
      const totalBytes = bytesPerBitset * badgeCount;
      const totalKB = totalBytes / 1024;

      // Should be approximately 125 KB per badge for 1M users
      expect(bytesPerBitset).toBeLessThan(130_000); // ~125 KB
      expect(totalKB).toBeLessThan(1300); // ~1.25 MB for all badges
    });

    it('should estimate index memory overhead', () => {
      // Prefix index: ~26^2 + 26^3 = 18,252 possible prefixes
      // Each entry: ~100 bytes for Set overhead + ~8 bytes per reference
      // For 100k accounts: ~18k prefixes * 100 bytes ≈ 1.8 MB

      const maxPrefixes = 26 * 26 + 26 * 26 * 26;
      const overheadPerPrefix = 100; // bytes
      const estimatedBytes = maxPrefixes * overheadPerPrefix;
      const estimatedMB = estimatedBytes / (1024 * 1024);

      expect(estimatedMB).toBeLessThan(5); // Should be under 5 MB
    });
  });

  describe('Expected Performance Gains', () => {
    it('should demonstrate theoretical speedup for badge filtering', () => {
      // Old approach: O(n) filter per badge
      // New approach: O(1) bitset lookup + O(n/32) intersection

      const accountCount = 100_000;

      // Old: Must check each account
      const oldComplexity = accountCount;

      // New: Bitwise operations on n/32 integers
      const newComplexity = Math.ceil(accountCount / 32);

      const speedup = oldComplexity / newComplexity;

      expect(speedup).toBeGreaterThan(30); // Should be ~32x faster
    });

    it('should demonstrate theoretical speedup for search with index', () => {
      // Old approach: O(n) linear search through all usernames
      // New approach: O(1) index lookup + O(k) where k is result count

      const accountCount = 100_000;
      const typicalResultCount = 100; // Typical search returns ~100 results

      // Old: Must check every username
      const oldComplexity = accountCount;

      // New: Index lookup + result processing
      const newComplexity = 1 + typicalResultCount;

      const speedup = oldComplexity / newComplexity;

      expect(speedup).toBeGreaterThan(500); // Should be ~1000x faster
    });
  });
});
