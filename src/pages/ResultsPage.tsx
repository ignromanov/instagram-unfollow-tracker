import { AccountListSection } from '@/components/AccountListSection';
import { Hero } from '@/components/Hero';
import { useInstagramData } from '@/hooks/useInstagramData';
import { useLanguagePrefix } from '@/hooks/useLanguagePrefix';
import { useNavigate } from 'react-router-dom';

/**
 * Results page (account list)
 * NOT prerendered - requires user data from IndexedDB
 * Falls back to Hero if no data available
 */
export function Component() {
  const navigate = useNavigate();
  const prefix = useLanguagePrefix();
  const { uploadState, fileMetadata } = useInstagramData();

  const hasResults =
    uploadState.status === 'success' &&
    fileMetadata !== null &&
    Boolean(fileMetadata.fileHash) &&
    typeof fileMetadata.accountCount === 'number';

  // Fallback handlers for Hero
  const handleStartGuide = () => {
    navigate(`${prefix}/wizard`);
  };

  const handleLoadSample = () => {
    navigate(`${prefix}/sample`);
  };

  const handleUploadDirect = () => {
    navigate(`${prefix}/upload`);
  };

  // Show results if data available
  if (hasResults && fileMetadata) {
    return (
      <AccountListSection
        fileHash={fileMetadata.fileHash!}
        accountCount={fileMetadata.accountCount!}
        filename={fileMetadata.name}
        isSample={false}
      />
    );
  }

  // Fallback to Hero if no data
  return (
    <Hero
      onStartGuide={handleStartGuide}
      onLoadSample={handleLoadSample}
      onUploadDirect={handleUploadDirect}
      hasData={false}
    />
  );
}

export default Component;
