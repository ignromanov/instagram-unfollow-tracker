'use client';

import { useEffect, useRef } from 'react';

const BMC_STORAGE_KEY = 'bmc_widget_expanded';
const BMC_WIDGET_ID = 'bmc-wbtn';

interface BuyMeCoffeeWidgetProps {
  /** Trigger to expand the widget panel */
  expandOnSuccess: boolean;
  /** Delay before expanding (ms) */
  delay?: number;
  /** Auto-collapse after this time (ms), 0 = don't collapse */
  autoCollapseAfter?: number;
}

/**
 * Controller for the BuyMeACoffee widget loaded in index.html.
 *
 * The widget button is always visible. This component controls:
 * - Auto-expanding the panel after successful upload
 * - Auto-collapsing after a timeout
 */
export function BuyMeCoffeeWidget({
  expandOnSuccess,
  delay = 3000,
  autoCollapseAfter = 10000,
}: BuyMeCoffeeWidgetProps) {
  const hasExpandedRef = useRef(false);

  useEffect(() => {
    // Don't expand if already expanded this session
    // TODO: uncomment after testing
    // const alreadyExpanded = sessionStorage.getItem(BMC_STORAGE_KEY);
    // if (alreadyExpanded) return;

    // Don't expand if trigger is false
    if (!expandOnSuccess) return;

    // Don't trigger twice
    if (hasExpandedRef.current) return;

    // Delay before expanding
    const expandTimer = setTimeout(() => {
      expandBMCWidget();
      hasExpandedRef.current = true;
      sessionStorage.setItem(BMC_STORAGE_KEY, 'true');

      // Auto-collapse after timeout
      if (autoCollapseAfter > 0) {
        setTimeout(() => {
          collapseBMCWidget();
        }, autoCollapseAfter);
      }
    }, delay);

    return () => clearTimeout(expandTimer);
  }, [expandOnSuccess, delay, autoCollapseAfter]);

  return null; // No React DOM, we control the external widget
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
