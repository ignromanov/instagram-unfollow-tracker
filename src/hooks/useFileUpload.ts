import type { ParseWarning } from '@/core/types';
import { analytics } from '@/lib/analytics';
import { isValidZipFile } from '@/lib/file-validation';
import { dbCache, generateFileHash } from '@/lib/indexeddb/indexeddb-cache';
import { parseOnMainThread, parseWithWorker } from '@/lib/parse-orchestration';
import { useAppStore } from '@/lib/store';
import { useCallback, useRef, useState } from 'react';
import { useParseWorker } from './useParseWorker';

// Upload rate limiting (ms)
const UPLOAD_DEBOUNCE_MS = 1000;

export function useFileUpload() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUploadRef = useRef<number>(0);

  // Progress tracking
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Store actions
  const setUploadInfo = useAppStore(s => s.setUploadInfo);
  const setFilters = useAppStore(s => s.setFilters);
  const filters = useAppStore(s => s.filters);

  // Web Worker for file parsing
  const { workerRef, isWorkerReady } = useParseWorker();

  const handleZipUpload = useCallback(
    // eslint-disable-next-line complexity -- Upload handler has high complexity due to multiple error paths, cache checks, and state management
    async (file: File) => {
      // Debounce rapid uploads
      const now = Date.now();
      if (now - lastUploadRef.current < UPLOAD_DEBOUNCE_MS) {
        return;
      }
      lastUploadRef.current = now;

      const uploadDate = new Date();
      const startTime = performance.now();
      const fileSizeMb = file.size / (1024 * 1024);

      // Reset progress
      setUploadProgress(0);
      setProcessedCount(0);
      setTotalCount(0);

      // Cancel any ongoing operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Update store for immediate UI feedback
      setUploadInfo({
        currentFileName: file.name,
        uploadStatus: 'loading',
        uploadError: null,
        fileSize: file.size,
        uploadDate,
      });

      let fileHash: string = '';

      try {
        // Validate ZIP file before processing
        const isZip = await isValidZipFile(file);
        if (!isZip) {
          const notZipWarning: ParseWarning = {
            code: 'NOT_ZIP',
            message: 'Please upload a ZIP archive file, not a folder or other file type.',
            severity: 'error',
            fix: 'Look for a file ending in .zip in your Downloads folder.',
          };

          setUploadInfo({
            currentFileName: file.name,
            uploadStatus: 'error',
            uploadError: notZipWarning.message,
            parseWarnings: [notZipWarning],
          });

          analytics.fileUploadError('', 'NOT_ZIP');
          throw new Error(notZipWarning.message);
        }

        // Generate file hash for cache lookup and analytics correlation
        fileHash = await generateFileHash(file);

        // Track upload start with file hash
        analytics.fileUploadStart(fileHash, fileSizeMb);

        // Check IndexedDB cache first
        const cachedData = await dbCache.get(fileHash);

        if (cachedData) {
          // Restore data from cache
          // Data is in IndexedDB, just update metadata

          // Set default filters only if current filters are empty
          if (filters.size === 0) {
            setFilters(new Set(['following', 'followers']));
          }

          setUploadInfo({
            currentFileName: cachedData.metadata.name,
            uploadStatus: 'success',
            uploadError: null,
            fileSize: cachedData.metadata.size,
            uploadDate: cachedData.metadata.uploadDate,
            fileHash: fileHash,
            accountCount: cachedData.metadata.accountCount,
          });

          // Track success from cache
          analytics.fileUploadSuccess(
            fileHash,
            cachedData.metadata.accountCount,
            performance.now() - startTime,
            true
          );

          return;
        }

        // Use Web Worker for file parsing if available, otherwise fallback to main thread
        let accountCount: number = 0;
        let resultFileHash: string = fileHash;

        const handleProgress = (progress: number, processed: number, total: number) => {
          setUploadProgress(progress);
          setProcessedCount(processed);
          setTotalCount(total);
        };

        if (workerRef.current && isWorkerReady()) {
          // Parse file using Web Worker with progress updates
          try {
            const result = await parseWithWorker(
              workerRef.current,
              file,
              fileHash,
              handleProgress,
              abortControllerRef.current?.signal
            );

            accountCount = result.accountCount;
            resultFileHash = result.fileHash;

            // Store warnings and discovery from worker
            if (result.warnings || result.discovery) {
              setUploadInfo({
                parseWarnings: result.warnings ?? [],
                fileDiscovery: result.discovery,
              });
            }
          } catch (error) {
            // Extract warnings/discovery from error if available
            if (error instanceof Error && 'warnings' in error) {
              setUploadInfo({
                parseWarnings: (error as { warnings?: ParseWarning[] }).warnings ?? [],
                fileDiscovery: (error as { discovery?: import('@/core/types').FileDiscovery })
                  .discovery,
              });
            }
            throw error;
          }
        } else {
          // Fallback: parse on main thread
          const result = await parseOnMainThread(
            file,
            fileHash,
            abortControllerRef.current?.signal
          );

          accountCount = result.accountCount;
          resultFileHash = result.fileHash;

          // Store warnings and discovery from main thread parsing
          setUploadInfo({
            parseWarnings: result.warnings ?? [],
            fileDiscovery: result.discovery,
          });
        }

        // Data already cached in IndexedDB by worker during chunked processing

        // Set default filters only if current filters are empty
        if (filters.size === 0) {
          setFilters(new Set(['following', 'followers']));
        }

        setUploadInfo({
          currentFileName: file.name,
          uploadStatus: 'success',
          uploadError: null,
          fileSize: file.size,
          uploadDate,
          fileHash: resultFileHash,
          accountCount: accountCount,
        });

        // Track successful processing
        analytics.fileUploadSuccess(
          resultFileHash,
          accountCount,
          performance.now() - startTime,
          false
        );
      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) {
          return; // Don't show error for cancelled uploads
        }

        const errorMessage = err instanceof Error ? err.message : 'Failed to parse ZIP';

        // Track error
        analytics.fileUploadError(fileHash, errorMessage);

        setUploadInfo({
          currentFileName: file.name,
          uploadStatus: 'error',
          uploadError: errorMessage,
        });
        throw err;
      }
    },
    [setFilters, setUploadInfo, filters]
  );

  const abortUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    handleZipUpload,
    abortUpload,
    uploadProgress,
    processedCount,
    totalCount,
  };
}
