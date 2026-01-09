/**
 * Sample Data Generator
 *
 * Generates realistic mock Instagram data for demo purposes.
 * Data is stored in IndexedDB using the same flow as real uploads.
 */

import type { AccountBadges, BadgeKey } from '@/core/types';
import { indexedDBService } from './indexeddb/indexeddb-service';

// Sample username patterns for realistic mock data
const USERNAME_PREFIXES = [
  'user',
  'dev',
  'design',
  'photo',
  'art',
  'music',
  'tech',
  'travel',
  'food',
  'fitness',
  'fashion',
  'nature',
  'gamer',
  'creator',
  'artist',
];

const USERNAME_SUFFIXES = [
  '_official',
  '_pro',
  '_daily',
  '_life',
  '_studio',
  '_world',
  '_vibes',
  '_hub',
  '_zone',
  '_space',
  '2024',
  'ig',
  'gram',
];

// Sample file hash for demo data (consistent identifier)
const SAMPLE_FILE_HASH = 'sample-demo-data-v1';

/**
 * Generate a realistic-looking username
 * Ensures uniqueness by incorporating index in all patterns
 */
function generateUsername(index: number, seed: string): string {
  const prefix = USERNAME_PREFIXES[index % USERNAME_PREFIXES.length];
  const suffix =
    USERNAME_SUFFIXES[Math.floor(index / USERNAME_PREFIXES.length) % USERNAME_SUFFIXES.length];

  // Mix of patterns for variety - all include index for uniqueness
  if (index % 3 === 0) {
    return `${prefix}${index}`;
  } else if (index % 3 === 1) {
    return `${prefix}_${seed}_${index}`;
  } else {
    return `${prefix}${suffix}${index}`;
  }
}

/**
 * Generate sample accounts with specified badge distribution
 */
function generateAccounts(distribution: Record<BadgeKey, number>): AccountBadges[] {
  const accounts: AccountBadges[] = [];
  let currentIndex = 0;

  // Helper to add accounts with specific badge
  const addAccountsWithBadge = (badge: BadgeKey, count: number, additionalBadges?: BadgeKey[]) => {
    const now = Math.floor(Date.now() / 1000);

    for (let i = 0; i < count; i++) {
      const username = generateUsername(currentIndex, badge);
      const badges: AccountBadges['badges'] = {};

      // Time-based badges get timestamps, boolean badges get true
      const timeBadges = [
        'following',
        'followers',
        'pending',
        'permanent',
        'restricted',
        'close',
        'unfollowed',
        'dismissed',
      ];
      const setBadge = (b: BadgeKey) => {
        if (timeBadges.includes(b)) {
          (badges as Record<string, number>)[b] = now - currentIndex * 3600;
        } else {
          (badges as Record<string, true>)[b] = true;
        }
      };

      setBadge(badge);

      // Add any additional badges
      if (additionalBadges) {
        additionalBadges.forEach(setBadge);
      }

      accounts.push({ username, badges });
      currentIndex++;
    }
  };

  // Generate accounts based on distribution
  // Order matters for realistic data

  // 1. Mutuals (both following and followers)
  if (distribution.mutuals > 0) {
    addAccountsWithBadge('mutuals', distribution.mutuals, ['following', 'followers']);
  }

  // 2. Following only (not mutuals)
  if (distribution.following > 0) {
    const followingOnly = distribution.following - distribution.mutuals;
    if (followingOnly > 0) {
      addAccountsWithBadge('following', followingOnly);
    }
  }

  // 3. Followers only (not mutuals)
  if (distribution.followers > 0) {
    const followersOnly = distribution.followers - distribution.mutuals;
    if (followersOnly > 0) {
      addAccountsWithBadge('followers', followersOnly);
    }
  }

  // 4. Not following back (following but not followers, excluding pending)
  if (distribution.notFollowingBack > 0) {
    addAccountsWithBadge('notFollowingBack', distribution.notFollowingBack, ['following']);
  }

  // 5. Not followed back (followers but user doesn't follow)
  if (distribution.notFollowedBack > 0) {
    addAccountsWithBadge('notFollowedBack', distribution.notFollowedBack, ['followers']);
  }

  // 6. Unfollowed (previously followed, now unfollowed user)
  if (distribution.unfollowed > 0) {
    addAccountsWithBadge('unfollowed', distribution.unfollowed);
  }

  // 7. Pending (follow requests sent but not accepted)
  if (distribution.pending > 0) {
    addAccountsWithBadge('pending', distribution.pending, ['following']);
  }

  // 8. Close friends
  if (distribution.close > 0) {
    addAccountsWithBadge('close', distribution.close, ['following', 'followers', 'mutuals']);
  }

  // 9. Restricted
  if (distribution.restricted > 0) {
    addAccountsWithBadge('restricted', distribution.restricted);
  }

  // 10. Permanent (rejected requests)
  if (distribution.permanent > 0) {
    addAccountsWithBadge('permanent', distribution.permanent);
  }

  // 11. Dismissed suggestions
  if (distribution.dismissed > 0) {
    addAccountsWithBadge('dismissed', distribution.dismissed);
  }

  return accounts;
}

/**
 * Default sample data distribution (optimized for demo)
 */
const DEFAULT_DISTRIBUTION: Record<BadgeKey, number> = {
  following: 500, // 500 following (includes mutuals)
  followers: 450, // 450 followers (includes mutuals)
  mutuals: 200, // 200 mutuals (subset of both following and followers)
  notFollowingBack: 150, // 150 not following back
  notFollowedBack: 100, // 100 fans (they follow, you don't)
  unfollowed: 80, // 80 unfollowed you
  pending: 30, // 30 pending requests
  close: 25, // 25 close friends
  restricted: 20, // 20 restricted
  permanent: 15, // 15 rejected requests
  dismissed: 10, // 10 dismissed suggestions
};

/**
 * Generate and store sample data in IndexedDB
 *
 * Returns the file hash for accessing the sample data
 */
export async function generateAndStoreSampleData(): Promise<{
  fileHash: string;
  accountCount: number;
}> {
  // Check if sample data already exists
  const existingMetadata = await indexedDBService.getFileMetadata(SAMPLE_FILE_HASH);

  if (existingMetadata) {
    // Sample data already exists, return existing metadata
    return {
      fileHash: SAMPLE_FILE_HASH,
      accountCount: existingMetadata.accountCount,
    };
  }

  // Generate sample accounts
  const accounts = generateAccounts(DEFAULT_DISTRIBUTION);

  // Store metadata
  await indexedDBService.saveFileMetadata({
    fileHash: SAMPLE_FILE_HASH,
    fileName: 'Sample Data (Demo)',
    fileSize: 0, // No actual file
    uploadDate: new Date(),
    accountCount: accounts.length,
    lastAccessed: Date.now(),
    version: 2,
  });

  // Store accounts using the same method as real uploads
  await indexedDBService.storeAllAccounts(SAMPLE_FILE_HASH, accounts);

  return {
    fileHash: SAMPLE_FILE_HASH,
    accountCount: accounts.length,
  };
}

/**
 * Clear sample data from IndexedDB
 */
export async function clearSampleData(): Promise<void> {
  await indexedDBService.clearFile(SAMPLE_FILE_HASH);
}

/**
 * Check if sample data exists
 */
export async function hasSampleData(): Promise<boolean> {
  const metadata = await indexedDBService.getFileMetadata(SAMPLE_FILE_HASH);
  return metadata !== null;
}

/**
 * Get sample data file hash (for use with filtering/display hooks)
 */
export function getSampleFileHash(): string {
  return SAMPLE_FILE_HASH;
}
