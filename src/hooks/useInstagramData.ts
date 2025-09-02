import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useFileUpload } from './useFileUpload';
import { useDataManagement } from './useDataManagement';
import type { UploadState } from '@/core/types';

export function useInstagramData() {
  // Get data from store
  const currentFileName = useAppStore(s => s.currentFileName);
  const uploadStatus = useAppStore(s => s.uploadStatus);
  const uploadError = useAppStore(s => s.uploadError);
  const fileMetadata = useAppStore(s => s.fileMetadata);

  // Use specialized hooks
  const { handleZipUpload, abortUpload, uploadProgress, processedCount, totalCount } =
    useFileUpload();
  const { handleClearData } = useDataManagement();

  // Memoized upload state
  const uploadState: UploadState = useMemo(
    () => ({
      status: uploadStatus,
      error: uploadError,
      fileName: currentFileName,
    }),
    [uploadStatus, uploadError, currentFileName]
  );

  // Enhanced clear data that also aborts upload
  const handleClearDataWithCache = () => {
    // Abort any ongoing upload first
    if (uploadStatus === 'loading') {
      abortUpload();
    }
    handleClearData();
  };

  return {
    uploadState,
    handleZipUpload,
    handleClearData: handleClearDataWithCache,
    fileMetadata,
    uploadProgress,
    processedCount,
    totalCount,
  };
}
