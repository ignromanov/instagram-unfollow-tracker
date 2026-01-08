import type { BadgeKey, FileDiscovery, FileMetadata, ParseWarning } from '@/core/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Journey step definition for guided user experience
export type JourneyStep =
  | 'hero' // Initial landing with hero section
  | 'how-to' // How to get data instructions
  | 'upload' // Upload zone for ZIP file
  | 'results' // Filtered accounts view
  | 'complete'; // Analysis complete, FAQ visible

// Sub-steps within the how-to section
export type HowToSubStep =
  | 'opening-settings'
  | 'selecting-data'
  | 'downloading'
  | 'uploading-analyzing';

interface JourneyState {
  currentStep: JourneyStep;
  completedSteps: Set<JourneyStep>;
  expandedSteps: Set<JourneyStep>; // For accordion behavior
  completedHowToSubSteps: Set<HowToSubStep>; // Track completed how-to sub-steps
}

interface AppState {
  filters: Set<BadgeKey>;
  currentFileName: string | null;
  uploadStatus: 'idle' | 'loading' | 'success' | 'error';
  uploadError: string | null;
  fileMetadata: FileMetadata | null;
  // Journey state for guided user experience
  journey: JourneyState;
  // Session-only state (not persisted)
  parseWarnings: ParseWarning[];
  fileDiscovery: FileDiscovery | null;
  _hasHydrated: boolean;
  setFilters: (filters: Set<BadgeKey>) => void;
  setUploadInfo: (info: {
    currentFileName?: string | null;
    uploadStatus?: 'idle' | 'loading' | 'success' | 'error';
    uploadError?: string | null;
    fileSize?: number;
    uploadDate?: Date;
    fileHash?: string;
    accountCount?: number;
    parseWarnings?: ParseWarning[];
    fileDiscovery?: FileDiscovery;
  }) => void;
  // Journey actions
  advanceJourney: (step: JourneyStep) => void;
  toggleStepExpansion: (step: JourneyStep) => void;
  toggleHowToSubStep: (subStep: HowToSubStep) => void;
  resetJourney: () => void;
  clearData: () => void;
}

// Helper to serialize Set for persist
function serializeSet<T>(set: Set<T>): T[] {
  return Array.from(set.values());
}
function deserializeSet<T>(arr: T[] | undefined): Set<T> {
  return new Set(arr ?? []);
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      filters: new Set<BadgeKey>(),
      currentFileName: null,
      uploadStatus: 'idle',
      uploadError: null,
      fileMetadata: null,
      journey: {
        currentStep: 'hero',
        completedSteps: new Set<JourneyStep>(),
        expandedSteps: new Set<JourneyStep>(['hero']), // Hero always expanded
        completedHowToSubSteps: new Set<HowToSubStep>(),
      },
      parseWarnings: [],
      fileDiscovery: null,
      _hasHydrated: false,
      setFilters: filters => set({ filters: new Set(filters) }),
      setUploadInfo: info =>
        set(state => {
          const newState: Partial<AppState> = {
            currentFileName: info.currentFileName ?? state.currentFileName,
            uploadStatus: info.uploadStatus ?? state.uploadStatus,
            uploadError: info.uploadError ?? state.uploadError,
            parseWarnings: info.parseWarnings ?? state.parseWarnings,
            fileDiscovery: info.fileDiscovery ?? state.fileDiscovery,
          };

          // Update fileMetadata when we have file info and success status
          if (info.currentFileName && info.uploadStatus === 'success') {
            newState.fileMetadata = {
              name: info.currentFileName,
              size: info.fileSize || 0,
              uploadDate: info.uploadDate || new Date(),
              fileHash: info.fileHash,
              accountCount: info.accountCount,
            };
          }

          // Clear fileMetadata on error
          if (info.uploadStatus === 'error') {
            newState.fileMetadata = null;
          }

          return newState;
        }),
      // Journey actions
      advanceJourney: (step: JourneyStep) =>
        set(state => ({
          journey: {
            ...state.journey,
            currentStep: step,
            completedSteps: new Set([...state.journey.completedSteps, state.journey.currentStep]),
            expandedSteps: new Set([...state.journey.expandedSteps, step]),
          },
        })),
      toggleStepExpansion: (step: JourneyStep) =>
        set(state => {
          const newExpanded = new Set(state.journey.expandedSteps);
          if (newExpanded.has(step)) {
            newExpanded.delete(step);
          } else {
            newExpanded.add(step);
          }
          return {
            journey: {
              ...state.journey,
              expandedSteps: newExpanded,
            },
          };
        }),
      toggleHowToSubStep: (subStep: HowToSubStep) =>
        set(state => {
          const newCompleted = new Set(state.journey.completedHowToSubSteps);
          if (newCompleted.has(subStep)) {
            newCompleted.delete(subStep);
          } else {
            newCompleted.add(subStep);
          }
          return {
            journey: {
              ...state.journey,
              completedHowToSubSteps: newCompleted,
            },
          };
        }),
      resetJourney: () =>
        set({
          journey: {
            currentStep: 'hero',
            completedSteps: new Set<JourneyStep>(),
            expandedSteps: new Set<JourneyStep>(['hero']),
            completedHowToSubSteps: new Set<HowToSubStep>(),
          },
        }),
      clearData: () =>
        set({
          currentFileName: null,
          uploadStatus: 'idle',
          uploadError: null,
          fileMetadata: null,
          parseWarnings: [],
          fileDiscovery: null,
          filters: new Set<BadgeKey>(),
          journey: {
            currentStep: 'hero',
            completedSteps: new Set<JourneyStep>(),
            expandedSteps: new Set<JourneyStep>(['hero']),
            completedHowToSubSteps: new Set<HowToSubStep>(),
          },
        }),
    }),
    {
      name: 'unfollow-radar-store',
      version: 3, // Increment version for completedHowToSubSteps
      migrate: (persistedState: any, version: number) => {
        // If version is 1 or older, clear all data and start fresh
        if (version <= 1) {
          return {
            filters: new Set<BadgeKey>(),
            currentFileName: null,
            uploadStatus: 'idle' as const,
            uploadError: null,
            fileMetadata: null,
            journey: {
              currentStep: 'hero' as JourneyStep,
              completedSteps: new Set<JourneyStep>(),
              expandedSteps: new Set<JourneyStep>(['hero']),
              completedHowToSubSteps: new Set<HowToSubStep>(),
            },
            _hasHydrated: false,
          };
        }

        // Version 2 -> 3: Add completedHowToSubSteps if missing
        if (version === 2) {
          const state = persistedState as any;
          if (state.journey && !state.journey.completedHowToSubSteps) {
            state.journey.completedHowToSubSteps = new Set<HowToSubStep>();
          }
          return state;
        }

        // For future versions, return the persisted state as-is
        return persistedState;
      },
      partialize: state =>
        ({
          filters: serializeSet(state.filters),
          currentFileName: state.currentFileName,
          uploadStatus: state.uploadStatus,
          uploadError: state.uploadError,
          fileMetadata: state.fileMetadata,
          journey: {
            currentStep: state.journey.currentStep,
            completedSteps: serializeSet(state.journey.completedSteps),
            expandedSteps: serializeSet(state.journey.expandedSteps),
            completedHowToSubSteps: serializeSet(state.journey.completedHowToSubSteps),
          },
        }) as unknown as Partial<AppState>,
      onRehydrateStorage: () => state => {
        if (state) {
          state._hasHydrated = true;
        }
      },
      storage: {
        getItem: name => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const json = JSON.parse(str);
          if (Array.isArray(json.state?.filters)) {
            json.state.filters = deserializeSet(json.state.filters);
          }
          if (json.state?.journey) {
            if (Array.isArray(json.state.journey.completedSteps)) {
              json.state.journey.completedSteps = deserializeSet(json.state.journey.completedSteps);
            }
            if (Array.isArray(json.state.journey.expandedSteps)) {
              json.state.journey.expandedSteps = deserializeSet(json.state.journey.expandedSteps);
            }
            // Ensure completedHowToSubSteps is always a Set (may be missing in old data)
            json.state.journey.completedHowToSubSteps = Array.isArray(
              json.state.journey.completedHowToSubSteps
            )
              ? deserializeSet(json.state.journey.completedHowToSubSteps)
              : new Set<HowToSubStep>();
          }
          return json;
        },
        setItem: (name, value) => {
          const val = { ...value } as any;
          if (val.state?.filters instanceof Set) {
            val.state.filters = serializeSet(val.state.filters);
          }
          localStorage.setItem(name, JSON.stringify(val));
        },
        removeItem: name => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
