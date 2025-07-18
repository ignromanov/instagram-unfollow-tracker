import { useCallback } from 'react';
import { parseInstagramZipFile } from '@/core/parsers/instagram';
import { buildAccountBadgeIndex } from '@/core/badges';
import { useAppStore } from '@/lib/store';
import type { ParsedAll, AccountBadges } from '@/core/types';

export interface UploadState {
  status: 'idle' | 'success' | 'error';
  error: string | null;
  fileName: string | null;
}

export function useInstagramData() {
  // Get data from store
  const storeUnified = useAppStore(s => s.unified);
  const storeParsed = useAppStore(s => s.parsed);
  const storeFileName = useAppStore(s => s.currentFileName);
  const storeUploadStatus = useAppStore(s => s.uploadStatus);
  const storeUploadError = useAppStore(s => s.uploadError);
  const setUnified = useAppStore(s => s.setUnified);
  const setParsed = useAppStore(s => s.setParsed);
  const setUploadInfo = useAppStore(s => s.setUploadInfo);
  const setFilters = useAppStore(s => s.setFilters);
  const currentFilters = useAppStore(s => s.filters);
  const clearData = useAppStore(s => s.clearData);

  // Use store data directly - no local state duplication
  const meta = storeParsed;
  const unified = storeUnified;
  const uploadState: UploadState = {
    status: storeUploadStatus,
    error: storeUploadError,
    fileName: storeFileName,
  };

  const handleZipUpload = useCallback(async (file: File) => {
    // Update store for immediate UI feedback
    setUploadInfo({ 
      currentFileName: file.name, 
      uploadStatus: 'idle', 
      uploadError: null 
    });

    try {
      const parsed = await parseInstagramZipFile(file);
      const unifiedData = buildAccountBadgeIndex(parsed);
      
      // Update store with new data
      setParsed(parsed);
      setUnified(unifiedData);
      // Set default filters only if current filters are empty
      if (currentFilters.size === 0) {
        setFilters(new Set(['following', 'followers']));
      }
      setUploadInfo({ 
        currentFileName: file.name, 
        uploadStatus: 'success', 
        uploadError: null 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse ZIP';
      setUploadInfo({ 
        currentFileName: file.name, 
        uploadStatus: 'error', 
        uploadError: errorMessage 
      });
      throw err;
    }
  }, [setParsed, setUnified, setFilters, setUploadInfo, currentFilters]);

  const handleClearData = useCallback(() => {
    // Clear store data
    clearData();
  }, [clearData]);

  return {
    meta,
    unified,
    uploadState,
    handleZipUpload,
    handleClearData,
  };
}
