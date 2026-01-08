export interface InstagramListItem {
  href: string;
  value: string; // username
  timestamp?: number;
}

export interface InstagramExportEntry {
  title: string;
  string_list_data: InstagramListItem[];
  media_list_data: unknown[];
}

export interface ParsedAll {
  // Core relationship data
  following: Set<string>; // Accounts that the user follows
  followers: Set<string>; // Accounts that follow the user

  // Special relationship categories with timestamps
  pendingSent: Map<string, number>; // Outgoing follow requests that are still pending (not yet accepted/declined)
  permanentRequests: Map<string, number>; // Follow requests that were declined or blocked (permanently rejected)
  restricted: Map<string, number>; // Accounts with restricted profiles (private accounts that don't follow back)
  closeFriends: Map<string, number>; // Accounts marked as close friends
  unfollowed: Map<string, number>; // Accounts that were recently unfollowed by the user
  dismissedSuggestions: Map<string, number>; // Suggested accounts that were dismissed by the user

  // Timestamp data for core relationships
  followingTimestamps: Map<string, number>; // When the user started following each account
  followersTimestamps: Map<string, number>; // When each account started following the user
}

// Raw data structure for individual account items from Instagram export
export interface RawItem {
  username: string; // Account username
  href?: string; // Instagram profile URL
  timestamp?: number; // Unix timestamp when relationship was established
}

// Raw data structure for all relationship lists from Instagram export
export interface RawLists {
  following: RawItem[]; // Accounts that the user follows
  followers: RawItem[]; // Accounts that follow the user
  pendingSent: RawItem[]; // Outgoing follow requests that are still pending
  permanentRequests: RawItem[]; // Follow requests that were permanently rejected
  restricted: RawItem[]; // Accounts with restricted profiles
  closeFriends: RawItem[]; // Accounts marked as close friends
  unfollowed: RawItem[]; // Accounts that were recently unfollowed
  dismissedSuggestions: RawItem[]; // Suggested accounts that were dismissed
}

export type BadgeKey =
  | 'following' // User follows this account
  | 'followers' // This account follows the user
  | 'pending' // Outgoing follow request is pending
  | 'permanent' // Follow request was permanently rejected
  | 'restricted' // Account has restricted profile
  | 'close' // Account is marked as close friend
  | 'unfollowed' // Account was recently unfollowed
  | 'dismissed' // Account suggestion was dismissed
  | 'notFollowingBack' // User follows but account doesn't follow back (excluding pending/permanent)
  | 'notFollowedBack' // Account follows but user doesn't follow back
  | 'mutuals'; // Both user and account follow each other

// Badge value types: timestamp for time-based badges, true for boolean badges
export type BadgeValue = number | true;

// Time-based badges that store timestamps
export type TimeBasedBadgeKey =
  | 'following'
  | 'followers'
  | 'pending'
  | 'permanent'
  | 'restricted'
  | 'close'
  | 'unfollowed'
  | 'dismissed';

// Boolean badges that store true/false
export type BooleanBadgeKey = 'notFollowingBack' | 'notFollowedBack' | 'mutuals';

export interface AccountBadges {
  username: string;
  badges: Partial<Record<BadgeKey, BadgeValue>>; // Badge value: timestamp (number) for time-based badges, true for boolean badges
}

export interface FileMetadata {
  name: string;
  size: number;
  uploadDate: Date | string;
  fileHash?: string;
  accountCount?: number;
  lastAccessed?: number;
  version?: number;
  processingTime?: number;
}

// === Parse Result Types ===

/** Severity of a parse warning */
export type ParseWarningSeverity = 'info' | 'warning' | 'error';

/** Warning about missing or malformed data during parsing */
export interface ParseWarning {
  /** Warning code for programmatic handling */
  code: string;
  /** Human-readable message */
  message: string;
  /** Severity level */
  severity: ParseWarningSeverity;
  /** How to fix this issue */
  fix?: string;
}

/** Information about an expected file in Instagram export */
export interface FileExpectation {
  /** File name pattern (e.g., "following.json", "followers_*.json") */
  name: string;
  /** Human-readable description of what this file contains */
  description: string;
  /** Is this file required for basic functionality? */
  required: boolean;
  /** Was this file found in the ZIP? */
  found: boolean;
  /** Number of items found (if applicable) */
  itemCount?: number;
  /** Actual path where file was found */
  foundPath?: string;
}

/** Discovery status of expected files */
export interface FileDiscovery {
  /** Format of the export (json or html) */
  format: 'json' | 'html' | 'unknown';
  /** Is this a valid Instagram data export? */
  isInstagramExport: boolean;
  /** Base path where data was found */
  basePath?: string;
  /** All expected files and their status */
  files: FileExpectation[];
}

/** Result of parsing Instagram ZIP file */
export interface ParseResult {
  /** Parsed data (may be partial if some files are missing) */
  data: ParsedAll;
  /** Warnings about missing or malformed data */
  warnings: ParseWarning[];
  /** Information about which files were found */
  discovery: FileDiscovery;
  /** Whether we have enough data for meaningful analysis */
  hasMinimalData: boolean;
}

export interface UploadState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  fileName: string | null;
}

export interface FilterCache {
  key: string;
  result: AccountBadges[];
  timestamp: number;
}

export interface FilterMessage {
  type: 'filter';
  accounts: AccountBadges[];
  searchQuery: string;
  activeFilters: string[];
}

export interface FilterResult {
  type: 'result';
  filteredAccounts: AccountBadges[];
  processingTime: number;
}

// Optimized worker messages (Proposals 1, 2, 3)
export interface InitMessage {
  type: 'init';
  accounts: AccountBadges[];
}

export interface InitCompleteMessage {
  type: 'init-complete';
  accountCount: number;
  badgeCount: number;
  prefixCount: number;
  trigramCount: number;
  initTime: number;
}

export interface OptimizedFilterMessage {
  type: 'filter';
  searchQuery: string;
  activeFilters: string[];
}

export interface ResetMessage {
  type: 'reset';
}

export interface ResetCompleteMessage {
  type: 'reset-complete';
}

export interface StatsMessage {
  type: 'stats';
}

export interface StatsResultMessage {
  type: 'stats-result';
  initialized: boolean;
  accountCount: number;
  badgeCount: number;
  prefixCount: number;
  trigramCount: number;
  initTimestamp: number;
}

export interface ErrorMessage {
  type: 'error';
  error: string;
}

export type WorkerMessage = InitMessage | OptimizedFilterMessage | ResetMessage | StatsMessage;

export type WorkerResponse =
  | { type: 'ready' }
  | InitCompleteMessage
  | FilterResult
  | ResetCompleteMessage
  | StatsResultMessage
  | ErrorMessage;

export function unixToISO(ts?: number): string | null {
  if (!ts) return null;
  try {
    return new Date(ts * 1000).toISOString();
  } catch {
    return null;
  }
}

export function formatUnixHuman(ts?: number): string | null {
  if (!ts) return null;
  try {
    return new Date(ts * 1000).toLocaleString();
  } catch {
    return null;
  }
}
