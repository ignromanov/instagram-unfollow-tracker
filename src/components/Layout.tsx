import { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

import { AppState } from '@/core/types';
import { ThemeProvider } from '@/components/theme-provider';
import { HeaderV2 } from '@/components/HeaderV2';
import { Footer } from '@/components/Footer';
import { BuyMeCoffeeWidget } from '@/components/BuyMeCoffeeWidget';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { OrganizationSchema } from '@/components/OrganizationSchema';
import { PageLoader } from '@/components/PageLoader';
import { useHydration } from '@/hooks/useHydration';
import { useInstagramData } from '@/hooks/useInstagramData';
import { useLanguageFromPath } from '@/hooks/useLanguageFromPath';
import { useLanguagePrefix } from '@/hooks/useLanguagePrefix';
import { analytics } from '@/lib/analytics';
import { RTL_LANGUAGES, type SupportedLanguage } from '@/locales';

interface LayoutProps {
  lang?: SupportedLanguage;
}

type PageName =
  | 'hero'
  | 'wizard'
  | 'waiting'
  | 'upload'
  | 'results'
  | 'sample'
  | 'privacy'
  | 'terms';

/**
 * Map pathname to page name for analytics
 */
function getPageNameFromPath(pathname: string): PageName {
  if (pathname.endsWith('/results')) return 'results';
  if (pathname.endsWith('/upload')) return 'upload';
  if (pathname.endsWith('/wizard')) return 'wizard';
  if (pathname.endsWith('/waiting')) return 'waiting';
  if (pathname.endsWith('/sample')) return 'sample';
  if (pathname.endsWith('/privacy')) return 'privacy';
  if (pathname.endsWith('/terms')) return 'terms';
  return 'hero';
}

/**
 * Map pathname to AppState for header highlighting
 */
function getActiveScreen(pathname: string): AppState {
  if (pathname.endsWith('/results')) return AppState.RESULTS;
  if (pathname.endsWith('/upload')) return AppState.UPLOAD;
  if (pathname.endsWith('/wizard')) return AppState.WIZARD;
  if (pathname.endsWith('/waiting')) return AppState.WAITING;
  if (pathname.endsWith('/sample')) return AppState.SAMPLE;
  if (pathname.endsWith('/privacy')) return AppState.PRIVACY;
  if (pathname.endsWith('/terms')) return AppState.TERMS;
  return AppState.HERO;
}

/**
 * Root layout component for all pages
 * Handles:
 * - Theme provider wrapper
 * - Header and Footer
 * - Language sync from URL path
 * - Loading states
 * - BMC widget display
 */
export function Layout({ lang }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasHydrated = useHydration();
  const { uploadState, handleClearData, fileMetadata } = useInstagramData();

  // Sync language from URL path (e.g., /es/wizard -> Spanish)
  useLanguageFromPath(lang);

  // Get language prefix for navigation
  const prefix = useLanguagePrefix();

  // Determine text direction for RTL languages (Arabic, etc.)
  const isRTL = lang ? RTL_LANGUAGES.includes(lang) : false;

  const hasResults = uploadState.status === 'success' && fileMetadata !== null;
  const activeScreen = getActiveScreen(location.pathname);

  // Determine current screen for BMC widget
  const isResultsPage =
    location.pathname.endsWith('/results') || location.pathname.endsWith('/sample');

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Track page views
  useEffect(() => {
    const pageName = getPageNameFromPath(location.pathname);
    analytics.pageView(pageName, lang);
  }, [location.pathname, lang]);

  // Navigation handlers
  const handleViewResults = () => navigate(`${prefix}/results`);
  const handleUpload = () => navigate(`${prefix}/upload`);
  const handleLogoClick = () => navigate(`${prefix}/`);
  const handleClear = () => {
    handleClearData();
    navigate(`${prefix}/`);
  };

  // Loading state
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <HeaderV2 />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {/* SEO canonical/hreflang are injected at build time via vite.config.ts onPageRendered hook */}
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="min-h-screen bg-background flex flex-col transition-colors duration-300"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:inset-inline-start-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>

        <HeaderV2
          hasData={hasResults}
          activeScreen={activeScreen}
          onViewResults={handleViewResults}
          onUpload={handleUpload}
          onLogoClick={handleLogoClick}
          onClear={handleClear}
        />

        <main id="main-content" className="flex-1 container mx-auto px-4">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>

        <Footer />

        {/* BMC Widget - shows only on results pages, auto-open disabled */}
        <BuyMeCoffeeWidget
          show={isResultsPage}
          expandDelay={999999999}
          autoCollapseAfter={10000}
          skipStorageCheck={location.pathname.endsWith('/sample')}
        />

        <Analytics />

        {/* Structured data for SEO */}
        <BreadcrumbSchema />
        <OrganizationSchema />
      </div>
    </ThemeProvider>
  );
}

export default Layout;
