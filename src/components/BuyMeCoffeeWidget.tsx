'use client';

import { useEffect, useRef } from 'react';

const BMC_STORAGE_KEY = 'bmc_widget_shown_v1';
const BMC_WIDGET_ID = 'bmc-wbtn';

interface BuyMeCoffeeWidgetProps {
  /** Trigger to expand the widget panel (e.g., file upload success) */
  expandOnSuccess: boolean;
  /** Whether this is sample/demo data */
  isSample: boolean;
  /** Delay before expanding for real uploads (ms) */
  delay?: number;
  /** Delay before expanding for sample data (ms) */
  sampleDelay?: number;
  /** Auto-collapse after this time (ms), 0 = don't collapse */
  autoCollapseAfter?: number;
}

/**
 * Controller for the BuyMeACoffee widget loaded in index.html.
 *
 * The widget button is always visible. This component controls:
 * - Auto-expanding the panel on first real file upload (not sample data)
 * - Auto-collapsing after a timeout
 * - One-time behavior persisted in localStorage
 */
export function BuyMeCoffeeWidget({
  expandOnSuccess,
  isSample,
  delay = 3000,
  sampleDelay = 30000,
  autoCollapseAfter = 10000,
}: BuyMeCoffeeWidgetProps) {
  const hasExpandedRef = useRef(false);
  const hasExpandedSampleRef = useRef(false);

  // Effect for real uploads
  useEffect(() => {
    if (isSample) return;

    const alreadyShown = localStorage.getItem(BMC_STORAGE_KEY);
    if (alreadyShown) return;

    if (!expandOnSuccess) return;
    if (hasExpandedRef.current) return;

    const expandTimer = setTimeout(() => {
      expandBMCWidget();
      hasExpandedRef.current = true;
      localStorage.setItem(BMC_STORAGE_KEY, 'true');

      if (autoCollapseAfter > 0) {
        setTimeout(() => {
          collapseBMCWidget();
        }, autoCollapseAfter);
      }
    }, delay);

    return () => clearTimeout(expandTimer);
  }, [expandOnSuccess, isSample, delay, autoCollapseAfter]);

  // Effect for sample data (separate, longer delay)
  useEffect(() => {
    if (!isSample) return;
    if (hasExpandedSampleRef.current) return;

    const expandTimer = setTimeout(() => {
      expandBMCWidget();
      hasExpandedSampleRef.current = true;

      if (autoCollapseAfter > 0) {
        setTimeout(() => {
          collapseBMCWidget();
        }, autoCollapseAfter);
      }
    }, sampleDelay);

    return () => clearTimeout(expandTimer);
  }, [isSample, sampleDelay, autoCollapseAfter]);

  return null;
}

/**
 * Expand the BMC widget panel by clicking the button
 */
function expandBMCWidget(): void {
  const widget = document.getElementById(BMC_WIDGET_ID);
  if (widget) {
    // BMC widget uses a button inside, click it to expand
    const button = widget.querySelector('button') || widget;
    if (button instanceof HTMLElement) {
      button.click();
      console.log('[BMC Widget] Expanded');
    }
  } else {
    console.warn('[BMC Widget] Element not found');
  }
}

/**
 * Collapse the BMC widget panel by clicking the close button or the widget again
 */
function collapseBMCWidget(): void {
  // BMC creates an iframe when expanded, look for the close mechanism
  const widget = document.getElementById(BMC_WIDGET_ID);
  if (widget) {
    // Clicking the widget button again should toggle/close it
    const button = widget.querySelector('button') || widget;
    if (button instanceof HTMLElement) {
      button.click();
      console.log('[BMC Widget] Collapsed');
    }
  }
}
