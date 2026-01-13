import { vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@tests/utils/testUtils';
import uploadEN from '@/locales/en/upload.json';
import { createI18nMock } from '@/__tests__/utils/mockI18n';

vi.mock('react-i18next', () => createI18nMock(uploadEN));

import { FileUploadSection } from '@/components/FileUploadSection';
import { useInstagramData } from '@/hooks/useInstagramData';

// Mock the useInstagramData hook
vi.mock('@/hooks/useInstagramData');

const mockUseInstagramData = vi.mocked(useInstagramData);

describe('FileUploadSection', () => {
  const mockOnHelpClick = vi.fn();
  const mockHandleZipUpload = vi.fn();
  const mockHandleClearData = vi.fn();

  // Helper function to create mock return value
  const createMockReturnValue = (overrides = {}) => ({
    uploadState: { status: 'idle' as const, error: null, fileName: null },
    handleZipUpload: mockHandleZipUpload,
    uploadProgress: 0,
    processedCount: 0,
    totalCount: 0,
    handleClearData: mockHandleClearData,
    fileMetadata: null,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseInstagramData.mockReturnValue(createMockReturnValue());
  });

  it('should render file upload component', () => {
    render(<FileUploadSection onHelpClick={mockOnHelpClick} />);

    // FileUpload renders different text than UploadZone
    expect(screen.getByText('Drop your Instagram data here')).toBeInTheDocument();
    expect(screen.getByText('or click to browse for your ZIP file')).toBeInTheDocument();
  });

  it('should pass loading state to FileUpload', () => {
    mockUseInstagramData.mockReturnValue(
      createMockReturnValue({
        uploadState: { status: 'loading' as const, error: null, fileName: 'test.zip' },
        uploadProgress: 50,
      })
    );

    render(<FileUploadSection onHelpClick={mockOnHelpClick} />);

    // FileUpload renders "Processing your data..." when loading
    expect(screen.getByText('Processing your data...')).toBeInTheDocument();
  });

  it('should pass error state to FileUpload', () => {
    mockUseInstagramData.mockReturnValue(
      createMockReturnValue({
        uploadState: { status: 'error' as const, error: 'Upload failed', fileName: null },
      })
    );

    render(<FileUploadSection onHelpClick={mockOnHelpClick} />);

    expect(screen.getByText('Upload failed')).toBeInTheDocument();
  });

  it('should handle file upload', async () => {
    render(<FileUploadSection onHelpClick={mockOnHelpClick} />);

    const file = new File(['test'], 'test.zip', { type: 'application/zip' });
    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput!, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockHandleZipUpload).toHaveBeenCalledWith(file);
    });
  });

  it('should handle upload errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockHandleZipUpload.mockRejectedValue(new Error('Upload failed'));

    render(<FileUploadSection onHelpClick={mockOnHelpClick} />);

    const file = new File(['test'], 'test.zip', { type: 'application/zip' });
    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput!, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockHandleZipUpload).toHaveBeenCalledWith(file);
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should pass processing progress to FileUpload', () => {
    mockUseInstagramData.mockReturnValue(
      createMockReturnValue({
        uploadState: { status: 'loading' as const, error: null, fileName: 'test.zip' },
        uploadProgress: 75,
      })
    );

    render(<FileUploadSection onHelpClick={mockOnHelpClick} />);

    // Check that the processing state is shown
    // FileUpload renders "Processing your data..." when loading
    expect(screen.getByText('Processing your data...')).toBeInTheDocument();
    // Component should be rendered in loading state
    expect(screen.queryByText('Drop your Instagram data here')).not.toBeInTheDocument();
  });

  it('should pass onHelpClick to FileUpload', () => {
    render(<FileUploadSection onHelpClick={mockOnHelpClick} />);

    const helpButton = screen.getByText('View detailed guide');
    fireEvent.click(helpButton);

    expect(mockOnHelpClick).toHaveBeenCalled();
  });
});
