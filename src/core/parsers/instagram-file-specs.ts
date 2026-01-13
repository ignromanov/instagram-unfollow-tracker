/**
 * Instagram Export File Specifications
 * Describes all files we look for in Instagram data export
 */

export interface FileSpec {
  name: string;
  description: string;
  required: boolean;
  fileNames: string[];
  propCandidates?: string[];
}

/**
 * All expected files in Instagram data export
 * Ordered by importance (required first)
 */
export const FILE_SPECS: FileSpec[] = [
  {
    name: 'following.json',
    description: 'Accounts you follow — required for unfollower detection',
    required: true,
    fileNames: ['following.json'],
    propCandidates: ['relationships_following'],
  },
  {
    name: 'followers_*.json',
    description: 'Accounts that follow you — required for mutual detection',
    required: true,
    fileNames: ['followers_1.json', 'followers_2.json', 'followers_3.json'],
    propCandidates: ['relationships_followers'],
  },
  {
    name: 'pending_follow_requests.json',
    description: 'Outgoing follow requests still pending',
    required: false,
    fileNames: ['pending_follow_requests.json'],
    propCandidates: ['relationships_follow_requests_sent'],
  },
  {
    name: 'restricted_profiles.json',
    description: 'Accounts you have restricted',
    required: false,
    fileNames: ['restricted_profiles.json'],
    propCandidates: ['relationships_restricted_users'],
  },
  {
    name: 'close_friends.json',
    description: 'Your close friends list',
    required: false,
    fileNames: ['close_friends.json', 'friends.json'],
    propCandidates: ['relationships_close_friends'],
  },
  {
    name: 'recently_unfollowed.json',
    description: 'Accounts you recently unfollowed',
    required: false,
    fileNames: [
      'recently_unfollowed_profiles.json',
      'recently_unfollowed.json',
      'unfollowed_profiles.json',
    ],
    propCandidates: ['relationships_unfollowed_users'],
  },
  {
    name: 'dismissed_suggestions.json',
    description: 'Suggested accounts you dismissed',
    required: false,
    fileNames: ['removed_suggestions.json', 'dismissed_suggestions.json'],
    propCandidates: ['relationships_dismissed_suggested_users'],
  },
];

/**
 * Permanent follow requests spec (not in main FILE_SPECS for historical reasons)
 */
export const PERMANENT_REQUESTS_SPEC: FileSpec = {
  name: 'permanent_follow_requests.json',
  description: 'Follow requests that were declined or blocked',
  required: false,
  fileNames: ['recent_follow_requests.json', 'permanent_follow_requests.json'],
  propCandidates: [
    'relationships_permanent_follow_requests',
    'relationships_follow_requests_permanent',
  ],
};

/**
 * Common base paths where Instagram data might be located
 */
export const BASE_PATH_CANDIDATES = [
  'connections/followers_and_following',
  'followers_and_following',
];
