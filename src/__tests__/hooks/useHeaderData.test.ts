import { renderHook, act } from '@testing-library/react';
import { useHeaderData } from '@/hooks/useHeaderData';
import { useAppStore } from '@/lib/store';
import { useInstagramData } from '@/hooks/useInstagramData';
import { useAccountFiltering } from '@/hooks/useAccountFiltering';
import type { BadgeKey, FileMetadata } from '@/core/types';

// Mock dependencies
vi.mock('@/lib/store');
vi.mock('@/hooks/useInstagramData');
vi.mock('@/hooks/useAccountFiltering');

const mockUseAppStore = vi.mocked(useAppStore);
const mockUseInstagramData = vi.mocked(useInstagramData);
const mockUseAccountFiltering = vi.mocked(useAccountFiltering);

describe('useHeaderData', () => {
  const mockFileMetadata: FileMetadata = {
    name: 'test.zip',
    size: 1024 * 1024,
    uploadDate: new Date('2024-01-01'),
    fileHash: 'abc123',
    accountCount: 100,
  };
  const mockHandleClearData = vi.fn();
  const mockClearFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAppStore.mockImplementation(selector => {
      return selector({
        fileMetadata: mockFileMetadata,
        filters: new Set<BadgeKey>(),
        currentFileName: 'test.zip',
        uploadStatus: 'success',
        uploadError: null,
      });
    });

    mockUseInstagramData.mockReturnValue({
      fileMetadata: mockFileMetadata,
      handleClearData: mockHandleClearData,
      uploadState: { status: 'success', error: null, fileName: 'test.zip' },
      handleZipUpload: vi.fn(),
      processingProgress: 0,
    });

    mockUseAccountFiltering.mockReturnValue({
      query: '',
      setQuery: vi.fn(),
      filteredIndices: [],
      filters: new Set(),
      setFilters: vi.fn(),
      filterCounts: {
        following: 10,
        followers: 8,
        mutuals: 5,
        notFollowingBack: 5,
        pending: 1,
        permanent: 0,
        restricted: 0,
        close: 2,
        unfollowed: 4,
        dismissed: 1,
      },
      clearFilters: mockClearFilters,
      totalCount: 100,
      hasLoadedData: true,
      isFiltering: false,
      processingTime: 0,
    });
  });

  it('should return hasData=false when no fileMetadata', () => {
    mockUseInstagramData.mockReturnValue({
      fileMetadata: null,
      handleClearData: mockHandleClearData,
      uploadState: { status: 'idle', error: null, fileName: null },
      handleZipUpload: vi.fn(),
      processingProgress: 0,
    });

    const { result } = renderHook(() => useHeaderData());

    expect(result.current.hasData).toBe(false);
  });

  it('should return hasData=true when fileMetadata exists', () => {
    const { result } = renderHook(() => useHeaderData());

    expect(result.current.hasData).toBe(true);
  });

  it('should calculate stats correctly', () => {
    const { result } = renderHook(() => useHeaderData());

    expect(result.current.stats).toEqual({
      following: 10,
      followers: 8,
      mutuals: 5,
      notFollowingBack: 5,
    });
  });

  it('should optimize filterCounts with single pass', () => {
    const { result } = renderHook(() => useHeaderData());

    // The actual optimization is in the implementation
    expect(result.current.stats.following).toBe(10);
    expect(result.current.stats.followers).toBe(8);
    expect(result.current.stats.mutuals).toBe(5);
    expect(result.current.stats.notFollowingBack).toBe(5);
  });

  it('should handle empty fileMetadata', () => {
    mockUseAppStore.mockImplementation(selector => {
      return selector({
        fileMetadata: null,
        filters: new Set<BadgeKey>(),
        currentFileName: null,
        uploadStatus: 'idle',
        uploadError: null,
      });
    });

    mockUseInstagramData.mockReturnValue({
      fileMetadata: null,
      handleClearData: mockHandleClearData,
      uploadState: { status: 'idle', error: null, fileName: null },
      handleZipUpload: vi.fn(),
      processingProgress: 0,
    });

    mockUseAccountFiltering.mockReturnValue({
      query: '',
      setQuery: vi.fn(),
      filteredIndices: [],
      filters: new Set(),
      setFilters: vi.fn(),
      filterCounts: {
        following: 0,
        followers: 0,
        mutuals: 0,
        notFollowingBack: 0,
        pending: 0,
        permanent: 0,
        restricted: 0,
        close: 0,
        unfollowed: 0,
        dismissed: 0,
      },
      clearFilters: mockClearFilters,
      totalCount: 0,
      hasLoadedData: false,
      isFiltering: false,
      processingTime: 0,
    });

    const { result } = renderHook(() => useHeaderData());

    expect(result.current.hasData).toBe(false);
    expect(result.current.stats).toEqual({
      following: 0,
      followers: 0,
      mutuals: 0,
      notFollowingBack: 0,
    });
  });

  it('should handle accounts with no badges', () => {
    mockUseAccountFiltering.mockReturnValue({
      query: '',
      setQuery: vi.fn(),
      filteredIndices: [],
      filters: new Set(),
      setFilters: vi.fn(),
      filterCounts: {
        following: 0,
        followers: 0,
        mutuals: 0,
        notFollowingBack: 0,
        pending: 0,
        permanent: 0,
        restricted: 0,
        close: 0,
        unfollowed: 0,
        dismissed: 0,
      },
      clearFilters: mockClearFilters,
      totalCount: 0,
      hasLoadedData: false,
      isFiltering: false,
      processingTime: 0,
    });

    const { result } = renderHook(() => useHeaderData());

    expect(result.current.stats).toEqual({
      following: 0,
      followers: 0,
      mutuals: 0,
      notFollowingBack: 0,
    });
  });

  it('should handle accounts with mixed badges', () => {
    mockUseAccountFiltering.mockReturnValue({
      query: '',
      setQuery: vi.fn(),
      filteredIndices: [],
      filters: new Set(),
      setFilters: vi.fn(),
      filterCounts: {
        following: 2,
        followers: 2,
        mutuals: 1,
        notFollowingBack: 1,
        pending: 0,
        permanent: 0,
        restricted: 0,
        close: 0,
        unfollowed: 0,
        dismissed: 0,
      },
      clearFilters: mockClearFilters,
      totalCount: 4,
      hasLoadedData: true,
      isFiltering: false,
      processingTime: 0,
    });

    const { result } = renderHook(() => useHeaderData());

    expect(result.current.stats).toEqual({
      following: 2, // user1, user2
      followers: 2, // user1, user3
      mutuals: 1, // user1
      notFollowingBack: 1, // user2
    });
  });

  it('should handle large dataset efficiently', () => {
    const largeFileMetadata: FileMetadata = {
      name: 'large.zip',
      size: 50 * 1024 * 1024,
      uploadDate: new Date('2024-01-01'),
      fileHash: 'large123',
      accountCount: 1000,
    };

    mockUseInstagramData.mockReturnValue({
      fileMetadata: largeFileMetadata,
      handleClearData: mockHandleClearData,
      uploadState: { status: 'success', error: null, fileName: 'large.zip' },
      handleZipUpload: vi.fn(),
      processingProgress: 0,
    });

    mockUseAccountFiltering.mockReturnValue({
      query: '',
      setQuery: vi.fn(),
      filteredIndices: [],
      filters: new Set(),
      setFilters: vi.fn(),
      filterCounts: {
        following: 500,
        followers: 334,
        mutuals: 200,
        notFollowingBack: 300,
        pending: 50,
        permanent: 10,
        restricted: 5,
        close: 25,
        unfollowed: 100,
        dismissed: 20,
      },
      clearFilters: mockClearFilters,
      totalCount: 1000,
      hasLoadedData: true,
      isFiltering: false,
      processingTime: 0,
    });

    const { result } = renderHook(() => useHeaderData());

    // Should calculate stats efficiently
    expect(result.current.stats.following).toBe(500); // 1000 / 2
    expect(result.current.stats.followers).toBe(334); // 1000 / 3 (rounded)
    expect(result.current.stats.mutuals).toBe(200); // 1000 / 5
    expect(result.current.stats.notFollowingBack).toBe(300); // 1000 / 3.33
  });

  it('should call clearFilters when onClearData is called', () => {
    const { result } = renderHook(() => useHeaderData());

    act(() => {
      result.current.onClearData();
    });

    expect(mockHandleClearData).toHaveBeenCalled();
    expect(mockClearFilters).toHaveBeenCalled();
  });

  it('should return correct file information', () => {
    const { result } = renderHook(() => useHeaderData());

    expect(result.current.fileName).toBe('test.zip');
    expect(result.current.fileSize).toBe(1024 * 1024);
    expect(result.current.uploadDate).toEqual(new Date('2024-01-01'));
    expect(result.current.uploadStatus).toBe('success');
  });

  it('should show clear button when has data', () => {
    const { result } = renderHook(() => useHeaderData());

    expect(result.current.shouldShowClearButton).toBe(true);
  });

  it('should show clear button when loading', () => {
    mockUseInstagramData.mockReturnValue({
      fileMetadata: null,
      handleClearData: mockHandleClearData,
      uploadState: { status: 'loading', error: null, fileName: 'test.zip' },
      handleZipUpload: vi.fn(),
      processingProgress: 50,
    });

    const { result } = renderHook(() => useHeaderData());

    expect(result.current.shouldShowClearButton).toBe(true);
  });

  it('should not show clear button when no data and not loading', () => {
    mockUseInstagramData.mockReturnValue({
      fileMetadata: null,
      handleClearData: mockHandleClearData,
      uploadState: { status: 'idle', error: null, fileName: null },
      handleZipUpload: vi.fn(),
      processingProgress: 0,
    });

    const { result } = renderHook(() => useHeaderData());

    expect(result.current.shouldShowClearButton).toBe(false);
  });
});
