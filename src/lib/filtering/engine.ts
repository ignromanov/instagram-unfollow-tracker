// FilterEngine interface and implementations
import type { AccountBadges } from '@/core/types';

/**
 * Result of filtering operation
 */
export interface FilterEngineResult {
  filteredAccounts: AccountBadges[];
  processingTime: number;
  engineType?: string; // Optional field for diagnostics
}

/**
 * Filter engine configuration
 */
export interface FilterEngineConfig {
  mode?: 'worker' | 'sync' | 'auto' | 'optimized';
  autoThreshold?: number; // Auto-switch to sync if dataset smaller than this
}

/**
 * FilterEngine interface - abstracts filtering implementation
 * Allows for worker-based, synchronous, or other implementations
 */
export interface FilterEngine {
  /**
   * Filter accounts by search query and active filters
   * @param accounts - Array of accounts to filter
   * @param searchQuery - Search query to filter by username
   * @param activeFilters - Array of badge filters to apply
   * @returns Promise with filtered accounts and processing time
   */
  filter(
    accounts: AccountBadges[],
    searchQuery: string,
    activeFilters: string[]
  ): Promise<FilterEngineResult>;

  /**
   * Dispose of engine resources (e.g. terminate worker)
   */
  dispose(): void;

  /**
   * Get engine type
   */
  getType(): string;
}
