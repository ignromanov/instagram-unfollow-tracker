/**
 * Parse Orchestration
 * Handles ZIP parsing via Web Worker or fallback to main thread
 */

import type { FileDiscovery, ParseWarning } from '@/core/types';
import { buildAccountBadgeIndex } from '@/core/badges';
import { parseInstagramZipFile } from '@/core/parsers/instagram';
import { indexedDBService } from './indexeddb/indexeddb-service';
import { logger } from './logger';

// Worker timeout constant (ms)
const WORKER_PROCESSING_TIMEOUT_MS = 60000;

export interface ParseResult {
  fileHash: string;
  accountCount: number;
  warnings?: ParseWarning[];
  discovery?: FileDiscovery;
}

export interface ProgressCallback {
  (progress: number, processedCount: number, totalCount: number): void;
}

/**
 * Parse ZIP file using Web Worker with progress tracking
 */
export async function parseWithWorker(
  worker: Worker,
  file: File,
  fileHash: string,
  onProgress: ProgressCallback,
  abortSignal?: AbortSignal
): Promise<ParseResult> {
  return new Promise<ParseResult>((resolve, reject) => {
    // Add timeout to detect infinite loading
    const timeoutId = setTimeout(() => {
      worker.removeEventListener('message', handleMessage);
      reject(new Error('Worker timeout: Processing took too long'));
    }, WORKER_PROCESSING_TIMEOUT_MS);

    const handleMessage = (e: MessageEvent) => {
      if (abortSignal?.aborted) {
        clearTimeout(timeoutId);
        worker.removeEventListener('message', handleMessage);
        reject(new Error('Upload cancelled'));
        return;
      }

      if (e.data?.type === 'progress') {
        // Progress update from chunked processing
        const { progress, processedCount, totalCount } = e.data;
        onProgress(progress, processedCount, totalCount);
      } else if (e.data?.type === 'result') {
        clearTimeout(timeoutId);
        const {
          fileHash: resultHash,
          accountCount: resultAccountCount,
          warnings,
          discovery,
        } = e.data;
        worker.removeEventListener('message', handleMessage);
        resolve({
          fileHash: resultHash || fileHash,
          accountCount: resultAccountCount,
          warnings,
          discovery,
        });
      } else if (e.data?.type === 'error') {
        clearTimeout(timeoutId);
        worker.removeEventListener('message', handleMessage);
        reject(new Error(e.data.error));
      }
    };

    worker.addEventListener('message', handleMessage);
    worker.postMessage({ type: 'parse', file, fileHash });
  });
}

/**
 * Parse ZIP file on main thread (fallback when worker unavailable)
 */
export async function parseOnMainThread(
  file: File,
  fileHash: string,
  abortSignal?: AbortSignal
): Promise<ParseResult> {
  logger.warn('[Upload] Worker not available, falling back to main thread parsing');
  logger.warn('[Upload] This will be slower for large files!');

  const parseResult = await parseInstagramZipFile(file);

  if (abortSignal?.aborted) {
    throw new Error('Upload cancelled');
  }

  // Check if we have enough data to continue
  if (!parseResult.hasMinimalData) {
    const error = parseResult.warnings.find(w => w.severity === 'error');
    throw new Error(error?.message ?? 'Could not parse Instagram data');
  }

  const unified = buildAccountBadgeIndex(parseResult.data);

  if (abortSignal?.aborted) {
    throw new Error('Upload cancelled');
  }

  // Save to IndexedDB
  await indexedDBService.saveFileMetadata({
    fileHash: fileHash,
    fileName: file.name,
    fileSize: file.size,
    uploadDate: new Date(),
    accountCount: unified.length,
    lastAccessed: Date.now(),
    version: 2,
  });

  await indexedDBService.storeAllAccounts(fileHash, unified);

  return {
    fileHash,
    accountCount: unified.length,
    warnings: parseResult.warnings,
    discovery: parseResult.discovery,
  };
}
