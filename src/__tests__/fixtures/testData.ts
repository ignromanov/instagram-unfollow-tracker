import type { InstagramExportEntry, ParsedAll } from '@/core/types';

// ============================================================================
// TEST ACCOUNT DEFINITIONS
// ============================================================================

// Base list of all test accounts for reference
export const ALL_TEST_ACCOUNTS = [
  // Mutual followers (following each other)
  'alice_mutual',
  'bob_mutual',
  'charlie_mutual',

  // Following but not followed back
  'dave_unfollowed',
  'eve_unfollowed',
  'frank_unfollowed',

  // Followers but not following back
  'grace_follower',
  'henry_follower',
  'ivy_follower',

  // Pending requests (mixed scenarios)
  'jack_pending',
  'kate_pending',

  // Permanent requests
  'leo_permanent',
  'mia_permanent',

  // Restricted profiles
  'nick_restricted',
  'olivia_restricted',

  // Close friends
  'paul_close',
  'quinn_close',

  // Recently unfollowed
  'rachel_unfollowed',
  'steve_unfollowed',

  // Dismissed suggestions
  'tom_dismissed',
  'una_dismissed',
] as const;

// Type for test account usernames
export type TestAccountUsername = (typeof ALL_TEST_ACCOUNTS)[number];

// Type for test accounts structure
export type TestAccounts = {
  following: readonly TestAccountUsername[];
  followers: readonly TestAccountUsername[];
  pending: readonly TestAccountUsername[];
  permanent: readonly TestAccountUsername[];
  restricted: readonly TestAccountUsername[];
  close: readonly TestAccountUsername[];
  unfollowed: readonly TestAccountUsername[];
  dismissed: readonly TestAccountUsername[];
  mutuals: readonly TestAccountUsername[];
  notFollowingBack: readonly TestAccountUsername[];
  notFollowedBack: readonly TestAccountUsername[];
};

// Test accounts organized by relationship types
export const TEST_ACCOUNTS: TestAccounts = {
  // Core relationship lists
  following: [
    // Mutual followers (3)
    'alice_mutual',
    'bob_mutual',
    'charlie_mutual',
    // Following but not followed back (3)
    'dave_unfollowed',
    'eve_unfollowed',
    'frank_unfollowed',
    // Close friends (mutuals) (2)
    'paul_close',
    'quinn_close',
    // Recently unfollowed (2)
    'rachel_unfollowed',
    'steve_unfollowed',
  ],

  followers: [
    // Mutual followers (3)
    'alice_mutual',
    'bob_mutual',
    'charlie_mutual',
    // Followers but not following back (3)
    'grace_follower',
    'henry_follower',
    'ivy_follower',
    // Close friends (mutuals) (2)
    'paul_close',
    'quinn_close',
  ],

  // Special relationship categories
  pending: ['jack_pending', 'kate_pending'],
  permanent: ['leo_permanent', 'mia_permanent'],
  restricted: ['nick_restricted', 'olivia_restricted'],
  close: ['paul_close', 'quinn_close'],
  unfollowed: ['rachel_unfollowed', 'steve_unfollowed'],
  dismissed: ['tom_dismissed', 'una_dismissed'],

  // Computed relationship categories
  mutuals: ['alice_mutual', 'bob_mutual', 'charlie_mutual', 'paul_close', 'quinn_close'],
  notFollowingBack: [
    'dave_unfollowed',
    'eve_unfollowed',
    'frank_unfollowed',
    'rachel_unfollowed',
    'steve_unfollowed',
  ],
  notFollowedBack: ['grace_follower', 'henry_follower', 'ivy_follower'],
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Fixed timestamp for consistent test results (November 15, 2023)
const FIXED_TIMESTAMP = 1700000000;

// Helper to validate that all accounts in TEST_ACCOUNTS exist in ALL_TEST_ACCOUNTS
function validateTestAccounts() {
  const allAccountsSet = new Set(ALL_TEST_ACCOUNTS);

  Object.entries(TEST_ACCOUNTS).forEach(([category, accounts]) => {
    accounts.forEach(account => {
      if (!allAccountsSet.has(account)) {
        throw new Error(`Account "${account}" in ${category} not found in ALL_TEST_ACCOUNTS`);
      }
    });
  });
}

// Validate test accounts at module load time
validateTestAccounts();

// Helper to create Instagram export entry
function createEntry(username: string, timestamp?: number): InstagramExportEntry {
  return {
    title: username,
    string_list_data: [
      {
        href: `https://www.instagram.com/${username}/`,
        value: username,
        timestamp: timestamp || FIXED_TIMESTAMP,
      },
    ],
    media_list_data: [],
  };
}

// ============================================================================
// DATA GENERATORS
// ============================================================================

// Generate test data for following.json
export function generateFollowingData(): InstagramExportEntry[] {
  return TEST_ACCOUNTS.following.map(username => createEntry(username));
}

// Generate test data for followers.json
export function generateFollowersData(): InstagramExportEntry[] {
  return TEST_ACCOUNTS.followers.map(username => createEntry(username));
}

// Generate test data for pending requests
export function generatePendingRequestsData(): InstagramExportEntry[] {
  return TEST_ACCOUNTS.pending.map(username => createEntry(username));
}

// Generate test data for permanent requests
export function generatePermanentRequestsData(): InstagramExportEntry[] {
  return TEST_ACCOUNTS.permanent.map(username => createEntry(username));
}

// Generate test data for restricted profiles
export function generateRestrictedData(): InstagramExportEntry[] {
  return TEST_ACCOUNTS.restricted.map(username => createEntry(username));
}

// Generate test data for close friends
export function generateCloseFriendsData(): InstagramExportEntry[] {
  return TEST_ACCOUNTS.close.map(username => createEntry(username));
}

// Generate test data for unfollowed profiles
export function generateUnfollowedData(): InstagramExportEntry[] {
  return TEST_ACCOUNTS.unfollowed.map(username => createEntry(username));
}

// Generate test data for dismissed suggestions
export function generateDismissedData(): InstagramExportEntry[] {
  return TEST_ACCOUNTS.dismissed.map(username => createEntry(username));
}

// ============================================================================
// PARSED DATA CREATOR
// ============================================================================

// Create complete ParsedAll object for testing
export function createTestParsedData(): ParsedAll {
  const currentTimestamp = FIXED_TIMESTAMP;

  // Core relationship sets
  const following = new Set(TEST_ACCOUNTS.following);
  const followers = new Set(TEST_ACCOUNTS.followers);

  // Special relationship maps with timestamps
  const pendingSent = new Map(TEST_ACCOUNTS.pending.map(username => [username, currentTimestamp]));

  const permanentRequests = new Map(
    TEST_ACCOUNTS.permanent.map(username => [username, currentTimestamp])
  );

  const restricted = new Map(
    TEST_ACCOUNTS.restricted.map(username => [username, currentTimestamp])
  );

  const closeFriends = new Map(TEST_ACCOUNTS.close.map(username => [username, currentTimestamp]));

  const unfollowed = new Map(
    TEST_ACCOUNTS.unfollowed.map(username => [username, currentTimestamp])
  );

  const dismissedSuggestions = new Map(
    TEST_ACCOUNTS.dismissed.map(username => [username, currentTimestamp])
  );

  // Timestamp maps for core relationships
  const followingTimestamps = new Map(
    Array.from(following).map(username => [username, currentTimestamp])
  );

  const followersTimestamps = new Map(
    Array.from(followers).map(username => [username, currentTimestamp])
  );

  return {
    following,
    followers,
    pendingSent,
    permanentRequests,
    restricted,
    closeFriends,
    unfollowed,
    dismissedSuggestions,
    followingTimestamps,
    followersTimestamps,
  };
}

// ============================================================================
// EXPECTED RESULTS
// ============================================================================

// Type for expected badge counts
export type ExpectedBadgeCounts = Record<keyof TestAccounts, number>;

// Expected badge counts for verification (automatically calculated from TEST_ACCOUNTS)
export const EXPECTED_BADGE_COUNTS: ExpectedBadgeCounts = Object.fromEntries(
  Object.entries(TEST_ACCOUNTS).map(([key, value]) => [key, value.length])
) as ExpectedBadgeCounts;
