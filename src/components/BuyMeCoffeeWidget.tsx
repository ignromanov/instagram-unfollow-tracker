'use client';

import { useEffect, useRef, useCallback } from 'react';

const BMC_STORAGE_KEY = 'bmc_widget_shown_v1';
const BMC_SCRIPT_ID = 'bmc-script';
const BMC_WIDGET_ID = 'bmc-wbtn';

interface BuyMeCoffeeWidgetProps {
  /** Show the widget (controls mounting/unmounting) */
  show: boolean;
  /** Delay before expanding the panel (ms) */
  expandDelay?: number;
  /** Auto-collapse after this time (ms), 0 = don't collapse */
  autoCollapseAfter?: number;
  /** Skip localStorage check (for sample data - show every session) */
  skipStorageCheck?: boolean;
}

/**
 * BuyMeACoffee widget with dynamic script loading.
 *
 * Features:
 * - Loads BMC script only when `show=true`
 * - Removes script and widget on unmount (page navigation)
 * - Timer resets on unmount (navigation cancels pending expand)
 * - localStorage persistence (optional via skipStorageCheck)
 */
export function BuyMeCoffeeWidget({
  show,
  expandDelay = 30000,
  autoCollapseAfter = 10000,
  skipStorageCheck = false,
}: BuyMeCoffeeWidgetProps) {
  const hasExpandedRef = useRef(false);
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    // Clear timers
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    // Remove script
    const script = document.getElementById(BMC_SCRIPT_ID);
    if (script) {
      script.remove();
    }

    // Remove widget button
    const widget = document.getElementById(BMC_WIDGET_ID);
    if (widget) {
      widget.remove();
    }

    // Remove any BMC iframes
    const iframes = document.querySelectorAll('iframe[title*="BMC"]');
    iframes.forEach(iframe => iframe.remove());
  }, []);

  useEffect(() => {
    if (!show) {
      cleanup();
      return;
    }

    // Check localStorage (unless skipped for sample data)
    if (!skipStorageCheck) {
      const alreadyShown = localStorage.getItem(BMC_STORAGE_KEY);
      if (alreadyShown) return;
    }

    // Don't re-expand in same session
    if (hasExpandedRef.current) return;

    // Load BMC script dynamically
    loadBMCScript();

    // Set expand timer
    expandTimerRef.current = setTimeout(() => {
      expandBMCWidget();
      hasExpandedRef.current = true;

      // Save to localStorage (only for non-sample)
      if (!skipStorageCheck) {
        localStorage.setItem(BMC_STORAGE_KEY, 'true');
      }

      // Auto-collapse
      if (autoCollapseAfter > 0) {
        collapseTimerRef.current = setTimeout(() => {
          collapseBMCWidget();
        }, autoCollapseAfter);
      }
    }, expandDelay);

    // Cleanup on unmount or when show changes to false
    return cleanup;
  }, [show, expandDelay, autoCollapseAfter, skipStorageCheck, cleanup]);

  return null;
}

/**
 * Load BMC script dynamically into document head
 */
function loadBMCScript(): void {
  // Don't load twice
  if (document.getElementById(BMC_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = BMC_SCRIPT_ID;
  script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js';
  script.async = true;
  script.setAttribute('data-name', 'BMC-Widget');
  script.setAttribute('data-id', 'ignromanov');
  script.setAttribute('data-description', 'Support privacy-first tools');
  script.setAttribute('data-message', 'Thanks for using a private tool! 🛡️');
  script.setAttribute('data-color', '#6366F1');
  script.setAttribute('data-position', 'Left');
  script.setAttribute('data-x_margin', '18');
  script.setAttribute('data-y_margin', '18');

  script.onload = () => {
    // Dispatch DOMContentLoaded to trigger BMC widget initialization
    const evt = document.createEvent('Event');
    evt.initEvent('DOMContentLoaded', false, false);
    window.dispatchEvent(evt);
  };

  document.head.appendChild(script);
}

/**
 * Expand the BMC widget panel by clicking the button
 */
function expandBMCWidget(): void {
  const widget = document.getElementById(BMC_WIDGET_ID);
  if (widget) {
    const button = widget.querySelector('button') || widget;
    if (button instanceof HTMLElement) {
      button.click();
    }
  }
}

/**
 * Collapse the BMC widget panel
 */
function collapseBMCWidget(): void {
  const widget = document.getElementById(BMC_WIDGET_ID);
  if (widget) {
    const button = widget.querySelector('button') || widget;
    if (button instanceof HTMLElement) {
      button.click();
    }
  }
}
