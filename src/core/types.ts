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

// Time-based badges that store Unix timestamps (seconds since epoch)
export type TimeBasedBadgeKey =
  | 'following'
  | 'followers'
  | 'pending'
  | 'permanent'
  | 'restricted'
  | 'close'
  | 'unfollowed'
  | 'dismissed';

// Boolean badges (computed, not from Instagram data)
export type BooleanBadgeKey = 'notFollowingBack' | 'notFollowedBack' | 'mutuals';

// Typed badge maps for each category
export type TimeBadges = Partial<Record<TimeBasedBadgeKey, number>>;
export type BoolBadges = Partial<Record<BooleanBadgeKey, true>>;

// Combined badge map with proper types per category
export type BadgeMap = TimeBadges & BoolBadges;

// Legacy type alias for backward compatibility
export type BadgeValue = number | true;

export interface AccountBadges {
  username: string;
  badges: BadgeMap;
}

// Type guards for badge value access
export function isTimeBadge(key: BadgeKey): key is TimeBasedBadgeKey {
  return [
    'following',
    'followers',
    'pending',
    'permanent',
    'restricted',
    'close',
    'unfollowed',
    'dismissed',
  ].includes(key);
}

export function isBoolBadge(key: BadgeKey): key is BooleanBadgeKey {
  return ['notFollowingBack', 'notFollowedBack', 'mutuals'].includes(key);
}

// Safe accessors for typed badge values
export function getTimestamp(badges: BadgeMap, key: TimeBasedBadgeKey): number | undefined {
  return badges[key];
}

export function hasBoolBadge(badges: BadgeMap, key: BooleanBadgeKey): boolean {
  return badges[key] === true;
}

/**
 * File metadata for UI layer.
 * Uses short field names (name, size) for convenience.
 * For IndexedDB storage, see FileMetadataRecord in indexeddb-schema.ts
 */
export interface FileMetadata {
  name: string;
  size: number;
  uploadDate: Date;
  fileHash?: string;
  accountCount?: number;
  lastAccessed?: number;
  version?: number;
  processingTime?: number;
}

/**
 * Required fields for persisted file metadata.
 * Used for validation before saving to IndexedDB.
 */
export type RequiredFileMetadata = Required<Omit<FileMetadata, 'processingTime'>> & {
  processingTime?: number;
};

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

/**
 * Upload state with discriminated union for type-safe status handling.
 * Each status variant has appropriate fields:
 * - idle: no file, no error
 * - loading: has fileName, no error
 * - success: has fileName, no error
 * - error: has error message, fileName optional
 */
export type UploadState =
  | { status: 'idle'; error: null; fileName: null }
  | { status: 'loading'; error: null; fileName: string }
  | { status: 'success'; error: null; fileName: string }
  | { status: 'error'; error: string; fileName: string | null };

/** Helper to create type-safe UploadState */
export function createUploadState(
  status: 'idle' | 'loading' | 'success' | 'error',
  fileName: string | null,
  error: string | null
): UploadState {
  switch (status) {
    case 'idle':
      return { status: 'idle', error: null, fileName: null };
    case 'loading':
      return { status: 'loading', error: null, fileName: fileName ?? '' };
    case 'success':
      return { status: 'success', error: null, fileName: fileName ?? '' };
    case 'error':
      return { status: 'error', error: error ?? 'Unknown error', fileName };
  }
}

// === Diagnostic Error Types ===

/** Error codes for diagnostic UI */
export type DiagnosticErrorCode =
  | 'NOT_ZIP' // File is not a ZIP archive
  | 'HTML_FORMAT' // ZIP contains HTML instead of JSON
  | 'NOT_INSTAGRAM_EXPORT' // ZIP is not Instagram export
  | 'INCOMPLETE_EXPORT' // Missing followers_and_following folder
  | 'NO_DATA_FILES' // No following.json or followers files
  | 'MISSING_FOLLOWING' // following.json not found
  | 'MISSING_FOLLOWERS' // followers_*.json not found
  | 'UNKNOWN'; // Unknown error

/** Diagnostic error with rich metadata for UI */
export interface DiagnosticError {
  code: DiagnosticErrorCode;
  title: string;
  message: string;
  fix: string;
  icon: 'html' | 'zip' | 'folder' | 'file' | 'unknown';
  severity: 'error' | 'warning';
}

/** Map ParseWarning code to DiagnosticErrorCode */
export function mapWarningToDiagnosticCode(code: string): DiagnosticErrorCode {
  const mapping: Record<string, DiagnosticErrorCode> = {
    HTML_FORMAT: 'HTML_FORMAT',
    NOT_INSTAGRAM_EXPORT: 'NOT_INSTAGRAM_EXPORT',
    INCOMPLETE_EXPORT: 'INCOMPLETE_EXPORT',
    NO_DATA_FILES: 'NO_DATA_FILES',
    MISSING_FOLLOWING: 'MISSING_FOLLOWING',
    MISSING_FOLLOWERS: 'MISSING_FOLLOWERS',
  };
  return mapping[code] ?? 'UNKNOWN';
}

/** Create DiagnosticError from error code */
export function createDiagnosticError(
  code: DiagnosticErrorCode,
  customMessage?: string
): DiagnosticError {
  const errors: Record<DiagnosticErrorCode, Omit<DiagnosticError, 'code'>> = {
    NOT_ZIP: {
      title: 'Not a ZIP File',
      message: 'Please upload the ZIP archive from Instagram, not a folder or other file type.',
      fix: 'Look for a file ending in .zip in your Downloads folder. It should be named something like "instagram-username-date.zip".',
      icon: 'zip',
      severity: 'error',
    },
    HTML_FORMAT: {
      title: 'Wrong Format: HTML',
      message:
        'You downloaded your data in HTML format, but this tool requires JSON format to work.',
      fix: 'Go back to Instagram Settings → Download Your Data → Select "JSON" format (not HTML) → Request download again.',
      icon: 'html',
      severity: 'error',
    },
    NOT_INSTAGRAM_EXPORT: {
      title: 'Not an Instagram Export',
      message: "This ZIP file doesn't appear to be an Instagram data export.",
      fix: 'Make sure you\'re uploading the ZIP file from Instagram\'s "Download Your Data" feature, not a random ZIP file.',
      icon: 'folder',
      severity: 'error',
    },
    INCOMPLETE_EXPORT: {
      title: 'Incomplete Export',
      message: 'The export is missing the "Followers and following" data.',
      fix: 'Re-request your data from Instagram and make sure to select "Followers and following" in the data types.',
      icon: 'folder',
      severity: 'error',
    },
    NO_DATA_FILES: {
      title: 'No Follower Data Found',
      message: 'Could not find following.json or followers files in the expected location.',
      fix: 'Make sure you selected "Followers and following" when requesting your data, and that you\'re uploading the correct ZIP file.',
      icon: 'file',
      severity: 'error',
    },
    MISSING_FOLLOWING: {
      title: 'Missing Following Data',
      message: 'following.json not found — cannot detect who you follow.',
      fix: 'Re-request your data and ensure "Followers and following" is selected.',
      icon: 'file',
      severity: 'warning',
    },
    MISSING_FOLLOWERS: {
      title: 'Missing Followers Data',
      message: 'followers_*.json files not found — cannot detect who follows you.',
      fix: 'Re-request your data and ensure "Followers and following" is selected.',
      icon: 'file',
      severity: 'warning',
    },
    UNKNOWN: {
      title: 'Upload Error',
      message: customMessage ?? 'An unexpected error occurred while processing your file.',
      fix: 'Try uploading the file again. If the problem persists, make sure the ZIP file is not corrupted.',
      icon: 'unknown',
      severity: 'error',
    },
  };

  const errorData = errors[code];
  return {
    code,
    ...errorData,
    message: customMessage ?? errorData.message,
  };
}

// V3 App state for hash routing
export enum AppState {
  HERO = 'HERO',
  WIZARD = 'WIZARD',
  WAITING = 'WAITING',
  UPLOAD = 'UPLOAD',
  RESULTS = 'RESULTS',
  SAMPLE = 'SAMPLE',
}

// Wizard step data
export interface WizardStep {
  id: number;
  title: string;
  description: string;
  visual?: string;
  externalLink?: string;
  isWarning?: boolean;
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
