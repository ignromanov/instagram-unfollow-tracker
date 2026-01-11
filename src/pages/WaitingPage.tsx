import { useNavigate } from 'react-router-dom';
import { WaitingDashboard } from '@/components/WaitingDashboard';
import { HowToSection } from '@/components/HowToSection';
import { FAQSection } from '@/components/FAQSection';
import { FooterCTA } from '@/components/FooterCTA';
import { useLanguagePrefix } from '@/hooks/useLanguagePrefix';

/**
 * Waiting page (waiting for Instagram email)
 * Prerendered for SEO
 */
export function Component() {
  const navigate = useNavigate();
  const prefix = useLanguagePrefix();

  const handleUploadNow = () => {
    navigate(`${prefix}/upload`);
  };

  const handleSkip = () => {
    navigate(`${prefix}/`);
  };

  const handleStartGuide = () => {
    navigate(`${prefix}/wizard`);
  };

  const handleLoadSample = () => {
    navigate(`${prefix}/sample`);
  };

  return (
    <>
      <WaitingDashboard onUploadNow={handleUploadNow} onSkip={handleSkip} />
      <div className="animate-in fade-in duration-1000">
        <HowToSection onStart={handleStartGuide} />
        <FAQSection />
        <FooterCTA onStart={handleStartGuide} onSample={handleLoadSample} />
      </div>
    </>
  );
}

export default Component;
