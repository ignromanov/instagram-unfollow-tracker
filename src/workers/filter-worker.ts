/**
 * Filter Worker - Runs IndexedDBFilterEngine off the main thread
 *
 * This worker handles all filter operations to keep the main thread responsive.
 * Uses Comlink for seamless async communication.
 *
 * @module filter-worker
 */

import * as Comlink from 'comlink';

import { IndexedDBFilterEngine } from '@/lib/filtering/IndexedDBFilterEngine';
import type { BadgeKey } from '@/core/types';

// Single engine instance per worker
let engineInstance: IndexedDBFilterEngine | null = null;
let isInitialized = false;

/**
 * Filter Worker API exposed via Comlink
 */
const filterWorkerApi = {
  /**
   * Initialize the filter engine with file hash and account count
   */
  async initialize(fileHash: string, totalAccounts: number): Promise<void> {
    engineInstance = new IndexedDBFilterEngine();
    await engineInstance.init(fileHash, totalAccounts);
    isInitialized = true;
  },

  /**
   * Check if the worker is initialized
   */
  isReady(): boolean {
    return isInitialized && engineInstance !== null;
  },

  /**
   * Filter accounts by search query and badge filters
   * Returns array of matching account indices
   */
  async filterToIndices(query: string, filters: string[]): Promise<number[]> {
    if (!engineInstance) {
      throw new Error('[FilterWorker] Engine not initialized');
    }
    return engineInstance.filterToIndices(query, filters as BadgeKey[]);
  },

  /**
   * Get badge statistics (counts per badge type)
   */
  async getStats(): Promise<Record<BadgeKey, number>> {
    if (!engineInstance) {
      throw new Error('[FilterWorker] Engine not initialized');
    }
    return engineInstance.getStats();
  },

  /**
   * Reset the engine (clear caches and state)
   */
  reset(): void {
    if (engineInstance) {
      engineInstance.reset();
    }
    isInitialized = false;
  },

  /**
   * Dispose of the engine instance
   */
  dispose(): void {
    if (engineInstance) {
      engineInstance.clear();
      engineInstance = null;
    }
    isInitialized = false;
  },
};

// Export type for use in the hook
export type FilterWorkerApi = typeof filterWorkerApi;

// Expose the API via Comlink
Comlink.expose(filterWorkerApi);
