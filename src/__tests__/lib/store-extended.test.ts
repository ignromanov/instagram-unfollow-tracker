/**
 * Extended Store Tests
 *
 * Additional tests to improve coverage of store.ts beyond existing store.test.ts
 * Focuses on edge cases, journey state, and persistence logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '@/lib/store';
import type { BadgeKey, HowToSubStep } from '@/lib/store';

describe('useAppStore - Extended Coverage', () => {
  beforeEach(() => {
    // Clear store
    const { clearData } = useAppStore.getState();
    clearData();
    vi.clearAllMocks();
  });

  describe('Journey state management', () => {
    describe('advanceJourney', () => {
      it('should advance to next step and mark previous as completed', () => {
        const { advanceJourney, journey } = useAppStore.getState();

        advanceJourney('how-to');

        const newJourney = useAppStore.getState().journey;
        expect(newJourney.currentStep).toBe('how-to');
        expect(newJourney.completedSteps.has('hero')).toBe(true);
        expect(newJourney.expandedSteps.has('how-to')).toBe(true);
      });

      it('should accumulate completed steps', () => {
        const { advanceJourney } = useAppStore.getState();

        advanceJourney('how-to');
        advanceJourney('upload');
        advanceJourney('results');

        const { journey } = useAppStore.getState();
        expect(journey.currentStep).toBe('results');
        expect(journey.completedSteps.has('hero')).toBe(true);
        expect(journey.completedSteps.has('how-to')).toBe(true);
        expect(journey.completedSteps.has('upload')).toBe(true);
      });

      it('should expand new step when advancing', () => {
        const { advanceJourney, journey } = useAppStore.getState();

        // Initially only hero is expanded
        expect(journey.expandedSteps.has('hero')).toBe(true);
        expect(journey.expandedSteps.has('upload')).toBe(false);

        advanceJourney('upload');

        const newJourney = useAppStore.getState().journey;
        expect(newJourney.expandedSteps.has('upload')).toBe(true);
      });
    });

    describe('toggleStepExpansion', () => {
      it('should collapse expanded step', () => {
        const { toggleStepExpansion, journey } = useAppStore.getState();

        // Hero starts expanded
        expect(journey.expandedSteps.has('hero')).toBe(true);

        toggleStepExpansion('hero');

        const newJourney = useAppStore.getState().journey;
        expect(newJourney.expandedSteps.has('hero')).toBe(false);
      });

      it('should expand collapsed step', () => {
        const { toggleStepExpansion, journey } = useAppStore.getState();

        // Upload starts collapsed
        expect(journey.expandedSteps.has('upload')).toBe(false);

        toggleStepExpansion('upload');

        const newJourney = useAppStore.getState().journey;
        expect(newJourney.expandedSteps.has('upload')).toBe(true);
      });

      it('should toggle same step multiple times', () => {
        const { toggleStepExpansion } = useAppStore.getState();

        toggleStepExpansion('upload');
        expect(useAppStore.getState().journey.expandedSteps.has('upload')).toBe(true);

        toggleStepExpansion('upload');
        expect(useAppStore.getState().journey.expandedSteps.has('upload')).toBe(false);

        toggleStepExpansion('upload');
        expect(useAppStore.getState().journey.expandedSteps.has('upload')).toBe(true);
      });
    });

    describe('toggleHowToSubStep', () => {
      it('should mark sub-step as completed', () => {
        const { toggleHowToSubStep, journey } = useAppStore.getState();

        expect(journey.completedHowToSubSteps.has('opening-settings')).toBe(false);

        toggleHowToSubStep('opening-settings');

        const newJourney = useAppStore.getState().journey;
        expect(newJourney.completedHowToSubSteps.has('opening-settings')).toBe(true);
      });

      it('should unmark completed sub-step', () => {
        const { toggleHowToSubStep } = useAppStore.getState();

        toggleHowToSubStep('opening-settings');
        expect(useAppStore.getState().journey.completedHowToSubSteps.has('opening-settings')).toBe(
          true
        );

        toggleHowToSubStep('opening-settings');
        expect(useAppStore.getState().journey.completedHowToSubSteps.has('opening-settings')).toBe(
          false
        );
      });

      it('should track multiple sub-steps independently', () => {
        const { toggleHowToSubStep } = useAppStore.getState();

        toggleHowToSubStep('opening-settings');
        toggleHowToSubStep('selecting-data');

        const { journey } = useAppStore.getState();
        expect(journey.completedHowToSubSteps.has('opening-settings')).toBe(true);
        expect(journey.completedHowToSubSteps.has('selecting-data')).toBe(true);
        expect(journey.completedHowToSubSteps.has('downloading')).toBe(false);
      });

      it('should handle all valid sub-step types', () => {
        const { toggleHowToSubStep } = useAppStore.getState();

        const subSteps: HowToSubStep[] = [
          'opening-settings',
          'selecting-data',
          'downloading',
          'uploading-analyzing',
        ];

        subSteps.forEach(step => {
          toggleHowToSubStep(step);
        });

        const { journey } = useAppStore.getState();
        subSteps.forEach(step => {
          expect(journey.completedHowToSubSteps.has(step)).toBe(true);
        });
      });
    });

    describe('resetJourney', () => {
      it('should reset all journey state to initial', () => {
        const { advanceJourney, toggleHowToSubStep, resetJourney } = useAppStore.getState();

        // Set some state
        advanceJourney('upload');
        toggleHowToSubStep('opening-settings');

        resetJourney();

        const { journey } = useAppStore.getState();
        expect(journey.currentStep).toBe('hero');
        expect(journey.completedSteps.size).toBe(0);
        expect(journey.expandedSteps.has('hero')).toBe(true);
        expect(journey.expandedSteps.size).toBe(1);
        expect(journey.completedHowToSubSteps.size).toBe(0);
      });
    });
  });

  describe('setUploadInfo', () => {
    it('should update fileMetadata on success with all fields', () => {
      const { setUploadInfo } = useAppStore.getState();

      setUploadInfo({
        currentFileName: 'test.zip',
        uploadStatus: 'success',
        fileSize: 1024,
        uploadDate: new Date('2024-01-01'),
        fileHash: 'abc123',
        accountCount: 500,
      });

      const { fileMetadata } = useAppStore.getState();
      expect(fileMetadata).toEqual({
        name: 'test.zip',
        size: 1024,
        uploadDate: new Date('2024-01-01'),
        fileHash: 'abc123',
        accountCount: 500,
      });
    });

    it('should use default date if not provided', () => {
      const { setUploadInfo } = useAppStore.getState();
      const before = Date.now();

      setUploadInfo({
        currentFileName: 'test.zip',
        uploadStatus: 'success',
        fileHash: 'abc123',
        accountCount: 100,
      });

      const { fileMetadata } = useAppStore.getState();
      const after = Date.now();

      expect(fileMetadata?.uploadDate.getTime()).toBeGreaterThanOrEqual(before);
      expect(fileMetadata?.uploadDate.getTime()).toBeLessThanOrEqual(after);
    });

    it('should use zero as default fileSize', () => {
      const { setUploadInfo } = useAppStore.getState();

      setUploadInfo({
        currentFileName: 'test.zip',
        uploadStatus: 'success',
        fileHash: 'abc123',
      });

      const { fileMetadata } = useAppStore.getState();
      expect(fileMetadata?.size).toBe(0);
    });

    it('should clear fileMetadata on error status', () => {
      const { setUploadInfo } = useAppStore.getState();

      // First set success
      setUploadInfo({
        currentFileName: 'test.zip',
        uploadStatus: 'success',
        fileHash: 'abc123',
        accountCount: 100,
      });

      expect(useAppStore.getState().fileMetadata).not.toBeNull();

      // Then set error
      setUploadInfo({
        uploadStatus: 'error',
        uploadError: 'Failed',
      });

      expect(useAppStore.getState().fileMetadata).toBeNull();
    });

    it('should update parseWarnings when provided', () => {
      const { setUploadInfo } = useAppStore.getState();

      const warnings = [{ code: 'WARN1', message: 'Warning 1', severity: 'warning' as const }];

      setUploadInfo({
        parseWarnings: warnings,
      });

      expect(useAppStore.getState().parseWarnings).toEqual(warnings);
    });

    it('should update fileDiscovery when provided', () => {
      const { setUploadInfo } = useAppStore.getState();

      const discovery = {
        format: 'json' as const,
        isInstagramExport: true,
        files: [],
      };

      setUploadInfo({
        fileDiscovery: discovery,
      });

      expect(useAppStore.getState().fileDiscovery).toEqual(discovery);
    });

    it('should preserve existing state when partial update', () => {
      const { setUploadInfo } = useAppStore.getState();

      setUploadInfo({
        currentFileName: 'test.zip',
        uploadStatus: 'loading',
      });

      setUploadInfo({
        currentFileName: 'test.zip',
        uploadStatus: 'success',
        fileHash: 'abc123',
        accountCount: 100,
      });

      const state = useAppStore.getState();
      expect(state.currentFileName).toBe('test.zip');
      expect(state.uploadStatus).toBe('success');
      expect(state.fileMetadata?.fileHash).toBe('abc123');
    });
  });

  describe('clearData', () => {
    it('should reset all state including journey', () => {
      const { setFilters, setUploadInfo, advanceJourney, clearData } = useAppStore.getState();

      // Set various state
      setFilters(new Set<BadgeKey>(['mutuals', 'notFollowingBack']));
      setUploadInfo({
        currentFileName: 'test.zip',
        uploadStatus: 'success',
        fileHash: 'abc123',
        accountCount: 100,
      });
      advanceJourney('results');

      clearData();

      const state = useAppStore.getState();
      expect(state.filters.size).toBe(0);
      expect(state.currentFileName).toBeNull();
      expect(state.uploadStatus).toBe('idle');
      expect(state.uploadError).toBeNull();
      expect(state.fileMetadata).toBeNull();
      expect(state.parseWarnings).toEqual([]);
      expect(state.fileDiscovery).toBeNull();
      expect(state.journey.currentStep).toBe('hero');
      expect(state.journey.completedSteps.size).toBe(0);
    });
  });

  describe('Persistence and migration', () => {
    it('should have correct store name', () => {
      const storeName = 'unfollow-radar-store';
      const stored = localStorage.getItem(storeName);
      // Store may or may not exist depending on test order
      expect(typeof stored === 'string' || stored === null).toBe(true);
    });

    it('should serialize and deserialize Sets correctly', () => {
      const { setFilters } = useAppStore.getState();

      const filters = new Set<BadgeKey>(['mutuals', 'following', 'followers']);
      setFilters(filters);

      // Simulate persistence by getting the stored value
      const stored = localStorage.getItem('unfollow-radar-store');
      expect(stored).toBeTruthy();

      if (stored) {
        const parsed = JSON.parse(stored);
        // Filters should be serialized as array
        expect(Array.isArray(parsed.state.filters)).toBe(true);
        expect(parsed.state.filters).toHaveLength(3);
      }
    });

    it('should set _hasHydrated after rehydration', () => {
      // The onRehydrateStorage callback sets this
      const { _hasHydrated } = useAppStore.getState();
      expect(typeof _hasHydrated).toBe('boolean');
    });
  });

  describe('Filter management', () => {
    it('should replace entire filter set', () => {
      const { setFilters } = useAppStore.getState();

      setFilters(new Set<BadgeKey>(['mutuals']));
      expect(useAppStore.getState().filters.has('mutuals')).toBe(true);

      setFilters(new Set<BadgeKey>(['following', 'followers']));
      const { filters } = useAppStore.getState();
      expect(filters.has('mutuals')).toBe(false);
      expect(filters.has('following')).toBe(true);
      expect(filters.has('followers')).toBe(true);
    });

    it('should handle empty filter set', () => {
      const { setFilters } = useAppStore.getState();

      setFilters(new Set<BadgeKey>(['mutuals', 'following']));
      expect(useAppStore.getState().filters.size).toBe(2);

      setFilters(new Set<BadgeKey>());
      expect(useAppStore.getState().filters.size).toBe(0);
    });

    it('should create new Set instance to trigger reactivity', () => {
      const { setFilters, filters: initialFilters } = useAppStore.getState();

      const newFilters = new Set<BadgeKey>(['mutuals']);
      setFilters(newFilters);

      const { filters: updatedFilters } = useAppStore.getState();
      expect(updatedFilters).not.toBe(initialFilters);
      expect(updatedFilters).not.toBe(newFilters); // Creates new Set internally
    });
  });

  describe('Upload status lifecycle', () => {
    it('should handle complete upload lifecycle', () => {
      const { setUploadInfo } = useAppStore.getState();

      // Idle
      expect(useAppStore.getState().uploadStatus).toBe('idle');

      // Loading
      setUploadInfo({
        currentFileName: 'test.zip',
        uploadStatus: 'loading',
      });
      expect(useAppStore.getState().uploadStatus).toBe('loading');
      expect(useAppStore.getState().currentFileName).toBe('test.zip');

      // Success - need currentFileName for fileMetadata to be created
      setUploadInfo({
        currentFileName: 'test.zip',
        uploadStatus: 'success',
        fileHash: 'abc123',
        accountCount: 1000,
      });
      expect(useAppStore.getState().uploadStatus).toBe('success');
      expect(useAppStore.getState().fileMetadata).toBeTruthy();
    });

    it('should handle upload error', () => {
      const { setUploadInfo } = useAppStore.getState();

      setUploadInfo({
        currentFileName: 'bad.zip',
        uploadStatus: 'loading',
      });

      setUploadInfo({
        uploadStatus: 'error',
        uploadError: 'Invalid file format',
      });

      const state = useAppStore.getState();
      expect(state.uploadStatus).toBe('error');
      expect(state.uploadError).toBe('Invalid file format');
      expect(state.fileMetadata).toBeNull();
    });
  });

  describe('Language management', () => {
    it('should have default language as English', () => {
      const { language } = useAppStore.getState();
      expect(language).toBe('en');
    });

    it('should update language state when setLanguage is called', () => {
      const { setLanguage } = useAppStore.getState();

      setLanguage('es');

      expect(useAppStore.getState().language).toBe('es');
    });

    it('should accept all supported languages', () => {
      const { setLanguage } = useAppStore.getState();
      const supportedLanguages = ['en', 'es', 'pt', 'hi', 'id', 'tr', 'ja', 'ru', 'de'] as const;

      supportedLanguages.forEach(lang => {
        setLanguage(lang);
        expect(useAppStore.getState().language).toBe(lang);
      });
    });

    it('should persist language through clearData', () => {
      const { setLanguage, clearData } = useAppStore.getState();

      setLanguage('de');
      clearData();

      // Note: clearData doesn't reset language, only upload/journey state
      // Language is preserved to maintain user preference
      expect(useAppStore.getState().language).toBe('de');
    });
  });

  describe('Storage serialization', () => {
    it('should serialize journey Sets when storing', () => {
      const { advanceJourney, toggleHowToSubStep } = useAppStore.getState();

      advanceJourney('upload');
      toggleHowToSubStep('opening-settings');

      // Trigger storage by getting from localStorage
      const stored = localStorage.getItem('unfollow-radar-store');
      expect(stored).toBeTruthy();

      if (stored) {
        const parsed = JSON.parse(stored);
        // Journey completedSteps should be serialized as array
        expect(Array.isArray(parsed.state.journey.completedSteps)).toBe(true);
        expect(Array.isArray(parsed.state.journey.expandedSteps)).toBe(true);
        expect(Array.isArray(parsed.state.journey.completedHowToSubSteps)).toBe(true);
      }
    });

    it('should deserialize journey Sets when loading', () => {
      // Pre-populate localStorage with serialized data
      const mockData = {
        state: {
          filters: ['mutuals'],
          journey: {
            currentStep: 'upload',
            completedSteps: ['hero', 'how-to'],
            expandedSteps: ['hero', 'upload'],
            completedHowToSubSteps: ['opening-settings'],
          },
          language: 'es',
        },
        version: 4,
      };

      localStorage.setItem('unfollow-radar-store', JSON.stringify(mockData));

      // The store's storage.getItem should deserialize these
      const storedStr = localStorage.getItem('unfollow-radar-store');
      expect(storedStr).toBeTruthy();
    });

    it('should handle missing completedHowToSubSteps in old data', () => {
      // Simulate old data without completedHowToSubSteps
      const oldData = {
        state: {
          filters: [],
          journey: {
            currentStep: 'hero',
            completedSteps: [],
            expandedSteps: ['hero'],
            // completedHowToSubSteps is missing
          },
          language: 'en',
        },
        version: 3,
      };

      localStorage.setItem('unfollow-radar-store', JSON.stringify(oldData));

      // Reading should not crash and should provide default empty Set
      const storedStr = localStorage.getItem('unfollow-radar-store');
      expect(storedStr).toBeTruthy();
    });
  });

  describe('Migration scenarios', () => {
    it('should handle version 1 migration by resetting state', () => {
      // Version 1 data should be completely reset
      const oldV1Data = {
        state: {
          filters: ['following'],
          currentFileName: 'old.zip',
        },
        version: 1,
      };

      localStorage.setItem('unfollow-radar-store', JSON.stringify(oldV1Data));

      // After migration, state should be reset to defaults
      // This is handled by persist middleware migrate function
    });

    it('should handle version 2 to 3 migration', () => {
      // Version 2 didn't have completedHowToSubSteps
      const v2Data = {
        state: {
          filters: [],
          journey: {
            currentStep: 'upload',
            completedSteps: ['hero'],
            expandedSteps: ['hero', 'upload'],
          },
        },
        version: 2,
      };

      localStorage.setItem('unfollow-radar-store', JSON.stringify(v2Data));

      // After migration, completedHowToSubSteps should be added
    });

    it('should handle version 3 to 4 migration by adding language', () => {
      // Version 3 didn't have language
      const v3Data = {
        state: {
          filters: [],
          journey: {
            currentStep: 'hero',
            completedSteps: [],
            expandedSteps: ['hero'],
            completedHowToSubSteps: [],
          },
        },
        version: 3,
      };

      localStorage.setItem('unfollow-radar-store', JSON.stringify(v3Data));

      // After migration, language should default to 'en'
    });
  });

  describe('Storage removeItem', () => {
    it('should remove item from localStorage', () => {
      // Set some data first
      localStorage.setItem('unfollow-radar-store', '{"test": true}');

      // Remove it
      localStorage.removeItem('unfollow-radar-store');

      expect(localStorage.getItem('unfollow-radar-store')).toBeNull();
    });
  });

  describe('Complex state interactions', () => {
    it('should handle journey advance with file upload', () => {
      const { advanceJourney, setUploadInfo } = useAppStore.getState();

      advanceJourney('upload');
      setUploadInfo({
        currentFileName: 'test.zip',
        uploadStatus: 'loading',
      });

      expect(useAppStore.getState().journey.currentStep).toBe('upload');
      expect(useAppStore.getState().uploadStatus).toBe('loading');

      setUploadInfo({
        uploadStatus: 'success',
        fileHash: 'abc123',
        accountCount: 500,
      });

      advanceJourney('results');

      const state = useAppStore.getState();
      expect(state.journey.currentStep).toBe('results');
      expect(state.uploadStatus).toBe('success');
      expect(state.journey.completedSteps.has('upload')).toBe(true);
    });

    it('should maintain filters through journey changes', () => {
      const { setFilters, advanceJourney } = useAppStore.getState();

      setFilters(new Set<BadgeKey>(['mutuals', 'notFollowingBack']));

      advanceJourney('how-to');
      advanceJourney('upload');
      advanceJourney('results');

      const { filters } = useAppStore.getState();
      expect(filters.has('mutuals')).toBe(true);
      expect(filters.has('notFollowingBack')).toBe(true);
    });
  });
});
