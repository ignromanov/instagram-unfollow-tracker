/**
 * IndexedDB Service v2 - High-level API for optimized columnar storage
 *
 * Features:
 * - Chunked account ingestion with progress tracking
 * - Bitset-based badge storage for fast filtering
 * - Lazy loading support for virtualization
 * - Search index caching with TTL
 */

import type { AccountBadges, BadgeKey } from '@/core/types';
import { BitSet, StringColumnBuilder, StringColumnReader } from './bitset';
import {
  CACHE_CONFIG,
  DB_CONFIG,
  STORES,
  STORE_CONFIGS,
  type BitsetRecord,
  type ColumnRecord,
  type FileMetadataRecord,
  type SearchIndexRecord,
  type SearchIndexType,
} from './indexeddb-schema';

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  // In-memory caches
  private bitsetCache = new Map<string, BitSet>(); // `${fileHash}:${badge}` → BitSet
  private columnCache = new Map<string, StringColumnReader>(); // `${fileHash}:${column}` → Reader

  /**
   * Initialize database connection
   */
  private async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores if they don't exist
        for (const [storeName, config] of Object.entries(STORE_CONFIGS)) {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, {
              keyPath: config.keyPath,
            });

            // Create indexes
            if (config.indexes) {
              for (const index of config.indexes) {
                store.createIndex(index.name, index.keyPath, index.options);
              }
            }
          }
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Save file metadata
   */
  async saveFileMetadata(metadata: FileMetadataRecord): Promise<void> {
    const db = await this.init();
    const tx = db.transaction([STORES.FILES], 'readwrite');
    const store = tx.objectStore(STORES.FILES);

    await new Promise<void>((resolve, reject) => {
      const request = store.put(metadata);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileHash: string): Promise<FileMetadataRecord | null> {
    const db = await this.init();
    const tx = db.transaction([STORES.FILES], 'readonly');
    const store = tx.objectStore(STORES.FILES);

    return new Promise((resolve, reject) => {
      const request = store.get(fileHash);
      request.onsuccess = () => {
        const data = request.result;
        if (data && data.uploadDate) {
          data.uploadDate = new Date(data.uploadDate);
        }
        resolve(data || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store all accounts at once (optimized - build bitsets once, write once)
   */
  async storeAllAccounts(fileHash: string, accounts: AccountBadges[]): Promise<void> {
    const db = await this.init();

    // Build all columns
    const usernameBuilder = new StringColumnBuilder();
    const displayNameBuilder = new StringColumnBuilder();

    for (const account of accounts) {
      usernameBuilder.push(account.username.toLowerCase());
      displayNameBuilder.push(account.username);
    }

    const usernameColumn = usernameBuilder.build();
    const displayNameColumn = displayNameBuilder.build();

    // Build all bitsets at once
    const badges: BadgeKey[] = [
      'following',
      'followers',
      'mutuals',
      'notFollowingBack',
      'notFollowedBack',
      'pending',
      'permanent',
      'restricted',
      'close',
      'unfollowed',
      'dismissed',
    ];

    const bitsets = new Map<BadgeKey, { bitset: BitSet; count: number }>();

    // Initialize bitsets
    for (const badge of badges) {
      bitsets.set(badge, {
        bitset: new BitSet(accounts.length),
        count: 0,
      });
    }

    // Single pass through accounts to set all bits
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      if (!account) continue;

      for (const badge of badges) {
        if (account.badges[badge]) {
          const entry = bitsets.get(badge);
          if (entry) {
            entry.bitset.set(i);
            entry.count++;
          }
        }
      }
    }

    // Write everything in one transaction
    const tx = db.transaction([STORES.COLUMNS, STORES.BITSETS], 'readwrite');

    // Write columns
    const columnsStore = tx.objectStore(STORES.COLUMNS);

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = columnsStore.put({
          fileHash,
          column: 'usernames',
          data: usernameColumn.data,
          offsets: usernameColumn.offsets,
          length: usernameColumn.length,
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = columnsStore.put({
          fileHash,
          column: 'displayNames',
          data: displayNameColumn.data,
          offsets: displayNameColumn.offsets,
          length: displayNameColumn.length,
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
    ]);

    // Write all bitsets
    const bitsetsStore = tx.objectStore(STORES.BITSETS);
    const bitsetPromises = Array.from(bitsets.entries()).map(([badge, { bitset, count }]) => {
      return new Promise<void>((resolve, reject) => {
        const request = bitsetsStore.put({
          fileHash,
          badge,
          data: bitset.toUint8Array(),
          accountCount: count,
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(bitsetPromises);

    // Wait for transaction to complete
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Append account chunk (called during streaming ingestion)
   */
  async appendAccountsChunk(
    fileHash: string,
    accounts: AccountBadges[],
    startIndex: number
  ): Promise<void> {
    const db = await this.init();

    // Use single transaction for all stores - faster with proper batching
    const tx = db.transaction([STORES.COLUMNS, STORES.BITSETS], 'readwrite');

    // Build username column
    const usernameBuilder = new StringColumnBuilder();
    const displayNameBuilder = new StringColumnBuilder();

    for (const account of accounts) {
      usernameBuilder.push(account.username.toLowerCase());
      displayNameBuilder.push(account.username);
    }

    const usernameColumn = usernameBuilder.build();
    const displayNameColumn = displayNameBuilder.build();

    // Store columns first (sequential writes, no blocking)
    const columnsPromise = Promise.all([
      this.appendColumn(tx, fileHash, 'usernames', usernameColumn, startIndex),
      this.appendColumn(tx, fileHash, 'displayNames', displayNameColumn, startIndex),
    ]);

    // Update badge bitsets in parallel (read-modify-write operations)
    const badges: BadgeKey[] = [
      'following',
      'followers',
      'mutuals',
      'notFollowingBack',
      'notFollowedBack',
      'pending',
      'permanent',
      'restricted',
      'close',
      'unfollowed',
      'dismissed',
    ];

    const bitsetsPromise = Promise.all(
      badges.map(badge => this.updateBadgeBitset(tx, fileHash, badge, accounts, startIndex))
    );

    // Wait for both columns and bitsets to complete
    await Promise.all([columnsPromise, bitsetsPromise]);

    // Wait for transaction to complete
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  private async appendColumn(
    tx: IDBTransaction,
    fileHash: string,
    column: 'usernames' | 'displayNames' | 'hrefs',
    newData: { data: Uint8Array; offsets: Uint32Array; length: number },
    startIndex: number
  ): Promise<void> {
    const store = tx.objectStore(STORES.COLUMNS);

    // Get existing column or create new
    const existing = await new Promise<ColumnRecord | undefined>((resolve, reject) => {
      const request = store.get([fileHash, column]);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    let finalData: Uint8Array;
    let finalOffsets: Uint32Array;
    let finalLength: number;

    if (existing && startIndex > 0) {
      // Append to existing column
      const oldDataSize = existing.data.byteLength;
      const newDataSize = newData.data.byteLength;

      finalData = new Uint8Array(oldDataSize + newDataSize);
      finalData.set(existing.data, 0);
      finalData.set(newData.data, oldDataSize);

      finalOffsets = new Uint32Array(existing.length + newData.length + 1);
      finalOffsets.set(existing.offsets!, 0);

      // Adjust new offsets
      for (let i = 0; i < newData.offsets.length; i++) {
        const offset = newData.offsets[i];
        if (offset !== undefined) {
          finalOffsets[existing.length + i] = oldDataSize + offset;
        }
      }

      finalLength = existing.length + newData.length;
    } else {
      // First chunk
      finalData = newData.data;
      finalOffsets = newData.offsets;
      finalLength = newData.length;
    }

    const record: ColumnRecord = {
      fileHash,
      column,
      data: finalData,
      offsets: finalOffsets,
      length: finalLength,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateBadgeBitset(
    tx: IDBTransaction,
    fileHash: string,
    badge: BadgeKey,
    accounts: AccountBadges[],
    startIndex: number
  ): Promise<void> {
    const store = tx.objectStore(STORES.BITSETS);

    // Get existing bitset or create new
    const existing = await new Promise<BitsetRecord | undefined>((resolve, reject) => {
      const request = store.get([fileHash, badge]);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    let bitset: BitSet;
    let count = existing?.accountCount || 0;

    if (existing) {
      bitset = BitSet.fromUint8Array(existing.data);
    } else {
      // Estimate total size (will grow as needed)
      bitset = new BitSet(startIndex + accounts.length);
    }

    // Update bits for this chunk
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      if (!account) continue;

      const accountIndex = startIndex + i;

      if (account.badges[badge]) {
        bitset.set(accountIndex);
        count++;
      }
    }

    const record: BitsetRecord = {
      fileHash,
      badge,
      data: bitset.toUint8Array(),
      accountCount: count,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get accounts by index range (for virtualization)
   * Loads both usernames and badges for the specified range
   */
  async getAccountsByRange(fileHash: string, start: number, end: number): Promise<AccountBadges[]> {
    // Get username column
    const cacheKey = `${fileHash}:usernames`;
    let reader = this.columnCache.get(cacheKey);

    if (!reader) {
      const db = await this.init();
      const tx = db.transaction([STORES.COLUMNS], 'readonly');
      const store = tx.objectStore(STORES.COLUMNS);

      const column = await new Promise<ColumnRecord>((resolve, reject) => {
        const request = store.get([fileHash, 'usernames']);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!column) return [];

      reader = new StringColumnReader(column.data, column.offsets!);
      this.columnCache.set(cacheKey, reader);
    }

    // Get usernames for range
    const actualEnd = Math.min(end, reader.length);
    const usernames = reader.getRange(start, actualEnd);

    // Load all badge bitsets (they are cached after first load)
    const allBadgeKeys: BadgeKey[] = [
      'following',
      'followers',
      'pending',
      'permanent',
      'restricted',
      'close',
      'unfollowed',
      'dismissed',
      'notFollowingBack',
      'notFollowedBack',
      'mutuals',
    ];

    // Load bitsets in parallel (uses cache if already loaded)
    const bitsetEntries = await Promise.all(
      allBadgeKeys.map(async badge => {
        const bitset = await this.getBadgeBitset(fileHash, badge);
        return [badge, bitset] as const;
      })
    );

    // Filter out null bitsets and create map
    const bitsets = new Map<BadgeKey, BitSet>();
    for (const [badge, bitset] of bitsetEntries) {
      if (bitset) {
        bitsets.set(badge, bitset);
      }
    }

    // Build account objects with badges
    const accounts: AccountBadges[] = usernames.map((username, localIndex) => {
      const globalIndex = start + localIndex;
      const badges: Partial<Record<BadgeKey, number | true>> = {};

      // Check each bitset for this account
      for (const [badge, bitset] of bitsets) {
        if (bitset.has(globalIndex)) {
          badges[badge] = true;
        }
      }

      return { username, badges };
    });

    return accounts;
  }

  /**
   * Get badge bitset (with caching)
   */
  async getBadgeBitset(fileHash: string, badge: BadgeKey): Promise<BitSet | null> {
    const cacheKey = `${fileHash}:${badge}`;
    let bitset = this.bitsetCache.get(cacheKey);

    if (bitset) {
      return bitset;
    }

    const db = await this.init();
    const tx = db.transaction([STORES.BITSETS], 'readonly');
    const store = tx.objectStore(STORES.BITSETS);

    const record = await new Promise<BitsetRecord | undefined>((resolve, reject) => {
      const request = store.get([fileHash, badge]);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });

    if (!record) {
      return null;
    }

    bitset = BitSet.fromUint8Array(record.data);
    this.bitsetCache.set(cacheKey, bitset);

    return bitset;
  }

  /**
   * Get badge statistics (fast - from metadata)
   */
  async getBadgeStats(fileHash: string): Promise<Record<BadgeKey, number>> {
    const db = await this.init();
    const tx = db.transaction([STORES.BITSETS], 'readonly');
    const store = tx.objectStore(STORES.BITSETS);
    const index = store.index('fileHash');

    const stats: Partial<Record<BadgeKey, number>> = {};

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(fileHash));

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const record = cursor.value as BitsetRecord;
          stats[record.badge] = record.accountCount;
          cursor.continue();
        } else {
          resolve(stats as Record<BadgeKey, number>);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save search index
   */
  async putSearchIndex(
    fileHash: string,
    type: SearchIndexType,
    key: string,
    bitset: BitSet
  ): Promise<void> {
    const db = await this.init();
    const tx = db.transaction([STORES.INDEXES], 'readwrite');
    const store = tx.objectStore(STORES.INDEXES);

    const now = Date.now();
    const ttl = CACHE_CONFIG.INDEX_CACHE_DAYS * 24 * 60 * 60 * 1000;

    const record: SearchIndexRecord = {
      fileHash,
      type,
      key,
      data: bitset.toUint8Array(),
      createdAt: now,
      expiresAt: now + ttl,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get search index
   */
  async getSearchIndex(
    fileHash: string,
    type: SearchIndexType,
    key: string
  ): Promise<BitSet | null> {
    const db = await this.init();
    const tx = db.transaction([STORES.INDEXES], 'readonly');
    const store = tx.objectStore(STORES.INDEXES);

    const record = await new Promise<SearchIndexRecord | undefined>((resolve, reject) => {
      const request = store.get([fileHash, type, key]);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!record) return null;

    // Check expiration
    if (Date.now() > record.expiresAt) {
      // Delete expired index
      const delTx = db.transaction([STORES.INDEXES], 'readwrite');
      delTx.objectStore(STORES.INDEXES).delete([fileHash, type, key]);
      return null;
    }

    return BitSet.fromUint8Array(record.data);
  }

  /**
   * Clear all data for a file
   */
  async clearFile(fileHash: string): Promise<void> {
    const db = await this.init();
    const tx = db.transaction(Object.values(STORES), 'readwrite');

    // Clear from each store
    for (const storeName of Object.values(STORES)) {
      const store = tx.objectStore(storeName);

      if (storeName === STORES.FILES) {
        await new Promise<void>((resolve, reject) => {
          const request = store.delete(fileHash);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } else {
        // Use index to find all records for this file
        const index = store.index('fileHash');
        const range = IDBKeyRange.only(fileHash);

        await new Promise<void>((resolve, reject) => {
          const request = index.openCursor(range);

          request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            } else {
              resolve();
            }
          };

          request.onerror = () => reject(request.error);
        });
      }
    }

    // Clear caches
    this.clearCaches(fileHash);
  }

  /**
   * Clear in-memory caches
   */
  clearCaches(fileHash?: string): void {
    if (fileHash) {
      // Clear caches for specific file
      const prefix = `${fileHash}:`;
      for (const key of this.bitsetCache.keys()) {
        if (key.startsWith(prefix)) {
          this.bitsetCache.delete(key);
        }
      }
      for (const key of this.columnCache.keys()) {
        if (key.startsWith(prefix)) {
          this.columnCache.delete(key);
        }
      }
    } else {
      // Clear all caches
      this.bitsetCache.clear();
      this.columnCache.clear();
    }
  }

  /**
   * Get all files (for file picker/management)
   */
  async getAllFiles(): Promise<FileMetadataRecord[]> {
    const db = await this.init();
    const tx = db.transaction([STORES.FILES], 'readonly');
    const store = tx.objectStore(STORES.FILES);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const files = request.result.map(file => {
          if (file.uploadDate) {
            file.uploadDate = new Date(file.uploadDate);
          }
          return file;
        });
        resolve(files);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService();
