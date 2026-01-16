import { FAQSection } from '@/components/FAQSection';
import { FooterCTA } from '@/components/FooterCTA';
import { HowToSection } from '@/components/HowToSection';
import { PageLoader } from '@/components/PageLoader';
import { UploadZone } from '@/components/UploadZone';
import { useInstagramData } from '@/hooks/useInstagramData';
import { useLanguagePrefix } from '@/hooks/useLanguagePrefix';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Upload page
 * Prerendered for SEO - shows upload zone and instructions
 */
export function Component() {
  const navigate = useNavigate();
  const prefix = useLanguagePrefix();
  const { uploadState, handleZipUpload, parseWarnings } = useInstagramData();

  // Auto-navigate to results after successful upload
  useEffect(() => {
    if (uploadState.status === 'success') {
      navigate(`${prefix}/results`, { replace: true });
    }
  }, [uploadState.status, navigate, prefix]);

  // Show loader during redirect to prevent flash of upload page
  if (uploadState.status === 'success') {
    return <PageLoader />;
  }

  const handleUploadStart = (file: File) => {
    handleZipUpload(file);
  };

  const handleBack = () => {
    navigate(`${prefix}/wizard`);
  };

  const handleOpenWizard = () => {
    navigate(`${prefix}/wizard/step/6`);
  };

  const handleStartGuide = () => {
    navigate(`${prefix}/wizard`);
  };

  const handleLoadSample = () => {
    navigate(`${prefix}/sample`);
  };

  return (
    <>
      <UploadZone
        onUploadStart={handleUploadStart}
        onBack={handleBack}
        onOpenWizard={handleOpenWizard}
        isProcessing={uploadState.status === 'loading'}
        error={uploadState.error}
        parseWarnings={parseWarnings}
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
