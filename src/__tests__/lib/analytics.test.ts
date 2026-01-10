/**
 * Analytics Tests
 *
 * Tests for privacy-first analytics utility with opt-out support
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  analytics,
  AnalyticsEvents,
  isTrackingOptedOut,
  optOutOfTracking,
  optIntoTracking,
} from '@/lib/analytics';

describe('Analytics', () => {
  let localStorageMock: Record<string, string> = {};
  let windowSpy: any;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    global.localStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
      clear: () => {
        localStorageMock = {};
      },
      key: () => null,
      length: 0,
    };

    // Mock window.umami
    windowSpy = {
      umami: {
        track: vi.fn(),
      },
      location: {
        reload: vi.fn(),
      },
    };
    global.window = windowSpy as any;

    // Reset import.meta.env
    vi.stubEnv('DEV', false);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe('Opt-out functionality', () => {
    it('should return false when not opted out', () => {
      expect(isTrackingOptedOut()).toBe(false);
    });

    it('should return true after opting out', () => {
      optOutOfTracking();
      expect(isTrackingOptedOut()).toBe(true);
    });

    it('should persist opt-out preference in localStorage', () => {
      optOutOfTracking();
      expect(localStorageMock['umami-opt-out']).toBe('true');
    });

    it('should remove umami instance when opting out', () => {
      optOutOfTracking();
      expect(windowSpy.umami).toBeUndefined();
    });

    it('should remove opt-out preference when opting back in', () => {
      optOutOfTracking();
      expect(localStorageMock['umami-opt-out']).toBe('true');

      optIntoTracking();
      expect(localStorageMock['umami-opt-out']).toBeUndefined();
    });

    it('should reload page when opting back in', () => {
      optIntoTracking();
      expect(windowSpy.location.reload).toHaveBeenCalled();
    });
  });

  describe('Event tracking', () => {
    describe('in production with opt-in', () => {
      beforeEach(() => {
        vi.stubEnv('DEV', false);
      });

      it('should track file upload start event', () => {
        analytics.fileUploadStart('abc123', 5.5);

        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.FILE_UPLOAD_START, {
          file_hash: 'abc123',
          file_size_mb: 5.5,
        });
      });

      it('should track file upload success event', () => {
        analytics.fileUploadSuccess('abc123', 1500, 2500, false);

        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.FILE_UPLOAD_SUCCESS, {
          file_hash: 'abc123',
          account_count: 1500,
          processing_time_ms: 2500,
          from_cache: false,
        });
      });

      it('should track file upload error with truncated message', () => {
        const longError = 'Error: '.repeat(50); // 350+ chars
        analytics.fileUploadError('abc123', longError);

        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.FILE_UPLOAD_ERROR, {
          file_hash: 'abc123',
          error_message: expect.stringContaining('Error:'),
        });

        const call = windowSpy.umami.track.mock.calls[0];
        expect(call[1].error_message.length).toBeLessThanOrEqual(200);
      });

      it('should track filter toggle with action', () => {
        analytics.filterToggle('notFollowingBack', 'enable', 3);

        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.FILTER_TOGGLE, {
          filter_name: 'notFollowingBack',
          filter_action: 'enable',
          active_filter_count: 3,
        });
      });

      it('should track filter clear all', () => {
        analytics.filterClearAll(5);

        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.FILTER_CLEAR_ALL, {
          previous_count: 5,
        });
      });

      it('should track search with query stats', () => {
        analytics.searchPerform(10, 25, 1000, true);

        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.SEARCH_PERFORM, {
          query_length: 10,
          result_count: 25,
          total_count: 1000,
          has_filters_active: true,
        });
      });

      it('should track account click', () => {
        analytics.accountClick(3);

        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.ACCOUNT_CLICK, {
          badge_count: 3,
        });
      });

      it('should track help modal open with source', () => {
        analytics.helpOpen('header');

        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.HELP_OPEN, {
          source: 'header',
        });
      });

      it('should track link clicks', () => {
        analytics.linkClick('github');

        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.LINK_CLICK, {
          link_type: 'github',
        });
      });

      it('should track hero CTA clicks', () => {
        analytics.heroCTAGuide();
        expect(windowSpy.umami.track).toHaveBeenCalledWith(
          AnalyticsEvents.HERO_CTA_GUIDE,
          undefined
        );

        analytics.heroCTASample();
        expect(windowSpy.umami.track).toHaveBeenCalledWith(
          AnalyticsEvents.HERO_CTA_SAMPLE,
          undefined
        );

        analytics.heroCTAUploadDirect();
        expect(windowSpy.umami.track).toHaveBeenCalledWith(
          AnalyticsEvents.HERO_CTA_UPLOAD_DIRECT,
          undefined
        );

        analytics.heroCTAContinue();
        expect(windowSpy.umami.track).toHaveBeenCalledWith(
          AnalyticsEvents.HERO_CTA_CONTINUE,
          undefined
        );
      });

      it('should track theme toggle', () => {
        analytics.themeToggle('dark');

        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.THEME_TOGGLE, {
          mode: 'dark',
        });
      });

      it('should track clear data action', () => {
        analytics.clearData();

        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.CLEAR_DATA, undefined);
      });

      it('should track sample data click', () => {
        analytics.sampleDataClick();

        expect(windowSpy.umami.track).toHaveBeenCalledWith(
          AnalyticsEvents.SAMPLE_DATA_CLICK,
          undefined
        );
      });

      it('should track wizard events', () => {
        analytics.wizardStepView(1, 'Opening Settings');
        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.WIZARD_STEP_VIEW, {
          step_id: 1,
          step_title: 'Opening Settings',
        });

        analytics.wizardNextClick(1);
        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.WIZARD_NEXT_CLICK, {
          from_step: 1,
        });

        analytics.wizardBackClick(2);
        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.WIZARD_BACK_CLICK, {
          from_step: 2,
        });

        analytics.wizardCancel();
        expect(windowSpy.umami.track).toHaveBeenCalledWith(
          AnalyticsEvents.WIZARD_CANCEL,
          undefined
        );

        analytics.wizardExternalLinkClick(3);
        expect(windowSpy.umami.track).toHaveBeenCalledWith(
          AnalyticsEvents.WIZARD_EXTERNAL_LINK_CLICK,
          { step_id: 3 }
        );
      });

      it('should track external profile click with privacy hash', () => {
        analytics.externalProfileClick('john_doe_123');

        expect(windowSpy.umami.track).toHaveBeenCalledWith(AnalyticsEvents.EXTERNAL_PROFILE_CLICK, {
          username_hash: 'jo***', // Privacy: only first 2 chars
        });
      });

      it('should round file size in upload start', () => {
        analytics.fileUploadStart('hash', 5.123456);

        const call = windowSpy.umami.track.mock.calls[0];
        expect(call[1].file_size_mb).toBe(5.12);
      });

      it('should round processing time in upload success', () => {
        analytics.fileUploadSuccess('hash', 1000, 1234.567, false);

        const call = windowSpy.umami.track.mock.calls[0];
        expect(call[1].processing_time_ms).toBe(1235);
      });
    });

    describe('in development mode', () => {
      beforeEach(() => {
        vi.stubEnv('DEV', true);
      });

      it('should not track events', () => {
        analytics.fileUploadStart('abc123', 5.5);
        analytics.filterToggle('mutuals', 'enable', 1);
        analytics.searchPerform(5, 10, 100, false);

        expect(windowSpy.umami.track).not.toHaveBeenCalled();
      });
    });

    describe('when opted out', () => {
      beforeEach(() => {
        vi.stubEnv('DEV', false);
        optOutOfTracking();
      });

      it('should not track events', () => {
        analytics.fileUploadStart('abc123', 5.5);
        analytics.filterToggle('mutuals', 'enable', 1);
        analytics.searchPerform(5, 10, 100, false);

        // umami was deleted during opt-out, so no calls
        expect(windowSpy.umami).toBeUndefined();
      });
    });

    describe('when umami not loaded', () => {
      beforeEach(() => {
        vi.stubEnv('DEV', false);
        delete windowSpy.umami;
      });

      it('should not throw error', () => {
        expect(() => {
          analytics.fileUploadStart('abc123', 5.5);
          analytics.filterToggle('mutuals', 'enable', 1);
        }).not.toThrow();
      });
    });

    describe('error handling', () => {
      beforeEach(() => {
        vi.stubEnv('DEV', false);
        windowSpy.umami.track = vi.fn(() => {
          throw new Error('Network error');
        });
      });

      it('should silently fail on tracking errors', () => {
        expect(() => {
          analytics.fileUploadStart('abc123', 5.5);
        }).not.toThrow();
      });
    });
  });

  describe('Event constants', () => {
    it('should have all expected event names', () => {
      expect(AnalyticsEvents.FILE_UPLOAD_START).toBe('file_upload_start');
      expect(AnalyticsEvents.FILE_UPLOAD_SUCCESS).toBe('file_upload_success');
      expect(AnalyticsEvents.FILE_UPLOAD_ERROR).toBe('file_upload_error');
      expect(AnalyticsEvents.FILTER_TOGGLE).toBe('filter_toggle');
      expect(AnalyticsEvents.FILTER_CLEAR_ALL).toBe('filter_clear_all');
      expect(AnalyticsEvents.SEARCH_PERFORM).toBe('search_perform');
      expect(AnalyticsEvents.ACCOUNT_CLICK).toBe('account_click');
      expect(AnalyticsEvents.HELP_OPEN).toBe('help_open');
      expect(AnalyticsEvents.LINK_CLICK).toBe('link_click');
      expect(AnalyticsEvents.HERO_CTA_GUIDE).toBe('hero_cta_guide');
      expect(AnalyticsEvents.HERO_CTA_SAMPLE).toBe('hero_cta_sample');
      expect(AnalyticsEvents.HERO_CTA_UPLOAD_DIRECT).toBe('hero_cta_upload_direct');
      expect(AnalyticsEvents.HERO_CTA_CONTINUE).toBe('hero_cta_continue');
      expect(AnalyticsEvents.THEME_TOGGLE).toBe('theme_toggle');
      expect(AnalyticsEvents.CLEAR_DATA).toBe('clear_data');
      expect(AnalyticsEvents.SAMPLE_DATA_CLICK).toBe('sample_data_click');
      expect(AnalyticsEvents.WIZARD_STEP_VIEW).toBe('wizard_step_view');
      expect(AnalyticsEvents.WIZARD_NEXT_CLICK).toBe('wizard_next_click');
      expect(AnalyticsEvents.WIZARD_BACK_CLICK).toBe('wizard_back_click');
      expect(AnalyticsEvents.WIZARD_CANCEL).toBe('wizard_cancel');
      expect(AnalyticsEvents.WIZARD_EXTERNAL_LINK_CLICK).toBe('wizard_external_link_click');
      expect(AnalyticsEvents.EXTERNAL_PROFILE_CLICK).toBe('external_profile_click');
    });
  });

  describe('SSR safety', () => {
    it('should handle window undefined in isTrackingOptedOut', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing SSR
      global.window = undefined;

      expect(isTrackingOptedOut()).toBe(false);

      global.window = originalWindow;
    });

    it('should handle window undefined in optOutOfTracking', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing SSR
      global.window = undefined;

      expect(() => optOutOfTracking()).not.toThrow();

      global.window = originalWindow;
    });

    it('should handle window undefined in optIntoTracking', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing SSR
      global.window = undefined;

      expect(() => optIntoTracking()).not.toThrow();

      global.window = originalWindow;
    });
  });
});
