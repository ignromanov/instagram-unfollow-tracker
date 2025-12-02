/**
 * Umami Analytics Utility
 *
 * Privacy-first analytics with file content hash for session correlation.
 * Uses the same hash as IndexedDB cache for consistency.
 * No personal data (usernames, file names) is ever tracked.
 */

// Umami global interface
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void;
    };
  }
}

// Event name constants
export const AnalyticsEvents = {
  // File Upload
  FILE_UPLOAD_START: 'file_upload_start',
  FILE_UPLOAD_SUCCESS: 'file_upload_success',
  FILE_UPLOAD_ERROR: 'file_upload_error',

  // Filters
  FILTER_TOGGLE: 'filter_toggle',
  FILTER_CLEAR_ALL: 'filter_clear_all',

  // Search
  SEARCH_PERFORM: 'search_perform',

  // Account interactions
  ACCOUNT_CLICK: 'account_click',

  // Help
  HELP_OPEN: 'help_open',

  // Links
  LINK_CLICK: 'link_click',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

type LinkType = 'github' | 'docs' | 'license' | 'meta_accounts';
type HelpSource = 'header' | 'upload_section';
type FilterAction = 'enable' | 'disable';

/**
 * Track event with Umami
 * Safe to call even if Umami hasn't loaded
 */
function trackEvent(
  eventName: AnalyticsEventName,
  eventData?: Record<string, string | number | boolean>
): void {
  try {
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track(eventName, eventData);
    }
  } catch {
    // Silently fail - analytics should never break the app
  }
}

/**
 * Analytics helper object with typed methods
 */
export const analytics = {
  // File Upload events
  fileUploadStart: (fileHash: string, fileSizeMb: number) => {
    trackEvent(AnalyticsEvents.FILE_UPLOAD_START, {
      file_hash: fileHash,
      file_size_mb: Math.round(fileSizeMb * 100) / 100,
    });
  },

  fileUploadSuccess: (
    fileHash: string,
    accountCount: number,
    processingTimeMs: number,
    fromCache: boolean
  ) => {
    trackEvent(AnalyticsEvents.FILE_UPLOAD_SUCCESS, {
      file_hash: fileHash,
      account_count: accountCount,
      processing_time_ms: Math.round(processingTimeMs),
      from_cache: fromCache,
    });
  },

  fileUploadError: (fileHash: string, errorMessage: string) => {
    trackEvent(AnalyticsEvents.FILE_UPLOAD_ERROR, {
      file_hash: fileHash,
      error_message: errorMessage.slice(0, 200), // Limit length
    });
  },

  // Filter events
  filterToggle: (filterName: string, action: FilterAction, activeCount: number) => {
    trackEvent(AnalyticsEvents.FILTER_TOGGLE, {
      filter_name: filterName,
      filter_action: action,
      active_filter_count: activeCount,
    });
  },

  filterClearAll: (previousCount: number) => {
    trackEvent(AnalyticsEvents.FILTER_CLEAR_ALL, {
      previous_count: previousCount,
    });
  },

  // Search events
  searchPerform: (
    queryLength: number,
    resultCount: number,
    totalCount: number,
    hasFiltersActive: boolean
  ) => {
    trackEvent(AnalyticsEvents.SEARCH_PERFORM, {
      query_length: queryLength,
      result_count: resultCount,
      total_count: totalCount,
      has_filters_active: hasFiltersActive,
    });
  },

  // Account click
  accountClick: (badgeCount: number) => {
    trackEvent(AnalyticsEvents.ACCOUNT_CLICK, {
      badge_count: badgeCount,
    });
  },

  // Help modal
  helpOpen: (source: HelpSource) => {
    trackEvent(AnalyticsEvents.HELP_OPEN, {
      source,
    });
  },

  // External links
  linkClick: (linkType: LinkType) => {
    trackEvent(AnalyticsEvents.LINK_CLICK, {
      link_type: linkType,
    });
  },
};
