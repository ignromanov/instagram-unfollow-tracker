import type { RouteRecord } from 'vite-react-ssg';
import React from 'react';
import { Layout } from '@/components/Layout';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/locales';

/**
 * Route definitions for SSG prerendering
 *
 * Structure:
 * - / (hero)
 * - /wizard (step-by-step export guide)
 * - /upload (file upload)
 * - /results (client-only, not prerendered - requires user data)
 * - /sample
 * - /privacy
 * - /terms
 *
 * Each route also has language variants:
 * - /es, /es/wizard, /es/upload, etc.
 * - /ru, /ru/wizard, /ru/upload, etc.
 */
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    entry: 'src/components/Layout.tsx',
    children: [
      // Hero (landing page)
      {
        index: true,
        lazy: () => import('./pages/HomePage'),
      },
      // Wizard (step-by-step guide)
      {
        path: 'wizard',
        lazy: () => import('./pages/WizardPage'),
      },
      // Wizard step deep links (e.g., /wizard/step/8 for calendar reminder)
      {
        path: 'wizard/step/:stepId',
        lazy: () => import('./pages/WizardPage'),
      },
      // Upload
      {
        path: 'upload',
        lazy: () => import('./pages/UploadPage'),
      },
      // Results (client-only - requires IndexedDB data)
      {
        path: 'results',
        lazy: () => import('./pages/ResultsPage'),
      },
      // Sample data demo
      {
        path: 'sample',
        lazy: () => import('./pages/SamplePage'),
      },
      // Privacy Policy
      {
        path: 'privacy',
        lazy: () => import('./pages/PrivacyPage'),
      },
      // Terms of Service
      {
        path: 'terms',
        lazy: () => import('./pages/TermsPage'),
      },
    ],
  },
  // Language-prefixed routes (es, ru, de, etc.)
  ...SUPPORTED_LANGUAGES.filter(lang => lang !== 'en').map(
    (lang): RouteRecord => ({
      path: `/${lang}`,
      element: <Layout lang={lang} />,
      entry: 'src/components/Layout.tsx',
      children: [
        {
          index: true,
          lazy: () => import('./pages/HomePage'),
        },
        {
          path: 'wizard',
          lazy: () => import('./pages/WizardPage'),
        },
        {
          path: 'wizard/step/:stepId',
          lazy: () => import('./pages/WizardPage'),
        },
        {
          path: 'upload',
          lazy: () => import('./pages/UploadPage'),
        },
        {
          path: 'results',
          lazy: () => import('./pages/ResultsPage'),
        },
        {
          path: 'sample',
          lazy: () => import('./pages/SamplePage'),
        },
        {
          path: 'privacy',
          lazy: () => import('./pages/PrivacyPage'),
        },
        {
          path: 'terms',
          lazy: () => import('./pages/TermsPage'),
        },
      ],
    })
  ),
];

export type { SupportedLanguage };
