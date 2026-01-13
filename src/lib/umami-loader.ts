/**
 * Umami Analytics Loader
 *
 * Loads Umami analytics script dynamically with user opt-out support.
 * Respects user privacy preferences via localStorage.
 */

export function loadUmami(): void {
  // Respect user opt-out
  if (typeof localStorage !== 'undefined' && localStorage.getItem('umami-opt-out') === 'true') {
    return;
  }

  // Only load in browser
  if (typeof document === 'undefined') return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://cloud.umami.is/script.js';
  script.dataset.websiteId = '48136699-8e66-4397-bf85-89f46b28fc6d';
  document.head.appendChild(script);
}
