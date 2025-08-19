// Synchronous filter engine - runs on main thread
import type { AccountBadges } from '@/core/types';
import type { FilterEngine, FilterEngineResult } from './engine';
import { runFilter } from './runFilter';

/**
 * Synchronous filter engine that runs filtering on the main thread
 * Useful for:
 * - Unit tests (no worker mocking needed)
 * - Small datasets (avoid worker overhead)
 * - Environments where workers are unavailable (SSR, some test environments)
 */
export class SyncFilterEngine implements FilterEngine {
  /**
   * Filter accounts synchronously
   */
  async filter(
    accounts: AccountBadges[],
    searchQuery: string,
    activeFilters: string[]
  ): Promise<FilterEngineResult> {
    try {
      const filteredAccounts = runFilter(accounts, searchQuery, activeFilters);

      return {
        filteredAccounts,
        processingTime: 0,
      };
    } catch (error) {
      console.error('[SyncFilterEngine] Error:', error);

      return {
        filteredAccounts: [],
        processingTime: 0,
      };
    }
  }

  /**
   * No cleanup needed for synchronous engine
   */
  dispose(): void {
    // No-op for sync engine
  }

  /**
   * Get engine type
   */
  getType(): 'sync' {
    return 'sync';
  }
}
