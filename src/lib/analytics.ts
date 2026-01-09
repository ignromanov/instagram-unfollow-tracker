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

// localStorage key for tracking opt-out preference
const TRACKING_OPT_OUT_KEY = 'umami-opt-out';

/**
 * Check if user has opted out of tracking
 */
export function isTrackingOptedOut(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(TRACKING_OPT_OUT_KEY) === 'true';
}

/**
 * Opt out of tracking - Umami script will not load
 */
export function optOutOfTracking(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRACKING_OPT_OUT_KEY, 'true');
  // Remove existing umami instance if present
  delete window.umami;
}

/**
 * Opt back into tracking
 */
export function optIntoTracking(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TRACKING_OPT_OUT_KEY);
  // Reload page to load Umami script
  window.location.reload();
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

  // V2: Hero CTAs
  HERO_CTA_GUIDE: 'hero_cta_guide',
  HERO_CTA_SAMPLE: 'hero_cta_sample',
  HERO_CTA_UPLOAD_DIRECT: 'hero_cta_upload_direct',
  HERO_CTA_CONTINUE: 'hero_cta_continue',

  // V2: Navigation
  THEME_TOGGLE: 'theme_toggle',
  CLEAR_DATA: 'clear_data',
  SAMPLE_DATA_CLICK: 'sample_data_click',

  // V2: Wizard
  WIZARD_STEP_VIEW: 'wizard_step_view',
  WIZARD_NEXT_CLICK: 'wizard_next_click',
  WIZARD_BACK_CLICK: 'wizard_back_click',
  WIZARD_CANCEL: 'wizard_cancel',
  WIZARD_EXTERNAL_LINK_CLICK: 'wizard_external_link_click',

  // V2: Results
  EXTERNAL_PROFILE_CLICK: 'external_profile_click',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

type LinkType =
  | 'github'
  | 'docs'
  | 'license'
  | 'meta_accounts'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'buy-me-coffee';
type HelpSource = 'header' | 'upload_section';
type FilterAction = 'enable' | 'disable';

/**
 * Track event with Umami
 * Safe to call even if Umami hasn't loaded
 * Disabled in development mode or if user opted out
 */
function trackEvent(
  eventName: AnalyticsEventName,
  eventData?: Record<string, string | number | boolean>
): void {
  // Skip analytics in development or if opted out
  if (import.meta.env.DEV || isTrackingOptedOut()) {
    return;
  }

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

  // V2: Hero CTAs
  heroCTAGuide: () => {
    trackEvent(AnalyticsEvents.HERO_CTA_GUIDE);
  },

  heroCTASample: () => {
    trackEvent(AnalyticsEvents.HERO_CTA_SAMPLE);
  },

  heroCTAUploadDirect: () => {
    trackEvent(AnalyticsEvents.HERO_CTA_UPLOAD_DIRECT);
  },

  heroCTAContinue: () => {
    trackEvent(AnalyticsEvents.HERO_CTA_CONTINUE);
  },

  // V2: Navigation
  themeToggle: (mode: 'dark' | 'light') => {
    trackEvent(AnalyticsEvents.THEME_TOGGLE, { mode });
  },

  clearData: () => {
    trackEvent(AnalyticsEvents.CLEAR_DATA);
  },

  sampleDataClick: () => {
    trackEvent(AnalyticsEvents.SAMPLE_DATA_CLICK);
  },

  // V2: Wizard events
  wizardStepView: (stepId: number, stepTitle: string) => {
    trackEvent(AnalyticsEvents.WIZARD_STEP_VIEW, {
      step_id: stepId,
      step_title: stepTitle,
    });
  },

  wizardNextClick: (fromStep: number) => {
    trackEvent(AnalyticsEvents.WIZARD_NEXT_CLICK, { from_step: fromStep });
  },

  wizardBackClick: (fromStep: number) => {
    trackEvent(AnalyticsEvents.WIZARD_BACK_CLICK, { from_step: fromStep });
  },

  wizardCancel: () => {
    trackEvent(AnalyticsEvents.WIZARD_CANCEL);
  },

  wizardExternalLinkClick: (stepId: number) => {
    trackEvent(AnalyticsEvents.WIZARD_EXTERNAL_LINK_CLICK, { step_id: stepId });
  },

  // V2: Results
  externalProfileClick: (username: string) => {
    trackEvent(AnalyticsEvents.EXTERNAL_PROFILE_CLICK, {
      username_hash: username.slice(0, 2) + '***', // Privacy: only prefix
    });
  },
};
