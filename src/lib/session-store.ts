import type { FileDiscovery, ParseWarning } from '@/core/types';
import { create } from 'zustand';

/**
 * Session-only store for transient state that should NOT be persisted.
 * This state is cleared on page refresh.
 *
 * Separation rationale:
 * - parseWarnings: Only relevant during current upload session
 * - fileDiscovery: Diagnostic data for current file only
 * - uploadProgress: Real-time progress, no need to persist
 *
 * This keeps the persisted store under 1KB as per architecture constraints.
 */
interface SessionState {
  // Upload diagnostics (session-only)
  parseWarnings: ParseWarning[];
  fileDiscovery: FileDiscovery | null;

  // Upload progress (real-time, not persisted)
  uploadProgress: number;
  processedCount: number;
  totalCount: number;

  // Actions
  setParseWarnings: (warnings: ParseWarning[]) => void;
  setFileDiscovery: (discovery: FileDiscovery | null) => void;
  setUploadProgress: (progress: number, processed: number, total: number) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(set => ({
  // Initial state
  parseWarnings: [],
  fileDiscovery: null,
  uploadProgress: 0,
  processedCount: 0,
  totalCount: 0,

  // Actions
  setParseWarnings: warnings => set({ parseWarnings: warnings }),
  setFileDiscovery: discovery => set({ fileDiscovery: discovery }),
  setUploadProgress: (progress, processed, total) =>
    set({
      uploadProgress: progress,
      processedCount: processed,
      totalCount: total,
    }),
  clearSession: () =>
    set({
      parseWarnings: [],
      fileDiscovery: null,
      uploadProgress: 0,
      processedCount: 0,
      totalCount: 0,
    }),
}));
