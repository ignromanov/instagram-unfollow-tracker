import { useEffect, useCallback, useRef } from 'react';
import { type JourneyStep, type HowToSubStep, useAppStore } from '@/lib/store';

// Valid hash values that map to journey steps
const VALID_JOURNEY_HASHES: JourneyStep[] = ['hero', 'how-to', 'upload', 'results'];

// Valid hash values for how-to sub-steps
const VALID_SUBSTEP_HASHES: HowToSubStep[] = [
  'opening-settings',
  'selecting-data',
  'downloading',
  'uploading-analyzing',
];

function isValidJourneyStep(hash: string): hash is JourneyStep {
  return VALID_JOURNEY_HASHES.includes(hash as JourneyStep);
}

function isValidHowToSubStep(hash: string): hash is HowToSubStep {
  return VALID_SUBSTEP_HASHES.includes(hash as HowToSubStep);
}

function getHashFromUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hash.replace('#', '');
}

function setHashInUrl(hash: string): void {
  if (typeof window === 'undefined') return;

  // Only set hash for non-hero steps, hero is the default
  if (hash === 'hero' || !hash) {
    // Remove hash for hero step (clean URL)
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  } else {
    window.history.pushState(null, '', `#${hash}`);
  }
}

function scrollToSection(id: string): void {
  if (typeof window === 'undefined') return;

  // Small delay to allow DOM updates and accordion animations
  setTimeout(() => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, 150);
}

/**
 * Navigate to a how-to sub-step with hash update and scroll
 */
export function navigateToSubStep(subStep: HowToSubStep): void {
  setHashInUrl(subStep);
  scrollToSection(subStep);
}

/**
 * Syncs URL hash with journey state for deep linking and browser navigation.
 *
 * Journey steps:
 * - / or /#hero -> hero step
 * - /#how-to -> how-to step
 * - /#upload -> upload step
 * - /#results -> results step (only if data loaded)
 *
 * How-to sub-steps (within how-to section):
 * - /#opening-settings
 * - /#selecting-data
 * - /#downloading
 * - /#uploading-analyzing
 */
export function useJourneyHash(): void {
  const currentStep = useAppStore(s => s.journey.currentStep);
  const advanceJourney = useAppStore(s => s.advanceJourney);
  const fileMetadata = useAppStore(s => s.fileMetadata);
  const hasHydrated = useAppStore(s => s._hasHydrated);
  const hasData = !!fileMetadata && (fileMetadata.accountCount || 0) > 0;

  // Track previous step to detect changes for scroll
  const prevStepRef = useRef<JourneyStep | null>(null);
  // Track if initial hash navigation was done
  const initialHashHandledRef = useRef(false);

  // Store current values in refs to avoid stale closures
  const currentStepRef = useRef(currentStep);
  const hasDataRef = useRef(hasData);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    hasDataRef.current = hasData;
  }, [hasData]);

  // Navigate to step from hash (stable function using refs)
  const navigateToHash = useCallback(
    (hash: string, shouldScroll = true) => {
      if (!hash || hash === 'hero') {
        // No hash or hero hash - go to hero
        if (currentStepRef.current !== 'hero') {
          advanceJourney('hero');
        }
        if (shouldScroll) scrollToSection('hero');
        return;
      }

      // Check if it's a how-to sub-step hash
      if (isValidHowToSubStep(hash)) {
        // Navigate to how-to section first, then scroll to sub-step
        if (currentStepRef.current !== 'how-to') {
          advanceJourney('how-to');
        }
        if (shouldScroll) scrollToSection(hash);
        return;
      }

      if (!isValidJourneyStep(hash)) {
        return;
      }

      // Don't navigate to results if no data
      if (hash === 'results' && !hasDataRef.current) {
        advanceJourney('upload');
        setHashInUrl('upload');
        if (shouldScroll) scrollToSection('upload');
        return;
      }

      if (currentStepRef.current !== hash) {
        advanceJourney(hash);
      }
      if (shouldScroll) scrollToSection(hash);
    },
    [advanceJourney]
  ); // Only depends on stable advanceJourney

  // On mount: read hash from URL and navigate (runs once)
  useEffect(() => {
    if (!hasHydrated || initialHashHandledRef.current) return;

    initialHashHandledRef.current = true;
    const hash = getHashFromUrl();
    if (hash) {
      navigateToHash(hash, true);
    }
  }, [hasHydrated, navigateToHash]);

  // Update URL hash and scroll when journey step changes
  useEffect(() => {
    if (!hasHydrated) return;

    setHashInUrl(currentStep);

    // Scroll to section when step changes (not on initial mount)
    if (prevStepRef.current !== null && prevStepRef.current !== currentStep) {
      scrollToSection(currentStep);
    }
    prevStepRef.current = currentStep;
  }, [currentStep, hasHydrated]);

  // Listen to browser back/forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const hash = getHashFromUrl();
      navigateToHash(hash, true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigateToHash]);
}
