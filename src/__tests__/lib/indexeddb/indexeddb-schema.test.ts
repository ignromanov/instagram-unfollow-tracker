import {
  DB_CONFIG,
  STORES,
  STORE_CONFIGS,
  toFileMetadataRecord,
  fromFileMetadataRecord,
  TIME_BASED_BADGES,
  BOOLEAN_BADGES,
  ALL_BADGES,
  CACHE_CONFIG,
} from '@/lib/indexeddb/indexeddb-schema';
import type { FileMetadata } from '@/core/types';

describe('IndexedDB Schema', () => {
  describe('DB_CONFIG', () => {
    it('should have correct database name', () => {
      expect(DB_CONFIG.name).toBe('instagram-tracker-v2');
    });

    it('should have correct version', () => {
      expect(DB_CONFIG.version).toBe(2);
    });
  });

  describe('STORES', () => {
    it('should define all required stores', () => {
      expect(STORES.FILES).toBe('files');
      expect(STORES.COLUMNS).toBe('columns');
      expect(STORES.BITSETS).toBe('bitsets');
      expect(STORES.TIMESTAMPS).toBe('timestamps');
      expect(STORES.INDEXES).toBe('indexes');
    });
  });

  describe('STORE_CONFIGS', () => {
    it('should configure files store correctly', () => {
      const filesConfig = STORE_CONFIGS[STORES.FILES];
      expect(filesConfig.keyPath).toBe('fileHash');
      expect(filesConfig.indexes).toHaveLength(2);
      expect(filesConfig.indexes?.[0].name).toBe('lastAccessed');
      expect(filesConfig.indexes?.[1].name).toBe('version');
    });

    it('should configure columns store correctly', () => {
      const columnsConfig = STORE_CONFIGS[STORES.COLUMNS];
      expect(columnsConfig.keyPath).toEqual(['fileHash', 'column']);
      expect(columnsConfig.indexes).toHaveLength(1);
      expect(columnsConfig.indexes?.[0].name).toBe('fileHash');
    });

    it('should configure bitsets store correctly', () => {
      const bitsetsConfig = STORE_CONFIGS[STORES.BITSETS];
      expect(bitsetsConfig.keyPath).toEqual(['fileHash', 'badge']);
      expect(bitsetsConfig.indexes).toHaveLength(1);
      expect(bitsetsConfig.indexes?.[0].name).toBe('fileHash');
    });

    it('should configure timestamps store correctly', () => {
      const timestampsConfig = STORE_CONFIGS[STORES.TIMESTAMPS];
      expect(timestampsConfig.keyPath).toEqual(['fileHash', 'username']);
      expect(timestampsConfig.indexes).toHaveLength(1);
      expect(timestampsConfig.indexes?.[0].name).toBe('fileHash');
    });

    it('should configure indexes store correctly', () => {
      const indexesConfig = STORE_CONFIGS[STORES.INDEXES];
      expect(indexesConfig.keyPath).toEqual(['fileHash', 'type', 'key']);
      expect(indexesConfig.indexes).toHaveLength(2);
      expect(indexesConfig.indexes?.[0].name).toBe('fileHash');
      expect(indexesConfig.indexes?.[1].name).toBe('expiresAt');
    });
  });

  describe('toFileMetadataRecord', () => {
    it('should convert FileMetadata to FileMetadataRecord', () => {
      const meta: FileMetadata & { fileHash: string } = {
        name: 'test.zip',
        size: 1024,
        uploadDate: new Date('2023-01-01'),
        fileHash: 'abc123',
        accountCount: 100,
      };

      const record = toFileMetadataRecord(meta);

      expect(record.fileHash).toBe('abc123');
      expect(record.fileName).toBe('test.zip');
      expect(record.fileSize).toBe(1024);
      expect(record.uploadDate).toEqual(new Date('2023-01-01'));
      expect(record.accountCount).toBe(100);
      expect(record.lastAccessed).toBeGreaterThan(0);
      expect(record.version).toBe(1);
    });

    it('should preserve optional fields', () => {
      const meta: FileMetadata & { fileHash: string } = {
        name: 'test.zip',
        size: 2048,
        uploadDate: new Date('2023-01-01'),
        fileHash: 'def456',
        accountCount: 200,
        lastAccessed: 1234567890,
        version: 2,
        processingTime: 5000,
      };

      const record = toFileMetadataRecord(meta);

      expect(record.lastAccessed).toBe(1234567890);
      expect(record.version).toBe(2);
      expect(record.processingTime).toBe(5000);
    });

    it('should throw if fileHash is missing', () => {
      const meta = {
        name: 'test.zip',
        size: 1024,
        uploadDate: new Date('2023-01-01'),
        fileHash: '',
        accountCount: 100,
      };

      expect(() => toFileMetadataRecord(meta)).toThrow('fileHash is required');
    });

    it('should throw if accountCount is missing', () => {
      const meta = {
        name: 'test.zip',
        size: 1024,
        uploadDate: new Date('2023-01-01'),
        fileHash: 'abc123',
        accountCount: undefined,
      } as any;

      expect(() => toFileMetadataRecord(meta)).toThrow('accountCount is required');
    });

    it('should set default lastAccessed if not provided', () => {
      const meta: FileMetadata & { fileHash: string } = {
        name: 'test.zip',
        size: 1024,
        uploadDate: new Date('2023-01-01'),
        fileHash: 'abc123',
        accountCount: 100,
      };

      const before = Date.now();
      const record = toFileMetadataRecord(meta);
      const after = Date.now();

      expect(record.lastAccessed).toBeGreaterThanOrEqual(before);
      expect(record.lastAccessed).toBeLessThanOrEqual(after);
    });

    it('should set default version if not provided', () => {
      const meta: FileMetadata & { fileHash: string } = {
        name: 'test.zip',
        size: 1024,
        uploadDate: new Date('2023-01-01'),
        fileHash: 'abc123',
        accountCount: 100,
      };

      const record = toFileMetadataRecord(meta);

      expect(record.version).toBe(1);
    });
  });

  describe('fromFileMetadataRecord', () => {
    it('should convert FileMetadataRecord to FileMetadata', () => {
      const record = {
        fileHash: 'abc123',
        fileName: 'test.zip',
        fileSize: 1024,
        uploadDate: new Date('2023-01-01'),
        accountCount: 100,
        lastAccessed: 1234567890,
        version: 1,
      };

      const meta = fromFileMetadataRecord(record);

      expect(meta.name).toBe('test.zip');
      expect(meta.size).toBe(1024);
      expect(meta.uploadDate).toEqual(new Date('2023-01-01'));
      expect(meta.fileHash).toBe('abc123');
      expect(meta.accountCount).toBe(100);
      expect(meta.lastAccessed).toBe(1234567890);
      expect(meta.version).toBe(1);
    });

    it('should preserve optional processingTime', () => {
      const record = {
        fileHash: 'def456',
        fileName: 'data.zip',
        fileSize: 2048,
        uploadDate: new Date('2023-02-01'),
        accountCount: 200,
        lastAccessed: 9876543210,
        version: 2,
        processingTime: 3500,
      };

      const meta = fromFileMetadataRecord(record);

      expect(meta.processingTime).toBe(3500);
    });

    it('should handle missing optional processingTime', () => {
      const record = {
        fileHash: 'ghi789',
        fileName: 'file.zip',
        fileSize: 512,
        uploadDate: new Date('2023-03-01'),
        accountCount: 50,
        lastAccessed: 5555555555,
        version: 1,
      };

      const meta = fromFileMetadataRecord(record);

      expect(meta.processingTime).toBeUndefined();
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve data through conversion cycle', () => {
      const original: FileMetadata & { fileHash: string } = {
        name: 'original.zip',
        size: 4096,
        uploadDate: new Date('2023-04-01'),
        fileHash: 'hash789',
        accountCount: 500,
        lastAccessed: 1111111111,
        version: 3,
        processingTime: 2500,
      };

      const record = toFileMetadataRecord(original);
      const converted = fromFileMetadataRecord(record);

      expect(converted.name).toBe(original.name);
      expect(converted.size).toBe(original.size);
      expect(converted.uploadDate).toEqual(original.uploadDate);
      expect(converted.fileHash).toBe(original.fileHash);
      expect(converted.accountCount).toBe(original.accountCount);
      expect(converted.lastAccessed).toBe(original.lastAccessed);
      expect(converted.version).toBe(original.version);
      expect(converted.processingTime).toBe(original.processingTime);
    });
  });

  describe('badge constants', () => {
    it('should define time-based badges', () => {
      expect(TIME_BASED_BADGES).toContain('following');
      expect(TIME_BASED_BADGES).toContain('followers');
      expect(TIME_BASED_BADGES).toContain('pending');
      expect(TIME_BASED_BADGES).toContain('permanent');
      expect(TIME_BASED_BADGES).toContain('restricted');
      expect(TIME_BASED_BADGES).toContain('close');
      expect(TIME_BASED_BADGES).toContain('unfollowed');
      expect(TIME_BASED_BADGES).toContain('dismissed');
      expect(TIME_BASED_BADGES).toHaveLength(8);
    });

    it('should define boolean badges', () => {
      expect(BOOLEAN_BADGES).toContain('mutuals');
      expect(BOOLEAN_BADGES).toContain('notFollowingBack');
      expect(BOOLEAN_BADGES).toContain('notFollowedBack');
      expect(BOOLEAN_BADGES).toHaveLength(3);
    });

    it('should combine all badges', () => {
      expect(ALL_BADGES).toHaveLength(11);
      expect(ALL_BADGES).toEqual([...TIME_BASED_BADGES, ...BOOLEAN_BADGES]);
    });

    it('should not have duplicate badges', () => {
      const uniqueBadges = new Set(ALL_BADGES);
      expect(uniqueBadges.size).toBe(ALL_BADGES.length);
    });
  });

  describe('CACHE_CONFIG', () => {
    it('should define cache TTL values', () => {
      expect(CACHE_CONFIG.FILE_CACHE_DAYS).toBe(7);
      expect(CACHE_CONFIG.INDEX_CACHE_DAYS).toBe(3);
      expect(CACHE_CONFIG.MAX_INDEX_ENTRIES).toBe(10000);
    });

    it('should have reasonable cache durations', () => {
      expect(CACHE_CONFIG.FILE_CACHE_DAYS).toBeGreaterThan(0);
      expect(CACHE_CONFIG.INDEX_CACHE_DAYS).toBeGreaterThan(0);
      expect(CACHE_CONFIG.INDEX_CACHE_DAYS).toBeLessThanOrEqual(CACHE_CONFIG.FILE_CACHE_DAYS);
    });
  });
});
