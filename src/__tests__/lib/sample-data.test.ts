/**
 * Sample Data Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateAndStoreSampleData,
  clearSampleData,
  hasSampleData,
  getSampleFileHash,
} from '@/lib/sample-data';
import { indexedDBService } from '@/lib/indexeddb/indexeddb-service';
import type { BadgeKey } from '@/core/types';

// Mock IndexedDB service
vi.mock('@/lib/indexeddb/indexeddb-service', () => ({
  indexedDBService: {
    getFileMetadata: vi.fn(),
    saveFileMetadata: vi.fn(),
    storeAllAccounts: vi.fn(),
    clearFile: vi.fn(),
  },
}));

describe('Sample Data Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAndStoreSampleData', () => {
    it('should generate and store sample data when none exists', async () => {
      // Mock no existing data
      vi.mocked(indexedDBService.getFileMetadata).mockResolvedValue(null);

      const result = await generateAndStoreSampleData();

      // Should return file hash and account count
      expect(result.fileHash).toBe(getSampleFileHash());
      expect(result.accountCount).toBeGreaterThan(0);

      // Should save metadata
      expect(indexedDBService.saveFileMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          fileHash: getSampleFileHash(),
          fileName: 'Sample Data (Demo)',
          accountCount: result.accountCount,
        })
      );

      // Should store accounts
      expect(indexedDBService.storeAllAccounts).toHaveBeenCalledWith(
        getSampleFileHash(),
        expect.any(Array)
      );
    });

    it('should return existing metadata when sample data already exists', async () => {
      // Mock existing data
      const existingMetadata = {
        fileHash: getSampleFileHash(),
        fileName: 'Sample Data (Demo)',
        fileSize: 0,
        uploadDate: new Date(),
        accountCount: 1000,
        lastAccessed: Date.now(),
        version: 2,
      };

      vi.mocked(indexedDBService.getFileMetadata).mockResolvedValue(existingMetadata);

      const result = await generateAndStoreSampleData();

      // Should return existing data
      expect(result.fileHash).toBe(getSampleFileHash());
      expect(result.accountCount).toBe(1000);

      // Should not save new data
      expect(indexedDBService.saveFileMetadata).not.toHaveBeenCalled();
      expect(indexedDBService.storeAllAccounts).not.toHaveBeenCalled();
    });

    it('should generate accounts with correct badge distribution', async () => {
      vi.mocked(indexedDBService.getFileMetadata).mockResolvedValue(null);

      await generateAndStoreSampleData();

      const storeCall = vi.mocked(indexedDBService.storeAllAccounts).mock.calls[0];
      const accounts = storeCall?.[1];

      expect(accounts).toBeDefined();
      if (!accounts) return;

      // Count badges
      const badgeCounts: Record<string, number> = {};
      accounts.forEach(account => {
        Object.keys(account.badges).forEach(badge => {
          badgeCounts[badge] = (badgeCounts[badge] || 0) + 1;
        });
      });

      // Should have various badge types
      const expectedBadges: BadgeKey[] = [
        'following',
        'followers',
        'mutuals',
        'notFollowingBack',
        'unfollowed',
      ];
      expectedBadges.forEach(badge => {
        expect(badgeCounts[badge]).toBeGreaterThan(0);
      });
    });

    it('should generate unique usernames', async () => {
      vi.mocked(indexedDBService.getFileMetadata).mockResolvedValue(null);

      await generateAndStoreSampleData();

      const storeCall = vi.mocked(indexedDBService.storeAllAccounts).mock.calls[0];
      const accounts = storeCall?.[1];

      expect(accounts).toBeDefined();
      if (!accounts) return;

      // Check uniqueness
      const usernames = accounts.map(a => a.username);
      const uniqueUsernames = new Set(usernames);
      expect(uniqueUsernames.size).toBe(usernames.length);
    });
  });

  describe('clearSampleData', () => {
    it('should clear sample data from IndexedDB', async () => {
      await clearSampleData();

      expect(indexedDBService.clearFile).toHaveBeenCalledWith(getSampleFileHash());
    });
  });

  describe('hasSampleData', () => {
    it('should return true when sample data exists', async () => {
      vi.mocked(indexedDBService.getFileMetadata).mockResolvedValue({
        fileHash: getSampleFileHash(),
        fileName: 'Sample Data (Demo)',
        fileSize: 0,
        uploadDate: new Date(),
        accountCount: 1000,
        lastAccessed: Date.now(),
        version: 2,
      });

      const result = await hasSampleData();
      expect(result).toBe(true);
    });

    it('should return false when sample data does not exist', async () => {
      vi.mocked(indexedDBService.getFileMetadata).mockResolvedValue(null);

      const result = await hasSampleData();
      expect(result).toBe(false);
    });
  });

  describe('getSampleFileHash', () => {
    it('should return consistent hash', () => {
      const hash1 = getSampleFileHash();
      const hash2 = getSampleFileHash();

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^sample-/);
    });
  });
});
