/**
 * useSampleData Hook Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSampleData } from '@/hooks/useSampleData';
import * as sampleDataModule from '@/lib/sample-data';

// Mock store actions
const mockSetUploadInfo = vi.fn();
const mockSetFilters = vi.fn();
const mockAdvanceJourney = vi.fn();

// Mock dependencies
vi.mock('@/lib/sample-data', () => ({
  generateAndStoreSampleData: vi.fn(),
  clearSampleData: vi.fn(),
}));

vi.mock('@/lib/analytics', () => ({
  analytics: {
    fileUploadStart: vi.fn(),
    fileUploadSuccess: vi.fn(),
    fileUploadError: vi.fn(),
  },
}));

vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn(selector => {
    const state = {
      setUploadInfo: mockSetUploadInfo,
      setFilters: mockSetFilters,
      advanceJourney: mockAdvanceJourney,
    };
    return selector(state);
  }),
}));

describe('useSampleData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleLoadSample', () => {
    it('should generate sample data and update store', async () => {
      // Mock successful generation
      vi.mocked(sampleDataModule.generateAndStoreSampleData).mockResolvedValue({
        fileHash: 'sample-demo-data-v1',
        accountCount: 1000,
      });

      const { result } = renderHook(() => useSampleData());

      expect(result.current.isGenerating).toBe(false);

      // Load sample data
      await act(async () => {
        await result.current.handleLoadSample();
      });

      // Should have called setUploadInfo with loading state
      expect(mockSetUploadInfo).toHaveBeenCalledWith({
        currentFileName: 'Sample Data (Demo)',
        uploadStatus: 'loading',
        uploadError: null,
      });

      // Should set default filters
      expect(mockSetFilters).toHaveBeenCalledWith(
        new Set(['unfollowed', 'notFollowingBack', 'mutuals'])
      );

      // Should have called setUploadInfo with success state
      expect(mockSetUploadInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          currentFileName: 'Sample Data (Demo)',
          uploadStatus: 'success',
          accountCount: 1000,
        })
      );

      // Should advance to results
      expect(mockAdvanceJourney).toHaveBeenCalledWith('results');

      expect(result.current.isGenerating).toBe(false);
    });

    it('should handle errors during generation', async () => {
      // Mock error
      const error = new Error('Generation failed');
      vi.mocked(sampleDataModule.generateAndStoreSampleData).mockRejectedValue(error);

      const { result } = renderHook(() => useSampleData());

      // Load sample data
      await act(async () => {
        try {
          await result.current.handleLoadSample();
        } catch (err) {
          expect(err).toBe(error);
        }
      });

      // Should have called setUploadInfo with error state
      expect(mockSetUploadInfo).toHaveBeenCalledWith({
        currentFileName: 'Sample Data (Demo)',
        uploadStatus: 'error',
        uploadError: 'Generation failed',
      });

      expect(result.current.isGenerating).toBe(false);
    });

    it('should set isGenerating state during generation', async () => {
      // Mock delayed generation
      let resolveGeneration: (value: any) => void;
      const generationPromise = new Promise(resolve => {
        resolveGeneration = resolve;
      });

      vi.mocked(sampleDataModule.generateAndStoreSampleData).mockReturnValue(
        generationPromise as any
      );

      const { result } = renderHook(() => useSampleData());

      expect(result.current.isGenerating).toBe(false);

      // Start loading
      act(() => {
        result.current.handleLoadSample();
      });

      // Should be generating
      await waitFor(() => {
        expect(result.current.isGenerating).toBe(true);
      });

      // Complete generation
      await act(async () => {
        resolveGeneration!({ fileHash: 'sample-demo-data-v1', accountCount: 1000 });
        await generationPromise;
      });

      // Should be done
      await waitFor(() => {
        expect(result.current.isGenerating).toBe(false);
      });
    });
  });

  describe('handleClearSample', () => {
    it('should clear sample data', async () => {
      const { result } = renderHook(() => useSampleData());

      await act(async () => {
        await result.current.handleClearSample();
      });

      expect(sampleDataModule.clearSampleData).toHaveBeenCalled();
    });

    it('should handle errors silently', async () => {
      // Mock error
      const error = new Error('Clear failed');
      vi.mocked(sampleDataModule.clearSampleData).mockRejectedValue(error);

      const { result } = renderHook(() => useSampleData());

      // Should not throw
      await act(async () => {
        await result.current.handleClearSample();
      });

      expect(sampleDataModule.clearSampleData).toHaveBeenCalled();
    });
  });
});
