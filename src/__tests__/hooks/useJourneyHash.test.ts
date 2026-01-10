import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { navigateToSubStep, useJourneyHash } from '@/hooks/useJourneyHash';
import { useAppStore } from '@/lib/store';

// Mock the store
vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn(),
}));

const mockUseAppStore = vi.mocked(useAppStore);

describe('useJourneyHash', () => {
  let mockAdvanceJourney: ReturnType<typeof vi.fn>;
  let mockScrollIntoView: ReturnType<typeof vi.fn>;
  let originalLocation: Location;
  let originalHistory: History;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockAdvanceJourney = vi.fn();
    mockScrollIntoView = vi.fn();

    // Store original globals
    originalLocation = window.location;
    originalHistory = window.history;

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        hash: '',
        pathname: '/',
        search: '',
      },
      writable: true,
    });

    // Mock window.history
    Object.defineProperty(window, 'history', {
      value: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
      },
      writable: true,
    });

    // Mock document.getElementById for scroll
    vi.spyOn(document, 'getElementById').mockImplementation(
      () =>
        ({
          scrollIntoView: mockScrollIntoView,
        }) as unknown as HTMLElement
    );

    // Default mock implementation
    mockUseAppStore.mockImplementation((selector: (state: any) => any) => {
      const state = {
        journey: { currentStep: 'hero' },
        advanceJourney: mockAdvanceJourney,
        fileMetadata: null,
        _hasHydrated: true,
      };
      return selector(state);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    // Restore globals
    Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    Object.defineProperty(window, 'history', { value: originalHistory, writable: true });
  });

  describe('initial state', () => {
    it('should return journey state from store', () => {
      renderHook(() => useJourneyHash());

      // Verify store was called with correct selectors
      expect(mockUseAppStore).toHaveBeenCalled();
    });

    it('should not navigate when hash is empty and already on hero', () => {
      window.location.hash = '';

      renderHook(() => useJourneyHash());

      expect(mockAdvanceJourney).not.toHaveBeenCalled();
    });

    it('should navigate to hash on mount if hash is present', () => {
      window.location.hash = '#upload';

      renderHook(() => useJourneyHash());

      expect(mockAdvanceJourney).toHaveBeenCalledWith('upload');
    });
  });

  describe('hash changes', () => {
    it('should handle valid journey step hashes', () => {
      window.location.hash = '#how-to';

      renderHook(() => useJourneyHash());

      expect(mockAdvanceJourney).toHaveBeenCalledWith('how-to');
    });

    it('should handle how-to sub-step hashes', () => {
      window.location.hash = '#opening-settings';

      renderHook(() => useJourneyHash());

      // Should navigate to how-to section for sub-step
      expect(mockAdvanceJourney).toHaveBeenCalledWith('how-to');
    });

    it('should ignore invalid hashes', () => {
      window.location.hash = '#invalid-step';

      renderHook(() => useJourneyHash());

      expect(mockAdvanceJourney).not.toHaveBeenCalled();
    });

    it('should redirect results to upload when no data', () => {
      window.location.hash = '#results';

      renderHook(() => useJourneyHash());

      expect(mockAdvanceJourney).toHaveBeenCalledWith('upload');
      expect(window.history.pushState).toHaveBeenCalledWith(null, '', '#upload');
    });

    it('should allow results when data is present', () => {
      mockUseAppStore.mockImplementation((selector: (state: any) => any) => {
        const state = {
          journey: { currentStep: 'hero' },
          advanceJourney: mockAdvanceJourney,
          fileMetadata: { accountCount: 100 },
          _hasHydrated: true,
        };
        return selector(state);
      });

      window.location.hash = '#results';

      renderHook(() => useJourneyHash());

      expect(mockAdvanceJourney).toHaveBeenCalledWith('results');
    });
  });

  describe('hash updates', () => {
    it('should remove hash for hero step (clean URL)', () => {
      window.location.hash = '#something';

      mockUseAppStore.mockImplementation((selector: (state: any) => any) => {
        const state = {
          journey: { currentStep: 'hero' },
          advanceJourney: mockAdvanceJourney,
          fileMetadata: null,
          _hasHydrated: true,
        };
        return selector(state);
      });

      renderHook(() => useJourneyHash());

      expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/');
    });

    it('should set hash for non-hero steps', () => {
      mockUseAppStore.mockImplementation((selector: (state: any) => any) => {
        const state = {
          journey: { currentStep: 'upload' },
          advanceJourney: mockAdvanceJourney,
          fileMetadata: null,
          _hasHydrated: true,
        };
        return selector(state);
      });

      renderHook(() => useJourneyHash());

      expect(window.history.pushState).toHaveBeenCalledWith(null, '', '#upload');
    });

    it('should scroll to section when step changes', () => {
      const { rerender } = renderHook(() => useJourneyHash());

      // Change step
      mockUseAppStore.mockImplementation((selector: (state: any) => any) => {
        const state = {
          journey: { currentStep: 'upload' },
          advanceJourney: mockAdvanceJourney,
          fileMetadata: null,
          _hasHydrated: true,
        };
        return selector(state);
      });

      rerender();

      // Fast-forward setTimeout for scroll
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });
  });

  describe('browser navigation', () => {
    it('should handle popstate event (back/forward)', () => {
      renderHook(() => useJourneyHash());

      // Simulate browser back navigation
      window.location.hash = '#how-to';
      act(() => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });

      expect(mockAdvanceJourney).toHaveBeenCalledWith('how-to');
    });

    it('should cleanup popstate listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useJourneyHash());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
    });
  });

  describe('hydration', () => {
    it('should not navigate before hydration', () => {
      mockUseAppStore.mockImplementation((selector: (state: any) => any) => {
        const state = {
          journey: { currentStep: 'hero' },
          advanceJourney: mockAdvanceJourney,
          fileMetadata: null,
          _hasHydrated: false, // Not hydrated yet
        };
        return selector(state);
      });

      window.location.hash = '#upload';

      renderHook(() => useJourneyHash());

      expect(mockAdvanceJourney).not.toHaveBeenCalled();
    });

    it('should navigate after hydration completes', () => {
      window.location.hash = '#upload';

      // Start with not hydrated
      mockUseAppStore.mockImplementation((selector: (state: any) => any) => {
        const state = {
          journey: { currentStep: 'hero' },
          advanceJourney: mockAdvanceJourney,
          fileMetadata: null,
          _hasHydrated: false,
        };
        return selector(state);
      });

      const { rerender } = renderHook(() => useJourneyHash());

      expect(mockAdvanceJourney).not.toHaveBeenCalled();

      // Now hydrate
      mockUseAppStore.mockImplementation((selector: (state: any) => any) => {
        const state = {
          journey: { currentStep: 'hero' },
          advanceJourney: mockAdvanceJourney,
          fileMetadata: null,
          _hasHydrated: true,
        };
        return selector(state);
      });

      rerender();

      expect(mockAdvanceJourney).toHaveBeenCalledWith('upload');
    });
  });
});

describe('navigateToSubStep', () => {
  let mockScrollIntoView: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockScrollIntoView = vi.fn();

    // Mock window.history
    Object.defineProperty(window, 'history', {
      value: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
      },
      writable: true,
    });

    // Mock document.getElementById
    vi.spyOn(document, 'getElementById').mockImplementation(
      () =>
        ({
          scrollIntoView: mockScrollIntoView,
        }) as unknown as HTMLElement
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should set hash for sub-step', () => {
    navigateToSubStep('opening-settings');

    expect(window.history.pushState).toHaveBeenCalledWith(null, '', '#opening-settings');
  });

  it('should scroll to sub-step section', () => {
    navigateToSubStep('selecting-data');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(document.getElementById).toHaveBeenCalledWith('selecting-data');
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('should handle all valid sub-steps', () => {
    const subSteps = [
      'opening-settings',
      'selecting-data',
      'downloading',
      'uploading-analyzing',
    ] as const;

    for (const subStep of subSteps) {
      navigateToSubStep(subStep);
      expect(window.history.pushState).toHaveBeenCalledWith(null, '', `#${subStep}`);
    }
  });
});
