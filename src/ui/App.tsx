'use client';

import { useEffect, useState, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';

import { AppState } from '@/core/types';
import { Hero } from '@/components/Hero';
import { HeaderV2 } from '@/components/HeaderV2';
import { Wizard } from '@/components/Wizard';
import { WaitingDashboard } from '@/components/WaitingDashboard';
import { UploadZone } from '@/components/UploadZone';
import { AccountListSection } from '@/components/AccountListSection';
import { HowToSection } from '@/components/HowToSection';
import { FAQSection } from '@/components/FAQSection';
import { FooterCTA } from '@/components/FooterCTA';
import { Footer } from '@/components/Footer';
import { BuyMeCoffeeWidget } from '@/components/BuyMeCoffeeWidget';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';
import { TermsOfService } from '@/components/TermsOfService';
import { useHydration } from '@/hooks/useHydration';
import { useInstagramData } from '@/hooks/useInstagramData';
import { useSampleData } from '@/hooks/useSampleData';

/**
 * V3 App with hash-based routing
 *
 * Routes:
 * - #        -> Hero (landing)
 * - #wizard  -> Step-by-step guide
 * - #waiting -> Waiting for Instagram email
 * - #upload  -> File upload zone
 * - #results -> Account list results
 * - #sample  -> Load sample data and show results
 */
export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<AppState>(AppState.HERO);
  const [showWizard, setShowWizard] = useState(false);
  const hasHydrated = useHydration();

  const { uploadState, handleZipUpload, handleClearData, fileMetadata, parseWarnings } =
    useInstagramData();
  const { load: loadSampleData, state: sampleState, data: sampleData } = useSampleData();

  // Track if sample load has been triggered to prevent duplicate calls
  const sampleLoadTriggeredRef = useRef(false);

  const hasResults = uploadState.status === 'success' && fileMetadata !== null;
  const hasSampleData = sampleState === 'success' && sampleData !== null;

  // Hash Router
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');

      // Scroll to top on every hash change
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Wizard deep links: #wizard/step/X
      if (hash.startsWith('wizard')) {
        setShowWizard(true);
        return;
      }

      // Close wizard when navigating away
      setShowWizard(false);

      // Sample path - show sample data (separate from user data)
      if (hash === 'sample') {
        setActiveScreen(AppState.SAMPLE);
        return;
      }

      const routes: Record<string, AppState> = {
        '': AppState.HERO,
        waiting: AppState.WAITING,
        upload: AppState.UPLOAD,
        results: AppState.RESULTS,
        sample: AppState.SAMPLE,
        privacy: AppState.PRIVACY,
        terms: AppState.TERMS,
      };

      const newScreen = routes[hash] ?? AppState.HERO;

      // Guard: Prevent going to results without data
      // User must explicitly navigate to #results after successful upload
      if (newScreen === AppState.RESULTS && !hasResults) {
        setActiveScreen(AppState.UPLOAD);
        window.location.hash = 'upload';
        return;
      }

      // Allow user to stay on HERO even with loaded data
      // No forced redirect - user controls navigation
      setActiveScreen(newScreen);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [hasResults]);

  // Navigation helpers
  const navigateTo = (screen: AppState) => {
    const hash = screen === AppState.HERO ? '' : screen.toLowerCase();
    window.location.hash = hash;
  };

  // Auto-navigate to results ONLY after successful upload (not on page load)
  useEffect(() => {
    if (uploadState.status === 'success' && activeScreen === AppState.UPLOAD) {
      navigateTo(AppState.RESULTS);
    }
  }, [uploadState.status, activeScreen]);

  // Handlers
  const handleStartGuide = (stepIndex?: number) => {
    const step = stepIndex !== undefined ? stepIndex + 1 : 1;
    window.location.hash = `wizard/step/${step}`;
  };

  const handleLoadSample = () => {
    window.location.hash = 'sample';
  };

  const handleUploadDirect = () => {
    navigateTo(AppState.UPLOAD);
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    navigateTo(AppState.WAITING);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    navigateTo(AppState.HERO);
  };

  const handleUploadStart = (file: File) => {
    handleZipUpload(file);
  };

  const handleClear = () => {
    handleClearData();
    navigateTo(AppState.HERO);
  };

  // Render current screen
  const renderScreen = () => {
    switch (activeScreen) {
      case AppState.HERO:
        return (
          <Hero
            onStartGuide={handleStartGuide}
            onLoadSample={handleLoadSample}
            onUploadDirect={handleUploadDirect}
            hasData={hasResults}
            onContinue={() => navigateTo(AppState.RESULTS)}
          />
        );

      case AppState.WAITING:
        return (
          <WaitingDashboard
            onUploadNow={() => navigateTo(AppState.UPLOAD)}
            onSkip={() => navigateTo(AppState.HERO)}
          />
        );

      case AppState.UPLOAD:
        return (
          <UploadZone
            onUploadStart={handleUploadStart}
            onBack={() => navigateTo(AppState.WAITING)}
            onOpenWizard={() => handleStartGuide(0)}
            isProcessing={uploadState.status === 'loading'}
            error={uploadState.error}
            parseWarnings={parseWarnings}
          />
        );

      case AppState.RESULTS:
        return hasResults && fileMetadata ? (
          <AccountListSection
            fileHash={fileMetadata.fileHash!}
            accountCount={fileMetadata.accountCount!}
            filename={fileMetadata.name}
            isSample={false}
          />
        ) : (
          <Hero
            onStartGuide={handleStartGuide}
            onLoadSample={handleLoadSample}
            onUploadDirect={handleUploadDirect}
            hasData={hasResults}
            onContinue={() => navigateTo(AppState.RESULTS)}
          />
        );

      case AppState.SAMPLE:
        // Trigger sample data load on first visit
        if (sampleState === 'idle' && !sampleLoadTriggeredRef.current) {
          sampleLoadTriggeredRef.current = true;
          loadSampleData().catch(() => {
            sampleLoadTriggeredRef.current = false;
          });
        }

        // Loading state
        if (sampleState === 'loading' || sampleState === 'idle') {
          return (
            <div className="flex-1 flex items-center justify-center py-24">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-1">Loading sample data...</p>
                <p className="text-sm text-muted-foreground">Preparing 1,180 demo accounts</p>
              </div>
            </div>
          );
        }

        // Error state
        if (sampleState === 'error') {
          return (
            <div className="flex-1 flex items-center justify-center py-24">
              <div className="text-center">
                <p className="text-destructive mb-4">Failed to generate sample data</p>
                <button
                  onClick={() => {
                    sampleLoadTriggeredRef.current = false;
                    loadSampleData();
                  }}
                  className="text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          );
        }

        // Success - show sample data
        return hasSampleData && sampleData ? (
          <AccountListSection
            fileHash={sampleData.fileHash}
            accountCount={sampleData.accountCount}
            filename="Sample Data (Demo)"
            isSample={true}
          />
        ) : null;

      case AppState.PRIVACY:
        return <PrivacyPolicy onBack={() => navigateTo(AppState.HERO)} />;

      case AppState.TERMS:
        return <TermsOfService onBack={() => navigateTo(AppState.HERO)} />;

      default:
        return (
          <Hero
            onStartGuide={handleStartGuide}
            onLoadSample={handleLoadSample}
            onUploadDirect={handleUploadDirect}
            hasData={hasResults}
            onContinue={() => navigateTo(AppState.RESULTS)}
          />
        );
    }
  };

  // Show SEO sections on landing-type screens
  const showSEOSections =
    activeScreen === AppState.HERO ||
    activeScreen === AppState.UPLOAD ||
    activeScreen === AppState.WAITING;

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
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      <HeaderV2
        hasData={hasResults}
        activeScreen={activeScreen}
        onViewResults={() => navigateTo(AppState.RESULTS)}
        onClear={handleClear}
        onUpload={() => navigateTo(AppState.UPLOAD)}
        onLogoClick={() => navigateTo(AppState.HERO)}
      />

      <main id="main-content" className="flex-1 container mx-auto px-4">
        {renderScreen()}

        {showSEOSections && (
          <div className="animate-in fade-in duration-1000">
            <HowToSection onStart={handleStartGuide} />
            <FAQSection />
            <FooterCTA onStart={handleStartGuide} onSample={handleLoadSample} />
          </div>
        )}
      </main>

      <Footer />

      {/* Wizard Modal */}
      {showWizard && <Wizard onComplete={handleWizardComplete} onCancel={handleWizardCancel} />}

      {/* BMC Widget - shows only on results pages, expands after 30s */}
      <BuyMeCoffeeWidget
        show={activeScreen === AppState.RESULTS || activeScreen === AppState.SAMPLE}
        expandDelay={30000}
        autoCollapseAfter={10000}
        skipStorageCheck={activeScreen === AppState.SAMPLE}
      />

      <Analytics />
    </div>
  );
};
