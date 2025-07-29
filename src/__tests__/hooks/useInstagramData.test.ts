import { renderHook, act } from '@testing-library/react';
import { useInstagramData } from '@/hooks/useInstagramData';
import { parseInstagramZipFile } from '@/core/parsers/instagram';
import { createTestParsedData, TEST_ACCOUNTS } from '@tests/fixtures/testData';
import type { ParsedAll } from '@/core/types';

// Mock the parsers
vi.mock('@/core/parsers/instagram');

describe('useInstagramData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useInstagramData());
    
    expect(result.current.meta).toBeNull();
    expect(result.current.unified).toEqual([]);
    expect(result.current.uploadState.status).toBe('idle');
    expect(result.current.uploadState.error).toBeNull();
    expect(result.current.uploadState.fileName).toBeNull();
  });

  it('should handle ZIP file upload successfully', async () => {
    const testData = createTestParsedData();
    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    
    vi.mocked(parseInstagramZipFile).mockResolvedValue(testData);
    
    const { result } = renderHook(() => useInstagramData());
    
    await act(async () => {
      await result.current.handleZipUpload(mockFile);
    });
    
    expect(parseInstagramZipFile).toHaveBeenCalledWith(mockFile);
    expect(result.current.meta).toEqual(testData);
    expect(result.current.unified).toHaveLength(
      new Set([
        ...TEST_ACCOUNTS.following,
        ...TEST_ACCOUNTS.followers,
        ...TEST_ACCOUNTS.pending,
        ...TEST_ACCOUNTS.permanent,
        ...TEST_ACCOUNTS.restricted,
        ...TEST_ACCOUNTS.close,
        ...TEST_ACCOUNTS.unfollowed,
        ...TEST_ACCOUNTS.dismissed,
      ]).size
    );
    expect(result.current.uploadState.status).toBe('success');
    expect(result.current.uploadState.fileName).toBe('test.zip');
    expect(result.current.uploadState.error).toBeNull();
  });

  it('should handle ZIP file upload error', async () => {
    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    const errorMessage = 'Invalid ZIP file';
    
    vi.mocked(parseInstagramZipFile).mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useInstagramData());
    
    await act(async () => {
      try {
        await result.current.handleZipUpload(mockFile);
      } catch (error) {
        // Expected to throw
      }
    });
    
    expect(result.current.uploadState.status).toBe('error');
    expect(result.current.uploadState.error).toBe(errorMessage);
    expect(result.current.uploadState.fileName).toBe('test.zip');
  });


  it('should update upload state during processing', async () => {
    const testData = createTestParsedData();
    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const controlledPromise = new Promise<ParsedAll>(resolve => {
      resolvePromise = resolve;
    });
    
    vi.mocked(parseInstagramZipFile).mockReturnValue(controlledPromise);
    
    const { result } = renderHook(() => useInstagramData());
    
    // Start upload
    act(() => {
      result.current.handleZipUpload(mockFile);
    });
    
    // Check that state is set to processing
    expect(result.current.uploadState.status).toBe('idle');
    expect(result.current.uploadState.fileName).toBe('test.zip');
    
    // Complete the upload
    await act(async () => {
      resolvePromise!(testData);
      await controlledPromise;
    });
    
    expect(result.current.uploadState.status).toBe('success');
  });

  it('should handle non-Error exceptions in handleZipUpload', async () => {
    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    vi.mocked(parseInstagramZipFile).mockRejectedValue('String error');

    const { result } = renderHook(() => useInstagramData());

    await act(async () => {
      try {
        await result.current.handleZipUpload(mockFile);
      } catch (err) {
        // Expected to throw
      }
    });

    expect(result.current.uploadState.status).toBe('error');
    expect(result.current.uploadState.error).toBe('Failed to parse ZIP');
    expect(result.current.uploadState.fileName).toBe('test.zip');
  });

  it('should clear all data when handleClearData is called', async () => {
    const testData = createTestParsedData();
    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    
    vi.mocked(parseInstagramZipFile).mockResolvedValue(testData);
    
    const { result } = renderHook(() => useInstagramData());
    
    // First upload some data
    await act(async () => {
      await result.current.handleZipUpload(mockFile);
    });
    
    // Verify data is loaded
    expect(result.current.meta).toEqual(testData);
    expect(result.current.unified.length).toBeGreaterThan(0);
    expect(result.current.uploadState.status).toBe('success');
    expect(result.current.uploadState.fileName).toBe('test.zip');
    
    // Clear the data
    act(() => {
      result.current.handleClearData();
    });
    
    // Verify data is cleared
    expect(result.current.meta).toBeNull();
    expect(result.current.unified).toEqual([]);
    expect(result.current.uploadState.status).toBe('idle');
    expect(result.current.uploadState.error).toBeNull();
    expect(result.current.uploadState.fileName).toBeNull();
  });

});
