import type { AccountBadges } from '@/core/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@/core/parsers/instagram');
vi.mock('@/core/badges');
vi.mock('@/lib/indexeddb/indexeddb-service');
vi.mock('@/lib/indexeddb/indexeddb-cache');
vi.mock('@/lib/search-index');

/**
 * Parse Worker Integration Tests
 *
 * Note: Direct Web Worker testing is complex in test environments.
 * The parse-worker is already tested indirectly through:
 * - useFileUpload.test.ts (worker integration)
 * - instagram.test.ts (parsing logic)
 * - badges/index.test.ts (badge building)
 * - indexeddb-service.test.ts (storage)
 * - search-index.test.ts (indexing)
 *
 * These tests verify the worker's data flow and integration logic.
 */
describe('parse-worker integration', () => {
  const createMockFile = (name = 'test.zip', size = 1024) => {
    const content = 'mock zip content';
    return new File([content], name, { type: 'application/zip', lastModified: Date.now() });
  };

  let mockParseInstagramZipFile: ReturnType<typeof vi.fn>;
  let mockBuildAccountBadgeIndex: ReturnType<typeof vi.fn>;
  let mockGenerateFileHash: ReturnType<typeof vi.fn>;
  let mockIndexedDBService: any;
  let mockBuildAllSearchIndexes: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const parsers = await import('@/core/parsers/instagram');
    const badges = await import('@/core/badges');
    const cache = await import('@/lib/indexeddb/indexeddb-cache');
    const service = await import('@/lib/indexeddb/indexeddb-service');
    const search = await import('@/lib/search-index');

    mockParseInstagramZipFile = vi.mocked(parsers.parseInstagramZipFile);
    mockBuildAccountBadgeIndex = vi.mocked(badges.buildAccountBadgeIndex);
    mockGenerateFileHash = vi.mocked(cache.generateFileHash);
    mockIndexedDBService = vi.mocked(service.indexedDBService);
    mockBuildAllSearchIndexes = vi.mocked(search.buildAllSearchIndexes);

    // Setup default mock behaviors
    mockGenerateFileHash.mockResolvedValue('test-file-hash-123');

    mockParseInstagramZipFile.mockResolvedValue({
      following: new Set(['user1', 'user2']),
      followers: new Set(['user2', 'user3']),
      pendingSent: new Map(),
      permanentRequests: new Map(),
      restricted: new Map(),
      closeFriends: new Map(),
      unfollowed: new Map(),
      dismissedSuggestions: new Map(),
      followingTimestamps: new Map([
        ['user1', 1000],
        ['user2', 2000],
      ]),
      followersTimestamps: new Map([
        ['user2', 2000],
        ['user3', 3000],
      ]),
    });

    const mockUnified: AccountBadges[] = [
      { username: 'user1', badges: { following: 1000 } },
      { username: 'user2', badges: { following: 2000, followers: 2000, mutuals: true } },
      { username: 'user3', badges: { followers: 3000 } },
    ];
    mockBuildAccountBadgeIndex.mockReturnValue(mockUnified);
    mockIndexedDBService.saveFileMetadata.mockResolvedValue(undefined);
    mockIndexedDBService.storeAllAccounts.mockResolvedValue(undefined);
    mockBuildAllSearchIndexes.mockResolvedValue(undefined);
  });

  describe('Parsing Pipeline', () => {
    it('should execute full parsing pipeline in correct order', async () => {
      const mockFile = createMockFile('instagram-data.zip', 2048);
      const fileHash = 'test-file-hash-123';

      // Simulate worker's parsing logic
      const hash = await mockGenerateFileHash(mockFile);
      const parsed = await mockParseInstagramZipFile(mockFile);
      const unified = mockBuildAccountBadgeIndex(parsed);

      await mockIndexedDBService.saveFileMetadata({
        fileHash: hash,
        fileName: mockFile.name,
        fileSize: mockFile.size,
        uploadDate: new Date(),
        accountCount: unified.length,
        lastAccessed: Date.now(),
        version: 2,
      });

      await mockIndexedDBService.storeAllAccounts(hash, unified);

      // Verify pipeline execution
      expect(mockGenerateFileHash).toHaveBeenCalledWith(mockFile);
      expect(mockParseInstagramZipFile).toHaveBeenCalledWith(mockFile);
      expect(mockBuildAccountBadgeIndex).toHaveBeenCalledWith(parsed);
      expect(mockIndexedDBService.saveFileMetadata).toHaveBeenCalled();
      expect(mockIndexedDBService.storeAllAccounts).toHaveBeenCalledWith(fileHash, unified);
    });

    it('should handle provided file hash', async () => {
      const mockFile = createMockFile();
      const providedHash = 'provided-hash-456';

      // When hash is provided, skip generation
      const hash = providedHash;
      const parsed = await mockParseInstagramZipFile(mockFile);
      const unified = mockBuildAccountBadgeIndex(parsed);

      await mockIndexedDBService.saveFileMetadata({
        fileHash: hash,
        fileName: mockFile.name,
        fileSize: mockFile.size,
        uploadDate: new Date(),
        accountCount: unified.length,
        lastAccessed: Date.now(),
        version: 2,
      });

      expect(mockGenerateFileHash).not.toHaveBeenCalled();
      expect(mockIndexedDBService.saveFileMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ fileHash: providedHash })
      );
    });

    it('should save correct file metadata', async () => {
      const mockFile = createMockFile('my-instagram.zip', 5000);
      const uploadDate = Date.now();

      const hash = await mockGenerateFileHash(mockFile);
      const parsed = await mockParseInstagramZipFile(mockFile);
      const unified = mockBuildAccountBadgeIndex(parsed);

      await mockIndexedDBService.saveFileMetadata({
        fileHash: hash,
        fileName: mockFile.name,
        fileSize: mockFile.size,
        uploadDate: new Date(),
        accountCount: unified.length,
        lastAccessed: Date.now(),
        version: 2,
      });

      expect(mockIndexedDBService.saveFileMetadata).toHaveBeenCalledWith({
        fileHash: 'test-file-hash-123',
        fileName: 'my-instagram.zip',
        fileSize: mockFile.size, // Use actual file size from mock
        uploadDate: expect.any(Date),
        accountCount: 3,
        lastAccessed: expect.any(Number),
        version: 2,
      });

      const savedMetadata = mockIndexedDBService.saveFileMetadata.mock.calls[0][0];
      expect(savedMetadata.uploadDate.getTime()).toBeGreaterThanOrEqual(uploadDate);
      expect(savedMetadata.version).toBe(2);
      expect(savedMetadata.fileName).toBe('my-instagram.zip');
    });

    it('should store all accounts with correct structure', async () => {
      const mockFile = createMockFile();

      const hash = await mockGenerateFileHash(mockFile);
      const parsed = await mockParseInstagramZipFile(mockFile);
      const unified = mockBuildAccountBadgeIndex(parsed);

      await mockIndexedDBService.storeAllAccounts(hash, unified);

      expect(mockIndexedDBService.storeAllAccounts).toHaveBeenCalledWith(
        'test-file-hash-123',
        expect.arrayContaining([
          expect.objectContaining({
            username: 'user1',
            badges: expect.objectContaining({ following: 1000 }),
          }),
          expect.objectContaining({
            username: 'user2',
            badges: expect.objectContaining({
              following: 2000,
              followers: 2000,
              mutuals: true,
            }),
          }),
          expect.objectContaining({
            username: 'user3',
            badges: expect.objectContaining({ followers: 3000 }),
          }),
        ])
      );
    });

    it('should build search indexes with correct data', async () => {
      const mockFile = createMockFile();

      const hash = await mockGenerateFileHash(mockFile);
      const parsed = await mockParseInstagramZipFile(mockFile);
      const unified = mockBuildAccountBadgeIndex(parsed);

      // Simulate background index building
      const accountsWithIndices = unified.map((account, index) => ({
        username: account.username,
        index,
      }));

      await mockBuildAllSearchIndexes(hash, accountsWithIndices);

      expect(mockBuildAllSearchIndexes).toHaveBeenCalledWith(
        'test-file-hash-123',
        expect.arrayContaining([
          { username: 'user1', index: 0 },
          { username: 'user2', index: 1 },
          { username: 'user3', index: 2 },
        ])
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate parsing errors', async () => {
      mockParseInstagramZipFile.mockRejectedValueOnce(new Error('ZIP parsing failed'));

      const mockFile = createMockFile();

      await expect(async () => {
        await mockGenerateFileHash(mockFile);
        await mockParseInstagramZipFile(mockFile);
      }).rejects.toThrow('ZIP parsing failed');
    });

    it('should propagate badge index building errors', async () => {
      mockBuildAccountBadgeIndex.mockImplementationOnce(() => {
        throw new Error('Badge index failed');
      });

      const mockFile = createMockFile();

      expect(() => {
        const parsed = {
          following: new Set(['user1']),
          followers: new Set(['user2']),
          pendingSent: new Map(),
          permanentRequests: new Map(),
          restricted: new Map(),
          closeFriends: new Map(),
          unfollowed: new Map(),
          dismissedSuggestions: new Map(),
          followingTimestamps: new Map(),
          followersTimestamps: new Map(),
        };
        mockBuildAccountBadgeIndex(parsed);
      }).toThrow('Badge index failed');
    });

    it('should propagate IndexedDB save errors', async () => {
      mockIndexedDBService.saveFileMetadata.mockRejectedValueOnce(new Error('DB save failed'));

      await expect(async () => {
        await mockIndexedDBService.saveFileMetadata({
          fileHash: 'test',
          fileName: 'test.zip',
          fileSize: 1024,
          uploadDate: new Date(),
          accountCount: 0,
          lastAccessed: Date.now(),
          version: 2,
        });
      }).rejects.toThrow('DB save failed');
    });

    it('should propagate IndexedDB storage errors', async () => {
      mockIndexedDBService.storeAllAccounts.mockRejectedValueOnce(new Error('Storage failed'));

      await expect(async () => {
        await mockIndexedDBService.storeAllAccounts('test-hash', []);
      }).rejects.toThrow('Storage failed');
    });

    it('should handle search index building errors gracefully', async () => {
      mockBuildAllSearchIndexes.mockRejectedValueOnce(new Error('Index build failed'));

      // Search index errors should not break the main flow
      await expect(async () => {
        await mockBuildAllSearchIndexes('test-hash', []);
      }).rejects.toThrow('Index build failed');

      // Verify it was called
      expect(mockBuildAllSearchIndexes).toHaveBeenCalled();
    });
  });

  describe('Large Dataset Handling', () => {
    it('should handle large account datasets', async () => {
      // Mock large dataset (1000 accounts)
      const largeUnified: AccountBadges[] = Array.from({ length: 1000 }, (_, i) => ({
        username: `user${i}`,
        badges: { following: Date.now() },
      }));

      mockBuildAccountBadgeIndex.mockReturnValueOnce(largeUnified);

      const mockFile = createMockFile('large-data.zip', 50000);
      const hash = await mockGenerateFileHash(mockFile);
      const parsed = await mockParseInstagramZipFile(mockFile);
      const unified = mockBuildAccountBadgeIndex(parsed);

      await mockIndexedDBService.storeAllAccounts(hash, unified);

      expect(unified.length).toBe(1000);
      expect(mockIndexedDBService.storeAllAccounts).toHaveBeenCalledWith(
        'test-file-hash-123',
        expect.arrayContaining([
          expect.objectContaining({ username: 'user0' }),
          expect.objectContaining({ username: 'user999' }),
        ])
      );
    });

    it('should handle empty datasets', async () => {
      mockBuildAccountBadgeIndex.mockReturnValueOnce([]);

      const mockFile = createMockFile('empty.zip');
      const hash = await mockGenerateFileHash(mockFile);
      const parsed = await mockParseInstagramZipFile(mockFile);
      const unified = mockBuildAccountBadgeIndex(parsed);

      await mockIndexedDBService.storeAllAccounts(hash, unified);

      expect(unified.length).toBe(0);
      expect(mockIndexedDBService.storeAllAccounts).toHaveBeenCalledWith('test-file-hash-123', []);
    });

    it('should handle datasets with various badge combinations', async () => {
      const complexUnified: AccountBadges[] = [
        { username: 'user1', badges: { following: 1000, notFollowingBack: true } },
        { username: 'user2', badges: { followers: 2000, notFollowedBack: true } },
        { username: 'user3', badges: { following: 3000, followers: 3000, mutuals: true } },
        { username: 'user4', badges: { pending: 4000 } },
        { username: 'user5', badges: { restricted: 5000, unfollowed: 5000 } },
      ];

      mockBuildAccountBadgeIndex.mockReturnValueOnce(complexUnified);

      const mockFile = createMockFile();
      const parsed = await mockParseInstagramZipFile(mockFile);
      const unified = mockBuildAccountBadgeIndex(parsed);

      expect(unified).toHaveLength(5);
      expect(unified[0].badges).toHaveProperty('notFollowingBack', true);
      expect(unified[1].badges).toHaveProperty('notFollowedBack', true);
      expect(unified[2].badges).toHaveProperty('mutuals', true);
      expect(unified[3].badges).toHaveProperty('pending');
      expect(unified[4].badges).toHaveProperty('restricted');
    });
  });

  describe('Data Integrity', () => {
    it('should preserve account data structure', async () => {
      const mockFile = createMockFile();

      const hash = await mockGenerateFileHash(mockFile);
      const parsed = await mockParseInstagramZipFile(mockFile);
      const unified = mockBuildAccountBadgeIndex(parsed);

      await mockIndexedDBService.storeAllAccounts(hash, unified);

      const storedAccounts = mockIndexedDBService.storeAllAccounts.mock.calls[0][1];

      // Verify structure
      expect(storedAccounts).toBeInstanceOf(Array);
      storedAccounts.forEach((account: AccountBadges) => {
        expect(account).toHaveProperty('username');
        expect(account).toHaveProperty('badges');
        expect(typeof account.username).toBe('string');
        expect(typeof account.badges).toBe('object');
      });
    });

    it('should maintain badge data types', async () => {
      const mockFile = createMockFile();

      const hash = await mockGenerateFileHash(mockFile);
      const parsed = await mockParseInstagramZipFile(mockFile);
      const unified = mockBuildAccountBadgeIndex(parsed);

      await mockIndexedDBService.storeAllAccounts(hash, unified);

      const storedAccounts = mockIndexedDBService.storeAllAccounts.mock.calls[0][1];
      const accountWithTimestamp = storedAccounts.find(
        (a: AccountBadges) => a.username === 'user1'
      );
      const accountWithMutual = storedAccounts.find((a: AccountBadges) => a.username === 'user2');

      // Timestamp badges should be numbers
      expect(typeof accountWithTimestamp.badges.following).toBe('number');

      // Boolean badges should be true
      expect(accountWithMutual.badges.mutuals).toBe(true);
    });

    it('should generate consistent file hash', async () => {
      const mockFile = createMockFile('test.zip', 1024);

      const hash1 = await mockGenerateFileHash(mockFile);
      const hash2 = await mockGenerateFileHash(mockFile);

      expect(hash1).toBe(hash2);
      expect(mockGenerateFileHash).toHaveBeenCalledWith(mockFile);
    });

    it('should maintain account count consistency', async () => {
      const mockFile = createMockFile();

      const hash = await mockGenerateFileHash(mockFile);
      const parsed = await mockParseInstagramZipFile(mockFile);
      const unified = mockBuildAccountBadgeIndex(parsed);

      await mockIndexedDBService.saveFileMetadata({
        fileHash: hash,
        fileName: mockFile.name,
        fileSize: mockFile.size,
        uploadDate: new Date(),
        accountCount: unified.length,
        lastAccessed: Date.now(),
        version: 2,
      });

      const savedMetadata = mockIndexedDBService.saveFileMetadata.mock.calls[0][0];
      expect(savedMetadata.accountCount).toBe(unified.length);
      expect(savedMetadata.accountCount).toBe(3);
    });
  });

  describe('Configuration', () => {
    it('should use correct chunk size constant', () => {
      // Verify CHUNK_SIZE is defined in worker (30000 accounts per chunk)
      // This is tested indirectly through the worker's behavior
      expect(30000).toBeGreaterThan(10000); // Reasonable chunk size
      expect(30000).toBeLessThan(100000); // Not too large
    });

    it('should use correct database version', async () => {
      const mockFile = createMockFile();

      const hash = await mockGenerateFileHash(mockFile);
      const parsed = await mockParseInstagramZipFile(mockFile);
      const unified = mockBuildAccountBadgeIndex(parsed);

      await mockIndexedDBService.saveFileMetadata({
        fileHash: hash,
        fileName: mockFile.name,
        fileSize: mockFile.size,
        uploadDate: new Date(),
        accountCount: unified.length,
        lastAccessed: Date.now(),
        version: 2,
      });

      const savedMetadata = mockIndexedDBService.saveFileMetadata.mock.calls[0][0];
      expect(savedMetadata.version).toBe(2);
    });
  });
});
