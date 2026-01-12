import { useNavigate } from 'react-router-dom';
import { Hero } from '@/components/Hero';
import { HowToSection } from '@/components/HowToSection';
import { FAQSection } from '@/components/FAQSection';
import { FooterCTA } from '@/components/FooterCTA';
import { useInstagramData } from '@/hooks/useInstagramData';
import { useLanguagePrefix } from '@/hooks/useLanguagePrefix';

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
        <HowToSection onStart={handleStartGuide} />
        <FAQSection />
        <FooterCTA onStart={handleStartGuide} onSample={handleLoadSample} />
      </div>
    </>
  );
}

export default Component;
