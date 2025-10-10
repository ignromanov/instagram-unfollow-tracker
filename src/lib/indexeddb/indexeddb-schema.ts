/**
 * IndexedDB Schema v2 - Optimized columnar storage with bitsets
 *
 * Architecture:
 * - files: File metadata and cache registry
 * - columns: Columnar account data (usernames as packed strings)
 * - bitsets: Badge presence stored as typed arrays
 * - timestamps: Sparse timestamp storage for time-based badges
 * - indexes: Search index cache (prefix/trigram bitsets)
 */

import type { BadgeKey } from '@/core/types';

export const DB_CONFIG = {
  name: 'instagram-tracker-v2',
  version: 2,
} as const;

export const STORES = {
  FILES: 'files',
  COLUMNS: 'columns',
  BITSETS: 'bitsets',
  TIMESTAMPS: 'timestamps',
  INDEXES: 'indexes',
} as const;

// Store definitions for IDB initialization
export interface StoreConfig {
  keyPath: string | string[];
  indexes?: Array<{
    name: string;
    keyPath: string | string[];
    options?: IDBIndexParameters;
  }>;
}

export const STORE_CONFIGS: Record<string, StoreConfig> = {
  [STORES.FILES]: {
    keyPath: 'fileHash',
    indexes: [
      { name: 'lastAccessed', keyPath: 'lastAccessed' },
      { name: 'version', keyPath: 'version' },
    ],
  },
  [STORES.COLUMNS]: {
    keyPath: ['fileHash', 'column'],
    indexes: [{ name: 'fileHash', keyPath: 'fileHash' }],
  },
  [STORES.BITSETS]: {
    keyPath: ['fileHash', 'badge'],
    indexes: [{ name: 'fileHash', keyPath: 'fileHash' }],
  },
  [STORES.TIMESTAMPS]: {
    keyPath: ['fileHash', 'username'],
    indexes: [{ name: 'fileHash', keyPath: 'fileHash' }],
  },
  [STORES.INDEXES]: {
    keyPath: ['fileHash', 'type', 'key'],
    indexes: [
      { name: 'fileHash', keyPath: 'fileHash' },
      { name: 'expiresAt', keyPath: 'expiresAt' },
    ],
  },
};

// ===== Type Definitions =====

export interface FileMetadataRecord {
  fileHash: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  accountCount: number;
  lastAccessed: number;
  version: number;
  processingTime?: number;
}

export interface ColumnRecord {
  fileHash: string;
  column: 'usernames' | 'displayNames' | 'hrefs';
  data: Uint8Array; // Packed data buffer
  offsets?: Uint32Array; // Offset table for variable-length data
  length: number; // Number of entries
}

export interface BitsetRecord {
  fileHash: string;
  badge: BadgeKey;
  data: Uint8Array; // Bitset as Uint8Array
  accountCount: number; // Quick stats
}

export interface TimestampRecord {
  fileHash: string;
  username: string;
  following?: number;
  followers?: number;
  pending?: number;
  permanent?: number;
  restricted?: number;
  close?: number;
  unfollowed?: number;
  dismissed?: number;
}

export type SearchIndexType = 'prefix' | 'trigram';

export interface SearchIndexRecord {
  fileHash: string;
  type: SearchIndexType;
  key: string; // prefix/trigram string
  data: Uint8Array; // Bitset
  createdAt: number;
  expiresAt: number; // TTL for eviction
}

// Badge keys that support timestamps
export const TIME_BASED_BADGES: BadgeKey[] = [
  'following',
  'followers',
  'pending',
  'permanent',
  'restricted',
  'close',
  'unfollowed',
  'dismissed',
];

// Badge keys that are boolean (computed)
export const BOOLEAN_BADGES: BadgeKey[] = ['mutuals', 'notFollowingBack', 'notFollowedBack'];

// All supported badges
export const ALL_BADGES: BadgeKey[] = [...TIME_BASED_BADGES, ...BOOLEAN_BADGES];

// Cache TTL configs
export const CACHE_CONFIG = {
  FILE_CACHE_DAYS: 7, // File data valid for 7 days
  INDEX_CACHE_DAYS: 3, // Search indexes valid for 3 days
  MAX_INDEX_ENTRIES: 10000, // Max cached search index entries
} as const;
