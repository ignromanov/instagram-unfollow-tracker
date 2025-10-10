/**
 * IndexedDB Filter Engine - Optimized filtering using bitsets from IndexedDB
 *
 * Uses pre-computed badge bitsets stored in IndexedDB for fast filtering
 * Supports lazy loading with virtualization
 */

import type { AccountBadges, BadgeKey } from '@/core/types';
import { BitSet } from '../indexeddb/bitset';
import { indexedDBService } from '../indexeddb/indexeddb-service';
import { hasSearchIndexes, smartSearch } from '../search-index';

interface FilterEngineResult {
  filteredAccounts: AccountBadges[];
  processingTime: number;
  totalMatches?: number;
}

export class IndexedDBFilterEngine {
  private fileHash: string | null = null;
  private totalAccounts = 0;

  // Cache for frequently used bitsets
  private bitsetCache = new Map<BadgeKey, BitSet>();

  /**
   * Initialize engine with file hash
   */
  async init(fileHash: string, totalAccounts?: number): Promise<void> {
    this.fileHash = fileHash;

    // Use provided total or fetch from metadata
    if (totalAccounts !== undefined) {
      this.totalAccounts = totalAccounts;
    } else {
      const metadata = await indexedDBService.getFileMetadata(fileHash);
      if (metadata) {
        this.totalAccounts = metadata.accountCount;
      }
    }

    // Preload common bitsets
    const commonBadges: BadgeKey[] = ['following', 'followers', 'mutuals'];
    await Promise.all(commonBadges.map(badge => this.loadBitset(badge)));
  }

  /**
   * Reset engine state
   */
  reset(): void {
    this.fileHash = null;
    this.totalAccounts = 0;
    this.bitsetCache.clear();
  }

  /**
   * Load bitset for a badge (with caching)
   */
  private async loadBitset(badge: BadgeKey): Promise<BitSet | null> {
    if (!this.fileHash) {
      throw new Error('[IndexedDB Filter Engine] Not initialized');
    }

    // Check cache first
    if (this.bitsetCache.has(badge)) {
      const cached = this.bitsetCache.get(badge);
      if (cached) return cached;
    }

    // Load from IndexedDB
    const bitset = await indexedDBService.getBadgeBitset(this.fileHash, badge);

    if (bitset) {
      this.bitsetCache.set(badge, bitset);
    }

    return bitset;
  }

  /**
   * Filter accounts by badges and search query
   * Returns indices of matching accounts
   */
  async filterToIndices(searchQuery: string, activeFilters: BadgeKey[]): Promise<number[]> {
    if (!this.fileHash) {
      throw new Error('[IndexedDB Filter Engine] Not initialized');
    }

    // Start with all accounts if no filters
    let resultBitset: BitSet | null = null;

    // Apply badge filters (AND logic)
    if (activeFilters.length > 0) {
      const bitsets = await Promise.all(activeFilters.map(badge => this.loadBitset(badge)));

      // Filter out null bitsets
      const validBitsets = bitsets.filter((b): b is BitSet => b !== null);

      if (validBitsets.length === 0) {
        return []; // No matches if any badge has no data
      }

      // Intersect all bitsets
      const firstBitset = validBitsets[0];
      if (!firstBitset) return [];

      resultBitset = firstBitset;

      for (let i = 1; i < validBitsets.length; i++) {
        const bitset = validBitsets[i];
        if (bitset) {
          resultBitset = resultBitset.intersect(bitset);
        }
      }
    }

    // Convert bitset to indices
    let indices: number[];

    if (resultBitset) {
      indices = resultBitset.toIndices();
    } else {
      // No filters - return all indices
      indices = Array.from({ length: this.totalAccounts }, (_, i) => i);
    }

    // Apply search query if present
    if (searchQuery.trim()) {
      indices = await this.applySearchFilter(indices, searchQuery);
    }

    return indices;
  }

  /**
   * Apply search filter to account indices
   * Uses search indexes when available for better performance
   */
  private async applySearchFilter(indices: number[], searchQuery: string): Promise<number[]> {
    if (!this.fileHash) {
      return indices;
    }

    const query = searchQuery.toLowerCase().trim();

    // Try using search index first
    const hasIndexes = await hasSearchIndexes(this.fileHash);

    if (hasIndexes) {
      const searchBitset = await smartSearch(this.fileHash, query);

      if (searchBitset) {
        // Create bitset from indices
        const indicesBitset = BitSet.fromIndices(indices, this.totalAccounts);

        // Intersect with search results
        const resultBitset = indicesBitset.intersect(searchBitset);

        return resultBitset.toIndices();
      }
    }

    // Fallback to linear search
    const filtered: number[] = [];

    // Load accounts in batches for search
    const BATCH_SIZE = 1000;
    for (let i = 0; i < indices.length; i += BATCH_SIZE) {
      const batchIndices = indices.slice(i, Math.min(i + BATCH_SIZE, indices.length));
      const batchStart = Math.min(...batchIndices);
      const batchEnd = Math.max(...batchIndices) + 1;

      const accounts = await indexedDBService.getAccountsByRange(
        this.fileHash,
        batchStart,
        batchEnd
      );

      // Filter by search query
      for (const index of batchIndices) {
        const localIndex = index - batchStart;
        const account = accounts[localIndex];
        if (account && account.username.toLowerCase().includes(query)) {
          filtered.push(index);
        }
      }
    }

    return filtered;
  }

  /**
   * Filter and return actual account objects (for compatibility)
   */
  async filter(
    accounts: AccountBadges[], // Ignored - we use IndexedDB
    searchQuery: string,
    activeFilters: string[]
  ): Promise<FilterEngineResult> {
    // Get filtered indices
    const indices = await this.filterToIndices(searchQuery, activeFilters as BadgeKey[]);

    // Load actual accounts for the indices
    const filteredAccounts = await this.loadAccountsByIndices(indices);

    return {
      filteredAccounts,
      processingTime: 0,
      totalMatches: indices.length,
    };
  }

  /**
   * Load accounts by their indices (for range-based virtualization)
   */
  async loadAccountsByIndices(indices: number[]): Promise<AccountBadges[]> {
    if (!this.fileHash || indices.length === 0) {
      return [];
    }

    // Group indices into contiguous ranges for efficient loading
    const ranges: Array<{ start: number; end: number; indices: number[] }> = [];

    const sortedIndices = [...indices].sort((a, b) => a - b);

    if (sortedIndices.length === 0) {
      return [];
    }

    const firstIndex = sortedIndices[0];
    if (firstIndex === undefined) return [];

    let currentRange = {
      start: firstIndex,
      end: firstIndex + 1,
      indices: [firstIndex],
    };

    for (let i = 1; i < sortedIndices.length; i++) {
      const idx = sortedIndices[i];
      if (idx === undefined) continue;

      // If index is close to current range, extend it
      if (idx - currentRange.end < 10) {
        currentRange.end = idx + 1;
        currentRange.indices.push(idx);
      } else {
        // Start new range
        ranges.push(currentRange);
        currentRange = { start: idx, end: idx + 1, indices: [idx] };
      }
    }
    ranges.push(currentRange);

    // Load all ranges
    const results: AccountBadges[] = [];

    for (const range of ranges) {
      const accounts = await indexedDBService.getAccountsByRange(
        this.fileHash,
        range.start,
        range.end
      );

      // Extract only the accounts we need
      for (const idx of range.indices) {
        const localIdx = idx - range.start;
        if (accounts[localIdx]) {
          results.push(accounts[localIdx]!);
        }
      }
    }

    // Maintain original order
    const indexMap = new Map(indices.map((idx, order) => [idx, order]));
    results.sort((a, b) => {
      const orderA = indexMap.get(indices.find(i => results.indexOf(a) === i) || 0) || 0;
      const orderB = indexMap.get(indices.find(i => results.indexOf(b) === i) || 0) || 0;
      return orderA - orderB;
    });

    return results;
  }

  /**
   * Get badge statistics (fast - from metadata)
   */
  async getStats(): Promise<Record<BadgeKey, number>> {
    if (!this.fileHash) {
      throw new Error('[IndexedDB Filter Engine] Not initialized');
    }

    return await indexedDBService.getBadgeStats(this.fileHash);
  }

  /**
   * Clear all data and reset engine
   */
  clear(): void {
    this.fileHash = null;
    this.totalAccounts = 0;
    this.bitsetCache.clear();
  }
}
