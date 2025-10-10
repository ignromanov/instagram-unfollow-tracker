'use client';

import { useInstagramData } from '@/hooks/useInstagramData';
import { FileUpload } from './FileUpload';

interface FileUploadSectionProps {
  onHelpClick: () => void;
}

export function FileUploadSection({ onHelpClick }: FileUploadSectionProps) {
  const { uploadState, handleZipUpload } = useInstagramData();

  const handleFileSelect = async (file: File) => {
    try {
      await handleZipUpload(file);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <FileUpload
      onFileSelect={handleFileSelect}
      isLoading={uploadState.status === 'loading'}
      error={uploadState.error}
      onHelpClick={onHelpClick}
    />
  );
}
