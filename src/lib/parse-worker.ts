// Web Worker for parsing Instagram ZIP files
// Runs file parsing in background thread with chunked processing

import { buildAccountBadgeIndex } from '@/core/badges';
import { parseInstagramZipFile } from '@/core/parsers/instagram';
import { generateFileHash } from './indexeddb/indexeddb-cache';
import { indexedDBService } from './indexeddb/indexeddb-service';
import { buildAllSearchIndexes } from './search-index';

// Configuration - optimized for balance between speed and memory
// Smaller chunks = more frequent progress updates but more overhead
// Larger chunks = faster processing but less frequent updates
// Process 30k accounts per chunk (optimized for 1M+ datasets) - not currently used
// const CHUNK_SIZE = 30000;

// Send ready signal to main thread
try {
  self.postMessage({ type: 'ready' });
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  self.postMessage({ type: 'error', error: errorMessage });
}

// Main message handler for file parsing
self.onmessage = async (
  e: MessageEvent<{
    type: string;
    file?: File;
    fileHash?: string;
    port?: MessagePort;
  }>
) => {
  // Ignore WorkerConsole initialization messages (handled by WorkerConsole.js)
  if (e.data?.type === '__console_init__') {
    return;
  }

  if (e.data?.type !== 'parse') {
    return;
  }

  try {
    const { file, fileHash: providedHash } = e.data;

    // Validate input
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided');
    }

    // Generate or use provided file hash
    const fileHash = providedHash || (await generateFileHash(file));

    // Parse the ZIP file
    const parseResult = await parseInstagramZipFile(file);

    // Check if we have enough data to continue
    if (!parseResult.hasMinimalData) {
      const error = parseResult.warnings.find(w => w.severity === 'error');
      throw new Error(error?.message ?? 'Could not parse Instagram data');
    }

    // Build account badge index from parsed data
    const unified = buildAccountBadgeIndex(parseResult.data);

    // Save file metadata
    await indexedDBService.saveFileMetadata({
      fileHash,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date(),
      accountCount: unified.length,
      lastAccessed: Date.now(),
      version: 2,
    });

    // Store all accounts at once (optimized bulk mode)
    await indexedDBService.storeAllAccounts(fileHash, unified);

    // Build search indexes in background (optional, non-blocking)
    // This runs after sending the result so UI is responsive
    setTimeout(async () => {
      try {
        const accountsWithIndices = unified.map((account, index) => ({
          username: account.username,
          index,
        }));

        await buildAllSearchIndexes(fileHash, accountsWithIndices);
      } catch {
        // Non-critical error - app will work without indexes (slower search)
      }
    }, 100);

    // Send success result with warnings and discovery info
    self.postMessage({
      type: 'result',
      fileHash,
      // Don't send unified - data is already in IndexedDB for lazy loading
      accountCount: unified.length,
      warnings: parseResult.warnings,
      discovery: parseResult.discovery,
    });
  } catch (error) {
    // Send error result
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown parsing error',
    });
  }
};

// Handle worker errors
self.onerror = () => {
  // Silent error handling
};

// Handle unhandled promise rejections
self.onunhandledrejection = event => {
  event.preventDefault();
};
