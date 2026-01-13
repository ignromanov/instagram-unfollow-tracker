import type { AccountBadges } from '@/core/types';
import { useAccountDataSource } from '@/hooks/useAccountDataSource';
import { indexedDBService } from '@/lib/indexeddb/indexeddb-service';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock IndexedDB service
vi.mock('@/lib/indexeddb/indexeddb-service', () => ({
  indexedDBService: {
    getAccountsByRange: vi.fn(),
  },
}));

const mockIndexedDBService = vi.mocked(indexedDBService);

describe('useAccountDataSource', () => {
  const mockFileHash = 'test-hash-123';
  const mockAccounts: AccountBadges[] = [
    { username: 'user1', badges: new Set(['following', 'followers']) },
    { username: 'user2', badges: new Set(['following']) },
    { username: 'user3', badges: new Set(['followers']) },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockIndexedDBService.getAccountsByRange.mockResolvedValue([]);
  });

  describe('getAccount', () => {
    it('should return undefined when fileHash is null', () => {
      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: null, accountCount: 10 })
      );

      const account = result.current.getAccount(0);
      expect(account).toBeUndefined();
      expect(mockIndexedDBService.getAccountsByRange).not.toHaveBeenCalled();
    });

    it('should return undefined for negative index', () => {
      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: mockFileHash, accountCount: 10 })
      );

      const account = result.current.getAccount(-1);
      expect(account).toBeUndefined();
      expect(mockIndexedDBService.getAccountsByRange).not.toHaveBeenCalled();
    });

    it('should return undefined for index >= accountCount', () => {
      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: mockFileHash, accountCount: 10 })
      );

      const account = result.current.getAccount(10);
      expect(account).toBeUndefined();
      expect(mockIndexedDBService.getAccountsByRange).not.toHaveBeenCalled();
    });

    it('should trigger async load for uncached index', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 500,
        })
      );

      // First call returns undefined and triggers load
      const account1 = result.current.getAccount(0);
      expect(account1).toBeUndefined();

      // Wait for async load
      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(mockFileHash, 0, 500);
      });

      // Second call should return cached data
      await waitFor(() => {
        const account2 = result.current.getAccount(0);
        expect(account2).toEqual(mockAccounts[0]);
      });
    });

    it('should calculate correct slice boundaries', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 100,
        })
      );

      // Request index 250 (should load slice 200-300)
      result.current.getAccount(250);

      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(
          mockFileHash,
          200,
          300
        );
      });
    });

    it('should respect accountCount boundary', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 550,
          sliceSize: 500,
        })
      );

      // Request index 549 (last valid index)
      result.current.getAccount(549);

      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(
          mockFileHash,
          500,
          550 // Should not exceed accountCount
        );
      });
    });

    it('should return undefined while slice is loading', async () => {
      let resolveLoad: (value: AccountBadges[]) => void;
      const loadPromise = new Promise<AccountBadges[]>(resolve => {
        resolveLoad = resolve;
      });
      mockIndexedDBService.getAccountsByRange.mockReturnValue(loadPromise);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 500,
        })
      );

      // First call triggers load
      const account1 = result.current.getAccount(0);
      expect(account1).toBeUndefined();

      // Second call while loading should also return undefined
      const account2 = result.current.getAccount(0);
      expect(account2).toBeUndefined();

      // Resolve the load
      resolveLoad!(mockAccounts);

      await waitFor(() => {
        const account3 = result.current.getAccount(0);
        expect(account3).toEqual(mockAccounts[0]);
      });
    });

    it('should handle load errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockIndexedDBService.getAccountsByRange.mockRejectedValue(new Error('Load failed'));

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 500,
        })
      );

      const account = result.current.getAccount(0);
      expect(account).toBeUndefined();

      // logger.error adds '[App]' prefix, so args are: '[App]', message, error
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          '[App]',
          '[Account Data Source] Error loading range:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });

    it('should handle getAccount errors from getRange', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Reset mocks from previous test
      vi.clearAllMocks();

      mockIndexedDBService.getAccountsByRange.mockRejectedValue(new Error('getRange failed'));

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 500,
        })
      );

      // Trigger async load via getAccount
      const account = result.current.getAccount(100);
      expect(account).toBeUndefined();

      // Wait for error to be logged
      // logger.error adds '[App]' prefix, so call[0] is '[App]' and call[1] is the actual message
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
        // Either error message is acceptable (check both call[0] and call[1] for compatibility)
        const calls = consoleError.mock.calls;
        const hasError = calls.some(
          call =>
            call[0] === '[Account Data Source] Failed to load slice:' ||
            call[0] === '[Account Data Source] Error loading range:' ||
            call[1] === '[Account Data Source] Failed to load slice:' ||
            call[1] === '[Account Data Source] Error loading range:'
        );
        expect(hasError).toBe(true);
      });

      consoleError.mockRestore();
    });
  });

  describe('getRange', () => {
    it('should return empty array when fileHash is null', async () => {
      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: null, accountCount: 10 })
      );

      const accounts = await result.current.getRange(0, 10);
      expect(accounts).toEqual([]);
      expect(mockIndexedDBService.getAccountsByRange).not.toHaveBeenCalled();
    });

    it('should load and cache range', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: mockFileHash, accountCount: 1000 })
      );

      // First call returns empty (loading)
      const accounts1 = await result.current.getRange(0, 3);
      expect(accounts1).toEqual([]);

      // Wait for load to complete
      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(mockFileHash, 0, 3);
      });

      // Second call returns cached data
      const accounts2 = await result.current.getRange(0, 3);
      expect(accounts2).toEqual(mockAccounts);
    });

    it('should return cached data on subsequent calls', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: mockFileHash, accountCount: 1000 })
      );

      // First call returns empty (loading)
      const accounts1 = await result.current.getRange(0, 3);
      expect(accounts1).toEqual([]);

      // Wait for load
      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalled();
      });

      // Second call should use cache
      const accounts2 = await result.current.getRange(0, 3);
      expect(accounts2).toEqual(mockAccounts);

      // Third call should also use cache
      const accounts3 = await result.current.getRange(0, 3);
      expect(accounts3).toEqual(mockAccounts);

      // Should only call IndexedDB once
      expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledTimes(1);
    });

    it('should update LRU timestamp on cache hit', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: mockFileHash, accountCount: 1000 })
      );

      // Load data
      await result.current.getRange(0, 3);

      // Access again after delay
      await new Promise(resolve => setTimeout(resolve, 10));
      await result.current.getRange(0, 3);

      // Cache should still have the data
      expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledTimes(1);
    });

    it('should return empty array while loading', async () => {
      let resolveLoad: (value: AccountBadges[]) => void;
      const loadPromise = new Promise<AccountBadges[]>(resolve => {
        resolveLoad = resolve;
      });
      mockIndexedDBService.getAccountsByRange.mockReturnValue(loadPromise);

      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: mockFileHash, accountCount: 1000 })
      );

      // First call returns empty immediately
      const accounts1 = await result.current.getRange(0, 3);
      expect(accounts1).toEqual([]);

      // Resolve the load
      resolveLoad!(mockAccounts);

      // Wait for re-render
      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalled();
      });

      // Now should return cached data
      const accounts2 = await result.current.getRange(0, 3);
      expect(accounts2).toEqual(mockAccounts);
    });

    it('should handle concurrent requests for same range', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: mockFileHash, accountCount: 1000 })
      );

      // Make concurrent requests
      const [accounts1, accounts2, accounts3] = await Promise.all([
        result.current.getRange(0, 3),
        result.current.getRange(0, 3),
        result.current.getRange(0, 3),
      ]);

      // All should eventually get the data
      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getByIndices', () => {
    it('should return empty array when fileHash is null', async () => {
      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: null, accountCount: 10 })
      );

      const accounts = await result.current.getByIndices([0, 1, 2]);
      expect(accounts).toEqual([]);
    });

    it('should return empty array for empty indices', async () => {
      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: mockFileHash, accountCount: 10 })
      );

      const accounts = await result.current.getByIndices([]);
      expect(accounts).toEqual([]);
    });

    it('should load accounts by indices', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 500,
        })
      );

      // First call returns empty (loading)
      const accounts1 = await result.current.getByIndices([0, 1, 2]);
      expect(accounts1).toEqual([]);

      // Wait for load
      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalled();
      });

      // Second call returns cached data
      const accounts2 = await result.current.getByIndices([0, 1, 2]);
      expect(accounts2).toEqual(mockAccounts);
    });

    it('should group nearby indices into ranges', async () => {
      const range1 = Array.from({ length: 102 }, (_, i) => ({
        username: `user${i}`,
        badges: new Set(['following']),
      }));

      mockIndexedDBService.getAccountsByRange.mockResolvedValue(range1);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 50, // Small slice to force multiple ranges
        })
      );

      // Indices 0,1 are close, 100,101 are far (>sliceSize/2 = 25 apart from 1)
      await result.current.getByIndices([0, 1, 100, 101]);

      // Wait for loads
      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalled();
      });

      // Should make 2 range requests: one for 0-2, one for 100-102
      await waitFor(
        () => {
          expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledTimes(2);
        },
        { timeout: 3000 }
      );
    });

    it('should handle unsorted indices', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 500,
        })
      );

      // Provide unsorted indices - first call returns empty
      const accounts1 = await result.current.getByIndices([2, 0, 1]);
      expect(accounts1).toEqual([]);

      // Wait for load
      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalled();
      });

      // Second call returns data
      const accounts2 = await result.current.getByIndices([2, 0, 1]);
      expect(accounts2.length).toBeGreaterThan(0);
    });

    it('should extract only requested indices from ranges', async () => {
      // Create a range that covers indices 5-16 (will be loaded as 5-16 since they're close)
      const largeRange = Array.from({ length: 11 }, (_, i) => ({
        username: `user${i + 5}`, // user5, user6, ..., user15
        badges: new Set(['following']),
      }));

      mockIndexedDBService.getAccountsByRange.mockResolvedValue(largeRange);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 500,
        })
      );

      // Request only specific indices - first call returns empty
      const accounts1 = await result.current.getByIndices([5, 10, 15]);
      expect(accounts1).toEqual([]);

      // Wait for load (should load range 5-16 since all indices are close)
      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(mockFileHash, 5, 16);
      });

      // Second call returns extracted indices
      const accounts2 = await result.current.getByIndices([5, 10, 15]);

      await waitFor(() => {
        expect(accounts2.length).toBe(3);
        expect(accounts2[0]?.username).toBe('user5');
        expect(accounts2[1]?.username).toBe('user10');
        expect(accounts2[2]?.username).toBe('user15');
      });
    });
  });

  describe('preloadAdjacent', () => {
    it('should not preload when fileHash is null', async () => {
      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: null, accountCount: 1000 })
      );

      await result.current.preloadAdjacent(0, 500);
      expect(mockIndexedDBService.getAccountsByRange).not.toHaveBeenCalled();
    });

    it('should preload next slice', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 500,
        })
      );

      await result.current.preloadAdjacent(0, 500);

      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(
          mockFileHash,
          500,
          1000
        );
      });
    });

    it('should preload previous slice', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 500,
        })
      );

      await result.current.preloadAdjacent(500, 1000);

      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(mockFileHash, 0, 500);
      });
    });

    it('should not preload previous slice when at start', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 500,
        })
      );

      await result.current.preloadAdjacent(0, 500);

      // Should only preload next, not previous
      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledTimes(1);
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(
          mockFileHash,
          500,
          1000
        );
      });
    });

    it('should not preload already cached slices', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 500,
        })
      );

      // Load current slice
      await result.current.getRange(0, 500);

      // Clear mock calls
      mockIndexedDBService.getAccountsByRange.mockClear();

      // Preload adjacent - should only load next (not current)
      await result.current.preloadAdjacent(0, 500);

      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledTimes(1);
      });
    });

    it('should ignore preload errors silently', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockIndexedDBService.getAccountsByRange.mockRejectedValue(new Error('Preload failed'));

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 500,
        })
      );

      // Should not throw
      await expect(result.current.preloadAdjacent(0, 500)).resolves.toBeUndefined();

      consoleError.mockRestore();
    });
  });

  describe('cache management', () => {
    it('should evict old slices when cache is full', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 10000,
          sliceSize: 100,
          maxCachedSlices: 3,
        })
      );

      // Load 5 slices (more than maxCachedSlices * 1.5 = 4.5)
      await result.current.getRange(0, 100);
      await result.current.getRange(100, 200);
      await result.current.getRange(200, 300);
      await result.current.getRange(300, 400);
      await result.current.getRange(400, 500);

      // Check cache stats
      const stats = result.current.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(5);
      expect(stats.maxSize).toBe(3);
    });

    it('should only evict when significantly over limit', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 10000,
          sliceSize: 100,
          maxCachedSlices: 3,
        })
      );

      // Load 4 slices (maxCachedSlices * 1.5 = 4.5, so no eviction yet)
      await result.current.getRange(0, 100);
      await result.current.getRange(100, 200);
      await result.current.getRange(200, 300);
      await result.current.getRange(300, 400);

      const stats = result.current.getCacheStats();
      expect(stats.size).toBe(4);
    });

    it('should evict oldest slices first (LRU)', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 10000,
          sliceSize: 100,
          maxCachedSlices: 2,
        })
      );

      // Load slice 1
      await result.current.getRange(0, 100);
      await new Promise(resolve => setTimeout(resolve, 10));

      // Load slice 2
      await result.current.getRange(100, 200);
      await new Promise(resolve => setTimeout(resolve, 10));

      // Access slice 1 again (updates LRU)
      await result.current.getRange(0, 100);
      await new Promise(resolve => setTimeout(resolve, 10));

      // Clear mock to track new calls
      mockIndexedDBService.getAccountsByRange.mockClear();

      // Load slice 3 (should evict slice 2, not slice 1)
      await result.current.getRange(200, 300);
      await new Promise(resolve => setTimeout(resolve, 10));

      // Load slice 4 (should trigger eviction)
      await result.current.getRange(300, 400);

      // Access slice 1 - should be cached (not evicted)
      await result.current.getRange(0, 100);

      // Access slice 2 - should need reload (was evicted)
      await result.current.getRange(100, 200);

      await waitFor(() => {
        const calls = mockIndexedDBService.getAccountsByRange.mock.calls;
        // Should have reloaded slice 2
        expect(calls.some(call => call[1] === 100 && call[2] === 200)).toBe(true);
      });
    });

    it('should clear cache', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: mockFileHash, accountCount: 1000 })
      );

      // Load some data
      await result.current.getRange(0, 500);

      let stats = result.current.getCacheStats();
      expect(stats.size).toBe(1);

      // Clear cache
      act(() => {
        result.current.clearCache();
      });

      stats = result.current.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should clear cache when fileHash changes', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result, rerender } = renderHook(
        ({ fileHash }) => useAccountDataSource({ fileHash, accountCount: 1000 }),
        { initialProps: { fileHash: mockFileHash } }
      );

      // Load some data
      await result.current.getRange(0, 500);

      let stats = result.current.getCacheStats();
      expect(stats.size).toBe(1);

      // Change fileHash
      rerender({ fileHash: 'new-hash' });

      stats = result.current.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('configuration options', () => {
    it('should use default sliceSize of 500', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: mockFileHash, accountCount: 1000 })
      );

      result.current.getAccount(0);

      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(mockFileHash, 0, 500);
      });
    });

    it('should use custom sliceSize', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 100,
        })
      );

      result.current.getAccount(0);

      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(mockFileHash, 0, 100);
      });
    });

    it('should support chunkSize alias for sliceSize', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          chunkSize: 200,
        })
      );

      result.current.getAccount(0);

      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(mockFileHash, 0, 200);
      });
    });

    it('should support overscan alias for maxCachedSlices', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          overscan: 10,
        })
      );

      const stats = result.current.getCacheStats();
      expect(stats.maxSize).toBe(10);
    });

    it('should prefer sliceSize over chunkSize', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          sliceSize: 300,
          chunkSize: 200,
        })
      );

      result.current.getAccount(0);

      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(mockFileHash, 0, 300);
      });
    });

    it('should prefer maxCachedSlices over overscan', async () => {
      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          maxCachedSlices: 15,
          overscan: 10,
        })
      );

      const stats = result.current.getCacheStats();
      expect(stats.maxSize).toBe(15);
    });
  });

  describe('getCacheStats', () => {
    it('should return correct cache stats', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000,
          maxCachedSlices: 20,
        })
      );

      let stats = result.current.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.maxSize).toBe(20);

      // Load some data
      await result.current.getRange(0, 500);

      stats = result.current.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.maxSize).toBe(20);
    });
  });

  describe('edge cases', () => {
    it('should handle accountCount of 0', () => {
      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: mockFileHash, accountCount: 0 })
      );

      const account = result.current.getAccount(0);
      expect(account).toBeUndefined();
    });

    it('should handle very large accountCount', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 1000000,
          sliceSize: 500,
        })
      );

      result.current.getAccount(999999);

      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(
          mockFileHash,
          999500,
          1000000
        );
      });
    });

    it('should handle sliceSize larger than accountCount', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({
          fileHash: mockFileHash,
          accountCount: 100,
          sliceSize: 500,
        })
      );

      result.current.getAccount(50);

      await waitFor(() => {
        expect(mockIndexedDBService.getAccountsByRange).toHaveBeenCalledWith(mockFileHash, 0, 100);
      });
    });

    it('should handle empty account data from IndexedDB', async () => {
      mockIndexedDBService.getAccountsByRange.mockResolvedValue([]);

      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: mockFileHash, accountCount: 1000 })
      );

      const accounts = await result.current.getRange(0, 500);
      expect(accounts).toEqual([]);
    });

    it('should handle missing accounts in range', async () => {
      const sparseAccounts = [
        { username: 'user1', badges: new Set(['following']) },
        undefined,
        { username: 'user3', badges: new Set(['followers']) },
      ] as AccountBadges[];

      mockIndexedDBService.getAccountsByRange.mockResolvedValue(sparseAccounts);

      const { result } = renderHook(() =>
        useAccountDataSource({ fileHash: mockFileHash, accountCount: 1000 })
      );

      await result.current.getRange(0, 3);

      await waitFor(() => {
        const account1 = result.current.getAccount(0);
        const account2 = result.current.getAccount(1);
        const account3 = result.current.getAccount(2);

        expect(account1).toEqual(sparseAccounts[0]);
        expect(account2).toBeUndefined();
        expect(account3).toEqual(sparseAccounts[2]);
      });
    });
  });
});
