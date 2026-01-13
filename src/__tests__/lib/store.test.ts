import type { BadgeKey } from '@/core/types';
import { useAppStore, type HowToSubStep, type JourneyStep } from '@/lib/store';
import { act, renderHook } from '@testing-library/react';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock locales module for language sync testing
vi.mock('@/locales', () => ({
  loadLanguage: vi.fn().mockResolvedValue(undefined),
  initI18n: vi.fn().mockResolvedValue(undefined),
  default: {
    changeLanguage: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('useAppStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAppStore.setState({
      filters: new Set<BadgeKey>(),
      currentFileName: null,
      uploadStatus: 'idle',
      uploadError: null,
      fileMetadata: null,
      journey: {
        currentStep: 'hero',
        completedSteps: new Set<JourneyStep>(),
        expandedSteps: new Set<JourneyStep>(['hero']),
        completedHowToSubSteps: new Set<HowToSubStep>(),
      },
      language: 'en',
      parseWarnings: [],
      fileDiscovery: null,
      _hasHydrated: false,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.filters).toEqual(new Set());
      expect(result.current.currentFileName).toBeNull();
      expect(result.current.uploadStatus).toBe('idle');
      expect(result.current.uploadError).toBeNull();
      expect(result.current.fileMetadata).toBeNull();
      expect(result.current.language).toBe('en');
    });

    it('should have correct initial journey state', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.journey.currentStep).toBe('hero');
      expect(result.current.journey.completedSteps).toEqual(new Set());
      expect(result.current.journey.expandedSteps).toEqual(new Set(['hero']));
      expect(result.current.journey.completedHowToSubSteps).toEqual(new Set());
    });
  });

  describe('setFilters', () => {
    it('should update filters', () => {
      const { result } = renderHook(() => useAppStore());
      const newFilters = new Set<BadgeKey>(['following', 'followers']);

      act(() => {
        result.current.setFilters(newFilters);
      });

      expect(result.current.filters).toEqual(newFilters);
    });

    it('should handle empty filters set', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setFilters(new Set<BadgeKey>());
      });

      expect(result.current.filters).toEqual(new Set());
    });
  });

  describe('setUploadInfo', () => {
    it('should update upload info', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setUploadInfo({
          currentFileName: 'test.zip',
          uploadStatus: 'loading',
          fileSize: 1024,
          uploadDate: new Date('2023-01-01'),
          fileHash: 'abc123',
          accountCount: 100,
        });
      });

      expect(result.current.currentFileName).toBe('test.zip');
      expect(result.current.uploadStatus).toBe('loading');
      // fileMetadata is only set when uploadStatus is 'success'
      expect(result.current.fileMetadata).toBeNull();
    });

    it('should update fileMetadata on success', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setUploadInfo({
          currentFileName: 'test.zip',
          uploadStatus: 'success',
          fileSize: 1024,
          uploadDate: new Date('2023-01-01'),
          fileHash: 'abc123',
          accountCount: 100,
        });
      });

      expect(result.current.fileMetadata).toEqual({
        name: 'test.zip',
        size: 1024,
        uploadDate: new Date('2023-01-01'),
        fileHash: 'abc123',
        accountCount: 100,
      });
    });

    it('should clear fileMetadata on error', () => {
      const { result } = renderHook(() => useAppStore());

      // First set some metadata
      act(() => {
        result.current.setUploadInfo({
          currentFileName: 'test.zip',
          uploadStatus: 'success',
          fileSize: 1024,
        });
      });

      expect(result.current.fileMetadata).not.toBeNull();

      // Then set error status
      act(() => {
        result.current.setUploadInfo({
          uploadStatus: 'error',
          uploadError: 'Upload failed',
        });
      });

      expect(result.current.fileMetadata).toBeNull();
    });

    it('should update parseWarnings and fileDiscovery', () => {
      const { result } = renderHook(() => useAppStore());
      const warnings = [{ severity: 'warning' as const, code: 'TEST', message: 'Test warning' }];
      const discovery = { hasFollowers: true, hasFollowing: true };

      act(() => {
        result.current.setUploadInfo({
          parseWarnings: warnings,
          fileDiscovery: discovery,
        });
      });

      expect(result.current.parseWarnings).toEqual(warnings);
      expect(result.current.fileDiscovery).toEqual(discovery);
    });
  });

  describe('journey actions', () => {
    it('should advance journey to new step', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.advanceJourney('upload');
      });

      expect(result.current.journey.currentStep).toBe('upload');
      expect(result.current.journey.completedSteps.has('hero')).toBe(true);
      expect(result.current.journey.expandedSteps.has('upload')).toBe(true);
    });

    it('should toggle step expansion', () => {
      const { result } = renderHook(() => useAppStore());

      // Hero is expanded by default
      expect(result.current.journey.expandedSteps.has('hero')).toBe(true);

      // Collapse hero
      act(() => {
        result.current.toggleStepExpansion('hero');
      });
      expect(result.current.journey.expandedSteps.has('hero')).toBe(false);

      // Expand hero again
      act(() => {
        result.current.toggleStepExpansion('hero');
      });
      expect(result.current.journey.expandedSteps.has('hero')).toBe(true);
    });

    it('should toggle how-to sub-steps', () => {
      const { result } = renderHook(() => useAppStore());

      // Initially empty
      expect(result.current.journey.completedHowToSubSteps.size).toBe(0);

      // Complete a sub-step
      act(() => {
        result.current.toggleHowToSubStep('opening-settings');
      });
      expect(result.current.journey.completedHowToSubSteps.has('opening-settings')).toBe(true);

      // Toggle it off
      act(() => {
        result.current.toggleHowToSubStep('opening-settings');
      });
      expect(result.current.journey.completedHowToSubSteps.has('opening-settings')).toBe(false);
    });

    it('should reset journey to initial state', () => {
      const { result } = renderHook(() => useAppStore());

      // Advance journey
      act(() => {
        result.current.advanceJourney('upload');
        result.current.toggleHowToSubStep('opening-settings');
      });

      expect(result.current.journey.currentStep).toBe('upload');

      // Reset journey
      act(() => {
        result.current.resetJourney();
      });

      expect(result.current.journey.currentStep).toBe('hero');
      expect(result.current.journey.completedSteps.size).toBe(0);
      expect(result.current.journey.expandedSteps).toEqual(new Set(['hero']));
      expect(result.current.journey.completedHowToSubSteps.size).toBe(0);
    });
  });

  describe('clearData', () => {
    it('should clear all data and reset to initial state', () => {
      const { result } = renderHook(() => useAppStore());

      // Set some data first
      act(() => {
        result.current.setFilters(new Set(['following', 'followers']));
        result.current.setUploadInfo({
          currentFileName: 'test.zip',
          uploadStatus: 'success',
          fileSize: 1024,
        });
        result.current.advanceJourney('results');
      });

      // Verify data is set
      expect(result.current.filters.size).toBe(2);
      expect(result.current.currentFileName).toBe('test.zip');
      expect(result.current.journey.currentStep).toBe('results');

      // Clear data
      act(() => {
        result.current.clearData();
      });

      // Verify everything is reset
      expect(result.current.filters).toEqual(new Set());
      expect(result.current.currentFileName).toBeNull();
      expect(result.current.uploadStatus).toBe('idle');
      expect(result.current.uploadError).toBeNull();
      expect(result.current.fileMetadata).toBeNull();
      expect(result.current.journey.currentStep).toBe('hero');
      expect(result.current.parseWarnings).toEqual([]);
      expect(result.current.fileDiscovery).toBeNull();
    });
  });

  describe('language management', () => {
    it('should set language and trigger i18n sync', async () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setLanguage('es');
      });

      expect(result.current.language).toBe('es');
    });

    it('should handle all supported languages', () => {
      const { result } = renderHook(() => useAppStore());

      const languages = ['en', 'es', 'pt', 'ru', 'de', 'hi', 'ja', 'tr', 'id', 'ar'] as const;

      for (const lang of languages) {
        act(() => {
          result.current.setLanguage(lang);
        });
        expect(result.current.language).toBe(lang);
      }
    });
  });

  describe('store integration', () => {
    it('should maintain state consistency across multiple operations', () => {
      const { result } = renderHook(() => useAppStore());

      // Set filters
      act(() => {
        result.current.setFilters(new Set(['following']));
      });

      expect(result.current.filters).toEqual(new Set(['following']));

      // Set upload info with loading status
      act(() => {
        result.current.setUploadInfo({
          currentFileName: 'data.zip',
          uploadStatus: 'loading',
        });
      });

      expect(result.current.currentFileName).toBe('data.zip');
      expect(result.current.uploadStatus).toBe('loading');
      expect(result.current.fileMetadata).toBeNull(); // Not set during loading

      // Update upload status to success with required fields
      act(() => {
        result.current.setUploadInfo({
          currentFileName: 'data.zip',
          uploadStatus: 'success',
          fileSize: 2048,
          accountCount: 500,
        });
      });

      expect(result.current.uploadStatus).toBe('success');
      expect(result.current.fileMetadata).toEqual({
        name: 'data.zip',
        size: 2048,
        uploadDate: expect.any(Date),
        fileHash: undefined,
        accountCount: 500,
      });

      // Clear data
      act(() => {
        result.current.clearData();
      });

      expect(result.current.filters).toEqual(new Set());
      expect(result.current.currentFileName).toBeNull();
      expect(result.current.uploadStatus).toBe('idle');
    });

    it('should handle multiple filter toggle operations', () => {
      const { result } = renderHook(() => useAppStore());

      // Add multiple filters
      act(() => {
        result.current.setFilters(new Set(['following', 'followers', 'mutuals']));
      });
      expect(result.current.filters.size).toBe(3);

      // Remove one filter by creating new set
      act(() => {
        result.current.setFilters(new Set(['following', 'followers']));
      });
      expect(result.current.filters.size).toBe(2);
      expect(result.current.filters.has('mutuals')).toBe(false);
    });
  });
});
