/**
 * IndexedDB Cache - Compatibility layer for v1 API
 *
 * This module provides backward compatibility with the old cache API
 * while using the new optimized v2 storage system under the hood.
 *
 * For new code, use indexeddb-service.ts directly.
 */

import { indexedDBService } from './indexeddb-service';

interface CachedData {
  fileHash: string;
  metadata: {
    name: string;
    size: number;
    uploadDate: Date;
    accountCount: number;
  };
  timestamp: number;
}

class IndexedDBCache {
  /**
   * Get cached data (legacy API)
   * Note: Returns null - new system uses chunked loading
   */
  async get(fileHash: string): Promise<CachedData | null> {
    // Check if file exists in v2 storage
    const metadata = await indexedDBService.getFileMetadata(fileHash);

    if (!metadata) {
      return null;
    }

    // Check if cache is still valid (7 days)
    const cacheAge = Date.now() - metadata.lastAccessed;
    const maxAge = 7 * 24 * 60 * 60 * 1000;

    if (cacheAge > maxAge) {
      return null;
    }

    // Update last accessed time
    await indexedDBService.saveFileMetadata({
      ...metadata,
      lastAccessed: Date.now(),
    });

    // Return cache info (data is loaded on-demand from IndexedDB)
    return {
      fileHash,
      metadata: {
        name: metadata.fileName,
        size: metadata.fileSize,
        uploadDate: metadata.uploadDate,
        accountCount: metadata.accountCount,
      },
      timestamp: metadata.lastAccessed,
    };
  }

  /**
   * Set cached data (legacy API)
   * Note: This is now handled by chunked ingestion
   */
  async set(_data: CachedData): Promise<void> {
    // Legacy method - data is now stored via appendAccountsChunk
    console.warn('[IndexedDB] set() is deprecated - use indexedDBService.appendAccountsChunk()');
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    const files = await indexedDBService.getAllFiles();

    for (const file of files) {
      await indexedDBService.clearFile(file.fileHash);
    }

    indexedDBService.clearCaches();
  }
}

export const dbCache = new IndexedDBCache();

/**
 * Generate file hash for caching
 * Uses first 1MB of file for fast hash generation
 */
export async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  // Hash first 1MB for performance, or entire file if smaller
  const hashSize = Math.min(buffer.byteLength, 1024 * 1024);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer.slice(0, hashSize));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
