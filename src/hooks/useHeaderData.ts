import { useInstagramData } from './useInstagramData';
import { useAccountFiltering } from './useAccountFiltering';

/**
 * @deprecated This hook is part of V2 architecture.
 * V3 uses HeaderV2 component with props-based data flow.
 */
export function useHeaderData() {
  const { fileMetadata, handleClearData, uploadState } = useInstagramData();

  // V2 compatibility: get fileHash from store for legacy components
  const fileHash = fileMetadata?.fileHash ?? null;
  const accountCount = fileMetadata?.accountCount ?? 0;

  const { clearFilters, filterCounts } = useAccountFiltering({ fileHash, accountCount });

  const handleClearDataWrapper = () => {
    handleClearData();
    clearFilters();
  };

  // Show clear button if we have data OR if we're currently loading
  const hasData = !!fileMetadata && (fileMetadata.accountCount || 0) > 0;
  const shouldShowClearButton = hasData || uploadState.status === 'loading';

  return {
    hasData,
    shouldShowClearButton,
    fileName: fileMetadata?.name,
    fileSize: fileMetadata?.size,
    uploadDate: fileMetadata?.uploadDate,
    uploadStatus: uploadState.status,
    stats: {
      following: filterCounts.following || 0,
      followers: filterCounts.followers || 0,
      mutuals: filterCounts.mutuals || 0,
      notFollowingBack: filterCounts.notFollowingBack || 0,
    },
    onClearData: handleClearDataWrapper,
  };
}
