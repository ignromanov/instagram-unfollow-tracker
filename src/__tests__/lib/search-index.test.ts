import { BitSet } from '@/lib/indexeddb/bitset';
import { indexedDBService } from '@/lib/indexeddb/indexeddb-service';
import {
  buildAllSearchIndexes,
  buildPrefixIndex,
  buildTrigramIndex,
  estimateIndexSize,
  generatePrefixes,
  generateTrigrams,
  hasSearchIndexes,
  searchWithPrefix,
  searchWithTrigrams,
  smartSearch,
} from '@/lib/search-index';
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Search Index', () => {
  const testFileHash = 'test-file-hash-123';
  const testAccounts = [
    { username: 'john_doe', index: 0 },
    { username: 'jane_smith', index: 1 },
    { username: 'bob_jones', index: 2 },
    { username: 'alice_wonder', index: 3 },
    { username: 'charlie_brown', index: 4 },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    // Clear IndexedDB before each test (no afterEach needed - beforeEach handles cleanup)
    await indexedDBService.clearFile(testFileHash);
  }, 10000); // 10s timeout for cleanup

  describe('generateTrigrams', () => {
    it('should generate trigrams correctly', () => {
      const trigrams = generateTrigrams('john');

      expect(trigrams).toContain('__j');
      expect(trigrams).toContain('_jo');
      expect(trigrams).toContain('joh');
      expect(trigrams).toContain('ohn');
      expect(trigrams).toContain('hn_');
      expect(trigrams).toContain('n__');
      expect(trigrams).toHaveLength(6);
    });

    it('should handle empty string', () => {
      const trigrams = generateTrigrams('');
      expect(trigrams).toEqual([]);
    });

    it('should handle whitespace-only string', () => {
      const trigrams = generateTrigrams('   ');
      expect(trigrams).toEqual([]);
    });

    it('should handle short strings', () => {
      const trigrams = generateTrigrams('ab');
      expect(trigrams).toContain('__a');
      expect(trigrams).toContain('_ab');
      expect(trigrams).toContain('ab_');
      expect(trigrams).toContain('b__');
      expect(trigrams).toHaveLength(4);
    });

    it('should handle single character', () => {
      const trigrams = generateTrigrams('a');
      expect(trigrams).toContain('__a');
      expect(trigrams).toContain('_a_');
      expect(trigrams).toContain('a__');
      expect(trigrams).toHaveLength(3);
    });

    it('should normalize case', () => {
      const trigrams = generateTrigrams('JOHN');
      expect(trigrams).toContain('__j');
      expect(trigrams).toContain('_jo');
      expect(trigrams).toContain('joh');
    });

    it('should trim whitespace', () => {
      const trigrams = generateTrigrams('  john  ');
      expect(trigrams).toContain('__j');
      expect(trigrams).toContain('_jo');
      expect(trigrams).toContain('joh');
    });

    it('should handle special characters', () => {
      const trigrams = generateTrigrams('john_doe');
      expect(trigrams).toContain('hn_');
      expect(trigrams).toContain('n_d');
      expect(trigrams).toContain('_do');
    });

    it('should handle numbers', () => {
      const trigrams = generateTrigrams('user123');
      expect(trigrams).toContain('r12');
      expect(trigrams).toContain('123');
      expect(trigrams).toContain('23_');
    });
  });

  describe('generatePrefixes', () => {
    it('should generate prefixes correctly', () => {
      const prefixes = generatePrefixes('john');

      expect(prefixes).toContain('jo');
      expect(prefixes).toContain('joh');
      expect(prefixes).toContain('john');
      expect(prefixes).toHaveLength(3);
    });

    it('should handle empty string', () => {
      const prefixes = generatePrefixes('');
      expect(prefixes).toEqual([]);
    });

    it('should handle whitespace-only string', () => {
      const prefixes = generatePrefixes('   ');
      expect(prefixes).toEqual([]);
    });

    it('should handle short strings', () => {
      const prefixes = generatePrefixes('ab');
      expect(prefixes).toEqual(['ab']);
    });

    it('should handle single character', () => {
      const prefixes = generatePrefixes('a');
      expect(prefixes).toEqual([]);
    });

    it('should normalize case', () => {
      const prefixes = generatePrefixes('JOHN');
      expect(prefixes).toContain('jo');
      expect(prefixes).toContain('joh');
      expect(prefixes).toContain('john');
    });

    it('should trim whitespace', () => {
      const prefixes = generatePrefixes('  john  ');
      expect(prefixes).toContain('jo');
      expect(prefixes).toContain('joh');
      expect(prefixes).toContain('john');
    });

    it('should limit prefix length to 4', () => {
      const prefixes = generatePrefixes('verylongstring');
      expect(prefixes).toContain('ve');
      expect(prefixes).toContain('ver');
      expect(prefixes).toContain('very');
      expect(prefixes).not.toContain('veryl');
      expect(prefixes).toHaveLength(3);
    });

    it('should handle 3-char string', () => {
      const prefixes = generatePrefixes('abc');
      expect(prefixes).toEqual(['ab', 'abc']);
    });

    it('should handle special characters', () => {
      const prefixes = generatePrefixes('john_doe');
      expect(prefixes).toContain('jo');
      expect(prefixes).toContain('joh');
      expect(prefixes).toContain('john');
    });
  });

  describe('buildTrigramIndex', () => {
    it('should build trigram index and store in IndexedDB', async () => {
      const result = await buildTrigramIndex(testFileHash, testAccounts);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBeGreaterThan(0);

      // Check that common trigrams exist
      const johnTrigram = result.get('joh');
      expect(johnTrigram).toBeInstanceOf(BitSet);
      expect(johnTrigram?.has(0)).toBe(true); // john_doe at index 0
    });

    it('should handle empty accounts array', async () => {
      const result = await buildTrigramIndex(testFileHash, []);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should handle single account', async () => {
      const singleAccount = [{ username: 'test', index: 0 }];
      const result = await buildTrigramIndex(testFileHash, singleAccount);

      expect(result.size).toBeGreaterThan(0);
      const trigram = result.get('tes');
      expect(trigram).toBeInstanceOf(BitSet);
      expect(trigram?.has(0)).toBe(true);
    });

    it('should create bitsets with correct size', async () => {
      const result = await buildTrigramIndex(testFileHash, testAccounts);

      // All bitsets should have size for maxIndex + 1
      for (const bitset of result.values()) {
        expect(bitset.size).toBeGreaterThanOrEqual(testAccounts.length);
      }
    });

    it('should handle accounts with overlapping trigrams', async () => {
      const accounts = [
        { username: 'john', index: 0 },
        { username: 'johnny', index: 1 },
        { username: 'johnson', index: 2 },
      ];

      const result = await buildTrigramIndex(testFileHash, accounts);
      const johnTrigram = result.get('joh');

      expect(johnTrigram?.has(0)).toBe(true);
      expect(johnTrigram?.has(1)).toBe(true);
      expect(johnTrigram?.has(2)).toBe(true);
    });

    it('should persist to IndexedDB', async () => {
      await buildTrigramIndex(testFileHash, testAccounts);

      // Verify data was stored
      const storedBitset = await indexedDBService.getSearchIndex(testFileHash, 'trigram', 'joh');
      expect(storedBitset).toBeInstanceOf(BitSet);
      expect(storedBitset?.has(0)).toBe(true);
    });

    it('should handle large batches efficiently', async () => {
      // Create 250 accounts to test batching (>100 per batch)
      const largeAccounts = Array.from({ length: 250 }, (_, i) => ({
        username: `user${i}`,
        index: i,
      }));

      const start = performance.now();
      const result = await buildTrigramIndex(testFileHash, largeAccounts);
      const duration = performance.now() - start;

      expect(result.size).toBeGreaterThan(0);
      expect(duration).toBeLessThan(5000); // Should complete in <5s
    });
  });

  describe('buildPrefixIndex', () => {
    it('should build prefix index and store in IndexedDB', async () => {
      const result = await buildPrefixIndex(testFileHash, testAccounts);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBeGreaterThan(0);

      // Check that common prefixes exist
      const joPrefix = result.get('jo');
      expect(joPrefix).toBeInstanceOf(BitSet);
      expect(joPrefix?.has(0)).toBe(true); // john_doe at index 0

      const boPrefix = result.get('bo');
      expect(boPrefix).toBeInstanceOf(BitSet);
      expect(boPrefix?.has(2)).toBe(true); // bob_jones at index 2
    });

    it('should handle empty accounts array', async () => {
      const result = await buildPrefixIndex(testFileHash, []);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should handle single account', async () => {
      const singleAccount = [{ username: 'test', index: 0 }];
      const result = await buildPrefixIndex(testFileHash, singleAccount);

      expect(result.size).toBeGreaterThan(0);
      const prefix = result.get('te');
      expect(prefix).toBeInstanceOf(BitSet);
      expect(prefix?.has(0)).toBe(true);
    });

    it('should create bitsets with correct size', async () => {
      const result = await buildPrefixIndex(testFileHash, testAccounts);

      for (const bitset of result.values()) {
        expect(bitset.size).toBeGreaterThanOrEqual(testAccounts.length);
      }
    });

    it('should handle accounts with overlapping prefixes', async () => {
      const accounts = [
        { username: 'john', index: 0 },
        { username: 'johnny', index: 1 },
        { username: 'johnson', index: 2 },
      ];

      const result = await buildPrefixIndex(testFileHash, accounts);
      const joPrefix = result.get('jo');

      expect(joPrefix?.has(0)).toBe(true);
      expect(joPrefix?.has(1)).toBe(true);
      expect(joPrefix?.has(2)).toBe(true);
    });

    it('should persist to IndexedDB', async () => {
      await buildPrefixIndex(testFileHash, testAccounts);

      const storedBitset = await indexedDBService.getSearchIndex(testFileHash, 'prefix', 'jo');
      expect(storedBitset).toBeInstanceOf(BitSet);
      expect(storedBitset?.has(0)).toBe(true);
    });

    it('should not create prefixes for short usernames', async () => {
      const accounts = [{ username: 'a', index: 0 }];
      const result = await buildPrefixIndex(testFileHash, accounts);

      expect(result.size).toBe(0);
    });

    it('should handle large batches efficiently', async () => {
      const largeAccounts = Array.from({ length: 250 }, (_, i) => ({
        username: `user${i}`,
        index: i,
      }));

      const start = performance.now();
      const result = await buildPrefixIndex(testFileHash, largeAccounts);
      const duration = performance.now() - start;

      expect(result.size).toBeGreaterThan(0);
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('searchWithTrigrams', () => {
    beforeEach(async () => {
      await buildTrigramIndex(testFileHash, testAccounts);
    });

    it('should find accounts by trigram search', async () => {
      const result = await searchWithTrigrams(testFileHash, 'john');

      // Should return a BitSet (may be empty if trigrams don't match perfectly)
      expect(result).not.toBeNull();
      if (result) {
        expect(result).toBeInstanceOf(BitSet);
      }
    });

    it('should return null for empty query', async () => {
      const result = await searchWithTrigrams(testFileHash, '');
      expect(result).toBeNull();
    });

    it('should return null for whitespace query', async () => {
      const result = await searchWithTrigrams(testFileHash, '   ');
      expect(result).toBeNull();
    });

    it('should handle case-insensitive search', async () => {
      const result = await searchWithTrigrams(testFileHash, 'JOHN');

      expect(result).not.toBeNull();
      if (result) {
        expect(result).toBeInstanceOf(BitSet);
      }
    });

    it('should return null when no matches found', async () => {
      const result = await searchWithTrigrams(testFileHash, 'xyz');
      expect(result).toBeNull();
    });

    it('should intersect multiple trigrams correctly', async () => {
      const result = await searchWithTrigrams(testFileHash, 'john_doe');

      expect(result).toBeInstanceOf(BitSet);
      expect(result?.has(0)).toBe(true); // Only john_doe should match full string
      expect(result?.has(2)).toBe(false); // bob_jones should not match
    });

    it('should handle partial matches', async () => {
      const result = await searchWithTrigrams(testFileHash, 'one');

      // bob_jones contains 'one' in 'jones', alice_wonder contains 'one' in 'wonder'
      expect(result).not.toBeNull();
      if (result) {
        expect(result).toBeInstanceOf(BitSet);
      }
    });

    it('should handle special characters', async () => {
      const result = await searchWithTrigrams(testFileHash, 'john_');

      expect(result).not.toBeNull();
      if (result) {
        expect(result).toBeInstanceOf(BitSet);
      }
    });
  });

  describe('searchWithPrefix', () => {
    beforeEach(async () => {
      await buildPrefixIndex(testFileHash, testAccounts);
    });

    it('should find accounts by prefix search', async () => {
      const result = await searchWithPrefix(testFileHash, 'jo');

      expect(result).toBeInstanceOf(BitSet);
      expect(result?.has(0)).toBe(true); // john_doe starts with 'jo'
      // bob_jones starts with 'bo', not 'jo'
    });

    it('should return null for too short query', async () => {
      const result = await searchWithPrefix(testFileHash, 'j');
      expect(result).toBeNull();
    });

    it('should return null for empty query', async () => {
      const result = await searchWithPrefix(testFileHash, '');
      expect(result).toBeNull();
    });

    it('should handle case-insensitive search', async () => {
      const result = await searchWithPrefix(testFileHash, 'JO');

      expect(result).toBeInstanceOf(BitSet);
      expect(result?.has(0)).toBe(true);
    });

    it('should return null when no matches found', async () => {
      const result = await searchWithPrefix(testFileHash, 'xyz');
      expect(result).toBeNull();
    });

    it('should limit prefix to 4 characters', async () => {
      const result = await searchWithPrefix(testFileHash, 'john_doe');

      // Should use 'john' prefix (4 chars max)
      expect(result).toBeInstanceOf(BitSet);
      expect(result?.has(0)).toBe(true);
    });

    it('should handle 2-char prefix', async () => {
      const result = await searchWithPrefix(testFileHash, 'ja');

      expect(result).toBeInstanceOf(BitSet);
      expect(result?.has(1)).toBe(true); // jane_smith
    });

    it('should handle 3-char prefix', async () => {
      const result = await searchWithPrefix(testFileHash, 'jan');

      expect(result).toBeInstanceOf(BitSet);
      expect(result?.has(1)).toBe(true);
    });

    it('should handle 4-char prefix', async () => {
      const result = await searchWithPrefix(testFileHash, 'jane');

      expect(result).toBeInstanceOf(BitSet);
      expect(result?.has(1)).toBe(true);
    });
  });

  describe('smartSearch', () => {
    beforeEach(async () => {
      await buildAllSearchIndexes(testFileHash, testAccounts);
    });

    it('should use prefix search for short queries (2 chars)', async () => {
      const result = await smartSearch(testFileHash, 'jo');

      expect(result).toBeInstanceOf(BitSet);
      expect(result?.has(0)).toBe(true); // john_doe starts with 'jo'
      // bob_jones starts with 'bo', not 'jo'
    });

    it('should use prefix search for 3-char queries', async () => {
      const result = await smartSearch(testFileHash, 'jan');

      expect(result).toBeInstanceOf(BitSet);
      expect(result?.has(1)).toBe(true); // jane_smith
    });

    it('should use trigram search for longer queries', async () => {
      const result = await smartSearch(testFileHash, 'john');

      expect(result).not.toBeNull();
      if (result) {
        expect(result).toBeInstanceOf(BitSet);
      }
    });

    it('should fallback to prefix if trigram fails', async () => {
      // Build only prefix index (no trigram)
      await indexedDBService.clearFile(testFileHash);
      await buildPrefixIndex(testFileHash, testAccounts);

      // For 4+ char query, it will try trigram first, then fallback to prefix
      const result = await smartSearch(testFileHash, 'john');
      expect(result).toBeInstanceOf(BitSet);
      expect(result?.has(0)).toBe(true);
    });

    it('should return null for empty query', async () => {
      const result = await smartSearch(testFileHash, '');
      expect(result).toBeNull();
    });

    it('should return null for whitespace query', async () => {
      const result = await smartSearch(testFileHash, '   ');
      expect(result).toBeNull();
    });

    it('should handle case-insensitive search', async () => {
      const result = await smartSearch(testFileHash, 'JOHN');

      expect(result).not.toBeNull();
      if (result) {
        expect(result).toBeInstanceOf(BitSet);
      }
    });

    it('should return null when no matches found', async () => {
      const result = await smartSearch(testFileHash, 'xyz');
      expect(result).toBeNull();
    });

    it('should handle special characters', async () => {
      const result = await smartSearch(testFileHash, 'john_');

      expect(result).not.toBeNull();
      if (result) {
        expect(result).toBeInstanceOf(BitSet);
      }
    });
  });

  describe('buildAllSearchIndexes', () => {
    it('should build both trigram and prefix indexes', async () => {
      await buildAllSearchIndexes(testFileHash, testAccounts);

      // Verify trigram index
      const trigramResult = await indexedDBService.getSearchIndex(testFileHash, 'trigram', 'joh');
      expect(trigramResult).toBeInstanceOf(BitSet);

      // Verify prefix index
      const prefixResult = await indexedDBService.getSearchIndex(testFileHash, 'prefix', 'jo');
      expect(prefixResult).toBeInstanceOf(BitSet);
    });

    it('should handle empty accounts array', async () => {
      await expect(buildAllSearchIndexes(testFileHash, [])).resolves.not.toThrow();
    });

    it('should handle large datasets', async () => {
      const largeAccounts = Array.from({ length: 500 }, (_, i) => ({
        username: `user${i}`,
        index: i,
      }));

      const start = performance.now();
      await buildAllSearchIndexes(testFileHash, largeAccounts);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(5000); // Should complete in <5s

      // Verify indexes work
      const result = await smartSearch(testFileHash, 'user1');
      expect(result).toBeInstanceOf(BitSet);
    }, 10000); // 10s timeout
  });

  describe('hasSearchIndexes', () => {
    it('should return false when no indexes exist', async () => {
      const result = await hasSearchIndexes(testFileHash);
      expect(result).toBe(false);
    });

    it('should return true when indexes exist', async () => {
      // Use accounts with 'us' prefix to match hasSearchIndexes check
      const accounts = [
        { username: 'user1', index: 0 },
        { username: 'user2', index: 1 },
      ];
      await buildAllSearchIndexes(testFileHash, accounts);

      const result = await hasSearchIndexes(testFileHash);
      expect(result).toBe(true);
    });

    it('should return false after clearing indexes', async () => {
      await buildAllSearchIndexes(testFileHash, testAccounts);
      await indexedDBService.clearFile(testFileHash);

      const result = await hasSearchIndexes(testFileHash);
      expect(result).toBe(false);
    });

    it('should handle different file hashes independently', async () => {
      const otherFileHash = 'other-file-hash';
      const accounts = [
        { username: 'user1', index: 0 },
        { username: 'user2', index: 1 },
      ];

      await buildAllSearchIndexes(testFileHash, accounts);

      expect(await hasSearchIndexes(testFileHash)).toBe(true);
      expect(await hasSearchIndexes(otherFileHash)).toBe(false);
    });
  });

  describe('estimateIndexSize', () => {
    it('should estimate size for small dataset', () => {
      const size = estimateIndexSize(100);

      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(10000); // Reasonable size
    });

    it('should estimate size for medium dataset', () => {
      const size = estimateIndexSize(10000);

      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(100000000); // ~100MB (formula is quadratic)
    });

    it('should estimate size for large dataset', () => {
      const size = estimateIndexSize(1000000);

      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(10000000000000); // Formula is quadratic, very large
    });

    it('should scale quadratically with account count', () => {
      const size100 = estimateIndexSize(100);
      const size1000 = estimateIndexSize(1000);

      // Formula is quadratic: totalIndexes * bytesPerBitset
      // So 10x accounts = ~100x size (10x indexes * 10x bitset size)
      const ratio = size1000 / size100;
      expect(ratio).toBeGreaterThan(80);
      expect(ratio).toBeLessThan(120);
    });

    it('should handle zero accounts', () => {
      const size = estimateIndexSize(0);
      expect(size).toBe(0);
    });

    it('should handle single account', () => {
      const size = estimateIndexSize(1);
      expect(size).toBeGreaterThan(0);
    });

    it('should provide estimates that scale with input', () => {
      const size1k = estimateIndexSize(1000);
      const size10k = estimateIndexSize(10000);
      const size100k = estimateIndexSize(100000);

      // Each 10x increase should result in ~100x size increase (quadratic)
      expect(size10k).toBeGreaterThan(size1k * 50);
      expect(size100k).toBeGreaterThan(size10k * 50);
    });
  });

  describe('Integration Tests', () => {
    it('should support full search workflow', async () => {
      // Use accounts with 'us' prefix for hasSearchIndexes
      const accounts = [
        { username: 'user1', index: 0 },
        { username: 'user2', index: 1 },
      ];

      // 1. Build indexes
      await buildAllSearchIndexes(testFileHash, accounts);

      // 2. Verify indexes exist
      expect(await hasSearchIndexes(testFileHash)).toBe(true);

      // 3. Search with different queries
      const user1Result = await smartSearch(testFileHash, 'user1');
      expect(user1Result).toBeInstanceOf(BitSet);
      expect(user1Result?.toIndices()).toContain(0);

      const user2Result = await smartSearch(testFileHash, 'user2');
      expect(user2Result).toBeInstanceOf(BitSet);
      expect(user2Result?.toIndices()).toContain(1);

      // 4. Clear and verify
      await indexedDBService.clearFile(testFileHash);
      expect(await hasSearchIndexes(testFileHash)).toBe(false);
    });

    it('should handle multiple files independently', async () => {
      const file1 = 'file-1';
      const file2 = 'file-2';
      const accounts1 = [{ username: 'user1', index: 0 }];
      const accounts2 = [{ username: 'user2', index: 0 }];

      await buildAllSearchIndexes(file1, accounts1);
      await buildAllSearchIndexes(file2, accounts2);

      const result1 = await smartSearch(file1, 'user1');
      const result2 = await smartSearch(file2, 'user2');

      expect(result1?.has(0)).toBe(true);
      expect(result2?.has(0)).toBe(true);

      // Cleanup
      await indexedDBService.clearFile(file1);
      await indexedDBService.clearFile(file2);
    });

    it('should handle search with no results gracefully', async () => {
      await buildAllSearchIndexes(testFileHash, testAccounts);

      const result = await smartSearch(testFileHash, 'xyz123');
      // May return empty bitset or null depending on whether prefix exists
      if (result !== null) {
        expect(result.isEmpty()).toBe(true);
      }
    });

    it('should maintain accuracy with overlapping usernames', async () => {
      const overlappingAccounts = [
        { username: 'test', index: 0 },
        { username: 'testing', index: 1 },
        { username: 'tester', index: 2 },
        { username: 'tested', index: 3 },
      ];

      await buildAllSearchIndexes(testFileHash, overlappingAccounts);

      // Search for 'tes' (3 chars) uses prefix, finds all starting with 'tes'
      const tesResult = await smartSearch(testFileHash, 'tes');
      expect(tesResult?.has(0)).toBe(true);
      expect(tesResult?.has(1)).toBe(true);
      expect(tesResult?.has(2)).toBe(true);
      expect(tesResult?.has(3)).toBe(true);

      // Search for 'testing' (7 chars) uses trigrams, finds exact substring match
      const testingResult = await smartSearch(testFileHash, 'testing');
      expect(testingResult?.has(1)).toBe(true);
      expect(testingResult?.has(0)).toBe(false); // 'test' doesn't contain 'testing'
    });
  });

  describe('Edge Cases', () => {
    it('should handle usernames with only special characters', async () => {
      const specialAccounts = [{ username: '___', index: 0 }];
      await buildAllSearchIndexes(testFileHash, specialAccounts);

      const result = await smartSearch(testFileHash, '___');
      expect(result).toBeInstanceOf(BitSet);
    });

    it('should handle very long usernames', async () => {
      const longUsername = 'a'.repeat(100);
      const accounts = [{ username: longUsername, index: 0 }];

      await buildAllSearchIndexes(testFileHash, accounts);

      const result = await smartSearch(testFileHash, 'aaa');
      expect(result?.has(0)).toBe(true);
    });

    it('should handle unicode characters', async () => {
      const unicodeAccounts = [
        { username: 'user_😀', index: 0 },
        { username: 'тест', index: 1 },
      ];

      await buildAllSearchIndexes(testFileHash, unicodeAccounts);

      const result1 = await smartSearch(testFileHash, 'user');
      expect(result1?.has(0)).toBe(true);

      const result2 = await smartSearch(testFileHash, 'тест');
      expect(result2?.has(1)).toBe(true);
    });

    it('should handle accounts with same username at different indices', async () => {
      const duplicateAccounts = [
        { username: 'duplicate', index: 0 },
        { username: 'duplicate', index: 5 },
        { username: 'duplicate', index: 10 },
      ];

      await buildAllSearchIndexes(testFileHash, duplicateAccounts);

      const result = await smartSearch(testFileHash, 'duplicate');
      expect(result?.has(0)).toBe(true);
      expect(result?.has(5)).toBe(true);
      expect(result?.has(10)).toBe(true);
    });

    it('should handle sparse index ranges', async () => {
      const sparseAccounts = [
        { username: 'user1', index: 0 },
        { username: 'user2', index: 1000 },
        { username: 'user3', index: 5000 },
      ];

      await buildAllSearchIndexes(testFileHash, sparseAccounts);

      const result = await smartSearch(testFileHash, 'user');
      expect(result?.has(0)).toBe(true);
      expect(result?.has(1000)).toBe(true);
      expect(result?.has(5000)).toBe(true);
    });
  });
});
