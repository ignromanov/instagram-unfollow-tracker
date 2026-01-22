export interface InstagramListItem {
  href: string;
  value?: string; // username (old format) - now optional, username may be in parent entry.title
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
  // Existing - File format errors
  | 'NOT_ZIP' // File is not a ZIP archive
  | 'HTML_FORMAT' // ZIP contains HTML instead of JSON
  | 'NOT_INSTAGRAM_EXPORT' // ZIP is not Instagram export
  | 'INCOMPLETE_EXPORT' // Missing followers_and_following folder
  | 'NO_DATA_FILES' // No following.json or followers files
  | 'MISSING_FOLLOWING' // following.json not found
  | 'MISSING_FOLLOWERS' // followers_*.json not found
  // New - ZIP/File errors
  | 'CORRUPTED_ZIP' // JSZip failed to open
  | 'ZIP_ENCRYPTED' // ZIP is password-protected
  | 'EMPTY_FILE' // File is empty (0 bytes)
  | 'FILE_TOO_LARGE' // File exceeds 500MB
  // New - Parsing errors
  | 'JSON_PARSE_ERROR' // Invalid JSON
  | 'INVALID_DATA_STRUCTURE' // JSON exists but wrong structure
  // New - Worker errors
  | 'WORKER_TIMEOUT' // 60s timeout exceeded
  | 'WORKER_INIT_ERROR' // Worker failed to initialize
  | 'WORKER_CRASHED' // Worker crashed during processing
  // New - Storage errors
  | 'INDEXEDDB_ERROR' // General IDB error
  | 'QUOTA_EXCEEDED' // Storage quota exceeded
  | 'IDB_NOT_SUPPORTED' // IndexedDB unavailable (incognito)
  | 'IDB_PERMISSION_DENIED' // Storage permission denied
  // New - Other errors
  | 'UPLOAD_CANCELLED' // User cancelled upload
  | 'CRYPTO_NOT_AVAILABLE' // crypto.subtle unavailable
  | 'NETWORK_ERROR' // Network failure
  | 'UNKNOWN'; // Fallback

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
    // Existing
    NOT_ZIP: 'NOT_ZIP',
    HTML_FORMAT: 'HTML_FORMAT',
    NOT_INSTAGRAM_EXPORT: 'NOT_INSTAGRAM_EXPORT',
    INCOMPLETE_EXPORT: 'INCOMPLETE_EXPORT',
    NO_DATA_FILES: 'NO_DATA_FILES',
    MISSING_FOLLOWING: 'MISSING_FOLLOWING',
    MISSING_FOLLOWERS: 'MISSING_FOLLOWERS',
    // New - ZIP/File
    CORRUPTED_ZIP: 'CORRUPTED_ZIP',
    ZIP_ENCRYPTED: 'ZIP_ENCRYPTED',
    EMPTY_FILE: 'EMPTY_FILE',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    // New - Parsing
    JSON_PARSE_ERROR: 'JSON_PARSE_ERROR',
    INVALID_DATA_STRUCTURE: 'INVALID_DATA_STRUCTURE',
    // New - Worker
    WORKER_TIMEOUT: 'WORKER_TIMEOUT',
    WORKER_INIT_ERROR: 'WORKER_INIT_ERROR',
    WORKER_CRASHED: 'WORKER_CRASHED',
    // New - Storage
    INDEXEDDB_ERROR: 'INDEXEDDB_ERROR',
    QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
    IDB_NOT_SUPPORTED: 'IDB_NOT_SUPPORTED',
    IDB_PERMISSION_DENIED: 'IDB_PERMISSION_DENIED',
    // New - Other
    UPLOAD_CANCELLED: 'UPLOAD_CANCELLED',
    CRYPTO_NOT_AVAILABLE: 'CRYPTO_NOT_AVAILABLE',
    NETWORK_ERROR: 'NETWORK_ERROR',
  };
  return mapping[code] ?? 'UNKNOWN';
}

/** Create DiagnosticError from error code */
export function createDiagnosticError(
  code: DiagnosticErrorCode,
  customMessage?: string
): DiagnosticError {
  const errors: Record<DiagnosticErrorCode, Omit<DiagnosticError, 'code'>> = {
    // Existing errors
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
    // New - ZIP/File errors
    CORRUPTED_ZIP: {
      title: 'Corrupted ZIP File',
      message: 'The ZIP file appears to be damaged or corrupted and cannot be opened.',
      fix: 'Try downloading your Instagram data again. Make sure the download completed fully before uploading.',
      icon: 'zip',
      severity: 'error',
    },
    ZIP_ENCRYPTED: {
      title: 'Password-Protected ZIP',
      message: 'The ZIP file is password-protected, but Instagram exports are not encrypted.',
      fix: 'This may not be a valid Instagram data export. Request a new export from Instagram Settings.',
      icon: 'zip',
      severity: 'error',
    },
    EMPTY_FILE: {
      title: 'Empty File',
      message: 'The uploaded file is empty (0 bytes).',
      fix: 'The download may have been interrupted. Try downloading your data again from Instagram.',
      icon: 'file',
      severity: 'error',
    },
    FILE_TOO_LARGE: {
      title: 'File Too Large',
      message: 'The file exceeds the maximum supported size of 500MB.',
      fix: 'Try requesting a smaller data export from Instagram, or use a desktop browser with more memory.',
      icon: 'file',
      severity: 'error',
    },
    // New - Parsing errors
    JSON_PARSE_ERROR: {
      title: 'Invalid Data Format',
      message: 'One or more JSON files in the export are malformed or corrupted.',
      fix: 'This may indicate a corrupted download. Request a fresh data export from Instagram.',
      icon: 'file',
      severity: 'error',
    },
    INVALID_DATA_STRUCTURE: {
      title: 'Unexpected Data Structure',
      message: 'The JSON files exist but have an unexpected structure.',
      fix: 'Instagram may have changed their export format. Please report this issue.',
      icon: 'file',
      severity: 'error',
    },
    // New - Worker errors
    WORKER_TIMEOUT: {
      title: 'Processing Timeout',
      message: 'The file took too long to process (over 60 seconds).',
      fix: 'Try closing other browser tabs to free up resources, or use a smaller export file.',
      icon: 'unknown',
      severity: 'error',
    },
    WORKER_INIT_ERROR: {
      title: 'Processing Failed to Start',
      message: 'Could not initialize the file processor.',
      fix: 'Try refreshing the page. If the problem persists, try a different browser.',
      icon: 'unknown',
      severity: 'error',
    },
    WORKER_CRASHED: {
      title: 'Processing Crashed',
      message: 'The file processor crashed unexpectedly.',
      fix: 'This may be due to insufficient memory. Try closing other tabs or using a smaller file.',
      icon: 'unknown',
      severity: 'error',
    },
    // New - Storage errors
    INDEXEDDB_ERROR: {
      title: 'Storage Error',
      message: 'Could not save data to browser storage.',
      fix: 'Try clearing browser cache or using a different browser. Private/incognito mode may have limited storage.',
      icon: 'unknown',
      severity: 'error',
    },
    QUOTA_EXCEEDED: {
      title: 'Storage Full',
      message: 'Browser storage quota has been exceeded.',
      fix: 'Clear some browser data in Settings, or try a different browser profile.',
      icon: 'unknown',
      severity: 'error',
    },
    IDB_NOT_SUPPORTED: {
      title: 'Storage Not Available',
      message: 'IndexedDB storage is not available in this browser.',
      fix: 'This app requires IndexedDB. Disable incognito/private mode, or try Chrome/Firefox/Safari.',
      icon: 'unknown',
      severity: 'error',
    },
    IDB_PERMISSION_DENIED: {
      title: 'Storage Permission Denied',
      message: 'The browser denied access to storage.',
      fix: 'Check browser settings to allow storage for this site, or disable strict privacy mode.',
      icon: 'unknown',
      severity: 'error',
    },
    // New - Other errors
    UPLOAD_CANCELLED: {
      title: 'Upload Cancelled',
      message: 'The upload was cancelled.',
      fix: 'Click "Try Again" to upload your file.',
      icon: 'unknown',
      severity: 'warning',
    },
    CRYPTO_NOT_AVAILABLE: {
      title: 'Security Feature Unavailable',
      message: 'Your browser does not support secure hashing (crypto.subtle).',
      fix: 'Please use a modern browser (Chrome 37+, Firefox 34+, Safari 11+) with HTTPS.',
      icon: 'unknown',
      severity: 'error',
    },
    NETWORK_ERROR: {
      title: 'Network Error',
      message: 'A network error occurred during upload.',
      fix: 'Check your internet connection and try again.',
      icon: 'unknown',
      severity: 'error',
    },
    // Fallback
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

/** All diagnostic error codes for dev preview */
export const ALL_DIAGNOSTIC_ERROR_CODES: DiagnosticErrorCode[] = [
  'NOT_ZIP',
  'HTML_FORMAT',
  'NOT_INSTAGRAM_EXPORT',
  'INCOMPLETE_EXPORT',
  'NO_DATA_FILES',
  'MISSING_FOLLOWING',
  'MISSING_FOLLOWERS',
  'CORRUPTED_ZIP',
  'ZIP_ENCRYPTED',
  'EMPTY_FILE',
  'FILE_TOO_LARGE',
  'JSON_PARSE_ERROR',
  'INVALID_DATA_STRUCTURE',
  'WORKER_TIMEOUT',
  'WORKER_INIT_ERROR',
  'WORKER_CRASHED',
  'INDEXEDDB_ERROR',
  'QUOTA_EXCEEDED',
  'IDB_NOT_SUPPORTED',
  'IDB_PERMISSION_DENIED',
  'UPLOAD_CANCELLED',
  'CRYPTO_NOT_AVAILABLE',
  'NETWORK_ERROR',
  'UNKNOWN',
];

// V3 App state for hash routing
export enum AppState {
  HERO = 'HERO',
  WIZARD = 'WIZARD',
  UPLOAD = 'UPLOAD',
  RESULTS = 'RESULTS',
  SAMPLE = 'SAMPLE',
  PRIVACY = 'PRIVACY',
  TERMS = 'TERMS',
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
