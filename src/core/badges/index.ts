import type { ParsedAll, AccountBadges, BadgeKey } from '@/core/types';

// Helper function to collect all unique usernames
function collectAllUsernames(parsed: ParsedAll): Set<string> {
  return new Set<string>([
    ...parsed.following, // Accounts user follows
    ...parsed.followers, // Accounts that follow user
    ...parsed.pendingSent.keys(), // Pending follow requests
    ...parsed.permanentRequests.keys(), // Permanently rejected requests
    ...parsed.restricted.keys(), // Restricted profiles
    ...parsed.closeFriends.keys(), // Close friends
    ...parsed.unfollowed.keys(), // Recently unfollowed
    ...parsed.dismissedSuggestions.keys(), // Dismissed suggestions
  ]);
}

// Helper function to compute derived relationship categories
function computeDerivedRelationships(parsed: ParsedAll) {
  // notFollowingBack: User follows but account doesn't follow back (excluding pending/permanent requests)
  const notFollowingBack = new Set(
    [...parsed.following].filter(
      u =>
        !parsed.followers.has(u) && !parsed.pendingSent.has(u) && !parsed.permanentRequests.has(u)
    )
  );

  // notFollowedBack: Account follows but user doesn't follow back
  const notFollowedBack = new Set([...parsed.followers].filter(u => !parsed.following.has(u)));

  // mutuals: Both user and account follow each other
  const mutuals = new Set([...parsed.following].filter(u => parsed.followers.has(u)));

  return { notFollowingBack, notFollowedBack, mutuals };
}

// Helper function to build badges for a single account
function buildAccountBadges(
  username: string,
  parsed: ParsedAll,
  derived: ReturnType<typeof computeDerivedRelationships>
): Partial<Record<BadgeKey, number | true>> {
  const badges: Partial<Record<BadgeKey, number | true>> = {};

  // Core relationship badges (with timestamps when available)
  if (parsed.following.has(username))
    badges.following = parsed.followingTimestamps.get(username) ?? true;
  if (parsed.followers.has(username))
    badges.followers = parsed.followersTimestamps.get(username) ?? true;

  // Special relationship badges (with timestamps)
  if (parsed.pendingSent.has(username)) badges.pending = parsed.pendingSent.get(username) ?? 0;
  if (parsed.permanentRequests.has(username))
    badges.permanent = parsed.permanentRequests.get(username) ?? 0;
  if (parsed.restricted.has(username)) badges.restricted = parsed.restricted.get(username) ?? 0;
  if (parsed.closeFriends.has(username)) badges.close = parsed.closeFriends.get(username) ?? 0;
  if (parsed.unfollowed.has(username)) badges.unfollowed = parsed.unfollowed.get(username) ?? 0;
  if (parsed.dismissedSuggestions.has(username))
    badges.dismissed = parsed.dismissedSuggestions.get(username) ?? 0;

  // Computed relationship badges (boolean flags)
  if (derived.notFollowingBack.has(username)) badges.notFollowingBack = true;
  if (derived.notFollowedBack.has(username)) badges.notFollowedBack = true;
  if (derived.mutuals.has(username)) badges.mutuals = true;

  return badges;
}

export function buildAccountBadgeIndex(parsed: ParsedAll): AccountBadges[] {
  const usernames = collectAllUsernames(parsed);
  const derived = computeDerivedRelationships(parsed);

  // Build badge index for each account
  const list: AccountBadges[] = [];
  for (const username of usernames) {
    const badges = buildAccountBadges(username, parsed, derived);
    list.push({ username, badges });
  }

  // Sort accounts alphabetically by username
  const result = list.sort((a, b) => a.username.localeCompare(b.username));
  return result;
}

// Pure helper for filtering logic (OR). Exported for tests.
export function filterAccountsByBadges(
  accounts: AccountBadges[],
  selected: Set<BadgeKey>,
  query?: string
): AccountBadges[] {
  if (selected.size === 0) return [];

  const q = (query ?? '').toLowerCase();
  return accounts.filter(acc => {
    // Filter by username query (case-insensitive)
    if (q && !acc.username.includes(q)) return false;

    // Filter by selected badges (OR logic - account needs at least one selected badge)
    for (const k of selected) if (acc.badges[k]) return true;
    return false;
  });
}

// Order of badges in UI (defines display priority)
export const BADGE_ORDER: readonly BadgeKey[] = [
  'following', // Core relationships first
  'followers',
  'mutuals',
  'notFollowingBack', // Problematic relationships
  'notFollowedBack',
  'pending', // Special states
  'permanent',
  'restricted',
  'close', // Special features
  'unfollowed', // Historical data
  'dismissed',
] as const;

// Human-readable labels for each badge type
export const BADGE_LABELS: Record<BadgeKey, string> = {
  following: 'Following',
  followers: 'Followers',
  mutuals: 'Mutuals',
  notFollowingBack: 'Not following back',
  notFollowedBack: 'Not followed back',
  pending: 'Pending request',
  permanent: 'Pending (permanent)',
  restricted: 'Restricted',
  close: 'Close friend',
  unfollowed: 'Recently unfollowed',
  dismissed: 'Dismissed suggestion',
} as const;

// Color scheme for each badge type in UI
export const BADGE_COLORS: Record<BadgeKey, string> = {
  following: 'blue', // Neutral - normal following
  followers: 'green', // Positive - people follow you
  mutuals: 'grape', // Special - mutual relationships
  notFollowingBack: 'red', // Warning - one-sided following
  notFollowedBack: 'orange', // Caution - potential unfollow
  pending: 'yellow', // Waiting - pending state
  permanent: 'yellow', // Waiting - permanent pending
  restricted: 'pink', // Special - restricted accounts
  close: 'teal', // Special - close friends
  unfollowed: 'orange', // Historical - recently unfollowed
  dismissed: 'gray', // Neutral - dismissed suggestions
} as const;
