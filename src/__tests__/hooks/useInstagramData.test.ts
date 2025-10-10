import { renderHook, act } from '@testing-library/react';
import { useInstagramData } from '@/hooks/useInstagramData';
import { useAppStore } from '@/lib/store';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDataManagement } from '@/hooks/useDataManagement';
import type { FileMetadata } from '@/core/types';

// Mock dependencies
vi.mock('@/lib/store');
vi.mock('@/hooks/useFileUpload');
vi.mock('@/hooks/useDataManagement');

const mockUseAppStore = vi.mocked(useAppStore);
const mockUseFileUpload = vi.mocked(useFileUpload);
const mockUseDataManagement = vi.mocked(useDataManagement);

describe('useInstagramData', () => {
  const mockFileMetadata: FileMetadata = {
    name: 'test.zip',
    size: 1024 * 1024,
    uploadDate: new Date('2024-01-01'),
    fileHash: 'abc123',
    accountCount: 100,
  };

  const mockHandleZipUpload = vi.fn();
  const mockAbortUpload = vi.fn();
  const mockHandleClearData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAppStore.mockImplementation(selector => {
      return selector({
        currentFileName: null,
        uploadStatus: 'idle',
        uploadError: null,
        fileMetadata: null,
      });
    });

    mockUseFileUpload.mockReturnValue({
      handleZipUpload: mockHandleZipUpload,
      abortUpload: mockAbortUpload,
      uploadProgress: 0,
      processedCount: 0,
      totalCount: 0,
    });

    mockUseDataManagement.mockReturnValue({
      handleClearData: mockHandleClearData,
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useInstagramData());

    expect(result.current.fileMetadata).toBeNull();
    expect(result.current.uploadProgress).toBe(0);
    expect(result.current.processedCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.uploadState.status).toBe('idle');
    expect(result.current.uploadState.error).toBeNull();
    expect(result.current.uploadState.fileName).toBeNull();
  });

  it('should handle ZIP file upload successfully', async () => {
    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });

    mockUseAppStore.mockImplementation(selector => {
      return selector({
        currentFileName: 'test.zip',
        uploadStatus: 'success',
        uploadError: null,
        fileMetadata: mockFileMetadata,
      });
    });

    const { result } = renderHook(() => useInstagramData());

    await act(async () => {
      await result.current.handleZipUpload(mockFile);
    });

    expect(mockHandleZipUpload).toHaveBeenCalledWith(mockFile);
    expect(result.current.fileMetadata).toEqual(mockFileMetadata);
    expect(result.current.uploadState.status).toBe('success');
    expect(result.current.uploadState.fileName).toBe('test.zip');
    expect(result.current.uploadState.error).toBeNull();
  });

  it('should handle ZIP file upload error', async () => {
    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    const errorMessage = 'Invalid ZIP file';

    mockUseAppStore.mockImplementation(selector => {
      return selector({
        currentFileName: 'test.zip',
        uploadStatus: 'error',
        uploadError: errorMessage,
        fileMetadata: null,
      });
    });

    const { result } = renderHook(() => useInstagramData());

    await act(async () => {
      await result.current.handleZipUpload(mockFile);
    });

    expect(mockHandleZipUpload).toHaveBeenCalledWith(mockFile);
    expect(result.current.uploadState.status).toBe('error');
    expect(result.current.uploadState.error).toBe(errorMessage);
    expect(result.current.uploadState.fileName).toBe('test.zip');
    expect(result.current.fileMetadata).toBeNull();
  });

  it('should update upload state during processing', async () => {
    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });

    mockUseAppStore.mockImplementation(selector => {
      return selector({
        currentFileName: 'test.zip',
        uploadStatus: 'loading',
        uploadError: null,
        fileMetadata: null,
      });
    });

    mockUseFileUpload.mockReturnValue({
      handleZipUpload: mockHandleZipUpload,
      abortUpload: mockAbortUpload,
      uploadProgress: 50,
      processedCount: 50,
      totalCount: 100,
    });

    const { result } = renderHook(() => useInstagramData());

    expect(result.current.uploadState.status).toBe('loading');
    expect(result.current.uploadState.fileName).toBe('test.zip');
    expect(result.current.uploadProgress).toBe(50);
    expect(result.current.processedCount).toBe(50);
    expect(result.current.totalCount).toBe(100);
  });

  it('should handle non-Error exceptions in handleZipUpload', async () => {
    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });

    mockUseAppStore.mockImplementation(selector => {
      return selector({
        currentFileName: 'test.zip',
        uploadStatus: 'error',
        uploadError: 'Failed to parse ZIP',
        fileMetadata: null,
      });
    });

    const { result } = renderHook(() => useInstagramData());

    await act(async () => {
      await result.current.handleZipUpload(mockFile);
    });

    expect(result.current.uploadState.status).toBe('error');
    expect(result.current.uploadState.error).toBe('Failed to parse ZIP');
    expect(result.current.uploadState.fileName).toBe('test.zip');
    expect(result.current.fileMetadata).toBeNull();
  });

  it('should clear all data when handleClearData is called', async () => {
    const { result } = renderHook(() => useInstagramData());

    await act(async () => {
      result.current.handleClearData();
    });

    expect(mockHandleClearData).toHaveBeenCalled();
  });

  it('should abort upload when clearing data during loading', async () => {
    mockUseAppStore.mockImplementation(selector => {
      return selector({
        currentFileName: 'test.zip',
        uploadStatus: 'loading',
        uploadError: null,
        fileMetadata: null,
      });
    });

    const { result } = renderHook(() => useInstagramData());

    await act(async () => {
      result.current.handleClearData();
    });

    expect(mockAbortUpload).toHaveBeenCalled();
    expect(mockHandleClearData).toHaveBeenCalled();
  });

  it('should not abort upload when clearing data if not loading', async () => {
    mockUseAppStore.mockImplementation(selector => {
      return selector({
        currentFileName: 'test.zip',
        uploadStatus: 'success',
        uploadError: null,
        fileMetadata: mockFileMetadata,
      });
    });

    const { result } = renderHook(() => useInstagramData());

    await act(async () => {
      result.current.handleClearData();
    });

    expect(mockAbortUpload).not.toHaveBeenCalled();
    expect(mockHandleClearData).toHaveBeenCalled();
  });

  it('should return correct upload state', () => {
    mockUseAppStore.mockImplementation(selector => {
      return selector({
        currentFileName: 'test.zip',
        uploadStatus: 'success',
        uploadError: null,
        fileMetadata: mockFileMetadata,
      });
    });

    const { result } = renderHook(() => useInstagramData());

    expect(result.current.uploadState).toEqual({
      status: 'success',
      error: null,
      fileName: 'test.zip',
    });
  });

  it('should handle file metadata correctly', () => {
    mockUseAppStore.mockImplementation(selector => {
      return selector({
        currentFileName: 'test.zip',
        uploadStatus: 'success',
        uploadError: null,
        fileMetadata: mockFileMetadata,
      });
    });

    const { result } = renderHook(() => useInstagramData());

    expect(result.current.fileMetadata).toEqual(mockFileMetadata);
  });

  it('should pass through upload progress from useFileUpload', () => {
    mockUseFileUpload.mockReturnValue({
      handleZipUpload: mockHandleZipUpload,
      abortUpload: mockAbortUpload,
      uploadProgress: 75,
      processedCount: 75,
      totalCount: 100,
    });

    const { result } = renderHook(() => useInstagramData());

    expect(result.current.uploadProgress).toBe(75);
    expect(result.current.processedCount).toBe(75);
    expect(result.current.totalCount).toBe(100);
  });
});
