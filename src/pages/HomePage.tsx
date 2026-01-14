import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

import { Hero } from '@/components/Hero';
import { useInstagramData } from '@/hooks/useInstagramData';
import { useLanguagePrefix } from '@/hooks/useLanguagePrefix';

// Lazy load below-the-fold sections for code splitting
const HowToSection = lazy(() =>
  import('@/components/HowToSection').then(m => ({ default: m.HowToSection }))
);
const FAQSection = lazy(() =>
  import('@/components/FAQSection').then(m => ({ default: m.FAQSection }))
);
const FooterCTA = lazy(() =>
  import('@/components/FooterCTA').then(m => ({ default: m.FooterCTA }))
);

function SectionSkeleton() {
  return <div className="h-96 animate-pulse rounded-lg bg-muted/30" />;
}

/**
 * Home page (landing)
 * Prerendered for SEO with Hero, HowTo, FAQ sections
 */
export function Component() {
  const navigate = useNavigate();
  const prefix = useLanguagePrefix();
  const { uploadState, fileMetadata } = useInstagramData();

  const hasResults = uploadState.status === 'success' && fileMetadata !== null;

  const handleStartGuide = (stepIndex?: number) => {
    const step = stepIndex !== undefined ? stepIndex + 1 : 1;
    navigate(`${prefix}/wizard/step/${step}`);
  };

  const handleLoadSample = () => {
    navigate(`${prefix}/sample`);
  };

  const handleUploadDirect = () => {
    navigate(`${prefix}/upload`);
  };

  const handleContinue = () => {
    navigate(`${prefix}/results`);
  };

  return (
    <>
      <Hero
        onStartGuide={handleStartGuide}
        onLoadSample={handleLoadSample}
        onUploadDirect={handleUploadDirect}
        hasData={hasResults}
        onContinue={handleContinue}
      />
      <div className="animate-in fade-in duration-1000">
        <Suspense fallback={<SectionSkeleton />}>
          <HowToSection onStart={handleStartGuide} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <FAQSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <FooterCTA onStart={handleStartGuide} onSample={handleLoadSample} />
        </Suspense>
      </div>
    </>
  );
}

export default Component;
