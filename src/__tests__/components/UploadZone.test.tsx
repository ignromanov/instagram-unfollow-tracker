import { UploadZone } from '@/components/UploadZone';
import { fireEvent, render, screen } from '@tests/utils/testUtils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  analytics: {
    uploadDragEnter: vi.fn(),
    uploadDragLeave: vi.fn(),
    uploadDrop: vi.fn(),
    uploadClick: vi.fn(),
    diagnosticErrorView: vi.fn(),
  },
}));

import { analytics } from '@/lib/analytics';

describe('UploadZone', () => {
  const mockOnUploadStart = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnOpenWizard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should display upload title and description', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} />);

    // Title from translations: zone.title
    expect(screen.getByText('Upload Your Data')).toBeInTheDocument();
    // Description from translations: zone.description
    expect(
      screen.getByText(
        'Your data remains 100% private. We analyze everything locally in your browser.'
      )
    ).toBeInTheDocument();
  });

  it('should have drag and drop area with file input', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} />);

    // File input should exist and accept .zip files
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', '.zip');
  });

  it('should display drop here prompt', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} />);

    // zone.dropHere translation
    expect(screen.getByText('Drop your Instagram ZIP')).toBeInTheDocument();
    // zone.orBrowse translation
    expect(screen.getByText('Or tap to browse your local storage.')).toBeInTheDocument();
  });

  it('should display JSON format warning badge', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} />);

    // zone.jsonOnly translation
    expect(screen.getByText('JSON Format Only')).toBeInTheDocument();
  });

  it('should display pre-upload checklist', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} />);

    // checklist.title translation
    expect(screen.getByText('Pre-upload Checklist')).toBeInTheDocument();
    // Checklist items from translations
    expect(screen.getByText('Format: JSON (not HTML)')).toBeInTheDocument();
    expect(screen.getByText("Includes: 'Followers and following'")).toBeInTheDocument();
  });

  it('should display common error hint section', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} onOpenWizard={mockOnOpenWizard} />);

    // errors.commonTitle translation
    expect(screen.getByText('Most Common Error')).toBeInTheDocument();
  });

  it('should render back button when onBack is provided', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} onBack={mockOnBack} />);

    // zone.back translation
    const backButton = screen.getByText('Back');
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should not render back button when onBack is not provided', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} />);

    expect(screen.queryByText('Back')).not.toBeInTheDocument();
  });

  it('should show processing state when isProcessing is true', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} isProcessing={true} />);

    // zone.processing translation
    expect(screen.getByText('Analyzing locally...')).toBeInTheDocument();
    // zone.processingHint translation
    expect(
      screen.getByText('Processing large datasets (up to 1M+) can take a moment.')
    ).toBeInTheDocument();
  });

  it('should disable file input when processing', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} isProcessing={true} />);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeDisabled();
  });

  it('should call onUploadStart and track analytics when file is selected via input', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} />);

    const file = new File(['test'], 'test.zip', { type: 'application/zip' });
    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput!, { target: { files: [file] } });

    expect(mockOnUploadStart).toHaveBeenCalledWith(file);
    expect(analytics.uploadClick).toHaveBeenCalled();
  });

  it('should call onUploadStart and track analytics when zip file is dropped', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} />);

    const file = new File(['test'], 'data.zip', { type: 'application/zip' });
    const dropZone = document.querySelector('[class*="border-dashed"]');

    fireEvent.drop(dropZone!, {
      dataTransfer: { files: [file] },
    });

    expect(mockOnUploadStart).toHaveBeenCalledWith(file);
    expect(analytics.uploadDrop).toHaveBeenCalled();
  });

  it('should not call onUploadStart when non-zip file is dropped', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} />);

    const file = new File(['test'], 'data.txt', { type: 'text/plain' });
    const dropZone = document.querySelector('[class*="border-dashed"]');

    fireEvent.drop(dropZone!, {
      dataTransfer: { files: [file] },
    });

    expect(mockOnUploadStart).not.toHaveBeenCalled();
  });

  it('should render learn fix button when onOpenWizard is provided', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} onOpenWizard={mockOnOpenWizard} />);

    // errors.learnFix translation
    const learnButton = screen.getByText('Learn how to fix');
    expect(learnButton).toBeInTheDocument();

    fireEvent.click(learnButton);
    expect(mockOnOpenWizard).toHaveBeenCalledTimes(1);
  });

  it('should have accessible file input with aria-label', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} />);

    const fileInput = document.querySelector('input[type="file"]');
    // zone.ariaLabel translation
    expect(fileInput).toHaveAttribute('aria-label', 'Upload Instagram data ZIP file');
  });

  it('should track drag enter analytics on dragOver', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} />);

    const dropZone = document.querySelector('[class*="border-dashed"]');
    fireEvent.dragOver(dropZone!);

    expect(analytics.uploadDragEnter).toHaveBeenCalled();
  });

  it('should track drag leave analytics on dragLeave', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} />);

    const dropZone = document.querySelector('[class*="border-dashed"]');
    fireEvent.dragLeave(dropZone!);

    expect(analytics.uploadDragLeave).toHaveBeenCalled();
  });

  it('should show screen reader announcement when processing', () => {
    render(<UploadZone onUploadStart={mockOnUploadStart} isProcessing={true} />);

    const srAnnouncement = screen.getByRole('status');
    expect(srAnnouncement).toBeInTheDocument();
    expect(srAnnouncement).toHaveClass('sr-only');
  });

  it('should show diagnostic screen when there are critical errors', () => {
    const parseWarnings = [
      { severity: 'error' as const, code: 'TEST_ERROR', message: 'Test error' },
    ];

    render(
      <UploadZone
        onUploadStart={mockOnUploadStart}
        parseWarnings={parseWarnings}
        onOpenWizard={mockOnOpenWizard}
        onBack={mockOnBack}
      />
    );

    // When there is a critical error, the diagnostic screen is shown
    // The main upload title should not be visible
    expect(screen.queryByText('Upload Your Data')).not.toBeInTheDocument();
    // Analytics should track the diagnostic error view
    expect(analytics.diagnosticErrorView).toHaveBeenCalled();
  });
});
