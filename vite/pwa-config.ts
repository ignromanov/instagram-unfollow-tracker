import type { VitePWAOptions } from 'vite-plugin-pwa';

/**
 * PWA configuration for Safe Unfollow app
 * Includes manifest, service worker, and caching strategies
 */
export const pwaConfig: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: [
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'logo.svg',
  ],
  manifest: {
    name: 'Safe Unfollow - Instagram Tracker',
    short_name: 'Safe Unfollow',
    description: 'Check who unfollowed you on Instagram - 100% private, no login required',
    theme_color: '#4E7EF5',
    background_color: '#0a0a0a',
    display: 'standalone',
    start_url: '/',
    icons: [
      {
        src: 'android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    // Don't precache large sample data
    globIgnores: ['**/sample-data.json'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
};
