import { vi, beforeEach } from 'vitest';
import {
  parseFollowingJson,
  parseFollowersJson,
  parseInstagramZipFile,
} from '@/core/parsers/instagram';
import type { InstagramExportEntry } from '@/core/types';

// Mock JSZip
let mockZipInstance: any;
vi.mock('jszip', () => ({
  default: {
    loadAsync: vi.fn().mockImplementation(() => Promise.resolve(mockZipInstance)),
  },
}));

// Hoisted mock setup
const { MockJSZip } = vi.hoisted(() => {
  const { MockJSZip } = require('../../__mocks__/jszip.cjs');
  return { MockJSZip };
});

describe('Instagram Parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseFollowingJson', () => {
    it('should parse array format following data', async () => {
      const followingData: InstagramExportEntry[] = [
        {
          title: 'user1',
          string_list_data: [
            {
              href: 'https://www.instagram.com/user1/',
              value: 'user1',
              timestamp: 1640995200,
            },
          ],
          media_list_data: [],
        },
        {
          title: 'user2',
          string_list_data: [
            {
              href: 'https://www.instagram.com/user2/',
              value: 'user2',
              timestamp: 1640995201,
            },
          ],
          media_list_data: [],
        },
      ];

      const result = await parseFollowingJson(JSON.stringify(followingData));
      expect(result).toEqual(['user1', 'user2']);
    });

    it('should parse object format following data', async () => {
      const followingData = {
        relationships_following: [
          {
            title: 'user1',
            string_list_data: [
              {
                href: 'https://www.instagram.com/user1/',
                value: 'user1',
                timestamp: 1640995200,
              },
            ],
            media_list_data: [],
          },
        ],
      };

      const result = await parseFollowingJson(JSON.stringify(followingData));
      expect(result).toEqual(['user1']);
    });

    it('should handle empty following data', async () => {
      const result = await parseFollowingJson(JSON.stringify([]));
      expect(result).toEqual([]);
    });

    it('should normalize usernames to lowercase', async () => {
      const followingData: InstagramExportEntry[] = [
        {
          title: 'USER1',
          string_list_data: [
            {
              href: 'https://www.instagram.com/USER1/',
              value: 'USER1',
              timestamp: 1640995200,
            },
          ],
          media_list_data: [],
        },
      ];

      const result = await parseFollowingJson(JSON.stringify(followingData));
      expect(result).toEqual(['user1']);
    });

    it('should remove duplicate usernames', async () => {
      const followingData: InstagramExportEntry[] = [
        {
          title: 'user1',
          string_list_data: [
            {
              href: 'https://www.instagram.com/user1/',
              value: 'user1',
              timestamp: 1640995200,
            },
          ],
          media_list_data: [],
        },
        {
          title: 'user1',
          string_list_data: [
            {
              href: 'https://www.instagram.com/user1/',
              value: 'user1',
              timestamp: 1640995201,
            },
          ],
          media_list_data: [],
        },
      ];

      const result = await parseFollowingJson(JSON.stringify(followingData));
      expect(result).toEqual(['user1']);
    });

    it('should throw error for invalid format', async () => {
      const invalidData = { invalid: 'data' };

      await expect(parseFollowingJson(JSON.stringify(invalidData))).rejects.toThrow(
        'Invalid following.json: missing relationships_following'
      );
    });
  });

  describe('parseFollowersJson', () => {
    it('should parse array format followers data', async () => {
      const followersData: InstagramExportEntry[] = [
        {
          title: 'follower1',
          string_list_data: [
            {
              href: 'https://www.instagram.com/follower1/',
              value: 'follower1',
              timestamp: 1640995200,
            },
          ],
          media_list_data: [],
        },
      ];

      const result = await parseFollowersJson(JSON.stringify(followersData));
      expect(result).toEqual(['follower1']);
    });

    it('should parse object format followers data', async () => {
      const followersData = {
        relationships_followers: [
          {
            title: 'follower1',
            string_list_data: [
              {
                href: 'https://www.instagram.com/follower1/',
                value: 'follower1',
                timestamp: 1640995200,
              },
            ],
            media_list_data: [],
          },
        ],
      };

      const result = await parseFollowersJson(JSON.stringify(followersData));
      expect(result).toEqual(['follower1']);
    });

    it('should throw error for invalid followers format', async () => {
      const invalidData = { invalid: 'data' };

      await expect(parseFollowersJson(JSON.stringify(invalidData))).rejects.toThrow(
        'Invalid followers json format'
      );
    });
  });

  describe('parseInstagramZipFile', () => {
    beforeEach(() => {
      mockZipInstance = new MockJSZip();
    });

    it('should parse complete ZIP file with all data types', async () => {
      // Add mock files to the ZIP
      mockZipInstance._addFile(
        'connections/followers_and_following/following.json',
        vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              title: 'user1',
              string_list_data: [
                {
                  href: 'https://www.instagram.com/user1/',
                  value: 'user1',
                  timestamp: 1640995200,
                },
              ],
              media_list_data: [],
            },
          ])
        )
      );

      mockZipInstance._addFile(
        'connections/followers_and_following/followers_1.json',
        vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              title: 'follower1',
              string_list_data: [
                {
                  href: 'https://www.instagram.com/follower1/',
                  value: 'follower1',
                  timestamp: 1640995201,
                },
              ],
              media_list_data: [],
            },
          ])
        )
      );

      mockZipInstance._addFile(
        'connections/followers_and_following/pending_follow_requests.json',
        vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              title: 'pending1',
              string_list_data: [
                {
                  href: 'https://www.instagram.com/pending1/',
                  value: 'pending1',
                  timestamp: 1640995202,
                },
              ],
              media_list_data: [],
            },
          ])
        )
      );

      mockZipInstance._addFile(
        'connections/followers_and_following/restricted_profiles.json',
        vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              title: 'restricted1',
              string_list_data: [
                {
                  href: 'https://www.instagram.com/restricted1/',
                  value: 'restricted1',
                  timestamp: 1640995203,
                },
              ],
              media_list_data: [],
            },
          ])
        )
      );

      const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
      const result = await parseInstagramZipFile(mockFile);

      expect(result.following.has('user1')).toBe(true);
      expect(result.followers.has('follower1')).toBe(true);
      expect(result.pendingSent.has('pending1')).toBe(true);
      expect(result.restricted.has('restricted1')).toBe(true);
      expect(result.followingTimestamps.get('user1')).toBe(1640995200);
      expect(result.followersTimestamps.get('follower1')).toBe(1640995201);
    });

    it('should handle ZIP file with minimal data', async () => {
      // Add only following file
      mockZipInstance._addFile(
        'connections/followers_and_following/following.json',
        vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              title: 'user1',
              string_list_data: [
                {
                  href: 'https://www.instagram.com/user1/',
                  value: 'user1',
                  timestamp: 1640995200,
                },
              ],
              media_list_data: [],
            },
          ])
        )
      );

      const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
      const result = await parseInstagramZipFile(mockFile);

      expect(result.following.has('user1')).toBe(true);
      expect(result.followers.size).toBe(0);
      expect(result.pendingSent.size).toBe(0);
    });

    it('should handle multiple followers files', async () => {
      // Add multiple followers files
      mockZipInstance._addFile(
        'connections/followers_and_following/following.json',
        vi.fn().mockResolvedValue(JSON.stringify([]))
      );

      mockZipInstance._addFile(
        'connections/followers_and_following/followers_1.json',
        vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              title: 'follower1',
              string_list_data: [
                {
                  href: 'https://www.instagram.com/follower1/',
                  value: 'follower1',
                  timestamp: 1640995200,
                },
              ],
              media_list_data: [],
            },
          ])
        )
      );

      mockZipInstance._addFile(
        'connections/followers_and_following/followers_2.json',
        vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              title: 'follower2',
              string_list_data: [
                {
                  href: 'https://www.instagram.com/follower2/',
                  value: 'follower2',
                  timestamp: 1640995201,
                },
              ],
              media_list_data: [],
            },
          ])
        )
      );

      const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
      const result = await parseInstagramZipFile(mockFile);

      expect(result.followers.has('follower1')).toBe(true);
      expect(result.followers.has('follower2')).toBe(true);
      expect(result.followers.size).toBe(2);
    });

    it('should throw error for empty ZIP file', async () => {
      const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });

      await expect(parseInstagramZipFile(mockFile)).rejects.toThrow(
        'Could not find required files in ZIP'
      );
    });

    it('should handle malformed JSON gracefully', async () => {
      // Add malformed JSON file
      mockZipInstance._addFile(
        'connections/followers_and_following/following.json',
        vi.fn().mockResolvedValue('invalid json')
      );

      const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });

      await expect(parseInstagramZipFile(mockFile)).rejects.toThrow(
        'Could not find required files in ZIP'
      );
    });

    it('should preserve timestamps correctly', async () => {
      const testTimestamp = 1640995200;

      mockZipInstance._addFile(
        'connections/followers_and_following/following.json',
        vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              title: 'user1',
              string_list_data: [
                {
                  href: 'https://www.instagram.com/user1/',
                  value: 'user1',
                  timestamp: testTimestamp,
                },
              ],
              media_list_data: [],
            },
          ])
        )
      );

      mockZipInstance._addFile(
        'connections/followers_and_following/followers_1.json',
        vi.fn().mockResolvedValue(JSON.stringify([]))
      );

      const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
      const result = await parseInstagramZipFile(mockFile);

      expect(result.followingTimestamps.get('user1')).toBe(testTimestamp);
    });

    it('should handle missing timestamp gracefully', async () => {
      mockZipInstance._addFile(
        'connections/followers_and_following/following.json',
        vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              title: 'user1',
              string_list_data: [
                {
                  href: 'https://www.instagram.com/user1/',
                  value: 'user1',
                  // No timestamp
                },
              ],
              media_list_data: [],
            },
          ])
        )
      );

      mockZipInstance._addFile(
        'connections/followers_and_following/followers_1.json',
        vi.fn().mockResolvedValue(JSON.stringify([]))
      );

      const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
      const result = await parseInstagramZipFile(mockFile);

      expect(result.followingTimestamps.get('user1')).toBe(0);
    });

    it('should handle followers files with different naming patterns', async () => {
      mockZipInstance._addFile(
        'connections/followers_and_following/following.json',
        vi.fn().mockResolvedValue(JSON.stringify([]))
      );

      // Add followers file with different pattern to trigger line 110-111
      mockZipInstance._addFile(
        'connections/followers_and_following/followers_2.json',
        vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              title: 'user1',
              string_list_data: [
                {
                  href: 'https://www.instagram.com/user1/',
                  value: 'user1',
                  timestamp: 1234567890,
                },
              ],
              media_list_data: [],
            },
          ])
        )
      );

      const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
      const result = await parseInstagramZipFile(mockFile);

      expect(result.followersTimestamps.get('user1')).toBe(1234567890);
    });
  });
});
