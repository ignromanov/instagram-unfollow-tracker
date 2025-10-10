/**
 * Search Index Builder - Trigram-based search indexing
 *
 * Builds and manages trigram indexes for fast username searching
 * Uses bitsets for O(1) lookup instead of O(n) linear search
 */

import { BitSet } from './indexeddb/bitset';
import { indexedDBService } from './indexeddb/indexeddb-service';

/**
 * Generate trigrams from a string
 * Trigram = 3-character substring with padding
 */
export function generateTrigrams(text: string): string[] {
  const normalized = text.toLowerCase().trim();

  if (normalized.length === 0) {
    return [];
  }

  // Add padding for start/end matching
  const padded = `__${normalized}__`;
  const trigrams: string[] = [];

  for (let i = 0; i <= padded.length - 3; i++) {
    trigrams.push(padded.substring(i, i + 3));
  }

  return trigrams;
}

/**
 * Generate prefix strings (2-4 chars) for prefix search
 */
export function generatePrefixes(text: string): string[] {
  const normalized = text.toLowerCase().trim();

  if (normalized.length === 0) {
    return [];
  }

  const prefixes: string[] = [];
  const maxLen = Math.min(4, normalized.length);

  for (let len = 2; len <= maxLen; len++) {
    prefixes.push(normalized.substring(0, len));
  }

  return prefixes;
}

/**
 * Build trigram index for a set of accounts
 */
export async function buildTrigramIndex(
  fileHash: string,
  accounts: Array<{ username: string; index: number }>
): Promise<Map<string, BitSet>> {
  // Create a map of trigram -> account indices
  const trigramMap = new Map<string, number[]>();

  // Find total account count for bitset sizing (avoid spread operator for large arrays)
  let maxIndex = 0;
  for (const account of accounts) {
    if (account.index > maxIndex) {
      maxIndex = account.index;
    }
  }

  // Process each account
  for (const account of accounts) {
    const trigrams = generateTrigrams(account.username);

    for (const trigram of trigrams) {
      if (!trigramMap.has(trigram)) {
        trigramMap.set(trigram, []);
      }
      trigramMap.get(trigram)!.push(account.index);
    }
  }

  // Convert to bitsets and batch store
  const trigramBitsets = new Map<string, BitSet>();
  const storePromises: Promise<void>[] = [];

  for (const [trigram, indices] of trigramMap) {
    const bitset = BitSet.fromIndices(indices, maxIndex + 1);
    trigramBitsets.set(trigram, bitset);

    // Store in IndexedDB (batched)
    storePromises.push(indexedDBService.putSearchIndex(fileHash, 'trigram', trigram, bitset));

    // Batch in groups of 100 to avoid too many promises
    if (storePromises.length >= 100) {
      await Promise.all(storePromises);
      storePromises.length = 0;
    }
  }

  // Store remaining
  if (storePromises.length > 0) {
    await Promise.all(storePromises);
  }

  return trigramBitsets;
}

/**
 * Build prefix index for a set of accounts
 */
export async function buildPrefixIndex(
  fileHash: string,
  accounts: Array<{ username: string; index: number }>
): Promise<Map<string, BitSet>> {
  // Create a map of prefix -> account indices
  const prefixMap = new Map<string, number[]>();

  // Find total account count for bitset sizing (avoid spread operator for large arrays)
  let maxIndex = 0;
  for (const account of accounts) {
    if (account.index > maxIndex) {
      maxIndex = account.index;
    }
  }

  // Process each account
  for (const account of accounts) {
    const prefixes = generatePrefixes(account.username);

    for (const prefix of prefixes) {
      if (!prefixMap.has(prefix)) {
        prefixMap.set(prefix, []);
      }
      prefixMap.get(prefix)!.push(account.index);
    }
  }

  // Convert to bitsets and batch store
  const prefixBitsets = new Map<string, BitSet>();
  const storePromises: Promise<void>[] = [];

  for (const [prefix, indices] of prefixMap) {
    const bitset = BitSet.fromIndices(indices, maxIndex + 1);
    prefixBitsets.set(prefix, bitset);

    // Store in IndexedDB (batched)
    storePromises.push(indexedDBService.putSearchIndex(fileHash, 'prefix', prefix, bitset));

    // Batch in groups of 100 to avoid too many promises
    if (storePromises.length >= 100) {
      await Promise.all(storePromises);
      storePromises.length = 0;
    }
  }

  // Store remaining
  if (storePromises.length > 0) {
    await Promise.all(storePromises);
  }

  return prefixBitsets;
}

/**
 * Search using trigram index
 * Returns bitset of matching account indices
 */
export async function searchWithTrigrams(
  fileHash: string,
  searchQuery: string
): Promise<BitSet | null> {
  const trigrams = generateTrigrams(searchQuery);

  if (trigrams.length === 0) {
    return null;
  }

  // Load bitsets for all trigrams
  const bitsets: BitSet[] = [];

  for (const trigram of trigrams) {
    const bitset = await indexedDBService.getSearchIndex(fileHash, 'trigram', trigram);
    if (bitset) {
      bitsets.push(bitset);
    }
  }

  // No matches if any trigram is missing
  if (bitsets.length === 0) {
    return null;
  }

  // Intersect all bitsets (AND operation)
  let result = bitsets[0]!;
  for (let i = 1; i < bitsets.length; i++) {
    result = result.intersect(bitsets[i]!);
  }

  return result;
}

/**
 * Search using prefix index
 * Returns bitset of matching account indices
 */
export async function searchWithPrefix(
  fileHash: string,
  searchQuery: string
): Promise<BitSet | null> {
  const normalized = searchQuery.toLowerCase().trim();

  if (normalized.length < 2) {
    return null; // Too short for prefix search
  }

  // Try exact prefix match
  const prefix = normalized.substring(0, Math.min(4, normalized.length));
  const bitset = await indexedDBService.getSearchIndex(fileHash, 'prefix', prefix);

  return bitset;
}

/**
 * Smart search that combines prefix and trigram indexes
 */
export async function smartSearch(fileHash: string, searchQuery: string): Promise<BitSet | null> {
  const normalized = searchQuery.toLowerCase().trim();

  if (normalized.length === 0) {
    return null;
  }

  // For short queries (2-3 chars), use prefix search
  if (normalized.length <= 3) {
    return await searchWithPrefix(fileHash, normalized);
  }

  // For longer queries, try trigram search first
  const trigramResult = await searchWithTrigrams(fileHash, normalized);

  if (trigramResult) {
    return trigramResult;
  }

  // Fallback to prefix search
  return await searchWithPrefix(fileHash, normalized);
}

/**
 * Build all search indexes for a file
 * Called after file upload completes
 */
export async function buildAllSearchIndexes(
  fileHash: string,
  accounts: Array<{ username: string; index: number }>
): Promise<void> {
  // Build both indexes in parallel
  await Promise.all([buildPrefixIndex(fileHash, accounts), buildTrigramIndex(fileHash, accounts)]);
}

/**
 * Check if search indexes exist for a file
 */
export async function hasSearchIndexes(fileHash: string): Promise<boolean> {
  // Try to load a common prefix
  const testBitset = await indexedDBService.getSearchIndex(fileHash, 'prefix', 'us');
  return testBitset !== null;
}

/**
 * Estimate index size for a file
 */
export function estimateIndexSize(accountCount: number): number {
  // Rough estimate:
  // - Average username length: 10 chars
  // - Trigrams per username: ~12
  // - Prefixes per username: ~3
  // - Total unique trigrams/prefixes: ~30% (due to overlap)
  // - Bitset size per index: accountCount / 8 bytes

  const avgTrigramsPerUser = 12;
  const avgPrefixesPerUser = 3;
  const uniquenessRatio = 0.3;

  const estimatedTrigrams = accountCount * avgTrigramsPerUser * uniquenessRatio;
  const estimatedPrefixes = accountCount * avgPrefixesPerUser * uniquenessRatio;

  const totalIndexes = estimatedTrigrams + estimatedPrefixes;
  const bytesPerBitset = Math.ceil(accountCount / 8);

  return totalIndexes * bytesPerBitset;
}
