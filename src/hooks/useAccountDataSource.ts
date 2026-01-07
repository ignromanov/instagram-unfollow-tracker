/**
 * Account Data Source Hook - Lazy loading for virtualized lists
 *
 * Provides on-demand loading of account data from IndexedDB
 * with LRU caching for smooth scrolling performance
 */

import type { AccountBadges } from '@/core/types';
import { indexedDBService } from '@/lib/indexeddb/indexeddb-service';
import { useCallback, useEffect, useRef, useState } from 'react';

interface AccountSlice {
  start: number;
  end: number;
  accounts: AccountBadges[];
  timestamp: number;
}

interface UseAccountDataSourceOptions {
  fileHash: string | null;
  accountCount?: number; // Total account count (for bounds checking)
  sliceSize?: number; // Size of each cached slice (default: 500), also called chunkSize
  maxCachedSlices?: number; // Max slices to keep in cache (default: 20), also called overscan
  chunkSize?: number; // Alias for sliceSize
  overscan?: number; // Alias for maxCachedSlices
}

export function useAccountDataSource(options: UseAccountDataSourceOptions) {
  const {
    fileHash,
    accountCount = 0,
    sliceSize: sliceSizeOption,
    maxCachedSlices: maxCachedSlicesOption,
    chunkSize,
    overscan,
  } = options;

  // Support both naming conventions
  const sliceSize = sliceSizeOption || chunkSize || 500;
  const maxCachedSlices = maxCachedSlicesOption || overscan || 20;

  // LRU cache for account slices
  const cacheRef = useRef<Map<string, AccountSlice>>(new Map());
  // Track which slices are currently loading (by cache key)
  const loadingSlicesRef = useRef<Set<string>>(new Set());

  // Force update counter - increment to trigger re-render
  const [, setUpdateCounter] = useState(0);
  const forceUpdate = useCallback(() => {
    setUpdateCounter(c => c + 1);
  }, []);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  /**
   * Clear cache when file changes and track mount state
   */
  useEffect(() => {
    // Mark as mounted
    isMountedRef.current = true;

    // Clear cache on file change
    cacheRef.current.clear();
    loadingSlicesRef.current.clear();

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [fileHash]);

  /**
   * Get cache key for a range
   */
  const getCacheKey = useCallback((start: number, end: number): string => {
    return `${start}-${end}`;
  }, []);

  /**
   * Evict oldest slices if cache is full
   */
  const evictOldSlices = useCallback(() => {
    if (cacheRef.current.size <= maxCachedSlices) {
      return;
    }

    // Sort by timestamp and remove oldest
    const entries = Array.from(cacheRef.current.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );

    const toRemove = entries.slice(0, entries.length - maxCachedSlices);
    toRemove.forEach(([key]) => cacheRef.current.delete(key));
  }, [maxCachedSlices]);

  /**
   * Load account range from IndexedDB or cache
   */
  const getRange = useCallback(
    async (start: number, end: number): Promise<AccountBadges[]> => {
      if (!fileHash) {
        return [];
      }

      const cacheKey = getCacheKey(start, end);

      // Check cache
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        // Update timestamp for LRU
        cached.timestamp = Date.now();
        return cached.accounts;
      }

      // Check if already loading this slice
      if (loadingSlicesRef.current.has(cacheKey)) {
        // Return empty array while loading - will retry when forceUpdate triggers
        return [];
      }

      // Mark as loading
      loadingSlicesRef.current.add(cacheKey);

      // Load in background without blocking
      indexedDBService
        .getAccountsByRange(fileHash, start, end)
        .then(accounts => {
          // Only update state if component is still mounted
          if (!isMountedRef.current) {
            return;
          }

          // Cache the result
          cacheRef.current.set(cacheKey, {
            start,
            end,
            accounts,
            timestamp: Date.now(),
          });

          // Evict old slices if needed (but only if we're significantly over the limit)
          if (cacheRef.current.size > maxCachedSlices * 1.5) {
            evictOldSlices();
          }

          // Trigger re-render to show newly loaded data
          forceUpdate();
        })
        .catch(error => {
          // Only log if still mounted
          if (isMountedRef.current) {
            console.error('[Account Data Source] Error loading range:', error);
          }
        })
        .finally(() => {
          // Remove from loading set (safe even if unmounted)
          loadingSlicesRef.current.delete(cacheKey);
        });

      // Return empty array immediately - will be filled after load completes
      return [];
    },
    [fileHash, getCacheKey, evictOldSlices, forceUpdate, maxCachedSlices]
  );

  /**
   * Preload adjacent ranges for smooth scrolling
   */
  const preloadAdjacent = useCallback(
    async (currentStart: number, currentEnd: number) => {
      if (!fileHash) {
        return;
      }

      // Preload previous slice
      if (currentStart > 0) {
        const prevStart = Math.max(0, currentStart - sliceSize);
        const prevEnd = currentStart;
        const prevKey = getCacheKey(prevStart, prevEnd);

        if (!cacheRef.current.has(prevKey)) {
          getRange(prevStart, prevEnd).catch(() => {
            // Ignore preload errors
          });
        }
      }

      // Preload next slice
      const nextStart = currentEnd;
      const nextEnd = currentEnd + sliceSize;
      const nextKey = getCacheKey(nextStart, nextEnd);

      if (!cacheRef.current.has(nextKey)) {
        getRange(nextStart, nextEnd).catch(() => {
          // Ignore preload errors
        });
      }
    },
    [fileHash, sliceSize, getCacheKey, getRange]
  );

  /**
   * Load specific accounts by indices
   */
  const getByIndices = useCallback(
    async (indices: number[]): Promise<AccountBadges[]> => {
      if (!fileHash || indices.length === 0) {
        return [];
      }

      // Group indices into ranges
      const ranges: Array<{ start: number; end: number }> = [];
      const sortedIndices = [...indices].sort((a, b) => a - b);

      if (sortedIndices.length === 0) {
        return [];
      }

      const firstIdx = sortedIndices[0];
      if (firstIdx === undefined) return [];

      let rangeStart = firstIdx;
      let rangeEnd = firstIdx + 1;

      for (let i = 1; i < sortedIndices.length; i++) {
        const idx = sortedIndices[i];
        if (idx === undefined) continue;

        // If close to current range, extend it
        if (idx - rangeEnd < sliceSize / 2) {
          rangeEnd = idx + 1;
        } else {
          // Save current range and start new one
          ranges.push({ start: rangeStart, end: rangeEnd });
          rangeStart = idx;
          rangeEnd = idx + 1;
        }
      }
      ranges.push({ start: rangeStart, end: rangeEnd });

      // Load all ranges
      const allAccounts: AccountBadges[] = [];

      for (const range of ranges) {
        const accounts = await getRange(range.start, range.end);

        // Extract only requested indices
        for (const idx of sortedIndices) {
          if (idx >= range.start && idx < range.end) {
            const localIdx = idx - range.start;
            if (accounts[localIdx]) {
              allAccounts.push(accounts[localIdx]);
            }
          }
        }
      }

      return allAccounts;
    },
    [fileHash, sliceSize, getRange]
  );

  /**
   * Get a single account by index (synchronous from cache)
   * Triggers async load if not cached
   */
  const getAccount = useCallback(
    (index: number): AccountBadges | undefined => {
      if (!fileHash || index < 0 || (accountCount > 0 && index >= accountCount)) {
        return undefined;
      }

      // Determine which slice this index belongs to
      const sliceStart = Math.floor(index / sliceSize) * sliceSize;
      const sliceEnd = Math.min(sliceStart + sliceSize, accountCount || Infinity);
      const cacheKey = getCacheKey(sliceStart, sliceEnd);

      // Check if slice is in cache
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        // Update timestamp for LRU
        cached.timestamp = Date.now();
        const localIndex = index - sliceStart;
        return cached.accounts[localIndex];
      }

      // Check if already loading
      if (loadingSlicesRef.current.has(cacheKey)) {
        // Already loading, just return undefined
        return undefined;
      }

      // Not in cache and not loading - trigger async load (fire and forget)
      getRange(sliceStart, sliceEnd).catch(err => {
        console.error('[Account Data Source] Failed to load slice:', err);
      });

      // Return undefined while loading
      return undefined;
    },
    [fileHash, accountCount, sliceSize, getCacheKey, getRange]
  );

  /**
   * Clear the cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    loadingSlicesRef.current.clear();
  }, []);

  /**
   * Get cache stats
   */
  const getCacheStats = useCallback(() => {
    return {
      size: cacheRef.current.size,
      maxSize: maxCachedSlices,
    };
  }, [maxCachedSlices]);

  return {
    getAccount,
    getRange,
    getByIndices,
    preloadAdjacent,
    clearCache,
    getCacheStats,
  };
}
