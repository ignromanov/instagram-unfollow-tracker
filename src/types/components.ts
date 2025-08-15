import type { BadgeKey } from '@/core/types';

// Common component prop types
export interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'red';
}

export interface HeaderProps {
  stats: {
    following: number;
    followers: number;
    mutuals: number;
    notFollowingBack: number;
  };
  hasData: boolean;
  onHelpClick: () => void;
  onClearData?: () => void;
  fileName?: string;
  fileSize?: number;
  uploadDate?: Date | string;
}

export interface AccountListProps {
  accountIndices: number[];
  hasLoadedData: boolean;
  isLoading?: boolean;
}

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
  onHelpClick: () => void;
}

export interface FilterChipsProps {
  selectedFilters: Set<BadgeKey>;
  onFiltersChange: (filters: Set<BadgeKey>) => void;
  filterCounts: Record<BadgeKey, number>;
  isFiltering?: boolean;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
  isFiltering?: boolean;
  processingTime?: number;
}

export interface HelpButtonProps {
  onClick: () => void;
}

export interface InstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface LogoProps {
  size?: number;
  className?: string;
}
