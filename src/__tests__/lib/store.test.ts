import type { BadgeKey } from '@/core/types';
import { useAppStore } from '@/lib/store';
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
      });

      // Verify data is set
      expect(result.current.filters.size).toBe(2);
      expect(result.current.currentFileName).toBe('test.zip');

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
  });
});
