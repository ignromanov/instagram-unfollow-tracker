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

      // New ParseResult format: data is in result.data
      expect(result.hasMinimalData).toBe(true);
      expect(result.data.following.has('user1')).toBe(true);
      expect(result.data.followers.has('follower1')).toBe(true);
      expect(result.data.pendingSent.has('pending1')).toBe(true);
      expect(result.data.restricted.has('restricted1')).toBe(true);
      expect(result.data.followingTimestamps.get('user1')).toBe(1640995200);
      expect(result.data.followersTimestamps.get('follower1')).toBe(1640995201);
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

      // Minimal data = only following.json
      expect(result.hasMinimalData).toBe(true);
      expect(result.data.following.has('user1')).toBe(true);
      expect(result.data.followers.size).toBe(0);
      expect(result.data.pendingSent.size).toBe(0);
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

      expect(result.data.followers.has('follower1')).toBe(true);
      expect(result.data.followers.has('follower2')).toBe(true);
      expect(result.data.followers.size).toBe(2);
    });

    it('should return hasMinimalData=false for empty ZIP file', async () => {
      const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });

      // New: parseInstagramZipFile returns result instead of throwing
      const result = await parseInstagramZipFile(mockFile);
      expect(result.hasMinimalData).toBe(false);
      expect(result.discovery.isInstagramExport).toBe(false);
      // Should have error-level warning
      const errorWarning = result.warnings.find(w => w.severity === 'error');
      expect(errorWarning).toBeDefined();
    });

    it('should handle malformed JSON gracefully', async () => {
      // Add malformed JSON file
      mockZipInstance._addFile(
        'connections/followers_and_following/following.json',
        vi.fn().mockResolvedValue('invalid json')
      );

      const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });

      // New: returns result with hasMinimalData=false instead of throwing
      const result = await parseInstagramZipFile(mockFile);
      expect(result.hasMinimalData).toBe(false);
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

      expect(result.data.followingTimestamps.get('user1')).toBe(testTimestamp);
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

      expect(result.data.followingTimestamps.get('user1')).toBe(0);
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

      expect(result.data.followersTimestamps.get('user1')).toBe(1234567890);
    });

    it('should parse new Instagram format with username in title only (no value field)', async () => {
      // New Instagram format (2026+): username is in entry.title, not in string_list_data[0].value
      mockZipInstance._addFile(
        'connections/followers_and_following/following.json',
        vi.fn().mockResolvedValue(
          JSON.stringify({
            relationships_following: [
              {
                title: 'newformat_user1',
                string_list_data: [
                  {
                    href: 'https://www.instagram.com/_u/newformat_user1',
                    timestamp: 1765477864,
                    // Note: no 'value' field - this is the new format
                  },
                ],
                media_list_data: [],
              },
              {
                title: 'newformat_user2',
                string_list_data: [
                  {
                    href: 'https://www.instagram.com/_u/newformat_user2',
                    timestamp: 1765063724,
                  },
                ],
                media_list_data: [],
              },
            ],
          })
        )
      );

      mockZipInstance._addFile(
        'connections/followers_and_following/followers_1.json',
        vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              title: 'newformat_follower1',
              string_list_data: [
                {
                  href: 'https://www.instagram.com/_u/newformat_follower1',
                  timestamp: 1765000000,
                },
              ],
              media_list_data: [],
            },
          ])
        )
      );

      const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
      const result = await parseInstagramZipFile(mockFile);

      expect(result.hasMinimalData).toBe(true);
      expect(result.data.following.has('newformat_user1')).toBe(true);
      expect(result.data.following.has('newformat_user2')).toBe(true);
      expect(result.data.followers.has('newformat_follower1')).toBe(true);
      expect(result.data.followingTimestamps.get('newformat_user1')).toBe(1765477864);
      expect(result.data.followersTimestamps.get('newformat_follower1')).toBe(1765000000);
    });
  });
});
