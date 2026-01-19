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
  SAMPLE_DATA_LOAD: 'sample_data_load',
  LANGUAGE_CHANGE: 'language_change',

  // V2: Wizard
  WIZARD_STEP_VIEW: 'wizard_step_view',
  WIZARD_NEXT_CLICK: 'wizard_next_click',
  WIZARD_BACK_CLICK: 'wizard_back_click',
  WIZARD_CANCEL: 'wizard_cancel',
  WIZARD_EXTERNAL_LINK_CLICK: 'wizard_external_link_click',

  // V2: Results
  EXTERNAL_PROFILE_CLICK: 'external_profile_click',

  // V3: Funnel / Page Views
  PAGE_VIEW: 'page_view',

  // V3: Upload Zone
  UPLOAD_DRAG_ENTER: 'upload_drag_enter',
  UPLOAD_DRAG_LEAVE: 'upload_drag_leave',
  UPLOAD_DROP: 'upload_drop',
  UPLOAD_CLICK: 'upload_click',

  // V3: Diagnostic Errors
  DIAGNOSTIC_ERROR_VIEW: 'diagnostic_error_view',
  DIAGNOSTIC_ERROR_RETRY: 'diagnostic_error_retry',
  DIAGNOSTIC_ERROR_HELP: 'diagnostic_error_help',

  // V5: Granular Upload Errors
  UPLOAD_ERROR_NOT_ZIP: 'upload_error_not_zip',
  UPLOAD_ERROR_HTML_FORMAT: 'upload_error_html_format',
  UPLOAD_ERROR_NOT_INSTAGRAM: 'upload_error_not_instagram',
  UPLOAD_ERROR_INCOMPLETE: 'upload_error_incomplete',
  UPLOAD_ERROR_NO_DATA: 'upload_error_no_data',
  UPLOAD_ERROR_MISSING_FOLLOWING: 'upload_error_missing_following',
  UPLOAD_ERROR_MISSING_FOLLOWERS: 'upload_error_missing_followers',
  UPLOAD_ERROR_UNKNOWN: 'upload_error_unknown',

  // V5: Session & Engagement
  TIME_ON_RESULTS: 'time_on_results',
  SESSION_DURATION: 'session_duration',
  RETURN_UPLOAD: 'return_upload',

  // V5: Mobile-specific
  FILE_PICKER_OPEN: 'file_picker_open',
  FILE_PICKER_CANCEL: 'file_picker_cancel',

  // V3: FAQ
  FAQ_EXPAND: 'faq_expand',

  // V3: Results Engagement
  RESULTS_SCROLL_DEPTH: 'results_scroll_depth',

  // V4: Rescue Plan Monetization
  RESCUE_PLAN_IMPRESSION: 'rescue_plan_impression',
  RESCUE_PLAN_TOOL_CLICK: 'rescue_plan_tool_click',
  RESCUE_PLAN_DISMISS: 'rescue_plan_dismiss',
  RESCUE_PLAN_HOVER: 'rescue_plan_hover',
  RESCUE_PLAN_VIEW_TIME: 'rescue_plan_view_time',
  RESCUE_PLAN_RE_ENGAGEMENT: 'rescue_plan_re_engagement',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

type LinkType =
  | 'github'
  | 'docs'
  | 'docs-troubleshooting'
  | 'docs-accessibility'
  | 'license'
  | 'meta_accounts'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'buy-me-coffee';
type HelpSource = 'header' | 'upload_section';
type FilterAction = 'enable' | 'disable';
type PageName = 'hero' | 'wizard' | 'upload' | 'results' | 'sample' | 'privacy' | 'terms' | '404';
type ScrollDepth = 25 | 50 | 75 | 100;

// Re-export DiagnosticErrorCode from core/types to ensure consistency
export type { DiagnosticErrorCode } from '@/core/types';

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
  themeToggle: (mode: 'dark' | 'light' | 'system') => {
    trackEvent(AnalyticsEvents.THEME_TOGGLE, { mode });
  },

  clearData: () => {
    trackEvent(AnalyticsEvents.CLEAR_DATA);
  },

  sampleDataClick: () => {
    trackEvent(AnalyticsEvents.SAMPLE_DATA_CLICK);
  },

  languageChange: (language: string) => {
    trackEvent(AnalyticsEvents.LANGUAGE_CHANGE, { language });
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

  // V3: Funnel / Page Views
  pageView: (page: PageName, language?: string) => {
    trackEvent(AnalyticsEvents.PAGE_VIEW, {
      page,
      ...(language && { language }),
    });
  },

  // V3: Upload Zone
  uploadDragEnter: () => {
    trackEvent(AnalyticsEvents.UPLOAD_DRAG_ENTER);
  },

  uploadDragLeave: () => {
    trackEvent(AnalyticsEvents.UPLOAD_DRAG_LEAVE);
  },

  uploadDrop: () => {
    trackEvent(AnalyticsEvents.UPLOAD_DROP);
  },

  uploadClick: () => {
    trackEvent(AnalyticsEvents.UPLOAD_CLICK);
  },

  // V3: Diagnostic Errors
  diagnosticErrorView: (code: string, source?: string) => {
    trackEvent(AnalyticsEvents.DIAGNOSTIC_ERROR_VIEW, {
      error_code: code,
      ...(source && { source }),
    });
  },

  diagnosticErrorRetry: (code: string) => {
    trackEvent(AnalyticsEvents.DIAGNOSTIC_ERROR_RETRY, {
      error_code: code,
    });
  },

  diagnosticErrorHelp: (code: string) => {
    trackEvent(AnalyticsEvents.DIAGNOSTIC_ERROR_HELP, {
      error_code: code,
    });
  },

  // V3: FAQ
  faqExpand: (questionId: number, questionText: string) => {
    trackEvent(AnalyticsEvents.FAQ_EXPAND, {
      question_id: questionId,
      question_text: questionText.slice(0, 100), // Limit length
    });
  },

  // V3: Results Engagement
  resultsScrollDepth: (depth: ScrollDepth, totalAccounts: number) => {
    trackEvent(AnalyticsEvents.RESULTS_SCROLL_DEPTH, {
      depth,
      total_accounts: totalAccounts,
    });
  },

  // V3: Sample Data Load
  sampleDataLoad: (accountCount: number, loadTimeMs: number) => {
    trackEvent(AnalyticsEvents.SAMPLE_DATA_LOAD, {
      account_count: accountCount,
      load_time_ms: Math.round(loadTimeMs),
    });
  },

  // V4: Rescue Plan Monetization
  rescuePlanImpression: (severity: string, size: string, unfollowedPercent: number) => {
    trackEvent(AnalyticsEvents.RESCUE_PLAN_IMPRESSION, {
      severity,
      size,
      unfollowed_percent: Math.round(unfollowedPercent),
    });
  },

  rescuePlanToolClick: (toolId: string, severity: string, size: string) => {
    trackEvent(AnalyticsEvents.RESCUE_PLAN_TOOL_CLICK, {
      tool_id: toolId,
      severity,
      size,
    });
  },

  rescuePlanDismiss: (severity: string, size: string, unfollowedPercent: number) => {
    trackEvent(AnalyticsEvents.RESCUE_PLAN_DISMISS, {
      severity,
      size,
      unfollowed_percent: Math.round(unfollowedPercent),
    });
  },

  rescuePlanHover: (toolId: string, durationMs: number) => {
    trackEvent(AnalyticsEvents.RESCUE_PLAN_HOVER, {
      tool_id: toolId,
      duration_ms: Math.round(durationMs),
    });
  },

  rescuePlanViewTime: (seconds: number, severity: string, size: string) => {
    trackEvent(AnalyticsEvents.RESCUE_PLAN_VIEW_TIME, {
      view_time_seconds: Math.round(seconds),
      severity,
      size,
    });
  },

  rescuePlanReEngagement: (oldSeverity: string, newSeverity: string) => {
    trackEvent(AnalyticsEvents.RESCUE_PLAN_RE_ENGAGEMENT, {
      old_severity: oldSeverity,
      new_severity: newSeverity,
    });
  },

  // Error Boundary (optional tracking)
  errorBoundary: (errorMessage: string, componentStack: string) => {
    // Note: Not in AnalyticsEvents const - optional tracking
    trackEvent('error_boundary' as AnalyticsEventName, {
      error_message: errorMessage.slice(0, 200),
      component_stack: componentStack.slice(0, 500),
    });
  },

  // Route Error (optional tracking)
  routeError: (status: number, message: string) => {
    // Note: Not in AnalyticsEvents const - optional tracking
    trackEvent('route_error' as AnalyticsEventName, {
      status,
      message: message.slice(0, 200),
    });
  },

  // V5: Granular Upload Errors
  uploadErrorByCode: (
    fileHash: string,
    code: import('@/core/types').DiagnosticErrorCode,
    errorMessage?: string
  ) => {
    const eventMap: Record<
      import('@/core/types').DiagnosticErrorCode,
      (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents]
    > = {
      NOT_ZIP: AnalyticsEvents.UPLOAD_ERROR_NOT_ZIP,
      HTML_FORMAT: AnalyticsEvents.UPLOAD_ERROR_HTML_FORMAT,
      NOT_INSTAGRAM_EXPORT: AnalyticsEvents.UPLOAD_ERROR_NOT_INSTAGRAM,
      INCOMPLETE_EXPORT: AnalyticsEvents.UPLOAD_ERROR_INCOMPLETE,
      NO_DATA_FILES: AnalyticsEvents.UPLOAD_ERROR_NO_DATA,
      MISSING_FOLLOWING: AnalyticsEvents.UPLOAD_ERROR_MISSING_FOLLOWING,
      MISSING_FOLLOWERS: AnalyticsEvents.UPLOAD_ERROR_MISSING_FOLLOWERS,
      UNKNOWN: AnalyticsEvents.UPLOAD_ERROR_UNKNOWN,
    };
    trackEvent(eventMap[code], { file_hash: fileHash });
    // Keep legacy event for backward compatibility
    analytics.fileUploadError(fileHash, `${code}: ${errorMessage ?? ''}`);
  },

  // V5: Session & Engagement
  timeOnResults: (seconds: number, accountCount: number, actionsCount: number) => {
    trackEvent(AnalyticsEvents.TIME_ON_RESULTS, {
      time_seconds: Math.round(seconds),
      account_count: accountCount,
      actions_count: actionsCount,
    });
  },

  sessionDuration: (seconds: number, pagesViewed: number) => {
    trackEvent(AnalyticsEvents.SESSION_DURATION, {
      duration_seconds: Math.round(seconds),
      pages_viewed: pagesViewed,
    });
  },

  returnUpload: (fileHashPrefix: string, daysSinceLastUpload: number) => {
    trackEvent(AnalyticsEvents.RETURN_UPLOAD, {
      file_hash_prefix: fileHashPrefix.slice(0, 8),
      days_since_last: daysSinceLastUpload,
    });
  },

  // V5: Mobile-specific
  filePickerOpen: (source: 'click' | 'drag') => {
    trackEvent(AnalyticsEvents.FILE_PICKER_OPEN, { source });
  },

  filePickerCancel: () => {
    trackEvent(AnalyticsEvents.FILE_PICKER_CANCEL);
  },
};
