import type { ParseWarning } from '@/core/types';
import { analytics } from '@/lib/analytics';
import { dbCache, generateFileHash } from '@/lib/indexeddb/indexeddb-cache';
import { indexedDBService } from '@/lib/indexeddb/indexeddb-service';
import { useAppStore } from '@/lib/store';
import { useCallback, useEffect, useRef, useState } from 'react';

// ZIP magic bytes: PK\x03\x04 (0x504B0304)
const ZIP_MAGIC_BYTES = [0x50, 0x4b, 0x03, 0x04];

/** Check if file is a valid ZIP by reading magic bytes */
async function isValidZipFile(file: File): Promise<boolean> {
  // Check extension first (quick check)
  if (!file.name.toLowerCase().endsWith('.zip')) {
    return false;
  }

  // In test environment, file.slice may not be available
  if (typeof file.slice !== 'function') {
    // Fall back to extension check only
    return true;
  }

  try {
    // Read first 4 bytes to verify ZIP signature
    const header = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(header);

    return (
      bytes.length >= 4 &&
      bytes[0] === ZIP_MAGIC_BYTES[0] &&
      bytes[1] === ZIP_MAGIC_BYTES[1] &&
      bytes[2] === ZIP_MAGIC_BYTES[2] &&
      bytes[3] === ZIP_MAGIC_BYTES[3]
    );
  } catch {
    // If reading fails, fall back to extension check
    return true;
  }
}

export function useFileUpload() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerReadyRef = useRef(false);

  // Progress tracking
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Store actions
  const setUploadInfo = useAppStore(s => s.setUploadInfo);
  const setFilters = useAppStore(s => s.setFilters);
  const filters = useAppStore(s => s.filters);

  // Initialize Web Worker for file parsing
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Worker && !workerRef.current) {
      const initializeWorker = async () => {
        try {
          const basePath = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';

          // Load enhanced WorkerConsole.js for worker console logging
          const loadWorkerConsole = () => {
            return new Promise<void>(resolve => {
              if (document.querySelector('script[src*="WorkerConsole.js"]')) {
                resolve();
                return;
              }

              const script = document.createElement('script');
              script.src = `${basePath}WorkerConsole.js`;
              script.onload = () => {
                resolve();
              };
              script.onerror = () => {
                resolve(); // Continue even if WorkerConsole fails to load
              };
              document.head.appendChild(script);
            });
          };

          // Load WorkerConsole first, then create worker
          await loadWorkerConsole();

          // Create TypeScript module worker directly
          try {
            const worker = new Worker(new URL('../lib/parse-worker.ts', import.meta.url), {
              type: 'module',
            });
            workerRef.current = worker;
          } catch (error) {
            throw new Error(
              `Failed to create worker: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }

          // Wait for worker to be ready
          const readyHandler = (e: MessageEvent) => {
            if (e.data?.type === 'ready') {
              workerReadyRef.current = true;
              workerRef.current?.removeEventListener('message', readyHandler);
            }
          };

          workerRef.current.addEventListener('message', readyHandler);

          // Add global error handler
          workerRef.current.onerror = event => {
            const errorEvent = event as ErrorEvent;
            if (typeof errorEvent?.preventDefault === 'function') {
              errorEvent.preventDefault();
            }
          };

          // Timeout to detect if worker doesn't respond
          setTimeout(() => {
            if (!workerReadyRef.current) {
              workerReadyRef.current = true;
            }
          }, 5000);
        } catch {
          // Silent error handling
        }
      };

      // Call the async function
      initializeWorker();
    }

    // Cleanup worker on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        workerReadyRef.current = false;
      }
    };
  }, []);

  const handleZipUpload = useCallback(
    async (file: File) => {
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

        if (workerRef.current && workerReadyRef.current) {
          // Parse file using Web Worker with progress updates

          const result = await new Promise<{
            fileHash: string;
            accountCount: number;
            warnings?: import('@/core/types').ParseWarning[];
            discovery?: import('@/core/types').FileDiscovery;
          }>((resolve, reject) => {
            // Add timeout to detect infinite loading
            const timeoutId = setTimeout(() => {
              workerRef.current?.removeEventListener('message', handleMessage);
              reject(new Error('Worker timeout: Processing took too long'));
            }, 60000); // 60 second timeout

            const handleMessage = (e: MessageEvent) => {
              if (e.data?.type === 'progress') {
                // Progress update from chunked processing
                const { progress, processedCount, totalCount } = e.data;
                setUploadProgress(progress);
                setProcessedCount(processedCount);
                setTotalCount(totalCount);
              } else if (e.data?.type === 'result') {
                clearTimeout(timeoutId);
                const {
                  fileHash: resultHash,
                  accountCount: resultAccountCount,
                  warnings,
                  discovery,
                } = e.data;
                workerRef.current?.removeEventListener('message', handleMessage);
                resolve({
                  fileHash: resultHash || fileHash,
                  accountCount: resultAccountCount,
                  warnings,
                  discovery,
                });
              } else if (e.data?.type === 'error') {
                clearTimeout(timeoutId);
                workerRef.current?.removeEventListener('message', handleMessage);
                // Save warnings and discovery for DiagnosticErrorScreen before rejecting
                if (e.data.warnings || e.data.discovery) {
                  setUploadInfo({
                    parseWarnings: e.data.warnings ?? [],
                    fileDiscovery: e.data.discovery,
                  });
                }
                reject(new Error(e.data.error));
              }
            };

            workerRef.current?.addEventListener('message', handleMessage);

            workerRef.current?.postMessage({ type: 'parse', file, fileHash });
          });

          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Upload cancelled');
          }

          accountCount = result.accountCount;
          resultFileHash = result.fileHash;

          // Store warnings and discovery from worker
          if (result.warnings || result.discovery) {
            setUploadInfo({
              parseWarnings: result.warnings ?? [],
              fileDiscovery: result.discovery,
            });
          }
        } else {
          console.warn('[Upload] Worker not available, falling back to main thread parsing');
          console.warn('[Upload] This will be slower for large files!');
          console.warn('[Upload] Worker status:', {
            workerExists: !!workerRef.current,
            workerReady: workerReadyRef.current,
          });

          // Fallback: parse on main thread (imports needed for fallback)
          const { parseInstagramZipFile } = await import('@/core/parsers/instagram');
          const { buildAccountBadgeIndex } = await import('@/core/badges');

          const parseResult = await parseInstagramZipFile(file);

          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Upload cancelled');
          }

          // Check if we have enough data to continue
          if (!parseResult.hasMinimalData) {
            const error = parseResult.warnings.find(w => w.severity === 'error');
            throw new Error(error?.message ?? 'Could not parse Instagram data');
          }

          const unified = buildAccountBadgeIndex(parseResult.data);

          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Upload cancelled');
          }

          // Save to IndexedDB
          await indexedDBService.saveFileMetadata({
            fileHash: resultFileHash,
            fileName: file.name,
            fileSize: file.size,
            uploadDate: new Date(),
            accountCount: unified.length,
            lastAccessed: Date.now(),
            version: 2,
          });

          await indexedDBService.storeAllAccounts(resultFileHash, unified);
          accountCount = unified.length;

          // Store warnings and discovery from main thread parsing
          setUploadInfo({
            parseWarnings: parseResult.warnings,
            fileDiscovery: parseResult.discovery,
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
